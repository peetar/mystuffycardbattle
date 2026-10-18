'use client';

import React, { useState } from 'react';
import { useCampaignStore } from '@/store/campaignStore';
import { useCombatStore } from '@/store/combatStore';
import { ALL_STUFFIES, STUFFY_MAP, PLAYABLE_STUFFIES, BOSS_SPECIES_IDS } from '@/data/stuffies';
import { MapNode, Relic } from '@/types/game';
import { ALL_RELICS } from '@/data/relics';
import { StuffyDraftModal } from '@/components/draft/StuffyDraftModal';
import { TwoPlayerDraft } from '@/components/draft/TwoPlayerDraft';
import { CampaignMap } from '@/components/campaign/CampaignMap';
import { BattleArena } from '@/components/battle/BattleArena';
import { MerchantShop } from '@/components/campaign/MerchantShop';
import { RestSite } from '@/components/campaign/RestSite';
import { EventModal } from '@/components/campaign/EventModal';
import { RewardsModal } from '@/components/campaign/RewardsModal';
import { DeckModal, PartyModal } from '@/components/campaign/Modals';
import { SettingsModal } from '@/components/common/SettingsModal';
import StatsModal from '@/components/common/StatsModal';
import { StuffySprite } from '@/components/battle/StuffySprite';
import { sound } from '@/utils/audio';
import { getCurrentUsername, getRegisteredUsernames, registerUsername, switchUsername } from '@/utils/userProfile';
import { recordStuffyPick, calculateSkillRating } from '@/utils/playerStats';
import { OnlineLobbyModal } from '@/components/online/OnlineLobbyModal';
import { OnlineRoomView } from '@/components/online/OnlineRoomView';
import { GlobalOnlineChat } from '@/components/online/GlobalOnlineChat';
import { InviteToast } from '@/components/online/InviteToast';
import { onlineNetwork } from '@/utils/onlineNetwork';
import { OnlineRoom, PendingInvite } from '@/app/api/online/route';
import { PlayerSide } from '@/types/game';

