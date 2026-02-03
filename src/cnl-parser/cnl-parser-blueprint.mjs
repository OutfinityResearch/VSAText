/**
 * SCRIPTA CNL Parser - Blueprint, Dialogue & Subplot Extensions
 * 
 * Extends the core CNL parser with support for:
 * - Story blueprints (arc selection, beat mappings, tension curves)
 * - Dialogue markers (purpose, participants, exchanges)
 * - Subplots (types, character involvement, touchpoints)
 */

import { DIALOGUE_PURPOSES, DIALOGUE_TONES, SUBPLOT_TYPES } from './cnl-parser-core.mjs';

/**
 * Initialize blueprint/dialogue/subplot structures in AST
 * @param {Object} ast - The AST object to extend
 */
export function initBlueprintAST(ast) {
  ast.blueprint = {
    arc: null,
    beatMappings: [],
    tensionCurve: []
  };
  ast.dialogues = {};
  ast.subplots = {};
  ast._currentExchange = null;
}

/**
 * Process blueprint-related statements
 * @param {Object} statement - Parsed statement
 * @param {Object} ast - AST object
 * @param {number} lineNo - Line number
 * @returns {boolean} - True if statement was processed
 */
export function processBlueprintStatement(statement, ast, lineNo) {
  const subjectLower = statement.subject.toLowerCase();
  
  // Blueprint uses arc: "Blueprint uses arc three_act"
  if (subjectLower === 'blueprint' && statement.verb === 'uses') {
    if (statement.objects[0]?.toLowerCase() === 'arc' && statement.objects[1]) {
      ast.blueprint.arc = statement.objects[1].toLowerCase();
      return true;
    }
  }
  
  // Beat mapping: "Beat midpoint mapped to Ch2.Sc1"
  if (subjectLower === 'beat' && statement.verb === 'mapped') {
    const beatKey = statement.objects[0];
    const target = statement.modifiers.to;
    if (beatKey && target) {
      const parts = target.split('.');
      const mapping = {
        beatKey: beatKey.toLowerCase(),
        chapterId: parts[0],
        sceneId: parts[1] || null,
        tension: null,
        notes: null,
        line: lineNo
      };
      const existingIdx = ast.blueprint.beatMappings.findIndex(b => b.beatKey === mapping.beatKey);
      if (existingIdx >= 0) {
        ast.blueprint.beatMappings[existingIdx] = { ...ast.blueprint.beatMappings[existingIdx], ...mapping };
      } else {
        ast.blueprint.beatMappings.push(mapping);
      }
      return true;
    }
  }
  
  // Beat tension: "midpoint has tension 5" (after "Beat midpoint mapped...")
  if (statement.verb === 'has' && statement.objects[0]?.toLowerCase() === 'tension' && 
      ast.blueprint.beatMappings.some(b => b.beatKey === subjectLower)) {
    const tension = parseInt(statement.objects[1]);
    if (!isNaN(tension)) {
      const existingIdx = ast.blueprint.beatMappings.findIndex(b => b.beatKey === subjectLower);
      if (existingIdx >= 0) {
        ast.blueprint.beatMappings[existingIdx].tension = tension;
      }
      return true;
    }
  }
  
  // Tension curve: "Tension at 0.25 is 3"
  if (subjectLower === 'tension' && statement.verb === 'is') {
    const position = parseFloat(statement.modifiers.at);
    const tension = parseInt(statement.objects[0]);
    if (!isNaN(position) && !isNaN(tension)) {
      ast.blueprint.tensionCurve.push({ position, tension, line: lineNo });
      return true;
    }
  }
  
  return false;
}

/**
 * Process dialogue-related statements
 * @param {Object} statement - Parsed statement
 * @param {Object} ast - AST object
 * @param {number} lineNo - Line number
 * @returns {boolean} - True if statement was processed
 */
