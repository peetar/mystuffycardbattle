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

export interface ItemTemplate {
  name: string;
  category: ItemCategory;
  attribute: ItemAttribute;
  icon: string;
  description: string;
}

export const HELMET_TEMPLATES: ItemTemplate[] = [
  { name: 'Frostbitten Beanie', category: 'helmet', attribute: 'freeze', icon: '❄️🧢', description: 'A chilly knitted beanie that chills the air around you.' },
  { name: 'Glacial Crown', category: 'helmet', attribute: 'freeze', icon: '👑🧊', description: 'Carved from ancient attic ice, freezing targets on hit.' },
  { name: 'Yeti Fur Hood', category: 'helmet', attribute: 'freeze', icon: '❄️🐻', description: 'Insulating yet bitterly freezing to foes.' },
  { name: 'Subzero Visor', category: 'helmet', attribute: 'freeze', icon: '🥽❄️', description: 'Reflects blinding blizzard frost directly at the enemy.' },
  { name: 'Snowstorm Cap', category: 'helmet', attribute: 'freeze', icon: '🌨️🧢', description: 'Swirls with miniature plush snowflakes.' },
  { name: 'Polar Bear Cowl', category: 'helmet', attribute: 'freeze', icon: '🐻‍❄️❄️', description: 'Lined with arctic fuzz that numbs opponent reflexes.' },
  { name: 'Icicle Diadem', category: 'helmet', attribute: 'freeze', icon: '💎❄️', description: 'Sharp crystalline icicles that freeze foes on contact.' },
  { name: 'Blizzard Aviator Cap', category: 'helmet', attribute: 'freeze', icon: '🛩️❄️', description: 'Earflaps lined with subzero mountain chill.' },
  { name: 'Cryo-Plush Helmet', category: 'helmet', attribute: 'freeze', icon: '⛑️🧊', description: 'Fitted with mini coolant vents that blow frost.' },
  { name: 'Frozen Earmuffs', category: 'helmet', attribute: 'freeze', icon: '🎧❄️', description: 'Chilled plush earmuffs radiating a deep frost aura.' },
  { name: 'Hailstone Beret', category: 'helmet', attribute: 'freeze', icon: '🎨🌨️', description: 'Fashioned from compacted ice pellets.' },
  { name: 'Aurora Borealis Band', category: 'helmet', attribute: 'freeze', icon: '🌌❄️', description: 'Glowing polar lights that freeze enemies in awe.' },
  { name: 'Permafrost Ushanka', category: 'helmet', attribute: 'freeze', icon: '🪖❄️', description: 'Heavy winter trooper hat frozen solid from the attic chasm.' },
  { name: 'Ice Dragon Skullcap', category: 'helmet', attribute: 'freeze', icon: '🐉🧊', description: 'Adorned with frozen dragon scales.' },
  { name: 'Cold Snap Fez', category: 'helmet', attribute: 'freeze', icon: '🎩❄️', description: 'A quirky felt fez that triggers instant frost waves.' },
  { name: 'Glaze-Ice Top Hat', category: 'helmet', attribute: 'freeze', icon: '🎩🧊', description: 'Slick frozen formal wear with high freezing power.' },
  { name: 'Winter Monarch Tiara', category: 'helmet', attribute: 'freeze', icon: '👑❄️', description: 'Frost queen crown radiating 50% speed slows.' },
  { name: 'Shivering Snowman Bucket', category: 'helmet', attribute: 'freeze', icon: '⛄🪣', description: 'A tin snowman hat packed with fresh snow.' },
  { name: 'Absolute Zero Circlet', category: 'helmet', attribute: 'freeze', icon: '❄️💍', description: 'Brings surrounding temperatures down to zero Kelvin.' },
  { name: 'Avalanche Peak Hood', category: 'helmet', attribute: 'freeze', icon: '🏔️❄️', description: 'Triggers rolling miniature snow drifts upon attack.' },
];

