/**
 * Tests for Generation - Random Generator
 * 
 * Tests: Story generation with random selection
 */

import { generateRandomStory } from '../../src/generation/random-generator.mjs';

// Test: generateRandomStory returns valid structure
export function testGenerateRandomStoryStructure() {
  const result = generateRandomStory({
    genre: 'fantasy',
    tone: 'balanced',
    chars: 'medium',
    length: 'short',
    complexity: 'medium',
    title: 'Test Story'
  });
  
  if (!result.name) {
    throw new Error('Expected story name');
  }
  if (!result.structure) {
    throw new Error('Expected structure');
  }
  if (!result.libraries) {
    throw new Error('Expected libraries');
  }
}

// Test: Characters are generated
export function testGeneratesCharacters() {
  const result = generateRandomStory({
    genre: 'fantasy',
    chars: 'few',
    length: 'short'
  });
  
  if (!result.libraries.characters || result.libraries.characters.length === 0) {
    throw new Error('Expected characters');
  }
  
  // Should have a hero
  const hero = result.libraries.characters.find(c => c.archetype === 'hero');
  if (!hero) {
    throw new Error('Expected a hero character');
  }
}

// Test: Locations are generated
export function testGeneratesLocations() {
  const result = generateRandomStory({
    genre: 'fantasy',
    length: 'medium'
  });
  
  if (!result.libraries.locations || result.libraries.locations.length === 0) {
    throw new Error('Expected locations');
  }
}

// Test: Structure has chapters and scenes
export function testGeneratesChaptersAndScenes() {
  const result = generateRandomStory({
    genre: 'fantasy',
    length: 'short',
    complexity: 'simple'
  });
  
  const chapters = result.structure.children;
  if (!chapters || chapters.length === 0) {
    throw new Error('Expected chapters');
  }
  
  const scenes = chapters[0].children;
  if (!scenes || scenes.length === 0) {
    throw new Error('Expected scenes in chapter');
  }
}

// Test: Blueprint is generated
export function testGeneratesBlueprint() {
  const result = generateRandomStory({
    genre: 'fantasy',
    length: 'medium'
  });
  
  if (!result.blueprint) {
    throw new Error('Expected blueprint');
  }
  if (!result.blueprint.arc) {
    throw new Error('Expected arc in blueprint');
  }
  if (!result.blueprint.beatMappings) {
    throw new Error('Expected beatMappings in blueprint');
  }
}

// Test: Different genres use different arcs
export function testGenreAffectsArc() {
  const fantasy = generateRandomStory({ genre: 'fantasy', length: 'short' });
  const mystery = generateRandomStory({ genre: 'mystery', length: 'short' });
  
  // Fantasy uses heros_journey, mystery uses five_act
  if (fantasy.selectedArc !== 'heros_journey') {
    throw new Error(`Expected fantasy arc 'heros_journey', got '${fantasy.selectedArc}'`);
  }
  if (mystery.selectedArc !== 'five_act') {
    throw new Error(`Expected mystery arc 'five_act', got '${mystery.selectedArc}'`);
  }
}

// Test: Relationships are generated between characters
export function testGeneratesRelationships() {
  const result = generateRandomStory({
    genre: 'fantasy',
    chars: 'medium',
    length: 'short'
  });
  
  if (!result.libraries.relationships || result.libraries.relationships.length === 0) {
    throw new Error('Expected relationships');
  }
}
