import { create } from 'zustand';
import { Card, StuffyState, StatusEffect } from '@/types/game';
import { CARD_MAP } from '@/data/cards';
import { STUFFY_MAP } from '@/data/stuffies';

export interface CombatLogEntry {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'shield' | 'status' | 'special';
}

export interface CombatStore {
  // Mode
  gameMode: 'campaign' | 'two_player';

  // State
  turnNumber: number;
  activeSide: 'player' | 'enemy' | 'p1' | 'p2';
  currentCrackers: number;
  maxCrackers: number;

  // Stuffies on field (up to 5 each)
  playerTeam: StuffyState[];
  enemyTeam: StuffyState[];

  // Decks & Hands
  playerDeck: Card[];
  playerHand: Card[];
  playerDiscard: Card[];

  enemyDeck: Card[];
  enemyHand: Card[];
  enemyDiscard: Card[];

  // 2-Player specific
  twoPlayerReserve: StuffyState[]; // the 3 leftover stuffies
  firstBloodTriggered: boolean;
  privacyCoverActive: boolean;

  // Interactive selection
  selectedCardIndex: number | null;
  selectedTargetId: string | null;

  // Battle outcome
  battleResult: 'ongoing' | 'victory' | 'defeat';
  combatLogs: CombatLogEntry[];

  // Actions
  initializeCampaignBattle: (
    playerTeam: StuffyState[],
    playerDeck: Card[],
    enemySpeciesIds: string[],
    relics?: { effectType: string; value: number }[]
  ) => void;

  initializeTwoPlayerBattle: (
    p1Team: StuffyState[],
    p1Deck: Card[],
    p2Team: StuffyState[],
    p2Deck: Card[],
    reserveStuffies: StuffyState[]
  ) => void;

  selectCard: (index: number | null) => void;
  selectTarget: (stuffyInstanceId: string) => void;
  playCard: (cardIndex: number, targetId?: string) => boolean;
  endTurn: () => void;
  dismissPrivacyCover: () => void;
  addLog: (text: string, type?: CombatLogEntry['type']) => void;
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  gameMode: 'campaign',
  turnNumber: 1,
  activeSide: 'player',
  currentCrackers: 7,
  maxCrackers: 7,

  playerTeam: [],
  enemyTeam: [],

  playerDeck: [],
  playerHand: [],
  playerDiscard: [],

  enemyDeck: [],
  enemyHand: [],
  enemyDiscard: [],

  twoPlayerReserve: [],
  firstBloodTriggered: false,
  privacyCoverActive: false,

  selectedCardIndex: null,
  selectedTargetId: null,

  battleResult: 'ongoing',
  combatLogs: [],

  addLog: (text, type = 'special') => {
    set((state) => ({
      combatLogs: [
        { id: Math.random().toString(36).substring(7), text, type },
        ...state.combatLogs.slice(0, 24),
      ],
    }));
  },

  initializeCampaignBattle: (playerTeam, playerDeck, enemySpeciesIds, relics = []) => {
    // Relic modifiers
    let startCrackers = 7;
    let startShield = 0;
    relics.forEach((r) => {
      if (r.effectType === 'bonus_cracker') startCrackers += r.value;
      if (r.effectType === 'shield_boost') startShield += r.value;
    });

    // Create enemy stuffies from species catalog
    const enemyTeam: StuffyState[] = enemySpeciesIds.slice(0, 5).map((sId, idx) => {
      const species = STUFFY_MAP.get(sId);
      const hp = species ? species.baseHp : 60;
      return {
        instanceId: `enemy_${sId}_${idx}`,
        speciesId: sId,
        name: species ? species.name : 'Wild Stuffy',
        maxHp: hp,
        currentHp: hp,
        shield: 0,
        isUnstuffed: false,
        statusEffects: [],
      };
    });

    // Apply starting shield to player team
    const primedPlayerTeam = playerTeam.map((s) => ({
      ...s,
      shield: startShield,
      statusEffects: [],
    }));

    // Shuffle deck
    const shuffledDeck = [...playerDeck].sort(() => Math.random() - 0.5);
    const initialHand = shuffledDeck.slice(0, 5);
    const remainingDeck = shuffledDeck.slice(5);

    set({
      gameMode: 'campaign',
      turnNumber: 1,
      activeSide: 'player',
      currentCrackers: startCrackers,
      maxCrackers: startCrackers,
      playerTeam: primedPlayerTeam,
      enemyTeam,
      playerDeck: remainingDeck,
      playerHand: initialHand,
      playerDiscard: [],
      enemyDeck: [],
      enemyHand: [],
      enemyDiscard: [],
      twoPlayerReserve: [],
      firstBloodTriggered: false,
      privacyCoverActive: false,
      selectedCardIndex: null,
      selectedTargetId: null,
      battleResult: 'ongoing',
      combatLogs: [{ id: '1', text: 'Battle initiated! 5v5 Stuffy Showdown!', type: 'special' }],
    });
  },

