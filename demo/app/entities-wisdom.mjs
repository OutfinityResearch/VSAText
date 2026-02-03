/**
 * SCRIPTA Demo - Wisdom Entity Management
 * 
 * Renders the Wisdom tab with philosophical insights, moral teachings,
 * psychological truths, and life lessons that stories can illuminate.
 */

import { state } from './state.mjs';
import { $, $$, genId, openModal, closeModal } from './utils.mjs';
import { generateCNL } from './cnl.mjs';
import {
  PHILOSOPHICAL_TRADITIONS,
  MORAL_INSIGHTS,
  PSYCHOLOGICAL_INSIGHTS,
  SCIENTIFIC_INSIGHTS,
  HUMANIST_PRINCIPLES,
  LIFE_LESSONS,
  WISDOM_CATEGORIES
} from '/src/vocabularies/vocab-wisdom.mjs';

// ==================== WISDOM VIEW ====================
export function renderWisdomView() {
  const container = $('#wisdom-view');
  if (!container) return;
  
  const wisdomItems = state.project.libraries.wisdom || [];
  
  let html = `
    <div class="wisdom-container">
      <div class="wisdom-sidebar">
        <div class="wisdom-section">
          <div class="wisdom-section-header" onclick="toggleWisdomSection('traditions')">
            <span class="section-icon">+</span>
            <span>Philosophical Traditions</span>
            <span class="section-count">${Object.keys(PHILOSOPHICAL_TRADITIONS).length}</span>
          </div>
          <div class="wisdom-section-content" id="section-traditions" style="display:none;">
            ${renderTraditionsSection()}
          </div>
        </div>
        
        <div class="wisdom-section">
          <div class="wisdom-section-header" onclick="toggleWisdomSection('moral')">
            <span class="section-icon">+</span>
            <span>Moral Insights</span>
            <span class="section-count">${Object.keys(MORAL_INSIGHTS).length}</span>
          </div>
          <div class="wisdom-section-content" id="section-moral" style="display:none;">
            ${renderMoralSection()}
          </div>
        </div>
        
        <div class="wisdom-section">
          <div class="wisdom-section-header" onclick="toggleWisdomSection('psychological')">
            <span class="section-icon">+</span>
            <span>Psychological Insights</span>
            <span class="section-count">${Object.keys(PSYCHOLOGICAL_INSIGHTS).length}</span>
          </div>
          <div class="wisdom-section-content" id="section-psychological" style="display:none;">
            ${renderPsychologicalSection()}
          </div>
        </div>
        
        <div class="wisdom-section">
          <div class="wisdom-section-header" onclick="toggleWisdomSection('scientific')">
            <span class="section-icon">+</span>
            <span>Scientific Insights</span>
            <span class="section-count">${Object.keys(SCIENTIFIC_INSIGHTS).length}</span>
          </div>
          <div class="wisdom-section-content" id="section-scientific" style="display:none;">
            ${renderScientificSection()}
          </div>
        </div>
        
        <div class="wisdom-section">
          <div class="wisdom-section-header" onclick="toggleWisdomSection('humanist')">
            <span class="section-icon">+</span>
            <span>Humanist Principles</span>
            <span class="section-count">${Object.keys(HUMANIST_PRINCIPLES).length}</span>
          </div>
          <div class="wisdom-section-content" id="section-humanist" style="display:none;">
            ${renderHumanistSection()}
          </div>
        </div>
        
        <div class="wisdom-section">
          <div class="wisdom-section-header" onclick="toggleWisdomSection('lessons')">
            <span class="section-icon">+</span>
            <span>Life Lessons</span>
            <span class="section-count">${Object.keys(LIFE_LESSONS).length}</span>
          </div>
          <div class="wisdom-section-content" id="section-lessons" style="display:none;">
            ${renderLessonsSection()}
          </div>
        </div>
      </div>
      
      <div class="wisdom-main">
        <div class="wisdom-header">
          <h3>Story Wisdom Elements</h3>
          <button class="btn" onclick="showCustomWisdomModal()">+ Custom Wisdom</button>
        </div>
        
        ${wisdomItems.length === 0 ? `
          <div class="wisdom-empty">
            <div class="wisdom-empty-icon">&#128218;</div>
            <div class="wisdom-empty-text">No wisdom elements yet</div>
            <div class="wisdom-empty-hint">
              Browse the categories on the left and click "Add" to include wisdom elements in your story.
              These represent the deeper meanings, life lessons, and philosophical insights your story conveys.
            </div>
          </div>
        ` : `
          <div class="wisdom-grid">
            ${wisdomItems.map(w => renderWisdomCard(w)).join('')}
          </div>
        `}
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

// ==================== SECTION RENDERERS ====================
function renderTraditionsSection() {
  return Object.entries(PHILOSOPHICAL_TRADITIONS).map(([key, t]) => `
    <div class="wisdom-item">
      <div class="wisdom-item-header">
        <span class="wisdom-item-label">${t.label}</span>
        <button class="btn small" onclick="addWisdomFromVocab('tradition', '${key}')">Add</button>
      </div>
      <div class="wisdom-item-origin">${t.origin}</div>
      <div class="wisdom-item-principle">"${t.corePrinciple}"</div>
      <div class="wisdom-item-insights">
        ${t.keyInsights.slice(0, 2).map(i => `<div class="insight-item">${i}</div>`).join('')}
      </div>
      <div class="wisdom-item-examples">Ex: ${t.examples}</div>
    </div>
  `).join('');
}

function renderMoralSection() {
  return Object.entries(MORAL_INSIGHTS).map(([key, m]) => `
    <div class="wisdom-item">
      <div class="wisdom-item-header">
        <span class="wisdom-item-label">${m.label}</span>
        <button class="btn small" onclick="addWisdomFromVocab('moral', '${key}')">Add</button>
      </div>
      <div class="wisdom-item-principle">"${m.insight}"</div>
      <div class="wisdom-item-applications">${m.storyApplications.slice(0, 2).join(', ')}</div>
      <div class="wisdom-item-examples">Ex: ${m.examples}</div>
    </div>
  `).join('');
}

function renderPsychologicalSection() {
  return Object.entries(PSYCHOLOGICAL_INSIGHTS).map(([key, p]) => `
    <div class="wisdom-item">
      <div class="wisdom-item-header">
        <span class="wisdom-item-label">${p.label}</span>
        <button class="btn small" onclick="addWisdomFromVocab('psychological', '${key}')">Add</button>
      </div>
      <div class="wisdom-item-principle">"${p.insight}"</div>
      <div class="wisdom-item-source">Source: ${p.source}</div>
      <div class="wisdom-item-examples">Ex: ${p.examples}</div>
    </div>
  `).join('');
}

function renderScientificSection() {
  return Object.entries(SCIENTIFIC_INSIGHTS).map(([key, s]) => `
    <div class="wisdom-item">
      <div class="wisdom-item-header">
        <span class="wisdom-item-label">${s.label}</span>
        <button class="btn small" onclick="addWisdomFromVocab('scientific', '${key}')">Add</button>
      </div>
      <div class="wisdom-item-principle">"${s.insight}"</div>
      <div class="wisdom-item-source">Source: ${s.source}</div>
      <div class="wisdom-item-examples">Ex: ${s.examples}</div>
    </div>
  `).join('');
}

function renderHumanistSection() {
  return Object.entries(HUMANIST_PRINCIPLES).map(([key, h]) => `
    <div class="wisdom-item">
      <div class="wisdom-item-header">
        <span class="wisdom-item-label">${h.label}</span>
        <button class="btn small" onclick="addWisdomFromVocab('humanist', '${key}')">Add</button>
      </div>
      <div class="wisdom-item-principle">"${h.principle}"</div>
      <div class="wisdom-item-applications">${h.storyApplications.join(', ')}</div>
      <div class="wisdom-item-examples">Ex: ${h.examples}</div>
    </div>
  `).join('');
}

function renderLessonsSection() {
  const categories = { self: [], others: [], life: [], action: [] };
  Object.entries(LIFE_LESSONS).forEach(([key, l]) => {
    if (categories[l.category]) {
      categories[l.category].push({ key, ...l });
    }
  });
  
  return Object.entries(categories).map(([cat, lessons]) => `
    <div class="lessons-category">
      <div class="lessons-category-title">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
      ${lessons.map(l => `
        <div class="wisdom-item compact">
          <div class="wisdom-item-header">
            <span class="wisdom-item-lesson">"${l.lesson}"</span>
            <button class="btn small" onclick="addWisdomFromVocab('lesson', '${l.key}')">Add</button>
          </div>
          <div class="wisdom-item-origin">${l.origin}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

// ==================== WISDOM CARDS ====================
function renderWisdomCard(w) {
  const categoryInfo = WISDOM_CATEGORIES[w.category] || { icon: '?', label: w.category };
  return `
    <div class="wisdom-card" data-id="${w.id}">
      <div class="wisdom-card-header">
        <span class="wisdom-card-icon">${categoryInfo.icon}</span>
        <span class="wisdom-card-category">${categoryInfo.label}</span>
        <button class="wisdom-card-remove" onclick="removeWisdomFromStory('${w.id}')" title="Remove">x</button>
      </div>
      <div class="wisdom-card-label">${w.label}</div>
      <div class="wisdom-card-insight">${w.insight}</div>
      ${w.application ? `<div class="wisdom-card-application">Application: ${w.application}</div>` : ''}
      ${w.examples ? `<div class="wisdom-card-examples">Ex: ${w.examples}</div>` : ''}
    </div>
  `;
}

// ==================== WISDOM ACTIONS ====================
window.toggleWisdomSection = (sectionId) => {
  const content = $(`#section-${sectionId}`);
  if (!content) return;
  
  const isHidden = content.style.display === 'none';
  content.style.display = isHidden ? 'block' : 'none';
  
  // Update icon
  const header = content.previousElementSibling;
  const icon = header?.querySelector('.section-icon');
  if (icon) {
    icon.textContent = isHidden ? '-' : '+';
  }
};

window.addWisdomFromVocab = (type, key) => {
  let wisdom = null;
  
  switch (type) {
    case 'tradition': {
      const t = PHILOSOPHICAL_TRADITIONS[key];
      wisdom = {
        id: genId(),
        category: 'philosophical',
        sourceType: 'tradition',
        sourceKey: key,
        label: t.label,
        insight: t.corePrinciple,
        keyInsights: t.keyInsights,
        application: t.storyApplications.join('; '),
        examples: t.examples
      };
      break;
    }
    case 'moral': {
      const m = MORAL_INSIGHTS[key];
      wisdom = {
        id: genId(),
        category: 'moral',
        sourceType: 'moral',
        sourceKey: key,
        label: m.label,
        insight: m.insight,
        application: m.storyApplications.join('; '),
        examples: m.examples
      };
      break;
    }
    case 'psychological': {
      const p = PSYCHOLOGICAL_INSIGHTS[key];
      wisdom = {
        id: genId(),
        category: 'psychological',
        sourceType: 'psychological',
        sourceKey: key,
        label: p.label,
        insight: p.insight,
        source: p.source,
        application: p.storyApplications.join('; '),
        examples: p.examples
      };
      break;
    }
    case 'scientific': {
      const s = SCIENTIFIC_INSIGHTS[key];
      wisdom = {
        id: genId(),
        category: 'scientific',
        sourceType: 'scientific',
        sourceKey: key,
        label: s.label,
        insight: s.insight,
        source: s.source,
        application: s.storyApplications.join('; '),
        examples: s.examples
      };
      break;
    }
    case 'humanist': {
      const h = HUMANIST_PRINCIPLES[key];
      wisdom = {
        id: genId(),
        category: 'moral',
        sourceType: 'humanist',
        sourceKey: key,
        label: h.label,
        insight: h.principle,
        application: h.storyApplications.join('; '),
        examples: h.examples
      };
      break;
    }
    case 'lesson': {
      const l = LIFE_LESSONS[key];
      wisdom = {
        id: genId(),
        category: 'practical',
        sourceType: 'lesson',
        sourceKey: key,
        label: l.lesson,
        insight: l.lesson,
        origin: l.origin,
        lessonCategory: l.category
      };
      break;
    }
  }
  
  if (wisdom) {
    // Check for duplicates
    const existing = state.project.libraries.wisdom.find(
      w => w.sourceType === wisdom.sourceType && w.sourceKey === wisdom.sourceKey
    );
    if (existing) {
      window.showNotification?.('This wisdom element is already in your story', 'info');
      return;
    }
    
    state.project.libraries.wisdom.push(wisdom);
    renderWisdomView();
    generateCNL();
    window.showNotification?.(`Added: ${wisdom.label}`, 'success');
  }
};

window.removeWisdomFromStory = (id) => {
  const wisdom = state.project.libraries.wisdom.find(w => w.id === id);
  if (!wisdom) return;
  
  state.project.libraries.wisdom = state.project.libraries.wisdom.filter(w => w.id !== id);
  renderWisdomView();
  generateCNL();
  window.showNotification?.(`Removed: ${wisdom.label}`, 'info');
};

window.showCustomWisdomModal = () => {
  $('#modal-title').textContent = 'Add Custom Wisdom';
  
  const categoryOptions = Object.entries(WISDOM_CATEGORIES)
    .map(([k, v]) => `<option value="${k}">${v.icon} ${v.label}</option>`)
    .join('');
  
  $('#modal-body').innerHTML = `
    <div class="form-group">
      <label class="form-label">Category</label>
      <select class="form-select" id="wisdom-category">${categoryOptions}</select>
    </div>
    <div class="form-group">
      <label class="form-label">Label / Title</label>
      <input class="form-input" id="wisdom-label" placeholder="e.g., 'The Nature of Courage'">
    </div>
    <div class="form-group">
      <label class="form-label">Core Insight</label>
      <textarea class="form-textarea" id="wisdom-insight" rows="3" 
        placeholder="The central truth or lesson..."></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Story Application (optional)</label>
      <input class="form-input" id="wisdom-application" 
        placeholder="How this applies to your story...">
    </div>
    <div class="form-group">
      <label class="form-label">Examples (optional)</label>
      <input class="form-input" id="wisdom-examples" 
        placeholder="Works that embody this wisdom...">
    </div>
  `;
  
  $('#btn-modal-save').onclick = saveCustomWisdom;
  openModal('entity-modal');
};

function saveCustomWisdom() {
  const label = $('#wisdom-label').value.trim();
  const insight = $('#wisdom-insight').value.trim();
  
  if (!label || !insight) {
    window.showNotification?.('Label and insight are required', 'error');
    return;
  }
  
  const wisdom = {
    id: genId(),
    category: $('#wisdom-category').value,
    sourceType: 'custom',
    label,
    insight,
    application: $('#wisdom-application').value.trim() || null,
    examples: $('#wisdom-examples').value.trim() || null
  };
  
  state.project.libraries.wisdom.push(wisdom);
  closeModal('entity-modal');
  renderWisdomView();
  generateCNL();
  window.showNotification?.(`Added custom wisdom: ${label}`, 'success');
}

export default { renderWisdomView };
