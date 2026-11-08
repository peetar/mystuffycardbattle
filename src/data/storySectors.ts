/**
 * Story Mode World Map (v4.3 "The Second Coming Update")
 * 5 Parts architecture, exactly 528 sectors per part (2,640 total sectors).
 * Players complete each part sequentially, moving to the next part, while being able
 * to freely switch back to any previously unlocked part at any time.
 */

import { StorySector, SectorBiome, QuestType, StoryPart } from '@/types/story';

export const SECTORS_PER_PART = 528;
export const TOTAL_PARTS = 5;
export const TOTAL_SECTORS = SECTORS_PER_PART * TOTAL_PARTS; // 2640 sectors

export const SECTOR_GRID_WIDTH = 24;
export const SECTOR_GRID_HEIGHT = 22; // 24 * 22 = 528 sectors per part

export const STORY_PARTS: StoryPart[] = [
  {
    partNumber: 1,
    title: 'Part 1: The Fabric Awakening',
    subtitle: "Ben's Domain, The Backyard & Neighborhood",
    startSectorId: 1,
    endSectorId: 528,
    sectorsCount: 528,
    bossName: 'The Fabric Behemoth',
    bossSpeciesId: 'lint_vampire',
    themeColor: '#f59e0b',
    icon: '🏠',
    description: 'Jefe awakens alone in Ben\'s room. The journey begins across the house, lawn, and nearby apartments to rescue initial plush friends.',
  },
  {
    partNumber: 2,
    title: 'Part 2: Beyond the Horizon',
    subtitle: 'The Overgrown Wild Forest & The Stuffed Amalgam',
    startSectorId: 529,
    endSectorId: 1056,
    sectorsCount: 528,
    bossName: 'The Stuffed Amalgam',
    bossSpeciesId: 'amalgam',
    themeColor: '#06b6d4',
    icon: '🌊',
    description: 'Venture deep past the city limits through 33 sector missions leading up to the colossal Stuffed Amalgam encounter from the main game at Sector 1056.',
  },
  {
    partNumber: 3,
    title: 'Part 3: Depths of the Unknown',
    subtitle: 'Moonlit Suburbs, Playgrounds & Crystal Caverns',
    startSectorId: 1057,
    endSectorId: 1584,
    sectorsCount: 528,
    bossName: 'The Puppet Ringmaster',
    bossSpeciesId: 'mind_puppeteer',
    themeColor: '#a855f7',
    icon: '🎪',
    description: 'Traverse quiet suburban cul-de-sacs, mysterious midnight playgrounds, and the shimmering, dangerous Crystal Caverns.',
  },
  {
    partNumber: 4,
    title: 'Part 4: The Ancient Shadows',
    subtitle: 'Floating Sky Islands & Volcanic Magma Ridge',
    startSectorId: 1585,
    endSectorId: 2112,
    sectorsCount: 528,
    bossName: 'Prehistoric Volcanic Titan',
    bossSpeciesId: 'cinder_beast',
    themeColor: '#ef4444',
    icon: '🌋',
    description: 'Ascend to gravity-defying floating sky isles and brave molten magma ridges where ancient plush titans like Tyrant are held captive.',
  },
  {
    partNumber: 5,
    title: 'Part 5: The Second Coming',
    subtitle: 'The Legend of the Stuffed & Astral Citadel',
    startSectorId: 2113,
    endSectorId: 2640,
    sectorsCount: 528,
    bossName: "The Stitchmaster's Citadel",
    bossSpeciesId: 'amalgam',
    themeColor: '#ec4899',
    icon: '👑',
    description: 'The second coming of mythical plushies: Unicorn, Grumpy Rhino, Farty Lama, and the Dolphin Pod unite for the grand final assault.',
  },
];

export interface SectorGroup {
  id: SectorBiome;
  name: string;
  icon: string;
  recommendedLevelRange: string;
  description: string;
  blobShapeClass: string;
  gradientClass: string;
}

