/**
 * SCRIPTA Demo - Generation Utilities
 * 
 * Shared utility functions for all generation strategies.
 */

import { state, loadProjectState } from '../state.mjs';
import { genId, showNotification } from '../utils.mjs';
import { renderTree } from '../tree.mjs';
import { renderEntityGrid } from '../entities.mjs';
import { renderRelationshipsView, renderEmotionalArcView, renderBlocksView, renderWorldRulesView } from '../views.mjs';
import { renderFrameworkView } from '../framework.mjs';
import { renderEmptyMetrics } from '../metrics.mjs';
import VOCAB from '/src/vocabularies/vocabularies.mjs';
import { DIALOGUE_TEMPLATES, PURPOSE_TO_TONE, getTensionForBeat } from './generation-config.mjs';
import { cnlToProjectState } from './cnl-roundtrip.mjs';
import { normalizeAnnotations } from '../cnl-annotations.mjs';
import { prepareProjectForCNL } from '../../../src/services/cnl-project-normalizer.mjs';

// ============================================
// UI REFRESH
// ============================================

/**
 * Refresh all UI views after generation
 */
export function refreshAllViews() {
  renderTree();
  ['characters', 'locations', 'objects', 'moods', 'themes'].forEach(renderEntityGrid);
  renderFrameworkView();
  renderRelationshipsView();
  renderEmotionalArcView();
  renderBlocksView();
  renderWorldRulesView();
  renderEmptyMetrics();
}

// ============================================
// PROGRESS INDICATOR
// ============================================

/**
 * Show generation status indicator
 */
export function showGenerationStatus(message) {
  let statusEl = document.getElementById('generation-status');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'generation-status';
    statusEl.className = 'generation-progress active';
    statusEl.innerHTML = `
      <div class="progress-header">
        <span class="progress-title">Generating...</span>
        <span class="progress-percent">0%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: 0%"></div>
      </div>
      <div class="progress-status">${message}</div>
    `;
    document.getElementById('generate-modal-body')?.appendChild(statusEl);
  }
  
  statusEl.querySelector('.progress-status').textContent = message;
  statusEl.classList.add('active');
  return statusEl;
}

/**
 * Update generation status
 */
export function updateGenerationStatus(statusEl, message, progress) {
  if (!statusEl) return;
  statusEl.querySelector('.progress-status').textContent = message;
  statusEl.querySelector('.progress-percent').textContent = `${Math.round(progress)}%`;
  statusEl.querySelector('.progress-bar').style.width = `${progress}%`;
}

/**
 * Hide generation status
 */
export function hideGenerationStatus(statusEl) {
  if (statusEl) {
    statusEl.classList.remove('active');
    setTimeout(() => statusEl.remove(), 300);
  }
}

// ============================================
// PROJECT STATE MANIPULATION
// ============================================

/**
 * Reset project libraries and blueprint for fresh generation
 */
export function resetProjectState() {
  state.project.libraries = {
    characters: [], locations: [], objects: [], moods: [],
    emotionalArc: [], themes: [], relationships: [], worldRules: [],
    dialogues: [],
    wisdom: [],
    patterns: []
  };
  
  state.project.blueprint = {
    arc: 'heros_journey',
    beatMappings: [],
    tensionCurve: [],
    subplots: []
  };

  state.project.cnlAnnotations = {
    global: []
  };
}

/**
 * Load project data directly into state
 */
export function loadProjectData(projectData) {
  if (projectData.name) {
    state.project.name = projectData.name;
  }
  if (projectData.selectedArc) {
    state.project.selectedArc = projectData.selectedArc;
  }
  if (projectData.libraries) {
    state.project.libraries = {
      ...state.project.libraries,
      ...projectData.libraries
    };
  }
  if (projectData.structure) {
    state.project.structure = projectData.structure;
  }
  if (projectData.blueprint) {
    state.project.blueprint = projectData.blueprint;
  }
  if (projectData.cnlAnnotations) {
    state.project.cnlAnnotations = {
      ...(state.project.cnlAnnotations || {}),
      global: normalizeAnnotations(projectData.cnlAnnotations.global || [])
    };
  }
}

