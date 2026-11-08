'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTownStore, GRID_SIZE } from '@/store/townStore';
import {
  BUILDING_DEFINITIONS,
  ALL_RESOURCES,
  TECH_TREE_NODES,
  FORGE_RECIPES,
  ARTISAN_RECIPES,
  POTION_RECIPES,
} from '@/data/townBuildings';
import { BuildingType, ResourceType, BuildingCategory, TechTreeNode } from '@/types/town';
import { useStoryStore } from '@/store/storyStore';
import { ALL_STUFFIES } from '@/data/stuffies';
import { sound } from '@/utils/audio';

interface TownBuilderProps {
  onBack: () => void;
}

const TILE_SIZE = 38;


export default function TownBuilder({ onBack }: TownBuilderProps) {
  const {
    grid,
    resources,
    storageCaps,
    buildings,
    buildingStorage,
    unlockedResearchTier,
    unlockedTechNodes,
    forgeModulesInventory,
    researchingNodeId,
    researchTimeRemaining,
    selectedTile,
    selectedBuildingId,
    activeTool,
    pendingPlacementType,
    placementRotation,
    initializeTown,
    selectTile,
    setSelectedBuildingId,
    setActiveTool,
    setPendingPlacementType,
    togglePlacementRotation,
    constructBuilding,
    placeBuilding,
    pickupBuilding,
    rotatePlacedBuilding,
    upgradeBuilding,
    startResearch,
    applyTimeWarp,
    assignStuffyToBuilding,
    setHarvesterResource,
    setBarrelResource,
    setArtisanRecipe,
    craftArtisanRecipe,
    forgeModule,
    equipModule,
    unequipModule,
    setPath,
    clearTileRoad,
    tickProduction,
    getMoraleInfo,
    robotCount,
    stuffySimStates,
    potionsInventory,
    brewPotion,
    drinkPotion,
    dnaPoints,
    dnaAttributes,
    extractFossilDna,
    upgradeDnaAttribute,
  } = useTownStore();

  const unlockedStuffyIds = useStoryStore((s) => s.unlockedStuffies);

  const availableStoryStuffies = useMemo(() => {
    const list = ALL_STUFFIES.filter((s) => (unlockedStuffyIds || []).includes(s.id));
    if (list.length > 0) return list;
    // Fallback if brand new or uninitialized story profile
    return ALL_STUFFIES.slice(0, 5); // Jefe, Alex, Finlee, Fifi, Bear
  }, [unlockedStuffyIds]);

  const connectedChargingPorts = useMemo(
    () => buildings.filter((b) => b.type === 'charging_port' && b.isConnectedToTownHall),
    [buildings]
  );
  const connectedBatteryBanks = useMemo(
    () => buildings.filter((b) => b.type === 'battery_bank' && b.isConnectedToTownHall),
    [buildings]
  );
  const maxRobotsSupported = (connectedChargingPorts.length + connectedBatteryBanks.length) * 5;
  const assignedRobotsCount = useMemo(
    () => buildings.filter((b) => b.assignedStuffyId?.startsWith('robot_')).length,
    [buildings]
  );

  const totalPotionsInPouch = useMemo(() => {
    return Object.values(potionsInventory || {}).reduce((a, b) => a + b, 0);
  }, [potionsInventory]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const hasInitiallyCenteredRef = useRef(false);

  const [viewportBounds, setViewportBounds] = useState({
    scrollLeft: 1800,
    scrollTop: 1800,
    width: 1000,
    height: 700,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);

  // Modals & Drawers
  const [isBuildDrawerOpen, setIsBuildDrawerOpen] = useState(false);
  const [buildDrawerTab, setBuildDrawerTab] = useState<'storage' | 'construct'>('storage');
  const [constructCategory, setConstructCategory] = useState<BuildingCategory | 'all'>('all');
  const [isMoraleModalOpen, setIsMoraleModalOpen] = useState(false);
  const [isTechTreeModalOpen, setIsTechTreeModalOpen] = useState(false);
  const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
  const [isArtisanModalOpen, setIsArtisanModalOpen] = useState(false);
  const [isPotionModalOpen, setIsPotionModalOpen] = useState(false);
  const [isDnaLabModalOpen, setIsDnaLabModalOpen] = useState(false);
  const [forgeTab, setForgeTab] = useState<'all' | 'modules' | 'robots' | 'tools'>('all');
  const [selectedTechNodeId, setSelectedTechNodeId] = useState<string>('core_hub');
  const [techTreeZoom, setTechTreeZoom] = useState(1);
  const [selectedTechBranch, setSelectedTechBranch] = useState<'all' | 'harvesters' | 'crafting' | 'infrastructure' | 'morale'>('all');
  const [socketPickerSlotIndex, setSocketPickerSlotIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    initializeTown();
  }, [initializeTown]);

  // Periodic 1-second game tick for harvester production cycles & research countdown
  useEffect(() => {
    const timer = setInterval(() => {
      const res = tickProduction(1);
      if (res.researchCompleted) {
        sound.playVictoryFanfare();
        showToast('🎉 Research completed! New technology unlocked in town.');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [tickProduction]);

  const updateViewportBounds = useCallback(() => {
    if (!viewportRef.current) return;
    setViewportBounds({
      scrollLeft: viewportRef.current.scrollLeft,
      scrollTop: viewportRef.current.scrollTop,
      width: viewportRef.current.clientWidth || 1000,
      height: viewportRef.current.clientHeight || 700,
    });
  }, []);

  // Initial Center ONCE on mount only
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    updateViewportBounds();
    vp.addEventListener('scroll', updateViewportBounds, { passive: true });
    window.addEventListener('resize', updateViewportBounds);

    if (!hasInitiallyCenteredRef.current) {
      hasInitiallyCenteredRef.current = true;
      const townHall = buildings.find((b) => b.type === 'town_hall');
      const targetX = townHall ? townHall.x * TILE_SIZE : 45 * TILE_SIZE;
      const targetY = townHall ? townHall.y * TILE_SIZE : 45 * TILE_SIZE;
      vp.scrollLeft = targetX - vp.clientWidth / 2;
      vp.scrollTop = targetY - vp.clientHeight / 2;
    }

    return () => {
      vp.removeEventListener('scroll', updateViewportBounds);
      window.removeEventListener('resize', updateViewportBounds);
    };
  }, [updateViewportBounds, buildings]);

  const visibleRange = useMemo(() => {
    const minCol = Math.max(0, Math.floor(viewportBounds.scrollLeft / TILE_SIZE) - 2);
    const maxCol = Math.min(GRID_SIZE, Math.ceil((viewportBounds.scrollLeft + viewportBounds.width) / TILE_SIZE) + 2);
    const minRow = Math.max(0, Math.floor(viewportBounds.scrollTop / TILE_SIZE) - 2);
    const maxRow = Math.min(GRID_SIZE, Math.ceil((viewportBounds.scrollTop + viewportBounds.height) / TILE_SIZE) + 2);
    return { minCol, maxCol, minRow, maxRow };
  }, [viewportBounds]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!viewportRef.current) return;
      const step = 80;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        viewportRef.current.scrollTop -= step;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        viewportRef.current.scrollTop += step;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        viewportRef.current.scrollLeft -= step;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        viewportRef.current.scrollLeft += step;
      } else if (e.key === 'r' || e.key === 'R') {
        togglePlacementRotation();
      }
    },
    [togglePlacementRotation]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && viewportRef.current) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      viewportRef.current.scrollLeft -= dx;
      viewportRef.current.scrollTop -= dy;
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Ghost Placement Preview
  const placementPreview = useMemo(() => {
    if (activeTool !== 'place' || !pendingPlacementType || !hoverTile) return null;
    const def = BUILDING_DEFINITIONS[pendingPlacementType];
    if (!def) return null;

    const width = placementRotation === 90 ? def.defaultHeight : def.defaultWidth;
    const height = placementRotation === 90 ? def.defaultWidth : def.defaultHeight;
    const { x, y } = hoverTile;

    let isValid = true;
    if (x < 0 || x + width > GRID_SIZE || y < 0 || y + height > GRID_SIZE) {
      isValid = false;
    } else {
      for (let cy = y; cy < y + height; cy++) {
        for (let cx = x; cx < x + width; cx++) {
          if (grid[cy][cx].buildingId !== null || grid[cy][cx].pathType !== 'none') {
            isValid = false;
            break;
          }
        }
        if (!isValid) break;
      }
    }

    return { x, y, width, height, isValid, def };
  }, [activeTool, pendingPlacementType, hoverTile, placementRotation, grid]);

  const handleTileClick = (x: number, y: number) => {
    if (activeTool === 'inspect') {
      selectTile(x, y);
    } else if (activeTool === 'road_dirt') {
      setPath(x, y, 'dirt');
    } else if (activeTool === 'road_paved') {
      setPath(x, y, 'paved');
    } else if (activeTool === 'bulldoze') {
      clearTileRoad(x, y);
    } else if (activeTool === 'place' && pendingPlacementType) {
      const success = placeBuilding(pendingPlacementType, x, y, placementRotation);
      if (success) {
        sound.playRewardSound();
        showToast(`✅ Placed ${BUILDING_DEFINITIONS[pendingPlacementType].name}!`);
      } else {
        showToast('❌ Cannot place here! Check space, path overlaps, or storage count.');
      }
    }
  };

  const selectedTileData = selectedTile ? grid[selectedTile.y]?.[selectedTile.x] : null;
  const activeBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const activeBuildingDef = activeBuilding ? BUILDING_DEFINITIONS[activeBuilding.type] : null;
  const morale = getMoraleInfo();

  const warningResources = Object.entries(resources).filter(([res, amt]) => {
    const cap = storageCaps[res as ResourceType] || 150;
    return amt >= cap * 0.85;
  });

  const activeResearchNode = TECH_TREE_NODES.find((n) => n.id === researchingNodeId);
  const selectedTechNode = TECH_TREE_NODES.find((n) => n.id === selectedTechNodeId) || TECH_TREE_NODES[0];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* TOP HEADER & RESOURCE STRIP */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-lg z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>⬅</span>
            <span>Exit Town</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏘️</span>
              <h1 className="text-base font-extrabold tracking-wide text-amber-300">TOWNTIME BUILDER</h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                100×100 WORLD
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Tech Tier: <strong className="text-amber-400">Tier {unlockedResearchTier}/5</strong> • Stuffies Rescued:{' '}
              <strong className="text-pink-300">{availableStoryStuffies.length}</strong>
            </div>
          </div>
        </div>

        {/* ACTIVE RESEARCH COUNTDOWN BAR */}
        {researchingNodeId && activeResearchNode && (
          <div className="flex items-center gap-2 bg-indigo-950/90 border border-indigo-400 px-3 py-1 rounded-xl shadow-lg animate-pulse">
            <span className="text-base">{activeResearchNode.icon}</span>
            <div className="text-left">
              <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                🔬 Researching: {activeResearchNode.title}
              </div>
              <div className="text-xs font-mono font-black text-amber-300">
                ⏱️ {Math.floor(researchTimeRemaining / 60)}m {researchTimeRemaining % 60}s remaining
              </div>
            </div>
            <button
              onClick={() => {
                const res = applyTimeWarp(60);
                showToast(res.message);
              }}
              className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 border border-amber-300 rounded text-[10px] font-bold text-white shadow"
              title="Fast-forward 60s using /.warp"
            >
              ⚡ Warp -60s
            </button>
          </div>
        )}

        {/* CRAFTING, MORALE, TECH TREE & POTIONS BUTTONS */}
        <div className="flex items-center gap-2">
          {/* THE FORGE BUTTON */}
          <button
            onClick={() => setIsForgeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-orange-950/80 hover:bg-orange-900 border border-orange-500 rounded-lg text-xs font-bold text-orange-300 transition-all hover:scale-105 shadow"
            title="Open the Forge to craft socketable upgrade modules, automaton robots, and heavy tools"
          >
            <span>⚒️</span>
            <span>Forge ({forgeModulesInventory.length} Modules)</span>
          </button>

          {/* ARTISAN WORKSHOP BUTTON */}
          <button
            onClick={() => setIsArtisanModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500 rounded-lg text-xs font-bold text-amber-300 transition-all hover:scale-105 shadow"
            title="Open the Artisan's Workshop to craft metal, steel, electronics, and architectural goods"
          >
            <span>🎨</span>
            <span>Artisan Workshop</span>
          </button>

          {/* POTION BREWERY BUTTON */}
          <button
            onClick={() => setIsPotionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500 rounded-lg text-xs font-bold text-purple-300 transition-all hover:scale-105 shadow"
            title="Open the Potion Brewery & Apothecary to brew and drink magical elixirs"
          >
            <span>⚗️</span>
            <span>Potions ({totalPotionsInPouch})</span>
          </button>

          {/* DINO DNA ATTRIBUTE LAB BUTTON */}
          <button
            onClick={() => setIsDnaLabModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500 rounded-lg text-xs font-bold text-emerald-300 transition-all hover:scale-105 shadow"
            title="Extract prehistoric fossils into DNA Helix points to upgrade attributes for ALL stuffies"
          >
            <span>🧬</span>
            <span>DNA Lab ({dnaPoints || 0} Pts)</span>
            {(resources.fossils || 0) > 0 && (
              <span className="bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
                🦴 {resources.fossils}
              </span>
            )}
          </button>

          {/* MORALE BUTTON */}
          <button
            onClick={() => setIsMoraleModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-pink-950/80 hover:bg-pink-900 border border-pink-500 rounded-lg text-xs font-bold text-pink-300 transition-all hover:scale-105"
            title="Click to view Morale breakdown and combat buffs"
          >
            <span>💖</span>
            <span>
              Morale: {morale.score} ({morale.tierName})
            </span>
            <span className="bg-pink-500/20 px-1 rounded text-[10px]">+{morale.statBonusPercent}% Stats</span>
          </button>

          {/* VISUAL DOT-AND-LINE TECH TREE BUTTON */}
          <button
            onClick={() => setIsTechTreeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500 rounded-lg text-xs font-bold text-indigo-300 transition-all hover:scale-105"
            title="Open the Branching Visual Tech Tree"
          >
            <span>🌳</span>
            <span>Tech Tree ({unlockedTechNodes.length} Unlocked)</span>
          </button>

          {/* ROBOT CHARGING & WORKER STATUS */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/90 border border-cyan-500/50 rounded-lg text-xs font-bold text-cyan-300 shadow"
            title={`Automaton Robots work at 75% efficiency. Each 2x2 Charging Port powers up to 5 robots. (${maxRobotsSupported} powered capacity, ${assignedRobotsCount} assigned)`}
          >
            <span>🔋</span>
            <span>
              Robots: {assignedRobotsCount}/{maxRobotsSupported} Active
            </span>
            <span className="text-[10px] text-slate-400">({robotCount} Total)</span>
          </div>

          {/* WARP TOWN BUTTON (v4.4 Staging - In v4.5 this button will be removed in favor of typing /.warp) */}
          <button
            onClick={() => {
              const res = applyTimeWarp(60);
              showToast(res.message);
              sound.playClickSound();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-600/90 hover:bg-amber-500 border border-amber-400 rounded-lg text-xs font-bold text-white transition-all hover:scale-105 shadow"
            title="Accelerate all harvesters, crafters, and research by 60s. Note: In version 4.5 this button will be removed and players must type /.warp"
          >
            <span>⚡</span>
            <span>Warp Town (+60s)</span>
            <span className="text-[9px] bg-amber-900/70 px-1 rounded font-normal text-amber-200">v4.4 dev</span>
          </button>
        </div>

        {/* RESOURCE STRIP WITH STRICT CLAMPING DISPLAY */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {ALL_RESOURCES.slice(0, 12).map((res) => {
            const amt = resources[res.id] || 0;
            const cap = storageCaps[res.id] || 100;
            const isFull = amt >= cap;
            const isNearFull = amt >= cap * 0.85;

            return (
              <div
                key={res.id}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-semibold shrink-0 transition-colors ${
                  isFull
                    ? 'bg-rose-950/90 border-rose-500 text-rose-300 font-bold'
                    : isNearFull
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                    : 'bg-slate-800/90 border-slate-700 text-slate-200'
                }`}
                title={`${res.name}: ${amt} / ${cap} (Max Cap)`}
              >
                <span>{res.icon}</span>
                <span className="font-mono text-[11px]">
                  {amt}/{cap}
                  {isFull && ' (MAX)'}
                </span>
              </div>
            );
          })}
        </div>
      </header>

      {/* STORAGE WARNING BANNER */}
      {warningResources.length > 0 && (
        <div className="bg-amber-900/90 border-b border-amber-600 px-4 py-1 text-xs text-amber-200 flex items-center justify-between">
          <span>
            ⚠️ <strong>Storage Warning:</strong>{' '}
            {warningResources.map(([r, a]) => `${r} (${a}/${storageCaps[r as ResourceType]})`).join(', ')}{' '}
            at 85%+ cap! Extra resources over cap are strictly clamped. Connect more Barrels with roads to expand storage.
          </span>
        </div>
      )}

      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border-2 border-amber-400 text-amber-200 px-5 py-2 rounded-full text-xs font-extrabold shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <div className="relative flex-1 overflow-hidden bg-slate-950">
        <div
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full overflow-auto cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* 100x100 MAP CONTAINER */}
          <div
            className="relative bg-emerald-950/95 shadow-2xl border-8 border-slate-800 rounded-2xl overflow-hidden"
            style={{
              width: GRID_SIZE * TILE_SIZE,
              height: GRID_SIZE * TILE_SIZE,
            }}
          >
            {/* VIRTUALIZED TILES */}
            {grid.slice(visibleRange.minRow, visibleRange.maxRow).map((row, rowIdx) => {
              const y = visibleRange.minRow + rowIdx;
              return row.slice(visibleRange.minCol, visibleRange.maxCol).map((tile, colIdx) => {
                const x = visibleRange.minCol + colIdx;
                const isSelected = selectedTile?.x === x && selectedTile?.y === y;
                const isHovered = hoverTile?.x === x && hoverTile?.y === y;

                let terrainBg = 'bg-emerald-900/80';
                if (tile.terrain === 'water') terrainBg = 'bg-cyan-800/90';
                else if (tile.terrain === 'forest') terrainBg = 'bg-emerald-950/90';
                else if (tile.terrain === 'mountain') terrainBg = 'bg-slate-700/90';
                else if (tile.terrain === 'sand') terrainBg = 'bg-amber-800/80';
                else if (tile.terrain === 'volcanic') terrainBg = 'bg-rose-950/90';
                else if (tile.terrain === 'clay_shore') terrainBg = 'bg-amber-900/80';

                return (
                  <div
                    key={`${x}-${y}`}
                    onClick={() => handleTileClick(x, y)}
                    onMouseEnter={() => setHoverTile({ x, y })}
                    onMouseLeave={() => setHoverTile(null)}
                    style={{
                      left: x * TILE_SIZE,
                      top: y * TILE_SIZE,
                      width: TILE_SIZE,
                      height: TILE_SIZE,
                    }}
                    className={`absolute border border-black/10 flex items-center justify-center text-[10px] transition-colors cursor-pointer ${terrainBg} ${
                      isSelected ? 'ring-2 ring-amber-400 z-10' : ''
                    } ${isHovered ? 'brightness-125' : ''}`}
                  >
                    {tile.pathType === 'dirt' && (
                      <div className="absolute inset-1 bg-amber-700/90 rounded-sm border border-amber-900 shadow-inner flex items-center justify-center text-[8px] text-amber-200">
                        🟫
                      </div>
                    )}
                    {tile.pathType === 'paved' && (
                      <div className="absolute inset-0.5 bg-slate-300 rounded-sm border border-slate-500 shadow-md flex items-center justify-center text-[8px] text-slate-800 font-bold">
                        🏛️
                      </div>
                    )}

                    {tile.buildingId === null && tile.pathType === 'none' && tile.resources.length > 0 && (
                      <span className="opacity-80 drop-shadow scale-90">
                        {tile.resources[0] === 'wood' && '🌲'}
                        {tile.resources[0] === 'water' && '💧'}
                        {tile.resources[0] === 'stone' && '🪨'}
                        {tile.resources[0] === 'sand' && '🏖️'}
                        {tile.resources[0] === 'lava' && '🌋'}
                        {tile.resources[0] === 'clay' && '🏺'}
                        {tile.resources[0] === 'granite' && '🧱'}
                      </span>
                    )}
                  </div>
                );
              });
            })}

            {/* PLACED BUILDINGS */}
            {buildings.map((b) => {
              const def = BUILDING_DEFINITIONS[b.type];
              const isSelected = selectedBuildingId === b.id;
              const isHarvester = def?.category === 'harvester';
              const cap = b.assignedResource ? storageCaps[b.assignedResource] || 100 : 100;
              const isResourceFull = b.assignedResource ? (resources[b.assignedResource] || 0) >= cap : false;
              const socketedCount = (b.upgradeSlots || []).filter(Boolean).length;
              const assignedWorker = availableStoryStuffies.find((s) => s.id === b.assignedStuffyId);

              return (
                <div
                  key={b.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBuildingId(b.id);
                    selectTile(b.x, b.y);
                  }}
                  style={{
                    left: b.x * TILE_SIZE,
                    top: b.y * TILE_SIZE,
                    width: b.width * TILE_SIZE,
                    height: b.height * TILE_SIZE,
                  }}
                  className={`absolute z-10 p-1 flex flex-col items-center justify-between rounded-lg border-2 shadow-2xl transition-all cursor-pointer ${
                    b.type === 'town_hall'
                      ? 'bg-amber-900/90 border-amber-400'
                      : b.type === 'forge'
                      ? 'bg-orange-950/90 border-orange-400'
                      : b.type === 'academy'
                      ? 'bg-indigo-950/90 border-indigo-400'
                      : isHarvester
                      ? 'bg-blue-950/90 border-blue-400'
                      : def?.category === 'residential'
                      ? 'bg-emerald-950/90 border-emerald-400'
                      : 'bg-slate-900/90 border-purple-400'
                  } ${isSelected ? 'ring-4 ring-white scale-105 z-20' : ''}`}
                >
                  <div className="w-full flex items-center justify-between text-[10px]">
                    <span className="bg-black/60 px-1 rounded text-amber-300 font-bold">
                      Lv.{b.level}
                    </span>
                    {socketedCount > 0 && (
                      <span className="bg-indigo-900/90 border border-indigo-400 text-indigo-200 px-1 rounded text-[8px] font-bold">
                        ⚡{socketedCount}/{b.maxUpgradeSlots}
                      </span>
                    )}
                    {!b.isConnectedToTownHall && b.type !== 'town_hall' && (
                      <span className="bg-rose-900/90 border border-rose-500 text-rose-200 px-1 rounded text-[8px] font-bold animate-pulse" title="Disconnected from Town Hall road!">
                        ⚠️ Road
                      </span>
                    )}
                    {isHarvester && !b.assignedStuffyId && (
                      <span className="bg-amber-900/90 border border-amber-400 text-amber-200 px-1 rounded text-[8px] font-bold animate-pulse" title="Production halted! Needs worker stuffy.">
                        ⚠️ Worker
                      </span>
                    )}
                    {isHarvester && isResourceFull && (
                      <span className="bg-rose-900/90 border border-rose-500 text-rose-200 px-1 rounded text-[8px] font-bold animate-pulse" title="Storage is full! Harvester paused.">
                        ⚠️ Full
                      </span>
                    )}
                  </div>

                  <div className="text-xl drop-shadow">{def?.icon || '🏛️'}</div>

                  <div className="text-[10px] font-extrabold truncate w-full text-center text-slate-100">
                    {def?.name.split(' ')[0]}
                  </div>

                  {/* WORKER BADGE */}
                  {assignedWorker && (
                    <div className="flex items-center gap-0.5 bg-indigo-950/90 border border-indigo-400 px-1.5 py-0.2 rounded-full text-[8px] text-indigo-200 font-bold shadow">
                      <span>🧸</span>
                      <span>{assignedWorker.name}</span>
                    </div>
                  )}

                  {/* HARVESTER 15s LIVE CYCLE PROGRESS BAR */}
                  {isHarvester && (
                    <div className="w-full bg-slate-900/90 rounded h-1.5 overflow-hidden border border-slate-700 mt-0.5">
                      <div
                        className="bg-amber-400 h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (((b.cycleProgress || 0) / (b.cycleDuration || 15)) * 100))}%`,
                        }}
                      />
                    </div>
                  )}

                  {b.assignedResource && (
                    <div className="text-[8px] text-amber-300 bg-black/50 px-1 rounded uppercase tracking-wider">
                      {b.assignedResource}
                    </div>
                  )}
                </div>
              );
            })}

            {/* PHYSICAL STUFFIES & AUTOMATON ROBOTS MOVING AROUND MAP */}
            {Object.values(stuffySimStates).map((stuffy) => {
              const isRobot = stuffy.isRobot;
              const isWorking = stuffy.activity === 'working';
              const isResting = stuffy.activity === 'resting_at_house';
              const isWalkingToWork = stuffy.activity === 'walking_to_work';
              const isWalkingHome = stuffy.activity === 'walking_to_house';

              let activityBadge = '🧸 Strolling';
              let badgeColor = 'bg-slate-800 text-slate-200 border-slate-600';
              if (isRobot) {
                activityBadge = isWorking ? '🤖 75% Eff' : '🤖 Idle';
                badgeColor = 'bg-cyan-950 text-cyan-300 border-cyan-500';
              } else if (isWorking) {
                activityBadge = '🪓 Working';
                badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-500';
              } else if (isResting) {
                activityBadge = `😴 Resting 💖 (${stuffy.restTimer}s)`;
                badgeColor = 'bg-pink-950 text-pink-300 border-pink-500 animate-pulse';
              } else if (isWalkingToWork) {
                activityBadge = '🚶 To Job';
                badgeColor = 'bg-amber-950 text-amber-300 border-amber-500';
              } else if (isWalkingHome) {
                activityBadge = '🏡 To House';
                badgeColor = 'bg-purple-950 text-purple-300 border-purple-500';
              }

              return (
                <div
                  key={stuffy.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playClickSound();
                    if (isRobot) {
                      showToast(`🤖 ${stuffy.name}: Working at 75% efficiency. Powered by town charging ports.`);
                    } else if (isResting) {
                      showToast(`😴 "${stuffy.name}" is resting at a house to boost morale! (+Morale applied, ${stuffy.restTimer}s remaining).`);
                    } else if (isWalkingToWork) {
                      showToast(`🚶 "${stuffy.name}" is walking to their assigned building. (Plushies only work when physically inside!).`);
                    } else if (isWalkingHome) {
                      showToast(`🏡 "${stuffy.name}" is heading home for a well-deserved morale rest break.`);
                    } else if (isWorking) {
                      showToast(`🪓 "${stuffy.name}" is hard at work inside their assigned building at 100% capacity!`);
                    } else {
                      showToast(`🧸 "${stuffy.name} the ${stuffy.species}" is exploring town.`);
                    }
                  }}
                  style={{
                    left: stuffy.x * TILE_SIZE + 4,
                    top: stuffy.y * TILE_SIZE + 4,
                    transform: stuffy.facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
                  }}
                  className="absolute z-20 pointer-events-auto cursor-pointer transition-all duration-1000 ease-in-out flex flex-col items-center hover:scale-125"
                  title={`${stuffy.name} (${stuffy.species}) - ${stuffy.activity}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shadow-xl border-2 ${
                      isRobot ? 'border-cyan-400' : 'border-white'
                    } ${isWorking ? 'animate-pulse' : isResting ? 'animate-bounce' : ''}`}
                    style={{ backgroundColor: isRobot ? '#334155' : stuffy.color }}
                  >
                    {stuffy.icon}
                  </div>
                  <div
                    style={{ transform: stuffy.facing === 'left' ? 'scaleX(-1)' : 'none' }}
                    className="flex flex-col items-center -mt-1"
                  >
                    <span className="text-[8px] font-black bg-black/85 text-white px-1 rounded shadow">
                      {stuffy.name}
                    </span>
                    <span
                      className={`text-[7px] font-bold px-1 rounded border shadow-sm ${badgeColor}`}
                    >
                      {activityBadge}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* PLACEMENT PREVIEW GHOST */}
            {placementPreview && (
              <div
                style={{
                  left: placementPreview.x * TILE_SIZE,
                  top: placementPreview.y * TILE_SIZE,
                  width: placementPreview.width * TILE_SIZE,
                  height: placementPreview.height * TILE_SIZE,
                }}
                className={`absolute z-30 pointer-events-none rounded-lg border-2 flex flex-col items-center justify-center shadow-2xl transition-all ${
                  placementPreview.isValid
                    ? 'bg-emerald-500/40 border-emerald-400 ring-2 ring-emerald-300 text-emerald-100'
                    : 'bg-rose-500/40 border-rose-400 ring-2 ring-rose-500 text-rose-100'
                }`}
              >
                <span className="text-2xl drop-shadow">{placementPreview.def.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-black/70 px-1.5 py-0.5 rounded mt-1">
                  {placementPreview.isValid ? '✓ Click to Build' : '✕ Blocked Space'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SIDE INSPECTION PANEL */}
        {selectedTile && (
          <aside className="absolute top-4 right-4 z-30 w-80 bg-slate-900/98 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>📍 Tile ({selectedTile.x}, {selectedTile.y})</span>
              </div>
              <button
                onClick={() => selectTile(-1, -1)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            {selectedTileData && (
              <div className="text-xs space-y-1 text-slate-300">
                <div>
                  Terrain: <strong className="capitalize text-slate-100">{selectedTileData.terrain}</strong>
                </div>
                <div>
                  Path: <strong className="capitalize text-slate-100">{selectedTileData.pathType}</strong>
                </div>
                {selectedTileData.resources.length > 0 && (
                  <div>
                    Deposit:{' '}
                    <strong className="capitalize text-emerald-300">
                      {selectedTileData.resources.join(', ')}
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* PLACED BUILDING INSPECTOR */}
            {activeBuilding && activeBuildingDef && (
              <div className="border-t border-slate-700 pt-2 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activeBuildingDef.icon}</span>
                  <div>
                    <div className="font-extrabold text-white text-sm">{activeBuildingDef.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Category: {activeBuildingDef.category.toUpperCase()} • Level {activeBuilding.level}/5
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300">{activeBuildingDef.description}</div>

                <div
                  className={`p-2 rounded-lg text-xs font-semibold ${
                    activeBuilding.isConnectedToTownHall
                      ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
                      : 'bg-rose-950/80 border border-rose-600 text-rose-300'
                  }`}
                >
                  {activeBuilding.isConnectedToTownHall ? (
                    <div>✅ Connected to Town Hall via road</div>
                  ) : (
                    <div>❌ Disconnected! Build a road path connecting orthogonally to Town Hall.</div>
                  )}
                </div>

                {/* DEDICATED CRAFTING / FORGE / POTION SHORTCUT BUTTONS */}
                {activeBuilding.type === 'forge' && (
                  <button
                    onClick={() => {
                      setIsForgeModalOpen(true);
                      sound.playClickSound();
                    }}
                    className="w-full py-2 px-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-black border border-orange-400 shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] animate-pulse"
                  >
                    <span className="text-base">⚒️</span>
                    <span>OPEN THE FORGE CRAFTING SCREEN</span>
                  </button>
                )}

                {(activeBuilding.type === 'artisan' || activeBuilding.type === 'foundry' || activeBuilding.type === 'glassworks') && (
                  <button
                    onClick={() => {
                      setIsArtisanModalOpen(true);
                      sound.playClickSound();
                    }}
                    className="w-full py-2 px-3 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 text-white rounded-xl text-xs font-black border border-amber-400 shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] animate-pulse"
                  >
                    <span className="text-base">🎨</span>
                    <span>OPEN ARTISAN CRAFTING SCREEN</span>
                  </button>
                )}

                {(activeBuilding.type === 'apothecary' || activeBuilding.type === 'alchemy') && (
                  <button
                    onClick={() => {
                      setIsPotionModalOpen(true);
                      sound.playClickSound();
                    }}
                    className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-black border border-purple-400 shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] animate-pulse"
                  >
                    <span className="text-base">⚗️</span>
                    <span>OPEN POTION BREWERY SCREEN</span>
                  </button>
                )}

                {(activeBuilding.type === 'fossil_digsite' || activeBuilding.type === 'academy') && (
                  <button
                    onClick={() => {
                      setIsDnaLabModalOpen(true);
                      sound.playClickSound();
                    }}
                    className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black border border-emerald-400 shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] animate-pulse"
                  >
                    <span className="text-base">🧬</span>
                    <span>OPEN DINO DNA LAB (UPGRADE ALL STUFFIES)</span>
                  </button>
                )}

                {/* WORKER ASSIGNMENT (ROBOTS & PLUSHIES) */}
                <div className="p-2.5 bg-slate-800/90 rounded-lg border border-indigo-400/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                    <span>👥 ASSIGNED WORKER</span>
                    {activeBuilding.assignedStuffyId ? (
                      <button
                        onClick={() => {
                          const res = assignStuffyToBuilding(activeBuilding.id, null);
                          showToast(res.message);
                        }}
                        className="text-[10px] text-rose-300 hover:underline font-bold"
                      >
                        Unassign
                      </button>
                    ) : null}
                  </div>

                  {/* ACTIVE WORKER STATUS & PHYSICAL PRESENCE */}
                  {activeBuilding.assignedStuffyId ? (
                    (() => {
                      const workerId = activeBuilding.assignedStuffyId;
                      const sim = stuffySimStates[workerId];
                      const isRobot = workerId.startsWith('robot_') || sim?.isRobot;

                      if (isRobot) {
                        const activeRobotsList = buildings
                          .filter((b) => b.assignedStuffyId?.startsWith('robot_'))
                          .map((b) => b.assignedStuffyId!);
                        const robotIdx = activeRobotsList.indexOf(workerId);
                        const isPowered = robotIdx >= 0 && robotIdx < maxRobotsSupported;

                        return (
                          <div className="flex items-center gap-2 p-2 bg-cyan-950/80 rounded-lg border border-cyan-500/50">
                            <div className="text-xl">🤖</div>
                            <div className="flex-1">
                              <div className="text-xs font-extrabold text-cyan-200">
                                {sim?.name || workerId}
                              </div>
                              <div className="text-[10px] text-cyan-300">
                                Automaton Unit • <strong>75% Efficiency</strong>
                              </div>
                              <div className={`text-[10px] font-bold ${isPowered ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isPowered
                                  ? '✅ Powered by 2×2 Charging Port'
                                  : '⚠️ Unpowered! Connect more 2×2 Charging Ports'}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Story Mode Plushie
                      const isInside = sim?.activity === 'working';
                      const isWalking = sim?.activity === 'walking_to_work';
                      const isResting = sim?.activity === 'resting_at_house';
                      const isWalkingHome = sim?.activity === 'walking_to_house';

                      return (
                        <div className="flex items-center gap-2 p-2 bg-indigo-950/80 rounded-lg border border-indigo-500/50">
                          <div className="text-xl">{sim?.icon || '🧸'}</div>
                          <div className="flex-1">
                            <div className="text-xs font-extrabold text-white">
                              {sim?.name ||
                                availableStoryStuffies.find((s) => s.id === workerId)?.name ||
                                workerId}
                            </div>
                            <div className="text-[10px]">
                              {isInside ? (
                                <span className="text-emerald-300 font-bold">
                                  ✅ Inside Building (Working at 100% Speed)
                                </span>
                              ) : isWalking ? (
                                <span className="text-amber-300 font-bold">
                                  🚶 Walking to Work (Production paused until inside)
                                </span>
                              ) : isResting ? (
                                <span className="text-pink-300 font-bold">
                                  😴 Resting at House (+💖 Morale Boost! {sim?.restTimer}s remaining)
                                </span>
                              ) : isWalkingHome ? (
                                <span className="text-purple-300 font-bold">
                                  🏡 Heading home for a morale rest break
                                </span>
                              ) : (
                                <span className="text-slate-300">🧸 Wandering in town</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-2 bg-rose-950/70 border border-rose-500/60 rounded-lg text-[10px] text-rose-200">
                      ⚠️ <strong>No Worker Assigned!</strong> Production is halted. Assign a Robot (75% eff) or Story Plushie (100% eff) to start work.
                    </div>
                  )}

                  {/* SECTION 1: AUTOMATON ROBOTS (5 STARTING) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-cyan-300">
                      <span>🤖 Automaton Robots (75% Eff):</span>
                      <span className="text-slate-400">
                        {assignedRobotsCount}/{maxRobotsSupported} Powered
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto pr-1">
                      {Array.from({ length: robotCount }).map((_, rIdx) => {
                        const rid = `robot_${rIdx + 1}`;
                        const isThisOne = activeBuilding.assignedStuffyId === rid;
                        const assignedElsewhere = buildings.find(
                          (b) => b.id !== activeBuilding.id && b.assignedStuffyId === rid
                        );

                        return (
                          <button
                            key={rid}
                            onClick={() => {
                              const res = assignStuffyToBuilding(activeBuilding.id, rid);
                              showToast(res.message);
                              sound.playClickSound();
                            }}
                            className={`p-1 rounded text-left border flex items-center justify-between gap-1 text-[10px] ${
                              isThisOne
                                ? 'bg-cyan-600 border-cyan-300 text-white font-bold'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate">Unit #{rIdx + 1}</span>
                            {isThisOne ? (
                              <span>✓</span>
                            ) : assignedElsewhere ? (
                              <span className="text-[8px] text-slate-500">Busy</span>
                            ) : (
                              <span className="text-[8px] text-cyan-400">75%</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION 2: STORY MODE PLUSHIES (100% EFF) */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400">
                      🧸 Story Mode Plushies (100% Eff, Morale Breaks):
                    </div>
                    <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto pr-1">
                      {availableStoryStuffies.map((stuffy) => {
                        const isThisOne = activeBuilding.assignedStuffyId === stuffy.id;
                        const assignedElsewhere = buildings.find(
                          (b) => b.id !== activeBuilding.id && b.assignedStuffyId === stuffy.id
                        );

                        return (
                          <button
                            key={stuffy.id}
                            onClick={() => {
                              const res = assignStuffyToBuilding(activeBuilding.id, stuffy.id);
                              showToast(res.message);
                              sound.playClickSound();
                            }}
                            className={`p-1 rounded text-left border flex items-center justify-between gap-1 text-[10px] ${
                              isThisOne
                                ? 'bg-indigo-600 border-indigo-300 text-white font-bold'
                                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span className="truncate">{stuffy.name}</span>
                            {isThisOne ? (
                              <span>✓</span>
                            ) : assignedElsewhere ? (
                              <span className="text-[8px] text-slate-500">Busy</span>
                            ) : (
                              <span className="text-[8px] text-emerald-400">Free</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* CONTAINER RESOURCE PICKER (BARREL, SILO, VAULT BOX, CRYO-VAULT) */}
                {(activeBuilding.type === 'barrel' || activeBuilding.type === 'silo' || activeBuilding.type === 'vault_box' || activeBuilding.type === 'cryo_vault') && (
                  <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-300">
                        {activeBuilding.type === 'cryo_vault' ? '🧊 Cryo-Vault' : activeBuilding.type === 'vault_box' ? '🔒 Safe Vault' : activeBuilding.type === 'silo' ? '🌾 Silo' : '🛢️ Barrel'} Assigned Material:
                      </span>
                      <span className="uppercase font-mono font-bold text-emerald-400">
                        {activeBuilding.assignedResource || 'None'}
                      </span>
                    </div>
                    {activeBuilding.isConnectedToTownHall ? (
                      <div className="text-[10px] text-emerald-300 font-semibold bg-emerald-950/60 p-1.5 rounded border border-emerald-600/50">
                        ✅ Road Connected: Providing +{(activeBuilding.type === 'cryo_vault' ? 300 : activeBuilding.type === 'silo' || activeBuilding.type === 'vault_box' ? 200 : 150) * activeBuilding.level} {activeBuilding.assignedResource?.toUpperCase()} storage capacity.
                      </div>
                    ) : (
                      <div className="text-[10px] text-rose-300 font-semibold bg-rose-950/60 p-1.5 rounded border border-rose-600/50">
                        ⚠️ Road Disconnected: Containers only work when connected to Town Hall via road!
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-1 pt-1">
                      {ALL_RESOURCES.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setBarrelResource(activeBuilding.id, r.id)}
                          className={`px-1.5 py-1 rounded text-[10px] font-bold border capitalize flex items-center justify-center gap-1 ${
                            activeBuilding.assignedResource === r.id
                              ? 'bg-amber-600 border-amber-400 text-white'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span>{r.icon}</span>
                          <span>{r.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* HARVESTER 15s LIVE CYCLE DETAILS */}
                {activeBuildingDef.harvestOptions && (
                  <div className="p-2.5 bg-slate-800/90 rounded-lg border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                      <span>⏳ HARVESTER CYCLE (15s Base)</span>
                      <span className="font-mono text-emerald-300">
                        {Math.floor(activeBuilding.cycleProgress || 0)}s / {activeBuilding.cycleDuration || 15}s
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                      <div
                        className="bg-amber-400 h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (((activeBuilding.cycleProgress || 0) / (activeBuilding.cycleDuration || 15)) * 100)
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Pacing: 2 {activeBuilding.assignedResource || 'wood'} every 15 seconds (accelerated by Forge upgrade modules).
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Harvest Focus:</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {activeBuildingDef.harvestOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setHarvesterResource(activeBuilding.id, opt)}
                            className={`px-2 py-1 rounded text-xs font-bold border capitalize ${
                              activeBuilding.assignedResource === opt
                                ? 'bg-amber-600 border-amber-400 text-white'
                                : 'bg-slate-900 border-slate-700 text-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* FAST-FORWARD HARVESTER (v4.4 dev button - in v4.5 players type /.warp) */}
                    <button
                      onClick={() => {
                        const res = applyTimeWarp(15);
                        showToast(res.message);
                        sound.playClickSound();
                      }}
                      className="w-full mt-2 py-1 px-2 bg-amber-600/90 hover:bg-amber-500 text-white rounded text-[10px] font-bold border border-amber-400 flex items-center justify-center gap-1 shadow"
                      title="Fast-forward 15s using /.warp (In v4.5 this button will be removed in favor of typing the command)"
                    >
                      <span>⚡</span>
                      <span>Warp Harvester (+15s)</span>
                      <span className="text-[8px] bg-amber-900/60 px-1 rounded text-amber-200">v4.4 dev</span>
                    </button>
                  </div>
                )}

                {/* ARTISAN WORKSHOP CRAFTING (METAL, STEEL, ELECTRONICS) */}
                {activeBuilding.type === 'artisan' && (
                  <div className="p-2.5 bg-slate-800/90 rounded-lg border border-amber-500/50 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                      <span>⚒️ ARTISAN'S WORKSHOP CRAFTING</span>
                      <span className="text-[10px] text-slate-400">Advanced Materials</span>
                    </div>

                    {/* LIVE AUTO-CRAFT PROGRESS BAR */}
                    {activeBuilding.assignedRecipeId && (
                      <div className="p-2 bg-slate-900 rounded border border-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-amber-200">
                            Auto-Crafting: {ARTISAN_RECIPES.find((r) => r.id === activeBuilding.assignedRecipeId)?.name}
                          </span>
                          <span className="font-mono text-emerald-400">
                            {Math.floor(activeBuilding.cycleProgress || 0)}s / {activeBuilding.cycleDuration || 15}s
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-700">
                          <div
                            className="bg-amber-400 h-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                (((activeBuilding.cycleProgress || 0) / (activeBuilding.cycleDuration || 15)) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* FAST-FORWARD CRAFTER (v4.4 dev button - in v4.5 players type /.warp) */}
                    <button
                      onClick={() => {
                        const res = applyTimeWarp(15);
                        showToast(res.message);
                        sound.playClickSound();
                      }}
                      className="w-full py-1 px-2 bg-amber-600/90 hover:bg-amber-500 text-white rounded text-[10px] font-bold border border-amber-400 flex items-center justify-center gap-1 shadow"
                      title="Fast-forward crafter cycle by 15s (In v4.5 this button will be removed in favor of typing the command)"
                    >
                      <span>⚡</span>
                      <span>Warp Crafter (+15s)</span>
                      <span className="text-[8px] bg-amber-900/60 px-1 rounded text-amber-200">v4.4 dev</span>
                    </button>

                    <div className="space-y-1.5 pt-1">
                      {ARTISAN_RECIPES.map((recipe) => {
                        const canAfford = Object.entries(recipe.cost).every(
                          ([res, cost]) => (resources[res as ResourceType] || 0) >= (cost || 0)
                        );
                        const isFocus = activeBuilding.assignedRecipeId === recipe.id;

                        return (
                          <div
                            key={recipe.id}
                            className={`p-2 rounded-lg border text-[11px] space-y-1.5 ${
                              isFocus
                                ? 'bg-amber-950/60 border-amber-500'
                                : 'bg-slate-900/90 border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1 text-slate-100">
                                <span>{recipe.icon}</span>
                                <span>{recipe.name}</span>
                              </span>
                              <span className="text-emerald-300 text-[10px]">
                                +{recipe.outputAmount} {recipe.outputResource.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Cost:{' '}
                              {Object.entries(recipe.cost)
                                .map(([r, c]) => `${c} ${r}`)
                                .join(', ')}{' '}
                              • Duration: {recipe.duration}s
                            </div>
                            <div className="flex items-center gap-1.5 pt-0.5">
                              <button
                                onClick={() => {
                                  const res = craftArtisanRecipe(recipe.id, activeBuilding.id);
                                  showToast(res.message);
                                  sound.playClickSound();
                                }}
                                disabled={!canAfford}
                                className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors ${
                                  canAfford
                                    ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow'
                                    : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                Craft Batch
                              </button>
                              <button
                                onClick={() => {
                                  setArtisanRecipe(activeBuilding.id, recipe.id);
                                  showToast(`Auto-craft focus set to ${recipe.name}!`);
                                  sound.playClickSound();
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                                  isFocus
                                    ? 'bg-amber-500 border-amber-300 text-black'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
                                }`}
                              >
                                {isFocus ? '✓ Active Focus' : 'Set Focus'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CHARGING PORT DETAILS */}
                {activeBuilding.type === 'charging_port' && (
                  <div className="p-2.5 bg-slate-800/90 rounded-lg border border-cyan-500/50 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                      <span>🔋 CHARGING PORT (2×2)</span>
                      <span className="text-emerald-400 font-mono">Powers 5 Robots</span>
                    </div>
                    <div className="text-[10px] text-slate-300">
                      Powers up to 5 Automaton Robots (at 75% efficiency). Robots require powered charging ports connected to town roads.
                    </div>
                    <div
                      className={`text-[10px] p-1.5 rounded font-semibold ${
                        activeBuilding.isConnectedToTownHall
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/50'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-600/50'
                      }`}
                    >
                      {activeBuilding.isConnectedToTownHall
                        ? `✅ Operational: Supporting 5 robots (${maxRobotsSupported} town-wide capacity, ${assignedRobotsCount} assigned)`
                        : '❌ Disconnected: Connect to Town Hall via road to supply power!'}
                    </div>
                  </div>
                )}

                {/* UPGRADE MODULE SOCKETS */}
                <div className="p-2.5 bg-slate-800/90 rounded-lg border border-indigo-500/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold text-indigo-300">
                    <span>⚡ UPGRADE SLOTS ({activeBuilding.maxUpgradeSlots} Max)</span>
                    <button
                      onClick={() => setIsTechTreeModalOpen(true)}
                      className="text-[10px] text-amber-400 underline hover:text-amber-300"
                    >
                      +Slots in Tech Tree
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {Array.from({ length: activeBuilding.maxUpgradeSlots }).map((_, slotIdx) => {
                      const mod = activeBuilding.upgradeSlots?.[slotIdx];
                      return (
                        <div
                          key={slotIdx}
                          className="flex items-center justify-between p-1.5 bg-slate-900/80 rounded border border-slate-700 text-[11px]"
                        >
                          {mod ? (
                            <div className="flex items-center justify-between w-full">
                              <span className="flex items-center gap-1 font-bold text-slate-200">
                                <span>{mod.icon}</span>
                                <span>{mod.name}</span>
                              </span>
                              <button
                                onClick={() => {
                                  const res = unequipModule(activeBuilding.id, slotIdx);
                                  showToast(res.message);
                                }}
                                className="px-1.5 py-0.5 bg-rose-900 hover:bg-rose-800 text-rose-200 rounded text-[9px] font-bold"
                              >
                                ✕ Remove
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <span className="text-slate-500 italic">Slot {slotIdx + 1}: Empty</span>
                              <button
                                onClick={() => {
                                  setSocketPickerSlotIndex(
                                    socketPickerSlotIndex === slotIdx ? null : slotIdx
                                  );
                                }}
                                className="px-2 py-0.5 bg-indigo-800 hover:bg-indigo-700 text-indigo-100 rounded text-[10px] font-bold"
                              >
                                {socketPickerSlotIndex === slotIdx ? 'Cancel' : '+ Socket'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* SOCKET PICKER DROPDOWN */}
                  {socketPickerSlotIndex !== null && (
                    <div className="p-2 bg-slate-900 rounded border border-indigo-400 space-y-1 mt-1">
                      <div className="text-[10px] font-bold text-indigo-200">
                        Select module from Forge inventory for Slot {socketPickerSlotIndex + 1}:
                      </div>
                      {forgeModulesInventory.length === 0 ? (
                        <div className="text-[10px] text-slate-400 italic">
                          No forged modules in inventory! Open the Forge above to craft some.
                        </div>
                      ) : (
                        forgeModulesInventory.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between p-1 bg-slate-800 rounded text-[10px]"
                          >
                            <span className="font-bold text-slate-200">
                              {m.icon} {m.name}
                            </span>
                            <button
                              onClick={() => {
                                const res = equipModule(activeBuilding.id, socketPickerSlotIndex, m.id);
                                showToast(res.message);
                                setSocketPickerSlotIndex(null);
                              }}
                              className="px-1.5 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold"
                            >
                              Insert
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* BUILDING ACTIONS */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700">
                  {activeBuildingDef.canRotate && (
                    <button
                      onClick={() => rotatePlacedBuilding(activeBuilding.id)}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-bold text-slate-200"
                    >
                      🔄 Rotate
                    </button>
                  )}
                  {activeBuilding.level < 5 && (
                    <button
                      onClick={() => {
                        const res = upgradeBuilding(activeBuilding.id);
                        showToast(res.message);
                      }}
                      className={`px-2 py-1.5 rounded text-xs font-bold border ${
                        activeBuilding.level + 1 <= unlockedResearchTier
                          ? 'bg-emerald-800 hover:bg-emerald-700 border-emerald-500 text-emerald-100'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                      title={
                        activeBuilding.level + 1 > unlockedResearchTier
                          ? `Locked: Requires Tech Tier ${activeBuilding.level + 1} at Research Lab`
                          : 'Upgrade building level'
                      }
                    >
                      {activeBuilding.level + 1 <= unlockedResearchTier ? (
                        <span>⬆️ Upgrade (Lv.{activeBuilding.level + 1})</span>
                      ) : (
                        <span>🔒 Req. Tier {activeBuilding.level + 1}</span>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => pickupBuilding(activeBuilding.id)}
                    className="col-span-2 px-2 py-1.5 bg-rose-900/80 hover:bg-rose-800 border border-rose-600 rounded text-xs font-bold text-rose-100"
                  >
                    📦 Return to Storage
                  </button>
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* BOTTOM TOOLBAR */}
      <footer className="bg-slate-900 border-t border-slate-800 p-2.5 flex items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTool('inspect')}
            className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 border ${
              activeTool === 'inspect'
                ? 'bg-amber-600 border-amber-400 text-white shadow-lg'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <span>🔍</span>
            <span>Inspect</span>
          </button>

          <button
            onClick={() => setIsBuildDrawerOpen(true)}
            className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 border ${
              isBuildDrawerOpen || activeTool === 'place'
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <span>🏛️</span>
            <span>Build & Storage Menu</span>
          </button>

          <button
            onClick={() => setActiveTool('road_dirt')}
            className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 border ${
              activeTool === 'road_dirt'
                ? 'bg-amber-700 border-amber-400 text-white shadow-lg'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <span>🟫</span>
            <span>Dirt Path (Free)</span>
          </button>

          <button
            onClick={() => setActiveTool('road_paved')}
            className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 border ${
              activeTool === 'road_paved'
                ? 'bg-slate-400 border-white text-slate-950 shadow-lg'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <span>🏛️</span>
            <span>Paved Road (Granite/Marble)</span>
          </button>

          <button
            onClick={() => setActiveTool('bulldoze')}
            className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 border ${
              activeTool === 'bulldoze'
                ? 'bg-rose-700 border-rose-400 text-white shadow-lg'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <span>🚜</span>
            <span>Demolish Road</span>
          </button>
        </div>

        {activeTool === 'place' && pendingPlacementType && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-300 font-bold">
              Placing: {BUILDING_DEFINITIONS[pendingPlacementType]?.name} ({placementRotation}°)
            </span>
            <button
              onClick={togglePlacementRotation}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-xs font-bold border border-amber-400 text-white"
            >
              🔄 Rotate (R)
            </button>
          </div>
        )}
      </footer>

      {/* BUILDINGS DRAWER */}
      {isBuildDrawerOpen && (
        <div className="absolute bottom-14 left-0 right-0 z-40 bg-slate-900/98 border-t-2 border-slate-700 p-4 shadow-2xl backdrop-blur-xl max-h-[60vh] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setBuildDrawerTab('storage')}
                className={`px-3 py-1.5 rounded-lg font-extrabold text-xs flex items-center gap-1.5 border ${
                  buildDrawerTab === 'storage'
                    ? 'bg-amber-600 border-amber-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span>📦</span>
                <span>Buildings in Storage ({Object.values(buildingStorage).reduce((a, b) => (a || 0) + (b || 0), 0)})</span>
              </button>

              <button
                onClick={() => setBuildDrawerTab('construct')}
                className={`px-3 py-1.5 rounded-lg font-extrabold text-xs flex items-center gap-1.5 border ${
                  buildDrawerTab === 'construct'
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span>🔨</span>
                <span>Construct New Buildings</span>
              </button>
            </div>

            <button
              onClick={() => setIsBuildDrawerOpen(false)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300 font-bold"
            >
              ✕ Close
            </button>
          </div>

          {/* TAB 1: STORAGE */}
          {buildDrawerTab === 'storage' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 overflow-y-auto pr-1">
              {Object.entries(buildingStorage).filter(([_, count]) => (count || 0) > 0).length === 0 ? (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                  Storage is empty! Click &quot;Construct New Buildings&quot; above to craft more with town resources.
                </div>
              ) : (
                Object.entries(buildingStorage).map(([type, count]) => {
                  if (!count || count <= 0) return null;
                  const def = BUILDING_DEFINITIONS[type as BuildingType];
                  if (!def) return null;

                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setPendingPlacementType(type as BuildingType);
                        setIsBuildDrawerOpen(false);
                      }}
                      className="p-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-amber-400 rounded-xl flex flex-col items-center justify-between gap-1 transition-all text-center group"
                    >
                      <div className="text-2xl group-hover:scale-110 transition-transform">{def.icon}</div>
                      <div className="font-extrabold text-xs text-slate-100 truncate w-full">{def.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {def.defaultWidth}×{def.defaultHeight}
                      </div>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                        Ready: {count}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: CONSTRUCT NEW BUILDINGS */}
          {buildDrawerTab === 'construct' && (
            <div className="flex flex-col gap-2 overflow-hidden">
              <div className="flex gap-1.5 flex-wrap pb-1 border-b border-slate-800 text-xs">
                {(['all', 'container', 'residential', 'harvester', 'crafting', 'recreation', 'civic'] as const).map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setConstructCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-bold capitalize ${
                        constructCategory === cat
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 overflow-y-auto pr-1 max-h-[42vh]">
                {Object.values(BUILDING_DEFINITIONS)
                  .filter((b) => constructCategory === 'all' || b.category === constructCategory)
                  .map((def) => {
                    const techReq = TECH_TREE_NODES.find(
                      (n) => n.targetBuildingType === def.id && n.effectType === 'unlock_building'
                    );
                    const isTechLocked = techReq && !unlockedTechNodes.includes(techReq.id);

                    const canAfford = Object.entries(def.cost).every(
                      ([res, cost]) => (resources[res as ResourceType] || 0) >= ((cost as number) || 0)
                    );

                    return (
                      <div
                        key={def.id}
                        className={`p-3 bg-slate-800/80 border rounded-xl flex flex-col justify-between gap-2 ${
                          isTechLocked ? 'border-slate-800 opacity-60' : 'border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{def.icon}</span>
                          <div>
                            <div className="font-extrabold text-xs text-slate-100">{def.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Size: {def.defaultWidth}×{def.defaultHeight} • Category: {def.category}
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-300 line-clamp-2">{def.description}</div>

                        {isTechLocked && (
                          <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1 bg-amber-950/60 p-1 rounded border border-amber-600/40">
                            <span>🔒 Requires Tech:</span>
                            <span className="underline">{techReq.title}</span>
                          </div>
                        )}

                        <div className="flex gap-1 flex-wrap text-[10px]">
                          {Object.keys(def.cost).length === 0 ? (
                            <span className="text-emerald-400 font-bold">Free</span>
                          ) : (
                            Object.entries(def.cost).map(([res, cost]) => {
                              const have = resources[res as ResourceType] || 0;
                              const costNum = (cost as number) || 0;
                              const ok = have >= costNum;
                              return (
                                <span
                                  key={res}
                                  className={`px-1.5 py-0.5 rounded border ${
                                    ok
                                      ? 'bg-slate-900 border-slate-600 text-slate-200'
                                      : 'bg-rose-950/80 border-rose-500 text-rose-300 font-bold'
                                  }`}
                                >
                                  {costNum} {res} ({have})
                                </span>
                              );
                            })
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => {
                              const res = constructBuilding(def.id);
                              showToast(res.message);
                              if (res.success) sound.playRewardSound();
                            }}
                            disabled={!canAfford || isTechLocked}
                            className={`py-1.5 rounded-lg font-bold text-xs transition-colors ${
                              canAfford && !isTechLocked
                                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            🔨 To Storage
                          </button>

                          <button
                            onClick={() => {
                              const res = constructBuilding(def.id);
                              if (res.success) {
                                sound.playRewardSound();
                                setPendingPlacementType(def.id);
                                setIsBuildDrawerOpen(false);
                                showToast(`Constructed! Now placing ${def.name}...`);
                              } else {
                                showToast(res.message);
                              }
                            }}
                            disabled={!canAfford || isTechLocked}
                            className={`py-1.5 rounded-lg font-bold text-xs transition-colors ${
                              canAfford && !isTechLocked
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            📍 Place Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VISUAL DOT-AND-LINE TECH TREE MODAL */}
      {isTechTreeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-indigo-500/80 rounded-2xl w-full max-w-6xl h-[92vh] p-4 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🌳</span>
                <div>
                  <h3 className="font-extrabold text-indigo-300 text-base">VISUAL BRANCHING TECH TREE</h3>
                  <div className="text-[11px] text-slate-400">
                    Connects all 33+ buildings, upgrade slots, and forge tech • 5-minute research timers (fast-forward with .warp)
                  </div>
                </div>
              </div>

              {/* Zoom & Centering Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTechTreeZoom((z) => Math.min(1.4, z + 0.15))}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold"
                >
                  🔍+ Zoom In
                </button>
                <button
                  onClick={() => setTechTreeZoom((z) => Math.max(0.65, z - 0.15))}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold"
                >
                  🔍- Zoom Out
                </button>
                <button
                  onClick={() => {
                    setTechTreeZoom(1);
                    setSelectedTechNodeId('core_hub');
                  }}
                  className="px-2.5 py-1 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-500 rounded text-xs font-bold"
                >
                  🎯 Center Hub
                </button>
                <button
                  onClick={() => setIsTechTreeModalOpen(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Branch Filter Tabs */}
            <div className="flex gap-2 flex-wrap text-xs pb-2 border-b border-slate-800">
              {(['all', 'harvesters', 'crafting', 'infrastructure', 'morale'] as const).map((branch) => (
                <button
                  key={branch}
                  onClick={() => setSelectedTechBranch(branch)}
                  className={`px-3 py-1 rounded-lg font-bold capitalize border ${
                    selectedTechBranch === branch
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {branch === 'all'
                    ? '🌐 All Tech Branches'
                    : branch === 'harvesters'
                    ? '🚜 Harvesters & Extraction'
                    : branch === 'crafting'
                    ? '⚒️ Workshops & Smelting'
                    : branch === 'infrastructure'
                    ? '🏛️ Civic & Barrels'
                    : '💖 Morale & Housing'}
                </button>
              ))}
            </div>

            {/* Main Interactive Visual Canvas & Inspector Layout */}
            <div className="flex-1 flex overflow-hidden pt-2 gap-3">
              {/* SVG DOT-AND-LINE CANVAS */}
              <div className="flex-1 overflow-auto rounded-xl border border-slate-800 bg-slate-950/80 relative cursor-grab active:cursor-grabbing p-4">
                <div
                  style={{
                    width: 1900 * techTreeZoom,
                    height: 1300 * techTreeZoom,
                    transform: `scale(${techTreeZoom})`,
                    transformOrigin: '0 0',
                  }}
                  className="relative transition-transform duration-200"
                >
                  {/* SVG CONNECTING LINES */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <linearGradient id="unlockedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>

                    {TECH_TREE_NODES.map((node) =>
                      node.prerequisites.map((prereqId: string) => {
                        const parent = TECH_TREE_NODES.find((n) => n.id === prereqId);
                        if (!parent) return null;

                        const isChildUnlocked = unlockedTechNodes.includes(node.id);
                        const isParentUnlocked = unlockedTechNodes.includes(parent.id);

                        return (
                          <line
                            key={`${parent.id}->${node.id}`}
                            x1={parent.gridX}
                            y1={parent.gridY}
                            x2={node.gridX}
                            y2={node.gridY}
                            stroke={isChildUnlocked ? '#10b981' : isParentUnlocked ? '#6366f1' : '#334155'}
                            strokeWidth={isChildUnlocked ? 4 : 2.5}
                            strokeDasharray={!isParentUnlocked ? '6,6' : undefined}
                            strokeOpacity={isChildUnlocked ? 0.9 : 0.6}
                          />
                        );
                      })
                    )}
                  </svg>

                  {/* INTERACTIVE CIRCULAR DOTS */}
                  {TECH_TREE_NODES.map((node) => {
                    const isUnlocked = unlockedTechNodes.includes(node.id);
                    const isResearching = researchingNodeId === node.id;
                    const prereqsMet = node.prerequisites.every((req: string) => unlockedTechNodes.includes(req));
                    const isSelected = selectedTechNodeId === node.id;
                    const matchesFilter = selectedTechBranch === 'all' || node.category === selectedTechBranch;

                    let dotBg = 'bg-slate-900 border-slate-700 text-slate-500 opacity-50';
                    if (isUnlocked) {
                      dotBg = 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]';
                    } else if (isResearching) {
                      dotBg = 'bg-amber-950 border-amber-400 text-amber-200 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.6)]';
                    } else if (prereqsMet) {
                      dotBg = 'bg-indigo-950 border-indigo-400 text-indigo-200 hover:scale-110 shadow-[0_0_12px_rgba(99,102,241,0.4)]';
                    }

                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedTechNodeId(node.id)}
                        style={{
                          left: node.gridX - 30,
                          top: node.gridY - 30,
                          width: 60,
                          height: 60,
                        }}
                        className={`absolute rounded-full border-2 flex flex-col items-center justify-center cursor-pointer transition-all z-10 ${dotBg} ${
                          isSelected ? 'ring-4 ring-white scale-110 z-20' : ''
                        } ${!matchesFilter ? 'opacity-30' : ''}`}
                      >
                        <span className="text-xl drop-shadow">{node.icon}</span>

                        {/* STATUS BADGE */}
                        {isUnlocked ? (
                          <span className="absolute -bottom-1 text-[8px] bg-emerald-600 text-white font-extrabold px-1 rounded-full shadow">
                            ✓
                          </span>
                        ) : isResearching ? (
                          <span className="absolute -bottom-1 text-[8px] bg-amber-500 text-black font-extrabold px-1 rounded-full shadow animate-spin">
                            ⏱️
                          </span>
                        ) : !prereqsMet ? (
                          <span className="absolute -bottom-1 text-[8px] bg-slate-800 text-slate-400 px-1 rounded-full">
                            🔒
                          </span>
                        ) : null}

                        {/* NODE LABEL */}
                        <div className="absolute top-14 whitespace-nowrap text-center pointer-events-none">
                          <div className="text-[10px] font-black text-slate-200 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800 shadow">
                            {node.title}
                          </div>
                          {node.effectType === 'slot_upgrade' && (
                            <div className="text-[8px] text-amber-300 font-extrabold">+1 UPGRADE SLOT</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SELECTED NODE INSPECTOR DRAWER */}
              {selectedTechNode && (
                <div className="w-80 bg-slate-900/95 border border-slate-700 rounded-xl p-4 flex flex-col justify-between overflow-y-auto space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                      <span className="text-3xl p-2 bg-slate-800 rounded-xl">{selectedTechNode.icon}</span>
                      <div>
                        <div className="font-extrabold text-sm text-slate-100">{selectedTechNode.title}</div>
                        <div className="text-[10px] uppercase font-bold text-indigo-400">
                          Branch: {selectedTechNode.category}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed">
                      {selectedTechNode.description}
                    </div>

                    <div className="p-2 bg-slate-800/80 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-slate-300">Effect:</div>
                      {selectedTechNode.effectType === 'unlock_building' && selectedTechNode.targetBuildingType && (
                        <div className="text-emerald-300 font-semibold">
                          🏛️ Unlocks Building: {BUILDING_DEFINITIONS[selectedTechNode.targetBuildingType as BuildingType]?.name || selectedTechNode.targetBuildingType}
                        </div>
                      )}
                      {selectedTechNode.effectType === 'slot_upgrade' && (
                        <div className="text-amber-300 font-semibold">
                          ⚡ Adds +1 Upgrade Socket to {selectedTechNode.targetBuildingType || 'All Harvesters/Crafting'}
                        </div>
                      )}
                      {selectedTechNode.effectType === 'unlock_recipe' && (
                        <div className="text-indigo-300 font-semibold">
                          ⚒️ Unlocks Advanced Module Blueprint in Forge
                        </div>
                      )}
                    </div>

                    {/* PREREQUISITES */}
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-slate-300">Prerequisites:</div>
                      {selectedTechNode.prerequisites.length === 0 ? (
                        <div className="text-slate-500 text-[11px] italic">None (Root Technology)</div>
                      ) : (
                        selectedTechNode.prerequisites.map((p: string) => {
                          const pNode = TECH_TREE_NODES.find((x) => x.id === p);
                          const isMet = unlockedTechNodes.includes(p);
                          return (
                            <div
                              key={p}
                              className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                                isMet ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              <span>{isMet ? '✓' : '✗'}</span>
                              <span>{pNode?.title || p}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* COST BREAKDOWN */}
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-slate-300">Research Cost:</div>
                      {Object.keys(selectedTechNode.cost).length === 0 ? (
                        <div className="text-emerald-400 font-bold">Free</div>
                      ) : (
                        <div className="flex gap-1 flex-wrap">
                          {Object.entries(selectedTechNode.cost).map(([res, cost]) => {
                            const have = resources[res as ResourceType] || 0;
                            const costNum = (cost as number) || 0;
                            const ok = have >= costNum;
                            return (
                              <span
                                key={res}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  ok
                                    ? 'bg-slate-800 border-slate-600 text-slate-200'
                                    : 'bg-rose-950 border-rose-500 text-rose-300'
                                }`}
                              >
                                {costNum} {res} ({have})
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RESEARCH BUTTON / TIMER */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    {unlockedTechNodes.includes(selectedTechNode.id) ? (
                      <div className="w-full py-2 bg-emerald-950/80 border border-emerald-500 rounded-xl text-center text-xs font-extrabold text-emerald-300">
                        ✅ Technology Researched & Active
                      </div>
                    ) : researchingNodeId === selectedTechNode.id ? (
                      <div className="p-3 bg-amber-950/90 border border-amber-400 rounded-xl space-y-2 text-center">
                        <div className="text-xs font-bold text-amber-200">
                          ⏱️ Research In Progress: {Math.floor(researchTimeRemaining / 60)}m {researchTimeRemaining % 60}s
                        </div>
                        <button
                          onClick={() => {
                            const res = applyTimeWarp(60);
                            showToast(res.message);
                          }}
                          className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-extrabold shadow"
                        >
                          ⚡ Fast-Forward 60s (.warp)
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const res = startResearch(selectedTechNode.id);
                          showToast(res.message);
                          if (res.success) sound.playRewardSound();
                        }}
                        disabled={
                          !selectedTechNode.prerequisites.every((p: string) => unlockedTechNodes.includes(p)) ||
                          !Object.entries(selectedTechNode.cost).every(
                            ([res, cost]) => (resources[res as ResourceType] || 0) >= ((cost as number) || 0)
                          ) ||
                          researchingNodeId !== null
                        }
                        className={`w-full py-2.5 rounded-xl text-xs font-black transition-all ${
                          unlockedTechNodes.includes(selectedTechNode.id)
                            ? 'hidden'
                            : researchingNodeId !== null
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : selectedTechNode.prerequisites.every((p: string) => unlockedTechNodes.includes(p)) &&
                              Object.entries(selectedTechNode.cost).every(
                                ([res, cost]) => (resources[res as ResourceType] || 0) >= ((cost as number) || 0)
                              )
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl hover:scale-105'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {researchingNodeId !== null
                          ? '⚠️ Lab Busy Researching'
                          : !selectedTechNode.prerequisites.every((p: string) => unlockedTechNodes.includes(p))
                          ? '🔒 Prerequisites Missing'
                          : '🔬 Start 5-Minute Research (300s)'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FORGE CRAFTING MODAL */}
      {isForgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-orange-500 rounded-2xl w-full max-w-4xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">⚒️</span>
                <div>
                  <h3 className="font-extrabold text-orange-300 text-base">THE FORGE CRAFTING SCREEN</h3>
                  <div className="text-[11px] text-slate-400">
                    Craft socketable upgrade modules, autonomous robot workers, and high-performance industrial tools
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsForgeModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* FORGE TABS */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setForgeTab('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  forgeTab === 'all'
                    ? 'bg-orange-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                All Recipes ({FORGE_RECIPES.length})
              </button>
              <button
                onClick={() => setForgeTab('modules')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  forgeTab === 'modules'
                    ? 'bg-orange-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                ⚡ Upgrade Modules
              </button>
              <button
                onClick={() => setForgeTab('robots')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  forgeTab === 'robots'
                    ? 'bg-orange-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                🤖 Automaton Robots
              </button>
              <button
                onClick={() => setForgeTab('tools')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  forgeTab === 'tools'
                    ? 'bg-orange-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                🛠️ Heavy Tools
              </button>
            </div>

            {/* RECIPES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1">
              {FORGE_RECIPES.filter((recipe) => {
                if (forgeTab === 'modules') return recipe.type !== 'robot_worker' && !recipe.type.includes('drill') && !recipe.type.includes('axe') && !recipe.type.includes('nozzle') && !recipe.type.includes('hammer');
                if (forgeTab === 'robots') return recipe.type === 'robot_worker';
                if (forgeTab === 'tools') return recipe.type.includes('drill') || recipe.type.includes('axe') || recipe.type.includes('nozzle') || recipe.type.includes('hammer');
                return true;
              }).map((recipe) => {
                const canAfford = Object.entries(recipe.cost).every(
                  ([res, cost]) => (resources[res as ResourceType] || 0) >= ((cost as number) || 0)
                );
                const countInInventory = forgeModulesInventory.filter((m) => m.type === recipe.type).length;

                return (
                  <div
                    key={recipe.type}
                    className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex flex-col justify-between gap-2 shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-extrabold text-xs text-orange-200 flex items-center gap-1.5">
                          <span className="text-lg">{recipe.icon}</span>
                          <span>{recipe.name}</span>
                        </span>
                        {recipe.type === 'robot_worker' ? (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                            Total: {robotCount}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-bold">
                            In Bag: {countInInventory}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-300 leading-relaxed">
                        {recipe.description}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-700">
                      <div className="flex gap-1 flex-wrap text-[10px]">
                        {Object.entries(recipe.cost).map(([res, cost]) => {
                          const have = resources[res as ResourceType] || 0;
                          const costNum = (cost as number) || 0;
                          const ok = have >= costNum;
                          return (
                            <span
                              key={res}
                              className={`px-1.5 py-0.5 rounded border ${
                                ok
                                  ? 'bg-slate-900 border-slate-600 text-slate-200'
                                  : 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                              }`}
                            >
                              {costNum} {res} ({have})
                            </span>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => {
                          const res = forgeModule(recipe.type);
                          showToast(res.message);
                          if (res.success) sound.playRewardSound();
                        }}
                        disabled={!canAfford}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                          canAfford
                            ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg hover:scale-[1.01]'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        ⚒️ Craft {recipe.name}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ARTISAN WORKSHOP MODAL */}
      {isArtisanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl w-full max-w-4xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🎨</span>
                <div>
                  <h3 className="font-extrabold text-amber-300 text-base">THE ARTISAN WORKSHOP</h3>
                  <div className="text-[11px] text-slate-400">
                    Refine base resources into structural metals, high-conductive electronics, fine textiles, and architectural stone
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsArtisanModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1">
              {ARTISAN_RECIPES.map((recipe) => {
                const canAfford = Object.entries(recipe.cost).every(
                  ([res, cost]) => (resources[res as ResourceType] || 0) >= ((cost as number) || 0)
                );
                const currentOutputStock = resources[recipe.outputResource] || 0;
                const outputCap = storageCaps[recipe.outputResource] || 100;

                return (
                  <div
                    key={recipe.id}
                    className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex flex-col justify-between gap-2 shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-extrabold text-xs text-amber-200 flex items-center gap-1.5">
                          <span className="text-lg">{recipe.icon}</span>
                          <span>{recipe.name}</span>
                        </span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                          Stock: {currentOutputStock} / {outputCap}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 leading-relaxed">
                        {recipe.description}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-700">
                      <div className="flex gap-1 flex-wrap text-[10px]">
                        {Object.entries(recipe.cost).map(([res, cost]) => {
                          const have = resources[res as ResourceType] || 0;
                          const costNum = (cost as number) || 0;
                          const ok = have >= costNum;
                          return (
                            <span
                              key={res}
                              className={`px-1.5 py-0.5 rounded border ${
                                ok
                                  ? 'bg-slate-900 border-slate-600 text-slate-200'
                                  : 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                              }`}
                            >
                              {costNum} {res} ({have})
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const res = craftArtisanRecipe(recipe.id);
                            showToast(res.message);
                            if (res.success) sound.playRewardSound();
                          }}
                          disabled={!canAfford}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            canAfford
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow hover:scale-[1.01]'
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          🎨 Craft +{recipe.outputAmount} {recipe.name}
                        </button>
                        {selectedBuildingId && (
                          <button
                            onClick={() => {
                              setArtisanRecipe(selectedBuildingId, recipe.id);
                              showToast(`Auto-craft focus set to ${recipe.name}!`);
                              sound.playClickSound();
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold text-slate-300"
                            title="Assign this recipe for auto-crafting at currently inspected building"
                          >
                            Set Focus
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* POTION BREWERY MODAL */}
      {isPotionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-purple-500 rounded-2xl w-full max-w-4xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">⚗️</span>
                <div>
                  <h3 className="font-extrabold text-purple-300 text-base">GRAND APOTHECARY & POTION BREWERY</h3>
                  <div className="text-[11px] text-slate-400">
                    Brew and consume magical elixirs, morale draughts, speed tonics, and chronos warp potions to empower your town
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsPotionModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* TOWN POTION POUCH */}
            <div className="p-3 bg-purple-950/40 border border-purple-500/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-200">
                <span>🧪 TOWN POTION POUCH ({totalPotionsInPouch} Total Potions)</span>
                <span className="text-[10px] text-slate-400">Click a potion to drink it for instant town effects!</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-purple-800">
                {POTION_RECIPES.map((potion) => {
                  const count = potionsInventory?.[potion.id] || 0;
                  return (
                    <div
                      key={potion.id}
                      className={`flex items-center justify-between gap-2 p-2 rounded-lg border shrink-0 text-xs ${
                        count > 0
                          ? 'bg-purple-900/60 border-purple-400 text-purple-100'
                          : 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-60'
                      }`}
                    >
                      <span className="text-xl">{potion.icon}</span>
                      <div className="text-left">
                        <div className="font-extrabold text-[11px]">{potion.name}</div>
                        <div className="text-[9px] text-slate-300 font-mono">In Bag: {count}</div>
                      </div>
                      <button
                        onClick={() => {
                          const res = drinkPotion(potion.id);
                          showToast(res.message);
                          if (res.success) sound.playRewardSound();
                        }}
                        disabled={count <= 0}
                        className={`px-2 py-1 rounded text-[10px] font-black ${
                          count > 0
                            ? 'bg-pink-600 hover:bg-pink-500 text-white shadow animate-pulse'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Drink
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* POTION RECIPES TO BREW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1">
              {POTION_RECIPES.map((recipe) => {
                const canAfford = Object.entries(recipe.cost).every(
                  ([res, cost]) => (resources[res as ResourceType] || 0) >= ((cost as number) || 0)
                );
                const countInBag = potionsInventory?.[recipe.id] || 0;

                return (
                  <div
                    key={recipe.id}
                    className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex flex-col justify-between gap-2 shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-extrabold text-xs text-purple-200 flex items-center gap-1.5">
                          <span className="text-lg">{recipe.icon}</span>
                          <span>{recipe.name}</span>
                        </span>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                          In Bag: {countInBag}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 leading-relaxed">
                        {recipe.description}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-700">
                      <div className="flex gap-1 flex-wrap text-[10px]">
                        {Object.entries(recipe.cost).map(([res, cost]) => {
                          const have = resources[res as ResourceType] || 0;
                          const costNum = (cost as number) || 0;
                          const ok = have >= costNum;
                          return (
                            <span
                              key={res}
                              className={`px-1.5 py-0.5 rounded border ${
                                ok
                                  ? 'bg-slate-900 border-slate-600 text-slate-200'
                                  : 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                              }`}
                            >
                              {costNum} {res} ({have})
                            </span>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => {
                          const res = brewPotion(recipe.id);
                          showToast(res.message);
                          if (res.success) sound.playRewardSound();
                        }}
                        disabled={!canAfford}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                          canAfford
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:scale-[1.01]'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        ⚗️ Brew {recipe.name}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MORALE BREAKDOWN MODAL */}
      {isMoraleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-pink-500/80 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💖</span>
                <h3 className="font-extrabold text-pink-300 text-base">TOWN MORALE SYSTEM</h3>
              </div>
              <button
                onClick={() => setIsMoraleModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Building and upgrading Houses, Town Squares, and Playgrounds boosts your town Morale score. High morale empowers all your plushies with universal combat stat buffs and bonus XP!
            </div>

            <div className="p-3.5 bg-pink-950/50 border border-pink-500/60 rounded-xl text-center space-y-1">
              <div className="text-2xl font-black text-pink-300">{morale.score} Morale Points</div>
              <div className="text-sm font-bold text-pink-200">
                Tier {morale.tier}: {morale.tierName}
              </div>
              <div className="text-xs text-emerald-400 font-extrabold">
                Active Buff: +{morale.statBonusPercent}% HP, ATK & SPEED • +{morale.xpBonusPercent}% COMBAT XP
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-slate-300">Morale Tiers:</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="font-bold text-slate-300">Tier 1: Content (10-34)</div>
                  <div className="text-slate-400">Normal stats</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="font-bold text-emerald-300">Tier 2: Happy (35-64)</div>
                  <div className="text-emerald-400">+5% Stats • +10% XP</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="font-bold text-cyan-300">Tier 3: Inspired (65-99)</div>
                  <div className="text-cyan-400">+10% Stats • +15% XP</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="font-bold text-pink-300">Tier 4: Ecstatic (100+)</div>
                  <div className="text-pink-400">+15% Stats • +25% XP</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DINO DNA ATTRIBUTE LAB MODAL */}
      {isDnaLabModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl w-full max-w-4xl p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🦖</span>
                <div>
                  <h3 className="font-extrabold text-emerald-300 text-base">ANCIENT DINO DNA & GENETICS LAB</h3>
                  <div className="text-[11px] text-slate-400">
                    Extract prehistoric DNA from fossils dug at the Ancient Fossil Dig. Spend DNA Helix points to permanently buff attributes for ALL stuffies!
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDnaLabModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* FOSSIL EXTRACTION CONSOLE */}
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-900/60 border border-emerald-400/50 rounded-xl text-center">
                  <div className="text-2xl font-black text-emerald-200">🧬 {dnaPoints || 0}</div>
                  <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">DNA Helix Points</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>🦴 Ancient Fossils in Storage:</span>
                    <span className="text-emerald-400 font-black">{resources.fossils || 0}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Ratio: 10 Fossils = 1 DNA Helix Point (Extract to unlock attribute upgrades)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const res = extractFossilDna(10);
                    showToast(res.message);
                    if (res.success) sound.playRewardSound();
                  }}
                  disabled={(resources.fossils || 0) < 10}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    (resources.fossils || 0) >= 10
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow hover:scale-105'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  Extract 10 Fossils (+1 Pt)
                </button>
                <button
                  onClick={() => {
                    const res = extractFossilDna();
                    showToast(res.message);
                    if (res.success) sound.playRewardSound();
                  }}
                  disabled={(resources.fossils || 0) < 10}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    (resources.fossils || 0) >= 10
                      ? 'bg-teal-600 hover:bg-teal-500 text-white shadow hover:scale-105 animate-pulse'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  Bulk Extract All
                </button>
              </div>
            </div>

            {/* ATTRIBUTE UPGRADE TREE NODES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-1 flex-1">
              {[
                {
                  id: 'vitality',
                  name: 'Tyranno Vitality',
                  icon: '🦖',
                  level: dnaAttributes?.vitality || 0,
                  perLevelText: '+10 Max HP to ALL stuffies',
                  currentEffect: `+${(dnaAttributes?.vitality || 0) * 10} Max HP`,
                  description: 'Dense fossilized bone marrow fortifies plushie stitching, permanently expanding health pools.',
                },
                {
                  id: 'ferocity',
                  name: 'Apex Ferocity',
                  icon: '💥',
                  level: dnaAttributes?.ferocity || 0,
                  perLevelText: '+5% Attack & Card Damage',
                  currentEffect: `+${(dnaAttributes?.ferocity || 0) * 5}% Damage`,
                  description: 'Awakens primeval predatory fury, amplifying all card attack damage across every battle.',
                },
                {
                  id: 'speed',
                  name: 'Raptor Reflexes',
                  icon: '⚡',
                  level: dnaAttributes?.speed || 0,
                  perLevelText: '+8 Base Speed to ALL stuffies',
                  currentEffect: `+${(dnaAttributes?.speed || 0) * 8} Speed`,
                  description: 'Primordial agility genes accelerate turn speeds and worker reaction times.',
                },
                {
                  id: 'defense',
                  name: 'Ankylosaur Carapace',
                  icon: '🛡️',
                  level: dnaAttributes?.defense || 0,
                  perLevelText: '+10 Starting Shield in combat',
                  currentEffect: `+${(dnaAttributes?.defense || 0) * 10} Starting Shield`,
                  description: 'Tough keratin dermal plates wrap around friendly stuffies at the start of battle.',
                },
                {
                  id: 'instinct',
                  name: 'Pterodactyl Instinct',
                  icon: '👁️',
                  level: dnaAttributes?.instinct || 0,
                  perLevelText: '+3% Crit Chance & +2% Evasion',
                  currentEffect: `+${(dnaAttributes?.instinct || 0) * 3}% Crit • +${(dnaAttributes?.instinct || 0) * 2}% Evasion`,
                  description: 'Sharp aerial hunting perception detects enemy vital spots while effortlessly ducking strikes.',
                },
              ].map((attr) => {
                const isMax = attr.level >= 10;
                const canUpgrade = (dnaPoints || 0) >= 1 && !isMax;

                return (
                  <div
                    key={attr.id}
                    className="p-3.5 bg-slate-800/80 border border-slate-700 rounded-xl flex flex-col justify-between gap-3 shadow hover:border-emerald-500/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-extrabold text-xs text-emerald-200 flex items-center gap-1.5">
                          <span className="text-xl">{attr.icon}</span>
                          <span>{attr.name}</span>
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                            isMax
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          Lv {attr.level}/10
                        </span>
                      </div>

                      {/* PROGRESS BAR */}
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden my-2">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                          style={{ width: `${(attr.level / 10) * 100}%` }}
                        />
                      </div>

                      <div className="text-[11px] font-bold text-emerald-300">
                        Current Bonus: {attr.currentEffect}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-relaxed mt-1">
                        {attr.description}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{attr.perLevelText}</span>
                      <button
                        onClick={() => {
                          const res = upgradeDnaAttribute(attr.id as any);
                          showToast(res.message);
                          if (res.success) sound.playRewardSound();
                        }}
                        disabled={!canUpgrade}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                          isMax
                            ? 'bg-amber-900/60 text-amber-200 border border-amber-500/40 cursor-default'
                            : canUpgrade
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:scale-105'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isMax ? 'MAXED' : 'Upgrade (-1 Pt)'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
