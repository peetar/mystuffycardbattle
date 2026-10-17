'use client';

import React from 'react';

interface CrackersMeterProps {
  currentCrackers: number;
  maxCrackers?: number;
  onEndTurn: () => void;
  isPlayerTurn: boolean;
  disabled?: boolean;
}

export const CrackersMeter: React.FC<CrackersMeterProps> = ({
  currentCrackers,
  maxCrackers = 7,
  onEndTurn,
  isPlayerTurn,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-3 bg-slate-900/90 border-2 border-amber-500/80 px-4 py-2 rounded-xl shadow-xl backdrop-blur select-none">
      {/* Cracker Icons Display */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">🍪</span>
          <span className="font-pixel text-xs text-amber-300 font-bold">CRACKERS</span>
          <span className="font-pixel text-sm text-yellow-400 font-bold ml-1">
            {currentCrackers}/{maxCrackers}
          </span>
        </div>

        {/* Visual Cracker Dots */}
        <div className="flex gap-1 mt-1">
          {Array.from({ length: maxCrackers }).map((_, i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 border ${
                i < currentCrackers
                  ? 'bg-amber-400 border-amber-300 shadow-sm shadow-amber-500/50 scale-105'
                  : 'bg-slate-800 border-slate-700 opacity-40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* End Turn Button */}
      <button
        onClick={onEndTurn}
        disabled={disabled || !isPlayerTurn}
        className={`px-4 py-2.5 rounded-lg font-pixel text-xs font-bold border-2 transition-all duration-150 ${
          isPlayerTurn && !disabled
            ? 'bg-red-600 hover:bg-red-500 active:scale-95 text-white border-red-400 shadow-lg shadow-red-700/50 cursor-pointer animate-pulse'
            : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
        }`}
      >
        END TURN ⏭️
      </button>
    </div>
  );
};
