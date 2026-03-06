/**
 * New Project Wizard (overlay)
 */

import { createProjectFromWizard } from './persistence.mjs';
import { generateNLStory } from './nl-generation.mjs';
import { showNotification } from './utils.mjs';

const DRAFT_KEY = 'scripta-new-project-wizard';
const TOTAL_STEPS = 4;
const DEFAULT_STORY_MODEL = 'copilot-gpt-4o';


const defaultData = {
  projectName: '',
  genre: 'Fantasy',
  tone: 'Dark',
  storyLength: 'Short',
  coreIdeasText: '',
  constraints: '',
  thematicPathway: '',
  strategy: 'random',
  language: 'en',
  model: DEFAULT_STORY_MODEL
};

const strategies = [
  {
    key: 'random',
    label: 'Random',
    desc: 'Fast start with high creative freedom.',
    points: [
      'Best when you want exploratory ideas quickly.',
      'Uses minimal constraints and maximizes variation.',
      'Good for early concept discovery.'
    ],
    badge: 'Creative'
  },
  {
    key: 'with-llm',
    label: 'With LLM',
    desc: 'Balanced guidance with practical structure support.',
    points: [
      'LLM proposes a coherent base structure.',
      'Offers scene-level suggestions with thematic alignment.',
      'Recommended for most standard projects.'
    ],
    badge: 'Assisted'
  },
  {
    key: 'advanced',
    label: 'Advanced',
    desc: 'Maximum control for precise narrative planning.',
    points: [
      'You define stricter rules, arcs, and creative constraints.',
      'LLM works within your explicit structure decisions.',
      'Useful for production-ready and repeatable workflows.'
    ],
    badge: 'Control'
  }
];

const languages = [
  { key: 'en', label: 'English' },
  { key: 'ro', label: 'Romanian' },
  { key: 'fr', label: 'French' },
  { key: 'es', label: 'Spanish' },
  { key: 'de', label: 'German' }
];

let modelsLoaded = false;
let modelOptions = {
  deep: [],
  fast: []
};

const overlay = document.createElement('div');
overlay.id = 'new-project-wizard';
overlay.innerHTML = `
  <div class="wizard-shell">
    <header class="wizard-header">
      <div class="wizard-hero">
        <div class="wizard-project-icon" aria-hidden="true">✦</div>
        <div>
          <h2>New Project</h2>
          <p class="wizard-subtitle">Follow the steps to create your story project</p>
        </div>
      </div>
      <button class="wizard-close" id="wizard-close" aria-label="Close wizard">×</button>
    </header>
    <div class="wizard-body" id="wizard-body"></div>

    <footer class="wizard-footer">
      <div class="wizard-footer-actions">
        <button class="btn" id="wizard-back">← Back</button>
        <button class="btn primary" id="wizard-next">Next →</button>
      </div>
      <div class="wizard-progress-track" aria-hidden="true">
        <div class="wizard-progress-fill" id="wizard-progress-fill"></div>
        <div class="wizard-progress-inline-label" id="wizard-progress-label">25%</div>
      </div>
    </footer>
  </div>
`;
document.body.appendChild(overlay);

function isPreferredModel(value, label = '') {
  const text = `${value} ${label}`.toLowerCase();
  return text.includes('copilot-gpt-4o') && !text.includes('mini');
}

const wizardBody = overlay.querySelector('#wizard-body');
const progressFill = overlay.querySelector('#wizard-progress-fill');
const progressLabel = overlay.querySelector('#wizard-progress-label');
const btnBack = overlay.querySelector('#wizard-back');
const btnNext = overlay.querySelector('#wizard-next');
const btnClose = overlay.querySelector('#wizard-close');

let state = {
  step: 0,
  data: { ...defaultData }
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadDraft() {
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state = {
      step: Math.max(0, Math.min(TOTAL_STEPS - 1, Number(parsed.step ?? 0))),
      data: { ...defaultData, ...(parsed.data || {}) }
    };
    if (!state.data.model) {
      state.data.model = DEFAULT_STORY_MODEL;
    }
  } catch {
    state = { step: 0, data: { ...defaultData } };
  }
}

