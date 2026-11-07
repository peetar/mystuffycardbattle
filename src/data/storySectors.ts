/**
 * Story Mode World Map (300 Sectors)
 * Non-rectangular adventure landscape featuring 10 weird blob-shaped sector groups,
 * 72 hours of grinding depth, and progressive facility unlocks.
 */

import { StorySector, SectorBiome, QuestType } from '@/types/story';

export const SECTOR_GRID_WIDTH = 32;
export const SECTOR_GRID_HEIGHT = 22;
export const TOTAL_SECTORS = 540;

export interface SectorGroup {
  id: SectorBiome;
  name: string;
  icon: string;
  sectorIds: number[];
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
    sectorIds: [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 406, 407],
    recommendedLevelRange: 'Lv. 1 - 8',
    description: "Ben's cozy room, hallway, and attic where Jefe woke up alone.",
    blobShapeClass: 'rounded-[3rem_1.5rem_2.5rem_4rem]',
    gradientClass: 'from-amber-950/90 via-stone-900/90 to-amber-900/70 border-amber-800/60 shadow-amber-950/50',
  },
  {
    id: 'backyard',
    name: 'The Backyard',
    icon: '🌿',
    sectorIds: [3, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 408, 409],
    recommendedLevelRange: 'Lv. 8 - 18',
    description: 'Winding lawn terraces, the Fairy Well, and the Workshop Armory.',
    blobShapeClass: 'rounded-[2rem_4rem_1.5rem_3.5rem]',
    gradientClass: 'from-emerald-950/90 via-green-950/80 to-emerald-900/70 border-emerald-800/60 shadow-emerald-950/50',
  },
  {
    id: 'necak_house',
    name: "Necak's House",
    icon: '🏡',
    sectorIds: [43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 410],
    recommendedLevelRange: 'Lv. 18 - 28',
    description: "Neighbor's rustic hillside sanctuary, the Star Lab, and Cow's barn.",
    blobShapeClass: 'rounded-[3.5rem_2rem_4rem_1.5rem]',
    gradientClass: 'from-rose-950/90 via-red-950/80 to-amber-950/70 border-rose-800/60 shadow-rose-950/50',
  },
  {
    id: 'apartment',
    name: 'The Apartment Complex',
    icon: '🏢',
    sectorIds: Array.from({ length: 36 }, (_, i) => i + 57),
    recommendedLevelRange: 'Lv. 28 - 38',
    description: 'High-rise lobbies, fire escapes, and windy multi-story balconies.',
    blobShapeClass: 'rounded-[1.5rem_3.5rem_2rem_4rem]',
    gradientClass: 'from-slate-900 via-indigo-950/80 to-slate-950 border-indigo-800/60 shadow-indigo-950/50',
  },
  {
    id: 'wild_forest',
    name: 'The Wild Forest',
    icon: '🌲',
    sectorIds: Array.from({ length: 42 }, (_, i) => i + 93),
    recommendedLevelRange: 'Lv. 38 - 50',
    description: 'Overgrown briars, ancient hollow oaks, and treetop canopy lookouts.',
    blobShapeClass: 'rounded-[4rem_2rem_3.5rem_1.5rem]',
    gradientClass: 'from-teal-950/90 via-emerald-950/85 to-teal-900/70 border-teal-800/60 shadow-teal-950/50',
  },
  {
    id: 'beach',
    name: 'The Beach',
    icon: '🏖️',
    sectorIds: Array.from({ length: 34 }, (_, i) => i + 135),
    recommendedLevelRange: 'Lv. 50 - 62',
    description: 'Golden dunes, driftwood coves, umbrella camps, and rocky tide pools.',
    blobShapeClass: 'rounded-[2.5rem_4.5rem_1.5rem_3rem]',
    gradientClass: 'from-yellow-950/90 via-amber-950/80 to-stone-900 border-yellow-700/60 shadow-yellow-950/50',
  },
  {
    id: 'ocean',
    name: 'The Ocean & Upgel Didav',
    icon: '🌊',
    sectorIds: Array.from({ length: 42 }, (_, i) => i + 169),
    recommendedLevelRange: 'Lv. 62 - 74',
    description: 'Sunken coral atolls, deep trenches, and the sunken citadel of Upgel Didav.',
    blobShapeClass: 'rounded-[3rem_2rem_4.5rem_2.5rem]',
    gradientClass: 'from-cyan-950/95 via-blue-950/85 to-teal-950/80 border-cyan-800/60 shadow-cyan-950/50',
  },
  {
    id: 'suburb',
    name: 'Suburb Avenue',
    icon: '🏘️',
    sectorIds: [...Array.from({ length: 28 }, (_, i) => i + 211), 411, 412],
    recommendedLevelRange: 'Lv. 74 - 82',
    description: 'Leafy neighborhood loops, sidewalk cul-de-sacs, and autumn roads.',
    blobShapeClass: 'rounded-[2rem_3.5rem_2rem_3.5rem]',
    gradientClass: 'from-violet-950/80 via-purple-950/70 to-slate-900 border-violet-800/60 shadow-violet-950/50',
  },
  {
    id: 'playground',
    name: 'Adventure Playground',
    icon: '🛝',
    sectorIds: [...Array.from({ length: 28 }, (_, i) => i + 239), 413, 414],
    recommendedLevelRange: 'Lv. 82 - 88',
    description: 'Towering metal jungle gyms, monkey bar courses, and mega spiral slides.',
    blobShapeClass: 'rounded-[3.5rem_1.5rem_3rem_2.5rem]',
    gradientClass: 'from-orange-950/80 via-amber-950/70 to-stone-900 border-orange-800/60 shadow-orange-950/50',
  },
  {
    id: 'carnival',
    name: 'The Moonlit Carnival',
    icon: '🎪',
    sectorIds: [...Array.from({ length: 35 }, (_, i) => i + 267), 415],
    recommendedLevelRange: 'Lv. 88 - 91',
    description: 'Glowing ferris wheels, funhouse mirror mazes, bumper cars, and game stalls.',
    blobShapeClass: 'rounded-[2.5rem_4rem_2rem_3.5rem]',
    gradientClass: 'from-fuchsia-950/90 via-pink-950/80 to-purple-900 border-pink-700/60 shadow-pink-950/50',
  },
  {
    id: 'sky_islands',
    name: 'Sky Gardens & Floating Isles',
    icon: '☁️',
    sectorIds: Array.from({ length: 38 }, (_, i) => i + 419),
    recommendedLevelRange: 'Lv. 91 - 93',
    description: 'Whispering cloud terraces, rainbow cataracts, and floating starlight islands.',
    blobShapeClass: 'rounded-[3rem_2.5rem_3.5rem_2rem]',
    gradientClass: 'from-sky-950/90 via-indigo-950/80 to-blue-900 border-sky-400/60 shadow-sky-950/50',
  },
  {
    id: 'crystal_caves',
    name: 'The Crystal Caverns',
    icon: '💎',
    sectorIds: [...Array.from({ length: 35 }, (_, i) => i + 302), 416],
    recommendedLevelRange: 'Lv. 93 - 95',
    description: 'Subterranean sapphire grottos, glowing geode hollows, and echoing crystal stalactite chasms.',
    blobShapeClass: 'rounded-[3.5rem_2.5rem_4rem_2rem]',
    gradientClass: 'from-indigo-950/90 via-cyan-950/80 to-slate-900 border-cyan-500/60 shadow-cyan-950/50',
  },
  {
    id: 'magma_peak',
    name: 'Magma Ridge & Ember Crags',
    icon: '🌋',
    sectorIds: Array.from({ length: 38 }, (_, i) => i + 457),
    recommendedLevelRange: 'Lv. 95 - 97',
    description: 'Molten basalt bridges, erupting sulfur vents, and glowing obsidian pinnacles.',
    blobShapeClass: 'rounded-[2.5rem_3.5rem_2rem_4rem]',
    gradientClass: 'from-red-950/95 via-amber-950/80 to-stone-900 border-red-600/60 shadow-red-950/50',
  },
  {
    id: 'clockwork_tower',
    name: 'The Clockwork Tower',
    icon: '🕰️',
    sectorIds: [...Array.from({ length: 34 }, (_, i) => i + 337), 417, 418],
    recommendedLevelRange: 'Lv. 97 - 98',
    description: 'Massive brass cogs, swinging pendulum tracks, steam exhausts, and intricate escapements.',
    blobShapeClass: 'rounded-[2rem_3.5rem_2.5rem_4rem]',
    gradientClass: 'from-amber-950/95 via-yellow-950/80 to-stone-900 border-amber-600/60 shadow-amber-950/50',
  },
  {
    id: 'toy_factory',
    name: 'The Ancient Toy Factory',
    icon: '🏭',
    sectorIds: Array.from({ length: 38 }, (_, i) => i + 495),
    recommendedLevelRange: 'Lv. 98 - 99',
    description: 'Mysterious assembly conveyors, forgotten stuffing vats, and clockwork automaton presses.',
    blobShapeClass: 'rounded-[3rem_1.5rem_3rem_2.5rem]',
    gradientClass: 'from-zinc-950/90 via-stone-900/85 to-amber-950/70 border-stone-600/60 shadow-stone-950/50',
  },
  {
    id: 'astral',
    name: 'The Astral Citadel',
    icon: '🌌',
    sectorIds: [...Array.from({ length: 35 }, (_, i) => i + 371), ...Array.from({ length: 8 }, (_, i) => i + 533)],
    recommendedLevelRange: 'Lv. 99 - 100',
    description: 'Swirling celestial thread bridges leading into the Stitchmaster Throne at Sector 540.',
    blobShapeClass: 'rounded-[4.5rem_2rem_3.5rem_4rem]',
    gradientClass: 'from-purple-950/90 via-fuchsia-950/80 to-indigo-950/90 border-purple-800/60 shadow-purple-950/50',
  },
];

