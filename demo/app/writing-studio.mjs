/**
 * SCRIPTA Demo - Manuscript Studio + Story Map
 */

import { state } from './state.mjs';
import { $ } from './utils.mjs';
import { generateCNL } from './cnl.mjs';
import { getOrderedChapters, getChapterScenes } from './structure-navigation.mjs';

const manuscriptUiState = {
  selectedChapterId: null
};

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
      : {}
  };
  return state.project.blueprint.manuscriptDraft;
}

function extractGeneratedStoryChapters() {
  const story = String(state.generation?.generatedStory || '').trim();
  if (!story) return [];
  const draft = ensureManuscriptDraft();
  const generatedDrafts = draft.generatedChapters || {};

  const lines = story.split(/\r?\n/);
  const headingRegex = /^\s{0,3}(?:#{1,6}\s*)?(chapter|capitol(?:ul)?)\s+(\d+)\b[:\-. ]*(.*)$/i;
  const matches = [];

  lines.forEach((line, index) => {
    const m = line.match(headingRegex);
    if (!m) return;
    const number = m[2];
    const tail = String(m[3] || '').trim();
    const title = tail ? `Chapter ${number}: ${tail}` : `Chapter ${number}`;
    matches.push({ index, title });
  });

  if (!matches.length) return [];

  return matches.map((entry, idx) => {
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
}

function getChaptersForManuscript() {
  const structureChapters = getChapters();
  if (structureChapters.length) return structureChapters;
  return extractGeneratedStoryChapters();
}

function formatChapterHeading(chapter, index) {
  const raw = String(chapter?.title || chapter?.name || '').trim();
  const normalized = raw.replace(/^\s*(chapter|capitol(?:ul)?)\s+\d+\s*[:\-.]?\s*/i, '').trim();
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

function getChapterHook(chapterId) {
  const hooks = state.project.blueprint.hooks || {};
  const opening = hooks.opening || null;
  const mids = Array.isArray(hooks.mid) ? hooks.mid : [];
  const chapterMid = mids.find(h => h.chapterId === chapterId || h.targetChapterId === chapterId);
  if (chapterMid?.hookText) return chapterMid.hookText;
  if (opening?.hookText) return opening.hookText;
  return '';
}

function computeChapterSummary(chapter) {
  const scenes = getScenes(chapter);
  const chars = countNodeType(chapter, 'character-ref');
  const locations = countNodeType(chapter, 'location-ref');
  const blocks = countNodeType(chapter, 'block-ref');
  const dialogues = getChapterDialogues(chapter.id).length;
  const chapterLabel = chapter.title || chapter.name || 'Untitled chapter';
  return `${chapterLabel} includes ${scenes.length} scene(s), ${chars} character reference(s), ${locations} location reference(s), ${blocks} narrative block(s), and ${dialogues} dialogue marker(s).`;
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

function getSelectedChapter(chapters) {
  if (!chapters.length) return null;
  const byId = chapters.find(ch => ch.id === manuscriptUiState.selectedChapterId);
  if (byId) return byId;
  manuscriptUiState.selectedChapterId = chapters[0].id;
  return chapters[0];
}

function sceneLabel(scene, index) {
  const raw = String(scene?.title || scene?.name || '').trim();
  return raw ? `Scene ${index + 1}: ${raw}` : `Scene ${index + 1}`;
}

function sceneChildLabel(child) {
  if (!child) return 'Item';
  if (child.type === 'dialogue-ref' && child.refId) {
    const dialogue = (state.project.libraries?.dialogues || []).find(item => item.id === child.refId);
    if (dialogue?.purpose) return `Dialogue: ${dialogue.purpose}`;
  }
  if (child.type === 'action' && child.actionData) {
    const subject = child.actionData.subject || 'Action';
    const target = child.actionData.target ? ` ${child.actionData.target}` : '';
    return `${subject}${target}`.trim();
  }
  return String(child.name || child.title || child.type || 'Item');
}

function renderChapterNavigator(chapters, selectedChapter) {
  return chapters.map((chapter, index) => {
    const isSelected = selectedChapter && chapter.id === selectedChapter.id;
    const scenes = getScenes(chapter);
    return `
      <details class="studio-nav-chapter" ${isSelected ? 'open' : ''}>
        <summary data-select-chapter="${esc(chapter.id)}">
          <span class="studio-nav-title">${esc(formatChapterHeading(chapter, index))}</span>
          <span class="studio-nav-meta">${scenes.length} scene(s)</span>
        </summary>
        <div class="studio-scene-list">
          ${scenes.length ? scenes.map((scene, sceneIndex) => `
            <div class="studio-scene-block">
              <button class="studio-scene-item" type="button" data-select-chapter="${esc(chapter.id)}">
                ${esc(sceneLabel(scene, sceneIndex))}
              </button>
              ${(scene.children || []).length ? `
                <div class="studio-scene-children">
                  ${(scene.children || []).map(child => `
                    <div class="studio-scene-child" data-select-chapter="${esc(chapter.id)}">
                      <span class="studio-scene-child-label">${esc(sceneChildLabel(child))}</span>
                      <span class="studio-scene-child-type">${esc(child.type || 'item')}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('') : `<div class="studio-scene-empty">No scenes yet.</div>`}
        </div>
      </details>
    `;
  }).join('');
}

function renderChapterDetail(chapter, index) {
  if (!chapter) {
    return `
      <section class="studio-detail-panel">
        <div class="studio-empty">Select a chapter to start editing details.</div>
      </section>
    `;
  }

  const scenes = getScenes(chapter);
  const hookText = getChapterHook(chapter.id) || chapter.hookNote || '';
  const sceneCraft = chapter.sceneCraft || '';
  const dialogueMode = chapter.dialogueMode || 'balanced';
  const summary = computeChapterSummary(chapter);
  const suggestions = [
    'Open with sensory contrast and a latent question.',
    'Escalate stakes by removing one safe option.',
    'End chapter with a decision under pressure.'
  ];

  return `
    <section class="studio-detail-panel">
      <div class="studio-section-head">
        <h3>Chapter Detail</h3>
        <p>${esc(formatChapterHeading(chapter, index))}</p>
      </div>

      <div class="studio-detail-grid">
        <label class="studio-field">
          <span>Chapter Title</span>
          <input type="text" data-chapter-id="${chapter.id}" data-field="title" value="${esc(chapter.title || '')}" placeholder="Chapter title">
        </label>

        <label class="studio-field">
          <span>Hook</span>
          <textarea rows="3" data-chapter-id="${chapter.id}" data-field="hookNote" placeholder="Opening hook idea">${esc(hookText)}</textarea>
        </label>

        <label class="studio-field">
          <span>Scene Craft</span>
          <textarea rows="4" data-chapter-id="${chapter.id}" data-field="sceneCraft" placeholder="Describe chapter-level scene strategy and transitions">${esc(sceneCraft)}</textarea>
        </label>

        <div class="studio-suggestions">
          <span>LLM Suggestions</span>
          <div class="studio-suggestion-list">
            ${suggestions.map(text => `
              <button type="button" class="studio-suggestion-chip" data-chapter-id="${chapter.id}" data-suggestion="${esc(text)}">${esc(text)}</button>
            `).join('')}
          </div>
        </div>

        <label class="studio-field">
          <span>Dialogue Mode</span>
          <select data-chapter-id="${chapter.id}" data-field="dialogueMode">
            <option value="minimal" ${dialogueMode === 'minimal' ? 'selected' : ''}>Minimal</option>
            <option value="balanced" ${dialogueMode === 'balanced' ? 'selected' : ''}>Balanced</option>
            <option value="dialogue-heavy" ${dialogueMode === 'dialogue-heavy' ? 'selected' : ''}>Dialogue-Heavy</option>
          </select>
        </label>
      </div>

      <div class="chapter-summary-box">
        <div class="chapter-summary-title">Scenes in Chapter</div>
        <div class="chapter-summary-text">
          ${scenes.length ? scenes.map((scene, sceneIndex) => esc(sceneLabel(scene, sceneIndex))).join(' • ') : 'No scenes yet.'}
        </div>
      </div>

      ${chapter.source === 'generated-story' ? `
        <div class="chapter-summary-box">
          <div class="chapter-summary-title">Generated Chapter</div>
          <div class="chapter-summary-text">${esc(String(chapter.generatedText || '').trim() || 'No chapter text available.')}</div>
        </div>
      ` : ''}

      <div class="chapter-summary-box">
        <div class="chapter-summary-title">Chapter Summary (auto-generated)</div>
        <div class="chapter-summary-text">${esc(summary)}</div>
      </div>
    </section>
  `;
}

function renderManuscriptStudio() {
  const chapters = getChaptersForManuscript();
  if (!chapters.length) return renderManuscriptEmptyState();
  const selectedChapter = getSelectedChapter(chapters);
  const selectedIndex = Math.max(0, chapters.findIndex(ch => ch.id === selectedChapter?.id));

  return `
    <div class="studio-layout">
      <section class="studio-section studio-nav-panel">
        <div class="studio-section-head">
          <h3>Chapters List</h3>
          <p>Expand chapters to inspect scenes, then edit details in the main panel.</p>
        </div>
        <div class="studio-nav-list">
          ${renderChapterNavigator(chapters, selectedChapter)}
        </div>
      </section>
      ${renderChapterDetail(selectedChapter, selectedIndex)}
    </div>
  `;
}

function getBookSummary() {
  const chapters = getChaptersForManuscript();
  if (!chapters.length) return 'No chapters yet.';
  const summaryLines = chapters.map((chapter, idx) => {
    const scenes = getScenes(chapter).length;
    return `Chapter ${idx + 1}: ${(chapter.title || chapter.name || 'Untitled')} with ${scenes} scene(s).`;
  });
  return summaryLines.join(' ');
}

function getConflictProgression() {
  const curve = state.project.blueprint.tensionCurve || [];
  if (!curve.length) return ['Conflict progression not mapped yet.'];
  return curve
    .sort((a, b) => a.position - b.position)
    .map(point => `At ${Math.round(point.position * 100)}% tension reaches ${point.tension}/5.`);
}

function renderTensionCurve() {
  const points = [...(state.project.blueprint.tensionCurve || [])].sort((a, b) => a.position - b.position);
  const curve = points.length ? points : [
    { position: 0, tension: 2 },
    { position: 0.5, tension: 3 },
    { position: 1, tension: 4 }
  ];
  const width = 360;
  const height = 90;
  const polyline = curve.map(point => {
    const x = point.position * width;
    const y = height - ((point.tension - 1) / 4) * height;
    return `${x},${y}`;
  }).join(' ');
  return `
    <svg class="storymap-curve" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <polyline points="${polyline}" />
    </svg>
  `;
}

function renderChapterFlow() {
  const chapters = getChaptersForManuscript();
  if (!chapters.length) return '<div class="storymap-empty">No chapter flow yet.</div>';
  return `
    <div class="storymap-flow">
      ${chapters.map((chapter, idx) => `
        <div class="storymap-flow-item">
          <div class="flow-title">Chapter ${idx + 1}: ${esc(chapter.title || chapter.name || 'Untitled')}</div>
          <div class="flow-text">${esc(computeChapterSummary(chapter))}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderStoryMap() {
  generateCNL();
  const cnl = $('#cnl-output')?.textContent || '// CNL not generated yet';
  const progression = getConflictProgression();

  return `
    <div class="storymap-layout">
      <section class="storymap-card" id="storymap-book-summary">
        <h3>Book Summary</h3>
        <p>${esc(getBookSummary())}</p>
      </section>
      <section class="storymap-card" id="storymap-conflict-progression">
        <h3>Conflict Progression</h3>
        <ul class="storymap-list">
          ${progression.map(item => `<li>${esc(item)}</li>`).join('')}
        </ul>
      </section>
      <section class="storymap-card" id="storymap-chapter-flow">
        <h3>Chapter Flow</h3>
        ${renderChapterFlow()}
      </section>
      <section class="storymap-card" id="storymap-tension-curve">
        <h3>Tension Curve</h3>
        ${renderTensionCurve()}
      </section>
      <section class="storymap-card">
        <div class="storymap-card-head">
          <h3>CNL View</h3>
          <button class="btn small" type="button" id="btn-open-cnl-view">Open Full CNL</button>
        </div>
        <pre class="storymap-cnl">${esc(cnl)}</pre>
      </section>
    </div>
  `;
}

function bindManuscriptEvents(container) {
  container.querySelector('#btn-create-manuscript')?.addEventListener('click', () => {
    ensureBookStructure();
    renderManuscriptStudioView();
  });

  container.querySelectorAll('[data-select-chapter]').forEach(el => {
    el.addEventListener('click', () => {
      const chapterId = el.getAttribute('data-select-chapter');
      if (!chapterId) return;
      manuscriptUiState.selectedChapterId = chapterId;
      renderManuscriptStudioView();
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

  container.querySelectorAll('[data-suggestion][data-chapter-id]').forEach(button => {
    button.addEventListener('click', () => {
      const chapterId = button.getAttribute('data-chapter-id');
      const suggestion = button.getAttribute('data-suggestion');
      const chapter = getChaptersForManuscript().find(item => item.id === chapterId);
      if (!chapter || !suggestion) return;
      if (chapter.source === 'generated-story') {
        const draft = ensureManuscriptDraft();
        const generatedDrafts = draft.generatedChapters || (draft.generatedChapters = {});
        const chapterDraft = generatedDrafts[chapterId] || {};
        const currentCraft = String(chapterDraft.sceneCraft || '');
        chapterDraft.sceneCraft = currentCraft
          ? `${currentCraft}\n- ${suggestion}`
          : `- ${suggestion}`;
        generatedDrafts[chapterId] = chapterDraft;
      } else {
        chapter.sceneCraft = chapter.sceneCraft
          ? `${chapter.sceneCraft}\n- ${suggestion}`
          : `- ${suggestion}`;
      }
      generateCNL();
      renderManuscriptStudioView();
    });
  });
}

function bindStoryMapEvents(container) {
  container.querySelector('#btn-open-cnl-view')?.addEventListener('click', () => {
    window.switchToTab?.('cnl');
  });
}

function getStoryMapSectionId(sectionKey) {
  const map = {
    'book-summary': 'storymap-book-summary',
    'conflict-progression': 'storymap-conflict-progression',
    'chapter-flow': 'storymap-chapter-flow',
    'tension-curve': 'storymap-tension-curve'
  };
  return map[sectionKey] || '';
}

export function focusStoryMapSection(sectionKey) {
  const id = getStoryMapSectionId(sectionKey);
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function renderManuscriptStudioView() {
  const container = $('#manuscript-view');
  if (!container) return;
  container.innerHTML = renderManuscriptStudio();
  bindManuscriptEvents(container);
}

export function renderStoryMapView() {
  const container = $('#storymap-view');
  if (!container) return;
  container.innerHTML = renderStoryMap();
  bindStoryMapEvents(container);
}

export default {
  renderManuscriptStudioView,
  renderStoryMapView,
  focusStoryMapSection
};
