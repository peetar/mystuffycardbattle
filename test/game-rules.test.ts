import { calculateFoodHeal } from '../src/data/foods';
import { ALL_STUFFIES, STUFFY_MAP } from '../src/data/stuffies';
import { ALL_CARDS, CARD_MAP } from '../src/data/cards';
import { STUFFY_LOADOUTS } from '../src/data/loadouts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('--- RUNNING BEN STUFFY CARD BATTLE TESTS ---\n');

// 1. Test Food Healing Math
console.log('Testing Food Healing Formula:');
// Rule 1: >90% HP = 100% full heal regardless of food
const testAbove90 = calculateFoodHeal(95, 100, 'hated');
assert(testAbove90.newHp === 100, '>90% HP heals 100% to full HP even with hated food');

// Rule 2: Favorite food = 75% missing HP (e.g. 20/100 -> missing 80 -> 75% of 80 = 60 heal -> 80 HP)
const testFav = calculateFoodHeal(20, 100, 'favorite');
assert(testFav.healedAmount === 60 && testFav.newHp === 80, 'Favorite food heals 75% of missing HP');

// Rule 3: Mid food = 37.5% missing HP (e.g. 20/100 -> missing 80 -> 37.5% of 80 = 30 heal -> 50 HP)
const testMid = calculateFoodHeal(20, 100, 'mid');
assert(testMid.healedAmount === 30 && testMid.newHp === 50, 'Mid food heals 37.5% of missing HP');

// Rule 4: Hated food = 25% missing HP (e.g. 20/100 -> missing 80 -> 25% of 80 = 20 heal -> 40 HP)
const testHated = calculateFoodHeal(20, 100, 'hated');
assert(testHated.healedAmount === 20 && testHated.newHp === 40, 'Hated food heals 25% of missing HP');

// 2. Test Stuffy Roster Completeness
console.log('\nTesting 16 Stuffy Roster:');
assert(ALL_STUFFIES.length === 16, 'Exactly 16 stuffed animals registered in game');
const requiredSpecies = [
  'alex', 'jefe', 'finlee', 'fifi', 'thumper', 'toothless', 'riolu', 'eevee',
  'slugmee', 'beaker', 'henry', 'dear', 'cole', 'joann', 'cidney', 'chanteira'
];
requiredSpecies.forEach((id) => {
  const stuffy = STUFFY_MAP.get(id);
  assert(Boolean(stuffy), `Stuffy ${id} is present with stats and foods`);
  assert(stuffy!.favoriteFoods.length > 0, `${stuffy!.name} has favorite foods`);
  assert(stuffy!.midFoods.length > 0, `${stuffy!.name} has mid foods`);
  assert(stuffy!.hatedFoods.length > 0, `${stuffy!.name} has hated foods`);
});

// 3. Test Card Tiers & 10-Card Loadouts Balance
console.log('\nTesting Card Tiers & 10-Card Loadout Balance:');
requiredSpecies.forEach((id) => {
  const loadouts = STUFFY_LOADOUTS[id];
  assert(loadouts && loadouts.length === 3, `${id} has exactly 3 loadout options`);
  loadouts.forEach((l, idx) => {
    assert(l.cardIds.length === 10, `${id} loadout #${idx + 1} (${l.name}) has exactly 10 cards`);
    // Verify all cards exist in CARD_MAP
    l.cardIds.forEach((cId) => {
      assert(CARD_MAP.has(cId), `Card ${cId} exists in master registry`);
    });
  });
});

// 4. Test S-Tier Signature Cards
console.log('\nTesting Signature S-Tier Cards:');
const strokenosis = CARD_MAP.get('alex_s1');
assert(strokenosis?.specialActionId === 'strokenosis', 'Alex has S-tier Strokenosis mind-control card');

const earthquake = CARD_MAP.get('jefe_s1');
assert(earthquake?.specialActionId === 'earthquake', 'Jefe has S-tier Earthquake crack trap card');

const swallowWhole = CARD_MAP.get('finlee_s1');
assert(swallowWhole?.specialActionId === 'swallow_whole', 'Finlee has S-tier Swallow Whole perma-devour card');

const slugSong = CARD_MAP.get('slugmee_s1');
assert(slugSong?.specialActionId === 'slug_hug', 'Slugmee has deadly hug song card');

const shellUp = CARD_MAP.get('henry_a1');
assert(shellUp?.specialActionId === 'shell_up', 'Henry has Shell Up taunt & 75% defense card');

console.log('\n🎉 ALL GAME RULES & FORMULAS VERIFIED PERFECTLY! 🎉\n');
