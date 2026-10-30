import { useCombatStore } from '@/store/combatStore';
import { useCampaignStore } from '@/store/campaignStore';
import { StuffyState } from '@/types/game';
import { ALL_STUFFIES } from '@/data/stuffies';

export interface CommandExecutionResult {
  success: boolean;
  message: string;
  action?: 'open_item_panel' | 'clear_console' | 'none';
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
        '🛠️ === BEN ADMIN COMMANDS (v3.7) ===',
        '• /.heal # <stuffy>   - Heals a stuffy for # HP (e.g. /.heal 50 cow, /.heal 100 all)',
        '• /.damage # <stuffy> - Deals # damage to a stuffy (e.g. /.damage 35 alex, /.damage 99 all)',
        '• /.item              - Opens the Item Spawner panel to click & grant any item',
        '• /.gold #            - Sets or adds # Stuffydolars (e.g. /.gold 500)',
        '• /.crackers #         - Sets combat Crackers to # (e.g. /.crackers 7)',
        '• /.kill <stuffy>     - Unstuffs a stuffy immediately (e.g. /.kill thumper)',
        '• /.revive <stuffy>   - Revives an unstuffed stuffy to full HP (e.g. /.revive all)',
        '• /.clear             - Clears the admin console log',
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
      message: '📦 Opening Item Spawner panel...',
      action: 'open_item_panel',
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

  // Command: GOLD (/.gold #)
  if (command === 'gold' || command === 'stuffydolars') {
    if (parts.length < 2) {
      return { success: false, message: '❌ Invalid syntax. Usage: /.gold # (e.g. /.gold 500)' };
    }
    const goldVal = parseInt(parts[1], 10);
    if (isNaN(goldVal)) {
      return { success: false, message: '❌ Invalid number for gold.' };
    }
    const currentGold = useCampaignStore.getState().gold;
    const newGold = Math.max(0, currentGold + goldVal);
    useCampaignStore.setState({ gold: newGold });
    return {
      success: true,
      message: `💵 [ADMIN] Stuffydolars updated: ${currentGold} -> ${newGold} (+${goldVal})`,
    };
  }

  // Command: CRACKERS (/.crackers #)
  if (command === 'crackers' || command === 'cracker') {
    if (parts.length < 2) {
      return { success: false, message: '❌ Invalid syntax. Usage: /.crackers # (e.g. /.crackers 7)' };
    }
    const crackersVal = parseInt(parts[1], 10);
    if (isNaN(crackersVal) || crackersVal < 0) {
      return { success: false, message: '❌ Invalid number for Crackers.' };
    }
    useCombatStore.setState({ currentCrackers: crackersVal, maxCrackers: Math.max(useCombatStore.getState().maxCrackers, crackersVal) });
    useCombatStore.getState().addLog(`🍪 [ADMIN] Crackers set to ${crackersVal}!`, 'special');
    return {
      success: true,
      message: `🍪 [ADMIN] Combat Crackers set to ${crackersVal}.`,
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
