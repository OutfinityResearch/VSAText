/**
 * SCRIPTA Demo - Library Data and Actions
 */

import { state } from './state.mjs';
import { genId } from './utils.mjs';
import { generateCNL } from './cnl.mjs';
import { renderEntityGrid } from './entities.mjs';
import { addChild, findNode, getUsedBlocks } from './tree.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';
import { getThemeGuidance } from './theme-guidance.mjs';
import {
  PHILOSOPHICAL_TRADITIONS,
  MORAL_INSIGHTS,
  PSYCHOLOGICAL_INSIGHTS,
  SCIENTIFIC_INSIGHTS,
  HUMANIST_PRINCIPLES,
  LIFE_LESSONS
} from '/src/vocabularies/vocab-wisdom.mjs';
import { MASTER_PLOTS } from '/src/vocabularies/vocab-patterns.mjs';
import { getTemplates, getTemplate, applyTemplate } from './blueprint/blueprint-state.mjs';

export const WISDOM_SECTIONS = [
  { key: 'tradition', label: 'Philosophical Traditions', items: PHILOSOPHICAL_TRADITIONS },
  { key: 'moral', label: 'Moral Insights', items: MORAL_INSIGHTS },
  { key: 'psychological', label: 'Psychological Insights', items: PSYCHOLOGICAL_INSIGHTS },
  { key: 'scientific', label: 'Scientific Insights', items: SCIENTIFIC_INSIGHTS },
  { key: 'humanist', label: 'Humanist Principles', items: HUMANIST_PRINCIPLES },
  { key: 'lesson', label: 'Life Lessons', items: LIFE_LESSONS }
];

export function humanize(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

function notify(message, level = 'info') {
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, level);
  }
}

function ensureFrameworkProfileState() {
  const libraries = state.project.libraries || (state.project.libraries = {});
  const existing = libraries.frameworkProfile || {};
  const coreTheme = existing.coreTheme || {};
  libraries.frameworkProfile = {
    ...existing,
    coreTheme: {
      ...coreTheme,
      selectedThemeId: coreTheme.selectedThemeId || ''
    }
  };
  return libraries.frameworkProfile;
}

function syncFrameworkThemeSelection(themeEntity) {
  if (!themeEntity) return;
  const profile = ensureFrameworkProfileState();
  const guidance = getThemeGuidance(themeEntity.themeKey || '', themeEntity.name || humanize(themeEntity.themeKey || 'theme'));
  profile.coreTheme.selectedThemeId = themeEntity.id || '';
  profile.coreTheme.selectedThemeKey = themeEntity.themeKey || '';
  profile.coreTheme.customThemeName = themeEntity.name || '';
  profile.storyCore.theme = themeEntity.name || humanize(themeEntity.themeKey || '');
  profile.storyCore.wisdom = themeEntity.wisdom || guidance.wisdom || '';
  profile.coreTheme.ideologicalConflict = themeEntity.ideologicalConflict || guidance.ideologicalConflict || '';
  profile.coreTheme.moralQuestion = themeEntity.moralQuestion || guidance.moralQuestion || '';
  profile.coreTheme.transformationAxis = themeEntity.transformationAxis || guidance.transformationAxis || '';
}

function ensureLibraryUXState() {
  const libraries = state.project.libraries || (state.project.libraries = {});
  const ux = libraries.libraryUx || {};
  libraries.libraryUx = {
    favorites: Array.isArray(ux.favorites) ? ux.favorites : [],
    customSaved: Array.isArray(ux.customSaved) ? ux.customSaved : [],
    applications: Array.isArray(ux.applications) ? ux.applications : []
  };
  return libraries.libraryUx;
}

function normalizeEntry(entry = {}) {
  return {
    kind: String(entry.kind || ''),
    key: String(entry.key || ''),
    type: String(entry.type || ''),
    id: String(entry.id || ''),
    title: String(entry.title || ''),
    description: String(entry.description || ''),
    structure: Array.isArray(entry.structure) ? entry.structure : [],
    meta: Array.isArray(entry.meta) ? entry.meta : []
  };
}

