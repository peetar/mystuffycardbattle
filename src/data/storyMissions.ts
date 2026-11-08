/**
 * Story Mode Missions (v4.3 "The Second Coming Update")
 * 5 Parts architecture, 528 sectors per part (2640 total sectors).
 * Features all 32 plushie rescues with big gaps between stuffies across the 5 parts:
 * Part 1: Alex, Shade, Finlee (Armory), Slugmee, Spike (Lab), Spot, Cow -> Climax 528
 * Part 2: Cidney (Fairy Well), Chanteira, Allie, Sluger, Fifi, Joann, George -> Climax 1056
 * Part 3: Ralou, Thumper, Lessteeth, Beaker, Eavie, Dear, Cole -> Climax 1584
 * Part 4: Henry, Pinky Bear, Big Bear, Umbratail, Tyrant -> Climax 2112
 * Part 5: Dolphy, Dolpher, Dolphim, Grumpy Rhino, Farty Lama, Unicorn -> Citadel 2640
 */

import { StoryMission, StoryMissionFloor, QuestType } from '@/types/story';
import { getSectorById } from './storySectors';

export interface StoryQuestStep {
  stepIndex: number;
  sectorId: number;
  missionId: string;
  title: string;
  partNumber: number;
  isRevisit?: boolean;
  unlockStuffySpeciesId?: string;
  milestone?: 'armory' | 'lab' | 'fairy_well';
  requiredSpeciesIds?: string[];
  cutsceneEpisodeId?: string;
}

export const ALL_STORY_SPECIES_ORDER = [
  'jefe',
  'alex',
  'shadow',
  'finlee',
  'slugmee',
  'spike',
  'spot',
  'cow',
  'cidney',
  'chanteira',
  'allie',
  'sluger',
  'fifi',
  'joann',
  'george',
  'riolu',
  'thumper',
  'toothless',
  'beaker',
  'eevee',
  'dear',
  'cole',
  'henry',
  'pinky_bear',
  'big_bear',
  'umbreon',
  'tyrant',
  'dolphy',
  'dolpher',
  'dolphim',
  'grumpy_rhino',
  'farty_lama',
  'unicorn',
];