export const SECTOR_GROUPS: SectorGroup[] = [
  {
    id: 'house',
    name: "Ben's House",
    icon: '🏠',
    recommendedLevelRange: 'Lv. 1 - 10',
    description: "Ben's cozy room, hallway, and attic where Jefe woke up alone.",
    blobShapeClass: 'rounded-[3rem_1.5rem_2.5rem_4rem]',
    gradientClass: 'from-amber-950/90 via-stone-900/90 to-amber-900/70 border-amber-800/60 shadow-amber-950/50',
  },
  {
    id: 'backyard',
    name: 'The Backyard',
    icon: '🌿',
    recommendedLevelRange: 'Lv. 8 - 20',
    description: 'Winding lawn terraces, the Fairy Well, and the Workshop Armory.',
    blobShapeClass: 'rounded-[2rem_4rem_1.5rem_3.5rem]',
    gradientClass: 'from-emerald-950/90 via-green-950/80 to-emerald-900/70 border-emerald-800/60 shadow-emerald-950/50',
  },
  {
    id: 'training_grounds',
    name: 'The Training Grounds',
    icon: '⚔️',
    recommendedLevelRange: 'Lv. 5 - 15',
    description: 'Grassy sparring rings and combat practice dummies right next to the backyard.',
    blobShapeClass: 'rounded-[2rem_3rem_2rem_4rem]',
    gradientClass: 'from-amber-900/80 via-emerald-950/80 to-slate-900 border-amber-600/60 shadow-amber-950/50',
  },
  {
    id: 'necak_house',
    name: "Necak's House",
    icon: '🏡',
    recommendedLevelRange: 'Lv. 18 - 30',
    description: "Neighbor's rustic hillside sanctuary, the Star Lab, and Cow's barn.",
    blobShapeClass: 'rounded-[3.5rem_2rem_4rem_1.5rem]',
    gradientClass: 'from-rose-950/90 via-red-950/80 to-amber-950/70 border-rose-800/60 shadow-rose-950/50',
  },
  {
    id: 'apartment',
    name: 'The Apartment Complex',
    icon: '🏢',
    recommendedLevelRange: 'Lv. 28 - 40',
    description: 'Breezeways, rooftops, stairwells, and windy balcony ledges.',
    blobShapeClass: 'rounded-[1.5rem_3.5rem_2rem_4rem]',
    gradientClass: 'from-slate-900 via-indigo-950/80 to-slate-950 border-indigo-800/60 shadow-indigo-950/50',
  },
  {
    id: 'wild_forest',
    name: 'The Wild Forest',
    icon: '🌲',
    recommendedLevelRange: 'Lv. 38 - 52',
    description: 'Ancient hollow oaks, winding mossy streams, and whispering pine canopies.',
    blobShapeClass: 'rounded-[4rem_1.5rem_3.5rem_2rem]',
    gradientClass: 'from-teal-950/90 via-emerald-950/85 to-teal-900/70 border-teal-800/60 shadow-teal-950/50',
  },
  {
    id: 'beach',
    name: 'The Beach',
    icon: '🏖️',
    recommendedLevelRange: 'Lv. 50 - 64',
    description: 'Golden sunlit sand dunes, rocky tide pools, and driftwood shores.',
    blobShapeClass: 'rounded-[2.5rem_4rem_2rem_3.5rem]',
    gradientClass: 'from-yellow-950/90 via-amber-950/80 to-stone-900 border-yellow-700/60 shadow-yellow-950/50',
  },
  {
    id: 'ocean',
    name: 'The Ocean & Upgel Didav',
    icon: '🌊',
    recommendedLevelRange: 'Lv. 62 - 76',
    description: 'Bioluminescent ocean trenches, coral reefs, and the legendary underwater sanctuary of Upgel Didav.',
    blobShapeClass: 'rounded-[3.5rem_2.5rem_4rem_1.5rem]',
    gradientClass: 'from-cyan-950/95 via-blue-950/85 to-teal-950/80 border-cyan-800/60 shadow-cyan-950/50',
  },
  {
    id: 'suburb',
    name: 'Suburb Avenue',
    icon: '🏘️',
    recommendedLevelRange: 'Lv. 74 - 84',
    description: 'Maple-lined streets, autumn cul-de-sacs, and mailbox trails.',
    blobShapeClass: 'rounded-[2rem_3rem_1.5rem_4rem]',
    gradientClass: 'from-violet-950/80 via-purple-950/70 to-slate-900 border-violet-800/60 shadow-violet-950/50',
  },
  {
    id: 'playground',
    name: 'Adventure Playground',
    icon: '🎪',
    recommendedLevelRange: 'Lv. 82 - 90',
    description: 'Jungle gyms, spiral slides, monkey bars, and sandbox fortresses.',
    blobShapeClass: 'rounded-[3rem_2rem_4rem_1.5rem]',
    gradientClass: 'from-orange-950/80 via-amber-950/70 to-stone-900 border-orange-800/60 shadow-orange-950/50',
  },
  {
    id: 'carnival',
    name: 'The Moonlit Carnival',
    icon: '🎡',
    recommendedLevelRange: 'Lv. 84 - 92',
    description: 'Neon-lit boardwalks, circus big tops, mirror mazes, and prize booths.',
    blobShapeClass: 'rounded-[3.5rem_1.5rem_3rem_2rem]',
    gradientClass: 'from-fuchsia-950/90 via-pink-950/80 to-purple-900 border-pink-700/60 shadow-fuchsia-950/50',
  },
  {
    id: 'crystal_caves',
    name: 'The Crystal Caverns',
    icon: '💎',
    recommendedLevelRange: 'Lv. 86 - 94',
    description: 'Subterranean geode caves glittering with resonant starlight crystals.',
    blobShapeClass: 'rounded-[2rem_4rem_1.5rem_3rem]',
    gradientClass: 'from-indigo-950/90 via-cyan-950/80 to-slate-900 border-cyan-500/60 shadow-cyan-950/50',
  },
  {
    id: 'clockwork_tower',
    name: 'The Clockwork Tower',
    icon: '⚙️',
    recommendedLevelRange: 'Lv. 88 - 96',
    description: 'Massive brass gears, pendulum bridges, and winding clockwork mechanisms.',
    blobShapeClass: 'rounded-[3rem_3rem_2rem_2rem]',
    gradientClass: 'from-amber-950/95 via-yellow-950/80 to-stone-900 border-amber-600/60 shadow-amber-950/50',
  },
  {
    id: 'sky_islands',
    name: 'Sky Gardens & Floating Isles',
    icon: '☁️',
    recommendedLevelRange: 'Lv. 90 - 98',
    description: 'Gravity-defying floating landmasses connected by cloud vines and rainbow bridges.',
    blobShapeClass: 'rounded-[3.5rem_2rem_4rem_2.5rem]',
    gradientClass: 'from-sky-950/90 via-indigo-950/80 to-blue-900 border-sky-400/60 shadow-sky-950/50',
  },
  {
    id: 'magma_peak',
    name: 'Magma Ridge & Ember Crags',
    icon: '🌋',
    recommendedLevelRange: 'Lv. 92 - 100',
    description: 'Scorching obsidian slopes, basalt spires, and glowing lava cauldrons.',
    blobShapeClass: 'rounded-[2.5rem_4rem_2rem_3.5rem]',
    gradientClass: 'from-red-950/95 via-amber-950/80 to-stone-900 border-red-600/60 shadow-red-950/50',
  },
  {
    id: 'toy_factory',
    name: 'The Ancient Toy Factory',
    icon: '🏭',
    recommendedLevelRange: 'Lv. 94 - 100',
    description: 'Forgotten assembly lines, spool racks, and enchanted sewing machines.',
    blobShapeClass: 'rounded-[3rem_1.5rem_3.5rem_2rem]',
    gradientClass: 'from-zinc-950/90 via-stone-900/85 to-amber-950/70 border-stone-600/60 shadow-stone-950/50',
  },
  {
    id: 'astral',
    name: 'The Astral Citadel',
    icon: '🌌',
    recommendedLevelRange: 'Lv. 96 - 100',
    description: "The ominous floating palace where the Stitchmaster pulls the strings of fate.",
    blobShapeClass: 'rounded-[2rem_3.5rem_1.5rem_3rem]',
    gradientClass: 'from-purple-950/90 via-fuchsia-950/80 to-indigo-950/90 border-purple-800/60 shadow-purple-950/50',
  },
];

