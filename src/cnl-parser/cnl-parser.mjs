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

/**
 * Extract all annotations from AST.
 *
 * Returned structure is designed for prompt building and diagnostics.
 * Metrics should ignore these annotations.
 */
export function extractAnnotations(ast) {
  const result = {
    global: ast?.globalAnnotations || [],
    byStatement: [],
    byType: {}
  };

  function record(target, annotations) {
    if (!Array.isArray(annotations) || annotations.length === 0) return;
    const entry = { target, annotations };
    result.byStatement.push(entry);

    for (const ann of annotations) {
      if (!ann || !ann.type) continue;
      const type = String(ann.type).toLowerCase();
      if (!result.byType[type]) result.byType[type] = [];
      result.byType[type].push({ target, annotation: ann });
    }
  }

  function walkStatements(statements, scope = 'root') {
    for (const stmt of statements || []) {
      if (!stmt) continue;
      if (Array.isArray(stmt.annotations) && stmt.annotations.length > 0) {
        record({ kind: 'statement', scope, subject: stmt.subject, verb: stmt.verb, line: stmt.line }, stmt.annotations);
      }
    }
  }

  function walkGroups(groups, depth = 0) {
    for (const g of groups || []) {
      record({ kind: 'group', depth, name: g.name, line: g.startLine }, g.annotations);
      walkStatements(g.statements, g.name);
      if (Array.isArray(g.children) && g.children.length > 0) walkGroups(g.children, depth + 1);
    }
  }

  walkStatements(ast?.statements, 'root');
  walkGroups(ast?.groups, 0);

  for (const d of Object.values(ast?.dialogues || {})) {
    record({ kind: 'dialogue', id: d.id, line: d.line }, d.annotations);
  }

  for (const s of Object.values(ast?.subplots || {})) {
    record({ kind: 'subplot', id: s.id, line: s.line }, s.annotations);
  }

  for (const b of ast?.blueprint?.beatMappings || []) {
    record({ kind: 'beat_mapping', beatKey: b.beatKey, line: b.line }, b.annotations);
  }

  for (const [beatKey, props] of Object.entries(ast?.blueprint?.beatProperties || {})) {
    record({ kind: 'beat', beatKey, line: props?.line || null }, props?.annotations);
  }

  return result;
}

/**
 * Get annotations relevant for a specific entity ID (including global).
 *
 * This is intentionally loose: it matches by subject/group/dialogue/subplot IDs.
 */
export function getAnnotationsForEntity(ast, entityId) {
  const id = String(entityId || '');
  if (!id) return [...(ast?.globalAnnotations || [])];

  const collected = [];

  const { byStatement } = extractAnnotations(ast);
  for (const entry of byStatement) {
    const t = entry.target;
    if (!t) continue;

    const matches =
      (t.kind === 'statement' && t.subject === id) ||
      (t.kind === 'group' && t.name === id) ||
      (t.kind === 'dialogue' && t.id === id) ||
      (t.kind === 'subplot' && t.id === id) ||
      ((t.kind === 'beat' || t.kind === 'beat_mapping') && String(t.beatKey || '') === id.toLowerCase());

    if (matches) collected.push(...(entry.annotations || []));
  }

  return [...(ast?.globalAnnotations || []), ...collected];
}

/**
 * Build a compact LLM context object from annotations.
 */
export function buildLLMContext(ast, entityId) {
  const annotations = getAnnotationsForEntity(ast, entityId);

  const context = {
    examples: [],
    hints: [],
    style: [],
    avoid: [],
    voice: [],
    subtext: [],
    sensory: [],
    pacing: [],
    references: [],
    context: [],
    contrast: [],
    reveal: []
  };

  for (const ann of annotations) {
    if (!ann || !ann.type) continue;
    const type = String(ann.type).toLowerCase();
    const content = ann.content ?? '';

    if (type === 'example') context.examples.push(content);
    else if (type === 'hint') context.hints.push(content);
    else if (type === 'reference') context.references.push(content);
    else if (context[type]) context[type].push(content);
  }

  return context;
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
  generateSkeleton,
  extractAnnotations,
  getAnnotationsForEntity,
  buildLLMContext
};
