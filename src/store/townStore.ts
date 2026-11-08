import { create } from 'zustand';
import {
  GridTile,
  PlacedBuilding,
  ResourceType,
  BuildingType,
  PathType,
  TerrainType,
  MoraleInfo,
} from '@/types/town';
import { BUILDING_DEFINITIONS, RESEARCH_TIERS, BUILDING_UPGRADE_COSTS } from '@/data/townBuildings';

const TOWN_STORAGE_KEY = 'ben_stuffy_town_v45';
export const GRID_SIZE = 100;

export interface TownStore {
  grid: GridTile[][];
  resources: Record<ResourceType, number>;
  storageCaps: Record<ResourceType, number>;
  buildings: PlacedBuilding[];
  buildingStorage: Partial<Record<BuildingType, number>>;
  unlockedResearchTier: number; // 1 to 5
  selectedTile: { x: number; y: number } | null;
  selectedBuildingId: string | null;
  activeTool: 'inspect' | 'place' | 'road_dirt' | 'road_paved' | 'bulldoze';
  pendingPlacementType: BuildingType | null;
  placementRotation: 0 | 90;
  timeWarpMinutes: number;
  isTimeWarpActive: boolean;

  // Actions
  initializeTown: () => void;
  selectTile: (x: number, y: number) => void;
  setSelectedBuildingId: (id: string | null) => void;
  setActiveTool: (tool: 'inspect' | 'place' | 'road_dirt' | 'road_paved' | 'bulldoze') => void;
  setPendingPlacementType: (type: BuildingType | null) => void;
  togglePlacementRotation: () => void;

  constructBuilding: (type: BuildingType) => { success: boolean; message: string };
  placeBuilding: (type: BuildingType, x: number, y: number, rotation?: 0 | 90, assignedResource?: ResourceType) => boolean;
  pickupBuilding: (id: string) => boolean;
  rotatePlacedBuilding: (id: string) => boolean;
  upgradeBuilding: (id: string) => { success: boolean; message: string };
  researchNextTier: () => { success: boolean; message: string };
  setHarvesterResource: (id: string, resource: ResourceType) => void;

  setPath: (x: number, y: number, path: PathType) => boolean;
  clearTileRoad: (x: number, y: number) => void;

  addResource: (resource: ResourceType, amount: number) => void;
  addBuildingToStorage: (type: BuildingType, count: number) => void;
  harvestTick: () => { harvestedCount: number; blockedCount: number };
  updateConnectivity: () => void;
  recalculateCaps: () => void;
  getMoraleInfo: () => MoraleInfo;
}

const DEFAULT_RESOURCES: Record<ResourceType, number> = {
  wood: 120,
  oil: 40,
  water: 100,
  string: 60,
  stone: 100,
  glass: 30,
  sand: 60,
  coal: 40,
  lava: 0,
  wool: 20,
  honey: 15,
  beeswax: 15,
  clay: 30,
  marble: 20,
  granite: 20,
  fabric: 10,
  yarn: 0,
};

