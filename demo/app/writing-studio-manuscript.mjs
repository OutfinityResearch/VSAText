/**
 * SCRIPTA Demo - Manuscript workspace logic
 */

import { state } from './state.mjs';
import { generateCNL } from './cnl.mjs';
import { getOrderedChapters, getChapterScenes } from './structure-navigation.mjs';

const manuscriptUiState = {
  selectedChapterId: null,
  selectedSceneId: null
};

export function setManuscriptSelection(chapterId, sceneId = null) {
  manuscriptUiState.selectedChapterId = chapterId || null;
  manuscriptUiState.selectedSceneId = sceneId || null;
}

export function getManuscriptSelection() {
  return {
    chapterId: manuscriptUiState.selectedChapterId || null,
    sceneId: manuscriptUiState.selectedSceneId || null
  };
}

function esc(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function normalizeListValue(value) {
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean).join(', ');
}
function parseListValue(value) {
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}
function getBookNode() {
  return state.project.structure || null;
}
function getChapters() {
  const book = getBookNode();
  return getOrderedChapters(book);
}
function getScenes(chapter) {
  return getChapterScenes(chapter);
}
function ensureManuscriptDraft() {
  if (!state.project.blueprint) state.project.blueprint = {};
  const existing = state.project.blueprint.manuscriptDraft || {};
  state.project.blueprint.manuscriptDraft = {
    generatedChapters: existing.generatedChapters && typeof existing.generatedChapters === 'object'
      ? existing.generatedChapters
      : {},
    generatedScenes: existing.generatedScenes && typeof existing.generatedScenes === 'object'
      ? existing.generatedScenes
      : {},
    deletedChapterIds: Array.isArray(existing.deletedChapterIds)
      ? existing.deletedChapterIds
      : []
  };
  return state.project.blueprint.manuscriptDraft;
}

function splitGeneratedTextToScenes(text) {
  const blocks = String(text || '').split(/\n\s*\n/).map(item => item.trim()).filter(Boolean);
  if (!blocks.length) return [''];
  return blocks.slice(0, 6);
}

