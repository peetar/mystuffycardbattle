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
  StuffySimState,
  DnaAttributeType,
  DnaAttributes,
} from '@/types/town';
import {
  BUILDING_DEFINITIONS,
  RESEARCH_TIERS,
  BUILDING_UPGRADE_COSTS,
  TECH_TREE_NODES,
  FORGE_RECIPES,
  ARTISAN_RECIPES,
  POTION_RECIPES,
} from '@/data/townBuildings';
import { useStoryStore } from '@/store/storyStore';
import { ALL_STUFFIES } from '@/data/stuffies';

const TOWN_STORAGE_KEY = 'ben_stuffy_town_v45_persisted';
export const GRID_SIZE = 175;

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
  robotCount: number;
  stuffySimStates: Record<string, StuffySimState>;
  potionsInventory: Record<string, number>;
  dnaPoints: number;
  dnaAttributes: DnaAttributes;

  // Actions
  initializeTown: () => void;
  selectTile: (x: number, y: number) => void;
  setSelectedBuildingId: (id: string | null) => void;
  setActiveTool: (tool: 'inspect' | 'place' | 'road_dirt' | 'road_paved' | 'bulldoze') => void;
  setPendingPlacementType: (type: BuildingType | null) => void;
  togglePlacementRotation: () => void;

  extractFossilDna: (fossilCount?: number) => { success: boolean; message: string; pointsGained: number };
  upgradeDnaAttribute: (attr: DnaAttributeType) => { success: boolean; message: string };

  constructBuilding: (type: BuildingType) => { success: boolean; message: string };
  placeBuilding: (type: BuildingType, x: number, y: number, rotation?: 0 | 90, assignedResource?: ResourceType) => boolean;
  pickupBuilding: (id: string) => boolean;
  rotatePlacedBuilding: (id: string) => boolean;
  upgradeBuilding: (id: string) => { success: boolean; message: string };
  startResearch: (nodeId: string) => { success: boolean; message: string };
  applyTimeWarp: (seconds: number) => { success: boolean; message: string };

  setHarvesterResource: (id: string, resource: ResourceType) => void;
  setBarrelResource: (id: string, resource: ResourceType) => void;
  setArtisanRecipe: (id: string, recipeId: string) => void;
  craftArtisanRecipe: (recipeId: string, buildingId?: string) => { success: boolean; message: string };
  brewPotion: (potionId: string, buildingId?: string) => { success: boolean; message: string };
  drinkPotion: (potionId: string) => { success: boolean; message: string };
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
  metal: 20,
  steel: 10,
  electronics: 10,
  fossils: 10,
};

