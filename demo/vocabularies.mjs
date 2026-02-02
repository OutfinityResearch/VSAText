/**
 * SCRIPTA Predefined Vocabularies v3.1
 * 
 * Main aggregator module for Visual Story Composer vocabularies.
 * 
 * Imports from specialized modules:
 * - vocab-characters.mjs: Character traits, archetypes, relationships
 * - vocab-locations.mjs: Geography, time periods, characteristics, objects
 * - vocab-narrative.mjs: Emotions, moods, arcs, themes, conflicts
 * - vocab-actions.mjs: Narrative blocks and character actions
 */

// Import character vocabularies
import {
  CHARACTER_TRAITS,
  CHARACTER_ARCHETYPES,
  RELATIONSHIP_TYPES,
  CHARACTER_NAMES
} from './vocab-characters.mjs';

// Import location vocabularies
import {
  LOCATION_GEOGRAPHY,
  LOCATION_TIME,
  LOCATION_CHARACTERISTICS,
  LOCATION_NAMES,
  OBJECT_TYPES,
  OBJECT_SIGNIFICANCE,
  OBJECT_NAMES
} from './vocab-locations.mjs';

// Import narrative vocabularies
import {
  EMOTIONS,
  MOOD_PRESETS,
  NARRATIVE_ARCS,
  THEMES,
  CONFLICTS
} from './vocab-narrative.mjs';

// Import action vocabularies
import {
  NARRATIVE_BLOCKS,
  ACTIONS
} from './vocab-actions.mjs';

// ============================================
// AGGREGATE NAMES (for backward compatibility)
// ============================================
export const NAMES = {
  characters: CHARACTER_NAMES,
  locations: LOCATION_NAMES,
  objects: OBJECT_NAMES
};

// ============================================
// RE-EXPORT ALL
// ============================================
export {
  CHARACTER_TRAITS,
  CHARACTER_ARCHETYPES,
  RELATIONSHIP_TYPES,
  LOCATION_GEOGRAPHY,
  LOCATION_TIME,
  LOCATION_CHARACTERISTICS,
  OBJECT_TYPES,
  OBJECT_SIGNIFICANCE,
  EMOTIONS,
  MOOD_PRESETS,
  NARRATIVE_ARCS,
  NARRATIVE_BLOCKS,
  ACTIONS,
  THEMES,
  CONFLICTS
};

// ============================================
// DEFAULT EXPORT (for import VOCAB from ...)
// ============================================
export default {
  CHARACTER_TRAITS,
  CHARACTER_ARCHETYPES,
  RELATIONSHIP_TYPES,
  LOCATION_GEOGRAPHY,
  LOCATION_TIME,
  LOCATION_CHARACTERISTICS,
  EMOTIONS,
  MOOD_PRESETS,
  NARRATIVE_ARCS,
  NARRATIVE_BLOCKS,
  ACTIONS,
  OBJECT_TYPES,
  OBJECT_SIGNIFICANCE,
  THEMES,
  CONFLICTS,
  NAMES
};