export function getBiomeForSector(id: number): SectorBiome {
  if (id === 3) return 'backyard';
  if ([1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 406, 407].includes(id)) return 'house';
  if ((id >= 12 && id <= 42) || [408, 409].includes(id)) return 'backyard';
  if ((id >= 43 && id <= 56) || id === 410) return 'necak_house';
  if (id >= 57 && id <= 92) return 'apartment';
  if (id >= 93 && id <= 134) return 'wild_forest';
  if (id >= 135 && id <= 168) return 'beach';
  if (id >= 169 && id <= 210) return 'ocean';
  if ((id >= 211 && id <= 238) || [411, 412].includes(id)) return 'suburb';
  if ((id >= 239 && id <= 266) || [413, 414].includes(id)) return 'playground';
  if ((id >= 267 && id <= 301) || id === 415) return 'carnival';
  if ((id >= 302 && id <= 336) || id === 416) return 'crystal_caves';
  if ((id >= 337 && id <= 370) || [417, 418].includes(id)) return 'clockwork_tower';
  if (id >= 419 && id <= 456) return 'sky_islands';
  if (id >= 457 && id <= 494) return 'magma_peak';
  if (id >= 495 && id <= 532) return 'toy_factory';
  return 'astral';
}

export function getIconForBiome(biome: SectorBiome, id: number): string {
  if (id === 2) return '🏠'; // The House (Start)
  if (id === 3) return '🌳'; // The Backyard (Always Accessible)
  if (id === 18) return '🔨'; // Workshop Armory
  if (id === 38) return '⛲'; // Fairy Well
  if (id === 50) return '🔮'; // Evolution Lab
  if (id === 56) return '🐄'; // Necak's Barn (Cow)
  if (id === 195) return '🐬'; // Upgel Didav in Ocean (Dolphy)
  if (id === 300) return '🎪'; // Moonlit Carnival Grand Tent (Pinky Bear)
  if (id === 440) return '☁️'; // Sky Islands Sanctuary (Big Bear)
  if (id === 480) return '🕰️'; // Great Pendulum Spire (Umbratail)
  if (id === 540) return '👑'; // Stitchmaster's Citadel
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
    case 'carnival':
      return '🎡';
    case 'sky_islands':
      return '☁️';
    case 'crystal_caves':
      return '💎';
    case 'magma_peak':
      return '🌋';
    case 'clockwork_tower':
      return '⚙️';
    case 'toy_factory':
      return '🏭';
    case 'astral':
      return '🌌';
    default:
      return '📍';
  }
}

export function getRecommendedLevel(biome: SectorBiome, id: number): number {
  switch (biome) {
    case 'house':
      return Math.min(8, Math.max(1, Math.round(1 + ((id - 1) / 11) * 7)));
    case 'backyard':
      return Math.min(18, Math.max(8, Math.round(8 + ((id - 12) / 33) * 10)));
    case 'necak_house':
      return Math.min(28, Math.max(18, Math.round(18 + ((id - 43) / 14) * 10)));
    case 'apartment':
      return Math.min(38, Math.max(28, Math.round(28 + ((id - 57) / 35) * 10)));
    case 'wild_forest':
      return Math.min(50, Math.max(38, Math.round(38 + ((id - 93) / 41) * 12)));
    case 'beach':
      return Math.min(62, Math.max(50, Math.round(50 + ((id - 135) / 33) * 12)));
    case 'ocean':
      return Math.min(74, Math.max(62, Math.round(62 + ((id - 169) / 41) * 12)));
    case 'suburb':
      return Math.min(82, Math.max(74, Math.round(74 + ((id - 211) / 29) * 8)));
    case 'playground':
      return Math.min(88, Math.max(82, Math.round(82 + ((id - 239) / 29) * 6)));
    case 'carnival':
      return Math.min(91, Math.max(88, Math.round(88 + ((id - 267) / 35) * 3)));
    case 'sky_islands':
      return Math.min(93, Math.max(91, Math.round(91 + ((id - 419) / 37) * 2)));
    case 'crystal_caves':
      return Math.min(95, Math.max(93, Math.round(93 + ((id - 302) / 35) * 2)));
    case 'magma_peak':
      return Math.min(97, Math.max(95, Math.round(95 + ((id - 457) / 37) * 2)));
    case 'clockwork_tower':
      return Math.min(98, Math.max(97, Math.round(97 + ((id - 337) / 35) * 1)));
    case 'toy_factory':
      return Math.min(99, Math.max(98, Math.round(98 + ((id - 495) / 37) * 1)));
    case 'astral':
      return 100;
    default:
      return 1;
  }
}

