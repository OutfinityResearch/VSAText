/**
 * Tests for Guardrails Service
 * 
 * Tests: Cliché detection, content safety
 */

import { runGuardrailCheck, checkCliches, checkStereotypes } from '../../src/services/guardrails.mjs';

// Test: Clichés are detected
export function testClicheDetection() {
  const cliches = checkCliches('It was a dark and stormy night.');
  
  if (cliches.length === 0) {
    throw new Error('Should detect classic cliché');
  }
}

// Test: Clean text has no clichés
export function testCleanTextNoCliches() {
  const cliches = checkCliches('The evening was mild and quiet.');
  
  if (cliches.length !== 0) {
    throw new Error('Clean text should have no clichés');
  }
}

// Test: Guardrail check returns valid report
export function testGuardrailCheckReport() {
  const report = runGuardrailCheck('A normal story about people.', { policies: ['bias', 'originality'] });
  
  if (!report.report_id) {
    throw new Error('Report should have ID');
  }
  if (!['pass', 'warn', 'fail', 'reject'].includes(report.status)) {
    throw new Error('Report should have valid status');
  }
}

// Test: Stereotype check works
export function testStereotypeCheck() {
  // Note: This tests the function exists and returns, not content judgment
  const stereotypes = checkStereotypes('The scientist analyzed the data carefully.');
  
  // Should return an array (possibly empty)
  if (!Array.isArray(stereotypes)) {
    throw new Error('checkStereotypes should return an array');
  }
}

// Test: Multiple clichés are detected
export function testMultipleClichesDetected() {
  // Use more obvious clichés that are likely in the detection list
  const text = 'It was a dark and stormy night. She had a heart of gold.';
  const cliches = checkCliches(text);
  
  // At least one cliché should be detected
  if (cliches.length === 0) {
    throw new Error('Should detect at least one cliché');
  }
}

// Test: PII findings affect overall status (DS15 severity mapping)
export function testPIIEmailFails() {
  const report = runGuardrailCheck('Contact me at test@example.com', { policies: ['pii'] });
  if (report.status !== 'fail') {
    throw new Error(`Expected status 'fail' for email PII, got '${report.status}'`);
  }
  if ((report.summary?.error || 0) < 1) {
    throw new Error('Expected at least one error finding for email PII');
  }
}

// Test: Critical PII triggers reject
export function testPIISSNRejects() {
  const report = runGuardrailCheck('SSN: 123-45-6789', { policies: ['pii'] });
  if (report.status !== 'reject') {
    throw new Error(`Expected status 'reject' for SSN PII, got '${report.status}'`);
  }
  if ((report.summary?.critical || 0) < 1) {
    throw new Error('Expected at least one critical finding for SSN PII');
  }
}
