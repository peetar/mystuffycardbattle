// Friend Request & Social Squad Utilities (Real Players Only - No Fake Users)

export interface FriendProfile {
  username: string;
  skillRating: number;
  status: 'online' | 'in_game' | 'offline';
  addedAt: number;
  lastActive?: number;
}

export interface FriendNote {
  nickname?: string;
  note?: string;
}

export interface FriendRequest {
  id: string;
  fromUsername: string;
  toUsername: string;
  createdAt: number;
  status: 'pending' | 'accepted' | 'declined';
}

export interface ActivePlayerEntry {
  username: string;
  skillRating: number;
  lastActive: number; // Unix timestamp ms
}

const STORAGE_FRIENDS_KEY = 'ben_stuffy_friends_v1';
const STORAGE_REQUESTS_KEY = 'ben_stuffy_friend_requests_v1';
const STORAGE_ACTIVE_PLAYERS_KEY = 'ben_stuffy_active_players_year_v1';
const STORAGE_FRIEND_NOTES_KEY = 'ben_stuffy_friend_notes_v1';

// Format last active timestamp into friendly relative string
export function formatLastActive(lastActive?: number): string {
  if (!lastActive) return 'Offline';
  const diff = Math.max(0, Date.now() - lastActive);
  if (diff < 2 * 60 * 1000) return 'Online now';
  if (diff < 60 * 60 * 1000) return `Active ${Math.floor(diff / 60000)}m ago`;
  if (diff < 24 * 60 * 60 * 1000) return `Active ${Math.floor(diff / 3600000)}h ago`;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  return `Active ${days}d ago`;
}

// 1 Year in milliseconds (365 days)
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// List of former mock / placeholder usernames to scrub out completely
const SCRUB_MOCK_USERNAMES = new Set([
  'benthecreator',
  'georgeocto',
  'allieswampqueen',
  'bigbearsnoozer',
  'plushiemaster99',
]);

