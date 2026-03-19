/**
 * SCRIPTA Demo - Framework View
 *
 * Narrative framework workspace: Theme, Dramatic Model, Transformation.
 */

import { state } from './state.mjs';
import { $ } from './utils.mjs';
import { getThemeGuidance } from './theme-guidance.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';

const THEME_SUGGESTIONS = Object.entries(VOCAB.THEMES || {}).slice(0, 5).map(([key, theme]) => ({
  key,
  label: theme.label,
  desc: theme.desc || '',
  blocks: (theme.suggestedBlocks || []).slice(0, 3),
  guidance: getThemeGuidance(key, theme.label)
}));

const THEMATIC_DIRECTION_OPTIONS = [
  'Redemption',
  'Tragedy',
  'Growth',
  'Corruption',
  'Reconciliation',
  'Sacrifice',
  'Liberation',
  'Fall from grace',
  'Moral awakening',
  'Resilience',
  'Transformation through loss'
];

const STORY_CORE_OPTIONS = {
  genre: [
    ['fantasy', 'Fantasy'],
    ['scifi', 'Science Fiction'],
    ['romance', 'Romance'],
    ['mystery', 'Mystery'],
    ['thriller', 'Thriller'],
    ['horror', 'Horror'],
    ['historical', 'Historical'],
    ['adventure', 'Adventure'],
    ['crime', 'Crime'],
    ['drama', 'Drama'],
    ['young_adult', 'Young Adult'],
    ['dystopian', 'Dystopian'],
    ['urban_fantasy', 'Urban Fantasy']
  ],
  tone: [
    ['dark', 'Dark'],
    ['light', 'Optimistic'],
    ['balanced', 'Tense']
  ],
  complexity: [
    ['simple', 'Simple (linear plot)'],
    ['moderate', 'Moderate (some twists)'],
    ['complex', 'Complex (multiple threads)']
  ],
  length: [
    ['short', 'Short (3-5 scenes)'],
    ['medium', 'Medium (8-12 scenes)'],
    ['long', 'Long (15-20 scenes)']
  ],
  chars: [
    ['few', 'Few (2-3)'],
    ['medium', 'Medium (4-6)'],
    ['many', 'Many (7-10)']
  ],
  rules: [
    ['none', 'None'],
    ['few', 'Few'],
    ['many', 'Rich']
  ]
};

const ESCALATION_POINTS = {
  'Step Escalation': [12, 12, 20, 20, 30, 30, 42, 42, 56, 70],
  'Wave Escalation': [12, 24, 18, 30, 24, 40, 34, 52, 48, 68],
  'Spiral Escalation': [10, 16, 24, 20, 32, 30, 44, 40, 58, 74],
  'Cliff Escalation': [10, 12, 14, 16, 20, 28, 40, 56, 68, 80]
};

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
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

function buildThemeAutofill(themeEntity) {
  const themeKey = themeEntity?.themeKey || '';
  if (themeEntity?.ideologicalConflict || themeEntity?.moralQuestion || themeEntity?.transformationAxis || themeEntity?.wisdom) {
    const guidance = getThemeGuidance(themeKey, themeEntity?.name || humanize(themeKey));
    return {
      ideologicalConflict: themeEntity.ideologicalConflict || guidance.ideologicalConflict,
      moralQuestion: themeEntity.moralQuestion || guidance.moralQuestion,
      transformationAxis: themeEntity.transformationAxis || guidance.transformationAxis,
      wisdom: themeEntity.wisdom || guidance.wisdom
    };
  }
  return getThemeGuidance(themeKey, themeEntity?.name || humanize(themeKey) || 'This theme');
}

