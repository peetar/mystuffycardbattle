'use client';

import React, { useState } from 'react';
import {
  STORY_SECTORS,
  SECTOR_GRID_WIDTH,
  SECTOR_GRID_HEIGHT,
  TOTAL_SECTORS,
  getSectorById,
} from '@/data/storySectors';
import {
  getMissionForSector,
  STORY_MISSIONS,
  getCurrentStoryObjectiveStep,
  getCurrentStoryObjectiveSectorId,
} from '@/data/storyMissions';
import { useStoryStore } from '@/store/storyStore';
import { StoryMissionModal } from './StoryMissionModal';
import { StoryDialogueModal } from './StoryDialogueModal';
import { FairyWellModal } from './FairyWellModal';
import { StoryMission, StorySector, StoryDraftSelection } from '@/types/story';
import { sound } from '@/utils/audio';

interface StorySectorGridProps {
  onBackToMenu: () => void;
  onEmbarkMission: (mission: StoryMission, selectedTeam?: (string | StoryDraftSelection)[]) => void;
  onOpenArmory: () => void;
  onOpenEvolutionLab: () => void;
}

function getBiomeBgClasses(biome: string): string {
  switch (biome) {
    case 'house':
      return 'bg-gradient-to-br from-amber-950/90 via-stone-900/90 to-amber-900/70 border-amber-800/40';
    case 'backyard':
      return 'bg-gradient-to-br from-emerald-950/90 via-green-950/80 to-emerald-900/70 border-emerald-800/40';
    case 'necak_house':
      return 'bg-gradient-to-br from-rose-950/90 via-red-950/80 to-amber-950/70 border-rose-800/40';
    case 'apartment':
      return 'bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 border-indigo-800/40';
    case 'wild_forest':
      return 'bg-gradient-to-br from-teal-950/90 via-emerald-950/85 to-teal-900/70 border-teal-800/40';
    case 'beach':
      return 'bg-gradient-to-br from-yellow-950/90 via-amber-950/80 to-stone-900 border-yellow-700/40';
    case 'ocean':
      return 'bg-gradient-to-br from-cyan-950/95 via-blue-950/85 to-teal-950/80 border-cyan-800/40';
    case 'suburb':
      return 'bg-gradient-to-br from-violet-950/80 via-purple-950/70 to-slate-900 border-violet-800/40';
    case 'playground':
      return 'bg-gradient-to-br from-orange-950/80 via-amber-950/70 to-stone-900 border-orange-800/40';
    case 'astral':
      return 'bg-gradient-to-br from-purple-950/90 via-fuchsia-950/80 to-indigo-950/90 border-purple-800/40';
    default:
      return 'bg-slate-900 border-slate-700';
  }
}

