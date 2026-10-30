import { useCombatStore } from '@/store/combatStore';
import { useCampaignStore } from '@/store/campaignStore';
import { StuffyState } from '@/types/game';
import { ALL_STUFFIES } from '@/data/stuffies';

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  action?: 'open_item_panel' | 'open_esper_panel' | 'open_shop' | 'clear_console' | 'none';
}

/**
 * Normalizes input string to find matching stuffy from team or catalog.
 */
function matchesStuffy(stuffy: StuffyState, query: string): boolean {
  const q = query.toLowerCase().trim();
  if (q === 'all') return true;
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

  // Strip leading punctuation: "/.", "/", or "."
  let normalized = trimmed;
  if (normalized.startsWith('/.')) {
    normalized = normalized.substring(2).trim();
  } else if (normalized.startsWith('/') || normalized.startsWith('.')) {
    normalized = normalized.substring(1).trim();
  }

  const parts = normalized.split(/\s+/);
  const command = parts[0].toLowerCase();

  // Command: HELP
  if (command === 'help') {
    return {
      success: true,
      message: [
        '🛠️ === BEN ADMIN COMMANDS (v3.8) ===',
        '• /.heal # <stuffy>          - Heals a stuffy for # HP (e.g. /.heal 50 cow, /.heal 100 all)',
        '• /.damage # <stuffy>        - Deals # damage to a stuffy (e.g. /.damage 35 alex, /.damage 99 all)',
        '• /.item                     - Opens the Item Spawner (600 items across 6 types & 5 tiers)',
        '• /.esper                    - [Campaign Only] Opens the Esper Spawner to infuse campaign espers',
        '• /.shop                     - [Campaign Only] Opens the Campaign Merchant Shop immediately',
        '• /.gold # [set|add]         - Sets or adds # Stuffydolars (e.g. /.gold 500 add, /.gold 1000 set)',
        '• /.crackers # [set|add]     - Sets or adds combat Crackers (e.g. /.crackers 5 add, /.crackers 7 set)',
        '• /.shield # <stuffy> [set|add] - Grants shield to stuffy (e.g. /.shield 30 cow set)',
        '• /.kill <stuffy>            - Unstuffs a stuffy immediately (e.g. /.kill thumper)',
        '• /.revive <stuffy>          - Revives an unstuffed stuffy to full HP (e.g. /.revive all)',
        '• /.win                      - Instantly wins the current combat match',
        '• /.act #                    - Sets current campaign Act (e.g. /.act 3)',
        '• /.clear                    - Clears the admin console log',
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
    return {
      success: true,
      message: '🔮 Opening Campaign Esper Infusion Panel...',
      action: 'open_esper_panel',
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
    return {
      success: true,
      message: '🛒 Opening Campaign Merchant Shop...',
      action: 'open_shop',
    };
  }

  // Command: HEAL (/.heal # stuffy)
  if (command === 'heal') {
    if (parts.length < 3) {
      return {
        success: false,
        message: '❌ Invalid syntax. Usage: /.heal # <stuffy> (e.g. /.heal 50 cow or /.heal 100 all)',
      };
    }

    const amount = parseInt(parts[1], 10);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, message: '❌ Invalid heal amount. Please specify a positive number.' };
    }

    const targetQuery = parts.slice(2).join(' ').trim();
    return executeHeal(amount, targetQuery);
  }

  // Command: DAMAGE (/.damage # stuffy)
  if (command === 'damage' || command === 'dmg') {
    if (parts.length < 3) {
      return {
        success: false,
        message: '❌ Invalid syntax. Usage: /.damage # <stuffy> (e.g. /.damage 30 jefe or /.damage 50 all)',
      };
    }

    const amount = parseInt(parts[1], 10);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, message: '❌ Invalid damage amount. Please specify a positive number.' };
    }

    const targetQuery = parts.slice(2).join(' ').trim();
    return executeDamage(amount, targetQuery);
  }

  // Command: SHIELD (/.shield # <stuffy> [set|add])
  if (command === 'shield') {
    if (parts.length < 3) {
      return {
        success: false,
        message: '❌ Invalid syntax. Usage: /.shield # <stuffy> [set|add] (e.g. /.shield 30 cow set)',
      };
    }

    const amount = parseInt(parts[1], 10);
    if (isNaN(amount) || amount < 0) {
      return { success: false, message: '❌ Invalid shield amount.' };
    }

    const lastArg = parts[parts.length - 1].toLowerCase();
    const isModeSpecified = lastArg === 'set' || lastArg === 'add';
    const mode = isModeSpecified ? lastArg : 'add';
    const targetQuery = parts.slice(2, isModeSpecified ? parts.length - 1 : parts.length).join(' ').trim();

    return executeShield(amount, targetQuery, mode as 'set' | 'add');
  }

  // Command: KILL (/.kill stuffy)
  if (command === 'kill') {
    if (parts.length < 2) {
      return { success: false, message: '❌ Invalid syntax. Usage: /.kill <stuffy> (e.g. /.kill alex)' };
    }
    const targetQuery = parts.slice(1).join(' ').trim();
    return executeDamage(9999, targetQuery);
  }

  // Command: REVIVE (/.revive stuffy)
  if (command === 'revive') {
    if (parts.length < 2) {
      return { success: false, message: '❌ Invalid syntax. Usage: /.revive <stuffy> (e.g. /.revive all)' };
    }
    const targetQuery = parts.slice(1).join(' ').trim();
    return executeHeal(9999, targetQuery);
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
    if (parts.length < 2) {
      return { success: false, message: '❌ Invalid syntax. Usage: /.act # (e.g. /.act 2 or /.act 3)' };
    }
    const actNum = parseInt(parts[1], 10);
    if (isNaN(actNum) || actNum < 1) {
      return { success: false, message: '❌ Invalid Act number.' };
    }
    useCampaignStore.setState({ currentAct: actNum });
    return {
      success: true,
      message: `👑 [ADMIN] Campaign Act updated to Act ${actNum}.`,
    };
  }

  return {
    success: false,
    message: `❌ Unknown command "/.${command}". Type "/.help" for available commands.`,
  };
}

