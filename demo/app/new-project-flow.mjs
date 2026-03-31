/**
 * New Project post-creation flow:
 * - processing screen
 * - CNL foundation review
 * - NL unlock after acceptance
 */

import { state, updateNewProjectFlow } from './state.mjs';
import { $ } from './utils.mjs';
import { createProjectFromWizard, markDirty, saveProject } from './persistence.mjs';
import { generateCNL } from './cnl.mjs';
import { generateRandom } from './generation/generation-random.mjs';
import { generateAdvanced } from './generation/generation-advanced.mjs';
import { generateLLM } from './generation/generation-llm.mjs';
import { refreshAllViews } from './generation/generation-utils.mjs';
import { resetNLState, updateNLGenerateButton } from './nl-generation.mjs';
import { getThemeGuidance } from './theme-guidance.mjs';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function humanize(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .trim();
}

function normalizeToken(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function inferThemeKey(data = {}) {
  const text = [
    data.genre,
    data.tone,
    data.coreIdeasText,
    data.constraints,
    data.thematicPathway
  ].map((item) => String(item || '').toLowerCase()).join(' ');

  const candidateKeys = [
    'redemption', 'sacrifice', 'love', 'power', 'identity', 'freedom',
    'justice', 'revenge', 'survival', 'growth', 'betrayal', 'family',
    'legacy', 'truth', 'mortality', 'corruption'
  ];

  return candidateKeys.find((key) => text.includes(key)) || '';
}

function deriveThematicDirection(axisEnd = '') {
  const normalized = String(axisEnd || '').trim().toLowerCase();
  const mapping = [
    ['courage', 'Growth'],
    ['sacrifice', 'Sacrifice'],
    ['forgiveness', 'Reconciliation'],
    ['grace', 'Redemption'],
    ['responsibility', 'Moral awakening'],
    ['belonging', 'Reconciliation'],
    ['agency', 'Liberation'],
    ['acceptance', 'Resilience'],
    ['resilience', 'Resilience'],
    ['clarity', 'Moral awakening'],
    ['discernment', 'Moral awakening'],
    ['decay', 'Corruption'],
    ['fall', 'Fall from grace']
  ];

  const match = mapping.find(([key]) => normalized.includes(key));
  return match ? match[1] : '';
}

function buildWisdomFromAxis(axisStart = '', axisEnd = '') {
  const start = String(axisStart || '').trim();
  const end = String(axisEnd || '').trim();
  if (!start && !end) return '';
  if (start && end) {
    return `${end} is earned only after confronting ${start.toLowerCase()}.`;
  }
  return end || start;
}

function buildConflictEngine(data = {}) {
  const firstIdea = String(data.coreIdeasText || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)[0] || '';

  return firstIdea || String(data.constraints || '').trim() || '';
}

function inferConflictType(data = {}) {
  const text = [
    data.coreIdeasText,
    data.constraints,
    data.thematicPathway
  ].map((item) => String(item || '').toLowerCase()).join(' ');

  if (/(betrayal|relationship|family|love|rival|ally|enemy)/.test(text)) return 'Interpersonal';
  if (/(fear|guilt|identity|truth|self|grief|trauma|shame)/.test(text)) return 'Internal';
  return 'External';
}

function inferResolutionPath(data = {}, axisEnd = '') {
  const text = [
    data.constraints,
    data.coreIdeasText,
    axisEnd
  ].map((item) => String(item || '').toLowerCase()).join(' ');

  if (/(reconcile|forgive|belong|together|union)/.test(text)) return 'Reconciliation';
  if (/(sacrifice|cost|loss|change)/.test(text)) return 'Inevitable change';
  if (/(defeat|destroy|kill|revenge)/.test(text)) return 'Defeat';
  return 'Partial victory';
}

function ensureFrameworkProfileFromWizard(data = {}) {
  const libraries = state.project.libraries || (state.project.libraries = {});
  const existing = libraries.frameworkProfile || {};
  const storyCore = existing.storyCore || {};
  const coreTheme = existing.coreTheme || {};
  const dramaticModel = existing.dramaticModel || {};
  const transformation = existing.transformation || {};

  const options = buildGenerationOptions(data);
  const themeKey = inferThemeKey(data);
  const themeGuidance = themeKey ? getThemeGuidance(themeKey, humanize(themeKey)) : null;
  const pathway = String(data.thematicPathway || '').split(/\s*->\s*/).map((item) => item.trim()).filter(Boolean);
  const axisStart = pathway[0] || '';
  const axisEnd = pathway[pathway.length - 1] || '';
  const transformationAxis = data.thematicPathway?.trim() || themeGuidance?.transformationAxis || '';
  const wisdom = themeGuidance?.wisdom || buildWisdomFromAxis(axisStart, axisEnd);
  const conflictEngine = buildConflictEngine(data);
  const conflictType = inferConflictType(data);
  const resolutionPath = inferResolutionPath(data, axisEnd);
  const thematicDirection = deriveThematicDirection(axisEnd);

  libraries.frameworkProfile = {
    ...existing,
    storyCore: {
      genre: options.genre,
      tone: options.tone,
      complexity: options.complexity,
      length: options.length,
      chars: options.chars,
      rules: options.rules,
      theme: storyCore.theme || coreTheme.customThemeName || (themeKey ? humanize(themeKey) : ''),
      wisdom: storyCore.wisdom || wisdom
    },
    coreTheme: {
      selectedThemeId: coreTheme.selectedThemeId || '',
      selectedThemeKey: coreTheme.selectedThemeKey || themeKey,
      customThemeName: coreTheme.customThemeName || (themeKey ? humanize(themeKey) : ''),
      ideologicalConflict: coreTheme.ideologicalConflict || themeGuidance?.ideologicalConflict || '',
      moralQuestion: coreTheme.moralQuestion || themeGuidance?.moralQuestion || '',
      transformationAxis: coreTheme.transformationAxis || transformationAxis,
      example: coreTheme.example || ''
    },
    dramaticModel: {
      conflictEngine: dramaticModel.conflictEngine || conflictEngine,
      conflictType: dramaticModel.conflictType || conflictType,
      resolutionPath: dramaticModel.resolutionPath || resolutionPath,
      escalationPattern: dramaticModel.escalationPattern || (options.complexity === 'complex' ? 'Spiral Escalation' : 'Wave Escalation'),
      thematicDirection: dramaticModel.thematicDirection || thematicDirection,
      constraints: {
        nonLinear: Boolean(dramaticModel.constraints?.nonLinear),
        moralAmbiguity: Boolean(dramaticModel.constraints?.moralAmbiguity || /ambigu/i.test(String(data.constraints || '')))
      }
    },
    transformation: {
      characterArcBefore: transformation.characterArcBefore || axisStart,
      characterArcAfter: transformation.characterArcAfter || axisEnd,
      valueShiftBefore: transformation.valueShiftBefore || axisStart,
      valueShiftAfter: transformation.valueShiftAfter || axisEnd,
      lossGainBefore: transformation.lossGainBefore || '',
      lossGainAfter: transformation.lossGainAfter || '',
      newBalanceBefore: transformation.newBalanceBefore || '',
      newBalanceAfter: transformation.newBalanceAfter || '',
      ideaticDirectionBefore: transformation.ideaticDirectionBefore || axisStart,
      ideaticDirectionAfter: transformation.ideaticDirectionAfter || axisEnd,
      changeCostBefore: transformation.changeCostBefore || '',
      changeCostAfter: transformation.changeCostAfter || String(data.constraints || '').trim()
    }
  };

  if (themeKey && !Array.isArray(libraries.themes)) {
    libraries.themes = [];
  }
}

function buildCustomPrompt(data = {}) {
  return [
    data.coreIdeasText ? `Core ideas:\n${data.coreIdeasText.trim()}` : '',
    data.constraints ? `Constraints: ${data.constraints.trim()}` : '',
    data.thematicPathway ? `Thematic pathway: ${data.thematicPathway.trim()}` : ''
  ].filter(Boolean).join('\n\n');
}

function buildGenerationOptions(data = {}) {
  const genreMap = {
    'Sci-Fi': 'scifi',
    'Science Fiction': 'scifi',
    'Young Adult': 'young_adult',
    'Urban Fantasy': 'urban_fantasy'
  };
  const toneMap = {
    Suspenseful: 'balanced',
    Emotional: 'balanced',
    Light: 'light',
    Poetic: 'balanced',
    Epic: 'dark'
  };
  const lengthMap = {
    Short: 'short',
    Medium: 'medium',
    Long: 'long'
  };
  const charsMap = {
    Short: 'few',
    Medium: 'medium',
    Long: 'many'
  };
  const complexityMap = {
    random: 'simple',
    'with-llm': 'moderate',
    advanced: 'complex'
  };
  const rulesMap = {
    random: 'few',
    'with-llm': 'few',
    advanced: 'many'
  };

  return {
    genre: genreMap[data.genre] || String(data.genre || 'fantasy').toLowerCase().replace(/\s+/g, '_'),
    tone: toneMap[data.tone] || String(data.tone || 'dark').toLowerCase(),
    length: lengthMap[data.storyLength] || 'medium',
    chars: charsMap[data.storyLength] || 'medium',
    complexity: complexityMap[data.strategy] || 'moderate',
    rules: rulesMap[data.strategy] || 'few',
    storyName: data.projectName || state.project.name,
    title: data.projectName || state.project.name,
    model: data.model || 'copilot-gpt-4o',
    promptKey: 'strict_project_json',
    customPrompt: buildCustomPrompt(data)
  };
}

function renderProcessing() {
  const status = state.newProjectFlow.status || 'Generating story foundation...';
  return `
    <div class="foundation-flow foundation-flow-processing">
      <div class="foundation-hero">
        <div class="foundation-kicker">Step 2</div>
        <h2>Generating story foundation...</h2>
        <p>We are generating the specification and building the initial CNL in the background.</p>
      </div>
      <div class="foundation-processing-card">
        <div class="foundation-spinner" aria-hidden="true"></div>
        <div class="foundation-processing-copy">
          <strong>${esc(status)}</strong>
          <span>Please wait. The editor stays locked until the foundation is ready for review.</span>
        </div>
      </div>
    </div>
  `;
}

function renderError() {
  const message = state.newProjectFlow.error || 'Could not generate the project foundation.';
  return `
    <div class="foundation-flow foundation-flow-error">
      <div class="foundation-hero">
        <div class="foundation-kicker">Step 2</div>
        <h2>Foundation generation failed</h2>
        <p>${esc(message)}</p>
      </div>
      <div class="foundation-actions">
        <button class="btn primary" type="button" data-foundation-action="regenerate">Retry</button>
        <button class="btn" type="button" data-foundation-action="edit">Edit CNL</button>
      </div>
    </div>
  `;
}

export function renderNewProjectFlowView() {
  const container = $('#new-project-view');
  if (!container) return;

  const phase = state.newProjectFlow.phase || 'accepted';
  if (phase === 'processing') {
    container.innerHTML = renderProcessing();
  } else if (phase === 'error') {
    container.innerHTML = renderError();
  } else {
    container.innerHTML = `
      <div class="foundation-flow foundation-flow-idle">
        <div class="foundation-hero">
          <div class="foundation-kicker">Foundation</div>
          <h2>Story foundation ready</h2>
          <p>The internal specification was created in the background. Continue in Blueprint to define the story structure.</p>
        </div>
        <div class="foundation-actions">
          <button class="btn primary" type="button" data-foundation-action="accept">Open Blueprint</button>
        </div>
      </div>
    `;
  }

  container.querySelectorAll('[data-foundation-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const action = button.getAttribute('data-foundation-action');
      if (action === 'accept') {
        await acceptFoundation();
      } else if (action === 'regenerate') {
        await regenerateFoundation();
      }
    });
  });
}

