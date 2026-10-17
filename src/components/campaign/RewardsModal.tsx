'use client';

import React, { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { ALL_CARDS } from '@/data/cards';
import { FOOD_CATALOG } from '@/data/foods';
import { Card } from '@/types/game';
import { CardView } from '../battle/CardView';

interface RewardsModalProps {
  goldEarned?: number;
  onClaimAll: () => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  goldEarned = 25,
  onClaimAll,
}) => {
  const { addGold, addCardToDeck, foodsInventory, activeParty, bench } = useCampaignStore();

  // Generate 3 random cards to pick 1 ONLY from the stuffies you currently own!
  const [cardChoices] = useState<Card[]>(() => {
    const ownedSpeciesIds = new Set([
      ...activeParty.map((s) => s.speciesId),
      ...bench.map((s) => s.speciesId),
    ]);

    const validCards = ALL_CARDS.filter(
      (c) => (c.stuffyId && ownedSpeciesIds.has(c.stuffyId)) || c.isPlayerCard
    );

    return [...validCards].sort(() => Math.random() - 0.5).slice(0, 3);
  });

  // Random food drop
  const [foodDrop] = useState(() => {
    return FOOD_CATALOG[Math.floor(Math.random() * FOOD_CATALOG.length)];
  });

  const [hasClaimedCard, setHasClaimedCard] = useState(false);
  const [claimedGold, setClaimedGold] = useState(false);
  const [claimedFood, setClaimedFood] = useState(false);

  const handleClaimGold = () => {
    if (!claimedGold) {
      addGold(goldEarned);
      setClaimedGold(true);
    }
  };

  const handleClaimFood = () => {
    if (!claimedFood && foodDrop) {
      useCampaignStore.setState({ foodsInventory: [...foodsInventory, foodDrop] });
      setClaimedFood(true);
    }
  };

  const handlePickCard = (card: Card) => {
    if (!hasClaimedCard) {
      addCardToDeck(card);
      setHasClaimedCard(true);
    }
  };

  const handleFinish = () => {
    // Automatically claim unclaimed gold/food if user just hits proceed
    if (!claimedGold) addGold(goldEarned);
    if (!claimedFood && foodDrop) {
      useCampaignStore.setState({ foodsInventory: [...useCampaignStore.getState().foodsInventory, foodDrop] });
    }
    onClaimAll();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none text-white">
      <div className="bg-slate-900 border-4 border-yellow-500 rounded-2xl p-6 md:p-8 max-w-2xl w-full text-center shadow-2xl">
        <span className="text-5xl mb-2 block animate-bounce">🎁</span>
        <h2 className="font-pixel text-xl md:text-2xl text-yellow-400 font-bold mb-1">
          VICTORY SPOILS
        </h2>
        <p className="font-pixel text-[11px] text-slate-300 mb-6">
          Claim your gold, snacks, and choose 1 card to add to your deck!
        </p>

        {/* Reward Items List */}
        <div className="flex flex-col gap-3 mb-6 max-w-md mx-auto">
          {/* Gold */}
          <div
            onClick={handleClaimGold}
            className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
              claimedGold ? 'bg-slate-950 border-slate-700 opacity-60' : 'bg-slate-900 border-amber-500 hover:scale-105'
            }`}
          >
            <span className="font-pixel text-xs text-yellow-300 flex items-center gap-2">
              <span className="text-xl">🪙</span>
              <span>{goldEarned} Gold Coins</span>
            </span>
            <span className="font-pixel text-[10px] text-slate-400">
              {claimedGold ? 'COLLECTED ✅' : 'CLICK TO CLAIM'}
            </span>
          </div>

          {/* Food Drop */}
          <div
            onClick={handleClaimFood}
            className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
              claimedFood ? 'bg-slate-950 border-slate-700 opacity-60' : 'bg-slate-900 border-emerald-500 hover:scale-105'
            }`}
          >
            <span className="font-pixel text-xs text-emerald-300 flex items-center gap-2">
              <span className="text-xl">{foodDrop.icon}</span>
              <span>{foodDrop.name}</span>
            </span>
            <span className="font-pixel text-[10px] text-slate-400">
              {claimedFood ? 'COLLECTED ✅' : 'CLICK TO CLAIM'}
            </span>
          </div>
        </div>

        {/* 1 of 3 Card Draft */}
        {!hasClaimedCard ? (
          <div>
            <h3 className="font-pixel text-xs text-yellow-400 font-bold mb-3">
              CHOOSE 1 CARD FOR YOUR DECK (OR SKIP):
            </h3>
            <div className="flex gap-3 justify-center overflow-x-auto pb-4">
              {cardChoices.map((card) => (
                <CardView
                  key={card.id}
                  card={card}
                  onClick={() => handlePickCard(card)}
                  compact={true}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="font-pixel text-xs text-emerald-400 bg-emerald-950 p-2 rounded-lg border border-emerald-500 mb-4">
            Card added to your deck!
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleFinish}
          className="font-pixel text-sm bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-8 py-3 rounded-xl border-2 border-yellow-300 shadow-xl cursor-pointer"
        >
          CONTINUE TO MAP 🗺️
        </button>
      </div>
    </div>
  );
};