function entryRef(entry) {
  const n = normalizeEntry(entry);
  return [n.kind, n.key, n.type, n.id].join('::');
}

function targetLabel(target = {}) {
  if (target.targetLabel) return target.targetLabel;
  if (target.targetType === 'book') {
    return state.project.structure?.title || state.project.structure?.name || state.project.name || 'Book';
  }
  if (target.targetType === 'chapter' || target.targetType === 'scene') {
    const node = target.targetId ? findNode(target.targetId) : null;
    return node?.title || node?.name || humanize(target.targetType);
  }
  if (target.targetType === 'character') {
    const character = (state.project.libraries.characters || []).find(c => c.id === target.targetId);
    return character?.name || 'Character';
  }
  return 'Book';
}

function recordApplication(entry, target = {}) {
  const ux = ensureLibraryUXState();
  const n = normalizeEntry(entry);
  ux.applications.unshift({
    id: genId(),
    ref: entryRef(n),
    kind: n.kind,
    title: n.title || humanize(n.key || n.id || 'item'),
    targetType: target.targetType || 'book',
    targetId: target.targetId || '',
    targetLabel: targetLabel(target),
    appliedAt: new Date().toISOString()
  });
  ux.applications = ux.applications.slice(0, 80);
}

function resolveTargetNode(target = {}) {
  if (target.targetType === 'chapter' || target.targetType === 'scene') {
    return target.targetId ? findNode(target.targetId) : null;
  }
  if (target.targetType === 'book') {
    return state.project.structure;
  }
  return null;
}

function ensureNodeTemplateAssignments(node) {
  if (!node || typeof node !== 'object') return [];
  if (!Array.isArray(node.templateAssignments)) {
    node.templateAssignments = [];
  }
  return node.templateAssignments;
}

function assignTemplateToChapterNode(node, templateEntry) {
  if (!node || node.type !== 'chapter') return false;

  const assignments = ensureNodeTemplateAssignments(node);
  const existingIndex = assignments.findIndex(item =>
    item?.source === templateEntry.source &&
    String(item.key || '') === String(templateEntry.key || '')
  );

  const payload = {
    source: templateEntry.source || 'builtin',
    key: String(templateEntry.key || ''),
    label: String(templateEntry.label || templateEntry.title || 'Template'),
    description: String(templateEntry.description || ''),
    arc: String(templateEntry.arc || ''),
    chapters: Number(templateEntry.chapters || 0) || 0,
    appliedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    assignments[existingIndex] = payload;
  } else {
    assignments.unshift(payload);
  }

  node.selectedTemplate = payload.key;
  node.selectedTemplateLabel = payload.label;
  document.dispatchEvent(new CustomEvent('structure-changed'));
  return true;
}

export function getWisdomCatalog() {
  return WISDOM_SECTIONS.map(section => {
    const items = Object.entries(section.items).map(([itemKey, item]) => ({
      sectionKey: section.key,
      itemKey,
      label: item.label || item.lesson || humanize(itemKey),
      detail: item.corePrinciple || item.insight || item.principle || item.lesson || item.desc || '',
      origin: item.origin || item.source || ''
    }));
    return { ...section, items };
  });
}

export function getPatternCatalog() {
  return Object.entries(MASTER_PLOTS).map(([key, p]) => ({
    key,
    label: p.label,
    detail: p.desc,
    structure: p.structure || [],
    examples: p.examples || ''
  }));
}

export function getTemplateCatalog() {
  const builtin = Object.entries(getTemplates() || {}).map(([key, template]) => ({
    id: key,
    label: template.label,
    detail: template.description || '',
    chapters: template.chapters || 0,
    arc: template.arc || '',
    source: 'builtin'
  }));
  const custom = (state.project.libraries.customTemplates || []).map(template => ({
    id: template.id,
    label: template.label || 'Custom Template',
    detail: template.description || '',
    chapters: template.chapters || 0,
    arc: template.arc || '',
    source: 'custom'
  }));
  return { builtin, custom };
}

