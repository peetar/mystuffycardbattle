export interface EventChoice {
  text: string;
  consequence: string;
  action: 'heal_team' | 'gain_gold' | 'gain_card' | 'lose_hp' | 'upgrade_random';
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
        consequence: 'The warm embrace restores fluff to your party. (+20% Team Heal)',
        action: 'heal_team',
        value: 20,
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
        consequence: 'All stuffies feel snug, fresh, and fully healed!',
        action: 'heal_team',
        value: 30,
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
];
