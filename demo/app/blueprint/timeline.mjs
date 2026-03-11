/**
 * SCRIPTA Demo - Timeline Component
 * 
 * Visual timeline for narrative beats with drag-and-drop.
 */

import state from '../state.mjs';
import { updateBeatMapping, setBlueprintArc } from '../state.mjs';
import { genId } from '../utils.mjs';
import { generateCNL } from '../cnl.mjs';
import { getArcs, getArc, getCurrentArcBeats, getTensionAtPosition } from './blueprint-state.mjs';
import { renderTensionCurve } from './tension-curve.mjs';
import { initSubplots, render as renderSubplots } from './subplots.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';

let draggedBeat = null;
let timelineContainer = null;

const ARC_ORDER = [
  'heros_journey',
  'three_act',
  'save_the_cat',
  'story_circle',
  'kishotenketsu',
  'five_act',
  'seven_point'
];

const BEAT_ICONS = {
  ordinary_world: '🏠',
  call_to_adventure: '📣',
  refusal: '🛑',
  meeting_mentor: '🧙',
  crossing_threshold: '🚪',
  tests_allies_enemies: '🧭',
  approach_cave: '🌒',
  ordeal: '⚔',
  reward: '👑',
  road_back: '🛤',
  resurrection: '🔥',
  return_elixir: '🏺',
  hook: '🎣',
  setup: '🧩',
  inciting_incident: '💥',
  plot_point_1: '➡',
  rising_action: '📈',
  midpoint: '🎯',
  plot_point_2: '🪤',
  climax: '🌋',
  resolution: '✨',
  opening_image: '🖼',
  theme_stated: '🗝',
  catalyst: '⚡',
  debate: '💭',
  break_into_two: '🚀',
  b_story: '🫶',
  fun_and_games: '🎭',
  bad_guys_close_in: '🕸',
  all_is_lost: '🕯',
  dark_night: '🌌',
  break_into_three: '🔓',
  finale: '🏁',
  final_image: '🌅',
  you: '🙂',
  need: '💡',
  go: '🛫',
  search: '🔎',
  find: '💎',
  take: '💸',
  return: '↩',
  change: '🦋',
  ki: '🌱',
  sho: '🪴',
  ten: '🌀',
  ketsu: '🌕',
  exposition: '📖',
  falling_action: '📉',
  denouement: '🕊',
  plot_turn_1: '🧱',
  pinch_1: '📌',
  pinch_2: '📍',
  plot_turn_2: '🧠'
};

/**
 * Initialize the timeline component
 * @param {HTMLElement} container - Container element
 */
export function initTimeline(container) {
  timelineContainer = container;
  render();
}

/**
 * Render the timeline
 */
