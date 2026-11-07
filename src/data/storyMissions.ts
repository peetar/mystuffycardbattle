/**
 * Story Mode Missions (v4.0)
 * 150-Sector Curved Story Adventure with 72 Hours of Grinding Depth,
 * Big gaps between the 25 plushie rescues, and narrative sector revisits.
 */

import { StoryMission, StoryMissionFloor, QuestType } from '@/types/story';
import { getSectorById } from './storySectors';

function getEnemyPoolForBiome(biome: string): string[] {
  switch (biome) {
    case 'house':
      return ['spot', 'allie', 'george', 'finlee'];
    case 'backyard':
      return ['spot', 'cow', 'george', 'shadow'];
    case 'necak_house':
      return ['cow', 'spot', 'spike', 'slugmee'];
    case 'apartment':
      return ['alex', 'shadow', 'cow', 'george'];
    case 'wild_forest':
      return ['shadow', 'fifi', 'sluger', 'george'];
    case 'beach':
      return ['allie', 'riolu', 'thumper', 'spot'];
    case 'ocean':
      return ['finlee', 'dolphy', 'toothless', 'beaker'];
    case 'suburb':
      return ['eevee', 'dear', 'alex', 'shadow'];
    case 'playground':
      return ['cole', 'henry', 'allie', 'thumper'];
    case 'astral':
      return ['jefe', 'umbreon', 'pinky_bear', 'big_bear', 'alex'];
    default:
      return ['spot', 'allie', 'cow'];
  }
}

function getPackRarityForBiome(biome: string): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
  switch (biome) {
    case 'house':
    case 'backyard':
      return 'uncommon';
    case 'necak_house':
    case 'apartment':
      return 'rare';
    case 'wild_forest':
    case 'beach':
      return 'epic';
    case 'ocean':
    case 'suburb':
    case 'playground':
    case 'astral':
      return 'legendary';
    default:
      return 'uncommon';
  }
}

function createFloors(
  totalActs: number,
  totalFloors: number,
  enemyPool: string[],
  bossSpeciesId?: string
): StoryMissionFloor[] {
  const floors: StoryMissionFloor[] = [];
  const floorsPerAct = Math.ceil(totalFloors / totalActs);

  for (let f = 1; f <= totalFloors; f++) {
    const actNumber = Math.min(totalActs, Math.floor((f - 1) / floorsPerAct) + 1);
    const isActBoss = f % floorsPerAct === 0 || f === totalFloors;
    const isFinalBoss = f === totalFloors;

    const enemyTeamSpecies: string[] = [];
    for (let i = 0; i < 5; i++) {
      if (isFinalBoss && i === 0 && bossSpeciesId) {
        enemyTeamSpecies.push(bossSpeciesId);
      } else {
        const randSpecies = enemyPool[Math.floor(Math.random() * enemyPool.length)];
        enemyTeamSpecies.push(randSpecies);
      }
    }

    floors.push({
      floorNumber: f,
      actNumber,
      type: isFinalBoss ? 'boss' : isActBoss ? 'elite' : 'monster',
      enemySpeciesIds: enemyTeamSpecies,
      enemyLevel: Math.max(1, Math.floor(f / 2)),
      bossSpeciesId: isFinalBoss ? bossSpeciesId : undefined,
    });
  }

  return floors;
}

export interface StoryQuestStep {
  stepIndex: number;
  sectorId: number;
  missionId: string;
  title: string;
  isRevisit?: boolean;
  unlockStuffySpeciesId?: string;
  milestone?: 'armory' | 'lab' | 'fairy_well';
  requiredSpeciesIds?: string[];
}

export const ALL_STORY_SPECIES_ORDER = [
  'jefe',
  'alex',
  'shadow',
  'finlee',
  'slugmee',
  'spike',
  'spot',
  'cow',
  'cidney',
  'chanteira',
  'dolphy',
  'allie',
  'sluger',
  'fifi',
  'joann',
  'george',
  'riolu',
  'thumper',
  'toothless',
  'beaker',
  'eevee',
  'dear',
  'cole',
  'henry',
  'pinky_bear',
  'big_bear',
  'umbreon',
];

