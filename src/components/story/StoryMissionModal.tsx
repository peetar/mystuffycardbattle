'use client';

import React, { useState } from 'react';
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
  onEmbark: (mission: StoryMission, selectedTeamSpeciesIds: string[]) => void;
}

export const StoryMissionModal: React.FC<StoryMissionModalProps> = ({
  mission,
  isOpen,
  onClose,
  onEmbark,
}) => {
  const { unlockedStuffies } = useStoryStore();

  // Mandatory story stuffies that are locked into the squad for this mission
  const mandatoryStuffies =
    mission.requiredSpeciesIds && mission.requiredSpeciesIds.length > 0
      ? mission.requiredSpeciesIds
      : ['jefe']; // Jefe is the story leader locked into story missions

  const [selectedSquad, setSelectedSquad] = useState<string[]>(() => {
    if (unlockedStuffies.length <= 5) {
      return [...unlockedStuffies];
    }
    const squad = [...mandatoryStuffies.filter((id) => unlockedStuffies.includes(id))];
    for (const id of unlockedStuffies) {
      if (squad.length >= 5) break;
      if (!squad.includes(id)) squad.push(id);
    }
    return squad;
  });

  if (!isOpen) return null;

  const sector = getSectorById(mission.sectorId);
  const scaling = computeUnderStrengthScaling(selectedSquad.length);
  const isUnderStrength = selectedSquad.length < 5;

  const toggleStuffyInSquad = (speciesId: string) => {
    sound.playClickSound();
    if (mandatoryStuffies.includes(speciesId)) return; // Locked by story requirement!

    if (selectedSquad.includes(speciesId)) {
      if (selectedSquad.length <= 1) return; // Keep at least 1
      setSelectedSquad(selectedSquad.filter((id) => id !== speciesId));
    } else {
      if (selectedSquad.length >= 5) {
        // Swap out the last non-mandatory stuffy
        const nonMandatoryIndex = selectedSquad.map((id, idx) => ({ id, idx }))
          .filter((item) => !mandatoryStuffies.includes(item.id))
          .pop();
        if (nonMandatoryIndex !== undefined) {
          const next = [...selectedSquad];
          next[nonMandatoryIndex.idx] = speciesId;
          setSelectedSquad(next);
        }
      } else {
        setSelectedSquad([...selectedSquad, speciesId]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none animate-fadeIn">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-2 border-amber-400/90 rounded-3xl p-5 md:p-7 shadow-2xl shadow-amber-950/80 flex flex-col gap-4 text-white animate-scale-in max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{sector?.icon || '📍'}</span>
            <div>
              <span className="font-pixel text-[10px] text-amber-300 bg-amber-950/90 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                SECTOR {mission.sectorId} • COORD ({sector?.x}, {sector?.y}) • REC LV.{sector?.recommendedLevel ?? mission.recommendedLevel}
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
            <span className="text-red-400 font-bold">5 Enemies (Full)</span>
          </div>
        </div>

        {/* Active Squad Builder */}
        <div className="flex flex-col gap-2 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
              <span>👥</span>
              <span>DEPLOYED SQUAD ({selectedSquad.length} / 5 STUFFIES):</span>
            </span>
            <span className="font-pixel text-[10px] text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40">
              {isUnderStrength ? 'AUTO-FIELDED (ALL AVAILABLE)' : 'FULL SQUAD (CUSTOMIZABLE)'}
            </span>
          </div>

          {/* Active 5 slots */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {selectedSquad.map((speciesId) => {
              const sp = STUFFY_MAP.get(speciesId);
              const isLocked = mandatoryStuffies.includes(speciesId);

              return (
                <div
                  key={speciesId}
                  onClick={() => toggleStuffyInSquad(speciesId)}
                  className={`relative flex flex-col items-center bg-slate-950 p-2 rounded-xl border transition-all cursor-pointer min-w-[72px] ${
                    isLocked
                      ? 'border-amber-400/80 shadow shadow-amber-900/50'
                      : 'border-cyan-500/60 hover:border-red-400 hover:scale-105'
                  }`}
                  title={isLocked ? 'Mandatory story character (locked in squad)' : 'Click to remove/swap'}
                >
                  {isLocked && (
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold shadow">
                      🔒
                    </span>
                  )}
                  <div className="w-10 h-10 flex items-center justify-center">
                    {sp && (
                      <StuffySprite
                        stuffy={{
                          instanceId: `modal_${sp.id}`,
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

            {/* Empty locked slots if player has < 5 stuffies total */}
            {Array.from({ length: 5 - selectedSquad.length }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center bg-slate-950/40 p-2 rounded-xl border border-dashed border-slate-800 min-w-[72px] h-[72px] text-slate-600 font-pixel text-[8px]"
              >
                <span>🔒</span>
                <span>EMPTY</span>
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
                  Because you have {selectedSquad.length} stuffies, the 5-member enemy squad is dynamically down-scaled!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Unlocked Bench Plushies (when > 5 stuffies available) */}
        {unlockedStuffies.length > 5 && (
          <div className="flex flex-col gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="font-pixel text-[10px] text-slate-400">
              RESERVE PLUSHIES (CLICK TO SWAP INTO ACTIVE SQUAD):
            </span>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {unlockedStuffies
                .filter((id) => !selectedSquad.includes(id))
                .map((speciesId) => {
                  const sp = STUFFY_MAP.get(speciesId);
                  return (
                    <button
                      key={speciesId}
                      onClick={() => toggleStuffyInSquad(speciesId)}
                      className="flex flex-col items-center bg-slate-950/80 hover:bg-slate-900 p-2 rounded-xl border border-slate-700 hover:border-yellow-400 transition-all cursor-pointer min-w-[65px]"
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        {sp && (
                          <StuffySprite
                            stuffy={{
                              instanceId: `bench_${sp.id}`,
                              speciesId: sp.id,
                              name: sp.name,
                              maxHp: sp.baseHp,
                              currentHp: sp.baseHp,
                              shield: 0,
                              isUnstuffed: false,
                              statusEffects: [],
                            }}
                            size={30}
                          />
                        )}
                      </div>
                      <span className="font-pixel text-[8px] text-slate-300 truncate max-w-[55px] mt-1">
                        {sp?.name || speciesId}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Rescued Stuffy Reward Banner */}
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
              onEmbark(mission, selectedSquad);
            }}
            className="flex-1 font-pixel text-xs bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold py-3 rounded-2xl border-2 border-yellow-200 shadow-xl shadow-yellow-600/40 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 animate-pulse"
          >
            <span>⚔️</span>
            <span>EMBARK ({selectedSquad.length} PLUSHIES)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
