import { NextRequest, NextResponse } from 'next/server';
import { filterProfanity } from '@/utils/chatFilter';
import { PLAYABLE_STUFFIES, STUFFY_MAP } from '@/data/stuffies';
import { getLoadoutsForStuffy } from '@/data/loadouts';
import { CARD_MAP, PLAYER_POWERUP_CARDS } from '@/data/cards';
import { PlayerSide, MultiplayerPlayerData, StuffyState, Card } from '@/types/game';

export const dynamic = 'force-dynamic';

export type SlotType = 'none' | 'invite' | 'random' | 'bot';

export interface RoomSlot {
  slotIndex: number;
  type: SlotType;
  invitedUsername?: string;
  player?: {
    username: string;
    skillRating: number;
    isBot: boolean;
    ready: boolean;
  };
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface DraftPick {
  playerId: PlayerSide;
  playerIdx: number;
  playerName: string;
  speciesId: string;
  loadoutId: string;
  timestamp: number;
}

export interface OnlineDraftState {
  playerCount: number;
  playerNames: string[];
  playerIds: PlayerSide[];
  targetPerPlayer: number;
  currentPlayerIdx: number;
  currentPlayerId: PlayerSide;
  drafts: Record<number, { speciesId: string; loadoutId: string }[]>;
  availableSpeciesIds: string[];
  banishedSpeciesIds: string[];
  pickHistory: DraftPick[];
  isFinished: boolean;
}

export interface OnlineCombatState {
  actionSeq: number;
  turnNumber: number;
  activeSide: PlayerSide;
  currentCrackers: number;
  maxCrackers: number;
  players: MultiplayerPlayerData[];
  combatLogs: { id: string; text: string; type: 'damage' | 'heal' | 'shield' | 'special' | 'status' }[];
  battleResult: 'ongoing' | 'victory' | 'defeat' | 'p1_victory' | 'p2_victory' | 'p3_victory' | 'p4_victory';
  lastAction?: {
    playerId: PlayerSide;
    playerName: string;
    cardName?: string;
    description: string;
    timestamp: number;
  };
}

export interface OnlineRoom {
  id: string;
  region: string;
  hostUsername: string;
  hostSkillRating: number;
  status: 'lobby' | 'draft' | 'battle' | 'ended';
  isOpenToRandom: boolean; // Rooms stay private until host presses button to open lobby
  slots: [RoomSlot, RoomSlot, RoomSlot];
  banishedSpeciesIds: string[];
  chatMessages: ChatMessage[];
  draftState?: OnlineDraftState;
  combatState?: OnlineCombatState;
  gameState?: any;
  updatedAt: number;
  maxPlayers?: 2 | 3 | 4;
  spectators?: string[];
  spectatorCount?: number;
  connectedUsernames?: string[];
  playerHeartbeats?: Record<string, number>;
}

export interface PendingInvite {
  inviteId: string;
  roomId: string;
  hostUsername: string;
  invitedUsername: string;
  region: string;
  timestamp: number;
}

export interface MatchmakingQueueEntry {
  username: string;
  skillRating: number;
  region: string;
  queuedAt: number;
  lastHeartbeat: number;
  matchedRoomId?: string;
}

export interface ActivePlayerRecord {
  username: string;
  skillRating: number;
  lastActive: number;
}

// Global in-memory storage for Vercel/Node runtime
const globalStore = global as unknown as {
  onlineRooms?: Map<string, OnlineRoom>;
  pendingInvites?: Map<string, PendingInvite>;
  matchmakingQueue?: Map<string, MatchmakingQueueEntry>;
  friendRequests?: Map<string, any>;
  userFriends?: Map<string, Set<string>>;
  activePlayers?: Map<string, ActivePlayerRecord>;
};

if (!globalStore.onlineRooms) {
  globalStore.onlineRooms = new Map();
}
if (!globalStore.pendingInvites) {
  globalStore.pendingInvites = new Map();
}
if (!globalStore.matchmakingQueue) {
  globalStore.matchmakingQueue = new Map();
}
if (!globalStore.friendRequests) {
  globalStore.friendRequests = new Map();
}
if (!globalStore.userFriends) {
  globalStore.userFriends = new Map();
}
if (!globalStore.activePlayers) {
  globalStore.activePlayers = new Map();
}

const rooms = globalStore.onlineRooms;
const invites = globalStore.pendingInvites;
const queue = globalStore.matchmakingQueue;
const friendRequestsMap = globalStore.friendRequests;
const userFriendsMap = globalStore.userFriends;
const activePlayersMap = globalStore.activePlayers;

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function recordActivePlayer(username: string, skillRating?: number) {
  const clean = (username || '').trim();
  if (!clean) return;
  const key = clean.toLowerCase();
  const existing = activePlayersMap.get(key);
  activePlayersMap.set(key, {
    username: existing?.username || clean,
    skillRating: skillRating && skillRating > 0 ? skillRating : (existing?.skillRating || 1200),
    lastActive: Date.now(),
  });
}

// Helper to immediately garbage collect an ended or destroyed room
function garbageCollectRoom(roomId: string) {
  rooms.delete(roomId);
  invites.forEach((inv, id) => {
    if (inv.roomId === roomId) {
      invites.delete(id);
    }
  });
}

// Helper to cleanup stale rooms (older than 2 hours or ended > 3 minutes)
function cleanupStale() {
  const now = Date.now();
  rooms.forEach((room, id) => {
    if (
      (room.status === 'ended' && now - room.updatedAt > 3 * 60 * 1000) ||
      now - room.updatedAt > 2 * 60 * 60 * 1000
    ) {
      garbageCollectRoom(id);
    }
  });
  invites.forEach((inv, id) => {
    if (now - inv.timestamp > 15 * 60 * 1000) {
      invites.delete(id);
    }
  });
  // Cleanup dead queue entries (older than 45 seconds without heartbeat)
  queue.forEach((entry, uName) => {
    if (now - entry.lastHeartbeat > 45 * 1000) {
      queue.delete(uName);
    }
  });
}

// Authoritative Matchmaking: Evaluates queue, checks MMR within 500, launches 4-player or timeout match
function tryMatchmakeQueue(): OnlineRoom | null {
  const now = Date.now();
  const activeEntries = Array.from(queue.values()).filter(
    (e) => !e.matchedRoomId && now - e.lastHeartbeat <= 45000
  );

  for (let i = 0; i < activeEntries.length; i++) {
    const primary = activeEntries[i];
    const compatible = activeEntries.filter(
      (other) =>
        (other.region === primary.region || other.region === 'global' || primary.region === 'global') &&
        Math.abs(other.skillRating - primary.skillRating) <= 500
    );

    // Rule 1: If 4 players match MMR window, immediately create 4-player game!
    if (compatible.length >= 4) {
      const matchGroup = compatible.slice(0, 4);
      const hostIdx = Math.floor(Math.random() * 4);
      const host = matchGroup[hostIdx];
      const otherPlayers = matchGroup.filter((_, idx) => idx !== hostIdx);

      const roomId = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRoom: OnlineRoom = {
        id: roomId,
        region: host.region,
        hostUsername: host.username,
        hostSkillRating: host.skillRating,
        status: 'lobby',
        isOpenToRandom: true,
        maxPlayers: 4,
        slots: [
          {
            slotIndex: 1,
            type: otherPlayers[0] ? 'random' : 'none',
            player: otherPlayers[0]
              ? {
                  username: otherPlayers[0].username,
                  skillRating: otherPlayers[0].skillRating,
                  isBot: false,
                  ready: true,
                }
              : undefined,
          },
          {
            slotIndex: 2,
            type: otherPlayers[1] ? 'random' : 'none',
            player: otherPlayers[1]
              ? {
                  username: otherPlayers[1].username,
                  skillRating: otherPlayers[1].skillRating,
                  isBot: false,
                  ready: true,
                }
              : undefined,
          },
          {
            slotIndex: 3,
            type: otherPlayers[2] ? 'random' : 'none',
            player: otherPlayers[2]
              ? {
                  username: otherPlayers[2].username,
                  skillRating: otherPlayers[2].skillRating,
                  isBot: false,
                  ready: true,
                }
              : undefined,
          },
        ],
        banishedSpeciesIds: [],
        chatMessages: [],
        updatedAt: Date.now(),
        spectators: [],
        spectatorCount: 0,
      };

      rooms.set(roomId, newRoom);
      matchGroup.forEach((p) => {
        const qEntry = queue.get(p.username.toLowerCase());
        if (qEntry) qEntry.matchedRoomId = roomId;
      });

      return newRoom;
    }

    // Rule 2: If 2 or 3 players match AND oldest has waited >= 20 seconds, launch match!
    const oldestWaitMs = Math.max(...compatible.map((p) => now - p.queuedAt));
    if (compatible.length >= 2 && oldestWaitMs >= 20000) {
      const matchGroup = compatible.slice(0, Math.min(4, compatible.length));
      const hostIdx = Math.floor(Math.random() * matchGroup.length);
      const host = matchGroup[hostIdx];
      const otherPlayers = matchGroup.filter((_, idx) => idx !== hostIdx);

      const roomId = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRoom: OnlineRoom = {
        id: roomId,
        region: host.region,
        hostUsername: host.username,
        hostSkillRating: host.skillRating,
        status: 'lobby',
        isOpenToRandom: true,
        maxPlayers: matchGroup.length as any,
        slots: [
          {
            slotIndex: 1,
            type: otherPlayers[0] ? 'random' : 'none',
            player: otherPlayers[0]
              ? {
                  username: otherPlayers[0].username,
                  skillRating: otherPlayers[0].skillRating,
                  isBot: false,
                  ready: true,
                }
              : undefined,
          },
          {
            slotIndex: 2,
            type: otherPlayers[1] ? 'random' : 'none',
            player: otherPlayers[1]
              ? {
                  username: otherPlayers[1].username,
                  skillRating: otherPlayers[1].skillRating,
                  isBot: false,
                  ready: true,
                }
              : undefined,
          },
          {
            slotIndex: 3,
            type: otherPlayers[2] ? 'random' : 'none',
            player: otherPlayers[2]
              ? {
                  username: otherPlayers[2].username,
                  skillRating: otherPlayers[2].skillRating,
                  isBot: false,
                  ready: true,
                }
              : undefined,
          },
        ],
        banishedSpeciesIds: [],
        chatMessages: [],
        updatedAt: Date.now(),
        spectators: [],
        spectatorCount: 0,
      };

      rooms.set(roomId, newRoom);
      matchGroup.forEach((p) => {
        const qEntry = queue.get(p.username.toLowerCase());
        if (qEntry) qEntry.matchedRoomId = roomId;
      });

      return newRoom;
    }
  }

  return null;
}

// Helper to detect if a player is in multiple games and clean them up
function cleanupUserFromOtherRooms(username: string, exceptRoomId?: string): number {
  if (!username) return 0;
  const target = username.trim().toLowerCase();
  let cleanedCount = 0;

  rooms.forEach((room, rId) => {
    if (exceptRoomId && rId === exceptRoomId) return;

    let modified = false;

    // 1. Host of another room: close that room if not already ended
    if (room.hostUsername && room.hostUsername.trim().toLowerCase() === target) {
      if (room.status !== 'ended') {
        room.status = 'ended';
        room.updatedAt = Date.now();
        modified = true;
        cleanedCount++;
      }
    }

    // 2. Occupying a slot in another room
    room.slots.forEach((slot) => {
      if (slot.player?.username && slot.player.username.trim().toLowerCase() === target) {
        slot.player = undefined;
        if (slot.type === 'invite') {
          slot.type = 'none';
          slot.invitedUsername = undefined;
        }
        room.updatedAt = Date.now();
        modified = true;
        cleanedCount++;
      }
    });

    // 3. In spectators list
    if (room.spectators && room.spectators.some((s) => s.trim().toLowerCase() === target)) {
      room.spectators = room.spectators.filter((s) => s.trim().toLowerCase() !== target);
      room.spectatorCount = room.spectators.length;
      room.updatedAt = Date.now();
      modified = true;
    }

    // 4. In active draft
    if (room.draftState && room.draftState.playerNames) {
      const idx = room.draftState.playerNames.findIndex((n) => n.trim().toLowerCase() === target);
      if (idx !== -1 && !room.draftState.isFinished && room.status !== 'ended') {
        room.status = 'ended';
        room.draftState.isFinished = true;
        room.updatedAt = Date.now();
        modified = true;
        cleanedCount++;
      }
    }

    // 5. In active combat
    if (room.combatState && room.combatState.players) {
      const p = room.combatState.players.find((pl) => pl.name.trim().toLowerCase() === target);
      if (p && !p.isEliminated && room.combatState.battleResult === 'ongoing') {
        p.isEliminated = true;
        p.team.forEach((s) => {
          s.currentHp = 0;
          s.isUnstuffed = true;
        });
        const alive = room.combatState.players.filter((pl) => !pl.isEliminated);
        if (alive.length <= 1) {
          room.status = 'ended';
          room.combatState.battleResult = alive.length === 1 ? (`${alive[0].id}_victory` as any) : 'defeat';
        }
        room.updatedAt = Date.now();
        modified = true;
        cleanedCount++;
      }
    }

    if (modified) {
      rooms.set(rId, room);
    }
  });

  // Clean up any pending invites sent by or to this user
  invites.forEach((inv, invId) => {
    if (
      inv.hostUsername.trim().toLowerCase() === target ||
      inv.invitedUsername.trim().toLowerCase() === target
    ) {
      invites.delete(invId);
    }
  });

  return cleanedCount;
}

export async function POST(req: NextRequest) {
  try {
    cleanupStale();
    const body = await req.json();
    const { action } = body;

    // 1. CREATE ROOM
    if (action === 'create_room') {
      const { hostUsername, hostSkillRating = 1000, region = 'us-east' } = body;
      if (hostUsername) {
        cleanupUserFromOtherRooms(hostUsername);
      }
      const roomId = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;

      const newRoom: OnlineRoom = {
        id: roomId,
        region,
        hostUsername: hostUsername || 'Player',
        hostSkillRating,
        status: 'lobby',
        isOpenToRandom: false, // Private by default until owner opens lobby!
        slots: [
          { slotIndex: 1, type: 'none', player: undefined },
          { slotIndex: 2, type: 'none', player: undefined },
          { slotIndex: 3, type: 'none', player: undefined },
        ],
        banishedSpeciesIds: [],
        chatMessages: [],
        updatedAt: Date.now(),
        maxPlayers: 2,
        spectators: [],
        spectatorCount: 0,
      };

      rooms.set(roomId, newRoom);
      return NextResponse.json({ success: true, room: newRoom });
    }

    // 2. GET ROOM
    if (action === 'get_room') {
      const { roomId, username } = body;
      const room = rooms.get(roomId);
      if (!room) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      }
      if (username) {
        if (!room.playerHeartbeats) room.playerHeartbeats = {};
        room.playerHeartbeats[username.trim().toLowerCase()] = Date.now();
      }
      return NextResponse.json({ success: true, room });
    }

    // 3. ROTATE SLOT (Owner only: None -> Invite -> Random human -> Bot -> None)
    if (action === 'rotate_slot') {
      const { roomId, slotIndex, requesterUsername, targetType } = body;
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });

