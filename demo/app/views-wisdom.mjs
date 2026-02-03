/**
 * SCRIPTA Demo - Wisdom View
 * 
 * Renders the Wisdom tab with philosophical insights,
 * moral teachings, psychological principles, and custom wisdom elements.
 */

import { state } from './state.mjs';
import { $, genId, openModal } from './utils.mjs';
import {
  PHILOSOPHICAL_TRADITIONS,
  MORAL_INSIGHTS,
  PSYCHOLOGICAL_INSIGHTS,
  SCIENTIFIC_INSIGHTS,
  HUMANIST_PRINCIPLES,
  LIFE_LESSONS,
  WISDOM_CATEGORIES
} from '/src/vocabularies/vocab-wisdom.mjs';

/**
 * Initialize the Wisdom view
 */
export function initWisdomView() {
  const container = $('#wisdom-view');
  if (!container) return;
  
  container.innerHTML = `
    <div class="wisdom-container">
      <div class="wisdom-header">
        <h3>Story Wisdom & Insights</h3>
        <p class="wisdom-intro">What truths does your story illuminate? Stories are humanity's oldest teaching technology.</p>
        <button class="btn accent" id="btn-add-wisdom">+ Add Wisdom Element</button>
      </div>
      
      <div class="wisdom-sections">
        <div class="wisdom-section" id="wisdom-custom">
          <div class="wisdom-section-header">
            <span class="wisdom-icon">✨</span>
            <span>Story's Wisdom Elements</span>
            <span class="wisdom-count">${state.project.libraries.wisdom?.length || 0}</span>
          </div>
          <div class="wisdom-items" id="wisdom-custom-items"></div>
        </div>
        
        <div class="wisdom-section collapsible" id="section-philosophical">
          <div class="wisdom-section-header" data-section="philosophical">
            <span class="wisdom-icon">🎭</span>
            <span>Philosophical Traditions</span>
            <span class="expand-icon">▼</span>
          </div>
          <div class="wisdom-items collapsed" id="philosophical-items"></div>
        </div>
        
        <div class="wisdom-section collapsible" id="section-moral">
          <div class="wisdom-section-header" data-section="moral">
            <span class="wisdom-icon">⚖️</span>
            <span>Moral Insights</span>
            <span class="expand-icon">▼</span>
          </div>
          <div class="wisdom-items collapsed" id="moral-items"></div>
        </div>
        
        <div class="wisdom-section collapsible" id="section-psychological">
          <div class="wisdom-section-header" data-section="psychological">
            <span class="wisdom-icon">🧠</span>
            <span>Psychological Insights</span>
            <span class="expand-icon">▼</span>
          </div>
          <div class="wisdom-items collapsed" id="psychological-items"></div>
        </div>
        
        <div class="wisdom-section collapsible" id="section-scientific">
          <div class="wisdom-section-header" data-section="scientific">
            <span class="wisdom-icon">🔬</span>
            <span>Scientific Insights</span>
            <span class="expand-icon">▼</span>
          </div>
          <div class="wisdom-items collapsed" id="scientific-items"></div>
        </div>
        
        <div class="wisdom-section collapsible" id="section-humanist">
          <div class="wisdom-section-header" data-section="humanist">
            <span class="wisdom-icon">🤝</span>
            <span>Humanist Principles</span>
            <span class="expand-icon">▼</span>
          </div>
          <div class="wisdom-items collapsed" id="humanist-items"></div>
        </div>
        
        <div class="wisdom-section collapsible" id="section-lessons">
          <div class="wisdom-section-header" data-section="lessons">
            <span class="wisdom-icon">📚</span>
            <span>Life Lessons</span>
            <span class="expand-icon">▼</span>
          </div>
          <div class="wisdom-items collapsed" id="lessons-items"></div>
        </div>
      </div>
    </div>
  `;
  
  // Setup event listeners
  setupWisdomEvents(container);
  
  // Populate predefined wisdom
  populatePhilosophical();
  populateMoral();
  populatePsychological();
  populateScientific();
  populateHumanist();
  populateLessons();
  
  // Render custom wisdom
  renderCustomWisdom();
}