/**
 * Load CNL string and parse into project state.
 *
 * Throws when CNL is invalid.
 */
export async function loadCNLIntoState(cnlText) {
  const { project } = cnlToProjectState(cnlText, state.project);
  loadProjectState(project);
  return project;
}

// ============================================
// DIALOGUE GENERATION
// ============================================

/**
 * Generate initial dialogue exchange structure based on purpose
 * Creates empty exchange slots with suggested intents/emotions for the user to fill
 */
export function generateDialogueExchangeStructure(purpose, characters) {
  if (!characters || characters.length === 0) return [];
  
  const template = DIALOGUE_TEMPLATES[purpose] || DIALOGUE_TEMPLATES.exposition;
  const exchanges = [];
  
  template.forEach((t, i) => {
    const charIndex = i % characters.length;
    exchanges.push({
      speakerId: characters[charIndex]?.id || 'unknown',
      intent: t.intent,
      emotion: t.emotion,
      conflictType: '',
      subtext: '',
      information: '',
      relationshipBetweenCharacters: '',
      power: '',
      emotionShift: '',
      storyDirection: '',
      readerPerception: '',
      sketch: '' // User must fill in the actual dialogue
    });
  });
  
  return exchanges;
}

/**
 * Get dialogue tone from purpose
 */
export function getToneFromPurpose(purpose) {
  return PURPOSE_TO_TONE[purpose] || 'neutral';
}

// ============================================
// ENTITY VALIDATION
// ============================================

/**
 * Ensure all references in scenes point to valid entities
 */
export function ensureValidReferences() {
  if (!state.project.structure?.children) return;
  
  const charIds = new Set(state.project.libraries.characters.map(c => c.id));
  const locIds = new Set(state.project.libraries.locations.map(l => l.id));
  const objIds = new Set(state.project.libraries.objects.map(o => o.id));
  
  for (const chapter of state.project.structure.children) {
    for (const scene of chapter.children || []) {
      scene.children = (scene.children || []).filter(child => {
        if (child.type === 'character-ref') return charIds.has(child.refId);
        if (child.type === 'location-ref') return locIds.has(child.refId);
        if (child.type === 'object-ref') return objIds.has(child.refId);
        return true;
      });
    }
  }
}

/**
 * Ensure minimum required elements exist
 */
export function ensureMinimumElements() {
  const libs = state.project.libraries;
  
  // Need at least 2 characters
  if (libs.characters.length < 2) {
    const usedNames = libs.characters.map(c => c.name);
    const name = VOCAB.NAMES.characters.find(n => !usedNames.includes(n));
    if (name) {
      libs.characters.push({
        id: genId(),
        name,
        archetype: 'ally',
        traits: ['loyal', 'brave']
      });
    }
  }
  
  // Need at least 1 location
  if (libs.locations.length < 1) {
    const usedNames = libs.locations.map(l => l.name);
    const name = VOCAB.NAMES.locations.find(n => !usedNames.includes(n));
    if (name) {
      libs.locations.push({
        id: genId(),
        name,
        geography: 'village',
        time: 'medieval',
        characteristics: ['bustling']
      });
    }
  }
  
  // Need at least 1 theme
  if (libs.themes.length < 1) {
    const themeKeys = Object.keys(VOCAB.THEMES);
    const themeKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
    const t = VOCAB.THEMES[themeKey];
    if (t) {
      libs.themes.push({ id: genId(), name: t.label, themeKey });
    }
  }
}

function ensureBookStructure() {
  if (state.project.structure?.type === 'book') return;
  state.project.structure = {
    id: genId(),
    type: 'book',
    name: 'Book',
    title: state.project.name || 'Untitled Story',
    children: []
  };
}

function ensureChapterStructure() {
  ensureBookStructure();
  if (Array.isArray(state.project.structure.children) && state.project.structure.children.length > 0) return;
  state.project.structure.children = [{
    id: genId(),
    type: 'chapter',
    name: 'Ch1',
    title: 'Chapter 1',
    children: []
  }];
}

