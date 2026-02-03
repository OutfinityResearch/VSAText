/**
 * SCRIPTA CNL Parser - Unified Module
 * 
 * Works in both browser (via <script type="module">) and Node.js
 * 
 * Parses Controlled Natural Language (CNL) with Subject-Verb-Object syntax
 * and recursive group support.
 * 
 * Syntax examples:
 *   Anna is protagonist
 *   Anna has trait courage
 *   Anna relates to Marcus as sibling
 *   Chapter1 group begin
 *     ...statements...
 *   Chapter1 group end
 * 
 * Refactored into modules:
 * - cnl-parser-core.mjs: Core parsing functions
 * - cnl-parser-generators.mjs: Markdown and skeleton generators
 */

// Import core functions
import {
  parseCNL,
  parseLine,
  tokenizeLine,
  extractEntities,
  extractConstraints,
  extractOwnership,
  countGroups,
  ENTITY_TYPES
} from './cnl-parser-core.mjs';

// Import generator functions
import {
  generateMarkdown,
  generateSkeleton,
  validateText as validateTextInternal
} from './cnl-parser-generators.mjs';

/**
 * Validate CNL text and return validation result
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