function ensureFrameworkProfileState() {
  const libraries = state.project.libraries || (state.project.libraries = {});
  const existing = libraries.frameworkProfile || {};
  const constraints = existing.dramaticModel?.constraints || {};
  const transformation = existing.transformation || {};

  libraries.frameworkProfile = {
    storyCore: {
      genre: existing.storyCore?.genre || 'fantasy',
      tone: existing.storyCore?.tone || 'dark',
      complexity: existing.storyCore?.complexity || 'moderate',
      length: existing.storyCore?.length || 'medium',
      chars: existing.storyCore?.chars || 'medium',
      rules: existing.storyCore?.rules || 'few',
      theme: existing.storyCore?.theme || '',
      wisdom: existing.storyCore?.wisdom || ''
    },
    coreTheme: {
      selectedThemeId: existing.coreTheme?.selectedThemeId || '',
      ideologicalConflict: existing.coreTheme?.ideologicalConflict || '',
      moralQuestion: existing.coreTheme?.moralQuestion || '',
      transformationAxis: existing.coreTheme?.transformationAxis || '',
      example: existing.coreTheme?.example || ''
    },
    dramaticModel: {
      conflictEngine: existing.dramaticModel?.conflictEngine || '',
      conflictType: existing.dramaticModel?.conflictType || '',
      resolutionPath: existing.dramaticModel?.resolutionPath || '',
      escalationPattern: existing.dramaticModel?.escalationPattern || 'Wave Escalation',
      thematicDirection: existing.dramaticModel?.thematicDirection
        || existing.dramaticModel?.thematicDirectionPrimary
        || '',
      constraints: {
        nonLinear: Boolean(constraints.nonLinear),
        moralAmbiguity: Boolean(constraints.moralAmbiguity)
      }
    },
    transformation: {
      characterArcBefore: transformation.characterArcBefore || '',
      characterArcAfter: transformation.characterArcAfter || '',
      valueShiftBefore: transformation.valueShiftBefore || '',
      valueShiftAfter: transformation.valueShiftAfter || '',
      lossGainBefore: transformation.lossGainBefore || '',
      lossGainAfter: transformation.lossGainAfter || '',
      newBalanceBefore: transformation.newBalanceBefore || '',
      newBalanceAfter: transformation.newBalanceAfter || '',
      ideaticDirectionBefore: transformation.ideaticDirectionBefore || '',
      ideaticDirectionAfter: transformation.ideaticDirectionAfter || '',
      changeCostBefore: transformation.changeCostBefore || '',
      changeCostAfter: transformation.changeCostAfter || ''
    }
  };

  return libraries.frameworkProfile;
}

function renderStoryCoreSection(profile) {
  const core = profile.storyCore;
  const renderOptions = (entries, selected) => entries.map(([value, label]) => `
    <option value="${esc(value)}" ${selected === value ? 'selected' : ''}>${esc(label)}</option>
  `).join('');

  return `
    <section class="framework-section section-framework-storycore">
      <div class="framework-section-header redesign">
        <h3>Story Fundamentals</h3>
        <p>Complexity, cast scale, world rules, and the core wisdom of the story.</p>
      </div>
      <div class="framework-storycore-grid">
        <label class="framework-new-field">
          <span>Complexity</span>
          <select class="cinematic-select" onchange="window.frameworkUpdateProfile('storyCore','complexity', this.value)">
            ${renderOptions(STORY_CORE_OPTIONS.complexity, core.complexity)}
          </select>
        </label>
        <label class="framework-new-field">
          <span>Number of Characters</span>
          <select class="cinematic-select" onchange="window.frameworkUpdateProfile('storyCore','chars', this.value)">
            ${renderOptions(STORY_CORE_OPTIONS.chars, core.chars)}
          </select>
        </label>
        <label class="framework-new-field">
          <span>World Rules</span>
          <select class="cinematic-select" onchange="window.frameworkUpdateProfile('storyCore','rules', this.value)">
            ${renderOptions(STORY_CORE_OPTIONS.rules, core.rules)}
          </select>
        </label>
      </div>
      <div class="framework-storycore-text">
        <label class="framework-new-field">
          <span>Wisdom</span>
          <textarea
            class="form-textarea"
            placeholder="What should the reader learn or feel?"
            oninput="window.frameworkUpdateProfile('storyCore','wisdom', this.value)"
          >${esc(core.wisdom)}</textarea>
        </label>
      </div>
    </section>
  `;
}

function getThemeRailItems() {
  const themes = state.project.libraries.themes || [];
  const items = [];

  for (let i = 0; i < 3; i++) {
    const entity = themes[i];
    if (entity) {
      const base = VOCAB.THEMES?.[entity.themeKey] || null;
      const guidance = buildThemeAutofill(entity);
      items.push({
        type: 'entity',
        id: entity.id,
        title: entity.name || 'Theme',
        subtitle: entity.themeKey ? humanize(entity.themeKey) : 'Custom theme',
        description: base?.desc || '',
        guidance,
        chips: (base?.suggestedBlocks || []).slice(0, 3)
      });
      continue;
    }

    const suggestion = THEME_SUGGESTIONS[i] || THEME_SUGGESTIONS[i % Math.max(THEME_SUGGESTIONS.length, 1)];
    items.push({
      type: 'suggested',
      title: suggestion?.label || 'Suggested Theme',
      subtitle: 'Template',
      description: suggestion?.desc || '',
      guidance: suggestion?.guidance || null,
      chips: suggestion?.blocks || ['Setup', 'Midpoint', 'Resolution']
    });
  }

  return items;
}

