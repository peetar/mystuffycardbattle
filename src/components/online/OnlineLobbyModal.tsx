'use client';

import React, { useState, useEffect, useRef } from 'react';
import { onlineNetwork } from '@/utils/onlineNetwork';
import { sound } from '@/utils/audio';
import { OnlineRoom } from '@/app/api/online/route';

interface OnlineLobbyModalProps {
  currentUser: string;
  userSkillRating: number;
  isOpen: boolean;
  onClose: () => void;
  onEnterRoom: (room: OnlineRoom) => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({
  currentUser,
  userSkillRating,
  isOpen,
  onClose,
  onEnterRoom,
}) => {
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

    const fetchRooms = async () => {
      const list = await onlineNetwork.listOpenRooms();
      setOpenRooms(list);
    };
    fetchRooms();
    const interval = setInterval(fetchRooms, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Clean up queue polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

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

        {/* ACTIVE QUEUE OVERLAY / SEARCHING VIEW */}
        {isSearching ? (
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
        )}
      </div>
    </div>
  );
};
