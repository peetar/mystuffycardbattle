import { useCombatStore } from '@/store/combatStore';
import { useCampaignStore } from '@/store/campaignStore';
import { useStoryStore } from '@/store/storyStore';
import { useTownStore } from '@/store/townStore';
import { StuffyState, PackRarity } from '@/types/game';
import { ALL_STUFFIES, BOSS_SPECIES_IDS, createStuffyPack } from '@/data/stuffies';
import { ResourceType, BuildingType } from '@/types/town';
import { BUILDING_DEFINITIONS, ALL_RESOURCES } from '@/data/townBuildings';

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  action?: 'open_item_panel' | 'open_esper_panel' | 'open_esper_room' | 'open_shop' | 'open_rewards' | 'open_star_chamber' | 'open_pull_modal' | 'open_part_selector' | 'open_town_builder' | 'clear_console' | 'none';
}

export type TargetScope = 'team' | 'enemy' | 'all' | 'single';

export function parseTargetScope(query: string): { scope: TargetScope; cleanQuery: string } {
  const q = query.toLowerCase().trim();
  if (
    q === 'team' ||
    q === 'myteam' ||
    q === 'my team' ||
    q === 'player' ||
    q === 'players' ||
    q === 'ally' ||
    q === 'allies' ||
    q === 'party'
  ) {
    return { scope: 'team', cleanQuery: q };
  }
  if (
    q === 'enemy' ||
    q === 'enemies' ||
    q === 'enemy team' ||
    q === 'enemyteam' ||
    q === 'foe' ||
    q === 'foes' ||
    q === 'monster' ||
    q === 'monsters' ||
    q === 'boss'
  ) {
    return { scope: 'enemy', cleanQuery: q };
  }
  if (
    q === 'all' ||
    q === 'both' ||
    q === 'everyone' ||
    q === 'all teams' ||
    q === 'both teams'
  ) {
    return { scope: 'all', cleanQuery: q };
  }
  return { scope: 'single', cleanQuery: q };
}

/**
 * Normalizes input string to find matching stuffy from team or catalog.
 */
function matchesStuffy(stuffy: StuffyState, query: string, scope: TargetScope = 'single'): boolean {
  if (scope === 'team' || scope === 'enemy' || scope === 'all') {
    return true;
  }
  const q = query.toLowerCase().trim();
  return (
    stuffy.speciesId.toLowerCase() === q ||
    stuffy.name.toLowerCase() === q ||
    stuffy.name.toLowerCase().includes(q) ||
    stuffy.instanceId.toLowerCase() === q
  );
}

