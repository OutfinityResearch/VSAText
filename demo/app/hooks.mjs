/**
 * SCRIPTA Demo - Hooks View
 *
 * Dedicated workspace for opening and mid-story hooks.
 */

import state, { updateBeatMapping } from './state.mjs';
import { $, genId } from './utils.mjs';
import { getCurrentArcBeats } from './blueprint/blueprint-state.mjs';
import { findNode, findParent, renderTree } from './tree.mjs';
import { generateCNL } from './cnl.mjs';

const HOOK_TYPE_OPTIONS = [
  'Action',
  'Mystery',
  'Emotion',
  'Conflict',
  'Narrative voice',
  'Shocking statement',
  'Evocative description'
];

const MOOD_OPTIONS = [
  'Tense',
  'Mysterious',
  'Hopeful',
  'Romantic',
  'Dangerous',
  'Melancholic',
  'Suspenseful',
  'Calm'
];

const THEME_OPTIONS = [
  'Discovery',
  'Conflict',
  'Adventure',
  'Suspense',
  'Romance',
  'Betrayal',
  'Redemption',
  'Survival'
];

const TECHNIQUE_OPTIONS = [
  'In medias res',
  'Mysterious question',
  'Sudden conflict',
  'Intriguing character',
  'Shocking statement',
  'Evocative description',
  'Distinct narrative voice'
];

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function humanize(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

function createHookEntry() {
  return {
    id: genId('hook'),
    hookText: '',
    hookType: '',
    emotionalIntensity: 3,
    mainCharacterId: '',
    keyObjectOrEvent: '',
    sceneGoal: '',
    sceneMood: '',
    sceneTheme: '',
    hookTechniques: [],
    curiositySeeds: '',
    conflictStakes: '',
    targetSceneId: '',
    targetBeatKey: ''
  };
}

function ensureHooksState() {
  if (!state.project.blueprint || typeof state.project.blueprint !== 'object') {
    state.project.blueprint = {};
  }

  if (!state.project.blueprint.hooks || typeof state.project.blueprint.hooks !== 'object') {
    state.project.blueprint.hooks = {};
  }

  const hooks = state.project.blueprint.hooks;
  if (!hooks.opening || typeof hooks.opening !== 'object') hooks.opening = createHookEntry();
  if (!Array.isArray(hooks.mid)) hooks.mid = [];

  hooks.opening.hookTechniques = Array.isArray(hooks.opening.hookTechniques) ? hooks.opening.hookTechniques : [];
  hooks.mid = hooks.mid.map((entry) => ({
    ...createHookEntry(),
    ...entry,
    id: entry.id || genId('hook'),
    hookTechniques: Array.isArray(entry.hookTechniques) ? entry.hookTechniques : []
  }));

  return hooks;
}

function collectScenes(node = state.project.structure, chapterId = null, acc = []) {
  if (!node) return acc;
  const currentChapterId = node.type === 'chapter' ? node.id : chapterId;
  if (node.type === 'scene') {
    acc.push({
      id: node.id,
      name: node.name || node.title || node.id,
      chapterId: currentChapterId
    });
  }
  (node.children || []).forEach(child => collectScenes(child, currentChapterId, acc));
  return acc;
}

function getBeatOptions() {
  const beats = getCurrentArcBeats() || [];
  return beats.map(beat => ({
    key: beat.key,
    label: beat.label || humanize(beat.key)
  }));
}

function renderCharacterOptions(selectedId) {
  const chars = state.project.libraries.characters || [];
  return chars.map(c => `<option value="${esc(c.id)}" ${selectedId === c.id ? 'selected' : ''}>${esc(c.name || c.id)}</option>`).join('');
}

function renderOptions(options, selected) {
  return options.map(option => `<option value="${esc(option)}" ${selected === option ? 'selected' : ''}>${esc(option)}</option>`).join('');
}

function renderTechniqueChecklist(mode, hookId, selected) {
  const selectedSet = new Set(selected || []);
  return `
    <div class="hooks-techniques">
      ${TECHNIQUE_OPTIONS.map(technique => `
        <label class="hooks-technique-item">
          <input
            type="checkbox"
            ${selectedSet.has(technique) ? 'checked' : ''}
            onchange="window.hooksToggleTechnique('${mode}','${hookId}','${esc(technique)}', this.checked)"
          >
          <span>${esc(technique)}</span>
        </label>
      `).join('')}
    </div>
  `;
}

function renderSceneOptions(selectedSceneId) {
  const scenes = collectScenes();
  return scenes.map(scene => `<option value="${esc(scene.id)}" ${selectedSceneId === scene.id ? 'selected' : ''}>${esc(`${scene.name} (${scene.chapterId || 'chapter'})`)}</option>`).join('');
}

function renderBeatOptions(selectedBeatKey) {
  return getBeatOptions()
    .map(beat => `<option value="${esc(beat.key)}" ${selectedBeatKey === beat.key ? 'selected' : ''}>${esc(beat.label)}</option>`)
    .join('');
}

function renderHookFields(mode, hook, isOpening = false) {
  const hookId = hook.id || 'opening';
  return `
    <div class="hooks-form-grid">
      <label class="hooks-field hooks-field-wide">
        <span>Hook Text</span>
        <textarea rows="3" oninput="window.hooksUpdateField('${mode}','${hookId}','hookText', this.value)" placeholder="Write the opening line or hook statement...">${esc(hook.hookText || '')}</textarea>
      </label>
      <label class="hooks-field">
        <span>Hook Type</span>
        <select onchange="window.hooksUpdateField('${mode}','${hookId}','hookType', this.value)">
          <option value="">Select type</option>
          ${renderOptions(HOOK_TYPE_OPTIONS, hook.hookType)}
        </select>
      </label>
      <label class="hooks-field">
        <span>Emotional Intensity</span>
        <input type="range" min="1" max="5" value="${Number(hook.emotionalIntensity) || 3}" oninput="window.hooksUpdateField('${mode}','${hookId}','emotionalIntensity', this.value); this.nextElementSibling.textContent = this.value + ' / 5';">
        <small>${Number(hook.emotionalIntensity) || 3} / 5</small>
      </label>
      <label class="hooks-field">
        <span>Main Character</span>
        <select onchange="window.hooksUpdateField('${mode}','${hookId}','mainCharacterId', this.value)">
          <option value="">Select character</option>
          ${renderCharacterOptions(hook.mainCharacterId)}
        </select>
      </label>
      <label class="hooks-field">
        <span>Key Object / Event</span>
        <input type="text" value="${esc(hook.keyObjectOrEvent || '')}" oninput="window.hooksUpdateField('${mode}','${hookId}','keyObjectOrEvent', this.value)" placeholder="Trigger object or event...">
      </label>
      <label class="hooks-field">
        <span>Scene Goal</span>
        <input type="text" value="${esc(hook.sceneGoal || '')}" oninput="window.hooksUpdateField('${mode}','${hookId}','sceneGoal', this.value)" placeholder="Immediate objective in scene...">
      </label>
      <label class="hooks-field">
        <span>Scene Mood</span>
        <select onchange="window.hooksUpdateField('${mode}','${hookId}','sceneMood', this.value)">
          <option value="">Select mood</option>
          ${renderOptions(MOOD_OPTIONS, hook.sceneMood)}
        </select>
      </label>
      <label class="hooks-field">
        <span>Scene Theme</span>
        <select onchange="window.hooksUpdateField('${mode}','${hookId}','sceneTheme', this.value)">
          <option value="">Select theme</option>
          ${renderOptions(THEME_OPTIONS, hook.sceneTheme)}
        </select>
      </label>
      <label class="hooks-field hooks-field-wide">
        <span>Hook Technique</span>
        ${renderTechniqueChecklist(mode, hookId, hook.hookTechniques)}
      </label>
      <label class="hooks-field hooks-field-wide">
        <span>Curiosity Seeds</span>
        <input type="text" value="${esc(hook.curiositySeeds || '')}" oninput="window.hooksUpdateField('${mode}','${hookId}','curiositySeeds', this.value)" placeholder="Subtle mysteries and clues...">
      </label>
      <label class="hooks-field hooks-field-wide">
        <span>Conflict / Stakes</span>
        <input type="text" value="${esc(hook.conflictStakes || '')}" oninput="window.hooksUpdateField('${mode}','${hookId}','conflictStakes', this.value)" placeholder="Immediate risk, pressure, or danger...">
      </label>
      ${isOpening ? `
        <div class="hooks-apply-note hooks-field-wide">
          Opening Hook propagates to first available scene and first beat.
        </div>
      ` : `
        <label class="hooks-field">
          <span>Target Scene</span>
          <select onchange="window.hooksUpdateField('${mode}','${hookId}','targetSceneId', this.value)">
            <option value="">Select scene</option>
            ${renderSceneOptions(hook.targetSceneId)}
          </select>
        </label>
        <label class="hooks-field">
          <span>Target Beat</span>
          <select onchange="window.hooksUpdateField('${mode}','${hookId}','targetBeatKey', this.value)">
            <option value="">Select beat</option>
            ${renderBeatOptions(hook.targetBeatKey)}
          </select>
        </label>
      `}
    </div>
    <div class="hooks-actions">
      <button class="btn" type="button" onclick="window.hooksSave('${mode}','${hookId}')">Save Hook</button>
      <button class="btn primary" type="button" onclick="window.hooksApply('${mode}','${hookId}')">Apply to Scene/Beat</button>
    </div>
  `;
}

function renderOpeningView() {
  const hooks = ensureHooksState();
  return `
    <div class="hooks-layout">
      <section class="hooks-intro">
        <h2>Opening Hook</h2>
        <p>Configure the first narrative hook. Apply updates to the first scene and first beat.</p>
      </section>
      <section class="hooks-card">
        ${renderHookFields('opening', hooks.opening, true)}
      </section>
    </div>
  `;
}

function renderMidView() {
  const hooks = ensureHooksState();
  return `
    <div class="hooks-layout">
      <section class="hooks-intro">
        <h2>Mid-Story Hooks</h2>
        <p>Create and test multiple hooks for current story progression.</p>
        <button class="btn" type="button" onclick="window.hooksAddMid()">+ Add Mid Hook</button>
      </section>
      <div class="hooks-mid-list">
        ${hooks.mid.length ? hooks.mid.map(entry => `
          <section class="hooks-card">
            <div class="hooks-card-head">
              <h3>${esc(entry.hookText || 'Untitled Mid Hook')}</h3>
              <button class="hooks-delete" type="button" onclick="window.hooksDeleteMid('${entry.id}')">×</button>
            </div>
            ${renderHookFields('mid', entry, false)}
          </section>
        `).join('') : '<div class="hooks-empty">No mid-story hooks yet.</div>'}
      </div>
    </div>
  `;
}

function resolveOpeningTargets() {
  const scenes = collectScenes();
  const firstScene = scenes[0] || null;
  const beats = getBeatOptions();
  const firstBeat = beats[0] || null;
  return { firstScene, firstBeat };
}

function applyHookToSceneAndBeat(hook, sceneId, beatKey) {
  const scene = findNode(sceneId);
  const chapter = findParent(sceneId);
  if (!scene || scene.type !== 'scene' || !beatKey) return false;

  scene.goal = hook.sceneGoal || scene.goal || '';
  scene.mood = hook.sceneMood || scene.mood || '';
  scene.theme = hook.sceneTheme || scene.theme || '';

  const mainChar = (state.project.libraries.characters || []).find(c => c.id === hook.mainCharacterId);
  const mappingPayload = {
    chapterId: chapter?.id || null,
    sceneId: scene.id,
    author_text: hook.hookText || '',
    hook_type: hook.hookType || '',
    emotional_intensity: Number(hook.emotionalIntensity) || 3,
    main_character: mainChar?.name || '',
    key_object_or_event: hook.keyObjectOrEvent || '',
    technique: (hook.hookTechniques || []).join(', '),
    curiosity_seeds: hook.curiositySeeds || '',
    stakes: hook.conflictStakes || '',
    hook: {
      text: hook.hookText || '',
      hookType: hook.hookType || '',
      emotionalIntensity: Number(hook.emotionalIntensity) || 3,
      mainCharacterId: hook.mainCharacterId || '',
      keyObjectOrEvent: hook.keyObjectOrEvent || '',
      sceneGoal: hook.sceneGoal || '',
      sceneMood: hook.sceneMood || '',
      sceneTheme: hook.sceneTheme || '',
      techniques: hook.hookTechniques || [],
      curiositySeeds: hook.curiositySeeds || '',
      stakes: hook.conflictStakes || ''
    }
  };

  updateBeatMapping(beatKey, mappingPayload);
  renderTree();
  generateCNL();
  document.dispatchEvent(new CustomEvent('blueprint-changed'));
  return true;
}

export function renderHooksView(mode = 'opening') {
  const container = mode === 'mid' ? $('#hooks-mid-view') : $('#hooks-opening-view');
  if (!container) return;
  ensureHooksState();
  container.innerHTML = mode === 'mid' ? renderMidView() : renderOpeningView();
}

window.hooksUpdateField = (mode, hookId, field, value) => {
  const hooks = ensureHooksState();
  if (mode === 'opening') {
    hooks.opening[field] = value;
    return;
  }
  const target = hooks.mid.find(item => item.id === hookId);
  if (!target) return;
  target[field] = value;
};

window.hooksToggleTechnique = (mode, hookId, technique, checked) => {
  const hooks = ensureHooksState();
  const target = mode === 'opening' ? hooks.opening : hooks.mid.find(item => item.id === hookId);
  if (!target) return;
  const list = Array.isArray(target.hookTechniques) ? target.hookTechniques : [];
  if (checked && !list.includes(technique)) list.push(technique);
  if (!checked) target.hookTechniques = list.filter(item => item !== technique);
  else target.hookTechniques = list;
  renderHooksView(mode === 'opening' ? 'opening' : 'mid');
};

window.hooksSave = (mode, hookId) => {
  ensureHooksState();
  if (mode === 'mid') {
    const hooks = state.project.blueprint.hooks.mid;
    if (!hooks.find(item => item.id === hookId)) return;
  }
  window.showNotification?.('Hook saved', 'success');
};

window.hooksApply = (mode, hookId) => {
  const hooks = ensureHooksState();
  let hook = null;
  let sceneId = '';
  let beatKey = '';

  if (mode === 'opening') {
    hook = hooks.opening;
    const targets = resolveOpeningTargets();
    sceneId = targets.firstScene?.id || '';
    beatKey = targets.firstBeat?.key || '';
  } else {
    hook = hooks.mid.find(item => item.id === hookId);
    sceneId = hook?.targetSceneId || '';
    beatKey = hook?.targetBeatKey || '';
  }

  if (!hook) return;
  if (!sceneId || !beatKey) {
    window.showNotification?.('Select scene and beat before applying hook', 'error');
    return;
  }

  const ok = applyHookToSceneAndBeat(hook, sceneId, beatKey);
  if (!ok) {
    window.showNotification?.('Could not apply hook to scene/beat', 'error');
    return;
  }
  window.showNotification?.('Hook applied to scene and beat', 'success');
  renderHooksView(mode === 'opening' ? 'opening' : 'mid');
};

window.hooksAddMid = () => {
  const hooks = ensureHooksState();
  hooks.mid.push(createHookEntry());
  renderHooksView('mid');
};

window.hooksDeleteMid = (hookId) => {
  const hooks = ensureHooksState();
  hooks.mid = hooks.mid.filter(item => item.id !== hookId);
  renderHooksView('mid');
};

export default { renderHooksView };
