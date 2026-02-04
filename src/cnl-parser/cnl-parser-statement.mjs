/**
 * SCRIPTA CNL Parser - Statement Processing
 *
 * Updates the AST based on parsed SVO statements.
 * Separated from cnl-parser-core to keep modules within the repo size guidelines.
 */

import { ENTITY_TYPES, MULTI_VALUE_PROPERTIES } from './cnl-parser-grammar.mjs';
import { processBlueprintDialogueSubplot } from './cnl-parser-extensions.mjs';

function ensureEntity(ast, entityName, lineNo) {
  if (!ast.entities[entityName]) {
    ast.entities[entityName] = {
      name: entityName,
      type: 'unknown',
      types: [],
      properties: {},
      traits: [],
      relationships: [],
      line: lineNo
    };
  }
  return ast.entities[entityName];
}

function setEntityProperty(entity, key, value) {
  if (MULTI_VALUE_PROPERTIES.has(key)) {
    if (!Array.isArray(entity.properties[key])) entity.properties[key] = [];
    entity.properties[key].push(value);
    return;
  }
  entity.properties[key] = value;
}

function addMoodEmotion(entity, emotionKey, intensity) {
  if (!emotionKey) return;
  if (!entity.properties || typeof entity.properties !== 'object') entity.properties = {};
  if (!entity.properties.emotions || typeof entity.properties.emotions !== 'object' || Array.isArray(entity.properties.emotions)) {
    entity.properties.emotions = {};
  }

  // Prefer the strongest specified intensity if multiple lines repeat the same emotion.
  const prev = entity.properties.emotions[emotionKey];
  if (typeof prev === 'number' && typeof intensity === 'number') {
    entity.properties.emotions[emotionKey] = Math.max(prev, intensity);
  } else {
    entity.properties.emotions[emotionKey] = intensity;
  }
}

function parseEmotionIntensity(objects) {
  // Canonical: "X has emotion fear 2"
  // Legacy: "X has emotion fear intensity 2"
  if (!Array.isArray(objects) || objects.length < 3) return null;

  const third = String(objects[2] ?? '').toLowerCase();
  if (third === 'intensity') {
    const n = parseInt(String(objects[3] ?? ''), 10);
    return Number.isNaN(n) ? null : n;
  }

  const n = parseInt(String(objects[2] ?? ''), 10);
  return Number.isNaN(n) ? null : n;
}

/**
 * Process a single statement and update AST.
 *
 * @param {object} statement - Parsed statement (from cnl-parser-core.parseLine)
 * @param {object} ast - Parser AST (mutated in place)
 * @param {Array<object>} groupStack - Current group stack
 * @param {number} lineNo - 1-based line number
 */