/**
 * The Curving 73-Chapter Narrative Path across the 300 sectors.
 * Features 26 plushie unlocks in exact order with big gaps and 29 key sector revisits!
 */
export const STORY_MAIN_QUEST_STEPS: StoryQuestStep[] = [
  { stepIndex: 0, sectorId: 2, missionId: 'm_house_start', title: 'The Stitched Awakening', requiredSpeciesIds: ['jefe'] },
  { stepIndex: 1, sectorId: 4, missionId: 'm_kitchen_search', title: 'Kitchen Hallway Scouting', requiredSpeciesIds: ['jefe'] },
  { stepIndex: 2, sectorId: 7, missionId: 'm_attic_alex', title: 'Bedroom Sock Drawer Rescue: Alex', unlockStuffySpeciesId: 'alex', requiredSpeciesIds: ['jefe'] },
  { stepIndex: 3, sectorId: 8, missionId: 'm_porch_steps', title: 'The Lawn Gate Mystery', requiredSpeciesIds: ['alex'] },
  { stepIndex: 4, sectorId: 12, missionId: 'm_garden_thicket', title: 'Flowerbed Thicket Path', requiredSpeciesIds: ['alex'] },
  { stepIndex: 5, sectorId: 16, missionId: 'm_garden_shadow', title: 'Garden Patio Rescue: Shade', unlockStuffySpeciesId: 'shadow', requiredSpeciesIds: ['alex'] },
  // REVISIT 1
  { stepIndex: 6, sectorId: 2, missionId: 'm_revisit_1', title: 'Revisit House: Closet Secret Key', isRevisit: true, requiredSpeciesIds: ['shadow'] },
  { stepIndex: 7, sectorId: 18, missionId: 'm_shed_armory', title: 'Workshop Shed Rescue: Finlee (Armory 1/16)', milestone: 'armory', unlockStuffySpeciesId: 'finlee', requiredSpeciesIds: ['shadow'] },
  { stepIndex: 8, sectorId: 24, missionId: 'm_hedgerow_trail', title: 'Hedgerow Border Trail', requiredSpeciesIds: ['finlee'] },
  { stepIndex: 9, sectorId: 30, missionId: 'm_patio_transition', title: 'Patio Transition Stones', requiredSpeciesIds: ['finlee'] },
  // REVISIT 2
  { stepIndex: 10, sectorId: 12, missionId: 'm_revisit_2', title: 'Revisit Backyard: Sprinkler Ambush', isRevisit: true, requiredSpeciesIds: ['finlee'] },
  { stepIndex: 11, sectorId: 65, missionId: 'm_breezeway_slugmee', title: 'Apartment Breezeway Rescue: Slugmee', unlockStuffySpeciesId: 'slugmee', requiredSpeciesIds: ['finlee'] },
  { stepIndex: 12, sectorId: 72, missionId: 'm_stepping_spike', title: 'Stepping Stones Rescue: Spike', unlockStuffySpeciesId: 'spike', requiredSpeciesIds: ['slugmee'] },
  { stepIndex: 13, sectorId: 50, missionId: 'm_lab_unlock', title: "Necak's Star Workshop (Lab 3/32)", milestone: 'lab', requiredSpeciesIds: ['spike'] },
  // REVISIT 3
  { stepIndex: 14, sectorId: 18, missionId: 'm_revisit_3', title: 'Revisit Shed: Workshop Anvil Test', isRevisit: true, requiredSpeciesIds: ['spike'] },
  { stepIndex: 15, sectorId: 48, missionId: 'm_necak_spot', title: "Necak's Terrace Rescue: Spot", unlockStuffySpeciesId: 'spot', requiredSpeciesIds: ['spike'] },
  { stepIndex: 16, sectorId: 56, missionId: 'm_necak_cow', title: "Necak's Barnyard Sanctuary: Cow", unlockStuffySpeciesId: 'cow', requiredSpeciesIds: ['spot'] },
  // REVISIT 4
  { stepIndex: 17, sectorId: 38, missionId: 'm_revisit_4', title: 'Revisit Fairy Well: Star Springs (1/8)', isRevisit: true, milestone: 'fairy_well', requiredSpeciesIds: ['cow'] },
  { stepIndex: 18, sectorId: 60, missionId: 'm_apt_lobby', title: 'Apartment Lobby Infiltration', requiredSpeciesIds: ['cow'] },
  // REVISIT 5
  { stepIndex: 19, sectorId: 4, missionId: 'm_revisit_5', title: 'Revisit Kitchen: Pantry Ration Run', isRevisit: true, requiredSpeciesIds: ['cow'] },
  { stepIndex: 20, sectorId: 80, missionId: 'm_apt_cydney', title: 'High-Rise Balcony Rescue: Cidney', unlockStuffySpeciesId: 'cidney', requiredSpeciesIds: ['cow'] },
  { stepIndex: 21, sectorId: 74, missionId: 'm_corridor_maze', title: 'High-Rise Corridor Maze', requiredSpeciesIds: ['cidney'] },
  { stepIndex: 22, sectorId: 84, missionId: 'm_rooftop_gale', title: 'Windy Rooftop Gale', requiredSpeciesIds: ['cidney'] },
  // REVISIT 6
  { stepIndex: 23, sectorId: 56, missionId: 'm_revisit_6', title: "Revisit Necak Barn: Hay Bale Fort", isRevisit: true, requiredSpeciesIds: ['cidney'] },
  { stepIndex: 24, sectorId: 88, missionId: 'm_apt_chantiera', title: 'Elevator Shaft Rescue: Chanteira', unlockStuffySpeciesId: 'chanteira', requiredSpeciesIds: ['cidney'] },
  // REVISIT 7
  { stepIndex: 25, sectorId: 50, missionId: 'm_revisit_7', title: "Revisit Necak Lab: Star Telescope", isRevisit: true, requiredSpeciesIds: ['chanteira'] },
  { stepIndex: 26, sectorId: 94, missionId: 'm_forest_border', title: 'The Overgrown Wild Forest Border', requiredSpeciesIds: ['chanteira'] },
  // REVISIT 8
  { stepIndex: 27, sectorId: 20, missionId: 'm_revisit_8', title: 'Revisit Backyard: Secret Shrub Path', isRevisit: true, requiredSpeciesIds: ['chanteira'] },
  { stepIndex: 28, sectorId: 100, missionId: 'm_ancient_oak', title: 'Ancient Hollow Oak Grove', requiredSpeciesIds: ['chanteira'] },
  // REVISIT 9
  { stepIndex: 29, sectorId: 68, missionId: 'm_revisit_9', title: 'Revisit Apartments: Fire Escape Route', isRevisit: true, requiredSpeciesIds: ['chanteira'] },
  { stepIndex: 30, sectorId: 195, missionId: 'm_ocean_dolphy', title: 'Sunken Citadel Rescue: Dolphy at Upgel Didav', unlockStuffySpeciesId: 'dolphy', requiredSpeciesIds: ['chanteira'] },
  // REVISIT 10
  { stepIndex: 31, sectorId: 6, missionId: 'm_revisit_10', title: 'Revisit House: Attic Trapdoor Clue', isRevisit: true, requiredSpeciesIds: ['dolphy'] },
  { stepIndex: 32, sectorId: 148, missionId: 'm_beach_allie', title: 'Golden Shoreline Rescue: Allie', unlockStuffySpeciesId: 'allie', requiredSpeciesIds: ['dolphy'] },
  // REVISIT 11
  { stepIndex: 33, sectorId: 105, missionId: 'm_revisit_11', title: 'Revisit Forest: Mossy Boulder Cache', isRevisit: true, requiredSpeciesIds: ['allie'] },
  { stepIndex: 34, sectorId: 110, missionId: 'm_bramble_ambush', title: 'Bramble Thicket Ambush', requiredSpeciesIds: ['allie'] },
  // REVISIT 12
  { stepIndex: 35, sectorId: 140, missionId: 'm_revisit_12', title: 'Revisit Beach: Driftwood Fortification', isRevisit: true, requiredSpeciesIds: ['allie'] },
  { stepIndex: 36, sectorId: 112, missionId: 'm_forest_sluger', title: 'Canyon Creek Rescue: Sluger', unlockStuffySpeciesId: 'sluger', requiredSpeciesIds: ['allie'] },
  // REVISIT 13
  { stepIndex: 37, sectorId: 18, missionId: 'm_revisit_13', title: 'Revisit Shed: Sewing Needle Sharpening', isRevisit: true, requiredSpeciesIds: ['sluger'] },
  { stepIndex: 38, sectorId: 118, missionId: 'm_canopy_lookout', title: 'Canopy Treetop Lookout', requiredSpeciesIds: ['sluger'] },
  { stepIndex: 39, sectorId: 125, missionId: 'm_forest_fifi', title: 'Treetop Canopy Rescue: Fifi', unlockStuffySpeciesId: 'fifi', requiredSpeciesIds: ['sluger'] },
  // REVISIT 14
  { stepIndex: 40, sectorId: 195, missionId: 'm_revisit_14', title: 'Revisit Upgel Didav: Coral Beacon Light', isRevisit: true, requiredSpeciesIds: ['fifi'] },
  // NEW PLUSHIE: JOANN (between Fifi and George!)
  { stepIndex: 41, sectorId: 122, missionId: 'm_forest_joann', title: 'Forest Picnic Table Rescue: Joann', unlockStuffySpeciesId: 'joann', requiredSpeciesIds: ['fifi'] },
  // REVISIT 15
  { stepIndex: 42, sectorId: 112, missionId: 'm_revisit_15', title: 'Revisit Forest: Hollow Stump Stash', isRevisit: true, requiredSpeciesIds: ['joann'] },
  { stepIndex: 43, sectorId: 128, missionId: 'm_overlook_ridge', title: 'Overlook Ridge Scouting', requiredSpeciesIds: ['joann'] },
  { stepIndex: 44, sectorId: 130, missionId: 'm_forest_george', title: 'Forest Pine Spire Rescue: George', unlockStuffySpeciesId: 'george', requiredSpeciesIds: ['joann'] },
  // REVISIT 16
  { stepIndex: 45, sectorId: 52, missionId: 'm_revisit_16', title: "Revisit Necak House: Windmill Signal", isRevisit: true, requiredSpeciesIds: ['george'] },
  { stepIndex: 46, sectorId: 155, missionId: 'm_beach_riolu', title: 'Beach Umbrella Camp Rescue: Ralou', unlockStuffySpeciesId: 'riolu', requiredSpeciesIds: ['george'] },
  // REVISIT 17
  { stepIndex: 47, sectorId: 80, missionId: 'm_revisit_17', title: 'Revisit Apartments: Antenna Array', isRevisit: true, requiredSpeciesIds: ['riolu'] },
  { stepIndex: 48, sectorId: 162, missionId: 'm_beach_thumper', title: 'Rocky Tide Pools Rescue: Thumper', unlockStuffySpeciesId: 'thumper', requiredSpeciesIds: ['riolu'] },
  // REVISIT 18
  { stepIndex: 49, sectorId: 148, missionId: 'm_revisit_18', title: 'Revisit Beach: Pearl Shallows', isRevisit: true, requiredSpeciesIds: ['thumper'] },
  { stepIndex: 50, sectorId: 185, missionId: 'm_ocean_toothless', title: 'Bioluminescent Trench Rescue: Lessteeth', unlockStuffySpeciesId: 'toothless', requiredSpeciesIds: ['thumper'] },
  // REVISIT 19
  { stepIndex: 51, sectorId: 175, missionId: 'm_revisit_19', title: 'Revisit Ocean: Submerged Coral Shelf', isRevisit: true, requiredSpeciesIds: ['toothless'] },
  { stepIndex: 52, sectorId: 205, missionId: 'm_ocean_beaker', title: 'Abyssal Trench Rescue: Beaker', unlockStuffySpeciesId: 'beaker', requiredSpeciesIds: ['toothless'] },
  // REVISIT 20
  { stepIndex: 53, sectorId: 38, missionId: 'm_revisit_20', title: 'Revisit Fairy Well: Starlight Font', isRevisit: true, requiredSpeciesIds: ['beaker'] },
  { stepIndex: 54, sectorId: 220, missionId: 'm_suburb_eevee', title: 'Oak Avenue Rescue: Eavie', unlockStuffySpeciesId: 'eevee', requiredSpeciesIds: ['beaker'] },
  // REVISIT 21
  { stepIndex: 55, sectorId: 1, missionId: 'm_revisit_21', title: "Revisit House: Ben's Desk Drawer", isRevisit: true, requiredSpeciesIds: ['eevee'] },
  { stepIndex: 56, sectorId: 235, missionId: 'm_suburb_dear', title: 'Cul-de-Sac Rescue: Dear', unlockStuffySpeciesId: 'dear', requiredSpeciesIds: ['eevee'] },
  // REVISIT 22
  { stepIndex: 57, sectorId: 215, missionId: 'm_revisit_22', title: 'Revisit Suburb: Autumn Leaf Pile', isRevisit: true, requiredSpeciesIds: ['dear'] },
  { stepIndex: 58, sectorId: 242, missionId: 'm_playground_gate', title: 'Playground Courtyard Gate', requiredSpeciesIds: ['dear'] },
  // REVISIT 23
  { stepIndex: 59, sectorId: 16, missionId: 'm_revisit_23', title: 'Revisit Backyard: Shade Trial', isRevisit: true, requiredSpeciesIds: ['dear'] },
  { stepIndex: 60, sectorId: 250, missionId: 'm_play_cole', title: 'Jungle Gym Rescue: Cole', unlockStuffySpeciesId: 'cole', requiredSpeciesIds: ['dear'] },
  // REVISIT 24
  { stepIndex: 61, sectorId: 245, missionId: 'm_revisit_24', title: 'Revisit Playground: Spiral Slide Patrol', isRevisit: true, requiredSpeciesIds: ['cole'] },
  { stepIndex: 62, sectorId: 262, missionId: 'm_play_henry', title: 'Monkey Bar Heights Rescue: Henry', unlockStuffySpeciesId: 'henry', requiredSpeciesIds: ['cole'] },
  // REVISIT 25
  { stepIndex: 63, sectorId: 70, missionId: 'm_revisit_25', title: 'Revisit Apartments: Laundry Chute Tunnel', isRevisit: true, requiredSpeciesIds: ['henry'] },
  { stepIndex: 64, sectorId: 270, missionId: 'm_astral_bridge', title: 'The Celestial Astral Bridge', requiredSpeciesIds: ['henry'] },
  // REVISIT 26
  { stepIndex: 65, sectorId: 200, missionId: 'm_revisit_26', title: 'Revisit Ocean: Abyssal Rift Tremor', isRevisit: true, requiredSpeciesIds: ['henry'] },
  { stepIndex: 66, sectorId: 275, missionId: 'm_astral_pinky', title: 'Nebula Spire Rescue: Pinky Bear', unlockStuffySpeciesId: 'pinky_bear', requiredSpeciesIds: ['henry'] },
  // REVISIT 27
  { stepIndex: 67, sectorId: 125, missionId: 'm_revisit_27', title: 'Revisit Forest: Whispering Pines Crest', isRevisit: true, requiredSpeciesIds: ['pinky_bear'] },
  { stepIndex: 68, sectorId: 285, missionId: 'm_astral_bigbear', title: 'Stardust Pillars Rescue: Big Bear', unlockStuffySpeciesId: 'big_bear', requiredSpeciesIds: ['pinky_bear'] },
  // REVISIT 28
  { stepIndex: 69, sectorId: 160, missionId: 'm_revisit_28', title: 'Revisit Beach: Moonlit Dunes', isRevisit: true, requiredSpeciesIds: ['big_bear'] },
  { stepIndex: 70, sectorId: 298, missionId: 'm_astral_umbreon', title: 'Citadel Gatekeeper Rescue: Umbratail', unlockStuffySpeciesId: 'umbreon', requiredSpeciesIds: ['big_bear'] },
  // REVISIT 29
  { stepIndex: 71, sectorId: 2, missionId: 'm_revisit_29', title: 'Revisit House: Grand War Room Assembly', isRevisit: true, requiredSpeciesIds: ['umbreon'] },
  { stepIndex: 72, sectorId: 300, missionId: 'm_citadel_finale', title: "Grand Finale: The Stitchmaster's Citadel", requiredSpeciesIds: ['umbreon'] },
];



