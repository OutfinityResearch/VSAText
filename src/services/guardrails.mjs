/**
 * Guardrails Service
 * Checks for bias, clichés, plagiarism, and policy violations
 */

import { encodeText, cosine } from '../vsa/encoder.mjs';

// Known clichés and overused phrases
const CLICHES = [
  'it was a dark and stormy night',
  'once upon a time',
  'the best of times',
  'the worst of times',
  'little did they know',
  'suddenly everything changed',
  'in the nick of time',
  'all hell broke loose',
  'at the end of the day',
  'a sight for sore eyes',
  'dead as a doornail',
  'the calm before the storm',
  'time stood still',
  'their eyes met across the room',
  'love at first sight',
  'a blood-curdling scream',
  'with bated breath',
  'a diamond in the rough',
  'leave no stone unturned',
  'the writing on the wall',
  'a blessing in disguise',
  'when all is said and done',
  'burning the midnight oil',
  'read between the lines',
  'the tip of the iceberg',
  'thinking outside the box',
  'at the crack of dawn',
  'scared out of their wits',
  'crystal clear',
  'easier said than done'
];

// Stereotypical patterns to detect
const STEREOTYPE_PATTERNS = [
  { pattern: /\b(dumb|stupid)\s+(blonde|jock)/gi, category: 'appearance' },
  { pattern: /\b(angry|aggressive)\s+black\s+(man|woman|person)/gi, category: 'race' },
  { pattern: /\b(lazy|drunk)\s+(mexican|irish)/gi, category: 'ethnicity' },
  { pattern: /\b(terrorist|extremist)\s+(arab|muslim)/gi, category: 'religion' },
  { pattern: /\b(submissive|docile)\s+asian\s+(woman|girl)/gi, category: 'gender-ethnicity' },
  { pattern: /\b(emotional|hysterical)\s+woman/gi, category: 'gender' },
  { pattern: /\b(nerdy|antisocial)\s+(programmer|developer|engineer)/gi, category: 'profession' },
  { pattern: /\b(greedy|stingy)\s+(jew|jewish)/gi, category: 'religion' },
  { pattern: /\bwomen\s+(can't|cannot)\s+(drive|math|science)/gi, category: 'gender' },
  { pattern: /\bmen\s+(don't|cannot)\s+(cry|feel|emotions)/gi, category: 'gender' },
  { pattern: /\bold\s+people\s+(are|always)\s+(confused|senile|slow)/gi, category: 'age' },
  { pattern: /\byoung\s+people\s+(are|always)\s+(lazy|entitled|naive)/gi, category: 'age' }
];

// Potentially harmful content patterns
const HARMFUL_PATTERNS = [
  { pattern: /\b(kill|murder|assassinate)\s+(yourself|himself|herself|themselves)/gi, category: 'self-harm' },
  { pattern: /\bhow\s+to\s+(make|build)\s+(bomb|explosive|weapon)/gi, category: 'violence' },
  { pattern: /\b(hate|death\s+to)\s+(jews|muslims|christians|blacks|whites|asians)/gi, category: 'hate-speech' }
];

// PII patterns
const PII_PATTERNS = [
  { pattern: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+\d{3}-\d{2}-\d{4}\b/g, type: 'ssn', severity: 'critical' },
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: 'ssn', severity: 'critical' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: 'email', severity: 'error' },
  { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, type: 'credit-card', severity: 'critical' },
  { pattern: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, type: 'phone', severity: 'error' }
];

/**
 * Check for clichés in text
 */
function checkCliches(text) {
  const findings = [];
  const lowerText = text.toLowerCase();
  
  for (const cliche of CLICHES) {
    if (lowerText.includes(cliche)) {
      findings.push({
        type: 'cliche',
        match: cliche,
        severity: 'warning',
        suggestion: 'Consider using more original phrasing'
      });
    }
  }
  
  return findings;
}

/**
 * Check for stereotypes
 */
function checkStereotypes(text) {
  const findings = [];
  
  for (const { pattern, category } of STEREOTYPE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        findings.push({
          type: 'stereotype',
          category,
          match,
          severity: 'error',
          suggestion: 'Avoid stereotypical characterizations'
        });
      }
    }
  }
  
  return findings;
}

/**
 * Check for harmful content
 */
function checkHarmfulContent(text) {
  const findings = [];
  
  for (const { pattern, category } of HARMFUL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        findings.push({
          type: 'harmful-content',
          category,
          match,
          severity: 'critical',
          suggestion: 'Content may be harmful or dangerous'
        });
      }
    }
  }
  
  return findings;
}

