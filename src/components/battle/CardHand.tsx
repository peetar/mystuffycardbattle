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
  return (
    <div className="relative flex justify-center items-end h-64 w-full px-4 select-none">
      <div className="flex justify-center -space-x-8 max-w-full overflow-x-auto py-4 px-8 items-end">
        {cards.map((card, idx) => {
          const isSelected = selectedCardIndex === idx;
          const canAfford = currentCrackers >= card.cost;

          // Check if card's owner stuffy is unstuffed
          const owner = activeTeam.find((s) => s.speciesId === card.stuffyId);
          const isUnstuffedOwner = Boolean(owner && (owner.isUnstuffed || owner.currentHp <= 0));

          // Natural card fan tilt
          const total = cards.length;
          const mid = (total - 1) / 2;
          const offset = idx - mid;
          const rotation = total > 1 ? offset * 4 : 0;
          const translateY = Math.abs(offset) * 4;

          return (
            <div
              key={`${card.id}_${idx}`}
              style={{
                transform: isSelected
                  ? 'translateY(-30px) scale(1.08)'
                  : `translateY(${translateY}px) rotate(${rotation}deg)`,
                zIndex: isSelected ? 30 : idx + 1,
              }}
              className="transition-transform duration-200 origin-bottom"
            >
              <CardView
                card={card}
                selected={isSelected}
                canAfford={canAfford}
                disabled={disabled}
                isUnstuffedOwner={isUnstuffedOwner}
                onClick={() => onSelectCard(idx)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