function updateProcessingStatus(message) {
  updateNewProjectFlow({ phase: 'processing', status: message, error: '' });
  if ($('#view-newproject')?.classList.contains('active')) {
    renderNewProjectFlowView();
  }
}

async function runFoundationGeneration(wizardData = state.newProjectFlow.wizardData || {}) {
  const data = wizardData || {};
  const options = buildGenerationOptions(data);

  resetNLState();
  ensureFrameworkProfileFromWizard(data);
  updateProcessingStatus('Generating story specification...');

  if (data.strategy === 'advanced') {
    await generateAdvanced(options, {
      onPhase: (phase) => updateProcessingStatus(phase?.label || 'Generating story specification...')
    });
  } else if (data.strategy === 'with-llm') {
    await generateLLM(options, {
      onPhase: (phase) => updateProcessingStatus(phase?.label || 'Generating story specification...')
    });
  } else {
    generateRandom(options);
  }

  ensureFrameworkProfileFromWizard(data);
  updateProcessingStatus('Building controlled natural language...');
  generateCNL();
  refreshAllViews();
  markDirty();
  await saveProject(true);
}

export function isNLStoryLocked() {
  const phase = state.newProjectFlow.phase || 'accepted';
  return phase === 'processing' || phase === 'error';
}

export function getNLStoryLockMessage() {
  if (state.newProjectFlow.phase === 'processing') {
    return 'Story foundation is still generating. Review it before entering NL Story.';
  }
  return 'Story foundation is not ready yet.';
}

