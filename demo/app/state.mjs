/**
 * SCRIPTA Demo - State Management
 * 
 * Centralized application state.
 */

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

// Default blueprint structure
const createDefaultBlueprint = () => ({
  arc: 'heros_journey',
  beatMappings: [],
  tensionCurve: [],
  subplots: []
});

// Default libraries structure
const createDefaultLibraries = () => ({
  characters: [],
  locations: [],
  objects: [],
  moods: [],
  emotionalArc: [],
  themes: [],
  relationships: [],
  worldRules: [],
  dialogues: [],
  wisdom: [],      // Philosophical insights, lessons, teachings
  patterns: []     // Master plots, twists, subplot patterns
});

export const state = {
  project: {
    id: null,
    name: 'Untitled Story',
    selectedArc: 'heros_journey',
    blueprint: createDefaultBlueprint(),  // NEW: Story blueprint
    libraries: createDefaultLibraries(),
    structure: null
  },
  selectedNode: null,
  editingEntity: null,
  blocksFilter: 'all',
  blueprintView: 'timeline',  // Current blueprint view mode (timeline, templates, wizard, cnl)
  
  // Generation tracking
  generation: {
    hasGenerated: false,      // True after first generation
    snapshot: null,           // Deep copy of state after generation
    lastGeneratedAt: null,    // Timestamp of last generation
    generatedStory: null      // LLM-generated NL story text
  }
};

export function resetProject() {
  state.project = {
    id: null,
    name: 'Untitled Story',
    selectedArc: 'heros_journey',
    blueprint: createDefaultBlueprint(),
    libraries: createDefaultLibraries(),
    structure: null
  };
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
  state.project = {
    id: project.id,
    name: project.name || 'Untitled Story',
    selectedArc: project.selectedArc || 'heros_journey',
    blueprint: project.blueprint || createDefaultBlueprint(),
    libraries: {
      ...createDefaultLibraries(),
      ...(project.libraries || {})
    },
    structure: project.structure || null
  };
  // Ensure dialogues array exists for older projects
  if (!state.project.libraries.dialogues) {
    state.project.libraries.dialogues = [];
  }
}

/**
 * Get a dialogue by ID
 * @param {string} id - Dialogue ID
 * @returns {DialogueMarker|undefined}
 */
export function getDialogueById(id) {
  return state.project.libraries.dialogues.find(d => d.id === id);
}

/**
 * Add or update a dialogue marker
 * @param {DialogueMarker} dialogue - Dialogue to add/update
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
 * @returns {Subplot|undefined}
 */
export function getSubplotById(id) {
  return state.project.blueprint.subplots.find(s => s.id === id);
}

/**
 * Add or update a subplot
 * @param {Subplot} subplot - Subplot to add/update
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
 * @param {Array<TensionPoint>} curve - Tension points
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

// ==================== GENERATION TRACKING ====================

/**
 * Create a deep copy of the current project state for comparison
 */
export function createSnapshot() {
  state.generation.snapshot = JSON.parse(JSON.stringify(state.project));
  state.generation.hasGenerated = true;
  state.generation.lastGeneratedAt = Date.now();
}

/**
 * Detect changes between current state and snapshot
 * @returns {Array<{category: string, type: string, description: string, items: Array}>}
 */
export function detectChanges() {
  if (!state.generation.snapshot) return [];
  
  const changes = [];
  const snap = state.generation.snapshot;
  const curr = state.project;
  
  // Check characters
  const charChanges = detectLibraryChanges(snap.libraries.characters, curr.libraries.characters, 'character');
  if (charChanges.items.length > 0) changes.push({ category: 'Characters', ...charChanges });
  
  // Check locations
  const locChanges = detectLibraryChanges(snap.libraries.locations, curr.libraries.locations, 'location');
  if (locChanges.items.length > 0) changes.push({ category: 'Locations', ...locChanges });
  
  // Check objects/plot elements
  const objChanges = detectLibraryChanges(snap.libraries.objects, curr.libraries.objects, 'plot element');
  if (objChanges.items.length > 0) changes.push({ category: 'Plot Elements', ...objChanges });
  
  // Check dialogues
  const dlgChanges = detectLibraryChanges(snap.libraries.dialogues || [], curr.libraries.dialogues || [], 'dialogue');
  if (dlgChanges.items.length > 0) changes.push({ category: 'Dialogues', ...dlgChanges });
  
  // Check relationships
  const relChanges = detectLibraryChanges(snap.libraries.relationships, curr.libraries.relationships, 'relationship');
  if (relChanges.items.length > 0) changes.push({ category: 'Relationships', ...relChanges });
  
  // Check structure changes
  const structChanges = detectStructureChanges(snap.structure, curr.structure);
  if (structChanges.items.length > 0) changes.push({ category: 'Structure', ...structChanges });
  
  // Check blueprint changes
  const bpChanges = detectBlueprintChanges(snap.blueprint, curr.blueprint);
  if (bpChanges.items.length > 0) changes.push({ category: 'Blueprint', ...bpChanges });
  
  // Check subplots
  const spChanges = detectLibraryChanges(snap.blueprint?.subplots || [], curr.blueprint?.subplots || [], 'subplot');
  if (spChanges.items.length > 0) changes.push({ category: 'Subplots', ...spChanges });
  
  return changes;
}

