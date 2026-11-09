/**
 * Story Mode Zustand Store (v4.0)
 * Tracks player progress across the 10x10 Sector Grid, progressive unlocks
 * (Starting with only Jefe, Armory at 1/16, Lab at 3/32, Fairy Well at 1/8),
 * interactive dialogue, and dynamic team under-strength scaling.
 */

import { create } from 'zustand';
import { StoryDialogueEpisode, FairyWellUpgrade, StoryMission } from '@/types/story';
import { STORY_MISSIONS, getMissionForSector, STORY_MAIN_QUEST_STEPS, getCurrentStoryObjectiveStep } from '@/data/storyMissions';
import { STORY_DIALOGUE_EPISODES } from '@/data/storyDialogue';
import { sound } from '@/utils/audio';
import { consumeCardOfStar, normalizeStuffyCards } from '@/utils/rosterStars';
import { useCampaignStore } from './campaignStore';
import { createStuffyPack } from '@/data/stuffies';

export const STORY_VERSION_KEY = 'benstuffy_story_version';
export const STORY_PROGRESS_VERSION = 'v6_part5_528sectors_secondcoming';
export const STORY_SAVE_KEY = 'benstuffy_story_mode_v2';
export const LEGACY_STORY_SAVE_KEYS = ['benstuffy_story_mode_v1'];

export function purgeAllStoryProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORY_SAVE_KEY);
    for (const oldKey of LEGACY_STORY_SAVE_KEYS) {
      localStorage.removeItem(oldKey);
    }
    // Clear items and equipment
    localStorage.removeItem('ben_stuffy_item_inventory');
    localStorage.removeItem('ben_stuffy_equipped_items');
    localStorage.removeItem('ben_stuffy_saved_campaign_run');
    localStorage.setItem(STORY_VERSION_KEY, STORY_PROGRESS_VERSION);
  } catch (e) {
    console.error('Failed to purge story progress and items:', e);
  }
}

export interface EnemyScalingFactors {
  hpMultiplier: number;
  damageMultiplier: number;
  shieldMultiplier: number;
  description: string;
}

export interface StoryStore {
  // Progression
  unlockedStuffies: string[]; // starts with ['jefe']
  unlockedSectorIds: number[]; // starts with [2, 3] (The House & The Backyard)
  clearedSectorIds: number[];
  clearedBossCount: number; // tracks total bosses defeated in story mode
  defeatedMainGameBossIds: string[]; // tracks main game boss species defeated in story mode
  storyStepIndex: number;
  currentPart: number; // 1 to 5 (528 sectors per part)
  unlockedParts: number[]; // starts with [1], can navigate back at any time
  activeSectorId: number | null;
  activeMissionId: string | null;
  currentFloor: number;
  currentAct: number;

  // Facilities & Milestones
  armoryUnlocked: boolean; // 1/16 milestone
  labUnlocked: boolean; // 3/32 milestone
  fairyWellUnlocked: boolean; // 1/8 milestone
  fairyWellUpgrades: FairyWellUpgrade[];

  // Interactive Dialogue State
  activeDialogue: StoryDialogueEpisode | null;
  currentDialogueLineIndex: number;

  // Vision
  mapVision: boolean;

  // Actions
  setCurrentPart: (part: number) => void;
  unlockPart: (part: number) => void;
  unlockUpToPart: (part: number) => void;
  unlockStuffy: (speciesId: string) => void;
  unlockSector: (sectorId: number) => void;
  clearSector: (sectorId: number) => void;
  selectSector: (sectorId: number) => void;
  advanceStoryStep: () => void;
  startMission: (missionId: string) => boolean;
  advanceMissionFloor: () => { isMissionComplete: boolean; isActBoss: boolean };
  finishActiveMission: (victory: boolean) => void;
  advanceNextMission: () => {
    success: boolean;
    message: string;
    missionTitle?: string;
    sectorId?: number;
    unlockedStuffy?: string;
  };
  setMapVision: (enabled: boolean) => void;
  toggleMapVision: () => boolean;
  startDialogue: (episodeId: string) => void;
  nextDialogueLine: () => boolean; // returns true if dialogue ended
  skipDialogue: () => void;
  chooseDialogueOption: (choiceIndex: number) => void;
  sacrificeCardInFairyWell: (
    esperId: string,
    speciesId: string,
    starTier: number
  ) => { success: boolean; message: string };

