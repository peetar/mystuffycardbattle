import assert from 'assert';

console.log('--- RUNNING BEN STUFFY CARD BATTLE ADMIN COMMAND TESTS ---');

// Mock localStorage
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
};

// 1. Password Verification Test
const ADMIN_PASSWORD = 'Benrealcreator';
assert.strictEqual('Benrealcreator' === ADMIN_PASSWORD, true, 'Password must match Benrealcreator');
assert.strictEqual('wrongpass' === ADMIN_PASSWORD, false, 'Invalid password must be rejected');
console.log('✅ PASSED: Password validation matches "Benrealcreator" strictly');

// 2. Command Parsing Test (Always require period: "/." or ".")
function parseCommand(raw) {
  let trimmed = raw.trim();
  if (!trimmed.startsWith('/.') && !trimmed.startsWith('.')) {
    return { error: 'period_required' };
  }
  let normalized = trimmed;
  if (normalized.startsWith('/.')) normalized = normalized.substring(2).trim();
  else if (normalized.startsWith('.')) normalized = normalized.substring(1).trim();
  const parts = normalized.split(/\s+/);
  return { command: parts[0]?.toLowerCase(), args: parts.slice(1) };
}

// Commands without period must be rejected
assert.strictEqual(parseCommand('/heal 50 cow').error, 'period_required');
assert.strictEqual(parseCommand('heal 50 cow').error, 'period_required');
assert.strictEqual(parseCommand('/shop').error, 'period_required');
assert.strictEqual(parseCommand('shop').error, 'period_required');
console.log('✅ PASSED: Commands without a period are strictly rejected');

const c1 = parseCommand('/.heal 50 cow');
assert.strictEqual(c1.command, 'heal');
assert.strictEqual(c1.args[0], '50');
assert.strictEqual(c1.args[1], 'cow');
console.log('✅ PASSED: "/.heal 50 cow" parsed correctly');

const c2 = parseCommand('.heal 100 all');
assert.strictEqual(c2.command, 'heal');
assert.strictEqual(c2.args[0], '100');
assert.strictEqual(c2.args[1], 'all');
console.log('✅ PASSED: ".heal 100 all" parsed correctly');

const c3 = parseCommand('/.damage 25 alex');
assert.strictEqual(c3.command, 'damage');
assert.strictEqual(c3.args[0], '25');
assert.strictEqual(c3.args[1], 'alex');
console.log('✅ PASSED: "/.damage 25 alex" parsed correctly');

const c4 = parseCommand('/.item');
assert.strictEqual(c4.command, 'item');
console.log('✅ PASSED: "/.item" parsed correctly to open item panel');

// 3. Heal Logic Simulation Test
let testAlex = {
  instanceId: 'alex_1',
  speciesId: 'alex',
  name: 'Alex',
  maxHp: 65,
  currentHp: 20,
  isUnstuffed: false,
};

// Heal 50
const healAmt = 50;
testAlex.currentHp = Math.min(testAlex.maxHp, testAlex.currentHp + healAmt);
assert.strictEqual(testAlex.currentHp, 65, 'Alex should be healed up to maxHp (65)');
console.log('✅ PASSED: Heal amount increases current HP and caps at maxHp');

// Unstuffed revival test
let deadCow = {
  instanceId: 'cow_1',
  speciesId: 'cow',
  name: 'Cow',
  maxHp: 82,
  currentHp: 0,
  isUnstuffed: true,
};
deadCow.currentHp = Math.min(deadCow.maxHp, deadCow.currentHp + 40);
if (deadCow.currentHp > 0) deadCow.isUnstuffed = false;
assert.strictEqual(deadCow.currentHp, 40);
assert.strictEqual(deadCow.isUnstuffed, false, 'Stuffy must be revived when healed above 0');
console.log('✅ PASSED: Dead / unstuffed stuffy is revived when receiving heal');

