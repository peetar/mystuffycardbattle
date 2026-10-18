import { NextRequest, NextResponse } from 'next/server';
import { filterProfanity } from '@/utils/chatFilter';
import { PLAYABLE_STUFFIES, STUFFY_MAP } from '@/data/stuffies';
import { getLoadoutsForStuffy } from '@/data/loadouts';
import { CARD_MAP, PLAYER_POWERUP_CARDS } from '@/data/cards';
import { PlayerSide, MultiplayerPlayerData, StuffyState, Card } from '@/types/game';

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

// Global in-memory storage for Vercel/Node runtime
const globalStore = global as unknown as {
  onlineRooms?: Map<string, OnlineRoom>;
  pendingInvites?: Map<string, PendingInvite>;
};

if (!globalStore.onlineRooms) {
  globalStore.onlineRooms = new Map();
}
if (!globalStore.pendingInvites) {
  globalStore.pendingInvites = new Map();
}

const rooms = globalStore.onlineRooms;
const invites = globalStore.pendingInvites;

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
        room.chatMessages.push({
          id: `msg_${Date.now()}_clean`,
          sender: 'SYSTEM',
          text: `🚪 Host @${username} left to start another match. Room closed.`,
          timestamp: Date.now(),
          isSystem: true,
        });
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
        room.chatMessages.push({
          id: `msg_${Date.now()}_clean`,
          sender: 'SYSTEM',
          text: `🚪 @${username} left this match.`,
          timestamp: Date.now(),
          isSystem: true,
        });
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
        room.chatMessages.push({
          id: `msg_${Date.now()}_clean`,
          sender: 'SYSTEM',
          text: `🚪 @${username} abandoned the draft. Match ended.`,
          timestamp: Date.now(),
          isSystem: true,
        });
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
        room.chatMessages.push({
          id: `msg_${Date.now()}_clean`,
          sender: 'SYSTEM',
          text: `🚪 @${username} disconnected/forfeited from combat.`,
          timestamp: Date.now(),
          isSystem: true,
        });
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
        chatMessages: [
          {
            id: `msg_${Date.now()}`,
            sender: 'SYSTEM',
            text: `Room ${roomId} created in ${region.toUpperCase()} by @${hostUsername || 'Player'}! (Private room - click button to open to random humans)`,
            timestamp: Date.now(),
            isSystem: true,
          },
        ],
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
      const { roomId, username, roomState } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
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
      const { roomId, slotIndex, requesterUsername, roomState, targetType } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
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
      } else if (roomState?.slots?.[slotIndex]?.type && roomState.slots[slotIndex].type !== slot.type) {
        nextType = roomState.slots[slotIndex].type;
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
      const { roomId, slotIndex, targetUsername, requesterUsername, roomState } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
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

      room.chatMessages.push({
        id: `msg_${Date.now()}`,
        sender: 'SYSTEM',
        text: `@${requesterUsername} invited @${targetUsername} to join the room!`,
        timestamp: Date.now(),
        isSystem: true,
      });

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
          room.chatMessages.push({
            id: `msg_${Date.now()}`,
            sender: 'SYSTEM',
            text: `@${username} joined the match!`,
            timestamp: Date.now(),
            isSystem: true,
          });
          room.updatedAt = Date.now();
          return NextResponse.json({ success: true, joined: true, room });
        } else {
          return NextResponse.json({ success: false, error: 'Room slots are now full' });
        }
      } else {
        room.chatMessages.push({
          id: `msg_${Date.now()}`,
          sender: 'SYSTEM',
          text: `@${username} declined the invitation.`,
          timestamp: Date.now(),
          isSystem: true,
        });
        room.updatedAt = Date.now();
        return NextResponse.json({ success: true, joined: false });
      }
    }

    // 7. MATCHMAKING QUEUE (Skill Rating Matching by Region)
    if (action === 'queue_match') {
      const { username, skillRating = 1000, region = 'us-east' } = body;
      if (username) {
        cleanupUserFromOtherRooms(username);
      }

      // Find rooms in this region with an open 'random' slot
      let bestRoom: OnlineRoom | null = null;
      let closestDiff = Infinity;

      const roomList: OnlineRoom[] = Array.from(rooms.values());
      for (let i = 0; i < roomList.length; i++) {
        const room = roomList[i];
        if (room.status === 'lobby' && room.isOpenToRandom && (room.region === region || region === 'global' || room.region === 'global')) {
          const hasOpenRandom = room.slots.some((s) => s.type === 'random' && !s.player);
          if (hasOpenRandom) {
            const diff = Math.abs(room.hostSkillRating - skillRating);
            if (diff < closestDiff) {
              closestDiff = diff;
              bestRoom = room;
            }
          }
        }
      }

      if (bestRoom) {
        const slot = bestRoom.slots.find((s) => s.type === 'random' && !s.player)!;
        slot.player = {
          username,
          skillRating,
          isBot: false,
          ready: true,
        };
        bestRoom.chatMessages.push({
          id: `msg_${Date.now()}`,
          sender: 'SYSTEM',
          text: `🌐 Matchmaking: @${username} (Rating: ${skillRating}) was paired with room!`,
          timestamp: Date.now(),
          isSystem: true,
        });
        bestRoom.updatedAt = Date.now();
        return NextResponse.json({ success: true, matched: true, room: bestRoom });
      }

      // No open match found, create a host room with random slots
      const newRoomId = `ROOM-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRoom: OnlineRoom = {
        id: newRoomId,
        region,
        hostUsername: username,
        hostSkillRating: skillRating,
        status: 'lobby',
        isOpenToRandom: true, // Created via public queue, open to random players
        slots: [
          { slotIndex: 1, type: 'random', player: undefined },
          { slotIndex: 2, type: 'none', player: undefined },
          { slotIndex: 3, type: 'none', player: undefined },
        ],
        banishedSpeciesIds: [],
        chatMessages: [
          {
            id: `msg_${Date.now()}`,
            sender: 'SYSTEM',
            text: `🌐 Matchmaking room created. Waiting for opponent with skill ~${skillRating}...`,
            timestamp: Date.now(),
            isSystem: true,
          },
        ],
        updatedAt: Date.now(),
        maxPlayers: 2,
        spectators: [],
        spectatorCount: 0,
      };
      rooms.set(newRoomId, newRoom);
      return NextResponse.json({ success: true, matched: false, room: newRoom });
    }

    // TOGGLE MAX PLAYERS (Owner only: 2 -> 3 -> 4 -> 2)
    if (action === 'toggle_max_players') {
      const { roomId, requesterUsername, roomState, maxPlayers } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
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
      room.chatMessages.push({
        id: `msg_${Date.now()}`,
        sender: 'SYSTEM',
        text: `👥 Battle size set to ${nextMax} Players!`,
        timestamp: Date.now(),
        isSystem: true,
      });
      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // JOIN AS SPECTATOR (From main menu or link)
    if (action === 'join_spectator') {
      const { roomId, username = 'Spectator', roomState } = body;
      if (username && username !== 'Spectator') {
        cleanupUserFromOtherRooms(username, roomId);
      }
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });

      if (!room.spectators) room.spectators = [];
      if (!room.spectators.includes(username)) {
        room.spectators.push(username);
      }
      room.spectatorCount = room.spectators.length;
      room.chatMessages.push({
        id: `msg_${Date.now()}`,
        sender: 'SYSTEM',
        text: `👁️ Spectator @${username} is watching the match!`,
        timestamp: Date.now(),
        isSystem: true,
      });
      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room, isSpectator: true });
    }

    // TOGGLE PRIVACY / OPEN TO RANDOM HUMANS (Owner only)
    if (action === 'toggle_open_to_random') {
      const { roomId, isOpenToRandom, requesterUsername, roomState } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
      const isMatch = !requesterUsername || !room.hostUsername || room.hostUsername.trim().toLowerCase() === requesterUsername.trim().toLowerCase() || room.hostUsername === 'Player' || requesterUsername === 'Player';
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Only the room owner can change privacy settings' }, { status: 403 });
      }

      room.isOpenToRandom = isOpenToRandom !== undefined ? Boolean(isOpenToRandom) : !room.isOpenToRandom;
      room.chatMessages.push({
        id: `msg_${Date.now()}`,
        sender: 'SYSTEM',
        text: room.isOpenToRandom
          ? '🌐 Room was opened to public matchmaking for random humans!'
          : '🔒 Room is now private (invite & bots only).',
        timestamp: Date.now(),
        isSystem: true,
      });
      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // 8. UPDATE BANISHED STUFFIES (Owner ONLY!)
    if (action === 'update_banish') {
      const { roomId, speciesId, banish, requesterUsername, roomState } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
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
      const { roomId, sender, text, roomState } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
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
      const { roomId, newStatus, gameState, roomState } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });

      if (newStatus) room.status = newStatus;
      if (gameState) room.gameState = gameState;
      room.updatedAt = Date.now();
      return NextResponse.json({ success: true, room });
    }

    // 11. START DRAFT (Authoritative initialization)
    if (action === 'start_draft') {
      const { roomId, requesterUsername, roomState } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
      if (!room) return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });

      const maxActive = (room.maxPlayers || 2) - 1;
      const activeSlots = room.slots.slice(0, maxActive).filter((s) => s.type !== 'none' && s.player);
      const playerNames = [room.hostUsername, ...activeSlots.map((s) => s.player!.username)];
      const playerIds: PlayerSide[] = (['p1', 'p2', 'p3', 'p4'].slice(0, playerNames.length)) as PlayerSide[];
      const targetPerPlayer = playerNames.length === 2 ? 5 : 4;
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
      room.chatMessages.push({
        id: `msg_${Date.now()}`,
        sender: 'SYSTEM',
        text: `👑 Draft started! @${playerNames[0]} has the first pick!`,
        timestamp: Date.now(),
        isSystem: true,
      });
      room.updatedAt = Date.now();
      rooms.set(roomId, room);
      return NextResponse.json({ success: true, room });
    }

    // 12. DRAFT PICK (Authoritative single pick)
    if (action === 'draft_pick') {
      const { roomId, playerIdx, username, speciesId, loadoutId, roomState } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
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

      room.chatMessages.push({
        id: `msg_${Date.now()}`,
        sender: 'SYSTEM',
        text: `🧸 @${pName} drafted ${sp?.name || speciesId}!`,
        timestamp: Date.now(),
        isSystem: true,
      });

      const allFinished = dState.playerNames.every((_, idx) => (dState.drafts[idx]?.length || 0) >= dState.targetPerPlayer);
      if (allFinished) {
        dState.isFinished = true;
        room.status = 'battle';
        room.combatState = buildCombatStateFromDraft(room);
        room.chatMessages.push({
          id: `msg_${Date.now()}`,
          sender: 'SYSTEM',
          text: `⚔️ Draft complete! All squads assembled. Battle begins now!`,
          timestamp: Date.now(),
          isSystem: true,
        });
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
      const { roomId, playerIdx, username, roomState } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
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
        room.chatMessages.push({
          id: `msg_${Date.now()}`,
          sender: 'SYSTEM',
          text: `⚔️ Draft complete! All squads assembled. Battle begins now!`,
          timestamp: Date.now(),
          isSystem: true,
        });
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
      const { roomId, playerId, cardIndex, targetId, roomState } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
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
      const { roomId, playerId, roomState } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
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
      const { roomId, username, roomState } = body;
      if (username) {
        cleanupUserFromOtherRooms(username, roomId);
      }
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
      if (!room || room.status === 'ended') {
        return NextResponse.json({ success: false, error: 'Room ended or not found' }, { status: 404 });
      }

      if (!room.connectedUsernames) room.connectedUsernames = [];
      if (!room.connectedUsernames.includes(username)) {
        room.connectedUsernames.push(username);
      }

      room.chatMessages.push({
        id: `msg_${Date.now()}`,
        sender: 'SYSTEM',
        text: `🔄 @${username} reconnected to the match!`,
        timestamp: Date.now(),
        isSystem: true,
      });

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
          room.chatMessages.push({
            id: `msg_${Date.now()}`,
            sender: 'SYSTEM',
            text: `🚪 Host @${username} left. Match ended.`,
            timestamp: Date.now(),
            isSystem: true,
          });
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
          room.chatMessages.push({
            id: `msg_${Date.now()}`,
            sender: 'SYSTEM',
            text: `🚪 @${username} left the room.`,
            timestamp: Date.now(),
            isSystem: true,
          });
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
        room.chatMessages.push({
          id: `msg_${Date.now()}_resign`,
          sender: 'SYSTEM',
          text: `🏳️ @${username} has resigned the draft match. Room closed.`,
          timestamp: Date.now(),
          isSystem: true,
        });
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
        room.chatMessages.push({
          id: `msg_${Date.now()}_resign`,
          sender: 'SYSTEM',
          text: `🏳️ @${username} has conceded. Victory awarded to opponent!`,
          timestamp: Date.now(),
          isSystem: true,
        });
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

      room.chatMessages.push({
        id: `msg_${Date.now()}_force_end`,
        sender: 'SYSTEM',
        text: `⚡ Match force-ended by @${callerUsername || 'Player'}. Reason: ${reason || 'Opponent inactive/disconnected'}.`,
        timestamp: Date.now(),
        isSystem: true,
      });

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
        room.chatMessages.push({
          id: `msg_${Date.now()}_term`,
          sender: 'SYSTEM',
          text: `💥 Match destroyed and garbage-collected by @${username || 'Player'}.`,
          timestamp: Date.now(),
          isSystem: true,
        });
        room.updatedAt = Date.now();
        // Immediate server garbage collection
        garbageCollectRoom(roomId);
      }
      return NextResponse.json({ success: true, message: 'Match destroyed and garbage collected' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
