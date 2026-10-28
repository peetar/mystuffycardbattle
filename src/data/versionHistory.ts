export interface VersionChangeGroup {
  category: string;
  items: string[];
}

export interface VersionEntry {
  version: string;
  title: string;
  date: string;
  badge?: string;
  summary: string;
  changes: VersionChangeGroup[];
}

export const GAME_VERSION_HISTORY: VersionEntry[] = [
  {
    version: 'v3.7',
    title: 'The Item Armory, Speed Attacks & Cow Stuffy',
    date: 'October 2026',
    badge: 'CURRENT',
    summary: 'Major expansion introducing persistent equipment items, home screen Armory, new Speed combat mechanics with multi-strike rolls, elemental procs (Freeze, Fire, Shock, Stun), and the new Cow playable stuffy with Milk Fortitude and Bovine Stampede.',
    changes: [
      {
        category: 'Item Armory & Equipment System',
        items: [
          'Added persistent item inventory and equipment system accessible directly from the Title Screen.',
          '6 dedicated equipment categories: Helmet, Chestplate, Gloves, Sword, Offhand, and Pendant.',
          'Roguelike Campaign end-of-run item drops: earn 3, 5, or 7 items upon conquering campaign acts.',
          'Starter item pack granted on first Armory visit with one-click test item forging.',
        ],
      },
      {
        category: 'New Combat Attributes & Speed Multi-Strikes',
        items: [
          'Speed Mechanic: For every 100 Speed, stuffies land an attack strike; remaining Speed acts as a percentage chance for extra strikes (e.g. 234 Speed = 2 guaranteed hits + 34% chance for 3rd hit).',
          'Speed miss chance: If Speed is under 100, attacks have that percentage chance to land (e.g. 15 Speed = 15% hit chance). Extra speed strikes deal flat 5 chip damage.',
          'Speed is assigned to Offhand items, capped at 500 Speed.',
          'Freeze (Helmet): Attacks have up to 75% chance to freeze foes, reducing enemy Speed by 50% for 2 turns.',
          'Fire / Burn (Chestplate): Attacks have up to 75% chance to ignite foes with fire (damages random ally on card discard until healed).',
          'Shock (Gloves): Attacks have up to 25% chance to shock foes, completely paralyzing the enemy team from playing cards for 1 turn.',
          'Stun / Brain Damage (Sword): Attacks have up to 75% chance to inflict Brain Damage (disabling targets for 3 turns unless healed).',
          'Wild Element (Pendant): Can roll Freeze, Fire, Shock, or Stun.',
        ],
      },
      {
        category: 'New Playable Stuffy: Cow',
        items: [
          'Added Cow, the Bovine Colossus (82 HP, size of Cidney) with custom pixel art, horns, spotted coat, and brass collar bell.',
          'Combo passive "Milk Fortitude & Bovine Stampede": Recovers 5 HP and gains 8 Shield when taking heavy hits (10+ damage); attack cards deal crushing stampede damage (+3 damage) and grant a +15 burst of Speed.',
          'Full 18-card set across F-tier to S-tier (Moo Greeting, Hoof Tap, Horn Poke, Chew the Cud, Moo Stomp, Bell Jingle, Bovine Headbutt, Fresh Milk Bucket, Milk Fortitude, Colossal Stampede, The Great Bovine Colossus, Miracle Milk Fountain, Cataclysmic Herd Stampede).',
          'Complete favorite, neutral, and hated food affinities for camp dining.',
        ],
      },
      {
        category: 'Speed Balancing Across All Stuffies',
        items: [
          'Balanced base speed across all 40+ playable and boss stuffies within a 25 range of 100 (75 to 125 Speed): nimble speedsters at 110-125, balanced fighters at 95-110, heavy chonkers at 75-95.',
          'Added status indicator overlays for Freeze (❄️) and Shock (⚡) on stuffy sprites.',
        ],
      },
    ],
  },
  {
    version: 'v3.6',
    title: 'Campaign Presets, Restored Relay & Version History',
    date: 'October 2026',
    summary: 'Introduced quick-pick synergistic squad presets and custom preset saving in Campaign Mode, restored classic Energy Relay, authoritative unfriend synchronization, and the complete in-game Version History archive.',
    changes: [
      {
        category: 'Campaign Squad Presets',
        items: [
          'Added Campaign Squad Presets system with one-click loading and launch in StuffyDraftModal.',
          'Built-in curated themed presets: Original Classics, Toxin Syndicate, Colossal Tanks, Mystic Elements, and Bleed Hunters.',
          'Custom Preset saving: save your custom 5-stuffy squad and chosen loadouts to persistent local storage.',
          'Quick swap: click any drafted stuffy in the squad tray to remove and swap it.',
        ],
      },
      {
        category: 'Combat Balancing & Card Restorations',
        items: [
          'Restored classic Spot Energy Relay: all friendly stuffies surrender their energy to fuel the selected target with +2 bonus Energy.',
          'Fixed advancement "Relay Surge" to trigger when pooling at least 6 total Energy onto a single ally.',
        ],
      },
      {
        category: 'Social & Multiplayer Fixes',
        items: [
          'Fixed unfriending bug: server and client now authoritatively remove both friend relationships and historic accepted requests to prevent resurrected friends.',
          'Immediate reactive UI updates when removing friends from the Friends Modal.',
        ],
      },
      {
        category: 'Version History Archive',
        items: [
          'Added interactive Version History viewer accessible directly from the Title Screen and Hall of Records.',
          'Full chronological changelog documenting features from v1.0 through v3.6.',
        ],
      },
    ],
  },
  {
    version: 'v3.5',
    title: '100 Events, Stuffydolars & Animated Turn Recap',
    date: 'October 2026',
    badge: 'MAJOR',
    summary: 'Massive campaign expansion with 100 Act-categorized plush events, currency rebranding to Stuffydolars, animated turn action replays with clawing, shooting, and farting, and friendly fire protection.',
    changes: [
      {
        category: '100 Campaign Events & Act Categorization',
        items: [
          'Expanded from 16 to 100 unique plush-themed events in src/data/events.ts.',
          'Categorized events by Act difficulty: Act 1 Nursery & Playroom, Act 2 Kitchen & Hallways, Act 3 Attics & Dark Chasms.',
        ],
      },
      {
        category: 'Economy Rebrand',
        items: [
          'Replaced Gold and 💰 with 💵 Stuffydolars across titles, merchant shops, victory screens, and event consequences.',
        ],
      },
      {
        category: 'Turn Action Animations & Audio',
        items: [
          'Added Turn Recap Action Stage: stuffies move, claw (🐾💥), shoot lasers (🏹⚡), and fart (💨🤢) with dedicated SFX.',
          'Added animated "⭐ YOUR TURN ⭐" banner celebration.',
          'Added instant audio autoplay listeners on initial page interaction.',
        ],
      },
      {
        category: 'Combat & Test Mode Fixes',
        items: [
          'Friendly fire protection: attacks aimed at friendly allies automatically redirect to opposing enemies.',
          'Test Mode victory restart: defeating dummies offers RESTART MATCH 🔄 to reset the exact battle at Turn 1 without entering Campaign Mode.',
        ],
      },
    ],
  },
  {
    version: 'v3.4',
    title: '105 Advancements 7×15 Matrix & 4 New Stuffies',
    date: 'October 2026',
    summary: 'Organized all 105 advancements into a 7×15 matrix with unique custom icons and added 4 new playable stuffies with bleeding stuffing, psychic control, and colossal hibernation.',
    changes: [
      {
        category: 'New Stuffed Animals',
        items: [
          'Spike the Porcupine: Bleeding stuffing DoT spreading poison to neighbors and earthquake crack slip hazard.',
          'Umbreon: Dark psychic mind-control powers and lunar shields.',
          'Pinky Bear: Guardian of the secret candy stash with weakness powers.',
          'Big Bear: Colossal hibernator that sleeps all day, gains shields, and attacks while asleep.',
        ],
      },
      {
        category: 'Advancements Matrix',
        items: [
          'Organized all 105 achievements into an interactive 7×15 grid.',
          'Given each advancement a distinct, non-repeated custom icon with detailed popup descriptions.',
        ],
      },
    ],
  },
  {
    version: 'v3.3',
    title: 'Real Players Registry & No-Cracker Test Mode',
    date: 'October 2026',
    summary: 'Scrubbed all fake placeholder accounts, instituted 1-year active player registry, built authoritative friend requests, and removed Crackers in Test Mode for free combos.',
    changes: [
      {
        category: 'Social System',
        items: [
          'Scrubbed all former mock users (BenTheCreator, GeorgeOcto, AllieSwampQueen, etc.).',
          'Only players active within the last 365 days appear in matchmaking and friend directories.',
          'Added reciprocal mutual friend requests with custom nicknames and private notes.',
        ],
      },
      {
        category: 'Test Mode Sandbox',
        items: [
          'Crackers removed in Test Mode (0 Crackers, all cards playable for free with 🧪 FREE badge).',
          'Free Big Bear awaken in Test Mode without Cracker cost.',
          'Custom 1–9999 HP and Shield sliders applied to all 5 punching dummies.',
          'Squad size strictly capped at 5 stuffies.',
        ],
      },
    ],
  },
  {
    version: 'v3.2',
    title: 'George, Shadow & Hall of Records',
    date: 'October 2026',
    summary: 'Added George the Moody Cephalopod with Emotional Mode Swapping, Shadow the Hedgehog with Inhibitor Rings, and the Hall of Records.',
    changes: [
      {
        category: 'New Stuffies & Mechanics',
        items: [
          'George: Emotional Mode Swapping (Calm vs Angry) altering attack and defense properties.',
          'Shadow: Golden Inhibitor Rings removal infusing +6 Energy for devastating chaos attacks.',
        ],
      },
      {
        category: 'Hall of Records',
        items: [
          'Player stats tracking: Win/Loss record, win rates, favorite stuffy, playtime, and MMR rating.',
        ],
      },
    ],
  },
  {
    version: 'v3.1',
    title: 'Global Online Chat & Concussion Mechanics',
    date: 'October 2026',
    summary: 'Introduced persistent online global chat, head-bump concussion mechanics, and legendary achievement tracking.',
    changes: [
      {
        category: 'Multiplayer & Social',
        items: [
          'Global chat bar with sound pings, real-time message streams, and broadcast filtering.',
          'Concussion mechanics: stuffed animals can suffer head-bumps disabling specific cards until cured.',
        ],
      },
    ],
  },
  {
    version: 'v3.0',
    title: 'Online Multiplayer & Retro Chiptune Engine',
    date: 'October 2026',
    badge: 'MAJOR',
    summary: 'Built full online multiplayer lobbies with room codes, spectator mode, bot automations, Web Audio chiptune music engine, and Spot the Zoo Leopard.',
    changes: [
      {
        category: 'Online Lobbies & Spectator',
        items: [
          'Real-time matchmaking lobbies with 2, 3, or 4 player capacity.',
          'Authoritative room codes, friend challenges, and live spectator stream.',
          'Automated bot turn execution for single-player hotseat and online bot fills.',
        ],
      },
      {
        category: 'Sound Engine & Spot',
        items: [
          'Custom 8-bit/16-bit Web Audio synthesizer engine with scene-specific chiptune tracks.',
          'Spot: Dr. Seuss inspired Zoo Leopard with color dispersion and effect doubling cards.',
        ],
      },
    ],
  },
  {
    version: 'v2.0',
    title: 'Roguelike Multi-Act & 2-Player Draft',
    date: 'October 2026',
    summary: 'Expanded from basic battles into a full multi-Act roguelike campaign with merchant shops, food feeding formulas, relics, and 2-player local hotseat draft with reserve pools.',
    changes: [
      {
        category: 'Multi-Act Campaign & Roguelike Depth',
        items: [
          'Choose 1 to 5 Acts with Short, Standard, or Marathon floor counts.',
          'Merchant shops with card removal, card upgrades, and food inventory.',
          'Loved, neutral, and hated food feeding formulas restoring HP between battles.',
          'Relic synergies granting passive combat bonuses.',
        ],
      },
      {
        category: '2-Player Draft Mode',
        items: [
          'Pick-and-ban draft mode with 3 reserve reinforcement stuffies.',
          'First blood mechanic allowing bench substitutions upon unstuffing.',
        ],
      },
    ],
  },
  {
    version: 'v1.0',
    title: 'The First Stitch',
    date: 'October 2026',
    summary: 'The original release of Ben\'s Stuffy Card Battle featuring 16 unique stuffed animals, Cracker mana, unstuffed revival, and branching map battles.',
    changes: [
      {
        category: 'Core Gameplay',
        items: [
          '16 playable stuffed animals including Alex, Jefe, Finlee, Slugmee, and Fifi.',
          'Deck-building combat with Crackers mana, draw/discard cycles, shields, and poison.',
          'Unstuffed recovery: fainted stuffies revive to 10% HP after battle.',
          'Branching Slay-the-Spire campaign map with monsters, elites, rest sites, and the colossal Amalgam boss.',
          'Signature S-Tier cards including Alex\'s Strokenosis mind-control.',
        ],
      },
    ],
  },
];