  // Dynamic Under-Strength Calculation
  getUnderStrengthScaling: () => EnemyScalingFactors;
  resetStoryMode: () => void;
}

export function computeUnderStrengthScaling(teamSize: number): EnemyScalingFactors {
  if (teamSize <= 1) {
    return {
      hpMultiplier: 0.40, // -60% enemy HP
      damageMultiplier: 0.30, // -70% enemy Attack Damage
      shieldMultiplier: 0.30, // -70% enemy Shield
      description: 'Solo Plush Balance: Enemies have -60% HP, -70% Attack & -70% Shield!',
    };
  }
  if (teamSize === 2) {
    return {
      hpMultiplier: 0.55, // -45% enemy HP
      damageMultiplier: 0.45, // -55% enemy Attack Damage
      shieldMultiplier: 0.45, // -55% enemy Shield
      description: 'Duo Squad Balance: Enemies have -45% HP, -55% Attack & -55% Shield!',
    };
  }
  if (teamSize === 3) {
    return {
      hpMultiplier: 0.70, // -30% enemy HP
      damageMultiplier: 0.60, // -40% enemy Attack Damage
      shieldMultiplier: 0.60, // -40% enemy Shield
      description: 'Trio Squad Balance: Enemies have -30% HP, -40% Attack & -40% Shield!',
    };
  }
  if (teamSize === 4) {
    return {
      hpMultiplier: 0.85, // -15% enemy HP
      damageMultiplier: 0.75, // -25% enemy Attack Damage
      shieldMultiplier: 0.75, // -25% enemy Shield
      description: 'Quad Squad Balance: Enemies have -15% HP, -25% Attack & -25% Shield!',
    };
  }
  return {
    hpMultiplier: 1.0,
    damageMultiplier: 1.0,
    shieldMultiplier: 1.0,
    description: 'Full 5-Plush Squad: Enemies fight at 100% full strength!',
  };
}

function loadSavedStoryState(): Partial<StoryStore> {
  if (typeof window === 'undefined') return {};
  try {
    const savedVersion = localStorage.getItem(STORY_VERSION_KEY);
    if (savedVersion !== STORY_PROGRESS_VERSION) {
      // Force universal progress reset for all players
      purgeAllStoryProgress();
      return {};
    }

    const raw = localStorage.getItem(STORY_SAVE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load story mode state:', e);
  }
  return {};
}

function saveStoryState(state: Partial<StoryStore>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      unlockedStuffies: state.unlockedStuffies,
      unlockedSectorIds: state.unlockedSectorIds,
      clearedSectorIds: state.clearedSectorIds,
      clearedBossCount: state.clearedBossCount,
      defeatedMainGameBossIds: state.defeatedMainGameBossIds,
      storyStepIndex: state.storyStepIndex,
      currentPart: state.currentPart,
      unlockedParts: state.unlockedParts,
      armoryUnlocked: state.armoryUnlocked,
      labUnlocked: state.labUnlocked,
      fairyWellUnlocked: state.fairyWellUnlocked,
      fairyWellUpgrades: state.fairyWellUpgrades,
      mapVision: state.mapVision,
    };
    localStorage.setItem(STORY_SAVE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save story mode state:', e);
  }
}

