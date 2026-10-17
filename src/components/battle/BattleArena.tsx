'use client';

import React from 'react';
import { useCombatStore } from '@/store/combatStore';
import { StuffySprite } from './StuffySprite';
import { HealthBar } from './HealthBar';
import { CardHand } from './CardHand';
import { CardView } from './CardView';
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
    playerDeck,
    enemyDeck,
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
    activeAttackAnimation,
    recentEnemyActions,
    showEnemyTurnReview,
    dismissEnemyTurnReview,
  } = useCombatStore();

  const activeHand = activeSide === 'p2' ? enemyHand : playerHand;
  const isP1orPlayer = activeSide === 'player' || activeSide === 'p1';
  const [viewingDeckModal, setViewingDeckModal] = React.useState(false);

  // Active player deck + hand + discard for full deck viewing
  const activeFullDeck = activeSide === 'p2'
    ? [...enemyHand, ...enemyDeck, ...useCombatStore.getState().enemyDiscard]
    : [...playerHand, ...playerDeck, ...useCombatStore.getState().playerDiscard];

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

        <div className="flex items-center gap-3">
          {gameMode === 'two_player' && (
            <div className="font-pixel text-xs font-bold px-3 py-1 rounded border-2 bg-slate-900 text-yellow-300 border-yellow-500 shadow-md">
              CURRENT TURN: {activeSide.toUpperCase()}
            </div>
          )}
          <button
            onClick={() => setViewingDeckModal(true)}
            className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-yellow-300 px-3 py-1.5 rounded-lg border border-slate-600 cursor-pointer shadow"
          >
            🃏 VIEW CARDS ({activeFullDeck.length})
          </button>
        </div>
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
                  selectedCard.type === 'attack' ||
                  (activeSide === 'p2' && selectedCard.target === 'single_ally'));

              const isAttacking = activeAttackAnimation?.attackerId === stuffy.instanceId;
              const isTakingDamage = activeAttackAnimation?.targetId === stuffy.instanceId;

              return (
                <div key={stuffy.instanceId} className="flex flex-col items-center gap-1">
                  <HealthBar stuffy={stuffy} />
                  <StuffySprite
                    stuffy={stuffy}
                    size={80}
                    isEnemy={true}
                    isAttacking={isAttacking}
                    isTakingDamage={isTakingDamage}
                    highlightTarget={Boolean(isTargetable && !stuffy.isUnstuffed)}
                    onClick={() => selectTarget(stuffy.instanceId)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Battlefield Divider with Combat Logs & Ranged Projectile FX */}
        <div className="w-full flex flex-col justify-center items-center py-1 relative">
          {/* RANGED PROJECTILE ANIMATION OVERLAY */}
          {activeAttackAnimation && activeAttackAnimation.isRanged && (
            <div className="absolute z-40 pointer-events-none flex flex-col items-center animate-bounce-short">
              <div className="text-4xl drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] animate-pulse">
                {activeAttackAnimation.projectileType === 'plasma' && '🔥💥 [PLASMA POO] 💥🔥'}
                {activeAttackAnimation.projectileType === 'laser' && '⚡🔴 [DEATH LASER] 🔴⚡'}
                {activeAttackAnimation.projectileType === 'gas' && '💨☠️ [TOXIC GAS CLOUD] ☠️💨'}
                {activeAttackAnimation.projectileType === 'dart' && '🎯💧 [POISON DART] 💧🎯'}
                {activeAttackAnimation.projectileType === 'sonic' && '🎵🔊 [SONIC MELODY] 🔊🎶'}
                {activeAttackAnimation.projectileType === 'rock' && '🌰💫 [CHONK ACORN] 💫🌰'}
                {activeAttackAnimation.projectileType === 'needle' && '🪡⚡ [SILVER NEEDLE] ⚡🪡'}
              </div>
              <span className="font-pixel text-[10px] text-yellow-300 bg-black/80 px-2 py-0.5 rounded border border-yellow-500 mt-1">
                {activeAttackAnimation.cardName}
              </span>
            </div>
          )}

          {/* MELEE LUNGE CARD ANNOUNCEMENT */}
          {activeAttackAnimation && !activeAttackAnimation.isRanged && (
            <div className="absolute z-40 pointer-events-none flex flex-col items-center animate-ping">
              <span className="font-pixel text-xs text-yellow-400 bg-red-950/90 border border-yellow-400 px-3 py-1 rounded-full shadow-lg">
                🐾 {activeAttackAnimation.cardName.toUpperCase()}!
              </span>
            </div>
          )}

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
                    selectedCard.type === 'heal' ||
                    selectedCard.type === 'defense' ||
                    (selectedCard.target === 'unstuffed_ally' && stuffy.isUnstuffed))) ||
                  (!isP1orPlayer && (selectedCard.target === 'single_enemy' || selectedCard.type === 'attack')));

              const isAttacking = activeAttackAnimation?.attackerId === stuffy.instanceId;
              const isTakingDamage = activeAttackAnimation?.targetId === stuffy.instanceId;

              return (
                <div key={stuffy.instanceId} className="flex flex-col items-center gap-1">
                  <StuffySprite
                    stuffy={stuffy}
                    size={80}
                    isFacingLeft={true}
                    isEnemy={false}
                    isAttacking={isAttacking}
                    isTakingDamage={isTakingDamage}
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
            isPlayerTurn={battleResult === 'ongoing' && !showEnemyTurnReview}
          />

          <div className="text-right font-pixel text-[10px] text-slate-400">
            <div>CARDS IN HAND: {activeHand.length}/5</div>
            <div className="text-yellow-400">CLICK CARD TO PLAY</div>
          </div>
        </div>

        {/* Card Hand */}
        <CardHand
          cards={activeHand}
          selectedCardIndex={selectedCardIndex}
          onSelectCard={selectCard}
          currentCrackers={currentCrackers}
          disabled={battleResult !== 'ongoing' || showEnemyTurnReview}
        />
      </footer>

      {/* ENEMY TURN REVIEW MODAL (Shows what cards enemy played and who they attacked!) */}
      {showEnemyTurnReview && recentEnemyActions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border-4 border-red-500 rounded-2xl p-6 max-w-lg w-full text-center shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-3xl">⚔️</span>
              <h2 className="font-pixel text-lg md:text-xl text-red-400 font-bold">
                ENEMY TURN ACTIONS
              </h2>
            </div>
            <p className="font-pixel text-[10px] text-slate-300 mb-4">
              Here is what the opposing stuffies did this turn:
            </p>

            {/* List of enemy actions */}
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto mb-6">
              {recentEnemyActions.map((act, i) => (
                <div
                  key={i}
                  className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-left"
                >
                  <div className="flex flex-col">
                    <span className="font-pixel text-xs text-yellow-300 font-bold">
                      🐾 {act.enemyName} played &ldquo;{act.cardName}&rdquo;
                    </span>
                    <span className="font-sans text-[11px] text-slate-300 mt-0.5">
                      Attacked <span className="text-emerald-400 font-bold">{act.targetName}</span>
                    </span>
                  </div>
                  <div className="font-pixel text-sm text-red-400 font-bold bg-red-950/80 px-2 py-1 rounded border border-red-500/50">
                    💥 -{act.damage}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={dismissEnemyTurnReview}
              className="font-pixel text-sm bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-8 py-3 rounded-xl border-2 border-yellow-300 shadow-xl cursor-pointer animate-pulse"
            >
              START YOUR TURN 🎮
            </button>
          </div>
        </div>
      )}

      {/* 2-Player Pass-and-Play Privacy Cover */}
      {privacyCoverActive && (
        <PrivacyCover
          nextPlayerName={activeSide === 'p1' ? 'Player 1' : 'Player 2'}
          onReady={dismissPrivacyCover}
        />
      )}

      {/* Deck Viewing Modal during Battle */}
      {viewingDeckModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-6 select-none overflow-y-auto">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-pixel text-base text-yellow-400 font-bold">
                {activeSide.toUpperCase()}&apos;S CARDS ({activeFullDeck.length} TOTAL)
              </h2>
              <p className="font-mono text-xs text-slate-400">
                All cards in hand, draw pile, and discard pile for this player.
              </p>
            </div>
            <button
              onClick={() => setViewingDeckModal(false)}
              className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 cursor-pointer"
            >
              CLOSE [✖️]
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 my-4 overflow-y-auto max-h-[75vh] p-2">
            {activeFullDeck.map((card, idx) => (
              <CardView key={`${card.id}_${idx}`} card={card} compact={true} />
            ))}
          </div>
        </div>
      )}

      {/* Victory / Defeat Modal */}
      {battleResult !== 'ongoing' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-4 border-yellow-500 rounded-2xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl animate-scaleUp">
            <span className="text-6xl mb-4 block animate-bounce">
              {battleResult === 'defeat' ? '💀' : '🏆'}
            </span>
            <h2
              className={`font-pixel text-xl md:text-2xl mb-2 font-bold ${
                battleResult === 'defeat' ? 'text-red-500' : 'text-yellow-400'
              }`}
            >
              {battleResult === 'p1_victory' && 'PLAYER 1 WINS! 🏆'}
              {battleResult === 'p2_victory' && 'PLAYER 2 WINS! 🏆'}
              {battleResult === 'victory' && 'CAMPAIGN BATTLE VICTORY!'}
              {battleResult === 'defeat' && 'ALL STUFFIES DEFEATED!'}
            </h2>
            <p className="font-pixel text-xs text-slate-300 mb-6 leading-relaxed">
              {battleResult === 'p1_victory' && 'Player 1 successfully unstuffed all of Player 2\'s stuffies!'}
              {battleResult === 'p2_victory' && 'Player 2 successfully unstuffed all of Player 1\'s stuffies!'}
              {battleResult === 'victory' && 'Your plush squad stood strong and claimed victory!'}
              {battleResult === 'defeat' && 'Your squad lost all their fluff! Time to restitch and try again.'}
            </p>

            <button
              onClick={() => onBattleEnd && onBattleEnd(battleResult as any)}
              className="font-pixel text-sm bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl border-2 border-yellow-300 shadow-xl cursor-pointer"
            >
              CONTINUE ⏭️
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
