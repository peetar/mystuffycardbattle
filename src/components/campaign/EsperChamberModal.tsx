'use client';

import React, { useState, useEffect } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { getRandomEspers } from '@/data/espers';
import { Esper, StuffyState } from '@/types/game';
import { sound } from '@/utils/audio';

interface EsperChamberModalProps {
  onComplete: () => void;
}

export const EsperChamberModal: React.FC<EsperChamberModalProps> = ({ onComplete }) => {
  const { activeParty, bench, infuseEsperIntoStuffy, completeNode } = useCampaignStore();
  const [chamberEspers, setChamberEspers] = useState<Esper[]>([]);
  const [selectedEsper, setSelectedEsper] = useState<Esper | null>(null);
  const [chosenStuffyId, setChosenStuffyId] = useState<string | null>(null);
  const [hasInfused, setHasInfused] = useState<boolean>(false);
  const [infusedMessage, setInfusedMessage] = useState<string>('');

  useEffect(() => {
    // Generate 3 unique celestial Espers for this chamber encounter
    const offerings = getRandomEspers(3);
    setChamberEspers(offerings);
  }, []);

  const allStuffies: StuffyState[] = [...activeParty, ...bench];

  const handleInfuse = () => {
    if (!selectedEsper || !chosenStuffyId) return;

    sound.playRewardSound();
    infuseEsperIntoStuffy(selectedEsper, chosenStuffyId);
    const targetStuffy = allStuffies.find((s) => s.instanceId === chosenStuffyId);
    setInfusedMessage(
      `✨ ${selectedEsper.name} successfully bonded with ${targetStuffy?.name || 'your Stuffy'}!`
    );
    setHasInfused(true);
  };

  const handleProceed = () => {
    sound.playClickSound();
    completeNode();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto select-none">
      <div className="bg-gradient-to-b from-slate-950 via-purple-950/80 to-slate-950 border-2 border-fuchsia-500 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl shadow-fuchsia-950/80 flex flex-col gap-6 text-white animate-scale-in">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-950 border border-fuchsia-500/60 text-fuchsia-300 font-pixel text-xs mb-2">
            <span>🔮</span>
            <span>ASTRAL SANCTUARY</span>
          </div>
          <h2 className="font-pixel text-xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-pink-200 to-amber-200 font-extrabold tracking-wide">
            THE ESPER CHAMBER
          </h2>
          <p className="font-sans text-xs md:text-sm text-slate-300 max-w-xl mx-auto mt-1 leading-relaxed">
            Ancient plush deities hover in shimmering celestial threads. Select an Esper to bond with one of your stuffies for the remainder of this campaign run.
          </p>
        </div>

        {!hasInfused ? (
          <>
            {/* Step 1: Choose an Esper */}
            <div>
              <h3 className="font-pixel text-xs text-yellow-300 mb-3 flex items-center gap-2">
                <span>1️⃣</span>
                <span>CHOOSE AN ASTRAL ESPER:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {chamberEspers.map((esper) => {
                  const isSelected = selectedEsper?.id === esper.id;
                  return (
                    <div
                      key={esper.id}
                      onClick={() => {
                        sound.playClickSound();
                        setSelectedEsper(esper);
                      }}
                      className={`p-4 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all hover:scale-102 ${
                        isSelected
                          ? 'bg-fuchsia-950/80 border-fuchsia-400 ring-2 ring-fuchsia-400/60 shadow-lg shadow-fuchsia-950'
                          : 'bg-slate-900/80 border-slate-700 hover:border-fuchsia-500/60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-3xl">{esper.icon}</span>
                          <span className="font-pixel text-[9px] uppercase tracking-wider text-fuchsia-300 bg-fuchsia-950/90 px-2 py-0.5 rounded border border-fuchsia-500/40 font-bold">
                            {esper.element}
                          </span>
                        </div>

                        <h4 className="font-pixel text-sm text-fuchsia-200 font-bold leading-tight">
                          {esper.name}
                        </h4>
                        <p className="text-[11px] text-fuchsia-300/70 italic mb-2">{esper.title}</p>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">{esper.description}</p>
                      </div>

                      <div className="border-t border-fuchsia-900/50 pt-2.5">
                        <span className="font-pixel text-[9px] text-slate-400 uppercase block mb-1.5 font-bold">
                          Stat Blessings:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {esper.boost.speed && (
                            <span className="text-[10px] font-mono bg-cyan-950 border border-cyan-500/50 text-cyan-300 px-2 py-0.5 rounded font-bold">
                              +{esper.boost.speed} Speed
                            </span>
                          )}
                          {esper.boost.maxHp && (
                            <span className="text-[10px] font-mono bg-emerald-950 border border-emerald-500/50 text-emerald-300 px-2 py-0.5 rounded font-bold">
                              +{esper.boost.maxHp} Max HP
                            </span>
                          )}
                          {esper.boost.startShield && (
                            <span className="text-[10px] font-mono bg-blue-950 border border-blue-500/50 text-blue-300 px-2 py-0.5 rounded font-bold">
                              +{esper.boost.startShield} Shield
                            </span>
                          )}
                          {esper.boost.damageBonus && (
                            <span className="text-[10px] font-mono bg-rose-950 border border-rose-500/50 text-rose-300 px-2 py-0.5 rounded font-bold">
                              +{esper.boost.damageBonus} Dmg
                            </span>
                          )}
                          {esper.boost.freezeChance && (
                            <span className="text-[10px] font-mono bg-sky-950 border border-sky-500/50 text-sky-300 px-2 py-0.5 rounded font-bold">
                              +{esper.boost.freezeChance}% Freeze
                            </span>
                          )}
                          {esper.boost.burnChance && (
                            <span className="text-[10px] font-mono bg-amber-950 border border-amber-500/50 text-amber-300 px-2 py-0.5 rounded font-bold">
                              +{esper.boost.burnChance}% Burn
                            </span>
                          )}
                          {esper.boost.shockChance && (
                            <span className="text-[10px] font-mono bg-yellow-950 border border-yellow-500/50 text-yellow-300 px-2 py-0.5 rounded font-bold">
                              +{esper.boost.shockChance}% Shock
                            </span>
                          )}
                          {esper.boost.stunChance && (
                            <span className="text-[10px] font-mono bg-purple-950 border border-purple-500/50 text-purple-300 px-2 py-0.5 rounded font-bold">
                              +{esper.boost.stunChance}% Stun
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Choose Recipient Stuffy */}
            {selectedEsper && (
              <div className="animate-fadeIn">
                <h3 className="font-pixel text-xs text-yellow-300 mb-3 flex items-center gap-2">
                  <span>2️⃣</span>
                  <span>SELECT STUFFY TO INFUSE WITH {selectedEsper.name.toUpperCase()}:</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-48 overflow-y-auto pr-1">
                  {allStuffies.map((stuffy) => {
                    const isChosen = chosenStuffyId === stuffy.instanceId;
                    const existingCount = (stuffy.espers || []).length;
                    return (
                      <button
                        key={stuffy.instanceId}
                        onClick={() => {
                          sound.playClickSound();
                          setChosenStuffyId(stuffy.instanceId);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isChosen
                            ? 'bg-fuchsia-950 border-fuchsia-400 ring-2 ring-fuchsia-400/80 shadow'
                            : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        <div className="font-pixel text-xs text-yellow-300 font-bold truncate">
                          {stuffy.name}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400 mt-1">
                          {stuffy.currentHp}/{stuffy.maxHp} HP
                        </div>
                        <div className="font-mono text-[10px] text-cyan-400">
                          {stuffy.speed ?? 100} Speed
                        </div>
                        <div className="font-pixel text-[9px] text-fuchsia-300 mt-1.5">
                          {existingCount} Esper{existingCount === 1 ? '' : 's'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                onClick={handleProceed}
                className="font-pixel text-xs px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                SKIP CHAMBER ➔
              </button>

              <button
                disabled={!selectedEsper || !chosenStuffyId}
                onClick={handleInfuse}
                className="font-pixel text-xs px-6 py-3 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold rounded-2xl border-2 border-fuchsia-300/80 shadow-lg shadow-fuchsia-600/30 transition-all cursor-pointer disabled:cursor-not-allowed disabled:border-slate-700"
              >
                ✨ BOND ESPER PERMANENTLY
              </button>
            </div>
          </>
        ) : (
          /* Infusion Complete Success Screen */
          <div className="text-center py-8 animate-fadeIn flex flex-col items-center gap-4">
            <span className="text-6xl animate-bounce">🔮✨</span>
            <h3 className="font-pixel text-lg text-fuchsia-300 font-extrabold">
              ESPER BOND COMPLETE!
            </h3>
            <p className="font-pixel text-xs text-yellow-200 max-w-md">{infusedMessage}</p>
            <p className="font-sans text-xs text-slate-300 max-w-sm">
              The astral spirit now resonates within your plush warrior, amplifying their attributes for the rest of this run!
            </p>

            <button
              onClick={handleProceed}
              className="mt-4 font-pixel text-xs px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl border-2 border-emerald-300 shadow-xl cursor-pointer"
            >
              PROCEED ON MAP ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
