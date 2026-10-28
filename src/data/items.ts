import { GameItem, ItemAttribute, ItemCategory, ItemRarity, StuffyEquipment } from '@/types/game';

export const ITEM_CAPS = {
  speed: 500,
  freeze: 75,
  burn: 75,
  stun: 75,
  shock: 25,
} as const;

export const INVENTORY_STORAGE_KEY = 'ben_stuffy_inventory_v37';
export const EQUIPMENT_STORAGE_KEY = 'ben_stuffy_equipment_v37';

interface ItemTemplate {
  name: string;
  category: ItemCategory;
  attribute: ItemAttribute;
  icon: string;
  description: string;
}

const HELMET_TEMPLATES: ItemTemplate[] = [
  { name: 'Frostbitten Beanie', category: 'helmet', attribute: 'freeze', icon: '❄️🧢', description: 'A chilly knitted beanie that chills the air around you.' },
  { name: 'Glacial Crown', category: 'helmet', attribute: 'freeze', icon: '👑🧊', description: 'Carved from ancient attic ice, freezing targets on hit.' },
  { name: 'Yeti Fur Hood', category: 'helmet', attribute: 'freeze', icon: '❄️🐻', description: 'Insulating yet bitterly freezing to foes.' },
  { name: 'Subzero Visor', category: 'helmet', attribute: 'freeze', icon: '🥽❄️', description: 'Reflects blinding blizzard frost directly at the enemy.' },
  { name: 'Snowstorm Cap', category: 'helmet', attribute: 'freeze', icon: '🌨️🧢', description: 'Swirls with miniature plush snowflakes.' },
];

const CHESTPLATE_TEMPLATES: ItemTemplate[] = [
  { name: 'Cinder-Woven Vest', category: 'chestplate', attribute: 'burn', icon: '🔥🦺', description: 'Stitched with heated embers that ignite opponents when striking.' },
  { name: 'Dragonscale Quilt', category: 'chestplate', attribute: 'burn', icon: '🐉🔥', description: 'Emits a searing aura of living flame.' },
  { name: 'Inferno Apron', category: 'chestplate', attribute: 'burn', icon: '🍳🔥', description: 'Hot to the touch, applying fiery scorch to foes.' },
  { name: 'Magma Fluff Plate', category: 'chestplate', attribute: 'burn', icon: '🌋🛡️', description: 'Dense vulcanized stuffing glowing red-hot.' },
  { name: 'Blazing Ribbon Harness', category: 'chestplate', attribute: 'burn', icon: '🎀🔥', description: 'Spits embers whenever you land a blow.' },
];

const GLOVES_TEMPLATES: ItemTemplate[] = [
  { name: 'Static Spark Mittens', category: 'gloves', attribute: 'shock', icon: '⚡🧤', description: 'Rubbed on attic carpet, discharging debilitating shock that paralyzes enemy cards for 1 turn!' },
  { name: 'High-Voltage Paws', category: 'gloves', attribute: 'shock', icon: '⚡🐾', description: 'Coated in conductive copper wire, shocking enemy teams into complete card paralysis.' },
  { name: 'Thunder-Stitched Gloves', category: 'gloves', attribute: 'shock', icon: '🌩️🧤', description: 'Channels concentrated plush electricity.' },
  { name: 'EMP Claws', category: 'gloves', attribute: 'shock', icon: '⚡🥊', description: 'Delivers a sudden short-circuit pulse to enemy brains.' },
];

const SWORD_TEMPLATES: ItemTemplate[] = [
  { name: 'Concussion Club', category: 'sword', attribute: 'stun', icon: '💫🏏', description: 'A blunt plush cudgel that inflicts Brain Damage (Stun) on hit!' },
  { name: 'Stunner Fluff Blade', category: 'sword', attribute: 'stun', icon: '⚔️🌀', description: 'Dazes foes upon contact, leaving them severely concussed.' },
  { name: 'Anvil-Tipped Rapier', category: 'sword', attribute: 'stun', icon: '🗡️💫', description: 'Weighted to crack skulls and scramble thoughts.' },
  { name: 'Skullcracker Mallet', category: 'sword', attribute: 'stun', icon: '🔨😵', description: 'Heavy hammer that sends enemies spinning in a Brain Damage stupor.' },
];

const OFFHAND_TEMPLATES: ItemTemplate[] = [
  { name: 'Wind-Up Pocketwatch', category: 'offhand', attribute: 'speed', icon: '⏱️💨', description: 'Spins furiously, granting massive Speed to unleash multiple attack strikes.' },
  { name: 'Turbo Propeller', category: 'offhand', attribute: 'speed', icon: '🪁💨', description: 'Creates tailwinds that boost attack frequency.' },
  { name: 'Mercury Stitched Ribbon', category: 'offhand', attribute: 'speed', icon: '👟⚡', description: 'Light as a feather, supercharging action speed.' },
  { name: 'Chrono-Spring Hourglass', category: 'offhand', attribute: 'speed', icon: '⏳✨', description: 'Hastens your reflexes, pushing speed past standard limits.' },
  { name: 'Nitro Slingshot', category: 'offhand', attribute: 'speed', icon: '🎯💨', description: 'Fires in rapid-fire bursts, multiplying strike frequency.' },
];