export function processStatement(statement, ast, groupStack, lineNo) {
  const currentScope = groupStack.length > 0 ? groupStack[groupStack.length - 1] : null;

  // Entity declarations: "X is Y" or "X is Y with trait Z"
  if (statement.verb === 'is' && statement.objects.length > 0) {
    const entityType = String(statement.objects[0] ?? '').toLowerCase();
    const entityName = statement.subject;

    if (!ast.entities[entityName]) {
      ast.entities[entityName] = {
        name: entityName,
        type: entityType,
        types: [entityType],
        properties: {},
        traits: [],
        relationships: [],
        line: lineNo
      };
    } else {
      ast.entities[entityName].types.push(entityType);
      if (ENTITY_TYPES.has(entityType)) {
        ast.entities[entityName].type = entityType;
      }
    }

    // Extract traits from "with trait X, Y" modifier
    if (statement.modifiers?.with === 'trait' && statement.objects.length > 1) {
      const entity = ast.entities[entityName];
      // Traits are in objects after the entity type, may be comma-separated
      for (let i = 1; i < statement.objects.length; i++) {
        const traitValue = String(statement.objects[i] ?? '');
        const traits = traitValue.split(',').map(t => t.trim()).filter(Boolean);
        entity.traits.push(...traits);
      }
    }
  }

  // Properties: "X has Y Z"
  if (statement.verb === 'has' && statement.objects.length >= 1) {
    const entityName = statement.subject;
    const rawPropType = statement.objects[0];
    const propKey = String(rawPropType ?? '').toLowerCase();

    const entity = ensureEntity(ast, entityName, lineNo);

    if (propKey === 'trait') {
      const traitValue = statement.objects.slice(1).join(' ').trim();
      if (traitValue) entity.traits.push(traitValue);
      if (currentScope && traitValue) currentScope.properties.trait = traitValue;
    } else if (propKey === 'emotion') {
      const emotionKey = String(statement.objects[1] ?? '').toLowerCase();
      const intensity = parseEmotionIntensity(statement.objects);
      addMoodEmotion(entity, emotionKey, intensity);
    } else {
      const propValue = statement.objects.slice(1).join(' ') || true;
      setEntityProperty(entity, propKey, propValue);
      if (currentScope) currentScope.properties[propKey] = propValue;
    }
  }

  // Relationships: "X relates to Y as Z"
  if (statement.verb === 'relates' && statement.modifiers.to) {
    const from = statement.subject;
    const to = statement.modifiers.to;
    const relType = statement.modifiers.as || 'related';

    const entity = ensureEntity(ast, from, lineNo);
    entity.relationships.push({ target: to, type: relType, line: lineNo });
    ast.relationships.push({ from, to, type: relType, line: lineNo });
  }

  // Relationship shorthand: "X mentor_student Y" (legacy DS10 form)
  // This is treated as: "X relates to Y as mentor_student".
  if (statement.objects.length > 0 &&
      statement.verb.includes('_') &&
      (!statement.modifiers || Object.keys(statement.modifiers).length === 0)) {
    const from = statement.subject;
    const to = statement.objects[0];
    const relType = statement.verb;

    const entity = ensureEntity(ast, from, lineNo);
    entity.relationships.push({ target: to, type: relType, line: lineNo });
    ast.relationships.push({ from, to, type: relType, line: lineNo });
  }

  // Emotional/cognitive verbs as implicit relationships
  const emotionalVerbs = ['loves', 'hates', 'fears', 'wants', 'seeks', 'avoids'];
  if (emotionalVerbs.includes(statement.verb) && statement.objects.length > 0) {
    const from = statement.subject;
    const to = statement.objects[0];

    const entity = ensureEntity(ast, from, lineNo);
    entity.relationships.push({ target: to, type: statement.verb, line: lineNo });
    ast.relationships.push({ from, to, type: statement.verb, line: lineNo });
  }

  // Constraints: requires/forbids
  if (statement.verb === 'requires') {
    ast.constraints.requires.push({
      subject: statement.subject,
      target: statement.objects.join(' '),
      scope: currentScope?.name || 'global',
      line: lineNo
    });
  }
  if (statement.verb === 'forbids') {
    ast.constraints.forbids.push({
      subject: statement.subject,
      target: statement.objects.join(' '),
      scope: currentScope?.name || 'global',
      line: lineNo
    });
  }

  // Constraints: must (introduce/resolve/etc)
  if (statement.verb === 'must' && statement.objects.length >= 2) {
    const action = String(statement.objects[0] ?? '').toLowerCase();
    const target = statement.objects.slice(1).join(' ');
    ast.constraints.must.push({
      subject: statement.subject,
      action,
      target,
      scope: currentScope?.name || 'global',
      line: lineNo
    });
  }

  // Ownership: X owns Y
  if (statement.verb === 'owns' && statement.objects.length > 0) {
    const owner = statement.subject;
    const owned = statement.objects[0];
    ast.ownership.push({ owner, owned, line: lineNo });

    const entity = ensureEntity(ast, owner, lineNo);
    entity.relationships.push({ target: owned, type: 'owns', line: lineNo });
    ast.relationships.push({ from: owner, to: owned, type: 'owns', line: lineNo });
  }

  // Special properties: tone, max, min
  if (statement.verb === 'has' && statement.objects.length >= 2) {
    const propType = String(statement.objects[0] ?? '').toLowerCase();
    const propValue = statement.objects.slice(1).join(' ');

    if (propType === 'tone') {
      ast.constraints.tone.push({
        subject: statement.subject,
        value: propValue,
        scope: currentScope?.name || 'global',
        line: lineNo
      });
    } else if (propType === 'max') {
      const [what, ...rest] = statement.objects.slice(1);
      const count = parseInt(rest.join(' '), 10) || parseInt(String(what ?? ''), 10);
      ast.constraints.max.push({
        subject: statement.subject,
        what: Number.isNaN(parseInt(String(what ?? ''), 10)) ? what : 'items',
        count,
        scope: currentScope?.name || 'global',
        line: lineNo
      });
    } else if (propType === 'min') {
      const [what, ...rest] = statement.objects.slice(1);
      const count = parseInt(rest.join(' '), 10) || parseInt(String(what ?? ''), 10);
      ast.constraints.min.push({
        subject: statement.subject,
        what: Number.isNaN(parseInt(String(what ?? ''), 10)) ? what : 'items',
        count,
        scope: currentScope?.name || 'global',
        line: lineNo
      });
    }
  }

  // References (@notation)
  const allValues = [statement.subject, ...statement.objects, ...Object.values(statement.modifiers)];
  for (const val of allValues) {
    if (typeof val === 'string' && val.startsWith('@')) {
      ast.references.push({
        from: currentScope ? currentScope.name : 'root',
        to: val.slice(1),
        line: lineNo,
        type: statement.verb
      });
    }
  }

  // Blueprint/Dialogue/Subplot processing delegated to extension module.
  processBlueprintDialogueSubplot(statement, ast, lineNo);

  // Add to scope
  if (currentScope) currentScope.statements.push(statement);
  else ast.statements.push(statement);
}

export default { processStatement };

