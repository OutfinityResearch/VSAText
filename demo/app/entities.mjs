/**
 * SCRIPTA Demo - Entity Management
 * 
 * Entity grids, forms, and editors.
 */

import { state } from './state.mjs';
import { $, $$, genId, openModal, closeModal, pick } from './utils.mjs';
import { addChild, findNode, renderTree, getUsedBlocks } from './tree.mjs';
import { generateCNL } from './cnl.mjs';
import { renderRelationshipsView, renderEmotionalArcView } from './views.mjs';
import { renderWorldLayersView } from './world-layers.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';
import { parseAnnotationLines, annotationsToEditorText } from './cnl-annotations.mjs';
import { getThemeGuidance } from './theme-guidance.mjs';

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

const CHARACTER_TEMPLATE_OPTIONS = Object.entries(VOCAB.CHARACTER_ARCHETYPES || {}).map(([key, value]) => ({
  key,
  label: value?.label || humanizeLabel(key),
  description: value?.desc || 'Character template',
  suggestedTraits: Array.isArray(value?.suggestedTraits) ? value.suggestedTraits : []
}));

const LOCATION_TEMPLATE_OPTIONS = Object.entries(VOCAB.LOCATION_GEOGRAPHY || {}).map(([key, value]) => ({
  key,
  label: value?.label || humanizeLabel(key),
  description: value?.desc || 'Location template',
  category: value?.category || ''
}));

const OBJECT_TEMPLATE_OPTIONS = Object.entries(VOCAB.OBJECT_TYPES || {}).map(([key, value]) => ({
  key,
  label: value?.label || humanizeLabel(key),
  description: value?.desc || 'Object template',
  category: value?.category || '',
  icon: value?.icon || ''
}));

