'use client';

import React from 'react';
import { StoryMission } from '@/types/story';
import { getSectorById } from '@/data/storySectors';
import { STUFFY_MAP } from '@/data/stuffies';
import { StuffySprite } from '@/components/battle/StuffySprite';
import { useStoryStore, computeUnderStrengthScaling } from '@/store/storyStore';
import { sound } from '@/utils/audio';

interface StoryMissionModalProps {
  mission: StoryMission;
  isOpen: boolean;
  onClose: () => void;
  onEmbark: (mission: StoryMission) => void;
}

export const StoryMissionModal: React.FC<StoryMissionModalProps> = ({
  mission,
  isOpen,
  onClose,
  onEmbark,
}) => {
  const { unlockedStuffies } = useStoryStore();

  if (!isOpen) return null;

  const sector = getSectorById(mission.sectorId);
  const playerTeamSpeciesIds = unlockedStuffies.slice(0, 5);
  const scaling = computeUnderStrengthScaling(playerTeamSpeciesIds.length);
  const isUnderStrength = playerTeamSpeciesIds.length < 5;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none animate-fadeIn">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-2 border-amber-400/90 rounded-3xl p-5 md:p-7 shadow-2xl shadow-amber-950/80 flex flex-col gap-4 text-white animate-scale-in max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{sector?.icon || '📍'}</span>
            <div>
              <span className="font-pixel text-[10px] text-amber-300 bg-amber-950/90 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                SECTOR {mission.sectorId} • COORD ({sector?.x}, {sector?.y})
              </span>
              <h2 className="font-pixel text-lg md:text-xl text-yellow-300 font-extrabold mt-1">
                {mission.title}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClickSound();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer font-pixel text-xs"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Synopsis */}
        <p className="font-sans text-xs md:text-sm text-slate-300 leading-relaxed bg-black/40 p-3 rounded-2xl border border-slate-800">
          {mission.synopsis}
        </p>

        {/* Mission Specs: Acts & Floors */}
        <div className="grid grid-cols-3 gap-2.5 text-center font-pixel text-xs">
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block">ACTS</span>
            <span className="text-yellow-300 font-bold">{mission.totalActs} Acts</span>
          </div>
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block">TOTAL FLOORS</span>
            <span className="text-cyan-300 font-bold">{mission.totalFloors} Floors</span>
          </div>
          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700">
            <span className="text-[9px] text-slate-400 block">ENEMY SQUAD</span>
            <span className="text-red-400 font-bold">5 Enemies</span>
          </div>
        </div>

        {/* Player Squad & Under-Strength Rule */}
        <div className="flex flex-col gap-2 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
              <span>👥</span>
              <span>YOUR STORY SQUAD ({playerTeamSpeciesIds.length} / 5 STUFFIES):</span>
            </span>
            <span className="font-pixel text-[10px] text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40">
              {isUnderStrength ? 'AUTO-FIELDED (ALL AVAILABLE)' : 'FULL SQUAD'}
            </span>
          </div>

          {/* Stuffy Avatars */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {playerTeamSpeciesIds.map((speciesId) => {
              const sp = STUFFY_MAP.get(speciesId);
              return (
                <div
                  key={speciesId}
                  className="flex flex-col items-center bg-slate-950 p-2 rounded-xl border border-cyan-500/40 min-w-[70px]"
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    {sp && (
                      <StuffySprite
                        stuffy={{
                          instanceId: `mission_${sp.id}`,
                          speciesId: sp.id,
                          name: sp.name,
                          maxHp: sp.baseHp,
                          currentHp: sp.baseHp,
                          shield: 0,
                          isUnstuffed: false,
                          statusEffects: [],
                        }}
                        size={38}
                      />
                    )}
                  </div>
                  <span className="font-pixel text-[9px] text-yellow-300 truncate max-w-[65px] mt-1">
                    {sp?.name || speciesId}
                  </span>
                </div>
              );
            })}

            {/* Empty slots indicator if < 5 */}
            {Array.from({ length: 5 - playerTeamSpeciesIds.length }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center bg-slate-950/40 p-2 rounded-xl border border-dashed border-slate-800 min-w-[70px] h-[72px] text-slate-600 font-pixel text-[8px]"
              >
                <span>🔒</span>
                <span>LOCKED</span>
              </div>
            ))}
          </div>

          {/* Under-strength scaling banner */}
          {isUnderStrength && (
            <div className="bg-emerald-950/70 border border-emerald-500/50 p-2.5 rounded-xl text-emerald-200 text-[11px] font-mono flex items-center gap-2 mt-1">
              <span className="text-base">⚖️</span>
              <div>
                <strong className="font-pixel text-[10px] text-emerald-300 block">
                  {scaling.description}
                </strong>
                <span>
                  Because you have {playerTeamSpeciesIds.length} stuffies, the 5-member enemy team is dynamically scaled down!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Rescued Stuffy / Rewards preview */}
        {mission.unlockStuffySpeciesId && (
          <div className="bg-amber-950/50 border border-amber-500/50 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧸</span>
              <div>
                <span className="font-pixel text-[10px] text-amber-300 uppercase font-bold block">
                  MISSION REWARD: RESCUE NEW PLUSH
                </span>
                <span className="font-sans text-xs text-slate-200">
                  Defeat this sector to recruit{' '}
                  <strong className="text-yellow-300">
                    {STUFFY_MAP.get(mission.unlockStuffySpeciesId)?.name}
                  </strong>{' '}
                  into your team!
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Embark Button */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => {
              sound.playClickSound();
              onClose();
            }}
            className="flex-1 font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl border border-slate-600 transition-all cursor-pointer"
          >
            RETURN TO SECTOR MAP
          </button>

          <button
            onClick={() => {
              sound.playClickSound();
              onEmbark(mission);
            }}
            className="flex-1 font-pixel text-xs bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold py-3 rounded-2xl border-2 border-yellow-200 shadow-xl shadow-yellow-600/40 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 animate-pulse"
          >
            <span>⚔️</span>
            <span>EMBARK (START MISSION)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
