/**
 * Persistent Roster Stars & Global Card Binder Utilities
 * 
 * STAR EVOLUTION RULE:
 * 1★ can only merge with 1★ to make 2★.
 * 2★ can only merge with 2★ to make 3★.
 * 3★ can only merge with 3★ to make 4★.
 * 4★ can only merge with 4★ to make 5★.
 * 5★ can only merge with 5★ to make 6★.
 * 6★ can only merge with 6★ to make 7★.
 * 7★ can only merge with 7★ to make 8★.
 * 8★ can only merge with 8★ to make 9★.
 * 9★ can only merge with 9★ to make 10★.
 */

const ROSTER_STARS_KEY = 'benstuffy_roster_stars';
const GLOBAL_BINDER_KEY = 'benstuffy_stuffy_cards';

export type StuffyCardsRecord = Record<string, Record<number, number>>;

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

/**
 * Normalizes any card record into the star-tiered format:
 * speciesId -> { [stars: number]: count }
 */
export function normalizeStuffyCards(raw: any): StuffyCardsRecord {
  const result: StuffyCardsRecord = {};
  if (!raw || typeof raw !== 'object') return result;

  for (const [speciesId, val] of Object.entries(raw)) {
    result[speciesId] = {};
    if (typeof val === 'number') {
      if (val > 0) result[speciesId][1] = val;
    } else if (val && typeof val === 'object') {
      for (const [sKey, count] of Object.entries(val)) {
        const starNum = Number(sKey);
        if (!isNaN(starNum) && typeof count === 'number' && count > 0) {
          result[speciesId][starNum] = count;
        }
      }
    }
  }
  return result;
}

export function getGlobalBinderCards(): StuffyCardsRecord {
  const defaultCards: StuffyCardsRecord = {
    cow: { 1: 4, 2: 2, 5: 1 },
    jefe: { 1: 2, 5: 1 },
    alex: { 1: 2 },
    spot: { 1: 2 },
  };

  if (typeof window === 'undefined') return defaultCards;
  try {
    const raw = localStorage.getItem(GLOBAL_BINDER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const normalized = normalizeStuffyCards(parsed);
        if (getTotalBinderCardsCount(normalized) > 0) {
          return normalized;
        }
      }
    }
    localStorage.setItem(GLOBAL_BINDER_KEY, JSON.stringify(defaultCards));
    return defaultCards;
  } catch {
    return defaultCards;
  }
}

export function saveGlobalBinderCards(cards: StuffyCardsRecord): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GLOBAL_BINDER_KEY, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save global binder:', e);
  }
}

export function getSpeciesCardCount(cards: StuffyCardsRecord, speciesId: string, star?: number): number {
  const speciesStars = cards[speciesId];
  if (!speciesStars) return 0;
  if (star !== undefined) {
    return speciesStars[star] || 0;
  }
  return Object.values(speciesStars).reduce((acc, c) => acc + (typeof c === 'number' ? c : 0), 0);
}

export function getTotalBinderCardsCount(cards: StuffyCardsRecord): number {
  let total = 0;
  for (const speciesMap of Object.values(cards || {})) {
    if (speciesMap && typeof speciesMap === 'object') {
      for (const count of Object.values(speciesMap)) {
        if (typeof count === 'number') total += count;
      }
    }
  }
  return total;
}

/**
 * Merge two cards of the exact same star level to produce one card of the next star level:
 * 1★ + 1★ = 2★
 * 2★ + 2★ = 3★
 * 3★ + 3★ = 4★
 * ... up to 10★
 */
export function mergeCardsByStar(
  cards: StuffyCardsRecord,
  speciesId: string,
  star: number
): { success: boolean; newCards: StuffyCardsRecord; message: string } {
  if (star < 1 || star >= 10) {
    return {
      success: false,
      newCards: cards,
      message: 'Cards are already at the maximum 10 Stars and cannot be merged further!',
    };
  }

  const currentCount = cards[speciesId]?.[star] || 0;
  if (currentCount < 2) {
    return {
      success: false,
      newCards: cards,
      message: `⚠️ Need two ${star}★ cards to merge into a ${star + 1}★ card! (You have: ${currentCount}/2)`,
    };
  }

  const updated: StuffyCardsRecord = {
    ...cards,
    [speciesId]: {
      ...(cards[speciesId] || {}),
      [star]: currentCount - 2,
      [star + 1]: (cards[speciesId]?.[star + 1] || 0) + 1,
    },
  };

  saveGlobalBinderCards(updated);
  return {
    success: true,
    newCards: updated,
    message: `✨ MERGE SUCCESS: Combined two ${star}★ cards into one ${star + 1}★ card!`,
  };
}

/**
 * Consumes one card of the exact matching star tier to evolve a stuffy:
 * A 1★ stuffy merges with a 1★ card -> 2★ stuffy
 * A 5★ stuffy merges with a 5★ card -> 6★ stuffy
 * A 9★ stuffy merges with a 9★ card -> 10★ stuffy
 */
export function consumeCardOfStar(
  cards: StuffyCardsRecord,
  speciesId: string,
  star: number
): { success: boolean; newCards: StuffyCardsRecord } {
  const currentCount = cards[speciesId]?.[star] || 0;
  if (currentCount < 1) {
    return { success: false, newCards: cards };
  }

  const updated: StuffyCardsRecord = {
    ...cards,
    [speciesId]: {
      ...(cards[speciesId] || {}),
      [star]: currentCount - 1,
    },
  };

  saveGlobalBinderCards(updated);
  return { success: true, newCards: updated };
}

/**
 * Adds a card of a specific star level to the binder
 */
export function addCardOfStar(
  cards: StuffyCardsRecord,
  speciesId: string,
  star = 1,
  quantity = 1
): StuffyCardsRecord {
  const clampedStar = Math.max(1, Math.min(10, star));
  const updated: StuffyCardsRecord = {
    ...cards,
    [speciesId]: {
      ...(cards[speciesId] || {}),
      [clampedStar]: (cards[speciesId]?.[clampedStar] || 0) + quantity,
    },
  };
  saveGlobalBinderCards(updated);
  return updated;
}
