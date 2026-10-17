'use client';

import React from 'react';
import { Card, CardTier } from '@/types/game';
import { STUFFY_MAP } from '@/data/stuffies';

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  canAfford?: boolean;
  disabled?: boolean;
  isUnstuffedOwner?: boolean;
  compact?: boolean;
}

export const TIER_COLORS: Record<CardTier, { bg: string; text: string; border: string; glow: string }> = {
  F: { bg: 'bg-stone-700', text: 'text-stone-300', border: 'border-stone-500', glow: 'shadow-stone-700/50' },
  D: { bg: 'bg-emerald-800', text: 'text-emerald-200', border: 'border-emerald-500', glow: 'shadow-emerald-700/50' },
  C: { bg: 'bg-sky-800', text: 'text-sky-200', border: 'border-sky-500', glow: 'shadow-sky-700/50' },
  B: { bg: 'bg-purple-800', text: 'text-purple-200', border: 'border-purple-400', glow: 'shadow-purple-700/50' },
  A: { bg: 'bg-rose-800', text: 'text-rose-200', border: 'border-rose-400', glow: 'shadow-rose-700/50' },
  S: { bg: 'bg-gradient-to-r from-amber-600 to-yellow-500', text: 'text-yellow-100 font-extrabold', border: 'border-yellow-300', glow: 'shadow-yellow-500/80 animate-pulse' },
};

export const CardView: React.FC<CardViewProps> = ({
  card,
  onClick,
  selected = false,
  canAfford = true,
  disabled = false,
  isUnstuffedOwner = false,
  compact = false,
}) => {
  const tierStyle = TIER_COLORS[card.tier] || TIER_COLORS.C;
  const owner = card.stuffyId ? STUFFY_MAP.get(card.stuffyId) : undefined;

  const isDisabledOrBlocked = disabled || (!canAfford && !isUnstuffedOwner);

  const cardBorder = selected
    ? 'border-yellow-400 ring-4 ring-yellow-400/80 -translate-y-4'
    : isUnstuffedOwner
    ? 'border-red-600/80 ring-2 ring-red-500/50 hover:-translate-y-2'
    : isDisabledOrBlocked
    ? 'border-slate-700 opacity-60'
    : `${tierStyle.border} hover:-translate-y-2 hover:shadow-lg`;

  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      className={`relative select-none rounded-lg p-2 transition-all duration-200 border-2 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col justify-between ${cardBorder} ${tierStyle.glow} ${
        compact ? 'w-36 h-52 text-xs' : 'w-44 h-64 text-sm'
      } ${!disabled && onClick ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      {/* Unstuffed Owner Warning Overlay */}
      {isUnstuffedOwner && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center p-2 z-20 pointer-events-none border border-red-500/70">
          <span className="text-2xl animate-pulse">🗑️</span>
          <span className="font-pixel text-[9px] text-red-300 font-bold mt-1 text-center">
            STUFFY UNSTUFFED
          </span>
          <span className="font-pixel text-[7px] text-amber-300 text-center animate-pulse">
            Click to Auto-Discard & Redraw
          </span>
        </div>
      )}
      {/* Top Header: Cost (Crackers) & Tier Badge */}
      <div className="flex items-center justify-between gap-1 w-full">
        {/* Cracker Cost Badge */}
        <div className="flex items-center gap-0.5 bg-amber-950/90 border border-amber-500/60 text-amber-300 font-pixel font-bold text-[10px] px-1.5 py-0.5 rounded shadow">
          <span>🍪</span>
          <span>{card.cost}</span>
        </div>

        {/* Tier Ribbon & Upgraded Badge */}
        <div className="flex items-center gap-1">
          {card.upgraded && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-pixel font-bold bg-emerald-900 border border-emerald-400 text-emerald-300 shadow animate-pulse">
              ✨+
            </span>
          )}
          <div className={`px-2 py-0.5 rounded text-[10px] font-pixel font-bold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
            {card.tier}-Tier
          </div>
        </div>
      </div>

      {/* Card Title & Owner Banner */}
      <div className="my-1 text-center">
        <h4 className="font-pixel text-[11px] font-bold tracking-tight text-yellow-300 truncate" title={card.name}>
          {card.name}
        </h4>
        <div className="text-[9px] font-mono text-slate-400 truncate">
          {card.isPlayerCard ? '⚡ Player Power-Up' : `🐾 ${owner?.name || 'Stuffy'}`}
        </div>
      </div>

      {/* Card Artwork / Icon Box */}
      <div className="w-full flex-1 max-h-16 bg-slate-800/80 rounded border border-slate-700 flex items-center justify-center p-1 overflow-hidden">
        <span className="text-2xl drop-shadow">
          {card.type === 'attack' && '⚔️'}
          {card.type === 'defense' && '🛡️'}
          {card.type === 'heal' && '💖'}
          {card.type === 'restitch' && '🪡'}
          {card.type === 'special' && '🌟'}
          {card.type === 'debuff' && '💫'}
          {card.type === 'utility' && '✨'}
        </span>
      </div>

      {/* Card Effect Description */}
      <div
        className="mt-1 text-[10px] font-sans text-slate-200 leading-snug min-h-[48px] max-h-[64px] overflow-y-auto no-scrollbar"
        title={card.description}
      >
        {card.description}
      </div>

      {/* Bottom Summary Tags */}
      <div className="mt-1 pt-1 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400 font-mono">
        <span>{card.target.replace('_', ' ')}</span>
        {card.damage && (
          <span className={card.upgraded ? 'text-emerald-400 font-extrabold' : 'text-red-400 font-bold'}>
            💥{card.damage}{card.upgraded && '✨'}
          </span>
        )}
        {card.block && (
          <span className={card.upgraded ? 'text-emerald-400 font-extrabold' : 'text-blue-400 font-bold'}>
            🛡️{card.block}{card.upgraded && '✨'}
          </span>
        )}
        {card.heal && (
          <span className={card.upgraded ? 'text-emerald-400 font-extrabold' : 'text-emerald-400 font-bold'}>
            💖{card.heal}{card.upgraded && '✨'}
          </span>
        )}
      </div>
    </div>
  );
};
