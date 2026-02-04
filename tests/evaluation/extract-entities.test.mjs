/**
 * Tests for Evaluation - Extract Entities
 * 
 * Tests: extractEntitiesFromAST for converting parser AST to structured entities
 * 
 * Note: extractEntitiesFromAST expects ast.entities format (object keyed by entity name),
 * not the structured format from extractEntities().
 */

import { extractEntitiesFromAST } from '../../src/evaluate/extract-entities.mjs';
import { parseCNL } from '../../src/cnl/validator.mjs';

// Helper: get rawEntities from AST (ast.entities format)
function getRawEntities(ast) {
  return ast.entities || {};
}

// Test: Extracts characters with archetypes
export function testExtractsCharactersWithArchetypes() {
  const cnl = `
Hero is hero with trait brave
Mentor is mentor with trait wise
Villain is shadow with trait cunning
`;
  
  const { ast } = parseCNL(cnl);
  const rawEntities = getRawEntities(ast);
  
  const entities = extractEntitiesFromAST(rawEntities, ast);
  
  if (entities.characters.length !== 3) {
    throw new Error(`Expected 3 characters, got ${entities.characters.length}`);
  }
  
  const hero = entities.characters.find(c => c.name === 'Hero');
  if (!hero || hero.archetype !== 'hero') {
    throw new Error('Hero should have archetype hero');
  }
}

// Test: Extracts character traits
export function testExtractsCharacterTraits() {
  const cnl = `
Anna is hero with trait brave, determination
Anna has trait courageous
`;
  
  const { ast } = parseCNL(cnl);
  const rawEntities = getRawEntities(ast);
  
  const entities = extractEntitiesFromAST(rawEntities, ast);
  
  const anna = entities.characters.find(c => c.name === 'Anna');
  if (!anna) {
    throw new Error('Should find Anna character');
  }
  
  // Should have traits from both 'with trait' and 'has trait'
  if (!anna.traits || anna.traits.length === 0) {
    throw new Error('Anna should have traits');
  }
}

// Test: Extracts locations
export function testExtractsLocations() {
  const cnl = `
Castle is location
Forest is location
Village is place
`;
  
  const { ast } = parseCNL(cnl);
  const rawEntities = getRawEntities(ast);
  
  const entities = extractEntitiesFromAST(rawEntities, ast);
  
  if (entities.locations.length !== 3) {
    throw new Error(`Expected 3 locations, got ${entities.locations.length}`);
  }
  
  const castle = entities.locations.find(l => l.name === 'Castle');
  if (!castle) {
    throw new Error('Should find Castle location');
  }
}

// Test: Extracts objects
export function testExtractsObjects() {
  const cnl = `
Sword is object
Ring is item
`;
  
  const { ast } = parseCNL(cnl);
  const rawEntities = getRawEntities(ast);
  
  const entities = extractEntitiesFromAST(rawEntities, ast);
  
  if (entities.objects.length !== 2) {
    throw new Error(`Expected 2 objects, got ${entities.objects.length}`);
  }
}

// Test: Extracts moods
export function testExtractsMoods() {
  const cnl = `
TenseAtmosphere is mood
CalmMood is mood
`;
  
  const { ast } = parseCNL(cnl);
  const rawEntities = getRawEntities(ast);
  
  const entities = extractEntitiesFromAST(rawEntities, ast);
  
  if (entities.moods.length !== 2) {
    throw new Error(`Expected 2 moods, got ${entities.moods.length}`);
  }
}

// Test: Extracts themes from Story statements
export function testExtractsThemes() {
  const cnl = `
Story has theme redemption
Story has theme courage
`;
  
  const { ast } = parseCNL(cnl);
  const rawEntities = getRawEntities(ast);
  
  const entities = extractEntitiesFromAST(rawEntities, ast);
  
  if (entities.themes.length !== 2) {
    throw new Error(`Expected 2 themes, got ${entities.themes.length}`);
  }
  
  const redemption = entities.themes.find(t => t.name === 'redemption');
  if (!redemption) {
    throw new Error('Should find redemption theme');
  }
}

// Test: Extracts world rules
export function testExtractsWorldRules() {
  const cnl = `
World has rule NoMagic
NoMagic has category supernatural
NoMagic has description "Magic does not exist in this world"
NoMagic applies to all
`;
  
  const { ast } = parseCNL(cnl);
  const rawEntities = getRawEntities(ast);
  
  const entities = extractEntitiesFromAST(rawEntities, ast);
  
  if (entities.world_rules.length !== 1) {
    throw new Error(`Expected 1 world rule, got ${entities.world_rules.length}`);
  }
  
  const rule = entities.world_rules[0];
  if (rule.name !== 'NoMagic') {
    throw new Error('Rule should have name NoMagic');
  }
}

// Test: Extracts wisdom statements
export function testExtractsWisdom() {
  const cnl = `
Story conveys wisdom CourageMatters
CourageMatters has category moral
CourageMatters has insight "Courage is not the absence of fear"
`;
  
  const { ast } = parseCNL(cnl);
  const rawEntities = getRawEntities(ast);
  
  const entities = extractEntitiesFromAST(rawEntities, ast);
  
  if (entities.wisdom.length !== 1) {
    throw new Error(`Expected 1 wisdom, got ${entities.wisdom.length}`);
  }
  
  const w = entities.wisdom[0];
  if (w.label !== 'CourageMatters') {
    throw new Error('Wisdom should have label CourageMatters');
  }
}

// Test: Extracts patterns
export function testExtractsPatterns() {
  const cnl = `
Story uses pattern ThreeActStructure
ThreeActStructure is structure
ThreeActStructure has type narrative
`;
  
  const { ast } = parseCNL(cnl);
  const rawEntities = getRawEntities(ast);
  
  const entities = extractEntitiesFromAST(rawEntities, ast);
  
  if (entities.patterns.length !== 1) {
    throw new Error(`Expected 1 pattern, got ${entities.patterns.length}`);
  }
  
  const p = entities.patterns[0];
  if (p.label !== 'ThreeActStructure') {
    throw new Error('Pattern should have label ThreeActStructure');
  }
}

// Test: All character archetypes are recognized
export function testAllArchetypesRecognized() {
  const archetypes = ['hero', 'mentor', 'shadow', 'ally', 'trickster', 'guardian', 
                      'shapeshifter', 'herald', 'character', 'protagonist', 'antagonist'];
  
  for (const archetype of archetypes) {
    const cnl = `TestChar is ${archetype}`;
    const { ast } = parseCNL(cnl);
    const rawEntities = getRawEntities(ast);
    const entities = extractEntitiesFromAST(rawEntities, ast);
    
    const char = entities.characters.find(c => c.name === 'TestChar');
    if (!char) {
      throw new Error(`Archetype '${archetype}' should be recognized as character`);
    }
  }
}

// Test: Empty input returns empty entities
export function testEmptyInputReturnsEmptyEntities() {
  const cnl = '';
  const { ast } = parseCNL(cnl);
  const rawEntities = getRawEntities(ast);
  
  const entities = extractEntitiesFromAST(rawEntities, ast);
  
  if (entities.characters.length !== 0) {
    throw new Error('Empty input should have 0 characters');
  }
  if (entities.locations.length !== 0) {
    throw new Error('Empty input should have 0 locations');
  }
}
