'use client';

import React from 'react';
import { useCombatStore } from '@/store/combatStore';
import { StuffySprite } from './StuffySprite';
import { HealthBar } from './HealthBar';
import { CardHand } from './CardHand';
import { CrackersMeter } from './CrackersMeter';
import { PrivacyCover } from './PrivacyCover';

interface BattleArenaProps {
  onBattleEnd?: (result: 'victory' | 'defeat') => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ onBattleEnd }) => {
  const {
    gameMode,
    activeSide,
    currentCrackers,
    maxCrackers,
    playerTeam,
    enemyTeam,
    playerHand,
    enemyHand,
    selectedCardIndex,
    selectCard,
    selectTarget,
    endTurn,
    privacyCoverActive,
    dismissPrivacyCover,
    battleResult,
    combatLogs,
  } = useCombatStore();

  const activeHand = activeSide === 'p2' ? enemyHand : playerHand;
  const isP1orPlayer = activeSide === 'player' || activeSide === 'p1';

  // Highlight targets based on selected card
  const selectedCard = selectedCardIndex !== null ? activeHand[selectedCardIndex] : null;

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between overflow-hidden select-none">
      {/* Top Banner: Mode, Turn, and Battle Status */}
      <header className="w-full bg-slate-950/80 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-xl">🧸</span>
          <h1 className="font-pixel text-xs md:text-sm text-yellow-400 font-bold tracking-wider">
            BEN&apos;S STUFFY CARD BATTLE
          </h1>
          <span className="font-pixel text-[10px] px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/50 text-indigo-300">
            {gameMode === 'two_player' ? '2-PLAYER VERSUS' : '5v5 CAMPAIGN'}
          </span>
        </div>

        {gameMode === 'two_player' && (
          <div className="font-pixel text-xs font-bold px-3 py-1 rounded border-2 bg-slate-900 text-yellow-300 border-yellow-500 shadow-md">
            CURRENT TURN: {activeSide.toUpperCase()}
          </div>
        )}
      </header>

      {/* 5v5 Battlefield Stage */}
      <main className="flex-1 flex flex-col justify-around py-4 px-2 md:px-8 relative">
        {/* ENEMY / PLAYER 2 FIELD (Top Half) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-pixel text-[10px] text-red-400 font-bold tracking-wide">
              {gameMode === 'two_player' ? 'PLAYER 2 (TEAM BLUE)' : 'OPPOSING STUFFIES (5v5)'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 md:gap-6 justify-items-center w-full max-w-4xl bg-slate-900/50 p-3 rounded-2xl border border-red-950/50 shadow-inner">
            {enemyTeam.map((stuffy) => {
              const isTargetable =
                selectedCard &&
                (selectedCard.target === 'single_enemy' ||
                  selectedCard.target === 'all_enemies' ||
                  (activeSide === 'p2' && selectedCard.target === 'single_ally'));

              return (
                <div key={stuffy.instanceId} className="flex flex-col items-center gap-1">
                  <HealthBar stuffy={stuffy} />
                  <StuffySprite
                    stuffy={stuffy}
                    size={80}
                    highlightTarget={Boolean(isTargetable && !stuffy.isUnstuffed)}
                    onClick={() => selectTarget(stuffy.instanceId)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Battlefield Divider with Combat Logs */}
        <div className="w-full flex justify-center items-center py-1 relative">
          <div className="w-full max-w-2xl bg-black/40 border border-slate-800 rounded-lg px-4 py-1.5 flex items-center justify-between text-xs font-mono text-slate-300 overflow-hidden shadow-inner">
            <span className="text-amber-400 font-bold font-pixel text-[10px] mr-2">LOG:</span>
            <span className="truncate flex-1 text-left text-[11px]">
              {combatLogs[0]?.text || 'Combat ready. Choose a card to deploy fluff power!'}
            </span>
          </div>
        </div>

        {/* PLAYER / PLAYER 1 FIELD (Bottom Half) */}
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-5 gap-2 md:gap-6 justify-items-center w-full max-w-4xl bg-slate-900/50 p-3 rounded-2xl border border-emerald-950/50 shadow-inner">
            {playerTeam.map((stuffy) => {
              const isTargetable =
                selectedCard &&
                ((isP1orPlayer &&
                  (selectedCard.target === 'single_ally' ||
                    selectedCard.target === 'all_allies' ||
                    (selectedCard.target === 'unstuffed_ally' && stuffy.isUnstuffed))) ||
                  (!isP1orPlayer && selectedCard.target === 'single_enemy'));

              return (
                <div key={stuffy.instanceId} className="flex flex-col items-center gap-1">
                  <StuffySprite
                    stuffy={stuffy}
                    size={80}
                    isFacingLeft={true}
                    highlightTarget={Boolean(isTargetable)}
                    onClick={() => selectTarget(stuffy.instanceId)}
                  />
                  <HealthBar stuffy={stuffy} />
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="font-pixel text-[10px] text-emerald-400 font-bold tracking-wide">
              {gameMode === 'two_player' ? 'PLAYER 1 (TEAM GREEN)' : 'YOUR STUFFY PARTY (5v5)'}
            </span>
          </div>
        </div>
      </main>

      {/* Bottom Controls: Crackers Meter & Hand */}
      <footer className="w-full bg-slate-950/90 border-t border-slate-800 flex flex-col items-center pb-2 z-20 backdrop-blur">
        <div className="w-full max-w-4xl flex items-center justify-between px-6 pt-2">
          <CrackersMeter
            currentCrackers={currentCrackers}
            maxCrackers={maxCrackers}
            onEndTurn={endTurn}
            isPlayerTurn={battleResult === 'ongoing'}
          />

          <div className="text-right font-pixel text-[10px] text-slate-400">
            <div>CARDS IN HAND: {activeHand.length}/5</div>
            <div className="text-yellow-400">DRAG OR CLICK TO TARGET</div>
          </div>
        </div>

        {/* Card Hand */}
        <CardHand
          cards={activeHand}
          selectedCardIndex={selectedCardIndex}
          onSelectCard={selectCard}
          currentCrackers={currentCrackers}
          disabled={battleResult !== 'ongoing'}
        />
      </footer>

      {/* 2-Player Pass-and-Play Privacy Cover */}
      {privacyCoverActive && (
        <PrivacyCover
          nextPlayerName={activeSide === 'p1' ? 'Player 1' : 'Player 2'}
          onReady={dismissPrivacyCover}
        />
      )}

      {/* Victory / Defeat Modal */}
      {battleResult !== 'ongoing' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-4 border-yellow-500 rounded-2xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl animate-scaleUp">
            <span className="text-6xl mb-4 block">
              {battleResult === 'victory' ? '🏆' : '💀'}
            </span>
            <h2
              className={`font-pixel text-2xl md:text-3xl mb-2 font-bold ${
                battleResult === 'victory' ? 'text-yellow-400' : 'text-red-500'
              }`}
            >
              {battleResult === 'victory' ? 'BATTLE VICTORY!' : 'ALL STUFFIES DEFEATED!'}
            </h2>
            <p className="font-pixel text-xs text-slate-300 mb-6">
              {battleResult === 'victory'
                ? 'Your plush team stood strong and outfluffed the competition!'
                : 'Your stuffies lost all their fluff! Time to restitch and try again.'}
            </p>

            <button
              onClick={() => onBattleEnd && onBattleEnd(battleResult)}
              className="font-pixel text-sm bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-6 py-3 rounded-xl border-2 border-yellow-300 shadow-lg cursor-pointer"
            >
              CONTINUE ⏭️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