export const CHESTPLATE_TEMPLATES: ItemTemplate[] = [
  { name: 'Cinder-Woven Vest', category: 'chestplate', attribute: 'burn', icon: '🔥🦺', description: 'Stitched with heated embers that ignite opponents when striking.' },
  { name: 'Dragonscale Quilt', category: 'chestplate', attribute: 'burn', icon: '🐉🔥', description: 'Emits a searing aura of living flame.' },
  { name: 'Inferno Apron', category: 'chestplate', attribute: 'burn', icon: '🍳🔥', description: 'Hot to the touch, applying fiery scorch to foes.' },
  { name: 'Magma Fluff Plate', category: 'chestplate', attribute: 'burn', icon: '🌋🛡️', description: 'Dense vulcanized stuffing glowing red-hot.' },
  { name: 'Blazing Ribbon Harness', category: 'chestplate', attribute: 'burn', icon: '🎀🔥', description: 'Spits embers whenever you land a blow.' },
  { name: 'Ember-Stitched Tunic', category: 'chestplate', attribute: 'burn', icon: '🥋🔥', description: 'Woven with threads harvested from a dying campfire.' },
  { name: 'Molten Wool Breastplate', category: 'chestplate', attribute: 'burn', icon: '🐑🔥', description: 'Wool boiled in lava, igniting all who stand in its way.' },
  { name: 'Phoenix Down Cuirass', category: 'chestplate', attribute: 'burn', icon: '🪶🔥', description: 'Radiates legendary golden flames that burn on card discard.' },
  { name: 'Firecracker Poncho', category: 'chestplate', attribute: 'burn', icon: '🧨🦺', description: 'Pop and sizzle with miniature fireworks.' },
  { name: 'Charcoal Stuffed Jerkin', category: 'chestplate', attribute: 'burn', icon: '🪵🔥', description: 'Stuffed with smoldering charcoal briquettes.' },
  { name: 'Sunflare Pajama Top', category: 'chestplate', attribute: 'burn', icon: '☀️👕', description: 'Bright sunny patterns burning with solar heat.' },
  { name: 'Scorched Button Mail', category: 'chestplate', attribute: 'burn', icon: '🔘🔥', description: 'Buttons heated red-hot to sear nearby enemies.' },
  { name: 'Volcanic Fleece Vest', category: 'chestplate', attribute: 'burn', icon: '🌋🦺', description: 'Ultra-soft fleece saturated in volcanic brimstone.' },
  { name: 'Wildfire Cloak', category: 'chestplate', attribute: 'burn', icon: '🔥🧥', description: 'Billows with spreading wildfire sparks.' },
  { name: 'Thermite Sweater', category: 'chestplate', attribute: 'burn', icon: '🧶🔥', description: 'Ignites intense thermal burn reactions on attack.' },
  { name: 'Pyre Cotton Armor', category: 'chestplate', attribute: 'burn', icon: '🔥🛡️', description: 'Ancient battle garment that never stops burning.' },
  { name: 'Firefly Spark Coat', category: 'chestplate', attribute: 'burn', icon: '🪲🔥', description: 'Glows with bioluminescent fire that scorches foes.' },
  { name: 'Red-Hot Patchwork Vest', category: 'chestplate', attribute: 'burn', icon: '🧵🔥', description: 'Scraps of burned quilt stitched together.' },
  { name: 'Supernova Boiler Plate', category: 'chestplate', attribute: 'burn', icon: '⭐🔥', description: 'Unleashes stellar burn heat on enemy squads.' },
  { name: 'Ignited Dragon Hauberk', category: 'chestplate', attribute: 'burn', icon: '🐲🔥', description: 'Dragon scales that perpetually burst into living fire.' },
];