function ensureSceneStructure() {
  ensureChapterStructure();
  const chapter = state.project.structure.children[0];
  if (Array.isArray(chapter.children) && chapter.children.length > 0) return;
  chapter.children = [{
    id: genId(),
    type: 'scene',
    name: 'Sc1.1',
    title: 'Scene 1',
    children: []
  }];
}

function ensureMinimumObjects() {
  const libs = state.project.libraries;
  if (libs.objects.length > 0) return;
  const usedNames = libs.objects.map(o => o.name);
  const name = VOCAB.NAMES.objects.find(n => !usedNames.includes(n)) || 'StoryKey';
  libs.objects.push({
    id: genId(),
    name,
    objectType: 'artifact',
    significance: 'important'
  });
}

function getScaffoldTargets() {
  const profile = state.project?.libraries?.frameworkProfile || {};
  const storyCore = profile.storyCore || {};
  const length = storyCore.length || 'medium';

  if (length === 'short') {
    return { chapters: 2, scenesPerChapter: 2 };
  }
  if (length === 'long') {
    return { chapters: 4, scenesPerChapter: 3 };
  }
  return { chapters: 3, scenesPerChapter: 2 };
}

function ensureMinimumThemes() {
  const libs = state.project.libraries;
  if (libs.themes.length > 0) return;
  libs.themes.push({
    id: genId('theme'),
    name: 'Transformation',
    themeKey: 'transformation'
  });
}

function ensureDialogueForScene(scene, chapter, chapterIndex, sceneIndex) {
  const existingDialogueRef = (scene.children || []).find(child => child?.type === 'dialogue-ref');
  if (existingDialogueRef) return;

  const charRefs = (scene.children || []).filter(child => child?.type === 'character-ref' && child.refId);
  if (charRefs.length < 2) return;

  const participants = charRefs.slice(0, 2).map((ref, idx) => ({
    characterId: ref.refId,
    role: idx === 0 ? 'speaker' : 'listener'
  }));
  const dialogueId = `D${state.project.libraries.dialogues.length + 1}`;
  const exchanges = generateDialogueExchangeStructure('exposition', participants.map(p => (
    state.project.libraries.characters.find(c => c.id === p.characterId)
  )).filter(Boolean));

  state.project.libraries.dialogues.push({
    id: dialogueId,
    purpose: 'exposition',
    participants,
    tone: 'neutral',
    tension: 3,
    beatKey: null,
    location: {
      chapterId: chapter.name || `Ch${chapterIndex + 1}`,
      sceneId: scene.name || `Sc${chapterIndex + 1}.${sceneIndex + 1}`
    },
    exchanges
  });

  scene.children.push({
    id: genId('ref'),
    type: 'dialogue-ref',
    name: dialogueId,
    refId: dialogueId
  });
}

