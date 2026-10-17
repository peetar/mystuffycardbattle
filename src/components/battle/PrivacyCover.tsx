'use client';

import React from 'react';

interface PrivacyCoverProps {
  nextPlayerName: string;
  onReady: () => void;
}

export const PrivacyCover: React.FC<PrivacyCoverProps> = ({
  nextPlayerName,
  onReady,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
      {/* Retro Lock Icon */}
      <div className="w-24 h-24 mb-6 rounded-full bg-slate-900 border-4 border-amber-500 flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/30 animate-pulse">
        🔒
      </div>

      <h2 className="font-pixel text-2xl md:text-3xl text-amber-400 mb-4 tracking-wider">
        TURN COMPLETE!
      </h2>

      <p className="font-pixel text-sm md:text-base text-slate-300 max-w-md mb-8 leading-relaxed">
        Pass the device to <span className="text-yellow-300 font-bold underline">{nextPlayerName}</span>.
        <br />
        <span className="text-xs text-slate-400 mt-2 block">
          No peeking at each other&apos;s cards!
        </span>
      </p>

      <button
        onClick={onReady}
        className="font-pixel text-sm md:text-base bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-8 py-4 rounded-xl border-4 border-emerald-400 shadow-xl shadow-emerald-700/50 transition-all cursor-pointer"
      >
        I AM {nextPlayerName.toUpperCase()} - REVEAL HAND 🎮
      </button>
    </div>
  );
};