export const MAIN_QUEST_SECTOR_IDS = new Set<number>(
  STORY_MAIN_QUEST_STEPS.map((step) => step.sectorId)
);

export const STORY_MISSIONS: Record<string, StoryMission> = {};

// Register all main story missions from the curvy steps
for (const step of STORY_MAIN_QUEST_STEPS) {
  const sector = getSectorById(step.sectorId);
  const biome = sector?.biome || 'house';
  const enemyPool = getEnemyPoolForBiome(biome);
  const packRarity = getPackRarityForBiome(biome);
  const isFinale = step.sectorId === 300;

  STORY_MISSIONS[step.missionId] = {
    id: step.missionId,
    sectorId: step.sectorId,
    title: step.title,
    milestone: step.milestone,
    synopsis: step.isRevisit
      ? `Revisit ${sector?.name || 'Sector ' + step.sectorId} to investigate new thread disturbances and advance the adventure!`
      : `Scout through ${sector?.name || 'Sector ' + step.sectorId} on the outdoor adventure!`,
    totalActs: isFinale ? 4 : 3,
    totalFloors: isFinale ? 12 : 9,
    recommendedLevel: sector?.recommendedLevel || 1,
    questType: 'main',
    isRevisit: step.isRevisit,
    requiredSpeciesIds: step.requiredSpeciesIds,
    unlockStuffySpeciesId: step.unlockStuffySpeciesId,
    rewardPacksRarity: packRarity,
    rewardPacksCount: isFinale ? 3 : step.unlockStuffySpeciesId ? 2 : 1,
    floors: createFloors(isFinale ? 4 : 3, isFinale ? 12 : 9, enemyPool, isFinale ? 'stitchmaster_final' : undefined),
  };
}

