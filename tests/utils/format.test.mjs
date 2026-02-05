/**
 * Tests for src/utils/format.mjs
 * 
 * Tests: formatId, escapeString, generateId
 */

import { formatId, fid, escapeString, generateId } from '../../src/utils/format.mjs';

// Test: formatId with simple identifier
export function testFormatIdSimple() {
  const result = formatId('hero');
  if (result !== 'hero') {
    throw new Error(`Expected 'hero', got '${result}'`);
  }
}

// Test: formatId with spaces
export function testFormatIdWithSpaces() {
  const result = formatId('Dark Knight');
  if (result !== '"Dark Knight"') {
    throw new Error(`Expected '"Dark Knight"', got '${result}'`);
  }
}

// Test: formatId with special characters
export function testFormatIdWithSpecialChars() {
  const result = formatId('test@123');
  if (result !== '"test@123"') {
    throw new Error(`Expected '"test@123"', got '${result}'`);
  }
}

// Test: formatId with underscore (should not quote)
export function testFormatIdWithUnderscore() {
  const result = formatId('hero_name');
  if (result !== 'hero_name') {
    throw new Error(`Expected 'hero_name', got '${result}'`);
  }
}

// Test: formatId with null/empty
export function testFormatIdEmpty() {
  if (formatId(null) !== '') {
    throw new Error('Expected empty string for null');
  }
  if (formatId('') !== '') {
    throw new Error('Expected empty string for empty input');
  }
}

// Test: fid is alias for formatId
export function testFidAlias() {
  if (fid !== formatId) {
    throw new Error('fid should be alias for formatId');
  }
}

// Test: escapeString with quotes
export function testEscapeStringWithQuotes() {
  const result = escapeString('He said "hello"');
  if (result !== 'He said \\"hello\\"') {
    throw new Error(`Expected escaped quotes, got '${result}'`);
  }
}

// Test: escapeString with backslash
export function testEscapeStringWithBackslash() {
  const result = escapeString('path\\to\\file');
  if (result !== 'path\\\\to\\\\file') {
    throw new Error(`Expected escaped backslashes, got '${result}'`);
  }
}

// Test: escapeString with null/empty
export function testEscapeStringEmpty() {
  if (escapeString(null) !== '') {
    throw new Error('Expected empty string for null');
  }
}

// Test: generateId creates unique IDs
export function testGenerateIdUnique() {
  const id1 = generateId('test');
  const id2 = generateId('test');
  
  if (id1 === id2) {
    throw new Error('Generated IDs should be unique');
  }
}

// Test: generateId uses prefix
export function testGenerateIdPrefix() {
  const id = generateId('char');
  if (!id.startsWith('char_')) {
    throw new Error(`Expected ID to start with 'char_', got '${id}'`);
  }
}

// Test: generateId default prefix
export function testGenerateIdDefaultPrefix() {
  const id = generateId();
  if (!id.startsWith('id_')) {
    throw new Error(`Expected ID to start with 'id_', got '${id}'`);
  }
}
