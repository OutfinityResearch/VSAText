/**
 * SCRIPTA SDK - Unified Evaluation Entrypoint
 * 
 * Single entrypoint for evaluating a CNL specification.
 * Parses CNL, extracts entities, and runs all available metrics.
 * 
 * Usage:
 *   import { evaluateCNL } from './src/evaluate.mjs';
 *   const result = evaluateCNL(cnlText);
 */

import { parseCNL } from './cnl-parser/cnl-parser.mjs';
import { 
  calculateNQS, 
  calculateCAD, 
  calculateCoherence, 
  calculateReadability,
  calculateEmotionalArcMatch 
} from './services/evaluation.mjs';
import { verifyAgainstAST } from './services/verification.mjs';
import { runGuardrailCheck } from './services/guardrails.mjs';

/**
 * Extract entities from parsed AST into structured format
 */
function extractEntitiesFromAST(rawEntities, ast) {
  const entities = {
    characters: [],
    locations: [],
    objects: [],
    moods: [],
    themes: [],
    relationships: [],
    world_rules: [],
    dialogues: [],
    wisdom: [],
    patterns: []
  };
  
  // Process raw entities from parser
  for (const [name, entity] of Object.entries(rawEntities)) {
    const type = entity.type || (entity.types && entity.types[0]) || 'unknown';
    
    // Characters - identified by archetype types
    const characterTypes = ['hero', 'mentor', 'shadow', 'ally', 'trickster', 'guardian', 
                           'shapeshifter', 'herald', 'character', 'protagonist', 'antagonist'];
    if (characterTypes.includes(type.toLowerCase())) {
      entities.characters.push({
        name: entity.name,
        archetype: type,
        traits: entity.traits || [],
        id: name
      });
    }
    // Locations
    else if (type.toLowerCase() === 'location' || type.toLowerCase() === 'place') {
      entities.locations.push({
        name: entity.name,
        geography: entity.properties?.geography,
        id: name
      });
    }
    // Objects
    else if (type.toLowerCase() === 'object' || type.toLowerCase() === 'item') {
      entities.objects.push({
        name: entity.name,
        objectType: type,
        id: name
      });
    }
    // Moods
    else if (type.toLowerCase() === 'mood') {
      entities.moods.push({
        name: entity.name,
        emotions: entity.properties || {},
        id: name
      });
    }
  }
  
  // Extract themes from statements
  if (ast.statements) {
    for (const stmt of ast.statements) {
      if (stmt.subject === 'Story' && stmt.verb === 'has' && 
          stmt.objects && stmt.objects[0] === 'theme') {
        entities.themes.push({
          name: stmt.objects[1],
          id: stmt.objects[1]
        });
      }
    }
  }
  
  // Extract relationships
  if (ast.relationships) {
    entities.relationships = ast.relationships.map(r => ({
      fromId: r.from,
      toId: r.to,
      type: r.type
    }));
  }
  
  // Extract dialogues
  if (ast.dialogues) {
    entities.dialogues = Object.values(ast.dialogues);
  }
  
  return entities;
}

/**
 * Count nodes of a specific type in the AST
 */
function countNodeType(node, type) {
  if (!node) return 0;
  let count = node.type === type ? 1 : 0;
  if (node.children) {
    for (const child of node.children) {
      count += countNodeType(child, type);
    }
  }
  if (node.groups) {
    for (const group of node.groups) {
      count += countNodeType(group, type);
    }
  }
  return count;
}

/**
 * Extract all references from AST
 */
function extractRefs(node, type) {
  const refs = [];
  function traverse(n) {
    if (!n) return;
    if (n.type === type) {
      refs.push(n);
    }
    (n.children || []).forEach(traverse);
    (n.groups || []).forEach(traverse);
  }
  traverse(node);
  return refs;
}

/**
 * Calculate structure metrics from parsed AST
 */
