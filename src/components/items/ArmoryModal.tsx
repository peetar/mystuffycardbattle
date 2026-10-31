'use client';

import React, { useState, useEffect } from 'react';
import { GameItem, ItemCategory, ItemRarity, StuffySpecies } from '@/types/game';
import { PLAYABLE_STUFFIES } from '@/data/stuffies';
import {
  getItemInventory,
  getEquippedItems,
  equipItem,
  unequipItem,
  getStuffyComputedStats,
  generateRandomItem,
  saveItemInventory,
  discardItem,
  evolveItems,
  NEXT_RARITY_MAP,
  ITEM_CAPS,
} from '@/data/items';
import { StuffySprite } from '@/components/battle/StuffySprite';
import { sound } from '@/utils/audio';

interface ArmoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { id: ItemCategory; label: string; icon: string; attribute: string; cap: number }[] = [
  { id: 'helmet', label: 'Helmet', icon: '🪖', attribute: 'Freeze', cap: ITEM_CAPS.freeze },
  { id: 'chestplate', label: 'Chestplate', icon: '🛡️', attribute: 'Fire / Burn', cap: ITEM_CAPS.burn },
  { id: 'gloves', label: 'Gloves', icon: '🧤', attribute: 'Shock', cap: ITEM_CAPS.shock },
  { id: 'sword', label: 'Sword', icon: '⚔️', attribute: 'Stun', cap: ITEM_CAPS.stun },
  { id: 'offhand', label: 'Offhand', icon: '⏱️', attribute: 'Speed', cap: ITEM_CAPS.speed },
  { id: 'pendant', label: 'Pendant', icon: '📿', attribute: 'Wild Element', cap: 75 },
];

const RARITY_COLORS: Record<ItemRarity, { border: string; bg: string; text: string; badge: string; glow: string }> = {
  common: {
    border: 'border-slate-500',
    bg: 'bg-slate-900/90',
    text: 'text-slate-300',
    badge: 'bg-slate-700 text-slate-200 border-slate-500',
    glow: 'shadow-slate-500/20',
  },
  uncommon: {
    border: 'border-emerald-500',
    bg: 'bg-emerald-950/70',
    text: 'text-emerald-400',
    badge: 'bg-emerald-800 text-emerald-100 border-emerald-500',
    glow: 'shadow-emerald-500/30',
  },
  rare: {
    border: 'border-cyan-500',
    bg: 'bg-cyan-950/70',
    text: 'text-cyan-300',
    badge: 'bg-cyan-800 text-cyan-100 border-cyan-500',
    glow: 'shadow-cyan-500/30',
  },
  epic: {
    border: 'border-purple-500',
    bg: 'bg-purple-950/70',
    text: 'text-purple-300',
    badge: 'bg-purple-800 text-purple-100 border-purple-500',
    glow: 'shadow-purple-500/30',
  },
  legendary: {
    border: 'border-yellow-400',
    bg: 'bg-yellow-950/70',
    text: 'text-yellow-300',
    badge: 'bg-yellow-500 text-slate-950 border-yellow-300 font-extrabold',
    glow: 'shadow-yellow-500/40',
  },
};

