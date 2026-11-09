/**
 * Story Mode Narrative Dialogue Episodes (v4.0)
 * Visual novel dialogue scripts featuring character portraits, choices, milestone unlocks,
 * and the grand outdoor adventure rescue saga of all 25 plushies in exact order.
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
        text: '...Wait. Where is everybody?! Shade? Alex? Finlee?! The bedroom door was left ajar and the front door is wide open!',
      },
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: 'Luminescent purple threads crisscross the floorboards, leading past the front porch into the great outside world.',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'worried',
        text: 'A rogue sewing magic took all 25 of my plush friends outside! I must embark on an adventure into the neighborhood to rescue everyone!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Wait—I hear a faint derp coming from the toy chest right here! Someone is still inside the house! How should we approach?',
        choices: [
          {
            text: '🛡️ Reinforce with +20 Stitched Shielding',
            combatBuff: 'shield',
          },
          {
            text: '🍪 Search the pantry for +50 Gold Crackers',
            bonusCrackers: 50,
          },
          {
            text: '⚡ Stretch seams for +10 Agility Speed',
            combatBuff: 'speed',
          },
        ],
      },
    ],
    onCompleteUnlockSectorIds: [1, 2, 3, 4],
  },

  // 1. Rescuing Alex (Sector 2 - The House)
  rescue_alex: {
    id: 'rescue_alex',
    title: 'Rescuing Alex',
    lines: [
      {
        speakerName: 'Alex',
        speakerSpeciesId: 'alex',
        emotion: 'happy',
        text: 'Durrrp... Oh, hi Jefe! I was taking a nap under this pile of socks when the purple threads tried to tie me up.',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Alex! Your psychic Strokenosis and derp calmness are unmatched. Come with me—our outdoor adventure starts now!',
      },
      {
        speakerName: 'Alex',
        speakerSpeciesId: 'alex',
        emotion: 'happy',
        text: 'Let\'s go outside! I heard Shade was dragged toward the backyard vegetable patch! Look what I found under the sofa cushion:',
        choices: [
          {
            text: '🎁 Open the Rare Plushie Card Pack!',
            rewardPacksCount: 1,
          },
          {
            text: '🍪 Munch +40 Cracker Crumbs for energy!',
            bonusCrackers: 40,
          },
        ],
      },
    ],
    onCompleteUnlockStuffyId: 'alex',
    onCompleteUnlockSectorIds: [3, 4],
  },

  // 2. Rescuing Shade (Backyard Vegetable Garden)
  rescue_shadow: {
    id: 'rescue_shadow',
    title: 'Rescuing Shade',
    lines: [
      {
        speakerName: 'Shade',
        speakerSpeciesId: 'shadow',
        emotion: 'surprised',
        text: 'Jefe! Alex! You shredded the cobwebs! Those clockwork garden spiders were trying to cocoon my claws!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Shade! You\'re safe! Fall in—we need your dark mist claws to cut through the backyard!',
      },
      {
        speakerName: 'Shade',
        speakerSpeciesId: 'shadow',
        emotion: 'happy',
        text: 'Finlee was dragged toward the old wooden workshop shed in Sector 6. Let\'s hurry!',
      },
    ],
    onCompleteUnlockStuffyId: 'shadow',
    onCompleteUnlockSectorIds: [5, 6],
  },

  // 3. Rescuing Finlee + Milestone 1/16: Equipment Armory (Sector 6 - Workshop Shed)
  milestone_armory: {
    id: 'milestone_armory',
    title: 'Rescuing Finlee & Milestone 1/16: The Equipment Armory',
    lines: [
      {
        speakerName: 'Finlee',
        speakerSpeciesId: 'finlee',
        emotion: 'happy',
        text: 'CHOMP CHOMP! Jefe! I was busy chewing through the iron lock on this sturdy craftsman toolbox!',
      },
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: '✨ MILESTONE UNLOCKED: THE EQUIPMENT ARMORY! You can now equip helmets, chestplates, weapons, and accessories dropped by monsters!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Finlee is rescued, and we unlocked the Armory! Next up: Slugmee was spotted near the flowerbed in Sector 15!',
      },
    ],
    onCompleteUnlockStuffyId: 'finlee',
    onCompleteUnlockMilestone: 'armory',
    onCompleteUnlockSectorIds: [7, 8, 9, 13, 14, 15],
  },

  // Milestone 3/32: Evolution Lab (Sector 9 - Necak's Star Workshop)
  milestone_lab: {
    id: 'milestone_lab',
    title: 'Milestone 3/32: The Astral Fusion Lab',
    lines: [
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: 'A mystical glowing star table hums with celestial energy in Necak\'s workshop.',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'surprised',
        text: 'The Evolution Lab! Here we can fuse matching cards: 1★+1★=2★, 2★+2★=3★, up to 10★ to empower our stuffies!',
      },
    ],
    onCompleteUnlockMilestone: 'lab',
    onCompleteUnlockSectorIds: [10, 16, 17, 18],
  },

  // Milestone 1/8: The Fairy Well (Sector 13)
  milestone_fairy_well: {
    id: 'milestone_fairy_well',
    title: 'Milestone 1/8: The Fairy Well',
    lines: [
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: 'An iridescent stone birdbath fountain bubbles with sparkling fairy water.',
      },
      {
        speakerName: 'Fairy Queen',
        emotion: 'happy',
        text: 'Brave plush travelers! Offer duplicate Stuffy Cards into my waters, and I shall permanently bless your Espers with Speed, Max HP, and elemental potency!',
      },
    ],
    onCompleteUnlockMilestone: 'fairy_well',
  },

  // 4. Rescuing Slugmee (Sector 15 - Flowerbed Thicket)
  rescue_slugmee: {
    id: 'rescue_slugmee',
    title: 'Rescuing Slugmee',
    lines: [
      {
        speakerName: 'Slugmee',
        speakerSpeciesId: 'slugmee',
        emotion: 'happy',
        text: 'Slurp... You made it! The thorns couldn\'t pierce my slime, but I was stuck fast!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Slugmee! Your corrosive slime and slowing trails will protect our vanguard. Welcome to the squad!',
      },
    ],
    onCompleteUnlockStuffyId: 'slugmee',
    onCompleteUnlockSectorIds: [16],
  },

  // 5. Rescuing Spike (Sector 16 - Stepping Stone Path)
  rescue_spike: {
    id: 'rescue_spike',
    title: 'Rescuing Spike',
    lines: [
      {
        speakerName: 'Spike',
        speakerSpeciesId: 'spike',
        emotion: 'happy',
        text: 'Hedgehog roll! I curled into a spiky ball and popped a dozen rogue beetles!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Spike! Your prickly spines are perfect against swarming enemies. Spot is just ahead on Necak\'s patio!',
      },
    ],
    onCompleteUnlockStuffyId: 'spike',
    onCompleteUnlockSectorIds: [17, 18],
  },

  // 6. Rescuing Spot (Sector 18 - Necak's Patio Pathway)
  rescue_spot: {
    id: 'rescue_spot',
    title: 'Rescuing Spot',
    lines: [
      {
        speakerName: 'Spot',
        speakerSpeciesId: 'spot',
        emotion: 'happy',
        text: 'Woof woof! I was digging up the trail markers! Cow is trapped right inside Necak\'s House barn!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Good dog, Spot! Lead the way to Necak\'s House—we\'re going to free Cow!',
      },
    ],
    onCompleteUnlockStuffyId: 'spot',
    onCompleteUnlockSectorIds: [19, 20],
  },

  // 7. Rescuing Cow at Necak's House (Sector 20 - Necak's House Sanctuary)
  rescue_cow: {
    id: 'rescue_cow',
    title: "Rescuing Cow at Necak's House",
    lines: [
      {
        speakerName: 'Cow',
        speakerSpeciesId: 'cow',
        emotion: 'happy',
        text: 'MOOOO! You guys found me at Necak\'s house! The giant hay baler titan was trying to roll me into a bale!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Cow is back! Your heavy hooves and milk healing will keep our team standing strong!',
      },
      {
        speakerName: 'Cow',
        speakerSpeciesId: 'cow',
        emotion: 'surprised',
        text: 'Look out the window of Necak\'s house! The threads lead across the lane into the tall Apartment Area!',
      },
    ],
    onCompleteUnlockStuffyId: 'cow',
    onCompleteUnlockSectorIds: [21, 22, 23, 24],
  },

  // 8. Rescuing Cydney (Sector 24 - Apartment Lobby Entrance)
  rescue_cydney: {
    id: 'rescue_cydney',
    title: 'Rescuing Cydney',
    lines: [
      {
        speakerName: 'Cidney',
        speakerSpeciesId: 'cidney',
        emotion: 'happy',
        text: 'What took you so long? I was vaulting over the mailboxes fending off mechanical cats!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Cydney! Your agile acrobatics are unmatched. Let\'s scale the breezeway to find Chantiera!',
      },
    ],
    onCompleteUnlockStuffyId: 'cidney',
    onCompleteUnlockSectorIds: [25, 31, 32],
  },

  // 9. Rescuing Chantiera (Sector 31 - Apartment 2nd Floor Breezeway)
  rescue_chantiera: {
    id: 'rescue_chantiera',
    title: 'Rescuing Chantiera',
    lines: [
      {
        speakerName: 'Chanteira',
        speakerSpeciesId: 'chanteira',
        emotion: 'happy',
        text: 'La la laaa! My sonic singing was keeping the storm gulls at bay! Thank you for the rescue!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Chantiera\'s harmonious chords will buff our whole squad! But look toward the coastline—Dolphy was dragged deep into the ocean to Upgel Didav!',
      },
    ],
    onCompleteUnlockStuffyId: 'chanteira',
    onCompleteUnlockSectorIds: [35, 66, 68, 70],
  },

  // 10. Rescuing Dolphy at Upgel Didav (Sector 70 - Upgel Didav in the Ocean)
  rescue_dolphy: {
    id: 'rescue_dolphy',
    title: 'Rescuing Dolphy at Upgel Didav',
    lines: [
      {
        speakerName: 'Dolphy',
        speakerSpeciesId: 'dolphy',
        emotion: 'happy',
        text: 'Eeeee-click! You swam all the way out to Upgel Didav! The coral citadel was under siege!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Dolphy! Your ultrasonic aquatic sonar and wave dashes saved us! Allie was washed up onto the sandy beach!',
      },
    ],
    onCompleteUnlockStuffyId: 'dolphy',
    onCompleteUnlockSectorIds: [51, 52, 53],
  },

  // 11. Rescuing Allie (Sector 52 - Beach Golden Shoreline)
  rescue_allie: {
    id: 'rescue_allie',
    title: 'Rescuing Allie',
    lines: [
      {
        speakerName: 'Allie',
        speakerSpeciesId: 'allie',
        emotion: 'happy',
        text: 'Snap snap! The tides washed me onto the sands, but my alligator jaws held off the hermit crabs!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Allie is back! Let\'s head into the dark tree line—Sluger is in the Wild Forest thickets!',
      },
    ],
    onCompleteUnlockStuffyId: 'allie',
    onCompleteUnlockSectorIds: [36, 37, 38],
  },

  // 12. Rescuing Sluger (Sector 38 - Wild Forest Bramble)
  rescue_sluger: {
    id: 'rescue_sluger',
    title: 'Rescuing Sluger',
    lines: [
      {
        speakerName: 'Sluger',
        speakerSpeciesId: 'sluger',
        emotion: 'happy',
        text: 'Heavy shell defense locked in! Good to see you all—the forest brambles couldn\'t crack my armor!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Sluger\'s fortified shell will shield us from fierce forest beasts! Deep in the canopy, Fifi is calling for help!',
      },
    ],
    onCompleteUnlockStuffyId: 'sluger',
    onCompleteUnlockSectorIds: [46, 47, 48],
  },

  // 13. Rescuing Fifi (Sector 48 - Wild Forest Canopy)
  rescue_fifi: {
    id: 'rescue_fifi',
    title: 'Rescuing Fifi',
    lines: [
      {
        speakerName: 'Fifi',
        speakerSpeciesId: 'fifi',
        emotion: 'happy',
        text: '*Pfffft!* Oops, excuse me! I was filling the hollow logs with toxic smog to confuse the shadow owls!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'surprised',
        text: 'Fifi! Don\'t fart on the squad! But your poison gas screen will be super useful against the treetops. George is up at the lookout!',
      },
    ],
    onCompleteUnlockStuffyId: 'fifi',
    onCompleteUnlockSectorIds: [49, 50],
  },

  // 14. Rescuing Joann (Between Fifi and George)
  rescue_joann: {
    id: 'rescue_joann',
    title: 'Rescuing Joann',
    lines: [
      {
        speakerName: 'Joann',
        speakerSpeciesId: 'joann',
        emotion: 'happy',
        text: '*Purrr!* About time! I was knocking entire acorns off this picnic table straight into the shadow minions\' faces!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Joann! Your table disruption claws and haughty swats are legendary! We need your feline reflexes to reach George in the high pine spires!',
      },
      {
        speakerName: 'Joann',
        speakerSpeciesId: 'joann',
        emotion: 'happy',
        text: 'Lead the way, Jefe! If any monster tries to set down a card, I will swat it off the board!',
      },
    ],
    onCompleteUnlockStuffyId: 'joann',
  },

  // 15. Rescuing George (Sector 50 - Great Treetop Lookout)
  rescue_george: {
    id: 'rescue_george',
    title: 'Rescuing George',
    lines: [
      {
        speakerName: 'George',
        speakerSpeciesId: 'george',
        emotion: 'happy',
        text: 'Ooh ooh aah aah! What a view from up here! I can see Rialou down by the beach umbrella camps!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'George! Your climbing agility will let us scale any hazard. Let\'s head down to the dunes for Rialou!',
      },
    ],
    onCompleteUnlockStuffyId: 'george',
    onCompleteUnlockSectorIds: [54, 55],
  },

  // 15. Rescuing Ralou (Beach Umbrella Camp)
  rescue_riolu: {
    id: 'rescue_riolu',
    title: 'Rescuing Ralou',
    lines: [
      {
        speakerName: 'Ralou',
        speakerSpeciesId: 'riolu',
        emotion: 'happy',
        text: 'My aura senses your bravery, Jefe! I was meditating beneath the sun umbrella dodging sand scorpions!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Ralou\'s fighting spirit is electric! Thumper is just down the beach by the rocky tide pools!',
      },
    ],
    onCompleteUnlockStuffyId: 'riolu',
    onCompleteUnlockSectorIds: [61, 62],
  },

  // 16. Rescuing Thumper (Tide Pool Shallows)
  rescue_thumper: {
    id: 'rescue_thumper',
    title: 'Rescuing Thumper',
    lines: [
      {
        speakerName: 'Thumper',
        speakerSpeciesId: 'thumper',
        emotion: 'happy',
        text: 'Boing boing! I was leaping from slippery rock to rock over the saltwater spray!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Thumper\'s super hops give us unstoppable vertical speed! Lessteeth was spotted out in the bioluminescent ocean trench!',
      },
    ],
    onCompleteUnlockStuffyId: 'thumper',
    onCompleteUnlockSectorIds: [67],
  },

  // 17. Rescuing Lessteeth (Bioluminescent Trench)
  rescue_toothless: {
    id: 'rescue_toothless',
    title: 'Rescuing Lessteeth',
    lines: [
      {
        speakerName: 'Lessteeth',
        speakerSpeciesId: 'toothless',
        emotion: 'happy',
        text: 'ROAAAR! Plasma blast! The giant angler fish thought I was an easy snack!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Lessteeth! Your plasma dragon breath will incinerate any threat! Beaker is deep in the oceanic abyss!',
      },
    ],
    onCompleteUnlockStuffyId: 'toothless',
    onCompleteUnlockSectorIds: [76, 77],
  },

  // 18. Rescuing Beaker (Ocean Deep Trench)
  rescue_beaker: {
    id: 'rescue_beaker',
    title: 'Rescuing Beaker',
    lines: [
      {
        speakerName: 'Beaker',
        speakerSpeciesId: 'beaker',
        emotion: 'happy',
        text: 'Meep meep! My diving bell oxygen formula was at 2%! Perfect timing, squad!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Beaker\'s wacky alchemical potions will supercharge our cards! The threads rise up to the suburb avenue—let\'s find Eavie!',
      },
    ],
    onCompleteUnlockStuffyId: 'beaker',
    onCompleteUnlockSectorIds: [81, 82],
  },

  // 19. Rescuing Eavie (Suburb Oak Avenue)
  rescue_eevee: {
    id: 'rescue_eevee',
    title: 'Rescuing Eavie',
    lines: [
      {
        speakerName: 'Eavie',
        speakerSpeciesId: 'eevee',
        emotion: 'happy',
        text: 'Vee-vee! The neighborhood bicycle was pedaling out of control with me in the basket!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Eavie\'s multi-element occult magic is on our side! Dear is down the cul-de-sac!',
      },
    ],
    onCompleteUnlockStuffyId: 'eevee',
    onCompleteUnlockSectorIds: [83, 84],
  },

  // 20. Rescuing Dear (Sector 84 - Suburb Cul-de-Sac)
  rescue_dear: {
    id: 'rescue_dear',
    title: 'Rescuing Dear',
    lines: [
      {
        speakerName: 'Dear',
        speakerSpeciesId: 'dear',
        emotion: 'happy',
        text: 'Thank goodness! The clockwork police cars had me boxed in on the sidewalk!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Dear\'s gentle grace and soothing presence will restore our team\'s spirits! The adventure playground is ahead—Cole is on the jungle gym!',
      },
    ],
    onCompleteUnlockStuffyId: 'dear',
    onCompleteUnlockSectorIds: [85, 86],
  },

  // 21. Rescuing Cole (Sector 86 - Playground Jungle Gym)
  rescue_cole: {
    id: 'rescue_cole',
    title: 'Rescuing Cole',
    lines: [
      {
        speakerName: 'Cole',
        speakerSpeciesId: 'cole',
        emotion: 'happy',
        text: 'Punch through! I was holding down the top rung against a pack of toy bullies!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Cole\'s fiery knuckles pack serious punch! Henry is trapped at the top of the giant spiral slide!',
      },
    ],
    onCompleteUnlockStuffyId: 'cole',
    onCompleteUnlockSectorIds: [87, 88],
  },

  // 22. Rescuing Henry (Sector 88 - Mega Spiral Slide)
  rescue_henry: {
    id: 'rescue_henry',
    title: 'Rescuing Henry',
    lines: [
      {
        speakerName: 'Henry',
        speakerSpeciesId: 'henry',
        emotion: 'happy',
        text: 'Steady and true! I stood guard against the sliding wind gusts!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Henry\'s steadfast courage inspires us all! The thread sky bridge is opening up into the Astral realm! Pinky Bear is across the Star Bridge!',
      },
    ],
    onCompleteUnlockStuffyId: 'henry',
    onCompleteUnlockSectorIds: [91, 92],
  },

  // 23. Rescuing Pinky Bear (Sector 92 - Astral Star Bridge)
  rescue_pinky_bear: {
    id: 'rescue_pinky_bear',
    title: 'Rescuing Pinky Bear',
    lines: [
      {
        speakerName: 'Pinky Bear',
        speakerSpeciesId: 'pinky_bear',
        emotion: 'happy',
        text: 'Big warm bear hug! The cosmic winds were trying to blow my soft pink fluff away!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Pinky Bear is safe! Up ahead on the glowing Nebula Spire, Big Bear is battling cosmic fiends!',
      },
    ],
    onCompleteUnlockStuffyId: 'pinky_bear',
    onCompleteUnlockSectorIds: [95, 96],
  },

  // 24. Rescuing Big Bear (Sector 96 - Astral Nebula Spire)
  rescue_big_bear: {
    id: 'rescue_big_bear',
    title: 'Rescuing Big Bear',
    lines: [
      {
        speakerName: 'Big Bear',
        speakerSpeciesId: 'big_bear',
        emotion: 'happy',
        text: 'ROOOAAAR! Jefe! Together we smashed through the celestial needle traps!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Big Bear\'s colossal strength is with us! Only one plushie remains before the Stitchmaster: Umbreon guards the Citadel Gates!',
      },
    ],
    onCompleteUnlockStuffyId: 'big_bear',
    onCompleteUnlockSectorIds: [98, 99],
  },

  // 25. Rescuing Umbratail (Citadel Gates)
  rescue_umbreon: {
    id: 'rescue_umbreon',
    title: 'Rescuing Umbratail',
    lines: [
      {
        speakerName: 'Umbratail',
        speakerSpeciesId: 'umbreon',
        emotion: 'happy',
        text: 'The moonlight rings glow brightly once more! You rescued all 25 of us, Jefe... all across the backyard, Necak\'s house, the apartments, the wild forest, the beach, and the ocean!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'All 26 plush friends are united at last! Behind these obsidian doors lies Sector 540: The Stitchmaster\'s Citadel! Let\'s end this together!',
      },
    ],
    onCompleteUnlockStuffyId: 'umbreon',
    onCompleteUnlockSectorIds: [540],
  },

  // Grand Finale: Sector 540 (The Stitchmaster's Citadel)
  finale_stitchmaster: {
    id: 'finale_stitchmaster',
    title: 'Episode Finale: The Restoration of Ben\'s Plushies',
    lines: [
      {
        speakerName: 'The Stitchmaster',
        emotion: 'surprised',
        text: 'Impossible... 27 united plushies, armed with high-star cards, sacred Espers, and master equipment... my thread kingdom is unraveling!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'We are Ben\'s plushies! Our bond can never be torn apart by needles or thread!',
      },
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: '✨ VICTORY! The cosmic threads dissolve into gentle golden warmth. All 27 plush friends return safely home to Ben\'s bedroom!',
      },
    ],
  },

  // --- NARRATIVE REVISIT EPISODES ---
  revisit_house_1: {
    id: 'revisit_house_1',
    title: 'Chapter Revisit: The Bedroom Closet Secret',
    lines: [
      {
        speakerName: 'Shade',
        speakerSpeciesId: 'shadow',
        emotion: 'happy',
        text: 'Jefe! My mist claws slid right into the closet door latch! Look what was hidden under Ben\'s old shoebox...',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'surprised',
        text: 'The heavy iron key to the backyard workshop shed! Finlee must be locked inside there!',
      },
    ],
  },

  // 29 Chapter Revisits across the 540-sector outdoor adventure
  revisit_1: {
    id: 'revisit_1',
    title: 'Chapter Revisit 1: The Closet Secret Key',
    lines: [
      { speakerName: 'Shade', speakerSpeciesId: 'shadow', emotion: 'happy', text: 'Shhh... using my shadow claws, I slipped behind the bedroom dresser!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'surprised', text: 'The heavy iron key to the backyard workshop shed! Finlee must be locked inside there!' },
    ],
  },
  revisit_2: {
    id: 'revisit_2',
    title: 'Chapter Revisit 2: Lawn Sprinkler Ambush',
    lines: [
      { speakerName: 'Finlee', speakerSpeciesId: 'finlee', emotion: 'happy', text: 'Splash! I used the high-pressure hose to short-circuit the sprinkler bots!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Great job, Finlee! Now we can safely reach the apartment breezeway for Slugmee!' },
    ],
  },
  revisit_3: {
    id: 'revisit_3',
    title: 'Chapter Revisit 3: Workshop Anvil Test',
    lines: [
      { speakerName: 'Spike', speakerSpeciesId: 'spike', emotion: 'happy', text: 'With the Star Lab unlocked at Necak\'s house, we can forge hardened rivets on this anvil!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Our squad gear is growing noticeably tougher. Now let\'s find Spot on Necak\'s patio!' },
    ],
  },
  revisit_4: {
    id: 'revisit_4',
    title: 'Chapter Revisit 4: Fairy Well Star Springs',
    lines: [
      { speakerName: 'Cow', speakerSpeciesId: 'cow', emotion: 'happy', text: 'Mooo! The enchanted birdbath spring recognizes our bond! Espers are overflowing!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Sacrificing duplicate cards here will empower our stats forever. Time to invade the high-rise apartments!' },
    ],
  },
  revisit_5: {
    id: 'revisit_5',
    title: 'Chapter Revisit 5: Kitchen Pantry Ration Run',
    lines: [
      { speakerName: 'Cow', speakerSpeciesId: 'cow', emotion: 'happy', text: 'Mooo! Fresh crackers stored in the top pantry cabinet! Eating these restores our vitality!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Stock up on provisions, team! Cydney is holding out high up on the apartment balconies!' },
    ],
  },
  revisit_6: {
    id: 'revisit_6',
    title: 'Chapter Revisit 6: Necak Hay Bale Fortification',
    lines: [
      { speakerName: 'Cidney', speakerSpeciesId: 'cidney', emotion: 'happy', text: 'I stacked the golden hay bales into a trampoline! We can launch straight over the hedge!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Chantiera\'s voice is echoing from the upper floors. Let\'s vault into the elevator shaft!' },
    ],
  },
  revisit_7: {
    id: 'revisit_7',
    title: 'Chapter Revisit 7: Necak Star Telescope',
    lines: [
      { speakerName: 'Chanteira', speakerSpeciesId: 'chanteira', emotion: 'happy', text: 'La-la-la! Looking through the telescope lens, the Wild Forest looks thick with purple fog!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'surprised', text: 'And beyond that... the ocean waves of Upgel Didav! We need to push forward!' },
    ],
  },
  revisit_8: {
    id: 'revisit_8',
    title: 'Chapter Revisit 8: Secret Shrub Path',
    lines: [
      { speakerName: 'Slugmee', speakerSpeciesId: 'slugmee', emotion: 'happy', text: 'My slime dissolved the thorny blackberry thicket along the garden edge!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'A direct shortcut between the yard and the forest. Good eye, Slugmee!' },
    ],
  },
  revisit_9: {
    id: 'revisit_9',
    title: 'Chapter Revisit 9: Fire Escape Shortcut',
    lines: [
      { speakerName: 'Cidney', speakerSpeciesId: 'cidney', emotion: 'happy', text: 'The metal stairs clattered open! We have a clear view down into the ocean shoals!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Dolphy is trapped in the sunken city of Upgel Didav. Dive in, team!' },
    ],
  },
  revisit_10: {
    id: 'revisit_10',
    title: 'Chapter Revisit 10: Attic Trapdoor Clue',
    lines: [
      { speakerName: 'Dolphy', speakerSpeciesId: 'dolphy', emotion: 'happy', text: 'Eee-eee! I bounced up to the ceiling hatch! There\'s a nautical map pinned here!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'The map shows Allie stranded on the golden beach sands. To the shoreline!' },
    ],
  },
  revisit_11: {
    id: 'revisit_11',
    title: 'Chapter Revisit 11: Forest Mossy Boulder Cache',
    lines: [
      { speakerName: 'Allie', speakerSpeciesId: 'allie', emotion: 'happy', text: 'I blasted the moss off this ancient boulder with a water stream! Look what was hidden inside!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'A cache of rare card upgrades! Sluger is deeper in the canyon creek ahead!' },
    ],
  },
  revisit_12: {
    id: 'revisit_12',
    title: 'Chapter Revisit 12: Beach Driftwood Fort',
    lines: [
      { speakerName: 'Alex', speakerSpeciesId: 'alex', emotion: 'happy', text: 'I stacked driftwood logs into a beach barrier! The sand crabs can\'t flank us now!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Solid work, Alex! Let\'s circle back and reinforce Sluger!' },
    ],
  },
  revisit_13: {
    id: 'revisit_13',
    title: 'Chapter Revisit 13: Needle Sharpening',
    lines: [
      { speakerName: 'Sluger', speakerSpeciesId: 'sluger', emotion: 'happy', text: 'My hardened shell can grind steel! We sharpened all the sewing needles in Finlee\'s armory!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Our squad piercing power is maxed out. Fifi is trapped up in the canopy grove!' },
    ],
  },
  revisit_14: {
    id: 'revisit_14',
    title: 'Chapter Revisit 14: Coral Beacon Light',
    lines: [
      { speakerName: 'Fifi', speakerSpeciesId: 'fifi', emotion: 'happy', text: '*Pfffft!* My sulfur mist ignited the deep sea coral torches in Upgel Didav!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'The whole underwater city is illuminated! And look, a picnic table on the forest ridge has rustling!' },
    ],
  },
  revisit_15: {
    id: 'revisit_15',
    title: 'Chapter Revisit 15: Forest Hollow Stump Stash',
    lines: [
      { speakerName: 'Joann', speakerSpeciesId: 'joann', emotion: 'happy', text: '*Purrr!* I shoved my paw down this hollow oak stump and hooked a bag of shiny loot!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Cats always find the best hiding spots! George is signaling from the pine spire ahead!' },
    ],
  },
  revisit_16: {
    id: 'revisit_16',
    title: 'Chapter Revisit 16: Windmill Signal',
    lines: [
      { speakerName: 'George', speakerSpeciesId: 'george', emotion: 'happy', text: 'Ooh ooh! I climbed Necak\'s windmill vanes and turned them toward the beach umbrellas!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Rialou spotted the spinning windmill! Let\'s go rescue our martial arts friend!' },
    ],
  },
  revisit_17: {
    id: 'revisit_17',
    title: 'Chapter Revisit 17: Apartment Antenna Array',
    lines: [
      { speakerName: 'Ralou', speakerSpeciesId: 'riolu', emotion: 'happy', text: 'My aura radar tapped into the rooftop TV antennas! Thumper\'s thumping rhythm is coming from the tide pools!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Follow that seismic rhythm! To the rocky tidal shallows!' },
    ],
  },
  revisit_18: {
    id: 'revisit_18',
    title: 'Chapter Revisit 18: Beach Pearl Shallows',
    lines: [
      { speakerName: 'Thumper', speakerSpeciesId: 'thumper', emotion: 'happy', text: '*Thump-thump!* My foot-drum vibrations knocked luminous pearls out of the sand oysters!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'These pearls will light our way into the pitch-black bioluminescent oceanic trenches!' },
    ],
  },
  revisit_19: {
    id: 'revisit_19',
    title: 'Chapter Revisit 19: Submerged Coral Shelf',
    lines: [
      { speakerName: 'Lessteeth', speakerSpeciesId: 'toothless', emotion: 'happy', text: 'Rwaaaar! Plasma breath warmed up the icy undersea current!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Now we can plunge into the deepest abyss where Beaker is running experiments!' },
    ],
  },
  revisit_20: {
    id: 'revisit_20',
    title: 'Chapter Revisit 20: Starlight Font Blessing',
    lines: [
      { speakerName: 'Beaker', speakerSpeciesId: 'beaker', emotion: 'happy', text: 'Meep meep! Adding stardust extract into the Fairy Well caused an explosion of magical foam!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Our team\'s max stats feel like they just soared! Time to cross into Oak Avenue for Eavie!' },
    ],
  },
  revisit_21: {
    id: 'revisit_21',
    title: 'Chapter Revisit 21: Ben\'s Desk Drawer',
    lines: [
      { speakerName: 'Eavie', speakerSpeciesId: 'eevee', emotion: 'happy', text: 'Vee-vee! Inside Ben\'s top desk drawer, I found his secret stash of golden stickers!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Ben loved placing these on our stuffing tags! Dear is waiting in the cul-de-sac!' },
    ],
  },
  revisit_22: {
    id: 'revisit_22',
    title: 'Chapter Revisit 22: Autumn Leaf Pile',
    lines: [
      { speakerName: 'Dear', speakerSpeciesId: 'dear', emotion: 'happy', text: 'Rustle rustle! Sleeping inside this giant pile of oak leaves completely refreshed my stamina!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Everyone take a quick breather! The Adventure Playground courtyard is right around the corner!' },
    ],
  },
  revisit_23: {
    id: 'revisit_23',
    title: 'Chapter Revisit 23: Backyard Shade Trial',
    lines: [
      { speakerName: 'Shade', speakerSpeciesId: 'shadow', emotion: 'happy', text: 'In the garden darkness, I tested Cole\'s battle resolve! He has the heart of a lion!' },
      { speakerName: 'Cole', speakerSpeciesId: 'cole', emotion: 'happy', text: 'Rawr! I am ready to swing across the jungle gyms and slide towers!' },
    ],
  },
  revisit_24: {
    id: 'revisit_24',
    title: 'Chapter Revisit 24: Spiral Slide Patrol',
    lines: [
      { speakerName: 'Cole', speakerSpeciesId: 'cole', emotion: 'happy', text: 'Wheee! Sliding down the giant corkscrew knocked out all the patrolling wind-up toys!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Henry is hanging from the highest monkey bars! Climb up, team!' },
    ],
  },
  revisit_25: {
    id: 'revisit_25',
    title: 'Chapter Revisit 25: Laundry Chute Tunnel',
    lines: [
      { speakerName: 'Henry', speakerSpeciesId: 'henry', emotion: 'happy', text: 'Down the chute we go! That connects all 15 floors of the apartments straight to the lawn!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'We have conquered the earthly realm! Look above—the Astral Bridge has materialized in the night sky!' },
    ],
  },
  revisit_26: {
    id: 'revisit_26',
    title: 'Chapter Revisit 26: Abyssal Rift Tremor',
    lines: [
      { speakerName: 'Dolphy', speakerSpeciesId: 'dolphy', emotion: 'happy', text: 'The ocean tectonic plates are humming in sync with the celestial stars above!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'The cosmic threads are pulling us upward. Pinky Bear is waiting on the Nebula Spire!' },
    ],
  },
  revisit_27: {
    id: 'revisit_27',
    title: 'Chapter Revisit 27: Whispering Pines Crest',
    lines: [
      { speakerName: 'Pinky Bear', speakerSpeciesId: 'pinky_bear', emotion: 'happy', text: 'Pink sparkles everywhere! From the tallest pine tree, I can see Big Bear glowing on the pillars!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'We are so close to reuniting the entire plush family! Advance to Big Bear!' },
    ],
  },
  revisit_28: {
    id: 'revisit_28',
    title: 'Chapter Revisit 28: Moonlit Dune Sentinel',
    lines: [
      { speakerName: 'Big Bear', speakerSpeciesId: 'big_bear', emotion: 'happy', text: 'ROAAAR! My heavy footsteps shook the moonlight right into the sand! Umbratail stands guard at the Citadel gates!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Umbratail is the final plush guardian! Let\'s break through to the Stitchmaster!' },
    ],
  },
  revisit_29: {
    id: 'revisit_29',
    title: 'Chapter Revisit 29: The Grand Plush Assembly',
    lines: [
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'Look at us... all 26 plushies, gathered together in Ben\'s room where our journey started!' },
      { speakerName: 'Umbratail', speakerSpeciesId: 'umbreon', emotion: 'happy', text: 'The shadows hold no fear when we stand together. Sector 540 awaits!' },
      { speakerName: 'Jefe', speakerSpeciesId: 'jefe', emotion: 'happy', text: 'For Ben, and for every stuffed toy in the world... CHARGE THE STITCHMASTER!' },
    ],
  },

  // ==========================================
  // V4.3 "THE SECOND COMING" CINEMATIC CUTSCENES
  // ==========================================

  // Part 1 Climax: Defeating the Fabric Behemoth (Sector 528)
  cutscene_part1_climax: {
    id: 'cutscene_part1_climax',
    title: 'Part 1 Finale: The Ridge Gate Shatters',
    subtitle: 'Act I Climax • Moving onto Part 2: Beyond the Horizon',
    isCinematic: true,
    cutsceneType: 'part_complete',
    onCompleteUnlockPart: 2,
    lines: [
      {
        speakerName: 'Narrator',
        emotion: 'surprised',
        text: 'The Fabric Behemoth lets out a shuddering unraveling sigh! Yards of tangled purple lint dissolve into glowing stardust.',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'We did it! Sector 528 is liberated! Look ahead past the backyard ridge—the horizon stretches endlessly into the distance!',
      },
      {
        speakerName: 'Alex',
        speakerSpeciesId: 'alex',
        emotion: 'happy',
        text: 'Durrp... My mind radar feels huge waves and ancient wild forests calling. Part 2 is now open!',
      },
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: 'PART 1 CLEARED! You can now freely advance into Part 2: Beyond the Horizon, or return to Part 1 at any time to explore!',
      },
    ],
  },

  // Part 2 Intro (Sector 540)
  cutscene_part2_intro: {
    id: 'cutscene_part2_intro',
    title: 'Part 2: Beyond the Horizon',
    subtitle: 'Wild Thickets & Ocean Abysses Await',
    isCinematic: true,
    cutsceneType: 'intro',
    lines: [
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'surprised',
        text: 'The air smells of pine needles and salty sea spray. Our companions are scattered across these vast 528 sectors of wilderness!',
      },
      {
        speakerName: 'Cow',
        speakerSpeciesId: 'cow',
        emotion: 'happy',
        text: 'Mooo! I smell sweet clover and fresh dew. Keep your guard up, team—the Stitchmaster has placed elite puppet guardians ahead.',
      },
    ],
  },

  // Part 2 Climax: The Stuffed Amalgam (Sector 1056 - 33 Sector Missions Milestone)
  cutscene_part2_climax: {
    id: 'cutscene_part2_climax',
    title: 'Part 2 Finale: The Stuffed Amalgam Falls',
    subtitle: '33 Sector Missions Climax • Moving onto Part 3: Depths of the Unknown',
    isCinematic: true,
    cutsceneType: 'part_complete',
    onCompleteUnlockPart: 3,
    lines: [
      {
        speakerName: 'Narrator',
        emotion: 'surprised',
        text: 'After 33 sector missions across the lands, the colossal Stuffed Amalgam—the legendary fused monstrosity from the main game—erupts from the stitching rift with a terrifying roar!',
      },
      {
        speakerName: 'Chanteira',
        speakerSpeciesId: 'chanteira',
        emotion: 'happy',
        text: 'We shattered the Amalgam\'s dark seams! The fused nightmare has broken apart into loose fluff and pure starlight!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: '33 missions conquered and the main game titan is defeated! A glowing path of streetlights and neon signs illuminates Part 3: Depths of the Unknown!',
      },
    ],
  },

  // Part 3 Intro (Sector 1070)
  cutscene_part3_intro: {
    id: 'cutscene_part3_intro',
    title: 'Part 3: Depths of the Unknown',
    subtitle: 'Avenues, Playgrounds & Caverns',
    isCinematic: true,
    cutsceneType: 'intro',
    lines: [
      {
        speakerName: 'Shade',
        speakerSpeciesId: 'shadow',
        emotion: 'neutral',
        text: 'These quiet suburban streets and dark crystal tunnels reek of psychological traps. Stay sharp.',
      },
      {
        speakerName: 'George',
        speakerSpeciesId: 'george',
        emotion: 'happy',
        text: 'Eight arms ready for whatever comes! Let us bring every last plush home!',
      },
    ],
  },

  // Part 3 Climax: The Puppet Ringmaster (Sector 1584)
  cutscene_part3_climax: {
    id: 'cutscene_part3_climax',
    title: 'Part 3 Finale: The Carnival Lights Dim',
    subtitle: 'Act III Climax • Moving onto Part 4: The Ancient Shadows',
    isCinematic: true,
    cutsceneType: 'part_complete',
    onCompleteUnlockPart: 4,
    lines: [
      {
        speakerName: 'Narrator',
        emotion: 'surprised',
        text: 'The Puppet Ringmaster snaps its strings with a hollow clatter! The carnival illusion shatters, unveiling an ancient spiral staircase rising into the clouds!',
      },
      {
        speakerName: 'Cole',
        speakerSpeciesId: 'cole',
        emotion: 'happy',
        text: 'We crushed their circus tricks! Look up—sky islands and burning volcanic ridges await above!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Ascend the clockwork spire! Part 4: The Ancient Shadows is now open!',
      },
    ],
  },

  // Part 4 Intro (Sector 1600)
  cutscene_part4_intro: {
    id: 'cutscene_part4_intro',
    title: 'Part 4: The Ancient Shadows',
    subtitle: 'Floating Sky Islands & Volcanic Ridges',
    isCinematic: true,
    cutsceneType: 'intro',
    lines: [
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'surprised',
        text: 'The air is thin and hot. Below us are endless clouds, and ahead are floating basalt crags and molten spires.',
      },
      {
        speakerName: 'Pinky Bear',
        speakerSpeciesId: 'pinky_bear',
        emotion: 'worried',
        text: 'Heavy thumping footsteps echo across the floating rocks... Someone really big is trapped here!',
      },
    ],
  },

  // Rescue Tyrant (Sector 2040)
  cutscene_rescue_tyrant: {
    id: 'cutscene_rescue_tyrant',
    title: 'Rescuing Tyrant the Prehistoric Dino',
    subtitle: 'Thump & Jump Unleashed!',
    isCinematic: true,
    cutsceneType: 'rescue',
    onCompleteUnlockStuffyId: 'tyrant',
    lines: [
      {
        speakerName: 'Tyrant',
        speakerSpeciesId: 'tyrant',
        emotion: 'angry',
        text: 'ROOOAAARRR! STOMP! JUMP! THUMP! You think some flimsy enchanted purple threads can hold a T-Rex plush?!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Tyrant! Watch out, don\'t knock down the cliff! We just beat the volcanic sentinels holding your cage!',
      },
      {
        speakerName: 'Tyrant',
        speakerSpeciesId: 'tyrant',
        emotion: 'happy',
        text: 'Haha! Good little penguin! I like your style! Hand me a meatball sub and let\'s go thump and jump some puppet goons together!',
      },
    ],
  },

  // Part 4 Climax: Prehistoric Volcanic Titan (Sector 2112)
  cutscene_part4_climax: {
    id: 'cutscene_part4_climax',
    title: 'Part 4 Finale: The Second Coming Awakens',
    subtitle: 'Act IV Climax • Moving onto Part 5: The Second Coming',
    isCinematic: true,
    cutsceneType: 'part_complete',
    onCompleteUnlockPart: 5,
    lines: [
      {
        speakerName: 'Narrator',
        emotion: 'surprised',
        text: 'The Volcanic Titan collapses into cooled obsidian! A cosmic star rift tears open across the heavens, resonating with mythological frequencies.',
      },
      {
        speakerName: 'Tyrant',
        speakerSpeciesId: 'tyrant',
        emotion: 'happy',
        text: 'THAT WAS A REAL BATTLE! But feel that rumble in the fabric realm... The ancient legends are stirring!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'surprised',
        text: 'The Second Coming has begun! Unicorn, Grumpy Rhino, Farty Lama, and the Dolphin Pod are waiting for us in Part 5!',
      },
    ],
  },

  // Part 5 Intro: The Second Coming (Sector 2125)
  cutscene_part5_intro: {
    id: 'cutscene_part5_intro',
    title: 'Part 5: The Second Coming',
    subtitle: 'The Final March to the Astral Citadel',
    isCinematic: true,
    cutsceneType: 'intro',
    lines: [
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'This is it, squad. The final 528 sectors. The rarest and most legendary plushies of Ben\'s collection are held here.',
      },
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: 'Prismatic starlight and deep ocean frequencies harmonize across the astral void. The Second Coming of the stuffed is at hand.',
      },
    ],
  },

  // Rescue Dolpher (Sector 2270)
  cutscene_rescue_dolpher: {
    id: 'cutscene_rescue_dolpher',
    title: 'Rescuing Dolpher the Grey Matriarch',
    subtitle: 'The Ocean Elder Reunited',
    isCinematic: true,
    cutsceneType: 'rescue',
    onCompleteUnlockStuffyId: 'dolpher',
    lines: [
      {
        speakerName: 'Dolpher',
        speakerSpeciesId: 'dolpher',
        emotion: 'happy',
        text: '*Gentle ultrasonic whistle* Ah... Little Jefe and companions. You have navigated many treacherous waters to find me.',
      },
      {
        speakerName: 'Dolphy',
        speakerSpeciesId: 'dolphy',
        emotion: 'happy',
        text: 'Dolpher! The pod matriarch is safe! Our ocean waves will be unstoppable now!',
      },
      {
        speakerName: 'Dolpher',
        speakerSpeciesId: 'dolpher',
        emotion: 'happy',
        text: 'My pod protective barriers are yours. But we must hurry—Dolphim was carried towards the deep resonant reefs ahead.',
      },
    ],
  },

  // Rescue Dolphim (Sector 2350)
  cutscene_rescue_dolphim: {
    id: 'cutscene_rescue_dolphim',
    title: 'Rescuing Dolphim the Smart Dolphin',
    subtitle: 'High-IQ Calculations Join the Squad',
    isCinematic: true,
    cutsceneType: 'rescue',
    onCompleteUnlockStuffyId: 'dolphim',
    lines: [
      {
        speakerName: 'Dolphim',
        speakerSpeciesId: 'dolphim',
        emotion: 'surprised',
        text: 'Click-click! By my calculations, your arrival probability was approximately 97.4%, but your battle efficiency exceeded models by 14%!',
      },
      {
        speakerName: 'Dolpher',
        speakerSpeciesId: 'dolpher',
        emotion: 'happy',
        text: 'Always calculating trajectories, little Dolphim. We are glad you are unharmed.',
      },
      {
        speakerName: 'Dolphim',
        speakerSpeciesId: 'dolphim',
        emotion: 'happy',
        text: 'Integrating my genius sonar prediction matrix into the party. Enemy attack patterns will be child\'s play!',
      },
    ],
  },

  // Rescue Grumpy Rhino (Sector 2430)
  cutscene_rescue_grumpy_rhino: {
    id: 'cutscene_rescue_grumpy_rhino',
    title: 'Rescuing Grumpy Rhino',
    subtitle: 'The Bad-Tempered Tank Joins the Fray',
    isCinematic: true,
    cutsceneType: 'rescue',
    onCompleteUnlockStuffyId: 'grumpy_rhino',
    lines: [
      {
        speakerName: 'Grumpy Rhino',
        speakerSpeciesId: 'grumpy_rhino',
        emotion: 'angry',
        text: 'HRRRUMPH! What took you so long?! This basalt cage was completely unpadded and giving me neck cramps!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'surprised',
        text: 'Uh... you\'re welcome? We just fought through 8 floors of elite sentinels to free you!',
      },
      {
        speakerName: 'Grumpy Rhino',
        speakerSpeciesId: 'grumpy_rhino',
        emotion: 'neutral',
        text: 'Fine, fine. I\'m still grumpy. But nobody touches my plush friends! Point me at the enemies and I\'ll trample them flat!',
      },
    ],
  },

  // Rescue Farty Lama (Sector 2510)
  cutscene_rescue_farty_lama: {
    id: 'cutscene_rescue_farty_lama',
    title: 'Rescuing Farty Lama',
    subtitle: 'Fortnite Pinata Gas Explosion!',
    isCinematic: true,
    cutsceneType: 'rescue',
    onCompleteUnlockStuffyId: 'farty_lama',
    lines: [
      {
        speakerName: 'Farty Lama',
        speakerSpeciesId: 'farty_lama',
        emotion: 'happy',
        text: '*PFFFFFTTT!* WOOO! Fresh air and victory confetti! Free at last from the Stitchmaster\'s supply drop lockbox!',
      },
      {
        speakerName: 'Fifi',
        speakerSpeciesId: 'fifi',
        emotion: 'happy',
        text: '*Sniff sniff* That unmistakable aroma... Another connoisseur of tactical gastrointestinal warfare!',
      },
      {
        speakerName: 'Farty Lama',
        speakerSpeciesId: 'farty_lama',
        emotion: 'happy',
        text: 'You bet, Fifi! Fortnite llama power combined with pure plush stench! Crackers and gas for everyone, let\'s get that Victory Royale!',
      },
    ],
  },

  // Rescue Unicorn (Sector 2590)
  cutscene_rescue_unicorn: {
    id: 'cutscene_rescue_unicorn',
    title: 'Rescuing Unicorn the Prismatic Wonder',
    subtitle: 'The Rainbow Horn of Cleansing',
    isCinematic: true,
    cutsceneType: 'rescue',
    onCompleteUnlockStuffyId: 'unicorn',
    lines: [
      {
        speakerName: 'Unicorn',
        speakerSpeciesId: 'unicorn',
        emotion: 'happy',
        text: 'Neigh! The dark threads shatter before the light of friendship! Thank you, brave plush vanguard!',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'Unicorn! Your rainbow horn, pink hooves, and purple mane are completely restored!',
      },
      {
        speakerName: 'Unicorn',
        speakerSpeciesId: 'unicorn',
        emotion: 'happy',
        text: 'With my Prismatic Radiance, no debuff or darkness shall touch our team. The path to Sector 2640 and the Stitchmaster\'s Citadel is clear!',
      },
    ],
  },

  // Grand Citadel Finale (Sector 2640)
  cutscene_citadel_finale: {
    id: 'cutscene_citadel_finale',
    title: 'Grand Finale: The Second Coming Victorious',
    subtitle: 'All 33 Plushies Reunited in Ben\'s Room',
    isCinematic: true,
    cutsceneType: 'citadel_finale',
    lines: [
      {
        speakerName: 'Narrator',
        emotion: 'surprised',
        text: 'The Stitchmaster\'s celestial looms collapse into a radiant cascade of golden sequins and soft white stuffing! The astral enchantment dissolves.',
      },
      {
        speakerName: 'Jefe',
        speakerSpeciesId: 'jefe',
        emotion: 'happy',
        text: 'WE WON! Look—all 5 parts, all 2,640 sectors are free! The front door of the house is swinging gently open.',
      },
      {
        speakerName: 'Tyrant',
        speakerSpeciesId: 'tyrant',
        emotion: 'happy',
        text: 'THUMP AND JUMP ALL THE WAY BACK TO BEN\'S BEDROOM! VICTORY FEAST TIME!',
      },
      {
        speakerName: 'Unicorn',
        speakerSpeciesId: 'unicorn',
        emotion: 'happy',
        text: 'Rainbow sparkles rain across all 33 companions. Every seam is strong, every heart is full.',
      },
      {
        speakerName: 'Narrator',
        emotion: 'neutral',
        text: 'CONGRATULATIONS! You have completed Version 4.3 "The Second Coming Update", conquering all 5 parts and reuniting the ultimate stuffy army!',
      },
    ],
  },
};

// Aliases ensuring all 32 rescue cutscenes and chapter intros trigger seamlessly from story missions
STORY_DIALOGUE_EPISODES['cutscene_part1_intro'] = STORY_DIALOGUE_EPISODES['intro_house'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_alex'] = STORY_DIALOGUE_EPISODES['rescue_alex'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_shadow'] = STORY_DIALOGUE_EPISODES['rescue_shadow'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_finlee'] = STORY_DIALOGUE_EPISODES['milestone_armory'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_slugmee'] = STORY_DIALOGUE_EPISODES['rescue_slugmee'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_spike'] = STORY_DIALOGUE_EPISODES['rescue_spike'] || STORY_DIALOGUE_EPISODES['milestone_lab'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_spot'] = STORY_DIALOGUE_EPISODES['rescue_spot'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_cow'] = STORY_DIALOGUE_EPISODES['rescue_cow'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_cidney'] = STORY_DIALOGUE_EPISODES['rescue_cydney'] || STORY_DIALOGUE_EPISODES['milestone_fairy_well'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_chanteira'] = STORY_DIALOGUE_EPISODES['rescue_chantiera'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_allie'] = STORY_DIALOGUE_EPISODES['rescue_allie'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_sluger'] = STORY_DIALOGUE_EPISODES['rescue_sluger'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_fifi'] = STORY_DIALOGUE_EPISODES['rescue_fifi'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_joann'] = STORY_DIALOGUE_EPISODES['rescue_joann'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_george'] = STORY_DIALOGUE_EPISODES['rescue_george'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_riolu'] = STORY_DIALOGUE_EPISODES['rescue_riolu'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_thumper'] = STORY_DIALOGUE_EPISODES['rescue_thumper'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_toothless'] = STORY_DIALOGUE_EPISODES['rescue_toothless'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_beaker'] = STORY_DIALOGUE_EPISODES['rescue_beaker'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_eevee'] = STORY_DIALOGUE_EPISODES['rescue_eevee'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_dear'] = STORY_DIALOGUE_EPISODES['rescue_dear'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_cole'] = STORY_DIALOGUE_EPISODES['rescue_cole'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_henry'] = STORY_DIALOGUE_EPISODES['rescue_henry'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_pinky_bear'] = STORY_DIALOGUE_EPISODES['rescue_pinky_bear'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_big_bear'] = STORY_DIALOGUE_EPISODES['rescue_big_bear'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_umbreon'] = STORY_DIALOGUE_EPISODES['rescue_umbreon'];
STORY_DIALOGUE_EPISODES['cutscene_rescue_dolphy'] = STORY_DIALOGUE_EPISODES['rescue_dolphy'];

