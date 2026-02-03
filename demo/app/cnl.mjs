/**
 * SCRIPTA Demo - CNL Generation
 * 
 * Generates CNL (Controlled Natural Language) from story structure.
 */

import { state } from './state.mjs';
import { $, fid } from './utils.mjs';

export function generateCNL() {
  let cnl = `// Auto-generated CNL\n// ${state.project.name}\n// Arc: ${state.project.selectedArc}\n\n`;
  const { characters, locations, objects, moods, emotionalArc, themes, relationships, worldRules } = state.project.libraries;
  
  if (worldRules.length) {
    cnl += '// World Rules\n';
    worldRules.forEach(r => {
      cnl += `World has rule ${fid(r.name)}\n`;
      cnl += `${fid(r.name)} has category ${r.category}\n`;
      if (r.description) cnl += `${fid(r.name)} has description "${r.description}"\n`;
      if (r.scope) cnl += `${fid(r.name)} applies to ${fid(r.scope)}\n`;
    });
    cnl += '\n';
  }
  
  if (characters.length) {
    cnl += '// Characters\n';
    characters.forEach(c => {
      cnl += `${fid(c.name)} is ${c.archetype || 'character'}\n`;
      c.traits?.forEach(t => cnl += `${fid(c.name)} has trait ${t}\n`);
    });
    cnl += '\n';
  }
  
  if (relationships.length) {
    cnl += '// Relationships\n';
    relationships.forEach(r => {
      const from = characters.find(c => c.id === r.fromId);
      const to = characters.find(c => c.id === r.toId);
      if (from && to) cnl += `${fid(from.name)} ${r.type.replace(/_/g, ' ')} ${fid(to.name)}\n`;
    });
    cnl += '\n';
  }
  
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
  
  if (moods.length) {
    cnl += '// Scene Moods\n';
    moods.forEach(m => {
      cnl += `${fid(m.name)} is mood\n`;
      Object.entries(m.emotions || {}).forEach(([e, i]) => 
        cnl += `${fid(m.name)} has emotion ${e} intensity ${i}\n`
      );
    });
    cnl += '\n';
  }
  
  if (emotionalArc.length) {
    cnl += '// Emotional Arc\n';
    emotionalArc.forEach(ea => {
      cnl += `Story beat ${ea.beatKey} has mood ${ea.moodPreset}\n`;
    });
    cnl += '\n';
  }
  
  if (themes.length) {
    cnl += '// Themes\n';
    themes.forEach(t => { cnl += `Story has theme ${fid(t.name)}\n`; });
    cnl += '\n';
  }
  
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