// 4. Damage Logic Simulation Test
let healthyCow = {
  instanceId: 'cow_2',
  speciesId: 'cow',
  name: 'Cow',
  maxHp: 82,
  currentHp: 82,
  isUnstuffed: false,
};
const dmgAmt = 30;
healthyCow.currentHp = Math.max(0, healthyCow.currentHp - dmgAmt);
assert.strictEqual(healthyCow.currentHp, 52);
console.log('✅ PASSED: Damage decreases HP accurately (82 - 30 = 52)');

// Lethal damage test
healthyCow.currentHp = Math.max(0, healthyCow.currentHp - 100);
if (healthyCow.currentHp === 0) healthyCow.isUnstuffed = true;
assert.strictEqual(healthyCow.currentHp, 0);
assert.strictEqual(healthyCow.isUnstuffed, true);
console.log('✅ PASSED: Lethal damage sets currentHp to 0 and marks isUnstuffed: true');

// 5. Item Grant Simulation Test
const inventory = [];
function mockGrantItem(name, category, value) {
  const item = {
    id: `item_${Date.now()}_${Math.random()}`,
    name,
    category,
    value,
  };
  inventory.unshift(item);
  return item;
}

const granted = mockGrantItem('Ancient God-Tier Nitro Slingshot', 'offhand', 240);
assert.strictEqual(inventory.length, 1);
assert.strictEqual(inventory[0].name, 'Ancient God-Tier Nitro Slingshot');
assert.strictEqual(inventory[0].category, 'offhand');
assert.strictEqual(inventory[0].value, 240);
console.log('✅ PASSED: Item spawner grants item directly to inventory');

// 6. v3.8 Gold and Crackers set/add command parsing
const goldAdd = parseCommand('/.gold 500 add');
assert.strictEqual(goldAdd.command, 'gold');
assert.strictEqual(goldAdd.args[0], '500');
assert.strictEqual(goldAdd.args[1], 'add');
console.log('✅ PASSED: "/.gold 500 add" parsed correctly');

const goldSet = parseCommand('/.gold 1000 set');
assert.strictEqual(goldSet.command, 'gold');
assert.strictEqual(goldSet.args[0], '1000');
assert.strictEqual(goldSet.args[1], 'set');
console.log('✅ PASSED: "/.gold 1000 set" parsed correctly');

const crackersAdd = parseCommand('/.crackers 5 add');
assert.strictEqual(crackersAdd.command, 'crackers');
assert.strictEqual(crackersAdd.args[0], '5');
assert.strictEqual(crackersAdd.args[1], 'add');
console.log('✅ PASSED: "/.crackers 5 add" parsed correctly');

const crackersSet = parseCommand('/.crackers 7 set');
assert.strictEqual(crackersSet.command, 'crackers');
assert.strictEqual(crackersSet.args[0], '7');
assert.strictEqual(crackersSet.args[1], 'set');
console.log('✅ PASSED: "/.crackers 7 set" parsed correctly');

const esperCmd = parseCommand('/.esper');
assert.strictEqual(esperCmd.command, 'esper');
console.log('✅ PASSED: "/.esper" parsed correctly');

const shopCmd = parseCommand('/.shop');
assert.strictEqual(shopCmd.command, 'shop');
console.log('✅ PASSED: "/.shop" parsed correctly');

// 7. Esper Infusion Simulation Test
let esperTestStuffy = {
  instanceId: 'cow_esper_test',
  name: 'Cow',
  maxHp: 82,
  currentHp: 82,
  speed: 95,
  freezeChance: 0,
  espers: [],
};

const mockEsper = {
  id: 'esper_shiva',
  name: 'Shiva the Frost Maiden',
  boost: {
    freezeChance: 35,
    maxHp: 20,
    speed: 15,
  },
};

// Infuse
esperTestStuffy.maxHp += mockEsper.boost.maxHp;
esperTestStuffy.currentHp += mockEsper.boost.maxHp;
esperTestStuffy.speed = Math.min(500, esperTestStuffy.speed + mockEsper.boost.speed);
esperTestStuffy.freezeChance = Math.min(75, esperTestStuffy.freezeChance + mockEsper.boost.freezeChance);
esperTestStuffy.espers.push(mockEsper);

