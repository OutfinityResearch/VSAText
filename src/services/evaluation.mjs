/**
 * Evaluation Metrics Service
 * Computes NQS, CAD, coherence, and other narrative quality metrics
 */

import { encodeText, cosine } from '../vsa/encoder.mjs';
import { parseCnlToConstraints } from './cnl-translator.mjs';

/**
 * Calculate Character Attribute Drift (CAD)
 * Measures how much character traits drift from their specification across text
 */
function calculateCAD(text, characters, windowSize = 1000, dim = 1000, seed = 42) {
  if (!characters || characters.length === 0) {
    return { score: 0, details: [], message: 'No characters to evaluate' };
  }
  
  const results = [];
  const words = text.split(/\s+/);
  const windowCount = Math.max(1, Math.floor(words.length / windowSize));
  
  for (const char of characters) {
    if (!char.traits || char.traits.length === 0) continue;
    
    // Create baseline vector from character traits
    const baselineText = `${char.name} is ${char.traits.join(' and ')}`;
    const baselineVector = encodeText(baselineText, dim, seed);
    
    const windowScores = [];
    
    // Check each window
    for (let i = 0; i < windowCount; i++) {
      const start = i * windowSize;
      const end = Math.min(start + windowSize, words.length);
      const windowText = words.slice(start, end).join(' ');
      
      // Find sentences mentioning this character
      const sentences = windowText.split(/[.!?]+/).filter(s => 
        s.toLowerCase().includes(char.name.toLowerCase())
      );
      
      if (sentences.length > 0) {
        const contextVector = encodeText(sentences.join(' '), dim, seed);
        const similarity = cosine(baselineVector, contextVector);
        windowScores.push({
          window: i + 1,
          start_word: start,
          similarity
        });
      }
    }
    
    // Calculate drift as variance in similarity scores
    if (windowScores.length > 1) {
      const avgSimilarity = windowScores.reduce((s, w) => s + w.similarity, 0) / windowScores.length;
      const variance = windowScores.reduce((s, w) => s + Math.pow(w.similarity - avgSimilarity, 2), 0) / windowScores.length;
      const drift = Math.sqrt(variance);
      
      results.push({
        character: char.name,
        average_consistency: avgSimilarity,
        drift: drift,
        windows_analyzed: windowScores.length,
        window_scores: windowScores
      });
    }
  }
  
  // Calculate overall CAD
  const overallDrift = results.length > 0
    ? results.reduce((s, r) => s + r.drift, 0) / results.length
    : 0;
  
  return {
    score: 1 - Math.min(1, overallDrift * 2), // Convert drift to 0-1 score where 1 is best
    drift: overallDrift,
    details: results,
    message: overallDrift < 0.1 
      ? 'Excellent character consistency'
      : overallDrift < 0.2 
        ? 'Good character consistency with minor drift'
        : 'Significant character drift detected'
  };
}

/**
 * Calculate Coherence Score
 * Measures narrative coherence using entity-based coreference and semantic similarity
 */
function calculateCoherence(text, dim = 1000, seed = 42) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length < 2) {
    return { score: 1.0, details: [], message: 'Text too short for coherence analysis' };
  }
  
  const windowSize = 3; // Compare in sliding windows
  const similarities = [];
  
  for (let i = 0; i < sentences.length - windowSize; i++) {
    const window1 = sentences.slice(i, i + windowSize).join(' ');
    const window2 = sentences.slice(i + 1, i + 1 + windowSize).join(' ');
    
    const vec1 = encodeText(window1, dim, seed);
    const vec2 = encodeText(window2, dim, seed);
    
    similarities.push({
      position: i,
      similarity: cosine(vec1, vec2)
    });
  }
  
  // Calculate average similarity and find drops
  const avgSimilarity = similarities.reduce((s, x) => s + x.similarity, 0) / similarities.length;
  const coherenceDrops = similarities.filter(s => s.similarity < avgSimilarity - 0.2);
  
  // Calculate overall coherence score
  const score = Math.max(0, Math.min(1, avgSimilarity + 0.2));
  
  return {
    score,
    average_similarity: avgSimilarity,
    coherence_drops: coherenceDrops.length,
    details: similarities,
    message: score > 0.7 
      ? 'Strong narrative coherence'
      : score > 0.5 
        ? 'Moderate coherence with some gaps'
        : 'Weak coherence, consider revising transitions'
  };
}