// Side quests across the 300 sectors
export const SIDE_QUEST_SECTOR_IDS = new Set<number>([
  3, 5, 14, 21, 35, 48, 70, 85, 110, 128, 150, 180, 200, 225, 255, 280
]);

// Landmark Boss Sectors
const BOSS_SECTORS: Record<number, { bossSpeciesId: string; bossName: string }> = {
  8: { bossSpeciesId: 'vacuum_beast', bossName: 'The Dust Gobbler' },
  18: { bossSpeciesId: 'shredder_prime', bossName: 'Workshop Gear Golem' },
  56: { bossSpeciesId: 'weed_whacker', bossName: "Necak's Hay Baler Titan" },
  92: { bossSpeciesId: 'street_hound', bossName: 'Stray Scrapper Rex' },
  134: { bossSpeciesId: 'amalgam', bossName: 'Shadow of the Pines' },
  168: { bossSpeciesId: 'sand_serpent', bossName: 'The Sandbar Titan' },
  195: { bossSpeciesId: 'aquatic_ray', bossName: 'Manta of Upgel Didav' },
  210: { bossSpeciesId: 'aquatic_kraken', bossName: 'Abyssal Kraken' },
  238: { bossSpeciesId: 'clockwork_nuke', bossName: 'Clockwork Patrol Warden' },
  266: { bossSpeciesId: 'volt_colossus', bossName: 'The Playground Titan' },
  301: { bossSpeciesId: 'carnival_ringmaster', bossName: 'The Funhouse Master' },
  336: { bossSpeciesId: 'crystal_behemoth', bossName: 'The Crystal Colossus' },
  370: { bossSpeciesId: 'clockwork_golem', bossName: 'The Chrono Sentinel' },
  456: { bossSpeciesId: 'storm_harpy', bossName: 'The Sky Isle Stormlord' },
  494: { bossSpeciesId: 'magma_drake', bossName: 'The Magma Ridge Drake' },
  532: { bossSpeciesId: 'clockwork_nuke', bossName: 'The Factory Overseer' },
  540: { bossSpeciesId: 'stitchmaster_final', bossName: 'The Stitchmaster' },
};

