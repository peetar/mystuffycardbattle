/**
 * Story Mode Missions (v4.0)
 * Structured with dynamic lengths averaging ~9 floors across 3 acts,
 * featuring enemy teams of 5 with dynamic down-scaling when the player has <= 4 stuffies.
 * Implements the grand outdoor adventure rescue saga of all 25 plushies in exact order.
 */

import { StoryMission, StoryMissionFloor } from '@/types/story';
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

export const STORY_MISSIONS: Record<string, StoryMission> = {
  // Main Mission 1: Sector 2 (The House Start - Jefe rescues Alex!)
  m_house_start: {
    id: 'm_house_start',
    sectorId: 2,
    title: 'The Stitched Awakening',
    synopsis: 'Jefe must patrol the bedroom to free Alex from the sock drawer and begin the outdoor adventure!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 1,
    questType: 'main',
    requiredSpeciesIds: ['jefe'],
    introDialogueId: 'intro_house',
    outroDialogueId: 'rescue_alex',
    unlockStuffySpeciesId: 'alex',
    rewardPacksRarity: 'uncommon',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['spot', 'allie']),
  },

  // Main Mission 2: Sector 4 (Backyard Vegetable Garden - Alex rescues Shadow!)
  m_backyard_shadow: {
    id: 'm_backyard_shadow',
    sectorId: 4,
    title: 'Garden Cobweb Claws',
    synopsis: 'Alex leads the charge into the overgrown vegetable garden to cut Shadow free from clockwork spiders!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 2,
    questType: 'main',
    requiredSpeciesIds: ['alex'],
    outroDialogueId: 'rescue_shadow',
    unlockStuffySpeciesId: 'shadow',
    rewardPacksRarity: 'uncommon',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['spot', 'george', 'allie']),
  },

  // Main Mission 3: Sector 6 (Workshop Shed - Shadow rescues Finlee + Milestone 1/16 Armory!)
  m_basement_armory: {
    id: 'm_basement_armory',
    sectorId: 6,
    title: 'The Toolbox Cache (Milestone 1/16)',
    synopsis: 'Shadow leads the squad into the backyard workshop shed to free Finlee and discover the Equipment Armory!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 3,
    questType: 'main',
    requiredSpeciesIds: ['shadow'],
    outroDialogueId: 'milestone_armory',
    unlockStuffySpeciesId: 'finlee',
    rewardPacksRarity: 'rare',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['george', 'allie', 'shadow']),
  },

  // Milestone Mission: Sector 9 (Necak's Star Workshop - Evolution Lab 3/32)
  m_lab_unlock: {
    id: 'm_lab_unlock',
    sectorId: 9,
    title: "Necak's Astral Table (Milestone 3/32)",
    synopsis: 'Finlee spots a glowing star table in Necak\'s workshop where cards fuse into higher stars!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 4,
    questType: 'main',
    requiredSpeciesIds: ['finlee'],
    outroDialogueId: 'milestone_lab',
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['shadow', 'cow', 'george']),
  },

  // Milestone Mission: Sector 13 (The Fairy Well - Milestone 1/8)
  m_fairy_well: {
    id: 'm_fairy_well',
    sectorId: 13,
    title: 'The Enchanted Birdbath (Milestone 1/8)',
    synopsis: 'Finlee discovers the Fairy Well where duplicate cards grant permanent Esper stat boosts!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 5,
    questType: 'main',
    requiredSpeciesIds: ['finlee'],
    outroDialogueId: 'milestone_fairy_well',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['george', 'allie', 'spot']),
  },

  // Main Mission 4: Sector 15 (Flowerbed Thicket - Rescuing Slugmee)
  m_garden_slugmee: {
    id: 'm_garden_slugmee',
    sectorId: 15,
    title: 'Thorny Flowerbed Slime',
    synopsis: 'Finlee leads the squad into the rose roots to break Slugmee free from tangled brambles!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 5,
    questType: 'main',
    requiredSpeciesIds: ['finlee'],
    outroDialogueId: 'rescue_slugmee',
    unlockStuffySpeciesId: 'slugmee',
    rewardPacksRarity: 'rare',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['spot', 'allie', 'george']),
  },

  // Main Mission 5: Sector 16 (Stepping Stone Path - Rescuing Spike)
  m_stepping_spike: {
    id: 'm_stepping_spike',
    sectorId: 16,
    title: 'Pebble Path Defense',
    synopsis: 'Slugmee lays down a sticky trail to help Spike break through swarming clockwork garden beetles!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 6,
    questType: 'main',
    requiredSpeciesIds: ['slugmee'],
    outroDialogueId: 'rescue_spike',
    unlockStuffySpeciesId: 'spike',
    rewardPacksRarity: 'rare',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['spot', 'cow', 'george']),
  },

  // Main Mission 6: Sector 18 (Necak's Patio Pathway - Rescuing Spot)
  m_patio_spot: {
    id: 'm_patio_spot',
    sectorId: 18,
    title: "The Neighbor's Flagstones",
    synopsis: "Spike rolls along the flagstones to scatter the garden gnomes trapping Spot on Necak's patio!",
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 7,
    questType: 'main',
    requiredSpeciesIds: ['spike'],
    outroDialogueId: 'rescue_spot',
    unlockStuffySpeciesId: 'spot',
    rewardPacksRarity: 'rare',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['allie', 'george', 'cow']),
  },

  // Main Mission 7: Sector 20 (Necak's House Sanctuary - Rescuing Cow at Necak's House!)
  m_necak_house_cow: {
    id: 'm_necak_house_cow',
    sectorId: 20,
    title: "Necak's Barnyard Sanctuary",
    synopsis: "Spot tracks the trail directly into Necak's red barn to defeat the Hay Baler Titan and rescue Cow!",
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 8,
    questType: 'main',
    requiredSpeciesIds: ['spot'],
    outroDialogueId: 'rescue_cow',
    unlockStuffySpeciesId: 'cow',
    rewardPacksRarity: 'epic',
    rewardPacksCount: 3,
    floors: createFloors(3, 9, ['shadow', 'spike', 'spot'], 'weed_whacker'),
  },

  // Main Mission 8: Sector 24 (Apartment Lobby Entrance - Rescuing Cydney)
  m_apt_cydney: {
    id: 'm_apt_cydney',
    sectorId: 24,
    title: 'The High-Rise Foyer',
    synopsis: 'Cow stampedes through the revolving doors of the apartment building to rescue Cydney from the front desk!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 10,
    questType: 'main',
    requiredSpeciesIds: ['cow'],
    outroDialogueId: 'rescue_cydney',
    unlockStuffySpeciesId: 'cidney',
    rewardPacksRarity: 'rare',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['alex', 'shadow', 'cow']),
  },

  // Main Mission 9: Sector 31 (Apartment 2nd Floor Breezeway - Rescuing Chantiera)
  m_apt_chantiera: {
    id: 'm_apt_chantiera',
    sectorId: 31,
    title: 'Windy Balcony Chords',
    synopsis: 'Cydney leaps across the windy apartment balconies to free Chantiera from mechanical storm gulls!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 12,
    questType: 'main',
    requiredSpeciesIds: ['cidney'],
    outroDialogueId: 'rescue_chantiera',
    unlockStuffySpeciesId: 'chanteira',
    rewardPacksRarity: 'rare',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['george', 'alex', 'shadow']),
  },

  // Main Mission 10: Sector 70 (Upgel Didav in the Ocean - Rescuing Dolphy at Upgel Didav!)
  m_ocean_dolphy: {
    id: 'm_ocean_dolphy',
    sectorId: 70,
    title: 'The Coral Citadel of Upgel Didav',
    synopsis: 'Chantiera sings a nautical anthem to breach the sunken coral gates of Upgel Didav and rescue Dolphy!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 15,
    questType: 'main',
    requiredSpeciesIds: ['chanteira'],
    outroDialogueId: 'rescue_dolphy',
    unlockStuffySpeciesId: 'dolphy',
    rewardPacksRarity: 'epic',
    rewardPacksCount: 3,
    floors: createFloors(3, 9, ['finlee', 'allie', 'chanteira'], 'aquatic_ray'),
  },

  // Main Mission 11: Sector 52 (Beach Golden Shoreline - Rescuing Allie)
  m_beach_allie: {
    id: 'm_beach_allie',
    sectorId: 52,
    title: 'Tidal Driftwood Shoals',
    synopsis: 'Dolphy rides the ocean surf up onto the golden sands to rescue Allie from clamping hermit crabs!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 18,
    questType: 'main',
    requiredSpeciesIds: ['dolphy'],
    outroDialogueId: 'rescue_allie',
    unlockStuffySpeciesId: 'allie',
    rewardPacksRarity: 'epic',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['allie', 'spot', 'riolu']),
  },

  // Main Mission 12: Sector 38 (Wild Forest Bramble - Rescuing Sluger)
  m_forest_sluger: {
    id: 'm_forest_sluger',
    sectorId: 38,
    title: 'Thornwoods Fortress',
    synopsis: 'Allie chomps through the thick briars guarding the Wild Forest perimeter to liberate Sluger!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 22,
    questType: 'main',
    requiredSpeciesIds: ['allie'],
    outroDialogueId: 'rescue_sluger',
    unlockStuffySpeciesId: 'sluger',
    rewardPacksRarity: 'epic',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['shadow', 'fifi', 'sluger']),
  },

  // Main Mission 13: Sector 48 (Wild Forest Canopy - Rescuing Fifi)
  m_forest_fifi: {
    id: 'm_forest_fifi',
    sectorId: 48,
    title: 'Deep Canopy Haze',
    synopsis: 'Sluger leads an armored march into the deep woods to find Fifi generating toxic smoke in the hollow logs!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 25,
    questType: 'main',
    requiredSpeciesIds: ['sluger'],
    outroDialogueId: 'rescue_fifi',
    unlockStuffySpeciesId: 'fifi',
    rewardPacksRarity: 'epic',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['fifi', 'shadow', 'george']),
  },

  // Main Mission 14: Sector 50 (Great Treetop Lookout - Rescuing George)
  m_forest_george: {
    id: 'm_forest_george',
    sectorId: 50,
    title: 'The Ancient Hollow Oak',
    synopsis: 'Fifi blankets the towering treetop with dense gas clouds to disorient the rogue owls holding George!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 28,
    questType: 'main',
    requiredSpeciesIds: ['fifi'],
    outroDialogueId: 'rescue_george',
    unlockStuffySpeciesId: 'george',
    rewardPacksRarity: 'epic',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['george', 'allie', 'shadow']),
  },

  // Main Mission 15: Sector 54 (Beach Umbrella Camp - Rescuing Rialou)
  m_beach_riolu: {
    id: 'm_beach_riolu',
    sectorId: 54,
    title: 'The Sunlit Dune Pavilion',
    synopsis: 'George swings down from the forest edge into the beach umbrellas to help Rialou channel his Aura Palm!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 32,
    questType: 'main',
    requiredSpeciesIds: ['george'],
    outroDialogueId: 'rescue_riolu',
    unlockStuffySpeciesId: 'riolu',
    rewardPacksRarity: 'epic',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['riolu', 'thumper', 'allie']),
  },

  // Main Mission 16: Sector 62 (Tide Pool Shallows - Rescuing Thumper)
  m_beach_thumper: {
    id: 'm_beach_thumper',
    sectorId: 62,
    title: 'Saltwater Hopscotch',
    synopsis: 'Rialou detects Thumper hopping rapidly across treacherous wet boulders surrounded by whirlpools!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 35,
    questType: 'main',
    requiredSpeciesIds: ['riolu'],
    outroDialogueId: 'rescue_thumper',
    unlockStuffySpeciesId: 'thumper',
    rewardPacksRarity: 'epic',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['thumper', 'allie', 'spot']),
  },

  // Main Mission 17: Sector 67 (Bioluminescent Trench - Rescuing Toothless)
  m_ocean_toothless: {
    id: 'm_ocean_toothless',
    sectorId: 67,
    title: 'Neon Abyssal Trench',
    synopsis: 'Thumper leaps into the deep waters where Toothless is blasting glowing jellyfish with plasma fire!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 40,
    questType: 'main',
    requiredSpeciesIds: ['thumper'],
    outroDialogueId: 'rescue_toothless',
    unlockStuffySpeciesId: 'toothless',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['toothless', 'beaker', 'finlee']),
  },

  // Main Mission 18: Sector 77 (Ocean Deep Trench - Rescuing Beaker)
  m_ocean_beaker: {
    id: 'm_ocean_beaker',
    sectorId: 77,
    title: 'The Bathysphere Lab',
    synopsis: 'Toothless dives to the oceanic floor to crack open the pressurized diving bell holding Beaker!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 45,
    questType: 'main',
    requiredSpeciesIds: ['toothless'],
    outroDialogueId: 'rescue_beaker',
    unlockStuffySpeciesId: 'beaker',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['beaker', 'finlee', 'dolphy']),
  },

  // Main Mission 19: Sector 82 (Suburb Oak Avenue - Rescuing Eevee)
  m_suburb_eevee: {
    id: 'm_suburb_eevee',
    sectorId: 82,
    title: 'Runaway Bicycle Basket',
    synopsis: 'Beaker concocts a speed potion to catch up to the speeding toy bicycle carrying Eevee!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 50,
    questType: 'main',
    requiredSpeciesIds: ['beaker'],
    outroDialogueId: 'rescue_eevee',
    unlockStuffySpeciesId: 'eevee',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['eevee', 'dear', 'alex']),
  },

  // Main Mission 20: Sector 84 (Suburb Cul-de-Sac - Rescuing Dear)
  m_suburb_dear: {
    id: 'm_suburb_dear',
    sectorId: 84,
    title: 'Quiet Street Roadblock',
    synopsis: 'Eevee uses Swift stars to dismantle the mechanical toy police cars cornering Dear in the cul-de-sac!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 55,
    questType: 'main',
    requiredSpeciesIds: ['eevee'],
    outroDialogueId: 'rescue_dear',
    unlockStuffySpeciesId: 'dear',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['dear', 'eevee', 'shadow']),
  },

  // Main Mission 21: Sector 86 (Playground Jungle Gym - Rescuing Cole)
  m_playground_cole: {
    id: 'm_playground_cole',
    sectorId: 86,
    title: 'The Metal Climbing Spire',
    synopsis: 'Dear charges onto the playground mulch to reinforce Cole holding off playground toy bullies!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 60,
    questType: 'main',
    requiredSpeciesIds: ['dear'],
    outroDialogueId: 'rescue_cole',
    unlockStuffySpeciesId: 'cole',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['cole', 'henry', 'thumper']),
  },

  // Main Mission 22: Sector 88 (Mega Spiral Slide - Rescuing Henry)
  m_playground_henry: {
    id: 'm_playground_henry',
    sectorId: 88,
    title: 'Summit of the Spiral Tube',
    synopsis: 'Cole climbs up the giant green tube slide to rescue Henry from swirling playground winds!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 65,
    questType: 'main',
    requiredSpeciesIds: ['cole'],
    outroDialogueId: 'rescue_henry',
    unlockStuffySpeciesId: 'henry',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['henry', 'cole', 'allie']),
  },

  // Main Mission 23: Sector 92 (Astral Star Bridge - Rescuing Pinky Bear)
  m_astral_pinky: {
    id: 'm_astral_pinky',
    sectorId: 92,
    title: 'The Celestial Threadway',
    synopsis: 'Henry plants his banner on the starry bridge to shield Pinky Bear from cosmic thread gusts!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 70,
    questType: 'main',
    requiredSpeciesIds: ['henry'],
    outroDialogueId: 'rescue_pinky_bear',
    unlockStuffySpeciesId: 'pinky_bear',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['pinky_bear', 'big_bear', 'umbreon']),
  },

  // Main Mission 24: Sector 96 (Astral Nebula Spire - Rescuing Big Bear)
  m_astral_bigbear: {
    id: 'm_astral_bigbear',
    sectorId: 96,
    title: 'Nebula Claws of Stardust',
    synopsis: 'Pinky Bear provides cuddly moral support as the team climbs the spire to fight alongside Big Bear!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 75,
    questType: 'main',
    requiredSpeciesIds: ['pinky_bear'],
    outroDialogueId: 'rescue_big_bear',
    unlockStuffySpeciesId: 'big_bear',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['big_bear', 'umbreon', 'alex']),
  },

  // Main Mission 25: Sector 99 (Citadel Gates - Rescuing Umbreon)
  m_astral_umbreon: {
    id: 'm_astral_umbreon',
    sectorId: 99,
    title: 'Moonlight at the Obsidian Gate',
    synopsis: 'Big Bear roars as the team shatters the dark seals to free Umbreon, completing the rescue of all 25 friends!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 78,
    questType: 'main',
    requiredSpeciesIds: ['big_bear'],
    outroDialogueId: 'rescue_umbreon',
    unlockStuffySpeciesId: 'umbreon',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 2,
    floors: createFloors(3, 9, ['umbreon', 'big_bear', 'pinky_bear']),
  },

  // Grand Finale: Sector 100 (The Stitchmaster's Citadel)
  m_stitchmaster_finale: {
    id: 'm_stitchmaster_finale',
    sectorId: 100,
    title: "The Stitchmaster's Cosmic Throne",
    synopsis: 'All 26 plushies stand united against the Stitchmaster to restore peace to Ben\'s world!',
    totalActs: 3,
    totalFloors: 10,
    recommendedLevel: 80,
    questType: 'main',
    requiredSpeciesIds: ['umbreon'],
    outroDialogueId: 'finale_stitchmaster',
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 3,
    floors: createFloors(3, 10, ['umbreon', 'big_bear', 'jefe', 'alex', 'shadow'], 'stitchmaster_final'),
  },

  // --- SIDE QUESTS ---
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

  // Side Quest: Sector 5 (Attic Trunk Cache - Requires Alex)
  sq_attic_squeaker: {
    id: 'sq_attic_squeaker',
    sectorId: 5,
    title: 'Side Quest: The Forgotten Squeaker',
    synopsis: 'Rummage through dusty steamer trunks to recover a golden vintage squeaker guarded by clockwork mice!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 3,
    questType: 'side',
    requiredSpeciesIds: ['alex'],
    rewardPacksRarity: 'rare',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['spot', 'allie', 'george']),
  },

  // Side Quest: Sector 7 (Necak's Woodpile - Requires Shadow)
  sq_shed_raven: {
    id: 'sq_shed_raven',
    sectorId: 7,
    title: "Side Quest: Raven's Shiny Cache",
    synopsis: "Shadow sneaks through Necak's woodpile to recover shiny card packs stolen by garden ravens!",
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 4,
    questType: 'side',
    requiredSpeciesIds: ['shadow'],
    rewardPacksRarity: 'rare',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['george', 'allie', 'spot']),
  },

  // Side Quest: Sector 11 (Hallway Clues - Requires Finlee)
  sq_hallway_clues: {
    id: 'sq_hallway_clues',
    sectorId: 11,
    title: 'Side Quest: Hallway Clue Hunt',
    synopsis: 'Finlee searches the baseboards for shredded card fragments dropped by fleeing thread mice!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 5,
    questType: 'side',
    requiredSpeciesIds: ['finlee'],
    rewardPacksRarity: 'rare',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['spot', 'cow', 'george']),
  },

  // Side Quest: Sector 14 (Garden Hose Labyrinth - Requires Slugmee)
  sq_hose_labyrinth: {
    id: 'sq_hose_labyrinth',
    sectorId: 14,
    title: 'Side Quest: The Great Hose Knot',
    synopsis: 'Slugmee uses slippery slime to untangle the giant green garden hose guarded by sprinkler bots!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 6,
    questType: 'side',
    requiredSpeciesIds: ['slugmee'],
    rewardPacksRarity: 'rare',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['allie', 'spot', 'george']),
  },

  // Side Quest: Sector 22 (Treehouse Spyglass - Requires Spot & Cow)
  sq_treehouse_spyglass: {
    id: 'sq_treehouse_spyglass',
    sectorId: 22,
    title: 'Side Quest: Spyglass Fluff Patrol',
    synopsis: 'Spot and Cow set up an observation post in the treehouse overlooking the apartment complex!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 10,
    questType: 'side',
    requiredSpeciesIds: ['spot', 'cow'],
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['shadow', 'cow', 'george', 'allie']),
  },

  // Side Quest: Sector 33 (Apartment Mailbox Mystery - Requires Cidney)
  sq_mailbox_mystery: {
    id: 'sq_mailbox_mystery',
    sectorId: 33,
    title: 'Side Quest: The Brass Mailbox Bank',
    synopsis: 'Cydney picks open jammed brass apartment mailboxes stuffed with ancient collector packs!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 14,
    questType: 'side',
    requiredSpeciesIds: ['cidney'],
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['alex', 'shadow', 'cow']),
  },

  // Side Quest: Sector 42 (Water Tower Perch - Requires Chanteira)
  sq_water_tower: {
    id: 'sq_water_tower',
    sectorId: 42,
    title: 'Side Quest: High-Rise Water Tower',
    synopsis: 'Chantiera perches atop the rooftop water tank singing to soothe mechanical rooftop pigeons!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 16,
    questType: 'side',
    requiredSpeciesIds: ['chanteira'],
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['george', 'alex', 'shadow']),
  },

  // Side Quest: Sector 60 (Dolphin Wave Crest - Requires Dolphy)
  sq_dolphin_crest: {
    id: 'sq_dolphin_crest',
    sectorId: 60,
    title: 'Side Quest: Tidal Wave Slalom',
    synopsis: 'Dolphy races across frothing tidal swells to retrieve a floating message in a bottle!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 20,
    questType: 'side',
    requiredSpeciesIds: ['dolphy'],
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['dolphy', 'finlee', 'allie']),
  },

  // Side Quest: Sector 64 (Seashell Sandbar - Requires Allie)
  sq_seashell_sandbar: {
    id: 'sq_seashell_sandbar',
    sectorId: 64,
    title: 'Side Quest: The Iridescent Sandbar',
    synopsis: 'Allie wades through low-tide shallows to dig up shimmering mother-of-pearl packs!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 25,
    questType: 'side',
    requiredSpeciesIds: ['allie'],
    rewardPacksRarity: 'epic',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['allie', 'thumper', 'riolu']),
  },

  // Side Quest: Sector 83 (Yellow Fire Hydrant Corner - Requires Riolu & Eevee)
  sq_hydrant_corner: {
    id: 'sq_hydrant_corner',
    sectorId: 83,
    title: 'Side Quest: The Hydrant Geyser',
    synopsis: 'Rialou and Eevee team up to cap an exploding neighborhood fire hydrant soaking the street!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 45,
    questType: 'side',
    requiredSpeciesIds: ['riolu', 'eevee'],
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['eevee', 'riolu', 'dear']),
  },

  // Side Quest: Sector 89 (Monkey Bar Challenge - Requires Cole & Henry)
  sq_monkey_bars: {
    id: 'sq_monkey_bars',
    sectorId: 89,
    title: 'Side Quest: Monkey Bar Gauntlet',
    synopsis: 'Cole and Henry swing bar-by-bar across the playground obstacle course for legendary loot!',
    totalActs: 3,
    totalFloors: 9,
    recommendedLevel: 62,
    questType: 'side',
    requiredSpeciesIds: ['cole', 'henry'],
    rewardPacksRarity: 'legendary',
    rewardPacksCount: 1,
    floors: createFloors(3, 9, ['cole', 'henry', 'allie']),
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
