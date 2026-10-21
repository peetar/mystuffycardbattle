'use client';

import React, { useState, useEffect } from 'react';
import { ALL_STUFFIES, PLAYABLE_STUFFIES } from '@/data/stuffies';
import { getLoadoutsForStuffy } from '@/data/loadouts';
import { CARD_MAP } from '@/data/cards';
import { StuffySpecies, LoadoutPackage, Card } from '@/types/game';
import { StuffySprite } from '../battle/StuffySprite';
import { CardView, TIER_COLORS } from '../battle/CardView';
import {
  CampaignPreset,
  getAllCampaignPresets,
  saveCustomCampaignPreset,
  deleteCustomCampaignPreset,
} from '@/data/campaignPresets';
import { sound } from '@/utils/audio';

interface DraftSelection {
  speciesId: string;
  loadoutId: string;
}

export type RunLength = 'short' | 'standard' | 'marathon';

interface StuffyDraftModalProps {
  onCompleteDraft: (draft: DraftSelection[], runLength: RunLength, actsCount?: number) => void;
  requiredCount?: number; // default 5
  showRunLengthSelector?: boolean;
}

export const StuffyDraftModal: React.FC<StuffyDraftModalProps> = ({
  onCompleteDraft,
  requiredCount = 5,
  showRunLengthSelector = true,
}) => {
  const [selectedStuffies, setSelectedStuffies] = useState<DraftSelection[]>([]);
  const [currentPickingSpecies, setCurrentPickingSpecies] = useState<StuffySpecies | null>(null);
  const [inspectingLoadout, setInspectingLoadout] = useState<LoadoutPackage | null>(null);
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);
  const [runLength, setRunLength] = useState<RunLength>('standard');
  const [actsCount, setActsCount] = useState<number>(3); // Default 3 Acts!

  // Presets state
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [presetsList, setPresetsList] = useState<CampaignPreset[]>([]);
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [customPresetName, setCustomPresetName] = useState('');
  const [activePresetNotice, setActivePresetNotice] = useState<string | null>(null);

  const refreshPresets = () => {
    setPresetsList(getAllCampaignPresets());
  };

  useEffect(() => {
    refreshPresets();
  }, []);

  const handleApplyPreset = (preset: CampaignPreset, autoLaunch = false) => {
    sound.playRewardSound();
    setSelectedStuffies(preset.squad);
    setCurrentPickingSpecies(null);
    setInspectingLoadout(null);
    setIsPresetsModalOpen(false);
    setActivePresetNotice(`Loaded preset "${preset.name}"!`);
    setTimeout(() => setActivePresetNotice(null), 3000);

    if (autoLaunch && preset.squad.length >= requiredCount) {
      onCompleteDraft(preset.squad, runLength, actsCount);
    }
  };

  const handleSaveCurrentAsPreset = () => {
    if (selectedStuffies.length < requiredCount) return;
    const name = customPresetName.trim() || `Custom Squad #${presetsList.length + 1}`;
    const newPreset: CampaignPreset = {
      id: `custom_preset_${Date.now()}`,
      name,
      description: `Custom 5-stuffy squad created on ${new Date().toLocaleDateString()}`,
      icon: '🧸',
      squad: [...selectedStuffies],
      isCustom: true,
    };
    saveCustomCampaignPreset(newPreset);
    sound.playRewardSound();
    refreshPresets();
    setIsSavingPreset(false);
    setCustomPresetName('');
    setActivePresetNotice(`Saved preset "${name}"!`);
    setTimeout(() => setActivePresetNotice(null), 3000);
  };

  const handleDeletePreset = (id: string) => {
    sound.playClickSound();
    deleteCustomCampaignPreset(id);
    refreshPresets();
  };

  const handleRemoveStuffy = (index: number) => {
    sound.playClickSound();
    setSelectedStuffies((prev) => prev.filter((_, i) => i !== index));
  };

  // Filter out already drafted stuffies (excluding boss-only amalgam)
  const availableStuffies = PLAYABLE_STUFFIES.filter(
    (s) => !selectedStuffies.some((picked) => picked.speciesId === s.id)
  );

  const handleSelectStuffy = (species: StuffySpecies) => {
    setCurrentPickingSpecies(species);
    const loadouts = getLoadoutsForStuffy(species.id);
    setInspectingLoadout(loadouts[0]);
  };

  const handleConfirmLoadout = (loadoutId: string) => {
    if (!currentPickingSpecies) return;

    const newSelections = [
      ...selectedStuffies,
      { speciesId: currentPickingSpecies.id, loadoutId },
    ];
    setSelectedStuffies(newSelections);
    setCurrentPickingSpecies(null);
    setInspectingLoadout(null);

    if (newSelections.length >= requiredCount) {
      onCompleteDraft(newSelections, runLength, actsCount);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-8 select-none overflow-y-auto">
      {/* Header */}
      <div className="text-center my-2 max-w-2xl w-full">
        <h2 className="font-pixel text-xl md:text-2xl text-yellow-400 font-bold tracking-wider">
          DRAFT YOUR STUFFY SQUAD ({selectedStuffies.length}/{requiredCount})
        </h2>
        <p className="font-pixel text-xs text-slate-300 mt-1">
          Pick 5 stuffed animals. For each one, choose 1 of 3 balanced 10-card deck presets!
        </p>

        {/* Campaign Length & Acts Selector */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3 bg-slate-900/90 p-2 rounded-xl border border-slate-700 shadow">
          <div className="flex items-center gap-1.5">
            <span className="font-pixel text-[10px] text-yellow-300 font-bold">
              🗺️ CAMPAIGN ACTS:
            </span>
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setActsCount(num)}
                className={`font-pixel text-[9px] px-2 py-1 rounded border transition-all cursor-pointer ${
                  actsCount === num
                    ? 'bg-amber-600 border-yellow-300 text-white font-bold ring-2 ring-yellow-400 scale-105'
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {num} {num === 1 ? 'ACT' : 'ACTS'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-pixel text-[10px] text-yellow-300 font-bold">
              ⚡ FLOORS PER ACT:
            </span>
            <button
              type="button"
              onClick={() => setRunLength('short')}
              className={`font-pixel text-[9px] px-2.5 py-1 rounded border transition-all cursor-pointer ${
                runLength === 'short'
                  ? 'bg-amber-600 border-yellow-300 text-white font-bold ring-2 ring-yellow-400'
                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              5 (SHORT)
            </button>
            <button
              type="button"
              onClick={() => setRunLength('standard')}
              className={`font-pixel text-[9px] px-2.5 py-1 rounded border transition-all cursor-pointer ${
                runLength === 'standard'
                  ? 'bg-amber-600 border-yellow-300 text-white font-bold ring-2 ring-yellow-400'
                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              8 (STANDARD)
            </button>
            <button
              type="button"
              onClick={() => setRunLength('marathon')}
              className={`font-pixel text-[9px] px-2.5 py-1 rounded border transition-all cursor-pointer ${
                runLength === 'marathon'
                  ? 'bg-amber-600 border-yellow-300 text-white font-bold ring-2 ring-yellow-400'
                  : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              12 (MARATHON)
            </button>
          </div>
        </div>

        {/* Preset & Action Buttons Row */}
        <div className="flex items-center justify-center gap-2 mt-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              sound.playClickSound();
              refreshPresets();
              setIsPresetsModalOpen(true);
            }}
            className="font-pixel text-[10px] bg-gradient-to-r from-indigo-800 to-purple-800 hover:from-indigo-700 hover:to-purple-700 text-indigo-100 px-4 py-2 rounded-xl border border-indigo-400 shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <span>📋</span>
            <span>SQUAD PRESETS ({presetsList.length})</span>
          </button>

          {selectedStuffies.length === requiredCount && (
            <>
              <button
                type="button"
                onClick={() => setIsSavingPreset(true)}
                className="font-pixel text-[10px] bg-emerald-900 hover:bg-emerald-800 text-emerald-200 px-3.5 py-2 rounded-xl border border-emerald-500 shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <span>💾</span>
                <span>SAVE AS PRESET</span>
              </button>
              <button
                type="button"
                onClick={() => onCompleteDraft(selectedStuffies, runLength, actsCount)}
                className="font-pixel text-[10px] bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl border-2 border-yellow-300 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all animate-pulse"
              >
                <span>🚀</span>
                <span>START CAMPAIGN WITH SQUAD</span>
              </button>
            </>
          )}

          {selectedStuffies.length > 0 && (
            <button
              type="button"
              onClick={() => {
                sound.playClickSound();
                setSelectedStuffies([]);
                setCurrentPickingSpecies(null);
                setInspectingLoadout(null);
              }}
              className="font-pixel text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl border border-slate-600 cursor-pointer transition-all"
            >
              CLEAR 🔄
            </button>
          )}
        </div>

        {/* Preset Feedback Toast */}
        {activePresetNotice && (
          <div className="mt-2 bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 font-pixel text-[10px] px-4 py-1.5 rounded-xl shadow animate-fadeIn">
            ✨ {activePresetNotice}
          </div>
        )}
      </div>

      {/* Drafted Team Tray */}
      <div className="flex gap-2 sm:gap-3 justify-center items-center my-2 bg-slate-900/80 p-2.5 rounded-2xl border-2 border-slate-700 min-h-20 w-full max-w-2xl">
        {Array.from({ length: requiredCount }).map((_, idx) => {
          const picked = selectedStuffies[idx];
          const species = picked ? ALL_STUFFIES.find((s) => s.id === picked.speciesId) : null;

          return (
            <div
              key={idx}
              onClick={() => picked && handleRemoveStuffy(idx)}
              title={picked ? 'Click to remove/swap this stuffy' : undefined}
              className={`w-16 h-20 md:w-20 md:h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 transition-all ${
                picked
                  ? 'border-yellow-500 bg-slate-950/90 hover:border-red-400 hover:bg-red-950/40 cursor-pointer group'
                  : 'border-slate-600 bg-slate-950/60'
              }`}
            >
              {species ? (
                <>
                  <div className="w-12 h-12 transition-transform group-hover:scale-95">
                    <StuffySprite
                      stuffy={{
                        instanceId: `draft_${species.id}`,
                        speciesId: species.id,
                        name: species.name,
                        maxHp: species.baseHp,
                        currentHp: species.baseHp,
                        shield: 0,
                        isUnstuffed: false,
                        statusEffects: [],
                      }}
                      size={44}
                    />
                  </div>
                  <span className="font-pixel text-[8px] text-yellow-300 group-hover:text-red-300 truncate w-full text-center">
                    {species.name}
                  </span>
                  <span className="font-pixel text-[7px] text-slate-400 group-hover:text-red-400 mt-0.5">
                    [✕ REMOVE]
                  </span>
                </>
              ) : (
                <span className="font-pixel text-xs text-slate-600">#{idx + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Draft Area: Stuffy Selection OR Loadout Selection */}
      {!currentPickingSpecies ? (
        // Step 1: Pick a Stuffy (all 18 in 3 rows of 6)
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 max-w-5xl w-full my-2 overflow-y-auto max-h-[52vh] p-1.5">
          {availableStuffies.map((species) => (
            <div
              key={species.id}
              onClick={() => handleSelectStuffy(species)}
              className="bg-slate-900 border-2 border-slate-700 hover:border-yellow-400 p-2 rounded-xl flex flex-col items-center cursor-pointer transition-all hover:scale-105 hover:shadow-xl group"
            >
              <div className="w-20 h-20 mb-2">
                <StuffySprite
                  stuffy={{
                    instanceId: `preview_${species.id}`,
                    speciesId: species.id,
                    name: species.name,
                    maxHp: species.baseHp,
                    currentHp: species.baseHp,
                    shield: 0,
                    isUnstuffed: false,
                    statusEffects: [],
                  }}
                  size={76}
                />
              </div>

              <h3 className="font-pixel text-xs font-bold text-yellow-300 group-hover:text-yellow-200">
                {species.name}
              </h3>
              <span className="font-mono text-[10px] text-slate-400 mb-1">
                {species.species} • {species.baseHp} HP
              </span>
              <p className="font-sans text-[10px] text-slate-300 text-center line-clamp-2">
                {species.description}
              </p>
            </div>
          ))}
        </div>
      ) : (
        // Step 2: Pick 1 of 3 10-Card Loadouts for chosen Stuffy
        <div className="flex flex-col items-center w-full max-w-4xl bg-slate-900 border-2 border-yellow-500 rounded-2xl p-6 shadow-2xl my-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16">
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
                size={64}
              />
            </div>
            <div>
              <h3 className="font-pixel text-lg text-yellow-300 font-bold">
                {currentPickingSpecies.name} &apos;s 10-CARD PRESET
              </h3>
              <p className="font-pixel text-xs text-slate-300">
                Choose 1 of 3 balanced 10-card decks (Average B-Tier Power):
              </p>
            </div>
          </div>

          {/* 3 Loadout Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-4">
            {getLoadoutsForStuffy(currentPickingSpecies.id).map((loadout) => {
              const isSelected = inspectingLoadout?.id === loadout.id;
              return (
                <div
                  key={loadout.id}
                  onClick={() => setInspectingLoadout(loadout)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-yellow-950/60 border-yellow-400 ring-2 ring-yellow-400'
                      : 'bg-slate-950 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-pixel text-xs font-bold text-yellow-300">{loadout.name}</h4>
                    <span className="font-pixel text-[9px] px-1.5 py-0.5 rounded bg-purple-900 text-purple-200 border border-purple-500">
                      AVG: B
                    </span>
                  </div>
                  <p className="font-sans text-[10px] text-slate-300">{loadout.theme}</p>
                </div>
              );
            })}
          </div>

          {/* Inspected Loadout Cards List */}
          {inspectingLoadout && (
            <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
              <div className="font-pixel text-[11px] text-slate-400 mb-2 flex justify-between items-center">
                <span>10 CARDS INCLUDED IN THIS DECK:</span>
                <span className="text-[10px] text-yellow-400">Total: 10 Cards</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
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
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-pixel font-bold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                            {card.tier}
                          </span>
                          <span className="font-pixel text-[11px] text-white group-hover:text-yellow-300 truncate max-w-[120px]" title={card.name}>
                            {card.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-mono text-amber-300 font-bold">🍪{card.cost}</span>
                          <span className="text-slate-300 truncate max-w-[110px]" title={card.description}>
                            {card.description}
                          </span>
                          <span className="text-[10px] text-yellow-400 opacity-70 group-hover:opacity-100">🔍</span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPickingSpecies(null)}
              className="font-pixel text-xs px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-600 cursor-pointer"
            >
              BACK TO STUFFIES
            </button>
            <button
              onClick={() => inspectingLoadout && handleConfirmLoadout(inspectingLoadout.id)}
              className="font-pixel text-xs px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg border-2 border-emerald-400 font-bold shadow-lg shadow-emerald-700/50 cursor-pointer"
            >
              CONFIRM {inspectingLoadout?.name.toUpperCase()} (10 CARDS) ✅
            </button>
          </div>
        </div>
      )}

      {/* Card Detail Preview Modal */}
      {inspectedCard && (
        <div
          onClick={() => setInspectedCard(null)}
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 flex flex-col items-center max-w-xs w-full shadow-2xl cursor-default animate-scaleUp"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎴</span>
              <h4 className="font-pixel text-xs text-yellow-300 font-bold tracking-wider">
                CARD PREVIEW
              </h4>
            </div>
            <CardView card={inspectedCard} />
            <button
              onClick={() => setInspectedCard(null)}
              className="mt-4 font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl border border-slate-600 cursor-pointer shadow transition-all hover:scale-105 active:scale-95"
            >
              CLOSE [✖️]
            </button>
          </div>
        </div>
      )}

      {/* SQUAD PRESETS MODAL */}
      {isPresetsModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-slate-900 border-4 border-indigo-500 rounded-3xl p-5 md:p-6 max-w-2xl w-full max-h-[90vh] flex flex-col justify-between shadow-2xl animate-scaleUp">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <h3 className="font-pixel text-base text-yellow-300 font-bold">
                    CAMPAIGN SQUAD PRESETS
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPresetsModalOpen(false)}
                  className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-600 cursor-pointer"
                >
                  CLOSE [✖️]
                </button>
              </div>
              <p className="font-pixel text-[10px] text-slate-300 mb-3 text-left">
                Choose a pre-built synergistic squad or load your custom saved team presets:
              </p>

              <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1.5">
                {presetsList.map((preset) => (
                  <div
                    key={preset.id}
                    className="bg-slate-950 border-2 border-slate-800 hover:border-indigo-400 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow transition-all"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{preset.icon}</span>
                        <h4 className="font-pixel text-xs text-yellow-300 font-bold">
                          {preset.name}
                        </h4>
                        {preset.isCustom && (
                          <span className="font-pixel text-[8px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-[11px] text-slate-300 leading-snug mb-2">
                        {preset.description}
                      </p>
                      {/* Stuffy preview chips */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {preset.squad.map((item, idx) => {
                          const species = ALL_STUFFIES.find((s) => s.id === item.speciesId);
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded-lg text-[9px] font-pixel text-slate-300"
                            >
                              <span>🐾</span>
                              <span>{species?.name || item.speciesId}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(preset, false)}
                        className="font-pixel text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl border border-indigo-300 cursor-pointer shadow hover:scale-105 active:scale-95 transition-all"
                      >
                        LOAD SQUAD ⚡
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(preset, true)}
                        className="font-pixel text-[10px] bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-3 py-2 rounded-xl border border-yellow-300 cursor-pointer shadow hover:scale-105 active:scale-95 transition-all"
                      >
                        LAUNCH 🚀
                      </button>
                      {preset.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeletePreset(preset.id)}
                          className="font-pixel text-[9px] bg-red-950 hover:bg-red-900 text-red-300 px-2 py-1 rounded-lg border border-red-700 cursor-pointer"
                        >
                          DELETE 🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAVE CUSTOM PRESET MODAL */}
      {isSavingPreset && (
        <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-slate-900 border-4 border-emerald-500 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-scaleUp">
            <span className="text-3xl mb-2 block">💾</span>
            <h3 className="font-pixel text-sm text-emerald-400 font-bold mb-2">
              SAVE SQUAD AS PRESET
            </h3>
            <p className="font-pixel text-[10px] text-slate-300 mb-4">
              Enter a name for your custom 5-stuffy squad:
            </p>
            <input
              type="text"
              value={customPresetName}
              onChange={(e) => setCustomPresetName(e.target.value)}
              placeholder="e.g. My Dream Team"
              maxLength={24}
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-xl px-3 py-2 text-white font-pixel text-xs mb-4 text-center focus:border-emerald-400 focus:outline-none"
            />
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => setIsSavingPreset(false)}
                className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl border border-slate-600 cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentAsPreset}
                className="font-pixel text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl border border-emerald-300 cursor-pointer shadow hover:scale-105 active:scale-95 transition-all"
              >
                SAVE 💾
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
