/**
 * SCRIPTA Demo - Main Entry Point
 * 
 * Initializes the application and sets up event handlers.
 */

import { state } from './state.mjs';
import { $, $$, genId, openModal } from './utils.mjs';
import { renderTree, findNode, addChild, selectNode } from './tree.mjs';
import { renderEntityGrid, renderBackdropView, renderCharactersCastView, renderToneStyleView, renderThemeEditorPage, renderLocationEditorPage, renderMoodEditorPage, showSelectModal, showBlockModal, showActionModal } from './entities.mjs';
import { renderRelationshipsView, renderBlocksView, renderWorldRulesView, renderWorldRuleEditorPage } from './views.mjs';
import { evaluateMetrics, renderEmptyMetrics, initMetrics, renderFullEvaluationReport } from './metrics.mjs';
import { exportCNL, importCNL, toggleEditMode, setCNLViewMode, generateCNL } from './cnl.mjs';
import { loadProjectsList, initPersistence } from './persistence.mjs';
import { setupContextMenu } from './context-menu.mjs';
import { getThemeCatalogByCategory } from './library-data.mjs';

// Blueprint imports
import { loadBlueprintData } from './blueprint/blueprint-state.mjs';
import { initTimeline, render as renderTimeline } from './blueprint/timeline.mjs';
import { initTemplates } from './blueprint/templates.mjs';
import { renderSubplotEditorView } from './blueprint/subplots.mjs';

// Dialogue imports
import { initDialogueEditor } from './dialogue/dialogue-editor.mjs';

// Wisdom and Patterns imports
import { renderWisdomView } from './entities-wisdom.mjs';
import { renderPatternsView } from './entities-patterns.mjs';
import {
  renderFrameworkView,
  renderStoryFundamentalsView,
  renderCoreThemeView,
  renderDramaticModelView,
  renderCharacterTransformationView
} from './framework.mjs';
import { renderWorldLayersView } from './world-layers.mjs';
import { renderHooksView } from './hooks.mjs';
import { renderLibraryView, setLibrarySelection, getLibrarySelection } from './library.mjs';
import { renderNarrativeDesignMacroView } from './narrative-design.mjs';
import { renderManuscriptStudioView, renderStoryMapView } from './writing-studio.mjs';
import {
  getChaptersForManuscript,
  getScenesForManuscriptChapter,
  getManuscriptSelection,
  manuscriptUsesGeneratedStory,
  addGeneratedManuscriptChapter,
  addGeneratedManuscriptScene,
  deleteGeneratedManuscriptChapter,
  deleteGeneratedManuscriptScene,
  setManuscriptSelection
} from './writing-studio-manuscript.mjs';
import { getChapterScenes } from './structure-navigation.mjs';

// Import to register generation functions
import './generation.mjs';
import { updateGenerateButton } from './generation.mjs';

// NL generation
import { generateNLStory, resetNLState, initNLGeneration, updateNLGenerateButton } from './nl-generation.mjs';

// Wizard
import { openWizard } from './wizard.mjs';
import { openNewProjectWizard } from './new-project-wizard.mjs';

// Eval runner
import { initEvalRunner } from './eval-runner.mjs';

let currentBlueprintView = 'timeline';
let manuscriptNavigatorOpenChapterId = null;

const TAB_GROUPS = [
  {
    key: 'storycore',
    views: [
      { key: 'story-fundamentals', label: 'Story Fundamentals' },
      { key: 'core-theme', label: 'Theme' },
      { key: 'dramatic-model', label: 'Dramatic Model' },
      { key: 'character-transformation', label: 'Transformation' },
      { key: 'blueprint', label: 'Blueprint' },
      { key: 'wisdom', label: 'Wisdom' }
    ]
  },
  {
    key: 'narrativedesign',
    views: [
      { key: 'patterns', label: 'Patterns' },
      { key: 'templates', label: 'Templates' },
      { key: 'blocks', label: 'Blocks' }
    ]
  },
  {
    key: 'cast',
    views: [
      { key: 'characters', label: 'Characters' },
      { key: 'relationships', label: 'Relations' }
    ]
  },
  {
    key: 'world',
    views: [
      { key: 'backdrop', label: 'Backdrop' },
      { key: 'worldlayers', label: 'World Layers' }
    ]
  },
  {
    key: 'hooks',
    views: [
      { key: 'openinghook', label: 'Opening Hook' },
      { key: 'midhooks', label: 'Mid-Story Hooks' }
    ]
  },
  {
    key: 'scenecraft',
    views: [
      { key: 'dialogues', label: 'Dialogues' },
      { key: 'moods', label: 'Moods' }
    ]
  },
  {
    key: 'results',
    views: [
      { key: 'cnl', label: 'CNL' },
      { key: 'nl', label: 'NL' }
    ]
  }
];

const VIEW_TO_GROUP = new Map(
  TAB_GROUPS.flatMap(group => group.views.map(view => [view.key, group.key]))
);

let activeGroupKey = 'results';
let activeViewKey = 'cnl';
let navigatorMode = 'project';
let projectNavigatorMarkup = '';

function getGroup(groupKey) {
  return TAB_GROUPS.find(g => g.key === groupKey) || null;
}

function activateTopTab(groupKey) {
  $$('.tab').forEach(t => t.classList.remove('active'));
  const activeTab = $(`.tab[data-view="${groupKey}"]`);
  if (activeTab) activeTab.classList.add('active');
}

function setActiveSubtab(viewKey) {
  const subtabs = $('#subtabs');
  if (!subtabs) return;
  subtabs.querySelectorAll('.subtab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewKey);
  });
}

