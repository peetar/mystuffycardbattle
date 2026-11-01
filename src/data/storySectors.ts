/**
 * Story Mode 10x10 Sector Grid Map (100 Sectors)
 * Coordinates (X: 1-10, Y: 1-10) with 2D contiguous clustered biomes,
 * thematic outdoor adventure landmarks (Necak's House, Upgel Didav, Wild Forest, Beach, Ocean, Apartments),
 * and progressive story progression.
 */

import { StorySector, SectorBiome, QuestType } from '@/types/story';

export const SECTOR_GRID_WIDTH = 10;
export const SECTOR_GRID_HEIGHT = 10;
export const TOTAL_SECTORS = 100;

// The ordered sequence of main story narrative objectives
export const STORY_MAIN_QUEST_PATH = [
  2,  // 1. Alex (The House Start)
  4,  // 2. Shadow (Backyard Garden)
  6,  // 3. Finlee + Armory 1/16 (Workshop Shed)
  9,  // Milestone 3/32: Astral Lab (Necak's Star Workshop)
  13, // Milestone 1/8: Fairy Well (Enchanted Birdbath)
  15, // 4. Slugmee (Flowerbed Thicket)
  16, // 5. Spike (Stepping Stone Path)
  18, // 6. Spot (Necak's Patio Pathway)
  20, // 7. Cow (Necak's House Sanctuary)
  24, // 8. Cydney (Apartment Lobby Entrance)
  31, // 9. Chantiera (Apartment Breezeway)
  70, // 10. Dolphy (Upgel Didav in the Ocean)
  52, // 11. Allie (Beach Shoreline)
  38, // 12. Sluger (Wild Forest Bramble)
  48, // 13. Fifi (Wild Forest Canopy)
  50, // 14. George (Wild Forest Lookout)
  54, // 15. Rialou / Riolu (Beach Umbrella Camp)
  62, // 16. Thumper (Beach Tide Pools)
  67, // 17. Toothless (Ocean Bioluminescent Trench)
  77, // 18. Beaker (Ocean Deep Trench)
  82, // 19. Eevee (Suburb Oak Avenue)
  84, // 20. Dear (Suburb Cul-de-Sac)
  86, // 21. Cole (Playground Jungle Gym)
  88, // 22. Henry (Playground Spiral Slide)
  92, // 23. Pinky Bear (Astral Star Bridge)
  96, // 24. Big Bear (Astral Nebula Spire)
  99, // 25. Umbreon (Citadel Gates)
  100 // The Stitchmaster's Citadel (Grand Finale)
];

export const MAIN_QUEST_SECTOR_IDS = new Set<number>(STORY_MAIN_QUEST_PATH);

export const SIDE_QUEST_SECTOR_IDS = new Set<number>([
  3, 5, 7, 11, 14, 22, 33, 42, 60, 64, 83, 89
]);

/**
 * 2D Contiguous Clustered Biomes on the 10x10 Grid (X: 1..10, Y: 1..10):
 * - House (x: 1..2, y: 1..2)
 * - Backyard (x: 3..6, y: 1..2)
 * - Necak's House (x: 7..10, y: 1..2)
 * - Apartment Area (x: 1..5, y: 3..5)
 * - Wild Forest (x: 6..10, y: 3..5)
 * - Beach (x: 1..5, y: 6..8)
 * - Ocean & Upgel Didav (x: 6..10, y: 6..8)
 * - Suburb (x: 1..5, y: 9)
 * - Playground (x: 6..10, y: 9)
 * - Astral Domain & Citadel (x: 1..10, y: 10)
 */
export function getBiomeForSector(id: number): SectorBiome {
  const x = ((id - 1) % SECTOR_GRID_WIDTH) + 1;
  const y = Math.floor((id - 1) / SECTOR_GRID_WIDTH) + 1;

  if (y <= 2 && x <= 2) return 'house';
  if (y <= 2 && x <= 6) return 'backyard';
  if (y <= 2 && x >= 7) return 'necak_house';
  if (y >= 3 && y <= 5 && x <= 5) return 'apartment';
  if (y >= 3 && y <= 5 && x >= 6) return 'wild_forest';
  if (y >= 6 && y <= 8 && x <= 5) return 'beach';
  if (y >= 6 && y <= 8 && x >= 6) return 'ocean';
  if (y === 9 && x <= 5) return 'suburb';
  if (y === 9 && x >= 6) return 'playground';
  return 'astral';
}

