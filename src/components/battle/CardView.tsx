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
  isTestMode?: boolean;
}

export const TIER_COLORS: Record<CardTier, { bg: string; text: string; border: string; glow: string }> = {
  F: { bg: 'bg-stone-700', text: 'text-stone-300', border: 'border-stone-500', glow: 'shadow-stone-700/50' },
  D: { bg: 'bg-emerald-800', text: 'text-emerald-200', border: 'border-emerald-500', glow: 'shadow-emerald-700/50' },
  C: { bg: 'bg-sky-800', text: 'text-sky-200', border: 'border-sky-500', glow: 'shadow-sky-700/50' },
  B: { bg: 'bg-purple-800', text: 'text-purple-200', border: 'border-purple-400', glow: 'shadow-purple-700/50' },
  A: { bg: 'bg-rose-800', text: 'text-rose-200', border: 'border-rose-400', glow: 'shadow-rose-700/50' },
  S: { bg: 'bg-gradient-to-r from-amber-600 to-yellow-500', text: 'text-yellow-100 font-extrabold', border: 'border-yellow-300', glow: 'shadow-yellow-500/80 animate-pulse' },
};

export function getCardActionInfo(card: Card): { icon: string; label: string; badgeClass: string } {
  if (card.brainDamage) {
    return { icon: '🧠💫', label: 'BRAIN SHOCK', badgeClass: 'bg-purple-950/90 text-purple-300 border-purple-500/80' };
  }
  if (card.poison) {
    return { icon: '🧪☠️', label: `POISON ${card.poison}`, badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80' };
  }
  if (card.canRevive || card.type === 'restitch') {
    return { icon: '🪡❤️‍🩹', label: 'RESTITCH REVIVE', badgeClass: 'bg-rose-950/90 text-rose-300 border-rose-500/80' };
  }
  if (card.specialActionId === 'strokenosis') {
    return { icon: '🌀👁️', label: 'MIND HYPNOSIS', badgeClass: 'bg-indigo-950/90 text-indigo-300 border-indigo-500/80' };
  }
  if (card.specialActionId === 'spot_double_all_buffs') {
    return { icon: '🎪✨', label: '2X SQUAD BUFF', badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-500/80' };
  }
  if (card.heal && card.heal > 0) {
    return { icon: '💖✨', label: `HEAL +${card.heal}`, badgeClass: 'bg-pink-950/90 text-pink-300 border-pink-500/80' };
  }
  if (card.block && card.block > 0 && !card.damage) {
    return { icon: '🛡️✨', label: `SHIELD +${card.block}`, badgeClass: 'bg-sky-950/90 text-sky-300 border-sky-500/80' };
  }
  if (card.damage && card.damage > 0) {
    if (card.target === 'all_enemies') {
      return { icon: '🌪️⚔️', label: `ALL FOES ${card.damage}`, badgeClass: 'bg-orange-950/90 text-orange-300 border-orange-500/80' };
    }
    return { icon: '⚔️💥', label: `STRIKE ${card.damage}`, badgeClass: 'bg-red-950/90 text-red-300 border-red-500/80' };
  }
  if (card.type === 'debuff') {
    return { icon: '💫🕸️', label: 'STATUS DISRUPT', badgeClass: 'bg-yellow-950/90 text-yellow-300 border-yellow-500/80' };
  }
  if (card.type === 'utility') {
    return { icon: '🍪⚡', label: 'ENERGY / BUFF', badgeClass: 'bg-cyan-950/90 text-cyan-300 border-cyan-500/80' };
  }
  return { icon: '🌟✨', label: 'SPECIAL POWER', badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-500/80' };
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  onClick,
  selected = false,
  canAfford = true,
  disabled = false,
  isUnstuffedOwner = false,
  compact = false,
  isTestMode = false,
}) => {
  const tierStyle = TIER_COLORS[card.tier] || TIER_COLORS.C;
  const owner = card.stuffyId ? STUFFY_MAP.get(card.stuffyId) : undefined;
  const actionInfo = getCardActionInfo(card);

  const isDisabledOrBlocked = disabled || (!canAfford && !isUnstuffedOwner);

  const cardBorder = selected
    ? 'border-yellow-400 ring-4 ring-yellow-400/80 scale-[1.03] shadow-2xl'
    : isUnstuffedOwner
    ? 'border-red-600/80 ring-2 ring-red-500/50 hover:scale-[1.02]'
    : isDisabledOrBlocked
    ? 'border-slate-700 opacity-60'
    : `${tierStyle.border} hover:scale-[1.02] hover:shadow-lg`;

  return (
    <div
      onClick={!disabled && onClick ? onClick : undefined}
      className={`relative select-none rounded-xl p-2 transition-all duration-150 border-2 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col justify-between ${cardBorder} ${tierStyle.glow} ${
        compact ? 'w-26 sm:w-28 md:w-30 min-h-[174px] text-[10px]' : 'w-28 sm:w-32 md:w-34 min-h-[190px] text-xs'
      } ${!disabled && onClick ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      {/* Unstuffed Owner Warning Overlay */}
      {isUnstuffedOwner && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center p-2 z-20 pointer-events-none border border-red-500/70">
          <span className="text-2xl animate-pulse">🗑️</span>
          <span className="font-pixel text-[9px] text-red-300 font-bold mt-1 text-center">
            STUFFY UNSTUFFED
          </span>
          <span className="font-pixel text-[7px] text-amber-300 text-center animate-pulse">
            Click to Auto-Discard &amp; Redraw
          </span>
        </div>
      )}
      {/* Top Header: Cost (Crackers / Free) & Tier Badge */}
      <div className="flex items-center justify-between gap-1 w-full">
        {/* Cracker Cost Badge */}
        <div
          className={`flex items-center gap-0.5 font-pixel font-bold text-[10px] px-1.5 py-0.5 rounded shadow ${
            isTestMode
              ? 'bg-emerald-950/90 border border-emerald-500/80 text-emerald-300'
              : 'bg-amber-950/90 border border-amber-500/60 text-amber-300'
          }`}
          title={isTestMode ? 'Free card in Test Mode!' : `${card.cost} Crackers`}
        >
          <span>{isTestMode ? '🧪' : '🍪'}</span>
          <span>{isTestMode ? 'FREE' : card.cost}</span>
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
      <div className="my-0.5 text-center">
        <h4 className="font-pixel text-[11px] font-bold tracking-tight text-yellow-300 truncate" title={card.name}>
          {card.name}
        </h4>
        <div className="text-[8px] font-mono text-slate-400 truncate">
          {card.isPlayerCard ? '⚡ Player Power-Up' : `🐾 ${owner?.name || 'Stuffy'}`}
        </div>
      </div>

      {/* Action Identification Banner */}
      <div className={`font-pixel text-[8px] font-bold px-1.5 py-0.5 rounded border text-center shadow truncate ${actionInfo.badgeClass}`}>
        {actionInfo.label}
      </div>

      {/* Card Artwork / Icon Box */}
      <div className={`w-full ${compact ? 'h-8' : 'h-10'} bg-slate-800/80 rounded border border-slate-700 flex items-center justify-center p-0.5 overflow-hidden my-0.5`}>
        <span className="text-2xl drop-shadow filter">
          {actionInfo.icon}
        </span>
      </div>

      {/* Card Effect Description */}
      <div
        className="text-[9px] font-sans text-slate-200 leading-snug my-0.5 min-h-[38px] max-h-[52px] overflow-y-auto no-scrollbar break-words"
        title={card.description}
      >
        {card.description}
      </div>

      {/* Bottom Summary Tags */}
      <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[8px] text-slate-400 font-mono">
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
