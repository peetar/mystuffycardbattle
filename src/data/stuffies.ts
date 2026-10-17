import { StuffySpecies } from '@/types/game';

export const ALL_STUFFIES: StuffySpecies[] = [
  {
    id: 'alex',
    name: 'Alex',
    species: 'Axolotl',
    title: 'The Derp Monarch',
    description: 'A pink axolotl. All he does all day is durp. Unfazed by danger.',
    baseHp: 65,
    color: '#f472b6', // pink-400
    accentColor: '#fb7185', // rose-400
    secondaryColor: '#fbcfe8', // pink-200
    features: ['gills', 'derp_eyes', 'pink_tail', 'smile'],
    passiveDescription: 'Derp Mind: S-tier Strokenosis mind controls opponent cards.',
    favoriteFoods: ['gummy_worms'],
    midFoods: ['fluff_cookies'],
    hatedFoods: ['lemon'],
  },
  {
    id: 'jefe',
    name: 'Jefe',
    species: 'Penguin',
    title: 'The Pudge Emperor',
    description: 'A blue penguin. He is fat, but vehemently insists he is "pudge". Do NOT call him fat.',
    baseHp: 78,
    color: '#38bdf8', // sky-400
    accentColor: '#0284c7', // sky-600
    secondaryColor: '#f8fafc', // white belly
    features: ['beak', 'flippers', 'pudge_belly', 'bow_tie'],
    passiveDescription: 'Rage at "Fat": Unleashes devastating Earthquakes with crack hazards.',
    favoriteFoods: ['fish_crackers'],
    midFoods: ['ice_slush'],
    hatedFoods: ['warm_tea'],
  },
  {
    id: 'finlee',
    name: 'Finlee',
    species: 'Orca',
    title: 'The Voracious Maw',
    description: 'A blue/black orca whale plush. Devours everything he encounters. Supreme lifestealer.',
    baseHp: 75,
    color: '#1e3a8a', // blue-900
    accentColor: '#3b82f6', // blue-500
    secondaryColor: '#ffffff', // white belly & eye patch
    features: ['dorsal_fin', 'white_eye_patch', 'sharp_teeth', 'tail_fluke'],
    passiveDescription: 'Apex Appetite: Attacks lifesteal. Can Swallow Whole (no restitch possible!).',
    favoriteFoods: ['big_shrimp'],
    midFoods: ['seaweed_crisp'],
    hatedFoods: ['carrot'],
  },
  {
    id: 'fifi',
    name: 'Fifi',
    species: 'Fox',
    title: 'The Chubby Gasmaster',
    description: 'A red fox, round and chubby. Farts a lot. Leaves toxic lingering smog.',
    baseHp: 68,
    color: '#ea580c', // orange-600
    accentColor: '#f97316', // orange-500
    secondaryColor: '#ffedd5', // cream muzzle
    features: ['fox_ears', 'bushy_tail', 'fart_puffs', 'chubby_cheeks'],
    passiveDescription: 'Silent but Violent: All gas attacks apply stacking Poison DoT.',
    favoriteFoods: ['berries_sausages'],
    midFoods: ['rice_cakes'],
    hatedFoods: ['onion'],
  },
  {
    id: 'thumper',
    name: 'Thumper',
    species: 'Hammerhead',
    title: 'The Concussion King',
    description: 'A grey hammerhead shark. Likes to thump whatever he sees with excessive force.',
    baseHp: 72,
    color: '#64748b', // slate-500
    accentColor: '#475569', // slate-600
    secondaryColor: '#cbd5e1', // slate-300
    features: ['hammer_head', 'shark_fin', 'thump_gloves', 'wide_eyes'],
    passiveDescription: 'Heavy Bludgeon: Inflicts Brain Damage, disabling stuffies until healed.',
    favoriteFoods: ['taco'],
    midFoods: ['clam_jerky'],
    hatedFoods: ['jellybeans'],
  },
  {
    id: 'toothless',
    name: 'Toothless',
    species: 'Night Fury Dragon',
    title: 'The Plasma Bomber',
    description: 'The iconic Night Fury from How to Train Your Dragon. Drops explosive plasma poos.',
    baseHp: 80,
    color: '#18181b', // zinc-900
    accentColor: '#10b981', // emerald green glowing eyes
    secondaryColor: '#27272a', // zinc-800 wings
    features: ['dragon_wings', 'green_slit_eyes', 'tail_fin', 'plasma_glow'],
    passiveDescription: 'Plasma Propulsion: Explosive burst damage and projectile AoE.',
    favoriteFoods: ['raw_salmon'],
    midFoods: ['beef_sticks'],
    hatedFoods: ['broccoli'],
  },
  {
    id: 'riolu',
    name: 'Riolu',
    species: 'Emanation Pokémon',
    title: 'The Aura Medic',
    description: 'The blue fighting pup from Pokémon, specialized into a pure Aura healing build.',
    baseHp: 64,
    color: '#0ea5e9', // ocean blue
    accentColor: '#1e293b', // dark mask
    secondaryColor: '#f1f5f9', // chest fluff
    features: ['aura_sensors', 'black_mask', 'blue_paws', 'medic_cross'],
    passiveDescription: 'Aura Radiance: High-volume heals, team warding, and restitch support.',
    favoriteFoods: ['sweet_berries'],
    midFoods: ['protein_bars'],
    hatedFoods: ['bitter_herb'],
  },
  {
    id: 'eevee',
    name: 'Eevee',
    species: 'Evolution Pokémon',
    title: 'The Occult Prodigy',
    description: 'The fluffy Pokémon, but possesses bizarrely creepy magical powers like lasers and missiles.',
    baseHp: 66,
    color: '#b45309', // amber-700
    accentColor: '#fde68a', // light cream mane
    secondaryColor: '#78350f', // dark brown paws
    features: ['long_ears', 'fluffy_collar', 'laser_eyes', 'missile_launcher'],
    passiveDescription: 'Creepy Magic: High-tech laser beams, homing missiles, and psychic shocks.',
    favoriteFoods: ['starlight_candy'],
    midFoods: ['marshmallows'],
    hatedFoods: ['mushrooms'],
  },
  {
    id: 'slugmee',
    name: 'Slugmee',
    species: 'Yellow Slug',
    title: 'The Murder Melodist',
    description: 'A bright yellow slug that sings haunting lullabies before fatal hugs.',
    baseHp: 60,
    color: '#eab308', // yellow-500
    accentColor: '#ca8a04', // yellow-600
    secondaryColor: '#fef08a', // yellow-200 belly
    features: ['eyestalks', 'musical_notes', 'slug_slime', 'hug_arms'],
    passiveDescription: 'Slug Me, Slug You: Sings deadly songs that sacrifice HP to destroy and revive.',
    favoriteFoods: ['leaf_salad'],
    midFoods: ['melon_slice'],
    hatedFoods: ['salt_pretzels'],
  },
  {
    id: 'beaker',
    name: 'Beaker',
    species: 'Owl',
    title: 'The Yosemite Sage',
    description: 'A wise horned owl from Yosemite National Park. Dive bombs from above.',
    baseHp: 70,
    color: '#78350f', // brown
    accentColor: '#d97706', // amber beak/eyes
    secondaryColor: '#fef3c7', // speckled chest
    features: ['feather_horns', 'round_glasses', 'wide_wings', 'sharp_talons'],
    passiveDescription: 'Eternal Vigil: Rest sites have no effect on him, but heals +1 HP every combat turn!',
    favoriteFoods: ['crisp_crickets'],
    midFoods: ['acorn_nut'],
    hatedFoods: ['hot_chili'],
  },
  {
    id: 'henry',
    name: 'Henry',
    species: 'Baby Turtle',
    title: 'The Potty Tank',
    description: 'A tiny baby turtle who always urgently has to go potty. Shells up to absorb huge blows.',
    baseHp: 85,
    color: '#16a34a', // green-600
    accentColor: '#854d0e', // brown shell
    secondaryColor: '#bbf7d0', // pale green neck
    features: ['baby_shell', 'diaper_pin', 'wide_baby_eyes', 'tiny_flippers'],
    passiveDescription: 'Shell Up: Taunts entire enemy team, taking 75% reduced damage while shelled.',
    favoriteFoods: ['lettuce_leaves'],
    midFoods: ['banana_bites'],
    hatedFoods: ['sour_candy'],
  },
  {
    id: 'dear',
    name: 'Dear',
    species: 'Poison Dart Frog',
    title: 'The Toxic Micro-Specter',
    description: 'A mini poison dart frog. Microscopic size, evasive acrobatics, and lethal skin secretions.',
    baseHp: 55,
    color: '#06b6d4', // cyan-500
    accentColor: '#0f172a', // black spots
    secondaryColor: '#22d3ee', // bright cyan belly
    features: ['toxic_spots', 'sticky_pads', 'dart_tongue', 'micro_crown'],
    passiveDescription: 'Toxic Secretion: Enemies attacking Dear take counter Poison damage.',
    favoriteFoods: ['fruit_flies'],
    midFoods: ['water_droplets'],
    hatedFoods: ['dry_oatmeal'],
  },
  {
    id: 'cole',
    name: 'Cole',
    species: 'Mini Turtle',
    title: 'The Toddler Spinner',
    description: 'Henry’s toddler brother. Enjoys spinning into things at high speeds and providing shield armor.',
    baseHp: 74,
    color: '#15803d', // green-700
    accentColor: '#713f12', // dark shell
    secondaryColor: '#86efac', // light green belly
    features: ['spinning_lines', 'toddler_cap', 'reinforced_rim', 'green_snout'],
    passiveDescription: 'Spinning Shell: Provides team-wide shields and spins through enemy lines.',
    favoriteFoods: ['chopped_kiwi'],
    midFoods: ['cucumber'],
    hatedFoods: ['grapefruit'],
  },
  {
    id: 'joann',
    name: 'Joann',
    species: 'Brown Cat',
    title: 'The Table Disrupter',
    description: 'A sleek brown plush cat with attitude. Knocks valuable things off tables just because.',
    baseHp: 62,
    color: '#854d0e', // brown-700
    accentColor: '#f59e0b', // amber eyes
    secondaryColor: '#fed7aa', // cream paws
    features: ['cat_ears', 'feline_whiskers', 'swishing_tail', 'claws_out'],
    passiveDescription: 'Disruptive Swat: Knocks cards out of opponent hands, forcing discards.',
    favoriteFoods: ['tuna_treats'],
    midFoods: ['milk_drops'],
    hatedFoods: ['citrus_peel'],
  },
  {
    id: 'cidney',
    name: 'Cidney',
    species: 'Fat Squirrel',
    title: 'The Purple Acorn Colossus',
    description: 'An extraordinarily fat purple squirrel. Stores mountains of nuts and slams opponents with his belly.',
    baseHp: 82,
    color: '#9333ea', // vibrant purple
    accentColor: '#581c87', // deep royal purple
    secondaryColor: '#f3e8ff', // soft lavender chubby belly
    features: ['massive_belly', 'giant_acorn', 'puffed_cheeks', 'fluffy_squirrel_tail', 'purple_fur'],
    passiveDescription: 'Nut Cache: Hoards extra Crackers and body-slams for heavy impact.',
    favoriteFoods: ['giant_walnuts'],
    midFoods: ['sunflower_seeds'],
    hatedFoods: ['wet_bread'],
  },
  {
    id: 'chanteira',
    name: 'Chanteira',
    species: 'Fat Dolphin',
    title: 'The Tidal Chonker',
    description: 'A dolphin exactly the same size as Cidney. Creates tidal waves and disorients with sonar.',
    baseHp: 80,
    color: '#0284c7', // sky-600
    accentColor: '#38bdf8', // sky-400
    secondaryColor: '#f0f9ff', // white chubby underbelly
    features: ['blowhole', 'wide_belly', 'dorsal_fin', 'sonar_ripples'],
    passiveDescription: 'Sonar Wave: Emits ultrasonic waves that reveal opponent cards and drench the field.',
    favoriteFoods: ['squid_pops'],
    midFoods: ['saltwater_taffy'],
    hatedFoods: ['spinach'],
  },
  {
    id: 'dolphy',
    name: 'Dolphy',
    species: 'Colossal Dolphin',
    title: 'The Ocean Behemoth',
    description: 'A colossal dolphin who is like Chanteira, but way bigger! Unleashes catastrophic tsunamis and heavy tidal pressure.',
    baseHp: 98,
    color: '#0369a1', // deep ocean blue
    accentColor: '#38bdf8', // radiant cyan
    secondaryColor: '#e0f2fe', // immense pale underbelly
    features: ['colossal_blowhole', 'giant_dorsal_fin', 'massive_behemoth_flukes', 'tidal_surge'],
    passiveDescription: 'Colossal Bulk: Soaks massive damage and crushes enemies under immense water pressure.',
    favoriteFoods: ['giant_squid', 'squid_pops'],
    midFoods: ['saltwater_taffy'],
    hatedFoods: ['spinach'],
  },
  {
    id: 'shadow',
    name: 'Shadow',
    species: 'Ultimate Hedgehog',
    title: 'The Ultimate Lifeform',
    description: 'Shadow the Hedgehog! A ferocious, strength-focused plush who harnesses Chaos control to double his Energy strength and wipe out opposition.',
    baseHp: 76,
    color: '#0f172a', // jet black
    accentColor: '#dc2626', // crimson red quills & highlights
    secondaryColor: '#f8fafc', // white chest fur & hover shoes
    features: ['crimson_quills', 'chaos_emerald', 'inhibitor_rings', 'air_shoes'],
    passiveDescription: 'Chaos Power: Attacks scale brutally with Energy (strength). Can double current strength with Chaos abilities!',
    favoriteFoods: ['chili_dogs', 'coffee_beans'],
    midFoods: ['acorn_crunch'],
    hatedFoods: ['sweet_marshmallows'],
  },
  {
    id: 'spot',
    name: 'Spot',
    species: 'Zoo Leopard',
    title: 'The Spot Shifter',
    description: 'The iconic spotted creature from Put Me in the Zoo! He changes and moves his polka dots at will, specializing in shifting, transferring, and doubling status effects.',
    baseHp: 78,
    color: '#eab308', // bright yellow
    accentColor: '#ef4444', // red polka dots
    secondaryColor: '#3b82f6', // blue polka dots
    features: ['polka_dots', 'color_shifting', 'flexible_tail', 'acrobatic_pose'],
    passiveDescription: 'Spot Shifting: Master of doubling buffs on allies and transferring debuffs like Poison onto foes!',
    favoriteFoods: ['colorful_gummies', 'marshmallows'],
    midFoods: ['animal_crackers'],
    hatedFoods: ['plain_oats'],
  },
  // --- BOSS-ONLY ENCOUNTERS ---
  {
    id: 'amalgam',
    name: 'The Stuffy Amalgam',
    species: 'Plush Amalgamation',
    title: 'The Fused Nightmare',
    description: 'A monstrous amalgamation of plushies sewn together! When defeated, it bursts apart into Joann, Slugmee, Thumper, Chanteira, and Cidney!',
    baseHp: 240,
    color: '#7e22ce', // chaotic purple
    accentColor: '#f59e0b', // warning amber
    secondaryColor: '#06b6d4', // unholy cyan glow
    features: ['fused_heads', 'multiple_limbs', 'wild_stitches', 'chaotic_aura'],
    passiveDescription: 'Unstable Fusion: When unstuffed, bursts open to reveal 5 distinct stuffies!',
    favoriteFoods: [],
    midFoods: [],
    hatedFoods: [],
  },
  {
    id: 'lint_vampire',
    name: 'The Static Sapper',
    species: 'Dust Fiend',
    title: 'The Strength Devourer',
    description: 'A malevolent entity born of static cling and lost lint! Saps the strength and Energy right out of powerful stuffies, leaving them weak and exhausted.',
    baseHp: 215,
    color: '#334155', // slate dust
    accentColor: '#38bdf8', // static spark cyan
    secondaryColor: '#64748b', // lint cloud
    features: ['static_sparks', 'whirlwind_dust', 'vampiric_fangs', 'strength_drain'],
    passiveDescription: 'Strength Leech: Periodically drains player Energy to zero and weakens player attacks by 25%.',
    favoriteFoods: [],
    midFoods: [],
    hatedFoods: [],
  },
  {
    id: 'toxic_slug',
    name: 'Noxious Slime King',
    species: 'Toxic Mollusk',
    title: 'The Venom Sovereign',
    description: 'A colossal, oozing slug that bathes the battlefield in poisonous miasma. Inflicts compounding Slay-the-Spire poison that eats away at fluff every turn!',
    baseHp: 225,
    color: '#15803d', // toxic emerald
    accentColor: '#a3e635', // radioactive lime spores
    secondaryColor: '#14532d', // deep slime green
    features: ['spore_capsules', 'toxic_trail', 'oozing_mantle', 'venomous_fangs'],
    passiveDescription: 'Venom Miasma: Bathes all opposing stuffies in lethal compounding poison.',
    favoriteFoods: [],
    midFoods: [],
    hatedFoods: [],
  },
];

export const STUFFY_MAP = new Map<string, StuffySpecies>(
  ALL_STUFFIES.map((s) => [s.id, s])
);

export const BOSS_SPECIES_IDS = new Set(['amalgam', 'lint_vampire', 'toxic_slug']);

export const PLAYABLE_STUFFIES = ALL_STUFFIES.filter((s) => !BOSS_SPECIES_IDS.has(s.id));