export function getThemePresetCatalog() {
  return Object.entries(VOCAB.THEMES || {}).map(([key, theme]) => ({
    key,
    label: theme.label,
    detail: theme.desc,
    blocks: (theme.suggestedBlocks || []).slice(0, 3),
    ...getThemeGuidance(key, theme.label)
  }));
}

const THEME_CATEGORY_DEFS = [
  {
    key: 'personal-transformation',
    label: 'Personal Transformation',
    themeKeys: [
      'redemption',
      'growth',
      'identity',
      'innocence_lost',
      'memory_and_past',
      'the_outsider',
      'appearance_vs_reality',
      'truth'
    ]
  },
  {
    key: 'power-conflict',
    label: 'Power and Conflict',
    themeKeys: [
      'power',
      'justice',
      'revenge',
      'corruption',
      'good_vs_evil',
      'war_and_peace',
      'ambition',
      'hubris'
    ]
  },
  {
    key: 'human-bonds',
    label: 'Human Bonds',
    themeKeys: [
      'love',
      'sacrifice',
      'betrayal',
      'family',
      'legacy',
      'isolation'
    ]
  },
  {
    key: 'survival-existence',
    label: 'Survival and Existence',
    themeKeys: [
      'survival',
      'mortality',
      'hope_vs_despair',
      'forbidden_knowledge',
      'fate_vs_free_will'
    ]
  },
  {
    key: 'society-world',
    label: 'Society and World',
    themeKeys: [
      'freedom',
      'class_society',
      'nature_vs_nurture',
      'nature_civilization'
    ]
  }
];

export function getThemeCatalogByCategory() {
  const themes = getThemePresetCatalog();
  const byKey = new Map(themes.map(theme => [theme.key, theme]));
  const used = new Set();

  const categories = THEME_CATEGORY_DEFS.map(category => {
    const items = category.themeKeys
      .map(themeKey => byKey.get(themeKey))
      .filter(Boolean);
    items.forEach(item => used.add(item.key));
    return {
      key: category.key,
      label: category.label,
      items
    };
  });

  // Keep all themes visible even if new keys appear in vocab.
  const remainder = themes.filter(theme => !used.has(theme.key));
  if (remainder.length > 0) {
    categories[categories.length - 1].items.push(...remainder);
  }

  return categories;
}

export function getSavedThemes() {
  return state.project.libraries.themes || [];
}

export function getBlockCatalog() {
  return Object.entries(VOCAB.NARRATIVE_BLOCKS || {}).map(([key, block]) => ({
    key,
    label: block.label,
    detail: block.desc,
    phase: block.phase,
    scope: block.scope
  }));
}

export function getUsedBlocksCatalog() {
  return getUsedBlocks();
}

export function getFavoriteLibraryItems() {
  const ux = ensureLibraryUXState();
  return ux.favorites;
}

export function getCustomSavedLibraryItems() {
  const ux = ensureLibraryUXState();
  return ux.customSaved;
}

export function getRecentLibraryApplications() {
  const ux = ensureLibraryUXState();
  return ux.applications;
}

export function isFavoriteLibraryItem(entry) {
  const ux = ensureLibraryUXState();
  const ref = entryRef(entry);
  return ux.favorites.some(item => item.ref === ref);
}

export function toggleFavoriteLibraryItem(entry) {
  const ux = ensureLibraryUXState();
  const normalized = normalizeEntry(entry);
  const ref = entryRef(normalized);
  const idx = ux.favorites.findIndex(item => item.ref === ref);

  if (idx >= 0) {
    ux.favorites.splice(idx, 1);
    notify('Removed from favorites', 'info');
    return false;
  }

  ux.favorites.unshift({
    id: genId(),
    ref,
    ...normalized,
    savedAt: new Date().toISOString()
  });
  ux.favorites = ux.favorites.slice(0, 120);
  notify('Added to favorites', 'success');
  return true;
}

