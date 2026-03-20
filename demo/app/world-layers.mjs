/**
 * SCRIPTA Demo - World Layers View
 *
 * Structured worldbuilding workspace for social, historical, economic,
 * and conflict dimensions.
 */

import { state } from './state.mjs';
import { $, genId } from './utils.mjs';

let lastRenderOptions = {
  containerId: 'worldlayers-view',
  showIntro: true,
  embedded: false,
  idPrefix: 'wl'
};

const CATEGORY_CONFIG = {
  societies: {
    title: 'Societies / Cultures',
    subtitle: 'Groups, values, and how they function.',
    addLabel: '+ Add Society',
    fields: [
      { key: 'name', label: 'Society Name', type: 'text', placeholder: 'e.g., House Valeryn' },
      { key: 'groupType', label: 'Type', type: 'select', options: ['Faction', 'Nation', 'Culture', 'Order', 'Guild'] },
      { key: 'socialStructure', label: 'Social Structure', type: 'select', options: ['Hierarchical', 'Tribal', 'Republic', 'Feudal', 'Collective'] },
      {
        key: 'beliefSystemType',
        label: 'Belief System',
        type: 'select',
        options: ['Religious', 'Spiritual', 'Ideological', 'Secular', 'Myth-based']
      },
      {
        key: 'beliefSystemDescription',
        label: 'Short Description',
        type: 'text',
        placeholder: '1-2 short sentences about the group belief system...'
      },
      { key: 'communicationStyle', label: 'Communication Style', type: 'select', options: ['Formal', 'Direct', 'Ritualized', 'Poetic', 'Secretive'] }
    ]
  },
  history: {
    title: 'History / Timeline',
    subtitle: 'Major events that shaped the world.',
    addLabel: '+ Add Event',
    fields: [
      { key: 'title', label: 'Event Title', type: 'text', placeholder: 'e.g., The Ashfall Treaty' },
      { key: 'eventType', label: 'Event Type', type: 'select', options: ['War', 'Discovery', 'Revolution', 'Collapse', 'Migration', 'Cataclysm'] },
      { key: 'involvedParties', label: 'Involved Parties', type: 'text', placeholder: 'e.g., Protagonist, Antagonist, key factions, key characters, societies' },
      { key: 'era', label: 'Era / Timeline Marker', type: 'text', placeholder: 'e.g., Year 327 After Sundering' },
      { key: 'artifactImpact', label: 'Artifact Impact', type: 'textarea', placeholder: 'How artifacts influenced this moment...' },
      { key: 'culturalImpact', label: 'Cultural Impact', type: 'textarea', placeholder: 'How cultures changed after this event...' }
    ]
  },
  rules: {
    title: 'Rules of the World',
    subtitle: 'Core laws and limitations of the world.',
    addLabel: '+ Add Rule',
    fields: [
      { key: 'ruleName', label: 'Rule Name', type: 'text', placeholder: 'e.g., Memory costs for high-level magic' },
      { key: 'ruleDomain', label: 'Domain', type: 'select', options: ['Natural Law', 'Magic Rule', 'Technology Rule', 'Cultural Rule'] },
      { key: 'accessControl', label: 'Who Can Use / Access', type: 'select', options: ['Anyone', 'Initiated only', 'Elite only', 'Forbidden'] },
      {
        key: 'enforcementMechanism',
        label: 'Enforcement Mechanism',
        type: 'select',
        options: ['Natural consequence', 'Social punishment', 'Religious sanction', 'Legal system', 'Psychological breakdown']
      },
      { key: 'limitations', label: 'Costs / Limitations', type: 'textarea', placeholder: 'Costs, cooldowns, risks, side effects...' },
      { key: 'tabooPressure', label: 'Taboo Pressure', type: 'select', options: ['Low', 'Moderate', 'High', 'Severe'] }
    ]
  },
  economy: {
    title: 'Economy & Resources',
    subtitle: 'Resources, scarcity, and who controls them.',
    addLabel: '+ Add Resource',
    fields: [
      { key: 'resourceName', label: 'Resource / Asset', type: 'text', placeholder: 'e.g., Ember Quartz' },
      { key: 'resourceType', label: 'Resource Type', type: 'select', options: ['Natural', 'Magical', 'Technological', 'Financial', 'Strategic'] },
      { key: 'marketModel', label: 'Trade Model', type: 'select', options: ['Open Market', 'Controlled Monopoly', 'Black Market', 'Barter', 'State Managed'] },
      { key: 'scarcity', label: 'Scarcity', type: 'select', options: ['Abundant', 'Limited', 'Rare', 'Critical'] },
      { key: 'strategicCriticality', label: 'Strategic Value / Criticality', type: 'select', options: ['Low', 'Medium', 'High'] },
      { key: 'resourceConflict', label: 'Conflict / Negotiation Notes', type: 'textarea', placeholder: 'Who competes for it and why...' }
    ]
  },
  conflicts: {
    title: 'Conflicts & Tensions',
    subtitle: 'Large tensions that pressure the world.',
    addLabel: '+ Add Conflict',
    fields: [
      { key: 'conflictName', label: 'Conflict Name', type: 'text', placeholder: 'e.g., The Border Embargo Crisis' },
      { key: 'conflictType', label: 'Conflict Type', type: 'select', options: ['Political', 'Social', 'Cultural', 'Resource', 'Artifact', 'Ideological'] },
      { key: 'parties', label: 'Parties Involved', type: 'text', placeholder: 'e.g., Iron Republic vs Coast Clans' },
      { key: 'intensity', label: 'Tension Intensity', type: 'select', options: ['Low', 'Medium', 'High', 'Escalating'] },
      { key: 'resolutionPath', label: 'Resolution Path', type: 'select', options: ['Reconciliation', 'Victory', 'Defeat', 'Stalemate', 'Transformation'] },
      { key: 'drivers', label: 'Root Drivers', type: 'textarea', placeholder: 'What keeps this conflict alive?' }
    ]
  }
};