/**
 * Setup event listeners
 */
function setupWisdomEvents(container) {
  // Add wisdom button
  container.querySelector('#btn-add-wisdom')?.addEventListener('click', () => {
    openAddWisdomModal();
  });
  
  // Collapsible sections
  container.querySelectorAll('.wisdom-section-header[data-section]').forEach(header => {
    header.addEventListener('click', () => {
      const section = header.dataset.section;
      const items = container.querySelector(`#${section}-items`);
      const icon = header.querySelector('.expand-icon');
      
      if (items) {
        items.classList.toggle('collapsed');
        if (icon) {
          icon.textContent = items.classList.contains('collapsed') ? '▼' : '▲';
        }
      }
    });
  });
}

/**
 * Populate philosophical traditions
 */
function populatePhilosophical() {
  const container = $('#philosophical-items');
  if (!container) return;
  
  container.innerHTML = Object.entries(PHILOSOPHICAL_TRADITIONS).map(([key, t]) => `
    <div class="wisdom-card" data-key="${key}">
      <div class="wisdom-card-header">
        <span class="wisdom-card-title">${t.label}</span>
        <button class="btn small" onclick="addWisdomToStory('philosophical', '${key}')">+ Add</button>
      </div>
      <div class="wisdom-card-origin">${t.origin}</div>
      <div class="wisdom-card-principle">"${t.corePrinciple}"</div>
      <div class="wisdom-card-insights">
        ${t.keyInsights.map(i => `<span class="insight-tag">${i}</span>`).join('')}
      </div>
      <div class="wisdom-card-examples">Story uses: ${t.storyApplications.join(', ')}</div>
    </div>
  `).join('');
}

/**
 * Populate moral insights
 */
function populateMoral() {
  const container = $('#moral-items');
  if (!container) return;
  
  container.innerHTML = Object.entries(MORAL_INSIGHTS).map(([key, m]) => `
    <div class="wisdom-card" data-key="${key}">
      <div class="wisdom-card-header">
        <span class="wisdom-card-title">${m.label}</span>
        <button class="btn small" onclick="addWisdomToStory('moral', '${key}')">+ Add</button>
      </div>
      <div class="wisdom-card-principle">"${m.insight}"</div>
      <div class="wisdom-card-examples">Examples: ${m.examples}</div>
    </div>
  `).join('');
}

/**
 * Populate psychological insights
 */
function populatePsychological() {
  const container = $('#psychological-items');
  if (!container) return;
  
  container.innerHTML = Object.entries(PSYCHOLOGICAL_INSIGHTS).map(([key, p]) => `
    <div class="wisdom-card" data-key="${key}">
      <div class="wisdom-card-header">
        <span class="wisdom-card-title">${p.label}</span>
        <button class="btn small" onclick="addWisdomToStory('psychological', '${key}')">+ Add</button>
      </div>
      <div class="wisdom-card-origin">Source: ${p.source}</div>
      <div class="wisdom-card-principle">"${p.insight}"</div>
      <div class="wisdom-card-examples">Story uses: ${p.storyApplications.join(', ')}</div>
    </div>
  `).join('');
}

/**
 * Populate scientific insights
 */
function populateScientific() {
  const container = $('#scientific-items');
  if (!container) return;
  
  container.innerHTML = Object.entries(SCIENTIFIC_INSIGHTS).map(([key, s]) => `
    <div class="wisdom-card" data-key="${key}">
      <div class="wisdom-card-header">
        <span class="wisdom-card-title">${s.label}</span>
        <button class="btn small" onclick="addWisdomToStory('scientific', '${key}')">+ Add</button>
      </div>
      <div class="wisdom-card-origin">Source: ${s.source}</div>
      <div class="wisdom-card-principle">"${s.insight}"</div>
      <div class="wisdom-card-examples">Story uses: ${s.storyApplications.join(', ')}</div>
    </div>
  `).join('');
}

/**
 * Populate humanist principles
 */
