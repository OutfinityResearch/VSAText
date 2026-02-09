/**
 * SCRIPTA Demo - Templates Gallery
 * 
 * Pre-defined story templates for quick setup.
 * Now with custom template creation support.
 */

import state from '../state.mjs';
import { getTemplates, getTemplate, applyTemplate, getArc, getArcs } from './blueprint-state.mjs';
import { openModal, closeModal, genId } from '../utils.mjs';

let galleryContainer = null;

// Track selected template
let selectedTemplate = null;

// Custom templates storage (in-memory, persisted to project)
function getCustomTemplates() {
  return state.project.libraries.customTemplates || [];
}

function saveCustomTemplate(template) {
  if (!state.project.libraries.customTemplates) {
    state.project.libraries.customTemplates = [];
  }
  const existing = state.project.libraries.customTemplates.findIndex(t => t.id === template.id);
  if (existing >= 0) {
    state.project.libraries.customTemplates[existing] = template;
  } else {
    state.project.libraries.customTemplates.push(template);
  }
}

function deleteCustomTemplate(id) {
  if (!state.project.libraries.customTemplates) return;
  state.project.libraries.customTemplates = state.project.libraries.customTemplates.filter(t => t.id !== id);
}

/**
 * Initialize the templates gallery
 * @param {HTMLElement} container 
 */
export function initTemplates(container) {
  galleryContainer = container;
  // Restore selected template from blueprint if available
  selectedTemplate = state.project.blueprint.selectedTemplate || null;
  render();
}

/**
 * Render the templates gallery
 */
export function render() {
  if (!galleryContainer) return;
  
  const templates = getTemplates();
  const customTemplates = getCustomTemplates();
  
  galleryContainer.innerHTML = `
    <div class="templates-header">
      <h3>Story Templates</h3>
      <p class="templates-desc">Select a template to quickly set up your story structure, or create your own custom template.</p>
    </div>
    
    <div class="templates-actions-bar">
      <button class="btn" id="btn-create-template">+ Create Custom Template</button>
    </div>
    
    ${customTemplates.length > 0 ? `
      <div class="templates-section">
        <h4 class="section-title">Your Custom Templates</h4>
        <div class="templates-grid">
          ${customTemplates.map(t => renderCustomTemplateCard(t)).join('')}
        </div>
      </div>
    ` : ''}
    
    <div class="templates-section">
      <h4 class="section-title">Built-in Templates</h4>
      <div class="templates-grid">
        ${Object.entries(templates).map(([key, template]) => renderTemplateCard(key, template)).join('')}
      </div>
    </div>
    
    <div class="templates-preview" id="template-preview">
      <p class="preview-placeholder">Hover over a template to preview</p>
    </div>
  `;
  
  attachListeners();
}

/**
 * Render a single template card
 */
function renderTemplateCard(key, template) {
  const arc = getArc(template.arc);
  const complexityClass = `complexity-${template.complexity}`;
  const isSelected = selectedTemplate === key;
  
  return `
    <div class="template-card ${complexityClass} ${isSelected ? 'selected' : ''}" data-template="${key}">
      <div class="template-icon">${getTemplateIcon(key)}</div>
      <div class="template-info">
        <h4 class="template-name">${template.label}</h4>
        <p class="template-desc">${template.description}</p>
        <div class="template-meta">
          <span class="meta-arc">${arc?.label || template.arc}</span>
          <span class="meta-chapters">${template.chapters} chapters</span>
          <span class="meta-dialogues">${template.dialogueMarkers?.length || 0} dialogues</span>
        </div>
        <div class="template-genres">
          ${(template.suggestedGenres || []).map(g => `<span class="genre-tag">${g}</span>`).join('')}
        </div>
      </div>
      <button class="btn-apply ${isSelected ? 'applied' : ''}" data-template="${key}">${isSelected ? 'Applied' : 'Apply'}</button>
    </div>
  `;
}

