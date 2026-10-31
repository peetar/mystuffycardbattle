'use client';

import React from 'react';
import { useStoryStore } from '@/store/storyStore';
import { STUFFY_MAP } from '@/data/stuffies';
import { StuffySprite } from '@/components/battle/StuffySprite';
import { sound } from '@/utils/audio';

export const StoryDialogueModal: React.FC = () => {
  const { activeDialogue, currentDialogueLineIndex, nextDialogueLine, chooseDialogueOption } = useStoryStore();

  if (!activeDialogue) return null;

  const currentLine = activeDialogue.lines[currentDialogueLineIndex];
  if (!currentLine) return null;

  const speakerSpecies = currentLine.speakerSpeciesId ? STUFFY_MAP.get(currentLine.speakerSpeciesId) : null;
  const isLastLine = currentDialogueLineIndex === activeDialogue.lines.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center p-3 md:p-6 select-none animate-fadeIn">
      <div className="w-full max-w-4xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-3 border-amber-400 rounded-3xl p-5 md:p-7 shadow-2xl shadow-amber-950/80 flex flex-col gap-4 text-white relative animate-scale-in">
        {/* Top bar: Episode Title & Progress */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-amber-300 bg-amber-950/90 px-2.5 py-0.5 rounded-full border border-amber-500/40">
              STORY MODE • NARRATIVE
            </span>
            <span className="font-pixel text-xs text-yellow-300 font-bold">
              {activeDialogue.title}
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            {currentDialogueLineIndex + 1} / {activeDialogue.lines.length}
          </span>
        </div>

        {/* Speaker Row & Dialogue Frame */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Speaker Portrait */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center bg-slate-950 rounded-2xl border-2 border-amber-400/80 shadow-lg shrink-0">
            {speakerSpecies ? (
              <StuffySprite
                stuffy={{
                  instanceId: `dialogue_${speakerSpecies.id}`,
                  speciesId: speakerSpecies.id,
                  name: speakerSpecies.name,
                  maxHp: speakerSpecies.baseHp,
                  currentHp: speakerSpecies.baseHp,
                  shield: 0,
                  isUnstuffed: false,
                  statusEffects: [],
                }}
                size={70}
              />
            ) : (
              <span className="text-4xl animate-pulse">📜</span>
            )}
          </div>

          {/* Dialogue Text Content */}
          <div className="flex-1 flex flex-col justify-between min-h-[90px]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-pixel text-sm text-yellow-300 font-extrabold tracking-wide">
                  {currentLine.speakerName}
                </span>
                {currentLine.emotion && currentLine.emotion !== 'neutral' && (
                  <span className="font-pixel text-[9px] uppercase px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-600">
                    {currentLine.emotion}
                  </span>
                )}
              </div>
              <p className="font-sans text-sm md:text-base text-slate-200 leading-relaxed drop-shadow">
                &ldquo;{currentLine.text}&rdquo;
              </p>
            </div>

            {/* Interactive Choices (if line provides them) */}
            {currentLine.choices && currentLine.choices.length > 0 ? (
              <div className="flex flex-col gap-2 mt-4">
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
              /* Next / Continue Button */
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => nextDialogueLine()}
                  className="font-pixel text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl border border-yellow-200 shadow-md shadow-amber-950/40 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 animate-pulse"
                >
                  <span>{isLastLine ? 'CONTINUE ➔' : 'NEXT ➔'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
