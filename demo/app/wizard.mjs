/**
 * SCRIPTA Demo - Story Wizard
 * 
 * Step-by-step guided story creation wizard.
 * Opens as a modal popup, separate from editing tabs.
 */

import { $, openModal, closeModal, showNotification } from './utils.mjs';
import { state } from './state.mjs';
import { generateRandom } from './generation/generation-random.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';

// Wizard state
const wizardState = {
  currentStep: 0,
  selections: {
    arc: 'heroes_journey',
    genre: 'fantasy',
    length: 'medium',
    tone: 'balanced',
    characterCount: 4,
    protagonistArchetype: 'hero',
    antagonistArchetype: 'shadow',
    themes: [],
    locationCount: 3,
    hasRomance: false,
    hasConflict: true
  }
};

// Wizard steps configuration
const WIZARD_STEPS = [
  {
    id: 'arc',
    title: 'Narrative Arc',
    subtitle: 'Choose the structure of your story'
  },
  {
    id: 'characters',
    title: 'Characters',
    subtitle: 'Configure your cast of characters'
  },
  {
    id: 'themes',
    title: 'Themes & Tone',
    subtitle: 'Set the emotional direction'
  },
  {
    id: 'world',
    title: 'World & Locations',
    subtitle: 'Build your story world'
  },
  {
    id: 'generate',
    title: 'Generate Story',
    subtitle: 'Review and create your narrative'
  }
];

// ============================================
// WIZARD CONTROL
// ============================================

export function openWizard() {
  wizardState.currentStep = 0;
  renderWizard();
  openModal('wizard-modal');
}

export function wizardNext() {
  saveCurrentStep();
  
  if (wizardState.currentStep < WIZARD_STEPS.length - 1) {
    wizardState.currentStep++;
    renderWizard();
  } else {
    // Last step - generate!
    executeWizardGenerate();
  }
}

export function wizardPrev() {
  if (wizardState.currentStep > 0) {
    wizardState.currentStep--;
    renderWizard();
  }
}

function saveCurrentStep() {
  const step = WIZARD_STEPS[wizardState.currentStep];
  
  switch (step.id) {
    case 'arc':
      wizardState.selections.arc = $('#wizard-arc')?.value || 'heroes_journey';
      wizardState.selections.genre = $('#wizard-genre')?.value || 'fantasy';
      wizardState.selections.length = $('#wizard-length')?.value || 'medium';
      break;
      
    case 'characters':
      wizardState.selections.characterCount = parseInt($('#wizard-char-count')?.value || '4');
      wizardState.selections.protagonistArchetype = $('#wizard-protagonist')?.value || 'hero';
      wizardState.selections.antagonistArchetype = $('#wizard-antagonist')?.value || 'shadow';
      wizardState.selections.hasRomance = $('#wizard-romance')?.checked || false;
      break;
      
    case 'themes':
      wizardState.selections.tone = $('#wizard-tone')?.value || 'balanced';
      wizardState.selections.themes = Array.from(document.querySelectorAll('.wizard-theme-btn.selected'))
        .map(btn => btn.dataset.theme);
      break;
      
    case 'world':
      wizardState.selections.locationCount = parseInt($('#wizard-loc-count')?.value || '3');
      break;
  }
}

// ============================================
// WIZARD RENDERING
// ============================================

function renderWizard() {
  renderStepsIndicator();
  renderStepContent();
  updateNavigationButtons();
}

function renderStepsIndicator() {
  const indicator = $('#wizard-steps-indicator');
  if (!indicator) return;
  
  indicator.innerHTML = WIZARD_STEPS.map((step, i) => {
    const status = i < wizardState.currentStep ? 'completed' : 
                   i === wizardState.currentStep ? 'active' : 'pending';
    return `<div class="wizard-step-dot ${status}" title="${step.title}">
      ${status === 'completed' ? '&#10003;' : i + 1}
    </div>`;
  }).join('<div class="wizard-step-line"></div>');
}

