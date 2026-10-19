'use client';

import React, { useState, useEffect } from 'react';
import {
  loadPlayerStats,
  getMostLikedStuffy,
  getMostLikedCard,
  resetPlayerStats,
  formatPlaytime,
  PlayerStats,
} from '@/utils/playerStats';
import { ALL_STUFFIES } from '@/data/stuffies';
import { StuffySprite } from '@/components/battle/StuffySprite';
import { getAdvancements, Advancement, getConcussedSpecies } from '@/utils/advancements';

interface StatsModalProps {
  onClose: () => void;
  initialTab?: 'stats' | 'advancements';
}

export default function StatsModal({ onClose, initialTab = 'stats' }: StatsModalProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'advancements'>(initialTab);
  const [advancements, setAdvancements] = useState<Advancement[]>([]);
  const [concussedSpecies, setConcussedSpecies] = useState<string[]>([]);

  useEffect(() => {
    setStats(loadPlayerStats());
    setAdvancements(getAdvancements());
    setConcussedSpecies(getConcussedSpecies());
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

  const unlockedCount = advancements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative text-center max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h2 className="font-pixel text-base md:text-lg text-yellow-400 font-bold tracking-wider">
              HALL OF RECORDS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-600 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            CLOSE [✖️]
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => setActiveTab('stats')}
            className={`font-pixel text-xs px-4 py-2 rounded-xl border-2 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-yellow-500 text-slate-950 border-yellow-300 font-bold shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            📊 STATS &amp; RECORDS
          </button>
          <button
            onClick={() => setActiveTab('advancements')}
            className={`font-pixel text-xs px-4 py-2 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'advancements'
                ? 'bg-purple-600 text-white border-purple-300 font-bold shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <span>🏆</span>
            <span>ADVANCEMENTS ({unlockedCount}/{advancements.length})</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'stats' ? (
            <>
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

              {/* 8 Core Stat Boxes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-2">
                {/* Total Victories */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/40 flex flex-col items-center">
                  <span className="text-xl mb-0.5">🏆</span>
                  <span className="font-pixel text-lg text-emerald-400 font-extrabold">
                    {stats.wins}
                  </span>
                  <span className="font-pixel text-[8px] text-slate-400 uppercase mt-0.5">
                    TOTAL VICTORIES
                  </span>
                </div>

                {/* Total Deaths (Unstuffings) */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-red-500/40 flex flex-col items-center">
                  <span className="text-xl mb-0.5">💀</span>
                  <span className="font-pixel text-lg text-red-400 font-extrabold">
                    {stats.deaths}
                  </span>
                  <span className="font-pixel text-[8px] text-slate-400 uppercase mt-0.5">
                    STUFFY DEATHS
                  </span>
                </div>

                {/* Longest Win Streak */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-yellow-500/40 flex flex-col items-center">
                  <span className="text-xl mb-0.5">🔥</span>
                  <span className="font-pixel text-lg text-yellow-300 font-extrabold">
                    {stats.longestWinStreak}
                  </span>
                  <span className="font-pixel text-[8px] text-slate-400 uppercase mt-0.5">
                    WIN STREAK
                  </span>
                  <span className="font-mono text-[8px] text-slate-500">
                    (Cur: {stats.currentWinStreak})
                  </span>
                </div>

                {/* Longest Loose Streak */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-purple-500/40 flex flex-col items-center">
                  <span className="text-xl mb-0.5">💔</span>
                  <span className="font-pixel text-lg text-purple-300 font-extrabold">
                    {stats.longestLossStreak}
                  </span>
                  <span className="font-pixel text-[8px] text-slate-400 uppercase mt-0.5">
                    LOOSE STREAK
                  </span>
                  <span className="font-mono text-[8px] text-slate-500">
                    (Cur: {stats.currentLossStreak})
                  </span>
                </div>

                {/* Total Damage Dealt */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-orange-500/40 flex flex-col items-center">
                  <span className="text-xl mb-0.5">💥</span>
                  <span className="font-pixel text-base text-orange-400 font-extrabold">
                    {stats.totalDamageDealt || 0}
                  </span>
                  <span className="font-pixel text-[8px] text-slate-400 uppercase mt-0.5">
                    DAMAGE DEALT
                  </span>
                </div>

                {/* Combats Forfeited / Lost */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-rose-500/40 flex flex-col items-center">
                  <span className="text-xl mb-0.5">🏳️</span>
                  <span className="font-pixel text-base text-rose-400 font-extrabold">
                    {stats.combatsForfeitedOrLost || 0}
                  </span>
                  <span className="font-pixel text-[8px] text-slate-400 uppercase mt-0.5 text-center leading-tight">
                    FORFEIT / COMBAT LOSS
                  </span>
                </div>

                {/* Total Playtime */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-cyan-500/40 flex flex-col items-center">
                  <span className="text-xl mb-0.5">⏱️</span>
                  <span className="font-pixel text-xs text-cyan-300 font-extrabold">
                    {formatPlaytime(stats.playtimeSeconds || 0)}
                  </span>
                  <span className="font-pixel text-[8px] text-slate-400 uppercase mt-0.5">
                    PLAYTIME
                  </span>
                </div>

                {/* Main Menu Visits */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-teal-500/40 flex flex-col items-center">
                  <span className="text-xl mb-0.5">🏠</span>
                  <span className="font-pixel text-base text-teal-300 font-extrabold">
                    {stats.mainMenuVisits || 0}
                  </span>
                  <span className="font-pixel text-[8px] text-slate-400 uppercase mt-0.5 text-center leading-tight">
                    MENU VISITS
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between px-2 text-left">
                <span className="font-pixel text-[10px] text-slate-400">
                  ACHIEVEMENTS PROGRESS: {unlockedCount} / {advancements.length} UNLOCKED
                </span>
                <span className="font-pixel text-[10px] text-purple-400">
                  {Math.round((unlockedCount / (advancements.length || 1)) * 100)}% COMPLETE
                </span>
              </div>
              <div className="space-y-2">
                {advancements.map((adv) => (
                  <div
                    key={adv.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                      adv.unlocked
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                        adv.unlocked
                          ? 'bg-purple-900/50 border-purple-400 shadow-inner'
                          : 'bg-slate-900 border-slate-800 grayscale'
                      }`}
                    >
                      {adv.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-pixel text-xs font-bold truncate ${
                            adv.unlocked ? 'text-yellow-300' : 'text-slate-400'
                          }`}
                        >
                          {adv.title}
                        </h4>
                        {adv.unlocked ? (
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[8px] font-pixel px-1.5 py-0.5 rounded uppercase">
                            UNLOCKED ✓
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-500 text-[8px] font-pixel px-1.5 py-0.5 rounded uppercase">
                            LOCKED 🔒
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-slate-300 mt-0.5 leading-snug">
                        {adv.description}
                      </p>
                      {adv.id === 'concussion_kill' && (
                        <div className="font-pixel text-[9px] text-amber-400 mt-1">
                          Progress: {concussedSpecies.length} / 21 species defeated with concussion ({concussedSpecies.join(', ') || 'none yet'})
                        </div>
                      )}
                      {adv.unlocked && adv.unlockedAt && (
                        <span className="font-mono text-[9px] text-purple-300/80 block mt-0.5">
                          Achieved: {new Date(adv.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
