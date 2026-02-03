/**
 * SCRIPTA CNL Parser - Core Module
 * 
 * Core parsing functions for Controlled Natural Language.
 * Works in both browser and Node.js.
 */

import {
  VERBS,
  MODIFIERS,
  ENTITY_TYPES,
  DIALOGUE_PURPOSES,
  DIALOGUE_TONES,
  SUBPLOT_TYPES
} from './cnl-parser-grammar.mjs';

import {
  applyInlineDeclaration,
  processBlueprintDialogueSubplot
} from './cnl-parser-extensions.mjs';

export { ENTITY_TYPES, DIALOGUE_PURPOSES, DIALOGUE_TONES, SUBPLOT_TYPES };

/**
 * Tokenize a line into meaningful tokens
 */
export function tokenizeLine(line) {
  const tokens = [];
  let current = '';
  let inString = false;
  let escape = false;
  
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    
    if (inString) {
      current += ch;
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') {
        tokens.push({ type: 'string', value: current.slice(1, -1) });
        current = '';
        inString = false;
      }
      continue;
    }
    
    if (ch === '"') {
      if (current.trim()) tokens.push({ type: 'word', value: current.trim() });
      current = '"';
      inString = true;
      continue;
    }
    
    if (/\s/.test(ch)) {
      if (current.trim()) {
        tokens.push({ type: 'word', value: current.trim() });
        current = '';
      }
      continue;
    }
    
    current += ch;
  }
  
  if (inString) return { tokens: [], error: 'Unterminated string literal' };
  if (current.trim()) tokens.push({ type: 'word', value: current.trim() });
  
  return { tokens, error: null };
}

/**
 * Parse a single line into a statement object
 */
