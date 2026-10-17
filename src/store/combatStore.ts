import { create } from 'zustand';
import { Card, StuffyState, StatusEffect } from '@/types/game';
import { ALL_CARDS, CARD_MAP } from '@/data/cards';
import { STUFFY_MAP } from '@/data/stuffies';

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

  // Animations & Enemy Review
  activeAttackAnimation: ActiveAttackAnimation | null;
  recentEnemyActions: EnemyTurnAction[];
  showEnemyTurnReview: boolean;

  // Alex's S-Tier Strokenosis Mind Control Modal
  strokenosisActive: boolean;
  strokenosisCards: Card[];

  // Battle outcome
  battleResult: 'ongoing' | 'victory' | 'defeat' | 'p1_victory' | 'p2_victory';
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
  resolveStrokenosis: (cardIndex: number) => void;
  endTurn: () => void;
  dismissPrivacyCover: () => void;
  dismissEnemyTurnReview: () => void;
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

  activeAttackAnimation: null,
  recentEnemyActions: [],
  showEnemyTurnReview: false,

  strokenosisActive: false,
  strokenosisCards: [],

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

    // Apply starting shield to player team (retaining previous health)
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
      activeAttackAnimation: null,
      recentEnemyActions: [],
      showEnemyTurnReview: false,
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
      activeAttackAnimation: null,
      recentEnemyActions: [],
      showEnemyTurnReview: false,
      battleResult: 'ongoing',
      combatLogs: [{ id: '1', text: '2-Player battle started! Player 1 goes first!', type: 'special' }],
    });
  },

  selectCard: (index) => {
    const { selectedCardIndex, playCard, selectedTargetId } = get();
    // If clicking the already selected card, play it immediately on the target or default target!
    if (selectedCardIndex === index && index !== null) {
      playCard(index, selectedTargetId || undefined);
      return;
    }

    set({ selectedCardIndex: index });

    // If card targets self, all allies, or all enemies, auto-play immediately!
    const hand = get().activeSide === 'p2' ? get().enemyHand : get().playerHand;
    const card = hand[index ?? -1];
    if (card && (card.target === 'self' || card.target === 'all_allies' || card.target === 'all_enemies' || card.target === 'none')) {
      playCard(index!, undefined);
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
        if (card.type !== 'heal' && !card.heal) {
          state.addLog(`${ownerStuffy.name} is Brain-Damaged! Must heal them first!`, 'status');
          return false;
        }
      }
    }

    let friendlyTeam = [...(state.activeSide === 'p2' ? state.enemyTeam : state.playerTeam)];
    let opposingTeam = [...(state.activeSide === 'p2' ? state.playerTeam : state.enemyTeam)];

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

    // Identify attacker stuffy for animation
    const attackerStuffy = friendlyTeam.find((s) => s.speciesId === card.stuffyId) || friendlyTeam[0];

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
        // Physical Melee Lunge!
        isRanged = false;
        projectileType = 'slash';
      }

      // Trigger animation event!
      set({
        activeAttackAnimation: {
          attackerId: attackerStuffy.instanceId,
          targetId: targetStuffy?.instanceId,
          isRanged,
          projectileType,
          cardName: card.name,
        },
      });

      // Clear animation after 700ms
      setTimeout(() => {
        set({ activeAttackAnimation: null });
      }, 700);
    }

    // Apply Card Effects
    // 1. Single Enemy Attack
    if ((card.target === 'single_enemy' || (!card.target && card.damage)) && targetStuffy) {
      let dmg = card.damage || 0;
      if (targetStuffy.statusEffects.some((e) => e.type === 'earthquake_crack')) {
        dmg = dmg * 2;
        state.addLog(`${targetStuffy.name} is in a crack! Takes 2x damage!`, 'damage');
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

      if (card.lifesteal && card.stuffyId) {
        const attacker = friendlyTeam.find((s) => s.speciesId === card.stuffyId);
        if (attacker && !attacker.isUnstuffed) {
          attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + dmg);
          state.addLog(`${attacker.name} lifestealed ${dmg} HP!`, 'heal');
        }
      }

      if (card.brainDamage) {
        targetStuffy.statusEffects.push({ type: 'brain_damaged' });
        state.addLog(`${targetStuffy.name} suffered Brain Damage!`, 'status');
      }

      if (card.poison) {
        targetStuffy.statusEffects.push({ type: 'poison', value: card.poison, duration: 3 });
        state.addLog(`${targetStuffy.name} was poisoned (+${card.poison} DoT)!`, 'status');
      }

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

    // 3. HEALING & RESTITCH
    // Special: Slugmee Sacrifice Heal (Slugmee takes 5 damage and heals ANOTHER ally for 22 HP; CANNOT heal herself!)
    if (card.id === 'slugmee_b3') {
      const slugmee = friendlyTeam.find((s) => s.speciesId === 'slugmee');
      if (slugmee && !slugmee.isUnstuffed) {
        slugmee.currentHp = Math.max(1, slugmee.currentHp - 5);
        state.addLog(`Slugmee took 5 sacrifice damage!`, 'damage');
      }

      // Find another ally (MUST NOT BE SLUGMEE!)
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
          state.addLog(`${card.name} healed ${ally.name} for ${healAmount} HP!`, 'heal');
        }
      } else if (card.target === 'all_allies') {
        friendlyTeam.forEach((ally) => {
          if (!ally.isUnstuffed) {
            ally.currentHp = Math.min(ally.maxHp, ally.currentHp + healAmount);
            ally.statusEffects = ally.statusEffects.filter((e) => e.type !== 'brain_damaged');
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
        unstuffedAlly.currentHp = card.heal || 25;
        state.addLog(`${unstuffedAlly.name} was RESTITCHED with ${unstuffedAlly.currentHp} HP!`, 'heal');
      }
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

    // Alex's S-Tier Strokenosis Mind Control
    if (card.specialActionId === 'strokenosis') {
      let opponentCards: Card[] = [];
      if (state.gameMode === 'two_player') {
        const oppHand = state.activeSide === 'p1' ? state.enemyHand : state.playerHand;
        const oppDeck = state.activeSide === 'p1' ? state.enemyDeck : state.playerDeck;
        opponentCards = [...oppHand];
        if (opponentCards.length < 5) {
          opponentCards = [...opponentCards, ...oppDeck.slice(0, 5 - opponentCards.length)];
        }
      } else {
        // Campaign mode: pick 5 cards from opposing enemy stuffies
        const opposingSpecies = opposingTeam.map((s) => s.speciesId);
        const enemyPool = ALL_CARDS.filter((c) => c.stuffyId && opposingSpecies.includes(c.stuffyId));
        opponentCards = [...enemyPool].sort(() => Math.random() - 0.5).slice(0, 5);
        if (opponentCards.length < 5) {
          opponentCards = [...opponentCards, ...ALL_CARDS.slice(0, 5 - opponentCards.length)];
        }
      }

      set({
        strokenosisActive: true,
        strokenosisCards: opponentCards.slice(0, 5),
      });
      state.addLog(`Alex unleashed STROKENOSIS! Mind-controlling the opponent's cards!`, 'special');
    }

    // Spend Crackers & Move played card to discard
    const newCrackers = state.currentCrackers - card.cost;
    const remainingHand = hand.filter((_, i) => i !== cardIndex);
    const updatedDiscard = [...(state.activeSide === 'p2' ? state.enemyDiscard : state.playerDiscard), card];

    // Check Victory / Defeat precisely per side
    const p1TeamUpdated = state.activeSide === 'p2' ? opposingTeam : friendlyTeam;
    const p2TeamUpdated = state.activeSide === 'p2' ? friendlyTeam : opposingTeam;

    const p1RemainingCount = p1TeamUpdated.filter((s) => !s.isUnstuffed && s.currentHp > 0).length;
    const p2RemainingCount = p2TeamUpdated.filter((s) => !s.isUnstuffed && s.currentHp > 0).length;

    let battleResult = state.battleResult;
    if (state.gameMode === 'two_player') {
      if (p2RemainingCount === 0 && p1RemainingCount > 0) {
        battleResult = 'p1_victory';
        state.addLog('PLAYER 1 WINS THE 2-PLAYER MATCH! 🏆', 'special');
      } else if (p1RemainingCount === 0 && p2RemainingCount > 0) {
        battleResult = 'p2_victory';
        state.addLog('PLAYER 2 WINS THE 2-PLAYER MATCH! 🏆', 'special');
      }
    } else {
      if (p2RemainingCount === 0 && p1RemainingCount > 0) {
        battleResult = 'victory';
        state.addLog('VICTORY! All opposing stuffies defeated!', 'special');
      } else if (p1RemainingCount === 0) {
        battleResult = 'defeat';
        state.addLog('DEFEAT! All your stuffies were unstuffed!', 'special');
      }
    }

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

    // Execute the stolen card against the opponent!
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
            if (enemy.currentHp === 0) enemy.isUnstuffed = true;
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
          if (liveOpp.currentHp === 0) liveOpp.isUnstuffed = true;
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
        if (liveOpp.currentHp === 0) liveOpp.isUnstuffed = true;
        state.addLog(`Mind-controlled "${stolenCard.name}" inflicted 16 psychic brain damage on ${liveOpp.name}!`, 'special');
      }
    }

    // In 2-Player mode, discard the stolen card from the opponent's hand
    if (state.gameMode === 'two_player') {
      if (state.activeSide === 'p1') {
        const oppHand = state.enemyHand.filter((c) => c.id !== stolenCard.id);
        set({ enemyHand: oppHand });
      } else {
        const oppHand = state.playerHand.filter((c) => c.id !== stolenCard.id);
        set({ playerHand: oppHand });
      }
    }

    // Check Victory / Defeat
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

    if (state.gameMode === 'two_player') {
      const nextSide = state.activeSide === 'p1' ? 'p2' : 'p1';

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

      const team = nextSide === 'p1' ? state.playerTeam : state.enemyTeam;
      team.forEach((stuffy) => {
        if (!stuffy.isUnstuffed) {
          if (stuffy.speciesId === 'beaker') {
            stuffy.currentHp = Math.min(stuffy.maxHp, stuffy.currentHp + 1);
          }
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

    // Campaign Mode: Enemy AI Turn with FULL Action Tracking & Animations!
    state.addLog(`--- Enemy Turn ---`, 'special');

    let enemyTeam = [...state.enemyTeam];
    let playerTeam = [...state.playerTeam];
    const enemyActions: EnemyTurnAction[] = [];

    enemyTeam.forEach((enemy) => {
      if (!enemy.isUnstuffed && playerTeam.some((p) => !p.isUnstuffed)) {
        // Pick an actual card belonging to this enemy stuffy!
        const enemyCards = ALL_CARDS.filter((c) => c.stuffyId === enemy.speciesId);
        const cardToPlay =
          enemyCards.length > 0
            ? enemyCards[Math.floor(Math.random() * enemyCards.length)]
            : { name: 'Plush Bash', damage: 10, tier: 'C', type: 'attack', description: 'Bashes with plush fists.' };

        // Target live player stuffy (honoring Henry's taunt)
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

          if (target.currentHp <= 0) {
            target.isUnstuffed = true;
            state.addLog(`${target.name} was UNSTUFFED by ${enemy.name}!`, 'damage');
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
      set({ battleResult: 'defeat', playerTeam, recentEnemyActions: enemyActions, showEnemyTurnReview: true });
      state.addLog('All your stuffies were unstuffed! DEFEAT!', 'special');
      return;
    }

    // Draw up to 5 cards for Player
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

    // Beaker passive & Poison tick
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
      recentEnemyActions: enemyActions,
      showEnemyTurnReview: enemyActions.length > 0,
      selectedCardIndex: null,
      selectedTargetId: null,
    });
  },

  dismissPrivacyCover: () => set({ privacyCoverActive: false }),
  dismissEnemyTurnReview: () => set({ showEnemyTurnReview: false }),
}));

function handleStuffyCasualty(state: CombatStore, fallenStuffy: StuffyState) {
  if (state.gameMode === 'two_player' && !state.firstBloodTriggered && state.twoPlayerReserve.length >= 3) {
    state.firstBloodTriggered = true;
    const isP1Victim = state.playerTeam.some((s) => s.instanceId === fallenStuffy.instanceId);

    state.addLog(
      `FIRST BLOOD REINFORCEMENTS! ${
        isP1Victim ? 'Player 1' : 'Player 2'
      } receives 2 reserve stuffies! The killer receives 1!`,
      'special'
    );
  }
}
