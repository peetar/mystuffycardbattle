'use client';

import React, { useState } from 'react';
import { useCombatStore } from '@/store/combatStore';
import { useCampaignStore } from '@/store/campaignStore';
import { CardView } from './CardView';
import { sound } from '@/utils/audio';

interface CardPullModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardPullModal: React.FC<CardPullModalProps> = ({ isOpen, onClose }) => {
  const combatState = useCombatStore();
  const campaignState = useCampaignStore();

  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const inCombat = combatState.battleResult === 'ongoing' && combatState.playerTeam.length > 0;
  const currentDeck = inCombat ? combatState.playerDeck : campaignState.deck;

  const handlePullToTop = (cardIdx: number) => {
    sound.playRewardSound();
    const targetCard = currentDeck[cardIdx];
    if (!targetCard) return;

    if (inCombat) {
      const deck = [...combatState.playerDeck];
      const [pulled] = deck.splice(cardIdx, 1);
      deck.unshift(pulled);
      useCombatStore.setState({ playerDeck: deck });
      combatState.addLog(`🔝 [ADMIN PULL] Placed "${pulled.name}" at the top of your draw deck!`, 'special');
    } else {
      const deck = [...campaignState.deck];
      const [pulled] = deck.splice(cardIdx, 1);
      deck.unshift(pulled);
      useCampaignStore.setState({ deck });
    }

    setNotification(`🔝 "${targetCard.name}" placed at the top of your draw pile! It will be drawn next.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredCards = currentDeck
    .map((card, idx) => ({ card, originalIndex: idx }))
    .filter(({ card }) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        card.name.toLowerCase().includes(q) ||
        (card.description && card.description.toLowerCase().includes(q)) ||
        (card.stuffyId && card.stuffyId.toLowerCase().includes(q))
      );
    });

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto select-none">
      <div className="bg-gradient-to-b from-slate-950 via-indigo-950/80 to-slate-950 border-2 border-cyan-400 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl shadow-cyan-950/80 flex flex-col gap-5 text-white animate-scale-in max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🎴</span>
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 font-pixel text-[10px]">
                <span>ADMIN COMMAND</span>
                <span>•</span>
                <span>/.PULL DECK SELECTOR</span>
              </div>
              <h2 className="font-pixel text-lg md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 font-extrabold tracking-wide">
                DECK PULL SELECTOR
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

        {/* Subtitle & Instructions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-700 p-3 rounded-2xl">
          <div>
            <h4 className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
              <span>🔝</span>
              <span>CLICK ANY CARD TO PUT IT AT THE TOP OF YOUR DECK:</span>
            </h4>
            <p className="font-sans text-[11px] text-slate-300 mt-0.5">
              The chosen card is moved to index 0 (top of draw pile). When you draw next turn, this card will be drawn first!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs text-cyan-300 bg-cyan-950/90 px-3 py-1.5 rounded-xl border border-cyan-500/40 font-bold whitespace-nowrap">
              {currentDeck.length} Cards in Deck
            </span>
          </div>
        </div>

        {/* Notification Banner */}
        {notification && (
          <div className="p-3 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-pixel text-center animate-fadeIn shadow-lg">
            {notification}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search deck cards by name or effect..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Cards Grid */}
        {filteredCards.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center gap-3">
            <span className="text-4xl opacity-40">📭</span>
            <h4 className="font-pixel text-xs text-slate-400">NO CARDS FOUND IN DECK</h4>
            <p className="font-sans text-xs text-slate-500 max-w-sm">
              Your draw deck currently has no cards matching your search filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[50vh] overflow-y-auto p-1 pr-2">
            {filteredCards.map(({ card, originalIndex }) => {
              const isTopCard = originalIndex === 0;
              return (
                <div
                  key={`${card.id}_${originalIndex}`}
                  onClick={() => handlePullToTop(originalIndex)}
                  className={`group relative flex flex-col items-center p-2 rounded-2xl border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md ${
                    isTopCard
                      ? 'border-yellow-400 bg-gradient-to-b from-amber-950/80 to-slate-950 ring-2 ring-yellow-400/80 shadow-yellow-950'
                      : 'border-slate-700 bg-slate-900/90 hover:border-cyan-400'
                  }`}
                  title="Click to put this card at the top of your deck"
                >
                  {isTopCard && (
                    <span className="font-pixel text-[9px] bg-yellow-400 text-slate-950 px-2 py-0.5 rounded-full font-bold mb-1 shadow animate-pulse">
                      🔝 TOP OF DECK
                    </span>
                  )}

                  <div className="scale-90 origin-top">
                    <CardView card={card} compact={true} />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePullToTop(originalIndex);
                    }}
                    className="w-full mt-2 font-pixel text-[10px] py-1 bg-cyan-600 hover:bg-cyan-500 group-hover:bg-cyan-400 text-slate-950 font-bold rounded-lg shadow cursor-pointer transition-all"
                  >
                    {isTopCard ? '★ AT TOP' : 'PUT AT TOP ➔'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