/**
 * Detect changes in a library array
 */
function detectLibraryChanges(snapArr, currArr, typeName) {
  const items = [];
  const snapIds = new Set((snapArr || []).map(x => x.id));
  const currIds = new Set((currArr || []).map(x => x.id));
  
  // Added items
  for (const item of currArr || []) {
    if (!snapIds.has(item.id)) {
      items.push({ action: 'added', name: item.name || item.id, item });
    }
  }
  
  // Removed items
  for (const item of snapArr || []) {
    if (!currIds.has(item.id)) {
      items.push({ action: 'removed', name: item.name || item.id, item });
    }
  }
  
  // Modified items
  for (const currItem of currArr || []) {
    if (snapIds.has(currItem.id)) {
      const snapItem = (snapArr || []).find(x => x.id === currItem.id);
      if (JSON.stringify(snapItem) !== JSON.stringify(currItem)) {
        items.push({ action: 'modified', name: currItem.name || currItem.id, item: currItem, original: snapItem });
      }
    }
  }
  
  return { type: typeName, items };
}

/**
 * Detect structure changes (chapters, scenes)
 */
function detectStructureChanges(snapStruct, currStruct) {
  const items = [];
  
  if (!snapStruct && currStruct) {
    items.push({ action: 'added', name: 'Book structure created' });
    return { type: 'structure', items };
  }
  
  if (snapStruct && !currStruct) {
    items.push({ action: 'removed', name: 'Book structure removed' });
    return { type: 'structure', items };
  }
  
  if (!snapStruct && !currStruct) {
    return { type: 'structure', items };
  }
  
  // Count chapters and scenes
  const countNodes = (node) => {
    let chapters = 0, scenes = 0;
    for (const ch of node?.children || []) {
      if (ch.type === 'chapter') chapters++;
      for (const sc of ch?.children || []) {
        if (sc.type === 'scene') scenes++;
      }
    }
    return { chapters, scenes };
  };
  
  const snapCount = countNodes(snapStruct);
  const currCount = countNodes(currStruct);
  
  if (snapCount.chapters !== currCount.chapters) {
    const diff = currCount.chapters - snapCount.chapters;
    items.push({ action: diff > 0 ? 'added' : 'removed', name: `${Math.abs(diff)} chapter(s)` });
  }
  
  if (snapCount.scenes !== currCount.scenes) {
    const diff = currCount.scenes - snapCount.scenes;
    items.push({ action: diff > 0 ? 'added' : 'removed', name: `${Math.abs(diff)} scene(s)` });
  }
  
  return { type: 'structure', items };
}

/**
 * Detect blueprint changes
 */
function detectBlueprintChanges(snapBp, currBp) {
  const items = [];
  
  if (snapBp?.arc !== currBp?.arc) {
    items.push({ action: 'modified', name: `Arc changed: ${snapBp?.arc} → ${currBp?.arc}` });
  }
  
  const snapBeatCount = snapBp?.beatMappings?.length || 0;
  const currBeatCount = currBp?.beatMappings?.length || 0;
  if (snapBeatCount !== currBeatCount) {
    items.push({ action: 'modified', name: `Beat mappings: ${snapBeatCount} → ${currBeatCount}` });
  }
  
  const snapTensionCount = snapBp?.tensionCurve?.length || 0;
  const currTensionCount = currBp?.tensionCurve?.length || 0;
  if (snapTensionCount !== currTensionCount) {
    items.push({ action: 'modified', name: `Tension curve points: ${snapTensionCount} → ${currTensionCount}` });
  }
  
  return { type: 'blueprint', items };
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
