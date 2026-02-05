/**
 * SCRIPTA SDK - Project Model
 * 
 * Defines the canonical project structure and provides factory functions.
 * Pure data structures with no side effects.
 * 
 * @module models/project
 */

// ============================================
// TYPE DEFINITIONS (JSDoc)
// ============================================

/**
 * Blueprint structure for story planning
 * @typedef {Object} Blueprint
 * @property {string} arc - Selected narrative arc key
 * @property {Array<BeatMapping>} beatMappings - Beat to chapter/scene mappings
 * @property {Array<TensionPoint>} tensionCurve - Custom tension curve points
 * @property {Array<Subplot>} subplots - Story subplots
 */

/**
 * Beat mapping structure
 * @typedef {Object} BeatMapping
 * @property {string} beatKey - The narrative beat key
 * @property {string} chapterId - Mapped chapter ID
 * @property {string} [sceneId] - Optional scene ID
 * @property {number} tension - Tension level (1-5)
 * @property {string} [notes] - User notes
 */

/**
 * Tension curve point
 * @typedef {Object} TensionPoint
 * @property {number} position - Position in story (0.0-1.0)
 * @property {number} tension - Tension level (1-5)
 */

/**
 * Subplot structure
 * @typedef {Object} Subplot
 * @property {string} id - Unique ID
 * @property {string} name - Subplot name
 * @property {string} type - Subplot type (romance, rivalry, mystery, etc.)
 * @property {Array<string>} characterIds - Involved characters
 * @property {string} [startBeat] - Beat where subplot starts
 * @property {string} [resolveBeat] - Beat where subplot resolves
 * @property {Array<Touchpoint>} touchpoints - Story touchpoints
 */

/**
 * Subplot touchpoint
 * @typedef {Object} Touchpoint
 * @property {string} chapterId - Chapter reference
 * @property {string} [sceneId] - Scene reference
 * @property {string} event - Event description
 */

/**
 * Dialogue marker for scenes
 * @typedef {Object} DialogueMarker
 * @property {string} id - Unique ID
 * @property {string} purpose - Dialogue purpose (reveal, conflict, bonding, etc.)
 * @property {Array<DialogueParticipant>} participants - Characters involved
 * @property {string} tone - Dialogue tone
 * @property {number} tension - Tension level (1-5)
 * @property {string} [beatKey] - Linked narrative beat
 * @property {Array<DialogueExchange>} exchanges - Dialogue outline
 * @property {Object} [location] - Location reference
 */

/**
 * Dialogue participant
 * @typedef {Object} DialogueParticipant
 * @property {string} characterId - Character reference
 * @property {string} role - 'speaker' or 'listener'
 */

/**
 * Dialogue exchange (one line in the outline)
 * @typedef {Object} DialogueExchange
 * @property {string} speakerId - Speaking character ID
 * @property {string} intent - What the character wants to convey
 * @property {string} emotion - Character's emotion
 * @property {string} sketch - Schematic replica text (placeholder)
 */

/**
 * Character entity
 * @typedef {Object} Character
 * @property {string} id - Unique ID
 * @property {string} name - Character name
 * @property {string} archetype - Character archetype
 * @property {Array<string>} traits - Character traits
 */

/**
 * Location entity
 * @typedef {Object} Location
 * @property {string} id - Unique ID
 * @property {string} name - Location name
 * @property {string} geography - Geography type
 * @property {string} [time] - Time period/era
 * @property {Array<string>} characteristics - Location characteristics
 */

/**
 * Libraries collection
 * @typedef {Object} Libraries
 * @property {Array<Character>} characters
 * @property {Array<Location>} locations
 * @property {Array} objects
 * @property {Array} moods
 * @property {Array} emotionalArc
 * @property {Array} themes
 * @property {Array} relationships
 * @property {Array} worldRules
 * @property {Array<DialogueMarker>} dialogues
 * @property {Array} wisdom
 * @property {Array} patterns
 */

/**
 * Project structure
 * @typedef {Object} Project
 * @property {string|null} id - Project ID
 * @property {string} name - Project name
 * @property {string} selectedArc - Selected narrative arc
 * @property {Blueprint} blueprint - Story blueprint
 * @property {Libraries} libraries - Entity libraries
 * @property {Object|null} structure - Story structure tree
 */

// ============================================
// FACTORY FUNCTIONS
// ============================================

/**
 * Create a default empty blueprint
 * @returns {Blueprint}
 */
export function createDefaultBlueprint() {
  return {
    arc: 'heros_journey',
    beatMappings: [],
    tensionCurve: [],
    subplots: []
  };
}

/**
 * Create default empty libraries
 * @returns {Libraries}
 */
export function createDefaultLibraries() {
  return {
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
  };
}

/**
 * Create a new empty project
 * @param {string} name - Project name
 * @returns {Project}
 */
export function createProject(name = 'Untitled Story') {
  return {
    id: null,
    name,
    selectedArc: 'heros_journey',
    blueprint: createDefaultBlueprint(),
    libraries: createDefaultLibraries(),
    structure: null
  };
}

/**
 * Deep clone a project
 * @param {Project} project
 * @returns {Project}
 */
export function cloneProject(project) {
  return JSON.parse(JSON.stringify(project));
}

