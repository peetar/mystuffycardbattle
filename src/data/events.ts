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
    "id": "dusty_attic_toybox",
    "title": "The Forgotten Toybox",
    "description": "You stumble upon a vintage wooden chest tucked under warm blankets. Soft giggles and muffled squeaks echo from inside.",
    "icon": "📦",
    "choices": [
      {
        "text": "Rummage inside for treasures",
        "consequence": "Found crisp paper bills and loose buttons! (+45 Stuffydolars)",
        "action": "gain_gold",
        "value": 45
      },
      {
        "text": "Rest with the antique plushies",
        "consequence": "The warm embrace restores fluff to your party. (+25% Team Heal)",
        "action": "heal_team",
        "value": 25
      }
    ]
  },
  {
    "id": "grandmas_sewing_kit",
    "title": "Grandma's Sewing Basket",
    "description": "A colossal woven basket filled with colorful yarn spools, silver thimbles, and shiny needles stands before your squad.",
    "icon": "🧵",
    "choices": [
      {
        "text": "Use fine silk thread to patch up your cards",
        "consequence": "Reinforced stitches upgrade your cards to higher potency!",
        "action": "upgrade_random"
      },
      {
        "text": "Sew extra fluff into all stuffies",
        "consequence": "All stuffies feel snug, fresh, and healed! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      }
    ]
  },
  {
    "id": "snack_cabinet_raid",
    "title": "Midnight Pantry Raid",
    "description": "The kitchen pantry door was left slightly ajar! The scent of honey graham crackers wafts through the darkness.",
    "icon": "🍪",
    "choices": [
      {
        "text": "Raid the cracker box!",
        "consequence": "Scored an enormous stash of snacks! (+60 Stuffydolars)",
        "action": "gain_gold",
        "value": 60
      },
      {
        "text": "Sneak past carefully without noise",
        "consequence": "Safe and sound. You find an emergency needle card.",
        "action": "gain_card"
      }
    ]
  },
  {
    "id": "sofa_cushion_abyss",
    "title": "The Sofa Cushion Abyss",
    "description": "A terrifying dark chasm between two plush velvet couch cushions. Rumor says lost treasures and forgotten remotes sleep here.",
    "icon": "🛋️",
    "choices": [
      {
        "text": "Dive deep into the crumbs and springs",
        "consequence": "Pocketed the sofa treasure! (+55 Stuffydolars)",
        "action": "gain_gold",
        "value": 55
      },
      {
        "text": "Fish around cautiously with a toy crane",
        "consequence": "Found a magical lost relic lodged in the foam!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "playroom_sandbox_ruins",
    "title": "The Sandbox Pyramid",
    "description": "In the center of the sandbox stands a towering castle sculpted by toddler hands. Plastic shovels stand like guardian monoliths.",
    "icon": "🏖️",
    "choices": [
      {
        "text": "Excavate the buried treasure chamber",
        "consequence": "Discovered shiny trinkets and dropped bills! (+50 Stuffydolars)",
        "action": "gain_gold",
        "value": 50
      },
      {
        "text": "Reinforce the castle walls",
        "consequence": "All stuffies gain +5 Max Fluff HP permanently!",
        "action": "max_hp_boost",
        "value": 5
      }
    ]
  },
  {
    "id": "closet_monster_negotiation",
    "title": "Shadow Under the Coat Rack",
    "description": "Two luminous button eyes blink in the closet gloom. A fluffy lint-beast extends a claw, but holds a velvet peace ribbon.",
    "icon": "👾",
    "choices": [
      {
        "text": "Share a secret handshake",
        "consequence": "The shadow monster gifts you a powerful spell card!",
        "action": "gain_card"
      },
      {
        "text": "Give up some spare stuffing (-10 HP to lead)",
        "consequence": "The beast blesses your party with a mystical relic!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "crayon_graffiti_shrine",
    "title": "The Wax Masterpiece",
    "description": "A bedroom wall covered in vivid green and magenta crayon scribbles. The colors seem to pulse with chaotic playful energy.",
    "icon": "🖍️",
    "choices": [
      {
        "text": "Channel the wild creative aura",
        "consequence": "A random card in your deck is upgraded with vibrant colors!",
        "action": "upgrade_random"
      },
      {
        "text": "Scrape off wax coin rubbings",
        "consequence": "Valuable artistic wax bills gathered! (+40 Stuffydolars)",
        "action": "gain_gold",
        "value": 40
      }
    ]
  },
  {
    "id": "secret_blanket_fortress",
    "title": "The Triple-Quilt Bastion",
    "description": "Four dining chairs and three thick flannel duvets form an impenetrable blanket citadel illuminated by string fairy lights.",
    "icon": "⛺",
    "choices": [
      {
        "text": "Take a restorative afternoon nap inside",
        "consequence": "Deep, uninterrupted sleep revives your entire party! (+50% Team Heal)",
        "action": "heal_team",
        "value": 50
      },
      {
        "text": "Recruit a sentry bunny stationed inside",
        "consequence": "The bunnies gladly share spare allowance. (+45 Stuffydolars)",
        "action": "gain_gold",
        "value": 45
      }
    ]
  },
  {
    "id": "bubble_bath_whirlpool",
    "title": "The Lavender Bubble Lagoon",
    "description": "Warm scented bubbles spill over the porcelain tub rim. Warm vapor fills the air with lavender and eucalyptus tranquility.",
    "icon": "🛁",
    "choices": [
      {
        "text": "Dip your cotton fibers into the warm suds",
        "consequence": "Fresh scent washes away all grime! (+30% Team Heal)",
        "action": "heal_team",
        "value": 30
      },
      {
        "text": "Pop the giant rainbow prism bubble",
        "consequence": "A rare prismatic battle card floats down into your hands!",
        "action": "gain_card"
      }
    ]
  },
  {
    "id": "wishing_well_piggybank",
    "title": "The Ceramic Porker Shrine",
    "description": "A heavy pink porcelain piggy bank sits atop the bookshelf altar with a coin slot that hums with ancient piggy wisdom.",
    "icon": "🐷",
    "choices": [
      {
        "text": "Toss in a lucky penny for ultimate endurance",
        "consequence": "Permanent +6 Max HP granted to all team stuffies!",
        "action": "max_hp_boost",
        "value": 6
      },
      {
        "text": "Gently shake the rubber stopper loose",
        "consequence": "Jackpot! Scored heavy bills and snack tokens! (+75 Stuffydolars)",
        "action": "gain_gold",
        "value": 75
      }
    ]
  },
  {
    "id": "dryer_lint_cyclone",
    "title": "The Tumbling Tempest",
    "description": "The laundry room dryer spins with thunderous rhythmic clunks. Inside, static sparks and fresh warm cotton float freely.",
    "icon": "🌀",
    "choices": [
      {
        "text": "Harvest the warm electrostatic fluff",
        "consequence": "Cozy static charge permanently raises all squad Max HP by +4!",
        "action": "max_hp_boost",
        "value": 4
      },
      {
        "text": "Leap in for a wild static tumble",
        "consequence": "Electrified tumble upgrades a card to maximum power!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "cardboard_space_station",
    "title": "Apollo Cardboard XI",
    "description": "A rocket ship assembled from appliance boxes, silver foil, and plastic cup thrusters sits ready on the rug launchpad.",
    "icon": "🚀",
    "choices": [
      {
        "text": "Hit the big red plastic button",
        "consequence": "Thrusters roar! You launch into orbit and discover an alien relic!",
        "action": "gain_relic"
      },
      {
        "text": "Study the star charts taped to the hull",
        "consequence": "Tactical celestial knowledge sharpens your deck! Card upgraded!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "clockwork_train_depot",
    "title": "The Brass Locomotive",
    "description": "A miniature electric train chugs around a wooden track. Its open freight cars are loaded with gumdrops and brass cogs.",
    "icon": "🚂",
    "choices": [
      {
        "text": "Hop aboard the dining caboose",
        "consequence": "A hearty feast of gumdrops restores your party! (+30% Team Heal)",
        "action": "heal_team",
        "value": 30
      },
      {
        "text": "Pawn precision brass cogs at the depot",
        "consequence": "Exchanged the precision gears for shiny money! (+50 Stuffydolars)",
        "action": "gain_gold",
        "value": 50
      }
    ]
  },
  {
    "id": "forgotten_musical_carousel",
    "title": "The Wind-Up Melody",
    "description": "A brass key glints on the side of an intricate wooden music box. Porcelain horses gently bob in place waiting for a song.",
    "icon": "🎠",
    "choices": [
      {
        "text": "Wind the golden key completely",
        "consequence": "A soothing lullaby mends broken seams and patches loose yarn! (+40% Team Heal)",
        "action": "heal_team",
        "value": 40
      },
      {
        "text": "Inspect the hidden mechanical drawer",
        "consequence": "Found a musical clockwork charm relic inside the base!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "midnight_kitchen_island",
    "title": "Countertop Expedition",
    "description": "Scaled using dish towels and chair legs, the marble kitchen counter spans before you like an arctic tundra of granite.",
    "icon": "🍰",
    "choices": [
      {
        "text": "Nibble on the leftover birthday cupcake frosting",
        "consequence": "Pure sugar rush! Permanent +6 Max HP to all stuffies!",
        "action": "max_hp_boost",
        "value": 6
      },
      {
        "text": "Search the knife block drawer for shiny buttons",
        "consequence": "Discovered dropped allowance bills under the toaster! (+65 Stuffydolars)",
        "action": "gain_gold",
        "value": 65
      }
    ]
  },
  {
    "id": "teddy_bear_tea_party",
    "title": "The Mad Velvet Tea Party",
    "description": "Tiny porcelain saucers, miniature teacups with imaginary Earl Grey, and butter cookies laid out on a polka-dot handkerchief.",
    "icon": "🫖",
    "choices": [
      {
        "text": "Mind your plush manners and take a sip",
        "consequence": "Polite plush etiquette heals the whole tea table! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      },
      {
        "text": "Tip the host a compliment",
        "consequence": "The host tucked crisp bills under the saucer! (+45 Stuffydolars)",
        "action": "gain_gold",
        "value": 45
      }
    ]
  },
  {
    "id": "starlight_nursery_mobile",
    "title": "The Hanging Constellations",
    "description": "Suspended from the ceiling, plush felt stars, smiling crescent moons, and Saturn rings spin gently in the nocturnal draft.",
    "icon": "⭐",
    "choices": [
      {
        "text": "Reach up and touch the glowing nebula star",
        "consequence": "Cosmic nursery energy permanently elevates team Max HP by +5!",
        "action": "max_hp_boost",
        "value": 5
      },
      {
        "text": "Collect fallen starlight dust",
        "consequence": "Luminescent stardust traded for crisp currency! (+60 Stuffydolars)",
        "action": "gain_gold",
        "value": 60
      }
    ]
  },
  {
    "id": "giant_claw_machine",
    "title": "The Neon Crane Chasm",
    "description": "A towering glass arcade cabinet hums with neon tube lights. Hundreds of plush brethren stare down from inside the drop chute.",
    "icon": "🕹️",
    "choices": [
      {
        "text": "Insert a token and aim the claw",
        "consequence": "A clean grab! The claw drops a legendary prize card right to you!",
        "action": "gain_card"
      },
      {
        "text": "Reach into the return chute",
        "consequence": "Scooped out dropped tokens and bills! (+55 Stuffydolars)",
        "action": "gain_gold",
        "value": 55
      }
    ]
  },
  {
    "id": "velvet_ribbon_merchant",
    "title": "The Wandering Ribbon Peddler",
    "description": "An old calico cat plush draped in silken spools of iridescent velvet ribbons sets down a patchwork suitcase before you.",
    "icon": "🎀",
    "choices": [
      {
        "text": "Tie lucky satin ribbons to all ears",
        "consequence": "Lucky ribbons bolster party spirit! (+30% Team Heal)",
        "action": "heal_team",
        "value": 30
      },
      {
        "text": "Trade cotton fluff for an enchanted ribbon",
        "consequence": "Secured an enchanted ribbon relic of agility!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "cardboard_castle_dungeon",
    "title": "The Cardboard Portcullis",
    "description": "Two cardboard toilet paper roll turrets guard a crenellated fortress. A brave felt knight salutes you with a plastic cocktail sword.",
    "icon": "🏰",
    "choices": [
      {
        "text": "Spar with the felt knight",
        "consequence": "Rigorous combat training permanently upgrades a battle card!",
        "action": "upgrade_random"
      },
      {
        "text": "Drink the potion of royal cotton",
        "consequence": "All stuffies gain +7 Max HP from the royal vintage!",
        "action": "max_hp_boost",
        "value": 7
      }
    ]
  },
  {
    "id": "squeaker_symphony",
    "title": "The Squeaker Orchestra",
    "description": "A circle of squeaky plush mice and ducks gather on the rug, practicing a harmonious high-pitched symphony.",
    "icon": "🎺",
    "choices": [
      {
        "text": "Conduct the squeaker crescendo",
        "consequence": "Joyous music invigorates the squad! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      },
      {
        "text": "Pawn an antique brass squeaker",
        "consequence": "Music collectors pay top price! (+50 Stuffydolars)",
        "action": "gain_gold",
        "value": 50
      }
    ]
  },
  {
    "id": "fluff_fountain",
    "title": "The Spring of Pure Fluff",
    "description": "A broken down pillow has burst open, creating a snow-white geyser of premium hypoallergenic goose down and memory foam.",
    "icon": "⛲",
    "choices": [
      {
        "text": "Pack fresh stuffing into all worn seams",
        "consequence": "Plump and firm! Entire team healed by 45%!",
        "action": "heal_team",
        "value": 45
      },
      {
        "text": "Permanently thicken all seams with double foam",
        "consequence": "All squad members gain +6 Max HP!",
        "action": "max_hp_boost",
        "value": 6
      }
    ]
  },
  {
    "id": "candy_stash_vault",
    "title": "Pinky Bear's Secret Stash",
    "description": "Behind the fake encyclopedia lies a treasure trove of gummy bears, fruit chews, and rainbow lollipops guarded by pink ribbons.",
    "icon": "🍬",
    "choices": [
      {
        "text": "Feast on the sugar hoard",
        "consequence": "Sugary vitality heals your squad completely! (+40% Team Heal)",
        "action": "heal_team",
        "value": 40
      },
      {
        "text": "Swap candy for arcade money",
        "consequence": "Exchanged sweets for crisp bank bills! (+70 Stuffydolars)",
        "action": "gain_gold",
        "value": 70
      }
    ]
  },
  {
    "id": "radiator_napping_bench",
    "title": "The Toasting Radiator",
    "description": "The iron radiator emits a soft hissing warmth. A plush towel has been draped across the top, forming the ultimate heat haven.",
    "icon": "♨️",
    "choices": [
      {
        "text": "Doze off in the gentle radiant warmth",
        "consequence": "Soothing heat completely removes all fatigue! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      },
      {
        "text": "Bake your fabric cards to crisp perfection",
        "consequence": "Heat-tempered card permanently upgraded!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "button_eye_bazaar",
    "title": "The Button Emporium",
    "description": "Thousands of shiny plastic, wooden, and mother-of-pearl buttons are sorted into glass jars by a bespectacled plush owl.",
    "icon": "🔘",
    "choices": [
      {
        "text": "Buy polished onyx gemstone eyes",
        "consequence": "Onyx eyes grant sharp tactical vision! Card upgraded!",
        "action": "upgrade_random"
      },
      {
        "text": "Exchange spare thread for shiny buttons",
        "consequence": "Traded for a rare button talisman relic!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "plastic_army_checkpoint",
    "title": "The Green Infantry Perimeter",
    "description": "Fifty little green plastic soldiers have formed a defensive perimeter around the linoleum doorway with toy jeeps and barricades.",
    "icon": "🪖",
    "choices": [
      {
        "text": "Bribe the general with biscuit crumbs",
        "consequence": "General grants military clearance and supplies! (+55 Stuffydolars)",
        "action": "gain_gold",
        "value": 55
      },
      {
        "text": "Request tactical battlefield training",
        "consequence": "Military discipline upgrades a combat card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "flashlight_shadow_puppeteer",
    "title": "The Lantern Shadow Theatre",
    "description": "A camping flashlight projects colossal silhouettes of dragons and rabbits across the bedroom ceiling curtain.",
    "icon": "🔦",
    "choices": [
      {
        "text": "Step into the beam and perform an epic stance",
        "consequence": "Shadow mastery manifests a powerful rare attack card!",
        "action": "gain_card"
      },
      {
        "text": "Warm up by the flashlight bulb",
        "consequence": "Comforting yellow light warms tired fabric. (+25% Team Heal)",
        "action": "heal_team",
        "value": 25
      }
    ]
  },
  {
    "id": "lost_marbles_canyon",
    "title": "The Glass Marble Ravine",
    "description": "Under the dresser, dozens of swirl-pattern cat-eye marbles reflect glittering rainbows across the floorboards.",
    "icon": "🔮",
    "choices": [
      {
        "text": "Roll the rarest swirl marble",
        "consequence": "The swirl marble contains an ancient trapped relic!",
        "action": "gain_relic"
      },
      {
        "text": "Bag up the glass marbles to trade",
        "consequence": "Vintage marbles fetch a handsome sum! (+50 Stuffydolars)",
        "action": "gain_gold",
        "value": 50
      }
    ]
  },
  {
    "id": "domino_chain_reaction",
    "title": "The Kinetic Domino Run",
    "description": "A breathtaking labyrinth of 500 upright domino tiles stretches across the hallway, leading toward a miniature bell tower.",
    "icon": "🀄",
    "choices": [
      {
        "text": "Tip the first domino tile!",
        "consequence": "Spectacular chain reaction rings the victory bell! (+60 Stuffydolars)",
        "action": "gain_gold",
        "value": 60
      },
      {
        "text": "Study the geometric rhythm",
        "consequence": "Chain reaction insight permanently upgrades a card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "origami_lotus_pond",
    "title": "The Paper Crane Sanctuary",
    "description": "Dozens of delicate folded paper cranes, frogs, and water lilies float in a calm dish of distilled rosewater.",
    "icon": "🦢",
    "choices": [
      {
        "text": "Make a serene origami wish",
        "consequence": "Inner peace permanently grants all stuffies +5 Max HP!",
        "action": "max_hp_boost",
        "value": 5
      },
      {
        "text": "Unfold a golden origami message",
        "consequence": "Secret wisdom reveals a mystical paper folding card!",
        "action": "gain_card"
      }
    ]
  },
  {
    "id": "ticking_alarm_clock_shrine",
    "title": "The Twin-Bell Clock of Doom",
    "description": "A vintage chrome twin-bell alarm clock ticks with heart-pounding precision. The hammer hovers dangerously over the bells.",
    "icon": "⏰",
    "choices": [
      {
        "text": "Deftly jam the clapper with a cotton ball",
        "consequence": "Disarmed the noise! Found dropped coins underneath. (+55 Stuffydolars)",
        "action": "gain_gold",
        "value": 55
      },
      {
        "text": "Harness the rhythmic ticking tempo",
        "consequence": "Time dilation focus sharpens your reflexes! Card upgraded!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "snowglobe_blizzard_domain",
    "title": "The Miniature Winter Wonderland",
    "description": "A heavy crystal snowglobe containing a cozy cabin and iridescent glitter flakes resting quietly on the end table.",
    "icon": "❄️",
    "choices": [
      {
        "text": "Give the globe an energetic shake",
        "consequence": "Glitter blizzard reveals a frost-infused relic!",
        "action": "gain_relic"
      },
      {
        "text": "Gaze into the warm cabin hearth",
        "consequence": "Warm nostalgia heals your whole party! (+30% Team Heal)",
        "action": "heal_team",
        "value": 30
      }
    ]
  },
  {
    "id": "bookshelf_summit",
    "title": "The Encyclopedia Mountain",
    "description": "A towering stack of hardcover storybooks forms a steep staircase leading up toward the ceiling rafters.",
    "icon": "📚",
    "choices": [
      {
        "text": "Climb to the summit peak",
        "consequence": "Panoramic view inspires the squad! All stuffies gain +6 Max HP!",
        "action": "max_hp_boost",
        "value": 6
      },
      {
        "text": "Read the hidden story chapter",
        "consequence": "Arcane lore permanently upgrades a battle card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "velcro_tangle_trap",
    "title": "The Hook-and-Loop Web",
    "description": "A forgotten sneaker strap and velcro patches have formed a sticky web across the threshold. Little threads cling stubbornly.",
    "icon": "👟",
    "choices": [
      {
        "text": "Pry loose carefully and harvest the velcro",
        "consequence": "Velcro grip reinforces card durability! Card upgraded!",
        "action": "upgrade_random"
      },
      {
        "text": "Yank free quickly (-8 HP to lead stuffy)",
        "consequence": "Tearing free unlocks a sticky grip relic!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "cuckoo_clock_roost",
    "title": "The Alpine Wooden Roost",
    "description": "A carved pine-cone weight swings back and forth. The miniature wooden door pops open and a wooden bird chirps merrily.",
    "icon": "🕰️",
    "choices": [
      {
        "text": "Offer the cuckoo bird a pine nut",
        "consequence": "The bird drops a shiny pouch of cash! (+60 Stuffydolars)",
        "action": "gain_gold",
        "value": 60
      },
      {
        "text": "Rest in the sheltered clock eaves",
        "consequence": "Sheltered resting restores the party! (+30% Team Heal)",
        "action": "heal_team",
        "value": 30
      }
    ]
  },
  {
    "id": "chalkboard_battle_plans",
    "title": "The Slate Chalkboard Tactics",
    "description": "A miniature slate easel covered in white and blue chalk diagrams of tactical plush maneuvers and arrow vectors.",
    "icon": "📋",
    "choices": [
      {
        "text": "Study the flanking maneuver",
        "consequence": "Masterclass tactical plan upgrades a card!",
        "action": "upgrade_random"
      },
      {
        "text": "Draw your own battle victory anthem",
        "consequence": "High morale heals the whole party! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      }
    ]
  },
  {
    "id": "yo_yo_gravity_master",
    "title": "The Sleeper Wheel",
    "description": "A butterfly-shaped aluminium yo-yo spins at the end of its string, defying gravity with mesmerizing hums.",
    "icon": "🪀",
    "choices": [
      {
        "text": "Learn the \"Walk the Dog\" trick",
        "consequence": "Centrifugal mastery unlocks a dynamic attack card!",
        "action": "gain_card"
      },
      {
        "text": "Unravel the reinforced nylon string",
        "consequence": "High-tensile string reinforces all plushies! (+5 Max HP to all)",
        "action": "max_hp_boost",
        "value": 5
      }
    ]
  },
  {
    "id": "bubble_wrap_stomp_field",
    "title": "The Inflatable Minefield",
    "description": "A giant sheet of oversized bubble wrap packaging blankets the floor. Each step begs for an explosive POP!",
    "icon": "🫧",
    "choices": [
      {
        "text": "Stomp across with all your might!",
        "consequence": "Pure joyful stress relief heals the team! (+40% Team Heal)",
        "action": "heal_team",
        "value": 40
      },
      {
        "text": "Carefully roll it up for packaging value",
        "consequence": "Pawned to shipping merchants! (+50 Stuffydolars)",
        "action": "gain_gold",
        "value": 50
      }
    ]
  },
  {
    "id": "plastic_dinosaur_tar_pit",
    "title": "The Carpet Fiber Tar Pits",
    "description": "A green plastic T-Rex and a blue Triceratops are locked in prehistoric combat amidst dense shag carpet jungle.",
    "icon": "🦖",
    "choices": [
      {
        "text": "Rescue the roaring T-Rex",
        "consequence": "The grateful dinosaur gifts you an ancient fossil relic!",
        "action": "gain_relic"
      },
      {
        "text": "Tame both beasts with snack crumbs",
        "consequence": "Prehistoric roar permanently upgrades a card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "patchwork_quilt_crossroads",
    "title": "The Hexagonal Tapestry",
    "description": "An antique crazy quilt made of silk, denim, and corduroy patches stretches out like a map of uncharted plush continents.",
    "icon": "🗺️",
    "choices": [
      {
        "text": "Follow the golden velvet road",
        "consequence": "Brings you straight to a coin drop! (+55 Stuffydolars)",
        "action": "gain_gold",
        "value": 55
      },
      {
        "text": "Rest in the corduroy meadow",
        "consequence": "Sturdy ridges massage worn fabric. (+30% Team Heal)",
        "action": "heal_team",
        "value": 30
      }
    ]
  },
  {
    "id": "wooden_xylophone_staircase",
    "title": "The Rainbow Tone Bridge",
    "description": "Eight colorful metal bars arranged like a rainbow bridge. Running across plays a lively ascending musical scale.",
    "icon": "🎵",
    "choices": [
      {
        "text": "Sprint up the rainbow scale!",
        "consequence": "Harmonic vibrations permanently boost squad Max HP by +5!",
        "action": "max_hp_boost",
        "value": 5
      },
      {
        "text": "Strike the golden high-C key",
        "consequence": "High-C chime rewards you with a melodic card!",
        "action": "gain_card"
      }
    ]
  },
  {
    "id": "glow_in_dark_starfield",
    "title": "The Phosphor Starlight Vault",
    "description": "Plastic ceiling stars charged by daytime sunlight glow with tranquil emerald luminescence in the twilight room.",
    "icon": "❇️",
    "choices": [
      {
        "text": "Bask in the soothing phosphor glow",
        "consequence": "Gentle green light heals all seams! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      },
      {
        "text": "Pry down a supercharged glowing supernova",
        "consequence": "The radiant star becomes a powerful glowing relic!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "jack_in_the_box_gambit",
    "title": "The Spring-Loaded Jester",
    "description": "A tin box decorated with painted clowns plays \"Pop Goes the Weasel\" with every slow turn of the hand crank.",
    "icon": "🤡",
    "choices": [
      {
        "text": "Turn the crank all the way... POP!",
        "consequence": "The jester springs out holding an upgraded card!",
        "action": "upgrade_random"
      },
      {
        "text": "Check the bottom coin slot",
        "consequence": "Found dropped carnival tokens! (+60 Stuffydolars)",
        "action": "gain_gold",
        "value": 60
      }
    ]
  },
  {
    "id": "kaleidoscope_prism_chamber",
    "title": "The Mirrored Octagon",
    "description": "Looking down a polished brass cylinder reveals an infinite geometric fractal of tumbling colored glass jewels.",
    "icon": "💎",
    "choices": [
      {
        "text": "Peer deeply into the fractal center",
        "consequence": "Infinite perspective permanently upgrades a card!",
        "action": "upgrade_random"
      },
      {
        "text": "Shake loose a loose glass gemstone",
        "consequence": "The jewel is an ancient prismatic relic!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "velvet_pouch_oracle",
    "title": "The Drawstring Fortune Pouch",
    "description": "A purple velvet pouch embroidered with golden thread whispers prophecies when held near plush ears.",
    "icon": "🔮",
    "choices": [
      {
        "text": "Reach inside and draw your destiny",
        "consequence": "Drew a legendary destiny card from the pouch!",
        "action": "gain_card"
      },
      {
        "text": "Shake the pouch for loose currency",
        "consequence": "Silver coins and bills pour out! (+65 Stuffydolars)",
        "action": "gain_gold",
        "value": 65
      }
    ]
  },
  {
    "id": "wooden_puzzle_box_enigma",
    "title": "The Japanese Secret Box",
    "description": "A cedar wood puzzle box requiring twelve precise sliding panel movements to unlock its hidden inner vault.",
    "icon": "🧩",
    "choices": [
      {
        "text": "Carefully slide all twelve panels",
        "consequence": "Solved! Inside rests an elusive wooden relic!",
        "action": "gain_relic"
      },
      {
        "text": "Admire the fine woodworking craftsmanship",
        "consequence": "Appreciating the craft heals your party! (+30% Team Heal)",
        "action": "heal_team",
        "value": 30
      }
    ]
  },
  {
    "id": "paper_airplane_runway",
    "title": "The Glider Hangar",
    "description": "A fleet of sharp dart-style paper airplanes folded from colorful construction paper rests on the desk edge.",
    "icon": "✈️",
    "choices": [
      {
        "text": "Board the lead supersonic glider",
        "consequence": "Exhilarating flight grants +6 Max HP to all stuffies!",
        "action": "max_hp_boost",
        "value": 6
      },
      {
        "text": "Use aerodynamic folds to upgrade cards",
        "consequence": "Sleek aerodynamic crease upgrades a card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "dollhouse_bakery_display",
    "title": "The Miniature Pâtisserie",
    "description": "A Victorian dollhouse parlor filled with clay croissants, polymer fruit tarts, and tiny iced cinnamon rolls.",
    "icon": "🥐",
    "choices": [
      {
        "text": "Enjoy a bite of the magical dollhouse bread",
        "consequence": "Whimsical baked goods heal the team! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      },
      {
        "text": "Raid the dollhouse cash register",
        "consequence": "Tiny but real currency collected! (+50 Stuffydolars)",
        "action": "gain_gold",
        "value": 50
      }
    ]
  },
  {
    "id": "spinning_top_arena",
    "title": "The Bey-Plate Colosseum",
    "description": "A heavy metal spinning top roars inside a plastic battle dish, creating a vacuum of kinetic plush excitement.",
    "icon": "🌪️",
    "choices": [
      {
        "text": "Launch your own custom top into the fray",
        "consequence": "Spinning victory earns a high-velocity attack card!",
        "action": "gain_card"
      },
      {
        "text": "Collect the victor wager bounty",
        "consequence": "Won the top spinning tournament purse! (+65 Stuffydolars)",
        "action": "gain_gold",
        "value": 65
      }
    ]
  },
  {
    "id": "magna_doodle_tablet",
    "title": "The Magnetic Slate",
    "description": "A magnetic drawing board with iron filings forming smiling faces and battle swords that erase with a single slide.",
    "icon": "✏️",
    "choices": [
      {
        "text": "Sketch an impenetrable shield on the screen",
        "consequence": "Magnetic shielding permanently raises team Max HP by +5!",
        "action": "max_hp_boost",
        "value": 5
      },
      {
        "text": "Slide the eraser to wipe away all weaknesses",
        "consequence": "Clean slate upgrades a card to maximum power!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "plush_hospital_triage",
    "title": "The Red Cross Stuffy Clinic",
    "description": "A miniature clinic staffed by plush doctor bunnies with real cotton swabs, adhesive felt strips, and healing salve.",
    "icon": "🏥",
    "choices": [
      {
        "text": "Receive a full surgical restitching",
        "consequence": "Master stitches completely rejuvenate the squad! (+50% Team Heal)",
        "action": "heal_team",
        "value": 50
      },
      {
        "text": "Sterilize and reinforce your fibers",
        "consequence": "Antiseptic treatment permanently adds +5 Max HP to all!",
        "action": "max_hp_boost",
        "value": 5
      }
    ]
  },
  {
    "id": "silly_putty_egg",
    "title": "The Bouncing Plastic Egg",
    "description": "A bright red plastic egg holding stretchy pink silicone putty that copies newspaper comics and stretches infinitely.",
    "icon": "🥚",
    "choices": [
      {
        "text": "Press the putty against your best card",
        "consequence": "A perfect silicone copy upgrades the card!",
        "action": "upgrade_random"
      },
      {
        "text": "Roll it into a super-bouncing sphere",
        "consequence": "The wild bounce uncovers a hidden relic under the dresser!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "cardboard_pirate_galleon",
    "title": "The Jolly Cardboarder",
    "description": "A cereal-box pirate ship flying a black felt Jolly Roger flag sails across the sea-blue bedroom throw blanket.",
    "icon": "🏴‍☠️",
    "choices": [
      {
        "text": "Dig where X marks the spot on the rug",
        "consequence": "Buried pirate doubloons and bills found! (+70 Stuffydolars)",
        "action": "gain_gold",
        "value": 70
      },
      {
        "text": "Swear the plush pirate oath",
        "consequence": "Pirate bravado manifests a swashbuckling attack card!",
        "action": "gain_card"
      }
    ]
  },
  {
    "id": "wind_up_teeth_chatter",
    "title": "The Chattering Chompers",
    "description": "A pair of wind-up plastic teeth with googly eyes rattles across the hardwood floor, biting playfully at dust bunnies.",
    "icon": "🦷",
    "choices": [
      {
        "text": "Wrestle the chompers into submission",
        "consequence": "Tamed the teeth! Gain a snapping jaw relic!",
        "action": "gain_relic"
      },
      {
        "text": "Wind the spring completely and watch it leap",
        "consequence": "Comic relief lifts everyone spirits! (+25% Team Heal)",
        "action": "heal_team",
        "value": 25
      }
    ]
  },
  {
    "id": "lava_lamp_volcano",
    "title": "The Hypnotic Magma Pillar",
    "description": "Warm purple wax blobs slowly ascend and descend in a cylinder of clear yellow liquid, glowing with warm 70s vibes.",
    "icon": "🌋",
    "choices": [
      {
        "text": "Meditate on the drifting wax blobs",
        "consequence": "Deep mental focus permanently upgrades a card!",
        "action": "upgrade_random"
      },
      {
        "text": "Warm your paws against the glass base",
        "consequence": "Soothing warmth restores party seams! (+30% Team Heal)",
        "action": "heal_team",
        "value": 30
      }
    ]
  },
  {
    "id": "plastic_bowling_alley",
    "title": "The Miniature Strike Lane",
    "description": "Ten hollow white plastic pins stand in a triangle at the end of the smooth hallway. A red hollow ball rests nearby.",
    "icon": "🎳",
    "choices": [
      {
        "text": "Roll for the perfect 300 strike!",
        "consequence": "STRIKE! Winner prize purse collected! (+60 Stuffydolars)",
        "action": "gain_gold",
        "value": 60
      },
      {
        "text": "Juggle the pins to build balance",
        "consequence": "Agility practice permanently boosts team Max HP by +5!",
        "action": "max_hp_boost",
        "value": 5
      }
    ]
  },
  {
    "id": "music_box_dancer_shrine",
    "title": "The Rotating Ballerina",
    "description": "A velvet-lined jewelry box plays a delicate waltz while a porcelain ballerina spins on a mirrored magnetic disc.",
    "icon": "🩰",
    "choices": [
      {
        "text": "Dance alongside the spinning ballerina",
        "consequence": "Graceful pirouette restores party vitality! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      },
      {
        "text": "Search the velvet ring compartment",
        "consequence": "Discovered a sparkling jeweled ring relic!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "finger_puppet_theater",
    "title": "The Cardboard Proscenium",
    "description": "A velvet curtain hangs from an overturned shoe box. Four knitted finger puppets poke their heads out with dramatic flair.",
    "icon": "🎭",
    "choices": [
      {
        "text": "Perform a heroic plush drama",
        "consequence": "Standing ovation! Earned a theatrical card!",
        "action": "gain_card"
      },
      {
        "text": "Collect ticket admission fees",
        "consequence": "Packed house! Ticket revenues pour in! (+55 Stuffydolars)",
        "action": "gain_gold",
        "value": 55
      }
    ]
  },
  {
    "id": "rubiks_cube_monolith",
    "title": "The Scrambled Hexahedron",
    "description": "A 3x3 twisty puzzle cube sits partially solved, its bright stickers humming with multidimensional permutation power.",
    "icon": "🧊",
    "choices": [
      {
        "text": "Execute the final algorithm to solve all faces",
        "consequence": "Perfect solution unlocks a legendary puzzle card!",
        "action": "gain_card"
      },
      {
        "text": "Disassemble the cube and reassemble it solved",
        "consequence": "Cunning trickery upgrades a battle card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "slinky_staircase_descent",
    "title": "The Helical Spring of Eternity",
    "description": "A shiny steel spring steps down carpeted steps one by one with a rhythmic metallic \"shing-shing\" cadence.",
    "icon": "🪜",
    "choices": [
      {
        "text": "Ride the slinky all the way to the landing",
        "consequence": "Thrilling descent grants +6 Max HP to all stuffies!",
        "action": "max_hp_boost",
        "value": 6
      },
      {
        "text": "Harvest high-carbon spring steel",
        "consequence": "Steel tension reinforces your cards! Upgraded!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "snow_globe_miniature_citadel",
    "title": "The Blizzard Keep",
    "description": "Inside a glass dome surrounded by swirling glitter flakes, a miniature plush king presides over a crystal throne.",
    "icon": "🏰",
    "choices": [
      {
        "text": "Pledge allegiance to the Blizzard King",
        "consequence": "The king bestows royal Stuffydolars upon your squad! (+65 Stuffydolars)",
        "action": "gain_gold",
        "value": 65
      },
      {
        "text": "Receive the Frost Guard blessing",
        "consequence": "Cold-tempered cotton boosts team Max HP by +5!",
        "action": "max_hp_boost",
        "value": 5
      }
    ]
  },
  {
    "id": "fuzzy_dice_mirror_charm",
    "title": "The Lucky Velvet Cubes",
    "description": "Two enormous white plush dice with black felt dots dangle from a braided nylon cord, radiating pure unadulterated luck.",
    "icon": "🎲",
    "choices": [
      {
        "text": "Roll the fuzzy dice across the carpet",
        "consequence": "Double sixes! A jackpot relic drops into your paws!",
        "action": "gain_relic"
      },
      {
        "text": "Snuggle the plush dice for good fortune",
        "consequence": "Comforting fuzz heals your squad seams! (+30% Team Heal)",
        "action": "heal_team",
        "value": 30
      }
    ]
  },
  {
    "id": "glow_stick_rave_party",
    "title": "The Neon Chem-Light Glade",
    "description": "Cracked neon green and purple glow sticks illuminate a circle of dancing plush mice listening to muffled music.",
    "icon": "🧪",
    "choices": [
      {
        "text": "Join the ecstatic glow dance",
        "consequence": "Wild neon energy heals your squad by 40%!",
        "action": "heal_team",
        "value": 40
      },
      {
        "text": "Collect luminescent chem-fluid vials",
        "consequence": "Neon glow sharpens a card to maximum power!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "lost_guitar_pick_quarry",
    "title": "The Tortex Celluloid Mine",
    "description": "Under the bed near the acoustic guitar case lies a scattering of green, orange, and purple tortoiseshell plectrums.",
    "icon": "🎸",
    "choices": [
      {
        "text": "Craft a tortoiseshell dagger",
        "consequence": "Guitar pick blade crafts a razor-sharp attack card!",
        "action": "gain_card"
      },
      {
        "text": "Trade the rare vintage picks to musicians",
        "consequence": "Musicians pay generous allowance! (+55 Stuffydolars)",
        "action": "gain_gold",
        "value": 55
      }
    ]
  },
  {
    "id": "tin_can_telephone_line",
    "title": "The String Communication Wire",
    "description": "Two soup cans connected by 30 feet of taut string transmit whispers from the opposite end of the house.",
    "icon": "🥫",
    "choices": [
      {
        "text": "Listen intently to the transmitted secrets",
        "consequence": "Tactical intel upgrades a strategic card!",
        "action": "upgrade_random"
      },
      {
        "text": "Whisper a comforting message into the can",
        "consequence": "Shared camaraderie heals the team! (+30% Team Heal)",
        "action": "heal_team",
        "value": 30
      }
    ]
  },
  {
    "id": "felt_pancake_breakfast",
    "title": "The Velour Skillet Diner",
    "description": "A toy plastic frying pan containing three thick felt pancakes with embroidered yellow butter pats and yarn syrup.",
    "icon": "🥞",
    "choices": [
      {
        "text": "Enjoy a warm pretend stack",
        "consequence": "Hearty felt nourishment heals your party! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      },
      {
        "text": "Tip the chef with compliments",
        "consequence": "The chef slips you spare change! (+50 Stuffydolars)",
        "action": "gain_gold",
        "value": 50
      }
    ]
  },
  {
    "id": "magnetic_fishing_pond",
    "title": "The Whirling Fish Pond",
    "description": "A rotating plastic pool of colorful fish opening and closing their hungry mouths with magnetic magnets in their snouts.",
    "icon": "🎣",
    "choices": [
      {
        "text": "Cast your line and hook the golden fish",
        "consequence": "Reeled in a legendary golden fish relic!",
        "action": "gain_relic"
      },
      {
        "text": "Scoop out dropped arcade tokens",
        "consequence": "Collected heavy pocket change! (+60 Stuffydolars)",
        "action": "gain_gold",
        "value": 60
      }
    ]
  },
  {
    "id": "giant_plush_octopus_hug",
    "title": "The Eight-Tentacle Embracer",
    "description": "An immense purple velvet octopus spans four feet across the rug, its soft fleece tentacles inviting weary travelers.",
    "icon": "🐙",
    "choices": [
      {
        "text": "Accept the colossal eight-legged squeeze",
        "consequence": "All stress and tears vanish! (+45% Team Heal)",
        "action": "heal_team",
        "value": 45
      },
      {
        "text": "Search the suction cup underbellies",
        "consequence": "Found dropped bills suctioned under a tentacle! (+55 Stuffydolars)",
        "action": "gain_gold",
        "value": 55
      }
    ]
  },
  {
    "id": "pinwheel_wind_tunnel",
    "title": "The Holographic Pinwheel Garden",
    "description": "A fan on the nightstand drives five holographic rainbow pinwheels into blinding glittering revolutions.",
    "icon": "🪅",
    "choices": [
      {
        "text": "Harness the vortex of air",
        "consequence": "Gale force permanently enhances squad Max HP by +5!",
        "action": "max_hp_boost",
        "value": 5
      },
      {
        "text": "Catch the rainbow light reflections",
        "consequence": "Glittering light permanently upgrades a card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "wooden_blocks_obelisk",
    "title": "The Alphabet Jenga Spire",
    "description": "Twenty-six primary color wooden alphabet blocks stacked in a perilous column that sways in the air draft.",
    "icon": "🧱",
    "choices": [
      {
        "text": "Carefully slide out block \"Z\" from the base",
        "consequence": "Masterful architectural precision upgrades a card!",
        "action": "upgrade_random"
      },
      {
        "text": "Knock it down with a victorious war cry!",
        "consequence": "Tumultuous crash reveals buried coins! (+65 Stuffydolars)",
        "action": "gain_gold",
        "value": 65
      }
    ]
  },
  {
    "id": "plush_dragon_hoard",
    "title": "Ignis the Emerald Wyrm's Den",
    "description": "A twelve-inch green felt dragon sleeps peacefully curled around a pile of shiny gum wrappers and foil chocolate coins.",
    "icon": "🐉",
    "choices": [
      {
        "text": "Gently slip a golden coin from the hoard",
        "consequence": "Successfully snatched shiny money! (+70 Stuffydolars)",
        "action": "gain_gold",
        "value": 70
      },
      {
        "text": "Scratch the sleeping dragon behind the horns",
        "consequence": "Content dragon purrs and blesses you with a fiery card!",
        "action": "gain_card"
      }
    ]
  },
  {
    "id": "bubble_gum_bubble_lift",
    "title": "The Giant Pink Bubblegum Sphere",
    "description": "A pink bubblegum balloon floats overhead, suspended like a gentle hot air balloon in the bedroom ceiling breeze.",
    "icon": "🫧",
    "choices": [
      {
        "text": "Grab the string and float into the sky",
        "consequence": "Aerial perspective permanently grants +6 Max HP to all!",
        "action": "max_hp_boost",
        "value": 6
      },
      {
        "text": "Pop the sweet sphere with a needle",
        "consequence": "Sweet candy rain heals your whole squad! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      }
    ]
  },
  {
    "id": "toy_stethoscope_checkup",
    "title": "The Toy Doctor Office",
    "description": "A blue plastic stethoscope and reflex hammer rest on a pristine flannel sheet. A plush nurse offers cotton swabs.",
    "icon": "🩺",
    "choices": [
      {
        "text": "Listen to the steady heartbeat of your lead stuffy",
        "consequence": "Reassuring vitality heals all party members! (+40% Team Heal)",
        "action": "heal_team",
        "value": 40
      },
      {
        "text": "Take a dose of the sugar syrup prescription",
        "consequence": "Potent vitality permanently upgrades a card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "cardboard_submarine_trench",
    "title": "The Bathtub Abyss Dive",
    "description": "A cardboard submarine with a plastic bottle periscope sits dry-docked on the bath mat, ready for deep trench exploration.",
    "icon": "🚢",
    "choices": [
      {
        "text": "Submerge into the imaginary depths",
        "consequence": "Discovered an abyssal deep-sea relic!",
        "action": "gain_relic"
      },
      {
        "text": "Repair the cardboard hull seals",
        "consequence": "Waterproof hull reinforces squad Max HP by +5!",
        "action": "max_hp_boost",
        "value": 5
      }
    ]
  },
  {
    "id": "patchwork_hot_air_balloon",
    "title": "The Ceiling Fan Aeronaut",
    "description": "A wicker basket tied with string to a patchwork nylon balloon basket hangs from the light fixture, ready for takeoff.",
    "icon": "🎈",
    "choices": [
      {
        "text": "Untie the mooring rope and ascend",
        "consequence": "High altitude winds upgrade a battle card!",
        "action": "upgrade_random"
      },
      {
        "text": "Trade ballast sandbags for allowance money",
        "consequence": "Heavy sandbags traded for currency! (+60 Stuffydolars)",
        "action": "gain_gold",
        "value": 60
      }
    ]
  },
  {
    "id": "rubber_duck_regatta",
    "title": "The Yellow Fleet of Glory",
    "description": "Twelve bright yellow rubber ducks bob in formation on the water bucket, their orange beaks pointing toward the drain.",
    "icon": "🦆",
    "choices": [
      {
        "text": "Sponsor the lead racing duck",
        "consequence": "First place finish! Won the regatta purse! (+65 Stuffydolars)",
        "action": "gain_gold",
        "value": 65
      },
      {
        "text": "Take a relaxing splash with the duck flock",
        "consequence": "Playful splashing restores party fluff! (+30% Team Heal)",
        "action": "heal_team",
        "value": 30
      }
    ]
  },
  {
    "id": "felt_pizza_oven",
    "title": "The Cardboard Wood-Fired Pizzeria",
    "description": "A toy brick pizza oven with felt crusts, red flannel sauce, yellow yarn cheese, and velcro pepperoni slices.",
    "icon": "🍕",
    "choices": [
      {
        "text": "Bake a supreme pepperoni pizza",
        "consequence": "Delicious piping-hot meal heals your team! (+40% Team Heal)",
        "action": "heal_team",
        "value": 40
      },
      {
        "text": "Deliver the pizza to the master bedroom",
        "consequence": "Generous delivery tip collected! (+55 Stuffydolars)",
        "action": "gain_gold",
        "value": 55
      }
    ]
  },
  {
    "id": "glow_in_dark_track_racer",
    "title": "The Fluorescent Speed Loop",
    "description": "A snap-together neon track twists into loops and corkscrews. A battery-powered car with blue LED headlights roars around.",
    "icon": "🏎️",
    "choices": [
      {
        "text": "Hitch a ride in the passenger seat",
        "consequence": "High-speed G-forces permanently add +6 Max HP to all!",
        "action": "max_hp_boost",
        "value": 6
      },
      {
        "text": "Tune the miniature electric motor",
        "consequence": "Overclocked engineering upgrades a card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "paper_fortune_teller_cootie_catcher",
    "title": "The Eight-Spoke Oracle",
    "description": "A folded paper fortune teller moves its four pinchers back and forth: \"Pick a color, pick a number, pick your fate.\"",
    "icon": "🔮",
    "choices": [
      {
        "text": "Select \"Blue - 7 - The Golden Fluff\"",
        "consequence": "Oracle reveals an incredible fortune of money! (+75 Stuffydolars)",
        "action": "gain_gold",
        "value": 75
      },
      {
        "text": "Select \"Red - 4 - The Ancient Stitches\"",
        "consequence": "Oracle blesses your deck with an upgraded card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "fuzzy_slippers_oasis",
    "title": "The Bunny Slipper Caverns",
    "description": "A pair of enormous pink fleece bunny slippers sits side-by-side on the rug. The fleece insoles are warm and impossibly soft.",
    "icon": "🩴",
    "choices": [
      {
        "text": "Crawl inside the left bunny slipper for a nap",
        "consequence": "Unbelievably snug warmth heals the party! (+45% Team Heal)",
        "action": "heal_team",
        "value": 45
      },
      {
        "text": "Inspect under the memory foam insole",
        "consequence": "Found a rare forgotten charm relic!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "wooden_marionette_puppet_master",
    "title": "The Marionette Strings",
    "description": "A carved wooden jester suspended by crossbars dances with uncanny dexterity, demonstrating impossible acrobatics.",
    "icon": "🪆",
    "choices": [
      {
        "text": "Learn the puppet aerial flip",
        "consequence": "Acrobatic mastery yields a dynamic card!",
        "action": "gain_card"
      },
      {
        "text": "Untangle the silk strings",
        "consequence": "Grateful puppeteer pays with shiny bills! (+55 Stuffydolars)",
        "action": "gain_gold",
        "value": 55
      }
    ]
  },
  {
    "id": "tin_kaleidoscope_sunbeam",
    "title": "The Solar Prism Lens",
    "description": "A sunbeam striking through the window blinds hits a multifaceted crystal paperweight, casting dancing prisms on the wall.",
    "icon": "🌞",
    "choices": [
      {
        "text": "Channel the rainbow laser beam",
        "consequence": "Prismatic light permanently upgrades a card!",
        "action": "upgrade_random"
      },
      {
        "text": "Bask in the warm sunbeam patch",
        "consequence": "Pure solar warmth restores party seams! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      }
    ]
  },
  {
    "id": "crayon_sharpener_crater",
    "title": "The Wax Shaving Quarry",
    "description": "A manual hand-crank pencil sharpener filled with fragrant shavings of cerulean blue, burnt sienna, and neon yellow wax.",
    "icon": "✏️",
    "choices": [
      {
        "text": "Melt the shavings into protective wax armor",
        "consequence": "Wax coating permanently increases team Max HP by +5!",
        "action": "max_hp_boost",
        "value": 5
      },
      {
        "text": "Sharpen your favorite attack card",
        "consequence": "Point-blank sharpness upgrades the card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "snow_globe_musical_ballerina",
    "title": "The Snow Waltz Melodia",
    "description": "A wind-up music box embedded in a snowglobe plays Tchaikovsky while silver glitter gently settles on a dancing doll.",
    "icon": "🩰",
    "choices": [
      {
        "text": "Listen to the soothing waltz to completion",
        "consequence": "Harmonious tranquility restores the squad! (+40% Team Heal)",
        "action": "heal_team",
        "value": 40
      },
      {
        "text": "Pawn the brass music cylinder",
        "consequence": "High antique value collected! (+60 Stuffydolars)",
        "action": "gain_gold",
        "value": 60
      }
    ]
  },
  {
    "id": "wooden_train_turntable",
    "title": "The Roundhouse Turntable",
    "description": "A rotating wooden locomotive turntable connects eight different branches of wooden track leading into the bedroom closet.",
    "icon": "🛤️",
    "choices": [
      {
        "text": "Rotate the turntable toward the treasure siding",
        "consequence": "Train car loaded with Stuffydolars arrived! (+70 Stuffydolars)",
        "action": "gain_gold",
        "value": 70
      },
      {
        "text": "Refuel the engine with wood polish",
        "consequence": "Polished speed permanently upgrades a card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "plush_penguin_ice_slide",
    "title": "The Pillow Ice Shelf",
    "description": "A steep cascade of satin pillows forms a toboggan run where three little plush penguins belly-slide with joyous squeaks.",
    "icon": "🐧",
    "choices": [
      {
        "text": "Slide headfirst down the pillow chute!",
        "consequence": "Exhilarating slide permanently adds +6 Max HP to all!",
        "action": "max_hp_boost",
        "value": 6
      },
      {
        "text": "Trade fish crackers with the penguins",
        "consequence": "Penguins share their secret icy relic!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "cardboard_robot_arm_hydraulics",
    "title": "The Syringe Hydraulic Crane",
    "description": "A working robotic arm made of cardboard beams and plastic water-filled syringes that opens and closes a claw.",
    "icon": "🤖",
    "choices": [
      {
        "text": "Equip the hydraulic claw to your leader",
        "consequence": "Hydraulic grip unlocks an immense crushing attack card!",
        "action": "gain_card"
      },
      {
        "text": "Recalibrate the hydraulic pressure",
        "consequence": "High pressure upgrades a combat card!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "velvet_cushion_throne_coronation",
    "title": "The King of the Nursery",
    "description": "An embroidered gold-tassel bolster pillow sits elevated on three dictionaries like the imperial throne of stuffed animals.",
    "icon": "👑",
    "choices": [
      {
        "text": "Ascend the throne and crown your leader",
        "consequence": "Imperial coronation permanently gives +7 Max HP to all!",
        "action": "max_hp_boost",
        "value": 7
      },
      {
        "text": "Collect the royal treasury tribute",
        "consequence": "The kingdom pays royal taxes! (+80 Stuffydolars)",
        "action": "gain_gold",
        "value": 80
      }
    ]
  },
  {
    "id": "wind_up_swimming_frog_pond",
    "title": "The Porcelain Sink Lagoon",
    "description": "A green plastic frog with flippers kicks merrily across water filled with floating rubber lily pads.",
    "icon": "🐸",
    "choices": [
      {
        "text": "Swim alongside the frog champion",
        "consequence": "Refreshing bath heals all party members! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      },
      {
        "text": "Retrieve the sunken sink treasure",
        "consequence": "Pulled shiny coins from the drain rim! (+55 Stuffydolars)",
        "action": "gain_gold",
        "value": 55
      }
    ]
  },
  {
    "id": "patchwork_sleeping_bag_haven",
    "title": "The Slumber Bag Cocoon",
    "description": "A thick flannel sleeping bag lined with cartoon dinosaurs lies unrolled on the carpet, offering total darkness and security.",
    "icon": "🏕️",
    "choices": [
      {
        "text": "Zip up entirely inside the dark warm cocoon",
        "consequence": "Deep restorative slumber heals team by 50%!",
        "action": "heal_team",
        "value": 50
      },
      {
        "text": "Inspect the zippered secret foot pocket",
        "consequence": "Discovered emergency allowance cash! (+65 Stuffydolars)",
        "action": "gain_gold",
        "value": 65
      }
    ]
  },
  {
    "id": "brass_kaleidoscope_observatory",
    "title": "The Cosmic Cylinder",
    "description": "A heavy brass telescope-sized kaleidoscope aimed toward the window reveals stained-glass constellations.",
    "icon": "🔭",
    "choices": [
      {
        "text": "Chart the shifting glass star clusters",
        "consequence": "Celestial navigation upgrades a strategic card!",
        "action": "upgrade_random"
      },
      {
        "text": "Extract a fallen starlight shard",
        "consequence": "The shard crystallizes into a rare celestial relic!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "bubble_gum_dispenser_globe",
    "title": "The Glass Gumball Altar",
    "description": "A vintage red cast-iron gumball machine with a coin slot that glints in the light. Swirling spheres of sugar glow inside.",
    "icon": "🍬",
    "choices": [
      {
        "text": "Turn the crank for a mega rainbow gumball",
        "consequence": "Sugary vitality grants permanent +6 Max HP to all!",
        "action": "max_hp_boost",
        "value": 6
      },
      {
        "text": "Pick the coin box lock",
        "consequence": "Jackpot! Heavy coins and bills tumble out! (+80 Stuffydolars)",
        "action": "gain_gold",
        "value": 80
      }
    ]
  },
  {
    "id": "felt_storybook_castle_pop_up",
    "title": "The Pop-Up Castle Dimension",
    "description": "Opening an enormous pop-up book causes three-dimensional paper towers, drawbridges, and paper dragons to unfold into reality.",
    "icon": "📖",
    "choices": [
      {
        "text": "Cross the paper drawbridge to the wizard tower",
        "consequence": "Paper sorcery manifests a legendary spell card!",
        "action": "gain_card"
      },
      {
        "text": "Rest in the royal paper gardens",
        "consequence": "Fairy tale tranquility heals the squad! (+40% Team Heal)",
        "action": "heal_team",
        "value": 40
      }
    ]
  },
  {
    "id": "wind_up_toy_soldier_parade",
    "title": "The Tin Drummer March",
    "description": "A regiment of clockwork tin drummers marches in unison across the desk, their rhythmic snare beats resonating through the wood.",
    "icon": "🥁",
    "choices": [
      {
        "text": "Fall into rank with the tin soldiers",
        "consequence": "Iron military discipline permanently upgrades a card!",
        "action": "upgrade_random"
      },
      {
        "text": "Collect the parade sponsorship fees",
        "consequence": "Parade organizers pay handsome wages! (+60 Stuffydolars)",
        "action": "gain_gold",
        "value": 60
      }
    ]
  },
  {
    "id": "yarn_skein_labyrinth",
    "title": "The Ariadne Thread Web",
    "description": "A tangled web of scarlet wool yarn crisscrosses between chair legs. In the center sits an ancient wooden crochet hook.",
    "icon": "🧶",
    "choices": [
      {
        "text": "Retrieve the mystical crochet hook",
        "consequence": "The hook becomes a powerful seam-mending relic!",
        "action": "gain_relic"
      },
      {
        "text": "Wind the yarn into a neat bouncy sphere",
        "consequence": "Knitting therapy completely relaxes the party! (+35% Team Heal)",
        "action": "heal_team",
        "value": 35
      }
    ]
  },
  {
    "id": "magnetic_poetry_fridge_altar",
    "title": "The Refrigerator Magnetic Muse",
    "description": "Hundreds of black-on-white magnetic word tiles form hilarious poems and battle cries across the lower freezer door.",
    "icon": "🧲",
    "choices": [
      {
        "text": "Arrange the ultimate battle incantation",
        "consequence": "Incantation unlocks a poetic masterwork card!",
        "action": "gain_card"
      },
      {
        "text": "Find dropped allowance under the fridge vent",
        "consequence": "Dust bunnies yielded cold hard cash! (+70 Stuffydolars)",
        "action": "gain_gold",
        "value": 70
      }
    ]
  },
  {
    "id": "cardboard_arcade_pinball_machine",
    "title": "The Rubber Band Flipper Alley",
    "description": "A sloped cardboard box with wooden chopsticks, rubber band flippers, and steel ball bearings ready for high-score action.",
    "icon": "🎰",
    "choices": [
      {
        "text": "Flip for the extra ball bonus high score!",
        "consequence": "HIGH SCORE! Winner ticket prize claimed! (+75 Stuffydolars)",
        "action": "gain_gold",
        "value": 75
      },
      {
        "text": "Calibrate rubber band tension",
        "consequence": "Elastic snap upgrades a card to maximum power!",
        "action": "upgrade_random"
      }
    ]
  },
  {
    "id": "fluff_cloud_dream_astral_plane",
    "title": "The Slumber Cloud Astral Plane",
    "description": "Drifting off to sleep on a bed of fresh down pillows, the party finds themselves floating above a dream kingdom of endless cotton.",
    "icon": "☁️",
    "choices": [
      {
        "text": "Breathe in pure astral fluff essence",
        "consequence": "Astral empowerment permanently increases team Max HP by +8!",
        "action": "max_hp_boost",
        "value": 8
      },
      {
        "text": "Awaken refreshed with divine clarity",
        "consequence": "Full 100% squad revitalization and heal! (+100% Team Heal)",
        "action": "heal_team",
        "value": 100
      }
    ]
  },
  {
    "id": "plush_grand_championship_podium",
    "title": "The Gold Medal Rostrum",
    "description": "A three-tiered wooden championship podium decorated with laurel wreaths and plush gold medallions awaiting the champions.",
    "icon": "🥇",
    "choices": [
      {
        "text": "Step up to the 1st place champion tier",
        "consequence": "Grand champion purse collected! (+90 Stuffydolars)",
        "action": "gain_gold",
        "value": 90
      },
      {
        "text": "Accept the grand champion championship belt",
        "consequence": "Championship belt relic bestowed upon the team!",
        "action": "gain_relic"
      }
    ]
  },
  {
    "id": "final_bedroom_dawn_awakening",
    "title": "The Golden Sunrise Through the Curtains",
    "description": "Golden morning sunlight floods through the windowpanes. Dust motes dance in the air as the house begins to stir with life and love.",
    "icon": "🌅",
    "choices": [
      {
        "text": "Soak in the morning sunlight of new beginnings",
        "consequence": "Glorious sunlight heals all squad members to full! (+100% Team Heal)",
        "action": "heal_team",
        "value": 100
      },
      {
        "text": "Harvest the golden dawn blessings",
        "consequence": "Permanent +10 Max HP to your entire squad!",
        "action": "max_hp_boost",
        "value": 10
      },
      {
        "text": "Collect the morning allowance on the dresser",
        "consequence": "Found crisp morning allowance bills! (+100 Stuffydolars)",
        "action": "gain_gold",
        "value": 100
      }
    ]
  }
];
