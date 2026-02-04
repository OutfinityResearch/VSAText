/**
 * SCRIPTA CNL Parser - Extraction Helpers
 *
 * Small helper functions that derive convenient views from the AST.
 * Kept separate to keep core parsing modules compact.
 */

/**
 * Extract categorized entities from parsed AST.
 */
export function extractEntities(ast) {
  const characters = [], locations = [], themes = [], objects = [], other = [];

  for (const [name, entity] of Object.entries(ast.entities || {})) {
    const item = {
      name,
      type: entity.type,
      types: entity.types || [entity.type],
      traits: entity.traits || [],
      properties: entity.properties || {},
      relationships: entity.relationships || []
    };

    const type = entity.type?.toLowerCase();

    if ([
      'protagonist', 'character', 'antagonist', 'mentor', 'ally', 'enemy',
      'hero', 'villain', 'shadow', 'sidekick', 'trickster', 'herald',
      'shapeshifter', 'threshold_guardian'
    ].includes(type)) {
      characters.push(item);
    } else if (['location', 'place', 'setting'].includes(type)) {
      locations.push(item);
    } else if (['theme', 'motif'].includes(type)) {
      themes.push(item);
    } else if (['artifact', 'object', 'item'].includes(type)) {
      objects.push(item);
    } else {
      other.push(item);
    }
  }

  return { characters, locations, themes, objects, other };
}

/**
 * Extract constraints from AST.
 */
export function extractConstraints(ast) {
  return ast.constraints || {
    requires: [],
    forbids: [],
    must: [],
    tone: [],
    max: [],
    min: []
  };
}

/**
 * Extract ownership relations from AST.
 */
export function extractOwnership(ast) {
  return ast.ownership || [];
}

/**
 * Count all groups recursively.
 */
export function countGroups(groups) {
  let count = groups?.length || 0;
  for (const g of groups || []) {
    count += countGroups(g.children);
  }
  return count;
}

export default {
  extractEntities,
  extractConstraints,
  extractOwnership,
  countGroups
};