      const isMatch = !requesterUsername || !room.hostUsername || room.hostUsername.trim().toLowerCase() === requesterUsername.trim().toLowerCase() || room.hostUsername === 'Player' || requesterUsername === 'Player';
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Only the room owner can change slots' }, { status: 403 });
      }

      const slot = room.slots[slotIndex];
      if (!slot) return NextResponse.json({ success: false, error: 'Invalid slot' }, { status: 400 });

      let nextType: SlotType;
      const cycle: SlotType[] = ['none', 'invite', 'random', 'bot'];
      if (targetType && cycle.includes(targetType as SlotType)) {
        nextType = targetType as SlotType;
      } else {
        const nextTypeIdx = (cycle.indexOf(slot.type) + 1) % cycle.length;
        nextType = cycle[nextTypeIdx];
      }

      slot.type = nextType;
      slot.invitedUsername = undefined;

      if (nextType === 'bot') {
        const botNames = ['Bot Stuffy', 'Bot Cotton', 'Bot Button', 'Bot Fluffy', 'Bot Patch'];
        slot.player = {
          username: botNames[slotIndex] || `Bot ${slotIndex + 1}`,
          skillRating: room.hostSkillRating,
          isBot: true,
          ready: true,
        };
      } else {
        slot.player = undefined;
      }

      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // 4. SEND INVITE (Owner types username)
    if (action === 'send_invite') {
      const { roomId, slotIndex, targetUsername, requesterUsername } = body;
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });

      const isMatch = !requesterUsername || !room.hostUsername || room.hostUsername.trim().toLowerCase() === requesterUsername.trim().toLowerCase() || room.hostUsername === 'Player';
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Only room owner can invite' }, { status: 403 });
      }

      const slot = room.slots[slotIndex];
      if (!slot) return NextResponse.json({ success: false, error: 'Invalid slot' }, { status: 400 });

      slot.type = 'invite';
      slot.invitedUsername = targetUsername;
      slot.player = undefined;

      const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const pending: PendingInvite = {
        inviteId,
        roomId,
        hostUsername: room.hostUsername,
        invitedUsername: targetUsername,
        region: room.region,
        timestamp: Date.now(),
      };
      invites.set(inviteId, pending);

      room.updatedAt = Date.now();
      return NextResponse.json({ success: true, room, invite: pending });
    }

    // 5. CHECK INVITES FOR CURRENT USER
    if (action === 'check_invites') {
      const { username } = body;
      const userInvites: PendingInvite[] = [];
      invites.forEach((inv, invId) => {
        if (inv.invitedUsername.toLowerCase() === username.toLowerCase()) {
          // Verify room still exists and has pending invite
          const r = rooms.get(inv.roomId);
          if (r && r.status === 'lobby') {
            userInvites.push(inv);
          } else {
            invites.delete(invId);
          }
        }
      });
      return NextResponse.json({ success: true, invites: userInvites });
    }

    // 6. RESPOND TO INVITE (Accept / Decline)
    if (action === 'respond_invite') {
      const { inviteId, accept, username, skillRating = 1000 } = body;
      const inv = invites.get(inviteId);
      if (!inv) return NextResponse.json({ success: false, error: 'Invite expired or not found' });

      invites.delete(inviteId);
      const room = rooms.get(inv.roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room no longer exists' });

      if (accept) {
        if (username) {
          cleanupUserFromOtherRooms(username, inv.roomId);
        }
        // Find the slot reserved for this invite, or any available slot
        let targetSlot = room.slots.find((s) => s.type === 'invite' && s.invitedUsername?.toLowerCase() === username.toLowerCase());
        if (!targetSlot) {
          targetSlot = room.slots.find((s) => s.type !== 'none' && !s.player);
        }

        if (targetSlot) {
          targetSlot.player = {
            username,
            skillRating,
            isBot: false,
            ready: true,
          };
          room.updatedAt = Date.now();
          return NextResponse.json({ success: true, joined: true, room });
        } else {
          return NextResponse.json({ success: false, error: 'Room slots are now full' });
        }
      } else {
        room.updatedAt = Date.now();
        return NextResponse.json({ success: true, joined: false });
      }
    }

    // 7. MATCHMAKING QUEUE (Skill Rating Matching by Region, MMR ±500, up to 4 players)
    if (action === 'queue_match' || action === 'enqueue_match') {
      const { username, skillRating = 1000, region = 'us-east' } = body;
      const cleanUser = (username || 'Player').trim();
      const userKey = cleanUser.toLowerCase();

      cleanupUserFromOtherRooms(cleanUser);

      // Add to or update queue
      const existing = queue.get(userKey);
      const now = Date.now();
      const entry: MatchmakingQueueEntry = {
        username: cleanUser,
        skillRating,
        region,
        queuedAt: existing ? existing.queuedAt : now,
        lastHeartbeat: now,
      };
      queue.set(userKey, entry);

      // Check if an existing open public room is waiting for players
      const openPublicRooms = Array.from(rooms.values()).filter(
        (r) =>
          r.status === 'lobby' &&
          r.isOpenToRandom &&
          (r.region === region || region === 'global' || r.region === 'global') &&
          Math.abs(r.hostSkillRating - skillRating) <= 500 &&
          r.slots.some((s) => !s.player)
      );

      if (openPublicRooms.length > 0) {
        const bestRoom = openPublicRooms[0];
        const slot = bestRoom.slots.find((s) => !s.player);
        if (slot) {
          slot.type = 'random';
          slot.player = {
            username: cleanUser,
            skillRating,
            isBot: false,
            ready: true,
          };
          bestRoom.updatedAt = Date.now();
          queue.delete(userKey);
          return NextResponse.json({ success: true, matched: true, room: bestRoom });
        }
      }

      // Try forming a match from queued players
      const matchedRoom = tryMatchmakeQueue();
      if (matchedRoom) {
        const qEntry = queue.get(userKey);
        if (qEntry?.matchedRoomId === matchedRoom.id) {
          queue.delete(userKey);
          return NextResponse.json({ success: true, matched: true, room: matchedRoom });
        }
      }

      // If this user was already paired by another player's trigger
      const currentEntry = queue.get(userKey);
      if (currentEntry?.matchedRoomId) {
        const r = rooms.get(currentEntry.matchedRoomId);
        if (r) {
          queue.delete(userKey);
          return NextResponse.json({ success: true, matched: true, room: r });
        }
      }

      const activeQueued = Array.from(queue.values()).filter(
        (e) =>
          (e.region === region || region === 'global' || e.region === 'global') &&
          Math.abs(e.skillRating - skillRating) <= 500
      );

      return NextResponse.json({
        success: true,
        matched: false,
        queuedAt: entry.queuedAt,
        queueCount: activeQueued.length,
      });
    }

    // 8. POLL MATCHMAKING QUEUE
    if (action === 'poll_match_queue') {
      const { username, skillRating = 1000, region = 'us-east' } = body;
      const cleanUser = (username || 'Player').trim();
      const userKey = cleanUser.toLowerCase();
      const entry = queue.get(userKey);

      if (!entry) {
        return NextResponse.json({ success: true, matched: false, queueCount: 0 });
      }

      entry.lastHeartbeat = Date.now();

      // Check if already matched
      if (entry.matchedRoomId) {
        const r = rooms.get(entry.matchedRoomId);
        if (r) {
          queue.delete(userKey);
          return NextResponse.json({ success: true, matched: true, room: r });
        }
      }

      // Run matchmaker evaluation
      const matchedRoom = tryMatchmakeQueue();
      if (matchedRoom) {
        const qEntry = queue.get(userKey);
        if (qEntry?.matchedRoomId === matchedRoom.id) {
          queue.delete(userKey);
          return NextResponse.json({ success: true, matched: true, room: matchedRoom });
        }
      }

      const activeQueued = Array.from(queue.values()).filter(
        (e) =>
          (e.region === entry.region || entry.region === 'global' || e.region === 'global') &&
          Math.abs(e.skillRating - entry.skillRating) <= 500
      );

      return NextResponse.json({
        success: true,
        matched: false,
        queuedAt: entry.queuedAt,
        queueCount: activeQueued.length,
      });
    }

    // 9. LEAVE MATCHMAKING QUEUE
    if (action === 'leave_match_queue') {
      const { username } = body;
      if (username) {
        queue.delete(username.trim().toLowerCase());
      }
      return NextResponse.json({ success: true });
    }

    // 10. JOIN ROOM BY CODE
    if (action === 'join_room_by_code' || action === 'join_room') {
      const { roomId, username, skillRating = 1000 } = body;
      if (!roomId) return NextResponse.json({ success: false, error: 'Room code required' }, { status: 400 });
      const targetRoomId = roomId.trim().toUpperCase();
      const room = rooms.get(targetRoomId);
      if (!room) {
        return NextResponse.json(
          { success: false, error: `Room "${targetRoomId}" was not found. Please verify the room code.` },
          { status: 404 }
        );
      }

      if (room.status !== 'lobby') {
        return NextResponse.json({
          success: false,
          error: `Room ${targetRoomId} has already started (${room.status}).`,
          isStarted: true,
          room,
        });
      }

      const cleanUser = (username || 'Player').trim();
      cleanupUserFromOtherRooms(cleanUser, targetRoomId);

      // Check if user is already host
      if (room.hostUsername.trim().toLowerCase() === cleanUser.toLowerCase()) {
        return NextResponse.json({ success: true, room, joined: true });
      }

      // Check if user is already in a slot
      const existingSlot = room.slots.find(
        (s) => s.player && s.player.username.trim().toLowerCase() === cleanUser.toLowerCase()
      );
      if (existingSlot) {
        return NextResponse.json({ success: true, room, joined: true });
      }

      // Find an open slot
      let openSlot = room.slots.find((s) => !s.player);
      if (!openSlot && room.slots.length < (room.maxPlayers || 4)) {
        openSlot = {
          slotIndex: room.slots.length + 1,
          type: 'random',
          player: undefined,
        };
        room.slots.push(openSlot);
      }

      if (openSlot) {
        openSlot.type = 'random';
        openSlot.player = {
          username: cleanUser,
          skillRating,
          isBot: false,
          ready: true,
        };
        room.updatedAt = Date.now();
        rooms.set(targetRoomId, room);
        return NextResponse.json({ success: true, joined: true, room });
      } else {
        return NextResponse.json({ success: false, error: `Room ${targetRoomId} is currently full.` });
      }
    }

    // 11. LIST OPEN PUBLIC ROOMS
    if (action === 'list_open_rooms') {
      const openRooms = Array.from(rooms.values())
        .filter((r) => r.status === 'lobby')
        .map((r) => ({
          id: r.id,
          hostUsername: r.hostUsername,
          hostSkillRating: r.hostSkillRating,
          region: r.region,
          playerCount: 1 + r.slots.filter((s) => s.player).length,
          maxPlayers: r.maxPlayers || 2,
          isOpenToRandom: r.isOpenToRandom,
          updatedAt: r.updatedAt,
        }));
      return NextResponse.json({ success: true, rooms: openRooms });
    }

    // TOGGLE MAX PLAYERS (Owner only: 2 -> 3 -> 4 -> 2)
    if (action === 'toggle_max_players') {
      const { roomId, requesterUsername, maxPlayers } = body;
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      const isMatch = !requesterUsername || !room.hostUsername || room.hostUsername.trim().toLowerCase() === requesterUsername.trim().toLowerCase() || room.hostUsername === 'Player' || requesterUsername === 'Player';
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Only the room owner can change battle size' }, { status: 403 });
      }

      const currentMax = room.maxPlayers || 2;
      let nextMax: 2 | 3 | 4;
      if (maxPlayers && [2, 3, 4].includes(maxPlayers)) {
        nextMax = maxPlayers as 2 | 3 | 4;
      } else {
        nextMax = currentMax === 2 ? 3 : currentMax === 3 ? 4 : 2;
      }
      room.maxPlayers = nextMax;
      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // JOIN AS SPECTATOR (From main menu or link)
    if (action === 'join_spectator') {
      const { roomId, username = 'Spectator' } = body;
      if (username && username !== 'Spectator') {
        cleanupUserFromOtherRooms(username, roomId);
      }
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });

      if (!room.spectators) room.spectators = [];
      if (!room.spectators.includes(username)) {
        room.spectators.push(username);
      }
      room.spectatorCount = room.spectators.length;
      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room, isSpectator: true });
    }

    // TOGGLE PRIVACY / OPEN TO RANDOM HUMANS (Owner only)
    if (action === 'toggle_open_to_random') {
      const { roomId, isOpenToRandom, requesterUsername } = body;
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      const isMatch = !requesterUsername || !room.hostUsername || room.hostUsername.trim().toLowerCase() === requesterUsername.trim().toLowerCase() || room.hostUsername === 'Player' || requesterUsername === 'Player';
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Only the room owner can change privacy settings' }, { status: 403 });
      }

      room.isOpenToRandom = isOpenToRandom !== undefined ? Boolean(isOpenToRandom) : !room.isOpenToRandom;
      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // 8. UPDATE BANISHED STUFFIES (Owner ONLY!)
    if (action === 'update_banish') {
      const { roomId, speciesId, banish, requesterUsername } = body;
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      const isMatch = !requesterUsername || !room.hostUsername || room.hostUsername.trim().toLowerCase() === requesterUsername.trim().toLowerCase() || room.hostUsername === 'Player' || requesterUsername === 'Player';
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Only the room owner can change banished stuffies' }, { status: 403 });
      }

      const current = new Set(room.banishedSpeciesIds);
      if (banish) {
        current.add(speciesId);
      } else {
        current.delete(speciesId);
      }
      room.banishedSpeciesIds = Array.from(current);
      room.updatedAt = Date.now();
      return NextResponse.json({ success: true, room });
    }

    // 9. SEND CHAT MESSAGE
    if (action === 'send_chat') {
      const { roomId, sender, text } = body;
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });

      const cleanText = filterProfanity(text || '');

      const msg: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        sender,
        text: cleanText,
        timestamp: Date.now(),
      };
      room.chatMessages.push(msg);
      if (room.chatMessages.length > 50) {
        room.chatMessages = room.chatMessages.slice(-50);
      }
      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, message: msg, room });
    }