// Procedural organic terrain generator for 100x100 realistic landscape
function generateRealistic100Grid(): GridTile[][] {
  const grid: GridTile[][] = [];

  const simplexLike = (x: number, y: number, scale: number) => {
    return Math.sin(x * scale) * Math.cos(y * scale) + Math.sin((x + y) * scale * 0.7);
  };

  for (let y = 0; y < GRID_SIZE; y++) {
    const row: GridTile[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      let terrain: TerrainType = 'grass';
      const resources: ResourceType[] = [];

      // Major Winding River with Lake Basins (meandering through map)
      const riverCenterX = 35 + Math.sin(y / 7) * 12 + Math.cos(y / 15) * 8;
      const lakeDist1 = Math.hypot(x - 45, y - 50);
      const lakeDist2 = Math.hypot(x - 28, y - 82);
      const distToRiver = Math.abs(x - riverCenterX);

      if (distToRiver < 2.0 || lakeDist1 < 7 || lakeDist2 < 5) {
        terrain = 'water';
        resources.push('water');
      } else if (distToRiver < 4.2 || lakeDist1 < 9.5 || lakeDist2 < 7.5) {
        terrain = 'clay_shore';
        resources.push('clay', 'sand');
        if ((x + y) % 3 === 0) resources.push('water');
      }
      // Volcanic Caldera & Geothermal Fissures (Southeast corner: x > 75, y > 75)
      else if (x > 72 && y > 72 && simplexLike(x, y, 0.2) > -0.2) {
        terrain = 'volcanic';
        resources.push('lava', 'stone');
        if ((x * y) % 2 === 0) resources.push('oil');
      }
      // Mountain Ranges & Rocky Escarpments (Northeast: x > 65, y < 40; West Ridge: x < 20, y > 25 && y < 65)
      else if (
        (x > 62 && y < 42 && simplexLike(x, y, 0.15) > -0.3) ||
        (x < 22 && y > 22 && y < 68 && simplexLike(x, y, 0.18) > -0.2)
      ) {
        terrain = 'mountain';
        resources.push('stone', 'granite');
        if ((x + y) % 3 === 0) resources.push('marble');
        if ((x * y) % 4 === 0) resources.push('coal');
      }
      // Sand Dunes & Arid Badlands (South-central: x > 48 && x < 75, y > 45 && y < 75)
      else if (x > 46 && x < 74 && y > 44 && y < 72 && simplexLike(x, y, 0.12) > 0.1) {
        terrain = 'sand';
        resources.push('sand', 'stone');
      }
      // Dense Forests & Pine Woodlands (Northwest & Central Groves)
      else if (
        (x < 32 && y < 35 && simplexLike(x, y, 0.14) > -0.35) ||
        (x > 38 && x < 65 && y > 15 && y < 38 && simplexLike(x, y, 0.16) > -0.1) ||
        simplexLike(x, y, 0.22) > 0.5
      ) {
        terrain = 'forest';
        resources.push('wood');
        if ((x + y) % 2 === 0) resources.push('string');
      }
      // Meadow Clearings & Gentle Fields
      else {
        terrain = 'grass';
        if ((x * 7 + y * 13) % 23 === 0) resources.push('wood');
        if ((x * 11 + y * 5) % 19 === 0) resources.push('string');
        if ((x * 3 + y * 9) % 31 === 0) resources.push('water');
      }

      row.push({
        x,
        y,
        terrain,
        resources,
        pathType: 'none',
        buildingId: null,
      });
    }
    grid.push(row);
  }
  return grid;
}