export const GLOVES_TEMPLATES: ItemTemplate[] = [
  { name: 'Static Spark Mittens', category: 'gloves', attribute: 'shock', icon: '⚡🧤', description: 'Rubbed on attic carpet, discharging debilitating shock that paralyzes enemy cards for 1 turn!' },
  { name: 'High-Voltage Paws', category: 'gloves', attribute: 'shock', icon: '⚡🐾', description: 'Coated in conductive copper wire, shocking enemy teams into complete card paralysis.' },
  { name: 'Thunder-Stitched Gloves', category: 'gloves', attribute: 'shock', icon: '🌩️🧤', description: 'Channels concentrated plush electricity.' },
  { name: 'EMP Claws', category: 'gloves', attribute: 'shock', icon: '⚡🥊', description: 'Delivers a sudden short-circuit pulse to enemy brains.' },
  { name: 'Copper Wire Wraps', category: 'gloves', attribute: 'shock', icon: '🪢⚡', description: 'Conducts rapid electric shocks into opposing targets.' },
  { name: 'Tesla Wool Gauntlets', category: 'gloves', attribute: 'shock', icon: '🧲⚡', description: 'Generates localized electromagnetic fields that shock teams.' },
  { name: 'Lightning Rod Mitts', category: 'gloves', attribute: 'shock', icon: '⚡🥢', description: 'Draws raw lightning down to fry opposing cards.' },
  { name: 'Plasma Arc Paws', category: 'gloves', attribute: 'shock', icon: '🟣⚡', description: 'Crackles with superheated electric plasma.' },
  { name: 'Dynamo Boxing Gloves', category: 'gloves', attribute: 'shock', icon: '🥊⚡', description: 'Every punch cranks the internal dynamo to discharge 25% shock.' },
  { name: 'Van de Graaff Handwraps', category: 'gloves', attribute: 'shock', icon: '🔮⚡', description: 'Builds massive electrostatic potential on every turn.' },
  { name: 'Battery Discharge Gloves', category: 'gloves', attribute: 'shock', icon: '🔋⚡', description: 'Plush gloves wired to an overcharged lithium battery.' },
  { name: 'Electric Eel Flippers', category: 'gloves', attribute: 'shock', icon: '🐟⚡', description: 'Biocurrent flippers that paralyze entire opposing squads.' },
  { name: 'Static Carpet Socks', category: 'gloves', attribute: 'shock', icon: '🧦⚡', description: 'Socks worn on paws, building immense static on rugs.' },
  { name: 'Stun Gun Stitched Gloves', category: 'gloves', attribute: 'shock', icon: '🔫⚡', description: 'Point-blank short-circuit zappers.' },
  { name: 'Stormcloud Wristlets', category: 'gloves', attribute: 'shock', icon: '☁️⚡', description: 'Tiny storm clouds swirling around wrists.' },
  { name: 'Ionized Thread Gloves', category: 'gloves', attribute: 'shock', icon: '🧵⚡', description: 'Thread treated with ionized salts to shock enemies.' },
  { name: 'Ball Lightning Mitts', category: 'gloves', attribute: 'shock', icon: '⚪⚡', description: 'Hurls spheres of crackling ball lightning.' },
  { name: 'Megawatt Plush Paws', category: 'gloves', attribute: 'shock', icon: '🐾⚡', description: 'Packs a megawatt punch that shuts down enemy actions.' },
  { name: 'Short-Circuit Bracers', category: 'gloves', attribute: 'shock', icon: '💥⚡', description: 'Overloads enemy nerves with electric sparks.' },
  { name: 'Thunderstrike Gauntlets', category: 'gloves', attribute: 'shock', icon: '🌩️🥊', description: 'The ultimate lightning gauntlets capped at 25% shock.' },
];

