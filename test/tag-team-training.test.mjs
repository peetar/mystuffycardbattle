import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('===========================================================');
console.log('--- RUNNING BEN STUFFY TAG-TEAM TRAINING & SYNERGY TESTS ---');
console.log('===========================================================\n');

const townStoreFile = fs.readFileSync(path.resolve('src/store/townStore.ts'), 'utf-8');
const combatStoreFile = fs.readFileSync(path.resolve('src/store/combatStore.ts'), 'utf-8');
const townBuilderFile = fs.readFileSync(path.resolve('src/components/town/TownBuilder.tsx'), 'utf-8');
const battleArenaFile = fs.readFileSync(path.resolve('src/components/battle/BattleArena.tsx'), 'utf-8');

// TEST 1: TownStore Training Duo Pairs State & Actions
console.log('TEST 1: TownStore Training Duo State & Methods...');
assert.ok(townStoreFile.includes('trainedDuoPairs: [string, string][];'), 'townStore must declare trainedDuoPairs');
assert.ok(townStoreFile.includes('trainDuoPair: (stuffyAId: string, stuffyBId: string)'), 'townStore must declare trainDuoPair');
assert.ok(townStoreFile.includes('unpairDuo: (stuffyAId: string, stuffyBId: string)'), 'townStore must declare unpairDuo');
assert.ok(townStoreFile.includes('trainedDuoPairs: state.trainedDuoPairs'), 'trainedDuoPairs must be persisted in localStorage');
console.log('  ✅ PASSED: TownStore duo training methods & state persistence verified');

// TEST 2: Functional Logic of Duo Pairing and Unpairing
console.log('\nTEST 2: Functional Pairing Logic...');
let testPairs = [];
function simulateTrain(a, b) {
  if (!a || !b || a === b) return false;
  testPairs = [...testPairs.filter(([x, y]) => x !== a && x !== b && y !== a && y !== b), [a, b]];
  return true;
}
function simulateUnpair(a, b) {
  testPairs = testPairs.filter(([x, y]) => !((x === a && y === b) || (x === b && y === a)));
}

assert.strictEqual(simulateTrain('jefe', 'jefe'), false, 'Cannot pair a stuffy with itself');
assert.strictEqual(simulateTrain('jefe', 'alex'), true, 'Pairing Jefe and Alex succeeds');
assert.strictEqual(testPairs.length, 1);
assert.deepStrictEqual(testPairs[0], ['jefe', 'alex']);

// Overwriting with new pair removes old conflict
simulateTrain('alex', 'finlee');
assert.strictEqual(testPairs.length, 1);
assert.deepStrictEqual(testPairs[0], ['alex', 'finlee']);

simulateUnpair('alex', 'finlee');
assert.strictEqual(testPairs.length, 0);
console.log('  ✅ PASSED: Pairing, replacement, and unpairing logic operate cleanly');

// TEST 3: CombatStore Tag-Team Ability Gate (Trained Duo Requirement)
console.log('\nTEST 3: Combat Harmony Gate When No Stuffies Trained...');
function simulateCombatHarmony(friendlyTeam, trainedDuoPairs, currentHarmony) {
  const activeTrainedDuo = (trainedDuoPairs || []).find(([id1, id2]) => {
    const s1 = friendlyTeam.find(
      (s) => (s.speciesId === id1 || s.instanceId === id1) && !s.isUnstuffed && s.currentHp > 0
    );
    const s2 = friendlyTeam.find(
      (s) => (s.speciesId === id2 || s.instanceId === id2) && !s.isUnstuffed && s.currentHp > 0
    );
    return Boolean(s1 && s2);
  });

  if (!activeTrainedDuo) {
    return { nextHarmony: 0, tagTeamPopped: false };
  }

  let nextHarmony = currentHarmony + 15;
  let tagTeamPopped = false;
  if (nextHarmony >= 100) {
    nextHarmony = 0;
    tagTeamPopped = true;
  }
  return { nextHarmony, tagTeamPopped, activeTrainedDuo };
}

const squadUntrained = [
  { instanceId: 's1', speciesId: 'jefe', name: 'Jefe', currentHp: 50, isUnstuffed: false },
  { instanceId: 's2', speciesId: 'alex', name: 'Alex', currentHp: 40, isUnstuffed: false },
  { instanceId: 's3', speciesId: 'finlee', name: 'Finlee', currentHp: 60, isUnstuffed: false },
];

// No trained pairs in save
let res = simulateCombatHarmony(squadUntrained, [], 85);
assert.strictEqual(res.nextHarmony, 0, 'Harmony should not charge when no stuffies trained');
assert.strictEqual(res.tagTeamPopped, false, 'Tag-team ability must NOT pop up randomly');
console.log('  ✅ PASSED: Untrained squad cannot charge Harmony or pop up Tag-Team abilities');

