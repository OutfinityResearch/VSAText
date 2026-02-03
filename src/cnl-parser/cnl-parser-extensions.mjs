/**
 * SCRIPTA CNL Parser - Extensions
 *
 * Handles blueprint/dialogue/subplot features that sit on top of the core SVO parser.
 * This module is intentionally dependency-light to remain browser-compatible.
 */

import { SUBPLOT_TYPES } from './cnl-parser-grammar.mjs';

function ensureDialogue(ast, id, lineNo) {
  if (!ast.dialogues[id]) {
    ast.dialogues[id] = {
      id,
      purpose: null,
      participants: [],
      tone: null,
      tension: null,
      beatKey: null,
      location: null,
      exchanges: [],
      line: lineNo
    };
  }
  return ast.dialogues[id];
}

function ensureSubplot(ast, id, lineNo) {
  if (!ast.subplots[id]) {
    ast.subplots[id] = {
      id,
      type: null,
      name: id,
      characterIds: [],
      startBeat: null,
      resolveBeat: null,
      touchpoints: [],
      line: lineNo
    };
  }
  return ast.subplots[id];
}

function upsertBeatMapping(ast, beatKey, target, lineNo) {
  const parts = String(target).split('.');
  const mapping = {
    beatKey: beatKey.toLowerCase(),
    chapterId: parts[0],
    sceneId: parts[1] || null,
    tension: null,
    line: lineNo
  };
  const idx = ast.blueprint.beatMappings.findIndex(b => b.beatKey === mapping.beatKey);
  if (idx >= 0) ast.blueprint.beatMappings[idx] = { ...ast.blueprint.beatMappings[idx], ...mapping };
  else ast.blueprint.beatMappings.push(mapping);
}

/**
 * Handle non-SVO “header” lines used by the demo blueprint CNL editor.
 *
 * Returns true if it handled the statement.
 */
export function applyInlineDeclaration(statement, ast, lineNo) {
  if (!statement || !statement.type) return false;

  // Beat midpoint mapped to Ch2.Sc1
  if (statement.type === 'beat_mapping') {
    if (statement.beatKey && statement.target) {
      upsertBeatMapping(ast, statement.beatKey, statement.target, lineNo);
    }
    return true;
  }

  // Tension at 0.5 is 4
  if (statement.type === 'tension_point') {
    if (typeof statement.position === 'number' && typeof statement.tension === 'number') {
      ast.blueprint.tensionCurve.push({ position: statement.position, tension: statement.tension, line: lineNo });
    }
    return true;
  }

  // Dialogue D1 at Ch2.Sc1
  if (statement.type === 'dialogue_decl') {
    const dialogue = ensureDialogue(ast, statement.dialogueId, lineNo);
    if (statement.location) {
      const parts = String(statement.location).split('.');
      dialogue.location = { chapterId: parts[0], sceneId: parts[1] || null };
    }
    return true;
  }

  // Subplot S1 type romance
  if (statement.type === 'subplot_decl') {
    const subplot = ensureSubplot(ast, statement.subplotId, lineNo);
    if (statement.subplotType) {
      subplot.type = statement.subplotType.toLowerCase();
    }
    return true;
  }

  return false;
}

/**
 * Process blueprint, dialogue, and subplot statements (SVO lines).
 *
 * Called from the core parser after generic processing so we can augment AST
 * with structured blueprint/dialogue/subplot data.
 */