  initializeTwoPlayerBattle: (p1Team, p1Deck, p2Team, p2Deck, reserveStuffies) => {
    const shuffledP1 = [...p1Deck].sort(() => Math.random() - 0.5);
    const p1Hand = shuffledP1.slice(0, 5);
    const p1Remaining = shuffledP1.slice(5);

    const shuffledP2 = [...p2Deck].sort(() => Math.random() - 0.5);
    const p2Hand = shuffledP2.slice(0, 5);
    const p2Remaining = shuffledP2.slice(5);

    set({
      gameMode: 'two_player',
      turnNumber: 1,
      activeSide: 'p1',
      currentCrackers: 7,
      maxCrackers: 7,
      playerTeam: p1Team,
      enemyTeam: p2Team,
      playerDeck: p1Remaining,
      playerHand: p1Hand,
      playerDiscard: [],
      enemyDeck: p2Remaining,
      enemyHand: p2Hand,
      enemyDiscard: [],
      twoPlayerReserve: reserveStuffies,
      firstBloodTriggered: false,
      privacyCoverActive: false,
      selectedCardIndex: null,
      selectedTargetId: null,
      battleResult: 'ongoing',
      combatLogs: [{ id: '1', text: '2-Player battle started! Player 1 goes first!', type: 'special' }],
    });
  },

  selectCard: (index) => {
    const { selectedCardIndex } = get();
    set({
      selectedCardIndex: selectedCardIndex === index ? null : index,
    });
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
    const hand = state.activeSide === 'p2' ? state.enemyHand : state.playerHand;
    const card = hand[cardIndex];

    if (!card) return false;
    if (state.currentCrackers < card.cost) {
      state.addLog(`Not enough Crackers! Need ${card.cost} 🍪`, 'special');
      return false;
    }

    // Check if card belongs to a Brain-Damaged stuffy
    if (card.stuffyId) {
      const activeTeam = state.activeSide === 'p2' ? state.enemyTeam : state.playerTeam;
      const ownerStuffy = activeTeam.find((s) => s.speciesId === card.stuffyId);
      if (ownerStuffy && ownerStuffy.statusEffects.some((e) => e.type === 'brain_damaged')) {
        // Can only play if card is a heal card
        if (card.type !== 'heal') {
          state.addLog(`${ownerStuffy.name} is Brain-Damaged! Must heal them first!`, 'status');
          return false;
        }
      }
    }

    // Determine target
    let friendlyTeam = [...(state.activeSide === 'p2' ? state.enemyTeam : state.playerTeam)];
    let opposingTeam = [...(state.activeSide === 'p2' ? state.playerTeam : state.enemyTeam)];

    // Check for Henry Shell Up Taunt on opposing team
    const tauntingOpponent = opposingTeam.find(
      (s) => !s.isUnstuffed && s.statusEffects.some((e) => e.type === 'taunt')
    );
    if (tauntingOpponent && card.target === 'single_enemy' && targetId !== tauntingOpponent.instanceId) {
      state.addLog(`Henry's Shell Up taunt forces attack on Henry!`, 'shield');
      targetId = tauntingOpponent.instanceId;
    }

    let targetStuffy = [...friendlyTeam, ...opposingTeam].find((s) => s.instanceId === targetId);

    // Apply Card Effects
    // 1. Single Enemy Attack
    if (card.target === 'single_enemy' && targetStuffy) {
      let dmg = card.damage || 0;
      // Check crack trap on target (takes 2x damage)
      if (targetStuffy.statusEffects.some((e) => e.type === 'earthquake_crack')) {
        dmg = dmg * 2;
        state.addLog(`${targetStuffy.name} is in a crack! Takes 2x damage!`, 'damage');
      }
      // Check taunt/damage reduction
      if (targetStuffy.statusEffects.some((e) => e.type === 'damage_reduction')) {
        dmg = Math.round(dmg * 0.25);
      }

      // Absorb with shield first
      if (targetStuffy.shield >= dmg) {
        targetStuffy.shield -= dmg;
      } else {
        const remainingDmg = dmg - targetStuffy.shield;
        targetStuffy.shield = 0;
        targetStuffy.currentHp = Math.max(0, targetStuffy.currentHp - remainingDmg);
      }

      state.addLog(`${card.name} dealt ${dmg} damage to ${targetStuffy.name}!`, 'damage');

      // Lifesteal
      if (card.lifesteal && card.stuffyId) {
        const attacker = friendlyTeam.find((s) => s.speciesId === card.stuffyId);
        if (attacker && !attacker.isUnstuffed) {
          attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + dmg);
          state.addLog(`${attacker.name} lifestealed ${dmg} HP!`, 'heal');
        }
      }

      // Brain Damage effect
      if (card.brainDamage) {
        targetStuffy.statusEffects.push({ type: 'brain_damaged' });
        state.addLog(`${targetStuffy.name} suffered Brain Damage!`, 'status');
      }

      // Poison application
      if (card.poison) {
        targetStuffy.statusEffects.push({ type: 'poison', value: card.poison, duration: 3 });
        state.addLog(`${targetStuffy.name} was poisoned (+${card.poison} DoT)!`, 'status');
      }

      // Check for unstuffed
      if (targetStuffy.currentHp <= 0) {
        targetStuffy.isUnstuffed = true;
        state.addLog(`${targetStuffy.name} was UNSTUFFED!`, 'damage');
        handleStuffyCasualty(state, targetStuffy);
      }
    }

