/**
 * SCRIPTA Demo - Global Library View
 */

import { $ } from './utils.mjs';
import {
  getWisdomCatalog,
  getThemePresetCatalog,
  getSavedThemes,
  getPatternCatalog,
  getTemplateCatalog,
  getBlockCatalog,
  getUsedBlocksCatalog,
  applyWisdom,
  applyThemePreset,
  applySavedTheme,
  applyPattern,
  applyBuiltInTemplate,
  applyCustomTemplate,
  applyBlock,
  humanize
} from './library-data.mjs';

const uiState = {
  wisdomQuery: '',
  wisdomCategory: 'all',
  selectedCardId: '',
  openSections: {
    wisdom: false,
    themes: false,
    'narrative-design': false
  }
};

const WISDOM_CATEGORY_LABELS = {
  all: 'All Categories',
  tradition: 'Philosophical Traditions',
  moral: 'Moral Insights',
  psychological: 'Psychological Insights',
  scientific: 'Scientific Insights',
  humanist: 'Humanist Principles',
  lesson: 'Life Lessons'
};

const WISDOM_CATEGORY_ICONS = {
  tradition: '🏛',
  moral: '⚖',
  psychological: '🧠',
  scientific: '🔬',
  humanist: '🤝',
  lesson: '📚'
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function makeCardId(kind, key, type, id) {
  return [kind || '', key || '', type || '', id || ''].join('::');
}

function renderSectionAccordion(title, subtitle, key, contentHtml, open = true) {
  const isOpen = Object.prototype.hasOwnProperty.call(uiState.openSections, key)
    ? Boolean(uiState.openSections[key])
    : open;
  return `
    <details class="library-collapsible" ${isOpen ? 'open' : ''} data-section="${key}">
      <summary>
        <span class="library-collapsible-main">
          <span class="library-collapsible-title">${esc(title)}</span>
          <span class="library-collapsible-subtitle">${esc(subtitle)}</span>
        </span>
        <span class="library-collapsible-indicator" aria-hidden="true">
          <span class="library-collapsible-indicator-label">Expand</span>
          <span class="library-collapsible-chevron">▸</span>
        </span>
      </summary>
      <div class="library-collapsible-content">
        ${contentHtml}
      </div>
    </details>
  `;
}

function filterWisdomItems(items, query) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(item => {
    const text = `${item.label || ''} ${item.detail || ''} ${item.origin || ''}`.toLowerCase();
    return text.includes(q);
  });
}

function renderWisdomFilters() {
  return `
    <div class="library-filter-row">
      <label class="library-filter-field">
        <span>Search</span>
        <input id="library-wisdom-search" type="text" placeholder="Search concepts, principles, keywords..." value="${esc(uiState.wisdomQuery)}">
      </label>
      <label class="library-filter-field">
        <span>Category</span>
        <select id="library-wisdom-category">
          ${Object.entries(WISDOM_CATEGORY_LABELS).map(([key, label]) => (
            `<option value="${key}" ${uiState.wisdomCategory === key ? 'selected' : ''}>${esc(label)}</option>`
          )).join('')}
        </select>
      </label>
    </div>
  `;
}

