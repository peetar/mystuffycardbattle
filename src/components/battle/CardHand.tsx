'use client';

import React from 'react';
import { Card, StuffyState } from '@/types/game';
import { CardView } from './CardView';

interface CardHandProps {
  cards: Card[];
  selectedCardIndex: number | null;
  onSelectCard: (index: number) => void;
  currentCrackers: number;
  disabled?: boolean;
  activeTeam?: StuffyState[];
}

export const CardHand: React.FC<CardHandProps> = ({
  cards,
  selectedCardIndex,
  onSelectCard,
  currentCrackers,
  disabled = false,
  activeTeam = [],
}) => {
  // When holding 4 or more cards, use sleek compact layout so hand never obscures player stuffies
  const isLargeHand = cards.length >= 4;

  return (
    <div className="relative flex justify-center items-center w-full px-1 select-none overflow-visible py-1">
      {/* Grid Layout Tray for Hand Cards (Up to 7 cards with zero cut-offs) */}
      <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 md:gap-2.5 max-w-full py-1 px-2 no-scrollbar">
        {cards.map((card, idx) => {
          const isSelected = selectedCardIndex === idx;
          const canAfford = currentCrackers >= card.cost;

          // Check if card's owner stuffy is unstuffed
          const owner = activeTeam.find((s) => s.speciesId === card.stuffyId);
          const isUnstuffedOwner = Boolean(owner && (owner.isUnstuffed || owner.currentHp <= 0));

          return (
            <div
              key={`${card.id}_${idx}`}
              className={`transition-all duration-150 ${
                isSelected ? 'z-30 scale-105' : 'z-10'
              }`}
            >
              <CardView
                card={card}
                selected={isSelected}
                canAfford={canAfford}
                disabled={disabled}
                isUnstuffedOwner={isUnstuffedOwner}
                compact={isLargeHand}
                onClick={() => onSelectCard(idx)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
