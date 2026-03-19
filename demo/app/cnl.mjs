/**
 * SCRIPTA Demo - CNL Generation
 *
 * UI wrapper for CNL generation using SDK serializer.
 * Handles edit mode, import/export, and DOM updates.
 */

import { state } from './state.mjs';
import { $ } from './utils.mjs';
import { serializeToCNL } from '../../src/services/cnl-serializer.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';
import { refreshAllViews, loadCNLIntoState } from './generation/generation-utils.mjs';
import { cnlToProjectState } from './generation/cnl-roundtrip.mjs';
import { updateGenerateButton } from './generation/generation-improve.mjs';

let isEditMode = false;
let cnlViewMode = 'formatted';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function humanizeKey(value) {
  const text = String(value || '').trim();
  if (!text) return 'N/A';
  return text
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, m => m.toUpperCase());
}

function uniqList(values) {
  const seen = new Set();
  const out = [];
  for (const raw of values || []) {
    const item = String(raw || '').trim();
    if (!item) continue;
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function createIdMap(items) {
  const map = new Map();
  for (const item of items || []) {
    if (item?.id) map.set(item.id, item);
  }
  return map;
}

function collectChapters(node, chapters = []) {
  if (!node) return chapters;
  if (node.type === 'chapter') {
    chapters.push(node);
  }
  for (const child of node.children || []) {
    collectChapters(child, chapters);
  }
  return chapters;
}

function sceneTypeByIndex(index, total) {
  if (index === 0) return 'Start';
  if (index === total - 1) return 'End';
  return 'Intermediary';
}

function buildSceneIndex(project) {
  const bySceneId = new Map();

  const chapters = collectChapters(project?.structure);
  for (const chapter of chapters) {
    for (const scene of chapter.children || []) {
      if (scene?.type !== 'scene') continue;
      bySceneId.set(scene.id, { chapter, scene });
    }
  }

  return { bySceneId, chapters };
}

function getRelationshipsForCharacter(characterId, relationships, charactersById) {
  const rels = [];
  for (const rel of relationships || []) {
    const fromMatch = rel.fromId === characterId;
    const toMatch = rel.toId === characterId;
    if (!fromMatch && !toMatch) continue;

    const otherId = fromMatch ? rel.toId : rel.fromId;
    const other = charactersById.get(otherId);
    rels.push(`${other?.name || 'Unknown'} (${humanizeKey(rel.type)})`);
  }
  return uniqList(rels);
}

function extractSceneRefs(scene) {
  const refs = {
    characters: [],
    locations: [],
    moods: [],
    objects: [],
    dialogues: []
  };

  for (const child of scene?.children || []) {
    if (!child?.type) continue;
    if (child.type === 'character-ref') refs.characters.push(child.refId || child.name);
    if (child.type === 'location-ref') refs.locations.push(child.refId || child.name);
    if (child.type === 'mood-ref') refs.moods.push(child.refId || child.name);
    if (child.type === 'object-ref') refs.objects.push(child.refId || child.name);
    if (child.type === 'dialogue-ref') refs.dialogues.push(child.refId || child.name);
  }

  return refs;
}

function buildInfoTableRow(field, value) {
  return `<tr><th>${esc(field)}</th><td>${esc(value)}</td></tr>`;
}

function buildTableSection(title, subtitle, headers, rows) {
  return `<section class="cnl-section">
    <div class="cnl-section-head">
      <h3>${esc(title)}</h3>
      ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
    </div>
    <div class="cnl-table-wrap">
      <table class="cnl-table">
        <thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead>
        <tbody>${rows.length ? rows.join('') : `<tr><td colspan="${headers.length}" class="cnl-empty">No data available yet.</td></tr>`}</tbody>
      </table>
    </div>
  </section>`;
}

function buildSceneDescription(scene) {
  const actions = (scene?.children || []).filter(child => child?.type === 'action' && child.actionData);
  if (!actions.length) return '';

  const lines = actions.slice(0, 2).map(actionNode => {
    const data = actionNode.actionData || {};
    const subject = String(data.subject || '').trim();
    const actionKey = String(data.action || '').trim();
    const target = String(data.target || '').trim();
    const actionLabel = VOCAB?.ACTIONS?.[actionKey]?.label || humanizeKey(actionKey).toLowerCase();
    return `${subject} ${actionLabel}${target ? ` ${target}` : ''}`.trim();
  }).filter(Boolean);

  return lines.join('; ');
}

function summarizeHookDetails(hook, charactersById) {
  if (!hook || typeof hook !== 'object') return '-';
  const details = [];
  if (hook.hookText) details.push(`Text: ${hook.hookText}`);
  if (hook.hookType) details.push(`Type: ${hook.hookType}`);
  if (hook.emotionalIntensity) details.push(`Intensity: ${hook.emotionalIntensity}/5`);
  if (hook.mainCharacterId) {
    const characterName = charactersById.get(hook.mainCharacterId)?.name || hook.mainCharacterId;
    details.push(`Main Character: ${characterName}`);
  }
  if (hook.keyObjectOrEvent) details.push(`Key Object/Event: ${hook.keyObjectOrEvent}`);
  if (hook.sceneGoal) details.push(`Scene Goal: ${hook.sceneGoal}`);
  if (hook.sceneMood) details.push(`Scene Mood: ${hook.sceneMood}`);
  if (hook.sceneTheme) details.push(`Scene Theme: ${hook.sceneTheme}`);
  if (Array.isArray(hook.hookTechniques) && hook.hookTechniques.length) details.push(`Technique: ${hook.hookTechniques.join(', ')}`);
  if (hook.curiositySeeds) details.push(`Curiosity Seeds: ${hook.curiositySeeds}`);
  if (hook.conflictStakes) details.push(`Conflict/Stakes: ${hook.conflictStakes}`);
  return details.join(' | ') || '-';
}

function renderCNLVisual(cnlText) {
  const container = $('#cnl-visual');
  if (!container) return;

  let project = state.project || {};
  const normalizedCnlText = String(cnlText || '').trim();
  if (normalizedCnlText) {
    try {
      project = cnlToProjectState(normalizedCnlText, state.project).project || project;
    } catch {
      // Fall back to current project state when the current CNL text cannot be round-tripped.
    }
  }
  const blueprint = project.blueprint || {};
  const libraries = project.libraries || {};

  const characters = libraries.characters || [];
  const relationships = libraries.relationships || [];
  const locations = libraries.locations || [];
  const moods = libraries.moods || [];
  const objects = libraries.objects || [];
  const themes = libraries.themes || [];
  const worldRules = libraries.worldRules || [];
  const worldLayers = libraries.worldLayers || {};
  const dialogues = libraries.dialogues || [];
  const hooks = blueprint.hooks || {};

  const charactersById = createIdMap(characters);
  const locationsById = createIdMap(locations);
  const moodsById = createIdMap(moods);
  const sceneIndex = buildSceneIndex(project);
  const chapters = sceneIndex.chapters;

  const headerRows = [
    buildInfoTableRow('Project Name', project.name || 'Untitled Story'),
    buildInfoTableRow('Narrative Arc', humanizeKey(blueprint.arc || project.selectedArc || 'heros_journey')),
    buildInfoTableRow('Type', 'Auto-generated CNL'),
    buildInfoTableRow('Purpose', 'Blueprint for content generation and metrics verification')
  ];

  const beatRows = (blueprint.beatMappings || []).map(mapping => {
    const sceneRef = sceneIndex.bySceneId.get(mapping.sceneId);
    const sceneLabel = sceneRef
      ? (sceneRef.scene.name || sceneRef.scene.title || sceneRef.scene.id)
      : (mapping.sceneId || mapping.chapterId || 'Unmapped');

    const sceneDescription = buildSceneDescription(sceneRef?.scene);
    const description = mapping.notes || sceneDescription || sceneRef?.scene?.title || '';

    return `<tr>
      <td>${esc(humanizeKey(mapping.beatKey || ''))}</td>
      <td>${esc(sceneLabel)}</td>
      <td>${esc(mapping.tension ?? '')}</td>
      <td>${esc(description || '-')}</td>
    </tr>`;
  });

  const tensionRows = (blueprint.tensionCurve || [])
    .slice()
    .sort((a, b) => Number(a.position || 0) - Number(b.position || 0))
    .map(point => `<tr><td>${esc(point.position)}</td><td>${esc(point.tension)}</td></tr>`);

  const characterRows = characters.map(character => {
    const traits = uniqList(character.traits || []).map(humanizeKey).join(', ') || '-';
    const rels = getRelationshipsForCharacter(character.id, relationships, charactersById).join(', ') || '-';

    return `<tr>
      <td>${esc(character.name || character.id || 'Character')}</td>
      <td>${esc(humanizeKey(character.archetype || 'character'))}</td>
      <td>${esc(traits)}</td>
      <td>${esc(rels)}</td>
    </tr>`;
  });

  const locationMoodMap = new Map();
  for (const chapter of chapters) {
    for (const scene of chapter.children || []) {
      if (scene?.type !== 'scene') continue;
      const refs = extractSceneRefs(scene);
      const locationNames = refs.locations.map(id => locationsById.get(id)?.name || id).filter(Boolean);
      const moodNames = refs.moods.map(id => moodsById.get(id)?.name || id).filter(Boolean);

      for (const locName of locationNames) {
        if (!locationMoodMap.has(locName)) locationMoodMap.set(locName, new Set());
        for (const moodName of moodNames) {
          locationMoodMap.get(locName).add(moodName);
        }
      }
    }
  }

  const locationRows = locations.map(location => {
    const chars = uniqList(location.characteristics || []).map(humanizeKey).join(', ') || '-';
    const moodList = [...(locationMoodMap.get(location.name) || [])].join(', ') || '-';

    return `<tr>
      <td>${esc(location.name || location.id || 'Location')}</td>
      <td>${esc(humanizeKey(location.geography || '-'))}</td>
      <td>${esc(humanizeKey(location.time || '-'))}</td>
      <td>${esc(chars)}</td>
      <td>${esc(moodList)}</td>
    </tr>`;
  });

  const moodRows = moods.map(mood => {
    const emotions = Object.entries(mood.emotions || {})
      .map(([emotion, intensity]) => `${humanizeKey(emotion)} ${intensity}`)
      .join(', ');

    return `<tr>
      <td>${esc(mood.name || mood.id || 'Mood')}</td>
      <td>${esc(emotions || '-')}</td>
    </tr>`;
  });

  const objectRows = objects.map(object => `<tr>
    <td>${esc(object.name || object.id || 'Object')}</td>
    <td>${esc(humanizeKey(object.objectType || 'object'))}</td>
    <td>${esc(humanizeKey(object.significance || '-'))}</td>
  </tr>`);

  const themeRows = themes.map((theme, index) => `<tr>
    <td>${esc(theme.name || theme.id || 'Theme')}</td>
    <td>${esc(index === 0 ? 'Primary' : 'Secondary')}</td>
    <td>${esc(humanizeKey(theme.themeKey || '-'))}</td>
  </tr>`);

  const dialogueRows = dialogues.map(dialogue => {
    const speaker = (dialogue.participants || []).find(p => p.role === 'speaker');
    const listener = (dialogue.participants || []).find(p => p.role === 'listener');

    return `<tr>
      <td>${esc(dialogue.id || '-')}</td>
      <td>${esc(humanizeKey(dialogue.beatKey || '-'))}</td>
      <td>${esc(humanizeKey(dialogue.purpose || '-'))}</td>
      <td>${esc(humanizeKey(dialogue.tone || '-'))}</td>
      <td>${esc(dialogue.tension ?? '-')}</td>
      <td>${esc(charactersById.get(speaker?.characterId)?.name || '-')}</td>
      <td>${esc(charactersById.get(listener?.characterId)?.name || '-')}</td>
    </tr>`;
  });

  const hookRows = [];
  if (hooks.opening && typeof hooks.opening === 'object') {
    hookRows.push(`<tr>
      <td>Opening Hook</td>
      <td>${esc(hooks.opening.targetSceneId || 'Auto: first scene')}</td>
      <td>${esc(hooks.opening.targetBeatKey || 'Auto: first beat')}</td>
      <td>${esc(summarizeHookDetails(hooks.opening, charactersById))}</td>
    </tr>`);
  }
  if (Array.isArray(hooks.mid)) {
    hooks.mid.forEach((hook, index) => {
      hookRows.push(`<tr>
        <td>${esc(`Mid Hook ${index + 1}`)}</td>
        <td>${esc(hook.targetSceneId || '-')}</td>
        <td>${esc(hook.targetBeatKey || '-')}</td>
        <td>${esc(summarizeHookDetails(hook, charactersById))}</td>
      </tr>`);
    });
  }

  const chaptersHtml = chapters.map(chapter => {
    const scenes = (chapter.children || []).filter(s => s?.type === 'scene');

    const sceneRows = scenes.map((scene, index) => {
      const refs = extractSceneRefs(scene);
      const sceneCharacters = refs.characters.map(id => charactersById.get(id)?.name || id).filter(Boolean).join(', ') || '-';
      const sceneLocations = refs.locations.map(id => locationsById.get(id)?.name || id).filter(Boolean).join(', ') || '-';
      const sceneMoodList = refs.moods.map(id => moodsById.get(id)?.name || id).filter(Boolean);
      if (scene?.mood && !sceneMoodList.includes(scene.mood)) sceneMoodList.unshift(scene.mood);
      const sceneMoods = sceneMoodList.join(', ') || '-';

      const dialogueIds = uniqList([
        ...refs.dialogues,
        ...dialogues
          .filter(d => d.location?.sceneId === scene.id)
          .map(d => d.id)
      ]);
      const keyDialogues = dialogueIds.join(', ') || '-';

      const characterIds = refs.characters;
      const relationshipsInScene = relationships
        .filter(rel => characterIds.includes(rel.fromId) && characterIds.includes(rel.toId))
        .map(rel => {
          const fromName = charactersById.get(rel.fromId)?.name || rel.fromId;
          const toName = charactersById.get(rel.toId)?.name || rel.toId;
          return `${fromName}-${toName} (${humanizeKey(rel.type)})`;
        });

      return `<tr>
        <td>${esc(scene.name || scene.id || '-')}</td>
        <td>${esc(sceneTypeByIndex(index, scenes.length))}</td>
        <td>${esc(scene.title || scene.name || '-')}</td>
        <td>${esc(sceneCharacters)}</td>
        <td>${esc(sceneLocations)}</td>
        <td>${esc(sceneMoods)}</td>
        <td>${esc(keyDialogues)}</td>
        <td>${esc(relationshipsInScene.join(', ') || '-')}</td>
      </tr>`;
    });

    return `<section class="cnl-section">
      <div class="cnl-section-head">
        <h3>${esc(chapter.title || chapter.name || 'Chapter')}</h3>
      </div>
      <div class="cnl-table-wrap">
        <table class="cnl-table">
          <thead>
            <tr>
              <th>Scene ID</th>
              <th>Scene Type</th>
              <th>Scene Title</th>
              <th>Characters</th>
              <th>Location</th>
              <th>Mood</th>
              <th>Key Dialogues</th>
              <th>Key Relationships</th>
            </tr>
          </thead>
          <tbody>${sceneRows.length ? sceneRows.join('') : '<tr><td colspan="8" class="cnl-empty">No scenes yet.</td></tr>'}</tbody>
        </table>
      </div>
    </section>`;
  }).join('');

  const worldRuleRows = worldRules.map((rule, index) => `<tr>
    <td>${esc(`R${index + 1}`)}</td>
    <td>${esc(rule.name || '-')}</td>
    <td>${esc(humanizeKey(rule.category || 'general'))}</td>
    <td>${esc(rule.description || 'Treat as inviolable unless explicitly overridden.')}</td>
  </tr>`);

  const worldLayerCategoryLabels = {
    societies: 'Societies/Cultures',
    history: 'History/Timeline',
    rules: 'Rules of the World',
    economy: 'Economy/Resources',
    conflicts: 'Conflicts/Tensions'
  };
  const worldLayerRows = Object.entries(worldLayers || {}).flatMap(([category, entries]) => {
    if (!Array.isArray(entries)) return [];
    return entries.map((entry, index) => {
      const details = Object.entries(entry || {})
        .filter(([key, value]) => key !== 'id' && String(value || '').trim().length > 0)
        .map(([key, value]) => `${humanizeKey(key)}: ${String(value)}`)
        .join(' | ');
      return `<tr>
        <td>${esc(worldLayerCategoryLabels[category] || humanizeKey(category))}</td>
        <td>${esc(`WL-${index + 1}`)}</td>
        <td>${esc(details || '-')}</td>
      </tr>`;
    });
  });

  container.innerHTML = `<div class="cnl-blueprint-layout">
    <section class="cnl-section">
      <div class="cnl-section-head">
        <h3>Story Overview</h3>
        <p>Auto-generated CNL transformed into a readable blueprint view.</p>
      </div>
      <div class="cnl-table-wrap">
        <table class="cnl-table cnl-table-compact">
          <tbody>${headerRows.join('')}</tbody>
        </table>
      </div>
    </section>

    ${buildTableSection('Themes', '', ['Theme', 'Role', 'Category'], themeRows)}
    ${buildTableSection('World Rules', '', ['Rule ID', 'Text', 'Category', 'Hint / Note'], worldRuleRows)}
    ${buildTableSection('World Layers', '', ['Category', 'Entry', 'Details'], worldLayerRows)}

    ${buildTableSection('Beat Mappings', 'Beat progression and tension reference.', ['Beat', 'Scene', 'Tension', 'Description'], beatRows)}
    ${buildTableSection('Hooks', 'Opening and mid-story hook configuration.', ['Hook', 'Target Scene', 'Target Beat', 'Details'], hookRows)}
    ${buildTableSection('Tension Curve', '', ['Progress', 'Tension'], tensionRows)}

    ${buildTableSection('Characters & Relationships', '', ['Character', 'Role', 'Traits', 'Relationships'], characterRows)}

    ${buildTableSection('Locations & Moods', '', ['Location', 'Geography', 'Era', 'Characteristics', 'Mood'], locationRows)}
    ${buildTableSection('Mood Definitions', '', ['Mood', 'Emotions (intensity)'], moodRows)}

    ${buildTableSection('Objects & Artifacts', '', ['Name', 'Type', 'Significance'], objectRows)}

    ${buildTableSection('Dialogues', '', ['Dialog ID', 'Beat', 'Purpose', 'Tone', 'Tension', 'Speaker', 'Listener'], dialogueRows)}

    <section class="cnl-section">
      <div class="cnl-section-head">
        <h3>Book Structure (Chapters & Scenes)</h3>
      </div>
    </section>

    ${chaptersHtml || '<section class="cnl-section"><div class="cnl-empty-panel">No chapters and scenes available.</div></section>'}
  </div>`;
}

function syncCNLVisibility() {
  const cnlOutput = $('#cnl-output');
  const cnlEditor = $('#cnl-editor');
  const cnlVisual = $('#cnl-visual');
  const formattedBtn = $('#btn-cnl-view-formatted');
  const editBtn = $('#btn-edit-cnl');

  if (!cnlOutput || !cnlEditor || !cnlVisual || !formattedBtn || !editBtn) return;

  formattedBtn.classList.toggle('btn-edit-active', cnlViewMode === 'formatted');

  if (cnlViewMode === 'formatted') {
    cnlVisual.style.display = 'block';
    cnlOutput.style.display = 'none';
    cnlEditor.style.display = 'none';
    editBtn.disabled = false;
    editBtn.style.opacity = '1';
    editBtn.style.cursor = '';
    editBtn.textContent = 'Edit';
    editBtn.classList.remove('btn-edit-active');
    return;
  }

  cnlVisual.style.display = 'none';
  editBtn.disabled = false;
  editBtn.style.opacity = '1';
  editBtn.style.cursor = '';

  if (isEditMode) {
    cnlEditor.style.display = 'block';
    cnlOutput.style.display = 'none';
    editBtn.textContent = 'View';
    editBtn.classList.add('btn-edit-active');
  } else {
    cnlEditor.style.display = 'none';
    cnlOutput.style.display = 'block';
    editBtn.textContent = 'Edit';
    editBtn.classList.remove('btn-edit-active');
  }
}

export function setCNLViewMode(mode) {
  if (mode !== 'raw' && mode !== 'formatted') return;
  cnlViewMode = mode;
  syncCNLVisibility();
}

/**
 * Toggle between view and edit mode for CNL
 */
export function toggleEditMode() {
  const cnlOutput = $('#cnl-output');
  const cnlEditor = $('#cnl-editor');
  const editBtn = $('#btn-edit-cnl');

  if (!cnlOutput || !cnlEditor || !editBtn) return;

  if (cnlViewMode === 'formatted') {
    cnlViewMode = 'raw';
  }

  isEditMode = !isEditMode;

  if (isEditMode) {
    cnlEditor.value = cnlOutput.textContent;
    cnlEditor.focus();
  } else {
    const editedText = cnlEditor.value;
    loadCNLIntoState(editedText).then(() => {
      cnlOutput.textContent = editedText;
      renderCNLVisual(editedText);

      refreshAllViews();
      updateGenerateButton();
      window.showNotification?.('CNL parsed and applied to project state', 'success');
    }).catch((err) => {
      isEditMode = true;
      syncCNLVisibility();
      cnlEditor.focus();
      window.showNotification?.(`CNL parse error: ${err.message}`, 'error');
    });
  }

  syncCNLVisibility();
}

/**
 * Get current edit mode state
 */
export function getEditMode() {
  return isEditMode;
}

/**
 * Generate CNL from current project state and update DOM
 *
 * @returns {string} Generated CNL
 */
export function generateCNL() {
  const cnl = serializeToCNL(state.project);

  const cnlOutput = $('#cnl-output');
  if (cnlOutput) {
    cnlOutput.textContent = cnl;
  }

  if (isEditMode) {
    const editor = $('#cnl-editor');
    if (editor) editor.value = cnl;
  }

  renderCNLVisual(cnl);
  syncCNLVisibility();

  return cnl;
}

/**
 * Export CNL to file
 */
export function exportCNL() {
  const cnl = generateCNL();
  const blob = new Blob([cnl], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (state.project.name || 'story').replace(/[^a-z0-9]/gi, '_') + '.cnl';
  a.click();
}

/**
 * Import CNL from file
 */
export function importCNL() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.cnl,.txt';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();

      await loadCNLIntoState(text);

      $('#cnl-output').textContent = text;
      if (isEditMode) {
        $('#cnl-editor').value = text;
      }

      renderCNLVisual(text);
      refreshAllViews();
      updateGenerateButton();
      window.showNotification?.(`Imported and parsed: ${file.name}`, 'success');
    } catch (err) {
      window.showNotification?.('Error importing file: ' + err.message, 'error');
    }
  };

  input.click();
}