export const STORY_MAIN_QUEST_STEPS: StoryQuestStep[] = [
  // --- PART 1 (Sectors 1..528) ---
  { stepIndex: 0, partNumber: 1, sectorId: 2, missionId: 'm_p1_start', title: 'The Stitched Awakening', requiredSpeciesIds: ['jefe'], cutsceneEpisodeId: 'cutscene_part1_intro' },
  { stepIndex: 1, partNumber: 1, sectorId: 10, missionId: 'm_p1_hallway', title: 'Hallway Scouting', requiredSpeciesIds: ['jefe'] },
  { stepIndex: 2, partNumber: 1, sectorId: 24, missionId: 'm_p1_alex', title: 'Sock Drawer Rescue: Alex', unlockStuffySpeciesId: 'alex', requiredSpeciesIds: ['jefe'], cutsceneEpisodeId: 'cutscene_rescue_alex' },
  { stepIndex: 3, partNumber: 1, sectorId: 40, missionId: 'm_p1_gate', title: 'Lawn Gate Discovery', requiredSpeciesIds: ['alex'] },
  { stepIndex: 4, partNumber: 1, sectorId: 60, missionId: 'm_p1_flowerbed', title: 'Flowerbed Thicket Path', requiredSpeciesIds: ['alex'] },
  { stepIndex: 5, partNumber: 1, sectorId: 96, missionId: 'm_p1_shadow', title: 'Garden Patio Rescue: Shade', unlockStuffySpeciesId: 'shadow', requiredSpeciesIds: ['alex'], cutsceneEpisodeId: 'cutscene_rescue_shadow' },
  // REVISIT 1
  { stepIndex: 6, partNumber: 1, sectorId: 2, missionId: 'm_p1_rev1', title: 'Revisit House: Closet Secret Key', isRevisit: true, requiredSpeciesIds: ['shadow'] },
  { stepIndex: 7, partNumber: 1, sectorId: 180, missionId: 'm_p1_finlee', title: 'Workshop Shed Rescue: Finlee (Armory)', milestone: 'armory', unlockStuffySpeciesId: 'finlee', requiredSpeciesIds: ['shadow'], cutsceneEpisodeId: 'cutscene_rescue_finlee' },
  { stepIndex: 8, partNumber: 1, sectorId: 210, missionId: 'm_p1_hedgerow', title: 'Hedgerow Border Trail', requiredSpeciesIds: ['finlee'] },
  // REVISIT 2
  { stepIndex: 9, partNumber: 1, sectorId: 12, missionId: 'm_p1_rev2', title: 'Revisit Backyard: Sprinkler Ambush', isRevisit: true, requiredSpeciesIds: ['finlee'] },
  { stepIndex: 10, partNumber: 1, sectorId: 270, missionId: 'm_p1_slugmee', title: 'Apartment Breezeway Rescue: Slugmee', unlockStuffySpeciesId: 'slugmee', requiredSpeciesIds: ['finlee'], cutsceneEpisodeId: 'cutscene_rescue_slugmee' },
  { stepIndex: 11, partNumber: 1, sectorId: 310, missionId: 'm_p1_stepping', title: 'Stepping Stones Path', requiredSpeciesIds: ['slugmee'] },
  { stepIndex: 12, partNumber: 1, sectorId: 360, missionId: 'm_p1_spike', title: "Necak's Workshop Rescue: Spike (Star Lab)", milestone: 'lab', unlockStuffySpeciesId: 'spike', requiredSpeciesIds: ['slugmee'], cutsceneEpisodeId: 'cutscene_rescue_spike' },
  // REVISIT 3
  { stepIndex: 13, partNumber: 1, sectorId: 18, missionId: 'm_p1_rev3', title: 'Revisit Shed: Workshop Anvil Test', isRevisit: true, requiredSpeciesIds: ['spike'] },
  { stepIndex: 14, partNumber: 1, sectorId: 440, missionId: 'm_p1_spot', title: "Necak's Terrace Rescue: Spot", unlockStuffySpeciesId: 'spot', requiredSpeciesIds: ['spike'], cutsceneEpisodeId: 'cutscene_rescue_spot' },
  // REVISIT 4
  { stepIndex: 15, partNumber: 1, sectorId: 4, missionId: 'm_p1_rev4', title: 'Revisit Kitchen: Pantry Ration Run', isRevisit: true, requiredSpeciesIds: ['spot'] },
  { stepIndex: 16, partNumber: 1, sectorId: 520, missionId: 'm_p1_cow', title: "Necak's Barnyard Sanctuary: Cow", unlockStuffySpeciesId: 'cow', requiredSpeciesIds: ['spot'], cutsceneEpisodeId: 'cutscene_rescue_cow' },
  { stepIndex: 17, partNumber: 1, sectorId: 528, missionId: 'm_p1_climax', title: 'Part 1 Climax: The Fabric Behemoth', requiredSpeciesIds: ['cow'], cutsceneEpisodeId: 'cutscene_part1_climax' },

  // --- PART 2 (Sectors 529..1056) ---
  { stepIndex: 18, partNumber: 2, sectorId: 540, missionId: 'm_p2_start', title: 'The Great Ridge Overlook', requiredSpeciesIds: ['cow'], cutsceneEpisodeId: 'cutscene_part2_intro' },
  { stepIndex: 19, partNumber: 2, sectorId: 600, missionId: 'm_p2_cidney', title: 'High-Rise Balcony Rescue: Cidney (Fairy Well)', milestone: 'fairy_well', unlockStuffySpeciesId: 'cidney', requiredSpeciesIds: ['cow'], cutsceneEpisodeId: 'cutscene_rescue_cidney' },
  // REVISIT 5
  { stepIndex: 20, partNumber: 2, sectorId: 56, missionId: 'm_p2_rev5', title: "Revisit Necak Barn: Hay Bale Fort", isRevisit: true, requiredSpeciesIds: ['cidney'] },
  { stepIndex: 21, partNumber: 2, sectorId: 680, missionId: 'm_p2_chanteira', title: 'Elevator Shaft Rescue: Chanteira', unlockStuffySpeciesId: 'chanteira', requiredSpeciesIds: ['cidney'], cutsceneEpisodeId: 'cutscene_rescue_chanteira' },
  // REVISIT 6
  { stepIndex: 22, partNumber: 2, sectorId: 20, missionId: 'm_p2_rev6', title: 'Revisit Backyard: Secret Shrub Path', isRevisit: true, requiredSpeciesIds: ['chanteira'] },
  { stepIndex: 23, partNumber: 2, sectorId: 740, missionId: 'm_p2_allie', title: 'Murky Swamp Shore Rescue: Allie', unlockStuffySpeciesId: 'allie', requiredSpeciesIds: ['chanteira'], cutsceneEpisodeId: 'cutscene_rescue_allie' },
  // REVISIT 7
  { stepIndex: 24, partNumber: 2, sectorId: 105, missionId: 'm_p2_rev7', title: 'Revisit Forest: Mossy Boulder Cache', isRevisit: true, requiredSpeciesIds: ['allie'] },
  { stepIndex: 25, partNumber: 2, sectorId: 800, missionId: 'm_p2_sluger', title: 'Canyon Creek Rescue: Sluger', unlockStuffySpeciesId: 'sluger', requiredSpeciesIds: ['allie'], cutsceneEpisodeId: 'cutscene_rescue_sluger' },
  // REVISIT 8
  { stepIndex: 26, partNumber: 2, sectorId: 18, missionId: 'm_p2_rev8', title: 'Revisit Shed: Sewing Needle Sharpening', isRevisit: true, requiredSpeciesIds: ['sluger'] },
  { stepIndex: 27, partNumber: 2, sectorId: 860, missionId: 'm_p2_fifi', title: 'Treetop Canopy Rescue: Fifi', unlockStuffySpeciesId: 'fifi', requiredSpeciesIds: ['sluger'], cutsceneEpisodeId: 'cutscene_rescue_fifi' },
  // REVISIT 9
  { stepIndex: 28, partNumber: 2, sectorId: 112, missionId: 'm_p2_rev9', title: 'Revisit Forest: Hollow Stump Stash', isRevisit: true, requiredSpeciesIds: ['fifi'] },
  { stepIndex: 29, partNumber: 2, sectorId: 920, missionId: 'm_p2_joann', title: 'Picnic Table Rescue: Joann', unlockStuffySpeciesId: 'joann', requiredSpeciesIds: ['fifi'], cutsceneEpisodeId: 'cutscene_rescue_joann' },
  // REVISIT 10
  { stepIndex: 30, partNumber: 2, sectorId: 52, missionId: 'm_p2_rev10', title: "Revisit Necak House: Windmill Signal", isRevisit: true, requiredSpeciesIds: ['joann'] },
  { stepIndex: 31, partNumber: 2, sectorId: 980, missionId: 'm_p2_george', title: 'Forest Pine Spire Rescue: George', unlockStuffySpeciesId: 'george', requiredSpeciesIds: ['joann'], cutsceneEpisodeId: 'cutscene_rescue_george' },
  { stepIndex: 32, partNumber: 2, sectorId: 1056, missionId: 'm_p2_climax', title: 'Part 2 Climax: The Stuffed Amalgam (Main Game Boss)', requiredSpeciesIds: ['george'], cutsceneEpisodeId: 'cutscene_part2_climax' },

  // --- PART 3 (Sectors 1057..1584) ---
  { stepIndex: 33, partNumber: 3, sectorId: 1070, missionId: 'm_p3_start', title: 'Entrance to the Shimmering Dunes', requiredSpeciesIds: ['george'], cutsceneEpisodeId: 'cutscene_part3_intro' },
  { stepIndex: 34, partNumber: 3, sectorId: 1140, missionId: 'm_p3_riolu', title: 'Beach Umbrella Camp Rescue: Ralou', unlockStuffySpeciesId: 'riolu', requiredSpeciesIds: ['george'], cutsceneEpisodeId: 'cutscene_rescue_riolu' },
  // REVISIT 11
  { stepIndex: 35, partNumber: 3, sectorId: 80, missionId: 'm_p3_rev11', title: 'Revisit Apartments: Antenna Array', isRevisit: true, requiredSpeciesIds: ['riolu'] },
  { stepIndex: 36, partNumber: 3, sectorId: 1200, missionId: 'm_p3_thumper', title: 'Rocky Tide Pools Rescue: Thumper', unlockStuffySpeciesId: 'thumper', requiredSpeciesIds: ['riolu'], cutsceneEpisodeId: 'cutscene_rescue_thumper' },
  // REVISIT 12
  { stepIndex: 37, partNumber: 3, sectorId: 148, missionId: 'm_p3_rev12', title: 'Revisit Beach: Pearl Shallows', isRevisit: true, requiredSpeciesIds: ['thumper'] },
  { stepIndex: 38, partNumber: 3, sectorId: 1260, missionId: 'm_p3_toothless', title: 'Bioluminescent Trench Rescue: Lessteeth', unlockStuffySpeciesId: 'toothless', requiredSpeciesIds: ['thumper'], cutsceneEpisodeId: 'cutscene_rescue_toothless' },
  // REVISIT 13
  { stepIndex: 39, partNumber: 3, sectorId: 175, missionId: 'm_p3_rev13', title: 'Revisit Ocean: Submerged Coral Shelf', isRevisit: true, requiredSpeciesIds: ['toothless'] },
  { stepIndex: 40, partNumber: 3, sectorId: 1320, missionId: 'm_p3_beaker', title: 'Abyssal Trench Rescue: Beaker', unlockStuffySpeciesId: 'beaker', requiredSpeciesIds: ['toothless'], cutsceneEpisodeId: 'cutscene_rescue_beaker' },
  // REVISIT 14
  { stepIndex: 41, partNumber: 3, sectorId: 38, missionId: 'm_p3_rev14', title: 'Revisit Fairy Well: Starlight Font', isRevisit: true, requiredSpeciesIds: ['beaker'] },
  { stepIndex: 42, partNumber: 3, sectorId: 1380, missionId: 'm_p3_eevee', title: 'Oak Avenue Rescue: Eavie', unlockStuffySpeciesId: 'eevee', requiredSpeciesIds: ['beaker'], cutsceneEpisodeId: 'cutscene_rescue_eevee' },
  // REVISIT 15
  { stepIndex: 43, partNumber: 3, sectorId: 1, missionId: 'm_p3_rev15', title: "Revisit House: Ben's Desk Drawer", isRevisit: true, requiredSpeciesIds: ['eevee'] },
  { stepIndex: 44, partNumber: 3, sectorId: 1440, missionId: 'm_p3_dear', title: 'Cul-de-Sac Rescue: Dear', unlockStuffySpeciesId: 'dear', requiredSpeciesIds: ['eevee'], cutsceneEpisodeId: 'cutscene_rescue_dear' },
  // REVISIT 16
  { stepIndex: 45, partNumber: 3, sectorId: 215, missionId: 'm_p3_rev16', title: 'Revisit Suburb: Autumn Leaf Pile', isRevisit: true, requiredSpeciesIds: ['dear'] },
  { stepIndex: 46, partNumber: 3, sectorId: 1500, missionId: 'm_p3_cole', title: 'Jungle Gym Rescue: Cole', unlockStuffySpeciesId: 'cole', requiredSpeciesIds: ['dear'], cutsceneEpisodeId: 'cutscene_rescue_cole' },
  { stepIndex: 47, partNumber: 3, sectorId: 1584, missionId: 'm_p3_climax', title: 'Part 3 Climax: The Puppet Ringmaster', requiredSpeciesIds: ['cole'], cutsceneEpisodeId: 'cutscene_part3_climax' },

  // --- PART 4 (Sectors 1585..2112) ---
  { stepIndex: 48, partNumber: 4, sectorId: 1600, missionId: 'm_p4_start', title: 'Ascending the Brass Spire', requiredSpeciesIds: ['cole'], cutsceneEpisodeId: 'cutscene_part4_intro' },
  { stepIndex: 49, partNumber: 4, sectorId: 1660, missionId: 'm_p4_henry', title: 'Monkey Bar Heights Rescue: Henry', unlockStuffySpeciesId: 'henry', requiredSpeciesIds: ['cole'], cutsceneEpisodeId: 'cutscene_rescue_henry' },
  // REVISIT 17
  { stepIndex: 50, partNumber: 4, sectorId: 70, missionId: 'm_p4_rev17', title: 'Revisit Apartments: Laundry Chute Tunnel', isRevisit: true, requiredSpeciesIds: ['henry'] },
  { stepIndex: 51, partNumber: 4, sectorId: 1740, missionId: 'm_p4_pinky', title: 'Carnival Tent Rescue: Pinky Bear', unlockStuffySpeciesId: 'pinky_bear', requiredSpeciesIds: ['henry'], cutsceneEpisodeId: 'cutscene_rescue_pinky_bear' },
  // REVISIT 18
  { stepIndex: 52, partNumber: 4, sectorId: 125, missionId: 'm_p4_rev18', title: 'Revisit Forest: Whispering Pines Crest', isRevisit: true, requiredSpeciesIds: ['pinky_bear'] },
  { stepIndex: 53, partNumber: 4, sectorId: 1820, missionId: 'm_p4_bigbear', title: 'Sky Islands Sanctuary Rescue: Big Bear', unlockStuffySpeciesId: 'big_bear', requiredSpeciesIds: ['pinky_bear'], cutsceneEpisodeId: 'cutscene_rescue_big_bear' },
  // REVISIT 19
  { stepIndex: 54, partNumber: 4, sectorId: 160, missionId: 'm_p4_rev19', title: 'Revisit Beach: Moonlit Dunes', isRevisit: true, requiredSpeciesIds: ['big_bear'] },
  { stepIndex: 55, partNumber: 4, sectorId: 1920, missionId: 'm_p4_umbreon', title: 'Magma Ridge Forge Rescue: Umbratail', unlockStuffySpeciesId: 'umbreon', requiredSpeciesIds: ['big_bear'], cutsceneEpisodeId: 'cutscene_rescue_umbreon' },
  // REVISIT 20
  { stepIndex: 56, partNumber: 4, sectorId: 2, missionId: 'm_p4_rev20', title: 'Revisit House: Grand War Room Assembly', isRevisit: true, requiredSpeciesIds: ['umbreon'] },
  { stepIndex: 57, partNumber: 4, sectorId: 2040, missionId: 'm_p4_tyrant', title: 'Prehistoric Caldera Rescue: Tyrant', unlockStuffySpeciesId: 'tyrant', requiredSpeciesIds: ['umbreon'], cutsceneEpisodeId: 'cutscene_rescue_tyrant' },
  { stepIndex: 58, partNumber: 4, sectorId: 2112, missionId: 'm_p4_climax', title: 'Part 4 Climax: Prehistoric Volcanic Titan', requiredSpeciesIds: ['tyrant'], cutsceneEpisodeId: 'cutscene_part4_climax' },

  // --- PART 5 (Sectors 2113..2640) - THE SECOND COMING ---
  { stepIndex: 59, partNumber: 5, sectorId: 2125, missionId: 'm_p5_start', title: 'Threshold of the Second Coming', requiredSpeciesIds: ['tyrant'], cutsceneEpisodeId: 'cutscene_part5_intro' },
  { stepIndex: 60, partNumber: 5, sectorId: 2190, missionId: 'm_p5_dolphy', title: 'Coral Atoll Rescue: Dolphy', unlockStuffySpeciesId: 'dolphy', requiredSpeciesIds: ['tyrant'], cutsceneEpisodeId: 'cutscene_rescue_dolphy' },
  // REVISIT 21
  { stepIndex: 61, partNumber: 5, sectorId: 195, missionId: 'm_p5_rev21', title: 'Revisit Upgel Didav: Ancient Tidal Resonator', isRevisit: true, requiredSpeciesIds: ['dolphy'] },
  { stepIndex: 62, partNumber: 5, sectorId: 2270, missionId: 'm_p5_dolpher', title: 'Azure Lagoon Rescue: Dolpher', unlockStuffySpeciesId: 'dolpher', requiredSpeciesIds: ['dolphy'], cutsceneEpisodeId: 'cutscene_rescue_dolpher' },
  // REVISIT 22
  { stepIndex: 63, partNumber: 5, sectorId: 200, missionId: 'm_p5_rev22', title: 'Revisit Ocean: Abyssal Rift Tremor', isRevisit: true, requiredSpeciesIds: ['dolpher'] },
  { stepIndex: 64, partNumber: 5, sectorId: 2350, missionId: 'm_p5_dolphim', title: 'Sonar Reef Rescue: Dolphim', unlockStuffySpeciesId: 'dolphim', requiredSpeciesIds: ['dolpher'], cutsceneEpisodeId: 'cutscene_rescue_dolphim' },
  // REVISIT 23
  { stepIndex: 65, partNumber: 5, sectorId: 50, missionId: 'm_p5_rev23', title: "Revisit Necak Lab: Star Alignment", isRevisit: true, requiredSpeciesIds: ['dolphim'] },
  { stepIndex: 66, partNumber: 5, sectorId: 2430, missionId: 'm_p5_rhino', title: 'Craggy Ridge Rescue: Grumpy Rhino', unlockStuffySpeciesId: 'grumpy_rhino', requiredSpeciesIds: ['dolphim'], cutsceneEpisodeId: 'cutscene_rescue_grumpy_rhino' },
  // REVISIT 24
  { stepIndex: 67, partNumber: 5, sectorId: 16, missionId: 'm_p5_rev24', title: 'Revisit Backyard: Shade Trial II', isRevisit: true, requiredSpeciesIds: ['grumpy_rhino'] },
  { stepIndex: 68, partNumber: 5, sectorId: 2510, missionId: 'm_p5_lama', title: 'Pinata Valley Rescue: Farty Lama', unlockStuffySpeciesId: 'farty_lama', requiredSpeciesIds: ['grumpy_rhino'], cutsceneEpisodeId: 'cutscene_rescue_farty_lama' },
  // REVISIT 25
  { stepIndex: 69, partNumber: 5, sectorId: 245, missionId: 'm_p5_rev25', title: 'Revisit Playground: Spiral Slide Patrol', isRevisit: true, requiredSpeciesIds: ['farty_lama'] },
  { stepIndex: 70, partNumber: 5, sectorId: 2590, missionId: 'm_p5_unicorn', title: 'Prism Peak Rescue: Unicorn', unlockStuffySpeciesId: 'unicorn', requiredSpeciesIds: ['farty_lama'], cutsceneEpisodeId: 'cutscene_rescue_unicorn' },
  // REVISIT 26 - 29 (Final Preparations)
  { stepIndex: 71, partNumber: 5, sectorId: 38, missionId: 'm_p5_rev26', title: 'Revisit Fairy Well: Fountain of the Second Coming', isRevisit: true, requiredSpeciesIds: ['unicorn'] },
  { stepIndex: 72, partNumber: 5, sectorId: 56, missionId: 'm_p5_rev27', title: "Revisit Necak Barn: Grand Vanguard Council", isRevisit: true, requiredSpeciesIds: ['unicorn'] },
  { stepIndex: 73, partNumber: 5, sectorId: 2, missionId: 'm_p5_rev28', title: 'Revisit House: Ben\'s Sacred Stitching Needle', isRevisit: true, requiredSpeciesIds: ['unicorn'] },
  { stepIndex: 74, partNumber: 5, sectorId: 2600, missionId: 'm_p5_rev29', title: 'The Astral Causeway Approach', isRevisit: true, requiredSpeciesIds: ['unicorn'] },
  { stepIndex: 75, partNumber: 5, sectorId: 2640, missionId: 'm_citadel_finale', title: "Grand Finale: The Stitchmaster's Citadel", requiredSpeciesIds: ['unicorn'], cutsceneEpisodeId: 'cutscene_citadel_finale' },
];