function renderThemeCard(item) {
  const chips = (item.chips || []).map(chip => `<span>${esc(humanize(chip))}</span>`).join('');
  const description = item.description
    ? `<div class="framework-theme-description">${esc(item.description)}</div>`
    : '';
  if (item.type === 'entity') {
    return `
      <button class="framework-theme-card ${item.selected ? 'active' : ''}" type="button" onclick="window.frameworkSelectTheme('${item.id}')">
        <div class="framework-theme-title">${esc(item.title)}</div>
        <div class="framework-theme-subtitle">${esc(item.subtitle)}</div>
        ${description}
        <div class="framework-theme-chips">${chips}</div>
      </button>
    `;
  }

  return `
    <button class="framework-theme-card suggested" type="button" onclick="window.addEntity('themes')">
      <div class="framework-theme-title">${esc(item.title)}</div>
      <div class="framework-theme-subtitle">${esc(item.subtitle)}</div>
      ${description}
      <div class="framework-theme-chips">${chips}</div>
    </button>
  `;
}

function renderThemeSection(profile) {
  const items = getThemeRailItems().map(item => ({
    ...item,
    selected: item.type === 'entity' && item.id === profile.coreTheme.selectedThemeId
  }));

  return `
    <section class="framework-section section-framework-theme">
      <div class="framework-section-header redesign">
        <h3>Theme</h3>
        <p>Core meaning axis and thematic templates.</p>
        <div class="framework-header-actions">
          <button class="framework-inline-btn" type="button" onclick="window.addEntity('themes')">+ Add Theme</button>
          <button
            class="framework-inline-btn"
            type="button"
            onclick="if (typeof window.openLibraryThemes === 'function') window.openLibraryThemes(); else window.addEntity('themes');"
          >
            Add from Library
          </button>
        </div>
      </div>
      <div class="framework-theme-rail-wrap">
        <div class="framework-theme-rail">
          ${items.map(renderThemeCard).join('')}
        </div>
      </div>
      <div class="framework-theme-meta">
        <label class="framework-new-field">
          <span>Ideological Conflict</span>
          <input
            type="text"
            value="${esc(profile.coreTheme.ideologicalConflict)}"
            placeholder="What worldview is contested?"
            oninput="window.frameworkUpdateProfile('coreTheme','ideologicalConflict', this.value)"
          >
        </label>
        <label class="framework-new-field">
          <span>Moral Question</span>
          <input
            type="text"
            value="${esc(profile.coreTheme.moralQuestion)}"
            placeholder="What moral dilemma defines the narrative?"
            oninput="window.frameworkUpdateProfile('coreTheme','moralQuestion', this.value)"
          >
        </label>
        <label class="framework-new-field">
          <span>Transformation Axis</span>
          <input
            type="text"
            value="${esc(profile.coreTheme.transformationAxis)}"
            placeholder="Which value shifts over time?"
            oninput="window.frameworkUpdateProfile('coreTheme','transformationAxis', this.value)"
          >
        </label>
      </div>
    </section>
  `;
}

function renderEscalationGraph(pattern) {
  const points = ESCALATION_POINTS[pattern] || ESCALATION_POINTS['Wave Escalation'];
  const path = points.map((value, index) => {
    const x = 6 + (index * 9.2);
    const y = 34 - (value * 0.35);
    return `${x},${y}`;
  }).join(' ');

  return `
    <div class="dramatic-graph">
      <svg viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden="true">
        <polyline points="${path}" class="dramatic-graph-line" />
        <line x1="6" y1="32" x2="96" y2="32" class="dramatic-graph-axis" />
      </svg>
      <div class="dramatic-graph-labels">
        <span>Opening</span>
        <span>Midpoint</span>
        <span>Finale</span>
      </div>
    </div>
  `;
}

