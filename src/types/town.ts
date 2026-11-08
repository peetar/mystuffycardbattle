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
  | 'yarn';

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
  | 'playground';

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
  assignedStuffyIds?: string[];
  lastHarvestTimestamp?: number;
  isConnectedToTownHall: boolean;
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