    // 2. All Enemies Attack
    if (card.target === 'all_enemies') {
      const baseDmg = card.damage || 0;
      opposingTeam.forEach((enemy) => {
        if (!enemy.isUnstuffed) {
          let dmg = baseDmg;
          if (enemy.statusEffects.some((e) => e.type === 'earthquake_crack')) dmg *= 2;
          if (enemy.statusEffects.some((e) => e.type === 'damage_reduction')) dmg = Math.round(dmg * 0.25);

          if (enemy.shield >= dmg) {
            enemy.shield -= dmg;
          } else {
            const rem = dmg - enemy.shield;
            enemy.shield = 0;
            enemy.currentHp = Math.max(0, enemy.currentHp - rem);
          }

          if (card.poison) {
            enemy.statusEffects.push({ type: 'poison', value: card.poison, duration: 3 });
          }

          if (enemy.currentHp <= 0) {
            enemy.isUnstuffed = true;
            state.addLog(`${enemy.name} was UNSTUFFED!`, 'damage');
            handleStuffyCasualty(state, enemy);
          }
        }
      });
      state.addLog(`${card.name} dealt ${baseDmg} AoE damage!`, 'damage');
    }

    // 3. Heal / Restitch
    if (card.target === 'single_ally' && targetStuffy) {
      const healAmount = card.heal || 0;
      targetStuffy.currentHp = Math.min(targetStuffy.maxHp, targetStuffy.currentHp + healAmount);
      // Remove Brain Damage when healed
      targetStuffy.statusEffects = targetStuffy.statusEffects.filter((e) => e.type !== 'brain_damaged');
      state.addLog(`${card.name} healed ${targetStuffy.name} for ${healAmount} HP!`, 'heal');
    }

    if (card.target === 'unstuffed_ally' && targetStuffy && targetStuffy.isUnstuffed) {
      if (targetStuffy.isPermanentlyDevoured) {
        state.addLog(`${targetStuffy.name} was swallowed whole and CANNOT be restitched!`, 'special');
        return false;
      }
      targetStuffy.isUnstuffed = false;
      targetStuffy.currentHp = card.heal || 25;
      state.addLog(`${targetStuffy.name} was RESTITCHED with ${targetStuffy.currentHp} HP!`, 'heal');
    }

    // 4. Defense / Shield
    if (card.block) {
      if (card.target === 'all_allies') {
        friendlyTeam.forEach((ally) => {
          if (!ally.isUnstuffed) ally.shield += card.block!;
        });
        state.addLog(`All allies gained ${card.block} Shield!`, 'shield');
      } else if (card.target === 'self' || card.target === 'single_ally') {
        const ally = targetStuffy || friendlyTeam.find((s) => s.speciesId === card.stuffyId) || friendlyTeam[0];
        if (ally) {
          ally.shield += card.block;
          state.addLog(`${ally.name} gained ${card.block} Shield!`, 'shield');
        }
      }
    }