export function executeAdminCommand(rawCommand: string): CommandExecutionResult {
  const trimmed = rawCommand.trim();
  if (!trimmed) {
    return { success: false, message: 'Please enter a command. Type /.help for command list.' };
  }

  // Commands must strictly contain a leading period: "/." or "."
  if (!trimmed.startsWith('/.') && !trimmed.startsWith('.')) {
    return {
      success: false,
      message: '❌ Invalid command format. All admin commands require a period to execute (e.g. "/.<command>" or ".<command>"). Type "/.help" for available commands.',
    };
  }

  let normalized = trimmed;
  if (normalized.startsWith('/.')) {
    normalized = normalized.substring(2).trim();
  } else if (normalized.startsWith('.')) {
    normalized = normalized.substring(1).trim();
  }

  const parts = normalized.split(/\s+/);
  const command = parts[0].toLowerCase();

  // Command: HELP
  if (command === 'help') {
    return {
      success: true,
      message: [
        '🛠️ === BEN ADMIN COMMANDS (v3.9) ===',
        '• /.stuffy #level stuffy_name                 - Spawns a stuffy at 1-10 stars (e.g. /.stuffy 7 jefe, bosses disallowed)',
        '• /.pack [rarity]                             - Grants an Act reward pack (common, uncommon, rare, epic, legendary)',
        '• /.shuffle                                   - Shuffles cards from discard pile into your draw pile',
        '• /.pull                                      - View cards in deck and click any card to place it at the top',
        '• /.heal # <team|enemy|all|stuffy> [set|add]   - Heals team, enemy, both (all), or a stuffy',
        '• /.damage # <team|enemy|all|stuffy> [set|add] - Deals damage to team, enemy, both (all), or a stuffy',
        '• /.shield # <team|enemy|all|stuffy> [set|add] - Sets or adds shield to team, enemy, all, or stuffy',
        '• /.kill <team|enemy|all|stuffy>              - Unstuffs team, enemy, both (all), or a stuffy',
        '• /.revive <team|enemy|all|stuffy>            - Revives team, enemy, both (all), or a stuffy to full HP',
        '• /.item                                      - Opens the Item Spawner (600 items across 6 types & 5 tiers)',
        '• /.esper                                     - [Campaign Only] Opens the Esper Spawner to infuse espers',
        '• /.shop                                      - [Campaign Only] Opens the Campaign Merchant Shop immediately',
        '• /.gold # [set|add]                          - Sets or adds # Stuffydolars (e.g. /.gold 500 add)',
        '• /.crackers # [set|add]                      - Sets or adds combat Crackers (e.g. /.crackers 5 set)',
        '• /.win                                       - Instantly wins the current combat match',
        '• /.act #                                     - Advances forward to Act # (cannot jump back; up to run max)',
        '• /.floor #                                   - Sets current Floor in active Act (e.g. /.floor 4)',
        '• /.reward                                    - Gives the victory rewards of a monster fight (Gold, Cards, Food)',
        '• /.adv                                       - Advances past next story mission as if completed (clears sector, unlocks stuffies & rewards)',
        '• /.part [1-5]                                - Unlocks the selected story part and all parts before it (e.g. /.part 3)',
        '• /.vision [on|off] (alias: /.vison)          - Reveals all 2,640 sectors across all 5 parts on the map',
        '• /.towntime                                  - [v4.4 Dev] Opens the TOWNTIME Town Builder environment',
        '• /.r # resource                             - [v4.4 Dev] Gives town resources (e.g. /.r 100 wood, /.r 50 oil)',
        '• /.bis building #                           - [v4.4 Dev] Puts a building in town storage (e.g. /.bis lumberjack 1)',
        '• /.clear                                     - Clears the admin console log',
      ].join('\n'),
    };
  }

  // Command: TOWNTIME (v4.4 Dev preview: opens town builder)
  if (command === 'towntime' || command === 'town' || command === 'townbuilder') {
    return {
      success: true,
      message: '🏘️ [TOWNTIME] Opening Town Builder environment...',
      action: 'open_town_builder',
    };
  }

  // Command: R (Give town resources: /.r # resource or /.r resource #)
  if (command === 'r' || command === 'resource' || command === 'resources') {
    if (parts.length < 3) {
      return {
        success: false,
        message: '❌ Format: /.r <amount> <resource> (e.g. /.r 100 wood, /.r 50 oil, /.r 30 glass)',
      };
    }
    let amount = parseInt(parts[1], 10);
    let resKey = parts[2].toLowerCase();
    if (isNaN(amount)) {
      amount = parseInt(parts[2], 10);
      resKey = parts[1].toLowerCase();
    }
    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        message: `❌ Invalid resource amount "${parts[1]}". Must be a positive integer.`,
      };
    }

    const validRes = ALL_RESOURCES.find((r) => r.id === resKey || r.name.toLowerCase() === resKey);
    if (!validRes) {
      const allowed = ALL_RESOURCES.map((r) => r.id).join(', ');
      return {
        success: false,
        message: `❌ Unknown resource "${resKey}". Available resources: ${allowed}`,
      };
    }

    useTownStore.getState().addResource(validRes.id, amount);
    return {
      success: true,
      message: `🪵 [ADMIN TOWNTIME] Granted +${amount} ${validRes.name} ${validRes.icon} to town storage!`,
    };
  }

  // Command: BIS (Put building in storage: /.bis <building> <#>)
  if (command === 'bis' || command === 'building') {
    if (parts.length < 2) {
      return {
        success: false,
        message: '❌ Format: /.bis <building_name> <amount> (e.g. /.bis lumberjack 1, /.bis mine 2, /.bis barrel 5)',
      };
    }
    let bKey = parts[1].toLowerCase();
    let count = parseInt(parts[2], 10);
    if (isNaN(count)) {
      count = parseInt(parts[1], 10);
      if (!isNaN(count) && parts[2]) {
        bKey = parts[2].toLowerCase();
      } else {
        count = 1; // Default to 1 if count omitted
      }
    }

    const matchedDef = Object.values(BUILDING_DEFINITIONS).find(
      (b) =>
        b.id.toLowerCase() === bKey ||
        b.name.toLowerCase() === bKey ||
        b.name.toLowerCase().includes(bKey)
    );

    if (!matchedDef) {
      const sample = Object.keys(BUILDING_DEFINITIONS).slice(0, 10).join(', ');
      return {
        success: false,
        message: `❌ Unknown building "${bKey}". Examples: ${sample}...`,
      };
    }

    useTownStore.getState().addBuildingToStorage(matchedDef.id, count);
    return {
      success: true,
      message: `🏛️ [ADMIN TOWNTIME] Added ${count}x "${matchedDef.name}" ${matchedDef.icon} to your Town Storage!`,
    };
  }

  // Command: CLEAR
  if (command === 'clear') {
    return {
      success: true,
      message: 'Admin console log cleared.',
      action: 'clear_console',
    };
  }

  // Command: ITEM
  if (command === 'item' || command === 'items') {
    return {
      success: true,
      message: '📦 Opening Item Spawner panel (600 items, 5 columns)...',
      action: 'open_item_panel',
    };
  }

  // Command: ESPER (Campaign Only)
  if (command === 'esper' || command === 'espers') {
    const campaign = useCampaignStore.getState();
    if (!campaign.runActive) {
      return {
        success: false,
        message: '❌ /.esper can only be accessed during an active Roguelike Campaign run!',
      };
    }
    // USER RULE: /.esper counts for the esper room!
    const completedRoom = campaign.completeEsperRoomNode();
    return {
      success: true,
      message: completedRoom
        ? '🔮 [ADMIN] Opening Esper Chamber (Counted and completed for the Esper Chamber node on map)!'
        : '🔮 [ADMIN] Opening Esper Chamber...',
      action: 'open_esper_room',
    };
  }

  // Command: SHOP (Campaign Only)
  if (command === 'shop' || command === 'merchant') {
    const campaign = useCampaignStore.getState();
    if (!campaign.runActive) {
      return {
        success: false,
        message: '❌ /.shop can only be used during an active Roguelike Campaign run!',
      };
    }
    // Populate fresh merchant inventory if not already generated
    campaign.generateMerchantOfferings();
    return {
      success: true,
      message: '🛒 Opening Campaign Merchant Shop...',
      action: 'open_shop',
    };
  }

  // Command: HEAL (/.heal # <team|enemy|all|stuffy> [set|add])
  if (command === 'heal') {
    if (parts.length < 3) {
      return {
        success: false,
        message: '❌ Invalid syntax. Usage: /.heal # <team|enemy|all|stuffy> [set|add] (e.g. /.heal 50 team, /.heal 50 enemy, /.heal 100 all set)',
      };
    }

    const amount = parseInt(parts[1], 10);
    if (isNaN(amount) || amount < 0) {
      return { success: false, message: '❌ Invalid heal amount. Please specify a non-negative number.' };
    }

    const lastArg = parts[parts.length - 1].toLowerCase();
    const isModeSpecified = lastArg === 'set' || lastArg === 'add';
    const mode: 'set' | 'add' = isModeSpecified ? (lastArg as 'set' | 'add') : 'add';
    const targetQuery = parts.slice(2, isModeSpecified ? parts.length - 1 : parts.length).join(' ').trim();

    return executeHeal(amount, targetQuery, mode);
  }

  // Command: DAMAGE (/.damage # <team|enemy|all|stuffy> [set|add])
  if (command === 'damage' || command === 'dmg') {
    if (parts.length < 3) {
      return {
        success: false,
        message: '❌ Invalid syntax. Usage: /.damage # <team|enemy|all|stuffy> [set|add] (e.g. /.damage 30 enemy, /.damage 50 team, /.damage 10 all)',
      };
    }

    const amount = parseInt(parts[1], 10);
    if (isNaN(amount) || amount < 0) {
      return { success: false, message: '❌ Invalid damage amount. Please specify a non-negative number.' };
    }

    const lastArg = parts[parts.length - 1].toLowerCase();
    const isModeSpecified = lastArg === 'set' || lastArg === 'add';
    const mode: 'set' | 'add' = isModeSpecified ? (lastArg as 'set' | 'add') : 'add';
    const targetQuery = parts.slice(2, isModeSpecified ? parts.length - 1 : parts.length).join(' ').trim();

    return executeDamage(amount, targetQuery, mode);
  }

  // Command: SHIELD (/.shield # <team|enemy|all|stuffy> [set|add])
  if (command === 'shield') {
    if (parts.length < 3) {
      return {
        success: false,
        message: '❌ Invalid syntax. Usage: /.shield # <team|enemy|all|stuffy> [set|add] (e.g. /.shield 30 team set, /.shield 50 enemy add)',
      };
    }

    const amount = parseInt(parts[1], 10);
    if (isNaN(amount) || amount < 0) {
      return { success: false, message: '❌ Invalid shield amount.' };
    }

    const lastArg = parts[parts.length - 1].toLowerCase();
    const isModeSpecified = lastArg === 'set' || lastArg === 'add';
    const mode = isModeSpecified ? (lastArg as 'set' | 'add') : 'add';
    const targetQuery = parts.slice(2, isModeSpecified ? parts.length - 1 : parts.length).join(' ').trim();

    return executeShield(amount, targetQuery, mode);
  }

  // Command: KILL (/.kill <team|enemy|all|stuffy>)
  if (command === 'kill') {
    if (parts.length < 2) {
      return { success: false, message: '❌ Invalid syntax. Usage: /.kill <team|enemy|all|stuffy> (e.g. /.kill enemy, /.kill alex)' };
    }
    const targetQuery = parts.slice(1).join(' ').trim();
    return executeDamage(9999, targetQuery, 'add');
  }

  // Command: REVIVE (/.revive <team|enemy|all|stuffy>)
  if (command === 'revive') {
    if (parts.length < 2) {
      return { success: false, message: '❌ Invalid syntax. Usage: /.revive <team|enemy|all|stuffy> (e.g. /.revive team, /.revive all)' };
    }
    const targetQuery = parts.slice(1).join(' ').trim();
    return executeHeal(9999, targetQuery, 'set');
  }

  // Command: WIN (instant combat victory)
  if (command === 'win') {
    const combat = useCombatStore.getState();
    if (combat.battleResult !== 'ongoing' && combat.playerTeam.length === 0) {
      return { success: false, message: '❌ Not currently in an active battle.' };
    }
    useCombatStore.setState({
      battleResult: 'victory',
      enemyTeam: combat.enemyTeam.map((e) => ({ ...e, currentHp: 0, isUnstuffed: true })),
    });
    combat.addLog('👑 [ADMIN] Instant victory command triggered!', 'special');
    return { success: true, message: '🏆 [ADMIN] Combat victory declared!' };
  }

  // Command: GOLD (/.gold # [set|add])
  if (command === 'gold' || command === 'stuffydolars') {
    if (parts.length < 2) {
      return { success: false, message: '❌ Invalid syntax. Usage: /.gold # [set|add] (e.g. /.gold 500 add or /.gold 1000 set)' };
    }
    const goldVal = parseInt(parts[1], 10);
    if (isNaN(goldVal)) {
      return { success: false, message: '❌ Invalid number for gold.' };
    }

    const mode = (parts[2] || 'add').toLowerCase();
    const currentGold = useCampaignStore.getState().gold;
    let newGold = currentGold;

    if (mode === 'set') {
      newGold = Math.max(0, goldVal);
    } else {
      newGold = Math.max(0, currentGold + goldVal);
    }

    useCampaignStore.setState({ gold: newGold });
    return {
      success: true,
      message: `💵 [ADMIN] Stuffydolars ${mode === 'set' ? 'set to' : 'increased by'}: ${currentGold} -> ${newGold} (${mode.toUpperCase()})`,
    };
  }

  // Command: CRACKERS (/.crackers # [set|add])
  if (command === 'crackers' || command === 'cracker') {
    if (parts.length < 2) {
      return { success: false, message: '❌ Invalid syntax. Usage: /.crackers # [set|add] (e.g. /.crackers 5 add or /.crackers 7 set)' };
    }
    const crackersVal = parseInt(parts[1], 10);
    if (isNaN(crackersVal) || crackersVal < 0) {
      return { success: false, message: '❌ Invalid number for Crackers.' };
    }

    const mode = (parts[2] || 'set').toLowerCase();
    const currentCrackers = useCombatStore.getState().currentCrackers;
    let newCrackers = currentCrackers;

    if (mode === 'add') {
      newCrackers = currentCrackers + crackersVal;
    } else {
      newCrackers = crackersVal;
    }

    useCombatStore.setState({
      currentCrackers: newCrackers,
      maxCrackers: Math.max(useCombatStore.getState().maxCrackers, newCrackers),
    });
    useCombatStore.getState().addLog(`🍪 [ADMIN] Crackers ${mode === 'set' ? 'set to' : 'increased to'} ${newCrackers}!`, 'special');
    return {
      success: true,
      message: `🍪 [ADMIN] Combat Crackers ${mode === 'set' ? 'set to' : 'increased to'} ${newCrackers} (${mode.toUpperCase()}).`,
    };
  }

  // Command: ACT (/.act #)
  if (command === 'act') {
    const campaign = useCampaignStore.getState();
    if (!campaign.runActive) {
      return { success: false, message: '❌ /.act can only be used during an active campaign run!' };
    }
    if (parts.length < 2) {
      return {
        success: false,
        message: `❌ Invalid syntax. Usage: /.act # (Current: Act ${campaign.currentAct} / Max: Act ${campaign.totalActs})`,
      };
    }
    const actNum = parseInt(parts[1], 10);
    if (isNaN(actNum) || actNum < 1) {
      return { success: false, message: '❌ Invalid Act number. Must be a positive integer.' };
    }
    if (actNum < campaign.currentAct) {
      return {
        success: false,
        message: `❌ You cannot jump back to previous Acts (Current: Act ${campaign.currentAct}). You can only advance forward up to Act ${campaign.totalActs}.`,
      };
    }
    if (actNum === campaign.currentAct) {
      return {
        success: false,
        message: `ℹ️ You are already on Act ${campaign.currentAct}.`,
      };
    }
    if (actNum > campaign.totalActs) {
      return {
        success: false,
        message: `❌ Cannot set Act ${actNum}. You can only set up to the maximum acts you set for this run (Max: Act ${campaign.totalActs}).`,
      };
    }
    const success = campaign.setCampaignAct(actNum);
    if (success) {
      return {
        success: true,
        message: `👑 [ADMIN] Campaign jumped forward to Act ${actNum} of ${campaign.totalActs} (Floor 1 map initialized).`,
      };
    }
    return {
      success: false,
      message: `❌ Failed to set Act ${actNum}.`,
    };
  }

  // Command: FLOOR (/.floor #)
  if (command === 'floor') {
    const campaign = useCampaignStore.getState();
    if (!campaign.runActive) {
      return { success: false, message: '❌ /.floor can only be used during an active campaign run!' };
    }
    if (parts.length < 2) {
      return {
        success: false,
        message: `❌ Invalid syntax. Usage: /.floor # (Current: Floor ${campaign.currentFloor} / Max: Floor ${campaign.totalFloors})`,
      };
    }
    const floorNum = parseInt(parts[1], 10);
    if (isNaN(floorNum) || floorNum < 1) {
      return { success: false, message: '❌ Invalid Floor number. Must be a positive integer.' };
    }
    if (floorNum < campaign.currentFloor) {
      return {
        success: false,
        message: `❌ You cannot move back to previous Floors (Current: Floor ${campaign.currentFloor}). You can only advance forward up to Floor ${campaign.totalFloors}.`,
      };
    }
    if (floorNum === campaign.currentFloor) {
      return {
        success: false,
        message: `ℹ️ You are already on Floor ${campaign.currentFloor}.`,
      };
    }
    if (floorNum > campaign.totalFloors) {
      return {
        success: false,
        message: `❌ Cannot set Floor to ${floorNum}. Floor must be between 1 and ${campaign.totalFloors} (Current: Floor ${campaign.currentFloor}).`,
      };
    }
    const success = campaign.setCampaignFloor(floorNum);
    if (success) {
      return {
        success: true,
        message: `🏰 [ADMIN] Campaign jumped forward to Floor ${floorNum} of ${campaign.totalFloors} (Act ${campaign.currentAct}).`,
      };
    }
    return {
      success: false,
      message: `❌ Failed to set Floor ${floorNum}.`,
    };
  }

  // Command: REWARD (/.reward)
  if (command === 'reward' || command === 'rewards') {
    const campaign = useCampaignStore.getState();
    if (!campaign.runActive) {
      return {
        success: false,
        message: '❌ /.reward can only be used during an active campaign run!',
      };
    }
    return {
      success: true,
      message: '🎁 [ADMIN] Triggering Monster Fight victory rewards (Gold, Card draft, Food)...',
      action: 'open_rewards',
    };
  }

  // Command: STUFFY (/.stuffy #level stuffy_name)
  if (command === 'stuffy' || command === 'give_stuffy' || command === 'spawn_stuffy') {
    if (parts.length < 3) {
      return {
        success: false,
        message: '❌ Invalid syntax. Usage: /.stuffy #level stuffy_name (e.g. /.stuffy 5 alex, /.stuffy 7 jefe, /.stuffy 10 bear)',
      };
    }

    const level = parseInt(parts[1], 10);
    if (isNaN(level) || level < 1 || level > 10) {
      return {
        success: false,
        message: `❌ Invalid level "${parts[1]}". Please specify a star level from 1 to 10 (e.g. /.stuffy 5 alex).`,
      };
    }

    const nameQuery = parts.slice(2).join(' ').trim().toLowerCase();
    const cleanQuery = nameQuery.replace(/\s+/g, '');

    // Check if matching any stuffy species in ALL_STUFFIES
    const matchedSpecies = ALL_STUFFIES.find((s) => {
      const sId = s.id.toLowerCase();
      const sName = s.name.toLowerCase();
      const sSpecies = s.species.toLowerCase();
      return (
        sId === nameQuery ||
        sName === nameQuery ||
        sSpecies === nameQuery ||
        sName.replace(/\s+/g, '') === cleanQuery ||
        sId.replace(/_/g, '') === cleanQuery
      );
    });

    if (!matchedSpecies) {
      return {
        success: false,
        message: `❌ Stuffy "${parts.slice(2).join(' ')}" not found! Please check the spelling.`,
      };
    }

    // Bosses make it so that it does not work too
    if (
      BOSS_SPECIES_IDS.has(matchedSpecies.id) ||
      matchedSpecies.id.includes('boss') ||
      matchedSpecies.name.toLowerCase().includes('amalgam') ||
      matchedSpecies.title.toLowerCase().includes('boss') ||
      matchedSpecies.description.toLowerCase().includes('boss')
    ) {
      return {
        success: false,
        message: `❌ Cannot spawn boss stuffies! "${matchedSpecies.name}" is a boss monster and cannot be granted with /.stuffy.`,
      };
    }

    const campaign = useCampaignStore.getState();
    const result = campaign.giveStuffyByAdmin(level, matchedSpecies.id);
    return result;
  }

  // Command: PACK (/.pack [rarity])
  if (command === 'pack' || command === 'packs') {
    const campaign = useCampaignStore.getState();
    const rarityArg = parts[1]?.toLowerCase();
    const validRarities: PackRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const chosenRarity = validRarities.includes(rarityArg as any) ? (rarityArg as PackRarity) : undefined;
    const pack = createStuffyPack(chosenRarity, campaign.currentAct || 1);
    campaign.addPack(pack);
    return {
      success: true,
      message: `🎁 [ADMIN PACK] Granted ${pack.name} (${pack.rarity.toUpperCase()})! You can open it in the Star Chamber.`,
      action: 'open_star_chamber',
    };
  }

  // Command: STAR (/.star or /.starchamber)
  if (command === 'star' || command === 'starchamber') {
    return {
      success: true,
      message: '⭐ Opening Astral Star Chamber & Packs...',
      action: 'open_star_chamber',
    };
  }

  // Command: SHUFFLE (/.shuffle)
  if (command === 'shuffle') {
    const combatState = useCombatStore.getState();
    const isCombatActive = combatState.battleResult === 'ongoing' && combatState.playerTeam.length > 0;
    if (!isCombatActive) {
      return {
        success: false,
        message: '❌ /.shuffle can only be used during combat!',
      };
    }
    const discard = [...combatState.playerDiscard];
    if (discard.length === 0) {
      return {
        success: true,
        message: 'ℹ️ Discard pile is already empty! No cards to shuffle.',
      };
    }
    const combined = [...combatState.playerDeck, ...discard].sort(() => Math.random() - 0.5);
    useCombatStore.setState({
      playerDeck: combined,
      playerDiscard: [],
    });
    combatState.addLog(`🔀 [ADMIN SHUFFLE] Shuffled ${discard.length} card(s) from discard into draw pile!`, 'special');
    return {
      success: true,
      message: `🔀 [ADMIN] Shuffled ${discard.length} card(s) from discard pile into your draw pile! Draw pile now has ${combined.length} cards.`,
    };
  }

  // Command: PULL (/.pull)
  if (command === 'pull') {
    const combatState = useCombatStore.getState();
    const campaignState = useCampaignStore.getState();
    const isCombatActive = combatState.battleResult === 'ongoing' && combatState.playerTeam.length > 0;
    const hasCombatDeck = isCombatActive && combatState.playerDeck.length > 0;
    const hasCampaignDeck = campaignState.runActive && campaignState.deck.length > 0;

    if (!hasCombatDeck && !hasCampaignDeck) {
      return {
        success: false,
        message: '❌ No active draw deck found to pull cards from! Must be in combat or an active campaign.',
      };
    }

    return {
      success: true,
      message: '🎴 [ADMIN] Opening Deck Pull Selector. Click any card to place it at the top of your draw deck!',
      action: 'open_pull_modal',
    };
  }

  // Command: ADV / ADVANCE (Story Mode: advances past next mission as if completed)
  if (command === 'adv' || command === 'advance') {
    const combat = useCombatStore.getState();
    if (combat.playerTeam.length > 0) {
      useCombatStore.setState({
        battleResult: 'victory',
        enemyTeam: combat.enemyTeam.map((e) => ({ ...e, currentHp: 0, isUnstuffed: true })),
      });
      combat.addLog('⏩ [ADMIN] Mission advanced via /.adv command!', 'special');
    }

    const storyStore = useStoryStore.getState();
    const result = storyStore.advanceNextMission();
    return {
      success: result.success,
      message: result.message,
    };
  }

  // Command: VISION / VISON / MAPVISION (Story Mode: reveals the entire map across all 5 parts)
  if (
    command === 'vision' ||
    command === 'vison' ||
    command === 'mapvision' ||
    command === 'map_vision' ||
    command === 'reveal' ||
    command === 'see'
  ) {
    const storyStore = useStoryStore.getState();
    const arg = parts[1]?.toLowerCase().trim();
    let isEnabled: boolean;
    if (arg === 'off' || arg === 'disable' || arg === 'false' || arg === '0') {
      storyStore.setMapVision(false);
      isEnabled = false;
    } else if (arg === 'on' || arg === 'enable' || arg === 'true' || arg === '1') {
      storyStore.setMapVision(true);
      isEnabled = true;
    } else if (arg === 'toggle') {
      isEnabled = storyStore.toggleMapVision();
    } else {
      // By default, typing .vision or .vison explicitly enables vision
      storyStore.setMapVision(true);
      isEnabled = true;
    }

    return {
      success: true,
      message: isEnabled
        ? '👁️ [ADMIN] Map Vision ENABLED! All 2,640 sectors across all 5 parts are now fully visible and accessible on the map.'
        : '👁️ [ADMIN] Map Vision DISABLED. Fog of war restored to known and scouted neighbor sectors.',
    };
  }

  // Command: PART / PARTS (Story Mode: unlock selected part and all parts before it)
  if (command === 'part' || command === 'parts') {
    const storyStore = useStoryStore.getState();
    const arg = parts[1]?.trim();
    if (arg) {
      const partNum = parseInt(arg, 10);
      if (isNaN(partNum) || partNum < 1 || partNum > 5) {
        return {
          success: false,
          message: '❌ Invalid part number. Usage: /.part <1-5> (e.g. /.part 3 unlocks Parts 1, 2, and 3).',
        };
      }
      storyStore.unlockUpToPart(partNum);
      const unlockedList = Array.from({ length: partNum }, (_, i) => i + 1).join(', ');
      return {
        success: true,
        message: `👑 [ADMIN] Story Part ${partNum} and all parts before it (Parts ${unlockedList}) have been unlocked! Map view switched to Part ${partNum}.`,
      };
    }

    return {
      success: true,
      message: '🗺️ [ADMIN] Opening Story Part Unlock Chooser. Select a part (1-5) to unlock it and all parts before it.',
      action: 'open_part_selector',
    };
  }

  // Command: STORY (/.story reset)
  if (command === 'story') {
    const subCmd = parts[1]?.toLowerCase().trim();
    if (subCmd === 'reset' || subCmd === 'wipe' || subCmd === 'clear') {
      const storyStore = useStoryStore.getState();
      storyStore.resetStoryMode();
      return {
        success: true,
        message: '🔄 [ADMIN] Story Mode progress has been completely reset! All 100 sectors and 25 plushie rescues reset to initial state with Jefe.',
      };
    }
    return {
      success: false,
      message: '❌ Usage: /.story reset (resets all story mode sectors and rescues)',
    };
  }

  return {
    success: false,
    message: `❌ Unknown command "/.${command}". Type "/.help" for available commands.`,
  };
}

