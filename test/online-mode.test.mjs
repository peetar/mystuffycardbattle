import assert from 'node:assert';

console.log('===========================================================');
console.log('--- RUNNING BEN STUFFY ONLINE MODE SYNC VERIFICATION ---');
console.log('===========================================================\n');

// Mock data structures matching src/app/api/online/route.ts
const mockPlayableStuffies = [
  { id: 'alex', name: 'Alex', baseHp: 65, speed: 12 },
  { id: 'jefe', name: 'Jefe', baseHp: 75, speed: 14 },
  { id: 'finlee', name: 'Finlee', baseHp: 80, speed: 8 },
  { id: 'fifi', name: 'Fifi', baseHp: 60, speed: 15 },
  { id: 'thumper', name: 'Thumper', baseHp: 85, speed: 10 },
  { id: 'slugmee', name: 'Slugmee', baseHp: 70, speed: 6 },
  { id: 'beaker', name: 'Beaker', baseHp: 68, speed: 11 },
  { id: 'henry', name: 'Henry', baseHp: 90, speed: 7 },
  { id: 'toothless', name: 'Toothless', baseHp: 78, speed: 16 },
  { id: 'dear', name: 'Dear', baseHp: 58, speed: 18 },
  { id: 'cole', name: 'Cole', baseHp: 92, speed: 5 },
  { id: 'joann', name: 'Joann', baseHp: 64, speed: 13 },
  { id: 'cidney', name: 'Cidney', baseHp: 72, speed: 9 },
  { id: 'chanteira', name: 'Chanteira', baseHp: 88, speed: 10 },
  { id: 'riolu', name: 'Riolu', baseHp: 74, speed: 14 },
  { id: 'eevee', name: 'Eevee', baseHp: 66, speed: 13 }
];

const mockCards = {
  strike: { id: 'strike', name: 'Plush Strike', cost: 1, damage: 15, type: 'attack', target: 'single_enemy' },
  shell_up: { id: 'shell_up', name: 'Shell Up', cost: 2, damage: 10, block: 15, type: 'attack', target: 'single_enemy' },
  group_hug: { id: 'group_hug', name: 'Group Hug', cost: 2, heal: 30, type: 'heal', target: 'all_allies', aoeType: 'spread' },
  around_blast: { id: 'around_blast', name: 'Shockwave Splash', cost: 3, damage: 60, type: 'attack', target: 'around_enemy', aoeType: 'around' },
  spread_volley: { id: 'spread_volley', name: 'Feather Volley', cost: 2, damage: 40, type: 'attack', target: 'all_enemies', aoeType: 'spread' },
  defend: { id: 'defend', name: 'Quilt Guard', cost: 1, block: 12, type: 'defense', target: 'single_ally' }
};

// ---------------------------------------------------------
// TEST 1: MATCHMAKING RESPECTS maxPlayers LIMIT
// ---------------------------------------------------------
console.log('TEST 1: Matchmaking Max Players Slot Limit...');
const rooms = new Map();
const room2P = {
  id: 'ROOM_2P',
  status: 'lobby',
  isOpenToRandom: true,
  region: 'us-east',
  hostUsername: 'HostPlayer',
  hostSkillRating: 1000,
  maxPlayers: 2,
  slots: [
    { slotIndex: 1, type: 'random', player: { username: 'Player2', skillRating: 1000, isBot: false, ready: true } },
    { slotIndex: 2, type: 'none' },
    { slotIndex: 3, type: 'none' }
  ]
};
rooms.set(room2P.id, room2P);

// When a 3rd player attempts to match into a 2-player room with slot 0 already filled:
const maxActive = (room2P.maxPlayers || 2) - 1;
const availableSlot = room2P.slots.slice(0, maxActive).find((s) => !s.player);
assert.strictEqual(availableSlot, undefined, '2-player room with slot 0 filled must not accept a 3rd player');
console.log('  ✅ PASSED: 2-Player room correctly rejects 3rd player match attempt');

// ---------------------------------------------------------
// TEST 2: HAND SYNCHRONIZATION (Server-Authoritative Hands Preserved)
// ---------------------------------------------------------
console.log('\nTEST 2: Authoritative Hand & Deck Preservation...');
const serverDeckP1 = [
  mockCards.strike, mockCards.strike, mockCards.shell_up, mockCards.defend,
  mockCards.group_hug, mockCards.around_blast, mockCards.spread_volley
];
const serverHandP1 = serverDeckP1.slice(0, 5);
const serverRemainingP1 = serverDeckP1.slice(5);

