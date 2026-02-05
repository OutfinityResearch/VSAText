/**
 * SCRIPTA SDK - Change Detection
 * 
 * Detects changes between two project states.
 * Useful for tracking what changed since last generation.
 * 
 * @module models/change-detection
 */

/**
 * Change item
 * @typedef {Object} ChangeItem
 * @property {string} action - 'added', 'removed', or 'modified'
 * @property {string} name - Entity name
 * @property {Object} [item] - The entity
 * @property {Object} [original] - Original entity (for modifications)
 */

/**
 * Change category
 * @typedef {Object} ChangeCategory
 * @property {string} category - Category name
 * @property {string} type - Entity type
 * @property {Array<ChangeItem>} items - Changed items
 */

/**
 * Detect changes in a library array between two versions
 * @param {Array} snapArr - Snapshot array (before)
 * @param {Array} currArr - Current array (after)
 * @param {string} typeName - Type name for reporting
 * @returns {Object} Change details
 */
export function detectLibraryChanges(snapArr, currArr, typeName) {
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
        items.push({ 
          action: 'modified', 
          name: currItem.name || currItem.id, 
          item: currItem, 
          original: snapItem 
        });
      }
    }
  }
  
  return { type: typeName, items };
}

/**
 * Detect structure changes (chapters, scenes)
 * @param {Object} snapStruct - Snapshot structure
 * @param {Object} currStruct - Current structure
 * @returns {Object} Change details
 */
export function detectStructureChanges(snapStruct, currStruct) {
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
    items.push({ 
      action: diff > 0 ? 'added' : 'removed', 
      name: `${Math.abs(diff)} chapter(s)` 
    });
  }
  
  if (snapCount.scenes !== currCount.scenes) {
    const diff = currCount.scenes - snapCount.scenes;
    items.push({ 
      action: diff > 0 ? 'added' : 'removed', 
      name: `${Math.abs(diff)} scene(s)` 
    });
  }
  
  return { type: 'structure', items };
}

/**
 * Detect blueprint changes
 * @param {Object} snapBp - Snapshot blueprint
 * @param {Object} currBp - Current blueprint
 * @returns {Object} Change details
 */
export function detectBlueprintChanges(snapBp, currBp) {
  const items = [];
  
  if (snapBp?.arc !== currBp?.arc) {
    items.push({ 
      action: 'modified', 
      name: `Arc changed: ${snapBp?.arc} -> ${currBp?.arc}` 
    });
  }
  
  const snapBeatCount = snapBp?.beatMappings?.length || 0;
  const currBeatCount = currBp?.beatMappings?.length || 0;
  if (snapBeatCount !== currBeatCount) {
    items.push({ 
      action: 'modified', 
      name: `Beat mappings: ${snapBeatCount} -> ${currBeatCount}` 
    });
  }
  
  const snapTensionCount = snapBp?.tensionCurve?.length || 0;
  const currTensionCount = currBp?.tensionCurve?.length || 0;
  if (snapTensionCount !== currTensionCount) {
    items.push({ 
      action: 'modified', 
      name: `Tension curve points: ${snapTensionCount} -> ${currTensionCount}` 
    });
  }
  
  return { type: 'blueprint', items };
}

/**
 * Detect all changes between a snapshot and current project
 * @param {Object} snapshot - Snapshot project state
 * @param {Object} current - Current project state
 * @returns {Array<ChangeCategory>} All detected changes
 */
export function detectChanges(snapshot, current) {
  if (!snapshot) return [];
  
  const changes = [];
  
  // Check characters
  const charChanges = detectLibraryChanges(
    snapshot.libraries?.characters, 
    current.libraries?.characters, 
    'character'
  );
  if (charChanges.items.length > 0) {
    changes.push({ category: 'Characters', ...charChanges });
  }
  
  // Check locations
  const locChanges = detectLibraryChanges(
    snapshot.libraries?.locations, 
    current.libraries?.locations, 
    'location'
  );
  if (locChanges.items.length > 0) {
    changes.push({ category: 'Locations', ...locChanges });
  }
  
  // Check objects/plot elements
  const objChanges = detectLibraryChanges(
    snapshot.libraries?.objects, 
    current.libraries?.objects, 
    'plot element'
  );
  if (objChanges.items.length > 0) {
    changes.push({ category: 'Plot Elements', ...objChanges });
  }
  
  // Check dialogues
  const dlgChanges = detectLibraryChanges(
    snapshot.libraries?.dialogues || [], 
    current.libraries?.dialogues || [], 
    'dialogue'
  );
  if (dlgChanges.items.length > 0) {
    changes.push({ category: 'Dialogues', ...dlgChanges });
  }
  
  // Check relationships
  const relChanges = detectLibraryChanges(
    snapshot.libraries?.relationships, 
    current.libraries?.relationships, 
    'relationship'
  );
  if (relChanges.items.length > 0) {
    changes.push({ category: 'Relationships', ...relChanges });
  }
  
  // Check structure changes
  const structChanges = detectStructureChanges(
    snapshot.structure, 
    current.structure
  );
  if (structChanges.items.length > 0) {
    changes.push({ category: 'Structure', ...structChanges });
  }
  
  // Check blueprint changes
  const bpChanges = detectBlueprintChanges(
    snapshot.blueprint, 
    current.blueprint
  );
  if (bpChanges.items.length > 0) {
    changes.push({ category: 'Blueprint', ...bpChanges });
  }
  
  // Check subplots
  const spChanges = detectLibraryChanges(
    snapshot.blueprint?.subplots || [], 
    current.blueprint?.subplots || [], 
    'subplot'
  );
  if (spChanges.items.length > 0) {
    changes.push({ category: 'Subplots', ...spChanges });
  }
  
  return changes;
}

/**
 * Check if project has any changes compared to snapshot
 * @param {Object} snapshot - Snapshot project state
 * @param {Object} current - Current project state
 * @returns {boolean}
 */
export function hasChanges(snapshot, current) {
  return detectChanges(snapshot, current).length > 0;
}

export default {
  detectChanges,
  detectLibraryChanges,
  detectStructureChanges,
  detectBlueprintChanges,
  hasChanges
};
