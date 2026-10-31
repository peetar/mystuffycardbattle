'use client';

import React, { useState, useEffect } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { PLAYABLE_STUFFIES, STUFFY_MAP, getStarBonus } from '@/data/stuffies';
import { PackRarity, StuffyPack, StuffyCardItem, StuffyState, GameItem, ItemRarity } from '@/types/game';
import { StuffySprite } from '@/components/battle/StuffySprite';
import { sound } from '@/utils/audio';
import {
  getAllRosterStars,
  getRosterStars,
  normalizeStuffyCards,
  getTotalBinderCardsCount,
  getSpeciesCardCount,
} from '@/utils/rosterStars';
import {
  getItemInventory,
  saveItemInventory,
  evolveItems,
  generateRandomItem,
  NEXT_RARITY_MAP,
} from '@/data/items';

export type StarChamberTab = 'binder' | 'fuse' | 'items' | 'packs';

interface StarChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: StarChamberTab;
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

const ITEM_RARITY_COLORS: Record<ItemRarity, { border: string; text: string; bg: string }> = {
  common: { border: 'border-slate-600', text: 'text-slate-300', bg: 'bg-slate-900' },
  uncommon: { border: 'border-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-950/60' },
  rare: { border: 'border-cyan-500', text: 'text-cyan-400', bg: 'bg-cyan-950/60' },
  epic: { border: 'border-purple-500', text: 'text-purple-400', bg: 'bg-purple-950/60' },
  legendary: { border: 'border-amber-400', text: 'text-amber-300', bg: 'bg-amber-950/70' },
};

