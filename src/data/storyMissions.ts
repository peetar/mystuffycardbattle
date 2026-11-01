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

/**
 * The Curving 63-Chapter Narrative Path across the 150 sectors.
 * Features 25 plushie unlocks in exact order with big gaps and 8 key sector revisits!
 */
export const STORY_MAIN_QUEST_STEPS: StoryQuestStep[] = [
  // ACT I: The Waking & Backyard Trail
  { stepIndex: 0, sectorId: 2, missionId: 'm_house_start', title: 'The Stitched Awakening', requiredSpeciesIds: ['jefe'] },
  { stepIndex: 1, sectorId: 4, missionId: 'm_kitchen_search', title: 'Kitchen Pantry Investigation', requiredSpeciesIds: ['jefe'] },
  { stepIndex: 2, sectorId: 7, missionId: 'm_attic_alex', title: 'Bedroom Sock Drawer', unlockStuffySpeciesId: 'alex', requiredSpeciesIds: ['jefe'] },
  { stepIndex: 3, sectorId: 10, missionId: 'm_porch_steps', title: 'Backyard Porch Steps', requiredSpeciesIds: ['alex'] },
  { stepIndex: 4, sectorId: 12, missionId: 'm_garden_thicket', title: 'Overgrown Flowerbed Thicket', requiredSpeciesIds: ['alex'] },
  { stepIndex: 5, sectorId: 16, missionId: 'm_garden_shadow', title: 'Vegetable Garden Cobwebs', unlockStuffySpeciesId: 'shadow', requiredSpeciesIds: ['alex'] },
  // REVISIT 1: Return to House to use Shadow's mist claws
  { stepIndex: 6, sectorId: 2, missionId: 'm_house_revisit_1', title: 'Revisit: Closet Secret Key', isRevisit: true, requiredSpeciesIds: ['shadow'] },
  { stepIndex: 7, sectorId: 18, missionId: 'm_shed_armory', title: 'Workshop Shed (Armory 1/16)', milestone: 'armory', unlockStuffySpeciesId: 'finlee', requiredSpeciesIds: ['shadow'] },
  { stepIndex: 8, sectorId: 21, missionId: 'm_garden_fence', title: 'Garden Fence Gap', requiredSpeciesIds: ['finlee'] },

  // ACT II: Necak's Hillside & The Star Lab
  { stepIndex: 9, sectorId: 24, missionId: 'm_necak_orchard', title: "Necak's Outer Orchard", requiredSpeciesIds: ['finlee'] },
  { stepIndex: 10, sectorId: 26, missionId: 'm_necak_slugmee', title: "Necak's Hayloft Trail", unlockStuffySpeciesId: 'slugmee', requiredSpeciesIds: ['finlee'] },
  { stepIndex: 11, sectorId: 28, missionId: 'm_necak_spike', title: "Necak's Stepping Terrace", unlockStuffySpeciesId: 'spike', requiredSpeciesIds: ['slugmee'] },
  { stepIndex: 12, sectorId: 30, missionId: 'm_lab_unlock', title: "Necak's Star Workshop (Lab 3/32)", milestone: 'lab', requiredSpeciesIds: ['spike'] },
  // REVISIT 2: Return to Shed to forge evolved gear
  { stepIndex: 13, sectorId: 18, missionId: 'm_shed_revisit_2', title: 'Revisit: Workshop Anvil Test', isRevisit: true, requiredSpeciesIds: ['spike'] },
  { stepIndex: 14, sectorId: 32, missionId: 'm_necak_spot', title: "Necak's Flagstone Patio", unlockStuffySpeciesId: 'spot', requiredSpeciesIds: ['spike'] },
  { stepIndex: 15, sectorId: 35, missionId: 'm_necak_cow', title: "Necak's Barnyard Sanctuary", unlockStuffySpeciesId: 'cow', requiredSpeciesIds: ['spot'] },
  // REVISIT 3: Bring Cow to the Fairy Well in Backyard
  { stepIndex: 16, sectorId: 13, missionId: 'm_fairy_well', title: 'Revisit: The Fairy Well (1/8)', isRevisit: true, milestone: 'fairy_well', requiredSpeciesIds: ['cow'] },

  // ACT III: The High-Rise Apartments
  { stepIndex: 17, sectorId: 38, missionId: 'm_apt_alley', title: 'Apartment Courtyard Alley', requiredSpeciesIds: ['cow'] },
  { stepIndex: 18, sectorId: 41, missionId: 'm_apt_mailboxes', title: 'Lobby Mailbox Bank', requiredSpeciesIds: ['cow'] },
  { stepIndex: 19, sectorId: 44, missionId: 'm_apt_cydney', title: 'High-Rise Foyer', unlockStuffySpeciesId: 'cidney', requiredSpeciesIds: ['cow'] },
  { stepIndex: 20, sectorId: 48, missionId: 'm_apt_stairs', title: 'Fire Escape Stairwell', requiredSpeciesIds: ['cidney'] },
  { stepIndex: 21, sectorId: 52, missionId: 'm_apt_chantiera', title: '2nd Floor Breezeway', unlockStuffySpeciesId: 'chanteira', requiredSpeciesIds: ['cidney'] },
  // REVISIT 4: Chantiera opens coastal tunnel at Necak's Barn
  { stepIndex: 22, sectorId: 35, missionId: 'm_necak_revisit_3', title: 'Revisit: Coastal Secret Passage', isRevisit: true, requiredSpeciesIds: ['chanteira'] },

  // ACT IV: Oceanic Abyss & Upgel Didav
  { stepIndex: 23, sectorId: 92, missionId: 'm_trench_passage', title: 'Tidal Trench Passage', requiredSpeciesIds: ['chanteira'] },
  { stepIndex: 24, sectorId: 96, missionId: 'm_coral_wall', title: 'Coral Reef Outer Wall', requiredSpeciesIds: ['chanteira'] },
  { stepIndex: 25, sectorId: 100, missionId: 'm_ocean_dolphy', title: 'The Coral Citadel of Upgel Didav', unlockStuffySpeciesId: 'dolphy', requiredSpeciesIds: ['chanteira'] },

  // ACT V: Beach Coastline & Wild Forest
  { stepIndex: 26, sectorId: 76, missionId: 'm_beach_dunes', title: 'Sandy Dunes Crest', requiredSpeciesIds: ['dolphy'] },
  { stepIndex: 27, sectorId: 80, missionId: 'm_beach_allie', title: 'Golden Shoreline', unlockStuffySpeciesId: 'allie', requiredSpeciesIds: ['dolphy'] },
  // REVISIT 5: Allie douses the kitchen trap in House
  { stepIndex: 28, sectorId: 4, missionId: 'm_kitchen_revisit_4', title: 'Revisit: Dousing the Stove Trap', isRevisit: true, requiredSpeciesIds: ['allie'] },
  { stepIndex: 29, sectorId: 56, missionId: 'm_forest_edge', title: 'Wild Forest Perimeter', requiredSpeciesIds: ['allie'] },
  { stepIndex: 30, sectorId: 59, missionId: 'm_forest_glade', title: 'Mossy Pine Glade', requiredSpeciesIds: ['allie'] },
  { stepIndex: 31, sectorId: 62, missionId: 'm_forest_sluger', title: 'Wild Forest Brambles', unlockStuffySpeciesId: 'sluger', requiredSpeciesIds: ['allie'] },
  { stepIndex: 32, sectorId: 65, missionId: 'm_forest_hollow', title: 'Whispering Hollow', requiredSpeciesIds: ['sluger'] },
  { stepIndex: 33, sectorId: 68, missionId: 'm_forest_fifi', title: 'Deep Canopy Grove', unlockStuffySpeciesId: 'fifi', requiredSpeciesIds: ['sluger'] },
  { stepIndex: 34, sectorId: 71, missionId: 'm_forest_branches', title: 'Treetop Branch Walk', requiredSpeciesIds: ['fifi'] },
  { stepIndex: 35, sectorId: 74, missionId: 'm_forest_george', title: 'Great Treetop Lookout', unlockStuffySpeciesId: 'george', requiredSpeciesIds: ['fifi'] },
  // REVISIT 6: George spots signals down on Beach Shoreline
  { stepIndex: 36, sectorId: 80, missionId: 'm_beach_revisit_5', title: 'Revisit: Coastal Signal Fires', isRevisit: true, requiredSpeciesIds: ['george'] },

  // ACT VI: Beach Umbrella Camps & Abyssal Trenches
  { stepIndex: 37, sectorId: 83, missionId: 'm_beach_pavilion', title: 'Dune Pavilion', requiredSpeciesIds: ['george'] },
  { stepIndex: 38, sectorId: 85, missionId: 'm_beach_riolu', title: 'Beach Umbrella Camp', unlockStuffySpeciesId: 'riolu', requiredSpeciesIds: ['george'] },
  { stepIndex: 39, sectorId: 88, missionId: 'm_beach_shoals', title: 'Low Tide Shoals', requiredSpeciesIds: ['riolu'] },
  { stepIndex: 40, sectorId: 90, missionId: 'm_beach_thumper', title: 'Tide Pool Shallows', unlockStuffySpeciesId: 'thumper', requiredSpeciesIds: ['riolu'] },
  { stepIndex: 41, sectorId: 103, missionId: 'm_abyssal_drop', title: 'Abyssal Coral Drop-off', requiredSpeciesIds: ['thumper'] },
  { stepIndex: 42, sectorId: 105, missionId: 'm_ocean_toothless', title: 'Bioluminescent Trench', unlockStuffySpeciesId: 'toothless', requiredSpeciesIds: ['thumper'] },
  { stepIndex: 43, sectorId: 108, missionId: 'm_vent_basin', title: 'Hydrothermal Vent Basin', requiredSpeciesIds: ['toothless'] },
  { stepIndex: 44, sectorId: 110, missionId: 'm_ocean_beaker', title: 'Ocean Deep Trench', unlockStuffySpeciesId: 'beaker', requiredSpeciesIds: ['toothless'] },
  // REVISIT 7: Beaker brews potion at Upgel Didav
  { stepIndex: 45, sectorId: 100, missionId: 'm_ocean_revisit_6', title: 'Revisit: The Amphibious Brew', isRevisit: true, requiredSpeciesIds: ['beaker'] },

  // ACT VII: Suburb Avenue & Adventure Playground
  { stepIndex: 46, sectorId: 112, missionId: 'm_suburb_sidewalk', title: 'Cul-de-Sac Sidewalk', requiredSpeciesIds: ['beaker'] },
  { stepIndex: 47, sectorId: 116, missionId: 'm_suburb_eevee', title: 'Oak Tree Boulevard', unlockStuffySpeciesId: 'eevee', requiredSpeciesIds: ['beaker'] },
  { stepIndex: 48, sectorId: 119, missionId: 'm_suburb_crosswalk', title: 'Quiet Crosswalk', requiredSpeciesIds: ['eevee'] },
  { stepIndex: 49, sectorId: 122, missionId: 'm_suburb_dear', title: 'Suburb Cul-de-Sac', unlockStuffySpeciesId: 'dear', requiredSpeciesIds: ['eevee'] },
  // REVISIT 8: Dear & Eevee unlock rooftop telescope in Apartments
  { stepIndex: 50, sectorId: 52, missionId: 'm_apt_revisit_7', title: 'Revisit: The Rooftop Telescope', isRevisit: true, requiredSpeciesIds: ['dear'] },
  { stepIndex: 51, sectorId: 126, missionId: 'm_park_sandpit', title: 'Playground Sandpit', requiredSpeciesIds: ['dear'] },
  { stepIndex: 52, sectorId: 130, missionId: 'm_park_cole', title: 'Jungle Gym Spire', unlockStuffySpeciesId: 'cole', requiredSpeciesIds: ['dear'] },
  { stepIndex: 53, sectorId: 133, missionId: 'm_park_runway', title: 'Monkey Bar Runway', requiredSpeciesIds: ['cole'] },
  { stepIndex: 54, sectorId: 136, missionId: 'm_park_henry', title: 'Mega Spiral Slide', unlockStuffySpeciesId: 'henry', requiredSpeciesIds: ['cole'] },
  // REVISIT 9: Full squad returns to House to activate Astral Portal
  { stepIndex: 55, sectorId: 2, missionId: 'm_house_revisit_8', title: 'Revisit: The Celestial Gathering', isRevisit: true, requiredSpeciesIds: ['henry'] },

  // ACT VIII: The Astral Citadel Climax
  { stepIndex: 56, sectorId: 138, missionId: 'm_astral_horizon', title: 'Thread Horizon', requiredSpeciesIds: ['henry'] },
  { stepIndex: 57, sectorId: 141, missionId: 'm_astral_pinky', title: 'Astral Star Bridge', unlockStuffySpeciesId: 'pinky_bear', requiredSpeciesIds: ['henry'] },
  { stepIndex: 58, sectorId: 143, missionId: 'm_astral_way', title: 'Constellation Way', requiredSpeciesIds: ['pinky_bear'] },
  { stepIndex: 59, sectorId: 145, missionId: 'm_astral_bigbear', title: 'Nebula Spire', unlockStuffySpeciesId: 'big_bear', requiredSpeciesIds: ['pinky_bear'] },
  { stepIndex: 60, sectorId: 148, missionId: 'm_astral_approach', title: 'Citadel Approach', requiredSpeciesIds: ['big_bear'] },
  { stepIndex: 61, sectorId: 149, missionId: 'm_astral_umbreon', title: 'Citadel Gates', unlockStuffySpeciesId: 'umbreon', requiredSpeciesIds: ['big_bear'] },
  { stepIndex: 62, sectorId: 150, missionId: 'm_stitchmaster_finale', title: "The Stitchmaster's Citadel", requiredSpeciesIds: ['umbreon'] },
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
  const isFinale = step.sectorId === 150;

  STORY_MISSIONS[step.missionId] = {
    id: step.missionId,
    sectorId: step.sectorId,
    title: step.title,
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

// Side quests across the world
const SIDE_QUEST_CONFIGS: { id: string; sectorId: number; title: string; requiredSpeciesIds: string[] }[] = [
  { id: 'm_backyard_repeatable', sectorId: 3, title: 'Side Quest: Backyard Lawn Patrol', requiredSpeciesIds: ['jefe'] },
  { id: 'sq_house_attic', sectorId: 5, title: 'Side Quest: Attic Trunk Cache', requiredSpeciesIds: ['alex'] },
  { id: 'sq_backyard_shed', sectorId: 11, title: "Side Quest: Raven's Shiny Cache", requiredSpeciesIds: ['shadow'] },
  { id: 'sq_garden_hose', sectorId: 14, title: 'Side Quest: Garden Hose Labyrinth', requiredSpeciesIds: ['finlee'] },
  { id: 'sq_garden_fence', sectorId: 21, title: 'Side Quest: Stepping Stone Cache', requiredSpeciesIds: ['slugmee'] },
  { id: 'sq_necak_orchard', sectorId: 29, title: "Side Quest: Necak's Woodpile", requiredSpeciesIds: ['spike', 'spot'] },
  { id: 'sq_apt_mailboxes', sectorId: 42, title: 'Side Quest: High-Rise Water Tower', requiredSpeciesIds: ['cow'] },
  { id: 'sq_forest_clearing', sectorId: 60, title: 'Side Quest: Pinecone Fortress', requiredSpeciesIds: ['cidney'] },
  { id: 'sq_forest_creek', sectorId: 66, title: 'Side Quest: Whispering Pines Trail', requiredSpeciesIds: ['chanteira'] },
  { id: 'sq_beach_cove', sectorId: 82, title: 'Side Quest: Seashell Sandbar', requiredSpeciesIds: ['allie'] },
  { id: 'sq_ocean_atoll', sectorId: 94, title: 'Side Quest: Tidal Wave Slalom', requiredSpeciesIds: ['dolphy'] },
  { id: 'sq_abyssal_vents', sectorId: 108, title: 'Side Quest: Deep Bathysphere Relics', requiredSpeciesIds: ['toothless', 'beaker'] },
  { id: 'sq_suburb_hydrant', sectorId: 118, title: 'Side Quest: The Hydrant Geyser', requiredSpeciesIds: ['eevee', 'dear'] },
  { id: 'sq_playground_bars', sectorId: 132, title: 'Side Quest: Monkey Bar Gauntlet', requiredSpeciesIds: ['cole', 'henry'] },
  { id: 'sq_astral_constellation', sectorId: 144, title: 'Side Quest: Celestial Stardust Way', requiredSpeciesIds: ['pinky_bear', 'big_bear'] },
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
