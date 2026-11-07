import { Card, CardTier } from '@/types/game';

export const PLAYER_POWERUP_CARDS: Card[] = [
  {
    id: 'player_restitch',
    name: 'Master Restitch',
    tier: 'A',
    cost: 3,
    type: 'restitch',
    target: 'unstuffed_ally',
    description: 'Sew stuffing back into a fallen stuffy! Revives them with 30 HP.',
    heal: 30,
    canRevive: true,
    isPlayerCard: true,
  },
  {
    id: 'player_quick_patch',
    name: 'Quick Patchwork',
    tier: 'B',
    cost: 2,
    type: 'restitch',
    target: 'unstuffed_ally',
    description: 'A hasty needle fix. Revives an unstuffed ally with 16 HP.',
    heal: 16,
    canRevive: true,
    isPlayerCard: true,
  },
  {
    id: 'player_brain_damage',
    name: 'Concussion Hammer',
    tier: 'A',
    cost: 3,
    type: 'debuff',
    target: 'single_enemy',
    description: 'Brain damages target stuffy. They cannot be used until they receive healing!',
    brainDamage: true,
    damage: 8,
    isPlayerCard: true,
  },
  {
    id: 'player_heal_major',
    name: 'Fluff Surgery',
    tier: 'A',
    cost: 3,
    type: 'heal',
    target: 'single_ally',
    description: 'Heal a friendly stuffy for 32 HP and cure negative status effects.',
    heal: 32,
    isPlayerCard: true,
  },
  {
    id: 'player_heal_burst',
    name: 'Cotton Infusion',
    tier: 'B',
    cost: 2,
    type: 'heal',
    target: 'single_ally',
    description: 'Heal a friendly stuffy for 22 HP.',
    heal: 22,
    isPlayerCard: true,
  },
  {
    id: 'player_heal_minor',
    name: 'Snuggle Band-Aid',
    tier: 'C',
    cost: 1,
    type: 'heal',
    target: 'single_ally',
    description: 'Heal a friendly stuffy for 14 HP.',
    heal: 14,
    isPlayerCard: true,
  },
  {
    id: 'player_damage_bolt',
    name: 'Thunder Button',
    tier: 'A',
    cost: 3,
    type: 'attack',
    target: 'single_enemy',
    description: 'Call down direct needle lightning on an enemy stuffy for 28 damage.',
    damage: 28,
    isPlayerCard: true,
  },
  {
    id: 'player_damage_burst',
    name: 'Cotton Blast',
    tier: 'B',
    cost: 2,
    type: 'attack',
    target: 'single_enemy',
    description: 'Blast an enemy stuffy directly for 20 damage.',
    damage: 20,
    isPlayerCard: true,
  },
  {
    id: 'player_damage_poke',
    name: 'Safety Pin Poke',
    tier: 'C',
    cost: 1,
    type: 'attack',
    target: 'single_enemy',
    description: 'Poke an enemy stuffy for 14 damage.',
    damage: 14,
    isPlayerCard: true,
  },
  {
    id: 'player_energy',
    name: 'Energy Surge',
    tier: 'B',
    cost: 1,
    type: 'utility',
    target: 'single_ally',
    description: 'Infuses +3 Energy into a stuffy! Boosts all attack damage dealt by this stuffy by +3.',
    isPlayerCard: true,
  },
  {
    id: 'player_cracker_feast',
    name: 'Secret Cracker Tin',
    tier: 'S',
    cost: 0,
    type: 'utility',
    target: 'none',
    description: 'Open a hidden snack tin! Gain +3 Crackers immediately this turn.',
    isPlayerCard: true,
  },
];

// Helper to construct structured 18-card sets per stuffy (3 cards per tier: F, D, C, B, A, S)
function createStuffyCardSet(stuffyId: string, customCards: Partial<Card>[]): Card[] {
  return customCards.map((c, i) => ({
    id: c.id || `${stuffyId}_card_${i + 1}`,
    name: c.name || `Move ${i + 1}`,
    tier: c.tier || 'C',
    cost: c.cost ?? 2,
    type: c.type || 'attack',
    target: c.target || 'single_enemy',
    aoeType: c.aoeType,
    stuffyId,
    description: c.description || 'A combat move.',
    damage: c.damage,
    block: c.block,
    heal: c.heal,
    lifesteal: c.lifesteal,
    poison: c.poison,
    taunt: c.taunt,
    brainDamage: c.brainDamage,
    bleedingStuffing: c.bleedingStuffing,
    weak: c.weak,
    canRevive: c.canRevive,
    specialActionId: c.specialActionId,
    isPlayerCard: false,
    upgraded: false,
  }));
}

