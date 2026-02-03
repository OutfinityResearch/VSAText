import assert from 'assert';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { validateText } from '../src/cnl/validator.mjs';
import { encodeText, cosine } from '../src/vsa/encoder.mjs';
import { translateNlToCnl } from '../src/services/cnl-translator.mjs';
import { generatePlan } from '../src/services/planning.mjs';
import { verifyAgainstSpec } from '../src/services/verification.mjs';
import { runGuardrailCheck, checkCliches, checkStereotypes } from '../src/services/guardrails.mjs';
import { calculateNQS, calculateCAD, calculateCoherence } from '../src/services/evaluation.mjs';
import { runLiteraryReview } from '../src/services/literary-review.mjs';
import { reverseEngineer } from '../src/services/reverse-engineering.mjs';
import { searchKnowledgeBase } from '../src/services/research.mjs';
import { generateExplanation } from '../src/services/explainability.mjs';
import { addAuditEntry, verifyChain } from '../src/services/audit.mjs';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ===== CNL Tests =====
function testCnlValidator() {
  const valid = 'Anna is protagonist\nAnna has trait courageous';
  const invalid = 'character(anna).';
  const ok = validateText(valid);
  assert.strictEqual(ok.errors.length, 0, 'Valid CNL should have no errors');
  const bad = validateText(invalid);
  assert.ok(bad.errors.length > 0, 'Invalid CNL should have errors');
}

function testCnlRelationshipShorthand() {
  const cnl = [
    'Anna is hero',
    'Gandalf is mentor',
    'Anna mentor_student Gandalf'
  ].join('\n');
  const result = validateText(cnl);
  assert.strictEqual(result.errors.length, 0, 'CNL should be valid');
  const rel = (result.ast.relationships || []).find(r =>
    r.from === 'Anna' && r.to === 'Gandalf' && r.type === 'mentor_student'
  );
  assert.ok(rel, 'Should parse DS10 relationship shorthand into structured relationships');
}

function testCnlTranslator() {
  const nl = 'Anna must stay courageous, and a storm must appear in scene 3.';
  const result = translateNlToCnl(nl);
  assert.ok(result.cnl_text.length > 0, 'Should produce CNL output');
  assert.ok(result.confidence > 0, 'Should have confidence score');
  
  // Verify the CNL is valid
  const validation = validateText(result.cnl_text);
  assert.strictEqual(validation.errors.length, 0, 'Translated CNL should be valid');
}

// ===== VSA Tests =====
function testVsaEncoderDeterministic() {
  const vec1 = encodeText('storm at sea', 128, 42);
  const vec2 = encodeText('storm at sea', 128, 42);
  assert.deepStrictEqual(vec1, vec2, 'Same text should produce same vector');
  
  const vec3 = encodeText('calm harbor', 128, 42);
  const simSame = cosine(vec1, vec2);
  const simDiff = cosine(vec1, vec3);
  assert.ok(simSame >= simDiff, 'Similar text should have higher similarity');
}

// ===== Planning Tests =====
function testPlanningAgent() {
  const spec = {
    id: 'spec_test',
    title: 'Test Story',
    cnl_constraints: 'Anna is protagonist\nAnna has trait courageous\nAnna wants "protect brother"',
    characters: [{ name: 'Anna', traits: ['courageous'], goals: [{ action: 'protect', target: 'brother' }] }]
  };
  
  const plan = generatePlan(spec, { structure: 'three_act', scene_count: 6 });
  
  assert.ok(plan.id.startsWith('plan_'), 'Plan should have valid ID');
  assert.strictEqual(plan.spec_id, spec.id, 'Plan should reference spec');
  assert.ok(plan.scenes.length > 0, 'Plan should have scenes');
  assert.ok(plan.arcs.length > 0, 'Plan should have character arcs');
  assert.ok(plan.plot_graph.nodes.length > 0, 'Plan should have plot graph');
}

// ===== Verification Tests =====
function testVerificationAgent() {
  const spec = {
    id: 'spec_verify',
    cnl_constraints: 'Story requires "storm"\nWorld forbids "magic"'
  };
  
  const goodText = 'The storm raged outside. Anna looked through the window.';
  const badText = 'Anna used magic to solve the problem.';
  
  const goodReport = verifyAgainstSpec(goodText, spec);
  const badReport = verifyAgainstSpec(badText, spec);
  
  assert.strictEqual(goodReport.overall_status, 'pass', 'Good text should pass');
  assert.ok(badReport.violations.length > 0, 'Bad text should have violations');
}

// ===== Guardrails Tests =====
function testGuardrails() {
  const cliches = checkCliches('It was a dark and stormy night.');
  assert.ok(cliches.length > 0, 'Should detect cliché');
  
  const cleanText = 'The evening was mild and quiet.';
  const cleanCliches = checkCliches(cleanText);
  assert.strictEqual(cleanCliches.length, 0, 'Clean text should have no clichés');
  
  const report = runGuardrailCheck('A normal story about people.', { policies: ['bias', 'originality'] });
  assert.ok(report.report_id, 'Report should have ID');
  assert.ok(['pass', 'warn', 'fail', 'reject'].includes(report.status), 'Report should have valid status');
}