export const SWORD_TEMPLATES: ItemTemplate[] = [
  { name: 'Concussion Club', category: 'sword', attribute: 'stun', icon: '💫🏏', description: 'A blunt plush cudgel that inflicts Brain Damage (Stun) on hit!' },
  { name: 'Stunner Fluff Blade', category: 'sword', attribute: 'stun', icon: '⚔️🌀', description: 'Dazes foes upon contact, leaving them severely concussed.' },
  { name: 'Anvil-Tipped Rapier', category: 'sword', attribute: 'stun', icon: '🗡️💫', description: 'Weighted to crack skulls and scramble thoughts.' },
  { name: 'Skullcracker Mallet', category: 'sword', attribute: 'stun', icon: '🔨😵', description: 'Heavy hammer that sends enemies spinning in a Brain Damage stupor.' },
  { name: 'Heavy Rolling Pin', category: 'sword', attribute: 'stun', icon: '🥖💫', description: 'Kitchen toy pin that flattens heads and dazes minds.' },
  { name: 'Whack-A-Mole Mallet', category: 'sword', attribute: 'stun', icon: '🔨🐭', description: 'Delivers comedic yet devastating bonks that stun for 3 turns.' },
  { name: 'Lead-Lined Plush Mace', category: 'sword', attribute: 'stun', icon: '🪨🏏', description: 'Dense pellet filling that crushes enemy focus.' },
  { name: 'Dazing Feather Broadsword', category: 'sword', attribute: 'stun', icon: '🗡️🪶', description: 'Vibrates with sonic frequencies that leave targets dizzy.' },
  { name: 'Sledgehammer Toy', category: 'sword', attribute: 'stun', icon: '🔨💥', description: 'Oversized plush hammer that lands with a thunderous thud.' },
  { name: 'Bell-Ringer Morningstar', category: 'sword', attribute: 'stun', icon: '🔔⚔️', description: 'Rings enemies\' bells until they forget their next card.' },
  { name: 'Bonk Bat', category: 'sword', attribute: 'stun', icon: '🏏🌀', description: 'Classic wooden-style toy bat for maximum concussive force.' },
  { name: 'Memory-Wipe Saber', category: 'sword', attribute: 'stun', icon: '🗡️🧠', description: 'Slices through thoughts, inflicting instant Brain Damage.' },
  { name: 'Groovy Daze Cutlass', category: 'sword', attribute: 'stun', icon: '🗡️😵', description: 'Hypnotic swishing blade that scrambles minds.' },
  { name: 'Dense Beanbag Flail', category: 'sword', attribute: 'stun', icon: '⛓️💫', description: 'Stuffed with heavy beans that batter skulls mercilessly.' },
  { name: 'Stupor Stitched Claymore', category: 'sword', attribute: 'stun', icon: '🗡️💤', description: 'A massive plush sword that knocks enemies silly.' },
  { name: 'Blackout Blackjack', category: 'sword', attribute: 'stun', icon: '🏏⚫', description: 'A stealthy padded baton for instant knockouts.' },
  { name: 'Dizzymaker Scythe', category: 'sword', attribute: 'stun', icon: '🌾💫', description: 'Reaps consciousness and induces persistent vertigo.' },
  { name: 'Timber Toy Cudgel', category: 'sword', attribute: 'stun', icon: '🪵💥', description: 'Solid block wood toy that cracks through shields.' },
  { name: 'Grand Piano Smasher', category: 'sword', attribute: 'stun', icon: '🎹😵', description: 'Hits with the weight of a miniature toy piano.' },
  { name: 'Brain-Scrambler Halberd', category: 'sword', attribute: 'stun', icon: '🪓💫', description: 'The pinnacle of concussive polearms capped at 75% stun.' },
];

