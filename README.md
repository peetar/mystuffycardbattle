# 🧸 Ben's Stuffy Card Battle

A 16-bit retro pixel-art card battler featuring 16 real-life stuffed animals clashing in 5v5 tactical card battles. Hosted on Vercel with Next.js, React, Tailwind CSS, and Framer Motion.

---

## 🎮 Game Modes

### 1. 👑 Campaign Mode (Roguelike / Slay the Spire Style)
- **Draft Phase**: Pick your starter 5 stuffies. For each stuffy, choose 1 of 3 balanced 10-card deck presets (averaging B-tier power).
- **Branching Map**: Navigate nodes from Floor 1 to the Boss:
  - ⚔️ **Monster**: 5v5 battle against wild stuffies. Rewards: Gold + Pick 1 of 3 Cards + Food.
  - 👹 **Elite**: Dangerous 5v5 encounter with boosted rewards and relic drops.
  - ❓ **Event**: Narrative random events with risk/reward choices.
  - 🛒 **Merchant**: Purchase new stuffies (added to bench with 10 cards), upgrade cards (+30% stats), remove unwanted cards, buy relics, permanent Fluff HP boosts, and feed foods.
  - 🏕️ **Rest Site**: Rest party (+35% fluff heal), feed foods, or upgrade a card for free! *(Note: Rests don't affect Beaker, but he passively heals +1 HP every battle turn!)*
  - 👑 **Boss**: Climax showdown against the ultimate plush menace!

### 2. 🎮 2-Player Versus Mode (Pass & Play)
- **Alternating Draft**: Players take turns drafting stuffies from the 16-character pool until 5v5 squads are formed.
- **⚡ First Blood Reinforcement Pool**: Exactly 3 stuffies remain in the center pool. When the first stuffy dies in the battle, the victim receives **2** reserve stuffies and the killer receives **1**!
- **🔒 Privacy Cover Screen**: Between turns, a full-screen pass-the-device cover prevents opponents from peeking at each other's cards.

---

## ⚔️ Combat Mechanics

- **Crackers (Mana)**: Start each turn with **7 Crackers** (or 8 with the Bottomless Cracker Tin relic) to play cards.
- **Hand Size**: Draw **up to 5 cards** at the start of each turn (unplayed cards are retained in hand!).
- **5v5 Free Targeting**: Any stuffy can target any opponent or ally across the field.
- **Unstuffed State**: When a stuffy hits 0 HP, they deflate into loose plush fluff on the field. They cannot act, but can be revived during battle using **Restitch** cards!
- **Food Healing Formula**:
  - If stuffy HP > 90%: **100% Full Heal** regardless of food type.
  - Otherwise:
    - **Favorite Food**: Restores **75%** of missing health.
    - **Mid Food**: Restores **37.5%** of missing health.
    - **Hated Food**: Restores **25%** of missing health.

---

## 🐾 The 16 Stuffy Roster

1. **Alex (Pink Axolotl)**: Derps all day. S-Tier: *Strokenosis* (mind-controls opponent to play 1 of their hand cards).
2. **Jefe (Blue Penguin)**: "Pudge" emperor who hates being called fat. S-Tier: *Earthquake* (massive AOE, 75% crack trap).
3. **Finlee (Blue Orca)**: Devours everything; attacks lifesteal. S-Tier: *Swallow Whole* (perma-eats enemy whole, cannot be restitched!).
4. **Fifi (Red Fox)**: Round, chubby, farts a lot. Leaves stacking Poison DoT clouds.
5. **Thumper (Grey Hammerhead)**: Thumps everything in sight. Inflicts *Brain Damage* (disables stuffy until healed).
6. **Toothless (Night Fury Dragon)**: Drops explosive plasma poo bombs and supersonic dive attacks.
7. **Riolu (Pokémon)**: Dedicated Aura healing and restitch support specialist.
8. **Eevee (Pokémon)**: Creepy occult lasers, particle beams, and guided missile swarms.
9. **Slugmee (Yellow Slug)**: Sings deadly murder songs: *"Slug me, slug you, now I'm gonna hug you"*.
10. **Beaker (Yosemite Owl)**: Wise dive-bomber. Rests don't affect him, but passively heals +1 HP every combat turn!
11. **Henry (Baby Turtle)**: Always urgently has to go potty. *Shell Up* taunts all enemies and reduces damage taken by 75%!
12. **Dear (Poison Dart Frog)**: Microscopic size, highly evasive, contact poison skin.
13. **Cole (Mini Turtle)**: Henry's toddler brother. High-speed spinning shell attacks and armor buffs.
14. **Joann (Brown Cat)**: Knocks cards straight off the table to force opponent discards.
15. **Cidney (Fat Squirrel)**: Acorn colossus. Body slams enemies and raids acorn caches for bonus Crackers.
16. **Chanteira (Fat Dolphin)**: Equal size to Cidney. Emits ultrasonic echolocation sonar and tidal waves.

---

## 🚀 Running Locally & Deploying to Vercel

### Run Locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build:
```bash
npm run build
```

### Deploy to Vercel:
Push to GitHub and import into Vercel with default Next.js settings!
