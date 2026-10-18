'use client';

import React, { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { CAMPAIGN_EVENTS } from '@/data/events';
import { PLAYER_POWERUP_CARDS } from '@/data/cards';

interface EventModalProps {
  onCompleteEvent: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ onCompleteEvent }) => {
  const { addGold, healParty, addCardToDeck, boostMaxHp, upgradeRandomCard } = useCampaignStore();

  // Pick a random event
  const [event] = useState(() => {
    return CAMPAIGN_EVENTS[Math.floor(Math.random() * CAMPAIGN_EVENTS.length)];
  });

  const [chosenConsequence, setChosenConsequence] = useState<string | null>(null);

  const handleChoose = (idx: number) => {
    const choice = event.choices[idx];
    if (!choice) return;

    if (choice.action === 'gain_gold' && choice.value) {
      addGold(choice.value);
    } else if (choice.action === 'heal_team' && choice.value) {
      healParty(choice.value);
    } else if (choice.action === 'gain_card') {
      addCardToDeck(PLAYER_POWERUP_CARDS[0]); // Master Restitch
    } else if (choice.action === 'upgrade_random') {
      upgradeRandomCard();
    } else if (choice.action === 'max_hp_boost' && choice.value) {
      boostMaxHp(choice.value);
    }

    setChosenConsequence(choice.consequence);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-4 border-sky-500 rounded-2xl p-6 md:p-8 max-w-lg w-full text-center shadow-2xl text-white">
        <span className="text-5xl mb-3 block">{event.icon}</span>
        <h2 className="font-pixel text-xl text-yellow-400 font-bold mb-3">{event.title}</h2>
        <p className="font-sans text-xs md:text-sm text-slate-300 mb-6 leading-relaxed">
          {event.description}
        </p>

        {!chosenConsequence ? (
          <div className="flex flex-col gap-3">
            {event.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleChoose(i)}
                className="bg-slate-950 hover:bg-sky-950/60 p-3 rounded-xl border-2 border-slate-700 hover:border-sky-400 font-pixel text-xs text-yellow-300 text-left transition-all cursor-pointer"
              >
                {choice.text}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-slate-950 border border-sky-400 p-4 rounded-xl mb-4">
            <p className="font-pixel text-xs text-emerald-300 mb-4">{chosenConsequence}</p>
            <button
              onClick={onCompleteEvent}
              className="font-pixel text-xs bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl border-2 border-yellow-300 cursor-pointer"
            >
              CONTINUE JOURNEY ⏭️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