function renderStepContent() {
  const body = $('#wizard-body');
  if (!body) return;
  
  const step = WIZARD_STEPS[wizardState.currentStep];
  
  let html = `<div class="wizard-step-header">
    <h3 class="wizard-step-title">${step.title}</h3>
    <p class="wizard-step-subtitle">${step.subtitle}</p>
  </div>`;
  
  switch (step.id) {
    case 'arc':
      html += renderArcStep();
      break;
    case 'characters':
      html += renderCharactersStep();
      break;
    case 'themes':
      html += renderThemesStep();
      break;
    case 'world':
      html += renderWorldStep();
      break;
    case 'generate':
      html += renderGenerateStep();
      break;
  }
  
  body.innerHTML = html;
  
  // Restore selections
  restoreSelections();
}

function restoreSelections() {
  const step = WIZARD_STEPS[wizardState.currentStep];
  
  switch (step.id) {
    case 'arc':
      if ($('#wizard-arc')) $('#wizard-arc').value = wizardState.selections.arc;
      if ($('#wizard-genre')) $('#wizard-genre').value = wizardState.selections.genre;
      if ($('#wizard-length')) $('#wizard-length').value = wizardState.selections.length;
      break;
      
    case 'characters':
      if ($('#wizard-char-count')) $('#wizard-char-count').value = wizardState.selections.characterCount;
      if ($('#wizard-protagonist')) $('#wizard-protagonist').value = wizardState.selections.protagonistArchetype;
      if ($('#wizard-antagonist')) $('#wizard-antagonist').value = wizardState.selections.antagonistArchetype;
      if ($('#wizard-romance')) $('#wizard-romance').checked = wizardState.selections.hasRomance;
      break;
      
    case 'themes':
      if ($('#wizard-tone')) $('#wizard-tone').value = wizardState.selections.tone;
      wizardState.selections.themes.forEach(theme => {
        const btn = document.querySelector(`.wizard-theme-btn[data-theme="${theme}"]`);
        if (btn) btn.classList.add('selected');
      });
      break;
      
    case 'world':
      if ($('#wizard-loc-count')) $('#wizard-loc-count').value = wizardState.selections.locationCount;
      break;
  }
}

function updateNavigationButtons() {
  const prevBtn = $('#wizard-prev');
  const nextBtn = $('#wizard-next');
  const stepInfo = $('#wizard-step-info');
  
  if (prevBtn) {
    prevBtn.style.visibility = wizardState.currentStep === 0 ? 'hidden' : 'visible';
  }
  
  if (nextBtn) {
    const isLastStep = wizardState.currentStep === WIZARD_STEPS.length - 1;
    nextBtn.textContent = isLastStep ? 'Generate Story' : 'Next';
    nextBtn.classList.toggle('generate-btn', isLastStep);
  }
  
  if (stepInfo) {
    stepInfo.textContent = `Step ${wizardState.currentStep + 1} of ${WIZARD_STEPS.length}`;
  }
}

// ============================================
// STEP RENDERERS
// ============================================

function renderArcStep() {
  const arcs = Object.entries(VOCAB.NARRATIVE_ARCS || {});
  
  return `
    <div class="wizard-form">
      <div class="wizard-form-row">
        <div class="wizard-form-group">
          <label class="wizard-label">Narrative Arc</label>
          <select id="wizard-arc" class="wizard-select">
            ${arcs.map(([key, arc]) => 
              `<option value="${key}">${arc.label}</option>`
            ).join('')}
          </select>
          <div class="wizard-hint" id="wizard-arc-desc"></div>
        </div>
      </div>
      
      <div class="wizard-form-row two-col">
        <div class="wizard-form-group">
          <label class="wizard-label">Genre</label>
          <select id="wizard-genre" class="wizard-select">
            <option value="fantasy">Fantasy</option>
            <option value="scifi">Science Fiction</option>
            <option value="mystery">Mystery / Thriller</option>
            <option value="romance">Romance</option>
            <option value="horror">Horror</option>
            <option value="adventure">Adventure</option>
            <option value="drama">Drama</option>
            <option value="comedy">Comedy</option>
          </select>
        </div>
        <div class="wizard-form-group">
          <label class="wizard-label">Story Length</label>
          <select id="wizard-length" class="wizard-select">
            <option value="short">Short (3-5 scenes)</option>
            <option value="medium">Medium (8-12 scenes)</option>
            <option value="long">Long (15-20 scenes)</option>
          </select>
        </div>
      </div>
      
      <div class="wizard-arc-preview" id="wizard-arc-preview"></div>
    </div>
  `;
}