export function parseLine(line, lineNo) {
  const stripped = line.trim();
  
  // Skip empty lines and comments
  if (!stripped || stripped.startsWith('//') || stripped.startsWith('#')) {
    return { statement: null, error: null, isComment: stripped.startsWith('//') || stripped.startsWith('#') };
  }
  
  // Skip multi-line comment markers
  if (stripped.startsWith('/*') || stripped.startsWith('*/') || stripped === '*') {
    return { statement: null, error: null };
  }
  
  const { tokens, error: tokenError } = tokenizeLine(stripped);
  if (tokenError) return { statement: null, error: { line: lineNo, message: tokenError } };
  if (tokens.length === 0) return { statement: null, error: null };
  
  const tokenWords = tokens.filter(t => t.type === 'word').map(t => t.value.toLowerCase());
  
  // GROUP BEGIN: "Name group begin"
  if (tokenWords.length >= 3 && 
      tokenWords[tokenWords.length - 2] === 'group' && 
      tokenWords[tokenWords.length - 1] === 'begin') {
    return {
      statement: { type: 'group_begin', name: tokens[0].value, line: lineNo },
      error: null
    };
  }
  
  // GROUP END: "Name group end"
  if (tokenWords.length >= 3 && 
      tokenWords[tokenWords.length - 2] === 'group' && 
      tokenWords[tokenWords.length - 1] === 'end') {
    return {
      statement: { type: 'group_end', name: tokens[0].value, line: lineNo },
      error: null
    };
  }
  
  // EXCHANGE BEGIN: "DialogueId exchange begin" (NEW)
  if (tokenWords.length >= 3 && 
      tokenWords[tokenWords.length - 2] === 'exchange' && 
      tokenWords[tokenWords.length - 1] === 'begin') {
    return {
      statement: { type: 'exchange_begin', dialogueId: tokens[0].value, line: lineNo },
      error: null
    };
  }
  
  // EXCHANGE END: "DialogueId exchange end" (NEW)
  if (tokenWords.length >= 3 && 
      tokenWords[tokenWords.length - 2] === 'exchange' && 
      tokenWords[tokenWords.length - 1] === 'end') {
    return {
      statement: { type: 'exchange_end', dialogueId: tokens[0].value, line: lineNo },
      error: null
    };
  }

  // ============================================
  // EXTENSION SYNTAX (non-strict SVO)
  // ============================================

  // Beat midpoint mapped to Ch2.Sc1
  if (tokenWords.length >= 5 &&
      tokenWords[0] === 'beat' &&
      tokenWords[2] === 'mapped' &&
      tokenWords[3] === 'to') {
    return {
      statement: {
        type: 'beat_mapping',
        beatKey: tokens[1].value,
        target: tokens.slice(4).map(t => t.value).join(' '),
        line: lineNo
      },
      error: null
    };
  }

  // Tension at 0.5 is 4
  if (tokenWords.length >= 5 &&
      tokenWords[0] === 'tension' &&
      tokenWords[1] === 'at' &&
      tokenWords[3] === 'is') {
    const position = parseFloat(tokens[2].value);
    const tension = parseInt(tokens[4].value, 10);
    if (Number.isNaN(position) || Number.isNaN(tension)) {
      return {
        statement: null,
        error: { line: lineNo, message: 'Invalid tension curve syntax (expected: Tension at <0..1> is <1..5>)' }
      };
    }
    return {
      statement: { type: 'tension_point', position, tension, line: lineNo },
      error: null
    };
  }

  // Dialogue D1 at Ch2.Sc1
  if (tokenWords.length >= 4 &&
      tokenWords[0] === 'dialogue' &&
      tokenWords[2] === 'at') {
    return {
      statement: { type: 'dialogue_decl', dialogueId: tokens[1].value, location: tokens[3].value, line: lineNo },
      error: null
    };
  }

  // Subplot S1 type romance
  if (tokenWords.length >= 4 &&
      tokenWords[0] === 'subplot' &&
      tokenWords[2] === 'type') {
    return {
      statement: { type: 'subplot_decl', subplotId: tokens[1].value, subplotType: tokens[3].value, line: lineNo },
      error: null
    };
  }
  
  // Regular statement
  if (tokens.length < 2) {
    return { statement: null, error: { line: lineNo, message: 'Statement requires at least subject and verb' } };
  }
  
  const subject = tokens[0].value;
  const isReference = subject.startsWith('@');
  
  // Find the verb
  let verbIndex = -1;
  let verb = null;
  
  for (let i = 1; i < tokens.length; i++) {
    if (tokens[i].type !== 'word') continue;
    const word = tokens[i].value.toLowerCase();
    if (VERBS.has(word)) {
      verbIndex = i;
      verb = word;
      break;
    }
  }
  
  if (verbIndex === -1) {
    if (tokens[1].type === 'word') {
      verbIndex = 1;
      verb = tokens[1].value.toLowerCase();
    } else {
      return { statement: null, error: { line: lineNo, message: 'No verb found in statement' } };
    }
  }
  
  const rest = tokens.slice(verbIndex + 1);
  const statement = {
    type: 'statement',
    subject: subject,
    verb: verb,
    line: lineNo,
    objects: [],
    modifiers: {},
    isReference
  };
  
  let i = 0;
  while (i < rest.length) {
    const token = rest[i];
    const word = token.type === 'word' ? token.value.toLowerCase() : null;
    
    if (word && MODIFIERS.has(word) && i + 1 < rest.length) {
      statement.modifiers[word] = rest[i + 1].value;
      i += 2;
      continue;
    }
    
    statement.objects.push(token.value);
    i++;
  }
  
  return { statement, error: null };
}

/**
 * Parse complete CNL text into an AST
 */
