'use client';

import React, { useState } from 'react';
import { useCombatStore } from '@/store/combatStore';
import { useCampaignStore } from '@/store/campaignStore';
import { StuffySprite } from './StuffySprite';
import { HealthBar } from './HealthBar';
import { CardHand } from './CardHand';
import { CardView, TIER_COLORS } from './CardView';
import { CrackersMeter } from './CrackersMeter';
import { PrivacyCover } from './PrivacyCover';
import { STUFFY_MAP, ALL_STUFFIES } from '@/data/stuffies';
import { sound } from '@/utils/audio';
import { recordCombatForfeitedOrLost } from '@/utils/playerStats';
import { StuffyState, Card, MultiplayerPlayerData } from '@/types/game';
import { OnlineCombatState } from '@/app/api/online/route';
import { onlineNetwork } from '@/utils/onlineNetwork';
import StatsModal from '@/components/common/StatsModal';
import { unlockAdvancement } from '@/utils/advancements';

const BG_THEMES = {
  moonlit_glade: {
    name: '🌙 Moonlit Glade',
    bgColor: '#090a16',
    bgImage: `
      radial-gradient(ellipse at 50% 15%, rgba(147, 197, 253, 0.22) 0%, transparent 65%),
      radial-gradient(circle at 80% 20%, rgba(250, 204, 21, 0.15) 0%, transparent 30%),
      repeating-linear-gradient(0deg, #0e122b 0px, #0e122b 44px, #070919 44px, #070919 46px)
    `,
  },
  candy_stash: {
    name: '🍬 Secret Candy Stash',
    bgColor: '#2a0e1e',
    bgImage: `
      radial-gradient(ellipse at 50% 20%, rgba(244, 114, 182, 0.25) 0%, transparent 70%),
      radial-gradient(circle at 20% 40%, rgba(236, 72, 153, 0.18) 0%, transparent 40%),
      repeating-linear-gradient(45deg, #38122a 0px, #38122a 20px, #2a0e1e 20px, #2a0e1e 40px)
    `,
  },
  slumber_den: {
    name: '💤 Deep Slumber Den',
    bgColor: '#1c130d',
    bgImage: `
      radial-gradient(ellipse at 50% 25%, rgba(245, 158, 11, 0.2) 0%, transparent 65%),
      radial-gradient(circle at 75% 75%, rgba(180, 83, 9, 0.15) 0%, transparent 50%),
      repeating-linear-gradient(0deg, #24170f 0px, #24170f 36px, #170d07 36px, #170d07 38px)
    `,
  },
  prickly_thicket: {
    name: '🦔 Prickly Briar Thicket',
    bgColor: '#081711',
    bgImage: `
      radial-gradient(ellipse at 50% 20%, rgba(16, 185, 129, 0.18) 0%, transparent 65%),
      radial-gradient(circle at 30% 60%, rgba(5, 150, 105, 0.15) 0%, transparent 45%),
      repeating-linear-gradient(135deg, #0d281e 0px, #0d281e 25px, #07150e 25px, #07150e 50px)
    `,
  },
  classic_quilt: {
    name: '🧵 Classic Quilt',
    bgColor: '#0f0c1b',
    bgImage: `
      radial-gradient(ellipse at 50% 30%, rgba(79, 70, 229, 0.18) 0%, transparent 70%),
      repeating-linear-gradient(0deg, #171328 0px, #171328 44px, #0e0a1b 44px, #0e0a1b 46px)
    `,
  },
};

