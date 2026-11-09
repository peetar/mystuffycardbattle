/**
 * Story Mode Types (v4.0)
 * 10x10 Sector Grid, Interactive Narrative, Dynamic Squad Scaling,
 * and Progressive Facility Unlocks.
 */

import { Card, StuffyState, Esper } from './game';

export type SectorBiome =
  | 'house'
  | 'backyard'
  | 'training_grounds'
  | 'necak_house'
  | 'apartment'
  | 'wild_forest'
  | 'beach'
  | 'ocean'
  | 'suburb'
  | 'playground'
  | 'carnival'
  | 'crystal_caves'
  | 'clockwork_tower'
  | 'sky_islands'
  | 'magma_peak'
  | 'toy_factory'
  | 'astral';

export type SectorStatus =
  | 'locked'
  | 'unlocked'
  | 'active_story_objective'
  | 'cleared'
  | 'always_open';

export type QuestType = 'main' | 'side';

export interface StoryPart {
  partNumber: number; // 1 to 5
  title: string;
  subtitle: string;
  startSectorId: number;
  endSectorId: number;
  sectorsCount: number; // 528
  bossName: string;
  bossSpeciesId: string;
  themeColor: string;
  icon: string;
  description: string;
}

export interface StorySector {
  id: number; // 1 to 2640 (528 per part)
  partNumber?: number; // 1 to 5
  partSectorIndex?: number; // 1 to 528
  x: number;
  y: number;
  name: string;
  biome: SectorBiome;
  description: string;
  recommendedLevel: number;
  questType?: QuestType;
  isAlwaysAccessible?: boolean; // e.g. Sector 3: The Backyard
  isGap?: boolean; // Random terrain void/chasm gap
  requiredMissionId?: string;
  bossSpeciesId?: string;
  bossName?: string;
  revisitDialogueId?: string;
  icon: string;
}

export interface StoryDialogueChoice {
  text: string;
  nextDialogueId?: string;
  rewardPacksCount?: number;
  bonusCrackers?: number;
  combatBuff?: 'shield' | 'damage' | 'speed';
}

export interface StoryDialogueLine {
  speakerName: string;
  speakerSpeciesId?: string;
  emotion?: 'neutral' | 'happy' | 'angry' | 'surprised' | 'worried';
  text: string;
  choices?: StoryDialogueChoice[];
}

export interface StoryDialogueEpisode {
  id: string;
  title: string;
  subtitle?: string;
  isCinematic?: boolean;
  cutsceneType?: 'intro' | 'rescue' | 'milestone' | 'part_complete' | 'citadel_finale';
  lines: StoryDialogueLine[];
  onCompleteUnlockStuffyId?: string; // Recruits a new stuffy into player's story squad!
  onCompleteUnlockSectorIds?: number[];
  onCompleteUnlockMilestone?: 'armory' | 'lab' | 'fairy_well';
  onCompleteUnlockPart?: number;
}

export interface StoryMissionFloor {
  floorNumber: number; // 1 to totalFloors
  actNumber: number; // 1 to totalActs (usually 3 acts)
  type: 'monster' | 'elite' | 'event' | 'boss';
  enemySpeciesIds: string[];
  enemyLevel: number;
  bossSpeciesId?: string;
}

export interface StoryDraftSelection {
  speciesId: string;
  loadoutId: string;
}

export interface StoryMission {
  id: string;
  sectorId: number;
  title: string;
  synopsis: string;
  totalActs: number; // typically 3
  totalFloors: number; // typically around 9 floors
  recommendedLevel: number;
  questType?: QuestType; // 'main' or 'side'
  isRevisit?: boolean;
  revisitDialogueId?: string;
  introDialogueId?: string;
  outroDialogueId?: string;
  floors: StoryMissionFloor[];
  rewardPacksRarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  rewardPacksCount?: number;
  requiredSpeciesIds?: string[]; // Mandatory locked story plushies for this mission
  unlockStuffySpeciesId?: string; // e.g., Rescuing Shadow, Finlee, etc.
  isHostageRescue?: boolean; // Special rescue mission objective
  hostageSpeciesId?: string; // Captive plushie being held
  milestone?: 'armory' | 'lab' | 'fairy_well';
}

export interface FairyWellUpgrade {
  esperId: string;
  sacrificedSpeciesId: string;
  sacrificedCardsCount: number;
  bonusSpeed: number;
  bonusHp: number;
  bonusProcChance: number;
}
