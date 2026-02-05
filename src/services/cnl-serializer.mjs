/**
 * SCRIPTA SDK - CNL Serializer
 * 
 * Serializes a project object to CNL (Controlled Natural Language) format.
 * This is the canonical way to convert structured story data to CNL.
 * 
 * Portable: works in both browser and Node.js environments.
 */

import { formatId } from '../utils/format.mjs';

/**
 * Serialize a project to CNL format
 * 
 * @param {Object} project - The project object to serialize
 * @param {string} project.name - Project name
 * @param {string} project.selectedArc - Selected narrative arc
 * @param {Object} project.blueprint - Story blueprint
 * @param {Object} project.libraries - Entity libraries
 * @param {Object} project.structure - Story structure tree
 * @returns {string} CNL formatted string
 */
export function serializeToCNL(project) {
  if (!project) return '';
  
  const lines = [];
  
  // Header
  lines.push(`// Auto-generated CNL`);
  lines.push(`// ${project.name || 'Untitled Story'}`);
  lines.push(`// Arc: ${project.selectedArc || 'heros_journey'}`);
  lines.push('');
  
  // Global LLM guidance (dual-layer CNL: SVO + #annotations)
  lines.push(`#hint: Treat this CNL as a deterministic specification. Do not invent new plot events, characters, or world rules.`);
  lines.push(`#hint: Use SVO statements as ground truth (WHAT). Use #example/#voice/#subtext/#style annotations to guide prose (HOW).`);
  lines.push(`#avoid: Adding named entities that are not declared or included in scenes.`);
  lines.push('');
  
  const libraries = project.libraries || {};
  const blueprint = project.blueprint || {};
  
  // Serialize each section
  serializeBlueprint(lines, blueprint, libraries);
  serializeDialogues(lines, libraries.dialogues, libraries.characters);
  serializeSubplots(lines, blueprint.subplots, libraries.characters);
  serializeWorldRules(lines, libraries.worldRules);
  serializeCharacters(lines, libraries.characters);
  serializeRelationships(lines, libraries.relationships, libraries.characters);
  serializeLocations(lines, libraries.locations);
  serializeObjects(lines, libraries.objects, libraries.characters);
  serializeMoods(lines, libraries.moods);
  serializeThemes(lines, libraries.themes);
  serializeWisdom(lines, libraries.wisdom);
  serializePatterns(lines, libraries.patterns);
  serializeStructure(lines, project.structure);
  
  return lines.join('\n');
}

/**
 * Serialize blueprint section
 */
function serializeBlueprint(lines, blueprint, libraries) {
  const { emotionalArc = [] } = libraries;
  
  if (!blueprint.arc && !blueprint.beatMappings?.length && !blueprint.tensionCurve?.length) {
    return;
  }
  
  lines.push('// === BLUEPRINT ===');
  
  if (blueprint.arc) {
    lines.push(`Blueprint uses arc ${blueprint.arc}`);
    lines.push('');
  }
  
  if (blueprint.beatMappings?.length) {
    lines.push('// Beat Mappings');
    blueprint.beatMappings.forEach(m => {
      let loc = m.chapterId;
      if (m.sceneId) loc += `.${m.sceneId}`;
      lines.push(`Beat ${m.beatKey} mapped to ${loc}`);
      if (m.tension) {
        lines.push(`${m.beatKey} has tension ${m.tension}`);
      }
      if (m.notes) {
        lines.push(`${m.beatKey} has note "${m.notes}"`);
      }
    });
    lines.push('');
  }
  
  if (emotionalArc.length) {
    lines.push('// Beat Moods');
    emotionalArc.forEach(ea => {
      lines.push(`${ea.beatKey} has mood ${formatId(ea.moodPreset)}`);
    });
    lines.push('');
  }
  
  if (blueprint.tensionCurve?.length) {
    lines.push('// Tension Curve');
    blueprint.tensionCurve.forEach(t => {
      lines.push(`Tension at ${t.position} is ${t.tension}`);
    });
    lines.push('');
  }
}

/**
 * Serialize dialogues section
 */