function createFloors(totalActs: number, totalFloors: number, enemyPool: string[], bossSpeciesId?: string): StoryMissionFloor[] {
  const floors: StoryMissionFloor[] = [];
  const floorsPerAct = Math.ceil(totalFloors / totalActs);

  for (let f = 1; f <= totalFloors; f++) {
    const actNumber = Math.min(totalActs, Math.ceil(f / floorsPerAct));
    const isActBoss = f % floorsPerAct === 0 || f === totalFloors;
    const isEvent = !isActBoss && f % 3 === 2;
    const isElite = !isActBoss && !isEvent && f % 2 === 0;

    const floorType: 'monster' | 'elite' | 'event' | 'boss' = isActBoss
      ? 'boss'
      : isEvent
      ? 'event'
      : isElite
      ? 'elite'
      : 'monster';

    const count = isActBoss ? 3 : isElite ? 3 : 2;
    const enemies: string[] = [];
    for (let c = 0; c < count; c++) {
      enemies.push(enemyPool[c % enemyPool.length] || 'wild_stuffy');
    }

    floors.push({
      floorNumber: f,
      actNumber,
      type: floorType,
      enemySpeciesIds: enemies,
      enemyLevel: Math.max(1, f * 5),
      bossSpeciesId: isActBoss ? bossSpeciesId || 'amalgam' : undefined,
    });
  }
  return floors;
}

