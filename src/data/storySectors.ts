/**
 * Story Mode 10x10 Sector Grid Map (100 Sectors)
 * Coordinates (X: 1-10, Y: 1-10) with thematic biomes, landmarks, and area bosses.
 */

import { StorySector, SectorBiome, QuestType } from '@/types/story';

export const SECTOR_GRID_WIDTH = 10;
export const SECTOR_GRID_HEIGHT = 10;
export const TOTAL_SECTORS = 100;

export const MAIN_QUEST_SECTOR_IDS = new Set<number>([
  2, 4, 6, 8, 9, 10, 13, 17, 20, 25, 35, 40, 50, 65, 80, 85, 100,
]);

export const SIDE_QUEST_SECTOR_IDS = new Set<number>([
  3, 5, 7, 11, 14, 22, 30, 45, 58, 72, 82,
]);

function getBiomeForSector(id: number): SectorBiome {
  if (id === 3) return 'backyard';
  if (id <= 10) return 'house';
  if (id <= 25) return 'backyard';
  if (id <= 40) return 'suburb';
  if (id <= 55) return 'playground';
  if (id <= 65) return 'forest';
  if (id <= 75) return 'sewer';
  if (id <= 85) return 'factory';
  return 'astral';
}

function getIconForBiome(biome: SectorBiome, id: number): string {
  if (id === 2) return '🏠'; // The House (Start)
  if (id === 3) return '🌳'; // The Backyard (Always Accessible)
  if (id === 100) return '👑'; // The Stitchmaster's Citadel
  switch (biome) {
    case 'house':
      return '🛋️';
    case 'backyard':
      return '🌿';
    case 'suburb':
      return '🏘️';
    case 'playground':
      return '🛝';
    case 'forest':
      return '🌲';
    case 'sewer':
      return '🕳️';
    case 'factory':
      return '⚙️';
    case 'astral':
      return '🌌';
    default:
      return '📍';
  }
}

// Landmark Boss Sectors
const BOSS_SECTORS: Record<number, { bossSpeciesId: string; bossName: string }> = {
  10: { bossSpeciesId: 'vacuum_beast', bossName: 'The Dust Gobbler' },
  20: { bossSpeciesId: 'weed_whacker', bossName: 'Thorny Briar King' },
  35: { bossSpeciesId: 'street_hound', bossName: 'Stray Scrapper Rex' },
  50: { bossSpeciesId: 'sand_serpent', bossName: 'The Sandbox Titan' },
  65: { bossSpeciesId: 'amalgam', bossName: 'Shadow of the Pines' },
  80: { bossSpeciesId: 'shredder_prime', bossName: 'Cogwheel Overseer' },
  100: { bossSpeciesId: 'stitchmaster_final', bossName: 'The Stitchmaster' },
};

// Biome Level Tiers:
// House (1-10): Lv. 1-5
// Backyard (11-25): Lv. 5-12
// Suburb (26-40): Lv. 12-20
// Playground (41-55): Lv. 20-30
// Forest (56-65): Lv. 30-40
// Sewer (66-75): Lv. 40-50
// Factory (76-85): Lv. 50-65
// Astral (86-100): Lv. 65-80
export function getRecommendedLevel(biome: SectorBiome, id: number): number {
  switch (biome) {
    case 'house':
      return Math.min(5, Math.max(1, Math.round(1 + ((id - 1) / 9) * 4)));
    case 'backyard':
      return Math.min(12, Math.max(5, Math.round(5 + ((id - 11) / 14) * 7)));
    case 'suburb':
      return Math.min(20, Math.max(12, Math.round(12 + ((id - 26) / 14) * 8)));
    case 'playground':
      return Math.min(30, Math.max(20, Math.round(20 + ((id - 41) / 14) * 10)));
    case 'forest':
      return Math.min(40, Math.max(30, Math.round(30 + ((id - 56) / 9) * 10)));
    case 'sewer':
      return Math.min(50, Math.max(40, Math.round(40 + ((id - 66) / 9) * 10)));
    case 'factory':
      return Math.min(65, Math.max(50, Math.round(50 + ((id - 76) / 9) * 15)));
    case 'astral':
      return Math.min(80, Math.max(65, Math.round(65 + ((id - 86) / 14) * 15)));
    default:
      return 1;
  }
}

