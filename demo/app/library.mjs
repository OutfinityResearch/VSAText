/**
 * SCRIPTA Demo - Library View (Cards + Context Apply)
 */

import { $, openModal, closeModal } from './utils.mjs';
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
            meta: theme.blocks.map(humanize),
            themeGuidance: {
              ideologicalConflict: theme.ideologicalConflict,
              moralQuestion: theme.moralQuestion,
              transformationAxis: theme.transformationAxis
            }
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
          meta: theme.blocks.map(humanize),
          themeGuidance: {
            ideologicalConflict: theme.ideologicalConflict,
            moralQuestion: theme.moralQuestion,
            transformationAxis: theme.transformationAxis
          }
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
            meta: theme.blocks.map(humanize),
            themeGuidance: {
              ideologicalConflict: theme.ideologicalConflict,
              moralQuestion: theme.moralQuestion,
              transformationAxis: theme.transformationAxis
            }
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

function getLibraryChapterNodes() {
  const structureChapters = getOrderedChapters(state.project.structure);
  if (structureChapters.length) return structureChapters;
  return getChaptersForManuscript();
}

function chapterOptions(chapters = getLibraryChapterNodes()) {
  return chapters.map((chapter, index) => ({
    id: chapter.id,
    label: `Chapter ${index + 1}: ${chapter.title || chapter.name || 'Untitled'}`
  }));
}

function sceneOptions(chapters) {
  return chapters.flatMap((chapter, chapterIndex) =>
    (chapter?.source === 'generated-story' ? getScenesForManuscriptChapter(chapter) : getChapterScenes(chapter)).map((scene, sceneIndex) => ({
      id: scene.id,
      chapterId: chapter.id,
      label: `Scene ${sceneIndex + 1}: ${scene.title || scene.name || 'Untitled'}`,
      chapterLabel: `Chapter ${chapterIndex + 1}: ${chapter.title || chapter.name || 'Untitled'}`
    }))
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

function getAllowedTargets(card, chapters, scenes) {
  const chapterTargets = chapters.map(chapter => ({
    targetType: 'chapter',
    targetId: chapter.id,
    label: chapter.label
  }));
  const sceneTargets = scenes.map(scene => ({
    targetType: 'scene',
    targetId: scene.id,
    label: scene.label,
    parentLabel: scene.chapterLabel
  }));

  if (card.kind === 'template-builtin' || card.kind === 'template-custom') {
    return [
      { targetType: 'book', targetId: '', label: 'Book' },
      ...chapterTargets
    ];
  }

  if (card.kind === 'character-template') {
    return [
      { targetType: 'book', targetId: '', label: 'Book' },
      ...chapterTargets
    ];
  }

  if (card.kind === 'theme-preset' || card.kind === 'theme-saved' || card.kind === 'wisdom') {
    return [
      { targetType: 'book', targetId: '', label: 'Book' },
      ...chapterTargets,
      ...sceneTargets
    ];
  }

  if (card.kind === 'pattern') {
    return [
      { targetType: 'book', targetId: '', label: 'Book' },
      ...chapterTargets
    ];
  }

  if (card.kind === 'block') {
    return [
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

function renderApplyTargetGroup(title, targets = []) {
  if (!targets.length) return '';
  return `
    <div class="library-apply-group">
      <div class="library-apply-group-title">${esc(title)}</div>
      <div class="library-apply-targets">
        ${targets.map(target => `
          <button
            class="library-apply-target"
            type="button"
            data-target-type="${esc(target.targetType)}"
            data-target-id="${esc(target.targetId)}">
            <span>${esc(target.label)}</span>
            ${target.parentLabel ? `<small>${esc(target.parentLabel)}</small>` : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function openApplyTargetModal(card, chapters, scenes) {
  const targets = getAllowedTargets(card, chapters, scenes);
  if (!targets.length) return;
  const bookTargets = targets.filter(target => target.targetType === 'book');
  const chapterTargets = targets.filter(target => target.targetType === 'chapter');
  const sceneTargets = targets.filter(target => target.targetType === 'scene');

  $('#select-modal-title').textContent = 'Apply Template';
  $('#select-modal-body').innerHTML = `
    <div class="library-apply-modal">
      <div class="library-apply-modal-head">
        <div class="library-apply-modal-title">Where do you want to apply this item?</div>
        <div class="library-apply-modal-item">${esc(card.title)}</div>
      </div>
      ${renderApplyTargetGroup('Book', bookTargets)}
      ${renderApplyTargetGroup('Chapters', chapterTargets)}
      ${renderApplyTargetGroup('Scenes', sceneTargets)}
    </div>
  `;

  $('#select-modal-body').querySelectorAll('.library-apply-target').forEach(button => {
    button.addEventListener('click', () => {
      const targetType = button.getAttribute('data-target-type') || 'book';
      const targetId = button.getAttribute('data-target-id') || '';
      if (targetType === 'chapter') uiState.chapterTargetId = targetId;
      applyCard(card, targetType, targetId, button.querySelector('span')?.textContent || '');
      closeModal('select-modal');
      renderLibraryView();
    });
  });

  openModal('select-modal');
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
      openApplyTargetModal(card, chapters, scenes);
    });
  });
}

export function renderLibraryView() {
  const container = $('#library-view');
  if (!container) return;

  const data = getCardsForSelection(uiState.selection);
  const cards = data.cards || [];
  const chapterNodes = getLibraryChapterNodes();
  const chapters = chapterOptions(chapterNodes);
  const scenes = sceneOptions(chapterNodes);

  container.innerHTML = `
    <div class="library-layout">
      <div class="library-column">
        <div class="library-page-header">
          <h2>${esc(data.title)}</h2>
          <p>${esc(data.subtitle)}</p>
        </div>

        <div class="library-cards">
          ${cards.length
            ? cards.map(card => renderCard(card)).join('')
            : '<div class="library-empty">No items in this category.</div>'}
        </div>
      </div>
    </div>
  `;

  bindEvents(container, cards, chapters, scenes);
}

export default { renderLibraryView, setLibrarySelection, getLibrarySelection };
