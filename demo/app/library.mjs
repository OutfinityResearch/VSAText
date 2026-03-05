/**
 * SCRIPTA Demo - Library View (Cards + Context Apply)
 */

import { $ } from './utils.mjs';
import { state } from './state.mjs';
import {
  getWisdomCatalog,
  getThemeCatalogByCategory,
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
import { getOrderedChapters } from './structure-navigation.mjs';

const uiState = {
  selection: 'wisdom:tradition',
  chapterTargetId: ''
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function notify(message, level = 'info') {
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, level);
  }
}

export function setLibrarySelection(selection) {
  uiState.selection = selection || 'wisdom:tradition';
  renderLibraryView();
}

export function getLibrarySelection() {
  return uiState.selection;
}

function getCardsForSelection(selection) {
  const [group = 'wisdom', key = 'tradition'] = String(selection || '').split(':');

  if (group === 'wisdom') {
    const section = getWisdomCatalog().find(item => item.key === key);
    if (!section) return { title: 'Wisdom', subtitle: 'No category found', cards: [] };
    return {
      title: 'Wisdom',
      subtitle: section.label,
      cards: section.items.map(item => ({
        kind: 'wisdom',
        key: item.itemKey,
        type: section.key,
        id: '',
        title: item.label,
        description: item.detail,
        meta: [item.origin || section.label]
      }))
    };
  }

  if (group === 'themes') {
    const themeCategories = getThemeCatalogByCategory();
    const presets = themeCategories.flatMap(category => category.items);
    if (key.startsWith('cat_')) {
      const categoryKey = key.replace(/^cat_/, '');
      const category = themeCategories.find(item => item.key === categoryKey);
      if (category) {
        return {
          title: 'Themes',
          subtitle: category.label,
          cards: category.items.map(theme => ({
            kind: 'theme-preset',
            key: theme.key,
            type: '',
            id: '',
            title: theme.label,
            description: theme.detail,
            meta: theme.blocks.map(humanize)
          }))
        };
      }
    }
    if (key === 'all') {
      return {
        title: 'Themes',
        subtitle: 'All Themes',
        cards: presets.map(theme => ({
          kind: 'theme-preset',
          key: theme.key,
          type: '',
          id: '',
          title: theme.label,
          description: theme.detail,
          meta: theme.blocks.map(humanize)
        }))
      };
    }
    if (key && key !== 'saved') {
      const theme = presets.find(item => item.key === key);
      if (theme) {
        return {
          title: 'Themes',
          subtitle: theme.label,
          cards: [{
            kind: 'theme-preset',
            key: theme.key,
            type: '',
            id: '',
            title: theme.label,
            description: theme.detail,
            meta: theme.blocks.map(humanize)
          }]
        };
      }
    }

    if (key === 'saved') {
      const saved = getSavedThemes();
      return {
        title: 'Themes',
        subtitle: 'Saved Themes',
        cards: saved.map(theme => ({
          kind: 'theme-saved',
          key: '',
          type: '',
          id: theme.id,
          title: theme.name || 'Theme',
          description: theme.themeKey ? humanize(theme.themeKey) : 'Custom theme',
          meta: [theme.id]
        }))
      };
    }
  }

  if (group === 'narrative') {
    if (key === 'patterns') {
      return {
        title: 'Narrative Design',
        subtitle: 'Patterns',
        cards: getPatternCatalog().map(item => ({
          kind: 'pattern',
          key: item.key,
          type: '',
          id: '',
          title: item.label,
          description: item.detail,
          meta: (item.structure || []).slice(0, 3)
        }))
      };
    }

    if (key === 'templates') {
      const templates = getTemplateCatalog();
      return {
        title: 'Narrative Design',
        subtitle: 'Templates',
        cards: [
          ...templates.builtin.map(template => ({
            kind: 'template-builtin',
            key: template.id,
            type: '',
            id: '',
            title: template.label,
            description: template.detail,
            meta: [template.arc || '', `${template.chapters} chapters`]
          })),
          ...templates.custom.map(template => ({
            kind: 'template-custom',
            key: template.id,
            type: '',
            id: '',
            title: template.label,
            description: template.detail,
            meta: [template.arc || '', `${template.chapters} chapters`]
          }))
        ]
      };
    }

    if (key === 'blocks') {
      const used = getUsedBlocksCatalog();
      return {
        title: 'Narrative Design',
        subtitle: 'Blocks',
        cards: getBlockCatalog().map(block => ({
          kind: 'block',
          key: block.key,
          type: '',
          id: '',
          title: `${block.label}${used.has(block.key) ? ' ✓' : ''}`,
          description: block.detail,
          meta: [block.phase, block.scope]
        }))
      };
    }
  }

  return { title: 'Library', subtitle: 'No category selected', cards: [] };
}