// 1. Alex (Pink Axolotl)
const ALEX_CARDS: Card[] = createStuffyCardSet('alex', [
  // F-Tier (Rebalanced: >= 7 damage/shield, viable starter moves)
  { id: 'alex_f1', name: 'Derp Stare', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Stares blankly with unblinking eyes. Deals 9 damage.', damage: 9 },
  { id: 'alex_f2', name: 'Gill Flutter', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Flutters pink external gills. Gain 9 Shield.', block: 9 },
  { id: 'alex_f3', name: 'Drool Ripple', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Durp drool ripples outwards! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier (Rebalanced: single strikes, shields, and mini-spread)
  { id: 'alex_d1', name: 'Pink Fin Slap', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'A squishy fin slap. Deals 12 damage.', damage: 12 },
  { id: 'alex_d2', name: 'Squishy Posture', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Goes completely limp and absorbs hits. Gain 12 Shield.', block: 12 },
  { id: 'alex_d3', name: 'Soothing Smile', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Smiles warmly with cute gill tufts. Heals 12 HP.', heal: 12 },
  // C-Tier (Rebalanced: around AoE, team guard, regeneration)
  { id: 'alex_c1', name: 'Aquarium Splash', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Splashes water across the line! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  { id: 'alex_c2', name: 'Amphibian Guard', tier: 'C', cost: 2, type: 'defense', target: 'around_ally', aoeType: 'around', description: 'Coats self and nearby allies in slippery slime. Gain 14 Shield.', block: 14 },
  { id: 'alex_c3', name: 'Gill Regeneration', tier: 'C', cost: 2, type: 'heal', target: 'self', description: 'Regenerates plush cotton skin. Heals 16 HP.', heal: 16 },
  // B-Tier (Rebalanced: potent strikes, spread shields, deep restoration)
  { id: 'alex_b1', name: 'Hypnotic Durp', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Stares into the enemy soul. Deals 22 damage.', damage: 22 },
  { id: 'alex_b2', name: 'Pink Cloud Shield', tier: 'B', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Releases a soothing pink mist. All allies gain 12 Shield.', block: 12 },
  { id: 'alex_b3', name: 'Axolotl Restoration', tier: 'B', cost: 2, type: 'heal', target: 'around_ally', aoeType: 'around', description: 'Legendary amphibian healing aura! Heals 36 total Around HP split between target and adjacent allies.', heal: 36 },
  // A-Tier (S and A kept same EXCEPT AoE attacks and heals updated to total damage/heal pool)
  { id: 'alex_a1', name: 'Telepathic Durp', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Radiates strange mental waves! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'alex_a2', name: 'Invulnerable Derp', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Completely unbothered by physics. Gain 22 Shield.', block: 22 },
  { id: 'alex_a3', name: 'Mind Static', tier: 'A', cost: 3, type: 'debuff', target: 'single_enemy', description: 'Scrambles enemy brain with derp thoughts. Deals 10 damage and inflicts Brain Damage!', damage: 10, brainDamage: true },
  // S-Tier (S and A kept same EXCEPT AoE attacks and heals updated to 60 total pool)
  { id: 'alex_s1', name: 'Strokenosis', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', specialActionId: 'strokenosis', description: 'MIND CONTROL: Choose 1 of opponent hand cards to force-play! Alex knows the stuffy owner and card tier.' },
  { id: 'alex_s2', name: 'Ascended Axolotl', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Alex transcends into cosmic fluff! Heals 60 total Spread HP split between allies and grants 12 Shield to all.', heal: 60, block: 12 },
  { id: 'alex_s3', name: 'Durp Cataclysm', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'The entire battlefield collapses into absurdity! Deals 60 total Spread damage split between all enemies.', damage: 60 },
]);

// 2. Jefe (Blue Penguin)
const JEFE_CARDS: Card[] = createStuffyCardSet('jefe', [
  // F-Tier (Rebalanced)
  { id: 'jefe_f1', name: 'Pudge Waddling', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Waddles forward with commanding heft. Deals 9 damage.', damage: 9 },
  { id: 'jefe_f2', name: 'Deny Being Fat', tier: 'F', cost: 1, type: 'defense', target: 'self', description: '"I am NOT fat! I am pudge!" Gain 9 Shield.', block: 9 },
  { id: 'jefe_f3', name: 'Chilly Gust', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Flaps wings creating icy gusts. Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier (Rebalanced)
  { id: 'jefe_d1', name: 'Belly Slide', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Slides along on smooth belly feathers! Deals 13 damage.', damage: 13 },
  { id: 'jefe_d2', name: 'Down Feather Coat', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Puffs up thick Antarctic down feathers. Gain 13 Shield.', block: 13 },
  { id: 'jefe_d3', name: 'Fish Snack Break', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Shares a chilled fish fillet. Heals 12 HP.', heal: 12 },
  // C-Tier (Rebalanced)
  { id: 'jefe_c1', name: 'Heavy Flipper Swat', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'A hefty wing swat delivered with royal dignity! Deals 16 damage.', damage: 16 },
  { id: 'jefe_c2', name: 'Glacier Guard', tier: 'C', cost: 2, type: 'defense', target: 'around_ally', aoeType: 'around', description: 'Erects an ice barricade protecting target and nearby allies. Gain 15 Shield.', block: 15 },
  { id: 'jefe_c3', name: 'Subzero Shiver', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Chilling Antarctic squall! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier (Rebalanced)
  { id: 'jefe_b1', name: 'Pudge Trample', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Charges forward with full royal bulk! Deals 22 damage.', damage: 22 },
  { id: 'jefe_b2', name: 'Emperor Fortress', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Dense pudge fortress. Gain 20 Shield.', block: 20 },
  { id: 'jefe_b3', name: 'Blizzard Squall', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Howling snowstorm blankets all foes! Deals 38 total Spread damage split between all enemies.', damage: 38 },
  // A-Tier
  { id: 'jefe_a1', name: '"WHO CALLED ME FAT?!"', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Pure enraged fury! Deals 26 damage to the insulter.', damage: 26 },
  { id: 'jefe_a2', name: 'Pudge Megaton Drop', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Jumps high and slams down with royal weight! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'jefe_a3', name: 'Royal Igloo', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Covers all allies in an icy dome. Grants 14 Shield to entire team.', block: 14 },
  // S-Tier
  { id: 'jefe_s1', name: 'Earthquake', tier: 'S', cost: 5, type: 'special', target: 'all_enemies', aoeType: 'spread', specialActionId: 'earthquake', description: 'Massive AOE (60 total Spread damage split among enemies)! 75% chance each enemy falls in a crack: 50% miss, take 2x dmg until discarding matching card!', damage: 60 },
  { id: 'jefe_s2', name: 'Avalanche Wrath', tier: 'S', cost: 4, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Summons an unstoppable snowslide! Deals 60 total Around damage split between target and adjacent enemies.', damage: 60 },
  { id: 'jefe_s3', name: 'Ice Age Emperor', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'All allies gain 20 Shield and team heals 60 total Spread HP split between allies.', block: 20, heal: 60 },
]);

// 3. Finlee (Blue Orca)
const FINLEE_CARDS: Card[] = createStuffyCardSet('finlee', [
  // F-Tier
  { id: 'finlee_f1', name: 'Fin Flap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Splashes water with tail fluke. Deals 9 damage.', damage: 9 },
  { id: 'finlee_f2', name: 'Blubber Cushion', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Absorbs shock with thick plush blubber. Gain 9 Shield.', block: 9 },
  { id: 'finlee_f3', name: 'Splash Surge', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Splashes surrounding foes! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'finlee_d1', name: 'Plush Nibble', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', lifesteal: true, description: 'Nibbles a corner. Deals 12 damage with Lifesteal.', damage: 12 },
  { id: 'finlee_d2', name: 'Deep Dive Guard', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Dives beneath waves. Gain 13 Shield.', block: 13 },
  { id: 'finlee_d3', name: 'Krill Snack', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Eats a school of krill. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'finlee_c1', name: 'Apex Bite', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', lifesteal: true, description: 'Chomps with sharp cloth teeth. Deals 15 damage with Lifesteal.', damage: 15 },
  { id: 'finlee_c2', name: 'Wave Wall', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Erects an ocean swell. All allies gain 10 Shield.', block: 10 },
  { id: 'finlee_c3', name: 'Fluke Breaker', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Heavy tail smash! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'finlee_b1', name: 'Feeding Frenzy', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', lifesteal: true, description: 'Furious eating attack. Deals 20 damage with Lifesteal.', damage: 20 },
  { id: 'finlee_b2', name: 'Tsunami Breach', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Breaches high and lands hard! Deals 38 total Spread damage split between all enemies.', damage: 38 },
  { id: 'finlee_b3', name: 'Orca Hide', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Tough aquatic skin. Gain 19 Shield.', block: 19 },
  // A-Tier
  { id: 'finlee_a1', name: 'Gluttonous Feast', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', lifesteal: true, description: 'Huge chomp! Deals 24 damage with 100% lifesteal.', damage: 24 },
  { id: 'finlee_a2', name: 'Ocean Apex Roar', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', lifesteal: true, description: 'Deals 45 total Around damage split between target and adjacent enemies and lifesteals the total dealt!', damage: 45 },
  { id: 'finlee_a3', name: 'Vortex Trap', tier: 'A', cost: 3, type: 'debuff', target: 'single_enemy', description: 'Pulls enemy into whirlpool. Deals 15 damage and disables them for a turn.', damage: 15, brainDamage: true },
  // S-Tier
  { id: 'finlee_s1', name: 'Swallow Whole', tier: 'S', cost: 5, type: 'special', target: 'single_enemy', specialActionId: 'swallow_whole', description: 'EATS TARGET ENEMY WHOLE! Target takes 45 lethal damage. CANNOT BE RESTITCHED. Finlee heals for that amount!' },
  { id: 'finlee_s2', name: 'Maelstrom Devourer', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', lifesteal: true, description: 'Engulfs all enemies in a titanic wave! Deals 60 total Spread damage split between all enemies, healing Finlee for total dealt.', damage: 60 },
  { id: 'finlee_s3', name: 'Leviathan Hunger', tier: 'S', cost: 3, type: 'utility', target: 'self', description: 'Finlee gains +20 Max HP and full heals to maximum stuffing.', heal: 50 },
]);

// 4. Fifi (Red Fox)
const FIFI_CARDS: Card[] = createStuffyCardSet('fifi', [
  // F-Tier
  { id: 'fifi_f1', name: 'Little Toot', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', poison: 2, description: 'A tiny stinky fart. Deals 8 damage and inflicts 2 Poison.', damage: 8 },
  { id: 'fifi_f2', name: 'Fox Crouch', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Crouches in dense grass. Gain 9 Shield.', block: 9 },
  { id: 'fifi_f3', name: 'Stinky Prowl', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', poison: 1, description: 'Releases a puff of gas! Deals 18 total Around damage split between target and adjacent enemies and 1 Poison.', damage: 18 },
  // D-Tier
  { id: 'fifi_d1', name: 'Smelly Pounce', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', poison: 3, description: 'Pounces with smelly gas. Deals 12 damage and 3 Poison.', damage: 12 },
  { id: 'fifi_d2', name: 'Chubby Roll', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Rolls away like a round fluffy ball. Gain 12 Shield.', block: 12 },
  { id: 'fifi_d3', name: 'Snack N Sniff', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Chews on forest treats. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'fifi_c1', name: 'Stinky Cloud', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', poison: 3, description: 'Releases a foul fog! Deals 30 total Around damage split between target and adjacent enemies and 3 Poison.', damage: 30 },
  { id: 'fifi_c2', name: 'Red Fur Barrier', tier: 'C', cost: 2, type: 'defense', target: 'around_ally', aoeType: 'around', description: 'Dense red fur protects nearby allies. Gain 13 Shield.', block: 13 },
  { id: 'fifi_c3', name: 'Toxic Scratch', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', poison: 4, description: 'Sharp claws coated in scent glands. Deals 15 damage and 4 Poison.', damage: 15 },
  // B-Tier
  { id: 'fifi_b1', name: 'Rip-Roaring Rip', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', poison: 5, description: 'Massive gas explosion! Deals 20 damage and 5 Poison.', damage: 20 },
  { id: 'fifi_b2', name: 'Pungent Haze', tier: 'B', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Toxic smokescreen hides team. All allies gain 12 Shield.', block: 12 },
  { id: 'fifi_b3', name: 'Miasma Spray', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', poison: 3, description: 'Envelops all foes in noxious fumes! Deals 38 total Spread damage split between all enemies and 3 Poison.', damage: 38 },
  // A-Tier
  { id: 'fifi_a1', name: 'Toxic Gas Prowl', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', poison: 5, description: 'Prowls through dense smog. Deals 45 total Around damage split between target and adjacent enemies and 5 Poison.', damage: 45 },
  { id: 'fifi_a2', name: 'Sulfur Bomb', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', poison: 7, description: 'Concentrated stank bomb! Deals 15 damage and 7 Poison.', damage: 15 },
  { id: 'fifi_a3', name: 'Chubby Gas Armor', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Envelops self in dense green fumes. Gain 20 Shield.', block: 20 },
  // S-Tier
  { id: 'fifi_s1', name: 'Supernova Flatulence', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', aoeType: 'spread', poison: 10, description: 'THE MOTHER OF ALL FARTS! Deals 60 total Spread damage split between all enemies and 10 Poison DoT!', damage: 60 },
  { id: 'fifi_s2', name: 'Miasma Catastrophe', tier: 'S', cost: 4, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Doubles all poison counters on target and adjacent enemies, then deals 60 total Around damage split between them!', damage: 60 },
  { id: 'fifi_s3', name: 'Fox Den Sanctuary', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'All allies heal 60 total Spread HP split between allies and gain 14 Shield behind a pungent perimeter.', heal: 60, block: 14 },
]);

// 5. Thumper (Grey Hammerhead)
const THUMPER_CARDS: Card[] = createStuffyCardSet('thumper', [
  // F-Tier
  { id: 'thumper_f1', name: 'Bonk', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A mild head tap. Deals 9 damage.', damage: 9 },
  { id: 'thumper_f2', name: 'Wide Head Deflect', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Angles wide hammerhead. Gain 9 Shield.', block: 9 },
  { id: 'thumper_f3', name: 'Rumble Thump', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Thumps the turf! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'thumper_d1', name: 'Heavy Whack', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Solid hit with heavy snout. Deals 13 damage.', damage: 13 },
  { id: 'thumper_d2', name: 'Shark Fin Parry', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Parries with dorsal fin. Gain 12 Shield.', block: 12 },
  { id: 'thumper_d3', name: 'Taco Crunch', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Crunches on hard taco. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'thumper_c1', name: 'Double Thump', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Left and right head strike! Deals 16 damage.', damage: 16 },
  { id: 'thumper_c2', name: 'Steel Head Guard', tier: 'C', cost: 2, type: 'defense', target: 'around_ally', aoeType: 'around', description: 'Intercepts blows for adjacent friends. Gain 14 Shield.', block: 14 },
  { id: 'thumper_c3', name: 'Ground Pound', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Slams head into the ground! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'thumper_b1', name: 'Concussion Strike', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Ringing strike to the head. Deals 22 damage.', damage: 22 },
  { id: 'thumper_b2', name: 'Hammerhead Bulwark', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Dense grey cartilage wall. Gain 20 Shield.', block: 20 },
  { id: 'thumper_b3', name: 'Thump Resonance', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Vibrating shockwave across the entire floor! Deals 38 total Spread damage split between all enemies.', damage: 38 },
  // A-Tier
  { id: 'thumper_a1', name: 'Brain Damage', tier: 'A', cost: 3, type: 'debuff', target: 'single_enemy', brainDamage: true, description: 'Cracking concussion! Deals 16 damage and BRAIN DAMAGES target: disabled until healed!', damage: 16 },
  { id: 'thumper_a2', name: 'Sledgehammer Smash', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Massive full-force slam. Deals 27 damage.', damage: 27 },
  { id: 'thumper_a3', name: 'Unbreakable Skull', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Gain 24 Shield and reflect 8 damage back at attackers.', block: 24 },
  // S-Tier
  { id: 'thumper_s1', name: 'Cranial Earthquake', tier: 'S', cost: 4, type: 'attack', target: 'around_enemy', aoeType: 'around', brainDamage: true, description: 'Titanic head smash! Deals 60 total Around damage split between target and adjacent enemies, and brain damages the primary target!', damage: 60 },
  { id: 'thumper_s2', name: 'Mega Thump Extermination', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Target is driven 6 feet into the ground. Deals 42 damage!', damage: 42 },
  { id: 'thumper_s3', name: 'Titanium Hammer Stance', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'All allies gain 18 Shield and 50% damage reduction for 1 turn.', block: 18 },
]);

// 6. Toothless / Lessteeth (Darkwing Dragon)
const TOOTHLESS_CARDS: Card[] = createStuffyCardSet('toothless', [
  // F-Tier
  { id: 'toothless_f1', name: 'Tiny Plasma Spark', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A small neon blue flame. Deals 9 damage.', damage: 9 },
  { id: 'toothless_f2', name: 'Wing Wrap', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Folds dark leather wings tight. Gain 9 Shield.', block: 9 },
  { id: 'toothless_f3', name: 'Plasma Poo Puff', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Spits a burst of blue plasma! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'toothless_d1', name: 'Plasma Poo Pellet', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Drops a concentrated plasma poo pellet. Deals 13 damage.', damage: 13 },
  { id: 'toothless_d2', name: 'Dark Dragon Scale', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Sleek black scales deflect incoming fire. Gain 12 Shield.', block: 12 },
  { id: 'toothless_d3', name: 'Salmon Gulp', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Swallows whole fresh fish. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'toothless_c1', name: 'Dive-Bomb Plasma', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Screaming dive with blue blast! Deals 16 damage.', damage: 16 },
  { id: 'toothless_c2', name: 'Smoke Shroud', tier: 'C', cost: 2, type: 'defense', target: 'around_ally', aoeType: 'around', description: 'Black dragon smoke shields nearby friends. Gain 14 Shield.', block: 14 },
  { id: 'toothless_c3', name: 'Tail Whip Sweep', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Spins prosthetic tail fin! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'toothless_b1', name: 'Explosive Plasma Poo', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Fiery dragon ordnance! Deals 22 damage.', damage: 22 },
  { id: 'toothless_b2', name: 'Supersonic Stealth', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Blends into the night sky. Gain 20 Shield.', block: 20 },
  { id: 'toothless_b3', name: 'Cluster Poo Bomb', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Scatters plasma poos across the entire field! Deals 38 total Spread damage split between all enemies.', damage: 38 },
  // A-Tier
  { id: 'toothless_a1', name: 'Alpha Dragon Blast', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Charged blue inferno. Deals 28 damage.', damage: 28 },
  { id: 'toothless_a2', name: 'Lightning Dive Bomb', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Cloaked in blue lightning! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'toothless_a3', name: 'Night Cloak', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Gain 22 Shield and Lessteeth dodges next attack.', block: 22 },
  // S-Tier
  { id: 'toothless_s1', name: 'Colossal Plasma Poo Barrage', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', aoeType: 'spread', description: 'Total carpet bombing of neon plasma! Deals 60 total Spread damage split between all enemies and scorches field.', damage: 60 },
  { id: 'toothless_s2', name: 'Alpha Mode Awakening', tier: 'S', cost: 4, type: 'utility', target: 'self', description: 'Spines glow neon blue. Lessteeth gains 30 Shield and next attack deals triple damage!', block: 30 },
  { id: 'toothless_s3', name: 'Dragon King Inferno', tier: 'S', cost: 5, type: 'attack', target: 'single_enemy', description: 'Unleashes the full wrath of the ancient dragons. Deals 45 catastrophic damage!', damage: 45 },
]);

// 7. Ralou / Riolu (Aura Pup - Dedicated Healer)
const RIOLU_CARDS: Card[] = createStuffyCardSet('riolu', [
  // F-Tier
  { id: 'riolu_f1', name: 'Gentle Aura Touch', tier: 'F', cost: 1, type: 'heal', target: 'single_ally', description: 'A mild pulse of warm aura. Heals 9 HP.', heal: 9 },
  { id: 'riolu_f2', name: 'Aura Barrier', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Blue aura shield. Gain 9 Shield.', block: 9 },
  { id: 'riolu_f3', name: 'Pup Training Jab', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A spirited training jab. Deals 9 damage.', damage: 9 },
  // D-Tier
  { id: 'riolu_d1', name: 'Life Pulse', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Sends a wave of warm light. Heals 13 HP.', heal: 13 },
  { id: 'riolu_d2', name: 'Aura Deflect', tier: 'D', cost: 1, type: 'defense', target: 'single_ally', description: 'Shields a teammate with blue aura. Grants 12 Shield.', block: 12 },
  { id: 'riolu_d3', name: 'Aura Palm', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Focuses fighting spirit into palm. Deals 13 damage.', damage: 13 },
  // C-Tier
  { id: 'riolu_c1', name: 'Aura Mend', tier: 'C', cost: 2, type: 'heal', target: 'single_ally', description: 'Channeled healing. Restores 17 HP to an ally.', heal: 17 },
  { id: 'riolu_c2', name: 'Team Radiance', tier: 'C', cost: 2, type: 'heal', target: 'around_ally', aoeType: 'around', description: 'Aura washes over nearby friends! Heals 30 total Around HP split between target and adjacent allies.', heal: 30 },
  { id: 'riolu_c3', name: 'Vacuum Wave', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Swirling blue wave! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'riolu_b1', name: 'Rejuvenating Wave', tier: 'B', cost: 2, type: 'heal', target: 'single_ally', description: 'High-power aura infusion. Heals 23 HP.', heal: 23 },
  { id: 'riolu_b2', name: 'Aura Sanctuary', tier: 'B', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Domes the party in light. All allies gain 12 Shield.', block: 12 },
  { id: 'riolu_b3', name: 'Aura Restitch', tier: 'B', cost: 2, type: 'restitch', target: 'unstuffed_ally', canRevive: true, description: 'Revives an unstuffed ally with 20 HP!', heal: 20 },
  // A-Tier
  { id: 'riolu_a1', name: 'Greater Aura Revival', tier: 'A', cost: 3, type: 'restitch', target: 'unstuffed_ally', canRevive: true, description: 'Pours life aura into fallen stuffy. Revives with 35 HP!', heal: 35 },
  { id: 'riolu_a2', name: 'Full Team Blessing', tier: 'A', cost: 3, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Restores 45 total Spread HP split between all allies and removes all negative status effects!', heal: 45 },
  { id: 'riolu_a3', name: 'Aura Sphere', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Never-miss aura projectile. Deals 24 damage.', damage: 24 },
  // S-Tier
  { id: 'riolu_s1', name: 'Miracle of the Aura', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Heals 60 total Spread HP split between all allies and grants 15 Shield to all!', heal: 60, block: 15 },
  { id: 'riolu_s2', name: 'Twin Soul Restitch', tier: 'S', cost: 4, type: 'restitch', target: 'all_allies', canRevive: true, description: 'Breathes life into all unstuffed teammates! Revives any fallen ally with 25 HP!', heal: 25 },
  { id: 'riolu_s3', name: 'Aura Overcharge Cannon', tier: 'S', cost: 4, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Converts positive healing energy into offensive brilliance! Deals 60 total Around damage split between target and adjacent enemies.', damage: 60 },
]);

// 8. Eevee / Eavie (Creepy Lasers & Missiles)
const EEVEE_CARDS: Card[] = createStuffyCardSet('eevee', [
  // F-Tier
  { id: 'eevee_f1', name: 'Creepy Gaze', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Unblinking red eyes stare. Deals 9 damage.', damage: 9 },
  { id: 'eevee_f2', name: 'Fluffy Static', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Static fur sparks defensively. Gain 9 Shield.', block: 9 },
  { id: 'eevee_f3', name: 'Mini Spark Spray', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Fires twin red lasers! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'eevee_d1', name: 'Micro Laser', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Fires a thin scarlet laser beam. Deals 13 damage.', damage: 13 },
  { id: 'eevee_d2', name: 'Hologram Shield', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Creepy geometric ward. Gain 12 Shield.', block: 12 },
  { id: 'eevee_d3', name: 'Occult Candy Snack', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Munches starlight candy. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'eevee_c1', name: 'Creepy Eye Laser', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Twin crimson death rays from eyes. Deals 16 damage.', damage: 16 },
  { id: 'eevee_c2', name: 'Quantum Mane Barrier', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Glitches reality! All allies gain 10 Shield.', block: 10 },
  { id: 'eevee_c3', name: 'Micro Homing Darts', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Tiny missiles fly around! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'eevee_b1', name: 'Plushie Homing Missiles', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Back pops open with rocket tubes! Deals 22 damage.', damage: 22 },
  { id: 'eevee_b2', name: 'Psychic Distortion', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Phases out of physical reality. Gain 19 Shield.', block: 19 },
  { id: 'eevee_b3', name: 'Creepy Laugh Bomb', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Disturbing laughter blasts all foes! Deals 38 total Spread damage split between all enemies.', damage: 38 },
  // A-Tier
  { id: 'eevee_a1', name: 'Orbital Strike Laser', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Calls down a satellite beam. Deals 28 damage.', damage: 28 },
  { id: 'eevee_a2', name: 'Missile Swarm Hellfire', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Fires 12 guided missiles! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'eevee_a3', name: 'Creepy Cyber Ward', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Matrix barrier. Grants 14 Shield to entire party.', block: 14 },
  // S-Tier
  { id: 'eevee_s1', name: 'Macabre Death Cannon', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', description: 'Opens its chest to reveal a terrifying particle weapon. Deals 44 laser damage!', damage: 44 },
  { id: 'eevee_s2', name: 'Apocalyptic Missile Salvo', tier: 'S', cost: 5, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Blankets entire enemy side in explosions! Deals 60 total Spread damage split between all enemies.', damage: 60 },
  { id: 'eevee_s3', name: 'Creepy Reality Glitch', tier: 'S', cost: 3, type: 'utility', target: 'self', description: 'Glitch out: Gain 25 Shield and draw 3 bonus cards immediately!', block: 25 },
]);

// 9. Slugmee (Murder Melodist Slug)
const SLUGMEE_CARDS: Card[] = createStuffyCardSet('slugmee', [
  // F-Tier
  { id: 'slugmee_f1', name: 'Humming a Tune', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Hums softly while creeping forward. Deals 8 damage.', damage: 8 },
  { id: 'slugmee_f2', name: 'Slime Coat', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Coats self in yellow goo. Gain 9 Shield.', block: 9 },
  { id: 'slugmee_f3', name: 'Goo Splash', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Splashes yellow goo! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'slugmee_d1', name: 'Sticky Song', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Sings a sticky chorus. Deals 13 damage.', damage: 13 },
  { id: 'slugmee_d2', name: 'Mucus Cocoon', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Hides in mucus shell. Gain 12 Shield.', block: 12 },
  { id: 'slugmee_d3', name: 'Sugar Leaf Bite', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Eats sweet foliage. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'slugmee_c1', name: 'Creepy Chorus', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Eerie harmonies! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  { id: 'slugmee_c2', name: 'Sticky Slime Wall', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Slimes the floor. All allies gain 10 Shield.', block: 10 },
  { id: 'slugmee_c3', name: 'Slime Acid Lash', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Acidic slime whip. Deals 16 damage.', damage: 16 },
  // B-Tier
  { id: 'slugmee_b1', name: 'Deadly Lullaby', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'A song that puts plushies to sleep. Deals 22 damage.', damage: 22 },
  { id: 'slugmee_b2', name: 'Yellow Gel Barrier', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Thick yellow gel armor. Gain 20 Shield.', block: 20 },
  { id: 'slugmee_b3', name: 'Slug Sacrifice Heal', tier: 'B', cost: 2, type: 'heal', target: 'single_ally', description: 'Slugmee loses 5 HP to heal an ally for 24 HP!', heal: 24 },
  // A-Tier
  { id: 'slugmee_a1', name: 'Murder Hug', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Squishes an enemy tightly. Deals 25 damage.', damage: 25 },
  { id: 'slugmee_a2', name: 'Melodic Resonance', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'A piercing scream song! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'slugmee_a3', name: 'Slug Slime Shield', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'All allies gain 15 Shield and 5 counter-damage.', block: 15 },
  // S-Tier
  { id: 'slugmee_s1', name: 'Slug Me, Slug You, Now I\'m Gonna Hug You', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', specialActionId: 'slug_hug', canRevive: true, description: 'THE DEADLY SONG: Slugmee takes 10 damage (if killed, stops!). Deals 35 damage to target, heals self for 20, and revives 1 fallen ally with 20 HP!' },
  { id: 'slugmee_s2', name: 'Symphony of the Slime', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', canRevive: true, description: 'Sings the ultimate lullaby! Revives fallen allies with 25 HP and heals active allies for 60 total Spread HP split among them.', heal: 60 },
  { id: 'slugmee_s3', name: 'Toxic Yellow Maw', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Engulfs target in yellow digestive enzymes. Deals 40 damage.', damage: 40 },
]);

// 10. Beaker (Yosemite Owl)
const BEAKER_CARDS: Card[] = createStuffyCardSet('beaker', [
  // F-Tier
  { id: 'beaker_f1', name: 'Wise Hoot', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Hoo hoo! A sharp auditory snap. Deals 9 damage.', damage: 9 },
  { id: 'beaker_f2', name: 'Feather Fluff', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Puffs brown feathers. Gain 9 Shield.', block: 9 },
  { id: 'beaker_f3', name: 'Wind Flutter', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Flaps wings! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'beaker_d1', name: 'Gliding Strike', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Glides in silently from above. Deals 13 damage.', damage: 13 },
  { id: 'beaker_d2', name: 'Owl Roost', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Perches securely on granite branches. Gain 12 Shield.', block: 12 },
  { id: 'beaker_d3', name: 'Cricket Feast', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Munches Yosemite crickets. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'beaker_c1', name: 'Silent Dive', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Swoops silently from high branches. Deals 16 damage.', damage: 16 },
  { id: 'beaker_c2', name: 'Wing Gale', tier: 'C', cost: 2, type: 'defense', target: 'around_ally', aoeType: 'around', description: 'Flaps strong wings over squad. Gain 14 Shield.', block: 14 },
  { id: 'beaker_c3', name: 'Pine Needle Swirl', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Swirling needles and wind! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'beaker_b1', name: 'Yosemite Talon Slash', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Ripping granite talons! Deals 22 damage.', damage: 22 },
  { id: 'beaker_b2', name: 'Granite Wall Perch', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Steely Yosemite granite guard. Gain 20 Shield.', block: 20 },
  { id: 'beaker_b3', name: 'Owl Night Vision', tier: 'B', cost: 2, type: 'utility', target: 'none', description: 'Reveals all enemy intentions and draws 2 cards.', block: 6 },
  // A-Tier
  { id: 'beaker_a1', name: 'El Capitan Dive Bomb', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Plummets from the top of El Capitan! Deals 28 damage.', damage: 28 },
  { id: 'beaker_a2', name: 'Half Dome Cyclone', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Vortex of pine needles and wind! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'beaker_a3', name: 'Ancient Forest Wisdom', tier: 'A', cost: 3, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Restores 45 total Spread HP split between all allies and boosts Beaker passive regen to +3 HP/turn!', heal: 45 },
  // S-Tier
  { id: 'beaker_s1', name: 'Cataclysmic Yosemite Dive', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', description: 'Terminal velocity dive bomb! Deals 42 damage and stuns the target!', damage: 42 },
  { id: 'beaker_s2', name: 'Spirit of the National Park', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'All allies gain 20 Shield, +2 Crackers, and Beaker heals to full HP!', block: 20 },
  { id: 'beaker_s3', name: 'Nocturnal Apex Predator', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Sweeps through darkness across all targets! Deals 60 total Spread damage split between all enemies.', damage: 60 },
]);

// 11. Henry (Baby Turtle - Potty Tank)
const HENRY_CARDS: Card[] = createStuffyCardSet('henry', [
  // F-Tier
  { id: 'henry_f1', name: 'Potty Squirm', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Squirms urgently with shell. Deals 8 damage.', damage: 8 },
  { id: 'henry_f2', name: 'Tiny Shell Hide', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Pulls head into shell. Gain 9 Shield.', block: 9 },
  { id: 'henry_f3', name: 'Toddler Splash', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Kicks bath water! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'henry_d1', name: 'Diaper Clatter', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Safety pin armor. Gain 13 Shield.', block: 13 },
  { id: 'henry_d2', name: 'Toddler Bump', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Bumps into foe with solid shell. Deals 13 damage.', damage: 13 },
  { id: 'henry_d3', name: 'Lettuce Nibble', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Eats a crisp lettuce leaf. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'henry_c1', name: '"I GOTTA GO POTTY!"', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Frantic potty charge! Deals 16 damage.', damage: 16 },
  { id: 'henry_c2', name: 'Shell Guard', tier: 'C', cost: 2, type: 'defense', target: 'around_ally', aoeType: 'around', description: 'Protects brother or friend with shell. Gain 15 Shield.', block: 15 },
  { id: 'henry_c3', name: 'Baby Tantrum', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Flails flippers furiously! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'henry_b1', name: 'Heavy Baby Slam', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Slams shell with surprisingly high mass! Deals 22 damage.', damage: 22 },
  { id: 'henry_b2', name: 'Fortified Shell', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Hardens shell plates. Gain 22 Shield.', block: 22 },
  { id: 'henry_b3', name: 'Potty Emergency Taunt', tier: 'B', cost: 2, type: 'utility', target: 'all_enemies', taunt: true, description: 'Loudly yells! Taunts enemies to hit Henry, and Henry gains 14 Shield.', block: 14 },
  // A-Tier
  { id: 'henry_a1', name: 'Shell Up', tier: 'A', cost: 3, type: 'special', target: 'self', specialActionId: 'shell_up', taunt: true, description: 'TAUNTS ALL ENEMIES! Henry forces all enemies to attack him, but takes 75% LESS DAMAGE for 1 turn! Gain 15 Shield.', block: 15 },
  { id: 'henry_a2', name: 'Unbreakable Diaper Pin', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Pin locks into place. Gain 28 Shield.', block: 28 },
  { id: 'henry_a3', name: 'Turtle Family Barrier', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Covers entire team in protective turtle shells. All allies gain 16 Shield.', block: 16 },
  // S-Tier
  { id: 'henry_s1', name: 'Indestructible Potty Bunker', tier: 'S', cost: 4, type: 'defense', target: 'self', taunt: true, description: 'Henry locks himself in the ultimate ceramic shell! Gain 40 Shield, taunt all enemies, take 85% reduced damage!', block: 40 },
  { id: 'henry_s2', name: 'Baby Turtle Stampede', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Henry leads a tidal surge of baby turtles! Deals 60 total Spread damage split between all enemies.', damage: 60 },
  { id: 'henry_s3', name: 'Potty Time Catastrophe', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'He couldn\'t hold it any longer! Unleashes 40 apocalyptic pressurized damage!', damage: 40 },
]);

// 12. Dear (Mini Poison Dart Frog)
const DEAR_CARDS: Card[] = createStuffyCardSet('dear', [
  // F-Tier
  { id: 'dear_f1', name: 'Micro Ribbit', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Tiny squeaky ribbit. Deals 8 damage.', damage: 8 },
  { id: 'dear_f2', name: 'Dewdrop Hop', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Hops onto a leaf. Gain 9 Shield.', block: 9 },
  { id: 'dear_f3', name: 'Toxin Spray', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', poison: 1, description: 'Tiny spray of skin toxin! Deals 18 total Around damage split between target and adjacent enemies and 1 Poison.', damage: 18 },
  // D-Tier
  { id: 'dear_d1', name: 'Dart Tongue Flick', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', poison: 2, description: 'Fast tongue snap. Deals 12 damage and 2 Poison.', damage: 12 },
  { id: 'dear_d2', name: 'Slippery Blue Skin', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Very hard to grab. Gain 12 Shield.', block: 12 },
  { id: 'dear_d3', name: 'Fly Munch', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Catches a fly. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'dear_c1', name: 'Poison Dart Spit', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', poison: 3, description: 'Shoots a bead of frog toxin. Deals 15 damage and 3 Poison.', damage: 15 },
  { id: 'dear_c2', name: 'Camouflage Leaf', tier: 'C', cost: 2, type: 'defense', target: 'around_ally', aoeType: 'around', description: 'Hides nearby friends. Gain 13 Shield.', block: 13 },
  { id: 'dear_c3', name: 'Toxic Puddle', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', poison: 2, description: 'Cyan poison puddles! Deals 30 total Around damage split between target and adjacent enemies and 2 Poison.', damage: 30 },
  // B-Tier
  { id: 'dear_b1', name: 'Cyan Dart Lash', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', poison: 4, description: 'Whips with venomous tongue. Deals 20 damage and 4 Poison.', damage: 20 },
  { id: 'dear_b2', name: 'Neurotoxin Skin', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Skin gleams with poison. Gain 19 Shield; attackers gain 2 Poison.', block: 19 },
  { id: 'dear_b3', name: 'Rainforest Mist', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', poison: 2, description: 'Vaporizes toxin across all foes! Deals 38 total Spread damage split between all enemies and 2 Poison.', damage: 38 },
  // A-Tier
  { id: 'dear_a1', name: 'Golden Batrachotoxin', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', poison: 7, description: 'The deadliest toxin in nature! Deals 14 damage and 7 Poison DoT.', damage: 14 },
  { id: 'dear_a2', name: 'Toxic Rainforest Rain', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', poison: 4, description: 'Cyan mist coats nearby foes! Deals 45 total Around damage split between target and adjacent enemies and 4 Poison.', damage: 45 },
  { id: 'dear_a3', name: 'Micro-Frog Evasion', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Too small to hit! Gain 24 Shield and 50% dodge chance.', block: 24 },
  // S-Tier
  { id: 'dear_s1', name: 'Lethal Dart Epidemic', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', aoeType: 'spread', poison: 10, description: 'Explosive blast of pure Amazonian dart toxin! Deals 60 total Spread damage split between all enemies and 10 Poison!', damage: 60 },
  { id: 'dear_s2', name: 'Cyan Ghost Strike', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Blinks behind target and delivers a paralyzing sting. Deals 38 damage and stuns.', damage: 38 },
  { id: 'dear_s3', name: 'Jungle Oasis Rebirth', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Purifies the jungle! All allies heal 60 total Spread HP split between allies and gain 14 Shield.', heal: 60, block: 14 },
]);

// 13. Cole (Mini Turtle - Toddler Spinner)
const COLE_CARDS: Card[] = createStuffyCardSet('cole', [
  // F-Tier
  { id: 'cole_f1', name: 'Toddler Wobble', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Wobbles forward clumsily. Deals 9 damage.', damage: 9 },
  { id: 'cole_f2', name: 'Mini Shell Tuck', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Tucks into mini green shell. Gain 9 Shield.', block: 9 },
  { id: 'cole_f3', name: 'Spin Flurry', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Spins in place! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'cole_d1', name: 'Toddler Spin', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Spins around on belly shell. Deals 13 damage.', damage: 13 },
  { id: 'cole_d2', name: 'Hard Shell Clatter', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Snaps shell tight. Gain 12 Shield.', block: 12 },
  { id: 'cole_d3', name: 'Kiwi Nibble', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Munches juicy kiwi. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'cole_c1', name: 'Spinning Shell Toss', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Launches spinning shell like a hockey puck. Deals 16 damage.', damage: 16 },
  { id: 'cole_c2', name: 'Brotherly Barrier', tier: 'C', cost: 2, type: 'defense', target: 'around_ally', aoeType: 'around', description: 'Shields nearby friends with 14 Shield.', block: 14 },
  { id: 'cole_c3', name: 'Shell Ricochet', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Bounces off nearby foes! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'cole_b1', name: 'Turbo Spin Attack', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'High-speed drill spin! Deals 22 damage.', damage: 22 },
  { id: 'cole_b2', name: 'Turtle Shell Phalanx', tier: 'B', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'All allies gain 12 Shield.', block: 12 },
  { id: 'cole_b3', name: 'Armored Roll', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Deals 14 damage and Cole gains 12 Shield.', damage: 14, block: 12 },
  // A-Tier
  { id: 'cole_a1', name: 'Toddler Bowling Ball', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Spins through enemy pins! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'cole_a2', name: 'Unbreakable Mini Shell', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Completely invulnerable stance. Gain 26 Shield.', block: 26 },
  { id: 'cole_a3', name: 'Brotherly Synergy', tier: 'A', cost: 3, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Heals 45 total Spread HP split between allies and grants 12 Shield.', heal: 45, block: 12 },
  // S-Tier
  { id: 'cole_s1', name: 'Super Sonic Shell Storm', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', aoeType: 'spread', description: 'Spins at Mach 3! Deals 60 total Spread damage split between all enemies and leaves Cole with 20 Shield.', damage: 60, block: 20 },
  { id: 'cole_s2', name: 'Fortress of the Mini Turtles', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'All allies gain 22 Shield and reflect 50% damage back to attackers for 1 turn.', block: 22 },
  { id: 'cole_s3', name: 'Giga Shell Impact', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Direct rocket shell impact. Deals 42 crushing damage!', damage: 42 },
]);

// 14. Joann (Brown Cat - Table Disrupter)
const JOANN_CARDS: Card[] = createStuffyCardSet('joann', [
  // F-Tier
  { id: 'joann_f1', name: 'Bored Paw Swat', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A half-hearted swat. Deals 9 damage.', damage: 9 },
  { id: 'joann_f2', name: 'Feline Loaf', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Tucks paws under chest. Gain 9 Shield.', block: 9 },
  { id: 'joann_f3', name: 'Table Swat', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Swats a glass off the counter! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'joann_d1', name: 'Scratch Post Shred', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Scratches fabric sharply. Deals 13 damage.', damage: 13 },
  { id: 'joann_d2', name: 'Agile Leap', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Leaps up onto a high shelf. Gain 12 Shield.', block: 12 },
  { id: 'joann_d3', name: 'Tuna Lick', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Eats canned tuna. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'joann_c1', name: 'Pounce From Shadows', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Ambush from the dark. Deals 16 damage.', damage: 16 },
  { id: 'joann_c2', name: 'Feline Reflexes', tier: 'C', cost: 2, type: 'defense', target: 'self', description: 'Twists deftly in mid-air. Gain 15 Shield.', block: 15 },
  { id: 'joann_c3', name: 'Counter Clutter Scatter', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Knocks cups everywhere! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'joann_b1', name: 'Nine-Lives Pounce', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'A furious flurry of claws! Deals 22 damage.', damage: 22 },
  { id: 'joann_b2', name: 'Card Shredder Claws', tier: 'B', cost: 2, type: 'debuff', target: 'single_enemy', description: 'Shreds an opponent strategy! Deals 12 damage and forces 1 card discard.', damage: 12 },
  { id: 'joann_b3', name: 'Warm Sunbeam Nap', tier: 'B', cost: 2, type: 'heal', target: 'around_ally', aoeType: 'around', description: 'Basks in warm light. Heals 36 total Around HP split between target and adjacent allies.', heal: 36 },
  // A-Tier
  { id: 'joann_a1', name: 'Knock Off Table', tier: 'A', cost: 3, type: 'special', target: 'single_enemy', specialActionId: 'knock_off_table', description: 'Looks straight into opponent\'s eyes and KNOCKS THEIR CARD OFF THE TABLE! Forces 2 random discards and deals 15 damage.', damage: 15 },
  { id: 'joann_a2', name: 'Midnight Zoomies', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Dashes at 3 AM! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'joann_a3', name: 'Nine-Lives Aegis', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Gain 24 Shield and if Joann would be unstuffed this turn, survive with 1 HP.', block: 24 },
  // S-Tier
  { id: 'joann_s1', name: 'Total Table Cleanse', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', aoeType: 'spread', description: 'Knocks EVERYTHING off the table! Forces 3 discards and deals 60 total Spread damage split between all enemies!', damage: 60 },
  { id: 'joann_s2', name: 'Apex Feline Execution', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Zero remorse predator strike. Deals 42 pinpoint damage.', damage: 42 },
  { id: 'joann_s3', name: 'Feline Royalty', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Allies heal 60 total Spread HP split among them, gain 15 Shield, and Joann gets +2 Crackers.', heal: 60, block: 15 },
]);

// 15. Cidney (Fat Squirrel - Acorn Hoarder & Chonk Slam)
const CIDNEY_CARDS: Card[] = createStuffyCardSet('cidney', [
  // F-Tier
  { id: 'cidney_f1', name: 'Cheek Stash', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Puffs cheeks with small nuts. Gain 9 Shield.', block: 9 },
  { id: 'cidney_f2', name: 'Waddle Bounce', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Bounces heavily into foe. Deals 9 damage.', damage: 9 },
  { id: 'cidney_f3', name: 'Nut Scatter', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Throws acorns around! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'cidney_d1', name: 'Acorn Toss', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Throws a solid acorn. Deals 13 damage.', damage: 13 },
  { id: 'cidney_d2', name: 'Fat Layer Armor', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Dense squishy chonk padding. Gain 13 Shield.', block: 13 },
  { id: 'cidney_d3', name: 'Walnut Crack', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Cracks a rich walnut. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'cidney_c1', name: 'Belly Bump', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'A massive gut thrust! Deals 16 damage.', damage: 16 },
  { id: 'cidney_c2', name: 'Acorn Stockpile', tier: 'C', cost: 2, type: 'utility', target: 'none', description: 'Unearths a buried acorn! Gain +1 Cracker next turn and 10 Shield.', block: 10 },
  { id: 'cidney_c3', name: 'Acorn Hailstorm', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Hurls handfuls of nuts! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'cidney_b1', name: 'Chonk Slam', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Jumps from a high branch and body-slams! Deals 22 damage.', damage: 22 },
  { id: 'cidney_b2', name: 'Giant Acorn Shield', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Holds up a massive walnut shell. Gain 20 Shield.', block: 20 },
  { id: 'cidney_b3', name: 'Nut Cache Reserves', tier: 'B', cost: 2, type: 'heal', target: 'around_ally', aoeType: 'around', description: 'Shares winter reserves! Heals 36 total Around HP split between target and adjacent allies.', heal: 36 },
  // A-Tier
  { id: 'cidney_a1', name: 'Acorn Hoard Overflow', tier: 'A', cost: 2, type: 'utility', target: 'none', specialActionId: 'acorn_hoard', description: 'DUMPS THE ACORN VAULT! Gain +3 CRACKERS immediately and draw 2 cards!' },
  { id: 'cidney_a2', name: 'Colossal Belly Flop', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Massive chonk lands on nearby foes! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'cidney_a3', name: 'Impenetrable Chonk', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Gain 26 Shield and become immune to debuffs for 1 turn.', block: 26 },
  // S-Tier
  { id: 'cidney_s1', name: 'The Acorn Colossus', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', description: 'Cidney grows into a titanic mythical squirrel. Crushes target for 45 damage!', damage: 45 },
  { id: 'cidney_s2', name: 'Infinite Nut Buffet', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Shares the ultimate winter hoard! All allies heal 60 total Spread HP split among them and gain +3 Crackers!', heal: 60 },
  { id: 'cidney_s3', name: 'Earth-Shaking Chonk Bomb', tier: 'S', cost: 5, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Flattens entire enemy field! Deals 60 total Spread damage split between all enemies.', damage: 60 },
]);

// 16. Cow (The Bovine Colossus)
const COW_CARDS: Card[] = createStuffyCardSet('cow', [
  // F-Tier
  { id: 'cow_f1', name: 'Moo Greeting', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Gentle low moo. Gain 9 Shield.', block: 9 },
  { id: 'cow_f2', name: 'Hoof Tap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A solid tap with a plush hoof. Deals 9 damage.', damage: 9 },
  { id: 'cow_f3', name: 'Pasture Sweep', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Sweeps across the grass! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'cow_d1', name: 'Horn Poke', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Pokes with yellow plush horns. Deals 13 damage.', damage: 13 },
  { id: 'cow_d2', name: 'Leather Hide', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Thick spotted padding. Gain 13 Shield.', block: 13 },
  { id: 'cow_d3', name: 'Chew the Cud', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Ruminates peacefully. Heals 13 HP.', heal: 13 },
  // C-Tier
  { id: 'cow_c1', name: 'Moo Stomp', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Heavily stamps plush hooves! Deals 16 damage.', damage: 16 },
  { id: 'cow_c2', name: 'Bell Jingle', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Jingles cheerful brass collar bell. All allies gain 10 Shield.', block: 10 },
  { id: 'cow_c3', name: 'Pasture Trample', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Trots through adjacent foes! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'cow_b1', name: 'Bovine Headbutt', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Lowers horns and rams hard! Deals 22 damage.', damage: 22 },
  { id: 'cow_b2', name: 'Bulk Grazing', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Munches sweet grass. Gain 20 Shield.', block: 20 },
  { id: 'cow_b3', name: 'Fresh Milk Bucket', tier: 'B', cost: 2, type: 'heal', target: 'around_ally', aoeType: 'around', description: 'Pours wholesome milk! Heals 36 total Around HP split between target and adjacent allies.', heal: 36 },
  // A-Tier
  { id: 'cow_a1', name: 'Milk Fortitude', tier: 'A', cost: 3, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Calcium fortifier! All allies heal 45 total Spread HP split among them and gain 10 Shield!', heal: 45, block: 10 },
  { id: 'cow_a2', name: 'Colossal Stampede', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Earth-shaking trot! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'cow_a3', name: 'Impenetrable Bovine Bulk', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Braces with colossal weight. Gain 28 Shield.', block: 28 },
  // S-Tier
  { id: 'cow_s1', name: 'The Great Bovine Colossus', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', description: 'Cow grows into a mythical spotted colossus and delivers a titanic hoof slam for 46 damage!', damage: 46 },
  { id: 'cow_s2', name: 'Miracle Milk Fountain', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Legendary dairy rejuvenation! All allies heal 60 total Spread HP split among them and gain +2 Crackers!', heal: 60 },
  { id: 'cow_s3', name: 'Cataclysmic Herd Stampede', tier: 'S', cost: 5, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Calls down a phantom herd that flattens everything! Deals 60 total Spread damage split between all enemies.', damage: 60 },
]);

// 17. Chanteira (Fat Dolphin - Tidal Chonker)
const CHANTEIRA_CARDS: Card[] = createStuffyCardSet('chanteira', [
  // F-Tier
  { id: 'chanteira_f1', name: 'Chonky Splash', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Splashes sea water with chubby fins. Deals 9 damage.', damage: 9 },
  { id: 'chanteira_f2', name: 'Flipper Hug', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Cuddles with flippers. Gain 9 Shield.', block: 9 },
  { id: 'chanteira_f3', name: 'Blowhole Poot', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Puffs steam and spray! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'chanteira_d1', name: 'Belly Wave Roll', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Rolls round body through water. Deals 13 damage.', damage: 13 },
  { id: 'chanteira_d2', name: 'Marine Bubble Guard', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Encases self in sea foam. Gain 12 Shield.', block: 12 },
  { id: 'chanteira_d3', name: 'Squid Bite', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Eats squid pop. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'chanteira_c1', name: 'Ultrasonic Chirp', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'High-pitch squeak disorients foe. Deals 16 damage.', damage: 16 },
  { id: 'chanteira_c2', name: 'Tidal Swell Guard', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Rising water protects team. All allies gain 10 Shield.', block: 10 },
  { id: 'chanteira_c3', name: 'Blowhole Blast', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Pressurized water spray! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'chanteira_b1', name: 'Chonk Wave Splash', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Massive dolphin belly lands in pool! Deals 38 total Spread damage split between all enemies.', damage: 38 },
  { id: 'chanteira_b2', name: 'Sonar Bubble Dome', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Dense pressurized sphere. Gain 20 Shield.', block: 20 },
  { id: 'chanteira_b3', name: 'Playful Dolphin Leap', tier: 'B', cost: 2, type: 'heal', target: 'around_ally', aoeType: 'around', description: 'Leaps gracefully! Heals 36 total Around HP split between target and adjacent allies.', heal: 36 },
  // A-Tier
  { id: 'chanteira_a1', name: 'Echolocation Sonar', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Piercing ultrasonic sonar! Deals 45 total Around damage split between target and adjacent enemies and reveals enemy plans.', damage: 45 },
  { id: 'chanteira_a2', name: 'Tsunami Cannon', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Unleashes high-pressure ocean torrent. Deals 27 damage.', damage: 27 },
  { id: 'chanteira_a3', name: 'Ocean Mother Shield', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Huge protective tide. All allies gain 16 Shield.', block: 16 },
  // S-Tier
  { id: 'chanteira_s1', name: 'The Great Oceanic Deluge', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', aoeType: 'spread', description: 'Chanteira causes a mythical tidal wave! Deals 60 total Spread damage split between all enemies and knocks 1 card from opponent hand!', damage: 60 },
  { id: 'chanteira_s2', name: 'Song of the Deep Sea', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Ancient melody! All allies heal 60 total Spread HP split among them and gain 16 Shield.', heal: 60, block: 16 },
  { id: 'chanteira_s3', name: 'Tidal Tail Breaker', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Crushes target with titanic tail slap. Deals 42 damage!', damage: 42 },
]);

// 18. Dolphy (Colossal Dolphin - Way Bigger than Chanteira!)
const DOLPHY_CARDS: Card[] = createStuffyCardSet('dolphy', [
  // F-Tier
  { id: 'dolphy_f1', name: 'Gentle Spurt', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Colossal blowhole spouts water. Deals 9 damage.', damage: 9 },
  { id: 'dolphy_f2', name: 'Slick Blubber', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Thick blubber layer protects body. Gain 9 Shield.', block: 9 },
  { id: 'dolphy_f3', name: 'Tidal Swirl', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Swirls ocean depths! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'dolphy_d1', name: 'Heavy Fin Slap', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Slaps with colossal pectoral fin. Deals 13 damage.', damage: 13 },
  { id: 'dolphy_d2', name: 'Sea Spray Barrage', tier: 'D', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Dense spray blinds nearby foes! Deals 24 total Around damage split between target and adjacent enemies.', damage: 24 },
  { id: 'dolphy_d3', name: 'Foam Barrier', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Surrounds colossal body in sea foam. Gain 13 Shield.', block: 13 },
  // C-Tier
  { id: 'dolphy_c1', name: 'Water Jet Cannon', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Pressurized water stream. Deals 16 damage.', damage: 16 },
  { id: 'dolphy_c2', name: 'Tidal Bastion', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Tidal swell protects allies. All allies gain 10 Shield.', block: 10 },
  { id: 'dolphy_c3', name: 'Echo Wave Push', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Shockwave through the water! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  // B-Tier
  { id: 'dolphy_b1', name: 'Whale-Sized Splash', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Dolphy crashes into water! Deals 38 total Spread damage split between all enemies.', damage: 38 },
  { id: 'dolphy_b2', name: 'Deep Abyss Shield', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Immense bulk blocks incoming damage. Gain 20 Shield.', block: 20 },
  { id: 'dolphy_b3', name: 'Titanic Flukes', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Strikes target with titanic dolphin flukes. Deals 22 damage.', damage: 22 },
  // A-Tier
  { id: 'dolphy_a1', name: 'High Pressure Geyser', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Erupts a devastating geyser from blowhole. Deals 28 damage.', damage: 28 },
  { id: 'dolphy_a2', name: 'Colossal Breach', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Dolphy leaps and crashes down! Deals 22 damage and grants Dolphy 16 Shield.', damage: 22, block: 16 },
  { id: 'dolphy_a3', name: 'Cetacean Recovery', tier: 'A', cost: 3, type: 'heal', target: 'single_ally', description: 'Soothing oceanic energy. Heals an ally for 28 HP.', heal: 28 },
  // S-Tier
  { id: 'dolphy_s1', name: 'Tsunami Crush', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Catastrophic tsunami crushes single target! Deals 44 damage and gives all allies 16 Shield!', damage: 44, block: 16 },
  { id: 'dolphy_s2', name: 'Ocean Deluge', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Submerges the arena under a massive ocean flood! Deals 60 total Spread damage split between all enemies!', damage: 60 },
  { id: 'dolphy_s3', name: 'Megalodon Dive', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Dolphy drops like a meteor from above! Deals 48 devastating damage!', damage: 48 },
]);

// 19. Shadow / Shade (Ultimate Hedgehog)
const SHADOW_CARDS: Card[] = createStuffyCardSet('shadow', [
  // F-Tier
  { id: 'shadow_f1', name: 'Quick Kick', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Swift kick with air shoes. Deals 9 damage.', damage: 9 },
  { id: 'shadow_f2', name: 'Dark Reflex', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Evades damage with air shoe burst. Gain 9 Shield.', block: 9 },
  { id: 'shadow_f3', name: 'Skate Flash', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Glides across the enemy line! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'shadow_d1', name: 'Chaos Strike', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Infused jab. Deals 13 damage.', damage: 13 },
  { id: 'shadow_d2', name: 'Quill Needle Guard', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Bristles sharp dark quills. Gain 13 Shield.', block: 13 },
  { id: 'shadow_d3', name: 'Shadow Flare', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Sparks red chaos flare. Deals 12 damage.', damage: 12 },
  // C-Tier
  { id: 'shadow_c1', name: 'Chaos Snap', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Snap punch that infuses +1 Energy (strength) into Shade! Deals 15 damage.', damage: 15, specialActionId: 'shadow_energy_1' },
  { id: 'shadow_c2', name: 'Black Tornado', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Spins in midair creating a dark cyclone! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  { id: 'shadow_c3', name: 'Hover Stride', tier: 'C', cost: 2, type: 'defense', target: 'self', description: 'Accelerates with hover shoes. Gain 15 Shield and +1 Energy.', block: 15, specialActionId: 'shadow_energy_1' },
  // B-Tier
  { id: 'shadow_b1', name: 'Chaos Dash', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Supersonic tackle! Deals 19 damage and infuses +2 Energy (strength) into Shade!', damage: 19, specialActionId: 'shadow_energy_2' },
  { id: 'shadow_b2', name: 'Chaos Barrier', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Surrounds body in red dark aura. Gain 19 Shield and +2 Energy into Shade!', block: 19, specialActionId: 'shadow_energy_2' },
  { id: 'shadow_b3', name: 'Spin Dash Torpedo', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Rolls into high-velocity ball through all foes! Deals 38 total Spread damage split between all enemies.', damage: 38 },
  // A-Tier
  { id: 'shadow_a1', name: 'Chaos Spear', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Hurls pure bolts of dark electricity! Deals 26 damage (amplified heavily by Energy).', damage: 26 },
  { id: 'shadow_a2', name: 'Limit Break', tier: 'A', cost: 3, type: 'utility', target: 'single_ally', specialActionId: 'limit_break', description: 'DOUBLES all current Energy (strength) on target ally! (If they have 0 Energy, grants +3 Energy).' },
  { id: 'shadow_a3', name: 'Chaos Boost Surge', tier: 'A', cost: 3, type: 'utility', target: 'self', specialActionId: 'chaos_boost', description: 'Shade draws upon the dark energy core! Infuses +5 Energy (strength) directly into Shade!' },
  // S-Tier
  { id: 'shadow_s1', name: 'Chaos Blast', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', specialActionId: 'chaos_blast', damage: 60, description: 'Unleashes a massive sphere of red dark energy! Deals 60 total Spread damage split between all enemies and DOUBLES Shade\'s current Energy (strength)!' },
  { id: 'shadow_s2', name: 'Chaos Control', tier: 'S', cost: 4, type: 'utility', target: 'self', specialActionId: 'chaos_control', description: 'STOPS TIME WITH SHADOW CONTROL! DOUBLES all current Energy on Shade! If Shade has less than 4 Energy, sets Energy to 8!' },
  { id: 'shadow_s3', name: 'Inhibitor Release', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', specialActionId: 'inhibitor_release', damage: 35, description: 'Removes golden inhibitor rings! Immediately infuses +6 Energy into Shade, then obliterates target for 35 damage!' },
]);

// 20. Spot (Zoo Leopard - Doubling & Transferring Effects)
const SPOT_CARDS: Card[] = createStuffyCardSet('spot', [
  // F-Tier
  { id: 'spot_f1', name: 'Spot Flick', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Flicks a stinging spot across the arena. Deals 9 damage.', damage: 9 },
  { id: 'spot_f2', name: 'Polka Shield', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Covers body in defensive polka dots. Gain 9 Shield.', block: 9 },
  { id: 'spot_f3', name: 'Hue Shift', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', specialActionId: 'spot_hue_shift', description: 'Deals 6 damage. Shifts 1 ally\'s Poison into 5 Shield!', damage: 6 },
  // D-Tier
  { id: 'spot_d1', name: 'Spot Swapper', tier: 'D', cost: 1, type: 'utility', target: 'single_enemy', specialActionId: 'spot_swapper', description: 'Deals 6 damage. Transfers up to 3 Poison from target ally onto target enemy!', damage: 6 },
  { id: 'spot_d2', name: 'Polka Guard', tier: 'D', cost: 1, type: 'defense', target: 'single_ally', specialActionId: 'spot_guard', description: 'Grants target ally 8 Shield and gives both Spot and that ally +1 Energy!', block: 8 },
  { id: 'spot_d3', name: 'Toxin Dot', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', specialActionId: 'spot_toxin_dot', description: 'Deals 8 damage and applies 3 Poison to target enemy.', damage: 8 },
  // C-Tier
  { id: 'spot_c1', name: 'Double Trouble', tier: 'C', cost: 2, type: 'defense', target: 'single_ally', specialActionId: 'spot_double_shield', description: 'DOUBLES target ally\'s current Shield! (Grants minimum 8 Shield).' },
  { id: 'spot_c2', name: 'Energy Relay', tier: 'C', cost: 2, type: 'utility', target: 'single_ally', specialActionId: 'spot_energy_relay', description: 'Transfers all Energy from all friendly stuffies, adds +2 bonus Energy, and channels it all to target ally!' },
  { id: 'spot_c3', name: 'Toxin Transfer', tier: 'C', cost: 2, type: 'utility', target: 'single_enemy', specialActionId: 'spot_toxin_transfer', description: 'Removes ALL Poison from an ally and dumps it all directly onto target enemy!' },
  // B-Tier
  { id: 'spot_b1', name: 'Spotted Multiplication', tier: 'B', cost: 2, type: 'utility', target: 'single_enemy', specialActionId: 'spot_multiply_poison', description: 'DOUBLES the Poison on target enemy! (If enemy has 4 Poison, becomes 8 Poison).' },
  { id: 'spot_b2', name: 'Energy Duplicator', tier: 'B', cost: 2, type: 'utility', target: 'single_ally', specialActionId: 'spot_double_energy', description: 'DOUBLES target ally\'s current Energy (strength)! (Minimum +2 Energy).' },
  { id: 'spot_b3', name: 'Color Dispersion', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', specialActionId: 'spot_shield_steal', description: 'Deals 14 damage. Steals 50% of target enemy\'s Shield and transfers it to Spot!', damage: 14 },
  // A-Tier
  { id: 'spot_a1', name: 'Zoo Acrobatics', tier: 'A', cost: 3, type: 'utility', target: 'all_allies', specialActionId: 'spot_double_all_buffs', description: 'Acrobatic leap! DOUBLES all positive effects (Shield & Energy) on your ENTIRE active squad!' },
  { id: 'spot_a2', name: 'Contagious Spots', tier: 'A', cost: 3, type: 'utility', target: 'single_enemy', specialActionId: 'spot_contagious', description: 'Select an enemy. Copies ALL of their Poison and Weak effects onto EVERY other enemy!' },
  { id: 'spot_a3', name: 'Grand Relocation', tier: 'A', cost: 3, type: 'utility', target: 'all_allies', specialActionId: 'spot_grand_relocation', description: 'Cleanse ALL negative effects (Poison, Weak, Brain Damage) from your entire team and transfer them all to the enemy leader!' },
  // S-Tier
  { id: 'spot_s1', name: 'Put Me in the Zoo!', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', specialActionId: 'spot_put_me_in_zoo', damage: 60, description: 'PUT ME IN THE ZOO! Deals 60 total Spread damage split between all enemies. DOUBLES all buffs on all allies, and DOUBLES all debuffs on all enemies!' },
  { id: 'spot_s2', name: 'Grand Zoo Finale', tier: 'S', cost: 3, type: 'utility', target: 'all_enemies', specialActionId: 'spot_omni_transfer', description: 'Cleanses all debuffs from all allies, DOUBLES all ally Energy and Shield, and inflicts 8 Poison on all enemies!' },
  { id: 'spot_s3', name: 'Spot Cataclysm', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', specialActionId: 'spot_cataclysm', damage: 35, description: 'Cataclysmic polka blast! Deals 35 damage and TRIPLES all Poison on target enemy!' },
]);

// 21. George (Moody Cephalopod)
const GEORGE_CARDS: Card[] = createStuffyCardSet('george', [
  // F-Tier
  { id: 'george_f1', name: 'Tentacle Slap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Slaps with an active tentacle. Deals 9 damage.', damage: 9 },
  { id: 'george_f2', name: 'Suction Guard', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Fastens suckers firmly in place. Gain 9 Shield.', block: 9 },
  { id: 'george_f3', name: 'Soothing Bubble', tier: 'F', cost: 1, type: 'heal', target: 'single_ally', description: 'Blows a tender warm bubble. Heals 9 HP.', heal: 9 },
  // D-Tier
  { id: 'george_d1', name: 'Mood Slap', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'A swift strike driven by fluctuating emotions. Deals 13 damage.', damage: 13 },
  { id: 'george_d2', name: 'Octo Ink Cloud', tier: 'D', cost: 1, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Blinds enemies with ink. All allies gain 10 Shield.', block: 10 },
  { id: 'george_d3', name: 'Tender Embrace', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Gently embraces a wounded friend. Heals 14 HP.', heal: 14 },
  // C-Tier
  { id: 'george_c1', name: 'Angry Barrage', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Rapid octopus flurries! Deals 16 damage.', damage: 16 },
  { id: 'george_c2', name: 'Happy Splash', tier: 'C', cost: 2, type: 'heal', target: 'around_ally', aoeType: 'around', description: 'Splashes refreshing ocean water! Heals 30 total Around HP split between target and adjacent allies.', heal: 30 },
  { id: 'george_c3', name: 'Cephalopod Barrier', tier: 'C', cost: 2, type: 'defense', target: 'self', description: 'Curled tentacle fortress. Gain 15 Shield.', block: 15 },
  // B-Tier
  { id: 'george_b1', name: 'Eight-Legged Flurry', tier: 'B', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Strikes adjacent foes with 8 tentacles! Deals 38 total Around damage split between target and adjacent enemies.', damage: 38 },
  { id: 'george_b2', name: 'Bipolar Surge', tier: 'B', cost: 2, type: 'utility', target: 'single_enemy', damage: 16, heal: 10, description: 'Deals 16 damage to target enemy and heals George for 10 HP.' },
  { id: 'george_b3', name: 'Restorative Ink', tier: 'B', cost: 2, type: 'heal', target: 'single_ally', description: 'Rich mineral ink restores plush stuffing. Heals 22 HP.', heal: 22 },
  // A-Tier
  { id: 'george_a1', name: 'Deep Sea Tantrum', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'A furious thrash of rage! Deals 26 damage.', damage: 26 },
  { id: 'george_a2', name: 'Oceanic Compassion', tier: 'A', cost: 3, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Radiates boundless warmth across the team! Heals 45 total Spread HP split between all allies.', heal: 45 },
  { id: 'george_a3', name: 'Mood Shift Mastery', tier: 'A', cost: 3, type: 'utility', target: 'all_allies', aoeType: 'spread', block: 15, heal: 45, description: 'Channels both emotion poles! Grants 15 Shield and heals 45 total Spread HP split between all allies.' },
  // S-Tier
  { id: 'george_s1', name: 'Wrath of the Cephalopod', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 60, description: 'George unleashes pure untamed fury! Deals 60 total Spread damage split between all enemies (doubled in Angry mode!)' },
  { id: 'george_s2', name: 'Benevolent Kraken Waves', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', heal: 60, canRevive: true, description: 'George radiates supreme warmth! Revives any unstuffed ally with 25 HP and heals active allies for 60 total Spread HP split among them (doubled in Happy mode!)' },
  { id: 'george_s3', name: 'Whirlpool Cataclysm', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', damage: 40, description: 'A massive 8-tentacle slam into an oceanic vortex! Deals 40 damage!' },
]);

// 22. Sluger (Heavyweight Slugger)
const SLUGER_CARDS: Card[] = createStuffyCardSet('sluger', [
  // F-Tier
  { id: 'sluger_f1', name: 'Slime Jab', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Quick sticky punch. Deals 9 damage.', damage: 9 },
  { id: 'sluger_f2', name: 'Heavy Mucus Guard', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Hardens emerald mucus layer. Gain 9 Shield.', block: 9 },
  { id: 'sluger_f3', name: 'Goo Crawl', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Slams into foe and readies stance. Deals 7 damage and grants 5 Shield.', damage: 7, block: 5 },
  // D-Tier
  { id: 'sluger_d1', name: 'Slime Cross', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'A heavy slug straight punch! Deals 13 damage.', damage: 13 },
  { id: 'sluger_d2', name: 'Dense Slime Shield', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Thick defensive slime barrier. Gain 13 Shield.', block: 13 },
  { id: 'sluger_d3', name: 'Brawler Snack', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Chews down tough fibrous greens. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'sluger_c1', name: 'Slime Uppercut', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Lifts enemy with a slime uppercut! Deals 16 damage.', damage: 16 },
  { id: 'sluger_c2', name: 'Viscous Wall', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Paves a thick slime track. All allies gain 10 Shield.', block: 10 },
  { id: 'sluger_c3', name: 'Mucus Splash Pummel', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', poison: 2, description: 'Batters adjacent foes with toxic slime! Deals 30 total Around damage split between target and adjacent enemies and 2 Poison.', damage: 30 },
  // B-Tier
  { id: 'sluger_b1', name: 'Slugger Combination', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'One-two slug combo! Deals 22 damage.', damage: 22 },
  { id: 'sluger_b2', name: 'Hardened Gel Armor', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Crystallizes emerald gel into rock-hard armor. Gain 20 Shield.', block: 20 },
  { id: 'sluger_b3', name: 'Heavyweight Smash', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Jumps and body-slams the entire arena! Deals 38 total Spread damage split between all enemies.', damage: 38 },
  // A-Tier
  { id: 'sluger_a1', name: 'Slugger Haymaker', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'A heavyweight slug punch of pure condensed slime! Deals 28 damage.', damage: 28 },
  { id: 'sluger_a2', name: 'Goo Quake Slam', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Ruptures the floor with high-density slime waves! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'sluger_a3', name: 'Unbreakable Mollusk Shell', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Forms an impenetrable dome of hardened slime. All allies gain 16 Shield.', block: 16 },
  // S-Tier
  { id: 'sluger_s1', name: 'Slugger Championship Knockout', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', damage: 44, brainDamage: true, description: 'The ultimate slugger knockout! Deals 44 devastating damage and inflicts Brain Damage!' },
  { id: 'sluger_s2', name: 'Colossal Slime Avalanche', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 60, poison: 4, description: 'Buries the opposing arena in toxic slime! Deals 60 total Spread damage split between all foes and inflicts 4 Poison!', },
  { id: 'sluger_s3', name: 'Heavyweight Slime Bulk', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', aoeType: 'spread', block: 25, heal: 15, canRevive: true, description: 'Sluger pumps up with championship brawler spirit! Revives a fallen ally with 15 HP and grants 25 Shield to all allies!' },
]);

// 23. Spike (Porcupine - Bleeding Stuffing & Quills)
const SPIKE_CARDS: Card[] = createStuffyCardSet('spike', [
  // F-Tier
  { id: 'spike_f1', name: 'Quill Poke', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Pokes with a sharp quill. Deals 9 damage.', damage: 9 },
  { id: 'spike_f2', name: 'Bristle Tuck', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Curls up into a spiky ball. Gain 9 Shield.', block: 9 },
  { id: 'spike_f3', name: 'Quill Splinter', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Splinters quills into nearby enemies! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'spike_d1', name: 'Bleeding Prick', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', bleedingStuffing: true, description: 'Sharp quill strike! Deals 12 damage and inflicts Bleeding Stuffing!', damage: 12 },
  { id: 'spike_d2', name: 'Spiny Shell', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Hardens spines defensively. Gain 13 Shield.', block: 13 },
  { id: 'spike_d3', name: 'Snout Nibble', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Munch on pine bark snacks. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'spike_c1', name: 'Quill Flurry', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', bleedingStuffing: true, description: 'Fires felt quills! Deals 16 damage and inflicts Bleeding Stuffing!', damage: 16 },
  { id: 'spike_c2', name: 'Porcupine Wall', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Barricades with quills. All allies gain 10 Shield.', block: 10 },
  { id: 'spike_c3', name: 'Poison Quill Sweep', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', poison: 2, description: 'Dips quills in venom! Deals 30 total Around damage split between target and adjacent enemies and 2 Poison.', damage: 30 },
  // B-Tier
  { id: 'spike_b1', name: 'Splay Quills', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', bleedingStuffing: true, description: 'Sprays quills at all enemies! Deals 38 total Spread damage split between all enemies and inflicts Bleeding Stuffing!', damage: 38 },
  { id: 'spike_b2', name: 'Barbed Armor', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Sprouts sharp defensive quills. Gain 20 Shield.', block: 20 },
  { id: 'spike_b3', name: 'Rupture Needle', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', bleedingStuffing: true, description: 'Deep needle puncture! Deals 22 damage and inflicts Bleeding Stuffing!', damage: 22 },
  // A-Tier
  { id: 'spike_a1', name: 'Quill Volley', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', bleedingStuffing: true, description: 'Whirlwind of deadly quills! Deals 45 total Around damage split between target and adjacent enemies and inflicts Bleeding Stuffing!', damage: 45 },
  { id: 'spike_a2', name: 'Deep Needle Puncture', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', bleedingStuffing: true, description: 'Devastating armor-piercing quill. Deals 32 damage and inflicts Bleeding Stuffing!', damage: 32 },
  { id: 'spike_a3', name: 'Iron Porcupine Dome', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Impenetrable quill shield for squad! All allies gain 18 Shield.', block: 18 },
  // S-Tier
  { id: 'spike_s1', name: 'Cataclysmic Quill Burst', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 60, bleedingStuffing: true, description: 'Titanic explosion of razor quills! Deals 60 total Spread damage split between all enemies and inflicts Bleeding Stuffing on everyone!' },
  { id: 'spike_s2', name: 'Fortress of Thorns', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', aoeType: 'spread', block: 30, heal: 15, canRevive: true, description: 'Spike unleashes protective bramble magic! Revives an ally with 15 HP and grants 30 Shield to all allies!' },
  { id: 'spike_s3', name: 'Thorned Rupture', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', damage: 46, bleedingStuffing: true, description: 'Punctures deep into the core! Deals 46 damage, inflicts Bleeding Stuffing, and immediately cracks the earth beneath the target!' },
]);

// 24. Umbratail (Moonlight Plush)
const UMBREON_CARDS: Card[] = createStuffyCardSet('umbreon', [
  // F-Tier
  { id: 'umbreon_f1', name: 'Shadow Nibble', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A stealthy dark bite. Deals 9 damage.', damage: 9 },
  { id: 'umbreon_f2', name: 'Lunar Ring Glow', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Yellow rings illuminate. Gain 9 Shield.', block: 9 },
  { id: 'umbreon_f3', name: 'Nocturnal Glare', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Hypnotic dark eyes glare! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'umbreon_d1', name: 'Feint Attack', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Draws near from the darkness! Deals 13 damage.', damage: 13 },
  { id: 'umbreon_d2', name: 'Moonlight Veil', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Soft silver shroud. Gain 13 Shield.', block: 13 },
  { id: 'umbreon_d3', name: 'Moon Berry Snack', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Nibbles glowing moon berry. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'umbreon_c1', name: 'Dark Pulse', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Waves of nocturnal aura! Deals 16 damage.', damage: 16 },
  { id: 'umbreon_c2', name: 'Lunar Barrier', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Protective ring shield. All allies gain 10 Shield.', block: 10 },
  { id: 'umbreon_c3', name: 'Confuse Ray', tier: 'C', cost: 2, type: 'debuff', target: 'single_enemy', brainDamage: true, description: 'Sinister flash of light! Deals 12 damage and inflicts Brain Damage!', damage: 12 },
  // B-Tier
  { id: 'umbreon_b1', name: 'Night Slash', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Sharp claws shrouded in moonlight. Deals 22 damage.', damage: 22 },
  { id: 'umbreon_b2', name: 'Midnight Aegis', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Rings shine with radiant darkness. Gain 20 Shield.', block: 20 },
  { id: 'umbreon_b3', name: 'Psychic Mind Pulse', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Psychic wave radiates outward! Deals 38 total Spread damage split between all foes.', damage: 38 },
  // A-Tier
  { id: 'umbreon_a1', name: 'Moonlight Puppetry', tier: 'A', cost: 3, type: 'special', target: 'single_enemy', specialActionId: 'strokenosis', description: 'Psychic tendrils control enemy thoughts! Forces an opponent card to be played against them!', damage: 20 },
  { id: 'umbreon_a2', name: 'Lunar Eclipse Blast', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', brainDamage: true, description: 'Shrouds the arena in an eclipse! Deals 45 total Around damage split between target and adjacent enemies and inflicts Brain Damage!', damage: 45 },
  { id: 'umbreon_a3', name: 'Moonlight Prayer', tier: 'A', cost: 3, type: 'heal', target: 'all_allies', aoeType: 'spread', description: 'Bask in soothing lunar rays! All allies heal 45 total Spread HP split between allies and gain 10 Shield.', heal: 45, block: 10 },
  // S-Tier
  { id: 'umbreon_s1', name: 'Black Moonlight Domination', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', specialActionId: 'strokenosis', damage: 35, description: 'The pinnacle of dark psychic control! Seizes opponent mind, steals their card, and strikes for 35 damage!' },
  { id: 'umbreon_s2', name: 'Nocturnal Mind Warp', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 60, brainDamage: true, description: 'Blinding dark psychic blast! Deals 60 total Spread damage split between all enemies and scrambles all minds with Brain Damage!' },
  { id: 'umbreon_s3', name: 'Lunar Resurrection', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', heal: 60, block: 25, canRevive: true, description: 'Sacred moonlight bathes the fallen! Revives an ally with 25 HP and heals active allies for 60 total Spread HP split among them!', },
]);

// 25. Pinky Bear (Pink Bear - Secret Candy Stash Guardian)
const PINKY_BEAR_CARDS: Card[] = createStuffyCardSet('pinky_bear', [
  // F-Tier
  { id: 'pinky_bear_f1', name: 'Paw Tap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Cute pink paw tap. Deals 9 damage.', damage: 9 },
  { id: 'pinky_bear_f2', name: 'Candy Wrapper Guard', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Crinkly foil protection. Gain 9 Shield.', block: 9 },
  { id: 'pinky_bear_f3', name: 'Sweet Hug', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'A sugary squeeze! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'pinky_bear_d1', name: 'Sugar Slap', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Stinging sweet swat! Deals 13 damage.', damage: 13 },
  { id: 'pinky_bear_d2', name: 'Lollipop Shield', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Holds up a giant hard lollipop. Gain 13 Shield.', block: 13 },
  { id: 'pinky_bear_d3', name: 'Marshmallow Munch', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Secret candy nibble. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'pinky_bear_c1', name: 'Weakening Gummy Swat', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', weak: 2, description: 'Stretchy gummy slap! Deals 15 damage and weakens foe.', damage: 15 },
  { id: 'pinky_bear_c2', name: 'Secret Stash Barricade', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Guards the sugar vault! All allies gain 10 Shield.', block: 10 },
  { id: 'pinky_bear_c3', name: 'Sour Taffy Pull', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', poison: 2, description: 'Pulls sticky sour taffy! Deals 30 total Around damage split between target and adjacent enemies and 2 Poison.', damage: 30 },
  // B-Tier
  { id: 'pinky_bear_b1', name: "Brother's Repellent", tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', weak: 2, description: "Don't touch my stash! Deals 38 total Spread damage split between all enemies and leaves them weakened.", damage: 38 },
  { id: 'pinky_bear_b2', name: 'Cotton Candy Cocoon', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Spun sugar armor. Gain 20 Shield.', block: 20 },
  { id: 'pinky_bear_b3', name: 'Jawbreaker Slam', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Hurls a rock-solid jawbreaker! Deals 22 damage.', damage: 22 },
  // A-Tier
  { id: 'pinky_bear_a1', name: 'Sweet Tooth Overload', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', weak: 2, description: 'Mega sugar rush strike! Deals 30 damage and weakens target.', damage: 30 },
  { id: 'pinky_bear_a2', name: 'Gummy Bear Stampede', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'A stampede of fruity gummy bears! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'pinky_bear_a3', name: 'Sugar Shield Dome', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Hard caramelized candy dome. All allies gain 18 Shield.', block: 18 },
  // S-Tier
  { id: 'pinky_bear_s1', name: "DON'T TOUCH MY STASH!", tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', damage: 52, description: "Furious guardian fury! Protects the secret sweets with 52 colossal damage!" },
  { id: 'pinky_bear_s2', name: 'Candy Vault Apocalypse', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 60, poison: 4, description: 'Ruptures the secret stash! Deals 60 total Spread damage split between all enemies and floods the field in sour poison syrup!' },
  { id: 'pinky_bear_s3', name: 'Sweet Life Restitch', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', heal: 25, block: 25, canRevive: true, description: 'Shares the forbidden candy stash with a fallen friend! Revives ally with 25 HP and 25 Shield!' },
]);

// 25. Big Bear (Colossal Slumbering Bear)
const BIG_BEAR_CARDS: Card[] = createStuffyCardSet('big_bear', [
  // F-Tier
  { id: 'big_bear_f1', name: 'Sleepy Paw', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A slow heavy snooze swipe. Deals 9 damage.', damage: 9 },
  { id: 'big_bear_f2', name: 'Deep Inhale', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Takes a deep sleeping breath. Gain 9 Shield.', block: 9 },
  { id: 'big_bear_f3', name: 'Mattress Shift', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Rolls over in bed! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'big_bear_d1', name: 'Heavy Slumber Roll', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Massive bear rolls over! Deals 13 damage.', damage: 13 },
  { id: 'big_bear_d2', name: 'Summer Hibernate', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Snuggles under warm quilt. Gain 14 Shield.', block: 14 },
  { id: 'big_bear_d3', name: 'Honey Pot Dream', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Dreams of sweet golden honey. Heals 14 HP.', heal: 14 },
  // C-Tier
  { id: 'big_bear_c1', name: 'Snooze Quake', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Loud snoring shakes the room! Deals 30 total Around damage split between target and adjacent enemies.', damage: 30 },
  { id: 'big_bear_c2', name: 'Colossal Slumber Wall', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'His immense body blocks the way. All allies gain 12 Shield.', block: 12 },
  { id: 'big_bear_c3', name: 'Drowsy Clout', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'A sleepy, crushing swipe. Deals 17 damage.', damage: 17 },
  // B-Tier
  { id: 'big_bear_b1', name: 'Bear Hug Slumber', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Hugs target into his furry bulk. Deals 22 damage.', damage: 22 },
  { id: 'big_bear_b2', name: 'Unbreakable Hibernate', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Deep REM sleep. Gain 22 Shield.', block: 22 },
  { id: 'big_bear_b3', name: 'Quilt Trample', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', description: 'Kicks the blankets in sleep! Deals 38 total Spread damage split between all foes.', damage: 38 },
  // A-Tier
  { id: 'big_bear_a1', name: 'Restless Sleep Toss', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'A restless titan toss! Deals 32 damage.', damage: 32 },
  { id: 'big_bear_a2', name: 'Snore Shockwave', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Thunderous snoring blasts the arena! Deals 45 total Around damage split between target and adjacent enemies.', damage: 45 },
  { id: 'big_bear_a3', name: 'Winter Blanket Fortress', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Pulls giant patchwork quilt over squad! All allies gain 20 Shield.', block: 20 },
  // S-Tier
  { id: 'big_bear_s1', name: '3-Cracker Wakeup Call', tier: 'S', cost: 3, type: 'attack', target: 'single_enemy', damage: 60, block: 25, specialActionId: 'big_bear_awaken', description: 'AWAKENS FROM HIBERNATION! Big Bear shakes off his sleep with a 60 damage colossal swipe and 25 Shield!' },
  { id: 'big_bear_s2', name: 'Colossal Slumber Quake', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 60, description: 'Titanic Amalgam-sized body-slam! Deals 60 total Spread damage split between all foes and cracks the earth!' },
  { id: 'big_bear_s3', name: 'Hibernating Restitch', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', aoeType: 'spread', block: 35, heal: 20, canRevive: true, description: 'Wraps the entire squad in warm hibernation fluff! Revives fallen ally with 20 HP and 35 Shield to all!' },
]);

// 26. Allie (Alligator Plush - Bleeding Stuffing, Weak, Lifesteal)
const ALLIE_CARDS: Card[] = createStuffyCardSet('allie', [
  // F-Tier
  { id: 'allie_f1', name: 'Swamp Snap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Quick gator snap. Deals 9 damage.', damage: 9 },
  { id: 'allie_f2', name: 'Scaly Hide', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Hard gator scutes protect body. Gain 9 Shield.', block: 9 },
  { id: 'allie_f3', name: 'Tail Whip Sweep', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Muddy tail sweep! Deals 18 total Around damage split between target and adjacent enemies.', damage: 18 },
  // D-Tier
  { id: 'allie_d1', name: 'Gator Chomp', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', lifesteal: true, description: 'A hungry bite! Deals 12 damage with Lifesteal.', damage: 12 },
  { id: 'allie_d2', name: 'Mud Armor', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Coats scales in protective bog mud. Gain 13 Shield.', block: 13 },
  { id: 'allie_d3', name: 'Numbing Bite', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', weak: 2, description: 'Chomps pressure points! Deals 12 damage and applies Weak.', damage: 12 },
  // C-Tier
  { id: 'allie_c1', name: 'Lacerating Claws', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', bleedingStuffing: true, description: 'Rips plush seams! Deals 16 damage and inflicts Bleeding Stuffing.', damage: 16 },
  { id: 'allie_c2', name: 'Marsh Camouflage', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Hides allies in murky swamp reeds. All allies gain 10 Shield.', block: 10 },
  { id: 'allie_c3', name: 'Drowsy Bog Thrash', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', weak: 2, description: 'Thrashes nearby foes! Deals 30 total Around damage split between target and adjacent enemies and applies Weak.', damage: 30 },
  // B-Tier
  { id: 'allie_b1', name: 'Leech Clamp', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', lifesteal: true, description: 'Locks powerful jaws onto target! Deals 20 damage with full Lifesteal.', damage: 20 },
  { id: 'allie_b2', name: 'Thick Alligator Scales', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Impenetrable reptilian armor. Gain 22 Shield.', block: 22 },
  { id: 'allie_b3', name: 'Rip & Tear', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', bleedingStuffing: true, weak: 2, description: 'Frenzied swamp sweep! Deals 38 total Spread damage split between all foes, inflicts Bleeding Stuffing, and applies Weak.', damage: 38 },
  // A-Tier
  { id: 'allie_a1', name: "Predator's Feasting", tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', lifesteal: true, description: 'Vicious predatory strike! Deals 28 damage with full Lifesteal.', damage: 28 },
  { id: 'allie_a2', name: 'Exhausting Thrash', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', weak: 2, block: 10, description: 'Violent underwater thrashing! Deals 26 damage, applies Weak, and grants 10 Shield.', damage: 26 },
  { id: 'allie_a3', name: 'Swamp Bastion', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', description: 'Fortifies the entire party behind dense bayou logs. All allies gain 18 Shield.', block: 18 },
  // S-Tier
  { id: 'allie_s1', name: 'DEATH ROLL', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', lifesteal: true, weak: 2, description: 'ALLIE SIGNATURE EXECUTION! Vicious apex predator death roll! Deals 54 damage with full Lifesteal and applies Weak!' },
  { id: 'allie_s2', name: 'SWAMP RAMPAGE', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', lifesteal: true, bleedingStuffing: true, damage: 60, description: 'APEX BAYOU FRENZY! Deals 60 total Spread damage split between all enemies, inflicts Bleeding Stuffing, and lifesteals!' },
  { id: 'allie_s3', name: 'Bayou Restoration', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', heal: 25, block: 25, canRevive: true, description: 'Channel the regenerative vitality of the ancient marsh! Revives fallen ally with 25 HP and grants 25 Shield to all!' },
]);


// ==========================================
// TYRANT (T-Rex Dino Plush - Thump & Jump!)
// ==========================================
export const TYRANT_CARDS: Card[] = [
  { id: 'tyrant_f1', name: 'Pebble Kick', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Kicks a small rock with stubby claws. Deals 8 damage.', damage: 8 },
  { id: 'tyrant_f2', name: 'Plush Plating', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Hard felt scales buffer incoming hits. Gain 8 Shield.', block: 8 },
  { id: 'tyrant_f3', name: 'Mini Stomp', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Little ground thump! Deals 16 total Around damage split between target and adjacent enemies.', damage: 16 },

  { id: 'tyrant_d1', name: 'Stubby Claws', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Quick claw slash. Deals 12 damage.', damage: 12 },
  { id: 'tyrant_d2', name: 'Dino Toughness', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Tenses prehistoric plush muscles. Gain 12 Shield.', block: 12 },
  { id: 'tyrant_d3', name: 'Little Hop', tier: 'D', cost: 1, type: 'defense', target: 'self', weak: 1, description: 'Tiny hop and ground vibration. Gain 10 Shield and applies Weak to attacker.', block: 10 },

  { id: 'tyrant_c1', name: 'Dino Chomp', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Ferocious felt bite! Deals 16 damage.', damage: 16 },
  { id: 'tyrant_c2', name: 'Thump Guard', tier: 'C', cost: 2, type: 'defense', target: 'self', description: 'Thumps feet into the dirt for solid footing. Gain 16 Shield.', block: 16 },
  { id: 'tyrant_c3', name: 'Tail Sweep', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Sweeps heavy tail across the line! Deals 24 total Around damage split across targets.', damage: 24 },

  { id: 'tyrant_b1', name: 'Crushing Stomp', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', weak: 1, description: 'Stomps down hard! Deals 20 damage and applies Weak.', damage: 20 },
  { id: 'tyrant_b2', name: 'Seismic Leap', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Leaps high into the air! Gain 20 Shield.', block: 20 },
  { id: 'tyrant_b3', name: 'Ground Shockwave', tier: 'B', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', description: 'Tremor shockwave! Deals 32 total Around damage split between target and adjacent enemies.', damage: 32 },

  { id: 'tyrant_a1', name: 'Tail Whiplash Sweep', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 45, description: 'Catastrophic tail swing! Deals 45 total Around damage split across targets!' },
  { id: 'tyrant_a2', name: 'Tremor Pounce', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', damage: 28, block: 15, description: 'Heavy leaping pounce! Deals 28 damage and grants 15 Shield.' },
  { id: 'tyrant_a3', name: 'Dino Iron Scales', tier: 'A', cost: 3, type: 'defense', target: 'self', block: 32, description: 'Prehistoric hide resists all damage! Gain 32 Shield.' },

  { id: 'tyrant_s1', name: "Tyrant's Colossal Thump & Jump", tier: 'S', cost: 4, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 60, block: 20, description: 'THUMP AND JUMP! Tyrant pounds the earth for 60 total Around damage split across adjacent foes, then leaps for 20 Shield!' },
  { id: 'tyrant_s2', name: 'Seismic Tyrant Quake', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 60, weak: 3, description: 'Massive prehistoric earthquake! Deals 60 total Spread damage split across all enemies and weakens them for 3 turns!' },
  { id: 'tyrant_s3', name: 'Apex Prehistoric Roar', tier: 'S', cost: 3, type: 'utility', target: 'all_enemies', aoeType: 'spread', weak: 2, block: 30, description: 'EAR-SPLITTING APEX ROAR! Tyrant gains 30 Shield and terrifies all enemies with Weak!' },
];

// ==========================================
// UNICORN (White, Pink Feet, Purple Mane, Rainbow Horn)
// ==========================================
export const UNICORN_CARDS: Card[] = [
  { id: 'unicorn_f1', name: 'Plush Nuzzle', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Affectionate horn bump. Deals 8 damage.', damage: 8 },
  { id: 'unicorn_f2', name: 'White Wool Fluff', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Puff of pristine white plush wool. Gain 8 Shield.', block: 8 },
  { id: 'unicorn_f3', name: 'Shimmer Glimmer', tier: 'F', cost: 1, type: 'heal', target: 'single_ally', heal: 8, description: 'Soft sparkle heals target ally for 8 HP.' },

  { id: 'unicorn_d1', name: 'Hoof Tap', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Pink hoof kick! Deals 11 damage.', damage: 11 },
  { id: 'unicorn_d2', name: 'Stardust Ward', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Glistening stardust barrier. Gain 11 Shield.', block: 11 },
  { id: 'unicorn_d3', name: 'Gentle Whinny', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', heal: 11, description: 'Soothes an ally, restoring 11 HP.' },

  { id: 'unicorn_c1', name: 'Starlight Spark', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Fires a dazzling beam of starlight! Deals 15 damage.', damage: 15 },
  { id: 'unicorn_c2', name: 'Purple Mane Veil', tier: 'C', cost: 2, type: 'defense', target: 'single_ally', block: 16, description: 'Shields ally with flowing purple mane. Grants 16 Shield.' },
  { id: 'unicorn_c3', name: 'Glitter Cleanse', tier: 'C', cost: 2, type: 'heal', target: 'single_ally', heal: 16, description: 'Shower of purifying glitter heals for 16 HP.' },

  { id: 'unicorn_b1', name: 'Glitter Horn Thrust', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', damage: 18, description: 'Rainbow horn jab! Deals 18 damage.' },
  { id: 'unicorn_b2', name: 'Pink Hoof Trot', tier: 'B', cost: 2, type: 'defense', target: 'self', block: 18, description: 'Prances gracefully across the field. Gain 18 Shield.' },
  { id: 'unicorn_b3', name: 'Rainbow Beam', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 30, description: 'Sweeping rainbow arc! Deals 30 total Spread damage split between all enemies.' },

  { id: 'unicorn_a1', name: 'Horn of Pure Light', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 45, description: 'Radiant prismatic burst! Deals 45 total Around damage split between target and adjacent enemies.' },
  { id: 'unicorn_a2', name: 'Starlight Radiance', tier: 'A', cost: 3, type: 'heal', target: 'all_allies', aoeType: 'spread', heal: 35, description: 'Brilliant wave of healing light! Restores 35 total Spread HP split among all alive allies.' },
  { id: 'unicorn_a3', name: 'Prismatic Bastion', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', block: 20, description: 'Covers the party in rainbow crystal shields. All allies gain 20 Shield.' },

  { id: 'unicorn_s1', name: 'Rainbow Horn Cataclysm', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 60, description: 'RAINBOW HORN CATACLYSM! Unicorn unleashes full prismatic power, dealing 60 total Spread damage split between all enemies!' },
  { id: 'unicorn_s2', name: 'Prismatic Star Blessing', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', heal: 60, canRevive: true, description: 'ULTIMATE HEALING AURA: Restores 60 total Spread HP split among all alive allies, cleanses debuffs, and revives 1 fallen ally with 20 HP!' },
  { id: 'unicorn_s3', name: 'Rainbow Aurora Aegis', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', aoeType: 'spread', block: 40, description: 'MAGICAL AURORA SHIELD: Grants 40 Shield to all active allies!' },
];

// ==========================================
// GRUMPY RHINO (Bad-Tempered Tank)
// ==========================================
export const GRUMPY_RHINO_CARDS: Card[] = [
  { id: 'grumpy_rhino_f1', name: 'Stubby Horn Nudge', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Irritable horn poke. Deals 8 damage.', damage: 8 },
  { id: 'grumpy_rhino_f2', name: 'Tough Plush Skin', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Stiff felt hide. Gain 8 Shield.', block: 8 },
  { id: 'grumpy_rhino_f3', name: 'Heavy Sigh', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Grumpy sigh fortifies resolve. Gain 9 Shield.', block: 9 },

  { id: 'grumpy_rhino_d1', name: 'Rhino Poke', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Annoyed horn thrust. Deals 12 damage.', damage: 12 },
  { id: 'grumpy_rhino_d2', name: 'Slate Scutes', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Hardened slate grey plates. Gain 12 Shield.', block: 12 },
  { id: 'grumpy_rhino_d3', name: 'Annoyed Glare', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', damage: 10, weak: 1, description: 'Glares with furrowed brows! Deals 10 damage and applies Weak.' },

  { id: 'grumpy_rhino_c1', name: 'Scowling Shove', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Pushes enemy back with heavy snout. Deals 16 damage.', damage: 16 },
  { id: 'grumpy_rhino_c2', name: 'Grumpy Grunt', tier: 'C', cost: 2, type: 'defense', target: 'self', description: 'Deep irritable grunt. Gain 16 Shield.', block: 16 },
  { id: 'grumpy_rhino_c3', name: 'Muddy Charge', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 25, description: 'Clumsy charge through mud! Deals 25 total Around damage split across targets.' },

  { id: 'grumpy_rhino_b1', name: 'Heavy Horn Slam', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', damage: 20, description: 'Powerful upward horn strike! Deals 20 damage.' },
  { id: 'grumpy_rhino_b2', name: 'Cranky Wall', tier: 'B', cost: 2, type: 'defense', target: 'self', block: 20, description: 'Planting hooves like a brick wall. Gain 20 Shield.' },
  { id: 'grumpy_rhino_b3', name: 'Irritable Stomp', tier: 'B', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 32, description: 'Throws a tantrum! Deals 32 total Around damage split between target and adjacent enemies.' },

  { id: 'grumpy_rhino_a1', name: 'Horn Gore Charge', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', damage: 32, description: 'Full speed grumpy charge! Deals 32 heavy piercing damage.' },
  { id: 'grumpy_rhino_a2', name: 'Grumpy Shockwave', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 45, description: 'Massive bad-tempered impact! Deals 45 total Around damage split across targets.' },
  { id: 'grumpy_rhino_a3', name: 'Slate Hide Armor', tier: 'A', cost: 3, type: 'defense', target: 'self', block: 30, description: 'Armored hide shrugs off punishment. Gain 30 Shield.' },

  { id: 'grumpy_rhino_s1', name: 'Bad Mood Trample', tier: 'S', cost: 4, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 60, description: 'MAXIMUM GRUMPINESS: Tramples through foes, dealing 60 total Around damage split between target and adjacent enemies!' },
  { id: 'grumpy_rhino_s2', name: 'Perpetual Grump Tantrum', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 60, description: 'EXPLOSIVE TEMPER: Deals 60 total Spread damage split evenly among all enemies!' },
  { id: 'grumpy_rhino_s3', name: 'Impenetrable Horn Bulwark', tier: 'S', cost: 4, type: 'defense', target: 'self', block: 45, taunt: true, description: 'TAUNTING TITAN: Forces all foes to attack Grumpy Rhino and gains 45 massive Shield!' },
];

// ==========================================
// FARTY LAMA (Fortnite Pinata Llama - As Farty as Fifi!)
// ==========================================
export const FARTY_LAMA_CARDS: Card[] = [
  { id: 'farty_lama_f1', name: 'Party Horn', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Beeps party horn. Deals 8 damage.', damage: 8 },
  { id: 'farty_lama_f2', name: 'Paper Mache Shield', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Paper mache layers absorb blows. Gain 8 Shield.', block: 8 },
  { id: 'farty_lama_f3', name: 'Tiny Fart', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 15, description: 'Cute little toot! Deals 15 total Around damage split across targets.' },

  { id: 'farty_lama_d1', name: 'Llama Spit', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Comical pinata spit! Deals 11 damage.', damage: 11 },
  { id: 'farty_lama_d2', name: 'Pinata Fringe Guard', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Fringe tassels absorb impact. Gain 11 Shield.', block: 11 },
  { id: 'farty_lama_d3', name: 'Little Toot', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', damage: 9, poison: 2, description: 'Smelly puff deals 9 damage and inflicts 2 Poison.' },

  { id: 'farty_lama_c1', name: 'Cyan Saddle Kick', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Bucking pinata kick! Deals 15 damage.', damage: 15 },
  { id: 'farty_lama_c2', name: 'Fart Cushion', tier: 'C', cost: 2, type: 'defense', target: 'self', description: 'Deploys a bouncy gas cushion. Gain 15 Shield.', block: 15 },
  { id: 'farty_lama_c3', name: 'Stinky Puff', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 24, poison: 2, description: 'Releases a stinky cloud! Deals 24 total Around damage split across targets and inflicts 2 Poison.' },

  { id: 'farty_lama_b1', name: 'Pinata Headbutt', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', damage: 18, description: 'Googly-eyed headbutt! Deals 18 damage.' },
  { id: 'farty_lama_b2', name: 'Llama Wool Coat', tier: 'B', cost: 2, type: 'defense', target: 'self', block: 18, description: 'Thick magenta wool protection. Gain 18 Shield.' },
  { id: 'farty_lama_b3', name: 'Toxic Confetti Cloud', tier: 'B', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 30, poison: 2, description: 'Pinata confetti mixed with gas! Deals 30 total Around damage split across targets and applies 2 Poison.' },

  { id: 'farty_lama_a1', name: 'Stinky Pinata Tornado', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 45, poison: 4, description: 'Whirling gas whirlwind! Deals 45 total Spread damage split across all foes and applies 4 Poison.' },
  { id: 'farty_lama_a2', name: 'Fart Propulsion Gallop', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', damage: 26, block: 15, description: 'Gas-powered rocket dash! Deals 26 damage and grants 15 Shield.' },
  { id: 'farty_lama_a3', name: 'Supply Drop Bastion', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', block: 18, description: 'Drops iconic blue loot balloon shields! All allies gain 18 Shield.' },

  { id: 'farty_lama_s1', name: 'Fortnite Pinata Gas Explosion', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 60, poison: 6, description: 'VICTORY ROYALE GAS EXPLOSION! Explodes with 60 total Spread damage split across all foes and inflicts 6 Poison!' },
  { id: 'farty_lama_s2', name: 'Epic Loot Shower', tier: 'S', cost: 4, type: 'utility', target: 'all_allies', aoeType: 'spread', block: 30, heal: 25, description: 'PINATA BURST: Rains healing and shield upon all squad members! Grants 30 Shield and 25 HP to all allies!' },
  { id: 'farty_lama_s3', name: 'Chug Gas Supernova', tier: 'S', cost: 4, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 60, poison: 5, description: 'Noxious pinata eruption! Deals 60 total Around damage split between target and adjacent enemies, plus 5 Poison!' },
];

// ==========================================
// DOLPHER (Older Female Grey Dolphin Matriarch)
// ==========================================
export const DOLPHER_CARDS: Card[] = [
  { id: 'dolpher_f1', name: 'Splash Tap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Gentle fluke flick. Deals 8 damage.', damage: 8 },
  { id: 'dolpher_f2', name: 'Foam Ward', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Sea foam protects body. Gain 8 Shield.', block: 8 },
  { id: 'dolpher_f3', name: 'Warm Mist', tier: 'F', cost: 1, type: 'heal', target: 'single_ally', heal: 8, description: 'Gentle blowhole mist restores 8 HP to target ally.' },

  { id: 'dolpher_d1', name: 'Gentle Nudge', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Snout bump. Deals 11 damage.', damage: 11 },
  { id: 'dolpher_d2', name: 'Wave Shimmer', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Ocean ripples cushion blows. Gain 11 Shield.', block: 11 },
  { id: 'dolpher_d3', name: 'Soothing Whistle', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', heal: 11, description: 'Ultrasonic pod whistle heals ally for 11 HP.' },

  { id: 'dolpher_c1', name: 'Blowhole Spray', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Pressurized water jet! Deals 15 damage.', damage: 15 },
  { id: 'dolpher_c2', name: 'Pearl Shallows Shield', tier: 'C', cost: 2, type: 'defense', target: 'self', block: 16, description: 'Shallows current forms a shield. Gain 16 Shield.' },
  { id: 'dolpher_c3', name: 'Pod Call', tier: 'C', cost: 2, type: 'heal', target: 'single_ally', heal: 16, description: 'Matriarch care restores 16 HP to an ally.' },

  { id: 'dolpher_b1', name: 'Grey Fin Strike', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', damage: 19, description: 'Solid pectoral fin strike! Deals 19 damage.' },
  { id: 'dolpher_b2', name: 'Ocean Mother Guard', tier: 'B', cost: 2, type: 'defense', target: 'single_ally', block: 20, description: 'Guards an ally with protective flippers. Grants 20 Shield.' },
  { id: 'dolpher_b3', name: 'Surging Undertow', tier: 'B', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 32, description: 'Whirling undertow! Deals 32 total Around damage split across targets.' },

  { id: 'dolpher_a1', name: 'Great Fluke Splash', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 45, description: 'Massive tail slap! Deals 45 total Around damage split between target and adjacent enemies.' },
  { id: 'dolpher_a2', name: 'Tidal Bubble Veil', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', block: 20, description: 'Surrounds entire party in protective sea bubbles. All allies gain 20 Shield.' },
  { id: 'dolpher_a3', name: 'Deep Current Surge', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', damage: 28, block: 14, description: 'Crushing ocean surge! Deals 28 damage and grants 14 Shield.' },

  { id: 'dolpher_s1', name: 'Matriarch Ocean Tidal Wave', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 60, description: 'COLOSSAL TIDAL CREST: Summons a massive ocean wall, dealing 60 total Spread damage split evenly among all enemies!' },
  { id: 'dolpher_s2', name: 'Maternal Ocean Embrace', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', aoeType: 'spread', heal: 50, block: 25, canRevive: true, description: 'MATRIARCH RESTORATION: Restores 50 total Spread HP split among living allies, grants 25 Shield, and revives 1 fallen ally with 20 HP!' },
  { id: 'dolpher_s3', name: 'Elder Pod Whistle', tier: 'S', cost: 3, type: 'defense', target: 'all_allies', aoeType: 'spread', block: 35, description: 'CALL OF THE ANCIENT POD: Fortifies all squad members with 35 Shield!' },
];

// ==========================================
// DOLPHIM (Smaller, Lighter Grey Dolphin Genius - Slightly Smarter!)
// ==========================================
export const DOLPHIM_CARDS: Card[] = [
  { id: 'dolphim_f1', name: 'Silver Splash', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Quick silvery splash. Deals 8 damage.', damage: 8 },
  { id: 'dolphim_f2', name: 'Light Mist Shield', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Light grey water veil. Gain 8 Shield.', block: 8 },
  { id: 'dolphim_f3', name: 'Ripple Tap', tier: 'F', cost: 1, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 15, description: 'Small ripple ping! Deals 15 total Around damage split across targets.' },

  { id: 'dolphim_d1', name: 'Quick Dart', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Agile darting strike. Deals 12 damage.', damage: 12 },
  { id: 'dolphim_d2', name: 'Compact Bubble', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Aerodynamic bubble ward. Gain 12 Shield.', block: 12 },
  { id: 'dolphim_d3', name: 'Sonar Ping', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', damage: 10, weak: 1, description: 'Calculated ping disorients target! Deals 10 damage and applies Weak.' },

  { id: 'dolphim_c1', name: 'Echo Pulse', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'High-frequency sonic click! Deals 16 damage.', damage: 16 },
  { id: 'dolphim_c2', name: 'Silver Glaze', tier: 'C', cost: 2, type: 'defense', target: 'self', description: 'Sleek silver skin deflects attacks. Gain 16 Shield.', block: 16 },
  { id: 'dolphim_c3', name: 'Frequency Ping', tier: 'C', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 25, description: 'Ultrasonic resonance! Deals 25 total Around damage split across targets.' },

  { id: 'dolphim_b1', name: 'Smart Fin Sweep', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', damage: 20, description: 'Precisely calculated fin strike! Deals 20 damage.' },
  { id: 'dolphim_b2', name: 'Sonar Barrier', tier: 'B', cost: 2, type: 'defense', target: 'self', block: 20, description: 'Predicts incoming trajectories! Gain 20 Shield.' },
  { id: 'dolphim_b3', name: 'Rhythm Wave', tier: 'B', cost: 2, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 32, description: 'Harmonic frequency burst! Deals 32 total Around damage split across targets.' },

  { id: 'dolphim_a1', name: 'Precision Sonar Beam', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', damage: 32, description: 'Focused sonic beam strikes vulnerable seams! Deals 32 damage.' },
  { id: 'dolphim_a2', name: 'Calculated Evasion Leap', tier: 'A', cost: 3, type: 'defense', target: 'self', block: 28, description: 'Acrobatic leap out-calculates foes! Gain 28 Shield.' },
  { id: 'dolphim_a3', name: 'Acoustic Shockwave', tier: 'A', cost: 3, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 45, description: 'High-IQ acoustic blast! Deals 45 total Around damage split across targets.' },

  { id: 'dolphim_s1', name: 'High-IQ Sonar Overload', tier: 'S', cost: 4, type: 'attack', target: 'around_enemy', aoeType: 'around', damage: 60, weak: 3, description: 'GENIUS SONAR OVERLOAD: Deals 60 total Around damage split between target and adjacent enemies, and inflicts 3 turns of Weak!' },
  { id: 'dolphim_s2', name: 'Calculated Sonic Cascade', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', aoeType: 'spread', damage: 60, description: 'FULL SYMPHONY RESONANCE: Deals 60 total Spread damage split evenly among all enemies!' },
  { id: 'dolphim_s3', name: 'Genius Trajectory Matrix', tier: 'S', cost: 3, type: 'utility', target: 'all_allies', aoeType: 'spread', block: 30, description: 'SONAR PREDICTION MATRIX: Analyzes enemy attack patterns, granting 30 Shield to all squad members!' },
];

export const ALL_CARDS: Card[] = [
  ...PLAYER_POWERUP_CARDS,
  ...ALEX_CARDS,
  ...JEFE_CARDS,
  ...FINLEE_CARDS,
  ...FIFI_CARDS,
  ...THUMPER_CARDS,
  ...TOOTHLESS_CARDS,
  ...RIOLU_CARDS,
  ...EEVEE_CARDS,
  ...SLUGMEE_CARDS,
  ...BEAKER_CARDS,
  ...HENRY_CARDS,
  ...DEAR_CARDS,
  ...COLE_CARDS,
  ...JOANN_CARDS,
  ...CIDNEY_CARDS,
  ...COW_CARDS,
  ...CHANTEIRA_CARDS,
  ...DOLPHY_CARDS,
  ...SHADOW_CARDS,
  ...SPOT_CARDS,
  ...GEORGE_CARDS,
  ...SLUGER_CARDS,
  ...SPIKE_CARDS,
  ...UMBREON_CARDS,
  ...PINKY_BEAR_CARDS,
  ...BIG_BEAR_CARDS,
  ...ALLIE_CARDS,
  ...TYRANT_CARDS,
  ...UNICORN_CARDS,
  ...GRUMPY_RHINO_CARDS,
  ...FARTY_LAMA_CARDS,
  ...DOLPHER_CARDS,
  ...DOLPHIM_CARDS,
];

export const CARD_MAP = new Map<string, Card>(
  ALL_CARDS.map((card) => [card.id, card])
);
