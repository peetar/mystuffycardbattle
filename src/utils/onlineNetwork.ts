'use client';

import { OnlineRoom, PendingInvite, SlotType } from '@/app/api/online/route';
import { sound } from './audio';

// Cross-tab broadcast channel for instantaneous local multi-window testing
let localChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    localChannel = new BroadcastChannel('benstuffy_online_broadcast');
  } catch {
    // Ignore in unsupported environments
  }
}

export class OnlineNetworkManager {
  private static instance: OnlineNetworkManager;
  private currentRoomId: string | null = null;
  private pollInterval: any = null;
  private invitePollInterval: any = null;
  private onRoomUpdateCallback: ((room: OnlineRoom) => void) | null = null;
  private onInviteReceivedCallback: ((invite: PendingInvite) => void) | null = null;
  private lastKnownInviteIds: Set<string> = new Set();
  private lastMessageCount: number = 0;
  public cachedRooms: Map<string, OnlineRoom> = new Map();

  private constructor() {
    if (localChannel) {
      localChannel.onmessage = (event) => {
        const { type, data } = event.data || {};
        if (type === 'ROOM_UPDATED' && data?.id === this.currentRoomId) {
          if (data?.id) this.cachedRooms.set(data.id, data);
          if (this.onRoomUpdateCallback) this.onRoomUpdateCallback(data);
        } else if (type === 'INVITE_SENT') {
          // Handled via invite check
        }
      };
    }
  }

  public static getInstance(): OnlineNetworkManager {
    if (!OnlineNetworkManager.instance) {
      OnlineNetworkManager.instance = new OnlineNetworkManager();
    }
    return OnlineNetworkManager.instance;
  }

