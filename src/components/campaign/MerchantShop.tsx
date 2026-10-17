'use client';

import React, { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { STUFFY_MAP, ALL_STUFFIES } from '@/data/stuffies';
import { getLoadoutsForStuffy } from '@/data/loadouts';
import { StuffySprite } from '../battle/StuffySprite';
import { CardView } from '../battle/CardView';

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
    fluffUpgradePrice,
    cardRemovalPrice,
    activeParty,
    bench,
    deck,
    buyStuffy,
    buyCard,
    buyFood,
    buyRelic,
    buyFluffUpgrade,
    removeCardFromDeck,
    upgradeCardInDeck,
    feedFoodToStuffy,
  } = useCampaignStore();

  const [activeTab, setActiveTab] = useState<'buy' | 'upgrade' | 'remove' | 'feed'>('buy');
  const [selectedStuffyToBuy, setSelectedStuffyToBuy] = useState<string | null>(null);
  const [selectedFoodToFeed, setSelectedFoodToFeed] = useState<string | null>(null);
  const [feedNotification, setFeedNotification] = useState<string | null>(null);

  const handleSelectStuffy = (speciesId: string) => {
    setSelectedStuffyToBuy(speciesId);
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
          <div className="font-pixel text-sm text-yellow-300 bg-slate-900 border-2 border-yellow-500 px-4 py-2 rounded-xl flex items-center gap-1 shadow">
            <span>🪙</span>
            <span>{gold} GOLD</span>
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
                        <span className="font-pixel text-[10px] text-amber-400 mt-2">🪙 60 Gold</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Loadout Picker for chosen Stuffy */
                <div className="bg-slate-900 border-2 border-yellow-500 rounded-2xl p-4 text-center">
                  <h4 className="font-pixel text-sm text-yellow-300 mb-2 font-bold">
                    CHOOSE 10-CARD LOADOUT PRESET FOR {STUFFY_MAP.get(selectedStuffyToBuy)?.name.toUpperCase()}
                  </h4>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {getLoadoutsForStuffy(selectedStuffyToBuy).map((l) => (
                      <button
                        key={l.id}
                        onClick={() => handleConfirmStuffyPurchase(selectedStuffyToBuy, l.id)}
                        className="bg-slate-950 hover:bg-yellow-950/60 p-3 rounded-xl border border-slate-700 hover:border-yellow-400 text-left transition-all cursor-pointer"
                      >
                        <div className="font-pixel text-xs text-yellow-400 font-bold">{l.name}</div>
                        <div className="font-sans text-[10px] text-slate-300 mt-1">{l.theme}</div>
                        <div className="font-pixel text-[9px] text-purple-300 mt-2">Avg: B-Tier</div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedStuffyToBuy(null)}
                    className="font-pixel text-[10px] px-3 py-1.5 bg-slate-800 text-slate-300 rounded border border-slate-600 cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              )}
            </div>

            {/* 2. Powerful Cards */}
            <div>
              <h3 className="font-pixel text-xs text-yellow-400 font-bold mb-2">
                🃏 RARE CARDS FOR SALE
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {merchantCards.map((card) => {
                  const price = card.tier === 'S' ? 50 : card.tier === 'A' ? 35 : 25;
                  const canAfford = gold >= price;

                  return (
                    <div key={card.id} className="flex flex-col items-center">
                      <CardView card={card} canAfford={canAfford} onClick={() => buyCard(card.id, price)} />
                      <button
                        disabled={!canAfford}
                        onClick={() => buyCard(card.id, price)}
                        className={`font-pixel text-[10px] mt-2 px-3 py-1 rounded border ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold border-amber-400 cursor-pointer'
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
                  <CardView card={card} compact={true} />
                  <button
                    disabled={gold < cardRemovalPrice}
                    onClick={() => removeCardFromDeck(idx)}
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
      </main>
    </div>
  );
};
