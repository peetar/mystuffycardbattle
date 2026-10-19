export type CardTier = 'F' | 'D' | 'C' | 'B' | 'A' | 'S';

export type CardType = 'attack' | 'defense' | 'heal' | 'restitch' | 'special' | 'debuff' | 'utility';

export type TargetType = 
  | 'single_enemy' 
  | 'all_enemies' 
  | 'single_ally' 
  | 'all_allies' 
  | 'self' 
  | 'unstuffed_ally' 
  | 'none';

export interface Card {
  id: string;
  name: string;
  tier: CardTier;
  cost: number; // in Crackers (0-7)
  type: CardType;
  target: TargetType;
  stuffyId?: string; // owner stuffy, or undefined for Player Power-Up cards
  description: string;
  damage?: number;
  block?: number;
  heal?: number;
  lifesteal?: boolean;
  poison?: number; // turns / damage per turn
  taunt?: boolean;
  brainDamage?: boolean;
  canRevive?: boolean;
  specialActionId?: string; // e.g., 'strokenosis', 'earthquake', 'swallow_whole', 'slug_hug', 'shell_up', 'acorn_hoard', 'knock_off_table'
  isPlayerCard?: boolean;
  upgraded?: boolean;
}

export type StatusEffectType = 
  | 'poison' 
  | 'brain_damaged' 
  | 'earthquake_crack' 
  | 'taunt' 
  | 'damage_reduction' 
  | 'miss_chance' 
  | 'vulnerable'
  | 'energy'
  | 'weak'
  | 'shield_boost'
  | 'fire';

export interface StatusEffect {
  type: StatusEffectType;
  duration?: number; // turns remaining, or undefined for persistent until condition
  value?: number; // magnitude (e.g. poison damage per turn, damage reduction percentage, energy bonus)
  sourceStuffyId?: string;
}

export interface StuffySpecies {
  id: string;
  name: string;
  species: string;
  title: string;
  description: string;
  baseHp: number;
  color: string;
  accentColor: string;
  secondaryColor?: string;
  features: string[]; // for pixel sprite generation
  passiveDescription?: string;
  favoriteFoods: string[];
  midFoods: string[];
  hatedFoods: string[];
}

export interface StuffyState {
  instanceId: string;
  speciesId: string;
  name: string;
  maxHp: number;
  currentHp: number;
  shield: number;
  isUnstuffed: boolean; // hit 0 HP, deflated plush on field
  isPermanentlyDevoured?: boolean; // Finlee's Swallow Whole (cannot be restitched!)
  statusEffects: StatusEffect[];
  selectedLoadoutId?: string;
  isMega?: boolean; // Elite leader or Boss Mega Stuffy
  customDeckTier?: 'A-' | 'A+' | 'standard';
  georgeMode?: 'angry' | 'happy'; // Octopus George mode: 'angry' (red, 2x atk, 0.5x heal) or 'happy' (blue, 2x heal, 0.5x atk)
}

export interface MultiplayerTurnAction {
  turnNumber?: number;
  playerSide: PlayerSide;
  playerName: string;
  cardName: string;
  cardType: string;
  cardTier: string;
  targetName: string;
  damage?: number;
  heal?: number;
  effectDescription: string;
  wasUnstuffed?: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  price: number;
}

export interface Relic {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'boss';
  effectType:
    | 'bonus_cracker'
    | 'passive_regen'
    | 'shield_boost'
    | 'extra_draw'
    | 'fluff_bonus'
    | 'turn_end_shield'
    | 'cracker_refund'
    | 'energy_boost'
    | 'death_prevention'
    | 'heal_boost'
    | 'bonus_gold'
    | 'start_energy';
  value: number;
  price: number;
}

export interface CombatHistorySnapshot {
  playerTeam: StuffyState[];
  enemyTeam: StuffyState[];
  playerHand: Card[];
  playerDeck: Card[];
  playerDiscard: Card[];
  enemyHand?: Card[];
  enemyDeck?: Card[];
  enemyDiscard?: Card[];
  currentCrackers: number;
  combatLogs: { id: string; text: string; type: 'damage' | 'heal' | 'shield' | 'special' | 'status' }[];
  multiplayerPlayers?: MultiplayerPlayerData[];
  recentMultiplayerActions?: MultiplayerTurnAction[];
  description: string;
}

export type MapNodeType = 'monster' | 'elite' | 'rest' | 'event' | 'merchant' | 'boss';

export interface MapNode {
  id: string;
  type: MapNodeType;
  floor: number;
  position: { x: number; y: number };
  connections: string[]; // target node IDs on next floor
  completed: boolean;
  name: string;
}

export interface LoadoutPackage {
  id: string;
  stuffyId: string;
  name: string;
  theme: string;
  averageTier: 'B';
  cardIds: string[]; // exactly 10 cards
}

export type PlayerSide = 'p1' | 'p2' | 'p3' | 'p4';

export interface MultiplayerPlayerData {
  id: PlayerSide;
  name: string;
  color: string;
  team: StuffyState[];
  bench: StuffyState[];
  deck: Card[];
  hand: Card[];
  discard: Card[];
  isEliminated: boolean;
  isBot?: boolean;
}

