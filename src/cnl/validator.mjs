#!/usr/bin/env node
/**
 * SCRIPTA CNL Validator
 * 
 * Re-exports the unified parser from src/cnl-parser/
 * Works in both browser and Node.js environments.
 */

// Direct imports from cnl-parser module
import {
  parseCNL,
  parseLine,
  tokenizeLine,
  extractEntities,
  extractConstraints,
  extractOwnership,
  countGroups,
  ENTITY_TYPES
} from '../cnl-parser/cnl-parser-core.mjs';

import {
  generateMarkdown,
  generateSkeleton,
  validateText
} from '../cnl-parser/cnl-parser-generators.mjs';

// Re-export all functions
export {
  parseCNL,
  parseLine,
  tokenizeLine,
  extractEntities,
  extractConstraints,
  extractOwnership,
  countGroups,
  generateMarkdown,
  generateSkeleton,
  validateText,
  ENTITY_TYPES
};

// Default export for convenience
export default {
  parseCNL,
  validateText,
  extractEntities,
  extractConstraints,
  extractOwnership,
  countGroups,
  generateMarkdown,
  generateSkeleton
};
