'use client';

import React, { useState } from 'react';
import { useStoryStore } from '@/store/storyStore';
import { STUFFY_MAP } from '@/data/stuffies';
import { sound } from '@/utils/audio';

export interface TimelineMilestone {
  id: string;
  type: 'stuffy' | 'facility' | 'finale';
  sectorId: number;
  chapterNumber: number; // 1 to 73
  name: string;
  categoryLabel: string;
  subtitle: string;
  description: string;
  icon: string;
  stuffySpeciesId?: string;
  facilityKey?: 'armory' | 'fairy_well' | 'lab';
  biomeName: string;
}

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    id: 'm_jefe',
    type: 'stuffy',
    sectorId: 2,
    chapterNumber: 1,
    name: 'Jefe (The Brave Starter)',
    categoryLabel: 'STARTER HERO',
    subtitle: "Ben's Room Carpet Awakening",
    description: "Jefe wakes up alone in Ben's room and embarks outside to save all 26 plush friends.",
    icon: '🧸',
    stuffySpeciesId: 'jefe',
    biomeName: "Ben's House",
  },
  {
    id: 'm_alex',
    type: 'stuffy',
    sectorId: 7,
    chapterNumber: 3,
    name: 'Alex (The Loyal Guardian)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Bedroom Sock Drawer Cache',
    description: 'Found dozing warmly under wool socks. Adds defensive counter-guard cards to the squad deck.',
    icon: '🧦',
    stuffySpeciesId: 'alex',
    biomeName: "Ben's House",
  },
  {
    id: 'm_shade',
    type: 'stuffy',
    sectorId: 16,
    chapterNumber: 6,
    name: 'Shade (The Shadow Stalker)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Garden Patio Planter Box',
    description: 'Caught in thick spider cobwebs. Unlocks agile shadow strikes and poison debuffs.',
    icon: '🌑',
    stuffySpeciesId: 'shadow',
    biomeName: 'The Backyard',
  },
  {
    id: 'm_armory',
    type: 'facility',
    sectorId: 18,
    chapterNumber: 8,
    name: 'The Workshop Shed Armory',
    categoryLabel: 'FACILITY UNLOCK',
    subtitle: 'Backyard Tool Shed Facility',
    description: 'Unlocks equipment and armor loadouts! Equip weapons, body armors, and trinkets on all plushies.',
    icon: '🔨',
    facilityKey: 'armory',
    biomeName: 'The Backyard',
  },
  {
    id: 'm_finlee',
    type: 'stuffy',
    sectorId: 18,
    chapterNumber: 8,
    name: 'Finlee (The Splash Tactician)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Workshop Tool Bench Rescue',
    description: 'Cornered by rusty toy scissors. Provides hydro-shields and aquatic bubble support.',
    icon: '🐬',
    stuffySpeciesId: 'finlee',
    biomeName: 'The Backyard',
  },
  {
    id: 'm_slugmee',
    type: 'stuffy',
    sectorId: 65,
    chapterNumber: 12,
    name: 'Slugmee (The Slime Sentry)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Apartment Breezeway Walkway',
    description: 'Protected behind sticky green slime barriers. Slows hostile toys with sticky goo.',
    icon: '🐌',
    stuffySpeciesId: 'slugmee',
    biomeName: 'Apartment Complex',
  },
  {
    id: 'm_spike',
    type: 'stuffy',
    sectorId: 72,
    chapterNumber: 13,
    name: 'Spike (The Thorn Defender)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Apartment Stepping Stones Terrace',
    description: 'Curled in a tight spiky ball. Reflects incoming damage and punishes aggressive foes.',
    icon: '🦔',
    stuffySpeciesId: 'spike',
    biomeName: 'Apartment Complex',
  },
  {
    id: 'm_lab',
    type: 'facility',
    sectorId: 50,
    chapterNumber: 14,
    name: "Necak's Star Lab (1★ to 10★)",
    categoryLabel: 'FACILITY UNLOCK',
    subtitle: 'Astral Fusion Workbench',
    description: 'Unlocks 10-Star Card Evolution! Merge duplicate cards to supercharge HP and Speed.',
    icon: '🔮',
    facilityKey: 'lab',
    biomeName: "Necak's House",
  },
  {
    id: 'm_spot',
    type: 'stuffy',
    sectorId: 48,
    chapterNumber: 16,
    name: 'Spot (The Energy Battery)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: "Necak's Porch Flagstones",
    description: 'Digging up tracks on the porch. Fuels teammates with massive cracker and energy relays.',
    icon: '🐶',
    stuffySpeciesId: 'spot',
    biomeName: "Necak's House",
  },
  {
    id: 'm_cow',
    type: 'stuffy',
    sectorId: 56,
    chapterNumber: 17,
    name: 'Cow (The Heavyweight Bovine)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: "Necak's Red Barn Sanctuary",
    description: 'Cornered by the Hay Baler Titan. Hits hard with earthquake stomps and milk recoveries.',
    icon: '🐄',
    stuffySpeciesId: 'cow',
    biomeName: "Necak's House",
  },
  {
    id: 'm_fairy_well',
    type: 'facility',
    sectorId: 38,
    chapterNumber: 18,
    name: 'The Fairy Well',
    categoryLabel: 'FACILITY UNLOCK',
    subtitle: 'Enchanted Birdbath Spring',
    description: 'Sacrifice duplicate cards to permanently empower your Espers with extra stats and summon strength!',
    icon: '⛲',
    facilityKey: 'fairy_well',
    biomeName: 'The Backyard',
  },
  {
    id: 'm_cidney',
    type: 'stuffy',
    sectorId: 80,
    chapterNumber: 21,
    name: 'Cidney (The Acorn Sniper)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'High-Rise Windy Balcony',
    description: 'Perched on high railings sniping with acorns. Delivers critical strikes from long range.',
    icon: '🐿️',
    stuffySpeciesId: 'cidney',
    biomeName: 'Apartment Complex',
  },
  {
    id: 'm_chanteira',
    type: 'stuffy',
    sectorId: 88,
    chapterNumber: 25,
    name: 'Chanteira (The Songstress)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Elevator Shaft Air Vent',
    description: 'Singing lullabies that disorient hostile wind-up toys and buff allies.',
    icon: '🕊️',
    stuffySpeciesId: 'chanteira',
    biomeName: 'Apartment Complex',
  },
  {
    id: 'm_dolphy',
    type: 'stuffy',
    sectorId: 195,
    chapterNumber: 31,
    name: 'Dolphy (The Coral Sovereign)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Sunken Citadel of Upgel Didav',
    description: 'Deep in the sunken coral citadel! Channels high-tide tidal surges and aquatic cures.',
    icon: '🐬',
    stuffySpeciesId: 'dolphy',
    biomeName: 'The Ocean',
  },
  {
    id: 'm_allie',
    type: 'stuffy',
    sectorId: 148,
    chapterNumber: 33,
    name: 'Allie (The Driftwood Gator)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Golden Sandy Shoreline',
    description: 'Marooned in tidal driftwood. Executes snap-jaws and armored scales defense.',
    icon: '🐊',
    stuffySpeciesId: 'allie',
    biomeName: 'The Beach',
  },
  {
    id: 'm_sluger',
    type: 'stuffy',
    sectorId: 112,
    chapterNumber: 37,
    name: 'Sluger (The Boxing Champ)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Dense Rocky Canyon Creek',
    description: 'Punching boulders for training. Delivers heavyweight combos that stun enemy lines.',
    icon: '🥊',
    stuffySpeciesId: 'sluger',
    biomeName: 'The Wild Forest',
  },
  {
    id: 'm_fifi',
    type: 'stuffy',
    sectorId: 125,
    chapterNumber: 40,
    name: 'Fifi (The Fragrant Trickster)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Sunlit Treetop Canopy',
    description: 'Releases fragrant perfume and smoke clouds that blind foes and cloak friendly plushies.',
    icon: '🦨',
    stuffySpeciesId: 'fifi',
    biomeName: 'The Wild Forest',
  },
  {
    id: 'm_joann',
    type: 'stuffy',
    sectorId: 122,
    chapterNumber: 42,
    name: 'Joann (The Master Planner)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Forest Picnic Table Hideout',
    description: 'Strategizing at the wooden picnic table! Disrupts enemy battle plans and rearranges card decks.',
    icon: '🎀',
    stuffySpeciesId: 'joann',
    biomeName: 'The Wild Forest',
  },
  {
    id: 'm_george',
    type: 'stuffy',
    sectorId: 130,
    chapterNumber: 45,
    name: 'George (The Mood Shapeshifter)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Evergreen Pine Spire Watch',
    description: 'Watching the horizon in multi-mood form! Shifts between fiery fury, tranquil water, and stone focus.',
    icon: '🐵',
    stuffySpeciesId: 'george',
    biomeName: 'The Wild Forest',
  },
  {
    id: 'm_riolu',
    type: 'stuffy',
    sectorId: 155,
    chapterNumber: 47,
    name: 'Ralou (The Aura Healer)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Beach Umbrella Encampment',
    description: 'Channels pure aura energy to cleanse debuffs and sustain team health through boss waves.',
    icon: '🥋',
    stuffySpeciesId: 'riolu',
    biomeName: 'The Beach',
  },
  {
    id: 'm_thumper',
    type: 'stuffy',
    sectorId: 162,
    chapterNumber: 49,
    name: 'Thumper (The Ground Pounder)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Saltwater Rock Tide Pools',
    description: 'Hopping with ground-shaking impacts! Flattens multiple foes at once with shockwaves.',
    icon: '🐰',
    stuffySpeciesId: 'thumper',
    biomeName: 'The Beach',
  },
  {
    id: 'm_toothless',
    type: 'stuffy',
    sectorId: 185,
    chapterNumber: 51,
    name: 'Lessteeth (The Nightfang Diver)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Bioluminescent Reef Trench',
    description: 'Entangled in glowing kelp reefs. Unleashes sonic plasma blasts and deep-sea dives.',
    icon: '🐲',
    stuffySpeciesId: 'toothless',
    biomeName: 'The Ocean',
  },
  {
    id: 'm_beaker',
    type: 'stuffy',
    sectorId: 205,
    chapterNumber: 53,
    name: 'Beaker (The Chemist)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Pressurized Abyssal Trench',
    description: 'Conducting deep-sea alchemy! Brews wild potion buffs and unstable explosive flasks.',
    icon: '🧪',
    stuffySpeciesId: 'beaker',
    biomeName: 'The Ocean',
  },
  {
    id: 'm_eevee',
    type: 'stuffy',
    sectorId: 220,
    chapterNumber: 55,
    name: 'Eavie (The Tech Adaptor)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Oak Avenue Sidewalk Loop',
    description: 'Charges adaptive lasers and high-tech shields suited to any combat encounter.',
    icon: '🦊',
    stuffySpeciesId: 'eevee',
    biomeName: 'Suburb Avenue',
  },
  {
    id: 'm_dear',
    type: 'stuffy',
    sectorId: 235,
    chapterNumber: 57,
    name: 'Dear (The Swift Sprinter)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Autumn Cul-de-Sac Circle',
    description: 'Darts past clockwork cars with breathtaking speed, guaranteeing team first strikes.',
    icon: '🦌',
    stuffySpeciesId: 'dear',
    biomeName: 'Suburb Avenue',
  },
  {
    id: 'm_cole',
    type: 'stuffy',
    sectorId: 250,
    chapterNumber: 61,
    name: 'Cole (The Shell Spinner)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Towering Metal Jungle Gym',
    description: 'Spins his hardened shell in a rapid cyclone, blocking lethal attacks for the front line.',
    icon: '🐢',
    stuffySpeciesId: 'cole',
    biomeName: 'Adventure Playground',
  },
  {
    id: 'm_henry',
    type: 'stuffy',
    sectorId: 262,
    chapterNumber: 63,
    name: 'Henry (The Wind Fortress)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Mega Green Spiral Slide',
    description: 'Turtles up against howling wind gusts! Generates team wind shields that negate projectiles.',
    icon: '🛡️',
    stuffySpeciesId: 'henry',
    biomeName: 'Adventure Playground',
  },
  {
    id: 'm_pinky',
    type: 'stuffy',
    sectorId: 300,
    chapterNumber: 67,
    name: 'Pinky Bear (The Sweet Enchanter)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'The Moonlit Carnival Grand Tent',
    description: 'Guards spun-sugar cotton candy booths! Enchants foes with sweet sleep and health candy.',
    icon: '💖',
    stuffySpeciesId: 'pinky_bear',
    biomeName: 'The Moonlit Carnival',
  },
  {
    id: 'm_bigbear',
    type: 'stuffy',
    sectorId: 440,
    chapterNumber: 69,
    name: 'Big Bear (The Slumbering Titan)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Sky Gardens & Floating Isles Peak',
    description: 'High above the clouds on a floating isle! Awakens from centuries of slumber to swipe titan blows.',
    icon: '🐻',
    stuffySpeciesId: 'big_bear',
    biomeName: 'Sky Gardens & Floating Isles',
  },
  {
    id: 'm_umbreon',
    type: 'stuffy',
    sectorId: 480,
    chapterNumber: 71,
    name: 'Umbratail (The Lunar Shadow)',
    categoryLabel: 'PLUSH RESCUE',
    subtitle: 'Magma Ridge Obsidian Forge',
    description: 'Channelling pure moonlight rings amidst dragonfire! The 26th plushie unites the grand squad.',
    icon: '🌙',
    stuffySpeciesId: 'umbreon',
    biomeName: 'Magma Ridge & Ember Crags',
  },
  {
    id: 'm_citadel',
    type: 'finale',
    sectorId: 540,
    chapterNumber: 73,
    name: "The Stitchmaster's Citadel",
    categoryLabel: 'GRAND FINALE',
    subtitle: 'Cosmic Throne of Stitched Threads',
    description: 'The monumental final confrontation! Defeat the Stitchmaster across 4 acts to save all plushies forever.',
    icon: '👑',
    biomeName: 'The Astral Citadel',
  },
];

