import { create } from 'zustand';
import {
  GridTile,
  PlacedBuilding,
  ResourceType,
  BuildingType,
  PathType,
  TerrainType,
  MoraleInfo,
  UpgradeModuleItem,
  UpgradeModuleType,
} from '@/types/town';
import {
  BUILDING_DEFINITIONS,
  RESEARCH_TIERS,
  BUILDING_UPGRADE_COSTS,
  TECH_TREE_NODES,
  FORGE_RECIPES,
} from '@/data/townBuildings';
import { useStoryStore } from '@/store/storyStore';

const TOWN_STORAGE_KEY = 'ben_stuffy_town_v45_persisted';
export const GRID_SIZE = 100;

export interface TownStore {
  grid: GridTile[][];
  resources: Record<ResourceType, number>;
  storageCaps: Record<ResourceType, number>;
  buildings: PlacedBuilding[];
  buildingStorage: Partial<Record<BuildingType, number>>;
  unlockedResearchTier: number;
  unlockedTechNodes: string[];
  forgeModulesInventory: UpgradeModuleItem[];
  researchingNodeId: string | null;
  researchTimeRemaining: number; // 300s (5 minutes) countdown
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
  startResearch: (nodeId: string) => { success: boolean; message: string };
  applyTimeWarp: (seconds: number) => { success: boolean; message: string };

  setHarvesterResource: (id: string, resource: ResourceType) => void;
  setBarrelResource: (id: string, resource: ResourceType) => void;
  assignStuffyToBuilding: (buildingId: string, stuffySpeciesId: string | null) => { success: boolean; message: string };

  forgeModule: (type: UpgradeModuleType) => { success: boolean; message: string };
  equipModule: (buildingId: string, slotIndex: number, moduleId: string) => { success: boolean; message: string };
  unequipModule: (buildingId: string, slotIndex: number) => { success: boolean; message: string };

  setPath: (x: number, y: number, path: PathType) => boolean;
  clearTileRoad: (x: number, y: number) => void;

  addResource: (resource: ResourceType, amount: number) => void;
  addBuildingToStorage: (type: BuildingType, count: number) => void;
  tickProduction: (deltaSeconds: number) => { harvestedCount: number; researchCompleted: boolean };
  updateConnectivity: () => void;
  recalculateCaps: () => void;
  getMoraleInfo: () => MoraleInfo;
  saveProgress: () => void;
}

