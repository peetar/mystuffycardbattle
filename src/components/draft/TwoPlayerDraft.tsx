'use client';

import React, { useState } from 'react';
import { ALL_STUFFIES } from '@/data/stuffies';
import { getLoadoutsForStuffy } from '@/data/loadouts';
import { CARD_MAP } from '@/data/cards';
import { StuffySpecies, StuffyState, Card } from '@/types/game';
import { StuffySprite } from '../battle/StuffySprite';
import { CardView } from '../battle/CardView';

interface TwoPlayerDraftProps {
  onDraftComplete: (
    p1Team: StuffyState[],
    p1Deck: Card[],
    p2Team: StuffyState[],
    p2Deck: Card[],
    reserveStuffies: StuffyState[]
  ) => void;
}

export const TwoPlayerDraft: React.FC<TwoPlayerDraftProps> = ({ onDraftComplete }) => {
  const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1');
  const [p1Draft, setP1Draft] = useState<{ species: StuffySpecies; loadoutId: string }[]>([]);
  const [p2Draft, setP2Draft] = useState<{ species: StuffySpecies; loadoutId: string }[]>([]);
  const [selectingSpecies, setSelectingSpecies] = useState<StuffySpecies | null>(null);

  // Drafted species IDs
  const draftedIds = new Set([
    ...p1Draft.map((d) => d.species.id),
    ...p2Draft.map((d) => d.species.id),
  ]);

  const availableSpecies = ALL_STUFFIES.filter((s) => !draftedIds.has(s.id));

  // Drafting stops when each team has 5 stuffies (or when 3 remain in reserve)
  const isDraftFinished = p1Draft.length >= 5 && p2Draft.length >= 5;

  const handlePickSpecies = (species: StuffySpecies) => {
    setSelectingSpecies(species);
  };

  const handleConfirmLoadout = (loadoutId: string) => {
    if (!selectingSpecies) return;

    if (currentTurn === 'p1') {
      const newP1 = [...p1Draft, { species: selectingSpecies, loadoutId }];
      setP1Draft(newP1);
      setCurrentTurn('p2');
    } else {
      const newP2 = [...p2Draft, { species: selectingSpecies, loadoutId }];
      setP2Draft(newP2);
      setCurrentTurn('p1');
    }

    setSelectingSpecies(null);
  };

  const handleLaunchBattle = () => {
    // Construct P1 team and deck
    const p1Team: StuffyState[] = p1Draft.map((d, i) => ({
      instanceId: `p1_${d.species.id}_${i}`,
      speciesId: d.species.id,
      name: d.species.name,
      maxHp: d.species.baseHp,
      currentHp: d.species.baseHp,
      shield: 0,
      isUnstuffed: false,
      statusEffects: [],
      selectedLoadoutId: d.loadoutId,
    }));

    const p1Deck: Card[] = [];
    p1Draft.forEach((d) => {
      const loadouts = getLoadoutsForStuffy(d.species.id);
      const chosen = loadouts.find((l) => l.id === d.loadoutId) || loadouts[0];
      chosen?.cardIds.forEach((cId) => {
        const c = CARD_MAP.get(cId);
        if (c) p1Deck.push({ ...c });
      });
    });

    // Construct P2 team and deck
    const p2Team: StuffyState[] = p2Draft.map((d, i) => ({
      instanceId: `p2_${d.species.id}_${i}`,
      speciesId: d.species.id,
      name: d.species.name,
      maxHp: d.species.baseHp,
      currentHp: d.species.baseHp,
      shield: 0,
      isUnstuffed: false,
      statusEffects: [],
      selectedLoadoutId: d.loadoutId,
    }));

    const p2Deck: Card[] = [];
    p2Draft.forEach((d) => {
      const loadouts = getLoadoutsForStuffy(d.species.id);
      const chosen = loadouts.find((l) => l.id === d.loadoutId) || loadouts[0];
      chosen?.cardIds.forEach((cId) => {
        const c = CARD_MAP.get(cId);
        if (c) p2Deck.push({ ...c });
      });
    });

    // 3 reserve stuffies for First Blood rule
    const reserveStuffies: StuffyState[] = availableSpecies.slice(0, 3).map((s, i) => ({
      instanceId: `reserve_${s.id}_${i}`,
      speciesId: s.id,
      name: s.name,
      maxHp: s.baseHp,
      currentHp: s.baseHp,
      shield: 0,
      isUnstuffed: false,
      statusEffects: [],
    }));

    onDraftComplete(p1Team, p1Deck, p2Team, p2Deck, reserveStuffies);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="text-center">
        <h2 className="font-pixel text-xl md:text-2xl text-yellow-400 font-bold tracking-wider">
          2-PLAYER TURN DRAFT
        </h2>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div
            className={`font-pixel text-xs px-4 py-1.5 rounded-lg border-2 ${
              currentTurn === 'p1' && !isDraftFinished
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            PLAYER 1 PICKING ({p1Draft.length}/5)
          </div>

          <div
            className={`font-pixel text-xs px-4 py-1.5 rounded-lg border-2 ${
              currentTurn === 'p2' && !isDraftFinished
                ? 'bg-blue-950 border-blue-400 text-blue-300 ring-2 ring-blue-400 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            PLAYER 2 PICKING ({p2Draft.length}/5)
          </div>
        </div>
      </div>

      {/* Center Display: P1 Team, Center Reserves, P2 Team */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 max-w-6xl mx-auto w-full">
        {/* P1 Draft Roster */}
        <div className="bg-emerald-950/30 border-2 border-emerald-800/60 p-4 rounded-xl">
          <h3 className="font-pixel text-xs text-emerald-400 mb-2 font-bold">PLAYER 1 SQUAD</h3>
          <div className="flex gap-2 flex-wrap">
            {p1Draft.map((d, i) => (
              <div key={i} className="flex flex-col items-center bg-slate-900 p-1.5 rounded-lg border border-emerald-500/40 w-16">
                <StuffySprite
                  stuffy={{
                    instanceId: `p1_prev_${i}`,
                    speciesId: d.species.id,
                    name: d.species.name,
                    maxHp: d.species.baseHp,
                    currentHp: d.species.baseHp,
                    shield: 0,
                    isUnstuffed: false,
                    statusEffects: [],
                  }}
                  size={42}
                />
                <span className="font-pixel text-[8px] text-yellow-300 truncate w-full text-center mt-1">
                  {d.species.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Center 3 Reserves (First Blood Reward Pool) */}
        <div className="bg-amber-950/30 border-2 border-amber-600/60 p-4 rounded-xl text-center flex flex-col justify-between">
          <div>
            <h3 className="font-pixel text-xs text-amber-300 font-bold mb-1">
              ⚡ REINFORCEMENT POOL (3)
            </h3>
            <p className="font-mono text-[10px] text-slate-300 leading-tight">
              When the first stuffy dies in battle:
              <br />
              <span className="text-yellow-400 font-bold">2 go to victim</span> •{' '}
              <span className="text-red-400 font-bold">1 goes to killer!</span>
            </p>
          </div>

          <div className="flex justify-center gap-2 my-2">
            {availableSpecies.slice(0, 3).map((s) => (
              <div key={s.id} className="flex flex-col items-center bg-slate-900 p-1 rounded border border-amber-500/50 w-14">
                <StuffySprite
                  stuffy={{
                    instanceId: `res_${s.id}`,
                    speciesId: s.id,
                    name: s.name,
                    maxHp: s.baseHp,
                    currentHp: s.baseHp,
                    shield: 0,
                    isUnstuffed: false,
                    statusEffects: [],
                  }}
                  size={36}
                />
                <span className="font-pixel text-[8px] text-amber-200 truncate w-full text-center">
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* P2 Draft Roster */}
        <div className="bg-blue-950/30 border-2 border-blue-800/60 p-4 rounded-xl">
          <h3 className="font-pixel text-xs text-blue-400 mb-2 font-bold">PLAYER 2 SQUAD</h3>
          <div className="flex gap-2 flex-wrap">
            {p2Draft.map((d, i) => (
              <div key={i} className="flex flex-col items-center bg-slate-900 p-1.5 rounded-lg border border-blue-500/40 w-16">
                <StuffySprite
                  stuffy={{
                    instanceId: `p2_prev_${i}`,
                    speciesId: d.species.id,
                    name: d.species.name,
                    maxHp: d.species.baseHp,
                    currentHp: d.species.baseHp,
                    shield: 0,
                    isUnstuffed: false,
                    statusEffects: [],
                  }}
                  size={42}
                />
                <span className="font-pixel text-[8px] text-yellow-300 truncate w-full text-center mt-1">
                  {d.species.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stuffy Pool or Loadout Selection */}
      {!isDraftFinished ? (
        !selectingSpecies ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-w-5xl mx-auto w-full max-h-[40vh] overflow-y-auto p-2">
            {availableSpecies.map((species) => (
              <div
                key={species.id}
                onClick={() => handlePickSpecies(species)}
                className="bg-slate-900 border-2 border-slate-700 hover:border-yellow-400 p-2 rounded-xl flex flex-col items-center cursor-pointer transition-all hover:scale-105"
              >
                <div className="w-14 h-14">
                  <StuffySprite
                    stuffy={{
                      instanceId: `pick_${species.id}`,
                      speciesId: species.id,
                      name: species.name,
                      maxHp: species.baseHp,
                      currentHp: species.baseHp,
                      shield: 0,
                      isUnstuffed: false,
                      statusEffects: [],
                    }}
                    size={56}
                  />
                </div>
                <span className="font-pixel text-[10px] text-yellow-300 mt-1 truncate w-full text-center">
                  {species.name}
                </span>
                <span className="font-mono text-[9px] text-slate-400">{species.species}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900 border-2 border-yellow-500 p-4 rounded-2xl max-w-2xl mx-auto w-full text-center">
            <h3 className="font-pixel text-sm text-yellow-300 font-bold mb-2">
              SELECT LOADOUT FOR {selectingSpecies.name.toUpperCase()}
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {getLoadoutsForStuffy(selectingSpecies.id).map((loadout) => (
                <button
                  key={loadout.id}
                  onClick={() => handleConfirmLoadout(loadout.id)}
                  className="bg-slate-950 hover:bg-yellow-950/60 p-2 rounded-lg border border-slate-700 hover:border-yellow-400 text-left transition-all"
                >
                  <div className="font-pixel text-[10px] text-yellow-300 font-bold">{loadout.name}</div>
                  <div className="font-sans text-[9px] text-slate-300 mt-1">{loadout.theme}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectingSpecies(null)}
              className="font-pixel text-[10px] px-3 py-1.5 bg-slate-800 text-slate-300 rounded border border-slate-600"
            >
              CANCEL
            </button>
          </div>
        )
      ) : (
        <div className="text-center py-6">
          <button
            onClick={handleLaunchBattle}
            className="font-pixel text-sm md:text-base bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-8 py-4 rounded-xl border-4 border-yellow-300 shadow-2xl animate-bounce cursor-pointer"
          >
            START 2-PLAYER BATTLE ⚔️
          </button>
        </div>
      )}
    </div>
  );
};
