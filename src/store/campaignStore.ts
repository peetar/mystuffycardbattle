import { create } from 'zustand';
import { Card, StuffyState, MapNode, Relic, FoodItem, MapNodeType } from '@/types/game';
import { ALL_STUFFIES, STUFFY_MAP } from '@/data/stuffies';
import { ALL_CARDS, CARD_MAP, PLAYER_POWERUP_CARDS } from '@/data/cards';
import { FOOD_CATALOG, calculateFoodHeal } from '@/data/foods';
import { ALL_RELICS } from '@/data/relics';
import { getLoadoutsForStuffy } from '@/data/loadouts';

export type RunLength = 'short' | 'standard' | 'marathon';

export interface CampaignStore {
  // Run status
  runActive: boolean;
  currentFloor: number;
  totalFloors: number;
  currentAct: number;
  totalActs: number;
  runLength: RunLength;
  nodes: MapNode[];
  currentNodeId: string | null;
  lastCompletedNodeId: string | null;

  // Party & Bench (5 active in battle, rest on bench)
  activeParty: StuffyState[];
  bench: StuffyState[];
  deck: Card[];

  // Resources
  gold: number;
  relics: Relic[];
  foodsInventory: FoodItem[];

  // Merchant offerings for current shop
  merchantStuffies: string[];
  merchantCards: Card[];
  merchantFoods: FoodItem[];
  merchantRelics: Relic[];
  fluffUpgradePrice: number;
  cardRemovalPrice: number;

  // Actions
  startNewCampaign: (
    initialStuffies: { speciesId: string; loadoutId: string }[],
    runLength?: RunLength,
    customFloors?: number,
    actsCount?: number
  ) => void;
  moveToNode: (nodeId: string) => void;
  completeNode: () => void;
  advanceAct: () => boolean;
  swapPartyAndBench: (partyIndex: number, benchIndex: number) => void;
  abandonRun: () => void;

  // Merchant actions
  buyStuffy: (speciesId: string, loadoutId: string, price: number) => boolean;
  buyCard: (cardId: string, price: number) => boolean;
  buyFood: (foodId: string) => boolean;
  buyRelic: (relicId: string) => boolean;
  addRelic: (relic: Relic) => void;
  buyFluffUpgrade: (stuffyInstanceId: string) => boolean;
  removeCardFromDeck: (cardIndex: number) => boolean;
  upgradeCardInDeck: (cardIndex: number, price: number) => boolean;

  // Food feeding
  feedFoodToStuffy: (stuffyInstanceId: string, foodId: string) => { success: boolean; message: string };

  // Rewards
  addGold: (amount: number) => void;
  addCardToDeck: (card: Card) => void;
  healParty: (percent: number) => void;
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  runActive: false,
  currentFloor: 1,
  totalFloors: 8,
  currentAct: 1,
  totalActs: 1,
  runLength: 'standard',
  nodes: [],
  currentNodeId: null,
  lastCompletedNodeId: null,

  activeParty: [],
  bench: [],
  deck: [],

  gold: 100,
  relics: [],
  foodsInventory: [],

  merchantStuffies: [],
  merchantCards: [],
  merchantFoods: [],
  merchantRelics: [],
  fluffUpgradePrice: 35,
  cardRemovalPrice: 40,

