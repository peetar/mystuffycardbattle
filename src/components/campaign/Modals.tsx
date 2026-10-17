'use client';

import React, { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { STUFFY_MAP } from '@/data/stuffies';
import { StuffySprite } from '../battle/StuffySprite';
import { CardView } from '../battle/CardView';

interface DeckModalProps {
  onClose: () => void;
}

export const DeckModal: React.FC<DeckModalProps> = ({ onClose }) => {
  const { deck } = useCampaignStore();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-6 select-none overflow-y-auto text-white">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <h2 className="font-pixel text-lg text-yellow-400 font-bold">
          FULL MASTER DECK ({deck.length} CARDS)
        </h2>
        <button
          onClick={onClose}
          className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-600 cursor-pointer"
        >
          CLOSE [ESC] ✖️
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 my-4 overflow-y-auto max-h-[75vh] p-2">
        {deck.map((card, idx) => (
          <CardView key={`${card.id}_${idx}`} card={card} compact={true} />
        ))}
      </div>
    </div>
  );
};

interface PartyModalProps {
  onClose: () => void;
}

export const PartyModal: React.FC<PartyModalProps> = ({ onClose }) => {
  const { activeParty, bench, foodsInventory, swapPartyAndBench, feedFoodToStuffy } = useCampaignStore();
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [feedMessage, setFeedMessage] = useState<string | null>(null);

  const handleFeed = (instanceId: string) => {
    if (!selectedFoodId) return;
    const res = feedFoodToStuffy(instanceId, selectedFoodId);
    setFeedMessage(res.message);
    setSelectedFoodId(null);
    setTimeout(() => setFeedMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-6 select-none overflow-y-auto text-white">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div>
          <h2 className="font-pixel text-lg text-yellow-400 font-bold">SQUAD &amp; BENCH MANAGEMENT</h2>
          <p className="font-pixel text-[10px] text-slate-400">
            Up to 5 stuffies active on the battlefield. Feed food or swap bench members anytime!
          </p>
        </div>
        <button
          onClick={onClose}
          className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-600 cursor-pointer"
        >
          CLOSE [ESC] ✖️
        </button>
      </div>

      {feedMessage && (
        <div className="bg-emerald-950 border-2 border-emerald-400 text-emerald-200 font-pixel text-xs p-3 rounded-xl text-center max-w-xl mx-auto my-2 animate-bounce">
          {feedMessage}
        </div>
      )}

      {/* Food Bag Tray */}
      {foodsInventory.length > 0 && (
        <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-600/50 my-2">
          <div className="font-pixel text-[10px] text-amber-300 font-bold mb-2">
            🍪 FOOD BAG (CLICK A FOOD, THEN CLICK A STUFFY BELOW TO HEAL):
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {foodsInventory.map((food, i) => (
              <button
                key={`${food.id}_${i}`}
                onClick={() => setSelectedFoodId(selectedFoodId === food.id ? null : food.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
                  selectedFoodId === food.id
                    ? 'bg-amber-600 border-yellow-300 text-slate-950 font-bold ring-2 ring-yellow-400'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <span className="text-xl">{food.icon}</span>
                <span className="font-pixel text-[9px]">{food.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 my-2">
        {/* Active 5 */}
        <div className="bg-slate-900/80 p-4 rounded-xl border-2 border-emerald-500/50">
          <h3 className="font-pixel text-xs text-emerald-400 mb-3 font-bold">
            ⚔️ ACTIVE SQUAD (MAX 5 IN BATTLE)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {activeParty.map((s, idx) => (
              <div
                key={s.instanceId}
                onClick={() => selectedFoodId && handleFeed(s.instanceId)}
                className={`bg-slate-950 p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  selectedFoodId
                    ? 'border-yellow-400 hover:scale-105 cursor-pointer ring-2 ring-yellow-400/50 animate-pulse'
                    : 'border-slate-700'
                }`}
              >
                <StuffySprite stuffy={s} size={56} />
                <span className="font-pixel text-xs text-yellow-300 mt-2">{s.name}</span>
                <span className={`font-pixel text-[9px] ${s.currentHp < s.maxHp ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                  {s.currentHp}/{s.maxHp} HP
                </span>
                <span className="font-pixel text-[8px] text-emerald-400 mt-1">SLOT #{idx + 1} ACTIVE</span>
                {selectedFoodId && s.currentHp < s.maxHp && (
                  <span className="font-pixel text-[8px] text-yellow-300 bg-amber-950 px-2 py-0.5 rounded mt-1 border border-yellow-500">
                    FEED FOOD 🍪
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bench */}
        <div className="bg-slate-900/80 p-4 rounded-xl border-2 border-slate-700">
          <h3 className="font-pixel text-xs text-slate-400 mb-3 font-bold">
            🛋️ BENCH RESERVES ({bench.length})
          </h3>
          {bench.length === 0 ? (
            <p className="font-mono text-xs text-slate-500 italic">
              No extra stuffies on bench yet. Recruit more at the Merchant!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {bench.map((s, bIdx) => (
                <div
                  key={s.instanceId}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col items-center text-center"
                >
                  <StuffySprite stuffy={s} size={56} />
                  <span className="font-pixel text-xs text-yellow-300 mt-2">{s.name}</span>
                  <span className="font-pixel text-[9px] text-slate-400">{s.currentHp}/{s.maxHp} HP</span>
                  <button
                    onClick={() => swapPartyAndBench(0, bIdx)}
                    className="font-pixel text-[8px] mt-2 px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded"
                  >
                    SWAP INTO SQUAD
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
