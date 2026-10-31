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
    version: 'v3.9',
    title: '10-Star Evolution, Act Reward Packs & Astral Star Chamber',
    date: 'October 2026',
    badge: 'CURRENT',
    summary: 'Evolution system up to 10 stars, end-of-act card packs across 5 rarities, Stuffy Card Binder & Astral Star Fusion Chamber, and /.stuffy admin command.',
    changes: [
      {
        category: '10-Star Plush Evolution System',
        items: [
          'All stuffies in Campaign and Story mode start at 5 stars.',
          'Evolve stuffies up to 10 stars (+10% Max HP and +4 Speed per star above 5).',
          'Only applies to Campaign and Story modes.',
        ],
      },
      {
        category: 'End-of-Act Reward Packs',
        items: [
          'Defeating an Act boss awards a Stuffy Pack (Common, Uncommon, Rare, Epic, Legendary).',
          'Packs pull 0 to 5 Stuffy Cards with higher rarity yielding higher quantities.',
          'Every card pulled is a plush Stuffy Card for your collection.',
        ],
      },
      {
        category: 'Astral Star Fusion Chamber & Card Binder',
        items: [
          'Accessible from Campaign Map and Item Armory.',
          'Fusing 2 matching identical stuffy cards increases star rating by +1 (capped at 10★).',
          'Stuffy Card Binder tracks all collected cards across plush species.',
        ],
      },
      {
        category: 'Admin Commands',
        items: [
          'New command: /.stuffy #level stuffy_name (spawns 1-10 star stuffies; strictly rejects non-existent names and bosses).',
          'New command: /.pack [rarity] to grant Act reward packs.',
        ],
      },
    ],
  },
  {
    version: 'v3.8',
    title: 'Astral Espers, 600 Item Matrix & Tester Admin Suite',
    date: 'October 2026',
    summary: 'Mythical campaign Espers, dedicated Astral Chambers, 600 items across 5 tiers with spawner, forward progression enforcement, and tester Admin Console.',
    changes: [
      {
        category: 'Campaign Astral Espers',
        items: [
          '20 mythical Espers that bond with stuffies for campaign runs.',
          'Dedicated Esper Chamber procedural map rooms.',
          'Merchant Shop Esper hiring with Stuffydolars.',
          'Espers boost Speed, Max HP, starting Shield, and elemental procs.',
        ],
      },
      {
        category: '600-Item Matrix & 5-Column Spawner',
        items: [
          '100 items per type (20 templates x 5 tiers = 600 items total).',
          'Admin Item Spawner updated to a 5-column layout.',
        ],
      },
      {
        category: 'Tester Admin Suite',
        items: [
          'Admin commands: /.gold, /.crackers, /.shop, /.esper, /.floor, /.reward.',
          'Forward-only progression enforced for /.act and /.floor.',
        ],
      },
    ],
  },
  {
    version: 'v3.7',
    title: 'The Item Armory, Speed Attacks & Cow Stuffy',
    date: 'October 2026',
    summary: 'Persistent equipment items, home screen Armory, Speed multi-strike combat mechanics, elemental procs, and the Cow playable stuffy.',
    changes: [
      {
        category: 'Item Armory & Combat Attributes',
        items: [
          '6 equipment slots: Helmet, Chestplate, Gloves, Sword, Offhand, Pendant.',
          'Speed Attacks: Extra strikes for every 100 Speed with percentage bonus rolls.',
          'Elemental procs: Freeze, Burn, Shock, and Stun.',
        ],
      },
      {
        category: 'New Playable Stuffy: Cow',
        items: [
          'Added Cow (82 HP) with Milk Fortitude and Bovine Stampede passive.',
        ],
      },
    ],
  },
  {
    version: 'v3.6',
    title: 'Campaign Presets & Authoritative Sync',
    date: 'October 2026',
    summary: 'Synergistic squad presets and custom preset saving in Campaign Mode, restored Energy Relay, and authoritative unfriend synchronization.',
    changes: [
      {
        category: 'Campaign Presets',
        items: [
          'Pre-built squad presets and custom preset saving in Campaign Mode.',
          'Incomplete presets (1-4 stuffies) support.',
        ],
      },
      {
        category: 'Combat & Social',
        items: [
          'Restored classic Energy Relay mechanism.',
          'Authoritative server unfriend synchronization.',
        ],
      },
    ],
  },
  {
    version: 'v3.5',
    title: '100 Events, Stuffydolars & Turn Recap',
    date: 'October 2026',
    summary: '100 procedural campaign events, Stuffydolars currency, animated turn action replays, and friendly fire protection.',
    changes: [
      {
        category: 'Campaign Events & Economy',
        items: [
          '100 Act-categorized plush events with branching decisions.',
          'Rebranded currency to Stuffydolars.',
        ],
      },
      {
        category: 'Combat Enhancements',
        items: [
          'Animated turn action replays with claws, lasers, and projectile FX.',
          'Protected allies from harmful friendly fire.',
        ],
      },
    ],
  },
  {
    version: 'v3.4',
    title: '105 Advancements 7×15 Matrix & 4 Stuffies',
    date: 'October 2026',
    summary: 'Organized 105 achievements into a 7×15 matrix with custom icons and introduced 4 new playable stuffed animals.',
    changes: [
      {
        category: 'Advancements Matrix',
        items: [
          '7×15 matrix of 105 achievements with unique pixel icons.',
          'Real-time unlock banners and milestone tracker.',
        ],
      },
      {
        category: 'New Playable Stuffies',
        items: [
          'Added Allie, Spike, Pinky, and Sluger with unique mechanics.',
        ],
      },
    ],
  },
  {
    version: 'v3.3',
    title: 'Real Player Network & No-Cracker Test Mode',
    date: 'October 2026',
    summary: 'Scrubbed mock accounts, built 1-year active player registry with friend requests, and added zero-cost testing in Test Mode.',
    changes: [
      {
        category: 'Social Network',
        items: [
          '1-year active player registry with authoritative friend requests.',
          'Player notes and online status badges.',
        ],
      },
      {
        category: 'Test Mode',
        items: [
          'Removed Cracker costs in Test Mode for unlimited combo testing.',
        ],
      },
    ],
  },
  {
    version: 'v3.2',
    title: 'George, Shadow & Hall of Records',
    date: 'October 2026',
    summary: 'Added George the Cephalopod with Emotional Swapping, Shadow the Hedgehog with Inhibitor Rings, and the Hall of Records.',
    changes: [
      {
        category: 'New Stuffies',
        items: [
          'George: Moody cephalopod that swaps between Happy, Sad, and Angry modes.',
          'Shadow: Hedgehog with Chaos Control and Inhibitor Ring power scaling.',
        ],
      },
      {
        category: 'Hall of Records',
        items: [
          'Personal combat records, win streaks, and lifetime stats.',
        ],
      },
    ],
  },
  {
    version: 'v3.1',
    title: 'Global Chat & Concussion Mechanics',
    date: 'October 2026',
    summary: 'Persistent online global chat, head-bump concussion Brain Damage mechanics, and legendary achievement tracking.',
    changes: [
      {
        category: 'Multiplayer Chat',
        items: [
          'Live online global chat room with trainer messages and stamps.',
        ],
      },
      {
        category: 'Concussion Combat',
        items: [
          'Concussion system: repeated blunt damage inflicts Brain Damage status.',
        ],
      },
    ],
  },
  {
    version: 'v3.0',
    title: 'Online Multiplayer & Retro Chiptune Engine',
    date: 'October 2026',
    summary: 'Online lobbies with room codes, spectator mode, Web Audio chiptune synthesizer, and Spot the Zoo Leopard.',
    changes: [
      {
        category: 'Online Lobbies',
        items: [
          'Custom room codes, direct matchmaking, and spectator view.',
          'Web Audio chiptune retro sound synthesizer engine.',
        ],
      },
      {
        category: 'New Stuffy',
        items: [
          'Spot the Zoo Leopard with swift claws and ambushes.',
        ],
      },
    ],
  },
  {
    version: 'v2.0',
    title: 'Roguelike Multi-Act Campaign & 2-Player Draft',
    date: 'October 2026',
    summary: 'Full multi-Act roguelike campaign with merchants, food feeding, relics, and local 2-player hotseat draft with reserve pools.',
    changes: [
      {
        category: 'Roguelike Multi-Act',
        items: [
          'Multi-Act branching map with monsters, elites, rest sites, and bosses.',
          'Merchant shops, food feeding formulas, and passive combat relics.',
        ],
      },
      {
        category: '2-Player Draft',
        items: [
          'Pick-and-ban draft mode with 3 reserve reinforcement stuffies.',
        ],
      },
    ],
  },
  {
    version: 'v1.0',
    title: 'The First Stitch',
    date: 'October 2026',
    summary: 'The original release of Ben\'s Stuffy Card Battle with 16 stuffed animals, Cracker mana, unstuffed revival, and branching map battles.',
    changes: [
      {
        category: 'Core Gameplay',
        items: [
          '16 playable stuffed animals including Alex, Jefe, Finlee, and Fifi.',
          'Deck-building combat with Crackers mana, draw/discard cycles, and revival.',
          'Branching campaign map with the colossal Amalgam boss.',
        ],
      },
    ],
  },
];