function renderDramaticModelSection(profile) {
  const model = profile.dramaticModel;

  return `
    <section class="framework-section section-framework-dramatic">
      <div class="framework-section-header redesign">
        <h3>Dramatic Model</h3>
        <p>Conflict architecture, escalation logic, structural decisions.</p>
      </div>
      <div class="dramatic-grid">
        <article class="dramatic-card conflict-engine-card">
          <h4>Conflict Engine</h4>
          <label class="framework-new-field">
            <span>Conflict Type</span>
            <select class="cinematic-select" onchange="window.frameworkUpdateProfile('dramaticModel','conflictType', this.value)">
              <option value="">Select type</option>
              <option value="Internal" ${model.conflictType === 'Internal' ? 'selected' : ''}>Internal</option>
              <option value="External" ${model.conflictType === 'External' ? 'selected' : ''}>External</option>
              <option value="Interpersonal" ${model.conflictType === 'Interpersonal' ? 'selected' : ''}>Interpersonal</option>
            </select>
          </label>
          <label class="framework-new-field">
            <span>Resolution Path</span>
            <select class="cinematic-select" onchange="window.frameworkUpdateProfile('dramaticModel','resolutionPath', this.value)">
              <option value="">Select path</option>
              <option value="Reconciliation" ${model.resolutionPath === 'Reconciliation' ? 'selected' : ''}>Reconciliation</option>
              <option value="Defeat" ${model.resolutionPath === 'Defeat' ? 'selected' : ''}>Defeat</option>
              <option value="Partial victory" ${model.resolutionPath === 'Partial victory' ? 'selected' : ''}>Partial victory</option>
              <option value="Inevitable change" ${model.resolutionPath === 'Inevitable change' ? 'selected' : ''}>Inevitable change</option>
            </select>
          </label>
        </article>
        <article class="dramatic-card">
          <h4>Escalation Pattern</h4>
          <select class="cinematic-select" onchange="window.frameworkUpdateProfile('dramaticModel','escalationPattern', this.value); window.renderFrameworkView();">
            ${Object.keys(ESCALATION_POINTS).map(option => `<option value="${esc(option)}" ${model.escalationPattern === option ? 'selected' : ''}>${esc(option)}</option>`).join('')}
          </select>
          ${renderEscalationGraph(model.escalationPattern)}
        </article>
        <article class="dramatic-card narrative-constraints-card">
          <h4>Thematic Direction</h4>
          <label class="framework-new-field">
            <select class="cinematic-select" onchange="window.frameworkUpdateProfile('dramaticModel','thematicDirection', this.value)">
              <option value="">Select direction</option>
              ${THEMATIC_DIRECTION_OPTIONS.map(option => `<option value="${esc(option)}" ${model.thematicDirection === option ? 'selected' : ''}>${esc(option)}</option>`).join('')}
            </select>
          </label>
        </article>
      </div>
    </section>
  `;
}

function renderConstraintToggle(label, enabled, key) {
  return `
    <button
      class="constraint-toggle ${enabled ? 'on' : ''}"
      type="button"
      onclick="window.frameworkToggleConstraint('${key}')"
      aria-pressed="${enabled ? 'true' : 'false'}"
    >
      <span>${esc(label)}</span>
      <span class="toggle-pill"><span></span></span>
    </button>
  `;
}

function renderTransformationCard(title, beforeLabel, afterLabel, beforeValue, afterValue, beforeKey, afterKey, beforePlaceholder = 'Before', afterPlaceholder = 'After') {
  return `
    <article class="transform-card">
      <h4>${esc(title)}</h4>
      <div class="transform-zones">
        <label class="framework-new-field">
          <span>${esc(beforeLabel)}</span>
          <input
            type="text"
            value="${esc(beforeValue)}"
            placeholder="${esc(beforePlaceholder)}"
            oninput="window.frameworkUpdateProfile('transformation','${beforeKey}', this.value)"
          >
        </label>
        <label class="framework-new-field">
          <span>${esc(afterLabel)}</span>
          <input
            type="text"
            value="${esc(afterValue)}"
            placeholder="${esc(afterPlaceholder)}"
            oninput="window.frameworkUpdateProfile('transformation','${afterKey}', this.value)"
          >
        </label>
      </div>
    </article>
  `;
}

function renderTransformationPromptCard(title, promptLabel, value, key, placeholder) {
  return `
    <article class="transform-card">
      <h4>${esc(title)}</h4>
      <label class="framework-new-field">
        <span>${esc(promptLabel)}</span>
        <textarea
          class="form-textarea"
          placeholder="${esc(placeholder)}"
          oninput="window.frameworkUpdateProfile('transformation','${key}', this.value)"
        >${esc(value)}</textarea>
      </label>
    </article>
  `;
}

function renderTransformationSection(profile) {
  const t = profile.transformation;

  return `
    <section class="framework-section section-framework-transformation">
      <div class="framework-section-header redesign">
        <h3>Character Transformation</h3>
        <p>Track who the protagonist is before the story, what they learn, and what change costs them.</p>
      </div>
      <div class="transform-grid">
        ${renderTransformationCard(
          'Character Arc',
          'Before',
          'After',
          t.characterArcBefore,
          t.characterArcAfter,
          'characterArcBefore',
          'characterArcAfter',
          'naive / arrogant / broken / idealistic',
          'wise / corrupted / redeemed / free'
        )}
        ${renderTransformationCard(
          'Value Shift',
          'Believed',
          'Learns',
          t.valueShiftBefore,
          t.valueShiftAfter,
          'valueShiftBefore',
          'valueShiftAfter',
          'Power solves everything',
          'Power destroys what you love'
        )}
        ${renderTransformationPromptCard(
          'Cost of Change',
          'What must the hero lose?',
          t.changeCostAfter,
          'changeCostAfter',
          'a friend\ntheir status\ntheir innocence'
        )}
      </div>
    </section>
  `;
}

