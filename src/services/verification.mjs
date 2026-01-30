/**
 * Verification Agent Service
 * Checks generated content against CNL constraints and spec requirements
 */

import { parseCnlToConstraints } from './cnl-translator.mjs';
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
  // Extract sentences mentioning the character
  const sentences = text.split(/[.!?]+/).filter(s => 
    s.toLowerCase().includes(characterName.toLowerCase())
  );
  
  if (sentences.length === 0) {
    return { consistent: true, score: 1.0, message: 'Character not mentioned' };
  }
  
  // Encode character context
  const contextText = sentences.join(' ');
  const contextVector = encodeText(contextText, dim, seed);
  
  // Encode expected traits
  const traitsText = expectedTraits.join(' ');
  const traitsVector = encodeText(traitsText, dim, seed);
  
  // Calculate similarity
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
 * Verify text against a single constraint
 */
function verifyConstraint(text, constraint, context = {}) {
  const result = {
    constraint: constraint.raw,
    type: constraint.type,
    status: 'pass',
    message: '',
    severity: 'info'
  };
  
  switch (constraint.type) {
    case 'RULE': {
      const [subject, action, value] = constraint.args;
      
      if (action === 'must_include') {
        const passed = checkMustInclude(text, value);
        result.status = passed ? 'pass' : 'fail';
        result.message = passed 
          ? `Text includes required element: "${value}"`
          : `Missing required element: "${value}"`;
        result.severity = passed ? 'info' : 'error';
      }
      else if (action === 'forbid') {
        const passed = checkForbidden(text, value);
        result.status = passed ? 'pass' : 'fail';
        result.message = passed
          ? `Text correctly avoids: "${value}"`
          : `Text contains forbidden element: "${value}"`;
        result.severity = passed ? 'info' : 'error';
      }
      else if (action === 'tone') {
        // Heuristic tone check
        const toneWords = getToneWords(value);
        const matches = toneWords.filter(w => text.toLowerCase().includes(w)).length;
        const passed = matches >= Math.ceil(toneWords.length * 0.2);
        result.status = passed ? 'pass' : 'warn';
        result.message = passed
          ? `Tone appears to match: ${value}`
          : `Tone may not match expected: ${value}`;
        result.severity = passed ? 'info' : 'warning';
      }
      else {
        result.status = 'skip';
        result.message = `Unknown rule action: ${action}`;
      }
      break;
    }
    
    case 'CHARACTER': {
      const charName = constraint.args[0];
      const mentioned = text.toLowerCase().includes(charName.toLowerCase());
      result.status = mentioned ? 'pass' : 'warn';
      result.message = mentioned
        ? `Character "${charName}" is present in text`
        : `Character "${charName}" not found in text`;
      result.severity = mentioned ? 'info' : 'warning';
      break;
    }
    
    case 'TRAIT': {
      const [charName, trait] = constraint.args;
      if (context.characters && context.characters[charName]) {
        const check = checkCharacterConsistency(
          text, 
          charName, 
          [trait, ...context.characters[charName].traits || []]
        );
        result.status = check.consistent ? 'pass' : 'warn';
        result.message = check.message;
        result.severity = check.consistent ? 'info' : 'warning';
        result.score = check.score;
      } else {
        result.status = 'skip';
        result.message = 'Character context not available for trait verification';
      }
      break;
    }
    
    case 'GOAL': {
      const [charName, action, target] = constraint.args;
      const goalPhrase = `${action} ${target}`.toLowerCase();
      const mentioned = text.toLowerCase().includes(goalPhrase) ||
                       (text.toLowerCase().includes(action) && 
                        text.toLowerCase().includes(target));
      result.status = mentioned ? 'pass' : 'warn';
      result.message = mentioned
        ? `Goal "${action} ${target}" appears in text`
        : `Goal "${action} ${target}" not evident in text`;
      result.severity = mentioned ? 'info' : 'warning';
      break;
    }
    
    case 'GUARDRAIL': {
      // Guardrails are checked separately
      result.status = 'skip';
      result.message = 'Guardrails checked by guardrail service';
      break;
    }
    
    case 'FORMAT': {
      const [docType, formatType, count] = constraint.args;
      if (formatType === 'steps' || formatType === 'bullets') {
        const bulletPatterns = /^[\s]*[-*\d.)\]]+\s+/gm;
        const matches = text.match(bulletPatterns) || [];
        const expected = parseInt(count);
        const passed = matches.length >= expected;
        result.status = passed ? 'pass' : 'fail';
        result.message = passed
          ? `Found ${matches.length} list items (expected: ${expected})`
          : `Only ${matches.length} list items found (expected: ${expected})`;
        result.severity = passed ? 'info' : 'error';
      } else {
        result.status = 'skip';
        result.message = `Unknown format type: ${formatType}`;
      }
      break;
    }
    
    default:
      result.status = 'skip';
      result.message = `Unknown constraint type: ${constraint.type}`;
  }
  
  return result;
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
    light: ['joy', 'happy', 'bright', 'sunny', 'cheerful', 'warm']
  };
  
  return toneMap[tone.toLowerCase()] || [tone];
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
  
  // Parse CNL constraints
  let constraints = [];
  if (spec.cnl_constraints) {
    const parsed = parseCnlToConstraints(spec.cnl_constraints);
    constraints = parsed.constraints;
  }
  
  // Add constraints from spec.constraints if present
  if (spec.constraints && Array.isArray(spec.constraints)) {
    for (const c of spec.constraints) {
      if (typeof c === 'string') {
        constraints.push({ type: 'RULE', args: ['Document', 'must_include', c], raw: c });
      }
    }
  }
  
  // Build character context
  const characterContext = {};
  if (spec.characters) {
    for (const char of spec.characters) {
      characterContext[char.name] = char;
    }
  }
  
  // Verify each constraint
  for (const constraint of constraints) {
    const check = verifyConstraint(text, constraint, { characters: characterContext });
    report.checks.push(check);
    report.summary.total_checks++;
    
    switch (check.status) {
      case 'pass':
        report.summary.passed++;
        break;
      case 'fail':
        report.summary.failed++;
        report.violations.push({
          constraint: check.constraint,
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
  
  // Calculate compliance rate
  const totalChecked = report.summary.total_checks - report.summary.skipped;
  report.compliance_rate = totalChecked > 0 
    ? report.summary.passed / totalChecked 
    : 1.0;
  
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

export {
  verifyAgainstSpec,
  verifyConstraint,
  checkCoherence,
  checkCharacterConsistency
};