interface StoryTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToStory?: () => void;
}

export const StoryTimelineModal: React.FC<StoryTimelineModalProps> = ({
  isOpen,
  onClose,
  onNavigateToStory,
}) => {
  const {
    unlockedStuffies,
    armoryUnlocked,
    labUnlocked,
    fairyWellUnlocked,
    clearedSectorIds,
  } = useStoryStore();
  const [filter, setFilter] = useState<'all' | 'stuffies' | 'facilities'>('all');

  if (!isOpen) return null;

  const isMilestoneUnlocked = (m: TimelineMilestone): boolean => {
    if (m.type === 'stuffy' && m.stuffySpeciesId) {
      return unlockedStuffies.includes(m.stuffySpeciesId);
    }
    if (m.type === 'facility' && m.facilityKey) {
      if (m.facilityKey === 'armory') return Boolean(armoryUnlocked);
      if (m.facilityKey === 'lab') return Boolean(labUnlocked);
      if (m.facilityKey === 'fairy_well') return Boolean(fairyWellUnlocked);
      return false;
    }
    if (m.type === 'finale') {
      return unlockedStuffies.length >= 26 || Boolean(clearedSectorIds?.includes(540));
    }
    return false;
  };

  const filteredMilestones = TIMELINE_MILESTONES.filter((m) => {
    if (filter === 'stuffies') return m.type === 'stuffy';
    if (filter === 'facilities') return m.type === 'facility';
    return true;
  });

  const unlockedCount = TIMELINE_MILESTONES.filter(isMilestoneUnlocked).length;
  const progressPercent = Math.round((unlockedCount / TIMELINE_MILESTONES.length) * 100);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-950 border-4 border-amber-500/80 rounded-3xl p-4 sm:p-6 flex flex-col max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden cursor-default"
      >
        {/* Top Header Hub */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-amber-500/40 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl animate-bounce">📜</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[9px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                  v4.2 STORY ROADMAP
                </span>
                <span className="font-pixel text-[9px] bg-yellow-950 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/40">
                  540 SECTORS • 16 BIOMES
                </span>
              </div>
              <h2 className="font-pixel text-lg sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-amber-400 font-extrabold tracking-wide mt-1">
                ADVENTURE UNLOCK TIMELINE
              </h2>
            </div>
          </div>

          {/* Progress overview */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="font-pixel text-xs text-yellow-300 font-bold">
                {unlockedCount} / {TIMELINE_MILESTONES.length} Unlocked ({progressPercent}%)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {unlockedStuffies.length} / 26 Plushies Rescued
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClickSound();
                onClose();
              }}
              className="font-pixel text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-slate-600 transition-all cursor-pointer shadow"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => {
              sound.playClickSound();
              setFilter('all');
            }}
            className={`font-pixel text-[10px] px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'
            }`}
          >
            🌟 ALL MILESTONES ({TIMELINE_MILESTONES.length})
          </button>
          <button
            onClick={() => {
              sound.playClickSound();
              setFilter('stuffies');
            }}
            className={`font-pixel text-[10px] px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'stuffies'
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'
            }`}
          >
            🧸 HERO PLUSHIES (26)
          </button>
          <button
            onClick={() => {
              sound.playClickSound();
              setFilter('facilities');
            }}
            className={`font-pixel text-[10px] px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filter === 'facilities'
                ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold shadow'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white hover:border-slate-500'
            }`}
          >
            🏛️ FACILITIES &amp; FEATURES (3)
          </button>
        </div>

        {/* Scrollable Timeline List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {filteredMilestones.map((m, idx) => {
            const unlocked = isMilestoneUnlocked(m);
            const sp = m.stuffySpeciesId ? STUFFY_MAP.get(m.stuffySpeciesId) : null;

            return (
              <div
                key={m.id}
                className={`relative flex items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  unlocked
                    ? 'bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-yellow-950/40 border-amber-400/80 shadow-lg shadow-amber-950/40'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-80'
                }`}
              >
                {/* Sector / Chapter Badge */}
                <div className="flex flex-col items-center justify-center min-w-[55px] sm:min-w-[70px] bg-slate-950/90 border border-slate-800 p-2 rounded-xl">
                  <span className="font-pixel text-[8px] sm:text-[9px] text-amber-400">
                    CH. {m.chapterNumber}
                  </span>
                  <span className="font-pixel text-xs sm:text-sm text-yellow-300 font-bold mt-0.5">
                    SEC {m.sectorId}
                  </span>
                </div>

                {/* Main Icon */}
                <div
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0 ${
                    unlocked
                      ? 'bg-amber-900/60 border-amber-400 text-amber-200'
                      : 'bg-slate-950 border-slate-700 text-slate-500'
                  }`}
                >
                  {m.icon}
                </div>

                {/* Milestone Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`font-pixel text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        m.type === 'facility'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                          : m.type === 'finale'
                          ? 'bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {m.categoryLabel}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">
                      📍 {m.biomeName}
                    </span>
                  </div>

                  <h3 className="font-pixel text-xs sm:text-sm text-yellow-200 font-bold truncate">
                    {m.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-amber-300/80 font-mono mt-0.5">
                    {m.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-300 font-sans leading-snug mt-1">
                    {m.description}
                  </p>
                </div>

                {/* Unlocked / Locked Status Badge */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  {unlocked ? (
                    <span className="font-pixel text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/60 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 shadow">
                      <span>✓</span>
                      <span>UNLOCKED</span>
                    </span>
                  ) : (
                    <span className="font-pixel text-[9px] bg-slate-950 text-slate-500 border border-slate-800 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                      <span>🔒</span>
                      <span>UPCOMING</span>
                    </span>
                  )}

                  {onNavigateToStory && (
                    <button
                      onClick={() => {
                        sound.playClickSound();
                        onNavigateToStory();
                      }}
                      className="font-pixel text-[8px] text-amber-400 hover:text-white bg-slate-950/80 hover:bg-amber-950 px-2 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer mt-1"
                    >
                      GO TO MAP ➔
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Hub */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="font-mono text-[10px] text-slate-400">
            💡 Tip: Rescuing plushies and unlocking the Armory empowers your squads for high-level expeditions!
          </span>
          <button
            onClick={() => {
              sound.playClickSound();
              onClose();
            }}
            className="font-pixel text-xs bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl border border-yellow-200 shadow cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            CLOSE TIMELINE
          </button>
        </div>
      </div>
    </div>
  );
};
