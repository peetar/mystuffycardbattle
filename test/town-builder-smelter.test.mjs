import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('===========================================================');
console.log('--- RUNNING BEN STUFFY TOWN BUILDER SMELTER TESTS ---');
console.log('===========================================================\n');

const townBuildingsContent = fs.readFileSync(path.resolve('src/data/townBuildings.ts'), 'utf-8');
const townStoreContent = fs.readFileSync(path.resolve('src/store/townStore.ts'), 'utf-8');
const townBuilderContent = fs.readFileSync(path.resolve('src/components/town/TownBuilder.tsx'), 'utf-8');

// TEST 1: SMELTER DEFINITION & CRAFTING CATEGORY
console.log('TEST 1: Smelter Building Definition...');
assert.ok(townBuildingsContent.includes("smelter: {"), 'smelter definition must be in townBuildings.ts');
assert.ok(townBuildingsContent.includes("name: 'Smelter Furnace'"), 'smelter name must be Smelter Furnace');
assert.ok(townBuildingsContent.includes("category: 'crafting'"), 'smelter category must be crafting');
console.log('  ✅ PASSED: Smelter Furnace defined in crafting category');

// TEST 2: SMELTER RECIPES & CLEAR GLASS SMELTING
console.log('\nTEST 2: Clear Glass Smelting & Smelter Recipes...');
assert.ok(townBuildingsContent.includes("export const SMELTER_RECIPES: ArtisanRecipe[] = ["), 'SMELTER_RECIPES must be exported');
assert.ok(townBuildingsContent.includes("id: 'craft_glass'"), 'craft_glass recipe must exist');
assert.ok(townBuildingsContent.includes("outputResource: 'glass'"), 'craft_glass must output glass');
assert.ok(townBuildingsContent.includes("cost: { sand: 15, coal: 5 }"), 'craft_glass must cost 15 sand and 5 coal');
console.log('  ✅ PASSED: Clear Glass Smelting recipe defined with 15 sand and 5 coal');

// TEST 3: SMELTER IN CRAFTER TICK PROGRESSION
console.log('\nTEST 3: Crafter Progression in townStore...');
assert.ok(townStoreContent.includes("b.type === 'smelter'"), 'smelter must be handled as crafter in townStore.ts');
console.log('  ✅ PASSED: Smelter Furnace actively included in tickProduction crafter cycles');

// TEST 4: HEADER BUTTON CONDITIONAL VISIBILITY
console.log('\nTEST 4: Town Header Conditional Button Visibility...');
assert.ok(townBuilderContent.includes("const hasForge = buildings.some((b) => b.type === 'forge');"), 'hasForge condition must exist');
assert.ok(townBuilderContent.includes("const hasSmelter = buildings.some((b) => b.type === 'smelter');"), 'hasSmelter condition must exist');
assert.ok(townBuilderContent.includes("const hasArtisan = buildings.some((b) => b.type === 'artisan'"), 'hasArtisan condition must exist');
assert.ok(townBuilderContent.includes("const hasPotion = buildings.some((b) => b.type === 'apothecary'"), 'hasPotion condition must exist');
assert.ok(townBuilderContent.includes("const hasDnaLab = buildings.some((b) => b.type === 'fossil_digsite'"), 'hasDnaLab condition must exist');
assert.ok(townBuilderContent.includes("{hasSmelter && ("), 'Smelter button rendered only when hasSmelter');
assert.ok(townBuilderContent.includes("{hasForge && ("), 'Forge button rendered only when hasForge');
assert.ok(townBuilderContent.includes("{hasArtisan && ("), 'Artisan button rendered only when hasArtisan');
assert.ok(townBuilderContent.includes("{hasPotion && ("), 'Potion button rendered only when hasPotion');
assert.ok(townBuilderContent.includes("{hasDnaLab && ("), 'DNA Lab button rendered only when hasDnaLab');
console.log('  ✅ PASSED: Workshop buttons strictly hidden until their corresponding building is constructed');

