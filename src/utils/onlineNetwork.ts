'use client';

import { OnlineRoom, PendingInvite, SlotType } from '@/app/api/online/route';
import { sound } from './audio';

export class OnlineNetworkManager {
  private static instance: OnlineNetworkManager;
  private currentRoomId: string | null = null;
  private pollInterval: any = null;
  private invitePollInterval: any = null;
  private roomListeners: Map<string, Set<(room: OnlineRoom) => void>> = new Map();
  private onInviteReceivedCallback: ((invite: PendingInvite) => void) | null = null;
  private lastKnownInviteIds: Set<string> = new Set();
  private lastMessageCount: number = 0;
  private lastSeenUpdatedAt: Map<string, number> = new Map();
  public cachedRooms: Map<string, OnlineRoom> = new Map();

  private constructor() {
    // Pure authoritative server state: no local broadcast channel cross-talk
  }

  public static getInstance(): OnlineNetworkManager {
    if (!OnlineNetworkManager.instance) {
      OnlineNetworkManager.instance = new OnlineNetworkManager();
    }
    return OnlineNetworkManager.instance;
  }

  // Authoritative Listener Dispatch with Stale-Packet Discard Guard
  public notifyListeners(room: OnlineRoom) {
    if (!room?.id) return;
    const lastSeen = this.lastSeenUpdatedAt.get(room.id) || 0;
    // Reject stale out-of-order network responses that would revert modern server state
    if (room.updatedAt && room.updatedAt < lastSeen) {
      return;
    }
    this.lastSeenUpdatedAt.set(room.id, room.updatedAt || Date.now());
    this.cachedRooms.set(room.id, room);

    if (room.chatMessages && room.chatMessages.length > this.lastMessageCount) {
      sound.playChatPing();
      this.lastMessageCount = room.chatMessages.length;
    }

    const listeners = this.roomListeners.get(room.id);
    listeners?.forEach((listener) => {
      try {
        listener(room);
      } catch {
        // Ignore listener error
      }
    });
  }

  // Helper for API POST to server
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
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // 2. Fetch Room (Pure server fetch, never sends local roomState)
  public async getRoom(roomId: string, username?: string): Promise<OnlineRoom | null> {
    const res = await this.postAction('get_room', { roomId, username });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return this.cachedRooms.get(roomId) || null;
  }

  // 3. Rotate Slot (Owner only)
  public async rotateSlot(roomId: string, slotIndex: number, requesterUsername: string, _legacyRoomState?: OnlineRoom, targetType?: SlotType): Promise<OnlineRoom | null> {
    const res = await this.postAction('rotate_slot', { roomId, slotIndex, requesterUsername, targetType });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // 4. Send Invite (Owner types username)
  public async sendInvite(roomId: string, slotIndex: number, targetUsername: string, requesterUsername: string): Promise<OnlineRoom | null> {
    const res = await this.postAction('send_invite', { roomId, slotIndex, targetUsername, requesterUsername });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
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
      this.notifyListeners(res.room);
    }
    return res;
  }

  // 7. Matchmaking Queue (Skill matching)
  public async queueMatch(username: string, skillRating: number, region: string = 'us-east'): Promise<{ success: boolean; matched: boolean; room?: OnlineRoom }> {
    const res = await this.postAction('queue_match', { username, skillRating, region });
    if (res.success && res.room) {
      this.currentRoomId = res.room.id;
      this.notifyListeners(res.room);
    }
    return res;
  }