export default function Home() {
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<
    | 'title'
    | 'campaign_setup'
    | 'campaign_draft'
    | 'campaign_map'
    | 'battle'
    | 'merchant'
    | 'rest'
    | 'event'
    | 'rewards'
    | 'campaign_victory'
    | 'boss_relic_selection'
    | 'multiplayer_setup'
    | 'twoplayer_draft'
    | 'codex'
    | 'online_room'
  >('title');

  const [activeModal, setActiveModal] = useState<'deck' | 'party' | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bossRelicChoices, setBossRelicChoices] = useState<Relic[]>([]);

  // Online Multiplayer State
  const [isOnlineLobbyOpen, setIsOnlineLobbyOpen] = useState(false);
  const [activeOnlineRoom, setActiveOnlineRoom] = useState<OnlineRoom | null>(null);
  const [pendingInvite, setPendingInvite] = useState<PendingInvite | null>(null);
  const [onlineDraftPlayerNames, setOnlineDraftPlayerNames] = useState<string[]>([]);
  const [onlineDraftBanishedIds, setOnlineDraftBanishedIds] = useState<string[]>([]);

  // Username state (persisted via cookies with duplicate device prevention)
  const [username, setUsername] = useState<string>('');
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');

  const userSkillRating = calculateSkillRating();

  React.useEffect(() => {
    const saved = getCurrentUsername();
    if (saved) {
      setUsername(saved);
      // Start real-time invite listener for this player!
      onlineNetwork.startInviteListener(saved, (invite) => {
        setPendingInvite(invite);
      });
    } else {
      setIsUsernameModalOpen(true);
    }

    return () => {
      onlineNetwork.stopInviteListener();
    };
  }, []);

  // Campaign length setup state
  const [selectedRunLength, setSelectedRunLength] = useState<'short' | 'standard' | 'marathon'>('standard');
  const [customFloorCount, setCustomFloorCount] = useState<number>(8);
  const [useCustomFloors, setUseCustomFloors] = useState<boolean>(false);
  const [selectedActsCount, setSelectedActsCount] = useState<number>(3); // Default 3 Acts!
  const [lastBattleGold, setLastBattleGold] = useState<number>(75);

  // Multiplayer setup state (2, 3, or 4 players)
  const [multiplayerPlayerCount, setMultiplayerPlayerCount] = useState<number>(2);

  const campaign = useCampaignStore();
  const combat = useCombatStore();

  // 1. Campaign Start: Open Setup Configuration Screen first!
  const handleStartCampaignSetup = () => {
    sound.init();
    sound.playClickSound();
    setCurrentScreen('campaign_setup');
  };

  const handleFinishCampaignDraft = (
    draft: { speciesId: string; loadoutId: string }[],
    runLength?: 'short' | 'standard' | 'marathon',
    actsCount?: number
  ) => {
    sound.init();
    sound.playClickSound();
    draft.forEach((pick) => {
      const species = ALL_STUFFIES.find((s) => s.id === pick.speciesId);
      recordStuffyPick(pick.speciesId, species?.name);
    });
    const effectiveRunLength = runLength || selectedRunLength;
    const effectiveCustomFloors = useCustomFloors ? customFloorCount : undefined;
    const effectiveActs = actsCount || selectedActsCount;
    campaign.startNewCampaign(draft, effectiveRunLength, effectiveCustomFloors, effectiveActs);
    sound.startMusic();
    setCurrentScreen('campaign_map');
  };

  // 2. Select Map Node
  const handleSelectMapNode = (node: MapNode) => {
    campaign.moveToNode(node.id);

    if (node.type === 'monster' || node.type === 'elite' || node.type === 'boss') {
      // Scale gold reward dynamically by difficulty!
      if (node.type === 'monster') {
        setLastBattleGold(65 + Math.floor(Math.random() * 25)); // 65-90 Gold
      } else if (node.type === 'elite') {
        setLastBattleGold(130 + Math.floor(Math.random() * 40)); // 130-170 Gold
      } else {
        setLastBattleGold(250 + Math.floor(Math.random() * 60)); // 250-310 Gold
      }

      // Monsters & Elites strictly pick from playable stuffies (never boss-only creatures)
      const availableEnemies = PLAYABLE_STUFFIES.map((s) => s.id).sort(() => Math.random() - 0.5);

      let enemyIds: string[];
      if (node.type === 'boss') {
        // Diverse Boss Encounters:
        // 1. The Stuffy Amalgam (5-split colossal boss)
        // 2. The Legendary Mega Trinity (Mega Alex, Mega Finlee, Mega Jefe)
        // 3. The Noxious Slime King (Compounding Poison Boss)
        // 4. The Static Sapper (Strength & Energy Draining Boss)
        // 5. Doomsday Chrono-Bear (Tactical Fluff Nuke every 3 turns)
        // 6. Ignis the Cinder Drake (Sets you on Fire; discard burns allies)
        // 7. Scrappy the Graverobber (Plays from player Discard Pile)
        // 8. Psychic Mind-Leech (Plays from player Draw Pile)
        // 9. All-Aquatic Animals Squad (Dolphy, Finlee, Chanteira, Kraken, Ray)
        // 10. Life-Linked Trinity (Aegis, Fang, Talon; kill all within 3 turns)
        // 11. Shadow the Ultimate (Doubling Energy Strength & Chaos Bursts)
        // 12. The Mirror Doppelganger (Reflects 30% damage)
        // 13. The Fluff Devourer (Swallows stuffies)
        // 14. Surge the Thunder Golem (EMP Stuns)
        const bossChoices = [
          ['amalgam'],
          ['alex', 'finlee', 'jefe'],
          ['toxic_slug'],
          ['lint_vampire'],
          ['clockwork_nuke'],
          ['cinder_beast'],
          ['grave_scavenger'],
          ['mind_puppeteer'],
          ['dolphy', 'finlee', 'chanteira', 'aquatic_kraken', 'aquatic_ray'],
          ['tri_link_alpha', 'tri_link_beta', 'tri_link_gamma'],
          ['shadow_hedgehog'],
          ['mirror_mimic'],
          ['fluff_gorgon'],
          ['volt_colossus'],
        ];
        enemyIds = bossChoices[Math.floor(Math.random() * bossChoices.length)];
      } else {
        enemyIds = availableEnemies.slice(0, 5);
      }

      combat.initializeCampaignBattle(
        campaign.activeParty,
        campaign.deck,
        enemyIds,
        campaign.relics,
        campaign.bench,
        node.type as 'monster' | 'elite' | 'boss'
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
    if (combat.gameMode === 'two_player' || combat.gameMode === 'multiplayer') {
      // Match ended
      setCurrentScreen('title');
      return;
    }

    if (result === 'victory') {
      const currentNode = campaign.nodes.find((n) => n.id === campaign.currentNodeId);
      const isBossDefeated = currentNode?.type === 'boss';

      const persistedParty = combat.playerTeam.map((stuffy) => {
        let hp = stuffy.currentHp;
        let isUnstuffed = stuffy.isUnstuffed;
        if (stuffy.isUnstuffed) {
          // Unstuffed stuffies revive to 10% max HP rounded to nearest whole number
          hp = Math.max(1, Math.round(stuffy.maxHp * 0.10));
          isUnstuffed = false;
        }
        return {
          ...stuffy,
          currentHp: hp,
          shield: 0,
          isUnstuffed,
          statusEffects: [],
        };
      });

      useCampaignStore.setState({ activeParty: persistedParty });

      if (isBossDefeated) {
        // RULE: Only do the win on the last act!
        if (campaign.currentAct >= campaign.totalActs) {
          campaign.completeNode();
          setCurrentScreen('campaign_victory');
          return;
        } else {
          // At the end of mid-act boss battles, present 3 Boss Relics to choose 1 from!
          campaign.completeNode();
          const unownedRelics = ALL_RELICS.filter(
            (r) => !campaign.relics.some((owned) => owned.id === r.id)
          ).sort(() => Math.random() - 0.5);
          const pool = unownedRelics.length >= 3 ? unownedRelics : ALL_RELICS.sort(() => Math.random() - 0.5);
          setBossRelicChoices(pool.slice(0, 3));
          setCurrentScreen('boss_relic_selection');
          return;
        }
      }

      campaign.completeNode();
      setCurrentScreen('rewards');
    } else {
      // Campaign Over
      setCurrentScreen('title');
    }
  };

  // 4. Multiplayer Mode Start
  const handleStartMultiplayerSetup = () => {
    sound.init();
    sound.playClickSound();
    setCurrentScreen('multiplayer_setup');
  };

  const handleFinishMultiplayerDraft = (
    arg1: any,
    arg2?: any,
    arg3?: any,
    arg4?: any,
    arg5?: any
  ) => {
    if (Array.isArray(arg1) && arg1.length > 0 && typeof arg1[0] === 'object' && ('color' in arg1[0] || 'team' in arg1[0])) {
      // (players: MultiplayerPlayerData[], reserveStuffies: StuffyState[])
      arg1.forEach((player: any) => {
        if (player.team && Array.isArray(player.team)) {
          player.team.forEach((s: any) => recordStuffyPick(s.speciesId, s.name));
        }
      });
      const myMatch = arg1.find((p: any) => p.name.toLowerCase().includes((username || 'Player').toLowerCase()));
      const myId: PlayerSide = myMatch ? myMatch.id : 'p1';
      combat.initializeMultiplayerBattle(arg1, arg2 || [], myId);

      // If online room is active, sync battle state to other players
      if (activeOnlineRoom) {
        onlineNetwork.syncGameAction(activeOnlineRoom.id, 'battle', { players: arg1 }, activeOnlineRoom);
      }
    } else {
      // legacy signature (p1Team, p1Deck, p2Team, p2Deck, reserveStuffies)
      combat.initializeTwoPlayerBattle(arg1, arg2, arg3, arg4, arg5);
    }
    setCurrentScreen('battle');
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* SCREEN 1: TITLE SCREEN */}
      {currentScreen === 'title' && (
        <div className="w-full h-full flex flex-col items-center justify-between p-6 md:p-12 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black select-none">
          {/* Animated Mascot Row */}
          <div className="flex gap-3 md:gap-6 items-center justify-center mt-6">
            <div className="w-14 h-14 md:w-20 md:h-20 animate-pulse">
              <StuffySprite
                stuffy={{
                  instanceId: 'mascot_shadow',
                  speciesId: 'shadow',
                  name: 'Shadow',
                  maxHp: 76,
                  currentHp: 76,
                  shield: 0,
                  isUnstuffed: false,
                  statusEffects: [],
                }}
                size={70}
              />
            </div>
            <div className="w-14 h-14 md:w-20 md:h-20">
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
                size={72}
              />
            </div>
            <div className="w-18 h-18 md:w-24 md:h-24 animate-bounce-short">
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
                size={88}
              />
            </div>
            <div className="w-14 h-14 md:w-20 md:h-20">
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
                size={72}
                isFacingLeft={true}
              />
            </div>
            <div className="w-14 h-14 md:w-20 md:h-20 animate-pulse">
              <StuffySprite
                stuffy={{
                  instanceId: 'mascot_dolphy',
                  speciesId: 'dolphy',
                  name: 'Dolphy',
                  maxHp: 98,
                  currentHp: 98,
                  shield: 0,
                  isUnstuffed: false,
                  statusEffects: [],
                }}
                size={74}
                isFacingLeft={true}
              />
            </div>
            <div className="w-14 h-14 md:w-20 md:h-20 animate-bounce-short">
              <StuffySprite
                stuffy={{
                  instanceId: 'mascot_spot',
                  speciesId: 'spot',
                  name: 'Spot',
                  maxHp: 78,
                  currentHp: 78,
                  shield: 0,
                  isUnstuffed: false,
                  statusEffects: [],
                }}
                size={72}
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
            <div className="inline-block bg-yellow-500/15 border border-yellow-500/40 rounded-xl px-3.5 py-1.5 mt-3 shadow-sm">
              <span className="font-pixel text-[10px] md:text-xs text-yellow-300 font-bold tracking-wider">
                ✨ v2.5 BOSS INFLUX UPDATE
              </span>
            </div>
            <p className="font-mono text-xs md:text-sm text-slate-300 mt-2.5 max-w-lg mx-auto leading-relaxed">
              10 colossal new bosses have awakened! Battle the 3-Turn Countdown Nuke, Cinder Drake&apos;s fires, Graverobber&apos;s discard thief, the All-Aquatic Squad, and the Life-Linked Trinity!
            </p>
          </div>

          {/* Active Player Profile Badge */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-yellow-500/50 px-4 py-2 rounded-2xl shadow-lg backdrop-blur mb-3">
            <span className="text-xl">👤</span>
            <div className="flex flex-col text-left">
              <span className="font-pixel text-[9px] text-slate-400">PLAYER PROFILE</span>
              <span className="font-pixel text-xs text-yellow-300 font-bold">
                {username || 'Anonymous Player'}
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClickSound();
                setUsernameInput(username);
                setUsernameError('');
                setIsUsernameModalOpen(true);
              }}
              className="font-pixel text-[9px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-600 ml-2 cursor-pointer shadow transition-all hover:scale-105 active:scale-95"
            >
              ✏️ CHANGE
            </button>
          </div>

          {/* Action Menu */}
          <div className="flex flex-col gap-3 w-full max-w-sm mb-6">
            <button
              onClick={handleStartCampaignSetup}
              className="font-pixel text-sm bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold py-4 px-6 rounded-2xl border-4 border-yellow-300 shadow-xl shadow-yellow-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              👑 CAMPAIGN (SLAY THE SPIRE)
            </button>

            <button
              onClick={() => {
                sound.playClickSound();
                setIsOnlineLobbyOpen(true);
              }}
              className="font-pixel text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-2xl border-4 border-cyan-300 shadow-xl shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🌐</span>
              <span>ONLINE MULTIPLAYER (ROOMS &amp; QUEUE)</span>
            </button>

            <button
              onClick={handleStartMultiplayerSetup}
              className="font-pixel text-sm bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-2xl border-2 border-purple-400 shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              🎮 2-4 PLAYERS (PASS &amp; PLAY)
            </button>

            <button
              onClick={() => setCurrentScreen('codex')}
              className="font-pixel text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-3 px-6 rounded-2xl border-2 border-slate-700 transition-all hover:border-slate-500 cursor-pointer"
            >
              📖 STUFFY ROSTER &amp; BOSS CODEX ({ALL_STUFFIES.length})
            </button>

            <button
              onClick={() => {
                sound.playClickSound();
                setIsStatsOpen(true);
              }}
              className="font-pixel text-xs bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-yellow-300 font-bold py-3 px-6 rounded-2xl border-2 border-purple-500 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <span>📊</span>
              <span>HALL OF RECORDS &amp; STATS</span>
            </button>
          </div>

          {/* Version Footer */}
          <footer className="text-center font-mono text-[10px] text-slate-500">
            Created for Ben • 16-Bit Retro Stuffed Animal Roguelike • Hosted on Vercel
          </footer>
        </div>
      )}

      {/* SCREEN: CAMPAIGN EXPEDITION SETUP */}
      {currentScreen === 'campaign_setup' && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-6 select-none overflow-y-auto text-white">
          <div className="text-center my-4 max-w-xl">
            <h2 className="font-pixel text-2xl text-yellow-400 font-bold tracking-wider mb-2">
              👑 CONFIGURE YOUR CAMPAIGN
            </h2>
            <p className="font-pixel text-xs text-slate-300">
              Choose your expedition length before drafting your squad! Each floor generates procedural branching paths.
            </p>
          </div>

          {/* Expedition Presets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full my-4">
            {/* 1. Short */}
            <div
              onClick={() => {
                sound.playClickSound();
                setSelectedRunLength('short');
                setUseCustomFloors(false);
              }}
              className={`p-5 rounded-2xl border-4 cursor-pointer flex flex-col justify-between transition-all hover:scale-105 ${
                !useCustomFloors && selectedRunLength === 'short'
                  ? 'bg-amber-950/70 border-yellow-400 ring-4 ring-yellow-400/50 shadow-2xl'
                  : 'bg-slate-900 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">⚡</span>
                  <span className="font-pixel text-[10px] px-2 py-0.5 rounded bg-amber-900 text-yellow-200 border border-amber-500">
                    5 FLOORS
                  </span>
                </div>
                <h3 className="font-pixel text-base font-bold text-yellow-300 mb-1">
                  SHORT EXPEDITION
                </h3>
                <p className="font-sans text-xs text-slate-300">
                  Quick run through the playroom. Perfect for a brisk battle with 1 climactic Boss! (~10 mins)
                </p>
              </div>
              <div className="font-pixel text-[10px] text-emerald-400 mt-4">
                {!useCustomFloors && selectedRunLength === 'short' ? '✅ SELECTED' : 'CLICK TO SELECT'}
              </div>
            </div>

            {/* 2. Standard */}
            <div
              onClick={() => {
                sound.playClickSound();
                setSelectedRunLength('standard');
                setUseCustomFloors(false);
              }}
              className={`p-5 rounded-2xl border-4 cursor-pointer flex flex-col justify-between transition-all hover:scale-105 ${
                !useCustomFloors && selectedRunLength === 'standard'
                  ? 'bg-amber-950/70 border-yellow-400 ring-4 ring-yellow-400/50 shadow-2xl'
                  : 'bg-slate-900 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">👑</span>
                  <span className="font-pixel text-[10px] px-2 py-0.5 rounded bg-amber-900 text-yellow-200 border border-amber-500">
                    8 FLOORS
                  </span>
                </div>
                <h3 className="font-pixel text-base font-bold text-yellow-300 mb-1">
                  STANDARD JOURNEY
                </h3>
                <p className="font-sans text-xs text-slate-300">
                  The quintessential Slay-the-Spire adventure. Balanced deck building, elites, rest sites, and merchant. (~25 mins)
                </p>
              </div>
              <div className="font-pixel text-[10px] text-emerald-400 mt-4">
                {!useCustomFloors && selectedRunLength === 'standard' ? '✅ SELECTED' : 'CLICK TO SELECT'}
              </div>
            </div>

            {/* 3. Marathon */}
            <div
              onClick={() => {
                sound.playClickSound();
                setSelectedRunLength('marathon');
                setUseCustomFloors(false);
              }}
              className={`p-5 rounded-2xl border-4 cursor-pointer flex flex-col justify-between transition-all hover:scale-105 ${
                !useCustomFloors && selectedRunLength === 'marathon'
                  ? 'bg-amber-950/70 border-yellow-400 ring-4 ring-yellow-400/50 shadow-2xl'
                  : 'bg-slate-900 border-slate-700 hover:border-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🏆</span>
                  <span className="font-pixel text-[10px] px-2 py-0.5 rounded bg-amber-900 text-yellow-200 border border-amber-500">
                    12 FLOORS
                  </span>
                </div>
                <h3 className="font-pixel text-base font-bold text-yellow-300 mb-1">
                  EPIC MARATHON
                </h3>
                <p className="font-sans text-xs text-slate-300">
                  Extended gauntlet with multiple elite encounters, massive merchant hoarding, and epic boss squads! (~45 mins)
                </p>
              </div>
              <div className="font-pixel text-[10px] text-emerald-400 mt-4">
                {!useCustomFloors && selectedRunLength === 'marathon' ? '✅ SELECTED' : 'CLICK TO SELECT'}
              </div>
            </div>
          </div>

          {/* Custom Floor Count Controls */}
          <div className="max-w-xl w-full bg-slate-900/90 border-2 border-slate-700 p-4 rounded-2xl flex flex-col items-center gap-3 my-2">
            <div className="flex items-center justify-between w-full">
              <span className="font-pixel text-xs text-yellow-300 font-bold">
                🛠️ OR CHOOSE CUSTOM FLOOR COUNT:
              </span>
              <button
                onClick={() => {
                  sound.playClickSound();
                  setUseCustomFloors(!useCustomFloors);
                }}
                className={`font-pixel text-[10px] px-3 py-1 rounded-lg border cursor-pointer ${
                  useCustomFloors
                    ? 'bg-emerald-600 border-emerald-400 text-white font-bold shadow'
                    : 'bg-slate-800 border-slate-600 text-slate-400'
                }`}
              >
                {useCustomFloors ? 'CUSTOM ACTIVE ✅' : 'ENABLE CUSTOM'}
              </button>
            </div>

            {useCustomFloors && (
              <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    sound.playClickSound();
                    setCustomFloorCount(Math.max(3, customFloorCount - 1));
                  }}
                  className="font-pixel text-sm px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 cursor-pointer"
                >
                  -
                </button>
                <span className="font-pixel text-sm text-yellow-400 font-bold min-w-[100px] text-center">
                  {customFloorCount} FLOORS
                </span>
                <button
                  onClick={() => {
                    sound.playClickSound();
                    setCustomFloorCount(Math.min(15, customFloorCount + 1));
                  }}
                  className="font-pixel text-sm px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded border border-slate-600 cursor-pointer"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Act Count Selector (1 - 5 Acts) */}
          <div className="max-w-xl w-full bg-slate-900/90 border-2 border-slate-700 p-4 rounded-2xl flex flex-col items-center gap-2 my-2">
            <div className="flex items-center justify-between w-full">
              <span className="font-pixel text-xs text-yellow-300 font-bold">
                🗺️ CHOOSE CAMPAIGN ACTS (1 - 5 ACTS):
              </span>
              <span className="font-pixel text-[10px] text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-500/50">
                {selectedActsCount} {selectedActsCount === 1 ? 'ACT' : 'ACTS'}
              </span>
            </div>
            <p className="font-sans text-[11px] text-slate-300 text-left w-full">
              Each Act contains {useCustomFloors ? customFloorCount : (selectedRunLength === 'short' ? 5 : selectedRunLength === 'marathon' ? 12 : 8)} procedural floors and ends with a unique Boss battle!
            </p>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((actNum) => (
                <button
                  key={actNum}
                  type="button"
                  onClick={() => {
                    sound.playClickSound();
                    setSelectedActsCount(actNum);
                  }}
                  className={`font-pixel text-xs px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    selectedActsCount === actNum
                      ? 'bg-amber-600 border-yellow-300 text-white font-bold ring-2 ring-yellow-400 scale-105'
                      : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                  }`}
                >
                  {actNum} {actNum === 1 ? 'ACT' : 'ACTS'}
                </button>
              ))}
            </div>
          </div>

          {/* Confirmation / Back Buttons */}
          <div className="flex gap-4 my-4">
            <button
              onClick={() => {
                sound.playClickSound();
                setCurrentScreen('title');
              }}
              className="font-pixel text-xs px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-600 cursor-pointer"
            >
              BACK TO TITLE 🏠
            </button>
            <button
              onClick={() => {
                sound.playClickSound();
                setCurrentScreen('campaign_draft');
              }}
              className="font-pixel text-xs px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold rounded-xl border-2 border-emerald-300 shadow-xl shadow-emerald-700/40 cursor-pointer hover:scale-105 active:scale-95 transition-all"
            >
              CONFIRM &amp; DRAFT 5 STUFFIES ➡️
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: CAMPAIGN DRAFT */}
      {currentScreen === 'campaign_draft' && (
        <StuffyDraftModal onCompleteDraft={handleFinishCampaignDraft} showRunLengthSelector={false} />
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
        <BattleArena
          onBattleEnd={handleBattleEnd}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
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
          goldEarned={lastBattleGold}
          onClaimAll={() => {
            const lastNode = campaign.nodes.find((n) => n.id === campaign.lastCompletedNodeId);
            if (lastNode?.type === 'boss') {
              if (campaign.currentAct >= campaign.totalActs) {
                setCurrentScreen('campaign_victory');
              } else {
                const unownedRelics = ALL_RELICS.filter(
                  (r) => !campaign.relics.some((owned) => owned.id === r.id)
                ).sort(() => Math.random() - 0.5);
                const pool = unownedRelics.length >= 3 ? unownedRelics : ALL_RELICS.sort(() => Math.random() - 0.5);
                setBossRelicChoices(pool.slice(0, 3));
                setCurrentScreen('boss_relic_selection');
              }
            } else {
              setCurrentScreen('campaign_map');
            }
          }}
        />
      )}

      {/* SCREEN: MULTIPLAYER SETUP (Choose 2-4 Players) */}
      {currentScreen === 'multiplayer_setup' && (
        <div className="w-full h-full flex flex-col items-center justify-between p-6 md:p-12 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950 via-slate-950 to-black select-none overflow-y-auto">
          <div className="text-center my-4">
            <span className="text-5xl block animate-bounce mb-2">🎮🧸</span>
            <h1 className="font-pixel text-2xl md:text-4xl text-yellow-400 font-extrabold tracking-wider">
              LOCAL MULTIPLAYER SETUP
            </h1>
            <p className="font-pixel text-xs text-slate-300 mt-2">
              Choose how many players will battle around the plush arena table!
            </p>
          </div>

          {/* Player Count Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full my-6">
            {/* 2 Players */}
            <div
              onClick={() => setMultiplayerPlayerCount(2)}
              className={`p-6 rounded-2xl border-4 cursor-pointer transition-all flex flex-col justify-between text-center ${
                multiplayerPlayerCount === 2
                  ? 'bg-blue-950/80 border-yellow-400 ring-4 ring-yellow-400/40 scale-105 shadow-2xl'
                  : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:scale-102 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <span className="text-4xl block mb-2">⚔️</span>
                <h3 className="font-pixel text-lg text-yellow-300 font-bold mb-1">2 PLAYERS</h3>
                <span className="font-pixel text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/50">
                  1v1 HEAD-TO-HEAD
                </span>
                <p className="font-sans text-xs text-slate-300 mt-3 leading-relaxed">
                  You on the bottom, opponent ahead. Draft 5 stuffies each. 6 reserve stuffies in the reinforcement pool!
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-[11px] text-amber-300">
                Table: Bottom vs Ahead
              </div>
            </div>

            {/* 3 Players */}
            <div
              onClick={() => setMultiplayerPlayerCount(3)}
              className={`p-6 rounded-2xl border-4 cursor-pointer transition-all flex flex-col justify-between text-center ${
                multiplayerPlayerCount === 3
                  ? 'bg-blue-950/80 border-yellow-400 ring-4 ring-yellow-400/40 scale-105 shadow-2xl'
                  : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:scale-102 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <span className="text-4xl block mb-2">⚡</span>
                <h3 className="font-pixel text-lg text-yellow-300 font-bold mb-1">3 PLAYERS</h3>
                <span className="font-pixel text-[10px] text-purple-400 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-500/50">
                  1v1v1 TRIO BATTLE
                </span>
                <p className="font-sans text-xs text-slate-300 mt-3 leading-relaxed">
                  You on bottom, one ahead, one on the right. Draft 4 stuffies each. First casualty: victim gets 2 reserve, others get 1!
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-[11px] text-amber-300">
                Table: Bottom, Ahead, Right
              </div>
            </div>

            {/* 4 Players */}
            <div
              onClick={() => setMultiplayerPlayerCount(4)}
              className={`p-6 rounded-2xl border-4 cursor-pointer transition-all flex flex-col justify-between text-center ${
                multiplayerPlayerCount === 4
                  ? 'bg-blue-950/80 border-yellow-400 ring-4 ring-yellow-400/40 scale-105 shadow-2xl'
                  : 'bg-slate-900 border-slate-700 hover:border-slate-500 hover:scale-102 opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <span className="text-4xl block mb-2">👑</span>
                <h3 className="font-pixel text-lg text-yellow-300 font-bold mb-1">4 PLAYERS</h3>
                <span className="font-pixel text-[10px] text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-500/50">
                  4-WAY FREE-FOR-ALL
                </span>
                <p className="font-sans text-xs text-slate-300 mt-3 leading-relaxed">
                  You on bottom, one ahead, one on the right, one on the left. Draft 4 stuffies each (all 16 stuffies drafted)!
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 font-mono text-[11px] text-amber-300">
                Table: Bottom, Ahead, Right, Left
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setCurrentScreen('title')}
              className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 py-3 rounded-xl border border-slate-600 cursor-pointer"
            >
              BACK TO TITLE
            </button>
            <button
              onClick={() => {
                sound.playClickSound();
                setCurrentScreen('twoplayer_draft');
              }}
              className="font-pixel text-sm bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold px-10 py-3.5 rounded-xl border-4 border-yellow-300 shadow-xl shadow-yellow-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
            >
              PROCEED TO {multiplayerPlayerCount}-PLAYER DRAFT ➔
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 9: MULTIPLAYER DRAFT */}
      {currentScreen === 'twoplayer_draft' && (
        <TwoPlayerDraft
          playerCount={multiplayerPlayerCount}
          playerNames={onlineDraftPlayerNames.length > 0 ? onlineDraftPlayerNames : undefined}
          initialBanishedIds={onlineDraftBanishedIds}
          onDraftComplete={handleFinishMultiplayerDraft}
          onMultiplayerDraftComplete={handleFinishMultiplayerDraft}
        />
      )}

      {/* SCREEN: BOSS RELIC SELECTION (After Mid-Act Boss) */}
      {currentScreen === 'boss_relic_selection' && (
        <div className="w-full h-full flex flex-col items-center justify-between p-6 md:p-12 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950 via-slate-950 to-black select-none overflow-y-auto">
          <div className="text-center my-4">
            <span className="text-6xl block animate-bounce mb-3">👑💎</span>
            <h1 className="font-pixel text-2xl md:text-5xl text-yellow-400 font-extrabold tracking-wider">
              ACT {campaign.currentAct} BOSS DEFEATED!
            </h1>
            <p className="font-pixel text-xs md:text-sm text-amber-300 mt-2">
              Select 1 Boss Relic to empower your plush squad for Act {campaign.currentAct + 1}!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full my-6">
            {bossRelicChoices.map((relic) => (
              <div
                key={relic.id}
                className="bg-slate-900/90 border-2 border-yellow-500/60 hover:border-yellow-400 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl hover:scale-105 transition-all group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {relic.icon || '🎁'}
                </div>
                <h3 className="font-pixel text-base text-yellow-300 font-bold mb-2">
                  {relic.name}
                </h3>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 mb-3 border border-yellow-500/30">
                  {relic.rarity || 'boss'} Relic
                </span>
                <p className="font-mono text-xs text-slate-300 mb-6 flex-1">
                  {relic.description || 'A legendary artifact that bestows plush powers.'}
                </p>
                <button
                  onClick={() => {
                    campaign.addRelic(relic);
                    sound.playRewardSound();
                    campaign.advanceAct();
                    setBossRelicChoices([]);
                    setCurrentScreen('campaign_map');
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-pixel text-xs font-bold rounded-xl shadow-lg hover:shadow-yellow-500/40 transition-all active:scale-95"
                >
                  CLAIM &amp; ENTER ACT {campaign.currentAct + 1}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center pb-4 text-xs font-mono text-slate-400">
            Current Party: {campaign.activeParty.map((s) => s.name).join(', ')} • Relics Owned: {campaign.relics.length}
          </div>
        </div>
      )}

      {/* SCREEN: GRAND CAMPAIGN VICTORY */}
      {currentScreen === 'campaign_victory' && (
        <div className="w-full h-full flex flex-col items-center justify-between p-6 md:p-12 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950 via-slate-950 to-black select-none overflow-y-auto">
          <div className="text-center my-4">
            <span className="text-7xl block animate-bounce mb-3">👑🏆👑</span>
            <h1 className="font-pixel text-2xl md:text-5xl text-yellow-400 font-extrabold tracking-wider animate-pulse">
              GRAND CAMPAIGN VICTORY!
            </h1>
            <h2 className="font-pixel text-sm md:text-xl text-amber-300 font-bold mt-2">
              YOU CONQUERED ALL {campaign.totalFloors} FLOORS &amp; SLAYED THE FINAL BOSS!
            </h2>
            <p className="font-mono text-xs md:text-sm text-slate-300 mt-4 max-w-lg mx-auto">
              Ben&apos;s plush squad stood unconquerable! Your stuffed animals celebrate with all the crackers and stuffing they could ever dream of!
            </p>
          </div>

          {/* Victorious Party */}
          <div className="bg-slate-900/80 border-4 border-yellow-500 rounded-3xl p-6 max-w-2xl w-full shadow-2xl backdrop-blur my-4">
            <h3 className="font-pixel text-xs text-yellow-300 font-bold mb-4 text-center">
              ⭐ VICTORIOUS STUFFY SQUAD ⭐
            </h3>
            <div className="grid grid-cols-5 gap-3 justify-items-center">
              {campaign.activeParty.map((stuffy) => (
                <div
                  key={stuffy.instanceId}
                  className="flex flex-col items-center bg-slate-950 p-2 rounded-xl border border-yellow-500/40"
                >
                  <StuffySprite stuffy={stuffy} size={56} />
                  <span className="font-pixel text-[9px] text-yellow-300 font-bold mt-1 text-center truncate w-full">
                    {stuffy.name}
                  </span>
                  <span className="font-mono text-[8px] text-emerald-400">
                    {stuffy.currentHp}/{stuffy.maxHp} HP
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-around items-center mt-6 pt-4 border-t border-slate-800 font-pixel text-xs text-amber-400">
              <div>💰 GOLD HOARD: {campaign.gold}</div>
              <div>✨ RELICS: {campaign.relics.length}</div>
              <div>🎴 CARDS: {campaign.deck.length}</div>
            </div>
          </div>

          {/* Return to Title Button */}
          <button
            onClick={() => {
              sound.playClickSound();
              campaign.abandonRun();
              setCurrentScreen('title');
            }}
            className="font-pixel text-sm bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold py-4 px-10 rounded-2xl border-4 border-yellow-300 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            CLAIM GLORY &amp; RETURN TO TITLE 🏆
          </button>
        </div>
      )}

      {/* SCREEN 10: STUFFY CODEX & ROSTER INSPECTOR */}
      {currentScreen === 'codex' && (
        <div className="fixed inset-0 z-50 bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto select-none">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-pixel text-xl text-yellow-400 font-bold">
                THE STUFFY CODEX &amp; BOSS ENCYCLOPEDIA
              </h2>
              <p className="font-mono text-xs text-slate-400">
                Inspect all {PLAYABLE_STUFFIES.length} playable heroes and {BOSS_SPECIES_IDS.size} colossal campaign bosses!
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
            {/* Playable Hero Stuffies Header */}
            <div className="col-span-full mb-1 flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-pixel text-sm text-yellow-300 font-bold flex items-center gap-2">
                <span>🧸 PLAYABLE HERO STUFFIES</span>
                <span className="text-[10px] text-slate-400 font-mono">({PLAYABLE_STUFFIES.length} TOTAL)</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">Pickable in Campaign &amp; Drafts</span>
            </div>

            {PLAYABLE_STUFFIES.map((s) => (
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

            {/* PROMINENT DIVIDER LINE BETWEEN PLAYABLE HERO STUFFIES AND COLOSSAL BOSSES */}
            <div className="col-span-full my-8 flex items-center gap-4">
              <div className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent flex-1" />
              <div className="font-pixel text-xs md:text-sm text-red-300 font-bold px-6 py-2.5 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-red-500/80 rounded-2xl shadow-xl flex items-center gap-2.5 tracking-wider">
                <span>💀</span>
                <span>COLOSSAL CAMPAIGN BOSSES &amp; SPECIAL ENCOUNTERS ({BOSS_SPECIES_IDS.size})</span>
                <span>💀</span>
              </div>
              <div className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent flex-1" />
            </div>

            {ALL_STUFFIES.filter((s) => BOSS_SPECIES_IDS.has(s.id)).map((s) => (
              <div
                key={s.id}
                className="bg-gradient-to-b from-slate-900 to-red-950/40 border-2 border-red-800/80 p-4 rounded-2xl flex flex-col justify-between shadow-lg"
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
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-pixel text-sm text-red-400 font-bold">{s.name}</h3>
                        <span className="font-pixel text-[8px] bg-red-950 border border-red-600 text-red-300 px-1.5 py-0.5 rounded">BOSS</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">{s.species} • {s.baseHp} HP</span>
                    </div>
                  </div>

                  <p className="font-sans text-xs text-slate-300 mb-2 italic">&quot;{s.description}&quot;</p>
                  <p className="font-mono text-[11px] text-amber-400 mb-2 font-semibold">💀 {s.passiveDescription}</p>
                </div>

                <div className="pt-2 border-t border-red-900/50 text-[10px] font-mono text-red-400 font-bold flex items-center justify-between">
                  <span>CAMPAIGN BOSS THREAT</span>
                  <span>⭐ SPECIAL AI</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GLOBAL PERSISTENT SETTINGS BUTTON (Hidden in battle to prevent overlapping header view cards button) */}
      {currentScreen !== 'battle' && (
        <button
          onClick={() => {
            sound.playClickSound();
            setIsSettingsOpen(true);
          }}
          className="fixed top-3 right-3 z-40 bg-slate-900/90 hover:bg-slate-800 text-yellow-300 font-pixel text-xs px-3 py-1.5 rounded-xl border border-yellow-500/60 shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
          title="Open Audio & Game Settings"
        >
          <span className="text-sm">⚙️</span>
          <span className="hidden sm:inline">SETTINGS</span>
        </button>
      )}

      {/* USERNAME REGISTRATION & PROFILE MODAL */}
      {isUsernameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border-4 border-yellow-500 rounded-3xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">👤🧸</span>
              <h2 className="font-pixel text-lg md:text-xl text-yellow-400 font-bold">
                PLAYER USERNAME
              </h2>
            </div>
            <p className="font-pixel text-xs text-slate-300 mb-4">
              Saved locally via cookies on your device. Usernames cannot be reused by another profile!
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const res = registerUsername(usernameInput);
                if (res.success) {
                  setUsername(usernameInput.trim());
                  setIsUsernameModalOpen(false);
                } else {
                  setUsernameError(res.error || 'Failed to save username.');
                }
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setUsernameError('');
                }}
                placeholder="Enter username (2-16 chars)..."
                maxLength={16}
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-yellow-400 rounded-xl px-4 py-2.5 text-center font-pixel text-sm text-yellow-300 outline-none shadow-inner"
                autoFocus
              />

              {usernameError && (
                <div className="font-pixel text-[10px] text-red-400 bg-red-950/80 border border-red-500/60 p-2 rounded-xl">
                  ⚠️ {usernameError}
                </div>
              )}

              {/* Already registered profiles on this device */}
              {getRegisteredUsernames().length > 0 && (
                <div className="text-left mt-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="font-pixel text-[9px] text-slate-400 mb-1.5">
                    REGISTERED PROFILES ON THIS DEVICE:
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {getRegisteredUsernames().map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          switchUsername(name);
                          setUsername(name);
                          setIsUsernameModalOpen(false);
                        }}
                        className={`font-pixel text-[9px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                          username.toLowerCase() === name.toLowerCase()
                            ? 'bg-yellow-950 border-yellow-400 text-yellow-300 font-bold ring-1 ring-yellow-400'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center mt-3">
                {username && (
                  <button
                    type="button"
                    onClick={() => setIsUsernameModalOpen(false)}
                    className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl border border-slate-600 cursor-pointer"
                  >
                    CANCEL
                  </button>
                )}
                <button
                  type="submit"
                  className="font-pixel text-xs bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl border-2 border-yellow-300 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  SAVE USERNAME ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        canAbandonRun={currentScreen !== 'title'}
        onAbandonRun={() => {
          setCurrentScreen('title');
          sound.stopMusic();
        }}
      />

      {/* OVERLAY MODALS */}
      {isStatsOpen && <StatsModal onClose={() => setIsStatsOpen(false)} />}
      {activeModal === 'deck' && <DeckModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'party' && <PartyModal onClose={() => setActiveModal(null)} />}

      {/* ONLINE ROOM VIEW (Separate Screens / Remote Isolation) */}
      {currentScreen === 'online_room' && activeOnlineRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
          <OnlineRoomView
            initialRoom={activeOnlineRoom}
            currentUser={username || 'Player'}
            userSkillRating={userSkillRating}
            onLeaveRoom={() => {
              setActiveOnlineRoom(null);
              setCurrentScreen('title');
            }}
            onLaunchOnlineDraft={(playerCount, playerNames, banishedSpecies) => {
              setMultiplayerPlayerCount(playerCount);
              setOnlineDraftPlayerNames(playerNames);
              setOnlineDraftBanishedIds(banishedSpecies);
              setCurrentScreen('twoplayer_draft');
            }}
            onLaunchOnlineGame={(players, _banished) => {
              const myMatch = players.find((p) => p.name.toLowerCase().includes((username || 'Player').toLowerCase()));
              const myId: PlayerSide = myMatch ? myMatch.id : 'p1';
              combat.initializeMultiplayerBattle(players, [], myId);
              setCurrentScreen('battle');
            }}
          />
        </div>
      )}

      {/* GLOBAL ONLINE CHAT: Always visible across Lobby, Draft, and Combat */}
      {activeOnlineRoom && currentScreen !== 'online_room' && (
        <GlobalOnlineChat
          room={activeOnlineRoom}
          currentUser={username || 'Player'}
          onUpdateRoom={(updated) => setActiveOnlineRoom(updated)}
        />
      )}

      {/* ONLINE LOBBY MODAL */}
      <OnlineLobbyModal
        currentUser={username || 'Player'}
        userSkillRating={userSkillRating}
        isOpen={isOnlineLobbyOpen}
        onClose={() => setIsOnlineLobbyOpen(false)}
        onEnterRoom={(room) => {
          setActiveOnlineRoom(room);
          setIsOnlineLobbyOpen(false);
          setCurrentScreen('online_room');
        }}
      />

      {/* GLOBAL MATCH INVITE TOAST */}
      {pendingInvite && (
        <InviteToast
          invite={pendingInvite}
          onAccept={async (inv) => {
            const res = await onlineNetwork.respondInvite(inv.inviteId, true, username, userSkillRating);
            if (res.success && res.room) {
              setActiveOnlineRoom(res.room);
              setCurrentScreen('online_room');
            }
            setPendingInvite(null);
          }}
          onDecline={async (inv) => {
            await onlineNetwork.respondInvite(inv.inviteId, false, username, userSkillRating);
            setPendingInvite(null);
          }}
        />
      )}
    </div>
  );
}
