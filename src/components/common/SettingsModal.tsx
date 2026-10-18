'use client';

import React, { useState } from 'react';
import { sound } from '@/utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAbandonRun?: () => void;
  canAbandonRun?: boolean;
  onLeaveAllGames?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onAbandonRun,
  canAbandonRun = false,
  onLeaveAllGames,
}) => {
  const [musicOn, setMusicOn] = useState(sound.musicEnabled);
  const [sfxOn, setSfxOn] = useState(sound.sfxEnabled);
  const [musicVol, setMusicVol] = useState(Math.round(sound.musicVolume * 100));
  const [sfxVol, setSfxVol] = useState(Math.round(sound.sfxVolume * 100));
  const [showConfirmAbandon, setShowConfirmAbandon] = useState(false);
  const [showConfirmLeaveAll, setShowConfirmLeaveAll] = useState(false);

  if (!isOpen) return null;

  const handleToggleMusic = () => {
    const next = sound.toggleMusic();
    setMusicOn(next);
  };

  const handleToggleSfx = () => {
    const next = sound.toggleSfx();
    setSfxOn(next);
    if (next) sound.playClickSound();
  };

  const handleMusicVolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setMusicVol(val);
    sound.setMusicVolume(val / 100);
  };

  const handleSfxVolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSfxVol(val);
    sound.setSfxVolume(val / 100);
    sound.playClickSound();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none text-white">
      <div className="bg-slate-900 border-4 border-yellow-500 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl shadow-yellow-500/20">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-spin-slow">⚙️</span>
            <h2 className="font-pixel text-base text-yellow-400 font-bold">GAME SETTINGS</h2>
          </div>
          <button
            onClick={() => {
              sound.playClickSound();
              onClose();
            }}
            className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-600 cursor-pointer"
          >
            ✖️
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Music Controls */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-yellow-300 flex items-center gap-2">
                <span>🎵</span>
                <span>CHIPTUNE MUSIC</span>
              </span>
              <button
                onClick={handleToggleMusic}
                className={`font-pixel text-[10px] px-3 py-1.5 rounded-lg border cursor-pointer font-bold transition-all ${
                  musicOn
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {musicOn ? 'ON 🔊' : 'OFF 🔇'}
              </button>
            </div>

            {musicOn && (
              <div className="flex items-center gap-3">
                <span className="text-xs">🔈</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVol}
                  onChange={handleMusicVolChange}
                  className="flex-1 accent-yellow-400 cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-400 w-8">{musicVol}%</span>
              </div>
            )}
          </div>

          {/* SFX Controls */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-xs text-amber-300 flex items-center gap-2">
                <span>💥</span>
                <span>SOUND EFFECTS</span>
              </span>
              <button
                onClick={handleToggleSfx}
                className={`font-pixel text-[10px] px-3 py-1.5 rounded-lg border cursor-pointer font-bold transition-all ${
                  sfxOn
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {sfxOn ? 'ON 🔊' : 'OFF 🔇'}
              </button>
            </div>

            {sfxOn && (
              <div className="flex items-center gap-3">
                <span className="text-xs">🔈</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVol}
                  onChange={handleSfxVolChange}
                  className="flex-1 accent-amber-400 cursor-pointer"
                />
                <span className="font-mono text-xs text-slate-400 w-8">{sfxVol}%</span>
              </div>
            )}
          </div>

          {/* Abandon Run / Title Return Button */}
          {canAbandonRun && (
            <div className="pt-2 border-t border-slate-800">
              {!showConfirmAbandon ? (
                <button
                  onClick={() => setShowConfirmAbandon(true)}
                  className="w-full font-pixel text-xs bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/60 py-3 rounded-xl cursor-pointer transition-all"
                >
                  🚪 ABANDON CURRENT RUN & RETURN TO TITLE
                </button>
              ) : (
                <div className="flex flex-col gap-2 bg-red-950 p-3 rounded-xl border border-red-500 text-center">
                  <span className="font-pixel text-[10px] text-red-200">
                    Are you sure? Current progress will be lost!
                  </span>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setShowConfirmAbandon(false);
                        onClose();
                        if (onAbandonRun) onAbandonRun();
                      }}
                      className="font-pixel text-[10px] bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold cursor-pointer"
                    >
                      YES, ABANDON
                    </button>
                    <button
                      onClick={() => setShowConfirmAbandon(false)}
                      className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Emergency Leave All Online Games Button */}
          {onLeaveAllGames && (
            <div className="pt-2 border-t border-slate-800">
              {!showConfirmLeaveAll ? (
                <button
                  onClick={() => setShowConfirmLeaveAll(true)}
                  className="w-full font-pixel text-xs bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <span>🚨</span>
                  <span>LEAVE ALL ONLINE GAMES &amp; RESET</span>
                </button>
              ) : (
                <div className="flex flex-col gap-2 bg-rose-950 p-3 rounded-xl border border-rose-500 text-center">
                  <span className="font-pixel text-[10px] text-rose-200">
                    Leave all multiplayer matches and clean up stuck rooms on server?
                  </span>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setShowConfirmLeaveAll(false);
                        onClose();
                        onLeaveAllGames();
                      }}
                      className="font-pixel text-[10px] bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg font-bold cursor-pointer"
                    >
                      YES, LEAVE ALL
                    </button>
                    <button
                      onClick={() => setShowConfirmLeaveAll(false)}
                      className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg cursor-pointer"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => {
              sound.playClickSound();
              onClose();
            }}
            className="w-full font-pixel text-xs bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-3 rounded-xl border-2 border-yellow-300 shadow-lg cursor-pointer"
          >
            RESUME GAME 🎮
          </button>
        </div>
      </div>
    </div>
  );
};