export function getPartForSectorId(sectorId: number): number {
  return Math.min(TOTAL_PARTS, Math.max(1, Math.floor((sectorId - 1) / SECTORS_PER_PART) + 1));
}

export function getPartSectorIndex(sectorId: number): number {
  return ((sectorId - 1) % SECTORS_PER_PART) + 1;
}

function getJitter(x: number, y: number, seed: number): number {
  return (
    Math.sin(x * 0.45 + seed * 1.3) * 2.2 +
    Math.cos(y * 0.52 + seed * 0.9) * 2.0 +
    Math.sin((x + y) * 0.38 + seed) * 1.5
  );
}

interface BiomeSeed {
  biome: SectorBiome;
  cx: number;
  cy: number;
  weight?: number;
}

const PART_SEEDS: Record<number, BiomeSeed[]> = {
  1: [
    // House is kept small and compact (weight 3.5 + maxDist constraint)
    { biome: 'house', cx: 2, cy: 1, weight: 3.5 },
    // Backyard is directly adjacent to House and touches Training Grounds
    { biome: 'backyard', cx: 2, cy: 4, weight: 1.0 },
    // Training Grounds touches The Backyard along rows 3-5
    { biome: 'training_grounds', cx: 5, cy: 4, weight: 1.0 },
    // Necak's House is kept small and compact
    { biome: 'necak_house', cx: 15, cy: 3, weight: 3.5 },
    { biome: 'apartment', cx: 20, cy: 5, weight: 1.0 },
    { biome: 'playground', cx: 12, cy: 11, weight: 1.0 },
    // Ocean surrounds Upgel Didav (Sector 195 at x=3, y=9)
    { biome: 'ocean', cx: 3, cy: 9, weight: 0.85 },
    { biome: 'ocean', cx: 3, cy: 12, weight: 0.85 },
    { biome: 'beach', cx: 6, cy: 10, weight: 1.0 },
    { biome: 'wild_forest', cx: 10, cy: 16, weight: 1.0 },
    { biome: 'suburb', cx: 19, cy: 16, weight: 1.0 },
  ],
  2: [
    { biome: 'apartment', cx: 3, cy: 4, weight: 1.0 },
    { biome: 'wild_forest', cx: 10, cy: 7, weight: 0.95 },
    { biome: 'suburb', cx: 4, cy: 16, weight: 1.0 },
    { biome: 'playground', cx: 16, cy: 4, weight: 1.05 },
    { biome: 'beach', cx: 14, cy: 14, weight: 1.0 },
    { biome: 'ocean', cx: 20, cy: 16, weight: 0.9 },
  ],
  3: [
    { biome: 'suburb', cx: 4, cy: 4, weight: 1.0 },
    { biome: 'playground', cx: 12, cy: 4, weight: 1.0 },
    { biome: 'carnival', cx: 20, cy: 6, weight: 0.95 },
    { biome: 'suburb', cx: 5, cy: 16, weight: 1.05 },
    { biome: 'crystal_caves', cx: 14, cy: 14, weight: 0.95 },
    { biome: 'clockwork_tower', cx: 21, cy: 18, weight: 0.95 },
  ],
  4: [
    { biome: 'clockwork_tower', cx: 5, cy: 5, weight: 0.95 },
    { biome: 'sky_islands', cx: 18, cy: 5, weight: 0.95 },
    { biome: 'magma_peak', cx: 7, cy: 17, weight: 0.95 },
    { biome: 'toy_factory', cx: 19, cy: 17, weight: 0.95 },
    { biome: 'sky_islands', cx: 12, cy: 11, weight: 1.0 },
  ],
  5: [
    { biome: 'ocean', cx: 4, cy: 4, weight: 0.95 },
    { biome: 'crystal_caves', cx: 19, cy: 4, weight: 0.95 },
    { biome: 'sky_islands', cx: 4, cy: 18, weight: 0.95 },
    { biome: 'toy_factory', cx: 13, cy: 11, weight: 1.0 },
    { biome: 'astral', cx: 20, cy: 18, weight: 0.9 },
  ],
};