export function generateMissionForStep(step: StoryQuestStep): StoryMission {
  const sector = getSectorById(step.sectorId);
  const isFinale = step.sectorId === 2640;
  const isPartClimax = [528, 1056, 1584, 2112, 2640].includes(step.sectorId);
  const enemyPool = ['lint_vampire', 'toxic_slug', 'cinder_beast', 'clockwork_nuke'];

  // Sector 1056 occurs after exactly 33 sector missions (steps 0 to 32)
  // Boss is explicitly the main game colossal boss: The Stuffed Amalgam ('amalgam')!
  const bossSpecies = step.sectorId === 1056 ? 'amalgam' : isFinale ? 'stitchmaster_final' : sector?.bossSpeciesId;

  return {
    id: step.missionId,
    sectorId: step.sectorId,
    title: step.title,
    synopsis: `Story Objective ${step.stepIndex + 1} in Part ${step.partNumber}: Explore Sector ${step.sectorId} to progress the rescue campaign.`,
    totalActs: isFinale ? 4 : isPartClimax ? 3 : 2,
    totalFloors: isFinale ? 12 : isPartClimax ? 9 : 6,
    recommendedLevel: sector?.recommendedLevel || 1,
    questType: 'main',
    isRevisit: step.isRevisit,
    requiredSpeciesIds: step.requiredSpeciesIds,
    unlockStuffySpeciesId: step.unlockStuffySpeciesId,
    rewardPacksRarity: isFinale ? 'legendary' : isPartClimax ? 'epic' : step.unlockStuffySpeciesId ? 'rare' : 'uncommon',
    rewardPacksCount: isFinale ? 3 : step.unlockStuffySpeciesId ? 2 : 1,
    milestone: step.milestone,
    floors: createFloors(
      isFinale ? 4 : isPartClimax ? 3 : 2,
      isFinale ? 12 : isPartClimax ? 9 : 6,
      enemyPool,
      bossSpecies
    ),
  };
}