function ensureWorldLayersState() {
  if (!state.project?.libraries) return null;
  if (!state.project.libraries.worldLayers || typeof state.project.libraries.worldLayers !== 'object') {
    state.project.libraries.worldLayers = {};
  }
  const worldLayers = state.project.libraries.worldLayers;
  Object.keys(CATEGORY_CONFIG).forEach((key) => {
    if (!Array.isArray(worldLayers[key])) worldLayers[key] = [];
  });
  return worldLayers;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderField(field, value, categoryKey, itemId, idPrefix = 'wl') {
  const id = `${idPrefix}-${categoryKey}-${itemId}-${field.key}`;
  if (field.type === 'select') {
    const optionsHtml = field.options.map((opt) => `
      <option value="${escapeHtml(opt)}" ${value === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>
    `).join('');
    return `
      <div class="form-group" data-field="${field.key}">
        <label class="form-label" for="${id}">${field.label}</label>
        <select class="form-select wl-input" id="${id}" data-category="${categoryKey}" data-item-id="${itemId}" data-field="${field.key}">
          ${optionsHtml}
        </select>
      </div>
    `;
  }

  if (field.type === 'textarea') {
    return `
      <div class="form-group" data-field="${field.key}">
        <label class="form-label" for="${id}">${field.label}</label>
        <textarea class="form-textarea wl-input wl-textarea" id="${id}" data-category="${categoryKey}" data-item-id="${itemId}" data-field="${field.key}" placeholder="${escapeHtml(field.placeholder || '')}">${escapeHtml(value || '')}</textarea>
      </div>
    `;
  }

  return `
    <div class="form-group" data-field="${field.key}">
      <label class="form-label" for="${id}">${field.label}</label>
      <input class="form-input wl-input" id="${id}" type="text" value="${escapeHtml(value || '')}" placeholder="${escapeHtml(field.placeholder || '')}" data-category="${categoryKey}" data-item-id="${itemId}" data-field="${field.key}">
    </div>
  `;
}

function renderLayerItem(categoryKey, item, config, idPrefix = 'wl') {
  const fieldsHtml = config.fields.map(field => renderField(field, item[field.key], categoryKey, item.id, idPrefix)).join('');
  return `
    <article class="world-layer-item" data-category="${categoryKey}" data-item-id="${item.id}">
      <button class="world-layer-delete" type="button" title="Delete layer" aria-label="Delete layer" data-action="delete-layer" data-category="${categoryKey}" data-item-id="${item.id}">×</button>
      <div class="world-layer-fields">${fieldsHtml}</div>
    </article>
  `;
}

function renderCategoryCard(categoryKey, config, items, idPrefix = 'wl') {
  const itemsHtml = items.length
    ? items.map(item => renderLayerItem(categoryKey, item, config, idPrefix)).join('')
    : `<div class="world-layer-empty">No entries yet. Use ${config.addLabel}.</div>`;

  return `
    <section class="world-layer-card" data-category="${categoryKey}">
      <div class="world-layer-card-header">
        <div>
          <h3>${config.title}</h3>
          <p>${config.subtitle}</p>
        </div>
        <button class="btn small" type="button" data-action="add-layer" data-category="${categoryKey}">${config.addLabel}</button>
      </div>
      <div class="world-layer-list">
        ${itemsHtml}
      </div>
    </section>
  `;
}

function getDefaultItem(config) {
  const item = { id: genId('wl') };
  config.fields.forEach((field) => {
    if (field.type === 'select') {
      item[field.key] = field.options[0] || '';
    } else {
      item[field.key] = '';
    }
  });
  return item;
}

function deleteLayer(categoryKey, itemId) {
  const worldLayers = ensureWorldLayersState();
  if (!worldLayers || !Array.isArray(worldLayers[categoryKey])) return;
  worldLayers[categoryKey] = worldLayers[categoryKey].filter(item => item.id !== itemId);
  renderWorldLayersView(lastRenderOptions);
}

function addLayer(categoryKey) {
  const worldLayers = ensureWorldLayersState();
  const config = CATEGORY_CONFIG[categoryKey];
  if (!worldLayers || !config) return;
  worldLayers[categoryKey].push(getDefaultItem(config));
  renderWorldLayersView(lastRenderOptions);
}

function updateLayerField(categoryKey, itemId, fieldKey, value) {
  const worldLayers = ensureWorldLayersState();
  const list = worldLayers?.[categoryKey];
  if (!Array.isArray(list)) return;
  const item = list.find(entry => entry.id === itemId);
  if (!item) return;
  item[fieldKey] = value;
}

function attachListeners(container) {
  container.querySelectorAll('[data-action="add-layer"]').forEach((btn) => {
    btn.addEventListener('click', () => addLayer(btn.dataset.category));
  });

  container.querySelectorAll('[data-action="delete-layer"]').forEach((btn) => {
    btn.addEventListener('click', () => deleteLayer(btn.dataset.category, btn.dataset.itemId));
  });

  container.querySelectorAll('.wl-input').forEach((input) => {
    const evt = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(evt, () => {
      updateLayerField(
        input.dataset.category,
        input.dataset.itemId,
        input.dataset.field,
        input.value
      );
    });
  });
}

export function renderWorldLayersView(options = {}) {
  const {
    containerId = 'worldlayers-view',
    showIntro = true,
    embedded = false,
    idPrefix = 'wl'
  } = options;

  const container = $(`#${containerId}`);
  if (!container) return;

  lastRenderOptions = { containerId, showIntro, embedded, idPrefix };

  const worldLayers = ensureWorldLayersState();
  if (!worldLayers) return;

  const cardsHtml = Object.entries(CATEGORY_CONFIG)
    .map(([categoryKey, config]) => renderCategoryCard(categoryKey, config, worldLayers[categoryKey], idPrefix))
    .join('');

  container.innerHTML = `
    <div class="world-layers-layout${embedded ? ' embedded' : ''}">
      ${showIntro ? `<section class="world-layers-intro">
        <h2>World Layers</h2>
        <p>Use this page only for big world context: societies, history, resources, and large-scale tensions.</p>
        <div class="world-layers-help">For simple laws of the setting, use World Rules. Use World Layers only when the detail affects the broader world.</div>
      </section>` : ''}
      <div class="world-layers-grid">
        ${cardsHtml}
      </div>
    </div>
  `;

  attachListeners(container);
}

window.renderWorldLayersView = renderWorldLayersView;

export default {
  renderWorldLayersView
};
