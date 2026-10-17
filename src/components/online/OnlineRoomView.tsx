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

interface OnlineRoomViewProps {
  initialRoom: OnlineRoom;
  currentUser: string;
  userSkillRating: number;
  onLeaveRoom: () => void;
  onLaunchOnlineGame: (players: MultiplayerPlayerData[], banishedSpecies: string[]) => void;
}

export const OnlineRoomView: React.FC<OnlineRoomViewProps> = ({
  initialRoom,
  currentUser,
  userSkillRating,
  onLeaveRoom,
  onLaunchOnlineGame,
}) => {
  const [room, setRoom] = useState<OnlineRoom>(initialRoom);
  const [chatInput, setChatInput] = useState('');
  const [inviteInputs, setInviteInputs] = useState<Record<number, string>>({});
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const isOwner = room.hostUsername.toLowerCase() === currentUser.toLowerCase();

  // Poll room updates
  useEffect(() => {
    onlineNetwork.startRoomPolling(room.id, (updatedRoom) => {
      setRoom(updatedRoom);
      // Auto-trigger game launch if host started it
      if (updatedRoom.status === 'battle' && updatedRoom.gameState?.players) {
        onLaunchOnlineGame(updatedRoom.gameState.players, updatedRoom.banishedSpeciesIds);
      }
    });

    return () => {
      onlineNetwork.stopRoomPolling();
    };
  }, [room.id, onLaunchOnlineGame]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room.chatMessages]);

  // Rotate a slot (Owner only): None -> Invite -> Random human -> Bot -> None
  const handleRotateSlot = async (slotIdx: number) => {
    if (!isOwner) return;
    sound.playClickSound();
    const updated = await onlineNetwork.rotateSlot(room.id, slotIdx, currentUser);
    if (updated) setRoom(updated);
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
    const updated = await onlineNetwork.sendInvite(room.id, slotIdx, targetUser, currentUser);
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
    const updated = await onlineNetwork.updateBanished(room.id, speciesId, !isBanished, currentUser);
    if (updated) setRoom(updated);
  };

  // Send chat
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    const updated = await onlineNetwork.sendChat(room.id, currentUser, text);
    if (updated) setRoom(updated);
  };

  // Start Online Match (Owner only)
  const handleStartMatch = async () => {
    if (!isOwner) return;

    // Collect all players (Host + filled slots)
    const activeSlots = room.slots.filter((s) => s.type !== 'none' && s.player);
    if (activeSlots.length === 0) {
      setErrorBanner('Need at least 1 other player (human or bot) to start!');
      setTimeout(() => setErrorBanner(null), 3500);
      return;
    }

    // Build MultiplayerPlayerData
    const allPlayersData: MultiplayerPlayerData[] = [];

    // Host is Player 1
    const hostTeam: StuffyState[] = [];
    const available = PLAYABLE_STUFFIES.filter((s) => !room.banishedSpeciesIds.includes(s.id));
    const hostPicks = available.slice(0, 4);
    hostPicks.forEach((sp, idx) => {
      const loadouts = getLoadoutsForStuffy(sp.id);
      hostTeam.push({
        instanceId: `p1_${sp.id}_${idx}`,
        speciesId: sp.id,
        name: sp.name,
        maxHp: sp.baseHp,
        currentHp: sp.baseHp,
        shield: 0,
        isUnstuffed: false,
        statusEffects: [],
        selectedLoadoutId: loadouts[0]?.id || `${sp.id}_pkg_1`,
      });
    });

    // Build host deck
    const hostDeck: Card[] = [];
    hostPicks.forEach((sp) => {
      const loadouts = getLoadoutsForStuffy(sp.id);
      loadouts[0]?.cardIds.forEach((cId) => {
        const c = CARD_MAP.get(cId);
        if (c) hostDeck.push({ ...c });
      });
    });
    PLAYER_POWERUP_CARDS.forEach((c) => hostDeck.push({ ...c }));

    allPlayersData.push({
      id: 'p1',
      name: `${room.hostUsername} (P1)`,
      color: '#3b82f6',
      team: hostTeam,
      bench: [],
      deck: hostDeck,
      hand: [],
      discard: [],
      isEliminated: false,
      isBot: false,
    });

    // Slots 2, 3, 4
    activeSlots.forEach((slot, sIdx) => {
      const pIdx = sIdx + 2;
      const pSide = `p${pIdx}` as PlayerSide;
      const pTeam: StuffyState[] = [];
      const offset = (sIdx + 1) * 4;
      const pPicks = available.slice(offset, offset + 4);
      const pDeck: Card[] = [];

      pPicks.forEach((sp, idx) => {
        const loadouts = getLoadoutsForStuffy(sp.id);
        pTeam.push({
          instanceId: `${pSide}_${sp.id}_${idx}`,
          speciesId: sp.id,
          name: sp.name,
          maxHp: sp.baseHp,
          currentHp: sp.baseHp,
          shield: 0,
          isUnstuffed: false,
          statusEffects: [],
          selectedLoadoutId: loadouts[0]?.id || `${sp.id}_pkg_1`,
        });
        loadouts[0]?.cardIds.forEach((cId) => {
          const c = CARD_MAP.get(cId);
          if (c) pDeck.push({ ...c });
        });
      });
      PLAYER_POWERUP_CARDS.forEach((c) => pDeck.push({ ...c }));

      const playerColors = ['#ef4444', '#10b981', '#f59e0b'];

      allPlayersData.push({
        id: pSide,
        name: `${slot.player!.username} (${pSide.toUpperCase()})`,
        color: playerColors[sIdx] || '#8b5cf6',
        team: pTeam,
        bench: [],
        deck: pDeck,
        hand: [],
        discard: [],
        isEliminated: false,
        isBot: slot.player!.isBot,
      });
    });

    sound.playRewardSound();
    await onlineNetwork.syncGameAction(room.id, 'battle', { players: allPlayersData });
    onLaunchOnlineGame(allPlayersData, room.banishedSpeciesIds);
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
            <div className="flex items-center gap-2">
              <h1 className="font-pixel text-base md:text-lg text-yellow-400 font-bold tracking-wider">
                ONLINE ROOM: {room.id}
              </h1>
              <span className="font-mono text-[10px] bg-indigo-900/80 border border-indigo-500 text-indigo-300 px-2 py-0.5 rounded-full font-bold uppercase">
                {room.region}
              </span>
            </div>
            <p className="font-pixel text-[10px] text-slate-400">
              Host: <span className="text-amber-400">@{room.hostUsername}</span> (MMR: {room.hostSkillRating})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="font-pixel text-[11px] bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            You: <span className="text-yellow-300 font-bold">@{currentUser}</span> ({userSkillRating} MMR)
          </div>
          {isOwner && (
            <button
              onClick={handleStartMatch}
              className="font-pixel text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2 px-4 rounded-xl border-2 border-emerald-400 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              🚀 START MATCH
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
                const slotInfo = slotLabels[slot.type];
                return (
                  <div
                    key={idx}
                    className={`border-2 p-3 rounded-xl flex flex-col justify-between transition-all ${slotInfo.color}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-pixel text-[10px] font-bold">
                        SLOT #{pNum}: {slotInfo.label}
                      </span>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleRotateSlot(idx)}
                          className="font-pixel text-[9px] bg-slate-800 hover:bg-slate-700 text-yellow-300 px-2 py-1 rounded border border-slate-600 cursor-pointer transition-all hover:scale-105 active:scale-95"
                          title="Click to cycle between None, Invite, Random human, and Bot"
                        >
                          🔄 ROTATE
                        </button>
                      )}
                    </div>

                    {/* Slot Content based on Mode */}
                    {slot.type === 'none' && (
                      <div className="font-pixel text-xs text-slate-500 py-2">
                        Slot Closed (3 or 2 Player Mode)
                      </div>
                    )}

                    {slot.type === 'random' && (
                      <div className="font-pixel text-xs text-cyan-300 py-1">
                        {slot.player ? (
                          <div className="flex items-center justify-between">
                            <span className="font-bold">@{slot.player.username}</span>
                            <span className="text-[9px] text-cyan-400">MMR: {slot.player.skillRating}</span>
                          </div>
                        ) : (
                          <div className="animate-pulse flex items-center gap-1.5 text-[11px]">
                            <span>🌐</span>
                            <span>Searching for Skill-Matched Human...</span>
                          </div>
                        )}
                      </div>
                    )}

                    {slot.type === 'bot' && (
                      <div className="font-pixel text-xs text-purple-300 py-1 flex items-center justify-between">
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
                      <div className="py-1">
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
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="text"
                              placeholder="Type username..."
                              value={inviteInputs[idx] || ''}
                              onChange={(e) => setInviteInputs({ ...inviteInputs, [idx]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendInvite(idx);
                              }}
                              className="font-pixel text-xs bg-slate-950 border border-slate-700 px-2 py-1 rounded text-white flex-1 focus:outline-none focus:border-amber-400"
                            />
                            <button
                              onClick={() => handleSendInvite(idx)}
                              className="font-pixel text-[10px] bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded cursor-pointer"
                            >
                              SEND
                            </button>
                          </div>
                        ) : (
                          <div className="font-pixel text-xs text-slate-400">Waiting for invite...</div>
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
