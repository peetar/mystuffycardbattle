/**
 * Story Mode Missions (v4.0)
 * Structured with dynamic lengths averaging ~9 floors across 3 acts,
 * featuring enemy teams of 5 with dynamic down-scaling when the player has <= 4 stuffies.
 */

import { StoryMission, StoryMissionFloor } from '@/types/story';

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
  // Mission 1: Sector 2 (The House Start)
  m_house_start: {
    id: 'm_house_start',
    sectorId: 2,
    title: 'The Stitched Awakening',
    synopsis: 'Jefe must patrol the living room carpet alone to investigate the mysterious thread trail!',
    totalActs: 2,
    totalFloors: 6,
    recommendedLevel: 1,
    introDialogueId: 'intro_house',
    rewardPacksRarity: 'uncommon',
    rewardPacksCount: 1,
    floors: createFloors(2, 6, ['spot', 'allie']),
  },

  // Sector 3: The Backyard (Always Accessible, Repeatable Side Mission)
  m_backyard_repeatable: {
    id: 'm_backyard_repeatable',
    sectorId: 3,
    title: 'Backyard Lawn Patrol (Repeatable)',
    synopsis: 'A safe, sunny retreat to train, test new strategies, and harvest bonus card packs at any time!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 1,
    rewardPacksRarity: 'rare',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['spot', 'cow', 'george', 'allie']),
  },

  // Mission 2: Sector 4 (Kitchen Pantry - Rescuing Shadow)
  m_kitchen_shadow: {
    id: 'm_kitchen_shadow',
    sectorId: 4,
    title: 'Pantry Claws',
    synopsis: 'Fight through the wooden kitchen shelves to cut Shadow free from the cobweb net!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 2,
    outroDialogueId: 'rescue_shadow',
    unlockStuffySpeciesId: 'shadow',
    rewardPacksRarity: 'uncommon',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['spot', 'george', 'allie']),
  },

  // Mission 3: Sector 6 (Workshop Basement - Milestone 1/16 Armory)
  m_basement_armory: {
    id: 'm_basement_armory',
    sectorId: 6,
    title: 'The Toolbox Cache (Milestone 1/16)',
    synopsis: 'Descend into the basement to discover the Equipment Armory and equip your team with armor!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 3,
    outroDialogueId: 'milestone_armory',
    rewardPacksRarity: 'rare',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['george', 'allie', 'shadow']),
  },

  // Mission 4: Sector 8 (Hallway Ambush - Rescuing Cow)
  m_hallway_cow: {
    id: 'm_hallway_cow',
    sectorId: 8,
    title: 'Bovine Stampede Rescue',
    synopsis: 'Cow is surrounded by clockwork tin soldiers in the narrow hallway! Charge in and rescue her!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 4,
    outroDialogueId: 'rescue_cow',
    unlockStuffySpeciesId: 'cow',
    rewardPacksRarity: 'rare',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['george', 'spot', 'allie']),
  },

  // Mission 5: Sector 9 (Star Chamber - Milestone 3/32 Evolution Lab)
  m_lab_unlock: {
    id: 'm_lab_unlock',
    sectorId: 9,
    title: 'The Astral Table (Milestone 3/32)',
    synopsis: 'Discover the Evolution Lab table and unlock the power of 1★+1★=2★ star card merging!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 5,
    outroDialogueId: 'milestone_lab',
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['shadow', 'cow', 'george']),
  },

  // Mission 6: Sector 10 (Living Room Threshold - Dust Gobbler Boss)
  m_house_boss: {
    id: 'm_house_boss',
    sectorId: 10,
    title: 'The Threshold Guardian',
    synopsis: 'Confront the roaring Dust Gobbler to break the house lock and escape into the outside world!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 6,
    rewardPacksRarity: 'epic',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['shadow', 'cow', 'allie'], 'vacuum_beast'),
  },

  // Mission 7: Sector 13 (The Fairy Well - Milestone 1/8 Fairy Well)
  m_fairy_well: {
    id: 'm_fairy_well',
    sectorId: 13,
    title: 'The Enchanted Birdbath (Milestone 1/8)',
    synopsis: 'Awaken the Fairy Well in the mossy garden to sacrifice duplicate cards for permanent Esper enhancements!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 7,
    outroDialogueId: 'milestone_fairy_well',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['george', 'allie', 'spot']),
  },

  // Mission 8: Sector 17 (Sandpit Overpass - Rescuing Finlee)
  m_sandpit_finlee: {
    id: 'm_sandpit_finlee',
    sectorId: 17,
    title: 'Shark in the Sandbox',
    synopsis: 'Finlee is cornered by sand scorpions near the playground slide! Bring your squad to the rescue!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 8,
    outroDialogueId: 'rescue_finlee',
    unlockStuffySpeciesId: 'finlee',
    rewardPacksRarity: 'rare',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['allie', 'george', 'cow']),
  },

  // Mission 9: Sector 20 (Thorny Briar King - Rescuing Alex)
  m_briar_alex: {
    id: 'm_briar_alex',
    sectorId: 20,
    title: 'Crown of Thorns',
    synopsis: 'Slay the Thorny Briar King in Sector 20 to free Alex and harness his psychic Strokenosis power!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 9,
    outroDialogueId: 'rescue_alex',
    unlockStuffySpeciesId: 'alex',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['shadow', 'finlee', 'cow'], 'weed_whacker'),
  },
};

export function getMissionForSector(sectorId: number): StoryMission | undefined {
  return Object.values(STORY_MISSIONS).find((m) => m.sectorId === sectorId);
}
