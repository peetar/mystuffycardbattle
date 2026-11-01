/**
 * Story Mode World Map (150 Sectors)
 * Non-rectangular adventure landscape featuring 10 weird blob-shaped sector groups,
 * 72 hours of grinding depth, and progressive facility unlocks.
 */

import { StorySector, SectorBiome, QuestType } from '@/types/story';

export const TOTAL_SECTORS = 150;

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
    sectorIds: [1, 2, 4, 5, 6, 7, 8],
    recommendedLevelRange: 'Lv. 1 - 8',
    description: "Ben's cozy room, hallway, and attic where Jefe woke up alone.",
    blobShapeClass: 'rounded-[3rem_1.5rem_2.5rem_4rem]',
    gradientClass: 'from-amber-950/90 via-stone-900/90 to-amber-900/70 border-amber-800/60 shadow-amber-950/50',
  },
  {
    id: 'backyard',
    name: 'The Backyard',
    icon: '🌿',
    sectorIds: [3, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    recommendedLevelRange: 'Lv. 8 - 18',
    description: 'Winding lawn terraces, the Fairy Well, and the Workshop Armory.',
    blobShapeClass: 'rounded-[2rem_4rem_1.5rem_3.5rem]',
    gradientClass: 'from-emerald-950/90 via-green-950/80 to-emerald-900/70 border-emerald-800/60 shadow-emerald-950/50',
  },
  {
    id: 'necak_house',
    name: "Necak's House",
    icon: '🏡',
    sectorIds: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    recommendedLevelRange: 'Lv. 18 - 28',
    description: "Neighbor's rustic hillside sanctuary, the Star Lab, and Cow's barn.",
    blobShapeClass: 'rounded-[3.5rem_2rem_4rem_1.5rem]',
    gradientClass: 'from-rose-950/90 via-red-950/80 to-amber-950/70 border-rose-800/60 shadow-rose-950/50',
  },
  {
    id: 'apartment',
    name: 'The Apartment Complex',
    icon: '🏢',
    sectorIds: [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
    recommendedLevelRange: 'Lv. 28 - 38',
    description: 'High-rise lobbies, fire escapes, and windy multi-story balconies.',
    blobShapeClass: 'rounded-[1.5rem_3.5rem_2rem_4rem]',
    gradientClass: 'from-slate-900 via-indigo-950/80 to-slate-950 border-indigo-800/60 shadow-indigo-950/50',
  },
  {
    id: 'wild_forest',
    name: 'The Wild Forest',
    icon: '🌲',
    sectorIds: [55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74],
    recommendedLevelRange: 'Lv. 38 - 50',
    description: 'Overgrown briars, ancient hollow oaks, and treetop canopy lookouts.',
    blobShapeClass: 'rounded-[4rem_2rem_3.5rem_1.5rem]',
    gradientClass: 'from-teal-950/90 via-emerald-950/85 to-teal-900/70 border-teal-800/60 shadow-teal-950/50',
  },
  {
    id: 'beach',
    name: 'The Beach',
    icon: '🏖️',
    sectorIds: [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
    recommendedLevelRange: 'Lv. 50 - 62',
    description: 'Golden dunes, driftwood coves, umbrella camps, and rocky tide pools.',
    blobShapeClass: 'rounded-[2.5rem_4.5rem_1.5rem_3rem]',
    gradientClass: 'from-yellow-950/90 via-amber-950/80 to-stone-900 border-yellow-700/60 shadow-yellow-950/50',
  },
  {
    id: 'ocean',
    name: 'The Ocean & Upgel Didav',
    icon: '🌊',
    sectorIds: [91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110],
    recommendedLevelRange: 'Lv. 62 - 74',
    description: 'Sunken coral atolls, deep trenches, and the sunken citadel of Upgel Didav.',
    blobShapeClass: 'rounded-[3rem_2rem_4.5rem_2.5rem]',
    gradientClass: 'from-cyan-950/95 via-blue-950/85 to-teal-950/80 border-cyan-800/60 shadow-cyan-950/50',
  },
  {
    id: 'suburb',
    name: 'Suburb Avenue',
    icon: '🏘️',
    sectorIds: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124],
    recommendedLevelRange: 'Lv. 74 - 82',
    description: 'Leafy neighborhood loops, sidewalk cul-de-sacs, and autumn roads.',
    blobShapeClass: 'rounded-[2rem_3.5rem_2rem_3.5rem]',
    gradientClass: 'from-violet-950/80 via-purple-950/70 to-slate-900 border-violet-800/60 shadow-violet-950/50',
  },
  {
    id: 'playground',
    name: 'Adventure Playground',
    icon: '🛝',
    sectorIds: [125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136],
    recommendedLevelRange: 'Lv. 82 - 88',
    description: 'Towering metal jungle gyms, monkey bar courses, and mega spiral slides.',
    blobShapeClass: 'rounded-[3.5rem_1.5rem_3rem_2.5rem]',
    gradientClass: 'from-orange-950/80 via-amber-950/70 to-stone-900 border-orange-800/60 shadow-orange-950/50',
  },
  {
    id: 'astral',
    name: 'The Astral Citadel',
    icon: '🌌',
    sectorIds: [137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150],
    recommendedLevelRange: 'Lv. 88 - 100',
    description: 'Swirling celestial thread bridges leading into the Stitchmaster Throne.',
    blobShapeClass: 'rounded-[4.5rem_2rem_3.5rem_4rem]',
    gradientClass: 'from-purple-950/90 via-fuchsia-950/80 to-indigo-950/90 border-purple-800/60 shadow-purple-950/50',
  },
];

export function getBiomeForSector(id: number): SectorBiome {
  if (id === 3) return 'backyard';
  if (id <= 8) return 'house';
  if (id <= 22) return 'backyard';
  if (id <= 36) return 'necak_house';
  if (id <= 54) return 'apartment';
  if (id <= 74) return 'wild_forest';
  if (id <= 90) return 'beach';
  if (id <= 110) return 'ocean';
  if (id <= 124) return 'suburb';
  if (id <= 136) return 'playground';
  return 'astral';
}

export function getIconForBiome(biome: SectorBiome, id: number): string {
  if (id === 2) return '🏠'; // The House (Start)
  if (id === 3) return '🌳'; // The Backyard (Always Accessible)
  if (id === 13) return '⛲'; // Fairy Well
  if (id === 18) return '🔨'; // Workshop Armory
  if (id === 30) return '🔮'; // Evolution Lab
  if (id === 35) return '🐄'; // Necak's Barn (Cow)
  if (id === 100) return '🐬'; // Upgel Didav in Ocean (Dolphy)
  if (id === 150) return '👑'; // Stitchmaster's Citadel
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

export function getRecommendedLevel(biome: SectorBiome, id: number): number {
  switch (biome) {
    case 'house':
      return Math.min(8, Math.max(1, Math.round(1 + ((id - 1) / 7) * 7)));
    case 'backyard':
      return Math.min(18, Math.max(8, Math.round(8 + ((id - 9) / 13) * 10)));
    case 'necak_house':
      return Math.min(28, Math.max(18, Math.round(18 + ((id - 23) / 13) * 10)));
    case 'apartment':
      return Math.min(38, Math.max(28, Math.round(28 + ((id - 37) / 17) * 10)));
    case 'wild_forest':
      return Math.min(50, Math.max(38, Math.round(38 + ((id - 55) / 19) * 12)));
    case 'beach':
      return Math.min(62, Math.max(50, Math.round(50 + ((id - 75) / 15) * 12)));
    case 'ocean':
      return Math.min(74, Math.max(62, Math.round(62 + ((id - 91) / 19) * 12)));
    case 'suburb':
      return Math.min(82, Math.max(74, Math.round(74 + ((id - 111) / 13) * 8)));
    case 'playground':
      return Math.min(88, Math.max(82, Math.round(82 + ((id - 125) / 11) * 6)));
    case 'astral':
      return Math.min(100, Math.max(88, Math.round(88 + ((id - 137) / 13) * 12)));
    default:
      return 1;
  }
}

// Side quests across the 150 sectors
export const SIDE_QUEST_SECTOR_IDS = new Set<number>([
  3, 5, 11, 14, 21, 29, 42, 60, 66, 82, 94, 108, 118, 132, 144
]);

// Landmark Boss Sectors
const BOSS_SECTORS: Record<number, { bossSpeciesId: string; bossName: string }> = {
  8: { bossSpeciesId: 'vacuum_beast', bossName: 'The Dust Gobbler' },
  18: { bossSpeciesId: 'shredder_prime', bossName: 'Workshop Gear Golem' },
  35: { bossSpeciesId: 'weed_whacker', bossName: "Necak's Hay Baler Titan" },
  54: { bossSpeciesId: 'street_hound', bossName: 'Stray Scrapper Rex' },
  74: { bossSpeciesId: 'amalgam', bossName: 'Shadow of the Pines' },
  90: { bossSpeciesId: 'sand_serpent', bossName: 'The Sandbar Titan' },
  100: { bossSpeciesId: 'aquatic_ray', bossName: 'Manta of Upgel Didav' },
  110: { bossSpeciesId: 'aquatic_kraken', bossName: 'Abyssal Kraken' },
  124: { bossSpeciesId: 'clockwork_nuke', bossName: 'Clockwork Patrol Warden' },
  136: { bossSpeciesId: 'volt_colossus', bossName: 'The Playground Titan' },
  150: { bossSpeciesId: 'stitchmaster_final', bossName: 'The Stitchmaster' },
};

// Generates all 150 sectors deterministically
export const STORY_SECTORS: StorySector[] = Array.from({ length: TOTAL_SECTORS }, (_, idx) => {
  const id = idx + 1;
  const biome = getBiomeForSector(id);
  const icon = getIconForBiome(biome, id);
  const boss = BOSS_SECTORS[id];
  const recommendedLevel = getRecommendedLevel(biome, id);
  const isAlwaysAccessible = id === 3;

  // Global coordinates across non-rectangular world landscape
  const group = SECTOR_GROUPS.find((g) => g.id === biome) || SECTOR_GROUPS[0];
  const groupIdx = group.sectorIds.indexOf(id);
  const x = (groupIdx % 5) + 1;
  const y = Math.floor(groupIdx / 5) + 1;

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
  } else if (id === 13) {
    name = 'Sector 13: The Fairy Well';
    description = 'An enchanted birdbath fountain where duplicate cards permanently empower Espers (Milestone 1/8)!';
  } else if (id === 16) {
    name = 'Sector 16: Vegetable Garden';
    description = 'Overgrown lettuce planter boxes where Shadow is caught in spider cobwebs!';
  } else if (id === 18) {
    name = 'Sector 18: Workshop Shed (Armory 1/16)';
    description = 'The backyard tool shed where the Equipment Armory is stored and Finlee is trapped!';
  } else if (id === 26) {
    name = "Sector 26: Necak's Hayloft Trail";
    description = "A trail of hay bales leading toward Necak's property where Slugmee leaves a slime trail!";
  } else if (id === 28) {
    name = "Sector 28: Necak's Stepping Terrace";
    description = "Stone garden steps where Spike has curled into a defensive spine ball!";
  } else if (id === 30) {
    name = "Sector 30: Necak's Star Workshop (Lab 3/32)";
    description = 'An astral fusion table glowing with star energy where 1★+1★ cards fuse into higher stars!';
  } else if (id === 32) {
    name = "Sector 32: Necak's Flagstone Patio";
    description = "Flagstone path where Spot is digging up tracks near Necak's porch!";
  } else if (id === 35) {
    name = "Sector 35: Necak's Barn Sanctuary";
    description = "Necak's red barn where Cow is cornered by the Hay Baler Titan!";
  } else if (id === 44) {
    name = 'Sector 44: High-Rise Foyer';
    description = 'The tiled entryway of the apartment building where Cydney is cornered by mechanical toys!';
  } else if (id === 52) {
    name = 'Sector 52: 2nd Floor Breezeway';
    description = 'A windy concrete apartment walkway where Chantiera sings to hold off storm gulls!';
  } else if (id === 62) {
    name = 'Sector 62: Wild Forest Bramble';
    description = 'Dense thorny underbrush at the edge of the wild woods where Sluger is pinned down!';
  } else if (id === 68) {
    name = 'Sector 68: Deep Canopy Grove';
    description = 'Sunlit mossy branches where Fifi is surrounded by wild woodland critters!';
  } else if (id === 74) {
    name = 'Sector 74: Great Treetop Lookout';
    description = 'The highest oak bough overlooking the coast where George is perched in danger!';
  } else if (id === 80) {
    name = 'Sector 80: Beach Golden Shoreline';
    description = 'Sunlit sandy shoreline where Allie is marooned amongst tidal driftwood!';
  } else if (id === 85) {
    name = 'Sector 85: Beach Umbrella Camp';
    description = 'Striped beach umbrellas fluttering in the breeze where Rialou channels his aura!';
  } else if (id === 90) {
    name = 'Sector 90: Tide Pool Shallows';
    description = 'Saltwater rock pools full of hermit crabs where Thumper is hopping for safety!';
  } else if (id === 100) {
    name = 'Sector 100: Upgel Didav';
    description = 'The mythical sunken coral citadel in the ocean depths where Dolphy awaits rescue!';
  } else if (id === 105) {
    name = 'Sector 105: Bioluminescent Trench';
    description = 'Glowing underwater reefs and neon jellyfish where Toothless is entangled in kelp!';
  } else if (id === 110) {
    name = 'Sector 110: Ocean Deep Trench';
    description = 'The deepest ocean floor where Beaker is trapped inside a pressurized diving bell!';
  } else if (id === 116) {
    name = 'Sector 116: Suburb Oak Avenue';
    description = 'Leafy street where Eevee is trapped in the basket of a runaway toy bicycle!';
  } else if (id === 122) {
    name = 'Sector 122: Suburb Cul-de-Sac';
    description = 'Peaceful residential circle where Dear is surrounded by clockwork patrol cars!';
  } else if (id === 130) {
    name = 'Sector 130: Jungle Gym Spire';
    description = 'Towering metal climbing dome where Cole defends the summit against toy bullies!';
  } else if (id === 136) {
    name = 'Sector 136: Mega Spiral Slide';
    description = 'Giant green tube slide where Henry stands guard against howling gusts!';
  } else if (id === 141) {
    name = 'Sector 141: Astral Star Bridge';
    description = 'A celestial bridge woven of luminescent purple starlight where Pinky Bear waits!';
  } else if (id === 145) {
    name = 'Sector 145: Astral Nebula Spire';
    description = 'A cosmic pinnacle where Big Bear battles celestial thread fiends!';
  } else if (id === 149) {
    name = 'Sector 149: Citadel Gates';
    description = 'The monumental obsidian gates of the Citadel where Umbreon is bound in dark threads!';
  } else if (id === 150) {
    name = "Sector 150: The Stitchmaster's Citadel";
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