const PENDANT_ELEMENTS: Array<{ attribute: ItemAttribute; icon: string; name: string; desc: string }> = [
  { attribute: 'freeze', icon: '❄️📿', name: 'Glacial Locket', desc: 'Infuses all strikes with bitter freezing frost.' },
  { attribute: 'burn', icon: '🔥📿', name: 'Ember Heart Pendant', desc: 'Pulses with fiery embers that ignite enemies.' },
  { attribute: 'stun', icon: '💫📿', name: 'Mind-Warp Talisman', desc: 'Emits psychic disorientation, stunning foes with Brain Damage.' },
  { attribute: 'shock', icon: '⚡📿', name: 'Surge Battery Amulet', desc: 'Discharges electric jolts that shock enemy teams into card paralysis.' },
];

export function generateRandomItem(categoryChoice?: ItemCategory, forceRarity?: ItemRarity): GameItem {
  const categories: ItemCategory[] = ['helmet', 'chestplate', 'gloves', 'sword', 'offhand', 'pendant'];
  const category = categoryChoice || categories[Math.floor(Math.random() * categories.length)];

  // Rarity roll
  const rarities: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  let rarity: ItemRarity = forceRarity || 'common';
  if (!forceRarity) {
    const roll = Math.random();
    if (roll < 0.40) rarity = 'common';
    else if (roll < 0.70) rarity = 'uncommon';
    else if (roll < 0.88) rarity = 'rare';
    else if (roll < 0.97) rarity = 'epic';
    else rarity = 'legendary';
  }

  let template: ItemTemplate;
  let attribute: ItemAttribute;

  if (category === 'helmet') {
    template = HELMET_TEMPLATES[Math.floor(Math.random() * HELMET_TEMPLATES.length)];
    attribute = 'freeze';
  } else if (category === 'chestplate') {
    template = CHESTPLATE_TEMPLATES[Math.floor(Math.random() * CHESTPLATE_TEMPLATES.length)];
    attribute = 'burn';
  } else if (category === 'gloves') {
    template = GLOVES_TEMPLATES[Math.floor(Math.random() * GLOVES_TEMPLATES.length)];
    attribute = 'shock';
  } else if (category === 'sword') {
    template = SWORD_TEMPLATES[Math.floor(Math.random() * SWORD_TEMPLATES.length)];
    attribute = 'stun';
  } else if (category === 'offhand') {
    template = OFFHAND_TEMPLATES[Math.floor(Math.random() * OFFHAND_TEMPLATES.length)];
    attribute = 'speed';
  } else {
    // Pendant
    const pElem = PENDANT_ELEMENTS[Math.floor(Math.random() * PENDANT_ELEMENTS.length)];
    attribute = pElem.attribute;
    template = {
      name: pElem.name,
      category: 'pendant',
      attribute: pElem.attribute,
      icon: pElem.icon,
      description: pElem.desc,
    };
  }

  // Value calculation based on attribute and rarity
  let value = 0;
  if (attribute === 'speed') {
    const ranges: Record<ItemRarity, [number, number]> = {
      common: [30, 50],
      uncommon: [50, 80],
      rare: [80, 120],
      epic: [120, 170],
      legendary: [170, 240],
    };
    const [min, max] = ranges[rarity];
    value = Math.floor(min + Math.random() * (max - min + 1));
  } else if (attribute === 'shock') {
    // Shock cap is 25%
    const ranges: Record<ItemRarity, [number, number]> = {
      common: [5, 8],
      uncommon: [9, 13],
      rare: [14, 18],
      epic: [19, 22],
      legendary: [23, 25],
    };
    const [min, max] = ranges[rarity];
    value = Math.floor(min + Math.random() * (max - min + 1));
  } else {
    // Freeze, Burn, Stun (cap is 75%)
    const ranges: Record<ItemRarity, [number, number]> = {
      common: [10, 18],
      uncommon: [19, 30],
      rare: [31, 45],
      epic: [46, 60],
      legendary: [61, 75],
    };
    const [min, max] = ranges[rarity];
    value = Math.floor(min + Math.random() * (max - min + 1));
  }

  const rarityPrefixes: Record<ItemRarity, string> = {
    common: 'Well-Worn',
    uncommon: 'Reinforced',
    rare: 'Pristine',
    epic: 'Mythic Plush',
    legendary: 'Ancient God-Tier',
  };

  const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullName = `${rarityPrefixes[rarity]} ${template.name}`;

  return {
    id,
    name: fullName,
    category,
    attribute,
    value,
    rarity,
    icon: template.icon,
    description: template.description,
  };
}