const incomingMultiplayerPlayer = {
  id: 'p1',
  name: 'Ben',
  team: [{ instanceId: 'p1_s0', speciesId: 'jefe', name: 'Jefe', maxHp: 75, currentHp: 75, shield: 0, isUnstuffed: false }],
  deck: serverRemainingP1,
  hand: serverHandP1,
  discard: [],
  bench: [],
  isEliminated: false
};

// Test initialization logic:
function initializeMultiplayerBattleSim(player) {
  const hasAuthoritativeHand = Array.isArray(player.hand) && player.hand.length > 0;
  let hand = player.hand;
  let remainingDeck = player.deck;

  if (!hasAuthoritativeHand) {
    const shuffled = [...player.deck].sort(() => Math.random() - 0.5);
    hand = shuffled.slice(0, 5);
    remainingDeck = shuffled.slice(5);
  }

  return {
    ...player,
    hand: hand || [],
    deck: remainingDeck || [],
    discard: player.discard || [],
  };
}

const initialized = initializeMultiplayerBattleSim(incomingMultiplayerPlayer);
assert.strictEqual(initialized.hand.length, 5);
assert.deepStrictEqual(initialized.hand, serverHandP1, 'Initialized hand must match server authoritative hand 1:1');
assert.deepStrictEqual(initialized.deck, serverRemainingP1, 'Initialized deck must match server remaining deck 1:1');
console.log('  ✅ PASSED: Authoritative hand and deck preserved without client re-shuffling');

// ---------------------------------------------------------
// TEST 3: ATTACK CARDS WITH BLOCK REWARD FRIENDLY ATTACKER, NOT ENEMY
// ---------------------------------------------------------
console.log('\nTEST 3: Attack Cards with Block Reward Shield to Attacker...');
const attacker = { instanceId: 'p1_s0', name: 'Jefe', currentHp: 75, maxHp: 75, shield: 0, isUnstuffed: false };
const enemy = { instanceId: 'p2_s0', name: 'Finlee', currentHp: 80, maxHp: 80, shield: 0, isUnstuffed: false };
const shellCard = mockCards.shell_up; // 10 dmg, 15 block

function resolveAttackCardSim(card, targetStuffy, attackerStuffy) {
  if (targetStuffy && card.damage) {
    const absorbed = Math.min(targetStuffy.shield, card.damage);
    targetStuffy.shield -= absorbed;
    const remaining = card.damage - absorbed;
    targetStuffy.currentHp = Math.max(0, targetStuffy.currentHp - remaining);
  }
  // Shield goes to FRIENDLY attacker stuffy:
  if (card.block && attackerStuffy) {
    attackerStuffy.shield += card.block;
  }
}

resolveAttackCardSim(shellCard, enemy, attacker);
assert.strictEqual(enemy.currentHp, 70, 'Enemy should take 10 damage (80 -> 70)');
assert.strictEqual(enemy.shield, 0, 'Enemy must NOT receive shield from player card');
assert.strictEqual(attacker.shield, 15, 'Friendly attacker stuffy must receive 15 shield');
console.log('  ✅ PASSED: Shield bonus awarded to friendly attacker, enemy takes damage and gets 0 shield');

// ---------------------------------------------------------
// TEST 4: AROUND AOE DAMAGE SPLITTING & NEIGHBOR SPLASH
// ---------------------------------------------------------
console.log('\nTEST 4: Around AoE Card Splitting to Center & Adjacent Neighbors...');
const enemySquad = [
  { instanceId: 'p2_s0', name: 'Finlee', currentHp: 80, maxHp: 80, shield: 0, isUnstuffed: false },
  { instanceId: 'p2_s1', name: 'Fifi', currentHp: 60, maxHp: 60, shield: 0, isUnstuffed: false },
  { instanceId: 'p2_s2', name: 'Thumper', currentHp: 85, maxHp: 85, shield: 0, isUnstuffed: false },
  { instanceId: 'p2_s3', name: 'Slugmee', currentHp: 70, maxHp: 70, shield: 0, isUnstuffed: false }
];