function renderViewSpecificContent(viewName) {
  if (viewName === 'relationships') renderRelationshipsView();
  if (viewName === 'blocks') renderBlocksView();
  if (viewName === 'worldrules') renderWorldRulesView();
  if (viewName === 'world-rule-editor') renderWorldRuleEditorPage();
  if (viewName === 'blueprint') initBlueprintView();
  if (viewName === 'subplot-editor') renderSubplotEditorView();
  if (viewName === 'templates') initTemplatesView();
  if (viewName === 'dialogues') initDialogueEditor($('#dialogues-container'));
  if (viewName === 'wisdom') renderWisdomView();
  if (viewName === 'patterns') renderPatternsView();
  if (viewName === 'framework') renderFrameworkView();
  if (viewName === 'story-fundamentals') renderStoryFundamentalsView();
  if (viewName === 'core-theme') renderCoreThemeView();
  if (viewName === 'dramatic-model') renderDramaticModelView();
  if (viewName === 'character-transformation') renderCharacterTransformationView();
  if (viewName === 'backdrop') renderBackdropView();
  if (viewName === 'worldlayers') renderWorldLayersView();
  if (viewName === 'openinghook') renderHooksView('opening');
  if (viewName === 'midhooks') renderHooksView('mid');
  if (viewName === 'moods') renderToneStyleView();
  if (viewName === 'themes') renderEntityGrid('themes');
  if (viewName === 'theme-editor') renderThemeEditorPage();
  if (viewName === 'location-editor') renderLocationEditorPage();
  if (viewName === 'mood-editor') renderMoodEditorPage();
  if (viewName === 'characters') renderCharactersCastView();
  if (viewName === 'library') renderLibraryView();
  if (viewName === 'narrative-design') renderNarrativeDesignMacroView();
  if (viewName === 'manuscript') renderManuscriptStudioView();
  if (viewName === 'storymap') renderStoryMapView();
  if (viewName === 'nl') updateNLGenerateButton();
  if (viewName === 'evaluation-report') renderFullEvaluationReport();
}

function setActiveNavigatorItem(viewName, action = '', librarySelect = '') {
  const items = $$('.navigator-item');
  if (!items.length) return;
  items.forEach(item => item.classList.remove('active'));

  let activeItem = null;
  if (action) {
    activeItem = document.querySelector(`.navigator-item[data-action="${action}"]`);
  }
  if (!activeItem) {
    activeItem = document.querySelector(`.navigator-item[data-target-view="${viewName}"]`);
  }
  if (librarySelect) {
    activeItem = document.querySelector(`.navigator-item[data-library-select="${librarySelect}"]`);
  }
  if (activeItem) activeItem.classList.add('active');
}

function setActiveHeaderAction(viewName) {
  const libraryBtn = $('#btn-library');
  const projectBtn = $('#btn-project');
  if (libraryBtn) libraryBtn.classList.toggle('active', navigatorMode === 'library' || viewName === 'library');
  if (projectBtn) projectBtn.classList.toggle('active', navigatorMode === 'project' && viewName !== 'library');
}

function setNavigatorTitle(title) {
  const titleEl = document.querySelector('.navigator-header .panel-title');
  if (titleEl) titleEl.textContent = title;
}

function renderProjectNavigatorPanel() {
  const navigatorContent = $('#navigator-content');
  if (!navigatorContent || !projectNavigatorMarkup) return;
  navigatorContent.innerHTML = projectNavigatorMarkup;
  navigatorMode = 'project';
  setNavigatorTitle('Book Navigator');
  setActiveHeaderAction(activeViewKey);
  setActiveNavigatorItem(activeViewKey);
  renderTree();
  renderManuscriptNavigatorDetails();
}

