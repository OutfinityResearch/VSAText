/**
 * Tests for Verification Service
 * 
 * Tests: Constraint checking, spec compliance
 */

import { verifyAgainstSpec, checkMustInclude, checkForbidden } from '../../src/services/verification.mjs';

// Test: Good text passes verification
export function testGoodTextPasses() {
  const spec = {
    id: 'spec_verify',
    cnl_constraints: 'Story requires "storm"\nWorld forbids "magic"'
  };
  
  const text = 'The storm raged outside. Anna looked through the window.';
  const report = verifyAgainstSpec(text, spec);
  
  if (report.overall_status !== 'pass') {
    throw new Error('Text with required element should pass');
  }
}

// Test: Text with forbidden element fails
export function testForbiddenElementFails() {
  const spec = {
    id: 'spec_verify',
    cnl_constraints: 'World forbids "magic"'
  };
  
  const text = 'Anna used magic to solve the problem.';
  const report = verifyAgainstSpec(text, spec);
  
  if (report.violations.length === 0) {
    throw new Error('Text with forbidden element should have violations');
  }
}

// Test: Missing required element is detected
export function testMissingRequiredElement() {
  const spec = {
    id: 'spec_verify',
    cnl_constraints: 'Story requires "dragon"'
  };
  
  const text = 'Anna walked through the forest. Birds were singing.';
  const report = verifyAgainstSpec(text, spec);
  
  if (report.violations.length === 0) {
    throw new Error('Missing required element should create violation');
  }
}

// Test: checkMustInclude helper works
export function testCheckMustInclude() {
  const result1 = checkMustInclude('The hero saved the day.', 'hero');
  const result2 = checkMustInclude('The villain lost.', 'hero');
  
  if (!result1) {
    throw new Error('Should find "hero" in text');
  }
  if (result2) {
    throw new Error('Should not find "hero" in text about villain');
  }
}

// Test: checkForbidden helper works
// Note: checkForbidden returns TRUE when text does NOT contain the forbidden element
export function testCheckForbidden() {
  const result1 = checkForbidden('A magical spell was cast.', 'magic');
  const result2 = checkForbidden('The hero used technology.', 'magic');
  
  // result1 should be FALSE because "magic" is present (forbidden element found)
  if (result1) {
    throw new Error('Should return false when forbidden element is present');
  }
  // result2 should be TRUE because "magic" is NOT present (no violation)
  if (!result2) {
    throw new Error('Should return true when forbidden element is absent');
  }
}