function populateHumanist() {
  const container = $('#humanist-items');
  if (!container) return;
  
  container.innerHTML = Object.entries(HUMANIST_PRINCIPLES).map(([key, h]) => `
    <div class="wisdom-card" data-key="${key}">
      <div class="wisdom-card-header">
        <span class="wisdom-card-title">${h.label}</span>
        <button class="btn small" onclick="addWisdomToStory('humanist', '${key}')">+ Add</button>
      </div>
      <div class="wisdom-card-principle">"${h.principle}"</div>
      <div class="wisdom-card-examples">Story uses: ${h.storyApplications.join(', ')}</div>
    </div>
  `).join('');
}

/**
 * Populate life lessons
 */
function populateLessons() {
  const container = $('#lessons-items');
  if (!container) return;
  
  const byCategory = {};
  Object.entries(LIFE_LESSONS).forEach(([key, l]) => {
    if (!byCategory[l.category]) byCategory[l.category] = [];
    byCategory[l.category].push({ key, ...l });
  });
  
  container.innerHTML = Object.entries(byCategory).map(([cat, lessons]) => `
    <div class="lessons-category">
      <div class="lessons-category-title">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
      ${lessons.map(l => `
        <div class="wisdom-card compact" data-key="${l.key}">
          <div class="wisdom-card-header">
            <span class="wisdom-card-title">"${l.lesson}"</span>
            <button class="btn small" onclick="addWisdomToStory('lesson', '${l.key}')">+ Add</button>
          </div>
          <div class="wisdom-card-origin">${l.origin}</div>
        </div>
      `).join('')}
    </div>
  `).join('');
}

/**
 * Render custom wisdom elements
 */
