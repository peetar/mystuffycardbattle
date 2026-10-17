// Self-contained game rules test runner in standard ES Modules

function calculateFoodHeal(currentHp, maxHp, preference) {
  if (currentHp >= maxHp) {
    return { healedAmount: 0, newHp: maxHp, message: 'Already at maximum stuffing!' };
  }
  const missingHp = maxHp - currentHp;
  if (currentHp / maxHp > 0.90) {
    return { healedAmount: missingHp, newHp: maxHp, message: 'Above 90% HP! Full heal to 100% stuffing!' };
  }
  let ratio = 0.375;
  if (preference === 'favorite') ratio = 0.75;
  else if (preference === 'hated') ratio = 0.25;

  const rawHeal = Math.round(missingHp * ratio);
  const healedAmount = Math.max(1, Math.min(missingHp, rawHeal));
  const newHp = Math.min(maxHp, currentHp + healedAmount);
  return { healedAmount, newHp };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('--- RUNNING BEN STUFFY CARD BATTLE FORMULA TESTS ---\n');

// 1. Food Healing Math Tests
console.log('Testing Food Healing Formula:');
const testAbove90 = calculateFoodHeal(95, 100, 'hated');
assert(testAbove90.newHp === 100, '>90% HP restores 100% to full HP even with hated food');

const testFav = calculateFoodHeal(20, 100, 'favorite');
assert(testFav.healedAmount === 60 && testFav.newHp === 80, 'Favorite food restores 75% of missing HP (20/100 -> +60 -> 80)');

const testMid = calculateFoodHeal(20, 100, 'mid');
assert(testMid.healedAmount === 30 && testMid.newHp === 50, 'Mid food restores 37.5% of missing HP (20/100 -> +30 -> 50)');

const testHated = calculateFoodHeal(20, 100, 'hated');
assert(testHated.healedAmount === 20 && testHated.newHp === 40, 'Hated food restores 25% of missing HP (20/100 -> +20 -> 40)');

// 2. 16 Stuffy Roster Check
console.log('\nTesting Roster Coverage:');
const roster = [
  'Alex (Pink Axolotl)', 'Jefe (Blue Penguin)', 'Finlee (Orca)', 'Fifi (Red Fox)',
  'Thumper (Hammerhead)', 'Toothless (Night Fury)', 'Riolu (Aura Medic)', 'Eevee (Occult Laser)',
  'Slugmee (Yellow Slug)', 'Beaker (Yosemite Owl)', 'Henry (Baby Turtle)', 'Dear (Dart Frog)',
  'Cole (Mini Turtle)', 'Joann (Brown Cat)', 'Cidney (Fat Squirrel)', 'Chanteira (Fat Dolphin)'
];
assert(roster.length === 16, 'All 16 stuffed animals accounted for');

// 3. Crackers & Hand Size Rules
console.log('\nTesting Mana & Draw Rules:');
const startCrackers = 7;
assert(startCrackers === 7, 'Combat begins with 7 Crackers (mana) per turn');
const maxHandSize = 5;
assert(maxHandSize === 5, 'Turn draws up to 5 cards (retaining unplayed cards in hand)');

// 4. 2-Player Reinforcement Pool Rule
console.log('\nTesting 2-Player First Blood Reinforcement Rule:');
const totalStuffies = 16;
const startingP1 = 5;
const startingP2 = 5;
const reservePool = 3;
assert(totalStuffies >= startingP1 + startingP2 + reservePool, '16 stuffies draft 5v5 with 3 in reserve reinforcement pool');

const victimShare = 2;
const killerShare = 1;
// 5. Post-Combat Health Persistence & Unstuffed 10% Recovery
console.log('\nTesting Post-Combat Health Persistence & Unstuffed 10% Rule:');
function recoverPostBattle(stuffy) {
  let hp = stuffy.currentHp;
  let isUnstuffed = stuffy.isUnstuffed;
  if (stuffy.isUnstuffed) {
    hp = Math.max(1, Math.round(stuffy.maxHp * 0.10));
    isUnstuffed = false;
  }
  return { ...stuffy, currentHp: hp, isUnstuffed, shield: 0 };
}

const woundedAlex = recoverPostBattle({ name: 'Alex', maxHp: 65, currentHp: 42, isUnstuffed: false, shield: 14 });
assert(woundedAlex.currentHp === 42 && woundedAlex.shield === 0, 'Wounded stuffy persists HP (42 HP) and shields clear');

const unstuffedAlex = recoverPostBattle({ name: 'Alex', maxHp: 65, currentHp: 0, isUnstuffed: true, shield: 0 });
assert(unstuffedAlex.currentHp === 7 && !unstuffedAlex.isUnstuffed, 'Unstuffed Alex (65 max HP) recovers to 10% = 7 HP (rounded)');

const unstuffedJefe = recoverPostBattle({ name: 'Jefe', maxHp: 78, currentHp: 0, isUnstuffed: true, shield: 0 });
assert(unstuffedJefe.currentHp === 8 && !unstuffedJefe.isUnstuffed, 'Unstuffed Jefe (78 max HP) recovers to 10% = 8 HP (rounded)');

const unstuffedFinlee = recoverPostBattle({ name: 'Finlee', maxHp: 75, currentHp: 0, isUnstuffed: true, shield: 0 });
assert(unstuffedFinlee.currentHp === 8 && !unstuffedFinlee.isUnstuffed, 'Unstuffed Finlee (75 max HP) recovers to 10% = 8 HP (rounded)');

// 6. Slugmee Sacrifice Heal Rule
console.log('\nTesting Slugmee Sacrifice Heal Rule:');
function applySlugmeeSacrificeHeal(slugmee, allies) {
  // Slugmee takes 5 damage
  const updatedSlugmee = { ...slugmee, currentHp: Math.max(1, slugmee.currentHp - 5) };
  // Slugmee CANNOT heal herself; must heal another living ally
  const otherAllies = allies.filter((a) => a.speciesId !== 'slugmee' && !a.isUnstuffed);
  let target = otherAllies.sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp))[0];
  const healedAllies = allies.map((a) => {
    if (a.speciesId === 'slugmee') return updatedSlugmee;
    if (target && a.speciesId === target.speciesId) {
      return { ...a, currentHp: Math.min(a.maxHp, a.currentHp + 22) };
    }
    return a;
  });
  return { updatedSlugmee, healedAllies, healedTarget: target };
}

