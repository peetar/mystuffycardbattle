// Player Statistics Tracking System
// Persists stats in localStorage with Cookie backup

export interface PlayerStats {
  stuffyPicks: Record<string, number>; // stuffyId -> times picked/drafted
  cardPlays: Record<string, number>;   // cardId -> times played
  cardNames: Record<string, string>;   // cardId -> human-readable name
  stuffyNames: Record<string, string>; // stuffyId -> human-readable name
  deaths: number;                      // stuffies unstuffed / lost in combat
  wins: number;                        // total battles / runs won
  losses: number;                      // total battles / runs lost
  currentWinStreak: number;
  longestWinStreak: number;
  currentLossStreak: number;
  longestLossStreak: number;
}

const STATS_STORAGE_KEY = 'benstuffy_player_stats_v1';
const STATS_COOKIE_KEY = 'benstuffy_stats';

const DEFAULT_STATS: PlayerStats = {
  stuffyPicks: {},
  cardPlays: {},
  cardNames: {},
  stuffyNames: {},
  deaths: 0,
  wins: 0,
  losses: 0,
  currentWinStreak: 0,
  longestWinStreak: 0,
  currentLossStreak: 0,
  longestLossStreak: 0,
};

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function loadPlayerStats(): PlayerStats {
  if (typeof window === 'undefined') return { ...DEFAULT_STATS };

  try {
    const rawLocal = localStorage.getItem(STATS_STORAGE_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      return { ...DEFAULT_STATS, ...parsed };
    }

    const rawCookie = getCookie(STATS_COOKIE_KEY);
    if (rawCookie) {
      const parsed = JSON.parse(rawCookie);
      return { ...DEFAULT_STATS, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to parse player stats:', err);
  }

  return { ...DEFAULT_STATS };
}

export function savePlayerStats(stats: PlayerStats): void {
  if (typeof window === 'undefined') return;
  try {
    const str = JSON.stringify(stats);
    localStorage.setItem(STATS_STORAGE_KEY, str);
    // Keep cookie compact (summary only if string is large, or full string)
    setCookie(STATS_COOKIE_KEY, str, 365);
  } catch (err) {
    console.warn('Failed to save player stats:', err);
  }
}

export function recordStuffyPick(stuffyId: string, stuffyName?: string): void {
  const stats = loadPlayerStats();
  stats.stuffyPicks[stuffyId] = (stats.stuffyPicks[stuffyId] || 0) + 1;
  if (stuffyName) stats.stuffyNames[stuffyId] = stuffyName;
  savePlayerStats(stats);
}

export function recordCardPlay(cardId: string, cardName?: string): void {
  const stats = loadPlayerStats();
  stats.cardPlays[cardId] = (stats.cardPlays[cardId] || 0) + 1;
  if (cardName) stats.cardNames[cardId] = cardName;
  savePlayerStats(stats);
}

export function recordStuffyDeath(count = 1): void {
  const stats = loadPlayerStats();
  stats.deaths += count;
  savePlayerStats(stats);
}

export function recordBattleOutcome(won: boolean): void {
  const stats = loadPlayerStats();
  if (won) {
    stats.wins += 1;
    stats.currentWinStreak += 1;
    stats.currentLossStreak = 0;
    if (stats.currentWinStreak > stats.longestWinStreak) {
      stats.longestWinStreak = stats.currentWinStreak;
    }
  } else {
    stats.losses += 1;
    stats.currentLossStreak += 1;
    stats.currentWinStreak = 0;
    if (stats.currentLossStreak > stats.longestLossStreak) {
      stats.longestLossStreak = stats.currentLossStreak;
    }
  }
  savePlayerStats(stats);
}

export function getMostLikedStuffy(): { id: string; name: string; count: number } | null {
  const stats = loadPlayerStats();
  const entries = Object.entries(stats.stuffyPicks);
  if (entries.length === 0) return null;

  entries.sort((a, b) => b[1] - a[1]);
  const [topId, topCount] = entries[0];
  const name = stats.stuffyNames[topId] || topId.toUpperCase();
  return { id: topId, name, count: topCount };
}

export function getMostLikedCard(): { id: string; name: string; count: number } | null {
  const stats = loadPlayerStats();
  const entries = Object.entries(stats.cardPlays);
  if (entries.length === 0) return null;

  entries.sort((a, b) => b[1] - a[1]);
  const [topId, topCount] = entries[0];
  const name = stats.cardNames[topId] || topId;
  return { id: topId, name, count: topCount };
}

export function resetPlayerStats(): void {
  savePlayerStats({ ...DEFAULT_STATS });
}
