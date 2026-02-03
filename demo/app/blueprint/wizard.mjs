/**
 * SCRIPTA Demo - Blueprint Wizard
 * 
 * Step-by-step guided blueprint creation.
 */

import state from '../state.mjs';
import { setBlueprintArc, updateBeatMapping, setTensionCurve, upsertDialogue } from '../state.mjs';
import { getArcs, getArc, getCurrentArcBeats } from './blueprint-state.mjs';
import { generateId } from '../utils.mjs';

let wizardContainer = null;
let currentStep = 0;

const STEPS = [
  { id: 'arc', title: 'Choose Narrative Arc', icon: '📐' },
  { id: 'chapters', title: 'Map Chapters to Beats', icon: '📖' },
  { id: 'tension', title: 'Set Tension Curve', icon: '📈' },
  { id: 'dialogues', title: 'Plan Key Dialogues', icon: '💬' },
  { id: 'review', title: 'Review Blueprint', icon: '✓' }
];

/**
 * Initialize the wizard
 * @param {HTMLElement} container 
 */
export function initWizard(container) {
  wizardContainer = container;
  currentStep = 0;
  render();
}

/**
 * Render the wizard
 */
export function render() {
  if (!wizardContainer) return;
  
  wizardContainer.innerHTML = `
    <div class="wizard-progress">
      ${STEPS.map((step, idx) => `
        <div class="wizard-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}"
             data-step="${idx}">
          <span class="step-icon">${step.icon}</span>
          <span class="step-title">${step.title}</span>
        </div>
      `).join('')}
    </div>
    
    <div class="wizard-content">
      ${renderCurrentStep()}
    </div>
    
    <div class="wizard-nav">
      <button id="wizard-prev" class="btn" ${currentStep === 0 ? 'disabled' : ''}>← Previous</button>
      <span class="step-counter">Step ${currentStep + 1} of ${STEPS.length}</span>
      ${currentStep === STEPS.length - 1 
        ? '<button id="wizard-finish" class="btn btn-primary">Finish Setup</button>'
        : '<button id="wizard-next" class="btn btn-primary">Next →</button>'
      }
    </div>
  `;
  
  attachListeners();
}

/**
 * Render content for current step
 */
function renderCurrentStep() {
  switch (STEPS[currentStep].id) {
    case 'arc': return renderArcStep();
    case 'chapters': return renderChaptersStep();
    case 'tension': return renderTensionStep();
    case 'dialogues': return renderDialoguesStep();
    case 'review': return renderReviewStep();
    default: return '<p>Unknown step</p>';
  }
}

/**
 * Step 1: Choose narrative arc
 */
function renderArcStep() {
  const arcs = getArcs();
  const selected = state.project.blueprint.arc || state.project.selectedArc;
  
  return `
    <div class="step-content arc-step">
      <h3>Choose Your Narrative Arc</h3>
      <p>The narrative arc defines the structure and pacing of your story.</p>
      
      <div class="arc-options">
        ${Object.entries(arcs)
          .filter(([key, arc]) => arc.scope === 'work')
          .map(([key, arc]) => `
            <label class="arc-option ${key === selected ? 'selected' : ''}">
              <input type="radio" name="arc" value="${key}" ${key === selected ? 'checked' : ''}>
              <div class="arc-card">
                <h4>${arc.label}</h4>
                <p>${arc.description || ''}</p>
                <span class="arc-beats">${arc.beats?.length || 0} beats</span>
              </div>
            </label>
          `).join('')}
      </div>
    </div>
  `;
}

/**
 * Step 2: Map chapters to beats
 */
