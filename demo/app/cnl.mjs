/**
 * SCRIPTA Demo - CNL Generation
 * 
 * Generates CNL (Controlled Natural Language) from story structure.
 */

import { state } from './state.mjs';
import { $, fid } from './utils.mjs';

// Track edit mode state
let isEditMode = false;

export function toggleEditMode() {
  const cnlOutput = $('#cnl-output');
  const cnlEditor = $('#cnl-editor');
  const editBtn = $('#btn-edit-cnl');
  
  if (!cnlOutput || !cnlEditor || !editBtn) return;
  
  isEditMode = !isEditMode;
  
  if (isEditMode) {
    // Switch to edit mode
    cnlEditor.value = cnlOutput.textContent;
    cnlOutput.style.display = 'none';
    cnlEditor.style.display = 'block';
    editBtn.textContent = 'View';
    editBtn.classList.add('btn-edit-active');
    cnlEditor.focus();
  } else {
    // Switch back to view mode
    cnlOutput.textContent = cnlEditor.value;
    cnlEditor.style.display = 'none';
    cnlOutput.style.display = 'block';
    editBtn.textContent = 'Edit';
    editBtn.classList.remove('btn-edit-active');
    
    // TODO: Parse edited CNL and update state
    window.showNotification?.('CNL updated (parsing not yet implemented)', 'info');
  }
}

export function getEditMode() {
  return isEditMode;
}

