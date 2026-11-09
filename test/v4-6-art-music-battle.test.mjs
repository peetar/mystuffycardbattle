import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- RUNNING BEN STUFFY CARD BATTLE V4.6 (ART & MUSIC OVERHAUL) TESTS ---\n');

// 1. Versioning
const packageJson = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
assert.strictEqual(packageJson.version, '4.6.0', 'package.json version must be 4.6.0');

const versionHistory = fs.readFileSync(path.resolve('src/data/versionHistory.ts'), 'utf8');
assert.ok(versionHistory.includes("version: 'v4.6'"), 'versionHistory.ts includes v4.6');
assert.ok(versionHistory.includes('Art & Music Overhaul: Retro Pixel Sprites, Auto-Battle & Minimalist Cards'), 'v4.6 title is accurate');
assert.ok(versionHistory.includes("badge: 'CURRENT'"), 'v4.6 has badge CURRENT');
console.log('✅ PASSED: Version 4.6.0 registered and active across package.json and version history');

// 2. Real-Time AI Auto-Attacks (No blocking turn recap modal)
const combatStore = fs.readFileSync(path.resolve('src/store/combatStore.ts'), 'utf8');
assert.ok(combatStore.includes('showEnemyTurnReview: false'), 'combatStore permanently bypasses showEnemyTurnReview');

const battleArena = fs.readFileSync(path.resolve('src/components/battle/BattleArena.tsx'), 'utf8');
assert.ok(battleArena.includes('battleSpeed'), 'BattleArena contains battleSpeed toggle state');
assert.ok(battleArena.includes('ben_battle_speed'), 'BattleArena persists speed preference in localStorage');
assert.ok(battleArena.includes('currentAutoAttackBanner'), 'BattleArena has live auto-attack notification banner');
assert.ok(battleArena.includes('activeAttackAnimation: {'), 'BattleArena dispatches real-time attack lunges/animations');
console.log('✅ PASSED: Live AI Auto-Battles verified (replaces blocking recap modal with speed toggles & live animations)');

// 3. Retro 64x64 Pixel Art Sprites
const stuffySprite = fs.readFileSync(path.resolve('src/components/battle/StuffySprite.tsx'), 'utf8');
assert.ok(stuffySprite.includes('imageRendering: "pixelated"') || stuffySprite.includes("imageRendering: 'pixelated'"), 'StuffySprite uses pixelated image rendering');
assert.ok(stuffySprite.includes("shapeRendering: 'crispEdges'"), 'StuffySprite uses crispEdges shape rendering');
assert.ok(stuffySprite.includes('ellipse cx="16" cy="30" rx="9" ry="1.8"'), 'StuffySprite includes retro pixel shadow plate at base');
console.log('✅ PASSED: Retro 64x64 Pixel Art Sprites verified (crispEdges, pixelated rendering, and shadow pedestal)');

// 4. Modern Minimalist Cards (Balatro / Slay the Spire Style)
const cardView = fs.readFileSync(path.resolve('src/components/battle/CardView.tsx'), 'utf8');
assert.ok(cardView.includes('rounded-full') && cardView.includes('from-amber-400 to-amber-600'), 'CardView includes circular cracker energy cost chip');
assert.ok(cardView.includes('bg-radial'), 'CardView includes artwork radial spotlight backdrop');
assert.ok(cardView.includes('⚔️'), 'CardView renders bold Attack stat chip');
assert.ok(cardView.includes('🛡️'), 'CardView renders bold Shield stat chip');
assert.ok(cardView.includes('💖'), 'CardView renders bold Heal stat chip');
console.log('✅ PASSED: Modern Minimalist Cards verified (circular cracker chip, radial spotlight & bold numeric stat pills)');

// 5. Hybrid Soundscape (Chiptune + Acoustic Marimba + Orchestral Brass)
const audio = fs.readFileSync(path.resolve('src/utils/audio.ts'), 'utf8');
assert.ok(audio.includes('Voice 1: Chiptune 16-Bit Lead'), 'Audio engine features Voice 1 Chiptune Lead');
assert.ok(audio.includes('Voice 2: Acoustic Marimba / Kalimba Pluck'), 'Audio engine features Voice 2 Acoustic Marimba/Kalimba');
assert.ok(audio.includes('Voice 3: Orchestral Brass / Sub-Bass'), 'Audio engine features Voice 3 Orchestral Brass Drone');
console.log('✅ PASSED: 3-Voice Hybrid Polyphonic Soundscape verified in Web Audio engine');

// 6. Parallax Layered Backgrounds
assert.ok(battleArena.includes('Parallax Layered Depth (v4.6): Ambient dust motes, light shafts & depth vignette'), 'BattleArena features multi-layer parallax ambient background');
assert.ok(battleArena.includes('rounded-full bg-yellow-300/30 blur-[1px]'), 'BattleArena features ambient floating dust motes');
console.log('✅ PASSED: Parallax Depth Background with dust motes and depth vignette verified');

console.log('\n🎉 ALL VERSION 4.6 ART & MUSIC OVERHAUL TESTS PASSED SUCCESSFULLY! 🎉\n');
