/**
 * SCRIPTA Demo - State Management
 * 
 * Centralized application state using SDK models.
 */

import {
  createProject,
  createDefaultBlueprint,
  createDefaultLibraries,
  loadProject as loadProjectModel,
  cloneProject,
  detectChanges as detectProjectChanges
} from '../../src/models/index.mjs';

// ============================================
// APPLICATION STATE
// ============================================

export const state = {
  project: createProject('Untitled Story'),
  selectedNode: null,
  editingEntity: null,
  blocksFilter: 'all',
  blueprintView: 'timeline',  // Current blueprint view mode
  
  // Generation tracking
  generation: {
    hasGenerated: false,
    snapshot: null,
    lastGeneratedAt: null,
    generatedStory: null
  }
};

// ============================================
// PROJECT OPERATIONS
// ============================================

export function resetProject() {
  state.project = createProject('Untitled Story');
  state.selectedNode = null;
  state.editingEntity = null;
  state.blueprintView = 'timeline';
  state.generation = {
    hasGenerated: false,
    snapshot: null,
    lastGeneratedAt: null,
    generatedStory: null
  };
}

export function loadProjectState(project) {
  state.project = loadProjectModel(project);
  
  // Ensure dialogues array exists for older projects
  if (!state.project.libraries.dialogues) {
    state.project.libraries.dialogues = [];
  }
}

// ============================================
// ENTITY OPERATIONS (delegating to project mutations)
// ============================================

/**
 * Get a dialogue by ID
 * @param {string} id - Dialogue ID
 * @returns {Object|undefined}
 */
export function getDialogueById(id) {
  return state.project.libraries.dialogues.find(d => d.id === id);
}

/**
 * Add or update a dialogue marker
 * @param {Object} dialogue - Dialogue to add/update
 */
export function upsertDialogue(dialogue) {
  const existing = state.project.libraries.dialogues.findIndex(d => d.id === dialogue.id);
  if (existing >= 0) {
    state.project.libraries.dialogues[existing] = dialogue;
  } else {
    state.project.libraries.dialogues.push(dialogue);
  }
}

/**
 * Remove a dialogue marker
 * @param {string} id - Dialogue ID
 */
export function removeDialogue(id) {
  state.project.libraries.dialogues = state.project.libraries.dialogues.filter(d => d.id !== id);
}

/**
 * Get a subplot by ID
 * @param {string} id - Subplot ID
 * @returns {Object|undefined}
 */
export function getSubplotById(id) {
  return state.project.blueprint.subplots.find(s => s.id === id);
}

/**
 * Add or update a subplot
 * @param {Object} subplot - Subplot to add/update
 */
export function upsertSubplot(subplot) {
  const existing = state.project.blueprint.subplots.findIndex(s => s.id === subplot.id);
  if (existing >= 0) {
    state.project.blueprint.subplots[existing] = subplot;
  } else {
    state.project.blueprint.subplots.push(subplot);
  }
}

/**
 * Remove a subplot
 * @param {string} id - Subplot ID
 */
export function removeSubplot(id) {
  state.project.blueprint.subplots = state.project.blueprint.subplots.filter(s => s.id !== id);
}

/**
 * Update beat mapping
 * @param {string} beatKey - Beat to map
 * @param {Object} mapping - Mapping data
 */
export function updateBeatMapping(beatKey, mapping) {
  const existing = state.project.blueprint.beatMappings.findIndex(b => b.beatKey === beatKey);
  if (existing >= 0) {
    state.project.blueprint.beatMappings[existing] = { beatKey, ...mapping };
  } else {
    state.project.blueprint.beatMappings.push({ beatKey, ...mapping });
  }
}

/**
 * Set custom tension curve
 * @param {Array} curve - Tension points
 */
export function setTensionCurve(curve) {
  state.project.blueprint.tensionCurve = curve;
}

/**
 * Set blueprint arc
 * @param {string} arcKey - Arc key
 */
export function setBlueprintArc(arcKey) {
  state.project.blueprint.arc = arcKey;
  state.project.selectedArc = arcKey;
}

// ============================================
// GENERATION TRACKING
// ============================================

/**
 * Create a deep copy of the current project state for comparison
 */
export function createSnapshot() {
  state.generation.snapshot = cloneProject(state.project);
  state.generation.hasGenerated = true;
  state.generation.lastGeneratedAt = Date.now();
}

/**
 * Detect changes between current state and snapshot
 * Uses SDK change detection
 * @returns {Array} Changes grouped by category
 */
export function detectChanges() {
  if (!state.generation.snapshot) return [];
  return detectProjectChanges(state.generation.snapshot, state.project);
}

/**
 * Set LLM-generated story text
 */
export function setGeneratedStory(text) {
  state.generation.generatedStory = text;
}

/**
 * Get LLM-generated story text
 */
export function getGeneratedStory() {
  return state.generation.generatedStory;
}

export default state;
