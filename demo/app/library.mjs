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
import { getOrderedChapters, getChapterScenes } from './structure-navigation.mjs';
import { getChaptersForManuscript, getScenesForManuscriptChapter } from './writing-studio-manuscript.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';

const uiState = {
  selection: 'wisdom:tradition',
  chapterTargetId: '',
  applyContext: null
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
  uiState.applyContext = null;
  renderLibraryView();
}

export function getLibrarySelection() {
  return uiState.selection;
}

function getCardsForSelection(selection) {
  const [group = 'wisdom', key = 'tradition'] = String(selection || '').split(':');
  const THEME_GROUPS = [
    {
      key: 'identity-experience',
      label: 'Identity & Human Experience',
      categoryKeys: ['personal-transformation', 'human-bonds']
    },
    {
      key: 'power-society',
      label: 'Power & Society',
      categoryKeys: ['power-conflict', 'society-world']
    },
    {
      key: 'survival-meaning',
      label: 'Survival & Meaning',
      categoryKeys: ['survival-existence']
    }
  ];
  const toThemeCard = (theme) => ({
    kind: 'theme-preset',
    key: theme.key,
    type: '',
    id: '',
    title: theme.label,
    description: theme.detail,
    meta: theme.blocks.map(humanize),
    themeGuidance: {
      ideologicalConflict: theme.ideologicalConflict,
      moralQuestion: theme.moralQuestion,
      transformationAxis: theme.transformationAxis
    }
  });

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
    const themeCategoryMap = new Map(themeCategories.map(category => [category.key, category]));
    if (key.startsWith('cat_')) {
      const categoryKey = key.replace(/^cat_/, '');
      const category = themeCategories.find(item => item.key === categoryKey);
      if (category) {
        return {
          title: 'Themes',
          subtitle: category.label,
          cards: category.items.map(toThemeCard)
        };
      }
    }
    if (key.startsWith('grp_')) {
      const groupKey = key.replace(/^grp_/, '');
      const themeGroup = THEME_GROUPS.find(item => item.key === groupKey);
      if (themeGroup) {
        const items = themeGroup.categoryKeys.flatMap(categoryKey => themeCategoryMap.get(categoryKey)?.items || []);
        return {
          title: 'Themes',
          subtitle: themeGroup.label,
          cards: items.map(toThemeCard)
        };
      }
    }
    if (key === 'all') {
      return {
        title: 'Themes',
        subtitle: 'All Themes',
        cards: presets.map(toThemeCard)
      };
    }
    if (key && key !== 'saved') {
      const theme = presets.find(item => item.key === key);
      if (theme) {
        return {
          title: 'Themes',
          subtitle: theme.label,
          cards: [theme].map(toThemeCard)
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
          meta: [theme.id],
          themeGuidance: {
            ideologicalConflict: theme.ideologicalConflict || '',
            moralQuestion: theme.moralQuestion || '',
            transformationAxis: theme.transformationAxis || ''
          }
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

  if (group === 'characters' && key === 'templates') {
    return {
      title: 'Libraries',
      subtitle: 'Character Templates',
      cards: Object.entries(VOCAB.CHARACTER_ARCHETYPES || {}).map(([archetypeKey, archetype]) => ({
        kind: 'character-template',
        key: archetypeKey,
        type: '',
        id: '',
        title: archetype.label || humanize(archetypeKey),
        description: archetype.desc || 'Character archetype template',
        meta: (archetype.suggestedTraits || []).slice(0, 3),
        readOnly: true
      }))
    };
  }

  if (group === 'backdrop' && key === 'locations') {
    const projectLocations = state.project.libraries.locations || [];
    const cards = projectLocations.length
      ? projectLocations.map(location => ({
        kind: 'location-resource',
        key: location.id || '',
        type: '',
        id: location.id || '',
        title: location.name || 'Location',
        description: location.description || location.significance || 'Reusable location resource',
        meta: [location.time || '', location.geography || ''],
        readOnly: true
      }))
      : Object.entries(VOCAB.LOCATION_GEOGRAPHY || {}).slice(0, 24).map(([geoKey, geo]) => ({
        kind: 'location-resource',
        key: geoKey,
        type: '',
        id: '',
        title: geo.label || humanize(geoKey),
        description: geo.desc || 'Reusable location seed',
        meta: ['Template'],
        readOnly: true
      }));

    return {
      title: 'Libraries',
      subtitle: 'Locations',
      cards
    };
  }

  if (group === 'backdrop' && key === 'objects') {
    const projectObjects = state.project.libraries.objects || [];
    const cards = projectObjects.length
      ? projectObjects.map(objectItem => ({
        kind: 'object-resource',
        key: objectItem.id || '',
        type: '',
        id: objectItem.id || '',
        title: objectItem.name || 'Object',
        description: objectItem.description || objectItem.significance || 'Reusable object or artifact',
        meta: [objectItem.type || ''],
        readOnly: true
      }))
      : Object.entries(VOCAB.OBJECT_TYPES || {}).slice(0, 24).map(([objKey, objectType]) => ({
        kind: 'object-resource',
        key: objKey,
        type: '',
        id: '',
        title: objectType.label || humanize(objKey),
        description: objectType.desc || 'Reusable object seed',
        meta: ['Template'],
        readOnly: true
      }));

    return {
      title: 'Libraries',
      subtitle: 'Objects & Artifacts',
      cards
    };
  }

  return { title: 'Library', subtitle: 'No category selected', cards: [] };
}

function getSelectionParts(selection) {
  const [group = 'wisdom', key = 'tradition'] = String(selection || '').split(':');
  return { group, key };
}

function getLibraryChapterNodes() {
  const structureChapters = getOrderedChapters(state.project.structure);
  if (structureChapters.length) return structureChapters;
  return getChaptersForManuscript();
}

function normalizeChapterOptionTitle(value, index) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const genericChapter = new RegExp(`^chapter\\s+${index + 1}\\b[:\\-.\\s]*$`, 'i');
  return genericChapter.test(raw) ? '' : raw;
}

function normalizeSceneOptionTitle(value, index) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const genericScene = /^scene\s+\d+(?:\.\d+)?\b[:\-.\s]*$/i;
  return genericScene.test(raw) ? '' : raw;
}

function chapterOptions(chapters = getLibraryChapterNodes()) {
  return chapters.map((chapter, index) => {
    const title = normalizeChapterOptionTitle(chapter.title || chapter.name || '', index);
    return {
    id: chapter.id,
    label: title ? `Chapter ${index + 1} - ${title}` : `Chapter ${index + 1}`
    };
  });
}

function sceneOptions(chapters) {
  return chapters.flatMap((chapter, chapterIndex) =>
    (chapter?.source === 'generated-story' ? getScenesForManuscriptChapter(chapter) : getChapterScenes(chapter)).map((scene, sceneIndex) => {
      const title = normalizeSceneOptionTitle(scene.title || scene.name || '', sceneIndex);
      const chapterTitle = normalizeChapterOptionTitle(chapter.title || chapter.name || '', chapterIndex);
      return {
        id: scene.id,
        chapterId: chapter.id,
        label: title ? `Scene ${sceneIndex + 1} - ${title}` : `Scene ${sceneIndex + 1}`,
        chapterLabel: chapterTitle ? `Chapter ${chapterIndex + 1} - ${chapterTitle}` : `Chapter ${chapterIndex + 1}`
      };
    })
  );
}

function applyCard(card, targetType, targetId = '', targetLabel = '') {
  if (card.readOnly) {
    notify('Preview-only resource. Add it from the dedicated editor when needed.', 'info');
    return;
  }

  if ((targetType === 'chapter' || targetType === 'scene') && !targetId) {
    notify(`Select a ${targetType} before applying`, 'error');
    return;
  }

  const target = targetType === 'book'
    ? { targetType: 'book', targetId: '', targetLabel }
    : { targetType, targetId, targetLabel };

  if (card.kind === 'wisdom') applyWisdom(card.type, card.key, target);
  if (card.kind === 'theme-preset') applyThemePreset(card.key, target);
  if (card.kind === 'theme-saved') applySavedTheme(card.id, target);
  if (card.kind === 'pattern') applyPattern(card.key, target);
  if (card.kind === 'template-builtin') applyBuiltInTemplate(card.key, target);
  if (card.kind === 'template-custom') applyCustomTemplate(card.key, target);
  if (card.kind === 'block') applyBlock(card.key, target);
}

function applyWisdomToStoryFundamentals(card) {
  if (!card || card.kind !== 'wisdom') return false;
  applyCard(card, 'book', '', 'Book');
  const wisdomValue = String(card.description || card.title || '').trim();
  window.applyLibraryWisdomToStoryFundamentals?.(wisdomValue);
  return true;
}

function getAllowedTargets(card, chapters, scenes) {
  const chapterTargets = chapters.map(chapter => ({
    targetType: 'chapter',
    targetId: chapter.id,
    label: chapter.label
  }));
  const sceneTargets = scenes.map(scene => ({
    targetType: 'scene',
    targetId: scene.id,
    chapterId: scene.chapterId,
    label: scene.label,
    parentLabel: scene.chapterLabel
  }));

  if (card.kind === 'template-builtin' || card.kind === 'template-custom') {
    return [
      { targetType: 'book', targetId: '', label: 'Book' },
      ...chapterTargets,
      ...sceneTargets
    ];
  }

  if (card.kind === 'character-template') {
    return [
      { targetType: 'book', targetId: '', label: 'Book' },
      ...chapterTargets
    ];
  }

  if (card.kind === 'theme-preset' || card.kind === 'theme-saved') {
    return [
      { targetType: 'book', targetId: '', label: 'Book' },
      ...chapterTargets,
      ...sceneTargets
    ];
  }

  if (card.kind === 'wisdom') {
    return [
      { targetType: 'book', targetId: '', label: 'Book' },
    ];
  }

  if (card.kind === 'pattern') {
    return [
      { targetType: 'book', targetId: '', label: 'Book' },
      ...chapterTargets,
      ...sceneTargets
    ];
  }

  if (card.kind === 'block') {
    return [
      { targetType: 'book', targetId: '', label: 'Book' },
      ...chapterTargets,
      ...sceneTargets
    ];
  }

  return [
    { targetType: 'book', targetId: '', label: 'Book' },
    ...chapterTargets,
    ...sceneTargets
  ];
}

function renderApplyTargetOptions(targets = []) {
  const books = targets.filter(target => target.targetType === 'book');
  const chapters = targets.filter(target => target.targetType === 'chapter');
  const scenes = targets.filter(target => target.targetType === 'scene');
  const options = [];

  books.forEach((target) => {
    options.push(`
      <option
        value="${esc(`${target.targetType}::${target.targetId || ''}`)}"
        data-target-type="${esc(target.targetType)}"
        data-target-id="${esc(target.targetId || '')}">
        ${esc('Entire Book')}
      </option>
    `);
  });

  chapters.forEach((chapter) => {
    options.push(`
      <option
        value="${esc(`${chapter.targetType}::${chapter.targetId || ''}`)}"
        data-target-type="${esc(chapter.targetType)}"
        data-target-id="${esc(chapter.targetId || '')}">
        ${esc(`CHAPTER ${chapter.label.replace(/^Chapter\s+/i, '')}`)}
      </option>
    `);

    scenes
      .filter(scene => String(scene.chapterId || '') === String(chapter.targetId || ''))
      .forEach((scene) => {
        options.push(`
          <option
            value="${esc(`${scene.targetType}::${scene.targetId || ''}`)}"
            data-target-type="${esc(scene.targetType)}"
            data-target-id="${esc(scene.targetId || '')}">
            ${esc(`- ${scene.label}`)}
          </option>
        `);
      });
  });

  scenes
    .filter(scene => !chapters.some(chapter => String(chapter.targetId || '') === String(scene.chapterId || '')))
    .forEach((scene) => {
      options.push(`
        <option
          value="${esc(`${scene.targetType}::${scene.targetId || ''}`)}"
          data-target-type="${esc(scene.targetType)}"
          data-target-id="${esc(scene.targetId || '')}">
          ${esc(scene.label)}
        </option>
      `);
    });

  return options.join('');
}

function openApplyTargetPage(card, chapters, scenes) {
  const targets = getAllowedTargets(card, chapters, scenes);
  if (!targets.length) return;
  uiState.applyContext = {
    card,
    chapters,
    scenes,
    targets
  };
  renderLibraryView();
}

function clearApplyContext() {
  uiState.applyContext = null;
}

function applyCardToTargetFromPage(targetType, targetId = '', targetLabel = '') {
  const card = uiState.applyContext?.card;
  if (!card) return;

  if (targetType === 'chapter') uiState.chapterTargetId = targetId;
  applyCard(card, targetType, targetId, targetLabel);

  const returnContext = window.libraryReturnContext;
  if ((card.kind === 'theme-preset' || card.kind === 'theme-saved') && returnContext?.view === 'core-theme') {
    clearApplyContext();
    window.libraryReturnContext = null;
    window.switchToTab?.('core-theme');
    window.renderCoreThemeView?.();
    return;
  }

  clearApplyContext();
  renderLibraryView();
}

function renderApplyTargetPage(applyContext) {
  const { card, targets } = applyContext;
  const bookTargets = targets.filter(target => target.targetType === 'book');
  const chapterTargets = targets.filter(target => target.targetType === 'chapter');
  const sceneTargets = targets.filter(target => target.targetType === 'scene');
  const hasScopedTargets = chapterTargets.length > 0 || sceneTargets.length > 0;
  const allTargets = [...bookTargets, ...chapterTargets, ...sceneTargets];

  return `
    <div class="library-layout">
      <div class="library-column">
        <div class="library-page-header library-page-header-redesign library-apply-page-header">
          <div class="library-page-header-top library-apply-page-top">
            <div class="library-page-header-copy">
              <h2>Apply Template</h2>
            </div>
            <button class="btn" type="button" id="library-apply-back">Back to Library</button>
          </div>
          <div class="library-page-header-divider"></div>
          <div class="library-page-header-subtitle">
            <p>Choose where to apply this item in your project.</p>
            <div class="library-page-header-help">Selected item: ${esc(card.title)}</div>
          </div>
        </div>

        <section class="library-section library-apply-page-section">
          <div class="library-apply-modal library-apply-page">
            <div class="library-apply-modal-head">
              <div class="library-apply-modal-title">Where do you want to apply this item?</div>
              <div class="library-apply-modal-item">${esc(card.title)}</div>
            </div>
            ${hasScopedTargets ? '' : `
              <div class="library-apply-empty-note">
                This project does not have any chapters or scenes yet, so this item can only be applied to the whole book for now.
              </div>
            `}
            <div class="library-apply-form">
              <label class="library-apply-label" for="library-apply-select">Apply to</label>
              <div class="library-apply-select-wrap">
                <select class="library-apply-select" id="library-apply-select">
                  ${renderApplyTargetOptions(allTargets)}
                </select>
              </div>
              <div class="library-apply-actions">
                <button class="btn primary" type="button" id="library-apply-confirm">Apply</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderCard(card) {
  const templateAccentPalette = ['#f4c96a', '#7db5ff', '#62d89a', '#ff8f7a', '#b79bff', '#7fe2d4'];
  let accent = '';
  if (card.kind === 'template-builtin' || card.kind === 'template-custom') {
    const key = String(card.key || card.id || card.title || '');
    const hash = Array.from(key).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    accent = templateAccentPalette[hash % templateAccentPalette.length];
  }
  const accentStyle = accent ? ` style="--lib-accent:${esc(accent)}"` : '';

  const actions = card.readOnly
    ? '<span class="library-apply-note">Preview only</span>'
    : `
      <button class="btn small library-apply-btn" data-action="apply">Apply</button>
    `;

  const themeGuidance = card.themeGuidance
    ? `
      <div class="library-card-guidance">
        ${card.themeGuidance.ideologicalConflict ? `<div><span>Ideological Conflict</span><p>${esc(card.themeGuidance.ideologicalConflict)}</p></div>` : ''}
        ${card.themeGuidance.moralQuestion ? `<div><span>Moral Question</span><p>${esc(card.themeGuidance.moralQuestion)}</p></div>` : ''}
        ${card.themeGuidance.transformationAxis ? `<div><span>Transformation Axis</span><p>${esc(card.themeGuidance.transformationAxis)}</p></div>` : ''}
      </div>
    `
    : '';

  return `
    <div class="library-card" data-kind="${esc(card.kind)}" data-key="${esc(card.key)}" data-type="${esc(card.type)}" data-id="${esc(card.id)}"${accentStyle}>
      <div class="library-card-title">${esc(card.title)}</div>
      <div class="library-card-text">${esc(card.description || 'No description')}</div>
      <div class="library-card-meta">
        ${(card.meta || []).filter(Boolean).map(meta => `<span>${esc(humanize(meta))}</span>`).join('')}
      </div>
      ${themeGuidance}
      <div class="library-card-actions">
        ${actions}
      </div>
    </div>
  `;
}

function bindEvents(container, cards, chapters, scenes) {
  container.querySelectorAll('.library-card').forEach((cardEl, index) => {
    const card = cards[index];
    if (!card || card.readOnly) return;

    cardEl.querySelector('[data-action="apply"]')?.addEventListener('click', () => {
      const context = window.storyFundamentalsLibraryContext;
      if (context?.source === 'story-fundamentals' && context?.kind === 'wisdom' && card.kind === 'wisdom') {
        applyWisdomToStoryFundamentals(card);
        return;
      }
      openApplyTargetPage(card, chapters, scenes);
    });
  });
}

export function renderLibraryView() {
  const container = $('#library-view');
  if (!container) return;

  if (uiState.applyContext) {
    container.innerHTML = renderApplyTargetPage(uiState.applyContext);
    container.querySelector('#library-apply-back')?.addEventListener('click', () => {
      clearApplyContext();
      renderLibraryView();
    });
    container.querySelector('#library-apply-confirm')?.addEventListener('click', () => {
      const select = container.querySelector('#library-apply-select');
      const value = String(select?.value || 'book::');
      const [targetType = 'book', targetId = ''] = value.split('::');
      const label = select?.selectedOptions?.[0]?.textContent?.trim() || 'Entire Book';
      applyCardToTargetFromPage(targetType, targetId, label);
    });
    return;
  }

  const data = getCardsForSelection(uiState.selection);
  const selection = getSelectionParts(uiState.selection);
  const cards = data.cards || [];
  const chapterNodes = getLibraryChapterNodes();
  const chapters = chapterOptions(chapterNodes);
  const scenes = sceneOptions(chapterNodes);
  const isThemesView = selection.group === 'themes';
  const headerHelpText = isThemesView
    ? 'Choose a theme to inspect its ideological conflict, moral question, and transformation axis before applying it to the book, a chapter, or a scene.'
    : '';

  container.innerHTML = `
    <div class="library-layout ${isThemesView ? 'library-layout-themes framework-view' : ''}">
      <div class="library-column">
        <div class="library-page-header ${isThemesView ? 'library-page-header-redesign' : ''}">
          <div class="library-page-header-top">
            <div class="library-page-header-copy">
              <h2>${esc(data.title)}</h2>
            </div>
          </div>
          <div class="library-page-header-divider"></div>
          <div class="library-page-header-subtitle">
            <p>${esc(data.subtitle)}</p>
            ${headerHelpText ? `<div class="library-page-header-help">${esc(headerHelpText)}</div>` : ''}
          </div>
        </div>

        <section class="library-section ${isThemesView ? 'library-themes-grid-section' : ''}">
          ${isThemesView ? `
            <div class="library-section-header redesign">
              <h3>Theme Library</h3>
              <p>Choose a theme card to inspect its ideological conflict, moral question, and transformation axis before applying it.</p>
            </div>
          ` : ''}
          <div class="library-cards ${isThemesView ? 'library-cards-themes' : ''}">
            ${cards.length
              ? cards.map(card => renderCard(card)).join('')
              : '<div class="library-empty">No items in this category.</div>'}
          </div>
        </section>
      </div>
    </div>
  `;

  bindEvents(container, cards, chapters, scenes);
}

export default { renderLibraryView, setLibrarySelection, getLibrarySelection };
