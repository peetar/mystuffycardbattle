// Friend Request & Social Squad Utilities

export interface FriendProfile {
  username: string;
  skillRating: number;
  status: 'online' | 'in_game' | 'offline';
  addedAt: number;
}

export interface FriendRequest {
  id: string;
  fromUsername: string;
  toUsername: string;
  createdAt: number;
  status: 'pending' | 'accepted' | 'declined';
}

const STORAGE_FRIENDS_KEY = 'ben_stuffy_friends_v1';
const STORAGE_REQUESTS_KEY = 'ben_stuffy_friend_requests_v1';

// Default starter community players for sandbox / social simulation
export const DEFAULT_COMMUNITY_PLAYERS: FriendProfile[] = [
  { username: 'BenTheCreator', skillRating: 1500, status: 'online', addedAt: Date.now() - 86400000 },
  { username: 'GeorgeOcto', skillRating: 1250, status: 'online', addedAt: Date.now() - 43200000 },
  { username: 'AllieSwampQueen', skillRating: 1380, status: 'in_game', addedAt: Date.now() - 21600000 },
  { username: 'BigBearSnoozer', skillRating: 1420, status: 'online', addedAt: Date.now() - 10800000 },
  { username: 'PlushieMaster99', skillRating: 1100, status: 'offline', addedAt: Date.now() - 7200000 },
];

export const friendsManager = {
  getFriends(): FriendProfile[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_FRIENDS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Seed with starter friends on first run
      const initial = DEFAULT_COMMUNITY_PLAYERS.slice(0, 2);
      localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(initial));
      return initial;
    } catch {
      return [];
    }
  },

  getRequests(): FriendRequest[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_REQUESTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Seed starter incoming request
      const starterRequest: FriendRequest = {
        id: 'freq_allie_init',
        fromUsername: 'AllieSwampQueen',
        toUsername: 'Player',
        createdAt: Date.now() - 120000,
        status: 'pending',
      };
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify([starterRequest]));
      return [starterRequest];
    } catch {
      return [];
    }
  },

  async sendFriendRequest(fromUsername: string, toUsername: string): Promise<{ success: boolean; message: string }> {
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

    // Call server API (best effort for cross-client sync)
    try {
      await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_friend_request',
          fromUsername: cleanFrom,
          toUsername: cleanTo,
        }),
      });
    } catch (e) {
      // offline fallback
    }

    const newRequest: FriendRequest = {
      id: `freq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromUsername: cleanFrom,
      toUsername: cleanTo,
      createdAt: Date.now(),
      status: 'pending',
    };

    currentRequests.push(newRequest);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(currentRequests));
    }

    return { success: true, message: `Friend request sent to @${cleanTo}!` };
  },

  async acceptRequest(requestId: string): Promise<boolean> {
    const requests = this.getRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return false;

    req.status = 'accepted';
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(requests));
    }

    // Add to friends
    const currentFriends = this.getFriends();
    if (!currentFriends.some((f) => f.username.toLowerCase() === req.fromUsername.toLowerCase())) {
      const match = DEFAULT_COMMUNITY_PLAYERS.find(
        (p) => p.username.toLowerCase() === req.fromUsername.toLowerCase()
      );
      const newFriend: FriendProfile = {
        username: req.fromUsername,
        skillRating: match?.skillRating || Math.floor(1100 + Math.random() * 400),
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
          username: req.toUsername,
        }),
      });
    } catch (e) {
      // offline fallback
    }

    return true;
  },

  async declineRequest(requestId: string): Promise<boolean> {
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
          username: req.toUsername,
        }),
      });
    } catch (e) {
      // offline fallback
    }

    return true;
  },

  async unfriend(friendUsername: string): Promise<boolean> {
    let friends = this.getFriends();
    friends = friends.filter((f) => f.username.toLowerCase() !== friendUsername.toLowerCase());
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_FRIENDS_KEY, JSON.stringify(friends));
    }

    try {
      await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'unfriend',
          friendUsername,
        }),
      });
    } catch (e) {
      // offline fallback
    }

    return true;
  },

  // Pull fresh requests from server and sync
  async syncWithServer(currentUser: string): Promise<{ friends: FriendProfile[]; requests: FriendRequest[] }> {
    try {
      const res = await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_friend_requests',
          username: currentUser,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        const local = this.getRequests();
        data.requests.forEach((r: FriendRequest) => {
          if (!local.some((l) => l.id === r.id)) {
            local.unshift(r);
          }
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_REQUESTS_KEY, JSON.stringify(local));
        }
      }
    } catch (e) {
      // offline
    }
    return {
      friends: this.getFriends(),
      requests: this.getRequests(),
    };
  },
};
