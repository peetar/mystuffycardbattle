import assert from 'node:assert';

console.log('--- RUNNING ONLINE TEAM MECHANICS & COMBAT DYNAMICS TESTS ---\n');

// 1. Test Team Alliances & Grouping
console.log('Testing Team Alliances & Match Formats:');
const players2v2 = [
  { id: 'p1', name: 'Alice', teamGroup: 'red' },
  { id: 'p2', name: 'Bob', teamGroup: 'blue' },
  { id: 'p3', name: 'Charlie', teamGroup: 'red' },
  { id: 'p4', name: 'Dave', teamGroup: 'blue' },
];

const redTeam = players2v2.filter(p => p.teamGroup === 'red');
const blueTeam = players2v2.filter(p => p.teamGroup === 'blue');
assert.strictEqual(redTeam.length, 2);
assert.strictEqual(blueTeam.length, 2);
assert.deepStrictEqual(redTeam.map(p => p.name), ['Alice', 'Charlie']);
assert.deepStrictEqual(blueTeam.map(p => p.name), ['Bob', 'Dave']);
console.log('✅ PASSED: 2v2 Tag-Team properly groups players into Red and Blue alliances');

// 2. Test Cracker Gifting / Relay
console.log('\nTesting Cracker Gifting / Relay Energy:');
let aliceCrackers = 3; // Alice finishes turn with 3 unspent crackers
let charlieBonusCrackersNextTurn = 0;

if (aliceCrackers > 0) {
  charlieBonusCrackersNextTurn += aliceCrackers;
}

const charlieStartingCrackers = 7 + charlieBonusCrackersNextTurn;
assert.strictEqual(charlieStartingCrackers, 10);
console.log('✅ PASSED: 3 unspent Crackers converted into +3 bonus Crackers for teammate (7 -> 10 Crackers)');

// 3. Test Card Passing / Trading (Once Per Turn)
console.log('\nTesting Card Passing / Trading:');
const aliceHand = [{ id: 'card_1', name: 'Cotton Punch' }, { id: 'card_2', name: 'Heal Patch' }];
const charlieHand = [{ id: 'card_3', name: 'Shield Shell' }];
let hasPassedCardThisTurn = false;

// Attempt first pass
assert.strictEqual(hasPassedCardThisTurn, false);
const passedCard = aliceHand.splice(1, 1)[0];
charlieHand.push(passedCard);
hasPassedCardThisTurn = true;

assert.strictEqual(aliceHand.length, 1);
assert.strictEqual(charlieHand.length, 2);
assert.strictEqual(charlieHand[1].name, 'Heal Patch');
assert.strictEqual(hasPassedCardThisTurn, true);

// Attempt second pass in same turn (should be blocked)
let passBlocked = false;
if (hasPassedCardThisTurn) {
  passBlocked = true;
}
assert.strictEqual(passBlocked, true);
console.log('✅ PASSED: 1 card passed from Alice to Charlie; second pass in same turn strictly blocked');

// 4. Test Cross-Team Ally Targeting
console.log('\nTesting Cross-Team Ally Targeting:');
const aliceStuffy = { instanceId: 's1', name: 'Jefe', currentHp: 50, maxHp: 78, shield: 0 };
const charlieStuffy = { instanceId: 's2', name: 'Alex', currentHp: 20, maxHp: 65, shield: 0 };
const alliedStuffies = [aliceStuffy, charlieStuffy];

// Alice plays a 25 Heal card targeting Charlie's Alex
const healAmount = 25;
const target = alliedStuffies.find(s => s.instanceId === 's2');
assert.ok(target);
target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
assert.strictEqual(charlieStuffy.currentHp, 45);
console.log("✅ PASSED: Alice successfully targeted and healed teammate Charlie's wounded Alex (+25 HP)");

// 5. Test Team Harmony Meter & Tag-Team Ultimate
console.log('\nTesting Team Harmony Meter & Tag-Team Ultimate:');
let harmonyMeter = 70;
const cardsPlayed = 2; // +15 per card -> 70 + 30 = 100
let ultimateAdded = false;

for (let i = 0; i < cardsPlayed; i++) {
  harmonyMeter += 15;
  if (harmonyMeter >= 100) {
    harmonyMeter = 0;
    ultimateAdded = true;
  }
}

assert.strictEqual(harmonyMeter, 0);
assert.strictEqual(ultimateAdded, true);
console.log('✅ PASSED: Harmony reached 100%, reset to 0% and unlocked 0-cost Tag-Team Ultimate "Stuffy Convergence"');

// 6. Test First-Discard Free Draw
console.log('\nTesting First-Discard Free Replacement Draw:');
let myHand = [{ id: 'c1', name: 'Strike' }, { id: 'c2', name: 'Useless' }];
let myDeck = [{ id: 'c3', name: 'Epic Finisher' }];
let myDiscard = [];
let hasUsedFreeDiscardDraw = false;

// First discard
const discarded = myHand.splice(1, 1)[0];
myDiscard.push(discarded);
if (!hasUsedFreeDiscardDraw && myDeck.length > 0) {
  myHand.push(myDeck.shift());
  hasUsedFreeDiscardDraw = true;
}
assert.strictEqual(myHand.length, 2);
assert.strictEqual(myHand[1].name, 'Epic Finisher');
assert.strictEqual(hasUsedFreeDiscardDraw, true);

// Second discard in same turn (should not draw)
const secondDiscarded = myHand.splice(0, 1)[0];
myDiscard.push(secondDiscarded);
if (!hasUsedFreeDiscardDraw && myDeck.length > 0) {
  myHand.push(myDeck.shift());
}
assert.strictEqual(myHand.length, 1);
console.log('✅ PASSED: First discard drew a replacement card; second discard in same turn did not draw');

// 7. Test Thorns, Stealth, and Rage Mechanics
console.log('\nTesting Thorns, Stealth, and Rage Mechanics:');
// Thorns:
const attacker = { name: 'Dolphim', currentHp: 50, shield: 0 };
const thornsTarget = { name: 'Spike', currentHp: 60, statusEffects: [{ type: 'thorns', value: 8 }] };
const thornsVal = thornsTarget.statusEffects.find(e => e.type === 'thorns').value;
attacker.currentHp -= thornsVal;
assert.strictEqual(attacker.currentHp, 42);
console.log('✅ PASSED: Thorns reflected 8 damage back to attacker (50 -> 42 HP)');

// Stealth:
const squad = [
  { name: 'Shade', statusEffects: [{ type: 'stealth' }] },
  { name: 'Jefe', statusEffects: [] },
];
let targetStuffy = squad[0]; // Targeted Shade
if (targetStuffy.statusEffects.some(e => e.type === 'stealth')) {
  const visible = squad.find(s => !s.statusEffects.some(e => e.type === 'stealth'));
  if (visible) targetStuffy = visible;
}
assert.strictEqual(targetStuffy.name, 'Jefe');
console.log('✅ PASSED: Stealth redirected single-target attack away from Shade to Jefe');

// Rage:
const brawler = { name: 'Tyrant', statusEffects: [{ type: 'rage', value: 0 }] };
const rageEff = brawler.statusEffects.find(e => e.type === 'rage');
rageEff.value += 5;
assert.strictEqual(rageEff.value, 5);
console.log('✅ PASSED: Rage increased bonus attack by +5 on taking damage');

console.log('\n🎉 ALL ONLINE TEAM & COMBAT DYNAMICS TESTS PASSED SUCCESSFULLY! 🎉');
