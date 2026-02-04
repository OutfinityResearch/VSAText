/**
 * Tests for Services - Explainability
 * 
 * Tests: explainVerification, explainGuardrail, explainEvaluation, explainPlanning, generateExplanation
 */

import {
  generateExplanation,
  explainVerification,
  explainGuardrail,
  explainEvaluation,
  explainPlanning
} from '../../src/services/explainability.mjs';

// Test: explainVerification with passing report
export function testExplainVerificationPass() {
  const report = {
    overall_status: 'pass',
    violations: [],
    summary: { total_checks: 3, passed: 3, failed: 0 }
  };
  
  const explanation = explainVerification(report);
  
  if (explanation.type !== 'verification') {
    throw new Error('Type should be verification');
  }
  if (!explanation.summary.includes('success')) {
    throw new Error('Summary should mention success for passing report');
  }
}

// Test: explainVerification with failing report
export function testExplainVerificationFail() {
  const report = {
    overall_status: 'fail',
    violations: [
      { constraint: 'Story requires "storm"', message: 'Missing required element: storm', severity: 'error' },
      { constraint: 'World forbids "magic"', message: 'Found forbidden content: magic', severity: 'error' }
    ],
    summary: { total_checks: 3, passed: 1, failed: 2 }
  };
  
  const explanation = explainVerification(report);
  
  if (!explanation.summary.includes('violation')) {
    throw new Error('Summary should mention violations');
  }
  if (explanation.evidence.length !== 2) {
    throw new Error(`Expected 2 evidence items, got ${explanation.evidence.length}`);
  }
  if (explanation.suggestions.length === 0) {
    throw new Error('Should provide suggestions for violations');
  }
}

// Test: explainVerification answers specific question
export function testExplainVerificationAnswersQuestion() {
  const report = {
    overall_status: 'fail',
    violations: [{ constraint: 'Story requires "storm"', message: 'Missing required element', severity: 'error' }],
    summary: { total_checks: 2, passed: 1, failed: 1 }
  };
  
  const explanation = explainVerification(report, 'Why did it fail?');
  
  if (!explanation.answer) {
    throw new Error('Should have answer when question is provided');
  }
  if (!explanation.answer.includes('fail')) {
    throw new Error('Answer should explain failure');
  }
}

// Test: explainGuardrail with passing report
export function testExplainGuardrailPass() {
  const report = {
    status: 'pass',
    findings: [],
    summary: { critical: 0, error: 0, warning: 0 }
  };
  
  const explanation = explainGuardrail(report);
  
  if (explanation.type !== 'guardrail') {
    throw new Error('Type should be guardrail');
  }
  if (!explanation.summary.includes('safe') && !explanation.summary.includes('No')) {
    throw new Error('Summary should indicate safe content');
  }
}

// Test: explainGuardrail with failing report
export function testExplainGuardrailFail() {
  const report = {
    status: 'fail',
    findings: [
      { type: 'cliche', match: 'dark and stormy night', severity: 'warning', category: 'originality' },
      { type: 'bias', match: 'stereotype detected', severity: 'error', category: 'fairness', suggestion: 'Revise to avoid stereotypes' }
    ],
    summary: { critical: 0, error: 1, warning: 1 }
  };
  
  const explanation = explainGuardrail(report);
  
  if (!explanation.summary.includes('issue') || !explanation.summary.includes('flag')) {
    throw new Error('Summary should mention flagged issues');
  }
  if (explanation.evidence.length !== 2) {
    throw new Error(`Expected 2 evidence items, got ${explanation.evidence.length}`);
  }
  if (explanation.suggestions.length === 0) {
    throw new Error('Should provide suggestions from findings');
  }
}

