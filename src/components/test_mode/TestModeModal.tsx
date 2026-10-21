'use client';

import React, { useState } from 'react';
import { sound } from '@/utils/audio';
import { StuffyState, Card, CardTier } from '@/types/game';
import { PLAYABLE_STUFFIES, STUFFY_MAP } from '@/data/stuffies';
import { ALL_CARDS } from '@/data/cards';
import { StuffySprite } from '@/components/battle/StuffySprite';

interface TestModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTestBattle: (
    playerTeam: StuffyState[],
    playerDeck: Card[],
    enemyType: 'dummy' | 'mirror' | 'amalgam',
    dummyHp?: number,
    dummyShield?: number
  ) => void;
}

const TIERS_ORDERED: CardTier[] = ['S', 'A', 'B', 'C', 'D', 'F'];

const TIER_COLORS: Record<CardTier, { bg: string; text: string; border: string }> = {
  S: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-400' },
  A: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-400' },
  B: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-400' },
  C: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-400' },
  D: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500' },
  F: { bg: 'bg-stone-500/20', text: 'text-stone-400', border: 'border-stone-500' },
};

export const TestModeModal: React.FC<TestModeModalProps> = ({
  isOpen,
  onClose,
  onStartTestBattle,
}) => {
  // Initial team: Alex, Allie, Big Bear
  const [team, setTeam] = useState<StuffyState[]>([
    {
      instanceId: 'test_alex_1',
      speciesId: 'alex',
      name: 'Alex',
      maxHp: 80,
      currentHp: 80,
      shield: 0,
      isUnstuffed: false,
      statusEffects: [],
    },
    {
      instanceId: 'test_allie_2',
      speciesId: 'allie',
      name: 'Allie',
      maxHp: 82,
      currentHp: 82,
      shield: 0,
      isUnstuffed: false,
      statusEffects: [],
    },
    {
      instanceId: 'test_big_bear_3',
      speciesId: 'big_bear',
      name: 'Big Bear',
      maxHp: 120,
      currentHp: 120,
      shield: 0,
      isUnstuffed: false,
      isAsleep: true,
      statusEffects: [],
    },
  ]);

  // Initial starter cards for test deck
  const [deck, setDeck] = useState<Card[]>(() => {
    return ALL_CARDS.filter(
      (c) =>
        (c.stuffyId === 'alex' && (c.tier === 'S' || c.tier === 'A' || c.tier === 'F')) ||
        (c.stuffyId === 'allie' && (c.tier === 'S' || c.tier === 'B' || c.tier === 'F')) ||
        (c.stuffyId === 'big_bear' && (c.tier === 'S' || c.tier === 'B'))
    ).slice(0, 12);
  });

  const [enemyChoice, setEnemyChoice] = useState<'dummy' | 'mirror' | 'amalgam'>('dummy');
  const [dummyHp, setDummyHp] = useState<number>(100);
  const [dummyShield, setDummyShield] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'squad' | 'cards' | 'settings' | 'presets'>('squad');
  const [selectedTierFilter, setSelectedTierFilter] = useState<CardTier | 'ALL'>('ALL');
  const [stuffyPickerOpen, setStuffyPickerOpen] = useState(false);

  // Preset Saving & Loading
  const [presets, setPresets] = useState<{ name: string; team: StuffyState[]; cardIds: string[]; savedAt: number }[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('ben_stuffy_test_presets_v1');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [newPresetName, setNewPresetName] = useState('');
  const [presetFeedback, setPresetFeedback] = useState<string | null>(null);

  const handleSavePreset = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const name = newPresetName.trim() || `Preset ${presets.length + 1}`;
    const newP = {
      name,
      team: JSON.parse(JSON.stringify(team)),
      cardIds: deck.map((c) => c.id),
      savedAt: Date.now(),
    };
    const updated = [newP, ...presets];
    setPresets(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ben_stuffy_test_presets_v1', JSON.stringify(updated));
    }
    sound.playRewardSound();
    setNewPresetName('');
    setPresetFeedback(`Saved preset "${name}"!`);
    setTimeout(() => setPresetFeedback(null), 3000);
  };

  const handleLoadPreset = (preset: { name: string; team: StuffyState[]; cardIds: string[] }) => {
    sound.playRewardSound();
    setTeam(JSON.parse(JSON.stringify(preset.team)));
    const loadedCards = preset.cardIds
      .map((id) => ALL_CARDS.find((c) => c.id === id))
      .filter((c): c is Card => Boolean(c));
    setDeck(loadedCards);
    setPresetFeedback(`Loaded preset "${preset.name}"!`);
    setTimeout(() => setPresetFeedback(null), 3000);
  };

  const handleDeletePreset = (idx: number) => {
    sound.playClickSound();
    const updated = presets.filter((_, i) => i !== idx);
    setPresets(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ben_stuffy_test_presets_v1', JSON.stringify(updated));
    }
  };

  if (!isOpen) return null;

  // Add stuffy to team (Enforce max 5 stuffies strictly)
  const handleAddStuffy = (speciesId: string) => {
    if (team.length >= 5) {
      sound.playUndoSound();
      return;
    }
    const def = STUFFY_MAP.get(speciesId);
    if (!def) return;

    sound.playRewardSound();
    const newStuffy: StuffyState = {
      instanceId: `test_${speciesId}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      speciesId: def.id,
      name: def.name,
      maxHp: def.baseHp,
      currentHp: def.baseHp,
      shield: 0,
      isUnstuffed: false,
      isAsleep: def.id === 'big_bear' ? true : undefined,
      statusEffects: [],
    };
    setTeam([...team, newStuffy]);
    setStuffyPickerOpen(false);
  };

  // Remove stuffy from team
  const handleRemoveStuffy = (instanceId: string) => {
    if (team.length <= 1) {
      sound.playUndoSound();
      return;
    }
    sound.playClickSound();
    setTeam(team.filter((s) => s.instanceId !== instanceId));
  };

  // Adjust energy for a stuffy (Capped at 1000 max)
  const handleSetEnergy = (instanceId: string, energyVal: number) => {
    const clampedEnergy = Math.max(0, Math.min(1000, Math.floor(energyVal || 0)));
    setTeam(
      team.map((s) => {
        if (s.instanceId !== instanceId) return s;
        const filtered = s.statusEffects.filter((e) => e.type !== 'energy');
        if (clampedEnergy > 0) {
          filtered.push({ type: 'energy', value: clampedEnergy });
        }
        return {
          ...s,
          statusEffects: filtered,
        };
      })
    );
  };

  // Card Management
  const handleAddCardToDeck = (card: Card) => {
    sound.playCardSound();
    setDeck([...deck, card]);
  };

  const handleRemoveCardFromDeck = (cardIndex: number) => {
    sound.playClickSound();
    const copy = [...deck];
    copy.splice(cardIndex, 1);
    setDeck(copy);
  };

  // Filter and organize cards by Tier, then Stuffy
  const visibleTiers = selectedTierFilter === 'ALL' ? TIERS_ORDERED : [selectedTierFilter];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto select-none">
      <div className="bg-slate-900 border-4 border-emerald-500 max-w-4xl w-full rounded-2xl p-4 sm:p-5 shadow-2xl relative flex flex-col gap-4 text-center my-auto max-h-[96vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClickSound();
            onClose();
          }}
          className="absolute top-3 right-3 text-slate-400 hover:text-white font-pixel text-base cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div>
          <h2 className="font-pixel text-xl sm:text-2xl text-emerald-400 font-bold tracking-wider flex items-center justify-center gap-2">
            <span>🧪</span>
            <span>TEST MODE (SANDBOX &amp; COMBOS)</span>
          </h2>
          <p className="font-pixel text-[10px] text-slate-400 mt-1">
            Build custom squads (up to 5 stuffies), forge tailored decks by Tier &amp; Stuffy, and test combos freely with crackers removed!
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('squad');
            }}
            className={`font-pixel text-[10px] sm:text-xs py-2 px-1 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 ${
              activeTab === 'squad'
                ? 'bg-emerald-600 text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🧸 SQUAD</span>
            <span className="text-[9px] bg-slate-900 px-1 py-0.5 rounded-full border border-emerald-400/50">
              {team.length}/5
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('cards');
            }}
            className={`font-pixel text-[10px] sm:text-xs py-2 px-1 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 ${
              activeTab === 'cards'
                ? 'bg-emerald-600 text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎴 CARDS</span>
            <span className="text-[9px] bg-slate-900 px-1 py-0.5 rounded-full border border-emerald-400/50">
              {deck.length}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('settings');
            }}
            className={`font-pixel text-[10px] sm:text-xs py-2 px-1 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚙️ SETTINGS</span>
          </button>

          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('presets');
            }}
            className={`font-pixel text-[10px] sm:text-xs py-2 px-1 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 ${
              activeTab === 'presets'
                ? 'bg-emerald-600 text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💾 PRESETS</span>
            {presets.length > 0 && (
              <span className="text-[9px] bg-slate-900 px-1 py-0.5 rounded-full border border-emerald-400/50">
                {presets.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: SQUAD BUILDER */}
        {activeTab === 'squad' && (
          <div className="flex flex-col gap-3 text-left">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-yellow-300 font-bold">
                TEAM STUFFIES (MAX 5):
              </span>
              <button
                disabled={team.length >= 5}
                onClick={() => {
                  sound.playClickSound();
                  setStuffyPickerOpen(true);
                }}
                className={`font-pixel text-xs py-1.5 px-3 rounded-lg border font-bold cursor-pointer transition-all ${
                  team.length >= 5
                    ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
                    : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white hover:scale-105 active:scale-95'
                }`}
              >
                {team.length >= 5 ? 'TEAM FULL (MAX 5)' : '+ ADD STUFFY'}
              </button>
            </div>

            {/* Current Team Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {team.map((s, idx) => {
                const currentEnergy =
                  s.statusEffects.find((e) => e.type === 'energy')?.value || 0;
                return (
                  <div
                    key={s.instanceId}
                    className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col justify-between gap-2 shadow"
                  >
                    <div className="flex items-center gap-3">
                      <StuffySprite stuffy={s} size={48} />
                      <div className="font-pixel">
                        <div className="text-sm text-yellow-300 font-bold">
                          #{idx + 1} {s.name}
                        </div>
                        <div className="text-[10px] text-emerald-400">
                          HP: {s.maxHp}/{s.maxHp}
                        </div>
                        {s.speciesId === 'big_bear' && (
                          <div className="text-[9px] text-blue-300">
                            💤 Asleep (+15 Shld, +5 HP/turn)
                          </div>
                        )}
                        {s.speciesId === 'allie' && (
                          <div className="text-[9px] text-emerald-300">
                            🐊 Death Roll (50% Lifesteal vs Weak/Bleed)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Starting Energy input (Capped at 1000) */}
                    <div className="flex items-center justify-between bg-slate-900 p-1.5 rounded-lg border border-slate-800 font-pixel text-[10px]">
                      <span className="text-amber-400 flex items-center gap-1">
                        <span>⚡ Starting Energy:</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={1000}
                          value={currentEnergy}
                          onChange={(e) =>
                            handleSetEnergy(s.instanceId, parseInt(e.target.value) || 0)
                          }
                          className="w-16 bg-slate-950 border border-amber-500/50 rounded px-1.5 py-0.5 text-right text-yellow-300 font-pixel text-xs focus:outline-none"
                        />
                        <span className="text-[9px] text-slate-500">/ 1000 max</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveStuffy(s.instanceId)}
                      disabled={team.length <= 1}
                      className="font-pixel text-[9px] bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-red-300 py-1 rounded-lg cursor-pointer transition-all hover:scale-102 active:scale-98 disabled:opacity-40"
                    >
                      REMOVE STUFFY ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: DECK BUILDER (Organized by Tier, then Stuffy) */}
        {activeTab === 'cards' && (
          <div className="flex flex-col gap-3 text-left">
            {/* Current Deck Summary */}
            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="font-pixel text-xs">
                <span className="text-yellow-300 font-bold">DECK: </span>
                <span className="text-emerald-400 font-bold">{deck.length} Cards</span>
                <span className="text-slate-400 text-[10px] ml-2">
                  (Click any card in deck to remove, click card below to add)
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    sound.playClickSound();
                    // Add S-Tier cards
                    const sCards = ALL_CARDS.filter((c) => c.tier === 'S');
                    setDeck([...deck, ...sCards]);
                  }}
                  className="font-pixel text-[9px] bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500 text-amber-200 px-2.5 py-1 rounded cursor-pointer"
                >
                  + ALL S-TIER
                </button>
                <button
                  onClick={() => {
                    sound.playClickSound();
                    setDeck([]);
                  }}
                  className="font-pixel text-[9px] bg-red-950/70 hover:bg-red-900 border border-red-700 text-red-200 px-2.5 py-1 rounded cursor-pointer"
                >
                  CLEAR DECK
                </button>
              </div>
            </div>

            {/* Active Deck Chips */}
            {deck.length > 0 && (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar p-1.5 bg-slate-950/50 rounded-xl border border-slate-800">
                {deck.map((c, i) => {
                  const style = TIER_COLORS[c.tier] || TIER_COLORS.F;
                  return (
                    <button
                      key={`${c.id}_${i}`}
                      onClick={() => handleRemoveCardFromDeck(i)}
                      className={`font-pixel text-[9px] px-2 py-0.5 rounded border ${style.border} ${style.bg} ${style.text} flex items-center gap-1 hover:line-through cursor-pointer shadow`}
                      title="Click to remove from deck"
                    >
                      <span className="font-bold">[{c.tier}]</span>
                      <span>{c.name}</span>
                      <span className="text-yellow-300">({c.cost}🍪)</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tier Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="font-pixel text-[10px] text-slate-400 font-bold mr-1">
                FILTER TIER:
              </span>
              <button
                onClick={() => setSelectedTierFilter('ALL')}
                className={`font-pixel text-[9px] px-2.5 py-1 rounded cursor-pointer border ${
                  selectedTierFilter === 'ALL'
                    ? 'bg-slate-200 text-slate-900 border-white font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                ALL TIERS
              </button>
              {TIERS_ORDERED.map((tier) => {
                const style = TIER_COLORS[tier];
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTierFilter(tier)}
                    className={`font-pixel text-[9px] px-2.5 py-1 rounded cursor-pointer border ${
                      selectedTierFilter === tier
                        ? `${style.bg} ${style.text} ${style.border} font-bold ring-1 ring-white/50`
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    TIER {tier}
                  </button>
                );
              })}
            </div>

            {/* Cards Organized By Tier First, Then Stuffy */}
            <div className="flex flex-col gap-4 max-h-80 overflow-y-auto no-scrollbar pr-1">
              {visibleTiers.map((tier) => {
                const cardsInTier = ALL_CARDS.filter((c) => c.tier === tier);
                if (cardsInTier.length === 0) return null;

                // Group cards by Stuffy
                const stuffyGroups: Record<string, Card[]> = {};
                cardsInTier.forEach((c) => {
                  const sId = c.stuffyId || 'generic';
                  if (!stuffyGroups[sId]) stuffyGroups[sId] = [];
                  stuffyGroups[sId].push(c);
                });

                const style = TIER_COLORS[tier];

                return (
                  <div
                    key={tier}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-pixel text-xs px-2 py-0.5 rounded border ${style.border} ${style.bg} ${style.text} font-bold`}
                        >
                          TIER {tier}
                        </span>
                        <span className="font-pixel text-[10px] text-slate-400">
                          ({cardsInTier.length} Available Cards)
                        </span>
                      </div>
                    </div>

                    {/* Stuffy Groups */}
                    <div className="flex flex-col gap-3">
                      {Object.entries(stuffyGroups).map(([stuffyId, sCards]) => {
                        const stuffyDef = STUFFY_MAP.get(stuffyId);
                        const displayName = stuffyDef ? stuffyDef.name : 'Universal / Power-Up';
                        return (
                          <div key={stuffyId} className="flex flex-col gap-1.5 pl-1">
                            <span className="font-pixel text-[10px] text-yellow-300 font-bold flex items-center gap-1.5">
                              <span>🧸</span>
                              <span>{displayName}</span>
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {sCards.map((card) => (
                                <div
                                  key={card.id}
                                  onClick={() => handleAddCardToDeck(card)}
                                  className="bg-slate-900 hover:bg-slate-850 border border-slate-750 hover:border-emerald-400 p-2 rounded-xl cursor-pointer transition-all flex flex-col justify-between gap-1 shadow hover:scale-[1.02] active:scale-98"
                                >
                                  <div>
                                    <div className="flex items-center justify-between font-pixel">
                                      <span className="text-xs text-white font-bold truncate">
                                        {card.name}
                                      </span>
                                      <span className="text-[10px] text-yellow-400 font-bold shrink-0">
                                        {card.cost} 🍪
                                      </span>
                                    </div>
                                    <div className="text-[9px] text-slate-400 font-mono line-clamp-2 mt-0.5">
                                      {card.description}
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 font-pixel text-[8px]">
                                    <span className="text-cyan-300 uppercase">{card.type}</span>
                                    <span className="text-emerald-400 font-bold">+ ADD ➔</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS & OPPONENT */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-4 text-left">
            {/* Crackers Removed In Test Mode Banner */}
            <div className="bg-slate-950 border border-emerald-800/70 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-pixel text-xs text-emerald-400 font-bold block">
                  🚫 CRACKERS REMOVED (FREE PLAY)
                </span>
                <span className="font-pixel text-[9px] text-slate-400">
                  Crackers are completely removed in Test Mode. All cards and abilities cost 0 Crackers!
                </span>
              </div>
              <div className="font-pixel text-[10px] px-3 py-1.5 rounded-xl border font-bold bg-emerald-950/80 border-emerald-500 text-emerald-300">
                NO CRACKERS
              </div>
            </div>

            {/* Opponent Selector */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex flex-col gap-2">
              <span className="font-pixel text-xs text-yellow-300 font-bold">
                ⚔️ CHOOSE OPPONENT TARGET:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClickSound();
                    setEnemyChoice('dummy');
                  }}
                  className={`font-pixel text-xs p-3 rounded-xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                    enemyChoice === 'dummy'
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-yellow-300">🥊 Punching Bag Dummy</span>
                  <span className="text-[9px] text-slate-400">
                    5 docile training dummies (100 HP each) to test maximum damage combos!
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClickSound();
                    setEnemyChoice('mirror');
                  }}
                  className={`font-pixel text-xs p-3 rounded-xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                    enemyChoice === 'mirror'
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-cyan-300">🪞 Mirror Squad</span>
                  <span className="text-[9px] text-slate-400">
                    AI team duplicating your exact selected stuffies!
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClickSound();
                    setEnemyChoice('amalgam');
                  }}
                  className={`font-pixel text-xs p-3 rounded-xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                    enemyChoice === 'amalgam'
                      ? 'bg-emerald-950 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-red-400">🧩 Boss: The Amalgam</span>
                  <span className="text-[9px] text-slate-400">
                    Test your build against the ultimate splitting mega-boss!
                  </span>
                </button>
              </div>

              {/* Custom Punching Dummy HP & Shield Controls */}
              {enemyChoice === 'dummy' && (
                <div className="bg-slate-900/90 border-2 border-emerald-500/60 p-3 rounded-xl flex flex-col gap-2.5 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-[10px] text-emerald-300 font-bold flex items-center gap-1.5">
                      <span>🥊</span>
                      <span>PUNCH DUMMY STATS (APPLIED TO ALL 5 DUMMIES):</span>
                    </span>
                    <span className="font-pixel text-[8px] text-slate-400">
                      Up to 9999 HP &amp; Shield
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* HP Config */}
                    <div className="flex flex-col gap-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="font-pixel text-[8px] text-red-300 font-bold">
                          ❤️ DUMMY HP (1 - 9999):
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={9999}
                          value={dummyHp}
                          onChange={(e) =>
                            setDummyHp(Math.max(1, Math.min(9999, parseInt(e.target.value) || 1)))
                          }
                          className="w-16 bg-slate-900 border border-slate-700 text-yellow-300 font-pixel text-[10px] px-1.5 py-0.5 rounded text-right focus:outline-none focus:border-red-400"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-1 mt-0.5">
                        {[100, 250, 1000, 9999].map((hpVal) => (
                          <button
                            key={hpVal}
                            type="button"
                            onClick={() => {
                              sound.playClickSound();
                              setDummyHp(hpVal);
                            }}
                            className={`font-pixel text-[7px] py-1 rounded border cursor-pointer transition-all ${
                              dummyHp === hpVal
                                ? 'bg-red-900 border-red-400 text-white font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {hpVal === 9999 ? '9999' : `${hpVal}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shield Config */}
                    <div className="flex flex-col gap-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="font-pixel text-[8px] text-sky-300 font-bold">
                          🛡️ DUMMY SHIELD (0 - 9999):
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={9999}
                          value={dummyShield}
                          onChange={(e) =>
                            setDummyShield(Math.max(0, Math.min(9999, parseInt(e.target.value) || 0)))
                          }
                          className="w-16 bg-slate-900 border border-slate-700 text-yellow-300 font-pixel text-[10px] px-1.5 py-0.5 rounded text-right focus:outline-none focus:border-sky-400"
                        />
                      </div>
                      <div className="grid grid-cols-4 gap-1 mt-0.5">
                        {[0, 50, 250, 9999].map((shVal) => (
                          <button
                            key={shVal}
                            type="button"
                            onClick={() => {
                              sound.playClickSound();
                              setDummyShield(shVal);
                            }}
                            className={`font-pixel text-[7px] py-1 rounded border cursor-pointer transition-all ${
                              dummyShield === shVal
                                ? 'bg-sky-900 border-sky-400 text-white font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {shVal === 9999 ? '9999' : `${shVal}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PRESETS (Save & Load Test Squads & Decks) */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-3 text-left">
            {presetFeedback && (
              <div className="font-pixel text-xs bg-emerald-950/80 border border-emerald-500 text-emerald-200 p-2 rounded-xl text-center animate-pulse">
                {presetFeedback}
              </div>
            )}

            {/* Save Current Preset Box */}
            <form
              onSubmit={handleSavePreset}
              className="bg-slate-950 border border-emerald-500/50 p-3 rounded-xl flex flex-col gap-2"
            >
              <label className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
                <span>💾</span>
                <span>SAVE CURRENT SQUAD &amp; DECK AS PRESET:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Preset Name (e.g. Allie Bleed Lifesteal Burst)..."
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 font-pixel text-xs text-yellow-300 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="font-pixel text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  SAVE 💾
                </button>
              </div>
            </form>

            {/* Saved Presets List */}
            <div className="flex flex-col gap-2">
              <span className="font-pixel text-xs text-slate-300 font-bold">
                SAVED PRESETS ({presets.length}):
              </span>
              {presets.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center font-pixel text-xs text-slate-500">
                  No presets saved yet. Build a squad &amp; deck and save it here to reload anytime!
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-64 overflow-y-auto no-scrollbar">
                  {presets.map((p, idx) => (
                    <div
                      key={`${p.name}_${idx}`}
                      className="bg-slate-950 border border-slate-800 hover:border-emerald-500/60 p-3 rounded-xl flex items-center justify-between"
                    >
                      <div className="font-pixel text-left">
                        <span className="text-sm text-yellow-300 font-bold block">{p.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>🧸 {p.team.length} Stuffies</span>
                          <span>•</span>
                          <span>🎴 {p.cardIds.length} Cards</span>
                          <span>•</span>
                          <span className="text-slate-500">
                            {new Date(p.savedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLoadPreset(p)}
                          className="font-pixel text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:scale-105 active:scale-95 shadow"
                        >
                          LOAD ➔
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePreset(idx)}
                          className="font-pixel text-xs bg-red-950 hover:bg-red-900 border border-red-700/60 text-red-300 px-2.5 py-1.5 rounded-lg cursor-pointer hover:scale-105 active:scale-95"
                          title="Delete preset"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Start Combat Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="text-left font-pixel text-[10px] text-slate-400">
            <div>
              Team: <strong className="text-yellow-300">{team.length}/5 Stuffies</strong> • Deck:{' '}
              <strong className="text-emerald-400">{deck.length} Cards</strong>
            </div>
            <div>
              Rules:{' '}
              <strong className="text-emerald-400">
                Free Combos (Crackers Removed)
              </strong>
            </div>
          </div>

          <button
            onClick={() => {
              if (team.length === 0 || deck.length === 0) {
                sound.playUndoSound();
                return;
              }
              sound.playRewardSound();
              onStartTestBattle(team, deck, enemyChoice, dummyHp, dummyShield);
              onClose();
            }}
            disabled={team.length === 0 || deck.length === 0}
            className="w-full sm:w-auto font-pixel text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl border-2 border-emerald-300 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            START TEST BATTLE ⚔️
          </button>
        </div>

        {/* Stuffy Selection Picker Modal */}
        {stuffyPickerOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border-4 border-yellow-400 max-w-2xl w-full rounded-2xl p-5 shadow-2xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-pixel text-sm text-yellow-300 font-bold">
                  SELECT STUFFY TO ADD TO TEAM ({team.length}/5):
                </h3>
                <button
                  onClick={() => setStuffyPickerOpen(false)}
                  className="font-pixel text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {PLAYABLE_STUFFIES.map((stuffy) => (
                  <div
                    key={stuffy.id}
                    onClick={() => handleAddStuffy(stuffy.id)}
                    className="bg-slate-950 border border-slate-800 hover:border-yellow-400 p-2.5 rounded-xl cursor-pointer transition-all flex flex-col items-center text-center gap-1.5 hover:scale-105 active:scale-95 shadow"
                  >
                    <StuffySprite
                      stuffy={{
                        instanceId: `preview_${stuffy.id}`,
                        speciesId: stuffy.id,
                        name: stuffy.name,
                        maxHp: stuffy.baseHp,
                        currentHp: stuffy.baseHp,
                        shield: 0,
                        isUnstuffed: false,
                        statusEffects: [],
                      }}
                      size={42}
                    />
                    <div className="font-pixel">
                      <div className="text-xs text-white font-bold">{stuffy.name}</div>
                      <div className="text-[9px] text-emerald-400">{stuffy.baseHp} HP</div>
                      <div className="text-[8px] text-slate-400 capitalize truncate max-w-[100px]">
                        {stuffy.features[0] || 'plush'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
