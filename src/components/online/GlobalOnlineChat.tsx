'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OnlineRoom, ChatMessage } from '@/app/api/online/route';
import { onlineNetwork } from '@/utils/onlineNetwork';
import { filterProfanity } from '@/utils/chatFilter';
import { sound } from '@/utils/audio';

interface GlobalOnlineChatProps {
  room: OnlineRoom;
  currentUser: string;
  onUpdateRoom?: (room: OnlineRoom) => void;
}

export const GlobalOnlineChat: React.FC<GlobalOnlineChatProps> = ({
  room,
  currentUser,
  onUpdateRoom,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const lastMsgCountRef = useRef(room.chatMessages.length);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (room.chatMessages.length > lastMsgCountRef.current) {
      if (!isOpen) {
        setUnreadCount((c) => c + (room.chatMessages.length - lastMsgCountRef.current));
      }
      sound.playChatPing();
      lastMsgCountRef.current = room.chatMessages.length;
    }
  }, [room.chatMessages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, room.chatMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawText = chatInput.trim();
    if (!rawText) return;

    const filteredText = filterProfanity(rawText);
    setChatInput('');

    // Optimistic local update
    const optMsg: ChatMessage = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: currentUser || 'Player',
      text: filteredText,
      timestamp: Date.now(),
    };

    const updatedRoom: OnlineRoom = {
      ...room,
      chatMessages: [...room.chatMessages, optMsg],
      updatedAt: Date.now(),
    };

    if (onUpdateRoom) onUpdateRoom(updatedRoom);
    onlineNetwork.cachedRooms.set(room.id, updatedRoom);
    onlineNetwork.broadcastLocal('ROOM_UPDATED', updatedRoom);

    // Send to backend with roomState
    const serverRoom = await onlineNetwork.sendChat(room.id, currentUser || 'Player', filteredText, updatedRoom);
    if (serverRoom && onUpdateRoom) {
      onUpdateRoom(serverRoom);
    }
  };

  return (
    <aside aria-label="Online Room Chat" className="fixed bottom-3 right-3 z-50 flex flex-col items-end pointer-events-auto">
      {/* Minimized Pill */}
      {!isOpen && (
        <button
          onClick={() => {
            sound.playClickSound();
            setIsOpen(true);
          }}
          className="font-pixel text-xs bg-slate-900 hover:bg-slate-800 text-yellow-300 px-3.5 py-2 rounded-2xl border-2 border-amber-500 shadow-2xl cursor-pointer flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <span className="text-base">💬</span>
          <span>ONLINE CHAT</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="bg-slate-950/95 border-2 border-slate-700 w-80 md:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md transition-all">
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">💬</span>
              <span className="font-pixel text-xs text-yellow-400 font-bold">
                ROOM CHAT ({room.id})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-slate-400 uppercase">
                {room.region}
              </span>
              <button
                onClick={() => {
                  sound.playClickSound();
                  setIsOpen(false);
                }}
                className="text-slate-400 hover:text-white font-pixel text-xs px-1 cursor-pointer"
                title="Minimize chat"
              >
                ⚊
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="p-3 h-52 md:h-64 overflow-y-auto flex flex-col gap-2 font-pixel text-[11px]">
            {room.chatMessages.length === 0 ? (
              <div className="text-slate-500 text-center py-8 text-[10px]">
                No messages yet. Say hello to your opponents!
              </div>
            ) : (
              room.chatMessages.map((msg) => {
                if (msg.isSystem) {
                  return (
                    <div
                      key={msg.id}
                      className="bg-amber-950/40 border border-amber-600/40 text-amber-300 text-[10px] p-1.5 rounded-lg text-center"
                    >
                      {msg.text}
                    </div>
                  );
                }

                const isMe = msg.sender.toLowerCase() === (currentUser || '').toLowerCase();
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 mb-0.5">
                      <span className={isMe ? 'text-yellow-400 font-bold' : 'text-cyan-400'}>
                        @{msg.sender}
                      </span>
                      <span className="font-mono text-[8px] text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div
                      className={`max-w-[85%] px-2.5 py-1.5 rounded-xl break-words text-xs ${
                        isMe
                          ? 'bg-yellow-500/20 border border-yellow-500/60 text-yellow-100 rounded-br-none'
                          : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5"
          >
            <input
              type="text"
              placeholder="Send plushie-friendly message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              maxLength={120}
              className="font-pixel text-xs bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded-lg text-white flex-1 focus:outline-none focus:border-yellow-400 placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="font-pixel text-[10px] bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-bold px-3 py-1.5 rounded-lg border border-yellow-300 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              SEND
            </button>
          </form>
        </div>
      )}

      {/* Spectator Count Window Below Chat */}
      <div className="mt-1.5 bg-slate-950/95 border border-purple-500/60 rounded-xl px-3 py-1.5 shadow-xl flex items-center justify-between w-full max-w-[240px] text-purple-300 font-pixel text-[10px] backdrop-blur-md">
        <div className="flex items-center gap-1.5">
          <span className="text-sm animate-pulse">👁️</span>
          <span>SPECTATORS:</span>
        </div>
        <span className="bg-purple-900/60 border border-purple-400/50 px-2 py-0.5 rounded-full font-mono text-yellow-300 text-xs font-bold">
          {room.spectatorCount || room.spectators?.length || 0} WATCHING
        </span>
      </div>
    </aside>
  );
};
