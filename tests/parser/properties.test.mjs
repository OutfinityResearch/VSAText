/**
 * Tests for CNL Parser - Properties
 *
 * Tests: multi-valued properties and mood emotion parsing.
 */

import { parseCNL } from '../../src/cnl-parser/cnl-parser.mjs';

// Test: Multi-valued properties (e.g., characteristic) do not overwrite
export function testMultiValuedPropertiesAccumulate() {
  const cnl = `
Village is location
Village has characteristic rural
Village has characteristic isolated
`;

  const result = parseCNL(cnl);
  const props = result.ast.entities?.Village?.properties || {};
  const chars = props.characteristic;

  if (!Array.isArray(chars) || chars.length !== 2) {
    throw new Error(`Expected 2 characteristics, got ${Array.isArray(chars) ? chars.length : typeof chars}`);
  }
  if (chars[0] !== 'rural' || chars[1] !== 'isolated') {
    throw new Error(`Unexpected characteristic values: ${JSON.stringify(chars)}`);
  }
}

// Test: World rule details like implication/exception are repeatable
export function testWorldRuleMultiValuedDetails() {
  const cnl = `
R1 is world_rule
R1 has implication "Healers must choose who to save"
R1 has implication "Power creates moral debt"
`;

  const result = parseCNL(cnl);
  const props = result.ast.entities?.R1?.properties || {};
  const implications = props.implication;

  if (!Array.isArray(implications) || implications.length !== 2) {
    throw new Error(`Expected 2 implications, got ${Array.isArray(implications) ? implications.length : typeof implications}`);
  }
}

// Test: Mood emotions parse into a structured emotions map (canonical + legacy)
export function testMoodEmotionParsing() {
  const cnl = `
M1 is mood
M1 has emotion fear 2
M1 has emotion tension intensity 3
`;

  const result = parseCNL(cnl);
  const mood = result.ast.entities?.M1;
  const emotions = mood?.properties?.emotions;

  if (!emotions || typeof emotions !== 'object') {
    throw new Error('Expected mood.properties.emotions object');
  }
  if (emotions.fear !== 2) throw new Error(`Expected fear=2, got ${emotions.fear}`);
  if (emotions.tension !== 3) throw new Error(`Expected tension=3, got ${emotions.tension}`);
}

// Test: Repeated emotion keeps the strongest intensity
export function testMoodEmotionMaxIntensityWins() {
  const cnl = `
M1 is mood
M1 has emotion fear 1
M1 has emotion fear 3
`;

  const result = parseCNL(cnl);
  const emotions = result.ast.entities?.M1?.properties?.emotions || {};

  if (emotions.fear !== 3) {
    throw new Error(`Expected fear=3, got ${emotions.fear}`);
  }
}