function serializeDialogues(lines, dialogues, characters) {
  if (!dialogues?.length) return;
  
  lines.push('// === DIALOGUES ===');
  dialogues.forEach(d => {
    const loc = d.location 
      ? `${d.location.chapterId}${d.location.sceneId ? '.' + d.location.sceneId : ''}`
      : 'TBD';
    lines.push(`Dialogue ${d.id} at ${loc}`);
    
    if (d.purpose) lines.push(`${d.id} has purpose ${d.purpose}`);
    if (d.tone) lines.push(`${d.id} has tone ${d.tone}`);
    if (d.tension) lines.push(`${d.id} has tension ${d.tension}`);
    if (d.beatKey) lines.push(`${d.id} linked to beat ${d.beatKey}`);
    
    (d.participants || []).forEach(p => {
      const char = characters?.find(c => c.id === p.characterId);
      if (char) {
        lines.push(`${d.id} involves ${formatId(char.name)} as ${p.role}`);
      }
    });
    
    if (d.exchanges?.length) {
      lines.push(`${d.id} exchange begin`);
      d.exchanges.forEach(ex => {
        const speaker = characters?.find(c => c.id === ex.speakerId);
        const speakerName = speaker ? formatId(speaker.name) : ex.speakerId;
        if (ex.intent) lines.push(`  ${speakerName} says intent "${ex.intent}"`);
        if (ex.emotion) lines.push(`  ${speakerName} says emotion ${ex.emotion}`);
        if (ex.sketch) lines.push(`  ${speakerName} says sketch "${ex.sketch}"`);
      });
      lines.push(`${d.id} exchange end`);
    }
    lines.push('');
  });
}

/**
 * Serialize subplots section
 */
function serializeSubplots(lines, subplots, characters) {
  if (!subplots?.length) return;
  
  lines.push('// === SUBPLOTS ===');
  subplots.forEach(s => {
    lines.push(`Subplot ${s.id} type ${s.type || 'generic'}`);
    
    (s.characterIds || []).forEach(cid => {
      const char = characters?.find(c => c.id === cid);
      if (char) {
        lines.push(`${s.id} involves ${formatId(char.name)}`);
      }
    });
    
    if (s.startBeat) lines.push(`${s.id} starts at beat ${s.startBeat}`);
    if (s.resolveBeat) lines.push(`${s.id} resolves at beat ${s.resolveBeat}`);
    
    (s.touchpoints || []).forEach(tp => {
      const loc = tp.sceneId ? `${tp.chapterId}.${tp.sceneId}` : tp.chapterId;
      lines.push(`${s.id} touchpoint ${loc} event "${tp.event || ''}"`);
    });
    lines.push('');
  });
}

/**
 * Serialize world rules section
 */
function serializeWorldRules(lines, worldRules) {
  if (!worldRules?.length) return;
  
  lines.push('// === WORLD RULES ===');
  lines.push('World is setting');
  worldRules.forEach((r, idx) => {
    const rid = `R${idx + 1}`;
    lines.push(`${rid} is world_rule`);
    lines.push(`${rid} has text "${r.name}"`);
    if (r.category) lines.push(`${rid} has category ${formatId(r.category)}`);
    if (r.description) {
      lines.push(`${rid} has description "${r.description}"`);
      lines.push(`#hint: Treat this rule as inviolable unless an explicit exception is specified.`);
    }
    if (r.scope) lines.push(`${rid} applies to ${formatId(r.scope)}`);
    lines.push(`World includes rule ${rid}`);
    lines.push('');
  });
  lines.push('');
}

/**
 * Serialize characters section
 */
function serializeCharacters(lines, characters) {
  if (!characters?.length) return;
  
  lines.push('// Characters');
  characters.forEach(c => {
    lines.push(`${formatId(c.name)} is ${c.archetype || 'character'}`);
    c.traits?.forEach(t => lines.push(`${formatId(c.name)} has trait ${t}`));
  });
  lines.push('');
}

/**
 * Serialize relationships section
 */
function serializeRelationships(lines, relationships, characters) {
  if (!relationships?.length) return;
  
  lines.push('// Relationships');
  relationships.forEach(r => {
    const from = characters?.find(c => c.id === r.fromId);
    const to = characters?.find(c => c.id === r.toId);
    if (from && to) {
      lines.push(`${formatId(from.name)} relates to ${formatId(to.name)} as ${r.type}`);
    }
  });
  lines.push('');
}

/**
 * Serialize locations section
 */
function serializeLocations(lines, locations) {
  if (!locations?.length) return;
  
  lines.push('// Locations');
  locations.forEach(l => {
    lines.push(`${formatId(l.name)} is location`);
    if (l.geography) lines.push(`${formatId(l.name)} has geography ${l.geography}`);
    if (l.time) lines.push(`${formatId(l.name)} has era ${l.time}`);
    l.characteristics?.forEach(c => lines.push(`${formatId(l.name)} has characteristic ${c}`));
  });
  lines.push('');
}

/**
 * Serialize objects section
 */
function serializeObjects(lines, objects, characters) {
  if (!objects?.length) return;
  
  lines.push('// Objects');
  objects.forEach(o => {
    lines.push(`${formatId(o.name)} is ${o.objectType || 'object'}`);
    if (o.significance) lines.push(`${formatId(o.name)} has significance ${o.significance}`);
    if (o.ownerId) {
      const owner = characters?.find(c => c.id === o.ownerId);
      if (owner) lines.push(`${formatId(owner.name)} owns ${formatId(o.name)}`);
    }
  });
  lines.push('');
}