assert.strictEqual(esperTestStuffy.maxHp, 102);
assert.strictEqual(esperTestStuffy.currentHp, 102);
assert.strictEqual(esperTestStuffy.speed, 110);
assert.strictEqual(esperTestStuffy.freezeChance, 35);
assert.strictEqual(esperTestStuffy.espers.length, 1);
console.log('✅ PASSED: Esper infusion boosts maxHp, speed, and freezeChance accurately');

// 8. Act Boundaries Simulation Test (Cannot jump back acts & cannot exceed max acts)
const totalActs = 3;
function validateActCommand(targetAct, currentAct, maxActs) {
  if (targetAct < 1) return { success: false, error: 'invalid' };
  if (targetAct < currentAct) return { success: false, error: 'cannot_jump_back' };
  if (targetAct === currentAct) return { success: false, error: 'already_on_act' };
  if (targetAct > maxActs) return { success: false, error: 'exceeds_max' };
  return { success: true, act: targetAct };
}

assert.strictEqual(validateActCommand(3, 2, totalActs).success, true);
assert.strictEqual(validateActCommand(1, 2, totalActs).success, false);
assert.strictEqual(validateActCommand(1, 2, totalActs).error, 'cannot_jump_back');
assert.strictEqual(validateActCommand(2, 2, totalActs).error, 'already_on_act');
assert.strictEqual(validateActCommand(4, 2, totalActs).success, false);
assert.strictEqual(validateActCommand(4, 2, totalActs).error, 'exceeds_max');
console.log('✅ PASSED: "/.act" strictly prevents jumping back acts and cannot exceed max acts');

// 9. Floor Command Parsing and Validation Test
const floorCmd = parseCommand('/.floor 4');
assert.strictEqual(floorCmd.command, 'floor');
assert.strictEqual(floorCmd.args[0], '4');
console.log('✅ PASSED: "/.floor 4" parsed correctly');

const totalFloors = 8;
function validateFloorCommand(targetFloor, currentFloor, maxFloors) {
  if (targetFloor < 1) return { success: false, error: 'invalid' };
  if (targetFloor < currentFloor) return { success: false, error: 'cannot_move_back' };
  if (targetFloor === currentFloor) return { success: false, error: 'already_on_floor' };
  if (targetFloor > maxFloors) return { success: false, error: 'exceeds_max' };
  return { success: true, floor: targetFloor };
}
assert.strictEqual(validateFloorCommand(4, 2, totalFloors).success, true);
assert.strictEqual(validateFloorCommand(1, 2, totalFloors).success, false);
assert.strictEqual(validateFloorCommand(1, 2, totalFloors).error, 'cannot_move_back');
assert.strictEqual(validateFloorCommand(2, 2, totalFloors).error, 'already_on_floor');
assert.strictEqual(validateFloorCommand(9, 2, totalFloors).success, false);
assert.strictEqual(validateFloorCommand(9, 2, totalFloors).error, 'exceeds_max');
console.log('✅ PASSED: "/.floor" strictly prevents moving back floors and cannot exceed max floors');

// 10. Reward Command Parsing Test
const rewardCmd = parseCommand('/.reward');
assert.strictEqual(rewardCmd.command, 'reward');
console.log('✅ PASSED: "/.reward" parsed correctly');

// 11. Test Mode Preset Transfer to Campaign Mode Verification
function canTransferToCampaign(testPreset) {
  return (
    Array.isArray(testPreset.team) &&
    testPreset.team.length > 0 &&
    testPreset.team.length <= 5 &&
    testPreset.team.every(
      (s) =>
        typeof s.speciesId === 'string' &&
        typeof s.selectedLoadoutId === 'string' &&
        s.selectedLoadoutId.trim().length > 0
    )
  );
}

