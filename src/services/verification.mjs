/**
 * Verification Agent Service v2.0
 * 
 * Checks generated content against CNL constraints and spec requirements.
 * Uses unified SVO CNL parser.
 */

import { parseCNL, extractConstraints, extractEntities } from '../cnl/validator.mjs';
import { encodeText, cosine } from '../vsa/encoder.mjs';

/**
 * Check if text contains a required element
 */
function checkMustInclude(text, requirement) {
  const lowerText = text.toLowerCase();
  const lowerReq = requirement.toLowerCase();
  return lowerText.includes(lowerReq);
}

/**
 * Check if text contains a forbidden element
 */
function checkForbidden(text, forbidden) {
  const lowerText = text.toLowerCase();
  const lowerForbid = forbidden.toLowerCase();
  return !lowerText.includes(lowerForbid);
}

/**
 * Check character trait consistency using VSA
 */
function checkCharacterConsistency(text, characterName, expectedTraits, dim = 1000, seed = 42) {
  const sentences = text.split(/[.!?]+/).filter(s => 
    s.toLowerCase().includes(characterName.toLowerCase())
  );
  
  if (sentences.length === 0) {
    return { consistent: true, score: 1.0, message: 'Character not mentioned' };
  }
  
  const contextText = sentences.join(' ');
  const contextVector = encodeText(contextText, dim, seed);
  const traitsText = expectedTraits.join(' ');
  const traitsVector = encodeText(traitsText, dim, seed);
  const similarity = cosine(contextVector, traitsVector);
  
  return {
    consistent: similarity > 0.3,
    score: similarity,
    message: similarity > 0.3 
      ? `Character traits appear consistent (score: ${similarity.toFixed(3)})`
      : `Potential character drift detected (score: ${similarity.toFixed(3)})`
  };
}

/**
 * Get words associated with a tone
 */
function getToneWords(tone) {
  const toneMap = {
    hopeful: ['hope', 'bright', 'future', 'better', 'light', 'promise', 'optimistic'],
    melancholic: ['sad', 'sorrow', 'loss', 'grief', 'longing', 'wistful', 'regret'],
    determination: ['resolve', 'determined', 'unwavering', 'strong', 'push', 'overcome'],
    neutral: ['stated', 'according', 'research', 'data', 'analysis', 'evidence'],
    grounded: ['real', 'practical', 'everyday', 'simple', 'ordinary', 'mundane'],
    dark: ['shadow', 'fear', 'danger', 'threat', 'ominous', 'dread'],
    light: ['joy', 'happy', 'bright', 'sunny', 'cheerful', 'warm'],
    mysterious: ['unknown', 'secret', 'hidden', 'strange', 'enigma', 'puzzle'],
    tense: ['tension', 'pressure', 'urgent', 'critical', 'desperate', 'intense']
  };
  
  return toneMap[tone.toLowerCase()] || [tone];
}

/**
 * Verify text against AST constraints
 */
function verifyAgainstAST(text, ast, options = {}) {
  const results = [];
  const constraints = ast.constraints || {};
  
  // Check requires constraints
  for (const req of constraints.requires || []) {
    const passed = checkMustInclude(text, req.target);
    results.push({
      type: 'requires',
      subject: req.subject,
      target: req.target,
      status: passed ? 'pass' : 'fail',
      message: passed 
        ? `Text includes required element: "${req.target}"`
        : `Missing required element: "${req.target}"`,
      severity: passed ? 'info' : 'error',
      line: req.line
    });
  }
  
  // Check forbids constraints
  for (const forbid of constraints.forbids || []) {
    const passed = checkForbidden(text, forbid.target);
    results.push({
      type: 'forbids',
      subject: forbid.subject,
      target: forbid.target,
      status: passed ? 'pass' : 'fail',
      message: passed
        ? `Text correctly avoids: "${forbid.target}"`
        : `Text contains forbidden element: "${forbid.target}"`,
      severity: passed ? 'info' : 'error',
      line: forbid.line
    });
  }
  
  // Check must constraints
  for (const must of constraints.must || []) {
    // For "must introduce X" - check if X appears
    const target = must.target;
    let passed = false;
    
    if (must.action === 'introduce' || must.action === 'include') {
      passed = checkMustInclude(text, target);
    } else if (must.action === 'resolve') {
      // For "must resolve" - check for resolution-related words near the target
      const resolutionWords = ['resolved', 'solved', 'ended', 'concluded', 'settled'];
      passed = resolutionWords.some(w => text.toLowerCase().includes(w)) && 
               text.toLowerCase().includes(target.toLowerCase());
    } else {
      passed = checkMustInclude(text, target);
    }
    
    results.push({
      type: 'must',
      subject: must.subject,
      action: must.action,
      target: must.target,
      status: passed ? 'pass' : 'fail',
      message: passed
        ? `Constraint satisfied: ${must.subject} ${must.action} ${must.target}`
        : `Constraint violated: ${must.subject} must ${must.action} ${must.target}`,
      severity: passed ? 'info' : 'error',
      line: must.line
    });
  }
  
  // Check tone constraints
  for (const tone of constraints.tone || []) {
    const toneWords = getToneWords(tone.value);
    const matches = toneWords.filter(w => text.toLowerCase().includes(w)).length;
    const passed = matches >= Math.ceil(toneWords.length * 0.2);
    
    results.push({
      type: 'tone',
      subject: tone.subject,
      value: tone.value,
      status: passed ? 'pass' : 'warn',
      message: passed
        ? `Tone appears to match: ${tone.value} (${matches}/${toneWords.length} indicators)`
        : `Tone may not match expected: ${tone.value} (${matches}/${toneWords.length} indicators)`,
      severity: passed ? 'info' : 'warning',
      line: tone.line
    });
  }
  
  // Check entity presence
  const entities = extractEntities(ast);
  for (const char of entities.characters) {
    const mentioned = text.toLowerCase().includes(char.name.toLowerCase());
    results.push({
      type: 'entity_presence',
      subject: char.name,
      entityType: 'character',
      status: mentioned ? 'pass' : 'warn',
      message: mentioned
        ? `Character "${char.name}" is present in text`
        : `Character "${char.name}" not found in text`,
      severity: mentioned ? 'info' : 'warning'
    });
    
    // Check trait consistency if character is mentioned
    if (mentioned && char.traits.length > 0) {
      const traitCheck = checkCharacterConsistency(text, char.name, char.traits);
      results.push({
        type: 'trait_consistency',
        subject: char.name,
        traits: char.traits,
        status: traitCheck.consistent ? 'pass' : 'warn',
        message: traitCheck.message,
        severity: traitCheck.consistent ? 'info' : 'warning',
        score: traitCheck.score
      });
    }
  }
  
  return results;
}