function renderChaptersStep() {
  const beats = getCurrentArcBeats();
  const structure = state.project.structure;
  const chapters = structure?.children || [];
  const mappings = state.project.blueprint.beatMappings;
  
  if (chapters.length === 0) {
    return `
      <div class="step-content chapters-step">
        <h3>Map Chapters to Beats</h3>
        <div class="warning-box">
          <p>No chapters found. Generate a story structure first, or create chapters manually.</p>
          <button id="quick-chapters" class="btn">Create Quick Chapters</button>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="step-content chapters-step">
      <h3>Map Chapters to Beats</h3>
      <p>Assign each narrative beat to a chapter in your story.</p>
      
      <div class="mapping-grid">
        ${beats.map(beat => {
          const mapping = mappings.find(m => m.beatKey === beat.key);
          return `
            <div class="mapping-item">
              <div class="beat-info">
                <span class="beat-name">${beat.label}</span>
                <span class="beat-pos">${Math.round(beat.position * 100)}%</span>
              </div>
              <select class="chapter-select" data-beat="${beat.key}">
                <option value="">-- Not mapped --</option>
                ${chapters.map(ch => `
                  <option value="${ch.id}" ${mapping?.chapterId === ch.id ? 'selected' : ''}>
                    ${ch.name || ch.id}
                  </option>
                `).join('')}
              </select>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Step 3: Set tension curve
 */
function renderTensionStep() {
  const curve = state.project.blueprint.tensionCurve;
  
  return `
    <div class="step-content tension-step">
      <h3>Set Your Tension Curve</h3>
      <p>Define how tension rises and falls throughout your story.</p>
      
      <div class="tension-editor">
        <div class="tension-presets">
          <button class="preset-btn" data-preset="rising">📈 Rising</button>
          <button class="preset-btn" data-preset="falling">📉 Falling</button>
          <button class="preset-btn" data-preset="wave">🌊 Wave</button>
          <button class="preset-btn" data-preset="mountain">⛰️ Mountain</button>
          <button class="preset-btn" data-preset="valley">🏞️ Valley</button>
        </div>
        
        <div class="tension-points">
          <h4>Tension Points</h4>
          ${renderTensionPoints(curve)}
          <button id="add-point" class="btn-small">+ Add Point</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render editable tension points
 */
function renderTensionPoints(curve) {
  if (!curve || curve.length === 0) {
    return '<p class="empty-state">No tension points defined</p>';
  }
  
  return `
    <div class="points-list">
      ${curve.map((p, idx) => `
        <div class="point-row" data-index="${idx}">
          <label>At ${Math.round(p.position * 100)}%</label>
          <input type="range" min="1" max="5" value="${p.tension}" 
                 class="tension-slider" data-index="${idx}">
          <span class="tension-value">${p.tension}</span>
          <button class="btn-remove" data-index="${idx}">×</button>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Step 4: Plan key dialogues
 */
function renderDialoguesStep() {
  const beats = getCurrentArcBeats();
  const dialogues = state.project.libraries.dialogues;
  
  return `
    <div class="step-content dialogues-step">
      <h3>Plan Key Dialogues</h3>
      <p>Mark important dialogue moments and their purpose.</p>
      
      <div class="dialogues-list">
        ${dialogues.map(d => `
          <div class="dialogue-item" data-id="${d.id}">
            <select class="dialogue-purpose">
              ${renderPurposeOptions(d.purpose)}
            </select>
            <span>at</span>
            <select class="dialogue-beat">
              <option value="">-- Select beat --</option>
              ${beats.map(b => `
                <option value="${b.key}" ${d.beatKey === b.key ? 'selected' : ''}>
                  ${b.label}
                </option>
              `).join('')}
            </select>
            <button class="btn-remove" data-id="${d.id}">×</button>
          </div>
        `).join('')}
        
        <button id="add-dialogue" class="btn-small">+ Add Dialogue</button>
      </div>
    </div>
  `;
}

/**
 * Render purpose options
 */
function renderPurposeOptions(selected) {
  const purposes = [
    'revelation', 'confrontation', 'bonding', 'exposition', 'conflict',
    'confession', 'negotiation', 'farewell', 'deception', 'comic_relief'
  ];
  return purposes.map(p => `
    <option value="${p}" ${p === selected ? 'selected' : ''}>${p}</option>
  `).join('');
}

/**
 * Step 5: Review
 */
function renderReviewStep() {
  const arc = getArc(state.project.blueprint.arc);
  const mappings = state.project.blueprint.beatMappings;
  const curve = state.project.blueprint.tensionCurve;
  const dialogues = state.project.libraries.dialogues;
  
  return `
    <div class="step-content review-step">
      <h3>Review Your Blueprint</h3>
      
      <div class="review-section">
        <h4>📐 Narrative Arc</h4>
        <p>${arc?.label || 'Not selected'} (${arc?.beats?.length || 0} beats)</p>
      </div>
      
      <div class="review-section">
        <h4>📖 Chapter Mappings</h4>
        <p>${mappings.filter(m => m.chapterId).length} beats mapped to chapters</p>
      </div>
      
      <div class="review-section">
        <h4>📈 Tension Curve</h4>
        <p>${curve.length} tension points defined</p>
      </div>
      
      <div class="review-section">
        <h4>💬 Planned Dialogues</h4>
        <p>${dialogues.length} key dialogue moments</p>
      </div>
      
      <div class="review-actions">
        <p>Your blueprint is ready! Click "Finish Setup" to apply.</p>
      </div>
    </div>
  `;
}

/**
 * Attach event listeners
 */
function attachListeners() {
  // Navigation
  document.getElementById('wizard-prev')?.addEventListener('click', () => {
    if (currentStep > 0) { currentStep--; render(); }
  });
  
  document.getElementById('wizard-next')?.addEventListener('click', () => {
    saveCurrentStep();
    if (currentStep < STEPS.length - 1) { currentStep++; render(); }
  });
  
  document.getElementById('wizard-finish')?.addEventListener('click', () => {
    saveCurrentStep();
    document.dispatchEvent(new CustomEvent('blueprint-changed'));
    alert('Blueprint setup complete!');
  });
  
  // Step-specific listeners
  attachStepListeners();
}

/**
 * Attach step-specific listeners
 */
function attachStepListeners() {
  // Arc selection
  document.querySelectorAll('input[name="arc"]').forEach(input => {
    input.addEventListener('change', (e) => {
      setBlueprintArc(e.target.value);
      render();
    });
  });
  
  // Chapter mapping
  document.querySelectorAll('.chapter-select').forEach(select => {
    select.addEventListener('change', (e) => {
      updateBeatMapping(e.target.dataset.beat, { chapterId: e.target.value });
    });
  });
  
  // Tension presets
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      applyTensionPreset(e.target.dataset.preset);
    });
  });
  
  // Add dialogue
  document.getElementById('add-dialogue')?.addEventListener('click', () => {
    upsertDialogue({
      id: generateId('dlg'),
      purpose: 'revelation',
      participants: [],
      tone: null,
      tension: null,
      beatKey: null,
      location: null,
      exchanges: []
    });
    render();
  });
}

/**
 * Apply tension preset
 */
function applyTensionPreset(preset) {
  const presets = {
    rising: [{ position: 0, tension: 1 }, { position: 0.5, tension: 3 }, { position: 1, tension: 5 }],
    falling: [{ position: 0, tension: 5 }, { position: 0.5, tension: 3 }, { position: 1, tension: 1 }],
    wave: [{ position: 0, tension: 2 }, { position: 0.25, tension: 4 }, { position: 0.5, tension: 2 }, { position: 0.75, tension: 4 }, { position: 1, tension: 2 }],
    mountain: [{ position: 0, tension: 1 }, { position: 0.5, tension: 5 }, { position: 1, tension: 1 }],
    valley: [{ position: 0, tension: 5 }, { position: 0.5, tension: 1 }, { position: 1, tension: 5 }]
  };
  
  if (presets[preset]) {
    setTensionCurve(presets[preset]);
    render();
  }
}

/**
 * Save current step data
 */
function saveCurrentStep() {
  // Data is saved in real-time via event handlers
}

export default {
  initWizard,
  render
};