export const StarChamberModal: React.FC<StarChamberModalProps> = ({ isOpen, onClose, initialTab = 'binder' }) => {
  const { packs, stuffyCards, activeParty, bench, openPack, fusePairToStar, mergeCardsInBinder } = useCampaignStore();

  const [activeTab, setActiveTab] = useState<StarChamberTab>(initialTab);
  const [openingPack, setOpeningPack] = useState<StuffyPack | null>(null);
  const [revealedCards, setRevealedCards] = useState<StuffyCardItem[] | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [inspectedSpeciesId, setInspectedSpeciesId] = useState<string | null>('cow');
  const [rosterStarsState, setRosterStarsState] = useState<Record<string, number>>({});

  // Item Evolution State
  const [itemInventory, setItemInventory] = useState<GameItem[]>([]);
  const [itemSlot1, setItemSlot1] = useState<GameItem | null>(null);
  const [itemSlot2, setItemSlot2] = useState<GameItem | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      setRosterStarsState(getAllRosterStars());

      // Load item inventory
      let items = getItemInventory();
      if (items.length === 0) {
        const starter: GameItem[] = [
          generateRandomItem('helmet', 'uncommon'),
          generateRandomItem('chestplate', 'uncommon'),
          generateRandomItem('gloves', 'rare'),
          generateRandomItem('sword', 'rare'),
          generateRandomItem('offhand', 'epic'),
          generateRandomItem('pendant', 'rare'),
        ];
        saveItemInventory(starter);
        items = starter;
      }
      setItemInventory(items);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const normalizedCards = normalizeStuffyCards(stuffyCards);
  const totalCardsInBinder = getTotalBinderCardsCount(normalizedCards);

  const squadStuffies: StuffyState[] = [...activeParty, ...bench];

  const allStuffies: StuffyState[] =
    squadStuffies.length > 0
      ? squadStuffies
      : PLAYABLE_STUFFIES.map((sp) => {
          const stars = rosterStarsState[sp.id] ?? getRosterStars(sp.id);
          const baseSpd = sp.baseSpeed ?? 100;
          const { hpBonus, speedBonus } = getStarBonus(stars, sp.baseHp);
          return {
            instanceId: `roster_${sp.id}`,
            speciesId: sp.id,
            name: sp.name,
            stars,
            maxHp: sp.baseHp + hpBonus,
            currentHp: sp.baseHp + hpBonus,
            speed: baseSpd + speedBonus,
            baseSpeed: baseSpd,
            shield: 0,
            isUnstuffed: false,
            statusEffects: [],
            espers: [],
          };
        });

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
      setRosterStarsState(getAllRosterStars());
    } else {
      setNotification(res.message);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleMergeCardTier = (speciesId: string, star: number) => {
    sound.playRewardSound();
    const res = mergeCardsInBinder(speciesId, star);
    if (res.success) {
      setNotification(`✨ ${res.message}`);
    } else {
      setNotification(res.message);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  // Item Evolution Handlers
  const handleSelectItemForEvolution = (item: GameItem) => {
    sound.playClickSound();
    if (!itemSlot1) {
      setItemSlot1(item);
      setNotification(`Selected ${item.name} for Slot 1. Now select another ${item.rarity.toUpperCase()} item!`);
    } else if (itemSlot1.id === item.id) {
      setItemSlot1(null);
    } else if (!itemSlot2) {
      if (item.rarity !== itemSlot1.rarity) {
        setNotification(`⚠️ Both items must be ${itemSlot1.rarity.toUpperCase()} to evolve!`);
        return;
      }
      setItemSlot2(item);
      setNotification(`Ready! Click "FUSE & EVOLVE ITEMS" to create the next tier.`);
    } else if (itemSlot2.id === item.id) {
      setItemSlot2(null);
    } else {
      if (item.rarity !== itemSlot1.rarity) {
        setNotification(`⚠️ Both items must be ${itemSlot1.rarity.toUpperCase()} to evolve!`);
        return;
      }
      setItemSlot2(item);
    }
  };

  const handleExecuteItemEvolution = () => {
    if (!itemSlot1 || !itemSlot2) return;
    const res = evolveItems(itemSlot1.id, itemSlot2.id);
    if (res.success && res.newItem) {
      sound.playRewardSound();
      setNotification(`🎉 ITEM EVOLVED: Created ${res.newItem.name} (${res.newItem.rarity.toUpperCase()})!`);
      setItemSlot1(null);
      setItemSlot2(null);
      setItemInventory(getItemInventory());
    } else {
      setNotification(`❌ ${res.error || 'Evolution failed.'}`);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const nextItemTier = itemSlot1 ? NEXT_RARITY_MAP[itemSlot1.rarity] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto select-none animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-950 via-purple-950/70 to-slate-950 border-2 border-amber-500/70 rounded-3xl max-w-4xl w-full p-5 md:p-8 shadow-2xl shadow-amber-950/80 flex flex-col gap-5 text-white animate-scale-in max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🔬</span>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-pixel text-[10px]">
                <span>VERSION 3.9</span>
                <span>•</span>
                <span>1★+1★=2★, 2★+2★=3★ MERGE EVOLUTION</span>
              </div>
              <h2 className="font-pixel text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-fuchsia-300 font-extrabold tracking-wide">
                EVOLUTION LAB &amp; CARD BINDER
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
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
          {/* TAB 1: CARD BINDER */}
          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('binder');
              setRevealedCards(null);
            }}
            className={`font-pixel text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'binder'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-lg shadow-cyan-500/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>📖</span>
            <span>CARD BINDER ({totalCardsInBinder})</span>
          </button>

          {/* TAB 2: PLUSH 10★ EVOLUTION */}
          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('fuse');
              setRevealedCards(null);
            }}
            className={`font-pixel text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'fuse'
                ? 'bg-gradient-to-r from-fuchsia-500 to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>⭐</span>
            <span>10★ PLUSH EVOLUTION</span>
          </button>

          {/* TAB 3: ITEM EVOLUTION LAB */}
          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('items');
              setRevealedCards(null);
            }}
            className={`font-pixel text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'items'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold shadow-lg shadow-yellow-500/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>🧰</span>
            <span>ITEM EVOLUTION LAB</span>
          </button>

          {/* TAB 4: REWARD PACKS */}
          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('packs');
              setRevealedCards(null);
            }}
            className={`font-pixel text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'packs'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span>🎁</span>
            <span>REWARD PACKS ({(packs || []).length})</span>
          </button>
        </div>

        {/* Status Notification */}
        {notification && (
          <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-400 text-amber-200 text-xs font-pixel text-center animate-fadeIn shadow-lg">
            {notification}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: STUFFY CARD BINDER                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'binder' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/80 border border-slate-700 p-3 rounded-2xl">
              <div>
                <h4 className="font-pixel text-xs text-cyan-300 font-bold flex items-center gap-1.5">
                  <span>📖</span>
                  <span>CARD BINDER &amp; STAR TIER MERGING:</span>
                </h4>
                <p className="font-sans text-[11px] text-slate-300 mt-0.5">
                  <span className="text-yellow-300 font-bold">1★ merges with 1★ to make 2★. 2★ merges with 2★ to make 3★</span>, up to 10★! Evolving a stuffy requires a matching star card!
                </p>
              </div>
              <span className="font-pixel text-xs text-amber-300 bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-500/40 font-bold self-start sm:self-auto">
                Total Cards: {totalCardsInBinder}
              </span>
            </div>

            {/* Species Selector Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {PLAYABLE_STUFFIES.map((sp) => {
                const spTotal = getSpeciesCardCount(normalizedCards, sp.id);
                const isSelected = (inspectedSpeciesId || 'cow') === sp.id;
                return (
                  <button
                    key={sp.id}
                    onClick={() => {
                      sound.playClickSound();
                      setInspectedSpeciesId(sp.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-pixel text-[10px] flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 shadow'
                        : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <span>{sp.name}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[9px] font-mono">
                      {spTotal}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Detailed Inspection of Selected Species Card Tiers */}
            {inspectedSpeciesId && (() => {
              const sp = STUFFY_MAP.get(inspectedSpeciesId);
              if (!sp) return null;
              const spStarsMap = normalizedCards[inspectedSpeciesId] || {};
              const rosterStar = rosterStarsState[inspectedSpeciesId] ?? getRosterStars(inspectedSpeciesId);

              return (
                <div className="bg-slate-900/90 border-2 border-cyan-500/50 rounded-2xl p-4 flex flex-col gap-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-700">
                        <StuffySprite
                          stuffy={{
                            instanceId: `binder_${sp.id}`,
                            speciesId: sp.id,
                            name: sp.name,
                            maxHp: sp.baseHp,
                            currentHp: sp.baseHp,
                            shield: 0,
                            isUnstuffed: false,
                            statusEffects: [],
                          }}
                          size={46}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-pixel text-sm text-yellow-300 font-bold">{sp.name} Cards</h3>
                          <span className="font-pixel text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                            Stuffy at {rosterStar}★
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {sp.species} • Base HP: {sp.baseHp} • Speed: {sp.baseSpeed ?? 100}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sound.playClickSound();
                        setActiveTab('fuse');
                      }}
                      className="font-pixel text-xs bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-500 hover:to-amber-400 text-white font-bold px-3 py-1.5 rounded-xl border border-yellow-300 shadow cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      GO TO EVOLUTION LAB ➔
                    </button>
                  </div>

                  {/* Star Tier Cards Grid (1★ through 10★) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 max-h-[38vh] overflow-y-auto p-1">
                    {Array.from({ length: 10 }).map((_, idx) => {
                      const tier = idx + 1;
                      const count = spStarsMap[tier] || 0;
                      const canMerge = count >= 2 && tier < 10;
                      const isMatchingStuffy = tier === rosterStar;

                      return (
                        <div
                          key={tier}
                          className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                            count > 0
                              ? isMatchingStuffy
                                ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50'
                                : 'bg-slate-950/80 border-slate-700'
                              : 'bg-black/30 border-slate-900 opacity-40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-pixel text-xs text-amber-300 font-bold">
                              {tier}★ Card
                            </span>
                            <span className="font-pixel text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                              x{count}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: tier }).map((_, s) => (
                              <span key={s} className="text-amber-400 text-[10px]">★</span>
                            ))}
                          </div>

                          {isMatchingStuffy && (
                            <span className="font-pixel text-[8px] text-amber-300 bg-amber-950/90 border border-amber-500/40 px-1.5 py-0.5 rounded text-center">
                              MATCHES {rosterStar}★ STUFFY!
                            </span>
                          )}

                          {tier < 10 ? (
                            <button
                              disabled={!canMerge}
                              onClick={() => handleMergeCardTier(sp.id, tier)}
                              className={`w-full font-pixel text-[9px] py-1.5 rounded-lg border transition-all font-bold cursor-pointer ${
                                canMerge
                                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-300 shadow hover:scale-102 active:scale-98'
                                  : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                              }`}
                              title={
                                canMerge
                                  ? `Merge two ${tier}★ cards into one ${tier + 1}★ card`
                                  : `Need 2x ${tier}★ cards to merge`
                              }
                            >
                              {canMerge ? `MERGE 2 ➔ ${tier + 1}★` : `2x ${tier}★ ➔ ${tier + 1}★`}
                            </button>
                          ) : (
                            <span className="font-pixel text-[8px] text-center text-slate-500 py-1">
                              MAX TIER (10★)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Quick overview of all species cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[30vh] overflow-y-auto pr-1">
              {PLAYABLE_STUFFIES.map((species) => {
                const count = getSpeciesCardCount(normalizedCards, species.id);
                const isSelected = inspectedSpeciesId === species.id;
                return (
                  <div
                    key={species.id}
                    onClick={() => {
                      sound.playClickSound();
                      setInspectedSpeciesId(species.id);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-400'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center bg-slate-950 rounded-lg">
                        <StuffySprite
                          stuffy={{
                            instanceId: `b_${species.id}`,
                            speciesId: species.id,
                            name: species.name,
                            maxHp: species.baseHp,
                            currentHp: species.baseHp,
                            shield: 0,
                            isUnstuffed: false,
                            statusEffects: [],
                          }}
                          size={32}
                        />
                      </div>
                      <span className="font-pixel text-xs text-yellow-300 truncate max-w-[80px]">
                        {species.name}
                      </span>
                    </div>

                    <span className="font-pixel text-xs text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40 font-bold">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 10-STAR PLUSH EVOLUTION                                            */}
        {/* ========================================================================= */}
        {activeTab === 'fuse' && (
          <div>
            <div className="bg-slate-900/80 border border-slate-700 p-3.5 rounded-2xl mb-4">
              <h4 className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
                <span>⭐</span>
                <span>HOW 10-STAR EVOLUTION WORKS:</span>
              </h4>
              <p className="font-sans text-[11px] text-slate-300 mt-1">
                A stuffy at <span className="text-amber-300 font-bold">N Stars</span> can only merge with a matching <span className="text-yellow-300 font-bold">N Star card</span> (e.g. 1★ merges with 1★ to make 2★, 5★ merges with 5★ to make 6★)! Every star above 5 adds <span className="text-emerald-300 font-bold">+10% Max HP</span> and <span className="text-cyan-300 font-bold">+4 Speed</span>!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-1">
              {allStuffies.map((stuffy) => {
                const currentStars = Math.max(1, Math.min(10, stuffy.stars ?? 5));
                const speciesCardsMap = normalizedCards[stuffy.speciesId] || {};
                const matchingCards = speciesCardsMap[currentStars] || 0;
                const isMax = currentStars >= 10;
                const canFuse = !isMax && matchingCards >= 1;

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
                          Matching {currentStars}★ Cards in Binder:{' '}
                          <span className={`font-bold ${matchingCards > 0 ? 'text-emerald-400' : 'text-yellow-300'}`}>
                            {matchingCards}
                          </span> / 1 required
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {isMax ? (
                        <span className="font-pixel text-[10px] text-amber-300 bg-amber-950/90 border border-amber-400 px-3 py-1.5 rounded-xl font-bold">
                          MAX (10★)
                        </span>
                      ) : canFuse ? (
                        <button
                          onClick={() => handleFuseStar(stuffy)}
                          className="font-pixel text-[11px] px-3.5 py-2 rounded-xl border transition-all cursor-pointer font-bold bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-500 hover:to-amber-400 text-white border-yellow-300 shadow-md shadow-fuchsia-950 hover:scale-105 active:scale-95"
                        >
                          MERGE ➔ {currentStars + 1}★
                        </button>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            disabled
                            className="font-pixel text-[10px] px-2.5 py-1.5 rounded-xl border bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                          >
                            NEEDS {currentStars}★ CARD
                          </button>
                          <button
                            onClick={() => {
                              sound.playClickSound();
                              setInspectedSpeciesId(stuffy.speciesId);
                              setActiveTab('binder');
                            }}
                            className="font-pixel text-[9px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                          >
                            Merge in Binder ➔
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ITEM EVOLUTION LAB                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'items' && (
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900/60 border border-amber-500/40 rounded-2xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <div>
                    <h4 className="font-pixel text-xs text-amber-300 font-bold flex items-center gap-1.5">
                      ITEM EVOLUTION LAB
                    </h4>
                    <p className="font-mono text-[10px] text-slate-400">
                      2 Commons ➔ 1 Uncommon • 2 Uncommons ➔ 1 Rare • 2 Rares ➔ 1 Epic • 2 Epics ➔ 1 Legendary
                    </p>
                  </div>
                </div>

                {(itemSlot1 || itemSlot2) && (
                  <button
                    onClick={() => {
                      sound.playClickSound();
                      setItemSlot1(null);
                      setItemSlot2(null);
                    }}
                    className="font-pixel text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-600 cursor-pointer self-start sm:self-auto"
                  >
                    ✕ CLEAR SLOTS
                  </button>
                )}
              </div>

              {/* Slots row */}
              <div className="flex flex-wrap items-center justify-center gap-4 bg-black/40 p-4 rounded-xl border border-slate-800">
                {/* Slot 1 */}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-pixel text-[9px] text-slate-400">SLOT 1</span>
                  {itemSlot1 ? (
                    <div
                      onClick={() => setItemSlot1(null)}
                      className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center p-1.5 cursor-pointer hover:border-red-400 transition-all ${
                        ITEM_RARITY_COLORS[itemSlot1.rarity].border
                      } ${ITEM_RARITY_COLORS[itemSlot1.rarity].bg}`}
                      title="Click to remove"
                    >
                      <span className="text-2xl">{itemSlot1.icon}</span>
                      <span className="font-pixel text-[8px] text-yellow-300 truncate max-w-[70px] text-center mt-1">
                        {itemSlot1.name}
                      </span>
                      <span className="text-[7px] font-mono uppercase text-slate-400">{itemSlot1.rarity}</span>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-600">
                      <span className="text-xl">➕</span>
                      <span className="font-pixel text-[8px] mt-1">EMPTY</span>
                    </div>
                  )}
                </div>

                <span className="text-xl text-slate-500 font-bold">+</span>

                {/* Slot 2 */}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-pixel text-[9px] text-slate-400">SLOT 2</span>
                  {itemSlot2 ? (
                    <div
                      onClick={() => setItemSlot2(null)}
                      className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center p-1.5 cursor-pointer hover:border-red-400 transition-all ${
                        ITEM_RARITY_COLORS[itemSlot2.rarity].border
                      } ${ITEM_RARITY_COLORS[itemSlot2.rarity].bg}`}
                      title="Click to remove"
                    >
                      <span className="text-2xl">{itemSlot2.icon}</span>
                      <span className="font-pixel text-[8px] text-yellow-300 truncate max-w-[70px] text-center mt-1">
                        {itemSlot2.name}
                      </span>
                      <span className="text-[7px] font-mono uppercase text-slate-400">{itemSlot2.rarity}</span>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-600">
                      <span className="text-xl">➕</span>
                      <span className="font-pixel text-[8px] mt-1">EMPTY</span>
                    </div>
                  )}
                </div>

                <span className="text-xl text-slate-500 font-bold">➔</span>

                {/* Evolution Result Preview */}
                <div className="flex flex-col items-center gap-1">
                  <span className="font-pixel text-[9px] text-slate-400">RESULT TIER</span>
                  <div className="w-20 h-20 rounded-xl border-2 border-amber-500/60 bg-amber-950/30 flex flex-col items-center justify-center p-1.5">
                    {nextItemTier ? (
                      <>
                        <span className="text-2xl animate-pulse">⭐</span>
                        <span className="font-pixel text-[9px] text-amber-300 uppercase font-bold mt-1">
                          {nextItemTier}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl text-slate-600">❓</span>
                        <span className="font-pixel text-[8px] text-slate-500 mt-1">SELECT 2</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Evolve Button */}
                <button
                  disabled={!itemSlot1 || !itemSlot2 || itemSlot1.rarity !== itemSlot2.rarity}
                  onClick={handleExecuteItemEvolution}
                  className={`font-pixel text-xs py-3 px-5 rounded-xl border-2 font-extrabold transition-all cursor-pointer shadow-lg ml-2 ${
                    itemSlot1 && itemSlot2 && itemSlot1.rarity === itemSlot2.rarity
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 border-yellow-200 shadow-yellow-600/40 hover:scale-105 active:scale-95'
                      : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  FUSE &amp; EVOLVE ITEMS
                </button>
              </div>
            </div>

            {/* Inventory selector */}
            <div className="flex flex-col gap-2">
              <span className="font-pixel text-xs text-slate-300">
                CLICK ITEMS FROM INVENTORY TO LOAD INTO EVOLUTION SLOTS:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-[38vh] overflow-y-auto p-1 bg-black/40 rounded-2xl border border-slate-800">
                {itemInventory.map((item) => {
                  const isSlot1 = itemSlot1?.id === item.id;
                  const isSlot2 = itemSlot2?.id === item.id;
                  const isSelected = isSlot1 || isSlot2;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItemForEvolution(item)}
                      className={`relative flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                        isSelected
                          ? 'border-yellow-400 ring-2 ring-yellow-400/80 bg-amber-950/80'
                          : `${ITEM_RARITY_COLORS[item.rarity].border} ${ITEM_RARITY_COLORS[item.rarity].bg} hover:border-white`
                      }`}
                      title={`${item.name} (${item.rarity})`}
                    >
                      {isSelected && (
                        <span className="absolute -top-2 -right-1 font-pixel text-[8px] bg-yellow-400 text-slate-950 px-1 rounded-full font-bold shadow">
                          {isSlot1 ? 'S1' : 'S2'}
                        </span>
                      )}
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-pixel text-[8px] text-slate-300 truncate max-w-[50px] text-center mt-1">
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: REWARD PACKS                                                       */}
        {/* ========================================================================= */}
        {activeTab === 'packs' && (
          <div>
            {openingPack && revealedCards ? (
              /* Opened pack celebration screen */
              <div className="flex flex-col items-center gap-6 py-6 animate-fadeIn">
                <div className="text-center">
                  <div className="inline-block px-3 py-1 rounded-full bg-amber-950 border border-amber-400 text-amber-300 font-pixel text-xs mb-2">
                    PACK OPENED!
                  </div>
                  <h3 className="font-pixel text-xl text-yellow-300 font-extrabold tracking-wide">
                    {openingPack.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    You pulled {revealedCards.length} Stuffy Card{revealedCards.length === 1 ? '' : 's'}! Added to your Stuffy Card Binder.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
                  {revealedCards.map((card, idx) => {
                    const species = STUFFY_MAP.get(card.speciesId);
                    const stars = card.stars || 1;
                    return (
                      <div
                        key={idx}
                        className="bg-gradient-to-b from-slate-900 to-indigo-950 border-2 border-amber-400 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-xl shadow-amber-950/40 w-36 animate-bounce-short"
                      >
                        <div className="w-16 h-16 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-700">
                          {species ? (
                            <StuffySprite
                              stuffy={{
                                instanceId: `card_${card.speciesId}`,
                                speciesId: card.speciesId,
                                name: card.name,
                                maxHp: species.baseHp,
                                currentHp: species.baseHp,
                                shield: 0,
                                isUnstuffed: false,
                                statusEffects: [],
                              }}
                              size={55}
                            />
                          ) : (
                            <span className="text-3xl">🧸</span>
                          )}
                        </div>
                        <span className="font-pixel text-xs text-yellow-300 font-bold text-center truncate max-w-[120px]">
                          {card.name}
                        </span>
                        <span className="text-[9px] font-pixel text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                          {stars}★ CARD
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      sound.playClickSound();
                      setRevealedCards(null);
                      setOpeningPack(null);
                    }}
                    className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl border border-slate-600 transition-all cursor-pointer"
                  >
                    BACK TO PACKS
                  </button>
                  <button
                    onClick={() => {
                      sound.playClickSound();
                      setRevealedCards(null);
                      setOpeningPack(null);
                      setActiveTab('fuse');
                    }}
                    className="font-pixel text-xs bg-gradient-to-r from-fuchsia-600 to-amber-500 hover:from-fuchsia-500 hover:to-amber-400 text-white font-bold px-5 py-2.5 rounded-xl border border-yellow-300 transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                  >
                    GO TO EVOLUTION LAB ➔
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-sans text-xs text-slate-300 mb-4">
                  Open end-of-act reward packs to pull duplicate Stuffy Cards for your Card Binder and Star Fusion Chamber.
                </p>

                {(packs || []).length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-3">
                    <span className="text-5xl opacity-40">🎁</span>
                    <h4 className="font-pixel text-sm text-slate-400">NO REWARD PACKS AVAILABLE</h4>
                    <p className="font-sans text-xs text-slate-500 max-w-sm">
                      Complete Acts in Campaign Mode to earn Common, Uncommon, Rare, Epic, and Legendary Stuffy Packs!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[55vh] overflow-y-auto pr-1">
                    {(packs || []).map((pack) => {
                      const theme = RARITY_THEMES[pack.rarity] || RARITY_THEMES.common;
                      return (
                        <div
                          key={pack.id}
                          className={`p-4 rounded-2xl border-2 bg-gradient-to-b ${theme.bg} ${theme.border} ${theme.glow} shadow-xl flex flex-col justify-between gap-4 transition-all hover:scale-102`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-3xl">{theme.icon}</span>
                            <span
                              className={`font-pixel text-[9px] uppercase px-2 py-0.5 rounded-full border ${theme.badge} font-bold`}
                            >
                              {pack.rarity}
                            </span>
                          </div>

                          <div>
                            <h4 className={`font-pixel text-sm font-bold ${theme.text}`}>
                              {pack.name}
                            </h4>
                            <p className="text-[11px] font-mono text-slate-400 mt-1">
                              Yields 0-5 Stuffy Cards. Higher rarity packs yield higher star cards (up to 5★)!
                            </p>
                          </div>

                          <button
                            onClick={() => handleOpenPack(pack)}
                            className="font-pixel text-xs bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl border border-yellow-200 transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                          >
                            <span>✨</span>
                            <span>OPEN PACK</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
