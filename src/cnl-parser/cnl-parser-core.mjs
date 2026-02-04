/**
 * SCRIPTA CNL Parser - Core Module
 * 
 * Core parsing functions for Controlled Natural Language.
 * Works in both browser and Node.js.
 */

import {
  VERBS,
  ANNOTATION_TYPES,
  MODIFIERS,
  ENTITY_TYPES,
  DIALOGUE_PURPOSES,
  DIALOGUE_TONES,
  SUBPLOT_TYPES
} from './cnl-parser-grammar.mjs';

import {
  applyInlineDeclaration,
} from './cnl-parser-extensions.mjs';

export { ENTITY_TYPES, DIALOGUE_PURPOSES, DIALOGUE_TONES, SUBPLOT_TYPES };

import { processStatement } from './cnl-parser-statement.mjs';
import {
  extractEntities,
  extractConstraints,
  extractOwnership,
  countGroups
} from './cnl-parser-extract.mjs';

export {
  extractEntities,
  extractConstraints,
  extractOwnership,
  countGroups
};

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
  
  // Skip empty lines
  if (!stripped) {
    return { statement: null, error: null, isComment: false };
  }

  // Parse LLM annotation lines (dual-layer CNL).
  // Unknown #lines remain comments for backwards compatibility.
  if (stripped.startsWith('#')) {
    const raw = stripped.slice(1);

    // Block syntax: "#type: begin" ... "#type: end"
    const blockBegin = raw.match(/^(\w+):\s*begin\s*$/i);
    if (blockBegin) {
      const type = blockBegin[1].toLowerCase();
      if (ANNOTATION_TYPES.has(type)) {
        return { statement: null, error: null, annotation: { type, blockBegin: true }, isComment: false };
      }
      return { statement: null, error: null, isComment: true };
    }

    const blockEnd = raw.match(/^(\w+):\s*end\s*$/i);
    if (blockEnd) {
      const type = blockEnd[1].toLowerCase();
      if (ANNOTATION_TYPES.has(type)) {
        return { statement: null, error: null, annotation: { type, blockEnd: true }, isComment: false };
      }
      return { statement: null, error: null, isComment: true };
    }

    // Inline syntax: "#type: content"
    const inline = raw.match(/^(\w+):\s*(.*)$/i);
    if (inline) {
      const type = inline[1].toLowerCase();
      const content = inline[2] ?? '';
      if (ANNOTATION_TYPES.has(type)) {
        return { statement: null, error: null, annotation: { type, content }, isComment: false };
      }
    }

    return { statement: null, error: null, isComment: true };
  }

  // Skip // comments (pure comments, not annotations)
  if (stripped.startsWith('//')) {
    return { statement: null, error: null, isComment: true };
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
    globalAnnotations: [], // LLM-only guidance not used by metrics
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
      beatProperties: {},  // { [beatKey]: { mood, notes, tension, annotations } }
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

  // Annotation state (dual-layer CNL: SVO + #annotations).
  let lastAnnotationTarget = null;
  let annotationBlock = null; // { type, startLine, lines: [] }

  function attachAnnotation(annotation) {
    if (!annotation || !annotation.type) return;

    const target = lastAnnotationTarget;

    // No target → global annotation
    if (!target) {
      ast.globalAnnotations.push(annotation);
      return;
    }

    if (target.kind === 'statement' && target.statement) {
      target.statement.annotations = target.statement.annotations || [];
      target.statement.annotations.push(annotation);
      return;
    }

    if (target.kind === 'group' && target.group) {
      target.group.annotations = target.group.annotations || [];
      target.group.annotations.push(annotation);
      return;
    }

    if (target.kind === 'dialogue' && target.id) {
      if (!ast.dialogues[target.id]) {
        ast.dialogues[target.id] = {
          id: target.id,
          purpose: null,
          participants: [],
          tone: null,
          tension: null,
          beatKey: null,
          location: null,
          exchanges: [],
          annotations: [],
          line: annotation.line
        };
      }
      ast.dialogues[target.id].annotations = ast.dialogues[target.id].annotations || [];
      ast.dialogues[target.id].annotations.push(annotation);
      return;
    }

    if (target.kind === 'subplot' && target.id) {
      if (!ast.subplots[target.id]) {
        ast.subplots[target.id] = {
          id: target.id,
          type: null,
          name: target.id,
          characterIds: [],
          startBeat: null,
          resolveBeat: null,
          touchpoints: [],
          annotations: [],
          line: annotation.line
        };
      }
      ast.subplots[target.id].annotations = ast.subplots[target.id].annotations || [];
      ast.subplots[target.id].annotations.push(annotation);
      return;
    }

    if (target.kind === 'beat' && target.id) {
      const beatKey = String(target.id).toLowerCase();
      const idx = ast.blueprint.beatMappings.findIndex(b => b.beatKey === beatKey);
      if (idx >= 0) {
        ast.blueprint.beatMappings[idx].annotations = ast.blueprint.beatMappings[idx].annotations || [];
        ast.blueprint.beatMappings[idx].annotations.push(annotation);
      } else {
        ast.blueprint.beatProperties[beatKey] = ast.blueprint.beatProperties[beatKey] || { annotations: [] };
        ast.blueprint.beatProperties[beatKey].annotations = ast.blueprint.beatProperties[beatKey].annotations || [];
        ast.blueprint.beatProperties[beatKey].annotations.push(annotation);
      }
      return;
    }

    // Fallback: global
    ast.globalAnnotations.push(annotation);
  }
  
  for (let lineNo = 1; lineNo <= lines.length; lineNo++) {
    const line = lines[lineNo - 1];
    const stripped = line.trim();
    
    if (stripped.startsWith('/*')) { inMultilineComment = true; continue; }
    if (stripped.endsWith('*/') || stripped === '*/') { inMultilineComment = false; continue; }
    if (inMultilineComment) continue;
    
    const { statement, error, annotation, isComment } = parseLine(line, lineNo);

    // Inside an annotation block, treat all content as raw until "#type: end".
    if (annotationBlock) {
      if (annotation?.blockEnd && annotation.type === annotationBlock.type) {
        const content = annotationBlock.lines.join('\n');
        attachAnnotation({ type: annotationBlock.type, content, line: annotationBlock.startLine });
        annotationBlock = null;
      } else {
        annotationBlock.lines.push(line);
      }
      continue;
    }

    // Annotation block begin
    if (annotation?.blockBegin) {
      annotationBlock = { type: annotation.type, startLine: lineNo, lines: [] };
      continue;
    }

    // Inline annotation
    if (annotation) {
      attachAnnotation({ type: annotation.type, content: annotation.content || '', line: lineNo });
      continue;
    }

    if (error) { errors.push(error); continue; }
    if (!statement) {
      if (isComment) continue;
      continue;
    }
    
    // Handle group begin
    if (statement.type === 'group_begin') {
      const newGroup = {
        name: statement.name, type: 'group',
        properties: {}, statements: [], children: [], annotations: [], startLine: lineNo
      };
      
      if (groupStack.length > 0) {
        groupStack[groupStack.length - 1].children.push(newGroup);
      } else {
        ast.groups.push(newGroup);
      }
      groupStack.push(newGroup);

      lastAnnotationTarget = { kind: 'group', group: newGroup };
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
          location: null, exchanges: [], annotations: [], line: lineNo 
        };
      }
      ast._currentExchange = dialogueId;

      lastAnnotationTarget = { kind: 'dialogue', id: dialogueId };
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
      if (statement.type === 'dialogue_decl') {
        lastAnnotationTarget = { kind: 'dialogue', id: statement.dialogueId };
      } else if (statement.type === 'subplot_decl') {
        lastAnnotationTarget = { kind: 'subplot', id: statement.subplotId };
      } else if (statement.type === 'beat_mapping') {
        lastAnnotationTarget = { kind: 'beat', id: statement.beatKey };
      }
      continue;
    }
    
    // Regular statement processing
    if (statement.type === 'statement') {
      statement.annotations = statement.annotations || [];
      processStatement(statement, ast, groupStack, lineNo);
      lastAnnotationTarget = { kind: 'statement', statement };
    }
  }

  if (annotationBlock) {
    errors.push({ line: annotationBlock.startLine, message: `Unclosed annotation block: ${annotationBlock.type}` });
  }
  
  // Check for unclosed groups
  for (const group of groupStack) {
    errors.push({ line: group.startLine, message: `Unclosed group: ${group.name}` });
  }
  
  return { valid: errors.length === 0, errors, warnings, ast };
}

// Note: statement processing and AST extraction helpers are implemented in
// dedicated modules to keep this core module focused and compact.
