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
  compact = false,
}) => {
  const tierStyle = TIER_COLORS[card.tier] || TIER_COLORS.C;
  const owner = card.stuffyId ? STUFFY_MAP.get(card.stuffyId) : undefined;

  const cardBorder = selected
    ? 'border-yellow-400 ring-4 ring-yellow-400/80 -translate-y-4'
    : disabled || !canAfford
    ? 'border-slate-700 opacity-60'
    : `${tierStyle.border} hover:-translate-y-2 hover:shadow-lg`;

  return (
    <div
      onClick={!disabled && canAfford ? onClick : undefined}
      className={`relative select-none rounded-lg p-2 transition-all duration-200 border-2 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col justify-between ${cardBorder} ${tierStyle.glow} ${
        compact ? 'w-36 h-48 text-xs' : 'w-44 h-60 text-sm'
      } ${!disabled && canAfford && onClick ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      {/* Top Header: Cost (Crackers) & Tier Badge */}
      <div className="flex items-center justify-between gap-1 w-full">
        {/* Cracker Cost Badge */}
        <div className="flex items-center gap-0.5 bg-amber-950/90 border border-amber-500/60 text-amber-300 font-pixel font-bold text-[10px] px-1.5 py-0.5 rounded shadow">
          <span>🍪</span>
          <span>{card.cost}</span>
        </div>

        {/* Tier Ribbon */}
        <div className={`px-2 py-0.5 rounded text-[10px] font-pixel font-bold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
          {card.tier}-Tier
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
      <div className="w-full flex-1 max-h-20 bg-slate-800/80 rounded border border-slate-700 flex items-center justify-center p-1 overflow-hidden">
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
      <div className="mt-1 text-[10px] font-sans text-slate-200 leading-tight h-12 overflow-y-auto no-scrollbar">
        {card.description}
      </div>

      {/* Bottom Summary Tags */}
      <div className="mt-1 pt-1 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400 font-mono">
        <span>{card.target.replace('_', ' ')}</span>
        {card.damage && <span className="text-red-400 font-bold">💥{card.damage}</span>}
        {card.block && <span className="text-blue-400 font-bold">🛡️{card.block}</span>}
        {card.heal && <span className="text-emerald-400 font-bold">💖{card.heal}</span>}
      </div>
    </div>
  );
};
