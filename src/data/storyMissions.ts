/**
 * Story Mode Missions (v4.0)
 * Structured with dynamic lengths averaging ~9 floors across 3 acts,
 * featuring enemy teams of 5 with dynamic down-scaling when the player has <= 4 stuffies.
 */

import { StoryMission, StoryMissionFloor } from '@/types/story';
import { getSectorById } from './storySectors';

function getEnemyPoolForBiome(biome: string): string[] {
  switch (biome) {
    case 'house':
      return ['spot', 'allie', 'george', 'finlee'];
    case 'backyard':
      return ['spot', 'cow', 'george', 'shadow'];
    case 'suburb':
      return ['alex', 'shadow', 'cow', 'george'];
    case 'playground':
      return ['finlee', 'allie', 'alex', 'spot'];
    case 'forest':
      return ['shadow', 'cow', 'allie', 'finlee'];
    case 'sewer':
      return ['allie', 'alex', 'george', 'spot'];
    case 'factory':
      return ['george', 'alex', 'shadow', 'cow'];
    case 'astral':
      return ['jefe', 'alex', 'shadow', 'finlee', 'cow'];
    default:
      return ['spot', 'allie', 'cow'];
  }
}

function getPackRarityForBiome(biome: string): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
  switch (biome) {
    case 'house':
    case 'backyard':
      return 'uncommon';
    case 'suburb':
    case 'playground':
      return 'rare';
    case 'forest':
    case 'sewer':
      return 'epic';
    case 'factory':
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

    // Pick 5 enemy species for the 5-enemy team
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

export const STORY_MISSIONS: Record<string, StoryMission> = {
  // Main Mission 1: Sector 2 (The House Start - Jefe wakes up alone)
  m_house_start: {
    id: 'm_house_start',
    sectorId: 2,
    title: 'The Stitched Awakening',
    synopsis: 'Jefe must patrol the living room carpet alone to investigate the mysterious thread trail!',
    totalActs: 2,
    totalFloors: 6,
    recommendedLevel: 1,
    questType: 'main',
    requiredSpeciesIds: ['jefe'],
    introDialogueId: 'intro_house',
    rewardPacksRarity: 'uncommon',
    rewardPacksCount: 1,
    floors: createFloors(2, 6, ['spot', 'allie']),
  },

  // Main Mission 2: Sector 4 (Kitchen Pantry - Rescuing Shadow)
  m_kitchen_shadow: {
    id: 'm_kitchen_shadow',
    sectorId: 4,
    title: 'Pantry Claws',
    synopsis: 'Fight through the wooden kitchen shelves to cut Shadow free from the cobweb net!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 2,
    questType: 'main',
    requiredSpeciesIds: ['jefe'],
    outroDialogueId: 'rescue_shadow',
    unlockStuffySpeciesId: 'shadow',
    rewardPacksRarity: 'uncommon',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['spot', 'george', 'allie']),
  },

  // Main Mission 3: Sector 6 (Workshop Basement - Milestone 1/16 Armory - Shadow leads! DOES NOT REQUIRE JEFE)
  m_basement_armory: {
    id: 'm_basement_armory',
    sectorId: 6,
    title: 'The Toolbox Cache (Milestone 1/16)',
    synopsis: 'Shadow leads the squad down the creaky basement steps to discover the Equipment Armory!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 3,
    questType: 'main',
    requiredSpeciesIds: ['shadow'],
    outroDialogueId: 'milestone_armory',
    rewardPacksRarity: 'rare',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['george', 'allie', 'shadow']),
  },

  // Main Mission 4: Sector 8 (Hallway Ambush - Rescuing Cow - Shadow leads! DOES NOT REQUIRE JEFE)
  m_hallway_cow: {
    id: 'm_hallway_cow',
    sectorId: 8,
    title: 'Bovine Stampede Rescue',
    synopsis: 'Cow is surrounded by clockwork tin soldiers in the narrow hallway! Shadow leads the strike team!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 4,
    questType: 'main',
    requiredSpeciesIds: ['shadow'],
    outroDialogueId: 'rescue_cow',
    unlockStuffySpeciesId: 'cow',
    rewardPacksRarity: 'rare',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['george', 'spot', 'allie']),
  },

  // Main Mission 5: Sector 9 (Star Chamber - Milestone 3/32 Evolution Lab - Cow leads! DOES NOT REQUIRE JEFE)
  m_lab_unlock: {
    id: 'm_lab_unlock',
    sectorId: 9,
    title: 'The Astral Table (Milestone 3/32)',
    synopsis: 'Cow spots a glowing star table in the attic alcove where 1★+1★ cards fuse into 2★ power!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 5,
    questType: 'main',
    requiredSpeciesIds: ['cow'],
    outroDialogueId: 'milestone_lab',
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['shadow', 'cow', 'george']),
  },

  // Main Mission 6: Sector 10 (Living Room Threshold - Dust Gobbler Boss)
  m_house_boss: {
    id: 'm_house_boss',
    sectorId: 10,
    title: 'The Threshold Guardian',
    synopsis: 'Jefe rallies the squad to confront the roaring Dust Gobbler and break out of the house!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 6,
    questType: 'main',
    requiredSpeciesIds: ['jefe'],
    rewardPacksRarity: 'epic',
    rewardPacksCount: 3,
    floors: createFloors(3, 9, ['shadow', 'cow', 'allie'], 'vacuum_beast'),
  },

  // Main Mission 7: Sector 13 (The Fairy Well - Milestone 1/8 Fairy Well - Cow leads! DOES NOT REQUIRE JEFE)
  m_fairy_well: {
    id: 'm_fairy_well',
    sectorId: 13,
    title: 'The Enchanted Birdbath (Milestone 1/8)',
    synopsis: 'Cow discovers the sparkling Fairy Well where sacrificing duplicate Stuffy Cards grants permanent Esper boosts!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 7,
    questType: 'main',
    requiredSpeciesIds: ['cow'],
    outroDialogueId: 'milestone_fairy_well',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['george', 'allie', 'spot']),
  },

  // Main Mission 8: Sector 17 (Sandpit Overpass - Rescuing Finlee - Shadow & Cow team! DOES NOT REQUIRE JEFE)
  m_sandpit_finlee: {
    id: 'm_sandpit_finlee',
    sectorId: 17,
    title: 'Shark in the Sandbox',
    synopsis: 'Shadow and Cow locate Finlee trapped by sand scorpions near the playground slide!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 8,
    questType: 'main',
    requiredSpeciesIds: ['shadow', 'cow'],
    outroDialogueId: 'rescue_finlee',
    unlockStuffySpeciesId: 'finlee',
    rewardPacksRarity: 'rare',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['allie', 'george', 'cow']),
  },

  // Main Mission 9: Sector 20 (Thorny Briar King - Rescuing Alex - Finlee charges in! DOES NOT REQUIRE JEFE)
  m_briar_alex: {
    id: 'm_briar_alex',
    sectorId: 20,
    title: 'Crown of Thorns',
    synopsis: 'Finlee leads an aquatic charge through the thorny briars to defeat the Briar King and rescue Alex!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 9,
    questType: 'main',
    requiredSpeciesIds: ['finlee'],
    outroDialogueId: 'rescue_alex',
    unlockStuffySpeciesId: 'alex',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 3,
    floors: createFloors(3, 9, ['shadow', 'finlee', 'cow'], 'weed_whacker'),
  },

  // --- SIDE QUESTS ---
  // "Side quests should only appear when you get all the required stuffies"

  // Side Quest: Sector 3 (The Backyard - Always Open Grind, requires Jefe)
  m_backyard_repeatable: {
    id: 'm_backyard_repeatable',
    sectorId: 3,
    title: 'Side Quest: Backyard Lawn Patrol',
    synopsis: 'A sunny retreat to train, test new squad presets, and harvest bonus card packs at any time!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 1,
    questType: 'side',
    requiredSpeciesIds: ['jefe'],
    rewardPacksRarity: 'rare',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['spot', 'cow', 'george', 'allie']),
  },

  // Side Quest: Sector 5 (Attic Squeaker - Requires Shadow)
  sq_attic_squeaker: {
    id: 'sq_attic_squeaker',
    sectorId: 5,
    title: 'Side Quest: The Forgotten Squeaker',
    synopsis: 'Rummage through dusty steamer trunks to recover a golden vintage squeaker guarded by clockwork mice!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 3,
    questType: 'side',
    requiredSpeciesIds: ['shadow'],
    rewardPacksRarity: 'rare',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['spot', 'allie', 'george']),
  },

  // Side Quest: Sector 7 (Tool Shed Raven - Requires Shadow)
  sq_shed_raven: {
    id: 'sq_shed_raven',
    sectorId: 7,
    title: "Side Quest: Raven's Shiny Cache",
    synopsis: 'Scale the tool shed drainpipe to recover shiny buttons stolen by mischievous garden ravens!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 4,
    questType: 'side',
    requiredSpeciesIds: ['shadow'],
    rewardPacksRarity: 'rare',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['george', 'allie', 'spot']),
  },

  // Side Quest: Sector 11 (Caterpillar Caravan - Requires Cow)
  sq_caterpillar_caravan: {
    id: 'sq_caterpillar_caravan',
    sectorId: 11,
    title: 'Side Quest: Caterpillar Caravan',
    synopsis: 'Escort a line of friendly plush caterpillars through the dangerous flowerbed beetle thicket!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 6,
    questType: 'side',
    requiredSpeciesIds: ['cow'],
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['spot', 'cow', 'george', 'shadow']),
  },

  // Side Quest: Sector 14 (Garden Hose Knot - Requires Cow)
  sq_hose_labyrinth: {
    id: 'sq_hose_labyrinth',
    sectorId: 14,
    title: 'Side Quest: The Great Hose Knot',
    synopsis: 'Untangle the giant coiled green garden hose while fending off pressurized water sprinklers!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 7,
    questType: 'side',
    requiredSpeciesIds: ['cow'],
    rewardPacksRarity: 'rare',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['allie', 'spot', 'george']),
  },

  // Side Quest: Sector 22 (Treehouse Spyglass - Requires Shadow & Cow)
  sq_treehouse_spyglass: {
    id: 'sq_treehouse_spyglass',
    sectorId: 22,
    title: 'Side Quest: Spyglass Fluff Patrol',
    synopsis: 'Set up an observation post in the treehouse to monitor rogue toy movements across the street!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 10,
    questType: 'side',
    requiredSpeciesIds: ['shadow', 'cow'],
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['shadow', 'cow', 'george', 'allie']),
  },

  // Side Quest: Sector 30 (Rubber Duck Armada - Requires Finlee)
  sq_duck_armada: {
    id: 'sq_duck_armada',
    sectorId: 30,
    title: 'Side Quest: Rubber Duck Armada',
    synopsis: 'Navigate a plastic soap dish across the giant street puddle to disperse the rogue rubber duck fleet!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 15,
    questType: 'side',
    requiredSpeciesIds: ['finlee'],
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['alex', 'shadow', 'cow', 'finlee']),
  },

  // Side Quest: Sector 45 (Buried Plastic Relics - Requires Finlee)
  sq_sandpit_cavern: {
    id: 'sq_sandpit_cavern',
    sectorId: 45,
    title: 'Side Quest: Buried Plastic Relics',
    synopsis: 'Dig down into the playground sandbox to unearth ancient plastic buckets containing card hoards!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 25,
    questType: 'side',
    requiredSpeciesIds: ['finlee'],
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['finlee', 'allie', 'alex', 'spot']),
  },

  // Side Quest: Sector 58 (Pinecone Fortress - Requires Alex)
  sq_pinecone_fortress: {
    id: 'sq_pinecone_fortress',
    sectorId: 58,
    title: 'Side Quest: Pinecone Fortress',
    synopsis: 'Storm the fortified pinecone bastions erected by rogue forest squirrels under the dark pines!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 35,
    questType: 'side',
    requiredSpeciesIds: ['alex'],
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['shadow', 'cow', 'finlee', 'alex']),
  },

  // Side Quest: Sector 72 (Echoes of the Sewer Pipe - Requires Alex)
  sq_echo_pipe: {
    id: 'sq_echo_pipe',
    sectorId: 72,
    title: 'Side Quest: Echoes of the Sewer Pipe',
    synopsis: 'Trace a rhythmic SOS tapping through the dripping culvert pipes to salvage lost toy parts!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 45,
    questType: 'side',
    requiredSpeciesIds: ['alex'],
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['allie', 'alex', 'george', 'spot']),
  },

  // Side Quest: Sector 82 (Gear Grinder Bypass - Requires Alex & Shadow)
  sq_gear_bypass: {
    id: 'sq_gear_bypass',
    sectorId: 82,
    title: "Side Quest: Gear Grinder's Secret",
    synopsis: 'Crawl through the factory conveyor maintenance tunnel to disable the scrap crusher machine!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 58,
    questType: 'side',
    requiredSpeciesIds: ['alex', 'shadow'],
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['george', 'alex', 'shadow', 'cow']),
  },
};

export function getMissionForSector(sectorId: number): StoryMission | undefined {
  const handcrafted = Object.values(STORY_MISSIONS).find((m) => m.sectorId === sectorId);
  if (handcrafted) return handcrafted;

  const sector = getSectorById(sectorId);
  if (!sector) return undefined;

  const enemyPool = getEnemyPoolForBiome(sector.biome);
  const packRarity = getPackRarityForBiome(sector.biome);
  const isBossSector = Boolean(sector.bossSpeciesId);

  return {
    id: `m_dyn_sector_${sectorId}`,
    sectorId,
    title: `${sector.name} Expedition`,
    synopsis: `Scout and patrol through ${sector.name}. Clear the 3 acts to gather cards, gold, and secure the sector!`,
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: sector.recommendedLevel,
    rewardPacksRarity: packRarity,
    rewardPacksCount: isBossSector ? 3 : 1,
    floors: createFloors(3, 9, enemyPool, sector.bossSpeciesId),
  };
}
