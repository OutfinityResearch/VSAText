/**
 * SCRIPTA Demo - Framework View
 *
 * Narrative framework workspace: Theme, Dramatic Model, Transformation.
 */

import { state } from './state.mjs';
import { $ } from './utils.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';

const THEME_SUGGESTIONS = Object.entries(VOCAB.THEMES || {}).slice(0, 5).map(([key, theme]) => ({
  key,
  label: theme.label,
  blocks: (theme.suggestedBlocks || []).slice(0, 3)
}));

const ARC_OPTIONS = [
  'Three-Act Arc',
  'Hero Journey Arc',
  'Tragedy Arc',
  'Redemption Arc',
  'Quest Arc'
];

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

const THEMATIC_POLARITY_OPTIONS = [
  'Love vs Duty',
  'Freedom vs Obligation',
  'Justice vs Mercy',
  'Truth vs Loyalty',
  'Power vs Compassion',
  'Order vs Chaos',
  'Faith vs Doubt',
  'Security vs Autonomy',
  'Tradition vs Change',
  'Honor vs Survival',
  'Revenge vs Forgiveness',
  'Individual vs Community'
];

const TURNING_POINT_OPTIONS = [
  'Inciting Incident',
  'First Plot Point',
  'Midpoint / Crisis',
  'Climax',
  'Resolution / Denouement'
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
      structuralArc: existing.dramaticModel?.structuralArc || '',
      turningPoint: existing.dramaticModel?.turningPoint
        || (Array.isArray(existing.dramaticModel?.turningPoints) ? existing.dramaticModel.turningPoints[0] || '' : ''),
      thematicPolarity: existing.dramaticModel?.thematicPolarity || '',
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
        <h3>Story Core</h3>
        <p>Genre, tone, complexity, scale, and narrative intent.</p>
      </div>
      <div class="framework-storycore-grid">
        <label class="framework-new-field">
          <span>Genre</span>
          <select class="cinematic-select" onchange="window.frameworkUpdateProfile('storyCore','genre', this.value)">
            ${renderOptions(STORY_CORE_OPTIONS.genre, core.genre)}
          </select>
        </label>
        <label class="framework-new-field">
          <span>Tone</span>
          <select class="cinematic-select" onchange="window.frameworkUpdateProfile('storyCore','tone', this.value)">
            ${renderOptions(STORY_CORE_OPTIONS.tone, core.tone)}
          </select>
        </label>
        <label class="framework-new-field">
          <span>Complexity</span>
          <select class="cinematic-select" onchange="window.frameworkUpdateProfile('storyCore','complexity', this.value)">
            ${renderOptions(STORY_CORE_OPTIONS.complexity, core.complexity)}
          </select>
        </label>
        <label class="framework-new-field">
          <span>Story Length</span>
          <select class="cinematic-select" onchange="window.frameworkUpdateProfile('storyCore','length', this.value)">
            ${renderOptions(STORY_CORE_OPTIONS.length, core.length)}
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
          <span>Theme</span>
          <textarea
            class="form-textarea"
            placeholder="Core theme, moral axis, central question..."
            oninput="window.frameworkUpdateProfile('storyCore','theme', this.value)"
          >${esc(core.theme)}</textarea>
        </label>
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

  for (let i = 0; i < 5; i++) {
    const entity = themes[i];
    if (entity) {
      const base = VOCAB.THEMES?.[entity.themeKey] || null;
      items.push({
        type: 'entity',
        id: entity.id,
        title: entity.name || 'Theme',
        subtitle: entity.themeKey ? humanize(entity.themeKey) : 'Custom theme',
        chips: (base?.suggestedBlocks || []).slice(0, 3)
      });
      continue;
    }

    const suggestion = THEME_SUGGESTIONS[i] || THEME_SUGGESTIONS[i % Math.max(THEME_SUGGESTIONS.length, 1)];
    items.push({
      type: 'suggested',
      title: suggestion?.label || 'Suggested Theme',
      subtitle: 'Template',
      chips: suggestion?.blocks || ['Setup', 'Midpoint', 'Resolution']
    });
  }

  return items;
}