/**
 * Calculate readability metrics
 */
function calculateReadability(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const syllables = countSyllables(text);
  
  if (words.length === 0 || sentences.length === 0) {
    return { score: 0, details: {}, message: 'Insufficient text for analysis' };
  }
  
  // Flesch-Kincaid Grade Level
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;
  const fleschKincaid = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  
  // Flesch Reading Ease (0-100, higher is easier)
  const fleschEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  
  // Normalize to 0-1 score (based on ease)
  const score = Math.max(0, Math.min(1, fleschEase / 100));
  
  return {
    score,
    details: {
      word_count: words.length,
      sentence_count: sentences.length,
      syllable_count: syllables,
      avg_words_per_sentence: avgWordsPerSentence.toFixed(1),
      avg_syllables_per_word: avgSyllablesPerWord.toFixed(2),
      flesch_kincaid_grade: Math.max(0, fleschKincaid).toFixed(1),
      flesch_reading_ease: Math.max(0, fleschEase).toFixed(1)
    },
    message: fleschEase >= 60 
      ? 'Easy to read'
      : fleschEase >= 30 
        ? 'Moderately difficult'
        : 'Difficult to read'
  };
}

/**
 * Count syllables in text (heuristic)
 */
function countSyllables(text) {
  const words = text.toLowerCase().split(/\s+/);
  let count = 0;
  
  for (const word of words) {
    const cleaned = word.replace(/[^a-z]/g, '');
    if (cleaned.length <= 3) {
      count += 1;
    } else {
      // Count vowel groups
      const vowelGroups = cleaned.match(/[aeiouy]+/g) || [];
      count += Math.max(1, vowelGroups.length);
      // Subtract silent e
      if (cleaned.endsWith('e') && vowelGroups.length > 1) {
        count -= 1;
      }
    }
  }
  
  return count;
}

/**
 * Calculate Emotional Arc Profile similarity
 */
function calculateEmotionalArcMatch(text, targetArc = 'fall_rise', dim = 500, seed = 42) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length < 5) {
    return { score: 0.5, details: [], message: 'Text too short for arc analysis' };
  }
  
  // Emotion keywords for simple sentiment analysis
  const positive = ['happy', 'joy', 'hope', 'love', 'bright', 'success', 'win', 'triumph', 'peace', 'warm'];
  const negative = ['sad', 'fear', 'dark', 'loss', 'fail', 'pain', 'death', 'cold', 'angry', 'hate'];
  
  const arcPoints = [];
  const chunkSize = Math.ceil(sentences.length / 10);
  
  for (let i = 0; i < 10; i++) {
    const chunk = sentences.slice(i * chunkSize, (i + 1) * chunkSize).join(' ').toLowerCase();
    
    let posCount = 0;
    let negCount = 0;
    
    for (const word of positive) {
      posCount += (chunk.match(new RegExp(word, 'g')) || []).length;
    }
    for (const word of negative) {
      negCount += (chunk.match(new RegExp(word, 'g')) || []).length;
    }
    
    const valence = (posCount - negCount) / Math.max(1, posCount + negCount);
    arcPoints.push({
      position: i / 9,
      valence: (valence + 1) / 2 // Normalize to 0-1
    });
  }
  
  // Compare to target arc pattern
  const arcPatterns = {
    fall_rise: [0.6, 0.5, 0.4, 0.35, 0.3, 0.25, 0.35, 0.5, 0.7, 0.8],
    rise_fall: [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.6, 0.4, 0.3, 0.2],
    steady_rise: [0.2, 0.3, 0.35, 0.4, 0.5, 0.55, 0.6, 0.7, 0.75, 0.8],
    steady_fall: [0.8, 0.75, 0.7, 0.6, 0.55, 0.5, 0.4, 0.35, 0.3, 0.2]
  };
  
  const pattern = arcPatterns[targetArc] || arcPatterns.fall_rise;
  
  // Calculate match score (inverse of mean absolute error)
  let totalError = 0;
  for (let i = 0; i < 10; i++) {
    totalError += Math.abs(arcPoints[i].valence - pattern[i]);
  }
  const score = Math.max(0, 1 - totalError / 10);
  
  return {
    score,
    target_arc: targetArc,
    measured_arc: arcPoints,
    message: score > 0.7 
      ? `Arc closely matches ${targetArc} pattern`
      : score > 0.4 
        ? `Arc partially matches ${targetArc} pattern`
        : `Arc differs from ${targetArc} pattern`
  };
}

