/**
 * SCRIPTA Demo - Subplots Component
 * 
 * UI for managing story subplots.
 */

import state from '../state.mjs';
import { upsertSubplot, removeSubplot } from '../state.mjs';
import { $, generateId } from '../utils.mjs';
import { getArc, getCurrentArcBeats } from './blueprint-state.mjs';

// Subplot types as defined in documentation
const SUBPLOT_TYPES = {
  romance: { label: 'Romance', desc: 'Romantic subplot between characters', color: '#ef476f' },
  rivalry: { label: 'Rivalry', desc: 'Competition or conflict between characters', color: '#e63946' },
  mystery: { label: 'Mystery', desc: 'Hidden truth or secret to uncover', color: '#9d4edd' },
  growth: { label: 'Growth', desc: 'Character development arc', color: '#06d6a0' },
  revenge: { label: 'Revenge', desc: 'Character seeking vengeance', color: '#d00000' },
  mentorship: { label: 'Mentorship', desc: 'Teacher-student dynamic', color: '#118ab2' },
  betrayal: { label: 'Betrayal', desc: 'Trust being broken', color: '#9d0208' },
  redemption: { label: 'Redemption', desc: 'Character seeking to make amends', color: '#ffd166' }
};

let subplotsContainer = null;
let activeSubplotId = null;

/**
 * Initialize the subplots component
 * @param {HTMLElement} container 
 */
export function initSubplots(container) {
  subplotsContainer = container;
  render();
}

/**
 * Render the subplots list
 */
export function render() {
  if (!subplotsContainer) return;
  
  const subplots = state.project.blueprint.subplots || [];
  const characters = state.project.libraries.characters || [];
  const beats = getCurrentArcBeats();
  
  subplotsContainer.innerHTML = `
    <div class="subplots-header">
      <h3>Subplots</h3>
      <p class="subplots-desc">Secondary story threads that enrich the main narrative. Define subplot arcs that run parallel to your main story.</p>
    </div>
    
    <div class="subplots-list">
      ${subplots.length === 0 ? `
        <div class="subplots-empty">
          <div class="subplots-empty-icon" aria-hidden="true">📝</div>
          <h4 class="subplots-empty-title">No subplots defined yet</h4>
          <p class="subplots-empty-text">Add subplot threads to deepen character dynamics and strengthen thematic contrast.</p>
          <div class="subplots-empty-tags">
            <span>Romance</span>
            <span>Mystery</span>
            <span>Growth</span>
            <span>Rivalry</span>
          </div>
        </div>
      ` : subplots.map(subplot => renderSubplotCard(subplot, characters, beats)).join('')}
    </div>
    
    <div class="subplots-actions">
      <button class="btn" id="btn-add-subplot">+ Add Plot</button>
    </div>
  `;
  
  attachListeners();
}

/**
 * Render a single subplot card
 */
function renderSubplotCard(subplot, characters, beats) {
  const type = SUBPLOT_TYPES[subplot.type] || { label: subplot.type, color: '#6c757d' };
  const involvedChars = (subplot.characterIds || [])
    .map(id => characters.find(c => c.id === id))
    .filter(Boolean)
    .map(c => c.name)
    .join(', ');
  
  const startBeat = beats.find(b => b.key === subplot.startBeat);
  const resolveBeat = beats.find(b => b.key === subplot.resolveBeat);
  
  return `
    <div class="subplot-card" data-id="${subplot.id}" style="border-left-color: ${type.color}">
      <div class="subplot-header">
        <span class="subplot-name">${subplot.name || 'Unnamed Subplot'}</span>
        <span class="subplot-type" style="background: ${type.color}">${type.label}</span>
        <button class="btn-icon btn-delete-subplot" data-id="${subplot.id}" title="Delete">×</button>
      </div>
      <div class="subplot-details">
        <div class="subplot-row">
          <span class="label">Characters:</span>
          <span class="value">${involvedChars || 'None assigned'}</span>
        </div>
        <div class="subplot-row">
          <span class="label">Starts:</span>
          <span class="value">${startBeat?.label || 'Not set'}</span>
        </div>
        <div class="subplot-row">
          <span class="label">Resolves:</span>
          <span class="value">${resolveBeat?.label || 'Not set'}</span>
        </div>
      </div>
      <div class="subplot-card-actions">
        <button class="btn btn-small btn-edit-subplot" data-id="${subplot.id}">Edit Plot</button>
      </div>
    </div>
  `;
}