function calculateStructureMetrics(ast, entities) {
  const characters = entities.characters || [];
  const locations = entities.locations || [];
  const objects = entities.objects || [];
  const moods = entities.moods || [];
  const themes = entities.themes || [];
  const relationships = entities.relationships || [];
  const worldRules = entities.world_rules || [];
  const dialogues = entities.dialogues || [];
  const wisdom = entities.wisdom || [];
  const patterns = entities.patterns || [];
  
  // Count structure elements from groups
  let bookCount = 0, chapterCount = 0, sceneCount = 0, actionCount = 0, blockCount = 0;
  let charRefs = 0, locRefs = 0, objRefs = 0, moodRefs = 0, dialogueRefs = 0;
  
  function countGroups(groups, depth = 0) {
    if (!groups) return;
    for (const g of groups) {
      // Depth 0 = book, 1 = chapter, 2 = scene
      if (depth === 0) bookCount++;
      else if (depth === 1) chapterCount++;
      else if (depth === 2) sceneCount++;
      
      // Count references in this group
      if (g.references) {
        for (const ref of g.references) {
          if (ref.type === 'character') charRefs++;
          else if (ref.type === 'location') locRefs++;
          else if (ref.type === 'object') objRefs++;
          else if (ref.type === 'mood') moodRefs++;
          else if (ref.type === 'dialogue') dialogueRefs++;
        }
      }
      
      // Count statements as actions
      if (g.statements) {
        actionCount += g.statements.filter(s => 
          s.verb && !['is', 'has', 'group'].includes(s.verb)
        ).length;
      }
      
      // Recurse into nested groups (use children, not groups)
      if (g.children && g.children.length > 0) {
        countGroups(g.children, depth + 1);
      }
    }
  }
  
  countGroups(ast.groups);
  
  // Also count from statements for includes patterns
  if (ast.statements) {
    for (const stmt of ast.statements) {
      if (stmt.verb === 'includes') {
        const type = stmt.objects?.[0];
        if (type === 'character') charRefs++;
        else if (type === 'location') locRefs++;
        else if (type === 'object') objRefs++;
      }
    }
  }
  
  return {
    counts: {
      books: bookCount,
      chapters: chapterCount,
      scenes: sceneCount,
      actions: actionCount,
      blocks: blockCount,
      characters: characters.length,
      locations: locations.length,
      objects: objects.length,
      moods: moods.length,
      themes: themes.length,
      relationships: relationships.length,
      worldRules: worldRules.length,
      dialogues: dialogues.length,
      wisdom: wisdom.length,
      patterns: patterns.length
    },
    refs: {
      characters: charRefs,
      locations: locRefs,
      objects: objRefs,
      moods: moodRefs,
      dialogues: dialogueRefs
    }
  };
}

/**
 * Calculate completeness score
 */
