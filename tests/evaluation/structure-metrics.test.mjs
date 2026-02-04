/**
 * Tests for Evaluation - Structure Metrics
 * 
 * Tests: calculateStructureMetrics for counting books, chapters, scenes, actions, and references
 */

import { calculateStructureMetrics } from '../../src/evaluate/structure-metrics.mjs';
import { parseCNL, extractEntities } from '../../src/cnl/validator.mjs';

// Test: Empty AST returns zero counts
export function testEmptyASTReturnsZeroCounts() {
  const ast = { groups: [], statements: [] };
  const entities = { characters: [], locations: [], objects: [], moods: [] };
  
  const result = calculateStructureMetrics(ast, entities);
  
  if (result.counts.books !== 0) {
    throw new Error(`Expected 0 books, got ${result.counts.books}`);
  }
  if (result.counts.chapters !== 0) {
    throw new Error(`Expected 0 chapters, got ${result.counts.chapters}`);
  }
  if (result.counts.scenes !== 0) {
    throw new Error(`Expected 0 scenes, got ${result.counts.scenes}`);
  }
}

// Test: Counts single book with chapters and scenes
export function testCountsBookChaptersScenes() {
  const cnl = `
Book1 group begin
  Chapter1 group begin
    Scene1 group begin
    Scene1 group end
    Scene2 group begin
    Scene2 group end
  Chapter1 group end
  Chapter2 group begin
    Scene3 group begin
    Scene3 group end
  Chapter2 group end
Book1 group end
`;
  
  const { ast } = parseCNL(cnl);
  const rawEntities = extractEntities(ast);
  const entities = { characters: [], locations: [], objects: [], moods: [] };
  
  const result = calculateStructureMetrics(ast, entities);
  
  if (result.counts.books !== 1) {
    throw new Error(`Expected 1 book, got ${result.counts.books}`);
  }
  if (result.counts.chapters !== 2) {
    throw new Error(`Expected 2 chapters, got ${result.counts.chapters}`);
  }
  if (result.counts.scenes !== 3) {
    throw new Error(`Expected 3 scenes, got ${result.counts.scenes}`);
  }
}

// Test: Counts character references
export function testCountsCharacterReferences() {
  const cnl = `
Scene1 group begin
  Scene1 includes character Hero
  Scene1 includes character Mentor
  Hero enters Castle
Scene1 group end

Hero is hero
Mentor is mentor
Castle is location
`;
  
  const { ast } = parseCNL(cnl);
  const entities = { characters: [{ name: 'Hero' }, { name: 'Mentor' }], locations: [], objects: [], moods: [] };
  
  const result = calculateStructureMetrics(ast, entities);
  
  if (result.refs.characters !== 2) {
    throw new Error(`Expected 2 character refs, got ${result.refs.characters}`);
  }
}

// Test: Counts location references
export function testCountsLocationReferences() {
  const cnl = `
Scene1 group begin
  Scene1 includes location Castle
  Scene1 includes location Forest
Scene1 group end

Castle is location
Forest is location
`;
  
  const { ast } = parseCNL(cnl);
  const entities = { characters: [], locations: [{ name: 'Castle' }, { name: 'Forest' }], objects: [], moods: [] };
  
  const result = calculateStructureMetrics(ast, entities);
  
  if (result.refs.locations !== 2) {
    throw new Error(`Expected 2 location refs, got ${result.refs.locations}`);
  }
}

// Test: Counts actions (non-structural verbs)
export function testCountsActions() {
  const cnl = `
Scene1 group begin
  Hero enters Castle
  Hero fights Dragon
  Hero saves Princess
Scene1 group end

Hero is hero
Castle is location
Dragon is character
Princess is character
`;
  
  const { ast } = parseCNL(cnl);
  const entities = { characters: [], locations: [], objects: [], moods: [] };
  
  const result = calculateStructureMetrics(ast, entities);
  
  if (result.counts.actions !== 3) {
    throw new Error(`Expected 3 actions, got ${result.counts.actions}`);
  }
}

// Test: Counts entities from entities object
export function testCountsEntitiesFromObject() {
  const ast = { groups: [], statements: [] };
  const entities = {
    characters: [{ name: 'Hero' }, { name: 'Mentor' }, { name: 'Villain' }],
    locations: [{ name: 'Castle' }, { name: 'Forest' }],
    objects: [{ name: 'Sword' }],
    moods: [{ name: 'Tense' }],
    themes: [{ name: 'Redemption' }],
    relationships: [{ from: 'Hero', to: 'Mentor', type: 'student' }],
    world_rules: [{ name: 'NoMagic' }],
    dialogues: [{ id: 'D1' }],
    wisdom: [{ label: 'Courage' }],
    patterns: [{ label: 'ThreeAct' }]
  };
  
  const result = calculateStructureMetrics(ast, entities);
  
  if (result.counts.characters !== 3) {
    throw new Error(`Expected 3 characters, got ${result.counts.characters}`);
  }
  if (result.counts.locations !== 2) {
    throw new Error(`Expected 2 locations, got ${result.counts.locations}`);
  }
  if (result.counts.objects !== 1) {
    throw new Error(`Expected 1 object, got ${result.counts.objects}`);
  }
  if (result.counts.themes !== 1) {
    throw new Error(`Expected 1 theme, got ${result.counts.themes}`);
  }
  if (result.counts.relationships !== 1) {
    throw new Error(`Expected 1 relationship, got ${result.counts.relationships}`);
  }
}

// Test: Nested structure counts correctly
export function testNestedStructureCounts() {
  const cnl = `
Vol1 group begin
  Part1 group begin
    Ch1 group begin
    Ch1 group end
    Ch2 group begin
    Ch2 group end
  Part1 group end
Vol1 group end

Vol2 group begin
  Part2 group begin
    Ch3 group begin
    Ch3 group end
  Part2 group end
Vol2 group end
`;
  
  const { ast } = parseCNL(cnl);
  const entities = { characters: [], locations: [], objects: [], moods: [] };
  
  const result = calculateStructureMetrics(ast, entities);
  
  // Depth 0 = books (Vol1, Vol2)
  // Depth 1 = chapters (Part1, Part2)
  // Depth 2 = scenes (Ch1, Ch2, Ch3)
  if (result.counts.books !== 2) {
    throw new Error(`Expected 2 books, got ${result.counts.books}`);
  }
  if (result.counts.chapters !== 2) {
    throw new Error(`Expected 2 chapters, got ${result.counts.chapters}`);
  }
  if (result.counts.scenes !== 3) {
    throw new Error(`Expected 3 scenes, got ${result.counts.scenes}`);
  }
}