function ensureNarrativeScaffold() {
  ensureSceneStructure();
  ensureMinimumThemes();
  const libs = state.project.libraries;
  const targets = getScaffoldTargets();

  while ((state.project.structure.children || []).length < targets.chapters) {
    const chapterIndex = state.project.structure.children.length;
    state.project.structure.children.push({
      id: genId('ch'),
      type: 'chapter',
      name: `Ch${chapterIndex + 1}`,
      title: `Chapter ${chapterIndex + 1}`,
      children: []
    });
  }

  for (let chIndex = 0; chIndex < state.project.structure.children.length; chIndex += 1) {
    const chapter = state.project.structure.children[chIndex];
    chapter.children = Array.isArray(chapter.children) ? chapter.children.filter(child => child?.type === 'scene') : [];
    if (!chapter.name) chapter.name = `Ch${chIndex + 1}`;
    if (!chapter.title) chapter.title = `Chapter ${chIndex + 1}`;

    while (chapter.children.length < targets.scenesPerChapter) {
      const sceneIndex = chapter.children.length;
      chapter.children.push({
        id: genId('sc'),
        type: 'scene',
        name: `Sc${chIndex + 1}.${sceneIndex + 1}`,
        title: `Scene ${chIndex + 1}.${sceneIndex + 1}`,
        children: []
      });
    }

    for (let scIndex = 0; scIndex < chapter.children.length; scIndex += 1) {
      const scene = chapter.children[scIndex];
      scene.children = Array.isArray(scene.children) ? scene.children : [];
      if (!scene.name) scene.name = `Sc${chIndex + 1}.${scIndex + 1}`;
      if (!scene.title) scene.title = `Scene ${chIndex + 1}.${scIndex + 1}`;

      const charRefs = scene.children.filter(child => child?.type === 'character-ref');
      if (charRefs.length < 2) {
        const needed = Math.min(2, libs.characters.length);
        for (let i = charRefs.length; i < needed; i += 1) {
          const character = libs.characters[i];
          if (!character) break;
          if (scene.children.some(child => child?.type === 'character-ref' && child.refId === character.id)) continue;
          addRef(scene, 'character', character);
        }
      }

      if (!hasRef(scene, 'location-ref') && libs.locations[0]) {
        addRef(scene, 'location', libs.locations[Math.min(chIndex, libs.locations.length - 1)] || libs.locations[0]);
      }

      if (!hasRef(scene, 'mood-ref') && libs.moods[0]) {
        addRef(scene, 'mood', libs.moods[Math.min(scIndex, libs.moods.length - 1)] || libs.moods[0]);
      }

      if (!hasRef(scene, 'object-ref') && libs.objects[0] && scIndex === 0) {
        addRef(scene, 'object', libs.objects[Math.min(chIndex, libs.objects.length - 1)] || libs.objects[0]);
      }

      if (!hasAction(scene)) {
        const subject = pickSceneCharacter(scene)?.name || libs.characters[0]?.name || 'Hero';
        const locationTarget = pickSceneLocation(scene)?.name || libs.locations[0]?.name || '';
        scene.children.push({
          id: genId('act'),
          type: 'action',
          name: `${subject} decides`,
          actionData: {
            subject,
            action: chIndex === 0 ? 'discovers' : (chIndex === state.project.structure.children.length - 1 ? 'confronts' : 'reveals'),
            target: locationTarget || (libs.objects[0]?.name || '')
          }
        });
      }

      ensureDialogueForScene(scene, chapter, chIndex, scIndex);
    }
  }
}

function hasRef(scene, refType) {
  return (scene.children || []).some(child => child?.type === refType);
}

function hasAction(scene) {
  return (scene.children || []).some(child => child?.type === 'action' && child.actionData?.subject && child.actionData?.action);
}

function addRef(scene, type, entity) {
  if (!scene || !entity) return;
  scene.children.push({
    id: genId(),
    type: `${type}-ref`,
    name: entity.name,
    refId: entity.id
  });
}

function pickSceneCharacter(scene) {
  const refs = (scene.children || []).filter(child => child?.type === 'character-ref' && child.refId);
  const characters = state.project.libraries.characters || [];
  return characters.find(char => refs.some(ref => ref.refId === char.id)) || characters[0] || null;
}

function pickSceneLocation(scene) {
  const refs = (scene.children || []).filter(child => child?.type === 'location-ref' && child.refId);
  const locations = state.project.libraries.locations || [];
  return locations.find(loc => refs.some(ref => ref.refId === loc.id)) || locations[0] || null;
}

function pickSceneObject(scene) {
  const refs = (scene.children || []).filter(child => child?.type === 'object-ref' && child.refId);
  const objects = state.project.libraries.objects || [];
  return objects.find(obj => refs.some(ref => ref.refId === obj.id)) || objects[0] || null;
}