export async function acceptFoundation() {
  updateNewProjectFlow({ phase: 'accepted', status: '', error: '' });
  resetNLState();
  markDirty();
  await saveProject(true);
  updateNLGenerateButton();
  window.switchToTab?.('blueprint');
}

export async function regenerateFoundation() {
  try {
    await runFoundationGeneration(state.newProjectFlow.wizardData);
    updateNewProjectFlow({ phase: 'accepted', status: '', error: '' });
    updateNLGenerateButton();
    window.switchToTab?.('blueprint');
  } catch (err) {
    console.error('Foundation regeneration error:', err);
    updateNewProjectFlow({
      phase: 'error',
      error: err?.message || 'Foundation regeneration failed.',
      status: ''
    });
    updateNLGenerateButton();
    if ($('#view-newproject')?.classList.contains('active')) {
      renderNewProjectFlowView();
    }
  }
}

export async function startNewProjectFlow(wizardData) {
  const flowData = { ...wizardData };
  updateNewProjectFlow({
    phase: 'processing',
    wizardData: flowData,
    status: 'Creating project...',
    error: ''
  });

  window.switchToTab?.('newproject');

  try {
    await createProjectFromWizard(String(flowData?.projectName || '').trim());
    updateNewProjectFlow({
      phase: 'processing',
      wizardData: flowData,
      status: 'Generating story specification...',
      error: ''
    });
    await runFoundationGeneration(flowData);
    updateNewProjectFlow({ phase: 'accepted', wizardData: flowData, status: '', error: '' });
    updateNLGenerateButton();
    window.switchToTab?.('blueprint');
  } catch (err) {
    console.error('New project flow failed:', err);
    updateNewProjectFlow({
      phase: 'error',
      error: err?.message || 'Failed to create project foundation.',
      status: ''
    });
    updateNLGenerateButton();
    renderNewProjectFlowView();
  }
}
