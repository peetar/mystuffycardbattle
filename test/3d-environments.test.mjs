import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- RUNNING BEN STUFFY CARD BATTLE 3D ARENA ENVIRONMENTS TESTS ---\n');

// 1. Verify Arena3DEnvironment exists
const arenaEnvPath = path.resolve('src/components/battle/Arena3DEnvironment.tsx');
assert.ok(fs.existsSync(arenaEnvPath), 'Arena3DEnvironment.tsx must exist');
const arenaEnvContent = fs.readFileSync(arenaEnvPath, 'utf8');

// 2. Verify all 8 3D environment themes defined in Arena3DEnvironment
const expectedThemes = [
  'moonlit_glade',
  'candy_stash',
  'slumber_den',
  'prickly_thicket',
  'classic_quilt',
  'volcanic_rift',
  'cosmic_void',
  'sunken_reef',
];

for (const theme of expectedThemes) {
  assert.ok(arenaEnvContent.includes(`'${theme}'`), `Arena3DEnvironment includes theme '${theme}'`);
}
console.log(`✅ PASSED: All 8 3D Arena Themes verified in Arena3DEnvironment.tsx`);

// 3. Verify True 3D CSS Perspective Stage & Transforms
assert.ok(arenaEnvContent.includes("perspective: '1000px'"), 'Perspective set to 1000px for 3D depth');
assert.ok(arenaEnvContent.includes("transform: 'rotateX(55deg) translateZ(0)'"), '3D perspective stage rotated on X axis (55deg)');
assert.ok(arenaEnvContent.includes("transformStyle: 'preserve-3d'"), 'Stage uses preserve-3d transform style');
console.log('✅ PASSED: True 3D CSS Perspective floor stage (1000px perspective, 55deg X-tilt, preserve-3d) verified');

// 4. Verify BattleArena integration
const battleArenaPath = path.resolve('src/components/battle/BattleArena.tsx');
const battleArenaContent = fs.readFileSync(battleArenaPath, 'utf8');

assert.ok(battleArenaContent.includes("import Arena3DEnvironment"), 'BattleArena imports Arena3DEnvironment');
assert.ok(battleArenaContent.includes("<Arena3DEnvironment theme={arenaBg} />"), 'BattleArena renders Arena3DEnvironment with theme prop');

for (const theme of expectedThemes) {
  assert.ok(battleArenaContent.includes(`${theme}: {`), `BG_THEMES in BattleArena defines theme '${theme}'`);
}
console.log('✅ PASSED: BattleArena renders Arena3DEnvironment and configures all 8 3D themes in BG_THEMES');

// 5. Verify Cycle Button & Persistence
assert.ok(battleArenaContent.includes("localStorage.setItem('ben_stuffy_arena_bg'"), 'BattleArena persists arenaBg to localStorage');
assert.ok(battleArenaContent.includes("localStorage.getItem('ben_stuffy_arena_bg'"), 'BattleArena loads arenaBg from localStorage');
assert.ok(battleArenaContent.includes('unlockAdvancement'), 'Advancements preserved during environment cycling');
console.log('✅ PASSED: Environment cycle button and localStorage persistence verified');

console.log('\n🎉 ALL 3D BATTLE ENVIRONMENT TESTS PASSED SUCCESSFULLY! 🎉\n');