// Deterministic irregular, non-straight 2D cluster coordinates with touching squares
export const SECTOR_EXACT_COORDINATES: Record<number, { x: number; y: number }> = {
  "1": {
    "x": 3,
    "y": 1
  },
  "2": {
    "x": 3,
    "y": 2
  },
  "3": {
    "x": 6,
    "y": 2
  },
  "4": {
    "x": 2,
    "y": 2
  },
  "5": {
    "x": 4,
    "y": 1
  },
  "6": {
    "x": 4,
    "y": 2
  },
  "7": {
    "x": 5,
    "y": 2
  },
  "8": {
    "x": 2,
    "y": 3
  },
  "9": {
    "x": 3,
    "y": 3
  },
  "10": {
    "x": 4,
    "y": 3
  },
  "11": {
    "x": 3,
    "y": 4
  },
  "12": {
    "x": 6,
    "y": 1
  },
  "13": {
    "x": 7,
    "y": 1
  },
  "14": {
    "x": 8,
    "y": 1
  },
  "15": {
    "x": 9,
    "y": 1
  },
  "16": {
    "x": 10,
    "y": 1
  },
  "17": {
    "x": 5,
    "y": 1
  },
  "18": {
    "x": 7,
    "y": 2
  },
  "19": {
    "x": 8,
    "y": 2
  },
  "20": {
    "x": 9,
    "y": 2
  },
  "21": {
    "x": 10,
    "y": 2
  },
  "22": {
    "x": 11,
    "y": 2
  },
  "23": {
    "x": 5,
    "y": 3
  },
  "24": {
    "x": 6,
    "y": 3
  },
  "25": {
    "x": 7,
    "y": 3
  },
  "26": {
    "x": 8,
    "y": 3
  },
  "27": {
    "x": 9,
    "y": 3
  },
  "28": {
    "x": 10,
    "y": 3
  },
  "29": {
    "x": 4,
    "y": 4
  },
  "30": {
    "x": 5,
    "y": 4
  },
  "31": {
    "x": 6,
    "y": 4
  },
  "32": {
    "x": 7,
    "y": 4
  },
  "33": {
    "x": 8,
    "y": 4
  },
  "34": {
    "x": 9,
    "y": 4
  },
  "35": {
    "x": 5,
    "y": 5
  },
  "36": {
    "x": 6,
    "y": 5
  },
  "37": {
    "x": 7,
    "y": 5
  },
  "38": {
    "x": 8,
    "y": 5
  },
  "39": {
    "x": 5,
    "y": 6
  },
  "40": {
    "x": 6,
    "y": 6
  },
  "41": {
    "x": 7,
    "y": 6
  },
  "42": {
    "x": 6,
    "y": 7
  },
  "43": {
    "x": 11,
    "y": 1
  },
  "44": {
    "x": 12,
    "y": 1
  },
  "45": {
    "x": 13,
    "y": 1
  },
  "46": {
    "x": 14,
    "y": 1
  },
  "47": {
    "x": 12,
    "y": 2
  },
  "48": {
    "x": 13,
    "y": 2
  },
  "49": {
    "x": 14,
    "y": 2
  },
  "50": {
    "x": 15,
    "y": 2
  },
  "51": {
    "x": 11,
    "y": 3
  },
  "52": {
    "x": 12,
    "y": 3
  },
  "53": {
    "x": 13,
    "y": 3
  },
  "54": {
    "x": 14,
    "y": 3
  },
  "55": {
    "x": 12,
    "y": 4
  },
  "56": {
    "x": 13,
    "y": 4
  },
  "57": {
    "x": 1,
    "y": 3
  },
  "58": {
    "x": 1,
    "y": 4
  },
  "59": {
    "x": 2,
    "y": 4
  },
  "60": {
    "x": 1,
    "y": 5
  },
  "61": {
    "x": 2,
    "y": 5
  },
  "62": {
    "x": 3,
    "y": 5
  },
  "63": {
    "x": 4,
    "y": 5
  },
  "64": {
    "x": 1,
    "y": 6
  },
  "65": {
    "x": 2,
    "y": 6
  },
  "66": {
    "x": 3,
    "y": 6
  },
  "67": {
    "x": 4,
    "y": 6
  },
  "68": {
    "x": 1,
    "y": 7
  },
  "69": {
    "x": 2,
    "y": 7
  },
  "70": {
    "x": 3,
    "y": 7
  },
  "71": {
    "x": 4,
    "y": 7
  },
  "72": {
    "x": 5,
    "y": 7
  },
  "73": {
    "x": 1,
    "y": 8
  },
  "74": {
    "x": 2,
    "y": 8
  },
  "75": {
    "x": 3,
    "y": 8
  },
  "76": {
    "x": 4,
    "y": 8
  },
  "77": {
    "x": 5,
    "y": 8
  },
  "78": {
    "x": 6,
    "y": 8
  },
  "79": {
    "x": 7,
    "y": 8
  },
  "80": {
    "x": 1,
    "y": 9
  },
  "81": {
    "x": 2,
    "y": 9
  },
  "82": {
    "x": 3,
    "y": 9
  },
  "83": {
    "x": 4,
    "y": 9
  },
  "84": {
    "x": 5,
    "y": 9
  },
  "85": {
    "x": 1,
    "y": 10
  },
  "86": {
    "x": 2,
    "y": 10
  },
  "87": {
    "x": 3,
    "y": 10
  },
  "88": {
    "x": 4,
    "y": 10
  },
  "89": {
    "x": 1,
    "y": 11
  },
  "90": {
    "x": 2,
    "y": 11
  },
  "91": {
    "x": 3,
    "y": 11
  },
  "92": {
    "x": 2,
    "y": 12
  },
  "93": {
    "x": 10,
    "y": 4
  },
  "94": {
    "x": 11,
    "y": 4
  },
  "95": {
    "x": 9,
    "y": 5
  },
  "96": {
    "x": 10,
    "y": 5
  },
  "97": {
    "x": 11,
    "y": 5
  },
  "98": {
    "x": 12,
    "y": 5
  },
  "99": {
    "x": 8,
    "y": 6
  },
  "100": {
    "x": 9,
    "y": 6
  },
  "101": {
    "x": 10,
    "y": 6
  },
  "102": {
    "x": 11,
    "y": 6
  },
  "103": {
    "x": 12,
    "y": 6
  },
  "104": {
    "x": 13,
    "y": 6
  },
  "105": {
    "x": 7,
    "y": 7
  },
  "106": {
    "x": 8,
    "y": 7
  },
  "107": {
    "x": 9,
    "y": 7
  },
  "108": {
    "x": 10,
    "y": 7
  },
  "109": {
    "x": 11,
    "y": 7
  },
  "110": {
    "x": 12,
    "y": 7
  },
  "111": {
    "x": 13,
    "y": 7
  },
  "112": {
    "x": 14,
    "y": 7
  },
  "113": {
    "x": 8,
    "y": 8
  },
  "114": {
    "x": 9,
    "y": 8
  },
  "115": {
    "x": 10,
    "y": 8
  },
  "116": {
    "x": 11,
    "y": 8
  },
  "117": {
    "x": 12,
    "y": 8
  },
  "118": {
    "x": 13,
    "y": 8
  },
  "119": {
    "x": 6,
    "y": 9
  },
  "120": {
    "x": 7,
    "y": 9
  },
  "121": {
    "x": 8,
    "y": 9
  },
  "122": {
    "x": 9,
    "y": 9
  },
  "123": {
    "x": 10,
    "y": 9
  },
  "124": {
    "x": 11,
    "y": 9
  },
  "125": {
    "x": 12,
    "y": 9
  },
  "126": {
    "x": 7,
    "y": 10
  },
  "127": {
    "x": 8,
    "y": 10
  },
  "128": {
    "x": 9,
    "y": 10
  },
  "129": {
    "x": 10,
    "y": 10
  },
  "130": {
    "x": 11,
    "y": 10
  },
  "131": {
    "x": 8,
    "y": 11
  },
  "132": {
    "x": 9,
    "y": 11
  },
  "133": {
    "x": 10,
    "y": 11
  },
  "134": {
    "x": 9,
    "y": 12
  },
  "135": {
    "x": 15,
    "y": 1
  },
  "136": {
    "x": 16,
    "y": 1
  },
  "137": {
    "x": 17,
    "y": 1
  },
  "138": {
    "x": 18,
    "y": 1
  },
  "139": {
    "x": 19,
    "y": 1
  },
  "140": {
    "x": 20,
    "y": 1
  },
  "141": {
    "x": 21,
    "y": 1
  },
  "142": {
    "x": 16,
    "y": 2
  },
  "143": {
    "x": 17,
    "y": 2
  },
  "144": {
    "x": 18,
    "y": 2
  },
  "145": {
    "x": 19,
    "y": 2
  },
  "146": {
    "x": 20,
    "y": 2
  },
  "147": {
    "x": 21,
    "y": 2
  },
  "148": {
    "x": 22,
    "y": 2
  },
  "149": {
    "x": 15,
    "y": 3
  },
  "150": {
    "x": 16,
    "y": 3
  },
  "151": {
    "x": 17,
    "y": 3
  },
  "152": {
    "x": 18,
    "y": 3
  },
  "153": {
    "x": 19,
    "y": 3
  },
  "154": {
    "x": 20,
    "y": 3
  },
  "155": {
    "x": 21,
    "y": 3
  },
  "156": {
    "x": 15,
    "y": 4
  },
  "157": {
    "x": 16,
    "y": 4
  },
  "158": {
    "x": 17,
    "y": 4
  },
  "159": {
    "x": 18,
    "y": 4
  },
  "160": {
    "x": 19,
    "y": 4
  },
  "161": {
    "x": 20,
    "y": 4
  },
  "162": {
    "x": 16,
    "y": 5
  },
  "163": {
    "x": 17,
    "y": 5
  },
  "164": {
    "x": 18,
    "y": 5
  },
  "165": {
    "x": 19,
    "y": 5
  },
  "166": {
    "x": 17,
    "y": 6
  },
  "167": {
    "x": 18,
    "y": 6
  },
  "168": {
    "x": 17,
    "y": 7
  },
  "169": {
    "x": 22,
    "y": 1
  },
  "170": {
    "x": 23,
    "y": 1
  },
  "171": {
    "x": 24,
    "y": 1
  },
  "172": {
    "x": 25,
    "y": 1
  },
  "173": {
    "x": 26,
    "y": 1
  },
  "174": {
    "x": 23,
    "y": 2
  },
  "175": {
    "x": 24,
    "y": 2
  },
  "176": {
    "x": 25,
    "y": 2
  },
  "177": {
    "x": 26,
    "y": 2
  },
  "178": {
    "x": 22,
    "y": 3
  },
  "179": {
    "x": 23,
    "y": 3
  },
  "180": {
    "x": 24,
    "y": 3
  },
  "181": {
    "x": 25,
    "y": 3
  },
  "182": {
    "x": 26,
    "y": 3
  },
  "183": {
    "x": 21,
    "y": 4
  },
  "184": {
    "x": 22,
    "y": 4
  },
  "185": {
    "x": 23,
    "y": 4
  },
  "186": {
    "x": 24,
    "y": 4
  },
  "187": {
    "x": 25,
    "y": 4
  },
  "188": {
    "x": 26,
    "y": 4
  },
  "189": {
    "x": 20,
    "y": 5
  },
  "190": {
    "x": 21,
    "y": 5
  },
  "191": {
    "x": 22,
    "y": 5
  },
  "192": {
    "x": 23,
    "y": 5
  },
  "193": {
    "x": 24,
    "y": 5
  },
  "194": {
    "x": 25,
    "y": 5
  },
  "195": {
    "x": 26,
    "y": 5
  },
  "196": {
    "x": 21,
    "y": 6
  },
  "197": {
    "x": 22,
    "y": 6
  },
  "198": {
    "x": 23,
    "y": 6
  },
  "199": {
    "x": 24,
    "y": 6
  },
  "200": {
    "x": 25,
    "y": 6
  },
  "201": {
    "x": 26,
    "y": 6
  },
  "202": {
    "x": 21,
    "y": 7
  },
  "203": {
    "x": 22,
    "y": 7
  },
  "204": {
    "x": 23,
    "y": 7
  },
  "205": {
    "x": 24,
    "y": 7
  },
  "206": {
    "x": 25,
    "y": 7
  },
  "207": {
    "x": 22,
    "y": 8
  },
  "208": {
    "x": 23,
    "y": 8
  },
  "209": {
    "x": 24,
    "y": 8
  },
  "210": {
    "x": 23,
    "y": 9
  },
  "211": {
    "x": 4,
    "y": 11
  },
  "212": {
    "x": 5,
    "y": 11
  },
  "213": {
    "x": 1,
    "y": 12
  },
  "214": {
    "x": 3,
    "y": 12
  },
  "215": {
    "x": 4,
    "y": 12
  },
  "216": {
    "x": 5,
    "y": 12
  },
  "217": {
    "x": 6,
    "y": 12
  },
  "218": {
    "x": 1,
    "y": 13
  },
  "219": {
    "x": 2,
    "y": 13
  },
  "220": {
    "x": 3,
    "y": 13
  },
  "221": {
    "x": 4,
    "y": 13
  },
  "222": {
    "x": 5,
    "y": 13
  },
  "223": {
    "x": 6,
    "y": 13
  },
  "224": {
    "x": 7,
    "y": 13
  },
  "225": {
    "x": 1,
    "y": 14
  },
  "226": {
    "x": 2,
    "y": 14
  },
  "227": {
    "x": 3,
    "y": 14
  },
  "228": {
    "x": 4,
    "y": 14
  },
  "229": {
    "x": 5,
    "y": 14
  },
  "230": {
    "x": 6,
    "y": 14
  },
  "231": {
    "x": 1,
    "y": 15
  },
  "232": {
    "x": 2,
    "y": 15
  },
  "233": {
    "x": 3,
    "y": 15
  },
  "234": {
    "x": 4,
    "y": 15
  },
  "235": {
    "x": 5,
    "y": 15
  },
  "236": {
    "x": 1,
    "y": 16
  },
  "237": {
    "x": 2,
    "y": 16
  },
  "238": {
    "x": 3,
    "y": 16
  },
  "239": {
    "x": 7,
    "y": 11
  },
  "240": {
    "x": 11,
    "y": 11
  },
  "241": {
    "x": 7,
    "y": 12
  },
  "242": {
    "x": 8,
    "y": 12
  },
  "243": {
    "x": 10,
    "y": 12
  },
  "244": {
    "x": 11,
    "y": 12
  },
  "245": {
    "x": 12,
    "y": 12
  },
  "246": {
    "x": 8,
    "y": 13
  },
  "247": {
    "x": 9,
    "y": 13
  },
  "248": {
    "x": 10,
    "y": 13
  },
  "249": {
    "x": 11,
    "y": 13
  },
  "250": {
    "x": 12,
    "y": 13
  },
  "251": {
    "x": 13,
    "y": 13
  },
  "252": {
    "x": 14,
    "y": 13
  },
  "253": {
    "x": 7,
    "y": 14
  },
  "254": {
    "x": 8,
    "y": 14
  },
  "255": {
    "x": 9,
    "y": 14
  },
  "256": {
    "x": 10,
    "y": 14
  },
  "257": {
    "x": 11,
    "y": 14
  },
  "258": {
    "x": 12,
    "y": 14
  },
  "259": {
    "x": 7,
    "y": 15
  },
  "260": {
    "x": 8,
    "y": 15
  },
  "261": {
    "x": 9,
    "y": 15
  },
  "262": {
    "x": 10,
    "y": 15
  },
  "263": {
    "x": 11,
    "y": 15
  },
  "264": {
    "x": 8,
    "y": 16
  },
  "265": {
    "x": 9,
    "y": 16
  },
  "266": {
    "x": 10,
    "y": 16
  },
  "267": {
    "x": 16,
    "y": 9
  },
  "268": {
    "x": 16,
    "y": 10
  },
  "269": {
    "x": 17,
    "y": 9
  },
  "270": {
    "x": 16,
    "y": 8
  },
  "271": {
    "x": 15,
    "y": 9
  },
  "272": {
    "x": 17,
    "y": 10
  },
  "273": {
    "x": 15,
    "y": 10
  },
  "274": {
    "x": 17,
    "y": 8
  },
  "275": {
    "x": 15,
    "y": 8
  },
  "276": {
    "x": 18,
    "y": 9
  },
  "277": {
    "x": 18,
    "y": 8
  },
  "278": {
    "x": 18,
    "y": 10
  },
  "279": {
    "x": 19,
    "y": 8
  },
  "280": {
    "x": 19,
    "y": 9
  },
  "281": {
    "x": 19,
    "y": 10
  },
  "282": {
    "x": 14,
    "y": 10
  },
  "283": {
    "x": 14,
    "y": 8
  },
  "284": {
    "x": 14,
    "y": 9
  },
  "285": {
    "x": 18,
    "y": 11
  },
  "286": {
    "x": 17,
    "y": 11
  },
  "287": {
    "x": 16,
    "y": 11
  },
  "288": {
    "x": 17,
    "y": 12
  },
  "289": {
    "x": 18,
    "y": 12
  },
  "290": {
    "x": 16,
    "y": 12
  },
  "291": {
    "x": 20,
    "y": 9
  },
  "292": {
    "x": 20,
    "y": 8
  },
  "293": {
    "x": 18,
    "y": 7
  },
  "294": {
    "x": 19,
    "y": 7
  },
  "295": {
    "x": 20,
    "y": 7
  },
  "296": {
    "x": 17,
    "y": 13
  },
  "297": {
    "x": 16,
    "y": 13
  },
  "298": {
    "x": 18,
    "y": 13
  },
  "299": {
    "x": 20,
    "y": 10
  },
  "300": {
    "x": 19,
    "y": 6
  },
  "301": {
    "x": 21,
    "y": 9
  },
  "302": {
    "x": 21,
    "y": 11
  },
  "303": {
    "x": 21,
    "y": 12
  },
  "304": {
    "x": 22,
    "y": 10
  },
  "305": {
    "x": 22,
    "y": 11
  },
  "306": {
    "x": 21,
    "y": 10
  },
  "307": {
    "x": 20,
    "y": 11
  },
  "308": {
    "x": 22,
    "y": 12
  },
  "309": {
    "x": 20,
    "y": 12
  },
  "310": {
    "x": 22,
    "y": 13
  },
  "311": {
    "x": 21,
    "y": 13
  },
  "312": {
    "x": 20,
    "y": 13
  },
  "313": {
    "x": 23,
    "y": 13
  },
  "314": {
    "x": 22,
    "y": 14
  },
  "315": {
    "x": 21,
    "y": 14
  },
  "316": {
    "x": 23,
    "y": 12
  },
  "317": {
    "x": 23,
    "y": 14
  },
  "318": {
    "x": 19,
    "y": 13
  },
  "319": {
    "x": 19,
    "y": 14
  },
  "320": {
    "x": 20,
    "y": 14
  },
  "321": {
    "x": 19,
    "y": 12
  },
  "322": {
    "x": 22,
    "y": 9
  },
  "323": {
    "x": 19,
    "y": 15
  },
  "324": {
    "x": 21,
    "y": 15
  },
  "325": {
    "x": 20,
    "y": 15
  },
  "326": {
    "x": 19,
    "y": 11
  },
  "327": {
    "x": 24,
    "y": 13
  },
  "328": {
    "x": 23,
    "y": 11
  },
  "329": {
    "x": 24,
    "y": 11
  },
  "330": {
    "x": 24,
    "y": 12
  },
  "331": {
    "x": 22,
    "y": 15
  },
  "332": {
    "x": 20,
    "y": 16
  },
  "333": {
    "x": 22,
    "y": 16
  },
  "334": {
    "x": 21,
    "y": 16
  },
  "335": {
    "x": 19,
    "y": 16
  },
  "336": {
    "x": 20,
    "y": 17
  },
  "337": {
    "x": 18,
    "y": 15
  },
  "338": {
    "x": 17,
    "y": 16
  },
  "339": {
    "x": 18,
    "y": 16
  },
  "340": {
    "x": 17,
    "y": 14
  },
  "341": {
    "x": 18,
    "y": 14
  },
  "342": {
    "x": 17,
    "y": 15
  },
  "343": {
    "x": 17,
    "y": 17
  },
  "344": {
    "x": 16,
    "y": 17
  },
  "345": {
    "x": 16,
    "y": 16
  },
  "346": {
    "x": 16,
    "y": 15
  },
  "347": {
    "x": 18,
    "y": 17
  },
  "348": {
    "x": 18,
    "y": 18
  },
  "349": {
    "x": 16,
    "y": 18
  },
  "350": {
    "x": 17,
    "y": 18
  },
  "351": {
    "x": 16,
    "y": 14
  },
  "352": {
    "x": 19,
    "y": 17
  },
  "353": {
    "x": 15,
    "y": 14
  },
  "354": {
    "x": 15,
    "y": 15
  },
  "355": {
    "x": 15,
    "y": 13
  },
  "356": {
    "x": 19,
    "y": 18
  },
  "357": {
    "x": 20,
    "y": 18
  },
  "358": {
    "x": 18,
    "y": 19
  },
  "359": {
    "x": 19,
    "y": 19
  },
  "360": {
    "x": 20,
    "y": 19
  },
  "361": {
    "x": 15,
    "y": 17
  },
  "362": {
    "x": 15,
    "y": 18
  },
  "363": {
    "x": 15,
    "y": 16
  },
  "364": {
    "x": 20,
    "y": 20
  },
  "365": {
    "x": 18,
    "y": 20
  },
  "366": {
    "x": 19,
    "y": 20
  },
  "367": {
    "x": 14,
    "y": 14
  },
  "368": {
    "x": 14,
    "y": 15
  },
  "369": {
    "x": 14,
    "y": 16
  },
  "370": {
    "x": 13,
    "y": 15
  },
  "371": {
    "x": 23,
    "y": 16
  },
  "372": {
    "x": 24,
    "y": 15
  },
  "373": {
    "x": 23,
    "y": 17
  },
  "374": {
    "x": 24,
    "y": 16
  },
  "375": {
    "x": 22,
    "y": 17
  },
  "376": {
    "x": 24,
    "y": 17
  },
  "377": {
    "x": 23,
    "y": 15
  },
  "378": {
    "x": 25,
    "y": 16
  },
  "379": {
    "x": 25,
    "y": 18
  },
  "380": {
    "x": 23,
    "y": 18
  },
  "381": {
    "x": 25,
    "y": 17
  },
  "382": {
    "x": 24,
    "y": 18
  },
  "383": {
    "x": 24,
    "y": 14
  },
  "384": {
    "x": 22,
    "y": 18
  },
  "385": {
    "x": 23,
    "y": 19
  },
  "386": {
    "x": 22,
    "y": 19
  },
  "387": {
    "x": 21,
    "y": 17
  },
  "388": {
    "x": 21,
    "y": 18
  },
  "389": {
    "x": 21,
    "y": 19
  },
  "390": {
    "x": 26,
    "y": 17
  },
  "391": {
    "x": 26,
    "y": 16
  },
  "392": {
    "x": 26,
    "y": 18
  },
  "393": {
    "x": 23,
    "y": 20
  },
  "394": {
    "x": 22,
    "y": 20
  },
  "395": {
    "x": 24,
    "y": 20
  },
  "396": {
    "x": 24,
    "y": 19
  },
  "397": {
    "x": 25,
    "y": 20
  },
  "398": {
    "x": 25,
    "y": 19
  },
  "399": {
    "x": 25,
    "y": 15
  },
  "400": {
    "x": 21,
    "y": 20
  },
  "401": {
    "x": 27,
    "y": 19
  },
  "402": {
    "x": 27,
    "y": 18
  },
  "403": {
    "x": 26,
    "y": 19
  },
  "404": {
    "x": 27,
    "y": 17
  },
  "405": {
    "x": 28,
    "y": 18
  },
  "406": {
    "x": 2,
    "y": 1
  },
  "407": {
    "x": 1,
    "y": 1
  },
  "408": {
    "x": 1,
    "y": 2
  },
  "409": {
    "x": 5,
    "y": 10
  },
  "410": {
    "x": 4,
    "y": 16
  },
  "411": {
    "x": 6,
    "y": 10
  },
  "412": {
    "x": 6,
    "y": 11
  },
  "413": {
    "x": 6,
    "y": 15
  },
  "414": {
    "x": 6,
    "y": 16
  },
  "415": {
    "x": 20,
    "y": 6
  },
  "416": {
    "x": 23,
    "y": 10
  },
  "417": {
    "x": 14,
    "y": 17
  },
  "418": {
    "x": 13,
    "y": 17
  },
  "419": {
    "x": 28,
    "y": 3
  },
  "420": {
    "x": 29,
    "y": 2
  },
  "421": {
    "x": 30,
    "y": 1
  },
  "422": {
    "x": 28,
    "y": 2
  },
  "423": {
    "x": 28,
    "y": 1
  },
  "424": {
    "x": 27,
    "y": 1
  },
  "425": {
    "x": 29,
    "y": 3
  },
  "426": {
    "x": 27,
    "y": 2
  },
  "427": {
    "x": 29,
    "y": 1
  },
  "428": {
    "x": 27,
    "y": 3
  },
  "429": {
    "x": 30,
    "y": 2
  },
  "430": {
    "x": 30,
    "y": 3
  },
  "431": {
    "x": 31,
    "y": 1
  },
  "432": {
    "x": 29,
    "y": 4
  },
  "433": {
    "x": 32,
    "y": 1
  },
  "434": {
    "x": 31,
    "y": 2
  },
  "435": {
    "x": 31,
    "y": 3
  },
  "436": {
    "x": 32,
    "y": 2
  },
  "437": {
    "x": 30,
    "y": 4
  },
  "438": {
    "x": 29,
    "y": 5
  },
  "439": {
    "x": 28,
    "y": 4
  },
  "440": {
    "x": 32,
    "y": 3
  },
  "441": {
    "x": 28,
    "y": 5
  },
  "442": {
    "x": 27,
    "y": 4
  },
  "443": {
    "x": 30,
    "y": 5
  },
  "444": {
    "x": 31,
    "y": 4
  },
  "445": {
    "x": 27,
    "y": 5
  },
  "446": {
    "x": 32,
    "y": 5
  },
  "447": {
    "x": 27,
    "y": 6
  },
  "448": {
    "x": 26,
    "y": 7
  },
  "449": {
    "x": 29,
    "y": 6
  },
  "450": {
    "x": 31,
    "y": 5
  },
  "451": {
    "x": 32,
    "y": 6
  },
  "452": {
    "x": 28,
    "y": 6
  },
  "453": {
    "x": 29,
    "y": 7
  },
  "454": {
    "x": 32,
    "y": 7
  },
  "455": {
    "x": 31,
    "y": 6
  },
  "456": {
    "x": 30,
    "y": 6
  },
  "457": {
    "x": 28,
    "y": 12
  },
  "458": {
    "x": 28,
    "y": 13
  },
  "459": {
    "x": 29,
    "y": 13
  },
  "460": {
    "x": 28,
    "y": 11
  },
  "461": {
    "x": 29,
    "y": 14
  },
  "462": {
    "x": 30,
    "y": 13
  },
  "463": {
    "x": 28,
    "y": 15
  },
  "464": {
    "x": 29,
    "y": 10
  },
  "465": {
    "x": 28,
    "y": 14
  },
  "466": {
    "x": 31,
    "y": 12
  },
  "467": {
    "x": 29,
    "y": 12
  },
  "468": {
    "x": 27,
    "y": 15
  },
  "469": {
    "x": 29,
    "y": 15
  },
  "470": {
    "x": 30,
    "y": 12
  },
  "471": {
    "x": 30,
    "y": 14
  },
  "472": {
    "x": 27,
    "y": 14
  },
  "473": {
    "x": 31,
    "y": 13
  },
  "474": {
    "x": 31,
    "y": 14
  },
  "475": {
    "x": 32,
    "y": 13
  },
  "476": {
    "x": 26,
    "y": 14
  },
  "477": {
    "x": 32,
    "y": 12
  },
  "478": {
    "x": 32,
    "y": 15
  },
  "479": {
    "x": 28,
    "y": 16
  },
  "480": {
    "x": 26,
    "y": 15
  },
  "481": {
    "x": 28,
    "y": 17
  },
  "482": {
    "x": 32,
    "y": 14
  },
  "483": {
    "x": 31,
    "y": 15
  },
  "484": {
    "x": 31,
    "y": 11
  },
  "485": {
    "x": 25,
    "y": 14
  },
  "486": {
    "x": 32,
    "y": 11
  },
  "487": {
    "x": 27,
    "y": 13
  },
  "488": {
    "x": 30,
    "y": 11
  },
  "489": {
    "x": 32,
    "y": 16
  },
  "490": {
    "x": 25,
    "y": 13
  },
  "491": {
    "x": 29,
    "y": 11
  },
  "492": {
    "x": 27,
    "y": 12
  },
  "493": {
    "x": 27,
    "y": 16
  },
  "494": {
    "x": 26,
    "y": 13
  },
  "495": {
    "x": 5,
    "y": 19
  },
  "496": {
    "x": 5,
    "y": 20
  },
  "497": {
    "x": 6,
    "y": 20
  },
  "498": {
    "x": 5,
    "y": 18
  },
  "499": {
    "x": 5,
    "y": 21
  },
  "500": {
    "x": 4,
    "y": 18
  },
  "501": {
    "x": 7,
    "y": 20
  },
  "502": {
    "x": 4,
    "y": 20
  },
  "503": {
    "x": 6,
    "y": 19
  },
  "504": {
    "x": 6,
    "y": 21
  },
  "505": {
    "x": 4,
    "y": 21
  },
  "506": {
    "x": 7,
    "y": 22
  },
  "507": {
    "x": 4,
    "y": 19
  },
  "508": {
    "x": 7,
    "y": 19
  },
  "509": {
    "x": 3,
    "y": 20
  },
  "510": {
    "x": 3,
    "y": 19
  },
  "511": {
    "x": 3,
    "y": 18
  },
  "512": {
    "x": 4,
    "y": 17
  },
  "513": {
    "x": 3,
    "y": 17
  },
  "514": {
    "x": 6,
    "y": 17
  },
  "515": {
    "x": 2,
    "y": 20
  },
  "516": {
    "x": 2,
    "y": 18
  },
  "517": {
    "x": 7,
    "y": 21
  },
  "518": {
    "x": 8,
    "y": 22
  },
  "519": {
    "x": 6,
    "y": 18
  },
  "520": {
    "x": 2,
    "y": 17
  },
  "521": {
    "x": 2,
    "y": 19
  },
  "522": {
    "x": 5,
    "y": 22
  },
  "523": {
    "x": 7,
    "y": 18
  },
  "524": {
    "x": 9,
    "y": 21
  },
  "525": {
    "x": 9,
    "y": 22
  },
  "526": {
    "x": 8,
    "y": 20
  },
  "527": {
    "x": 5,
    "y": 17
  },
  "528": {
    "x": 3,
    "y": 21
  },
  "529": {
    "x": 5,
    "y": 16
  },
  "530": {
    "x": 8,
    "y": 21
  },
  "531": {
    "x": 7,
    "y": 17
  },
  "532": {
    "x": 9,
    "y": 20
  },
  "533": {
    "x": 21,
    "y": 21
  },
  "534": {
    "x": 22,
    "y": 22
  },
  "535": {
    "x": 20,
    "y": 21
  },
  "536": {
    "x": 21,
    "y": 22
  },
  "537": {
    "x": 19,
    "y": 21
  },
  "538": {
    "x": 22,
    "y": 21
  },
  "539": {
    "x": 23,
    "y": 21
  },
  "540": {
    "x": 20,
    "y": 22
  }
};