  startNewCampaign: (initialStuffies, runLength = 'standard', customFloors, actsCount = 1) => {
    let totalFloors = customFloors ? Math.max(3, Math.min(15, customFloors)) : 8;
    if (!customFloors) {
      if (runLength === 'short') totalFloors = 5;
      else if (runLength === 'marathon') totalFloors = 12;
    }
    const totalActs = Math.max(1, Math.min(5, actsCount || 1));

    // Build starter 5 active stuffies & starter deck
    const activeParty: StuffyState[] = [];
    const deck: Card[] = [];

    initialStuffies.slice(0, 5).forEach((pick, idx) => {
      const species = STUFFY_MAP.get(pick.speciesId);
      if (!species) return;

      const stuffy: StuffyState = {
        instanceId: `party_${pick.speciesId}_${idx}`,
        speciesId: pick.speciesId,
        name: species.name,
        maxHp: species.baseHp,
        currentHp: species.baseHp,
        shield: 0,
        isUnstuffed: false,
        statusEffects: [],
        selectedLoadoutId: pick.loadoutId,
      };
      activeParty.push(stuffy);

      // Add the 10 cards from the selected loadout
      const loadouts = getLoadoutsForStuffy(pick.speciesId);
      const chosenLoadout = loadouts.find((l) => l.id === pick.loadoutId) || loadouts[0];
      if (chosenLoadout) {
        chosenLoadout.cardIds.forEach((cId) => {
          const card = CARD_MAP.get(cId);
          if (card) deck.push({ ...card });
        });
      }
    });

    // RULE: Start with one of every player power-up card!
    PLAYER_POWERUP_CARDS.forEach((card) => {
      if (card.id !== 'player_energy') {
        deck.push({ ...card });
      }
    });

    // RULE: Start with 5 Energy cards! (Infuses energy into a stuffy to boost damage)
    const energyCard = PLAYER_POWERUP_CARDS.find((c) => c.id === 'player_energy');
    if (energyCard) {
      for (let i = 0; i < 5; i++) {
        deck.push({ ...energyCard });
      }
    }

    // Generate procedural Slay the Spire Map Graph with unique seed
    const nodes = generateProceduralCampaignMap(totalFloors);

    set({
      runActive: true,
      currentFloor: 1,
      totalFloors,
      currentAct: 1,
      totalActs,
      runLength,
      nodes,
      currentNodeId: null,
      lastCompletedNodeId: null,
      activeParty,
      bench: [],
      deck,
      gold: 100,
      relics: [],
      foodsInventory: [FOOD_CATALOG[0], FOOD_CATALOG[1]],
    });
  },

  advanceAct: () => {
    const { currentAct, totalActs, totalFloors } = get();
    if (currentAct < totalActs) {
      const nextAct = currentAct + 1;
      const nodes = generateProceduralCampaignMap(totalFloors, nextAct);
      set({
        currentAct: nextAct,
        currentFloor: 1,
        nodes,
        currentNodeId: null,
        lastCompletedNodeId: null,
      });
      return true;
    }
    return false;
  },