    // 5. Special Cards
    if (card.specialActionId === 'earthquake') {
      // Jefe's Earthquake
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
      // Finlee's Swallow Whole
      targetStuffy.currentHp = 0;
      targetStuffy.isUnstuffed = true;
      targetStuffy.isPermanentlyDevoured = true;
      const finlee = friendlyTeam.find((s) => s.speciesId === 'finlee');
      if (finlee) {
        finlee.currentHp = finlee.maxHp;
        state.addLog(`Finlee SWALLOWED ${targetStuffy.name} WHOLE! Fully heals fluff!`, 'special');
      }
      handleStuffyCasualty(state, targetStuffy);
    }

    if (card.specialActionId === 'shell_up') {
      const henry = friendlyTeam.find((s) => s.speciesId === 'henry');
      if (henry) {
        henry.statusEffects.push({ type: 'taunt', duration: 1 });
        henry.statusEffects.push({ type: 'damage_reduction', duration: 1, value: 75 });
        state.addLog(`Henry Shelled Up! Taunting enemies and taking 75% less damage!`, 'shield');
      }
    }

    if (card.specialActionId === 'acorn_hoard') {
      set((s) => ({ currentCrackers: s.currentCrackers + 3 }));
      state.addLog(`Cidney raided his Acorn Hoard! +3 Crackers!`, 'special');
    }

    // Spend Crackers & Remove played card from hand to discard
    const newCrackers = state.currentCrackers - card.cost;
    const remainingHand = hand.filter((_, i) => i !== cardIndex);
    const updatedDiscard = [...(state.activeSide === 'p2' ? state.enemyDiscard : state.playerDiscard), card];

    // Check Victory / Defeat
    const allEnemiesDefeated = opposingTeam.every((s) => s.isUnstuffed);
    const allAlliesDefeated = friendlyTeam.every((s) => s.isUnstuffed);

    let battleResult = state.battleResult;
    if (allEnemiesDefeated) {
      battleResult = 'victory';
      state.addLog('VICTORY! All opposing stuffies defeated!', 'special');
    } else if (allAlliesDefeated) {
      battleResult = 'defeat';
      state.addLog('DEFEAT! All your stuffies were unstuffed!', 'special');
    }

    // Write back updated teams
    if (state.activeSide === 'p2') {
      set({
        enemyTeam: friendlyTeam,
        playerTeam: opposingTeam,
        enemyHand: remainingHand,
        enemyDiscard: updatedDiscard,
        currentCrackers: newCrackers,
        selectedCardIndex: null,
        selectedTargetId: null,
        battleResult,
      });
    } else {
      set({
        playerTeam: friendlyTeam,
        enemyTeam: opposingTeam,
        playerHand: remainingHand,
        playerDiscard: updatedDiscard,
        currentCrackers: newCrackers,
        selectedCardIndex: null,
        selectedTargetId: null,
        battleResult,
      });
    }