/**
 * Campaign victory item drops:
 * Rule from user: 1 item per act plus 2 -> rounded to 3, 5, 7.
 */
export function generateCampaignVictoryItems(actsCompleted: number): GameItem[] {
  let count = 3;
  if (actsCompleted >= 3) {
    count = 7;
  } else if (actsCompleted === 2) {
    count = 5;
  } else {
    count = 3;
  }

  const items: GameItem[] = [];
  const categories: ItemCategory[] = ['helmet', 'chestplate', 'gloves', 'sword', 'offhand', 'pendant'];

  for (let i = 0; i < count; i++) {
    // Cycle categories to guarantee variety
    const cat = categories[i % categories.length];
    // Higher acts get better rarity chances
    let forceRarity: ItemRarity | undefined;
    if (i === count - 1 && actsCompleted >= 3) {
      forceRarity = 'legendary';
    } else if (i === count - 2 && actsCompleted >= 2) {
      forceRarity = 'epic';
    }
    items.push(generateRandomItem(cat, forceRarity));
  }

  return items;
}

// LocalStorage helpers
export function getItemInventory(): GameItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading item inventory:', e);
    return [];
  }
}

export function saveItemInventory(items: GameItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving item inventory:', e);
  }
}

export function getEquippedItems(): Record<string, StuffyEquipment> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(EQUIPMENT_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading equipped items:', e);
    return {};
  }
}

export function saveEquippedItems(equip: Record<string, StuffyEquipment>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(equip));
  } catch (e) {
    console.error('Error saving equipped items:', e);
  }
}

export function equipItem(stuffyId: string, item: GameItem): void {
  const inventory = getItemInventory();
  const equipped = getEquippedItems();

  const stuffyEquip = equipped[stuffyId] || {};
  const currentInSlot = stuffyEquip[item.category];

  // If slot had an item, clear its equipped flag
  if (currentInSlot) {
    const oldIdx = inventory.findIndex((it) => it.id === currentInSlot.id);
    if (oldIdx >= 0) {
      delete inventory[oldIdx].equippedToSpeciesId;
    }
  }

  // If this item was previously equipped on another stuffy, unequip it there
  for (const sId of Object.keys(equipped)) {
    if (equipped[sId][item.category]?.id === item.id) {
      delete equipped[sId][item.category];
    }
  }

  // Update item in inventory
  const itemIdx = inventory.findIndex((it) => it.id === item.id);
  if (itemIdx >= 0) {
    inventory[itemIdx].equippedToSpeciesId = stuffyId;
  }

  stuffyEquip[item.category] = { ...item, equippedToSpeciesId: stuffyId };
  equipped[stuffyId] = stuffyEquip;

  saveItemInventory(inventory);
  saveEquippedItems(equipped);
}

export function unequipItem(stuffyId: string, category: ItemCategory): void {
  const inventory = getItemInventory();
  const equipped = getEquippedItems();

  const stuffyEquip = equipped[stuffyId];
  if (!stuffyEquip || !stuffyEquip[category]) return;

  const item = stuffyEquip[category]!;
  delete stuffyEquip[category];

  const itemIdx = inventory.findIndex((it) => it.id === item.id);
  if (itemIdx >= 0) {
    delete inventory[itemIdx].equippedToSpeciesId;
  }

  saveItemInventory(inventory);
  saveEquippedItems(equipped);
}

export function getStuffyComputedStats(
  speciesId: string,
  baseSpeed: number = 100
): {
  speed: number;
  freezeChance: number;
  burnChance: number;
  shockChance: number;
  stunChance: number;
  equipment: StuffyEquipment;
} {
  const equipped = getEquippedItems();
  const stuffyEquip = equipped[speciesId] || {};

  let speedBonus = 0;
  let freezeChance = 0;
  let burnChance = 0;
  let shockChance = 0;
  let stunChance = 0;

  const slots: ItemCategory[] = ['helmet', 'chestplate', 'gloves', 'sword', 'offhand', 'pendant'];
  for (const slot of slots) {
    const item = stuffyEquip[slot];
    if (!item) continue;

    if (item.attribute === 'speed') {
      speedBonus += item.value;
    } else if (item.attribute === 'freeze') {
      freezeChance += item.value;
    } else if (item.attribute === 'burn') {
      burnChance += item.value;
    } else if (item.attribute === 'shock') {
      shockChance += item.value;
    } else if (item.attribute === 'stun') {
      stunChance += item.value;
    }
  }

  return {
    speed: Math.min(ITEM_CAPS.speed, baseSpeed + speedBonus),
    freezeChance: Math.min(ITEM_CAPS.freeze, freezeChance),
    burnChance: Math.min(ITEM_CAPS.burn, burnChance),
    shockChance: Math.min(ITEM_CAPS.shock, shockChance),
    stunChance: Math.min(ITEM_CAPS.stun, stunChance),
    equipment: stuffyEquip,
  };
}