function generateRealistic175Grid(): GridTile[][] {
  const grid: GridTile[][] = [];
  const simplexLike = (x: number, y: number, scale: number) => {
    return Math.sin(x * scale) * Math.cos(y * scale) + Math.sin((x + y) * scale * 0.7);
  };

  for (let y = 0; y < GRID_SIZE; y++) {
    const row: GridTile[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      let terrain: TerrainType = 'grass';
      const resources: ResourceType[] = [];

      // Starter area clearing (ensure safe build area around Town Hall at 85,85)
      const inStarterClearing = x >= 80 && x <= 95 && y >= 80 && y <= 95;

      const riverCenterX = 60 + Math.sin(y / 11) * 24 + Math.cos(y / 23) * 14;
      const lakeDist1 = Math.hypot(x - 70, y - 90);
      const lakeDist2 = Math.hypot(x - 40, y - 135);
      const lakeDist3 = Math.hypot(x - 135, y - 45);
      const distToRiver = Math.abs(x - riverCenterX);

      if (!inStarterClearing && (distToRiver < 2.5 || lakeDist1 < 9 || lakeDist2 < 8 || lakeDist3 < 9)) {
        terrain = 'water';
        resources.push('water');
      } else if (!inStarterClearing && (distToRiver < 5.0 || lakeDist1 < 12.5 || lakeDist2 < 11.0 || lakeDist3 < 12.0)) {
        terrain = 'clay_shore';
        resources.push('clay', 'sand');
        if ((x + y) % 3 === 0) resources.push('water');
        if ((x * y) % 7 === 0) resources.push('fossils');
      } else if (!inStarterClearing && x > 125 && y > 125 && simplexLike(x, y, 0.15) > -0.2) {
        terrain = 'volcanic';
        resources.push('lava', 'stone');
        if ((x * y) % 2 === 0) resources.push('oil');
        if ((x + y) % 5 === 0) resources.push('fossils');
      } else if (
        !inStarterClearing &&
        ((x > 115 && y < 75 && simplexLike(x, y, 0.12) > -0.25) ||
         (x < 35 && y > 35 && y < 120 && simplexLike(x, y, 0.14) > -0.2))
      ) {
        terrain = 'mountain';
        resources.push('stone', 'granite');
        if ((x + y) % 3 === 0) resources.push('marble');
        if ((x * y) % 4 === 0) resources.push('coal');
      } else if (!inStarterClearing && x > 85 && x < 130 && y > 80 && y < 125 && simplexLike(x, y, 0.1) > 0.12) {
        terrain = 'sand';
        resources.push('sand', 'stone');
        if ((x * y) % 5 === 0) resources.push('fossils');
      } else if (
        !inStarterClearing &&
        ((x < 55 && y < 60 && simplexLike(x, y, 0.12) > -0.3) ||
         (x > 60 && x < 110 && y > 15 && y < 65 && simplexLike(x, y, 0.13) > -0.1) ||
         simplexLike(x, y, 0.2) > 0.5)
      ) {
        terrain = 'forest';
        resources.push('wood');
        if ((x + y) % 2 === 0) resources.push('string');
      } else {
        terrain = 'grass';
        if ((x * 7 + y * 13) % 23 === 0) resources.push('wood');
        if ((x * 11 + y * 5) % 19 === 0) resources.push('string');
        if ((x * 3 + y * 9) % 31 === 0) resources.push('water');
        if ((x * 17 + y * 7) % 37 === 0) resources.push('fossils');
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

function createDefaultStuffySimStates(robotCount: number = 5): Record<string, StuffySimState> {
  const map: Record<string, StuffySimState> = {};

  // 1. Initial 5 Robots (at 75% efficiency)
  for (let i = 1; i <= robotCount; i++) {
    const id = `robot_${i}`;
    map[id] = {
      id,
      name: `Automaton Unit #${i}`,
      species: 'Robot',
      icon: '🤖',
      color: '#94a3b8',
      x: 83 + (i % 2),
      y: 85 + Math.floor(i / 2),
      facing: 'right',
      activity: 'wandering',
      assignedBuildingId: null,
      restTimer: 0,
      moraleBoostsGiven: 0,
      isRobot: true,
    };
  }

  // 2. Story Plushies
  const unlocked = typeof window !== 'undefined' ? useStoryStore.getState().unlockedStuffies : ['jefe', 'alex', 'finlee', 'fifi'];
  const storyList = unlocked && unlocked.length > 0 ? unlocked : ['jefe', 'alex', 'finlee', 'fifi'];
  storyList.forEach((sid, idx) => {
    const def = ALL_STUFFIES.find((s) => s.id === sid);
    map[sid] = {
      id: sid,
      name: def?.name || sid,
      species: def?.species || 'Plushie',
      icon: def?.species === 'Penguin' ? '🐧' : def?.species === 'Axolotl' ? '🦎' : def?.species === 'Orca' ? '🐋' : def?.species === 'Fox' ? '🦊' : '🧸',
      color: def?.color || '#ec4899',
      x: 86 + (idx % 3),
      y: 86 + Math.floor(idx / 3),
      facing: 'right',
      activity: 'wandering',
      assignedBuildingId: null,
      restTimer: 0,
      moraleBoostsGiven: 0,
      isRobot: false,
    };
  });

  return map;
}

export const useTownStore = create<TownStore>((set, get) => ({
  grid: generateRealistic175Grid(),
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
    artisan: 1,
    charging_port: 1,
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
  robotCount: 5,
  stuffySimStates: {},
  potionsInventory: { potion_heal: 2, potion_morale: 1 },
  dnaPoints: 0,
  dnaAttributes: {
    vitality: 0,
    ferocity: 0,
    speed: 0,
    defense: 0,
    instinct: 0,
  },

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
        robotCount: state.robotCount,
        stuffySimStates: state.stuffySimStates,
        potionsInventory: state.potionsInventory,
        dnaPoints: state.dnaPoints,
        dnaAttributes: state.dnaAttributes,
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
          if (parsed && parsed.grid && parsed.resources) {
            let workingGrid: GridTile[][];
            if (parsed.grid.length === GRID_SIZE) {
              workingGrid = parsed.grid;
            } else {
              // Smooth migration to 175x175: generate fresh 175x175 terrain and re-stamp existing paths & buildings
              workingGrid = generateRealistic175Grid();
              const oldGrid: GridTile[][] = parsed.grid;
              for (let y = 0; y < Math.min(oldGrid.length, GRID_SIZE); y++) {
                for (let x = 0; x < Math.min(oldGrid[y].length, GRID_SIZE); x++) {
                  if (oldGrid[y][x].pathType && oldGrid[y][x].pathType !== 'none') {
                    workingGrid[y][x].pathType = oldGrid[y][x].pathType;
                  }
                }
              }
              if (parsed.buildings && Array.isArray(parsed.buildings)) {
                for (const b of parsed.buildings) {
                  const bw = b.rotation === 90 ? b.height : b.width;
                  const bh = b.rotation === 90 ? b.width : b.height;
                  for (let dy = 0; dy < bh; dy++) {
                    for (let dx = 0; dx < bw; dx++) {
                      const ty = b.y + dy;
                      const tx = b.x + dx;
                      if (ty >= 0 && ty < GRID_SIZE && tx >= 0 && tx < GRID_SIZE) {
                        workingGrid[ty][tx].buildingId = b.id;
                      }
                    }
                  }
                }
              }
            }

            const savedRobots = parsed.robotCount ?? 5;
            let savedBuildings: PlacedBuilding[] = parsed.buildings || [];
            let savedStorage = parsed.buildingStorage || {
              town_hall: 1,
              academy: 1,
              houses: 3,
              forge: 1,
              artisan: 1,
              charging_port: 1,
              apothecary: 1,
            };

            // Ensure charging port exists
            if (
              !savedBuildings.some((b) => b.type === 'charging_port') &&
              !(savedStorage.charging_port && savedStorage.charging_port > 0)
            ) {
              savedStorage = { ...savedStorage, charging_port: 1 };
            }

            const baseSim = createDefaultStuffySimStates(savedRobots);
            const mergedSim: Record<string, StuffySimState> = {
              ...baseSim,
              ...(parsed.stuffySimStates || {}),
            };

            set({
              grid: workingGrid,
              resources: { ...DEFAULT_RESOURCES, ...parsed.resources },
              buildings: savedBuildings.map((b: PlacedBuilding) => ({
                ...b,
                upgradeSlots: b.upgradeSlots || [null],
                maxUpgradeSlots: b.maxUpgradeSlots || 1,
                assignedStuffyId: b.assignedStuffyId ?? null,
                cycleProgress: b.cycleProgress ?? 0,
                cycleDuration: b.cycleDuration ?? 15,
              })),
              buildingStorage: savedStorage,
              unlockedResearchTier: parsed.unlockedResearchTier ?? 1,
              unlockedTechNodes: parsed.unlockedTechNodes || ['core_hub'],
              forgeModulesInventory: parsed.forgeModulesInventory || [],
              researchingNodeId: parsed.researchingNodeId ?? null,
              researchTimeRemaining: parsed.researchTimeRemaining ?? 0,
              timeWarpMinutes: parsed.timeWarpMinutes ?? 30,
              robotCount: savedRobots,
              stuffySimStates: mergedSim,
              potionsInventory: parsed.potionsInventory || { potion_heal: 2, potion_morale: 1 },
              dnaPoints: parsed.dnaPoints ?? 0,
              dnaAttributes: parsed.dnaAttributes || {
                vitality: 0,
                ferocity: 0,
                speed: 0,
                defense: 0,
                instinct: 0,
              },
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

    // FRESH INITIALIZATION: Place starter Town Hall, Charging Port (2x2), 3 Houses, and Roads centered at (85, 85)
    const newGrid = get().grid.map((row) => row.map((t) => ({ ...t })));
    for (let ry = 82; ry <= 88; ry++) newGrid[ry][84].pathType = 'dirt';
    for (let rx = 82; rx <= 92; rx++) newGrid[84][rx].pathType = 'dirt';

    const townHall: PlacedBuilding = {
      id: 'b_town_hall_starter',
      type: 'town_hall',
      x: 85,
      y: 85,
      width: 3,
      height: 3,
      rotation: 0,
      level: 1,
      isConnectedToTownHall: true,
      upgradeSlots: [null],
      maxUpgradeSlots: 1,
    };
    for (let dy = 0; dy < 3; dy++) {
      for (let dx = 0; dx < 3; dx++) {
        newGrid[85 + dy][85 + dx].buildingId = townHall.id;
      }
    }

    const chargingPort: PlacedBuilding = {
      id: 'b_charging_port_starter',
      type: 'charging_port',
      x: 82,
      y: 85,
      width: 2,
      height: 2,
      rotation: 0,
      level: 1,
      isConnectedToTownHall: true,
      upgradeSlots: [null],
      maxUpgradeSlots: 1,
    };
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        newGrid[85 + dy][82 + dx].buildingId = chargingPort.id;
      }
    }

    const starterHouses: PlacedBuilding[] = [85, 88, 91].map((hx, idx) => {
      const hid = `b_houses_starter_${idx + 1}`;
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          newGrid[82 + dy][hx + dx].buildingId = hid;
        }
      }
      return {
        id: hid,
        type: 'houses' as BuildingType,
        x: hx,
        y: 82,
        width: 2,
        height: 2,
        rotation: 0,
        level: 1,
        isConnectedToTownHall: true,
        upgradeSlots: [null],
        maxUpgradeSlots: 1,
      };
    });

    set({
      grid: newGrid,
      buildings: [townHall, chargingPort, ...starterHouses],
      buildingStorage: {
        academy: 1,
        lumberjack: 1,
        mine: 1,
        barrel: 2,
        forge: 1,
        artisan: 1,
      },
      robotCount: 5,
      stuffySimStates: createDefaultStuffySimStates(5),
    });

    get().updateConnectivity();
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
      // Containers (Barrel, Silo, Vault, Cryo-Vault) ONLY provide capacity if connected orthogonally to road network
      if ((b.type === 'barrel' || b.type === 'silo' || b.type === 'vault_box' || b.type === 'cryo_vault') && b.assignedResource && b.isConnectedToTownHall) {
        const framingBonus = (b.upgradeSlots || []).reduce((sum, mod) => sum + (mod?.statBonus.extraStorage || 0), 0);
        const perLevelCap = b.type === 'cryo_vault' ? 300 : (b.type === 'silo' || b.type === 'vault_box') ? 200 : 150;
        newCaps[b.assignedResource] = (newCaps[b.assignedResource] || 100) + perLevelCap * b.level + framingBonus;
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
      assignedResource: assignedResource || (def.category === 'container' ? 'wood' : def.harvestOptions?.[0]),
      assignedStuffyId: null, // "Things don't work without them"
      cycleProgress: 0,
      cycleDuration: 15, // 15 seconds (2 wood every 15s for Tier 1)
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
    const { buildings, stuffySimStates } = get();
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

    const updatedSim = { ...stuffySimStates };
    if (stuffySpeciesId && updatedSim[stuffySpeciesId]) {
      const s = updatedSim[stuffySpeciesId];
      if (s.isRobot) {
        updatedSim[stuffySpeciesId] = {
          ...s,
          assignedBuildingId: buildingId,
          activity: 'working',
          x: target.x,
          y: target.y,
        };
      } else {
        const isInside =
          s.x >= target.x &&
          s.x < target.x + target.width &&
          s.y >= target.y &&
          s.y < target.y + target.height;
        updatedSim[stuffySpeciesId] = {
          ...s,
          assignedBuildingId: buildingId,
          activity: isInside ? 'working' : 'walking_to_work',
          targetX: target.x,
          targetY: target.y,
        };
      }
    } else if (!stuffySpeciesId && target.assignedStuffyId && updatedSim[target.assignedStuffyId]) {
      updatedSim[target.assignedStuffyId] = {
        ...updatedSim[target.assignedStuffyId],
        assignedBuildingId: null,
        activity: 'wandering',
      };
    }

    set({ buildings: updated, stuffySimStates: updatedSim });
    get().saveProgress();

    const isRobot = stuffySpeciesId?.startsWith('robot_');
    return {
      success: true,
      message: stuffySpeciesId
        ? isRobot
          ? `🤖 Assigned Robot Worker to ${target.type}! (75% Efficiency)`
          : `🧸 Assigned ${updatedSim[stuffySpeciesId]?.name || stuffySpeciesId} to ${target.type}! Walking to work.`
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

  setArtisanRecipe: (id, recipeId) => {
    set((state) => ({
      buildings: state.buildings.map((b) =>
        b.id === id ? { ...b, assignedRecipeId: recipeId } : b
      ),
    }));
    get().saveProgress();
  },

  craftArtisanRecipe: (recipeId, buildingId) => {
    const { resources, storageCaps } = get();
    const recipe = ARTISAN_RECIPES.find((r) => r.id === recipeId);
    if (!recipe) return { success: false, message: 'Recipe not found.' };

    for (const [res, cost] of Object.entries(recipe.cost)) {
      if ((resources[res as ResourceType] || 0) < (cost || 0)) {
        return { success: false, message: `Not enough ${res}! Need ${cost}, have ${resources[res as ResourceType] || 0}.` };
      }
    }

    const currentOut = resources[recipe.outputResource] || 0;
    const cap = storageCaps[recipe.outputResource] || 100;
    if (currentOut >= cap) {
      return { success: false, message: `Storage cap reached for ${recipe.outputResource}! (${currentOut}/${cap})` };
    }

    const newResources = { ...resources };
    for (const [res, cost] of Object.entries(recipe.cost)) {
      newResources[res as ResourceType] -= cost || 0;
    }
    const added = Math.min(recipe.outputAmount, cap - currentOut);
    newResources[recipe.outputResource] = Math.min(cap, currentOut + added);

    set({ resources: newResources });
    get().saveProgress();
    return { success: true, message: `🎨 Crafted +${added} ${recipe.name}! (${newResources[recipe.outputResource]}/${cap})` };
  },

  brewPotion: (potionId: string, buildingId?: string) => {
    const { resources } = get();
    const recipe = POTION_RECIPES.find((p) => p.id === potionId);
    if (!recipe) return { success: false, message: 'Potion recipe not found.' };

    for (const [res, cost] of Object.entries(recipe.cost)) {
      if ((resources[res as ResourceType] || 0) < (cost || 0)) {
        return { success: false, message: `Not enough ${res}! Need ${cost}, have ${resources[res as ResourceType] || 0}.` };
      }
    }

    const newResources = { ...resources };
    for (const [res, cost] of Object.entries(recipe.cost)) {
      newResources[res as ResourceType] -= cost || 0;
    }

    const currentCount = get().potionsInventory[potionId] || 0;
    set({
      resources: newResources,
      potionsInventory: {
        ...get().potionsInventory,
        [potionId]: currentCount + 1,
      },
    });

    get().saveProgress();
    return {
      success: true,
      message: `⚗️ Brewed 1x ${recipe.name}! (${recipe.icon} In bag: ${currentCount + 1})`,
    };
  },

  drinkPotion: (potionId: string) => {
    const { potionsInventory, applyTimeWarp } = get();
    const count = potionsInventory[potionId] || 0;
    if (count <= 0) {
      return { success: false, message: 'No potions of this type in your bag!' };
    }

    const recipe = POTION_RECIPES.find((p) => p.id === potionId);
    if (!recipe) return { success: false, message: 'Unknown potion.' };

    let effectMsg = '';
    if (recipe.effectType === 'warp') {
      applyTimeWarp(recipe.effectValue);
      effectMsg = `Fast-forwarded town time by +${recipe.effectValue} seconds!`;
    } else if (recipe.effectType === 'morale') {
      const currentSim = { ...get().stuffySimStates };
      Object.values(currentSim).forEach((s) => {
        s.moraleBoostsGiven = (s.moraleBoostsGiven || 0) + 2;
      });
      set({ stuffySimStates: currentSim });
      effectMsg = `Town morale surged by +${recipe.effectValue} points!`;
    } else if (recipe.effectType === 'crackers') {
      effectMsg = `Gained +${recipe.effectValue} Crackers for combat!`;
    } else if (recipe.effectType === 'yields') {
      applyTimeWarp(30);
      effectMsg = `Supercharged harvesters (+${recipe.effectValue}% yields)!`;
    } else {
      effectMsg = `Consumed ${recipe.name}! Feeling restored and energized.`;
    }

    set({
      potionsInventory: {
        ...potionsInventory,
        [potionId]: count - 1,
      },
    });

    get().saveProgress();
    return {
      success: true,
      message: `🧪 Drank ${recipe.name}! ${effectMsg}`,
    };
  },

  extractFossilDna: (fossilCount?: number) => {
    const { resources, dnaPoints } = get();
    const available = resources.fossils || 0;
    const requested = fossilCount && fossilCount > 0 ? Math.min(fossilCount, available) : available;
    const pointsGained = Math.floor(requested / 10);
    if (pointsGained <= 0) {
      return {
        success: false,
        message: `Need at least 10 Ancient Fossils to extract 1 DNA Helix Point! (Current: ${available} Fossils)`,
        pointsGained: 0,
      };
    }
    const cost = pointsGained * 10;
    const nextFossils = available - cost;
    const nextPoints = (dnaPoints || 0) + pointsGained;
    set({
      resources: { ...resources, fossils: nextFossils },
      dnaPoints: nextPoints,
    });
    get().saveProgress();
    return {
      success: true,
      message: `🧬 Extracted ${cost} Fossils into +${pointsGained} DNA Helix Point${pointsGained > 1 ? 's' : ''}! (Total Points: ${nextPoints})`,
      pointsGained,
    };
  },

  upgradeDnaAttribute: (attr: DnaAttributeType) => {
    const { dnaPoints, dnaAttributes } = get();
    if ((dnaPoints || 0) < 1) {
      return {
        success: false,
        message: 'Not enough DNA Helix Points! Extract Ancient Fossils from the digsite to earn points.',
      };
    }
    const currentAttrs = dnaAttributes || {
      vitality: 0,
      ferocity: 0,
      speed: 0,
      defense: 0,
      instinct: 0,
    };
    const currentLevel = currentAttrs[attr] || 0;
    if (currentLevel >= 10) {
      return {
        success: false,
        message: `${attr.toUpperCase()} is already maxed at Level 10!`,
      };
    }
    const nextAttrs = {
      ...currentAttrs,
      [attr]: currentLevel + 1,
    };
    const nextPoints = dnaPoints - 1;
    set({
      dnaPoints: nextPoints,
      dnaAttributes: nextAttrs,
    });
    get().saveProgress();

    const attrNames: Record<DnaAttributeType, string> = {
      vitality: '🦖 Tyranno Vitality (+10 Max HP)',
      ferocity: '💥 Apex Ferocity (+5% Damage)',
      speed: '⚡ Raptor Reflexes (+8 Speed)',
      defense: '🛡️ Ankylosaur Carapace (+10 Shield)',
      instinct: '👁️ Pterodactyl Instinct (+3% Crit, +2% Evasion)',
    };

    return {
      success: true,
      message: `🧬 Upgraded ${attrNames[attr]} to Level ${currentLevel + 1}! All stuffies permanently boosted!`,
    };
  },

  forgeModule: (type) => {
    const { resources, forgeModulesInventory, robotCount, stuffySimStates } = get();
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

    if ((type as string) === 'robot_worker') {
      const newRobotCount = robotCount + 1;
      const newId = `robot_${newRobotCount}`;
      const newSim = {
        ...stuffySimStates,
        [newId]: {
          id: newId,
          name: `Automaton Unit #${newRobotCount}`,
          species: 'Automaton Robot',
          icon: '🤖',
          color: '#94a3b8',
          x: 43 + (newRobotCount % 2),
          y: 45 + Math.floor(newRobotCount / 2),
          facing: 'right' as const,
          activity: 'wandering' as const,
          assignedBuildingId: null,
          restTimer: 0,
          moraleBoostsGiven: 0,
          isRobot: true,
        },
      };

      set({
        resources: newResources,
        robotCount: newRobotCount,
        stuffySimStates: newSim,
      });
      get().saveProgress();
      return {
        success: true,
        message: `🤖 Forged Automaton Robot Worker #${newRobotCount}! Works at 75% efficiency. (Requires 2x2 Charging Port capacity)`,
      };
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

  // 2 Wood / Resources per 15 Seconds for Tier 1 Harvesters & Crafter Cycles (when worker assigned & road connected)
  tickProduction: (deltaSeconds: number) => {
    const {
      grid,
      buildings,
      resources,
      storageCaps,
      researchingNodeId,
      researchTimeRemaining,
      unlockedTechNodes,
      stuffySimStates,
      robotCount,
    } = get();

    let researchCompleted = false;
    const nextPotionsInventory = { ...get().potionsInventory };

    // 1. Advance Research Timer if active (Observatory & Grand Library speed up research)
    const hasObservatory = buildings.some((b) => b.type === 'observatory' && b.isConnectedToTownHall);
    const hasLibrary = buildings.some((b) => b.type === 'grand_library' && b.isConnectedToTownHall);
    const researchMultiplier = (hasObservatory ? 1.5 : 1.0) * (hasLibrary ? 1.5 : 1.0);
    const effectiveDelta = deltaSeconds * researchMultiplier;

    if (researchingNodeId) {
      const remaining = researchTimeRemaining - effectiveDelta;
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

    // 2. Advance Stuffy Physical Movement & Morale Simulation
    const updatedSim: Record<string, StuffySimState> = {};
    for (const [k, v] of Object.entries(stuffySimStates)) {
      updatedSim[k] = { ...v };
    }

    const connectedChargingPorts = buildings.filter(
      (b) => b.type === 'charging_port' && b.isConnectedToTownHall
    );
    const connectedBatteryBanks = buildings.filter(
      (b) => b.type === 'battery_bank' && b.isConnectedToTownHall
    );
    const maxRobotsSupported = (connectedChargingPorts.length + connectedBatteryBanks.length) * 5;
    const activeRobots: string[] = [];
    buildings.forEach((b) => {
      if (b.assignedStuffyId?.startsWith('robot_')) {
        activeRobots.push(b.assignedStuffyId);
      }
    });

    for (const [sid, stuffy] of Object.entries(updatedSim)) {
      if (stuffy.isRobot) {
        if (stuffy.assignedBuildingId) {
          const b = buildings.find((x) => x.id === stuffy.assignedBuildingId);
          if (b) {
            stuffy.x = b.x;
            stuffy.y = b.y;
            stuffy.activity = 'working';
          }
        } else {
          stuffy.activity = 'wandering';
        }
      } else {
        // Story Mode Plushie
        const assignedB = stuffy.assignedBuildingId
          ? buildings.find((x) => x.id === stuffy.assignedBuildingId)
          : null;

        if (stuffy.activity === 'walking_to_work' && assignedB) {
          const dx = assignedB.x - stuffy.x;
          const dy = assignedB.y - stuffy.y;
          if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            stuffy.x = assignedB.x;
            stuffy.y = assignedB.y;
            stuffy.activity = 'working';
          } else {
            stuffy.x += Math.sign(dx);
            stuffy.y += Math.sign(dy);
            stuffy.facing = dx >= 0 ? 'right' : 'left';
          }
        } else if (stuffy.activity === 'working' && assignedB) {
          stuffy.x = assignedB.x;
          stuffy.y = assignedB.y;
          // Random chance (~2% per second) to take a rest at a house to boost morale
          if (Math.random() < 0.02) {
            const nearestHouse = buildings.find(
              (b) => b.type === 'houses' && b.isConnectedToTownHall
            );
            if (nearestHouse) {
              stuffy.activity = 'walking_to_house';
              stuffy.targetX = nearestHouse.x;
              stuffy.targetY = nearestHouse.y;
            }
          }
        } else if (stuffy.activity === 'walking_to_house') {
          const tx = stuffy.targetX ?? 45;
          const ty = stuffy.targetY ?? 42;
          const dx = tx - stuffy.x;
          const dy = ty - stuffy.y;
          if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            stuffy.x = tx;
            stuffy.y = ty;
            stuffy.activity = 'resting_at_house';
            stuffy.restTimer = 15;
            stuffy.moraleBoostsGiven = (stuffy.moraleBoostsGiven || 0) + 1;
          } else {
            stuffy.x += Math.sign(dx);
            stuffy.y += Math.sign(dy);
            stuffy.facing = dx >= 0 ? 'right' : 'left';
          }
        } else if (stuffy.activity === 'resting_at_house') {
          stuffy.restTimer -= deltaSeconds;
          if (stuffy.restTimer <= 0) {
            if (assignedB) {
              stuffy.activity = 'walking_to_work';
              stuffy.targetX = assignedB.x;
              stuffy.targetY = assignedB.y;
            } else {
              stuffy.activity = 'wandering';
            }
          }
        } else {
          // Wandering freely around town
          if (Math.random() < 0.2) {
            const stepDirs = [
              { dx: 1, dy: 0, f: 'right' as const },
              { dx: -1, dy: 0, f: 'left' as const },
              { dx: 0, dy: 1, f: stuffy.facing },
              { dx: 0, dy: -1, f: stuffy.facing },
            ];
            const ch = stepDirs[Math.floor(Math.random() * stepDirs.length)];
            stuffy.x = Math.max(0, Math.min(GRID_SIZE - 1, stuffy.x + ch.dx));
            stuffy.y = Math.max(0, Math.min(GRID_SIZE - 1, stuffy.y + ch.dy));
            stuffy.facing = ch.f;
          }
        }
      }
    }

    const newResources = { ...resources };
    let harvestedCount = 0;

    // 3. Advance Harvester and Crafter Cycles
    const hasTrainDepot = buildings.some((b) => b.type === 'train_depot' && b.isConnectedToTownHall);

    const updatedBuildings = buildings.map((b) => {
      const def = BUILDING_DEFINITIONS[b.type];
      const isHarvester = def.category === 'harvester';
      const isArtisan = b.type === 'artisan' || b.type === 'foundry' || b.type === 'glassworks' || b.type === 'tannery' || b.type === 'paper_mill' || b.type === 'jeweler' || b.type === 'gem_cutter';
      const isApothecary = b.type === 'apothecary' || b.type === 'alchemy';
      if (!isHarvester && !isArtisan && !isApothecary) return b;

      // RULE: Things don't work without road connection or assigned worker!
      if (!b.isConnectedToTownHall || !b.assignedStuffyId) {
        return b;
      }

      const worker = updatedSim[b.assignedStuffyId];
      if (!worker) return b;

      let workerEfficiency = hasTrainDepot ? 1.10 : 1.0;
      if (worker.isRobot) {
        // Must have charging port capacity (1 port per 5 robots)
        const robotIdx = activeRobots.indexOf(b.assignedStuffyId);
        if (robotIdx >= maxRobotsSupported) {
          return b; // Unpowered robot, needs charging port
        }
        // User rule: Robots work at 75% efficiency
        workerEfficiency = 0.75;
        if (hasTrainDepot) workerEfficiency *= 1.10;
      } else {
        // Stuffies ONLY work when physically inside the building!
        const isInside =
          worker.activity === 'working' &&
          worker.x >= b.x &&
          worker.x < b.x + b.width &&
          worker.y >= b.y &&
          worker.y < b.y + b.height;
        if (!isInside) {
          return b; // Worker is walking to work or resting at house to boost morale
        }
        workerEfficiency = 1.0;
      }

      // HARVESTERS
      if (isHarvester) {
        const target = b.assignedResource;
        if (!target) return b;

        const cap = storageCaps[target] || 100;
        const current = newResources[target] || 0;
        if (current >= cap) return b; // Storage full

        let timeReductionPercent = 0;
        let yieldBonusPercent = 0;
        let rareChance = 0;

        for (const mod of b.upgradeSlots || []) {
          if (mod?.statBonus.timeReductionPercent) timeReductionPercent += mod.statBonus.timeReductionPercent;
          if (mod?.statBonus.yieldBonusPercent) yieldBonusPercent += mod.statBonus.yieldBonusPercent;
          if (mod?.statBonus.rareChancePercent) rareChance += mod.statBonus.rareChancePercent;
        }

        const baseDuration = Math.max(5, 15 - (b.level - 1) * 2);
        const effectiveDuration = Math.max(3, (baseDuration * (1 - timeReductionPercent / 100)) / workerEfficiency);

        let curProgress = (b.cycleProgress || 0) + deltaSeconds;

        if (curProgress >= effectiveDuration) {
          const cyclesCompleted = Math.floor(curProgress / effectiveDuration);
          curProgress = curProgress % effectiveDuration;

          const baseYield = 2 + (b.level - 1);
          const cycleYield = Math.round(baseYield * (1 + yieldBonusPercent / 100)) * cyclesCompleted;
          const availableSpace = cap - (newResources[target] || 0);
          const added = Math.min(cycleYield, availableSpace);

          if (added > 0) {
            newResources[target] = Math.min(cap, (newResources[target] || 0) + added);
            harvestedCount += added;
          }

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
      }

      // APOTHECARY & POTION BREWERS
      if (isApothecary && b.assignedRecipeId) {
        const recipe = POTION_RECIPES.find((r) => r.id === b.assignedRecipeId);
        if (!recipe) return b;

        const canAfford = Object.entries(recipe.cost).every(
          ([res, cost]) => (newResources[res as ResourceType] || 0) >= (cost || 0)
        );
        if (!canAfford) return b;

        let timeReductionPercent = 0;
        for (const mod of b.upgradeSlots || []) {
          if (mod?.statBonus.timeReductionPercent) timeReductionPercent += mod.statBonus.timeReductionPercent;
        }

        const baseDuration = recipe.duration || 15;
        const effectiveDuration = Math.max(3, (baseDuration * (1 - timeReductionPercent / 100)) / workerEfficiency);

        let curProgress = (b.cycleProgress || 0) + deltaSeconds;

        if (curProgress >= effectiveDuration) {
          const cyclesCompleted = Math.floor(curProgress / effectiveDuration);
          curProgress = curProgress % effectiveDuration;

          for (let c = 0; c < cyclesCompleted; c++) {
            const stillCanAfford = Object.entries(recipe.cost).every(
              ([res, cost]) => (newResources[res as ResourceType] || 0) >= (cost || 0)
            );
            if (!stillCanAfford) break;

            for (const [res, cost] of Object.entries(recipe.cost)) {
              newResources[res as ResourceType] -= cost || 0;
            }
            nextPotionsInventory[recipe.id] = (nextPotionsInventory[recipe.id] || 0) + 1;
            harvestedCount += 1;
          }
        }

        return {
          ...b,
          cycleProgress: curProgress,
          cycleDuration: Math.round(effectiveDuration),
        };
      }

      // ARTISAN CRAFTERS (craft metal, steel, electronics, etc.)
      if (isArtisan && b.assignedRecipeId) {
        const recipe = ARTISAN_RECIPES.find((r) => r.id === b.assignedRecipeId);
        if (!recipe) return b;

        const cap = storageCaps[recipe.outputResource] || 100;
        const current = newResources[recipe.outputResource] || 0;
        if (current >= cap) return b;

        const canAfford = Object.entries(recipe.cost).every(
          ([res, cost]) => (newResources[res as ResourceType] || 0) >= (cost || 0)
        );
        if (!canAfford) return b;

        let timeReductionPercent = 0;
        for (const mod of b.upgradeSlots || []) {
          if (mod?.statBonus.timeReductionPercent) timeReductionPercent += mod.statBonus.timeReductionPercent;
        }

        const baseDuration = recipe.duration || 15;
        const effectiveDuration = Math.max(3, (baseDuration * (1 - timeReductionPercent / 100)) / workerEfficiency);

        let curProgress = (b.cycleProgress || 0) + deltaSeconds;

        if (curProgress >= effectiveDuration) {
          const cyclesCompleted = Math.floor(curProgress / effectiveDuration);
          curProgress = curProgress % effectiveDuration;

          for (let c = 0; c < cyclesCompleted; c++) {
            const stillCanAfford = Object.entries(recipe.cost).every(
              ([res, cost]) => (newResources[res as ResourceType] || 0) >= (cost || 0)
            );
            if (!stillCanAfford) break;

            for (const [res, cost] of Object.entries(recipe.cost)) {
              newResources[res as ResourceType] -= cost || 0;
            }
            const space = cap - (newResources[recipe.outputResource] || 0);
            const added = Math.min(recipe.outputAmount, space);
            newResources[recipe.outputResource] = Math.min(cap, (newResources[recipe.outputResource] || 0) + added);
            harvestedCount += added;
          }
        }

        return {
          ...b,
          cycleProgress: curProgress,
          cycleDuration: Math.round(effectiveDuration),
        };
      }

      return b;
    });

    // Enforce strict clamping
    for (const res of Object.keys(newResources) as ResourceType[]) {
      const cap = storageCaps[res] || 100;
      if (newResources[res] > cap) {
        newResources[res] = cap;
      }
    }

    set({
      buildings: updatedBuildings,
      resources: newResources,
      stuffySimStates: updatedSim,
      potionsInventory: nextPotionsInventory,
    });
    get().saveProgress();

    return { harvestedCount, researchCompleted };
  },

  getMoraleInfo: () => {
    const { buildings, stuffySimStates } = get();
    let score = 10;

    // Morale boosts earned from plushies resting at their houses
    for (const stuffy of Object.values(stuffySimStates || {})) {
      if (!stuffy.isRobot && stuffy.moraleBoostsGiven) {
        score += stuffy.moraleBoostsGiven * 3;
      }
    }

    for (const b of buildings) {
      let moduleAura = 0;
      for (const mod of b.upgradeSlots || []) {
        if (mod?.statBonus.moraleAura) moduleAura += mod.statBonus.moraleAura;
      }

      if (b.type === 'houses') {
        const bonus = b.isConnectedToTownHall ? 20 * b.level : 10 * b.level;
        score += bonus + moduleAura;
      }
      if (b.type === 'stuffy_inn' && b.isConnectedToTownHall) {
        score += 15 * b.level + moduleAura;
      }
      if (b.type === 'bakery' && b.isConnectedToTownHall) {
        score += 20 * b.level + moduleAura;
      }
      if (b.type === 'tea_house' && b.isConnectedToTownHall) {
        score += 15 * b.level + moduleAura;
      }
      if (b.type === 'amphitheater' && b.isConnectedToTownHall) {
        score += 20 * b.level + moduleAura;
      }
      if (b.type === 'carousel' && b.isConnectedToTownHall) {
        score += 25 * b.level + moduleAura;
      }
      if (b.type === 'waterfall_sanctuary' && b.isConnectedToTownHall) {
        score += 35 * b.level + moduleAura;
      }
      if (b.type === 'hot_springs' && b.isConnectedToTownHall) {
        score += 25 * b.level + moduleAura;
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
