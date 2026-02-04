/**
 * SCRIPTA CNL Parser - Grammar Constants
 *
 * Shared grammar sets (verbs, modifiers, entity types, etc.).
 * Kept separate to keep the core parser module within the repo size guidelines.
 */

// Reserved verbs in the CNL grammar
export const VERBS = new Set([
  // Core verbs
  'is', 'has', 'relates', 'includes', 'references', 'describes',

  // Constraint verbs
  'requires', 'forbids', 'must', 'owns', 'applies',

  // Action verbs
  'targets', 'meets', 'discovers', 'enters', 'travels',
  'decides', 'faces', 'threatens', 'destroys', 'disappears',
  'approaches', 'continues', 'resolves', 'foreshadows',
  'remembers', 'interacts', 'arrives',

  // Emotional/cognitive verbs
  'wants', 'fears', 'loves', 'hates', 'seeks', 'avoids',
  'confronts', 'escapes', 'returns', 'transforms', 'reveals',
  'hides', 'promises', 'betrays', 'saves', 'abandons',
  'creates', 'begins', 'ends', 'causes', 'prevents',

  // Screenplay verbs
  'exits', 'speaks', 'reacts', 'observes',

  // Blueprint/Dialogue/Subplot verbs
  'uses', 'mapped', 'linked', 'involves', 'starts', 'touchpoint', 'says'
]);

// Annotation types used to guide LLM generation (ignored by metrics).
// Syntax:
//   #hint: ...
//   #example: ...
//   #example: begin ... #example: end
export const ANNOTATION_TYPES = new Set([
  'example',
  'hint',
  'style',
  'avoid',
  'voice',
  'subtext',
  'sensory',
  'pacing',
  'reference',
  'context',
  'contrast',
  'reveal'
]);

// Properties that may appear multiple times and must not overwrite previous values.
export const MULTI_VALUE_PROPERTIES = new Set([
  'characteristic',
  'rule',
  'symbol',
  'value',
  'question',
  'setup',
  'payoff',
  'note',
  'theme',
  // World rule details often repeat
  'exception',
  'implication'
]);

// Modifiers that connect parts of statements
export const MODIFIERS = new Set([
  'as', 'to', 'at', 'from', 'with', 'about', 'during',
  'because', 'despite', 'before', 'after',
  // Common narrative linking modifiers used by theory/spec examples
  'in', 'by'
]);

// Entity types
export const ENTITY_TYPES = new Set([
  'protagonist', 'character', 'antagonist', 'mentor', 'ally', 'enemy',
  'location', 'place', 'setting',
  'theme', 'motif',
  'artifact', 'object', 'item',
  'event', 'conflict', 'goal',

  // Blueprint/Dialogue/Subplot types
  'dialogue', 'subplot', 'beat', 'exchange',
  'mood',

  // Higher-level narrative specification types
  'world_rule',
  'wisdom',
  'pattern',
  'template'
]);

// Dialogue purposes
export const DIALOGUE_PURPOSES = new Set([
  'revelation', 'confrontation', 'bonding', 'exposition', 'conflict',
  'confession', 'negotiation', 'farewell', 'deception', 'comic_relief',
  'planning', 'interrogation'
]);

// Dialogue tones
export const DIALOGUE_TONES = new Set([
  'serious', 'playful', 'tense', 'intimate', 'angry', 'cold', 'warm',
  'nervous', 'sarcastic', 'melancholic', 'determined', 'curious',
  'threatening', 'vulnerable', 'diplomatic', 'excited'
]);

// Subplot types
export const SUBPLOT_TYPES = new Set([
  'romance', 'rivalry', 'mystery', 'growth', 'revenge', 'mentorship',
  'redemption', 'power_struggle', 'survival', 'secret'
]);

export default {
  VERBS,
  ANNOTATION_TYPES,
  MULTI_VALUE_PROPERTIES,
  MODIFIERS,
  ENTITY_TYPES,
  DIALOGUE_PURPOSES,
  DIALOGUE_TONES,
  SUBPLOT_TYPES
};