function renderThemeCard(item) {
  const chips = (item.chips || []).map(chip => `<span>${esc(humanize(chip))}</span>`).join('');
  if (item.type === 'entity') {
    return `
      <button class="framework-theme-card ${item.selected ? 'active' : ''}" type="button" onclick="window.frameworkSelectTheme('${item.id}')">
        <div class="framework-theme-title">${esc(item.title)}</div>
        <div class="framework-theme-subtitle">${esc(item.subtitle)}</div>
        <div class="framework-theme-chips">${chips}</div>
      </button>
    `;
  }

  return `
    <button class="framework-theme-card suggested" type="button" onclick="window.addEntity('themes')">
      <div class="framework-theme-title">${esc(item.title)}</div>
      <div class="framework-theme-subtitle">${esc(item.subtitle)}</div>
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
        <article class="dramatic-card">
          <h4>Structural Arc</h4>
          <label class="framework-new-field">
            <span>Arc Type</span>
            <select class="cinematic-select" onchange="window.frameworkUpdateProfile('dramaticModel','structuralArc', this.value)">
              <option value="">Select arc</option>
              ${ARC_OPTIONS.map(option => `<option value="${esc(option)}" ${model.structuralArc === option ? 'selected' : ''}>${esc(option)}</option>`).join('')}
            </select>
          </label>
          <div class="turning-points-block">
            <div class="turning-points-title">Turning Points</div>
            <select class="cinematic-select" onchange="window.frameworkUpdateProfile('dramaticModel','turningPoint', this.value)">
              <option value="">Select turning point</option>
              ${TURNING_POINT_OPTIONS.map(point => `<option value="${esc(point)}" ${model.turningPoint === point ? 'selected' : ''}>${esc(point)}</option>`).join('')}
            </select>
          </div>
        </article>
        <article class="dramatic-card narrative-constraints-card">
          <h4>Narrative Constraints</h4>
          <div class="constraint-toggles">
            ${renderConstraintToggle('Non-linear timeline', model.constraints.nonLinear, 'nonLinear')}
            ${renderConstraintToggle('Moral ambiguity', model.constraints.moralAmbiguity, 'moralAmbiguity')}
          </div>
        </article>
        <article class="dramatic-card">
          <h4>Thematic Polarity</h4>
          <label class="framework-new-field">
            <span>Thematic Polarity</span>
            <select class="cinematic-select" onchange="window.frameworkUpdateProfile('dramaticModel','thematicPolarity', this.value)">
              <option value="">Select polarity</option>
              ${THEMATIC_POLARITY_OPTIONS.map(option => `<option value="${esc(option)}" ${model.thematicPolarity === option ? 'selected' : ''}>${esc(option)}</option>`).join('')}
            </select>
          </label>
          <label class="framework-new-field">
            <span>Thematic Direction</span>
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

function renderTransformationCard(title, beforeLabel, afterLabel, beforeValue, afterValue, beforeKey, afterKey) {
  return `
    <article class="transform-card">
      <h4>${esc(title)}</h4>
      <div class="transform-zones">
        <label class="framework-new-field">
          <span>${esc(beforeLabel)}</span>
          <input
            type="text"
            value="${esc(beforeValue)}"
            placeholder="Before"
            oninput="window.frameworkUpdateProfile('transformation','${beforeKey}', this.value)"
          >
        </label>
        <label class="framework-new-field">
          <span>${esc(afterLabel)}</span>
          <input
            type="text"
            value="${esc(afterValue)}"
            placeholder="After"
            oninput="window.frameworkUpdateProfile('transformation','${afterKey}', this.value)"
          >
        </label>
      </div>
    </article>
  `;
}

function renderTransformationSection(profile) {
  const t = profile.transformation;

  return `
    <section class="framework-section section-framework-transformation">
      <div class="framework-section-header redesign">
        <h3>Transformation</h3>
        <p>Before/after identity shift with value shifts, cost, and new equilibrium.</p>
      </div>
      <div class="transform-grid">
        ${renderTransformationCard('Character Arc', 'Before', 'After', t.characterArcBefore, t.characterArcAfter, 'characterArcBefore', 'characterArcAfter')}
        ${renderTransformationCard('Value Shift', 'Before Values', 'After Values', t.valueShiftBefore, t.valueShiftAfter, 'valueShiftBefore', 'valueShiftAfter')}
        ${renderTransformationCard('Loss / Gain', 'Loss/Gain Before', 'Loss/Gain After', t.lossGainBefore, t.lossGainAfter, 'lossGainBefore', 'lossGainAfter')}
        ${renderTransformationCard('New Equilibrium', 'Old Balance', 'New Balance', t.newBalanceBefore, t.newBalanceAfter, 'newBalanceBefore', 'newBalanceAfter')}
        ${renderTransformationCard('Ideatic Direction', 'Initial Direction', 'Final Direction', t.ideaticDirectionBefore, t.ideaticDirectionAfter, 'ideaticDirectionBefore', 'ideaticDirectionAfter')}
        ${renderTransformationCard('Cost of Change', 'Cost Avoided', 'Cost Paid', t.changeCostBefore, t.changeCostAfter, 'changeCostBefore', 'changeCostAfter')}
      </div>
    </section>
  `;
}

function renderFrameworkDesign() {
  const profile = ensureFrameworkProfileState();
  return `
    ${renderStoryCoreSection(profile)}
    ${renderThemeSection(profile)}
    ${renderDramaticModelSection(profile)}
    ${renderTransformationSection(profile)}
  `;
}

export function renderFrameworkView() {
  const container = $('#framework-view');
  if (!container) return;

  container.innerHTML = `
    <div class="framework-layout framework-redesign-layout">
      <div class="framework-page-header">
        <h2>Framework</h2>
        <p>Compose theme, dramatic mechanism, and transformation in one structured workspace.</p>
      </div>
      ${renderFrameworkDesign()}
    </div>
  `;
}

window.renderFrameworkView = renderFrameworkView;

window.frameworkUpdateProfile = (section, key, value) => {
  const profile = ensureFrameworkProfileState();
  if (!profile[section] || !(key in profile[section])) return;
  profile[section][key] = value;
};

window.frameworkSelectTheme = (themeId) => {
  const profile = ensureFrameworkProfileState();
  const exists = (state.project.libraries.themes || []).some(theme => theme.id === themeId);
  profile.coreTheme.selectedThemeId = exists ? themeId : '';
  renderFrameworkView();
};

window.frameworkToggleConstraint = (key) => {
  const profile = ensureFrameworkProfileState();
  const constraints = profile.dramaticModel?.constraints;
  if (!constraints || !(key in constraints)) return;
  constraints[key] = !constraints[key];
  renderFrameworkView();
};

export default { renderFrameworkView };
