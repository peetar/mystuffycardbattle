'use client';

import React, { useState, useEffect } from 'react';
import { sound } from '@/utils/audio';
import {
  friendsManager,
  FriendProfile,
  FriendRequest,
  ActivePlayerEntry,
} from '@/utils/friends';

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  onSelectFriendToPlay?: (friend: FriendProfile, mode: 'duel' | 'draft') => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectFriendToPlay,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [activePlayers, setActivePlayers] = useState<ActivePlayerEntry[]>([]);
  const [targetUsernameInput, setTargetUsernameInput] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [challengeFriend, setChallengeFriend] = useState<FriendProfile | null>(null);
  const [selectedTurnTimer, setSelectedTurnTimer] = useState<number>(60);

  const loadData = () => {
    setFriends(friendsManager.getFriends());
    setRequests(friendsManager.getRequests());
  };

  useEffect(() => {
    if (!isOpen) return;
    loadData();
    friendsManager.recordPlayerActive(currentUser);
    friendsManager.syncWithServer(currentUser).then((res) => {
      setFriends(res.friends);
      setRequests(res.requests);
    });
    friendsManager.getActivePlayersLastYear().then((list) => {
      setActivePlayers(list);
    });
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const pendingIncomingRequests = requests.filter(
    (r) => r.status === 'pending' && r.toUsername.toLowerCase() === currentUser.toLowerCase()
  );

  const outgoingRequests = requests.filter(
    (r) => r.fromUsername.toLowerCase() === currentUser.toLowerCase()
  );

  const eligibleActivePlayers = activePlayers.filter(
    (p) =>
      p.username.toLowerCase() !== currentUser.toLowerCase() &&
      !friends.some((f) => f.username.toLowerCase() === p.username.toLowerCase())
  );

  const handleSendRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUsernameInput.trim()) return;

    sound.playClickSound();
    const res = await friendsManager.sendFriendRequest(currentUser, targetUsernameInput.trim());
    if (res.success) {
      sound.playRewardSound();
      setFeedbackMsg({ text: res.message, isError: false });
      setTargetUsernameInput('');
      loadData();
      setActiveTab('requests');
      friendsManager.getActivePlayersLastYear().then(setActivePlayers);
    } else {
      sound.playUndoSound();
      setFeedbackMsg({ text: res.message, isError: true });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    sound.playRewardSound();
    await friendsManager.acceptRequest(requestId, currentUser);
    loadData();
    setFeedbackMsg({ text: 'Friend request accepted!', isError: false });
  };

  const handleDeclineRequest = async (requestId: string) => {
    sound.playClickSound();
    await friendsManager.declineRequest(requestId, currentUser);
    loadData();
    setFeedbackMsg({ text: 'Request declined.', isError: true });
  };

  const handleCancelOutgoing = async (requestId: string) => {
    sound.playClickSound();
    await friendsManager.cancelRequest(requestId);
    loadData();
    setFeedbackMsg({ text: 'Friend request cancelled.', isError: false });
  };

  const handleUnfriend = async (friendUsername: string) => {
    sound.playClickSound();
    await friendsManager.unfriend(currentUser, friendUsername);
    loadData();
    setFeedbackMsg({ text: `Removed @${friendUsername} from friends.`, isError: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto select-none">
      <div className="bg-slate-900 border-4 border-indigo-500 max-w-xl w-full rounded-2xl p-5 shadow-2xl relative flex flex-col gap-4 text-center my-auto max-h-[95vh] overflow-y-auto">
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

        {/* Modal Header */}
        <div>
          <h2 className="font-pixel text-xl text-indigo-400 font-bold tracking-wider flex items-center justify-center gap-2">
            <span>👥</span>
            <span>FRIENDS &amp; SOCIAL SQUAD</span>
          </h2>
          <p className="font-pixel text-[10px] text-slate-400 mt-1">
            Connect with friends, accept duel or draft challenges, and grow your stuffed squad circle!
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('friends');
            }}
            className={`font-pixel text-xs py-2 px-3 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 ${
              activeTab === 'friends'
                ? 'bg-indigo-600 text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👥 FRIENDS</span>
            <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded-full border border-indigo-400/40">
              {friends.length}
            </span>
          </button>

          <button
            onClick={() => {
              sound.playClickSound();
              setActiveTab('requests');
            }}
            className={`font-pixel text-xs py-2 px-3 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-indigo-600 text-white shadow font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📬 REQUESTS</span>
            {pendingIncomingRequests.length > 0 && (
              <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                {pendingIncomingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`font-pixel text-xs p-2 rounded-xl border ${
              feedbackMsg.isError
                ? 'bg-red-950/70 border-red-500/80 text-red-200'
                : 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200'
            } animate-pulse`}
          >
            {feedbackMsg.text}
          </div>
        )}

        {/* TAB 1: FRIENDS LIST */}
        {activeTab === 'friends' && (
          <div className="flex flex-col gap-3">
            {friends.length === 0 ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-500 font-pixel text-xs">
                No friends added yet. Type a username below to send a friend request!
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto no-scrollbar">
                {friends.map((f) => (
                  <div
                    key={f.username}
                    className="bg-slate-950 border border-slate-800 hover:border-indigo-500/50 p-2.5 rounded-xl flex items-center justify-between transition-all"
                  >
                    <div className="text-left font-pixel">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            f.status === 'online'
                              ? 'bg-emerald-400 ring-2 ring-emerald-400/30'
                              : f.status === 'in_game'
                              ? 'bg-amber-400 ring-2 ring-amber-400/30'
                              : 'bg-slate-600'
                          }`}
                        />
                        <span className="text-sm text-yellow-300 font-bold">@{f.username}</span>
                        <span className="text-[9px] text-cyan-300">⭐ {f.skillRating} MMR</span>
                      </div>
                      <div className="text-[9px] text-slate-400 capitalize mt-0.5 ml-4">
                        Status: <strong className="text-slate-300">{f.status.replace('_', ' ')}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onSelectFriendToPlay && (
                        <button
                          onClick={() => setChallengeFriend(f)}
                          className="font-pixel text-[9px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer shadow hover:scale-105 active:scale-95 transition-all"
                        >
                          CHALLENGE ⚔️
                        </button>
                      )}
                      <button
                        onClick={() => handleUnfriend(f.username)}
                        className="font-pixel text-[8px] bg-red-950 hover:bg-red-900 border border-red-700/60 text-red-300 px-2.5 py-1.5 rounded-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                        title="Remove friend"
                      >
                        UNFRIEND ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="flex flex-col gap-3">
            <div className="text-left">
              <span className="font-pixel text-xs text-amber-300 font-bold block mb-1">
                📬 INCOMING REQUESTS ({pendingIncomingRequests.length}):
              </span>
              {pendingIncomingRequests.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center font-pixel text-xs text-slate-500">
                  No incoming friend requests.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar">
                  {pendingIncomingRequests.map((r) => (
                    <div
                      key={r.id}
                      className="bg-slate-950 border border-indigo-500/50 p-2.5 rounded-xl flex items-center justify-between"
                    >
                      <div className="text-left font-pixel">
                        <span className="text-xs text-yellow-300 font-bold">@{r.fromUsername}</span>
                        <div className="text-[8px] text-slate-400">
                          Sent: {new Date(r.createdAt).toLocaleTimeString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleAcceptRequest(r.id)}
                          className="font-pixel text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer shadow hover:scale-105 active:scale-95"
                        >
                          ACCEPT ✓
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(r.id)}
                          className="font-pixel text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg cursor-pointer hover:scale-105 active:scale-95"
                        >
                          DECLINE ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Outgoing Requests History */}
            {outgoingRequests.length > 0 && (
              <div className="text-left mt-2">
                <span className="font-pixel text-[10px] text-slate-400 font-bold block mb-1">
                  📤 OUTGOING REQUESTS ({outgoingRequests.length}):
                </span>
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                  {outgoingRequests.map((r) => (
                    <div
                      key={r.id}
                      className="bg-slate-950 border border-slate-800 p-2 rounded-lg flex items-center justify-between text-[9px] font-pixel"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300">To: <strong className="text-yellow-300">@{r.toUsername}</strong></span>
                        <span
                          className={`font-bold uppercase text-[8px] px-1.5 py-0.5 rounded ${
                            r.status === 'accepted'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                              : r.status === 'declined'
                              ? 'bg-red-950 text-red-400 border border-red-700/60'
                              : 'bg-amber-950 text-amber-400 border border-amber-700/60 animate-pulse'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      {r.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleCancelOutgoing(r.id)}
                          className="font-pixel text-[8px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded cursor-pointer"
                        >
                          CANCEL ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADD FRIEND BOX: Real Players Active In The Last Year */}
        <div className="bg-slate-950 border-2 border-indigo-600/70 p-3.5 rounded-xl text-left flex flex-col gap-2">
          <label className="font-pixel text-[10px] text-indigo-300 font-bold flex items-center gap-1.5">
            <span>➕</span>
            <span>SEND FRIEND REQUEST:</span>
          </label>

          {/* Real Players Active in the Last Year (No Fake Users) */}
          <div className="flex flex-col gap-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="font-pixel text-[8px] text-indigo-300 font-bold flex items-center justify-between">
              <span>📅 PLAYERS ACTIVE IN LAST YEAR ({eligibleActivePlayers.length}):</span>
              <span className="text-[7px] text-slate-400 font-normal">(Tap to auto-fill)</span>
            </span>
            {eligibleActivePlayers.length === 0 ? (
              <span className="font-pixel text-[8px] text-slate-500 italic py-1">
                No other players recorded in the last year yet. Type any username below to friend them!
              </span>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                {eligibleActivePlayers.map((p) => (
                  <button
                    key={p.username}
                    type="button"
                    onClick={() => {
                      sound.playClickSound();
                      setTargetUsernameInput(p.username);
                    }}
                    className="font-pixel text-[8px] bg-slate-900 hover:bg-indigo-950 hover:border-indigo-400 border border-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1"
                  >
                    <span>@{p.username}</span>
                    <span className="text-[7px] text-cyan-400">({p.skillRating})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSendRequest} className="flex gap-2 mt-1">
            <input
              type="text"
              placeholder="Type username to friend..."
              value={targetUsernameInput}
              onChange={(e) => setTargetUsernameInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 font-pixel text-xs text-yellow-300 focus:outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={!targetUsernameInput.trim()}
              className="font-pixel text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              SEND REQUEST ➔
            </button>
          </form>
        </div>

        {/* Challenge Mode Selector Popup */}
        {challengeFriend && onSelectFriendToPlay && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border-4 border-yellow-400 max-w-sm w-full rounded-2xl p-5 shadow-2xl flex flex-col gap-3">
              <h3 className="font-pixel text-base text-yellow-300 font-bold">
                CHALLENGE @{challengeFriend.username}
              </h3>
              <p className="font-pixel text-[10px] text-slate-300">
                Choose the battle mode to launch your match:
              </p>

              {/* Turn Timer Selector */}
              <div className="flex flex-col gap-1 text-left bg-slate-950 p-2 rounded-xl border border-slate-800">
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
                      onClick={() => setSelectedTurnTimer(t.val)}
                      className={`font-pixel text-[8px] py-1 rounded border cursor-pointer transition-all ${
                        selectedTurnTimer === t.val
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => {
                    sound.playRewardSound();
                    onSelectFriendToPlay(challengeFriend, 'duel');
                    setChallengeFriend(null);
                    onClose();
                  }}
                  className="font-pixel text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-2 rounded-xl border border-emerald-300 cursor-pointer hover:scale-105 active:scale-95"
                >
                  ⚔️ DUEL (1v1)
                </button>
                <button
                  onClick={() => {
                    sound.playRewardSound();
                    onSelectFriendToPlay(challengeFriend, 'draft');
                    setChallengeFriend(null);
                    onClose();
                  }}
                  className="font-pixel text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-2 rounded-xl border border-indigo-300 cursor-pointer hover:scale-105 active:scale-95"
                >
                  👑 DRAFT (5 Stuffies)
                </button>
              </div>
              <button
                onClick={() => setChallengeFriend(null)}
                className="font-pixel text-[9px] text-slate-400 hover:text-white mt-1 cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