/**
 * Render a custom template card
 */
function renderCustomTemplateCard(template) {
  const arc = getArc(template.arc);
  const isSelected = selectedTemplate === `custom_${template.id}`;
  
  return `
    <div class="template-card custom-template ${isSelected ? 'selected' : ''}" data-custom-id="${template.id}">
      <div class="template-icon">${template.icon || '📝'}</div>
      <div class="template-info">
        <h4 class="template-name">${template.label}</h4>
        <p class="template-desc">${template.description || 'Custom template'}</p>
        <div class="template-meta">
          <span class="meta-arc">${arc?.label || template.arc}</span>
          <span class="meta-chapters">${template.chapters || 0} chapters</span>
        </div>
      </div>
      <div class="template-actions">
        <button class="btn-apply-custom ${isSelected ? 'applied' : ''}" data-custom-id="${template.id}">${isSelected ? 'Applied' : 'Apply'}</button>
        <button class="btn-edit-custom btn-icon" data-custom-id="${template.id}" title="Edit">✏️</button>
        <button class="btn-delete-custom btn-icon" data-custom-id="${template.id}" title="Delete">🗑️</button>
      </div>
    </div>
  `;
}

/**
 * Get icon for template type
 */
function getTemplateIcon(key) {
  const icons = {
    classic_hero: '⚔️',
    mystery_reveal: '🔍',
    romance_obstacles: '💕',
    tragic_fall: '🎭',
    action_adventure: '🚀',
    coming_of_age: '🌱',
    ensemble_drama: '👥',
    minimal_conflict: '🌸'
  };
  return icons[key] || '📖';
}

/**
 * Render template preview
 */
