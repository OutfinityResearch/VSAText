/**
 * SCRIPTA SDK - Evaluation: CNL Metrics
 *
 * Computes structural and completeness/coherence metrics from a parsed CNL AST.
 */

import { parseLine } from '../cnl-parser/cnl-parser.mjs';

/**
 * Calculate completeness score.
 */
export function calculateCompleteness(counts) {
  const hasChars = counts.characters >= 2 ? 1 : counts.characters / 2;
  const hasLocs = counts.locations >= 2 ? 1 : counts.locations / 2;
  const hasStructure = counts.scenes >= 3 ? 1 : counts.scenes / 3;
  const hasThemes = counts.themes >= 1 ? 1 : 0;
  const hasDialogues = counts.dialogues >= 2 ? 1 : counts.dialogues / 2;
  const hasRels = counts.relationships >= 2 ? 1 : counts.relationships / 2;
  
  const score = (
    hasChars * 0.20 + 
    hasLocs * 0.15 + 
    hasStructure * 0.25 + 
    hasThemes * 0.10 + 
    hasDialogues * 0.15 +
    hasRels * 0.15
  );
  
  return {
    score,
    components: {
      characters: { value: hasChars, required: 2, actual: counts.characters },
      locations: { value: hasLocs, required: 2, actual: counts.locations },
      scenes: { value: hasStructure, required: 3, actual: counts.scenes },
      themes: { value: hasThemes, required: 1, actual: counts.themes },
      dialogues: { value: hasDialogues, required: 2, actual: counts.dialogues },
      relationships: { value: hasRels, required: 2, actual: counts.relationships }
    },
    threshold: 0.80,
    passed: score >= 0.80
  };
}

/**
 * Calculate coherence metrics (entity usage, relationships, etc.).
 */
export function calculateCoherenceMetrics(ast, entities, refs, counts) {
  // Entity usage ratio
  const totalEntities = counts.characters + counts.locations;
  const totalRefs = refs.characters + refs.locations;
  const entityUsageRatio = totalEntities > 0 
    ? Math.min(1, totalRefs / (totalEntities * Math.max(1, counts.scenes) * 0.3)) 
    : 0;
  
  // Relationship coverage
  const expectedRels = Math.max(1, counts.characters - 1);
  const relCoverage = counts.relationships >= expectedRels ? 1 : counts.relationships / expectedRels;
  
  // Block usage
  const expectedBlocks = Math.max(1, counts.scenes * 0.5);
  const blockUsage = counts.blocks >= expectedBlocks ? 1 : counts.blocks / expectedBlocks;
  
  const score = entityUsageRatio * 0.4 + relCoverage * 0.3 + blockUsage * 0.3;
  
  return {
    score,
    components: {
      entityUsage: { value: entityUsageRatio, weight: 0.4 },
      relationshipCoverage: { value: relCoverage, weight: 0.3 },
      blockUsage: { value: blockUsage, weight: 0.3 }
    },
    threshold: 0.75,
    passed: score >= 0.75
  };
}

/**
 * Calculate character trait consistency.
 */
export function calculateCharacterDrift(entities) {
  const characters = entities.characters || [];
  const traitCounts = characters.map(c => (c.traits || []).length);
  const avgTraits = traitCounts.length > 0 
    ? traitCounts.reduce((a, b) => a + b, 0) / traitCounts.length 
    : 0;
  
  // Lower drift is better
  const drift = avgTraits >= 3 ? 0.05 : avgTraits >= 2 ? 0.10 : avgTraits >= 1 ? 0.15 : 0.25;
  
  return {
    drift,
    score: 1 - Math.min(1, drift * 4), // Convert to 0-1 where higher is better
    avgTraitsPerCharacter: avgTraits,
    threshold: 0.15,
    passed: drift <= 0.15,
    details: characters.map(c => ({
      name: c.name,
      archetype: c.archetype,
      traitCount: (c.traits || []).length,
      traits: c.traits || []
    }))
  };
}

/**
 * Calculate originality index.
 */