function sanitizeChapterHeadingTail(tail) {
  const rawTail = String(tail || '').trim();
  return rawTail
    .replace(/^\s*(chapter|capitol(?:ul)?)\s+\d+\b\s*[:\-.]?\s*/i, '')
    .replace(/^\s*(chapter|capitol(?:ul)?)\b\s*[:\-.]?\s*/i, '')
    .replace(/^#{1,6}\s*/g, '')
    .replace(/^\s*(scene|scena)\s+\d+(?:\.\d+)?\b\s*[:\-.]?\s*/i, '')
    .trim();
}

function looksLikeChapterProse(text) {
  const value = String(text || '').trim();
  if (!value) return false;
  if (value.length > 110) return true;
  if (/[.!?]\s+[A-ZĂÂÎȘȚ]/.test(value)) return true;
  if (/[,;:]\s+[a-zăâîșț]/.test(value)) return true;
  return false;
}

function splitChapterTail(tail) {
  const cleaned = sanitizeChapterHeadingTail(tail);
  if (!cleaned) return { title: '', remainder: '' };
  if (!looksLikeChapterProse(cleaned)) return { title: cleaned, remainder: '' };

  const separatorMatch = cleaned.match(/^(.{1,90}?)(?:\s+[—-]\s+|\s*:\s+)(.+)$/);
  if (separatorMatch) {
    const candidateTitle = sanitizeChapterHeadingTail(separatorMatch[1]);
    const candidateRemainder = String(separatorMatch[2] || '').trim();
    if (candidateTitle && !looksLikeChapterProse(candidateTitle) && candidateRemainder) {
      return { title: candidateTitle, remainder: candidateRemainder };
    }
  }

  return { title: '', remainder: cleaned };
}

function normalizeChapterHeadingText(text) {
  return String(text || '').replace(
    /^(\s{0,3}(?:#{1,6}\s*)?)(chapter|capitol(?:ul)?)\s+(\d+)\b\s*[:\-.]?\s*(.*)$/gim,
    (_match, prefix, _label, number, tail) => {
      const { title, remainder } = splitChapterTail(tail);
      const heading = title
        ? `${prefix}Chapter ${number}: ${title}`
        : `${prefix}Chapter ${number}`;
      return remainder ? `${heading}\n\n${remainder}` : heading;
    }
  );
}

function extractGeneratedStoryChapters() {
  const story = normalizeChapterHeadingText(state.generation?.generatedStory || '').trim();
  if (!story) return [];
  const draft = ensureManuscriptDraft();
  const generatedDrafts = draft.generatedChapters || {};
  const deletedChapterIds = new Set(draft.deletedChapterIds || []);

  const lines = story.split(/\r?\n/);
  const headingRegex = /^\s{0,3}(?:#{1,6}\s*)?(chapter|capitol(?:ul)?)\s+(\d+)\b[:\-. ]*(.*)$/i;
  const matches = [];

  lines.forEach((line, index) => {
    const m = line.match(headingRegex);
    if (!m) return;
    const number = m[2];
    const { title: normalizedTitle } = splitChapterTail(m[3] || '');
    const title = normalizedTitle ? `Chapter ${number}: ${normalizedTitle}` : `Chapter ${number}`;
    matches.push({ index, title });
  });

  if (!matches.length) {
    const id = 'nl_ch_1';
    const chapterDraft = generatedDrafts[id] || {};
    const baseChapters = [{
      id, type: 'chapter', title: chapterDraft.title || 'Chapter 1',
      name: chapterDraft.name || chapterDraft.title || 'Chapter 1',
      children: [], source: 'generated-story', generatedText: story,
      hookNote: chapterDraft.hookNote || '', sceneCraft: chapterDraft.sceneCraft || '',
      dialogueMode: chapterDraft.dialogueMode || 'balanced'
    }];
    const extraDraftIds = Object.keys(generatedDrafts).filter(draftId => !baseChapters.find(ch => ch.id === draftId));
    const extras = extraDraftIds.map((draftId, idx) => {
      const chapterDraftExtra = generatedDrafts[draftId] || {};
      const fallbackIndex = baseChapters.length + idx + 1;
      return {
        id: draftId,
        type: 'chapter',
        title: chapterDraftExtra.title || `Chapter ${fallbackIndex}`,
        name: chapterDraftExtra.name || chapterDraftExtra.title || `Chapter ${fallbackIndex}`,
        children: [],
        source: 'generated-story',
        generatedText: chapterDraftExtra.generatedText || '',
        hookNote: chapterDraftExtra.hookNote || '',
        sceneCraft: chapterDraftExtra.sceneCraft || '',
        dialogueMode: chapterDraftExtra.dialogueMode || 'balanced'
      };
    });
    return [...baseChapters, ...extras].filter(chapter => !deletedChapterIds.has(chapter.id));
  }

  const baseChapters = matches.map((entry, idx) => {
    const end = idx + 1 < matches.length ? matches[idx + 1].index : lines.length;
    const body = lines.slice(entry.index + 1, end).join('\n').trim();
    const id = `nl_ch_${idx + 1}`;
    const chapterDraft = generatedDrafts[id] || {};
    return {
      id,
      type: 'chapter',
      title: chapterDraft.title || entry.title,
      name: chapterDraft.name || chapterDraft.title || entry.title,
      children: [],
      source: 'generated-story',
      generatedText: body,
      hookNote: chapterDraft.hookNote || '',
      sceneCraft: chapterDraft.sceneCraft || '',
      dialogueMode: chapterDraft.dialogueMode || 'balanced'
    };
  });
  const extraDraftIds = Object.keys(generatedDrafts).filter(draftId => !baseChapters.find(ch => ch.id === draftId));
  const extras = extraDraftIds.map((draftId, idx) => {
    const chapterDraftExtra = generatedDrafts[draftId] || {};
    const fallbackIndex = baseChapters.length + idx + 1;
    return {
      id: draftId,
      type: 'chapter',
      title: chapterDraftExtra.title || `Chapter ${fallbackIndex}`,
      name: chapterDraftExtra.name || chapterDraftExtra.title || `Chapter ${fallbackIndex}`,
      children: [],
      source: 'generated-story',
      generatedText: chapterDraftExtra.generatedText || '',
      hookNote: chapterDraftExtra.hookNote || '',
      sceneCraft: chapterDraftExtra.sceneCraft || '',
      dialogueMode: chapterDraftExtra.dialogueMode || 'balanced'
    };
  });
  return [...baseChapters, ...extras].filter(chapter => !deletedChapterIds.has(chapter.id));
}

export function getChaptersForManuscript() {
  const generated = extractGeneratedStoryChapters();
  if (generated.length) return generated;
  return getChapters();
}

export function manuscriptUsesGeneratedStory() {
  return extractGeneratedStoryChapters().length > 0;
}

function formatChapterHeading(chapter, index) {
  const raw = String(chapter?.title || chapter?.name || '').trim();
  const normalized = raw
    .replace(/^\s*(chapter|capitol(?:ul)?)\s+\d+\s*[:\-.]?\s*/i, '')
    .replace(/^\s*(chapter|capitol(?:ul)?)\s*[:\-.]?\s*/i, '')
    .trim();
  return normalized ? `Chapter ${index + 1}: ${normalized}` : `Chapter ${index + 1}`;
}

function countNodeType(node, type) {
  let count = node?.type === type ? 1 : 0;
  for (const child of node?.children || []) count += countNodeType(child, type);
  return count;
}

function getChapterDialogues(chapterId) {
  return (state.project.libraries.dialogues || []).filter(d => d.location?.chapterId === chapterId);
}

function ensureGeneratedScenes(chapter) {
  const draft = ensureManuscriptDraft();
  const map = draft.generatedScenes || (draft.generatedScenes = {});
  if (!map[chapter.id]) {
    const pieces = splitGeneratedTextToScenes(chapter.generatedText);
    map[chapter.id] = pieces.map((piece, idx) => ({
      id: `${chapter.id}_sc_${idx + 1}`,
      title: `Scene ${idx + 1}`,
      text: piece,
      dialogue: '',
      characters: '',
      locations: '',
      objects: ''
    }));
  }
  return map[chapter.id];
}

function getEditableScenes(chapter) {
  if (!chapter) return [];

  if (chapter.source === 'generated-story') {
    return ensureGeneratedScenes(chapter).map(scene => ({
      id: scene.id,
      sourceType: 'generated',
      title: scene.title || 'Scene',
      text: scene.text || '',
      dialogue: scene.dialogue || '',
      characters: scene.characters || '',
      locations: scene.locations || '',
      objects: scene.objects || '',
      raw: scene
    }));
  }

  const scenes = getScenes(chapter);
  return scenes.map((scene, idx) => ({
    id: scene.id,
    sourceType: 'structured',
    title: scene.title || scene.name || `Scene ${idx + 1}`,
    text: scene.manuscriptText || '',
    dialogue: scene.manuscriptDialogue || '',
    characters: scene.manuscriptCharacters || '',
    locations: scene.manuscriptLocations || '',
    objects: scene.manuscriptObjects || '',
    raw: scene
  }));
}

export function getScenesForManuscriptChapter(chapter) {
  return getEditableScenes(chapter);
}

export function addGeneratedManuscriptChapter() {
  const draft = ensureManuscriptDraft();
  const generatedDrafts = draft.generatedChapters || (draft.generatedChapters = {});
  draft.deletedChapterIds = (draft.deletedChapterIds || []).filter(id => id !== `nl_ch_${getChaptersForManuscript().length + 1}`);
  const chapterCount = getChaptersForManuscript().length;
  const nextNumber = chapterCount + 1;
  const chapterId = `nl_ch_${nextNumber}`;
  generatedDrafts[chapterId] = {
    ...(generatedDrafts[chapterId] || {}),
    title: generatedDrafts[chapterId]?.title || `Chapter ${nextNumber}`,
    name: generatedDrafts[chapterId]?.name || `Chapter ${nextNumber}`,
    generatedText: generatedDrafts[chapterId]?.generatedText || '',
    hookNote: generatedDrafts[chapterId]?.hookNote || '',
    sceneCraft: generatedDrafts[chapterId]?.sceneCraft || '',
    dialogueMode: generatedDrafts[chapterId]?.dialogueMode || 'balanced'
  };
  const generatedScenes = draft.generatedScenes || (draft.generatedScenes = {});
  if (!generatedScenes[chapterId]) {
    generatedScenes[chapterId] = [{
      id: `${chapterId}_sc_1`,
      title: 'Scene 1',
      text: '',
      dialogue: '',
      characters: '',
      locations: '',
      objects: ''
    }];
  }
  return chapterId;
}

export function addGeneratedManuscriptScene(chapterId) {
  if (!chapterId) return null;
  const chapter = getChaptersForManuscript().find(item => item.id === chapterId);
  if (!chapter || chapter.source !== 'generated-story') return null;
  const generatedScenes = ensureGeneratedScenes(chapter);
  const nextNumber = generatedScenes.length + 1;
  const sceneId = `${chapter.id}_sc_${nextNumber}`;
  generatedScenes.push({
    id: sceneId,
    title: `Scene ${nextNumber}`,
    text: '',
    dialogue: '',
    characters: '',
    locations: '',
    objects: ''
  });
  return sceneId;
}

export function deleteGeneratedManuscriptChapter(chapterId) {
  if (!chapterId) return false;
  const draft = ensureManuscriptDraft();
  const generatedDrafts = draft.generatedChapters || (draft.generatedChapters = {});
  const generatedScenes = draft.generatedScenes || (draft.generatedScenes = {});
  delete generatedDrafts[chapterId];
  delete generatedScenes[chapterId];
  if (!draft.deletedChapterIds.includes(chapterId)) draft.deletedChapterIds.push(chapterId);
  return true;
}

export function deleteGeneratedManuscriptScene(chapterId, sceneId) {
  if (!chapterId || !sceneId) return false;
  const chapter = getChaptersForManuscript().find(item => item.id === chapterId);
  if (!chapter || chapter.source !== 'generated-story') return false;
  const generatedScenes = ensureGeneratedScenes(chapter);
  const nextScenes = generatedScenes.filter(scene => scene.id !== sceneId);
  if (nextScenes.length === generatedScenes.length) return false;
  const draft = ensureManuscriptDraft();
  draft.generatedScenes[chapterId] = nextScenes;
  return true;
}

function setSceneField(chapter, scene, field, value) {
  const normalized = ['characters', 'locations', 'objects'].includes(field)
    ? normalizeListValue(value)
    : String(value || '');

  if (scene.sourceType === 'generated' || chapter?.source === 'generated-story') {
    const generatedScenes = ensureGeneratedScenes(chapter);
    const target = generatedScenes.find(item => item.id === scene.id);
    if (!target) return;
    if (field === 'title') target.title = normalized;
    if (field === 'text') target.text = normalized;
    if (field === 'dialogue') target.dialogue = normalized;
    if (field === 'characters') target.characters = normalized;
    if (field === 'locations') target.locations = normalized;
    if (field === 'objects') target.objects = normalized;
    return;
  }

  const target = scene.raw;
  if (!target) return;
  if (field === 'title') {
    target.title = normalized;
    if (!target.name || String(target.name).startsWith('Sc')) target.name = normalized;
  }
  if (field === 'text') target.manuscriptText = normalized;
  if (field === 'dialogue') target.manuscriptDialogue = normalized;
  if (field === 'characters') target.manuscriptCharacters = normalized;
  if (field === 'locations') target.manuscriptLocations = normalized;
  if (field === 'objects') target.manuscriptObjects = normalized;
}

function parseRegeneratedScene(content) {
  const txt = String(content || '').trim();
  if (!txt) return { narrative: '', dialogue: '' };
  const narrativeMatch = txt.match(/(?:^|\n)\s*NARRATIVE\s*:\s*([\s\S]*?)(?:\n\s*DIALOGUE\s*:|$)/i);
  const dialogueMatch = txt.match(/(?:^|\n)\s*DIALOGUE\s*:\s*([\s\S]*)$/i);
  const narrative = (narrativeMatch?.[1] || '').trim();
  const dialogue = (dialogueMatch?.[1] || '').trim();
  if (narrative || dialogue) return { narrative, dialogue };
  const blocks = txt.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  if (blocks.length === 1) return { narrative: blocks[0], dialogue: '' };
  return { narrative: blocks.slice(0, -1).join('\n\n'), dialogue: blocks[blocks.length - 1] };
}

async function regenerateSceneWithLLM(chapter, scene, chapterIndex, sceneIndex) {
  const cnl = generateCNL();
  const model = document.querySelector('#nl-model')?.value || 'copilot-gpt-4o';
  const prompt = [
    'Rewrite exactly one scene from the manuscript.',
    `Chapter: ${formatChapterHeading(chapter, chapterIndex)}`,
    `Scene: ${sceneIndex + 1}`,
    `Scene title: ${scene.title || `Scene ${sceneIndex + 1}`}`,
    `Hook: ${chapter.hookNote || ''}`,
    `Scene craft: ${chapter.sceneCraft || ''}`,
    `Current narrative:\n${scene.text || ''}`,
    `Current dialogue:\n${scene.dialogue || ''}`,
    'Return plain text with this exact structure:',
    'NARRATIVE:',
    '<rewritten narrative>',
    'DIALOGUE:',
    '<rewritten dialogue lines Speaker: text>'
  ].join('\n\n');

  const response = await fetch('/v1/generate/nl-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cnl,
      storyName: state.project.name,
      options: { language: 'ro', model, customPrompt: prompt }
    })
  });
  if (!response.ok) throw new Error(`LLM request failed (${response.status})`);
  const result = await response.json();
  if (!result?.story) throw new Error('LLM returned empty content');
  return parseRegeneratedScene(result.story);
}

function getSelectedChapter(chapters) {
  if (!chapters.length) return null;
  const byId = chapters.find(ch => ch.id === manuscriptUiState.selectedChapterId);
  if (byId) return byId;
  manuscriptUiState.selectedChapterId = chapters[0].id;
  return chapters[0];
}

function getSelectedScene(chapterScenes) {
  if (!chapterScenes.length) {
    manuscriptUiState.selectedSceneId = null;
    return null;
  }
  const byId = chapterScenes.find(scene => scene.id === manuscriptUiState.selectedSceneId);
  if (byId) return byId;
  manuscriptUiState.selectedSceneId = chapterScenes[0].id;
  return chapterScenes[0];
}

function sceneLabel(scene, index) {
  const raw = String(scene?.title || scene?.name || '').trim();
  const scenePrefix = new RegExp(`^scene\\s+${index + 1}\\b\\s*[:\\-.]?\\s*`, 'i');
  const cleaned = raw.replace(scenePrefix, '').trim();
  if (!cleaned && raw) return `Scene ${index + 1}`;
  if (cleaned) return `Scene ${index + 1}: ${cleaned}`;
  return raw ? `Scene ${index + 1}: ${raw}` : `Scene ${index + 1}`;
}
function initials(name) {
  return String(name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase() || '').join('') || '?';
}
function parseDialogueLines(text) {
  const lines = String(text || '').split('\n').map(line => line.trim()).filter(Boolean);
  return lines.map((line, idx) => {
    const sep = line.indexOf(':');
    if (sep > 0) {
      return { speaker: line.slice(0, sep).trim(), text: line.slice(sep + 1).trim() };
    }
    return { speaker: `Speaker ${idx + 1}`, text: line };
  });
}

function renderChapterNavigator(chapters, selectedChapter) {
  return chapters.map((chapter, index) => {
    const isSelected = selectedChapter && chapter.id === selectedChapter.id;
    const scenes = getEditableScenes(chapter);
    return `
      <details class="studio-nav-chapter" ${isSelected ? 'open' : ''}>
        <summary data-select-chapter="${esc(chapter.id)}">
          <span class="studio-nav-title">${esc(formatChapterHeading(chapter, index))}</span>
        </summary>
        <div class="studio-scene-list">
          ${scenes.length ? scenes.map((scene, sceneIndex) => `
            <button class="studio-scene-item ${scene.id === manuscriptUiState.selectedSceneId ? 'active' : ''}" type="button" data-select-chapter="${esc(chapter.id)}" data-select-scene="${esc(scene.id)}">
              ${esc(sceneLabel(scene, sceneIndex))}
            </button>
          `).join('') : `<div class="studio-scene-empty">No scenes yet.</div>`}
        </div>
      </details>
    `;
  }).join('');
}

export function computeChapterSummary(chapter) {
  const scenes = getEditableScenes(chapter);
  const chars = countNodeType(chapter, 'character-ref');
  const locations = countNodeType(chapter, 'location-ref');
  const blocks = countNodeType(chapter, 'block-ref');
  const dialogues = getChapterDialogues(chapter.id).length;
  const chapterLabel = chapter.title || chapter.name || 'Untitled chapter';
  return `${chapterLabel} includes ${scenes.length} scene(s), ${chars} character reference(s), ${locations} location reference(s), ${blocks} narrative block(s), and ${dialogues} dialogue marker(s).`;
}

function renderSceneWorkspace(chapter, scene, chapterIndex, sceneIndex) {
  if (!scene) {
    return `
      <section class="studio-section studio-scene-panel">
        <div class="studio-empty">Select a scene to edit the manuscript.</div>
      </section>
    `;
  }

  const characterTerms = normalizeListValue(scene.characters).split(',').map(item => item.trim()).filter(Boolean);
  const locationTerms = normalizeListValue(scene.locations).split(',').map(item => item.trim()).filter(Boolean);
  const knownLocations = (state.project.libraries.locations || [])
    .map(item => String(item?.name || '').trim())
    .filter(Boolean);
  const locationOptions = Array.from(new Set([...knownLocations, ...locationTerms]));
  const customLocationTerms = locationTerms.filter(name => !knownLocations.includes(name));
  const dialogueRows = parseDialogueLines(scene.dialogue);

  return `
    <section class="studio-section studio-scene-panel">
      <div class="studio-form-grid">
        <label class="studio-field studio-field-inline">
          <span>Chapter Title</span>
          <input type="text" data-chapter-id="${esc(chapter.id)}" data-field="title" value="${esc(chapter.title || '')}" placeholder="Enter chapter title...">
        </label>
        <label class="studio-field studio-field-inline">
          <span>Hook</span>
          <input type="text" data-chapter-id="${esc(chapter.id)}" data-field="hookNote" value="${esc(chapter.hookNote || '')}" placeholder="Enter hook...">
        </label>
        <label class="studio-field">
          <span>Scene Craft</span>
          <textarea rows="4" data-chapter-id="${esc(chapter.id)}" data-field="sceneCraft" placeholder="Describe the purpose of the scene...">${esc(chapter.sceneCraft || '')}</textarea>
        </label>
      </div>

      <div class="studio-manuscript-grid">
        <label class="studio-field">
          <span>Narrative Text</span>
          <textarea rows="6" id="scene-text-editor" data-scene-id="${esc(scene.id)}" data-scene-field="text" placeholder="Write the narrative text of the scene here...">${esc(scene.text || '')}</textarea>
        </label>
      </div>

      <div class="chapter-summary-box">
        <div class="chapter-summary-title">Involved Characters</div>
        <div class="chapter-summary-text">
          ${characterTerms.length ? characterTerms.map(name => `
            <span class="studio-character-chip">
              <span class="studio-character-avatar">${esc(initials(name))}</span>
              <span>${esc(name)}</span>
            </span>
          `).join('') : 'No characters selected.'}
        </div>
        <input type="hidden" data-scene-id="${esc(scene.id)}" data-scene-field="characters" value="${esc(scene.characters || '')}">
        <div class="studio-action-row">
          <button class="btn small" type="button" data-scene-id="${esc(scene.id)}" data-scene-quick-add="character">+ Add New Character</button>
        </div>
      </div>

      <div class="chapter-summary-box">
        <div class="chapter-summary-title">Location</div>
        <label class="studio-field">
          <span>Select Locations</span>
          <select multiple size="${Math.max(3, Math.min(6, locationOptions.length || 3))}" data-scene-id="${esc(scene.id)}" data-scene-location-select>
            ${locationOptions.map(name => `<option value="${esc(name)}" ${locationTerms.includes(name) ? 'selected' : ''}>${esc(name)}</option>`).join('')}
          </select>
        </label>
        <label class="studio-field">
          <span>Custom Locations</span>
          <input
            type="text"
            data-scene-id="${esc(scene.id)}"
            data-scene-location-custom
            value="${esc(customLocationTerms.join(', '))}"
            placeholder="Add custom locations, separated by commas">
        </label>
        <input type="hidden" data-scene-id="${esc(scene.id)}" data-scene-field="locations" value="${esc(scene.locations || '')}">
      </div>

      <div class="chapter-summary-box">
        <div class="chapter-summary-title">Dialog</div>
        <div class="studio-dialog-list">
          ${dialogueRows.length ? dialogueRows.map(row => `
            <div class="studio-dialog-item">
              <span class="studio-dialog-avatar">${esc(initials(row.speaker))}</span>
              <span class="studio-dialog-speaker">${esc(row.speaker)}</span>
              <span class="studio-dialog-text">${esc(row.text)}</span>
            </div>
          `).join('') : '<div class="studio-dialog-empty">No dialog lines yet.</div>'}
        </div>
        <input type="hidden" data-scene-id="${esc(scene.id)}" data-scene-field="dialogue" value="${esc(scene.dialogue || '')}">
        <div class="studio-action-row">
          <button class="btn small" type="button" data-scene-id="${esc(scene.id)}" data-scene-quick-add="dialogue">+ Add Dialog</button>
        </div>
      </div>
      <div class="studio-action-row studio-action-row-main">
        <button class="btn primary" type="button" data-scene-action="regenerate">Regenerate Scene</button>
      </div>
    </section>
  `;
}

function renderChapterDetail(chapter, index, selectedScene, selectedSceneIndex) {
  if (!chapter) {
    return `
      <section class="studio-detail-panel">
        <div class="studio-empty">Select a chapter to start editing details.</div>
      </section>
    `;
  }

  return `
    <section class="studio-detail-panel">
      <div class="studio-section-head">
        <h3>Story Workspace</h3>
      </div>
      ${renderSceneWorkspace(chapter, selectedScene, index, selectedSceneIndex)}
    </section>
  `;
}

function ensureBookStructure() {
  if (state.project.structure) return;
  state.project.structure = {
    id: `book_${Date.now()}`,
    type: 'book',
    name: 'Book',
    title: state.project.name || 'Untitled Story',
    children: [
      {
        id: `ch_${Date.now()}`,
        type: 'chapter',
        name: 'Ch1',
        title: 'Chapter 1',
        children: []
      }
    ]
  };
}

function renderManuscriptEmptyState() {
  return `
    <div class="studio-empty">
      <div class="studio-empty-title">No manuscript structure yet</div>
      <div class="studio-empty-text">Create a book and at least one chapter to start writing.</div>
      <button class="btn primary" type="button" id="btn-create-manuscript">Create Manuscript Structure</button>
    </div>
  `;
}

export function renderManuscriptStudio() {
  const chapters = getChaptersForManuscript();
  if (!chapters.length) return renderManuscriptEmptyState();
  const selectedChapter = getSelectedChapter(chapters);
  const selectedIndex = Math.max(0, chapters.findIndex(ch => ch.id === selectedChapter?.id));
  const chapterScenes = getEditableScenes(selectedChapter);
  const selectedScene = getSelectedScene(chapterScenes);
  const selectedSceneIndex = Math.max(0, chapterScenes.findIndex(scene => scene.id === selectedScene?.id));

  return `
    <div class="studio-layout">
      <section class="studio-section studio-nav-panel">
        <div class="studio-section-head">
          <h3>Manuscript Navigator</h3>
          <p>Chapter and scene structure with direct access to editable manuscript sections.</p>
        </div>
        <div class="studio-nav-list">
          ${renderChapterNavigator(chapters, selectedChapter)}
        </div>
      </section>
      ${renderChapterDetail(selectedChapter, selectedIndex, selectedScene, selectedSceneIndex)}
    </div>
  `;
}

export function bindManuscriptEvents(container, rerender) {
  container.querySelector('#btn-create-manuscript')?.addEventListener('click', () => {
    ensureBookStructure();
    rerender();
  });

  container.querySelectorAll('[data-select-chapter]').forEach(el => {
    el.addEventListener('click', () => {
      const chapterId = el.getAttribute('data-select-chapter');
      if (!chapterId) return;
      manuscriptUiState.selectedChapterId = chapterId;
      const sceneId = el.getAttribute('data-select-scene');
      manuscriptUiState.selectedSceneId = sceneId || null;
      rerender();
    });
  });

  container.querySelectorAll('[data-chapter-id][data-field]').forEach(el => {
    const updateChapter = () => {
      const chapterId = el.getAttribute('data-chapter-id');
      const field = el.getAttribute('data-field');
      const chapter = getChaptersForManuscript().find(item => item.id === chapterId);
      if (!chapter || !field) return;
      if (chapter.source === 'generated-story') {
        const draft = ensureManuscriptDraft();
        const generatedDrafts = draft.generatedChapters || (draft.generatedChapters = {});
        const chapterDraft = generatedDrafts[chapterId] || {};
        chapterDraft[field] = el.value;
        if (field === 'title') chapterDraft.name = el.value;
        generatedDrafts[chapterId] = chapterDraft;
      } else {
        chapter[field] = el.value;
        if (field === 'title') chapter.name = chapter.name || `Ch${getChaptersForManuscript().indexOf(chapter) + 1}`;
      }
      generateCNL();
    };
    el.addEventListener('input', updateChapter);
    el.addEventListener('change', updateChapter);
  });

  container.querySelectorAll('[data-scene-id][data-scene-field]').forEach(el => {
    const updateScene = () => {
      const sceneId = el.getAttribute('data-scene-id');
      const field = el.getAttribute('data-scene-field');
      if (!sceneId || !field) return;

      const chapters = getChaptersForManuscript();
      for (const chapter of chapters) {
        const scenes = getEditableScenes(chapter);
        const scene = scenes.find(item => item.id === sceneId);
        if (!scene) continue;
        setSceneField(chapter, scene, field, el.value);
        manuscriptUiState.selectedChapterId = chapter.id;
        manuscriptUiState.selectedSceneId = scene.id;
        generateCNL();
        return;
      }
    };
    el.addEventListener('input', updateScene);
    el.addEventListener('change', updateScene);
  });

  container.querySelectorAll('[data-scene-id][data-scene-location-select]').forEach(select => {
    select.addEventListener('change', () => {
      const sceneId = select.getAttribute('data-scene-id');
      if (!sceneId) return;
      const customInput = container.querySelector(`[data-scene-id="${sceneId}"][data-scene-location-custom]`);
      const selectedLocations = Array.from(select.selectedOptions).map(option => option.value.trim()).filter(Boolean);
      const customLocations = parseListValue(customInput?.value || '');
      const chapters = getChaptersForManuscript();
      for (const chapter of chapters) {
        const scenes = getEditableScenes(chapter);
        const targetScene = scenes.find(item => item.id === sceneId);
        if (!targetScene) continue;
        setSceneField(chapter, targetScene, 'locations', [...selectedLocations, ...customLocations].join(', '));
        generateCNL();
        rerender();
        return;
      }
    });
  });

  container.querySelectorAll('[data-scene-id][data-scene-location-custom]').forEach(input => {
    const syncCustomLocations = () => {
      const sceneId = input.getAttribute('data-scene-id');
      if (!sceneId) return;
      const select = container.querySelector(`[data-scene-id="${sceneId}"][data-scene-location-select]`);
      const selectedLocations = select
        ? Array.from(select.selectedOptions).map(option => option.value.trim()).filter(Boolean)
        : [];
      const customLocations = parseListValue(input.value);
      const chapters = getChaptersForManuscript();
      for (const chapter of chapters) {
        const scenes = getEditableScenes(chapter);
        const targetScene = scenes.find(item => item.id === sceneId);
        if (!targetScene) continue;
        setSceneField(chapter, targetScene, 'locations', [...selectedLocations, ...customLocations].join(', '));
        generateCNL();
        return;
      }
    };

    input.addEventListener('input', syncCustomLocations);
    input.addEventListener('change', syncCustomLocations);
  });

  container.querySelectorAll('[data-scene-id][data-scene-quick-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sceneId = btn.getAttribute('data-scene-id');
      const kind = btn.getAttribute('data-scene-quick-add');
      if (!sceneId || !kind) return;
      const chapters = getChaptersForManuscript();
      for (const chapter of chapters) {
        const scenes = getEditableScenes(chapter);
        const targetScene = scenes.find(item => item.id === sceneId);
        if (!targetScene) continue;
        if (kind === 'dialogue') {
          const speaker = window.prompt('Speaker name:', '');
          if (!String(speaker || '').trim()) return;
          const line = window.prompt('Dialog text:', '');
          if (!String(line || '').trim()) return;
          const newDialogueLine = `${String(speaker).trim()}: ${String(line).trim()}`;
          const updatedDialogue = [String(targetScene.dialogue || '').trim(), newDialogueLine].filter(Boolean).join('\n');
          setSceneField(chapter, targetScene, 'dialogue', updatedDialogue);
        } else {
          const val = window.prompt('Add character name:', '');
          if (!String(val || '').trim()) return;
          const updatedCharacters = normalizeListValue([String(targetScene.characters || '').trim(), String(val).trim()].filter(Boolean).join(', '));
          setSceneField(chapter, targetScene, 'characters', updatedCharacters);
        }
        generateCNL();
        rerender();
        return;
      }
    });
  });

  container.querySelector('[data-scene-action="regenerate"]')?.addEventListener('click', async () => {
    const chapters = getChaptersForManuscript();
    const chapterIndex = chapters.findIndex(ch => ch.id === manuscriptUiState.selectedChapterId);
    const chapter = chapters[chapterIndex];
    if (!chapter) return;
    const scenes = getEditableScenes(chapter);
    const sceneIndex = scenes.findIndex(item => item.id === manuscriptUiState.selectedSceneId);
    const scene = scenes[sceneIndex >= 0 ? sceneIndex : 0];
    if (!scene) return;

    const btn = container.querySelector('[data-scene-action="regenerate"]');
    try {
      if (btn) btn.setAttribute('disabled', 'disabled');
      const regenerated = await regenerateSceneWithLLM(chapter, scene, Math.max(0, chapterIndex), Math.max(0, sceneIndex));
      if (regenerated.narrative) setSceneField(chapter, scene, 'text', regenerated.narrative);
      if (regenerated.dialogue) setSceneField(chapter, scene, 'dialogue', regenerated.dialogue);
      generateCNL();
      window.showNotification?.('Scene regenerated with LLM.', 'success');
      rerender();
    } catch (err) {
      window.showNotification?.(`LLM regenerate failed: ${err.message}`, 'error');
    } finally {
      if (btn) btn.removeAttribute('disabled');
    }
  });

}
