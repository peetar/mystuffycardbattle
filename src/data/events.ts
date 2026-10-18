export interface EventChoice {
  text: string;
  consequence: string;
  action: 'heal_team' | 'gain_gold' | 'gain_card' | 'lose_hp' | 'upgrade_random' | 'gain_relic' | 'max_hp_boost';
  value?: number;
}

export interface CampaignEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  choices: EventChoice[];
}

export const CAMPAIGN_EVENTS: CampaignEvent[] = [
  {
    id: 'dusty_attic_toybox',
    title: 'The Forgotten Toybox',
    description: 'You stumble upon a vintage wooden chest tucked under warm blankets. Soft giggles and muffled squeaks echo from inside.',
    icon: '📦',
    choices: [
      {
        text: 'Rummage inside for treasures',
        consequence: 'Found shiny gold coins and loose buttons! (+35 Gold)',
        action: 'gain_gold',
        value: 35,
      },
      {
        text: 'Rest with the antique plushies',
        consequence: 'The warm embrace restores fluff to your party. (+25% Team Heal)',
        action: 'heal_team',
        value: 25,
      },
    ],
  },
  {
    id: 'grandmas_sewing_kit',
    title: "Grandma's Sewing Basket",
    description: 'A colossal woven basket filled with colorful yarn spools, silver thimbles, and shiny needles stands before your squad.',
    icon: '🧵',
    choices: [
      {
        text: 'Use the fine silk thread to patch up your cards',
        consequence: 'Reinforced stitches upgrade your cards to higher potency!',
        action: 'upgrade_random',
      },
      {
        text: 'Sew extra fluff into all stuffies',
        consequence: 'All stuffies feel snug, fresh, and healed! (+35% Team Heal)',
        action: 'heal_team',
        value: 35,
      },
    ],
  },
  {
    id: 'snack_cabinet_raid',
    title: 'Midnight Pantry Raid',
    description: 'The kitchen pantry door was left slightly ajar! The scent of honey graham crackers wafts through the darkness.',
    icon: '🍪',
    choices: [
      {
        text: 'Raid the cracker box!',
        consequence: 'Scored an enormous stash of snacks! (+50 Gold)',
        action: 'gain_gold',
        value: 50,
      },
      {
        text: 'Sneak past carefully without noise',
        consequence: 'Safe and sound. You find an emergency needle card.',
        action: 'gain_card',
      },
    ],
  },
  {
    id: 'the_button_shrine',
    title: 'The Ancient Button Altar',
    description: 'A glowing circle of pearlescent coat buttons rests atop a folded velvet shawl. Whispers of durability hum through the stitches.',
    icon: '🔘',
    choices: [
      {
        text: 'Offer loose fluff to the shrine (-10 Team HP)',
        consequence: 'The shrine resonates! All stuffies gain +10 Max HP permanent resilience!',
        action: 'max_hp_boost',
        value: 10,
      },
      {
        text: 'Take a polished golden button from the altar',
        consequence: 'Pocketed the treasure! (+45 Gold)',
        action: 'gain_gold',
        value: 45,
      },
    ],
  },
  {
    id: 'cozy_laundromat',
    title: 'The Gentle Cycle Whirlpool',
    description: 'A miniature toy washing tub bubbles with warm scented suds and fabric softener. It looks delightfully refreshing.',
    icon: '🫧',
    choices: [
      {
        text: 'Jump in for a soothing bubble bath',
        consequence: 'Scented fabric softener restores 50% fluff to all stuffies and bench!',
        action: 'heal_team',
        value: 50,
      },
      {
        text: 'Search the lost-and-found pocket',
        consequence: 'Discovered shiny trinkets and dropped coins! (+40 Gold)',
        action: 'gain_gold',
        value: 40,
      },
    ],
  },
  {
    id: 'squeaker_sanctuary',
    title: 'The Sacred Squeaker Grove',
    description: 'A serene glade of squeaker bulbs hanging from ribbon branches. Stepping on the moss produces cheerful acoustic chirps.',
    icon: '📣',
    choices: [
      {
        text: 'Tune your cards to the squeaker harmony',
        consequence: 'A random card is reinforced with resonant acoustic power!',
        action: 'upgrade_random',
      },
      {
        text: 'Listen to the soothing lullaby',
        consequence: 'Deep peaceful rest cleanses your plush party. (+30% Team Heal)',
        action: 'heal_team',
        value: 30,
      },
    ],
  },
  {
    id: 'crayon_gallery',
    title: 'The Nursery Crayon Mural',
    description: 'Vibrant wax drawings cover the baseboards: brave stuffy knights facing clockwork beasts under a bright crayon sun.',
    icon: '🖍️',
    choices: [
      {
        text: 'Draw protective armor on your squad',
        consequence: 'Crayon inspiration invigorates the team! (+8 Max HP to all)',
        action: 'max_hp_boost',
        value: 8,
      },
      {
        text: 'Collect shiny gold crayon shavings',
        consequence: 'Valuable artistic wax coins gathered! (+30 Gold)',
        action: 'gain_gold',
        value: 30,
      },
    ],
  },
  {
    id: 'dust_bunny_bazaar',
    title: 'The Dust Bunny Merchant Encampment',
    description: 'A huddle of fluffy grey lint bunnies gather beneath the sofa, bartering shiny lost thimbles and copper pennies.',
    icon: '🐰',
    choices: [
      {
        text: 'Trade tales for emergency stitching supplies',
        consequence: 'They hand you a pristine Master Restitch card!',
        action: 'gain_card',
      },
      {
        text: 'Negotiate for dropped pocket change',
        consequence: 'The bunnies gladly share spare coins. (+35 Gold)',
        action: 'gain_gold',
        value: 35,
      },
    ],
  },
  {
    id: 'velveteen_wish',
    title: 'The Velveteen Well of Wishes',
    description: 'A brass bell hangs over a sunken pillow basin filled with shimmering buttons. Tossing a button grants heartful wishes.',
    icon: '🌟',
    choices: [
      {
        text: 'Make a wish for ultimate endurance (-15 Gold)',
        consequence: 'Your wish echoes! All stuffies gain +12 Max HP!',
        action: 'max_hp_boost',
        value: 12,
      },
      {
        text: 'Drink from the basin of pure lavender water',
        consequence: 'Cool lavender restores tired seams. (+40% Team Heal)',
        action: 'heal_team',
        value: 40,
      },
    ],
  },
  {
    id: 'couch_cushion_abyss',
    title: 'Between The Sofa Cushions',
    description: 'A deep cavern between plush corduroy cushions! You spot remotes, lost hair clips, and ancient shiny pennies.',
    icon: '🛋️',
    choices: [
      {
        text: 'Reach deep into the crevice',
        consequence: 'Jackpot! Scored heavy silver coins and snack crumbs! (+60 Gold)',
        action: 'gain_gold',
        value: 60,
      },
      {
        text: 'Fluff and tuck the cushions for a nap',
        consequence: 'The ultimate power nap under the couch armrest! (+25% Team Heal)',
        action: 'heal_team',
        value: 25,
      },
    ],
  },
  {
    id: 'pillow_fortress',
    title: 'The Great Pillow Citadel',
    description: 'An architectural marvel of stacked bolster pillows, flannel quilts, and clothes-peg drawbridges guarding the hallway.',
    icon: '🏰',
    choices: [
      {
        text: 'Reinforce defensive tactics at the garrison',
        consequence: 'Tactical study upgrades a card in your deck!',
        action: 'upgrade_random',
      },
      {
        text: 'Enlist garrison medic support',
        consequence: 'Plush medics stitch every frayed seam. (+35% Team Heal)',
        action: 'heal_team',
        value: 35,
      },
    ],
  },
  {
    id: 'clockwork_music_box',
    title: 'The Antique Wind-Up Ballerina',
    description: 'A mahogany music box slowly spins, playing a mesmerizing tinkling lullaby of brass gears and chiming chimes.',
    icon: '🎶',
    choices: [
      {
        text: 'Wind the golden key completely',
        consequence: 'Hypnotic melody washes away strain, fully healing your front liners! (+45% Team Heal)',
        action: 'heal_team',
        value: 45,
      },
      {
        text: 'Carefully harvest extra brass cogs',
        consequence: 'Pawned the precision gears for shiny gold! (+40 Gold)',
        action: 'gain_gold',
        value: 40,
      },
    ],
  },
  {
    id: 'spilled_juice_box',
    title: 'The Sticky Juice Oasis',
    description: 'An overturned apple juice box has created a sugary sweet puddle near the rug. Ants stay away, but the aroma is irresistible.',
    icon: '🧃',
    choices: [
      {
        text: 'Sip the concentrated sweet energy',
        consequence: 'Pure sugar rush! All stuffies gain +10 Max HP!',
        action: 'max_hp_boost',
        value: 10,
      },
      {
        text: 'Carefully salvage the juice pouch straw as a blowpipe',
        consequence: 'Crafted a makeshift weapon card for your deck!',
        action: 'gain_card',
      },
    ],
  },
  {
    id: 'toy_tea_party',
    title: 'The Porcelain Tea Soiree',
    description: 'A circle of porcelain cups filled with imaginary Earl Grey and tiny felt scones. The hostess bear curtsies politely.',
    icon: '🫖',
    choices: [
      {
        text: 'Partake in tea etiquette and manners',
        consequence: 'Delightful conversation and tea soothe your soul! (+30% Team Heal)',
        action: 'heal_team',
        value: 30,
      },
      {
        text: 'Check under the tea tray for tips',
        consequence: 'The host tucked gold coins under the saucer! (+35 Gold)',
        action: 'gain_gold',
        value: 35,
      },
    ],
  },
  {
    id: 'patchwork_loom',
    title: "The Quilt Weaver's Loom",
    description: 'A magical antique loom weaves tapestries of memory and warmth. Strands of golden cotton hover in the air.',
    icon: '🧶',
    choices: [
      {
        text: 'Weave golden thread into your battle cards',
        consequence: 'Card reinforced with legendary quilt embroidery!',
        action: 'upgrade_random',
      },
      {
        text: 'Weave protective insulation for the squad',
        consequence: 'Thick thermal wool grants +10 Max HP to all stuffies!',
        action: 'max_hp_boost',
        value: 10,
      },
    ],
  },
  {
    id: 'starlight_windowsill',
    title: 'The Moonlit Windowsill',
    description: 'Cool moonlight cascades through the curtains, illuminating dust motes dancing like fireflies over the floorboards.',
    icon: '🌙',
    choices: [
      {
        text: 'Bask in the soothing lunar glow',
        consequence: 'Moonlight stitches heal the entire party and bench! (+40% Team Heal)',
        action: 'heal_team',
        value: 40,
      },
      {
        text: 'Collect glistening starlight dust',
        consequence: 'Gathered luminescent fairy dust worth pure gold! (+50 Gold)',
        action: 'gain_gold',
        value: 50,
      },
    ],
  },
];
