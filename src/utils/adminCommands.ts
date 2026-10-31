import { useCombatStore } from '@/store/combatStore';
import { useCampaignStore } from '@/store/campaignStore';
import { StuffyState, PackRarity } from '@/types/game';
import { ALL_STUFFIES, BOSS_SPECIES_IDS, createStuffyPack } from '@/data/stuffies';

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  action?: 'open_item_panel' | 'open_esper_panel' | 'open_esper_room' | 'open_shop' | 'open_rewards' | 'open_star_chamber' | 'clear_console' | 'none';
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
        '• /.clear                                     - Clears the admin console log',
      ].join('\n'),
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