export function getIconForBiome(biome: SectorBiome, id: number): string {
  if (id === 2) return '🏠'; // The House (Start)
  if (id === 3) return '🌳'; // The Backyard (Always Accessible)
  if (id === 9) return '🔮'; // Evolution Lab
  if (id === 13) return '⛲'; // Fairy Well
  if (id === 20) return '🐄'; // Necak's House (Cow)
  if (id === 70) return '🐬'; // Upgel Didav in Ocean (Dolphy)
  if (id === 100) return '👑'; // Stitchmaster's Citadel
  switch (biome) {
    case 'house':
      return '🛋️';
    case 'backyard':
      return '🌿';
    case 'necak_house':
      return '🏡';
    case 'apartment':
      return '🏢';
    case 'wild_forest':
      return '🌲';
    case 'beach':
      return '🏖️';
    case 'ocean':
      return '🌊';
    case 'suburb':
      return '🏘️';
    case 'playground':
      return '🛝';
    case 'astral':
      return '🌌';
    default:
      return '📍';
  }
}

// Landmark Boss Sectors
const BOSS_SECTORS: Record<number, { bossSpeciesId: string; bossName: string }> = {
  20: { bossSpeciesId: 'weed_whacker', bossName: "Necak's Hay Baler Titan" },
  35: { bossSpeciesId: 'street_hound', bossName: 'Stray Scrapper Rex' },
  40: { bossSpeciesId: 'amalgam', bossName: 'Shadow of the Pines' },
  65: { bossSpeciesId: 'sand_serpent', bossName: 'The Sandbar Titan' },
  70: { bossSpeciesId: 'aquatic_ray', bossName: 'Manta of Upgel Didav' },
  80: { bossSpeciesId: 'aquatic_kraken', bossName: 'Abyssal Kraken' },
  100: { bossSpeciesId: 'stitchmaster_final', bossName: 'The Stitchmaster' },
};

