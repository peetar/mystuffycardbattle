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

const RARITY_COLORS: Record<ItemRarity, { border: string; bg: string; text: string; badge: string }> = {
  common: { border: 'border-slate-500', bg: 'bg-slate-900/80', text: 'text-slate-300', badge: 'bg-slate-700 text-slate-200' },
  uncommon: { border: 'border-emerald-500', bg: 'bg-emerald-950/60', text: 'text-emerald-400', badge: 'bg-emerald-800 text-emerald-100' },
  rare: { border: 'border-cyan-500', bg: 'bg-cyan-950/60', text: 'text-cyan-300', badge: 'bg-cyan-800 text-cyan-100' },
  epic: { border: 'border-purple-500', bg: 'bg-purple-950/60', text: 'text-purple-300', badge: 'bg-purple-800 text-purple-100' },
  legendary: { border: 'border-yellow-400', bg: 'bg-yellow-950/60', text: 'text-yellow-300', badge: 'bg-yellow-600 text-slate-950' },
};

export default function ArmoryModal({ isOpen, onClose }: ArmoryModalProps) {
  const [selectedStuffyId, setSelectedStuffyId] = useState<string>('cow');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [inventory, setInventory] = useState<GameItem[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Inspector & Evolution state
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [fuseSlot1, setFuseSlot1] = useState<GameItem | null>(null);
  const [fuseSlot2, setFuseSlot2] = useState<GameItem | null>(null);
  const [confirmDiscardId, setConfirmDiscardId] = useState<string | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const items = getItemInventory();
      // If user has no items yet, grant starter gear set
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
        if (!selectedItem) setSelectedItem(starter[0]);
      } else {
        setInventory(items);
        if (selectedItem) {
          const fresh = items.find((i) => i.id === selectedItem.id);
          setSelectedItem(fresh || items[0] || null);
        } else if (items.length > 0) {
          setSelectedItem(items[0]);
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
    if (selectedItem?.id === item.id) setSelectedItem(null);
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
      // Remove from slot 1
      setFuseSlot1(null);
    } else if (!fuseSlot2) {
      if (item.rarity !== fuseSlot1.rarity) {
        setStatusNotification(`⚠️ Both items must be ${fuseSlot1.rarity.toUpperCase()} to evolve!`);
        return;
      }
      setFuseSlot2(item);
      setStatusNotification(`Ready to fuse! Click 'EVOLVE' to combine both ${fuseSlot1.rarity.toUpperCase()} items.`);
    } else if (fuseSlot2.id === item.id) {
      setFuseSlot2(null);
    } else {
      // Replace slot 2
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
      setSelectedItem(res.newItem);
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
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/80 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl shadow-amber-950/60 overflow-hidden">
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
                Equip gear • Evolve 2 items into higher tiers • Discard unwanted items
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
                            <div className="flex items-center gap-2">
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
                                onClick={() => setSelectedItem(item)}
                                className="font-pixel text-[8px] bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 px-2 rounded-lg border border-slate-600 transition-all cursor-pointer"
                              >
                                VIEW
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
                <span>💡 Win Roguelike Campaign runs to earn items or use Evolution below to upgrade!</span>
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
                    Combine 2 items of the same tier: 2 Commons ➔ 1 Uncommon • 2 Uncommons ➔ 1 Rare • 2 Rares ➔ 1 Epic • 2 Epics ➔ 1 Legendary
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
                    className={`w-16 h-16 rounded-xl border-2 ${RARITY_COLORS[fuseSlot1.rarity].border} ${RARITY_COLORS[fuseSlot1.rarity].bg} flex flex-col items-center justify-center relative cursor-pointer group shadow-lg hover:border-red-500`}
                    title="Click to remove from slot 1"
                  >
                    <span className="text-2xl">{fuseSlot1.icon}</span>
                    <span className={`font-pixel text-[8px] uppercase font-bold truncate max-w-[56px] ${RARITY_COLORS[fuseSlot1.rarity].text}`}>
                      {fuseSlot1.rarity}
                    </span>
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 group-hover:scale-110 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      ✕
                    </span>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-amber-500/40 bg-slate-950/60 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-lg text-amber-500/60">+</span>
                    <span className="font-pixel text-[8px] text-slate-500">Pick Item</span>
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
                    className={`w-16 h-16 rounded-xl border-2 ${RARITY_COLORS[fuseSlot2.rarity].border} ${RARITY_COLORS[fuseSlot2.rarity].bg} flex flex-col items-center justify-center relative cursor-pointer group shadow-lg hover:border-red-500`}
                    title="Click to remove from slot 2"
                  >
                    <span className="text-2xl">{fuseSlot2.icon}</span>
                    <span className={`font-pixel text-[8px] uppercase font-bold truncate max-w-[56px] ${RARITY_COLORS[fuseSlot2.rarity].text}`}>
                      {fuseSlot2.rarity}
                    </span>
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 group-hover:scale-110 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      ✕
                    </span>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-amber-500/40 bg-slate-950/60 flex flex-col items-center justify-center text-center p-1">
                    <span className="text-lg text-amber-500/60">+</span>
                    <span className="font-pixel text-[8px] text-slate-500">
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
                    className={`w-16 h-16 rounded-xl border-2 border-dashed ${RARITY_COLORS[nextTierForFuse].border} ${RARITY_COLORS[nextTierForFuse].bg} flex flex-col items-center justify-center shadow-lg animate-pulse`}
                  >
                    <span className="text-2xl">✨</span>
                    <span className={`font-pixel text-[8px] uppercase font-extrabold ${RARITY_COLORS[nextTierForFuse].text}`}>
                      {nextTierForFuse}
                    </span>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/40 flex flex-col items-center justify-center text-center">
                    <span className="text-xl text-slate-600">❓</span>
                    <span className="font-pixel text-[8px] text-slate-600">Next Tier</span>
                  </div>
                )}
              </div>

              {/* Fuse Execution Button */}
              <button
                disabled={!fuseSlot1 || !fuseSlot2 || fuseSlot1.rarity !== fuseSlot2.rarity}
                onClick={handleExecuteEvolution}
                className={`ml-2 font-pixel text-xs px-4 py-3 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
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

          {/* Selected Item Inspector Panel */}
          {selectedItem && (
            <div className={`p-4 rounded-2xl border-2 ${RARITY_COLORS[selectedItem.rarity].bg} ${RARITY_COLORS[selectedItem.rarity].border} shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn`}>
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-2xl border-2 ${RARITY_COLORS[selectedItem.rarity].border} bg-black/50 flex items-center justify-center text-3xl shadow-inner`}>
                  {selectedItem.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className={`font-pixel text-sm font-bold ${RARITY_COLORS[selectedItem.rarity].text}`}>
                      {selectedItem.name}
                    </h5>
                    <span className={`font-pixel text-[9px] uppercase px-2 py-0.5 rounded font-bold ${RARITY_COLORS[selectedItem.rarity].badge}`}>
                      {selectedItem.rarity}
                    </span>
                    <span className="font-pixel text-[9px] uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {selectedItem.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-xs text-emerald-300 font-bold">
                      {selectedItem.attribute === 'speed'
                        ? `+${selectedItem.value} Speed⚡`
                        : `+${selectedItem.value}% ${selectedItem.attribute.toUpperCase()}`}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {selectedItem.equippedToSpeciesId
                        ? `(Equipped on ${PLAYABLE_STUFFIES.find((s) => s.id === selectedItem.equippedToSpeciesId)?.name || 'Unknown'})`
                        : '(Unequipped)'}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-300 mt-1 max-w-xl">
                    {selectedItem.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Selected Item */}
              <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                {equipped[selectedItem.category]?.id === selectedItem.id ? (
                  <button
                    onClick={() => handleUnequip(selectedItem.category)}
                    className="font-pixel text-[10px] bg-red-950 hover:bg-red-900 text-rose-300 px-3 py-2 rounded-xl border border-rose-800 transition-all cursor-pointer"
                  >
                    ✕ UNEQUIP
                  </button>
                ) : (
                  <button
                    onClick={() => handleEquip(selectedItem)}
                    className="font-pixel text-[10px] bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold px-3 py-2 rounded-xl shadow cursor-pointer transition-all active:scale-95"
                  >
                    EQUIP TO {currentStuffy.name.toUpperCase()}
                  </button>
                )}

                {selectedItem.rarity !== 'legendary' && (
                  <button
                    onClick={() => handleSetFuseSlot(selectedItem)}
                    className={`font-pixel text-[10px] px-3 py-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
                      fuseSlot1?.id === selectedItem.id || fuseSlot2?.id === selectedItem.id
                        ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                        : 'bg-purple-950 hover:bg-purple-900 text-purple-200 border-purple-700'
                    }`}
                  >
                    <span>✨</span>
                    <span>
                      {fuseSlot1?.id === selectedItem.id || fuseSlot2?.id === selectedItem.id
                        ? 'IN FUSE LAB'
                        : 'USE IN EVOLVE'}
                    </span>
                  </button>
                )}

                {confirmDiscardId === selectedItem.id ? (
                  <button
                    onClick={() => handleDiscard(selectedItem)}
                    className="font-pixel text-[10px] bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-2 rounded-xl border border-red-400 transition-all cursor-pointer animate-pulse"
                  >
                    CONFIRM DISCARD?
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDiscardId(selectedItem.id)}
                    className="font-pixel text-[10px] bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-rose-300 px-3 py-2 rounded-xl border border-slate-700 hover:border-rose-800 transition-all cursor-pointer flex items-center gap-1"
                    title="Permanently remove this item"
                  >
                    <span>🗑️</span>
                    <span>DISCARD</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Inventory Section (Icon-Only Grid to Make Inventory Bigger) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h4 className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
                  <span>🎒</span> ARMORY INVENTORY ({inventory.length} ITEMS)
                </h4>
                <p className="font-mono text-[11px] text-slate-400">
                  Showing item icons • Click any icon to view, equip, evolve, or discard
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

            {/* Compact Icon-Only Grid */}
            {filteredInventory.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-sm border border-dashed border-slate-800 rounded-2xl">
                No items found in this category. Complete a campaign or win battles to earn items!
              </div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 p-2 bg-slate-950/70 border border-slate-800 rounded-2xl max-h-[380px] overflow-y-auto scrollbar-thin">
                {filteredInventory.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const isEquipped = !!item.equippedToSpeciesId;
                  const isEquippedOnCurrent = equipped[item.category]?.id === item.id;
                  const isInFuseSlot1 = fuseSlot1?.id === item.id;
                  const isInFuseSlot2 = fuseSlot2?.id === item.id;
                  const isFuseEligible =
                    fuseSlot1 &&
                    !fuseSlot2 &&
                    fuseSlot1.id !== item.id &&
                    item.rarity === fuseSlot1.rarity;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        sound.playClickSound();
                        setSelectedItem(item);
                        setConfirmDiscardId(null);
                        // If user is currently picking for evolution slot 2
                        if (fuseSlot1 && !fuseSlot2 && item.id !== fuseSlot1.id) {
                          if (item.rarity === fuseSlot1.rarity) {
                            setFuseSlot2(item);
                            setStatusNotification(`Added ${item.name} to Evolution Slot 2. Click 'FUSE & EVOLVE' above!`);
                          } else {
                            setStatusNotification(`⚠️ Item must be ${fuseSlot1.rarity.toUpperCase()} to fuse with ${fuseSlot1.name}.`);
                          }
                        }
                      }}
                      title={`${item.name} (${item.rarity.toUpperCase()}) - ${item.attribute === 'speed' ? `+${item.value} Speed` : `+${item.value}% ${item.attribute}`}`}
                      className={`relative aspect-square rounded-xl border-2 flex items-center justify-center p-1 transition-all cursor-pointer group ${
                        RARITY_COLORS[item.rarity].bg
                      } ${RARITY_COLORS[item.rarity].border} ${
                        isSelected ? 'ring-2 ring-yellow-400 scale-105 z-10 shadow-lg' : 'hover:scale-105 hover:brightness-125'
                      } ${
                        isInFuseSlot1 || isInFuseSlot2 ? 'ring-2 ring-amber-400 animate-pulse' : ''
                      } ${
                        isFuseEligible ? 'border-dashed border-amber-400 animate-pulse' : ''
                      }`}
                    >
                      {/* Item Icon */}
                      <span className="text-2xl md:text-3xl select-none group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>

                      {/* Equipped Badge */}
                      {isEquipped && (
                        <span
                          className={`absolute -top-1 -right-1 font-pixel text-[8px] font-bold px-1 rounded shadow ${
                            isEquippedOnCurrent
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-cyan-600 text-white'
                          }`}
                          title={
                            isEquippedOnCurrent
                              ? `Equipped on ${currentStuffy.name}`
                              : `Equipped on ${PLAYABLE_STUFFIES.find((s) => s.id === item.equippedToSpeciesId)?.name || 'Other'}`
                          }
                        >
                          E
                        </span>
                      )}

                      {/* Evolution Slot Marker */}
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}