// ============================================
// ENTITY CRUD OPERATIONS
// ============================================

/**
 * Get an entity by ID from a library array
 * @param {Array} library - Library array
 * @param {string} id - Entity ID
 * @returns {Object|undefined}
 */
export function getEntityById(library, id) {
  return library.find(e => e.id === id);
}

/**
 * Add or update an entity in a library
 * Returns a new array (immutable)
 * @param {Array} library - Library array
 * @param {Object} entity - Entity to upsert
 * @returns {Array} New library array
 */
export function upsertEntity(library, entity) {
  const index = library.findIndex(e => e.id === entity.id);
  if (index >= 0) {
    const result = [...library];
    result[index] = entity;
    return result;
  }
  return [...library, entity];
}

/**
 * Remove an entity from a library
 * Returns a new array (immutable)
 * @param {Array} library - Library array
 * @param {string} id - Entity ID to remove
 * @returns {Array} New library array
 */
export function removeEntity(library, id) {
  return library.filter(e => e.id !== id);
}

// ============================================
// DIALOGUE OPERATIONS
// ============================================

/**
 * Get a dialogue by ID
 * @param {Project} project
 * @param {string} id
 * @returns {DialogueMarker|undefined}
 */
export function getDialogue(project, id) {
  return getEntityById(project.libraries.dialogues, id);
}

/**
 * Add or update a dialogue
 * Returns a new project (immutable)
 * @param {Project} project
 * @param {DialogueMarker} dialogue
 * @returns {Project}
 */
export function upsertDialogue(project, dialogue) {
  return {
    ...project,
    libraries: {
      ...project.libraries,
      dialogues: upsertEntity(project.libraries.dialogues, dialogue)
    }
  };
}

/**
 * Remove a dialogue
 * Returns a new project (immutable)
 * @param {Project} project
 * @param {string} id
 * @returns {Project}
 */
export function removeDialogue(project, id) {
  return {
    ...project,
    libraries: {
      ...project.libraries,
      dialogues: removeEntity(project.libraries.dialogues, id)
    }
  };
}

// ============================================
// SUBPLOT OPERATIONS
// ============================================

/**
 * Get a subplot by ID
 * @param {Project} project
 * @param {string} id
 * @returns {Subplot|undefined}
 */
export function getSubplot(project, id) {
  return getEntityById(project.blueprint.subplots, id);
}

/**
 * Add or update a subplot
 * Returns a new project (immutable)
 * @param {Project} project
 * @param {Subplot} subplot
 * @returns {Project}
 */
export function upsertSubplot(project, subplot) {
  return {
    ...project,
    blueprint: {
      ...project.blueprint,
      subplots: upsertEntity(project.blueprint.subplots, subplot)
    }
  };
}

/**
 * Remove a subplot
 * Returns a new project (immutable)
 * @param {Project} project
 * @param {string} id
 * @returns {Project}
 */
export function removeSubplot(project, id) {
  return {
    ...project,
    blueprint: {
      ...project.blueprint,
      subplots: removeEntity(project.blueprint.subplots, id)
    }
  };
}

// ============================================
// BLUEPRINT OPERATIONS
// ============================================

/**
 * Update a beat mapping
 * Returns a new project (immutable)
 * @param {Project} project
 * @param {string} beatKey
 * @param {Object} mapping
 * @returns {Project}
 */
export function updateBeatMapping(project, beatKey, mapping) {
  const existing = project.blueprint.beatMappings.findIndex(b => b.beatKey === beatKey);
  let newMappings;
  
  if (existing >= 0) {
    newMappings = [...project.blueprint.beatMappings];
    newMappings[existing] = { beatKey, ...mapping };
  } else {
    newMappings = [...project.blueprint.beatMappings, { beatKey, ...mapping }];
  }
  
  return {
    ...project,
    blueprint: {
      ...project.blueprint,
      beatMappings: newMappings
    }
  };
}

/**
 * Set tension curve
 * Returns a new project (immutable)
 * @param {Project} project
 * @param {Array<TensionPoint>} curve
 * @returns {Project}
 */
export function setTensionCurve(project, curve) {
  return {
    ...project,
    blueprint: {
      ...project.blueprint,
      tensionCurve: curve
    }
  };
}

/**
 * Set blueprint arc
 * Returns a new project (immutable)
 * @param {Project} project
 * @param {string} arcKey
 * @returns {Project}
 */
export function setBlueprintArc(project, arcKey) {
  return {
    ...project,
    selectedArc: arcKey,
    blueprint: {
      ...project.blueprint,
      arc: arcKey
    }
  };
}

// ============================================
// LOAD/MERGE OPERATIONS
// ============================================

/**
 * Load project data, merging with defaults
 * Ensures all required fields exist
 * @param {Object} data - Raw project data
 * @returns {Project}
 */
export function loadProject(data) {
  return {
    id: data.id || null,
    name: data.name || 'Untitled Story',
    selectedArc: data.selectedArc || 'heros_journey',
    blueprint: {
      ...createDefaultBlueprint(),
      ...(data.blueprint || {})
    },
    libraries: {
      ...createDefaultLibraries(),
      ...(data.libraries || {})
    },
    structure: data.structure || null
  };
}

// ============================================
// EXPORTS
// ============================================

export default {
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
};