/**
 * Check for PII
 */
function checkPII(text) {
  const findings = [];
  
  for (const { pattern, type, severity } of PII_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        findings.push({
          type: 'pii',
          pii_type: type,
          match: match.slice(0, 4) + '****', // Partially redact
          severity,
          suggestion: 'Remove or redact personally identifiable information'
        });
      }
    }
  }
  
  return findings;
}

/**
 * Check originality against reference corpus using VSA
 */
function checkOriginality(text, referenceTexts = [], threshold = 0.85, dim = 1000, seed = 42) {
  const findings = [];
  const textVector = encodeText(text, dim, seed);
  
  for (const ref of referenceTexts) {
    const refVector = encodeText(ref.text, dim, seed);
    const similarity = cosine(textVector, refVector);
    
    if (similarity > threshold) {
      findings.push({
        type: 'similarity',
        reference: ref.id || 'unknown',
        similarity: similarity,
        severity: similarity > 0.95 ? 'critical' : 'warning',
        suggestion: 'High similarity with reference text detected'
      });
    }
  }
  
  return findings;
}

/**
 * Check repetition within text
 */
function checkRepetition(text, minPhraseLength = 4, minRepetitions = 2) {
  const findings = [];
  const words = text.toLowerCase().split(/\s+/);
  const phrases = new Map();
  
  // Extract n-grams
  for (let i = 0; i <= words.length - minPhraseLength; i++) {
    const phrase = words.slice(i, i + minPhraseLength).join(' ');
    phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
  }
  
  // Find repeated phrases
  for (const [phrase, count] of phrases) {
    if (count >= minRepetitions && !isCommonPhrase(phrase)) {
      findings.push({
        type: 'repetition',
        phrase,
        count,
        severity: 'info',
        suggestion: 'Consider varying your language'
      });
    }
  }
  
  return findings.slice(0, 10); // Limit to top 10
}

/**
 * Check if phrase is commonly repeated (articles, prepositions, etc.)
 */
function isCommonPhrase(phrase) {
  const common = [
    'in the', 'of the', 'to the', 'and the', 'on the', 'at the',
    'it is', 'there is', 'there are', 'this is', 'that is',
    'he was', 'she was', 'they were', 'i was', 'we were'
  ];
  
  for (const c of common) {
    if (phrase.startsWith(c)) return true;
  }
  
  return false;
}

/**
 * Apply guardrail policies
 */
function applyPolicies(text, policies = []) {
  const findings = [];
  
  for (const policy of policies) {
    switch (policy) {
      case 'bias':
        findings.push(...checkStereotypes(text));
        break;
      case 'originality':
        findings.push(...checkCliches(text));
        break;
      case 'pii':
        findings.push(...checkPII(text));
        break;
      case 'harmful':
        findings.push(...checkHarmfulContent(text));
        break;
      case 'repetition':
        findings.push(...checkRepetition(text));
        break;
      default:
        // Unknown policy, skip
    }
  }
  
  return findings;
}

/**
 * Main guardrail check function
 */
function runGuardrailCheck(text, options = {}) {
  const policies = options.policies || ['bias', 'originality', 'pii', 'harmful', 'repetition'];
  const referenceTexts = options.references || [];
  
  const report = {
    report_id: `guard_${Date.now()}`,
    checked_at: new Date().toISOString(),
    status: 'pass',
    findings: [],
    summary: {
      critical: 0,
      error: 0,
      warning: 0,
      info: 0
    }
  };
  
  // Run all checks
  const allFindings = [
    ...applyPolicies(text, policies),
    ...checkOriginality(text, referenceTexts)
  ];
  
  report.findings = allFindings;
  
  // Categorize by severity
  for (const finding of allFindings) {
    switch (finding.severity) {
      case 'critical':
        report.summary.critical++;
        break;
      case 'error':
        report.summary.error++;
        break;
      case 'warning':
        report.summary.warning++;
        break;
      default:
        report.summary.info++;
    }
  }
  
  // Determine overall status
  if (report.summary.critical > 0) {
    report.status = 'reject';
  } else if (report.summary.error > 0) {
    report.status = 'fail';
  } else if (report.summary.warning > 0) {
    report.status = 'warn';
  }
  
  return report;
}

export {
  runGuardrailCheck,
  checkCliches,
  checkStereotypes,
  checkHarmfulContent,
  checkPII,
  checkOriginality,
  checkRepetition,
  CLICHES,
  STEREOTYPE_PATTERNS
};
