/**
 * Tests for Services - Planning, Translation, etc.
 * 
 * Tests: Planning agent, CNL translator, literary review
 */

import { generatePlan } from '../../src/services/planning.mjs';
import { translateNlToCnl } from '../../src/services/cnl-translator.mjs';
import { runLiteraryReview } from '../../src/services/literary-review.mjs';
import { reverseEngineer } from '../../src/services/reverse-engineering.mjs';
import { validateText } from '../../src/cnl/validator.mjs';

// Test: generatePlan creates valid plan
export function testGeneratePlan() {
  const spec = {
    id: 'spec_test',
    title: 'Test Story',
    cnl_constraints: 'Anna is protagonist\nAnna has trait courageous',
    characters: [{ name: 'Anna', traits: ['courageous'], goals: [{ action: 'protect', target: 'brother' }] }]
  };
  
  const plan = generatePlan(spec, { structure: 'three_act', scene_count: 6 });
  
  if (!plan.id.startsWith('plan_')) {
    throw new Error('Plan should have valid ID');
  }
  if (plan.spec_id !== spec.id) {
    throw new Error('Plan should reference spec');
  }
  if (plan.scenes.length === 0) {
    throw new Error('Plan should have scenes');
  }
}

// Test: translateNlToCnl produces valid CNL
export function testTranslateNlToCnl() {
  const nl = 'Anna must stay courageous, and a storm must appear.';
  const result = translateNlToCnl(nl);
  
  if (result.cnl_text.length === 0) {
    throw new Error('Should produce CNL output');
  }
  if (result.confidence <= 0) {
    throw new Error('Should have confidence score');
  }
  
  // Verify the CNL is valid
  const validation = validateText(result.cnl_text);
  if (validation.errors.length !== 0) {
    throw new Error('Translated CNL should be valid');
  }
}

// Test: runLiteraryReview returns scores
export function testLiteraryReview() {
  const text = `
    "Hello," said Anna. "How are you?"
    "I'm fine," said John. "The weather is nice."
    
    The sun was bright and warm. Birds were singing in the trees.
  `;
  
  const report = runLiteraryReview(text, { criteria: ['pacing', 'dialogue', 'description'] });
  
  if (!report.report_id) {
    throw new Error('Review should have ID');
  }
  if (report.overall_score < 0 || report.overall_score > 1) {
    throw new Error('Score should be 0-1');
  }
}

// Test: reverseEngineer extracts characters
export function testReverseEngineer() {
  const text = `
    Anna was a brave warrior. She lived in a small village.
    Her brother Marcus needed protection from the raiders.
  `;
  
  const result = reverseEngineer(text, 'spec');
  
  if (!result.spec) {
    throw new Error('Should extract spec');
  }
  if (result.spec.characters.length === 0) {
    throw new Error('Should extract characters');
  }
  
  const anna = result.spec.characters.find(c => c.name === 'Anna');
  if (!anna) {
    throw new Error('Should find Anna character');
  }
}