export const OFFHAND_TEMPLATES: ItemTemplate[] = [
  { name: 'Wind-Up Pocketwatch', category: 'offhand', attribute: 'speed', icon: '⏱️💨', description: 'Spins furiously, granting massive Speed to unleash multiple attack strikes.' },
  { name: 'Turbo Propeller', category: 'offhand', attribute: 'speed', icon: '🪁💨', description: 'Creates tailwinds that boost attack frequency.' },
  { name: 'Mercury Stitched Ribbon', category: 'offhand', attribute: 'speed', icon: '👟⚡', description: 'Light as a feather, supercharging action speed.' },
  { name: 'Chrono-Spring Hourglass', category: 'offhand', attribute: 'speed', icon: '⏳✨', description: 'Hastens your reflexes, pushing speed past standard limits.' },
  { name: 'Nitro Slingshot', category: 'offhand', attribute: 'speed', icon: '🎯💨', description: 'Fires in rapid-fire bursts, multiplying strike frequency.' },
  { name: 'Cheetah Tail Fan', category: 'offhand', attribute: 'speed', icon: '🐆💨', description: 'Whisks air to deliver high-speed sprint momentum.' },
  { name: 'Tailwind Pinwheel', category: 'offhand', attribute: 'speed', icon: '🎡💨', description: 'Spins wildly in the breeze, multiplying action speed.' },
  { name: 'Velocity Yo-Yo', category: 'offhand', attribute: 'speed', icon: '🪀💨', description: 'Snaps back and forth with blinding strike speed.' },
  { name: 'Overdrive Metronome', category: 'offhand', attribute: 'speed', icon: '⏲️⚡', description: 'Ticks at 300 BPM, supercharging attack tempo.' },
  { name: 'Supersonic Whistle', category: 'offhand', attribute: 'speed', icon: '🎵💨', description: 'Emits high-pitch signals that quicken ally paws.' },
  { name: 'Racing Snail Shell', category: 'offhand', attribute: 'speed', icon: '🐌⚡', description: 'Ironic enchanted shell that grants supersonic velocity.' },
  { name: 'Kinetic Flywheel', category: 'offhand', attribute: 'speed', icon: '⚙️💨', description: 'Stores rotational energy to fire off bonus strikes.' },
  { name: 'Lightning Bug Jar', category: 'offhand', attribute: 'speed', icon: '🫙⚡', description: 'Jar of hyperactive fireflies lighting fast movement.' },
  { name: 'Rocket-Stitched Boomerang', category: 'offhand', attribute: 'speed', icon: '🪃🚀', description: 'Returns faster than the eye can follow.' },
  { name: 'Quicksilver Marbles', category: 'offhand', attribute: 'speed', icon: '⚪💨', description: 'Roll smoothly to frictionless maximum acceleration.' },
  { name: 'Hyper-Spring Bobbin', category: 'offhand', attribute: 'speed', icon: '🧵⚡', description: 'Unspools yarn at supersonic velocity.' },
  { name: 'Jet-Pulse Spinner', category: 'offhand', attribute: 'speed', icon: '🌀🚀', description: 'Spinning fidget toy with miniature jet exhaust.' },
  { name: 'Gale-Force Kite', category: 'offhand', attribute: 'speed', icon: '🪁⚡', description: 'Catches thermal updrafts for high-speed combat.' },
  { name: 'Tachyon Music Box', category: 'offhand', attribute: 'speed', icon: '📻✨', description: 'Plays tunes that bend space-time and haste speed.' },
  { name: 'Light-Speed Prism', category: 'offhand', attribute: 'speed', icon: '💎⚡', description: 'Refracts speed past 500, enabling up to 5 speed strikes.' },
];