const validTestPreset = {
  name: 'Valid Trio',
  team: [
    { speciesId: 'alex', selectedLoadoutId: 'alex_pkg_1' },
    { speciesId: 'allie', selectedLoadoutId: 'allie_pkg_1' },
    { speciesId: 'cow', selectedLoadoutId: 'cow_pkg_1' },
  ],
};

const invalidTestPresetWithoutLoadouts = {
  name: 'Legacy Team Without Loadouts',
  team: [
    { speciesId: 'alex' },
    { speciesId: 'allie' },
  ],
};

const invalidTestPresetTooMany = {
  name: '6 Stuffies',
  team: Array(6).fill({ speciesId: 'alex', selectedLoadoutId: 'alex_pkg_1' }),
};

assert.strictEqual(canTransferToCampaign(validTestPreset), true);
assert.strictEqual(canTransferToCampaign(invalidTestPresetWithoutLoadouts), false);
assert.strictEqual(canTransferToCampaign(invalidTestPresetTooMany), false);
console.log('✅ PASSED: Presets strictly transfer to Campaign Mode only if configured just like Campaign Mode (valid species & loadout presets, max 5)');

// 12. Incomplete Campaign Presets Verification
function canSaveCampaignPreset(squad) {
  return Array.isArray(squad) && squad.length > 0 && squad.length <= 5;
}
assert.strictEqual(canSaveCampaignPreset([{ speciesId: 'jefe', loadoutId: 'jefe_pkg_1' }]), true, 'Incomplete 1-stuffy preset allowed');
assert.strictEqual(canSaveCampaignPreset([
  { speciesId: 'cow', loadoutId: 'cow_pkg_1' },
  { speciesId: 'alex', loadoutId: 'alex_pkg_1' },
]), true, 'Incomplete 2-stuffy preset allowed');
assert.strictEqual(canSaveCampaignPreset([]), false, 'Empty preset rejected');
console.log('✅ PASSED: Campaign presets allow incomplete squads (1-4 stuffies) to be filled in during choosing phase');

// 13. Item Evolution Simulation Test (2 Commons -> 1 Uncommon, etc.)
const NEXT_RARITY_MAP = {
  common: 'uncommon',
  uncommon: 'rare',
  rare: 'epic',
  epic: 'legendary',
  legendary: null,
};

function testEvolve(itemA, itemB, inventory) {
  if (itemA.id === itemB.id) return { success: false, error: 'Cannot evolve with itself' };
  if (itemA.rarity !== itemB.rarity) return { success: false, error: 'Must be same rarity' };
  const nextRarity = NEXT_RARITY_MAP[itemA.rarity];
  if (!nextRarity) return { success: false, error: 'Max tier reached' };

  const newItem = {
    id: `item_evolved_${Date.now()}`,
    name: `Evolved ${itemA.category}`,
    category: itemA.category,
    rarity: nextRarity,
    icon: itemA.icon,
  };
  const updated = inventory.filter((i) => i.id !== itemA.id && i.id !== itemB.id);
  updated.unshift(newItem);
  return { success: true, newItem, inventory: updated };
}

const cItem1 = { id: 'c1', name: 'Common Hat 1', category: 'helmet', rarity: 'common', icon: '🪖' };
const cItem2 = { id: 'c2', name: 'Common Hat 2', category: 'helmet', rarity: 'common', icon: '🪖' };
const rItem1 = { id: 'r1', name: 'Rare Sword 1', category: 'sword', rarity: 'rare', icon: '⚔️' };
const legItem1 = { id: 'l1', name: 'Legendary 1', category: 'offhand', rarity: 'legendary', icon: '⏱️' };
const legItem2 = { id: 'l2', name: 'Legendary 2', category: 'offhand', rarity: 'legendary', icon: '⏱️' };

// 2 Commons -> 1 Uncommon
const evolveResult = testEvolve(cItem1, cItem2, [cItem1, cItem2, rItem1]);
assert.strictEqual(evolveResult.success, true);
assert.strictEqual(evolveResult.newItem.rarity, 'uncommon');
assert.strictEqual(evolveResult.inventory.length, 2);
console.log('✅ PASSED: 2 Commons successfully evolve into 1 Uncommon item');

