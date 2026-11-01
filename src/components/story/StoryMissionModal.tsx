'use client';

import React, { useState, useEffect } from 'react';
import { StoryMission, StoryDraftSelection } from '@/types/story';
import { getSectorById } from '@/data/storySectors';
import { STUFFY_MAP } from '@/data/stuffies';
import { getLoadoutsForStuffy } from '@/data/loadouts';
import { CARD_MAP } from '@/data/cards';
import { StuffySprite } from '@/components/battle/StuffySprite';
import { CardView, TIER_COLORS } from '@/components/battle/CardView';
import { Card, LoadoutPackage, StuffySpecies } from '@/types/game';
import { useStoryStore, computeUnderStrengthScaling } from '@/store/storyStore';
import { getAllCampaignPresets, CampaignPreset } from '@/data/campaignPresets';
import { sound } from '@/utils/audio';

interface StoryMissionModalProps {
  mission: StoryMission;
  isOpen: boolean;
  onClose: () => void;
  onEmbark: (mission: StoryMission, selectedSquad: StoryDraftSelection[]) => void;
}

export const StoryMissionModal: React.FC<StoryMissionModalProps> = ({
  mission,
  isOpen,
  onClose,
  onEmbark,
}) => {
  const { unlockedStuffies } = useStoryStore();

  // Required stuffies strictly defined by the mission
  const requiredSpeciesIds = mission.requiredSpeciesIds || [];

  // Squad selection stores { speciesId, loadoutId }
  const [selectedSquad, setSelectedSquad] = useState<StoryDraftSelection[]>([]);
  const [currentPickingSpecies, setCurrentPickingSpecies] = useState<StuffySpecies | null>(null);
  const [inspectingLoadout, setInspectingLoadout] = useState<LoadoutPackage | null>(null);
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);

  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [presets, setPresets] = useState<CampaignPreset[]>([]);

  useEffect(() => {
    setPresets(getAllCampaignPresets());
  }, []);

  if (!isOpen) return null;

  const sector = getSectorById(mission.sectorId);
  const missingRequired = requiredSpeciesIds.filter(
    (id) => !selectedSquad.some((item) => item.speciesId === id)
  );
  const canEmbark = missingRequired.length === 0 && selectedSquad.length > 0;
  const scaling = computeUnderStrengthScaling(Math.max(1, selectedSquad.length));
  const isUnderStrength = selectedSquad.length > 0 && selectedSquad.length < 5;

  const handleSelectStuffyForDraft = (speciesId: string) => {
    sound.playClickSound();
    const sp = STUFFY_MAP.get(speciesId);
    if (!sp) return;

    const existing = selectedSquad.find((item) => item.speciesId === speciesId);
    const loadouts = getLoadoutsForStuffy(speciesId);

    if (existing) {
      // Inspect / switch between the 3 choices for this existing squad member
      const currentLoadout = loadouts.find((l) => l.id === existing.loadoutId) || loadouts[0];
      setCurrentPickingSpecies(sp);
      setInspectingLoadout(currentLoadout || null);
    } else {
      if (selectedSquad.length >= 5) {
        sound.playUndoSound();
        return;
      }
      // Draft pick: open the 3 choices!
      setCurrentPickingSpecies(sp);
      setInspectingLoadout(loadouts[0] || null);
    }
  };

  const handleConfirmLoadoutPick = (loadout: LoadoutPackage) => {
    if (!currentPickingSpecies) return;
    sound.playRewardSound();

    const existingIndex = selectedSquad.findIndex(
      (item) => item.speciesId === currentPickingSpecies.id
    );

    if (existingIndex !== -1) {
      const updated = [...selectedSquad];
      updated[existingIndex] = {
        speciesId: currentPickingSpecies.id,
        loadoutId: loadout.id,
      };
      setSelectedSquad(updated);
    } else {
      if (selectedSquad.length >= 5) {
        sound.playUndoSound();
        return;
      }
      setSelectedSquad([
        ...selectedSquad,
        {
          speciesId: currentPickingSpecies.id,
          loadoutId: loadout.id,
        },
      ]);
    }

    setCurrentPickingSpecies(null);
    setInspectingLoadout(null);
  };

  const removeStuffyFromSquad = (speciesId: string) => {
    sound.playClickSound();
    setSelectedSquad(selectedSquad.filter((item) => item.speciesId !== speciesId));
  };

  const moveStuffyOrder = (index: number, direction: 'left' | 'right') => {
    sound.playClickSound();
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedSquad.length) return;
    const next = [...selectedSquad];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setSelectedSquad(next);
  };

  const loadPreset = (preset: CampaignPreset) => {
    sound.playClickSound();
    const filtered: StoryDraftSelection[] = preset.squad
      .filter((p) => unlockedStuffies.includes(p.speciesId))
      .slice(0, 5)
      .map((p) => {
        const loadouts = getLoadoutsForStuffy(p.speciesId);
        const validLoadout = loadouts.find((l) => l.id === p.loadoutId) || loadouts[0];
        return {
          speciesId: p.speciesId,
          loadoutId: validLoadout?.id || 'balanced',
        };
      });
    setSelectedSquad(filtered);
    setIsPresetsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none animate-fadeIn">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-2 border-amber-400/90 rounded-3xl p-5 md:p-7 shadow-2xl shadow-amber-950/80 flex flex-col gap-4 text-white animate-scale-in max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{sector?.icon || '📍'}</span>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-pixel text-[9px] px-2.5 py-0.5 rounded-full border ${
                    mission.questType === 'side'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                      : 'bg-amber-950 text-amber-300 border-amber-500/60'
                  }`}
                >
                  {mission.questType === 'side' ? '📜 SIDE QUEST' : '🎯 MAIN STORY QUEST'}
                </span>
                <span className="font-pixel text-[9px] text-slate-400">
                  SECTOR {mission.sectorId} • REC LV.{sector?.recommendedLevel ?? mission.recommendedLevel}
                </span>
              </div>
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

        {/* 1. DRAFT PICK LOADOUT SCREEN (3 CHOICES) */}
        {currentPickingSpecies ? (
          <div className="flex flex-col items-center w-full bg-slate-900/95 border-2 border-yellow-500 rounded-2xl p-4 md:p-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-3 w-full mb-3 pb-3 border-b border-slate-700">
              <div className="w-14 h-14 flex items-center justify-center">
                <StuffySprite
                  stuffy={{
                    instanceId: `picked_${currentPickingSpecies.id}`,
                    speciesId: currentPickingSpecies.id,
                    name: currentPickingSpecies.name,
                    maxHp: currentPickingSpecies.baseHp,
                    currentHp: currentPickingSpecies.baseHp,
                    shield: 0,
                    isUnstuffed: false,
                    statusEffects: [],
                  }}
                  size={56}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[9px] bg-yellow-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                    DRAFT PICK
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {currentPickingSpecies.species} • {currentPickingSpecies.baseHp} HP
                  </span>
                </div>
                <h3 className="font-pixel text-sm md:text-base text-yellow-300 font-bold mt-0.5">
                  {currentPickingSpecies.name}&apos;s 10-CARD DECK PRESET
                </h3>
                <p className="font-pixel text-[10px] md:text-[11px] text-slate-300">
                  Choose 1 of 3 balanced 10-card decks (Average B-Tier Power):
                </p>
              </div>
            </div>

            {/* 3 Loadout Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 w-full mb-3">
              {getLoadoutsForStuffy(currentPickingSpecies.id).map((loadout) => {
                const isSelected = inspectingLoadout?.id === loadout.id;
                return (
                  <div
                    key={loadout.id}
                    onClick={() => {
                      sound.playClickSound();
                      setInspectingLoadout(loadout);
                    }}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-yellow-950/70 border-yellow-400 ring-2 ring-yellow-400 shadow-lg'
                        : 'bg-slate-950 border-slate-700 hover:border-slate-500 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-pixel text-xs font-bold text-yellow-300">{loadout.name}</h4>
                      <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded bg-purple-900 text-purple-200 border border-purple-500">
                        AVG: B
                      </span>
                    </div>
                    <p className="font-sans text-[10px] text-slate-300 line-clamp-2">{loadout.theme}</p>
                  </div>
                );
              })}
            </div>

            {/* Inspected Loadout Cards List */}
            {inspectingLoadout && (
              <div className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 mb-3.5">
                <div className="font-pixel text-[10px] text-slate-400 mb-2 flex justify-between items-center">
                  <span>10 CARDS INCLUDED IN THIS DECK:</span>
                  <span className="text-[10px] text-yellow-400 font-bold">Total: 10 Cards</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {(() => {
                    const counts: Record<string, number> = {};
                    inspectingLoadout.cardIds.forEach((id) => {
                      counts[id] = (counts[id] || 0) + 1;
                    });
                    return Object.entries(counts).map(([cId, count]) => {
                      const card = CARD_MAP.get(cId);
                      if (!card) return null;
                      const tierStyle = TIER_COLORS[card.tier] || TIER_COLORS.C;
                      return (
                        <div
                          key={cId}
                          onClick={() => setInspectedCard(card)}
                          className="flex items-center justify-between bg-slate-900 border border-slate-800 hover:border-yellow-400 hover:bg-slate-800 rounded-lg px-2.5 py-1.5 text-xs shadow-sm cursor-pointer transition-all group"
                          title="Click to view full card details"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="font-pixel text-yellow-400 font-bold text-xs">{count}x</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-pixel font-bold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                            >
                              {card.tier}
                            </span>
                            <span
                              className="font-pixel text-[10px] text-white group-hover:text-yellow-300 truncate max-w-[110px]"
                              title={card.name}
                            >
                              {card.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-mono text-amber-300 font-bold">🍪{card.cost}</span>
                            <span className="text-[10px] text-yellow-400 opacity-70 group-hover:opacity-100">
                              🔍
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Draft Pick Action Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => {
                  sound.playClickSound();
                  setCurrentPickingSpecies(null);
                  setInspectingLoadout(null);
                }}
                className="flex-1 font-pixel text-xs py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-600 cursor-pointer transition-all"
              >
                &lt;&lt; CANCEL DRAFT
              </button>
              <button
                disabled={!inspectingLoadout}
                onClick={() => handleConfirmLoadoutPick(inspectingLoadout!)}
                className="flex-1 font-pixel text-xs py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold rounded-xl border-2 border-yellow-300 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                CONFIRM {inspectingLoadout?.name} &gt;&gt;
              </button>
            </div>
          </div>
        ) : (
          /* 2. MAIN SQUAD BUILDER SCREEN */
          <>
            {/* Synopsis */}
            <p className="font-sans text-xs text-slate-300 leading-relaxed bg-black/40 p-3 rounded-2xl border border-slate-800">
              {mission.synopsis}
            </p>

            {/* Mission Requirements Banner */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                canEmbark
                  ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200'
                  : 'bg-amber-950/70 border-amber-500/80 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{canEmbark ? '✅' : '⚠️'}</span>
                <div>
                  <strong className="font-pixel text-xs block">
                    {requiredSpeciesIds.length === 0
                      ? 'NO MANDATORY PLUSHIES: Free squad choice!'
                      : canEmbark
                      ? 'ALL REQUIRED PLUSHIES ASSIGNED TO SQUAD'
                      : 'MISSION REQUIREMENTS (MANDATORY TO EMBARK):'}
                  </strong>
                  {requiredSpeciesIds.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      {requiredSpeciesIds.map((spId) => {
                        const isPresent = selectedSquad.some((item) => item.speciesId === spId);
                        const sp = STUFFY_MAP.get(spId);
                        return (
                          <span
                            key={spId}
                            className={`font-pixel text-[9px] px-2 py-0.5 rounded border ${
                              isPresent
                                ? 'bg-emerald-900 border-emerald-400 text-emerald-200'
                                : 'bg-red-950 border-red-500 text-red-200 animate-pulse'
                            }`}
                          >
                            {isPresent ? '✓ ' : '! '}
                            {sp?.name || spId}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick preset button */}
              <div className="flex items-center gap-1.5">
                {selectedSquad.length > 0 && (
                  <button
                    onClick={() => {
                      sound.playClickSound();
                      setSelectedSquad([]);
                    }}
                    className="font-pixel text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-600 cursor-pointer"
                    title="Clear selected squad slots"
                  >
                    CLEAR
                  </button>
                )}
                <button
                  onClick={() => {
                    sound.playClickSound();
                    setIsPresetsOpen(!isPresetsOpen);
                  }}
                  className="font-pixel text-[9px] bg-indigo-900 hover:bg-indigo-800 text-indigo-200 px-3 py-1.5 rounded-lg border border-indigo-500 shadow cursor-pointer flex items-center gap-1"
                >
                  <span>📋</span>
                  <span>PRESETS ({presets.length})</span>
                </button>
              </div>
            </div>

            {/* Preset Selector Dropdown */}
            {isPresetsOpen && (
              <div className="bg-slate-900/95 border-2 border-indigo-500/80 rounded-2xl p-3 flex flex-col gap-2 animate-fadeIn shadow-xl">
                <span className="font-pixel text-[10px] text-indigo-300 font-bold">
                  LOAD SAVED SQUAD PRESET (APPLIES PLUSHIES IN PRESET ORDER):
                </span>
                {presets.length === 0 ? (
                  <p className="font-sans text-xs text-slate-400 p-2">
                    No presets found. You can save custom presets from the Campaign Draft screen!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {presets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => loadPreset(preset)}
                        className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-700 hover:border-yellow-400 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{preset.icon}</span>
                          <div>
                            <strong className="font-pixel text-[10px] text-yellow-300 block group-hover:text-white">
                              {preset.name}
                            </strong>
                            <span className="font-mono text-[8px] text-slate-400">
                              {preset.squad.length} plushies
                            </span>
                          </div>
                        </div>
                        <span className="font-pixel text-[9px] text-indigo-400 group-hover:text-yellow-300">
                          LOAD ➔
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Ordered Squad Slots (Slot 1 to 5) */}
            <div className="flex flex-col gap-2 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
                  <span>👥</span>
                  <span>SQUAD ORDER ({selectedSquad.length} / 5 STUFFIES):</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Click deck button to change 1 of 3 choices
                </span>
              </div>

              {/* 5 Ordered Slots */}
              <div className="grid grid-cols-5 gap-2 py-1">
                {Array.from({ length: 5 }).map((_, slotIdx) => {
                  const draftItem = selectedSquad[slotIdx];
                  const speciesId = draftItem?.speciesId;
                  const sp = speciesId ? STUFFY_MAP.get(speciesId) : null;
                  const isRequired = speciesId ? requiredSpeciesIds.includes(speciesId) : false;
                  const loadouts = speciesId ? getLoadoutsForStuffy(speciesId) : [];
                  const chosenLoadout = loadouts.find((l) => l.id === draftItem?.loadoutId) || loadouts[0];

                  return (
                    <div
                      key={slotIdx}
                      className={`relative flex flex-col items-center justify-between p-1.5 rounded-2xl border transition-all min-h-[114px] ${
                        draftItem && sp
                          ? isRequired
                            ? 'bg-slate-950 border-amber-400/90 shadow shadow-amber-900/40'
                            : 'bg-slate-950 border-cyan-500/70'
                          : 'bg-slate-950/40 border-dashed border-slate-800'
                      }`}
                    >
                      {/* Slot Number Badge */}
                      <span className="font-mono text-[8px] text-slate-500">
                        SLOT {slotIdx + 1} {slotIdx === 0 ? '(LEAD)' : ''}
                      </span>

                      {draftItem && sp ? (
                        <>
                          {/* Stuffy Avatar */}
                          <div className="w-8 h-8 flex items-center justify-center my-0.5">
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
                              size={32}
                            />
                          </div>
                          <span className="font-pixel text-[8px] text-yellow-300 truncate max-w-[58px]">
                            {sp.name}
                          </span>

                          {/* 3-Choice Deck Loadout Badge (Click to open/change deck!) */}
                          <button
                            onClick={() => {
                              sound.playClickSound();
                              setCurrentPickingSpecies(sp);
                              setInspectingLoadout(chosenLoadout || null);
                            }}
                            className="font-pixel text-[7px] bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-500/60 px-1 py-0.5 rounded truncate max-w-[62px] cursor-pointer hover:border-yellow-400"
                            title={`Chosen Deck: ${chosenLoadout?.name}. Click to pick 1 of 3 choices!`}
                          >
                            📦 {chosenLoadout?.name || 'Deck'}
                          </button>

                          {/* Reorder Arrows & Remove */}
                          <div className="flex items-center justify-between w-full mt-1 pt-1 border-t border-slate-800">
                            <button
                              disabled={slotIdx === 0}
                              onClick={() => moveStuffyOrder(slotIdx, 'left')}
                              className="text-[9px] text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Move left"
                            >
                              ◀
                            </button>
                            <button
                              onClick={() => removeStuffyFromSquad(speciesId)}
                              className="text-[8px] text-red-400 hover:text-red-300 cursor-pointer font-bold"
                              title="Remove from squad"
                            >
                              ✕
                            </button>
                            <button
                              disabled={slotIdx === selectedSquad.length - 1}
                              onClick={() => moveStuffyOrder(slotIdx, 'right')}
                              className="text-[9px] text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                              title="Move right"
                            >
                              ▶
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center my-auto text-slate-600 font-pixel text-[8px]">
                          <span>+ ADD</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Under-strength scaling banner */}
              {isUnderStrength && (
                <div className="bg-emerald-950/70 border border-emerald-500/50 p-2 rounded-xl text-emerald-200 text-[10px] font-mono flex items-center gap-2 mt-1">
                  <span className="text-base">⚖️</span>
                  <div>
                    <strong className="font-pixel text-[9px] text-emerald-300 block">
                      {scaling.description}
                    </strong>
                    <span>
                      Squad has {selectedSquad.length} plushies; 5-enemy squad is dynamically scaled down!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Available Roster (Click to Draft with 3 Choices) */}
            <div className="flex flex-col gap-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <span className="font-pixel text-[10px] text-slate-400">
                YOUR UNLOCKED PLUSHIES (CLICK TO DRAFT &amp; CHOOSE 1 OF 3 DECKS):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {unlockedStuffies.map((speciesId) => {
                  const sp = STUFFY_MAP.get(speciesId);
                  const isSelected = selectedSquad.some((item) => item.speciesId === speciesId);
                  const isRequired = requiredSpeciesIds.includes(speciesId);

                  return (
                    <button
                      key={speciesId}
                      onClick={() => handleSelectStuffyForDraft(speciesId)}
                      className={`relative flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer min-w-[76px] ${
                        isSelected
                          ? 'bg-amber-950/80 border-amber-400 shadow ring-1 ring-amber-400'
                          : isRequired
                          ? 'bg-slate-950 border-amber-500/80 animate-pulse'
                          : 'bg-slate-950 hover:bg-slate-900 border-slate-700'
                      }`}
                    >
                      {isRequired && (
                        <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold shadow">
                          ⭐
                        </span>
                      )}
                      <div className="w-8 h-8 flex items-center justify-center">
                        {sp && (
                          <StuffySprite
                            stuffy={{
                              instanceId: `roster_${sp.id}`,
                              speciesId: sp.id,
                              name: sp.name,
                              maxHp: sp.baseHp,
                              currentHp: sp.baseHp,
                              shield: 0,
                              isUnstuffed: false,
                              statusEffects: [],
                            }}
                            size={32}
                          />
                        )}
                      </div>
                      <span className="font-pixel text-[8px] text-slate-200 truncate max-w-[66px] mt-1">
                        {sp?.name || speciesId}
                      </span>
                      <span className="font-mono text-[7px] text-slate-400">
                        {isSelected ? 'EDIT DECK' : '+ DRAFT (3)'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Embark / Return Buttons */}
            <div className="flex gap-3 mt-1">
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
                disabled={!canEmbark}
                onClick={() => {
                  sound.playClickSound();
                  onEmbark(mission, selectedSquad);
                }}
                className={`flex-1 font-pixel text-xs font-extrabold py-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${
                  canEmbark
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 border-yellow-200 shadow-xl shadow-yellow-600/40 hover:scale-105 active:scale-95 cursor-pointer animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-500 opacity-60 cursor-not-allowed'
                }`}
              >
                <span>⚔️</span>
                <span>
                  {canEmbark
                    ? `EMBARK (${selectedSquad.length} PLUSHIES)`
                    : 'ASSIGN REQUIRED PLUSHIES TO EMBARK'}
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Inspected Card Detail Modal */}
      {inspectedCard && (
        <div
          onClick={() => setInspectedCard(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 flex flex-col items-center max-w-xs w-full shadow-2xl cursor-default animate-scaleUp"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔍</span>
              <h4 className="font-pixel text-xs text-yellow-300 font-bold tracking-wider">
                CARD DETAILS
              </h4>
            </div>
            <CardView card={inspectedCard} />
            <button
              onClick={() => setInspectedCard(null)}
              className="mt-4 font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-xl border border-slate-600 cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