export function calculateOriginality(ast, entities, counts) {
  const uniqueBlocks = new Set();
  const uniqueActions = new Set();

  const metaVerbs = new Set(['is', 'has', 'group', 'includes', 'requires', 'forbids', 'must', 'owns', 'relates', 'references', 'describes']);

  function collectFromStatements(statements) {
    for (const stmt of statements || []) {
      if (!stmt || !stmt.verb) continue;

      // Block types are referenced via: "<Scope> includes block <blockKey>"
      if (stmt.verb === 'includes' && Array.isArray(stmt.objects) && stmt.objects.length >= 2) {
        const refType = String(stmt.objects[0]).toLowerCase();
        if (refType === 'block') uniqueBlocks.add(String(stmt.objects[1]).toLowerCase());
      }

      // Action variety is the set of distinct verbs used in narrative statements.
      if (!metaVerbs.has(stmt.verb)) uniqueActions.add(stmt.verb);
    }
  }

  (function walkGroups(groups) {
    for (const g of groups || []) {
      collectFromStatements(g.statements);
      if (Array.isArray(g.children) && g.children.length > 0) walkGroups(g.children);
    }
  })(ast.groups || []);

  collectFromStatements(ast.statements);

  const blockVariety = uniqueBlocks.size / Math.max(1, 10);
  const actionVariety = uniqueActions.size / Math.max(1, 15);
  const themeVariety = counts.themes >= 2 ? 1 : counts.themes * 0.5;
  
  const score = Math.min(1, blockVariety * 0.4 + actionVariety * 0.3 + themeVariety * 0.3);
  
  return {
    score,
    components: {
      blockVariety: { value: blockVariety, uniqueCount: uniqueBlocks.size },
      actionVariety: { value: actionVariety, uniqueCount: uniqueActions.size },
      themeVariety: { value: themeVariety, themeCount: counts.themes }
    },
    threshold: 0.50,
    passed: score >= 0.50
  };
}

/**
 * Calculate explainability score.
 */
export function calculateExplainability(entities, arcName) {
  let score = 0;
  const components = {};
  
  if (arcName) { score += 0.15; components.arc = true; }
  if ((entities.themes || []).length > 0) { score += 0.15; components.themes = true; }
  if ((entities.relationships || []).length > 0) { score += 0.15; components.relationships = true; }
  if ((entities.world_rules || []).length > 0) { score += 0.15; components.worldRules = true; }
  if ((entities.moods || []).length >= 3) { score += 0.15; components.emotionalArc = true; }
  if ((entities.wisdom || []).length > 0) { score += 0.15; components.wisdom = true; }
  if ((entities.patterns || []).length > 0) { score += 0.10; components.patterns = true; }
  
  return {
    score: score,
    rating: score * 5, // 0-5 scale
    components,
    threshold: 0.70,
    passed: score >= 0.70
  };
}

/**
 * Calculate CNL parse success rate.
 */
export function calculateParseSuccess(cnl, parseResult) {
  const rawLines = cnl.split(/\r?\n/);
  const parseErrorLines = new Set((parseResult.errors || []).map(e => e.line).filter(n => Number.isFinite(n)));

  let totalLines = 0;
  let validLines = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const lineNo = i + 1;
    const line = rawLines[i];
    const stripped = line.trim();
    if (!stripped || stripped.startsWith('//') || stripped.startsWith('#')) continue;

    totalLines++;

    // A line counts as valid if parseLine succeeds and it isn't flagged by parseCNL structural errors.
    const { statement, error } = parseLine(line, lineNo);
    const ok = !error && !!statement && !parseErrorLines.has(lineNo);
    if (ok) validLines++;
  }

  const score = totalLines > 0 ? validLines / totalLines : 0;

  return {
    score,
    totalLines,
    validLines,
    parseErrors: parseResult.errors || [],
    threshold: 0.90,
    passed: score >= 0.90
  };
}

/**
 * Calculate character continuity (do characters appear in multiple scenes?).
 */
export function calculateCharacterContinuity(ast, entities) {
  const characters = entities.characters || [];
  if (characters.length === 0) return { score: 0, message: 'No characters defined' };
  
  // Count appearances per character from group statements
  const appearances = {};
  characters.forEach(c => appearances[c.name?.toLowerCase()] = 0);
  
  function countInGroups(groups, depth = 0) {
    if (!groups) return;
    for (const g of groups) {
      // Only count in scenes (depth 2)
      if (depth >= 2 && g.statements) {
        for (const stmt of g.statements) {
          const refType = String(stmt.objects?.[0] || '').toLowerCase();
          if (stmt.verb === 'includes' && refType === 'character') {
            const charName = String(stmt.objects?.[1] || '').toLowerCase();
            if (charName && appearances[charName] !== undefined) {
              appearances[charName]++;
            }
          }
        }
      }
      if (g.children) countInGroups(g.children, depth + 1);
    }
  }
  countInGroups(ast.groups);
  
  const multipleAppearances = Object.values(appearances).filter(c => c >= 2).length;
  const anyAppearances = Object.values(appearances).filter(c => c >= 1).length;
  
  // Score based on characters appearing at least once, bonus for multiple
  const baseScore = anyAppearances / characters.length;
  const multiBonus = multipleAppearances / characters.length * 0.5;
  const score = Math.min(1, baseScore * 0.7 + multiBonus);
  
  return {
    score,
    characterAppearances: appearances,
    charactersInMultipleScenes: multipleAppearances,
    totalCharacters: characters.length,
    threshold: 0.60,
    passed: score >= 0.60
  };
}

/**
 * Calculate location logic (are locations reused?).
 */
