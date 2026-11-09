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

export interface PartSectorGroup {
  id: string;
  name: string;
  icon: string;
  partNumber: number;
  biomes: SectorBiome[];
  description: string;
  requiredRescueSectorIds: number[];
  finalSectorId: number;
}

export const PART_SECTOR_GROUPS: PartSectorGroup[] = [
  // --- PART 1 ---
  {
    id: 'p1_house',
    name: "Ben's House",
    icon: '🏠',
    partNumber: 1,
    biomes: ['house'],
    description: "Ben's bedroom, closet, and hallway where Jefe began his journey.",
    requiredRescueSectorIds: [24],
    finalSectorId: 24,
  },
  {
    id: 'p1_backyard',
    name: 'The Backyard & Training Grounds',
    icon: '🌿',
    partNumber: 1,
    biomes: ['backyard', 'training_grounds'],
    description: 'Lawn terraces, flowerbed thickets, and combat dummy sparring grounds.',
    requiredRescueSectorIds: [96, 180],
    finalSectorId: 210,
  },
  {
    id: 'p1_apartment',
    name: 'The Apartment Complex',
    icon: '🏢',
    partNumber: 1,
    biomes: ['apartment'],
    description: 'Breezeways, stairwells, and windy balcony ledges.',
    requiredRescueSectorIds: [270],
    finalSectorId: 310,
  },
  {
    id: 'p1_necak',
    name: "Necak's House & Barnyard",
    icon: '🏡',
    partNumber: 1,
    biomes: ['necak_house'],
    description: "Rustic neighbor homestead, Star Lab, and Cow's barn.",
    requiredRescueSectorIds: [360, 440, 520],
    finalSectorId: 520,
  },
  {
    id: 'p1_playground_climax',
    name: 'Playground & Upgel Didav Climax',
    icon: '🌊',
    partNumber: 1,
    biomes: ['playground', 'ocean', 'beach', 'wild_forest', 'suburb'],
    description: 'Upgel Didav waters and the grand arena where the Fabric Behemoth lurks.',
    requiredRescueSectorIds: [],
    finalSectorId: 528,
  },

  // --- PART 2 ---
  {
    id: 'p2_apartment',
    name: 'Ridge High-Rises',
    icon: '🏢',
    partNumber: 2,
    biomes: ['apartment'],
    description: 'Elevated balconies and dizzying rooftop perches holding the Fairy Well.',
    requiredRescueSectorIds: [600],
    finalSectorId: 600,
  },
  {
    id: 'p2_wild_forest',
    name: 'Overgrown Wild Forest',
    icon: '🌲',
    partNumber: 2,
    biomes: ['wild_forest'],
    description: 'Deep woodland thickets, mossy swamps, and treetop canopies.',
    requiredRescueSectorIds: [680, 740, 800, 860],
    finalSectorId: 860,
  },
  {
    id: 'p2_suburb',
    name: 'Suburb Avenue & Picnic Grounds',
    icon: '🏘️',
    partNumber: 2,
    biomes: ['suburb', 'playground'],
    description: 'Autumn picnic glades and tall pine spires overlooking the coast.',
    requiredRescueSectorIds: [920, 980],
    finalSectorId: 980,
  },
  {
    id: 'p2_ocean_climax',
    name: 'Ocean Deeps to Climax',
    icon: '🧸',
    partNumber: 2,
    biomes: ['ocean', 'beach'],
    description: 'Sunken trenches culminating at Sector 1056 against The Stuffed Amalgam.',
    requiredRescueSectorIds: [],
    finalSectorId: 1056,
  },

  // --- PART 3 ---
  {
    id: 'p3_beach',
    name: 'Sunlit Dunes & Shallows',
    icon: '🏖️',
    partNumber: 3,
    biomes: ['beach'],
    description: 'Shimmering white sands, tidal umbrellas, and rocky tide pools.',
    requiredRescueSectorIds: [1140, 1200],
    finalSectorId: 1200,
  },
  {
    id: 'p3_ocean',
    name: 'Bioluminescent Trenches',
    icon: '🌊',
    partNumber: 3,
    biomes: ['ocean'],
    description: 'Deep glowing waters, abyss drop-offs, and sunken coral ridges.',
    requiredRescueSectorIds: [1260, 1320],
    finalSectorId: 1320,
  },
  {
    id: 'p3_suburb',
    name: 'Maple Cul-de-Sacs',
    icon: '🏘️',
    partNumber: 3,
    biomes: ['suburb'],
    description: 'Quiet suburban neighborhoods, leaf drifts, and mailbox trails.',
    requiredRescueSectorIds: [1380, 1440],
    finalSectorId: 1440,
  },
  {
    id: 'p3_carnival',
    name: 'Moonlit Carnival & Playground',
    icon: '🎡',
    partNumber: 3,
    biomes: ['carnival', 'playground'],
    description: 'Circus tents, jungle gyms, and festive midnight attractions.',
    requiredRescueSectorIds: [1500],
    finalSectorId: 1540,
  },
  {
    id: 'p3_clockwork_climax',
    name: 'Clockwork Spire to Climax',
    icon: '🎭',
    partNumber: 3,
    biomes: ['clockwork_tower', 'crystal_caves'],
    description: 'Towering brass gear shafts leading up to The Puppet Ringmaster.',
    requiredRescueSectorIds: [],
    finalSectorId: 1584,
  },

  // --- PART 4 ---
  {
    id: 'p4_clockwork',
    name: 'The Brass Spire',
    icon: '⚙️',
    partNumber: 4,
    biomes: ['clockwork_tower'],
    description: 'Mechanical walkways, pendulum perches, and high monkey bars.',
    requiredRescueSectorIds: [1660],
    finalSectorId: 1660,
  },
  {
    id: 'p4_sky_islands',
    name: 'Floating Sky Gardens',
    icon: '☁️',
    partNumber: 4,
    biomes: ['sky_islands'],
    description: 'Cloud vines, rainbow bridges, and high-altitude sanctuaries.',
    requiredRescueSectorIds: [1740, 1820],
    finalSectorId: 1820,
  },
  {
    id: 'p4_toy_factory',
    name: 'Ancient Toy Factory',
    icon: '🏭',
    partNumber: 4,
    biomes: ['toy_factory'],
    description: 'Forgotten assembly lines and roaring magma forge furnaces.',
    requiredRescueSectorIds: [1920],
    finalSectorId: 1920,
  },
  {
    id: 'p4_magma_climax',
    name: 'Prehistoric Volcanic Caldera',
    icon: '🦖',
    partNumber: 4,
    biomes: ['magma_peak'],
    description: 'Molten ridges, lava craters, and the lair of the Volcanic Titan.',
    requiredRescueSectorIds: [2040],
    finalSectorId: 2112,
  },

  // --- PART 5 ---
  {
    id: 'p5_ocean',
    name: 'Coral Atoll & Azure Lagoon',
    icon: '🐬',
    partNumber: 5,
    biomes: ['ocean'],
    description: 'Crystalline waters, dolphin pods, and ancient sonar reefs.',
    requiredRescueSectorIds: [2190, 2270, 2350],
    finalSectorId: 2350,
  },
  {
    id: 'p5_magma',
    name: 'Craggy Magma Ridge',
    icon: '🦏',
    partNumber: 5,
    biomes: ['magma_peak'],
    description: 'Steep basalt precipices where Grumpy Rhino defends his territory.',
    requiredRescueSectorIds: [2430],
    finalSectorId: 2430,
  },
  {
    id: 'p5_playground',
    name: 'Piñata Valley',
    icon: '🦙',
    partNumber: 5,
    biomes: ['playground'],
    description: 'Festive bouncy slopes and confetti canyons where Farty Lama roams.',
    requiredRescueSectorIds: [2510],
    finalSectorId: 2510,
  },
  {
    id: 'p5_crystal',
    name: 'Prism Peak Caverns',
    icon: '🦄',
    partNumber: 5,
    biomes: ['crystal_caves', 'sky_islands'],
    description: 'Glittering starlight spires and the sanctuary of the mythical Unicorn.',
    requiredRescueSectorIds: [2590],
    finalSectorId: 2590,
  },
  {
    id: 'p5_citadel_climax',
    name: "The Stitchmaster's Citadel",
    icon: '🌌',
    partNumber: 5,
    biomes: ['astral', 'toy_factory'],
    description: 'The final cosmic nexus where the fate of all plushies is decided.',
    requiredRescueSectorIds: [],
    finalSectorId: 2640,
  },
];

