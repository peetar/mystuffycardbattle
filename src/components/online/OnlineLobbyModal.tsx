'use client';

import React, { useState } from 'react';
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const regions = [
    { id: 'us-east', name: 'US-East (N. Virginia)', flag: '🇺🇸' },
    { id: 'us-west', name: 'US-West (Oregon)', flag: '🇺🇸' },
    { id: 'eu', name: 'Europe (Frankfurt)', flag: '🇪🇺' },
    { id: 'asia', name: 'Asia (Tokyo)', flag: '🇯🇵' },
    { id: 'global', name: 'Global (All Regions)', flag: '🌐' },
  ];

  // 1. Create Room
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

  // 2. Queue for Match (Skill Rating MMR matchmaking)
  const handleQueueMatch = async () => {
    setIsSearching(true);
    sound.playEnergyChargeSound();
    setStatusMessage(`Searching for opponents with skill ~${userSkillRating} in ${selectedRegion.toUpperCase()}...`);

    const res = await onlineNetwork.queueMatch(currentUser, userSkillRating, selectedRegion);
    if (res.success && res.room) {
      sound.playRewardSound();
      setIsSearching(false);
      onEnterRoom(res.room);
    } else {
      setIsSearching(false);
      setStatusMessage('Matchmaking failed. Try creating a room instead.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border-4 border-cyan-500 max-w-lg w-full rounded-2xl p-5 shadow-2xl relative flex flex-col gap-4 text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClickSound();
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
            Connect with players by region on separate screens, invite friends, or queue with skill matchmaking!
          </p>
        </div>

        {/* Player Profile & MMR Badge */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="text-left">
            <span className="font-pixel text-[9px] text-slate-400">PLAYER USERNAME</span>
            <div className="font-pixel text-sm text-yellow-300 font-bold">@{currentUser}</div>
          </div>
          <div className="text-right">
            <span className="font-pixel text-[9px] text-slate-400">SKILL LEVEL</span>
            <div className="font-pixel text-sm text-cyan-300 font-bold">⭐ {userSkillRating} MMR</div>
          </div>
        </div>

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

        {statusMessage && (
          <div className="font-pixel text-xs text-amber-300 bg-amber-950/60 border border-amber-500/80 p-2 rounded-xl animate-pulse">
            {statusMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-2">
          <button
            onClick={handleQueueMatch}
            disabled={isSearching}
            className="font-pixel text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl border-2 border-cyan-300 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>🎯</span>
            <span>{isSearching ? 'SEARCHING MATCH...' : 'QUEUE FOR MATCH (SKILL MATCHING)'}</span>
          </button>

          <button
            onClick={handleCreateRoom}
            className="font-pixel text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 px-4 rounded-xl border-2 border-emerald-300 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>➕</span>
            <span>CREATE CUSTOM ROOM</span>
          </button>
        </div>
      </div>
    </div>
  );
};
