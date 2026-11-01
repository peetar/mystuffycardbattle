/**
 * Story Mode Types (v4.0)
 * 10x10 Sector Grid, Interactive Narrative, Dynamic Squad Scaling,
 * and Progressive Facility Unlocks.
 */

import { Card, StuffyState, Esper } from './game';

export type SectorBiome =
  | 'house'
  | 'backyard'
  | 'necak_house'
  | 'apartment'
  | 'wild_forest'
  | 'beach'
  | 'ocean'
  | 'suburb'
  | 'playground'
  | 'astral';

export type SectorStatus =
  | 'locked'
  | 'unlocked'
  | 'active_story_objective'
  | 'cleared'
  | 'always_open';

export type QuestType = 'main' | 'side';

export interface StorySector {
  id: number; // 1 to 100
  x: number; // 1 to 10 (row/col)
  y: number; // 1 to 10
  name: string;
  biome: SectorBiome;
  description: string;
  recommendedLevel: number;
  questType?: QuestType;
  isAlwaysAccessible?: boolean; // e.g. Sector 3: The Backyard
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
  lines: StoryDialogueLine[];
  onCompleteUnlockStuffyId?: string; // Recruits a new stuffy into player's story squad!
  onCompleteUnlockSectorIds?: number[];
  onCompleteUnlockMilestone?: 'armory' | 'lab' | 'fairy_well';
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
  introDialogueId?: string;
  outroDialogueId?: string;
  floors: StoryMissionFloor[];
  rewardPacksRarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  rewardPacksCount?: number;
  requiredSpeciesIds?: string[]; // Mandatory locked story plushies for this mission
  unlockStuffySpeciesId?: string; // e.g., Rescuing Shadow, Finlee, etc.
}

export interface FairyWellUpgrade {
  esperId: string;
  sacrificedSpeciesId: string;
  sacrificedCardsCount: number;
  bonusSpeed: number;
  bonusHp: number;
  bonusProcChance: number;
}
