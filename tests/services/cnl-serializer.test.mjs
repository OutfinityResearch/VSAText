/**
 * Tests for src/services/cnl-serializer.mjs
 * 
 * Tests: serializeToCNL
 */

import { serializeToCNL } from '../../src/services/cnl-serializer.mjs';

// Test: serialize empty project
export function testSerializeEmptyProject() {
  const project = {
    name: 'Test Story',
    selectedArc: 'heros_journey',
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] },
    libraries: {
      characters: [],
      locations: [],
      objects: [],
      moods: [],
      emotionalArc: [],
      themes: [],
      relationships: [],
      worldRules: [],
      dialogues: [],
      wisdom: [],
      patterns: []
    },
    structure: null
  };
  
  const cnl = serializeToCNL(project);
  
  if (!cnl.includes('// Auto-generated CNL')) {
    throw new Error('Expected header comment');
  }
  if (!cnl.includes('Test Story')) {
    throw new Error('Expected project name');
  }
}

// Test: serialize characters
export function testSerializeCharacters() {
  const project = {
    name: 'Test',
    selectedArc: 'heros_journey',
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] },
    libraries: {
      characters: [
        { id: 'c1', name: 'John', archetype: 'hero', traits: ['brave', 'wise'] }
      ],
      locations: [],
      objects: [],
      moods: [],
      emotionalArc: [],
      themes: [],
      relationships: [],
      worldRules: [],
      dialogues: [],
      wisdom: [],
      patterns: []
    },
    structure: null
  };
  
  const cnl = serializeToCNL(project);
  
  if (!cnl.includes('John is hero')) {
    throw new Error('Expected character declaration');
  }
  if (!cnl.includes('John has trait brave')) {
    throw new Error('Expected character trait');
  }
}

// Test: serialize character with spaces in name
export function testSerializeCharacterWithSpaces() {
  const project = {
    name: 'Test',
    selectedArc: 'heros_journey',
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] },
    libraries: {
      characters: [
        { id: 'c1', name: 'Dark Knight', archetype: 'hero', traits: [] }
      ],
      locations: [],
      objects: [],
      moods: [],
      emotionalArc: [],
      themes: [],
      relationships: [],
      worldRules: [],
      dialogues: [],
      wisdom: [],
      patterns: []
    },
    structure: null
  };
  
  const cnl = serializeToCNL(project);
  
  if (!cnl.includes('"Dark Knight" is hero')) {
    throw new Error('Expected quoted character name');
  }
}

// Test: serialize locations
export function testSerializeLocations() {
  const project = {
    name: 'Test',
    selectedArc: 'heros_journey',
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] },
    libraries: {
      characters: [],
      locations: [
        { id: 'l1', name: 'Forest', geography: 'forest', characteristics: ['dark', 'ancient'] }
      ],
      objects: [],
      moods: [],
      emotionalArc: [],
      themes: [],
      relationships: [],
      worldRules: [],
      dialogues: [],
      wisdom: [],
      patterns: []
    },
    structure: null
  };
  
  const cnl = serializeToCNL(project);
  
  if (!cnl.includes('Forest is location')) {
    throw new Error('Expected location declaration');
  }
  if (!cnl.includes('Forest has geography forest')) {
    throw new Error('Expected location geography');
  }
}

// Test: serialize relationships
export function testSerializeRelationships() {
  const project = {
    name: 'Test',
    selectedArc: 'heros_journey',
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] },
    libraries: {
      characters: [
        { id: 'c1', name: 'Hero', archetype: 'hero', traits: [] },
        { id: 'c2', name: 'Villain', archetype: 'shadow', traits: [] }
      ],
      locations: [],
      objects: [],
      moods: [],
      emotionalArc: [],
      themes: [],
      relationships: [
        { id: 'r1', fromId: 'c1', toId: 'c2', type: 'rivals' }
      ],
      worldRules: [],
      dialogues: [],
      wisdom: [],
      patterns: []
    },
    structure: null
  };
  
  const cnl = serializeToCNL(project);
  
  if (!cnl.includes('Hero relates to Villain as rivals')) {
    throw new Error('Expected relationship declaration');
  }
}

// Test: serialize blueprint
export function testSerializeBlueprint() {
  const project = {
    name: 'Test',
    selectedArc: 'heros_journey',
    blueprint: {
      arc: 'heros_journey',
      beatMappings: [
        { beatKey: 'call_to_adventure', chapterId: 'ch1', tension: 3 }
      ],
      tensionCurve: [
        { position: 0.5, tension: 7 }
      ],
      subplots: []
    },
    libraries: {
      characters: [],
      locations: [],
      objects: [],
      moods: [],
      emotionalArc: [],
      themes: [],
      relationships: [],
      worldRules: [],
      dialogues: [],
      wisdom: [],
      patterns: []
    },
    structure: null
  };
  
  const cnl = serializeToCNL(project);
  
  if (!cnl.includes('Blueprint uses arc heros_journey')) {
    throw new Error('Expected blueprint arc');
  }
  if (!cnl.includes('Beat call_to_adventure mapped to ch1')) {
    throw new Error('Expected beat mapping');
  }
  if (!cnl.includes('Tension at 0.5 is 7')) {
    throw new Error('Expected tension curve');
  }
}

// Test: serialize structure
export function testSerializeStructure() {
  const project = {
    name: 'Test',
    selectedArc: 'heros_journey',
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] },
    libraries: {
      characters: [],
      locations: [],
      objects: [],
      moods: [],
      emotionalArc: [],
      themes: [],
      relationships: [],
      worldRules: [],
      dialogues: [],
      wisdom: [],
      patterns: []
    },
    structure: {
      type: 'book',
      name: 'Book1',
      title: 'My Story',
      children: [
        {
          type: 'chapter',
          name: 'Ch1',
          title: 'Beginning',
          children: []
        }
      ]
    }
  };
  
  const cnl = serializeToCNL(project);
  
  if (!cnl.includes('Book1 group begin')) {
    throw new Error('Expected book group begin');
  }
  if (!cnl.includes('Ch1 group begin')) {
    throw new Error('Expected chapter group begin');
  }
  if (!cnl.includes('Ch1 has title "Beginning"')) {
    throw new Error('Expected chapter title');
  }
}

// Test: serialize null project
export function testSerializeNullProject() {
  const cnl = serializeToCNL(null);
  if (cnl !== '') {
    throw new Error('Expected empty string for null project');
  }
}

// Test: serialize themes
export function testSerializeThemes() {
  const project = {
    name: 'Test',
    selectedArc: 'heros_journey',
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] },
    libraries: {
      characters: [],
      locations: [],
      objects: [],
      moods: [],
      emotionalArc: [],
      themes: [
        { id: 't1', name: 'redemption' },
        { id: 't2', name: 'sacrifice' }
      ],
      relationships: [],
      worldRules: [],
      dialogues: [],
      wisdom: [],
      patterns: []
    },
    structure: null
  };
  
  const cnl = serializeToCNL(project);
  
  if (!cnl.includes('Story has theme redemption as primary')) {
    throw new Error('Expected primary theme');
  }
  if (!cnl.includes('Story has theme sacrifice as secondary')) {
    throw new Error('Expected secondary theme');
  }
}
