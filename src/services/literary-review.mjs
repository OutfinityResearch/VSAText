/**
 * Literary Review Service
 * Provides automated editorial feedback and scoring
 */

import { calculateReadability, calculateCoherence } from './evaluation.mjs';
import { checkCliches, checkRepetition } from './guardrails.mjs';

// Review criteria definitions
const REVIEW_CRITERIA = {
  pacing: {
    name: 'Pacing',
    description: 'Flow and rhythm of the narrative',
    weight: 0.2
  },
  dialogue: {
    name: 'Dialogue',
    description: 'Quality and naturalness of character speech',
    weight: 0.15
  },
  description: {
    name: 'Description',
    description: 'Vividness and appropriateness of descriptions',
    weight: 0.15
  },
  structure: {
    name: 'Structure',
    description: 'Organization and logical flow',
    weight: 0.2
  },
  style: {
    name: 'Style',
    description: 'Consistency and effectiveness of writing style',
    weight: 0.15
  },
  originality: {
    name: 'Originality',
    description: 'Freshness of ideas and expression',
    weight: 0.15
  }
};

/**
 * Analyze pacing of text
 */
function analyzePacing(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  
  // Calculate sentence length variance
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
  
  // Good pacing has varied sentence lengths
  const varianceScore = Math.min(1, variance / 100);
  
  // Check for very long paragraphs (pacing issues)
  const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 150).length;
  const paragraphScore = 1 - Math.min(1, longParagraphs / paragraphs.length);
  
  const score = (varianceScore + paragraphScore) / 2;
  
  const findings = [];
  if (variance < 20) {
    findings.push('Sentences are too uniform in length. Vary short and long sentences for better rhythm.');
  }
  if (longParagraphs > 0) {
    findings.push(`${longParagraphs} paragraph(s) are very long. Consider breaking them up.`);
  }
  
  return {
    score,
    findings,
    details: {
      avg_sentence_length: avgLength.toFixed(1),
      sentence_variance: variance.toFixed(1),
      paragraph_count: paragraphs.length,
      long_paragraphs: longParagraphs
    }
  };
}

/**
 * Analyze dialogue quality
 */
function analyzeDialogue(text) {
  // Find dialogue patterns
  const dialogueMatches = text.match(/"[^"]+"/g) || [];
  const dialogueCount = dialogueMatches.length;
  
  // Check for dialogue tags variety
  const saidPattern = /\bsaid\b/gi;
  const saidCount = (text.match(saidPattern) || []).length;
  
  // Check for action beats (non-said dialogue attribution)
  const actionBeatPatterns = /[.!?]"\s+[A-Z][^.!?]*[.!?]/g;
  const actionBeats = (text.match(actionBeatPatterns) || []).length;
  
  const findings = [];
  let score = 0.7; // Base score
  
  if (dialogueCount > 0) {
    const saidRatio = saidCount / dialogueCount;
    if (saidRatio > 0.7) {
      score -= 0.2;
      findings.push('Overuse of "said". Vary dialogue tags or use action beats.');
    }
    if (actionBeats / dialogueCount > 0.3) {
      score += 0.1;
    }
  } else {
    findings.push('No dialogue detected. Consider adding character interactions.');
  }
  
  return {
    score: Math.max(0, Math.min(1, score)),
    findings,
    details: {
      dialogue_count: dialogueCount,
      said_usage: saidCount,
      action_beats: actionBeats
    }
  };
}

/**
 * Analyze descriptive writing
 */
function analyzeDescription(text) {
  // Check for sensory words
  const sensoryWords = {
    visual: ['see', 'saw', 'looked', 'bright', 'dark', 'color', 'shimmer', 'glow', 'shadow'],
    auditory: ['hear', 'heard', 'sound', 'whisper', 'roar', 'silence', 'echo', 'loud', 'quiet'],
    tactile: ['feel', 'felt', 'touch', 'soft', 'hard', 'cold', 'warm', 'smooth', 'rough'],
    olfactory: ['smell', 'scent', 'aroma', 'fragrance', 'stench', 'odor'],
    gustatory: ['taste', 'sweet', 'bitter', 'sour', 'salty', 'flavor']
  };
  
  const lowerText = text.toLowerCase();
  const sensoryCounts = {};
  let totalSensory = 0;
  
  for (const [sense, words] of Object.entries(sensoryWords)) {
    const count = words.reduce((sum, word) => {
      return sum + (lowerText.match(new RegExp(`\\b${word}`, 'g')) || []).length;
    }, 0);
    sensoryCounts[sense] = count;
    totalSensory += count;
  }
  
  const wordCount = text.split(/\s+/).length;
  const sensoryDensity = totalSensory / wordCount;
  
  // Score based on sensory variety and density
  const varietyScore = Object.values(sensoryCounts).filter(c => c > 0).length / 5;
  const densityScore = Math.min(1, sensoryDensity * 50);
  const score = (varietyScore + densityScore) / 2;
  
  const findings = [];
  const missingSenses = Object.entries(sensoryCounts)
    .filter(([_, count]) => count === 0)
    .map(([sense]) => sense);
  
  if (missingSenses.length > 2) {
    findings.push(`Consider adding ${missingSenses.join(', ')} details for richer description.`);
  }
  if (sensoryDensity < 0.005) {
    findings.push('Description feels sparse. Add more sensory details.');
  }
  
  return {
    score,
    findings,
    details: {
      sensory_counts: sensoryCounts,
      sensory_density: (sensoryDensity * 100).toFixed(2) + '%'
    }
  };
}

