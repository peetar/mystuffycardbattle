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
import { unlockAdvancement } from '@/utils/advancements';
import { getCurrentUsername, getRegisteredUsernames, registerUsername, switchUsername, deleteUsername } from '@/utils/userProfile';
import { recordStuffyPick, calculateSkillRating, addPlaytime, recordMainMenuVisit } from '@/utils/playerStats';
import { OnlineLobbyModal } from '@/components/online/OnlineLobbyModal';
import { OnlineRoomView } from '@/components/online/OnlineRoomView';
import { GlobalOnlineChat } from '@/components/online/GlobalOnlineChat';
import { InviteToast } from '@/components/online/InviteToast';
import { TestModeModal } from '@/components/test_mode/TestModeModal';
import { FriendsModal } from '@/components/friends/FriendsModal';
import { friendsManager, FriendProfile } from '@/utils/friends';
import { onlineNetwork } from '@/utils/onlineNetwork';
import { OnlineRoom, PendingInvite } from '@/app/api/online/route';
import { PlayerSide, StuffyState, Card, GameItem } from '@/types/game';
import ArmoryModal from '@/components/items/ArmoryModal';
import AdminPanelModal from '@/components/admin/AdminPanelModal';
import { EsperChamberModal } from '@/components/campaign/EsperChamberModal';
import { generateCampaignVictoryItems, getItemInventory, saveItemInventory } from '@/data/items';

