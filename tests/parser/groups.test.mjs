/**
 * Tests for CNL Parser - Group Parsing
 * 
 * Tests: Book/Chapter/Scene group structure parsing
 */

import { parseCNL } from '../../src/cnl-parser/cnl-parser.mjs';

// Test: Group begin/end creates nested structure
export function testGroupNesting() {
  const cnl = `
TestNovel group begin
  Ch1 group begin
    Sc1 group begin
    Sc1 group end
  Ch1 group end
TestNovel group end
`;
  
  const result = parseCNL(cnl);
  const groups = result.ast.groups;
  
  if (groups.length !== 1) {
    throw new Error(`Expected 1 top-level group, got ${groups.length}`);
  }
  if (groups[0].name !== 'TestNovel') {
    throw new Error(`Expected group name 'TestNovel', got '${groups[0].name}'`);
  }
  if (groups[0].children.length !== 1) {
    throw new Error('Expected 1 child chapter');
  }
  if (groups[0].children[0].children.length !== 1) {
    throw new Error('Expected 1 child scene');
  }
}

// Test: Statements inside groups are captured
export function testStatementsInGroups() {
  const cnl = `
Ch1 group begin
  Ch1 has title "First Chapter"
  Hero enters Castle
Ch1 group end
`;
  
  const result = parseCNL(cnl);
  const ch1 = result.ast.groups[0];
  
  if (!ch1.statements || ch1.statements.length < 2) {
    throw new Error('Expected at least 2 statements in group');
  }
}

// Test: Group properties are extracted
export function testGroupProperties() {
  const cnl = `
Chapter1 group begin
  Chapter1 has title "The Beginning"
Chapter1 group end
`;
  
  const result = parseCNL(cnl);
  const chapter = result.ast.groups[0];
  
  if (chapter.properties.title !== 'The Beginning') {
    throw new Error(`Expected title 'The Beginning', got '${chapter.properties.title}'`);
  }
}

// Test: Includes are parsed inside groups
export function testIncludesInGroups() {
  const cnl = `
Sc1 group begin
  Sc1 includes character Hero
  Sc1 includes location Castle
Sc1 group end
`;
  
  const result = parseCNL(cnl);
  const scene = result.ast.groups[0];
  const includes = scene.statements.filter(s => s.verb === 'includes');
  
  if (includes.length !== 2) {
    throw new Error(`Expected 2 includes, got ${includes.length}`);
  }
}

// Test: Unclosed groups produce errors
export function testUnclosedGroupError() {
  const cnl = `
TestNovel group begin
  Ch1 group begin
TestNovel group end
`;
  // Missing Ch1 group end
  
  const result = parseCNL(cnl);
  
  if (result.errors.length === 0) {
    throw new Error('Expected error for mismatched group end');
  }
}

// Test: Dot identifiers (e.g., Sc1.1) are parsed as group names
export function testDotIdGroupNamesParsed() {
  const cnl = `
Book group begin
  Ch1 group begin
    Sc1.1 group begin
    Sc1.1 group end
  Ch1 group end
Book group end
`;

  const result = parseCNL(cnl);
  const book = result.ast.groups[0];
  const ch1 = book?.children?.[0];
  const scene = ch1?.children?.[0];

  if (!scene || scene.name !== 'Sc1.1') {
    throw new Error(`Expected a scene group named 'Sc1.1', got '${scene?.name}'`);
  }
}

// Test: Quoted group names with spaces are supported
export function testQuotedGroupNamesParsed() {
  const cnl = `
"Chapter 1" group begin
  "Scene 1.1" group begin
  "Scene 1.1" group end
"Chapter 1" group end
`;

  const result = parseCNL(cnl);
  const chapter = result.ast.groups[0];
  const scene = chapter?.children?.[0];

  if (!chapter || chapter.name !== 'Chapter 1') {
    throw new Error(`Expected chapter name 'Chapter 1', got '${chapter?.name}'`);
  }
  if (!scene || scene.name !== 'Scene 1.1') {
    throw new Error(`Expected scene name 'Scene 1.1', got '${scene?.name}'`);
  }
}
