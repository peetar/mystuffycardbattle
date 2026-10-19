import { create } from 'zustand';
import { Card, StuffyState, StatusEffect, MultiplayerPlayerData, PlayerSide, MultiplayerTurnAction, Relic, CombatHistorySnapshot } from '@/types/game';
import { ALL_CARDS, CARD_MAP } from '@/data/cards';
import { STUFFY_MAP } from '@/data/stuffies';
import { getLoadoutsForStuffy } from '@/data/loadouts';
import { useCampaignStore } from './campaignStore';
import { sound } from '@/utils/audio';
import { recordCardPlay, recordStuffyDeath, recordBattleOutcome, recordDamageDealt, recordCombatForfeitedOrLost } from '@/utils/playerStats';
import { unlockAdvancement } from '@/utils/advancements';

export interface CombatLogEntry {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'shield' | 'status' | 'special';
}

export interface EnemyTurnAction {
  enemyId: string;
  enemyName: string;
  enemySpeciesId: string;
  cardName: string;
  cardType: string;
  cardTier: string;
  targetName: string;
  targetId: string;
  damage: number;
  effectDescription: string;
}

export interface ActiveAttackAnimation {
  attackerId: string;
  targetId?: string;
  isRanged: boolean;
  projectileType: 'plasma' | 'laser' | 'gas' | 'dart' | 'sonic' | 'rock' | 'needle' | 'slash';
  cardName: string;
}

export interface CombatStore {
  // Mode
  gameMode: 'campaign' | 'two_player' | 'multiplayer';
  playerCount: number;

  // State
  turnNumber: number;
  activeSide: 'player' | 'enemy' | 'p1' | 'p2' | 'p3' | 'p4';
  currentCrackers: number;
  maxCrackers: number;

  // Stuffies on field (up to 5 each)
  playerTeam: StuffyState[];
  enemyTeam: StuffyState[];
  playerBench: StuffyState[];

  // Multiplayer players list
  multiplayerPlayers: MultiplayerPlayerData[];
  localPlayerId: PlayerSide;
  setLocalPlayerId: (id: PlayerSide) => void;

  // Decks & Hands
  playerDeck: Card[];
  playerHand: Card[];
  playerDiscard: Card[];

  enemyDeck: Card[];
  enemyHand: Card[];
  enemyDiscard: Card[];

  // Reserves & Reinforcements
  twoPlayerReserve: StuffyState[];
  reinforcementPool: StuffyState[];
  firstBloodTriggered: boolean;
  privacyCoverActive: boolean;

  // Interactive selection
  selectedCardIndex: number | null;
  selectedTargetId: string | null;

  // Animations & Turn Reviews
  activeAttackAnimation: ActiveAttackAnimation | null;
  recentEnemyActions: EnemyTurnAction[];
  showEnemyTurnReview: boolean;
  recentMultiplayerActions: MultiplayerTurnAction[];
  showMultiplayerTurnReview: boolean;

  // Alex's S-Tier Strokenosis Mind Control Modal
  strokenosisActive: boolean;
  strokenosisCards: Card[];

  // Battle outcome
  battleResult: 'ongoing' | 'victory' | 'defeat' | 'p1_victory' | 'p2_victory' | 'p3_victory' | 'p4_victory';
  activeRelics: Relic[];
  undoStack: CombatHistorySnapshot[];
  historySnapshot: CombatHistorySnapshot | null;
  concussionKillTrack: Record<string, boolean>;
  goldenThimbleUsed: boolean;
  lifeLinkRemainingTurns: number | null;
  combatLogs: CombatLogEntry[];

  // Actions
  initializeCampaignBattle: (
    playerTeam: StuffyState[],
    playerDeck: Card[],
    enemySpeciesIds: string[],
    relics?: Relic[],
    playerBench?: StuffyState[],
    battleType?: 'monster' | 'elite' | 'boss'
  ) => void;

  initializeTwoPlayerBattle: (
    p1Team: StuffyState[],
    p1Deck: Card[],
    p2Team: StuffyState[],
    p2Deck: Card[],
    reserveStuffies: StuffyState[]
  ) => void;

  initializeMultiplayerBattle: (
    players: MultiplayerPlayerData[],
    reinforcementPool?: StuffyState[],
    localPlayerId?: PlayerSide
  ) => void;

  swapBenchedStuffy: (fieldIndex: number, benchIndex: number) => void;

  selectCard: (index: number | null) => void;
  deselectCard: () => void;
  discardCard: (cardIndex: number) => void;
  selectTarget: (stuffyInstanceId: string) => void;
  playCard: (cardIndex: number, targetId?: string) => boolean;
  undoLastAction: () => boolean;
  resolveStrokenosis: (cardIndex: number) => void;
  endTurn: () => void;
  dismissPrivacyCover: () => void;
  dismissEnemyTurnReview: () => void;
  dismissMultiplayerTurnReview: () => void;
  openMultiplayerTurnReview: () => void;
  addLog: (text: string, type?: CombatLogEntry['type']) => void;
}

// RULE: Identify why a card cannot be played (unstuffed, benched, or brain-damaged non-heal)
export function getUnplayableReason(card: Card | undefined, friendlyTeam: StuffyState[]): string | null {
  if (!card || !card.stuffyId) return null; // Player power-up cards are always playable

  // Benched stuffy
  if (!friendlyTeam.some((s) => s.speciesId === card.stuffyId)) {
    return 'owner stuffy is benched';
  }

  const owner = friendlyTeam.find((s) => s.speciesId === card.stuffyId);
  if (!owner) return null;

  // Unstuffed
  if ((owner.isUnstuffed || owner.currentHp <= 0) && !card.canRevive && card.type !== 'restitch') {
    return `${owner.name} is unstuffed`;
  }

  // Brain-Damaged
  if (owner.statusEffects.some((e) => e.type === 'brain_damaged') && card.type !== 'heal' && !card.heal) {
    return `${owner.name} is brain-damaged`;
  }

  return null;
}

