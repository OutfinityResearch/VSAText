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
import { parseAnnotationLines, annotationsToEditorText } from './cnl-annotations.mjs';

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
    title: 'Objects',
    description: 'Narratively significant items: artifacts, keys, documents, or symbolic objects. They influence scenes, reveal character, and reinforce themes. Focus only on items that matter to the story.'
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

const WORLD_RULE_TEMPLATES = [
  { category: 'society', name: 'Status drives access', description: 'Institutions gate resources and opportunity.' },
  { category: 'technology', name: 'Memory leaves traces', description: 'Actions persist in systems and records.' },
  { category: 'magic', name: 'Power has a cost', description: 'Every extraordinary act demands sacrifice.' },
  { category: 'time', name: 'Deadlines amplify risk', description: 'Delays escalate irreversible consequences.' },
  { category: 'geography', name: 'Borders shape conflict', description: 'Movement rules alter alliances and threat.' }
];

// ==================== ENTITY GRIDS ====================
export function renderEntityGrid(type, containerIdOrOptions = null, maybeOptions = null) {
  let containerId = `${type}-grid`;
  let options = {};

  if (typeof containerIdOrOptions === 'string') {
    containerId = containerIdOrOptions;
    if (maybeOptions && typeof maybeOptions === 'object') options = maybeOptions;
  } else if (
    containerIdOrOptions &&
    typeof containerIdOrOptions === 'object' &&
    !Array.isArray(containerIdOrOptions)
  ) {
    options = containerIdOrOptions;
  }

  const c = $(`#${containerId}`);
  if (!c) return;
  const { includeAddCard = true } = options;
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
    const addCard = includeAddCard
      ? `<div class="add-entity-card" onclick="addEntity('${type}')"><div class="icon">+</div><span>Add ${type.slice(0, -1)}</span></div>`
      : '';
    c.innerHTML = descHtml + `<div class="entity-grid-cards">${addCard}</div>`;
    return;
  }
  
  let cards = list.map(e => {
    let tags = '';
    if (e.traits?.length) {
      const displayTraits = e.traits.slice(0, 4);
      const moreCount = e.traits.length - 4;
      tags = `<div class="entity-tags">${displayTraits.map(t => `<span class="entity-tag">${t}</span>`).join('')}${moreCount > 0 ? `<span class="entity-tag more">+${moreCount}</span>` : ''}</div>`;
    }
    if (e.emotions && typeof e.emotions === 'object') {
      const emotionList = Object.entries(e.emotions).slice(0, 3).map(([k, v]) => `<span class="entity-tag">${k}:${v}</span>`);
      tags = `<div class="entity-tags">${emotionList.join('')}</div>`;
    }
    if (type === 'locations' && Array.isArray(e.characteristics) && e.characteristics.length) {
      const displayChars = e.characteristics.slice(0, 4).map(c => humanizeLabel(c));
      const moreCount = e.characteristics.length - 4;
      tags = `<div class="entity-tags">${displayChars.map(c => `<span class="entity-tag">${c}</span>`).join('')}${moreCount > 0 ? `<span class="entity-tag more">+${moreCount}</span>` : ''}</div>`;
    }
    let sub = e.archetype || e.geography || e.objectType || e.themeKey || '';
    if (type === 'locations') {
      const geo = e.geography ? humanizeLabel(e.geography) : '';
      const era = e.time ? humanizeLabel(e.time) : '';
      sub = [geo, era].filter(Boolean).join(' • ') || 'Location';
    }
    const cardType = type === 'objects' ? 'object' : type.slice(0, -1);
    const quickDelete = (type === 'characters' || type === 'locations' || type === 'objects')
      ? `<button class="entity-delete-btn" type="button" title="Delete" onclick="event.stopPropagation(); window.deleteEntity('${type}','${e.id}')">×</button>`
      : '';
    return `<div class="entity-card ${cardType}" onclick="editEntity('${type}','${e.id}')">
      ${quickDelete}
      <div class="entity-name">${e.name}</div><div class="entity-type">${sub}</div>${tags}</div>`;
  }).join('');
  
  if (includeAddCard) {
    cards += `<div class="add-entity-card" onclick="addEntity('${type}')"><div class="icon">+</div><span>Add ${type.slice(0, -1)}</span></div>`;
  }
  c.innerHTML = descHtml + `<div class="entity-grid-cards">${cards}</div>`;
}

