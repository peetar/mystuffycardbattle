'use client';

// Advancements / Achievements Tracking & Notification System (v3.4 - 105 Advancements)
import { sound } from './audio';

export interface Advancement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const ADVANCEMENTS_STORAGE_KEY = 'ben_stuffy_advancements_v34';
const CONCUSSION_STORAGE_KEY = 'ben_stuffy_concussed_species';

export const ALL_PLAYABLE_SPECIES = [
  'alex',
  'jefe',
  'finlee',
  'fifi',
  'thumper',
  'toothless',
  'riolu',
  'eevee',
  'slugmee',
  'beaker',
  'henry',
  'dear',
  'cole',
  'joann',
  'cidney',
  'chanteira',
  'dolphy',
  'shadow',
  'spot',
  'george',
  'sluger',
  'spike',
  'umbreon',
  'pinky_bear',
  'big_bear',
  'allie',
];

// Exactly 105 Unique Advancements in a 7x15 grid, each with a unique, non-repeating icon
export const INITIAL_ADVANCEMENTS: Advancement[] = [
  // Row 1 (1-15): Boss Slayers & Historic Feats
  {
    id: 'boss_slayer_amalgam',
    title: 'Splintered Assembly',
    description: 'Shatter The Stuffy Amalgam and survive its 5-way monster split.',
    icon: '🧩',
    unlocked: false,
  },
  {
    id: 'boss_slayer_mega_trinity',
    title: 'Trinity Toppler',
    description: 'Defeat the fearsome Mega Trinity boss squad (Mega Alex, Mega Finley & Mega Jefe).',
    icon: '🔱',
    unlocked: false,
  },
  {
    id: 'boss_slayer_toxic_slug',
    title: 'Tox-Out',
    description: 'Defeat the Noxious Slime King and conquer his compounding venom.',
    icon: '🧪',
    unlocked: false,
  },
  {
    id: 'boss_slayer_lint_vampire',
    title: 'Lint Roller',
    description: 'Defeat the Static Sapper Lint Vampire after surviving its energy drains.',
    icon: '🦇',
    unlocked: false,
  },
  {
    id: 'boss_slayer_clockwork',
    title: 'Tick-Tock Takedown',
    description: 'Defeat the Doomsday Chrono-Bear before its tactical fluff nuke.',
    icon: '⏰',
    unlocked: false,
  },
  {
    id: 'boss_slayer_cinder',
    title: 'Fire Extinguisher',
    description: 'Extinguish and defeat Ignis the Cinder Drake.',
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'boss_slayer_graverobber',
    title: 'Grave Keeper',
    description: 'Defeat Scrappy the Graverobber and recover your stolen discard pile.',
    icon: '🪦',
    unlocked: false,
  },
  {
    id: 'boss_slayer_mind',
    title: 'Psychic Bastion',
    description: 'Defeat the Psychic Mind-Leech and shield your draw pile.',
    icon: '🔮',
    unlocked: false,
  },
  {
    id: 'boss_slayer_aquatic',
    title: 'Aquatic Apex',
    description: 'Defeat the 5-member All-Aquatic Boss encounter in battle.',
    icon: '🐬',
    unlocked: false,
  },
  {
    id: 'boss_slayer_lifelink',
    title: 'Chain Breaker',
    description: 'Defeat all members of the Life-Linked Trinity before their 3-turn revival expires.',
    icon: '🔗',
    unlocked: false,
  },
  {
    id: 'boss_slayer_shadow',
    title: 'Light in the Dark',
    description: 'Overcome and defeat Shadow the Ultimate in an epic boss duel.',
    icon: '🌑',
    unlocked: false,
  },
  {
    id: 'boss_slayer_mirror',
    title: 'Shattered Reflection',
    description: 'Defeat the Mirror Doppelganger despite its reflection barrier.',
    icon: '🪞',
    unlocked: false,
  },
  {
    id: 'boss_slayer_gorgon',
    title: 'Unstoned',
    description: 'Defeat the Fluff Devourer Gorgon and survive its swallowing maw.',
    icon: '🐍',
    unlocked: false,
  },
  {
    id: 'boss_slayer_volt',
    title: 'Lightning Rod',
    description: 'Defeat Surge the Thunder Golem and resist its EMP stuns.',
    icon: '⚡',
    unlocked: false,
  },
  {
    id: 'clockwork_speedrun',
    title: 'Chrono Blitz',
    description: 'Defeat the Doomsday Chrono-Bear in 5 turns or fewer!',
    icon: '⏱️',
    unlocked: false,
  },

  // Row 2 (16-30): Roster Heroes & Signature Abilities
  {
    id: 'concussion_kill',
    title: "Killed 'Em With A Concussion",
    description: 'Defeat every species of stuffy with a concussion across your battles! (All 25 playable species)',
    icon: '🧠',
    unlocked: false,
  },
  {
    id: 'george_mood_master',
    title: 'Emotional Rollercoaster',
    description: 'Toggle George between Angry and Happy mode 5 or more times in a single battle.',
    icon: '🐙',
    unlocked: false,
  },
  {
    id: 'sluger_knockout',
    title: 'Heavyweight Champion',
    description: "Knock out an enemy with Sluger's Championship Knockout.",
    icon: '🥊',
    unlocked: false,
  },
  {
    id: 'fluff_overload',
    title: 'Fluff Overload',
    description: 'Stack 50 or more Shield on a single stuffy at once.',
    icon: '🛡️',
    unlocked: false,
  },
  {
    id: 'pyromancer',
    title: 'Total Meltdown',
    description: 'Extinguish an ignited friendly stuffy with healing and defeat an enemy with burn damage.',
    icon: '🌋',
    unlocked: false,
  },
  {
    id: 'chaos_control',
    title: 'Chaos Unleashed',
    description: 'Reach 8 or more Energy on Shadow using Limit Break and Chaos Boost.',
    icon: '💥',
    unlocked: false,
  },
  {
    id: 'strokenosis_master',
    title: 'Mind Puppet',
    description: "Mind-control and steal an opponent's card using Alex's Strokenosis.",
    icon: '👁️',
    unlocked: false,
  },
  {
    id: 'iron_plush',
    title: 'Iron Plush',
    description: 'Complete an entire campaign run without resting at a Rest Site and without feeding any food snacks!',
    icon: '⛓️',
    unlocked: false,
  },
  {
    id: 'colossal_strike',
    title: 'Colossal Plush Strike',
    description: 'Deal 100 or more damage in a single card attack or combo!',
    icon: '🔨',
    unlocked: false,
  },
  {
    id: 'hanging_by_a_thread',
    title: 'Hanging by a Thread',
    description: 'Win a combat encounter with an active stuffy at exactly 1 HP!',
    icon: '🧵',
    unlocked: false,
  },
  {
    id: 'brain_resilience',
    title: 'Mind Cleared',
    description: 'Have a stuffy naturally recover from Brain Damage after the 3-turn duration expires!',
    icon: '✨',
    unlocked: false,
  },
  {
    id: 'mmr_grandmaster',
    title: 'Plush Grandmaster',
    description: 'Reach a Skill Rating of 1500+ MMR in Online Multiplayer.',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'grand_campaign_victor',
    title: 'Grand Champion of the Quilt',
    description: 'Conquer the final act boss and complete a full campaign run.',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'relay_surge',
    title: 'Maximum Overdrive',
    description: "Drain all energy from your board and channel 6+ Energy with Spot's Energy Relay.",
    icon: '🔋',
    unlocked: false,
  },
  {
    id: 'spike_quill_burst',
    title: 'Needle Storm',
    description: 'Spread bleeding stuffing to 3 or more enemies simultaneously with Spike.',
    icon: '🦔',
    unlocked: false,
  },

  // Row 3 (31-45): Spike, Umbreon, Pinky Bear & Big Bear Masteries
  {
    id: 'spike_crack_trap',
    title: 'Fissure Fall',
    description: 'Have an enemy slip into an earthquake crack caused by Bleeding Stuffing.',
    icon: '🕳️',
    unlocked: false,
  },
  {
    id: 'umbreon_mind_hijack',
    title: 'Midnight Puppetmaster',
    description: "Play 3 enemy cards in a single battle using Umbreon's Mind Control powers.",
    icon: '🌙',
    unlocked: false,
  },
  {
    id: 'umbreon_dark_pulse',
    title: 'Umbral Eclipse',
    description: "Defeat an enemy stuffy exclusively utilizing Umbreon's psychic dark attacks.",
    icon: '🌌',
    unlocked: false,
  },
  {
    id: 'pinky_stash_guardian',
    title: 'Brother Shall Not Touch',
    description: 'Guard the secret candy stash and apply Weakness 4 times in one encounter with Pinky Bear.',
    icon: '🍬',
    unlocked: false,
  },
  {
    id: 'pinky_sugar_rush',
    title: 'Sweet Revenge',
    description: 'Defeat a boss after healing Pinky Bear with secret stashed confectionery.',
    icon: '🍭',
    unlocked: false,
  },
  {
    id: 'big_bear_slumber',
    title: 'Hibernation Nation',
    description: 'Accumulate 60+ Shield passively while Big Bear sleeps through battle.',
    icon: '💤',
    unlocked: false,
  },
  {
    id: 'big_bear_awakened',
    title: 'Colossal Awakening',
    description: 'Spend 3 Crackers to wake Big Bear and deal 40+ damage in the same turn.',
    icon: '🐻',
    unlocked: false,
  },
  {
    id: 'bleed_epidemic',
    title: 'Hemorrhage Cascade',
    description: 'Cause Bleeding Stuffing to inflict poison on both adjacent neighbors in a single turn.',
    icon: '🩸',
    unlocked: false,
  },
  {
    id: 'confectionery_stash',
    title: 'Forbidden Candy',
    description: "Steal candy right back from an attacking opponent during Pinky Bear's watch.",
    icon: '🍫',
    unlocked: false,
  },
  {
    id: 'somnambulist_smash',
    title: 'Sleepwalker Haymaker',
    description: 'Defeat an enemy stuffy with Big Bear while Big Bear is still hibernating!',
    icon: '🛏️',
    unlocked: false,
  },
  {
    id: 'needle_barricade',
    title: 'Pin Cushion',
    description: "Reflect damage back at an attacker using Spike's Porcupine Quill Guard.",
    icon: '🪡',
    unlocked: false,
  },
  {
    id: 'lunar_synchrony',
    title: 'Moonlit Transcendence',
    description: 'Have Umbreon reach full psychic charge under the Moonlit Glade background.',
    icon: '🌠',
    unlocked: false,
  },
  {
    id: 'candy_fortress',
    title: 'Sugar Shield',
    description: 'Have Pinky Bear absorb 100 total damage over a single combat without losing HP.',
    icon: '🧁',
    unlocked: false,
  },
  {
    id: 'bear_hug_avalanche',
    title: 'Grizzly Quake',
    description: "Knock down two enemies into earthquake fissures with Big Bear's awakened slam.",
    icon: '🐾',
    unlocked: false,
  },
  {
    id: 'toxic_splatter',
    title: 'Acid Splash',
    description: 'Stack 20 or more Poison on an opposing team boss.',
    icon: '🤢',
    unlocked: false,
  },

  // Row 4 (46-60): Tactical Play & Combat Milestones
  {
    id: 'card_hoarder',
    title: 'Full Hand Arsenal',
    description: 'Hold a full hand of 7 cards at the start of your turn.',
    icon: '🃏',
    unlocked: false,
  },
  {
    id: 'deck_thinning_master',
    title: 'Minimalist Stitch',
    description: 'Win a combat encounter with 5 or fewer total cards remaining in your deck.',
    icon: '✂️',
    unlocked: false,
  },
  {
    id: 'turn_one_demolition',
    title: 'Alpha Strike',
    description: 'Defeat any non-boss enemy stuffy on Turn 1 of combat.',
    icon: '🎯',
    unlocked: false,
  },
  {
    id: 'cracker_feast',
    title: 'Baker Banquet',
    description: 'Spend 12 or more Crackers in a single turn using refunds and energy bonuses.',
    icon: '🍪',
    unlocked: false,
  },
  {
    id: 'infinite_stitch',
    title: 'Master Tailor',
    description: 'Restitch unstuffed friendly stuffies 3 times in a single battle.',
    icon: '🩹',
    unlocked: false,
  },
  {
    id: 'perfect_ward',
    title: 'Untouchable Cotton',
    description: 'Complete an elite combat encounter taking zero damage to your HP.',
    icon: '💎',
    unlocked: false,
  },
  {
    id: 'sniper_fluff',
    title: 'Precision Needle',
    description: 'Defeat an enemy behind two taunting defenders using piercing attacks.',
    icon: '🏹',
    unlocked: false,
  },
  {
    id: 'venom_overdose',
    title: 'Lethal Dose',
    description: 'Defeat an opponent purely from Poison tick damage at the start of their turn.',
    icon: '☠️',
    unlocked: false,
  },
  {
    id: 'brain_fog_lock',
    title: 'Amnesia Protocol',
    description: 'Have 3 enemy stuffies simultaneously afflicted with Brain Damage.',
    icon: '🤯',
    unlocked: false,
  },
  {
    id: 'swallow_whole_apex',
    title: 'Gulp',
    description: "Devour an enemy elite stuffy permanently with Finlee's Swallow Whole.",
    icon: '🦈',
    unlocked: false,
  },
  {
    id: 'shell_fortress',
    title: 'Impenetrable Shell',
    description: 'Block 40+ incoming damage with a single defensive shell action.',
    icon: '🐢',
    unlocked: false,
  },
  {
    id: 'slug_hug_diplomacy',
    title: 'Slime Embrace',
    description: "Pacify an enraged boss using Slugmee's sticky Slug Hug.",
    icon: '🐌',
    unlocked: false,
  },
  {
    id: 'toothless_frenzy',
    title: 'Dragon Fury',
    description: 'Strike 4 consecutive times in one turn using Toothless combo flurry.',
    icon: '🐲',
    unlocked: false,
  },
  {
    id: 'eevee_adaptability',
    title: 'Evolutionary Leap',
    description: "Trigger all three of Eevee's elemental adaptabilities in one match.",
    icon: '🦊',
    unlocked: false,
  },
  {
    id: 'beaker_alchemy',
    title: 'Volatile Concoction',
    description: "Mix 3 different elemental potions in one battle using Beaker's Alchemy.",
    icon: '⚗️',
    unlocked: false,
  },

  // Row 5 (61-75): Multiplayer & Competitive Glory
  {
    id: 'pass_and_play_rival',
    title: 'Couch Champion',
    description: 'Win a 4-player Pass and Play Hotseat match as Player 4.',
    icon: '🛋️',
    unlocked: false,
  },
  {
    id: 'comeback_kid',
    title: 'Down to the Wire',
    description: 'Win a multiplayer match after being reduced to 1 stuffy against 4 opposing stuffies.',
    icon: '🪃',
    unlocked: false,
  },
  {
    id: 'quad_elimination',
    title: 'Clean Sweep',
    description: 'Defeat all 4 enemy stuffies with a single massive AoE attack.',
    icon: '💣',
    unlocked: false,
  },
  {
    id: 'first_blood_online',
    title: 'Online Debut',
    description: 'Claim your very first victory in Online Multiplayer matchmaking.',
    icon: '🌐',
    unlocked: false,
  },
  {
    id: 'rematch_respect',
    title: 'Good Sport',
    description: 'Complete 3 consecutive multiplayer rematches with the same opponent.',
    icon: '🤝',
    unlocked: false,
  },
  {
    id: 'draft_visionary',
    title: 'Grand Architect',
    description: 'Draft an undefeated squad consisting of exactly 5 stuffies in draft mode.',
    icon: '📜',
    unlocked: false,
  },
  {
    id: 'hotseat_tactician',
    title: 'Tabletop Tactician',
    description: 'Complete a full hotseat game without taking an undo action.',
    icon: '🎲',
    unlocked: false,
  },
  {
    id: 'mmr_climber',
    title: 'Rising Star',
    description: 'Climb 200 MMR points in online ranked play.',
    icon: '📈',
    unlocked: false,
  },
  {
    id: 'fluff_bluff',
    title: 'Mind Game Master',
    description: 'Force an opponent to forfeit or resign through superior tactical positioning.',
    icon: '🎭',
    unlocked: false,
  },
  {
    id: 'multiplayer_century',
    title: 'Centurion of the Quilt',
    description: 'Play 100 multiplayer card turns across all game modes.',
    icon: '💯',
    unlocked: false,
  },
  {
    id: 'flawless_defense',
    title: 'Blanket of Steel',
    description: 'End a multiplayer match without any friendly stuffy being unstuffed.',
    icon: '🏰',
    unlocked: false,
  },
  {
    id: 'speedy_duelist',
    title: 'Lightning Reflexes',
    description: 'Execute your entire turn and end within 10 seconds in a multiplayer duel.',
    icon: '⏩',
    unlocked: false,
  },
  {
    id: 'secret_stash_heist',
    title: 'Candy Robbery',
    description: 'Defeat Pinky Bear in multiplayer and loot all remaining crackers.',
    icon: '🍩',
    unlocked: false,
  },
  {
    id: 'porcupine_counter',
    title: 'Quill Wall',
    description: "Defeat an attacker purely through Spike's passive quill retaliation damage.",
    icon: '🌵',
    unlocked: false,
  },
  {
    id: 'telepathic_read',
    title: 'Thought Thief',
    description: 'Predict and steal the highest tier S-rank card from an opponent.',
    icon: '💡',
    unlocked: false,
  },

  // Row 6 (76-90): Environments, Exploration & Lore
  {
    id: 'gourmet_diet',
    title: 'Michelin Fluff',
    description: 'Feed every food item type to your squad at rest sites across a run.',
    icon: '🍯',
    unlocked: false,
  },
  {
    id: 'secret_room_discovery',
    title: 'Under the Bed',
    description: 'Discover the Secret Candy Stash hidden background environment.',
    icon: '🚪',
    unlocked: false,
  },
  {
    id: 'lunar_pilgrimage',
    title: 'Midnight Walk',
    description: 'Travel through the Moonlit Starlit Glade during a campaign journey.',
    icon: '🌕',
    unlocked: false,
  },
  {
    id: 'slumber_sanctuary',
    title: 'Deep Hibernation',
    description: 'Rest in the Deep Slumber Den without taking any damage for 3 nodes.',
    icon: '🏕️',
    unlocked: false,
  },
  {
    id: 'briar_crawler',
    title: 'Thicket Survivor',
    description: 'Clear a battle in the Prickly Briar Thicket without stepping into cracks.',
    icon: '🌾',
    unlocked: false,
  },
  {
    id: 'relic_collector',
    title: 'Trinket Hoarder',
    description: 'Equip 6 or more relics simultaneously in a single campaign run.',
    icon: '🎒',
    unlocked: false,
  },
  {
    id: 'shopkeeper_friend',
    title: 'Customer of the Year',
    description: 'Purchase every single item available in a Rest Site plush merchant.',
    icon: '💰',
    unlocked: false,
  },
  {
    id: 'campfire_tales',
    title: 'Plush Folklore',
    description: 'Rest at 4 different rest sites without losing a single stuffy.',
    icon: '🪵',
    unlocked: false,
  },
  {
    id: 'mystery_event_blessing',
    title: 'Fairy Thread',
    description: 'Receive a legendary blessing event during an exploration branch.',
    icon: '🧚',
    unlocked: false,
  },
  {
    id: 'cursed_stitch',
    title: 'Risk and Reward',
    description: 'Equip a cursed artifact and triumph over the next 3 consecutive battles.',
    icon: '🧿',
    unlocked: false,
  },
  {
    id: 'speedy_traveler',
    title: 'Swift Paws',
    description: 'Complete Act 1 in under 10 minutes real time.',
    icon: '🏎️',
    unlocked: false,
  },
  {
    id: 'full_roster_unlocked',
    title: "Noah's Ark of Plush",
    description: 'Deploy all 25 unique playable stuffies at least once in battle.',
    icon: '🎪',
    unlocked: false,
  },
  {
    id: 'golden_cracker_investor',
    title: 'Cracker Capitalist',
    description: 'Amass 50 gold coins in your campaign wallet.',
    icon: '🪙',
    unlocked: false,
  },
  {
    id: 'restitch_paragon',
    title: 'Button Eyed Savior',
    description: 'Restitch a fallen teammate with 100% max HP restored.',
    icon: '🧷',
    unlocked: false,
  },
  {
    id: 'ancient_tapestry',
    title: 'Lorekeeper',
    description: 'Inspect and uncover all secret lore dialogues across the quilt universe.',
    icon: '📖',
    unlocked: false,
  },

  // Row 7 (91-105): Grandmaster Mastery & Universe Completion
  {
    id: 'pacifist_turn',
    title: 'Peaceful Hug',
    description: 'End a combat turn playing 3 non-damaging cards that buff or heal your team.',
    icon: '🕊️',
    unlocked: false,
  },
  {
    id: 'extreme_synergy',
    title: 'Symbiotic Swarm',
    description: 'Trigger 4 distinct team passive abilities in a single combat round.',
    icon: '🐝',
    unlocked: false,
  },
  {
    id: 'titanic_shield',
    title: 'Wall of Fluff',
    description: 'Have your entire team combined reach over 150 total Shield.',
    icon: '🏯',
    unlocked: false,
  },
  {
    id: 'overkill_monarch',
    title: 'Overkill Extravaganza',
    description: 'Deal over 50 excess overkill damage on a single enemy blow.',
    icon: '🧨',
    unlocked: false,
  },
  {
    id: 'mirror_mastery',
    title: 'Reflective Prowess',
    description: 'Defeat your own exact mirror squad without losing any stuffies.',
    icon: '🔍',
    unlocked: false,
  },
  {
    id: 'true_champion',
    title: 'Immortal Quilt',
    description: 'Complete a full campaign without a single friendly stuffy ever being unstuffed.',
    icon: '🥇',
    unlocked: false,
  },
  {
    id: 'hardcore_victor',
    title: 'Unshakable Will',
    description: 'Complete the campaign on the highest challenge tier.',
    icon: '🥈',
    unlocked: false,
  },
  {
    id: 'bronze_scrapper',
    title: 'Scrappy Battler',
    description: 'Win a combat where 3 out of 4 friendly stuffies are unstuffed.',
    icon: '🥉',
    unlocked: false,
  },
  {
    id: 'deck_architect_s',
    title: 'S-Tier Symphony',
    description: 'Draft and hold 5 S-Tier cards in your active hand at one time.',
    icon: '⭐',
    unlocked: false,
  },
  {
    id: 'elemental_mastery',
    title: 'Prismatic Strike',
    description: 'Inflict Fire, Poison, Weak, and Bleeding Stuffing in a single turn.',
    icon: '🌈',
    unlocked: false,
  },
  {
    id: 'supernova_burst',
    title: 'Cosmic Explosion',
    description: 'Defeat 3 enemies simultaneously with a single area attack.',
    icon: '☄️',
    unlocked: false,
  },
  {
    id: 'gravitational_anchor',
    title: 'Deep Roots',
    description: 'Prevent any ally from falling into an earthquake crack throughout an earthquake battle.',
    icon: '⚓',
    unlocked: false,
  },
  {
    id: 'tactical_retreat',
    title: 'Live to Fight',
    description: 'Successfully escape or swap a wounded front-liner to the bench in the nick of time.',
    icon: '🏃',
    unlocked: false,
  },
  {
    id: 'plush_revolution',
    title: 'The Great Awakening',
    description: 'Awaken Big Bear, energize Shadow, and trigger George Angry mode all in one fight.',
    icon: '📢',
    unlocked: false,
  },
  {
    id: 'ultimate_completionist',
    title: 'Master of the Quilt Universe',
    description: 'Unlock 104 advancements and achieve true 100% mastery of Ben Stuffy Card Battle.',
    icon: '🎖️',
    unlocked: false,
  },
];