export const friendsManager = {
  // Retrieve friends (strictly real friends, scrubbed of any mock users)
  getFriends(): FriendProfile[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_FRIENDS_KEY);
      if (stored) {
        const parsed: FriendProfile[] = JSON.parse(stored);
        // Scrub any former mock users
        const cleaned = parsed.filter(
          (f) => f && f.username && !SCRUB_MOCK_USERNAMES.has(f.username.toLowerCase().trim())
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
      return [];
    } catch {
      return [];
    }
  },

  // Retrieve friend requests (strictly real requests, scrubbed of any mock requests)
  getRequests(): FriendRequest[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_REQUESTS_KEY);
      if (stored) {
        const parsed: FriendRequest[] = JSON.parse(stored);
        const cleaned = parsed.filter(
          (r) =>
            r &&
            r.id !== 'freq_allie_init' &&
            !SCRUB_MOCK_USERNAMES.has((r.fromUsername || '').toLowerCase().trim()) &&
            !SCRUB_MOCK_USERNAMES.has((r.toUsername || '').toLowerCase().trim())
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
      return [];
    } catch {
      return [];
    }
  },

  // Record an active player session (timestamped, filtered to last year)
  recordPlayerActive(username: string, skillRating: number = 1200): void {
    const clean = (username || '').trim();
    if (!clean || SCRUB_MOCK_USERNAMES.has(clean.toLowerCase())) return;

    if (typeof window !== 'undefined') {
      try {
        const now = Date.now();
        const stored = localStorage.getItem(STORAGE_ACTIVE_PLAYERS_KEY);
        let players: ActivePlayerEntry[] = stored ? JSON.parse(stored) : [];

        // Filter out entries older than 1 year and mock users
        players = players.filter(
          (p) =>
            p &&
            p.username &&
            !SCRUB_MOCK_USERNAMES.has(p.username.toLowerCase().trim()) &&
            now - p.lastActive <= ONE_YEAR_MS
        );

        const idx = players.findIndex((p) => p.username.toLowerCase() === clean.toLowerCase());
        if (idx !== -1) {
          players[idx].lastActive = now;
          if (skillRating && skillRating > 0) {
            players[idx].skillRating = skillRating;
          }
        } else {
          players.unshift({
            username: clean,
            skillRating: skillRating || 1200,
            lastActive: now,
          });
        }

        localStorage.setItem(STORAGE_ACTIVE_PLAYERS_KEY, JSON.stringify(players));
      } catch {
        // storage quota fallback
      }
    }

    // Best-effort notify server
    try {
      fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_active_player',
          username: clean,
          skillRating,
        }),
      }).catch(() => {});
    } catch {
      // offline fallback
    }
  },

  // Get all real players who have played in the last year (local + server sync)
  async getActivePlayersLastYear(): Promise<ActivePlayerEntry[]> {
    const now = Date.now();
    let localList: ActivePlayerEntry[] = [];

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_ACTIVE_PLAYERS_KEY);
        if (stored) {
          const parsed: ActivePlayerEntry[] = JSON.parse(stored);
          localList = parsed.filter(
            (p) =>
              p &&
              p.username &&
              !SCRUB_MOCK_USERNAMES.has(p.username.toLowerCase().trim()) &&
              now - p.lastActive <= ONE_YEAR_MS
          );
        }
      } catch {
        localList = [];
      }
    }

    // Sync with server active player registry
    try {
      const res = await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_active_players_year' }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.players)) {
        const playerMap = new Map<string, ActivePlayerEntry>();
        for (const p of localList) {
          playerMap.set(p.username.toLowerCase(), p);
        }
        for (const p of data.players) {
          if (!p || !p.username || SCRUB_MOCK_USERNAMES.has(p.username.toLowerCase().trim())) {
            continue;
          }
          if (now - p.lastActive <= ONE_YEAR_MS) {
            const existing = playerMap.get(p.username.toLowerCase());
            if (!existing || p.lastActive > existing.lastActive) {
              playerMap.set(p.username.toLowerCase(), p);
            }
          }
        }
        localList = Array.from(playerMap.values()).sort((a, b) => b.lastActive - a.lastActive);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_ACTIVE_PLAYERS_KEY, JSON.stringify(localList));
        }
      }
    } catch {
      // offline fallback
    }

    return localList;
  },

  // Send a real friend request (uses authoritative server request ID to prevent desync)
  async sendFriendRequest(
    fromUsername: string,
    toUsername: string
  ): Promise<{ success: boolean; message: string; request?: FriendRequest }> {
    const cleanTo = toUsername.trim();
    const cleanFrom = fromUsername.trim();

    if (!cleanTo) {
      return { success: false, message: 'Please enter a valid username.' };
    }
    if (cleanTo.toLowerCase() === cleanFrom.toLowerCase()) {
      return { success: false, message: 'You cannot send a friend request to yourself!' };
    }

    const currentFriends = this.getFriends();
    if (currentFriends.some((f) => f.username.toLowerCase() === cleanTo.toLowerCase())) {
      return { success: false, message: `@${cleanTo} is already on your friends list!` };
    }

    const currentRequests = this.getRequests();
    const existing = currentRequests.find(
      (r) =>
        r.fromUsername.toLowerCase() === cleanFrom.toLowerCase() &&
        r.toUsername.toLowerCase() === cleanTo.toLowerCase() &&
        r.status === 'pending'
    );
    if (existing) {
      return { success: false, message: `A friend request to @${cleanTo} is already pending.` };
    }

    // Call server API for authoritative sync
    let serverReq: FriendRequest | null = null;
    try {
      const res = await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_friend_request',
          fromUsername: cleanFrom,
          toUsername: cleanTo,
        }),
      });
      const data = await res.json();
      if (data.success && data.request) {
        serverReq = data.request;
      }
    } catch {
      // offline
    }

    // Use server request object if available, otherwise deterministic fallback
    const newRequest: FriendRequest = serverReq || {
      id: `freq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromUsername: cleanFrom,
      toUsername: cleanTo,
      createdAt: Date.now(),
      status: 'pending',
    };

    currentRequests.unshift(newRequest);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(currentRequests));
    }

    // Record both players in the active registry
    this.recordPlayerActive(cleanFrom);
    this.recordPlayerActive(cleanTo);

    return {
      success: true,
      message: `Friend request sent to @${cleanTo}!`,
      request: newRequest,
    };
  },

  // Accept incoming friend request
  async acceptRequest(requestId: string, currentUser?: string): Promise<boolean> {
    const requests = this.getRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return false;

    req.status = 'accepted';
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests));
    }

    const userToFriend = req.fromUsername;
    const currentFriends = this.getFriends();
    if (!currentFriends.some((f) => f.username.toLowerCase() === userToFriend.toLowerCase())) {
      // Look up skill rating from active players if available
      let rating = 1200;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(STORAGE_ACTIVE_PLAYERS_KEY);
          if (stored) {
            const active: ActivePlayerEntry[] = JSON.parse(stored);
            const found = active.find((p) => p.username.toLowerCase() === userToFriend.toLowerCase());
            if (found && found.skillRating) rating = found.skillRating;
          }
        } catch {
          // ignore
        }
      }

      const newFriend: FriendProfile = {
        username: userToFriend,
        skillRating: rating,
        status: 'online',
        addedAt: Date.now(),
      };
      currentFriends.push(newFriend);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(currentFriends));
      }
    }

    try {
      await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond_friend_request',
          requestId,
          accept: true,
          username: currentUser || req.toUsername,
        }),
      });
    } catch {
      // offline fallback
    }

    return true;
  },

  // Decline friend request
  async declineRequest(requestId: string, currentUser?: string): Promise<boolean> {
    const requests = this.getRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return false;

    req.status = 'declined';
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests));
    }

    try {
      await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond_friend_request',
          requestId,
          accept: false,
          username: currentUser || req.toUsername,
        }),
      });
    } catch {
      // offline fallback
    }

    return true;
  },

  // Cancel an outgoing friend request
  async cancelRequest(requestId: string): Promise<boolean> {
    let requests = this.getRequests();
    requests = requests.filter((r) => r.id !== requestId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests));
    }
    return true;
  },

  // Unfriend a user
  async unfriend(currentUser: string, friendUsername: string): Promise<boolean> {
    let friends = this.getFriends();
    friends = friends.filter((f) => f.username.toLowerCase() !== friendUsername.toLowerCase().trim());
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(friends));
    }

    try {
      await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unfriend',
          username: currentUser,
          friendUsername,
        }),
      });
    } catch {
      // offline fallback
    }

    return true;
  },

  // Pull fresh requests and friends from server and sync with local state
  async syncWithServer(currentUser: string): Promise<{ friends: FriendProfile[]; requests: FriendRequest[] }> {
    const cleanUser = (currentUser || '').trim();
    if (!cleanUser) {
      return {
        friends: this.getFriends(),
        requests: this.getRequests(),
      };
    }

    this.recordPlayerActive(cleanUser);

    try {
      // 1. Fetch incoming requests
      const resReqs = await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_friend_requests',
          username: cleanUser,
        }),
      });
      const dataReqs = await resReqs.json();
      if (dataReqs.success && Array.isArray(dataReqs.requests)) {
        const local = this.getRequests();
        dataReqs.requests.forEach((r: FriendRequest) => {
          if (
            !local.some((l) => l.id === r.id) &&
            !SCRUB_MOCK_USERNAMES.has((r.fromUsername || '').toLowerCase())
          ) {
            local.unshift(r);
          }
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(local));
        }
      }

      // 2. Fetch server-side friends
      const resFriends = await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_friends',
          username: cleanUser,
        }),
      });
      const dataFriends = await resFriends.json();
      if (dataFriends.success && Array.isArray(dataFriends.friends)) {
        const localFriends = this.getFriends();
        dataFriends.friends.forEach((f: FriendProfile | string) => {
          const name = typeof f === 'string' ? f : f.username;
          if (
            name &&
            !SCRUB_MOCK_USERNAMES.has(name.toLowerCase()) &&
            !localFriends.some((lf) => lf.username.toLowerCase() === name.toLowerCase())
          ) {
            localFriends.push({
              username: name,
              skillRating: typeof f === 'object' && f.skillRating ? f.skillRating : 1200,
              status: typeof f === 'object' && f.status ? f.status : 'online',
              addedAt: typeof f === 'object' && f.addedAt ? f.addedAt : Date.now(),
              lastActive: typeof f === 'object' && f.lastActive ? f.lastActive : undefined,
            });
          }
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(localFriends));
        }
      }
    } catch {
      // offline fallback
    }

    return {
      friends: this.getFriends(),
      requests: this.getRequests(),
    };
  },

  // Custom Friend Nicknames & Notes
  getFriendNote(username: string): FriendNote {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(STORAGE_FRIEND_NOTES_KEY);
      if (!stored) return {};
      const map = JSON.parse(stored);
      return map[username.toLowerCase().trim()] || {};
    } catch {
      return {};
    }
  },

  setFriendNote(username: string, noteData: FriendNote): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_FRIEND_NOTES_KEY);
      const map = stored ? JSON.parse(stored) : {};
      map[username.toLowerCase().trim()] = noteData;
      localStorage.setItem(STORAGE_FRIEND_NOTES_KEY, JSON.stringify(map));
    } catch {
      // storage quota fallback
    }
  },
};