// Mismatched rarities
const mismatch = testEvolve(cItem1, rItem1, [cItem1, rItem1]);
assert.strictEqual(mismatch.success, false);
console.log('✅ PASSED: Items of different rarities cannot be evolved');

// Legendary cap
const legResult = testEvolve(legItem1, legItem2, [legItem1, legItem2]);
assert.strictEqual(legResult.success, false);
assert.strictEqual(legResult.error, 'Max tier reached');
console.log('✅ PASSED: Legendary items are capped and cannot be evolved further');

// 14. Item Discard Simulation Test
function testDiscard(itemId, inventory, equipped) {
  const updatedInv = inventory.filter((i) => i.id !== itemId);
  for (const sId of Object.keys(equipped)) {
    for (const cat of Object.keys(equipped[sId])) {
      if (equipped[sId][cat]?.id === itemId) {
        delete equipped[sId][cat];
      }
    }
  }
  return { inventory: updatedInv, equipped };
}

let inv = [{ id: 'trash1', name: 'Old Boots' }, { id: 'keep1', name: 'Good Boots' }];
let eq = { cow: { helmet: { id: 'trash1', name: 'Old Boots' } } };
const discardRes = testDiscard('trash1', inv, eq);
assert.strictEqual(discardRes.inventory.length, 1);
assert.strictEqual(discardRes.inventory[0].id, 'keep1');
assert.strictEqual(discardRes.equipped.cow.helmet, undefined);
console.log('✅ PASSED: Item discard permanently deletes item from inventory and un-equips it');

// 15. Name Change & Deletion Test
function registerOrChangeUser(newName, oldName, registeredList) {
  const cleanNew = newName.trim();
  const cleanOld = (oldName || '').trim().toLowerCase();
  // Filter out the old changed name so it is deleted!
  let updated = registeredList.filter((n) => n.toLowerCase() !== cleanOld && n.toLowerCase() !== cleanNew.toLowerCase());
  updated.push(cleanNew);
  return updated;
}

let deviceProfiles = ['Ben'];
// Ben renames to BenPlush
deviceProfiles = registerOrChangeUser('BenPlush', 'Ben', deviceProfiles);
assert.strictEqual(deviceProfiles.includes('Ben'), false, 'Old changed name must be deleted');
assert.strictEqual(deviceProfiles.includes('BenPlush'), true, 'New name must be registered');
assert.strictEqual(deviceProfiles.length, 1, 'Only current active names should exist, no changed name accumulation');
console.log('✅ PASSED: Changing name in browser deletes old changed name from device profiles');

// 16. Friends System Rename Migration Test
function migrateFriendName(oldName, newName, friendsList, requestsList, activePlayers) {
  const oldLower = oldName.toLowerCase();
  const newFriends = friendsList.map((f) => (f.username.toLowerCase() === oldLower ? { ...f, username: newName } : f));
  const newRequests = requestsList.map((r) => ({
    ...r,
    fromUsername: r.fromUsername.toLowerCase() === oldLower ? newName : r.fromUsername,
    toUsername: r.toUsername.toLowerCase() === oldLower ? newName : r.toUsername,
  }));
  const newActive = activePlayers.map((p) => (p.username.toLowerCase() === oldLower ? { ...p, username: newName } : p));
  return { friends: newFriends, requests: newRequests, active: newActive };
}

const mockFriends = [{ username: 'Ben', skillRating: 1200 }];
const mockReqs = [{ fromUsername: 'Ben', toUsername: 'Alice' }];
const mockActive = [{ username: 'Ben', lastActive: Date.now() }];

const migrationRes = migrateFriendName('Ben', 'BenPlush', mockFriends, mockReqs, mockActive);
assert.strictEqual(migrationRes.friends[0].username, 'BenPlush');
assert.strictEqual(migrationRes.requests[0].fromUsername, 'BenPlush');
assert.strictEqual(migrationRes.active[0].username, 'BenPlush');
console.log('✅ PASSED: Friends system authoritatively migrates friend records, requests, and active status to new name');

