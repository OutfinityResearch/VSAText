/**
 * Tests for CNL Parser - Constraints
 * 
 * Tests: requires, forbids, must constraints
 */

import { parseCNL } from '../../src/cnl-parser/cnl-parser.mjs';

// Test: Requires constraint is parsed
export function testRequiresConstraint() {
  const cnl = 'Story requires happy_ending';
  const result = parseCNL(cnl);
  
  if (result.ast.constraints.requires.length !== 1) {
    throw new Error('Expected 1 requires constraint');
  }
  if (!result.ast.constraints.requires[0].target.includes('happy_ending')) {
    throw new Error('Expected target to include happy_ending');
  }
}

// Test: Forbids constraint is parsed
export function testForbidsConstraint() {
  const cnl = 'Story forbids graphic_violence';
  const result = parseCNL(cnl);
  
  if (result.ast.constraints.forbids.length !== 1) {
    throw new Error('Expected 1 forbids constraint');
  }
}

// Test: Multiple constraints
export function testMultipleConstraints() {
  const cnl = `
Story requires heroic_sacrifice
Story requires redemption
Story forbids death_of_children
Story forbids torture
`;
  
  const result = parseCNL(cnl);
  
  if (result.ast.constraints.requires.length !== 2) {
    throw new Error('Expected 2 requires constraints');
  }
  if (result.ast.constraints.forbids.length !== 2) {
    throw new Error('Expected 2 forbids constraints');
  }
}

// Test: Scoped constraints in groups
export function testScopedConstraints() {
  const cnl = `
Ch1 group begin
  Ch1 requires action_scene
Ch1 group end
`;
  
  const result = parseCNL(cnl);
  const req = result.ast.constraints.requires[0];
  
  if (req.scope !== 'Ch1') {
    throw new Error(`Expected scope 'Ch1', got '${req.scope}'`);
  }
}
