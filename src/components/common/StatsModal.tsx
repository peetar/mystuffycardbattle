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
import {
  getAdvancements,
  Advancement,
  getConcussedSpecies,
  resetAllAdvancements,
} from '@/utils/advancements';
import { GAME_VERSION_HISTORY } from '@/data/versionHistory';

interface StatsModalProps {
  onClose: () => void;
  initialTab?: 'stats' | 'advancements' | 'version_history';
}

export default function StatsModal({ onClose, initialTab = 'stats' }: StatsModalProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'advancements' | 'version_history'>(initialTab);
  const [advancements, setAdvancements] = useState<Advancement[]>([]);
  const [concussedSpecies, setConcussedSpecies] = useState<string[]>([]);
  const [selectedAdvancement, setSelectedAdvancement] = useState<Advancement | null>(null);

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

  const handleResetStats = () => {
    if (window.confirm('Are you sure you want to reset all combat statistics?')) {
      resetPlayerStats();
      setStats(loadPlayerStats());
    }
  };

  const handleResetAdvancements = () => {
    if (window.confirm('Reset all 105 advancements back to locked status?')) {
      resetAllAdvancements();
      setAdvancements(getAdvancements());
      setConcussedSpecies([]);
      setSelectedAdvancement(null);
    }
  };

  const unlockedCount = advancements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 md:p-4 select-none animate-fadeIn">
      <div className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-4 md:p-6 max-w-3xl w-full shadow-2xl relative text-center max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <h2 className="font-pixel text-base md:text-lg text-yellow-400 font-bold tracking-wider">
              HALL OF RECORDS &amp; UPDATES (v3.6)
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
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <button
            onClick={() => setActiveTab('stats')}
            className={`font-pixel text-xs px-3.5 py-2 rounded-xl border-2 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-yellow-500 text-slate-950 border-yellow-300 font-bold shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            📊 STATS
          </button>
          <button
            onClick={() => setActiveTab('advancements')}
            className={`font-pixel text-xs px-3.5 py-2 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'advancements'
                ? 'bg-purple-600 text-white border-purple-300 font-bold shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <span>🏆</span>
            <span>ADVANCEMENTS ({unlockedCount}/{advancements.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('version_history')}
            className={`font-pixel text-xs px-3.5 py-2 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'version_history'
                ? 'bg-blue-600 text-white border-blue-300 font-bold shadow-md'
                : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <span>📜</span>
            <span>VERSION HISTORY ({GAME_VERSION_HISTORY.length})</span>
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
          ) : activeTab === 'advancements' ? (
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between px-2 text-left">
                <span className="font-pixel text-[10px] text-slate-400">
                  7×15 ADVANCEMENTS MATRIX: {unlockedCount} / {advancements.length} UNLOCKED
                </span>
                <span className="font-pixel text-[10px] text-purple-400">
                  {Math.round((unlockedCount / (advancements.length || 1)) * 100)}% COMPLETE
                </span>
              </div>

              {/* 7 x 15 Grid of Advancements */}
              <div className="bg-slate-950/80 border-2 border-purple-500/40 rounded-2xl p-2 md:p-3 shadow-inner">
                <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1 md:gap-1.5">
                  {advancements.map((adv, idx) => (
                    <button
                      key={adv.id}
                      onClick={() => setSelectedAdvancement(adv)}
                      title={`${adv.title} - ${adv.unlocked ? 'Unlocked' : 'Locked'}`}
                      className={`aspect-square w-full rounded-lg md:rounded-xl border flex items-center justify-center text-sm md:text-base cursor-pointer transition-all duration-150 transform hover:scale-115 hover:z-10 focus:outline-none ${
                        adv.unlocked
                          ? 'bg-gradient-to-br from-purple-700 to-indigo-900 border-yellow-400 text-yellow-300 shadow-md ring-1 ring-yellow-400/60'
                          : 'bg-slate-900/90 border-slate-800 text-slate-600 opacity-70 hover:opacity-100 hover:border-slate-500'
                      } ${selectedAdvancement?.id === adv.id ? 'ring-2 ring-white scale-110 z-20' : ''}`}
                    >
                      <span className={adv.unlocked ? 'filter-none' : 'grayscale contrast-75'}>
                        {adv.icon}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="font-pixel text-[9px] text-slate-400">
                Tap any square in the 7×15 grid above to inspect advancement requirements and lore!
              </p>
            </div>
          ) : (
            /* Version History Tab */
            <div className="space-y-4 py-1 text-left">
              <div className="flex items-center justify-between px-1">
                <span className="font-pixel text-[10px] text-slate-400 uppercase tracking-wider">
                  📜 COMPLETE CHANGELOG &amp; PATCH ARCHIVE
                </span>
                <span className="font-pixel text-[10px] text-blue-400">
                  {GAME_VERSION_HISTORY.length} RELEASES RECORDED
                </span>
              </div>

              <div className="space-y-3">
                {GAME_VERSION_HISTORY.map((ver) => (
                  <div
                    key={ver.version}
                    className={`bg-slate-950/80 rounded-2xl p-4 border transition-all ${
                      ver.badge === 'CURRENT'
                        ? 'border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/50'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`font-pixel text-xs px-2.5 py-1 rounded-lg font-bold border ${
                            ver.badge === 'CURRENT'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60'
                              : 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                          }`}
                        >
                          {ver.version}
                        </span>
                        <h3 className="font-pixel text-sm text-yellow-300 font-bold">
                          {ver.title}
                        </h3>
                        {ver.badge && (
                          <span
                            className={`font-pixel text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold ${
                              ver.badge === 'CURRENT'
                                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                : ver.badge === 'MAJOR'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-purple-600 text-white'
                            }`}
                          >
                            {ver.badge}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {ver.date}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="font-mono text-xs text-slate-300 mb-3 leading-relaxed">
                      {ver.summary}
                    </p>

                    {/* Changes by Category */}
                    <div className="space-y-2.5">
                      {ver.changes.map((cat, cIdx) => (
                        <div key={cIdx} className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80">
                          <h4 className="font-pixel text-[10px] text-amber-400 font-bold mb-1.5 flex items-center gap-1.5">
                            <span>✦</span>
                            <span>{cat.category}</span>
                          </h4>
                          <ul className="space-y-1">
                            {cat.items.map((item, iIdx) => (
                              <li
                                key={iIdx}
                                className="font-mono text-xs text-slate-300 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-slate-500 leading-normal"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Advancement Pop-up Dialog */}
        {selectedAdvancement && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm rounded-3xl flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-slate-900 border-3 border-purple-400 rounded-2xl p-5 max-w-md w-full shadow-2xl text-left relative flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-3 border-2 ${
                  selectedAdvancement.unlocked
                    ? 'bg-purple-900/60 border-yellow-400 shadow-lg text-yellow-300'
                    : 'bg-slate-950 border-slate-700 grayscale text-slate-500'
                }`}
              >
                {selectedAdvancement.icon}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-pixel text-sm md:text-base text-yellow-300 font-bold">
                  {selectedAdvancement.title}
                </h3>
              </div>

              <div className="mb-3">
                {selectedAdvancement.unlocked ? (
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 text-[9px] font-pixel px-2 py-0.5 rounded-full uppercase">
                    UNLOCKED ✓ {selectedAdvancement.unlockedAt ? `(${selectedAdvancement.unlockedAt})` : ''}
                  </span>
                ) : (
                  <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-pixel px-2 py-0.5 rounded-full uppercase">
                    LOCKED 🔒
                  </span>
                )}
              </div>

              <p className="font-mono text-xs md:text-sm text-slate-200 bg-slate-950/70 p-3 rounded-xl border border-slate-800 w-full mb-3 leading-relaxed">
                {selectedAdvancement.description}
              </p>

              {selectedAdvancement.id === 'concussion_kill' && (
                <div className="w-full bg-amber-950/30 border border-amber-600/40 p-2.5 rounded-xl font-pixel text-[10px] text-amber-300 mb-3 text-left">
                  <div className="font-bold mb-1">
                    Concussion Defeat Progress: {concussedSpecies.length} / 25 Species
                  </div>
                  <div className="text-[9px] text-slate-300 font-mono">
                    {concussedSpecies.length > 0
                      ? concussedSpecies.join(', ')
                      : 'No species defeated with concussion yet. Knock them out while brain-damaged!'}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedAdvancement(null)}
                className="font-pixel text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-xl border border-purple-300 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                DISMISS [✖️]
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetStats}
              className="font-pixel text-[9px] text-red-400 hover:text-red-300 underline cursor-pointer"
            >
              Reset Combat Records
            </button>
            <span className="text-slate-600 text-xs">•</span>
            <button
              onClick={handleResetAdvancements}
              className="font-pixel text-[9px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              Reset All Advancements
            </button>
          </div>
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