/**
 * Main verification function
 */
function verifyAgainstSpec(text, spec, options = {}) {
  const report = {
    report_id: `verify_${Date.now()}`,
    spec_id: spec.id,
    verified_at: new Date().toISOString(),
    overall_status: 'pass',
    checks: [],
    violations: [],
    summary: {
      total_checks: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      skipped: 0
    }
  };
  
  // Parse CNL constraints using unified parser
  let ast = { entities: {}, constraints: { requires: [], forbids: [], must: [], tone: [], max: [], min: [] } };
  
  if (spec.cnl_constraints) {
    const parseResult = parseCNL(spec.cnl_constraints);
    if (parseResult.valid) {
      ast = parseResult.ast;
    } else {
      report.parse_errors = parseResult.errors;
    }
  }
  
  // If spec has a pre-parsed AST, use it
  if (spec.ast) {
    ast = spec.ast;
  }
  
  // Verify against AST
  const checks = verifyAgainstAST(text, ast, options);
  
  for (const check of checks) {
    report.checks.push(check);
    report.summary.total_checks++;
    
    switch (check.status) {
      case 'pass':
        report.summary.passed++;
        break;
      case 'fail':
        report.summary.failed++;
        report.violations.push({
          type: check.type,
          subject: check.subject,
          target: check.target,
          message: check.message,
          severity: check.severity
        });
        break;
      case 'warn':
        report.summary.warnings++;
        break;
      case 'skip':
        report.summary.skipped++;
        break;
    }
  }
  
  // Determine overall status
  if (report.summary.failed > 0) {
    report.overall_status = 'fail';
  } else if (report.summary.warnings > 0) {
    report.overall_status = 'warn';
  }
  
  // Calculate compliance rate (CSA - Constraint Satisfaction Accuracy)
  const totalChecked = report.summary.total_checks - report.summary.skipped;
  report.compliance_rate = totalChecked > 0 
    ? report.summary.passed / totalChecked 
    : 1.0;
  
  // CSA metric
  report.csa = report.compliance_rate;
  
  return report;
}

/**
 * Quick coherence check between two text segments
 */
function checkCoherence(textA, textB, dim = 1000, seed = 42) {
  const vecA = encodeText(textA, dim, seed);
  const vecB = encodeText(textB, dim, seed);
  const similarity = cosine(vecA, vecB);
  
  return {
    similarity,
    coherent: similarity > 0.4,
    message: similarity > 0.4
      ? `Texts appear coherent (similarity: ${similarity.toFixed(3)})`
      : `Low coherence detected (similarity: ${similarity.toFixed(3)})`
  };
}

/**
 * Verify CNL text directly
 */
function verifyCnl(cnlText, draftText, options = {}) {
  const parseResult = parseCNL(cnlText);
  
  if (!parseResult.valid) {
    return {
      valid: false,
      errors: parseResult.errors,
      checks: [],
      csa: 0
    };
  }
  
  return verifyAgainstSpec(draftText, { ast: parseResult.ast }, options);
}

export {
  verifyAgainstSpec,
  verifyAgainstAST,
  verifyCnl,
  checkCoherence,
  checkCharacterConsistency,
  checkMustInclude,
  checkForbidden
};