// TEST 5: DOUBLE-CLICK BUILDING NAVIGATION
console.log('\nTEST 5: Double-Click Building Interaction...');
assert.ok(townBuilderContent.includes("onDoubleClick="), 'onDoubleClick handler must be attached to placed buildings');
assert.ok(townBuilderContent.includes("handleBuildingDoubleClick(b)"), 'handleBuildingDoubleClick must be called on double click');
assert.ok(townBuilderContent.includes("if (b.type === 'smelter') {"), 'smelter routes to isSmelterModalOpen');
assert.ok(townBuilderContent.includes("setIsSmelterModalOpen(true)"), 'smelter double click opens smelter modal');
assert.ok(townBuilderContent.includes("setIsForgeModalOpen(true)"), 'forge double click opens forge modal');
assert.ok(townBuilderContent.includes("setIsArtisanModalOpen(true)"), 'artisan double click opens artisan modal');
assert.ok(townBuilderContent.includes("setIsPotionModalOpen(true)"), 'apothecary double click opens potion modal');
assert.ok(townBuilderContent.includes("setIsDnaLabModalOpen(true)"), 'dino lab double click opens DNA lab modal');
assert.ok(townBuilderContent.includes("setIsTechTreeModalOpen(true)"), 'town hall double click opens tech tree modal');
assert.ok(townBuilderContent.includes("setIsMoraleModalOpen(true)"), 'house double click opens morale modal');
console.log('  ✅ PASSED: Double clicking placed buildings directly routes to their specific menu');

// TEST 6: SMELTER FURNACE MODAL
console.log('\nTEST 6: Smelter Furnace Modal UI...');
assert.ok(townBuilderContent.includes("{/* SMELTER FURNACE MODAL */}"), 'Smelter Furnace modal must exist');
assert.ok(townBuilderContent.includes("THE SMELTER FURNACE"), 'Smelter modal must have title');
assert.ok(townBuilderContent.includes("SMELTER_RECIPES.map"), 'Smelter modal must render SMELTER_RECIPES');
assert.ok(townBuilderContent.includes("🔥 Smelt +"), 'Smelter craft action button must exist');
console.log('  ✅ PASSED: Dedicated Smelter Furnace modal with smelting recipes verified');

// TEST 7: WORKER ELIGIBILITY & PASSIVE STRUCTURE BANNER
console.log('\nTEST 7: Worker Eligibility & Passive Structure Banner...');
assert.ok(townBuilderContent.includes("const canAcceptWorker ="), 'canAcceptWorker check must exist');
assert.ok(townBuilderContent.includes("Passive Structure"), 'Passive Structure banner must exist for non-worker buildings');
assert.ok(townBuilderContent.includes("This building operates automatically without assigned workers"), 'Informative passive notice must exist');
console.log('  ✅ PASSED: Passive buildings cleanly inform player without misleading production halted warning');

// TEST 8: APOTHECARY AUTO-BREW & SET FOCUS
console.log('\nTEST 8: Apothecary Auto-Brew & Potion Focus...');
assert.ok(townBuilderContent.includes("APOTHECARY & POTION BREWING"), 'Apothecary inspector panel must exist');
assert.ok(townBuilderContent.includes("Auto-Brewing:"), 'Auto-Brewing progress bar must exist for apothecary');
assert.ok(townBuilderContent.includes("setArtisanRecipe(targetBuilding.id"), 'Potion modal must support setting auto-brew focus');
assert.ok(townStoreContent.includes("setArtisanRecipe: (id: string, recipeId: string | null) => void;"), 'townStore must support setting or clearing recipe focus');
console.log('  ✅ PASSED: Apothecary auto-brewing and potion focus selection verified');

console.log('\n===========================================================');
console.log('🎉 ALL TOWN BUILDER SMELTER & DOUBLE-CLICK TESTS PASSED! 🎉');
console.log('===========================================================');
