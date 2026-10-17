import { LoadoutPackage } from '@/types/game';
import { ALL_STUFFIES } from './stuffies';

/**
 * Tier scores for balance verification:
 * F = 1, D = 2, C = 3, B = 4, A = 5, S = 6.
 * Target sum for 10 cards = 40 (Average = 4.0 = B-tier).
 */

export const STUFFY_LOADOUTS: Record<string, LoadoutPackage[]> = {};

ALL_STUFFIES.forEach((stuffy) => {
  const s = stuffy.id;

  // Package 1: Aggressive / High Impact Focus
  // Composition: 1 S-tier (6), 3 A-tier (15), 2 B-tier (8), 2 C-tier (6), 1 D-tier (2), 1 F-tier (1) -> Sum = 38-40 (avg ~3.9 - 4.0 = B)
  const option1: LoadoutPackage = {
    id: `${s}_pkg_1`,
    stuffyId: s,
    name: 'Offensive Surge',
    theme: 'Aggressive burst damage and high-tempo strikes.',
    averageTier: 'B',
    cardIds: [
      `${s}_s1`,
      `${s}_a1`,
      `${s}_a2`,
      `${s}_a3`,
      `${s}_b1`,
      `${s}_b3`,
      `${s}_c1`,
      `${s}_c3`,
      `${s}_d1`,
      `${s}_f1`,
    ],
  };

  // Package 2: Defensive / Fluff Fortification Focus
  // Composition: 1 S-tier (6), 2 A-tier (10), 4 B-tier (16), 1 C-tier (3), 1 D-tier (2), 1 F-tier (1) -> Sum = 38-40 (avg ~4.0 = B)
  const option2: LoadoutPackage = {
    id: `${s}_pkg_2`,
    stuffyId: s,
    name: 'Fluff Bulwark',
    theme: 'Shields, survivability, healing, and control.',
    averageTier: 'B',
    cardIds: [
      `${s}_s2`,
      `${s}_a2`,
      `${s}_a3`,
      `${s}_b2`,
      `${s}_b1`,
      `${s}_b3`,
      `${s}_c2`,
      `${s}_c3`,
      `${s}_d2`,
      `${s}_f2`,
    ],
  };

  // Package 3: Tactical / Archetype Specialist
  // Composition: 1 S-tier (6), 2 A-tier (10), 3 B-tier (12), 3 C-tier (9), 1 D-tier (2), 0 F -> Sum = 39 (avg 3.9 = B)
  const option3: LoadoutPackage = {
    id: `${s}_pkg_3`,
    stuffyId: s,
    name: 'Tactical Synergy',
    theme: 'Balanced rotation of special traits, utility, and signature maneuvers.',
    averageTier: 'B',
    cardIds: [
      `${s}_s3`,
      `${s}_a1`,
      `${s}_a2`,
      `${s}_b1`,
      `${s}_b2`,
      `${s}_b3`,
      `${s}_c1`,
      `${s}_c2`,
      `${s}_c3`,
      `${s}_d3`,
    ],
  };

  STUFFY_LOADOUTS[s] = [option1, option2, option3];
});

export function getLoadoutsForStuffy(stuffyId: string): LoadoutPackage[] {
  return STUFFY_LOADOUTS[stuffyId] || [];
}
