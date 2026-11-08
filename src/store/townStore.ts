import { create } from 'zustand';
import {
  GridTile,
  PlacedBuilding,
  ResourceType,
  BuildingType,
  PathType,
  TerrainType,
} from '@/types/town';
import { BUILDING_DEFINITIONS } from '@/data/townBuildings';

const TOWN_STORAGE_KEY = 'ben_stuffy_town_v44';
const GRID_SIZE = 30;

export interface TownStore {
  grid: GridTile[][];
  resources: Record<ResourceType, number>;
  storageCaps: Record<ResourceType, number>;
  buildings: PlacedBuilding[];
  buildingStorage: Partial<Record<BuildingType, number>>;
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
  
  placeBuilding: (type: BuildingType, x: number, y: number, rotation?: 0 | 90, assignedResource?: ResourceType) => boolean;
  pickupBuilding: (id: string) => boolean;
  rotatePlacedBuilding: (id: string) => boolean;
  upgradeBuilding: (id: string) => boolean;
  setHarvesterResource: (id: string, resource: ResourceType) => void;

  setPath: (x: number, y: number, path: PathType) => boolean;
  clearTileRoad: (x: number, y: number) => void;

  addResource: (resource: ResourceType, amount: number) => void;
  addBuildingToStorage: (type: BuildingType, count: number) => void;
  harvestTick: () => { harvestedCount: number; blockedCount: number };
  updateConnectivity: () => void;
  recalculateCaps: () => void;
}

const DEFAULT_RESOURCES: Record<ResourceType, number> = {
  wood: 50,
  oil: 20,
  water: 40,
  string: 30,
  stone: 40,
  glass: 10,
  sand: 30,
  coal: 20,
  lava: 0,
  wool: 10,
  honey: 5,
  beeswax: 5,
  clay: 15,
  marble: 10,
  granite: 10,
  fabric: 5,
  yarn: 0,
};