/**
 * Calculate Narrative Quality Score (NQS) - composite metric
 */
function calculateNQS(text, spec, options = {}) {
  const dim = options.dim || 1000;
  const seed = options.seed || 42;
  
  // Extract characters from spec
  const characters = spec.characters || [];
  
  // Calculate component metrics
  const coherence = calculateCoherence(text, dim, seed);
  const readability = calculateReadability(text);
  const cad = calculateCAD(text, characters, 1000, dim, seed);
  const emotionalArc = calculateEmotionalArcMatch(text, options.targetArc || 'fall_rise', dim, seed);
  
  // Weights for composite score
  const weights = {
    coherence: 0.35,
    readability: 0.20,
    character_consistency: 0.25,
    emotional_arc: 0.20
  };
  
  // Calculate weighted composite
  const composite = 
    coherence.score * weights.coherence +
    readability.score * weights.readability +
    cad.score * weights.character_consistency +
    emotionalArc.score * weights.emotional_arc;
  
  return {
    nqs: composite,
    components: {
      coherence: { score: coherence.score, weight: weights.coherence, details: coherence },
      readability: { score: readability.score, weight: weights.readability, details: readability },
      character_consistency: { score: cad.score, weight: weights.character_consistency, details: cad },
      emotional_arc: { score: emotionalArc.score, weight: weights.emotional_arc, details: emotionalArc }
    },
    message: composite > 0.8 
      ? 'Excellent narrative quality'
      : composite > 0.6 
        ? 'Good narrative quality'
        : composite > 0.4 
          ? 'Moderate narrative quality, consider improvements'
          : 'Narrative quality needs significant improvement'
  };
}

/**
 * Calculate Compliance Adherence Rate (CAR)
 */
function calculateCAR(verificationReport) {
  if (!verificationReport || !verificationReport.summary) {
    return { score: 1.0, message: 'No verification data available' };
  }
  
  const { total_checks, passed, skipped } = verificationReport.summary;
  const effectiveChecks = total_checks - skipped;
  
  if (effectiveChecks === 0) {
    return { score: 1.0, message: 'No constraints to verify' };
  }
  
  const score = passed / effectiveChecks;
  
  return {
    score,
    passed,
    total: effectiveChecks,
    message: score >= 0.999 
      ? 'Full compliance'
      : score >= 0.95 
        ? 'High compliance'
        : score >= 0.8 
          ? 'Moderate compliance, some violations detected'
          : 'Low compliance, multiple violations'
  };
}

/**
 * Run full evaluation
 */
function runEvaluation(text, spec, options = {}) {
  const metrics = options.metrics || ['nqs', 'coherence', 'readability', 'cad'];
  const results = {
    report_id: `eval_${Date.now()}`,
    evaluated_at: new Date().toISOString(),
    results: []
  };
  
  for (const metric of metrics) {
    let result;
    
    switch (metric) {
      case 'nqs':
        result = calculateNQS(text, spec, options);
        results.results.push({ name: 'NQS', value: result.nqs, details: result });
        break;
      case 'coherence':
        result = calculateCoherence(text, options.dim, options.seed);
        results.results.push({ name: 'Coherence', value: result.score, details: result });
        break;
      case 'readability':
        result = calculateReadability(text);
        results.results.push({ name: 'Readability', value: result.score, details: result });
        break;
      case 'cad':
        result = calculateCAD(text, spec.characters || [], 1000, options.dim, options.seed);
        results.results.push({ name: 'CAD', value: result.score, details: result });
        break;
      case 'emotional_arc':
        result = calculateEmotionalArcMatch(text, options.targetArc, options.dim, options.seed);
        results.results.push({ name: 'Emotional Arc', value: result.score, details: result });
        break;
      default:
        results.results.push({ name: metric, value: 0, details: { message: 'Unknown metric' } });
    }
  }
  
  return results;
}

export {
  calculateNQS,
  calculateCAD,
  calculateCoherence,
  calculateReadability,
  calculateEmotionalArcMatch,
  calculateCAR,
  runEvaluation
};