// RULE: Auto-discard unplayable card and draw replacement card immediately
export function discardUnplayableCardAndRedraw(
  cardIndex: number,
  reason: string,
  state: any,
  set: any
) {
  const isP2 = state.activeSide === 'p2';
  let hand = [...(isP2 ? state.enemyHand : state.playerHand)];
  let deck = [...(isP2 ? state.enemyDeck : state.playerDeck)];
  let discard = [...(isP2 ? state.enemyDiscard : state.playerDiscard)];

  const card = hand[cardIndex];
  if (!card) return false;

  hand.splice(cardIndex, 1);
  discard.push(card);

  let redrawn = false;
  if (deck.length === 0 && discard.length > 0) {
    deck = [...discard].sort(() => Math.random() - 0.5);
    discard = [];
    state.addLog(`Draw pile shuffled!`, 'special');
  }
  if (deck.length > 0) {
    hand.push(deck.shift()!);
    redrawn = true;
  }

  state.addLog(
    `🗑️ "${card.name}" cannot be used (${reason}) - automatically discarded${redrawn ? ' and redrew a card' : ''}!`,
    'special'
  );

  if (isP2) {
    set({ enemyHand: hand, enemyDeck: deck, enemyDiscard: discard, selectedCardIndex: null });
  } else {
    set({ playerHand: hand, playerDeck: deck, playerDiscard: discard, selectedCardIndex: null });
  }
  return true;
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  gameMode: 'campaign',
  playerCount: 2,
  turnNumber: 1,
  activeSide: 'player',
  currentCrackers: 7,
  maxCrackers: 7,

  playerTeam: [],
  enemyTeam: [],
  playerBench: [],
  multiplayerPlayers: [],
  localPlayerId: 'p1',
  setLocalPlayerId: (id: PlayerSide) => set({ localPlayerId: id }),

  playerDeck: [],
  playerHand: [],
  playerDiscard: [],

  enemyDeck: [],
  enemyHand: [],
  enemyDiscard: [],

  twoPlayerReserve: [],
  reinforcementPool: [],
  firstBloodTriggered: false,
  privacyCoverActive: false,

  selectedCardIndex: null,
  selectedTargetId: null,

  activeAttackAnimation: null,
  recentEnemyActions: [],
  showEnemyTurnReview: false,
  recentMultiplayerActions: [],
  showMultiplayerTurnReview: false,

  strokenosisActive: false,
  strokenosisCards: [],

  battleResult: 'ongoing',
  activeRelics: [],
  undoStack: [],
  historySnapshot: null,
  concussionKillTrack: {},
  goldenThimbleUsed: false,
  lifeLinkRemainingTurns: null,
  combatLogs: [],

  addLog: (text, type = 'special') => {
    set((state) => ({
      combatLogs: [
        { id: Math.random().toString(36).substring(7), text, type },
        ...state.combatLogs.slice(0, 24),
      ],
    }));
  },

  initializeCampaignBattle: (
    playerTeam,
    playerDeck,
    enemySpeciesIds,
    relics = [],
    playerBench = [],
    battleType = 'monster'
  ) => {
    // Relic modifiers
    let startCrackers = 7;
    let startShield = 0;
    let initialHandSize = 5;
    relics.forEach((r) => {
      if (r.effectType === 'bonus_cracker') startCrackers += r.value;
      if (r.effectType === 'shield_boost') startShield += r.value;
      if (r.id === 'speedy_paw') initialHandSize = 6;
    });

    // Create enemy stuffies with Mega Elites and Mega Bosses (including all 10+ new colossal bosses)
    let enemyTeam: StuffyState[] = [];
    const singleBossMap: Record<string, { hp: number; shield: number; name: string }> = {
      amalgam: { hp: Math.round(240 * 1.05), shield: 25, name: 'The Stuffy Amalgam' },
      lint_vampire: { hp: Math.round(215 * 1.05), shield: 30, name: 'The Static Sapper' },
      toxic_slug: { hp: Math.round(225 * 1.05), shield: 20, name: 'Noxious Slime King' },
      clockwork_nuke: { hp: Math.round(260 * 1.05), shield: 25, name: 'Doomsday Chrono-Bear' },
      cinder_beast: { hp: Math.round(240 * 1.05), shield: 25, name: 'Ignis the Cinder Drake' },
      grave_scavenger: { hp: Math.round(230 * 1.05), shield: 20, name: 'Scrappy the Graverobber' },
      mind_puppeteer: { hp: Math.round(235 * 1.05), shield: 25, name: 'Psychic Mind-Leech' },
      shadow_hedgehog: { hp: Math.round(250 * 1.05), shield: 25, name: 'Shadow the Ultimate' },
      mirror_mimic: { hp: Math.round(220 * 1.05), shield: 20, name: 'The Mirror Doppelganger' },
      fluff_gorgon: { hp: Math.round(270 * 1.05), shield: 30, name: 'The Fluff Devourer' },
      volt_colossus: { hp: Math.round(245 * 1.05), shield: 25, name: 'Surge the Thunder Golem' },
    };

    const singleBossId = enemySpeciesIds.length === 1 ? enemySpeciesIds[0] : null;
    if (singleBossId && singleBossMap[singleBossId]) {
      const bInfo = singleBossMap[singleBossId];
      enemyTeam = [
        {
          instanceId: `enemy_${singleBossId}_0`,
          speciesId: singleBossId,
          name: bInfo.name,
          maxHp: bInfo.hp,
          currentHp: bInfo.hp,
          shield: bInfo.shield,
          isUnstuffed: false,
          statusEffects: singleBossId === 'shadow_hedgehog' ? [{ type: 'energy', value: 4 }] : [],
          isMega: true,
          customDeckTier: 'A+',
        },
      ];
    } else {
      enemyTeam = enemySpeciesIds.slice(0, 5).map((sId, idx) => {
        const species = STUFFY_MAP.get(sId);
        let hp = species ? species.baseHp : 60;
        let name = species ? species.name : 'Wild Stuffy';
        let isMega = false;
        let customDeckTier: 'A-' | 'A+' | 'standard' = 'standard';

        if (battleType === 'elite' && idx === 0) {
          // Elite Leader: Mega prefix, +10% health, A- ranked deck (2 S-tiers and A-tier cards)
          isMega = true;
          name = `Mega ${name}`;
          hp = Math.round(hp * 1.10);
          customDeckTier = 'A-';
        } else if (battleType === 'boss' && idx < 3) {
          // Boss Battle: 3 Mega stuffies with 5% increase to fluff, A+ tier deck (S-tier and A-tier cards)
          isMega = true;
          name = `Mega ${name}`;
          hp = Math.round(hp * 1.05);
          customDeckTier = 'A+';
        }

        return {
          instanceId: `enemy_${sId}_${idx}`,
          speciesId: sId,
          name,
          maxHp: hp,
          currentHp: hp,
          shield: isMega ? 15 : 0,
          isUnstuffed: false,
          statusEffects: [],
          isMega,
          customDeckTier,
        };
      });
    }

    // Apply starting shield to player team (retaining previous health)
    const primedPlayerTeam: StuffyState[] = playerTeam.map((s) => ({
      ...s,
      shield: startShield,
      statusEffects: [],
    }));

    // Chaos Emerald Shard Relic: Start combat with +3 Energy on a random ally!
    if (relics.some((r) => r.id === 'shadow_gem') && primedPlayerTeam.length > 0) {
      const luckyAlly = primedPlayerTeam[Math.floor(Math.random() * primedPlayerTeam.length)];
      luckyAlly.statusEffects.push({ type: 'energy', value: 3 });
    }

    // RULE: strictly filter combat deck so cards from BENCHED stuffies cannot enter combat!
    const activeSpecies = new Set(primedPlayerTeam.map((s) => s.speciesId));
    const activeCombatDeck = playerDeck.filter(
      (c) => c.isPlayerCard || (c.stuffyId && activeSpecies.has(c.stuffyId))
    );

    // Shuffle active deck
    const shuffledDeck = [...activeCombatDeck].sort(() => Math.random() - 0.5);
    const initialHand = shuffledDeck.slice(0, initialHandSize);
    const remainingDeck = shuffledDeck.slice(initialHandSize);

    // Generate deterministic enemy deck and hand for bot tracking
    const enemyCardPool: Card[] = [];
    enemyTeam.forEach((enemy) => {
      const loadouts = getLoadoutsForStuffy(enemy.speciesId);
      const chosenLoadout = loadouts[0];
      if (chosenLoadout) {
        chosenLoadout.cardIds.forEach((cId) => {
          const c = CARD_MAP.get(cId);
          if (c) enemyCardPool.push({ ...c, stuffyId: enemy.speciesId });
        });
      }
    });
    const shuffledEnemy = [...enemyCardPool].sort(() => Math.random() - 0.5);
    const enemyHand = shuffledEnemy.slice(0, 5);
    const enemyDeck = shuffledEnemy.slice(5);

    set({
      gameMode: 'campaign',
      playerCount: 2,
      turnNumber: 1,
      activeSide: 'player',
      activeRelics: relics,
      undoStack: [],
      historySnapshot: null,
      concussionKillTrack: {},
      goldenThimbleUsed: false,
      currentCrackers: startCrackers,
      maxCrackers: startCrackers,
      playerTeam: primedPlayerTeam,
      enemyTeam,
      playerBench: playerBench || [],
      multiplayerPlayers: [],
      playerDeck: remainingDeck,
      playerHand: initialHand,
      playerDiscard: [],
      enemyDeck,
      enemyHand,
      enemyDiscard: [],
      twoPlayerReserve: [],
      reinforcementPool: [],
      firstBloodTriggered: false,
      privacyCoverActive: false,
      selectedCardIndex: null,
      selectedTargetId: null,
      activeAttackAnimation: null,
      recentEnemyActions: [],
      showEnemyTurnReview: false,
      strokenosisActive: false,
      strokenosisCards: [],
      battleResult: 'ongoing',
      lifeLinkRemainingTurns: null,
      combatLogs: [{ id: '1', text: 'Battle initiated! Stuffy Showdown!', type: 'special' }],
    });
  },

  initializeMultiplayerBattle: (players: MultiplayerPlayerData[], reinforcementPool: StuffyState[] = [], localPlayerId: PlayerSide = 'p1') => {
    // Prime each player's deck, hand, and remaining deck
    const preparedPlayers = players.map((p) => {
      const activeSpecies = new Set(p.team.map((s) => s.speciesId));
      const validDeck = p.deck.filter((c) => c.isPlayerCard || (c.stuffyId && activeSpecies.has(c.stuffyId)));
      const shuffled = [...validDeck].sort(() => Math.random() - 0.5);
      const hand = shuffled.slice(0, 5);
      const remainingDeck = shuffled.slice(5);

      return {
        ...p,
        hand,
        deck: remainingDeck,
        discard: [],
        bench: p.bench || [],
        isEliminated: false,
      };
    });

    const firstPlayer = preparedPlayers[0];
    const opponent = preparedPlayers[1] || preparedPlayers[0];

    set({
      gameMode: preparedPlayers.length === 2 ? 'two_player' : 'multiplayer',
      playerCount: preparedPlayers.length,
      turnNumber: 1,
      activeSide: firstPlayer.id,
      localPlayerId: localPlayerId || 'p1',
      currentCrackers: 7,
      maxCrackers: 7,
      undoStack: [],
      historySnapshot: null,
      concussionKillTrack: {},
      multiplayerPlayers: preparedPlayers,
      playerTeam: firstPlayer.team,
      playerBench: firstPlayer.bench,
      playerHand: firstPlayer.hand,
      playerDeck: firstPlayer.deck,
      playerDiscard: [],
      enemyTeam: opponent.team,
      enemyHand: opponent.hand,
      enemyDeck: opponent.deck,
      enemyDiscard: [],
      twoPlayerReserve: reinforcementPool,
      reinforcementPool,
      firstBloodTriggered: false,
      privacyCoverActive: false,
      selectedCardIndex: null,
      selectedTargetId: null,
      activeAttackAnimation: null,
      recentEnemyActions: [],
      showEnemyTurnReview: false,
      strokenosisActive: false,
      strokenosisCards: [],
      battleResult: 'ongoing',
      combatLogs: [{ id: '1', text: `${preparedPlayers.length}-Player battle started! ${firstPlayer.name} goes first!`, type: 'special' }],
    });
  },

  initializeTwoPlayerBattle: (p1Team, p1Deck, p2Team, p2Deck, reserveStuffies) => {
    const p1: MultiplayerPlayerData = {
      id: 'p1',
      name: 'PLAYER 1',
      color: 'emerald',
      team: p1Team,
      bench: [],
      deck: p1Deck,
      hand: [],
      discard: [],
      isEliminated: false,
    };
    const p2: MultiplayerPlayerData = {
      id: 'p2',
      name: 'PLAYER 2',
      color: 'blue',
      team: p2Team,
      bench: [],
      deck: p2Deck,
      hand: [],
      discard: [],
      isEliminated: false,
    };
    get().initializeMultiplayerBattle([p1, p2], reserveStuffies);
  },

  swapBenchedStuffy: (fieldIndex: number, benchIndex: number) => {
    const state = get();
    if (state.gameMode === 'campaign') {
      const team = [...state.playerTeam];
      const bench = [...state.playerBench];
      if (fieldIndex < 0 || fieldIndex >= team.length) return;
      if (benchIndex < 0 || benchIndex >= bench.length) return;

      const oldStuffy = team[fieldIndex];
      const newStuffy = bench[benchIndex];

      team[fieldIndex] = newStuffy;
      bench[benchIndex] = oldStuffy;

      useCampaignStore.setState({ activeParty: team, bench });

      let hand = [...state.playerHand];
      let deck = [...state.playerDeck];
      let discard = [...state.playerDiscard];

      let unplayableIdx = hand.findIndex((c) => getUnplayableReason(c, team) !== null);
      while (unplayableIdx !== -1) {
        const disc = hand.splice(unplayableIdx, 1)[0];
        discard.push(disc);
        if (deck.length === 0 && discard.length > 0) {
          deck = [...discard].sort(() => Math.random() - 0.5);
          discard = [];
        }
        if (deck.length > 0) hand.push(deck.shift()!);
        unplayableIdx = hand.findIndex((c) => getUnplayableReason(c, team) !== null);
      }

      state.addLog(`🔄 BENCH SWAP: ${newStuffy.name} entered the field! ${oldStuffy.name} moved to the bench.`, 'special');
      set({ playerTeam: team, playerBench: bench, playerHand: hand, playerDeck: deck, playerDiscard: discard });
    } else {
      const players = [...state.multiplayerPlayers];
      const currIdx = players.findIndex((p) => p.id === state.activeSide);
      if (currIdx === -1) return;
      const player = { ...players[currIdx] };
      const team = [...player.team];
      const bench = [...player.bench];

      if (fieldIndex < 0 || fieldIndex >= team.length) return;
      if (benchIndex < 0 || benchIndex >= bench.length) return;

      const oldStuffy = team[fieldIndex];
      const newStuffy = bench[benchIndex];

      team[fieldIndex] = newStuffy;
      bench[benchIndex] = oldStuffy;

      player.team = team;
      player.bench = bench;

      let hand = [...player.hand];
      let deck = [...player.deck];
      let discard = [...player.discard];

      let unplayableIdx = hand.findIndex((c) => getUnplayableReason(c, team) !== null);
      while (unplayableIdx !== -1) {
        const disc = hand.splice(unplayableIdx, 1)[0];
        discard.push(disc);
        if (deck.length === 0 && discard.length > 0) {
          deck = [...discard].sort(() => Math.random() - 0.5);
          discard = [];
        }
        if (deck.length > 0) hand.push(deck.shift()!);
        unplayableIdx = hand.findIndex((c) => getUnplayableReason(c, team) !== null);
      }

      player.hand = hand;
      player.deck = deck;
      player.discard = discard;
      players[currIdx] = player;

      state.addLog(`🔄 BENCH SWAP: ${newStuffy.name} entered the field! ${oldStuffy.name} moved to the bench.`, 'special');
      set({
        multiplayerPlayers: players,
        playerTeam: team,
        playerBench: bench,
        playerHand: hand,
        playerDeck: deck,
        playerDiscard: discard,
      });
    }
  },

  selectCard: (index) => {
    if (index === null) {
      set({ selectedCardIndex: null });
      return;
    }

    const state = get();
    const isMultiplayer = state.gameMode === 'two_player' || state.gameMode === 'multiplayer';
    const activeP = isMultiplayer
      ? state.multiplayerPlayers.find((p) => p.id === state.activeSide) || state.multiplayerPlayers[0]
      : null;

    const hand = activeP ? activeP.hand : state.playerHand;
    const card = hand[index];
    if (!card) return;

    const friendlyTeam = activeP ? activeP.team : state.playerTeam;
    const unplayableReason = getUnplayableReason(card, friendlyTeam);
    if (unplayableReason) {
      discardUnplayableCardAndRedraw(index, unplayableReason, state, set);
      return;
    }

    const { selectedCardIndex } = state;
    // RULE: Clicking a selected card again deselects it! Never auto-play!
    if (selectedCardIndex === index) {
      set({ selectedCardIndex: null, selectedTargetId: null });
      return;
    }

    set({ selectedCardIndex: index });
  },

  deselectCard: () => {
    set({ selectedCardIndex: null, selectedTargetId: null });
  },

  discardCard: (cardIndex: number) => {
    const state = get();
    const isMultiplayer = state.gameMode === 'two_player' || state.gameMode === 'multiplayer';
    const players = state.multiplayerPlayers.map((p) => ({
      ...p,
      team: [...p.team],
      bench: [...p.bench],
      deck: [...p.deck],
      hand: [...p.hand],
      discard: [...p.discard],
    }));

    const pIdx = isMultiplayer ? Math.max(0, players.findIndex((p) => p.id === state.activeSide)) : -1;
    const activeP = pIdx >= 0 ? players[pIdx] : null;

    const hand = [...(activeP ? activeP.hand : state.playerHand)];
    const card = hand[cardIndex];
    if (!card) return;

    hand.splice(cardIndex, 1);
    const discard = [...(activeP ? activeP.discard : state.playerDiscard), card];

    // If card belongs to a stuffy in an earthquake crack, free them!
    const friendlyTeam = [...(activeP ? activeP.team : state.playerTeam)];
    if (card.stuffyId) {
      const stuffy = friendlyTeam.find((s) => s.speciesId === card.stuffyId);
      if (stuffy && stuffy.statusEffects.some((e) => e.type === 'earthquake_crack')) {
        stuffy.statusEffects = stuffy.statusEffects.filter((e) => e.type !== 'earthquake_crack');
        state.addLog(`✨ Discarded ${card.name} to FREE ${stuffy.name} from the Earthquake crack!`, 'special');
      } else {
        state.addLog(`🗑️ Discarded "${card.name}" from hand.`, 'special');
      }
    } else {
      state.addLog(`🗑️ Discarded "${card.name}" from hand.`, 'special');
    }

    // FIRE BURNING MECHANIC: If one of your stuffies is on fire, a random living stuffy takes damage on discard!
    const isAnyOnFire = friendlyTeam.some((s) => !s.isUnstuffed && s.statusEffects.some((e) => e.type === 'fire'));
    if (isAnyOnFire) {
      const liveAllies = friendlyTeam.filter((s) => !s.isUnstuffed && s.currentHp > 0);
      if (liveAllies.length > 0) {
        const victim = liveAllies[Math.floor(Math.random() * liveAllies.length)];
        const burnDamage = 5;
        if (victim.shield >= burnDamage) {
          victim.shield -= burnDamage;
        } else {
          const rem = burnDamage - victim.shield;
          victim.shield = 0;
          victim.currentHp = Math.max(0, victim.currentHp - rem);
        }
        if (victim.currentHp <= 0) victim.isUnstuffed = true;
        sound.playFireSound();
        state.addLog(`🔥 FIRE BURST: Discarding a card ignited embers! ${victim.name} took ${burnDamage} burn damage! (Put out by healing!)`, 'special');
      }
    }

    if (activeP) {
      activeP.team = friendlyTeam;
      activeP.hand = hand;
      activeP.discard = discard;
      players[pIdx] = activeP;
      set({
        multiplayerPlayers: players,
        playerHand: hand,
        playerDiscard: discard,
        selectedCardIndex: null,
      });
    } else {
      set({ playerHand: hand, playerDiscard: discard, selectedCardIndex: null });
    }
  },

  selectTarget: (stuffyInstanceId) => {
    const { selectedCardIndex, playCard } = get();
    if (selectedCardIndex !== null) {
      playCard(selectedCardIndex, stuffyInstanceId);
    } else {
      set({ selectedTargetId: stuffyInstanceId });
    }
  },

  playCard: (cardIndex, targetId) => {
    const state = get();
    const isMultiplayer = state.gameMode === 'two_player' || state.gameMode === 'multiplayer';
    let players = state.multiplayerPlayers.map((p) => ({
      ...p,
      team: [...p.team],
      bench: [...p.bench],
      deck: [...p.deck],
      hand: [...p.hand],
      discard: [...p.discard],
    }));

    const pIdx = isMultiplayer ? Math.max(0, players.findIndex((p) => p.id === state.activeSide)) : -1;
    const activeP = pIdx >= 0 ? players[pIdx] : null;

    let currentHand = [...(activeP ? activeP.hand : state.playerHand)];
    let currentDeck = [...(activeP ? activeP.deck : state.playerDeck)];
    let currentDiscard = [...(activeP ? activeP.discard : state.playerDiscard)];

    const card = currentHand[cardIndex];
    if (!card) return false;

    let friendlyTeam = [...(activeP ? activeP.team : state.playerTeam)];
    let opposingTeam: StuffyState[] = [];
    if (isMultiplayer) {
      players
        .filter((p) => p.id !== state.activeSide && !p.isEliminated)
        .forEach((p) => opposingTeam.push(...p.team));
    } else {
      opposingTeam = [...state.enemyTeam];
    }

    // RULE: If card is unplayable (unstuffed, benched, or brain-damaged non-heal), automatically discard and redraw!
    const unplayableReason = getUnplayableReason(card, friendlyTeam);
    if (unplayableReason) {
      discardUnplayableCardAndRedraw(cardIndex, unplayableReason, state, set);
      return false;
    }

    if (state.currentCrackers < card.cost) {
      state.addLog(`Not enough Crackers! Need ${card.cost} 🍪`, 'special');
      return false;
    }

    // Capture snapshot for UNDO functionality (including bot / enemy hand state for deterministic replay)
    const historySnapshot: CombatHistorySnapshot = {
      playerTeam: JSON.parse(JSON.stringify(state.playerTeam)),
      enemyTeam: JSON.parse(JSON.stringify(state.enemyTeam)),
      playerHand: JSON.parse(JSON.stringify(currentHand)),
      playerDeck: JSON.parse(JSON.stringify(currentDeck)),
      playerDiscard: JSON.parse(JSON.stringify(currentDiscard)),
      enemyHand: JSON.parse(JSON.stringify(state.enemyHand)),
      enemyDeck: JSON.parse(JSON.stringify(state.enemyDeck)),
      enemyDiscard: JSON.parse(JSON.stringify(state.enemyDiscard)),
      currentCrackers: state.currentCrackers,
      combatLogs: [...state.combatLogs],
      multiplayerPlayers: state.multiplayerPlayers ? JSON.parse(JSON.stringify(state.multiplayerPlayers)) : undefined,
      recentMultiplayerActions: [...state.recentMultiplayerActions],
      description: card.name,
    };

    // Remove played card from current hand into discard
    currentHand.splice(cardIndex, 1);
    currentDiscard.push(card);
    recordCardPlay(card.id, card.name);

    const drawImmediate = (count: number) => {
      let drawn = 0;
      for (let i = 0; i < count; i++) {
        if (currentHand.length >= 7) break;
        if (currentDeck.length === 0) {
          if (currentDiscard.length === 0) break;
          currentDeck = [...currentDiscard].sort(() => Math.random() - 0.5);
          currentDiscard = [];
          state.addLog(`Draw pile empty! Shuffled discard pile back into deck!`, 'special');
        }
        if (currentDeck.length > 0) {
          currentHand.push(currentDeck.shift()!);
          drawn++;
        }
      }
      state.addLog(`🎴 Immediately drew ${drawn} bonus card(s)!`, 'special');
    };

    // Check for Henry Shell Up Taunt on opposing team
    const tauntingOpponent = opposingTeam.find(
      (s) => !s.isUnstuffed && s.statusEffects.some((e) => e.type === 'taunt')
    );
    if (tauntingOpponent && (card.target === 'single_enemy' || !card.target) && targetId !== tauntingOpponent.instanceId) {
      state.addLog(`Henry's Shell Up taunt forces attack on Henry!`, 'shield');
      targetId = tauntingOpponent.instanceId;
    }

    // Default target for attack cards if not clicked
    if (!targetId && (card.target === 'single_enemy' || card.type === 'attack')) {
      const liveOpponents = opposingTeam.filter((s) => !s.isUnstuffed);
      if (liveOpponents.length > 0) {
        targetId = liveOpponents[0].instanceId;
      }
    }

    let targetStuffy = [...friendlyTeam, ...opposingTeam].find((s) => s.instanceId === targetId);

    // Identify attacker stuffy for animation, energy bonuses, and miss checks
    const attackerStuffy = friendlyTeam.find((s) => s.speciesId === card.stuffyId) || friendlyTeam[0];
    const attackerEnergy = attackerStuffy?.statusEffects.find((e) => e.type === 'energy')?.value || 0;

    // Check if attacker is in an Earthquake crack (50% chance to miss attacks)
    let attackMissed = false;
    if ((card.type === 'attack' || card.damage) && attackerStuffy?.statusEffects.some((e) => e.type === 'earthquake_crack')) {
      if (Math.random() < 0.5) {
        attackMissed = true;
        state.addLog(`💨 ${attackerStuffy.name} is trapped in an Earthquake crack and MISSED their attack!`, 'status');
      }
    }

    // Determine Animation Type (Melee Lunge vs Ranged Projectile)
    let isRanged = false;
    let projectileType: ActiveAttackAnimation['projectileType'] = 'slash';

    if (card.type === 'attack' || card.damage) {
      const cName = card.name.toLowerCase();
      const sId = card.stuffyId;

      if (sId === 'toothless' || cName.includes('plasma')) {
        isRanged = true;
        projectileType = 'plasma';
      } else if (sId === 'eevee' || cName.includes('laser') || cName.includes('missile')) {
        isRanged = true;
        projectileType = 'laser';
      } else if (sId === 'fifi' || cName.includes('gas') || cName.includes('fart') || cName.includes('cloud')) {
        isRanged = true;
        projectileType = 'gas';
      } else if (sId === 'dear' || cName.includes('dart') || cName.includes('spit')) {
        isRanged = true;
        projectileType = 'dart';
      } else if (sId === 'slugmee' || sId === 'chanteira' || cName.includes('song') || cName.includes('sonar') || cName.includes('hug')) {
        isRanged = true;
        projectileType = 'sonic';
      } else if (sId === 'cidney' || sId === 'cole' || cName.includes('acorn') || cName.includes('spin') || cName.includes('toss')) {
        isRanged = true;
        projectileType = 'rock';
      } else if (card.isPlayerCard && (cName.includes('bolt') || cName.includes('poke') || cName.includes('hammer'))) {
        isRanged = true;
        projectileType = 'needle';
      } else {
        isRanged = false;
        projectileType = 'slash';
      }

      set({
        activeAttackAnimation: {
          attackerId: attackerStuffy.instanceId,
          targetId: targetStuffy?.instanceId,
          isRanged,
          projectileType,
          cardName: card.name,
        },
      });

      setTimeout(() => {
        set({ activeAttackAnimation: null });
      }, 700);
    }

    // Apply Card Effects
    // 1. Single Enemy Attack
    if ((card.target === 'single_enemy' || (!card.target && card.damage)) && targetStuffy) {
      let dmg = card.damage || 0;
      if (card.damage && attackerEnergy > 0) {
        dmg += attackerEnergy;
      }
      if (attackMissed) {
        dmg = 0;
      } else {
        if (card.damage && attackerEnergy > 0) {
          state.addLog(`⚡ ${attackerStuffy.name}'s Energy boosted attack by +${attackerEnergy}!`, 'special');
        }
        if (targetStuffy.statusEffects.some((e) => e.type === 'earthquake_crack')) {
          dmg = dmg * 2;
          state.addLog(`${targetStuffy.name} is in an earthquake crack! Takes 2x damage!`, 'damage');
        }
        if (targetStuffy.statusEffects.some((e) => e.type === 'damage_reduction')) {
          dmg = Math.round(dmg * 0.25);
        }

        if (targetStuffy.shield >= dmg) {
          targetStuffy.shield -= dmg;
        } else {
          const remainingDmg = dmg - targetStuffy.shield;
          targetStuffy.shield = 0;
          targetStuffy.currentHp = Math.max(0, targetStuffy.currentHp - remainingDmg);
        }

        state.addLog(`${card.name} dealt ${dmg} damage to ${targetStuffy.name}!`, 'damage');
        if (dmg > 0 && (!isMultiplayer || state.activeSide === state.localPlayerId)) {
          recordDamageDealt(dmg);
        }

        // Mirror Mimic 30% Reflection
        if (targetStuffy.speciesId === 'mirror_mimic' && dmg > 0 && attackerStuffy && !attackerStuffy.isUnstuffed) {
          const reflected = Math.max(1, Math.round(dmg * 0.3));
          attackerStuffy.currentHp = Math.max(0, attackerStuffy.currentHp - reflected);
          if (attackerStuffy.currentHp <= 0) attackerStuffy.isUnstuffed = true;
          state.addLog(`🪞 MIRROR REFLECTION: The Mirror Doppelganger reflected ${reflected} damage back onto ${attackerStuffy.name}!`, 'damage');
        }
      }

      // Lifesteal implementation: heals attacker for full damage value
      if (card.lifesteal && card.stuffyId) {
        const attacker = friendlyTeam.find((s) => s.speciesId === card.stuffyId);
        if (attacker && !attacker.isUnstuffed) {
          const lifestealHeal = attackMissed ? 0 : (card.damage || dmg);
          if (lifestealHeal > 0) {
            attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + lifestealHeal);
            if (attacker.statusEffects.some((e) => e.type === 'fire')) {
              attacker.statusEffects = attacker.statusEffects.filter((e) => e.type !== 'fire');
              state.addLog(`💧 EXTINGUISHED: Lifesteal healing put out the fire on ${attacker.name}!`, 'heal');
            }
            sound.playHealSound();
            state.addLog(`🩸 ${attacker.name} lifestealed ${lifestealHeal} HP! (${attacker.currentHp}/${attacker.maxHp} HP)`, 'heal');
          }
        }
      }

      if (card.brainDamage && !attackMissed) {
        targetStuffy.statusEffects.push({ type: 'brain_damaged' });
        state.addLog(`${targetStuffy.name} suffered Brain Damage!`, 'status');
      }

      // Slay the Spire Poison Stacking
      if (card.poison && !attackMissed) {
        const existing = targetStuffy.statusEffects.find((e) => e.type === 'poison');
        if (existing) {
          existing.value = (existing.value || 0) + card.poison;
        } else {
          targetStuffy.statusEffects.push({ type: 'poison', value: card.poison });
        }
        const totalP = existing ? existing.value : card.poison;
        state.addLog(`☠️ ${targetStuffy.name} received +${card.poison} Poison (Total: ${totalP} DoT)!`, 'status');
      }

      if (targetStuffy.currentHp <= 0) {
        targetStuffy.isUnstuffed = true;
        state.addLog(`${targetStuffy.name} was UNSTUFFED!`, 'damage');
        handleStuffyCasualty(state, targetStuffy);
        autoDiscardAndRedrawForUnstuffed(targetStuffy, state.activeSide === 'p2', state, set);
      }
    }

    // 2. All Enemies Attack
    if (card.target === 'all_enemies') {
      const energyAdd = (card.damage && attackerEnergy > 0) ? attackerEnergy : 0;
      const baseDmg = attackMissed ? 0 : ((card.damage || 0) + energyAdd);
      if (card.damage && attackerEnergy > 0 && !attackMissed) {
        state.addLog(`⚡ ${attackerStuffy.name}'s Energy boosted all-enemy attack by +${attackerEnergy}!`, 'special');
      }
      let totalLifestealEarned = 0;

      opposingTeam.forEach((enemy) => {
        if (!enemy.isUnstuffed) {
          let dmg = baseDmg;
          if (dmg > 0) {
            if (enemy.statusEffects.some((e) => e.type === 'earthquake_crack')) dmg *= 2;
            if (enemy.statusEffects.some((e) => e.type === 'damage_reduction')) dmg = Math.round(dmg * 0.25);

            totalLifestealEarned += dmg;

            if (enemy.shield >= dmg) {
              enemy.shield -= dmg;
            } else {
              const rem = dmg - enemy.shield;
              enemy.shield = 0;
              enemy.currentHp = Math.max(0, enemy.currentHp - rem);
            }

            if (card.poison) {
              const existing = enemy.statusEffects.find((e) => e.type === 'poison');
              if (existing) {
                existing.value = (existing.value || 0) + card.poison;
              } else {
                enemy.statusEffects.push({ type: 'poison', value: card.poison });
              }
            }

            if (enemy.currentHp <= 0) {
              enemy.isUnstuffed = true;
              state.addLog(`${enemy.name} was UNSTUFFED!`, 'damage');
              handleStuffyCasualty(state, enemy);
              autoDiscardAndRedrawForUnstuffed(enemy, state.activeSide === 'p2', state, set);
            }
          }
        }
      });

      if (attackMissed) {
        state.addLog(`${card.name} missed all enemies due to Earthquake crack!`, 'status');
      } else {
        state.addLog(`${card.name} dealt ${baseDmg} AoE damage!`, 'damage');
        if (baseDmg > 0 && (!isMultiplayer || state.activeSide === state.localPlayerId)) {
          const hitCount = opposingTeam.filter((e) => !e.isUnstuffed).length;
          recordDamageDealt(baseDmg * hitCount);
        }
      }

      // Lifesteal across all enemies
      if (card.lifesteal && card.stuffyId && totalLifestealEarned > 0) {
        const attacker = friendlyTeam.find((s) => s.speciesId === card.stuffyId);
        if (attacker && !attacker.isUnstuffed) {
          attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + totalLifestealEarned);
          sound.playHealSound();
          state.addLog(`🩸 ${attacker.name} lifestealed ${totalLifestealEarned} HP across all enemies! (${attacker.currentHp}/${attacker.maxHp} HP)`, 'heal');
        }
      }
    }

    // 3. SPECIAL ABILITIES & HEALING

    // SLUGMEE S1: "Slug me, slug you, now I'm gonna hug you"
    if (card.id === 'slugmee_s1' || card.specialActionId === 'slug_hug') {
      const slugmee = friendlyTeam.find((s) => s.speciesId === 'slugmee');
      if (slugmee && !slugmee.isUnstuffed) {
        slugmee.currentHp = Math.max(0, slugmee.currentHp - 10);
        state.addLog(`🎶 Slugmee sang the deadly verse and suffered 10 self-damage! (${slugmee.currentHp}/${slugmee.maxHp} HP)`, 'damage');

        // CRITICAL RULE: If killed, do NOT proceed!
        if (slugmee.currentHp <= 0) {
          slugmee.isUnstuffed = true;
          state.addLog(`Slugmee was unstuffed by her own deadly song! The hug did not proceed!`, 'damage');
          autoDiscardAndRedrawForUnstuffed(slugmee, state.activeSide !== 'p2', state, set);
        } else {
          // If survived: deals 35 damage to target
          if (targetStuffy) {
            let dmg = 35;
            if (targetStuffy.shield >= dmg) targetStuffy.shield -= dmg;
            else {
              const rem = dmg - targetStuffy.shield;
              targetStuffy.shield = 0;
              targetStuffy.currentHp = Math.max(0, targetStuffy.currentHp - rem);
            }
            state.addLog(`Slugmee hugged ${targetStuffy.name} dealing 35 deadly damage!`, 'damage');
            if (targetStuffy.currentHp <= 0) {
              targetStuffy.isUnstuffed = true;
              state.addLog(`${targetStuffy.name} was UNSTUFFED by the Deadly Hug!`, 'damage');
              handleStuffyCasualty(state, targetStuffy);
              autoDiscardAndRedrawForUnstuffed(targetStuffy, state.activeSide === 'p2', state, set);
            }
          }

          // Heals herself for 20 HP
          slugmee.currentHp = Math.min(slugmee.maxHp, slugmee.currentHp + 20);
          state.addLog(`Slugmee absorbed fluffy essence, healing herself for 20 HP!`, 'heal');

          // Revives 1 fallen ally with 20 HP
          const fallenAlly = friendlyTeam.find((s) => s.isUnstuffed && !s.isPermanentlyDevoured);
          if (fallenAlly) {
            fallenAlly.isUnstuffed = false;
            fallenAlly.currentHp = 20;
            state.addLog(`The deadly song REVIVED ${fallenAlly.name} with 20 HP!`, 'heal');
          }
        }
      }
    }

    // SLUGMEE S2: Symphony of the Slime (revives fallen teammate with 25 HP, heals active allies for 20 HP)
    else if (card.id === 'slugmee_s2') {
      friendlyTeam.forEach((ally) => {
        if (!ally.isUnstuffed) {
          ally.currentHp = Math.min(ally.maxHp, ally.currentHp + 20);
        }
      });
      const fallenAlly = friendlyTeam.find((s) => s.isUnstuffed && !s.isPermanentlyDevoured);
      if (fallenAlly) {
        fallenAlly.isUnstuffed = false;
        fallenAlly.currentHp = 25;
        state.addLog(`Symphony of the Slime REVIVED ${fallenAlly.name} with 25 HP!`, 'heal');
      }
      state.addLog(`Symphony of the Slime healed active allies for 20 HP!`, 'heal');
    }

    // SLUGMEE B3: Slug Sacrifice Heal (Slugmee takes 5 damage and heals ANOTHER ally for 22 HP; CANNOT heal herself!)
    else if (card.id === 'slugmee_b3') {
      const slugmee = friendlyTeam.find((s) => s.speciesId === 'slugmee');
      if (slugmee && !slugmee.isUnstuffed) {
        slugmee.currentHp = Math.max(1, slugmee.currentHp - 5);
        state.addLog(`Slugmee took 5 sacrifice damage!`, 'damage');
      }

      const otherAllies = friendlyTeam.filter((s) => s.speciesId !== 'slugmee' && !s.isUnstuffed);
      let targetOther = targetStuffy && targetStuffy.speciesId !== 'slugmee' ? targetStuffy : null;
      if (!targetOther && otherAllies.length > 0) {
        otherAllies.sort((a, b) => a.currentHp / a.maxHp - b.currentHp / b.maxHp);
        targetOther = otherAllies[0];
      }

      if (targetOther) {
        targetOther.currentHp = Math.min(targetOther.maxHp, targetOther.currentHp + 22);
        targetOther.statusEffects = targetOther.statusEffects.filter((e) => e.type !== 'brain_damaged');
        state.addLog(`Slugmee healed ${targetOther.name} for 22 HP! (Cannot heal herself)`, 'heal');
      } else {
        state.addLog(`Slugmee has no other allies to heal!`, 'special');
      }
    } else if (card.type === 'heal' || card.heal) {
      const healAmount = card.heal || 0;

      if (card.target === 'self') {
        const ally = targetStuffy || friendlyTeam.find((s) => s.speciesId === card.stuffyId) || friendlyTeam[0];
        if (ally && !ally.isUnstuffed) {
          ally.currentHp = Math.min(ally.maxHp, ally.currentHp + healAmount);
          ally.statusEffects = ally.statusEffects.filter((e) => e.type !== 'brain_damaged');
          if (ally.statusEffects.some((e) => e.type === 'fire')) {
            ally.statusEffects = ally.statusEffects.filter((e) => e.type !== 'fire');
            state.addLog(`💧 EXTINGUISHED: Healing put out the fire on ${ally.name}!`, 'heal');
          }
          state.addLog(`${card.name} healed ${ally.name} for ${healAmount} HP!`, 'heal');
        }
      } else if (card.target === 'all_allies') {
        friendlyTeam.forEach((ally) => {
          if (!ally.isUnstuffed) {
            ally.currentHp = Math.min(ally.maxHp, ally.currentHp + healAmount);
            ally.statusEffects = ally.statusEffects.filter((e) => e.type !== 'brain_damaged');
            if (ally.statusEffects.some((e) => e.type === 'fire')) {
              ally.statusEffects = ally.statusEffects.filter((e) => e.type !== 'fire');
              state.addLog(`💧 EXTINGUISHED: Healing put out the fire on ${ally.name}!`, 'heal');
            }
          }
        });
        state.addLog(`${card.name} healed all allies for ${healAmount} HP!`, 'heal');
      } else if (card.target === 'single_ally' || !card.target) {
        let ally = targetStuffy;
        if (!ally || !friendlyTeam.some((f) => f.instanceId === ally?.instanceId)) {
          const liveAllies = friendlyTeam.filter((s) => !s.isUnstuffed);
          liveAllies.sort((a, b) => a.currentHp / a.maxHp - b.currentHp / b.maxHp);
          ally = liveAllies[0];
        }
        if (ally && !ally.isUnstuffed) {
          ally.currentHp = Math.min(ally.maxHp, ally.currentHp + healAmount);
          ally.statusEffects = ally.statusEffects.filter((e) => e.type !== 'brain_damaged');
          if (ally.statusEffects.some((e) => e.type === 'fire')) {
            ally.statusEffects = ally.statusEffects.filter((e) => e.type !== 'fire');
            state.addLog(`💧 EXTINGUISHED: Healing put out the fire on ${ally.name}!`, 'heal');
          }
          state.addLog(`${card.name} healed ${ally.name} for ${healAmount} HP!`, 'heal');
        }
      }
    }

    if (card.type === 'restitch' || card.canRevive) {
      let unstuffedAlly = targetStuffy;
      if (!unstuffedAlly || !unstuffedAlly.isUnstuffed) {
        unstuffedAlly = friendlyTeam.find((s) => s.isUnstuffed && !s.isPermanentlyDevoured);
      }
      if (unstuffedAlly && unstuffedAlly.isUnstuffed) {
        if (unstuffedAlly.isPermanentlyDevoured) {
          state.addLog(`${unstuffedAlly.name} was swallowed whole and CANNOT be restitched!`, 'special');
          return false;
        }
        unstuffedAlly.isUnstuffed = false;
        unstuffedAlly.statusEffects = unstuffedAlly.statusEffects.filter((e) => e.type !== 'fire');
        const hasGoldenNeedle = (state.activeRelics || []).some((r) => r.id === 'golden_needle');
        const bonusRevivalHp = hasGoldenNeedle ? 15 : 0;
        unstuffedAlly.currentHp = (card.heal || 25) + bonusRevivalHp;
        if (hasGoldenNeedle) {
          state.addLog(`🪡 Golden Needle granted +15 bonus HP upon restitching! (${unstuffedAlly.currentHp} HP)`, 'heal');
        } else {
          state.addLog(`${unstuffedAlly.name} was RESTITCHED with ${unstuffedAlly.currentHp} HP!`, 'heal');
        }
      }
    }

    // 4. Defense / Shield
    if (card.block) {
      if (card.target === 'all_allies') {
        friendlyTeam.forEach((ally) => {
          if (!ally.isUnstuffed) ally.shield += card.block!;
        });
        state.addLog(`All allies gained ${card.block} Shield!`, 'shield');
      } else if (card.target === 'single_ally' && targetStuffy && friendlyTeam.some((f) => f.instanceId === targetStuffy?.instanceId)) {
        targetStuffy.shield += card.block;
        state.addLog(`${targetStuffy.name} gained ${card.block} Shield!`, 'shield');
      } else {
        // Caster gains shield (self, single_enemy, all_enemies, none - e.g. Cole's armored roll/storm)
        const caster = friendlyTeam.find((s) => s.speciesId === card.stuffyId) || (targetStuffy && friendlyTeam.some((f) => f.instanceId === targetStuffy?.instanceId) ? targetStuffy : friendlyTeam[0]);
        if (caster && !caster.isUnstuffed) {
          caster.shield += card.block;
          state.addLog(`${caster.name} gained ${card.block} Shield!`, 'shield');
        }
      }
    }

    // 5. EEVEE S3: Creepy Reality Glitch (Gain 25 Shield & IMMEDIATELY draw 3 cards!)
    if (card.id === 'eevee_s3') {
      drawImmediate(3);
    }

    // BEAKER B3: Owl Night Vision (IMMEDIATELY draw 2 cards!)
    if (card.id === 'beaker_b3') {
      drawImmediate(2);
    }

    // 6. Other Special Cards
    if (card.specialActionId === 'earthquake') {
      opposingTeam.forEach((enemy) => {
        if (!enemy.isUnstuffed) {
          if (Math.random() < 0.75) {
            enemy.statusEffects.push({ type: 'earthquake_crack' });
            state.addLog(`${enemy.name} fell into an Earthquake crack!`, 'status');
          }
        }
      });
    }

    if (card.specialActionId === 'swallow_whole' && targetStuffy) {
      targetStuffy.currentHp = 0;
      targetStuffy.isUnstuffed = true;
      targetStuffy.isPermanentlyDevoured = true;
      const finlee = friendlyTeam.find((s) => s.speciesId === 'finlee');
      if (finlee) {
        finlee.currentHp = finlee.maxHp;
        sound.playHealSound();
        state.addLog(`🩸 Finlee SWALLOWED ${targetStuffy.name} WHOLE! Lifestealed back to maximum stuffing (${finlee.maxHp}/${finlee.maxHp} HP)!`, 'special');
      }
      handleStuffyCasualty(state, targetStuffy);
      autoDiscardAndRedrawForUnstuffed(targetStuffy, state.activeSide === 'p2', state, set);
    }

    // Finlee S3: Leviathan Hunger (Finlee's Max Health Ability)
    if (card.id.startsWith('finlee_s3')) {
      const finlee = friendlyTeam.find((s) => s.speciesId === 'finlee');
      if (finlee) {
        const boost = card.upgraded ? 30 : 20;
        finlee.maxHp += boost;
        finlee.currentHp = finlee.maxHp;
        sound.playHealSound();
        state.addLog(
          `🐋 Finlee's "Leviathan Hunger" increased his Max HP by +${boost}! (Now ${finlee.maxHp} Max HP) and healed to full!`,
          'heal'
        );
      }
    }

    if (card.specialActionId === 'shell_up') {
      const henry = friendlyTeam.find((s) => s.speciesId === 'henry');
      if (henry) {
        henry.statusEffects.push({ type: 'taunt', duration: 1 });
        henry.statusEffects.push({ type: 'damage_reduction', duration: 1, value: 75 });
        state.addLog(`Henry Shelled Up! Taunting enemies and taking 75% less damage!`, 'shield');
      }
    }

    // Shadow Special Actions: Energy Infusion & Energy Doubling
    if (card.specialActionId === 'shadow_energy_1' || card.specialActionId === 'shadow_energy_2') {
      const shadow = friendlyTeam.find((s) => s.speciesId === 'shadow') || friendlyTeam[0];
      if (shadow && !shadow.isUnstuffed) {
        const addVal = card.specialActionId === 'shadow_energy_2' ? 2 : 1;
        const existing = shadow.statusEffects.find((e) => e.type === 'energy');
        if (existing) existing.value = (existing.value || 0) + addVal;
        else shadow.statusEffects.push({ type: 'energy', value: addVal });
        const curE = shadow.statusEffects.find((e) => e.type === 'energy')?.value || addVal;
        sound.playHealSound();
        state.addLog(`⚡ ${shadow.name} gained +${addVal} Energy! (Total: +${curE} strength!)`, 'special');
      }
    } else if (card.specialActionId === 'chaos_boost') {
      const shadow = friendlyTeam.find((s) => s.speciesId === 'shadow') || friendlyTeam[0];
      if (shadow && !shadow.isUnstuffed) {
        const existing = shadow.statusEffects.find((e) => e.type === 'energy');
        if (existing) existing.value = (existing.value || 0) + 5;
        else shadow.statusEffects.push({ type: 'energy', value: 5 });
        const curE = shadow.statusEffects.find((e) => e.type === 'energy')?.value || 5;
        sound.playHealSound();
        state.addLog(`💥 CHAOS BOOST SURGE! ${shadow.name} gained +5 Energy! (Total: +${curE} strength!)`, 'special');
      }
    } else if (card.specialActionId === 'limit_break') {
      const targetAlly = (targetStuffy && friendlyTeam.some((f) => f.instanceId === targetStuffy.instanceId))
        ? targetStuffy
        : friendlyTeam.find((s) => s.speciesId === 'shadow') || friendlyTeam[0];
      if (targetAlly && !targetAlly.isUnstuffed) {
        const existing = targetAlly.statusEffects.find((e) => e.type === 'energy');
        if (existing && existing.value && existing.value > 0) {
          existing.value = existing.value * 2;
        } else if (existing) {
          existing.value = 4;
        } else {
          targetAlly.statusEffects.push({ type: 'energy', value: 4 });
        }
        const curE = targetAlly.statusEffects.find((e) => e.type === 'energy')?.value || 4;
        sound.playHealSound();
        state.addLog(`⚡ LIMIT BREAK! DOUBLED ${targetAlly.name}'s Energy to +${curE} strength!`, 'special');
      }
    } else if (card.specialActionId === 'chaos_blast') {
      const shadow = friendlyTeam.find((s) => s.speciesId === 'shadow') || friendlyTeam[0];
      if (shadow && !shadow.isUnstuffed) {
        const existing = shadow.statusEffects.find((e) => e.type === 'energy');
        if (existing && existing.value && existing.value > 0) {
          existing.value = existing.value * 2;
        } else if (existing) {
          existing.value = 6;
        } else {
          shadow.statusEffects.push({ type: 'energy', value: 6 });
        }
        const curE = shadow.statusEffects.find((e) => e.type === 'energy')?.value || 6;
        state.addLog(`💥 CHAOS BLAST DOUBLED ${shadow.name}'s Energy to +${curE} strength!`, 'special');
      }
    } else if (card.specialActionId === 'chaos_control') {
      const shadow = friendlyTeam.find((s) => s.speciesId === 'shadow') || friendlyTeam[0];
      if (shadow && !shadow.isUnstuffed) {
        const existing = shadow.statusEffects.find((e) => e.type === 'energy');
        if (existing && existing.value && existing.value >= 4) {
          existing.value = existing.value * 2;
        } else if (existing) {
          existing.value = 8;
        } else {
          shadow.statusEffects.push({ type: 'energy', value: 8 });
        }
        const curE = shadow.statusEffects.find((e) => e.type === 'energy')?.value || 8;
        sound.playHealSound();
        state.addLog(`⏱️ CHAOS CONTROL! Stopped time and DOUBLED ${shadow.name}'s Energy to +${curE} strength!`, 'special');
      }
    } else if (card.specialActionId === 'inhibitor_release') {
      const shadow = friendlyTeam.find((s) => s.speciesId === 'shadow') || friendlyTeam[0];
      if (shadow && !shadow.isUnstuffed) {
        const existing = shadow.statusEffects.find((e) => e.type === 'energy');
        if (existing) existing.value = (existing.value || 0) + 6;
        else shadow.statusEffects.push({ type: 'energy', value: 6 });
        const curE = shadow.statusEffects.find((e) => e.type === 'energy')?.value || 6;
        sound.playHealSound();
        state.addLog(`🔓 INHIBITOR RINGS REMOVED! ${shadow.name} gained +6 Energy! (Total: +${curE} strength!)`, 'special');
      }
    }

    // Spot (Zoo Leopard) Doubling and Transferring Mechanics:
    if (card.specialActionId === 'spot_hue_shift') {
      const poisonedAlly = friendlyTeam.find((s) => !s.isUnstuffed && s.statusEffects.some((e) => e.type === 'poison'));
      if (poisonedAlly) {
        poisonedAlly.statusEffects = poisonedAlly.statusEffects.filter((e) => e.type !== 'poison');
        poisonedAlly.shield += 5;
        sound.playTransferSound();
        state.addLog(`🎨 HUE SHIFT! Cleansed Poison from ${poisonedAlly.name} and converted into +5 Shield!`, 'special');
      }
    } else if (card.specialActionId === 'spot_swapper') {
      const poisonedAlly = friendlyTeam.find((s) => !s.isUnstuffed && s.statusEffects.some((e) => e.type === 'poison'));
      if (poisonedAlly && targetStuffy) {
        const poisonEff = poisonedAlly.statusEffects.find((e) => e.type === 'poison');
        if (poisonEff && poisonEff.value) {
          const transferVal = Math.min(3, poisonEff.value);
          poisonEff.value -= transferVal;
          if (poisonEff.value <= 0) {
            poisonedAlly.statusEffects = poisonedAlly.statusEffects.filter((e) => e.type !== 'poison');
          }
          const targetPoison = targetStuffy.statusEffects.find((e) => e.type === 'poison');
          if (targetPoison) targetPoison.value = (targetPoison.value || 0) + transferVal;
          else targetStuffy.statusEffects.push({ type: 'poison', value: transferVal });
          sound.playTransferSound();
          state.addLog(`🔄 SPOT SWAPPER! Transferred ${transferVal} Poison from ${poisonedAlly.name} to ${targetStuffy.name}!`, 'special');
        }
      }
    } else if (card.specialActionId === 'spot_guard') {
      const spot = friendlyTeam.find((s) => s.speciesId === 'spot' && !s.isUnstuffed);
      const targetAlly = targetStuffy || friendlyTeam.find((s) => !s.isUnstuffed && s.speciesId !== 'spot') || spot;
      if (targetAlly) {
        targetAlly.shield += 7;
        sound.playShieldSound();
        if (spot && spot.instanceId !== targetAlly.instanceId) {
          const spotEnergy = spot.statusEffects.find((e) => e.type === 'energy');
          if (spotEnergy && spotEnergy.value && spotEnergy.value > 0) {
            spotEnergy.value -= 1;
            const allyEnergy = targetAlly.statusEffects.find((e) => e.type === 'energy');
            if (allyEnergy) allyEnergy.value = (allyEnergy.value || 0) + 1;
            else targetAlly.statusEffects.push({ type: 'energy', value: 1 });
            sound.playTransferSound();
            state.addLog(`🛡️ POLKA GUARD: Transferred 1 Energy from Spot to ${targetAlly.name}!`, 'special');
          }
        }
      }
    } else if (card.specialActionId === 'spot_toxin_dot' && targetStuffy) {
      const pEff = targetStuffy.statusEffects.find((e) => e.type === 'poison');
      if (pEff) pEff.value = (pEff.value || 0) + 3;
      else targetStuffy.statusEffects.push({ type: 'poison', value: 3 });
      sound.playPoisonSound();
      state.addLog(`🧪 TOXIN DOT: Applied +3 Poison onto ${targetStuffy.name}!`, 'special');
    } else if (card.specialActionId === 'spot_double_shield') {
      const targetAlly = targetStuffy || friendlyTeam.find((s) => !s.isUnstuffed) || friendlyTeam[0];
      if (targetAlly) {
        const bonus = targetAlly.shield > 0 ? targetAlly.shield : 8;
        targetAlly.shield += bonus;
        sound.playShieldSound();
        state.addLog(`✨ DOUBLE TROUBLE! DOUBLED ${targetAlly.name}'s Shield (+${bonus} Shield)!`, 'special');
      }
    } else if (card.specialActionId === 'spot_energy_relay') {
      // USER RULE: all the stuffies on your board lose all their energy, two gets added in then goes to selected stuffy!
      const recipient = targetStuffy || friendlyTeam.find((s) => !s.isUnstuffed) || friendlyTeam[0];
      let totalDrained = 0;
      friendlyTeam.forEach((ally) => {
        if (!ally.isUnstuffed) {
          const eff = ally.statusEffects.find((e) => e.type === 'energy');
          if (eff && eff.value) {
            totalDrained += eff.value;
          }
          ally.statusEffects = ally.statusEffects.filter((e) => e.type !== 'energy');
        }
      });
      const totalAdd = totalDrained + 2;
      const recEff = recipient.statusEffects.find((e) => e.type === 'energy');
      if (recEff) {
        recEff.value = (recEff.value || 0) + totalAdd;
      } else {
        recipient.statusEffects.push({ type: 'energy', value: totalAdd });
      }
      sound.playEnergyChargeSound();
      state.addLog(`⚡ ENERGY RELAY! All friendly stuffies surrendered all energy (${totalDrained}), added +2 bonus Energy, and channeled ${totalAdd} Energy to ${recipient.name}!`, 'special');
      if (totalAdd >= 6) {
        unlockAdvancement('relay_surge');
      }
    } else if (card.specialActionId === 'spot_toxin_transfer' && targetStuffy) {
      const poisonedAlly = friendlyTeam.find((s) => !s.isUnstuffed && s.statusEffects.some((e) => e.type === 'poison'));
      if (poisonedAlly) {
        const pEff = poisonedAlly.statusEffects.find((e) => e.type === 'poison');
        const count = pEff?.value || 0;
        poisonedAlly.statusEffects = poisonedAlly.statusEffects.filter((e) => e.type !== 'poison');
        const targetPEff = targetStuffy.statusEffects.find((e) => e.type === 'poison');
        if (targetPEff) targetPEff.value = (targetPEff.value || 0) + count;
        else targetStuffy.statusEffects.push({ type: 'poison', value: count });
        sound.playTransferSound();
        state.addLog(`🔄 TOXIN TRANSFER! Removed all ${count} Poison from ${poisonedAlly.name} and dumped it all on ${targetStuffy.name}!`, 'special');
      }
    } else if (card.specialActionId === 'spot_multiply_poison' && targetStuffy) {
      const pEff = targetStuffy.statusEffects.find((e) => e.type === 'poison');
      if (pEff && pEff.value) {
        const oldVal = pEff.value;
        pEff.value = oldVal * 2;
        sound.playPoisonSound();
        state.addLog(`💥 SPOTTED MULTIPLICATION! DOUBLED ${targetStuffy.name}'s Poison (${oldVal} -> ${pEff.value})!`, 'special');
      } else {
        targetStuffy.statusEffects.push({ type: 'poison', value: 4 });
        sound.playPoisonSound();
        state.addLog(`💥 SPOTTED MULTIPLICATION! Inflicted +4 Poison on ${targetStuffy.name}!`, 'special');
      }
    } else if (card.specialActionId === 'spot_double_energy') {
      const targetAlly = targetStuffy || friendlyTeam.find((s) => !s.isUnstuffed) || friendlyTeam[0];
      if (targetAlly) {
        const eEff = targetAlly.statusEffects.find((e) => e.type === 'energy');
        if (eEff && eEff.value && eEff.value > 0) {
          const oldVal = eEff.value;
          eEff.value = oldVal * 2;
          sound.playEnergyChargeSound();
          state.addLog(`⚡ ENERGY DUPLICATOR! DOUBLED ${targetAlly.name}'s Energy (${oldVal} -> ${eEff.value} strength)!`, 'special');
        } else {
          targetAlly.statusEffects.push({ type: 'energy', value: 3 });
          sound.playEnergyChargeSound();
          state.addLog(`⚡ ENERGY DUPLICATOR! Infused +3 Energy into ${targetAlly.name}!`, 'special');
        }
      }
    } else if (card.specialActionId === 'spot_shield_steal' && targetStuffy) {
      const stolen = Math.floor(targetStuffy.shield * 0.5);
      if (stolen > 0) {
        targetStuffy.shield -= stolen;
        const spot = friendlyTeam.find((s) => s.speciesId === 'spot' && !s.isUnstuffed) || friendlyTeam[0];
        spot.shield += stolen;
        sound.playTransferSound();
        state.addLog(`🎨 COLOR DISPERSION! Stole ${stolen} Shield from ${targetStuffy.name} and transferred to ${spot.name}!`, 'special');
      }
    } else if (card.specialActionId === 'spot_double_all_buffs') {
      friendlyTeam.filter((s) => !s.isUnstuffed).forEach((ally) => {
        if (ally.shield > 0) ally.shield *= 2;
        else ally.shield += 8;
        const eEff = ally.statusEffects.find((e) => e.type === 'energy');
        if (eEff && eEff.value && eEff.value > 0) eEff.value *= 2;
        else ally.statusEffects.push({ type: 'energy', value: 2 });
      });
      sound.playEnergyChargeSound();
      state.addLog(`🎪 ZOO ACROBATICS! DOUBLED all Shield and Energy buffs on your ENTIRE squad!`, 'special');
    } else if (card.specialActionId === 'spot_contagious' && targetStuffy) {
      const poisonVal = targetStuffy.statusEffects.find((e) => e.type === 'poison')?.value || 0;
      const hasWeak = targetStuffy.statusEffects.some((e) => e.type === 'weak');
      opposingTeam.filter((s) => !s.isUnstuffed && s.instanceId !== targetStuffy.instanceId).forEach((other) => {
        if (poisonVal > 0) {
          const pEff = other.statusEffects.find((e) => e.type === 'poison');
          if (pEff) pEff.value = (pEff.value || 0) + poisonVal;
          else other.statusEffects.push({ type: 'poison', value: poisonVal });
        }
        if (hasWeak && !other.statusEffects.some((e) => e.type === 'weak')) {
          other.statusEffects.push({ type: 'weak', value: 2 });
        }
      });
      sound.playTransferSound();
      state.addLog(`🔴 CONTAGIOUS SPOTS! Copied ${poisonVal} Poison and Weak to ALL other enemies!`, 'special');
    } else if (card.specialActionId === 'spot_grand_relocation') {
      let totalPoison = 0;
      friendlyTeam.filter((s) => !s.isUnstuffed).forEach((ally) => {
        const p = ally.statusEffects.find((e) => e.type === 'poison');
        if (p) totalPoison += p.value || 0;
        ally.statusEffects = ally.statusEffects.filter((e) => !['poison', 'weak', 'brain_damage'].includes(e.type));
      });
      const leader = opposingTeam.find((s) => !s.isUnstuffed) || opposingTeam[0];
      if (leader && totalPoison > 0) {
        const pEff = leader.statusEffects.find((e) => e.type === 'poison');
        if (pEff) pEff.value = (pEff.value || 0) + totalPoison;
        else leader.statusEffects.push({ type: 'poison', value: totalPoison });
        sound.playTransferSound();
        state.addLog(`🧹 GRAND RELOCATION! Cleansed all debuffs from allies and transferred ${totalPoison} Poison onto ${leader.name}!`, 'special');
      }
    } else if (card.specialActionId === 'spot_put_me_in_zoo') {
      friendlyTeam.filter((s) => !s.isUnstuffed).forEach((ally) => {
        if (ally.shield > 0) ally.shield *= 2;
        const eEff = ally.statusEffects.find((e) => e.type === 'energy');
        if (eEff && eEff.value) eEff.value *= 2;
      });
      opposingTeam.filter((s) => !s.isUnstuffed).forEach((enemy) => {
        const pEff = enemy.statusEffects.find((e) => e.type === 'poison');
        if (pEff && pEff.value) pEff.value *= 2;
      });
      sound.playEnergyChargeSound();
      state.addLog(`🎪 PUT ME IN THE ZOO! DOUBLED all ally buffs and DOUBLED all enemy Poison!`, 'special');
    } else if (card.specialActionId === 'spot_omni_transfer' && targetStuffy) {
      const ally = friendlyTeam.find((s) => !s.isUnstuffed) || friendlyTeam[0];
      const allyEffects = [...ally.statusEffects];
      const enemyEffects = [...targetStuffy.statusEffects];
      ally.statusEffects = enemyEffects.filter((e) => e.type === 'energy' || e.type === 'shield_boost');
      targetStuffy.statusEffects = allyEffects.filter((e) => e.type === 'poison' || e.type === 'weak');
      const targetP = targetStuffy.statusEffects.find((e) => e.type === 'poison');
      if (targetP && targetP.value) targetP.value *= 2;
      sound.playTransferSound();
      state.addLog(`🔄 OMNI-SPOT TRANSFER! Swapped status effects between ${ally.name} and ${targetStuffy.name}, and doubled Poison!`, 'special');
    } else if (card.specialActionId === 'spot_cataclysm' && targetStuffy) {
      const pEff = targetStuffy.statusEffects.find((e) => e.type === 'poison');
      if (pEff && pEff.value) {
        const oldVal = pEff.value;
        pEff.value = oldVal * 3;
        sound.playPoisonSound();
        state.addLog(`💥 SPOT CATACLYSM! TRIPLED ${targetStuffy.name}'s Poison (${oldVal} -> ${pEff.value})!`, 'special');
      }
    }

    // Player Energy Surge Card (infuses energy into target stuffy, boosted by cotton_core relic)
    if (card.id === 'player_energy') {
      const cottonCore = (state.activeRelics || []).find((r) => r.id === 'cotton_core');
      const addEnergy = 3 + (cottonCore ? 1 : 0);
      const ally = (targetStuffy && friendlyTeam.some((f) => f.instanceId === targetStuffy.instanceId))
        ? targetStuffy
        : friendlyTeam.find((s) => !s.isUnstuffed) || friendlyTeam[0];
      if (ally && !ally.isUnstuffed) {
        const existing = ally.statusEffects.find((e) => e.type === 'energy');
        if (existing) {
          existing.value = (existing.value || 0) + addEnergy;
        } else {
          ally.statusEffects.push({ type: 'energy', value: addEnergy });
        }
        const totalEnergy = ally.statusEffects.find((e) => e.type === 'energy')?.value || addEnergy;
        sound.playHealSound();
        state.addLog(`⚡ ${ally.name} was infused with +${addEnergy} Energy! (Total Energy: +${totalEnergy} attack damage!)`, 'special');
      }
    }

    // Crackers management (starting with cost deduction)
    let workingCrackers = state.currentCrackers - card.cost;

    // Magic Needle & Spool Relic: Refund 1 Cracker on 3+ cost cards
    if (card.cost >= 3 && (state.activeRelics || []).some((r) => r.id === 'needle_and_thread')) {
      workingCrackers += 1;
      state.addLog(`🧵 Magic Needle & Spool refunded +1 Cracker! 🍪`, 'special');
    }

    if (card.id === 'player_cracker_feast') {
      workingCrackers += 3;
      state.addLog(`Opened Secret Cracker Tin! +3 Crackers! 🍪 (Now ${workingCrackers})`, 'special');
    } else if (card.specialActionId === 'acorn_hoard' || card.id === 'cidney_a1') {
      workingCrackers += 3;
      drawImmediate(2);
      state.addLog(`Cidney raided his Acorn Hoard! +3 Crackers and drew 2 cards! 🌰 (Now ${workingCrackers})`, 'special');
    } else if (card.id === 'cidney_s2') {
      workingCrackers += 3;
      state.addLog(`Infinite Nut Buffet energized the squad! +3 Crackers! 🍪 (Now ${workingCrackers})`, 'special');
    } else if (card.id === 'beaker_s2') {
      workingCrackers += 2;
      const beaker = friendlyTeam.find((s) => s.speciesId === 'beaker');
      if (beaker && !beaker.isUnstuffed) {
        beaker.currentHp = beaker.maxHp;
      }
      state.addLog(`Spirit of the National Park granted +2 Crackers and restored Beaker to full HP! 🍪`, 'special');
    } else if (card.id === 'joann_s3') {
      workingCrackers += 2;
      state.addLog(`Feline Royalty granted +2 Crackers! 🍪`, 'special');
    } else if (card.id === 'finlee_f3') {
      workingCrackers += 1;
      state.addLog(`Hungry Squeak granted +1 Cracker! 🍪`, 'special');
    } else if (card.id === 'cidney_c2') {
      workingCrackers += 1;
      state.addLog(`Acorn Stockpile granted +1 Cracker! 🍪`, 'special');
    }

    // Alex's S-Tier Strokenosis Mind Control
    if (card.specialActionId === 'strokenosis') {
      let opponentCards: Card[] = [];
      // USER RULE: if a stuffy is unstuffed on the other team, NONE of their cards should appear in strokenosis!
      const aliveOpposingSpecies = opposingTeam
        .filter((s) => !s.isUnstuffed && s.currentHp > 0)
        .map((s) => s.speciesId);

      if (state.gameMode === 'two_player' || state.gameMode === 'multiplayer') {
        const oppHand = state.activeSide === 'p1' ? state.enemyHand : state.playerHand;
        const oppDeck = state.activeSide === 'p1' ? state.enemyDeck : state.playerDeck;
        opponentCards = oppHand.filter((c) => !c.stuffyId || aliveOpposingSpecies.includes(c.stuffyId));
        if (opponentCards.length < 5) {
          const eligibleDeck = oppDeck.filter((c) => !c.stuffyId || aliveOpposingSpecies.includes(c.stuffyId));
          opponentCards = [...opponentCards, ...eligibleDeck.slice(0, 5 - opponentCards.length)];
        }
      } else {
        // Single Player / Campaign / Bot Mode: Use the deterministic enemyHand and enemyDeck
        if (state.enemyHand && state.enemyHand.length > 0) {
          opponentCards = state.enemyHand.filter((c) => !c.stuffyId || aliveOpposingSpecies.includes(c.stuffyId));
        }
        if (opponentCards.length < 5 && state.enemyDeck && state.enemyDeck.length > 0) {
          const eligibleEnemyDeck = state.enemyDeck.filter((c) => !c.stuffyId || aliveOpposingSpecies.includes(c.stuffyId));
          opponentCards = [...opponentCards, ...eligibleEnemyDeck.slice(0, 5 - opponentCards.length)];
        }
        if (opponentCards.length < 5) {
          const enemyPool = ALL_CARDS.filter((c) => c.stuffyId && aliveOpposingSpecies.includes(c.stuffyId));
          for (const c of enemyPool) {
            if (opponentCards.length >= 5) break;
            if (!opponentCards.some((ec) => ec.id === c.id)) {
              opponentCards.push(c);
            }
          }
        }
      }

      set({
        strokenosisActive: true,
        strokenosisCards: opponentCards.slice(0, 5),
      });
      state.addLog(`Alex unleashed STROKENOSIS! Mind-controlling the opponent's cards!`, 'special');
    }

    const finalCrackers = Math.max(0, workingCrackers);

    // Check if any friendly stuffies were unstuffed during card resolution; auto-discard their cards and redraw!
    let unplayableIdx = currentHand.findIndex((c) => getUnplayableReason(c, friendlyTeam) !== null);
    while (unplayableIdx !== -1) {
      const discardedCard = currentHand.splice(unplayableIdx, 1)[0];
      currentDiscard.push(discardedCard);
      if (currentDeck.length === 0 && currentDiscard.length > 0) {
        currentDeck = [...currentDiscard].sort(() => Math.random() - 0.5);
        currentDiscard = [];
      }
      if (currentDeck.length > 0) {
        currentHand.push(currentDeck.shift()!);
      }
      unplayableIdx = currentHand.findIndex((c) => getUnplayableReason(c, friendlyTeam) !== null);
    }

    // THE STUFFY AMALGAM BURST SPLIT MECHANIC:
    // When the Amalgam dies/is unstuffed, it splits into 5 stuffies:
    // Mega Joann, Slugmee, Thumper, Mega Chanteira, and Mega Cidney (Slugmee & Thumper are not megas)
    const deadAmalgamIdx = opposingTeam.findIndex((s) => s.speciesId === 'amalgam' && (s.isUnstuffed || s.currentHp <= 0));
    if (deadAmalgamIdx !== -1 && state.gameMode === 'campaign') {
      const splitEnemies: StuffyState[] = [
        {
          instanceId: `split_joann_${Date.now()}_1`,
          speciesId: 'joann',
          name: 'Mega Joann',
          maxHp: Math.round(75 * 1.05),
          currentHp: Math.round(75 * 1.05),
          shield: 10,
          isUnstuffed: false,
          statusEffects: [],
          isMega: true,
          customDeckTier: 'A-',
        },
        {
          instanceId: `split_slugmee_${Date.now()}_2`,
          speciesId: 'slugmee',
          name: 'Slugmee',
          maxHp: 60,
          currentHp: 60,
          shield: 0,
          isUnstuffed: false,
          statusEffects: [],
          isMega: false,
          customDeckTier: 'standard',
        },
        {
          instanceId: `split_thumper_${Date.now()}_3`,
          speciesId: 'thumper',
          name: 'Thumper',
          maxHp: 80,
          currentHp: 80,
          shield: 0,
          isUnstuffed: false,
          statusEffects: [],
          isMega: false,
          customDeckTier: 'standard',
        },
        {
          instanceId: `split_chanteira_${Date.now()}_4`,
          speciesId: 'chanteira',
          name: 'Mega Chanteira',
          maxHp: Math.round(80 * 1.05),
          currentHp: Math.round(80 * 1.05),
          shield: 10,
          isUnstuffed: false,
          statusEffects: [],
          isMega: true,
          customDeckTier: 'A-',
        },
        {
          instanceId: `split_cidney_${Date.now()}_5`,
          speciesId: 'cidney',
          name: 'Mega Cidney',
          maxHp: Math.round(82 * 1.05),
          currentHp: Math.round(82 * 1.05),
          shield: 10,
          isUnstuffed: false,
          statusEffects: [],
          isMega: true,
          customDeckTier: 'A-',
        },
      ];
      opposingTeam = splitEnemies;
      sound.playCrackSound();
      state.addLog('💥 THE STUFFY AMALGAM BURST OPEN! Mega Joann, Slugmee, Thumper, Mega Chanteira, and Mega Cidney have emerged!', 'special');
    }

    // Check Victory / Defeat precisely per side
    const p1TeamUpdated = state.activeSide === 'p2' ? opposingTeam : friendlyTeam;
    const p2TeamUpdated = state.activeSide === 'p2' ? friendlyTeam : opposingTeam;

    const p1RemainingCount = p1TeamUpdated.filter((s) => !s.isUnstuffed && s.currentHp > 0).length;
    const p2RemainingCount = p2TeamUpdated.filter((s) => !s.isUnstuffed && s.currentHp > 0).length;

    let battleResult = state.battleResult;

    // Update multiplayer players data if in multiplayer mode
    let updatedMultiplayerPlayers = state.multiplayerPlayers.map((p) => {
      const updatedTeam = p.team.map((stuffy) => {
        const found = [...friendlyTeam, ...opposingTeam].find((s) => s.instanceId === stuffy.instanceId);
        return found || stuffy;
      });
      const isEliminated = updatedTeam.every((s) => s.isUnstuffed);

      if (p.id === state.activeSide) {
        return {
          ...p,
          team: updatedTeam,
          hand: currentHand,
          deck: currentDeck,
          discard: currentDiscard,
          isEliminated,
        };
      }
      return {
        ...p,
        team: updatedTeam,
        isEliminated,
      };
    });

    if (state.gameMode === 'multiplayer' || state.gameMode === 'two_player') {
      if (updatedMultiplayerPlayers.length > 0) {
        const alivePlayers = updatedMultiplayerPlayers.filter((p) => !p.isEliminated);
        if (alivePlayers.length === 1) {
          const winner = alivePlayers[0];
          battleResult = `${winner.id}_victory` as any;
          state.addLog(`🏆 ${winner.name} WINS THE BATTLE!`, 'special');
        } else if (alivePlayers.length === 0) {
          battleResult = 'defeat';
        }
      } else {
        if (p2RemainingCount === 0 && p1RemainingCount > 0) {
          battleResult = 'p1_victory';
          state.addLog('PLAYER 1 WINS THE 2-PLAYER MATCH! 🏆', 'special');
        } else if (p1RemainingCount === 0 && p2RemainingCount > 0) {
          battleResult = 'p2_victory';
          state.addLog('PLAYER 2 WINS THE 2-PLAYER MATCH! 🏆', 'special');
        }
      }
    } else {
      if (p2RemainingCount === 0 && p1RemainingCount > 0) {
        battleResult = 'victory';
        if (p2TeamUpdated.length > 0 && p2TeamUpdated.every((s) => state.concussionKillTrack?.[s.instanceId])) {
          unlockAdvancement('concussion_kill');
        }
        state.addLog('VICTORY! All opposing stuffies defeated!', 'special');
      } else if (p1RemainingCount === 0) {
        battleResult = 'defeat';
        state.addLog('DEFEAT! All your stuffies were unstuffed!', 'special');
      }
    }

    let updatedMultiplayerActions = [...state.recentMultiplayerActions];
    if (isMultiplayer) {
      const actingPlayer = activeP || players.find((p) => p.id === state.activeSide);
      const actionItem: MultiplayerTurnAction = {
        turnNumber: state.turnNumber,
        playerSide: state.activeSide as PlayerSide,
        playerName: actingPlayer?.name || state.activeSide.toUpperCase(),
        cardName: card.name,
        cardType: card.type,
        cardTier: card.tier,
        targetName: targetStuffy?.name || (card.target === 'all_enemies' ? 'All Opponents' : 'Self/Squad'),
        damage: card.damage,
        heal: card.heal,
        effectDescription: card.description,
        wasUnstuffed: targetStuffy ? targetStuffy.currentHp <= 0 : false,
      };
      updatedMultiplayerActions.push(actionItem);
    }

    if (battleResult !== 'ongoing') {
      recordBattleOutcome(battleResult === 'victory' || battleResult === 'p1_victory');
    }

    // Check Shield and Energy advancements
    friendlyTeam.forEach((ally) => {
      if (ally.shield >= 50) {
        unlockAdvancement('fluff_overload');
      }
      if (ally.speciesId === 'shadow') {
        const eEff = ally.statusEffects.find((e) => e.type === 'energy');
        if (eEff && (eEff.value || 0) >= 8) {
          unlockAdvancement('chaos_control');
        }
      }
    });

    const updatedUndoStack = [...state.undoStack, historySnapshot];

    set({
      playerTeam: isMultiplayer ? (activeP?.id === 'p1' ? friendlyTeam : opposingTeam) : friendlyTeam,
      enemyTeam: isMultiplayer ? (activeP?.id === 'p1' ? opposingTeam : friendlyTeam) : opposingTeam,
      playerHand: currentHand,
      playerDeck: currentDeck,
      playerDiscard: currentDiscard,
      currentCrackers: finalCrackers,
      undoStack: updatedUndoStack,
      historySnapshot,
      selectedCardIndex: null,
      selectedTargetId: null,
      battleResult,
      multiplayerPlayers: updatedMultiplayerPlayers,
      recentMultiplayerActions: updatedMultiplayerActions,
    });

    return true;
  },

  undoLastAction: () => {
    const state = get();
    if (state.undoStack.length === 0 && !state.historySnapshot) return false;
    const newStack = [...state.undoStack];
    const snap = newStack.pop() || state.historySnapshot;
    if (!snap) return false;

    set({
      playerTeam: snap.playerTeam,
      enemyTeam: snap.enemyTeam,
      playerHand: snap.playerHand,
      playerDeck: snap.playerDeck,
      playerDiscard: snap.playerDiscard,
      enemyHand: snap.enemyHand || state.enemyHand,
      enemyDeck: snap.enemyDeck || state.enemyDeck,
      enemyDiscard: snap.enemyDiscard || state.enemyDiscard,
      currentCrackers: snap.currentCrackers,
      combatLogs: [
        { id: Math.random().toString(36).substring(7), text: `↩️ Undid playing "${snap.description}"! Refunded Crackers. (Remaining undos: ${newStack.length})`, type: 'special' },
        ...snap.combatLogs.slice(0, 23),
      ],
      multiplayerPlayers: snap.multiplayerPlayers || state.multiplayerPlayers,
      recentMultiplayerActions: snap.recentMultiplayerActions || state.recentMultiplayerActions,
      undoStack: newStack,
      historySnapshot: newStack.length > 0 ? newStack[newStack.length - 1] : null,
      selectedCardIndex: null,
      selectedTargetId: null,
    });
    sound.playUndoSound();
    return true;
  },

  resolveStrokenosis: (cardIndex: number) => {
    const state = get();
    const stolenCard = state.strokenosisCards[cardIndex];
    if (!stolenCard) {
      set({ strokenosisActive: false, strokenosisCards: [] });
      return;
    }

    state.addLog(`🧠 STROKENOSIS REVEAL: Stolen card is "${stolenCard.name}" (${stolenCard.tier}-Tier)!`, 'special');

    let friendlyTeam = [...(state.activeSide === 'p2' ? state.enemyTeam : state.playerTeam)];
    let opposingTeam = [...(state.activeSide === 'p2' ? state.playerTeam : state.enemyTeam)];

    if (stolenCard.damage || stolenCard.type === 'attack') {
      const dmg = stolenCard.damage || 15;
      if (stolenCard.target === 'all_enemies') {
        opposingTeam.forEach((enemy) => {
          if (!enemy.isUnstuffed) {
            if (enemy.shield >= dmg) {
              enemy.shield -= dmg;
            } else {
              const rem = dmg - enemy.shield;
              enemy.shield = 0;
              enemy.currentHp = Math.max(0, enemy.currentHp - rem);
            }
            if (enemy.currentHp === 0) {
              enemy.isUnstuffed = true;
              autoDiscardAndRedrawForUnstuffed(enemy, state.activeSide === 'p2', state, set);
            }
          }
        });
        state.addLog(`Mind-controlled "${stolenCard.name}" blasted ALL enemies for ${dmg} damage!`, 'damage');
      } else {
        const liveOpp = opposingTeam.find((s) => !s.isUnstuffed);
        if (liveOpp) {
          if (liveOpp.shield >= dmg) {
            liveOpp.shield -= dmg;
          } else {
            const rem = dmg - liveOpp.shield;
            liveOpp.shield = 0;
            liveOpp.currentHp = Math.max(0, liveOpp.currentHp - rem);
          }
          if (liveOpp.currentHp === 0) {
            liveOpp.isUnstuffed = true;
            autoDiscardAndRedrawForUnstuffed(liveOpp, state.activeSide === 'p2', state, set);
          }
          state.addLog(`Mind-controlled "${stolenCard.name}" dealt ${dmg} damage to ${liveOpp.name}!`, 'damage');
        }
      }
    } else if (stolenCard.heal || stolenCard.type === 'heal') {
      const heal = stolenCard.heal || 18;
      const liveAllies = friendlyTeam.filter((s) => !s.isUnstuffed);
      liveAllies.sort((a, b) => a.currentHp / a.maxHp - b.currentHp / b.maxHp);
      const targetAlly = liveAllies[0] || friendlyTeam[0];
      if (targetAlly) {
        targetAlly.currentHp = Math.min(targetAlly.maxHp, targetAlly.currentHp + heal);
        state.addLog(`Mind-controlled "${stolenCard.name}" restored ${heal} HP to ${targetAlly.name}!`, 'heal');
      }
    } else if (stolenCard.block || stolenCard.type === 'defense') {
      const block = stolenCard.block || 15;
      friendlyTeam.forEach((a) => {
        if (!a.isUnstuffed) a.shield += block;
      });
      state.addLog(`Mind-controlled "${stolenCard.name}" fortified all allies with ${block} Shield!`, 'shield');
    } else {
      const liveOpp = opposingTeam.find((s) => !s.isUnstuffed);
      if (liveOpp) {
        liveOpp.currentHp = Math.max(0, liveOpp.currentHp - 16);
        if (liveOpp.currentHp === 0) {
          liveOpp.isUnstuffed = true;
          autoDiscardAndRedrawForUnstuffed(liveOpp, state.activeSide === 'p2', state, set);
        }
        state.addLog(`Mind-controlled "${stolenCard.name}" inflicted 16 psychic brain damage on ${liveOpp.name}!`, 'special');
      }
    }

    if (state.gameMode === 'two_player') {
      if (state.activeSide === 'p1') {
        const oppHand = state.enemyHand.filter((c) => c.id !== stolenCard.id);
        set({ enemyHand: oppHand });
      } else {
        const oppHand = state.playerHand.filter((c) => c.id !== stolenCard.id);
        set({ playerHand: oppHand });
      }
    } else {
      const oppHand = state.enemyHand.filter((c) => c.id !== stolenCard.id);
      set({ enemyHand: oppHand });
    }

    unlockAdvancement('strokenosis_master');

    const p1TeamUpdated = state.activeSide === 'p2' ? opposingTeam : friendlyTeam;
    const p2TeamUpdated = state.activeSide === 'p2' ? friendlyTeam : opposingTeam;
    const p1RemainingCount = p1TeamUpdated.filter((s) => !s.isUnstuffed && s.currentHp > 0).length;
    const p2RemainingCount = p2TeamUpdated.filter((s) => !s.isUnstuffed && s.currentHp > 0).length;

    let battleResult = state.battleResult;
    if (state.gameMode === 'two_player') {
      if (p2RemainingCount === 0 && p1RemainingCount > 0) battleResult = 'p1_victory';
      else if (p1RemainingCount === 0 && p2RemainingCount > 0) battleResult = 'p2_victory';
    } else {
      if (p2RemainingCount === 0 && p1RemainingCount > 0) battleResult = 'victory';
      else if (p1RemainingCount === 0) battleResult = 'defeat';
    }

    if (state.activeSide === 'p2') {
      set({
        strokenosisActive: false,
        strokenosisCards: [],
        playerTeam: opposingTeam,
        enemyTeam: friendlyTeam,
        battleResult,
      });
    } else {
      set({
        strokenosisActive: false,
        strokenosisCards: [],
        playerTeam: friendlyTeam,
        enemyTeam: opposingTeam,
        battleResult,
      });
    }
  },

  endTurn: () => {
    const state = get();
    if (state.battleResult !== 'ongoing') return;

    if (state.gameMode === 'two_player' || state.gameMode === 'multiplayer') {
      const players = state.multiplayerPlayers.map((p) => ({
        ...p,
        team: [...p.team],
        bench: [...p.bench],
        deck: [...p.deck],
        hand: [...p.hand],
        discard: [...p.discard],
      }));

      // Find current acting player index and save active hand/deck/discard/team/bench
      const currIdx = Math.max(0, players.findIndex((p) => p.id === state.activeSide));
      if (currIdx !== -1) {
        players[currIdx].hand = [...(state.playerHand || [])];
        players[currIdx].deck = [...(state.playerDeck || [])];
        players[currIdx].discard = [...(state.playerDiscard || [])];
        players[currIdx].team = [...(state.playerTeam || [])];
        players[currIdx].bench = [...(state.playerBench || [])];
      }

      let nextIdx = (currIdx + 1) % players.length;
      let loops = 0;
      while (loops < players.length) {
        const candidate = players[nextIdx];
        if (!candidate.isEliminated && candidate.team.some((s) => !s.isUnstuffed)) {
          break;
        }
        nextIdx = (nextIdx + 1) % players.length;
        loops++;
      }

      const nextPlayer = players[nextIdx] || players[0];
      const nextSide = nextPlayer.id;

      let targetDeck = [...nextPlayer.deck];
      let targetHand = [...nextPlayer.hand];
      let targetDiscard = [...nextPlayer.discard];

      // RULE: Draw up to 5 cards, shuffling discard pile when deck is empty
      while (targetHand.length < 5) {
        if (targetDeck.length === 0) {
          if (targetDiscard.length === 0) break;
          targetDeck = [...targetDiscard].sort(() => Math.random() - 0.5);
          targetDiscard = [];
          state.addLog(`Draw pile shuffled!`, 'special');
        }
        targetHand.push(targetDeck.shift()!);
      }

      const team = nextPlayer.team;

      // Auto-discard any drawn cards that belong to unstuffed/benched stuffies
      let unplayableIdx = targetHand.findIndex((c) => getUnplayableReason(c, team) !== null);
      while (unplayableIdx !== -1) {
        const discardedCard = targetHand.splice(unplayableIdx, 1)[0];
        targetDiscard.push(discardedCard);
        if (targetDeck.length === 0 && targetDiscard.length > 0) {
          targetDeck = [...targetDiscard].sort(() => Math.random() - 0.5);
          targetDiscard = [];
        }
        if (targetDeck.length > 0) {
          targetHand.push(targetDeck.shift()!);
        }
        unplayableIdx = targetHand.findIndex((c) => getUnplayableReason(c, team) !== null);
      }

      // Beaker passive
      team.forEach((stuffy) => {
        if (!stuffy.isUnstuffed && stuffy.speciesId === 'beaker') {
          stuffy.currentHp = Math.min(stuffy.maxHp, stuffy.currentHp + 1);
        }
      });

      // Slay the Spire Poison Tick for next acting side
      tickPoison(team, true, state, set);

      nextPlayer.hand = targetHand;
      nextPlayer.deck = targetDeck;
      nextPlayer.discard = targetDiscard;

      // Check Victory / Defeat after poison
      const alivePlayers = players.filter((p) => p.team.some((s) => !s.isUnstuffed));
      let battleResult: CombatStore['battleResult'] = state.battleResult;
      if (alivePlayers.length === 1) {
        battleResult = `${alivePlayers[0].id}_victory` as any;
        state.addLog(`🏆 ${alivePlayers[0].name} WINS!`, 'special');
      }

      const opponentPlayer = players.find((p) => p.id !== nextSide && !p.isEliminated) || players[0];

      set({
        activeSide: nextSide,
        localPlayerId: nextSide,
        currentCrackers: 7,
        maxCrackers: 7,
        privacyCoverActive: true,
        selectedCardIndex: null,
        selectedTargetId: null,
        undoStack: [],
        historySnapshot: null,
        battleResult,
        multiplayerPlayers: players,
        playerTeam: nextPlayer.team,
        playerBench: nextPlayer.bench,
        playerDeck: targetDeck,
        playerHand: targetHand,
        playerDiscard: targetDiscard,
        enemyTeam: opponentPlayer.team,
        enemyHand: opponentPlayer.hand,
        enemyDeck: opponentPlayer.deck,
        enemyDiscard: opponentPlayer.discard,
      });
      return;
    }

    // Campaign Mode: Enemy AI Turn
    state.addLog(`--- Enemy Turn ---`, 'special');

    let enemyTeam = [...state.enemyTeam];
    let playerTeam = [...state.playerTeam];
    const enemyActions: EnemyTurnAction[] = [];

    // TICK STS POISON ON ENEMIES AT START OF ENEMY TURN!
    tickPoison(enemyTeam, false, state, set);

    // Check Amalgam split if amalgam was unstuffed/killed by poison
    const deadAmalgamIdx = enemyTeam.findIndex((s) => s.speciesId === 'amalgam' && (s.isUnstuffed || s.currentHp <= 0));
    if (deadAmalgamIdx !== -1) {
      enemyTeam = [
        {
          instanceId: `split_joann_${Date.now()}_1`,
          speciesId: 'joann',
          name: 'Mega Joann',
          maxHp: Math.round(75 * 1.05),
          currentHp: Math.round(75 * 1.05),
          shield: 10,
          isUnstuffed: false,
          statusEffects: [],
          isMega: true,
          customDeckTier: 'A-',
        },
        {
          instanceId: `split_slugmee_${Date.now()}_2`,
          speciesId: 'slugmee',
          name: 'Slugmee',
          maxHp: 60,
          currentHp: 60,
          shield: 0,
          isUnstuffed: false,
          statusEffects: [],
          isMega: false,
          customDeckTier: 'standard',
        },
        {
          instanceId: `split_thumper_${Date.now()}_3`,
          speciesId: 'thumper',
          name: 'Thumper',
          maxHp: 80,
          currentHp: 80,
          shield: 0,
          isUnstuffed: false,
          statusEffects: [],
          isMega: false,
          customDeckTier: 'standard',
        },
        {
          instanceId: `split_chanteira_${Date.now()}_4`,
          speciesId: 'chanteira',
          name: 'Mega Chanteira',
          maxHp: Math.round(80 * 1.05),
          currentHp: Math.round(80 * 1.05),
          shield: 10,
          isUnstuffed: false,
          statusEffects: [],
          isMega: true,
          customDeckTier: 'A-',
        },
        {
          instanceId: `split_cidney_${Date.now()}_5`,
          speciesId: 'cidney',
          name: 'Mega Cidney',
          maxHp: Math.round(82 * 1.05),
          currentHp: Math.round(82 * 1.05),
          shield: 10,
          isUnstuffed: false,
          statusEffects: [],
          isMega: true,
          customDeckTier: 'A-',
        },
      ];
      sound.playCrackSound();
      state.addLog('💥 THE STUFFY AMALGAM BURST OPEN! Mega Joann, Slugmee, Thumper, Mega Chanteira, and Mega Cidney have emerged!', 'special');
    }

    // Check if enemies were wiped out by poison
    if (enemyTeam.every((e) => e.isUnstuffed || e.currentHp <= 0)) {
      set({ battleResult: 'victory', enemyTeam });
      state.addLog('All opposing stuffies defeated by poison! VICTORY!', 'special');
      return;
    }

    // Life-Linked Trinity: Defeat all 3 within 3 turns of the first defeat!
    const trioMembers = enemyTeam.filter((e) => ['tri_link_alpha', 'tri_link_beta', 'tri_link_gamma'].includes(e.speciesId));
    if (trioMembers.length > 0) {
      const anyDead = trioMembers.some((m) => m.isUnstuffed || m.currentHp <= 0);
      const anyAlive = trioMembers.some((m) => !m.isUnstuffed && m.currentHp > 0);
      let linkRemaining = state.lifeLinkRemainingTurns;
      if (anyDead && anyAlive) {
        if (linkRemaining === null || linkRemaining === undefined) {
          linkRemaining = 3;
          state.addLog(`🔗 LIFE LINK ACTIVATED: A trio member has fallen! You must defeat the entire trio within 3 turns, or fallen members will revive!`, 'special');
        } else {
          linkRemaining -= 1;
          if (linkRemaining <= 0) {
            trioMembers.forEach((m) => {
              if (m.isUnstuffed || m.currentHp <= 0) {
                m.isUnstuffed = false;
                m.currentHp = m.maxHp;
                m.shield = 15;
              }
            });
            linkRemaining = null;
            sound.playShieldSound();
            state.addLog(`✨ LIFE LINK RESTORATION: 3 turns passed without defeating the trio! Fallen members revived to full fluff!`, 'special');
          } else {
            state.addLog(`⏳ LIFE LINK TIMER: ${linkRemaining} turn(s) remaining to defeat all trio members!`, 'special');
          }
        }
      } else if (!anyDead || !anyAlive) {
        linkRemaining = null;
      }
      set({ lifeLinkRemainingTurns: linkRemaining });
    }

    enemyTeam.forEach((enemy) => {
      if (!enemy.isUnstuffed && playerTeam.some((p) => !p.isUnstuffed)) {
        // RULE: Brain-Damaged enemies cannot attack! Must heal first!
        if (enemy.statusEffects.some((e) => e.type === 'brain_damaged')) {
          const enemyCards = ALL_CARDS.filter((c) => c.stuffyId === enemy.speciesId);
          const healCard = enemyCards.find((c) => c.type === 'heal' || c.heal);
          if (healCard) {
            const healVal = healCard.heal || 15;
            enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + healVal);
            enemy.statusEffects = enemy.statusEffects.filter((e) => e.type !== 'brain_damaged');
            state.addLog(`✨ ${enemy.name} used "${healCard.name}" to heal ${healVal} HP and recovered from Brain Damage!`, 'heal');
            enemyActions.push({
              enemyId: enemy.instanceId,
              enemyName: enemy.name,
              enemySpeciesId: enemy.speciesId,
              cardName: healCard.name,
              cardType: healCard.type,
              cardTier: healCard.tier,
              targetName: enemy.name,
              targetId: enemy.instanceId,
              damage: 0,
              effectDescription: `Healed ${healVal} HP and recovered from Brain Damage!`,
            });
          } else {
            state.addLog(`🧠 ${enemy.name} is Brain-Damaged and cannot attack! Action skipped!`, 'status');
            enemyActions.push({
              enemyId: enemy.instanceId,
              enemyName: enemy.name,
              enemySpeciesId: enemy.speciesId,
              cardName: 'Brain-Damaged',
              cardType: 'status',
              cardTier: 'F',
              targetName: enemy.name,
              targetId: enemy.instanceId,
              damage: 0,
              effectDescription: 'Brain-Damaged! Cannot attack until healed!',
            });
          }
          return;
        }

        const enemyCards = enemy.speciesId === 'amalgam'
          ? ALL_CARDS.filter((c) => ['joann', 'slugmee', 'thumper', 'chanteira', 'cidney'].includes(c.stuffyId || ''))
          : enemy.speciesId === 'lint_vampire'
          ? ALL_CARDS.filter((c) => ['shadow', 'alex', 'toothless'].includes(c.stuffyId || ''))
          : enemy.speciesId === 'toxic_slug'
          ? ALL_CARDS.filter((c) => ['slugmee', 'fifi', 'spot'].includes(c.stuffyId || ''))
          : enemy.speciesId === 'clockwork_nuke'
          ? ALL_CARDS.filter((c) => ['henry', 'barnaby', 'toothless'].includes(c.stuffyId || ''))
          : enemy.speciesId === 'cinder_beast'
          ? ALL_CARDS.filter((c) => ['fifi', 'shadow', 'toothless'].includes(c.stuffyId || ''))
          : enemy.speciesId === 'grave_scavenger'
          ? ALL_CARDS.filter((c) => ['joann', 'spot', 'alex'].includes(c.stuffyId || ''))
          : enemy.speciesId === 'mind_puppeteer'
          ? ALL_CARDS.filter((c) => ['alex', 'chanteira', 'spot'].includes(c.stuffyId || ''))
          : enemy.speciesId === 'aquatic_kraken' || enemy.speciesId === 'aquatic_ray'
          ? ALL_CARDS.filter((c) => ['dolphy', 'finlee', 'chanteira'].includes(c.stuffyId || ''))
          : enemy.speciesId.startsWith('tri_link')
          ? ALL_CARDS.filter((c) => ['thumper', 'shadow', 'henry'].includes(c.stuffyId || ''))
          : enemy.speciesId === 'shadow_hedgehog'
          ? ALL_CARDS.filter((c) => c.stuffyId === 'shadow')
          : ALL_CARDS.filter((c) => c.stuffyId === enemy.speciesId);
        let cardPool = enemyCards;
        if (enemy.customDeckTier === 'A+') {
          // Bosses: prefer S and A tier cards!
          const highTier = enemyCards.filter((c) => c.tier === 'S' || c.tier === 'A');
          if (highTier.length > 0) cardPool = highTier;
        } else if (enemy.customDeckTier === 'A-') {
          // Elites: prefer S, A, and B tier cards!
          const highTier = enemyCards.filter((c) => c.tier === 'S' || c.tier === 'A' || c.tier === 'B');
          if (highTier.length > 0) cardPool = highTier;
        }

        const cardToPlay =
          cardPool.length > 0
            ? cardPool[Math.floor(Math.random() * cardPool.length)]
            : { name: 'Plush Bash', damage: 10, tier: 'C', type: 'attack', description: 'Bashes with plush fists.' };

        const livePlayers = playerTeam.filter((p) => !p.isUnstuffed);
        const taunter = livePlayers.find((p) => p.statusEffects.some((e) => e.type === 'taunt'));
        const target = taunter || livePlayers[Math.floor(Math.random() * livePlayers.length)];

        if (target) {
          let enemyDmg = cardToPlay.damage || 10;
          if (target.statusEffects.some((e) => e.type === 'damage_reduction')) {
            enemyDmg = Math.round(enemyDmg * 0.25);
          }

          if (target.shield >= enemyDmg) {
            target.shield -= enemyDmg;
          } else {
            const rem = enemyDmg - target.shield;
            target.shield = 0;
            target.currentHp = Math.max(0, target.currentHp - rem);
          }

          // Special Boss Passive Actions:
          if (enemy.speciesId === 'lint_vampire') {
            // Static Sapper drains Energy to 0 and weakens
            livePlayers.forEach((p) => {
              const eEff = p.statusEffects.find((e) => e.type === 'energy');
              if (eEff) eEff.value = 0;
              if (!p.statusEffects.some((e) => e.type === 'weak')) {
                p.statusEffects.push({ type: 'weak', value: 2 });
              }
            });
            enemy.shield += 12;
            sound.playStrengthDrainSound();
            state.addLog(`⚡ STATIC SAPPER: ${enemy.name} drained all Energy from players and applied Weak (-25% damage)!`, 'special');
          } else if (enemy.speciesId === 'toxic_slug') {
            // Noxious Slime King applies compounding poison
            const pEff = target.statusEffects.find((e) => e.type === 'poison');
            if (pEff) pEff.value = (pEff.value || 0) + 5;
            else target.statusEffects.push({ type: 'poison', value: 5 });
            sound.playPoisonSound();
            state.addLog(`🧪 TOXIC SPORES: ${enemy.name} drenched ${target.name} in 5 Poison!`, 'damage');
          } else if (enemy.speciesId === 'clockwork_nuke') {
            // 3-Turn Tactical Nuke Boss
            const nukeMod = state.turnNumber % 3;
            if (nukeMod === 0) {
              sound.playNukeSound();
              const nukeDmg = 28;
              livePlayers.forEach((p) => {
                if (p.shield >= nukeDmg) {
                  p.shield -= nukeDmg;
                } else {
                  const rem = nukeDmg - p.shield;
                  p.shield = 0;
                  p.currentHp = Math.max(0, p.currentHp - rem);
                }
                if (p.currentHp <= 0) p.isUnstuffed = true;
              });
              state.addLog(`💣💥 TACTICAL FLUFF NUKE! ${enemy.name} detonated an apocalyptic blast for ${nukeDmg} damage to ALL allies!`, 'special');
            } else {
              state.addLog(`⏳ NUKE WARNING: ${enemy.name} reactor ticking! Detonates in ${3 - nukeMod} turn(s)!`, 'special');
            }
          } else if (enemy.speciesId === 'cinder_beast') {
            // Cinder Drake sets you on fire
            const unburned = livePlayers.filter((p) => !p.statusEffects.some((e) => e.type === 'fire'));
            const igniteTarget = unburned[0] || target;
            if (igniteTarget && !igniteTarget.statusEffects.some((e) => e.type === 'fire')) {
              igniteTarget.statusEffects.push({ type: 'fire', value: 1 });
              sound.playFireSound();
              state.addLog(`🔥 INFERNO BLAZE: ${enemy.name} ignited ${igniteTarget.name} with FIRE! Discarding cards scorches allies until extinguished with healing!`, 'special');
            }
          } else if (enemy.speciesId === 'grave_scavenger') {
            // Plays from player discard pile
            if (state.playerDiscard.length > 0) {
              const stealIdx = Math.floor(Math.random() * state.playerDiscard.length);
              const stolenCard = state.playerDiscard[stealIdx];
              state.playerDiscard.splice(stealIdx, 1);
              sound.playStealSound();
              let stolenDmg = stolenCard.damage || 8;
              if (stolenCard.block) enemy.shield += stolenCard.block;
              if (stolenCard.heal) enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + stolenCard.heal);
              if (target.shield >= stolenDmg) {
                target.shield -= stolenDmg;
              } else {
                const rem = stolenDmg - target.shield;
                target.shield = 0;
                target.currentHp = Math.max(0, target.currentHp - rem);
              }
              state.addLog(`🪦 GRAVEROBBER: ${enemy.name} stole "${stolenCard.name}" from your DISCARD PILE and played it for ${stolenDmg} damage!`, 'special');
            }
          } else if (enemy.speciesId === 'mind_puppeteer') {
            // Plays from player draw pile
            if (state.playerDeck.length > 0) {
              const stolenCard = state.playerDeck.shift()!;
              sound.playStealSound();
              let stolenDmg = stolenCard.damage || 8;
              if (stolenCard.block) enemy.shield += stolenCard.block;
              if (stolenCard.heal) enemy.currentHp = Math.min(enemy.maxHp, enemy.currentHp + stolenCard.heal);
              if (target.shield >= stolenDmg) {
                target.shield -= stolenDmg;
              } else {
                const rem = stolenDmg - target.shield;
                target.shield = 0;
                target.currentHp = Math.max(0, target.currentHp - rem);
              }
              state.addLog(`🧠 MIND LEECH: ${enemy.name} drew "${stolenCard.name}" straight from your DRAW PILE and played it for ${stolenDmg} damage!`, 'special');
            }
          } else if (enemy.speciesId === 'shadow_hedgehog') {
            // Doubling strength
            let energyEffect = enemy.statusEffects.find((e) => e.type === 'energy');
            if (!energyEffect) {
              energyEffect = { type: 'energy', value: 4 };
              enemy.statusEffects.push(energyEffect);
            } else {
              energyEffect.value = Math.min(64, (energyEffect.value || 2) * 2);
            }
            const strengthVal = energyEffect.value || 4;
            const chaosDmg = 10 + strengthVal;
            if (target.shield >= chaosDmg) {
              target.shield -= chaosDmg;
            } else {
              const rem = chaosDmg - target.shield;
              target.shield = 0;
              target.currentHp = Math.max(0, target.currentHp - rem);
            }
            sound.playEnergyChargeSound();
            state.addLog(`⚡ CHAOS SURGE: ${enemy.name} doubled Energy strength to ${strengthVal} and unleashed Chaos Burst for ${chaosDmg} damage!`, 'special');
          } else if (enemy.speciesId === 'mirror_mimic') {
            enemy.shield += 10;
            const reflectShards = 6;
            target.currentHp = Math.max(0, target.currentHp - reflectShards);
            state.addLog(`🪞 GLASS REFLECTION: ${enemy.name} reflected shards for ${reflectShards} damage!`, 'special');
          } else if (enemy.speciesId === 'fluff_gorgon') {
            const devourDmg = 12;
            target.shield = 0;
            target.currentHp = Math.max(0, target.currentHp - devourDmg);
            if (!target.statusEffects.some((e) => e.type === 'weak')) {
              target.statusEffects.push({ type: 'weak', value: 2 });
            }
            state.addLog(`🕳️ FLUFF INHALE: ${enemy.name} chewed on ${target.name} for ${devourDmg} damage and applied Weak!`, 'special');
          } else if (enemy.speciesId === 'volt_colossus') {
            livePlayers.forEach((p) => {
              if (Math.random() < 0.4 && !p.statusEffects.some((e) => e.type === 'brain_damaged')) {
                p.statusEffects.push({ type: 'brain_damaged' });
                state.addLog(`⚡ EMP SHOCK: High voltage shorted out ${p.name}'s mind with Brain Damage!`, 'special');
              }
            });
            enemy.shield += 15;
          }

          if (target.currentHp <= 0) {
            target.isUnstuffed = true;
            sound.playUnstuffSound();
            state.addLog(`${target.name} was UNSTUFFED by ${enemy.name}!`, 'damage');
            autoDiscardAndRedrawForUnstuffed(target, true, state, set);
          }

          enemyActions.push({
            enemyId: enemy.instanceId,
            enemyName: enemy.name,
            enemySpeciesId: enemy.speciesId,
            cardName: cardToPlay.name,
            cardType: cardToPlay.type,
            cardTier: cardToPlay.tier,
            targetName: target.name,
            targetId: target.instanceId,
            damage: enemyDmg,
            effectDescription: cardToPlay.description,
          });

          state.addLog(
            `${enemy.name} played "${cardToPlay.name}" attacking ${target.name} for ${enemyDmg} damage!`,
            'damage'
          );
        }
      }
    });

    // Check player team defeat
    const allPlayersDead = playerTeam.every((p) => p.isUnstuffed);
    if (allPlayersDead) {
      recordCombatForfeitedOrLost();
      set({ battleResult: 'defeat', playerTeam, recentEnemyActions: enemyActions, showEnemyTurnReview: enemyActions.length > 0 });
      state.addLog('All your stuffies were unstuffed! DEFEAT!', 'special');
      return;
    }

    // RULE: Draw up to 5 cards for Player, shuffling discard pile when deck is empty
    let pDeck = [...state.playerDeck];
    let pHand = [...state.playerHand];
    let pDiscard = [...state.playerDiscard];

    while (pHand.length < 5) {
      if (pDeck.length === 0) {
        if (pDiscard.length === 0) break;
        pDeck = [...pDiscard].sort(() => Math.random() - 0.5);
        pDiscard = [];
        state.addLog(`Draw pile empty! Shuffled discard pile back into deck!`, 'special');
      }
      pHand.push(pDeck.shift()!);
    }

    // Auto-discard any drawn cards that belong to unstuffed/benched stuffies
    let unplayableHandIdx = pHand.findIndex((c) => getUnplayableReason(c, playerTeam) !== null);
    while (unplayableHandIdx !== -1) {
      const discardedCard = pHand.splice(unplayableHandIdx, 1)[0];
      pDiscard.push(discardedCard);
      if (pDeck.length === 0 && pDiscard.length > 0) {
        pDeck = [...pDiscard].sort(() => Math.random() - 0.5);
        pDiscard = [];
      }
      if (pDeck.length > 0) {
        pHand.push(pDeck.shift()!);
      }
      unplayableHandIdx = pHand.findIndex((c) => getUnplayableReason(c, playerTeam) !== null);
    }

    // Beaker passive on player team
    playerTeam.forEach((s) => {
      if (!s.isUnstuffed && s.speciesId === 'beaker') {
        s.currentHp = Math.min(s.maxHp, s.currentHp + 1);
      }
    });

    // Snuggle Music Box Relic: passive regeneration
    if ((state.activeRelics || []).some((r) => r.id === 'heart_music_box')) {
      playerTeam.forEach((s) => {
        if (!s.isUnstuffed) s.currentHp = Math.min(s.maxHp, s.currentHp + 2);
      });
      state.addLog('🎵 Snuggle Music Box played a soft lullaby! All allies regenerated +2 HP!', 'heal');
    }

    // Woolen Blanket Shield Relic: shield grant at turn start
    if ((state.activeRelics || []).some((r) => r.id === 'wool_shield')) {
      playerTeam.forEach((s) => {
        if (!s.isUnstuffed) s.shield += 4;
      });
      state.addLog('🧶 Woolen Blanket Shield granted +4 Shield to all allies!', 'shield');
    }

    // TICK STS POISON ON PLAYER TEAM
    tickPoison(playerTeam, true, state, set);

    const playersSurviving = playerTeam.filter((p) => !p.isUnstuffed && p.currentHp > 0).length;
    let finalResult: CombatStore['battleResult'] = state.battleResult;
    if (playersSurviving === 0) {
      finalResult = 'defeat';
      state.addLog('All your stuffies were unstuffed by poison! DEFEAT!', 'special');
    }

    set({
      turnNumber: state.turnNumber + 1,
      currentCrackers: state.maxCrackers,
      playerHand: pHand,
      playerDeck: pDeck,
      playerDiscard: pDiscard,
      playerTeam,
      enemyTeam,
      recentEnemyActions: enemyActions,
      showEnemyTurnReview: enemyActions.length > 0,
      selectedCardIndex: null,
      selectedTargetId: null,
      undoStack: [],
      historySnapshot: null,
      battleResult: finalResult,
    });
  },

  dismissPrivacyCover: () => set({ privacyCoverActive: false }),
  dismissEnemyTurnReview: () => set({ showEnemyTurnReview: false }),
  dismissMultiplayerTurnReview: () => set({ showMultiplayerTurnReview: false }),
  openMultiplayerTurnReview: () => set({ showMultiplayerTurnReview: true }),
}));

