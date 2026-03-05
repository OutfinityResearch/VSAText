/**
 * SCRIPTA Demo - Library Data and Actions
 */

import { state } from './state.mjs';
import { genId } from './utils.mjs';
import { generateCNL } from './cnl.mjs';
import { renderEntityGrid } from './entities.mjs';
import { addChild, findNode, getUsedBlocks } from './tree.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';
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
    blocks: (theme.suggestedBlocks || []).slice(0, 3)
  }));
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

export function applyWisdom(type, key) {
  const source = WISDOM_SECTIONS.find(section => section.key === type)?.items?.[key];
  if (!source) return;

  const existing = (state.project.libraries.wisdom || []).find(item => item.sourceType === type && item.sourceKey === key);
  if (existing) {
    notify('Wisdom already added', 'info');
    return;
  }

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
  notify(`Applied wisdom: ${wisdom.label}`, 'success');
}

export function applyThemePreset(key) {
  const theme = VOCAB.THEMES?.[key];
  if (!theme) return;
  const existing = (state.project.libraries.themes || []).find(item => item.themeKey === key);
  const profile = ensureFrameworkProfileState();
  if (existing) {
    profile.coreTheme.selectedThemeId = existing.id;
    notify(`Using saved theme: ${existing.name}`, 'success');
    return;
  }

  const created = {
    id: genId(),
    name: theme.label,
    themeKey: key,
    annotations: []
  };
  state.project.libraries.themes.push(created);
  profile.coreTheme.selectedThemeId = created.id;
  renderEntityGrid('themes');
  generateCNL();
  notify(`Applied theme: ${created.name}`, 'success');
}

export function applySavedTheme(themeId) {
  const theme = (state.project.libraries.themes || []).find(item => item.id === themeId);
  if (!theme) return;
  const profile = ensureFrameworkProfileState();
  profile.coreTheme.selectedThemeId = theme.id;
  notify(`Using saved theme: ${theme.name || 'Theme'}`, 'success');
}

export function applyPattern(key) {
  const source = MASTER_PLOTS[key];
  if (!source) return;
  const existing = (state.project.libraries.patterns || []).find(item => item.patternType === 'plot' && item.sourceKey === key);
  if (existing) {
    notify('Pattern already added', 'info');
    return;
  }

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
  notify(`Applied pattern: ${source.label}`, 'success');
}

export function applyBuiltInTemplate(key) {
  const template = getTemplate(key);
  if (!template) return;
  const ok = applyTemplate(key);
  if (!ok) return;
  state.project.blueprint.selectedTemplate = key;
  document.dispatchEvent(new CustomEvent('blueprint-changed'));
  notify(`Applied template: ${template.label}`, 'success');
}

export function applyCustomTemplate(templateId) {
  const template = (state.project.libraries.customTemplates || []).find(item => item.id === templateId);
  if (!template) return;

  if (template.arc) {
    state.project.blueprint.arc = template.arc;
    state.project.selectedArc = template.arc;
  }
  if (Array.isArray(template.tensionPreset) && template.tensionPreset.length > 0) {
    state.project.blueprint.tensionCurve = template.tensionPreset;
  }
  state.project.blueprint.selectedTemplate = `custom_${template.id}`;
  document.dispatchEvent(new CustomEvent('blueprint-changed'));
  notify(`Applied template: ${template.label}`, 'success');
}

export function applyBlock(key) {
  const block = VOCAB.NARRATIVE_BLOCKS?.[key];
  if (!block) return;

  const selectedNode = state.selectedNode ? findNode(state.selectedNode) : null;
  const target = (selectedNode && ['book', 'chapter', 'scene'].includes(selectedNode.type))
    ? selectedNode
    : state.project.structure;
  if (!target) return;

  const alreadyUsed = (target.children || []).some(child => child.type === 'block-ref' && child.blockKey === key);
  if (alreadyUsed) {
    notify(`Block already applied on "${target.title || target.name || target.type}"`, 'info');
    return;
  }

  addChild(target, { type: 'block-ref', name: block.label, blockKey: key });
  notify(`Applied block: ${block.label}`, 'success');
}

export function buildPreview(kind, key, type, id) {
  if (kind === 'wisdom') {
    const source = WISDOM_SECTIONS.find(section => section.key === type)?.items?.[key];
    if (!source) return null;
    return {
      kind: 'Wisdom',
      title: source.label || source.lesson || humanize(key),
      description: source.corePrinciple || source.insight || source.principle || source.lesson || '',
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
      meta: [source.phase, source.scope]
    };
  }

  return null;
}
