'use client';

// Advancements / Achievements Tracking & Notification System
import { sound } from './audio';

export interface Advancement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

const ADVANCEMENTS_STORAGE_KEY = 'ben_stuffy_advancements';
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
];

export const INITIAL_ADVANCEMENTS: Advancement[] = [
  {
    id: 'concussion_kill',
    title: "Killed 'Em With A Concussion",
    description: "Defeat every species of stuffy with a concussion across your battles! (All 21 species)",
    icon: '🧠',
    unlocked: false,
  },
  {
    id: 'clockwork_speedrun',
    title: 'Chrono Blitz',
    description: 'Defeat the Doomsday Chrono-Bear in 5 turns or fewer!',
    icon: '⏱️',
    unlocked: false,
  },
  // All Boss Slayers
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
  // Playable Hero Special Achievements
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
    icon: '🔥',
    unlocked: false,
  },
  {
    id: 'chaos_control',
    title: 'Chaos Unleashed',
    description: 'Reach 8 or more Energy on Shadow using Limit Break and Chaos Boost.',
    icon: '⚡',
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
    icon: '💥',
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
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'relay_surge',
    title: 'Maximum Overdrive',
    description: "Drain all energy from your board and channel 6+ Energy with Spot's Energy Relay.",
    icon: '🔋',
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