  moveToNode: (nodeId) => {
    const { nodes } = get();
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    if (targetNode.type === 'merchant') {
      const unusedSpecies = ALL_STUFFIES.filter(
        (s) => !get().activeParty.some((p) => p.speciesId === s.id) && !get().bench.some((b) => b.speciesId === s.id)
      );
      const shuffled = [...unusedSpecies].sort(() => Math.random() - 0.5);
      const merchantStuffies = shuffled.slice(0, 3).map((s) => s.id);

      // Get all species IDs currently in player's party and bench
      const ownedSpeciesIds = [
        ...get().activeParty.map((s) => s.speciesId),
        ...get().bench.map((b) => b.speciesId),
      ];

      // Filter eligible cards strictly to owned stuffy cards and player cards
      const eligibleCards = ALL_CARDS.filter(
        (c) => c.isPlayerCard || (c.stuffyId && ownedSpeciesIds.includes(c.stuffyId))
      );

      // Separate into standard cards and special cards (S-tier or player specials)
      const specialCardsPool = eligibleCards.filter(
        (c) => c.tier === 'S' || c.type === 'special' || (c.isPlayerCard && (c.type === 'restitch' || c.brainDamage || c.cost === 0))
      );
      const standardCardsPool = eligibleCards.filter(
        (c) => c.tier !== 'S' && c.type !== 'special'
      );

      // Slots 1 to 4: 4 standard cards
      const shuffledStandard = [...standardCardsPool].sort(() => Math.random() - 0.5);
      const standardCards4 = shuffledStandard.slice(0, 4);

      // Slots 5 & 6: 2 special cards
      const shuffledSpecial = [...specialCardsPool].sort(() => Math.random() - 0.5);
      const specialCards2 = shuffledSpecial.slice(0, 2);
      if (specialCards2.length < 2) {
        const extra = shuffledStandard.slice(4, 4 + (2 - specialCards2.length));
        specialCards2.push(...extra);
      }

      // Exactly 6 cards for sale: first 4 standard, last 2 special
      const merchantCards = [...standardCards4, ...specialCards2];
      const availableRelics = ALL_RELICS.filter((r) => !get().relics.some((owned) => owned.id === r.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);

      const randomFoods = [...FOOD_CATALOG].sort(() => Math.random() - 0.5).slice(0, 3);

      set({
        merchantStuffies,
        merchantCards,
        merchantFoods: randomFoods,
        merchantRelics: availableRelics,
      });
    }

    set({
      currentNodeId: nodeId,
      currentFloor: targetNode.floor,
    });
  },

  completeNode: () => {
    const { nodes, currentNodeId, totalFloors } = get();
    const currentNode = nodes.find((n) => n.id === currentNodeId);
    const updated = nodes.map((n) => (n.id === currentNodeId ? { ...n, completed: true } : n));
    const nextFloor = currentNode ? Math.min(totalFloors, currentNode.floor + 1) : 1;
    set({
      nodes: updated,
      lastCompletedNodeId: currentNodeId,
      currentNodeId: null,
      currentFloor: nextFloor,
    });
  },

  swapPartyAndBench: (partyIndex, benchIndex) => {
    const active = [...get().activeParty];
    const bench = [...get().bench];
    if (active[partyIndex] && bench[benchIndex]) {
      const removedStuffy = active[partyIndex];
      const addedStuffy = bench[benchIndex];

      active[partyIndex] = addedStuffy;
      bench[benchIndex] = removedStuffy;

      // Rebuild the active combat deck!
      // Remove cards of removedStuffy and add cards of addedStuffy
      const activeSpeciesIds = new Set(active.map((s) => s.speciesId));
      let updatedDeck = get().deck.filter(
        (c) => c.isPlayerCard || (c.stuffyId && activeSpeciesIds.has(c.stuffyId))
      );

      // Add the new stuffy's 10 cards if not already in deck
      const newLoadouts = getLoadoutsForStuffy(addedStuffy.speciesId);
      const chosenLoadout = newLoadouts.find((l) => l.id === addedStuffy.selectedLoadoutId) || newLoadouts[0];
      if (chosenLoadout) {
        chosenLoadout.cardIds.forEach((cId) => {
          const card = CARD_MAP.get(cId);
          if (card) updatedDeck.push({ ...card });
        });
      }

      set({ activeParty: active, bench, deck: updatedDeck });
    }
  },

  abandonRun: () => {
    set({
      runActive: false,
      currentFloor: 1,
      nodes: [],
      currentNodeId: null,
      lastCompletedNodeId: null,
      activeParty: [],
      bench: [],
      deck: [],
    });
  },

  buyStuffy: (speciesId, loadoutId, price) => {
    const { gold, bench, merchantStuffies } = get();
    if (gold < price) return false;

    const stuffyIndex = merchantStuffies.indexOf(speciesId);
    if (stuffyIndex === -1) return false;

    const species = STUFFY_MAP.get(speciesId);
    if (!species) return false;

    const newStuffy: StuffyState = {
      instanceId: `bench_${speciesId}_${Date.now()}`,
      speciesId,
      name: species.name,
      maxHp: species.baseHp,
      currentHp: species.baseHp,
      shield: 0,
      isUnstuffed: false,
      statusEffects: [],
      selectedLoadoutId: loadoutId,
    };

    const updatedMerchantStuffies = [...merchantStuffies];
    updatedMerchantStuffies.splice(stuffyIndex, 1);

    // Stuffy goes directly to bench! Cards will only be added to battle deck if swapped into squad.
    set({
      gold: gold - price,
      bench: [...bench, newStuffy],
      merchantStuffies: updatedMerchantStuffies,
    });
    return true;
  },

  buyCard: (cardId, price) => {
    const { gold, deck, merchantCards } = get();
    if (gold < price) return false;

    const cardIndex = merchantCards.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return false;
    const card = merchantCards[cardIndex];

    const updatedMerchantCards = [...merchantCards];
    updatedMerchantCards.splice(cardIndex, 1);

    set({
      gold: gold - price,
      deck: [...deck, { ...card }],
      merchantCards: updatedMerchantCards,
    });
    return true;
  },

  buyFood: (foodId) => {
    const { gold, foodsInventory, merchantFoods } = get();
    const foodIndex = merchantFoods.findIndex((f) => f.id === foodId);
    if (foodIndex === -1) return false;
    const food = merchantFoods[foodIndex];
    if (gold < food.price) return false;

    const updatedMerchantFoods = [...merchantFoods];
    updatedMerchantFoods.splice(foodIndex, 1);

    set({
      gold: gold - food.price,
      foodsInventory: [...foodsInventory, food],
      merchantFoods: updatedMerchantFoods,
    });
    return true;
  },

  buyRelic: (relicId) => {
    const { gold, relics, merchantRelics } = get();
    const relicIndex = merchantRelics.findIndex((r) => r.id === relicId);
    if (relicIndex === -1) return false;
    const relic = merchantRelics[relicIndex];
    if (gold < relic.price) return false;

    const updatedMerchantRelics = [...merchantRelics];
    updatedMerchantRelics.splice(relicIndex, 1);

    set({
      gold: gold - relic.price,
      relics: [...relics, relic],
      merchantRelics: updatedMerchantRelics,
    });
    return true;
  },

  addRelic: (relic: Relic) => {
    const { relics, activeParty } = get();
    let updatedParty = [...activeParty];
    if (relic.id === 'extra_stuffing_bag') {
      updatedParty = updatedParty.map((s) => ({
        ...s,
        maxHp: s.maxHp + 10,
        currentHp: s.currentHp + 10,
      }));
    }
    set({
      relics: [...relics, relic],
      activeParty: updatedParty,
    });
  },

  buyFluffUpgrade: (stuffyInstanceId) => {
    const { gold, fluffUpgradePrice, activeParty, bench } = get();
    if (gold < fluffUpgradePrice) return false;

    const upgradeList = (list: StuffyState[]) =>
      list.map((s) => {
        if (s.instanceId === stuffyInstanceId) {
          return {
            ...s,
            maxHp: s.maxHp + 10,
            currentHp: s.currentHp + 10,
          };
        }
        return s;
      });

    set({
      gold: gold - fluffUpgradePrice,
      activeParty: upgradeList(activeParty),
      bench: upgradeList(bench),
      fluffUpgradePrice: Math.round(fluffUpgradePrice * 1.3),
    });
    return true;
  },

  removeCardFromDeck: (cardIndex) => {
    const { gold, cardRemovalPrice, deck } = get();
    if (gold < cardRemovalPrice || deck.length <= 10) return false;

    const newDeck = deck.filter((_, idx) => idx !== cardIndex);
    set({
      gold: gold - cardRemovalPrice,
      deck: newDeck,
      cardRemovalPrice: cardRemovalPrice + 25,
    });
    return true;
  },

  upgradeCardInDeck: (cardIndex, price) => {
    const { gold, deck } = get();
    if (gold < price || !deck[cardIndex] || deck[cardIndex].upgraded) return false;

    const card = deck[cardIndex];
    const newDamage = card.damage ? Math.max(card.damage + 3, Math.round(card.damage * 1.35)) : undefined;
    const newBlock = card.block ? Math.max(card.block + 3, Math.round(card.block * 1.35)) : undefined;
    const newHeal = card.heal ? Math.max(card.heal + 4, Math.round(card.heal * 1.35)) : undefined;

    let bonusSummary = '✨ Reinforced:';
    if (newDamage) bonusSummary += ` 💥${newDamage} Dmg (+${newDamage - card.damage!})`;
    if (newBlock) bonusSummary += ` 🛡️${newBlock} Shield (+${newBlock - card.block!})`;
    if (newHeal) bonusSummary += ` 💖${newHeal} Heal (+${newHeal - card.heal!})`;
    if (!newDamage && !newBlock && !newHeal) bonusSummary += ' +35% Power!';

    const upgradedCard: Card = {
      ...card,
      name: card.name.endsWith('+') ? card.name : `${card.name}+`,
      upgraded: true,
      damage: newDamage,
      block: newBlock,
      heal: newHeal,
      description: `${card.description} (${bonusSummary})`,
    };

    const newDeck = [...deck];
    newDeck[cardIndex] = upgradedCard;

    set({
      gold: gold - price,
      deck: newDeck,
    });
    return true;
  },

  feedFoodToStuffy: (stuffyInstanceId, foodId) => {
    const { foodsInventory, activeParty, bench } = get();
    const foodIdx = foodsInventory.findIndex((f) => f.id === foodId);
    if (foodIdx === -1) {
      return { success: false, message: 'Snack not in bag!' };
    }

    const food = foodsInventory[foodIdx];
    let target = activeParty.find((s) => s.instanceId === stuffyInstanceId) ||
                 bench.find((s) => s.instanceId === stuffyInstanceId);

    if (!target) return { success: false, message: 'Stuffy not found!' };

    const species = STUFFY_MAP.get(target.speciesId);
    if (!species) return { success: false, message: 'Unknown species!' };

    let preference: 'favorite' | 'mid' | 'hated' = 'mid';
    if (species.favoriteFoods.includes(food.name)) preference = 'favorite';
    else if (species.hatedFoods.includes(food.name)) preference = 'hated';

    const healResult = calculateFoodHeal(target.currentHp, target.maxHp, preference);

    const updateStuffyInList = (list: StuffyState[]) =>
      list.map((s) => {
        if (s.instanceId === stuffyInstanceId) {
          return {
            ...s,
            currentHp: healResult.newHp,
            isUnstuffed: false,
          };
        }
        return s;
      });

    const newInventory = [...foodsInventory];
    newInventory.splice(foodIdx, 1);

    set({
      foodsInventory: newInventory,
      activeParty: updateStuffyInList(activeParty),
      bench: updateStuffyInList(bench),
    });

    const prefLabel = preference === 'favorite' ? '❤️ Favorite!' : preference === 'hated' ? '🤢 Hated!' : '😐 Mid snack';
    return {
      success: true,
      message: `${target.name} ate ${food.name} (${prefLabel})! Restored ${healResult.healedAmount} HP!`,
    };
  },

  addGold: (amount) => set((s) => ({ gold: s.gold + amount })),

  addCardToDeck: (card) => set((s) => ({ deck: [...s.deck, { ...card }] })),

  healParty: (percent) => {
    const ratio = percent / 100;
    const healList = (list: StuffyState[]) =>
      list.map((s) => {
        const heal = Math.round(s.maxHp * ratio);
        return { ...s, currentHp: Math.min(s.maxHp, s.currentHp + heal), isUnstuffed: false };
      });
    set({
      activeParty: healList(get().activeParty),
      bench: healList(get().bench),
    });
  },
}));

