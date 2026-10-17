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
  | 'vulnerable';

export interface StatusEffect {
  type: StatusEffectType;
  duration?: number; // turns remaining, or undefined for persistent until condition
  value?: number; // magnitude (e.g. poison damage per turn, damage reduction percentage)
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
  icon: string;
  description: string;
  effectType: 'bonus_cracker' | 'passive_regen' | 'shield_boost' | 'extra_draw' | 'fluff_bonus';
  value: number;
  price: number;
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
