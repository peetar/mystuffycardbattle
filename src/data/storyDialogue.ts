/**
 * Story Mode Narrative Dialogue Episodes (v4.0)
 * Visual novel dialogue scripts featuring character portraits, choices, and milestone unlocks.
 */

import { StoryDialogueEpisode } from '@/types/story';

export const STORY_DIALOGUE_EPISODES: Record<string, StoryDialogueEpisode> = {
  // Episode 1: Story Intro in Sector 2 (The House)
  intro_house: {
    id: 'intro_house',
    title: 'Episode 1: The Waking of Jefe',
    lines: [
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'surprised',
        text: '...Wait. Where is everybody?! Shadow? Alex? Cow?! The toy chest is wide open!',
      },
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: 'A faint chime echoes across the living room carpet. Luminescent purple threads crisscross the floorboards, leading toward the front door.',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'worried',
        text: 'Something dragged all 26 of my plush friends away in the night... I have to find them, even if I have to go alone!',
        choices: [
          {
            text: 'Inspect the threads leading to the hallway.',
            nextDialogueId: 'intro_house_search',
          },
          {
            text: 'Check the backyard window first.',
            nextDialogueId: 'intro_house_backyard',
          },
        ],
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'No matter what happens, Ben is counting on me! Let\'s go!',
      },
    ],
    onCompleteUnlockSectorIds: [1, 3, 4], // Unlocks Porch, Backyard, Kitchen
  },

  intro_house_backyard: {
    id: 'intro_house_backyard',
    title: 'The Backyard Sanctuary',
    lines: [
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Look out the window! The Backyard (Sector 3) looks sunny and safe.',
      },
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: 'The Backyard is an independent training sanctuary. You can visit anytime to battle wild fluff critters and test new decks without advancing the main story danger!',
      },
    ],
  },

  intro_house_search: {
    id: 'intro_house_search',
    title: 'The Stitched Trail',
    lines: [
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'neutral',
        text: 'The threads smell of dust and ancient clockwork. We need to fight through the room sectors to reach the outside!',
      },
    ],
  },

  // Rescuing Shadow (Mission 2 / Sector 4)
  rescue_shadow: {
    id: 'rescue_shadow',
    title: 'Rescuing Shadow',
    lines: [
      {
        speakerName: 'Shadow',
        speakerSpeciesId: 'shadow',
        emotion: 'surprised',
        text: 'Jefe! You cut through the dust spiders! Thank goodness... my fluff was almost snagged in the trap.',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Shadow! You\'re safe! Join me—together our squad will be twice as strong!',
      },
      {
        speakerName: 'Shadow',
        speakerSpeciesId: 'shadow',
        emotion: 'happy',
        text: 'You can count on my dark mist claws. Let\'s find the others!',
      },
    ],
    onCompleteUnlockStuffyId: 'shadow',
    onCompleteUnlockSectorIds: [5, 6],
  },

  // Milestone 1/16: Equipment Armory Unlocked (~Sector 6)
  milestone_armory: {
    id: 'milestone_armory',
    title: 'Milestone 1/16: The Workshop Armory',
    lines: [
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'surprised',
        text: 'Look at this sturdy wooden toolbox under the basement stairs!',
      },
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: '✨ MILESTONE UNLOCKED: THE EQUIPMENT ARMORY! You can now equip helmets, chestplates, weapons, and accessories dropped by monsters to enhance your team!',
      },
    ],
    onCompleteUnlockMilestone: 'armory',
    onCompleteUnlockSectorIds: [7, 8, 9],
  },

  // Rescuing Cow (Mission 4 / Sector 8)
  rescue_cow: {
    id: 'rescue_cow',
    title: 'Rescuing Cow',
    lines: [
      {
        speakerName: 'Cow',
        speakerSpeciesId: 'cow',
        emotion: 'happy',
        text: 'Mooo! Jefe, you found me! Those mean wooden tin soldiers were trying to turn me into a pincushion!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Cow! Your heavy trampling charge is just what our team needs. Fall in!',
      },
    ],
    onCompleteUnlockStuffyId: 'cow',
  },

  // Milestone 3/32: Evolution Lab Unlocked (~Sector 9)
  milestone_lab: {
    id: 'milestone_lab',
    title: 'Milestone 3/32: The Astral Fusion Lab',
    lines: [
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: 'A glittering cosmic table hums with star energy on the workbench.',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'surprised',
        text: 'The Evolution Lab! Here we can merge matching star cards: 1★+1★=2★, 2★+2★=3★, up to 10★ to empower our stuffies!',
      },
    ],
    onCompleteUnlockMilestone: 'lab',
    onCompleteUnlockSectorIds: [10, 11, 12, 13],
  },

  // Milestone 1/8: The Fairy Well Unlocked (~Sector 13)
  milestone_fairy_well: {
    id: 'milestone_fairy_well',
    title: 'Milestone 1/8: The Fairy Well',
    lines: [
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: 'In the center of the mossy garden stands an enchanted stone fountain glowing with iridescent fairy dust.',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'The legendary Fairy Well! The water sparkles whenever we offer duplicate Stuffy Cards from our binder!',
      },
      {
        speakerName: 'Fairy Queen',
        emotion: 'happy',
        text: 'Brave plushies! Offer your duplicate cards into my waters, and I shall permanently bless your Espers with Speed, Max HP, and elemental potency!',
      },
    ],
    onCompleteUnlockMilestone: 'fairy_well',
    onCompleteUnlockSectorIds: [14, 15, 16, 17],
  },

  // Rescuing Finlee (Sector 17)
  rescue_finlee: {
    id: 'rescue_finlee',
    title: 'Rescuing Finlee',
    lines: [
      {
        speakerName: 'Finlee',
        speakerSpeciesId: 'finlee',
        emotion: 'happy',
        text: 'Chomp chomp! I was busy chewing through the ropes holding this sandcastle!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Finlee! We need your shark bite to breach the outer playground gates!',
      },
    ],
    onCompleteUnlockStuffyId: 'finlee',
    onCompleteUnlockSectorIds: [18, 19, 20],
  },

  // Rescuing Alex (Sector 20)
  rescue_alex: {
    id: 'rescue_alex',
    title: 'Rescuing Alex',
    lines: [
      {
        speakerName: 'Alex',
        speakerSpeciesId: 'alex',
        emotion: 'happy',
        text: 'Strokenosis activated! Thanks for the assist, team. My psychic confusion cards will help take down the factory overseers!',
      },
    ],
    onCompleteUnlockStuffyId: 'alex',
    onCompleteUnlockSectorIds: [21, 22, 23, 24, 25],
  },
};