export function ensureSceneMinimumRequirements() {
  ensureMinimumElements();
  ensureMinimumObjects();
  ensureSceneStructure();

  for (const chapter of state.project.structure.children || []) {
    chapter.children = Array.isArray(chapter.children) ? chapter.children : [];
    if (chapter.children.length === 0) {
      chapter.children.push({
        id: genId(),
        type: 'scene',
        name: `${chapter.name || 'Ch1'}.1`.replace('Ch', 'Sc'),
        title: 'Scene 1',
        children: []
      });
    }

    for (let index = 0; index < chapter.children.length; index += 1) {
      const scene = chapter.children[index];
      if (!scene || scene.type !== 'scene') continue;
      scene.children = Array.isArray(scene.children) ? scene.children : [];
      if (!scene.name) scene.name = `Sc${chapter.name?.replace(/^Ch/, '') || '1'}.${index + 1}`;
      if (!scene.title) scene.title = `Scene ${index + 1}`;

      const primaryCharacter = state.project.libraries.characters[0] || null;
      const primaryLocation = state.project.libraries.locations[0] || null;
      const primaryObject = state.project.libraries.objects[0] || null;

      if (!hasRef(scene, 'character-ref') && primaryCharacter) {
        addRef(scene, 'character', primaryCharacter);
      }
      if (!hasRef(scene, 'location-ref') && primaryLocation) {
        addRef(scene, 'location', primaryLocation);
      }

      if (!hasAction(scene)) {
        const subject = pickSceneCharacter(scene)?.name || primaryCharacter?.name || 'Hero';
        const locationTarget = pickSceneLocation(scene)?.name || primaryLocation?.name || 'Unknown Place';
        const objectTarget = pickSceneObject(scene)?.name || primaryObject?.name || '';
        const target = objectTarget || locationTarget;

        scene.children.push({
          id: genId(),
          type: 'action',
          name: `${subject} decides`,
          actionData: {
            subject,
            action: 'decides',
            target
          }
        });
      }
    }
  }
}

/**
 * Ensure emotional arc has mood coverage
 */
export function ensureEmotionalArcCoverage() {
  const libs = state.project.libraries;
  
  if (libs.moods.length < 3) {
    const moodKeys = ['mysterious', 'tense', 'triumphant'];
    for (const k of moodKeys) {
      if (!libs.moods.find(m => m.name.toLowerCase() === k)) {
        const preset = VOCAB.MOOD_PRESETS[k];
        if (preset) {
          libs.moods.push({
            id: genId(),
            name: preset.label,
            emotions: { ...preset.emotions }
          });
        }
      }
    }
  }
}

/**
 * Normalize character traits to reduce drift
 */
export function normalizeCharacterTraits() {
  for (const char of state.project.libraries.characters) {
    if (char.traits && char.traits.length > 4) {
      char.traits = char.traits.slice(0, 4);
    }
  }
}

export function finalizeGeneratedProjectState() {
  ensureMinimumElements();
  ensureMinimumObjects();
  ensureEmotionalArcCoverage();
  normalizeCharacterTraits();
  ensureNarrativeScaffold();
  ensureSceneMinimumRequirements();
  ensureValidReferences();

  const normalized = prepareProjectForCNL(state.project);
  state.project = {
    ...state.project,
    selectedArc: normalized.selectedArc,
    blueprint: normalized.blueprint,
    libraries: normalized.libraries,
    structure: normalized.structure
  };
}

function countNodesByType(node, type) {
  if (!node || typeof node !== 'object') return 0;
  let total = node.type === type ? 1 : 0;
  for (const child of node.children || []) {
    total += countNodesByType(child, type);
  }
  return total;
}

function countReferenceNodes(node, refType) {
  if (!node || typeof node !== 'object') return 0;
  let total = node.type === refType ? 1 : 0;
  for (const child of node.children || []) {
    total += countReferenceNodes(child, refType);
  }
  return total;
}

export function hasMeaningfulSpecs(project = state.project) {
  const libraries = project?.libraries || {};
  const sceneCount = countNodesByType(project?.structure, 'scene');
  const actionCount = countNodesByType(project?.structure, 'action');
  const chapterCount = countNodesByType(project?.structure, 'chapter');
  const characterLibraryCount = Array.isArray(libraries.characters) ? libraries.characters.length : 0;
  const locationLibraryCount = Array.isArray(libraries.locations) ? libraries.locations.length : 0;
  const characterRefCount = countReferenceNodes(project?.structure, 'character-ref');
  const locationRefCount = countReferenceNodes(project?.structure, 'location-ref');
  const dialogueRefCount = countReferenceNodes(project?.structure, 'dialogue-ref');
  const objectRefCount = countReferenceNodes(project?.structure, 'object-ref');

  const characterCoverage = Math.max(characterLibraryCount, characterRefCount);
  const locationCoverage = Math.max(locationLibraryCount, locationRefCount);
  const sceneSupport = actionCount + dialogueRefCount + objectRefCount;

  return sceneCount > 0
    && chapterCount > 0
    && characterCoverage > 0
    && locationCoverage > 0
    && sceneSupport > 0;
}