export default function Home() {
  const [statsModalTab, setStatsModalTab] = useState<'stats' | 'advancements' | 'version_history' | null>(null);
  const [currentScreen, setCurrentScreen] = useState<
    | 'title'
    | 'campaign_setup'
    | 'campaign_draft'
    | 'campaign_map'
    | 'battle'
    | 'merchant'
    | 'rest'
    | 'event'
    | 'esper_chamber'
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

  // Username state (persisted via cookies with duplicate device prevention)
  const [username, setUsername] = useState<string>('');
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');

  // Online Multiplayer, Test Mode & Social State
  const [isOnlineLobbyOpen, setIsOnlineLobbyOpen] = useState(false);
  const [isTestModeOpen, setIsTestModeOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [isArmoryOpen, setIsArmoryOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [returnScreenFromShop, setReturnScreenFromShop] = useState<string | null>(null);
  const [isAdminShopActive, setIsAdminShopActive] = useState(false);
  const [earnedVictoryItems, setEarnedVictoryItems] = useState<GameItem[]>([]);
  const [activeOnlineRoom, setActiveOnlineRoom] = useState<OnlineRoom | null>(null);
  const [pendingInvite, setPendingInvite] = useState<PendingInvite | null>(null);
  const [onlineDraftPlayerNames, setOnlineDraftPlayerNames] = useState<string[]>([]);
  const [onlineDraftBanishedIds, setOnlineDraftBanishedIds] = useState<string[]>([]);
  const [spectatorCodeInput, setSpectatorCodeInput] = useState('');
  const [isSpectator, setIsSpectator] = useState(false);
  const [activeOnlineSession, setActiveOnlineSession] = useState<{ roomId: string; username: string; isSpectator?: boolean } | null>(null);

  // Check and restore active online room session on page load/refresh
  React.useEffect(() => {
    const session = onlineNetwork.getActiveRoomSession();
    if (session?.roomId) {
      setActiveOnlineSession(session);
      onlineNetwork.reconnectRoom(session.roomId, session.username || 'Player').then((res) => {
        if (res.success && res.room && res.room.status !== 'ended') {
          setActiveOnlineRoom(res.room);
          setIsSpectator(Boolean(session.isSpectator));
          // If already in active draft or battle, rehydrate immediately
          if (res.room.status === 'draft') {
            const maxActive = (res.room.maxPlayers || 2) - 1;
            const activeSlots = res.room.slots.slice(0, maxActive).filter((s) => s.type !== 'none' && s.player);
            const pNames = [res.room.hostUsername, ...activeSlots.map((s) => s.player!.username)];
            setMultiplayerPlayerCount(pNames.length);
            setOnlineDraftPlayerNames(pNames);
            setOnlineDraftBanishedIds(res.room.banishedSpeciesIds || []);
            setCurrentScreen('twoplayer_draft');
          } else if (res.room.status === 'battle') {
            if (res.room.combatState?.players) {
              const myMatch = res.room.combatState.players.find(
                (p) => p.name.toLowerCase() === (session.username || 'Player').toLowerCase()
              );
              const myId: PlayerSide = myMatch ? myMatch.id : 'p1';
              combat.initializeMultiplayerBattle(res.room.combatState.players, [], myId);
            }
            setCurrentScreen('battle');
          }
        } else {
          onlineNetwork.clearActiveRoomSession(session.username);
          setActiveOnlineSession(null);
          setActiveOnlineRoom(null);
        }
      });
    }
  }, []);

  // Continuous room polling across all screens (Room, Draft, Combat)
  React.useEffect(() => {
    if (!activeOnlineRoom?.id) return;

    // Persist active session
    onlineNetwork.saveActiveRoomSession({
      roomId: activeOnlineRoom.id,
      username: username || 'Player',
      isSpectator,
    });
    setActiveOnlineSession({
      roomId: activeOnlineRoom.id,
      username: username || 'Player',
      isSpectator,
    });

    const handleRoomUpdate = (freshRoom: OnlineRoom) => {
      if (freshRoom.status === 'ended') {
        onlineNetwork.clearActiveRoomSession(username || 'Player');
        setActiveOnlineRoom(null);
        setActiveOnlineSession(null);
        setIsSpectator(false);
        setCurrentScreen('title');
        return;
      }
      setActiveOnlineRoom(freshRoom);

      // Automatic screen transition driven by authoritative server room status
      if (freshRoom.status === 'draft') {
        setCurrentScreen((prev) => {
          if (prev !== 'twoplayer_draft') {
            const maxActive = (freshRoom.maxPlayers || 2) - 1;
            const activeSlots = freshRoom.slots.slice(0, maxActive).filter((s) => s.type !== 'none' && s.player);
            const pNames = [freshRoom.hostUsername, ...activeSlots.map((s) => s.player!.username)];
            setMultiplayerPlayerCount(pNames.length);
            setOnlineDraftPlayerNames(pNames);
            setOnlineDraftBanishedIds(freshRoom.banishedSpeciesIds || []);
            return 'twoplayer_draft';
          }
          return prev;
        });
      } else if (freshRoom.status === 'battle') {
        setCurrentScreen((prev) => {
          if (prev !== 'battle') {
            if (freshRoom.combatState?.players) {
              const myMatch = freshRoom.combatState.players.find(
                (p) => p.name.toLowerCase() === (username || 'Player').toLowerCase()
              );
              const myId: PlayerSide = myMatch ? myMatch.id : 'p1';
              combat.initializeMultiplayerBattle(freshRoom.combatState.players, [], myId);
            }
            return 'battle';
          }
          return prev;
        });
      }
    };

    onlineNetwork.startRoomPolling(activeOnlineRoom.id, handleRoomUpdate, 800, username || 'Player');

    return () => {
      onlineNetwork.stopRoomPolling(handleRoomUpdate);
    };
  }, [activeOnlineRoom?.id, username, isSpectator]);

  // Track playtime every 10 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      addPlaytime(10);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Track main menu visits
  React.useEffect(() => {
    if (currentScreen === 'title') {
      recordMainMenuVisit();
    }
  }, [currentScreen]);

  const handleJoinSpectator = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;
    sound.playClickSound();
    const res = await onlineNetwork.joinSpectator(cleanCode, getCurrentUsername() || 'Spectator');
    if (res.success && res.room) {
      setActiveOnlineRoom(res.room);
      setIsSpectator(true);
      setCurrentScreen('online_room');
      setSpectatorCodeInput('');
    } else {
      alert('Room not found or could not join spectator stream.');
    }
  };

  const handleLeaveAllGames = async () => {
    sound.playClickSound();
    const uName = username || 'Player';
    onlineNetwork.stopRoomPolling();
    onlineNetwork.clearActiveRoomSession(uName);
    setActiveOnlineRoom(null);
    setActiveOnlineSession(null);
    setIsSpectator(false);
    setCurrentScreen('title');
    await onlineNetwork.leaveAllGames(uName);
  };

  const userSkillRating = calculateSkillRating();

  // Record active player session for 1-year player registry
  React.useEffect(() => {
    const currentName = username || 'Player';
    friendsManager.recordPlayerActive(currentName, userSkillRating);
  }, [username, userSkillRating]);

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

  const [canResumeCampaign, setCanResumeCampaign] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanResumeCampaign(campaign.hasSavedRun());
    }
  }, [campaign.runActive, currentScreen]);

  // Dynamic Retro Chiptune Scene Music & Early Autoplay
  React.useEffect(() => {
    const startAudioImmediately = () => {
      sound.init();
      if (currentScreen === 'title') {
        sound.playSceneMusic('title');
      }
    };
    startAudioImmediately();
    const triggers = ['pointerdown', 'keydown', 'touchstart', 'mousemove'];
    const handler = () => {
      startAudioImmediately();
      triggers.forEach((t) => window.removeEventListener(t, handler));
    };
    triggers.forEach((t) => window.addEventListener(t, handler, { once: true, passive: true }));
    return () => {
      triggers.forEach((t) => window.removeEventListener(t, handler));
    };
  }, [currentScreen]);

  // Global hotkey listener for Admin Panel (F2 or Alt+A)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2' || (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        sound.playClickSound();
        setIsAdminPanelOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (currentScreen === 'title') {
      sound.playSceneMusic('title');
    } else if (currentScreen === 'campaign_map') {
      sound.playSceneMusic('map');
    } else if (currentScreen === 'merchant') {
      sound.playSceneMusic('merchant');
    } else if (currentScreen === 'rest') {
      sound.playSceneMusic('rest');
    } else if (currentScreen === 'event') {
      sound.playSceneMusic('event');
    } else if (currentScreen === 'campaign_victory') {
      sound.playSceneMusic('victory');
    } else if (currentScreen === 'battle') {
      const currentNode = campaign.nodes.find((n) => n.id === campaign.currentNodeId);
      if (currentNode?.type === 'boss') sound.playSceneMusic('boss');
      else if (currentNode?.type === 'elite') sound.playSceneMusic('elite');
      else sound.playSceneMusic('battle');
    }
  }, [currentScreen, campaign.currentNodeId, campaign.nodes]);

  const handleResumeSavedCampaign = () => {
    sound.init();
    sound.playClickSound();
    const ok = campaign.restoreSavedRun();
    if (ok) {
      sound.playSceneMusic('map');
      setCurrentScreen('campaign_map');
    }
  };

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
        const bossChoices: { id: string; enemies: string[] }[] = [
          { id: 'amalgam', enemies: ['amalgam'] },
          { id: 'mega_trinity', enemies: ['alex', 'finlee', 'jefe'] },
          { id: 'toxic_slug', enemies: ['toxic_slug'] },
          { id: 'lint_vampire', enemies: ['lint_vampire'] },
          { id: 'clockwork_nuke', enemies: ['clockwork_nuke'] },
          { id: 'cinder_beast', enemies: ['cinder_beast'] },
          { id: 'grave_scavenger', enemies: ['grave_scavenger'] },
          { id: 'mind_puppeteer', enemies: ['mind_puppeteer'] },
          { id: 'aquatic_squad', enemies: ['dolphy', 'finlee', 'chanteira', 'aquatic_kraken', 'aquatic_ray'] },
          { id: 'life_linked_trinity', enemies: ['tri_link_alpha', 'tri_link_beta', 'tri_link_gamma'] },
          { id: 'shadow_hedgehog', enemies: ['shadow_hedgehog'] },
          { id: 'mirror_mimic', enemies: ['mirror_mimic'] },
          { id: 'fluff_gorgon', enemies: ['fluff_gorgon'] },
          { id: 'volt_colossus', enemies: ['volt_colossus'] },
        ];

        // USER RULE: Do not fight the same boss more than once in the same run!
        const encountered = campaign.encounteredBosses || [];
        const unencountered = bossChoices.filter((b) => !encountered.includes(b.id));
        const pool = unencountered.length > 0 ? unencountered : bossChoices;
        const selectedBoss = pool[Math.floor(Math.random() * pool.length)];
        campaign.recordEncounteredBoss(selectedBoss.id);
        enemyIds = selectedBoss.enemies;
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
    } else if (node.type === 'esper') {
      setCurrentScreen('esper_chamber');
    }
  };

  // 3. Battle End
  const handleBattleEnd = (result: 'victory' | 'defeat') => {
    if (combat.isTestMode) {
      setCurrentScreen('title');
      setIsTestModeOpen(true);
      return;
    }

    if (combat.gameMode === 'two_player' || combat.gameMode === 'multiplayer') {
      if (activeOnlineRoom) {
        onlineNetwork.leaveRoom(activeOnlineRoom.id, username || 'Player');
        onlineNetwork.clearActiveRoomSession(username);
        setActiveOnlineRoom(null);
        setActiveOnlineSession(null);
      }
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
          unlockAdvancement('grand_campaign_victor');
          if (!campaign.hasRestedInRun && !campaign.hasFedInRun) {
            unlockAdvancement('iron_plush');
          }
          // Award campaign items (1 item per act + 2 rounded to 3, 5, 7)
          const itemsWon = generateCampaignVictoryItems(campaign.totalActs || 3);
          const currentInv = getItemInventory();
          saveItemInventory([...currentInv, ...itemsWon]);
          setEarnedVictoryItems(itemsWon);
          sound.playRewardSound();
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
      // Campaign Over - auto delete the game run so it cannot be recovered
      campaign.abandonRun();
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('ben_stuffy_saved_campaign_run');
        } catch {}
      }
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
        onlineNetwork.syncGameAction(activeOnlineRoom.id, 'battle', { players: arg1 });
      }
    } else {
      // legacy signature (p1Team, p1Deck, p2Team, p2Deck, reserveStuffies)
      combat.initializeTwoPlayerBattle(arg1, arg2, arg3, arg4, arg5);
    }
    setCurrentScreen('battle');
  };

  // Online Authoritative Draft & Combat Action Handlers
  const handleOnlineDraftPick = async (playerIdx: number, speciesId: string, loadoutId: string) => {
    if (!activeOnlineRoom?.id) return;
    const res = await onlineNetwork.submitDraftPick(
      activeOnlineRoom.id,
      playerIdx,
      username || 'Player',
      speciesId,
      loadoutId
    );
    if (res) {
      setActiveOnlineRoom(res);
    }
  };

  const handleOnlineDraftRandomFill = async (playerIdx: number) => {
    if (!activeOnlineRoom?.id) return;
    const res = await onlineNetwork.submitDraftRandomFill(
      activeOnlineRoom.id,
      playerIdx,
      username || 'Player'
    );
    if (res) {
      setActiveOnlineRoom(res);
    }
  };

  const handleOnlineCardPlay = async (cardIndex: number, targetId?: string) => {
    if (!activeOnlineRoom?.id || !activeOnlineRoom?.combatState) return;
    const myMatch = activeOnlineRoom.combatState.players.find(
      (p) => p.name.toLowerCase() === (username || 'Player').toLowerCase()
    );
    const mySide: PlayerSide = myMatch ? myMatch.id : activeOnlineRoom.combatState.activeSide;
    const res = await onlineNetwork.submitCombatCardPlay(
      activeOnlineRoom.id,
      mySide,
      cardIndex,
      targetId
    );
    if (res) {
      setActiveOnlineRoom(res);
    }
  };

  const handleOnlineEndTurn = async () => {
    if (!activeOnlineRoom?.id || !activeOnlineRoom?.combatState) return;
    const myMatch = activeOnlineRoom.combatState.players.find(
      (p) => p.name.toLowerCase() === (username || 'Player').toLowerCase()
    );
    const mySide: PlayerSide = myMatch ? myMatch.id : activeOnlineRoom.combatState.activeSide;
    const res = await onlineNetwork.submitCombatEndTurn(
      activeOnlineRoom.id,
      mySide
    );
    if (res) {
      setActiveOnlineRoom(res);
    }
  };

  const handleStartTestBattle = (
    playerTeam: StuffyState[],
    playerDeck: Card[],
    enemyType: 'dummy' | 'mirror' | 'amalgam' = 'dummy',
    dummyHp: number = 100,
    dummyShield: number = 0
  ) => {
    sound.init();
    sound.playRewardSound();
    combat.initializeTestBattle(playerTeam, playerDeck, enemyType, undefined, dummyHp, dummyShield);
    setCurrentScreen('battle');
  };

  const handleSelectFriendToPlay = async (friend: FriendProfile, _mode: 'duel' | 'draft') => {
    sound.init();
    sound.playRewardSound();
    const room = await onlineNetwork.createRoom(username || 'Player', userSkillRating, 'us-east');
    if (room) {
      await onlineNetwork.sendInvite(room.id, 0, friend.username, username || 'Player');
      setActiveOnlineRoom(room);
      setIsSpectator(false);
      setCurrentScreen('online_room');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white font-sans overflow-y-auto">
      {/* SCREEN 1: TITLE SCREEN */}
      {currentScreen === 'title' && (
        <div className="w-full min-h-screen flex flex-col items-center justify-between p-4 md:p-8 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black select-none overflow-y-auto">
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
                ✨ v3.8 ESPERS, 600 ITEMS, CAMPAIGN ASTRAL CHAMBERS &amp; ADMIN SUITE
              </span>
            </div>
            <p className="font-mono text-xs md:text-sm text-slate-300 mt-2.5 max-w-lg mx-auto leading-relaxed">
              Campaign squad presets &amp; custom squad saving, restored classic Spot Energy Relay, authoritative unfriend sync, full version history archive, and 100 plush events!
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
            {/* Active Online Match Info & Control Card */}
            {(activeOnlineSession || (activeOnlineRoom && activeOnlineRoom.status !== 'ended')) && (
              <div className="bg-slate-900/95 border-2 border-cyan-400/70 rounded-2xl p-3.5 shadow-xl backdrop-blur flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-cyan-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌐</span>
                    <span className="font-pixel text-[11px] text-cyan-300 font-bold tracking-wide">
                      ACTIVE MULTIPLAYER MATCH
                    </span>
                  </div>
                  <span className="font-mono text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/50 text-cyan-200">
                    {activeOnlineRoom?.id || activeOnlineSession?.roomId}
                  </span>
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] text-slate-300">
                  <span>Phase: <strong className="text-yellow-300 font-pixel uppercase">{activeOnlineRoom?.status || 'Active'}</strong></span>
                  <span>Role: <strong className="text-indigo-300 font-pixel">{isSpectator || activeOnlineSession?.isSpectator ? 'Spectator' : 'Player'}</strong></span>
                </div>

                {activeOnlineRoom?.combatState?.players && (
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    Squads: {activeOnlineRoom.combatState.players.map((p) => p.name).join(' vs ')}
                  </div>
                )}

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={async () => {
                      sound.playClickSound();
                      const targetRoomId = activeOnlineRoom?.id || activeOnlineSession?.roomId;
                      const targetUser = username || activeOnlineSession?.username || 'Player';
                      const targetSpectator = isSpectator || !!activeOnlineSession?.isSpectator;
                      if (targetRoomId) {
                        const res = await onlineNetwork.reconnectRoom(targetRoomId, targetUser);
                        if (res.success && res.room && res.room.status !== 'ended') {
                          setActiveOnlineRoom(res.room);
                          setIsSpectator(targetSpectator);
                          if (res.room.status === 'draft') {
                            const maxActive = (res.room.maxPlayers || 2) - 1;
                            const activeSlots = res.room.slots.slice(0, maxActive).filter((s) => s.type !== 'none' && s.player);
                            const pNames = [res.room.hostUsername, ...activeSlots.map((s) => s.player!.username)];
                            setMultiplayerPlayerCount(pNames.length);
                            setOnlineDraftPlayerNames(pNames);
                            setOnlineDraftBanishedIds(res.room.banishedSpeciesIds || []);
                            setCurrentScreen('twoplayer_draft');
                          } else if (res.room.status === 'battle') {
                            if (res.room.combatState?.players) {
                              const myMatch = res.room.combatState.players.find(
                                (p) => p.name.toLowerCase() === targetUser.toLowerCase()
                              );
                              const myId: PlayerSide = myMatch ? myMatch.id : 'p1';
                              combat.initializeMultiplayerBattle(res.room.combatState.players, [], myId);
                            }
                            setCurrentScreen('battle');
                          } else {
                            setCurrentScreen('online_room');
                          }
                        }
                      }
                    }}
                    className="flex-1 font-pixel text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold py-2.5 px-3 rounded-xl border border-cyan-300 shadow transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
                  >
                    <span>▶️</span>
                    <span>RESUME MATCH</span>
                  </button>

                  <button
                    onClick={async () => {
                      const targetRoomId = activeOnlineRoom?.id || activeOnlineSession?.roomId;
                      const uName = username || 'Player';
                      if (!targetRoomId) return;
                      if (window.confirm(`Destroy and forfeit match [${targetRoomId}]? The server will garbage-collect this match and release all slots.`)) {
                        sound.playClickSound();
                        await onlineNetwork.terminateMatch(targetRoomId, uName);
                        onlineNetwork.clearActiveRoomSession(uName);
                        setActiveOnlineRoom(null);
                        setActiveOnlineSession(null);
                        setIsSpectator(false);
                      }
                    }}
                    className="font-pixel text-[10px] bg-red-950/90 hover:bg-red-900 text-rose-300 hover:text-white px-3 py-2.5 rounded-xl border border-rose-600 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-1 shadow"
                    title="Forfeit and destroy online match (server garbage collection)"
                  >
                    <span>💥</span>
                    <span>DESTROY</span>
                  </button>
                </div>
              </div>
            )}

            {/* Saved Single-Player Campaign Info & Control Card */}
            {(canResumeCampaign || campaign.runActive) && (
              <div className="bg-slate-900/95 border-2 border-emerald-400/70 rounded-2xl p-3.5 shadow-xl backdrop-blur flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👑</span>
                    <span className="font-pixel text-[11px] text-emerald-300 font-bold tracking-wide">
                      SAVED ROGUELIKE CAMPAIGN
                    </span>
                  </div>
                  <span className="font-mono text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/50 text-emerald-200">
                    ACT {campaign.currentAct} • FL {campaign.currentFloor}/{campaign.totalFloors}
                  </span>
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] text-slate-300">
                  <span>💵 {campaign.gold} Stuffydolars</span>
                  <span>🎒 {campaign.relics.length} Relics</span>
                  <span>🃏 {campaign.deck.length} Cards</span>
                </div>

                {campaign.activeParty.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {campaign.activeParty.map((s, idx) => (
                      <div key={idx} className="flex flex-col items-center bg-slate-950/80 px-1.5 py-1 rounded border border-slate-700 min-w-[50px]">
                        <span className="text-[10px] font-pixel text-yellow-300 truncate max-w-[45px]">{s.name}</span>
                        <span className={`text-[8px] font-mono ${s.isUnstuffed ? 'text-red-400' : 'text-emerald-400'}`}>
                          {s.isUnstuffed ? 'DEAD' : `${s.currentHp}HP`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => {
                      if (campaign.runActive) {
                        sound.playClickSound();
                        sound.playSceneMusic('map');
                        setCurrentScreen('campaign_map');
                      } else {
                        handleResumeSavedCampaign();
                      }
                    }}
                    className="flex-1 font-pixel text-xs bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold py-2.5 px-3 rounded-xl border border-emerald-300 shadow transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 animate-pulse"
                  >
                    <span>▶️</span>
                    <span>RESUME CAMPAIGN</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to abandon and permanently scrap this saved campaign run?')) {
                        sound.playClickSound();
                        campaign.abandonRun();
                        setCanResumeCampaign(false);
                      }
                    }}
                    className="font-pixel text-[10px] bg-red-950/90 hover:bg-red-900 text-rose-300 hover:text-white px-3 py-2.5 rounded-xl border border-rose-600 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-1 shadow"
                    title="Permanently scrap and discard saved campaign run"
                  >
                    <span>🗑️</span>
                    <span>DISCARD</span>
                  </button>
                </div>
              </div>
            )}

            {/* Clear Stuck Games / Leave All Matches emergency button */}
            <button
              onClick={handleLeaveAllGames}
              className="font-pixel text-[11px] bg-red-950/80 hover:bg-red-900 text-rose-300 hover:text-rose-200 py-2 px-4 rounded-xl border border-rose-700/60 transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shadow"
            >
              <span>🚨</span>
              <span>LEAVE ALL ONLINE GAMES (RESET STUCK MATCHES)</span>
            </button>

            {/* ITEM ARMORY & EQUIPMENT (v3.7) */}
            <button
              onClick={() => {
                sound.playClickSound();
                setIsArmoryOpen(true);
              }}
              className="font-pixel text-sm bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold py-4 px-6 rounded-2xl border-4 border-yellow-200 shadow-xl shadow-yellow-600/40 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🧰</span>
              <span>ITEM ARMORY &amp; EQUIPMENT</span>
              <span className="text-[9px] bg-slate-950 text-yellow-300 px-2 py-0.5 rounded-full font-bold ml-1 animate-pulse">
                NEW v3.7
              </span>
            </button>

            <button
              onClick={handleStartCampaignSetup}
              className="font-pixel text-sm bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold py-4 px-6 rounded-2xl border-4 border-yellow-300 shadow-xl shadow-yellow-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              👑 NEW CAMPAIGN (ROGUE-LITE MAP)
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
              onClick={() => {
                sound.playClickSound();
                setIsTestModeOpen(true);
              }}
              className="font-pixel text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-2xl border-4 border-emerald-300 shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🧪</span>
              <span>TEST MODE (SANDBOX &amp; COMBOS)</span>
            </button>

            <button
              onClick={() => {
                sound.playClickSound();
                setIsFriendsModalOpen(true);
              }}
              className="font-pixel text-sm bg-gradient-to-r from-indigo-700 to-violet-700 hover:from-indigo-600 hover:to-violet-600 text-white font-bold py-3 px-6 rounded-2xl border-2 border-indigo-400 shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>👥</span>
              <span>FRIENDS &amp; SQUAD NETWORK</span>
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
                setStatsModalTab('stats');
              }}
              className="font-pixel text-xs bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-yellow-300 font-bold py-3 px-6 rounded-2xl border-2 border-purple-500 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <span>📊</span>
              <span>HALL OF RECORDS &amp; ADVANCEMENTS</span>
            </button>

            <button
              onClick={() => {
                sound.playClickSound();
                setStatsModalTab('version_history');
              }}
              className="font-pixel text-xs bg-slate-900 hover:bg-slate-800 text-blue-300 font-bold py-3 px-6 rounded-2xl border-2 border-blue-500/70 hover:border-blue-400 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-2"
            >
              <span>📜</span>
              <span>VERSION HISTORY &amp; UPDATES</span>
            </button>
          </div>

          {/* Version Footer */}
          <footer className="text-center font-mono text-[10px] text-slate-500 mb-2">
            Created for Ben • 16-Bit Retro Stuffed Animal Roguelike • Hosted on Vercel
          </footer>

          {/* Spectator Box in Bottom Right of Main Menu */}
          <div className="fixed bottom-3 right-3 z-30 bg-slate-900/95 border-2 border-purple-500/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-1.5 w-60">
            <div className="flex items-center gap-1.5 text-purple-300 font-pixel text-[10px] font-bold">
              <span className="text-sm">👁️</span>
              <span>SPECTATE MATCH</span>
            </div>
            <p className="font-mono text-[9px] text-slate-400">
              Enter room code to watch live:
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleJoinSpectator(spectatorCodeInput);
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                placeholder="ROOM-1234"
                value={spectatorCodeInput}
                onChange={(e) => setSpectatorCodeInput(e.target.value.toUpperCase())}
                className="bg-slate-950 border border-slate-700 text-yellow-300 font-mono text-xs px-2 py-1 rounded-lg w-full outline-none focus:border-purple-400"
              />
              <button
                type="submit"
                disabled={!spectatorCodeInput.trim()}
                className="font-pixel text-[9px] bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold px-2.5 py-1.5 rounded-lg border border-purple-400 cursor-pointer shadow transition-all hover:scale-105 active:scale-95"
              >
                WATCH
              </button>
            </form>
          </div>
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
          isSpectator={isSpectator}
          roomId={activeOnlineRoom?.id}
          onlineCombatState={activeOnlineRoom?.combatState}
          onOnlineCardPlay={handleOnlineCardPlay}
          onOnlineEndTurn={handleOnlineEndTurn}
          onLeaveSpectator={() => {
            if (activeOnlineRoom) {
              const uName = username || 'Player';
              onlineNetwork.leaveRoom(activeOnlineRoom.id, uName);
              onlineNetwork.clearActiveRoomSession(uName);
              setActiveOnlineRoom(null);
              setActiveOnlineSession(null);
            }
            setIsSpectator(false);
            setCurrentScreen('title');
          }}
        />
      )}

      {/* SCREEN 5: MERCHANT */}
      {currentScreen === 'merchant' && (
        <MerchantShop
          onLeaveShop={() => {
            if (isAdminShopActive) {
              setIsAdminShopActive(false);
              const target = returnScreenFromShop && returnScreenFromShop !== 'merchant' ? returnScreenFromShop : 'campaign_map';
              setReturnScreenFromShop(null);
              setCurrentScreen(target as any);
            } else {
              campaign.completeNode();
              setCurrentScreen('campaign_map');
            }
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
          onOpenPartyView={() => setActiveModal('party')}
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

      {/* SCREEN 7.5: ESPER CHAMBER */}
      {currentScreen === 'esper_chamber' && (
        <EsperChamberModal
          onComplete={() => {
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
                const itemsWon = generateCampaignVictoryItems(campaign.totalActs || 3);
                const currentInv = getItemInventory();
                saveItemInventory([...currentInv, ...itemsWon]);
                setEarnedVictoryItems(itemsWon);
                sound.playRewardSound();
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
          playerNames={
            onlineDraftPlayerNames.length > 0
              ? onlineDraftPlayerNames
              : activeOnlineRoom
              ? [activeOnlineRoom.hostUsername, ...activeOnlineRoom.slots.filter((s) => s.player).map((s) => s.player!.username)]
              : undefined
          }
          initialBanishedIds={onlineDraftBanishedIds}
          localPlayerName={username || 'Player'}
          isSpectator={isSpectator}
          roomId={activeOnlineRoom?.id}
          onlineDraftState={activeOnlineRoom?.draftState}
          onOnlineDraftPick={handleOnlineDraftPick}
          onOnlineDraftRandomFill={handleOnlineDraftRandomFill}
          onDraftComplete={handleFinishMultiplayerDraft}
          onMultiplayerDraftComplete={handleFinishMultiplayerDraft}
          onLeaveDraft={() => {
            if (activeOnlineRoom) {
              const uName = username || 'Player';
              onlineNetwork.leaveRoom(activeOnlineRoom.id, uName);
              onlineNetwork.clearActiveRoomSession(uName);
              setActiveOnlineRoom(null);
              setActiveOnlineSession(null);
            }
            setIsSpectator(false);
            setCurrentScreen('title');
          }}
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
              <div>💵 STUFFYDOLARS HOARD: {campaign.gold}</div>
              <div>✨ RELICS: {campaign.relics.length}</div>
              <div>🎴 CARDS: {campaign.deck.length}</div>
            </div>
          </div>

          {/* Won Items Reward Showcase (v3.7) */}
          {earnedVictoryItems.length > 0 && (
            <div className="bg-slate-900/90 border-2 border-amber-400 rounded-3xl p-5 max-w-2xl w-full shadow-2xl backdrop-blur my-3 text-center">
              <h3 className="font-pixel text-sm text-yellow-300 font-extrabold mb-1">
                🎁 CAMPAIGN LOOT UNLOCKED! ({earnedVictoryItems.length} ITEMS WON)
              </h3>
              <p className="font-mono text-xs text-slate-300 mb-3">
                New gear has been delivered to your Armory! Equip them at the title screen!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {earnedVictoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-amber-500/50 bg-slate-950 flex items-center gap-2 text-left"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="truncate">
                      <div className="font-pixel text-xs text-yellow-200 font-bold truncate">
                        {item.name}
                      </div>
                      <div className="font-mono text-[10px] text-emerald-400 font-bold">
                        {item.attribute === 'speed' ? `+${item.value} Speed` : `+${item.value}% ${item.attribute.toUpperCase()}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* GLOBAL PERSISTENT TOP RIGHT CONTROLS (Hidden in battle to prevent overlapping header view cards button) */}
      {currentScreen !== 'battle' && (
        <div className="fixed top-3 right-3 z-40 flex items-center gap-1.5 backdrop-blur-md">
          <button
            onClick={() => {
              sound.playClickSound();
              setStatsModalTab('stats');
            }}
            className="bg-slate-900/90 hover:bg-slate-800 text-yellow-300 font-pixel text-xs px-2.5 py-1.5 rounded-xl border border-yellow-500/60 shadow-lg flex items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="View Player Stats"
          >
            <span>📊</span>
            <span className="hidden sm:inline">STATS</span>
          </button>
          <button
            onClick={() => {
              sound.playClickSound();
              setStatsModalTab('advancements');
            }}
            className="bg-purple-950/90 hover:bg-purple-900 text-purple-300 font-pixel text-xs px-2.5 py-1.5 rounded-xl border border-purple-500/60 shadow-lg flex items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="View Advancements"
          >
            <span>🏆</span>
            <span className="hidden sm:inline">ADVANCEMENTS</span>
          </button>
          <button
            onClick={() => {
              sound.playClickSound();
              setStatsModalTab('version_history');
            }}
            className="bg-blue-950/90 hover:bg-blue-900 text-blue-300 font-pixel text-xs px-2.5 py-1.5 rounded-xl border border-blue-500/60 shadow-lg flex items-center gap-1 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="View Version History & Updates"
          >
            <span>📜</span>
            <span className="hidden sm:inline">UPDATES</span>
          </button>
          <button
            onClick={() => {
              sound.playClickSound();
              setIsSettingsOpen(true);
            }}
            className="bg-slate-900/90 hover:bg-slate-800 text-yellow-300 font-pixel text-xs px-2.5 py-1.5 rounded-xl border border-yellow-500/60 shadow-lg flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Open Audio & Game Settings"
          >
            <span className="text-sm">⚙️</span>
            <span className="hidden sm:inline">SETTINGS</span>
          </button>
        </div>
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
                const res = registerUsername(usernameInput, username);
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
                  <div className="font-pixel text-[9px] text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>ACTIVE PROFILES ON THIS DEVICE:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {getRegisteredUsernames().map((name) => (
                      <div
                        key={name}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border transition-all ${
                          username.toLowerCase() === name.toLowerCase()
                            ? 'bg-yellow-950/80 border-yellow-400 text-yellow-300 font-bold ring-1 ring-yellow-400'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            switchUsername(name);
                            setUsername(name);
                            setIsUsernameModalOpen(false);
                          }}
                          className="font-pixel text-[9px] cursor-pointer hover:text-white"
                        >
                          {name}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteUsername(name);
                            if (username.toLowerCase() === name.toLowerCase()) {
                              const remaining = getRegisteredUsernames().filter(
                                (n) => n.toLowerCase() !== name.toLowerCase()
                              );
                              setUsername(remaining[0] || '');
                            }
                          }}
                          title={`Delete "${name}" profile`}
                          className="text-slate-500 hover:text-red-400 text-[10px] ml-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
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
        onLeaveAllGames={handleLeaveAllGames}
      />

      {/* OVERLAY MODALS */}
      {statsModalTab && (
        <StatsModal
          onClose={() => setStatsModalTab(null)}
          initialTab={statsModalTab}
        />
      )}
      {activeModal === 'deck' && <DeckModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'party' && <PartyModal onClose={() => setActiveModal(null)} />}

      {/* ONLINE ROOM VIEW (Separate Screens / Remote Isolation) */}
      {currentScreen === 'online_room' && activeOnlineRoom && (
        <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
          <OnlineRoomView
            initialRoom={activeOnlineRoom}
            currentUser={username || 'Player'}
            userSkillRating={userSkillRating}
            isSpectator={isSpectator}
            onLeaveRoom={() => {
              if (activeOnlineRoom) {
                const uName = username || 'Player';
                onlineNetwork.leaveRoom(activeOnlineRoom.id, uName);
                onlineNetwork.clearActiveRoomSession(uName);
              }
              setActiveOnlineRoom(null);
              setActiveOnlineSession(null);
              setIsSpectator(false);
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
        onOpenFriendsModal={() => setIsFriendsModalOpen(true)}
        onEnterRoom={(room) => {
          setActiveOnlineRoom(room);
          setIsSpectator(false);
          setIsOnlineLobbyOpen(false);
          setCurrentScreen('online_room');
        }}
      />

      {/* TEST MODE (SANDBOX & COMBOS) MODAL */}
      <TestModeModal
        isOpen={isTestModeOpen}
        onClose={() => setIsTestModeOpen(false)}
        onStartTestBattle={handleStartTestBattle}
      />

      {/* FRIENDS & SOCIAL MODAL */}
      <FriendsModal
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
        currentUser={username || 'Player'}
        onSelectFriendToPlay={handleSelectFriendToPlay}
      />

      {/* GLOBAL MATCH INVITE TOAST */}
      {pendingInvite && (
        <InviteToast
          invite={pendingInvite}
          onAccept={async (inv) => {
            sound.init();
            sound.playRewardSound();
            const currentName = username || getCurrentUsername() || 'Player';
            const res = await onlineNetwork.respondInvite(inv.inviteId, true, currentName, userSkillRating);
            if (res.success && res.room) {
              setActiveOnlineRoom(res.room);
              setIsSpectator(false);
              setCurrentScreen('online_room');
            } else {
              // Direct join fallback if slot wasn't returned
              const fallback = await onlineNetwork.joinRoomByCode(inv.roomId, currentName, userSkillRating);
              if (fallback.success && fallback.room) {
                setActiveOnlineRoom(fallback.room);
                setIsSpectator(false);
                setCurrentScreen('online_room');
              }
            }
            setPendingInvite(null);
          }}
          onDecline={async (inv) => {
            await onlineNetwork.respondInvite(inv.inviteId, false, username, userSkillRating);
            setPendingInvite(null);
          }}
        />
      )}

      {/* BEN'S ITEM ARMORY & EQUIPMENT MODAL (v3.7) */}
      <ArmoryModal
        isOpen={isArmoryOpen}
        onClose={() => setIsArmoryOpen(false)}
      />

      {/* PERSISTENT TESTER ADMIN BUTTON (Always Accessible Everywhere) */}
      <button
        onClick={() => {
          sound.playClickSound();
          setIsAdminPanelOpen(true);
        }}
        className="fixed bottom-3 left-3 z-40 bg-slate-950/95 hover:bg-slate-900 border-2 border-emerald-500/80 text-emerald-300 hover:text-emerald-200 font-pixel text-[10px] px-3.5 py-2 rounded-2xl shadow-2xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
        title="Open Tester Admin Panel [Hotkey: F2 or Alt+A]"
      >
        <span className="text-sm animate-pulse">🛠️</span>
        <span className="font-extrabold tracking-wide">ADMIN</span>
        <span className="text-[8px] bg-emerald-950 border border-emerald-500/50 text-emerald-300 px-1.5 py-0.5 rounded-full font-bold">
          TESTER
        </span>
      </button>

      {/* BEN'S TESTER ADMIN PANEL MODAL (v3.8) */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onOpenArmory={() => setIsArmoryOpen(true)}
        onOpenShop={() => {
          setIsAdminPanelOpen(false);
          setReturnScreenFromShop(currentScreen);
          setIsAdminShopActive(true);
          campaign.generateMerchantOfferings();
          setCurrentScreen('merchant');
        }}
        onOpenReward={() => {
          setIsAdminPanelOpen(false);
          setLastBattleGold(65 + Math.floor(Math.random() * 25));
          setCurrentScreen('rewards');
        }}
      />
    </div>
  );
}
