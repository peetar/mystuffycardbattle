'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTownStore } from '@/store/townStore';
import { BUILDING_DEFINITIONS, ALL_RESOURCES } from '@/data/townBuildings';
import { BuildingType, ResourceType, PathType } from '@/types/town';
import { sound } from '@/utils/audio';

interface TownBuilderProps {
  onBack: () => void;
}

const TILE_SIZE = 40; // Pixels per grid tile
const GRID_SIZE = 30;

export default function TownBuilder({ onBack }: TownBuilderProps) {
  const {
    grid,
    resources,
    storageCaps,
    buildings,
    buildingStorage,
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
    placeBuilding,
    pickupBuilding,
    rotatePlacedBuilding,
    upgradeBuilding,
    setHarvesterResource,
    setPath,
    clearTileRoad,
    harvestTick,
  } = useTownStore();

  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState({ x: 300, y: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);
  const [isBuildDrawerOpen, setIsBuildDrawerOpen] = useState(false);
  const [harvestNotification, setHarvestNotification] = useState<string | null>(null);

  // Initialize town on mount
  useEffect(() => {
    initializeTown();
  }, [initializeTown]);

  // Periodic automatic harvest loop every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const res = harvestTick();
      if (res.harvestedCount > 0) {
        setHarvestNotification(`🌾 Harvested +${res.harvestedCount} resources!`);
        setTimeout(() => setHarvestNotification(null), 3000);
      }
    }, 6000);
    return () => clearInterval(timer);
  }, [harvestTick]);

  // Center initial view around Town Hall or center of 30x30
  useEffect(() => {
    if (viewportRef.current) {
      const townHall = buildings.find((b) => b.type === 'town_hall');
      const targetX = townHall ? townHall.x * TILE_SIZE : 15 * TILE_SIZE;
      const targetY = townHall ? townHall.y * TILE_SIZE : 15 * TILE_SIZE;
      viewportRef.current.scrollLeft = targetX - viewportRef.current.clientWidth / 2;
      viewportRef.current.scrollTop = targetY - viewportRef.current.clientHeight / 2;
    }
  }, [buildings]);

  // Keyboard navigation using Arrow keys and WASD
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!viewportRef.current) return;
    const step = 60;
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
  }, [togglePlacementRotation]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch & Mouse Drag to pan town
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

  // Pan helper for Touchscreen D-Pad buttons
  const panBy = (dx: number, dy: number) => {
    if (viewportRef.current) {
      viewportRef.current.scrollLeft += dx;
      viewportRef.current.scrollTop += dy;
    }
  };

  // Handle tile interaction
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
      } else {
        alert('Cannot place building here! Check bounds, overlaps, and storage.');
      }
    }
  };

  const selectedTileData = selectedTile ? grid[selectedTile.y]?.[selectedTile.x] : null;
  const activeBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const activeBuildingDef = activeBuilding ? BUILDING_DEFINITIONS[activeBuilding.type] : null;

  // Warning check: Any resource at >= 85% storage capacity
  const warningResources = Object.entries(resources).filter(([res, amt]) => {
    const cap = storageCaps[res as ResourceType] || 100;
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
                v4.4 PREVIEW
              </span>
            </div>
            <div className="text-[11px] text-slate-400">30×30 Grid • Arrow Keys / WASD / Touch to Navigate</div>
          </div>
        </div>

        {/* RESOURCE CAROUSEL / STRIP */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {ALL_RESOURCES.slice(0, 9).map((res) => {
            const amt = resources[res.id] || 0;
            const cap = storageCaps[res.id] || 100;
            const isFull = amt >= cap;
            const isNearFull = amt >= cap * 0.85;

            return (
              <div
                key={res.id}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-semibold shrink-0 transition-colors ${
                  isFull
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                    : isNearFull
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse'
                    : 'bg-slate-800/90 border-slate-700 text-slate-200'
                }`}
                title={`${res.name}: ${amt} / ${cap}`}
              >
                <span>{res.icon}</span>
                <span className="font-mono">
                  {amt}/{cap}
                </span>
              </div>
            );
          })}
        </div>
      </header>

      {/* STORAGE WARNING BANNER */}
      {warningResources.length > 0 && (
        <div className="bg-amber-900/80 border-b border-amber-600 px-4 py-1 text-xs text-amber-200 flex items-center justify-between">
          <span>
            ⚠️ <strong>Storage Warning:</strong>{' '}
            {warningResources.map(([r, a]) => `${r} (${a}/${storageCaps[r as ResourceType]})`).join(', ')}{' '}
            is near capacity! Build Barrels or Vault space to prevent harvesters from halting.
          </span>
        </div>
      )}

      {/* HARVEST NOTIFICATION POPUP */}
      {harvestNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-emerald-900/95 border border-emerald-500 text-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-xl animate-bounce">
          {harvestNotification}
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <div className="relative flex-1 overflow-hidden bg-slate-900">
        <div
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="w-full h-full overflow-auto cursor-grab active:cursor-grabbing"
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* 30x30 TILE GRID CONTAINER */}
          <div
            className="relative bg-emerald-950/90 shadow-2xl m-10 border-4 border-slate-800 rounded-xl overflow-hidden"
            style={{
              width: GRID_SIZE * TILE_SIZE,
              height: GRID_SIZE * TILE_SIZE,
            }}
          >
            {/* GRID TILES */}
            {grid.map((row, y) =>
              row.map((tile, x) => {
                const isSelected = selectedTile?.x === x && selectedTile?.y === y;
                const isHovered = hoverTile?.x === x && hoverTile?.y === y;

                // Terrain backgrounds
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
                    className={`absolute border border-black/15 flex items-center justify-center text-[10px] transition-colors cursor-pointer ${terrainBg} ${
                      isSelected ? 'ring-2 ring-amber-400 z-10' : ''
                    } ${isHovered ? 'brightness-125' : ''}`}
                  >
                    {/* Path rendering */}
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
                      <span className="opacity-75 drop-shadow scale-90">
                        {tile.resources[0] === 'wood' && '🌲'}
                        {tile.resources[0] === 'water' && '💧'}
                        {tile.resources[0] === 'stone' && '🪨'}
                        {tile.resources[0] === 'sand' && '🏖️'}
                        {tile.resources[0] === 'lava' && '🌋'}
                        {tile.resources[0] === 'clay' && '🏺'}
                      </span>
                    )}
                  </div>
                );
              })
            )}

            {/* PLACED BUILDINGS OVERLAY */}
            {buildings.map((b) => {
              const def = BUILDING_DEFINITIONS[b.type];
              const isSelected = selectedBuildingId === b.id;
              const isHarvester = def?.category === 'harvester';
              const cap = b.assignedResource ? storageCaps[b.assignedResource] || 100 : 100;
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
                      : isHarvester
                      ? 'bg-blue-950/90 border-blue-400'
                      : def?.category === 'residential'
                      ? 'bg-emerald-950/90 border-emerald-400'
                      : 'bg-slate-900/90 border-indigo-400'
                  } ${isSelected ? 'ring-4 ring-white scale-105 z-20' : ''}`}
                >
                  <div className="w-full flex items-center justify-between text-[10px]">
                    <span className="bg-black/60 px-1 rounded text-amber-300 font-bold">
                      Lv.{b.level}
                    </span>
                    {!b.isConnectedToTownHall && b.type !== 'town_hall' && (
                      <span className="bg-rose-900/90 border border-rose-500 text-rose-200 px-1 rounded text-[9px] font-bold animate-pulse" title="Disconnected from Town Hall road network!">
                        ⚠️ Road
                      </span>
                    )}
                    {isHarvester && isResourceFull && (
                      <span className="bg-amber-900/90 border border-amber-500 text-amber-200 px-1 rounded text-[9px] font-bold animate-pulse" title="Storage is full! Harvester paused.">
                        ⚠️ Full
                      </span>
                    )}
                  </div>

                  <div className="text-xl drop-shadow">{def?.icon || '🏛️'}</div>

                  <div className="text-[10px] font-extrabold truncate w-full text-center text-slate-100">
                    {def?.name.split(' ')[0]}
                  </div>

                  {b.assignedResource && (
                    <div className="text-[9px] text-amber-300 bg-black/50 px-1 rounded uppercase tracking-wider">
                      {b.assignedResource}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ON-SCREEN TOUCHSCREEN D-PAD NAVIGATION */}
        <div className="absolute bottom-24 right-6 z-30 flex flex-col items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-2 rounded-2xl shadow-2xl backdrop-blur-sm">
          <button
            onClick={() => panBy(0, -120)}
            className="w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg font-bold text-sm border border-slate-600 flex items-center justify-center"
          >
            ⬆️
          </button>
          <div className="flex gap-1">
            <button
              onClick={() => panBy(-120, 0)}
              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg font-bold text-sm border border-slate-600 flex items-center justify-center"
            >
              ⬅️
            </button>
            <button
              onClick={() => panBy(0, 120)}
              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg font-bold text-sm border border-slate-600 flex items-center justify-center"
            >
              ⬇️
            </button>
            <button
              onClick={() => panBy(120, 0)}
              className="w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 rounded-lg font-bold text-sm border border-slate-600 flex items-center justify-center"
            >
              ➡️
            </button>
          </div>
        </div>

        {/* SIDE INSPECTION & ACTION PANEL */}
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

            {/* Tile Info */}
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
                    : 'None (Plain Field)'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Road Type:</span>
                <span className="font-bold capitalize">{selectedTileData.pathType}</span>
              </div>
            </div>

            {/* Building Info on this tile */}
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

                {/* Road connectivity status */}
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

                {/* Harvester target selector */}
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
                      onClick={() => upgradeBuilding(activeBuilding.id)}
                      className="px-2 py-1.5 bg-emerald-800 hover:bg-emerald-700 border border-emerald-500 rounded text-xs font-bold text-emerald-100"
                    >
                      ⬆️ Upgrade (Lv.{activeBuilding.level + 1})
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
            onClick={() => setIsBuildDrawerOpen(!isBuildDrawerOpen)}
            className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 border ${
              isBuildDrawerOpen || activeTool === 'place'
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <span>🏛️</span>
            <span>Build ({Object.values(buildingStorage).reduce((a, b) => (a || 0) + (b || 0), 0)})</span>
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
            <span>Paved Road (+Speed)</span>
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

      {/* BUILDINGS INVENTORY DRAWER */}
      {isBuildDrawerOpen && (
        <div className="absolute bottom-14 left-0 right-0 z-30 bg-slate-900/98 border-t border-slate-700 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📦</span>
              <h3 className="font-extrabold text-amber-300 text-sm">BUILDINGS STORAGE</h3>
              <span className="text-xs text-slate-400">Select any building in storage to place on the 30×30 grid</span>
            </div>
            <button
              onClick={() => setIsBuildDrawerOpen(false)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-300"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {Object.entries(buildingStorage).map(([type, count]) => {
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
                    In Storage: {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