export function processDialogueStatement(statement, ast, lineNo) {
  const subjectLower = statement.subject.toLowerCase();
  
  // Ensure dialogue helper
  const ensureDialogue = (id) => {
    if (!ast.dialogues[id]) {
      ast.dialogues[id] = {
        id, purpose: null, participants: [],
        tone: null, tension: null, beatKey: null,
        location: null, exchanges: [], line: lineNo
      };
    }
    return ast.dialogues[id];
  };
  
  // "Dialogue D1 at Ch2.Sc1"
  if (subjectLower === 'dialogue' && statement.objects.length >= 1) {
    const dialogueId = statement.objects[0];
    const dialogue = ensureDialogue(dialogueId);
    const location = statement.modifiers.at;
    if (location) {
      const parts = location.split('.');
      dialogue.location = { chapterId: parts[0], sceneId: parts[1] || null };
    }
    return true;
  }
  
  // Check if subject is a known dialogue
  if (ast.dialogues[statement.subject]) {
    const dialogue = ast.dialogues[statement.subject];
    
    // "D1 has purpose reveal"
    if (statement.verb === 'has') {
      const propType = statement.objects[0]?.toLowerCase();
      const propValue = statement.objects[1];
      
      if (propType === 'purpose' && propValue) {
        dialogue.purpose = propValue.toLowerCase();
        return true;
      }
      if (propType === 'tone' && propValue) {
        dialogue.tone = propValue.toLowerCase();
        return true;
      }
      if (propType === 'tension' && propValue) {
        dialogue.tension = parseInt(propValue) || null;
        return true;
      }
    }
    
    // "D1 involves Mentor as speaker"
    if (statement.verb === 'involves') {
      const characterId = statement.objects[0];
      const role = statement.modifiers.as || 'participant';
      dialogue.participants.push({ characterId, role: role.toLowerCase() });
      return true;
    }
    
    // "D1 linked to beat inciting_incident"
    if (statement.verb === 'linked') {
      if (statement.modifiers.to === 'beat' && statement.objects.length > 0) {
        dialogue.beatKey = statement.objects[statement.objects.length - 1].toLowerCase();
      } else if (statement.objects[0]?.toLowerCase() === 'beat') {
        dialogue.beatKey = statement.objects[1]?.toLowerCase();
      }
      return true;
    }
  }
  
  // Exchange line: "Mentor says intent 'dezvăluie adevărul'" (inside exchange block)
  if (ast._currentExchange && statement.verb === 'says') {
    const dialogue = ast.dialogues[ast._currentExchange];
    if (dialogue) {
      const speaker = statement.subject;
      const propType = statement.objects[0]?.toLowerCase();
      const propValue = statement.objects.slice(1).join(' ');
      
      // Find or create exchange entry for this speaker
      let exchange = dialogue.exchanges.find(e => e.speakerId === speaker && !e._complete);
      if (!exchange) {
        exchange = { speakerId: speaker, intent: null, emotion: null, sketch: null, line: lineNo };
        dialogue.exchanges.push(exchange);
      }
      
      if (propType === 'intent') exchange.intent = propValue;
      else if (propType === 'emotion') exchange.emotion = propValue;
      else if (propType === 'sketch') {
        exchange.sketch = propValue;
        exchange._complete = true;
      }
      return true;
    }
  }
  
  return false;
}

/**
 * Process subplot-related statements
 * @param {Object} statement - Parsed statement
 * @param {Object} ast - AST object
 * @param {number} lineNo - Line number
 * @returns {boolean} - True if statement was processed
 */