export const useTownStore = create<TownStore>((set, get) => ({
  grid: generateRealistic100Grid(),
  resources: { ...DEFAULT_RESOURCES },
  storageCaps: Object.keys(DEFAULT_RESOURCES).reduce((acc, k) => {
    acc[k as ResourceType] = 200;
    return acc;
  }, {} as Record<ResourceType, number>),
  buildings: [],
  // Start with Town Hall, Research Lab (Academy), 3 Houses, Lumberjack, Mine, and 2 Barrels!
  buildingStorage: {
    town_hall: 1,
    academy: 1,
    houses: 3,
    lumberjack: 1,
    mine: 1,
    barrel: 2,
  },
  unlockedResearchTier: 1,
  selectedTile: null,
  selectedBuildingId: null,
  activeTool: 'inspect',
  pendingPlacementType: null,
  placementRotation: 0,
  timeWarpMinutes: 30,
  isTimeWarpActive: false,

  initializeTown: () => {
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem(TOWN_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.grid && parsed.grid.length === GRID_SIZE && parsed.resources) {
            set({
              grid: parsed.grid,
              resources: parsed.resources,
              buildings: parsed.buildings || [],
              buildingStorage: parsed.buildingStorage || { town_hall: 1, academy: 1, houses: 3 },
              unlockedResearchTier: parsed.unlockedResearchTier ?? 1,
              timeWarpMinutes: parsed.timeWarpMinutes ?? 30,
            });
            get().recalculateCaps();
            get().updateConnectivity();
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load town save, generating fresh 100x100 grid', e);
    }
    get().recalculateCaps();
  },

  selectTile: (x, y) => {
    const { grid } = get();
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    const tile = grid[y][x];
    set({
      selectedTile: { x, y },
      selectedBuildingId: tile.buildingId || null,
    });
  },

  setSelectedBuildingId: (id) => set({ selectedBuildingId: id }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setPendingPlacementType: (type) => set({ pendingPlacementType: type, activeTool: type ? 'place' : 'inspect' }),
  togglePlacementRotation: () =>
    set((state) => ({ placementRotation: state.placementRotation === 0 ? 90 : 0 })),

  recalculateCaps: () => {
    const { buildings } = get();
    const newCaps: Record<ResourceType, number> = Object.keys(DEFAULT_RESOURCES).reduce((acc, k) => {
      acc[k as ResourceType] = 150;
      return acc;
    }, {} as Record<ResourceType, number>);

    let hasBank = false;
    for (const b of buildings) {
      if (b.type === 'barrel' && b.assignedResource) {
        newCaps[b.assignedResource] = (newCaps[b.assignedResource] || 150) + 150 * b.level;
      }
      if (b.type === 'bank') {
        hasBank = true;
      }
    }

    if (hasBank) {
      for (const res of Object.keys(newCaps) as ResourceType[]) {
        newCaps[res] += 2500;
      }
    }

    set({ storageCaps: newCaps });
  },

  updateConnectivity: () => {
    const { grid, buildings } = get();
    const townHall = buildings.find((b) => b.type === 'town_hall');

    if (!townHall) {
      const updated = buildings.map((b) => ({ ...b, isConnectedToTownHall: false }));
      set({ buildings: updated });
      return;
    }

    const visitedRoads = new Set<string>();
    const queue: [number, number][] = [];

    const thX1 = townHall.x;
    const thY1 = townHall.y;
    const thX2 = thX1 + townHall.width - 1;
    const thY2 = thY1 + townHall.height - 1;

    for (let y = Math.max(0, thY1 - 1); y <= Math.min(GRID_SIZE - 1, thY2 + 1); y++) {
      for (let x = Math.max(0, thX1 - 1); x <= Math.min(GRID_SIZE - 1, thX2 + 1); x++) {
        if (grid[y][x].pathType !== 'none') {
          const key = `${x},${y}`;
          visitedRoads.add(key);
          queue.push([x, y]);
        }
      }
    }

    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      for (const [dx, dy] of dirs) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
          const key = `${nx},${ny}`;
          if (!visitedRoads.has(key) && grid[ny][nx].pathType !== 'none') {
            visitedRoads.add(key);
            queue.push([nx, ny]);
          }
        }
      }
    }

    const updated = buildings.map((b) => {
      if (b.type === 'town_hall') return { ...b, isConnectedToTownHall: true };

      let connected = false;
      const bX2 = b.x + b.width - 1;
      const bY2 = b.y + b.height - 1;

      for (let y = Math.max(0, b.y - 1); y <= Math.min(GRID_SIZE - 1, bY2 + 1); y++) {
        for (let x = Math.max(0, b.x - 1); x <= Math.min(GRID_SIZE - 1, bX2 + 1); x++) {
          if (visitedRoads.has(`${x},${y}`)) {
            connected = true;
            break;
          }
        }
        if (connected) break;
      }
      return { ...b, isConnectedToTownHall: connected };
    });

    set({ buildings: updated });
  },

  constructBuilding: (type: BuildingType) => {
    const { resources, buildingStorage, buildings } = get();
    const def = BUILDING_DEFINITIONS[type];
    if (!def) return { success: false, message: 'Unknown building type.' };

    if (def.limit && def.limit === 1) {
      const existingPlaced = buildings.filter((b) => b.type === type).length;
      const inStorage = buildingStorage[type] || 0;
      if (existingPlaced + inStorage >= def.limit) {
        return { success: false, message: `Limit reached: only 1 ${def.name} allowed per town!` };
      }
    }

    // Check resources
    for (const [res, cost] of Object.entries(def.cost)) {
      if ((resources[res as ResourceType] || 0) < (cost || 0)) {
        return { success: false, message: `Not enough ${res}! Need ${cost}, have ${resources[res as ResourceType] || 0}.` };
      }
    }

    // Deduct resources
    const newResources = { ...resources };
    for (const [res, cost] of Object.entries(def.cost)) {
      newResources[res as ResourceType] -= cost || 0;
    }

    const newStorage = {
      ...buildingStorage,
      [type]: (buildingStorage[type] || 0) + 1,
    };

    set({
      resources: newResources,
      buildingStorage: newStorage,
    });

    return { success: true, message: `Successfully constructed ${def.name}! It is now ready in storage.` };
  },

  placeBuilding: (type, x, y, rotation = 0, assignedResource) => {
    const { grid, buildings, buildingStorage } = get();
    const def = BUILDING_DEFINITIONS[type];
    if (!def) return false;

    const count = buildingStorage[type] || 0;
    if (count <= 0) return false;

    if (def.limit && def.limit === 1) {
      const existing = buildings.filter((b) => b.type === type);
      if (existing.length >= def.limit) return false;
    }

    const width = rotation === 90 ? def.defaultHeight : def.defaultWidth;
    const height = rotation === 90 ? def.defaultWidth : def.defaultHeight;

    if (x < 0 || x + width > GRID_SIZE || y < 0 || y + height > GRID_SIZE) {
      return false;
    }

    for (let cy = y; cy < y + height; cy++) {
      for (let cx = x; cx < x + width; cx++) {
        if (grid[cy][cx].buildingId !== null) return false;
        if (grid[cy][cx].pathType !== 'none') return false;
      }
    }

    const buildingId = `b_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newBuilding: PlacedBuilding = {
      id: buildingId,
      type,
      x,
      y,
      width,
      height,
      rotation,
      level: 1,
      assignedResource: assignedResource || def.harvestOptions?.[0],
      isConnectedToTownHall: false,
    };

    const newGrid = grid.map((row) => row.map((tile) => ({ ...tile })));
    for (let cy = y; cy < y + height; cy++) {
      for (let cx = x; cx < x + width; cx++) {
        newGrid[cy][cx].buildingId = buildingId;
      }
    }

    const newStorage = { ...buildingStorage, [type]: count - 1 };

    set({
      grid: newGrid,
      buildings: [...buildings, newBuilding],
      buildingStorage: newStorage,
      selectedBuildingId: buildingId,
      pendingPlacementType: null,
      activeTool: 'inspect',
    });

    get().recalculateCaps();
    get().updateConnectivity();
    return true;
  },

  pickupBuilding: (id) => {
    const { grid, buildings, buildingStorage } = get();
    const target = buildings.find((b) => b.id === id);
    if (!target) return false;

    const newGrid = grid.map((row) => row.map((tile) => ({ ...tile })));
    for (let cy = target.y; cy < target.y + target.height; cy++) {
      for (let cx = target.x; cx < target.x + target.width; cx++) {
        if (newGrid[cy][cx].buildingId === id) {
          newGrid[cy][cx].buildingId = null;
        }
      }
    }

    const newStorage = {
      ...buildingStorage,
      [target.type]: (buildingStorage[target.type] || 0) + 1,
    };

    set({
      grid: newGrid,
      buildings: buildings.filter((b) => b.id !== id),
      buildingStorage: newStorage,
      selectedBuildingId: null,
    });

    get().recalculateCaps();
    get().updateConnectivity();
    return true;
  },

  rotatePlacedBuilding: (id) => {
    const { grid, buildings } = get();
    const b = buildings.find((b) => b.id === id);
    if (!b) return false;
    const def = BUILDING_DEFINITIONS[b.type];
    if (!def.canRotate) return false;

    const newRot: 0 | 90 = b.rotation === 0 ? 90 : 0;
    const newWidth = newRot === 90 ? def.defaultHeight : def.defaultWidth;
    const newHeight = newRot === 90 ? def.defaultWidth : def.defaultHeight;

    if (b.x + newWidth > GRID_SIZE || b.y + newHeight > GRID_SIZE) return false;

    for (let cy = b.y; cy < b.y + newHeight; cy++) {
      for (let cx = b.x; cx < b.x + newWidth; cx++) {
        const t = grid[cy][cx];
        if (t.buildingId !== null && t.buildingId !== id) return false;
        if (t.pathType !== 'none') return false;
      }
    }

    const newGrid = grid.map((row) => row.map((tile) => ({ ...tile })));
    for (let cy = b.y; cy < b.y + b.height; cy++) {
      for (let cx = b.x; cx < b.x + b.width; cx++) {
        if (newGrid[cy][cx].buildingId === id) newGrid[cy][cx].buildingId = null;
      }
    }

    for (let cy = b.y; cy < b.y + newHeight; cy++) {
      for (let cx = b.x; cx < b.x + newWidth; cx++) {
        newGrid[cy][cx].buildingId = id;
      }
    }

    const updated = buildings.map((item) =>
      item.id === id
        ? { ...item, rotation: newRot, width: newWidth, height: newHeight }
        : item
    );

    set({ grid: newGrid, buildings: updated });
    get().updateConnectivity();
    return true;
  },

  upgradeBuilding: (id) => {
    const { buildings, unlockedResearchTier, resources } = get();
    const b = buildings.find((b) => b.id === id);
    if (!b) return { success: false, message: 'Building not found.' };
    if (b.level >= 5) return { success: false, message: 'Building is already at maximum Level 5!' };

    const targetLevel = b.level + 1;

    // GATED BY RESEARCH LAB TECH TREE
    if (targetLevel > unlockedResearchTier) {
      return {
        success: false,
        message: `🔒 Level ${targetLevel} locked! You must research Tech Tier ${targetLevel} at the Research Lab first.`,
      };
    }

    // Check upgrade costs
    const costs = BUILDING_UPGRADE_COSTS[targetLevel] || {};
    for (const [res, cost] of Object.entries(costs)) {
      if ((resources[res as ResourceType] || 0) < (cost || 0)) {
        return {
          success: false,
          message: `Not enough ${res}! Level ${targetLevel} upgrade requires ${cost} ${res}.`,
        };
      }
    }

    // Deduct resources
    const newResources = { ...resources };
    for (const [res, cost] of Object.entries(costs)) {
      newResources[res as ResourceType] -= cost || 0;
    }

    const updated = buildings.map((item) =>
      item.id === id ? { ...item, level: targetLevel } : item
    );

    set({ buildings: updated, resources: newResources });
    get().recalculateCaps();
    return { success: true, message: `Building successfully upgraded to Level ${targetLevel}!` };
  },

  researchNextTier: () => {
    const { unlockedResearchTier, buildings, resources } = get();
    if (unlockedResearchTier >= 5) {
      return { success: false, message: 'All Research Tiers are fully unlocked!' };
    }

    const hasResearchLab = buildings.some((b) => b.type === 'academy');
    if (!hasResearchLab) {
      return { success: false, message: 'You must place the Research Lab on the town map first!' };
    }

    const nextTier = unlockedResearchTier + 1;
    const tierDef = RESEARCH_TIERS.find((t) => t.tier === nextTier);
    if (!tierDef) return { success: false, message: 'Tier definition not found.' };

    for (const [res, cost] of Object.entries(tierDef.cost)) {
      if ((resources[res as ResourceType] || 0) < (cost || 0)) {
        return {
          success: false,
          message: `Not enough ${res}! Researching Tier ${nextTier} requires ${cost} ${res}.`,
        };
      }
    }

    const newResources = { ...resources };
    for (const [res, cost] of Object.entries(tierDef.cost)) {
      newResources[res as ResourceType] -= cost || 0;
    }

    set({
      unlockedResearchTier: nextTier,
      resources: newResources,
    });

    return {
      success: true,
      message: `🎉 Successfully researched ${tierDef.name}! Buildings can now upgrade up to Level ${nextTier}.`,
    };
  },

  setHarvesterResource: (id, resource) => {
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === id ? { ...b, assignedResource: resource } : b
      ),
    }));
  },

  setPath: (x, y, path) => {
    const { grid } = get();
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    const tile = grid[y][x];
    if (tile.buildingId !== null) return false;

    const newGrid = grid.map((row) => row.map((t) => ({ ...t })));
    newGrid[y][x].pathType = path;
    set({ grid: newGrid });
    get().updateConnectivity();
    return true;
  },

  clearTileRoad: (x, y) => {
    const { grid } = get();
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    const newGrid = grid.map((row) => row.map((t) => ({ ...t })));
    newGrid[y][x].pathType = 'none';
    set({ grid: newGrid });
    get().updateConnectivity();
  },

  addResource: (resource, amount) => {
    const { resources, storageCaps } = get();
    const current = resources[resource] || 0;
    const cap = storageCaps[resource] || 500;
    const updated = Math.max(0, Math.min(cap, current + amount));
    set({
      resources: { ...resources, [resource]: updated },
    });
  },

  addBuildingToStorage: (type, count) => {
    set((state) => ({
      buildingStorage: {
        ...state.buildingStorage,
        [type]: (state.buildingStorage[type] || 0) + count,
      },
    }));
  },

  harvestTick: () => {
    const { grid, buildings, resources, storageCaps } = get();
    const newResources = { ...resources };
    let harvestedCount = 0;
    let blockedCount = 0;

    for (const b of buildings) {
      const def = BUILDING_DEFINITIONS[b.type];
      if (def.category !== 'harvester') continue;
      if (!b.isConnectedToTownHall) continue;

      const target = b.assignedResource;
      if (!target) continue;

      const current = newResources[target] || 0;
      const cap = storageCaps[target] || 150;
      if (current >= cap) {
        blockedCount++;
        continue;
      }

      let matchTiles = 0;
      for (let cy = b.y; cy < b.y + b.height; cy++) {
        for (let cx = b.x; cx < b.x + b.width; cx++) {
          if (cx < GRID_SIZE && cy < GRID_SIZE) {
            const tile = grid[cy][cx];
            if (tile.resources.includes(target)) {
              matchTiles++;
            }
          }
        }
      }

      const yieldAmt = Math.max(1, matchTiles) * b.level * 2;
      const added = Math.min(yieldAmt, cap - current);
      if (added > 0) {
        newResources[target] = current + added;
        harvestedCount += added;
      }
    }

    set({ resources: newResources });
    return { harvestedCount, blockedCount };
  },

  getMoraleInfo: () => {
    const { buildings } = get();
    let score = 10; // Base score

    for (const b of buildings) {
      if (b.type === 'houses') {
        const bonus = b.isConnectedToTownHall ? 20 * b.level : 10 * b.level;
        score += bonus;
      }
      if (b.type === 'campfire' && b.isConnectedToTownHall) {
        score += 15;
      }
      if (b.type === 'playground' && b.isConnectedToTownHall) {
        score += 20;
      }
      if (b.type === 'fluff_spa' && b.isConnectedToTownHall) {
        score += 15;
      }
    }

    if (score >= 100) {
      return { score, tier: 4, tierName: 'Ecstatic', statBonusPercent: 15, xpBonusPercent: 25 };
    }
    if (score >= 65) {
      return { score, tier: 3, tierName: 'Inspired', statBonusPercent: 10, xpBonusPercent: 15 };
    }
    if (score >= 35) {
      return { score, tier: 2, tierName: 'Happy', statBonusPercent: 5, xpBonusPercent: 10 };
    }
    return { score, tier: 1, tierName: 'Content', statBonusPercent: 0, xpBonusPercent: 0 };
  },
}));