export function getSectorGroupsForPart(partNumber: number): PartSectorGroup[] {
  return PART_SECTOR_GROUPS.filter((g) => g.partNumber === partNumber);
}

export const STORY_SECTOR_TO_GROUP_ID: Record<number, string> = {
  // --- PART 1 ---
  1: 'p1_house', 2: 'p1_house', 4: 'p1_house', 10: 'p1_house', 24: 'p1_house',
  3: 'p1_backyard', 40: 'p1_backyard', 60: 'p1_backyard', 96: 'p1_backyard', 180: 'p1_backyard', 210: 'p1_backyard',
  270: 'p1_apartment', 310: 'p1_apartment',
  56: 'p1_necak', 360: 'p1_necak', 440: 'p1_necak', 520: 'p1_necak',
  195: 'p1_playground_climax', 215: 'p1_playground_climax', 245: 'p1_playground_climax', 528: 'p1_playground_climax',

  // --- PART 2 ---
  540: 'p2_apartment', 600: 'p2_apartment',
  680: 'p2_wild_forest', 700: 'p2_wild_forest', 740: 'p2_wild_forest', 760: 'p2_wild_forest', 800: 'p2_wild_forest', 820: 'p2_wild_forest', 860: 'p2_wild_forest',
  900: 'p2_suburb', 920: 'p2_suburb', 940: 'p2_suburb', 980: 'p2_suburb',
  1040: 'p2_ocean_climax', 1056: 'p2_ocean_climax',

  // --- PART 3 ---
  1070: 'p3_beach', 1140: 'p3_beach', 1160: 'p3_beach', 1200: 'p3_beach',
  1260: 'p3_ocean', 1280: 'p3_ocean', 1320: 'p3_ocean',
  1380: 'p3_suburb', 1400: 'p3_suburb', 1440: 'p3_suburb',
  1470: 'p3_carnival', 1500: 'p3_carnival', 1540: 'p3_carnival',
  1560: 'p3_clockwork_climax', 1584: 'p3_clockwork_climax',

  // --- PART 4 ---
  1600: 'p4_clockwork', 1660: 'p4_clockwork',
  1700: 'p4_sky_islands', 1740: 'p4_sky_islands', 1780: 'p4_sky_islands', 1820: 'p4_sky_islands',
  1880: 'p4_toy_factory', 1920: 'p4_toy_factory',
  1980: 'p4_magma_climax', 2040: 'p4_magma_climax', 2112: 'p4_magma_climax',

  // --- PART 5 ---
  2125: 'p5_ocean', 2190: 'p5_ocean', 2220: 'p5_ocean', 2270: 'p5_ocean', 2300: 'p5_ocean', 2350: 'p5_ocean',
  2380: 'p5_magma', 2430: 'p5_magma',
  2460: 'p5_playground', 2510: 'p5_playground',
  2540: 'p5_crystal', 2590: 'p5_crystal',
  2600: 'p5_citadel_climax', 2610: 'p5_citadel_climax', 2620: 'p5_citadel_climax', 2630: 'p5_citadel_climax', 2640: 'p5_citadel_climax',
};