    return true;
  },

  endTurn: () => {
    const state = get();
    if (state.battleResult !== 'ongoing') return;

    if (state.gameMode === 'two_player') {
      // Toggle side and show Privacy Screen
      const nextSide = state.activeSide === 'p1' ? 'p2' : 'p1';

      // Draw up to 5 cards for the next player
      let targetDeck = [...(nextSide === 'p1' ? state.playerDeck : state.enemyDeck)];
      let targetHand = [...(nextSide === 'p1' ? state.playerHand : state.enemyHand)];
      let targetDiscard = [...(nextSide === 'p1' ? state.playerDiscard : state.enemyDiscard)];

      while (targetHand.length < 5) {
        if (targetDeck.length === 0) {
          if (targetDiscard.length === 0) break;
          targetDeck = [...targetDiscard].sort(() => Math.random() - 0.5);
          targetDiscard = [];
        }
        targetHand.push(targetDeck.shift()!);
      }

      // Turn start effects (Poison, Beaker passive, etc.)
      const team = nextSide === 'p1' ? state.playerTeam : state.enemyTeam;
      team.forEach((stuffy) => {
        if (!stuffy.isUnstuffed) {
          // Beaker passive: +1 HP every battle turn
          if (stuffy.speciesId === 'beaker') {
            stuffy.currentHp = Math.min(stuffy.maxHp, stuffy.currentHp + 1);
          }
          // Poison tick
          const poison = stuffy.statusEffects.find((e) => e.type === 'poison');
          if (poison && poison.value) {
            stuffy.currentHp = Math.max(0, stuffy.currentHp - poison.value);
            if (stuffy.currentHp === 0) stuffy.isUnstuffed = true;
          }
        }
      });

      set({
        activeSide: nextSide,
        currentCrackers: 7,
        privacyCoverActive: true,
        selectedCardIndex: null,
        selectedTargetId: null,
        ...(nextSide === 'p1'
          ? { playerDeck: targetDeck, playerHand: targetHand, playerDiscard: targetDiscard }
          : { enemyDeck: targetDeck, enemyHand: targetHand, enemyDiscard: targetDiscard }),
      });
      return;
    }

    // Campaign Mode: Enemy AI Turn
    state.addLog(`--- Enemy Turn ---`, 'special');

    // Process enemy actions
    let enemyTeam = [...state.enemyTeam];
    let playerTeam = [...state.playerTeam];

    enemyTeam.forEach((enemy) => {
      if (!enemy.isUnstuffed && playerTeam.some((p) => !p.isUnstuffed)) {
        // Target random live player stuffy (or Henry if taunting)
        const livePlayers = playerTeam.filter((p) => !p.isUnstuffed);
        const taunter = livePlayers.find((p) => p.statusEffects.some((e) => e.type === 'taunt'));
        const target = taunter || livePlayers[Math.floor(Math.random() * livePlayers.length)];

        if (target) {
          let enemyDmg = 8 + Math.floor(Math.random() * 8);
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

          if (target.currentHp <= 0) {
            target.isUnstuffed = true;
            state.addLog(`${target.name} was UNSTUFFED by enemy!`, 'damage');
          }
        }
      }
    });

    // Check player team defeat
    const allPlayersDead = playerTeam.every((p) => p.isUnstuffed);
    if (allPlayersDead) {
      set({ battleResult: 'defeat', playerTeam });
      state.addLog('All your stuffies were unstuffed! DEFEAT!', 'special');
      return;
    }

    // Start New Player Turn:
    // 1. Draw up to 5 cards (keeping unplayed cards)
    let pDeck = [...state.playerDeck];
    let pHand = [...state.playerHand];
    let pDiscard = [...state.playerDiscard];

    while (pHand.length < 5) {
      if (pDeck.length === 0) {
        if (pDiscard.length === 0) break;
        pDeck = [...pDiscard].sort(() => Math.random() - 0.5);
        pDiscard = [];
      }
      pHand.push(pDeck.shift()!);
    }

    // 2. Beaker passive regen & Poison tick
    playerTeam.forEach((s) => {
      if (!s.isUnstuffed) {
        if (s.speciesId === 'beaker') {
          s.currentHp = Math.min(s.maxHp, s.currentHp + 1);
        }
        const poison = s.statusEffects.find((e) => e.type === 'poison');
        if (poison && poison.value) {
          s.currentHp = Math.max(0, s.currentHp - poison.value);
          if (s.currentHp === 0) s.isUnstuffed = true;
        }
      }
    });

    set({
      turnNumber: state.turnNumber + 1,
      currentCrackers: state.maxCrackers,
      playerHand: pHand,
      playerDeck: pDeck,
      playerDiscard: pDiscard,
      playerTeam,
      enemyTeam,
      selectedCardIndex: null,
      selectedTargetId: null,
    });
    state.addLog(`Turn ${state.turnNumber + 1}: Crackers refilled to ${state.maxCrackers}! Drew cards.`, 'special');
  },

  dismissPrivacyCover: () => {
    set({ privacyCoverActive: false });
  },
}));

function handleStuffyCasualty(state: CombatStore, fallenStuffy: StuffyState) {
  // 2-Player mode first blood rule:
  // "once a stuffy dies 2 of those 3 go to the one who lost a stuffy. the other one goes to the killer."
  if (state.gameMode === 'two_player' && !state.firstBloodTriggered && state.twoPlayerReserve.length >= 3) {
    state.firstBloodTriggered = true;
    const isP1Victim = state.playerTeam.some((s) => s.instanceId === fallenStuffy.instanceId);

    // Give 2 to victim, 1 to killer
    const victimAdd = state.twoPlayerReserve.slice(0, 2);
    const killerAdd = state.twoPlayerReserve.slice(2, 3);

    state.addLog(
      `FIRST BLOOD REINFORCEMENTS! ${
        isP1Victim ? 'Player 1' : 'Player 2'
      } receives 2 reserve stuffies! The killer receives 1!`,
      'special'
    );
  }
}