type UnlockListener = (advancement: Advancement) => void;
const listeners: Set<UnlockListener> = new Set();

export function subscribeAdvancement(listener: UnlockListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAdvancements(): Advancement[] {
  if (typeof window === 'undefined') return INITIAL_ADVANCEMENTS;
  try {
    const raw = localStorage.getItem(ADVANCEMENTS_STORAGE_KEY);
    if (!raw) return INITIAL_ADVANCEMENTS;
    const stored: Record<string, { unlocked: boolean; unlockedAt: string }> = JSON.parse(raw);
    return INITIAL_ADVANCEMENTS.map((adv) => ({
      ...adv,
      unlocked: Boolean(stored[adv.id]?.unlocked),
      unlockedAt: stored[adv.id]?.unlockedAt,
    }));
  } catch {
    return INITIAL_ADVANCEMENTS;
  }
}

export function unlockAdvancement(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getAdvancements();
    const item = list.find((a) => a.id === id);
    if (!item || item.unlocked) return false;

    const raw = localStorage.getItem(ADVANCEMENTS_STORAGE_KEY);
    const stored: Record<string, { unlocked: boolean; unlockedAt: string }> = raw ? JSON.parse(raw) : {};
    const unlockedAt = new Date().toLocaleDateString();
    stored[id] = { unlocked: true, unlockedAt };
    localStorage.setItem(ADVANCEMENTS_STORAGE_KEY, JSON.stringify(stored));

    const unlockedAdvancement: Advancement = {
      ...item,
      unlocked: true,
      unlockedAt,
    };

    sound.playAchievementSound();
    listeners.forEach((fn) => fn(unlockedAdvancement));
    return true;
  } catch (e) {
    console.error('Error unlocking advancement:', e);
    return false;
  }
}