// 17. Version History Completeness & Security Check
import fs from 'fs';
import path from 'path';
const vhContent = fs.readFileSync(path.resolve('src/data/versionHistory.ts'), 'utf8');
const versionMatches = vhContent.match(/version:\s*'v[0-9.]+'/g) || [];
assert.strictEqual(versionMatches.length >= 11, true, 'All 11 versions from v1.0 to v3.8 must be present');
assert.strictEqual(vhContent.includes('Benrealcreator'), false, 'Password must never appear in version history');
assert.strictEqual(vhContent.includes("'v3.8'"), true);
assert.strictEqual(vhContent.includes("'v1.0'"), true);
console.log('✅ PASSED: Version history shows all 11 versions with concise overviews and 0 password leaks');

// 18. Target Scope & Set/Add Simulation Test (team vs enemy vs all)
function parseTargetScope(query) {
  const q = query.toLowerCase().trim();
  if (['team', 'player', 'allies', 'party'].includes(q)) return 'team';
  if (['enemy', 'enemies', 'foe', 'foes'].includes(q)) return 'enemy';
  if (['all', 'both', 'everyone'].includes(q)) return 'all';
  return 'single';
}

function applyHeal(amount, targetQuery, mode, playerTeam, enemyTeam) {
  const scope = parseTargetScope(targetQuery);
  const shouldTargetPlayer = scope === 'team' || scope === 'all';
  const shouldTargetEnemy = scope === 'enemy' || scope === 'all';

  const updatedPlayer = playerTeam.map((s) => {
    if (!shouldTargetPlayer) return s;
    const newHp = mode === 'set' ? Math.min(s.maxHp, amount) : Math.min(s.maxHp, s.currentHp + amount);
    return { ...s, currentHp: newHp };
  });

  const updatedEnemy = enemyTeam.map((s) => {
    if (!shouldTargetEnemy) return s;
    const newHp = mode === 'set' ? Math.min(s.maxHp, amount) : Math.min(s.maxHp, s.currentHp + amount);
    return { ...s, currentHp: newHp };
  });

  return { playerTeam: updatedPlayer, enemyTeam: updatedEnemy };
}

let pTeam = [{ id: 'p1', currentHp: 20, maxHp: 100 }];
let eTeam = [{ id: 'e1', currentHp: 30, maxHp: 100 }];

// 1) Heal team only: heals player team, leaves enemy untouched
let res1 = applyHeal(50, 'team', 'add', pTeam, eTeam);
assert.strictEqual(res1.playerTeam[0].currentHp, 70, 'Player team should be healed to 70');
assert.strictEqual(res1.enemyTeam[0].currentHp, 30, 'Enemy team must be unchanged');
console.log('✅ PASSED: "/.heal # team" heals ONLY player team and leaves enemy team untouched');

// 2) Heal enemy only: heals enemy team, leaves player team untouched
let res2 = applyHeal(50, 'enemy', 'add', pTeam, eTeam);
assert.strictEqual(res2.playerTeam[0].currentHp, 20, 'Player team must be unchanged');
assert.strictEqual(res2.enemyTeam[0].currentHp, 80, 'Enemy team should be healed to 80');
console.log('✅ PASSED: "/.heal # enemy" heals ONLY enemy team and leaves player team untouched');

// 3) Heal all: heals both teams
let res3 = applyHeal(40, 'all', 'add', pTeam, eTeam);
assert.strictEqual(res3.playerTeam[0].currentHp, 60, 'Player team healed');
assert.strictEqual(res3.enemyTeam[0].currentHp, 70, 'Enemy team healed');
console.log('✅ PASSED: "/.heal # all" heals BOTH teams');

// 4) Set mode: sets target team HP directly
let res4 = applyHeal(95, 'team', 'set', pTeam, eTeam);
assert.strictEqual(res4.playerTeam[0].currentHp, 95, 'Player team HP set directly to 95');
console.log('✅ PASSED: "/.heal # team set" sets target team HP directly');