// Side quests across the 300 sectors
const SIDE_QUEST_CONFIGS: { id: string; sectorId: number; title: string; requiredSpeciesIds: string[] }[] = [
  { id: 'm_backyard_repeatable', sectorId: 3, title: 'Side Quest: Backyard Lawn Patrol', requiredSpeciesIds: ['jefe'] },
  { id: 'sq_house_attic', sectorId: 5, title: 'Side Quest: Attic Trunk Cache', requiredSpeciesIds: ['alex'] },
  { id: 'sq_backyard_shed', sectorId: 14, title: "Side Quest: Raven's Shiny Cache", requiredSpeciesIds: ['shadow'] },
  { id: 'sq_garden_hose', sectorId: 21, title: 'Side Quest: Garden Hose Labyrinth', requiredSpeciesIds: ['finlee'] },
  { id: 'sq_garden_fence', sectorId: 35, title: 'Side Quest: Stepping Stone Cache', requiredSpeciesIds: ['slugmee'] },
  { id: 'sq_necak_orchard', sectorId: 48, title: "Side Quest: Necak's Woodpile", requiredSpeciesIds: ['spike', 'spot'] },
  { id: 'sq_apt_mailboxes', sectorId: 70, title: 'Side Quest: High-Rise Water Tower', requiredSpeciesIds: ['cow'] },
  { id: 'sq_forest_clearing', sectorId: 85, title: 'Side Quest: Pinecone Fortress', requiredSpeciesIds: ['cidney'] },
  { id: 'sq_forest_creek', sectorId: 110, title: 'Side Quest: Whispering Pines Trail', requiredSpeciesIds: ['chanteira'] },
  { id: 'sq_beach_cove', sectorId: 150, title: 'Side Quest: Seashell Sandbar', requiredSpeciesIds: ['allie'] },
  { id: 'sq_ocean_atoll', sectorId: 180, title: 'Side Quest: Tidal Wave Slalom', requiredSpeciesIds: ['dolphy'] },
  { id: 'sq_abyssal_vents', sectorId: 200, title: 'Side Quest: Deep Bathysphere Relics', requiredSpeciesIds: ['toothless', 'beaker'] },
  { id: 'sq_suburb_hydrant', sectorId: 225, title: 'Side Quest: The Hydrant Geyser', requiredSpeciesIds: ['eevee', 'dear'] },
  { id: 'sq_playground_bars', sectorId: 255, title: 'Side Quest: Monkey Bar Gauntlet', requiredSpeciesIds: ['cole', 'henry'] },
  { id: 'sq_astral_constellation', sectorId: 280, title: 'Side Quest: Celestial Stardust Way', requiredSpeciesIds: ['pinky_bear', 'big_bear'] },
];

