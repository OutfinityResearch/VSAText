/**
 * Tests for CNL Parser - Entity Extraction
 * 
 * Tests: Character archetypes, traits extraction
 * 
 * Bug fix tests:
 * - Villain/sidekick archetypes should be recognized as characters
 * - Traits from "with trait X, Y" syntax should be extracted
 */

import { parseCNL } from '../../src/cnl-parser/cnl-parser.mjs';
import { extractEntities } from '../../src/cnl-parser/cnl-parser.mjs';

// Test: Villain archetype is recognized as character
export function testVillainArchetypeRecognized() {
  const cnl = 'Dragon is villain with trait fierce';
  const result = parseCNL(cnl);
  const entities = extractEntities(result.ast);
  
  const villain = entities.characters.find(c => c.name === 'Dragon');
  if (!villain) {
    throw new Error('Villain archetype should be recognized as character');
  }
}

// Test: Hero archetype is recognized as character
export function testHeroArchetypeRecognized() {
  const cnl = 'Anna is hero with trait brave';
  const result = parseCNL(cnl);
  const entities = extractEntities(result.ast);
  
  const hero = entities.characters.find(c => c.name === 'Anna');
  if (!hero) {
    throw new Error('Hero archetype should be recognized as character');
  }
}

// Test: Shadow archetype is recognized as character
export function testShadowArchetypeRecognized() {
  const cnl = 'Mordred is shadow';
  const result = parseCNL(cnl);
  const entities = extractEntities(result.ast);
  
  const shadow = entities.characters.find(c => c.name === 'Mordred');
  if (!shadow) {
    throw new Error('Shadow archetype should be recognized as character');
  }
}

// Test: Single trait is extracted from "with trait X" syntax
export function testSingleTraitExtraction() {
  const cnl = 'Hero is hero with trait brave';
  const result = parseCNL(cnl);
  
  if (!result.ast.entities.Hero.traits.includes('brave')) {
    throw new Error('Trait "brave" should be extracted');
  }
}

// Test: Multiple comma-separated traits are extracted
export function testMultipleTraitsExtraction() {
  const cnl = 'Maria is mentor with trait wise, patient, kind';
  const result = parseCNL(cnl);
  
  const traits = result.ast.entities.Maria.traits;
  if (!traits.includes('wise')) {
    throw new Error('Trait "wise" should be extracted');
  }
  if (!traits.includes('patient')) {
    throw new Error('Trait "patient" should be extracted');
  }
  if (!traits.includes('kind')) {
    throw new Error('Trait "kind" should be extracted');
  }
}

// Test: Traits from "has trait X" syntax are extracted
export function testHasTraitSyntax() {
  const cnl = `
Hero is hero
Hero has trait courageous
`;
  const result = parseCNL(cnl);
  
  if (!result.ast.entities.Hero.traits.includes('courageous')) {
    throw new Error('Trait from "has trait" syntax should be extracted');
  }
}

// Test: Location is not a character
export function testLocationNotCharacter() {
  const cnl = 'Castle is location with geography urban';
  const result = parseCNL(cnl);
  const entities = extractEntities(result.ast);
  
  const loc = entities.locations.find(l => l.name === 'Castle');
  if (!loc) {
    throw new Error('Location should be in locations list');
  }
  
  const wrongChar = entities.characters.find(c => c.name === 'Castle');
  if (wrongChar) {
    throw new Error('Location should NOT be in characters list');
  }
}
