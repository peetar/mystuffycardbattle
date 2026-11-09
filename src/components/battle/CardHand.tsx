'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, StuffyState } from '@/types/game';
import { CardView } from './CardView';

interface CardHandProps {
  cards: Card[];
  selectedCardIndex: number | null;
  onSelectCard: (index: number) => void;
  currentCrackers: number;
  disabled?: boolean;
  activeTeam?: StuffyState[];
  isTestMode?: boolean;
}

export const CardHand: React.FC<CardHandProps> = ({
  cards,
  selectedCardIndex,
  onSelectCard,
  currentCrackers,
  disabled = false,
  activeTeam = [],
  isTestMode = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // When holding 5 or more cards, use compact mode so cards fit comfortably
  const isCompact = cards.length >= 5;

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, cards.length]);

  // Auto-scroll selected card into view
  useEffect(() => {
    if (selectedCardIndex !== null && scrollContainerRef.current) {
      const cardNodes = scrollContainerRef.current.querySelectorAll('.hand-card-item');
      const target = cardNodes[selectedCardIndex] as HTMLElement;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedCardIndex]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = 220;
    el.scrollBy({ left: direction === 'left' ? -distance : distance, behavior: 'smooth' });
  };

  const handleWheel = (e: React.WheelEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
      el.scrollLeft += e.deltaY;
    }
  };

  const isOverflowing = canScrollLeft || canScrollRight;

  return (
    <div className="relative flex items-center justify-center w-full select-none overflow-hidden h-[245px] max-h-[245px] py-1">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            scroll('left');
          }}
          className="absolute left-0.5 z-40 flex items-center justify-center w-7 h-12 bg-slate-900/90 hover:bg-amber-600 text-yellow-300 hover:text-white rounded-r-xl border border-l-0 border-amber-500/80 shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer font-bold text-xs backdrop-blur-sm"
          title="Scroll hand left"
          aria-label="Scroll hand left"
        >
          ◀
        </button>
      )}

      {/* Left Edge Shadow Gradient when scrollable */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-slate-950/80 to-transparent pointer-events-none z-20" />
      )}

      {/* Single-Row Horizontal Scroll Track for Hand Cards (Locked height, no vertical wrap) */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex flex-nowrap items-center overflow-x-auto overflow-y-hidden w-full h-full py-1 px-3 scrollbar-thin scrollbar-thumb-slate-700/80 hover:scrollbar-thumb-amber-500/80 scrollbar-track-slate-900/40 scroll-smooth"
      >
        <div
          className={`flex flex-nowrap items-center gap-1.5 sm:gap-2 transition-all ${
            isOverflowing ? 'justify-start' : 'justify-center mx-auto'
          }`}
        >
          {cards.map((card, idx) => {
            const isSelected = selectedCardIndex === idx;
            const canAfford = isTestMode || currentCrackers >= card.cost;

            // Check if card's owner stuffy is unstuffed
            const owner = activeTeam.find((s) => s.speciesId === card.stuffyId);
            const isUnstuffedOwner = Boolean(owner && (owner.isUnstuffed || owner.currentHp <= 0));

            return (
              <div
                key={`${card.id}_${idx}`}
                className={`hand-card-item shrink-0 transition-all duration-150 ${
                  isSelected ? 'z-30 scale-105' : 'z-10'
                }`}
              >
                <CardView
                  card={card}
                  selected={isSelected}
                  canAfford={canAfford}
                  disabled={disabled}
                  isUnstuffedOwner={isUnstuffedOwner}
                  compact={isCompact}
                  isTestMode={isTestMode}
                  onClick={() => onSelectCard(idx)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Edge Shadow Gradient when scrollable */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-950/80 to-transparent pointer-events-none z-20" />
      )}

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            scroll('right');
          }}
          className="absolute right-0.5 z-40 flex items-center justify-center w-7 h-12 bg-slate-900/90 hover:bg-amber-600 text-yellow-300 hover:text-white rounded-l-xl border border-r-0 border-amber-500/80 shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer font-bold text-xs backdrop-blur-sm"
          title="Scroll hand right"
          aria-label="Scroll hand right"
        >
          ▶
        </button>
      )}
    </div>
  );
};