function executeHeal(
  amount: number,
  targetQuery: string,
  mode: 'set' | 'add' = 'add'
): CommandExecutionResult {
  const combatState = useCombatStore.getState();
  const campaignState = useCampaignStore.getState();

  const { scope, cleanQuery } = parseTargetScope(targetQuery);

  let affectedCount = 0;
  const messages: string[] = [];

  const shouldTargetPlayer = scope === 'team' || scope === 'all' || scope === 'single';
  const shouldTargetEnemy = scope === 'enemy' || scope === 'all' || scope === 'single';

  // 1. In Combat: Check playerTeam and enemyTeam
  const inCombat = combatState.playerTeam.length > 0;
  if (inCombat) {
    let updatedPlayerTeam = combatState.playerTeam.map((stuffy) => {
      if (shouldTargetPlayer && matchesStuffy(stuffy, cleanQuery, scope)) {
        const oldHp = stuffy.currentHp;
        const newHp = mode === 'set' ? Math.min(stuffy.maxHp, amount) : Math.min(stuffy.maxHp, stuffy.currentHp + amount);
        affectedCount++;
        messages.push(`✨ ${stuffy.name}: ${oldHp} -> ${newHp}/${stuffy.maxHp} HP`);
        return {
          ...stuffy,
          currentHp: newHp,
          isUnstuffed: newHp === 0,
        };
      }
      return stuffy;
    });

    let updatedEnemyTeam = combatState.enemyTeam.map((stuffy) => {
      if (shouldTargetEnemy && matchesStuffy(stuffy, cleanQuery, scope)) {
        const oldHp = stuffy.currentHp;
        const newHp = mode === 'set' ? Math.min(stuffy.maxHp, amount) : Math.min(stuffy.maxHp, stuffy.currentHp + amount);
        affectedCount++;
        messages.push(`✨ (Enemy) ${stuffy.name}: ${oldHp} -> ${newHp}/${stuffy.maxHp} HP`);
        return {
          ...stuffy,
          currentHp: newHp,
          isUnstuffed: newHp === 0,
        };
      }
      return stuffy;
    });

    useCombatStore.setState({
      playerTeam: updatedPlayerTeam,
      enemyTeam: updatedEnemyTeam,
    });

    const targetDesc = scope === 'team' ? 'Player Team' : scope === 'enemy' ? 'Enemy Team' : scope === 'all' ? 'Both Teams' : targetQuery;
    combatState.addLog(`✨ [ADMIN] ${mode === 'set' ? `Set HP to ${amount}` : `Applied +${amount} Heal`} to ${targetDesc}!`, 'heal');
  }

  // 2. In Campaign: Also update activeParty and bench
  if (campaignState.activeParty.length > 0 && shouldTargetPlayer) {
    let updatedParty = campaignState.activeParty.map((stuffy) => {
      if (matchesStuffy(stuffy, cleanQuery, scope)) {
        const oldHp = stuffy.currentHp;
        const newHp = mode === 'set' ? Math.min(stuffy.maxHp, amount) : Math.min(stuffy.maxHp, stuffy.currentHp + amount);
        if (!inCombat) {
          affectedCount++;
          messages.push(`✨ (Party) ${stuffy.name}: ${oldHp} -> ${newHp}/${stuffy.maxHp} HP`);
        }
        return {
          ...stuffy,
          currentHp: newHp,
          isUnstuffed: newHp === 0,
        };
      }
      return stuffy;
    });

    let updatedBench = campaignState.bench.map((stuffy) => {
      if (matchesStuffy(stuffy, cleanQuery, scope)) {
        const oldHp = stuffy.currentHp;
        const newHp = mode === 'set' ? Math.min(stuffy.maxHp, amount) : Math.min(stuffy.maxHp, stuffy.currentHp + amount);
        if (!inCombat) {
          affectedCount++;
          messages.push(`✨ (Bench) ${stuffy.name}: ${oldHp} -> ${newHp}/${stuffy.maxHp} HP`);
        }
        return {
          ...stuffy,
          currentHp: newHp,
          isUnstuffed: newHp === 0,
        };
      }
      return stuffy;
    });

    useCampaignStore.setState({
      activeParty: updatedParty,
      bench: updatedBench,
    });
  }

  if (affectedCount === 0) {
    return {
      success: false,
      message: `❌ No active stuffy found matching "${targetQuery}". Tip: Use "team", "enemy", "all", or a stuffy name.`,
    };
  }

  return {
    success: true,
    message: `💚 [ADMIN HEAL ${mode.toUpperCase()} ${amount}]\n` + messages.join('\n'),
  };
}

