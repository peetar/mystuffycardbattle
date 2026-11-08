'use client';

import React, { useState } from 'react';
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
    if (card.target === 'around_ally' || card.aoeType === 'around') {
      return { icon: '💖🎯', label: `AROUND HEAL ${card.heal}`, badgeClass: 'bg-pink-950/90 text-pink-300 border-pink-500/80' };
    }
    if (card.target === 'all_allies' || card.aoeType === 'spread') {
      return { icon: '💖✨', label: `SPREAD HEAL ${card.heal}`, badgeClass: 'bg-pink-950/90 text-pink-300 border-pink-500/80' };
    }
    return { icon: '💖✨', label: `HEAL +${card.heal}`, badgeClass: 'bg-pink-950/90 text-pink-300 border-pink-500/80' };
  }
  if (card.block && card.block > 0 && !card.damage) {
    if (card.target === 'all_allies' || card.aoeType === 'spread') {
      return { icon: '🛡️✨', label: `SPREAD SHIELD +${card.block}`, badgeClass: 'bg-sky-950/90 text-sky-300 border-sky-500/80' };
    }
    if (card.target === 'around_ally' || card.aoeType === 'around') {
      return { icon: '🛡️🎯', label: `AROUND SHIELD +${card.block}`, badgeClass: 'bg-sky-950/90 text-sky-300 border-sky-500/80' };
    }
    return { icon: '🛡️✨', label: `SHIELD +${card.block}`, badgeClass: 'bg-sky-950/90 text-sky-300 border-sky-500/80' };
  }
  if (card.damage && card.damage > 0) {
    if (card.target === 'around_enemy' || card.aoeType === 'around') {
      return { icon: '💥🎯', label: `AROUND ${card.damage}`, badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-500/80' };
    }
    if (card.target === 'all_enemies' || card.aoeType === 'spread') {
      return { icon: '🌪️⚔️', label: `SPREAD ${card.damage}`, badgeClass: 'bg-orange-950/90 text-orange-300 border-orange-500/80' };
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

function getTargetLabel(target: string, aoeType?: string): string {
  if (target === 'around_enemy' || aoeType === 'around') {
    return 'Around Enemy (Splits damage among target & neighbors)';
  }
  if (target === 'all_enemies' || aoeType === 'spread') {
    return 'Spread AoE (Splits damage evenly across all living foes)';
  }
  if (target === 'around_ally') {
    return 'Around Ally (Splits heal/shield across ally & neighbors)';
  }
  if (target === 'all_allies') {
    return 'All Allies (Team-wide)';
  }
  if (target === 'single_ally') {
    return 'Single Ally';
  }
  if (target === 'self') {
    return 'Self Only';
  }
  return target.replace(/_/g, ' ');
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
  const [isHovered, setIsHovered] = useState(false);
  const [showInspector, setShowInspector] = useState(false);

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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative select-none rounded-2xl p-2 md:p-2.5 transition-all duration-150 border-2 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col justify-between ${cardBorder} ${tierStyle.glow} ${
        compact
          ? 'w-28 sm:w-32 md:w-36 lg:w-40 min-h-[198px] md:min-h-[218px] text-[10px] md:text-xs'
          : 'w-32 sm:w-36 md:w-42 lg:w-46 min-h-[220px] md:min-h-[240px] text-xs'
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

      {/* Top Header: Cost (Crackers / Free) & Tier Badge & Info Inspector Button */}
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

        {/* Tier Ribbon, Upgraded Badge & Info Tooltip Trigger */}
        <div className="flex items-center gap-1">
          {card.upgraded && (
            <span className="px-1.5 py-0.5 rounded text-[8px] font-pixel font-bold bg-emerald-900 border border-emerald-400 text-emerald-300 shadow animate-pulse">
              ✨+
            </span>
          )}
          <div className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] font-pixel font-bold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
            {card.tier}-Tier
          </div>

          {/* Quick Inspector Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowInspector((prev) => !prev);
            }}
            className="w-5 h-5 rounded-full bg-slate-800 hover:bg-yellow-400 hover:text-slate-950 text-slate-300 text-[10px] font-bold flex items-center justify-center border border-slate-600 transition-all cursor-pointer shadow hover:scale-110"
            title="Click to view full card details & mechanics"
          >
            ℹ️
          </button>
        </div>
      </div>

      {/* Card Title & Owner Banner (Zero text cut-off with 2-line flex wrapping) */}
      <div className="my-1 text-center">
        <h4
          className="font-pixel text-[10.5px] md:text-[11.5px] font-bold tracking-tight text-yellow-300 leading-tight min-h-[26px] md:min-h-[30px] flex items-center justify-center line-clamp-2 px-0.5"
          title={card.name}
        >
          {card.name}
        </h4>
        <div className="text-[8px] md:text-[9px] font-mono text-slate-400 truncate mt-0.5">
          {card.isPlayerCard ? '⚡ Player Power-Up' : `🐾 ${owner?.name || 'Stuffy'}`}
        </div>
      </div>

      {/* Action Identification Banner */}
      <div className={`font-pixel text-[8px] md:text-[9px] font-bold px-1.5 py-0.5 rounded border text-center shadow truncate ${actionInfo.badgeClass}`}>
        {actionInfo.label}
      </div>

      {/* Card Artwork / Icon Box */}
      <div className={`w-full ${compact ? 'h-7 sm:h-8' : 'h-8 sm:h-9 md:h-10'} bg-slate-800/80 rounded border border-slate-700 flex items-center justify-center p-0.5 overflow-hidden my-0.5`}>
        <span className="text-xl sm:text-2xl drop-shadow filter">
          {actionInfo.icon}
        </span>
      </div>

      {/* Card Effect Description (Scrollable with clear reading padding) */}
      <div
        className="text-[9.5px] md:text-[10.5px] font-sans text-slate-200 leading-snug my-1 min-h-[46px] max-h-[68px] overflow-y-auto pr-1 break-words scrollbar-thin scrollbar-thumb-amber-500/40"
        title="Hover card or click ℹ️ for full unabridged details"
      >
        {card.description}
      </div>

      {/* Bottom Summary Tags */}
      <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[8px] md:text-[9px] text-slate-300 font-mono gap-1">
        <span className="truncate max-w-[70px] md:max-w-[85px]">{card.target.replace(/_/g, ' ')}</span>
        <div className="flex items-center gap-1 shrink-0">
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

      {/* HOVER TOOLTIP & FULL CARD INSPECTOR POPOVER (Solutions #3 & #4) */}
      {(isHovered || showInspector) && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 bg-slate-950/98 border-2 border-yellow-400 rounded-2xl p-3.5 shadow-2xl z-50 pointer-events-auto backdrop-blur-md animate-fadeIn text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-700/80 pb-2 mb-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-pixel text-xs md:text-sm text-yellow-300 font-bold leading-tight">
                  {card.name}
                </h3>
                {card.upgraded && (
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-pixel bg-emerald-900 border border-emerald-400 text-emerald-300 font-bold shadow">
                    ✨+ UPGRADED
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {card.isPlayerCard ? '⚡ Player Power-Up' : `🐾 ${owner?.name || 'Stuffy'} (${owner?.species || 'Hero Plush'})`}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <div className={`px-2 py-0.5 rounded text-[10px] font-pixel font-bold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                {card.tier}-Tier
              </div>
              {showInspector && (
                <button
                  type="button"
                  onClick={() => setShowInspector(false)}
                  className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer ml-1"
                  title="Close inspector"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Badge & Cost Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className={`font-pixel text-[9px] font-bold px-2 py-0.5 rounded border text-center shadow ${actionInfo.badgeClass}`}>
              {actionInfo.icon} {actionInfo.label}
            </div>
            <div className="font-pixel text-[9px] text-amber-300 bg-amber-950/80 border border-amber-600/60 px-2 py-0.5 rounded shadow">
              🍪 {isTestMode ? 'FREE' : `${card.cost} Crackers`}
            </div>
          </div>

          {/* Full Uncut Description */}
          <div className="bg-slate-900/90 border border-slate-700/90 rounded-xl p-2.5 text-xs font-sans text-slate-100 leading-relaxed mb-2.5 whitespace-normal break-words shadow-inner">
            <span className="font-bold text-yellow-300/90 block mb-0.5 text-[10px] font-pixel uppercase tracking-wide">
              Card Ability:
            </span>
            {card.description}
          </div>

          {/* Detailed Mechanics Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-black/70 p-2 rounded-xl border border-slate-800">
            <div className="col-span-2 text-slate-300">
              <span className="text-slate-400">Targeting:</span> <strong className="text-white">{getTargetLabel(card.target, card.aoeType)}</strong>
            </div>
            {card.damage && (
              <div className="text-red-400 font-bold flex items-center gap-1">
                <span>💥 Damage:</span> <span>{card.damage}</span>
              </div>
            )}
            {card.block && (
              <div className="text-blue-400 font-bold flex items-center gap-1">
                <span>🛡️ Shield:</span> <span>+{card.block}</span>
              </div>
            )}
            {card.heal && (
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <span>💖 Heal:</span> <span>+{card.heal}</span>
              </div>
            )}
            {card.poison && (
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <span>🧪 Poison:</span> <span>+{card.poison}</span>
              </div>
            )}
            {card.canRevive && (
              <div className="text-pink-400 font-bold col-span-2">
                🪡 Restitch: Revives an unstuffed plush ally!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