// Helper: Slay the Spire Poison Tick (deals damage equal to stacks, then decreases by 1, removes when 0)
function tickPoison(
  team: StuffyState[],
  isP1orPlayer: boolean,
  state: any,
  set: any
) {
  team.forEach((stuffy) => {
    if (!stuffy.isUnstuffed && stuffy.currentHp > 0) {
      const pIdx = stuffy.statusEffects.findIndex((e) => e.type === 'poison');
      if (pIdx !== -1) {
        const poison = stuffy.statusEffects[pIdx];
        const poisonDmg = poison.value || 1;

        // Direct HP damage (pierces block, Slay the Spire style)
        stuffy.currentHp = Math.max(0, stuffy.currentHp - poisonDmg);
        sound.playDamageSound();
        state.addLog(`☠️ ${stuffy.name} suffered ${poisonDmg} Poison damage! (${stuffy.currentHp}/${stuffy.maxHp} HP)`, 'damage');

        // Decrease poison count by 1
        const remainingPoison = poisonDmg - 1;
        if (remainingPoison > 0) {
          poison.value = remainingPoison;
        } else {
          stuffy.statusEffects.splice(pIdx, 1);
          state.addLog(`✨ ${stuffy.name}'s poison has worn off!`, 'special');
        }

        if (stuffy.currentHp === 0) {
          stuffy.isUnstuffed = true;
          state.addLog(`☠️ ${stuffy.name} was UNSTUFFED by Poison!`, 'damage');
          handleStuffyCasualty(state, stuffy);
          autoDiscardAndRedrawForUnstuffed(stuffy, isP1orPlayer, state, set);
        }
      }
    }
  });
}

