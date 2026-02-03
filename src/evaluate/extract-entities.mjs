/**
 * SCRIPTA SDK - Evaluation: Entity Extraction
 *
 * Converts the CNL parser AST into the normalized entity collections used by
 * the unified evaluator.
 */

/**
 * Extract entities from parsed AST into structured format.
 */
export function extractEntitiesFromAST(rawEntities, ast) {
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

  // Collect statements (top-level + nested groups) for higher-level extraction.
  const allStatements = [];
  if (Array.isArray(ast.statements)) allStatements.push(...ast.statements);
  (function collectFromGroups(groups) {
    for (const g of groups || []) {
      if (Array.isArray(g.statements)) allStatements.push(...g.statements);
      if (Array.isArray(g.children) && g.children.length > 0) collectFromGroups(g.children);
    }
  })(ast.groups || []);

  // Extract themes from statements
  for (const stmt of allStatements) {
    if (stmt.subject === 'Story' && stmt.verb === 'has' &&
        stmt.objects && String(stmt.objects[0]).toLowerCase() === 'theme') {
      const name = stmt.objects.slice(1).join(' ').trim();
      if (name) {
        entities.themes.push({ name, id: name });
      }
    }
  }

  // Extract world rules
  const worldRuleNames = new Set();
  for (const stmt of allStatements) {
    if (stmt.subject === 'World' && stmt.verb === 'has' &&
        stmt.objects && String(stmt.objects[0]).toLowerCase() === 'rule' &&
        stmt.objects.length >= 2) {
      const name = stmt.objects.slice(1).join(' ').trim();
      if (name) worldRuleNames.add(name);
    }
  }
  const worldRulesByName = new Map();
  for (const name of worldRuleNames) {
    worldRulesByName.set(name, { id: name, name, category: null, description: null, scope: null });
  }
  for (const stmt of allStatements) {
    if (!worldRuleNames.has(stmt.subject)) continue;
    const rule = worldRulesByName.get(stmt.subject);
    if (!rule) continue;

    if (stmt.verb === 'has' && stmt.objects && stmt.objects.length >= 2) {
      const prop = String(stmt.objects[0]).toLowerCase();
      const val = stmt.objects.slice(1).join(' ').trim();
      if (prop === 'category') rule.category = val || null;
      else if (prop === 'description') rule.description = val || null;
    }
    if (stmt.verb === 'applies') {
      rule.scope = (stmt.modifiers?.to || stmt.objects?.[0] || null);
    }
  }
  entities.world_rules = [...worldRulesByName.values()];

  // Extract wisdom
  const wisdomNames = new Set();
  for (const stmt of allStatements) {
    if (stmt.subject === 'Story' && stmt.verb === 'conveys' &&
        stmt.objects && String(stmt.objects[0]).toLowerCase() === 'wisdom' &&
        stmt.objects.length >= 2) {
      const label = stmt.objects.slice(1).join(' ').trim();
      if (label) wisdomNames.add(label);
    }
  }
  const wisdomByLabel = new Map();
  for (const label of wisdomNames) {
    wisdomByLabel.set(label, { id: label, label, category: null, insight: null, application: null, examples: null });
  }
  for (const stmt of allStatements) {
    if (!wisdomNames.has(stmt.subject)) continue;
    const w = wisdomByLabel.get(stmt.subject);
    if (!w) continue;

    if (stmt.verb === 'has' && stmt.objects && stmt.objects.length >= 2) {
      const prop = String(stmt.objects[0]).toLowerCase();
      const val = stmt.objects.slice(1).join(' ').trim();
      if (prop === 'category') w.category = val || null;
      else if (prop === 'insight') w.insight = val || null;
      else if (prop === 'examples') w.examples = val || null;
    }
    if (stmt.verb === 'applies') {
      w.application = (stmt.modifiers?.as || stmt.objects?.[0] || null);
    }
  }
  entities.wisdom = [...wisdomByLabel.values()];

  // Extract patterns
  const patternNames = new Set();
  for (const stmt of allStatements) {
    if (stmt.subject === 'Story' && stmt.verb === 'uses' &&
        stmt.objects && String(stmt.objects[0]).toLowerCase() === 'pattern' &&
        stmt.objects.length >= 2) {
      const label = stmt.objects.slice(1).join(' ').trim();
      if (label) patternNames.add(label);
    }
  }
  const patternsByLabel = new Map();
  for (const label of patternNames) {
    patternsByLabel.set(label, { id: label, label, patternType: null });
  }
  for (const stmt of allStatements) {
    if (!patternNames.has(stmt.subject)) continue;
    const p = patternsByLabel.get(stmt.subject);
    if (!p) continue;

    if (stmt.verb === 'is' && stmt.objects && stmt.objects.length >= 1) {
      p.patternType = stmt.objects[0];
    }
    if (stmt.verb === 'has' && stmt.objects && stmt.objects.length >= 2) {
      const prop = String(stmt.objects[0]).toLowerCase();
      const val = stmt.objects.slice(1).join(' ').trim();
      if (prop === 'type' && val) p.patternType = val;
    }
  }
  entities.patterns = [...patternsByLabel.values()];
  
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

export default { extractEntitiesFromAST };