export const STORY_MISSIONS: Record<string, StoryMission> = {};
STORY_MAIN_QUEST_STEPS.forEach((step) => {
  STORY_MISSIONS[step.missionId] = generateMissionForStep(step);
});

export interface MainGameBoss {
  speciesId: string;
  name: string;
  title: string;
  enemyIds: string[];
}

/**
 * The 16 Main Game Boss Encounters (from stuffies.ts BOSS_SPECIES_IDS).
 * Ordered so that every 33 milestone guarantees a certain boss from the 16
 * with ZERO repeats across each 16-milestone cycle (16 * 33 = 528 sectors = 1 Part).
 * Milestone 16 (Sector 528) and Milestone 32 (Sector 1056) culminate on 'amalgam' (The Stuffed Amalgam).
 */
export const MAIN_GAME_16_BOSSES: MainGameBoss[] = [
  { speciesId: 'lint_vampire', name: 'The Static Sapper', title: 'The Strength Devourer', enemyIds: ['lint_vampire'] },
  { speciesId: 'toxic_slug', name: 'Noxious Slime King', title: 'The Venom Sovereign', enemyIds: ['toxic_slug'] },
  { speciesId: 'cinder_beast', name: 'Ignis the Cinder Drake', title: 'The Blazing Scorch', enemyIds: ['cinder_beast'] },
  { speciesId: 'clockwork_nuke', name: 'Doomsday Chrono-Bear', title: 'The Ticking Cataclysm', enemyIds: ['clockwork_nuke'] },
  { speciesId: 'grave_scavenger', name: 'Scrappy the Graverobber', title: 'The Discard Fiend', enemyIds: ['grave_scavenger'] },
  { speciesId: 'mind_puppeteer', name: 'Psychic Mind-Leech', title: 'The Deck Puppeteer', enemyIds: ['mind_puppeteer'] },
  { speciesId: 'aquatic_kraken', name: 'Kraken the Abyssal', title: 'Terror of the Deeps', enemyIds: ['aquatic_kraken', 'aquatic_ray'] },
  { speciesId: 'aquatic_ray', name: 'Manta the Oceanic Glider', title: 'The Tidal Vanguard', enemyIds: ['aquatic_ray'] },
  { speciesId: 'tri_link_alpha', name: 'Aegis the Bonded Shield', title: 'Trinity Vanguard', enemyIds: ['tri_link_alpha', 'tri_link_beta', 'tri_link_gamma'] },
  { speciesId: 'tri_link_beta', name: 'Fang the Bonded Striker', title: 'Trinity Berserker', enemyIds: ['tri_link_beta'] },
  { speciesId: 'tri_link_gamma', name: 'Talon the Bonded Mystic', title: 'Trinity Channeler', enemyIds: ['tri_link_gamma'] },
  { speciesId: 'shadow_hedgehog', name: 'Shade the Sovereign', title: 'The Shadow Blur Boss', enemyIds: ['shadow_hedgehog'] },
  { speciesId: 'mirror_mimic', name: 'The Mirror Doppelganger', title: 'The Glass Phantom', enemyIds: ['mirror_mimic'] },
  { speciesId: 'fluff_gorgon', name: 'The Fluff Devourer', title: 'The Bottomless Maw', enemyIds: ['fluff_gorgon'] },
  { speciesId: 'volt_colossus', name: 'Surge the Thunder Golem', title: 'The EMP Juggernaut', enemyIds: ['volt_colossus'] },
  { speciesId: 'amalgam', name: 'The Stuffed Amalgam', title: 'The Fused Nightmare', enemyIds: ['amalgam'] },
];