function executeDamage(
  amount: number,
  targetQuery: string,
  mode: 'set' | 'add' = 'add'
): CommandExecutionResult {
  const combatState = useCombatStore.getState();
  const campaignState = useCampaignStore.getState();

  const { scope, cleanQuery } = parseTargetScope(targetQuery);

  let affectedCount = 0;
  const messages: string[] = [];

  const shouldTargetPlayer = scope === 'team' || scope === 'all' || scope === 'single';
  const shouldTargetEnemy = scope === 'enemy' || scope === 'all' || scope === 'single';

  // 1. In Combat: Check playerTeam and enemyTeam
  const inCombat = combatState.playerTeam.length > 0;
  if (inCombat) {
    let updatedPlayerTeam = combatState.playerTeam.map((stuffy) => {
      if (shouldTargetPlayer && matchesStuffy(stuffy, cleanQuery, scope)) {
        const oldHp = stuffy.currentHp;
        const newHp = mode === 'set' ? Math.max(0, amount) : Math.max(0, stuffy.currentHp - amount);
        const isUnstuffed = newHp === 0;
        affectedCount++;
        messages.push(`💥 ${stuffy.name}: ${oldHp} -> ${newHp}/${stuffy.maxHp} HP ${isUnstuffed ? '(UNSTUFFED!)' : ''}`);
        return {
          ...stuffy,
          currentHp: newHp,
          isUnstuffed,
        };
      }
      return stuffy;
    });

    let updatedEnemyTeam = combatState.enemyTeam.map((stuffy) => {
      if (shouldTargetEnemy && matchesStuffy(stuffy, cleanQuery, scope)) {
        const oldHp = stuffy.currentHp;
        const newHp = mode === 'set' ? Math.max(0, amount) : Math.max(0, stuffy.currentHp - amount);
        const isUnstuffed = newHp === 0;
        affectedCount++;
        messages.push(`💥 (Enemy) ${stuffy.name}: ${oldHp} -> ${newHp}/${stuffy.maxHp} HP ${isUnstuffed ? '(UNSTUFFED!)' : ''}`);
        return {
          ...stuffy,
          currentHp: newHp,
          isUnstuffed,
        };
      }
      return stuffy;
    });

    useCombatStore.setState({
      playerTeam: updatedPlayerTeam,
      enemyTeam: updatedEnemyTeam,
    });

    const targetDesc = scope === 'team' ? 'Player Team' : scope === 'enemy' ? 'Enemy Team' : scope === 'all' ? 'Both Teams' : targetQuery;
    combatState.addLog(`💥 [ADMIN] ${mode === 'set' ? `Set HP to ${amount}` : `Dealt ${amount} Damage`} to ${targetDesc}!`, 'damage');
  }

  // 2. In Campaign: Also update activeParty and bench
  if (campaignState.activeParty.length > 0 && shouldTargetPlayer) {
    let updatedParty = campaignState.activeParty.map((stuffy) => {
      if (matchesStuffy(stuffy, cleanQuery, scope)) {
        const oldHp = stuffy.currentHp;
        const newHp = mode === 'set' ? Math.max(0, amount) : Math.max(0, stuffy.currentHp - amount);
        const isUnstuffed = newHp === 0;
        if (!inCombat) {
          affectedCount++;
          messages.push(`💥 (Party) ${stuffy.name}: ${oldHp} -> ${newHp}/${stuffy.maxHp} HP ${isUnstuffed ? '(UNSTUFFED!)' : ''}`);
        }
        return {
          ...stuffy,
          currentHp: newHp,
          isUnstuffed,
        };
      }
      return stuffy;
    });

    useCampaignStore.setState({
      activeParty: updatedParty,
    });
  }

  if (affectedCount === 0) {
    return {
      success: false,
      message: `❌ No active stuffy found matching "${targetQuery}". Tip: Use "team", "enemy", "all", or a stuffy name.`,
    };
  }

  return {
    success: true,
    message: `💔 [ADMIN DAMAGE ${mode.toUpperCase()} ${amount}]\n` + messages.join('\n'),
  };
}