function saveDraft() {
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
}

function renderBasicInfo() {
  const genres = [
    { label: 'Adventure', icon: '🗺' },
    { label: 'Sci-Fi', icon: '🚀' },
    { label: 'Mystery', icon: '🕵' },
    { label: 'Fantasy', icon: '🧙' },
    { label: 'Horror', icon: '😱' },
    { label: 'Romance', icon: '❤️' }
  ];
  const tones = [
    { label: 'Suspenseful', icon: '⏳' },
    { label: 'Dark', icon: '🌘' },
    { label: 'Epic', icon: '⚔' },
    { label: 'Emotional', icon: '💠' },
    { label: 'Light', icon: '🌤' },
    { label: 'Poetic', icon: '✒' }
  ];
  const storyLengths = [
    { value: 'Short', label: 'Short (3-5 scenes)' },
    { value: 'Medium', label: 'Medium (8-12 scenes)' },
    { value: 'Long', label: 'Long (15-20 scenes)' }
  ];

  return `
    <div class="wizard-step-section">
      <p class="wizard-step-summary">Step 2: Basic Info</p>

      <div class="wizard-grid wizard-grid-two-col">
        <label class="wizard-field">
          <span>Project Name</span>
          <input type="text" id="wizard-project-name" value="${esc(state.data.projectName)}" placeholder="Enter project name" required>
        </label>

        <label class="wizard-field">
          <span>Story Length</span>
          <select id="wizard-story-length">
            ${storyLengths.map(item => `<option value="${item.value}" ${state.data.storyLength === item.value ? 'selected' : ''}>${item.label}</option>`).join('')}
          </select>
        </label>
      </div>

      <div class="wizard-selection-layout">
        <div class="wizard-choice-group">
          <span class="wizard-choice-title">Genre</span>
          <div class="wizard-card-selector wizard-card-selector-genre">
            ${genres.map(item => `
              <button class="wizard-choice-card ${state.data.genre === item.label ? 'selected' : ''}" type="button" data-select-field="genre" data-select-value="${esc(item.label)}">
                <span class="wizard-choice-icon">${item.icon}</span>
                <span>${item.label}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <div class="wizard-choice-group">
          <span class="wizard-choice-title">Tone</span>
          <div class="wizard-card-selector wizard-card-selector-tone">
            ${tones.map(item => `
              <button class="wizard-choice-card ${state.data.tone === item.label ? 'selected' : ''}" type="button" data-select-field="tone" data-select-value="${esc(item.label)}">
                <span class="wizard-choice-icon">${item.icon}</span>
                <span>${item.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCoreIdeas() {
  return `
    <div class="wizard-step-section">
      <p class="wizard-step-summary">Step 3: Core Ideas</p>

      <div class="wizard-grid wizard-grid-ideas">
        <label class="wizard-field">
          <span>Core Ideas (2-3 ideas)</span>
          <textarea rows="9" id="wizard-core-ideas" placeholder="Write 2-3 short ideas (1-2 sentences each), one per line.">${esc(state.data.coreIdeasText)}</textarea>
        </label>
      </div>

      <div class="wizard-grid wizard-grid-small">
        <label class="wizard-field">
          <span>Constraints</span>
          <input type="text" id="wizard-constraints" value="${esc(state.data.constraints)}" placeholder="Example: No deus ex machina">
        </label>

        <label class="wizard-field">
          <span>Thematic Pathway</span>
          <input type="text" id="wizard-thematic-pathway" value="${esc(state.data.thematicPathway)}" placeholder="Example: fear -> courage -> sacrifice">
        </label>
      </div>
    </div>
  `;
}

function renderStrategy() {
  return `
    <div class="wizard-step-section">
      <p class="wizard-step-summary">Step 1: Generation Strategy</p>

      <div class="strategy-radio-group" role="radiogroup" aria-label="Generation Strategy">
        ${strategies.map(strategy => `
          <label class="strategy-radio-row ${state.data.strategy === strategy.key ? 'selected' : ''}">
            <input class="strategy-radio-input" type="radio" name="wizard-strategy" value="${strategy.key}" ${state.data.strategy === strategy.key ? 'checked' : ''}>
            <div class="strategy-radio-content">
              <div class="strategy-radio-head">
                <strong>${strategy.label}</strong>
                <span class="strategy-badge">${strategy.badge}</span>
              </div>
              <p>${strategy.desc}</p>
              <ul class="strategy-points">
                ${strategy.points.map(point => `<li>${point}</li>`).join('')}
              </ul>
            </div>
          </label>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCreateStoryNL() {
  if (!modelsLoaded) {
    loadModelOptions().then(() => {
      if (state.step === 3) renderStep();
    });
  }

  const hasLoadedModels = modelOptions.deep.length > 0 || modelOptions.fast.length > 0;
  const currentValue = state.data.model || '';

  return `
    <div class="wizard-step-section">
      <p class="wizard-step-summary">Step 4: Create Story</p>

      <div class="wizard-grid wizard-grid-small">
        <label class="wizard-field">
          <span>Language</span>
          <select id="wizard-language">
            ${languages.map(lang => `<option value="${lang.key}" ${state.data.language === lang.key ? 'selected' : ''}>${lang.label}</option>`).join('')}
          </select>
        </label>

        <label class="wizard-field">
          <span>Model</span>
          <select id="wizard-model">
            <option value="${DEFAULT_STORY_MODEL}" ${currentValue === DEFAULT_STORY_MODEL ? 'selected' : ''}>${DEFAULT_STORY_MODEL} (default)</option>
            ${hasLoadedModels ? `
              <optgroup label="Deep">
                ${modelOptions.deep.map(model => `<option value="${esc(model.value)}" ${currentValue === model.value ? 'selected' : ''}>${esc(model.label)}</option>`).join('')}
              </optgroup>
              <optgroup label="Fast">
                ${modelOptions.fast.map(model => `<option value="${esc(model.value)}" ${currentValue === model.value ? 'selected' : ''}>${esc(model.label)}</option>`).join('')}
              </optgroup>
            ` : '<option value="" disabled>Loading models...</option>'}
          </select>
        </label>
      </div>

      <div class="wizard-launch-card">
        <div class="wizard-launch-copy">
          <h4>Create Story</h4>
          <p>Generate your first narrative version using the selected language, model, and story setup.</p>
          <div class="wizard-launch-actions">
          <button class="btn primary" id="wizard-generate-story">Generate Story</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

const steps = [renderStrategy, renderBasicInfo, renderCoreIdeas, renderCreateStoryNL];

function renderStep() {
  const renderer = steps[state.step];
  const wideClass = state.step === 2 ? ' wizard-step-card-wide' : '';
  wizardBody.innerHTML = `<div class="wizard-step-card${wideClass}">${renderer ? renderer() : ''}</div>`;

  const fill = ((state.step + 1) / TOTAL_STEPS) * 100;
  progressFill.style.width = `${fill}%`;
  progressLabel.textContent = `${Math.round(fill)}%`;

  btnBack.disabled = state.step === 0;
  btnNext.textContent = state.step === TOTAL_STEPS - 1 ? 'Create Project →' : 'Next →';

  attachListeners();
}

function attachListeners() {
  wizardBody.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => updateField(el));
    el.addEventListener('change', () => updateField(el));
  });

  wizardBody.querySelectorAll('input[name="wizard-strategy"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.data.strategy = radio.value;
      saveDraft();
      renderStep();
    });
  });

  wizardBody.querySelectorAll('[data-select-field][data-select-value]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const field = btn.getAttribute('data-select-field');
      const value = btn.getAttribute('data-select-value') || '';
      if (!field) return;
      state.data[field] = value;
      saveDraft();
      renderStep();
    });
  });

  wizardBody.querySelector('#wizard-generate-story')?.addEventListener('click', async () => {
    await runNLGenerationFromWizard();
  });
}

