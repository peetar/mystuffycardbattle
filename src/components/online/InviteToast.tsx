'use client';

import React from 'react';
import { PendingInvite } from '@/app/api/online/route';
import { sound } from '@/utils/audio';

interface InviteToastProps {
  invite: PendingInvite;
  onAccept: (invite: PendingInvite) => void;
  onDecline: (invite: PendingInvite) => void;
}

export const InviteToast: React.FC<InviteToastProps> = ({ invite, onAccept, onDecline }) => {
  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-slate-900 border-2 border-yellow-400 p-4 rounded-2xl shadow-2xl animate-bounce-short">
      <div className="flex items-start gap-3">
        <span className="text-3xl">✉️</span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-pixel text-xs text-yellow-300 font-bold">MATCH INVITATION!</h4>
            <span className="font-mono text-[10px] text-slate-400 uppercase">{invite.region}</span>
          </div>
          <p className="font-pixel text-[11px] text-white mt-1">
            <span className="text-amber-400 font-bold">@{invite.hostUsername}</span> invited you to join:
          </p>
          <div className="bg-slate-950 px-2 py-1 rounded border border-slate-700 font-mono text-xs text-yellow-400 mt-1 inline-block font-bold">
            {invite.roomId}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => {
                sound.playRewardSound();
                onAccept(invite);
              }}
              className="flex-1 font-pixel text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg border border-emerald-400 cursor-pointer shadow transition-all hover:scale-105 active:scale-95"
            >
              ✅ ACCEPT &amp; JOIN
            </button>
            <button
              onClick={() => {
                sound.playClickSound();
                onDecline(invite);
              }}
              className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1.5 px-3 rounded-lg border border-slate-600 cursor-pointer shadow transition-all hover:scale-105 active:scale-95"
            >
              ❌ DECLINE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
