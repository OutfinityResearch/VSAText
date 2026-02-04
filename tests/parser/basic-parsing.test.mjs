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