// Test: explainEvaluation with scores
export function testExplainEvaluationScores() {
  const report = {
    results: [
      { name: 'coherence', value: 0.85, details: { message: 'Good flow' } },
      { name: 'CAD', value: 0.72, details: { message: 'Character consistency is good' } },
      { name: 'readability', value: 0.45, details: { message: 'Could be simpler' } }
    ]
  };
  
  const explanation = explainEvaluation(report);
  
  if (explanation.type !== 'evaluation') {
    throw new Error('Type should be evaluation');
  }
  if (!explanation.summary.includes('%')) {
    throw new Error('Summary should include percentage score');
  }
  if (explanation.evidence.length !== 3) {
    throw new Error(`Expected 3 evidence items, got ${explanation.evidence.length}`);
  }
  // Low readability score should generate a suggestion
  if (explanation.suggestions.length === 0) {
    throw new Error('Should provide suggestions for low scores');
  }
}

// Test: explainEvaluation answers score question
export function testExplainEvaluationAnswersScoreQuestion() {
  const report = {
    results: [
      { name: 'coherence', value: 0.8 },
      { name: 'CAD', value: 0.7 }
    ]
  };
  
  const explanation = explainEvaluation(report, 'What is the quality score?');
  
  if (!explanation.answer) {
    throw new Error('Should have answer when question is provided');
  }
  if (!explanation.answer.includes('%')) {
    throw new Error('Answer should include percentage scores');
  }
}

// Test: explainPlanning with plan
export function testExplainPlanning() {
  const plan = {
    structure_name: 'Three Act Structure',
    scenes: [{ id: 's1' }, { id: 's2' }, { id: 's3' }],
    plot_graph: { nodes: [{ id: 'n1' }, { id: 'n2' }] },
    arcs: [
      { type: 'character_arc', character: 'Hero', stages: [{ description: 'Hero begins journey' }] },
      { type: 'emotional', pattern: 'fall-rise', datapoints: [{ valence: 0.5 }] }
    ]
  };
  
  const explanation = explainPlanning(plan);
  
  if (explanation.type !== 'planning') {
    throw new Error('Type should be planning');
  }
  if (!explanation.summary.includes('Three Act')) {
    throw new Error('Summary should mention structure name');
  }
  if (!explanation.summary.includes('3 scenes')) {
    throw new Error('Summary should mention scene count');
  }
  if (explanation.evidence.length < 2) {
    throw new Error('Should have evidence for character and emotional arcs');
  }
}

// Test: generateExplanation with verification context
export function testGenerateExplanationWithVerificationContext() {
  const verificationReport = {
    overall_status: 'fail',
    violations: [{ constraint: 'test', message: 'test violation', severity: 'error' }],
    summary: { total_checks: 1, passed: 0, failed: 1 }
  };
  
  const explanation = generateExplanation(
    { id: 'artifact_1', type: 'draft' },
    'Why did it fail?',
    { verificationReport }
  );
  
  if (!explanation.artifact_ref) {
    throw new Error('Should have artifact reference');
  }
  if (!explanation.timestamp) {
    throw new Error('Should have timestamp');
  }
  if (!explanation.explanation) {
    throw new Error('Should have explanation text');
  }
}

// Test: generateExplanation with no context
export function testGenerateExplanationNoContext() {
  const explanation = generateExplanation(
    { id: 'artifact_1' },
    'How does this work?'
  );
  
  if (!explanation.explanation) {
    throw new Error('Should provide generic explanation');
  }
  if (!explanation.reasoning || explanation.reasoning.length === 0) {
    throw new Error('Should provide reasoning');
  }
}

// Test: generateExplanation with 'why' question
export function testGenerateExplanationWhyQuestion() {
  const explanation = generateExplanation(
    { id: 'artifact_1' },
    'Why was this decision made?'
  );
  
  if (!explanation.reasoning.some(r => r.includes('decision') || r.includes('constraint') || r.includes('analyzed'))) {
    throw new Error('Should explain decision-making for why questions');
  }
}

// Test: explainGuardrail with critical findings
export function testExplainGuardrailCritical() {
  const report = {
    status: 'fail',
    findings: [
      { type: 'harmful', match: 'harmful content', severity: 'critical', category: 'safety' }
    ],
    summary: { critical: 1, error: 0, warning: 0 }
  };
  
  const explanation = explainGuardrail(report);
  
  if (!explanation.reasoning.some(r => r.includes('Critical') || r.includes('immediate'))) {
    throw new Error('Should emphasize critical issues require attention');
  }
}