// Generates all 100 sectors deterministically
export const STORY_SECTORS: StorySector[] = Array.from({ length: TOTAL_SECTORS }, (_, idx) => {
  const id = idx + 1;
  const x = ((id - 1) % SECTOR_GRID_WIDTH) + 1;
  const y = Math.floor((id - 1) / SECTOR_GRID_WIDTH) + 1;
  const biome = getBiomeForSector(id);
  const icon = getIconForBiome(biome, id);
  const boss = BOSS_SECTORS[id];
  const recommendedLevel = getRecommendedLevel(biome, id);
  const questType: QuestType | undefined = MAIN_QUEST_SECTOR_IDS.has(id)
    ? 'main'
    : SIDE_QUEST_SECTOR_IDS.has(id)
    ? 'side'
    : undefined;

  // Sector Names & Descriptions
  let name = `Sector ${id}: ${biome.toUpperCase()} ${x}-${y}`;
  let description = `Outer district of the ${biome} region. Scout for lost plushies and threads.`;
  let isAlwaysAccessible = false;

  if (id === 2) {
    name = 'Sector 2: The House';
    description = "Ben's cozy living room and bedroom. Where Jefe awoke alone to find all other plushies missing!";
  } else if (id === 3) {
    name = 'Sector 3: The Backyard';
    description = 'The sprawling backyard lawn. Always open for non-canon training, testing, and bonus card grinding!';
    isAlwaysAccessible = true;
  } else if (id === 1) {
    name = 'Sector 1: Front Porch';
    description = 'The welcoming porch overlooking the quiet street, littered with autumn leaves.';
  } else if (id === 4) {
    name = 'Sector 4: Kitchen Pantry';
    description = 'High wooden shelves where crackers and snack crumbs are guarded by rogue wooden mice.';
  } else if (id === 5) {
    name = 'Sector 5: Attic Stairwell';
    description = 'Creaky, dusty floorboards leading into the forgotten attic trunks.';
  } else if (id === 6) {
    name = 'Sector 6: Workshop Basement';
    description = 'Workbench where needle, thread, and the Equipment Armory await discovery!';
  } else if (id === 9) {
    name = 'Sector 9: The Astral Star Chamber';
    description = 'Ancient cosmic laboratory where Stuffy Cards fuse together into higher stars.';
  } else if (id === 10) {
    name = 'Sector 10: Living Room Threshold';
    description = 'The boundary where The Dust Gobbler guards the door to the outside world.';
  } else if (id === 13) {
    name = 'Sector 13: The Fairy Well';
    description = 'A mystical glowing birdbath well where sacrificing Stuffy Cards permanently boosts Espers!';
  } else if (id === 17) {
    name = 'Sector 17: Sandpit Overpass';
    description = 'Crumbling playground sands where captured plushies call out for help!';
  } else if (id === 25) {
    name = 'Sector 25: Treehouse Keep';
    description = 'A fortified wooden lookout towering above the overgrown garden.';
  } else if (id === 40) {
    name = 'Sector 40: Storm Drain Junction';
    description = 'A flooded concrete culvert echoed by the cries of trapped sewer plushies.';
  } else if (id === 65) {
    name = 'Sector 65: Heart of the Whispering Pines';
    description = 'The deepest shadow of the forest where the ancient Amalgam lurks.';
  } else if (id === 85) {
    name = 'Sector 85: The Scrap Shredder';
    description = 'The roaring machinery of the abandoned toy factory grinding fluff into cinders.';
  } else if (id === 100) {
    name = "Sector 100: The Stitchmaster's Citadel";
    description = 'The cosmic throne room of threads. Defeat the Stitchmaster to restore all 27 plush friends!';
  }

  return {
    id,
    x,
    y,
    name,
    biome,
    description,
    recommendedLevel,
    questType,
    isAlwaysAccessible,
    bossSpeciesId: boss?.bossSpeciesId,
    bossName: boss?.bossName,
    icon,
  };
});

export const SECTOR_MAP = new Map<number, StorySector>(
  STORY_SECTORS.map((s) => [s.id, s])
);

export function getSectorById(id: number): StorySector | undefined {
  return SECTOR_MAP.get(id);
}

// Determines the active story narrative objective on the 10x10 map
export function getCurrentStoryObjectiveSectorId(clearedSectorIds: number[]): number {
  const storyPath = [2, 4, 6, 8, 9, 10, 13, 17, 20, 25, 35, 40, 50, 65, 80, 85, 100];
  for (const sId of storyPath) {
    if (!clearedSectorIds.includes(sId)) {
      return sId;
    }
  }
  return 100;
}
