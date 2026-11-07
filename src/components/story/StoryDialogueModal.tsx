'use client';

import React, { useState, useEffect } from 'react';
import { useStoryStore } from '@/store/storyStore';
import { STUFFY_MAP } from '@/data/stuffies';
import { StuffySprite } from '@/components/battle/StuffySprite';
import { sound } from '@/utils/audio';

export const StoryDialogueModal: React.FC = () => {
  const {
    activeDialogue,
    currentDialogueLineIndex,
    nextDialogueLine,
    skipDialogue,
    chooseDialogueOption,
  } = useStoryStore();

  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState<'normal' | 'fast'>('normal');

  useEffect(() => {
    if (!activeDialogue || !isAutoPlay) return;
    const delay = autoSpeed === 'fast' ? 1400 : 2600;
    const timer = setTimeout(() => {
      const currentLine = activeDialogue.lines[currentDialogueLineIndex];
      // Do not auto-advance if choice selection is required
      if (currentLine?.choices && currentLine.choices.length > 0) return;
      nextDialogueLine();
    }, delay);
    return () => clearTimeout(timer);
  }, [activeDialogue, currentDialogueLineIndex, isAutoPlay, autoSpeed, nextDialogueLine]);

  if (!activeDialogue) return null;

  const currentLine = activeDialogue.lines[currentDialogueLineIndex];
  if (!currentLine) return null;

  const speakerSpecies = currentLine.speakerSpeciesId
    ? STUFFY_MAP.get(currentLine.speakerSpeciesId)
    : null;
  const isLastLine = currentDialogueLineIndex === activeDialogue.lines.length - 1;
  const isCinematic = Boolean(activeDialogue.isCinematic);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between select-none animate-fadeIn backdrop-blur-md">
      {/* Top Theatrical Letterbox Bar */}
      <div className="w-full bg-black py-3 px-4 md:px-8 border-b border-amber-500/30 flex items-center justify-between shadow-2xl z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🎬</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-full">
                {isCinematic ? 'CINEMATIC CUTSCENE' : 'STORY NARRATIVE'}
              </span>
              <span className="font-pixel text-xs text-yellow-300 font-extrabold tracking-wide drop-shadow">
                {activeDialogue.title}
              </span>
            </div>
            {activeDialogue.subtitle && (
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                {activeDialogue.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Controls: Auto-Play & Skip */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClickSound();
              if (isAutoPlay) {
                if (autoSpeed === 'normal') {
                  setAutoSpeed('fast');
                } else {
                  setIsAutoPlay(false);
                  setAutoSpeed('normal');
                }
              } else {
                setIsAutoPlay(true);
                setAutoSpeed('normal');
              }
            }}
            className={`font-pixel text-[10px] px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              isAutoPlay
                ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-lg shadow-cyan-900/50 scale-105'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
          >
            <span>{isAutoPlay ? (autoSpeed === 'fast' ? '⏩ AUTO 2x' : '▶️ AUTO 1x') : '▶️ AUTO'}</span>
          </button>

          <button
            onClick={() => {
              sound.playClickSound();
              skipDialogue();
            }}
            className="font-pixel text-[10px] bg-red-950/80 hover:bg-red-900 text-red-200 hover:text-white px-3 py-1.5 rounded-xl border border-red-500/50 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <span>SKIP ⏭️</span>
          </button>
        </div>
      </div>

      {/* Center Cinematic Stage / Viewport */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Glow Aura */}
        <div className="absolute inset-0 bg-gradient-radial from-amber-500/10 via-indigo-950/30 to-black pointer-events-none" />

        {/* Animated Speaker Avatar on Stage */}
        <div className="relative z-10 flex flex-col items-center animate-bounce-slow">
          <div className="w-32 h-32 md:w-44 md:h-44 flex items-center justify-center bg-slate-950/90 rounded-3xl border-3 border-amber-400/80 shadow-[0_0_50px_rgba(245,158,11,0.35)] relative">
            {speakerSpecies ? (
              <StuffySprite
                stuffy={{
                  instanceId: `cutscene_${speakerSpecies.id}`,
                  speciesId: speakerSpecies.id,
                  name: speakerSpecies.name,
                  maxHp: speakerSpecies.baseHp,
                  currentHp: speakerSpecies.baseHp,
                  shield: 0,
                  isUnstuffed: false,
                  statusEffects: [],
                }}
                size={120}
              />
            ) : (
              <span className="text-6xl animate-pulse">📜</span>
            )}
            <div className="absolute -bottom-3 bg-amber-400 text-slate-950 font-pixel text-[10px] font-black px-3 py-0.5 rounded-full shadow border border-yellow-100">
              {currentLine.speakerName}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Theatrical Letterbox & Dialogue Box */}
      <div className="w-full bg-black py-4 px-4 md:px-8 border-t border-amber-500/30 flex flex-col items-center shadow-2xl z-10">
        <div className="w-full max-w-4xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-2 border-amber-400/80 rounded-2xl p-4 md:p-6 shadow-2xl shadow-amber-950/80 flex flex-col gap-3 text-white">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-sm text-yellow-300 font-extrabold tracking-wide">
                {currentLine.speakerName}
              </span>
              {currentLine.emotion && currentLine.emotion !== 'neutral' && (
                <span className="font-pixel text-[9px] uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-600/40">
                  {currentLine.emotion}
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              {currentDialogueLineIndex + 1} / {activeDialogue.lines.length}
            </span>
          </div>

          <p className="font-sans text-sm md:text-base text-slate-100 leading-relaxed drop-shadow min-h-[48px]">
            &ldquo;{currentLine.text}&rdquo;
          </p>

          {/* Interactive Choices */}
          {currentLine.choices && currentLine.choices.length > 0 ? (
            <div className="flex flex-col gap-2 mt-2">
              {currentLine.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => chooseDialogueOption(idx)}
                  className="font-pixel text-xs text-left bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 hover:from-cyan-900 hover:to-indigo-900 text-cyan-200 hover:text-white p-3 rounded-xl border border-cyan-400/60 shadow transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-between"
                >
                  <span>➔ {choice.text}</span>
                  <span className="text-[10px] text-cyan-400">CHOOSE</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex justify-end mt-1">
              <button
                onClick={() => nextDialogueLine()}
                className="font-pixel text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl border border-yellow-200 shadow-md shadow-amber-950/40 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 animate-pulse"
              >
                <span>{isLastLine ? 'CONTINUE ➔' : 'NEXT ➔'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
