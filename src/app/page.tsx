'use client';

import React, { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { useCombatStore } from '@/store/combatStore';
import { ALL_STUFFIES, STUFFY_MAP } from '@/data/stuffies';
import { MapNode } from '@/types/game';
import { StuffyDraftModal } from '@/components/draft/StuffyDraftModal';
import { TwoPlayerDraft } from '@/components/draft/TwoPlayerDraft';
import { CampaignMap } from '@/components/campaign/CampaignMap';
import { BattleArena } from '@/components/battle/BattleArena';
import { MerchantShop } from '@/components/campaign/MerchantShop';
import { RestSite } from '@/components/campaign/RestSite';
import { EventModal } from '@/components/campaign/EventModal';
import { RewardsModal } from '@/components/campaign/RewardsModal';
import { DeckModal, PartyModal } from '@/components/campaign/Modals';
import { StuffySprite } from '@/components/battle/StuffySprite';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<
    | 'title'
    | 'campaign_draft'
    | 'campaign_map'
    | 'battle'
    | 'merchant'
    | 'rest'
    | 'event'
    | 'rewards'
    | 'twoplayer_draft'
    | 'codex'
  >('title');

  const [activeModal, setActiveModal] = useState<'deck' | 'party' | null>(null);

  const campaign = useCampaignStore();
  const combat = useCombatStore();

  // 1. Campaign Start
  const handleStartCampaignDraft = () => {
    setCurrentScreen('campaign_draft');
  };

  const handleFinishCampaignDraft = (draft: { speciesId: string; loadoutId: string }[]) => {
    campaign.startNewCampaign(draft, 'short');
    setCurrentScreen('campaign_map');
  };

  // 2. Select Map Node
  const handleSelectMapNode = (node: MapNode) => {
    campaign.moveToNode(node.id);

    if (node.type === 'monster' || node.type === 'elite' || node.type === 'boss') {
      // Pick 5 random enemy species that aren't the player's active ones if possible
      const availableEnemies = ALL_STUFFIES.map((s) => s.id).sort(() => Math.random() - 0.5);
      const enemyIds = node.type === 'boss'
        ? ['toothless', 'jefe', 'finlee', 'slugmee', 'thumper'] // Epic Boss squad!
        : availableEnemies.slice(0, 5);

      combat.initializeCampaignBattle(
        campaign.activeParty,
        campaign.deck,
        enemyIds,
        campaign.relics
      );
      setCurrentScreen('battle');
    } else if (node.type === 'merchant') {
      setCurrentScreen('merchant');
    } else if (node.type === 'rest') {
      setCurrentScreen('rest');
    } else if (node.type === 'event') {
      setCurrentScreen('event');
    }
  };

  // 3. Battle End
  const handleBattleEnd = (result: 'victory' | 'defeat') => {
    if (combat.gameMode === 'two_player') {
      // 2P match ended
      setCurrentScreen('title');
      return;
    }

    if (result === 'victory') {
      useCampaignStore.setState({ activeParty: combat.playerTeam });
      campaign.completeNode();
      setCurrentScreen('rewards');
    } else {
      // Campaign Over
      setCurrentScreen('title');
    }
  };

  // 4. Two Player Mode Start
  const handleStartTwoPlayerDraft = () => {
    setCurrentScreen('twoplayer_draft');
  };

  const handleFinishTwoPlayerDraft = (
    p1Team: any,
    p1Deck: any,
    p2Team: any,
    p2Deck: any,
    reserveStuffies: any
  ) => {
    combat.initializeTwoPlayerBattle(p1Team, p1Deck, p2Team, p2Deck, reserveStuffies);
    setCurrentScreen('battle');
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* SCREEN 1: TITLE SCREEN */}
      {currentScreen === 'title' && (
        <div className="w-full h-full flex flex-col items-center justify-between p-6 md:p-12 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black select-none">
          {/* Animated Mascot Row */}
          <div className="flex gap-4 md:gap-8 items-center justify-center mt-6">
            <div className="w-16 h-16 md:w-24 md:h-24">
              <StuffySprite
                stuffy={{
                  instanceId: 'mascot_alex',
                  speciesId: 'alex',
                  name: 'Alex',
                  maxHp: 65,
                  currentHp: 65,
                  shield: 0,
                  isUnstuffed: false,
                  statusEffects: [],
                }}
                size={80}
              />
            </div>
            <div className="w-20 h-20 md:w-28 md:h-28 animate-bounce-short">
              <StuffySprite
                stuffy={{
                  instanceId: 'mascot_jefe',
                  speciesId: 'jefe',
                  name: 'Jefe',
                  maxHp: 78,
                  currentHp: 78,
                  shield: 0,
                  isUnstuffed: false,
                  statusEffects: [],
                }}
                size={96}
              />
            </div>
            <div className="w-16 h-16 md:w-24 md:h-24">
              <StuffySprite
                stuffy={{
                  instanceId: 'mascot_finlee',
                  speciesId: 'finlee',
                  name: 'Finlee',
                  maxHp: 75,
                  currentHp: 75,
                  shield: 0,
                  isUnstuffed: false,
                  statusEffects: [],
                }}
                size={80}
                isFacingLeft={true}
              />
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center my-4">
            <h1 className="font-pixel text-3xl md:text-5xl text-yellow-400 font-extrabold tracking-wider drop-shadow-[0_5px_5px_rgba(234,179,8,0.4)] animate-pulse-fast">
              BEN&apos;S STUFFY
            </h1>
            <h2 className="font-pixel text-xl md:text-3xl text-amber-300 font-bold mt-2 tracking-widest">
              CARD BATTLE ⚔️
            </h2>
            <p className="font-mono text-xs md:text-sm text-slate-300 mt-4 max-w-lg mx-auto">
              16 custom stuffed animals clashing in 5v5 pixel tactical card battles.
              Manage your 7-Cracker energy, restitch fallen allies, and claim victory!
            </p>
          </div>

          {/* Action Menu */}
          <div className="flex flex-col gap-3 w-full max-w-sm mb-6">
            <button
              onClick={handleStartCampaignDraft}
              className="font-pixel text-sm bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold py-4 px-6 rounded-2xl border-4 border-yellow-300 shadow-xl shadow-yellow-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              👑 CAMPAIGN (SLAY THE SPIRE)
            </button>

            <button
              onClick={handleStartTwoPlayerDraft}
              className="font-pixel text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-2xl border-4 border-blue-400 shadow-xl shadow-blue-700/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              🎮 2-PLAYER (PASS &amp; PLAY)
            </button>

            <button
              onClick={() => setCurrentScreen('codex')}
              className="font-pixel text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-3 px-6 rounded-2xl border-2 border-slate-700 transition-all hover:border-slate-500 cursor-pointer"
            >
              📖 STUFFY ROSTER &amp; FOODS (16)
            </button>
          </div>

          {/* Version Footer */}
          <footer className="text-center font-mono text-[10px] text-slate-500">
            Created for Ben • 16-Bit Retro Stuffed Animal Roguelike • Hosted on Vercel
          </footer>
        </div>
      )}

      {/* SCREEN 2: CAMPAIGN DRAFT */}
      {currentScreen === 'campaign_draft' && (
        <StuffyDraftModal onCompleteDraft={handleFinishCampaignDraft} />
      )}

      {/* SCREEN 3: CAMPAIGN MAP */}
      {currentScreen === 'campaign_map' && (
        <CampaignMap
          onSelectNode={handleSelectMapNode}
          onOpenDeckView={() => setActiveModal('deck')}
          onOpenPartyView={() => setActiveModal('party')}
        />
      )}

      {/* SCREEN 4: 5v5 BATTLE ARENA */}
      {currentScreen === 'battle' && (
        <BattleArena onBattleEnd={handleBattleEnd} />
      )}

      {/* SCREEN 5: MERCHANT */}
      {currentScreen === 'merchant' && (
        <MerchantShop
          onLeaveShop={() => {
            campaign.completeNode();
            setCurrentScreen('campaign_map');
          }}
        />
      )}

      {/* SCREEN 6: REST SITE */}
      {currentScreen === 'rest' && (
        <RestSite
          onLeaveRest={() => {
            campaign.completeNode();
            setCurrentScreen('campaign_map');
          }}
        />
      )}

      {/* SCREEN 7: EVENT */}
      {currentScreen === 'event' && (
        <EventModal
          onCompleteEvent={() => {
            campaign.completeNode();
            setCurrentScreen('campaign_map');
          }}
        />
      )}

      {/* SCREEN 8: REWARDS */}
      {currentScreen === 'rewards' && (
        <RewardsModal
          goldEarned={30}
          onClaimAll={() => {
            setCurrentScreen('campaign_map');
          }}
        />
      )}

      {/* SCREEN 9: 2-PLAYER DRAFT */}
      {currentScreen === 'twoplayer_draft' && (
        <TwoPlayerDraft onDraftComplete={handleFinishTwoPlayerDraft} />
      )}

      {/* SCREEN 10: STUFFY CODEX & ROSTER INSPECTOR */}
      {currentScreen === 'codex' && (
        <div className="fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto select-none">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-pixel text-xl text-yellow-400 font-bold">
                THE 16 STUFFY ROSTER &amp; FOOD GUIDE
              </h2>
              <p className="font-mono text-xs text-slate-400">
                Inspect each stuffed animal&apos;s stats, special moves, and food tastes!
              </p>
            </div>
            <button
              onClick={() => setCurrentScreen('title')}
              className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-600 cursor-pointer"
            >
              BACK TO TITLE 🏠
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6 overflow-y-auto">
            {ALL_STUFFIES.map((s) => (
              <div
                key={s.id}
                className="bg-slate-900 border-2 border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-14 h-14">
                      <StuffySprite
                        stuffy={{
                          instanceId: `codex_${s.id}`,
                          speciesId: s.id,
                          name: s.name,
                          maxHp: s.baseHp,
                          currentHp: s.baseHp,
                          shield: 0,
                          isUnstuffed: false,
                          statusEffects: [],
                        }}
                        size={56}
                      />
                    </div>
                    <div>
                      <h3 className="font-pixel text-sm text-yellow-300 font-bold">{s.name}</h3>
                      <span className="font-mono text-[11px] text-slate-400">{s.species} • {s.baseHp} HP</span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-slate-300 mb-2 italic">&quot;{s.description}&quot;</p>
                  <p className="font-mono text-[11px] text-amber-300 mb-2">⚡ {s.passiveDescription}</p>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono">
                  <div className="text-emerald-400 font-bold">FAV: {s.favoriteFoods.join(', ')}</div>
                  <div className="text-sky-300">MID: {s.midFoods.join(', ')}</div>
                  <div className="text-rose-400">HATE: {s.hatedFoods.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OVERLAY MODALS */}
      {activeModal === 'deck' && <DeckModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'party' && <PartyModal onClose={() => setActiveModal(null)} />}
    </div>
  );
}
