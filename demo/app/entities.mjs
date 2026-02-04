/**
 * SCRIPTA Demo - Entity Management
 * 
 * Entity grids, forms, and editors.
 */

import { state } from './state.mjs';
import { $, $$, genId, openModal, closeModal, pick } from './utils.mjs';
import { addChild, findNode, renderTree, getUsedBlocks } from './tree.mjs';
import { generateCNL } from './cnl.mjs';
import { renderRelationshipsView } from './views.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';

// ==================== ENTITY DESCRIPTIONS ====================
const ENTITY_DESCRIPTIONS = {
  characters: {
    title: 'Characters',
    description: 'The people who drive your story. Each character has an archetype (Hero, Mentor, Shadow, etc.) that defines their narrative role, plus traits that make them unique. Characters create conflict, relationships, and emotional connection.'
  },
  locations: {
    title: 'Locations',
    description: 'The places where your story unfolds. Locations set the mood and atmosphere, provide context for actions, and can become characters themselves. Define geography, time period, and distinctive characteristics.'
  },
  objects: {
    title: 'Objects & Plot Elements',
    description: 'Items with narrative significance: artifacts, secrets, MacGuffins, or symbolic objects. These drive plot, reveal character, or represent themes. Not every prop—only objects that matter to the story.'
  },
  moods: {
    title: 'Moods & Atmospheres',
    description: 'The emotional tone of scenes. Moods combine emotions (fear, hope, tension) with intensities. They guide how scenes feel and help create rhythm through contrast—tension followed by relief, mystery into revelation.'
  },
  themes: {
    title: 'Themes',
    description: 'The deeper meanings your story explores: redemption, sacrifice, identity, power. Themes are woven through character choices and plot outcomes, never stated directly. They give your story resonance beyond plot.'
  }
};

// ==================== ENTITY GRIDS ====================
export function renderEntityGrid(type) {
  const c = $(`#${type}-grid`);
  if (!c) return;
  const list = state.project.libraries[type];
  const desc = ENTITY_DESCRIPTIONS[type];
  
  // Build description header
  let descHtml = '';
  if (desc) {
    descHtml = `<div class="entity-grid-header">
      <div class="entity-grid-title">${desc.title}</div>
      <div class="entity-grid-desc">${desc.description}</div>
    </div>`;
  }
  
  if (list.length === 0) {
    c.innerHTML = descHtml + `<div class="entity-grid-cards"><div class="add-entity-card" onclick="addEntity('${type}')"><div class="icon">+</div><span>Add ${type.slice(0, -1)}</span></div></div>`;
    return;
  }
  
  let cards = list.map(e => {
    let tags = '';
    if (e.traits?.length) {
      tags = `<div class="entity-tags">${e.traits.slice(0, 4).map(t => `<span class="entity-tag">${t}</span>`).join('')}</div>`;
    }
    if (e.emotions && typeof e.emotions === 'object') {
      const emotionList = Object.entries(e.emotions).slice(0, 3).map(([k, v]) => `<span class="entity-tag">${k}:${v}</span>`);
      tags = `<div class="entity-tags">${emotionList.join('')}</div>`;
    }
    let sub = e.archetype || e.geography || e.objectType || e.themeKey || '';
    const cardType = type === 'objects' ? 'object' : type.slice(0, -1);
    return `<div class="entity-card ${cardType}" onclick="editEntity('${type}','${e.id}')">
      <div class="entity-name">${e.name}</div><div class="entity-type">${sub}</div>${tags}</div>`;
  }).join('');
  
  cards += `<div class="add-entity-card" onclick="addEntity('${type}')"><div class="icon">+</div><span>Add ${type.slice(0, -1)}</span></div>`;
  c.innerHTML = descHtml + `<div class="entity-grid-cards">${cards}</div>`;
}

window.addEntity = type => { 
  state.editingEntity = null; 
  showEntityForm(type, null); 
};

window.editEntity = (type, id) => { 
  state.editingEntity = id; 
  showEntityForm(type, state.project.libraries[type].find(e => e.id === id)); 
};

window.deleteEntity = (type, id) => {
  const entity = state.project.libraries[type].find(e => e.id === id);
  if (!entity || !confirm(`Delete "${entity.name}"?`)) return;
  state.project.libraries[type] = state.project.libraries[type].filter(e => e.id !== id);
  removeEntityRefs(state.project.structure, id);
  closeModal('entity-modal');
  renderEntityGrid(type);
  renderTree();
};

