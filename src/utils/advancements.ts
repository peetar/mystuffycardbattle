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

export const INITIAL_ADVANCEMENTS: Advancement[] = [
  {
    id: 'concussion_kill',
    title: "Killed 'Em With A Concussion",
    description: "Defeat all opposing stuffies while they have Brain Damage or finish them off with a Brain Damage card!",
    icon: '🧠',
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
    id: 'grand_campaign_victor',
    title: 'Grand Champion of the Quilt',
    description: 'Conquer the final act boss and complete a full campaign run.',
    icon: '👑',
    unlocked: false,
  },
  {
    id: 'amalgam_shatter',
    title: 'Splintered Assembly',
    description: 'Shatter The Stuffy Amalgam and survive its 5-way monster split.',
    icon: '🧩',
    unlocked: false,
  },
  {
    id: 'mega_triad_down',
    title: 'Trinity Toppler',
    description: 'Defeat the fearsome Mega Trinity boss squad (Mega Alex, Mega Finley & Mega Jefe).',
    icon: '🔱',
    unlocked: false,
  },
  {
    id: 'aquatic_dominance',
    title: 'Aquatic Apex',
    description: 'Defeat the 5-member All-Aquatic Boss encounter in battle.',
    icon: '🐬',
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
