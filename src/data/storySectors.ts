/**
 * Story Mode 10x10 Sector Grid Map (100 Sectors)
 * Coordinates (X: 1-10, Y: 1-10) with thematic biomes, landmarks, and area bosses.
 */

import { StorySector, SectorBiome } from '@/types/story';

export const SECTOR_GRID_WIDTH = 10;
export const SECTOR_GRID_HEIGHT = 10;
export const TOTAL_SECTORS = 100;

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

// Generates all 100 sectors deterministically
export const STORY_SECTORS: StorySector[] = Array.from({ length: TOTAL_SECTORS }, (_, idx) => {
  const id = idx + 1;
  const x = ((id - 1) % SECTOR_GRID_WIDTH) + 1;
  const y = Math.floor((id - 1) / SECTOR_GRID_WIDTH) + 1;
  const biome = getBiomeForSector(id);
  const icon = getIconForBiome(biome, id);
  const boss = BOSS_SECTORS[id];

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
