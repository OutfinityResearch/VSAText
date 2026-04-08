/**
 * SCRIPTA Demo - Manuscript Studio + Story Map
 */

import { state } from './state.mjs';
import { $ } from './utils.mjs';
import { generateCNL } from './cnl.mjs';
import {
  bindManuscriptEvents,
  computeChapterSummary,
  getArcStructuredManuscript,
  getChaptersForManuscript,
  renderManuscriptStudio
} from './writing-studio-manuscript.mjs';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getBookSummary() {
  const chapters = getChaptersForManuscript();
  if (!chapters.length) return 'No chapters yet.';
  const summaryLines = chapters.map((chapter, idx) => {
    const scenes = chapter.source === 'generated-story'
      ? 1
      : (chapter.children || []).filter(child => child.type === 'scene').length;
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
  const arcStructured = getArcStructuredManuscript();
  return `
    <div class="storymap-flow">
      ${arcStructured.phases.map(group => `
        <section class="storymap-phase-group">
          <div class="storymap-phase-title">${esc(group.label)}</div>
          ${group.chapters.map(({ chapter, index }) => `
            <div class="storymap-flow-item">
              <div class="flow-title">Chapter ${index + 1}: ${esc(chapter.title || chapter.name || 'Untitled')}</div>
              <div class="flow-text">${esc(computeChapterSummary(chapter))}</div>
            </div>
          `).join('')}
        </section>
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
  bindManuscriptEvents(container, renderManuscriptStudioView);
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