export const StorySectorGrid: React.FC<StorySectorGridProps> = ({
  onBackToMenu,
  onEmbarkMission,
  onOpenArmory,
  onOpenEvolutionLab,
}) => {
  const {
    unlockedStuffies,
    clearedSectorIds,
    storyStepIndex,
    selectSector,
    armoryUnlocked,
    labUnlocked,
    fairyWellUnlocked,
    resetStoryMode,
  } = useStoryStore();

  const [selectedMission, setSelectedMission] = useState<StoryMission | null>(null);
  const [isFairyWellOpen, setIsFairyWellOpen] = useState(false);
  const [hoveredSector, setHoveredSector] = useState<StorySector | null>(null);

  const activeObjectiveStep = getCurrentStoryObjectiveStep(storyStepIndex);
  const activeObjectiveSectorId = activeObjectiveStep.sectorId;
  const isRevisitObjective = Boolean(activeObjectiveStep.isRevisit);
  const activeMainMission = getMissionForSector(activeObjectiveSectorId, storyStepIndex);
  const activeMainSector = getSectorById(activeObjectiveSectorId);

  // Available side quests: ONLY appear when the player has unlocked all required stuffies!
  const availableSideQuests = Object.values(STORY_MISSIONS).filter(
    (m) =>
      m.questType === 'side' &&
      (m.requiredSpeciesIds || []).every((id) => unlockedStuffies.includes(id))
  );

  const handleSectorClick = (sector: StorySector) => {
    sound.playClickSound();
    selectSector(sector.id);

    const mission = getMissionForSector(sector.id, storyStepIndex);
    if (mission) {
      if (
        mission.questType === 'side' &&
        !(mission.requiredSpeciesIds || []).every((id) => unlockedStuffies.includes(id))
      ) {
        sound.playUndoSound();
        return;
      }
      setSelectedMission(mission);
    }
  };

  const clearedCount = clearedSectorIds.length;
  const progressPercent = Math.round((clearedCount / TOTAL_SECTORS) * 100);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center p-3 md:p-6 select-none overflow-y-auto">
      {/* Top Header & Milestone Facility Hub */}
      <div className="w-full max-w-7xl flex flex-col gap-3 mb-4">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border-2 border-amber-500/60 p-4 rounded-3xl shadow-xl backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">👑</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-pixel text-[9px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                  v4.0 STORY MODE
                </span>
                <span className="font-pixel text-[9px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                  150-SECTOR WORLD MAP • TOUCHING SQUARES
                </span>
              </div>
              <h1 className="font-pixel text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-amber-400 font-extrabold tracking-wide mt-1">
                BEN&apos;S PLUSH ADVENTURE MAP
              </h1>
            </div>
          </div>

          {/* Quick Exit, Reset, & Progression badge */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex flex-col items-end mr-2">
              <span className="font-pixel text-xs text-yellow-300 font-bold">
                {clearedCount} / {TOTAL_SECTORS} Sectors ({progressPercent}%)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {unlockedStuffies.length} / 26 Plushies • Chapter {storyStepIndex + 1}
              </span>
            </div>

            <button
              onClick={() => {
                if (
                  typeof window !== 'undefined' &&
                  window.confirm(
                    'Are you sure you want to reset your Story Mode progress? This will reset all 150 sectors and unlocks back to the beginning with Jefe.'
                  )
                ) {
                  sound.playClickSound();
                  resetStoryMode();
                }
              }}
              className="font-pixel text-[10px] bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white py-2 px-3 rounded-2xl border border-rose-600/50 transition-all cursor-pointer shadow hover:scale-105 active:scale-95"
              title="Reset Story Mode progress to initial state"
            >
              🔄 RESET STORY
            </button>

            <button
              onClick={() => {
                sound.playClickSound();
                onBackToMenu();
              }}
              className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 px-4 rounded-2xl border border-slate-600 transition-all cursor-pointer shadow hover:scale-105 active:scale-95"
            >
              ✕ MAIN MENU
            </button>
          </div>
        </div>

        {/* Milestone Facilities Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. The Backyard (Always Accessible) */}
          <button
            onClick={() => {
              const backyardSector = STORY_SECTORS.find((s) => s.id === 3);
              if (backyardSector) handleSectorClick(backyardSector);
            }}
            className="group font-pixel text-xs bg-gradient-to-r from-emerald-950 to-green-950 hover:from-emerald-900 hover:to-green-900 text-emerald-300 hover:text-white p-3 rounded-2xl border-2 border-emerald-400/80 shadow-lg shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl group-hover:scale-125 transition-transform">🌳</span>
              <div className="text-left">
                <span className="font-extrabold block">THE BACKYARD</span>
                <span className="font-mono text-[9px] text-emerald-400/80">ALWAYS OPEN GRIND</span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400">➔</span>
          </button>

          {/* 2. Equipment Armory (1/16 Milestone) */}
          <button
            disabled={!armoryUnlocked}
            onClick={() => {
              sound.playClickSound();
              onOpenArmory();
            }}
            className={`font-pixel text-xs p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
              armoryUnlocked
                ? 'bg-gradient-to-r from-amber-950 to-yellow-950 hover:from-amber-900 hover:to-yellow-900 text-amber-300 hover:text-white border-amber-400/80 shadow-lg cursor-pointer hover:scale-105 active:scale-95'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{armoryUnlocked ? '🔨' : '🔒'}</span>
              <div className="text-left">
                <span className="font-extrabold block">ARMORY</span>
                <span className="font-mono text-[9px]">
                  {armoryUnlocked ? 'GEAR & ACCESSORIES' : 'UNLOCKS AT 1/16'}
                </span>
              </div>
            </div>
          </button>

          {/* 3. Evolution Lab (3/32 Milestone) */}
          <button
            disabled={!labUnlocked}
            onClick={() => {
              sound.playClickSound();
              onOpenEvolutionLab();
            }}
            className={`font-pixel text-xs p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
              labUnlocked
                ? 'bg-gradient-to-r from-purple-950 to-indigo-950 hover:from-purple-900 hover:to-indigo-900 text-purple-300 hover:text-white border-purple-400/80 shadow-lg cursor-pointer hover:scale-105 active:scale-95'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{labUnlocked ? '🔮' : '🔒'}</span>
              <div className="text-left">
                <span className="font-extrabold block">EVOLUTION LAB</span>
                <span className="font-mono text-[9px]">
                  {labUnlocked ? 'FUSE 10★ CARDS' : 'UNLOCKS AT 3/32'}
                </span>
              </div>
            </div>
          </button>

          {/* 4. Fairy Well (1/8 Milestone) */}
          <button
            disabled={!fairyWellUnlocked}
            onClick={() => {
              sound.playClickSound();
              setIsFairyWellOpen(true);
            }}
            className={`font-pixel text-xs p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
              fairyWellUnlocked
                ? 'bg-gradient-to-r from-teal-950 to-cyan-950 hover:from-teal-900 hover:to-cyan-900 text-cyan-300 hover:text-white border-cyan-400/80 shadow-lg cursor-pointer hover:scale-105 active:scale-95'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{fairyWellUnlocked ? '⛲' : '🔒'}</span>
              <div className="text-left">
                <span className="font-extrabold block">FAIRY WELL</span>
                <span className="font-mono text-[9px]">
                  {fairyWellUnlocked ? 'SACRIFICE FOR ESPERS' : 'UNLOCKS AT 1/8'}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Grid + Quest Side Indicator Container */}
      <div className="w-full max-w-7xl flex flex-col xl:flex-row gap-4 items-start justify-center">
        {/* The 150-Sector Map Grid (Touching Squares) */}
        <div className="flex-1 w-full bg-slate-950/90 border-2 border-slate-800 rounded-3xl p-3 md:p-6 shadow-2xl flex flex-col items-center">
          {/* Sector Hover Summary Banner */}
          <div className="w-full bg-slate-900/90 border border-slate-700 p-2.5 px-4 rounded-2xl mb-3 flex items-center justify-between text-xs min-h-[44px]">
            {hoveredSector ? (
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl drop-shadow">{hoveredSector.icon}</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="font-pixel text-yellow-300">
                      {hoveredSector.name} • Coord ({hoveredSector.x}, {hoveredSector.y}) • Rec Lv.{hoveredSector.recommendedLevel}
                    </strong>
                    {hoveredSector.id === activeObjectiveSectorId && (
                      <span className="bg-amber-950 text-amber-300 border border-amber-500/60 font-pixel text-[8px] px-1.5 py-0.5 rounded">
                        {isRevisitObjective ? '🔄 REVISIT QUEST' : '🎯 MAIN QUEST'}
                      </span>
                    )}
                    {(() => {
                      const hMission = getMissionForSector(hoveredSector.id, storyStepIndex);
                      const isHoveredSideQuestAvailable =
                        hMission?.questType === 'side' &&
                        (hMission.requiredSpeciesIds || []).every((id) => unlockedStuffies.includes(id));
                      return isHoveredSideQuestAvailable ? (
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-pixel text-[8px] px-1.5 py-0.5 rounded">
                          📜 SIDE QUEST
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <span className="font-sans text-[11px] text-slate-300">
                    {hoveredSector.description}
                  </span>
                </div>
              </div>
            ) : (
              <span className="font-pixel text-slate-400 text-[11px]">
                👉 CLICK ANY SECTOR ON THE MAP TO EMBARK! (🎯 = MAIN QUEST • 🔄 = REVISIT • 📜 = SIDE QUEST)
              </span>
            )}
          </div>

          {/* Region / Biome Cluster Ribbon */}
          <div className="w-full flex flex-wrap items-center justify-center gap-1.5 mb-2.5 text-[9px] font-pixel">
            <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/50">🏠 House</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">🌿 Backyard</span>
            <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-600/50">🏡 Necak&apos;s House</span>
            <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-600/50">🏢 Apartments</span>
            <span className="px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-600/50">🌲 Wild Forest</span>
            <span className="px-2 py-0.5 rounded bg-yellow-950/80 text-yellow-300 border border-yellow-600/50">🏖️ Beach</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-600/50">🌊 Ocean &amp; Upgel Didav</span>
            <span className="px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-600/50">🏘️ Suburb</span>
            <span className="px-2 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-600/50">🛝 Playground</span>
            <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-600/50">🌌 Astral Citadel</span>
          </div>

          {/* The 150-Sector Grid Map (Touching squares with contiguous clustered biomes) */}
          <div className="w-full overflow-x-auto p-1 flex justify-center">
            <div
              className="grid gap-0 border-2 border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl min-w-[720px] max-w-5xl w-full bg-slate-950"
              style={{
                gridTemplateColumns: `repeat(${SECTOR_GRID_WIDTH}, minmax(0, 1fr))`,
              }}
            >
              {STORY_SECTORS.map((sector) => {
                const isCleared = clearedSectorIds.includes(sector.id);
                const isObjective = sector.id === activeObjectiveSectorId;
                const mission = getMissionForSector(sector.id, storyStepIndex);
                const isSideQuest =
                  mission?.questType === 'side' &&
                  (mission.requiredSpeciesIds || []).every((id) => unlockedStuffies.includes(id));
                const isBackyard = sector.id === 3;
                const biomeBg = getBiomeBgClasses(sector.biome);

                return (
                  <button
                    key={sector.id}
                    onClick={() => handleSectorClick(sector)}
                    onMouseEnter={() => setHoveredSector(sector)}
                    onMouseLeave={() => setHoveredSector(null)}
                    className={`relative aspect-square border border-slate-800/60 flex flex-col items-center justify-center p-0.5 sm:p-1 transition-all cursor-pointer select-none group ${biomeBg} ${
                      isObjective
                        ? 'border-yellow-400 ring-2 ring-yellow-400 animate-pulse shadow-lg shadow-yellow-950 z-20 brightness-125'
                        : isSideQuest
                        ? 'border-emerald-400/90 ring-1 ring-emerald-400/60 hover:brightness-125 z-10'
                        : isBackyard
                        ? 'border-emerald-400/80 hover:brightness-125 z-10'
                        : isCleared
                        ? 'border-emerald-600/50 hover:brightness-125 hover:z-10'
                        : 'hover:brightness-125 hover:z-10'
                    }`}
                    title={`${sector.name} (Lv.${sector.recommendedLevel})`}
                  >
                    {/* Sector Coordinate/ID Badge */}
                    <span className="absolute top-0.5 left-1 font-mono text-[7px] sm:text-[8px] md:text-[9px] text-slate-300 group-hover:text-white drop-shadow">
                      {sector.id}
                    </span>

                    {/* Level badge */}
                    <span className="absolute bottom-0.5 left-1 font-mono text-[6px] sm:text-[7px] md:text-[8px] text-slate-300 drop-shadow">
                      L{sector.recommendedLevel}
                    </span>

                    {/* Main Icon */}
                    <span className="text-sm sm:text-base md:text-xl my-auto drop-shadow-md group-hover:scale-110 transition-transform">
                      {sector.icon}
                    </span>

                    {/* Cleared Checkmark */}
                    {isCleared && (
                      <span className="absolute bottom-0.5 right-1 text-[8px] md:text-[9px] font-pixel text-emerald-400 font-bold drop-shadow">
                        ✓
                      </span>
                    )}

                    {/* Quest Indicator Badge (Top Right) */}
                    {isObjective ? (
                      <span
                        className="absolute -top-1 -right-1 text-xs animate-bounce z-30 drop-shadow"
                        title={isRevisitObjective ? 'Active Revisit Quest' : 'Active Main Story Quest'}
                      >
                        {isRevisitObjective ? '🔄' : '🎯'}
                      </span>
                    ) : isSideQuest ? (
                      <span
                        className="absolute -top-1 -right-1 text-[11px] z-30 drop-shadow"
                        title="Available Side Quest"
                      >
                        📜
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SIDE QUEST & MAIN QUEST INDICATOR PANEL */}
        <div className="w-full xl:w-80 bg-slate-900/95 border-2 border-amber-500/60 rounded-3xl p-4 shadow-2xl flex flex-col gap-3.5 backdrop-blur">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">📜</span>
              <h3 className="font-pixel text-xs text-yellow-300 font-bold tracking-wide">
                QUEST TRACKER
              </h3>
            </div>
            <span className="font-pixel text-[9px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              CH. {storyStepIndex + 1}/63
            </span>
          </div>

          {/* 1. Active Main Story Quest */}
          <div className="bg-gradient-to-b from-amber-950/80 to-slate-950 border border-amber-400/80 rounded-2xl p-3 flex flex-col gap-2 shadow-lg shadow-amber-950/50">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[9px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>{isRevisitObjective ? '🔄' : '🎯'}</span> {isRevisitObjective ? 'REVISIT QUEST' : 'MAIN QUEST'}
              </span>
              <span className="font-mono text-[9px] text-amber-300">
                Sector {activeObjectiveSectorId}
              </span>
            </div>

            {activeMainMission ? (
              <div className="flex flex-col gap-1.5">
                <h4 className="font-pixel text-xs text-white font-bold leading-tight">
                  {activeMainMission.title}
                </h4>
                <p className="text-[11px] text-slate-300 leading-snug font-sans">
                  {activeMainMission.synopsis}
                </p>

                {activeMainSector && (
                  <div className="flex items-center gap-2 text-[10px] text-amber-200/90 font-mono mt-1">
                    <span>{activeMainSector.icon} {activeMainSector.name}</span>
                    <span>•</span>
                    <span>Lv.{activeMainSector.recommendedLevel}</span>
                  </div>
                )}

                {activeObjectiveStep.unlockStuffySpeciesId && (
                  <div className="flex items-center gap-1.5 bg-yellow-950/60 border border-yellow-500/40 px-2 py-1 rounded-xl text-[10px] text-yellow-300 font-pixel mt-1">
                    <span>✨</span>
                    <span>RESCUES: {activeObjectiveStep.unlockStuffySpeciesId.toUpperCase()}!</span>
                  </div>
                )}

                <button
                  onClick={() => activeMainSector && handleSectorClick(activeMainSector)}
                  className="mt-1 w-full font-pixel text-[10px] bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer shadow hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>🚀</span>
                  <span>VIEW MISSION</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400">All Main Quests Completed!</p>
            )}
          </div>

          {/* 2. Side Quests List */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span>📜</span> AVAILABLE SIDE QUESTS ({availableSideQuests.length})
              </span>
            </div>

            {availableSideQuests.length === 0 ? (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center text-slate-500 text-[11px]">
                <span>No side quests available right now. Unlock required plushies to discover new side quests!</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {availableSideQuests.map((sideMission) => {
                  const sideSector = getSectorById(sideMission.sectorId);
                  return (
                    <div
                      key={sideMission.id}
                      onClick={() => sideSector && handleSectorClick(sideSector)}
                      className="bg-slate-950/80 hover:bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 p-2.5 rounded-xl flex flex-col gap-1 cursor-pointer transition-all hover:scale-[1.02] shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-[10px] text-emerald-300 font-bold truncate">
                          {sideMission.title}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400">
                          Sec {sideMission.sectorId}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                        {sideMission.synopsis}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mission Embark Modal */}
      {selectedMission && (
        <StoryMissionModal
          isOpen={Boolean(selectedMission)}
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
          onEmbark={(mission, selectedTeam) => {
            setSelectedMission(null);
            onEmbarkMission(mission, selectedTeam);
          }}
        />
      )}

      {/* Story Dialogue Modal */}
      <StoryDialogueModal />

      {/* Fairy Well Modal */}
      {isFairyWellOpen && (
        <FairyWellModal
          isOpen={isFairyWellOpen}
          onClose={() => setIsFairyWellOpen(false)}
        />
      )}
    </div>
  );
};
