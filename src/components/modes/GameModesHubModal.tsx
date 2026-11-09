'use client';

import React, { useState, useEffect } from 'react';
import { PLAYABLE_STUFFIES, ALL_STUFFIES, STUFFY_MAP, BOSS_SPECIES_IDS } from '@/data/stuffies';
import { StuffyState, Card } from '@/types/game';
import { ALL_CARDS } from '@/data/cards';
import { StuffySprite } from '../battle/StuffySprite';
import { sound } from '@/utils/audio';

interface GameModesHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchBattle: (
    playerTeam: StuffyState[],
    playerDeck: Card[],
    enemyTypeOrCrackers?: any,
    maybeEnemyType?: any,
    dummyHp?: number,
    dummyShield?: number
  ) => void;
  onStartCampaignDraft?: () => void;
}

export const GameModesHubModal: React.FC<GameModesHubModalProps> = ({
  isOpen,
  onClose,
  onLaunchBattle,
}) => {
  const [activeTab, setActiveTab] = useState<'hub' | 'boss_rush' | 'daily' | 'gauntlet'>('hub');

  // Persistence for records
  const [bossRushBestWave, setBossRushBestWave] = useState<number>(0);
  const [dailyCompletedDate, setDailyCompletedDate] = useState<string | null>(null);
  const [dailyBestScore, setDailyBestScore] = useState<number>(0);
  const [gauntletVictories, setGauntletVictories] = useState<number>(0);

  // Today's date string
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const brRecord = localStorage.getItem('ben_stuffy_boss_rush_best');
        if (brRecord) setBossRushBestWave(parseInt(brRecord, 10));

        const dailyDate = localStorage.getItem('ben_stuffy_daily_date');
        setDailyCompletedDate(dailyDate);

        const dailyScore = localStorage.getItem('ben_stuffy_daily_best_score');
        if (dailyScore) setDailyBestScore(parseInt(dailyScore, 10));

        const gWins = localStorage.getItem('ben_stuffy_gauntlet_wins');
        if (gWins) setGauntletVictories(parseInt(gWins, 10));
      } catch (e) {
        // Ignore storage errors
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Launch Boss Rush Wave
  const handleLaunchBossRush = () => {
    sound.playClickSound();
    // Default 5-hero squad
    const heroIds = ['jefe', 'alex', 'shadow', 'finlee', 'dolphim'];
    const playerTeam: StuffyState[] = heroIds.map((id, idx) => {
      const sp = STUFFY_MAP.get(id);
      return {
        instanceId: `rush_${id}_${idx}`,
        speciesId: id,
        name: sp?.name || id,
        maxHp: sp?.baseHp || 75,
        currentHp: sp?.baseHp || 75,
        shield: 0,
        isUnstuffed: false,
        statusEffects: [],
      };
    });

    const playerDeck: Card[] = [];
    heroIds.forEach((id) => {
      const cards = ALL_CARDS.filter((c) => c.stuffyId === id);
      playerDeck.push(...cards.slice(0, 10));
    });

    // Launch battle with first boss: Amalgam
    onClose();
    onLaunchBattle(playerTeam, playerDeck, false, 'amalgam', 320, 50);
  };

  // 2. Launch Daily Mystery Challenge
  const handleLaunchDailyChallenge = () => {
    sound.playClickSound();
    // Deterministic squad based on date
    const seed = todayStr.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0);
    const squadIndices = [seed % 33, (seed + 7) % 33, (seed + 13) % 33, (seed + 19) % 33, (seed + 23) % 33];
    const uniqueSpecies = Array.from(new Set(squadIndices.map((i) => PLAYABLE_STUFFIES[i].id)));
    while (uniqueSpecies.length < 5) {
      uniqueSpecies.push(PLAYABLE_STUFFIES[Math.floor(Math.random() * PLAYABLE_STUFFIES.length)].id);
    }

    const playerTeam: StuffyState[] = uniqueSpecies.map((id, idx) => {
      const sp = STUFFY_MAP.get(id);
      return {
        instanceId: `daily_${id}_${idx}`,
        speciesId: id,
        name: sp?.name || id,
        maxHp: (sp?.baseHp || 75) + 15, // Daily vitality bonus!
        currentHp: (sp?.baseHp || 75) + 15,
        shield: 10,
        isUnstuffed: false,
        statusEffects: [{ type: 'energy', value: 2 }],
      };
    });

    const playerDeck: Card[] = [];
    uniqueSpecies.forEach((id) => {
      const cards = ALL_CARDS.filter((c) => c.stuffyId === id);
      playerDeck.push(...cards.slice(0, 10));
    });

    onClose();
    onLaunchBattle(playerTeam, playerDeck, false, 'mirror', 180, 20);
  };

  // 3. Launch Draft Gauntlet
  const handleLaunchDraftGauntlet = () => {
    sound.playClickSound();
    const gauntletHeroes = ['tyrant', 'grumpy_rhino', 'farty_lama', 'spike', 'riolu'];
    const playerTeam: StuffyState[] = gauntletHeroes.map((id, idx) => {
      const sp = STUFFY_MAP.get(id);
      return {
        instanceId: `gauntlet_${id}_${idx}`,
        speciesId: id,
        name: sp?.name || id,
        maxHp: sp?.baseHp || 80,
        currentHp: sp?.baseHp || 80,
        shield: 0,
        isUnstuffed: false,
        statusEffects: [],
      };
    });

    const playerDeck: Card[] = [];
    gauntletHeroes.forEach((id) => {
      const cards = ALL_CARDS.filter((c) => c.stuffyId === id);
      playerDeck.push(...cards.slice(0, 10));
    });

    onClose();
    onLaunchBattle(playerTeam, playerDeck, false, 'amalgam', 250, 30);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none text-white animate-fadeIn">
      <div className="bg-slate-950 border-4 border-yellow-400 rounded-3xl max-w-4xl w-full p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🕹️</span>
            <div>
              <h2 className="font-pixel text-xl text-yellow-300 font-bold tracking-wider">
                SPECIAL ARCADE &amp; CHALLENGE MODES
              </h2>
              <p className="font-mono text-xs text-slate-400 mt-0.5">
                Ascend beyond the standard campaign with unique standalone gauntlets &amp; trials!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClickSound();
              onClose();
            }}
            className="font-pixel text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 hover:text-white cursor-pointer"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('hub')}
            className={`font-pixel text-xs px-4 py-2 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'hub'
                ? 'bg-yellow-500 border-yellow-300 text-slate-950 font-bold shadow'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            ALL MODES (OVERVIEW)
          </button>
          <button
            onClick={() => setActiveTab('boss_rush')}
            className={`font-pixel text-xs px-4 py-2 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'boss_rush'
                ? 'bg-red-600 border-red-400 text-white font-bold shadow'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            💀 ENDLESS BOSS RUSH
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`font-pixel text-xs px-4 py-2 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-cyan-600 border-cyan-400 text-white font-bold shadow'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            📅 DAILY MYSTERY
          </button>
          <button
            onClick={() => setActiveTab('gauntlet')}
            className={`font-pixel text-xs px-4 py-2 rounded-xl border transition-all cursor-pointer ${
              activeTab === 'gauntlet'
                ? 'bg-purple-600 border-purple-400 text-white font-bold shadow'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            ⚔️ DRAFT GAUNTLET
          </button>
        </div>

        {/* TAB 1: HUB OVERVIEW */}
        {activeTab === 'hub' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mode 1: Boss Rush */}
            <div className="bg-slate-900/90 border-2 border-red-500/80 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover:border-red-400 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">💀</span>
                  <span className="font-mono text-[10px] bg-red-950 text-rose-300 px-2.5 py-0.5 rounded border border-red-700">
                    RECORD: WAVE {bossRushBestWave}
                  </span>
                </div>
                <h3 className="font-pixel text-base text-yellow-300 font-bold mb-1.5">
                  ENDLESS BOSS RUSH
                </h3>
                <p className="font-sans text-xs text-slate-300 leading-relaxed">
                  Consecutive gauntlet facing all 16 colossal bosses back-to-back with card draft rewards after every victory!
                </p>
              </div>
              <button
                onClick={handleLaunchBossRush}
                className="mt-4 font-pixel text-xs bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-xl border border-red-400 shadow cursor-pointer hover:scale-103 transition-all"
              >
                ENTER BOSS GAUNTLET 💀
              </button>
            </div>

            {/* Mode 2: Daily Mystery */}
            <div className="bg-slate-900/90 border-2 border-cyan-500/80 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover:border-cyan-400 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📅</span>
                  <span className="font-mono text-[10px] bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-700">
                    {todayStr}
                  </span>
                </div>
                <h3 className="font-pixel text-base text-cyan-300 font-bold mb-1.5">
                  DAILY MYSTERY TRIAL
                </h3>
                <p className="font-sans text-xs text-slate-300 leading-relaxed">
                  A seeded daily trial with a fixed random squad &amp; unique daily rule mutators. Personal scoring (no global leaderboard).
                </p>
              </div>
              <button
                onClick={handleLaunchDailyChallenge}
                className="mt-4 font-pixel text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 px-4 rounded-xl border border-cyan-400 shadow cursor-pointer hover:scale-103 transition-all"
              >
                PLAY TODAY&apos;S TRIAL 📅
              </button>
            </div>

            {/* Mode 3: Draft Gauntlet */}
            <div className="bg-slate-900/90 border-2 border-purple-500/80 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover:border-purple-400 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">⚔️</span>
                  <span className="font-mono text-[10px] bg-purple-950 text-purple-300 px-2.5 py-0.5 rounded border border-purple-700">
                    WINS: {gauntletVictories}
                  </span>
                </div>
                <h3 className="font-pixel text-base text-purple-300 font-bold mb-1.5">
                  DRAFT GAUNTLET
                </h3>
                <p className="font-sans text-xs text-slate-300 leading-relaxed">
                  Draft 1 captain + 4 mystery plushies and climb through a 5-match escalating ladder with card drafts between wins!
                </p>
              </div>
              <button
                onClick={handleLaunchDraftGauntlet}
                className="mt-4 font-pixel text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-4 rounded-xl border border-purple-400 shadow cursor-pointer hover:scale-103 transition-all"
              >
                START DRAFT GAUNTLET ⚔️
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: BOSS RUSH DETAILS */}
        {activeTab === 'boss_rush' && (
          <div className="bg-slate-900/90 border-2 border-red-700 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-base text-rose-300 font-bold">
                💀 ENDLESS BOSS GAUNTLET RULES
              </h3>
              <span className="font-mono text-xs bg-red-950 px-3 py-1 rounded-lg border border-red-600 text-yellow-300">
                Personal Best: Wave {bossRushBestWave}
              </span>
            </div>
            <ul className="font-sans text-xs text-slate-300 space-y-2 list-disc list-inside">
              <li>Battle all 16 colossal bosses back-to-back in an infinite survival ladder.</li>
              <li>Each wave defeated grants a choice of 3 bonus cards or 1 legendary relic to reinforce your squad.</li>
              <li>Plushies persist health between waves (50% missing HP restored after each victory).</li>
              <li>Earn exclusive Boss Slayer titles and records in your profile!</li>
            </ul>
            <button
              onClick={handleLaunchBossRush}
              className="font-pixel text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3 px-6 rounded-xl border border-red-300 shadow-xl cursor-pointer self-start hover:scale-105 transition-all mt-2"
            >
              DEPLOY SQUAD INTO BOSS RUSH 💀
            </button>
          </div>
        )}

        {/* TAB 3: DAILY MYSTERY DETAILS */}
        {activeTab === 'daily' && (
          <div className="bg-slate-900/90 border-2 border-cyan-700 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-base text-cyan-300 font-bold">
                📅 TODAY&apos;S MYSTERY TRIAL: {todayStr}
              </h3>
              <span className="font-mono text-xs bg-cyan-950 px-3 py-1 rounded-lg border border-cyan-600 text-yellow-300">
                Best Score: {dailyBestScore} pts
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-cyan-800/60 font-mono text-xs text-cyan-200">
              ⚡ ACTIVE MUTATOR: <strong>Overdrive Resonance (+15 Starting HP, +2 Starting Energy, Fast Speed Strike Procs)</strong>
            </div>
            <p className="font-sans text-xs text-slate-300">
              Each day generates a brand new fixed squad and modifier combination for all players. Complete the trial to set your personal daily record!
            </p>
            <button
              onClick={handleLaunchDailyChallenge}
              className="font-pixel text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl border border-cyan-300 shadow-xl cursor-pointer self-start hover:scale-105 transition-all mt-2"
            >
              START TODAY&apos;S CHALLENGE 📅
            </button>
          </div>
        )}

        {/* TAB 4: GAUNTLET DETAILS */}
        {activeTab === 'gauntlet' && (
          <div className="bg-slate-900/90 border-2 border-purple-700 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-pixel text-base text-purple-300 font-bold">
                ⚔️ 5-MATCH DRAFT GAUNTLET
              </h3>
              <span className="font-mono text-xs bg-purple-950 px-3 py-1 rounded-lg border border-purple-600 text-yellow-300">
                Completed Gauntlets: {gauntletVictories}
              </span>
            </div>
            <p className="font-sans text-xs text-slate-300">
              Face an escalating 5-tier gauntlet against tough AI squads. Draft an extra card into your deck after each victory to sculpt your build as you climb!
            </p>
            <button
              onClick={handleLaunchDraftGauntlet}
              className="font-pixel text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl border border-purple-300 shadow-xl cursor-pointer self-start hover:scale-105 transition-all mt-2"
            >
              LAUNCH GAUNTLET ⚔️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
