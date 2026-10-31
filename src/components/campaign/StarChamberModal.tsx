'use client';

import React, { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { PLAYABLE_STUFFIES, STUFFY_MAP, getStarBonus } from '@/data/stuffies';
import { PackRarity, StuffyPack, StuffyCardItem, StuffyState } from '@/types/game';
import { StuffySprite } from '@/components/battle/StuffySprite';
import { sound } from '@/utils/audio';

interface StarChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RARITY_THEMES: Record<
  PackRarity,
  { border: string; bg: string; text: string; badge: string; glow: string; icon: string }
> = {
  common: {
    border: 'border-slate-500',
    bg: 'from-slate-900 to-slate-950',
    text: 'text-slate-300',
    badge: 'bg-slate-800 text-slate-300 border-slate-600',
    glow: 'shadow-slate-500/20',
    icon: '⚪',
  },
  uncommon: {
    border: 'border-emerald-500',
    bg: 'from-emerald-950/80 to-slate-950',
    text: 'text-emerald-300',
    badge: 'bg-emerald-900/80 text-emerald-200 border-emerald-500',
    glow: 'shadow-emerald-500/30',
    icon: '🟢',
  },
  rare: {
    border: 'border-cyan-500',
    bg: 'from-cyan-950/80 to-slate-950',
    text: 'text-cyan-300',
    badge: 'bg-cyan-900/80 text-cyan-200 border-cyan-500',
    glow: 'shadow-cyan-500/30',
    icon: '🔵',
  },
  epic: {
    border: 'border-purple-500',
    bg: 'from-purple-950/80 to-slate-950',
    text: 'text-purple-300',
    badge: 'bg-purple-900/80 text-purple-200 border-purple-500',
    glow: 'shadow-purple-500/40',
    icon: '🟣',
  },
  legendary: {
    border: 'border-amber-400',
    bg: 'from-amber-950/90 via-purple-950/40 to-slate-950',
    text: 'text-amber-300',
    badge: 'bg-amber-900/80 text-amber-200 border-amber-400 animate-pulse',
    glow: 'shadow-amber-500/50',
    icon: '🟡',
  },
};

export const StarChamberModal: React.FC<StarChamberModalProps> = ({ isOpen, onClose }) => {
  const { packs, stuffyCards, activeParty, bench, openPack, fusePairToStar } = useCampaignStore();

  const [activeTab, setActiveTab] = useState<'packs' | 'fuse' | 'binder'>('packs');
  const [openingPack, setOpeningPack] = useState<StuffyPack | null>(null);
  const [revealedCards, setRevealedCards] = useState<StuffyCardItem[] | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const allStuffies: StuffyState[] = [...activeParty, ...bench];

  const handleOpenPack = (pack: StuffyPack) => {
    sound.playRewardSound();
    setOpeningPack(pack);
    const result = openPack(pack.id);
    if (result) {
      setRevealedCards(result.pulledCards);
    }
  };

  const handleFuseStar = (stuffy: StuffyState) => {
    sound.playRewardSound();
    const res = fusePairToStar(stuffy.instanceId);
    if (res.success) {
      setNotification(`🎉 ${res.message}`);
    } else {
      setNotification(res.message);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const totalCardsInBinder = Object.values(stuffyCards || {}).reduce((acc, c) => acc + c, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto select-none">
      <div className="bg-gradient-to-b from-slate-950 via-purple-950/70 to-slate-950 border-2 border-amber-500/70 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl shadow-amber-950/80 flex flex-col gap-6 text-white animate-scale-in max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">⭐</span>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-pixel text-[10px]">
                <span>VERSION 3.9</span>
                <span>•</span>
                <span>10-STAR EVOLUTION SYSTEM</span>
              </div>
              <h2 className="font-pixel text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-fuchsia-300 font-extrabold tracking-wide">
                ASTRAL STAR CHAMBER &amp; PACKS
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('packs');
              setRevealedCards(null);
            }}
            className={`font-pixel text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'packs'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>🎁</span>
            <span>REWARD PACKS ({(packs || []).length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('fuse');
              setRevealedCards(null);
            }}
            className={`font-pixel text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'fuse'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>⭐</span>
            <span>STAR FUSION CHAMBER</span>
          </button>

          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('binder');
              setRevealedCards(null);
            }}
            className={`font-pixel text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'binder'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>📖</span>
            <span>STUFFY CARD BINDER ({totalCardsInBinder})</span>
          </button>
        </div>

        {/* Status Notification */}
        {notification && (
          <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-400 text-amber-200 text-xs font-pixel text-center animate-fadeIn">
            {notification}
          </div>
        )}

        {/* TAB 1: REWARD PACKS */}
        {activeTab === 'packs' && (
          <div>
            {revealedCards ? (
              /* CARD OPENING REVEAL ANIMATION */
              <div className="flex flex-col items-center gap-6 py-6 animate-fadeIn">
                <div className="text-center">
                  <span className="text-5xl block animate-bounce mb-2">🎁✨</span>
                  <h3 className="font-pixel text-lg text-yellow-300 font-extrabold">
                    {openingPack?.name.toUpperCase()} OPENED!
                  </h3>
                  <p className="font-sans text-xs text-slate-300 mt-1">
                    You pulled {revealedCards.length} Stuffy Card{revealedCards.length === 1 ? '' : 's'}! Added to your Stuffy Card Binder.
                  </p>
                </div>

                {revealedCards.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700 text-center max-w-sm">
                    <span className="text-4xl block mb-2">💨</span>
                    <p className="font-pixel text-xs text-slate-400">
                      Empty pack! Better luck next time plush warrior!
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl">
                    {revealedCards.map((card, idx) => {
                      const species = STUFFY_MAP.get(card.speciesId);
                      return (
                        <div
                          key={`${card.speciesId}_${idx}`}
                          className="w-36 p-3 rounded-2xl bg-gradient-to-b from-slate-900 via-purple-950/70 to-slate-900 border-2 border-amber-400/80 shadow-xl shadow-amber-950/50 flex flex-col items-center text-center animate-scale-in"
                        >
                          <div className="w-16 h-16 flex items-center justify-center my-1">
                            {species ? (
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
                                size={56}
                              />
                            ) : (
                              <span className="text-3xl">🧸</span>
                            )}
                          </div>
                          <span className="font-pixel text-xs text-yellow-300 font-bold mt-1 truncate max-w-full">
                            {species?.name || card.name}
                          </span>
                          <span className="font-pixel text-[9px] text-amber-400/90 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 mt-1.5">
                            +1 STUFFY CARD
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => {
                    sound.playClickSound();
                    setRevealedCards(null);
                    setOpeningPack(null);
                  }}
                  className="mt-2 font-pixel text-xs px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold rounded-2xl shadow-xl cursor-pointer transition-all"
                >
                  COLLECT &amp; GO TO STAR CHAMBER ➔
                </button>
              </div>
            ) : (packs || []).length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center gap-3">
                <span className="text-5xl opacity-40">📦</span>
                <h3 className="font-pixel text-sm text-slate-400">NO UNOPENED PACKS</h3>
                <p className="font-sans text-xs text-slate-500 max-w-md">
                  Defeat Act Bosses at the end of each Act to earn Stuffy Packs (Common to Legendary), or use the admin command <span className="font-mono text-amber-400">/.pack [rarity]</span> to test!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(packs || []).map((pack) => {
                  const theme = RARITY_THEMES[pack.rarity] || RARITY_THEMES.common;
                  return (
                    <div
                      key={pack.id}
                      className={`p-4 rounded-2xl border-2 ${theme.border} bg-gradient-to-b ${theme.bg} ${theme.glow} flex flex-col justify-between shadow-lg transition-all hover:scale-102`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl">{theme.icon}</span>
                          <span className={`font-pixel text-[9px] uppercase px-2 py-0.5 rounded border font-bold ${theme.badge}`}>
                            {pack.rarity}
                          </span>
                        </div>
                        <h4 className={`font-pixel text-sm font-bold ${theme.text}`}>
                          {pack.name}
                        </h4>
                        <p className="font-sans text-xs text-slate-300 mt-1 mb-3">
                          Pulls 0 to 5 Stuffy Cards. Duplicate cards can be fused in the Star Chamber to raise stuffy star ratings up to 10★!
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenPack(pack)}
                        className="w-full font-pixel text-xs py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold rounded-xl border border-yellow-300 shadow cursor-pointer transition-all"
                      >
                        OPEN PACK ➔
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STAR FUSION CHAMBER */}
        {activeTab === 'fuse' && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900/80 border border-slate-700 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
                  <span>⭐</span>
                  <span>HOW 10-STAR EVOLUTION WORKS:</span>
                </h4>
                <p className="font-sans text-[11px] text-slate-300 mt-0.5">
                  Combine <span className="text-amber-300 font-bold">2 identical Stuffy Cards</span> from your Card Binder to raise a stuffy&apos;s star level by +1 (capped at 10 Stars). Every star above 5 adds <span className="text-emerald-300 font-bold">+10% Max HP</span> and <span className="text-cyan-300 font-bold">+4 Speed</span>!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-1">
              {allStuffies.map((stuffy) => {
                const currentStars = Math.max(1, Math.min(10, stuffy.stars ?? 5));
                const availableCards = (stuffyCards || {})[stuffy.speciesId] || 0;
                const isMax = currentStars >= 10;
                const canFuse = !isMax && availableCards >= 2;
                const species = STUFFY_MAP.get(stuffy.speciesId);

                return (
                  <div
                    key={stuffy.instanceId}
                    className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      isMax
                        ? 'bg-amber-950/30 border-amber-400/80'
                        : canFuse
                        ? 'bg-slate-900/90 border-fuchsia-500/80 shadow-lg shadow-fuchsia-950/40'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-700">
                        <StuffySprite stuffy={stuffy} size={50} />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-pixel text-sm text-yellow-300 font-bold">
                            {stuffy.name}
                          </h4>
                          <span className="font-pixel text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 font-bold">
                            {currentStars}★ / 10★
                          </span>
                        </div>

                        {/* Stars Indicator */}
                        <div className="flex items-center gap-0.5 my-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${
                                i < currentStars ? 'text-amber-400 drop-shadow-[0_0_4px_#f59e0b]' : 'text-slate-700'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>

                        <div className="text-[11px] font-mono text-slate-400">
                          {stuffy.currentHp}/{stuffy.maxHp} HP • <span className="text-cyan-400">{stuffy.speed ?? 100} Speed</span>
                        </div>

                        <div className="text-[10px] font-pixel text-fuchsia-300 mt-1">
                          Cards in Binder: <span className="font-bold text-yellow-300">{availableCards}</span> / 2 required
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isMax ? (
                        <span className="font-pixel text-[10px] text-amber-300 bg-amber-950/90 border border-amber-400 px-3 py-1.5 rounded-xl font-bold">
                          MAX (10★)
                        </span>
                      ) : (
                        <button
                          disabled={!canFuse}
                          onClick={() => handleFuseStar(stuffy)}
                          className={`font-pixel text-[11px] px-3.5 py-2 rounded-xl border transition-all cursor-pointer font-bold ${
                            canFuse
                              ? 'bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-500 hover:to-amber-400 text-white border-yellow-300 shadow-md shadow-fuchsia-950 hover:scale-105 active:scale-95'
                              : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          FUSE 2 ➔ +1★
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STUFFY CARD BINDER */}
        {activeTab === 'binder' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-xs text-slate-300">
                All plush species cards currently stored in your Card Binder. Earn more by opening Act Packs!
              </p>
              <span className="font-pixel text-xs text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-500/40">
                Total Cards: {totalCardsInBinder}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[55vh] overflow-y-auto pr-1">
              {PLAYABLE_STUFFIES.map((species) => {
                const count = (stuffyCards || {})[species.id] || 0;
                return (
                  <div
                    key={species.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      count > 0
                        ? 'bg-slate-900/90 border-amber-500/50 shadow'
                        : 'bg-slate-950/40 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 flex items-center justify-center bg-slate-950 rounded-lg border border-slate-800">
                        <StuffySprite
                          stuffy={{
                            instanceId: `binder_${species.id}`,
                            speciesId: species.id,
                            name: species.name,
                            maxHp: species.baseHp,
                            currentHp: species.baseHp,
                            shield: 0,
                            isUnstuffed: false,
                            statusEffects: [],
                          }}
                          size={40}
                        />
                      </div>
                      <div>
                        <h5 className="font-pixel text-xs text-yellow-300 font-bold truncate max-w-[90px]">
                          {species.name}
                        </h5>
                        <p className="text-[10px] text-slate-400">{species.species}</p>
                      </div>
                    </div>

                    <div className="font-pixel text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-1 rounded border border-amber-500/40">
                      x{count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};