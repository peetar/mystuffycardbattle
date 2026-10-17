import { create } from 'zustand';
import { Card, StuffyState, MapNode, Relic, FoodItem } from '@/types/game';
import { ALL_STUFFIES, STUFFY_MAP } from '@/data/stuffies';
import { ALL_CARDS, CARD_MAP } from '@/data/cards';
import { FOOD_CATALOG, calculateFoodHeal } from '@/data/foods';
import { ALL_RELICS } from '@/data/relics';
import { getLoadoutsForStuffy } from '@/data/loadouts';

export interface CampaignStore {
  // Run status
  runActive: boolean;
  currentFloor: number;
  totalFloors: number;
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
  merchantStuffies: string[]; // 3 stuffy species IDs
  merchantCards: Card[];
  merchantFoods: FoodItem[];
  merchantRelics: Relic[];
  fluffUpgradePrice: number;
  cardRemovalPrice: number;

  // Actions
  startNewCampaign: (initialStuffies: { speciesId: string; loadoutId: string }[], runLength?: 'short' | 'standard') => void;
  moveToNode: (nodeId: string) => void;
  completeNode: () => void;
  swapPartyAndBench: (partyIndex: number, benchIndex: number) => void;

  // Merchant actions
  buyStuffy: (speciesId: string, loadoutId: string, price: number) => boolean;
  buyCard: (cardId: string, price: number) => boolean;
  buyFood: (foodId: string) => boolean;
  buyRelic: (relicId: string) => boolean;
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

  startNewCampaign: (initialStuffies, runLength = 'short') => {
    const totalFloors = runLength === 'short' ? 8 : 14;

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

    // Generate Slay the Spire Map Graph
    const nodes = generateCampaignMap(totalFloors);

    set({
      runActive: true,
      currentFloor: 1,
      totalFloors,
      nodes,
      currentNodeId: null,
      lastCompletedNodeId: null,
      activeParty,
      bench: [],
      deck,
      gold: 100,
      relics: [],
      foodsInventory: [FOOD_CATALOG[0], FOOD_CATALOG[1]], // starter snack pack
    });
  },