export function calculateLocationLogic(ast, entities) {
  const locations = entities.locations || [];
  if (locations.length === 0) return { score: 0, message: 'No locations defined' };
  
  const appearances = {};
  locations.forEach(l => appearances[l.name?.toLowerCase()] = 0);
  
  function countInGroups(groups, depth = 0) {
    if (!groups) return;
    for (const g of groups) {
      if (depth >= 2 && g.statements) {
        for (const stmt of g.statements) {
          const refType = String(stmt.objects?.[0] || '').toLowerCase();
          if (stmt.verb === 'includes' && refType === 'location') {
            const locName = String(stmt.objects?.[1] || '').toLowerCase();
            if (locName && appearances[locName] !== undefined) {
              appearances[locName]++;
            }
          }
        }
      }
      if (g.children) countInGroups(g.children, depth + 1);
    }
  }
  countInGroups(ast.groups);
  
  const reused = Object.values(appearances).filter(c => c >= 2).length;
  const used = Object.values(appearances).filter(c => c >= 1).length;
  
  // Score based on locations used, bonus for reuse
  const baseScore = used / locations.length;
  const reuseBonus = reused / locations.length * 0.5;
  const score = Math.min(1, baseScore * 0.7 + reuseBonus);
  
  return {
    score,
    locationAppearances: appearances,
    locationsReused: reused,
    totalLocations: locations.length,
    threshold: 0.50,
    passed: score >= 0.50
  };
}

/**
 * Calculate scene completeness (each scene has character + location + action).
 */
export function calculateSceneCompleteness(ast) {
  let total = 0;
  let complete = 0;
  
  function checkGroups(groups, depth = 0) {
    if (!groups) return;
    for (const g of groups) {
      // Scenes are at depth 2
      if (depth === 2) {
        total++;
        const stmts = g.statements || [];
        const hasChar = stmts.some(s => s.verb === 'includes' && String(s.objects?.[0] || '').toLowerCase() === 'character');
        const hasLoc = stmts.some(s => s.verb === 'includes' && String(s.objects?.[0] || '').toLowerCase() === 'location');
        const hasAction = stmts.some(s => s.verb && !['is', 'has', 'group', 'includes'].includes(s.verb));
        
        if (hasChar && hasLoc) {
          // Consider complete if has char + loc (action is bonus)
          complete += hasAction ? 1 : 0.7;
        } else if (hasChar || hasLoc) {
          complete += 0.3;
        }
      }
      if (g.children) checkGroups(g.children, depth + 1);
    }
  }
  checkGroups(ast.groups);
  
  const score = total > 0 ? complete / total : 0;
  
  return {
    score,
    completeScenes: complete,
    totalScenes: total,
    threshold: 0.70,
    passed: score >= 0.70
  };
}

/**
 * Calculate composite NQS from all metrics.
 */
export function calculateNarrativeQualityScore(metrics) {
  const weights = {
    completeness: 0.12,
    coherence: 0.12,
    characterDrift: 0.08,
    originality: 0.08,
    explainability: 0.08,
    parseSuccess: 0.08,
    characterContinuity: 0.12,
    locationLogic: 0.08,
    sceneCompleteness: 0.12,
    // Reserved for text-based metrics when prose is available
    textCoherence: 0.06,
    readability: 0.06
  };
  
  let score = 0;
  score += (metrics.completeness?.score || 0) * weights.completeness;
  score += (metrics.coherence?.score || 0) * weights.coherence;
  score += (metrics.characterDrift?.score || 0) * weights.characterDrift;
  score += (metrics.originality?.score || 0) * weights.originality;
  score += (metrics.explainability?.score || 0) * weights.explainability;
  score += (metrics.parseSuccess?.score || 0) * weights.parseSuccess;
  score += (metrics.characterContinuity?.score || 0) * weights.characterContinuity;
  score += (metrics.locationLogic?.score || 0) * weights.locationLogic;
  score += (metrics.sceneCompleteness?.score || 0) * weights.sceneCompleteness;
  
  // Text-based metrics (if prose provided)
  if (metrics.textCoherence) {
    score += (metrics.textCoherence?.score || 0) * weights.textCoherence;
  }
  if (metrics.readability) {
    score += (metrics.readability?.score || 0) * weights.readability;
  }
  
  return {
    score,
    weights,
    threshold: 0.70,
    passed: score >= 0.70,
    interpretation: score >= 0.85 ? 'Excellent' :
                    score >= 0.70 ? 'Good' :
                    score >= 0.50 ? 'Fair' :
                    score >= 0.30 ? 'Poor' : 'Critical'
  };
}

export default {
  calculateCompleteness,
  calculateCoherenceMetrics,
  calculateCharacterDrift,
  calculateOriginality,
  calculateExplainability,
  calculateParseSuccess,
  calculateCharacterContinuity,
  calculateLocationLogic,
  calculateSceneCompleteness,
  calculateNarrativeQualityScore
};