export function render() {
  if (!timelineContainer) return;
  
  const arcKey = state.project.blueprint.arc || state.project.selectedArc || 'heros_journey';
  const arc = getArc(arcKey);
  const beats = arc?.beats || [];
  const mappings = state.project.blueprint.beatMappings;
  const emotionalArc = state.project.libraries.emotionalArc || [];
  
  // Calculate minimum width needed - at least 120px per beat to avoid overlap
  const minWidthPerBeat = 120;
  const minTrackWidth = Math.max(800, beats.length * minWidthPerBeat);
  
  timelineContainer.innerHTML = `
    <section class="blueprint-intro">
      <h3>Blueprint</h3>
      <p>
        Design the narrative architecture in one place: choose the arc, review beats and positions,
        map beats to chapters, shape tension, and define emotional progression.
      </p>
    </section>

    <div class="timeline-header">
      <label>Narrative Arc:</label>
      <select id="arc-select" class="arc-select">
        ${renderArcOptions()}
      </select>
      <span class="timeline-info">${beats.length} beats</span>
    </div>

    <section class="blueprint-focus-fields">
      <div class="focus-field">
        <label for="bp-key-event">Key Event</label>
        <input
          id="bp-key-event"
          class="form-input"
          type="text"
          placeholder="e.g., The treaty is broken during the coronation"
          value="${escapeAttr(state.project.blueprint.keyEvent || '')}">
      </div>
      <div class="focus-field">
        <label for="bp-primary-conflict">Primary Conflict</label>
        <input
          id="bp-primary-conflict"
          class="form-input"
          type="text"
          placeholder="e.g., Protagonist vs system"
          value="${escapeAttr(state.project.blueprint.primaryConflict || '')}">
      </div>
    </section>

    <div class="beat-mappings" id="beat-mappings">
      <h4>Beat Mappings</h4>
      ${renderMappingsList(beats, mappings)}
    </div>

    <section class="timeline-guide" aria-label="Timeline guide">
      <div class="timeline-guide-title">How to read this timeline</div>
      <div class="timeline-guide-items">
        <span><i class="guide-dot" aria-hidden="true"></i> Icon marker = narrative beat identity</span>
        <span><i class="guide-pill" aria-hidden="true"></i> Beat name + % = placement in story timeline</span>
        <span><strong>Mapped chapter tag</strong> = current chapter assignment</span>
        <span><strong>0%</strong> opening, <strong>50%</strong> midpoint, <strong>100%</strong> ending</span>
      </div>
      <div class="timeline-guide-tension" aria-label="Tension legend">
        <span class="tension-legend-item"><strong>Tension scale:</strong></span>
        <span class="tension-legend-item"><i class="tension-legend-dot tension-1" aria-hidden="true"></i>1 Low</span>
        <span class="tension-legend-item"><i class="tension-legend-dot tension-2" aria-hidden="true"></i>2 Building</span>
        <span class="tension-legend-item"><i class="tension-legend-dot tension-3" aria-hidden="true"></i>3 Medium</span>
        <span class="tension-legend-item"><i class="tension-legend-dot tension-4" aria-hidden="true"></i>4 High</span>
        <span class="tension-legend-item"><i class="tension-legend-dot tension-5" aria-hidden="true"></i>5 Peak</span>
      </div>
    </section>
    
    <div class="timeline-scroll-container">
      <div class="timeline-track-wrapper" style="min-width: ${minTrackWidth}px;">
        <div class="timeline-track" id="timeline-track">
          ${beats.map(beat => renderBeat(beat, mappings)).join('')}
        </div>
        <div class="timeline-markers">
          ${renderTimeMarkers()}
        </div>
      </div>
    </div>

    <div class="arc-timeline">
      <div class="arc-timeline-header">
        <span class="arc-timeline-title">Story Beats (${beats.length})</span>
      </div>
      <div class="arc-beats">
        ${beats.map(beat => {
          const saved = emotionalArc.find(item => item.beatKey === beat.key);
          const selectedMood = saved?.moodPreset || '';
          const progress = Math.round((beat.position || 0) * 100);
          return `
            <div class="arc-beat" data-beat="${beat.key}">
              <div class="arc-beat-topline">
                <span class="arc-beat-icon" aria-hidden="true">${getBeatIcon(beat)}</span>
                <div class="arc-beat-heading">
                  <div class="arc-beat-label">${beat.label}</div>
                  <div class="arc-beat-position">${progress}% position</div>
                </div>
              </div>
              <div class="arc-beat-desc">${beat.desc || ''}</div>
              <div class="arc-beat-mood">
                <label class="arc-beat-mood-label" for="arc-mood-${beat.key}">Mood</label>
                <select class="arc-mood-select" id="arc-mood-${beat.key}" data-beat="${beat.key}">
                  <option value="">-- Select mood --</option>
                  ${Object.entries(VOCAB.MOOD_PRESETS || {}).map(([key, mood]) => `
                    <option value="${key}" ${selectedMood === key ? 'selected' : ''}>${mood.label}</option>
                  `).join('')}
                </select>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="arc-emotional-section" id="arc-emotional-section">
      <h4>Emotional Progression</h4>
      <p class="arc-emotional-note">
        Mood is configured in Story Beats above. This chart shows emotional intensity across the arc, aligned with beat positions.
      </p>
      ${renderEmotionalProgression(beats, emotionalArc)}
    </div>
    
    <div class="tension-curve-container" id="tension-curve">
      <!-- Tension curve will be rendered here -->
    </div>
    
    <div class="subplots-section" id="subplots-container">
      <!-- Subplots will be rendered here -->
    </div>
  `;
  
  attachEventListeners();
  renderTensionCurve(document.getElementById('tension-curve'));
  
  // Initialize subplots component
  const subplotsContainer = document.getElementById('subplots-container');
  if (subplotsContainer) {
    initSubplots(subplotsContainer);
  }
}

/**
 * Render arc selection options
 */
function renderArcOptions() {
  const arcs = getArcs();
  const selected = state.project.blueprint.arc || state.project.selectedArc;

  return ARC_ORDER
    .map(key => [key, arcs[key]])
    .filter(([, arc]) => arc && arc.scope === 'work')
    .map(([key, arc]) => `
      <option value="${key}" ${key === selected ? 'selected' : ''}>
        ${arc.label} (${arc.beats?.length || 0} beats)
      </option>
    `).join('');
}

/**
 * Render a single beat on the timeline
 */
function renderBeat(beat, mappings) {
  const mapping = mappings.find(m => m.beatKey === beat.key);
  const chapterId = mapping?.chapterId || getSuggestedChapterIdForBeat(beat);
  const left = (beat.position * 100).toFixed(1);
  const progress = Math.round((beat.position || 0) * 100);
  const tension = mapping?.tension || getTensionAtPosition(beat.position);
  const isMapped = !!chapterId;
  
  return `
    <div class="timeline-beat ${isMapped ? 'mapped' : ''}" 
         data-beat="${beat.key}"
         data-position="${beat.position}"
         style="left: ${left}%"
         draggable="true"
         title="${beat.label} (${progress}%)${beat.desc ? ` - ${beat.desc}` : ''}">
      <div class="beat-marker tension-${tension}">
        <span class="beat-marker-icon" aria-hidden="true">${getBeatIcon(beat)}</span>
      </div>
      <div class="beat-label">${beat.label}</div>
      <div class="beat-progress">${progress}%</div>
      ${isMapped ? `<div class="beat-mapping">${getFriendlyChapterLabel(chapterId)}</div>` : ''}
    </div>
  `;
}

function getBeatIcon(beat) {
  return BEAT_ICONS[beat?.key] || '✦';
}

function getMoodIntensity(moodPreset) {
  const preset = (VOCAB.MOOD_PRESETS || {})[moodPreset];
  if (!preset?.emotions) return 2.5;
  const values = Object.values(preset.emotions).map(value => Number(value) || 0).filter(value => value > 0);
  if (!values.length) return 2.5;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.min(5, Math.max(1, average + 1));
}

function renderEmotionalProgression(beats, emotionalArc) {
  if (!beats.length) {
    return `<div class="arc-emotional-empty">No beats available for this arc.</div>`;
  }

  const width = 960;
  const height = 180;
  const paddingX = 28;
  const paddingTop = 20;
  const paddingBottom = 34;
  const usableHeight = height - paddingTop - paddingBottom;
  const firstPosition = Number.isFinite(beats[0]?.position) ? beats[0].position : 0;
  const lastPosition = Number.isFinite(beats[beats.length - 1]?.position) ? beats[beats.length - 1].position : 1;
  const positionSpan = Math.max(0.001, lastPosition - firstPosition);

  const points = beats.map(beat => {
    const saved = emotionalArc.find(item => item.beatKey === beat.key);
    const preset = saved ? (VOCAB.MOOD_PRESETS || {})[saved.moodPreset] : null;
    const intensity = getMoodIntensity(saved?.moodPreset);
    const normalizedPosition = ((beat.position || 0) - firstPosition) / positionSpan;
    const x = paddingX + normalizedPosition * (width - paddingX * 2);
    const y = paddingTop + (usableHeight - ((intensity - 1) / 4) * usableHeight);
    return {
      beat,
      x,
      y,
      intensity,
      normalizedPosition,
      moodLabel: preset?.label || 'Not set',
      color: preset?.color || 'rgba(156, 173, 229, 0.88)'
    };
  });

  const pathD = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');

  return `
    <div class="arc-emotional-chart">
      <svg viewBox="0 0 ${width} ${height}" class="arc-emotional-svg" role="img" aria-label="Emotional progression line chart">
        <path d="${pathD}" class="arc-emotional-line"></path>
        ${points.map(point => `
          <g class="arc-emotional-node" data-beat="${point.beat.key}" transform="translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})">
            <title>${escapeAttr(`${point.beat.label} • ${Math.round((point.beat.position || 0) * 100)}% • ${point.moodLabel} • Intensity ${point.intensity.toFixed(1)}`)}</title>
            <circle r="6" fill="${point.color}" class="arc-emotional-dot"></circle>
          </g>
        `).join('')}
        ${points.map(point => `
          <g class="arc-emotional-guide" transform="translate(${point.x.toFixed(1)} 0)">
            <line y1="${paddingTop}" y2="${height - paddingBottom}" class="arc-emotional-guide-line"></line>
            <text y="${height - 10}" class="arc-emotional-axis-label">${Math.round((point.beat.position || 0) * 100)}%</text>
          </g>
        `).join('')}
      </svg>
      <div class="arc-emotional-legend">
        ${points.map(point => `
          <div class="arc-emotional-legend-item" data-beat="${point.beat.key}" title="${escapeAttr(`${point.beat.label}: ${point.moodLabel}`)}">
            <span class="legend-beat-icon">${getBeatIcon(point.beat)}</span>
            <span class="legend-beat-label">${point.beat.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render time markers (0%, 25%, 50%, 75%, 100%)
 */
function renderTimeMarkers() {
  return [0, 0.25, 0.5, 0.75, 1].map(pos => `
    <div class="time-marker" style="left: ${pos * 100}%">
      <span>${Math.round(pos * 100)}%</span>
    </div>
  `).join('');
}

/**
 * Render beat mappings list
 */
function renderMappingsList(beats, mappings) {
  return `
    <div class="mappings-list">
      ${beats.map(beat => {
        const mapping = mappings.find(m => m.beatKey === beat.key);
        const chapterId = mapping?.chapterId || getSuggestedChapterIdForBeat(beat);
        return `
          <div class="mapping-row" data-beat="${beat.key}">
            <span class="mapping-beat">${beat.label}</span>
            <span class="mapping-arrow">→</span>
            <select class="mapping-chapter" data-beat="${beat.key}">
              <option value="">-- Select Chapter --</option>
              ${renderChapterOptions(chapterId)}
            </select>
            <input type="number" class="mapping-tension" 
                   data-beat="${beat.key}"
                   min="1" max="5" 
                   value="${mapping?.tension || ''}"
                   placeholder="T">
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Collect chapter candidates from structure, including legacy/mixed nodes.
 */
function collectChapters(node, chapters = [], parentType = null) {
  if (!node) return chapters;

  const nodeName = String(node.name || '').trim();
  const nodeTitle = String(node.title || '').trim();
  const hasSceneChildren = Array.isArray(node.children) && node.children.some(child => child?.type === 'scene');
  const looksLikeChapter = /^(ch|chapter)\b/i.test(nodeName) || /^(ch|chapter)\b/i.test(nodeTitle);
  const isChapterNode = node.type === 'chapter' || (parentType === 'book' && (hasSceneChildren || looksLikeChapter));

  if (isChapterNode) {
    chapters.push(node);
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectChapters(child, chapters, node.type || null);
    }
  }

  return chapters;
}

function chapterSortValue(chapter) {
  const label = String(chapter.name || chapter.title || '').trim();
  const numberMatch = label.match(/(\d+)/);
  if (numberMatch) return parseInt(numberMatch[1], 10);
  return Number.POSITIVE_INFINITY;
}

function getChapterLabelFromNode(chapter, fallbackLabel) {
  const raw = String(chapter?.name || chapter?.title || '').trim();
  const rawLooksLikeId = /^ch_[a-z0-9]+$/i.test(raw);
  if (raw && !rawLooksLikeId) return raw;
  return fallbackLabel;
}

function buildOrderedChapters() {
  const structure = state.project.structure;
  if (!structure) return [];
  const chapterCandidates = collectChapters(structure);
  const chaptersById = new Map();
  for (const chapter of chapterCandidates) {
    if (!chapter?.id || chaptersById.has(chapter.id)) continue;
    chaptersById.set(chapter.id, chapter);
  }
  const chapters = Array.from(chaptersById.values())
    .sort((a, b) => chapterSortValue(a) - chapterSortValue(b));

  if (chapters.length > 0) return chapters;
  return Array.isArray(structure.children) ? structure.children : [];
}

function getFriendlyChapterLabel(chapterId) {
  if (!chapterId) return '';
  const chapters = buildOrderedChapters();
  const idx = chapters.findIndex(ch => ch?.id === chapterId);
  if (idx >= 0) {
    const fallback = `Chapter ${idx + 1}`;
    return getChapterLabelFromNode(chapters[idx], fallback);
  }
  const fallbackFromId = /^ch_[a-z0-9]+$/i.test(chapterId) ? 'Chapter' : chapterId;
  return fallbackFromId;
}

function getSuggestedChapterIdForBeat(beat) {
  const chapters = buildOrderedChapters();
  if (chapters.length === 0) return '';
  const position = Number.isFinite(beat?.position) ? beat.position : 0;
  const index = Math.max(0, Math.min(chapters.length - 1, Math.floor(position * chapters.length)));
  return chapters[index]?.id || '';
}

/**
 * Render chapter options from structure
 */
function renderChapterOptions(selectedId) {
  const structure = state.project.structure;
  if (!structure) return '<option value="">No structure</option>';

  const chapters = buildOrderedChapters();
  if (chapters.length === 0) return '<option value="">No chapters</option>';

  return chapters.map(ch => `
    <option value="${ch.id}" ${ch.id === selectedId ? 'selected' : ''}>
      ${getFriendlyChapterLabel(ch.id)}
    </option>
  `).join('');
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  // Arc selection
  const arcSelect = document.getElementById('arc-select');
  if (arcSelect) {
    arcSelect.addEventListener('change', (e) => {
      setBlueprintArc(e.target.value);
      generateCNL();
      render();
    });
  }

  const keyEventInput = document.getElementById('bp-key-event');
  if (keyEventInput) {
    keyEventInput.addEventListener('input', (e) => {
      state.project.blueprint.keyEvent = e.target.value;
    });
  }

  const primaryConflictInput = document.getElementById('bp-primary-conflict');
  if (primaryConflictInput) {
    primaryConflictInput.addEventListener('input', (e) => {
      state.project.blueprint.primaryConflict = e.target.value;
    });
  }

  // Drag and drop for beats
  const track = document.getElementById('timeline-track');
  if (track) {
    track.addEventListener('dragstart', handleDragStart);
    track.addEventListener('dragend', handleDragEnd);
    track.addEventListener('dragover', handleDragOver);
    track.addEventListener('drop', handleDrop);
  }
  
  // Chapter mapping changes
  document.querySelectorAll('.mapping-chapter').forEach(select => {
    select.addEventListener('change', (e) => {
      const beatKey = e.target.dataset.beat;
      updateBeatMapping(beatKey, { chapterId: e.target.value });
      render();
    });
  });
  
  // Tension changes
  document.querySelectorAll('.mapping-tension').forEach(input => {
    input.addEventListener('change', (e) => {
      const beatKey = e.target.dataset.beat;
      const tension = parseInt(e.target.value);
      if (tension >= 1 && tension <= 5) {
        updateBeatMapping(beatKey, { tension });
        render();
      }
    });
  });

  document.querySelectorAll('.arc-mood-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const beatKey = e.target.dataset.beat;
      const moodPreset = e.target.value;
      const emotionalArc = state.project.libraries.emotionalArc || [];
      const existingIndex = emotionalArc.findIndex(item => item.beatKey === beatKey);

      if (existingIndex >= 0) {
        if (moodPreset) {
          emotionalArc[existingIndex].moodPreset = moodPreset;
        } else {
          emotionalArc.splice(existingIndex, 1);
        }
      } else if (moodPreset) {
        emotionalArc.push({ id: genId('emo'), beatKey, moodPreset });
      }

      state.project.libraries.emotionalArc = emotionalArc;
      render();
    });
  });

  bindBeatHoverSync();
}

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Handle drag start
 */
function handleDragStart(e) {
  const beatEl = e.target.closest('.timeline-beat');
  if (!beatEl) return;
  
  draggedBeat = beatEl.dataset.beat;
  beatEl.classList.add('dragging');
}

/**
 * Handle drag end
 */
function handleDragEnd(e) {
  const beatEl = e.target.closest('.timeline-beat');
  if (beatEl) beatEl.classList.remove('dragging');
  draggedBeat = null;
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
  e.preventDefault();
}

/**
 * Handle drop - update beat position
 */
function handleDrop(e) {
  e.preventDefault();
  if (!draggedBeat) return;
  
  const track = document.getElementById('timeline-track');
  const rect = track.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const newPosition = Math.max(0, Math.min(1, x / rect.width));
  
  // Note: This updates visual position, but narrative beats have fixed positions
  // In a full implementation, this could reorder beats or show a warning
  console.log(`Beat ${draggedBeat} dropped at position ${newPosition.toFixed(2)}`);
}

function bindBeatHoverSync() {
  const interactiveSelector = '.timeline-beat, .arc-beat, .mapping-row, .arc-emotional-node, .arc-emotional-legend-item';
  const items = Array.from(document.querySelectorAll(interactiveSelector));
  if (!items.length) return;

  const setHoveredBeat = (beatKey) => {
    items.forEach(element => {
      element.classList.toggle('is-hovered', Boolean(beatKey) && element.dataset.beat === beatKey);
    });
  };

  const clearHoveredBeat = () => {
    items.forEach(element => element.classList.remove('is-hovered'));
  };

  items.forEach(element => {
    element.addEventListener('mouseenter', () => setHoveredBeat(element.dataset.beat || ''));
    element.addEventListener('mouseleave', clearHoveredBeat);
    element.addEventListener('focusin', () => setHoveredBeat(element.dataset.beat || ''));
    element.addEventListener('focusout', clearHoveredBeat);
  });
}

export default {
  initTimeline,
  render
};