function generateInitialGrid(): GridTile[][] {
  const grid: GridTile[][] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: GridTile[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      // Procedurally assign terrain and natural resources
      let terrain: TerrainType = 'grass';
      const resources: ResourceType[] = [];

      // River / Lake in middle-left (x: 5-8, y: 8-22)
      if (Math.abs(x - (6 + Math.sin(y / 3) * 2)) <= 1.5) {
        terrain = 'water';
        resources.push('water');
      } else if (Math.abs(x - (6 + Math.sin(y / 3) * 2)) <= 2.8) {
        terrain = 'clay_shore';
        resources.push('clay', 'sand');
      } else if (x > 22 && y < 12) {
        // Mountain rock quarry
        terrain = 'mountain';
        resources.push('stone', 'granite', 'marble');
        if ((x + y) % 3 === 0) resources.push('coal');
      } else if (x > 20 && y > 20) {
        // Volcanic fissure
        terrain = 'volcanic';
        resources.push('lava', 'stone');
        if ((x + y) % 2 === 0) resources.push('oil');
      } else if (x < 10 && y > 18) {
        // Dense forest
        terrain = 'forest';
        resources.push('wood', 'string');
      } else if (x > 12 && x < 20 && y > 12 && y < 18) {
        // Sand desert dunes
        terrain = 'sand';
        resources.push('sand', 'stone');
      } else {
        // Meadow grass
        terrain = 'grass';
        if ((x * y) % 5 === 0) resources.push('wood');
        if ((x + y) % 7 === 0) resources.push('string');
        if ((x - y + 30) % 9 === 0) resources.push('water');
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
  grid: generateInitialGrid(),
  resources: { ...DEFAULT_RESOURCES },
  storageCaps: Object.keys(DEFAULT_RESOURCES).reduce((acc, k) => {
    acc[k as ResourceType] = 150;
    return acc;
  }, {} as Record<ResourceType, number>),
  buildings: [],
  buildingStorage: {
    town_hall: 1, // Start with Town Hall in storage!
    lumberjack: 1,
    mine: 1,
    barrel: 2,
  },
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
          if (parsed && parsed.grid && parsed.resources) {
            set({
              grid: parsed.grid,
              resources: parsed.resources,
              buildings: parsed.buildings || [],
              buildingStorage: parsed.buildingStorage || { town_hall: 1 },
              timeWarpMinutes: parsed.timeWarpMinutes ?? 30,
            });
            get().recalculateCaps();
            get().updateConnectivity();
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load town save, generating fresh grid', e);
    }
    // Default setup
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
      acc[k as ResourceType] = 100; // Base cap
      return acc;
    }, {} as Record<ResourceType, number>);

    let hasBank = false;
    for (const b of buildings) {
      if (b.type === 'barrel' && b.assignedResource) {
        newCaps[b.assignedResource] = (newCaps[b.assignedResource] || 100) + 150 * b.level;
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
      // Without town hall placed, all buildings are disconnected
      const updated = buildings.map((b) => ({ ...b, isConnectedToTownHall: false }));
      set({ buildings: updated });
      return;
    }

    // Find all road tiles connected to Town Hall via BFS
    const visitedRoads = new Set<string>();
    const queue: [number, number][] = [];

    // All road tiles immediately adjacent to Town Hall perimeter
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

    // BFS through road network
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

    // A building is connected if it touches at least one visited road tile
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

  placeBuilding: (type, x, y, rotation = 0, assignedResource) => {
    const { grid, buildings, buildingStorage } = get();
    const def = BUILDING_DEFINITIONS[type];
    if (!def) return false;

    // Check count in storage
    const count = buildingStorage[type] || 0;
    if (count <= 0) return false;

    // Limit check
    if (def.limit && def.limit === 1) {
      const existing = buildings.filter((b) => b.type === type);
      if (existing.length >= def.limit) return false;
    }

    const width = rotation === 90 ? def.defaultHeight : def.defaultWidth;
    const height = rotation === 90 ? def.defaultWidth : def.defaultHeight;

    // Check bounds
    if (x < 0 || x + width > GRID_SIZE || y < 0 || y + height > GRID_SIZE) {
      return false;
    }

    // Check overlap with existing buildings or roads
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

    // Update grid
    const newGrid = grid.map((row) => row.map((tile) => ({ ...tile })));
    for (let cy = y; cy < y + height; cy++) {
      for (let cx = x; cx < x + width; cx++) {
        newGrid[cy][cx].buildingId = buildingId;
      }
    }

    // Deduct from storage
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

    // Clean grid
    const newGrid = grid.map((row) => row.map((tile) => ({ ...tile })));
    for (let cy = target.y; cy < target.y + target.height; cy++) {
      for (let cx = target.x; cx < target.x + target.width; cx++) {
        if (newGrid[cy][cx].buildingId === id) {
          newGrid[cy][cx].buildingId = null;
        }
      }
    }

    // Add back to storage
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

    // Bounds check
    if (b.x + newWidth > GRID_SIZE || b.y + newHeight > GRID_SIZE) return false;

    // Overlap check (excluding self)
    for (let cy = b.y; cy < b.y + newHeight; cy++) {
      for (let cx = b.x; cx < b.x + newWidth; cx++) {
        const t = grid[cy][cx];
        if (t.buildingId !== null && t.buildingId !== id) return false;
        if (t.pathType !== 'none') return false;
      }
    }

    // Clear old footprint
    const newGrid = grid.map((row) => row.map((tile) => ({ ...tile })));
    for (let cy = b.y; cy < b.y + b.height; cy++) {
      for (let cx = b.x; cx < b.x + b.width; cx++) {
        if (newGrid[cy][cx].buildingId === id) newGrid[cy][cx].buildingId = null;
      }
    }

    // Stamp new footprint
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
    const { buildings } = get();
    const b = buildings.find((b) => b.id === id);
    if (!b || b.level >= 5) return false;

    const updated = buildings.map((item) =>
      item.id === id ? { ...item, level: item.level + 1 } : item
    );
    set({ buildings: updated });
    get().recalculateCaps();
    return true;
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
    if (tile.buildingId !== null) return false; // Cannot place road on top of building

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
      const cap = storageCaps[target] || 100;
      if (current >= cap) {
        blockedCount++;
        continue;
      }

      // Harvest from all tiles directly underneath the building footprint
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

      // Base harvest amount scales with matching tiles underneath and building level
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
}));
