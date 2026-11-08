export type ResourceType =
  | 'wood'
  | 'oil'
  | 'water'
  | 'string'
  | 'stone'
  | 'glass'
  | 'sand'
  | 'coal'
  | 'lava'
  | 'wool'
  | 'honey'
  | 'beeswax'
  | 'clay'
  | 'marble'
  | 'granite'
  | 'fabric'
  | 'yarn'
  | 'metal'
  | 'steel'
  | 'electronics'
  | 'fossils';

export type DnaAttributeType = 'vitality' | 'ferocity' | 'speed' | 'defense' | 'instinct';

export interface DnaAttributes {
  vitality: number; // +10 Max HP per level to all stuffies
  ferocity: number; // +5% Attack & Card Damage per level
  speed: number;    // +8 Base Speed per level
  defense: number;  // +10 Starting Combat Shield per level
  instinct: number; // +3% Crit Chance & +2% Evasion per level
}

export type BuildingCategory =
  | 'container'
  | 'harvester'
  | 'residential'
  | 'crafting'
  | 'recreation'
  | 'civic';

export type BuildingType =
  | 'town_hall'
  | 'barrel'
  | 'houses'
  | 'lumberjack'
  | 'mine'
  | 'pump'
  | 'smelter'
  | 'smithy'
  | 'artisan'
  | 'quarry'
  | 'pasture'
  | 'apiary'
  | 'clay_pit'
  | 'magma_siphon'
  | 'fishing_dock'
  | 'windmill'
  | 'bank'
  | 'quest_board'
  | 'fluff_spa'
  | 'market'
  | 'dojo'
  | 'academy'
  | 'watchtower'
  | 'tailor'
  | 'arcade'
  | 'alchemy'
  | 'museum'
  | 'clocktower'
  | 'critter_barn'
  | 'campfire'
  | 'post_office'
  | 'scrap_workshop'
  | 'bounty_tavern'
  | 'loom'
  | 'playground'
  | 'forge'
  | 'charging_port'
  | 'herb_greenhouse'
  | 'crystal_mine'
  | 'apothecary'
  | 'foundry'
  | 'glassworks'
  | 'bakery'
  | 'observatory'
  | 'botanical_gardens'
  | 'steam_plant'
  | 'battery_bank'
  | 'silo'
  | 'vault_box'
  | 'stuffy_inn'
  | 'solar_collector'
  | 'mushroom_grove'
  | 'fossil_digsite'
  | 'tannery'
  | 'paper_mill'
  | 'jeweler'
  | 'tea_house'
  | 'amphitheater'
  | 'carousel'
  | 'grand_library'
  | 'waterfall_sanctuary'
  | 'cryo_vault'
  | 'gem_cutter'
  | 'hot_springs'
  | 'train_depot';

export interface BuildingDefinition {
  id: BuildingType;
  name: string;
  category: BuildingCategory;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  canRotate: boolean;
  cost: Partial<Record<ResourceType, number>>;
  harvestOptions?: ResourceType[];
  description: string;
  limit?: number;
}

export type UpgradeModuleType =
  | 'turbo_piston'
  | 'expanded_hopper'
  | 'reinforced_framing'
  | 'enriched_sifter'
  | 'cheer_bell'
  | 'catalytic_infuser'
  | 'overclock_sprocket'
  | 'stellar_core'
  | 'eco_turbine'
  | 'cartographer_lens'
  | 'robot_worker'
  | 'heavy_drill'
  | 'timber_axe'
  | 'siphon_nozzle'
  | 'artisan_hammer';

export interface UpgradeModuleItem {
  id: string;
  type: UpgradeModuleType;
  name: string;
  icon: string;
  effect: string;
  statBonus: {
    timeReductionPercent?: number; // e.g. 30% faster
    yieldBonusPercent?: number;    // e.g. +50% payload
    extraStorage?: number;         // e.g. +100 cap
    rareChancePercent?: number;    // e.g. +15% rare drop
    moraleAura?: number;           // e.g. +10 morale
    conversionBoost?: number;
  };
}

export type StuffyActivity =
  | 'working'
  | 'walking_to_work'
  | 'walking_to_house'
  | 'resting_at_house'
  | 'wandering';

export interface StuffySimState {
  id: string; // Stuffy ID (e.g. 'jefe', 'alex') or 'robot_1', etc.
  name: string;
  species: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  facing: 'left' | 'right';
  activity: StuffyActivity;
  assignedBuildingId: string | null;
  targetX?: number;
  targetY?: number;
  restTimer: number; // seconds remaining resting at house
  moraleBoostsGiven: number;
  isRobot: boolean;
}

export interface ArtisanRecipe {
  id: string;
  name: string;
  outputResource: ResourceType;
  outputAmount: number;
  icon: string;
  cost: Partial<Record<ResourceType, number>>;
  duration: number; // in seconds
  description: string;
}

export interface PotionRecipe {
  id: string;
  name: string;
  icon: string;
  cost: Partial<Record<ResourceType, number>>;
  duration: number; // in seconds
  description: string;
  effectType: 'heal' | 'morale' | 'speed' | 'warp' | 'crackers' | 'yields';
  effectValue: number;
}

export interface PlacedBuilding {
  id: string;
  type: BuildingType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: 0 | 90;
  level: number; // 1 to 5
  assignedResource?: ResourceType;
  assignedRecipeId?: string; // e.g. for Artisan's Workshop
  assignedStuffyId?: string | null; // Worker assigned to building ("things don't work without them")
  cycleProgress?: number; // 0 to cycleDuration
  cycleDuration?: number; // 15s for tier 1 (2 wood every 15s)
  isWarped?: boolean;
  lastHarvestTimestamp?: number;
  isConnectedToTownHall: boolean;
  upgradeSlots: (UpgradeModuleItem | null)[];
  maxUpgradeSlots: number;
}

export interface TechTreeNode {
  id: string;
  title: string;
  category: 'core' | 'harvesters' | 'crafting' | 'infrastructure' | 'morale';
  icon: string;
  cost: Partial<Record<ResourceType, number>>;
  prerequisites: string[];
  description: string;
  effectType: 'unlock_building' | 'slot_upgrade' | 'stat_boost' | 'unlock_recipe';
  targetBuildingType?: BuildingType;
  gridX: number; // Coordinate for visual dot-and-line tree (0 to 1000)
  gridY: number; // Coordinate for visual dot-and-line tree (0 to 800)
}

export type TerrainType =
  | 'grass'
  | 'forest'
  | 'water'
  | 'mountain'
  | 'sand'
  | 'volcanic'
  | 'clay_shore';

export type PathType = 'none' | 'dirt' | 'paved';

export interface GridTile {
  x: number;
  y: number;
  terrain: TerrainType;
  resources: ResourceType[];
  pathType: PathType;
  buildingId: string | null;
}

export interface ResearchTierInfo {
  tier: number;
  name: string;
  cost: Partial<Record<ResourceType, number>>;
  unlocksDescription: string;
}

export interface MoraleInfo {
  score: number;
  tier: number; // 1 to 4
  tierName: string;
  statBonusPercent: number; // 0, 5, 10, 15
  xpBonusPercent: number;
}
