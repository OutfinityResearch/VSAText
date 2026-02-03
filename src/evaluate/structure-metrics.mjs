/**
 * SCRIPTA SDK - Evaluation: Structure Metrics
 *
 * Derives counts and reference usage from the CNL parser AST.
 */

/**
 * Calculate structure metrics from parsed AST.
 */
export function calculateStructureMetrics(ast, entities) {
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

      // Count references + actions from statements
      if (Array.isArray(g.statements)) {
        for (const stmt of g.statements) {
          // Includes (references)
          if (stmt.verb === 'includes' && Array.isArray(stmt.objects) && stmt.objects.length >= 2) {
            const refType = String(stmt.objects[0]).toLowerCase();
            if (refType === 'character') charRefs++;
            else if (refType === 'location') locRefs++;
            else if (refType === 'object') objRefs++;
            else if (refType === 'mood') moodRefs++;
            else if (refType === 'dialogue') dialogueRefs++;
            else if (refType === 'block') blockCount++;
          }

          // Actions/events (exclude meta/structural verbs)
          if (stmt.verb && !['is', 'has', 'group', 'includes', 'requires', 'forbids', 'must', 'owns', 'relates', 'references', 'describes'].includes(stmt.verb)) {
            actionCount++;
          }
        }
      }
      
      // Recurse into nested groups (use children, not groups)
      if (g.children && g.children.length > 0) {
        countGroups(g.children, depth + 1);
      }
    }
  }
  
  countGroups(ast.groups);
  
  // Also count top-level includes (rare but allowed)
  if (Array.isArray(ast.statements)) {
    for (const stmt of ast.statements) {
      if (stmt.verb === 'includes' && Array.isArray(stmt.objects) && stmt.objects.length >= 2) {
        const type = String(stmt.objects[0]).toLowerCase();
        if (type === 'character') charRefs++;
        else if (type === 'location') locRefs++;
        else if (type === 'object') objRefs++;
        else if (type === 'mood') moodRefs++;
        else if (type === 'dialogue') dialogueRefs++;
        else if (type === 'block') blockCount++;
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

export default { calculateStructureMetrics };

