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
  validateText as validateTextInternal
} from '../cnl-parser/cnl-parser-generators.mjs';

/**
 * Validate CNL text and return validation result.
 * Wraps the generator validator to bind the active parseCNL implementation.
 */
export function validateText(text) {
  return validateTextInternal(text, parseCNL);
}

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