export function parseCNL(text) {
  const lines = text.split(/\r?\n/);
  const errors = [];
  const warnings = [];
  
  const ast = {
    type: 'document',
    entities: {},
    groups: [],
    statements: [],
    relationships: [],
    references: [],
    ownership: [],      // X owns Y
    constraints: { 
      requires: [],     // X requires "Y"
      forbids: [],      // X forbids "Y"  
      must: [],         // X must introduce/resolve Y
      tone: [],         // X has tone Y
      max: [],          // X has max Y Z
      min: []           // X has min Y Z
    },
    // Blueprint structure (NEW)
    blueprint: {
      arc: null,           // Selected arc key
      beatMappings: [],    // { beatKey, chapterId, sceneId, tension, notes }
      tensionCurve: []     // { position, tension }
    },
    // Dialogues (NEW)
    dialogues: {},         // { id: { purpose, participants, tone, tension, beatKey, exchanges } }
    // Subplots (NEW)
    subplots: {},          // { id: { type, characters, startBeat, resolveBeat, touchpoints } }
    // Exchange context (for parsing exchange blocks)
    _currentExchange: null
  };
  
  const groupStack = [];
  let inMultilineComment = false;
  
  for (let lineNo = 1; lineNo <= lines.length; lineNo++) {
    const line = lines[lineNo - 1];
    const stripped = line.trim();
    
    if (stripped.startsWith('/*')) { inMultilineComment = true; continue; }
    if (stripped.endsWith('*/') || stripped === '*/') { inMultilineComment = false; continue; }
    if (inMultilineComment) continue;
    
    const { statement, error } = parseLine(line, lineNo);
    
    if (error) { errors.push(error); continue; }
    if (!statement) continue;
    
    // Handle group begin
    if (statement.type === 'group_begin') {
      const newGroup = {
        name: statement.name, type: 'group',
        properties: {}, statements: [], children: [], startLine: lineNo
      };
      
      if (groupStack.length > 0) {
        groupStack[groupStack.length - 1].children.push(newGroup);
      } else {
        ast.groups.push(newGroup);
      }
      groupStack.push(newGroup);
      continue;
    }
    
    // Handle group end
    if (statement.type === 'group_end') {
      if (groupStack.length === 0) {
        errors.push({ line: lineNo, message: `Unexpected group end: ${statement.name}` });
        continue;
      }
      
      const currentGroup = groupStack[groupStack.length - 1];
      if (currentGroup.name !== statement.name) {
        errors.push({ line: lineNo, message: `Mismatched group end: expected "${currentGroup.name}", got "${statement.name}"` });
        continue;
      }
      
      currentGroup.endLine = lineNo;
      groupStack.pop();
      continue;
    }
    
    // Handle exchange begin (NEW)
    if (statement.type === 'exchange_begin') {
      const dialogueId = statement.dialogueId;
      if (!ast.dialogues[dialogueId]) {
        ast.dialogues[dialogueId] = { 
          id: dialogueId, purpose: null, participants: [], 
          tone: null, tension: null, beatKey: null, 
          location: null, exchanges: [], line: lineNo 
        };
      }
      ast._currentExchange = dialogueId;
      continue;
    }
    
    // Handle exchange end (NEW)
    if (statement.type === 'exchange_end') {
      if (ast._currentExchange !== statement.dialogueId) {
        errors.push({ line: lineNo, message: `Mismatched exchange end: expected "${ast._currentExchange}", got "${statement.dialogueId}"` });
      }
      ast._currentExchange = null;
      continue;
    }

    // Extension declarations (beat mapping, tension curve, dialogue, subplot)
    if (applyInlineDeclaration(statement, ast, lineNo)) {
      continue;
    }
    
    // Regular statement processing
    if (statement.type === 'statement') {
      processStatement(statement, ast, groupStack, lineNo);
    }
  }
  
  // Check for unclosed groups
  for (const group of groupStack) {
    errors.push({ line: group.startLine, message: `Unclosed group: ${group.name}` });
  }
  
  return { valid: errors.length === 0, errors, warnings, ast };
}

/**
 * Process a single statement and update AST
 */
