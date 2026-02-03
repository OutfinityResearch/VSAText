/**
 * SCRIPTA Demo - Patterns Entity Management
 * 
 * Renders the Patterns tab with master plots, twist types, subplot patterns,
 * character dynamics, stakes escalation, and ending patterns.
 */

import { state } from './state.mjs';
import { $, $$, genId, openModal, closeModal } from './utils.mjs';
import { generateCNL } from './cnl.mjs';
import {
  MASTER_PLOTS,
  TWIST_TYPES,
  SUBPLOT_PATTERNS,
  CHARACTER_DYNAMICS,
  STAKES_ESCALATION,
  ENDING_PATTERNS,
  OPENING_HOOKS,
  GENRE_HYBRIDS,
  EMOTIONAL_SEQUENCES
} from '/src/vocabularies/vocab-patterns.mjs';

// ==================== PATTERNS VIEW ====================
export function renderPatternsView() {
  const container = $('#patterns-view');
  if (!container) return;
  
  const patternItems = state.project.libraries.patterns || [];
  
  let html = `
    <div class="patterns-container">
      <div class="patterns-sidebar">
        <div class="patterns-section">
          <div class="patterns-section-header" onclick="togglePatternsSection('plots')">
            <span class="section-icon">+</span>
            <span>Master Plots</span>
            <span class="section-count">${Object.keys(MASTER_PLOTS).length}</span>
          </div>
          <div class="patterns-section-content" id="psection-plots" style="display:none;">
            ${renderMasterPlotsSection()}
          </div>
        </div>
        
        <div class="patterns-section">
          <div class="patterns-section-header" onclick="togglePatternsSection('twists')">
            <span class="section-icon">+</span>
            <span>Twist Types</span>
            <span class="section-count">${Object.keys(TWIST_TYPES).length}</span>
          </div>
          <div class="patterns-section-content" id="psection-twists" style="display:none;">
            ${renderTwistsSection()}
          </div>
        </div>
        
        <div class="patterns-section">
          <div class="patterns-section-header" onclick="togglePatternsSection('subplots')">
            <span class="section-icon">+</span>
            <span>Subplot Patterns</span>
            <span class="section-count">${Object.keys(SUBPLOT_PATTERNS).length}</span>
          </div>
          <div class="patterns-section-content" id="psection-subplots" style="display:none;">
            ${renderSubplotsSection()}
          </div>
        </div>
        
        <div class="patterns-section">
          <div class="patterns-section-header" onclick="togglePatternsSection('dynamics')">
            <span class="section-icon">+</span>
            <span>Character Dynamics</span>
            <span class="section-count">${Object.keys(CHARACTER_DYNAMICS).length}</span>
          </div>
          <div class="patterns-section-content" id="psection-dynamics" style="display:none;">
            ${renderDynamicsSection()}
          </div>
        </div>
        
        <div class="patterns-section">
          <div class="patterns-section-header" onclick="togglePatternsSection('stakes')">
            <span class="section-icon">+</span>
            <span>Stakes Escalation</span>
            <span class="section-count">${Object.keys(STAKES_ESCALATION).length}</span>
          </div>
          <div class="patterns-section-content" id="psection-stakes" style="display:none;">
            ${renderStakesSection()}
          </div>
        </div>
        
        <div class="patterns-section">
          <div class="patterns-section-header" onclick="togglePatternsSection('openings')">
            <span class="section-icon">+</span>
            <span>Opening Hooks</span>
            <span class="section-count">${Object.keys(OPENING_HOOKS).length}</span>
          </div>
          <div class="patterns-section-content" id="psection-openings" style="display:none;">
            ${renderOpeningsSection()}
          </div>
        </div>
        
        <div class="patterns-section">
          <div class="patterns-section-header" onclick="togglePatternsSection('endings')">
            <span class="section-icon">+</span>
            <span>Ending Patterns</span>
            <span class="section-count">${Object.keys(ENDING_PATTERNS).length}</span>
          </div>
          <div class="patterns-section-content" id="psection-endings" style="display:none;">
            ${renderEndingsSection()}
          </div>
        </div>
        
        <div class="patterns-section">
          <div class="patterns-section-header" onclick="togglePatternsSection('emotional')">
            <span class="section-icon">+</span>
            <span>Emotional Sequences</span>
            <span class="section-count">${Object.keys(EMOTIONAL_SEQUENCES).length}</span>
          </div>
          <div class="patterns-section-content" id="psection-emotional" style="display:none;">
            ${renderEmotionalSection()}
          </div>
        </div>
        
        <div class="patterns-section">
          <div class="patterns-section-header" onclick="togglePatternsSection('hybrids')">
            <span class="section-icon">+</span>
            <span>Genre Hybrids</span>
            <span class="section-count">${Object.keys(GENRE_HYBRIDS).length}</span>
          </div>
          <div class="patterns-section-content" id="psection-hybrids" style="display:none;">
            ${renderHybridsSection()}
          </div>
        </div>
      </div>
      
      <div class="patterns-main">
        <div class="patterns-header">
          <h3>Story Patterns</h3>
          <button class="btn" onclick="showCustomPatternModal()">+ Custom Pattern</button>
        </div>
        
        ${patternItems.length === 0 ? `
          <div class="patterns-empty">
            <div class="patterns-empty-icon">&#127917;</div>
            <div class="patterns-empty-text">No story patterns selected</div>
            <div class="patterns-empty-hint">
              Browse the pattern categories on the left and click "Add" to include them in your story.
              These patterns guide narrative structure, character dynamics, and plot development.
            </div>
          </div>
        ` : `
          <div class="patterns-grid">
            ${patternItems.map(p => renderPatternCard(p)).join('')}
          </div>
        `}
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

// ==================== SECTION RENDERERS ====================
function renderMasterPlotsSection() {
  return Object.entries(MASTER_PLOTS).map(([key, p]) => `
    <div class="pattern-item">
      <div class="pattern-item-header">
        <span class="pattern-item-label">${p.label}</span>
        <button class="btn small" onclick="addPatternFromVocab('plot', '${key}')">Add</button>
      </div>
      <div class="pattern-item-desc">${p.desc}</div>
      <div class="pattern-item-structure">
        ${p.structure.map(s => `<span class="structure-step">${s}</span>`).join(' > ')}
      </div>
      <div class="pattern-item-themes">
        Themes: ${p.suggestedThemes.join(', ')}
      </div>
      <div class="pattern-item-question"><strong>Key:</strong> ${p.keyQuestion}</div>
      <div class="pattern-item-examples">Ex: ${p.examples}</div>
    </div>
  `).join('');
}

function renderTwistsSection() {
  return Object.entries(TWIST_TYPES).map(([key, t]) => `
    <div class="pattern-item">
      <div class="pattern-item-header">
        <span class="pattern-item-label">${t.label}</span>
        <button class="btn small" onclick="addPatternFromVocab('twist', '${key}')">Add</button>
      </div>
      <div class="pattern-item-desc">${t.desc}</div>
      <div class="pattern-item-setup"><strong>Setup:</strong> ${t.setup}</div>
      <div class="pattern-item-impact">Impact: ${t.impact}</div>
      <div class="pattern-item-examples">Ex: ${t.examples}</div>
    </div>
  `).join('');
}

function renderSubplotsSection() {
  return Object.entries(SUBPLOT_PATTERNS).map(([key, s]) => `
    <div class="pattern-item">
      <div class="pattern-item-header">
        <span class="pattern-item-label">${s.label}</span>
        <button class="btn small" onclick="addPatternFromVocab('subplot', '${key}')">Add</button>
      </div>
      <div class="pattern-item-desc">${s.desc}</div>
      <div class="pattern-item-function"><strong>Function:</strong> ${s.function}</div>
      <div class="pattern-item-examples">Ex: ${s.example}</div>
    </div>
  `).join('');
}

function renderDynamicsSection() {
  return Object.entries(CHARACTER_DYNAMICS).map(([key, d]) => `
    <div class="pattern-item">
      <div class="pattern-item-header">
        <span class="pattern-item-label">${d.label}</span>
        <button class="btn small" onclick="addPatternFromVocab('dynamic', '${key}')">Add</button>
      </div>
      <div class="pattern-item-desc">${d.desc}</div>
      <div class="pattern-item-roles">
        Roles: ${d.roles.join(', ')}
      </div>
      <div class="pattern-item-tension"><strong>Tension:</strong> ${d.tension}</div>
      <div class="pattern-item-examples">Ex: ${d.examples}</div>
    </div>
  `).join('');
}

function renderStakesSection() {
  return Object.entries(STAKES_ESCALATION).map(([key, s]) => `
    <div class="pattern-item">
      <div class="pattern-item-header">
        <span class="pattern-item-label">${s.label}</span>
        <button class="btn small" onclick="addPatternFromVocab('stakes', '${key}')">Add</button>
      </div>
      <div class="pattern-item-desc">${s.desc}</div>
      <div class="pattern-item-stages">
        ${s.stages.map((st, i) => `<span class="stage-item">${i + 1}. ${st}</span>`).join(' ')}
      </div>
      <div class="pattern-item-examples">Ex: ${s.examples}</div>
    </div>
  `).join('');
}

function renderOpeningsSection() {
  return Object.entries(OPENING_HOOKS).map(([key, o]) => `
    <div class="pattern-item">
      <div class="pattern-item-header">
        <span class="pattern-item-label">${o.label}</span>
        <button class="btn small" onclick="addPatternFromVocab('opening', '${key}')">Add</button>
      </div>
      <div class="pattern-item-desc">${o.desc}</div>
      <div class="pattern-item-effect"><strong>Effect:</strong> ${o.effect}</div>
      <div class="pattern-item-examples">Ex: ${o.examples}</div>
    </div>
  `).join('');
}

function renderEndingsSection() {
  return Object.entries(ENDING_PATTERNS).map(([key, e]) => `
    <div class="pattern-item">
      <div class="pattern-item-header">
        <span class="pattern-item-label">${e.label}</span>
        <button class="btn small" onclick="addPatternFromVocab('ending', '${key}')">Add</button>
      </div>
      <div class="pattern-item-desc">${e.desc}</div>
      <div class="pattern-item-satisfaction">Satisfaction: ${e.satisfaction}</div>
      <div class="pattern-item-examples">Ex: ${e.examples}</div>
    </div>
  `).join('');
}

function renderEmotionalSection() {
  return Object.entries(EMOTIONAL_SEQUENCES).map(([key, e]) => `
    <div class="pattern-item">
      <div class="pattern-item-header">
        <span class="pattern-item-label">${e.label}</span>
        <button class="btn small" onclick="addPatternFromVocab('emotional', '${key}')">Add</button>
      </div>
      <div class="pattern-item-sequence">
        ${e.sequence.map(s => `<span class="sequence-step">${s}</span>`).join(' > ')}
      </div>
      <div class="pattern-item-effect"><strong>Effect:</strong> ${e.effect}</div>
      <div class="pattern-item-examples">Ex: ${e.examples}</div>
    </div>
  `).join('');
}

function renderHybridsSection() {
  return Object.entries(GENRE_HYBRIDS).map(([key, h]) => `
    <div class="pattern-item">
      <div class="pattern-item-header">
        <span class="pattern-item-label">${h.label}</span>
        <button class="btn small" onclick="addPatternFromVocab('hybrid', '${key}')">Add</button>
      </div>
      <div class="pattern-item-desc">${h.desc}</div>
      <div class="pattern-item-base">Base genres: ${h.base.join(' + ')}</div>
      <div class="pattern-item-rules">Rules: ${h.rules.join(', ')}</div>
      <div class="pattern-item-examples">Ex: ${h.examples}</div>
    </div>
  `).join('');
}

// ==================== PATTERN CARDS ====================
function renderPatternCard(p) {
  const typeLabels = {
    plot: 'Master Plot',
    twist: 'Twist',
    subplot: 'Subplot',
    dynamic: 'Character Dynamic',
    stakes: 'Stakes',
    opening: 'Opening Hook',
    ending: 'Ending',
    emotional: 'Emotional Arc',
    hybrid: 'Genre Hybrid',
    custom: 'Custom'
  };
  
  return `
    <div class="pattern-card" data-id="${p.id}">
      <div class="pattern-card-header">
        <span class="pattern-card-type">${typeLabels[p.patternType] || p.patternType}</span>
        <button class="pattern-card-remove" onclick="removePatternFromStory('${p.id}')" title="Remove">x</button>
      </div>
      <div class="pattern-card-label">${p.label}</div>
      <div class="pattern-card-desc">${p.description || p.desc || ''}</div>
      ${p.structure ? `
        <div class="pattern-card-structure">
          ${p.structure.slice(0, 4).map(s => `<span class="mini-step">${s}</span>`).join(' ')}
          ${p.structure.length > 4 ? '...' : ''}
        </div>
      ` : ''}
      ${p.examples ? `<div class="pattern-card-examples">Ex: ${p.examples}</div>` : ''}
    </div>
  `;
}

// ==================== PATTERN ACTIONS ====================
window.togglePatternsSection = (sectionId) => {
  const content = $(`#psection-${sectionId}`);
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

window.addPatternFromVocab = (type, key) => {
  let pattern = null;
  
  switch (type) {
    case 'plot': {
      const p = MASTER_PLOTS[key];
      pattern = {
        id: genId(),
        patternType: 'plot',
        sourceKey: key,
        label: p.label,
        description: p.desc,
        structure: p.structure,
        suggestedThemes: p.suggestedThemes,
        keyQuestion: p.keyQuestion,
        examples: p.examples
      };
      break;
    }
    case 'twist': {
      const t = TWIST_TYPES[key];
      pattern = {
        id: genId(),
        patternType: 'twist',
        sourceKey: key,
        label: t.label,
        description: t.desc,
        setup: t.setup,
        impact: t.impact,
        examples: t.examples
      };
      break;
    }
    case 'subplot': {
      const s = SUBPLOT_PATTERNS[key];
      pattern = {
        id: genId(),
        patternType: 'subplot',
        sourceKey: key,
        label: s.label,
        description: s.desc,
        function: s.function,
        examples: s.example
      };
      break;
    }
    case 'dynamic': {
      const d = CHARACTER_DYNAMICS[key];
      pattern = {
        id: genId(),
        patternType: 'dynamic',
        sourceKey: key,
        label: d.label,
        description: d.desc,
        roles: d.roles,
        tension: d.tension,
        examples: d.examples
      };
      break;
    }
    case 'stakes': {
      const s = STAKES_ESCALATION[key];
      pattern = {
        id: genId(),
        patternType: 'stakes',
        sourceKey: key,
        label: s.label,
        description: s.desc,
        stages: s.stages,
        examples: s.examples
      };
      break;
    }
    case 'opening': {
      const o = OPENING_HOOKS[key];
      pattern = {
        id: genId(),
        patternType: 'opening',
        sourceKey: key,
        label: o.label,
        description: o.desc,
        effect: o.effect,
        examples: o.examples
      };
      break;
    }
    case 'ending': {
      const e = ENDING_PATTERNS[key];
      pattern = {
        id: genId(),
        patternType: 'ending',
        sourceKey: key,
        label: e.label,
        description: e.desc,
        satisfaction: e.satisfaction,
        examples: e.examples
      };
      break;
    }
    case 'emotional': {
      const e = EMOTIONAL_SEQUENCES[key];
      pattern = {
        id: genId(),
        patternType: 'emotional',
        sourceKey: key,
        label: e.label,
        sequence: e.sequence,
        effect: e.effect,
        examples: e.examples
      };
      break;
    }
    case 'hybrid': {
      const h = GENRE_HYBRIDS[key];
      pattern = {
        id: genId(),
        patternType: 'hybrid',
        sourceKey: key,
        label: h.label,
        description: h.desc,
        baseGenres: h.base,
        rules: h.rules,
        examples: h.examples
      };
      break;
    }
  }
  
  if (pattern) {
    // Check for duplicates
    const existing = state.project.libraries.patterns.find(
      p => p.patternType === pattern.patternType && p.sourceKey === pattern.sourceKey
    );
    if (existing) {
      window.showNotification?.('This pattern is already in your story', 'info');
      return;
    }
    
    state.project.libraries.patterns.push(pattern);
    renderPatternsView();
    generateCNL();
    window.showNotification?.(`Added: ${pattern.label}`, 'success');
  }
};

window.removePatternFromStory = (id) => {
  const pattern = state.project.libraries.patterns.find(p => p.id === id);
  if (!pattern) return;
  
  state.project.libraries.patterns = state.project.libraries.patterns.filter(p => p.id !== id);
  renderPatternsView();
  generateCNL();
  window.showNotification?.(`Removed: ${pattern.label}`, 'info');
};

window.showCustomPatternModal = () => {
  $('#modal-title').textContent = 'Add Custom Pattern';
  
  const typeOptions = [
    { value: 'plot', label: 'Master Plot' },
    { value: 'twist', label: 'Twist' },
    { value: 'subplot', label: 'Subplot Pattern' },
    { value: 'dynamic', label: 'Character Dynamic' },
    { value: 'stakes', label: 'Stakes Pattern' },
    { value: 'emotional', label: 'Emotional Sequence' },
    { value: 'custom', label: 'Other' }
  ].map(t => `<option value="${t.value}">${t.label}</option>`).join('');
  
  $('#modal-body').innerHTML = `
    <div class="form-group">
      <label class="form-label">Pattern Type</label>
      <select class="form-select" id="pattern-type">${typeOptions}</select>
    </div>
    <div class="form-group">
      <label class="form-label">Label / Name</label>
      <input class="form-input" id="pattern-label" placeholder="e.g., 'Redemption Quest'">
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-textarea" id="pattern-desc" rows="3" 
        placeholder="What this pattern involves..."></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Structure / Stages (comma-separated, optional)</label>
      <input class="form-input" id="pattern-structure" 
        placeholder="e.g., call, journey, ordeal, return">
    </div>
    <div class="form-group">
      <label class="form-label">Examples (optional)</label>
      <input class="form-input" id="pattern-examples" 
        placeholder="Works that use this pattern...">
    </div>
  `;
  
  $('#btn-modal-save').onclick = saveCustomPattern;
  openModal('entity-modal');
};

function saveCustomPattern() {
  const label = $('#pattern-label').value.trim();
  const desc = $('#pattern-desc').value.trim();
  
  if (!label) {
    window.showNotification?.('Label is required', 'error');
    return;
  }
  
  const structureStr = $('#pattern-structure').value.trim();
  const structure = structureStr ? structureStr.split(',').map(s => s.trim()).filter(Boolean) : null;
  
  const pattern = {
    id: genId(),
    patternType: $('#pattern-type').value,
    sourceKey: 'custom_' + Date.now(),
    label,
    description: desc || null,
    structure,
    examples: $('#pattern-examples').value.trim() || null
  };
  
  state.project.libraries.patterns.push(pattern);
  closeModal('entity-modal');
  renderPatternsView();
  generateCNL();
  window.showNotification?.(`Added custom pattern: ${label}`, 'success');
}

export default { renderPatternsView };
