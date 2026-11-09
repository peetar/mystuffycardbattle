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
    version: 'v4.5',
    title: 'The Towntime Expansion: 175x175 World, 66 Structures, Living Workforce & DNA Lab',
    date: 'November 2026',
    badge: 'CURRENT',
    summary: 'Version 4.5 "The Towntime Expansion"! Officially launches the full Towntime settlement simulation on an expansive 175x175 organic world grid with 66 unique buildings across strict size categories. Recruited plushies and automatons live in houses, rest to boost morale, physically navigate roads, and work assigned harvesting/crafting jobs. Features an expansive 2D branching visual tech tree, the Forge crafting screen, Artisan Workshop, Apothecary Potion Brewery, and the Ancient Dino DNA Genetics Lab permanently powering up all stuffies across every battle mode.',
    changes: [
      {
        category: '175x175 World Grid & 66 Town Structures',
        items: [
          'Expanded settlement map to a massive 175x175 landscape grid featuring natural meandering rivers, mountain mineral veins, volcanic fissures, and clay shorelines.',
          '66 distinct buildings across strict category footprint rules: Containers (1x1), Residential/Utilities (2x2), Harvesters & Crafters (2x3), Recreation (3x3), and Civic Landmarks (3x4).',
          'Strict orthogonal road connectivity and container resource storage capping (res <= storageCap).',
        ],
      },
      {
        category: 'Living Plushie & Automaton Workforce',
        items: [
          'Story plushies physically walk to their assigned jobs, take resting breaks in town houses, and boost town morale scores.',
          'Automaton Robots work at 75% efficiency and require 2x2 Charging Ports for continuous power.',
          '15-second harvester production pacing (e.g., 2 wood / 15s) with dedicated worker assignment requirements.',
        ],
      },
      {
        category: 'Visual Tech Tree & Crafting Screens',
        items: [
          'Branching 2D Visual Tech Tree with dot-and-line node coordinates and realistic 5-minute research countdowns.',
          'Dedicated Forge Screen with tabs for socketable Upgrade Modules, Automaton craft recipes, and heavy tools.',
          'Artisan Workshop screen for batch and auto-crafting metal, steel, electronics, felt, and paper.',
          'Grand Apothecary & Potion Brewery with potable consumable pouch for instant town and combat boosts.',
        ],
      },
      {
        category: 'Ancient Dino DNA Genetics Lab',
        items: [
          'Unearth ancient fossils at the Ancient Fossil Dig and extract them in the DNA Lab (10 Fossils = 1 DNA Helix Point).',
          'Ancestral Attribute Tree permanently empowers ALL friendly stuffies with Tyranno Vitality (+HP), Apex Ferocity (+Damage), Raptor Reflexes (+Speed), Ankylosaur Carapace (+Shield), and Pterodactyl Instinct (+Crit/Evasion).',
        ],
      },
      {
        category: 'Command Interface & Combat AI',
        items: [
          'Temporary dev fast-forward buttons graduated to the official /.warp [seconds] chat/console command.',
          'Combat AI enhancements: Enemy George intelligently switches moods between Angry (2x attack) and Happy (2x heal), and Enemy Big Bear awakens from his slumber into a battle frenzy.',
        ],
      },
    ],
  },
  {
    version: 'v4.4',
    title: 'Towntime Preparation: Small Dev Update & Infrastructure for v4.5',
    date: 'November 2026',
    summary: 'Version 4.4 "Towntime Preparation"! A small developer update establishing the architecture, systems testing, and foundational hooks to test out Towntime in preparation for the upcoming Version 4.5.',
    changes: [
      {
        category: 'Towntime Preparation & Dev Architecture',
        items: [
          'Initialized preliminary groundwork, staging environments, and hooks to test out the upcoming Towntime feature.',
          'System preparations and state optimizations for upcoming town exploration, plushie socialization, and town activities in v4.5.',
          'Main Menu blurb and version records updated for v4.4 Towntime Preparation.',
        ],
      },
      {
        category: 'Quality of Life & Command Stability',
        items: [
          'Enhanced command processor to seamlessly recognize admin command variations and aliases (such as .vison / .vision).',
          'Map Vision guarantees full illumination across all 5 story parts (2,640 sectors) with convenient in-map toggle control.',
        ],
      },
    ],
  },
  {
    version: 'v4.3',
    title: 'The Second Coming Update: 5 Story Parts, 528 Sectors Each, 6 New Plushies & Cutscenes',
    date: 'November 2026',
    summary: 'Version 4.3 "The Second Coming Update"! Restructured Story Mode into 5 distinct Parts with 528 sectors per part (2,640 sectors total). Introduced sequential progression with the ability to freely move back to any unlocked part at any time. Added 6 new hero plushies (Tyrant the Dino, Unicorn, Grumpy Rhino, Farty Lama, Dolpher, and Dolphim), big gaps between all 32 plushie unlocks, full cinematic cutscenes with letterboxing and auto/skip controls, and unified Spread & Around AoE damage/heal pool splitting mechanics.',
    changes: [
      {
        category: 'New Equipment Slots & Gear Overhaul (Leggings, Boots & Socks)',
        items: [
          'Added 3 new equipment slots to all plushies: Leggings, Boots, and Socks (expanding total gear slots from 6 to 9).',
          'Leggings (+Speed): Lightweight aerodynamic legwear granting massive Speed (up to 500 cap) for rapid action and extra speed strikes.',
          'Boots (+Evasion up to +35%): High-agility footwear enabling plushies to completely dodge and evade incoming single-target and AoE enemy attacks.',
          'Socks (+Shock up to 25%): Socks take over electrostatic shock from gloves, rubbing against attic carpets to paralyze enemy cards for 1 turn.',
          'Gloves Redesign (+Harvesting up to 50%): Gloves now grant Harvesting, increasing post-battle loot, Stuffydolars, and bonus item drops by up to 50%!',
          'Updated Armory and Admin Panel (.item) with full 9-slot equipment grids and 60+ new gear templates.',
        ],
      },
      {
        category: '5 Story Mode Parts (528 Sectors per Part, 2,640 Total)',
        items: [
          'Divided Story Mode into 5 distinct Chapters/Parts with 528 sectors each (2,640 sectors total).',
          'Sequential unlocking: completing the climax boss of each part automatically advances to the next part.',
          'Part Navigation Hub: freely switch back to any previously unlocked part at any time to explore and grind.',
          'Big gaps between all 32 plushie rescues (60-80 sectors between unlocks across the 5 parts).',
        ],
      },
      {
        category: '6 New Hero Plushies ("The Second Coming")',
        items: [
          'Tyrant the Dino (🦖): Likes to "thump and jump"! Delivers heavy seismic ground thumps and leaps with massive shields.',
          'Unicorn (🦄): All white with pink feet, purple hair, and a rainbow horn! Cleanses debuffs and radiates prismatic heals.',
          'Grumpy Rhino (🦏): A very grumpy rhino! Scowls, stomps, and retaliates with heavy horn damage.',
          'Farty Lama (🦙): Iconic Fortnite pinata llama as delightfully farty as Fifi! Drops Crackers and blankets foes in gas clouds.',
          'Dolpher (🐬): The older female grey dolphin matriarch who protects the entire pod with tidal waves and soothing shields.',
          'Dolphim (🧠): Smaller, lighter grey smart dolphin who calculates enemy trajectories with high-IQ sonar algorithms.',
          'Full 18-card suites and loadout packages designed for all 6 new plushies (108 new cards total).',
        ],
      },
      {
        category: 'Story Mode Cinematic Cutscenes',
        items: [
          'Added widescreen 21:9 letterboxed cinematic cutscene system with glowing atmospheric backdrops.',
          'Integrated Part Opening cutscenes, Part Climax finale scenes, and dedicated rescue cutscenes for all new plushies.',
          'Quality of life controls: 1x/2x Auto-Play toggle and Instant Skip Cutscene (⏭️).',
        ],
      },
      {
        category: 'AoE Overhaul (Spread & Around Splitting)',
        items: [
          'Two AoE archetypes: Around (target + adjacent alive neighbors) and Spread (entire opposing/allied team).',
          'Damage & heal pool splitting: total amount divides evenly across living targets hit (e.g. 60 pool deals 12 each to 5, 15 to 4, 20 to 3, 30 to 2, 60 to 1).',
        ],
      },
    ],
  },
  {
    version: 'v4.2',
    title: '540-Sector World Map, 16 Biomes, Spread-Out Unlocks & Main Menu Unlock Timeline',
    date: 'November 2026',
    summary: 'Massive v4.2 expansion adding 135 new sectors for 540 sectors total across 16 irregular touching biomes (introducing Sky Gardens & Floating Isles, Magma Ridge & Ember Crags, and The Ancient Toy Factory). Added Main Menu Adventure Unlock Timeline detailing exact unlock sectors for all 26 plushies and facility milestones (Armory, Fairy Well, Star Lab).',
    changes: [
      {
        category: '540-Sector World Map & 16 Adventure Biomes',
        items: [
          'Added 135 new sectors distributed across 16 irregular blob-shaped sector groups (540 sectors total).',
          '3 New High-Level Adventure Zones: Sky Gardens & Floating Isles (☁️), Magma Ridge & Ember Crags (🌋), and The Ancient Toy Factory (🏭).',
          'House Size Rule Preserved: Ben\'s House (12) and Necak\'s House (15) strictly maintain fewer sectors than all 14 other adventure regions.',
          'Grand Finale relocated to Sector 540: The Stitchmaster\'s Citadel.',
        ],
      },
      {
        category: 'Main Menu Adventure Unlock Timeline',
        items: [
          'Added interactive Roadmap Timeline accessible directly from the Main Menu.',
          'Tracks exact unlock chapters and sectors for all 26 hero plushies and facilities (Sector 18 Armory, Sector 38 Fairy Well, Sector 50 Necak\'s Star Lab).',
          'Real-time synchronization with active save data: shows Unlocked checkmarks vs Upcoming locked previews with direct Go-to-Map shortcuts.',
        ],
      },
      {
        category: 'Spread-Out Plushie Progression & 29 Revisits',
        items: [
          'Plushie rescues spread across the larger world: Pinky Bear at Sector 300 (Moonlit Carnival), Big Bear at Sector 440 (Sky Islands), and Umbratail at Sector 480 (Magma Ridge Forge).',
          'Maintained all 29 narrative sector revisits and Joann placement between Fifi and George.',
        ],
      },
    ],
  },
  {
    version: 'v4.1',
    title: '405-Sector World Map, Scouted Fog-of-War, 6+ Plushie Benching & New Biomes',
    date: 'November 2026',
    badge: 'RECENT',
    summary: 'Expanded story adventure to 405 sectors across 13 irregular touching biomes (adding The Moonlit Carnival, The Crystal Caverns, and The Clockwork Tower). Added scouted neighbor exploration (revealing sectors around discovered areas), required stuffy party enforcement with 6+ stuffy squad benching option, 29 revisits, and 35 copyright-free Espers.',
    changes: [
      {
        category: '405-Sector World Map & New Sector Groups',
        items: [
          'Expanded world map to 405 sectors with touching squares in irregular blob formations, with houses keeping fewer sectors than all other zones.',
          'Added 3 new late-game adventure regions: The Moonlit Carnival (🎪), The Crystal Caverns (💎), and The Clockwork Tower (🕰️), culminating at Sector 405: The Stitchmaster\'s Citadel.',
          'Scouted Exploration: Revealed sectors immediately adjacent to and surrounding discovered/doable sectors with scouted indicators (🔭) to preview upcoming challenges.',
        ],
      },
      {
        category: 'Party Requirements & 6+ Stuffy Squad Benching',
        items: [
          'Strict level deployment requirement: cannot embark on a mission requiring a stuffy until they are in your active 5-stuffy party.',
          'Squad Benching Option: once you unlock 6 or more stuffies, an interactive toggle allows you to bench required plushies and deploy any 5-stuffy squad of your choice.',
        ],
      },
      {
        category: 'Tabbed Stuffy Codex & Expanded Espers',
        items: [
          'Restructured Stuffy Codex with top navigation tabs: Stuffies, Bosses, Espers, and Equipment & Items.',
          'Expanded original Esper collection to 35 unique celestial and elemental spirits.',
          'Completely copyright-free spirit and stuffy naming (Toothless -> Lessteeth, Riolu -> Ralou, Eevee -> Eavie, Shadow -> Shade, Umbreon -> Umbratail).',
        ],
      },
    ],
  },
  {
    version: 'v4.0',
    title: 'Story Mode, 10x10 Sector Grid Map, Fairy Well & Squad Builder',
    date: 'October 2026',
    badge: 'MAJOR',
    summary: 'Interactive narrative Story Mode across a 100-sector grid map, starting with only Jefe and rescuing all 27 plushies, Fairy Well Esper sacrifices, manual squad order builder & preset loading, progressive facility milestones (Armory, Lab, Well), non-Jefe lead quests, and discovery-gated side quests.',
    changes: [
      {
        category: 'Story Mode & 10x10 Sector Grid Map',
        items: [
          '100-sector interactive adventure map spanning 8 diverse biomes from The House to Astral Citadel.',
          'Start in Sector 2 (The House) with only Jefe; unlock all 27 plushies through narrative rescue missions.',
          'Sector 3 (The Backyard) is always accessible at all times for repeatable grinding and leveling.',
          'Dynamic mission structure (~9 floors across 3 acts) ending in boss encounters awarding ~3 card packs.',
          'Defeat protection: players keep all card packs and XP earned up to the defeat floor on loss.',
        ],
      },
      {
        category: 'Manual Squad Builder & Gated Embarkation',
        items: [
          'Manual squad selection: choose exact slot positions (1st through 5th) and customize party order.',
          'Preset loading support: load saved squads from Campaign presets with auto-filtering for unlocked plushies.',
          'Required stuffy gating: missions strictly require designated story plushies (e.g., Shadow, Cow, Finlee, Alex) before embarking.',
          'Non-Jefe story leads: multiple main story missions focus on other plushies and do not require Jefe.',
          'Dynamic under-strength scaling: full 5-enemy floors scale down in HP and damage when embarking with teams of 1-4 stuffies.',
        ],
      },
      {
        category: 'Story Facility Milestones',
        items: [
          '1/16 Story Progress (Sector 6): Unlocks Equipment Armory for persistent gear loadouts.',
          '3/32 Story Progress (Sector 9): Unlocks Evolution Lab for combining identical cards into higher star plushies (up to 10★).',
          '1/8 Story Progress (Sector 13): Unlocks Fairy Well to permanently sacrifice Stuffy Cards for powerful Esper stat blessings.',
        ],
      },
      {
        category: 'Side Quests & Quest Tracker Side Panel',
        items: [
          'Interactive Quest Tracker side panel surfacing active Main Story objectives and available Side Quests.',
          'Side quests only appear on the map and in the tracker once all required stuffies are rescued.',
          'Visual distinction between active Main Story quests (🎯) and discovered Side Quests (📜).',
        ],
      },
    ],
  },
  {
    version: 'v3.9',
    title: '10-Star Evolution, Act Reward Packs & Astral Star Chamber',
    date: 'October 2026',
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