export function getMainGameBossForMilestone(
  milestoneNumber: number,
  alreadyEncounteredIds: string[] = []
): MainGameBoss {
  const normalized = Math.max(1, Math.floor(milestoneNumber));
  const targetCandidate = MAIN_GAME_16_BOSSES[(normalized - 1) % MAIN_GAME_16_BOSSES.length];

  const cycleStart = Math.floor((normalized - 1) / 16) * 16;
  const cycleEncountered = alreadyEncounteredIds.slice(cycleStart, cycleStart + 16);
  if (!cycleEncountered.includes(targetCandidate.speciesId)) {
    return targetCandidate;
  }

  const remaining = MAIN_GAME_16_BOSSES.filter((b) => !cycleEncountered.includes(b.speciesId));
  if (remaining.length > 0) {
    return remaining[0];
  }
  return targetCandidate;
}

export function getMainGameBossForSectorOrCount(
  sectorId: number,
  clearedCount = 0,
  bossesDefeatedCount = 0,
  alreadyEncounteredIds: string[] = []
): MainGameBoss | null {
  // Sector 1056 is explicitly Part 2 Climax (Milestone 32 = 16 * 2) -> The Stuffed Amalgam
  if (sectorId === 1056) {
    return getMainGameBossForMilestone(32, alreadyEncounteredIds);
  }
  // Milestone by sectorId multiple of 33:
  if (sectorId > 0 && sectorId % 33 === 0) {
    const milestone = Math.floor(sectorId / 33);
    return getMainGameBossForMilestone(milestone, alreadyEncounteredIds);
  }
  // Milestone by completed sectors count:
  if (clearedCount > 0 && clearedCount % 33 === 0) {
    const milestone = Math.floor(clearedCount / 33);
    return getMainGameBossForMilestone(milestone, alreadyEncounteredIds);
  }
  // Milestone by defeated bosses count:
  if (bossesDefeatedCount > 0 && bossesDefeatedCount % 33 === 0) {
    const milestone = Math.floor(bossesDefeatedCount / 33);
    return getMainGameBossForMilestone(milestone, alreadyEncounteredIds);
  }
  return null;
}