// Helper: Construct Authoritative Combat State from Draft State
const buildCombatStateFromDraft = (room: OnlineRoom): OnlineCombatState => {
  const dState = room.draftState!;
  const playerConfigs: { id: PlayerSide; color: string }[] = [
    { id: 'p1', color: 'emerald' },
    { id: 'p2', color: 'blue' },
    { id: 'p3', color: 'purple' },
    { id: 'p4', color: 'amber' },
  ];

  const players: MultiplayerPlayerData[] = dState.playerNames.map((name, idx) => {
    const pId = dState.playerIds[idx] || (playerConfigs[idx]?.id || 'p1');
    const pDraft = dState.drafts[idx] || [];

    const team: StuffyState[] = pDraft.map((d, sIdx) => {
      const species = STUFFY_MAP.get(d.speciesId) || PLAYABLE_STUFFIES[0];
      return {
        instanceId: `${pId}_${d.speciesId}_${sIdx}`,
        speciesId: d.speciesId,
        name: species.name,
        maxHp: species.baseHp,
        currentHp: species.baseHp,
        shield: 0,
        isUnstuffed: false,
        statusEffects: [],
        selectedLoadoutId: d.loadoutId,
      };
    });

    const deck: Card[] = [];
    pDraft.forEach((d) => {
      const loadouts = getLoadoutsForStuffy(d.speciesId);
      const chosen = loadouts.find((l) => l.id === d.loadoutId) || loadouts[0];
      chosen?.cardIds.forEach((cId) => {
        const c = CARD_MAP.get(cId);
        if (c) deck.push({ ...c });
      });
    });

    PLAYER_POWERUP_CARDS.forEach((card) => {
      deck.push({ ...card });
    });

    deck.sort(() => Math.random() - 0.5);
    const hand = deck.splice(0, 5);
    const isBot = name.toLowerCase().startsWith('bot ') || name.toLowerCase().includes('bot');

    return {
      id: pId,
      name,
      color: playerConfigs[idx]?.color || 'emerald',
      team,
      bench: [],
      deck,
      hand,
      discard: [],
      isEliminated: false,
      isBot,
    };
  });

  return {
    actionSeq: 1,
    turnNumber: 1,
    activeSide: 'p1',
    currentCrackers: 7,
    maxCrackers: 7,
    players,
    combatLogs: [
      {
        id: `log_init_${Date.now()}`,
        text: `⚔️ BATTLE COMMENCED! ${dState.playerNames[0]} takes the first turn!`,
        type: 'special',
      },
    ],
    battleResult: 'ongoing',
  };
}

    // 10. SYNC GAME ACTION (Draft pick / Card play / Start game)
    if (action === 'sync_game_action') {
      const { roomId, newStatus, gameState } = body;
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });

      if (newStatus) room.status = newStatus;
      if (gameState) room.gameState = gameState;
      room.updatedAt = Date.now();
      return NextResponse.json({ success: true, room });
    }

    // 11. START DRAFT (Authoritative initialization)
    if (action === 'start_draft') {
      const { roomId, requesterUsername } = body;
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });

      const maxActive = (room.maxPlayers || 2) - 1;
      const activeSlots = room.slots.slice(0, maxActive).filter((s) => s.type !== 'none' && s.player);
      const playerNames = [room.hostUsername, ...activeSlots.map((s) => s.player!.username)];
      const playerIds: PlayerSide[] = (['p1', 'p2', 'p3', 'p4'].slice(0, playerNames.length)) as PlayerSide[];
      const targetPerPlayer = 5; // Now with 21 stuffies, 2, 3, and 4 player modes draft 5 stuffies each!
      const banished = [...(room.banishedSpeciesIds || [])];
      const availableSpeciesIds = PLAYABLE_STUFFIES.map((s) => s.id).filter((id) => !banished.includes(id));

      room.draftState = {
        playerCount: playerNames.length,
        playerNames,
        playerIds,
        targetPerPlayer,
        currentPlayerIdx: 0,
        currentPlayerId: 'p1',
        drafts: { 0: [], 1: [], 2: [], 3: [] },
        availableSpeciesIds,
        banishedSpeciesIds: banished,
        pickHistory: [],
        isFinished: false,
      };
      room.status = 'draft';
      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // 12. DRAFT PICK (Authoritative single pick)
    if (action === 'draft_pick') {
      const { roomId, playerIdx, username, speciesId, loadoutId } = body;
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      if (!room.draftState) return NextResponse.json({ success: false, error: 'Draft not active' }, { status: 400 });

      const dState = room.draftState;
      if (dState.currentPlayerIdx !== playerIdx) {
        return NextResponse.json({ success: false, error: 'Not your turn to draft' }, { status: 403 });
      }

      if (!dState.availableSpeciesIds.includes(speciesId)) {
        return NextResponse.json({ success: false, error: 'Species already drafted or unavailable' }, { status: 400 });
      }

      if (!dState.drafts[playerIdx]) dState.drafts[playerIdx] = [];
      dState.drafts[playerIdx].push({ speciesId, loadoutId });
      dState.availableSpeciesIds = dState.availableSpeciesIds.filter((id) => id !== speciesId);

      const sp = STUFFY_MAP.get(speciesId);
      const pName = dState.playerNames[playerIdx] || username || `Player ${playerIdx + 1}`;
      dState.pickHistory.push({
        playerId: dState.playerIds[playerIdx],
        playerIdx,
        playerName: pName,
        speciesId,
        loadoutId,
        timestamp: Date.now(),
      });

      const allFinished = dState.playerNames.every((_, idx) => (dState.drafts[idx]?.length || 0) >= dState.targetPerPlayer);
      if (allFinished) {
        dState.isFinished = true;
        room.status = 'battle';
        room.combatState = buildCombatStateFromDraft(room);
      } else {
        let nextIdx = (dState.currentPlayerIdx + 1) % dState.playerCount;
        let loops = 0;
        while (loops < dState.playerCount) {
          if ((dState.drafts[nextIdx]?.length || 0) < dState.targetPerPlayer) {
            break;
          }
          nextIdx = (nextIdx + 1) % dState.playerCount;
          loops++;
        }
        dState.currentPlayerIdx = nextIdx;
        dState.currentPlayerId = dState.playerIds[nextIdx] || 'p1';
      }

      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // 13. DRAFT RANDOM FILL (Authoritative remaining slots for current player)
    if (action === 'draft_random_fill') {
      const { roomId, playerIdx, username } = body;
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      if (!room.draftState) return NextResponse.json({ success: false, error: 'Draft not active' }, { status: 400 });

      const dState = room.draftState;
      if (dState.currentPlayerIdx !== playerIdx) {
        return NextResponse.json({ success: false, error: 'Not your turn to draft' }, { status: 403 });
      }

      const pName = dState.playerNames[playerIdx] || username || `Player ${playerIdx + 1}`;
      if (!dState.drafts[playerIdx]) dState.drafts[playerIdx] = [];

      const remainingNeeded = dState.targetPerPlayer - dState.drafts[playerIdx].length;
      for (let i = 0; i < remainingNeeded && dState.availableSpeciesIds.length > 0; i++) {
        const randIdx = Math.floor(Math.random() * dState.availableSpeciesIds.length);
        const speciesId = dState.availableSpeciesIds.splice(randIdx, 1)[0];
        const loadouts = getLoadoutsForStuffy(speciesId);
        const loadoutId = loadouts[Math.floor(Math.random() * loadouts.length)]?.id || loadouts[0].id;
        dState.drafts[playerIdx].push({ speciesId, loadoutId });
        dState.pickHistory.push({
          playerId: dState.playerIds[playerIdx],
          playerIdx,
          playerName: pName,
          speciesId,
          loadoutId,
          timestamp: Date.now(),
        });
      }

      const allFinished = dState.playerNames.every((_, idx) => (dState.drafts[idx]?.length || 0) >= dState.targetPerPlayer);
      if (allFinished) {
        dState.isFinished = true;
        room.status = 'battle';
        room.combatState = buildCombatStateFromDraft(room);
      } else {
        let nextIdx = (dState.currentPlayerIdx + 1) % dState.playerCount;
        let loops = 0;
        while (loops < dState.playerCount) {
          if ((dState.drafts[nextIdx]?.length || 0) < dState.targetPerPlayer) {
            break;
          }
          nextIdx = (nextIdx + 1) % dState.playerCount;
          loops++;
        }
        dState.currentPlayerIdx = nextIdx;
        dState.currentPlayerId = dState.playerIds[nextIdx] || 'p1';
      }

      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // 14. COMBAT PLAY CARD (Authoritative Card Play)
    if (action === 'combat_play_card') {
      const { roomId, playerId, cardIndex, targetId } = body;
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      if (!room.combatState) return NextResponse.json({ success: false, error: 'Battle not active' }, { status: 400 });

      const cState = room.combatState;
      if (cState.activeSide !== playerId) {
        return NextResponse.json({ success: false, error: 'Not your turn in combat' }, { status: 403 });
      }

      const actingPlayer = cState.players.find((p) => p.id === playerId);
      if (!actingPlayer) return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });

      if (cardIndex < 0 || cardIndex >= actingPlayer.hand.length) {
        return NextResponse.json({ success: false, error: 'Card index out of bounds' }, { status: 400 });
      }

      const card = actingPlayer.hand[cardIndex];
      if (card.cost > cState.currentCrackers) {
        return NextResponse.json({ success: false, error: 'Not enough Crackers' }, { status: 400 });
      }

      // Deduct Crackers & discard card
      cState.currentCrackers -= card.cost;
      actingPlayer.hand.splice(cardIndex, 1);
      actingPlayer.discard.push(card);

      // Apply card effects
      let allTargets: StuffyState[] = [];
      cState.players.forEach((p) => allTargets.push(...p.team));

      if (targetId) {
        const targetStuffy = allTargets.find((s) => s.instanceId === targetId);
        if (targetStuffy) {
          if (card.damage && card.damage > 0) {
            const dmg = card.damage;
            const absorbed = Math.min(targetStuffy.shield, dmg);
            targetStuffy.shield -= absorbed;
            const remaining = dmg - absorbed;
            targetStuffy.currentHp = Math.max(0, targetStuffy.currentHp - remaining);
            if (targetStuffy.currentHp === 0) {
              targetStuffy.isUnstuffed = true;
            }
          }
          if (card.heal && card.heal > 0) {
            targetStuffy.currentHp = Math.min(targetStuffy.maxHp, targetStuffy.currentHp + card.heal);
          }
          if (card.block && card.block > 0) {
            targetStuffy.shield += card.block;
          }
        }
      } else if (card.target === 'all_enemies') {
        const opposingTeams = cState.players.filter((p) => p.id !== playerId);
        opposingTeams.forEach((p) => {
          p.team.forEach((s) => {
            if (!s.isUnstuffed && card.damage) {
              const absorbed = Math.min(s.shield, card.damage);
              s.shield -= absorbed;
              const remaining = card.damage - absorbed;
              s.currentHp = Math.max(0, s.currentHp - remaining);
              if (s.currentHp === 0) s.isUnstuffed = true;
            }
          });
        });
      } else if (card.target === 'all_allies') {
        actingPlayer.team.forEach((s) => {
          if (!s.isUnstuffed) {
            if (card.block) s.shield += card.block;
            if (card.heal) s.currentHp = Math.min(s.maxHp, s.currentHp + card.heal);
          }
        });
      }

      // Check eliminations & victory
      cState.players.forEach((p) => {
        p.isEliminated = p.team.every((s) => s.isUnstuffed || s.currentHp <= 0);
      });
      const alivePlayers = cState.players.filter((p) => !p.isEliminated);
      if (alivePlayers.length === 1) {
        cState.battleResult = `${alivePlayers[0].id}_victory` as any;
        cState.combatLogs.push({
          id: `log_win_${Date.now()}`,
          text: `🏆 ${alivePlayers[0].name} WINS THE MATCH!`,
          type: 'special',
        });
      } else if (alivePlayers.length === 0) {
        cState.battleResult = 'defeat';
      }

      cState.combatLogs.push({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 4)}`,
        text: `${actingPlayer.name} played "${card.name}"!`,
        type: card.type === 'attack' ? 'damage' : card.type === 'heal' ? 'heal' : 'shield',
      });
      cState.actionSeq = (cState.actionSeq || 1) + 1;

      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // 15. COMBAT END TURN (Authoritative End Turn & Draw)
    if (action === 'combat_end_turn') {
      const { roomId, playerId } = body;
      const room = rooms.get(roomId);
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      if (!room.combatState) return NextResponse.json({ success: false, error: 'Battle not active' }, { status: 400 });

      const cState = room.combatState;
      if (cState.activeSide !== playerId) {
        return NextResponse.json({ success: false, error: 'Not your turn in combat' }, { status: 403 });
      }

      const currIdx = cState.players.findIndex((p) => p.id === playerId);
      let nextIdx = (currIdx + 1) % cState.players.length;
      let loops = 0;
      while (loops < cState.players.length) {
        if (!cState.players[nextIdx].isEliminated) {
          break;
        }
        nextIdx = (nextIdx + 1) % cState.players.length;
        loops++;
      }

      const nextPlayer = cState.players[nextIdx];
      cState.activeSide = nextPlayer.id;
      cState.currentCrackers = cState.maxCrackers || 7;
      cState.turnNumber++;

      // Draw up to 5 cards for nextPlayer
      while (nextPlayer.hand.length < 5) {
        if (nextPlayer.deck.length === 0) {
          if (nextPlayer.discard.length === 0) break;
          nextPlayer.deck = [...nextPlayer.discard].sort(() => Math.random() - 0.5);
          nextPlayer.discard = [];
        }
        if (nextPlayer.deck.length > 0) {
          nextPlayer.hand.push(nextPlayer.deck.shift()!);
        }
      }

      // Poison Tick on next player
      nextPlayer.team.forEach((s) => {
        if (!s.isUnstuffed) {
          const pEff = s.statusEffects.find((e) => e.type === 'poison');
          if (pEff && pEff.value && pEff.value > 0) {
            s.currentHp = Math.max(0, s.currentHp - pEff.value);
            if (s.currentHp === 0) s.isUnstuffed = true;
          }
        }
      });

      cState.combatLogs.push({
        id: `log_turn_${Date.now()}`,
        text: `--- ${nextPlayer.name}'s Turn (Round ${cState.turnNumber}) ---`,
        type: 'special',
      });
      cState.actionSeq = (cState.actionSeq || 1) + 1;

      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // 16. RECONNECT ROOM (Session recovery after reload)
    if (action === 'reconnect_room') {
      const { roomId, username } = body;
      if (username) {
        cleanupUserFromOtherRooms(username, roomId);
      }
      const room = rooms.get(roomId);
      if (!room || room.status === 'ended') {
        return NextResponse.json({ success: false, error: 'Room ended or not found' }, { status: 404 });
      }

      if (!room.connectedUsernames) room.connectedUsernames = [];
      if (!room.connectedUsernames.includes(username)) {
        room.connectedUsernames.push(username);
      }

      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // 17. LEAVE ROOM (Voluntary exit from a specific room)
    if (action === 'leave_room') {
      const { roomId, username } = body;
      let room = rooms.get(roomId);
      if (room && username) {
        const target = username.trim().toLowerCase();
        if (room.hostUsername.trim().toLowerCase() === target) {
          room.status = 'ended';
        } else {
          room.slots.forEach((s) => {
            if (s.player?.username.trim().toLowerCase() === target) {
              s.player = undefined;
              if (s.type === 'invite') {
                s.type = 'none';
                s.invitedUsername = undefined;
              }
            }
          });
          if (room.spectators) {
            room.spectators = room.spectators.filter((s) => s.trim().toLowerCase() !== target);
            room.spectatorCount = room.spectators.length;
          }
        }
        room.updatedAt = Date.now();
        rooms.set(roomId, room);
      }
      return NextResponse.json({ success: true, room });
    }

    // 18. LEAVE ALL GAMES (Emergency button: scrub player from all games and invites)
    if (action === 'leave_all_games') {
      const { username } = body;
      const cleanedRoomCount = username ? cleanupUserFromOtherRooms(username) : 0;
      return NextResponse.json({ success: true, cleanedRoomCount });
    }

    // 19. RESIGN MATCH (Concede and award victory to opponent)
    if (action === 'resign_match') {
      const { roomId, username } = body;
      let room = rooms.get(roomId);
      if (!room) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      }
      const targetLower = (username || '').trim().toLowerCase();

      // If in draft phase:
      if (room.status === 'draft') {
        room.status = 'ended';
        if (room.draftState) {
          room.draftState.isFinished = true;
        }
      } else if (room.status === 'battle' && room.combatState) {
        // Eliminate resigning player
        const resigningPlayer = room.combatState.players.find(
          (p) => p.name.trim().toLowerCase() === targetLower
        );
        if (resigningPlayer) {
          resigningPlayer.isEliminated = true;
          resigningPlayer.team.forEach((s) => {
            s.currentHp = 0;
            s.isUnstuffed = true;
          });
        }
        const surviving = room.combatState.players.filter((p) => !p.isEliminated);
        if (surviving.length <= 1) {
          room.status = 'ended';
          room.combatState.battleResult = surviving.length === 1 ? (`${surviving[0].id}_victory` as any) : 'defeat';
        }
      } else {
        room.status = 'ended';
      }

      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // 20. FORCE END MATCH (When opponent disconnected or inactive)
    if (action === 'force_end_match') {
      const { roomId, callerUsername, reason } = body;
      let room = rooms.get(roomId);
      if (!room) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      }

      room.status = 'ended';
      if (room.draftState) {
        room.draftState.isFinished = true;
      }
      if (room.combatState) {
        const callerPlayer = room.combatState.players.find(
          (p) => p.name.trim().toLowerCase() === (callerUsername || '').trim().toLowerCase()
        );
        if (callerPlayer) {
          room.combatState.battleResult = `${callerPlayer.id}_victory` as any;
          // Mark all opponents eliminated
          room.combatState.players.forEach((p) => {
            if (p.id !== callerPlayer.id) {
              p.isEliminated = true;
              p.team.forEach((s) => {
                s.currentHp = 0;
                s.isUnstuffed = true;
              });
            }
          });
        }
      }

      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // 21. TERMINATE MATCH (Immediate destroy & server garbage collection)
    if (action === 'terminate_match') {
      const { roomId, username } = body;
      let room = rooms.get(roomId);
      if (room) {
        room.status = 'ended';
        room.updatedAt = Date.now();
        // Immediate server garbage collection
        garbageCollectRoom(roomId);
      }
      return NextResponse.json({ success: true, message: 'Match destroyed and garbage collected' });
    }

    // 22. FRIEND REQUESTS, SOCIAL & REAL PLAYER SYSTEM (NO FAKE USERS)
    if (action === 'record_active_player') {
      const { username, skillRating } = body;
      recordActivePlayer(username, skillRating);
      return NextResponse.json({ success: true });
    }

    if (action === 'get_active_players_year') {
      const now = Date.now();
      const activeList = Array.from(activePlayersMap.values())
        .filter((p) => now - p.lastActive <= ONE_YEAR_MS)
        .sort((a, b) => b.lastActive - a.lastActive);
      return NextResponse.json({ success: true, players: activeList });
    }

    if (action === 'send_friend_request') {
      const { fromUsername, toUsername } = body;
      const cleanFrom = (fromUsername || '').trim();
      const cleanTo = (toUsername || '').trim();
      if (!cleanFrom || !cleanTo) {
        return NextResponse.json({ success: false, error: 'Invalid usernames' }, { status: 400 });
      }
      if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
        return NextResponse.json({ success: false, error: 'Cannot friend yourself' }, { status: 400 });
      }

      recordActivePlayer(cleanFrom);
      recordActivePlayer(cleanTo);

      const reqId = `freq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const req = {
        id: reqId,
        fromUsername: cleanFrom,
        toUsername: cleanTo,
        status: 'pending',
        createdAt: Date.now(),
      };
      friendRequestsMap.set(reqId, req);
      return NextResponse.json({ success: true, request: req });
    }

    if (action === 'get_friend_requests') {
      const { username } = body;
      const targetUser = (username || '').trim().toLowerCase();
      if (username) recordActivePlayer(username);
      const pendingReqs = Array.from(friendRequestsMap.values()).filter(
        (r) => r.toUsername.trim().toLowerCase() === targetUser && r.status === 'pending'
      );
      return NextResponse.json({ success: true, requests: pendingReqs });
    }

    if (action === 'respond_friend_request') {
      const { requestId, accept, username } = body;
      if (username) recordActivePlayer(username);
      const req = friendRequestsMap.get(requestId);
      if (req) {
        req.status = accept ? 'accepted' : 'declined';
        if (accept) {
          const userA = req.fromUsername.trim().toLowerCase();
          const userB = req.toUsername.trim().toLowerCase();
          if (!userFriendsMap.has(userA)) userFriendsMap.set(userA, new Set());
          if (!userFriendsMap.has(userB)) userFriendsMap.set(userB, new Set());
          userFriendsMap.get(userA)!.add(req.toUsername);
          userFriendsMap.get(userB)!.add(req.fromUsername);
        }
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'get_friends') {
      const { username } = body;
      const targetUser = (username || '').trim().toLowerCase();
      if (username) recordActivePlayer(username);
      const friendsSet = userFriendsMap.get(targetUser) || new Set();
      const friendProfiles = Array.from(friendsSet).map((fName) => {
        const record = activePlayersMap.get(fName.toLowerCase());
        const isOnline = record ? Date.now() - record.lastActive < 2 * 60 * 1000 : false;
        return {
          username: fName,
          skillRating: record?.skillRating || 1200,
          status: isOnline ? 'online' : 'offline',
          addedAt: Date.now(),
          lastActive: record?.lastActive || Date.now(),
        };
      });
      return NextResponse.json({ success: true, friends: friendProfiles });
    }

    if (action === 'unfriend') {
      const { username, friendUsername } = body;
      const userA = (username || '').trim().toLowerCase();
      const userB = (friendUsername || '').trim().toLowerCase();
      if (userFriendsMap.has(userA)) {
        const setA = userFriendsMap.get(userA)!;
        for (const item of Array.from(setA)) {
          if (item.toLowerCase() === userB) setA.delete(item);
        }
      }
      if (userFriendsMap.has(userB)) {
        const setB = userFriendsMap.get(userB)!;
        for (const item of Array.from(setB)) {
          if (item.toLowerCase() === userA) setB.delete(item);
        }
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
