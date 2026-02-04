/**
 * Tests for Vocabularies
 * 
 * Tests: Vocabulary structure, required fields, valid values
 */

import VOCAB, {
  CHARACTER_TRAITS,
  CHARACTER_ARCHETYPES,
  RELATIONSHIP_TYPES,
  LOCATION_GEOGRAPHY,
  LOCATION_TIME,
  EMOTIONS,
  MOOD_PRESETS,
  NARRATIVE_ARCS,
  THEMES,
  CONFLICTS,
  MASTER_PLOTS,
  TWIST_TYPES,
  NAMES
} from '../../src/vocabularies/vocabularies.mjs';

// Test: CHARACTER_TRAITS has traits as objects with label and desc
export function testCharacterTraitsStructure() {
  if (!CHARACTER_TRAITS || typeof CHARACTER_TRAITS !== 'object') {
    throw new Error('CHARACTER_TRAITS should be an object');
  }
  
  const keys = Object.keys(CHARACTER_TRAITS);
  if (keys.length === 0) {
    throw new Error('CHARACTER_TRAITS should have traits');
  }
  
  // Each trait is an object with label and desc
  for (const key of keys) {
    const trait = CHARACTER_TRAITS[key];
    if (!trait || typeof trait !== 'object') {
      throw new Error(`CHARACTER_TRAITS.${key} should be an object`);
    }
    if (!trait.label || !trait.desc) {
      throw new Error(`CHARACTER_TRAITS.${key} should have label and desc`);
    }
  }
}

// Test: CHARACTER_ARCHETYPES has required archetypes with desc
export function testCharacterArchetypesStructure() {
  const requiredArchetypes = ['hero', 'mentor', 'shadow', 'ally', 'trickster'];
  
  if (!CHARACTER_ARCHETYPES || typeof CHARACTER_ARCHETYPES !== 'object') {
    throw new Error('CHARACTER_ARCHETYPES should be an object');
  }
  
  for (const archetype of requiredArchetypes) {
    if (!CHARACTER_ARCHETYPES[archetype]) {
      throw new Error(`CHARACTER_ARCHETYPES should have ${archetype}`);
    }
    // Archetypes have 'desc' not 'description'
    if (!CHARACTER_ARCHETYPES[archetype].desc) {
      throw new Error(`CHARACTER_ARCHETYPES.${archetype} should have desc`);
    }
  }
}

// Test: RELATIONSHIP_TYPES is defined
export function testRelationshipTypes() {
  if (!RELATIONSHIP_TYPES || typeof RELATIONSHIP_TYPES !== 'object') {
    throw new Error('RELATIONSHIP_TYPES should be an object');
  }
  
  const keys = Object.keys(RELATIONSHIP_TYPES);
  if (keys.length === 0) {
    throw new Error('RELATIONSHIP_TYPES should have relationship types');
  }
}

// Test: LOCATION_GEOGRAPHY has categories
export function testLocationGeography() {
  if (!LOCATION_GEOGRAPHY || typeof LOCATION_GEOGRAPHY !== 'object') {
    throw new Error('LOCATION_GEOGRAPHY should be an object');
  }
  
  const keys = Object.keys(LOCATION_GEOGRAPHY);
  if (keys.length === 0) {
    throw new Error('LOCATION_GEOGRAPHY should have categories');
  }
}

// Test: LOCATION_TIME has time periods
export function testLocationTime() {
  if (!LOCATION_TIME || typeof LOCATION_TIME !== 'object') {
    throw new Error('LOCATION_TIME should be an object');
  }
  
  const keys = Object.keys(LOCATION_TIME);
  if (keys.length === 0) {
    throw new Error('LOCATION_TIME should have time periods');
  }
}

// Test: EMOTIONS has basic emotions
export function testEmotions() {
  if (!EMOTIONS || typeof EMOTIONS !== 'object') {
    throw new Error('EMOTIONS should be an object');
  }
  
  const basicEmotions = ['joy', 'sadness', 'anger', 'fear'];
  for (const emotion of basicEmotions) {
    if (!EMOTIONS[emotion]) {
      throw new Error(`EMOTIONS should have ${emotion}`);
    }
  }
}