function executeHeal(amount: number, targetQuery: string): CommandExecutionResult {
  const combatState = useCombatStore.getState();
  const campaignState = useCampaignStore.getState();

  let affectedCount = 0;
  const messages: string[] = [];

  // 1. In Combat: Check playerTeam, playerBench, and enemyTeam
  const inCombat = combatState.playerTeam.length > 0;
  if (inCombat) {
    let updatedPlayerTeam = combatState.playerTeam.map((stuffy) => {
      if (matchesStuffy(stuffy, targetQuery)) {
        const oldHp = stuffy.currentHp;
        const newHp = Math.min(stuffy.maxHp, stuffy.currentHp + amount);
        affectedCount++;
        messages.push(`✨ ${stuffy.name}: ${oldHp} -> ${newHp}/${stuffy.maxHp} HP`);
        return {
          ...stuffy,
          currentHp: newHp,
          isUnstuffed: false,
        };
      }
      return stuffy;
    });

    let updatedEnemyTeam = combatState.enemyTeam.map((stuffy) => {
      if (matchesStuffy(stuffy, targetQuery)) {
        const oldHp = stuffy.currentHp;
        const newHp = Math.min(stuffy.maxHp, stuffy.currentHp + amount);
        affectedCount++;
        messages.push(`✨ (Enemy) ${stuffy.name}: ${oldHp} -> ${newHp}/${stuffy.maxHp} HP`);
        return {
          ...stuffy,
          currentHp: newHp,
          isUnstuffed: false,
        };
      }
      return stuffy;
    });

    useCombatStore.setState({
      playerTeam: updatedPlayerTeam,
      enemyTeam: updatedEnemyTeam,
    });

    combatState.addLog(`✨ [ADMIN] Applied ${amount} Heal to "${targetQuery}"!`, 'heal');
  }

  // 2. In Campaign: Also update activeParty and bench
  if (campaignState.activeParty.length > 0) {
    let updatedParty = campaignState.activeParty.map((stuffy) => {
      if (matchesStuffy(stuffy, targetQuery)) {
        const oldHp = stuffy.currentHp;
        const newHp = Math.min(stuffy.maxHp, stuffy.currentHp + amount);
        if (!inCombat) {
          affectedCount++;
          messages.push(`✨ (Party) ${stuffy.name}: ${oldHp} -> ${newHp}/${stuffy.maxHp} HP`);
        }
        return {
          ...stuffy,
          currentHp: newHp,
          isUnstuffed: false,
        };
      }
      return stuffy;
    });

    let updatedBench = campaignState.bench.map((stuffy) => {
      if (matchesStuffy(stuffy, targetQuery)) {
        const oldHp = stuffy.currentHp;
        const newHp = Math.min(stuffy.maxHp, stuffy.currentHp + amount);
        if (!inCombat) {
          affectedCount++;
          messages.push(`✨ (Bench) ${stuffy.name}: ${oldHp} -> ${newHp}/${stuffy.maxHp} HP`);
        }
        return {
          ...stuffy,
          currentHp: newHp,
          isUnstuffed: false,
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
      message: `❌ No active stuffy found matching "${targetQuery}". Tip: verify the name or use "all".`,
    };
  }

  return {
    success: true,
    message: `💚 [ADMIN HEAL +${amount}]\n` + messages.join('\n'),
  };
}

function executeDamage(amount: number, targetQuery: string): CommandExecutionResult {
  const combatState = useCombatStore.getState();
  const campaignState = useCampaignStore.getState();

  let affectedCount = 0;
  const messages: string[] = [];

  // 1. In Combat: Check playerTeam and enemyTeam
  const inCombat = combatState.playerTeam.length > 0;
  if (inCombat) {
    let updatedPlayerTeam = combatState.playerTeam.map((stuffy) => {
      if (matchesStuffy(stuffy, targetQuery)) {
        const oldHp = stuffy.currentHp;
        const newHp = Math.max(0, stuffy.currentHp - amount);
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
      if (matchesStuffy(stuffy, targetQuery)) {
        const oldHp = stuffy.currentHp;
        const newHp = Math.max(0, stuffy.currentHp - amount);
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

    combatState.addLog(`💥 [ADMIN] Dealt ${amount} Damage to "${targetQuery}"!`, 'damage');
  }

  // 2. In Campaign: Also update activeParty and bench
  if (campaignState.activeParty.length > 0) {
    let updatedParty = campaignState.activeParty.map((stuffy) => {
      if (matchesStuffy(stuffy, targetQuery)) {
        const oldHp = stuffy.currentHp;
        const newHp = Math.max(0, stuffy.currentHp - amount);
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
      message: `❌ No active stuffy found matching "${targetQuery}". Tip: verify the name or use "all".`,
    };
  }

  return {
    success: true,
    message: `💔 [ADMIN DAMAGE -${amount}]\n` + messages.join('\n'),
  };
}

function executeShield(amount: number, targetQuery: string, mode: 'set' | 'add'): CommandExecutionResult {
  const combatState = useCombatStore.getState();
  const campaignState = useCampaignStore.getState();

  let affectedCount = 0;
  const messages: string[] = [];

  const inCombat = combatState.playerTeam.length > 0;
  if (inCombat) {
    let updatedPlayerTeam = combatState.playerTeam.map((stuffy) => {
      if (matchesStuffy(stuffy, targetQuery)) {
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

    useCombatStore.setState({
      playerTeam: updatedPlayerTeam,
    });
    combatState.addLog(`🛡️ [ADMIN] Shield ${mode === 'set' ? 'set to' : 'increased by'} ${amount} for "${targetQuery}"!`, 'shield');
  } else if (campaignState.activeParty.length > 0) {
    let updatedParty = campaignState.activeParty.map((stuffy) => {
      if (matchesStuffy(stuffy, targetQuery)) {
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
      message: `❌ No active stuffy found matching "${targetQuery}".`,
    };
  }

  return {
    success: true,
    message: `🛡️ [ADMIN SHIELD ${mode.toUpperCase()} ${amount}]\n` + messages.join('\n'),
  };
}
