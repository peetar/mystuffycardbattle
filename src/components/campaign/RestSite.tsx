'use client';

import React, { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { STUFFY_MAP } from '@/data/stuffies';
import { StuffySprite } from '../battle/StuffySprite';
import { CardView } from '../battle/CardView';

interface RestSiteProps {
  onLeaveRest: () => void;
}

export const RestSite: React.FC<RestSiteProps> = ({ onLeaveRest }) => {
  const { activeParty, bench, deck, foodsInventory, healParty, upgradeCardInDeck, feedFoodToStuffy } =
    useCampaignStore();

  const [hasActionTaken, setHasActionTaken] = useState(false);
  const [mode, setMode] = useState<'options' | 'feed' | 'upgrade'>('options');
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRestTeam = () => {
    // Rest heals 35% HP to party and bench, but Beaker is not affected by rests per user rule!
    const healList = (list: typeof activeParty) =>
      list.map((s) => {
        if (s.speciesId === 'beaker') {
          return s; // rests don't affect beaker
        }
        const healAmt = Math.round(s.maxHp * 0.35);
        return {
          ...s,
          currentHp: Math.min(s.maxHp, s.currentHp + healAmt),
          isUnstuffed: false,
        };
      });

    const updatedParty = healList(activeParty);
    const updatedBench = healList(bench);

    useCampaignStore.setState({ activeParty: updatedParty, bench: updatedBench });
    setMessage('Your squad and benched stuffies rested under warm blankets! Restored 35% fluff (Beaker stayed vigilant).');
    setHasActionTaken(true);
  };

  const handleFeed = (instanceId: string) => {
    if (!selectedFood) return;
    const res = feedFoodToStuffy(instanceId, selectedFood);
    setMessage(res.message);
    setSelectedFood(null);
    setHasActionTaken(true);
    setMode('options');
  };

  const handleUpgrade = (idx: number) => {
    upgradeCardInDeck(idx, 0); // Free upgrade at rest site!
    setMessage('Card reinforced with golden thread!');
    setHasActionTaken(true);
    setMode('options');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-6 select-none overflow-y-auto text-white">
      {/* Header */}
      <div className="text-center my-4">
        <span className="text-5xl block mb-2 animate-bounce-short">🏕️</span>
        <h2 className="font-pixel text-xl md:text-2xl text-yellow-400 font-bold">
          COZY QUILT REST SITE
        </h2>
        <p className="font-pixel text-xs text-slate-300 mt-1">
          A warm campfire under folded blankets. Rest your squad or reinforce your stitches!
        </p>
      </div>

      {message && (
        <div className="bg-emerald-950 border-2 border-emerald-400 text-emerald-200 font-pixel text-xs p-3 rounded-xl text-center max-w-xl mx-auto my-2 animate-bounce">
          {message}
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center">
        {mode === 'options' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Option 1: Rest (+35% Fluff) */}
            <button
              disabled={hasActionTaken}
              onClick={handleRestTeam}
              className={`p-6 rounded-2xl border-4 flex flex-col items-center text-center transition-all ${
                !hasActionTaken
                  ? 'bg-slate-900 border-emerald-500 hover:scale-105 hover:bg-emerald-950/40 cursor-pointer shadow-xl'
                  : 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-4xl mb-3">🛌</span>
              <h3 className="font-pixel text-sm text-yellow-300 font-bold mb-2">REST & RE-FLUFF</h3>
              <p className="font-sans text-xs text-slate-300">
                Restitch team and restore 35% missing HP. (Beaker rests not, but regenerates in battle!)
              </p>
            </button>

            {/* Option 2: Feed Snack */}
            <button
              disabled={hasActionTaken || foodsInventory.length === 0}
              onClick={() => setMode('feed')}
              className={`p-6 rounded-2xl border-4 flex flex-col items-center text-center transition-all ${
                !hasActionTaken && foodsInventory.length > 0
                  ? 'bg-slate-900 border-amber-500 hover:scale-105 hover:bg-amber-950/40 cursor-pointer shadow-xl'
                  : 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-4xl mb-3">🍪</span>
              <h3 className="font-pixel text-sm text-yellow-300 font-bold mb-2">CAMP SNACK BUFFET</h3>
              <p className="font-sans text-xs text-slate-300">
                Feed gourmet foods ({foodsInventory.length} owned) to targeted stuffies for instant health!
              </p>
            </button>

            {/* Option 3: Upgrade Card */}
            <button
              disabled={hasActionTaken}
              onClick={() => setMode('upgrade')}
              className={`p-6 rounded-2xl border-4 flex flex-col items-center text-center transition-all ${
                !hasActionTaken
                  ? 'bg-slate-900 border-purple-500 hover:scale-105 hover:bg-purple-950/40 cursor-pointer shadow-xl'
                  : 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-4xl mb-3">🪡</span>
              <h3 className="font-pixel text-sm text-yellow-300 font-bold mb-2">REINFORCE CARD</h3>
              <p className="font-sans text-xs text-slate-300">
                Choose 1 card from your deck to permanently enhance its damage, shield, or heal!
              </p>
            </button>
          </div>
        )}

        {/* FEED MODE */}
        {mode === 'feed' && (
          <div className="flex flex-col gap-4 w-full">
            <h3 className="font-pixel text-sm text-yellow-300 text-center">SELECT A FOOD TO FEED</h3>
            <div className="flex gap-2 overflow-x-auto p-2 bg-slate-900 rounded-xl">
              {foodsInventory.map((f, i) => (
                <button
                  key={`${f.id}_${i}`}
                  onClick={() => setSelectedFood(f.id)}
                  className={`p-2 rounded-lg border-2 flex items-center gap-2 ${
                    selectedFood === f.id ? 'border-yellow-400 bg-amber-950' : 'border-slate-700 bg-slate-950'
                  }`}
                >
                  <span className="text-2xl">{f.icon}</span>
                  <span className="font-pixel text-[10px] text-yellow-200">{f.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[...activeParty, ...bench].map((s) => (
                <div
                  key={s.instanceId}
                  onClick={() => selectedFood && handleFeed(s.instanceId)}
                  className="bg-slate-900 p-2 rounded-xl border border-slate-700 flex flex-col items-center cursor-pointer hover:border-emerald-400"
                >
                  <StuffySprite stuffy={s} size={48} />
                  <span className="font-pixel text-[9px] text-yellow-300">{s.name}</span>
                  <span className="font-pixel text-[8px] text-slate-300">{s.currentHp}/{s.maxHp} HP</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setMode('options')}
              className="font-pixel text-xs px-4 py-2 bg-slate-800 text-slate-300 rounded mx-auto"
            >
              BACK
            </button>
          </div>
        )}

        {/* UPGRADE MODE */}
        {mode === 'upgrade' && (
          <div className="flex flex-col gap-4 w-full">
            <h3 className="font-pixel text-sm text-yellow-300 text-center">PICK 1 CARD TO UPGRADE FOR FREE</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto p-2">
              {deck.map((card, idx) => (
                <div key={`${card.id}_${idx}`} className="flex flex-col items-center">
                  <CardView card={card} compact={true} />
                  {!card.upgraded ? (
                    <button
                      onClick={() => handleUpgrade(idx)}
                      className="font-pixel text-[9px] mt-1.5 px-3 py-1 rounded border bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer"
                    >
                      UPGRADE ✨
                    </button>
                  ) : (
                    <span className="font-pixel text-[8px] text-slate-500 mt-1">UPGRADED</span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setMode('options')}
              className="font-pixel text-xs px-4 py-2 bg-slate-800 text-slate-300 rounded mx-auto"
            >
              BACK
            </button>
          </div>
        )}
      </div>

      {/* Leave Rest Site Button */}
      <footer className="my-4">
        <button
          onClick={onLeaveRest}
          className="font-pixel text-sm bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-8 py-3 rounded-xl border-2 border-yellow-300 shadow-xl cursor-pointer"
        >
          {hasActionTaken ? 'CONTINUE ON JOURNEY ⏭️' : 'LEAVE REST SITE 🚪'}
        </button>
      </footer>
    </div>
  );
};