export const useStoryStore = create<StoryStore>((set, get) => {
  const saved = loadSavedStoryState();
  const cleared = saved.clearedSectorIds || [];
  const stepIdx = saved.storyStepIndex ?? 0;
  const unlockedStuffs = saved.unlockedStuffies || ['jefe'];
  const isArmoryUnlocked = Boolean(saved.armoryUnlocked) || stepIdx >= 7 || cleared.includes(18) || cleared.includes(180) || unlockedStuffs.includes('finlee');
  const isLabUnlocked = Boolean(saved.labUnlocked) || stepIdx >= 12 || cleared.includes(30) || cleared.includes(360);
  const isFairyWellUnlocked = Boolean(saved.fairyWellUnlocked) || stepIdx >= 19 || cleared.includes(13) || cleared.includes(600);
  const isMapVision = Boolean(saved.mapVision);
  const curPart = saved.currentPart || 1;
  const unlParts = saved.unlockedParts || [1];
  const bossCount = typeof saved.clearedBossCount === 'number' ? saved.clearedBossCount : 0;
  const defBossIds = Array.isArray(saved.defeatedMainGameBossIds) ? saved.defeatedMainGameBossIds : [];

  return {
    unlockedStuffies: unlockedStuffs,
    unlockedSectorIds: saved.unlockedSectorIds || [2, 3], // Sector 2: The House, Sector 3: The Backyard
    clearedSectorIds: cleared,
    clearedBossCount: bossCount,
    defeatedMainGameBossIds: defBossIds,
    storyStepIndex: stepIdx,
    currentPart: curPart,
    unlockedParts: unlParts,
    activeSectorId: 2,
    activeMissionId: null,
    currentFloor: 1,
    currentAct: 1,

    armoryUnlocked: isArmoryUnlocked,
    labUnlocked: isLabUnlocked,
    fairyWellUnlocked: isFairyWellUnlocked,
    fairyWellUpgrades: saved.fairyWellUpgrades || [],

    activeDialogue: null,
    currentDialogueLineIndex: 0,
    mapVision: isMapVision,

    setCurrentPart: (part: number) => {
      const clamped = Math.max(1, Math.min(5, part));
      const { unlockedParts, mapVision } = get();
      if (mapVision || unlockedParts.includes(clamped)) {
        set({ currentPart: clamped });
        saveStoryState({ ...get(), currentPart: clamped });
      }
    },

    unlockPart: (part: number) => {
      const { unlockedParts } = get();
      const clamped = Math.max(1, Math.min(5, part));
      if (!unlockedParts.includes(clamped)) {
        const updated = [...unlockedParts, clamped].sort((a, b) => a - b);
        set({ unlockedParts: updated });
        saveStoryState({ ...get(), unlockedParts: updated });
      }
    },

    unlockUpToPart: (part: number) => {
      const clamped = Math.max(1, Math.min(5, Math.round(part)));
      const partsToUnlock = Array.from({ length: clamped }, (_, i) => i + 1);
      const { unlockedParts } = get();
      const updated = Array.from(new Set([...unlockedParts, ...partsToUnlock])).sort((a, b) => a - b);
      set({ unlockedParts: updated, currentPart: clamped });
      saveStoryState({ ...get(), unlockedParts: updated, currentPart: clamped });
    },

    advanceStoryStep: () => {
      const nextStep = get().storyStepIndex + 1;
      set({ storyStepIndex: nextStep });
      saveStoryState({ ...get(), storyStepIndex: nextStep });
    },

    unlockStuffy: (speciesId: string) => {
      const { unlockedStuffies } = get();
      if (!unlockedStuffies.includes(speciesId)) {
        const updated = [...unlockedStuffies, speciesId];
        set({ unlockedStuffies: updated });
        saveStoryState({ ...get(), unlockedStuffies: updated });
      }
    },

    unlockSector: (sectorId: number) => {
      const { unlockedSectorIds } = get();
      if (!unlockedSectorIds.includes(sectorId)) {
        const updated = [...unlockedSectorIds, sectorId];
        set({ unlockedSectorIds: updated });
        saveStoryState({ ...get(), unlockedSectorIds: updated });
      }
    },

    clearSector: (sectorId: number) => {
      const { clearedSectorIds } = get();
      if (!clearedSectorIds.includes(sectorId)) {
        const updated = [...clearedSectorIds, sectorId];
        set({ clearedSectorIds: updated });
        saveStoryState({ ...get(), clearedSectorIds: updated });
      }
    },

    selectSector: (sectorId: number) => {
      set({ activeSectorId: sectorId });
    },

    startMission: (missionId: string) => {
      const mission = STORY_MISSIONS[missionId];
      if (!mission) return false;

      set({
        activeMissionId: missionId,
        currentFloor: 1,
        currentAct: 1,
      });

      if (mission.introDialogueId) {
        get().startDialogue(mission.introDialogueId);
      }

      return true;
    },

    advanceMissionFloor: () => {
      const { activeMissionId, currentFloor, currentAct } = get();
      const mission = activeMissionId ? STORY_MISSIONS[activeMissionId] : null;
      if (!mission) return { isMissionComplete: true, isActBoss: false };

      const nextFloor = currentFloor + 1;
      if (nextFloor > mission.totalFloors) {
        return { isMissionComplete: true, isActBoss: false };
      }

      const floorsPerAct = Math.ceil(mission.totalFloors / mission.totalActs);
      const nextAct = Math.min(mission.totalActs, Math.floor((nextFloor - 1) / floorsPerAct) + 1);
      const isActBoss = nextFloor % floorsPerAct === 0 || nextFloor === mission.totalFloors;

      set({
        currentFloor: nextFloor,
        currentAct: nextAct,
      });

      return { isMissionComplete: false, isActBoss };
    },

    finishActiveMission: (victory: boolean) => {
      const { activeMissionId, activeSectorId, storyStepIndex } = get();
      const mission = activeMissionId ? STORY_MISSIONS[activeMissionId] : null;

      if (victory && mission) {
        sound.playRewardSound();
        if (activeSectorId) {
          get().clearSector(activeSectorId);
        }

        const activeStep = getCurrentStoryObjectiveStep(storyStepIndex);
        if (activeStep && activeStep.missionId === mission.id) {
          get().advanceStoryStep();
        }

        if (mission.unlockStuffySpeciesId) {
          get().unlockStuffy(mission.unlockStuffySpeciesId);
        }

        const milestoneToUnlock = mission.milestone || activeStep?.milestone;
        if (milestoneToUnlock === 'armory') set({ armoryUnlocked: true });
        if (milestoneToUnlock === 'lab') set({ labUnlocked: true });
        if (milestoneToUnlock === 'fairy_well') set({ fairyWellUnlocked: true });

        // Part unlocks upon beating climax sectors
        if (activeSectorId === 528) {
          get().unlockPart(2);
          set({ currentPart: 2 });
        } else if (activeSectorId === 1056) {
          get().unlockPart(3);
          set({ currentPart: 3 });
        } else if (activeSectorId === 1584) {
          get().unlockPart(4);
          set({ currentPart: 4 });
        } else if (activeSectorId === 2112) {
          get().unlockPart(5);
          set({ currentPart: 5 });
        }

        // Track boss mission completion and main game boss defeat
        const isBossMission = mission.floors.some((f) => f.type === 'boss') || (activeSectorId ? activeSectorId % 33 === 0 : false);
        if (isBossMission) {
          const nextBossCount = (get().clearedBossCount || 0) + 1;
          const missionBossId = mission.floors[mission.floors.length - 1]?.bossSpeciesId || 'amalgam';
          const updatedBosses = [...(get().defeatedMainGameBossIds || []), missionBossId];
          set({
            clearedBossCount: nextBossCount,
            defeatedMainGameBossIds: updatedBosses,
          });
        }

        if (activeStep?.cutsceneEpisodeId) {
          get().startDialogue(activeStep.cutsceneEpisodeId);
        } else if (mission.outroDialogueId) {
          get().startDialogue(mission.outroDialogueId);
        }

        saveStoryState(get());
      }

      set({
        activeMissionId: null,
        currentFloor: 1,
        currentAct: 1,
      });
    },

    advanceNextMission: () => {
      const state = get();
      let targetMissionId = state.activeMissionId;
      let targetSectorId = state.activeSectorId;
      const isFromActiveMission = Boolean(targetMissionId);

      const currentStep = getCurrentStoryObjectiveStep(state.storyStepIndex);

      if (!targetMissionId) {
        if (state.storyStepIndex >= STORY_MAIN_QUEST_STEPS.length) {
          return {
            success: false,
            message: '🏆 All Story Mode missions and sectors have already been conquered!',
          };
        }
        targetMissionId = currentStep.missionId;
        targetSectorId = currentStep.sectorId;
      }

      const mission = targetMissionId ? STORY_MISSIONS[targetMissionId] : null;
      const sectorId = targetSectorId || currentStep.sectorId;
      const missionTitle = mission?.title || currentStep.title || `Mission at Sector ${sectorId}`;

      // 1. Clear the sector
      get().clearSector(sectorId);

      // 2. Advance the story step if completing main quest step
      if (state.storyStepIndex < STORY_MAIN_QUEST_STEPS.length) {
        if (!isFromActiveMission || currentStep.missionId === targetMissionId) {
          get().advanceStoryStep();
        }
      }

      // 3. Unlock stuffy if this mission or step awards one
      const stuffyToUnlock = mission?.unlockStuffySpeciesId || currentStep.unlockStuffySpeciesId;
      if (stuffyToUnlock) {
        get().unlockStuffy(stuffyToUnlock);
      }

      // 4. Milestone unlocks
      const milestone = mission?.milestone || currentStep.milestone;
      if (milestone === 'armory' || sectorId === 18 || sectorId === 180) set({ armoryUnlocked: true });
      if (milestone === 'lab' || sectorId === 30 || sectorId === 360) set({ labUnlocked: true });
      if (milestone === 'fairy_well' || sectorId === 38 || sectorId === 600) set({ fairyWellUnlocked: true });

      // Part transitions upon clearing climax sectors
      if (sectorId === 528) {
        get().unlockPart(2);
        set({ currentPart: 2 });
      } else if (sectorId === 1056) {
        get().unlockPart(3);
        set({ currentPart: 3 });
      } else if (sectorId === 1584) {
        get().unlockPart(4);
        set({ currentPart: 4 });
      } else if (sectorId === 2112) {
        get().unlockPart(5);
        set({ currentPart: 5 });
      }

      // 5. Outro dialogue rewards
      if (mission?.outroDialogueId) {
        const ep = STORY_DIALOGUE_EPISODES[mission.outroDialogueId];
        if (ep) {
          if (ep.onCompleteUnlockStuffyId) get().unlockStuffy(ep.onCompleteUnlockStuffyId);
          if (ep.onCompleteUnlockSectorIds) ep.onCompleteUnlockSectorIds.forEach((s) => get().unlockSector(s));
          if (ep.onCompleteUnlockMilestone === 'armory') set({ armoryUnlocked: true });
          if (ep.onCompleteUnlockMilestone === 'lab') set({ labUnlocked: true });
          if (ep.onCompleteUnlockMilestone === 'fairy_well') set({ fairyWellUnlocked: true });
          if (ep.onCompleteUnlockPart) {
            get().unlockPart(ep.onCompleteUnlockPart);
            set({ currentPart: ep.onCompleteUnlockPart });
          }
        }
      }

      // 6. Unlock next objective sector
      const nextStepIdx = get().storyStepIndex;
      if (nextStepIdx < STORY_MAIN_QUEST_STEPS.length) {
        const nextStep = getCurrentStoryObjectiveStep(nextStepIdx);
        get().unlockSector(nextStep.sectorId);
      }

      // 7. Clean up active mission / dialogue
      set({
        activeMissionId: null,
        currentFloor: 1,
        currentAct: 1,
        activeDialogue: null,
      });

      // 8. Story mission victory in campaign store if active
      if (typeof window !== 'undefined') {
        try {
          const campaign = useCampaignStore.getState();
          if (campaign.isStoryMission) {
            campaign.isStoryMission = false;
            const packRarity = mission?.rewardPacksRarity || 'rare';
            for (let i = 0; i < 3; i++) {
              campaign.addPack(createStuffyPack(packRarity));
            }
          }
        } catch {}
      }

      sound.playRewardSound();
      saveStoryState(get());

      let msg = `⏩ [ADMIN] Advanced past mission "${missionTitle}" (Sector ${sectorId}) as if completed!`;
      if (stuffyToUnlock) {
        msg += `\n🧸 Hero Rescued & Unlocked: ${stuffyToUnlock.toUpperCase()}!`;
      }
      if (milestone) {
        msg += `\n🏛️ Facility Unlocked: ${milestone.toUpperCase()}!`;
      }
      if (nextStepIdx < STORY_MAIN_QUEST_STEPS.length) {
        const nextStep = getCurrentStoryObjectiveStep(nextStepIdx);
        msg += `\n🎯 Next Objective: Sector ${nextStep.sectorId} - "${nextStep.title}".`;
      } else {
        msg += `\n🏆 Congratulations! The entire story campaign is complete!`;
      }

      return {
        success: true,
        message: msg,
        missionTitle,
        sectorId,
        unlockedStuffy: stuffyToUnlock,
      };
    },

    setMapVision: (enabled: boolean) => {
      const parts = enabled ? [1, 2, 3, 4, 5] : get().unlockedParts;
      set({ mapVision: enabled, unlockedParts: parts });
      saveStoryState({ ...get(), mapVision: enabled, unlockedParts: parts });
    },

    toggleMapVision: () => {
      const next = !get().mapVision;
      const parts = next ? [1, 2, 3, 4, 5] : get().unlockedParts;
      set({ mapVision: next, unlockedParts: parts });
      saveStoryState({ ...get(), mapVision: next, unlockedParts: parts });
      return next;
    },

    startDialogue: (episodeId: string) => {
      const episode = STORY_DIALOGUE_EPISODES[episodeId];
      if (episode) {
        sound.playClickSound();
        set({
          activeDialogue: episode,
          currentDialogueLineIndex: 0,
        });
      }
    },

    nextDialogueLine: () => {
      const { activeDialogue, currentDialogueLineIndex } = get();
      if (!activeDialogue) return true;

      const nextIndex = currentDialogueLineIndex + 1;
      if (nextIndex < activeDialogue.lines.length) {
        sound.playClickSound();
        set({ currentDialogueLineIndex: nextIndex });
        return false;
      }

      // Dialogue completed: trigger rewards and milestone unlocks
      if (activeDialogue.onCompleteUnlockStuffyId) {
        get().unlockStuffy(activeDialogue.onCompleteUnlockStuffyId);
      }

      if (activeDialogue.onCompleteUnlockSectorIds) {
        activeDialogue.onCompleteUnlockSectorIds.forEach((sId) => get().unlockSector(sId));
      }

      if (activeDialogue.onCompleteUnlockMilestone) {
        const milestone = activeDialogue.onCompleteUnlockMilestone;
        if (milestone === 'armory') set({ armoryUnlocked: true });
        if (milestone === 'lab') set({ labUnlocked: true });
        if (milestone === 'fairy_well') set({ fairyWellUnlocked: true });
        saveStoryState(get());
      }

      if (activeDialogue.onCompleteUnlockPart) {
        get().unlockPart(activeDialogue.onCompleteUnlockPart);
        set({ currentPart: activeDialogue.onCompleteUnlockPart });
      }

      set({
        activeDialogue: null,
        currentDialogueLineIndex: 0,
      });

      return true;
    },

    skipDialogue: () => {
      const { activeDialogue } = get();
      if (!activeDialogue) return;

      if (activeDialogue.onCompleteUnlockStuffyId) {
        get().unlockStuffy(activeDialogue.onCompleteUnlockStuffyId);
      }
      if (activeDialogue.onCompleteUnlockSectorIds) {
        activeDialogue.onCompleteUnlockSectorIds.forEach((sId) => get().unlockSector(sId));
      }
      if (activeDialogue.onCompleteUnlockMilestone) {
        const milestone = activeDialogue.onCompleteUnlockMilestone;
        if (milestone === 'armory') set({ armoryUnlocked: true });
        if (milestone === 'lab') set({ labUnlocked: true });
        if (milestone === 'fairy_well') set({ fairyWellUnlocked: true });
      }
      if (activeDialogue.onCompleteUnlockPart) {
        get().unlockPart(activeDialogue.onCompleteUnlockPart);
        set({ currentPart: activeDialogue.onCompleteUnlockPart });
      }

      set({
        activeDialogue: null,
        currentDialogueLineIndex: 0,
      });
      saveStoryState(get());
    },

    chooseDialogueOption: (choiceIndex: number) => {
      const { activeDialogue, currentDialogueLineIndex } = get();
      if (!activeDialogue) return;

      const currentLine = activeDialogue.lines[currentDialogueLineIndex];
      const choice = currentLine?.choices?.[choiceIndex];
      if (!choice) return;

      sound.playClickSound();

      if (choice.bonusCrackers) {
        useCampaignStore.getState().addGold?.(choice.bonusCrackers);
      }
      if (choice.rewardPacksCount) {
        for (let i = 0; i < choice.rewardPacksCount; i++) {
          const pack = createStuffyPack('rare', 1);
          useCampaignStore.getState().addPack?.(pack);
        }
      }
      if (choice.combatBuff) {
        const campaign = useCampaignStore.getState();
        if (campaign.activeParty && campaign.activeParty.length > 0) {
          const updated = campaign.activeParty.map((s) => {
            if (choice.combatBuff === 'shield') return { ...s, shield: (s.shield || 0) + 20 };
            if (choice.combatBuff === 'speed') return { ...s, speed: (s.speed ?? 100) + 10 };
            return s;
          });
          useCampaignStore.setState({ activeParty: updated });
        }
      }

      if (choice.nextDialogueId) {
        get().startDialogue(choice.nextDialogueId);
      } else {
        get().nextDialogueLine();
      }
    },

    sacrificeCardInFairyWell: (
      esperId: string,
      speciesId: string,
      starTier: number
    ) => {
      const campaignState = useCampaignStore.getState();
      const normalized = normalizeStuffyCards(campaignState.stuffyCards);
      const available = normalized[speciesId]?.[starTier] || 0;

      if (available < 1) {
        return {
          success: false,
          message: `❌ No ${starTier}★ ${speciesId.toUpperCase()} cards available in your binder to sacrifice!`,
        };
      }

      // Consume 1 card of that star tier
      const res = consumeCardOfStar(normalized, speciesId, starTier);
      if (!res.success) {
        return { success: false, message: 'Failed to sacrifice card.' };
      }
      useCampaignStore.setState({ stuffyCards: res.newCards });

      // Star tier scales the permanent Esper boost!
      const bonusSpeed = starTier * 3; // e.g. 1★ = +3 spd, 5★ = +15 spd
      const bonusHp = starTier * 10; // e.g. 1★ = +10 hp, 5★ = +50 hp
      const bonusProcChance = starTier * 2; // e.g. 1★ = +2%, 5★ = +10%

      const upgrade: FairyWellUpgrade = {
        esperId,
        sacrificedSpeciesId: speciesId,
        sacrificedCardsCount: 1,
        bonusSpeed,
        bonusHp,
        bonusProcChance,
      };

      const updatedUpgrades = [...get().fairyWellUpgrades, upgrade];
      set({ fairyWellUpgrades: updatedUpgrades });
      saveStoryState({ ...get(), fairyWellUpgrades: updatedUpgrades });
      sound.playRewardSound();

      return {
        success: true,
        message: `✨ THE FAIRY WELL ACCEPTS YOUR ${starTier}★ CARD! Imbued Esper with +${bonusSpeed} Speed, +${bonusHp} HP, and +${bonusProcChance}% Proc Chance!`,
      };
    },

    getUnderStrengthScaling: () => {
      const { unlockedStuffies } = get();
      const teamSize = Math.min(5, unlockedStuffies.length);
      return computeUnderStrengthScaling(teamSize);
    },

    resetStoryMode: () => {
      purgeAllStoryProgress();
      set({
        unlockedStuffies: ['jefe'],
        unlockedSectorIds: [2, 3],
        clearedSectorIds: [],
        clearedBossCount: 0,
        defeatedMainGameBossIds: [],
        storyStepIndex: 0,
        activeSectorId: 2,
        activeMissionId: null,
        currentFloor: 1,
        currentAct: 1,
        armoryUnlocked: false,
        labUnlocked: false,
        fairyWellUnlocked: false,
        fairyWellUpgrades: [],
        activeDialogue: null,
        currentDialogueLineIndex: 0,
        mapVision: false,
      });
    },
  };
});
