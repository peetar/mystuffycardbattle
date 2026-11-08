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
  // PART 1 (Sectors 1..528)
  {
    id: 'm_jefe',
    type: 'stuffy',
    sectorId: 2,
    chapterNumber: 1,
    name: 'Jefe (The Brave Starter)',
    categoryLabel: 'STARTER HERO • PART 1',
    subtitle: "Ben's Room Carpet Awakening",
    description: "Jefe wakes up alone in Ben's room and embarks outside to save all 32 plush friends.",
    icon: '🧸',
    stuffySpeciesId: 'jefe',
    biomeName: "Ben's House",
  },
  {
    id: 'm_alex',
    type: 'stuffy',
    sectorId: 24,
    chapterNumber: 3,
    name: 'Alex (The Loyal Guardian)',
    categoryLabel: 'PLUSH RESCUE • PART 1',
    subtitle: 'Bedroom Sock Drawer Cache',
    description: 'Found dozing warmly under wool socks. Adds defensive counter-guard cards to the squad deck.',
    icon: '🧦',
    stuffySpeciesId: 'alex',
    biomeName: "Ben's House",
  },
  {
    id: 'm_shade',
    type: 'stuffy',
    sectorId: 96,
    chapterNumber: 6,
    name: 'Shade (The Shadow Stalker)',
    categoryLabel: 'PLUSH RESCUE • PART 1',
    subtitle: 'Garden Patio Planter Box',
    description: 'Caught in thick spider cobwebs. Unlocks agile shadow strikes and poison debuffs.',
    icon: '🌑',
    stuffySpeciesId: 'shadow',
    biomeName: 'The Backyard',
  },
  {
    id: 'm_armory',
    type: 'facility',
    sectorId: 180,
    chapterNumber: 8,
    name: 'The Workshop Shed Armory',
    categoryLabel: 'FACILITY UNLOCK • PART 1',
    subtitle: 'Backyard Tool Shed Facility',
    description: 'Unlocks equipment and armor loadouts! Equip weapons, body armors, and trinkets on all plushies.',
    icon: '🔨',
    facilityKey: 'armory',
    biomeName: 'The Backyard',
  },
  {
    id: 'm_finlee',
    type: 'stuffy',
    sectorId: 180,
    chapterNumber: 8,
    name: 'Finlee (The Splash Tactician)',
    categoryLabel: 'PLUSH RESCUE • PART 1',
    subtitle: 'Workshop Tool Bench Rescue',
    description: 'Cornered by rusty toy scissors. Provides hydro-shields and aquatic bubble support.',
    icon: '🐬',
    stuffySpeciesId: 'finlee',
    biomeName: 'The Backyard',
  },
  {
    id: 'm_slugmee',
    type: 'stuffy',
    sectorId: 270,
    chapterNumber: 11,
    name: 'Slugmee (The Slime Sentry)',
    categoryLabel: 'PLUSH RESCUE • PART 1',
    subtitle: 'Apartment Breezeway Walkway',
    description: 'Protected behind sticky green slime barriers. Slows hostile toys with sticky goo.',
    icon: '🐌',
    stuffySpeciesId: 'slugmee',
    biomeName: 'Apartment Complex',
  },
  {
    id: 'm_spike',
    type: 'stuffy',
    sectorId: 360,
    chapterNumber: 13,
    name: 'Spike (The Quill Striker)',
    categoryLabel: 'PLUSH RESCUE • PART 1',
    subtitle: 'Stepping Stone Pathway',
    description: 'Trapped under prickly rose thorns. Launches piercing quill barrages that inflict Bleeding Stuffing.',
    icon: '🦔',
    stuffySpeciesId: 'spike',
    biomeName: 'Apartment Complex',
  },
  {
    id: 'm_lab',
    type: 'facility',
    sectorId: 360,
    chapterNumber: 13,
    name: "Necak's Astral Fusion Lab",
    categoryLabel: 'FACILITY UNLOCK • PART 1',
    subtitle: 'Star Workshop Telescope Facility',
    description: 'Unlocks card fusion and 10-star plush evolutions! Merge duplicate cards to empower plushie stats.',
    icon: '🔮',
    facilityKey: 'lab',
    biomeName: "Necak's House",
  },
  {
    id: 'm_spot',
    type: 'stuffy',
    sectorId: 440,
    chapterNumber: 15,
    name: 'Spot (The Polka Puppeteer)',
    categoryLabel: 'PLUSH RESCUE • PART 1',
    subtitle: "Necak's Terrace Bench Cache",
    description: 'Tangled in colorful yarn balls. Manipulates team buffs and energy relays.',
    icon: '🐆',
    stuffySpeciesId: 'spot',
    biomeName: "Necak's House",
  },
  {
    id: 'm_cow',
    type: 'stuffy',
    sectorId: 520,
    chapterNumber: 17,
    name: 'Cow (The Gentle Tank)',
    categoryLabel: 'PLUSH RESCUE • PART 1',
    subtitle: "Necak's Barn Sanctuary",
    description: 'Resting in fragrant hay bales. Absorbs colossal damage and heals squad members.',
    icon: '🐮',
    stuffySpeciesId: 'cow',
    biomeName: "Necak's House",
  },

  // PART 2 (Sectors 529..1056)
  {
    id: 'm_fairy_well',
    type: 'facility',
    sectorId: 600,
    chapterNumber: 20,
    name: 'The Starlight Fairy Well',
    categoryLabel: 'FACILITY UNLOCK • PART 2',
    subtitle: 'Backyard Starlight Springs',
    description: 'Sacrifice spare plush cards into the enchanted well to permanently infuse Esper bonuses!',
    icon: '⛲',
    facilityKey: 'fairy_well',
    biomeName: 'The Backyard',
  },
  {
    id: 'm_cidney',
    type: 'stuffy',
    sectorId: 600,
    chapterNumber: 20,
    name: 'Cidney (The Acorn Hoarder)',
    categoryLabel: 'PLUSH RESCUE • PART 2',
    subtitle: 'Apartment High-Rise Balcony',
    description: 'Trapped on an 8th-floor balcony railing. Dumps acorn stockpiles for instant bonus crackers.',
    icon: '🐿️',
    stuffySpeciesId: 'cidney',
    biomeName: 'Apartment Complex',
  },
  {
    id: 'm_chanteira',
    type: 'stuffy',
    sectorId: 680,
    chapterNumber: 22,
    name: 'Chanteira (The Songstress)',
    categoryLabel: 'PLUSH RESCUE • PART 2',
    subtitle: 'Apartment Elevator Shaft Cable',
    description: 'Singing soothing ocean lullabies. Cleanses allied status effects and boosts mana flow.',
    icon: '🎶',
    stuffySpeciesId: 'chanteira',
    biomeName: 'Apartment Complex',
  },
  {
    id: 'm_allie',
    type: 'stuffy',
    sectorId: 740,
    chapterNumber: 24,
    name: 'Allie (The Bayou Terror)',
    categoryLabel: 'PLUSH RESCUE • PART 2',
    subtitle: 'Murky Swamp Shoreline Cache',
    description: 'Razor-sharp felt teeth and murky swamp resilience! Executes the legendary Death Roll.',
    icon: '🐊',
    stuffySpeciesId: 'allie',
    biomeName: 'The Wild Forest',
  },
  {
    id: 'm_sluger',
    type: 'stuffy',
    sectorId: 800,
    chapterNumber: 26,
    name: 'Sluger (The Heavy Batter)',
    categoryLabel: 'PLUSH RESCUE • PART 2',
    subtitle: 'Forest Canyon Creek Shore',
    description: 'Wielding a tiny foam baseball bat! Slugs high-velocity strikes that knock foes unconscious.',
    icon: '⚾',
    stuffySpeciesId: 'sluger',
    biomeName: 'The Wild Forest',
  },
  {
    id: 'm_fifi',
    type: 'stuffy',
    sectorId: 860,
    chapterNumber: 28,
    name: 'Fifi (The Sneaky Fox)',
    categoryLabel: 'PLUSH RESCUE • PART 2',
    subtitle: 'Whispering Pines Tree Hollow',
    description: 'Napping inside a hollow pine branch. Connoisseur of tactical gastrointestinal gas warfare.',
    icon: '🦊',
    stuffySpeciesId: 'fifi',
    biomeName: 'The Wild Forest',
  },
  {
    id: 'm_joann',
    type: 'stuffy',
    sectorId: 920,
    chapterNumber: 30,
    name: 'Joann (The Claw Mischief)',
    categoryLabel: 'PLUSH RESCUE • PART 2',
    subtitle: 'Forest Picnic Table Glade',
    description: 'Looks straight into foes\' eyes and knocks cards off the table! Forces discards and inflicts bleed.',
    icon: '🐱',
    stuffySpeciesId: 'joann',
    biomeName: 'The Wild Forest',
  },
  {
    id: 'm_george',
    type: 'stuffy',
    sectorId: 980,
    chapterNumber: 32,
    name: 'George (The Two-Faced Cephalopod)',
    categoryLabel: 'PLUSH RESCUE • PART 2',
    subtitle: 'Tall Forest Pine Spire Nest',
    description: 'Reversible octopus plush: switches between happy support mode and angry rage damage mode.',
    icon: '🐙',
    stuffySpeciesId: 'george',
    biomeName: 'The Wild Forest',
  },

  // PART 3 (Sectors 1057..1584)
  {
    id: 'm_riolu',
    type: 'stuffy',
    sectorId: 1140,
    chapterNumber: 35,
    name: 'Ralou (The Aura Healer)',
    categoryLabel: 'PLUSH RESCUE • PART 3',
    subtitle: 'Beach Umbrella Encampment',
    description: 'Channels pure aura energy to cleanse debuffs and sustain team health through boss waves.',
    icon: '🥋',
    stuffySpeciesId: 'riolu',
    biomeName: 'The Beach',
  },
  {
    id: 'm_thumper',
    type: 'stuffy',
    sectorId: 1200,
    chapterNumber: 37,
    name: 'Thumper (The Ground Pounder)',
    categoryLabel: 'PLUSH RESCUE • PART 3',
    subtitle: 'Saltwater Rock Tide Pools',
    description: 'Hopping with ground-shaking impacts! Flattens multiple foes at once with shockwaves.',
    icon: '🐰',
    stuffySpeciesId: 'thumper',
    biomeName: 'The Beach',
  },
  {
    id: 'm_toothless',
    type: 'stuffy',
    sectorId: 1260,
    chapterNumber: 39,
    name: 'Lessteeth (The Nightfang Diver)',
    categoryLabel: 'PLUSH RESCUE • PART 3',
    subtitle: 'Bioluminescent Reef Trench',
    description: 'Entangled in glowing kelp reefs. Unleashes sonic plasma blasts and deep-sea dives.',
    icon: '🐲',
    stuffySpeciesId: 'toothless',
    biomeName: 'The Ocean',
  },
  {
    id: 'm_beaker',
    type: 'stuffy',
    sectorId: 1320,
    chapterNumber: 41,
    name: 'Beaker (The Chemist)',
    categoryLabel: 'PLUSH RESCUE • PART 3',
    subtitle: 'Pressurized Abyssal Trench',
    description: 'Conducting deep-sea alchemy! Brews wild potion buffs and unstable explosive flasks.',
    icon: '🧪',
    stuffySpeciesId: 'beaker',
    biomeName: 'The Ocean',
  },
  {
    id: 'm_eevee',
    type: 'stuffy',
    sectorId: 1380,
    chapterNumber: 43,
    name: 'Eavie (The Tech Adaptor)',
    categoryLabel: 'PLUSH RESCUE • PART 3',
    subtitle: 'Oak Avenue Sidewalk Loop',
    description: 'Charges adaptive lasers and high-tech shields suited to any combat encounter.',
    icon: '🦊',
    stuffySpeciesId: 'eevee',
    biomeName: 'Suburb Avenue',
  },
  {
    id: 'm_dear',
    type: 'stuffy',
    sectorId: 1440,
    chapterNumber: 45,
    name: 'Dear (The Swift Sprinter)',
    categoryLabel: 'PLUSH RESCUE • PART 3',
    subtitle: 'Autumn Cul-de-Sac Circle',
    description: 'Darts past clockwork cars with breathtaking speed, guaranteeing team first strikes.',
    icon: '🦌',
    stuffySpeciesId: 'dear',
    biomeName: 'Suburb Avenue',
  },
  {
    id: 'm_cole',
    type: 'stuffy',
    sectorId: 1500,
    chapterNumber: 47,
    name: 'Cole (The Shell Spinner)',
    categoryLabel: 'PLUSH RESCUE • PART 3',
    subtitle: 'Towering Metal Jungle Gym',
    description: 'Spins his hardened shell in a rapid cyclone, blocking lethal attacks for the front line.',
    icon: '🐢',
    stuffySpeciesId: 'cole',
    biomeName: 'Adventure Playground',
  },

  // PART 4 (Sectors 1585..2112)
  {
    id: 'm_henry',
    type: 'stuffy',
    sectorId: 1660,
    chapterNumber: 50,
    name: 'Henry (The Wind Fortress)',
    categoryLabel: 'PLUSH RESCUE • PART 4',
    subtitle: 'Mega Green Spiral Slide',
    description: 'Turtles up against howling wind gusts! Generates team wind shields that negate projectiles.',
    icon: '🛡️',
    stuffySpeciesId: 'henry',
    biomeName: 'Adventure Playground',
  },
  {
    id: 'm_pinky',
    type: 'stuffy',
    sectorId: 1740,
    chapterNumber: 52,
    name: 'Pinky Bear (The Sweet Enchanter)',
    categoryLabel: 'PLUSH RESCUE • PART 4',
    subtitle: 'The Moonlit Carnival Grand Tent',
    description: 'Guards spun-sugar cotton candy booths! Enchants foes with sweet sleep and health candy.',
    icon: '💖',
    stuffySpeciesId: 'pinky_bear',
    biomeName: 'The Moonlit Carnival',
  },
  {
    id: 'm_bigbear',
    type: 'stuffy',
    sectorId: 1820,
    chapterNumber: 54,
    name: 'Big Bear (The Slumbering Titan)',
    categoryLabel: 'PLUSH RESCUE • PART 4',
    subtitle: 'Sky Gardens & Floating Isles Peak',
    description: 'High above the clouds on a floating isle! Awakens from centuries of slumber to swipe titan blows.',
    icon: '🐻',
    stuffySpeciesId: 'big_bear',
    biomeName: 'Sky Gardens & Floating Isles',
  },
  {
    id: 'm_umbreon',
    type: 'stuffy',
    sectorId: 1920,
    chapterNumber: 56,
    name: 'Umbratail (The Lunar Shadow)',
    categoryLabel: 'PLUSH RESCUE • PART 4',
    subtitle: 'Magma Ridge Obsidian Forge',
    description: 'Channeling pure moonlight rings amidst dragonfire! Unites dark cosmic forces.',
    icon: '🌙',
    stuffySpeciesId: 'umbreon',
    biomeName: 'Magma Ridge & Ember Crags',
  },
  {
    id: 'm_tyrant',
    type: 'stuffy',
    sectorId: 2040,
    chapterNumber: 58,
    name: 'Tyrant (The Prehistoric Stomper)',
    categoryLabel: 'NEW HERO • PART 4',
    subtitle: 'Prehistoric Caldera Crater',
    description: 'A massive dinosaur plush who likes to thump and jump! Stomps seismic tremors and leaps with huge shields.',
    icon: '🦖',
    stuffySpeciesId: 'tyrant',
    biomeName: 'Magma Ridge & Ember Crags',
  },

  // PART 5 (Sectors 2113..2640) - THE SECOND COMING
  {
    id: 'm_dolphy',
    type: 'stuffy',
    sectorId: 2190,
    chapterNumber: 61,
    name: 'Dolphy (The Ocean Behemoth)',
    categoryLabel: 'PLUSH RESCUE • PART 5',
    subtitle: 'Coral Atoll Sanctuary',
    description: 'A colossal dolphin who crushes enemies under immense water pressure and tidal waves.',
    icon: '🐬',
    stuffySpeciesId: 'dolphy',
    biomeName: 'The Ocean',
  },
  {
    id: 'm_dolpher',
    type: 'stuffy',
    sectorId: 2270,
    chapterNumber: 63,
    name: 'Dolpher (The Grey Matriarch)',
    categoryLabel: 'NEW HERO • PART 5',
    subtitle: 'Azure Lagoon Nursery',
    description: 'The older female grey dolphin matriarch who protects the pod with soothing tidal waves and barrier shields.',
    icon: '🌊',
    stuffySpeciesId: 'dolpher',
    biomeName: 'The Ocean',
  },
  {
    id: 'm_dolphim',
    type: 'stuffy',
    sectorId: 2350,
    chapterNumber: 65,
    name: 'Dolphim (The High-IQ Fin)',
    categoryLabel: 'NEW HERO • PART 5',
    subtitle: 'Sonar Reef Calculation Chamber',
    description: 'Smaller, lighter grey dolphin who is slightly smarter! Uses sonar algorithms to calculate enemy trajectories.',
    icon: '🧠',
    stuffySpeciesId: 'dolphim',
    biomeName: 'The Ocean',
  },
  {
    id: 'm_grumpy_rhino',
    type: 'stuffy',
    sectorId: 2430,
    chapterNumber: 67,
    name: 'Grumpy Rhino (The Bad-Tempered Tank)',
    categoryLabel: 'NEW HERO • PART 5',
    subtitle: 'Craggy Ridge Basalt Spires',
    description: 'A sturdy grey rhino who is perpetually grumpy! Scowls, stomps, and reflects damage back with his heavy horn.',
    icon: '🦏',
    stuffySpeciesId: 'grumpy_rhino',
    biomeName: 'Magma Ridge & Ember Crags',
  },
  {
    id: 'm_farty_lama',
    type: 'stuffy',
    sectorId: 2510,
    chapterNumber: 69,
    name: 'Farty Lama (The Fortnite Pinata)',
    categoryLabel: 'NEW HERO • PART 5',
    subtitle: 'Pinata Valley Supply Drop',
    description: 'Iconic Fortnite pinata llama who is as farty as Fifi! Explodes with toxic party gas, poison, and bonus Crackers.',
    icon: '🦙',
    stuffySpeciesId: 'farty_lama',
    biomeName: 'The Ancient Toy Factory',
  },
  {
    id: 'm_unicorn',
    type: 'stuffy',
    sectorId: 2590,
    chapterNumber: 71,
    name: 'Unicorn (The Prismatic Wonder)',
    categoryLabel: 'NEW HERO • PART 5',
    subtitle: 'Prism Peak Starlight Spire',
    description: 'All white plush with pink feet, purple hair, and a rainbow horn! Radiates cleansing starlight and heals the party.',
    icon: '🦄',
    stuffySpeciesId: 'unicorn',
    biomeName: 'The Crystal Caverns',
  },
  {
    id: 'm_citadel',
    type: 'finale',
    sectorId: 2640,
    chapterNumber: 76,
    name: "The Stitchmaster's Citadel",
    categoryLabel: 'GRAND FINALE • PART 5',
    subtitle: 'The Astral Throne of Lost Plushies',
    description: 'The monumental final showdown against the Stitchmaster to liberate all 33 plushies across all 5 parts!',
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
                  v4.4 TOWNTIME PREPARATION
                </span>
                <span className="font-pixel text-[9px] bg-yellow-950 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/40">
                  5 PARTS • 528 SECTORS EACH (2,640 TOTAL)
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
                {unlockedStuffies.length} / 33 Plushies Rescued
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