/**
 * Analyze originality
 */
function analyzeOriginality(text) {
  const cliches = checkCliches(text);
  const repetitions = checkRepetition(text, 5, 3);
  
  // Score based on absence of clichés and repetition
  const clicheScore = Math.max(0, 1 - cliches.length * 0.1);
  const repetitionScore = Math.max(0, 1 - repetitions.length * 0.05);
  const score = (clicheScore + repetitionScore) / 2;
  
  const findings = [];
  if (cliches.length > 0) {
    findings.push(`Found ${cliches.length} cliché(s). Consider more original phrasing.`);
    findings.push(...cliches.slice(0, 3).map(c => `  - "${c.match}"`));
  }
  if (repetitions.length > 3) {
    findings.push(`Excessive phrase repetition detected. Vary your language.`);
  }
  
  return {
    score,
    findings,
    details: {
      cliche_count: cliches.length,
      repetition_count: repetitions.length
    }
  };
}

/**
 * Run full literary review
 */
function runLiteraryReview(text, options = {}) {
  const criteria = options.criteria || Object.keys(REVIEW_CRITERIA);
  
  const report = {
    report_id: `review_${Date.now()}`,
    reviewed_at: new Date().toISOString(),
    overall_score: 0,
    findings: [],
    suggestions: [],
    criteria_scores: {}
  };
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const criterion of criteria) {
    let result;
    
    switch (criterion) {
      case 'pacing':
        result = analyzePacing(text);
        break;
      case 'dialogue':
        result = analyzeDialogue(text);
        break;
      case 'description':
        result = analyzeDescription(text);
        break;
      case 'structure':
        result = calculateCoherence(text);
        break;
      case 'style':
        result = calculateReadability(text);
        break;
      case 'originality':
        result = analyzeOriginality(text);
        break;
      default:
        continue;
    }
    
    const criterionDef = REVIEW_CRITERIA[criterion] || { name: criterion, weight: 0.1 };
    
    report.criteria_scores[criterion] = {
      name: criterionDef.name,
      score: result.score,
      weight: criterionDef.weight,
      details: result.details,
      findings: result.findings || []
    };
    
    weightedSum += result.score * criterionDef.weight;
    totalWeight += criterionDef.weight;
    
    // Collect findings
    if (result.findings) {
      report.findings.push(...result.findings.map(f => ({
        criterion: criterionDef.name,
        message: f
      })));
    }
  }
  
  report.overall_score = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  // Generate suggestions based on lowest scores
  const sortedCriteria = Object.entries(report.criteria_scores)
    .sort((a, b) => a[1].score - b[1].score);
  
  for (const [criterion, data] of sortedCriteria.slice(0, 3)) {
    if (data.score < 0.6) {
      report.suggestions.push({
        criterion: data.name,
        priority: data.score < 0.4 ? 'high' : 'medium',
        suggestion: generateSuggestion(criterion, data)
      });
    }
  }
  
  return report;
}

/**
 * Generate improvement suggestion for a criterion
 */
function generateSuggestion(criterion, data) {
  const suggestions = {
    pacing: 'Vary sentence lengths and break up long paragraphs to improve rhythm.',
    dialogue: 'Use diverse dialogue tags and action beats. Show character through speech.',
    description: 'Engage multiple senses in your descriptions for immersive scenes.',
    structure: 'Strengthen transitions between sections. Ensure logical cause-and-effect.',
    style: 'Adjust sentence complexity for your target audience. Aim for clarity.',
    originality: 'Replace clichés with fresh metaphors. Reduce phrase repetition.'
  };
  
  return suggestions[criterion] || 'Review and revise this aspect of your writing.';
}

export {
  runLiteraryReview,
  analyzePacing,
  analyzeDialogue,
  analyzeDescription,
  analyzeOriginality,
  REVIEW_CRITERIA
};