function buildStructureFromGeneratedStory() {
  const story = String(state.generation?.generatedStory || '').trim();
  if (!story) return false;

  const chapterRegex = /^\s{0,3}(?:#{1,6}\s*)?(chapter|capitol(?:ul)?)\s+(\d+)\b[:\-. ]*(.*)$/gim;
  const sceneRegex = /^\s{0,3}(?:#{1,6}\s*)?(scene|scena)\s+(\d+)\b[:\-. ]*(.*)$/gim;
  const chapterMatches = Array.from(story.matchAll(chapterRegex));

  const book = {
    id: genId('book'),
    type: 'book',
    name: state.project.name || 'Untitled Story',
    title: state.project.name || 'Untitled Story',
    children: []
  };

  if (!chapterMatches.length) {
    book.children.push({
      id: genId('ch'),
      type: 'chapter',
      name: 'Chapter 1',
      title: 'Chapter 1',
      children: [
        {
          id: genId('sc'),
          type: 'scene',
          name: 'Scene 1',
          title: 'Scene 1',
          children: []
        }
      ]
    });
    state.project.structure = book;
    return true;
  }

  chapterMatches.forEach((match, index) => {
    const start = match.index ?? 0;
    const end = index + 1 < chapterMatches.length ? (chapterMatches[index + 1].index ?? story.length) : story.length;
    const body = story.slice(start, end);
    const chapterNumber = match[2];
    const chapterTail = String(match[3] || '').trim();
    const chapterTitle = chapterTail ? `Chapter ${chapterNumber}: ${chapterTail}` : `Chapter ${chapterNumber}`;
    const sceneMatches = Array.from(body.matchAll(sceneRegex));
    const chapterNode = {
      id: genId('ch'),
      type: 'chapter',
      name: chapterTitle,
      title: chapterTitle,
      children: []
    };

    if (!sceneMatches.length) {
      chapterNode.children.push({
        id: genId('sc'),
        type: 'scene',
        name: 'Scene 1',
        title: 'Scene 1',
        children: []
      });
    } else {
      sceneMatches.forEach((sceneMatch) => {
        const sceneNumber = sceneMatch[2];
        const sceneTail = String(sceneMatch[3] || '').trim();
        const sceneTitle = sceneTail ? `Scene ${sceneNumber}: ${sceneTail}` : `Scene ${sceneNumber}`;
        chapterNode.children.push({
          id: genId('sc'),
          type: 'scene',
          name: sceneTitle,
          title: sceneTitle,
          children: []
        });
      });
    }

    book.children.push(chapterNode);
  });

  state.project.structure = book;
  return true;
}

function focusGeneratedProjectStructure() {
  const structureGroup = document.querySelector('.project-structure-group');
  if (structureGroup) structureGroup.open = true;
  if (!state.project.structure?.id) return;
  selectNode(state.project.structure.id, false);
  requestAnimationFrame(() => {
    document.querySelector(`#tree-container [data-id="${state.project.structure.id}"] .tree-node-content`)?.scrollIntoView({
      block: 'nearest'
    });
  });
}

function renderLibraryNavigatorPanel() {
  const navigatorContent = $('#navigator-content');
  if (!navigatorContent) return;
  const themeCategories = getThemeCatalogByCategory();
  const themeSections = themeCategories.map((category, index) => {
    if (category.key === 'personal-transformation') {
      return `
        <button class="navigator-item" data-target-view="library" data-library-select="themes:cat_${category.key}">
          ${esc(category.label)}
        </button>
      `;
    }

    return `
      <details class="navigator-subgroup" ${index === 0 ? 'open' : ''}>
        <summary data-target-view="library" data-library-select="themes:cat_${category.key}">${esc(category.label)}</summary>
        <div class="navigator-items">
          <button class="navigator-item" data-target-view="library" data-library-select="themes:cat_${category.key}">
            All ${esc(category.label)}
          </button>
          ${category.items.map(theme => `
            <button class="navigator-item" data-target-view="library" data-library-select="themes:${theme.key}">
              ${esc(theme.label)}
            </button>
          `).join('')}
        </div>
      </details>
    `;
  }).join('');

  navigatorContent.innerHTML = `
    <details class="navigator-group" open>
      <summary>Wisdom</summary>
      <div class="navigator-items">
        <button class="navigator-item" data-target-view="library" data-library-select="wisdom:tradition">Philosophical Traditions</button>
        <button class="navigator-item" data-target-view="library" data-library-select="wisdom:moral">Moral Insights</button>
        <button class="navigator-item" data-target-view="library" data-library-select="wisdom:psychological">Psychological Insights</button>
        <button class="navigator-item" data-target-view="library" data-library-select="wisdom:scientific">Scientific Insights</button>
        <button class="navigator-item" data-target-view="library" data-library-select="wisdom:humanist">Humanist Principles</button>
        <button class="navigator-item" data-target-view="library" data-library-select="wisdom:lesson">Life Lessons</button>
      </div>
    </details>
    <details class="navigator-group" open>
      <summary>Themes</summary>
      <div class="navigator-items" style="padding:0;">
        ${themeSections}
        <button class="navigator-item" data-target-view="library" data-library-select="themes:saved">Saved Themes</button>
      </div>
    </details>
    <details class="navigator-group" open>
      <summary>Narrative Design</summary>
      <div class="navigator-items">
        <button class="navigator-item" data-target-view="library" data-library-select="narrative:patterns">Patterns</button>
        <button class="navigator-item" data-target-view="library" data-library-select="narrative:templates">Templates</button>
        <button class="navigator-item" data-target-view="library" data-library-select="narrative:blocks">Blocks</button>
      </div>
    </details>
  `;
  navigatorMode = 'library';
  setNavigatorTitle('Library');
}

function showStandaloneView(viewName) {
  if (viewName === 'library') {
    renderLibraryNavigatorPanel();
  } else if (navigatorMode !== 'project') {
    renderProjectNavigatorPanel();
  }

  $$('.view').forEach(v => v.classList.remove('active'));
  const viewEl = $(`#view-${viewName}`);
  if (!viewEl) return;
  activeViewKey = viewName;
  viewEl.classList.add('active');
  renderViewSpecificContent(viewName);
  setActiveNavigatorItem(viewName, '', viewName === 'library' ? getLibrarySelection() : '');
  setActiveHeaderAction(viewName);
  if (navigatorMode === 'project') renderManuscriptNavigatorDetails();
}

function showLeafView(viewName, groupKey = activeGroupKey) {
  if (navigatorMode !== 'project') {
    renderProjectNavigatorPanel();
  }

  activeGroupKey = groupKey;
  activeViewKey = viewName;
  activateTopTab(groupKey);
  setActiveSubtab(viewName);

  $$('.view').forEach(v => v.classList.remove('active'));
  const viewEl = $(`#view-${viewName}`);
  if (!viewEl) return;
  viewEl.classList.add('active');
  renderViewSpecificContent(viewName);
  setActiveNavigatorItem(viewName);
  setActiveHeaderAction(viewName);
}

function renderSubtabs(groupKey, preferredView = null) {
  const subtabs = $('#subtabs');
  if (!subtabs) return;

  const group = getGroup(groupKey);
  if (!group) {
    subtabs.innerHTML = '';
    return;
  }

  const availableViewKeys = group.views.map(v => v.key);
  const selectedView = availableViewKeys.includes(preferredView)
    ? preferredView
    : (availableViewKeys.includes(activeViewKey) ? activeViewKey : availableViewKeys[0]);

  subtabs.innerHTML = group.views.map(v => `
    <button class="subtab ${v.key === selectedView ? 'active' : ''}" data-view="${v.key}">
      ${v.label}
    </button>
  `).join('');

  subtabs.querySelectorAll('.subtab').forEach(tab => {
    tab.onclick = () => showLeafView(tab.dataset.view, groupKey);
  });
}

function switchToGroup(groupKey, preferredView = null) {
  if (navigatorMode !== 'project') {
    renderProjectNavigatorPanel();
  }

  const group = getGroup(groupKey);
  if (!group) return;

  activeGroupKey = groupKey;
  activateTopTab(groupKey);
  renderSubtabs(groupKey, preferredView);

  const availableViewKeys = group.views.map(v => v.key);
  const targetView = availableViewKeys.includes(preferredView)
    ? preferredView
    : (availableViewKeys.includes(activeViewKey) ? activeViewKey : availableViewKeys[0]);

  showLeafView(targetView, groupKey);
}

function bindCoreButtons() {
  // Header buttons
  $('#btn-load').onclick = loadProjectsList;
  const generateBtn = $('#btn-generate');
  if (generateBtn) {
    generateBtn.onclick = () => {
      if (state.generation.hasGenerated) {
        window.showImproveModal();
      } else {
        openModal('generate-modal');
      }
    };
  }
  $('#btn-new').onclick = openNewProjectWizard;
  $('#btn-project')?.addEventListener('click', () => {
    renderProjectNavigatorPanel();
    if (activeViewKey === 'library') {
      switchToGroup('results', 'cnl');
    } else {
      setActiveHeaderAction(activeViewKey);
    }
  });
  $('#btn-library').onclick = () => {
    renderLibraryNavigatorPanel();
    showStandaloneView('library');
  };
  $('#btn-evaluate').onclick = evaluateMetrics;
  document.addEventListener('open-evaluation-report', () => showStandaloneView('evaluation-report'));
  document.addEventListener('close-evaluation-report', () => showStandaloneView('nl'));
  $('#btn-docs')?.addEventListener('click', () => window.open('/docs/theory/index.html', '_blank'));
}

function getChapterNodes() {
  return getChaptersForManuscript();
}

function getSceneNodes(chapter) {
  if (chapter?.source === 'generated-story') {
    return getScenesForManuscriptChapter(chapter).map(scene => ({
      id: scene.id,
      title: scene.title,
      name: scene.title,
      type: 'scene'
    }));
  }
  return getChapterScenes(chapter);
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function chapterLabelText(chapter, index) {
  const raw = String(chapter?.title || chapter?.name || '').trim();
  const normalized = raw
    .replace(/^\s*(chapter|capitol(?:ul)?)\s+\d+\s*[:\-.]?\s*/i, '')
    .replace(/^\s*(chapter|capitol(?:ul)?)\s*[:\-.]?\s*/i, '')
    .trim();
  return normalized ? `Chapter ${index + 1}: ${normalized}` : `Chapter ${index + 1}`;
}

function sceneLabelText(scene, index) {
  const raw = String(scene?.title || scene?.name || '').trim();
  const scenePrefix = new RegExp(`^scene\\s+${index + 1}\\b\\s*[:\\-.]?\\s*`, 'i');
  const cleaned = raw.replace(scenePrefix, '').trim();
  if (!cleaned && raw) return `Scene ${index + 1}`;
  if (cleaned) return `Scene ${index + 1}: ${cleaned}`;
  return `Scene ${index + 1}`;
}

function ensureBookStructureForManuscript() {
  if (state.project.structure) return state.project.structure;
  state.project.structure = {
    id: genId('book'),
    type: 'book',
    name: 'Book',
    title: state.project.name || 'Untitled Story',
    children: []
  };
  return state.project.structure;
}

function getRealStructureChapters() {
  const book = ensureBookStructureForManuscript();
  const chapters = (book.children || []).filter((child) => child?.type === 'chapter');
  if (!chapters.length) {
    const chapter = {
      id: genId('ch'),
      type: 'chapter',
      name: 'Chapter 1',
      title: 'Chapter 1',
      children: []
    };
    book.children.push(chapter);
    return [chapter];
  }
  return chapters;
}

function addManuscriptChapter() {
  if (manuscriptUsesGeneratedStory()) {
    addGeneratedManuscriptChapter();
    generateCNL();
    renderManuscriptNavigatorDetails();
    if (activeViewKey === 'manuscript') renderManuscriptStudioView();
    return;
  }

  const book = ensureBookStructureForManuscript();
  const chapters = (book.children || []).filter((child) => child?.type === 'chapter');
  const nextIndex = chapters.length + 1;
  const chapter = {
    id: genId('ch'),
    type: 'chapter',
    name: `Chapter ${nextIndex}`,
    title: `Chapter ${nextIndex}`,
    children: []
  };
  book.children = [...(book.children || []), chapter];
  generateCNL();
  renderTree();
  renderManuscriptNavigatorDetails();
  if (activeViewKey === 'manuscript') renderManuscriptStudioView();
}

function addManuscriptScene() {
  const { chapterId: selectedChapterId } = getManuscriptSelection();

  if (manuscriptUsesGeneratedStory()) {
    const chapters = getChapterNodes();
    const targetChapter = chapters.find(ch => ch.id === selectedChapterId)
      || chapters.find(ch => ch.id === manuscriptNavigatorOpenChapterId)
      || chapters[chapters.length - 1];
    if (!targetChapter) return;
    const sceneId = addGeneratedManuscriptScene(targetChapter.id);
    manuscriptNavigatorOpenChapterId = targetChapter.id;
    setManuscriptSelection(targetChapter.id, sceneId);
    refreshManuscriptUi();
    return;
  }

  const chapters = getRealStructureChapters();
  const targetChapter = chapters.find(ch => ch.id === selectedChapterId)
    || chapters.find(ch => ch.id === manuscriptNavigatorOpenChapterId)
    || chapters[chapters.length - 1];
  if (!targetChapter.children) targetChapter.children = [];
  const existingScenes = targetChapter.children.filter((child) => child?.type === 'scene');
  const nextIndex = existingScenes.length + 1;
  const scene = {
    id: genId('sc'),
    type: 'scene',
    name: `Scene ${nextIndex}`,
    title: `Scene ${nextIndex}`,
    children: []
  };
  targetChapter.children.push(scene);
  manuscriptNavigatorOpenChapterId = targetChapter.id;
  setManuscriptSelection(targetChapter.id, scene.id);
  refreshManuscriptUi();
}

function refreshManuscriptUi() {
  generateCNL();
  renderTree();
  renderManuscriptNavigatorDetails();
  if (activeViewKey === 'manuscript') renderManuscriptStudioView();
}

function deleteManuscriptChapter(chapterId) {
  if (!chapterId) return;

  if (manuscriptUsesGeneratedStory()) {
    deleteGeneratedManuscriptChapter(chapterId);
    const chapters = getChapterNodes();
    const nextChapter = chapters.find(ch => ch.id !== chapterId) || null;
    manuscriptNavigatorOpenChapterId = nextChapter?.id || null;
    setManuscriptSelection(nextChapter?.id || null, null);
    refreshManuscriptUi();
    return;
  }

  const book = ensureBookStructureForManuscript();
  const chapters = (book.children || []).filter(child => child?.type === 'chapter');
  const nextChapter = chapters.find(ch => ch.id !== chapterId) || null;
  book.children = (book.children || []).filter(child => child?.id !== chapterId);
  manuscriptNavigatorOpenChapterId = nextChapter?.id || null;
  setManuscriptSelection(nextChapter?.id || null, null);
  refreshManuscriptUi();
}

function deleteManuscriptScene(chapterId, sceneId) {
  if (!chapterId || !sceneId) return;

  if (manuscriptUsesGeneratedStory()) {
    deleteGeneratedManuscriptScene(chapterId, sceneId);
    const chapters = getChapterNodes();
    const chapter = chapters.find(item => item.id === chapterId) || null;
    const scenes = chapter ? getSceneNodes(chapter) : [];
    const nextScene = scenes.find(scene => scene.id !== sceneId) || null;
    manuscriptNavigatorOpenChapterId = chapterId;
    setManuscriptSelection(chapterId, nextScene?.id || null);
    refreshManuscriptUi();
    return;
  }

  const chapters = getRealStructureChapters();
  const targetChapter = chapters.find(ch => ch.id === chapterId);
  if (!targetChapter) return;
  targetChapter.children = (targetChapter.children || []).filter(child => child?.id !== sceneId);
  const nextScene = (targetChapter.children || []).find(child => child?.type === 'scene') || null;
  manuscriptNavigatorOpenChapterId = chapterId;
  setManuscriptSelection(chapterId, nextScene?.id || null);
  refreshManuscriptUi();
}

function renderManuscriptNavigatorDetails() {
  const container = $('#nav-manuscript-items');
  if (!container) return;

  const book = state.project.structure;
  const chapters = getChapterNodes();
  const { chapterId: selectedChapterId, sceneId: selectedSceneId } = getManuscriptSelection();

  const chapterRows = !chapters.length
    ? ''
    : `
      <div class="navigator-subtree">
        ${chapters.map((chapter, index) => {
          const scenes = getSceneNodes(chapter);
          const isOpen = chapter.id === manuscriptNavigatorOpenChapterId;
          const isChapterSelected = selectedChapterId === chapter.id && !selectedSceneId;
          return `
            <details class="navigator-subgroup navigator-chapter-group" ${isOpen ? 'open' : ''}>
              <summary
                class="navigator-chapter-summary ${isChapterSelected ? 'is-selected' : ''}"
                data-target-view="manuscript"
                data-manuscript-chapter-id="${chapter.id}">
                <span class="navigator-chapter-summary-label">${esc(chapterLabelText(chapter, index))}</span>
                <button
                  class="navigator-inline-action navigator-inline-delete"
                  type="button"
                  data-delete-chapter-id="${chapter.id}"
                  aria-label="Delete chapter"
                  title="Delete chapter">×</button>
              </summary>
              <div class="navigator-items">
                ${scenes.map((scene, sceneIndex) => `
                  <div class="navigator-item-row">
                    <button class="navigator-item navigator-item-scene ${selectedSceneId === scene.id ? 'active is-selected' : ''}" data-target-view="manuscript" data-chapter-id="${chapter.id}" data-scene-id="${scene.id}">
                      ${esc(sceneLabelText(scene, sceneIndex))}
                    </button>
                    <button
                      class="navigator-inline-action navigator-inline-delete navigator-scene-delete"
                      type="button"
                      data-delete-scene-id="${scene.id}"
                      data-delete-scene-chapter-id="${chapter.id}"
                      aria-label="Delete scene"
                      title="Delete scene">×</button>
                  </div>
                `).join('')}
              </div>
            </details>
          `;
        }).join('')}
      </div>
    `;

  container.innerHTML = `
    <div class="navigator-subgroup">
      <div class="navigator-manuscript-header">
        <button type="button" data-target-view="manuscript" class="navigator-manuscript-summary ${activeViewKey === 'manuscript' ? 'navigator-manuscript-summary-active' : ''}">
          <span>Manuscript</span>
        </button>
        <div class="navigator-manuscript-summary-actions">
          <button class="navigator-add-btn" type="button" aria-label="Add Manuscript Item" title="Add">+</button>
          <div class="navigator-add-hover-menu">
            <button class="navigator-add-option" type="button" data-manuscript-add="chapter">+ Add Chapter</button>
            <button class="navigator-add-option" type="button" data-manuscript-add="scene">+ Add Scene</button>
          </div>
        </div>
      </div>
      <div class="navigator-items">
        ${chapterRows}
      </div>
    </div>
  `;
}

async function handleNavigatorItemClick(item) {
  const targetView = item.dataset.targetView;
  const action = item.dataset.action || '';
  const librarySelect = item.dataset.librarySelect || '';
  if (!targetView) return;

  if (action === 'generate-story') {
    switchToGroup('results', 'nl');
    setActiveNavigatorItem('nl', action);
    await generateNLStory();
    return;
  }

  const mappedGroup = VIEW_TO_GROUP.get(targetView);
  if (mappedGroup) {
    switchToGroup(mappedGroup, targetView);
  } else {
    if (targetView === 'library' && librarySelect) {
      setLibrarySelection(librarySelect);
    }
    showStandaloneView(targetView);
    if (targetView === 'library') {
      setActiveNavigatorItem('library', '', librarySelect || getLibrarySelection());
    }
  }
}

function bindNavigatorPanel() {
  const groups = $$('.navigator-group');
  groups.forEach(group => {
    group.addEventListener('toggle', () => {
      if (!group.open) return;
      groups.forEach(other => {
        if (other !== group) other.open = false;
      });
    });
  });

  const navigatorContent = $('#navigator-content');
  if (!navigatorContent || navigatorContent.dataset.boundClick === '1') return;

  navigatorContent.addEventListener('click', (event) => {
    const manuscriptActions = event.target.closest('.navigator-manuscript-summary-actions');
    const addButton = event.target.closest('.navigator-add-btn');
    const addOption = event.target.closest('.navigator-add-option');
    const deleteChapterButton = event.target.closest('[data-delete-chapter-id]');
    const deleteSceneButton = event.target.closest('[data-delete-scene-id]');

    navigatorContent.querySelectorAll('.navigator-manuscript-summary-actions.open').forEach(el => {
      if (el !== manuscriptActions) el.classList.remove('open');
    });

    if (addButton) {
      event.preventDefault();
      event.stopPropagation();
      manuscriptActions?.classList.toggle('open');
      return;
    }

    if (addOption) {
      event.preventDefault();
      event.stopPropagation();
      manuscriptActions?.classList.remove('open');
    }

    if (deleteChapterButton) {
      event.preventDefault();
      event.stopPropagation();
      const chapterId = deleteChapterButton.getAttribute('data-delete-chapter-id');
      if (!chapterId) return;
      if (!window.confirm('Delete this chapter?')) return;
      deleteManuscriptChapter(chapterId);
      return;
    }

    if (deleteSceneButton) {
      event.preventDefault();
      event.stopPropagation();
      const chapterId = deleteSceneButton.getAttribute('data-delete-scene-chapter-id');
      const sceneId = deleteSceneButton.getAttribute('data-delete-scene-id');
      if (!chapterId || !sceneId) return;
      if (!window.confirm('Delete this scene?')) return;
      deleteManuscriptScene(chapterId, sceneId);
      return;
    }

    const manuscriptHeaderButton = event.target.closest('button[data-target-view="manuscript"].navigator-manuscript-summary');
    if (manuscriptHeaderButton) {
      event.preventDefault();
      showStandaloneView('manuscript');
      return;
    }

    const manuscriptChapterSummary = event.target.closest('summary[data-manuscript-chapter-id]');
    if (manuscriptChapterSummary) {
      const chapterId = manuscriptChapterSummary.dataset.manuscriptChapterId || '';
      manuscriptNavigatorOpenChapterId = chapterId || null;
      setManuscriptSelection(chapterId, null);
      showStandaloneView('manuscript');
      return;
    }

    const librarySummary = event.target.closest('summary[data-library-select]');
    if (librarySummary) {
      const targetView = librarySummary.dataset.targetView || 'library';
      const librarySelect = librarySummary.dataset.librarySelect || '';
      if (targetView === 'library' && librarySelect) {
        setLibrarySelection(librarySelect);
        showStandaloneView('library');
        setActiveNavigatorItem('library', '', librarySelect);
      }
      return;
    }

    const summary = event.target.closest('summary[data-open-view]');
    if (!summary) return;
    const targetView = summary.dataset.openView;
    if (!targetView) return;
    showStandaloneView(targetView);
  });

  navigatorContent.addEventListener('click', async (event) => {
    const manuscriptAddAction = event.target.closest('[data-manuscript-add]');
    if (manuscriptAddAction) {
      const addType = manuscriptAddAction.getAttribute('data-manuscript-add');
      if (addType === 'chapter') addManuscriptChapter();
      if (addType === 'scene') addManuscriptScene();
      return;
    }

    const item = event.target.closest('.navigator-item');
    if (!item) return;
    const chapterId = item.dataset.chapterId || '';
    const sceneId = item.dataset.sceneId || '';
    if (chapterId) {
      manuscriptNavigatorOpenChapterId = chapterId;
      setManuscriptSelection(chapterId, sceneId || null);
    }
    await handleNavigatorItemClick(item);
  });
  navigatorContent.dataset.boundClick = '1';
}

// ==================== INITIALIZATION ====================
async function init() {
  // Bind critical actions first so UI remains responsive even if async bootstrapping is slow/fails.
  bindCoreButtons();

  // Load blueprint data
  try {
    await loadBlueprintData();
  } catch (err) {
    console.error('Blueprint data bootstrap failed:', err);
  }
  
  // Initialize persistence (autosave, beforeunload)
  initPersistence();
  
  // Setup context menu
  setupContextMenu();
  
  // Zoom controls
  setupZoomControls();
  
  // CNL tab buttons
  $('#btn-edit-cnl').onclick = toggleEditMode;
  $('#btn-export-cnl').onclick = exportCNL;
  $('#btn-import-cnl').onclick = importCNL;
  $('#btn-cnl-view-formatted').onclick = () => setCNLViewMode('formatted');
  
  // NL tab buttons
  $('#btn-nl-generate').onclick = generateNLStory;
  $('#btn-nl-copy').onclick = copyNLContent;
  $('#btn-nl-export').onclick = exportNLContent;
  initNLGeneration(); // Initialize preview button and modal handlers
  
  // Add button with contextual menu
  const addRootBtn = $('#btn-add-root');
  if (addRootBtn) {
    addRootBtn.onclick = (e) => {
      e.stopPropagation();
      showAddMenu(e);
    };
  }
  
  // Close add menu on click outside
  document.addEventListener('click', () => {
    $('#add-menu')?.classList.remove('open');
  });
  
  // Group-level tab switching
  $$('.tab').forEach(tab => {
    tab.onclick = () => switchToGroup(tab.dataset.view);
  });

  // Left navigator panel
  projectNavigatorMarkup = $('#navigator-content')?.innerHTML || '';
  bindNavigatorPanel();
  renderManuscriptNavigatorDetails();

  // Listen for blueprint changes
  document.addEventListener('blueprint-changed', () => {
    renderTimeline();
    renderManuscriptNavigatorDetails();
  });

  document.addEventListener('structure-changed', () => {
    renderManuscriptNavigatorDetails();
  });

  document.addEventListener('generated-story-updated', () => {
    let structureWasBootstrapped = false;
    if (!state.project.structure?.children?.length) {
      structureWasBootstrapped = buildStructureFromGeneratedStory();
    }
    if (structureWasBootstrapped) generateCNL();
    renderProjectNavigatorPanel();
    focusGeneratedProjectStructure();
    renderManuscriptNavigatorDetails();
    if (activeViewKey === 'manuscript') renderManuscriptStudioView();
  });

  document.addEventListener('project-loaded', () => {
    renderProjectNavigatorPanel();
    renderViewSpecificContent(activeViewKey);
    setActiveNavigatorItem(activeViewKey);
    setActiveHeaderAction(activeViewKey);
  });

  document.addEventListener('metrics-evaluated', () => {
    if (activeViewKey === 'evaluation-report') {
      renderFullEvaluationReport();
    }
  });
  
  // Initial render
  ['locations', 'objects', 'moods', 'themes'].forEach(renderEntityGrid);
  renderCharactersCastView();
  renderTree();
  renderFrameworkView();
  renderRelationshipsView();
  renderBlocksView();
  renderWorldRulesView();
  renderEmptyMetrics();
  generateCNL();

  // Initialize grouped tabs (Results -> CNL)
  switchToGroup('results', 'cnl');
  
  // Initialize eval runner
  initEvalRunner();
}

/**
 * Initialize Blueprint view (Timeline only now)
 */
function initBlueprintView() {
  const content = $('#blueprint-content');
  if (!content) return;
  initTimeline(content);
}

/**
 * Initialize Templates view (now a main tab)
 */
function initTemplatesView() {
  const container = $('#templates-container');
  if (!container) return;
  initTemplates(container);
}

// ==================== TAB SWITCHING UTILITY ====================
/**
 * Switch to a specific tab programmatically
 * @param {string} viewName - The data-view value of the tab to switch to
 */
export function switchToTab(viewName) {
  const groupKey = VIEW_TO_GROUP.get(viewName);
  if (!groupKey) return;
  switchToGroup(groupKey, viewName);
}

// Make switchToTab available globally for tree navigation
window.switchToTab = switchToTab;
window.showStandaloneView = showStandaloneView;
window.openManuscriptNode = (chapterId = null, sceneId = null) => {
  manuscriptNavigatorOpenChapterId = chapterId || null;
  setManuscriptSelection(chapterId || null, sceneId || null);
  showStandaloneView('manuscript');
};
window.renderBackdropView = renderBackdropView;
window.openLibraryWisdom = () => {
  window.storyFundamentalsLibraryContext = { source: 'story-fundamentals', kind: 'wisdom' };
  const firstSelection = 'wisdom:tradition';
  renderLibraryNavigatorPanel();
  setLibrarySelection(firstSelection);
  showStandaloneView('library');

  const groups = Array.from(document.querySelectorAll('#navigator-content .navigator-group'));
  groups.forEach((group) => {
    const summaryText = (group.querySelector(':scope > summary')?.textContent || '').trim().toLowerCase();
    group.open = summaryText === 'wisdom';
  });

  setActiveNavigatorItem('library', '', firstSelection);
};
window.openThemeEditorPage = () => {
  showStandaloneView('theme-editor');
};
window.applyLibraryWisdomToStoryFundamentals = (value) => {
  const wisdomValue = String(value || '').trim();
  if (!wisdomValue) return;
  window.frameworkUpdateProfile?.('storyCore', 'wisdom', wisdomValue);
  window.storyFundamentalsLibraryContext = null;
  switchToTab('story-fundamentals');
  window.renderStoryFundamentalsView?.();
};
window.openLibraryThemes = () => {
  window.libraryReturnContext = { view: 'core-theme' };
  const firstThemeCategory = getThemeCatalogByCategory()[0]?.key || 'personal-transformation';
  const firstSelection = `themes:cat_${firstThemeCategory}`;
  renderLibraryNavigatorPanel();
  setLibrarySelection(firstSelection);
  showStandaloneView('library');

  const groups = Array.from(document.querySelectorAll('#navigator-content .navigator-group'));
  groups.forEach((group) => {
    const summaryText = (group.querySelector(':scope > summary')?.textContent || '').trim().toLowerCase();
    group.open = summaryText === 'themes';
  });

  const subgroups = Array.from(document.querySelectorAll('#navigator-content .navigator-subgroup'));
  subgroups.forEach((subgroup, idx) => {
    subgroup.open = idx === 0;
  });

  setActiveNavigatorItem('library', '', firstSelection);
};

// ==================== ADD MENU (Plus Button) ====================

/**
 * Show contextual add menu based on selected node
 */
function showAddMenu(e) {
  const menu = $('#add-menu');
  if (!menu) return;
  
  const selectedNode = state.selectedNode ? findNode(state.selectedNode) : null;
  const hasStructure = !!state.project.structure;
  
  let items = [];
  
  if (!hasStructure) {
    // No structure - only option is to create a book
    items.push({ a: 'add-book', l: '📖 Add Book', desc: 'Create story structure' });
  } else if (!selectedNode) {
    // Has structure but nothing selected - show message
    items.push({ a: 'hint', l: 'Select a node first', disabled: true });
    items.push({ a: 'div' });
    items.push({ a: 'add-chapter-root', l: '📑 Add Chapter to Book' });
  } else {
    // Show options based on selected node type
    const type = selectedNode.type;
    
    if (type === 'book') {
      items.push({ a: 'add-chapter', l: '📑 Add Chapter' });
    }

    if (type === 'book' || type === 'chapter') {
      items.push({ a: 'add-scene', l: '🎬 Add Scene' });
    }
    
    if (type === 'scene') {
      items.push({ a: 'add-char', l: '👤 Add Character' });
      items.push({ a: 'add-loc', l: '📍 Add Location' });
      items.push({ a: 'add-obj', l: '🗝️ Add Object' });
      items.push({ a: 'add-mood', l: '🎭 Add Mood' });
      items.push({ a: 'div' });
      items.push({ a: 'add-block', l: '✨ Add Narrative Block' });
      items.push({ a: 'add-action', l: '⚡ Add Action' });
      items.push({ a: 'add-dialogue', l: '💬 Add Dialogue' });
    }
    
    // For leaf nodes, show parent's options
    if (['character-ref', 'location-ref', 'object-ref', 'mood-ref', 'block-ref', 'action', 'dialogue', 'dialogue-ref'].includes(type)) {
      items.push({ a: 'hint', l: `Selected: ${selectedNode.name || type}`, disabled: true });
      items.push({ a: 'div' });
      items.push({ a: 'add-sibling-hint', l: 'Select a scene to add elements', disabled: true });
    }
  }
  
  if (items.length === 0) {
    items.push({ a: 'hint', l: 'No actions available', disabled: true });
  }
  
  menu.innerHTML = items.map(i => {
    if (i.a === 'div') return '<div class="add-menu-divider"></div>';
    if (i.disabled) return `<div class="add-menu-item disabled">${i.l}</div>`;
    return `<div class="add-menu-item" data-action="${i.a}">${i.l}${i.desc ? `<span class="add-menu-desc">${i.desc}</span>` : ''}</div>`;
  }).join('');
  
  // Position menu below the button
  const btn = $('#btn-add-root');
  const rect = btn.getBoundingClientRect();
  menu.style.left = rect.left + 'px';
  menu.style.top = (rect.bottom + 4) + 'px';
  menu.classList.add('open');
}

// Handle add menu item clicks
document.addEventListener('click', e => {
  const item = e.target.closest('.add-menu-item');
  if (!item || item.classList.contains('disabled')) return;
  
  const action = item.dataset.action;
  handleAddMenuAction(action);
  $('#add-menu')?.classList.remove('open');
});

function handleAddMenuAction(action) {
  const selectedNode = state.selectedNode ? findNode(state.selectedNode) : null;
  
  if (action === 'add-book') {
    state.project.structure = {
      id: genId(),
      type: 'book',
      name: 'Book',
      title: state.project.name,
      children: []
    };
    renderTree();
    return;
  }
  
  if (action === 'add-chapter-root') {
    const book = state.project.structure;
    if (book) {
      addChild(book, { type: 'chapter', name: `Ch${(book.children?.length || 0) + 1}`, title: '', children: [] });
    }
    return;
  }
  
  if (!selectedNode) return;
  
  if (action === 'add-chapter') {
    if (selectedNode.type === 'book') {
      addChild(selectedNode, { type: 'chapter', name: `Ch${(selectedNode.children?.length || 0) + 1}`, title: '', children: [] });
    }
  }
  if (action === 'add-scene') {
    addChild(selectedNode, { type: 'scene', name: `Sc${(selectedNode.children?.length || 0) + 1}`, title: '', children: [] });
  }
  if (action === 'add-char') showSelectModal('characters', selectedNode);
  if (action === 'add-loc') showSelectModal('locations', selectedNode);
  if (action === 'add-obj') showSelectModal('objects', selectedNode);
  if (action === 'add-mood') showSelectModal('moods', selectedNode);
  if (action === 'add-block') showBlockModal(selectedNode);
  if (action === 'add-action') showActionModal(selectedNode);
  if (action === 'add-dialogue') {
    // Switch to dialogues tab to create a dialogue
    switchToTab('dialogues');
    window.showNotification?.('Create a dialogue, then add it to the scene', 'info');
  }
}

// Run initialization
init();

// ==================== NL HELPERS ====================
function copyNLContent() {
  const content = $('#nl-content');
  if (!content) return;
  
  const text = content.innerText || content.textContent;
  if (!text || text.includes('No story generated yet')) {
    window.showNotification?.('No story to copy', 'info');
    return;
  }
  
  navigator.clipboard.writeText(text).then(() => {
    window.showNotification?.('Story copied to clipboard', 'success');
  }).catch(() => {
    window.showNotification?.('Failed to copy', 'error');
  });
}

function exportNLContent() {
  const content = $('#nl-content');
  if (!content) return;
  
  const text = content.innerText || content.textContent;
  if (!text || text.includes('No story generated yet')) {
    window.showNotification?.('No story to export', 'info');
    return;
  }
  
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (state.project.name || 'story').replace(/[^a-z0-9]/gi, '_') + '.txt';
  a.click();
}

// ==================== ZOOM CONTROLS ====================
// Reasonable steps: 80%, 90%, 100% (default), 110%, 120%, 130%, 140%
const ZOOM_LEVELS = [0.80, 0.90, 1.0, 1.10, 1.20, 1.30, 1.40];
const ZOOM_DEFAULT = 1.0;
const ZOOM_STORAGE_KEY = 'scripta-zoom-level';

function setupZoomControls() {
  const btnZoomIn = $('#btn-zoom-in');
  const btnZoomOut = $('#btn-zoom-out');
  const btnZoomReset = $('#btn-zoom-reset');
  const zoomLevel = $('#zoom-level');
  
  if (!btnZoomIn || !btnZoomOut || !zoomLevel) return;
  
  // Load saved zoom level or use default
  const savedZoom = localStorage.getItem(ZOOM_STORAGE_KEY);
  if (savedZoom) {
    applyZoom(parseFloat(savedZoom));
  } else {
    applyZoom(ZOOM_DEFAULT);
  }
  
  btnZoomIn.onclick = () => changeZoom(1);
  btnZoomOut.onclick = () => changeZoom(-1);
  btnZoomReset.onclick = () => applyZoom(ZOOM_DEFAULT);
}

function changeZoom(direction) {
  const root = document.documentElement;
  const currentScale = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale')) || 1.0;
  
  // Find current index
  let currentIndex = ZOOM_LEVELS.findIndex(z => Math.abs(z - currentScale) < 0.01);
  if (currentIndex === -1) currentIndex = ZOOM_LEVELS.indexOf(1.0);
  
  const newIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, currentIndex + direction));
  applyZoom(ZOOM_LEVELS[newIndex]);
}

function applyZoom(scale) {
  const root = document.documentElement;
  root.style.setProperty('--font-scale', scale);
  
  const zoomLevel = $('#zoom-level');
  if (zoomLevel) {
    zoomLevel.textContent = Math.round(scale * 100) + '%';
  }
  
  // Save to localStorage
  localStorage.setItem(ZOOM_STORAGE_KEY, scale.toString());
}
