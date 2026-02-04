/**
 * Tests for CNL Parser - LLM Annotations
 *
 * Tests: #hint/#example parsing (inline + block), attachment rules, and fallback to comment for unknown #lines.
 */

import { parseCNL } from '../../src/cnl-parser/cnl-parser.mjs';

// Test: Global annotations (before any statement) are collected
export function testGlobalAnnotationsCollected() {
  const cnl = `
#style: noir detective, clipped sentences
Story is fiction
`;

  const result = parseCNL(cnl);
  const anns = result.ast.globalAnnotations || [];

  if (anns.length !== 1) {
    throw new Error(`Expected 1 global annotation, got ${anns.length}`);
  }
  if (anns[0].type !== 'style') {
    throw new Error(`Expected type 'style', got '${anns[0].type}'`);
  }
}

// Test: Inline annotations attach to the previous statement
export function testInlineAnnotationAttachesToStatement() {
  const cnl = `
Anna has trait brave
#hint: Show bravery through action, not declarations.
`;

  const result = parseCNL(cnl);
  const stmt = (result.ast.statements || []).find(s =>
    s.subject === 'Anna' && s.verb === 'has' && String(s.objects?.[0] || '').toLowerCase() === 'trait'
  );

  if (!stmt) throw new Error('Expected trait statement for Anna');
  if (!stmt.annotations || stmt.annotations.length !== 1) {
    throw new Error(`Expected 1 statement annotation, got ${stmt.annotations?.length || 0}`);
  }
  if (stmt.annotations[0].type !== 'hint') {
    throw new Error(`Expected annotation type 'hint', got '${stmt.annotations[0].type}'`);
  }
}

// Test: Unknown #lines remain comments and do not attach as annotations
export function testUnknownHashLineIsIgnored() {
  const cnl = `
Anna has trait brave
#unknown: should be ignored
`;

  const result = parseCNL(cnl);
  const stmt = (result.ast.statements || []).find(s =>
    s.subject === 'Anna' && s.verb === 'has' && String(s.objects?.[0] || '').toLowerCase() === 'trait'
  );

  if (!stmt) throw new Error('Expected trait statement for Anna');
  if (stmt.annotations && stmt.annotations.length !== 0) {
    throw new Error('Expected no annotations for unknown #type');
  }
}

// Test: Block annotations collect multi-line content and attach to previous statement
export function testAnnotationBlockAttaches() {
  const cnl = `
Sc7 has purpose revelation
#example: begin
  Line one
  Line two
#example: end
`;

  const result = parseCNL(cnl);
  const stmt = (result.ast.statements || []).find(s =>
    s.subject === 'Sc7' && s.verb === 'has' && String(s.objects?.[0] || '').toLowerCase() === 'purpose'
  );

  if (!stmt) throw new Error('Expected purpose statement for Sc7');
  if (!stmt.annotations || stmt.annotations.length !== 1) {
    throw new Error(`Expected 1 block annotation, got ${stmt.annotations?.length || 0}`);
  }
  const ann = stmt.annotations[0];
  if (ann.type !== 'example') throw new Error(`Expected type 'example', got '${ann.type}'`);
  if (!String(ann.content || '').includes('Line one') || !String(ann.content || '').includes('Line two')) {
    throw new Error('Expected block content to include both lines');
  }
}

// Test: Annotations after group begin attach to that group
export function testGroupAnnotationAttachment() {
  const cnl = `
Ch1 group begin
#hint: Chapter-wide tone guidance.
Ch1 group end
`;

  const result = parseCNL(cnl);
  const group = (result.ast.groups || []).find(g => g.name === 'Ch1');
  if (!group) throw new Error('Expected group Ch1');
  if (!group.annotations || group.annotations.length !== 1) {
    throw new Error(`Expected 1 group annotation, got ${group.annotations?.length || 0}`);
  }
  if (group.annotations[0].type !== 'hint') {
    throw new Error(`Expected type 'hint', got '${group.annotations[0].type}'`);
  }
}

// Test: Annotations after beat mapping attach to that beat mapping entry
export function testBeatMappingAnnotationAttachment() {
  const cnl = `
Blueprint uses arc heros_journey
Beat ordeal mapped to Ch3.Sc6
#hint: Darkest moment of the story.
`;

  const result = parseCNL(cnl);
  const mapping = (result.ast.blueprint?.beatMappings || []).find(b => b.beatKey === 'ordeal');
  if (!mapping) throw new Error('Expected beat mapping for ordeal');
  if (!mapping.annotations || mapping.annotations.length !== 1) {
    throw new Error(`Expected 1 beat mapping annotation, got ${mapping.annotations?.length || 0}`);
  }
  if (mapping.annotations[0].type !== 'hint') {
    throw new Error(`Expected type 'hint', got '${mapping.annotations[0].type}'`);
  }
}