function renderRedesignShell({ title, description, bodyMarkup, actionMarkup = '', shellClass = 'entity-redesign-shell' }) {
  return `
    <div class="framework-view ${shellClass}">
      <div class="framework-layout framework-redesign-layout">
        <div class="framework-page-header">
          <div class="framework-page-header-top">
            <div class="framework-page-header-copy">
              <h2>${escapeHtml(title)}</h2>
            </div>
            ${actionMarkup ? `<div class="framework-page-header-actions">${actionMarkup}</div>` : ''}
          </div>
          <div class="framework-page-header-divider"></div>
          <div class="framework-page-header-subtitle">
            <p>${escapeHtml(description)}</p>
          </div>
        </div>
        ${bodyMarkup}
      </div>
    </div>
  `;
}

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
  const { includeAddCard = true, showHeader = true } = options;
  const list = state.project.libraries[type];
  const desc = ENTITY_DESCRIPTIONS[type];
  
  // Build description header
  let descHtml = '';
  if (desc && showHeader) {
    descHtml = `<div class="entity-grid-header">
      <div class="entity-grid-header-top">
        <div class="entity-grid-title">${desc.title}</div>
      </div>
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
    let extraDescription = '';
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
      extraDescription = e.description || e.significance || '';
    }
    if (type === 'objects') {
      const objectTypeLabel = e.objectType ? humanizeLabel(e.objectType) : '';
      const normalizedName = String(e.name || '').trim().toLowerCase();
      const normalizedType = objectTypeLabel.trim().toLowerCase();
      sub = normalizedName && normalizedName === normalizedType ? '' : objectTypeLabel;
      extraDescription = e.description || '';
    }
    const cardType = type === 'objects' ? 'object' : type.slice(0, -1);
    const quickDelete = (type === 'characters' || type === 'locations' || type === 'objects')
      ? `<button class="entity-delete-btn" type="button" title="Delete" onclick="event.stopPropagation(); window.deleteEntity('${type}','${e.id}')">×</button>`
      : '';
    return `<div class="entity-card ${cardType}" onclick="editEntity('${type}','${e.id}')">
      ${quickDelete}
      <div class="entity-name">${e.name}</div>
      ${sub ? `<div class="entity-type">${sub}</div>` : ''}
      ${extraDescription ? `<div class="entity-desc">${escapeHtml(extraDescription)}</div>` : ''}
      ${tags}
    </div>`;
  }).join('');
  
  if (includeAddCard) {
    cards += `<div class="add-entity-card" onclick="addEntity('${type}')"><div class="icon">+</div><span>Add ${type.slice(0, -1)}</span></div>`;
  }
  c.innerHTML = descHtml + `<div class="entity-grid-cards">${cards}</div>`;
}

export function renderBackdropView() {
  const container = $('#backdrop-view');
  if (!container) return;

  const worldSpec = getWorldSpecValuesFromProject();

  container.innerHTML = renderRedesignShell({
    title: 'World',
    description: 'Define the setting, important places, key objects, and the rules that shape your story world.',
    shellClass: 'entity-redesign-shell',
    bodyMarkup: `
    <div class="backdrop-layout entity-redesign-page world-redesign-layout">
      <section class="framework-section section-framework-new world-redesign-section">
        <div class="framework-section-header redesign">
          <h3>World Setup</h3>
          <p>Set the geography, time period, object focus, and story importance before detailing the world itself.</p>
        </div>
        <div class="spec-card-content world-redesign-setup">
          <div class="spec-grid-4 spec-world-grid">
            <div class="form-group">
              <label class="form-label">Geography</label>
              <select class="form-select" id="worldspec-geography">
                <option value="forest" ${worldSpec.geography === 'forest' ? 'selected' : ''}>Forest</option>
                <option value="mountain" ${worldSpec.geography === 'mountain' ? 'selected' : ''}>Mountain</option>
                <option value="ocean" ${worldSpec.geography === 'ocean' ? 'selected' : ''}>Ocean</option>
                <option value="desert" ${worldSpec.geography === 'desert' ? 'selected' : ''}>Desert</option>
                <option value="city" ${worldSpec.geography === 'city' ? 'selected' : ''}>City</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Time Period</label>
              <select class="form-select" id="worldspec-time-period">
                <option value="medieval" ${worldSpec.timePeriod === 'medieval' ? 'selected' : ''}>Medieval</option>
                <option value="modern" ${worldSpec.timePeriod === 'modern' ? 'selected' : ''}>Modern</option>
                <option value="future" ${worldSpec.timePeriod === 'future' ? 'selected' : ''}>Future</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Objects & Artifacts Type</label>
              <select class="form-select" id="worldspec-object-types">
                <option value="document" ${worldSpec.objectType === 'document' ? 'selected' : ''}>Document</option>
                <option value="key" ${worldSpec.objectType === 'key' ? 'selected' : ''}>Key</option>
                <option value="weapon" ${worldSpec.objectType === 'weapon' ? 'selected' : ''}>Weapon</option>
                <option value="jewel" ${worldSpec.objectType === 'jewel' ? 'selected' : ''}>Jewelry</option>
                <option value="treasure" ${worldSpec.objectType === 'treasure' ? 'selected' : ''}>Treasure</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Significance</label>
              <select class="form-select" id="worldspec-object-importance">
                <option value="minor" ${worldSpec.objectSignificance === 'minor' ? 'selected' : ''}>Minor</option>
                <option value="central" ${worldSpec.objectSignificance === 'central' ? 'selected' : ''}>Central</option>
                <option value="important" ${worldSpec.objectSignificance === 'important' ? 'selected' : ''}>Important</option>
              </select>
            </div>
          </div>
        </div>
      </section>
      <section class="framework-section section-framework-new world-redesign-section">
        <div class="backdrop-section-header world-redesign-header">
          <h3>Locations (Place & Time)</h3>
          <div class="backdrop-section-actions">
            <button class="btn small" type="button" onclick="window.addEntity('locations')">+ Add Location</button>
            <button class="btn small" type="button" onclick="window.openWorldTemplateModal('locations')">Add from Library</button>
          </div>
        </div>
        <div class="entity-grid" id="backdrop-locations-grid"></div>
      </section>
      <section class="framework-section section-framework-new world-redesign-section">
        <div class="backdrop-section-header world-redesign-header">
          <h3>Story Objects</h3>
          <div class="backdrop-section-actions">
            <button class="btn small" type="button" onclick="window.openWorldTemplateModal('objects')">Add from Library</button>
            <button class="btn small" type="button" onclick="window.addEntity('objects')">+ Add Object</button>
          </div>
        </div>
        <div class="entity-grid" id="backdrop-objects-grid"></div>
      </section>
      <section class="framework-section section-framework-new world-redesign-section">
        <div class="backdrop-section-header world-redesign-header">
          <h3>World Rules</h3>
          <button class="btn small" type="button" onclick="window.addWorldRule()">+ Add World Rule</button>
        </div>
        <div class="rules-grid-cards" id="backdrop-worldrules-grid"></div>
      </section>
      <section class="framework-section section-framework-new world-redesign-section">
        <div class="backdrop-section-header world-redesign-header">
          <h3>World Layers</h3>
        </div>
        <div id="backdrop-worldlayers-view"></div>
      </section>
    </div>
  `
  });

  renderEntityGrid('locations', 'backdrop-locations-grid', { includeAddCard: false, showHeader: false });
  renderEntityGrid('objects', 'backdrop-objects-grid', { includeAddCard: false, showHeader: false });
  renderBackdropWorldRules();
  renderWorldLayersView({
    containerId: 'backdrop-worldlayers-view',
    showIntro: false,
    embedded: true,
    idPrefix: 'wle'
  });
  bindWorldSpecControls();
}

export function renderThemeEditorPage() {
  const container = $('#theme-editor-view');
  if (!container) return;

  container.innerHTML = `
    <div class="view-description-header theme-editor-hero">
      <div class="view-description-title">Add Theme</div>
      <div class="view-description-text">
        Create a custom theme for your story. You can write everything manually or start from an optional preset and adjust it.
      </div>
    </div>
    <div class="backdrop-layout theme-editor-layout">
      <section class="backdrop-section theme-editor-section">
        <div class="backdrop-section-header">
          <h3>Theme Editor</h3>
          <div class="backdrop-section-actions">
            <button class="btn small" type="button" onclick="window.switchToTab?.('core-theme')">Back to Theme</button>
            <button class="btn small" type="button" onclick="window.saveThemeFromPage()">Save Theme</button>
          </div>
        </div>
        <div class="spec-card-content theme-editor-fields theme-editor-grid">
          <div class="form-group theme-editor-field theme-editor-field-wide">
            <label class="form-label">Theme Name</label>
            <input class="form-input" id="theme-page-name" placeholder="Ex: Redemption through sacrifice">
          </div>
          <div class="form-group theme-editor-field">
            <label class="form-label">Base Preset (Optional)</label>
            <select class="form-select" id="theme-page-preset" onchange="window.prefillThemePageForm(this.value)">
              <option value="">Custom theme</option>
              ${Object.entries(VOCAB.THEMES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
            </select>
            <div class="form-hint">Use a preset only to prefill the fields. You can edit everything manually.</div>
          </div>
          <div class="form-group theme-editor-field">
            <label class="form-label">Ideological Conflict</label>
            <input class="form-input" id="theme-page-ideological-conflict" placeholder="Ex: Justice vs mercy">
          </div>
          <div class="form-group theme-editor-field">
            <label class="form-label">Moral Question</label>
            <input class="form-input" id="theme-page-moral-question" placeholder="Ex: When does justice become cruelty?">
          </div>
          <div class="form-group theme-editor-field">
            <label class="form-label">Transformation Axis</label>
            <input class="form-input" id="theme-page-transformation-axis" placeholder="Ex: Outrage -> discernment">
          </div>
          <div class="form-group theme-editor-field theme-editor-field-wide">
            <label class="form-label">Wisdom</label>
            <textarea class="form-textarea" id="theme-page-wisdom" rows="4" placeholder="Write the central truth this theme should express."></textarea>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderMoodEditorPage() {
  const container = $('#mood-editor-view');
  if (!container) return;

  const mood = state.editingEntity
    ? (state.project.libraries.moods || []).find(item => item.id === state.editingEntity) || null
    : null;
  const isEdit = !!mood;

  container.innerHTML = `
    <div class="framework-view entity-redesign-shell">
      <div class="framework-layout framework-redesign-layout">
        <div class="framework-page-header">
          <div class="framework-page-header-top">
            <div class="framework-page-header-copy">
              <h2>${isEdit ? 'Edit Mood' : 'Add Mood'}</h2>
            </div>
            <div class="framework-page-header-actions">
              <button class="btn small" type="button" onclick="window.switchToTab?.('moods')">Back to Tone & Style</button>
            </div>
          </div>
          <div class="framework-page-header-divider"></div>
          <div class="framework-page-header-subtitle">
            <p>Build a mood in a dedicated editor, choose emotional intensity, and save it to the tone library.</p>
          </div>
        </div>

        <section class="framework-section section-framework-new tone-redesign-section">
          <div class="framework-section-header redesign">
            <h3>Mood Builder</h3>
            <p>Combine emotions, adjust intensity, and use presets when you want a faster starting point.</p>
          </div>
          ${renderMoodBuilder(mood)}
          <div class="form-group" style="margin-top: 0.95rem;">
            <label class="form-label">CNL Annotations</label>
            <textarea class="form-textarea" id="e-annotations" rows="4" placeholder="#hint: Keep the feeling restrained&#10;#sensory: Use damp air and dim light">${annotationsToEditorText(mood?.annotations || [])}</textarea>
            <div class="form-hint">One annotation per line. Supported types: hint, style, avoid, voice, subtext, sensory, pacing, reference, context, contrast, reveal, example.</div>
          </div>
          <div class="subplot-editor-actions">
            ${isEdit ? '<button class="btn danger" type="button" id="btn-delete-mood-page">Delete Mood</button>' : '<span></span>'}
            <div class="subplot-editor-actions-right">
              <button class="btn" type="button" id="btn-cancel-mood-page">Cancel</button>
              <button class="btn primary" type="button" id="btn-save-mood-page">Save Mood</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  updateMoodPreview();
  $('#btn-cancel-mood-page')?.addEventListener('click', () => {
    state.editingEntity = null;
    window.switchToTab?.('moods');
  });
  $('#btn-save-mood-page')?.addEventListener('click', saveMoodFromPage);
  $('#btn-delete-mood-page')?.addEventListener('click', () => {
    if (!mood?.id || !confirm(`Delete "${mood.name}"?`)) return;
    state.project.libraries.moods = (state.project.libraries.moods || []).filter(item => item.id !== mood.id);
    removeEntityRefs(state.project.structure, mood.id);
    state.editingEntity = null;
    renderToneStyleView();
    renderTree();
    generateCNL();
    window.switchToTab?.('moods');
  });
}

export function renderLocationEditorPage() {
  const container = $('#location-editor-view');
  if (!container) return;

  const location = state.editingEntity
    ? (state.project.libraries.locations || []).find(item => item.id === state.editingEntity) || null
    : null;
  const isEdit = !!location;

  container.innerHTML = `
    <div class="framework-view entity-redesign-shell">
      <div class="framework-layout framework-redesign-layout">
        <div class="framework-page-header">
          <div class="framework-page-header-top">
            <div class="framework-page-header-copy">
              <h2>${isEdit ? 'Edit Location' : 'Add Location'}</h2>
            </div>
            <div class="framework-page-header-actions">
              <button class="btn small" type="button" onclick="window.switchToTab?.('backdrop')">Back to World</button>
            </div>
          </div>
          <div class="framework-page-header-divider"></div>
          <div class="framework-page-header-subtitle">
            <p>Define the place, time period, and core characteristics of the location in a dedicated editor.</p>
          </div>
        </div>

        <section class="framework-section section-framework-new world-redesign-section">
          <div class="framework-section-header redesign">
            <h3>Location Setup</h3>
            <p>Set the world context first, then enrich the location with distinctive characteristics for later use in scenes.</p>
          </div>
          <div class="spec-card-content theme-editor-fields theme-editor-grid">
            <div class="form-group theme-editor-field theme-editor-field-wide">
              <label class="form-label">Name</label>
              <input class="form-input" id="e-name" value="${escapeHtml(location?.name || pick(VOCAB.NAMES.locations))}" placeholder="Ex: Thornwood Forest">
            </div>
            <div class="form-group theme-editor-field">
              <label class="form-label">Geography</label>
              <select class="form-select" id="e-geography">
                ${Object.entries(VOCAB.LOCATION_GEOGRAPHY).map(([k, v]) => `<option value="${k}" ${location?.geography === k ? 'selected' : ''}>${v.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group theme-editor-field">
              <label class="form-label">Era / Time Period</label>
              <select class="form-select" id="e-time">
                ${Object.entries(VOCAB.LOCATION_TIME).map(([k, v]) => `<option value="${k}" ${location?.time === k ? 'selected' : ''}>${v.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group theme-editor-field theme-editor-field-wide">
              <label class="form-label">Characteristics</label>
              <div class="chip-select" id="e-chars">${renderLocationChips(location?.characteristics || [])}</div>
            </div>
            <div class="form-group theme-editor-field theme-editor-field-wide">
              <label class="form-label">CNL Annotations</label>
              <textarea class="form-textarea" id="e-annotations" rows="4" placeholder="#hint: Keep it isolated&#10;#sensory: Emphasize cold air and wet stone">${annotationsToEditorText(location?.annotations || [])}</textarea>
              <div class="form-hint">One annotation per line. Supported types: hint, style, avoid, voice, subtext, sensory, pacing, reference, context, contrast, reveal, example.</div>
            </div>
          </div>
          <div class="subplot-editor-actions">
            ${isEdit ? '<button class="btn danger" type="button" id="btn-delete-location-page">Delete Location</button>' : '<span></span>'}
            <div class="subplot-editor-actions-right">
              <button class="btn" type="button" id="btn-cancel-location-page">Cancel</button>
              <button class="btn primary" type="button" id="btn-save-location-page">Save Location</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  $('#btn-cancel-location-page')?.addEventListener('click', () => {
    state.editingEntity = null;
    window.switchToTab?.('backdrop');
  });
  $('#btn-save-location-page')?.addEventListener('click', saveLocationFromPage);
  $('#btn-delete-location-page')?.addEventListener('click', () => {
    if (!location?.id || !confirm(`Delete "${location.name}"?`)) return;
    state.project.libraries.locations = (state.project.libraries.locations || []).filter(item => item.id !== location.id);
    removeEntityRefs(state.project.structure, location.id);
    state.editingEntity = null;
    window.renderBackdropView?.();
    renderTree();
    window.switchToTab?.('backdrop');
  });
}

function getWorldSpecValuesFromProject() {
  const locations = state.project?.libraries?.locations || [];
  const objects = state.project?.libraries?.objects || [];

  const worldLocation = locations.find(loc => loc?.source === 'world-spec') || locations[0];
  const worldObject = objects.find(obj => obj?.source === 'world-spec') || objects[0];

  return {
    geography: worldLocation?.geography || 'forest',
    timePeriod: worldLocation?.time || 'medieval',
    objectType: worldObject?.objectType || 'document',
    objectSignificance: worldObject?.significance || 'minor'
  };
}

function upsertWorldSpecEntities() {
  const geography = $('#worldspec-geography')?.value || 'forest';
  const timePeriod = $('#worldspec-time-period')?.value || 'medieval';
  const objectType = $('#worldspec-object-types')?.value || 'document';
  const objectSignificance = $('#worldspec-object-importance')?.value || 'minor';

  const locations = state.project.libraries.locations || (state.project.libraries.locations = []);
  const objects = state.project.libraries.objects || (state.project.libraries.objects = []);

  let worldLocation = locations.find(loc => loc?.source === 'world-spec');
  if (!worldLocation) {
    worldLocation = locations[0];
  }
  if (!worldLocation) {
    worldLocation = { id: genId(), name: 'World Location', characteristics: [] };
    locations.push(worldLocation);
  }
  worldLocation.source = 'world-spec';
  worldLocation.geography = geography;
  worldLocation.time = timePeriod;
  if (!Array.isArray(worldLocation.characteristics)) worldLocation.characteristics = [];

  let worldObject = objects.find(obj => obj?.source === 'world-spec');
  if (!worldObject) {
    worldObject = objects[0];
  }
  if (!worldObject) {
    worldObject = { id: genId(), name: 'World Object' };
    objects.push(worldObject);
  }
  worldObject.source = 'world-spec';
  worldObject.objectType = objectType;
  worldObject.significance = objectSignificance;

  renderEntityGrid('locations', 'backdrop-locations-grid', { includeAddCard: false });
  renderEntityGrid('objects', 'backdrop-objects-grid', { includeAddCard: false });
  generateCNL();
}

function bindWorldSpecControls() {
  ['#worldspec-geography', '#worldspec-time-period', '#worldspec-object-types', '#worldspec-object-importance']
    .forEach(selector => {
      const el = $(selector);
      el?.addEventListener('change', upsertWorldSpecEntities);
    });
}

function inferCharacterRole(character) {
  const explicit = String(character?.role || '').toLowerCase();
  if (['protagonist', 'antagonist', 'secondary'].includes(explicit)) return explicit;

  const archetype = String(character?.archetype || '').toLowerCase();
  if (['hero', 'seeker', 'caregiver', 'innocent', 'explorer', 'creator'].includes(archetype)) return 'protagonist';
  if (['shadow', 'villain', 'ruler', 'destroyer', 'trickster'].includes(archetype)) return 'antagonist';
  return 'secondary';
}

function castOptions(options, selected = []) {
  return options.map(option => `
    <option value="${escapeHtml(option.value)}" ${selected.includes(option.value) ? 'selected' : ''}>
      ${escapeHtml(option.label)}
    </option>
  `).join('');
}

const PROTAGONIST_ARCHETYPES = [
  { value: 'hero', label: 'Hero' },
  { value: 'seeker', label: 'Seeker' },
  { value: 'caregiver', label: 'Caregiver' },
  { value: 'rebel', label: 'Rebel' }
];

const ANTAGONIST_ARCHETYPES = [
  { value: 'shadow', label: 'Shadow' },
  { value: 'ruler', label: 'Ruler' },
  { value: 'trickster', label: 'Trickster' },
  { value: 'destroyer', label: 'Destroyer' }
];

const PROTAGONIST_TRAITS = [
  { value: 'brave', label: 'Brave' },
  { value: 'loyal', label: 'Loyal' },
  { value: 'curious', label: 'Curious' },
  { value: 'impulsive', label: 'Impulsive' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'resilient', label: 'Resilient' },
  { value: 'idealistic', label: 'Idealistic' },
  { value: 'resourceful', label: 'Resourceful' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'compassionate', label: 'Compassionate' },
  { value: 'stubborn', label: 'Stubborn' },
  { value: 'self_doubting', label: 'Self-doubting' }
];

const ANTAGONIST_TRAITS = [
  { value: 'cold', label: 'Cold' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'charismatic', label: 'Charismatic' },
  { value: 'vengeful', label: 'Vengeful' },
  { value: 'obsessive', label: 'Obsessive' },
  { value: 'manipulative', label: 'Manipulative' },
  { value: 'ruthless', label: 'Ruthless' },
  { value: 'calculating', label: 'Calculating' },
  { value: 'fanatical', label: 'Fanatical' },
  { value: 'deceptive', label: 'Deceptive' },
  { value: 'domineering', label: 'Domineering' },
  { value: 'patient', label: 'Patient' }
];

const SECONDARY_ARCHETYPES = [
  { value: 'ally', label: 'Ally' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'trickster', label: 'Trickster' }
];

const SECONDARY_TRAITS = [
  { value: 'bold', label: 'Bold' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'witty', label: 'Witty' },
  { value: 'fearful', label: 'Fearful' },
  { value: 'pragmatic', label: 'Pragmatic' },
  { value: 'loyal', label: 'Loyal' },
  { value: 'protective', label: 'Protective' },
  { value: 'skeptical', label: 'Skeptical' },
  { value: 'ambitious', label: 'Ambitious' },
  { value: 'idealistic', label: 'Idealistic' },
  { value: 'sarcastic', label: 'Sarcastic' },
  { value: 'reckless', label: 'Reckless' },
  { value: 'patient', label: 'Patient' }
];

const TEMPLATE_TRAIT_ALIASES = {
  courage: 'brave',
  brave: 'brave',
  compassion: 'compassionate',
  compassionate: 'compassionate',
  resilient: 'resilient',
  wisdom: 'patient',
  wise: 'patient',
  patient: 'patient',
  mysterious: 'reserved',
  cunning: 'manipulative',
  pride: 'domineering',
  wrath: 'vengeful',
  deceit: 'deceptive',
  volatile: 'reckless',
  charismatic: 'charismatic',
  loyal: 'loyal',
  protective: 'protective',
  ambitious: 'ambitious',
  idealistic: 'idealistic',
  curious: 'curious',
  strategic: 'strategic'
};

const CAST_ARCHETYPE_TRAIT_DEFAULTS = {
  protagonist: {
    hero: ['brave', 'resilient', 'compassionate'],
    seeker: ['curious', 'resourceful', 'idealistic'],
    caregiver: ['compassionate', 'loyal', 'empathetic'],
    rebel: ['brave', 'stubborn', 'strategic']
  },
  antagonist: {
    shadow: ['manipulative', 'domineering', 'vengeful'],
    ruler: ['calculating', 'domineering', 'charismatic'],
    trickster: ['deceptive', 'charismatic', 'strategic'],
    destroyer: ['ruthless', 'obsessive', 'vengeful']
  },
  secondary: {
    ally: ['loyal', 'bold', 'pragmatic'],
    mentor: ['patient', 'reserved', 'protective'],
    guardian: ['protective', 'skeptical', 'loyal'],
    trickster: ['witty', 'reckless', 'sarcastic']
  }
};

const SPEC_RELATION_TYPES = [
  { value: 'alliance', label: 'Alliance' },
  { value: 'rivalry', label: 'Rivalry' },
  { value: 'betrayal', label: 'Betrayal' },
  { value: 'mentor', label: 'Mentor / Apprentice' },
  { value: 'family', label: 'Family Ties' },
  { value: 'friendship', label: 'Friendship' },
  { value: 'romance', label: 'Romance' },
  { value: 'loyalty', label: 'Loyalty' },
  { value: 'enmity', label: 'Enmity' },
  { value: 'dependency', label: 'Dependency' }
];

const RELATIONSHIP_DYNAMICS = [
  { value: 'supportive', label: 'Supportive' },
  { value: 'toxic', label: 'Toxic' },
  { value: 'manipulative', label: 'Manipulative' },
  { value: 'protective', label: 'Protective' },
  { value: 'competitive', label: 'Competitive' },
  { value: 'codependent', label: 'Codependent' },
  { value: 'mentor_student_tension', label: 'Mentor-Student Tension' }
];

let castDropdownListenerBound = false;

function closeCastMultiDropdowns(except = null) {
  document.querySelectorAll('#characters-grid .multi-dropdown.open').forEach(dropdown => {
    if (dropdown !== except) {
      dropdown.classList.remove('open');
      const toggle = dropdown.querySelector('.multi-dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function enhanceCastMultiSelectDropdown(selectEl) {
  if (!selectEl || selectEl.dataset.enhancedMultiDropdown === 'true') return;

  selectEl.dataset.enhancedMultiDropdown = 'true';
  selectEl.classList.add('multi-dropdown-native');

  const wrapper = document.createElement('div');
  wrapper.className = 'multi-dropdown';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'multi-dropdown-toggle';
  toggle.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('div');
  panel.className = 'multi-dropdown-panel';

  const options = Array.from(selectEl.options || []);
  const uid = Math.random().toString(36).slice(2, 8);

  const updateToggleLabel = () => {
    const selected = options.filter(option => option.selected).map(option => option.textContent.trim());
    const fullLabel = selected.length ? selected.join(', ') : 'Select options';
    if (selected.length <= 2) {
      toggle.textContent = fullLabel;
    } else {
      toggle.textContent = `${selected.slice(0, 2).join(', ')} +${selected.length - 2} more`;
    }
    toggle.title = fullLabel;
  };

  options.forEach((option, idx) => {
    const row = document.createElement('label');
    row.className = 'multi-dropdown-option';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = Boolean(option.selected);
    checkbox.value = option.value;
    checkbox.id = `${selectEl.id || `cast_traits_${uid}`}_multi_${idx}`;

    checkbox.addEventListener('change', () => {
      option.selected = checkbox.checked;
      updateToggleLabel();
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const text = document.createElement('span');
    text.textContent = option.textContent;

    row.appendChild(checkbox);
    row.appendChild(text);
    panel.appendChild(row);
  });

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    const willOpen = !wrapper.classList.contains('open');
    closeCastMultiDropdowns(wrapper);
    wrapper.classList.toggle('open', willOpen);
    toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  });

  wrapper.appendChild(toggle);
  wrapper.appendChild(panel);
  selectEl.insertAdjacentElement('afterend', wrapper);
  updateToggleLabel();
}

function createSecondarySpecRow(character = null, removable = true) {
  const row = document.createElement('div');
  row.className = `spec-secondary-item${removable ? '' : ' no-delete'}`;
  row.dataset.characterId = character?.id || '';
  row.dataset.rowKey = character?.id || genId();
  row.innerHTML = `
    ${removable ? '<button class="spec-secondary-delete" type="button" title="Delete character" aria-label="Delete character">×</button>' : ''}
    <div class="spec-secondary-fields">
      <div class="form-group">
        <label class="form-label">Name</label>
        <input class="form-input cast-secondary-name-input" type="text" value="${escapeHtml(character?.name || '')}" placeholder="Secondary character name">
      </div>
      <div class="form-group">
        <label class="form-label">Archetype</label>
        <select class="form-select cast-secondary-archetype">
          ${castOptions(SECONDARY_ARCHETYPES, [character?.archetype || 'ally'])}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Traits</label>
        <select class="form-select cast-secondary-traits" multiple size="6">
          ${castOptions(SECONDARY_TRAITS, Array.isArray(character?.traits) ? character.traits : [])}
        </select>
      </div>
    </div>
  `;
  row.querySelector('.spec-secondary-delete')?.addEventListener('click', () => {
    if (character?.id) {
      state.project.libraries.characters = state.project.libraries.characters.filter(c => c.id !== character.id);
      removeEntityRefs(state.project.structure, character.id);
    }
    row.remove();
    renderRelationshipsView();
    generateCNL();
  });
  enhanceCastMultiSelectDropdown(row.querySelector('.cast-secondary-traits'));
  return row;
}

function createRelationshipSpecRow(type = 'alliance', dynamic = 'supportive') {
  const row = document.createElement('div');
  row.className = 'spec-relationship-item';
  row.innerHTML = `
    <button class="spec-secondary-delete" type="button" title="Delete relationship" aria-label="Delete relationship">×</button>
    <div class="form-group">
      <label class="form-label">Relationship Type</label>
      <select class="form-select cast-relationship-type">
        ${castOptions(SPEC_RELATION_TYPES, [type])}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Relationship Dynamic</label>
      <select class="form-select cast-relationship-dynamic">
        ${castOptions(RELATIONSHIP_DYNAMICS, [dynamic])}
      </select>
    </div>
  `;
  row.querySelector('.spec-secondary-delete')?.addEventListener('click', () => {
    row.remove();
    syncCastRelationshipsFromUI();
  });
  row.querySelector('.cast-relationship-type')?.addEventListener('change', () => syncCastRelationshipsFromUI());
  row.querySelector('.cast-relationship-dynamic')?.addEventListener('change', () => syncCastRelationshipsFromUI());
  return row;
}

function applySelectedValuesToSelect(selectEl, values) {
  if (!selectEl) return;
  const normalized = new Set((Array.isArray(values) ? values : [values]).map(String));
  Array.from(selectEl.options || []).forEach(option => {
    option.selected = normalized.has(String(option.value));
  });
}

function refreshCastMultiSelectDropdown(selectEl) {
  if (!selectEl) return;
  const wrapper = selectEl.nextElementSibling;
  if (wrapper?.classList?.contains('multi-dropdown')) wrapper.remove();
  selectEl.dataset.enhancedMultiDropdown = '';
  selectEl.classList.remove('multi-dropdown-native');
  enhanceCastMultiSelectDropdown(selectEl);
}

function getAllowedArchetypesForRole(role) {
  if (role === 'protagonist') return PROTAGONIST_ARCHETYPES.map(item => item.value);
  if (role === 'antagonist') return ANTAGONIST_ARCHETYPES.map(item => item.value);
  return SECONDARY_ARCHETYPES.map(item => item.value);
}

function getAllowedTraitsForRole(role) {
  if (role === 'protagonist') return PROTAGONIST_TRAITS.map(item => item.value);
  if (role === 'antagonist') return ANTAGONIST_TRAITS.map(item => item.value);
  return SECONDARY_TRAITS.map(item => item.value);
}

function normalizeTemplateArchetype(role, templateKey) {
  const allowed = getAllowedArchetypesForRole(role);
  if (allowed.includes(templateKey)) return templateKey;

  if (role === 'protagonist') {
    if (['mentor', 'guardian', 'ally', 'herald', 'caregiver', 'explorer', 'creator', 'innocent'].includes(templateKey)) return 'caregiver';
    if (['trickster', 'shapeshifter', 'rebel'].includes(templateKey)) return 'rebel';
    return 'hero';
  }

  if (role === 'antagonist') {
    if (['villain', 'shadow'].includes(templateKey)) return 'shadow';
    if (['trickster', 'shapeshifter'].includes(templateKey)) return 'trickster';
    if (['ruler'].includes(templateKey)) return 'ruler';
    return 'shadow';
  }

  if (['mentor', 'guardian', 'trickster', 'ally'].includes(templateKey)) return templateKey;
  if (['herald', 'shapeshifter'].includes(templateKey)) return 'trickster';
  return 'ally';
}

function normalizeTemplateTraits(role, suggestedTraits = []) {
  const allowed = new Set(getAllowedTraitsForRole(role));
  const normalized = [];
  suggestedTraits.forEach(trait => {
    const mapped = TEMPLATE_TRAIT_ALIASES[String(trait || '').toLowerCase()] || String(trait || '').toLowerCase();
    if (allowed.has(mapped) && !normalized.includes(mapped)) normalized.push(mapped);
  });
  return normalized.slice(0, 4);
}

function getTemplateTraitsForCast(role, archetype, suggestedTraits = []) {
  const normalized = normalizeTemplateTraits(role, suggestedTraits);
  if (normalized.length) return normalized;
  return [...(CAST_ARCHETYPE_TRAIT_DEFAULTS?.[role]?.[archetype] || [])];
}

function upsertPrimaryCharacter(role, fallbackName, defaultArchetype, nameId, archetypeId, traitsId) {
  const name = $(nameId)?.value?.trim() || fallbackName;
  const archetype = $(archetypeId)?.value || defaultArchetype;
  const traits = Array.from($(traitsId)?.selectedOptions || []).map(option => option.value);
  let character = (state.project.libraries.characters || []).find(c => inferCharacterRole(c) === role);
  if (!character) {
    character = { id: genId() };
    state.project.libraries.characters.push(character);
  }
  character.name = name;
  character.role = role;
  character.archetype = archetype;
  character.traits = traits;
  if (!character.arcType) {
    character.arcType = role === 'antagonist' ? 'negative' : 'positive';
  }
  return character;
}

function syncCastRelationshipsFromUI() {
  const protagonist = (state.project.libraries.characters || []).find(c => inferCharacterRole(c) === 'protagonist');
  const antagonist = (state.project.libraries.characters || []).find(c => inferCharacterRole(c) === 'antagonist');
  if (!protagonist || !antagonist) return;

  const rows = Array.from(document.querySelectorAll('#cast-relationship-list .spec-relationship-item'));
  const old = state.project.libraries.relationships || [];
  const kept = old.filter(rel => !(rel.fromId === protagonist.id && rel.toId === antagonist.id));
  const mapped = rows.map(row => {
    const type = row.querySelector('.cast-relationship-type')?.value || 'alliance';
    const dynamic = row.querySelector('.cast-relationship-dynamic')?.value || 'supportive';
    return {
      id: genId(),
      fromId: protagonist.id,
      toId: antagonist.id,
      type,
      dynamic,
      hidden: false
    };
  });
  state.project.libraries.relationships = [...kept, ...mapped];
  renderRelationshipsView();
  generateCNL();
}

function syncPrimaryCharactersFromUI() {
  upsertPrimaryCharacter('protagonist', 'Protagonist', 'hero', '#cast-protagonist-name', '#cast-protagonist-archetype', '#cast-protagonist-traits');
  upsertPrimaryCharacter('antagonist', 'Antagonist', 'shadow', '#cast-antagonist-name', '#cast-antagonist-archetype', '#cast-antagonist-traits');
  syncCastRelationshipsFromUI();
  renderRelationshipsView();
  generateCNL();
}

function syncSecondaryCharactersFromUI() {
  const secondaryList = $('#cast-secondary-characters');
  if (!secondaryList) return;
  const rows = Array.from(secondaryList.querySelectorAll('.spec-secondary-item'));
  const saved = [];
  rows.forEach((row, index) => {
    const name = row.querySelector('.cast-secondary-name-input')?.value?.trim() || `Secondary ${index + 1}`;
    const archetype = row.querySelector('.cast-secondary-archetype')?.value || 'ally';
    const traits = Array.from(row.querySelector('.cast-secondary-traits')?.selectedOptions || []).map(option => option.value);
    let characterId = row.dataset.characterId || '';
    let character = characterId
      ? state.project.libraries.characters.find(c => c.id === characterId)
      : null;
    if (!character) {
      character = { id: genId() };
      characterId = character.id;
      row.dataset.characterId = characterId;
      row.dataset.rowKey = characterId;
    }
    character.name = name;
    character.role = 'secondary';
    character.archetype = archetype;
    character.traits = traits;
    character.arcType = character.arcType || 'flat';
    saved.push(character);
  });
  state.project.libraries.characters = [
    ...state.project.libraries.characters.filter(c => inferCharacterRole(c) !== 'secondary'),
    ...saved
  ];
  renderRelationshipsView();
  generateCNL();
}

function openCharacterTemplateModal(targetRole) {
  const modalOverlay = $('#select-modal');
  modalOverlay?.classList.add('modal-overlay-page', 'template-browser-modal');
  modalOverlay?.querySelector('.modal')?.classList.add('modal-page', 'template-browser-sheet');
  $('#select-modal-title').textContent = targetRole === 'secondary'
    ? 'Add Character from Template'
    : `Use Template for ${humanizeLabel(targetRole)}`;

  $('#select-modal-body').innerHTML = `
    <div class="entity-grid">
      <div class="entity-grid-header">
        <div class="entity-grid-title">Character Templates</div>
        <div class="entity-grid-desc">Choose a template to prefill archetype and traits, then continue editing manually in Cast.</div>
      </div>
      <div class="entity-grid-cards">
        ${CHARACTER_TEMPLATE_OPTIONS.map(template => `
          <button
            class="entity-card character"
            type="button"
            onclick="window.applyCharacterTemplateToCast('${targetRole}','${template.key}')">
            <div class="entity-name">${escapeHtml(template.label)}</div>
            <div class="entity-desc">${escapeHtml(template.description)}</div>
            <div class="entity-tags">
              ${template.suggestedTraits.slice(0, 4).map(trait => `<span class="entity-tag">${escapeHtml(humanizeLabel(trait))}</span>`).join('')}
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  openModal('select-modal');
}

function applyCharacterTemplateToCast(targetRole, templateKey) {
  const template = CHARACTER_TEMPLATE_OPTIONS.find(item => item.key === templateKey);
  if (!template) return;
  const archetype = normalizeTemplateArchetype(targetRole, template.key);
  const traits = getTemplateTraitsForCast(targetRole, archetype, template.suggestedTraits);

  if (targetRole === 'protagonist' || targetRole === 'antagonist') {
    let character = (state.project.libraries.characters || []).find(c => inferCharacterRole(c) === targetRole);
    if (!character) {
      character = { id: genId() };
      state.project.libraries.characters.push(character);
    }
    character.name = character.name || humanizeLabel(targetRole);
    character.role = targetRole;
    character.archetype = archetype;
    character.traits = traits;
    character.arcType = character.arcType || (targetRole === 'antagonist' ? 'negative' : 'positive');
    closeModal('select-modal');
    renderCharactersCastView();
    window.showNotification?.(`${template.label} applied to ${humanizeLabel(targetRole)}`, 'success');
    return;
  }

  state.project.libraries.characters.push({
    id: genId(),
    name: template.label,
    role: 'secondary',
    archetype,
    traits,
    arcType: 'flat'
  });
  closeModal('select-modal');
  renderCharactersCastView();
  window.showNotification?.(`${template.label} added from templates`, 'success');
}

function bindCastSpecEvents() {
  const protagonistName = $('#cast-protagonist-name');
  const protagonistArchetype = $('#cast-protagonist-archetype');
  const protagonistTraits = $('#cast-protagonist-traits');
  const antagonistName = $('#cast-antagonist-name');
  const antagonistArchetype = $('#cast-antagonist-archetype');
  const antagonistTraits = $('#cast-antagonist-traits');
  const secondaryList = $('#cast-secondary-characters');
  const addSecondaryBtn = $('#cast-btn-add-secondary-character');
  const addSecondaryTemplateBtn = $('#cast-btn-add-secondary-template');
  const relSelect = $('#cast-relationships');
  const relDynamicSelect = $('#cast-relationship-dynamic');
  const relList = $('#cast-relationship-list');
  const addRelBtn = $('#cast-btn-add-relationship');

  [protagonistName, protagonistArchetype, protagonistTraits, antagonistName, antagonistArchetype, antagonistTraits].forEach(control => {
    control?.addEventListener('change', syncPrimaryCharactersFromUI);
    control?.addEventListener('input', syncPrimaryCharactersFromUI);
  });
  enhanceCastMultiSelectDropdown(protagonistTraits);
  enhanceCastMultiSelectDropdown(antagonistTraits);

  const secondaryCharacters = (state.project.libraries.characters || []).filter(c => inferCharacterRole(c) === 'secondary');
  secondaryList.innerHTML = '';
  if (!secondaryCharacters.length) {
    secondaryList.appendChild(createSecondarySpecRow(null, false));
  } else {
    secondaryCharacters.forEach(character => secondaryList.appendChild(createSecondarySpecRow(character, true)));
  }

  secondaryList.addEventListener('change', (event) => {
    if (!event.target.closest('.spec-secondary-item')) return;
    syncSecondaryCharactersFromUI();
  });
  secondaryList.addEventListener('input', (event) => {
    if (!event.target.closest('.spec-secondary-item')) return;
    syncSecondaryCharactersFromUI();
  });

  addSecondaryBtn?.addEventListener('click', () => {
    const placeholder = secondaryList.querySelector('.spec-secondary-item.no-delete');
    if (placeholder) placeholder.remove();
    secondaryList.appendChild(createSecondarySpecRow(null, true));
    syncSecondaryCharactersFromUI();
  });

  addSecondaryTemplateBtn?.addEventListener('click', () => openCharacterTemplateModal('secondary'));

  relList.innerHTML = '';
  const protagonist = (state.project.libraries.characters || []).find(c => inferCharacterRole(c) === 'protagonist');
  const antagonist = (state.project.libraries.characters || []).find(c => inferCharacterRole(c) === 'antagonist');
  const betweenPrimary = protagonist && antagonist
    ? (state.project.libraries.relationships || []).filter(rel => rel.fromId === protagonist.id && rel.toId === antagonist.id)
    : [];
  if (betweenPrimary.length) {
    betweenPrimary.forEach(rel => relList.appendChild(createRelationshipSpecRow(rel.type, rel.dynamic || 'supportive')));
  }

  addRelBtn?.addEventListener('click', () => {
    const selectedType = relSelect?.value || 'alliance';
    const selectedDynamic = relDynamicSelect?.value || 'supportive';
    relList.appendChild(createRelationshipSpecRow(selectedType, selectedDynamic));
    syncCastRelationshipsFromUI();
  });

  if (!castDropdownListenerBound) {
    document.addEventListener('click', (event) => {
      if (!event.target.closest('#characters-grid .multi-dropdown')) {
        closeCastMultiDropdowns();
      }
    });
    castDropdownListenerBound = true;
  }

  syncPrimaryCharactersFromUI();
  syncSecondaryCharactersFromUI();
  syncCastRelationshipsFromUI();
}

function renderCharactersSpecBlock() {
  const protagonist = (state.project.libraries.characters || []).find(c => inferCharacterRole(c) === 'protagonist');
  const antagonist = (state.project.libraries.characters || []).find(c => inferCharacterRole(c) === 'antagonist');

  return `
    <section class="framework-section section-framework-new cast-redesign-section">
      <div class="framework-section-header redesign">
        <h3>Cast Structure</h3>
        <p>Define the core roles, supporting characters, and relationship dynamics that drive the story.</p>
      </div>
      <div class="cast-spec-rows cast-redesign-rows">
      <div class="spec-characters-grid cast-redesign-grid">
        <div class="spec-subcard">
          <div class="spec-subcard-header">
            <h4 class="spec-subcard-title">Protagonist</h4>
            <button class="btn small" type="button" onclick="window.openCharacterTemplateModal('protagonist')">Use Template</button>
          </div>
          <div class="spec-secondary-fields protagonist-fields">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input class="form-input" id="cast-protagonist-name" type="text" value="${escapeHtml(protagonist?.name || '')}" placeholder="Protagonist name">
            </div>
            <div class="form-group">
              <label class="form-label">Archetype</label>
              <select class="form-select" id="cast-protagonist-archetype">
                ${castOptions(PROTAGONIST_ARCHETYPES, [protagonist?.archetype || 'hero'])}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Traits (multi-select)</label>
              <select class="form-select" id="cast-protagonist-traits" multiple size="6">
                ${castOptions(PROTAGONIST_TRAITS, Array.isArray(protagonist?.traits) ? protagonist.traits : [])}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="spec-characters-grid cast-redesign-grid">
        <div class="spec-subcard">
          <div class="spec-subcard-header">
            <h4 class="spec-subcard-title">Antagonist</h4>
            <button class="btn small" type="button" onclick="window.openCharacterTemplateModal('antagonist')">Use Template</button>
          </div>
          <div class="spec-secondary-fields protagonist-fields">
            <div class="form-group">
              <label class="form-label">Name</label>
              <input class="form-input" id="cast-antagonist-name" type="text" value="${escapeHtml(antagonist?.name || '')}" placeholder="Antagonist name">
            </div>
            <div class="form-group">
              <label class="form-label">Archetype</label>
              <select class="form-select" id="cast-antagonist-archetype">
                ${castOptions(ANTAGONIST_ARCHETYPES, [antagonist?.archetype || 'shadow'])}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Traits (multi-select)</label>
              <select class="form-select" id="cast-antagonist-traits" multiple size="6">
                ${castOptions(ANTAGONIST_TRAITS, Array.isArray(antagonist?.traits) ? antagonist.traits : [])}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="spec-characters-grid cast-redesign-grid">
        <div class="spec-subcard spec-subcard-secondary">
          <div class="spec-subcard-header">
            <h4 class="spec-subcard-title">Secondary Characters</h4>
            <button class="btn small" id="cast-btn-add-secondary-template" type="button">Add from Templates</button>
          </div>
          <div class="spec-secondary-list" id="cast-secondary-characters"></div>
          <button class="btn small" id="cast-btn-add-secondary-character" type="button">+ Add Character</button>
        </div>
      </div>

      <div class="spec-characters-grid cast-redesign-grid">
        <div class="spec-subcard spec-subcard-relationships">
          <div class="spec-subcard-header">
            <h4 class="spec-subcard-title">Relationships</h4>
          </div>
          <div class="spec-secondary-fields spec-relationship-controls">
            <div class="form-group">
              <label class="form-label">Relationship Type</label>
              <select class="form-select" id="cast-relationships">
                ${castOptions(SPEC_RELATION_TYPES, ['alliance'])}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Relationship Dynamic</label>
              <select class="form-select" id="cast-relationship-dynamic">
                ${castOptions(RELATIONSHIP_DYNAMICS, ['supportive'])}
              </select>
            </div>
          </div>
          <div class="spec-relationship-list" id="cast-relationship-list"></div>
          <button class="btn small" id="cast-btn-add-relationship" type="button">+ Add Relationship</button>
        </div>
      </div>
      </div>
    </section>
  `;
}

let pendingCharacterRole = 'secondary';

export function renderCharactersCastView() {
  const container = $('#characters-grid');
  if (!container) return;

  container.innerHTML = renderRedesignShell({
    title: 'Cast',
    description: 'Configure your story cast in one place: protagonist, antagonist, secondary characters, and relationships.',
    bodyMarkup: renderCharactersSpecBlock(),
    shellClass: 'narrative-redesign-shell entity-redesign-shell'
  });
  bindCastSpecEvents();
}

export function renderToneStyleView() {
  const container = $('#moods-grid');
  if (!container) return;

  container.innerHTML = renderRedesignShell({
    title: 'Tone & Style',
    description: 'Shape the emotional atmosphere of the story, define scene moods, and align the emotional arc with the prose voice.',
    shellClass: 'entity-redesign-shell',
    bodyMarkup: `
      <div class="entity-redesign-page tone-redesign-layout">
      <section class="framework-section section-framework-new tone-redesign-section">
        <div class="framework-section-header redesign">
          <h3>Tone Direction</h3>
          <p>Build the emotional palette of the story and keep mood choices aligned with the intended prose voice.</p>
        </div>
        <div class="backdrop-section-header tone-redesign-header">
          <h3>Mood Library</h3>
          <div class="backdrop-section-actions">
            <button class="btn small" type="button" onclick="window.addEntity('moods')">+ Add Mood</button>
          </div>
        </div>
        <div class="entity-grid" id="tone-style-moods-grid"></div>
      </section>
      <section class="framework-section section-framework-new tone-redesign-section">
        <div class="backdrop-section-header tone-redesign-header">
          <h3>Emotional Arc</h3>
          <div class="backdrop-section-actions">
            <span class="form-hint">Assign scene-level emotional progression across the main beats.</span>
          </div>
        </div>
        <div id="tone-style-arc-grid"></div>
      </section>
      </div>
    `
  });

  renderEntityGrid('moods', 'tone-style-moods-grid', { includeAddCard: false });
  renderEmotionalArcView({ containerId: 'tone-style-arc-grid' });
}

function renderBackdropWorldRules() {
  const container = $('#backdrop-worldrules-grid');
  if (!container) return;

  const rules = state.project.libraries.worldRules || [];
  const selectedRuleId = state.project.libraries?.worldRulesUi?.selectedRuleId || '';
  let cardsHtml = '';

  if (rules.length > 0) {
    rules.forEach(r => {
      cardsHtml += `
        <div class="rule-card ${r.id === selectedRuleId ? 'active' : ''}" onclick="window.editWorldRule('${r.id}')">
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
  if (type === 'themes') {
    window.openThemeEditorPage?.();
    return;
  }
  if (type === 'moods') {
    state.editingEntity = null;
    window.showStandaloneView?.('mood-editor');
    return;
  }
  if (type === 'locations') {
    state.editingEntity = null;
    window.showStandaloneView?.('location-editor');
    return;
  }
  if (type === 'characters') pendingCharacterRole = 'secondary';
  state.editingEntity = null; 
  showEntityForm(type, null); 
};

window.addThemeFromLibrary = () => {
  if (typeof window.openLibraryThemes === 'function') {
    window.openLibraryThemes();
    return;
  }
  state.editingEntity = null;
  showEntityForm('themes', null);
};

window.addCharacterWithRole = (role) => {
  pendingCharacterRole = ['protagonist', 'antagonist', 'secondary'].includes(role) ? role : 'secondary';
  state.editingEntity = null;
  showEntityForm('characters', null);
};

window.editEntity = (type, id) => { 
  if (type === 'moods') {
    state.editingEntity = id;
    window.showStandaloneView?.('mood-editor');
    return;
  }
  if (type === 'locations') {
    state.editingEntity = id;
    window.showStandaloneView?.('location-editor');
    return;
  }
  state.editingEntity = id; 
  showEntityForm(type, state.project.libraries[type].find(e => e.id === id)); 
};

window.deleteEntity = (type, id) => {
  const entity = state.project.libraries[type].find(e => e.id === id);
  if (!entity || !confirm(`Delete "${entity.name}"?`)) return;
  state.project.libraries[type] = state.project.libraries[type].filter(e => e.id !== id);
  removeEntityRefs(state.project.structure, id);
  closeModal('entity-modal');
  if (type === 'characters') renderCharactersCastView();
  else renderEntityGrid(type);
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
      <div class="form-group"><label class="form-label">Role</label>
      <select class="form-select" id="e-role">
        <option value="protagonist" ${(e?.role || pendingCharacterRole) === 'protagonist' ? 'selected' : ''}>Protagonist</option>
        <option value="antagonist" ${(e?.role || pendingCharacterRole) === 'antagonist' ? 'selected' : ''}>Antagonist</option>
        <option value="secondary" ${(e?.role || pendingCharacterRole || 'secondary') === 'secondary' ? 'selected' : ''}>Secondary</option>
      </select></div>
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
    html += `<div class="form-group">
      <label class="form-label">Theme Name</label>
      <input class="form-input" id="e-theme-name" value="${e?.name || ''}" placeholder="Ex: Redemption through sacrifice">
    </div>
    <div class="form-group">
      <label class="form-label">Base Preset (Optional)</label>
      <select class="form-select" id="e-theme-preset" onchange="window.prefillThemeForm(this.value)">
        <option value="">Custom theme</option>
        ${Object.entries(VOCAB.THEMES).map(([k, v]) => `
          <option value="${k}" ${e?.themeKey === k ? 'selected' : ''}>${v.label}</option>
        `).join('')}
      </select>
      <div class="form-hint">Choose a preset only if you want to prefill the fields below. You can still edit everything manually.</div>
    </div>
    <div class="form-group">
      <label class="form-label">Ideological Conflict</label>
      <input class="form-input" id="e-theme-ideological-conflict" value="${e?.ideologicalConflict || ''}" placeholder="Ex: Justice vs mercy">
    </div>
    <div class="form-group">
      <label class="form-label">Moral Question</label>
      <input class="form-input" id="e-theme-moral-question" value="${e?.moralQuestion || ''}" placeholder="Ex: When does justice become cruelty?">
    </div>
    <div class="form-group">
      <label class="form-label">Transformation Axis</label>
      <input class="form-input" id="e-theme-transformation-axis" value="${e?.transformationAxis || ''}" placeholder="Ex: Outrage -> discernment">
    </div>
    <div class="form-group">
      <label class="form-label">Wisdom</label>
      <textarea class="form-textarea" id="e-theme-wisdom" rows="3" placeholder="Write the central truth this theme should express.">${e?.wisdom || ''}</textarea>
    </div>`;
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
    e.role = $('#e-role')?.value || e.role || pendingCharacterRole || 'secondary';
    e.archetype = $('#e-archetype').value;
    e.arcType = $('#e-arcType').value;
    e.traits = [...$$('#e-traits .chip.selected')].map(c => c.dataset.key);
    e.description = $('#e-description').value.trim();
    pendingCharacterRole = 'secondary';
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
    const presetKey = $('#e-theme-preset')?.value || '';
    const preset = presetKey ? VOCAB.THEMES[presetKey] : null;
    const guidance = presetKey ? getThemeGuidance(presetKey, preset?.label || '') : null;
    e.name = ($('#e-theme-name')?.value || '').trim() || preset?.label || 'Theme';
    e.themeKey = presetKey || '';
    e.ideologicalConflict = ($('#e-theme-ideological-conflict')?.value || '').trim() || guidance?.ideologicalConflict || '';
    e.moralQuestion = ($('#e-theme-moral-question')?.value || '').trim() || guidance?.moralQuestion || '';
    e.transformationAxis = ($('#e-theme-transformation-axis')?.value || '').trim() || guidance?.transformationAxis || '';
    e.wisdom = ($('#e-theme-wisdom')?.value || '').trim() || guidance?.wisdom || '';

    const libraries = state.project.libraries || (state.project.libraries = {});
    const frameworkProfile = libraries.frameworkProfile || (libraries.frameworkProfile = {});
    const storyCore = frameworkProfile.storyCore || (frameworkProfile.storyCore = {});
    const coreTheme = frameworkProfile.coreTheme || (frameworkProfile.coreTheme = {});

    storyCore.theme = e.name;
    storyCore.wisdom = e.wisdom;
    coreTheme.selectedThemeId = e.id;
    coreTheme.selectedThemeKey = e.themeKey || '';
    coreTheme.ideologicalConflict = e.ideologicalConflict;
    coreTheme.moralQuestion = e.moralQuestion;
    coreTheme.transformationAxis = e.transformationAxis;
  }

  const annotationsInput = $('#e-annotations');
  if (annotationsInput) {
    e.annotations = parseAnnotationLines(annotationsInput.value);
  }
  
  if (!state.editingEntity) state.project.libraries[type].push(e);
  closeModal('entity-modal');
  if (type === 'characters') renderCharactersCastView();
  else renderEntityGrid(type);
  if (type === 'locations' || type === 'objects') window.renderBackdropView?.();
  if (type === 'themes' || type === 'moods') window.renderFrameworkView?.();
  if (type === 'characters') renderRelationshipsView();
  generateCNL();
}

function saveLocationFromPage() {
  const locations = state.project.libraries.locations || (state.project.libraries.locations = []);
  const location = state.editingEntity
    ? locations.find(item => item.id === state.editingEntity)
    : { id: genId() };

  if (!location) return;

  location.name = $('#e-name')?.value || 'Location';
  location.geography = $('#e-geography')?.value || 'forest';
  location.time = $('#e-time')?.value || 'medieval';
  location.characteristics = [...$$('#e-chars .chip.selected')].map(c => c.dataset.key);
  location.annotations = parseAnnotationLines($('#e-annotations')?.value || '');

  if (!state.editingEntity) locations.push(location);

  state.editingEntity = null;
  window.renderBackdropView?.();
  renderTree();
  generateCNL();
  window.switchToTab?.('backdrop');
}

function saveMoodFromPage() {
  const moods = state.project.libraries.moods || (state.project.libraries.moods = []);
  const mood = state.editingEntity
    ? moods.find(item => item.id === state.editingEntity)
    : { id: genId() };

  if (!mood) return;

  mood.name = $('#e-mood-name')?.value || 'Mood';
  mood.emotions = {};
  $$('.emotion-chip').forEach(chip => {
    const intensity = parseInt(chip.dataset.intensity || '0', 10);
    if (intensity > 0) mood.emotions[chip.dataset.emotion] = intensity;
  });
  mood.annotations = parseAnnotationLines($('#e-annotations')?.value || '');

  if (!state.editingEntity) moods.push(mood);

  state.editingEntity = null;
  renderToneStyleView();
  renderTree();
  generateCNL();
  window.switchToTab?.('moods');
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

function openWorldTemplateModal(kind) {
  const modalOverlay = $('#select-modal');
  modalOverlay?.classList.add('modal-overlay-page', 'template-browser-modal');
  modalOverlay?.querySelector('.modal')?.classList.add('modal-page', 'template-browser-sheet');

  const isLocation = kind === 'locations';
  const options = isLocation ? LOCATION_TEMPLATE_OPTIONS : OBJECT_TEMPLATE_OPTIONS;

  $('#select-modal-title').textContent = isLocation
    ? 'Add Location from Library'
    : 'Add Object from Library';

  $('#select-modal-body').innerHTML = `
    <div class="entity-grid">
      <div class="entity-grid-header">
        <div class="entity-grid-title">${isLocation ? 'Locations' : 'Objects & Artifacts'}</div>
        <div class="entity-grid-desc">
          ${isLocation
            ? 'Choose a reusable location seed to prefill geography and world context, then continue editing manually in World.'
            : 'Choose a reusable object or artifact seed to prefill type and significance, then continue editing manually in World.'}
        </div>
      </div>
      <div class="entity-grid-cards">
        ${options.map(template => `
          <button
            class="entity-card ${isLocation ? 'location' : 'object'}"
            type="button"
            onclick="window.applyWorldTemplate('${kind}','${template.key}')">
            <div class="entity-name">${escapeHtml(isLocation ? template.label : `${template.icon ? `${template.icon} ` : ''}${template.label}`)}</div>
            <div class="entity-desc">${escapeHtml(template.description)}</div>
            ${isLocation ? `
              <div class="entity-tags">
                ${template.category ? `<span class="entity-tag">${escapeHtml(humanizeLabel(template.category))}</span>` : ''}
                <span class="entity-tag">Template</span>
              </div>
            ` : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  openModal('select-modal');
}

function applyWorldTemplate(kind, templateKey) {
  const isLocation = kind === 'locations';
  const collection = state.project.libraries[kind] || (state.project.libraries[kind] = []);
  const template = (isLocation ? LOCATION_TEMPLATE_OPTIONS : OBJECT_TEMPLATE_OPTIONS).find(item => item.key === templateKey);
  if (!template) return;

  const duplicate = collection.find(item => (
    isLocation
      ? item.geography === templateKey && String(item.name || '').trim().toLowerCase() === String(template.label).trim().toLowerCase()
      : item.objectType === templateKey && String(item.name || '').trim().toLowerCase() === String(template.label).trim().toLowerCase()
  ));
  if (duplicate) {
    closeModal('select-modal');
    window.showNotification?.(`${template.label} is already in World`, 'info');
    return;
  }

  if (isLocation) {
    collection.push({
      id: genId(),
      name: template.label,
      geography: template.key,
      time: $('#worldspec-time-period')?.value || 'medieval',
      characteristics: []
    });
  } else {
    collection.push({
      id: genId(),
      name: template.label,
      objectType: template.key,
      significance: $('#worldspec-object-importance')?.value || 'important',
      ownerId: null,
      description: template.description
    });
  }

  closeModal('select-modal');
  window.renderBackdropView?.();
  generateCNL();
  window.showNotification?.(`${template.label} added from library`, 'success');
}

window.toggleChip = el => el.classList.toggle('selected');
window.prefillThemeForm = (themeKey) => {
  const preset = VOCAB.THEMES?.[themeKey];
  if (!preset) return;
  const guidance = getThemeGuidance(themeKey, preset.label);
  const nameInput = $('#e-theme-name');
  const conflictInput = $('#e-theme-ideological-conflict');
  const moralInput = $('#e-theme-moral-question');
  const axisInput = $('#e-theme-transformation-axis');
  const wisdomInput = $('#e-theme-wisdom');

  if (nameInput && !nameInput.value.trim()) nameInput.value = preset.label || '';
  if (conflictInput && !conflictInput.value.trim()) conflictInput.value = guidance.ideologicalConflict || '';
  if (moralInput && !moralInput.value.trim()) moralInput.value = guidance.moralQuestion || '';
  if (axisInput && !axisInput.value.trim()) axisInput.value = guidance.transformationAxis || '';
  if (wisdomInput && !wisdomInput.value.trim()) wisdomInput.value = guidance.wisdom || '';
};

window.prefillThemePageForm = (themeKey) => {
  const preset = VOCAB.THEMES?.[themeKey];
  if (!preset) return;
  const guidance = getThemeGuidance(themeKey, preset.label);
  const nameInput = $('#theme-page-name');
  const conflictInput = $('#theme-page-ideological-conflict');
  const moralInput = $('#theme-page-moral-question');
  const axisInput = $('#theme-page-transformation-axis');
  const wisdomInput = $('#theme-page-wisdom');

  if (nameInput && !nameInput.value.trim()) nameInput.value = preset.label || '';
  if (conflictInput && !conflictInput.value.trim()) conflictInput.value = guidance.ideologicalConflict || '';
  if (moralInput && !moralInput.value.trim()) moralInput.value = guidance.moralQuestion || '';
  if (axisInput && !axisInput.value.trim()) axisInput.value = guidance.transformationAxis || '';
  if (wisdomInput && !wisdomInput.value.trim()) wisdomInput.value = guidance.wisdom || '';
};

window.saveThemeFromPage = () => {
  const presetKey = $('#theme-page-preset')?.value || '';
  const preset = presetKey ? VOCAB.THEMES[presetKey] : null;
  const guidance = presetKey ? getThemeGuidance(presetKey, preset?.label || '') : null;
  const name = ($('#theme-page-name')?.value || '').trim() || preset?.label || 'Theme';
  const ideologicalConflict = ($('#theme-page-ideological-conflict')?.value || '').trim() || guidance?.ideologicalConflict || '';
  const moralQuestion = ($('#theme-page-moral-question')?.value || '').trim() || guidance?.moralQuestion || '';
  const transformationAxis = ($('#theme-page-transformation-axis')?.value || '').trim() || guidance?.transformationAxis || '';
  const wisdom = ($('#theme-page-wisdom')?.value || '').trim() || guidance?.wisdom || '';

  const theme = {
    id: genId(),
    name,
    themeKey: presetKey || '',
    ideologicalConflict,
    moralQuestion,
    transformationAxis,
    wisdom,
    annotations: []
  };

  state.project.libraries.themes.push(theme);

  const libraries = state.project.libraries || (state.project.libraries = {});
  const frameworkProfile = libraries.frameworkProfile || (libraries.frameworkProfile = {});
  const storyCore = frameworkProfile.storyCore || (frameworkProfile.storyCore = {});
  const coreTheme = frameworkProfile.coreTheme || (frameworkProfile.coreTheme = {});

  storyCore.theme = theme.name;
  storyCore.wisdom = theme.wisdom;
  coreTheme.selectedThemeId = theme.id;
  coreTheme.selectedThemeKey = theme.themeKey || '';
  coreTheme.customThemeName = theme.name;
  coreTheme.ideologicalConflict = theme.ideologicalConflict;
  coreTheme.moralQuestion = theme.moralQuestion;
  coreTheme.transformationAxis = theme.transformationAxis;

  generateCNL();
  window.showNotification?.(`Theme "${theme.name}" added`, 'success');
  window.switchToTab?.('core-theme');
  window.renderCoreThemeView?.();
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

window.openCharacterTemplateModal = openCharacterTemplateModal;
window.applyCharacterTemplateToCast = applyCharacterTemplateToCast;
window.openWorldTemplateModal = openWorldTemplateModal;
window.applyWorldTemplate = applyWorldTemplate;

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
