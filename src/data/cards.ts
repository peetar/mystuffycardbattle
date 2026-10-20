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
    description: 'A hasty needle fix. Revives an unstuffed ally with 15 HP.',
    heal: 15,
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
    description: 'Heal a friendly stuffy for 20 HP.',
    heal: 20,
    isPlayerCard: true,
  },
  {
    id: 'player_heal_minor',
    name: 'Snuggle Band-Aid',
    tier: 'C',
    cost: 1,
    type: 'heal',
    target: 'single_ally',
    description: 'Heal a friendly stuffy for 10 HP.',
    heal: 10,
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
    description: 'Blast an enemy stuffy directly for 18 damage.',
    damage: 18,
    isPlayerCard: true,
  },
  {
    id: 'player_damage_poke',
    name: 'Safety Pin Poke',
    tier: 'C',
    cost: 1,
    type: 'attack',
    target: 'single_enemy',
    description: 'Poke an enemy stuffy for 9 damage.',
    damage: 9,
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
    canRevive: c.canRevive,
    specialActionId: c.specialActionId,
    isPlayerCard: false,
    upgraded: false,
  }));
}

// 1. Alex (Pink Axolotl)
const ALEX_CARDS: Card[] = createStuffyCardSet('alex', [
  // F-Tier
  { id: 'alex_f1', name: 'Derp Stare', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Stares blankly. Deals 8 damage.', damage: 8 },
  { id: 'alex_f2', name: 'Gill Twitch', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Gills flutter aimlessly. Gain 7 Shield.', block: 7 },
  { id: 'alex_f3', name: 'Daydream Drool', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Durp drool splashes. Deals 8 damage.', damage: 8 },
  // D-Tier
  { id: 'alex_d1', name: 'Slow Pink Slap', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'A languid fin slap. Deals 11 damage.', damage: 11 },
  { id: 'alex_d2', name: 'Squishy Posture', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Goes completely limp. Gain 10 Shield.', block: 10 },
  { id: 'alex_d3', name: 'Durp Blink', tier: 'D', cost: 2, type: 'utility', target: 'single_ally', description: 'Smiles cutely. Heals 10 HP.', heal: 10 },
  // C-Tier
  { id: 'alex_c1', name: 'Watery Flail', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Flails in aquarium water. Deals 11 damage.', damage: 11 },
  { id: 'alex_c2', name: 'Amphibian Guard', tier: 'C', cost: 2, type: 'defense', target: 'single_ally', description: 'Shields a teammate with slippery slime. Gain 10 Shield.', block: 10 },
  { id: 'alex_c3', name: 'Gill Regeneration', tier: 'C', cost: 2, type: 'heal', target: 'self', description: 'Regenerates plush skin. Heals 12 HP.', heal: 12 },
  // B-Tier
  { id: 'alex_b1', name: 'Hypnotic Durp', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Stares with unblinking eyes. Deals 15 damage.', damage: 15 },
  { id: 'alex_b2', name: 'Pink Cloud Shield', tier: 'B', cost: 2, type: 'defense', target: 'all_allies', description: 'Releases a pink aura. All allies gain 7 Shield.', block: 7 },
  { id: 'alex_b3', name: 'Axolotl Restoration', tier: 'B', cost: 3, type: 'heal', target: 'single_ally', description: 'Legendary amphibian healing. Heals 18 HP.', heal: 18 },
  // A-Tier
  { id: 'alex_a1', name: 'Telepathic Durp', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'Radiates strange mental waves. Deals 14 damage to all enemies.', damage: 14 },
  { id: 'alex_a2', name: 'Invulnerable Derp', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Completely unbothered by physics. Gain 22 Shield.', block: 22 },
  { id: 'alex_a3', name: 'Mind Static', tier: 'A', cost: 3, type: 'debuff', target: 'single_enemy', description: 'Scrambles enemy brain with derp thoughts. Deals 10 damage and inflicts Brain Damage!', damage: 10, brainDamage: true },
  // S-Tier
  { id: 'alex_s1', name: 'Strokenosis', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', specialActionId: 'strokenosis', description: 'MIND CONTROL: Choose 1 of opponent hand cards to force-play! Alex knows the stuffy owner and card tier.' },
  { id: 'alex_s2', name: 'Ascended Axolotl', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', description: 'Alex transcends. Heals all allies for 20 HP and grants 12 Shield.', heal: 20, block: 12 },
  { id: 'alex_s3', name: 'Durp Cataclysm', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', description: 'The entire battlefield collapses into absurdity. Deals 24 damage to all enemies.', damage: 24 },
]);

// 2. Jefe (Blue Penguin)
const JEFE_CARDS: Card[] = createStuffyCardSet('jefe', [
  // F-Tier
  { id: 'jefe_f1', name: 'Pudge Waddling', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Waddles forward clumsily. Deals 8 damage.', damage: 8 },
  { id: 'jefe_f2', name: 'Deny Being Fat', tier: 'F', cost: 1, type: 'defense', target: 'self', description: '"I am NOT fat! I am pudge!" Gain 8 Shield.', block: 8 },
  { id: 'jefe_f3', name: 'Haughty Peep', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'A snobbish squawk. Deals 7 damage.', damage: 7 },
  // D-Tier
  { id: 'jefe_d1', name: 'Belly Slide', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Slides along on his belly. Deals 11 damage.', damage: 11 },
  { id: 'jefe_d2', name: 'Down Feather Coat', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Puffs up thick feathers. Gain 11 Shield.', block: 11 },
  { id: 'jefe_d3', name: 'Fish Snack Break', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Munches a frozen fish. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'jefe_c1', name: 'Heavy Flipper Swat', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'A weighty wing slap. Deals 12 damage.', damage: 12 },
  { id: 'jefe_c2', name: 'Glacier Guard', tier: 'C', cost: 2, type: 'defense', target: 'single_ally', description: 'Erects an ice block. Grants 12 Shield.', block: 12 },
  { id: 'jefe_c3', name: 'Subzero Shiver', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', description: 'Chilling gusts. Deals 7 damage to all enemies.', damage: 7 },
  // B-Tier
  { id: 'jefe_b1', name: 'Pudge Trample', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Charges with full bodyweight. Deals 16 damage.', damage: 16 },
  { id: 'jefe_b2', name: 'Emperor Fortress', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Solid pudge barrier. Gain 16 Shield.', block: 16 },
  { id: 'jefe_b3', name: 'Blizzard Squall', tier: 'B', cost: 3, type: 'attack', target: 'all_enemies', description: 'Whirlwind of snow. Deals 11 damage to all enemies.', damage: 11 },
  // A-Tier
  { id: 'jefe_a1', name: '"WHO CALLED ME FAT?!"', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Pure enraged fury! Deals 26 damage to the insulter.', damage: 26 },
  { id: 'jefe_a2', name: 'Pudge Megaton Drop', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'Jumps and slams down. Deals 16 damage to all enemies.', damage: 16 },
  { id: 'jefe_a3', name: 'Royal Igloo', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', description: 'Covers all allies in ice dome. Grants 12 Shield to entire team.', block: 12 },
  // S-Tier
  { id: 'jefe_s1', name: 'Earthquake', tier: 'S', cost: 5, type: 'special', target: 'all_enemies', specialActionId: 'earthquake', description: 'Massive AOE (20 dmg)! 75% chance each enemy falls in a crack: 50% miss, take 2x dmg until discarding matching card!' },
  { id: 'jefe_s2', name: 'Avalanche Wrath', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', description: 'Summons an unstoppable snowslide. Deals 28 damage to all enemies.', damage: 28 },
  { id: 'jefe_s3', name: 'Ice Age Emperor', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', description: 'All allies gain 20 Shield and Jefe heals 25 HP.', block: 20, heal: 25 },
]);

// 3. Finlee (Blue Orca)
const FINLEE_CARDS: Card[] = createStuffyCardSet('finlee', [
  // F-Tier
  { id: 'finlee_f1', name: 'Fin Flap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Splashes water with tail fluke. Deals 8 damage.', damage: 8 },
  { id: 'finlee_f2', name: 'Blubber Cushion', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Absorbs shock with blubber. Gain 8 Shield.', block: 8 },
  { id: 'finlee_f3', name: 'Hungry Squeak', tier: 'F', cost: 1, type: 'utility', target: 'self', description: 'Stomach growls loudly. Gain 1 Cracker next turn and 6 Shield.', block: 6 },
  // D-Tier
  { id: 'finlee_d1', name: 'Plush Nibble', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', lifesteal: true, description: 'Nibbles a corner. Deals 10 damage, heals for 10.', damage: 10 },
  { id: 'finlee_d2', name: 'Deep Dive Guard', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Dives beneath waves. Gain 11 Shield.', block: 11 },
  { id: 'finlee_d3', name: 'Krill Snack', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Eats a school of krill. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'finlee_c1', name: 'Apex Bite', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', lifesteal: true, description: 'Chomps with sharp cloth teeth. Deals 11 damage with lifesteal.', damage: 11 },
  { id: 'finlee_c2', name: 'Wave Wall', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', description: 'Erects a water wall. Allies gain 6 Shield.', block: 6 },
  { id: 'finlee_c3', name: 'Tail Slap', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Slaps hard with fluke. Deals 13 damage.', damage: 13 },
  // B-Tier
  { id: 'finlee_b1', name: 'Feeding Frenzy', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', lifesteal: true, description: 'Furious eating attack. Deals 16 damage with lifesteal.', damage: 16 },
  { id: 'finlee_b2', name: 'Tsunami Breach', tier: 'B', cost: 3, type: 'attack', target: 'all_enemies', description: 'Breaches high and lands hard. Deals 12 damage to all enemies.', damage: 12 },
  { id: 'finlee_b3', name: 'Orca Hide', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Tough aquatic skin. Gain 15 Shield.', block: 15 },
  // A-Tier
  { id: 'finlee_a1', name: 'Gluttonous Feast', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', lifesteal: true, description: 'Huge chomp! Deals 24 damage with 100% lifesteal.', damage: 24 },
  { id: 'finlee_a2', name: 'Ocean Apex Roar', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', lifesteal: true, description: 'Deals 14 damage to all enemies and lifesteals the total dealt!', damage: 14 },
  { id: 'finlee_a3', name: 'Vortex Trap', tier: 'A', cost: 3, type: 'debuff', target: 'single_enemy', description: 'Pulls enemy into whirlpool. Deals 15 damage and disables them for a turn.', damage: 15, brainDamage: true },
  // S-Tier
  { id: 'finlee_s1', name: 'Swallow Whole', tier: 'S', cost: 5, type: 'special', target: 'single_enemy', specialActionId: 'swallow_whole', description: 'EATS TARGET ENEMY WHOLE! Target takes 45 lethal damage. CANNOT BE RESTITCHED. Finlee heals for that amount!' },
  { id: 'finlee_s2', name: 'Maelstrom Devourer', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', lifesteal: true, description: 'Engulfs all enemies in a titanic wave. Deals 22 damage to each, healing Finlee for total dealt.', damage: 22 },
  { id: 'finlee_s3', name: 'Leviathan Hunger', tier: 'S', cost: 3, type: 'utility', target: 'self', description: 'Finlee gains +20 Max HP and full heals to maximum stuffing.', heal: 50 },
]);

// 4. Fifi (Red Fox)
const FIFI_CARDS: Card[] = createStuffyCardSet('fifi', [
  // F-Tier
  { id: 'fifi_f1', name: 'Little Toot', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', poison: 1, description: 'A tiny fart. Deals 7 damage and 1 Poison.', damage: 7 },
  { id: 'fifi_f2', name: 'Fox Crouch', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Crouches in tall grass. Gain 8 Shield.', block: 8 },
  { id: 'fifi_f3', name: 'Bushy Tail Wag', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Distracts foe with fluffy tail. Deals 8 damage.', damage: 8 },
  // D-Tier
  { id: 'fifi_d1', name: 'Smelly Pounce', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', poison: 2, description: 'Pounces with smelly gas. Deals 10 damage and 2 Poison.', damage: 10 },
  { id: 'fifi_d2', name: 'Chubby Roll', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Rolls away like a round ball. Gain 11 Shield.', block: 11 },
  { id: 'fifi_d3', name: 'Snack N Sniff', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Chews on forest treats. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'fifi_c1', name: 'Stinky Cloud', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', poison: 3, description: 'Releases a foul fog. Deals 4 damage and 3 Poison to all enemies.', damage: 4 },
  { id: 'fifi_c2', name: 'Red Fur Barrier', tier: 'C', cost: 2, type: 'defense', target: 'single_ally', description: 'Shields ally with dense fur. Grants 11 Shield.', block: 11 },
  { id: 'fifi_c3', name: 'Toxic Scratch', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', poison: 3, description: 'Sharp claws coated in scent. Deals 9 damage and 3 Poison.', damage: 9 },
  // B-Tier
  { id: 'fifi_b1', name: 'Rip-Roaring Rip', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', poison: 4, description: 'Massive gas explosion! Deals 12 damage and 4 Poison.', damage: 12 },
  { id: 'fifi_b2', name: 'Pungent Haze', tier: 'B', cost: 2, type: 'defense', target: 'all_allies', description: 'Toxic smokescreen hides team. All allies gain 8 Shield.', block: 8 },
  { id: 'fifi_b3', name: 'Rotten Berry Feast', tier: 'B', cost: 2, type: 'heal', target: 'self', poison: 2, description: 'Eats fermented berries. Heals 16 HP, inflicts 2 Poison to enemies.', heal: 16 },
  // A-Tier
  { id: 'fifi_a1', name: 'Toxic Gas Prowl', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', poison: 5, description: 'Prowls through dense smog. Deals 10 damage and 5 Poison to all enemies.', damage: 10 },
  { id: 'fifi_a2', name: 'Sulfur Bomb', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', poison: 7, description: 'Concentrated stank bomb! Deals 15 damage and 7 Poison.', damage: 15 },
  { id: 'fifi_a3', name: 'Chubby Gas Armor', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Envelops self in dense green fumes. Gain 20 Shield.', block: 20 },
  // S-Tier
  { id: 'fifi_s1', name: 'Supernova Flatulence', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', poison: 10, description: 'THE MOTHER OF ALL FARTS! Deals 18 damage and 10 Poison DoT to all enemies!' },
  { id: 'fifi_s2', name: 'Miasma Catastrophe', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', description: 'Double all poison counters currently active on all enemies, then deal 15 damage!', damage: 15 },
  { id: 'fifi_s3', name: 'Fox Den Sanctuary', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', description: 'All allies heal 18 HP and gain 14 Shield behind a pungent perimeter.', heal: 18, block: 14 },
]);

// 5. Thumper (Grey Hammerhead)
const THUMPER_CARDS: Card[] = createStuffyCardSet('thumper', [
  // F-Tier
  { id: 'thumper_f1', name: 'Bonk', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A mild head tap. Deals 8 damage.', damage: 8 },
  { id: 'thumper_f2', name: 'Wide Head Deflect', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Angles hammerhead. Gain 8 Shield.', block: 8 },
  { id: 'thumper_f3', name: 'Thump Floor', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Rhythmical floor tap. Deals 7 damage.', damage: 7 },
  // D-Tier
  { id: 'thumper_d1', name: 'Heavy Whack', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Solid hit with snout. Deals 11 damage.', damage: 11 },
  { id: 'thumper_d2', name: 'Shark Fin Parry', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Parries with dorsal fin. Gain 10 Shield.', block: 10 },
  { id: 'thumper_d3', name: 'Taco Crunch', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Chunches on hard taco. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'thumper_c1', name: 'Double Thump', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Left and right head strike. Deals 13 damage.', damage: 13 },
  { id: 'thumper_c2', name: 'Steel Head Guard', tier: 'C', cost: 2, type: 'defense', target: 'single_ally', description: 'Intercepts blow. Grants 12 Shield.', block: 12 },
  { id: 'thumper_c3', name: 'Ground Pound', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', description: 'Slams head into turf. Deals 8 damage to all enemies.', damage: 8 },
  // B-Tier
  { id: 'thumper_b1', name: 'Concussion Strike', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Ringing strike. Deals 15 damage.', damage: 15 },
  { id: 'thumper_b2', name: 'Hammerhead Bulwark', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Dense grey cartilage. Gain 16 Shield.', block: 16 },
  { id: 'thumper_b3', name: 'Thump Resonance', tier: 'B', cost: 3, type: 'attack', target: 'all_enemies', description: 'Vibrating shockwave. Deals 11 damage to all enemies.', damage: 11 },
  // A-Tier
  { id: 'thumper_a1', name: 'Brain Damage', tier: 'A', cost: 3, type: 'debuff', target: 'single_enemy', brainDamage: true, description: 'Cracking concussion! Deals 16 damage and BRAIN DAMAGES target: disabled until healed!', damage: 16 },
  { id: 'thumper_a2', name: 'Sledgehammer Smash', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Massive full-force slam. Deals 27 damage.', damage: 27 },
  { id: 'thumper_a3', name: 'Unbreakable Skull', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Gain 24 Shield and reflect 8 damage back at attackers.', block: 24 },
  // S-Tier
  { id: 'thumper_s1', name: 'Cranial Earthquake', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', brainDamage: true, description: 'Titanic head smash! Deals 22 damage to all enemies and brain damages the strongest enemy!', damage: 22 },
  { id: 'thumper_s2', name: 'Mega Thump Extermination', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Target is driven 6 feet into the ground. Deals 42 damage!', damage: 42 },
  { id: 'thumper_s3', name: 'Titanium Hammer Stance', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', description: 'All allies gain 18 Shield and 50% damage reduction for 1 turn.', block: 18 },
]);

// 6. Toothless (Night Fury)
const TOOTHLESS_CARDS: Card[] = createStuffyCardSet('toothless', [
  // F-Tier
  { id: 'toothless_f1', name: 'Tiny Plasma Spark', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A small blue flame. Deals 8 damage.', damage: 8 },
  { id: 'toothless_f2', name: 'Wing Wrap', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Folds dark wings. Gain 8 Shield.', block: 8 },
  { id: 'toothless_f3', name: 'Toothless Grin', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Retracts teeth and smiles. Deals 7 damage.', damage: 7 },
  // D-Tier
  { id: 'toothless_d1', name: 'Plasma Poo Pellet', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Drops a little plasma poo pellet. Deals 11 damage.', damage: 11 },
  { id: 'toothless_d2', name: 'Night Fury Scale', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Sleek black scales deflect blows. Gain 10 Shield.', block: 10 },
  { id: 'toothless_d3', name: 'Salmon Gulp', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Swallows a whole fish. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'toothless_c1', name: 'Dive-Bomb Plasma', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Screaming dive with blue blast. Deals 13 damage.', damage: 13 },
  { id: 'toothless_c2', name: 'Smoke Shroud', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', description: 'Black dragon smoke. Grants all allies 6 Shield.', block: 6 },
  { id: 'toothless_c3', name: 'Tail Whip', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', description: 'Spins prosthetic tail fin. Deals 7 damage to all enemies.', damage: 7 },
  // B-Tier
  { id: 'toothless_b1', name: 'Explosive Plasma Poo', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Fiery dragon ordnance! Deals 17 damage.', damage: 17 },
  { id: 'toothless_b2', name: 'Supersonic Stealth', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Blends into night sky. Gain 16 Shield.', block: 16 },
  { id: 'toothless_b3', name: 'Cluster Poo Bomb', tier: 'B', cost: 3, type: 'attack', target: 'all_enemies', description: 'Scatters plasma poos across field. Deals 11 damage to all enemies.', damage: 11 },
  // A-Tier
  { id: 'toothless_a1', name: 'Alpha Dragon Blast', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Charged blue inferno. Deals 28 damage.', damage: 28 },
  { id: 'toothless_a2', name: 'Lightning Dive Bomb', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'Cloaked in blue lightning. Deals 16 damage to all enemies.', damage: 16 },
  { id: 'toothless_a3', name: 'Night Cloak', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Gain 22 Shield and Toothless dodges next attack.', block: 22 },
  // S-Tier
  { id: 'toothless_s1', name: 'Colossal Plasma Poo Barrage', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', description: 'Total carpet bombing of neon plasma! Deals 26 damage to all enemies and scorches field.' , damage: 26},
  { id: 'toothless_s2', name: 'Alpha Mode Awakening', tier: 'S', cost: 4, type: 'utility', target: 'self', description: 'Spines glow neon blue. Toothless gains 30 Shield and next attack deals triple damage!', block: 30 },
  { id: 'toothless_s3', name: 'Dragon King Inferno', tier: 'S', cost: 5, type: 'attack', target: 'single_enemy', description: 'Unleashes the full wrath of the Hidden World. Deals 45 catastrophic damage!', damage: 45 },
]);

// 7. Riolu (Pokémon - Dedicated Healer)
const RIOLU_CARDS: Card[] = createStuffyCardSet('riolu', [
  // F-Tier
  { id: 'riolu_f1', name: 'Gentle Aura Touch', tier: 'F', cost: 1, type: 'heal', target: 'single_ally', description: 'A mild pulse of aura. Heals 8 HP.', heal: 8 },
  { id: 'riolu_f2', name: 'Aura Barrier', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Blue aura shield. Gain 8 Shield.', block: 8 },
  { id: 'riolu_f3', name: 'Pup Jab', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A light training jab. Deals 8 damage.', damage: 8 },
  // D-Tier
  { id: 'riolu_d1', name: 'Life Pulse', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Sends a wave of warm light. Heals 11 HP.', heal: 11 },
  { id: 'riolu_d2', name: 'Aura Deflect', tier: 'D', cost: 1, type: 'defense', target: 'single_ally', description: 'Shields friend. Grants 7 Shield.', block: 10 },
  { id: 'riolu_d3', name: 'Aura Palm', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Focuses fighting spirit. Deals 11 damage.', damage: 11 },
  // C-Tier
  { id: 'riolu_c1', name: 'Aura Mend', tier: 'C', cost: 2, type: 'heal', target: 'single_ally', description: 'Channeled healing. Restores 14 HP to an ally.', heal: 14 },
  { id: 'riolu_c2', name: 'Team Radiance', tier: 'C', cost: 2, type: 'heal', target: 'all_allies', description: 'Aura washes over party. Heals all allies for 7 HP.', heal: 7 },
  { id: 'riolu_c3', name: 'Vacuum Wave', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Swirling blue wave. Deals 11 damage.', damage: 11 },
  // B-Tier
  { id: 'riolu_b1', name: 'Rejuvenating Wave', tier: 'B', cost: 2, type: 'heal', target: 'single_ally', description: 'High-power aura infusion. Heals 20 HP.', heal: 20 },
  { id: 'riolu_b2', name: 'Aura Sanctuary', tier: 'B', cost: 2, type: 'defense', target: 'all_allies', description: 'Domes the party. All allies gain 10 Shield.', block: 10 },
  { id: 'riolu_b3', name: 'Aura Restitch', tier: 'B', cost: 3, type: 'restitch', target: 'unstuffed_ally', canRevive: true, description: 'Revives an unstuffed ally with 18 HP!', heal: 18 },
  // A-Tier
  { id: 'riolu_a1', name: 'Greater Aura Revival', tier: 'A', cost: 3, type: 'restitch', target: 'unstuffed_ally', canRevive: true, description: 'Pours life aura into fallen stuffy. Revives with 35 HP!', heal: 35 },
  { id: 'riolu_a2', name: 'Full Team Blessing', tier: 'A', cost: 3, type: 'heal', target: 'all_allies', description: 'Restores 16 HP and removes all negative status effects from all allies!', heal: 16 },
  { id: 'riolu_a3', name: 'Aura Sphere', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Never-miss aura projectile. Deals 24 damage.', damage: 24 },
  // S-Tier
  { id: 'riolu_s1', name: 'Miracle of the Aura', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', description: 'Heals entire party for 28 HP and grants 15 Shield to all!', heal: 28, block: 15 },
  { id: 'riolu_s2', name: 'Twin Soul Restitch', tier: 'S', cost: 4, type: 'restitch', target: 'all_allies', canRevive: true, description: 'Breathes life into all unstuffed teammates! Revives any fallen ally with 25 HP!', heal: 25 },
  { id: 'riolu_s3', name: 'Aura Overcharge Cannon', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', description: 'Converts positive healing energy into offensive brilliance. Deals 22 damage to all foes.', damage: 22 },
]);

// 8. Eevee (Pokémon - Creepy Lasers & Missiles)
const EEVEE_CARDS: Card[] = createStuffyCardSet('eevee', [
  // F-Tier
  { id: 'eevee_f1', name: 'Creepy Gaze', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Unblinking red eyes. Deals 8 damage.', damage: 8 },
  { id: 'eevee_f2', name: 'Fluffy Static', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Static fur sparks. Gain 8 Shield.', block: 8 },
  { id: 'eevee_f3', name: 'Mini Spark', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Little laser point. Deals 8 damage.', damage: 8 },
  // D-Tier
  { id: 'eevee_d1', name: 'Micro Laser', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Fires a thin scarlet laser beam. Deals 11 damage.', damage: 11 },
  { id: 'eevee_d2', name: 'Hologram Shield', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Creepy geometric ward. Gain 10 Shield.', block: 10 },
  { id: 'eevee_d3', name: 'Occult Candy Snack', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Munches starlight candy. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'eevee_c1', name: 'Creepy Eye Laser', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Twin crimson death rays from eyes. Deals 13 damage.', damage: 13 },
  { id: 'eevee_c2', name: 'Quantum Mane Barrier', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', description: 'Glitches reality. All allies gain 6 Shield.', block: 6 },
  { id: 'eevee_c3', name: 'Micro Homing Dart', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', description: 'Tiny missiles fly around. Deals 7 damage to all enemies.', damage: 7 },
  // B-Tier
  { id: 'eevee_b1', name: 'Plushie Homing Missiles', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Back pops open with rocket tubes. Deals 17 damage.', damage: 17 },
  { id: 'eevee_b2', name: 'Psychic Distortion', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Phases out of phase. Gain 16 Shield.', block: 16 },
  { id: 'eevee_b3', name: 'Creepy Laugh', tier: 'B', cost: 2, type: 'debuff', target: 'all_enemies', description: 'Disturbing laughter. Deals 8 damage and reduces enemy attack.', damage: 8 },
  // A-Tier
  { id: 'eevee_a1', name: 'Orbital Strike Laser', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Calls down a satellite beam. Deals 28 damage.', damage: 28 },
  { id: 'eevee_a2', name: 'Missile Swarm Hellfire', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'Fires 12 guided missiles. Deals 15 damage to all enemies.', damage: 15 },
  { id: 'eevee_a3', name: 'Creepy Cyber Ward', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', description: 'Matrix barrier. Grants 12 Shield to entire party.', block: 12 },
  // S-Tier
  { id: 'eevee_s1', name: 'Macabre Death Cannon', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', description: 'Opens its chest to reveal a terrifying particle weapon. Deals 44 laser damage!', damage: 44 },
  { id: 'eevee_s2', name: 'Apocalyptic Missile Salvo', tier: 'S', cost: 5, type: 'attack', target: 'all_enemies', description: 'Blankets entire enemy side in explosions! Deals 26 damage to all enemies.', damage: 26 },
  { id: 'eevee_s3', name: 'Creepy Reality Glitch', tier: 'S', cost: 3, type: 'utility', target: 'self', description: 'Glitch out: Gain 25 Shield and draw 3 bonus cards immediately!', block: 25 },
]);

// 9. Slugmee (Yellow Slug - Murder Melodist)
const SLUGMEE_CARDS: Card[] = createStuffyCardSet('slugmee', [
  // F-Tier
  { id: 'slugmee_f1', name: 'Humming a Tune', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Hums softly. Deals 7 damage.', damage: 7 },
  { id: 'slugmee_f2', name: 'Slime Coat', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Coats self in yellow goo. Gain 8 Shield.', block: 8 },
  { id: 'slugmee_f3', name: 'Slow Crawl', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Crawls forward slowly. Deals 8 damage.', damage: 8 },
  // D-Tier
  { id: 'slugmee_d1', name: 'Sticky Song', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Sings a sticky chorus. Deals 11 damage.', damage: 11 },
  { id: 'slugmee_d2', name: 'Mucus Cocoon', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Hides in mucus. Gain 11 Shield.', block: 11 },
  { id: 'slugmee_d3', name: 'Sugar Leaf Bite', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Eats sweet foliage. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'slugmee_c1', name: 'Creepy Chorus', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', description: 'Eerie harmonies. Deals 6 damage to all foes.', damage: 6 },
  { id: 'slugmee_c2', name: 'Sticky Slime Wall', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', description: 'Slimes the floor. Allies gain 7 Shield.', block: 7 },
  { id: 'slugmee_c3', name: 'Slime Acid Lash', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Acidic slime whip. Deals 12 damage.', damage: 12 },
  // B-Tier
  { id: 'slugmee_b1', name: 'Deadly Lullaby', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'A song that puts plushies to sleep. Deals 16 damage.', damage: 16 },
  { id: 'slugmee_b2', name: 'Yellow Gel Barrier', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Thick yellow gel. Gain 16 Shield.', block: 16 },
  { id: 'slugmee_b3', name: 'Slug Sacrifice Heal', tier: 'B', cost: 2, type: 'heal', target: 'single_ally', description: 'Slugmee loses 5 HP to heal an ally for 22 HP!', heal: 22 },
  // A-Tier
  { id: 'slugmee_a1', name: 'Murder Hug', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Squishes an enemy tightly. Deals 25 damage.', damage: 25 },
  { id: 'slugmee_a2', name: 'Melodic Resonance', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'A piercing scream song. Deals 15 damage to all enemies.', damage: 15 },
  { id: 'slugmee_a3', name: 'Slug Slime Shield', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', description: 'All allies gain 14 Shield and 5 counter-damage.', block: 14 },
  // S-Tier
  { id: 'slugmee_s1', name: 'Slug Me, Slug You, Now I\'m Gonna Hug You', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', specialActionId: 'slug_hug', canRevive: true, description: 'THE DEADLY SONG: Slugmee takes 10 damage (if killed, stops!). Deals 35 damage to target, heals self for 20, and revives 1 fallen ally with 20 HP!' },
  { id: 'slugmee_s2', name: 'Symphony of the Slime', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', canRevive: true, description: 'Sings the ultimate lullaby. Revives any fallen teammate with 25 HP and heals active allies for 20 HP.', heal: 20 },
  { id: 'slugmee_s3', name: 'Toxic Yellow Maw', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Engulfs target in yellow digestive enzymes. Deals 40 damage.', damage: 40 },
]);

// 10. Beaker (Yosemite Owl - Wise & Passive Healer)
const BEAKER_CARDS: Card[] = createStuffyCardSet('beaker', [
  // F-Tier
  { id: 'beaker_f1', name: 'Wise Hoot', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Hoo hoo! Deals 7 damage.', damage: 7 },
  { id: 'beaker_f2', name: 'Feather Fluff', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Puffs brown feathers. Gain 8 Shield.', block: 8 },
  { id: 'beaker_f3', name: 'Talon Tap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Light talon scratch. Deals 8 damage.', damage: 8 },
  // D-Tier
  { id: 'beaker_d1', name: 'Gliding Strike', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Glides in silently. Deals 11 damage.', damage: 11 },
  { id: 'beaker_d2', name: 'Owl Roost', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Perches securely. Gain 11 Shield.', block: 11 },
  { id: 'beaker_d3', name: 'Cricket Feast', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Munches Yosemite crickets. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'beaker_c1', name: 'Silent Dive', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Swoops from high branches. Deals 12 damage.', damage: 12 },
  { id: 'beaker_c2', name: 'Wing Gale', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', description: 'Flaps strong wings. All allies gain 6 Shield.', block: 6 },
  { id: 'beaker_c3', name: 'Wise Counsel', tier: 'C', cost: 2, type: 'utility', target: 'single_ally', description: 'Whispers sage advice. Ally deals +5 damage next attack.', heal: 5 },
  // B-Tier
  { id: 'beaker_b1', name: 'Yosemite Talon Slash', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Ripping talons. Deals 16 damage.', damage: 16 },
  { id: 'beaker_b2', name: 'Granite Wall Perch', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Steely Yosemite granite guard. Gain 16 Shield.', block: 16 },
  { id: 'beaker_b3', name: 'Owl Night Vision', tier: 'B', cost: 2, type: 'utility', target: 'none', description: 'Reveals all enemy intentions and draws 2 cards.', block: 5 },
  // A-Tier
  { id: 'beaker_a1', name: 'El Capitan Dive Bomb', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Plummets from the top of El Capitan! Deals 28 damage.', damage: 28 },
  { id: 'beaker_a2', name: 'Half Dome Cyclone', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'Vortex of pine needles and wind. Deals 15 damage to all foes.', damage: 15 },
  { id: 'beaker_a3', name: 'Ancient Forest Wisdom', tier: 'A', cost: 3, type: 'heal', target: 'all_allies', description: 'Restores 15 HP to all allies and boosts Beaker passive regen to +3 HP/turn!', heal: 15 },
  // S-Tier
  { id: 'beaker_s1', name: 'Cataclysmic Yosemite Dive', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', description: 'Terminal velocity dive bomb! Deals 42 damage and stuns the target!', damage: 42 },
  { id: 'beaker_s2', name: 'Spirit of the National Park', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', description: 'All allies gain 20 Shield, +2 Crackers, and Beaker heals to full HP!', block: 20 },
  { id: 'beaker_s3', name: 'Nocturnal Apex Predator', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', description: 'Sweeps through darkness across all targets. Deals 24 damage to all enemies.', damage: 24 },
]);

// 11. Henry (Baby Turtle - Potty Tank)
const HENRY_CARDS: Card[] = createStuffyCardSet('henry', [
  // F-Tier
  { id: 'henry_f1', name: 'Potty Squirm', tier: 'F', cost: 1, type: 'utility', target: 'self', description: 'Squirms urgently. Deals 7 damage.', damage: 7 },
  { id: 'henry_f2', name: 'Tiny Shell Hide', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Pulls head in. Gain 8 Shield.', block: 8 },
  { id: 'henry_f3', name: 'Baby Nip', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Toothless baby nip. Deals 8 damage.', damage: 8 },
  // D-Tier
  { id: 'henry_d1', name: 'Diaper Clatter', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Safety pin armor. Gain 10 Shield.', block: 10 },
  { id: 'henry_d2', name: 'Toddler Bump', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Bumps into foe. Deals 11 damage.', damage: 11 },
  { id: 'henry_d3', name: 'Lettuce Nibble', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Eats lettuce leaf. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'henry_c1', name: '"I GOTTA GO POTTY!"', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Frantic potty charge! Deals 12 damage.', damage: 12 },
  { id: 'henry_c2', name: 'Shell Guard', tier: 'C', cost: 2, type: 'defense', target: 'single_ally', description: 'Protects brother or friend. Grants 12 Shield.', block: 12 },
  { id: 'henry_c3', name: 'Baby Tantrum', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', description: 'Flails all 4 flippers. Deals 7 damage to all enemies.', damage: 7 },
  // B-Tier
  { id: 'henry_b1', name: 'Heavy Baby Slam', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Slams his shell with surprisingly high mass. Deals 16 damage.', damage: 16 },
  { id: 'henry_b2', name: 'Fortified Shell', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Hardens shell plates. Gain 18 Shield.', block: 18 },
  { id: 'henry_b3', name: 'Potty Emergency Taunt', tier: 'B', cost: 2, type: 'utility', target: 'all_enemies', taunt: true, description: 'Loudly yells! Taunts enemies to hit Henry, and Henry gains 12 Shield.', block: 12 },
  // A-Tier
  { id: 'henry_a1', name: 'Shell Up', tier: 'A', cost: 3, type: 'special', target: 'self', specialActionId: 'shell_up', taunt: true, description: 'TAUNTS ALL ENEMIES! Henry forces all enemies to attack him, but takes 75% LESS DAMAGE for 1 turn! Gain 15 Shield.', block: 15 },
  { id: 'henry_a2', name: 'Unbreakable Diaper Pin', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Pin locks into place. Gain 28 Shield.', block: 28 },
  { id: 'henry_a3', name: 'Turtle Family Barrier', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', description: 'Covers entire team in protective turtle shells. All allies gain 14 Shield.', block: 14 },
  // S-Tier
  { id: 'henry_s1', name: 'Indestructible Potty Bunker', tier: 'S', cost: 4, type: 'defense', target: 'self', taunt: true, description: 'Henry locks himself in the ultimate ceramic shell! Gain 40 Shield, taunt all enemies, take 85% reduced damage!', block: 40 },
  { id: 'henry_s2', name: 'Baby Turtle Stampede', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', description: 'Henry leads a tidal surge of baby turtles. Deals 24 damage to all enemies.', damage: 24 },
  { id: 'henry_s3', name: 'Potty Time Catastrophe', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'He couldn\'t hold it any longer! Unleashes 40 apocalyptic pressurized damage!', damage: 40 },
]);

// 12. Dear (Mini Poison Dart Frog)
const DEAR_CARDS: Card[] = createStuffyCardSet('dear', [
  // F-Tier
  { id: 'dear_f1', name: 'Micro Ribbit', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Tiny squeaky ribbit. Deals 7 damage.', damage: 7 },
  { id: 'dear_f2', name: 'Dewdrop Hop', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Hops onto a leaf. Gain 8 Shield.', block: 8 },
  { id: 'dear_f3', name: 'Sticky Toe', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Tiny suction cup touch. Deals 8 damage.', damage: 8 },
  // D-Tier
  { id: 'dear_d1', name: 'Dart Tongue Flick', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', poison: 2, description: 'Fast tongue snap. Deals 11 damage and 2 Poison.', damage: 11 },
  { id: 'dear_d2', name: 'Slippery Blue Skin', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Very hard to grab. Gain 10 Shield.', block: 10 },
  { id: 'dear_d3', name: 'Fly Munch', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Catches a fly. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'dear_c1', name: 'Poison Dart Spit', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', poison: 3, description: 'Shoots a bead of frog toxin. Deals 8 damage and 3 Poison.', damage: 8 },
  { id: 'dear_c2', name: 'Camouflage Leaf', tier: 'C', cost: 2, type: 'defense', target: 'single_ally', description: 'Hides ally. Grants 10 Shield.', block: 10 },
  { id: 'dear_c3', name: 'Toxic Puddle', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', poison: 2, description: 'Leaves cyan poison puddles. Deals 5 damage and 2 Poison to all enemies.', damage: 5 },
  // B-Tier
  { id: 'dear_b1', name: 'Cyan Dart Lash', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', poison: 4, description: 'Whips with venomous tongue. Deals 12 damage and 4 Poison.', damage: 12 },
  { id: 'dear_b2', name: 'Neurotoxin Skin', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Skin gleams with poison. Gain 15 Shield; attackers gain 2 Poison.', block: 15 },
  { id: 'dear_b3', name: 'Acrobatic Lily Hop', tier: 'B', cost: 2, type: 'utility', target: 'none', description: 'Dodges incoming fire and draws 2 cards.', block: 6 },
  // A-Tier
  { id: 'dear_a1', name: 'Golden Batrachotoxin', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', poison: 7, description: 'The deadliest toxin in nature! Deals 14 damage and 7 Poison DoT.', damage: 14 },
  { id: 'dear_a2', name: 'Toxic Rainforest Rain', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', poison: 4, description: 'Cyan mist coats everything. Deals 10 damage and 4 Poison to all enemies.', damage: 10 },
  { id: 'dear_a3', name: 'Micro-Frog Evasion', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Too small to hit! Gain 24 Shield and 50% dodge chance.', block: 24 },
  // S-Tier
  { id: 'dear_s1', name: 'Lethal Dart Epidemic', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', poison: 10, description: 'Explosive blast of pure Amazonian dart toxin! Deals 16 damage and 10 Poison to all foes!' },
  { id: 'dear_s2', name: 'Cyan Ghost Strike', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Blinks behind target and delivers a paralyzing sting. Deals 38 damage and stuns.', damage: 38 },
  { id: 'dear_s3', name: 'Jungle Oasis Rebirth', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', description: 'Purifies the jungle. All allies heal 22 HP and gain 14 Shield.', heal: 22, block: 14 },
]);

// 13. Cole (Mini Turtle - Toddler Spinner)
const COLE_CARDS: Card[] = createStuffyCardSet('cole', [
  // F-Tier
  { id: 'cole_f1', name: 'Toddler Wobble', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Wobbles forward. Deals 8 damage.', damage: 8 },
  { id: 'cole_f2', name: 'Mini Shell Tuck', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Tucks into mini green shell. Gain 8 Shield.', block: 8 },
  { id: 'cole_f3', name: 'Brotherly Cheep', tier: 'F', cost: 1, type: 'utility', target: 'single_ally', description: 'Cheers on Henry. Ally gains 7 Shield.', block: 7 },
  // D-Tier
  { id: 'cole_d1', name: 'Toddler Spin', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Spins around on belly. Deals 11 damage.', damage: 11 },
  { id: 'cole_d2', name: 'Hard Shell Clatter', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Snaps shell tight. Gain 10 Shield.', block: 10 },
  { id: 'cole_d3', name: 'Kiwi Nibble', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Munches juicy kiwi. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'cole_c1', name: 'Spinning Shell Toss', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Launches spinning shell like a hockey puck. Deals 12 damage.', damage: 12 },
  { id: 'cole_c2', name: 'Brotherly Barrier', tier: 'C', cost: 2, type: 'defense', target: 'single_ally', description: 'Shields Henry or friend with 13 Shield.', block: 13 },
  { id: 'cole_c3', name: 'Shell Ricochet', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', description: 'Bounces off all enemies. Deals 7 damage to all.', damage: 7 },
  // B-Tier
  { id: 'cole_b1', name: 'Turbo Spin Attack', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'High-speed drill spin! Deals 16 damage.', damage: 16 },
  { id: 'cole_b2', name: 'Turtle Shell Phalanx', tier: 'B', cost: 2, type: 'defense', target: 'all_allies', description: 'All allies gain 9 Shield.', block: 9 },
  { id: 'cole_b3', name: 'Armored Roll', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Deals 10 damage and Cole gains 10 Shield.', damage: 10, block: 10 },
  // A-Tier
  { id: 'cole_a1', name: 'Toddler Bowling Ball', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'Spins through the entire enemy team like bowling pins! Deals 16 damage to all.', damage: 16 },
  { id: 'cole_a2', name: 'Unbreakable Mini Shell', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Completely invulnerable stance. Gain 26 Shield.', block: 26 },
  { id: 'cole_a3', name: 'Brotherly Synergy', tier: 'A', cost: 3, type: 'heal', target: 'all_allies', description: 'Heals all allies for 14 HP and grants 12 Shield.', heal: 14, block: 12 },
  // S-Tier
  { id: 'cole_s1', name: 'Super Sonic Shell Storm', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', description: 'Spins at Mach 3! Deals 26 damage to all enemies and leaves Cole with 20 Shield.', damage: 26, block: 20 },
  { id: 'cole_s2', name: 'Fortress of the Mini Turtles', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', description: 'All allies gain 22 Shield and reflect 50% damage back to attackers for 1 turn.', block: 22 },
  { id: 'cole_s3', name: 'Giga Shell Impact', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Direct rocket shell impact. Deals 42 crushing damage!', damage: 42 },
]);

// 14. Joann (Brown Cat - Table Disrupter)
const JOANN_CARDS: Card[] = createStuffyCardSet('joann', [
  // F-Tier
  { id: 'joann_f1', name: 'Bored Paw Swat', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A half-hearted swat. Deals 8 damage.', damage: 8 },
  { id: 'joann_f2', name: 'Feline Loaf', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Tucks paws in. Gain 8 Shield.', block: 8 },
  { id: 'joann_f3', name: 'Haughty Meow', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Demands food. Deals 7 damage.', damage: 7 },
  // D-Tier
  { id: 'joann_d1', name: 'Scratch Post Shred', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Scratches fabric. Deals 11 damage.', damage: 11 },
  { id: 'joann_d2', name: 'Agile Leap', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Leaps onto a bookshelf. Gain 10 Shield.', block: 10 },
  { id: 'joann_d3', name: 'Tuna Lick', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Eats canned tuna. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'joann_c1', name: 'Pounce From Shadows', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Ambush from the dark. Deals 13 damage.', damage: 13 },
  { id: 'joann_c2', name: 'Feline Reflexes', tier: 'C', cost: 2, type: 'defense', target: 'self', description: 'Twists in mid-air. Gain 12 Shield.', block: 12 },
  { id: 'joann_c3', name: 'Tail Flick Distraction', tier: 'C', cost: 2, type: 'utility', target: 'single_enemy', description: 'Forces enemy to hesitate. Deals 8 damage and draws a card.', damage: 8 },
  // B-Tier
  { id: 'joann_b1', name: 'Nine-Lives Pounce', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'A furious flurry of claws. Deals 16 damage.', damage: 16 },
  { id: 'joann_b2', name: 'Card Shredder Claws', tier: 'B', cost: 2, type: 'debuff', target: 'single_enemy', description: 'Shreds an opponent’s strategy! Deals 10 damage and forces 1 card discard.', damage: 10 },
  { id: 'joann_b3', name: 'Warm Sunbeam Nap', tier: 'B', cost: 2, type: 'heal', target: 'self', description: 'Basks in warm light. Heals 16 HP.', heal: 16 },
  // A-Tier
  { id: 'joann_a1', name: 'Knock Off Table', tier: 'A', cost: 3, type: 'special', target: 'single_enemy', specialActionId: 'knock_off_table', description: 'Looks straight into opponent’s eyes and KNOCKS THEIR CARD OFF THE TABLE! Forces 2 random discards and deals 15 damage.', damage: 15 },
  { id: 'joann_a2', name: 'Midnight Zoomies', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'Dashes around at 3 AM! Deals 16 damage to all enemies.', damage: 16 },
  { id: 'joann_a3', name: 'Nine-Lives Aegis', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Gain 24 Shield and if Joann would be unstuffed this turn, survive with 1 HP.', block: 24 },
  // S-Tier
  { id: 'joann_s1', name: 'Total Table Cleanse', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', description: 'Knocks EVERYTHING off the table! Forces opponent to discard 3 cards, deals 22 damage to all enemies!' , damage: 22},
  { id: 'joann_s2', name: 'Apex Feline Execution', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Zero remorse predator strike. Deals 42 pinpoint damage.', damage: 42 },
  { id: 'joann_s3', name: 'Feline Royalty', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', description: 'All allies heal 20 HP, gain 15 Shield, and Joann gets +2 Crackers.', heal: 20, block: 15 },
]);

// 15. Cidney (Fat Squirrel - Acorn Hoarder & Chonk Slam)
const CIDNEY_CARDS: Card[] = createStuffyCardSet('cidney', [
  // F-Tier
  { id: 'cidney_f1', name: 'Cheek Stash', tier: 'F', cost: 1, type: 'utility', target: 'self', description: 'Puffs cheeks with small nuts. Gain 7 Shield.', block: 7 },
  { id: 'cidney_f2', name: 'Waddle Bounce', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Bounces heavily into foe. Deals 8 damage.', damage: 8 },
  { id: 'cidney_f3', name: 'Tail Fluff Guard', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Hides behind massive bushy tail. Gain 8 Shield.', block: 8 },
  // D-Tier
  { id: 'cidney_d1', name: 'Acorn Toss', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Throws a little acorn. Deals 11 damage.', damage: 11 },
  { id: 'cidney_d2', name: 'Fat Layer Armor', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Dense squishy padding. Gain 10 Shield.', block: 10 },
  { id: 'cidney_d3', name: 'Walnut Crack', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Eats cracked walnut. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'cidney_c1', name: 'Belly Bump', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'A massive gut thrust. Deals 13 damage.', damage: 13 },
  { id: 'cidney_c2', name: 'Acorn Stockpile', tier: 'C', cost: 2, type: 'utility', target: 'none', description: 'Unearths a buried acorn! Gain +1 Cracker next turn and 8 Shield.', block: 8 },
  { id: 'cidney_c3', name: 'Acorn Hailstorm', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', description: 'Hurls handfuls of nuts. Deals 7 damage to all enemies.', damage: 7 },
  // B-Tier
  { id: 'cidney_b1', name: 'Chonk Slam', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Jumps from a high branch and body-slams! Deals 17 damage.', damage: 17 },
  { id: 'cidney_b2', name: 'Giant Acorn Shield', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Holds up a massive walnut shell. Gain 17 Shield.', block: 17 },
  { id: 'cidney_b3', name: 'Nut Cache Reserves', tier: 'B', cost: 2, type: 'heal', target: 'self', description: 'Eats winter reserves. Heals 16 HP.', heal: 16 },
  // A-Tier
  { id: 'cidney_a1', name: 'Acorn Hoard Overflow', tier: 'A', cost: 2, type: 'utility', target: 'none', specialActionId: 'acorn_hoard', description: 'DUMPS THE ACORN VAULT! Gain +3 CRACKERS immediately and draw 2 cards!' },
  { id: 'cidney_a2', name: 'Colossal Belly Flop', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'Massive chonk lands on everyone! Deals 17 damage to all enemies.', damage: 17 },
  { id: 'cidney_a3', name: 'Impenetrable Chonk', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Gain 26 Shield and become immune to debuffs for 1 turn.', block: 26 },
  // S-Tier
  { id: 'cidney_s1', name: 'The Acorn Colossus', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', description: 'Cidney grows into a titanic mythical squirrel. Crushes target for 45 damage!', damage: 45 },
  { id: 'cidney_s2', name: 'Infinite Nut Buffet', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', description: 'Shares the ultimate winter hoard. All allies heal 24 HP and team gains +3 Crackers!', heal: 24 },
  { id: 'cidney_s3', name: 'Earth-Shaking Chonk Bomb', tier: 'S', cost: 5, type: 'attack', target: 'all_enemies', description: 'Flattens entire enemy field! Deals 28 damage to all enemies.', damage: 28 },
]);

// 16. Chanteira (Fat Dolphin - Tidal Chonker)
const CHANTEIRA_CARDS: Card[] = createStuffyCardSet('chanteira', [
  // F-Tier
  { id: 'chanteira_f1', name: 'Chonky Splash', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Splashes sea water. Deals 8 damage.', damage: 8 },
  { id: 'chanteira_f2', name: 'Flipper Hug', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Cuddles with flippers. Gain 8 Shield.', block: 8 },
  { id: 'chanteira_f3', name: 'Blowhole Poot', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Puffs steam from blowhole. Deals 7 damage.', damage: 7 },
  // D-Tier
  { id: 'chanteira_d1', name: 'Belly Wave Roll', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Rolls round body through water. Deals 11 damage.', damage: 11 },
  { id: 'chanteira_d2', name: 'Marine Bubble Guard', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Encases self in sea foam. Gain 10 Shield.', block: 10 },
  { id: 'chanteira_d3', name: 'Squid Bite', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Eats squid pop. Heals 11 HP.', heal: 11 },
  // C-Tier
  { id: 'chanteira_c1', name: 'Ultrasonic Chirp', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'High-pitch squeak. Deals 12 damage.', damage: 12 },
  { id: 'chanteira_c2', name: 'Tidal Swell Guard', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', description: 'Rising water protects team. All allies gain 6 Shield.', block: 6 },
  { id: 'chanteira_c3', name: 'Blowhole Blast', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', description: 'Pressurized water spray. Deals 7 damage to all enemies.', damage: 7 },
  // B-Tier
  { id: 'chanteira_b1', name: 'Chonk Wave Splash', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', description: 'Massive dolphin belly lands in pool! Deals 12 damage to all enemies.', damage: 12 },
  { id: 'chanteira_b2', name: 'Sonar Bubble Dome', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Dense pressurized sphere. Gain 16 Shield.', block: 16 },
  { id: 'chanteira_b3', name: 'Playful Dolphin Leap', tier: 'B', cost: 2, type: 'heal', target: 'single_ally', description: 'Leaps gracefully. Heals an ally for 16 HP.', heal: 16 },
  // A-Tier
  { id: 'chanteira_a1', name: 'Echolocation Sonar', tier: 'A', cost: 3, type: 'debuff', target: 'all_enemies', description: 'Piercing ultrasonic sonar! Reveals all enemy cards, deals 14 damage to all, and reduces their defense.', damage: 14 },
  { id: 'chanteira_a2', name: 'Tsunami Cannon', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Unleashes high-pressure ocean torrent. Deals 27 damage.', damage: 27 },
  { id: 'chanteira_a3', name: 'Ocean Mother Shield', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', description: 'Huge protective tide. All allies gain 14 Shield.', block: 14 },
  // S-Tier
  { id: 'chanteira_s1', name: 'The Great Oceanic Deluge', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', description: 'Chanteira causes a mythical tidal wave! Deals 26 damage to all enemies and knocks 1 card from opponent hand!', damage: 26 },
  { id: 'chanteira_s2', name: 'Song of the Deep Sea', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', description: 'Ancient whale & dolphin melody. All allies heal 22 HP and gain 16 Shield.', heal: 22, block: 16 },
  { id: 'chanteira_s3', name: 'Tidal Tail Breaker', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Crushes target with titanic tail slap. Deals 42 damage!', damage: 42 },
]);

// 17. Dolphy (Colossal Dolphin - Way Bigger than Chanteira!)
const DOLPHY_CARDS: Card[] = createStuffyCardSet('dolphy', [
  // F-Tier
  { id: 'dolphy_f1', name: 'Gentle Spurt', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Colossal blowhole spouts water. Deals 8 damage.', damage: 8 },
  { id: 'dolphy_f2', name: 'Slick Blubber', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Thick blubber layer protects body. Gain 8 Shield.', block: 8 },
  { id: 'dolphy_f3', name: 'Behemoth Click', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Deep bass sonar clicks. Deals 8 damage.', damage: 8 },
  // D-Tier
  { id: 'dolphy_d1', name: 'Heavy Fin Slap', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Slaps with colossal pectoral fin. Deals 11 damage.', damage: 11 },
  { id: 'dolphy_d2', name: 'Sea Spray Barrage', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Dense spray blinds enemy. Deals 11 damage.', damage: 11 },
  { id: 'dolphy_d3', name: 'Foam Barrier', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Surrounds colossal body in sea foam. Gain 11 Shield.', block: 11 },
  // C-Tier
  { id: 'dolphy_c1', name: 'Water Jet Cannon', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Pressurized water stream. Deals 13 damage.', damage: 13 },
  { id: 'dolphy_c2', name: 'Tidal Bastion', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', description: 'Tidal swell protects allies. All allies gain 8 Shield.', block: 8 },
  { id: 'dolphy_c3', name: 'Echo Wave Push', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Shockwave through the water. Deals 12 damage.', damage: 12 },
  // B-Tier
  { id: 'dolphy_b1', name: 'Whale-Sized Splash', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', description: 'Dolphy crashes into water! Deals 15 damage to all enemies.', damage: 15 },
  { id: 'dolphy_b2', name: 'Deep Abyss Shield', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Immense bulk blocks incoming damage. Gain 18 Shield.', block: 18 },
  { id: 'dolphy_b3', name: 'Titanic Flukes', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Strikes target with titanic dolphin flukes. Deals 18 damage.', damage: 18 },
  // A-Tier
  { id: 'dolphy_a1', name: 'High Pressure Geyser', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Erupts a devastating geyser from blowhole. Deals 28 damage.', damage: 28 },
  { id: 'dolphy_a2', name: 'Colossal Breach', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Dolphy leaps and crashes down! Deals 22 damage and grants Dolphy 16 Shield.', damage: 22, block: 16 },
  { id: 'dolphy_a3', name: 'Cetacean Recovery', tier: 'A', cost: 3, type: 'heal', target: 'single_ally', description: 'Soothing oceanic energy. Heals an ally for 28 HP.', heal: 28 },
  // S-Tier
  { id: 'dolphy_s1', name: 'Tsunami Crush', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Catastrophic tsunami crushes single target! Deals 44 damage and gives all allies 16 Shield!', damage: 44, block: 16 },
  { id: 'dolphy_s2', name: 'Ocean Deluge', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', description: 'Submerges the arena under a massive ocean flood. Deals 30 damage to all enemies!', damage: 30 },
  { id: 'dolphy_s3', name: 'Megalodon Dive', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Dolphy drops like a meteor from above! Deals 48 devastating damage!', damage: 48 },
]);

// 18. Shadow (Ultimate Hedgehog - Strength Focused / Strength Doubling)
const SHADOW_CARDS: Card[] = createStuffyCardSet('shadow', [
  // F-Tier
  { id: 'shadow_f1', name: 'Quick Kick', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Swift kick with air shoes. Deals 8 damage.', damage: 8 },
  { id: 'shadow_f2', name: 'Dark Reflex', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Evades damage with air shoe burst. Gain 8 Shield.', block: 8 },
  { id: 'shadow_f3', name: 'Skate Tap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Glides into opponent. Deals 8 damage.', damage: 8 },
  // D-Tier
  { id: 'shadow_d1', name: 'Chaos Strike', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Infused jab. Deals 11 damage.', damage: 11 },
  { id: 'shadow_d2', name: 'Quill Needle Guard', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Bristles sharp quills. Gain 11 Shield.', block: 11 },
  { id: 'shadow_d3', name: 'Shadow Flare', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Sparks red chaos flare. Deals 10 damage.', damage: 10 },
  // C-Tier
  { id: 'shadow_c1', name: 'Chaos Snap', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Snap punch that infuses +1 Energy (strength) into Shadow! Deals 13 damage.', damage: 13, specialActionId: 'shadow_energy_1' },
  { id: 'shadow_c2', name: 'Black Tornado', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', description: 'Spins in midair creating a dark cyclone. Deals 12 damage to all enemies.', damage: 12 },
  { id: 'shadow_c3', name: 'Hover Stride', tier: 'C', cost: 2, type: 'defense', target: 'self', description: 'Accelerates with hover shoes. Gain 12 Shield and +1 Energy.', block: 12, specialActionId: 'shadow_energy_1' },
  // B-Tier
  { id: 'shadow_b1', name: 'Chaos Dash', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Supersonic tackle! Deals 16 damage and infuses +2 Energy (strength) into Shadow!', damage: 16, specialActionId: 'shadow_energy_2' },
  { id: 'shadow_b2', name: 'Chaos Barrier', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Surrounds body in red Chaos aura. Gain 16 Shield and +2 Energy into Shadow!', block: 16, specialActionId: 'shadow_energy_2' },
  { id: 'shadow_b3', name: 'Spin Dash Torpedo', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Rolls into high-velocity ball. Deals 18 damage.', damage: 18 },
  // A-Tier
  { id: 'shadow_a1', name: 'Chaos Spear', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Hurls pure bolts of Chaos electricity! Deals 26 damage (amplified heavily by Energy).', damage: 26 },
  { id: 'shadow_a2', name: 'Limit Break', tier: 'A', cost: 3, type: 'utility', target: 'single_ally', specialActionId: 'limit_break', description: 'DOUBLES all current Energy (strength) on target ally! (If they have 0 Energy, grants +3 Energy).' },
  { id: 'shadow_a3', name: 'Chaos Boost Surge', tier: 'A', cost: 3, type: 'utility', target: 'self', specialActionId: 'chaos_boost', description: 'Shadow draws upon the Chaos Emeralds! Infuses +5 Energy (strength) directly into Shadow!' },
  // S-Tier
  { id: 'shadow_s1', name: 'Chaos Blast', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', specialActionId: 'chaos_blast', damage: 32, description: 'Unleashes a massive thermonuclear sphere of red Chaos energy! Deals 32 AoE damage to all enemies and DOUBLES Shadow\'s current Energy (strength)!' },
  { id: 'shadow_s2', name: 'Chaos Control', tier: 'S', cost: 4, type: 'utility', target: 'self', specialActionId: 'chaos_control', description: 'STOPS TIME WITH CHAOS CONTROL! DOUBLES all current Energy on Shadow! If Shadow has less than 4 Energy, sets Energy to 8!' },
  { id: 'shadow_s3', name: 'Inhibitor Release', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', specialActionId: 'inhibitor_release', damage: 35, description: 'Removes golden inhibitor rings! Immediately infuses +6 Energy into Shadow, then obliterates target for 35 damage!' },
]);

// 19. Spot (Zoo Leopard - Doubling & Transferring Effects)
const SPOT_CARDS: Card[] = createStuffyCardSet('spot', [
  // F-Tier
  { id: 'spot_f1', name: 'Spot Flick', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Flicks a stinging spot across the arena. Deals 8 damage.', damage: 8 },
  { id: 'spot_f2', name: 'Polka Shield', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Covers body in defensive polka dots. Gain 8 Shield.', block: 8 },
  { id: 'spot_f3', name: 'Hue Shift', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', specialActionId: 'spot_hue_shift', description: 'Deals 6 damage. Shifts 1 ally\'s Poison into 5 Shield!', damage: 6 },
  // D-Tier
  { id: 'spot_d1', name: 'Spot Swapper', tier: 'D', cost: 1, type: 'utility', target: 'single_enemy', specialActionId: 'spot_swapper', description: 'Deals 6 damage. Transfers up to 3 Poison from target ally onto target enemy!', damage: 6 },
  { id: 'spot_d2', name: 'Polka Guard', tier: 'D', cost: 1, type: 'defense', target: 'single_ally', specialActionId: 'spot_guard', description: 'Grants target ally 7 Shield and transfers 1 Energy from Spot to that ally.', block: 7 },
  { id: 'spot_d3', name: 'Toxin Dot', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', specialActionId: 'spot_toxin_dot', description: 'Deals 8 damage and applies 3 Poison to target enemy.', damage: 8 },
  // C-Tier
  { id: 'spot_c1', name: 'Double Trouble', tier: 'C', cost: 2, type: 'defense', target: 'single_ally', specialActionId: 'spot_double_shield', description: 'DOUBLES target ally\'s current Shield! (Grants minimum 8 Shield).' },
  { id: 'spot_c2', name: 'Energy Relay', tier: 'C', cost: 2, type: 'utility', target: 'single_ally', specialActionId: 'spot_energy_relay', description: 'Transfers all Energy from one ally to another, and adds +2 bonus Energy!' },
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
  { id: 'spot_s1', name: 'Put Me in the Zoo!', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', specialActionId: 'spot_put_me_in_zoo', damage: 26, description: 'PUT ME IN THE ZOO! Deals 26 AoE damage. DOUBLES all buffs on all allies, and DOUBLES all debuffs on all enemies!' },
  { id: 'spot_s2', name: 'Omni-Spot Transfer', tier: 'S', cost: 3, type: 'utility', target: 'single_enemy', specialActionId: 'spot_omni_transfer', description: 'Swaps all status effects between an ally and an enemy! Then DOUBLES all Poison on that enemy!' },
  { id: 'spot_s3', name: 'Spot Cataclysm', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', specialActionId: 'spot_cataclysm', damage: 35, description: 'Cataclysmic polka blast! Deals 35 damage and TRIPLES all Poison on target enemy!' },
]);

// 20. George (Moody Cephalopod - Emotional Mode Swapping)
const GEORGE_CARDS: Card[] = createStuffyCardSet('george', [
  // F-Tier
  { id: 'george_f1', name: 'Tentacle Slap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Slaps with an active tentacle. Deals 8 damage.', damage: 8 },
  { id: 'george_f2', name: 'Suction Guard', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Fastens suckers firmly in place. Gain 8 Shield.', block: 8 },
  { id: 'george_f3', name: 'Soothing Bubble', tier: 'F', cost: 1, type: 'heal', target: 'single_ally', description: 'Blows a tender warm bubble. Heals 9 HP.', heal: 9 },
  // D-Tier
  { id: 'george_d1', name: 'Mood Slap', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'A swift strike driven by fluctuating emotions. Deals 11 damage.', damage: 11 },
  { id: 'george_d2', name: 'Octo Ink Cloud', tier: 'D', cost: 1, type: 'defense', target: 'all_allies', description: 'Blinds enemies with ink. All allies gain 6 Shield.', block: 6 },
  { id: 'george_d3', name: 'Tender Embrace', tier: 'D', cost: 2, type: 'heal', target: 'single_ally', description: 'Gently embraces a wounded friend. Heals 14 HP.', heal: 14 },
  // C-Tier
  { id: 'george_c1', name: 'Angry Barrage', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Rapid octopus flurries. Deals 15 damage.', damage: 15 },
  { id: 'george_c2', name: 'Happy Splash', tier: 'C', cost: 2, type: 'heal', target: 'all_allies', description: 'Splashes refreshing ocean water. Heals all allies for 10 HP.', heal: 10 },
  { id: 'george_c3', name: 'Cephalopod Barrier', tier: 'C', cost: 2, type: 'defense', target: 'self', description: 'Curled tentacle fortress. Gain 14 Shield.', block: 14 },
  // B-Tier
  { id: 'george_b1', name: 'Eight-Legged Flurry', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', description: 'Strikes all enemies with all 8 tentacles! Deals 10 damage to each foe.', damage: 10 },
  { id: 'george_b2', name: 'Bipolar Surge', tier: 'B', cost: 2, type: 'utility', target: 'single_enemy', damage: 14, heal: 8, description: 'Deals 14 damage to target enemy and heals George for 8 HP.' },
  { id: 'george_b3', name: 'Restorative Ink', tier: 'B', cost: 2, type: 'heal', target: 'single_ally', description: 'Rich mineral ink restores plush stuffing. Heals 20 HP.', heal: 20 },
  // A-Tier
  { id: 'george_a1', name: 'Deep Sea Tantrum', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'A furious thrash of rage! Deals 26 damage.', damage: 26 },
  { id: 'george_a2', name: 'Oceanic Compassion', tier: 'A', cost: 3, type: 'heal', target: 'all_allies', description: 'Radiates boundless warmth across the team. Heals all allies for 18 HP.', heal: 18 },
  { id: 'george_a3', name: 'Mood Shift Mastery', tier: 'A', cost: 3, type: 'utility', target: 'all_allies', block: 15, heal: 10, description: 'Channels both emotion poles! Grants 15 Shield and heals all allies for 10 HP.' },
  // S-Tier
  { id: 'george_s1', name: 'Wrath of the Cephalopod', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', damage: 30, description: 'George unleashes pure untamed fury! Deals 30 damage to all enemies (doubled in Angry mode!)' },
  { id: 'george_s2', name: 'Benevolent Kraken Waves', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', heal: 25, canRevive: true, description: 'George radiates supreme warmth! Revives any unstuffed ally with 25 HP and heals all active allies for 25 HP (doubled in Happy mode!)' },
  { id: 'george_s3', name: 'Whirlpool Cataclysm', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', damage: 40, description: 'A massive 8-tentacle slam into an oceanic vortex! Deals 40 damage!' },
]);

// 21. Sluger (Heavyweight Slugger - Thick Slime Brawler)
const SLUGER_CARDS: Card[] = createStuffyCardSet('sluger', [
  // F-Tier
  { id: 'sluger_f1', name: 'Slime Jab', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Quick sticky punch. Deals 8 damage.', damage: 8 },
  { id: 'sluger_f2', name: 'Heavy Mucus Guard', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Hardens emerald mucus layer. Gain 8 Shield.', block: 8 },
  { id: 'sluger_f3', name: 'Goo Crawl', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Slams into foe and readies stance. Deals 6 damage and grants 4 Shield.', damage: 6, block: 4 },
  // D-Tier
  { id: 'sluger_d1', name: 'Slime Cross', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'A heavy slug straight punch! Deals 12 damage.', damage: 12 },
  { id: 'sluger_d2', name: 'Dense Slime Shield', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Thick defensive slime barrier. Gain 12 Shield.', block: 12 },
  { id: 'sluger_d3', name: 'Brawler Snack', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Chews down tough fibrous greens. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'sluger_c1', name: 'Slime Uppercut', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Lifts enemy into the air with a slime-infused uppercut! Deals 16 damage.', damage: 16 },
  { id: 'sluger_c2', name: 'Viscous Wall', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', description: 'Paves a thick slime track. All allies gain 8 Shield.', block: 8 },
  { id: 'sluger_c3', name: 'Mucus Pummel', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Batter with acidic slime. Deals 14 damage and applies 2 Poison.', damage: 14, poison: 2 },
  // B-Tier
  { id: 'sluger_b1', name: 'Slugger Combination', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'One-two slug combo! Deals 18 damage.', damage: 18 },
  { id: 'sluger_b2', name: 'Hardened Gel Armor', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Crystallizes emerald gel into rock-hard armor. Gain 18 Shield.', block: 18 },
  { id: 'sluger_b3', name: 'Heavyweight Smash', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', description: 'Jumps and body-slams the entire arena! Deals 11 damage to all foes.', damage: 11 },
  // A-Tier
  { id: 'sluger_a1', name: 'Slugger Haymaker', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'A heavyweight slug punch of pure condensed slime! Deals 28 damage.', damage: 28 },
  { id: 'sluger_a2', name: 'Goo Quake Slam', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'Ruptures the floor with high-density slime waves! Deals 18 damage to all enemies.', damage: 18 },
  { id: 'sluger_a3', name: 'Unbreakable Mollusk Shell', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', description: 'Forms an impenetrable dome of hardened slime. All allies gain 16 Shield.', block: 16 },
  // S-Tier
  { id: 'sluger_s1', name: 'Slugger Championship Knockout', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', damage: 44, brainDamage: true, description: 'The ultimate slugger knockout! Deals 44 devastating damage and inflicts Brain Damage!' },
  { id: 'sluger_s2', name: 'Colossal Slime Avalanche', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', damage: 28, poison: 4, description: 'Buries the opposing arena in tons of heavyweight toxic slime! Deals 28 damage to all foes and inflicts 4 Poison!' },
  { id: 'sluger_s3', name: 'Heavyweight Slime Bulk', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', block: 25, heal: 15, canRevive: true, description: 'Sluger pumps up with championship brawler spirit! Revives a fallen ally with 15 HP and grants 25 Shield to all allies!' },
]);

// 22. Spike (Porcupine - Bleeding Stuffing & Quills)
const SPIKE_CARDS: Card[] = createStuffyCardSet('spike', [
  // F-Tier
  { id: 'spike_f1', name: 'Quill Poke', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Pokes with a sharp quill. Deals 8 damage.', damage: 8 },
  { id: 'spike_f2', name: 'Bristle Tuck', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Curls up into a ball. Gain 8 Shield.', block: 8 },
  { id: 'spike_f3', name: 'Barbed Prod', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Pricks target. Deals 6 damage and grants 4 Shield.', damage: 6, block: 4 },
  // D-Tier
  { id: 'spike_d1', name: 'Bleeding Prick', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Sharp quill strike. Deals 10 damage and inflicts Bleeding Stuffing!', damage: 10, bleedingStuffing: true },
  { id: 'spike_d2', name: 'Spiny Shell', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Hardens spines. Gain 12 Shield.', block: 12 },
  { id: 'spike_d3', name: 'Snout Nibble', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Munch on pine bark snacks. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'spike_c1', name: 'Quill Flurry', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Fires felt quills! Deals 16 damage and inflicts Bleeding Stuffing!', damage: 16, bleedingStuffing: true },
  { id: 'spike_c2', name: 'Porcupine Wall', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', description: 'Barricades with quills. All allies gain 8 Shield.', block: 8 },
  { id: 'spike_c3', name: 'Poison Quill', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Dips quills in venom. Deals 12 damage and 2 Poison.', damage: 12, poison: 2 },
  // B-Tier
  { id: 'spike_b1', name: 'Splay Quills', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', description: 'Sprays quills at all enemies! Deals 13 damage and inflicts Bleeding Stuffing!', damage: 13, bleedingStuffing: true },
  { id: 'spike_b2', name: 'Barbed Armor', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Sprouts sharp defensive quills. Gain 20 Shield.', block: 20 },
  { id: 'spike_b3', name: 'Rupture Needle', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Deep needle puncture! Deals 20 damage and inflicts Bleeding Stuffing!', damage: 20, bleedingStuffing: true },
  // A-Tier
  { id: 'spike_a1', name: 'Quill Volley', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'Whirlwind of deadly quills! Deals 22 damage to all enemies and inflicts Bleeding Stuffing!', damage: 22, bleedingStuffing: true },
  { id: 'spike_a2', name: 'Deep Needle Puncture', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Devastating armor-piercing quill. Deals 32 damage and inflicts Bleeding Stuffing!', damage: 32, bleedingStuffing: true },
  { id: 'spike_a3', name: 'Iron Porcupine Dome', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', description: 'Impenetrable quill shield for squad! All allies gain 18 Shield.', block: 18 },
  // S-Tier
  { id: 'spike_s1', name: 'Cataclysmic Quill Burst', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', damage: 38, bleedingStuffing: true, description: 'Titanic explosion of razor quills! Deals 38 damage to all enemies and inflicts Bleeding Stuffing on everyone!' },
  { id: 'spike_s2', name: 'Fortress of Thorns', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', block: 30, heal: 15, canRevive: true, description: 'Spike unleashes protective bramble magic! Revives an ally with 15 HP and grants 30 Shield to all allies!' },
  { id: 'spike_s3', name: 'Thorned Rupture', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', damage: 46, bleedingStuffing: true, description: 'Punctures deep into the core! Deals 46 damage, inflicts Bleeding Stuffing, and immediately cracks the earth beneath the target!' },
]);

// 23. Umbreon (Moonlight Eeveelution - Dark Psychic Mind Control)
const UMBREON_CARDS: Card[] = createStuffyCardSet('umbreon', [
  // F-Tier
  { id: 'umbreon_f1', name: 'Shadow Nibble', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A stealthy dark bite. Deals 8 damage.', damage: 8 },
  { id: 'umbreon_f2', name: 'Lunar Ring Glow', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Yellow rings illuminate. Gain 8 Shield.', block: 8 },
  { id: 'umbreon_f3', name: 'Nocturnal Glare', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Hypnotic dark eyes. Deals 7 damage and grants 4 Shield.', damage: 7, block: 4 },
  // D-Tier
  { id: 'umbreon_d1', name: 'Feint Attack', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Draws near from the darkness! Deals 12 damage.', damage: 12 },
  { id: 'umbreon_d2', name: 'Moonlight Veil', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Soft silver shroud. Gain 12 Shield.', block: 12 },
  { id: 'umbreon_d3', name: 'Moon Berry Snack', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Nibbles glowing moon berry. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'umbreon_c1', name: 'Dark Pulse', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Waves of nocturnal aura. Deals 16 damage.', damage: 16 },
  { id: 'umbreon_c2', name: 'Lunar Barrier', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', description: 'Protective ring shield. All allies gain 9 Shield.', block: 9 },
  { id: 'umbreon_c3', name: 'Confuse Ray', tier: 'C', cost: 2, type: 'debuff', target: 'single_enemy', description: 'Sinister flash of light! Deals 12 damage and inflicts Brain Damage!', damage: 12, brainDamage: true },
  // B-Tier
  { id: 'umbreon_b1', name: 'Night Slash', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Sharp claws shrouded in moonlight. Deals 19 damage.', damage: 19 },
  { id: 'umbreon_b2', name: 'Midnight Aegis', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Rings shine with radiant darkness. Gain 20 Shield.', block: 20 },
  { id: 'umbreon_b3', name: 'Psychic Mind Pulse', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', description: 'Psychic wave radiates outward! Deals 12 damage to all foes.', damage: 12 },
  // A-Tier
  { id: 'umbreon_a1', name: 'Moonlight Puppetry', tier: 'A', cost: 3, type: 'special', target: 'single_enemy', specialActionId: 'strokenosis', description: 'Psychic tendrils control enemy thoughts! Forces an opponent card to be played against them!', damage: 20 },
  { id: 'umbreon_a2', name: 'Lunar Eclipse Blast', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'Shrouds the arena in an eclipse! Deals 20 damage to all enemies and inflicts Brain Damage!', damage: 20, brainDamage: true },
  { id: 'umbreon_a3', name: 'Moonlight Prayer', tier: 'A', cost: 3, type: 'heal', target: 'all_allies', description: 'Bask in soothing lunar rays. All allies heal 16 HP and gain 10 Shield.', heal: 16, block: 10 },
  // S-Tier
  { id: 'umbreon_s1', name: 'Black Moonlight Domination', tier: 'S', cost: 4, type: 'special', target: 'single_enemy', specialActionId: 'strokenosis', damage: 35, description: 'The pinnacle of dark psychic control! Seizes opponent mind, steals their card, and strikes for 35 damage!' },
  { id: 'umbreon_s2', name: 'Nocturnal Mind Warp', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', damage: 32, brainDamage: true, description: 'Blinding dark psychic blast! Deals 32 damage to all enemies and scrambles all minds with Brain Damage!' },
  { id: 'umbreon_s3', name: 'Lunar Resurrection', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', heal: 25, block: 25, canRevive: true, description: 'Sacred moonlight bathes the fallen! Revives an ally with 25 HP and shields everyone for 25!' },
]);

// 24. Pinky Bear (Pink Bear - Secret Candy Stash Guardian & Weakness)
const PINKY_BEAR_CARDS: Card[] = createStuffyCardSet('pinky_bear', [
  // F-Tier
  { id: 'pinky_bear_f1', name: 'Paw Tap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Cute pink paw tap. Deals 8 damage.', damage: 8 },
  { id: 'pinky_bear_f2', name: 'Candy Wrapper Guard', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Crinkly foil protection. Gain 8 Shield.', block: 8 },
  { id: 'pinky_bear_f3', name: 'Sweet Hug', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A sugary squeeze. Deals 6 damage and grants 4 Shield.', damage: 6, block: 4 },
  // D-Tier
  { id: 'pinky_bear_d1', name: 'Sugar Slap', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Stinging sweet swat! Deals 11 damage.', damage: 11 },
  { id: 'pinky_bear_d2', name: 'Lollipop Shield', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Holds up a giant hard lollipop. Gain 12 Shield.', block: 12 },
  { id: 'pinky_bear_d3', name: 'Marshmallow Munch', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Secret candy nibble. Heals 12 HP.', heal: 12 },
  // C-Tier
  { id: 'pinky_bear_c1', name: 'Weakening Gummy Swat', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Stretchy gummy slap! Deals 14 damage and weakens foe.', damage: 14 },
  { id: 'pinky_bear_c2', name: 'Secret Stash Barricade', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', description: 'Guards the sugar vault! All allies gain 9 Shield.', block: 9 },
  { id: 'pinky_bear_c3', name: 'Sour Taffy Pull', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'Pulls sour sticky taffy across foe! Deals 12 damage and 2 Poison.', damage: 12, poison: 2 },
  // B-Tier
  { id: 'pinky_bear_b1', name: "Brother's Repellent", tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', description: "Don't touch my stash! Deals 13 damage to all enemies and leaves them weakened.", damage: 13 },
  { id: 'pinky_bear_b2', name: 'Cotton Candy Cocoon', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Spun sugar armor. Gain 20 Shield.', block: 20 },
  { id: 'pinky_bear_b3', name: 'Jawbreaker Slam', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Hurls a rock-solid jawbreaker! Deals 20 damage.', damage: 20 },
  // A-Tier
  { id: 'pinky_bear_a1', name: 'Sweet Tooth Overload', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'Mega sugar rush strike! Deals 30 damage and weakens target.', damage: 30 },
  { id: 'pinky_bear_a2', name: 'Gummy Bear Stampede', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'A stampede of fruity gummy bears! Deals 20 damage to all foes.', damage: 20 },
  { id: 'pinky_bear_a3', name: 'Sugar Shield Dome', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', description: 'Hard caramelized candy dome. All allies gain 18 Shield.', block: 18 },
  // S-Tier
  { id: 'pinky_bear_s1', name: "DON'T TOUCH MY STASH!", tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', damage: 52, description: "Furious guardian fury! Protects the secret sweets with 52 colossal damage!" },
  { id: 'pinky_bear_s2', name: 'Candy Vault Apocalypse', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', damage: 32, poison: 4, description: 'Ruptures the secret stash! Deals 32 damage to all enemies and floods the field in sour poison syrup!' },
  { id: 'pinky_bear_s3', name: 'Sweet Life Restitch', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', heal: 25, block: 25, canRevive: true, description: 'Shares the forbidden candy stash with a fallen friend! Revives ally with 25 HP and 25 Shield!' },
]);

// 25. Big Bear (Colossal Slumbering Bear - Massive Slumber & Wakeup)
const BIG_BEAR_CARDS: Card[] = createStuffyCardSet('big_bear', [
  // F-Tier
  { id: 'big_bear_f1', name: 'Sleepy Paw', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A slow heavy snooze swipe. Deals 9 damage.', damage: 9 },
  { id: 'big_bear_f2', name: 'Deep Inhale', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Takes a deep sleeping breath. Gain 9 Shield.', block: 9 },
  { id: 'big_bear_f3', name: 'Mattress Shift', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Rolls over in bed. Deals 7 damage and grants 5 Shield.', damage: 7, block: 5 },
  // D-Tier
  { id: 'big_bear_d1', name: 'Heavy Slumber Roll', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Massive bear rolls over! Deals 13 damage.', damage: 13 },
  { id: 'big_bear_d2', name: 'Summer Hibernate', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Snuggles under warm quilt. Gain 14 Shield.', block: 14 },
  { id: 'big_bear_d3', name: 'Honey Pot Dream', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Dreams of sweet golden honey. Heals 14 HP.', heal: 14 },
  // C-Tier
  { id: 'big_bear_c1', name: 'Snooze Quake', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', description: 'Loud snoring shakes the room! Deals 12 damage to all enemies.', damage: 12 },
  { id: 'big_bear_c2', name: 'Colossal Slumber Wall', tier: 'C', cost: 2, type: 'defense', target: 'all_allies', description: 'His immense body blocks the way. All allies gain 10 Shield.', block: 10 },
  { id: 'big_bear_c3', name: 'Drowsy Clout', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', description: 'A sleepy, crushing swipe. Deals 17 damage.', damage: 17 },
  // B-Tier
  { id: 'big_bear_b1', name: 'Bear Hug Slumber', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', description: 'Hugs target into his furry bulk. Deals 20 damage.', damage: 20 },
  { id: 'big_bear_b2', name: 'Unbreakable Hibernate', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Deep REM sleep. Gain 22 Shield.', block: 22 },
  { id: 'big_bear_b3', name: 'Quilt Trample', tier: 'B', cost: 2, type: 'attack', target: 'all_enemies', description: 'Kicks the blankets in sleep! Deals 14 damage to all foes.', damage: 14 },
  // A-Tier
  { id: 'big_bear_a1', name: 'Restless Sleep Toss', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', description: 'A restless titan toss! Deals 32 damage.', damage: 32 },
  { id: 'big_bear_a2', name: 'Snore Shockwave', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', description: 'Thunderous snoring blasts the arena! Deals 22 damage to all enemies.', damage: 22 },
  { id: 'big_bear_a3', name: 'Winter Blanket Fortress', tier: 'A', cost: 3, type: 'defense', target: 'all_allies', description: 'Pulls giant patchwork quilt over squad! All allies gain 20 Shield.', block: 20 },
  // S-Tier
  { id: 'big_bear_s1', name: '3-Cracker Wakeup Call', tier: 'S', cost: 3, type: 'attack', target: 'single_enemy', damage: 60, block: 25, specialActionId: 'big_bear_awaken', description: 'AWAKENS FROM HIBERNATION! Big Bear shakes off his sleep with a 60 damage colossal swipe and 25 Shield!' },
  { id: 'big_bear_s2', name: 'Colossal Slumber Quake', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', damage: 36, description: 'Titanic Amalgam-sized body-slam! Deals 36 damage to all foes and cracks the earth!' },
  { id: 'big_bear_s3', name: 'Hibernating Restitch', tier: 'S', cost: 4, type: 'defense', target: 'all_allies', block: 35, heal: 20, canRevive: true, description: 'Wraps the entire squad in warm hibernation fluff! Revives fallen ally with 20 HP and 35 Shield to all!' },
]);

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
];

export const CARD_MAP = new Map<string, Card>(
  ALL_CARDS.map((c) => [c.id, c])
);

