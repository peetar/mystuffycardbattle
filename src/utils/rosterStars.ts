/**
 * Persistent Roster Stars & Global Card Binder Utilities
 * Allows stuffies evolved in the Evolution Lab to retain their star levels (5★-10★)
 * across new campaign runs, and preserves collected binder cards & reward packs.
 */

const ROSTER_STARS_KEY = 'benstuffy_roster_stars';
const GLOBAL_BINDER_KEY = 'benstuffy_stuffy_cards';
const GLOBAL_PACKS_KEY = 'benstuffy_reward_packs';

export function getRosterStars(speciesId: string): number {
  if (typeof window === 'undefined') return 5;
  try {
    const raw = localStorage.getItem(ROSTER_STARS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed[speciesId] === 'number') {
        return Math.max(1, Math.min(10, parsed[speciesId]));
      }
    }
  } catch (e) {
    console.error('Failed to get roster stars:', e);
  }
  return 5;
}

export function setRosterStars(speciesId: string, stars: number): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(ROSTER_STARS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[speciesId] = Math.max(1, Math.min(10, stars));
    localStorage.setItem(ROSTER_STARS_KEY, JSON.stringify(parsed));
  } catch (e) {
    console.error('Failed to set roster stars:', e);
  }
}

export function getAllRosterStars(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ROSTER_STARS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getGlobalBinderCards(): Record<string, number> {
  if (typeof window === 'undefined') return { cow: 2, jefe: 2, alex: 1, spot: 1 };
  try {
    const raw = localStorage.getItem(GLOBAL_BINDER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
    // Seed default starter cards for new players to explore the binder & evolution lab immediately
    const starterCards = { cow: 2, jefe: 2, alex: 1, spot: 1 };
    localStorage.setItem(GLOBAL_BINDER_KEY, JSON.stringify(starterCards));
    return starterCards;
  } catch {
    return { cow: 2, jefe: 2, alex: 1, spot: 1 };
  }
}

export function saveGlobalBinderCards(cards: Record<string, number>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GLOBAL_BINDER_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save global binder:', e);
  }
}