function getActiveSubplot() {
  if (!activeSubplotId) return null;
  return (state.project.blueprint.subplots || []).find(subplot => subplot.id === activeSubplotId) || null;
}

function buildCharacterOptions(characters, selectedCharIds) {
  if (!characters.length) {
    return `<div class="subplot-char-empty">No characters available, add characters first in Cast.</div>`;
  }

  return characters.map(c => `
    <label class="checkbox-item subplot-char-option ${selectedCharIds.includes(c.id) ? 'selected' : ''}">
      <input class="subplot-char-checkbox" type="checkbox" value="${c.id}" 
             ${selectedCharIds.includes(c.id) ? 'checked' : ''}>
      <span>${c.name} (${c.archetype || 'character'})</span>
    </label>
  `).join('');
}

function buildBeatOptions(beats, selectedBeat) {
  return `
    <option value="">-- Select beat --</option>
    ${beats.map(b => `
      <option value="${b.key}" ${selectedBeat === b.key ? 'selected' : ''}>
        ${b.label} (${Math.round(b.position * 100)}%)
      </option>
    `).join('')}
  `;
}

function syncCharacterOptionStates(root = document) {
  root.querySelectorAll('#subplot-characters .subplot-char-checkbox').forEach((checkbox) => {
    const syncSelectedState = () => {
      const row = checkbox.closest('.subplot-char-option');
      if (row) row.classList.toggle('selected', checkbox.checked);
    };
    checkbox.addEventListener('change', syncSelectedState);
    syncSelectedState();
  });
}

export function renderSubplotEditorView() {
  const container = $('#subplot-editor-view');
  if (!container) return;

  const subplot = getActiveSubplot();
  const isEdit = !!subplot;
  const characters = state.project.libraries.characters || [];
  const beats = getCurrentArcBeats();
  const selectedCharIds = subplot?.characterIds || [];

  container.innerHTML = `
    <div class="framework-view subplot-editor-shell">
      <div class="framework-layout framework-redesign-layout">
        <div class="framework-page-header">
          <div class="framework-page-header-top">
            <div class="framework-page-header-copy">
              <h2>${isEdit ? 'Edit Plot' : 'Add Plot'}</h2>
            </div>
            <div class="framework-page-header-actions">
              <button class="btn" type="button" id="btn-subplot-back">Back to Blueprint</button>
            </div>
          </div>
          <div class="framework-page-header-divider"></div>
          <div class="framework-page-header-subtitle">
            <p>Define a subplot in a dedicated workspace, with involved characters and beat positions visible on one page.</p>
          </div>
        </div>

        <section class="framework-section section-framework-new subplot-editor-section">
          <div class="framework-section-header redesign">
            <h3>Plot Setup</h3>
            <p>Capture the subplot identity, assign the main characters, and place its beginning and resolution on the active arc.</p>
          </div>

          <div class="subplot-editor-grid">
            <div class="form-group subplot-editor-field-wide">
              <label class="form-label">Plot Name</label>
              <input type="text" class="form-input" id="subplot-name" 
                     value="${subplot?.name || ''}" placeholder="e.g., Anna's Romance">
            </div>

            <div class="form-group">
              <label class="form-label">Type</label>
              <select class="form-select" id="subplot-type">
                ${Object.entries(SUBPLOT_TYPES).map(([key, t]) => `
                  <option value="${key}" ${subplot?.type === key ? 'selected' : ''}>
                    ${t.label} - ${t.desc}
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Starts at Beat</label>
              <select class="form-select" id="subplot-start">
                ${buildBeatOptions(beats, subplot?.startBeat)}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Resolves at Beat</label>
              <select class="form-select" id="subplot-resolve">
                ${buildBeatOptions(beats, subplot?.resolveBeat)}
              </select>
            </div>
          </div>

          <div class="form-group subplot-editor-characters">
            <label class="form-label">Involved Characters</label>
            <div class="checkbox-grid" id="subplot-characters">
              ${buildCharacterOptions(characters, selectedCharIds)}
            </div>
          </div>

          <div class="subplot-editor-actions">
            ${isEdit ? '<button class="btn danger" type="button" id="btn-delete-subplot-page">Delete Plot</button>' : '<span></span>'}
            <div class="subplot-editor-actions-right">
              <button class="btn" type="button" id="btn-cancel-subplot-page">Cancel</button>
              <button class="btn primary" type="button" id="btn-save-subplot-page">Save Plot</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;

  syncCharacterOptionStates(container);

  $('#btn-subplot-back')?.addEventListener('click', () => openBlueprintView());
  $('#btn-cancel-subplot-page')?.addEventListener('click', () => openBlueprintView());
  $('#btn-save-subplot-page')?.addEventListener('click', saveSubplotFromEditor);
  $('#btn-delete-subplot-page')?.addEventListener('click', () => {
    if (!subplot?.id) return;
    if (!confirm('Delete this plot?')) return;
    removeSubplot(subplot.id);
    activeSubplotId = null;
    document.dispatchEvent(new CustomEvent('blueprint-changed'));
    openBlueprintView();
  });
}

