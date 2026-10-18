'use client';

import React, { useState } from 'react';
import { ALL_STUFFIES, PLAYABLE_STUFFIES, STUFFY_MAP } from '@/data/stuffies';
import { getLoadoutsForStuffy } from '@/data/loadouts';
import { CARD_MAP, PLAYER_POWERUP_CARDS } from '@/data/cards';
import { StuffySpecies, StuffyState, Card, LoadoutPackage, MultiplayerPlayerData, PlayerSide } from '@/types/game';
import { StuffySprite } from '../battle/StuffySprite';
import { CardView, TIER_COLORS } from '../battle/CardView';
import { sound } from '@/utils/audio';

interface TwoPlayerDraftProps {
  playerCount?: number;
  playerNames?: string[];
  initialBanishedIds?: string[];
  localPlayerName?: string;
  isSpectator?: boolean;
  onLeaveDraft?: () => void;
  onDraftComplete: (
    p1Team: any,
    p1Deck?: any,
    p2Team?: any,
    p2Deck?: any,
    reserveStuffies?: any
  ) => void;
  onMultiplayerDraftComplete?: (
    players: MultiplayerPlayerData[],
    reserveStuffies: StuffyState[]
  ) => void;
}

const PLAYER_CONFIGS: { id: PlayerSide; name: string; color: string; border: string; bg: string; text: string }[] = [
  { id: 'p1', name: 'PLAYER 1', color: 'emerald', border: 'border-emerald-400', bg: 'bg-emerald-950/40', text: 'text-emerald-300' },
  { id: 'p2', name: 'PLAYER 2', color: 'blue', border: 'border-blue-400', bg: 'bg-blue-950/40', text: 'text-blue-300' },
  { id: 'p3', name: 'PLAYER 3', color: 'purple', border: 'border-purple-400', bg: 'bg-purple-950/40', text: 'text-purple-300' },
  { id: 'p4', name: 'PLAYER 4', color: 'amber', border: 'border-amber-400', bg: 'bg-amber-950/40', text: 'text-amber-300' },
];

