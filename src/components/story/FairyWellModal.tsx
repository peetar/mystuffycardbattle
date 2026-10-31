'use client';

import React, { useState } from 'react';
import { useStoryStore } from '@/store/storyStore';
import { useCampaignStore } from '@/store/campaignStore';
import { ALL_ESPERS } from '@/data/espers';
import { PLAYABLE_STUFFIES } from '@/data/stuffies';
import { sound } from '@/utils/audio';
import { normalizeStuffyCards, getTotalBinderCardsCount } from '@/utils/rosterStars';

interface FairyWellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FairyWellModal: React.FC<FairyWellModalProps> = ({ isOpen, onClose }) => {
  const { fairyWellUpgrades, sacrificeCardInFairyWell } = useStoryStore();
  const { stuffyCards } = useCampaignStore();

  const [selectedEsperId, setSelectedEsperId] = useState<string>(ALL_ESPERS[0]?.id || 'esper_frost');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('cow');
  const [selectedStarTier, setSelectedStarTier] = useState<number>(1);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const normalized = normalizeStuffyCards(stuffyCards);
  const availableCount = normalized[selectedSpeciesId]?.[selectedStarTier] || 0;

  const handleSacrifice = () => {
    sound.playRewardSound();
    const res = sacrificeCardInFairyWell(selectedEsperId, selectedSpeciesId, selectedStarTier);
    setNotification(res.message);
    setTimeout(() => setNotification(null), 4000);
  };

  const selectedEsper = ALL_ESPERS.find((e) => e.id === selectedEsperId);

  // Compute total upgrades on the selected Esper
  const esperUpgrades = fairyWellUpgrades.filter((u) => u.esperId === selectedEsperId);
  const totalSpeedBonus = esperUpgrades.reduce((a, b) => a + b.bonusSpeed, 0);
  const totalHpBonus = esperUpgrades.reduce((a, b) => a + b.bonusHp, 0);
  const totalProcBonus = esperUpgrades.reduce((a, b) => a + b.bonusProcChance, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 select-none animate-fadeIn">
      <div className="w-full max-w-3xl bg-gradient-to-b from-slate-950 via-teal-950/80 to-slate-950 border-2 border-emerald-400/80 rounded-3xl p-5 md:p-7 shadow-2xl shadow-emerald-950/80 flex flex-col gap-4 text-white animate-scale-in max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">⛲</span>
            <div>
              <span className="font-pixel text-[10px] text-emerald-300 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                MILESTONE 1/8 UNLOCK • SECTOR 13
              </span>
              <h2 className="font-pixel text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 font-extrabold tracking-wide">
                THE FAIRY WELL
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

        {/* Narrative Description */}
        <p className="font-sans text-xs md:text-sm text-slate-300 leading-relaxed bg-black/40 p-3 rounded-2xl border border-slate-800">
          Sacrifice duplicate <strong className="text-yellow-300">Stuffy Cards</strong> from your Card Binder into the enchanted waters to <strong className="text-emerald-300">permanently enhance your Espers</strong> with Speed, Max HP, and elemental status potency! Higher star cards grant larger permanent blessings!
        </p>

        {/* Status Notification */}
        {notification && (
          <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-pixel text-center animate-fadeIn shadow-lg">
            {notification}
          </div>
        )}

        {/* 1. Pick Esper */}
        <div className="flex flex-col gap-2">
          <span className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
            <span>✨</span>
            <span>1. SELECT ESPER TO BLESS:</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ALL_ESPERS.map((esper) => {
              const isSelected = esper.id === selectedEsperId;
              return (
                <button
                  key={esper.id}
                  onClick={() => {
                    sound.playClickSound();
                    setSelectedEsperId(esper.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950 border-emerald-400 ring-2 ring-emerald-400/80 shadow'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="font-pixel text-xs text-emerald-300 font-bold truncate">
                    {esper.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    +{esper.boost.speed || 0} Spd • +{esper.boost.maxHp || 0} HP
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Esper Current Blessings Display */}
        {selectedEsper && (
          <div className="bg-slate-900/90 border border-emerald-500/40 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <span className="font-pixel text-xs text-emerald-300 font-bold block">
                {selectedEsper.name} Cumulative Blessings:
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                +{totalSpeedBonus} Permanent Speed • +{totalHpBonus} Permanent Max HP • +{totalProcBonus}% Status Potency
              </span>
            </div>
            <span className="font-pixel text-xs text-yellow-300 bg-yellow-950/80 px-2.5 py-1 rounded-xl border border-yellow-500/40 font-bold">
              {esperUpgrades.length} Sacrifices
            </span>
          </div>
        )}

        {/* 2. Pick Stuffy Card & Star Tier to Sacrifice */}
        <div className="flex flex-col gap-2">
          <span className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
            <span>🎴</span>
            <span>2. SELECT CARD &amp; STAR TIER TO SACRIFICE:</span>
          </span>

          {/* Species Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {PLAYABLE_STUFFIES.map((sp) => {
              const isSelected = sp.id === selectedSpeciesId;
              return (
                <button
                  key={sp.id}
                  onClick={() => {
                    sound.playClickSound();
                    setSelectedSpeciesId(sp.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] cursor-pointer whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300'
                      : 'bg-slate-900/90 text-slate-300 border-slate-700'
                  }`}
                >
                  {sp.name}
                </button>
              );
            })}
          </div>

          {/* Star Tier Selector */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {Array.from({ length: 10 }).map((_, idx) => {
              const tier = idx + 1;
              const count = normalized[selectedSpeciesId]?.[tier] || 0;
              const isSelected = tier === selectedStarTier;

              return (
                <button
                  key={tier}
                  onClick={() => {
                    sound.playClickSound();
                    setSelectedStarTier(tier);
                  }}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-950 border-amber-400 ring-2 ring-amber-400/80'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <span className="font-pixel text-xs font-bold text-yellow-300">{tier}★</span>
                  <span className={`text-[9px] font-mono ${count > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    x{count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sacrifice Confirmation Button */}
        <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-slate-800 mt-1">
          <div>
            <span className="font-pixel text-xs text-yellow-300 block font-bold">
              Offer 1x {selectedStarTier}★ {selectedSpeciesId.toUpperCase()} Card
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Permanently blesses {selectedEsper?.name} with +{selectedStarTier * 3} Speed, +{selectedStarTier * 10} HP!
            </span>
          </div>

          <button
            disabled={availableCount < 1}
            onClick={handleSacrifice}
            className={`font-pixel text-xs py-3 px-5 rounded-2xl border-2 font-extrabold transition-all cursor-pointer shadow-lg ${
              availableCount >= 1
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 border-emerald-200 shadow-emerald-950/80 hover:scale-105 active:scale-95'
                : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            {availableCount >= 1 ? 'SACRIFICE CARD TO FOUNTAIN ✨' : 'NO CARDS AVAILABLE'}
          </button>
        </div>
      </div>
    </div>
  );
};