// Test: MOOD_PRESETS has presets
export function testMoodPresets() {
  if (!MOOD_PRESETS || typeof MOOD_PRESETS !== 'object') {
    throw new Error('MOOD_PRESETS should be an object');
  }
  
  const keys = Object.keys(MOOD_PRESETS);
  if (keys.length === 0) {
    throw new Error('MOOD_PRESETS should have presets');
  }
}

// Test: NARRATIVE_ARCS has arc types
export function testNarrativeArcs() {
  if (!NARRATIVE_ARCS || typeof NARRATIVE_ARCS !== 'object') {
    throw new Error('NARRATIVE_ARCS should be an object');
  }
  
  const keys = Object.keys(NARRATIVE_ARCS);
  if (keys.length === 0) {
    throw new Error('NARRATIVE_ARCS should have arc types');
  }
}

// Test: THEMES has themes
export function testThemes() {
  if (!THEMES || typeof THEMES !== 'object') {
    throw new Error('THEMES should be an object');
  }
  
  const keys = Object.keys(THEMES);
  if (keys.length === 0) {
    throw new Error('THEMES should have themes');
  }
}

// Test: CONFLICTS has conflict types
export function testConflicts() {
  if (!CONFLICTS || typeof CONFLICTS !== 'object') {
    throw new Error('CONFLICTS should be an object');
  }
  
  const keys = Object.keys(CONFLICTS);
  if (keys.length === 0) {
    throw new Error('CONFLICTS should have conflict types');
  }
}

// Test: MASTER_PLOTS has plot types
export function testMasterPlots() {
  if (!MASTER_PLOTS || typeof MASTER_PLOTS !== 'object') {
    throw new Error('MASTER_PLOTS should be an object');
  }
  
  const keys = Object.keys(MASTER_PLOTS);
  if (keys.length === 0) {
    throw new Error('MASTER_PLOTS should have plot types');
  }
}

// Test: TWIST_TYPES has twist types
export function testTwistTypes() {
  if (!TWIST_TYPES || typeof TWIST_TYPES !== 'object') {
    throw new Error('TWIST_TYPES should be an object');
  }
  
  const keys = Object.keys(TWIST_TYPES);
  if (keys.length === 0) {
    throw new Error('TWIST_TYPES should have twist types');
  }
}

// Test: NAMES aggregator has categories
export function testNamesAggregator() {
  if (!NAMES || typeof NAMES !== 'object') {
    throw new Error('NAMES should be an object');
  }
  
  const expectedCategories = ['characters', 'locations', 'objects'];
  for (const category of expectedCategories) {
    if (!NAMES[category]) {
      throw new Error(`NAMES should have ${category}`);
    }
  }
}

// Test: Default export has all vocabulary categories
export function testDefaultExportComplete() {
  const expectedCategories = [
    'CHARACTER_TRAITS',
    'CHARACTER_ARCHETYPES',
    'RELATIONSHIP_TYPES',
    'LOCATION_GEOGRAPHY',
    'EMOTIONS',
    'MOOD_PRESETS',
    'NARRATIVE_ARCS',
    'THEMES',
    'CONFLICTS',
    'MASTER_PLOTS'
  ];
  
  for (const category of expectedCategories) {
    if (!VOCAB[category]) {
      throw new Error(`Default export should have ${category}`);
    }
  }
}

// Test: All traits are objects with label field
export function testTraitsAreObjects() {
  for (const [key, trait] of Object.entries(CHARACTER_TRAITS)) {
    if (typeof trait !== 'object' || trait === null) {
      throw new Error(`Trait ${key} should be an object`);
    }
    if (typeof trait.label !== 'string') {
      throw new Error(`Trait ${key}.label should be a string`);
    }
  }
}

// Test: Archetype desc fields are non-empty strings
export function testArchetypeDescriptions() {
  for (const [name, archetype] of Object.entries(CHARACTER_ARCHETYPES)) {
    if (typeof archetype.desc !== 'string' || archetype.desc.length === 0) {
      throw new Error(`Archetype ${name} should have non-empty desc`);
    }
  }
}
