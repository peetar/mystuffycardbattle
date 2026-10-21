'use client';

import React, { useState, useEffect, useRef } from 'react';
import { onlineNetwork } from '@/utils/onlineNetwork';
import { sound } from '@/utils/audio';
import { OnlineRoom } from '@/app/api/online/route';
import { friendsManager, FriendProfile, formatLastActive } from '@/utils/friends';

interface OnlineLobbyModalProps {
  currentUser: string;
  userSkillRating: number;
  isOpen: boolean;
  onClose: () => void;
  onEnterRoom: (room: OnlineRoom) => void;
  onOpenFriendsModal?: () => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  currentUser,
  userSkillRating,
  isOpen,
  onClose,
  onEnterRoom,
  onOpenFriendsModal,
}) => {
  const [rotationTab, setRotationTab] = useState<'matchmaking' | 'friends'>('matchmaking');
  const [friendsList, setFriendsList] = useState<FriendProfile[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendProfile | null>(null);
  const [friendTurnTimer, setFriendTurnTimer] = useState<number>(60);
  const [selectedRegion, setSelectedRegion] = useState<string>('us-east');
  const [isSearching, setIsSearching] = useState(false);
  const [queueElapsedSec, setQueueElapsedSec] = useState(0);
  const [queueCount, setQueueCount] = useState(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isJoiningCode, setIsJoiningCode] = useState(false);
  const [openRooms, setOpenRooms] = useState<any[]>([]);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const regions = [
    { id: 'us-east', name: 'US-East (N. Virginia)', flag: '🇺🇸' },
    { id: 'us-west', name: 'US-West (Oregon)', flag: '🇺🇸' },
    { id: 'eu', name: 'Europe (Frankfurt)', flag: '🇪🇺' },
    { id: 'asia', name: 'Asia (Tokyo)', flag: '🇯🇵' },
    { id: 'global', name: 'Global (All Regions)', flag: '🌐' },
  ];

  // Refresh open rooms list on modal open
  useEffect(() => {
    if (!isOpen) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setIsSearching(false);
      return;
    }

    setFriendsList(friendsManager.getFriends(currentUser));
    friendsManager.syncWithServer(currentUser).then((res) => {
      setFriendsList(res.friends);
    });

    const fetchRooms = async () => {
      const list = await onlineNetwork.listOpenRooms();
      setOpenRooms(list);
    };
    fetchRooms();
    const interval = setInterval(() => {
      fetchRooms();
      friendsManager.syncWithServer(currentUser).then((res) => {
        setFriendsList(res.friends);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen, currentUser]);

  // Clean up queue polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleChallengeFriend = async (friend: FriendProfile, mode: 'duel' | 'draft') => {
    sound.playRewardSound();
    setStatusMessage(`Creating room to challenge @${friend.username}...`);
    const room = await onlineNetwork.createRoom(currentUser, userSkillRating, selectedRegion);
    if (room) {
      await onlineNetwork.sendInvite(room.id, 0, friend.username, currentUser);
      onEnterRoom(room);
    } else {
      setStatusMessage('Failed to create challenge room.');
    }
  };

  // 1. Create Custom Room
  const handleCreateRoom = async () => {
    sound.playRewardSound();
    setStatusMessage('Creating online room...');
    const room = await onlineNetwork.createRoom(currentUser, userSkillRating, selectedRegion);
    if (room) {
      onEnterRoom(room);
    } else {
      setStatusMessage('Failed to create room. Please try again.');
    }
  };

  // 2. Join via Room Code
  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;

    setIsJoiningCode(true);
    setStatusMessage(null);
    sound.playClickSound();

    const res = await onlineNetwork.joinRoomByCode(roomCodeInput.trim(), currentUser, userSkillRating);
    setIsJoiningCode(false);

    if (res.success && res.room) {
      sound.playRewardSound();
      onEnterRoom(res.room);
    } else {
      setStatusMessage(res.error || 'Could not join room. Verify the room code and try again.');
    }
  };

  // 3. Queue for Match (Skill Rating MMR ±500, up to 4 players)
  const handleQueueMatch = async () => {
    setIsSearching(true);
    setQueueElapsedSec(0);
    sound.playEnergyChargeSound();
    setStatusMessage(null);

    const initialRes = await onlineNetwork.queueMatch(currentUser, userSkillRating, selectedRegion);
    if (initialRes.success && initialRes.matched && initialRes.room) {
      sound.playRewardSound();
      setIsSearching(false);
      onEnterRoom(initialRes.room);
      return;
    }

    if (initialRes.queueCount) {
      setQueueCount(initialRes.queueCount);
    }

    // Start elapsed timer
    timerIntervalRef.current = setInterval(() => {
      setQueueElapsedSec((prev) => prev + 1);
    }, 1000);

    // Poll queue status every 1.5 seconds
    pollIntervalRef.current = setInterval(async () => {
      const pollRes = await onlineNetwork.pollMatchQueue(currentUser, userSkillRating, selectedRegion);
      if (pollRes.success && pollRes.matched && pollRes.room) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        sound.playRewardSound();
        setIsSearching(false);
        onEnterRoom(pollRes.room);
      } else if (pollRes.queueCount !== undefined) {
        setQueueCount(pollRes.queueCount);
      }
    }, 1500);
  };

  // Cancel Matchmaking Queue
  const handleCancelQueue = async () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsSearching(false);
    setStatusMessage('Left matchmaking queue.');
    await onlineNetwork.leaveMatchQueue(currentUser);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <div className="bg-slate-900 border-4 border-cyan-500 max-w-xl w-full rounded-2xl p-5 shadow-2xl relative flex flex-col gap-4 text-center my-auto max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClickSound();
            if (isSearching) handleCancelQueue();
            onClose();
          }}
          className="absolute top-3 right-3 text-slate-400 hover:text-white font-pixel text-base cursor-pointer"
        >
          ✕
        </button>

        <div>
          <h2 className="font-pixel text-xl text-cyan-400 font-bold tracking-wider flex items-center justify-center gap-2">
            <span>🌐</span>
            <span>ONLINE MULTIPLAYER</span>
          </h2>
          <p className="font-pixel text-[10px] text-slate-400 mt-1">
            Skill matchmaking (MMR ±500, up to 4 players), direct room codes, and custom lobbies!
          </p>
        </div>

        {/* Player Profile & MMR Badge */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="text-left">
            <span className="font-pixel text-[9px] text-slate-400">PLAYER USERNAME</span>
            <div className="font-pixel text-sm text-yellow-300 font-bold">@{currentUser}</div>
          </div>
          <div className="text-right">
            <span className="font-pixel text-[9px] text-slate-400">SKILL LEVEL (MMR)</span>
            <div className="font-pixel text-sm text-cyan-300 font-bold">⭐ {userSkillRating} MMR</div>
          </div>
        </div>

        {/* ROTATION SELECTOR: MATCHMAKING VS FRIENDS */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              sound.playClickSound();
              setRotationTab('matchmaking');
            }}
            className={`font-pixel text-xs py-2 px-3 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              rotationTab === 'matchmaking'
                ? 'bg-cyan-600 text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎯 MATCHMAKING</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClickSound();
              setRotationTab('friends');
            }}
            className={`font-pixel text-xs py-2 px-3 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
              rotationTab === 'friends'
                ? 'bg-indigo-600 text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👥 FRIENDS ({friendsList.length})</span>
          </button>
        </div>

        {/* ROTATION VIEW: FRIENDS TAB */}
        {rotationTab === 'friends' ? (
          <div className="flex flex-col gap-3 text-left">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-indigo-300 font-bold">
                👥 YOUR FRIENDS (SELECT ONE TO CHALLENGE):
              </span>
              {onOpenFriendsModal && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClickSound();
                    onOpenFriendsModal();
                  }}
                  className="font-pixel text-[9px] text-yellow-300 hover:underline cursor-pointer"
                >
                  MANAGE / ADD FRIENDS ➔
                </button>
              )}
            </div>

            {friendsList.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center font-pixel text-xs text-slate-500">
                You have no friends yet. Use the Friends menu to add other plush trainers!
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto no-scrollbar">
                {friendsList.map((f) => {
                  const note = friendsManager.getFriendNote(f.username);
                  return (
                    <div
                      key={f.username}
                      onClick={() => {
                        sound.playClickSound();
                        setSelectedFriend(f);
                      }}
                      className={`bg-slate-950 border p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        selectedFriend?.username === f.username
                          ? 'border-indigo-400 ring-2 ring-indigo-400/50 scale-[1.01]'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="font-pixel text-left">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              f.status === 'online'
                                ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                                : f.status === 'in_game'
                                ? 'bg-amber-400'
                                : 'bg-slate-600'
                            }`}
                          />
                          {note.nickname ? (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm text-yellow-300 font-bold">✨ {note.nickname}</span>
                              <span className="text-[10px] text-slate-400">(@{f.username})</span>
                            </div>
                          ) : (
                            <span className="text-sm text-yellow-300 font-bold">@{f.username}</span>
                          )}
                          <span className="text-[9px] text-cyan-300">⭐ {f.skillRating} MMR</span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 ml-4 flex items-center gap-2">
                          <span>
                            Status: <strong className="text-slate-300">{formatLastActive(f.lastActive)}</strong>
                          </span>
                          {note.note && (
                            <span className="text-[8px] bg-slate-900 border border-slate-700 text-amber-300 px-1.5 py-0.5 rounded italic">
                              "{note.note}"
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="font-pixel text-[10px] text-indigo-400 font-bold">
                        {selectedFriend?.username === f.username ? 'SELECTED ✓' : 'SELECT ➔'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* If a friend is selected, give challenge choices (Duel or Draft) */}
            {selectedFriend && (
              <div className="bg-slate-950 border-2 border-yellow-500/80 p-3 rounded-xl flex flex-col gap-2 text-center animate-fade-in">
                <span className="font-pixel text-xs text-yellow-300 font-bold">
                  CHALLENGE @{selectedFriend.username}:
                </span>

                {/* Turn Timer Pills */}
                <div className="flex flex-col gap-1 text-left bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="font-pixel text-[9px] text-amber-300 font-bold">
                    ⏱️ TURN TIMER:
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { label: '30s', val: 30 },
                      { label: '60s', val: 60 },
                      { label: '90s', val: 90 },
                      { label: 'Unlimited', val: 0 },
                    ].map((t) => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => {
                          sound.playClickSound();
                          setFriendTurnTimer(t.val);
                        }}
                        className={`font-pixel text-[8px] py-1 rounded border cursor-pointer transition-all ${
                          friendTurnTimer === t.val
                            ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                            : 'bg-slate-950 text-slate-400 border-slate-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleChallengeFriend(selectedFriend, 'duel')}
                    className="font-pixel text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-lg border border-emerald-400 cursor-pointer shadow hover:scale-105 active:scale-95 transition-all"
                  >
                    ⚔️ DUEL (1v1)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChallengeFriend(selectedFriend, 'draft')}
                    className="font-pixel text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-3 rounded-lg border border-indigo-400 cursor-pointer shadow hover:scale-105 active:scale-95 transition-all"
                  >
                    👑 DRAFT (5 Stuffies)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ROTATION VIEW: MATCHMAKING TAB */
          isSearching ? (
          <div className="bg-slate-950 border-2 border-cyan-400 p-6 rounded-2xl flex flex-col items-center gap-3 animate-pulse">
            <span className="text-4xl animate-spin">🎯</span>
            <h3 className="font-pixel text-sm text-cyan-300 font-bold">
              SEARCHING MATCH IN {selectedRegion.toUpperCase()}...
            </h3>
            <p className="font-pixel text-[10px] text-slate-300">
              Matching MMR window: <span className="text-yellow-400 font-bold">{Math.max(0, userSkillRating - 500)} – {userSkillRating + 500}</span>
            </p>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>⏳ {queueElapsedSec}s elapsed</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">👥 {queueCount} player{queueCount === 1 ? '' : 's'} in queue</span>
            </div>
            <p className="font-pixel text-[8px] text-slate-400 max-w-sm">
              If 4 players fit the parameters, a 4-player game launches with a random host. If 2+ players wait 20s, match begins!
            </p>
            <button
              onClick={handleCancelQueue}
              className="mt-2 font-pixel text-xs bg-red-900 hover:bg-red-800 text-red-200 px-5 py-2 rounded-xl border border-red-500 cursor-pointer shadow hover:scale-105 active:scale-95 transition-all"
            >
              CANCEL QUEUE ✕
            </button>
          </div>
        ) : (
          <>
            {/* Region Selector */}
            <div className="text-left">
              <label className="font-pixel text-xs text-slate-300 font-bold mb-1.5 block">
                📍 SELECT YOUR REGION:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {regions.map((reg) => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => {
                      sound.playClickSound();
                      setSelectedRegion(reg.id);
                    }}
                    className={`font-pixel text-[10px] p-2 rounded-xl border text-left flex items-center gap-1.5 cursor-pointer transition-all ${
                      selectedRegion === reg.id
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span>{reg.flag}</span>
                    <span className="truncate">{reg.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Join via Room Code */}
            <form onSubmit={handleJoinByCode} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-col gap-2 text-left">
              <label className="font-pixel text-[10px] text-amber-300 font-bold flex items-center gap-1">
                <span>🔑</span>
                <span>JOIN PRIVATE ROOM BY CODE:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. ROOM-1234"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 font-pixel text-xs text-yellow-300 uppercase focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={isJoiningCode || !roomCodeInput.trim()}
                  className="font-pixel text-xs bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isJoiningCode ? 'JOINING...' : 'JOIN ➔'}
                </button>
              </div>
            </form>

            {statusMessage && (
              <div className="font-pixel text-xs text-amber-300 bg-amber-950/60 border border-amber-500/80 p-2 rounded-xl animate-pulse">
                {statusMessage}
              </div>
            )}

            {/* Action Buttons: Queue or Create Custom */}
            <div className="flex flex-col gap-2 mt-1">
              <button
                onClick={handleQueueMatch}
                className="font-pixel text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl border-2 border-cyan-300 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🎯</span>
                <span>QUEUE FOR MATCH (MMR ±500 QUEUE)</span>
              </button>

              <button
                onClick={handleCreateRoom}
                className="font-pixel text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl border-2 border-emerald-300 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>➕</span>
                <span>CREATE CUSTOM ROOM</span>
              </button>
            </div>

            {/* Active Lobbies Browser */}
            {openRooms.length > 0 && (
              <div className="text-left mt-2">
                <span className="font-pixel text-[10px] text-slate-400 font-bold block mb-1">
                  🌐 OPEN LOBBIES ({openRooms.length}):
                </span>
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  {openRooms.map((r) => (
                    <div
                      key={r.id}
                      className="bg-slate-950 border border-slate-800 p-2 rounded-lg flex items-center justify-between"
                    >
                      <div className="text-left font-pixel text-[9px]">
                        <span className="text-cyan-300 font-bold">{r.id}</span>
                        <span className="text-slate-400 ml-2">Host: @{r.hostUsername}</span>
                        <span className="text-yellow-400 ml-2">⭐ {r.hostSkillRating}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-pixel text-[8px] text-slate-400">
                          {r.playerCount}/{r.maxPlayers}
                        </span>
                        <button
                          onClick={async () => {
                            sound.playClickSound();
                            const res = await onlineNetwork.joinRoomByCode(r.id, currentUser, userSkillRating);
                            if (res.success && res.room) onEnterRoom(res.room);
                          }}
                          className="font-pixel text-[8px] bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1 rounded cursor-pointer"
                        >
                          JOIN
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
};