for (const sq of SIDE_QUEST_CONFIGS) {
  const sector = getSectorById(sq.sectorId);
  const biome = sector?.biome || 'backyard';
  const enemyPool = getEnemyPoolForBiome(biome);
  const packRarity = getPackRarityForBiome(biome);

  STORY_MISSIONS[sq.id] = {
    id: sq.id,
    sectorId: sq.sectorId,
    title: sq.title,
    synopsis: `Side adventure in ${sector?.name || 'Sector ' + sq.sectorId}. Gather bonus card packs and gold!`,
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: sector?.recommendedLevel || 1,
    questType: 'side',
    requiredSpeciesIds: sq.requiredSpeciesIds,
    rewardPacksRarity: packRarity,
    rewardPacksCount: 1,
    floors: createFloors(3, 9, enemyPool),
  };
}

export function getCurrentStoryObjectiveStep(stepIndex: number): StoryQuestStep {
  const idx = Math.min(STORY_MAIN_QUEST_STEPS.length - 1, Math.max(0, stepIndex));
  return STORY_MAIN_QUEST_STEPS[idx];
}

export function getCurrentStoryObjectiveSectorId(stepIndex: number): number {
  return getCurrentStoryObjectiveStep(stepIndex).sectorId;
}

export function getMissionForSector(sectorId: number, currentStepIndex: number = 0): StoryMission | undefined {
  // 1. Check if the active main story mission is at this sector
  const activeStep = getCurrentStoryObjectiveStep(currentStepIndex);
  if (activeStep.sectorId === sectorId) {
    const mainMission = STORY_MISSIONS[activeStep.missionId];
    if (mainMission) return mainMission;
  }

  // 2. Check if a side quest exists at this sector
  const sideMission = Object.values(STORY_MISSIONS).find(
    (m) => m.sectorId === sectorId && m.questType === 'side'
  );
  if (sideMission) return sideMission;

  // 3. Check any main mission for this sector
  const mainMission = Object.values(STORY_MISSIONS).find(
    (m) => m.sectorId === sectorId && m.questType === 'main'
  );
  if (mainMission) return mainMission;

  // 4. Dynamic procedural expedition for any of the 150 sectors
  const sector = getSectorById(sectorId);
  if (!sector) return undefined;

  const enemyPool = getEnemyPoolForBiome(sector.biome);
  const packRarity = getPackRarityForBiome(sector.biome);
  const isBossSector = Boolean(sector.bossSpeciesId);

  return {
    id: `m_dyn_sector_${sectorId}`,
    sectorId,
    title: `${sector.name} Expedition`,
    synopsis: `Scout through ${sector.name}. Clear the 3 acts to gather cards, gold, and secure the sector!`,
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: sector.recommendedLevel,
    rewardPacksRarity: packRarity,
    rewardPacksCount: isBossSector ? 3 : 1,
    floors: createFloors(3, 9, enemyPool, sector.bossSpeciesId),
  };
}