export function processBlueprintDialogueSubplot(statement, ast, lineNo) {
  const subjectLower = statement.subject.toLowerCase();

  // === BLUEPRINT ===
  if (subjectLower === 'blueprint' && statement.verb === 'uses') {
    if (statement.objects[0]?.toLowerCase() === 'arc' && statement.objects[1]) {
      ast.blueprint.arc = statement.objects[1].toLowerCase();
    }
    return;
  }

  // Beat midpoint mapped to Ch2.Sc1 (SVO-ish variant)
  if (subjectLower === 'beat' && statement.verb === 'mapped') {
    const beatKey = statement.objects[0];
    const target = statement.modifiers.to;
    if (beatKey && target) {
      upsertBeatMapping(ast, beatKey, target, lineNo);
    }
    return;
  }

  // midpoint has tension 5
  if (statement.verb === 'has' && statement.objects[0]?.toLowerCase() === 'tension') {
    const tension = parseInt(statement.objects[1], 10);
    if (!Number.isNaN(tension)) {
      const idx = ast.blueprint.beatMappings.findIndex(b => b.beatKey === subjectLower);
      if (idx >= 0) {
        ast.blueprint.beatMappings[idx].tension = tension;
        return;
      }
    }
  }

  // Tension at 0.5 is 4
  if (subjectLower === 'tension' && statement.verb === 'is') {
    const position = parseFloat(statement.modifiers.at);
    const tension = parseInt(statement.objects[0], 10);
    if (!Number.isNaN(position) && !Number.isNaN(tension)) {
      ast.blueprint.tensionCurve.push({ position, tension, line: lineNo });
    }
    return;
  }

  // === DIALOGUE ===
  if (subjectLower === 'dialogue' && statement.objects.length >= 1) {
    const dialogueId = statement.objects[0];
    const dialogue = ensureDialogue(ast, dialogueId, lineNo);
    if (statement.modifiers.at) {
      const parts = String(statement.modifiers.at).split('.');
      dialogue.location = { chapterId: parts[0], sceneId: parts[1] || null };
    }
    return;
  }

  if (ast.dialogues[statement.subject]) {
    const dialogue = ast.dialogues[statement.subject];
    if (statement.verb === 'has') {
      const prop = statement.objects[0]?.toLowerCase();
      if (prop === 'purpose') dialogue.purpose = statement.objects[1]?.toLowerCase() || null;
      else if (prop === 'tone') dialogue.tone = statement.objects[1]?.toLowerCase() || null;
      else if (prop === 'tension') dialogue.tension = parseInt(statement.objects[1], 10) || null;
    }
    if (statement.verb === 'involves') {
      dialogue.participants.push({
        characterId: statement.objects[0],
        role: (statement.modifiers.as || 'participant').toLowerCase()
      });
    }
    if (statement.verb === 'linked') {
      dialogue.beatKey = statement.objects[statement.objects.length - 1]?.toLowerCase() || null;
    }
    return;
  }

  if (ast._currentExchange && statement.verb === 'says') {
    const dialogue = ast.dialogues[ast._currentExchange];
    if (dialogue) {
      const speaker = statement.subject;
      const propType = statement.objects[0]?.toLowerCase();
      const propValue = statement.objects.slice(1).join(' ');

      let exchange = dialogue.exchanges.find(e => e.speakerId === speaker && !e._complete);
      if (!exchange) {
        exchange = { speakerId: speaker, intent: null, emotion: null, sketch: null, line: lineNo };
        dialogue.exchanges.push(exchange);
      }

      if (propType === 'intent') exchange.intent = propValue;
      else if (propType === 'emotion') exchange.emotion = propValue;
      else if (propType === 'sketch') { exchange.sketch = propValue; exchange._complete = true; }
    }
    return;
  }

  // === SUBPLOT ===
  if (subjectLower === 'subplot' && statement.objects.length >= 1) {
    const subplotId = statement.objects[0];
    const subplot = ensureSubplot(ast, subplotId, lineNo);
    if (statement.objects.length >= 2 && SUBPLOT_TYPES.has(statement.objects[1]?.toLowerCase())) {
      subplot.type = statement.objects[1].toLowerCase();
    }
    return;
  }

  if (ast.subplots[statement.subject]) {
    const subplot = ast.subplots[statement.subject];
    if (statement.verb === 'has' && statement.objects[0]?.toLowerCase() === 'type') {
      subplot.type = statement.objects[1]?.toLowerCase() || null;
    }
    if (statement.verb === 'involves') subplot.characterIds.push(statement.objects[0]);
    if (statement.verb === 'starts') subplot.startBeat = statement.objects[0]?.toLowerCase() || null;
    if (statement.verb === 'resolves') subplot.resolveBeat = statement.objects[0]?.toLowerCase() || null;
    if (statement.verb === 'touchpoint') {
      const loc = statement.objects[0];
      if (loc) {
        const parts = String(loc).split('.');
        const eventIdx = statement.objects.findIndex(o => String(o).toLowerCase() === 'event');
        subplot.touchpoints.push({
          chapterId: parts[0],
          sceneId: parts[1] || null,
          event: eventIdx >= 0 ? statement.objects.slice(eventIdx + 1).join(' ') : '',
          line: lineNo
        });
      }
    }
  }
}

export default {
  applyInlineDeclaration,
  processBlueprintDialogueSubplot
};
