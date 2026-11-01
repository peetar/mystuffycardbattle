'use client';

import React, { useState } from 'react';
import {
  STORY_SECTORS,
  SECTOR_GRID_WIDTH,
  SECTOR_GRID_HEIGHT,
  getCurrentStoryObjectiveSectorId,
} from '@/data/storySectors';
import { getMissionForSector } from '@/data/storyMissions';
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

  const handleSectorClick = (sector: StorySector) => {
    sound.playClickSound();
    selectSector(sector.id);

    const mission = getMissionForSector(sector.id);
    if (mission) {
      setSelectedMission(mission);
    }
  };

  const clearedCount = clearedSectorIds.length;
  const progressPercent = Math.round((clearedCount / 100) * 100);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center p-3 md:p-6 select-none overflow-y-auto">
      {/* Top Header & Milestone Facility Hub */}
      <div className="w-full max-w-6xl flex flex-col gap-3 mb-4">
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

      {/* 10x10 Sector Grid Map */}
      <div className="w-full max-w-6xl bg-slate-950/90 border-2 border-slate-800 rounded-3xl p-3 md:p-6 shadow-2xl flex flex-col items-center">
        {/* Sector Hover Summary Banner */}
        <div className="w-full bg-slate-900/90 border border-slate-700 p-2.5 px-4 rounded-2xl mb-3 flex items-center justify-between text-xs min-h-[42px]">
          {hoveredSector ? (
            <div className="flex items-center gap-3">
              <span className="text-xl">{hoveredSector.icon}</span>
              <div>
                <strong className="font-pixel text-yellow-300 block">
                  {hoveredSector.name} • Coord ({hoveredSector.x}, {hoveredSector.y}) • Rec Lv.{hoveredSector.recommendedLevel}
                  {hoveredSector.id === activeObjectiveSectorId && (
                    <span className="text-amber-400 ml-2 font-mono text-[10px]">🎯 CURRENT STORY OBJECTIVE</span>
                  )}
                </strong>
                <span className="font-sans text-[11px] text-slate-300">
                  {hoveredSector.description}
                </span>
              </div>
            </div>
          ) : (
            <span className="font-pixel text-slate-400 text-[11px]">
              👉 CLICK ANY OF THE 100 SECTORS ON THE 10x10 GRID TO EMBARK! (🎯 = ACTIVE STORY OBJECTIVE)
            </span>
          )}
        </div>

        {/* The 10x10 Grid container (Free exploration: all sectors clickable) */}
        <div className="grid grid-cols-10 gap-1.5 md:gap-2.5 w-full max-w-5xl">
          {STORY_SECTORS.map((sector) => {
            const isCleared = clearedSectorIds.includes(sector.id);
            const isObjective = sector.id === activeObjectiveSectorId;
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

                {/* Subtle Story Objective Icon on tile */}
                {isObjective && (
                  <span className="absolute -top-1 -right-1 text-xs animate-bounce" title="Current Story Objective">
                    🎯
                  </span>
                )}
              </button>
            );
          })}
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