export const PROTECTED_SECTOR_IDS = new Set([
  1, 2, 3, 4, 10, 12, 16, 18, 20, 24, 38, 40, 50, 52, 56, 60, 70, 80, 96, 105,
  112, 125, 148, 160, 175, 180, 195, 200, 210, 215, 245, 270, 310, 360, 440,
  520, 528, 540, 600, 680, 740, 800, 860, 920, 980, 1056, 1070, 1140, 1200,
  1260, 1320, 1380, 1440, 1500, 1584, 1600, 1660, 1740, 1820, 1920, 2040,
  2112, 2125, 2190, 2270, 2350, 2430, 2510, 2590, 2600, 2640,
]);

export function isSectorGap(id: number, x: number, y: number, part: number): boolean {
  if (PROTECTED_SECTOR_IDS.has(id)) return false;
  // Natural gaps clustering using deterministic trigonometric noise (~8.5% of non-protected sectors)
  const val = Math.sin(x * 0.73 + y * 1.37 + part * 9.13) * 43758.5453;
  const frac = val - Math.floor(val);
  return frac < 0.085;
}

export function getBiomeForSector(id: number): SectorBiome {
  // Lore-specific fixed landmarks
  if (id === 1 || id === 2 || id === 4) return 'house';
  if (id === 3) return 'backyard';
  if (id === 56) return 'necak_house';
  if (id === 195) return 'ocean';
  if (id === 528) return 'playground';
  if (id === 1056) return 'ocean';
  if (id === 1584) return 'clockwork_tower';
  if (id === 2112) return 'magma_peak';
  if (id === 2640) return 'astral';

  const part = getPartForSectorId(id);
  const partSectorIndex = getPartSectorIndex(id);
  const localZeroIdx = partSectorIndex - 1;
  const x = (localZeroIdx % SECTOR_GRID_WIDTH) + 1;
  const y = Math.floor(localZeroIdx / SECTOR_GRID_WIDTH) + 1;

  // Ocean surrounds Upgel Didav (Sector 195 at x=3, y=9)
  if (part === 1 && Math.hypot(x - 3, y - 9) <= 3.2) {
    return 'ocean';
  }

  const seeds = PART_SEEDS[part] || PART_SEEDS[1];
  let bestBiome: SectorBiome = seeds[0].biome;
  let bestDist = Infinity;

  for (const s of seeds) {
    const rawDist = Math.hypot(x - s.cx, y - s.cy);
    // Houses are small buildings, not giant regional biomes
    if ((s.biome === 'house' || s.biome === 'necak_house') && rawDist > 2.2) {
      continue;
    }
    const d = rawDist * (s.weight || 1.0) + getJitter(x, y, s.cx * 5 + s.cy * 9);
    if (d < bestDist) {
      bestDist = d;
      bestBiome = s.biome;
    }
  }

  return bestBiome;
}