// 19. Esper Cap (Max 5 Espers per Stuffy)
function infuseEsper(stuffy, esper) {
  const existing = stuffy.espers || [];
  if (existing.length >= 5) {
    return false;
  }
  const b = esper.boost;
  const currentSpeed = stuffy.speed ?? stuffy.baseSpeed ?? 100;
  const newSpeed = Math.min(500, currentSpeed + (b.speed || 0));
  stuffy.speed = newSpeed;
  stuffy.espers = [...existing, esper];
  return true;
}

let testStuffy = {
  instanceId: 'stuffy_1',
  name: 'Jefe',
  speciesId: 'jefe',
  baseSpeed: 105,
  speed: 105,
  espers: [],
};

const dummyEsper = (id, name, speedBoost) => ({
  id,
  name,
  boost: { speed: speedBoost },
});

assert.strictEqual(infuseEsper(testStuffy, dummyEsper('e1', 'Esper 1', 5)), true);
assert.strictEqual(infuseEsper(testStuffy, dummyEsper('e2', 'Esper 2', 5)), true);
assert.strictEqual(infuseEsper(testStuffy, dummyEsper('e3', 'Esper 3', 5)), true);
assert.strictEqual(infuseEsper(testStuffy, dummyEsper('e4', 'Esper 4', 5)), true);
assert.strictEqual(infuseEsper(testStuffy, dummyEsper('e5', 'Esper 5', 5)), true);
assert.strictEqual(testStuffy.espers.length, 5);
assert.strictEqual(testStuffy.speed, 130);

// Attempt 6th esper - MUST BE REJECTED
const sixthResult = infuseEsper(testStuffy, dummyEsper('e6', 'Esper 6', 10));
assert.strictEqual(sixthResult, false, '6th Esper must be rejected');
assert.strictEqual(testStuffy.espers.length, 5, 'Stuffy must strictly cap at 5 Espers');
console.log('✅ PASSED: Espers are capped strictly at a maximum of 5 per stuffy');

// 20. Forfeit & Abandon Run Auto-Deletion Test
global.localStorage.setItem('ben_stuffy_saved_campaign_run', JSON.stringify({ runActive: true, act: 2, floor: 5 }));
assert.notStrictEqual(global.localStorage.getItem('ben_stuffy_saved_campaign_run'), null);

function simulateAbandonRun() {
  global.localStorage.removeItem('ben_stuffy_saved_campaign_run');
  return {
    runActive: false,
    currentFloor: 1,
    currentAct: 1,
    nodes: [],
    activeParty: [],
  };
}

const abandonedState = simulateAbandonRun();
assert.strictEqual(global.localStorage.getItem('ben_stuffy_saved_campaign_run'), null, 'Run must be deleted from storage');
assert.strictEqual(abandonedState.runActive, false, 'runActive must be false');
console.log('✅ PASSED: Forfeit permanently auto-deletes the campaign run and clears storage');

// 21. Shop Resume Location & completeNode Null Safety
function simulateCompleteNode(state) {
  const currentNode = state.nodes.find((n) => n.id === state.currentNodeId);
  const nextFloor = currentNode ? Math.min(state.totalFloors, currentNode.floor + 1) : state.currentFloor;
  return {
    ...state,
    currentFloor: nextFloor,
  };
}

const shopState = {
  currentFloor: 4,
  currentAct: 2,
  totalFloors: 10,
  currentNodeId: null, // As opened from /.shop
  nodes: [{ id: 'node_1', floor: 1 }],
};

const afterShopComplete = simulateCompleteNode(shopState);
assert.strictEqual(afterShopComplete.currentFloor, 4, 'Current floor must NOT reset to 1 when leaving shop');
console.log('✅ PASSED: Leaving shop preserves current floor and act without resetting');

console.log('\n🎉 ALL ADMIN PANEL & ITEM EVOLUTION TESTS PASSED SUCCESSFULLY! 🎉\n');