function renderCharactersStep() {
  const archetypes = Object.entries(VOCAB.CHARACTER_ARCHETYPES || {});
  
  return `
    <div class="wizard-form">
      <div class="wizard-form-row">
        <div class="wizard-form-group">
          <label class="wizard-label">Number of Characters</label>
          <div class="wizard-slider-container">
            <input type="range" id="wizard-char-count" class="wizard-slider" 
                   min="2" max="10" value="4">
            <span class="wizard-slider-value" id="wizard-char-count-display">4</span>
          </div>
        </div>
      </div>
      
      <div class="wizard-form-row two-col">
        <div class="wizard-form-group">
          <label class="wizard-label">Protagonist Type</label>
          <select id="wizard-protagonist" class="wizard-select">
            ${archetypes.map(([key, arch]) => 
              `<option value="${key}">${arch.label}</option>`
            ).join('')}
          </select>
        </div>
        <div class="wizard-form-group">
          <label class="wizard-label">Antagonist Type</label>
          <select id="wizard-antagonist" class="wizard-select">
            ${archetypes.map(([key, arch]) => 
              `<option value="${key}">${arch.label}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      
      <div class="wizard-form-row">
        <div class="wizard-checkbox-group">
          <label class="wizard-checkbox">
            <input type="checkbox" id="wizard-romance">
            <span>Include romantic subplot</span>
          </label>
        </div>
      </div>
      
      <div class="wizard-preview-box">
        <div class="wizard-preview-title">Character Preview</div>
        <div class="wizard-preview-content" id="wizard-char-preview">
          Your story will feature a diverse cast including a protagonist, antagonist, and supporting characters.
        </div>
      </div>
    </div>
  `;
}

function renderThemesStep() {
  const themes = Object.entries(VOCAB.THEMES || {});
  
  return `
    <div class="wizard-form">
      <div class="wizard-form-row">
        <div class="wizard-form-group">
          <label class="wizard-label">Overall Tone</label>
          <select id="wizard-tone" class="wizard-select">
            <option value="dark">Dark / Serious</option>
            <option value="balanced">Balanced</option>
            <option value="light">Light / Hopeful</option>
            <option value="comedic">Comedic</option>
          </select>
        </div>
      </div>
      
      <div class="wizard-form-row">
        <div class="wizard-form-group">
          <label class="wizard-label">Select Themes (click to toggle)</label>
          <div class="wizard-themes-grid">
            ${themes.slice(0, 12).map(([key, theme]) => 
              `<button type="button" class="wizard-theme-btn" data-theme="${key}" onclick="this.classList.toggle('selected')">
                ${theme.label || key}
              </button>`
            ).join('')}
          </div>
        </div>
      </div>
      
      <div class="wizard-hint">
        Selected themes will influence character motivations, conflicts, and resolutions.
      </div>
    </div>
  `;
}

function renderWorldStep() {
  return `
    <div class="wizard-form">
      <div class="wizard-form-row">
        <div class="wizard-form-group">
          <label class="wizard-label">Number of Key Locations</label>
          <div class="wizard-slider-container">
            <input type="range" id="wizard-loc-count" class="wizard-slider" 
                   min="2" max="8" value="3">
            <span class="wizard-slider-value" id="wizard-loc-count-display">3</span>
          </div>
        </div>
      </div>
      
      <div class="wizard-form-row">
        <div class="wizard-form-group">
          <label class="wizard-label">World Complexity</label>
          <div class="wizard-options-row">
            <button type="button" class="wizard-option-btn selected" data-value="simple" onclick="selectWorldOption(this)">
              <div class="option-title">Realistic</div>
              <div class="option-desc">No magic or special rules</div>
            </button>
            <button type="button" class="wizard-option-btn" data-value="few" onclick="selectWorldOption(this)">
              <div class="option-title">Light Fantasy</div>
              <div class="option-desc">Some special elements</div>
            </button>
            <button type="button" class="wizard-option-btn" data-value="rich" onclick="selectWorldOption(this)">
              <div class="option-title">Rich World</div>
              <div class="option-desc">Complex world-building</div>
            </button>
          </div>
        </div>
      </div>
      
      <div class="wizard-preview-box">
        <div class="wizard-preview-title">World Preview</div>
        <div class="wizard-preview-content" id="wizard-world-preview">
          Your story will take place across multiple interconnected locations that support the narrative arc.
        </div>
      </div>
    </div>
  `;
}

function renderGenerateStep() {
  const sel = wizardState.selections;
  const arc = VOCAB.NARRATIVE_ARCS?.[sel.arc];
  
  return `
    <div class="wizard-summary">
      <div class="wizard-summary-section">
        <h4>Story Structure</h4>
        <div class="summary-item"><span>Arc:</span> ${arc?.label || sel.arc}</div>
        <div class="summary-item"><span>Genre:</span> ${sel.genre}</div>
        <div class="summary-item"><span>Length:</span> ${sel.length}</div>
      </div>
      
      <div class="wizard-summary-section">
        <h4>Characters</h4>
        <div class="summary-item"><span>Count:</span> ${sel.characterCount} characters</div>
        <div class="summary-item"><span>Protagonist:</span> ${sel.protagonistArchetype}</div>
        <div class="summary-item"><span>Antagonist:</span> ${sel.antagonistArchetype}</div>
        ${sel.hasRomance ? '<div class="summary-item"><span>Subplot:</span> Romance included</div>' : ''}
      </div>
      
      <div class="wizard-summary-section">
        <h4>Tone & Themes</h4>
        <div class="summary-item"><span>Tone:</span> ${sel.tone}</div>
        <div class="summary-item"><span>Themes:</span> ${sel.themes.length > 0 ? sel.themes.join(', ') : 'Auto-selected'}</div>
      </div>
      
      <div class="wizard-summary-section">
        <h4>World</h4>
        <div class="summary-item"><span>Locations:</span> ${sel.locationCount} key locations</div>
      </div>
    </div>
    
    <div class="wizard-generate-cta">
      <p>Ready to create your story specification?</p>
      <p class="wizard-cta-hint">Click "Generate Story" below to create your narrative framework.</p>
    </div>
  `;
}

// ============================================
// GENERATION
// ============================================

function executeWizardGenerate() {
  saveCurrentStep();
  
  const sel = wizardState.selections;
  
  // Map wizard selections to generation options
  const options = {
    genre: sel.genre,
    length: sel.length,
    chars: sel.characterCount <= 3 ? 'few' : sel.characterCount <= 6 ? 'medium' : 'many',
    tone: sel.tone,
    complexity: sel.locationCount <= 3 ? 'simple' : sel.locationCount <= 5 ? 'moderate' : 'complex',
    rules: 'few',
    // Wizard-specific options
    arc: sel.arc,
    protagonistArchetype: sel.protagonistArchetype,
    antagonistArchetype: sel.antagonistArchetype,
    themes: sel.themes,
    hasRomance: sel.hasRomance,
    locationCount: sel.locationCount
  };
  
  // Close wizard
  closeModal('wizard-modal');
  
  // Generate using the random generator with wizard options
  try {
    generateRandom(options);
    showNotification('Story specification created! Review in the tabs above.', 'success');
  } catch (err) {
    console.error('Wizard generation error:', err);
    showNotification('Generation failed: ' + err.message, 'error');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

window.selectWorldOption = function(btn) {
  document.querySelectorAll('.wizard-option-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
};

// Update slider displays
document.addEventListener('input', (e) => {
  if (e.target.id === 'wizard-char-count') {
    const display = $('#wizard-char-count-display');
    if (display) display.textContent = e.target.value;
  }
  if (e.target.id === 'wizard-loc-count') {
    const display = $('#wizard-loc-count-display');
    if (display) display.textContent = e.target.value;
  }
});

// ============================================
// EXPORTS
// ============================================

export { wizardState };

// Make functions available globally
window.openWizard = openWizard;
window.wizardNext = wizardNext;
window.wizardPrev = wizardPrev;
