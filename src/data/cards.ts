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
    canRevive: c.canRevive,
    specialActionId: c.specialActionId,
    isPlayerCard: false,
    upgraded: false,
  }));
}

// 1. Alex (Pink Axolotl)
const ALEX_CARDS: Card[] = createStuffyCardSet('alex', [
  // F-Tier
  { id: 'alex_f1', name: 'Derp Stare', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Stares blankly. Deals 2 damage.' , damage: 2},
  { id: 'alex_f2', name: 'Gill Twitch', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Gills flutter aimlessly. Gain 3 Shield.', block: 3 },
  { id: 'alex_f3', name: 'Daydream Drool', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Durp drool splashes. Deals 3 damage.', damage: 3 },
  // D-Tier
  { id: 'alex_d1', name: 'Slow Pink Slap', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'A languid fin slap. Deals 6 damage.', damage: 6 },
  { id: 'alex_d2', name: 'Squishy Posture', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Goes completely limp. Gain 6 Shield.', block: 6 },
  { id: 'alex_d3', name: 'Durp Blink', tier: 'D', cost: 2, type: 'utility', target: 'single_ally', description: 'Smiles cutely. Heals 7 HP.', heal: 7 },
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
  { id: 'jefe_f1', name: 'Pudge Waddling', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Waddles forward clumsily. Deals 3 damage.', damage: 3 },
  { id: 'jefe_f2', name: 'Deny Being Fat', tier: 'F', cost: 1, type: 'defense', target: 'self', description: '"I am NOT fat! I am pudge!" Gain 4 Shield.', block: 4 },
  { id: 'jefe_f3', name: 'Haughty Peep', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'A snobbish squawk. Deals 2 damage.', damage: 2 },
  // D-Tier
  { id: 'jefe_d1', name: 'Belly Slide', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Slides along on his belly. Deals 7 damage.', damage: 7 },
  { id: 'jefe_d2', name: 'Down Feather Coat', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Puffs up thick feathers. Gain 7 Shield.', block: 7 },
  { id: 'jefe_d3', name: 'Fish Snack Break', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Munches a frozen fish. Heals 8 HP.', heal: 8 },
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
  { id: 'finlee_f1', name: 'Fin Flap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Splashes water with tail fluke. Deals 3 damage.', damage: 3 },
  { id: 'finlee_f2', name: 'Blubber Cushion', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Absorbs shock with blubber. Gain 4 Shield.', block: 4 },
  { id: 'finlee_f3', name: 'Hungry Squeak', tier: 'F', cost: 1, type: 'utility', target: 'self', description: 'Stomach growls loudly. Gain 1 Cracker next turn.', block: 2 },
  // D-Tier
  { id: 'finlee_d1', name: 'Plush Nibble', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', lifesteal: true, description: 'Nibbles a corner. Deals 6 damage, heals for 6.', damage: 6 },
  { id: 'finlee_d2', name: 'Deep Dive Guard', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Dives beneath waves. Gain 7 Shield.', block: 7 },
  { id: 'finlee_d3', name: 'Krill Snack', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Eats a school of krill. Heals 9 HP.', heal: 9 },
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
  { id: 'fifi_f1', name: 'Little Toot', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', poison: 2, description: 'A tiny fart. Deals 2 damage and 2 Poison.', damage: 2 },
  { id: 'fifi_f2', name: 'Fox Crouch', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Crouches in tall grass. Gain 4 Shield.', block: 4 },
  { id: 'fifi_f3', name: 'Bushy Tail Wag', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Distracts foe with fluffy tail. Deals 3 damage.', damage: 3 },
  // D-Tier
  { id: 'fifi_d1', name: 'Smelly Pounce', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', poison: 4, description: 'Pounces with smelly gas. Deals 5 damage and 4 Poison.', damage: 5 },
  { id: 'fifi_d2', name: 'Chubby Roll', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Rolls away like a round ball. Gain 7 Shield.', block: 7 },
  { id: 'fifi_d3', name: 'Snack N Sniff', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Chews on forest treats. Heals 8 HP.', heal: 8 },
  // C-Tier
  { id: 'fifi_c1', name: 'Stinky Cloud', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', poison: 5, description: 'Releases a foul fog. Deals 4 damage and 5 Poison to all enemies.', damage: 4 },
  { id: 'fifi_c2', name: 'Red Fur Barrier', tier: 'C', cost: 2, type: 'defense', target: 'single_ally', description: 'Shields ally with dense fur. Grants 11 Shield.', block: 11 },
  { id: 'fifi_c3', name: 'Toxic Scratch', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', poison: 6, description: 'Sharp claws coated in scent. Deals 9 damage and 6 Poison.', damage: 9 },
  // B-Tier
  { id: 'fifi_b1', name: 'Rip-Roaring Rip', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', poison: 9, description: 'Massive gas explosion! Deals 12 damage and 9 Poison.', damage: 12 },
  { id: 'fifi_b2', name: 'Pungent Haze', tier: 'B', cost: 2, type: 'defense', target: 'all_allies', description: 'Toxic smokescreen hides team. All allies gain 8 Shield.', block: 8 },
  { id: 'fifi_b3', name: 'Rotten Berry Feast', tier: 'B', cost: 2, type: 'heal', target: 'self', poison: 3, description: 'Eats fermented berries. Heals 16 HP, inflicts 3 Poison to enemies.', heal: 16 },
  // A-Tier
  { id: 'fifi_a1', name: 'Toxic Gas Prowl', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', poison: 12, description: 'Prowls through dense smog. Deals 10 damage and 12 Poison to all enemies.', damage: 10 },
  { id: 'fifi_a2', name: 'Sulfur Bomb', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', poison: 18, description: 'Concentrated stank bomb! Deals 15 damage and 18 Poison.', damage: 15 },
  { id: 'fifi_a3', name: 'Chubby Gas Armor', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Envelops self in dense green fumes. Gain 20 Shield.', block: 20 },
  // S-Tier
  { id: 'fifi_s1', name: 'Supernova Flatulence', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', poison: 25, description: 'THE MOTHER OF ALL FARTS! Deals 18 damage and 25 Poison DoT to all enemies!' },
  { id: 'fifi_s2', name: 'Miasma Catastrophe', tier: 'S', cost: 4, type: 'attack', target: 'all_enemies', description: 'Double all poison counters currently active on all enemies, then deal 15 damage!', damage: 15 },
  { id: 'fifi_s3', name: 'Fox Den Sanctuary', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', description: 'All allies heal 18 HP and gain 14 Shield behind a pungent perimeter.', heal: 18, block: 14 },
]);

// 5. Thumper (Grey Hammerhead)
const THUMPER_CARDS: Card[] = createStuffyCardSet('thumper', [
  // F-Tier
  { id: 'thumper_f1', name: 'Bonk', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A mild head tap. Deals 3 damage.', damage: 3 },
  { id: 'thumper_f2', name: 'Wide Head Deflect', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Angles hammerhead. Gain 4 Shield.', block: 4 },
  { id: 'thumper_f3', name: 'Thump Floor', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Rhythmical floor tap. Deals 2 damage.', damage: 2 },
  // D-Tier
  { id: 'thumper_d1', name: 'Heavy Whack', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Solid hit with snout. Deals 7 damage.', damage: 7 },
  { id: 'thumper_d2', name: 'Shark Fin Parry', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Parries with dorsal fin. Gain 7 Shield.', block: 7 },
  { id: 'thumper_d3', name: 'Taco Crunch', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Chunches on hard taco. Heals 8 HP.', heal: 8 },
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
  { id: 'toothless_f1', name: 'Tiny Plasma Spark', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A small blue flame. Deals 3 damage.', damage: 3 },
  { id: 'toothless_f2', name: 'Wing Wrap', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Folds dark wings. Gain 4 Shield.', block: 4 },
  { id: 'toothless_f3', name: 'Toothless Grin', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Retracts teeth and smiles. Deals 2 damage.', damage: 2 },
  // D-Tier
  { id: 'toothless_d1', name: 'Plasma Poo Pellet', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Drops a little plasma poo pellet. Deals 7 damage.', damage: 7 },
  { id: 'toothless_d2', name: 'Night Fury Scale', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Sleek black scales deflect blows. Gain 7 Shield.', block: 7 },
  { id: 'toothless_d3', name: 'Salmon Gulp', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Swallows a whole fish. Heals 9 HP.', heal: 9 },
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
  { id: 'riolu_f1', name: 'Gentle Aura Touch', tier: 'F', cost: 1, type: 'heal', target: 'single_ally', description: 'A mild pulse of aura. Heals 4 HP.', heal: 4 },
  { id: 'riolu_f2', name: 'Aura Barrier', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Blue aura shield. Gain 4 Shield.', block: 4 },
  { id: 'riolu_f3', name: 'Pup Jab', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A light training jab. Deals 3 damage.', damage: 3 },
  // D-Tier
  { id: 'riolu_d1', name: 'Life Pulse', tier: 'D', cost: 1, type: 'heal', target: 'single_ally', description: 'Sends a wave of warm light. Heals 8 HP.', heal: 8 },
  { id: 'riolu_d2', name: 'Aura Deflect', tier: 'D', cost: 1, type: 'defense', target: 'single_ally', description: 'Shields friend. Grants 7 Shield.', block: 7 },
  { id: 'riolu_d3', name: 'Aura Palm', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Focuses fighting spirit. Deals 6 damage.', damage: 6 },
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
  { id: 'eevee_f1', name: 'Creepy Gaze', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Unblinking red eyes. Deals 3 damage.', damage: 3 },
  { id: 'eevee_f2', name: 'Fluffy Static', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Static fur sparks. Gain 4 Shield.', block: 4 },
  { id: 'eevee_f3', name: 'Mini Spark', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Little laser point. Deals 3 damage.', damage: 3 },
  // D-Tier
  { id: 'eevee_d1', name: 'Micro Laser', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Fires a thin scarlet laser beam. Deals 7 damage.', damage: 7 },
  { id: 'eevee_d2', name: 'Hologram Shield', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Creepy geometric ward. Gain 7 Shield.', block: 7 },
  { id: 'eevee_d3', name: 'Occult Candy Snack', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Munches starlight candy. Heals 8 HP.', heal: 8 },
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
  { id: 'slugmee_f1', name: 'Humming a Tune', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Hums softly. Deals 2 damage.', damage: 2 },
  { id: 'slugmee_f2', name: 'Slime Coat', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Coats self in yellow goo. Gain 4 Shield.', block: 4 },
  { id: 'slugmee_f3', name: 'Slow Crawl', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Crawls forward slowly. Deals 3 damage.', damage: 3 },
  // D-Tier
  { id: 'slugmee_d1', name: 'Sticky Song', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Sings a sticky chorus. Deals 6 damage.', damage: 6 },
  { id: 'slugmee_d2', name: 'Mucus Cocoon', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Hides in mucus. Gain 7 Shield.', block: 7 },
  { id: 'slugmee_d3', name: 'Sugar Leaf Bite', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Eats sweet foliage. Heals 8 HP.', heal: 8 },
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
  { id: 'beaker_f1', name: 'Wise Hoot', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Hoo hoo! Deals 2 damage.', damage: 2 },
  { id: 'beaker_f2', name: 'Feather Fluff', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Puffs brown feathers. Gain 4 Shield.', block: 4 },
  { id: 'beaker_f3', name: 'Talon Tap', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Light talon scratch. Deals 3 damage.', damage: 3 },
  // D-Tier
  { id: 'beaker_d1', name: 'Gliding Strike', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Glides in silently. Deals 6 damage.', damage: 6 },
  { id: 'beaker_d2', name: 'Owl Roost', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Perches securely. Gain 7 Shield.', block: 7 },
  { id: 'beaker_d3', name: 'Cricket Feast', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Munches Yosemite crickets. Heals 8 HP.', heal: 8 },
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
  { id: 'henry_f1', name: 'Potty Squirm', tier: 'F', cost: 1, type: 'utility', target: 'self', description: 'Squirms urgently. Deals 2 damage.', damage: 2 },
  { id: 'henry_f2', name: 'Tiny Shell Hide', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Pulls head in. Gain 5 Shield.', block: 5 },
  { id: 'henry_f3', name: 'Baby Nip', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Toothless baby nip. Deals 3 damage.', damage: 3 },
  // D-Tier
  { id: 'henry_d1', name: 'Diaper Clatter', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Safety pin armor. Gain 8 Shield.', block: 8 },
  { id: 'henry_d2', name: 'Toddler Bump', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Bumps into foe. Deals 6 damage.', damage: 6 },
  { id: 'henry_d3', name: 'Lettuce Nibble', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Eats lettuce leaf. Heals 9 HP.', heal: 9 },
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
  { id: 'dear_f1', name: 'Micro Ribbit', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Tiny squeaky ribbit. Deals 2 damage.', damage: 2 },
  { id: 'dear_f2', name: 'Dewdrop Hop', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Hops onto a leaf. Gain 4 Shield.', block: 4 },
  { id: 'dear_f3', name: 'Sticky Toe', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Tiny suction cup touch. Deals 3 damage.', damage: 3 },
  // D-Tier
  { id: 'dear_d1', name: 'Dart Tongue Flick', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', poison: 3, description: 'Fast tongue snap. Deals 5 damage and 3 Poison.', damage: 5 },
  { id: 'dear_d2', name: 'Slippery Blue Skin', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Very hard to grab. Gain 7 Shield.', block: 7 },
  { id: 'dear_d3', name: 'Fly Munch', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Catches a fly. Heals 8 HP.', heal: 8 },
  // C-Tier
  { id: 'dear_c1', name: 'Poison Dart Spit', tier: 'C', cost: 2, type: 'attack', target: 'single_enemy', poison: 6, description: 'Shoots a bead of frog toxin. Deals 8 damage and 6 Poison.', damage: 8 },
  { id: 'dear_c2', name: 'Camouflage Leaf', tier: 'C', cost: 2, type: 'defense', target: 'single_ally', description: 'Hides ally. Grants 10 Shield.', block: 10 },
  { id: 'dear_c3', name: 'Toxic Puddle', tier: 'C', cost: 2, type: 'attack', target: 'all_enemies', poison: 4, description: 'Leaves cyan poison puddles. Deals 5 damage and 4 Poison to all enemies.', damage: 5 },
  // B-Tier
  { id: 'dear_b1', name: 'Cyan Dart Lash', tier: 'B', cost: 2, type: 'attack', target: 'single_enemy', poison: 9, description: 'Whips with venomous tongue. Deals 12 damage and 9 Poison.', damage: 12 },
  { id: 'dear_b2', name: 'Neurotoxin Skin', tier: 'B', cost: 2, type: 'defense', target: 'self', description: 'Skin gleams with poison. Gain 15 Shield; attackers gain 5 Poison.', block: 15 },
  { id: 'dear_b3', name: 'Acrobatic Lily Hop', tier: 'B', cost: 2, type: 'utility', target: 'none', description: 'Dodges incoming fire and draws 2 cards.', block: 6 },
  // A-Tier
  { id: 'dear_a1', name: 'Golden Batrachotoxin', tier: 'A', cost: 3, type: 'attack', target: 'single_enemy', poison: 18, description: 'The deadliest toxin in nature! Deals 14 damage and 18 Poison DoT.', damage: 14 },
  { id: 'dear_a2', name: 'Toxic Rainforest Rain', tier: 'A', cost: 3, type: 'attack', target: 'all_enemies', poison: 10, description: 'Cyan mist coats everything. Deals 10 damage and 10 Poison to all enemies.', damage: 10 },
  { id: 'dear_a3', name: 'Micro-Frog Evasion', tier: 'A', cost: 3, type: 'defense', target: 'self', description: 'Too small to hit! Gain 24 Shield and 50% dodge chance.', block: 24 },
  // S-Tier
  { id: 'dear_s1', name: 'Lethal Dart Epidemic', tier: 'S', cost: 4, type: 'special', target: 'all_enemies', poison: 28, description: 'Explosive blast of pure Amazonian dart toxin! Deals 16 damage and 28 Poison to all foes!' },
  { id: 'dear_s2', name: 'Cyan Ghost Strike', tier: 'S', cost: 4, type: 'attack', target: 'single_enemy', description: 'Blinks behind target and delivers a paralyzing sting. Deals 38 damage and stuns.', damage: 38 },
  { id: 'dear_s3', name: 'Jungle Oasis Rebirth', tier: 'S', cost: 4, type: 'heal', target: 'all_allies', description: 'Purifies the jungle. All allies heal 22 HP and gain 14 Shield.', heal: 22, block: 14 },
]);

// 13. Cole (Mini Turtle - Toddler Spinner)
const COLE_CARDS: Card[] = createStuffyCardSet('cole', [
  // F-Tier
  { id: 'cole_f1', name: 'Toddler Wobble', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Wobbles forward. Deals 3 damage.', damage: 3 },
  { id: 'cole_f2', name: 'Mini Shell Tuck', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Tucks into mini green shell. Gain 5 Shield.', block: 5 },
  { id: 'cole_f3', name: 'Brotherly Cheep', tier: 'F', cost: 1, type: 'utility', target: 'single_ally', description: 'Cheers on Henry. Ally gains 3 Shield.', block: 3 },
  // D-Tier
  { id: 'cole_d1', name: 'Toddler Spin', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Spins around on belly. Deals 6 damage.', damage: 6 },
  { id: 'cole_d2', name: 'Hard Shell Clatter', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Snaps shell tight. Gain 7 Shield.', block: 7 },
  { id: 'cole_d3', name: 'Kiwi Nibble', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Munches juicy kiwi. Heals 8 HP.', heal: 8 },
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
  { id: 'joann_f1', name: 'Bored Paw Swat', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'A half-hearted swat. Deals 3 damage.', damage: 3 },
  { id: 'joann_f2', name: 'Feline Loaf', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Tucks paws in. Gain 4 Shield.', block: 4 },
  { id: 'joann_f3', name: 'Haughty Meow', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Demands food. Deals 2 damage.', damage: 2 },
  // D-Tier
  { id: 'joann_d1', name: 'Scratch Post Shred', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Scratches fabric. Deals 7 damage.', damage: 7 },
  { id: 'joann_d2', name: 'Agile Leap', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Leaps onto a bookshelf. Gain 7 Shield.', block: 7 },
  { id: 'joann_d3', name: 'Tuna Lick', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Eats canned tuna. Heals 8 HP.', heal: 8 },
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
  { id: 'cidney_f1', name: 'Cheek Stash', tier: 'F', cost: 1, type: 'utility', target: 'self', description: 'Puffs cheeks with small nuts. Gain 3 Shield.', block: 3 },
  { id: 'cidney_f2', name: 'Waddle Bounce', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Bounces heavily into foe. Deals 3 damage.', damage: 3 },
  { id: 'cidney_f3', name: 'Tail Fluff Guard', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Hides behind massive bushy tail. Gain 4 Shield.', block: 4 },
  // D-Tier
  { id: 'cidney_d1', name: 'Acorn Toss', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Throws a little acorn. Deals 7 damage.', damage: 7 },
  { id: 'cidney_d2', name: 'Fat Layer Armor', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Dense squishy padding. Gain 8 Shield.', block: 8 },
  { id: 'cidney_d3', name: 'Walnut Crack', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Eats cracked walnut. Heals 8 HP.', heal: 8 },
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
  { id: 'chanteira_f1', name: 'Chonky Splash', tier: 'F', cost: 1, type: 'attack', target: 'single_enemy', description: 'Splashes sea water. Deals 3 damage.', damage: 3 },
  { id: 'chanteira_f2', name: 'Flipper Hug', tier: 'F', cost: 1, type: 'defense', target: 'self', description: 'Cuddles with flippers. Gain 4 Shield.', block: 4 },
  { id: 'chanteira_f3', name: 'Blowhole Poot', tier: 'F', cost: 1, type: 'utility', target: 'single_enemy', description: 'Puffs steam from blowhole. Deals 2 damage.', damage: 2 },
  // D-Tier
  { id: 'chanteira_d1', name: 'Belly Wave Roll', tier: 'D', cost: 1, type: 'attack', target: 'single_enemy', description: 'Rolls round body through water. Deals 7 damage.', damage: 7 },
  { id: 'chanteira_d2', name: 'Marine Bubble Guard', tier: 'D', cost: 1, type: 'defense', target: 'self', description: 'Encases self in sea foam. Gain 7 Shield.', block: 7 },
  { id: 'chanteira_d3', name: 'Squid Bite', tier: 'D', cost: 2, type: 'heal', target: 'self', description: 'Eats squid pop. Heals 8 HP.', heal: 8 },
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
];

export const CARD_MAP = new Map<string, Card>(
  ALL_CARDS.map((c) => [c.id, c])
);
