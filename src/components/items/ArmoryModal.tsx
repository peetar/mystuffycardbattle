'use client';

import React, { useState, useEffect } from 'react';
import { GameItem, ItemCategory, StuffySpecies } from '@/types/game';
import { PLAYABLE_STUFFIES } from '@/data/stuffies';
import {
  getItemInventory,
  getEquippedItems,
  equipItem,
  unequipItem,
  getStuffyComputedStats,
  generateRandomItem,
  saveItemInventory,
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

const RARITY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  common: { border: 'border-slate-500', bg: 'bg-slate-900/80', text: 'text-slate-300' },
  uncommon: { border: 'border-emerald-500', bg: 'bg-emerald-950/60', text: 'text-emerald-400' },
  rare: { border: 'border-cyan-500', bg: 'bg-cyan-950/60', text: 'text-cyan-300' },
  epic: { border: 'border-purple-500', bg: 'bg-purple-950/60', text: 'text-purple-300' },
  legendary: { border: 'border-yellow-400', bg: 'bg-yellow-950/60', text: 'text-yellow-300' },
};

export default function ArmoryModal({ isOpen, onClose }: ArmoryModalProps) {
  const [selectedStuffyId, setSelectedStuffyId] = useState<string>('cow');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [inventory, setInventory] = useState<GameItem[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      const items = getItemInventory();
      // If user has no items yet, grant a fun starter gear set so they can try it right away!
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
    setRefreshKey((k) => k + 1);
  };

  const handleUnequip = (category: ItemCategory) => {
    sound.playClickSound();
    unequipItem(currentStuffy.id, category);
    setRefreshKey((k) => k + 1);
  };

  const handleAddRandomItem = () => {
    sound.playRewardSound();
    const newItem = generateRandomItem();
    const updated = [...inventory, newItem];
    saveItemInventory(updated);
    setInventory(updated);
  };

  const filteredInventory = inventory.filter((item) => {
    if (selectedCategoryFilter === 'all') return true;
    return item.category === selectedCategoryFilter;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-hidden animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/80 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl shadow-amber-950/60 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/40 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧰</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-lg md:text-xl text-amber-300 font-extrabold tracking-wide">
                  BEN&apos;S ITEM ARMORY
                </h2>
                <span className="text-[10px] font-pixel bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-bold">
                  v3.7
                </span>
              </div>
              <p className="font-mono text-xs text-slate-400">
                Equip stuffies with gear • Boost Speed strikes &amp; trigger Freeze, Fire, Shock, and Stun!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClickSound();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center border border-slate-600 transition-all hover:scale-105 active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-6">
            {/* Left: Stuffy Sprite & Info */}
            <div className="lg:col-span-4 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-slate-800 pb-4 lg:pb-0 lg:pr-6">
              <div className="w-24 h-24 mb-3 p-2 bg-slate-950/80 rounded-2xl border border-amber-500/30 flex items-center justify-center shadow-inner">
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
                  size={74}
                />
              </div>
              <h3 className="font-pixel text-lg text-yellow-300 font-bold">{currentStuffy.name}</h3>
              <p className="font-pixel text-[11px] text-amber-400">{currentStuffy.title}</p>
              <p className="font-mono text-xs text-slate-400 mt-2 line-clamp-3">
                {currentStuffy.description}
              </p>

              {/* Stats Meters */}
              <div className="w-full mt-4 flex flex-col gap-2 font-mono text-xs">
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
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                      style={{ width: `${Math.min(100, (stats.speed / ITEM_CAPS.speed) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 text-left">
                    {stats.speed >= 100 ? (
                      <>
                        ⚡ <strong>{Math.floor(stats.speed / 100)} guaranteed attack(s)</strong> +{' '}
                        {stats.speed % 100}% chance for extra hit!
                      </>
                    ) : (
                      <>
                        ⚡ <strong>{stats.speed}% chance</strong> to land an attack strike!
                      </>
                    )}
                  </p>
                </div>

                {/* Elemental Proc Chances */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-pixel text-blue-300 flex items-center justify-between">
                      <span>❄️ FREEZE</span>
                      <span>{stats.freezeChance}%</span>
                    </div>
                    <div className="text-[9px] text-slate-400">Cap: 75% • Halves enemy speed</div>
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-pixel text-orange-400 flex items-center justify-between">
                      <span>🔥 FIRE/BURN</span>
                      <span>{stats.burnChance}%</span>
                    </div>
                    <div className="text-[9px] text-slate-400">Cap: 75% • Burns on discard</div>
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-pixel text-yellow-300 flex items-center justify-between">
                      <span>⚡ SHOCK</span>
                      <span>{stats.shockChance}%</span>
                    </div>
                    <div className="text-[9px] text-slate-400">Cap: 25% • Card paralysis 1 turn</div>
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-pixel text-purple-300 flex items-center justify-between">
                      <span>💫 STUN</span>
                      <span>{stats.stunChance}%</span>
                    </div>
                    <div className="text-[9px] text-slate-400">Cap: 75% • Brain Damage</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: 6 Equipment Slots */}
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <h4 className="font-pixel text-xs text-amber-300 font-bold mb-3 flex items-center gap-1.5">
                  <span>🛡️</span> EQUIPPED ITEMS ({currentStuffy.name.toUpperCase()})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {CATEGORIES.map((slot) => {
                    const item = equipped[slot.id];
                    return (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                          item
                            ? `${RARITY_COLORS[item.rarity].bg} ${RARITY_COLORS[item.rarity].border} shadow-md`
                            : 'bg-slate-950/50 border-dashed border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-pixel text-[10px] text-slate-400 flex items-center gap-1">
                            <span>{slot.icon}</span> {slot.label.toUpperCase()}
                          </span>
                          <span className="font-mono text-[9px] text-slate-500">{slot.attribute}</span>
                        </div>

                        {item ? (
                          <div className="flex flex-col gap-1.5">
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
                            <button
                              onClick={() => handleUnequip(slot.id)}
                              className="mt-2 font-pixel text-[9px] bg-red-950/80 hover:bg-red-900 text-rose-300 py-1 px-2 rounded-lg border border-rose-800 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                            >
                              ✕ UNEQUIP
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => setSelectedCategoryFilter(slot.id)}
                            className="py-4 flex flex-col items-center justify-center cursor-pointer group"
                          >
                            <span className="text-2xl text-slate-700 group-hover:text-amber-400 transition-colors">
                              +
                            </span>
                            <span className="font-pixel text-[10px] text-slate-600 group-hover:text-slate-300 transition-colors">
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
              <div className="mt-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-between text-xs font-mono text-indigo-200">
                <span>💡 Win Roguelike Campaign runs to earn 3, 5, or 7 items per victory!</span>
                <button
                  onClick={handleAddRandomItem}
                  className="font-pixel text-[9px] bg-indigo-700 hover:bg-indigo-600 text-white px-2.5 py-1.5 rounded-lg border border-indigo-400 transition-all active:scale-95 cursor-pointer"
                  title="Generate a random item for quick testing"
                >
                  🎲 FORGE RANDOM ITEM
                </button>
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
                  <span>🎒</span> ARMORY INVENTORY ({inventory.length} ITEMS)
                </h4>
                <p className="font-mono text-[11px] text-slate-400">
                  Click &apos;EQUIP&apos; to assign an item to {currentStuffy.name}
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
                  ALL
                </button>
                {CATEGORIES.map((cat) => (
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
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Grid */}
            {filteredInventory.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-sm border border-dashed border-slate-800 rounded-2xl">
                No items found in this category. Complete a campaign or click &apos;Forge Random Item&apos;!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredInventory.map((item) => {
                  const isEquippedHere = equipped[item.category]?.id === item.id;
                  const isEquippedElse = item.equippedToSpeciesId && item.equippedToSpeciesId !== currentStuffy.id;
                  const equippedOwner = isEquippedElse ? PLAYABLE_STUFFIES.find((s) => s.id === item.equippedToSpeciesId)?.name : null;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                        RARITY_COLORS[item.rarity].bg
                      } ${RARITY_COLORS[item.rarity].border} hover:scale-102`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-pixel text-[9px] uppercase tracking-wider text-slate-400">
                            {item.category}
                          </span>
                          <span className={`font-pixel text-[9px] uppercase font-bold ${RARITY_COLORS[item.rarity].text}`}>
                            {item.rarity}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{item.icon}</span>
                          <div className="text-left">
                            <h5 className={`font-pixel text-xs font-bold leading-tight ${RARITY_COLORS[item.rarity].text}`}>
                              {item.name}
                            </h5>
                            <span className="font-mono text-[10px] text-emerald-300 font-bold">
                              {item.attribute === 'speed' ? `+${item.value} Speed` : `+${item.value}% ${item.attribute.toUpperCase()}`}
                            </span>
                          </div>
                        </div>

                        <p className="font-mono text-[10px] text-slate-400 line-clamp-2 text-left mb-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                        {isEquippedHere ? (
                          <span className="font-pixel text-[9px] text-emerald-400 font-bold">
                            ✓ EQUIPPED ON {currentStuffy.name.toUpperCase()}
                          </span>
                        ) : isEquippedElse ? (
                          <span className="font-pixel text-[9px] text-slate-400">
                            Equipped on {equippedOwner}
                          </span>
                        ) : (
                          <span className="font-pixel text-[9px] text-slate-500">Available</span>
                        )}

                        {isEquippedHere ? (
                          <button
                            onClick={() => handleUnequip(item.category)}
                            className="font-pixel text-[9px] bg-red-950 hover:bg-red-900 text-rose-300 px-2 py-1 rounded border border-rose-800 cursor-pointer"
                          >
                            UNEQUIP
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEquip(item)}
                            className="font-pixel text-[9px] bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold px-3 py-1 rounded shadow cursor-pointer transition-all active:scale-95"
                          >
                            EQUIP
                          </button>
                        )}
                      </div>
                    </div>
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
