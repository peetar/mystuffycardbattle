'use client';

import React, { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { STUFFY_MAP } from '@/data/stuffies';
import { StuffySprite } from '../battle/StuffySprite';
import { CardView } from '../battle/CardView';

interface RestSiteProps {
  onLeaveRest: () => void;
  onOpenPartyView?: () => void;
}

export const RestSite: React.FC<RestSiteProps> = ({ onLeaveRest, onOpenPartyView }) => {
  const { activeParty, bench, deck, upgradeCardInDeck } = useCampaignStore();

  const [hasActionTaken, setHasActionTaken] = useState(false);
  const [mode, setMode] = useState<'options' | 'upgrade' | 'polish'>('options');
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

    useCampaignStore.setState({ activeParty: updatedParty, bench: updatedBench, hasRestedInRun: true });
    setMessage('🛌 Your squad rested under warm quilts! Restored 35% fluff (Beaker stayed vigilant).');
    setHasActionTaken(true);
  };

  const handleUpgrade = (idx: number) => {
    upgradeCardInDeck(idx, 0); // Free upgrade at rest site!
    setMessage('🪡 Card reinforced with golden thread! Stats permanently boosted!');
    setHasActionTaken(true);
    setMode('options');
  };

  const handleSpeedDrill = () => {
    const updatedParty = activeParty.map((s) => ({
      ...s,
      speed: Math.min(500, (s.speed ?? 100) + 6),
      baseSpeed: (s.baseSpeed ?? 100) + 6,
    }));
    useCampaignStore.setState({ activeParty: updatedParty });
    setMessage('⚡ Campfire agility drill complete! All active squad members gained +6 Speed!');
    setHasActionTaken(true);
  };

  const handlePolishCard = (idx: number) => {
    const targetCard = deck[idx];
    if (!targetCard) return;

    const newDeck = [...deck];
    const polishedCard = {
      ...targetCard,
      damage: targetCard.damage ? targetCard.damage + 6 : targetCard.damage,
      block: targetCard.block ? targetCard.block + 5 : targetCard.block,
      name: `${targetCard.name}★`,
    };
    newDeck[idx] = polishedCard;
    useCampaignStore.setState({ deck: newDeck });

    setMessage(`✨ Polished "${targetCard.name}"! Gained permanent bonus potency (+6 Dmg / +5 Shield)!`);
    setHasActionTaken(true);
    setMode('options');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-6 select-none overflow-y-auto text-white">
      {/* Header */}
      <div className="text-center my-4 relative w-full max-w-4xl">
        {onOpenPartyView && (
          <button
            onClick={() => onOpenPartyView()}
            className="absolute top-0 right-0 font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-yellow-300 px-3 py-2 rounded-xl border border-yellow-500/50 shadow flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            title="Inspect your squad and health"
          >
            <span>🧸</span>
            <span>CHECK SQUAD ({activeParty.length})</span>
          </button>
        )}
        <span className="text-5xl block mb-2 animate-bounce-short">🏕️</span>
        <h2 className="font-pixel text-xl md:text-2xl text-yellow-400 font-bold">
          COZY QUILT REST SITE
        </h2>
        <p className="font-pixel text-xs text-slate-300 mt-1">
          A warm campfire under folded blankets. Choose one activity for your squad before continuing!
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mx-auto">
            {/* Option 1: Rest (+35% Fluff) */}
            <button
              disabled={hasActionTaken}
              onClick={handleRestTeam}
              className={`p-5 rounded-2xl border-4 flex flex-col items-center text-center transition-all ${
                !hasActionTaken
                  ? 'bg-slate-900 border-emerald-500 hover:scale-103 hover:bg-emerald-950/40 cursor-pointer shadow-xl'
                  : 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-3xl mb-2">🛌</span>
              <h3 className="font-pixel text-sm text-yellow-300 font-bold mb-1">REST & RE-FLUFF</h3>
              <p className="font-sans text-xs text-slate-300">
                Restitch team under quilts and restore 35% missing HP. (Beaker rests not, but regenerates in battle!)
              </p>
            </button>

            {/* Option 2: Upgrade Card */}
            <button
              disabled={hasActionTaken}
              onClick={() => setMode('upgrade')}
              className={`p-5 rounded-2xl border-4 flex flex-col items-center text-center transition-all ${
                !hasActionTaken
                  ? 'bg-slate-900 border-purple-500 hover:scale-103 hover:bg-purple-950/40 cursor-pointer shadow-xl'
                  : 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-3xl mb-2">🪡</span>
              <h3 className="font-pixel text-sm text-yellow-300 font-bold mb-1">REINFORCE CARD (UPGRADE)</h3>
              <p className="font-sans text-xs text-slate-300">
                Choose 1 card from your deck to permanently enhance its damage, shield, or heal with golden thread!
              </p>
            </button>

            {/* Option 3: Agility Speed Training */}
            <button
              disabled={hasActionTaken}
              onClick={handleSpeedDrill}
              className={`p-5 rounded-2xl border-4 flex flex-col items-center text-center transition-all ${
                !hasActionTaken
                  ? 'bg-slate-900 border-cyan-500 hover:scale-103 hover:bg-cyan-950/40 cursor-pointer shadow-xl'
                  : 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-3xl mb-2">⚡</span>
              <h3 className="font-pixel text-sm text-yellow-300 font-bold mb-1">AGILITY DRILL (+SPEED)</h3>
              <p className="font-sans text-xs text-slate-300">
                Campfire dash exercises! All active squad members permanently gain +6 Speed for the run.
              </p>
            </button>

            {/* Option 4: Tune & Polish Card */}
            <button
              disabled={hasActionTaken}
              onClick={() => setMode('polish')}
              className={`p-5 rounded-2xl border-4 flex flex-col items-center text-center transition-all ${
                !hasActionTaken
                  ? 'bg-slate-900 border-amber-500 hover:scale-103 hover:bg-amber-950/40 cursor-pointer shadow-xl'
                  : 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-3xl mb-2">🏷️</span>
              <h3 className="font-pixel text-sm text-yellow-300 font-bold mb-1">TUNE & POLISH (POWER POLISH)</h3>
              <p className="font-sans text-xs text-slate-300">
                Polish and tune 1 card in your deck with combat gloss (+6 Attack Damage or +5 Shield).
              </p>
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
              className="font-pixel text-xs px-4 py-2 bg-slate-800 text-slate-300 rounded mx-auto cursor-pointer"
            >
              BACK
            </button>
          </div>
        )}

        {/* POLISH MODE */}
        {mode === 'polish' && (
          <div className="flex flex-col gap-4 w-full">
            <h3 className="font-pixel text-sm text-yellow-300 text-center">PICK 1 CARD TO POLISH (+6 DMG / +5 SHIELD)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto p-2">
              {deck.map((card, idx) => (
                <div key={`${card.id}_${idx}`} className="flex flex-col items-center">
                  <CardView card={card} compact={true} />
                  <button
                    onClick={() => handlePolishCard(idx)}
                    className="font-pixel text-[9px] mt-1.5 px-3 py-1 rounded border bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer shadow"
                  >
                    POLISH 🏷️
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setMode('options')}
              className="font-pixel text-xs px-4 py-2 bg-slate-800 text-slate-300 rounded mx-auto cursor-pointer"
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