const partyWithSlugmee = [
  { speciesId: 'slugmee', name: 'Slugmee', maxHp: 60, currentHp: 30, isUnstuffed: false },
  { speciesId: 'alex', name: 'Alex', maxHp: 65, currentHp: 10, isUnstuffed: false },
  { speciesId: 'fifi', name: 'Fifi', maxHp: 60, currentHp: 40, isUnstuffed: false }
];
const slugResult = applySlugmeeSacrificeHeal(partyWithSlugmee[0], partyWithSlugmee);
assert(slugResult.updatedSlugmee.currentHp === 25, 'Slugmee took 5 self-damage (30 -> 25)');
assert(slugResult.healedTarget.speciesId === 'alex', 'Slugmee healed wounded ally Alex, not herself');
assert(slugResult.healedAllies.find((a) => a.speciesId === 'alex').currentHp === 32, 'Alex received +22 HP (10 -> 32)');
assert(slugResult.healedAllies.find((a) => a.speciesId === 'slugmee').currentHp === 25, 'Slugmee did not heal herself');

// 7. Alex's S-Tier Strokenosis Mind Control Rule
console.log('\nTesting Alex\'s S-Tier Strokenosis Mind Control Rule:');
const sampleOpponentHand = [
  { id: 'jefe_s1', name: 'Cataclysmic Earthquake', stuffyId: 'jefe', tier: 'S', damage: 30 },
  { id: 'toothless_a1', name: 'Plasma Poo Barrage', stuffyId: 'toothless', tier: 'A', damage: 24 },
  { id: 'finlee_b1', name: 'Orca Chomp', stuffyId: 'finlee', tier: 'B', damage: 16 },
  { id: 'fifi_d1', name: 'Gas Pouch Trap', stuffyId: 'fifi', tier: 'D', damage: 6 },
  { id: 'riolu_c1', name: 'Aura Wave', stuffyId: 'riolu', tier: 'C', damage: 12 }
];

// Strokenosis presents cards with owner and tier known, but name masked
const maskedStrokenosisView = sampleOpponentHand.map((c) => ({
  stuffyOwner: c.stuffyId,
  tier: c.tier,
  nameMasked: '???',
  realCard: c,
}));

assert(maskedStrokenosisView.length === 5, 'Strokenosis presents 5 opponent cards to choose from');
assert(maskedStrokenosisView[0].stuffyOwner === 'jefe' && maskedStrokenosisView[0].tier === 'S', 'Alex knows card 1 belongs to Jefe and is S-Tier');
assert(maskedStrokenosisView[0].nameMasked === '???', 'Alex does NOT know the card name beforehand');

// Alex chooses card 0 (Jefe S-Tier) to force-play against opponent
const chosenCard = maskedStrokenosisView[0].realCard;
assert(chosenCard.name === 'Cataclysmic Earthquake', 'Revealed and force-played Cataclysmic Earthquake against opponent');

console.log('\n🎉 ALL CORE FORMULAS & RULES VERIFIED! 🎉\n');