// ===== Evaluation Tests =====
function testEvaluationMetrics() {
  const text = `
    Anna was brave and determined. She faced the storm with courage.
    The wind howled but she pressed on. Her brother needed her help.
    Through the darkness, she found her way. The journey was long and hard.
    Finally, she reached the village. Her brother was safe at last.
  `;
  
  const spec = {
    characters: [{ name: 'Anna', traits: ['brave', 'determined', 'courageous'] }]
  };
  
  const coherence = calculateCoherence(text, 500, 42);
  assert.ok(coherence.score >= 0 && coherence.score <= 1, 'Coherence score should be 0-1');
  
  const cad = calculateCAD(text, spec.characters, 100, 500, 42);
  assert.ok(cad.score >= 0 && cad.score <= 1, 'CAD score should be 0-1');
  
  const nqs = calculateNQS(text, spec, { dim: 500, seed: 42 });
  assert.ok(nqs.nqs >= 0 && nqs.nqs <= 1, 'NQS should be 0-1');
  assert.ok(nqs.components, 'NQS should have components');
}

// ===== Literary Review Tests =====
function testLiteraryReview() {
  const text = `
    "Hello," said Anna. "How are you?"
    "I'm fine," said John. "The weather is nice."
    
    The sun was bright and warm. Birds were singing in the trees.
    Anna walked slowly through the garden, feeling peaceful.
  `;
  
  const report = runLiteraryReview(text, { criteria: ['pacing', 'dialogue', 'description'] });
  
  assert.ok(report.report_id, 'Review should have ID');
  assert.ok(report.overall_score >= 0 && report.overall_score <= 1, 'Score should be 0-1');
  assert.ok(report.criteria_scores.pacing, 'Should have pacing score');
  assert.ok(report.criteria_scores.dialogue, 'Should have dialogue score');
}

// ===== Reverse Engineering Tests =====
function testReverseEngineering() {
  const text = `
    Anna was a brave warrior. She lived in a small village by the sea.
    Her brother Marcus needed protection from the raiders.
    
    "I will save you," Anna promised. She picked up her sword.
    The journey would be dangerous but Anna was determined.
    
    She traveled through forests and mountains. The path was treacherous.
    Finally, she found the raiders' camp and confronted their leader.
  `;
  
  const result = reverseEngineer(text, 'spec');
  
  assert.ok(result.spec, 'Should extract spec');
  assert.ok(result.spec.id, 'Spec should have ID');
  assert.ok(result.spec.characters.length > 0, 'Should extract characters');
  
  // Check if Anna was found
  const anna = result.spec.characters.find(c => c.name === 'Anna');
  assert.ok(anna, 'Should find Anna character');
}

// ===== Research Tests =====
function testResearchService() {
  const results = searchKnowledgeBase('storm surge ocean', { top_k: 3 });
  
  assert.ok(results.results.length > 0, 'Should find results');
  assert.ok(results.results[0].relevance_score > 0, 'Results should have relevance scores');
  assert.ok(results.results[0].provenance, 'Results should have provenance');
}

// ===== Audit Tests =====
function testAuditChain() {
  // Clear and add fresh entries
  addAuditEntry('test.event1', 'tester', { data: 'test1' });
  addAuditEntry('test.event2', 'tester', { data: 'test2' });
  addAuditEntry('test.event3', 'tester', { data: 'test3' });
  
  const verification = verifyChain();
  assert.ok(verification.verified > 0, 'Should verify entries');
}

// ===== Explainability Tests =====
function testExplainability() {
  const mockReport = {
    overall_status: 'fail',
    violations: [{ constraint: 'Story requires "storm"', message: 'Missing required element' }],
    summary: { total_checks: 2, passed: 1, failed: 1 }
  };
  
  const explanation = generateExplanation(
    { id: 'test_artifact', type: 'draft' },
    'Why did verification fail?',
    { verificationReport: mockReport }
  );
  
  assert.ok(explanation.explanation.length > 0, 'Should have explanation text');
  assert.ok(explanation.evidence.length > 0, 'Should have evidence');
}

// ===== Eval Examples Tests =====
function testEvalExamplesCnl() {
  const evalPath = path.join(ROOT, 'docs', 'evals', 'scripta_nl_cnl.jsonl');
  if (!fs.existsSync(evalPath)) {
    console.log('Skipping eval examples test - file not found');
    return;
  }
  const lines = fs.readFileSync(evalPath, 'utf-8').trim().split(/\r?\n/);
  let validCount = 0;
  for (const line of lines) {
    const item = JSON.parse(line);
    const { errors } = validateText(item.cnl);
    if (errors.length === 0) validCount++;
  }
  assert.ok(validCount / lines.length >= 0.95, 'At least 95% of eval CNL should be valid');
}

export const tests = [
  testCnlValidator,
  testCnlRelationshipShorthand,
  testCnlTranslator,
  testVsaEncoderDeterministic,
  testPlanningAgent,
  testVerificationAgent,
  testGuardrails,
  testEvaluationMetrics,
  testLiteraryReview,
  testReverseEngineering,
  testResearchService,
  testAuditChain,
  testExplainability,
  testEvalExamplesCnl
];