function renderCustomWisdom() {
  const container = $('#wisdom-custom-items');
  if (!container) return;
  
  const wisdom = state.project.libraries.wisdom || [];
  
  if (wisdom.length === 0) {
    container.innerHTML = `
      <div class="wisdom-empty">
        <p>No wisdom elements added yet.</p>
        <p class="hint">Add insights your story will illuminate - philosophical teachings, moral lessons, or psychological truths.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = wisdom.map(w => `
    <div class="wisdom-card custom" data-id="${w.id}">
      <div class="wisdom-card-header">
        <span class="wisdom-category-badge">${WISDOM_CATEGORIES[w.category]?.icon || '✨'} ${WISDOM_CATEGORIES[w.category]?.label || w.category}</span>
        <button class="btn small danger" onclick="removeWisdomFromStory('${w.id}')">×</button>
      </div>
      <div class="wisdom-card-title">${w.name}</div>
      <div class="wisdom-card-principle">"${w.insight}"</div>
      ${w.source ? `<div class="wisdom-card-origin">Source: ${w.source}</div>` : ''}
      ${w.storyApplication ? `<div class="wisdom-card-examples">In this story: ${w.storyApplication}</div>` : ''}
    </div>
  `).join('');
  
  // Update count
  const countEl = document.querySelector('#wisdom-custom .wisdom-count');
  if (countEl) countEl.textContent = wisdom.length;
}

/**
 * Open modal to add new wisdom element
 */
function openAddWisdomModal() {
  const modalBody = $('#modal-body');
  const modalTitle = $('#modal-title');
  
  if (!modalBody || !modalTitle) return;
  
  modalTitle.textContent = 'Add Wisdom Element';
  
  const categoryOptions = Object.entries(WISDOM_CATEGORIES)
    .map(([key, c]) => `<option value="${key}">${c.icon} ${c.label}</option>`)
    .join('');
  
  modalBody.innerHTML = `
    <div class="form-group">
      <label class="form-label">Category</label>
      <select class="form-select" id="wisdom-category">
        ${categoryOptions}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Name/Title</label>
      <input type="text" class="form-input" id="wisdom-name" placeholder="e.g., The Power of Forgiveness">
    </div>
    <div class="form-group">
      <label class="form-label">Core Insight</label>
      <textarea class="form-textarea" id="wisdom-insight" rows="3" placeholder="The truth or principle this wisdom conveys..."></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Source (optional)</label>
      <input type="text" class="form-input" id="wisdom-source" placeholder="e.g., Buddhist tradition, Aristotle, Modern psychology">
    </div>
    <div class="form-group">
      <label class="form-label">How it appears in your story (optional)</label>
      <textarea class="form-textarea" id="wisdom-application" rows="2" placeholder="How will your story illustrate this wisdom?"></textarea>
    </div>
  `;
  
  openModal('entity-modal');
  
  // Setup save handler
  const saveBtn = $('#btn-modal-save');
  if (saveBtn) {
    saveBtn.onclick = () => {
      const name = $('#wisdom-name')?.value?.trim();
      const insight = $('#wisdom-insight')?.value?.trim();
      
      if (!name || !insight) {
        window.showNotification?.('Name and insight are required', 'error');
        return;
      }
      
      if (!state.project.libraries.wisdom) {
        state.project.libraries.wisdom = [];
      }
      
      state.project.libraries.wisdom.push({
        id: genId(),
        category: $('#wisdom-category')?.value || 'philosophical',
        name,
        insight,
        source: $('#wisdom-source')?.value?.trim() || '',
        storyApplication: $('#wisdom-application')?.value?.trim() || ''
      });
      
      window.closeModal?.('entity-modal');
      renderCustomWisdom();
      window.showNotification?.('Wisdom element added', 'success');
    };
  }
}

/**
 * Add predefined wisdom to story
 */
window.addWisdomToStory = (type, key) => {
  if (!state.project.libraries.wisdom) {
    state.project.libraries.wisdom = [];
  }
  
  let wisdom;
  
  switch (type) {
    case 'philosophical':
      const phil = PHILOSOPHICAL_TRADITIONS[key];
      wisdom = {
        id: genId(),
        category: 'philosophical',
        name: phil.label,
        insight: phil.corePrinciple,
        source: phil.origin,
        storyApplication: phil.storyApplications.join(', '),
        predefinedKey: key
      };
      break;
    case 'moral':
      const moral = MORAL_INSIGHTS[key];
      wisdom = {
        id: genId(),
        category: 'moral',
        name: moral.label,
        insight: moral.insight,
        source: moral.variations || '',
        storyApplication: moral.storyApplications.join(', '),
        predefinedKey: key
      };
      break;
    case 'psychological':
      const psych = PSYCHOLOGICAL_INSIGHTS[key];
      wisdom = {
        id: genId(),
        category: 'psychological',
        name: psych.label,
        insight: psych.insight,
        source: psych.source,
        storyApplication: psych.storyApplications.join(', '),
        predefinedKey: key
      };
      break;
    case 'scientific':
      const sci = SCIENTIFIC_INSIGHTS[key];
      wisdom = {
        id: genId(),
        category: 'scientific',
        name: sci.label,
        insight: sci.insight,
        source: sci.source,
        storyApplication: sci.storyApplications.join(', '),
        predefinedKey: key
      };
      break;
    case 'humanist':
      const hum = HUMANIST_PRINCIPLES[key];
      wisdom = {
        id: genId(),
        category: 'societal',
        name: hum.label,
        insight: hum.principle,
        source: 'Humanist tradition',
        storyApplication: hum.storyApplications.join(', '),
        predefinedKey: key
      };
      break;
    case 'lesson':
      const lesson = LIFE_LESSONS[key];
      wisdom = {
        id: genId(),
        category: 'practical',
        name: lesson.lesson,
        insight: lesson.lesson,
        source: lesson.origin,
        storyApplication: '',
        predefinedKey: key
      };
      break;
  }
  
  if (wisdom) {
    // Check for duplicates
    const exists = state.project.libraries.wisdom.some(w => w.predefinedKey === key);
    if (exists) {
      window.showNotification?.('This wisdom element is already added', 'info');
      return;
    }
    
    state.project.libraries.wisdom.push(wisdom);
    renderCustomWisdom();
    window.showNotification?.('Wisdom added to story', 'success');
  }
};

/**
 * Remove wisdom from story
 */
window.removeWisdomFromStory = (id) => {
  if (!state.project.libraries.wisdom) return;
  
  state.project.libraries.wisdom = state.project.libraries.wisdom.filter(w => w.id !== id);
  renderCustomWisdom();
  window.showNotification?.('Wisdom element removed', 'info');
};

export default initWisdomView;
