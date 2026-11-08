'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTownStore, GRID_SIZE } from '@/store/townStore';
import { BUILDING_DEFINITIONS, ALL_RESOURCES, RESEARCH_TIERS, BUILDING_UPGRADE_COSTS } from '@/data/townBuildings';
import { BuildingType, ResourceType, BuildingCategory } from '@/types/town';
import { sound } from '@/utils/audio';

interface TownBuilderProps {
  onBack: () => void;
}

const TILE_SIZE = 38; // Pixels per grid tile for 100x100 grid

export default function TownBuilder({ onBack }: TownBuilderProps) {
  const {
    grid,
    resources,
    storageCaps,
    buildings,
    buildingStorage,
    unlockedResearchTier,
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
    researchNextTier,
    setHarvesterResource,
    setPath,
    clearTileRoad,
    harvestTick,
    getMoraleInfo,
  } = useTownStore();

  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportBounds, setViewportBounds] = useState({
    scrollLeft: 1800,
    scrollTop: 1800,
    width: 1000,
    height: 700,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);
  const [isBuildDrawerOpen, setIsBuildDrawerOpen] = useState(false);
  const [buildDrawerTab, setBuildDrawerTab] = useState<'storage' | 'construct'>('storage');
  const [constructCategory, setConstructCategory] = useState<BuildingCategory | 'all'>('all');
  const [isMoraleModalOpen, setIsMoraleModalOpen] = useState(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initialize town on mount
  useEffect(() => {
    initializeTown();
  }, [initializeTown]);

  // Periodic automatic harvest loop every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const res = harvestTick();
      if (res.harvestedCount > 0) {
        showToast(`🌾 Harvested +${res.harvestedCount} resources from connected harvesters!`);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [harvestTick]);

  // Update viewport measurements on scroll & resize
  const updateViewportBounds = useCallback(() => {
    if (!viewportRef.current) return;
    setViewportBounds({
      scrollLeft: viewportRef.current.scrollLeft,
      scrollTop: viewportRef.current.scrollTop,
      width: viewportRef.current.clientWidth || 1000,
      height: viewportRef.current.clientHeight || 700,
    });
  }, []);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    updateViewportBounds();
    vp.addEventListener('scroll', updateViewportBounds, { passive: true });
    window.addEventListener('resize', updateViewportBounds);

    // Initial center around Town Hall or center of 100x100
    const townHall = buildings.find((b) => b.type === 'town_hall');
    const targetX = townHall ? townHall.x * TILE_SIZE : 45 * TILE_SIZE;
    const targetY = townHall ? townHall.y * TILE_SIZE : 45 * TILE_SIZE;
    vp.scrollLeft = targetX - vp.clientWidth / 2;
    vp.scrollTop = targetY - vp.clientHeight / 2;

    return () => {
      vp.removeEventListener('scroll', updateViewportBounds);
      window.removeEventListener('resize', updateViewportBounds);
    };
  }, [updateViewportBounds, buildings]);

  // Virtualized row and column ranges for 100x100 performance
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

  // Drag to pan
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

  const panBy = (dx: number, dy: number) => {
    if (viewportRef.current) {
      viewportRef.current.scrollLeft += dx;
      viewportRef.current.scrollTop += dy;
    }
  };

  // Placement Preview Highlight Calculation
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

  // Handle tile interaction
  const handleTileClick = (x: number, y: number) => {
    if (activeTool === 'inspect') {
      selectTile(x, y);
    } else if (activeTool === 'road_dirt') {
      setPath(x, y, 'dirt');
    } else if (activeTool === 'road_paved') {
      const hasGranite = (resources.granite || 0) >= 1;
      const hasMarble = (resources.marble || 0) >= 1;
      if (!hasGranite && !hasMarble) {
        showToast('❌ Paved road requires 1 Marble or Granite from the Quarry!');
        return;
      }
      setPath(x, y, 'paved');
    } else if (activeTool === 'bulldoze') {
      clearTileRoad(x, y);
    } else if (activeTool === 'place' && pendingPlacementType) {
      const success = placeBuilding(pendingPlacementType, x, y, placementRotation);
      if (success) {
        sound.playRewardSound();
        showToast(`✅ Placed ${BUILDING_DEFINITIONS[pendingPlacementType].name}!`);
      } else {
        showToast('❌ Cannot place here! Check space, path overlaps, or bounds.');
      }
    }
  };

  const selectedTileData = selectedTile ? grid[selectedTile.y]?.[selectedTile.x] : null;
  const activeBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const activeBuildingDef = activeBuilding ? BUILDING_DEFINITIONS[activeBuilding.type] : null;
  const morale = getMoraleInfo();

  // Storage warning check: >= 85% cap
  const warningResources = Object.entries(resources).filter(([res, amt]) => {
    const cap = storageCaps[res as ResourceType] || 150;
    return amt >= cap * 0.85;
  });

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
              Tech Tier: <strong className="text-amber-400">Tier {unlockedResearchTier}/5</strong> • Arrow Keys / WASD to Navigate
            </div>
          </div>
        </div>

        {/* MORALE & RESEARCH BADGES */}
        <div className="flex items-center gap-2">
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

          {/* TECH TREE BUTTON */}
          <button
            onClick={() => setIsResearchModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500 rounded-lg text-xs font-bold text-indigo-300 transition-all hover:scale-105"
            title="Click to view Research Lab Tech Tree & upgrade tiers"
          >
            <span>📚</span>
            <span>Research Tier {unlockedResearchTier}/5</span>
          </button>
        </div>

        {/* RESOURCE STRIP */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {ALL_RESOURCES.slice(0, 10).map((res) => {
            const amt = resources[res.id] || 0;
            const cap = storageCaps[res.id] || 150;
            const isFull = amt >= cap;
            const isNearFull = amt >= cap * 0.85;

            return (
              <div
                key={res.id}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-semibold shrink-0 transition-colors ${
                  isFull
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                    : isNearFull
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse'
                    : 'bg-slate-800/90 border-slate-700 text-slate-200'
                }`}
                title={`${res.name}: ${amt} / ${cap}`}
              >
                <span>{res.icon}</span>
                <span className="font-mono text-[11px]">
                  {amt}/{cap}
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
            ⚠️ <strong>Storage Alert:</strong>{' '}
            {warningResources.map(([r, a]) => `${r} (${a}/${storageCaps[r as ResourceType]})`).join(', ')}{' '}
            at 85%+ cap! Build Barrels or Vault space to avoid production pauses.
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
          {/* 100x100 MAP CONTAINER (3800x3800 px) */}
          <div
            className="relative bg-emerald-950/95 shadow-2xl border-8 border-slate-800 rounded-2xl overflow-hidden"
            style={{
              width: GRID_SIZE * TILE_SIZE,
              height: GRID_SIZE * TILE_SIZE,
            }}
          >
            {/* VIRTUALIZED TILES RENDERING */}
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
                    {/* Road rendering */}
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

                    {/* Natural resource icons */}
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
              const cap = b.assignedResource ? storageCaps[b.assignedResource] || 150 : 150;
              const isResourceFull = b.assignedResource ? (resources[b.assignedResource] || 0) >= cap : false;

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
                    {!b.isConnectedToTownHall && b.type !== 'town_hall' && (
                      <span className="bg-rose-900/90 border border-rose-500 text-rose-200 px-1 rounded text-[8px] font-bold animate-pulse" title="Disconnected from Town Hall road!">
                        ⚠️ Road
                      </span>
                    )}
                    {isHarvester && isResourceFull && (
                      <span className="bg-amber-900/90 border border-amber-500 text-amber-200 px-1 rounded text-[8px] font-bold animate-pulse" title="Storage is full! Harvester paused.">
                        ⚠️ Full
                      </span>
                    )}
                  </div>

                  <div className="text-xl drop-shadow">{def?.icon || '🏛️'}</div>

                  <div className="text-[10px] font-extrabold truncate w-full text-center text-slate-100">
                    {def?.name.split(' ')[0]}
                  </div>

                  {b.assignedResource && (
                    <div className="text-[8px] text-amber-300 bg-black/50 px-1 rounded uppercase tracking-wider">
                      {b.assignedResource}
                    </div>
                  )}
                </div>
              );
            })}

            {/* PLACEMENT PREVIEW GHOST HIGHLIGHT */}
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

        {/* TOUCHSCREEN D-PAD NAVIGATION */}
        <div className="absolute bottom-20 right-6 z-30 flex flex-col items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-2 rounded-2xl shadow-2xl backdrop-blur-sm">
          <button
            onClick={() => panBy(0, -160)}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg font-bold text-sm border border-slate-600 flex items-center justify-center"
          >
            ⬆️
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => panBy(-160, 0)}
              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg font-bold text-sm border border-slate-600 flex items-center justify-center"
            >
              ⬅️
            </button>
            <button
              onClick={() => panBy(0, 160)}
              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg font-bold text-sm border border-slate-600 flex items-center justify-center"
            >
              ⬇️
            </button>
            <button
              onClick={() => panBy(160, 0)}
              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg font-bold text-sm border border-slate-600 flex items-center justify-center"
            >
              ➡️
            </button>
          </div>
        </div>

        {/* TILE / BUILDING INSPECTOR SIDEBAR */}
        {selectedTileData && (
          <aside className="absolute top-4 left-4 z-30 w-72 bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                <span>🔍</span> Tile ({selectedTileData.x}, {selectedTileData.y})
              </span>
              <button
                onClick={() => selectTile(-1, -1)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Terrain:</span>
                <span className="font-bold text-emerald-400 capitalize">{selectedTileData.terrain}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Natural Resources:</span>
                <span className="font-bold text-amber-200">
                  {selectedTileData.resources.length > 0
                    ? selectedTileData.resources.join(', ')
                    : 'Plain Land'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Road:</span>
                <span className="font-bold capitalize">{selectedTileData.pathType}</span>
              </div>
            </div>

            {/* Building Info on tile */}
            {activeBuilding && activeBuildingDef && (
              <div className="border-t border-slate-700 pt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activeBuildingDef.icon}</span>
                  <div>
                    <div className="font-extrabold text-white">{activeBuildingDef.name}</div>
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
                    <div>❌ Disconnected! Build a road path connecting to Town Hall.</div>
                  )}
                </div>

                {/* Harvester options */}
                {activeBuildingDef.harvestOptions && (
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
                              : 'bg-slate-800 border-slate-700 text-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Building actions */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {activeBuildingDef.canRotate && (
                    <button
                      onClick={() => rotatePlacedBuilding(activeBuilding.id)}
                      className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-xs font-bold"
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
          {/* Tool: Inspect */}
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

          {/* Tool: Build Drawer */}
          <button
            onClick={() => {
              setIsBuildDrawerOpen(true);
            }}
            className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 border ${
              isBuildDrawerOpen || activeTool === 'place'
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <span>🏛️</span>
            <span>Build & Storage Menu</span>
          </button>

          {/* Tool: Dirt Path (Free) */}
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

          {/* Tool: Paved Road */}
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

          {/* Tool: Bulldozer */}
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

        {/* Rotation toggle when placing */}
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

      {/* BUILDINGS DRAWER: CRAFT NEW & STORAGE TABS */}
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
                  Storage is currently empty! Click &quot;Construct New Buildings&quot; above to craft more with town resources.
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
              {/* Category filter */}
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

              {/* Building list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 overflow-y-auto pr-1 max-h-[42vh]">
                {Object.values(BUILDING_DEFINITIONS)
                  .filter((b) => constructCategory === 'all' || b.category === constructCategory)
                  .map((def) => {
                    const canAfford = Object.entries(def.cost).every(
                      ([res, cost]) => (resources[res as ResourceType] || 0) >= (cost || 0)
                    );

                    return (
                      <div
                        key={def.id}
                        className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex flex-col justify-between gap-2"
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

                        {/* Cost tags */}
                        <div className="flex gap-1 flex-wrap text-[10px]">
                          {Object.keys(def.cost).length === 0 ? (
                            <span className="text-emerald-400 font-bold">Free</span>
                          ) : (
                            Object.entries(def.cost).map(([res, cost]) => {
                              const have = resources[res as ResourceType] || 0;
                              const ok = have >= (cost || 0);
                              return (
                                <span
                                  key={res}
                                  className={`px-1.5 py-0.5 rounded border ${
                                    ok
                                      ? 'bg-slate-900 border-slate-600 text-slate-200'
                                      : 'bg-rose-950/80 border-rose-500 text-rose-300 font-bold'
                                  }`}
                                >
                                  {cost} {res} ({have})
                                </span>
                              );
                            })
                          )}
                        </div>

                        {/* Construct Button */}
                        <button
                          onClick={() => {
                            const res = constructBuilding(def.id);
                            showToast(res.message);
                            if (res.success) {
                              sound.playRewardSound();
                            }
                          }}
                          disabled={!canAfford}
                          className={`w-full py-1.5 rounded-lg font-bold text-xs transition-colors ${
                            canAfford
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? '🔨 Construct' : '❌ Insufficient Resources'}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESEARCH LAB TECH TREE MODAL */}
      {isResearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border-2 border-indigo-500/80 rounded-2xl w-full max-w-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                <h3 className="font-extrabold text-indigo-300 text-base">RESEARCH LAB: TECH TREE</h3>
              </div>
              <button
                onClick={() => setIsResearchModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Researching higher tech tiers enables your town buildings to upgrade up to Level 5.
            </div>

            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {RESEARCH_TIERS.map((tier) => {
                const isUnlocked = tier.tier <= unlockedResearchTier;
                const isNext = tier.tier === unlockedResearchTier + 1;
                const canAfford = Object.entries(tier.cost).every(
                  ([res, cost]) => (resources[res as ResourceType] || 0) >= (cost || 0)
                );

                return (
                  <div
                    key={tier.tier}
                    className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
                      isUnlocked
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                        : isNext
                        ? 'bg-indigo-950/60 border-indigo-400 text-indigo-100'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm flex items-center gap-1.5">
                        {isUnlocked ? '✅' : isNext ? '🔓' : '🔒'} {tier.name}
                      </span>
                      <span className="text-[10px] bg-black/50 px-2 py-0.5 rounded font-mono">
                        Tier {tier.tier}
                      </span>
                    </div>

                    <div className="text-xs">{tier.unlocksDescription}</div>

                    {/* Cost */}
                    {Object.keys(tier.cost).length > 0 && !isUnlocked && (
                      <div className="flex gap-1.5 flex-wrap text-[11px] pt-1">
                        {Object.entries(tier.cost).map(([res, cost]) => {
                          const have = resources[res as ResourceType] || 0;
                          return (
                            <span
                              key={res}
                              className={`px-1.5 py-0.5 rounded border ${
                                have >= (cost || 0)
                                  ? 'bg-slate-900 border-slate-600 text-slate-200'
                                  : 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                              }`}
                            >
                              {cost} {res} ({have})
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {isNext && (
                      <button
                        onClick={() => {
                          const res = researchNextTier();
                          showToast(res.message);
                        }}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-lg font-bold text-xs mt-1 transition-colors ${
                          canAfford
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? '🔬 Research Next Tier' : '❌ Insufficient Resources'}
                      </button>
                    )}
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
    </div>
  );
}
