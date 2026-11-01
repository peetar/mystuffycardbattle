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

export const STORY_VERSION_KEY = 'benstuffy_story_version';
export const STORY_PROGRESS_VERSION = 'v4_reset_2026_11_01';
export const STORY_SAVE_KEY = 'benstuffy_story_mode_v2';
export const LEGACY_STORY_SAVE_KEYS = ['benstuffy_story_mode_v1'];

export function purgeAllStoryProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORY_SAVE_KEY);
    for (const oldKey of LEGACY_STORY_SAVE_KEYS) {
      localStorage.removeItem(oldKey);
    }
    localStorage.setItem(STORY_VERSION_KEY, STORY_PROGRESS_VERSION);
    const campRaw = localStorage.getItem('ben_stuffy_saved_campaign_run');
    if (campRaw) {
      const campParsed = JSON.parse(campRaw);
      if (campParsed?.isStoryMission) {
        localStorage.removeItem('ben_stuffy_saved_campaign_run');
      }
    }
  } catch (e) {
    console.error('Failed to purge story progress:', e);
  }
}

export interface EnemyScalingFactors {
  hpMultiplier: number;
  damageMultiplier: number;
  description: string;
}

export interface StoryStore {
  // Progression
  unlockedStuffies: string[]; // starts with ['jefe']
  unlockedSectorIds: number[]; // starts with [2, 3] (The House & The Backyard)
  clearedSectorIds: number[];
  storyStepIndex: number; // 0 to 62 (curving story path across 150 sectors with revisits)
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

  // Actions
  unlockStuffy: (speciesId: string) => void;
  unlockSector: (sectorId: number) => void;
  clearSector: (sectorId: number) => void;
  selectSector: (sectorId: number) => void;
  advanceStoryStep: () => void;
  startMission: (missionId: string) => boolean;
  advanceMissionFloor: () => { isMissionComplete: boolean; isActBoss: boolean };
  finishActiveMission: (victory: boolean) => void;
  startDialogue: (episodeId: string) => void;
  nextDialogueLine: () => boolean; // returns true if dialogue ended
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
      damageMultiplier: 0.50, // -50% enemy Damage
      description: 'Solo Plush Balance: Enemies have -60% HP and -50% Damage!',
    };
  }
  if (teamSize === 2) {
    return {
      hpMultiplier: 0.55, // -45% enemy HP
      damageMultiplier: 0.65, // -35% enemy Damage
      description: 'Duo Squad Balance: Enemies have -45% HP and -35% Damage!',
    };
  }
  if (teamSize === 3) {
    return {
      hpMultiplier: 0.70, // -30% enemy HP
      damageMultiplier: 0.80, // -20% enemy Damage
      description: 'Trio Squad Balance: Enemies have -30% HP and -20% Damage!',
    };
  }
  if (teamSize === 4) {
    return {
      hpMultiplier: 0.85, // -15% enemy HP
      damageMultiplier: 0.90, // -10% enemy Damage
      description: 'Squad Balance: Enemies have -15% HP and -10% Damage!',
    };
  }
  return {
    hpMultiplier: 1.0,
    damageMultiplier: 1.0,
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
      storyStepIndex: state.storyStepIndex,
      armoryUnlocked: state.armoryUnlocked,
      labUnlocked: state.labUnlocked,
      fairyWellUnlocked: state.fairyWellUnlocked,
      fairyWellUpgrades: state.fairyWellUpgrades,
    };
    localStorage.setItem(STORY_SAVE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save story mode state:', e);
  }
}

export const useStoryStore = create<StoryStore>((set, get) => {
  const saved = loadSavedStoryState();

  return {
    unlockedStuffies: saved.unlockedStuffies || ['jefe'],
    unlockedSectorIds: saved.unlockedSectorIds || [2, 3], // Sector 2: The House, Sector 3: The Backyard
    clearedSectorIds: saved.clearedSectorIds || [],
    storyStepIndex: saved.storyStepIndex ?? 0,
    activeSectorId: 2,
    activeMissionId: null,
    currentFloor: 1,
    currentAct: 1,

    armoryUnlocked: Boolean(saved.armoryUnlocked),
    labUnlocked: Boolean(saved.labUnlocked),
    fairyWellUnlocked: Boolean(saved.fairyWellUnlocked),
    fairyWellUpgrades: saved.fairyWellUpgrades || [],

    activeDialogue: null,
    currentDialogueLineIndex: 0,

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

        if (mission.outroDialogueId) {
          get().startDialogue(mission.outroDialogueId);
        }
      }

      set({
        activeMissionId: null,
        currentFloor: 1,
        currentAct: 1,
      });
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

      set({
        activeDialogue: null,
        currentDialogueLineIndex: 0,
      });

      return true;
    },

    chooseDialogueOption: (choiceIndex: number) => {
      const { activeDialogue, currentDialogueLineIndex } = get();
      if (!activeDialogue) return;

      const currentLine = activeDialogue.lines[currentDialogueLineIndex];
      const choice = currentLine?.choices?.[choiceIndex];
      if (!choice) return;

      sound.playClickSound();
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
      });
    },
  };
});