export default function ArmoryModal({ isOpen, onClose }: ArmoryModalProps) {
  const [selectedStuffyId, setSelectedStuffyId] = useState<string>('cow');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [inventory, setInventory] = useState<GameItem[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Inspected Item Modal (Draft-style popup when clicking an icon)
  const [inspectedItem, setInspectedItem] = useState<GameItem | null>(null);

  // Evolution State
  const [fuseSlot1, setFuseSlot1] = useState<GameItem | null>(null);
  const [fuseSlot2, setFuseSlot2] = useState<GameItem | null>(null);
  const [confirmDiscardId, setConfirmDiscardId] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const items = getItemInventory();
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
        setInventory(starter);
      } else {
        setInventory(items);
        if (inspectedItem) {
          const fresh = items.find((i) => i.id === inspectedItem.id);
          setInspectedItem(fresh || null);
        }
      }
    }
  }, [isOpen, refreshKey]);

  if (!isOpen) return null;

  const currentStuffy = PLAYABLE_STUFFIES.find((s) => s.id === selectedStuffyId) || PLAYABLE_STUFFIES[0];
  const stats = getStuffyComputedStats(currentStuffy.id, currentStuffy.baseSpeed || 40);
  const equipped = stats.equipment;

  const handleEquip = (item: GameItem) => {
    sound.playRewardSound();
    equipItem(currentStuffy.id, item);
    setStatusNotification(`Equipped ${item.name} to ${currentStuffy.name}!`);
    setRefreshKey((k) => k + 1);
  };

  const handleUnequip = (category: ItemCategory) => {
    sound.playClickSound();
    unequipItem(currentStuffy.id, category);
    setStatusNotification(`Unequipped ${category} from ${currentStuffy.name}!`);
    setRefreshKey((k) => k + 1);
  };

  const handleDiscard = (item: GameItem) => {
    sound.playClickSound();
    discardItem(item.id);
    setStatusNotification(`🗑️ Discarded ${item.name}`);
    setConfirmDiscardId(null);
    if (inspectedItem?.id === item.id) setInspectedItem(null);
    if (fuseSlot1?.id === item.id) setFuseSlot1(null);
    if (fuseSlot2?.id === item.id) setFuseSlot2(null);
    setRefreshKey((k) => k + 1);
  };

  const handleSetFuseSlot = (item: GameItem) => {
    if (item.rarity === 'legendary') {
      setStatusNotification('⚠️ Legendary items cannot be evolved further!');
      return;
    }
    sound.playClickSound();

    if (!fuseSlot1) {
      setFuseSlot1(item);
      setStatusNotification(`Selected ${item.name} for Evolution Slot 1. Now select another ${item.rarity.toUpperCase()} item!`);
    } else if (fuseSlot1.id === item.id) {
      setFuseSlot1(null);
    } else if (!fuseSlot2) {
      if (item.rarity !== fuseSlot1.rarity) {
        setStatusNotification(`⚠️ Both items must be ${fuseSlot1.rarity.toUpperCase()} to evolve!`);
        return;
      }
      setFuseSlot2(item);
      setStatusNotification(`Ready to fuse! Click 'FUSE & EVOLVE' above.`);
    } else if (fuseSlot2.id === item.id) {
      setFuseSlot2(null);
    } else {
      if (item.rarity !== fuseSlot1.rarity) {
        setStatusNotification(`⚠️ Both items must be ${fuseSlot1.rarity.toUpperCase()} to evolve!`);
        return;
      }
      setFuseSlot2(item);
    }
  };

  const handleExecuteEvolution = () => {
    if (!fuseSlot1 || !fuseSlot2) return;
    const res = evolveItems(fuseSlot1.id, fuseSlot2.id);
    if (res.success && res.newItem) {
      sound.playRewardSound();
      setStatusNotification(`🎉 EVOLUTION SUCCESS: Created ${res.newItem.name} (${res.newItem.rarity.toUpperCase()})!`);
      setFuseSlot1(null);
      setFuseSlot2(null);
      setInspectedItem(res.newItem);
      setRefreshKey((k) => k + 1);
    } else {
      setStatusNotification(`❌ ${res.error || 'Evolution failed.'}`);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (selectedCategoryFilter === 'all') return true;
    return item.category === selectedCategoryFilter;
  });

  const nextTierForFuse = fuseSlot1 ? NEXT_RARITY_MAP[fuseSlot1.rarity] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-hidden animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/80 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl shadow-amber-950/60 overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-amber-500/40 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧰</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-lg md:text-xl text-amber-300 font-extrabold tracking-wide">
                  BEN&apos;S ITEM ARMORY
                </h2>
                <span className="text-[10px] font-pixel bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-bold">
                  v3.8
                </span>
              </div>
              <p className="font-mono text-xs text-slate-400">
                Click any item icon to view preview • Equip with button below • 8 items per row
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClickSound();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center border border-slate-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5">
          {/* Status Notification Banner */}
          {statusNotification && (
            <div className="p-2.5 px-4 rounded-xl bg-amber-950/70 border border-amber-500/60 text-amber-200 font-mono text-xs flex items-center justify-between animate-fadeIn">
              <span>{statusNotification}</span>
              <button
                onClick={() => setStatusNotification(null)}
                className="text-amber-400 hover:text-white font-bold text-xs ml-3 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Stuffy Selector Tray */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-xs text-slate-300 font-bold">SELECT STUFFY TO EQUIP:</span>
              <span className="font-mono text-[11px] text-amber-400">
                {PLAYABLE_STUFFIES.length} Playable Stuffies
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {PLAYABLE_STUFFIES.map((stuffy) => {
                const isSelected = stuffy.id === selectedStuffyId;
                const stuffyStats = getStuffyComputedStats(stuffy.id, stuffy.baseSpeed || 40);
                const hasEquip = Object.keys(stuffyStats.equipment).length > 0;
                return (
                  <button
                    key={stuffy.id}
                    onClick={() => {
                      sound.playClickSound();
                      setSelectedStuffyId(stuffy.id);
                    }}
                    className={`flex flex-col items-center gap-1 min-w-[76px] p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-950/40 scale-105 shadow-lg shadow-yellow-500/20'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center">
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
                        size={36}
                      />
                    </div>
                    <span className="font-pixel text-[10px] text-slate-200 truncate max-w-[70px]">
                      {stuffy.name}
                    </span>
                    <span className="font-mono text-[9px] text-amber-300">
                      {stuffyStats.speed}⚡
                    </span>
                    {hasEquip && (
                      <span className="text-[9px] text-cyan-400 font-bold">● EQUIPPED</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stuffy Overview & Stats Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5">
            {/* Left: Stuffy Sprite & Info */}
            <div className="lg:col-span-4 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-slate-800 pb-4 lg:pb-0 lg:pr-5">
              <div className="w-20 h-20 mb-2 p-2 bg-slate-950/80 rounded-2xl border border-amber-500/30 flex items-center justify-center shadow-inner">
                <StuffySprite
                  stuffy={{
                    instanceId: `large_${currentStuffy.id}`,
                    speciesId: currentStuffy.id,
                    name: currentStuffy.name,
                    maxHp: currentStuffy.baseHp,
                    currentHp: currentStuffy.baseHp,
                    shield: 0,
                    isUnstuffed: false,
                    statusEffects: [],
                  }}
                  size={64}
                />
              </div>
              <h3 className="font-pixel text-base text-yellow-300 font-bold">{currentStuffy.name}</h3>
              <p className="font-pixel text-[10px] text-amber-400">{currentStuffy.title}</p>

              {/* Stats Meters */}
              <div className="w-full mt-3 flex flex-col gap-1.5 font-mono text-xs">
                {/* Speed Bar */}
                <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-pixel text-[10px] text-cyan-300 flex items-center gap-1">
                      <span>⚡</span> SPEED
                    </span>
                    <span className="font-bold text-cyan-300">
                      {stats.speed} / {ITEM_CAPS.speed}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                      style={{ width: `${Math.min(100, (stats.speed / ITEM_CAPS.speed) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 text-left">
                    {stats.speed >= 100 ? (
                      <>
                        ⚡ <strong>{Math.floor(stats.speed / 100)} strike(s)</strong> +{' '}
                        {stats.speed % 100}% bonus hit chance!
                      </>
                    ) : (
                      <>
                        ⚡ <strong>{stats.speed}% chance</strong> to strike!
                      </>
                    )}
                  </p>
                </div>

                {/* Elemental Proc Chances */}
                <div className="grid grid-cols-2 gap-1.5 text-left">
                  <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                    <div className="text-[9px] font-pixel text-blue-300 flex items-center justify-between">
                      <span>❄️ FREEZE</span>
                      <span>{stats.freezeChance}%</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                    <div className="text-[9px] font-pixel text-orange-400 flex items-center justify-between">
                      <span>🔥 BURN</span>
                      <span>{stats.burnChance}%</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                    <div className="text-[9px] font-pixel text-yellow-300 flex items-center justify-between">
                      <span>⚡ SHOCK</span>
                      <span>{stats.shockChance}%</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                    <div className="text-[9px] font-pixel text-purple-300 flex items-center justify-between">
                      <span>💫 STUN</span>
                      <span>{stats.stunChance}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 6 Equipment Slots */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <h4 className="font-pixel text-xs text-amber-300 font-bold mb-2.5 flex items-center gap-1.5">
                  <span>🛡️</span> EQUIPPED ITEMS ({currentStuffy.name.toUpperCase()})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((slot) => {
                    const item = equipped[slot.id];
                    return (
                      <div
                        key={slot.id}
                        className={`p-2.5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                          item
                            ? `${RARITY_COLORS[item.rarity].bg} ${RARITY_COLORS[item.rarity].border} shadow-md`
                            : 'bg-slate-950/50 border-dashed border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-pixel text-[10px] text-slate-400 flex items-center gap-1">
                            <span>{slot.icon}</span> {slot.label.toUpperCase()}
                          </span>
                          <span className="font-mono text-[9px] text-slate-500">{slot.attribute}</span>
                        </div>

                        {item ? (
                          <div className="flex flex-col gap-1">
                            <div
                              onClick={() => {
                                sound.playClickSound();
                                setInspectedItem(item);
                              }}
                              className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
                            >
                              <span className="text-xl">{item.icon}</span>
                              <div className="flex flex-col text-left truncate">
                                <span className={`font-pixel text-xs font-bold truncate ${RARITY_COLORS[item.rarity].text}`}>
                                  {item.name}
                                </span>
                                <span className="font-mono text-[10px] text-emerald-300 font-bold">
                                  {item.attribute === 'speed' ? `+${item.value} Speed` : `+${item.value}% ${item.attribute.toUpperCase()}`}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1.5 mt-1.5">
                              <button
                                onClick={() => {
                                  sound.playClickSound();
                                  setInspectedItem(item);
                                }}
                                className="font-pixel text-[8px] bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-2 rounded-lg border border-slate-600 transition-all cursor-pointer"
                              >
                                INSPECT
                              </button>
                              <button
                                onClick={() => handleUnequip(slot.id)}
                                className="flex-1 font-pixel text-[8px] bg-red-950/80 hover:bg-red-900 text-rose-300 py-1 px-2 rounded-lg border border-rose-800 transition-all cursor-pointer"
                              >
                                ✕ UNEQUIP
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => setSelectedCategoryFilter(slot.id)}
                            className="py-3 flex flex-col items-center justify-center cursor-pointer group"
                          >
                            <span className="text-xl text-slate-700 group-hover:text-amber-400 transition-colors">
                              +
                            </span>
                            <span className="font-pixel text-[9px] text-slate-600 group-hover:text-slate-300 transition-colors">
                              EMPTY SLOT
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick tip banner */}
              <div className="mt-2.5 p-2 px-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between text-[11px] font-mono text-indigo-200">
                <span>💡 Click an icon to preview its card • Evolve 2 items into a higher tier in the Lab below!</span>
              </div>
            </div>
          </div>

          {/* Evolution Lab Section */}
          <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-900/60 border border-amber-500/40 rounded-2xl p-3 md:p-4">
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
              {(fuseSlot1 || fuseSlot2) && (
                <button
                  onClick={() => {
                    setFuseSlot1(null);
                    setFuseSlot2(null);
                  }}
                  className="font-pixel text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-600 cursor-pointer self-start sm:self-auto"
                >
                  ✕ CLEAR SLOTS
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 bg-black/40 p-3 rounded-xl border border-slate-800">
              {/* Slot 1 */}
              <div className="flex flex-col items-center gap-1">
                <span className="font-pixel text-[9px] text-slate-400">ITEM 1</span>
                {fuseSlot1 ? (
                  <div
                    onClick={() => setFuseSlot1(null)}
                    className={`w-14 h-14 rounded-xl border-2 ${RARITY_COLORS[fuseSlot1.rarity].border} ${RARITY_COLORS[fuseSlot1.rarity].bg} flex flex-col items-center justify-center relative cursor-pointer group shadow-lg hover:border-red-500`}
                    title="Click to remove from slot 1"
                  >
                    <span className="text-2xl">{fuseSlot1.icon}</span>
                    <span className={`font-pixel text-[7px] uppercase font-bold truncate max-w-[50px] ${RARITY_COLORS[fuseSlot1.rarity].text}`}>
                      {fuseSlot1.rarity}
                    </span>
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 group-hover:scale-110 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      ✕
                    </span>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-amber-500/40 bg-slate-950/60 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-base text-amber-500/60">+</span>
                    <span className="font-pixel text-[7px] text-slate-500">Pick Item</span>
                  </div>
                )}
              </div>

              <span className="text-xl font-bold text-amber-400">+</span>

              {/* Slot 2 */}
              <div className="flex flex-col items-center gap-1">
                <span className="font-pixel text-[9px] text-slate-400">
                  ITEM 2 {fuseSlot1 ? `(${fuseSlot1.rarity.toUpperCase()})` : ''}
                </span>
                {fuseSlot2 ? (
                  <div
                    onClick={() => setFuseSlot2(null)}
                    className={`w-14 h-14 rounded-xl border-2 ${RARITY_COLORS[fuseSlot2.rarity].border} ${RARITY_COLORS[fuseSlot2.rarity].bg} flex flex-col items-center justify-center relative cursor-pointer group shadow-lg hover:border-red-500`}
                    title="Click to remove from slot 2"
                  >
                    <span className="text-2xl">{fuseSlot2.icon}</span>
                    <span className={`font-pixel text-[7px] uppercase font-bold truncate max-w-[50px] ${RARITY_COLORS[fuseSlot2.rarity].text}`}>
                      {fuseSlot2.rarity}
                    </span>
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 group-hover:scale-110 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      ✕
                    </span>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-amber-500/40 bg-slate-950/60 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-base text-amber-500/60">+</span>
                    <span className="font-pixel text-[7px] text-slate-500">
                      {fuseSlot1 ? `Pick ${fuseSlot1.rarity}` : 'Pick Item'}
                    </span>
                  </div>
                )}
              </div>

              <span className="text-xl font-bold text-amber-400">➔</span>

              {/* Result Preview */}
              <div className="flex flex-col items-center gap-1">
                <span className="font-pixel text-[9px] text-amber-300 font-bold">RESULT</span>
                {nextTierForFuse ? (
                  <div
                    className={`w-14 h-14 rounded-xl border-2 border-dashed ${RARITY_COLORS[nextTierForFuse].border} ${RARITY_COLORS[nextTierForFuse].bg} flex flex-col items-center justify-center shadow-lg animate-pulse`}
                  >
                    <span className="text-xl">✨</span>
                    <span className={`font-pixel text-[7px] uppercase font-extrabold ${RARITY_COLORS[nextTierForFuse].text}`}>
                      {nextTierForFuse}
                    </span>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/40 flex flex-col items-center justify-center text-center">
                    <span className="text-base text-slate-600">❓</span>
                    <span className="font-pixel text-[7px] text-slate-600">Next Tier</span>
                  </div>
                )}
              </div>

              {/* Fuse Execution Button */}
              <button
                disabled={!fuseSlot1 || !fuseSlot2 || fuseSlot1.rarity !== fuseSlot2.rarity}
                onClick={handleExecuteEvolution}
                className={`ml-2 font-pixel text-xs px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                  fuseSlot1 && fuseSlot2 && fuseSlot1.rarity === fuseSlot2.rarity
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 border-yellow-200 font-bold shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 animate-bounce'
                    : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
                }`}
              >
                <span>🔮</span>
                <span>FUSE &amp; EVOLVE</span>
              </button>
            </div>
          </div>

          {/* Inventory Section: 8 Items Per Row, Advancements-Style Grid with Equip Button Below */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h4 className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
                  <span>🎒</span> ARMORY INVENTORY ({inventory.length} ITEMS)
                </h4>
                <p className="font-mono text-[11px] text-slate-400">
                  Advancements matrix (8 items per row) • Click icon to inspect preview • Equip button below
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`font-pixel text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  ALL ({inventory.length})
                </button>
                {CATEGORIES.map((cat) => {
                  const countInCat = inventory.filter((i) => i.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryFilter(cat.id)}
                      className={`font-pixel text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                        selectedCategoryFilter === cat.id
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label} ({countInCat})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exactly 8 Items Per Row Grid */}
            {filteredInventory.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-sm border border-dashed border-slate-800 rounded-2xl">
                No items found in this category. Complete a campaign or win battles to earn items!
              </div>
            ) : (
              <div className="p-2 md:p-3 bg-slate-950/80 border border-slate-800 rounded-2xl max-h-[460px] overflow-y-auto scrollbar-thin">
                <div className="grid grid-cols-8 gap-2 md:gap-3">
                  {filteredInventory.map((item) => {
                    const isEquipped = !!item.equippedToSpeciesId;
                    const isEquippedHere = equipped[item.category]?.id === item.id;
                    const isInFuseSlot1 = fuseSlot1?.id === item.id;
                    const isInFuseSlot2 = fuseSlot2?.id === item.id;
                    const isFuseEligible =
                      fuseSlot1 &&
                      !fuseSlot2 &&
                      fuseSlot1.id !== item.id &&
                      item.rarity === fuseSlot1.rarity;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col items-center justify-between"
                      >
                        {/* Advancement-Style Square Icon Tile */}
                        <button
                          onClick={() => {
                            sound.playClickSound();
                            // If in middle of picking for evolution slot 2
                            if (fuseSlot1 && !fuseSlot2 && item.id !== fuseSlot1.id) {
                              if (item.rarity === fuseSlot1.rarity) {
                                setFuseSlot2(item);
                                setStatusNotification(`Added ${item.name} to Evolution Slot 2. Click 'FUSE & EVOLVE' above!`);
                                return;
                              }
                            }
                            // Otherwise, open draft-style item preview dialog!
                            setInspectedItem(item);
                            setConfirmDiscardId(null);
                          }}
                          title={`Click to inspect ${item.name} (${item.rarity.toUpperCase()})`}
                          className={`aspect-square w-full rounded-xl border-2 flex items-center justify-center relative cursor-pointer transition-all duration-150 transform hover:scale-110 hover:z-20 shadow-md ${
                            RARITY_COLORS[item.rarity].bg
                          } ${RARITY_COLORS[item.rarity].border} ${RARITY_COLORS[item.rarity].glow} ${
                            inspectedItem?.id === item.id ? 'ring-2 ring-white scale-110 z-20' : ''
                          } ${
                            isInFuseSlot1 || isInFuseSlot2 ? 'ring-2 ring-amber-400 animate-pulse' : ''
                          } ${
                            isFuseEligible ? 'border-dashed border-amber-400 animate-pulse' : ''
                          }`}
                        >
                          {/* Item Icon */}
                          <span className="text-2xl sm:text-3xl select-none filter-none">
                            {item.icon}
                          </span>

                          {/* Equipped Badge (Top-Right) */}
                          {isEquipped && (
                            <span
                              className={`absolute -top-1 -right-1 font-pixel text-[8px] font-bold px-1 rounded shadow ${
                                isEquippedHere
                                  ? 'bg-emerald-500 text-slate-950'
                                  : 'bg-cyan-600 text-white'
                              }`}
                              title={
                                isEquippedHere
                                  ? `Equipped on ${currentStuffy.name}`
                                  : `Equipped on ${PLAYABLE_STUFFIES.find((s) => s.id === item.equippedToSpeciesId)?.name || 'Other'}`
                              }
                            >
                              E
                            </span>
                          )}

                          {/* Evolution Slot Indicator */}
                          {isInFuseSlot1 && (
                            <span className="absolute -bottom-1 -left-1 bg-amber-500 text-slate-950 font-pixel text-[7px] font-extrabold px-1 rounded">
                              S1
                            </span>
                          )}
                          {isInFuseSlot2 && (
                            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-pixel text-[7px] font-extrabold px-1 rounded">
                              S2
                            </span>
                          )}
                        </button>

                        {/* Equip Button Below Icon */}
                        {isEquippedHere ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnequip(item.category);
                            }}
                            className="w-full mt-1.5 font-pixel text-[8px] sm:text-[9px] bg-red-950 hover:bg-red-900 text-rose-300 py-1 px-1 rounded-lg border border-rose-800 transition-all cursor-pointer truncate shadow hover:scale-102 active:scale-98"
                            title={`Unequip from ${currentStuffy.name}`}
                          >
                            UNEQUIP
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEquip(item);
                            }}
                            className="w-full mt-1.5 font-pixel text-[8px] sm:text-[9px] bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold py-1 px-1 rounded-lg border border-amber-400 transition-all cursor-pointer truncate shadow hover:scale-102 active:scale-98"
                            title={`Equip to ${currentStuffy.name}`}
                          >
                            EQUIP
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Draft-Style Item Inspection Modal (Opens When Clicking Any Icon) */}
        {inspectedItem && (
          <div
            onClick={() => setInspectedItem(null)}
            className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`bg-slate-900 border-4 ${RARITY_COLORS[inspectedItem.rarity].border} rounded-3xl p-6 flex flex-col items-center max-w-sm w-full shadow-2xl cursor-default animate-scaleUp text-center relative`}
            >
              {/* Header Rarity Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🎴</span>
                <h4 className="font-pixel text-xs text-yellow-300 font-bold tracking-wider">
                  ITEM PREVIEW
                </h4>
              </div>

              {/* Large Icon Box */}
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-5xl mb-3 border-2 ${RARITY_COLORS[inspectedItem.rarity].border} ${RARITY_COLORS[inspectedItem.rarity].bg} shadow-lg`}
              >
                {inspectedItem.icon}
              </div>

              {/* Name & Rarity */}
              <h3 className={`font-pixel text-base font-bold mb-1 ${RARITY_COLORS[inspectedItem.rarity].text}`}>
                {inspectedItem.name}
              </h3>

              <div className="flex items-center gap-2 mb-3">
                <span className={`font-pixel text-[9px] uppercase px-2.5 py-0.5 rounded-full border ${RARITY_COLORS[inspectedItem.rarity].badge}`}>
                  {inspectedItem.rarity}
                </span>
                <span className="font-pixel text-[9px] uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {inspectedItem.category}
                </span>
              </div>

              {/* Stat Boosts */}
              <div className="w-full bg-slate-950/80 p-3 rounded-xl border border-slate-800 mb-3 text-center">
                <div className="font-mono text-sm text-emerald-300 font-bold">
                  {inspectedItem.attribute === 'speed'
                    ? `+${inspectedItem.value} Speed⚡`
                    : `+${inspectedItem.value}% ${inspectedItem.attribute.toUpperCase()}`}
                </div>
                <div className="font-mono text-[11px] text-slate-400 mt-1">
                  {inspectedItem.equippedToSpeciesId
                    ? `Equipped on ${PLAYABLE_STUFFIES.find((s) => s.id === inspectedItem.equippedToSpeciesId)?.name || 'Unknown'}`
                    : 'Currently Unequipped'}
                </div>
              </div>

              {/* Lore / Description */}
              <p className="font-mono text-xs text-slate-200 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 w-full mb-4 leading-relaxed text-left">
                {inspectedItem.description}
              </p>

              {/* Action Buttons: Equip Below, Evolve, Discard, Close */}
              <div className="flex flex-col gap-2 w-full">
                {equipped[inspectedItem.category]?.id === inspectedItem.id ? (
                  <button
                    onClick={() => {
                      handleUnequip(inspectedItem.category);
                      setInspectedItem(null);
                    }}
                    className="font-pixel text-xs bg-red-950 hover:bg-red-900 text-rose-300 py-2.5 px-4 rounded-xl border border-rose-800 cursor-pointer shadow transition-all hover:scale-105 active:scale-95 font-bold"
                  >
                    ✕ UNEQUIP FROM {currentStuffy.name.toUpperCase()}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleEquip(inspectedItem);
                      setInspectedItem(null);
                    }}
                    className="font-pixel text-xs bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 py-2.5 px-4 rounded-xl border border-amber-300 cursor-pointer shadow-lg transition-all hover:scale-105 active:scale-95 font-bold"
                  >
                    🛡️ EQUIP TO {currentStuffy.name.toUpperCase()}
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {inspectedItem.rarity !== 'legendary' ? (
                    <button
                      onClick={() => {
                        handleSetFuseSlot(inspectedItem);
                        setInspectedItem(null);
                      }}
                      className="font-pixel text-[10px] bg-purple-950 hover:bg-purple-900 text-purple-200 py-2 px-3 rounded-xl border border-purple-700 cursor-pointer transition-all hover:scale-102 flex items-center justify-center gap-1"
                    >
                      <span>✨</span>
                      <span>IN EVOLVE LAB</span>
                    </button>
                  ) : (
                    <div className="font-pixel text-[10px] bg-slate-950 text-slate-600 py-2 px-3 rounded-xl border border-slate-800 flex items-center justify-center">
                      MAX TIER
                    </div>
                  )}

                  {confirmDiscardId === inspectedItem.id ? (
                    <button
                      onClick={() => handleDiscard(inspectedItem)}
                      className="font-pixel text-[10px] bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-xl border border-red-400 cursor-pointer transition-all animate-pulse"
                    >
                      CONFIRM DISCARD?
                    </button>
                  ) : (
                    <button
                      onClick={() => setConfirmDiscardId(inspectedItem.id)}
                      className="font-pixel text-[10px] bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-rose-300 py-2 px-3 rounded-xl border border-slate-800 hover:border-rose-800 cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <span>🗑️</span>
                      <span>DISCARD</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setInspectedItem(null)}
                  className="mt-1 font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl border border-slate-600 cursor-pointer shadow transition-all hover:scale-102"
                >
                  CLOSE [✖️]
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}