function updateField(el) {
  const { id, value } = el;

  if (id === 'wizard-project-name') state.data.projectName = value;
  if (id === 'wizard-story-length') state.data.storyLength = value;
  if (id === 'wizard-core-ideas') state.data.coreIdeasText = value;
  if (id === 'wizard-constraints') state.data.constraints = value;
  if (id === 'wizard-thematic-pathway') state.data.thematicPathway = value;
  if (id === 'wizard-language') state.data.language = value;
  if (id === 'wizard-model') state.data.model = value;

  saveDraft();
}

function ensureRequiredFields() {
  if (state.data.projectName.trim()) return true;
  showNotification('Project Name is required.', 'error');
  state.step = 1;
  saveDraft();
  renderStep();
  return false;
}

function applyWizardNLSelections() {
  const langSelect = document.getElementById('nl-language');
  if (langSelect) {
    langSelect.value = state.data.language;
    langSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const modelSelect = document.getElementById('nl-model');
  if (!modelSelect) return;

  const selectedModel = state.data.model || DEFAULT_STORY_MODEL;
  const hasExact = Array.from(modelSelect.options || []).some(option => option.value === selectedModel);
  if (!hasExact) return;
  modelSelect.value = selectedModel;
  modelSelect.dispatchEvent(new Event('change', { bubbles: true }));
}

async function loadModelOptions() {
  if (modelsLoaded) return;
  try {
    const response = await fetch('/v1/models');
    if (!response.ok) return;
    const data = await response.json();
    const deep = Array.isArray(data?.models?.deep) ? data.models.deep : [];
    const fast = Array.isArray(data?.models?.fast) ? data.models.fast : [];

    modelOptions = {
      deep: deep.map(model => ({
        value: model.qualifiedName || model.name || '',
        label: `${model.name || 'Model'} (${model.provider || 'provider'})`
      })).filter(model => model.value),
      fast: fast.map(model => ({
        value: model.qualifiedName || model.name || '',
        label: `${model.name || 'Model'} (${model.provider || 'provider'})`
      })).filter(model => model.value)
    };
    const preferredDeep = modelOptions.deep.find(model => model.value === DEFAULT_STORY_MODEL || isPreferredModel(model.value, model.label));
    const preferredFast = modelOptions.fast.find(model => model.value === DEFAULT_STORY_MODEL || isPreferredModel(model.value, model.label));
    if (preferredDeep || preferredFast) {
      state.data.model = (preferredDeep || preferredFast).value;
    }
    if (!state.data.model) {
      state.data.model = DEFAULT_STORY_MODEL;
    }
    modelsLoaded = true;
  } catch {
    // Keep default option when model list cannot be loaded.
  }
}

async function runNLGenerationFromWizard() {
  if (!ensureRequiredFields()) return;

  createProjectFromWizard(state.data.projectName.trim());
  applyWizardNLSelections();

  closeOverlay();
  window.switchToTab?.('nl');

  try {
    await generateNLStory();
  } catch (err) {
    showNotification(`Generation error: ${err.message}`, 'error');
  }
}

function closeOverlay() {
  overlay.classList.remove('open');
}

function finish() {
  if (!ensureRequiredFields()) return;

  createProjectFromWizard(state.data.projectName.trim());
  saveDraft();
  closeOverlay();
}

function openOverlay() {
  loadDraft();
  overlay.classList.add('open');
  renderStep();
}

btnNext.addEventListener('click', () => {
  if (state.step === TOTAL_STEPS - 1) {
    finish();
    return;
  }
  state.step += 1;
  saveDraft();
  renderStep();
});

btnBack.addEventListener('click', () => {
  if (state.step === 0) return;
  state.step -= 1;
  saveDraft();
  renderStep();
});

btnClose.addEventListener('click', closeOverlay);

overlay.addEventListener('click', (event) => {
  if (event.target === overlay) closeOverlay();
});

export function openNewProjectWizard() {
  openOverlay();
}