export function saveCustomLibraryItem(entry) {
  const ux = ensureLibraryUXState();
  const normalized = normalizeEntry(entry);
  const duplicate = ux.customSaved.some(item => item.ref === entryRef(normalized));
  if (duplicate) {
    notify('Already saved in custom items', 'info');
    return false;
  }

  ux.customSaved.unshift({
    id: genId(),
    ref: entryRef(normalized),
    ...normalized,
    savedAt: new Date().toISOString()
  });
  ux.customSaved = ux.customSaved.slice(0, 120);
  notify('Saved to custom library', 'success');
  return true;
}

export function applyWisdom(type, key, target = { targetType: 'book', targetId: '' }) {
  const source = WISDOM_SECTIONS.find(section => section.key === type)?.items?.[key];
  if (!source) return;

  const existing = (state.project.libraries.wisdom || []).find(item => item.sourceType === type && item.sourceKey === key);
  if (!existing) {
    const wisdom = {
      id: genId(),
      category: type === 'tradition' ? 'philosophical' : (type === 'lesson' ? 'practical' : 'moral'),
      sourceType: type,
      sourceKey: key,
      label: source.label || source.lesson || humanize(key),
      insight: source.corePrinciple || source.insight || source.principle || source.lesson || '',
      application: Array.isArray(source.storyApplications) ? source.storyApplications.join('; ') : null,
      examples: source.examples || null
    };
    state.project.libraries.wisdom.push(wisdom);
    generateCNL();
  }

  recordApplication({
    kind: 'wisdom',
    key,
    type,
    title: source.label || source.lesson || humanize(key),
    description: source.corePrinciple || source.insight || source.principle || source.lesson || ''
  }, target);

  notify(`Applied wisdom to ${targetLabel(target)}`, 'success');
}

export function applyThemePreset(key, target = { targetType: 'book', targetId: '' }) {
  const theme = VOCAB.THEMES?.[key];
  if (!theme) return;
  const existing = (state.project.libraries.themes || []).find(item => item.themeKey === key);
  let themeId = '';

  if (existing) {
    if (!existing.ideologicalConflict || !existing.moralQuestion || !existing.transformationAxis || !existing.wisdom) {
      const guidance = getThemeGuidance(key, theme.label);
      existing.ideologicalConflict = existing.ideologicalConflict || guidance.ideologicalConflict;
      existing.moralQuestion = existing.moralQuestion || guidance.moralQuestion;
      existing.transformationAxis = existing.transformationAxis || guidance.transformationAxis;
      existing.wisdom = existing.wisdom || guidance.wisdom;
    }
    syncFrameworkThemeSelection(existing);
    themeId = existing.id;
  } else {
    const guidance = getThemeGuidance(key, theme.label);
    const created = {
      id: genId(),
      name: theme.label,
      themeKey: key,
      ideologicalConflict: guidance.ideologicalConflict,
      moralQuestion: guidance.moralQuestion,
      transformationAxis: guidance.transformationAxis,
      wisdom: guidance.wisdom,
      annotations: []
    };
    state.project.libraries.themes.push(created);
    syncFrameworkThemeSelection(created);
    themeId = created.id;
    renderEntityGrid('themes');
    generateCNL();
  }

  recordApplication({
    kind: 'theme-preset',
    key,
    id: themeId,
    title: theme.label,
    description: theme.desc,
    structure: theme.suggestedBlocks || []
  }, target);

  notify(`Applied theme to ${targetLabel(target)}`, 'success');
}