function buildFrameworkDrivenOptions(project = state.project) {
  const profile = project?.libraries?.frameworkProfile || {};
  const storyCore = profile.storyCore || {};
  const coreTheme = profile.coreTheme || {};
  const dramaticModel = profile.dramaticModel || {};
  const transformation = profile.transformation || {};

  const transformationSummary = [
    transformation.characterArcBefore && transformation.characterArcAfter
      ? `${transformation.characterArcBefore} -> ${transformation.characterArcAfter}`
      : '',
    transformation.valueShiftBefore && transformation.valueShiftAfter
      ? `${transformation.valueShiftBefore} -> ${transformation.valueShiftAfter}`
      : '',
    transformation.changeCostAfter || ''
  ].filter(Boolean).join(' | ');

  const customPrompt = [
    storyCore.theme ? `Theme focus: ${storyCore.theme}.` : '',
    storyCore.wisdom ? `Wisdom: ${storyCore.wisdom}.` : '',
    coreTheme.ideologicalConflict ? `Ideological conflict: ${coreTheme.ideologicalConflict}.` : '',
    coreTheme.moralQuestion ? `Moral question: ${coreTheme.moralQuestion}.` : '',
    coreTheme.transformationAxis ? `Transformation axis: ${coreTheme.transformationAxis}.` : '',
    dramaticModel.conflictType ? `Conflict type: ${dramaticModel.conflictType}.` : '',
    dramaticModel.conflictEngine ? `Conflict engine: ${dramaticModel.conflictEngine}.` : '',
    dramaticModel.resolutionPath ? `Resolution path: ${dramaticModel.resolutionPath}.` : '',
    dramaticModel.escalationPattern ? `Escalation pattern: ${dramaticModel.escalationPattern}.` : '',
    dramaticModel.thematicDirection ? `Thematic direction: ${dramaticModel.thematicDirection}.` : '',
    transformationSummary ? `Character transformation: ${transformationSummary}.` : ''
  ].filter(Boolean).join(' ');

  return {
    genre: storyCore.genre || 'fantasy',
    tone: storyCore.tone || 'dark',
    complexity: storyCore.complexity || 'moderate',
    length: storyCore.length || 'medium',
    chars: storyCore.chars || 'medium',
    rules: storyCore.rules || 'few',
    theme: storyCore.theme || coreTheme.customThemeName || '',
    wisdom: storyCore.wisdom || '',
    customPrompt
  };
}

export async function ensureProjectHasMeaningfulSpecs(project = state.project) {
  if (hasMeaningfulSpecs(project)) return true;

  const options = buildFrameworkDrivenOptions(project);
  const generator = options.complexity === 'simple' ? 'random' : 'advanced';

  showNotification('Building story specs before prose generation...', 'info');

  if (generator === 'advanced') {
    const { generateAdvanced } = await import('./generation-advanced.mjs');
    await generateAdvanced(options);
  } else {
    const { generateRandom } = await import('./generation-random.mjs');
    generateRandom(options);
  }

  return hasMeaningfulSpecs(project);
}

// ============================================
// METRIC CALCULATIONS
// ============================================

/**
 * Calculate composite quality score from metrics
 */
export function calculateCompositeScore(metrics) {
  if (!metrics || !metrics.scores) return 0;
  
  const weights = {
    nqs: 0.25,
    coherence: 0.20,
    completeness: 0.15,
    eap: 0.10,
    cad: 0.10,
    car: 0.10,
    csa: 0.10
  };
  
  let score = 0;
  let totalWeight = 0;
  
  for (const [key, weight] of Object.entries(weights)) {
    if (metrics.scores[key] !== undefined) {
      let value = metrics.scores[key];
      // Invert CAD since lower is better
      if (key === 'cad') value = 1 - Math.min(value, 1);
      score += value * weight;
      totalWeight += weight;
    }
  }
  
  return totalWeight > 0 ? score / totalWeight : 0;
}

// ============================================
// RE-EXPORT VOCAB FOR CONVENIENCE
// ============================================

export { VOCAB, genId };