// Generates all 300 sectors deterministically
export const STORY_SECTORS: StorySector[] = Array.from({ length: TOTAL_SECTORS }, (_, idx) => {
  const id = idx + 1;
  const biome = getBiomeForSector(id);
  const icon = getIconForBiome(biome, id);
  const boss = BOSS_SECTORS[id];
  const recommendedLevel = getRecommendedLevel(biome, id);
  const isAlwaysAccessible = id === 3;

  const coord = SECTOR_EXACT_COORDINATES[id] || {
    x: ((id - 1) % SECTOR_GRID_WIDTH) + 1,
    y: Math.floor((id - 1) / SECTOR_GRID_WIDTH) + 1,
  };
  const x = coord.x;
  const y = coord.y;
  const group = SECTOR_GROUPS.find((g) => g.id === biome) || SECTOR_GROUPS[0];

  let name = `Sector ${id}: ${biome.replace('_', ' ').toUpperCase()} (${x},${y})`;
  let description = `Area within the ${group.name} region.`;

  if (id === 2) {
    name = 'Sector 2: The House (Start)';
    description = "Ben's cozy living room carpet. Where Jefe awoke alone to find all plushies taken outside!";
  } else if (id === 3) {
    name = 'Sector 3: The Backyard (Grind & Test Sanctuary)';
    description = 'The sunny backyard lawn. Always open for non-canon training, testing new presets, and card farming!';
  } else if (id === 7) {
    name = 'Sector 7: Bedroom Sock Drawer';
    description = 'Where Alex is stuck taking a nap under warm wool socks!';
  } else if (id === 16) {
    name = 'Sector 16: Vegetable Garden';
    description = 'Overgrown lettuce planter boxes where Shadow is caught in spider cobwebs!';
  } else if (id === 18) {
    name = 'Sector 18: Workshop Shed (Armory 1/16)';
    description = 'The backyard tool shed where the Equipment Armory is stored and Finlee is trapped!';
  } else if (id === 38) {
    name = 'Sector 38: The Fairy Well';
    description = 'An enchanted birdbath fountain where duplicate cards permanently empower Espers (Milestone 1/8)!';
  } else if (id === 48) {
    name = "Sector 48: Necak's Flagstone Patio";
    description = "Flagstone path where Spot is digging up tracks near Necak's porch!";
  } else if (id === 50) {
    name = "Sector 50: Necak's Star Workshop (Lab 3/32)";
    description = 'An astral fusion table glowing with star energy where 1★+1★ cards fuse into higher stars!';
  } else if (id === 56) {
    name = "Sector 56: Necak's Barn Sanctuary";
    description = "Necak's red barn where Cow is cornered by the Hay Baler Titan!";
  } else if (id === 62) {
    name = 'Sector 62: Apartment Breezeway';
    description = 'A breezy concrete walkway where Slugmee leaves a protective slime trail!';
  } else if (id === 68) {
    name = "Sector 68: Stepping Stones Terrace";
    description = "Stone garden steps where Spike has curled into a defensive spine ball!";
  } else if (id === 80) {
    name = 'Sector 80: High-Rise Balcony';
    description = 'A high-rise apartment balcony where Cidney hoards giant acorns!';
  } else if (id === 88) {
    name = 'Sector 88: Elevator Shaft';
    description = 'A windy shaft where Chanteira sings to disorient hostile wind-up toys!';
  } else if (id === 112) {
    name = 'Sector 112: Canyon Creek';
    description = 'Dense rocky creek where Sluger trains his heavyweight punches!';
  } else if (id === 122) {
    name = 'Sector 122: Forest Picnic Table';
    description = 'A sun-dappled wooden picnic table where Joann disrupts enemy battle plans!';
  } else if (id === 125) {
    name = 'Sector 125: Treetop Canopy';
    description = 'Sunlit mossy branches where Fifi releases fragrant tactical smoke clouds!';
  } else if (id === 130) {
    name = 'Sector 130: Forest Pine Spire';
    description = 'The highest evergreen spire where George watches the horizon in multi-mood form!';
  } else if (id === 148) {
    name = 'Sector 148: Beach Golden Shoreline';
    description = 'Sunlit sandy shoreline where Allie is marooned amongst tidal driftwood!';
  } else if (id === 155) {
    name = 'Sector 155: Beach Umbrella Camp';
    description = 'Striped beach umbrellas fluttering in the breeze where Rialu channels pure healing aura!';
  } else if (id === 162) {
    name = 'Sector 162: Rocky Tide Pools';
    description = 'Saltwater rock pools full of hermit crabs where Thumper is hopping with heavy impacts!';
  } else if (id === 185) {
    name = 'Sector 185: Bioluminescent Trench';
    description = 'Glowing underwater reefs and neon jellyfish where Lessteeth is entangled in kelp!';
  } else if (id === 195) {
    name = 'Sector 195: Upgel Didav';
    description = 'The mythical sunken coral citadel in the ocean depths where Dolphy awaits rescue!';
  } else if (id === 205) {
    name = 'Sector 205: Ocean Deep Trench';
    description = 'The deepest ocean floor where Beaker is conducting pressurized deep-sea alchemy!';
  } else if (id === 220) {
    name = 'Sector 220: Suburb Oak Avenue';
    description = 'Leafy neighborhood avenue where Evee charges high-tech laser adaptations!';
  } else if (id === 235) {
    name = 'Sector 235: Suburb Cul-de-Sac';
    description = 'Peaceful residential circle where Dear darts past patrolling clockwork cars!';
  } else if (id === 250) {
    name = 'Sector 250: Jungle Gym Spire';
    description = 'Towering metal climbing dome where Cole spins his shell to shield the squad!';
  } else if (id === 262) {
    name = 'Sector 262: Mega Spiral Slide';
    description = 'Giant green tube slide where Henry turtles up against howling wind gusts!';
  } else if (id === 275) {
    name = 'Sector 275: Astral Star Bridge';
    description = 'A celestial bridge woven of luminescent purple starlight where Pinky Bear guards sweet treats!';
  } else if (id === 285) {
    name = 'Sector 285: Moonlit Carnival Grand Tent';
    description = 'Gleaming striped carnival tent where Pinky Bear guards spun sugar treats!';
  } else if (id === 301) {
    name = 'Sector 301: Funhouse Mirror Labyrinth';
    description = 'Dizzying kaleidoscopic mirror corridors guarded by the Funhouse Master!';
  } else if (id === 320) {
    name = 'Sector 320: Crystal Geode Sanctuary';
    description = 'A cavern of glowing amethyst stalactites where Big Bear slumbers safely!';
  } else if (id === 336) {
    name = 'Sector 336: Crystal Colossus Cavern';
    description = 'Subterranean sapphire chamber guarded by the towering Crystal Colossus!';
  } else if (id === 355) {
    name = 'Sector 355: Great Pendulum Clockwork Spire';
    description = 'A towering chamber of swinging brass pendulums where Umbratail weaves lunar shields!';
  } else if (id === 370) {
    name = 'Sector 370: Chrono Gear Apex';
    description = 'The apex platform of the Clockwork Tower guarded by the Chrono Sentinel!';
  } else if (id === 395) {
    name = 'Sector 395: Astral Citadel Gates';
    description = 'The monumental stardust gates of the Citadel where celestial threads weave the final bridge!';
  } else if (id === 300) {
    name = 'Sector 300: Moonlit Carnival Grand Tent';
    description = 'Gleaming striped carnival tent where Pinky Bear guards spun sugar treats!';
  } else if (id === 440) {
    name = 'Sector 440: Sky Islands Sanctuary';
    description = 'Floating cloud garden above the clouds where Big Bear slumbers peacefully!';
  } else if (id === 480) {
    name = 'Sector 480: Magma Ridge Obsidian Forge';
    description = 'Deep volcanic obsidian hall where Umbratail channels pure moonlight shields against dragonfire!';
  } else if (id === 540) {
    name = "Sector 540: The Stitchmaster's Citadel";
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
    questType: undefined,
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
