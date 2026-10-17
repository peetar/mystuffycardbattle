'use client';

import React, { useState, useEffect } from 'react';
import {
  loadPlayerStats,
  getMostLikedStuffy,
  getMostLikedCard,
  resetPlayerStats,
  PlayerStats,
} from '@/utils/playerStats';
import { ALL_STUFFIES } from '@/data/stuffies';
import { StuffySprite } from '@/components/battle/StuffySprite';

interface StatsModalProps {
  onClose: () => void;
}

export default function StatsModal({ onClose }: StatsModalProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    setStats(loadPlayerStats());
  }, []);

  if (!stats) return null;

  const topStuffy = getMostLikedStuffy();
  const topCard = getMostLikedCard();

  const favoriteSpecies = topStuffy
    ? ALL_STUFFIES.find((s) => s.id === topStuffy.id) || ALL_STUFFIES[0]
    : null;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all combat statistics?')) {
      resetPlayerStats();
      setStats(loadPlayerStats());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h2 className="font-pixel text-base md:text-lg text-yellow-400 font-bold tracking-wider">
              RECORD BOOK &amp; STATS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-600 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            CLOSE [✖️]
          </button>
        </div>

        {/* Favorite Stuffy Highlight Card */}
        <div className="bg-slate-950/80 border-2 border-amber-500/50 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-4">
            {favoriteSpecies ? (
              <div className="w-16 h-16 bg-slate-900 rounded-xl p-1 border border-amber-500/40 flex items-center justify-center">
                <StuffySprite
                  stuffy={{
                    instanceId: `fav_${favoriteSpecies.id}`,
                    speciesId: favoriteSpecies.id,
                    name: favoriteSpecies.name,
                    maxHp: favoriteSpecies.baseHp,
                    currentHp: favoriteSpecies.baseHp,
                    shield: 0,
                    isUnstuffed: false,
                    statusEffects: [],
                  }}
                  size={56}
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center text-3xl">
                🧸
              </div>
            )}
            <div className="text-left">
              <span className="font-pixel text-[9px] text-amber-400 tracking-wider uppercase block">
                ★ MOST LIKED STUFFY ★
              </span>
              <h3 className="font-pixel text-base text-white font-bold">
                {favoriteSpecies?.name || topStuffy?.name || 'No Battles Yet'}
              </h3>
              <p className="font-mono text-xs text-slate-400">
                Drafted {topStuffy?.count || 0} time(s) into combat
              </p>
            </div>
          </div>
          <span className="font-pixel text-2xl text-yellow-400">👑</span>
        </div>

        {/* Favorite Card Highlight Card */}
        <div className="bg-slate-950/80 border-2 border-indigo-500/50 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-950 rounded-xl border border-indigo-500/40 flex items-center justify-center text-2xl">
              🎴
            </div>
            <div className="text-left">
              <span className="font-pixel text-[9px] text-indigo-400 tracking-wider uppercase block">
                ★ MOST LIKED CARD ★
              </span>
              <h3 className="font-pixel text-sm text-yellow-300 font-bold">
                {topCard?.name || 'No Cards Played'}
              </h3>
              <p className="font-mono text-xs text-slate-400">
                Played {topCard?.count || 0} time(s) in battle
              </p>
            </div>
          </div>
          <span className="font-pixel text-xl text-indigo-300">⚡</span>
        </div>

        {/* 4 Core Stat Boxes */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Total Victories */}
          <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/40 flex flex-col items-center">
            <span className="text-2xl mb-1">🏆</span>
            <span className="font-pixel text-xl text-emerald-400 font-extrabold">
              {stats.wins}
            </span>
            <span className="font-pixel text-[9px] text-slate-400 uppercase mt-0.5">
              TOTAL VICTORIES
            </span>
          </div>

          {/* Total Deaths (Unstuffings) */}
          <div className="bg-slate-950 p-3 rounded-xl border border-red-500/40 flex flex-col items-center">
            <span className="text-2xl mb-1">💀</span>
            <span className="font-pixel text-xl text-red-400 font-extrabold">
              {stats.deaths}
            </span>
            <span className="font-pixel text-[9px] text-slate-400 uppercase mt-0.5">
              STUFFY DEATHS
            </span>
          </div>

          {/* Longest Win Streak */}
          <div className="bg-slate-950 p-3 rounded-xl border border-yellow-500/40 flex flex-col items-center">
            <span className="text-2xl mb-1">🔥</span>
            <span className="font-pixel text-xl text-yellow-300 font-extrabold">
              {stats.longestWinStreak}
            </span>
            <span className="font-pixel text-[9px] text-slate-400 uppercase mt-0.5">
              LONGEST WIN STREAK
            </span>
            <span className="font-mono text-[9px] text-slate-500">
              (Current: {stats.currentWinStreak})
            </span>
          </div>

          {/* Longest Loose Streak */}
          <div className="bg-slate-950 p-3 rounded-xl border border-purple-500/40 flex flex-col items-center">
            <span className="text-2xl mb-1">💔</span>
            <span className="font-pixel text-xl text-purple-300 font-extrabold">
              {stats.longestLossStreak}
            </span>
            <span className="font-pixel text-[9px] text-slate-400 uppercase mt-0.5">
              LONGEST LOOSE STREAK
            </span>
            <span className="font-mono text-[9px] text-slate-500">
              (Current: {stats.currentLossStreak})
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="font-pixel text-[9px] text-red-400 hover:text-red-300 underline cursor-pointer"
          >
            Reset All Records
          </button>
          <button
            onClick={onClose}
            className="font-pixel text-xs bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl border-2 border-yellow-300 shadow cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            BACK TO PLAY 🎮
          </button>
        </div>
      </div>
    </div>
  );
}