function saveSubplotFromEditor() {
  const subplot = getActiveSubplot();
  const name = document.getElementById('subplot-name')?.value.trim() || '';
  const type = document.getElementById('subplot-type')?.value || 'growth';
  const startBeat = document.getElementById('subplot-start')?.value || '';
  const resolveBeat = document.getElementById('subplot-resolve')?.value || '';

  const characterIds = [];
  document.querySelectorAll('#subplot-characters .subplot-char-checkbox:checked').forEach(cb => {
    characterIds.push(cb.value);
  });

  upsertSubplot({
    id: subplot?.id || generateId('subplot'),
    name: name || 'Unnamed Subplot',
    type,
    characterIds,
    startBeat: startBeat || null,
    resolveBeat: resolveBeat || null,
    touchpoints: subplot?.touchpoints || []
  });

  activeSubplotId = null;
  document.dispatchEvent(new CustomEvent('blueprint-changed'));
  openBlueprintView();
}

function openBlueprintView() {
  activeSubplotId = null;
  if (typeof window.switchToTab === 'function') {
    window.switchToTab('blueprint');
  }
}

export function openSubplotEditor(subplotId = null) {
  activeSubplotId = subplotId || null;
  if (typeof window.showStandaloneView === 'function') {
    window.showStandaloneView('subplot-editor');
  }
}

/**
 * Attach event listeners
 */
function attachListeners() {
  document.getElementById('btn-add-subplot')?.addEventListener('click', () => {
    openSubplotEditor(null);
  });

  document.querySelectorAll('.btn-edit-subplot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const subplot = state.project.blueprint.subplots.find(s => s.id === id);
      if (subplot) openSubplotEditor(subplot.id);
    });
  });

  document.querySelectorAll('.btn-delete-subplot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.target.dataset.id;
      if (confirm('Delete this subplot?')) {
        removeSubplot(id);
        render();
        document.dispatchEvent(new CustomEvent('blueprint-changed'));
      }
    });
  });
}

export default {
  initSubplots,
  render,
  renderSubplotEditorView,
  openSubplotEditor,
  SUBPLOT_TYPES
};