interface BattleArenaProps {
  onBattleEnd?: (result: 'victory' | 'defeat') => void;
  onOpenSettings?: () => void;
  isSpectator?: boolean;
  onLeaveSpectator?: () => void;
  roomId?: string;
  onlineCombatState?: OnlineCombatState;
  onOnlineCardPlay?: (cardIndex: number, targetId?: string) => Promise<void>;
  onOnlineEndTurn?: () => Promise<void>;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  onBattleEnd,
  onOpenSettings,
  isSpectator = false,
  onLeaveSpectator,
  roomId,
  onlineCombatState,
  onOnlineCardPlay,
  onOnlineEndTurn,
}) => {
  const {
    gameMode,
    isTestMode,
    activeSide,
    currentCrackers,
    maxCrackers,
    playerTeam,
    enemyTeam,
    playerBench,
    multiplayerPlayers,
    playerCount,
    playerDeck,
    enemyDeck,
    playerHand,
    enemyHand,
    selectedCardIndex,
    selectedTargetId,
    selectCard,
    deselectCard,
    discardCard,
    selectTarget,
    playCard,
    endTurn,
    swapBenchedStuffy,
    privacyCoverActive,
    dismissPrivacyCover,
    battleResult,
    combatLogs,
    activeAttackAnimation,
    allieDeathRollHeal,
    recentEnemyActions,
    showEnemyTurnReview,
    dismissEnemyTurnReview,
    recentMultiplayerActions,
    showMultiplayerTurnReview,
    dismissMultiplayerTurnReview,
    localPlayerId,
    strokenosisActive,
    strokenosisCards,
    resolveStrokenosis,
    historySnapshot,
    undoLastAction,
    toggleGeorgeMode,
    georgeSwappedThisTurn,
    awakenBigBear,
    restartTestBattle,
  } = useCombatStore();

  const campaign = useCampaignStore();
  const currentNode = campaign.nodes.find((n) => n.id === campaign.currentNodeId);
  const isFinalBossBattle =
    gameMode === 'campaign' &&
    (currentNode?.type === 'boss' || campaign.currentFloor >= campaign.totalFloors);

  const [arenaBg, setArenaBg] = useState<keyof typeof BG_THEMES>('moonlit_glade');
  const [viewingDeckModal, setViewingDeckModal] = useState(false);
  const [swappingBenchIndex, setSwappingBenchIndex] = useState<number | null>(null);
  const [statsModalTab, setStatsModalTab] = useState<'stats' | 'advancements' | null>(null);

  // Animated Turn Review & "Your Turn" Action Stage States
  const [activeEnemyReviewIdx, setActiveEnemyReviewIdx] = useState(0);
  const [activeMultiReviewIdx, setActiveMultiReviewIdx] = useState(0);
  const [isReviewActionPlaying, setIsReviewActionPlaying] = useState(false);
  const [showYourTurnBanner, setShowYourTurnBanner] = useState(false);

  const triggerYourTurnBanner = () => {
    setShowYourTurnBanner(true);
    sound.playRewardSound();
    sound.playClawSlashSound();
    setTimeout(() => sound.playLaserShootSound(), 300);
    setTimeout(() => sound.playFartSound(), 600);
    setTimeout(() => setShowYourTurnBanner(false), 2200);
  };

  const isMultiplayer = gameMode === 'two_player' || gameMode === 'multiplayer';

  // In online multiplayer (roomId present), perspective ALWAYS stays locked to your assigned localPlayerId.
  // In local pass-and-play hotseat (!roomId), the device is physically passed between players,
  // so the player holding the device is whoever's turn it is (activeSide).
  const effectiveLocalPlayerId = (roomId ? localPlayerId : activeSide) || 'p1';

  // Local player (YOU / Person currently holding the device)
  const myPlayer = isMultiplayer
    ? multiplayerPlayers.find((p) => p.id === effectiveLocalPlayerId) || multiplayerPlayers[0]
    : null;

  // Active turn player
  const activeMultiplayerPlayer = isMultiplayer
    ? multiplayerPlayers.find((p) => p.id === activeSide) || multiplayerPlayers[0]
    : null;

  const isMyTurn = !isMultiplayer || (roomId ? activeSide === (myPlayer?.id || 'p1') : true);

  // Active Hand: ALWAYS YOUR HAND!
  const activeHand = isMultiplayer
    ? myPlayer?.hand || playerHand
    : playerHand;

  // Active Bench: ALWAYS YOUR BENCH!
  const activeBench = isMultiplayer
    ? myPlayer?.bench || []
    : playerBench || [];

  // Active Squad (Bottom): ALWAYS YOUR SQUAD!
  const bottomTeam = isMultiplayer
    ? myPlayer?.team || playerTeam
    : playerTeam;

  const bottomLabel = isMultiplayer
    ? `${myPlayer?.name || 'YOU'} (YOUR SQUAD)`
    : 'YOUR STUFFY PARTY (5v5)';

  // Calculate Opponents in Relative Table Order from YOUR perspective (myIdx):
  // 3-Player: Left Opponent, Middle (Yours), Right Opponent
  // 4-Player: Left Opponent, Ahead Opponent, Right Opponent, Bottom (Yours)
  let aheadOpponent: MultiplayerPlayerData | null = null;
  let rightOpponent: MultiplayerPlayerData | null = null;
  let leftOpponent: MultiplayerPlayerData | null = null;

  if (isMultiplayer && multiplayerPlayers.length > 0) {
    const myIdx = Math.max(0, multiplayerPlayers.findIndex((p) => p.id === (myPlayer?.id || 'p1')));
    const total = multiplayerPlayers.length;

    if (total === 2) {
      aheadOpponent = multiplayerPlayers[(myIdx + 1) % 2];
    } else if (total === 3) {
      leftOpponent = multiplayerPlayers[(myIdx + 1) % 3];
      rightOpponent = multiplayerPlayers[(myIdx + 2) % 3];
      aheadOpponent = null;
    } else if (total === 4) {
      leftOpponent = multiplayerPlayers[(myIdx + 1) % 4];
      aheadOpponent = multiplayerPlayers[(myIdx + 2) % 4];
      rightOpponent = multiplayerPlayers[(myIdx + 3) % 4];
    }
  }

  // Synchronize local combat store with authoritative online combat state
  React.useEffect(() => {
    if (!onlineCombatState) return;
    useCombatStore.setState({
      activeSide: onlineCombatState.activeSide,
      currentCrackers: onlineCombatState.currentCrackers,
      maxCrackers: onlineCombatState.maxCrackers,
      multiplayerPlayers: onlineCombatState.players,
      combatLogs: onlineCombatState.combatLogs,
      battleResult: onlineCombatState.battleResult,
    });
  }, [onlineCombatState]);

  const handlePlayCard = async (cardIdx: number, targetId?: string) => {
    sound.playCardSound();
    if (roomId && onOnlineCardPlay) {
      await onOnlineCardPlay(cardIdx, targetId);
      deselectCard();
      return;
    }
    playCard(cardIdx, targetId);
  };

  const handleEndTurn = async () => {
    sound.playClickSound();
    deselectCard();
    if (roomId && onOnlineEndTurn) {
      await onOnlineEndTurn();
      return;
    }
    endTurn();
  };

  // USER RULE: Automated Bot Turn Execution in Online / Multiplayer Battles
  React.useEffect(() => {
    if (!isMultiplayer || battleResult !== 'ongoing' || showEnemyTurnReview || showMultiplayerTurnReview) return;
    const isBotTurn = activeMultiplayerPlayer && (activeMultiplayerPlayer.isBot || activeMultiplayerPlayer.name.toLowerCase().includes('bot'));
    if (!isBotTurn) return;

    // In online mode, only host triggers bot turns to prevent duplicate bot actions
    const isHostOrLocal = !roomId || !myPlayer || myPlayer.id === 'p1';
    if (!isHostOrLocal) return;

    const timer = setTimeout(async () => {
      const botHand = activeMultiplayerPlayer.hand;
      const affordableIdx = botHand.findIndex((c) => c.cost <= currentCrackers);

      if (affordableIdx !== -1) {
        const cardToPlay = botHand[affordableIdx];
        let targetId: string | undefined = undefined;
        if (cardToPlay.target === 'single_enemy' || cardToPlay.type === 'attack' || cardToPlay.type === 'debuff') {
          const targetSquad = multiplayerPlayers.find((p) => p.id !== activeMultiplayerPlayer.id && !p.isEliminated);
          const aliveTarget = targetSquad?.team.find((s) => !s.isUnstuffed && s.currentHp > 0);
          targetId = aliveTarget?.instanceId;
        } else if (cardToPlay.target === 'single_ally' || cardToPlay.type === 'heal' || cardToPlay.type === 'defense') {
          const aliveAlly = activeMultiplayerPlayer.team.find((s) => !s.isUnstuffed && s.currentHp > 0);
          targetId = aliveAlly?.instanceId;
        }

        if (roomId && onOnlineCardPlay) {
          await onOnlineCardPlay(affordableIdx, targetId);
        } else {
          playCard(affordableIdx, targetId);
        }
      } else {
        if (roomId && onOnlineEndTurn) {
          await onOnlineEndTurn();
        } else {
          endTurn();
        }
      }
    }, 1100);

    return () => clearTimeout(timer);
  }, [
    isMultiplayer,
    battleResult,
    activeSide,
    currentCrackers,
    activeMultiplayerPlayer,
    showEnemyTurnReview,
    showMultiplayerTurnReview,
    multiplayerPlayers,
    playCard,
    endTurn,
    roomId,
    myPlayer,
    onOnlineCardPlay,
    onOnlineEndTurn,
  ]);

  // Active player deck + hand + discard for full deck viewing
  const activeFullDeck = isMultiplayer
    ? [
        ...(myPlayer?.hand || []),
        ...(myPlayer?.deck || []),
        ...(myPlayer?.discard || []),
      ]
    : [...playerHand, ...playerDeck, ...useCombatStore.getState().playerDiscard];

  const selectedCard = selectedCardIndex !== null ? activeHand[selectedCardIndex] : null;

  // Helper to render an opponent squad
  const renderOpponentSquad = (
    opponent: MultiplayerPlayerData | { name: string; team: StuffyState[] },
    positionLabel: string,
    isCompact: boolean = false
  ) => {
    const isCurrentTurn = 'id' in opponent && (opponent as any).id === activeSide;
    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className={`font-pixel text-[9px] font-bold tracking-wide px-2 py-0.5 rounded-full shadow ${
              isCurrentTurn
                ? 'text-yellow-300 bg-yellow-950/90 border border-yellow-400 ring-2 ring-yellow-400/50 animate-pulse'
                : 'text-red-400 bg-red-950/70 border border-red-800/80'
            }`}
          >
            {opponent.name} [{positionLabel}] {isCurrentTurn && '⚔️ PLAYING'}
          </span>
        </div>

        <div
          className={`p-2 rounded-2xl border shadow-inner backdrop-blur-sm transition-all ${
            isCurrentTurn
              ? 'bg-amber-950/30 border-amber-500/80 ring-2 ring-amber-500/40'
              : 'bg-slate-900/80 border-red-950/80'
          } ${
            isCompact
              ? 'grid grid-cols-3 gap-1 md:gap-1.5 justify-items-center items-center max-w-[210px]'
              : 'flex gap-1.5 md:gap-3 justify-center items-center'
          }`}
        >
          {opponent.team.map((stuffy) => {
            const isTargetable =
              selectedCard &&
              (selectedCard.target === 'single_enemy' ||
                selectedCard.target === 'all_enemies' ||
                selectedCard.type === 'attack');

            const isAttacking = activeAttackAnimation?.attackerId === stuffy.instanceId;
            const isTakingDamage = activeAttackAnimation?.targetId === stuffy.instanceId;
            const isSelectedTarget = selectedTargetId === stuffy.instanceId;

            return (
              <div
                key={stuffy.instanceId}
                onClick={(e) => {
                  e.stopPropagation();
                  selectTarget(stuffy.instanceId);
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer p-0.5 sm:p-1 rounded-xl transition-all duration-200 relative z-30 ${
                  isSelectedTarget
                    ? 'bg-red-500/30 ring-2 ring-red-400 scale-105'
                    : isTargetable && !stuffy.isUnstuffed
                    ? 'hover:bg-red-500/20 hover:scale-105 ring-1 ring-red-400/50'
                    : 'hover:scale-102'
                }`}
              >
                <HealthBar stuffy={stuffy} />
                <StuffySprite
                  stuffy={stuffy}
                  size={isCompact ? 38 : 52}
                  isEnemy={true}
                  isFacingLeft={false}
                  isAttacking={isAttacking}
                  isTakingDamage={isTakingDamage}
                  highlightTarget={Boolean(isTargetable && !stuffy.isUnstuffed)}
                />
                {isTargetable && !stuffy.isUnstuffed && (
                  <span className="font-pixel text-[7px] bg-red-600/90 text-white px-1.5 py-0.5 rounded-full border border-red-300 shadow animate-pulse">
                    🎯 TARGET
                  </span>
                )}
                {stuffy.speciesId === 'george' && (
                  <span
                    className={`font-pixel text-[7px] font-bold px-1.5 py-0.2 rounded-full border shadow mt-0.5 ${
                      stuffy.georgeMode === 'angry'
                        ? 'bg-red-950 text-red-300 border-red-500'
                        : 'bg-blue-950 text-blue-300 border-blue-500'
                    }`}
                  >
                    {stuffy.georgeMode === 'angry' ? '😡 ANGRY' : '😊 HAPPY'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const [combatTurnStartTime, setCombatTurnStartTime] = useState<number>(Date.now());
  const [combatTurnElapsedSec, setCombatTurnElapsedSec] = useState<number>(0);

  React.useEffect(() => {
    setCombatTurnStartTime(Date.now());
    setCombatTurnElapsedSec(0);
  }, [activeSide]);

  React.useEffect(() => {
    if (battleResult !== 'ongoing') return;
    const timer = setInterval(() => {
      setCombatTurnElapsedSec(Math.floor((Date.now() - combatTurnStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [combatTurnStartTime, battleResult]);

  const handleForfeit = async () => {
    sound.playClickSound();
    if (roomId) {
      if (window.confirm('Are you sure you want to resign and concede this online match? Your opponent will be awarded victory.')) {
        recordCombatForfeitedOrLost();
        await onlineNetwork.resignMatch(roomId, myPlayer?.name || 'Player');
        if (onBattleEnd) {
          onBattleEnd('defeat');
        }
      }
    } else {
      if (window.confirm('Are you sure you want to forfeit combat? Your campaign run will be permanently deleted and cannot be recovered.')) {
        recordCombatForfeitedOrLost();
        useCampaignStore.getState().abandonRun();
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('ben_stuffy_saved_campaign_run');
          } catch {}
        }
        if (onBattleEnd) {
          onBattleEnd('defeat');
        }
      }
    }
  };

  const handleForceEndCombat = async () => {
    if (!roomId) return;
    const opponentName = activeMultiplayerPlayer?.name || 'Opponent';
    if (window.confirm(`Force end match and claim victory due to @${opponentName} inactivity/disconnection?`)) {
      sound.playClickSound();
      await onlineNetwork.forceEndMatch(roomId, myPlayer?.name || 'Player', 'Opponent combat timeout');
      if (onBattleEnd) {
        onBattleEnd('victory');
      }
    }
  };

  return (
    <div
      className="relative w-full h-screen flex flex-col justify-between overflow-hidden select-none"
      style={{
        backgroundColor: BG_THEMES[arenaBg].bgColor,
        backgroundImage: BG_THEMES[arenaBg].bgImage,
      }}
    >
      {/* Opponent Inactivity / Disconnect Force-End Banner */}
      {roomId && !isMyTurn && !isSpectator && battleResult === 'ongoing' && combatTurnElapsedSec >= 25 && (
        <div className="w-full bg-amber-950/95 border-b-2 border-amber-500 px-4 py-2 flex items-center justify-between z-40 shadow-xl animate-pulse">
          <div className="flex items-center gap-2 text-amber-200 font-pixel text-xs">
            <span className="text-base">⚠️</span>
            <span>Opponent @{activeMultiplayerPlayer?.name || 'Opponent'} has not acted in {combatTurnElapsedSec}s (appears disconnected).</span>
          </div>
          <button
            onClick={handleForceEndCombat}
            className="font-pixel text-xs bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg border border-yellow-300 shadow cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
          >
            <span>⚡</span>
            <span>FORCE END &amp; CLAIM VICTORY</span>
          </button>
        </div>
      )}

      {/* Spectator Mode Leave Banner */}
      {isSpectator && (
        <div className="w-full bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border-b-2 border-purple-500/80 px-4 py-2 flex items-center justify-between z-40 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">👁️</span>
            <span className="font-pixel text-xs text-purple-200 font-bold tracking-wide">
              LIVE SPECTATOR STREAM
            </span>
          </div>
          {onLeaveSpectator && (
            <button
              onClick={() => {
                sound.playClickSound();
                onLeaveSpectator();
              }}
              className="font-pixel text-[10px] bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-xl border border-red-300 shadow cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>🚪</span>
              <span>LEAVE SPECTATOR</span>
            </button>
          )}
        </div>
      )}

      {/* Top Banner: Mode, Turn, and Battle Status */}
      <header className="w-full bg-slate-950/85 border-b border-slate-800 px-4 py-2 flex items-center justify-between z-30 backdrop-blur shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">🧸</span>
          <h1 className="font-pixel text-xs md:text-sm text-yellow-400 font-bold tracking-wider">
            BEN&apos;S STUFFY CARD BATTLE
          </h1>
          <span className="font-pixel text-[10px] px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/50 text-indigo-300">
            {isMultiplayer ? `${playerCount || 2}-PLAYER TABLE BATTLE` : '5v5 CAMPAIGN'}
          </span>
          {isFinalBossBattle && (
            <span className="font-pixel text-[10px] px-2 py-0.5 rounded bg-red-950 border border-red-500 text-red-300 animate-pulse">
              👑 FINAL BOSS
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isMultiplayer && (
            <div className="font-pixel text-xs font-bold px-3 py-1 rounded border-2 bg-slate-900 text-yellow-300 border-yellow-500 shadow-md">
              TURN: {activeMultiplayerPlayer?.name || activeSide.toUpperCase()}
            </div>
          )}
          {isMultiplayer && (
            <button
              onClick={() => {
                sound.playClickSound();
                useCombatStore.getState().openMultiplayerTurnReview();
              }}
              className="font-pixel text-[10px] bg-indigo-950 hover:bg-indigo-900 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500 cursor-pointer shadow transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
              title="View all previous players' turns and action history"
            >
              <span>📜</span>
              <span>TURN RECAP ({recentMultiplayerActions.length})</span>
            </button>
          )}
          <button
            onClick={() => setViewingDeckModal(true)}
            className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-yellow-300 px-3 py-1.5 rounded-lg border border-slate-600 cursor-pointer shadow transition-all hover:scale-105 active:scale-95"
          >
            🃏 VIEW CARDS ({activeFullDeck.length})
          </button>
          <button
            onClick={handleForfeit}
            className="font-pixel text-[10px] bg-red-950/80 hover:bg-red-900 text-red-300 px-2.5 py-1.5 rounded-lg border border-red-700/80 cursor-pointer shadow transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
            title="Forfeit battle and return to main menu"
          >
            <span>🏳️</span>
            <span className="hidden sm:inline">FORFEIT</span>
          </button>
          <button
            onClick={() => {
              sound.playClickSound();
              setStatsModalTab('stats');
            }}
            className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-yellow-300 px-2.5 py-1.5 rounded-lg border border-slate-600 cursor-pointer shadow transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
            title="View Player Stats"
          >
            <span>📊</span>
            <span className="hidden sm:inline">STATS</span>
          </button>
          <button
            onClick={() => {
              sound.playClickSound();
              setStatsModalTab('advancements');
            }}
            className="font-pixel text-[10px] bg-purple-950/80 hover:bg-purple-900 text-purple-300 px-2.5 py-1.5 rounded-lg border border-purple-700/80 cursor-pointer shadow transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
            title="View Advancements"
          >
            <span>🏆</span>
            <span className="hidden sm:inline">ADVANCEMENTS</span>
          </button>
          <button
            onClick={() => {
              sound.playClickSound();
              const keys: (keyof typeof BG_THEMES)[] = ['moonlit_glade', 'candy_stash', 'slumber_den', 'prickly_thicket', 'classic_quilt'];
              const nextIdx = (keys.indexOf(arenaBg) + 1) % keys.length;
              const nextBg = keys[nextIdx];
              setArenaBg(nextBg);
              if (nextBg === 'moonlit_glade') unlockAdvancement('lunar_pilgrimage');
              if (nextBg === 'candy_stash') unlockAdvancement('secret_room_discovery');
              if (nextBg === 'slumber_den') unlockAdvancement('slumber_sanctuary');
              if (nextBg === 'prickly_thicket') unlockAdvancement('briar_crawler');
            }}
            className="font-pixel text-[10px] bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 px-2.5 py-1.5 rounded-lg border border-indigo-700/80 cursor-pointer shadow transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
            title="Cycle Battle Environment (Moonlit Glade, Candy Stash, Slumber Den, Prickly Thicket, Classic Quilt)"
          >
            <span>{BG_THEMES[arenaBg].name.split(' ')[0]}</span>
            <span className="hidden sm:inline">{BG_THEMES[arenaBg].name.split(' ')[1]}</span>
          </button>
          {onOpenSettings && (
            <button
              onClick={() => {
                sound.playClickSound();
                onOpenSettings();
              }}
              className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-yellow-300 px-2.5 py-1.5 rounded-lg border border-slate-600 cursor-pointer shadow transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
              title="Game Settings"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">SETTINGS</span>
            </button>
          )}
        </div>
      </header>

      {/* TOP BENCH ROW: Positioned at the top of the arena so it is never hidden */}
      {activeBench.length > 0 && (
        <div className="w-full bg-slate-950/95 border-b border-amber-500/40 px-4 py-1.5 flex items-center justify-center gap-3 z-20 backdrop-blur shadow-md">
          <span className="font-pixel text-[9px] text-amber-300 font-bold flex items-center gap-1">
            <span>📦</span> BENCH ({activeBench.length}):
          </span>
          <div className="flex items-center gap-2 overflow-x-auto max-w-2xl py-0.5">
            {activeBench.map((benchedStuffy, bIdx) => (
              <div
                key={benchedStuffy.instanceId}
                className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 shadow-sm"
              >
                <StuffySprite stuffy={benchedStuffy} size={32} />
                <div className="flex flex-col text-left">
                  <span className="font-pixel text-[8px] text-yellow-300 font-bold truncate max-w-[70px]">
                    {benchedStuffy.name}
                  </span>
                  <span className="font-mono text-[7px] text-emerald-400">
                    {benchedStuffy.currentHp}/{benchedStuffy.maxHp} HP
                  </span>
                </div>
                <button
                  onClick={() => setSwappingBenchIndex(bIdx)}
                  className="font-pixel text-[7px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2 py-1 rounded border border-indigo-400 shadow cursor-pointer transition-all hover:scale-105 active:scale-95"
                  title="Swap this benched stuffy onto the battlefield"
                >
                  🔄 SWAP IN
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Arena Battlefield Stage */}
      <main className="flex-1 flex flex-col justify-between py-1.5 px-2 md:px-6 relative overflow-y-auto min-h-0">
        {/* Playroom Braided Battle Rug & Arena Field */}
        <div className="absolute inset-x-2 md:inset-x-8 inset-y-2 rounded-[36px] bg-gradient-to-b from-indigo-950/70 via-purple-950/30 to-amber-950/20 border-4 border-amber-600/40 shadow-[inset_0_0_80px_rgba(0,0,0,0.85)] pointer-events-none flex flex-col justify-between items-center p-3">
          <div className="w-full flex justify-between items-center text-xs opacity-40 px-6 font-pixel text-yellow-200">
            <span>🧸 🪆 🤖 🦕</span>
            <span className="tracking-widest text-[9px]">★ PLUSH ARENA ★</span>
            <span>⭐ 🚂 🚀 🎨</span>
          </div>
          <div className="w-36 h-36 md:w-56 md:h-56 rounded-full border-2 border-dashed border-yellow-500/20 flex items-center justify-center">
            <span className="text-4xl opacity-15">⚔️</span>
          </div>
          <div className="w-full flex justify-between items-center text-xs opacity-40 px-6 font-pixel text-yellow-200">
            <span>🪡 🧵 🍪 🥛</span>
            <span className="text-[9px]">BEN&apos;S ROOM</span>
            <span>✨ 🧦 📦 🌟</span>
          </div>
        </div>

        {/* 3-PLAYER DEDICATED LAYOUT: Left Team, Middle Team (Yours), Right Team */}
        {isMultiplayer && (playerCount === 3 || multiplayerPlayers.length === 3) ? (
          <div className="w-full flex-1 flex flex-col justify-between relative z-10 py-1">
            {/* Top FX Announcement Bar */}
            <div className="w-full flex flex-col items-center justify-center relative min-h-[50px]">
              {activeAttackAnimation && activeAttackAnimation.isRanged && (
                <div className="absolute z-40 pointer-events-none flex flex-col items-center animate-bounce-short">
                  <div className="text-3xl md:text-4xl drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] animate-pulse">
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

              {activeAttackAnimation && !activeAttackAnimation.isRanged && (
                <div className="absolute z-40 pointer-events-none flex flex-col items-center animate-ping">
                  <span className="font-pixel text-xs text-yellow-400 bg-red-950/90 border border-yellow-400 px-3 py-1 rounded-full shadow-lg">
                    🐾 {activeAttackAnimation.cardName.toUpperCase()}!
                  </span>
                </div>
              )}

              <div className="w-full max-w-lg bg-black/60 border border-slate-800 rounded-lg px-3 py-1 flex items-center justify-between text-xs font-mono text-slate-300 overflow-hidden shadow-inner backdrop-blur-sm">
                <span className="text-amber-400 font-bold font-pixel text-[10px] mr-2">LOG:</span>
                <span className="truncate flex-1 text-left text-[11px]">
                  {combatLogs[0]?.text || 'Combat ready. Choose a card to deploy fluff power!'}
                </span>
              </div>
            </div>

            {/* 3-Column Arena Stage: Left Team | Middle (Yours) | Right Team */}
            <div className="w-full flex-1 flex items-center justify-around px-1 md:px-4 gap-2 overflow-x-auto z-30">
              {/* LEFT TEAM */}
              <div className="flex-1 min-w-0 flex justify-center z-30">
                {leftOpponent && renderOpponentSquad(leftOpponent, 'LEFT', true)}
              </div>

              {/* MIDDLE TEAM (YOUR SQUAD) */}
              <div className="flex-1 min-w-0 flex flex-col items-center z-20">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-pixel text-[9px] font-bold tracking-wide text-emerald-400 bg-emerald-950/80 border border-emerald-600/80 px-2.5 py-0.5 rounded-full shadow">
                    ⭐ {bottomLabel} [MIDDLE]
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 md:gap-1.5 justify-items-center items-center bg-slate-900/85 p-2 rounded-2xl border-2 border-emerald-500/60 shadow-lg backdrop-blur-sm max-w-[220px]">
                  {bottomTeam.map((stuffy, fieldIdx) => {
                    const isTargetable =
                      selectedCard &&
                      (selectedCard.target === 'single_ally' ||
                        selectedCard.target === 'all_allies' ||
                        selectedCard.type === 'heal' ||
                        selectedCard.type === 'defense' ||
                        (selectedCard.target === 'unstuffed_ally' && stuffy.isUnstuffed));

                    const isAttacking = activeAttackAnimation?.attackerId === stuffy.instanceId;
                    const isTakingDamage = activeAttackAnimation?.targetId === stuffy.instanceId;
                    const isSelectedTarget = selectedTargetId === stuffy.instanceId;

                    const isGeorge = stuffy.speciesId === 'george';
                    const isBigBear = stuffy.speciesId === 'big_bear';
                    const isAsleep = stuffy.isAsleep !== false;

                    return (
                      <div
                        key={stuffy.instanceId}
                        onClick={() => {
                          if (isTargetable) {
                            selectTarget(stuffy.instanceId);
                          } else if (isGeorge) {
                            toggleGeorgeMode(stuffy.instanceId);
                          } else if (selectedCard && (selectedCard.type === 'attack' || selectedCard.target === 'single_enemy')) {
                            sound.playUndoSound();
                          }
                        }}
                        className={`relative flex flex-col items-center gap-0.5 cursor-pointer p-1 rounded-xl transition-all duration-200 ${
                          allieDeathRollHeal?.stuffyId === stuffy.instanceId
                            ? 'ring-4 ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.9)] scale-105'
                            : isSelectedTarget
                            ? 'bg-emerald-500/30 ring-2 ring-emerald-400 scale-105'
                            : isTargetable
                            ? 'hover:bg-emerald-500/20 hover:scale-105'
                            : 'hover:scale-102'
                        }`}
                      >
                        {allieDeathRollHeal?.stuffyId === stuffy.instanceId && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-40 font-pixel text-[9px] bg-emerald-600/95 border-2 border-emerald-300 text-white font-bold px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/50 animate-bounce flex items-center gap-1 whitespace-nowrap">
                            <span>+{allieDeathRollHeal.heal} HP</span>
                            <span>🐊</span>
                          </div>
                        )}
                        <StuffySprite
                          stuffy={stuffy}
                          size={46}
                          isFacingLeft={true}
                          isEnemy={false}
                          isAttacking={isAttacking}
                          isTakingDamage={isTakingDamage}
                          highlightTarget={Boolean(isTargetable)}
                        />
                        <HealthBar stuffy={stuffy} />
                        {isTargetable && (
                          <span className="font-pixel text-[7px] bg-emerald-600/90 text-white px-1.5 py-0.5 rounded-full border border-emerald-300 shadow animate-pulse">
                            💖 ALLY
                          </span>
                        )}
                        {isGeorge && (
                          <button
                            type="button"
                            disabled={georgeSwappedThisTurn}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!georgeSwappedThisTurn) {
                                toggleGeorgeMode(stuffy.instanceId);
                              }
                            }}
                            className={`font-pixel text-[7px] font-bold px-1.5 py-0.5 rounded-full border shadow transition-transform mt-0.5 flex items-center gap-0.5 ${
                              georgeSwappedThisTurn
                                ? 'opacity-60 cursor-not-allowed bg-slate-900 border-slate-700 text-slate-400'
                                : stuffy.georgeMode === 'angry'
                                ? 'bg-red-950 text-red-300 border-red-500 animate-pulse hover:scale-110 active:scale-95 cursor-pointer'
                                : 'bg-blue-950 text-blue-300 border-blue-500 hover:scale-110 active:scale-95 cursor-pointer'
                            }`}
                            title={georgeSwappedThisTurn ? 'George already changed moods this turn! (1 swap per turn)' : 'Tap to swap between Angry (2x Atk / 0.5x Heal) and Happy (2x Heal / 0.5x Atk)'}
                          >
                            <span>{stuffy.georgeMode === 'angry' ? '😡 ANGRY' : '😊 HAPPY'}</span>
                            <span className="text-[5px] opacity-75">{georgeSwappedThisTurn ? 'LOCKED' : 'TAP'}</span>
                          </button>
                        )}
                        {isBigBear && (
                          <button
                            type="button"
                            disabled={!isAsleep || (!isTestMode && currentCrackers < 3)}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isAsleep && (isTestMode || currentCrackers >= 3)) {
                                awakenBigBear(stuffy.instanceId);
                              }
                            }}
                            className={`font-pixel text-[7px] font-bold px-1.5 py-0.5 rounded-full border shadow transition-transform mt-0.5 flex items-center gap-0.5 ${
                              !isAsleep
                                ? 'bg-amber-900 text-yellow-300 border-yellow-400'
                                : isTestMode || currentCrackers >= 3
                                ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 border-yellow-300 animate-bounce cursor-pointer hover:scale-110 active:scale-95'
                                : 'opacity-60 bg-slate-900 border-slate-700 text-slate-400 cursor-not-allowed'
                            }`}
                            title={
                              !isAsleep
                                ? 'Big Bear is AWAKE!'
                                : isTestMode
                                ? 'Awaken Big Bear (Free in Test Mode)!'
                                : currentCrackers >= 3
                                ? 'Spend 3 Crackers to AWAKEN Big Bear!'
                                : 'Need 3 Crackers to awaken Big Bear (asleep: +15 Shield, +5 HP/turn)'
                            }
                          >
                            <span>{isAsleep ? (isTestMode ? '💤 WAKE (FREE)' : '💤 WAKE (3🍪)') : '🐻 AWAKE'}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT TEAM */}
              <div className="flex-1 min-w-0 flex justify-center">
                {rightOpponent && renderOpponentSquad(rightOpponent, 'RIGHT', true)}
              </div>
            </div>
          </div>
        ) : (
          /* STANDARD 2-PLAYER, 4-PLAYER, AND CAMPAIGN LAYOUT */
          <>
            {/* TOP / AHEAD OPPONENT FIELD */}
            <div className="w-full flex justify-center relative z-10">
              {aheadOpponent ? (
                renderOpponentSquad(aheadOpponent, 'AHEAD', false)
              ) : (
                renderOpponentSquad({ name: 'OPPOSING STUFFIES', team: enemyTeam }, 'AHEAD', false)
              )}
            </div>

            {/* MIDDLE SECTION: Left Opponent + Center Logs & FX + Right Opponent */}
            <div className="w-full flex items-center justify-between px-1 md:px-4 relative z-30 my-1">
              {/* LEFT OPPONENT (In 4-Player mode) */}
              <div className="w-auto flex justify-start z-30">
                {leftOpponent && renderOpponentSquad(leftOpponent, 'LEFT', true)}
              </div>

              {/* CENTER: Attack FX & Combat Log */}
              <div className="flex-1 flex flex-col items-center justify-center relative mx-2 z-20">
                {activeAttackAnimation && activeAttackAnimation.isRanged && (
                  <div className="absolute z-40 pointer-events-none flex flex-col items-center animate-bounce-short">
                    <div className="text-3xl md:text-4xl drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] animate-pulse">
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

                {activeAttackAnimation && !activeAttackAnimation.isRanged && (
                  <div className="absolute z-40 pointer-events-none flex flex-col items-center animate-ping">
                    <span className="font-pixel text-xs text-yellow-400 bg-red-950/90 border border-yellow-400 px-3 py-1 rounded-full shadow-lg">
                      🐾 {activeAttackAnimation.cardName.toUpperCase()}!
                    </span>
                  </div>
                )}

                <div className="w-full max-w-lg bg-black/60 border border-slate-800 rounded-lg px-3 py-1 flex items-center justify-between text-xs font-mono text-slate-300 overflow-hidden shadow-inner backdrop-blur-sm">
                  <span className="text-amber-400 font-bold font-pixel text-[10px] mr-2">LOG:</span>
                  <span className="truncate flex-1 text-left text-[11px]">
                    {combatLogs[0]?.text || 'Combat ready. Choose a card to deploy fluff power!'}
                  </span>
                </div>
              </div>

              {/* RIGHT OPPONENT (In 4-Player mode) */}
              <div className="w-auto flex justify-end z-30">
                {rightOpponent && renderOpponentSquad(rightOpponent, 'RIGHT', true)}
              </div>
            </div>

            {/* BOTTOM SECTION: Active Player Field (Positioned cleanly above cards with guaranteed visibility) */}
            <div className="flex flex-col items-center relative z-20 mb-2 shrink-0">
              <div className="flex flex-wrap gap-2 md:gap-3 justify-center items-center w-full max-w-xl md:max-w-2xl bg-slate-900/85 p-2 rounded-2xl border-2 border-emerald-500/30 shadow-xl backdrop-blur-md">
                {bottomTeam.map((stuffy, fieldIdx) => {
                  const isTargetable =
                    selectedCard &&
                    (selectedCard.target === 'single_ally' ||
                      selectedCard.target === 'all_allies' ||
                      selectedCard.type === 'heal' ||
                      selectedCard.type === 'defense' ||
                      (selectedCard.target === 'unstuffed_ally' && stuffy.isUnstuffed));

                  const isAttacking = activeAttackAnimation?.attackerId === stuffy.instanceId;
                  const isTakingDamage = activeAttackAnimation?.targetId === stuffy.instanceId;
                  const isSelectedTarget = selectedTargetId === stuffy.instanceId;

                  const isGeorge = stuffy.speciesId === 'george';
                  const isBigBear = stuffy.speciesId === 'big_bear';
                  const isAsleep = stuffy.isAsleep !== false;

                  return (
                    <div
                      key={stuffy.instanceId}
                      onClick={() => {
                        if (isTargetable) {
                          selectTarget(stuffy.instanceId);
                        } else if (isGeorge) {
                          toggleGeorgeMode(stuffy.instanceId);
                        } else if (selectedCard && (selectedCard.type === 'attack' || selectedCard.target === 'single_enemy')) {
                          sound.playUndoSound();
                        }
                      }}
                      className={`relative flex flex-col items-center gap-0.5 cursor-pointer p-1 rounded-xl transition-all duration-200 ${
                        allieDeathRollHeal?.stuffyId === stuffy.instanceId
                          ? 'ring-4 ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.9)] scale-105'
                          : isSelectedTarget
                          ? 'bg-emerald-500/30 ring-2 ring-emerald-400 scale-105'
                          : isTargetable
                          ? 'hover:bg-emerald-500/20 hover:scale-105'
                          : 'hover:scale-102'
                      }`}
                    >
                      {allieDeathRollHeal?.stuffyId === stuffy.instanceId && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-40 font-pixel text-[9px] bg-emerald-600/95 border-2 border-emerald-300 text-white font-bold px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/50 animate-bounce flex items-center gap-1 whitespace-nowrap">
                          <span>+{allieDeathRollHeal.heal} HP</span>
                          <span>🐊</span>
                        </div>
                      )}
                      <HealthBar stuffy={stuffy} />
                      <StuffySprite
                        stuffy={stuffy}
                        size={56}
                        isFacingLeft={true}
                        isEnemy={false}
                        isAttacking={isAttacking}
                        isTakingDamage={isTakingDamage}
                        highlightTarget={Boolean(isTargetable)}
                      />
                      {isTargetable && (
                        <span className="font-pixel text-[7px] bg-emerald-600/90 text-white px-1.5 py-0.5 rounded-full border border-emerald-300 shadow animate-pulse">
                          💖 ALLY
                        </span>
                      )}
                      {isGeorge && (
                        <button
                          type="button"
                          disabled={georgeSwappedThisTurn}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!georgeSwappedThisTurn) {
                              toggleGeorgeMode(stuffy.instanceId);
                            }
                          }}
                          className={`font-pixel text-[7px] font-bold px-1.5 py-0.5 rounded-full border shadow transition-transform mt-0.5 flex items-center gap-0.5 ${
                            georgeSwappedThisTurn
                              ? 'opacity-60 cursor-not-allowed bg-slate-900 border-slate-700 text-slate-400'
                              : stuffy.georgeMode === 'angry'
                              ? 'bg-red-950 text-red-300 border-red-500 animate-pulse hover:scale-110 active:scale-95 cursor-pointer'
                              : 'bg-blue-950 text-blue-300 border-blue-500 hover:scale-110 active:scale-95 cursor-pointer'
                          }`}
                          title={georgeSwappedThisTurn ? 'George already changed moods this turn! (1 swap per turn)' : 'Tap to swap between Angry (2x Atk / 0.5x Heal) and Happy (2x Heal / 0.5x Atk)'}
                        >
                          <span>{stuffy.georgeMode === 'angry' ? '😡 ANGRY' : '😊 HAPPY'}</span>
                          <span className="text-[5px] opacity-75">{georgeSwappedThisTurn ? 'LOCKED' : 'TAP'}</span>
                        </button>
                      )}
                      {isBigBear && (
                        <button
                          type="button"
                          disabled={!isAsleep || (!isTestMode && currentCrackers < 3)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isAsleep && (isTestMode || currentCrackers >= 3)) {
                              awakenBigBear(stuffy.instanceId);
                            }
                          }}
                          className={`font-pixel text-[7px] font-bold px-1.5 py-0.5 rounded-full border shadow transition-transform mt-0.5 flex items-center gap-0.5 ${
                            !isAsleep
                              ? 'bg-amber-900 text-yellow-300 border-yellow-400'
                              : isTestMode || currentCrackers >= 3
                              ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 border-yellow-300 animate-bounce cursor-pointer hover:scale-110 active:scale-95'
                              : 'opacity-60 bg-slate-900 border-slate-700 text-slate-400 cursor-not-allowed'
                          }`}
                          title={
                            !isAsleep
                              ? 'Big Bear is AWAKE!'
                              : isTestMode
                              ? 'Awaken Big Bear (Free in Test Mode)!'
                              : currentCrackers >= 3
                              ? 'Spend 3 Crackers to AWAKEN Big Bear!'
                              : 'Need 3 Crackers to awaken Big Bear (asleep: +15 Shield, +5 HP/turn)'
                          }
                        >
                          <span>{isAsleep ? (isTestMode ? '💤 WAKE (FREE)' : '💤 WAKE (3🍪)') : '🐻 AWAKE'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="font-pixel text-[10px] font-bold tracking-wide text-emerald-400">
                  {bottomLabel} {isMultiplayer && (isMyTurn ? '⭐ YOUR TURN' : '⏳ OPPONENT TURN')}
                </span>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Bottom Controls: Crackers Meter, Hand & Action Buttons off to the right */}
      <footer className="w-full bg-slate-950/95 border-t border-slate-800 px-3 py-2 z-20 backdrop-blur">
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left Side: Crackers Meter / Test Mode Status & Undo */}
          <div className="flex items-center gap-2 shrink-0">
            {isTestMode ? (
              <div className="flex items-center gap-2 bg-slate-900/95 border-2 border-emerald-500/80 px-3 py-1.5 rounded-2xl shadow-lg">
                <div className="flex flex-col text-left">
                  <span className="font-pixel text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span>🧪</span>
                    <span>TEST MODE</span>
                  </span>
                  <span className="font-pixel text-[7px] text-slate-300">
                    FREE COMBOS • NO CRACKERS
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleEndTurn}
                  disabled={battleResult !== 'ongoing' || showEnemyTurnReview || !isMyTurn}
                  className="font-pixel text-[9px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-xl border border-emerald-300 cursor-pointer shadow transition-all hover:scale-105 active:scale-95"
                >
                  END TURN ➔
                </button>
              </div>
            ) : (
              <CrackersMeter
                currentCrackers={currentCrackers}
                maxCrackers={maxCrackers}
                onEndTurn={handleEndTurn}
                isPlayerTurn={battleResult === 'ongoing' && !showEnemyTurnReview && isMyTurn}
              />
            )}

            {historySnapshot && battleResult === 'ongoing' && !showEnemyTurnReview && isMyTurn && !roomId && (
              <button
                onClick={() => {
                  sound.playClickSound();
                  undoLastAction();
                }}
                className="font-pixel text-xs bg-indigo-900 hover:bg-indigo-800 text-yellow-300 font-bold px-3 py-2 rounded-xl border-2 border-indigo-400 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 animate-pulse"
                title={`Undo playing ${historySnapshot.description}`}
              >
                <span>↩️</span>
                <span>UNDO</span>
              </button>
            )}
          </div>

          {/* Center: Card Hand */}
          <div className="flex-1 flex justify-center items-center min-w-0 overflow-visible">
            <CardHand
              cards={activeHand}
              selectedCardIndex={isMyTurn ? selectedCardIndex : null}
              onSelectCard={isMyTurn ? selectCard : () => {}}
              currentCrackers={isTestMode ? 9999 : currentCrackers}
              disabled={battleResult !== 'ongoing' || showEnemyTurnReview || !isMyTurn}
              activeTeam={bottomTeam}
              isTestMode={isTestMode}
            />
          </div>

          {/* Right Side: Action Buttons Column (Positioned off to the right so cards never cover them) */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-center gap-2 shrink-0 min-w-[160px]">
            {/* Status / Hand info */}
            <div className="text-right font-pixel text-[9px] text-slate-400 hidden sm:block">
              <div>HAND: {activeHand.length} CARDS</div>
              <div className="text-yellow-400 text-[8px] max-w-[150px] truncate">
                {isMyTurn
                  ? selectedCard
                    ? 'READY TO PLAY'
                    : 'SELECT A CARD'
                  : 'OPPONENT TURN'}
              </div>
            </div>

            {/* Waiting for opponent banner */}
            {!isMyTurn && battleResult === 'ongoing' && (
              <div className="font-pixel text-[10px] text-amber-300 bg-slate-900 border border-amber-600/60 px-3 py-1.5 rounded-xl flex items-center gap-1 animate-pulse shadow-lg">
                <span>⏳</span>
                <span>@{activeMultiplayerPlayer?.name || activeSide.toUpperCase()}</span>
              </div>
            )}

            {/* Action Buttons: Visible whenever a card is selected on YOUR turn */}
            {selectedCardIndex !== null && selectedCard && isMyTurn && (
              <div className="flex flex-row md:flex-col items-stretch gap-2 w-full">
                <button
                  onClick={() => handlePlayCard(selectedCardIndex, selectedTargetId || undefined)}
                  className="font-pixel text-xs bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl border-2 border-yellow-300 shadow-xl shadow-yellow-500/40 animate-pulse cursor-pointer hover:scale-105 active:scale-95 transition-all text-center"
                >
                  ▶ PLAY ({selectedCard.cost}🍪)
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      sound.playClickSound();
                      discardCard(selectedCardIndex);
                    }}
                    className="flex-1 font-pixel text-[9px] bg-red-950/80 hover:bg-red-900 text-red-300 font-bold px-2.5 py-1.5 rounded-lg border border-red-700/60 cursor-pointer hover:scale-105 active:scale-95 transition-all text-center"
                    title="Discard this card from hand"
                  >
                    🗑️ DISCARD
                  </button>

                  <button
                    onClick={() => {
                      sound.playClickSound();
                      deselectCard();
                    }}
                    className="flex-1 font-pixel text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1.5 rounded-lg border border-slate-600 cursor-pointer hover:scale-105 active:scale-95 transition-all text-center"
                    title="Deselect card"
                  >
                    ✖ CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* BENCH SWAP MODAL (Positioned at top of screen with clear benched stuffy details) */}
      {swappingBenchIndex !== null && activeBench[swappingBenchIndex] && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-14 p-4 select-none">
          <div className="bg-slate-900 border-4 border-indigo-500 rounded-2xl p-5 max-w-lg w-full text-center shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-center gap-3 bg-slate-950 p-3 rounded-xl border border-indigo-400 mb-3">
              <StuffySprite stuffy={activeBench[swappingBenchIndex]} size={48} />
              <div className="text-left">
                <span className="font-pixel text-xs text-yellow-300 font-bold block">
                  SWAPPING IN: {activeBench[swappingBenchIndex].name.toUpperCase()}
                </span>
                <span className="font-mono text-[10px] text-emerald-400">
                  {activeBench[swappingBenchIndex].currentHp}/{activeBench[swappingBenchIndex].maxHp} HP
                </span>
              </div>
            </div>
            <p className="font-pixel text-[11px] text-slate-200 mb-3">
              Select which active squad member <span className="text-emerald-400 font-bold">{activeBench[swappingBenchIndex].name}</span> will replace:
            </p>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {bottomTeam.map((fieldStuffy, fIdx) => (
                <button
                  key={fieldStuffy.instanceId}
                  onClick={() => {
                    sound.playClickSound();
                    swapBenchedStuffy(fIdx, swappingBenchIndex);
                    setSwappingBenchIndex(null);
                  }}
                  className="flex flex-col items-center bg-slate-950 hover:bg-indigo-950/80 p-2 rounded-xl border border-slate-700 hover:border-indigo-400 transition-all hover:scale-105 cursor-pointer"
                >
                  <StuffySprite stuffy={fieldStuffy} size={48} />
                  <span className="font-pixel text-[8px] text-yellow-300 font-bold truncate max-w-full mt-1">
                    {fieldStuffy.name}
                  </span>
                  <span
                    className={`font-mono text-[8px] ${
                      fieldStuffy.isUnstuffed ? 'text-red-400 font-bold' : 'text-emerald-400'
                    }`}
                  >
                    {fieldStuffy.isUnstuffed ? 'UNSTUFFED' : `${fieldStuffy.currentHp} HP`}
                  </span>
                  <span className="font-pixel text-[7px] text-indigo-300 bg-indigo-950 px-1 py-0.5 rounded mt-1 border border-indigo-700">
                    REPLACE
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSwappingBenchIndex(null)}
              className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-2 rounded-lg border border-slate-600 cursor-pointer"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

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

                    <div className="my-2 bg-purple-950/80 border border-purple-500/50 rounded-xl p-2 w-full flex flex-col items-center justify-center">
                      <span className="text-2xl animate-pulse">❓</span>
                      <span className="font-pixel text-[9px] text-pink-300 mt-1">SECRET CARD</span>
                    </div>

                    <div
                      className={`px-2 py-0.5 rounded text-[9px] font-pixel font-bold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border} w-full`}
                    >
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

      {/* ENEMY TURN REVIEW MODAL */}
      {showEnemyTurnReview && recentEnemyActions.length > 0 && (() => {
        const currentAction = recentEnemyActions[Math.min(activeEnemyReviewIdx, recentEnemyActions.length - 1)] || recentEnemyActions[0];
        const cardLower = (currentAction.cardName || '').toLowerCase();
        const actionType: 'claw' | 'shoot' | 'fart' =
          cardLower.includes('claw') || cardLower.includes('scratch') || cardLower.includes('slash') || cardLower.includes('bite') || cardLower.includes('shred') || cardLower.includes('flick')
            ? 'claw'
            : cardLower.includes('shoot') || cardLower.includes('laser') || cardLower.includes('beam') || cardLower.includes('blast') || cardLower.includes('bolt') || cardLower.includes('arrow')
            ? 'shoot'
            : cardLower.includes('fart') || cardLower.includes('stink') || cardLower.includes('gas') || cardLower.includes('puff') || cardLower.includes('cloud')
            ? 'fart'
            : (activeEnemyReviewIdx % 3 === 0 ? 'claw' : activeEnemyReviewIdx % 3 === 1 ? 'shoot' : 'fart');

        const attackerSpecies = ALL_STUFFIES.find((s) => s.name.toLowerCase() === (currentAction.enemyName || '').toLowerCase()) || ALL_STUFFIES[0];
        const targetSpecies = ALL_STUFFIES.find((s) => s.name.toLowerCase() === (currentAction.targetName || '').toLowerCase()) || ALL_STUFFIES[1];

        const attackerStuffyState: StuffyState = {
          instanceId: 'rev_att',
          speciesId: attackerSpecies.id,
          name: attackerSpecies.name,
          maxHp: attackerSpecies.baseHp,
          currentHp: attackerSpecies.baseHp,
          shield: 0,
          isUnstuffed: false,
          statusEffects: [],
        };

        const targetStuffyState: StuffyState = {
          instanceId: 'rev_tar',
          speciesId: targetSpecies.id,
          name: targetSpecies.name,
          maxHp: targetSpecies.baseHp,
          currentHp: targetSpecies.baseHp,
          shield: 0,
          isUnstuffed: false,
          statusEffects: [],
        };

        const triggerReviewSound = (idx: number) => {
          setIsReviewActionPlaying(true);
          const act = recentEnemyActions[idx] || recentEnemyActions[0];
          const name = (act.cardName || '').toLowerCase();
          if (name.includes('shoot') || name.includes('laser') || name.includes('beam') || idx % 3 === 1) {
            sound.playLaserShootSound();
          } else if (name.includes('fart') || name.includes('stink') || name.includes('gas') || idx % 3 === 2) {
            sound.playFartSound();
          } else {
            sound.playClawSlashSound();
          }
          setTimeout(() => setIsReviewActionPlaying(false), 350);
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
            <div className="bg-slate-900 border-4 border-red-500 rounded-2xl p-5 md:p-6 max-w-lg w-full text-center shadow-2xl animate-scaleUp">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl">⚔️</span>
                <h2 className="font-pixel text-lg md:text-xl text-red-400 font-bold">
                  ENEMY TURN ACTIONS
                </h2>
              </div>
              <p className="font-pixel text-[10px] text-slate-300 mb-3">
                Watch the enemy squad move, claw, shoot, and fart!
              </p>

              {/* ACTION ANIMATION STAGE */}
              <div className="bg-slate-950 border-2 border-red-500/50 rounded-2xl p-3 mb-4 relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-pixel text-[9px] text-yellow-300">
                    ACTION {activeEnemyReviewIdx + 1} OF {recentEnemyActions.length}
                  </span>
                  <span className="font-pixel text-[9px] text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
                    {actionType === 'claw' ? '🐾 CLAW ATTACK' : actionType === 'shoot' ? '⚡ LASER SHOT' : '💨 STINK PUFF'}
                  </span>
                </div>

                <div className="flex items-center justify-around h-24 relative">
                  {/* Attacker moving */}
                  <div className={`flex flex-col items-center transition-transform duration-300 ${isReviewActionPlaying ? 'translate-x-5 scale-110' : ''}`}>
                    <div className="w-14 h-14">
                      <StuffySprite stuffy={attackerStuffyState} size={54} />
                    </div>
                    <span className="font-pixel text-[8px] text-yellow-300 mt-0.5 truncate max-w-[80px]">{currentAction.enemyName}</span>
                  </div>

                  {/* Animated Center Effect (Clawing, Shooting, Farting) */}
                  <div className="flex flex-col items-center justify-center relative w-20">
                    {actionType === 'claw' && (
                      <div className="animate-ping flex flex-col items-center">
                        <span className="text-3xl filter drop-shadow">🐾💥</span>
                        <span className="font-pixel text-[8px] text-red-400 font-bold">SLASH!</span>
                      </div>
                    )}
                    {actionType === 'shoot' && (
                      <div className="animate-pulse flex flex-col items-center">
                        <span className="text-3xl filter drop-shadow">🏹⚡⚡</span>
                        <span className="font-pixel text-[8px] text-cyan-300 font-bold">PEW PEW!</span>
                      </div>
                    )}
                    {actionType === 'fart' && (
                      <div className="animate-bounce flex flex-col items-center">
                        <span className="text-3xl filter drop-shadow">💨🤢✨</span>
                        <span className="font-pixel text-[8px] text-emerald-400 font-bold">PUFF!</span>
                      </div>
                    )}
                  </div>

                  {/* Target receiving hit */}
                  <div className={`flex flex-col items-center transition-transform duration-200 ${isReviewActionPlaying ? '-translate-x-2 animate-shake' : ''}`}>
                    <div className="w-14 h-14">
                      <StuffySprite stuffy={targetStuffyState} size={54} isTakingDamage={isReviewActionPlaying} isFacingLeft={true} />
                    </div>
                    <span className="font-pixel text-[8px] text-emerald-400 mt-0.5 truncate max-w-[80px]">{currentAction.targetName}</span>
                    <span className="font-pixel text-[10px] text-red-400 font-bold">💥 -{currentAction.damage}</span>
                  </div>
                </div>

                {/* Step Controls */}
                <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      const next = (activeEnemyReviewIdx - 1 + recentEnemyActions.length) % recentEnemyActions.length;
                      setActiveEnemyReviewIdx(next);
                      triggerReviewSound(next);
                    }}
                    className="font-pixel text-[9px] bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded border border-slate-600 cursor-pointer"
                  >
                    ◀ PREV
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerReviewSound(activeEnemyReviewIdx)}
                    className="font-pixel text-[9px] bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1 rounded border border-amber-400 cursor-pointer"
                  >
                    REPLAY 🔄
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = (activeEnemyReviewIdx + 1) % recentEnemyActions.length;
                      setActiveEnemyReviewIdx(next);
                      triggerReviewSound(next);
                    }}
                    className="font-pixel text-[9px] bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded border border-slate-600 cursor-pointer"
                  >
                    NEXT ▶
                  </button>
                </div>
              </div>

              {/* Action Log List */}
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto mb-4">
                {recentEnemyActions.map((act, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setActiveEnemyReviewIdx(i);
                      triggerReviewSound(i);
                    }}
                    className={`border p-2 rounded-xl flex items-center justify-between text-left cursor-pointer transition-all ${
                      i === activeEnemyReviewIdx
                        ? 'bg-slate-900 border-yellow-400 ring-2 ring-yellow-400/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-pixel text-[11px] text-yellow-300 font-bold">
                        🐾 {act.enemyName} played &ldquo;{act.cardName}&rdquo;
                      </span>
                      <span className="font-sans text-[10px] text-slate-300 mt-0.5">
                        Attacked <span className="text-emerald-400 font-bold">{act.targetName}</span>
                      </span>
                    </div>
                    <div className="font-pixel text-xs text-red-400 font-bold bg-red-950/80 px-2 py-1 rounded border border-red-500/50">
                      💥 -{act.damage}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  dismissEnemyTurnReview();
                  triggerYourTurnBanner();
                }}
                className="font-pixel text-sm bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-8 py-3 rounded-xl border-2 border-yellow-300 shadow-xl cursor-pointer animate-pulse"
              >
                START YOUR TURN 🎮
              </button>
            </div>
          </div>
        );
      })()}

      {/* MULTIPLAYER TURN REVIEW / RECAP MODAL */}
      {showMultiplayerTurnReview && !privacyCoverActive && recentMultiplayerActions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border-4 border-indigo-500 rounded-3xl p-6 max-w-xl w-full text-center shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-3xl">⚔️📜</span>
              <h2 className="font-pixel text-base md:text-lg text-yellow-400 font-bold">
                MULTIPLAYER MATCH ACTION HISTORY
              </h2>
            </div>
            <p className="font-pixel text-[10px] text-slate-300 mb-3">
              Chronological log of all actions taken across all player turns ({recentMultiplayerActions.length} total):
            </p>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto mb-5 pr-1.5">
              {recentMultiplayerActions.map((act, i) => {
                const sideColor =
                  act.playerSide === 'p1'
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300'
                    : act.playerSide === 'p2'
                    ? 'border-blue-500 bg-blue-950/60 text-blue-300'
                    : act.playerSide === 'p3'
                    ? 'border-purple-500 bg-purple-950/60 text-purple-300'
                    : 'border-amber-500 bg-amber-950/60 text-amber-300';

                return (
                  <div
                    key={i}
                    className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-left shadow-sm hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col flex-1 mr-2">
                      <div className="flex items-center gap-2 mb-1">
                        {act.turnNumber && (
                          <span className="font-pixel text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                            ROUND {act.turnNumber}
                          </span>
                        )}
                        <span className={`font-pixel text-[9px] font-bold px-2 py-0.5 rounded-full border ${sideColor}`}>
                          🎮 {act.playerName}
                        </span>
                        <span className="font-pixel text-xs text-yellow-300 font-bold truncate">
                          &ldquo;{act.cardName}&rdquo; ({act.cardTier}-Tier)
                        </span>
                      </div>
                      <span className="font-sans text-[11px] text-slate-300">
                        Target: <span className="text-emerald-400 font-bold">{act.targetName}</span>
                        {act.wasUnstuffed && (
                          <span className="text-red-400 font-bold ml-1.5 animate-pulse bg-red-950/80 px-1.5 py-0.2 rounded border border-red-500">
                            💀 UNSTUFFED!
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400 italic mt-0.5 truncate">
                        {act.effectDescription}
                      </span>
                    </div>
                    {act.damage ? (
                      <div className="font-pixel text-xs text-red-400 font-bold bg-red-950/80 px-2 py-1 rounded border border-red-500/50 whitespace-nowrap">
                        💥 -{act.damage}
                      </div>
                    ) : act.heal ? (
                      <div className="font-pixel text-xs text-emerald-400 font-bold bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/50 whitespace-nowrap">
                        💖 +{act.heal}
                      </div>
                    ) : (
                      <div className="font-pixel text-[9px] text-amber-300 bg-amber-950/60 px-2 py-1 rounded border border-amber-500/40 whitespace-nowrap">
                        ⚡ SPECIAL
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                dismissMultiplayerTurnReview();
                if (isMyTurn) triggerYourTurnBanner();
              }}
              className="font-pixel text-sm bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold px-8 py-3 rounded-xl border-2 border-yellow-300 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              RESUME PLAY 🎮
            </button>
          </div>
        </div>
      )}

      {/* Multiplayer Pass-and-Play Privacy Cover */}
      {privacyCoverActive && (
        <PrivacyCover
          nextPlayerName={activeMultiplayerPlayer?.name || activeSide.toUpperCase()}
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

          <div className="my-4 overflow-y-auto max-h-[75vh] p-2 space-y-4">
            {(['S', 'A', 'B', 'C', 'D', 'F'] as const).map((tier) => {
              const tierCards = activeFullDeck.filter((c) => c.tier === tier);
              if (tierCards.length === 0) return null;
              return (
                <div key={tier} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-800">
                    <span className="font-pixel text-xs font-bold px-2.5 py-0.5 rounded bg-slate-800 text-yellow-300 border border-slate-700">
                      ★ TIER {tier} CARDS ({tierCards.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {tierCards.map((card, idx) => (
                      <CardView key={`${card.id}_${idx}`} card={card} compact={true} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Victory / Defeat Modal */}
      {battleResult !== 'ongoing' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border-4 border-yellow-500 rounded-2xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl animate-scaleUp">
            <span className="text-6xl mb-4 block animate-bounce">
              {battleResult === 'defeat' ? '💀' : isTestMode ? '🥊' : '🏆'}
            </span>
            <h2
              className={`font-pixel text-xl md:text-2xl mb-2 font-bold ${
                battleResult === 'defeat' ? 'text-red-500' : 'text-yellow-400'
              }`}
            >
              {isTestMode
                ? (battleResult === 'defeat' ? 'TEST SQUAD UNSTUFFED!' : '🥊 TEST DUMMIES DEFEATED! 🥊')
                : battleResult === 'p1_victory' && `${multiplayerPlayers.find((p) => p.id === 'p1')?.name || 'PLAYER 1'} WINS! 🏆`}
              {!isTestMode && battleResult === 'p2_victory' && `${multiplayerPlayers.find((p) => p.id === 'p2')?.name || 'PLAYER 2'} WINS! 🏆`}
              {!isTestMode && battleResult === 'p3_victory' && `${multiplayerPlayers.find((p) => p.id === 'p3')?.name || 'PLAYER 3'} WINS! 🏆`}
              {!isTestMode && battleResult === 'p4_victory' && `${multiplayerPlayers.find((p) => p.id === 'p4')?.name || 'PLAYER 4'} WINS! 🏆`}
              {!isTestMode && battleResult === 'victory' &&
                (isFinalBossBattle
                  ? '👑 FINAL BOSS DEFEATED! 👑'
                  : 'CAMPAIGN BATTLE VICTORY!')}
              {!isTestMode && battleResult === 'defeat' && 'ALL STUFFIES DEFEATED!'}
            </h2>
            <p className="font-pixel text-xs text-slate-300 mb-6 leading-relaxed">
              {isTestMode
                ? 'All test dummies were defeated! You can restart the match immediately with your exact team and settings.'
                : battleResult.includes('victory') && isMultiplayer
                ? 'All other players were unstuffed! Champion of the Plush Arena!'
                : battleResult === 'victory' &&
                  !isMultiplayer &&
                  (isFinalBossBattle
                    ? 'YOU CONQUERED ALL FLOORS AND SLAYED THE BOSS! GRAND CAMPAIGN VICTORY!'
                    : 'Your plush squad stood strong and claimed victory!')}
              {!isTestMode && battleResult === 'defeat' &&
                'Your squad lost all their fluff! Time to restitch and try again.'}
            </p>

            {isTestMode ? (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClickSound();
                    restartTestBattle();
                  }}
                  className="font-pixel text-sm bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl border-2 border-cyan-300 shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  RESTART MATCH 🔄
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClickSound();
                    onBattleEnd && onBattleEnd('defeat');
                  }}
                  className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-2.5 rounded-xl border border-slate-600 shadow-md cursor-pointer transition-all hover:scale-105"
                >
                  EXIT TEST MODE ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onBattleEnd && onBattleEnd(battleResult.includes('victory') ? 'victory' : 'defeat')}
                className="font-pixel text-sm bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl border-2 border-yellow-300 shadow-xl cursor-pointer"
              >
                {isFinalBossBattle ? 'CLAIM GRAND VICTORY 👑' : 'CONTINUE ⏭️'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ANIMATED "YOUR TURN" BANNER */}
      {showYourTurnBanner && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
          <div className="bg-slate-950/95 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center shadow-2xl animate-scaleUp pointer-events-auto">
            <div className="flex items-center justify-center gap-3 mb-2 animate-bounce">
              <span className="text-4xl">🐾</span>
              <span className="text-4xl">⚡</span>
              <span className="text-4xl">💨</span>
            </div>
            <h1 className="font-pixel text-2xl md:text-3xl text-yellow-300 font-extrabold tracking-widest drop-shadow-lg animate-pulse">
              ⭐ YOUR TURN! ⭐
            </h1>
            <p className="font-pixel text-xs text-slate-300 mt-2 mb-4">
              Your squad is ready! Moving, clawing, shooting, and farting!
            </p>
            {/* Squad Action Display: Clawing, Shooting, and Farting in unison! */}
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '0ms' }}>
                <span className="text-3xl">🐾💥</span>
                <span className="font-pixel text-[8px] text-red-400 mt-1">CLAW SLASH</span>
              </div>
              <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '150ms' }}>
                <span className="text-3xl">🏹⚡</span>
                <span className="font-pixel text-[8px] text-cyan-300 mt-1">LASER SHOT</span>
              </div>
              <div className="flex flex-col items-center animate-bounce" style={{ animationDelay: '300ms' }}>
                <span className="text-3xl">💨🤢</span>
                <span className="font-pixel text-[8px] text-emerald-400 mt-1">STINK BOMB</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowYourTurnBanner(false)}
              className="mt-4 font-pixel text-xs bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold px-6 py-2 rounded-xl cursor-pointer"
            >
              LET&apos;S GO! 🚀
            </button>
          </div>
        </div>
      )}

      {/* STATS & ADVANCEMENTS OVERLAY */}
      {statsModalTab && (
        <StatsModal
          onClose={() => setStatsModalTab(null)}
          initialTab={statsModalTab}
        />
      )}
    </div>
  );
};
