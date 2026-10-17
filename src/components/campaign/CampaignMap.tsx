'use client';

import React from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { MapNode, MapNodeType } from '@/types/game';
import { sound } from '@/utils/audio';

interface CampaignMapProps {
  onSelectNode: (node: MapNode) => void;
  onOpenDeckView?: () => void;
  onOpenPartyView?: () => void;
}

const NODE_ICONS: Record<MapNodeType, { icon: string; label: string; color: string }> = {
  monster: { icon: '⚔️', label: 'Monster', color: 'border-red-600 bg-red-950/80 text-red-200' },
  elite: { icon: '👹', label: 'Elite', color: 'border-purple-600 bg-purple-950/80 text-purple-200' },
  rest: { icon: '🏕️', label: 'Rest Site', color: 'border-emerald-600 bg-emerald-950/80 text-emerald-200' },
  event: { icon: '❓', label: 'Event', color: 'border-sky-600 bg-sky-950/80 text-sky-200' },
  merchant: { icon: '🛒', label: 'Merchant', color: 'border-amber-500 bg-amber-950/80 text-amber-200' },
  boss: { icon: '👑', label: 'Boss', color: 'border-yellow-400 bg-yellow-950/90 text-yellow-300 animate-pulse' },
};

export const CampaignMap: React.FC<CampaignMapProps> = ({
  onSelectNode,
  onOpenDeckView,
  onOpenPartyView,
}) => {
  const {
    nodes,
    currentFloor,
    totalFloors,
    currentAct,
    totalActs,
    currentNodeId,
    lastCompletedNodeId,
    gold,
    activeParty,
    relics,
    deck,
  } = useCampaignStore();

  // Group nodes by floor (1 to totalFloors)
  const floorMap: Record<number, MapNode[]> = {};
  nodes.forEach((n) => {
    if (!floorMap[n.floor]) floorMap[n.floor] = [];
    floorMap[n.floor].push(n);
  });

  const sortedFloors = Object.keys(floorMap)
    .map(Number)
    .sort((a, b) => b - a); // Display boss at top, floor 1 at bottom

  const isNodeAvailable = (node: MapNode) => {
    if (node.completed) return false;
    // If no node completed yet, any floor 1 node is available
    if (!lastCompletedNodeId) {
      return node.floor === 1;
    }
    const lastNode = nodes.find((n) => n.id === lastCompletedNodeId);
    if (!lastNode) return node.floor === 1;

    // Node is available if it's on the immediate next floor!
    return node.floor === lastNode.floor + 1;
  };

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col justify-between select-none overflow-hidden text-white font-sans">
      {/* Top Resource Status Bar */}
      <header className="w-full bg-slate-900 border-b-2 border-slate-800 px-4 py-3 flex items-center justify-between z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="font-pixel text-[11px] px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-500 text-yellow-300 font-bold shadow flex items-center gap-1">
            <span>🗺️</span> ACT {currentAct} OF {totalActs}
          </span>
          <span className="font-pixel text-xs text-yellow-400 font-bold">
            FLOOR {currentFloor}/{totalFloors}
          </span>
          <div className="flex items-center gap-1 font-pixel text-xs text-amber-300">
            <span>🪙</span>
            <span>{gold} GOLD</span>
          </div>
        </div>

        {/* Relic Shelf */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-xs">
          {relics.map((relic) => (
            <span
              key={relic.id}
              className="text-lg p-1 bg-slate-800 rounded border border-slate-700 hover:scale-110 transition-transform cursor-help"
              title={`${relic.name}: ${relic.description}`}
            >
              {relic.icon}
            </span>
          ))}
        </div>

        {/* Party & Deck Quick Inspection */}
        <div className="flex gap-2">
          {onOpenPartyView && (
            <button
              onClick={() => {
                sound.playClickSound();
                onOpenPartyView();
              }}
              className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-600 text-slate-200 cursor-pointer"
            >
              🧸 SQUAD ({activeParty.length})
            </button>
          )}
          {onOpenDeckView && (
            <button
              onClick={() => {
                sound.playClickSound();
                onOpenDeckView();
              }}
              className="font-pixel text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-600 text-slate-200 cursor-pointer"
            >
              🃏 DECK ({deck.length})
            </button>
          )}
        </div>
      </header>

      {/* Map Node Path Canvas (Slay the Spire DAG) */}
      <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-start relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        {/* Next Floor Instructions Banner */}
        <div className="w-full max-w-md bg-amber-950/60 border border-amber-500/70 p-2.5 rounded-xl text-center my-2 shadow-lg animate-pulse">
          <span className="font-pixel text-[10px] text-amber-300 font-bold">
            👑 CURRENT FLOOR: {currentFloor} • SELECT A NODE ON FLOOR {currentFloor} ➔
          </span>
        </div>

        <div className="w-full max-w-xl flex flex-col gap-8 py-6">
          {sortedFloors.map((floorNum) => {
            const floorNodes = floorMap[floorNum] || [];
            const isCurrentFloorRow = floorNum === currentFloor;

            return (
              <div key={floorNum} className={`flex flex-col items-center relative p-2 rounded-2xl transition-all ${isCurrentFloorRow ? 'bg-yellow-500/10 border border-yellow-500/30' : ''}`}>
                <span className={`font-pixel text-[9px] absolute left-2 top-1/2 -translate-y-1/2 ${isCurrentFloorRow ? 'text-yellow-400 font-bold' : 'text-slate-600'}`}>
                  F{floorNum}
                </span>

                <div className="flex justify-around w-full gap-4">
                  {floorNodes.map((node) => {
                    const nodeTypeInfo = NODE_ICONS[node.type];
                    const available = isNodeAvailable(node);
                    const isCurrent = node.id === currentNodeId;

                    return (
                      <button
                        key={node.id}
                        disabled={!available}
                        onClick={() => {
                          sound.playClickSound();
                          onSelectNode(node);
                        }}
                        className={`group relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-200 ${
                          nodeTypeInfo.color
                        } ${
                          isCurrent
                            ? 'ring-4 ring-yellow-400 scale-110 shadow-xl'
                            : available
                            ? 'hover:scale-115 cursor-pointer shadow-lg animate-bounce-short ring-2 ring-yellow-400'
                            : node.completed
                            ? 'opacity-40 grayscale cursor-not-allowed border-slate-800'
                            : 'opacity-40 cursor-not-allowed border-slate-800'
                        }`}
                      >
                        <span className="text-2xl drop-shadow">{nodeTypeInfo.icon}</span>
                        <span className="font-pixel text-[8px] mt-1 tracking-tight">
                          {nodeTypeInfo.label}
                        </span>

                        {node.completed && (
                          <span className="absolute -top-2 -right-2 text-xs bg-emerald-600 rounded-full px-1 border border-emerald-300">
                            ✅
                          </span>
                        )}

                        {available && (
                          <span className="absolute -top-2 -right-2 text-xs animate-ping">
                            ✨
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Legend Footer */}
      <footer className="w-full bg-slate-900/80 border-t border-slate-800 px-4 py-2 flex justify-center gap-4 text-xs font-pixel text-slate-400">
        <span>⚔️ Monster</span>
        <span>👹 Elite</span>
        <span>❓ Event</span>
        <span>🛒 Merchant</span>
        <span>🏕️ Rest</span>
        <span>👑 Boss</span>
      </footer>
    </div>
  );
};
