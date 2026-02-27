/**
 * SCRIPTA Demo - Subplots Component
 * 
 * UI for managing story subplots.
 */

import state from '../state.mjs';
import { upsertSubplot, removeSubplot } from '../state.mjs';
import { generateId } from '../utils.mjs';
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
      <button class="btn" id="btn-add-subplot">+ Add Subplot</button>
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
        <button class="btn btn-small btn-edit-subplot" data-id="${subplot.id}">Edit</button>
      </div>
    </div>
  `;
}

/**
 * Show subplot edit modal
 */
function showSubplotModal(subplot = null) {
  const isEdit = !!subplot;
  const characters = state.project.libraries.characters || [];
  const beats = getCurrentArcBeats();
  
  const modal = document.getElementById('entity-modal');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const saveBtn = document.getElementById('btn-modal-save');
  
  if (!modal || !titleEl || !bodyEl) return;
  
  titleEl.textContent = isEdit ? 'Edit Subplot' : 'Add Subplot';
  
  const selectedCharIds = subplot?.characterIds || [];
  
  bodyEl.innerHTML = `
    <div class="form-group">
      <label class="form-label">Subplot Name</label>
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
      <label class="form-label">Involved Characters</label>
      <div class="checkbox-grid" id="subplot-characters">
        ${characters.length === 0 ? `
          <div class="subplot-char-empty">No characters available, add characters first in Cast.</div>
        ` : characters.map(c => `
          <label class="checkbox-item subplot-char-option ${selectedCharIds.includes(c.id) ? 'selected' : ''}">
            <input class="subplot-char-checkbox" type="checkbox" value="${c.id}" 
                   ${selectedCharIds.includes(c.id) ? 'checked' : ''}>
            <span>${c.name} (${c.archetype || 'character'})</span>
          </label>
        `).join('')}
      </div>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Starts at Beat</label>
        <select class="form-select" id="subplot-start">
          <option value="">-- Select beat --</option>
          ${beats.map(b => `
            <option value="${b.key}" ${subplot?.startBeat === b.key ? 'selected' : ''}>
              ${b.label} (${Math.round(b.position * 100)}%)
            </option>
          `).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Resolves at Beat</label>
        <select class="form-select" id="subplot-resolve">
          <option value="">-- Select beat --</option>
          ${beats.map(b => `
            <option value="${b.key}" ${subplot?.resolveBeat === b.key ? 'selected' : ''}>
              ${b.label} (${Math.round(b.position * 100)}%)
            </option>
          `).join('')}
        </select>
      </div>
    </div>
  `;

  // Keep selection visibly synced for character options.
  document.querySelectorAll('#subplot-characters .subplot-char-checkbox').forEach((checkbox) => {
    const syncSelectedState = () => {
      const row = checkbox.closest('.subplot-char-option');
      if (row) row.classList.toggle('selected', checkbox.checked);
    };
    checkbox.addEventListener('change', syncSelectedState);
    syncSelectedState();
  });
  
  saveBtn.onclick = () => {
    const name = document.getElementById('subplot-name').value.trim();
    const type = document.getElementById('subplot-type').value;
    const startBeat = document.getElementById('subplot-start').value;
    const resolveBeat = document.getElementById('subplot-resolve').value;
    
    const characterIds = [];
    document.querySelectorAll('#subplot-characters .subplot-char-checkbox:checked').forEach(cb => {
      characterIds.push(cb.value);
    });
    
    const newSubplot = {
      id: subplot?.id || generateId('subplot'),
      name: name || 'Unnamed Subplot',
      type,
      characterIds,
      startBeat: startBeat || null,
      resolveBeat: resolveBeat || null,
      touchpoints: subplot?.touchpoints || []
    };
    
    upsertSubplot(newSubplot);
    closeModal();
    render();
    
    // Notify blueprint changed
    document.dispatchEvent(new CustomEvent('blueprint-changed'));
  };
  
  modal.classList.add('open');
}

/**
 * Close modal
 */
function closeModal() {
  const modal = document.getElementById('entity-modal');
  if (modal) modal.classList.remove('open');
}

/**
 * Attach event listeners
 */
function attachListeners() {
  // Add subplot button
  document.getElementById('btn-add-subplot')?.addEventListener('click', () => {
    showSubplotModal(null);
  });
  
  // Edit subplot buttons
  document.querySelectorAll('.btn-edit-subplot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const subplot = state.project.blueprint.subplots.find(s => s.id === id);
      if (subplot) showSubplotModal(subplot);
    });
  });
  
  // Delete subplot buttons
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
  SUBPLOT_TYPES
};
