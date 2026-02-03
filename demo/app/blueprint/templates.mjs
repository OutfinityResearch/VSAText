/**
 * SCRIPTA Demo - Templates Gallery
 * 
 * Pre-defined story templates for quick setup.
 */

import state from '../state.mjs';
import { getTemplates, getTemplate, applyTemplate, getArc } from './blueprint-state.mjs';

let galleryContainer = null;

/**
 * Initialize the templates gallery
 * @param {HTMLElement} container 
 */
export function initTemplates(container) {
  galleryContainer = container;
  render();
}

/**
 * Render the templates gallery
 */
export function render() {
  if (!galleryContainer) return;
  
  const templates = getTemplates();
  
  galleryContainer.innerHTML = `
    <div class="templates-header">
      <h3>Story Templates</h3>
      <p class="templates-desc">Select a template to quickly set up your story structure</p>
    </div>
    
    <div class="templates-grid">
      ${Object.entries(templates).map(([key, template]) => renderTemplateCard(key, template)).join('')}
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
  
  return `
    <div class="template-card ${complexityClass}" data-template="${key}">
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
      <button class="btn-apply" data-template="${key}">Apply</button>
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
  // Hover for preview
  document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('mouseenter', (e) => {
      const key = card.dataset.template;
      renderPreview(key);
    });
  });
  
  // Apply button
  document.querySelectorAll('.btn-apply').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.dataset.template;
      
      if (confirm(`Apply template "${getTemplate(key)?.label}"? This will update your blueprint settings.`)) {
        applyTemplate(key);
        
        // Visual feedback
        btn.textContent = 'Applied!';
        btn.classList.add('applied');
        setTimeout(() => {
          btn.textContent = 'Apply';
          btn.classList.remove('applied');
        }, 2000);
        
        // Dispatch event for other components to update
        document.dispatchEvent(new CustomEvent('blueprint-changed'));
      }
    });
  });
}

export default {
  initTemplates,
  render
};
