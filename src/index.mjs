/**
 * SCRIPTA SDK - Main Entry Point
 * 
 * Unified export of all SCRIPTA functionality.
 * Works in both browser and Node.js environments.
 * 
 * Usage:
 *   import { parseCNL, generatePlan } from './src/index.mjs';
 */

// ============================================
// CNL Parser
// ============================================
export {
  parseCNL,
  validateText,
  parseLine,
  tokenizeLine,
  extractEntities,
  extractConstraints,
  extractOwnership,
  countGroups,
  generateMarkdown,
  generateSkeleton,
  ENTITY_TYPES
} from './cnl-parser/cnl-parser.mjs';

// ============================================
// Vocabularies
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
  THEMES,
  CONFLICTS,
  NARRATIVE_BLOCKS,
  ACTIONS,
  NAMES
} from './vocabularies/vocabularies.mjs';

// ============================================
// Services - Planning
// ============================================
export {
  generatePlan,
  extractCharactersFromSpec,
  extractSceneRequirementsFromSpec,
  STORY_STRUCTURES,
  SCENE_TEMPLATES
} from './services/planning.mjs';

// ============================================
// Services - Verification
// ============================================
export {
  verifyAgainstSpec,
  verifyCnl,
  verifyAgainstAST,
  checkMustInclude,
  checkForbidden
} from './services/verification.mjs';

// ============================================
// Services - Evaluation
// ============================================
export {
  calculateNQS,
  calculateCAD,
  calculateCoherence,
  calculateReadability,
  runEvaluation
} from './services/evaluation.mjs';

// ============================================
// Unified CNL Evaluation
// ============================================
export {
  evaluateCNL,
  quickEvaluate
} from './evaluate.mjs';

// ============================================
// Metrics Interpreter (Normative DS12)
// ============================================
export {
  interpretCNL
} from './interpreter/interpreter.mjs';

export {
  buildWorldModel
} from './interpreter/world-model.mjs';

export {
  deriveSemanticDiagnostics
} from './interpreter/semantic-diagnostics.mjs';

// ============================================
// Services - Guardrails
// ============================================
export {
  runGuardrailCheck,
  checkCliches,
  checkStereotypes,
  checkHarmfulContent,
  CLICHES
} from './services/guardrails.mjs';

// ============================================
// Services - CNL Translation
// ============================================
export {
  translateNlToCnl,
  generateCnlFromSpec,
  PATTERNS
} from './services/cnl-translator.mjs';

// ============================================
// Services - Reverse Engineering
// ============================================
export {
  reverseEngineer,
  extractSpec,
  extractPlan
} from './services/reverse-engineering.mjs';

// ============================================
// Services - Literary Review
// ============================================
export {
  runLiteraryReview,
  analyzePacing,
  analyzeDialogue
} from './services/literary-review.mjs';

// ============================================
// VSA Encoder
// ============================================
export {
  encodeText,
  bind,
  bundle,
  permute,
  cosine
} from './vsa/encoder.mjs';

// ============================================
// Story Generation
// ============================================
export {
  generateRandomStory,
  generateRandom,
  NARRATIVE_ARCS as GENERATION_ARCS,
  GENRE_CONFIG
} from './generation/index.mjs';

// ============================================
// Default export
// ============================================
export default {
  version: '0.1.0',
  name: 'SCRIPTA SDK',
  environment: 'browser'
};