export const PENDANT_ELEMENTS: Array<{ attribute: ItemAttribute; icon: string; name: string; desc: string }> = [
  { attribute: 'freeze', icon: '❄️📿', name: 'Glacial Locket', desc: 'Infuses all strikes with bitter freezing frost.' },
  { attribute: 'burn', icon: '🔥📿', name: 'Ember Heart Pendant', desc: 'Pulses with fiery embers that ignite enemies.' },
  { attribute: 'stun', icon: '💫📿', name: 'Mind-Warp Talisman', desc: 'Emits psychic disorientation, stunning foes with Brain Damage.' },
  { attribute: 'shock', icon: '⚡📿', name: 'Surge Battery Amulet', desc: 'Discharges electric jolts that shock enemy teams into card paralysis.' },
  { attribute: 'freeze', icon: '🧊📿', name: 'Frostbite Cameo', desc: 'Carved cameo portrait that chills all physical hits.' },
  { attribute: 'burn', icon: '🌋📿', name: 'Solar Flare Charm', desc: 'Radiates solar heat that sets opponents ablaze on attack.' },
  { attribute: 'shock', icon: '🔌📿', name: 'Static Ohm Choker', desc: 'Coiled electrical choker with high-voltage shock output.' },
  { attribute: 'stun', icon: '🌀📿', name: 'Concussive Medallion', desc: 'Emits ultrasonic vibrations that daze enemy minds.' },
  { attribute: 'freeze', icon: '💎📿', name: 'Cryo-Prism Necklace', desc: 'Focuses light into freezing subzero laser beams.' },
  { attribute: 'burn', icon: '🔴📿', name: 'Dragonfire Ruby', desc: 'A burning ruby that ignites enemies with persistent fire.' },
  { attribute: 'shock', icon: '🌩️📿', name: 'Lightning Bolt Brooch', desc: 'Pins a thunderstorm directly to your chest.' },
  { attribute: 'stun', icon: '😵📿', name: 'Vertigo Spiral Jewel', desc: 'Induces severe dizziness and concussion on impact.' },
  { attribute: 'freeze', icon: '🌨️📿', name: 'Permafrost Shard', desc: 'Ancient ice crystal that never melts, halving enemy speed.' },
  { attribute: 'burn', icon: '☄️📿', name: 'Volcano Core Locket', desc: 'Pockets of bubbling magma that spit burning sparks.' },
  { attribute: 'shock', icon: '🔋📿', name: 'Dynamo Coil Pendant', desc: 'Stores kinetic hits to discharge devastating electric shocks.' },
  { attribute: 'stun', icon: '💀📿', name: 'Skull-Rattle Amulet', desc: 'Rattles with psychic disturbance, scrambling enemy brains.' },
  { attribute: 'freeze', icon: '⭐📿', name: 'Polar Star Rosary', desc: 'Guided by the North Star, bringing freezing winter temperatures.' },
  { attribute: 'burn', icon: '🎀📿', name: 'Eternal Flame Ribbon', desc: 'A bright scarlet ribbon that scorches on hit.' },
  { attribute: 'shock', icon: '⚡📿', name: 'Overcharged Capacitor', desc: 'A miniature electric capacitor ready to paralyze whole teams.' },
  { attribute: 'stun', icon: '💫📿', name: 'Stun-Star Bauble', desc: 'Spins stars around foes, inflicting 3-turn Brain Damage.' },
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

export function createItemFromTemplate(template: ItemTemplate, rarity: ItemRarity = 'rare'): GameItem {
  let value = 0;
  if (template.attribute === 'speed') {
    const ranges: Record<ItemRarity, [number, number]> = {
      common: [30, 50],
      uncommon: [50, 80],
      rare: [80, 120],
      epic: [120, 170],
      legendary: [170, 240],
    };
    const [min, max] = ranges[rarity];
    value = Math.floor((min + max) / 2);
  } else if (template.attribute === 'shock') {
    const ranges: Record<ItemRarity, [number, number]> = {
      common: [5, 8],
      uncommon: [9, 13],
      rare: [14, 18],
      epic: [19, 22],
      legendary: [23, 25],
    };
    const [min, max] = ranges[rarity];
    value = Math.floor((min + max) / 2);
  } else {
    const ranges: Record<ItemRarity, [number, number]> = {
      common: [10, 18],
      uncommon: [19, 30],
      rare: [31, 45],
      epic: [46, 60],
      legendary: [61, 75],
    };
    const [min, max] = ranges[rarity];
    value = Math.floor((min + max) / 2);
  }

  const rarityPrefixes: Record<ItemRarity, string> = {
    common: 'Well-Worn',
    uncommon: 'Reinforced',
    rare: 'Pristine',
    epic: 'Mythic Plush',
    legendary: 'Ancient God-Tier',
  };

  const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id,
    name: `${rarityPrefixes[rarity]} ${template.name}`,
    category: template.category,
    attribute: template.attribute,
    value,
    rarity,
    icon: template.icon,
    description: template.description,
  };
}

