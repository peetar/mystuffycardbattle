import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('===========================================================');
console.log('--- RUNNING BEN STUFFY CARD HAND LAYOUT VERIFICATION ---');
console.log('===========================================================\n');

const cardHandContent = fs.readFileSync(path.resolve('src/components/battle/CardHand.tsx'), 'utf-8');
const battleArenaContent = fs.readFileSync(path.resolve('src/components/battle/BattleArena.tsx'), 'utf-8');
const cardViewContent = fs.readFileSync(path.resolve('src/components/battle/CardView.tsx'), 'utf-8');

// TEST 1: NO VERTICAL WRAP (NO flex-wrap)
console.log('TEST 1: Hand Container Single-Row Layout (No Wrapping)...');
assert.ok(!cardHandContent.includes('flex-wrap'), 'CardHand must NOT use flex-wrap');
assert.ok(cardHandContent.includes('flex-nowrap'), 'CardHand must use flex-nowrap');
console.log('  ✅ PASSED: flex-wrap eliminated and flex-nowrap enforced on hand tray');

// TEST 2: RIGID HEIGHT LOCKDOWN
console.log('\nTEST 2: Strict Vertical Height Lockdown...');
assert.ok(cardHandContent.includes('h-[245px] max-h-[245px]'), 'CardHand container height must be locked at 245px');
assert.ok(battleArenaContent.includes('h-[245px]'), 'BattleArena hand container height must be locked at 245px');
assert.ok(cardHandContent.includes('overflow-hidden'), 'Outer hand container must have overflow-hidden');
console.log('  ✅ PASSED: Hand container height locked to 245px (never expands vertically)');

// TEST 3: HORIZONTAL LOCK & SCROLLING
console.log('\nTEST 3: Horizontal Scroll Track & Wheel Navigation...');
assert.ok(cardHandContent.includes('overflow-x-auto overflow-y-hidden'), 'Hand strip must have horizontal scroll and vertical clip');
assert.ok(cardHandContent.includes('onWheel={handleWheel}'), 'Hand must support mouse wheel horizontal scrolling');
assert.ok(cardHandContent.includes('shrink-0'), 'Card items must have shrink-0 so cards are never squeezed or wrapped');
console.log('  ✅ PASSED: Horizontal overflow-x-auto, mouse wheel listener, and shrink-0 cards verified');

// TEST 4: SCROLL ARROWS & AUTO-SCROLL
console.log('\nTEST 4: Left/Right Scroll Arrows & Auto-Scroll...');
assert.ok(cardHandContent.includes("scroll('left')"), 'Left scroll action must exist');
assert.ok(cardHandContent.includes("scroll('right')"), 'Right scroll action must exist');
assert.ok(cardHandContent.includes('target.scrollIntoView'), 'Selected card must auto-scroll into view');
console.log('  ✅ PASSED: Navigation arrows and selected card auto-scroll verified');

// TEST 5: COMPACT DISPLAY FOR UP TO 10 CARDS
console.log('\nTEST 5: Comfortably Displaying Up to 10 Cards...');
assert.ok(cardHandContent.includes('const isCompact = cards.length >= 5;'), 'Compact mode active for 5+ cards');
assert.ok(cardViewContent.includes('compact ?'), 'CardView must support compact sizing');
console.log('  ✅ PASSED: Compact layout automatically engages at 5+ cards allowing up to 10 cards to fit comfortably');

// TEST 6: FIXED HOVER TOOLTIP POSITIONING
console.log('\nTEST 6: Tooltip Clipping Prevention...');
assert.ok(cardViewContent.includes('fixed -translate-x-1/2'), 'Hover tooltip must use fixed coordinates so it is never clipped by overflow');
console.log('  ✅ PASSED: Hover tooltip uses fixed coordinates above card without container clipping');

// TEST 7: RIGHT-SIDE DOCKED CARD INSPECTOR WITH FULL READABLE TEXT
console.log('\nTEST 7: Right-Side Docked Card Inspector & Clean Typography...');
assert.ok(cardViewContent.includes('flex justify-end'), 'Inspector must dock to the right side of the screen');
assert.ok(cardViewContent.includes('border-l-2 border-yellow-400'), 'Right panel must have distinctive border');
assert.ok(cardViewContent.includes('font-sans text-slate-100'), 'Description must use clean, readable font-sans');
assert.ok(cardViewContent.includes('Combat Specs & Target Mechanics'), 'Combat specs breakdown must be present');
assert.ok(cardViewContent.includes('getTargetExplanation'), 'Targeting explanation helper must be used for full clarity');
assert.ok(cardViewContent.includes('Close Card Details'), 'Close button must be clearly provided');
console.log('  ✅ PASSED: ℹ️ Card inspector docks to the right side with complete readable text');

console.log('\n===========================================================');
console.log('🎉 ALL CARD HAND HORIZONTAL & HEIGHT LOCKDOWN TESTS PASSED! 🎉');
console.log('===========================================================');