export function renderBackdropView() {
  const container = $('#backdrop-view');
  if (!container) return;

  container.innerHTML = `
    <div class="view-description-header">
      <div class="view-description-title">Backdrop</div>
      <div class="view-description-text">
        In literary writing, backdrop means the story setting: place, time, and meaningful objects that shape atmosphere, conflict, and character choices.
      </div>
    </div>
    <div class="backdrop-layout">
      <section class="backdrop-section">
        <div class="backdrop-section-header">
          <h3>Locations (Place & Time)</h3>
          <button class="btn small" type="button" onclick="window.addEntity('locations')">+ Add Location</button>
        </div>
        <div class="backdrop-section-note">Define place, geography, atmosphere, and era/time period for scene context.</div>
        <div class="entity-grid" id="backdrop-locations-grid"></div>
      </section>
      <section class="backdrop-section">
        <div class="backdrop-section-header">
          <h3>Story Objects</h3>
          <button class="btn small" type="button" onclick="window.addEntity('objects')">+ Add Object</button>
        </div>
        <div class="backdrop-section-note">Track story-relevant artifacts, tools, keys, and symbolic items.</div>
        <div class="entity-grid" id="backdrop-objects-grid"></div>
      </section>
      <section class="backdrop-section">
        <div class="backdrop-section-header">
          <h3>World Rules</h3>
          <button class="btn small" type="button" onclick="window.addWorldRule()">+ Add World Rule</button>
        </div>
        <div class="backdrop-section-note">Define social, magical, technological, and physical constraints that govern the world.</div>
        <div class="rules-grid-cards" id="backdrop-worldrules-grid"></div>
      </section>
    </div>
  `;

  renderEntityGrid('locations', 'backdrop-locations-grid', { includeAddCard: false });
  renderEntityGrid('objects', 'backdrop-objects-grid', { includeAddCard: false });
  renderBackdropWorldRules();
}