export function applySavedTheme(themeId, target = { targetType: 'book', targetId: '' }) {
  const theme = (state.project.libraries.themes || []).find(item => item.id === themeId);
  if (!theme) return;
  syncFrameworkThemeSelection(theme);

  recordApplication({
    kind: 'theme-saved',
    id: theme.id,
    title: theme.name || 'Theme',
    description: theme.themeKey ? humanize(theme.themeKey) : 'Custom theme'
  }, target);

  notify(`Using saved theme for ${targetLabel(target)}`, 'success');
}

export function applyPattern(key, target = { targetType: 'book', targetId: '' }) {
  const source = MASTER_PLOTS[key];
  if (!source) return;
  const existing = (state.project.libraries.patterns || []).find(item => item.patternType === 'plot' && item.sourceKey === key);

  if (!existing) {
    state.project.libraries.patterns.push({
      id: genId(),
      patternType: 'plot',
      sourceKey: key,
      label: source.label,
      description: source.desc,
      structure: source.structure,
      suggestedThemes: source.suggestedThemes,
      keyQuestion: source.keyQuestion,
      examples: source.examples
    });
    generateCNL();
  }

  recordApplication({
    kind: 'pattern',
    key,
    title: source.label,
    description: source.desc,
    structure: source.structure || []
  }, target);

  notify(`Applied pattern to ${targetLabel(target)}`, 'success');
}

export function applyBuiltInTemplate(key, target = { targetType: 'book', targetId: '' }) {
  const template = getTemplate(key);
  if (!template) return;

  if (target.targetType === 'chapter') {
    const chapterNode = resolveTargetNode(target);
    if (!chapterNode || chapterNode.type !== 'chapter') {
      notify('Select a valid chapter before applying this template', 'error');
      return;
    }

    const ok = assignTemplateToChapterNode(chapterNode, {
      source: 'builtin',
      key,
      label: template.label,
      description: template.description || '',
      arc: template.arc || '',
      chapters: template.chapters || 0
    });
    if (!ok) return;
  } else {
    const ok = applyTemplate(key);
    if (!ok) return;
    state.project.blueprint.selectedTemplate = key;
    document.dispatchEvent(new CustomEvent('blueprint-changed'));
  }

  recordApplication({
    kind: 'template-builtin',
    key,
    title: template.label,
    description: template.description || '',
    structure: template.structure || []
  }, target);

  notify(`Applied template to ${targetLabel(target)}`, 'success');
}

export function applyCustomTemplate(templateId, target = { targetType: 'book', targetId: '' }) {
  const template = (state.project.libraries.customTemplates || []).find(item => item.id === templateId);
  if (!template) return;

  if (target.targetType === 'chapter') {
    const chapterNode = resolveTargetNode(target);
    if (!chapterNode || chapterNode.type !== 'chapter') {
      notify('Select a valid chapter before applying this template', 'error');
      return;
    }

    const ok = assignTemplateToChapterNode(chapterNode, {
      source: 'custom',
      key: template.id,
      label: template.label || 'Custom Template',
      description: template.description || '',
      arc: template.arc || '',
      chapters: template.chapters || 0
    });
    if (!ok) return;
  } else {
    if (template.arc) {
      state.project.blueprint.arc = template.arc;
      state.project.selectedArc = template.arc;
    }
    if (Array.isArray(template.tensionPreset) && template.tensionPreset.length > 0) {
      state.project.blueprint.tensionCurve = template.tensionPreset;
    }
    state.project.blueprint.selectedTemplate = `custom_${template.id}`;
    document.dispatchEvent(new CustomEvent('blueprint-changed'));
  }

  recordApplication({
    kind: 'template-custom',
    key: template.id,
    id: template.id,
    title: template.label || 'Custom Template',
    description: template.description || '',
    structure: template.structure || []
  }, target);

  notify(`Applied template to ${targetLabel(target)}`, 'success');
}