function calculateCompleteness(counts) {
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
 * Calculate coherence metrics (entity usage, relationships, etc.)
 */
function calculateCoherenceMetrics(ast, entities, refs, counts) {
  const characters = entities.characters || [];
  const locations = entities.locations || [];
  const relationships = entities.relationships || [];
  
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
 * Calculate character trait consistency
 */
function calculateCharacterDrift(entities) {
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
 * Calculate originality index
 */
function calculateOriginality(ast, entities, counts) {
  // Unique block types
  const uniqueBlocks = new Set();
  function countBlockTypes(n) {
    if (!n) return;
    if (n.type === 'block-ref' && n.blockKey) uniqueBlocks.add(n.blockKey);
    (n.children || []).forEach(countBlockTypes);
    (n.groups || []).forEach(countBlockTypes);
  }
  countBlockTypes(ast);
  
  // Unique action types
  const uniqueActions = new Set();
  function countActionTypes(n) {
    if (!n) return;
    if (n.type === 'action' && n.actionData?.action) uniqueActions.add(n.actionData.action);
    (n.children || []).forEach(countActionTypes);
    (n.groups || []).forEach(countActionTypes);
  }
  countActionTypes(ast);
  
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
 * Calculate explainability score
 */
function calculateExplainability(entities, arcName) {
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
 * Calculate CNL parse success rate
 */
function calculateParseSuccess(cnl, parseResult) {
  const lines = cnl.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
  const totalLines = lines.length;
  
  // Count successful parses (lines that produced entities or structure)
  const validPatterns = /^[\s]*[\w"]+\s+(is|has|group|includes|owns|applies|beat|uses|conveys)/;
  const validLines = lines.filter(l => validPatterns.test(l)).length;
  
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
 * Calculate character continuity (do characters appear in multiple scenes?)
 */
function calculateCharacterContinuity(ast, entities) {
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
          if (stmt.verb === 'includes' && stmt.objects?.[0] === 'character') {
            const charName = stmt.objects[1]?.toLowerCase();
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
 * Calculate location logic (are locations reused?)
 */
function calculateLocationLogic(ast, entities) {
  const locations = entities.locations || [];
  if (locations.length === 0) return { score: 0, message: 'No locations defined' };
  
  const appearances = {};
  locations.forEach(l => appearances[l.name?.toLowerCase()] = 0);
  
  function countInGroups(groups, depth = 0) {
    if (!groups) return;
    for (const g of groups) {
      if (depth >= 2 && g.statements) {
        for (const stmt of g.statements) {
          if (stmt.verb === 'includes' && stmt.objects?.[0] === 'location') {
            const locName = stmt.objects[1]?.toLowerCase();
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
 * Calculate scene completeness (each scene has character + location + action)
 */
function calculateSceneCompleteness(ast) {
  let total = 0;
  let complete = 0;
  
  function checkGroups(groups, depth = 0) {
    if (!groups) return;
    for (const g of groups) {
      // Scenes are at depth 2
      if (depth === 2) {
        total++;
        const stmts = g.statements || [];
        const hasChar = stmts.some(s => s.verb === 'includes' && s.objects?.[0] === 'character');
        const hasLoc = stmts.some(s => s.verb === 'includes' && s.objects?.[0] === 'location');
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
 * Calculate composite NQS from all metrics
 */
function calculateNarrativeQualityScore(metrics) {
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

/**
 * Main evaluation entrypoint
 * 
 * @param {string} cnl - The CNL specification text
 * @param {Object} options - Optional configuration
 * @param {string} options.prose - Optional generated prose for text-based metrics
 * @param {string} options.targetArc - Target emotional arc pattern
 * @returns {Object} Complete evaluation results as JSON
 */
export function evaluateCNL(cnl, options = {}) {
  const startTime = Date.now();
  
  // Parse CNL
  let parseResult;
  try {
    parseResult = parseCNL(cnl);
  } catch (err) {
    return {
      success: false,
      error: 'parse_error',
      message: err.message,
      evaluatedAt: new Date().toISOString()
    };
  }
  
  const ast = parseResult.ast || parseResult.structure || {};
  
  // Extract entities from AST
  const rawEntities = ast.entities || {};
  const entities = extractEntitiesFromAST(rawEntities, ast);
  
  // Calculate structure metrics
  const structure = calculateStructureMetrics(ast, entities);
  
  // Calculate all metrics
  const metrics = {
    completeness: calculateCompleteness(structure.counts),
    coherence: calculateCoherenceMetrics(ast, entities, structure.refs, structure.counts),
    characterDrift: calculateCharacterDrift(entities),
    originality: calculateOriginality(ast, entities, structure.counts),
    explainability: calculateExplainability(entities, parseResult.arc),
    parseSuccess: calculateParseSuccess(cnl, parseResult),
    characterContinuity: calculateCharacterContinuity(ast, entities),
    locationLogic: calculateLocationLogic(ast, entities),
    sceneCompleteness: calculateSceneCompleteness(ast)
  };
  
  // Text-based metrics (if prose provided)
  if (options.prose && options.prose.length > 100) {
    metrics.textCoherence = calculateCoherence(options.prose);
    metrics.readability = calculateReadability(options.prose);
    
    if (entities.characters?.length > 0) {
      const cadResult = calculateCAD(options.prose, entities.characters);
      metrics.textCharacterDrift = cadResult;
    }
    
    if (options.targetArc) {
      metrics.emotionalArcMatch = calculateEmotionalArcMatch(
        options.prose, 
        options.targetArc
      );
    }
  }
  
  // Calculate composite NQS
  const nqs = calculateNarrativeQualityScore(metrics);
  
  // Run guardrail checks if prose available
  let guardrails = null;
  if (options.prose) {
    try {
      guardrails = runGuardrailCheck(options.prose);
    } catch (e) {
      guardrails = { error: e.message };
    }
  }
  
  // Build result
  const result = {
    success: true,
    evaluatedAt: new Date().toISOString(),
    processingTimeMs: Date.now() - startTime,
    
    // Summary
    summary: {
      nqs: nqs.score,
      interpretation: nqs.interpretation,
      passed: nqs.passed
    },
    
    // Structure counts
    structure: structure.counts,
    references: structure.refs,
    
    // Detailed metrics
    metrics: {
      nqs,
      ...metrics
    },
    
    // Guardrails (if prose provided)
    guardrails,
    
    // Entities summary
    entities: {
      characters: (entities.characters || []).map(c => ({
        name: c.name,
        archetype: c.archetype,
        traits: c.traits
      })),
      locations: (entities.locations || []).map(l => ({
        name: l.name,
        geography: l.geography
      })),
      themes: entities.themes || [],
      relationshipCount: (entities.relationships || []).length,
      worldRuleCount: (entities.world_rules || []).length
    }
  };
  
  return result;
}

/**
 * Quick evaluation - returns just the NQS score
 */
export function quickEvaluate(cnl) {
  const result = evaluateCNL(cnl);
  if (!result.success) {
    return { score: 0, error: result.message };
  }
  return {
    score: result.summary.nqs,
    interpretation: result.summary.interpretation,
    passed: result.summary.passed
  };
}

export default { evaluateCNL, quickEvaluate };