export function processSubplotStatement(statement, ast, lineNo) {
  const subjectLower = statement.subject.toLowerCase();
  
  // Ensure subplot helper
  const ensureSubplot = (id) => {
    if (!ast.subplots[id]) {
      ast.subplots[id] = {
        id, type: null, name: id,
        characterIds: [], startBeat: null, resolveBeat: null,
        touchpoints: [], line: lineNo
      };
    }
    return ast.subplots[id];
  };
  
  // "Subplot S1 type romance"
  if (subjectLower === 'subplot' && statement.objects.length >= 1) {
    const subplotId = statement.objects[0];
    const subplot = ensureSubplot(subplotId);
    
    // Look for type in objects
    if (statement.objects.length >= 2) {
      const typeWord = statement.objects[1]?.toLowerCase();
      if (typeWord === 'type' && statement.objects[2]) {
        subplot.type = statement.objects[2].toLowerCase();
      } else if (SUBPLOT_TYPES.has(typeWord)) {
        subplot.type = typeWord;
      }
    }
    return true;
  }
  
  // Check if subject is a known subplot
  if (ast.subplots[statement.subject]) {
    const subplot = ast.subplots[statement.subject];
    
    // "S1 has type romance"
    if (statement.verb === 'has' && statement.objects[0]?.toLowerCase() === 'type') {
      subplot.type = statement.objects[1]?.toLowerCase();
      return true;
    }
    
    // "S1 involves Hero"
    if (statement.verb === 'involves') {
      subplot.characterIds.push(statement.objects[0]);
      return true;
    }
    
    // "S1 starts at beat midpoint"
    if (statement.verb === 'starts') {
      const atValue = statement.modifiers.at;
      if (atValue === 'beat' && statement.objects.length > 0) {
        subplot.startBeat = statement.objects[0]?.toLowerCase();
      } else if (statement.objects[0]?.toLowerCase() === 'beat') {
        subplot.startBeat = statement.objects[1]?.toLowerCase();
      }
      return true;
    }
    
    // "S1 resolves at beat resolution"
    if (statement.verb === 'resolves') {
      const atValue = statement.modifiers.at;
      if (atValue === 'beat' && statement.objects.length > 0) {
        subplot.resolveBeat = statement.objects[0]?.toLowerCase();
      } else if (statement.objects[0]?.toLowerCase() === 'beat') {
        subplot.resolveBeat = statement.objects[1]?.toLowerCase();
      }
      return true;
    }
    
    // "S1 touchpoint Ch2.Sc1 event 'first meeting'"
    if (statement.verb === 'touchpoint') {
      const location = statement.objects[0];
      const eventIdx = statement.objects.findIndex(o => o.toLowerCase() === 'event');
      const eventDesc = eventIdx >= 0 ? statement.objects.slice(eventIdx + 1).join(' ') : '';
      
      if (location) {
        const parts = location.split('.');
        subplot.touchpoints.push({
          chapterId: parts[0],
          sceneId: parts[1] || null,
          event: eventDesc,
          line: lineNo
        });
      }
      return true;
    }
  }
  
  return false;
}

/**
 * Handle exchange begin statement
 * @param {Object} statement - Statement with type 'exchange_begin'
 * @param {Object} ast - AST object
 * @param {number} lineNo - Line number
 */
export function handleExchangeBegin(statement, ast, lineNo) {
  const dialogueId = statement.dialogueId;
  if (!ast.dialogues[dialogueId]) {
    ast.dialogues[dialogueId] = {
      id: dialogueId, purpose: null, participants: [],
      tone: null, tension: null, beatKey: null,
      location: null, exchanges: [], line: lineNo
    };
  }
  ast._currentExchange = dialogueId;
}

/**
 * Handle exchange end statement
 * @param {Object} statement - Statement with type 'exchange_end'
 * @param {Object} ast - AST object
 * @returns {Object|null} - Error object if mismatch, null otherwise
 */
export function handleExchangeEnd(statement, ast, lineNo) {
  if (ast._currentExchange !== statement.dialogueId) {
    return { line: lineNo, message: `Mismatched exchange end: expected "${ast._currentExchange}", got "${statement.dialogueId}"` };
  }
  ast._currentExchange = null;
  return null;
}

/**
 * Extract blueprint from AST
 * @param {Object} ast - Parsed AST
 * @returns {Object} - Blueprint object
 */
export function extractBlueprint(ast) {
  return ast.blueprint || { arc: null, beatMappings: [], tensionCurve: [] };
}

/**
 * Extract dialogues from AST
 * @param {Object} ast - Parsed AST
 * @returns {Array} - Array of dialogue objects
 */
export function extractDialogues(ast) {
  return Object.values(ast.dialogues || {}).map(d => {
    const { _complete, ...exchanges } = d.exchanges || [];
    return {
      ...d,
      exchanges: d.exchanges?.map(e => {
        const { _complete, ...rest } = e;
        return rest;
      }) || []
    };
  });
}

/**
 * Extract subplots from AST
 * @param {Object} ast - Parsed AST
 * @returns {Array} - Array of subplot objects
 */
export function extractSubplots(ast) {
  return Object.values(ast.subplots || {});
}
