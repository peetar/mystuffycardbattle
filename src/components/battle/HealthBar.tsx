'use client';

import React from 'react';
import { StuffyState } from '@/types/game';

interface HealthBarProps {
  stuffy: StuffyState;
}

export const HealthBar: React.FC<HealthBarProps> = ({ stuffy }) => {
  const hpPercent = Math.max(0, Math.min(100, (stuffy.currentHp / stuffy.maxHp) * 100));

  let hpColor = 'bg-emerald-500';
  if (hpPercent < 25) {
    hpColor = 'bg-red-500 animate-pulse';
  } else if (hpPercent < 50) {
    hpColor = 'bg-amber-500';
  }

  return (
    <div className="w-24 md:w-28 flex flex-col items-center gap-0.5 select-none">
      {/* Stuffy Name & Exact HP / Shield Header */}
      <div className="flex items-center justify-between w-full px-0.5 text-[9px] md:text-[10px] font-pixel text-slate-200">
        <span className="truncate max-w-[55px] font-bold" title={stuffy.name}>
          {stuffy.name}
        </span>
        <div className="flex items-center gap-1 font-mono">
          <span className={`font-bold text-[9px] ${stuffy.isUnstuffed ? 'text-rose-400' : 'text-emerald-300'}`}>
            {stuffy.isUnstuffed ? 'DOWN' : `${stuffy.currentHp}/${stuffy.maxHp}`}
          </span>
          {stuffy.shield > 0 && (
            <span className="flex items-center text-blue-300 font-bold bg-blue-950/90 px-1 rounded text-[8px] border border-blue-500/50">
              🛡️{stuffy.shield}
            </span>
          )}
        </div>
      </div>

      {/* HP Bar Container */}
      <div className="w-full h-3.5 bg-slate-950 border-2 border-slate-700 rounded-sm relative overflow-hidden shadow-inner">
        <div
          className={`h-full ${hpColor} transition-all duration-300`}
          style={{ width: `${hpPercent}%` }}
        />
        {/* HP Text */}
        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-pixel text-white font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          {stuffy.isUnstuffed ? (
            <span className="text-red-400 animate-pulse font-bold">UNSTUFFED</span>
          ) : (
            `${Math.round(hpPercent)}%`
          )}
        </div>
      </div>

      {/* Status Icons Row */}
      {stuffy.statusEffects.length > 0 && (
        <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
          {stuffy.statusEffects.map((status, idx) => (
            <span
              key={idx}
              className="text-[9px] px-0.5 rounded bg-black/60 border border-slate-700 text-white"
              title={`${status.type}: ${status.duration ?? 'persistent'} turns`}
            >
              {status.type === 'poison' && `☠️${status.value || 1}`}
              {status.type === 'brain_damaged' && '💫'}
              {status.type === 'earthquake_crack' && '⚡Cracked'}
              {status.type === 'energy' && `⚡+${status.value || 3} Energy`}
              {status.type === 'taunt' && '🛡️Taunt'}
              {status.type === 'damage_reduction' && '🛡️-75%'}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