export function getSectorGroupForSector(sector: StorySector): PartSectorGroup {
  const partNumber = sector.partNumber || getPartForSectorId(sector.id);
  const groupsInPart = getSectorGroupsForPart(partNumber);

  // 1. Check if explicitly defined in story progression mapping
  if (STORY_SECTOR_TO_GROUP_ID[sector.id]) {
    const explicit = groupsInPart.find((g) => g.id === STORY_SECTOR_TO_GROUP_ID[sector.id]);
    if (explicit) return explicit;
  }

  // 2. Check if explicitly registered as a rescue or final sector of a group
  const byRescue = groupsInPart.find(
    (g) => g.requiredRescueSectorIds.includes(sector.id) || g.finalSectorId === sector.id
  );
  if (byRescue) return byRescue;

  // 3. Otherwise match by Voronoi biome
  const matched = groupsInPart.find((g) => g.biomes.includes(sector.biome));
  if (matched) return matched;
  return groupsInPart[0] || PART_SECTOR_GROUPS[0];
}

export function isSectorGroupCompleted(
  group: PartSectorGroup,
  clearedSectorIds: number[]
): boolean {
  const rescuesDone = group.requiredRescueSectorIds.every((id) => clearedSectorIds.includes(id));
  if (!rescuesDone) return false;
  if (group.finalSectorId && !clearedSectorIds.includes(group.finalSectorId)) {
    return false;
  }
  return true;
}

export function getActiveSectorGroup(
  partNumber: number,
  clearedSectorIds: number[]
): PartSectorGroup {
  const groups = getSectorGroupsForPart(partNumber);
  for (const group of groups) {
    if (!isSectorGroupCompleted(group, clearedSectorIds)) {
      return group;
    }
  }
  return groups[groups.length - 1];
}

export function isSectorUnlockedInProgression(
  sector: StorySector,
  clearedSectorIds: number[],
  mapVision = false,
  activeObjectiveSectorId?: number
): boolean {
  if (mapVision) return true;
  if (sector.id === 3 || sector.id === 2) return true;
  if (activeObjectiveSectorId !== undefined && sector.id === activeObjectiveSectorId) return true;

  const partNumber = sector.partNumber || getPartForSectorId(sector.id);
  const groups = getSectorGroupsForPart(partNumber);
  const activeGroup = getActiveSectorGroup(partNumber, clearedSectorIds);
  const sectorGroup = getSectorGroupForSector(sector);

  const activeIdx = groups.findIndex((g) => g.id === activeGroup.id);
  const sectorIdx = groups.findIndex((g) => g.id === sectorGroup.id);

  return sectorIdx <= activeIdx;
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
  if (id === 1 || id === 2 || id === 4 || id === 10 || id === 24) return 'house';
  if (id === 3 || id === 40 || id === 60 || id === 180 || id === 210) return 'backyard';
  if (id === 96) return 'training_grounds';
  if (id === 56 || id === 360 || id === 440 || id === 520) return 'necak_house';
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
