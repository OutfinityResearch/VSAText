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
      selectedThemeKey: existing.coreTheme?.selectedThemeKey || '',
      customThemeName: existing.coreTheme?.customThemeName || '',
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
    <section class="framework-section section-framework-storycore storycore-showcase">
      <div class="storycore-showcase-grid">
        <div class="storycore-form-column">
          <label class="framework-new-field storycore-form-card">
            <div class="storycore-field-title">
              <span class="storycore-field-icon" aria-hidden="true">🧭</span>
              <span>Complexity</span>
            </div>
            <select class="cinematic-select storycore-select" onchange="window.frameworkUpdateProfile('storyCore','complexity', this.value)">
              ${renderOptions(STORY_CORE_OPTIONS.complexity, core.complexity)}
            </select>
          </label>
          <label class="framework-new-field storycore-form-card">
            <div class="storycore-field-title">
              <span class="storycore-field-icon" aria-hidden="true">👥</span>
              <span>Number of Characters</span>
            </div>
            <select class="cinematic-select storycore-select" onchange="window.frameworkUpdateProfile('storyCore','chars', this.value)">
              ${renderOptions(STORY_CORE_OPTIONS.chars, core.chars)}
            </select>
          </label>
          <label class="framework-new-field storycore-form-card">
            <div class="storycore-field-title">
              <span class="storycore-field-icon" aria-hidden="true">🌍</span>
              <span>World Rules</span>
            </div>
            <select class="cinematic-select storycore-select" onchange="window.frameworkUpdateProfile('storyCore','rules', this.value)">
              ${renderOptions(STORY_CORE_OPTIONS.rules, core.rules)}
            </select>
          </label>
        </div>
        <aside class="storycore-wisdom-column">
          <label class="framework-new-field storycore-form-card storycore-form-card-wide storycore-wisdom-card">
            <div class="framework-field-head">
              <div class="storycore-field-title">
                <span class="storycore-field-icon" aria-hidden="true">💡</span>
                <span>Wisdom</span>
              </div>
              <button
                class="framework-inline-btn storycore-library-btn"
                type="button"
                onclick="if (typeof window.openLibraryWisdom === 'function') window.openLibraryWisdom();"
              >
                + Add from Library
              </button>
            </div>
            <textarea
              class="form-textarea storycore-textarea"
              placeholder="Write the central lesson of your story or choose one from Library."
              oninput="window.frameworkUpdateProfile('storyCore','wisdom', this.value)"
            >${esc(core.wisdom)}</textarea>
            <div class="storycore-wisdom-suggestions">
              ${['Love', 'Betrayal', 'Survival', 'Redemption'].map((item) => `
                <button
                  class="storycore-suggestion-chip"
                  type="button"
                  onclick="window.frameworkUpdateProfile('storyCore','wisdom','${esc(item)}'); window.renderStoryFundamentalsView();"
                >
                  ${esc(item)}
                </button>
              `).join('')}
            </div>
            <div class="storycore-wisdom-help">
              Add the central lesson or truth your reader should remember after the story ends.
            </div>
          </label>
        </aside>
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
  const themeEntities = state.project.libraries.themes || [];
  const selectedTheme = themeEntities.find(item => item.id === profile.coreTheme.selectedThemeId) || null;
  const quickThemes = THEME_SUGGESTIONS.slice(0, 5);
  const activeThemeKey = selectedTheme?.themeKey || profile.coreTheme.selectedThemeKey || '';
  const customThemeName = profile.coreTheme.customThemeName || '';
  const selectedThemeDescription = selectedTheme
    ? (VOCAB.THEMES?.[selectedTheme.themeKey || '']?.desc || selectedTheme.description || '')
    : (VOCAB.THEMES?.[activeThemeKey]?.desc || '');

  return `
    <section class="framework-section section-framework-theme">
      <div class="framework-section-header redesign">
        <p>Choose the main idea your story explores and define how it is tested.</p>
        <div class="framework-header-actions">
          <button class="framework-inline-btn" type="button" onclick="window.openThemeEditorPage?.()">+ Add Theme</button>
          <button
            class="framework-inline-btn"
            type="button"
            onclick="if (typeof window.openLibraryThemes === 'function') window.openLibraryThemes(); else window.addEntity('themes');"
          >
            Add from Library
          </button>
        </div>
      </div>
      <div class="framework-theme-layout">
        <section class="framework-theme-panel">
          <label class="framework-new-field">
            <span>Theme Name</span>
            <input
              id="framework-custom-theme-name"
              type="text"
              value="${esc(customThemeName)}"
              placeholder="Write your custom theme name"
              oninput="window.frameworkUpdateProfile('coreTheme','customThemeName', this.value)"
            >
          </label>
          <label class="framework-new-field">
            <span>Selected Theme</span>
            <select
              class="cinematic-select"
              onchange="window.frameworkSelectTheme(this.value)"
            >
              <option value="">
                ${esc(activeThemeKey ? humanize(activeThemeKey) : (customThemeName || 'No selected theme'))}
              </option>
              ${themeEntities.map((item) => `
                <option value="${esc(item.id)}" ${item.id === profile.coreTheme.selectedThemeId ? 'selected' : ''}>
                  ${esc(item.name || humanize(item.themeKey || 'Theme'))}
                </option>
              `).join('')}
            </select>
          </label>
          <div class="framework-theme-suggestions">
            ${quickThemes.map((item) => `
              <button
                class="framework-theme-chip ${item.key === activeThemeKey ? 'active' : ''}"
                type="button"
                onclick="window.frameworkApplyThemeSuggestion('${esc(item.key)}')"
              >
                ${esc(item.label)}
              </button>
            `).join('')}
          </div>
          <div class="framework-theme-summary">
            <strong>${esc(
              selectedTheme
                ? (selectedTheme.name || humanize(selectedTheme.themeKey || 'Theme'))
                : (activeThemeKey ? humanize(activeThemeKey) : (customThemeName || 'No theme selected'))
            )}</strong>
            <p>${esc(selectedThemeDescription || 'Choose a saved theme, add one from Library, or use a quick suggestion to prefill the guidance below.')}</p>
          </div>
        </section>
        <section class="framework-theme-panel">
          <div class="framework-theme-fields">
            <label class="framework-new-field">
              <span>Ideological Conflict</span>
              <input
                type="text"
                value="${esc(profile.coreTheme.ideologicalConflict)}"
                placeholder="What two worldviews are in tension?"
                oninput="window.frameworkUpdateProfile('coreTheme','ideologicalConflict', this.value)"
              >
            </label>
            <label class="framework-new-field">
              <span>Moral Question</span>
              <input
                type="text"
                value="${esc(profile.coreTheme.moralQuestion)}"
                placeholder="What difficult question should the story explore?"
                oninput="window.frameworkUpdateProfile('coreTheme','moralQuestion', this.value)"
              >
            </label>
            <label class="framework-new-field">
              <span>Transformation Axis</span>
              <input
                type="text"
                value="${esc(profile.coreTheme.transformationAxis)}"
                placeholder="Which value or belief changes over time?"
                oninput="window.frameworkUpdateProfile('coreTheme','transformationAxis', this.value)"
              >
            </label>
          </div>
        </section>
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
        <p>Define how conflict works in the story, how it escalates, and what direction the dramatic movement should follow.</p>
      </div>
      <div class="dramatic-grid dramatic-grid-redesign">
        <article class="dramatic-card dramatic-card-wide conflict-engine-card">
          <div class="dramatic-card-copy">
            <h4>Conflict Engine</h4>
            <p>Set the main type of conflict and the path through which it reaches resolution.</p>
          </div>
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
          <div class="dramatic-card-copy">
            <h4>Escalation Pattern</h4>
            <p>Choose the rhythm of pressure, reversals, and dramatic buildup across the story.</p>
          </div>
          <select class="cinematic-select" onchange="window.frameworkUpdateProfile('dramaticModel','escalationPattern', this.value); window.renderFrameworkView();">
            ${Object.keys(ESCALATION_POINTS).map(option => `<option value="${esc(option)}" ${model.escalationPattern === option ? 'selected' : ''}>${esc(option)}</option>`).join('')}
          </select>
          ${renderEscalationGraph(model.escalationPattern)}
        </article>
        <article class="dramatic-card narrative-constraints-card">
          <div class="dramatic-card-copy">
            <h4>Thematic Direction</h4>
            <p>Clarify the direction in which the dramatic conflict pushes the meaning of the story.</p>
          </div>
          <label class="framework-new-field">
            <span>Direction</span>
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

function renderFrameworkShell({ pageTitle, pageDescription, helperMarkup = '', bodyMarkup, showHeaderActions = true }) {
  return `
    <div class="framework-layout framework-redesign-layout">
      <div class="framework-page-header">
        <div class="framework-page-header-top">
          <div class="framework-page-header-copy">
            <h2>${esc(pageTitle)}</h2>
          </div>
          ${showHeaderActions ? `
            <div class="framework-page-header-actions">
              <button class="btn random" type="button" onclick="window.openStoryGenerationShortcut()">
                Create Story
              </button>
            </div>
          ` : ''}
        </div>
        <div class="framework-page-header-divider"></div>
        <div class="framework-page-header-subtitle">
          <p>${esc(pageDescription)}</p>
        </div>
      </div>
      ${helperMarkup}
      ${bodyMarkup}
    </div>
  `;
}

function renderFrameworkPage(containerId, pageTitle, pageDescription, sectionRenderer, helperMarkup = '', options = {}) {
  const container = $(containerId);
  if (!container) return;
  const profile = ensureFrameworkProfileState();
  container.innerHTML = renderFrameworkShell({
    pageTitle,
    pageDescription,
    helperMarkup,
    bodyMarkup: sectionRenderer(profile),
    showHeaderActions: options.showHeaderActions !== false
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
    'You can define the core elements of your story. Here, you choose the complexity, number of characters, and world rules, as well as the wisdom or central lesson, either from the app’s library or written by you, to structure your story in a clear and engaging way.',
    renderStoryCoreSection,
    '',
    { showHeaderActions: false }
  );
}

export function renderCoreThemeView() {
  renderFrameworkPage(
    '#core-theme-view',
    'Theme',
    'Use this page to define the main theme of your story. Choose or create a theme, then complete the ideological conflict, moral question, and transformation axis to show what the story is really about.',
    renderThemeSection,
    '',
    { showHeaderActions: false }
  );
}

export function renderDramaticModelView() {
  renderFrameworkPage(
    '#dramatic-model-view',
    'Dramatic Model',
    'Use this page to define how the main conflict works in your story. Choose the conflict type, decide how it escalates, and set the dramatic direction that will guide the narrative from beginning to end.',
    renderDramaticModelSection,
    '',
    { showHeaderActions: false }
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
  profile.coreTheme.selectedThemeKey = selectedTheme?.themeKey || '';
  profile.coreTheme.customThemeName = selectedTheme?.name || profile.coreTheme.customThemeName || '';
  if (selectedTheme) {
    const autofill = buildThemeAutofill(selectedTheme);
    const selectedThemeLabel = selectedTheme.name || humanize(selectedTheme.themeKey || '') || '';
    profile.storyCore.theme = selectedThemeLabel;
    profile.storyCore.wisdom = autofill.wisdom;
    profile.coreTheme.ideologicalConflict = autofill.ideologicalConflict;
    profile.coreTheme.moralQuestion = autofill.moralQuestion;
    profile.coreTheme.transformationAxis = autofill.transformationAxis;
  }
  renderCoreThemeView();
};

window.frameworkApplyThemeSuggestion = (themeKey) => {
  const profile = ensureFrameworkProfileState();
  const suggestion = THEME_SUGGESTIONS.find(item => item.key === themeKey);
  const guidance = getThemeGuidance(themeKey, suggestion?.label || humanize(themeKey));
  profile.coreTheme.selectedThemeId = '';
  profile.coreTheme.selectedThemeKey = themeKey;
  profile.coreTheme.customThemeName = suggestion?.label || humanize(themeKey);
  profile.storyCore.theme = suggestion?.label || humanize(themeKey);
  profile.storyCore.wisdom = guidance.wisdom;
  profile.coreTheme.ideologicalConflict = guidance.ideologicalConflict;
  profile.coreTheme.moralQuestion = guidance.moralQuestion;
  profile.coreTheme.transformationAxis = guidance.transformationAxis;
  renderCoreThemeView();
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