  // Helper for API POST
  private async postAction(action: string, payload: any = {}) {
    try {
      const res = await fetch('/api/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      return await res.json();
    } catch (err) {
      console.error(`[OnlineNetwork] ${action} failed:`, err);
      return { success: false, error: 'Network error' };
    }
  }

  // 1. Create a Room
  public async createRoom(hostUsername: string, hostSkillRating: number, region: string = 'us-east'): Promise<OnlineRoom | null> {
    const res = await this.postAction('create_room', { hostUsername: hostUsername || 'Player', hostSkillRating, region });
    if (res.success && res.room) {
      this.currentRoomId = res.room.id;
      this.cachedRooms.set(res.room.id, res.room);
      this.broadcastLocal('ROOM_UPDATED', res.room);
      return res.room;
    }
    return null;
  }

  // 2. Fetch Room
  public async getRoom(roomId: string): Promise<OnlineRoom | null> {
    const roomState = this.cachedRooms.get(roomId);
    const res = await this.postAction('get_room', { roomId, roomState });
    if (res.success && res.room) {
      this.cachedRooms.set(res.room.id, res.room);
      return res.room;
    }
    return roomState || null;
  }

  // 3. Rotate Slot (Owner only)
  public async rotateSlot(roomId: string, slotIndex: number, requesterUsername: string, roomState?: OnlineRoom, targetType?: SlotType): Promise<OnlineRoom | null> {
    if (roomState) {
      this.cachedRooms.set(roomId, roomState);
    }
    const stateToSend = roomState || this.cachedRooms.get(roomId);
    const res = await this.postAction('rotate_slot', { roomId, slotIndex, requesterUsername, roomState: stateToSend, targetType });
    if (res.success && res.room) {
      this.cachedRooms.set(res.room.id, res.room);
      this.broadcastLocal('ROOM_UPDATED', res.room);
      return res.room;
    }
    if (stateToSend) {
      this.broadcastLocal('ROOM_UPDATED', stateToSend);
      return stateToSend;
    }
    return null;
  }

  // 4. Send Invite (Owner types username)
  public async sendInvite(roomId: string, slotIndex: number, targetUsername: string, requesterUsername: string, roomState?: OnlineRoom): Promise<OnlineRoom | null> {
    const stateToSend = roomState || this.cachedRooms.get(roomId);
    const res = await this.postAction('send_invite', { roomId, slotIndex, targetUsername, requesterUsername, roomState: stateToSend });
    if (res.success && res.room) {
      this.cachedRooms.set(res.room.id, res.room);
      this.broadcastLocal('ROOM_UPDATED', res.room);
      this.broadcastLocal('INVITE_SENT', res.invite);
      sound.playRewardSound();
      return res.room;
    }
    return null;
  }

  // 5. Check Invites (Client background listener)
  public async checkInvites(username: string): Promise<PendingInvite[]> {
    if (!username) return [];
    const res = await this.postAction('check_invites', { username });
    if (res.success && Array.isArray(res.invites)) {
      return res.invites;
    }
    return [];
  }

  // 6. Respond to Invite (Accept / Decline)
  public async respondInvite(inviteId: string, accept: boolean, username: string, skillRating: number): Promise<{ success: boolean; joined: boolean; room?: OnlineRoom }> {
    const res = await this.postAction('respond_invite', { inviteId, accept, username, skillRating });
    if (res.success && res.room) {
      this.currentRoomId = res.room.id;
      this.cachedRooms.set(res.room.id, res.room);
      this.broadcastLocal('ROOM_UPDATED', res.room);
    }
    return res;
  }

  // 7. Matchmaking Queue (Skill matching)
  public async queueMatch(username: string, skillRating: number, region: string = 'us-east'): Promise<{ success: boolean; matched: boolean; room?: OnlineRoom }> {
    const res = await this.postAction('queue_match', { username, skillRating, region });
    if (res.success && res.room) {
      this.currentRoomId = res.room.id;
      this.cachedRooms.set(res.room.id, res.room);
      this.broadcastLocal('ROOM_UPDATED', res.room);
    }
    return res;
  }

  // 8. Update Banished (Owner only)
  public async updateBanished(roomId: string, speciesId: string, banish: boolean, requesterUsername: string, roomState?: OnlineRoom): Promise<OnlineRoom | null> {
    const stateToSend = roomState || this.cachedRooms.get(roomId);
    const res = await this.postAction('update_banish', { roomId, speciesId, banish, requesterUsername, roomState: stateToSend });
    if (res.success && res.room) {
      this.cachedRooms.set(res.room.id, res.room);
      this.broadcastLocal('ROOM_UPDATED', res.room);
      return res.room;
    }
    return null;
  }

  // 8b. Toggle Privacy / Open to Random Humans (Owner only)
  public async toggleOpenToRandom(roomId: string, isOpenToRandom: boolean, requesterUsername: string, roomState?: OnlineRoom): Promise<OnlineRoom | null> {
    const stateToSend = roomState || this.cachedRooms.get(roomId);
    const res = await this.postAction('toggle_open_to_random', { roomId, isOpenToRandom, requesterUsername, roomState: stateToSend });
    if (res.success && res.room) {
      this.cachedRooms.set(res.room.id, res.room);
      this.broadcastLocal('ROOM_UPDATED', res.room);
      return res.room;
    }
    return null;
  }

  // 8c. Toggle Max Players (Owner only: 2 | 3 | 4)
  public async toggleMaxPlayers(roomId: string, requesterUsername: string, roomState?: OnlineRoom, maxPlayers?: 2 | 3 | 4): Promise<OnlineRoom | null> {
    const stateToSend = roomState || this.cachedRooms.get(roomId);
    const res = await this.postAction('toggle_max_players', { roomId, requesterUsername, roomState: stateToSend, maxPlayers });
    if (res.success && res.room) {
      this.cachedRooms.set(res.room.id, res.room);
      this.broadcastLocal('ROOM_UPDATED', res.room);
      return res.room;
    }
    return null;
  }

  // 8d. Join as Spectator
  public async joinSpectator(roomId: string, username: string, roomState?: OnlineRoom): Promise<{ success: boolean; room?: OnlineRoom; isSpectator?: boolean }> {
    const stateToSend = roomState || this.cachedRooms.get(roomId);
    const res = await this.postAction('join_spectator', { roomId, username, roomState: stateToSend });
    if (res.success && res.room) {
      this.currentRoomId = res.room.id;
      this.cachedRooms.set(res.room.id, res.room);
      this.broadcastLocal('ROOM_UPDATED', res.room);
      return { success: true, room: res.room, isSpectator: true };
    }
    return res;
  }

  // 9. Send Chat
  public async sendChat(roomId: string, sender: string, text: string, roomState?: OnlineRoom): Promise<OnlineRoom | null> {
    const stateToSend = roomState || this.cachedRooms.get(roomId);
    const res = await this.postAction('send_chat', { roomId, sender, text, roomState: stateToSend });
    if (res.success && res.room) {
      this.cachedRooms.set(res.room.id, res.room);
      this.broadcastLocal('ROOM_UPDATED', res.room);
      sound.playChatPing();
      return res.room;
    }
    return null;
  }

  // 10. Sync Game Action
  public async syncGameAction(roomId: string, newStatus?: string, gameState?: any, roomState?: OnlineRoom): Promise<OnlineRoom | null> {
    const stateToSend = roomState || this.cachedRooms.get(roomId);
    const res = await this.postAction('sync_game_action', { roomId, newStatus, gameState, roomState: stateToSend });
    if (res.success && res.room) {
      this.cachedRooms.set(res.room.id, res.room);
      this.broadcastLocal('ROOM_UPDATED', res.room);
      return res.room;
    }
    return null;
  }

  // Polling listeners
  public startRoomPolling(roomId: string, onUpdate: (room: OnlineRoom) => void, intervalMs: number = 1000) {
    this.stopRoomPolling();
    this.currentRoomId = roomId;
    this.onRoomUpdateCallback = onUpdate;

    // Immediate initial poll
    this.getRoom(roomId).then((room) => {
      if (room) {
        this.lastMessageCount = room.chatMessages.length;
        onUpdate(room);
      }
    });

    this.pollInterval = setInterval(async () => {
      if (!this.currentRoomId) return;
      const room = await this.getRoom(this.currentRoomId);
      if (room && this.onRoomUpdateCallback) {
        const cached = this.cachedRooms.get(this.currentRoomId);
        if (cached && cached.updatedAt > room.updatedAt) {
          return;
        }
        if (room.chatMessages.length > this.lastMessageCount) {
          sound.playChatPing();
          this.lastMessageCount = room.chatMessages.length;
        }
        this.onRoomUpdateCallback(room);
      }
    }, intervalMs);
  }

  public stopRoomPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.onRoomUpdateCallback = null;
  }

  public startInviteListener(username: string, onInvite: (invite: PendingInvite) => void, intervalMs: number = 2500) {
    this.stopInviteListener();
    this.onInviteReceivedCallback = onInvite;

    this.invitePollInterval = setInterval(async () => {
      if (!username) return;
      const activeInvites = await this.checkInvites(username);
      for (const inv of activeInvites) {
        if (!this.lastKnownInviteIds.has(inv.inviteId)) {
          this.lastKnownInviteIds.add(inv.inviteId);
          sound.playInvitePing();
          if (this.onInviteReceivedCallback) {
            this.onInviteReceivedCallback(inv);
          }
        }
      }
    }, intervalMs);
  }

  public stopInviteListener() {
    if (this.invitePollInterval) {
      clearInterval(this.invitePollInterval);
      this.invitePollInterval = null;
    }
    this.onInviteReceivedCallback = null;
  }

  public broadcastLocal(type: string, data: any) {
    if (localChannel) {
      try {
        localChannel.postMessage({ type, data });
      } catch {
        // Ignore
      }
    }
  }
}

export const onlineNetwork = OnlineNetworkManager.getInstance();