export function getMissionForSector(
  sectorId: number,
  storyStepIndex = 0,
  clearedCount = 0,
  bossesDefeatedCount = 0,
  alreadyEncounteredIds: string[] = []
): StoryMission | null {
  const activeStep = getCurrentStoryObjectiveStep(storyStepIndex);
  if (activeStep && activeStep.sectorId === sectorId) {
    return STORY_MISSIONS[activeStep.missionId] || generateMissionForStep(activeStep);
  }
  const matchingStep = STORY_MAIN_QUEST_STEPS.find((s) => s.sectorId === sectorId);
  if (matchingStep) {
    return STORY_MISSIONS[matchingStep.missionId] || generateMissionForStep(matchingStep);
  }

  // Generic mission for exploration sectors:
  // Every 33 sector missions (or every 33 bosses/sectors), guaranteed to be a certain boss from the 16 (no repeats)!
  const mainGameBoss = getMainGameBossForSectorOrCount(sectorId, clearedCount, bossesDefeatedCount, alreadyEncounteredIds);
  const isMainGameBossEncounter = !!mainGameBoss || (clearedCount > 0 && clearedCount % 33 === 0) || sectorId === 1056;
  const sector = getSectorById(sectorId);
  const bossSpecies = mainGameBoss ? mainGameBoss.speciesId : 'amalgam';
  const bossName = mainGameBoss ? mainGameBoss.name : 'The Stuffed Amalgam';

  return {
    id: `m_sec_${sectorId}`,
    sectorId,
    title: isMainGameBossEncounter
      ? `Main Game Boss: ${bossName} (${sector.name})`
      : `Explore ${sector.name}`,
    synopsis: isMainGameBossEncounter
      ? `Every 33 milestone boss encounter! The guaranteed main game boss "${bossName}" from the 16 challenges your squad with no repeats!`
      : `Scout and secure Sector ${sectorId} to gather fluff, crackers, and items.`,
    totalActs: isMainGameBossEncounter ? 3 : 2,
    totalFloors: isMainGameBossEncounter ? 9 : 6,
    recommendedLevel: sector.recommendedLevel,
    questType: isMainGameBossEncounter ? 'main' : 'side',
    floors: createFloors(
      isMainGameBossEncounter ? 3 : 2,
      isMainGameBossEncounter ? 9 : 6,
      ['lint_vampire', 'toxic_slug'],
      isMainGameBossEncounter ? bossSpecies : undefined
    ),
  };
}

export function getCurrentStoryObjectiveStep(storyStepIndex: number): StoryQuestStep {
  const clamped = Math.max(0, Math.min(STORY_MAIN_QUEST_STEPS.length - 1, storyStepIndex));
  return STORY_MAIN_QUEST_STEPS[clamped];
}

export function getCurrentStoryObjectiveSectorId(storyStepIndex: number): number {
  return getCurrentStoryObjectiveStep(storyStepIndex).sectorId;
}

export function getRequiredStuffiesForSector(sectorId: number, storyStepIndex = 0): string[] {
  const step = STORY_MAIN_QUEST_STEPS.find((s) => s.sectorId === sectorId);
  if (step?.requiredSpeciesIds) return step.requiredSpeciesIds;
  return ['jefe'];
}

export function isSectorDoable(sectorId: number, unlockedStuffies: string[]): boolean {
  if (sectorId === 2 || sectorId === 3) return true;
  const required = getRequiredStuffiesForSector(sectorId);
  return required.every((id) => unlockedStuffies.includes(id));
}