function chapterOptions() {
  return getOrderedChapters(state.project.structure).map((chapter, index) => ({
    id: chapter.id,
    label: `Chapter ${index + 1}: ${chapter.title || chapter.name || 'Untitled'}`
  }));
}

function applyCard(card, targetType, chapterId = '') {
  if (targetType === 'chapter' && !chapterId) {
    notify('Select a chapter before applying', 'error');
    return;
  }

  const target = targetType === 'chapter'
    ? { targetType: 'chapter', targetId: chapterId }
    : { targetType: 'book', targetId: '' };

  if (card.kind === 'wisdom') applyWisdom(card.type, card.key, target);
  if (card.kind === 'theme-preset') applyThemePreset(card.key, target);
  if (card.kind === 'theme-saved') applySavedTheme(card.id, target);
  if (card.kind === 'pattern') applyPattern(card.key, target);
  if (card.kind === 'template-builtin') applyBuiltInTemplate(card.key, target);
  if (card.kind === 'template-custom') applyCustomTemplate(card.key, target);
  if (card.kind === 'block') applyBlock(card.key, target);
}

function renderCard(card) {
  return `
    <div class="library-card" data-kind="${esc(card.kind)}" data-key="${esc(card.key)}" data-type="${esc(card.type)}" data-id="${esc(card.id)}">
      <div class="library-card-title">${esc(card.title)}</div>
      <div class="library-card-text">${esc(card.description || 'No description')}</div>
      <div class="library-card-meta">
        ${(card.meta || []).filter(Boolean).map(meta => `<span>${esc(humanize(meta))}</span>`).join('')}
      </div>
      <div class="library-card-actions">
        <button class="btn small library-apply-btn" data-action="apply-book">Apply Book</button>
        <button class="btn small library-apply-btn secondary" data-action="apply-chapter">Apply Chapter</button>
      </div>
    </div>
  `;
}

function bindEvents(container, cards, chapters) {
  const chapterSelect = container.querySelector('#library-chapter-target');
  chapterSelect?.addEventListener('change', () => {
    uiState.chapterTargetId = chapterSelect.value;
  });

  container.querySelectorAll('.library-card').forEach((cardEl, index) => {
    const card = cards[index];
    if (!card) return;

    cardEl.querySelector('[data-action="apply-book"]')?.addEventListener('click', () => {
      applyCard(card, 'book', '');
      renderLibraryView();
    });

    cardEl.querySelector('[data-action="apply-chapter"]')?.addEventListener('click', () => {
      const chapterId = uiState.chapterTargetId || (chapters[0]?.id || '');
      applyCard(card, 'chapter', chapterId);
      renderLibraryView();
    });
  });
}

export function renderLibraryView() {
  const container = $('#library-view');
  if (!container) return;

  const data = getCardsForSelection(uiState.selection);
  const cards = data.cards || [];
  const chapters = chapterOptions();

  if (!uiState.chapterTargetId && chapters.length) {
    uiState.chapterTargetId = chapters[0].id;
  }

  container.innerHTML = `
    <div class="library-layout">
      <div class="library-column">
        <div class="library-page-header">
          <h2>${esc(data.title)}</h2>
          <p>${esc(data.subtitle)}</p>
          <div class="library-target-row-inline">
            <label>
              <span>Chapter Target</span>
              <select id="library-chapter-target" ${chapters.length ? '' : 'disabled'}>
                ${chapters.length
                  ? chapters.map(ch => `<option value="${esc(ch.id)}" ${uiState.chapterTargetId === ch.id ? 'selected' : ''}>${esc(ch.label)}</option>`).join('')
                  : '<option value="">No chapters available</option>'}
              </select>
            </label>
          </div>
        </div>

        <div class="library-cards">
          ${cards.length
            ? cards.map(card => renderCard(card)).join('')
            : '<div class="library-empty">No items in this category.</div>'}
        </div>
      </div>
    </div>
  `;

  bindEvents(container, cards, chapters);
}

export default { renderLibraryView, setLibrarySelection, getLibrarySelection };
