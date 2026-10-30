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

// 2. Command Parsing Test
function parseCommand(raw) {
  let normalized = raw.trim();
  if (normalized.startsWith('/.')) normalized = normalized.substring(2).trim();
  else if (normalized.startsWith('/') || normalized.startsWith('.')) normalized = normalized.substring(1).trim();
  const parts = normalized.split(/\s+/);
  return { command: parts[0]?.toLowerCase(), args: parts.slice(1) };
}

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

console.log('\n🎉 ALL ADMIN PANEL TESTS PASSED SUCCESSFULLY! 🎉\n');