// Helper: Auto-discard cards of unstuffed stuffy and redraw replacement cards
function autoDiscardAndRedrawForUnstuffed(
  stuffy: StuffyState,
  isP1orPlayer: boolean,
  state: any,
  set: any,
  killedByBrainDamageCard?: boolean
) {
  recordStuffyDeath();
  const hasBrainDamage = stuffy.statusEffects.some((e) => e.type === 'brain_damaged');
  if (hasBrainDamage || killedByBrainDamageCard) {
    if (!state.concussionKillTrack) state.concussionKillTrack = {};
    state.concussionKillTrack[stuffy.instanceId] = true;
  }
  let hand = [...(isP1orPlayer ? state.playerHand : state.enemyHand)];
  let deck = [...(isP1orPlayer ? state.playerDeck : state.enemyDeck)];
  let discard = [...(isP1orPlayer ? state.playerDiscard : state.enemyDiscard)];

  const cardsToDiscard = hand.filter((c) => c.stuffyId === stuffy.speciesId);
  if (cardsToDiscard.length === 0) return;

  hand = hand.filter((c) => c.stuffyId !== stuffy.speciesId);
  discard.push(...cardsToDiscard);

  let redrawn = 0;
  for (let i = 0; i < cardsToDiscard.length; i++) {
    if (deck.length === 0) {
      if (discard.length === 0) break;
      deck = [...discard].sort(() => Math.random() - 0.5);
      discard = [];
      state.addLog(`Draw pile shuffled!`, 'special');
    }
    if (deck.length > 0) {
      hand.push(deck.shift()!);
      redrawn++;
    }
  }

  state.addLog(
    `📦 ${stuffy.name} was UNSTUFFED! Auto-discarded ${cardsToDiscard.length} card(s) and redrew ${redrawn} new card(s)!`,
    'special'
  );

  if (isP1orPlayer) {
    set({ playerHand: hand, playerDeck: deck, playerDiscard: discard });
  } else {
    set({ enemyHand: hand, enemyDeck: deck, enemyDiscard: discard });
  }
}

