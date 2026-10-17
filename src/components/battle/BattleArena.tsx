'use client';

import React from 'react';
import { useCombatStore } from '@/store/combatStore';
import { StuffySprite } from './StuffySprite';
import { HealthBar } from './HealthBar';
import { CardHand } from './CardHand';
import { CardView, TIER_COLORS } from './CardView';
import { CrackersMeter } from './CrackersMeter';
import { PrivacyCover } from './PrivacyCover';
import { STUFFY_MAP } from '@/data/stuffies';

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
    selectedTargetId,
    selectCard,
    selectTarget,
    playCard,
    endTurn,
    privacyCoverActive,
    dismissPrivacyCover,
    battleResult,
    combatLogs,
    activeAttackAnimation,
    recentEnemyActions,
    showEnemyTurnReview,
    dismissEnemyTurnReview,
    strokenosisActive,
    strokenosisCards,
    resolveStrokenosis,
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
    <div
      className="relative w-full h-screen flex flex-col justify-between overflow-hidden select-none"
      style={{
        backgroundColor: '#0f0c1b',
        backgroundImage: `
          radial-gradient(ellipse at 50% 30%, rgba(79, 70, 229, 0.18) 0%, transparent 70%),
          repeating-linear-gradient(0deg, #171328 0px, #171328 44px, #0e0a1b 44px, #0e0a1b 46px)
        `,
      }}
    >
      {/* Top Banner: Mode, Turn, and Battle Status */}
      <header className="w-full bg-slate-950/85 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-10 backdrop-blur shadow-md">
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
            className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-yellow-300 px-3 py-1.5 rounded-lg border border-slate-600 cursor-pointer shadow transition-all hover:scale-105 active:scale-95"
          >
            🃏 VIEW CARDS ({activeFullDeck.length})
          </button>
        </div>
      </header>

      {/* 5v5 Battlefield Stage */}
      <main className="flex-1 flex flex-col justify-around py-4 px-2 md:px-8 relative overflow-hidden">
        {/* Playroom Braided Battle Rug & Arena Field */}
        <div className="absolute inset-x-4 md:inset-x-12 inset-y-4 rounded-[40px] bg-gradient-to-b from-indigo-950/70 via-purple-950/30 to-amber-950/20 border-4 border-amber-600/40 shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] pointer-events-none flex flex-col justify-between items-center p-4">
          {/* Top Toy Shelf Decorative Trim */}
          <div className="w-full flex justify-between items-center text-xs opacity-40 px-6 font-pixel text-yellow-200">
            <span>🧸 🪆 🤖 🦕</span>
            <span className="tracking-widest text-[9px]">★ PLUSH ARENA ★</span>
            <span>⭐ 🚂 🚀 🎨</span>
          </div>

          {/* Center Arena Stitched Ring */}
          <div className="w-48 h-48 md:w-72 md:h-72 rounded-full border-2 border-dashed border-yellow-500/20 flex items-center justify-center">
            <span className="text-5xl opacity-15">⚔️</span>
          </div>

          {/* Bottom Shelf Floor Trim */}
          <div className="w-full flex justify-between items-center text-xs opacity-40 px-6 font-pixel text-yellow-200">
            <span>🪡 🧵 🍪 🥛</span>
            <span className="text-[9px]">BEN&apos;S ROOM</span>
            <span>✨ 🧦 📦 🌟</span>
          </div>
        </div>

        {/* ENEMY / PLAYER 2 FIELD (Top Half) */}
        <div className="flex flex-col items-center relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-pixel text-[10px] text-red-400 font-bold tracking-wide">
              {gameMode === 'two_player' ? 'PLAYER 2 (TEAM BLUE)' : 'OPPOSING STUFFIES (5v5)'}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 md:gap-6 justify-items-center w-full max-w-4xl bg-slate-900/60 p-3 rounded-2xl border border-red-950/60 shadow-inner backdrop-blur-sm">
            {enemyTeam.map((stuffy) => {
              const isTargetable =
                selectedCard &&
                (selectedCard.target === 'single_enemy' ||
                  selectedCard.target === 'all_enemies' ||
                  selectedCard.type === 'attack' ||
                  (activeSide === 'p2' && selectedCard.target === 'single_ally'));

              const isAttacking = activeAttackAnimation?.attackerId === stuffy.instanceId;
              const isTakingDamage = activeAttackAnimation?.targetId === stuffy.instanceId;
              const isSelectedTarget = selectedTargetId === stuffy.instanceId;

              return (
                <div
                  key={stuffy.instanceId}
                  onClick={() => selectTarget(stuffy.instanceId)}
                  className={`flex flex-col items-center gap-1 cursor-pointer p-1.5 rounded-2xl transition-all duration-200 ${
                    isSelectedTarget
                      ? 'bg-red-500/25 ring-2 ring-red-400 scale-105'
                      : isTargetable && !stuffy.isUnstuffed
                      ? 'hover:bg-red-500/15 hover:scale-105'
                      : 'hover:scale-102'
                  }`}
                >
                  <HealthBar stuffy={stuffy} />
                  <StuffySprite
                    stuffy={stuffy}
                    size={80}
                    isEnemy={true}
                    isAttacking={isAttacking}
                    isTakingDamage={isTakingDamage}
                    highlightTarget={Boolean(isTargetable && !stuffy.isUnstuffed)}
                  />
                  {isTargetable && !stuffy.isUnstuffed && (
                    <span className="font-pixel text-[8px] bg-red-600/90 text-white px-2 py-0.5 rounded-full border border-red-300 shadow animate-pulse">
                      🎯 ATTACK
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Battlefield Divider with Combat Logs & Ranged Projectile FX */}
        <div className="w-full flex flex-col justify-center items-center py-1 relative z-10">
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

          <div className="w-full max-w-2xl bg-black/50 border border-slate-800 rounded-lg px-4 py-1.5 flex items-center justify-between text-xs font-mono text-slate-300 overflow-hidden shadow-inner backdrop-blur-sm">
            <span className="text-amber-400 font-bold font-pixel text-[10px] mr-2">LOG:</span>
            <span className="truncate flex-1 text-left text-[11px]">
              {combatLogs[0]?.text || 'Combat ready. Choose a card to deploy fluff power!'}
            </span>
          </div>
        </div>

        {/* PLAYER / PLAYER 1 FIELD (Bottom Half) */}
        <div className="flex flex-col items-center relative z-10">
          <div className="grid grid-cols-5 gap-2 md:gap-6 justify-items-center w-full max-w-4xl bg-slate-900/60 p-3 rounded-2xl border border-emerald-950/60 shadow-inner backdrop-blur-sm">
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
              const isSelectedTarget = selectedTargetId === stuffy.instanceId;

              return (
                <div
                  key={stuffy.instanceId}
                  onClick={() => selectTarget(stuffy.instanceId)}
                  className={`flex flex-col items-center gap-1 cursor-pointer p-1.5 rounded-2xl transition-all duration-200 ${
                    isSelectedTarget
                      ? 'bg-emerald-500/25 ring-2 ring-emerald-400 scale-105'
                      : isTargetable
                      ? 'hover:bg-emerald-500/15 hover:scale-105'
                      : 'hover:scale-102'
                  }`}
                >
                  <StuffySprite
                    stuffy={stuffy}
                    size={80}
                    isFacingLeft={true}
                    isEnemy={false}
                    isAttacking={isAttacking}
                    isTakingDamage={isTakingDamage}
                    highlightTarget={Boolean(isTargetable)}
                  />
                  <HealthBar stuffy={stuffy} />
                  {isTargetable && (
                    <span className="font-pixel text-[8px] bg-emerald-600/90 text-white px-2 py-0.5 rounded-full border border-emerald-300 shadow animate-pulse">
                      💖 TARGET
                    </span>
                  )}
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

      {/* Bottom Controls: Crackers Meter, Hand & Action Button */}
      <footer className="w-full bg-slate-950/95 border-t border-slate-800 flex flex-col items-center pb-2 z-20 backdrop-blur">
        <div className="w-full max-w-4xl flex items-center justify-between px-6 pt-2">
          <CrackersMeter
            currentCrackers={currentCrackers}
            maxCrackers={maxCrackers}
            onEndTurn={endTurn}
            isPlayerTurn={battleResult === 'ongoing' && !showEnemyTurnReview}
          />

          {/* Action Button: Visible whenever a card is selected so players can tap directly to play! */}
          {selectedCardIndex !== null && selectedCard && (
            <button
              onClick={() => playCard(selectedCardIndex, selectedTargetId || undefined)}
              className="font-pixel text-xs bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl border-2 border-yellow-300 shadow-xl shadow-yellow-500/40 animate-pulse cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              ▶ PLAY {selectedCard.name.toUpperCase()} (🍪{selectedCard.cost}) ➔
            </button>
          )}

          <div className="text-right font-pixel text-[10px] text-slate-400">
            <div>CARDS IN HAND: {activeHand.length}/5</div>
            <div className="text-yellow-400">
              {selectedCard ? 'TAP "PLAY" OR CLICK ENEMY' : 'CLICK CARD TO SELECT'}
            </div>
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

      {/* ALEX'S S-TIER STROKENOSIS MIND CONTROL MODAL */}
      {strokenosisActive && strokenosisCards.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 border-4 border-pink-500 rounded-3xl p-6 md:p-8 max-w-2xl w-full text-center shadow-2xl shadow-pink-500/20 animate-scaleUp">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl animate-bounce">🧠</span>
              <h2 className="font-pixel text-lg md:text-2xl text-pink-400 font-bold tracking-wider">
                STROKENOSIS: MIND CONTROL!
              </h2>
            </div>
            <p className="font-pixel text-[10px] md:text-xs text-yellow-300 mb-2">
              Alex durps deep into the opponent&apos;s mind!
            </p>
            <p className="font-sans text-xs text-slate-300 mb-6 max-w-md mx-auto leading-relaxed">
              You know which Stuffy owns each card and its Tier, but you do NOT know what the card is.
              Choose 1 card to reveal and force-play against them!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {strokenosisCards.map((card, idx) => {
                const owner = card.stuffyId ? STUFFY_MAP.get(card.stuffyId) : undefined;
                const tierStyle = TIER_COLORS[card.tier] || TIER_COLORS.C;

                return (
                  <div
                    key={`${card.id}_${idx}`}
                    onClick={() => resolveStrokenosis(idx)}
                    className={`bg-slate-950 border-2 ${tierStyle.border} ${tierStyle.glow} hover:scale-105 active:scale-95 transition-all p-3 rounded-2xl flex flex-col justify-between items-center text-center cursor-pointer shadow-lg`}
                  >
                    {/* Owner Icon & Name */}
                    <div className="w-12 h-12 mb-1 flex items-center justify-center">
                      {owner ? (
                        <StuffySprite
                          stuffy={{
                            instanceId: `strokenosis_${owner.id}`,
                            speciesId: owner.id,
                            name: owner.name,
                            maxHp: owner.baseHp,
                            currentHp: owner.baseHp,
                            shield: 0,
                            isUnstuffed: false,
                            statusEffects: [],
                          }}
                          size={44}
                        />
                      ) : (
                        <span className="text-2xl">⚡</span>
                      )}
                    </div>

                    <span className="font-pixel text-[10px] text-yellow-300 font-bold truncate max-w-full">
                      {owner?.name || 'Stuffy'}
                    </span>

                    {/* Mystery Card Face */}
                    <div className="my-2 bg-purple-950/80 border border-purple-500/50 rounded-xl p-2 w-full flex flex-col items-center justify-center">
                      <span className="text-2xl animate-pulse">❓</span>
                      <span className="font-pixel text-[9px] text-pink-300 mt-1">
                        SECRET CARD
                      </span>
                    </div>

                    {/* Tier Ribbon */}
                    <div className={`px-2 py-0.5 rounded text-[9px] font-pixel font-bold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border} w-full`}>
                      {card.tier}-TIER
                    </div>

                    <span className="font-pixel text-[8px] text-emerald-400 mt-2 animate-pulse">
                      CLICK TO PLAY ➔
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
