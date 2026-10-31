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
    version: 'v3.8',
    title: 'Astral Espers, 600 Item Matrix & Tester Admin Suite',
    date: 'October 2026',
    badge: 'CURRENT',
    summary: 'Mythical campaign-exclusive Espers, dedicated Astral Chamber map rooms, 600 items across 5 tiers with a 5-column spawner, and a tester Admin Console.',
    changes: [
      {
        category: 'Campaign Astral Espers',
        items: [
          'Added 20 distinct mythical Espers that bond with stuffies for the remainder of a campaign run.',
          'Dedicated Esper Chamber map rooms: choose 1 of 3 celestial spirits.',
          'Merchant Shop Esper Hiring: Merchants offer 2 random Espers for sale with Stuffydolars.',
          'Espers amplify Speed, Max HP, starting Shield, attack damage, and elemental proc rates.',
        ],
      },
      {
        category: '600-Item Matrix & 5-Column Spawner',
        items: [
          'Expanded equipment catalog to 100 items per type (20 templates x 5 tiers = 600 items total).',
          'Admin Item Spawner updated to a clean 5-column grid layout.',
        ],
      },
      {
        category: 'Tester Admin Console',
        items: [
          'Secure password-protected tester admin suite.',
          '/.gold and /.crackers support [set|add] syntax.',
          '/.shop, /.esper, /.reward, and /.floor commands.',
          'Enforced forward-only progression for /.act and /.floor.',
        ],
      },
    ],
  },
  {
    version: 'v3.7',
    title: 'The Item Armory, Speed Attacks & Cow Stuffy',
    date: 'October 2026',
    summary: 'Persistent equipment items, home screen Armory, Speed combat mechanics with multi-strike rolls, elemental procs, and the Cow playable stuffy.',
    changes: [
      {
        category: 'Item Armory & Combat Attributes',
        items: [
          '6 equipment slots: Helmet, Chestplate, Gloves, Sword, Offhand, and Pendant.',
          'Speed Attacks: Land strikes for every 100 Speed with percentage chance for bonus hits.',
          'Elemental procs: Freeze (Helmet), Burn (Chestplate), Shock (Gloves), and Stun (Sword).',
        ],
      },
      {
        category: 'New Playable Stuffy: Cow',
        items: [
          'Added Cow (82 HP) with Milk Fortitude and Bovine Stampede passive and full 18-card set.',
        ],
      },
    ],
  },
];