function renderBackdropWorldRules() {
  const container = $('#backdrop-worldrules-grid');
  if (!container) return;

  const rules = state.project.libraries.worldRules || [];
  let cardsHtml = '';

  if (rules.length > 0) {
    rules.forEach(r => {
      cardsHtml += `
        <div class="rule-card" onclick="window.editWorldRule('${r.id}')">
          <div class="rule-category">${r.category}</div>
          <div class="rule-name">${r.name}</div>
          <div class="rule-desc">${r.description}</div>
          ${r.scope ? `<div class="rule-scope">Applies to: ${r.scope}</div>` : ''}
        </div>
      `;
    });
  }

  const suggestedHtml = WORLD_RULE_TEMPLATES.map((tpl, idx) => `
    <div class="rule-card suggested" data-world-template="${idx}">
      <div class="rule-category">${humanizeLabel(tpl.category)}</div>
      <div class="rule-name">${tpl.name}</div>
      <div class="rule-desc">${tpl.description}</div>
      <div class="rule-scope">Template</div>
    </div>
  `).join('');

  container.innerHTML = cardsHtml + suggestedHtml;

  container.querySelectorAll('[data-world-template]').forEach((el) => {
    el.addEventListener('click', () => {
      const index = Number(el.getAttribute('data-world-template'));
      const template = WORLD_RULE_TEMPLATES[index];
      if (template) {
        window.addWorldRuleFromTemplate?.(template);
      }
    });
  });
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
  if (type === 'locations' || type === 'objects') window.renderBackdropView?.();
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
  
  if (type === 'characters') {
    html += `<div class="form-group"><label class="form-label">Name</label><input class="form-input" id="e-name" value="${e?.name || pick(VOCAB.NAMES.characters)}"></div>
      <div class="form-group"><label class="form-label">Archetype</label>
      <select class="form-select" id="e-archetype">${Object.entries(VOCAB.CHARACTER_ARCHETYPES).map(([k, v]) => `<option value="${k}" ${e?.archetype === k ? 'selected' : ''}>${v.label} - ${v.desc}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Arc Type</label>
      <select class="form-select" id="e-arcType">
        <option value="positive" ${e?.arcType === 'positive' ? 'selected' : ''}>Positive - Character grows and improves</option>
        <option value="negative" ${e?.arcType === 'negative' ? 'selected' : ''}>Negative - Character corrupts or declines</option>
        <option value="flat" ${e?.arcType === 'flat' ? 'selected' : ''}>Flat - Character inspires change in others</option>
      </select></div>
      <div class="form-group"><label class="form-label">Traits</label>
      <div class="chip-select" id="e-traits">${renderTraitChips(e?.traits || [])}</div></div>
      <div class="form-group"><label class="form-label">Physical Description</label>
      <textarea class="form-textarea" id="e-description" rows="3" placeholder="Describe the character's appearance...">${e?.description || ''}</textarea></div>`;
  }
  
  if (type === 'locations') {
    html += `<div class="form-group"><label class="form-label">Name</label><input class="form-input" id="e-name" value="${e?.name || pick(VOCAB.NAMES.locations)}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Geography</label>
        <select class="form-select" id="e-geography">${Object.entries(VOCAB.LOCATION_GEOGRAPHY).map(([k, v]) => `<option value="${k}" ${e?.geography === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Era / Time Period</label>
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
      ${state.project.libraries.characters.map(c => `<option value="${c.id}" ${e?.ownerId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label">Description</label>
      <textarea class="form-textarea" id="e-description" rows="3" placeholder="Describe the object appearance and narrative role...">${e?.description || ''}</textarea></div>`;
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

  if (['characters', 'locations', 'objects', 'moods', 'themes'].includes(type)) {
    html += `<div class="form-group"><label class="form-label">CNL Annotations</label>
      <textarea class="form-textarea" id="e-annotations" rows="4" placeholder="#hint: Keep tone restrained&#10;#subtext: Hide fear under sarcasm">${annotationsToEditorText(e?.annotations || [])}</textarea>
      <div class="form-hint">One annotation per line. Supported types: hint, style, avoid, voice, subtext, sensory, pacing, reference, context, contrast, reveal, example.</div>
    </div>`;
  }
  
  $('#modal-body').innerHTML = html;
  $('#btn-modal-save').onclick = () => saveEntity(type);
  const deleteBtn = $('#btn-modal-delete');
  if (deleteBtn) {
    if (isEdit) {
      deleteBtn.style.display = 'inline-flex';
      deleteBtn.onclick = () => deleteEntity(type, e.id);
    } else {
      deleteBtn.style.display = 'none';
      deleteBtn.onclick = null;
    }
  }
  openModal('entity-modal');
}

function saveEntity(type) {
  const e = state.editingEntity ? state.project.libraries[type].find(x => x.id === state.editingEntity) : { id: genId() };
  
  if (type === 'characters') {
    e.name = $('#e-name').value || 'Character';
    e.archetype = $('#e-archetype').value;
    e.arcType = $('#e-arcType').value;
    e.traits = [...$$('#e-traits .chip.selected')].map(c => c.dataset.key);
    e.description = $('#e-description').value.trim();
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
    e.description = $('#e-description').value.trim();
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

  const annotationsInput = $('#e-annotations');
  if (annotationsInput) {
    e.annotations = parseAnnotationLines(annotationsInput.value);
  }
  
  if (!state.editingEntity) state.project.libraries[type].push(e);
  closeModal('entity-modal');
  renderEntityGrid(type);
  if (type === 'locations' || type === 'objects') window.renderBackdropView?.();
  if (type === 'themes' || type === 'moods') window.renderFrameworkView?.();
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

function humanizeLabel(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  const tabLabel = (type === 'locations' || type === 'objects') ? 'Backdrop' : type;
  $('#select-modal-title').textContent = 'Select ' + type.slice(0, -1);
  if (!list.length) {
    $('#select-modal-body').innerHTML = `<div class="empty-state"><div class="empty-state-text">No ${type} yet</div><div class="empty-state-hint">Create some in the ${tabLabel} tab first</div></div>`;
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
    <div class="select-modal-actions">
      <button class="btn" type="button" onclick="closeModal('select-modal')">Cancel</button>
      <button class="btn primary" type="button" onclick="saveAction('${parent.id}')">Add Action</button>
    </div>`;
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
  let html = `<div class="form-group"><label class="form-label">Name</label><input class="form-input" id="edit-name" value="${n.name || ''}"></div>
    <div class="form-group"><label class="form-label">Title</label><input class="form-input" id="edit-title" value="${n.title || ''}"></div>
    <div class="form-group"><label class="form-label">CNL Annotations</label>
    <textarea class="form-textarea" id="edit-annotations" rows="4" placeholder="#hint: Scene should escalate tension">${annotationsToEditorText(n.annotations || [])}</textarea>
    <div class="form-hint">Annotations are serialized after this node in CNL output.</div></div>`;

  if (n.type === 'scene') {
    const moods = state.project.libraries.moods || [];
    const moodOptions = moods.map(m => `
      <option value="${escapeHtml(m.name || '')}" ${(n.mood || '') === (m.name || '') ? 'selected' : ''}>${escapeHtml(m.name || 'Mood')}</option>
    `).join('');
    html += `<div class="form-group"><label class="form-label">Scene Mood</label>
      <select class="form-select" id="edit-scene-mood">
        <option value="">-- None --</option>
        ${moodOptions}
      </select>
      ${moods.length === 0 ? '<div class="form-hint">Create moods first in Backdrop to use scene mood.</div>' : ''}
    </div>`;
  }

  if (n.type === 'action' && n.actionData) {
    html += `<div class="form-row">
      <div class="form-group"><label class="form-label">Subject</label><input class="form-input" id="edit-action-subject" value="${n.actionData.subject || ''}"></div>
      <div class="form-group"><label class="form-label">Target</label><input class="form-input" id="edit-action-target" value="${n.actionData.target || ''}"></div>
    </div>`;
  }

  if (n.type === 'dialogue' && n.dialogueData) {
    html += `<div class="form-group"><label class="form-label">Dialogue Text</label>
      <textarea class="form-textarea" id="edit-dialogue-text" rows="4" placeholder="Dialogue content...">${n.dialogueData.sketch || ''}</textarea></div>`;
  }

  if (n.type === 'block-ref') {
    html += `<div class="form-group"><label class="form-label">Block Notes</label>
      <textarea class="form-textarea" id="edit-block-note" rows="3" placeholder="Optional notes for this block...">${n.note || ''}</textarea></div>`;
  }

  $('#modal-body').innerHTML = html;
  $('#btn-modal-save').onclick = () => {
    n.name = $('#edit-name').value || n.name;
    n.title = $('#edit-title').value || '';
    n.annotations = parseAnnotationLines($('#edit-annotations').value);
    if (n.type === 'scene') n.mood = $('#edit-scene-mood')?.value || '';

    if (n.type === 'action' && n.actionData) {
      n.actionData.subject = $('#edit-action-subject')?.value || n.actionData.subject;
      n.actionData.target = $('#edit-action-target')?.value || '';
      n.name = `${n.actionData.subject} ${n.actionData.action || ''}`.trim();
    }

    if (n.type === 'dialogue' && n.dialogueData) {
      n.dialogueData.sketch = $('#edit-dialogue-text')?.value || '';
    }

    if (n.type === 'block-ref') {
      n.note = $('#edit-block-note')?.value || '';
    }

    closeModal('entity-modal');
    renderTree();
    generateCNL();
  };
  openModal('entity-modal');
}

window.editNodeProps = editNodeProps;