export function resetAllAdvancements(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADVANCEMENTS_STORAGE_KEY);
    localStorage.removeItem(CONCUSSION_STORAGE_KEY);
    localStorage.removeItem('ben_stuffy_advancements');
    listeners.forEach((fn) =>
      fn({ id: '__reset__', title: 'Reset', description: 'Reset', icon: '🔄', unlocked: false })
    );
  } catch (e) {
    console.error('Error resetting advancements:', e);
  }
}

/**
 * Multi-Battle Concussion Defeat Tracking
 * Tracks every playable species killed while having Brain Damage or via Brain Damage attack
 */
export function getConcussedSpecies(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONCUSSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordConcussionKill(speciesId: string): { total: number; unlocked: boolean } {
  if (typeof window === 'undefined' || !speciesId) return { total: 0, unlocked: false };
  try {
    const current = new Set<string>(getConcussedSpecies());
    // Only track valid playable species
    if (ALL_PLAYABLE_SPECIES.includes(speciesId)) {
      current.add(speciesId);
      localStorage.setItem(CONCUSSION_STORAGE_KEY, JSON.stringify(Array.from(current)));
    }

    const total = current.size;
    let unlocked = false;
    if (ALL_PLAYABLE_SPECIES.every((sp) => current.has(sp))) {
      unlocked = unlockAdvancement('concussion_kill');
    }
    return { total, unlocked };
  } catch (e) {
    console.error('Error recording concussion kill:', e);
    return { total: 0, unlocked: false };
  }
}
