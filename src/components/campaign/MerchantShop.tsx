'use client';

import React, { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { STUFFY_MAP, ALL_STUFFIES } from '@/data/stuffies';
import { getLoadoutsForStuffy } from '@/data/loadouts';
import { CARD_MAP } from '@/data/cards';
import { Card, Esper } from '@/types/game';
import { StuffySprite } from '../battle/StuffySprite';
import { CardView, TIER_COLORS } from '../battle/CardView';

interface MerchantShopProps {
  onLeaveShop: () => void;
}

export const MerchantShop: React.FC<MerchantShopProps> = ({ onLeaveShop }) => {
  const {
    gold,
    merchantStuffies,
    merchantCards,
    merchantFoods,
    merchantRelics,
    merchantEspers,
    fluffUpgradePrice,
    cardRemovalPrice,
    activeParty,
    bench,
    deck,
    buyStuffy,
    buyCard,
    buyFood,
    buyRelic,
    buyEsper,
    buyFluffUpgrade,
    removeCardFromDeck,
    upgradeCardInDeck,
    feedFoodToStuffy,
  } = useCampaignStore();

  const [activeTab, setActiveTab] = useState<'buy' | 'upgrade' | 'remove' | 'feed'>('buy');
  const [selectedStuffyToBuy, setSelectedStuffyToBuy] = useState<string | null>(null);
  const [selectedEsperToBuy, setSelectedEsperToBuy] = useState<Esper | null>(null);
  const [selectedLoadoutId, setSelectedLoadoutId] = useState<string | null>(null);
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);
  const [cardToRemoveIndex, setCardToRemoveIndex] = useState<number | null>(null);
  const [selectedFoodToFeed, setSelectedFoodToFeed] = useState<string | null>(null);
  const [feedNotification, setFeedNotification] = useState<string | null>(null);

  const handleSelectStuffy = (speciesId: string) => {
    setSelectedStuffyToBuy(speciesId);
    const loadouts = getLoadoutsForStuffy(speciesId);
    setSelectedLoadoutId(loadouts[0]?.id || null);
  };

  const handleConfirmStuffyPurchase = (speciesId: string, loadoutId: string) => {
    const success = buyStuffy(speciesId, loadoutId, 60);
    if (success) {
      setSelectedStuffyToBuy(null);
    }
  };

  const handleFeedStuffy = (stuffyInstanceId: string) => {
    if (!selectedFoodToFeed) return;
    const res = feedFoodToStuffy(stuffyInstanceId, selectedFoodToFeed);
    setFeedNotification(res.message);
    setSelectedFoodToFeed(null);
    setTimeout(() => setFeedNotification(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 select-none overflow-y-auto text-white">
      {/* Top Shop Banner */}
      <header className="flex items-center justify-between border-b-2 border-amber-600/60 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🛒</span>
          <div>
            <h2 className="font-pixel text-lg md:text-xl text-yellow-400 font-bold">
              THE PLUSH BAZAAR & MERCANTILE
            </h2>
            <p className="font-pixel text-[10px] text-slate-400">
              &quot;Fine cotton, gourmet snacks, and legendary needlecraft for discerning stuffies!&quot;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-pixel text-sm text-emerald-300 bg-slate-900 border-2 border-emerald-500 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow">
            <span>💵</span>
            <span>{gold} STUFFYDOLARS</span>
          </div>

          <button
            onClick={onLeaveShop}
            className="font-pixel text-xs bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl border-2 border-red-400 cursor-pointer"
          >
            LEAVE SHOP 🚪
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 my-3 justify-center">
        {(['buy', 'upgrade', 'remove', 'feed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-pixel text-xs px-4 py-2 rounded-lg border-2 transition-all ${
              activeTab === tab
                ? 'bg-amber-600 border-yellow-300 text-slate-950 font-bold shadow'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {tab === 'buy' && '🛍️ SHOP WARES'}
            {tab === 'upgrade' && '✨ UPGRADE CARD'}
            {tab === 'remove' && '✂️ REMOVE CARD'}
            {tab === 'feed' && '🍪 FEED FOOD'}
          </button>
        ))}
      </div>

      {feedNotification && (
        <div className="bg-emerald-950 border-2 border-emerald-400 text-emerald-200 font-pixel text-xs p-3 rounded-xl text-center max-w-xl mx-auto mb-3 animate-bounce">
          {feedNotification}
        </div>
      )}

      {/* Main Tab Panels */}
      <main className="flex-1 max-w-6xl mx-auto w-full overflow-y-auto p-2">
        {/* TAB 1: BUY */}
        {activeTab === 'buy' && (
          <div className="flex flex-col gap-6">
            {/* 1. New Stuffy Recruitment (3 Choices -> 3 Loadout Presets) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-pixel text-xs text-yellow-400 font-bold">
                  🧸 RECRUIT NEW STUFFY (60 GOLD) - ADDS TO BENCH WITH 10 CARDS
                </h3>
              </div>

              {!selectedStuffyToBuy ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {merchantStuffies.map((sId) => {
                    const species = STUFFY_MAP.get(sId);
                    if (!species) return null;
                    const canAfford = gold >= 60;

                    return (
                      <div
                        key={sId}
                        onClick={() => canAfford && handleSelectStuffy(sId)}
                        className={`bg-slate-900 border-2 p-3 rounded-xl flex flex-col items-center text-center transition-all ${
                          canAfford
                            ? 'border-slate-700 hover:border-yellow-400 cursor-pointer hover:scale-105'
                            : 'border-slate-800 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="w-16 h-16 mb-2">
                          <StuffySprite
                            stuffy={{
                              instanceId: `shop_${species.id}`,
                              speciesId: species.id,
                              name: species.name,
                              maxHp: species.baseHp,
                              currentHp: species.baseHp,
                              shield: 0,
                              isUnstuffed: false,
                              statusEffects: [],
                            }}
                            size={64}
                          />
                        </div>
                        <h4 className="font-pixel text-xs text-yellow-300 font-bold">{species.name}</h4>
                        <span className="font-mono text-[10px] text-slate-400">{species.species} • {species.baseHp} HP</span>
                        <p className="font-sans text-[10px] text-slate-300 mt-1 line-clamp-2">{species.description}</p>
                        <span className="font-pixel text-[10px] text-emerald-400 mt-2">💵 60 Stuffydolars</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Interactive Loadout Inspector for chosen Stuffy */
                <div className="bg-slate-900 border-2 border-yellow-500 rounded-2xl p-4 text-left">
                  {(() => {
                    const species = STUFFY_MAP.get(selectedStuffyToBuy);
                    const loadouts = getLoadoutsForStuffy(selectedStuffyToBuy);
                    const activeLoadout = loadouts.find((l) => l.id === selectedLoadoutId) || loadouts[0];

                    const cardCounts = (activeLoadout?.cardIds || []).reduce<Record<string, number>>((acc, id) => {
                      acc[id] = (acc[id] || 0) + 1;
                      return acc;
                    }, {});

                    return (
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                          <div>
                            <h4 className="font-pixel text-sm text-yellow-300 font-bold">
                              RECRUITING: {species?.name.toUpperCase()} ({species?.baseHp} HP)
                            </h4>
                            <p className="font-sans text-xs text-slate-400 mt-0.5">
                              {species?.description}
                            </p>
                          </div>
                          <span className="font-pixel text-xs text-amber-400 font-bold">🪙 60 GOLD</span>
                        </div>

                        {/* Preset Selector Tabs */}
                        <div className="text-xs font-pixel text-yellow-400 font-bold mb-1.5">
                          SELECT 10-CARD LOADOUT PRESET:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                          {loadouts.map((l) => {
                            const isSelected = activeLoadout.id === l.id;
                            return (
                              <button
                                key={l.id}
                                onClick={() => setSelectedLoadoutId(l.id)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-yellow-950/80 border-yellow-400 ring-2 ring-yellow-400/60 shadow'
                                    : 'bg-slate-950 border-slate-700 hover:border-slate-500'
                                }`}
                              >
                                <div className="font-pixel text-xs text-yellow-300 font-bold">{l.name}</div>
                                <div className="font-sans text-[10px] text-slate-300 mt-0.5">{l.theme}</div>
                                <div className="font-pixel text-[9px] text-purple-300 mt-1">Avg: B-Tier (10 Cards)</div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Cards in this loadout (itemized list, clickable to inspect) */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-pixel text-[11px] text-yellow-400 font-bold">
                              CARDS IN &quot;{activeLoadout.name.toUpperCase()}&quot; (CLICK CARD TO INSPECT):
                            </span>
                            <span className="font-pixel text-[9px] text-slate-400">10 CARDS TOTAL</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                            {Object.entries(cardCounts).map(([cardId, count]) => {
                              const card = CARD_MAP.get(cardId);
                              if (!card) return null;
                              const tierStyle = TIER_COLORS[card.tier] || TIER_COLORS.C;

                              return (
                                <button
                                  key={cardId}
                                  onClick={() => setInspectedCard(card)}
                                  className="flex items-center justify-between bg-slate-900/90 hover:bg-slate-800 p-1.5 rounded border border-slate-700 text-left transition-all cursor-pointer hover:border-yellow-400 group"
                                  title="Click to view full card stats and artwork"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="font-pixel text-[10px] font-bold text-yellow-300">
                                      {count}x
                                    </span>
                                    <span className={`font-pixel text-[8px] px-1 py-0.5 rounded border font-bold ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                                      {card.tier}
                                    </span>
                                    <span className="font-pixel text-[10px] text-slate-200 truncate group-hover:text-yellow-300">
                                      {card.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 shrink-0 ml-1">
                                    <span>🍪{card.cost}</span>
                                    <span className="text-yellow-400 group-hover:scale-110">🔍</span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Confirm / Cancel Buttons */}
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setSelectedStuffyToBuy(null)}
                            className="font-pixel text-xs px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-600 cursor-pointer"
                          >
                            CANCEL
                          </button>
                          <button
                            disabled={gold < 60}
                            onClick={() => handleConfirmStuffyPurchase(selectedStuffyToBuy, activeLoadout.id)}
                            className="font-pixel text-xs px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-bold rounded-xl border-2 border-yellow-300 cursor-pointer shadow-lg disabled:cursor-not-allowed"
                          >
                            RECRUIT WITH THIS LOADOUT (🪙 60)
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* 2. Powerful Cards (6 slots: 4 standard + 2 special) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-pixel text-xs text-yellow-400 font-bold">
                  🃏 6 CARDS FOR SALE (TAILORED TO YOUR SQUAD)
                </h3>
                <span className="font-pixel text-[9px] text-amber-300">
                  SLOTS 1-4: STANDARD • SLOTS 5-6: ⭐ SPECIAL WARES ⭐
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {merchantCards.map((card, idx) => {
                  const isSpecialSlot = idx >= 4;
                  const price = card.tier === 'S' ? 50 : card.tier === 'A' ? 35 : 25;
                  const canAfford = gold >= price;

                  return (
                    <div
                      key={`${card.id}_${idx}`}
                      className={`flex flex-col items-center p-2 rounded-2xl transition-all ${
                        isSpecialSlot
                          ? 'bg-purple-950/40 border-2 border-purple-500/60 shadow-lg shadow-purple-900/30'
                          : 'bg-slate-900/60 border border-slate-800'
                      }`}
                    >
                      {isSpecialSlot && (
                        <span className="font-pixel text-[8px] bg-gradient-to-r from-purple-600 to-amber-500 text-white font-bold px-2 py-0.5 rounded-full mb-1 border border-yellow-300 shadow animate-pulse">
                          ⭐ SPECIAL WARES ⭐
                        </span>
                      )}
                      <CardView card={card} compact={true} canAfford={canAfford} onClick={() => buyCard(card.id, price)} />
                      <button
                        disabled={!canAfford}
                        onClick={() => buyCard(card.id, price)}
                        className={`font-pixel text-[10px] mt-2 px-3 py-1 rounded border w-full ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold border-amber-400 cursor-pointer shadow'
                            : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        🪙 {price} GOLD
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2.5. Ancient Espers for Hire (Campaign Run Spirits) */}
            {merchantEspers && merchantEspers.length > 0 && (
              <div className="bg-gradient-to-r from-fuchsia-950/70 via-purple-950/50 to-slate-900 p-4 rounded-2xl border-2 border-fuchsia-500/60 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl animate-pulse">🔮</span>
                    <div>
                      <h4 className="font-pixel text-xs text-fuchsia-300 font-bold">
                        ANCIENT ESPERS (CAMPAIGN SPIRIT INFUSION)
                      </h4>
                      <p className="font-sans text-[10px] text-fuchsia-200/70">
                        Bond a mythical esper to any stuffy for the rest of this run to gain massive stat and elemental boosts!
                      </p>
                    </div>
                  </div>
                  <span className="font-pixel text-[9px] bg-fuchsia-900/60 text-fuchsia-300 px-2.5 py-1 rounded-full border border-fuchsia-500/40">
                    RUN EXCLUSIVE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {merchantEspers.map((esper) => (
                    <div
                      key={esper.id}
                      className="bg-slate-950/90 border border-fuchsia-500/50 hover:border-fuchsia-400 rounded-xl p-3 flex flex-col justify-between transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-2xl">{esper.icon}</span>
                          <span className="font-pixel text-[9px] uppercase text-fuchsia-400 font-bold tracking-wider">
                            {esper.element}
                          </span>
                        </div>
                        <h5 className="font-pixel text-xs text-fuchsia-200 font-bold">{esper.name}</h5>
                        <p className="text-[10px] text-fuchsia-300/80 italic mb-1.5">{esper.title}</p>
                        <p className="text-[10px] text-slate-300 mb-2 leading-relaxed">{esper.description}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {esper.boost.speed && (
                            <span className="text-[9px] font-mono bg-cyan-950 border border-cyan-500/50 text-cyan-300 px-1.5 py-0.5 rounded font-bold">
                              +{esper.boost.speed} Speed
                            </span>
                          )}
                          {esper.boost.maxHp && (
                            <span className="text-[9px] font-mono bg-emerald-950 border border-emerald-500/50 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                              +{esper.boost.maxHp} Max HP
                            </span>
                          )}
                          {esper.boost.startShield && (
                            <span className="text-[9px] font-mono bg-blue-950 border border-blue-500/50 text-blue-300 px-1.5 py-0.5 rounded font-bold">
                              +{esper.boost.startShield} Shield
                            </span>
                          )}
                          {esper.boost.damageBonus && (
                            <span className="text-[9px] font-mono bg-rose-950 border border-rose-500/50 text-rose-300 px-1.5 py-0.5 rounded font-bold">
                              +{esper.boost.damageBonus} Dmg
                            </span>
                          )}
                          {esper.boost.freezeChance && (
                            <span className="text-[9px] font-mono bg-sky-950 border border-sky-500/50 text-sky-300 px-1.5 py-0.5 rounded font-bold">
                              +{esper.boost.freezeChance}% Freeze
                            </span>
                          )}
                          {esper.boost.burnChance && (
                            <span className="text-[9px] font-mono bg-amber-950 border border-amber-500/50 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                              +{esper.boost.burnChance}% Burn
                            </span>
                          )}
                          {esper.boost.shockChance && (
                            <span className="text-[9px] font-mono bg-yellow-950 border border-yellow-500/50 text-yellow-300 px-1.5 py-0.5 rounded font-bold">
                              +{esper.boost.shockChance}% Shock
                            </span>
                          )}
                          {esper.boost.stunChance && (
                            <span className="text-[9px] font-mono bg-purple-950 border border-purple-500/50 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                              +{esper.boost.stunChance}% Stun
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        disabled={gold < esper.price}
                        onClick={() => setSelectedEsperToBuy(esper)}
                        className="w-full font-pixel text-xs py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold rounded-xl border border-fuchsia-400/50 shadow transition-all cursor-pointer disabled:cursor-not-allowed"
                      >
                        INFUSE ESPER (🪙 {esper.price})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Foods & Relics & Fluff Upgrade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Foods */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <h4 className="font-pixel text-xs text-yellow-400 font-bold mb-2">🍪 GOURMET FOODS</h4>
                <div className="flex flex-col gap-2">
                  {merchantFoods.map((food) => (
                    <div key={food.id} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="text-xl">{food.icon}</span>
                        <span className="font-mono text-slate-200">{food.name}</span>
                      </span>
                      <button
                        disabled={gold < food.price}
                        onClick={() => buyFood(food.id)}
                        className="font-pixel text-[9px] px-2 py-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-slate-950 font-bold rounded"
                      >
                        🪙 {food.price}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Relics */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <h4 className="font-pixel text-xs text-yellow-400 font-bold mb-2">🏆 ANCIENT RELICS</h4>
                <div className="flex flex-col gap-2">
                  {merchantRelics.map((relic) => (
                    <div key={relic.id} className="flex flex-col bg-slate-950 p-2 rounded border border-slate-800 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-pixel text-[10px] text-yellow-300 flex items-center gap-1">
                          <span>{relic.icon}</span>
                          <span>{relic.name}</span>
                        </span>
                        <button
                          disabled={gold < relic.price}
                          onClick={() => buyRelic(relic.id)}
                          className="font-pixel text-[9px] px-2 py-1 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-slate-950 font-bold rounded"
                        >
                          🪙 {relic.price}
                        </button>
                      </div>
                      <p className="font-sans text-[10px] text-slate-400">{relic.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* More Fluff (Permanent HP Upgrade) */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="font-pixel text-xs text-yellow-400 font-bold mb-1">☁️ MORE FLUFF (+10 MAX HP)</h4>
                  <p className="font-sans text-[10px] text-slate-300 mb-3">
                    Stuff extra high-density cotton into any stuffy permanently.
                  </p>
                  <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                    {activeParty.map((s) => (
                      <button
                        key={s.instanceId}
                        disabled={gold < fluffUpgradePrice}
                        onClick={() => buyFluffUpgrade(s.instanceId)}
                        className="flex justify-between items-center bg-slate-950 hover:bg-slate-800 p-1.5 rounded border border-slate-700 font-pixel text-[9px] text-slate-200"
                      >
                        <span>{s.name} ({s.maxHp} HP)</span>
                        <span className="text-amber-400">🪙 {fluffUpgradePrice}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UPGRADE CARD */}
        {activeTab === 'upgrade' && (
          <div>
            <h3 className="font-pixel text-xs text-yellow-400 font-bold mb-2">
              ✨ UPGRADE CARD STATS (+30% DAMAGE/BLOCK/HEAL) - 30 GOLD
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto p-2">
              {deck.map((card, idx) => (
                <div key={`${card.id}_${idx}`} className="flex flex-col items-center">
                  <CardView card={card} compact={true} />
                  <button
                    disabled={gold < 30 || card.upgraded}
                    onClick={() => upgradeCardInDeck(idx, 30)}
                    className={`font-pixel text-[9px] mt-1.5 px-3 py-1 rounded border ${
                      !card.upgraded && gold >= 30
                        ? 'bg-purple-600 hover:bg-purple-500 text-white font-bold border-purple-400 cursor-pointer'
                        : 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {card.upgraded ? 'ALREADY UPGRADED' : 'UPGRADE (🪙 30)'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REMOVE CARD */}
        {activeTab === 'remove' && (
          <div>
            <h3 className="font-pixel text-xs text-yellow-400 font-bold mb-2">
              ✂️ REMOVE UNWANTED CARD FROM DECK - {cardRemovalPrice} GOLD
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto p-2">
              {deck.map((card, idx) => (
                <div key={`${card.id}_${idx}`} className="flex flex-col items-center">
                  <CardView card={card} compact={true} onClick={() => setInspectedCard(card)} />
                  <button
                    disabled={gold < cardRemovalPrice}
                    onClick={() => setCardToRemoveIndex(idx)}
                    className="font-pixel text-[9px] mt-1.5 px-3 py-1 rounded border bg-red-600 hover:bg-red-500 disabled:bg-slate-800 text-white font-bold border-red-400 cursor-pointer"
                  >
                    REMOVE (🪙 {cardRemovalPrice})
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FEED FOOD */}
        {activeTab === 'feed' && (
          <div className="flex flex-col gap-4">
            <h3 className="font-pixel text-xs text-yellow-400 font-bold">
              🍪 FEED STUFFIES (INSTANT HEAL FORMULA)
            </h3>
            <p className="font-mono text-xs text-slate-300">
              Select a food from inventory, then click a wounded stuffy to feed them!
              <br />
              <span className="text-yellow-400">&gt;90% HP = 100% Full Heal</span> •{' '}
              <span className="text-emerald-400">Favorite = 75% Missing Fluff</span> •{' '}
              <span className="text-sky-400">Mid = 37.5%</span> •{' '}
              <span className="text-rose-400">Hated = 25%</span>
            </p>

            {/* Owned Foods */}
            <div className="flex gap-2 overflow-x-auto p-2 bg-slate-900 rounded-xl border border-slate-800">
              {useCampaignStore.getState().foodsInventory.map((food, i) => (
                <button
                  key={`${food.id}_${i}`}
                  onClick={() => setSelectedFoodToFeed(food.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                    selectedFoodToFeed === food.id
                      ? 'bg-amber-950 border-amber-400 ring-2 ring-amber-400'
                      : 'bg-slate-950 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span className="text-2xl">{food.icon}</span>
                  <div className="text-left">
                    <div className="font-pixel text-[10px] text-yellow-300">{food.name}</div>
                    <div className="font-sans text-[9px] text-slate-400">{food.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Target Stuffy to Feed */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[...activeParty, ...bench].map((stuffy) => {
                const species = STUFFY_MAP.get(stuffy.speciesId);
                const isWounded = stuffy.currentHp < stuffy.maxHp;

                return (
                  <div
                    key={stuffy.instanceId}
                    onClick={() => selectedFoodToFeed && handleFeedStuffy(stuffy.instanceId)}
                    className={`bg-slate-900 p-3 rounded-xl border-2 flex flex-col items-center transition-all ${
                      selectedFoodToFeed
                        ? 'border-emerald-500 hover:scale-105 cursor-pointer ring-2 ring-emerald-500/50'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="w-14 h-14">
                      <StuffySprite stuffy={stuffy} size={56} />
                    </div>
                    <span className="font-pixel text-[10px] text-yellow-300 mt-1">{stuffy.name}</span>
                    <span className="font-pixel text-[9px] text-slate-300">
                      {stuffy.currentHp}/{stuffy.maxHp} HP
                    </span>
                    {species && (
                      <div className="text-[8px] font-mono text-slate-400 text-center mt-1">
                        Fav: {species.favoriteFoods.join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CONFIRM CARD REMOVAL MODAL */}
        {cardToRemoveIndex !== null && deck[cardToRemoveIndex] && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-red-500 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center text-center animate-scale-in">
              <span className="text-4xl mb-2">✂️</span>
              <h3 className="font-pixel text-sm text-red-400 font-bold mb-2">
                ARE YOU SURE YOU WANT TO DELETE THIS CARD?
              </h3>
              <p className="font-sans text-xs text-slate-300 mb-4">
                This will permanently remove <strong className="text-yellow-300">{deck[cardToRemoveIndex].name}</strong> from your campaign deck for <strong className="text-emerald-400">{cardRemovalPrice} Stuffydolars</strong>. This action cannot be undone!
              </p>

              <div className="mb-4">
                <CardView card={deck[cardToRemoveIndex]} compact={true} />
              </div>

              <div className="flex gap-3 w-full justify-center">
                <button
                  onClick={() => setCardToRemoveIndex(null)}
                  className="font-pixel text-xs px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  disabled={gold < cardRemovalPrice}
                  onClick={() => {
                    removeCardFromDeck(cardToRemoveIndex);
                    setCardToRemoveIndex(null);
                  }}
                  className="font-pixel text-xs px-5 py-2.5 rounded-xl border-2 border-red-400 bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer shadow-lg"
                >
                  YES, DELETE CARD (🪙 {cardRemovalPrice})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ESPER INFUSION SELECTION MODAL */}
        {selectedEsperToBuy && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedEsperToBuy(null)}
          >
            <div
              className="bg-slate-900 border-2 border-fuchsia-500 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{selectedEsperToBuy.icon}</span>
                <div>
                  <h3 className="font-pixel text-sm text-fuchsia-300 font-bold">{selectedEsperToBuy.name}</h3>
                  <p className="text-xs text-slate-400">Choose a stuffy to permanently infuse with this Esper:</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 my-4 max-h-60 overflow-y-auto pr-1">
                {activeParty.map((s) => (
                  <button
                    key={s.instanceId}
                    onClick={() => {
                      buyEsper(selectedEsperToBuy.id, s.instanceId);
                      setSelectedEsperToBuy(null);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-fuchsia-950/40 border border-slate-700 hover:border-fuchsia-400 text-left transition-all cursor-pointer group"
                  >
                    <div>
                      <div className="font-pixel text-xs text-yellow-300 font-bold group-hover:text-yellow-200">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.currentHp}/{s.maxHp} HP • {s.speed ?? 100} Speed • {(s.espers || []).length} Espers
                      </div>
                    </div>
                    <span className="font-pixel text-[10px] text-fuchsia-400 group-hover:text-fuchsia-300 font-bold bg-fuchsia-950/80 px-2 py-1 rounded border border-fuchsia-500/40">
                      INFUSE ➔
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedEsperToBuy(null)}
                  className="font-pixel text-xs px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FULL CARD INSPECTION MODAL */}
        {inspectedCard && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setInspectedCard(null)}
          >
            <div
              className="bg-slate-900 border-2 border-yellow-500/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center animate-scale-in max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="font-pixel text-xs text-yellow-300 font-bold">
                  CARD PREVIEW
                </span>
                <button
                  onClick={() => setInspectedCard(null)}
                  className="text-slate-400 hover:text-white font-pixel text-xs px-2 py-0.5 rounded border border-slate-700 hover:bg-slate-800"
                >
                  ✖ CLOSE
                </button>
              </div>
              <CardView card={inspectedCard} compact={false} />
              <button
                onClick={() => setInspectedCard(null)}
                className="mt-4 font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-yellow-300 px-6 py-2 rounded-xl border border-slate-600 cursor-pointer"
              >
                BACK TO SHOP
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