/**
 * Serialize moods section
 */
function serializeMoods(lines, moods) {
  if (!moods?.length) return;
  
  lines.push('// Scene Moods');
  moods.forEach(m => {
    lines.push(`${formatId(m.name)} is mood`);
    Object.entries(m.emotions || {}).forEach(([e, i]) => 
      lines.push(`${formatId(m.name)} has emotion ${e} ${i}`)
    );
  });
  lines.push('');
}

/**
 * Serialize themes section
 */
function serializeThemes(lines, themes) {
  if (!themes?.length) return;
  
  lines.push('// Themes');
  themes.forEach((t, idx) => {
    const role = idx === 0 ? 'primary' : 'secondary';
    lines.push(`Story has theme ${formatId(t.name)} as ${role}`);
  });
  lines.push('');
}

/**
 * Serialize wisdom section
 */
function serializeWisdom(lines, wisdom) {
  if (!wisdom?.length) return;
  
  lines.push('// === WISDOM ===');
  wisdom.forEach((w, idx) => {
    const wid = `W${idx + 1}`;
    lines.push(`${wid} is wisdom`);
    lines.push(`${wid} has label "${w.label}"`);
    if (w.category) lines.push(`${wid} has category ${formatId(w.category)}`);
    if (w.insight) {
      lines.push(`${wid} has insight "${w.insight}"`);
      lines.push('#hint: Demonstrate wisdom through action and consequence, not lectures.');
    }
    if (w.application) lines.push(`${wid} has application "${w.application}"`);
    if (w.examples) lines.push(`${wid} has examples "${w.examples}"`);
    lines.push(`Story includes wisdom ${wid}`);
    lines.push('');
  });
  lines.push('');
}

/**
 * Serialize patterns section
 */
function serializePatterns(lines, patterns) {
  if (!patterns?.length) return;
  
  lines.push('// === STORY PATTERNS ===');
  patterns.forEach((p, idx) => {
    const pid = `P${idx + 1}`;
    lines.push(`${pid} is pattern`);
    lines.push(`${pid} has label "${p.label}"`);
    if (p.patternType) {
      lines.push(`${pid} has type ${formatId(p.patternType)}`);
      lines.push('#hint: Patterns constrain plot shape; avoid random twists that break the declared pattern.');
    }
    if (p.description) lines.push(`${pid} has description "${p.description}"`);
    if (p.structure?.length) lines.push(`${pid} has structure "${p.structure.join(' > ')}"`);
    if (p.keyQuestion) lines.push(`${pid} has key_question "${p.keyQuestion}"`);
    if (p.examples) lines.push(`${pid} has examples "${p.examples}"`);
    lines.push(`Story includes pattern ${pid}`);
    lines.push('');
  });
  lines.push('');
}

/**
 * Serialize structure section (recursive)
 */
function serializeStructure(lines, structure) {
  if (!structure) return;
  
  lines.push('// Structure');
  lines.push(serializeNode(structure, 0));
}

/**
 * Serialize a single structure node (recursive)
 */
function serializeNode(node, depth) {
  const indent = '  '.repeat(depth);
  let result = '';
  
  if (['book', 'chapter', 'scene'].includes(node.type)) {
    result += `${indent}${formatId(node.name)} group begin\n`;
    if (node.title) {
      result += `${indent}  ${formatId(node.name)} has title "${node.title}"\n`;
    }
    
    (node.children || []).forEach(child => {
      if (child.type === 'action') {
        const act = child.actionData;
        result += `${indent}  ${formatId(act.subject)} ${act.action.replace(/_/g, ' ')}`;
        if (act.target) result += ` ${formatId(act.target)}`;
        result += '\n';
      } else if (child.type === 'dialogue' && child.dialogueData) {
        // Inline dialogue node
        const dd = child.dialogueData;
        result += `${indent}  // Dialogue: ${dd.purpose || 'dialogue'}\n`;
        if (dd.exchanges?.length) {
          dd.exchanges.forEach(ex => {
            if (ex.sketch) {
              result += `${indent}  ${ex.speakerId || 'Speaker'} says sketch "${ex.sketch}"\n`;
            }
          });
        }
      } else if (child.type === 'dialogue-ref') {
        result += `${indent}  ${formatId(node.name)} includes dialogue ${child.refId || child.name}\n`;
      } else if (child.type.endsWith('-ref')) {
        result += `${indent}  ${formatId(node.name)} includes ${child.type.replace('-ref', '')} ${formatId(child.name)}\n`;
      } else {
        result += serializeNode(child, depth + 1);
      }
    });
    
    result += `${indent}${formatId(node.name)} group end\n`;
  }
  
  return result;
}

export default { serializeToCNL };