function executeShield(amount: number, targetQuery: string, mode: 'set' | 'add'): CommandExecutionResult {
  const combatState = useCombatStore.getState();
  const campaignState = useCampaignStore.getState();

  const { scope, cleanQuery } = parseTargetScope(targetQuery);

  let affectedCount = 0;
  const messages: string[] = [];

  const shouldTargetPlayer = scope === 'team' || scope === 'all' || scope === 'single';
  const shouldTargetEnemy = scope === 'enemy' || scope === 'all' || scope === 'single';

  const inCombat = combatState.playerTeam.length > 0;
  if (inCombat) {
    let updatedPlayerTeam = combatState.playerTeam.map((stuffy) => {
      if (shouldTargetPlayer && matchesStuffy(stuffy, cleanQuery, scope)) {
        const oldShield = stuffy.shield || 0;
        const newShield = mode === 'set' ? amount : oldShield + amount;
        affectedCount++;
        messages.push(`🛡️ ${stuffy.name}: ${oldShield} -> ${newShield} Shield`);
        return {
          ...stuffy,
          shield: newShield,
        };
      }
      return stuffy;
    });

    let updatedEnemyTeam = combatState.enemyTeam.map((stuffy) => {
      if (shouldTargetEnemy && matchesStuffy(stuffy, cleanQuery, scope)) {
        const oldShield = stuffy.shield || 0;
        const newShield = mode === 'set' ? amount : oldShield + amount;
        affectedCount++;
        messages.push(`🛡️ (Enemy) ${stuffy.name}: ${oldShield} -> ${newShield} Shield`);
        return {
          ...stuffy,
          shield: newShield,
        };
      }
      return stuffy;
    });

    useCombatStore.setState({
      playerTeam: updatedPlayerTeam,
      enemyTeam: updatedEnemyTeam,
    });
    const targetDesc = scope === 'team' ? 'Player Team' : scope === 'enemy' ? 'Enemy Team' : scope === 'all' ? 'Both Teams' : targetQuery;
    combatState.addLog(`🛡️ [ADMIN] Shield ${mode === 'set' ? 'set to' : 'increased by'} ${amount} for ${targetDesc}!`, 'shield');
  } else if (campaignState.activeParty.length > 0 && shouldTargetPlayer) {
    let updatedParty = campaignState.activeParty.map((stuffy) => {
      if (matchesStuffy(stuffy, cleanQuery, scope)) {
        const oldShield = stuffy.shield || 0;
        const newShield = mode === 'set' ? amount : oldShield + amount;
        affectedCount++;
        messages.push(`🛡️ (Party) ${stuffy.name}: ${oldShield} -> ${newShield} Shield`);
        return {
          ...stuffy,
          shield: newShield,
        };
      }
      return stuffy;
    });

    useCampaignStore.setState({
      activeParty: updatedParty,
    });
  }

  if (affectedCount === 0) {
    return {
      success: false,
      message: `❌ No active stuffy found matching "${targetQuery}". Tip: Use "team", "enemy", "all", or a stuffy name.`,
    };
  }

  return {
    success: true,
    message: `🛡️ [ADMIN SHIELD ${mode.toUpperCase()} ${amount}]\n` + messages.join('\n'),
  };
}
