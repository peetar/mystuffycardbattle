'use client';

import React, { useState } from 'react';
import { ALL_STUFFIES, PLAYABLE_STUFFIES } from '@/data/stuffies';
import { getLoadoutsForStuffy } from '@/data/loadouts';
import { CARD_MAP } from '@/data/cards';
import { StuffySpecies, LoadoutPackage, Card } from '@/types/game';
import { StuffySprite } from '../battle/StuffySprite';
import { CardView, TIER_COLORS } from '../battle/CardView';

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
      </div>

      {/* Drafted Team Tray */}
      <div className="flex gap-3 justify-center items-center my-2 bg-slate-900/80 p-2.5 rounded-2xl border-2 border-slate-700 min-h-20 w-full max-w-2xl">
        {Array.from({ length: requiredCount }).map((_, idx) => {
          const picked = selectedStuffies[idx];
          const species = picked ? ALL_STUFFIES.find((s) => s.id === picked.speciesId) : null;

          return (
            <div
              key={idx}
              className="w-16 h-20 md:w-20 md:h-24 rounded-xl border-2 border-dashed border-slate-600 bg-slate-950/60 flex flex-col items-center justify-center p-1"
            >
              {species ? (
                <>
                  <div className="w-12 h-12">
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
                  <span className="font-pixel text-[8px] text-yellow-300 truncate w-full text-center">
                    {species.name}
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
    </div>
  );
};
