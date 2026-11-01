'use client';

import React, { useState } from 'react';
import {
  STORY_SECTORS,
  SECTOR_GRID_WIDTH,
  SECTOR_GRID_HEIGHT,
  getCurrentStoryObjectiveSectorId,
  getSectorById,
} from '@/data/storySectors';
import { getMissionForSector, STORY_MISSIONS } from '@/data/storyMissions';
import { useStoryStore } from '@/store/storyStore';
import { StoryMissionModal } from './StoryMissionModal';
import { StoryDialogueModal } from './StoryDialogueModal';
import { FairyWellModal } from './FairyWellModal';
import { StoryMission, StorySector } from '@/types/story';
import { sound } from '@/utils/audio';

interface StorySectorGridProps {
  onBackToMenu: () => void;
  onEmbarkMission: (mission: StoryMission, selectedTeamSpeciesIds?: string[]) => void;
  onOpenArmory: () => void;
  onOpenEvolutionLab: () => void;
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
    selectSector,
    armoryUnlocked,
    labUnlocked,
    fairyWellUnlocked,
  } = useStoryStore();

  const [selectedMission, setSelectedMission] = useState<StoryMission | null>(null);
  const [isFairyWellOpen, setIsFairyWellOpen] = useState(false);
  const [hoveredSector, setHoveredSector] = useState<StorySector | null>(null);

  const activeObjectiveSectorId = getCurrentStoryObjectiveSectorId(clearedSectorIds);
  const activeMainMission = getMissionForSector(activeObjectiveSectorId);
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

    const mission = getMissionForSector(sector.id);
    if (mission) {
      // Side quests only appear and open once all required stuffies are rescued
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
  const progressPercent = Math.round((clearedCount / 100) * 100);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center p-3 md:p-6 select-none overflow-y-auto">
      {/* Top Header & Milestone Facility Hub */}
      <div className="w-full max-w-7xl flex flex-col gap-3 mb-4">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border-2 border-amber-500/60 p-4 rounded-3xl shadow-xl backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">👑</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[9px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                  v4.0 STORY MODE
                </span>
                <span className="font-pixel text-[9px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                  10x10 SECTOR GRID • FREE EXPLORATION
                </span>
              </div>
              <h1 className="font-pixel text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-amber-400 font-extrabold tracking-wide mt-1">
                BEN&apos;S PLUSH ADVENTURE MAP
              </h1>
            </div>
          </div>

          {/* Quick Exit & Progression badge */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end mr-2">
              <span className="font-pixel text-xs text-yellow-300 font-bold">
                {clearedCount} / 100 Sectors ({progressPercent}%)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {unlockedStuffies.length} / 27 Stuffies Unlocked
              </span>
            </div>

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
              <span className="text-xl">{armoryUnlocked ? '🧰' : '🔒'}</span>
              <div className="text-left">
                <span className="font-extrabold block">ARMORY</span>
                <span className="font-mono text-[9px]">
                  {armoryUnlocked ? 'EQUIPMENT UNLOCKED' : 'UNLOCKS AT 1/16'}
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
                ? 'bg-gradient-to-r from-fuchsia-950 to-purple-950 hover:from-fuchsia-900 hover:to-purple-900 text-fuchsia-300 hover:text-white border-fuchsia-400/80 shadow-lg cursor-pointer hover:scale-105 active:scale-95'
                : 'bg-slate-900/60 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{labUnlocked ? '🔬' : '🔒'}</span>
              <div className="text-left">
                <span className="font-extrabold block">EVOLUTION LAB</span>
                <span className="font-mono text-[9px]">
                  {labUnlocked ? '10★ MERGE UNLOCKED' : 'UNLOCKS AT 3/32'}
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
        {/* 10x10 Sector Grid Map */}
        <div className="flex-1 w-full bg-slate-950/90 border-2 border-slate-800 rounded-3xl p-3 md:p-6 shadow-2xl flex flex-col items-center">
          {/* Sector Hover Summary Banner */}
          <div className="w-full bg-slate-900/90 border border-slate-700 p-2.5 px-4 rounded-2xl mb-3 flex items-center justify-between text-xs min-h-[44px]">
            {hoveredSector ? (
              <div className="flex items-center gap-3">
                <span className="text-xl">{hoveredSector.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-pixel text-yellow-300">
                      {hoveredSector.name} • Coord ({hoveredSector.x}, {hoveredSector.y}) • Rec Lv.{hoveredSector.recommendedLevel}
                    </strong>
                    {hoveredSector.id === activeObjectiveSectorId && (
                      <span className="bg-amber-950 text-amber-300 border border-amber-500/60 font-pixel text-[8px] px-1.5 py-0.5 rounded">
                        🎯 MAIN QUEST
                      </span>
                    )}
                    {(() => {
                      const hMission = getMissionForSector(hoveredSector.id);
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
                👉 CLICK ANY SECTOR ON THE 10x10 GRID TO EMBARK! (🎯 = MAIN QUEST • 📜 = SIDE QUEST)
              </span>
            )}
          </div>

          {/* The 10x10 Grid container (Free exploration: all sectors clickable) */}
          <div className="grid grid-cols-10 gap-1.5 md:gap-2.5 w-full max-w-5xl">
            {STORY_SECTORS.map((sector) => {
              const isCleared = clearedSectorIds.includes(sector.id);
              const isObjective = sector.id === activeObjectiveSectorId;
              const mission = getMissionForSector(sector.id);
              const isSideQuest =
                mission?.questType === 'side' &&
                (mission.requiredSpeciesIds || []).every((id) => unlockedStuffies.includes(id));
              const isBackyard = sector.id === 3;

              return (
                <button
                  key={sector.id}
                  onClick={() => handleSectorClick(sector)}
                  onMouseEnter={() => setHoveredSector(sector)}
                  onMouseLeave={() => setHoveredSector(null)}
                  className={`relative aspect-square rounded-xl md:rounded-2xl border flex flex-col items-center justify-center p-1 transition-all cursor-pointer select-none group ${
                    isObjective
                      ? 'border-yellow-400 bg-gradient-to-b from-amber-950 to-slate-900 ring-2 ring-yellow-400 animate-pulse shadow-lg shadow-yellow-950'
                      : isSideQuest
                      ? 'border-emerald-400/90 bg-emerald-950/60 hover:border-emerald-300 hover:scale-105 shadow'
                      : isBackyard
                      ? 'border-emerald-400 bg-emerald-950/70 hover:scale-105 shadow'
                      : isCleared
                      ? 'border-emerald-600/70 bg-slate-900/80 hover:border-emerald-400 hover:scale-105'
                      : 'border-slate-700/60 bg-slate-900/90 hover:scale-105 hover:border-cyan-300 shadow'
                  }`}
                  title={`${sector.name} (Lv.${sector.recommendedLevel})`}
                >
                  {/* Sector Coordinate/ID Badge */}
                  <span className="absolute top-1 left-1.5 font-mono text-[8px] md:text-[9px] text-slate-400 group-hover:text-white">
                    {sector.id}
                  </span>

                  {/* Level badge */}
                  <span className="absolute bottom-1 left-1.5 font-mono text-[7px] md:text-[8px] text-slate-400">
                    L{sector.recommendedLevel}
                  </span>

                  {/* Main Icon */}
                  <span className="text-base md:text-xl my-auto">
                    {sector.icon}
                  </span>

                  {/* Cleared Checkmark */}
                  {isCleared && (
                    <span className="absolute bottom-1 right-1.5 text-[9px] font-pixel text-emerald-400 font-bold">
                      ✓
                    </span>
                  )}

                  {/* Quest Indicator Badge (Top Right) */}
                  {isObjective ? (
                    <span
                      className="absolute -top-1 -right-1 text-xs animate-bounce"
                      title="Active Main Story Quest"
                    >
                      🎯
                    </span>
                  ) : isSideQuest ? (
                    <span
                      className="absolute -top-1 -right-1 text-[11px]"
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
              SECTORS
            </span>
          </div>

          {/* 1. Active Main Story Quest */}
          <div className="bg-gradient-to-b from-amber-950/80 to-slate-950 border border-amber-400/80 rounded-2xl p-3 flex flex-col gap-2 shadow-lg shadow-amber-950/50">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[9px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>🎯</span> MAIN QUEST
              </span>
              <span className="font-mono text-[9px] text-amber-300">
                SECTOR {activeObjectiveSectorId}
              </span>
            </div>

            <h4 className="font-pixel text-xs text-yellow-300 font-bold truncate">
              {activeMainMission?.title || activeMainSector?.name || `Sector ${activeObjectiveSectorId}`}
            </h4>

            <p className="font-sans text-[11px] text-slate-300 line-clamp-2">
              {activeMainMission?.synopsis || activeMainSector?.description}
            </p>

            {/* Required Plushies Badge */}
            {activeMainMission?.requiredSpeciesIds && activeMainMission.requiredSpeciesIds.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-pixel text-[8px] text-amber-400">REQUIRES:</span>
                {activeMainMission.requiredSpeciesIds.map((id) => (
                  <span
                    key={id}
                    className="font-pixel text-[8px] bg-amber-950 border border-amber-500/50 text-amber-200 px-1.5 py-0.2 rounded uppercase"
                  >
                    {id}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                if (activeMainSector) handleSectorClick(activeMainSector);
              }}
              className="mt-1 font-pixel text-[10px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-3 rounded-xl transition-all cursor-pointer shadow hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-1"
            >
              <span>📍</span>
              <span>VIEW MAIN QUEST</span>
            </button>
          </div>

          {/* 2. Available Side Quests List */}
          <div className="flex flex-col gap-2">
            <span className="font-pixel text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <span>📜</span> SIDE QUESTS AVAILABLE ({availableSideQuests.length}):
            </span>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {availableSideQuests.length === 0 ? (
                <div className="p-3 rounded-xl border border-dashed border-slate-700 text-center text-slate-400 font-sans text-xs">
                  Rescue more plushies across main story missions to discover secret side quests!
                </div>
              ) : (
                availableSideQuests.map((sq) => {
                  const sqSector = getSectorById(sq.sectorId);
                  const isCleared = clearedSectorIds.includes(sq.sectorId);

                  return (
                    <div
                      key={sq.id}
                      onClick={() => {
                        if (sqSector) handleSectorClick(sqSector);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col gap-1 ${
                        isCleared
                          ? 'bg-slate-950/60 border-slate-800 opacity-70'
                          : 'bg-slate-950 border-emerald-500/50 hover:border-emerald-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{sqSector?.icon || '📜'}</span>
                          <strong className="font-pixel text-[9px] text-emerald-300 group-hover:text-white truncate max-w-[170px]">
                            {sq.title}
                          </strong>
                        </div>
                        <span className="font-mono text-[8px] text-slate-400">
                          SEC {sq.sectorId}
                        </span>
                      </div>

                      <p className="font-sans text-[10px] text-slate-300 line-clamp-1">
                        {sq.synopsis}
                      </p>

                      <div className="flex items-center justify-between text-[8px] font-mono text-slate-400 pt-0.5">
                        <span>REC LV.{sq.recommendedLevel}</span>
                        <span className="text-emerald-400 font-pixel">
                          {isCleared ? '✓ CLEARED' : 'CLICK TO VIEW ➔'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mission Briefing Modal */}
      {selectedMission && (
        <StoryMissionModal
          mission={selectedMission}
          isOpen={true}
          onClose={() => setSelectedMission(null)}
          onEmbark={(mission, squad) => {
            setSelectedMission(null);
            onEmbarkMission(mission, squad);
          }}
        />
      )}

      {/* Interactive Dialogue Modal */}
      <StoryDialogueModal />

      {/* Fairy Well Modal */}
      <FairyWellModal
        isOpen={isFairyWellOpen}
        onClose={() => setIsFairyWellOpen(false)}
      />
    </div>
  );
};