// Procedural DAG Slay the Spire Map Generator
function generateProceduralCampaignMap(totalFloors: number, actNumber: number = 1): MapNode[] {
  const nodes: MapNode[] = [];

  const monsterNames = [
    'Wild Plush Skirmish', 'Dusty Carpet Ambush', 'Bedpost Raiders', 'Underbed Patrol',
    'Rug Mites Swarm', 'Linen Closet Ambush', 'Curtain Climbers', 'Couch Crevice Mites'
  ];
  const eliteNames = [
    'Elite Dust Bunny', 'Stray Sewing Monster', 'Giant Velvet Chimera',
    'Elite Fluff Overlord', 'Antique Porcelain Bear', 'Shadowy Closet Golem'
  ];
  const eventNames = [
    'Forgotten Toybox', 'Grandma’s Sewing Basket', 'Washing Machine Whirl',
    'Lost Under Blanket', 'Attic Starlight Cache', 'The Mysterious Drawer'
  ];
  const merchantNames = [
    'Boutique Merchant', 'Pillow Emporium', 'Button & Yarn Bazaar',
    'Cozy Corner Shop', 'Plush Polyfill Mart'
  ];
  const restNames = [
    'Cozy Quilt Camp', 'Pillow Haven', 'Last Rest Under Blankets', 'Warm Fireplace Perch'
  ];

  const actBossNames: Record<number, string> = {
    1: 'ACT 1 BOSS: THE WASHING MACHINE CYCLE 🌀',
    2: 'ACT 2 BOSS: THE ATTIC CLOCKWORK CHIMERA ⏰',
    3: 'ACT 3 BOSS: THE LAWN SPRINKLER HYDRA 💦',
    4: 'ACT 4 BOSS: THE MASTER SEWING GOLEM 🪡',
    5: 'ACT 5 FINAL BOSS: SUPREME EMPEROR TEDDY 👑',
  };

  // Helper random choice
  const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // Floor by floor generation
  const floorNodesMap: Record<number, MapNode[]> = {};

  for (let floor = 1; floor <= totalFloors; floor++) {
    floorNodesMap[floor] = [];

    if (floor === 1) {
      // Floor 1: 2 starter monsters
      floorNodesMap[floor].push(
        { id: `f${floor}_n1`, type: 'monster', floor, position: { x: 30, y: 85 }, connections: [], completed: false, name: pickRandom(monsterNames) },
        { id: `f${floor}_n2`, type: 'monster', floor, position: { x: 70, y: 85 }, connections: [], completed: false, name: pickRandom(monsterNames) }
      );
    } else if (floor === totalFloors) {
      // Boss floor for this Act
      const bossName = actBossNames[actNumber] || `ACT ${actNumber} BOSS: OVERSIZED CHIMERA 🌀`;
      floorNodesMap[floor].push({
        id: `f${floor}_boss`,
        type: 'boss',
        floor,
        position: { x: 50, y: 5 },
        connections: [],
        completed: false,
        name: bossName,
      });
    } else if (floor === totalFloors - 1) {
      // Rest site right before boss
      floorNodesMap[floor].push({
        id: `f${floor}_rest`,
        type: 'rest',
        floor,
        position: { x: 50, y: 15 },
        connections: [],
        completed: false,
        name: 'Last Rest Under Blankets 🏕️',
      });
    } else {
      // Intermediate procedural floors
      const nodeCount = Math.random() < 0.5 ? 2 : 3;
      const xPositions = nodeCount === 2 ? [35, 65] : [25, 50, 75];
      const yPos = 85 - Math.round((floor / totalFloors) * 75);

      for (let i = 0; i < nodeCount; i++) {
        let nodeType: MapNodeType = 'monster';
        const rand = Math.random();

        if (floor === 2) {
          nodeType = rand < 0.4 ? 'monster' : rand < 0.7 ? 'event' : 'merchant';
        } else if (floor === Math.floor(totalFloors / 2)) {
          // Mid floor has high merchant / elite chance
          nodeType = rand < 0.4 ? 'elite' : rand < 0.7 ? 'merchant' : 'rest';
        } else {
          nodeType = rand < 0.45 ? 'monster' : rand < 0.65 ? 'event' : rand < 0.85 ? 'elite' : 'rest';
        }

        let name = pickRandom(monsterNames);
        if (nodeType === 'elite') name = pickRandom(eliteNames);
        else if (nodeType === 'event') name = pickRandom(eventNames);
        else if (nodeType === 'merchant') name = pickRandom(merchantNames);
        else if (nodeType === 'rest') name = pickRandom(restNames);

        floorNodesMap[floor].push({
          id: `f${floor}_n${i + 1}`,
          type: nodeType,
          floor,
          position: { x: xPositions[i], y: yPos },
          connections: [],
          completed: false,
          name,
        });
      }
    }
  }

  // Connect forward paths from floor F to floor F+1
  for (let floor = 1; floor < totalFloors; floor++) {
    const currentNodes = floorNodesMap[floor];
    const nextNodes = floorNodesMap[floor + 1];

    currentNodes.forEach((cNode, cIdx) => {
      if (nextNodes.length === 1) {
        cNode.connections.push(nextNodes[0].id);
      } else if (currentNodes.length === nextNodes.length) {
        cNode.connections.push(nextNodes[cIdx].id);
        if (cIdx + 1 < nextNodes.length) cNode.connections.push(nextNodes[cIdx + 1].id);
        if (cIdx - 1 >= 0) cNode.connections.push(nextNodes[cIdx - 1].id);
      } else {
        // Connect to nearest 1-2 nodes on next floor
        nextNodes.forEach((nNode) => {
          if (Math.abs(cNode.position.x - nNode.position.x) <= 35) {
            cNode.connections.push(nNode.id);
          }
        });
        if (cNode.connections.length === 0) {
          cNode.connections.push(nextNodes[0].id);
        }
      }
    });

    // Verify all nextNodes have at least one incoming connection
    nextNodes.forEach((nNode) => {
      const hasIncoming = currentNodes.some((c) => c.connections.includes(nNode.id));
      if (!hasIncoming) {
        // Attach from nearest node on current floor
        currentNodes[0].connections.push(nNode.id);
      }
    });
  }

  // Flatten all nodes into single array
  for (let floor = 1; floor <= totalFloors; floor++) {
    nodes.push(...floorNodesMap[floor]);
  }

  return nodes;
}