// Helper: Immediately draw bonus cards (Eevee, Beaker)
function drawCardsImmediately(count: number, side: 'p1' | 'p2', state: any, set: any) {
  const isP1 = side === 'p1';
  let hand = [...(isP1 ? state.playerHand : state.enemyHand)];
  let deck = [...(isP1 ? state.playerDeck : state.enemyDeck)];
  let discard = [...(isP1 ? state.playerDiscard : state.enemyDiscard)];

  let drawn = 0;
  for (let i = 0; i < count; i++) {
    if (hand.length >= 7) break;
    if (deck.length === 0) {
      if (discard.length === 0) break;
      deck = [...discard].sort(() => Math.random() - 0.5);
      discard = [];
      state.addLog(`Draw pile empty! Shuffled discard pile back into deck!`, 'special');
    }
    if (deck.length > 0) {
      hand.push(deck.shift()!);
      drawn++;
    }
  }

  state.addLog(`🎴 Immediately drew ${drawn} bonus card(s)!`, 'special');

  if (isP1) {
    set({ playerHand: hand, playerDeck: deck, playerDiscard: discard });
  } else {
    set({ enemyHand: hand, enemyDeck: deck, enemyDiscard: discard });
  }
}

function handleStuffyCasualty(state: CombatStore, fallenStuffy: StuffyState, explicitKiller?: PlayerSide) {
  if (state.firstBloodTriggered) return;
  const isMultiplayer = state.gameMode === 'two_player' || state.gameMode === 'multiplayer';
  if (!isMultiplayer) return;

  const pool = [...(state.reinforcementPool.length > 0 ? state.reinforcementPool : state.twoPlayerReserve)];
  if (pool.length < 3) return;

  let players = state.multiplayerPlayers.map((p) => ({
    ...p,
    team: [...p.team],
    bench: [...p.bench],
    deck: [...p.deck],
  }));

  // Fallback for simple 2P if multiplayerPlayers was empty
  if (players.length === 0) {
    players = [
      {
        id: 'p1',
        name: 'PLAYER 1',
        color: 'emerald',
        team: [...state.playerTeam],
        bench: [...state.playerBench],
        deck: [...state.playerDeck],
        hand: [...state.playerHand],
        discard: [...state.playerDiscard],
        isEliminated: false,
      },
      {
        id: 'p2',
        name: 'PLAYER 2',
        color: 'blue',
        team: [...state.enemyTeam],
        bench: [],
        deck: [...state.enemyDeck],
        hand: [...state.enemyHand],
        discard: [...state.enemyDiscard],
        isEliminated: false,
      },
    ];
  }

  const victimPlayer = players.find((p) => p.team.some((s) => s.instanceId === fallenStuffy.instanceId));
  if (!victimPlayer) return;

  const killerSide = explicitKiller || (state.activeSide as PlayerSide);

  if (state.playerCount === 3 && pool.length >= 4) {
    // 3-Player rule: victim gets 2 random from reinforcement pool, other players get 1 each!
    const victimStuffies = pool.splice(0, 2);
    victimStuffies.forEach((stuffy) => {
      victimPlayer.bench.push(stuffy);
      const loadouts = getLoadoutsForStuffy(stuffy.speciesId);
      const chosenLoadout = loadouts[0];
      if (chosenLoadout) {
        chosenLoadout.cardIds.forEach((cId) => {
          const c = CARD_MAP.get(cId);
          if (c) victimPlayer.deck.push({ ...c });
        });
      }
    });
    victimPlayer.deck.sort(() => Math.random() - 0.5);

    const otherPlayers = players.filter((p) => p.id !== victimPlayer.id);
    otherPlayers.forEach((otherP) => {
      if (pool.length > 0) {
        const bonusStuffy = pool.shift()!;
        otherP.bench.push(bonusStuffy);
        const loadouts = getLoadoutsForStuffy(bonusStuffy.speciesId);
        const chosenLoadout = loadouts[0];
        if (chosenLoadout) {
          chosenLoadout.cardIds.forEach((cId) => {
            const c = CARD_MAP.get(cId);
            if (c) otherP.deck.push({ ...c });
          });
        }
        otherP.deck.sort(() => Math.random() - 0.5);
      }
    });

    state.addLog(
      `🚨 FIRST BLOOD REINFORCEMENTS! ${victimPlayer.name} received 2 reserve stuffies & cards! Other players received 1 each!`,
      'special'
    );
  } else {
    // 2-Player rule: victim gets 2, killer gets 1
    const killerPlayer =
      players.find((p) => p.id === killerSide && p.id !== victimPlayer.id) ||
      players.find((p) => p.id !== victimPlayer.id);

    const victimStuffies = pool.splice(0, 2);
    victimStuffies.forEach((stuffy) => {
      victimPlayer.bench.push(stuffy);
      const loadouts = getLoadoutsForStuffy(stuffy.speciesId);
      const chosenLoadout = loadouts[0];
      if (chosenLoadout) {
        chosenLoadout.cardIds.forEach((cId) => {
          const c = CARD_MAP.get(cId);
          if (c) victimPlayer.deck.push({ ...c });
        });
      }
    });
    victimPlayer.deck.sort(() => Math.random() - 0.5);

    if (killerPlayer && pool.length > 0) {
      const killerStuffy = pool.shift()!;
      killerPlayer.bench.push(killerStuffy);
      const loadouts = getLoadoutsForStuffy(killerStuffy.speciesId);
      const chosenLoadout = loadouts[0];
      if (chosenLoadout) {
        chosenLoadout.cardIds.forEach((cId) => {
          const c = CARD_MAP.get(cId);
          if (c) killerPlayer.deck.push({ ...c });
        });
      }
      killerPlayer.deck.sort(() => Math.random() - 0.5);
    }

    state.addLog(
      `🚨 FIRST BLOOD REINFORCEMENTS! ${victimPlayer.name} received 2 reserve stuffies & cards! ${
        killerPlayer?.name || 'The killer'
      } received 1!`,
      'special'
    );
  }

  const p1 = players.find((p) => p.id === 'p1');
  const p2 = players.find((p) => p.id === 'p2');
  const activeP = players.find((p) => p.id === state.activeSide);

  useCombatStore.setState({
    firstBloodTriggered: true,
    reinforcementPool: pool,
    twoPlayerReserve: pool,
    multiplayerPlayers: players,
    playerBench: activeP ? activeP.bench : (p1?.bench || []),
    ...(p1 ? { playerDeck: p1.deck } : {}),
    ...(p2 ? { enemyDeck: p2.deck } : {}),
  });
}