  // 8. Update Banished (Owner only)
  public async updateBanished(roomId: string, speciesId: string, banish: boolean, requesterUsername: string): Promise<OnlineRoom | null> {
    const res = await this.postAction('update_banish', { roomId, speciesId, banish, requesterUsername });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // 8b. Toggle Privacy / Open to Random Humans (Owner only)
  public async toggleOpenToRandom(roomId: string, isOpenToRandom: boolean, requesterUsername: string): Promise<OnlineRoom | null> {
    const res = await this.postAction('toggle_open_to_random', { roomId, isOpenToRandom, requesterUsername });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // 8c. Toggle Max Players (Owner only: 2 | 3 | 4)
  public async toggleMaxPlayers(roomId: string, requesterUsername: string, _legacyRoomState?: OnlineRoom, maxPlayers?: 2 | 3 | 4): Promise<OnlineRoom | null> {
    const res = await this.postAction('toggle_max_players', { roomId, requesterUsername, maxPlayers });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // 8d. Join as Spectator
  public async joinSpectator(roomId: string, username: string): Promise<{ success: boolean; room?: OnlineRoom; isSpectator?: boolean }> {
    const res = await this.postAction('join_spectator', { roomId, username });
    if (res.success && res.room) {
      this.currentRoomId = res.room.id;
      this.notifyListeners(res.room);
      return { success: true, room: res.room, isSpectator: true };
    }
    return res;
  }

  // 9. Send Chat
  public async sendChat(roomId: string, sender: string, text: string): Promise<OnlineRoom | null> {
    const res = await this.postAction('send_chat', { roomId, sender, text });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // 10. Sync Game Action
  public async syncGameAction(roomId: string, newStatus?: string, gameState?: any): Promise<OnlineRoom | null> {
    const res = await this.postAction('sync_game_action', { roomId, newStatus, gameState });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // Active Online Session Persistence (Stores ONLY session pointer, NEVER game state)
  public saveActiveRoomSession(session: { roomId: string; username: string; playerSide?: string; role?: 'host' | 'player' | 'spectator'; isSpectator?: boolean }) {
    if (typeof window === 'undefined') return;
    try {
      const data = JSON.stringify({
        roomId: session.roomId,
        username: session.username,
        isSpectator: Boolean(session.isSpectator),
      });
      sessionStorage.setItem('ben_stuffy_active_online_room', data);
      if (session.username) {
        localStorage.setItem(`ben_stuffy_active_online_room_${session.username.trim().toLowerCase()}`, data);
      }
    } catch {
      // Ignore
    }
  }

  public getActiveRoomSession(username?: string): { roomId: string; username: string; playerSide?: string; role?: 'host' | 'player' | 'spectator'; isSpectator?: boolean } | null {
    if (typeof window === 'undefined') return null;
    try {
      const sess = sessionStorage.getItem('ben_stuffy_active_online_room');
      if (sess) return JSON.parse(sess);

      if (username) {
        const userSaved = localStorage.getItem(`ben_stuffy_active_online_room_${username.trim().toLowerCase()}`);
        if (userSaved) return JSON.parse(userSaved);
      }

      const saved = localStorage.getItem('ben_stuffy_active_online_room');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  public clearActiveRoomSession(username?: string) {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem('ben_stuffy_active_online_room');
      localStorage.removeItem('ben_stuffy_active_online_room');
      if (username) {
        localStorage.removeItem(`ben_stuffy_active_online_room_${username.trim().toLowerCase()}`);
      }
    } catch {
      // Ignore
    }
  }

  // Voluntary Leave from a Room
  public async leaveRoom(roomId: string, username: string): Promise<boolean> {
    this.stopRoomPolling(undefined, roomId);
    this.clearActiveRoomSession(username);
    const res = await this.postAction('leave_room', { roomId, username });
    return Boolean(res?.success);
  }

  // Emergency Leave All Games
  public async leaveAllGames(username: string): Promise<{ success: boolean; cleanedRoomCount: number }> {
    this.stopRoomPolling();
    this.clearActiveRoomSession(username);
    const res = await this.postAction('leave_all_games', { username });
    return { success: Boolean(res?.success), cleanedRoomCount: res?.cleanedRoomCount || 0 };
  }

  // Resign Match (concede and record forfeit/award win to opponent)
  public async resignMatch(roomId: string, username: string): Promise<OnlineRoom | null> {
    this.clearActiveRoomSession(username);
    const res = await this.postAction('resign_match', { roomId, username });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // Force End Match (when opponent disconnected or inactive)
  public async forceEndMatch(roomId: string, callerUsername: string, reason?: string): Promise<OnlineRoom | null> {
    const res = await this.postAction('force_end_match', { roomId, callerUsername, reason });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // Terminate & Destroy Match (instant server garbage collection & local cleanup)
  public async terminateMatch(roomId: string, username: string): Promise<boolean> {
    this.stopRoomPolling(undefined, roomId);
    this.clearActiveRoomSession(username);
    const res = await this.postAction('terminate_match', { roomId, username });
    this.cachedRooms.delete(roomId);
    this.lastSeenUpdatedAt.delete(roomId);
    return Boolean(res?.success);
  }

  // 11. Start Draft
  public async startDraft(roomId: string, requesterUsername: string): Promise<OnlineRoom | null> {
    const res = await this.postAction('start_draft', { roomId, requesterUsername });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // 12. Submit Draft Pick
  public async submitDraftPick(roomId: string, playerIdx: number, username: string, speciesId: string, loadoutId: string): Promise<OnlineRoom | null> {
    const res = await this.postAction('draft_pick', { roomId, playerIdx, username, speciesId, loadoutId });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // 13. Submit Draft Random Fill
  public async submitDraftRandomFill(roomId: string, playerIdx: number, username: string): Promise<OnlineRoom | null> {
    const res = await this.postAction('draft_random_fill', { roomId, playerIdx, username });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // 14. Submit Combat Card Play
  public async submitCombatCardPlay(roomId: string, playerId: string, cardIndex: number, targetId?: string): Promise<OnlineRoom | null> {
    const res = await this.postAction('combat_play_card', { roomId, playerId, cardIndex, targetId });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // 15. Submit Combat End Turn
  public async submitCombatEndTurn(roomId: string, playerId: string): Promise<OnlineRoom | null> {
    const res = await this.postAction('combat_end_turn', { roomId, playerId });
    if (res.success && res.room) {
      this.notifyListeners(res.room);
      return res.room;
    }
    return null;
  }

  // 16. Reconnect Room
  public async reconnectRoom(roomId: string, username: string): Promise<{ success: boolean; room?: OnlineRoom }> {
    const res = await this.postAction('reconnect_room', { roomId, username });
    if (res.success && res.room) {
      this.currentRoomId = res.room.id;
      this.notifyListeners(res.room);
      this.saveActiveRoomSession({ roomId: res.room.id, username });
    }
    return res;
  }

  // Polling listeners
  public startRoomPolling(roomId: string, onUpdate: (room: OnlineRoom) => void, intervalMs: number = 800, username?: string) {
    this.currentRoomId = roomId;
    if (!this.roomListeners.has(roomId)) {
      this.roomListeners.set(roomId, new Set());
    }
    this.roomListeners.get(roomId)!.add(onUpdate);

    // Immediate initial poll
    this.getRoom(roomId, username).then((room) => {
      if (room && room.id === roomId) {
        this.notifyListeners(room);
      }
    });

    if (!this.pollInterval) {
      this.pollInterval = setInterval(async () => {
        if (!this.currentRoomId) return;
        const targetId = this.currentRoomId;
        const listeners = this.roomListeners.get(targetId);
        if (!listeners || listeners.size === 0) return;

        const room = await this.getRoom(targetId, username);
        if (room && room.id === targetId) {
          if (room.status === 'ended') {
            this.clearActiveRoomSession(username);
          }
          this.notifyListeners(room);
        }
      }, intervalMs);
    }
  }

  public stopRoomPolling(onUpdate?: (room: OnlineRoom) => void, roomId?: string) {
    if (roomId && onUpdate) {
      this.roomListeners.get(roomId)?.delete(onUpdate);
    } else if (onUpdate) {
      this.roomListeners.forEach((set) => set.delete(onUpdate));
    } else if (roomId) {
      this.roomListeners.delete(roomId);
    } else {
      this.roomListeners.clear();
      this.currentRoomId = null;
    }

    let totalListeners = 0;
    this.roomListeners.forEach((set) => { totalListeners += set.size; });
    if (totalListeners === 0 && this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
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

  // Kept for backwards compatibility (now a no-op since server is authoritative)
  public broadcastLocal(_type: string, _data: any) {
    // No-op: Server is the single source of truth.
  }
}

export const onlineNetwork = OnlineNetworkManager.getInstance();