function renderPreview(templateKey) {
  const preview = document.getElementById('template-preview');
  if (!preview) return;
  
  const template = getTemplate(templateKey);
  if (!template) {
    preview.innerHTML = '<p class="preview-placeholder">Template not found</p>';
    return;
  }
  
  const arc = getArc(template.arc);
  const beats = arc?.beats || [];
  
  preview.innerHTML = `
    <div class="preview-content">
      <h4>${template.label}</h4>
      
      <div class="preview-section">
        <h5>Narrative Arc: ${arc?.label || template.arc}</h5>
        <div class="preview-beats">
          ${beats.slice(0, 6).map(b => `
            <span class="preview-beat" style="left: ${b.position * 100}%">${b.key}</span>
          `).join('')}
          ${beats.length > 6 ? `<span class="preview-more">+${beats.length - 6} more</span>` : ''}
        </div>
      </div>
      
      <div class="preview-section">
        <h5>Planned Dialogues</h5>
        <ul class="preview-dialogues">
          ${(template.dialogueMarkers || []).map(dm => `
            <li>
              <span class="dialogue-purpose">${dm.purpose}</span>
              at <span class="dialogue-beat">${dm.beatKey}</span>
              <span class="dialogue-desc">${dm.description}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      
      <div class="preview-section">
        <h5>Tension Curve</h5>
        <div class="preview-tension">
          ${renderMiniTensionCurve(template.tensionPreset)}
        </div>
      </div>
    </div>
  `;
}

/**
 * Render a mini tension curve for preview
 */
function renderMiniTensionCurve(tensionPreset) {
  if (!tensionPreset || tensionPreset.length < 2) {
    return '<span class="no-tension">No tension curve</span>';
  }
  
  const width = 200;
  const height = 40;
  
  const points = tensionPreset.map(p => {
    const x = p.position * width;
    const y = height - ((p.tension - 1) / 4) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return `
    <svg width="${width}" height="${height}" class="mini-tension">
      <polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="2"/>
      ${tensionPreset.map(p => {
        const x = p.position * width;
        const y = height - ((p.tension - 1) / 4) * height;
        return `<circle cx="${x}" cy="${y}" r="3" fill="var(--accent)"/>`;
      }).join('')}
    </svg>
  `;
}

/**
 * Attach event listeners
 */
function attachListeners() {
  // Create new template button
  document.getElementById('btn-create-template')?.addEventListener('click', () => {
    showTemplateForm(null);
  });
  
  // Hover for preview
  document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('mouseenter', (e) => {
      const key = card.dataset.template;
      if (key) renderPreview(key);
    });
  });
  
  // Apply built-in template button
  document.querySelectorAll('.btn-apply').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.template;
      
      if (confirm(`Apply template "${getTemplate(key)?.label}"? This will update your blueprint settings.`)) {
        applyTemplate(key);
        
        // Save selected template in state
        selectedTemplate = key;
        state.project.blueprint.selectedTemplate = key;
        
        // Re-render to show selected state
        render();
        
        // Dispatch event for other components to update
        document.dispatchEvent(new CustomEvent('blueprint-changed'));
      }
    });
  });
  
  // Apply custom template
  document.querySelectorAll('.btn-apply-custom').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.customId;
      const template = getCustomTemplates().find(t => t.id === id);
      if (!template) return;
      
      if (confirm(`Apply custom template "${template.label}"?`)) {
        applyCustomTemplate(template);
        selectedTemplate = `custom_${id}`;
        state.project.blueprint.selectedTemplate = `custom_${id}`;
        render();
        document.dispatchEvent(new CustomEvent('blueprint-changed'));
      }
    });
  });
  
  // Edit custom template
  document.querySelectorAll('.btn-edit-custom').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.customId;
      const template = getCustomTemplates().find(t => t.id === id);
      if (template) showTemplateForm(template);
    });
  });
  
  // Delete custom template
  document.querySelectorAll('.btn-delete-custom').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.customId;
      const template = getCustomTemplates().find(t => t.id === id);
      if (template && confirm(`Delete template "${template.label}"?`)) {
        deleteCustomTemplate(id);
        render();
      }
    });
  });
}

/**
 * Apply a custom template to the project
 */
function applyCustomTemplate(template) {
  // Set arc
  if (template.arc) {
    state.project.blueprint.arc = template.arc;
    state.project.selectedArc = template.arc;
  }
  
  // Apply tension curve if defined
  if (template.tensionPreset && template.tensionPreset.length > 0) {
    state.project.blueprint.tensionCurve = template.tensionPreset;
  }
}

/**
 * Show template creation/edit form
 */
function showTemplateForm(template) {
  const isEdit = !!template;
  const arcs = getArcs();
  
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const saveBtn = document.getElementById('btn-modal-save');
  
  if (!modalTitle || !modalBody) return;
  
  modalTitle.textContent = isEdit ? 'Edit Custom Template' : 'Create Custom Template';
  
  const icons = ['📖', '⚔️', '🔍', '💕', '🎭', '🚀', '🌱', '👥', '🌸', '🔮', '🏰', '🌙', '⭐', '🎪', '🎯'];
  
  modalBody.innerHTML = `
    <div class="form-group">
      <label class="form-label">Template Name</label>
      <input type="text" class="form-input" id="tpl-name" value="${template?.label || ''}" placeholder="My Story Template">
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Icon</label>
        <div class="icon-picker" id="tpl-icon-picker">
          ${icons.map(icon => `
            <span class="icon-option ${template?.icon === icon ? 'selected' : ''}" data-icon="${icon}">${icon}</span>
          `).join('')}
        </div>
        <input type="hidden" id="tpl-icon" value="${template?.icon || '📖'}">
      </div>
      
      <div class="form-group">
        <label class="form-label">Narrative Arc</label>
        <select class="form-select" id="tpl-arc">
          ${Object.entries(arcs)
            .filter(([key, arc]) => arc.scope === 'work')
            .map(([key, arc]) => `
              <option value="${key}" ${template?.arc === key ? 'selected' : ''}>
                ${arc.label} (${arc.beats?.length || 0} beats)
              </option>
            `).join('')}
        </select>
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-textarea" id="tpl-desc" rows="2" placeholder="A brief description of this template...">${template?.description || ''}</textarea>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Number of Chapters</label>
        <input type="number" class="form-input" id="tpl-chapters" min="1" max="50" value="${template?.chapters || 12}">
      </div>
      
      <div class="form-group">
        <label class="form-label">Complexity</label>
        <select class="form-select" id="tpl-complexity">
          <option value="simple" ${template?.complexity === 'simple' ? 'selected' : ''}>Simple</option>
          <option value="medium" ${template?.complexity === 'medium' || !template ? 'selected' : ''}>Medium</option>
          <option value="complex" ${template?.complexity === 'complex' ? 'selected' : ''}>Complex</option>
        </select>
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label">Tension Curve Preset</label>
      <select class="form-select" id="tpl-tension-preset">
        <option value="none">No preset</option>
        <option value="rising" ${template?.tensionPresetType === 'rising' ? 'selected' : ''}>Rising (builds to climax)</option>
        <option value="mountain" ${template?.tensionPresetType === 'mountain' ? 'selected' : ''}>Mountain (peak in middle)</option>
        <option value="wave" ${template?.tensionPresetType === 'wave' ? 'selected' : ''}>Wave (multiple peaks)</option>
        <option value="valley" ${template?.tensionPresetType === 'valley' ? 'selected' : ''}>Valley (low point in middle)</option>
      </select>
    </div>
    
    <div class="form-group">
      <label class="form-label">Suggested Genres (comma-separated)</label>
      <input type="text" class="form-input" id="tpl-genres" value="${(template?.suggestedGenres || []).join(', ')}" placeholder="fantasy, adventure, drama">
    </div>
  `;
  
  // Icon picker interaction
  modalBody.querySelectorAll('.icon-option').forEach(opt => {
    opt.addEventListener('click', () => {
      modalBody.querySelectorAll('.icon-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      document.getElementById('tpl-icon').value = opt.dataset.icon;
    });
  });
  
  saveBtn.onclick = () => {
    const name = document.getElementById('tpl-name').value.trim();
    if (!name) {
      alert('Please enter a template name');
      return;
    }
    
    const tensionPresets = {
      rising: [{ position: 0, tension: 1 }, { position: 0.5, tension: 3 }, { position: 1, tension: 5 }],
      mountain: [{ position: 0, tension: 1 }, { position: 0.5, tension: 5 }, { position: 1, tension: 2 }],
      wave: [{ position: 0, tension: 2 }, { position: 0.25, tension: 4 }, { position: 0.5, tension: 2 }, { position: 0.75, tension: 5 }, { position: 1, tension: 3 }],
      valley: [{ position: 0, tension: 4 }, { position: 0.5, tension: 1 }, { position: 1, tension: 5 }]
    };
    
    const tensionPresetType = document.getElementById('tpl-tension-preset').value;
    const genresRaw = document.getElementById('tpl-genres').value;
    
    const newTemplate = {
      id: template?.id || genId(),
      label: name,
      icon: document.getElementById('tpl-icon').value,
      arc: document.getElementById('tpl-arc').value,
      description: document.getElementById('tpl-desc').value.trim(),
      chapters: parseInt(document.getElementById('tpl-chapters').value) || 12,
      complexity: document.getElementById('tpl-complexity').value,
      tensionPresetType: tensionPresetType !== 'none' ? tensionPresetType : null,
      tensionPreset: tensionPresets[tensionPresetType] || null,
      suggestedGenres: genresRaw ? genresRaw.split(',').map(g => g.trim()).filter(Boolean) : []
    };
    
    saveCustomTemplate(newTemplate);
    closeModal('entity-modal');
    render();
  };
  
  openModal('entity-modal');
}

export default {
  initTemplates,
  render
};
