/**
 * Tests for CNL Parser - Basic Parsing
 * 
 * Tests: Basic statement parsing, entity recognition, validation
 */

import { validateText, parseCNL } from '../../src/cnl-parser/cnl-parser.mjs';

// Test: Valid CNL should have no errors
export function testValidCnlNoErrors() {
  const cnl = 'Anna is protagonist\nAnna has trait courageous';
  const result = validateText(cnl);
  
  if (result.errors.length !== 0) {
    throw new Error(`Expected no errors, got ${result.errors.length}`);
  }
}

// Test: Invalid CNL should have errors
export function testInvalidCnlHasErrors() {
  const cnl = 'character(anna).';  // Prolog-style, not valid CNL
  const result = validateText(cnl);
  
  if (result.errors.length === 0) {
    throw new Error('Expected errors for invalid syntax');
  }
}

// Test: Entity parsing extracts names correctly
export function testEntityParsing() {
  const cnl = 'Hero is hero\nMaria is mentor';
  const result = parseCNL(cnl);
  
  const entities = Object.keys(result.ast.entities);
  if (!entities.includes('Hero')) {
    throw new Error('Expected Hero in entities');
  }
  if (!entities.includes('Maria')) {
    throw new Error('Expected Maria in entities');
  }
}

// Test: Statement verb is correctly identified
export function testVerbIdentification() {
  const cnl = 'Hero enters Castle';
  const result = parseCNL(cnl);
  
  const stmt = result.ast.statements.find(s => s.subject === 'Hero');
  if (!stmt || stmt.verb !== 'enters') {
    throw new Error(`Expected verb 'enters', got '${stmt?.verb}'`);
  }
}

// Test: Modifiers are extracted
export function testModifierExtraction() {
  const cnl = 'Hero is hero with trait brave';
  const result = parseCNL(cnl);
  
  const stmt = result.ast.statements[0];
  if (!stmt.modifiers || stmt.modifiers.with !== 'trait') {
    throw new Error('Expected modifier with=trait');
  }
}

// Test: Common narrative modifiers like "in" and "by" are extracted
export function testInByModifierExtraction() {
  const cnl = `
W1 demonstrated in Sc7
W1 realized by Anna
`;
  const result = parseCNL(cnl);
  const s1 = result.ast.statements.find(s => s.verb === 'demonstrated');
  const s2 = result.ast.statements.find(s => s.verb === 'realized');

  if (!s1?.modifiers || s1.modifiers.in !== 'Sc7') {
    throw new Error(`Expected demonstrated in Sc7, got modifiers: ${JSON.stringify(s1?.modifiers || {})}`);
  }
  if (!s2?.modifiers || s2.modifiers.by !== 'Anna') {
    throw new Error(`Expected realized by Anna, got modifiers: ${JSON.stringify(s2?.modifiers || {})}`);
  }
}

// Test: One-line block comments do not swallow the rest of the document
export function testOneLineBlockCommentDoesNotSwallowDocument() {
  const cnl = `
/* comment */
Hero is hero
`;
  const result = parseCNL(cnl);

  if (!result.ast.entities.Hero) {
    throw new Error('Expected entity "Hero" to be parsed after /* ... */ comment');
  }
}

// Test: References use the statement subject as `from` (DS11)
export function testReferencesFromUsesSubject() {
  const cnl = `Chapter2 references @Chapter1`;
  const result = parseCNL(cnl);

  if (!result.ast.references || result.ast.references.length !== 1) {
    throw new Error(`Expected 1 reference, got ${result.ast.references?.length || 0}`);
  }

  const ref = result.ast.references[0];
  if (ref.from !== 'Chapter2' || ref.to !== 'Chapter1') {
    throw new Error(`Expected from=Chapter2,to=Chapter1, got ${JSON.stringify(ref)}`);
  }
}