function getIconForBiome(biome: SectorBiome, id: number): string {
  if (id === 2) return '🏠';
  if (id === 3) return '🌿';
  if (id === 56) return '🏡';
  if (id === 195) return '🌊';
  if (id === 528) return '👑';
  if (id === 1056) return '🧸';
  if (id === 1584) return '🎭';
  if (id === 2112) return '🦖';
  if (id === 2640) return '🌌';

  switch (biome) {
    case 'house': return '🏠';
    case 'backyard': return '🌿';
    case 'training_grounds': return '⚔️';
    case 'necak_house': return '🏡';
    case 'apartment': return '🏢';
    case 'wild_forest': return '🌲';
    case 'beach': return '🏖️';
    case 'ocean': return '🌊';
    case 'suburb': return '🏘️';
    case 'playground': return '🎪';
    case 'carnival': return '🎡';
    case 'crystal_caves': return '💎';
    case 'clockwork_tower': return '⚙️';
    case 'sky_islands': return '☁️';
    case 'magma_peak': return '🌋';
    case 'toy_factory': return '🏭';
    case 'astral': return '🌌';
    default: return '📍';
  }
}

function getRecommendedLevel(biome: SectorBiome, id: number): number {
  const part = getPartForSectorId(id);
  const localIdx = getPartSectorIndex(id);
  const baseLvl = (part - 1) * 20 + 1;
  const progressInPart = localIdx / SECTORS_PER_PART;
  return Math.min(100, Math.max(1, Math.round(baseLvl + progressInPart * 19)));
}