function renderFrameworkShell({ pageTitle, pageDescription, bodyMarkup }) {
  return `
    <div class="framework-layout framework-redesign-layout">
      <div class="framework-page-header">
        <div class="framework-page-header-copy">
          <h2>${esc(pageTitle)}</h2>
          <p>${esc(pageDescription)}</p>
        </div>
        <div class="framework-page-header-actions">
          <button class="btn random" type="button" onclick="window.openStoryGenerationShortcut()">
            Create Story
          </button>
        </div>
      </div>
      ${bodyMarkup}
    </div>
  `;
}

function renderFrameworkPage(containerId, pageTitle, pageDescription, sectionRenderer) {
  const container = $(containerId);
  if (!container) return;
  const profile = ensureFrameworkProfileState();
  container.innerHTML = renderFrameworkShell({
    pageTitle,
    pageDescription,
    bodyMarkup: sectionRenderer(profile)
  });
}

function openStoryGenerationShortcut() {
  window.switchToTab?.('nl');
  window.requestAnimationFrame?.(() => {
    document.getElementById('btn-nl-generate')?.click();
  });
}

export function renderFrameworkView() {
  renderStoryFundamentalsView();
}

export function renderStoryFundamentalsView() {
  renderFrameworkPage(
    '#story-fundamentals-view',
    'Story Fundamentals',
    'Define complexity, cast scale, world rules, and the core wisdom that anchors the book.',
    renderStoryCoreSection
  );
}

export function renderCoreThemeView() {
  renderFrameworkPage(
    '#core-theme-view',
    'Theme',
    'Clarify the worldview conflict, moral question, and value shift the story will explore.',
    renderThemeSection
  );
}

export function renderDramaticModelView() {
  renderFrameworkPage(
    '#dramatic-model-view',
    'Dramatic Model',
    'Pick the conflict engine, escalation pattern, and structural direction of the narrative.',
    renderDramaticModelSection
  );
}

export function renderCharacterTransformationView() {
  renderFrameworkPage(
    '#character-transformation-view',
    'Character Transformation',
    'Capture the protagonist arc, the beliefs that break, and the cost of transformation.',
    renderTransformationSection
  );
}

window.renderFrameworkView = renderFrameworkView;
window.openStoryGenerationShortcut = openStoryGenerationShortcut;
window.renderStoryFundamentalsView = renderStoryFundamentalsView;
window.renderCoreThemeView = renderCoreThemeView;
window.renderDramaticModelView = renderDramaticModelView;
window.renderCharacterTransformationView = renderCharacterTransformationView;

window.frameworkUpdateProfile = (section, key, value) => {
  const profile = ensureFrameworkProfileState();
  if (!profile[section] || !(key in profile[section])) return;
  profile[section][key] = value;
};

window.frameworkSelectTheme = (themeId) => {
  const profile = ensureFrameworkProfileState();
  const selectedTheme = (state.project.libraries.themes || []).find(theme => theme.id === themeId) || null;
  profile.coreTheme.selectedThemeId = selectedTheme ? themeId : '';
  if (selectedTheme) {
    const autofill = buildThemeAutofill(selectedTheme);
    const selectedThemeLabel = selectedTheme.name || humanize(selectedTheme.themeKey || '') || '';
    profile.storyCore.theme = selectedThemeLabel;
    profile.storyCore.wisdom = autofill.wisdom;
    profile.coreTheme.ideologicalConflict = autofill.ideologicalConflict;
    profile.coreTheme.moralQuestion = autofill.moralQuestion;
    profile.coreTheme.transformationAxis = autofill.transformationAxis;
  }
  renderFrameworkView();
};

window.frameworkToggleConstraint = (key) => {
  const profile = ensureFrameworkProfileState();
  const constraints = profile.dramaticModel?.constraints;
  if (!constraints || !(key in constraints)) return;
  constraints[key] = !constraints[key];
  renderFrameworkView();
};

export default {
  renderFrameworkView,
  renderStoryFundamentalsView,
  renderCoreThemeView,
  renderDramaticModelView,
  renderCharacterTransformationView
};