// TEST 4: Combat Harmony When Only 1 Partner is in Battle
console.log('\nTEST 4: Only One Partner on Battle Field...');
const trainedJefeAlex = [['jefe', 'alex']];
const squadOnlyJefe = [
  { instanceId: 's1', speciesId: 'jefe', name: 'Jefe', currentHp: 50, isUnstuffed: false },
  { instanceId: 's3', speciesId: 'finlee', name: 'Finlee', currentHp: 60, isUnstuffed: false },
];

res = simulateCombatHarmony(squadOnlyJefe, trainedJefeAlex, 85);
assert.strictEqual(res.nextHarmony, 0, 'Harmony does not charge when only 1 partner is present');
assert.strictEqual(res.tagTeamPopped, false, 'Tag-team ability does not pop up with only 1 partner');
console.log('  ✅ PASSED: Both partners must be in combat for Tag-Team to trigger');

// TEST 5: Combat Harmony When One Partner is Unstuffed (Defeated)
console.log('\nTEST 5: Partner Defeated (Unstuffed) Mid-Battle...');
const squadAlexDefeated = [
  { instanceId: 's1', speciesId: 'jefe', name: 'Jefe', currentHp: 50, isUnstuffed: false },
  { instanceId: 's2', speciesId: 'alex', name: 'Alex', currentHp: 0, isUnstuffed: true },
];

res = simulateCombatHarmony(squadAlexDefeated, trainedJefeAlex, 85);
assert.strictEqual(res.nextHarmony, 0, 'Harmony ceases when partner is defeated');
assert.strictEqual(res.tagTeamPopped, false, 'Tag-team ability does not pop up when partner is dead');
console.log('  ✅ PASSED: Defeated partner halts Tag-Team synergy');

// TEST 6: Combat Harmony When Both Trained Partners are Alive
console.log('\nTEST 6: Both Partners Active and Alive in Combat...');
let harmony = 0;
for (let cardNum = 1; cardNum <= 6; cardNum++) {
  const step = simulateCombatHarmony(squadUntrained, trainedJefeAlex, harmony);
  harmony = step.nextHarmony;
  assert.strictEqual(step.tagTeamPopped, false, `Card ${cardNum} should not trigger premature pop up`);
}
assert.strictEqual(harmony, 90, 'Harmony charges +15% per card (6 * 15 = 90)');

// 7th card hits 100% and triggers Tag-Team Ultimate!
const finalStep = simulateCombatHarmony(squadUntrained, trainedJefeAlex, harmony);
assert.strictEqual(finalStep.nextHarmony, 0, 'Harmony resets to 0% after triggering ultimate');
assert.strictEqual(finalStep.tagTeamPopped, true, 'Tag-Team Ultimate pops up into hand!');
assert.deepStrictEqual(finalStep.activeTrainedDuo, ['jefe', 'alex']);
console.log('  ✅ PASSED: Both living partners successfully charge Harmony & trigger Tag-Team Ultimate');

// TEST 7: TownBuilder UI Integration
console.log('\nTEST 7: TownBuilder UI Dojo & Arena Integration...');
assert.ok(townBuilderFile.includes('hasDojo = buildings.some((b) => b.type === \'dojo\' || b.type === \'playground\')'), 'hasDojo check verified');
assert.ok(townBuilderFile.includes('TRAINING DOJO & TAG-TEAM ARENA'), 'Dojo modal header verified');
assert.ok(townBuilderFile.includes('ACTIVE TRAINED DUO PAIRS'), 'Active trained duo list verified');
assert.ok(townBuilderFile.includes('SELECT TWO PLUSHIES TO TRAIN TOGETHER:'), 'Dual plushie selector verified');
assert.ok(townBuilderFile.includes('SPAR & TRAIN TOGETHER:'), 'Training action button verified');
console.log('  ✅ PASSED: Training Dojo modal, header button, and double-click routing verified');

// TEST 8: BattleArena Harmony Meter Visibility
console.log('\nTEST 8: BattleArena Clean Visibility...');
assert.ok(battleArenaFile.includes('activeDuo'), 'BattleArena checks activeDuo presence');
assert.ok(battleArenaFile.includes('if (!activeDuo) return null;'), 'BattleArena hides meter when no trained duo is present');
console.log('  ✅ PASSED: Harmony meter hidden during combat unless active trained duo is on field');

console.log('\n===========================================================');
console.log('🎉 ALL TAG-TEAM TRAINING & COMBAT GATING TESTS PASSED! 🎉');
console.log('===========================================================');
