/**
 * SCRIPTA Predefined Vocabularies v0.1.0
 * 
 * Main aggregator module for Visual Story Composer vocabularies.
 * 
 * Imports from specialized modules:
 * - vocab-characters.mjs: Character traits, archetypes, relationships
 * - vocab-locations.mjs: Geography, time periods, characteristics, objects
 * - vocab-narrative.mjs: Emotions, moods, arcs, themes, conflicts
 * - vocab-actions.mjs: Narrative blocks and character actions
 * - vocab-patterns.mjs: Master plots, twists, character dynamics, endings
 * - vocab-settings.mjs: Setting archetypes, atmosphere, symbolic meanings
 * - vocab-wisdom.mjs: Philosophical, psychological, moral insights
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

// Import pattern vocabularies
import {
  MASTER_PLOTS,
  TWIST_TYPES,
  SUBPLOT_PATTERNS,
  CHARACTER_DYNAMICS,
  STAKES_ESCALATION,
  ENDING_PATTERNS,
  OPENING_HOOKS,
  GENRE_HYBRIDS,
  EMOTIONAL_SEQUENCES
} from './vocab-patterns.mjs';

// Import wisdom vocabularies
import {
  PHILOSOPHICAL_TRADITIONS,
  MORAL_INSIGHTS,
  PSYCHOLOGICAL_INSIGHTS,
  SCIENTIFIC_INSIGHTS,
  HUMANIST_PRINCIPLES,
  LIFE_LESSONS,
  WISDOM_CATEGORIES
} from './vocab-wisdom.mjs';

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
  // Character vocabularies
  CHARACTER_TRAITS,
  CHARACTER_ARCHETYPES,
  RELATIONSHIP_TYPES,
  // Location vocabularies
  LOCATION_GEOGRAPHY,
  LOCATION_TIME,
  LOCATION_CHARACTERISTICS,
  OBJECT_TYPES,
  OBJECT_SIGNIFICANCE,
  // Narrative vocabularies
  EMOTIONS,
  MOOD_PRESETS,
  NARRATIVE_ARCS,
  NARRATIVE_BLOCKS,
  ACTIONS,
  THEMES,
  CONFLICTS,
  // Pattern vocabularies
  MASTER_PLOTS,
  TWIST_TYPES,
  SUBPLOT_PATTERNS,
  CHARACTER_DYNAMICS,
  STAKES_ESCALATION,
  ENDING_PATTERNS,
  OPENING_HOOKS,
  GENRE_HYBRIDS,
  EMOTIONAL_SEQUENCES,
  // Wisdom vocabularies
  PHILOSOPHICAL_TRADITIONS,
  MORAL_INSIGHTS,
  PSYCHOLOGICAL_INSIGHTS,
  SCIENTIFIC_INSIGHTS,
  HUMANIST_PRINCIPLES,
  LIFE_LESSONS,
  WISDOM_CATEGORIES
};

// ============================================
// DEFAULT EXPORT (for import VOCAB from ...)
// ============================================
export default {
  // Character
  CHARACTER_TRAITS,
  CHARACTER_ARCHETYPES,
  RELATIONSHIP_TYPES,
  // Location
  LOCATION_GEOGRAPHY,
  LOCATION_TIME,
  LOCATION_CHARACTERISTICS,
  // Narrative
  EMOTIONS,
  MOOD_PRESETS,
  NARRATIVE_ARCS,
  NARRATIVE_BLOCKS,
  ACTIONS,
  // Objects
  OBJECT_TYPES,
  OBJECT_SIGNIFICANCE,
  // Themes & Conflicts
  THEMES,
  CONFLICTS,
  // Patterns
  MASTER_PLOTS,
  TWIST_TYPES,
  SUBPLOT_PATTERNS,
  CHARACTER_DYNAMICS,
  STAKES_ESCALATION,
  ENDING_PATTERNS,
  OPENING_HOOKS,
  GENRE_HYBRIDS,
  EMOTIONAL_SEQUENCES,
  // Wisdom
  PHILOSOPHICAL_TRADITIONS,
  MORAL_INSIGHTS,
  PSYCHOLOGICAL_INSIGHTS,
  SCIENTIFIC_INSIGHTS,
  HUMANIST_PRINCIPLES,
  LIFE_LESSONS,
  WISDOM_CATEGORIES,
  // Names
  NAMES
};