export function getRecommendedLevel(biome: SectorBiome, id: number): number {
  switch (biome) {
    case 'house':
      return Math.min(3, Math.max(1, Math.round(1 + ((id - 1) / 9) * 2)));
    case 'backyard':
      return Math.min(6, Math.max(3, Math.round(3 + ((id - 3) / 13) * 3)));
    case 'necak_house':
      return Math.min(10, Math.max(6, Math.round(6 + ((id - 7) / 13) * 4)));
    case 'apartment':
      return Math.min(18, Math.max(10, Math.round(10 + ((id - 21) / 24) * 8)));
    case 'wild_forest':
      return Math.min(28, Math.max(18, Math.round(18 + ((id - 26) / 24) * 10)));
    case 'beach':
      return Math.min(38, Math.max(28, Math.round(28 + ((id - 51) / 24) * 10)));
    case 'ocean':
      return Math.min(50, Math.max(38, Math.round(38 + ((id - 56) / 24) * 12)));
    case 'suburb':
      return Math.min(60, Math.max(50, Math.round(50 + ((id - 81) / 4) * 10)));
    case 'playground':
      return Math.min(70, Math.max(60, Math.round(60 + ((id - 86) / 4) * 10)));
    case 'astral':
      return Math.min(80, Math.max(70, Math.round(70 + ((id - 91) / 9) * 10)));
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

  let name = `Sector ${id}: ${biome.replace('_', ' ').toUpperCase()} (${x},${y})`;
  let description = `Outdoor adventure area in the ${biome.replace('_', ' ')} region.`;
  let isAlwaysAccessible = false;

  if (id === 2) {
    name = 'Sector 2: The House (Start)';
    description = "Ben's bedroom and living room. Jefe awoke alone to find all other plushies taken outside!";
  } else if (id === 3) {
    name = 'Sector 3: The Backyard (Grind & Test Sanctuary)';
    description = 'The sunny backyard lawn. Always open for non-canon training, testing new presets, and card farming!';
    isAlwaysAccessible = true;
  } else if (id === 1) {
    name = 'Sector 1: Front Porch';
    description = 'The wooden steps looking out onto the great outside world.';
  } else if (id === 4) {
    name = 'Sector 4: Vegetable Garden';
    description = 'Overgrown lettuce rows and wooden planter boxes where Shadow is caught in cobwebs.';
  } else if (id === 6) {
    name = 'Sector 6: Workshop Shed (Armory 1/16)';
    description = 'The rustic backyard shed where the Equipment Armory is stored, and Finlee is trapped!';
  } else if (id === 9) {
    name = "Sector 9: Necak's Star Workshop (Lab 3/32)";
    description = "An astral table glowing with star energy where 1★+1★ cards fuse into higher stars!";
  } else if (id === 13) {
    name = 'Sector 13: The Fairy Well (Fairy Well 1/8)';
    description = 'An enchanted birdbath where duplicate Stuffy Cards can be sacrificed for permanent Esper boosts!';
  } else if (id === 15) {
    name = 'Sector 15: Flowerbed Thicket';
    description = 'Thorny rose roots and bumblebee hives where Slugmee needs rescue!';
  } else if (id === 16) {
    name = 'Sector 16: Stepping Stone Path';
    description = 'Smooth mossy stones winding toward the neighboring property where Spike is cornered!';
  } else if (id === 18) {
    name = "Sector 18: Necak's Patio Pathway";
    description = 'Flagstone walkway leading to the neighbor house where Spot is held by rogue garden gnomes!';
  } else if (id === 20) {
    name = "Sector 20: Necak's House Sanctuary";
    description = "Necak's rustic property and red barn where Cow is guarded by the Hay Baler Titan!";
  } else if (id === 24) {
    name = 'Sector 24: Apartment Lobby Entrance';
    description = 'Tiled entryway of the tall brick apartment building where Cydney is trapped behind the front desk.';
  } else if (id === 31) {
    name = 'Sector 31: Apartment 2nd Floor Breezeway';
    description = 'Windy concrete breezeway connecting apartment balconies where Chantiera awaits rescue!';
  } else if (id === 35) {
    name = 'Sector 35: Stray Cat Overpass';
    description = 'High brick fire escape where Stray Scrapper Rex guards the passage down to the woods.';
  } else if (id === 38) {
    name = 'Sector 38: Wild Forest Bramble';
    description = 'Dense thorny underbrush at the edge of the wild woods where Sluger is pinned down!';
  } else if (id === 40) {
    name = 'Sector 40: Whispering Pines Junction';
    description = 'Dark forest glade haunted by the Shadow of the Pines.';
  } else if (id === 48) {
    name = 'Sector 48: Deep Canopy Grove';
    description = 'Sunbeams piercing through ancient mossy branches where Fifi is surrounded by wild critters!';
  } else if (id === 50) {
    name = 'Sector 50: Great Treetop Lookout';
    description = 'The highest branch overlooking the distant ocean shore where George is perched in danger!';
  } else if (id === 52) {
    name = 'Sector 52: Beach Golden Shoreline';
    description = 'Sunlit sandy shoreline where Allie is marooned amongst tidal driftwood!';
  } else if (id === 54) {
    name = 'Sector 54: Beach Umbrella Camp';
    description = 'Colorful striped beach umbrellas fluttering in the sea breeze where Rialou is cornered!';
  } else if (id === 62) {
    name = 'Sector 62: Tide Pool Shallows';
    description = 'Glistening saltwater rock pools full of hermit crabs where Thumper is marooned!';
  } else if (id === 67) {
    name = 'Sector 67: Bioluminescent Trench';
    description = 'Glowing underwater reefs and neon jellyfish where Toothless is entangled in kelp!';
  } else if (id === 70) {
    name = 'Sector 70: Upgel Didav';
    description = 'The mythical coral citadel of Upgel Didav deep in the ocean where Dolphy is rescued!';
  } else if (id === 77) {
    name = 'Sector 77: Ocean Deep Trench';
    description = 'The silent depths of the sea floor where Beaker is trapped inside a glass diving bell!';
  } else if (id === 82) {
    name = 'Sector 82: Suburb Oak Avenue';
    description = 'Leafy neighborhood street lined with tall oaks where Eevee is caught in a bicycle basket!';
  } else if (id === 84) {
    name = 'Sector 84: Suburb Cul-de-Sac';
    description = 'Peaceful residential circle where Dear is surrounded by clockwork toy patrol cars!';
  } else if (id === 86) {
    name = 'Sector 86: Playground Jungle Gym';
    description = 'Towering metal climbing dome where Cole is cornered by playground bullies!';
  } else if (id === 88) {
    name = 'Sector 88: Mega Spiral Slide';
    description = 'A towering winding green tube slide where Henry is trapped at the summit!';
  } else if (id === 92) {
    name = 'Sector 92: Astral Star Bridge';
    description = 'A bridge woven of luminescent purple starlight where Pinky Bear reaches out for help!';
  } else if (id === 96) {
    name = 'Sector 96: Astral Nebula Spire';
    description = 'A swirling cosmic pinnacle above the world where Big Bear defends against thread fiends!';
  } else if (id === 99) {
    name = 'Sector 99: Citadel Gates';
    description = 'The monumental obsidian gates of the Citadel where Umbreon is bound in dark threads!';
  } else if (id === 100) {
    name = "Sector 100: The Stitchmaster's Citadel";
    description = 'The cosmic throne room of threads. Defeat the Stitchmaster to reunite all 27 plush friends!';
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
  for (const sId of STORY_MAIN_QUEST_PATH) {
    if (!clearedSectorIds.includes(sId)) {
      return sId;
    }
  }
  return 100;
}