export function generateCNL() {
  let cnl = `// Auto-generated CNL\n// ${state.project.name}\n// Arc: ${state.project.selectedArc}\n\n`;

  // Global LLM guidance (dual-layer CNL: SVO + #annotations)
  cnl += `#hint: Treat this CNL as a deterministic specification. Do not invent new plot events, characters, or world rules.\n`;
  cnl += `#hint: Use SVO statements as ground truth (WHAT). Use #example/#voice/#subtext/#style annotations to guide prose (HOW).\n`;
  cnl += `#avoid: Adding named entities that are not declared or included in scenes.\n\n`;

  const { characters, locations, objects, moods, emotionalArc, themes, relationships, worldRules, dialogues } = state.project.libraries;
  const { blueprint } = state.project;
  
  // ==================== BLUEPRINT SECTION ====================
  if (blueprint && (blueprint.arc || blueprint.beatMappings.length || blueprint.tensionCurve.length)) {
    cnl += '// === BLUEPRINT ===\n';
    
    if (blueprint.arc) {
      cnl += `Blueprint uses arc ${blueprint.arc}\n\n`;
    }
    
    if (blueprint.beatMappings.length) {
      cnl += '// Beat Mappings\n';
      blueprint.beatMappings.forEach(m => {
        let loc = m.chapterId;
        if (m.sceneId) loc += `.${m.sceneId}`;
        cnl += `Beat ${m.beatKey} mapped to ${loc}\n`;
        if (m.tension) {
          cnl += `${m.beatKey} has tension ${m.tension}\n`;
        }
        if (m.notes) {
          cnl += `${m.beatKey} has note "${m.notes}"\n`;
        }
      });
      cnl += '\n';
    }

    if (emotionalArc.length) {
      cnl += '// Beat Moods\n';
      emotionalArc.forEach(ea => {
        cnl += `${ea.beatKey} has mood ${fid(ea.moodPreset)}\n`;
      });
      cnl += '\n';
    }
    
    if (blueprint.tensionCurve.length) {
      cnl += '// Tension Curve\n';
      blueprint.tensionCurve.forEach(t => {
        cnl += `Tension at ${t.position} is ${t.tension}\n`;
      });
      cnl += '\n';
    }
  }
  
  // ==================== DIALOGUES SECTION ====================
  if (dialogues && dialogues.length) {
    cnl += '// === DIALOGUES ===\n';
    dialogues.forEach(d => {
      const loc = d.location 
        ? `${d.location.chapterId}${d.location.sceneId ? '.' + d.location.sceneId : ''}`
        : 'TBD';
      cnl += `Dialogue ${d.id} at ${loc}\n`;
      
      if (d.purpose) cnl += `${d.id} has purpose ${d.purpose}\n`;
      if (d.tone) cnl += `${d.id} has tone ${d.tone}\n`;
      if (d.tension) cnl += `${d.id} has tension ${d.tension}\n`;
      if (d.beatKey) cnl += `${d.id} linked to beat ${d.beatKey}\n`;
      
      (d.participants || []).forEach(p => {
        const char = characters.find(c => c.id === p.characterId);
        if (char) {
          cnl += `${d.id} involves ${fid(char.name)} as ${p.role}\n`;
        }
      });
      
      if (d.exchanges && d.exchanges.length) {
        cnl += `${d.id} exchange begin\n`;
        d.exchanges.forEach(ex => {
          const speaker = characters.find(c => c.id === ex.speakerId);
          const speakerName = speaker ? fid(speaker.name) : ex.speakerId;
          if (ex.intent) cnl += `  ${speakerName} says intent "${ex.intent}"\n`;
          if (ex.emotion) cnl += `  ${speakerName} says emotion ${ex.emotion}\n`;
          if (ex.sketch) cnl += `  ${speakerName} says sketch "${ex.sketch}"\n`;
        });
        cnl += `${d.id} exchange end\n`;
      }
      cnl += '\n';
    });
  }
  
  // ==================== SUBPLOTS SECTION ====================
  if (blueprint && blueprint.subplots && blueprint.subplots.length) {
    cnl += '// === SUBPLOTS ===\n';
    blueprint.subplots.forEach(s => {
      cnl += `Subplot ${s.id} type ${s.type || 'generic'}\n`;
      
      (s.characterIds || []).forEach(cid => {
        const char = characters.find(c => c.id === cid);
        if (char) {
          cnl += `${s.id} involves ${fid(char.name)}\n`;
        }
      });
      
      if (s.startBeat) cnl += `${s.id} starts at beat ${s.startBeat}\n`;
      if (s.resolveBeat) cnl += `${s.id} resolves at beat ${s.resolveBeat}\n`;
      
      (s.touchpoints || []).forEach(tp => {
        const loc = tp.sceneId ? `${tp.chapterId}.${tp.sceneId}` : tp.chapterId;
        cnl += `${s.id} touchpoint ${loc} event "${tp.event || ''}"\n`;
      });
      cnl += '\n';
    });
  }
  
  // ==================== WORLD RULES ====================
  if (worldRules.length) {
    cnl += '// === WORLD RULES ===\n';
    cnl += 'World is setting\n';
    worldRules.forEach((r, idx) => {
      const rid = `R${idx + 1}`;
      cnl += `${rid} is world_rule\n`;
      cnl += `${rid} has text "${r.name}"\n`;
      if (r.category) cnl += `${rid} has category ${fid(r.category)}\n`;
      if (r.description) {
        cnl += `${rid} has description "${r.description}"\n`;
        cnl += `#hint: Treat this rule as inviolable unless an explicit exception is specified.\n`;
      }
      if (r.scope) cnl += `${rid} applies to ${fid(r.scope)}\n`;
      cnl += `World includes rule ${rid}\n\n`;
    });
    cnl += '\n';
  }
  
  // ==================== CHARACTERS ====================
  if (characters.length) {
    cnl += '// Characters\n';
    characters.forEach(c => {
      cnl += `${fid(c.name)} is ${c.archetype || 'character'}\n`;
      c.traits?.forEach(t => cnl += `${fid(c.name)} has trait ${t}\n`);
    });
    cnl += '\n';
  }
  
  // ==================== RELATIONSHIPS ====================
  if (relationships.length) {
    cnl += '// Relationships\n';
    relationships.forEach(r => {
      const from = characters.find(c => c.id === r.fromId);
      const to = characters.find(c => c.id === r.toId);
      if (from && to) cnl += `${fid(from.name)} relates to ${fid(to.name)} as ${r.type}\n`;
    });
    cnl += '\n';
  }
  
  // ==================== LOCATIONS ====================
  if (locations.length) {
    cnl += '// Locations\n';
    locations.forEach(l => {
      cnl += `${fid(l.name)} is location\n`;
      if (l.geography) cnl += `${fid(l.name)} has geography ${l.geography}\n`;
      if (l.time) cnl += `${fid(l.name)} has era ${l.time}\n`;
      l.characteristics?.forEach(c => cnl += `${fid(l.name)} has characteristic ${c}\n`);
    });
    cnl += '\n';
  }
  
  // ==================== OBJECTS ====================
  if (objects.length) {
    cnl += '// Objects\n';
    objects.forEach(o => {
      cnl += `${fid(o.name)} is ${o.objectType || 'object'}\n`;
      if (o.significance) cnl += `${fid(o.name)} has significance ${o.significance}\n`;
      if (o.ownerId) {
        const owner = characters.find(c => c.id === o.ownerId);
        if (owner) cnl += `${fid(owner.name)} owns ${fid(o.name)}\n`;
      }
    });
    cnl += '\n';
  }
  
  // ==================== MOODS ====================
  if (moods.length) {
    cnl += '// Scene Moods\n';
    moods.forEach(m => {
      cnl += `${fid(m.name)} is mood\n`;
      Object.entries(m.emotions || {}).forEach(([e, i]) => 
        cnl += `${fid(m.name)} has emotion ${e} ${i}\n`
      );
    });
    cnl += '\n';
  }
  
  // ==================== THEMES ====================
  if (themes.length) {
    cnl += '// Themes\n';
    themes.forEach((t, idx) => {
      const role = idx === 0 ? 'primary' : 'secondary';
      cnl += `Story has theme ${fid(t.name)} as ${role}\n`;
    });
    cnl += '\n';
  }
  
  // ==================== WISDOM ====================
  const { wisdom, patterns } = state.project.libraries;
  if (wisdom && wisdom.length) {
    cnl += '// === WISDOM ===\n';
    wisdom.forEach((w, idx) => {
      const wid = `W${idx + 1}`;
      cnl += `${wid} is wisdom\n`;
      cnl += `${wid} has label "${w.label}"\n`;
      if (w.category) cnl += `${wid} has category ${fid(w.category)}\n`;
      if (w.insight) {
        cnl += `${wid} has insight "${w.insight}"\n`;
        cnl += '#hint: Demonstrate wisdom through action and consequence, not lectures.\n';
      }
      if (w.application) cnl += `${wid} has application "${w.application}"\n`;
      if (w.examples) cnl += `${wid} has examples "${w.examples}"\n`;
      cnl += `Story includes wisdom ${wid}\n\n`;
    });
    cnl += '\n';
  }
  
  // ==================== PATTERNS ====================
  if (patterns && patterns.length) {
    cnl += '// === STORY PATTERNS ===\n';
    patterns.forEach((p, idx) => {
      const pid = `P${idx + 1}`;
      cnl += `${pid} is pattern\n`;
      cnl += `${pid} has label "${p.label}"\n`;
      if (p.patternType) {
        cnl += `${pid} has type ${fid(p.patternType)}\n`;
        cnl += '#hint: Patterns constrain plot shape; avoid random twists that break the declared pattern.\n';
      }
      if (p.description) cnl += `${pid} has description "${p.description}"\n`;
      if (p.structure && p.structure.length) cnl += `${pid} has structure "${p.structure.join(' > ')}"\n`;
      if (p.keyQuestion) cnl += `${pid} has key_question "${p.keyQuestion}"\n`;
      if (p.examples) cnl += `${pid} has examples "${p.examples}"\n`;
      cnl += `Story includes pattern ${pid}\n\n`;
    });
    cnl += '\n';
  }
  
  // ==================== STRUCTURE ====================
  if (state.project.structure) {
    cnl += '// Structure\n' + genNodeCNL(state.project.structure, 0);
  }
  
  $('#cnl-output').textContent = cnl;
  return cnl;
}

