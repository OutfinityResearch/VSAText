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
        emotions: (entity.properties && typeof entity.properties.emotions === 'object' && !Array.isArray(entity.properties.emotions))
          ? entity.properties.emotions
          : {},
        id: name
      });
    }
    // World rules / wisdom / patterns are extracted from statements below (plus type declarations).
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
  const themesByName = new Map();
  for (const stmt of allStatements) {
    if (stmt.subject === 'Story' && stmt.verb === 'has' &&
        stmt.objects && String(stmt.objects[0]).toLowerCase() === 'theme') {
      const name = stmt.objects.slice(1).join(' ').trim();
      const role = stmt.modifiers?.as ? String(stmt.modifiers.as).toLowerCase() : null;
      if (!name) continue;
      const existing = themesByName.get(name);
      if (!existing) themesByName.set(name, { name, id: name, role });
      else if (!existing.role && role) existing.role = role;
    }
  }
  entities.themes = [...themesByName.values()];

  // Extract world rules
  const worldRuleIds = new Set();

  // New canonical: "R1 is world_rule" and/or "World includes rule R1"
  for (const [name, entity] of Object.entries(rawEntities || {})) {
    if (String(entity?.type || '').toLowerCase() === 'world_rule') {
      worldRuleIds.add(name);
    }
  }
  for (const stmt of allStatements) {
    if (stmt.subject === 'World' && stmt.verb === 'includes' &&
        stmt.objects && String(stmt.objects[0]).toLowerCase() === 'rule' &&
        stmt.objects.length >= 2) {
      worldRuleIds.add(String(stmt.objects[1]));
    }
  }

  // Legacy: "World has rule <RuleName>"
  for (const stmt of allStatements) {
    if (stmt.subject === 'World' && stmt.verb === 'has' &&
        stmt.objects && String(stmt.objects[0]).toLowerCase() === 'rule' &&
        stmt.objects.length >= 2) {
      const name = stmt.objects.slice(1).join(' ').trim();
      if (name) worldRuleIds.add(name);
    }
  }

  const worldRulesById = new Map();
  for (const id of worldRuleIds) {
    worldRulesById.set(id, { id, name: id, text: null, category: null, description: null, scope: null });
  }
  for (const stmt of allStatements) {
    if (!worldRuleIds.has(stmt.subject)) continue;
    const rule = worldRulesById.get(stmt.subject);
    if (!rule) continue;

    if (stmt.verb === 'has' && stmt.objects && stmt.objects.length >= 2) {
      const prop = String(stmt.objects[0]).toLowerCase();
      const val = stmt.objects.slice(1).join(' ').trim();
      if (prop === 'category') rule.category = val || null;
      else if (prop === 'description') rule.description = val || null;
      else if (prop === 'text') rule.text = val || null;
      else if (prop === 'label') rule.name = val || rule.name;
    }
    if (stmt.verb === 'applies') {
      rule.scope = (stmt.modifiers?.to || stmt.objects?.[0] || null);
    }
  }
  // Prefer human-facing "text" as display name when present
  for (const rule of worldRulesById.values()) {
    if (rule.text && (rule.name === rule.id || !rule.name)) rule.name = rule.text;
  }
  entities.world_rules = [...worldRulesById.values()];

  // Extract wisdom
  const wisdomIds = new Set();

  // New canonical: "W1 is wisdom" and/or "Story includes wisdom W1"
  for (const [name, entity] of Object.entries(rawEntities || {})) {
    if (String(entity?.type || '').toLowerCase() === 'wisdom') {
      wisdomIds.add(name);
    }
  }
  for (const stmt of allStatements) {
    if (stmt.subject === 'Story' && stmt.verb === 'includes' &&
        stmt.objects && String(stmt.objects[0]).toLowerCase() === 'wisdom' &&
        stmt.objects.length >= 2) {
      wisdomIds.add(String(stmt.objects[1]));
    }
  }

  // Legacy: "Story conveys wisdom <Label>"
  for (const stmt of allStatements) {
    if (stmt.subject === 'Story' && stmt.verb === 'conveys' &&
        stmt.objects && String(stmt.objects[0]).toLowerCase() === 'wisdom' &&
        stmt.objects.length >= 2) {
      const label = stmt.objects.slice(1).join(' ').trim();
      if (label) wisdomIds.add(label);
    }
  }
  const wisdomById = new Map();
  for (const id of wisdomIds) {
    wisdomById.set(id, { id, label: id, category: null, insight: null, application: null, examples: null });
  }
  for (const stmt of allStatements) {
    if (!wisdomIds.has(stmt.subject)) continue;
    const w = wisdomById.get(stmt.subject);
    if (!w) continue;

    if (stmt.verb === 'has' && stmt.objects && stmt.objects.length >= 2) {
      const prop = String(stmt.objects[0]).toLowerCase();
      const val = stmt.objects.slice(1).join(' ').trim();
      if (prop === 'category') w.category = val || null;
      else if (prop === 'insight') w.insight = val || null;
      else if (prop === 'application') w.application = val || null;
      else if (prop === 'examples') w.examples = val || null;
      else if (prop === 'label') w.label = val || w.label;
    }
    if (stmt.verb === 'applies') w.application = (stmt.modifiers?.as || stmt.objects?.[0] || null);
  }
  entities.wisdom = [...wisdomById.values()];

  // Extract patterns
  const patternIds = new Set();

  // New canonical: "P1 is pattern" and/or "Story includes pattern P1"
  for (const [name, entity] of Object.entries(rawEntities || {})) {
    if (String(entity?.type || '').toLowerCase() === 'pattern') {
      patternIds.add(name);
    }
  }
  for (const stmt of allStatements) {
    if (stmt.subject === 'Story' && stmt.verb === 'includes' &&
        stmt.objects && String(stmt.objects[0]).toLowerCase() === 'pattern' &&
        stmt.objects.length >= 2) {
      patternIds.add(String(stmt.objects[1]));
    }
  }

  // Legacy: "Story uses pattern <Label>"
  for (const stmt of allStatements) {
    if (stmt.subject === 'Story' && stmt.verb === 'uses' &&
        stmt.objects && String(stmt.objects[0]).toLowerCase() === 'pattern' &&
        stmt.objects.length >= 2) {
      const label = stmt.objects.slice(1).join(' ').trim();
      if (label) patternIds.add(label);
    }
  }
  const patternsById = new Map();
  for (const id of patternIds) {
    patternsById.set(id, { id, label: id, patternType: null, role: null });
  }
  for (const stmt of allStatements) {
    if (!patternIds.has(stmt.subject)) continue;
    const p = patternsById.get(stmt.subject);
    if (!p) continue;

    if (stmt.verb === 'is' && stmt.objects && stmt.objects.length >= 1) {
      p.patternType = stmt.objects[0];
    }
    if (stmt.verb === 'has' && stmt.objects && stmt.objects.length >= 2) {
      const prop = String(stmt.objects[0]).toLowerCase();
      const val = stmt.objects.slice(1).join(' ').trim();
      if (prop === 'type' && val) p.patternType = val;
      else if (prop === 'label' && val) p.label = val;
      else if (prop === 'role' && val) p.role = val;
    }
  }
  entities.patterns = [...patternsById.values()];
  
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