// Generate all 2,640 sectors deterministically across 5 parts of 528 sectors
export const STORY_SECTORS: StorySector[] = Array.from({ length: TOTAL_SECTORS }, (_, idx) => {
  const id = idx + 1;
  const partNumber = getPartForSectorId(id);
  const partSectorIndex = getPartSectorIndex(id);
  const biome = getBiomeForSector(id);
  const icon = getIconForBiome(biome, id);
  const recommendedLevel = getRecommendedLevel(biome, id);

  const localZeroIdx = partSectorIndex - 1;
  const x = (localZeroIdx % SECTOR_GRID_WIDTH) + 1;
  const y = Math.floor(localZeroIdx / SECTOR_GRID_WIDTH) + 1;

  let name = `Sector ${id}`;
  let isAlwaysAccessible = false;

  if (id === 2) {
    name = 'Sector 2: The House (Start)';
  } else if (id === 3) {
    name = 'Sector 3: The Backyard (Grind & Test Sanctuary)';
    isAlwaysAccessible = true;
  } else if (id === 56) {
    name = "Sector 56: Necak's Barn Sanctuary";
  } else if (id === 195) {
    name = 'Sector 195: Upgel Didav Ocean Sanctuary';
  } else if (id === 528) {
    name = 'Sector 528: Part 1 Climax - The Fabric Behemoth';
  } else if (id === 1056) {
    name = 'Sector 1056: Part 2 Climax - Abyssal Kraken of Upgel Didav';
  } else if (id === 1584) {
    name = 'Sector 1584: Part 3 Climax - The Puppet Ringmaster';
  } else if (id === 2112) {
    name = 'Sector 2112: Part 4 Climax - Prehistoric Volcanic Titan';
  } else if (id === 2640) {
    name = "Sector 2640: Grand Finale - The Stitchmaster's Citadel";
  } else {
    name = `Part ${partNumber} • Sector ${partSectorIndex}`;
  }

  const isGap = isSectorGap(id, x, y, partNumber);

  return {
    id,
    partNumber,
    partSectorIndex,
    x,
    y,
    name: isGap ? `Chasm Gap (Sector ${id})` : name,
    biome,
    description: isGap
      ? `A deep impassable chasm rift separating plush territories.`
      : `Sector ${id} in Part ${partNumber} (${biome.replace('_', ' ')}). Recommended Lv. ${recommendedLevel}.`,
    recommendedLevel,
    isAlwaysAccessible,
    isGap,
    icon: isGap ? '🕳️' : icon,
  };
});

const SECTOR_BY_ID_MAP = new Map<number, StorySector>(
  STORY_SECTORS.map((s) => [s.id, s])
);

export function getSectorById(id: number): StorySector {
  return SECTOR_BY_ID_MAP.get(id) || STORY_SECTORS[0];
}

export function getSectorsForPart(partNumber: number): StorySector[] {
  const start = (partNumber - 1) * SECTORS_PER_PART;
  const end = start + SECTORS_PER_PART;
  return STORY_SECTORS.slice(start, end);
}
