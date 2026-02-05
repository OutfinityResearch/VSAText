/**
 * Tests for src/models/project.mjs
 * 
 * Tests: createProject, createDefaultBlueprint, createDefaultLibraries,
 *        cloneProject, loadProject, entity operations
 */

import {
  createProject,
  createDefaultBlueprint,
  createDefaultLibraries,
  cloneProject,
  loadProject,
  getEntityById,
  upsertEntity,
  removeEntity,
  getDialogue,
  upsertDialogue,
  removeDialogue,
  getSubplot,
  upsertSubplot,
  removeSubplot,
  updateBeatMapping,
  setTensionCurve,
  setBlueprintArc
} from '../../src/models/project.mjs';

// Test: createDefaultBlueprint
export function testCreateDefaultBlueprint() {
  const bp = createDefaultBlueprint();
  
  if (bp.arc !== 'heros_journey') {
    throw new Error('Expected default arc');
  }
  if (!Array.isArray(bp.beatMappings)) {
    throw new Error('Expected beatMappings array');
  }
  if (!Array.isArray(bp.tensionCurve)) {
    throw new Error('Expected tensionCurve array');
  }
  if (!Array.isArray(bp.subplots)) {
    throw new Error('Expected subplots array');
  }
}

// Test: createDefaultLibraries
export function testCreateDefaultLibraries() {
  const libs = createDefaultLibraries();
  
  const required = ['characters', 'locations', 'objects', 'moods', 'themes', 
                    'relationships', 'worldRules', 'dialogues', 'wisdom', 'patterns'];
  
  for (const key of required) {
    if (!Array.isArray(libs[key])) {
      throw new Error(`Expected ${key} array`);
    }
  }
}

// Test: createProject
export function testCreateProject() {
  const project = createProject('Test Story');
  
  if (project.name !== 'Test Story') {
    throw new Error('Expected project name');
  }
  if (project.id !== null) {
    throw new Error('Expected null id for new project');
  }
  if (!project.blueprint) {
    throw new Error('Expected blueprint');
  }
  if (!project.libraries) {
    throw new Error('Expected libraries');
  }
}

// Test: createProject default name
export function testCreateProjectDefaultName() {
  const project = createProject();
  
  if (project.name !== 'Untitled Story') {
    throw new Error('Expected default name');
  }
}

// Test: cloneProject
export function testCloneProject() {
  const original = createProject('Original');
  original.libraries.characters.push({ id: 'c1', name: 'Hero' });
  
  const clone = cloneProject(original);
  
  // Modify clone
  clone.name = 'Clone';
  clone.libraries.characters[0].name = 'Modified';
  
  // Original should be unchanged
  if (original.name !== 'Original') {
    throw new Error('Original name should not change');
  }
  if (original.libraries.characters[0].name !== 'Hero') {
    throw new Error('Original character should not change');
  }
}

// Test: loadProject with partial data
export function testLoadProjectPartial() {
  const data = {
    name: 'Loaded Project',
    libraries: {
      characters: [{ id: 'c1', name: 'Hero' }]
    }
  };
  
  const project = loadProject(data);
  
  if (project.name !== 'Loaded Project') {
    throw new Error('Expected loaded name');
  }
  if (project.libraries.characters.length !== 1) {
    throw new Error('Expected loaded characters');
  }
  // Should have defaults for missing fields
  if (!Array.isArray(project.libraries.locations)) {
    throw new Error('Expected default locations array');
  }
  if (!project.blueprint.arc) {
    throw new Error('Expected default arc');
  }
}

// Test: getEntityById
export function testGetEntityById() {
  const library = [
    { id: 'a1', name: 'Alpha' },
    { id: 'b2', name: 'Beta' }
  ];
  
  const found = getEntityById(library, 'b2');
  
  if (!found || found.name !== 'Beta') {
    throw new Error('Expected to find Beta');
  }
  
  const notFound = getEntityById(library, 'c3');
  if (notFound !== undefined) {
    throw new Error('Expected undefined for not found');
  }
}

// Test: upsertEntity add
export function testUpsertEntityAdd() {
  const library = [{ id: 'a1', name: 'Alpha' }];
  
  const result = upsertEntity(library, { id: 'b2', name: 'Beta' });
  
  if (result.length !== 2) {
    throw new Error('Expected 2 entities');
  }
  // Original should be unchanged (immutable)
  if (library.length !== 1) {
    throw new Error('Original should be unchanged');
  }
}