function processStatement(statement, ast, groupStack, lineNo) {
  const currentScope = groupStack.length > 0 ? groupStack[groupStack.length - 1] : null;
  
  // Entity declarations: "X is Y"
  if (statement.verb === 'is' && statement.objects.length > 0) {
    const entityType = statement.objects[0].toLowerCase();
    const entityName = statement.subject;
    
    if (!ast.entities[entityName]) {
      ast.entities[entityName] = {
        name: entityName, type: entityType, types: [entityType],
        properties: {}, traits: [], relationships: [], line: lineNo
      };
    } else {
      ast.entities[entityName].types.push(entityType);
      if (ENTITY_TYPES.has(entityType)) {
        ast.entities[entityName].type = entityType;
      }
    }
  }
  
  // Properties: "X has Y Z"
  if (statement.verb === 'has' && statement.objects.length >= 1) {
    const entityName = statement.subject;
    const propType = statement.objects[0];
    const propValue = statement.objects.slice(1).join(' ') || true;
    
    if (!ast.entities[entityName]) {
      ast.entities[entityName] = {
        name: entityName, type: 'unknown', types: [],
        properties: {}, traits: [], relationships: [], line: lineNo
      };
    }
    
    const entity = ast.entities[entityName];
    if (propType.toLowerCase() === 'trait') {
      if (typeof propValue === 'string') entity.traits.push(propValue);
    } else {
      entity.properties[propType] = propValue;
    }
    
    if (currentScope) currentScope.properties[propType] = propValue;
  }
  
  // Relationships: "X relates to Y as Z"
  if (statement.verb === 'relates' && statement.modifiers.to) {
    const from = statement.subject;
    const to = statement.modifiers.to;
    const relType = statement.modifiers.as || 'related';
    
    if (!ast.entities[from]) {
      ast.entities[from] = {
        name: from, type: 'unknown', types: [],
        properties: {}, traits: [], relationships: [], line: lineNo
      };
    }
    
    ast.entities[from].relationships.push({ target: to, type: relType, line: lineNo });
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

    if (!ast.entities[from]) {
      ast.entities[from] = {
        name: from, type: 'unknown', types: [],
        properties: {}, traits: [], relationships: [], line: lineNo
      };
    }

    ast.entities[from].relationships.push({ target: to, type: relType, line: lineNo });
    ast.relationships.push({ from, to, type: relType, line: lineNo });
  }
  
  // Emotional/cognitive verbs as implicit relationships
  const emotionalVerbs = ['loves', 'hates', 'fears', 'wants', 'seeks', 'avoids'];
  if (emotionalVerbs.includes(statement.verb) && statement.objects.length > 0) {
    const from = statement.subject;
    const to = statement.objects[0];
    
    if (!ast.entities[from]) {
      ast.entities[from] = {
        name: from, type: 'unknown', types: [],
        properties: {}, traits: [], relationships: [], line: lineNo
      };
    }
    
    ast.entities[from].relationships.push({ target: to, type: statement.verb, line: lineNo });
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
    const action = statement.objects[0].toLowerCase();
    const target = statement.objects.slice(1).join(' ');
    ast.constraints.must.push({
      subject: statement.subject,
      action: action,
      target: target,
      scope: currentScope?.name || 'global',
      line: lineNo
    });
  }
  
  // Ownership: X owns Y
  if (statement.verb === 'owns' && statement.objects.length > 0) {
    const owner = statement.subject;
    const owned = statement.objects[0];
    ast.ownership.push({ owner, owned, line: lineNo });
    
    // Also create implicit relationship
    if (!ast.entities[owner]) {
      ast.entities[owner] = {
        name: owner, type: 'unknown', types: [],
        properties: {}, traits: [], relationships: [], line: lineNo
      };
    }
    ast.entities[owner].relationships.push({ target: owned, type: 'owns', line: lineNo });
    ast.relationships.push({ from: owner, to: owned, type: 'owns', line: lineNo });
  }
  
  // Special properties: tone, max, min
  if (statement.verb === 'has' && statement.objects.length >= 2) {
    const propType = statement.objects[0].toLowerCase();
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
      const count = parseInt(rest.join(' ')) || parseInt(what);
      ast.constraints.max.push({
        subject: statement.subject,
        what: isNaN(parseInt(what)) ? what : 'items',
        count: count,
        scope: currentScope?.name || 'global',
        line: lineNo
      });
    } else if (propType === 'min') {
      const [what, ...rest] = statement.objects.slice(1);
      const count = parseInt(rest.join(' ')) || parseInt(what);
      ast.constraints.min.push({
        subject: statement.subject,
        what: isNaN(parseInt(what)) ? what : 'items',
        count: count,
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
        to: val.slice(1), line: lineNo, type: statement.verb
      });
    }
  }
  
  // Blueprint/Dialogue/Subplot processing delegated to extension module
  // (imported dynamically to keep core parser lean)
  processBlueprintDialogueSubplot(statement, ast, lineNo);
  
  // Add to scope
  if (currentScope) {
    currentScope.statements.push(statement);
  } else {
    ast.statements.push(statement);
  }
}

/**
 * Extract categorized entities from parsed AST
 */
export function extractEntities(ast) {
  const characters = [], locations = [], themes = [], objects = [], other = [];
  
  for (const [name, entity] of Object.entries(ast.entities)) {
    const item = {
      name,
      type: entity.type,
      types: entity.types || [entity.type],
      traits: entity.traits || [],
      properties: entity.properties || {},
      relationships: entity.relationships || []
    };
    
    const type = entity.type?.toLowerCase();
    
    if (['protagonist', 'character', 'antagonist', 'mentor', 'ally', 'enemy'].includes(type)) {
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
 * Extract constraints from AST
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
 * Extract ownership relations from AST
 */
export function extractOwnership(ast) {
  return ast.ownership || [];
}

/**
 * Count all groups recursively
 */
export function countGroups(groups) {
  let count = groups?.length || 0;
  for (const g of groups || []) {
    count += countGroups(g.children);
  }
  return count;
}