function removeEntityRefs(node, refId) {
  if (!node) return;
  if (node.children) {
    node.children = node.children.filter(c => c.refId !== refId);
    node.children.forEach(c => removeEntityRefs(c, refId));
  }
}

// ==================== ENTITY FORMS ====================
function showEntityForm(type, e) {
  const isEdit = !!e;
  $('#modal-title').textContent = (isEdit ? 'Edit ' : 'Add ') + type.slice(0, -1);
  let html = '';
  
  if (isEdit) {
    html += `<div style="display:flex;justify-content:flex-end;margin-bottom:0.8rem;">
      <button class="btn danger" onclick="deleteEntity('${type}','${e.id}')">Delete</button></div>`;
  }
  
  if (type === 'characters') {
    html += `<div class="form-group"><label class="form-label">Name</label><input class="form-input" id="e-name" value="${e?.name || pick(VOCAB.NAMES.characters)}"></div>
      <div class="form-group"><label class="form-label">Archetype</label>
      <select class="form-select" id="e-archetype">${Object.entries(VOCAB.CHARACTER_ARCHETYPES).map(([k, v]) => `<option value="${k}" ${e?.archetype === k ? 'selected' : ''}>${v.label} - ${v.desc}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Traits</label>
      <div class="chip-select" id="e-traits">${renderTraitChips(e?.traits || [])}</div></div>`;
  }
  
  if (type === 'locations') {
    html += `<div class="form-group"><label class="form-label">Name</label><input class="form-input" id="e-name" value="${e?.name || pick(VOCAB.NAMES.locations)}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Geography</label>
        <select class="form-select" id="e-geography">${Object.entries(VOCAB.LOCATION_GEOGRAPHY).map(([k, v]) => `<option value="${k}" ${e?.geography === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Time Period</label>
        <select class="form-select" id="e-time">${Object.entries(VOCAB.LOCATION_TIME).map(([k, v]) => `<option value="${k}" ${e?.time === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
      </div>
      <div class="form-group"><label class="form-label">Characteristics</label>
      <div class="chip-select" id="e-chars">${renderLocationChips(e?.characteristics || [])}</div></div>`;
  }
  
  if (type === 'objects') {
    html += `<div class="form-group"><label class="form-label">Name</label><input class="form-input" id="e-name" value="${e?.name || pick(VOCAB.NAMES.objects)}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Type</label>
        <select class="form-select" id="e-objectType">${Object.entries(VOCAB.OBJECT_TYPES).map(([k, v]) => `<option value="${k}" ${e?.objectType === k ? 'selected' : ''}>${v.icon} ${v.label}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Significance</label>
        <select class="form-select" id="e-significance">${Object.entries(VOCAB.OBJECT_SIGNIFICANCE).map(([k, v]) => `<option value="${k}" ${e?.significance === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
      </div>
      <div class="form-group"><label class="form-label">Owner</label>
      <select class="form-select" id="e-owner"><option value="">-- None --</option>
      ${state.project.libraries.characters.map(c => `<option value="${c.id}" ${e?.ownerId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>`;
  }
  
  if (type === 'moods') {
    html += renderMoodBuilder(e);
  }
  
  if (type === 'themes') {
    html += `<div class="form-group"><label class="form-label">Select Theme</label>
      <div id="e-themes" class="entity-grid">${Object.entries(VOCAB.THEMES).map(([k, v]) => `<div class="entity-card ${e?.themeKey === k ? 'selected' : ''}" onclick="selectTheme('${k}')" data-key="${k}" style="margin-bottom:0.4rem;${e?.themeKey === k ? 'border-color:var(--accent-amber);background:rgba(251,133,0,0.1);' : ''}">
        <div class="entity-name">${v.label}</div><div class="entity-type">${v.desc}</div>
        <div class="entity-tags">${v.suggestedBlocks.slice(0, 3).map(b => `<span class="entity-tag">${b}</span>`).join('')}</div></div>`).join('')}</div></div>`;
  }
  
  $('#modal-body').innerHTML = html;
  $('#btn-modal-save').onclick = () => saveEntity(type);
  openModal('entity-modal');
}

function saveEntity(type) {
  const e = state.editingEntity ? state.project.libraries[type].find(x => x.id === state.editingEntity) : { id: genId() };
  
  if (type === 'characters') {
    e.name = $('#e-name').value || 'Character';
    e.archetype = $('#e-archetype').value;
    e.traits = [...$$('#e-traits .chip.selected')].map(c => c.dataset.key);
  }
  if (type === 'locations') {
    e.name = $('#e-name').value || 'Location';
    e.geography = $('#e-geography').value;
    e.time = $('#e-time').value;
    e.characteristics = [...$$('#e-chars .chip.selected')].map(c => c.dataset.key);
  }
  if (type === 'objects') {
    e.name = $('#e-name').value || 'Object';
    e.objectType = $('#e-objectType').value;
    e.significance = $('#e-significance').value;
    e.ownerId = $('#e-owner').value || null;
  }
  if (type === 'moods') {
    e.name = $('#e-mood-name').value || 'Mood';
    e.emotions = {};
    $$('.emotion-chip').forEach(c => {
      const intensity = parseInt(c.dataset.intensity || '0');
      if (intensity > 0) e.emotions[c.dataset.emotion] = intensity;
    });
  }
  if (type === 'themes') {
    const sel = $('#e-themes .entity-card.selected');
    if (!sel) { alert('Select a theme'); return; }
    const k = sel.dataset.key;
    const t = VOCAB.THEMES[k];
    e.name = t.label;
    e.themeKey = k;
  }
  
  if (!state.editingEntity) state.project.libraries[type].push(e);
  closeModal('entity-modal');
  renderEntityGrid(type);
  if (type === 'characters') renderRelationshipsView();
  generateCNL();
}

// ==================== TRAIT/LOCATION CHIPS ====================
function renderTraitChips(selected) {
  const cats = {};
  Object.entries(VOCAB.CHARACTER_TRAITS).forEach(([k, v]) => {
    if (!cats[v.category]) cats[v.category] = [];
    cats[v.category].push({ k, ...v, sel: selected.includes(k) });
  });
  return Object.entries(cats).map(([cat, traits]) => 
    `<div class="chip-category">${cat}</div>` + traits.map(t => `<div class="chip ${t.sel ? 'selected' : ''}" data-key="${t.k}" onclick="toggleChip(this)" title="${t.desc}">${t.label}</div>`).join('')
  ).join('');
}

function renderLocationChips(selected) {
  const cats = {};
  Object.entries(VOCAB.LOCATION_CHARACTERISTICS).forEach(([k, v]) => {
    if (!cats[v.category]) cats[v.category] = [];
    cats[v.category].push({ k, ...v, sel: selected.includes(k) });
  });
  return Object.entries(cats).map(([cat, chars]) => 
    `<div class="chip-category">${cat}</div>` + chars.map(c => `<div class="chip ${c.sel ? 'selected' : ''}" data-key="${c.k}" onclick="toggleChip(this)" title="${c.desc}">${c.label}</div>`).join('')
  ).join('');
}

window.toggleChip = el => el.classList.toggle('selected');
window.selectTheme = k => {
  $$('#e-themes .entity-card').forEach(c => {
    c.classList.remove('selected');
    c.style.borderColor = '';
    c.style.background = '';
  });
  const sel = $(`#e-themes .entity-card[data-key="${k}"]`);
  if (sel) {
    sel.classList.add('selected');
    sel.style.borderColor = 'var(--accent-amber)';
    sel.style.background = 'rgba(251,133,0,0.1)';
  }
};

// ==================== MOOD BUILDER ====================
function renderMoodBuilder(e) {
  const emotions = e?.emotions || {};
  return `<div class="mood-builder">
    <div class="mood-palette">
      <div class="mood-palette-title">Click emotions to add (click again to increase intensity 1-3)</div>
      ${['positive', 'negative', 'mixed'].map(valence => `
        <div style="margin-top:0.5rem;font-size:0.6rem;color:var(--text-faded);text-transform:uppercase;">${valence}</div>
        <div class="emotion-grid">
          ${Object.entries(VOCAB.EMOTIONS).filter(([k, v]) => v.valence === valence).map(([k, v]) => {
            const intensity = emotions[k] || 0;
            return `<div class="emotion-chip ${intensity > 0 ? 'active' : ''}" onclick="toggleEmotion('${k}')" data-emotion="${k}" data-intensity="${intensity}" style="background:${intensity > 0 ? v.color : 'var(--bg-elevated)'}">
              <span>${v.label}</span>
              <div class="intensity">${[1, 2, 3].map(i => `<div class="dot ${intensity >= i ? 'filled' : ''}"></div>`).join('')}</div>
            </div>`;
          }).join('')}
        </div>
      `).join('')}
    </div>
    <div class="mood-preview">
      <div class="mood-palette-title">Your Mood</div>
      <input class="form-input" id="e-mood-name" value="${e?.name || 'Custom Mood'}" placeholder="Mood name">
      <div class="mood-bar" id="mood-bar"></div>
      <div class="mood-palette-title" style="margin-top:0.5rem;">Quick Presets</div>
      <div class="mood-presets">
        ${Object.entries(VOCAB.MOOD_PRESETS).map(([k, v]) => `<div class="mood-preset" onclick="applyMoodPreset('${k}')" style="border-left:3px solid ${v.color}">${v.label}</div>`).join('')}
      </div>
    </div>
  </div>`;
}

window.toggleEmotion = (emotionKey) => {
  const chip = $(`.emotion-chip[data-emotion="${emotionKey}"]`);
  let intensity = parseInt(chip.dataset.intensity || '0');
  intensity = intensity >= 3 ? 0 : intensity + 1;
  chip.dataset.intensity = intensity;
  chip.classList.toggle('active', intensity > 0);
  chip.style.background = intensity > 0 ? VOCAB.EMOTIONS[emotionKey].color : 'var(--bg-elevated)';
  chip.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('filled', intensity >= i + 1);
  });
  updateMoodPreview();
};

window.applyMoodPreset = (presetKey) => {
  const preset = VOCAB.MOOD_PRESETS[presetKey];
  if (!preset) return;
  $$('.emotion-chip').forEach(c => {
    c.dataset.intensity = '0';
    c.classList.remove('active');
    c.style.background = 'var(--bg-elevated)';
    c.querySelectorAll('.dot').forEach(d => d.classList.remove('filled'));
  });
  Object.entries(preset.emotions).forEach(([k, v]) => {
    const chip = $(`.emotion-chip[data-emotion="${k}"]`);
    if (chip) {
      chip.dataset.intensity = v;
      chip.classList.add('active');
      chip.style.background = VOCAB.EMOTIONS[k].color;
      chip.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('filled', v >= i + 1);
      });
    }
  });
  $('#e-mood-name').value = preset.label;
  updateMoodPreview();
};

function updateMoodPreview() {
  const emotions = {};
  $$('.emotion-chip').forEach(c => {
    const intensity = parseInt(c.dataset.intensity || '0');
    if (intensity > 0) emotions[c.dataset.emotion] = intensity;
  });
  const bar = $('#mood-bar');
  if (!bar) return;
  const total = Object.values(emotions).reduce((a, b) => a + b, 0) || 1;
  bar.innerHTML = Object.entries(emotions).map(([k, v]) => {
    const pct = (v / total) * 100;
    return `<div class="mood-bar-segment" style="width:${pct}%;background:${VOCAB.EMOTIONS[k].color}">${k}</div>`;
  }).join('');
}

// ==================== SELECT MODALS ====================
export function showSelectModal(type, parent) {
  const list = state.project.libraries[type];
  $('#select-modal-title').textContent = 'Select ' + type.slice(0, -1);
  if (!list.length) {
    $('#select-modal-body').innerHTML = `<div class="empty-state"><div class="empty-state-text">No ${type} yet</div><div class="empty-state-hint">Create some in the ${type} tab first</div></div>`;
  } else {
    $('#select-modal-body').innerHTML = list.map(e => `<div class="entity-card ${type.slice(0, -1)}" onclick="addRef('${type}','${e.id}','${parent.id}')" style="margin-bottom:0.5rem;">
      <div class="entity-name">${e.name}</div><div class="entity-type">${e.archetype || e.geography || e.objectType || ''}</div></div>`).join('');
  }
  openModal('select-modal');
}

window.addRef = (type, eid, pid) => {
  const e = state.project.libraries[type].find(x => x.id === eid);
  const p = findNode(pid);
  if (!e || !p) return;
  const refType = type === 'objects' ? 'object-ref' : type === 'moods' ? 'mood-ref' : type.slice(0, -1) + '-ref';
  addChild(p, { type: refType, name: e.name, refId: eid });
  closeModal('select-modal');
};

export function showBlockModal(parent) {
  const blocks = Object.entries(VOCAB.NARRATIVE_BLOCKS);
  const usedBlocks = getUsedBlocks();
  $('#select-modal-title').textContent = 'Select Narrative Block';
  const phases = ['opening', 'transition', 'confrontation', 'resolution', 'micro'];
  let html = '';
  phases.forEach(phase => {
    const phaseBlocks = blocks.filter(([k, v]) => v.phase === phase);
    if (phaseBlocks.length) {
      html += `<div style="margin-bottom:0.8rem;"><div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.5rem;border-bottom:1px solid var(--bg-elevated);padding-bottom:0.3rem;">${phase}</div>`;
      html += `<div class="entity-grid">`;
      html += phaseBlocks.map(([k, v]) => {
        const isUsed = usedBlocks.has(k);
        return `<div class="block-card ${isUsed ? 'used' : ''}" onclick="applyBlock('${k}','${parent.id}')">
          <div class="block-name">${v.label}</div>
          <div class="block-desc">${v.desc}</div>
          <div class="block-meta">
            <span class="block-scope">${v.scope}</span>
            ${v.suggestedMoods.slice(0, 2).map(m => `<span class="entity-tag">${m}</span>`).join('')}
          </div>
        </div>`;
      }).join('');
      html += `</div></div>`;
    }
  });
  $('#select-modal-body').innerHTML = html;
  openModal('select-modal');
}

window.applyBlock = (key, pid) => {
  const p = findNode(pid);
  const block = VOCAB.NARRATIVE_BLOCKS[key];
  if (!p || !block) return;
  addChild(p, { type: 'block-ref', name: block.label, blockKey: key });
  closeModal('select-modal');
};

export function showActionModal(parent) {
  const actions = Object.entries(VOCAB.ACTIONS);
  const chars = state.project.libraries.characters;
  if (chars.length === 0) {
    $('#select-modal-title').textContent = 'Add Action';
    $('#select-modal-body').innerHTML = `<div class="empty-state"><div class="empty-state-text">No characters yet</div><div class="empty-state-hint">Create characters first to add actions</div></div>`;
    openModal('select-modal');
    return;
  }
  $('#select-modal-title').textContent = 'Add Action';
  let html = `<div class="form-group"><label class="form-label">Subject</label>
    <select class="form-select" id="action-subject">${chars.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Action</label>
    <select class="form-select" id="action-type">${actions.map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select></div>
    <div class="form-group"><label class="form-label">Target (optional)</label>
    <select class="form-select" id="action-target"><option value="">--</option>${chars.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
    ${state.project.libraries.locations.map(l => `<option value="${l.name}">${l.name} (location)</option>`).join('')}
    ${state.project.libraries.objects.map(o => `<option value="${o.name}">${o.name} (object)</option>`).join('')}</select></div>
    <button class="btn primary" onclick="saveAction('${parent.id}')">Add Action</button>`;
  $('#select-modal-body').innerHTML = html;
  openModal('select-modal');
}

window.saveAction = (pid) => {
  const p = findNode(pid);
  if (!p) return;
  const subject = $('#action-subject').value;
  const action = $('#action-type').value;
  const target = $('#action-target').value;
  addChild(p, { type: 'action', name: `${subject} ${action}`, actionData: { subject, action, target } });
  closeModal('select-modal');
};

export function editNodeProps(n) {
  $('#modal-title').textContent = 'Edit ' + n.type;
  $('#modal-body').innerHTML = `<div class="form-group"><label class="form-label">Name</label><input class="form-input" id="edit-name" value="${n.name || ''}"></div>
    <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="edit-title" value="${n.title || ''}"></div>`;
  $('#btn-modal-save').onclick = () => {
    n.name = $('#edit-name').value || n.name;
    n.title = $('#edit-title').value || '';
    closeModal('entity-modal');
    renderTree();
  };
  openModal('entity-modal');
}
