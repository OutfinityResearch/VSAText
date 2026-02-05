/**
 * Tests for src/generation/nl-adherence.mjs
 *
 * Tests: roster violations detection for NL output
 */

import { computeSceneRosterViolations } from '../../src/generation/nl-adherence.mjs';

// Test: flags disallowed declared characters and unknown names
export function testRosterViolationsDetectDisallowedAndUnknown() {
  const policy = {
    allowedCharacters: ['Anna'],
    declaredCharacters: ['Anna', 'Bob'],
    declaredEntityNames: ['Anna', 'Bob', 'Forest']
  };

  const text = '### Arrival\\n\\nAnna meets Bob. Later, Xavier appears. Xavier laughs.';
  const v = computeSceneRosterViolations(text, policy);

  if (!v.hasViolations) throw new Error('Expected violations');
  if (!v.disallowedDeclaredCharacters.includes('Bob')) throw new Error('Expected Bob to be disallowed');
  if (!v.unknownNameTokens.some(t => t.toLowerCase() === 'xavier')) {
    throw new Error('Expected Xavier as unknown name');
  }
}

// Test: flags missing allowed characters
export function testRosterViolationsDetectMissingAllowed() {
  const policy = {
    allowedCharacters: ['Anna', 'Bob'],
    declaredCharacters: ['Anna', 'Bob'],
    declaredEntityNames: ['Anna', 'Bob']
  };

  const text = '### Scene\\n\\nAnna waits in silence.';
  const v = computeSceneRosterViolations(text, policy);

  if (!v.missingAllowedCharacters.includes('Bob')) throw new Error('Expected Bob missing');
}