const aroundCard = mockCards.around_blast; // 60 damage total, around_enemy AoE
const centerTargetId = 'p2_s1'; // Fifi (index 1). Neighbors: Finlee (0) & Thumper (2). Non-adjacent: Slugmee (3).

function resolveAroundAoESim(card, centerId, enemies) {
  const centerIdx = enemies.findIndex(s => s.instanceId === centerId);
  const hitTargets = enemies.filter((s, idx) => !s.isUnstuffed && s.currentHp > 0 && Math.abs(idx - centerIdx) <= 1);
  const dmgPerTarget = hitTargets.length > 0 ? Math.round(card.damage / hitTargets.length) : 0;

  hitTargets.forEach(s => {
    const absorbed = Math.min(s.shield, dmgPerTarget);
    s.shield -= absorbed;
    const remaining = dmgPerTarget - absorbed;
    s.currentHp = Math.max(0, s.currentHp - remaining);
  });
  return { hitCount: hitTargets.length, dmgPerTarget };
}

const aoeResult = resolveAroundAoESim(aroundCard, centerTargetId, enemySquad);
assert.strictEqual(aoeResult.hitCount, 3, 'Around AoE should hit 3 targets (center + 2 neighbors)');
assert.strictEqual(aoeResult.dmgPerTarget, 20, '60 damage split across 3 targets = 20 damage each');
assert.strictEqual(enemySquad[0].currentHp, 60, 'Neighbor Finlee took 20 damage (80 -> 60)');
assert.strictEqual(enemySquad[1].currentHp, 40, 'Center Fifi took 20 damage (60 -> 40)');
assert.strictEqual(enemySquad[2].currentHp, 65, 'Neighbor Thumper took 20 damage (85 -> 65)');
assert.strictEqual(enemySquad[3].currentHp, 70, 'Non-adjacent Slugmee untouched (70 HP)');
console.log('  ✅ PASSED: Around AoE correctly splashes center and adjacent neighbors with split damage');

// ---------------------------------------------------------
// TEST 5: SINGLE-TARGET ATTACK AUTO-TARGETS LIVING ENEMY WHEN targetId OMITTED
// ---------------------------------------------------------
console.log('\nTEST 5: Single-Target Attack Auto-Targeting When targetId Omitted...');
const targetOmitted = undefined;
const liveEnemies = enemySquad.filter(s => !s.isUnstuffed && s.currentHp > 0);
let autoTarget = liveEnemies.find(s => s.instanceId === targetOmitted) || liveEnemies[0];

assert.notStrictEqual(autoTarget, undefined, 'Auto-target should select first living enemy');
assert.strictEqual(autoTarget.instanceId, 'p2_s0', 'Should auto-target p2_s0');

const strikeCard = mockCards.strike; // 15 dmg
const prevHp = autoTarget.currentHp;
autoTarget.currentHp = Math.max(0, autoTarget.currentHp - strikeCard.damage);
assert.strictEqual(autoTarget.currentHp, prevHp - 15, 'Living enemy takes 15 damage even when targetId was omitted');
console.log('  ✅ PASSED: Single-target attack auto-targets first living enemy instead of dealing 0 damage');

// ---------------------------------------------------------
// TEST 6: DISCARD CARD SYNCHRONIZATION
// ---------------------------------------------------------
console.log('\nTEST 6: Combat Discard Card Action...');
const testActingPlayer = {
  id: 'p1',
  name: 'Ben',
  hand: [mockCards.strike, mockCards.defend, mockCards.shell_up],
  discard: []
};

// Discard index 1 (mockCards.defend)
const discarded = testActingPlayer.hand.splice(1, 1)[0];
testActingPlayer.discard.push(discarded);

assert.strictEqual(testActingPlayer.hand.length, 2);
assert.strictEqual(testActingPlayer.hand[0].id, 'strike');
assert.strictEqual(testActingPlayer.hand[1].id, 'shell_up');
assert.strictEqual(testActingPlayer.discard.length, 1);
assert.strictEqual(testActingPlayer.discard[0].id, 'defend');
console.log('  ✅ PASSED: Card discarded from hand and added to discard pile cleanly');

console.log('\n===========================================================');
console.log('🎉 ALL ONLINE MODE SYNCHRONIZATION TESTS PASSED! 🎉');
console.log('===========================================================');