function genNodeCNL(n, d) {
  const ind = '  '.repeat(d);
  let cnl = '';
  if (['book', 'chapter', 'scene'].includes(n.type)) {
    cnl += `${ind}${fid(n.name)} group begin\n`;
    if (n.title) cnl += `${ind}  ${fid(n.name)} has title "${n.title}"\n`;
    (n.children || []).forEach(c => {
      if (c.type === 'action') {
        const act = c.actionData;
        cnl += `${ind}  ${fid(act.subject)} ${act.action.replace(/_/g, ' ')}${act.target ? ' ' + fid(act.target) : ''}\n`;
      } else if (c.type === 'dialogue' && c.dialogueData) {
        // Inline dialogue node
        const dd = c.dialogueData;
        cnl += `${ind}  // Dialogue: ${dd.purpose || 'dialogue'}\n`;
        if (dd.exchanges && dd.exchanges.length) {
          dd.exchanges.forEach(ex => {
            if (ex.sketch) {
              cnl += `${ind}  ${ex.speakerId || 'Speaker'} says sketch "${ex.sketch}"\n`;
            }
          });
        }
      } else if (c.type === 'dialogue-ref') {
        cnl += `${ind}  ${fid(n.name)} includes dialogue ${c.refId || c.name}\n`;
      } else if (c.type.endsWith('-ref')) {
        cnl += `${ind}  ${fid(n.name)} includes ${c.type.replace('-ref', '')} ${fid(c.name)}\n`;
      } else {
        cnl += genNodeCNL(c, d + 1);
      }
    });
    cnl += `${ind}${fid(n.name)} group end\n`;
  }
  return cnl;
}

export function exportCNL() {
  const cnl = generateCNL();
  const blob = new Blob([cnl], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (state.project.name || 'story').replace(/[^a-z0-9]/gi, '_') + '.cnl';
  a.click();
}

export function importCNL() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.cnl,.txt';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      
      // Update CNL output display
      $('#cnl-output').textContent = text;
      
      // Show success notification
      window.showNotification?.(`Imported: ${file.name}`, 'success');
      
      // TODO: Parse CNL and update state
      // This would require a CNL parser to convert text back to project state
      
    } catch (err) {
      window.showNotification?.('Error importing file: ' + err.message, 'error');
    }
  };
  
  input.click();
}