const DEFAULT_RESOURCES: Record<ResourceType, number> = {
  wood: 100,
  oil: 40,
  water: 100,
  string: 60,
  stone: 100,
  glass: 30,
  sand: 60,
  coal: 40,
  lava: 0,
  wool: 20,
  honey: 20,
  beeswax: 20,
  clay: 40,
  marble: 20,
  granite: 20,
  fabric: 10,
  yarn: 0,
};

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
      } else if (x > 72 && y > 72 && simplexLike(x, y, 0.2) > -0.2) {
        terrain = 'volcanic';
        resources.push('lava', 'stone');
        if ((x * y) % 2 === 0) resources.push('oil');
      } else if (
        (x > 62 && y < 42 && simplexLike(x, y, 0.15) > -0.3) ||
        (x < 22 && y > 22 && y < 68 && simplexLike(x, y, 0.18) > -0.2)
      ) {
        terrain = 'mountain';
        resources.push('stone', 'granite');
        if ((x + y) % 3 === 0) resources.push('marble');
        if ((x * y) % 4 === 0) resources.push('coal');
      } else if (x > 46 && x < 74 && y > 44 && y < 72 && simplexLike(x, y, 0.12) > 0.1) {
        terrain = 'sand';
        resources.push('sand', 'stone');
      } else if (
        (x < 32 && y < 35 && simplexLike(x, y, 0.14) > -0.35) ||
        (x > 38 && x < 65 && y > 15 && y < 38 && simplexLike(x, y, 0.16) > -0.1) ||
        simplexLike(x, y, 0.22) > 0.5
      ) {
        terrain = 'forest';
        resources.push('wood');
        if ((x + y) % 2 === 0) resources.push('string');
      } else {
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

// Strictly orthogonal road connection check (North, South, East, West ONLY - NO diagonal corners!)
function isOrthogonallyAdjacentToBuilding(
  roadX: number,
  roadY: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): boolean {
  // North edge: roadY === by - 1 and roadX in [bx .. bx + bw - 1]
  if (roadY === by - 1 && roadX >= bx && roadX < bx + bw) return true;
  // South edge: roadY === by + bh and roadX in [bx .. bx + bw - 1]
  if (roadY === by + bh && roadX >= bx && roadX < bx + bw) return true;
  // West edge: roadX === bx - 1 and roadY in [by .. by + bh - 1]
  if (roadX === bx - 1 && roadY >= by && roadY < by + bh) return true;
  // East edge: roadX === bx + bw and roadY in [by .. by + bh - 1]
  if (roadX === bx + bw && roadY >= by && roadY < by + bh) return true;
  return false;
}

export const useTownStore = create<TownStore>((set, get) => ({
  grid: generateRealistic100Grid(),
  resources: { ...DEFAULT_RESOURCES },
  storageCaps: Object.keys(DEFAULT_RESOURCES).reduce((acc, k) => {
    acc[k as ResourceType] = 100;
    return acc;
  }, {} as Record<ResourceType, number>),
  buildings: [],
  buildingStorage: {
    town_hall: 1,
    academy: 1,
    houses: 3,
    lumberjack: 1,
    mine: 1,
    barrel: 2,
    forge: 1,
  },
  unlockedResearchTier: 1,
  unlockedTechNodes: ['core_hub'],
  forgeModulesInventory: [],
  researchingNodeId: null,
  researchTimeRemaining: 0,
  selectedTile: null,
  selectedBuildingId: null,
  activeTool: 'inspect',
  pendingPlacementType: null,
  placementRotation: 0,
  timeWarpMinutes: 30,
  isTimeWarpActive: false,

  saveProgress: () => {
    if (typeof window === 'undefined') return;
    try {
      const state = get();
      const payload = {
        grid: state.grid,
        resources: state.resources,
        buildings: state.buildings,
        buildingStorage: state.buildingStorage,
        unlockedResearchTier: state.unlockedResearchTier,
        unlockedTechNodes: state.unlockedTechNodes,
        forgeModulesInventory: state.forgeModulesInventory,
        researchingNodeId: state.researchingNodeId,
        researchTimeRemaining: state.researchTimeRemaining,
        timeWarpMinutes: state.timeWarpMinutes,
      };
      localStorage.setItem(TOWN_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save town progress:', e);
    }
  },

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
              buildings: (parsed.buildings || []).map((b: PlacedBuilding) => ({
                ...b,
                upgradeSlots: b.upgradeSlots || [null],
                maxUpgradeSlots: b.maxUpgradeSlots || 1,
                assignedStuffyId: b.assignedStuffyId ?? null,
                cycleProgress: b.cycleProgress ?? 0,
                cycleDuration: b.cycleDuration ?? 30,
              })),
              buildingStorage: parsed.buildingStorage || { town_hall: 1, academy: 1, houses: 3, forge: 1 },
              unlockedResearchTier: parsed.unlockedResearchTier ?? 1,
              unlockedTechNodes: parsed.unlockedTechNodes || ['core_hub'],
              forgeModulesInventory: parsed.forgeModulesInventory || [],
              researchingNodeId: parsed.researchingNodeId ?? null,
              researchTimeRemaining: parsed.researchTimeRemaining ?? 0,
              timeWarpMinutes: parsed.timeWarpMinutes ?? 30,
            });
            get().updateConnectivity();
            get().recalculateCaps();
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load town save, generating fresh grid', e);
    }
    get().recalculateCaps();
    get().saveProgress();
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
    const { buildings, resources } = get();
    const newCaps: Record<ResourceType, number> = Object.keys(DEFAULT_RESOURCES).reduce((acc, k) => {
      acc[k as ResourceType] = 100; // Base default storage cap
      return acc;
    }, {} as Record<ResourceType, number>);

    let hasBank = false;
    for (const b of buildings) {
      // Barrels ONLY provide capacity if connected orthogonally to road network
      if (b.type === 'barrel' && b.assignedResource && b.isConnectedToTownHall) {
        const framingBonus = (b.upgradeSlots || []).reduce((sum, mod) => sum + (mod?.statBonus.extraStorage || 0), 0);
        newCaps[b.assignedResource] = (newCaps[b.assignedResource] || 100) + 150 * b.level + framingBonus;
      }
      if (b.type === 'bank' && b.isConnectedToTownHall) {
        hasBank = true;
      }
    }

    if (hasBank) {
      for (const res of Object.keys(newCaps) as ResourceType[]) {
        newCaps[res] += 2500;
      }
    }

    // STRICT INVARIANT: All resources in storage must be <= cap of storage!
    const clampedResources = { ...resources };
    for (const res of Object.keys(clampedResources) as ResourceType[]) {
      const cap = newCaps[res] || 100;
      if (clampedResources[res] > cap) {
        clampedResources[res] = cap;
      }
    }

    set({ storageCaps: newCaps, resources: clampedResources });
    get().saveProgress();
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

    // Find road tiles strictly orthogonally adjacent to Town Hall
    for (let ry = 0; ry < GRID_SIZE; ry++) {
      for (let rx = 0; rx < GRID_SIZE; rx++) {
        if (grid[ry][rx].pathType !== 'none') {
          if (isOrthogonallyAdjacentToBuilding(rx, ry, townHall.x, townHall.y, townHall.width, townHall.height)) {
            const key = `${rx},${ry}`;
            visitedRoads.add(key);
            queue.push([rx, ry]);
          }
        }
      }
    }

    // BFS through orthogonal road network
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

    // A building is connected ONLY if at least one road tile is strictly orthogonally adjacent
    const updated = buildings.map((b) => {
      if (b.type === 'town_hall') return { ...b, isConnectedToTownHall: true };

      let connected = false;
      // Check orthogonal road tiles directly touching building sides
      const topY = b.y - 1;
      const bottomY = b.y + b.height;
      const leftX = b.x - 1;
      const rightX = b.x + b.width;

      // North edge
      if (topY >= 0) {
        for (let cx = b.x; cx < b.x + b.width; cx++) {
          if (visitedRoads.has(`${cx},${topY}`)) {
            connected = true;
            break;
          }
        }
      }
      // South edge
      if (!connected && bottomY < GRID_SIZE) {
        for (let cx = b.x; cx < b.x + b.width; cx++) {
          if (visitedRoads.has(`${cx},${bottomY}`)) {
            connected = true;
            break;
          }
        }
      }
      // West edge
      if (!connected && leftX >= 0) {
        for (let cy = b.y; cy < b.y + b.height; cy++) {
          if (visitedRoads.has(`${leftX},${cy}`)) {
            connected = true;
            break;
          }
        }
      }
      // East edge
      if (!connected && rightX < GRID_SIZE) {
        for (let cy = b.y; cy < b.y + b.height; cy++) {
          if (visitedRoads.has(`${rightX},${cy}`)) {
            connected = true;
            break;
          }
        }
      }

      return { ...b, isConnectedToTownHall: connected };
    });

    set({ buildings: updated });
  },

  constructBuilding: (type: BuildingType) => {
    const { resources, buildingStorage, buildings, unlockedTechNodes } = get();
    const def = BUILDING_DEFINITIONS[type];
    if (!def) return { success: false, message: 'Unknown building type.' };

    // Check tech tree requirements (unless starter buildings: town_hall, houses, barrel, academy)
    const techReq = TECH_TREE_NODES.find((n) => n.targetBuildingType === type && n.effectType === 'unlock_building');
    if (techReq && !unlockedTechNodes.includes(techReq.id)) {
      return { success: false, message: `🔒 Locked! Requires "${techReq.title}" researched in the Tech Tree.` };
    }

    if (def.limit && def.limit === 1) {
      const existingPlaced = buildings.filter((b) => b.type === type).length;
      const inStorage = buildingStorage[type] || 0;
      if (existingPlaced + inStorage >= def.limit) {
        return { success: false, message: `Limit reached: only 1 ${def.name} allowed per town!` };
      }
    }

    for (const [res, cost] of Object.entries(def.cost)) {
      if ((resources[res as ResourceType] || 0) < (cost || 0)) {
        return { success: false, message: `Not enough ${res}! Need ${cost}, have ${resources[res as ResourceType] || 0}.` };
      }
    }

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

    get().saveProgress();
    return { success: true, message: `Constructed ${def.name}! Ready in storage.` };
  },

  placeBuilding: (type, x, y, rotation = 0, assignedResource) => {
    const { grid, buildings, buildingStorage, unlockedTechNodes } = get();
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
        if (grid[cy][cx].buildingId !== null || grid[cy][cx].pathType !== 'none') return false;
      }
    }

    let maxSlots = 1;
    for (const node of TECH_TREE_NODES) {
      if (unlockedTechNodes.includes(node.id) && node.effectType === 'slot_upgrade') {
        if (!node.targetBuildingType || node.targetBuildingType === type) {
          maxSlots++;
        }
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
      assignedResource: assignedResource || (type === 'barrel' ? 'wood' : def.harvestOptions?.[0]),
      assignedStuffyId: null, // "Things don't work without them"
      cycleProgress: 0,
      cycleDuration: 30, // 30 seconds per resource for Tier 1
      isConnectedToTownHall: false,
      upgradeSlots: Array(maxSlots).fill(null),
      maxUpgradeSlots: maxSlots,
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

    get().updateConnectivity();
    get().recalculateCaps();
    get().saveProgress();
    return true;
  },

  pickupBuilding: (id) => {
    const { grid, buildings, buildingStorage, forgeModulesInventory } = get();
    const target = buildings.find((b) => b.id === id);
    if (!target) return false;

    const returnedModules: UpgradeModuleItem[] = [];
    for (const mod of target.upgradeSlots || []) {
      if (mod) returnedModules.push(mod);
    }

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
      forgeModulesInventory: [...forgeModulesInventory, ...returnedModules],
      selectedBuildingId: null,
    });

    get().updateConnectivity();
    get().recalculateCaps();
    get().saveProgress();
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
    get().recalculateCaps();
    get().saveProgress();
    return true;
  },

  upgradeBuilding: (id) => {
    const { buildings, unlockedResearchTier, resources } = get();
    const b = buildings.find((b) => b.id === id);
    if (!b) return { success: false, message: 'Building not found.' };
    if (b.level >= 5) return { success: false, message: 'Building is already at maximum Level 5!' };

    const targetLevel = b.level + 1;
    if (targetLevel > unlockedResearchTier) {
      return {
        success: false,
        message: `🔒 Level ${targetLevel} locked! Research Tech Tier ${targetLevel} at the Research Lab first.`,
      };
    }

    const costs = BUILDING_UPGRADE_COSTS[targetLevel] || {};
    for (const [res, cost] of Object.entries(costs)) {
      if ((resources[res as ResourceType] || 0) < (cost || 0)) {
        return {
          success: false,
          message: `Not enough ${res}! Level ${targetLevel} upgrade requires ${cost} ${res}.`,
        };
      }
    }

    const newResources = { ...resources };
    for (const [res, cost] of Object.entries(costs)) {
      newResources[res as ResourceType] -= cost || 0;
    }

    const updated = buildings.map((item) =>
      item.id === id ? { ...item, level: targetLevel } : item
    );

    set({ buildings: updated, resources: newResources });
    get().recalculateCaps();
    get().saveProgress();
    return { success: true, message: `Building successfully upgraded to Level ${targetLevel}!` };
  },

  // 5-Minute Research with Countdown Timer (300 seconds)
  startResearch: (nodeId: string) => {
    const { unlockedTechNodes, researchingNodeId, resources } = get();
    if (researchingNodeId) {
      return { success: false, message: 'Already researching a technology! Wait or use /.warp.' };
    }
    if (unlockedTechNodes.includes(nodeId)) {
      return { success: false, message: 'Technology node already researched!' };
    }

    const targetNode = TECH_TREE_NODES.find((n) => n.id === nodeId);
    if (!targetNode) return { success: false, message: 'Unknown tech node.' };

    for (const req of targetNode.prerequisites) {
      if (!unlockedTechNodes.includes(req)) {
        const reqDef = TECH_TREE_NODES.find((n) => n.id === req);
        return { success: false, message: `Missing prerequisite: ${reqDef?.title || req}` };
      }
    }

    for (const [res, cost] of Object.entries(targetNode.cost)) {
      if ((resources[res as ResourceType] || 0) < (cost || 0)) {
        return { success: false, message: `Not enough ${res}! Need ${cost}, have ${resources[res as ResourceType] || 0}.` };
      }
    }

    const newResources = { ...resources };
    for (const [res, cost] of Object.entries(targetNode.cost)) {
      newResources[res as ResourceType] -= cost || 0;
    }

    // 5 minutes countdown (300 seconds)
    set({
      resources: newResources,
      researchingNodeId: nodeId,
      researchTimeRemaining: 300,
    });

    get().saveProgress();
    return {
      success: true,
      message: `🔬 Started 5-minute research on "${targetNode.title}"! (Use /.warp to accelerate)`,
    };
  },

  // /.warp command: advances timers by specified seconds (default 300s = 5m)
  applyTimeWarp: (seconds: number) => {
    const { researchingNodeId, researchTimeRemaining, unlockedTechNodes, buildings } = get();
    let msg = '';

    // Fast-forward research
    if (researchingNodeId) {
      const remaining = researchTimeRemaining - seconds;
      if (remaining <= 0) {
        const targetNode = TECH_TREE_NODES.find((n) => n.id === researchingNodeId);
        let updatedBuildings = buildings;
        if (targetNode?.effectType === 'slot_upgrade') {
          updatedBuildings = buildings.map((b) => {
            if (!targetNode.targetBuildingType || b.type === targetNode.targetBuildingType) {
              const newMax = Math.min(3, b.maxUpgradeSlots + 1);
              const newSlots = [...b.upgradeSlots];
              while (newSlots.length < newMax) newSlots.push(null);
              return { ...b, maxUpgradeSlots: newMax, upgradeSlots: newSlots };
            }
            return b;
          });
        }
        set({
          unlockedTechNodes: [...unlockedTechNodes, researchingNodeId],
          researchingNodeId: null,
          researchTimeRemaining: 0,
          buildings: updatedBuildings,
        });
        msg += ` Research completed for "${targetNode?.title || researchingNodeId}"!`;
      } else {
        set({ researchTimeRemaining: remaining });
        msg += ` Research advanced (${remaining}s remaining).`;
      }
    }

    // Fast-forward building production
    const res = get().tickProduction(seconds);
    msg += ` Harvested +${res.harvestedCount} resources.`;

    get().saveProgress();
    return { success: true, message: msg.trim() };
  },

  assignStuffyToBuilding: (buildingId: string, stuffySpeciesId: string | null) => {
    const { buildings } = get();
    const target = buildings.find((b) => b.id === buildingId);
    if (!target) return { success: false, message: 'Building not found.' };

    // If stuffy is already assigned elsewhere, unassign from the old building first
    let updated = buildings.map((b) => {
      if (stuffySpeciesId && b.assignedStuffyId === stuffySpeciesId && b.id !== buildingId) {
        return { ...b, assignedStuffyId: null };
      }
      return b;
    });

    updated = updated.map((b) =>
      b.id === buildingId ? { ...b, assignedStuffyId: stuffySpeciesId } : b
    );

    set({ buildings: updated });
    get().saveProgress();

    return {
      success: true,
      message: stuffySpeciesId
        ? `🧸 Assigned worker to ${target.type}! Building is now operating.`
        : `Unassigned worker from ${target.type}.`,
    };
  },

  setHarvesterResource: (id, resource) => {
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === id ? { ...b, assignedResource: resource } : b
      ),
    }));
    get().saveProgress();
  },

  setBarrelResource: (id, resource) => {
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === id ? { ...b, assignedResource: resource } : b
      ),
    }));
    get().recalculateCaps();
  },

  forgeModule: (type) => {
    const { resources, forgeModulesInventory } = get();
    const recipe = FORGE_RECIPES.find((r) => r.type === type);
    if (!recipe) return { success: false, message: 'Recipe not found.' };

    for (const [res, cost] of Object.entries(recipe.cost)) {
      if ((resources[res as ResourceType] || 0) < (cost || 0)) {
        return { success: false, message: `Not enough ${res}! Need ${cost}, have ${resources[res as ResourceType] || 0}.` };
      }
    }

    const newResources = { ...resources };
    for (const [res, cost] of Object.entries(recipe.cost)) {
      newResources[res as ResourceType] -= cost || 0;
    }

    const newModule: UpgradeModuleItem = {
      id: `mod_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      name: recipe.name,
      icon: recipe.icon,
      effect: recipe.description,
      statBonus: recipe.statBonus,
    };

    set({
      resources: newResources,
      forgeModulesInventory: [...forgeModulesInventory, newModule],
    });

    get().saveProgress();
    return { success: true, message: `⚒️ Forged ${newModule.name}! Added to module inventory.` };
  },

  equipModule: (buildingId, slotIndex, moduleId) => {
    const { buildings, forgeModulesInventory } = get();
    const b = buildings.find((x) => x.id === buildingId);
    if (!b) return { success: false, message: 'Building not found.' };

    const mod = forgeModulesInventory.find((m) => m.id === moduleId);
    if (!mod) return { success: false, message: 'Module not found in inventory.' };

    if (slotIndex >= b.maxUpgradeSlots) {
      return { success: false, message: 'Upgrade slot is locked. Unlock +1 Upgrade Slot in the Tech Tree!' };
    }

    const existing = b.upgradeSlots[slotIndex];
    let newInventory = forgeModulesInventory.filter((m) => m.id !== moduleId);
    if (existing) {
      newInventory = [...newInventory, existing];
    }

    const newSlots = [...b.upgradeSlots];
    newSlots[slotIndex] = mod;

    const updatedBuildings = buildings.map((item) =>
      item.id === buildingId ? { ...item, upgradeSlots: newSlots } : item
    );

    set({
      buildings: updatedBuildings,
      forgeModulesInventory: newInventory,
    });

    get().recalculateCaps();
    return { success: true, message: `Socketed ${mod.name} into ${b.type}!` };
  },

  unequipModule: (buildingId, slotIndex) => {
    const { buildings, forgeModulesInventory } = get();
    const b = buildings.find((x) => x.id === buildingId);
    if (!b) return { success: false, message: 'Building not found.' };

    const targetMod = b.upgradeSlots[slotIndex];
    if (!targetMod) return { success: false, message: 'Slot is already empty.' };

    const newSlots = [...b.upgradeSlots];
    newSlots[slotIndex] = null;

    const updatedBuildings = buildings.map((item) =>
      item.id === buildingId ? { ...item, upgradeSlots: newSlots } : item
    );

    set({
      buildings: updatedBuildings,
      forgeModulesInventory: [...forgeModulesInventory, targetMod],
    });

    get().recalculateCaps();
    return { success: true, message: `Removed ${targetMod.name} and returned to inventory.` };
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
    get().recalculateCaps();
    return true;
  },

  clearTileRoad: (x, y) => {
    const { grid } = get();
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    const newGrid = grid.map((row) => row.map((t) => ({ ...t })));
    newGrid[y][x].pathType = 'none';
    set({ grid: newGrid });
    get().updateConnectivity();
    get().recalculateCaps();
  },

  addResource: (resource, amount) => {
    const { resources, storageCaps } = get();
    const current = resources[resource] || 0;
    const cap = storageCaps[resource] || 100;
    const updated = Math.max(0, Math.min(cap, current + amount));
    set({
      resources: { ...resources, [resource]: updated },
    });
    get().saveProgress();
  },

  addBuildingToStorage: (type, count) => {
    set((state) => ({
      buildingStorage: {
        ...state.buildingStorage,
        [type]: (state.buildingStorage[type] || 0) + count,
      },
    }));
    get().saveProgress();
  },

  // 1 Resource per 30 Seconds for Tier 1 Harvesters (when worker assigned & road connected)
  tickProduction: (deltaSeconds: number) => {
    const {
      grid,
      buildings,
      resources,
      storageCaps,
      researchingNodeId,
      researchTimeRemaining,
      unlockedTechNodes,
    } = get();

    let researchCompleted = false;

    // Tick Research Timer if active
    if (researchingNodeId) {
      const remaining = researchTimeRemaining - deltaSeconds;
      if (remaining <= 0) {
        const targetNode = TECH_TREE_NODES.find((n) => n.id === researchingNodeId);
        let updatedBuildings = buildings;
        if (targetNode?.effectType === 'slot_upgrade') {
          updatedBuildings = buildings.map((b) => {
            if (!targetNode.targetBuildingType || b.type === targetNode.targetBuildingType) {
              const newMax = Math.min(3, b.maxUpgradeSlots + 1);
              const newSlots = [...b.upgradeSlots];
              while (newSlots.length < newMax) newSlots.push(null);
              return { ...b, maxUpgradeSlots: newMax, upgradeSlots: newSlots };
            }
            return b;
          });
        }
        set({
          unlockedTechNodes: [...unlockedTechNodes, researchingNodeId],
          researchingNodeId: null,
          researchTimeRemaining: 0,
          buildings: updatedBuildings,
        });
        researchCompleted = true;
      } else {
        set({ researchTimeRemaining: remaining });
      }
    }

    const newResources = { ...resources };
    let harvestedCount = 0;

    const updatedBuildings = buildings.map((b) => {
      const def = BUILDING_DEFINITIONS[b.type];
      if (def.category !== 'harvester') return b;

      // RULE: Things don't work without road connection or assigned worker!
      if (!b.isConnectedToTownHall || !b.assignedStuffyId) {
        return b;
      }

      const target = b.assignedResource;
      if (!target) return b;

      const cap = storageCaps[target] || 100;
      const current = newResources[target] || 0;
      if (current >= cap) {
        return b; // Storage is full, harvester paused
      }

      // Cycle calculation: Tier 1 base is 30 seconds
      let timeReductionPercent = 0;
      let yieldBonusPercent = 0;
      let rareChance = 0;

      for (const mod of b.upgradeSlots || []) {
        if (mod?.statBonus.timeReductionPercent) timeReductionPercent += mod.statBonus.timeReductionPercent;
        if (mod?.statBonus.yieldBonusPercent) yieldBonusPercent += mod.statBonus.yieldBonusPercent;
        if (mod?.statBonus.rareChancePercent) rareChance += mod.statBonus.rareChancePercent;
      }

      // Base cycle duration: 30s for Level 1, -3s per level
      const baseDuration = Math.max(10, 30 - (b.level - 1) * 3);
      const effectiveDuration = Math.max(5, baseDuration * (1 - timeReductionPercent / 100));

      let curProgress = (b.cycleProgress || 0) + deltaSeconds;

      if (curProgress >= effectiveDuration) {
        // Complete cycle: produce 1 resource + level bonus + yield bonus
        const cyclesCompleted = Math.floor(curProgress / effectiveDuration);
        curProgress = curProgress % effectiveDuration;

        const baseYield = 1 + (b.level - 1);
        const cycleYield = Math.round(baseYield * (1 + yieldBonusPercent / 100)) * cyclesCompleted;
        const availableSpace = cap - (newResources[target] || 0);
        const added = Math.min(cycleYield, availableSpace);

        if (added > 0) {
          newResources[target] = Math.min(cap, (newResources[target] || 0) + added);
          harvestedCount += added;
        }

        // Rare drops
        if (rareChance > 0 && Math.random() * 100 < rareChance) {
          const bonusRes = Math.random() > 0.5 ? 'marble' : 'granite';
          const curRare = newResources[bonusRes] || 0;
          const capRare = storageCaps[bonusRes] || 100;
          if (curRare < capRare) {
            newResources[bonusRes] = Math.min(capRare, curRare + 1);
            harvestedCount += 1;
          }
        }
      }

      return {
        ...b,
        cycleProgress: curProgress,
        cycleDuration: Math.round(effectiveDuration),
      };
    });

    // Enforce strict clamping
    for (const res of Object.keys(newResources) as ResourceType[]) {
      const cap = storageCaps[res] || 100;
      if (newResources[res] > cap) {
        newResources[res] = cap;
      }
    }

    set({ buildings: updatedBuildings, resources: newResources });
    get().saveProgress();

    return { harvestedCount, researchCompleted };
  },

  getMoraleInfo: () => {
    const { buildings } = get();
    let score = 10;

    for (const b of buildings) {
      let moduleAura = 0;
      for (const mod of b.upgradeSlots || []) {
        if (mod?.statBonus.moraleAura) moduleAura += mod.statBonus.moraleAura;
      }

      if (b.type === 'houses') {
        const bonus = b.isConnectedToTownHall ? 20 * b.level : 10 * b.level;
        score += bonus + moduleAura;
      }
      if (b.type === 'campfire' && b.isConnectedToTownHall) {
        score += 15 + moduleAura;
      }
      if (b.type === 'playground' && b.isConnectedToTownHall) {
        score += 20 + moduleAura;
      }
      if (b.type === 'fluff_spa' && b.isConnectedToTownHall) {
        score += 15 + moduleAura;
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