export function applyBlock(key, target = { targetType: 'book', targetId: '' }) {
  const block = VOCAB.NARRATIVE_BLOCKS?.[key];
  if (!block) return;

  let resolvedTarget = resolveTargetNode(target);
  if (!resolvedTarget) {
    const selectedNode = state.selectedNode ? findNode(state.selectedNode) : null;
    resolvedTarget = (selectedNode && ['book', 'chapter', 'scene'].includes(selectedNode.type))
      ? selectedNode
      : state.project.structure;
  }

  if (!resolvedTarget || !['book', 'chapter', 'scene'].includes(resolvedTarget.type || 'book')) {
    notify('Create a book/chapter/scene before applying blocks', 'error');
    return;
  }

  const alreadyUsed = (resolvedTarget.children || []).some(child => child.type === 'block-ref' && child.blockKey === key);
  if (alreadyUsed) {
    notify(`Block already applied on "${resolvedTarget.title || resolvedTarget.name || resolvedTarget.type}"`, 'info');
    return;
  }

  addChild(resolvedTarget, { type: 'block-ref', name: block.label, blockKey: key });

  recordApplication({
    kind: 'block',
    key,
    title: block.label,
    description: block.desc,
    structure: [block.phase, block.scope]
  }, {
    targetType: resolvedTarget.type || 'book',
    targetId: resolvedTarget.id || '',
    targetLabel: resolvedTarget.title || resolvedTarget.name || resolvedTarget.type || 'Book'
  });

  notify(`Applied block to ${resolvedTarget.title || resolvedTarget.name || resolvedTarget.type}`, 'success');
}

export function buildPreview(kind, key, type, id) {
  if (kind === 'wisdom') {
    const source = WISDOM_SECTIONS.find(section => section.key === type)?.items?.[key];
    if (!source) return null;
    return {
      kind: 'Wisdom',
      title: source.label || source.lesson || humanize(key),
      description: source.corePrinciple || source.insight || source.principle || source.lesson || '',
      structure: Array.isArray(source.storyApplications) ? source.storyApplications.slice(0, 4) : [],
      meta: [type, source.origin || source.source || '']
    };
  }

  if (kind === 'theme-preset') {
    const source = VOCAB.THEMES?.[key];
    if (!source) return null;
    return {
      kind: 'Theme',
      title: source.label,
      description: source.desc,
      structure: source.suggestedBlocks || [],
      meta: (source.suggestedBlocks || []).slice(0, 3).map(humanize)
    };
  }

  if (kind === 'theme-saved') {
    const source = (state.project.libraries.themes || []).find(item => item.id === id);
    if (!source) return null;
    return {
      kind: 'Saved Theme',
      title: source.name || 'Theme',
      description: source.themeKey ? humanize(source.themeKey) : 'Custom',
      structure: source.annotations || [],
      meta: [source.id]
    };
  }

  if (kind === 'pattern') {
    const source = MASTER_PLOTS[key];
    if (!source) return null;
    return {
      kind: 'Pattern',
      title: source.label,
      description: source.desc,
      structure: source.structure || [],
      meta: (source.structure || []).slice(0, 4)
    };
  }

  if (kind === 'template-builtin') {
    const source = getTemplate(key);
    if (!source) return null;
    return {
      kind: 'Template',
      title: source.label,
      description: source.description || '',
      structure: source.structure || [],
      meta: [source.arc || '', `${source.chapters || 0} chapters`]
    };
  }

  if (kind === 'template-custom') {
    const source = (state.project.libraries.customTemplates || []).find(item => item.id === key);
    if (!source) return null;
    return {
      kind: 'Custom Template',
      title: source.label || 'Custom Template',
      description: source.description || '',
      structure: source.structure || [],
      meta: [source.arc || '', `${source.chapters || 0} chapters`]
    };
  }

  if (kind === 'block') {
    const source = VOCAB.NARRATIVE_BLOCKS?.[key];
    if (!source) return null;
    return {
      kind: 'Block',
      title: source.label,
      description: source.desc,
      structure: [humanize(source.phase), humanize(source.scope)],
      meta: [source.phase, source.scope]
    };
  }

  return null;
}
