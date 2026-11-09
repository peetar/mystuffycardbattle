'use client';

import React, { useState, useRef } from 'react';
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const [showInspector, setShowInspector] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPos({
        top: Math.max(10, rect.top - 120),
        left: Math.max(135, Math.min(window.innerWidth - 135, rect.left + rect.width / 2)),
      });
    }
  };

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
      ref={cardRef}
      onClick={!disabled && onClick ? onClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative select-none rounded-2xl p-2 md:p-2.5 transition-all duration-150 border-2 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white flex flex-col justify-between shadow-xl ${cardBorder} ${tierStyle.glow} ${
        compact
          ? 'w-28 sm:w-30 md:w-34 lg:w-36 min-h-[195px] md:min-h-[215px] text-[10px] md:text-xs'
          : 'w-32 sm:w-36 md:w-42 lg:w-46 min-h-[220px] md:min-h-[240px] text-xs'
      } ${!disabled && onClick ? 'cursor-pointer hover:-translate-y-1' : 'cursor-not-allowed'}`}
    >
      {/* Unstuffed Owner Warning Overlay */}
      {isUnstuffedOwner && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center p-2 z-20 pointer-events-none border border-red-500/70">
          <span className="text-2xl animate-pulse">🗑️</span>
          <span className="font-pixel text-[9px] text-red-300 font-bold mt-1 text-center">
            STUFFY UNSTUFFED
          </span>
          <span className="font-pixel text-[7px] text-amber-300 text-center animate-pulse">
            Click to Auto-Discard &amp; Redraw
          </span>
        </div>
      )}

      {/* Modern Minimalist Deckbuilder Header (Balatro & STS Inspired) */}
      <div className="flex items-center justify-between gap-1 w-full">
        {/* Giant Circular Cracker Energy Chip */}
        <div
          className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center font-pixel font-black text-[10px] md:text-xs shadow-md border-2 shrink-0 ${
            isTestMode
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-200 text-slate-950'
              : 'bg-gradient-to-br from-amber-400 to-amber-600 border-yellow-200 text-slate-950'
          }`}
          title={isTestMode ? 'Free card in Test Mode!' : `${card.cost} Crackers`}
        >
          {isTestMode ? '0' : card.cost}
        </div>

        {/* Minimalist Card Title */}
        <h4
          className="flex-1 font-pixel text-[10px] md:text-[11px] font-bold text-center text-yellow-300 truncate px-1"
          title={card.name}
        >
          {card.name}
        </h4>

        {/* Tier Pip Ribbon & Upgraded Badge */}
        <div className="flex items-center gap-0.5 shrink-0">
          {card.upgraded && (
            <span className="px-1 py-0.2 rounded text-[7px] font-pixel font-bold bg-emerald-900 border border-emerald-400 text-emerald-300 shadow animate-pulse">
              +
            </span>
          )}
          <div className={`px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-pixel font-black border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
            {card.tier}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowInspector((prev) => !prev);
            }}
            className="w-4 h-4 rounded-full bg-slate-800 hover:bg-yellow-400 hover:text-slate-950 text-slate-400 text-[9px] font-bold flex items-center justify-center border border-slate-700 transition-all cursor-pointer ml-0.5"
            title="Inspect full details"
          >
            ℹ️
          </button>
        </div>
      </div>

      {/* Central Artwork Window with Radial Spotlight */}
      <div className={`w-full ${compact ? 'h-10 sm:h-12' : 'h-12 sm:h-14 md:h-16'} rounded-xl border border-slate-800/80 bg-slate-950 relative overflow-hidden flex items-center justify-center my-1 shadow-inner`}>
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-slate-900/40 to-transparent pointer-events-none" />
        <span className="text-2xl sm:text-3xl drop-shadow-md z-10 filter">
          {actionInfo.icon}
        </span>
        <div className="absolute bottom-0.5 right-1.5 text-[8px] font-mono text-slate-500">
          {card.isPlayerCard ? 'Player' : owner?.name || 'Stuffy'}
        </div>
      </div>

      {/* Primary Bold Stat Chips (Slay the Spire / Balatro style) */}
      <div className="flex items-center justify-center gap-1 flex-wrap my-0.5">
        {Boolean(card.damage && card.damage > 0) && (
          <div className="px-1.5 py-0.5 rounded-full bg-red-950/90 border border-red-500/80 text-red-200 font-pixel font-bold text-[8.5px] md:text-[9.5px] shadow flex items-center gap-0.5">
            <span>⚔️</span>
            <span>{card.damage}</span>
          </div>
        )}
        {Boolean(card.block && card.block > 0) && (
          <div className="px-1.5 py-0.5 rounded-full bg-sky-950/90 border border-sky-400/80 text-sky-200 font-pixel font-bold text-[8.5px] md:text-[9.5px] shadow flex items-center gap-0.5">
            <span>🛡️</span>
            <span>{card.block}</span>
          </div>
        )}
        {Boolean(card.heal && card.heal > 0) && (
          <div className="px-1.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400/80 text-emerald-200 font-pixel font-bold text-[8.5px] md:text-[9.5px] shadow flex items-center gap-0.5">
            <span>💖</span>
            <span>{card.heal}</span>
          </div>
        )}
        {Boolean(card.poison && card.poison > 0) && (
          <div className="px-1.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 font-pixel font-bold text-[8px] shadow flex items-center gap-0.5">
            <span>🧪</span>
            <span>P{card.poison}</span>
          </div>
        )}
      </div>

      {/* Minimalist Card Description */}
      <div
        className="text-[9px] md:text-[10px] font-sans text-slate-300 leading-tight my-0.5 min-h-[38px] max-h-[58px] overflow-y-auto px-1 break-words scrollbar-thin scrollbar-thumb-amber-500/30"
        title={card.description}
      >
        {card.description}
      </div>

      {/* Target & Type Bottom Footer */}
      <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[8px] font-mono text-slate-400">
        <span className="truncate max-w-[80px]">{card.target.replace(/_/g, ' ')}</span>
        <span className="uppercase text-amber-400/80 font-bold">{card.type}</span>
      </div>

      {/* SUBTLE HOVER PREVIEW (Fixed positioning so it floats above without being clipped by overflow containers) */}
      {isHovered && !showInspector && tooltipPos && (
        <div
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
          className="fixed -translate-x-1/2 w-64 max-w-[90vw] bg-slate-950/95 border border-yellow-400/80 rounded-xl p-2.5 shadow-2xl z-50 pointer-events-none backdrop-blur-md text-left animate-fadeIn"
        >
          <div className="flex items-center justify-between gap-1 mb-1 border-b border-slate-800 pb-1">
            <span className="font-pixel text-[10px] text-yellow-300 font-bold truncate">{card.name}</span>
            <span className="font-mono text-[9px] text-amber-300">🍪{isTestMode ? 'FREE' : card.cost}</span>
          </div>
          <p className="text-[10px] font-sans text-slate-200 leading-snug line-clamp-3">{card.description}</p>
          <div className="mt-1.5 flex items-center justify-between text-[8px] font-mono text-slate-400">
            <span>{getTargetLabel(card.target, card.aoeType)}</span>
            <span className="text-yellow-400">Click ℹ️ for full specs</span>
          </div>
        </div>
      )}

      {/* FULL CARD INSPECTOR MODAL (Triggered intentionally by clicking ℹ️) */}
      {showInspector && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-default animate-fadeIn"
          onClick={(e) => {
            e.stopPropagation();
            setShowInspector(false);
          }}
        >
          <div
            className="w-full max-w-sm bg-slate-950 border-2 border-yellow-400 rounded-2xl p-4 shadow-2xl z-50 pointer-events-auto text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-700/80 pb-2 mb-2.5">
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
                <button
                  type="button"
                  onClick={() => setShowInspector(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-600 cursor-pointer ml-1"
                  title="Close inspector"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Action Badge & Cost Row */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
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
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-black/70 p-2.5 rounded-xl border border-slate-800 mb-3">
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

            <button
              type="button"
              onClick={() => setShowInspector(false)}
              className="w-full font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl border border-slate-600 cursor-pointer text-center"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
