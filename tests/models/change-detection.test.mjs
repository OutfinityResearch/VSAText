/**
 * Tests for src/models/change-detection.mjs
 * 
 * Tests: detectChanges, detectLibraryChanges, detectStructureChanges, hasChanges
 */

import {
  detectChanges,
  detectLibraryChanges,
  detectStructureChanges,
  detectBlueprintChanges,
  hasChanges
} from '../../src/models/change-detection.mjs';

// Test: detectLibraryChanges - added items
export function testDetectLibraryChangesAdded() {
  const snap = [{ id: 'a1', name: 'Alpha' }];
  const curr = [
    { id: 'a1', name: 'Alpha' },
    { id: 'b2', name: 'Beta' }
  ];
  
  const result = detectLibraryChanges(snap, curr, 'character');
  
  if (result.items.length !== 1) {
    throw new Error('Expected 1 change');
  }
  if (result.items[0].action !== 'added') {
    throw new Error('Expected added action');
  }
  if (result.items[0].name !== 'Beta') {
    throw new Error('Expected Beta name');
  }
}

// Test: detectLibraryChanges - removed items
export function testDetectLibraryChangesRemoved() {
  const snap = [
    { id: 'a1', name: 'Alpha' },
    { id: 'b2', name: 'Beta' }
  ];
  const curr = [{ id: 'a1', name: 'Alpha' }];
  
  const result = detectLibraryChanges(snap, curr, 'character');
  
  if (result.items.length !== 1) {
    throw new Error('Expected 1 change');
  }
  if (result.items[0].action !== 'removed') {
    throw new Error('Expected removed action');
  }
}

// Test: detectLibraryChanges - modified items
export function testDetectLibraryChangesModified() {
  const snap = [{ id: 'a1', name: 'Alpha', trait: 'brave' }];
  const curr = [{ id: 'a1', name: 'Alpha', trait: 'wise' }];
  
  const result = detectLibraryChanges(snap, curr, 'character');
  
  if (result.items.length !== 1) {
    throw new Error('Expected 1 change');
  }
  if (result.items[0].action !== 'modified') {
    throw new Error('Expected modified action');
  }
}

// Test: detectLibraryChanges - no changes
export function testDetectLibraryChangesNoChanges() {
  const snap = [{ id: 'a1', name: 'Alpha' }];
  const curr = [{ id: 'a1', name: 'Alpha' }];
  
  const result = detectLibraryChanges(snap, curr, 'character');
  
  if (result.items.length !== 0) {
    throw new Error('Expected no changes');
  }
}

// Test: detectStructureChanges - structure created
export function testDetectStructureChangesCreated() {
  const snap = null;
  const curr = { type: 'book', children: [] };
  
  const result = detectStructureChanges(snap, curr);
  
  if (result.items.length !== 1) {
    throw new Error('Expected 1 change');
  }
  if (result.items[0].action !== 'added') {
    throw new Error('Expected added action');
  }
}

// Test: detectStructureChanges - structure removed
export function testDetectStructureChangesRemoved() {
  const snap = { type: 'book', children: [] };
  const curr = null;
  
  const result = detectStructureChanges(snap, curr);
  
  if (result.items.length !== 1) {
    throw new Error('Expected 1 change');
  }
  if (result.items[0].action !== 'removed') {
    throw new Error('Expected removed action');
  }
}

// Test: detectStructureChanges - chapters changed
export function testDetectStructureChangesChapters() {
  const snap = {
    type: 'book',
    children: [{ type: 'chapter', children: [] }]
  };
  const curr = {
    type: 'book',
    children: [
      { type: 'chapter', children: [] },
      { type: 'chapter', children: [] }
    ]
  };
  
  const result = detectStructureChanges(snap, curr);
  
  const chapterChange = result.items.find(i => i.name.includes('chapter'));
  if (!chapterChange) {
    throw new Error('Expected chapter change');
  }
  if (chapterChange.action !== 'added') {
    throw new Error('Expected added action');
  }
}

// Test: detectBlueprintChanges - arc changed
export function testDetectBlueprintChangesArc() {
  const snap = { arc: 'heros_journey', beatMappings: [], tensionCurve: [] };
  const curr = { arc: 'three_act', beatMappings: [], tensionCurve: [] };
  
  const result = detectBlueprintChanges(snap, curr);
  
  if (result.items.length !== 1) {
    throw new Error('Expected 1 change');
  }
  if (!result.items[0].name.includes('Arc changed')) {
    throw new Error('Expected arc change message');
  }
}

// Test: detectBlueprintChanges - beat mappings changed
export function testDetectBlueprintChangesBeatMappings() {
  const snap = { arc: 'heros_journey', beatMappings: [], tensionCurve: [] };
  const curr = { arc: 'heros_journey', beatMappings: [{ beatKey: 'call' }], tensionCurve: [] };
  
  const result = detectBlueprintChanges(snap, curr);
  
  if (result.items.length !== 1) {
    throw new Error('Expected 1 change');
  }
  if (!result.items[0].name.includes('Beat mappings')) {
    throw new Error('Expected beat mappings change message');
  }
}

// Test: detectChanges - full project
export function testDetectChangesFullProject() {
  const snapshot = {
    libraries: {
      characters: [{ id: 'c1', name: 'Hero' }],
      locations: [],
      objects: [],
      dialogues: [],
      relationships: []
    },
    structure: null,
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] }
  };
  
  const current = {
    libraries: {
      characters: [
        { id: 'c1', name: 'Hero' },
        { id: 'c2', name: 'Villain' }
      ],
      locations: [{ id: 'l1', name: 'Forest' }],
      objects: [],
      dialogues: [],
      relationships: []
    },
    structure: null,
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] }
  };
  
  const changes = detectChanges(snapshot, current);
  
  // Should detect character added and location added
  if (changes.length < 2) {
    throw new Error('Expected at least 2 change categories');
  }
  
  const charChanges = changes.find(c => c.category === 'Characters');
  if (!charChanges || charChanges.items.length !== 1) {
    throw new Error('Expected 1 character change');
  }
  
  const locChanges = changes.find(c => c.category === 'Locations');
  if (!locChanges || locChanges.items.length !== 1) {
    throw new Error('Expected 1 location change');
  }
}

// Test: detectChanges - null snapshot
export function testDetectChangesNullSnapshot() {
  const changes = detectChanges(null, { libraries: {} });
  
  if (!Array.isArray(changes) || changes.length !== 0) {
    throw new Error('Expected empty array for null snapshot');
  }
}

// Test: hasChanges
export function testHasChanges() {
  const snapshot = {
    libraries: { characters: [], locations: [], objects: [], dialogues: [], relationships: [] },
    structure: null,
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] }
  };
  
  const noChange = {
    libraries: { characters: [], locations: [], objects: [], dialogues: [], relationships: [] },
    structure: null,
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] }
  };
  
  const withChange = {
    libraries: {
      characters: [{ id: 'c1', name: 'New' }],
      locations: [], objects: [], dialogues: [], relationships: []
    },
    structure: null,
    blueprint: { arc: 'heros_journey', beatMappings: [], tensionCurve: [], subplots: [] }
  };
  
  if (hasChanges(snapshot, noChange)) {
    throw new Error('Expected no changes');
  }
  
  if (!hasChanges(snapshot, withChange)) {
    throw new Error('Expected changes');
  }
}