  moveToNode: (nodeId) => {
    const { nodes } = get();
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    // If node is merchant, refresh shop inventory
    if (targetNode.type === 'merchant') {
      const unusedSpecies = ALL_STUFFIES.filter(
        (s) => !get().activeParty.some((p) => p.speciesId === s.id) && !get().bench.some((b) => b.speciesId === s.id)
      );
      const shuffled = [...unusedSpecies].sort(() => Math.random() - 0.5);
      const merchantStuffies = shuffled.slice(0, 3).map((s) => s.id);

      const randomCards = [...ALL_CARDS].sort(() => Math.random() - 0.5).slice(0, 4);
      const randomFoods = [...FOOD_CATALOG].sort(() => Math.random() - 0.5).slice(0, 4);
      const availableRelics = ALL_RELICS.filter((r) => !get().relics.some((owned) => owned.id === r.id)).slice(0, 2);

      set({
        merchantStuffies,
        merchantCards: randomCards,
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
    const { nodes, currentNodeId } = get();
    const updated = nodes.map((n) => (n.id === currentNodeId ? { ...n, completed: true } : n));
    set({
      nodes: updated,
      lastCompletedNodeId: currentNodeId,
      currentNodeId: null,
    });
  },

  swapPartyAndBench: (partyIndex, benchIndex) => {
    const active = [...get().activeParty];
    const bench = [...get().bench];
    if (active[partyIndex] && bench[benchIndex]) {
      const temp = active[partyIndex];
      active[partyIndex] = bench[benchIndex];
      bench[benchIndex] = temp;
      set({ activeParty: active, bench });
    }
  },

  buyStuffy: (speciesId, loadoutId, price) => {
    const { gold, bench, deck } = get();
    if (gold < price) return false;

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

    // Add 10 cards to deck
    const loadouts = getLoadoutsForStuffy(speciesId);
    const chosen = loadouts.find((l) => l.id === loadoutId) || loadouts[0];
    const newCards: Card[] = [];
    if (chosen) {
      chosen.cardIds.forEach((cId) => {
        const c = CARD_MAP.get(cId);
        if (c) newCards.push({ ...c });
      });
    }

    set({
      gold: gold - price,
      bench: [...bench, newStuffy],
      deck: [...deck, ...newCards],
      merchantStuffies: get().merchantStuffies.filter((id) => id !== speciesId),
    });
    return true;
  },

  buyCard: (cardId, price) => {
    const { gold, deck, merchantCards } = get();
    if (gold < price) return false;
    const card = CARD_MAP.get(cardId);
    if (!card) return false;

    set({
      gold: gold - price,
      deck: [...deck, { ...card }],
      merchantCards: merchantCards.filter((c) => c.id !== cardId),
    });
    return true;
  },

  buyFood: (foodId) => {
    const { gold, foodsInventory, merchantFoods } = get();
    const food = FOOD_CATALOG.find((f) => f.id === foodId);
    if (!food || gold < food.price) return false;

    set({
      gold: gold - food.price,
      foodsInventory: [...foodsInventory, food],
      merchantFoods: merchantFoods.filter((f) => f.id !== foodId),
    });
    return true;
  },

  buyRelic: (relicId) => {
    const { gold, relics, merchantRelics } = get();
    const relic = ALL_RELICS.find((r) => r.id === relicId);
    if (!relic || gold < relic.price) return false;

    set({
      gold: gold - relic.price,
      relics: [...relics, relic],
      merchantRelics: merchantRelics.filter((r) => r.id !== relicId),
    });
    return true;
  },

  buyFluffUpgrade: (stuffyInstanceId) => {
    const { gold, fluffUpgradePrice, activeParty, bench } = get();
    if (gold < fluffUpgradePrice) return false;

    const updateHp = (list: StuffyState[]) =>
      list.map((s) => (s.instanceId === stuffyInstanceId ? { ...s, maxHp: s.maxHp + 10, currentHp: s.currentHp + 10 } : s));

    set({
      gold: gold - fluffUpgradePrice,
      fluffUpgradePrice: Math.round(fluffUpgradePrice * 1.3),
      activeParty: updateHp(activeParty),
      bench: updateHp(bench),
    });
    return true;
  },

  removeCardFromDeck: (cardIndex) => {
    const { gold, cardRemovalPrice, deck } = get();
    if (gold < cardRemovalPrice) return false;

    const updatedDeck = deck.filter((_, idx) => idx !== cardIndex);
    set({
      gold: gold - cardRemovalPrice,
      cardRemovalPrice: cardRemovalPrice + 25,
      deck: updatedDeck,
    });
    return true;
  },

  upgradeCardInDeck: (cardIndex, price) => {
    const { gold, deck } = get();
    if (gold < price) return false;
    const card = deck[cardIndex];
    if (!card || card.upgraded) return false;

    const upgradedCard: Card = {
      ...card,
      name: `${card.name}+`,
      damage: card.damage ? Math.round(card.damage * 1.3) : undefined,
      block: card.block ? Math.round(card.block * 1.3) : undefined,
      heal: card.heal ? Math.round(card.heal * 1.3) : undefined,
      upgraded: true,
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
    const { activeParty, bench, foodsInventory } = get();
    const food = foodsInventory.find((f) => f.id === foodId);
    if (!food) return { success: false, message: 'Food item not found.' };

    const target = [...activeParty, ...bench].find((s) => s.instanceId === stuffyInstanceId);
    if (!target) return { success: false, message: 'Stuffy not found.' };

    const species = STUFFY_MAP.get(target.speciesId);
    if (!species) return { success: false, message: 'Species not registered.' };

    let preference: 'favorite' | 'mid' | 'hated' = 'mid';
    if (species.favoriteFoods.includes(foodId)) preference = 'favorite';
    else if (species.hatedFoods.includes(foodId)) preference = 'hated';

    const result = calculateFoodHeal(target.currentHp, target.maxHp, preference);

    const updateHp = (list: StuffyState[]) =>
      list.map((s) => (s.instanceId === stuffyInstanceId ? { ...s, currentHp: result.newHp, isUnstuffed: false } : s));

    const remainingFoods = [...foodsInventory];
    const foodIdx = remainingFoods.findIndex((f) => f.id === foodId);
    if (foodIdx >= 0) remainingFoods.splice(foodIdx, 1);

    set({
      activeParty: updateHp(activeParty),
      bench: updateHp(bench),
      foodsInventory: remainingFoods,
    });

    return { success: true, message: `${target.name} ate ${food.name}! ${result.message}` };
  },

  addGold: (amount) => set((s) => ({ gold: s.gold + amount })),
  addCardToDeck: (card) => set((s) => ({ deck: [...s.deck, card] })),
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

function generateCampaignMap(totalFloors: number): MapNode[] {
  const nodes: MapNode[] = [];

  // Floor 1: 2 starter Monster nodes
  nodes.push(
    { id: 'f1_n1', type: 'monster', floor: 1, position: { x: 30, y: 85 }, connections: ['f2_n1', 'f2_n2'], completed: false, name: 'Wild Plush Skirmish' },
    { id: 'f1_n2', type: 'monster', floor: 1, position: { x: 70, y: 85 }, connections: ['f2_n2', 'f2_n3'], completed: false, name: 'Dusty Carpet Ambush' }
  );

  // Floor 2: Mixed Event / Monster
  nodes.push(
    { id: 'f2_n1', type: 'event', floor: 2, position: { x: 20, y: 72 }, connections: ['f3_n1', 'f3_n2'], completed: false, name: 'Forgotten Toybox' },
    { id: 'f2_n2', type: 'monster', floor: 2, position: { x: 50, y: 72 }, connections: ['f3_n2'], completed: false, name: 'Bedpost Raiders' },
    { id: 'f2_n3', type: 'merchant', floor: 2, position: { x: 80, y: 72 }, connections: ['f3_n2', 'f3_n3'], completed: false, name: 'Boutique Merchant' }
  );

  // Floor 3: Elite / Rest
  nodes.push(
    { id: 'f3_n1', type: 'elite', floor: 3, position: { x: 25, y: 58 }, connections: ['f4_n1'], completed: false, name: 'Elite Dust Bunny' },
    { id: 'f3_n2', type: 'rest', floor: 3, position: { x: 50, y: 58 }, connections: ['f4_n1', 'f4_n2'], completed: false, name: 'Cozy Quilt Camp' },
    { id: 'f3_n3', type: 'elite', floor: 3, position: { x: 75, y: 58 }, connections: ['f4_n2'], completed: false, name: 'Stray Sewing Monster' }
  );

  // Floor 4: Merchant & Event
  nodes.push(
    { id: 'f4_n1', type: 'merchant', floor: 4, position: { x: 35, y: 44 }, connections: ['f5_n1', 'f5_n2'], completed: false, name: 'Pillow Emporium' },
    { id: 'f4_n2', type: 'event', floor: 4, position: { x: 65, y: 44 }, connections: ['f5_n2'], completed: false, name: 'Grandma’s Sewing Basket' }
  );

  // Floor 5: Tough Monster
  nodes.push(
    { id: 'f5_n1', type: 'monster', floor: 5, position: { x: 40, y: 30 }, connections: ['f6_n1'], completed: false, name: 'Attic Patrol Guard' },
    { id: 'f5_n2', type: 'monster', floor: 5, position: { x: 60, y: 30 }, connections: ['f6_n1'], completed: false, name: 'Velvet Chimera' }
  );

  // Floor 6: Final Rest before Boss
  nodes.push(
    { id: 'f6_n1', type: 'rest', floor: 6, position: { x: 50, y: 18 }, connections: ['boss_node'], completed: false, name: 'Last Rest Under Blankets' }
  );

  // Floor 7: Boss Node!
  nodes.push(
    { id: 'boss_node', type: 'boss', floor: 7, position: { x: 50, y: 6 }, connections: [], completed: false, name: 'THE WASHING MACHINE CYCLE' }
  );

  return nodes;
}
