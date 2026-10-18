import { NextRequest, NextResponse } from 'next/server';
import { filterProfanity } from '@/utils/chatFilter';

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
  gameState?: any;
  updatedAt: number;
  maxPlayers?: 2 | 3 | 4;
  spectators?: string[];
  spectatorCount?: number;
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

// Helper to cleanup stale rooms (older than 2 hours)
function cleanupStale() {
  const now = Date.now();
  rooms.forEach((room, id) => {
    if (now - room.updatedAt > 2 * 60 * 60 * 1000) {
      rooms.delete(id);
    }
  });
  invites.forEach((inv, id) => {
    if (now - inv.timestamp > 15 * 60 * 1000) {
      invites.delete(id);
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    cleanupStale();
    const body = await req.json();
    const { action } = body;

    // 1. CREATE ROOM
    if (action === 'create_room') {
      const { hostUsername, hostSkillRating = 1000, region = 'us-east' } = body;
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
      const { roomId, roomState } = body;
      let room = rooms.get(roomId);
      if (!room && roomState) {
        rooms.set(roomId, roomState);
        room = roomState;
      }
      if (!room) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 });
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

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
