'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OnlineRoom, SlotType, RoomSlot } from '@/app/api/online/route';
import { onlineNetwork } from '@/utils/onlineNetwork';
import { sound } from '@/utils/audio';
import { PLAYABLE_STUFFIES, STUFFY_MAP } from '@/data/stuffies';
import { CARD_MAP, PLAYER_POWERUP_CARDS } from '@/data/cards';
import { StuffySprite } from '@/components/battle/StuffySprite';
import { getLoadoutsForStuffy } from '@/data/loadouts';
import { StuffyState, MultiplayerPlayerData, StuffySpecies, PlayerSide, Card } from '@/types/game';

import { filterProfanity } from '@/utils/chatFilter';

interface OnlineRoomViewProps {
  initialRoom: OnlineRoom;
  currentUser: string;
  userSkillRating: number;
  isSpectator?: boolean;
  onLeaveRoom: () => void;
  onLaunchOnlineDraft: (playerCount: number, playerNames: string[], banishedSpecies: string[]) => void;
  onLaunchOnlineGame: (players: MultiplayerPlayerData[], banishedSpecies: string[]) => void;
}

export const OnlineRoomView: React.FC<OnlineRoomViewProps> = ({
  initialRoom,
  currentUser,
  userSkillRating,
  isSpectator = false,
  onLeaveRoom,
  onLaunchOnlineDraft,
  onLaunchOnlineGame,
}) => {
  const [room, setRoom] = useState<OnlineRoom>(initialRoom);
  const [chatInput, setChatInput] = useState('');
  const [inviteInputs, setInviteInputs] = useState<Record<number, string>>({});
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [showRoomCode, setShowRoomCode] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const lastUpdatedRef = useRef<number>(initialRoom.updatedAt || Date.now());

  const isOwner = Boolean(
    !isSpectator &&
    (!room.hostUsername ||
      !currentUser ||
      room.hostUsername.trim().toLowerCase() === currentUser.trim().toLowerCase() ||
      room.hostUsername === 'Player' ||
      currentUser === 'Player')
  );

  // Poll room updates with stale guard
  useEffect(() => {
    onlineNetwork.startRoomPolling(room.id, (updatedRoom) => {
      if (updatedRoom.updatedAt && updatedRoom.updatedAt < lastUpdatedRef.current) {
        return; // Discard stale poll response that would overwrite user clicks
      }
      lastUpdatedRef.current = updatedRoom.updatedAt || Date.now();
      setRoom(updatedRoom);
      // Auto-trigger draft or game launch if host started it
      if (updatedRoom.status === 'draft') {
        const maxActive = (updatedRoom.maxPlayers || 2) - 1;
        const activeSlots = updatedRoom.slots.slice(0, maxActive).filter((s) => s.type !== 'none' && s.player);
        const pNames = [updatedRoom.hostUsername, ...activeSlots.map((s) => s.player!.username)];
        onLaunchOnlineDraft(pNames.length, pNames, updatedRoom.banishedSpeciesIds);
      } else if (updatedRoom.status === 'battle' && updatedRoom.gameState?.players) {
        onLaunchOnlineGame(updatedRoom.gameState.players, updatedRoom.banishedSpeciesIds);
      }
    });

    return () => {
      onlineNetwork.stopRoomPolling();
    };
  }, [room.id, onLaunchOnlineDraft, onLaunchOnlineGame]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room.chatMessages]);

  // Toggle Battle Size (2, 3, or 4 Players)
  const handleToggleBattleSize = async () => {
    if (!isOwner) return;
    sound.playClickSound();
    const currentMax = room.maxPlayers || 2;
    const nextMax: 2 | 3 | 4 = currentMax === 2 ? 3 : currentMax === 3 ? 4 : 2;

    const newSlots = [...room.slots] as [RoomSlot, RoomSlot, RoomSlot];
    if (nextMax === 2) {
      newSlots[1] = { slotIndex: 2, type: 'none', player: undefined };
      newSlots[2] = { slotIndex: 3, type: 'none', player: undefined };
    } else if (nextMax === 3) {
      newSlots[2] = { slotIndex: 3, type: 'none', player: undefined };
    }

    const updatedRoom: OnlineRoom = {
      ...room,
      maxPlayers: nextMax,
      slots: newSlots,
      updatedAt: Date.now(),
    };

    lastUpdatedRef.current = updatedRoom.updatedAt;
    setRoom(updatedRoom);
    onlineNetwork.cachedRooms.set(room.id, updatedRoom);
    onlineNetwork.broadcastLocal('ROOM_UPDATED', updatedRoom);
    onlineNetwork.toggleMaxPlayers(room.id, currentUser || room.hostUsername, updatedRoom, nextMax);
  };

  // Rotate a slot (Owner only): None -> Invite -> Random human -> Bot -> None
  const handleRotateSlot = (slotIdx: number, specificType?: SlotType) => {
    if (!isOwner) return;
    sound.playClickSound();

    const cycle: SlotType[] = ['none', 'invite', 'random', 'bot'];
    const currentSlot = room.slots[slotIdx];
    const currentType = currentSlot ? currentSlot.type : 'none';
    const nextType: SlotType = specificType !== undefined
      ? specificType
      : cycle[(cycle.indexOf(currentType) + 1) % cycle.length];

    const botNames = ['Bot Stuffy', 'Bot Cotton', 'Bot Button', 'Bot Fluffy', 'Bot Patch'];

    const newSlots: [RoomSlot, RoomSlot, RoomSlot] = [
      { ...room.slots[0] },
      { ...room.slots[1] },
      { ...room.slots[2] },
    ];

    newSlots[slotIdx] = {
      slotIndex: slotIdx + 1,
      type: nextType,
      invitedUsername: undefined,
      player: nextType === 'bot' ? {
        username: botNames[slotIdx] || `Bot ${slotIdx + 2}`,
        skillRating: room.hostSkillRating || 1000,
        isBot: true,
        ready: true,
      } : undefined,
    };

    const updatedRoom: OnlineRoom = {
      ...room,
      slots: newSlots,
      updatedAt: Date.now(),
    };

    lastUpdatedRef.current = updatedRoom.updatedAt;
    setRoom(updatedRoom);
    onlineNetwork.cachedRooms.set(room.id, updatedRoom);
    onlineNetwork.broadcastLocal('ROOM_UPDATED', updatedRoom);
    onlineNetwork.rotateSlot(room.id, slotIdx, currentUser || room.hostUsername, updatedRoom, nextType);
  };

  // Send an invite to typed username
  const handleSendInvite = async (slotIdx: number) => {
    const targetUser = (inviteInputs[slotIdx] || '').trim();
    if (!targetUser) return;
    if (targetUser.toLowerCase() === currentUser.toLowerCase()) {
      setErrorBanner('You cannot invite yourself!');
      setTimeout(() => setErrorBanner(null), 3000);
      return;
    }

    sound.playClickSound();
    const updated = await onlineNetwork.sendInvite(room.id, slotIdx, targetUser, currentUser, room);
    if (updated) {
      setRoom(updated);
      setInviteInputs((prev) => ({ ...prev, [slotIdx]: '' }));
    }
  };

  // Toggle Banished (Owner only!)
  const handleToggleBanish = async (speciesId: string) => {
    if (!isOwner) return;
    const isBanished = room.banishedSpeciesIds.includes(speciesId);
    sound.playClickSound();

    const newBanished = isBanished
      ? room.banishedSpeciesIds.filter((id) => id !== speciesId)
      : [...room.banishedSpeciesIds, speciesId];

    const updatedRoom: OnlineRoom = {
      ...room,
      banishedSpeciesIds: newBanished,
      updatedAt: Date.now(),
    };

    setRoom(updatedRoom);
    onlineNetwork.broadcastLocal('ROOM_UPDATED', updatedRoom);
    onlineNetwork.updateBanished(room.id, speciesId, !isBanished, currentUser || room.hostUsername, updatedRoom);
  };

  // Send chat
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawText = chatInput.trim();
    if (!rawText) return;
    const text = filterProfanity(rawText);
    setChatInput('');

    // Optimistic local update
    const optMsg = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: currentUser || 'Player',
      text,
      timestamp: Date.now(),
    };
    const updatedRoom: OnlineRoom = {
      ...room,
      chatMessages: [...room.chatMessages, optMsg],
      updatedAt: Date.now(),
    };
    setRoom(updatedRoom);
    onlineNetwork.cachedRooms.set(room.id, updatedRoom);
    onlineNetwork.broadcastLocal('ROOM_UPDATED', updatedRoom);

    const updated = await onlineNetwork.sendChat(room.id, currentUser || 'Player', text, updatedRoom);
    if (updated) setRoom(updated);
  };

  // Toggle open lobby to random humans (Room stays private until pressed!)
  const handleToggleOpenToRandom = async () => {
    if (!isOwner) return;
    sound.playClickSound();

    const nextState = !room.isOpenToRandom;
    const updatedRoom: OnlineRoom = {
      ...room,
      isOpenToRandom: nextState,
      chatMessages: [
        ...room.chatMessages,
        {
          id: `msg_${Date.now()}`,
          sender: 'SYSTEM',
          text: nextState
            ? '🌐 Room was opened to public matchmaking for random humans!'
            : '🔒 Room is now private (invite & bots only).',
          timestamp: Date.now(),
          isSystem: true,
        },
      ],
      updatedAt: Date.now(),
    };

    setRoom(updatedRoom);
    onlineNetwork.cachedRooms.set(room.id, updatedRoom);
    onlineNetwork.broadcastLocal('ROOM_UPDATED', updatedRoom);
    onlineNetwork.toggleOpenToRandom(room.id, nextState, currentUser || room.hostUsername, updatedRoom);
  };

  // Start Online Draft (Owner only)
  const handleStartDraft = async () => {
    if (!isOwner) return;

    // Collect all players (Host + filled active slots up to battle size)
    const maxActive = (room.maxPlayers || 2) - 1;
    const activeSlots = room.slots.slice(0, maxActive).filter((s) => s.type !== 'none' && s.player);
    if (activeSlots.length === 0) {
      setErrorBanner('Need at least 1 other player (human or bot) in an active slot to start!');
      setTimeout(() => setErrorBanner(null), 3500);
      return;
    }

    const playerNames = [
      room.hostUsername,
      ...activeSlots.map((s) => s.player!.username),
    ];

    sound.playRewardSound();
    await onlineNetwork.syncGameAction(room.id, 'draft', { playerNames }, room);
    onLaunchOnlineDraft(playerNames.length, playerNames, room.banishedSpeciesIds);
  };

  const slotLabels: Record<SlotType, { label: string; badge: string; color: string }> = {
    none: { label: 'None (Closed)', badge: '🚫 CLOSED', color: 'bg-slate-800 text-slate-500 border-slate-700' },
    invite: { label: 'Invite Player', badge: '✉️ INVITE', color: 'bg-amber-950/80 text-amber-300 border-amber-600' },
    random: { label: 'Random Human', badge: '🌐 QUEUE MATCH', color: 'bg-cyan-950/80 text-cyan-300 border-cyan-600' },
    bot: { label: 'Bot (AI)', badge: '🤖 BOT AI', color: 'bg-purple-950/80 text-purple-300 border-purple-600' },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-3 md:p-6 flex flex-col justify-between">
      {/* Top Header */}
      <header className="flex items-center justify-between bg-slate-900 border-2 border-slate-800 p-3 rounded-2xl mb-4 shadow-xl flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClickSound();
              onLeaveRoom();
            }}
            className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-600 cursor-pointer"
          >
            ⬅️ LEAVE
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-pixel text-xs md:text-sm text-yellow-400 font-bold tracking-wider">
                ONLINE ROOM:
              </span>
              {/* Streamer Mode Masked Code: Click to reveal */}
              <button
                type="button"
                onClick={() => {
                  sound.playClickSound();
                  setShowRoomCode((prev) => !prev);
                }}
                className="font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-700 hover:border-yellow-400 text-yellow-300 cursor-pointer transition-all text-xs tracking-wider select-none"
                title="Click to reveal or hide room code (Streamer Protection Mode)"
              >
                {showRoomCode ? room.id : '•••••••• (CLICK TO REVEAL)'}
              </button>
              <span className="font-mono text-[10px] bg-indigo-900/80 border border-indigo-500 text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase">
                {room.region}
              </span>
              {isSpectator && (
                <span className="font-pixel text-[9px] bg-purple-900/80 border border-purple-400 text-purple-200 px-2 py-0.5 rounded-full font-bold">
                  👁️ SPECTATOR MODE
                </span>
              )}
            </div>
            <p className="font-pixel text-[10px] text-slate-400 mt-0.5">
              Host: <span className="text-amber-400">@{room.hostUsername}</span> (MMR: {room.hostSkillRating})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-pixel text-[11px] bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            You: <span className="text-yellow-300 font-bold">@{currentUser}</span> ({userSkillRating} MMR)
          </div>

          {/* Battle Size Toggle: 2, 3, or 4 Players */}
          {isOwner && (
            <button
              onClick={handleToggleBattleSize}
              className="font-pixel text-[10px] bg-purple-950/90 hover:bg-purple-900 border-2 border-purple-400 text-purple-200 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow"
              title="Click to toggle how many players fight at once (2, 3, or 4)"
            >
              <span>👥</span>
              <span>BATTLE SIZE: {room.maxPlayers || 2} PLAYERS</span>
            </button>
          )}

          {/* Privacy Toggle Button: Rooms stay private until pressed! */}
          {isOwner && (
            <button
              onClick={handleToggleOpenToRandom}
              className={`font-pixel text-[10px] px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                room.isOpenToRandom
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-md ring-1 ring-cyan-400/40'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Click to toggle whether random humans can be matched into this room"
            >
              <span>{room.isOpenToRandom ? '🌐' : '🔒'}</span>
              <span>{room.isOpenToRandom ? 'OPEN TO RANDOM HUMANS' : 'ROOM PRIVATE (CLICK TO OPEN)'}</span>
            </button>
          )}

          {isOwner && (
            <button
              onClick={handleStartDraft}
              className="font-pixel text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 px-4 rounded-xl border-2 border-emerald-400 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>🎯</span>
              <span>START DRAFT</span>
            </button>
          )}
        </div>
      </header>

      {errorBanner && (
        <div className="bg-red-950 border border-red-500 text-red-200 font-pixel text-xs p-2.5 rounded-xl text-center mb-3 animate-bounce">
          {errorBanner}
        </div>
      )}

      {/* Main Grid: Slots & Banishment on Left/Center, Chat on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 mb-4">
        {/* Left 2 Cols: Player Slots & Banishment */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Player Slots */}
          <div className="bg-slate-900 border-2 border-slate-800 p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-pixel text-sm text-yellow-300 font-bold flex items-center gap-2">
                <span>👥 PLAYER SLOTS (2-4 PLAYERS)</span>
              </h2>
              {isOwner ? (
                <span className="font-pixel text-[10px] text-amber-400">
                  👑 You are Owner. Click slot buttons to cycle: None ➔ Invite ➔ Random ➔ Bot
                </span>
              ) : (
                <span className="font-pixel text-[10px] text-slate-400">
                  Waiting for room owner to start...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Host Slot (Player 1) */}
              <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 border-2 border-amber-500/80 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">👑</span>
                  <div>
                    <div className="font-pixel text-xs text-yellow-300 font-bold">
                      @{room.hostUsername}
                    </div>
                    <div className="font-pixel text-[9px] text-amber-400">
                      HOST / PLAYER 1 (MMR: {room.hostSkillRating})
                    </div>
                  </div>
                </div>
                <span className="font-pixel text-[9px] bg-emerald-950 border border-emerald-600 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                  READY
                </span>
              </div>

              {/* 3 Configurable Slots (Player 2, 3, 4) */}
              {room.slots.map((slot, idx) => {
                const pNum = idx + 2;
                const maxAllowed = room.maxPlayers || 2;
                const isSlotActive = pNum <= maxAllowed;
                const slotInfo = slotLabels[slot.type];

                if (!isSlotActive) {
                  return (
                    <div
                      key={idx}
                      className="border-2 border-slate-800 bg-slate-950/40 p-3.5 rounded-xl flex flex-col justify-between opacity-50 select-none"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-pixel text-[11px] font-bold text-slate-500">
                          SLOT #{pNum}
                        </span>
                        <span className="font-pixel text-[9px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded border border-slate-800">
                          🔒 INACTIVE
                        </span>
                      </div>
                      <div className="font-pixel text-[10px] text-slate-500 text-center py-4">
                        Increase Battle Size to {pNum} Players to activate Slot #{pNum}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`border-2 p-3.5 rounded-xl flex flex-col justify-between transition-all ${slotInfo.color}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-pixel text-[11px] font-bold text-white">
                          SLOT #{pNum}
                        </span>
                        <span className="font-pixel text-[9px] bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                          {slotInfo.badge}
                        </span>
                      </div>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleRotateSlot(idx)}
                          className="font-pixel text-[10px] bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg border-2 border-yellow-300 shadow cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                          title="Click to cycle: None ➔ Invite ➔ Random human ➔ Bot"
                        >
                          <span>🔄</span>
                          <span>ROTATE</span>
                        </button>
                      )}
                    </div>

                    {/* Mode Cycler / Quick Selector */}
                    <div className="grid grid-cols-4 gap-1.5 my-2">
                      {(['none', 'invite', 'random', 'bot'] as SlotType[]).map((mode) => {
                        const isSelected = slot.type === mode;
                        const modeLabels: Record<SlotType, { short: string; icon: string }> = {
                          none: { short: 'None', icon: '🚫' },
                          invite: { short: 'Invite', icon: '✉️' },
                          random: { short: 'Random', icon: '🌐' },
                          bot: { short: 'Bot', icon: '🤖' },
                        };
                        const info = modeLabels[mode];
                        return (
                          <button
                            key={mode}
                            type="button"
                            disabled={!isOwner}
                            onClick={() => handleRotateSlot(idx, mode)}
                            className={`font-pixel text-[9px] py-1.5 px-1 rounded-md flex items-center justify-center gap-1 transition-all ${
                              isSelected
                                ? 'bg-yellow-400 text-slate-950 font-bold ring-2 ring-yellow-200 shadow-md scale-105'
                                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                            } ${isOwner ? 'cursor-pointer hover:border-yellow-400' : 'cursor-default opacity-80'}`}
                            title={`Set Slot #${pNum} to ${info.short}`}
                          >
                            <span>{info.icon}</span>
                            <span>{info.short}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Slot Content based on Mode */}
                    {slot.type === 'none' && (
                      <div className="font-pixel text-xs text-slate-500 py-1.5 bg-slate-950/40 rounded p-2 text-center">
                        🚫 Slot Closed (2 or 3 Player Game)
                      </div>
                    )}

                    {slot.type === 'random' && (
                      <div className="font-pixel text-xs text-cyan-300 py-1 bg-cyan-950/40 rounded p-2">
                        {slot.player ? (
                          <div className="flex items-center justify-between">
                            <span className="font-bold">@{slot.player.username}</span>
                            <span className="text-[9px] bg-cyan-900/60 border border-cyan-500 px-2 py-0.5 rounded-full font-bold">
                              MMR: {slot.player.skillRating}
                            </span>
                          </div>
                        ) : (
                          <div className="animate-pulse flex items-center justify-center gap-2 text-[10px]">
                            <span>🌐</span>
                            <span>Searching for Skill-Matched Human...</span>
                          </div>
                        )}
                      </div>
                    )}

                    {slot.type === 'bot' && (
                      <div className="font-pixel text-xs text-purple-300 py-1 bg-purple-950/40 rounded p-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span>🤖</span>
                          <span className="font-bold">{slot.player?.username || `Bot ${pNum}`}</span>
                        </div>
                        <span className="text-[9px] bg-purple-900/60 border border-purple-500 px-2 py-0.5 rounded-full font-bold">
                          AI READY
                        </span>
                      </div>
                    )}

                    {slot.type === 'invite' && (
                      <div className="py-1 bg-amber-950/30 rounded p-2">
                        {slot.player ? (
                          <div className="font-pixel text-xs text-emerald-300 font-bold flex items-center justify-between">
                            <span>@{slot.player.username} (Joined)</span>
                            <span className="text-[9px] bg-emerald-950 border border-emerald-600 px-2 py-0.5 rounded-full">
                              READY
                            </span>
                          </div>
                        ) : slot.invitedUsername ? (
                          <div className="font-pixel text-xs text-amber-300 flex items-center justify-between">
                            <span>Invited: @{slot.invitedUsername}</span>
                            <span className="text-[9px] text-amber-400 animate-pulse">Pending...</span>
                          </div>
                        ) : isOwner ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <input
                              type="text"
                              placeholder="Type username to invite..."
                              value={inviteInputs[idx] || ''}
                              onChange={(e) => setInviteInputs({ ...inviteInputs, [idx]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendInvite(idx);
                              }}
                              className="font-pixel text-xs bg-slate-950 border border-slate-700 px-2 py-1.5 rounded text-white flex-1 focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                            />
                            <button
                              onClick={() => handleSendInvite(idx)}
                              className="font-pixel text-[10px] bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg border border-yellow-400 cursor-pointer transition-all hover:scale-105 active:scale-95"
                            >
                              ✉️ INVITE
                            </button>
                          </div>
                        ) : (
                          <div className="font-pixel text-xs text-slate-400">Waiting for host invite...</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Banishment Tray (Owner ONLY can modify) */}
          <div className="bg-slate-900 border-2 border-slate-800 p-4 rounded-2xl shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-pixel text-xs text-yellow-300 font-bold flex items-center gap-1.5">
                <span>🚫 BANISHED STUFFIES ({room.banishedSpeciesIds.length})</span>
                {isOwner && <span className="text-amber-400 text-[10px]">(Owner Control Enabled)</span>}
              </h3>
              <span className="font-pixel text-[9px] text-slate-400">
                {isOwner ? 'Click any stuffy to banish or unbanish' : '🔒 Controlled only by Room Owner'}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              {PLAYABLE_STUFFIES.map((sp) => {
                const isBanished = room.banishedSpeciesIds.includes(sp.id);
                return (
                  <div
                    key={sp.id}
                    onClick={() => handleToggleBanish(sp.id)}
                    className={`p-1 rounded-lg border flex flex-col items-center text-center transition-all ${
                      isOwner ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-not-allowed opacity-80'
                    } ${
                      isBanished
                        ? 'bg-red-950/80 border-red-500 opacity-60'
                        : 'bg-slate-900 border-slate-700 hover:border-yellow-400'
                    }`}
                    title={isOwner ? `Click to ${isBanished ? 'unbanish' : 'banish'} ${sp.name}` : `${sp.name}`}
                  >
                    <div className="w-8 h-8 relative">
                      <StuffySprite
                        stuffy={{
                          instanceId: `banish_${sp.id}`,
                          speciesId: sp.id,
                          name: sp.name,
                          maxHp: sp.baseHp,
                          currentHp: sp.baseHp,
                          shield: 0,
                          isUnstuffed: false,
                          statusEffects: [],
                        }}
                        size={32}
                      />
                      {isBanished && (
                        <div className="absolute inset-0 flex items-center justify-center font-pixel text-red-500 text-lg font-bold">
                          ✕
                        </div>
                      )}
                    </div>
                    <span className="font-pixel text-[8px] text-slate-300 truncate w-full mt-0.5">
                      {sp.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Live Room Chat */}
        <div className="bg-slate-900 border-2 border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col h-[520px]">
          <h3 className="font-pixel text-xs text-yellow-300 font-bold mb-2 flex items-center justify-between">
            <span>💬 ROOM CHAT</span>
            <span className="font-mono text-[10px] text-slate-400">{room.chatMessages.length} msgs</span>
          </h3>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-2 font-mono text-xs mb-3">
            {room.chatMessages.map((msg) => {
              const isMe = msg.sender.toLowerCase() === currentUser.toLowerCase();
              const isSys = msg.isSystem;
              return (
                <div
                  key={msg.id}
                  className={`p-1.5 rounded-lg max-w-[90%] ${
                    isSys
                      ? 'bg-indigo-950/70 border border-indigo-700/60 text-indigo-300 text-[10px] mx-auto text-center'
                      : isMe
                      ? 'bg-amber-950/80 border border-amber-600/80 text-amber-200 self-end text-right'
                      : 'bg-slate-800 border border-slate-700 text-slate-200 self-start text-left'
                  }`}
                >
                  {!isSys && (
                    <div className="font-pixel text-[8px] text-slate-400 font-bold mb-0.5">
                      @{msg.sender}
                    </div>
                  )}
                  <div>{msg.text}</div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              placeholder="Type message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 font-mono text-xs bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white focus:outline-none focus:border-yellow-400"
            />
            <button
              type="submit"
              className="font-pixel text-xs bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-3 py-2 rounded-xl border border-yellow-300 cursor-pointer shadow transition-all hover:scale-105 active:scale-95"
            >
              SEND
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