// Test: upsertEntity update
export function testUpsertEntityUpdate() {
  const library = [
    { id: 'a1', name: 'Alpha' },
    { id: 'b2', name: 'Beta' }
  ];
  
  const result = upsertEntity(library, { id: 'b2', name: 'Beta Updated' });
  
  if (result.length !== 2) {
    throw new Error('Expected 2 entities');
  }
  if (result[1].name !== 'Beta Updated') {
    throw new Error('Expected updated name');
  }
  // Original should be unchanged
  if (library[1].name !== 'Beta') {
    throw new Error('Original should be unchanged');
  }
}

// Test: removeEntity
export function testRemoveEntity() {
  const library = [
    { id: 'a1', name: 'Alpha' },
    { id: 'b2', name: 'Beta' }
  ];
  
  const result = removeEntity(library, 'a1');
  
  if (result.length !== 1) {
    throw new Error('Expected 1 entity');
  }
  if (result[0].id !== 'b2') {
    throw new Error('Expected Beta to remain');
  }
  // Original should be unchanged
  if (library.length !== 2) {
    throw new Error('Original should be unchanged');
  }
}

// Test: dialogue operations
export function testDialogueOperations() {
  let project = createProject('Test');
  
  // Add dialogue
  project = upsertDialogue(project, { id: 'd1', purpose: 'reveal' });
  
  if (project.libraries.dialogues.length !== 1) {
    throw new Error('Expected 1 dialogue');
  }
  
  // Get dialogue
  const found = getDialogue(project, 'd1');
  if (!found || found.purpose !== 'reveal') {
    throw new Error('Expected to find dialogue');
  }
  
  // Update dialogue
  project = upsertDialogue(project, { id: 'd1', purpose: 'conflict' });
  const updated = getDialogue(project, 'd1');
  if (updated.purpose !== 'conflict') {
    throw new Error('Expected updated purpose');
  }
  
  // Remove dialogue
  project = removeDialogue(project, 'd1');
  if (project.libraries.dialogues.length !== 0) {
    throw new Error('Expected 0 dialogues');
  }
}

// Test: subplot operations
export function testSubplotOperations() {
  let project = createProject('Test');
  
  // Add subplot
  project = upsertSubplot(project, { id: 's1', type: 'romance' });
  
  if (project.blueprint.subplots.length !== 1) {
    throw new Error('Expected 1 subplot');
  }
  
  // Get subplot
  const found = getSubplot(project, 's1');
  if (!found || found.type !== 'romance') {
    throw new Error('Expected to find subplot');
  }
  
  // Remove subplot
  project = removeSubplot(project, 's1');
  if (project.blueprint.subplots.length !== 0) {
    throw new Error('Expected 0 subplots');
  }
}

// Test: updateBeatMapping
export function testUpdateBeatMapping() {
  let project = createProject('Test');
  
  // Add mapping
  project = updateBeatMapping(project, 'call', { chapterId: 'ch1', tension: 3 });
  
  if (project.blueprint.beatMappings.length !== 1) {
    throw new Error('Expected 1 mapping');
  }
  if (project.blueprint.beatMappings[0].beatKey !== 'call') {
    throw new Error('Expected beatKey');
  }
  
  // Update mapping
  project = updateBeatMapping(project, 'call', { chapterId: 'ch2', tension: 5 });
  
  if (project.blueprint.beatMappings.length !== 1) {
    throw new Error('Should still have 1 mapping');
  }
  if (project.blueprint.beatMappings[0].chapterId !== 'ch2') {
    throw new Error('Expected updated chapterId');
  }
}

// Test: setTensionCurve
export function testSetTensionCurve() {
  let project = createProject('Test');
  
  const curve = [{ position: 0.5, tension: 7 }];
  project = setTensionCurve(project, curve);
  
  if (project.blueprint.tensionCurve.length !== 1) {
    throw new Error('Expected tension curve');
  }
}

// Test: setBlueprintArc
export function testSetBlueprintArc() {
  let project = createProject('Test');
  
  project = setBlueprintArc(project, 'three_act');
  
  if (project.blueprint.arc !== 'three_act') {
    throw new Error('Expected blueprint arc to change');
  }
  if (project.selectedArc !== 'three_act') {
    throw new Error('Expected selectedArc to change');
  }
}