/**
 * Returns a complete catalog of all predefined templates across all categories and rarities
 * for tester selection in the Admin Panel (.item).
 */
export function getAllItemCatalog(): GameItem[] {
  const allTemplates: ItemTemplate[] = [
    ...HELMET_TEMPLATES,
    ...CHESTPLATE_TEMPLATES,
    ...GLOVES_TEMPLATES,
    ...SWORD_TEMPLATES,
    ...OFFHAND_TEMPLATES,
    ...PENDANT_ELEMENTS.map((p) => ({
      name: p.name,
      category: 'pendant' as ItemCategory,
      attribute: p.attribute,
      icon: p.icon,
      description: p.desc,
    })),
  ];

  const rarities: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const catalog: GameItem[] = [];

  allTemplates.forEach((tmpl) => {
    rarities.forEach((r) => {
      catalog.push(createItemFromTemplate(tmpl, r));
    });
  });

  return catalog;
}

/**
 * Grants an item to the player's persistent inventory.
 */
export function grantItemToInventory(item: GameItem): GameItem {
  const inventory = getItemInventory();
  const grantedItem: GameItem = {
    ...item,
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    equippedToSpeciesId: undefined,
  };
  saveItemInventory([grantedItem, ...inventory]);
  return grantedItem;
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

export const NEXT_RARITY_MAP: Record<ItemRarity, ItemRarity | null> = {
  common: 'uncommon',
  uncommon: 'rare',
  rare: 'epic',
  epic: 'legendary',
  legendary: null,
};

/**
 * Discards an item from the player's inventory and unequips it from any stuffy.
 */
export function discardItem(itemId: string): void {
  const inventory = getItemInventory();
  const equipped = getEquippedItems();

  // If equipped on any stuffy, unequip it
  for (const sId of Object.keys(equipped)) {
    for (const cat of Object.keys(equipped[sId]) as ItemCategory[]) {
      if (equipped[sId][cat]?.id === itemId) {
        delete equipped[sId][cat];
      }
    }
  }

  const updated = inventory.filter((item) => item.id !== itemId);
  saveItemInventory(updated);
  saveEquippedItems(equipped);
}

/**
 * Combines/evolves two items of the same rarity into one item of the next rarity tier:
 * 2 Commons -> 1 Uncommon
 * 2 Uncommons -> 1 Rare
 * 2 Rares -> 1 Epic
 * 2 Epics -> 1 Legendary
 */
export function evolveItems(
  itemAId: string,
  itemBId: string
): { success: boolean; newItem?: GameItem; error?: string } {
  if (itemAId === itemBId) {
    return { success: false, error: 'Cannot evolve an item with itself!' };
  }

  const inventory = getItemInventory();
  const itemA = inventory.find((i) => i.id === itemAId);
  const itemB = inventory.find((i) => i.id === itemBId);

  if (!itemA || !itemB) {
    return { success: false, error: 'One or both items not found in inventory.' };
  }

  if (itemA.rarity !== itemB.rarity) {
    return { success: false, error: 'Both items must be of the same rarity tier to evolve!' };
  }

  const nextRarity = NEXT_RARITY_MAP[itemA.rarity];
  if (!nextRarity) {
    return { success: false, error: 'Legendary items are already at max tier and cannot be evolved further!' };
  }

  // Unequip if either item was equipped
  const equipped = getEquippedItems();
  for (const sId of Object.keys(equipped)) {
    for (const cat of Object.keys(equipped[sId]) as ItemCategory[]) {
      if (equipped[sId][cat]?.id === itemAId || equipped[sId][cat]?.id === itemBId) {
        delete equipped[sId][cat];
      }
    }
  }

  // Create higher tier item (use itemA's category)
  const newItem = generateRandomItem(itemA.category, nextRarity);
  const updatedInventory = inventory.filter((i) => i.id !== itemAId && i.id !== itemBId);
  updatedInventory.unshift(newItem);

  saveItemInventory(updatedInventory);
  saveEquippedItems(equipped);

  return { success: true, newItem };
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