export const TwoPlayerDraft: React.FC<TwoPlayerDraftProps> = ({
  playerCount = 2,
  playerNames,
  initialBanishedIds,
  localPlayerName,
  isSpectator = false,
  onLeaveDraft,
  onDraftComplete,
  onMultiplayerDraftComplete,
}) => {
  const numPlayers = Math.max(2, Math.min(4, playerCount));
  const activePlayerConfigs = PLAYER_CONFIGS.slice(0, numPlayers).map((cfg, idx) => ({
    ...cfg,
    name: playerNames && playerNames[idx] ? playerNames[idx] : cfg.name,
  }));

  // Per user rule:
  // 4-player game: each player drafts 4 stuffies (4 * 4 = 16 stuffies total, all drafted)
  // 3-player game: each player drafts 4 stuffies (3 * 4 = 12 stuffies, 4 in reinforcement pool)
  // 2-player game: each player drafts 5 stuffies (10 drafted, 6 in reinforcement pool)
  const targetPerPlayer = numPlayers === 2 ? 5 : 4;

  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [drafts, setDrafts] = useState<Record<number, { species: StuffySpecies; loadoutId: string }[]>>({
    0: [],
    1: [],
    2: [],
    3: [],
  });
  const [banishedSpeciesIds, setBanishedSpeciesIds] = useState<Set<string>>(
    new Set(initialBanishedIds || [])
  );
  const [selectingSpecies, setSelectingSpecies] = useState<StuffySpecies | null>(null);
  const [inspectingLoadout, setInspectingLoadout] = useState<LoadoutPackage | null>(null);
  const [banishNotification, setBanishNotification] = useState<string | null>(null);
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);

  // Gather all drafted species IDs
  const draftedIds = new Set<string>();
  Object.values(drafts).forEach((list) => {
    list.forEach((item) => draftedIds.add(item.species.id));
  });

  const availableSpecies = PLAYABLE_STUFFIES.filter(
    (s) => !draftedIds.has(s.id) && !banishedSpeciesIds.has(s.id)
  );

  const banishedSpeciesList = PLAYABLE_STUFFIES.filter((s) => banishedSpeciesIds.has(s.id));

  const handleUnbanishStuffy = (speciesId: string) => {
    setBanishedSpeciesIds((prev) => {
      const next = new Set(prev);
      next.delete(speciesId);
      return next;
    });
    const sp = STUFFY_MAP.get(speciesId);
    setBanishNotification(`✨ "${sp?.name || speciesId}" was unbanished and returned to the pool!`);
    setTimeout(() => setBanishNotification(null), 3000);
  };

  const handleUnbanishAll = () => {
    setBanishedSpeciesIds(new Set());
    setBanishNotification(`✨ All banished stuffies were restored to the draft pool!`);
    setTimeout(() => setBanishNotification(null), 3000);
  };

  // Check if draft is finished for all active players
  const isDraftFinished = activePlayerConfigs.every((_, idx) => (drafts[idx]?.length || 0) >= targetPerPlayer);

  const currentCfg = activePlayerConfigs[currentPlayerIdx] || activePlayerConfigs[0];
  const isBotTurn = currentCfg.name.toLowerCase().startsWith('bot ') || currentCfg.name.toLowerCase().includes('bot');
  const isMyTurn = Boolean(
    !isSpectator &&
    (!localPlayerName ||
      currentCfg.name.toLowerCase() === localPlayerName.toLowerCase() ||
      currentCfg.name.startsWith('PLAYER ') ||
      isBotTurn)
  );

  // Auto-draft for Bot Turns
  React.useEffect(() => {
    if (isDraftFinished) return;
    if (isBotTurn) {
      const timer = setTimeout(() => {
        handleRandomFillRemaining(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentPlayerIdx, isDraftFinished, isBotTurn]);

  // RULE: Random Mode for 2-4 Player: fills remaining slots for CURRENT PLAYER ONLY, not other players!
  const handleRandomFillRemaining = (bypassTurnCheck = false) => {
    if (!bypassTurnCheck && !isMyTurn) return;
    const remaining = [...availableSpecies].sort(() => Math.random() - 0.5);
    const updatedDrafts = { ...drafts };
    const currentTeam = [...(updatedDrafts[currentPlayerIdx] || [])];

    while (currentTeam.length < targetPerPlayer && remaining.length > 0) {
      const pickedSpecies = remaining.shift()!;
      const loadouts = getLoadoutsForStuffy(pickedSpecies.id);
      const randomLoadout = loadouts[Math.floor(Math.random() * loadouts.length)] || loadouts[0];
      currentTeam.push({
        species: pickedSpecies,
        loadoutId: randomLoadout.id,
      });
    }
    updatedDrafts[currentPlayerIdx] = currentTeam;
    setDrafts(updatedDrafts);

    // Advance to next player that still needs picks
    let nextIdx = (currentPlayerIdx + 1) % numPlayers;
    let loops = 0;
    while (loops < numPlayers) {
      if ((updatedDrafts[nextIdx]?.length || 0) < targetPerPlayer) {
        break;
      }
      nextIdx = (nextIdx + 1) % numPlayers;
      loops++;
    }

    setCurrentPlayerIdx(nextIdx);
    setSelectingSpecies(null);
    setInspectingLoadout(null);
    sound.playRewardSound();
  };

  const handlePickSpecies = (species: StuffySpecies) => {
    if (!isMyTurn) return;
    setSelectingSpecies(species);
    const loadouts = getLoadoutsForStuffy(species.id);
    setInspectingLoadout(loadouts[0]);
  };

  const handleBanishStuffy = (species: StuffySpecies, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isMyTurn) return;
    setBanishedSpeciesIds((prev) => {
      const next = new Set(prev);
      next.add(species.id);
      return next;
    });
    setBanishNotification(`🗑️ "${species.name}" was banished from the draft pool!`);
    if (selectingSpecies?.id === species.id) {
      setSelectingSpecies(null);
      setInspectingLoadout(null);
    }
    setTimeout(() => setBanishNotification(null), 3000);
  };

  const handleConfirmLoadout = (loadoutId: string) => {
    if (!selectingSpecies) return;

    const currentList = drafts[currentPlayerIdx] || [];
    const updatedList = [...currentList, { species: selectingSpecies, loadoutId }];

    const nextDrafts = {
      ...drafts,
      [currentPlayerIdx]: updatedList,
    };
    setDrafts(nextDrafts);

    // Advance to next player that still needs picks
    let nextIdx = (currentPlayerIdx + 1) % numPlayers;
    let loops = 0;
    while (loops < numPlayers) {
      if ((nextDrafts[nextIdx]?.length || 0) < targetPerPlayer) {
        break;
      }
      nextIdx = (nextIdx + 1) % numPlayers;
      loops++;
    }

    setCurrentPlayerIdx(nextIdx);
    setSelectingSpecies(null);
    setInspectingLoadout(null);
  };

  const handleLaunchBattle = () => {
    // Build multiplayer player data for all players
    const playersData: MultiplayerPlayerData[] = activePlayerConfigs.map((cfg, idx) => {
      const pDraft = drafts[idx] || [];
      const team: StuffyState[] = pDraft.map((d, sIdx) => ({
        instanceId: `${cfg.id}_${d.species.id}_${sIdx}`,
        speciesId: d.species.id,
        name: d.species.name,
        maxHp: d.species.baseHp,
        currentHp: d.species.baseHp,
        shield: 0,
        isUnstuffed: false,
        statusEffects: [],
        selectedLoadoutId: d.loadoutId,
      }));

      const deck: Card[] = [];
      pDraft.forEach((d) => {
        const loadouts = getLoadoutsForStuffy(d.species.id);
        const chosen = loadouts.find((l) => l.id === d.loadoutId) || loadouts[0];
        chosen?.cardIds.forEach((cId) => {
          const c = CARD_MAP.get(cId);
          if (c) deck.push({ ...c });
        });
      });

      // RULE: Each player starts with 1 copy of each player power-up card!
      PLAYER_POWERUP_CARDS.forEach((card) => {
        deck.push({ ...card });
      });

      return {
        id: cfg.id,
        name: cfg.name,
        color: cfg.color,
        team,
        bench: [],
        deck,
        hand: [],
        discard: [],
        isEliminated: false,
        isBot: cfg.name.toLowerCase().includes('bot'),
      };
    });

    // Reserve stuffies from remaining available species
    const reserveStuffies: StuffyState[] = availableSpecies.map((s, i) => ({
      instanceId: `reserve_${s.id}_${i}`,
      speciesId: s.id,
      name: s.name,
      maxHp: s.baseHp,
      currentHp: s.baseHp,
      shield: 0,
      isUnstuffed: false,
      statusEffects: [],
    }));

    if (onMultiplayerDraftComplete) {
      onMultiplayerDraftComplete(playersData, reserveStuffies);
    } else {
      (onDraftComplete as any)(playersData, reserveStuffies);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 select-none overflow-y-auto">
      {/* Spectator Leave Banner */}
      {isSpectator && (
        <div className="w-full bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border border-purple-500/80 px-4 py-2 rounded-xl flex items-center justify-between mb-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">👁️</span>
            <span className="font-pixel text-xs text-purple-200 font-bold tracking-wide">
              SPECTATING LIVE DRAFT
            </span>
          </div>
          {onLeaveDraft && (
            <button
              onClick={() => {
                sound.playClickSound();
                onLeaveDraft();
              }}
              className="font-pixel text-[10px] bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-xl border border-red-300 shadow cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>🚪</span>
              <span>LEAVE SPECTATOR</span>
            </button>
          )}
        </div>
      )}

      {/* Top Header */}
      <div className="text-center">
        <h2 className="font-pixel text-xl md:text-2xl text-yellow-400 font-bold tracking-wider">
          {numPlayers}-PLAYER DRAFT SHOWDOWN
        </h2>
        <p className="font-pixel text-[10px] text-slate-400 mt-1">
          {numPlayers === 4 && 'Each player drafts 4 stuffies (16 total). No reinforcements remaining!'}
          {numPlayers === 3 && 'Each player drafts 4 stuffies (12 total). 4 reserve stuffies in reinforcement pool!'}
          {numPlayers === 2 && 'Each player drafts 5 stuffies (10 total). Remaining stuffies enter the reinforcement pool!'}
        </p>

        {/* Turn Badges */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mt-3 flex-wrap">
          {activePlayerConfigs.map((cfg, idx) => {
            const isTurn = currentPlayerIdx === idx && !isDraftFinished;
            const count = drafts[idx]?.length || 0;
            return (
              <div
                key={cfg.id}
                className={`font-pixel text-xs px-3 py-1.5 rounded-lg border-2 transition-all ${
                  isTurn
                    ? `${cfg.bg} ${cfg.border} ${cfg.text} ring-2 ring-yellow-400 animate-pulse scale-105`
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {cfg.name} ({count}/{targetPerPlayer})
              </div>
            );
          })}
        </div>

        {banishNotification && (
          <div className="mt-2 inline-block bg-red-950/90 border border-red-500 text-red-300 font-pixel text-xs px-4 py-1.5 rounded-full shadow-lg animate-bounce">
            {banishNotification}
          </div>
        )}
      </div>

      {/* Roster Display for All Players */}
      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(4, numPlayers)} gap-3 my-3 max-w-6xl mx-auto w-full`}>
        {activePlayerConfigs.map((cfg, idx) => {
          const pDraft = drafts[idx] || [];
          return (
            <div key={cfg.id} className={`${cfg.bg} border-2 ${cfg.border} p-2.5 rounded-xl`}>
              <h3 className={`font-pixel text-xs ${cfg.text} mb-2 font-bold flex justify-between`}>
                <span>{cfg.name} SQUAD</span>
                <span>{pDraft.length}/{targetPerPlayer}</span>
              </h3>
              <div className="flex gap-2 flex-wrap min-h-[64px]">
                {pDraft.map((d, sIdx) => (
                  <div key={sIdx} className="flex flex-col items-center bg-slate-900 p-1.5 rounded-lg border border-slate-700 w-16">
                    <StuffySprite
                      stuffy={{
                        instanceId: `${cfg.id}_prev_${sIdx}`,
                        speciesId: d.species.id,
                        name: d.species.name,
                        maxHp: d.species.baseHp,
                        currentHp: d.species.baseHp,
                        shield: 0,
                        isUnstuffed: false,
                        statusEffects: [],
                      }}
                      size={40}
                    />
                    <span className="font-pixel text-[8px] text-yellow-300 truncate w-full text-center mt-1">
                      {d.species.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Turn Guidance Banner */}
      {!isDraftFinished && (
        <div className="text-center my-2">
          {isSpectator ? (
            <div className="inline-block bg-purple-950/90 border border-purple-400 text-purple-200 font-pixel text-xs px-4 py-1.5 rounded-full shadow">
              👁️ SPECTATOR MODE - Watching @{currentCfg.name} pick their stuffy...
            </div>
          ) : isMyTurn ? (
            <div className="inline-block bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-pixel text-xs px-4 py-1.5 rounded-full shadow animate-pulse">
              ⭐ YOUR TURN (@{currentCfg.name}) - Select a stuffy from the pool below!
            </div>
          ) : (
            <div className="inline-block bg-amber-950/90 border border-amber-500 text-amber-300 font-pixel text-xs px-4 py-1.5 rounded-full shadow">
              ⏳ Waiting for @{currentCfg.name} to choose... (You can only pick on your own turn)
            </div>
          )}
        </div>
      )}

      {/* Available Stuffies Pool */}
      {!isDraftFinished ? (
        !selectingSpecies ? (
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 shadow">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs text-yellow-400 font-bold">
                  👉 {currentCfg.name}&apos;S TURN TO DRAFT:
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  ({availableSpecies.length} Champions Available)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!isMyTurn}
                  onClick={() => handleRandomFillRemaining(false)}
                  className="font-pixel text-[10px] bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-yellow-300 font-bold px-3 py-1.5 rounded-lg border border-purple-400 shadow cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                  title={`Randomly fills remaining slots for ${currentCfg.name} ONLY without touching other players!`}
                >
                  <span>🎲</span>
                  <span>RANDOM FILL MY SLOTS ({currentCfg.name})</span>
                </button>
                {banishedSpeciesIds.size > 0 && isMyTurn && (
                  <button
                    type="button"
                    onClick={handleUnbanishAll}
                    className="font-pixel text-[10px] bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold px-2.5 py-1.5 rounded-lg border border-emerald-600 cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                    title="Unbanish all previously banished stuffies"
                  >
                    <span>↩️</span>
                    <span>RESTORE ALL ({banishedSpeciesIds.size})</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2 max-h-[44vh] overflow-y-auto p-1">
              {availableSpecies.map((species) => (
                <div
                  key={species.id}
                  onClick={() => isMyTurn && handlePickSpecies(species)}
                  className={`bg-slate-900/90 border-2 border-slate-700 p-1.5 rounded-xl flex flex-col items-center text-center relative group shadow-md transition-all ${
                    isMyTurn
                      ? 'hover:border-yellow-400 hover:scale-105 active:scale-95 cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <StuffySprite
                    stuffy={{
                      instanceId: `pool_${species.id}`,
                      speciesId: species.id,
                      name: species.name,
                      maxHp: species.baseHp,
                      currentHp: species.baseHp,
                      shield: 0,
                      isUnstuffed: false,
                      statusEffects: [],
                    }}
                    size={46}
                  />
                  <span className="font-pixel text-[9px] text-yellow-300 font-bold mt-1 truncate w-full">
                    {species.name}
                  </span>
                  <span className="font-pixel text-[8px] text-emerald-400">
                    {species.baseHp} HP
                  </span>
                  <span className="font-mono text-[8px] text-slate-400 capitalize">
                    {species.species}
                  </span>

                  {/* Banish Button */}
                  <button
                    onClick={(e) => handleBanishStuffy(species, e)}
                    className="mt-1 font-pixel text-[7px] bg-red-950 hover:bg-red-800 text-red-300 px-1.5 py-0.5 rounded border border-red-700 transition-all opacity-75 group-hover:opacity-100"
                    title="Banishes this stuffy from the draft pool (can be unbanished below)"
                  >
                    🗑️ BANISH
                  </button>
                </div>
              ))}
            </div>

            {/* UNBANISH TRAY: Visible whenever stuffies are banished */}
            {banishedSpeciesList.length > 0 && (
              <div className="mt-2.5 bg-red-950/40 border border-red-700/60 rounded-xl p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-pixel text-[9px] text-red-300 font-bold flex items-center gap-1">
                    <span>🗑️</span> BANISHED STUFFIES ({banishedSpeciesList.length}) — Click to Unbanish:
                  </span>
                  <button
                    type="button"
                    onClick={handleUnbanishAll}
                    className="font-pixel text-[8px] bg-red-900/60 hover:bg-red-800 text-red-200 px-2 py-0.5 rounded border border-red-500 cursor-pointer"
                  >
                    RESTORE ALL
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {banishedSpeciesList.map((species) => (
                    <div
                      key={species.id}
                      onClick={() => handleUnbanishStuffy(species.id)}
                      className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-emerald-950/80 border border-red-600/60 hover:border-emerald-500 px-2 py-0.5 rounded-lg cursor-pointer transition-all group"
                      title={`Click to unbanish ${species.name}`}
                    >
                      <StuffySprite
                        stuffy={{
                          instanceId: `banished_${species.id}`,
                          speciesId: species.id,
                          name: species.name,
                          maxHp: species.baseHp,
                          currentHp: species.baseHp,
                          shield: 0,
                          isUnstuffed: false,
                          statusEffects: [],
                        }}
                        size={26}
                      />
                      <span className="font-pixel text-[8px] text-slate-300 group-hover:text-emerald-300">
                        {species.name}
                      </span>
                      <span className="font-pixel text-[7px] text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-500/50">
                        ↩️ Unbanish
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Loadout Selection Screen for Selected Stuffy */
          <div className="max-w-4xl mx-auto w-full bg-slate-900 border-2 border-yellow-500 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col items-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-slate-950 rounded-xl border border-yellow-500/50">
                <StuffySprite
                  stuffy={{
                    instanceId: `modal_${selectingSpecies.id}`,
                    speciesId: selectingSpecies.id,
                    name: selectingSpecies.name,
                    maxHp: selectingSpecies.baseHp,
                    currentHp: selectingSpecies.baseHp,
                    shield: 0,
                    isUnstuffed: false,
                    statusEffects: [],
                  }}
                  size={48}
                />
              </div>
              <div>
                <h3 className="font-pixel text-sm text-yellow-300 font-bold">
                  {currentCfg.name}: CHOOSE 10-CARD PRESET FOR {selectingSpecies.name.toUpperCase()}
                </h3>
                <p className="font-pixel text-[10px] text-slate-400">
                  Select 1 of 3 balanced 10-card loadouts (Average B-Tier Power):
                </p>
              </div>
            </div>

            {/* 3 Loadout Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full mb-3">
              {getLoadoutsForStuffy(selectingSpecies.id).map((loadout) => {
                const isSelected = inspectingLoadout?.id === loadout.id;
                return (
                  <div
                    key={loadout.id}
                    onClick={() => setInspectingLoadout(loadout)}
                    className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-yellow-950/60 border-yellow-400 ring-2 ring-yellow-400'
                        : 'bg-slate-950 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-pixel text-[11px] font-bold text-yellow-300">{loadout.name}</h4>
                      <span className="font-pixel text-[8px] px-1 py-0.5 rounded bg-purple-900 text-purple-200">
                        AVG: B
                      </span>
                    </div>
                    <p className="font-sans text-[9px] text-slate-300">{loadout.theme}</p>
                  </div>
                );
              })}
            </div>

            {/* Full 10 Cards List */}
            {inspectingLoadout && (
              <div className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 mb-3">
                <div className="font-pixel text-[10px] text-slate-400 mb-1.5 flex justify-between items-center">
                  <span>10 CARDS INCLUDED IN THIS DECK:</span>
                  <span className="text-[9px] text-yellow-400">Total: 10 Cards</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {(() => {
                    const counts: Record<string, number> = {};
                    inspectingLoadout.cardIds.forEach((id) => {
                      counts[id] = (counts[id] || 0) + 1;
                    });
                    return Object.entries(counts).map(([cId, count]) => {
                      const card = CARD_MAP.get(cId);
                      if (!card) return null;
                      const tierStyle = TIER_COLORS[card.tier] || TIER_COLORS.C;
                      return (
                        <div
                          key={cId}
                          onClick={() => setInspectedCard(card)}
                          className="flex items-center justify-between bg-slate-900 border border-slate-800 hover:border-yellow-400 hover:bg-slate-800 rounded-lg px-2.5 py-1.5 text-xs shadow-sm cursor-pointer transition-all group"
                          title="Click to view full card details"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="font-pixel text-yellow-400 font-bold text-xs">{count}x</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-pixel font-bold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                              {card.tier}
                            </span>
                            <span className="font-pixel text-[10px] text-white group-hover:text-yellow-300 truncate max-w-[110px]" title={card.name}>
                              {card.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] text-slate-400">
                            <span className="font-mono text-amber-300 font-bold">🍪{card.cost}</span>
                            <span className="text-slate-300 truncate max-w-[90px]" title={card.description}>
                              {card.description}
                            </span>
                            <span className="text-[10px] text-yellow-400 opacity-70 group-hover:opacity-100">🔍</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectingSpecies(null);
                  setInspectingLoadout(null);
                }}
                className="font-pixel text-[10px] px-4 py-2 bg-slate-800 text-slate-300 rounded-lg border border-slate-600 cursor-pointer"
              >
                BACK
              </button>
              {numPlayers === 2 && (
                <button
                  onClick={() => handleBanishStuffy(selectingSpecies)}
                  className="font-pixel text-[10px] px-4 py-2 bg-red-950 hover:bg-red-900 text-red-300 rounded-lg border border-red-700 cursor-pointer"
                >
                  🗑️ BANISH STUFFY
                </button>
              )}
              <button
                onClick={() => inspectingLoadout && handleConfirmLoadout(inspectingLoadout.id)}
                className="font-pixel text-[10px] px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg border-2 border-emerald-400 font-bold shadow-lg shadow-emerald-700/50 cursor-pointer"
              >
                CONFIRM {inspectingLoadout?.name.toUpperCase()} (10 CARDS) ✅
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-6">
          <button
            onClick={handleLaunchBattle}
            className="font-pixel text-sm md:text-base bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-8 py-4 rounded-xl border-4 border-yellow-300 shadow-2xl animate-bounce cursor-pointer"
          >
            START {numPlayers}-PLAYER BATTLE ⚔️
          </button>
        </div>
      )}

      {/* Card Detail Preview Modal */}
      {inspectedCard && (
        <div
          onClick={() => setInspectedCard(null)}
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border-4 border-yellow-400 rounded-3xl p-6 flex flex-col items-center max-w-xs w-full shadow-2xl cursor-default animate-scaleUp"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎴</span>
              <h4 className="font-pixel text-xs text-yellow-300 font-bold tracking-wider">
                CARD PREVIEW
              </h4>
            </div>
            <CardView card={inspectedCard} />
            <button
              onClick={() => setInspectedCard(null)}
              className="mt-4 font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl border border-slate-600 cursor-pointer shadow transition-all hover:scale-105 active:scale-95"
            >
              CLOSE [✖️]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