function renderWisdomSection() {
  const allSections = getWisdomCatalog();
  const query = uiState.wisdomQuery.trim();

  const visibleSections = allSections
    .filter(section => uiState.wisdomCategory === 'all' || section.key === uiState.wisdomCategory)
    .map(section => {
      const items = filterWisdomItems(section.items, query);
      return { ...section, items };
    })
    .filter(section => section.items.length > 0);

  const sectionsHtml = visibleSections.length === 0
    ? '<div class="library-empty">No wisdom items match your filter.</div>'
    : visibleSections.map(section => `
      <article class="library-group">
        <div class="library-group-head">
          <span class="library-group-title"><span class="library-cat-icon">${WISDOM_CATEGORY_ICONS[section.key] || '•'}</span>${esc(section.label)}</span>
          <span class="library-count">${section.items.length}</span>
        </div>
        <div class="library-cards">
          ${section.items.map(item => {
            const cardId = makeCardId('wisdom', item.itemKey, section.key, '');
            return `
              <div class="library-card ${uiState.selectedCardId === cardId ? 'selected' : ''}" data-kind="wisdom" data-type="${section.key}" data-key="${item.itemKey}" data-card-id="${cardId}">
                <div class="library-card-title">${esc(item.label)}</div>
                <div class="library-card-text">${esc(item.detail)}</div>
                <div class="library-card-actions">
                  <button class="btn small library-apply-btn" data-action="apply">Apply</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </article>
    `).join('');

  return `${renderWisdomFilters()}<div class="library-section-groups">${sectionsHtml}</div>`;
}

function renderThemesSection() {
  const presetThemes = getThemePresetCatalog();
  const savedThemes = getSavedThemes();

  return `
    <div class="library-group">
      <div class="library-group-head">
        <span class="library-group-title">Preset Themes</span>
        <span class="library-count">${presetThemes.length}</span>
      </div>
      <div class="library-cards">
        ${presetThemes.map(theme => {
          const cardId = makeCardId('theme-preset', theme.key, '', '');
          return `
            <div class="library-card ${uiState.selectedCardId === cardId ? 'selected' : ''}" data-kind="theme-preset" data-key="${theme.key}" data-card-id="${cardId}">
              <div class="library-card-title">${esc(theme.label)}</div>
              <div class="library-card-text">${esc(theme.detail)}</div>
              <div class="library-card-meta">${theme.blocks.map(block => `<span>${esc(humanize(block))}</span>`).join('')}</div>
              <div class="library-card-actions">
                <button class="btn small library-apply-btn" data-action="apply">Apply</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    <div class="library-group">
      <div class="library-group-head">
        <span class="library-group-title">Saved Themes</span>
        <span class="library-count">${savedThemes.length}</span>
      </div>
      <div class="library-cards">
        ${savedThemes.length === 0
          ? '<div class="library-empty">No saved themes yet.</div>'
          : savedThemes.map(theme => {
            const cardId = makeCardId('theme-saved', '', '', theme.id);
            return `
              <div class="library-card ${uiState.selectedCardId === cardId ? 'selected' : ''}" data-kind="theme-saved" data-id="${theme.id}" data-card-id="${cardId}">
                <div class="library-card-title">${esc(theme.name || 'Theme')}</div>
                <div class="library-card-text">${esc(theme.themeKey ? humanize(theme.themeKey) : 'Custom theme')}</div>
                <div class="library-card-actions">
                  <button class="btn small library-apply-btn" data-action="apply">Use</button>
                </div>
              </div>
            `;
          }).join('')}
      </div>
    </div>
  `;
}

function renderNarrativeDesignSection() {
  const patternItems = getPatternCatalog();
  const templates = getTemplateCatalog();
  const blockItems = getBlockCatalog();
  const usedBlocks = getUsedBlocksCatalog();

  return `
    <div class="library-group">
      <div class="library-group-head">
        <span class="library-group-title">Patterns</span>
        <span class="library-count">${patternItems.length}</span>
      </div>
      <div class="library-cards">
        ${patternItems.map(pattern => {
          const cardId = makeCardId('pattern', pattern.key, '', '');
          return `
            <div class="library-card ${uiState.selectedCardId === cardId ? 'selected' : ''}" data-kind="pattern" data-key="${pattern.key}" data-card-id="${cardId}">
              <div class="library-card-title">${esc(pattern.label)}</div>
              <div class="library-card-text">${esc(pattern.detail)}</div>
              <div class="library-card-actions">
                <button class="btn small library-apply-btn" data-action="apply">Apply</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    <div class="library-group">
      <div class="library-group-head">
        <span class="library-group-title">Templates</span>
        <span class="library-count">${templates.builtin.length + templates.custom.length}</span>
      </div>
      <div class="library-cards">
        ${templates.builtin.map(template => {
          const cardId = makeCardId('template-builtin', template.id, '', '');
          return `
            <div class="library-card ${uiState.selectedCardId === cardId ? 'selected' : ''}" data-kind="template-builtin" data-key="${template.id}" data-card-id="${cardId}">
              <div class="library-card-title">${esc(template.label)}</div>
              <div class="library-card-text">${esc(template.detail)}</div>
              <div class="library-card-meta"><span>${esc(template.arc)}</span><span>${template.chapters} chapters</span></div>
              <div class="library-card-actions">
                <button class="btn small library-apply-btn" data-action="apply">Apply</button>
              </div>
            </div>
          `;
        }).join('')}
        ${templates.custom.map(template => {
          const cardId = makeCardId('template-custom', template.id, '', '');
          return `
            <div class="library-card ${uiState.selectedCardId === cardId ? 'selected' : ''}" data-kind="template-custom" data-key="${template.id}" data-card-id="${cardId}">
              <div class="library-card-title">${esc(template.label)}</div>
              <div class="library-card-text">${esc(template.detail)}</div>
              <div class="library-card-meta"><span>${esc(template.arc)}</span><span>${template.chapters} chapters</span></div>
              <div class="library-card-actions">
                <button class="btn small library-apply-btn" data-action="apply">Apply</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    <div class="library-group">
      <div class="library-group-head">
        <span class="library-group-title">Blocks</span>
        <span class="library-count">${blockItems.length}</span>
      </div>
      <div class="library-cards">
        ${blockItems.map(block => {
          const cardId = makeCardId('block', block.key, '', '');
          return `
            <div class="library-card ${uiState.selectedCardId === cardId ? 'selected' : ''}" data-kind="block" data-key="${block.key}" data-card-id="${cardId}">
              <div class="library-card-title">${esc(block.label)} ${usedBlocks.has(block.key) ? '✓' : ''}</div>
              <div class="library-card-text">${esc(block.detail)}</div>
              <div class="library-card-meta"><span>${esc(block.phase)}</span><span>${esc(block.scope)}</span></div>
              <div class="library-card-actions">
                <button class="btn small library-apply-btn" data-action="apply">Apply</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function handleApply(cardEl) {
  const kind = cardEl.dataset.kind || '';
  const key = cardEl.dataset.key;
  const type = cardEl.dataset.type;
  const id = cardEl.dataset.id;

  if (kind === 'wisdom') applyWisdom(type, key);
  if (kind === 'theme-preset') applyThemePreset(key);
  if (kind === 'theme-saved') applySavedTheme(id);
  if (kind === 'pattern') applyPattern(key);
  if (kind === 'template-builtin') applyBuiltInTemplate(key);
  if (kind === 'template-custom') applyCustomTemplate(key);
  if (kind === 'block') applyBlock(key);
}

function bindLibraryEvents(container) {
  const syncOpenSections = () => {
    container.querySelectorAll('.library-collapsible[data-section]').forEach(section => {
      const key = section.dataset.section;
      if (!key) return;
      uiState.openSections[key] = section.open;
    });
  };

  container.querySelectorAll('.library-collapsible[data-section]').forEach(section => {
    section.addEventListener('toggle', () => {
      const key = section.dataset.section;
      if (!key) return;
      uiState.openSections[key] = section.open;
    });
  });

  const searchInput = container.querySelector('#library-wisdom-search');
  const categorySelect = container.querySelector('#library-wisdom-category');

  searchInput?.addEventListener('input', () => {
    syncOpenSections();
    uiState.wisdomQuery = searchInput.value;
    renderLibraryView();
  });

  categorySelect?.addEventListener('change', () => {
    syncOpenSections();
    uiState.wisdomCategory = categorySelect.value;
    renderLibraryView();
  });

  container.querySelectorAll('.library-card').forEach(card => {
    card.addEventListener('click', (event) => {
      syncOpenSections();
      const actionEl = event.target.closest('[data-action]');
      const cardId = card.dataset.cardId || '';
      uiState.selectedCardId = cardId;

      if (!actionEl) {
        renderLibraryView();
        return;
      }

      if (actionEl.dataset.action === 'apply') {
        handleApply(card);
      }

      renderLibraryView();
    });
  });
}

export function renderLibraryView() {
  const container = $('#library-view');
  if (!container) return;

  container.innerHTML = `
    <div class="library-layout">
      <div class="library-column">
        <div class="library-page-header">
          <h2>Library</h2>
          <p>Reusable structures across the platform.</p>
        </div>

        ${renderSectionAccordion('Wisdom', '6 categories and reusable principles', 'wisdom', renderWisdomSection(), false)}
        ${renderSectionAccordion('Themes', 'Preset and saved themes', 'themes', renderThemesSection(), false)}
        ${renderSectionAccordion('Narrative Design', 'Patterns, templates, and blocks', 'narrative-design', renderNarrativeDesignSection(), false)}
      </div>
    </div>
  `;

  bindLibraryEvents(container);
}

export default { renderLibraryView };
