/**
 * SCRIPTA Demo - Metrics Display
 *
 * Uses SDK evaluation locally in browser.
 * Metrics panel is empty until Evaluate is clicked.
 */

import { state } from './state.mjs';
import { $, showNotification } from './utils.mjs';
import { countType } from './tree.mjs';
import { generateCNL } from './cnl.mjs';
import { evaluateCNL } from '../../src/evaluate.mjs';
import { getChaptersForManuscript, getScenesForManuscriptChapter } from './writing-studio-manuscript.mjs';

let lastEvaluationResult = null;

const QUICK_METRICS = [
  { key: 'completeness', name: 'Completeness', description: 'Required story elements are present.' },
  { key: 'coherence', name: 'Coherence', description: 'References and structure stay consistent.' },
  { key: 'originality', name: 'Originality', description: 'Scenes, actions, and themes feel varied.' }
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function toPercent(value) {
  return Math.round(clamp(value) * 100);
}

function getScoreTone(score) {
  if (score >= 0.75) return 'good';
  if (score >= 0.5) return 'warn';
  return 'bad';
}

function getScoreStatus(score) {
  if (score >= 0.75) return 'Good';
  if (score >= 0.5) return 'Weak';
  return 'Critical';
}

function buildTextBar(score, segments = 10) {
  const filled = Math.round(clamp(score) * segments);
  return `${'█'.repeat(filled)}${'░'.repeat(Math.max(0, segments - filled))}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatMetricValue(metric) {
  return `${toPercent(metric?.score || 0)}%`;
}

function getMetricByKey(result, key) {
  return result?.metrics?.[key] || null;
}

function getPrimaryMetrics(result) {
  return QUICK_METRICS.map(item => ({
    ...item,
    metric: getMetricByKey(result, item.key)
  })).filter(item => item.metric);
}

function getTopIssues(result) {
  const issues = [];
  const metrics = result.metrics || {};
  const structure = result.structure || {};
  const entities = result.entities || {};

  if (structure.scenes < 3) {
    issues.push(`Only ${structure.scenes || 0} scene(s) defined. Add more scenes for a complete arc.`);
  }

  if (metrics.sceneCompleteness && !metrics.sceneCompleteness.passed) {
    const missingCount = Math.max(
      1,
      Math.round((metrics.sceneCompleteness.totalScenes || 0) - (metrics.sceneCompleteness.completeScenes || 0))
    );
    issues.push(`${missingCount} scene(s) are missing character, location, or action coverage.`);
  }

  if (metrics.characterContinuity && !metrics.characterContinuity.passed) {
    const missingCharacters = Math.max(
      1,
      (metrics.characterContinuity.totalCharacters || 0) - Object.values(metrics.characterContinuity.characterAppearances || {}).filter(count => count >= 1).length
    );
    issues.push(`${missingCharacters} character(s) are defined but barely used across scenes.`);
  }

  if (metrics.locationLogic && !metrics.locationLogic.passed) {
    const reused = metrics.locationLogic.locationsReused || 0;
    issues.push(
      reused <= 0
        ? 'Locations are not reused yet, so spatial continuity feels weak.'
        : 'Location continuity is thin. Reuse key locations across scenes.'
    );
  }

  if ((structure.dialogues || 0) < 2) {
    issues.push('Dialogue density is low. Add more spoken exchanges to improve scene energy.');
  }

  if (metrics.originality && !metrics.originality.passed) {
    issues.push('Originality is limited. Vary actions, blocks, or themes to reduce repetition.');
  }

  if ((entities.characters || []).length === 0) {
    issues.push('No characters were detected in the story structure.');
  }

  return issues.slice(0, 5);
}

function getAISummary(result) {
  const metrics = result.metrics || {};
  const strengths = [];
  const gaps = [];

  if ((metrics.completeness?.score || 0) >= 0.8) strengths.push('the story structure is well covered');
  if ((metrics.coherence?.score || 0) >= 0.75) strengths.push('scene-to-scene logic is coherent');
  if ((metrics.characterContinuity?.score || 0) >= 0.6) strengths.push('characters stay present across scenes');

  if ((metrics.sceneCompleteness?.score || 0) < 0.7) gaps.push('some scenes still miss key elements');
  if ((metrics.locationLogic?.score || 0) < 0.5) gaps.push('location reuse is thin');
  if ((metrics.originality?.score || 0) < 0.5) gaps.push('variety is limited');
  if (((result.structure || {}).dialogues || 0) < 2) gaps.push('dialogue coverage is low');

  if (!strengths.length) strengths.push('the draft already provides a workable narrative base');
  if (!gaps.length) gaps.push('the next step is polishing scenes and stylistic texture');

  return `The story shows that ${strengths[0]}, but ${gaps[0]}.`;
}

function getSuggestions(result) {
  const suggestions = [];
  const metrics = result.metrics || {};
  const entities = result.entities || {};
  const structure = result.structure || {};

  if (metrics.sceneCompleteness && !metrics.sceneCompleteness.passed) {
    suggestions.push('Add a clear character, location, and action anchor to every weak scene.');
  }
  if (metrics.characterContinuity && !metrics.characterContinuity.passed) {
    const underused = Object.entries(metrics.characterContinuity.characterAppearances || {})
      .filter(([, count]) => count < 2)
      .map(([name]) => name)
      .slice(0, 2);
    if (underused.length) {
      suggestions.push(`Reuse ${underused.join(' and ')} in later scenes to improve continuity.`);
    } else {
      suggestions.push('Reuse major characters in multiple scenes to improve continuity.');
    }
  }
  if (metrics.locationLogic && !metrics.locationLogic.passed) {
    const locations = (entities.locations || []).map(item => item.name).filter(Boolean).slice(0, 2);
    suggestions.push(
      locations.length
        ? `Bring back ${locations.join(' or ')} in later scenes to strengthen location logic.`
        : 'Reuse key locations across scenes to create a stronger spatial thread.'
    );
  }
  if ((structure.dialogues || 0) < 2) {
    suggestions.push('Introduce more dialogue beats in scenes that carry conflict or decisions.');
  }
  if (metrics.originality && !metrics.originality.passed) {
    suggestions.push('Diversify block types, actions, and themes to improve originality.');
  }
  if ((structure.relationships || 0) < 2) {
    suggestions.push('Define more character relationships so tension and motivations read more clearly.');
  }

  return suggestions.slice(0, 5);
}

function countRegexMatches(text, regex) {
  const matches = String(text || '').match(regex);
  return Array.isArray(matches) ? matches.length : 0;
}

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

function textIncludesEntity(text, entityName) {
  const source = normalizeName(text);
  const target = normalizeName(entityName);
  if (!source || !target) return false;
  return source.includes(target);
}

function getCharacterNameById(characterId) {
  return (state.project.libraries.characters || []).find(item => item.id === characterId)?.name || '';
}

function resolveDialogueCharacterName(rawValue) {
  if (!rawValue) return '';
  const byId = getCharacterNameById(rawValue);
  if (byId) return byId;

  const normalized = normalizeName(rawValue);
  const byName = (state.project.libraries.characters || []).find(item => normalizeName(item.name) === normalized);
  return byName?.name || String(rawValue).trim();
}

function getDialogueCharacterNames(dialogue) {
  const names = new Set();

  for (const participant of dialogue?.participants || []) {
    const name = resolveDialogueCharacterName(participant.characterId);
    if (name) names.add(name);
  }

  for (const exchange of dialogue?.exchanges || []) {
    const name = resolveDialogueCharacterName(exchange.speakerId);
    if (name) names.add(name);
  }

  return Array.from(names);
}

function getDialoguesForScene(chapterId, sceneId) {
  return (state.project.libraries.dialogues || []).filter(dialogue => {
    const location = dialogue?.location || {};
    if (location.chapterId && location.chapterId !== chapterId) return false;
    if (location.sceneId && location.sceneId !== sceneId) return false;
    if (!location.chapterId && !location.sceneId) return false;
    if (location.chapterId === chapterId && !location.sceneId) return true;
    return location.chapterId === chapterId && location.sceneId === sceneId;
  });
}

function getSceneAnalysis() {
  const chapters = getChaptersForManuscript();
  const sceneAnalyses = [];

  chapters.forEach((chapter, chapterIndex) => {
    const scenes = getScenesForManuscriptChapter(chapter);
    scenes.forEach((scene, sceneIndex) => {
      const text = [
        scene.title || '',
        scene.text || '',
        scene.dialogue || '',
        scene.characters || '',
        scene.locations || '',
        scene.objects || ''
      ].join('\n');

      const linkedDialogues = getDialoguesForScene(chapter.id, scene.id);
      const dialogueParticipants = linkedDialogues
        .flatMap(dialogue => getDialogueCharacterNames(dialogue))
        .filter(Boolean);

      const detectedCharacters = (state.project.libraries.characters || [])
        .map(item => item.name)
        .filter(Boolean)
        .filter(name => textIncludesEntity(text, name) || dialogueParticipants.includes(name));

      const detectedLocations = (state.project.libraries.locations || [])
        .map(item => item.name)
        .filter(Boolean)
        .filter(name => textIncludesEntity(text, name));

      const dialogueCount = Math.max(
        countRegexMatches(text, /(?:^|\n)\s*[—"-]/gm),
        linkedDialogues.length
      );

      sceneAnalyses.push({
        chapterId: chapter.id,
        chapterTitle: String(chapter.title || chapter.name || `Chapter ${chapterIndex + 1}`).trim(),
        sceneId: scene.id,
        sceneTitle: String(scene.title || `Scene ${sceneIndex + 1}`).trim(),
        detectedCharacters,
        detectedLocations,
        dialogueCount,
        linkedDialogueCount: linkedDialogues.length,
        hasCharacters: detectedCharacters.length > 0 || String(scene.characters || '').trim().length > 0,
        hasLocations: detectedLocations.length > 0 || String(scene.locations || '').trim().length > 0
      });
    });
  });

  return sceneAnalyses;
}

function getGeneratedStoryInsights(result) {
  const storyText = String(state.generation?.generatedStory || '').trim();
  const chapters = getChaptersForManuscript();
  const sceneAnalyses = getSceneAnalysis();

  const sceneTexts = sceneAnalyses.map(scene => {
    return [scene.sceneTitle, ...scene.detectedCharacters, ...scene.detectedLocations].join('\n');
  });

  const analysisText = [storyText, ...sceneTexts].filter(Boolean).join('\n');

  const usedCharacters = new Set();
  for (const character of state.project.libraries.characters || []) {
    if (textIncludesEntity(analysisText, character.name)) {
      usedCharacters.add(character.name);
    }
  }

  const usedLocations = new Set();
  for (const location of state.project.libraries.locations || []) {
    if (textIncludesEntity(analysisText, location.name)) {
      usedLocations.add(location.name);
    }
  }

  sceneAnalyses.forEach(scene => {
    scene.detectedCharacters.forEach(name => usedCharacters.add(name));
    scene.detectedLocations.forEach(name => usedLocations.add(name));
  });

  const sceneDialogueCount = sceneAnalyses.reduce((total, scene) => total + scene.dialogueCount, 0);

  const proseDialogueCount = countRegexMatches(storyText, /(?:^|\n)\s*[—"-]/gm);
  const dialogueParticipants = (state.project.libraries.dialogues || [])
    .flatMap(dialogue => getDialogueCharacterNames(dialogue))
    .filter(Boolean);

  dialogueParticipants.forEach(name => usedCharacters.add(name));

  if (!usedCharacters.size && (state.project.libraries.dialogues || []).length > 0) {
    for (const character of state.project.libraries.characters || []) {
      if (character?.name) usedCharacters.add(character.name);
    }
  }

  const scenesMissingCharacters = sceneAnalyses
    .filter(scene => !scene.hasCharacters)
    .map(scene => `${scene.chapterTitle} → ${scene.sceneTitle}`);

  const scenesMissingLocations = sceneAnalyses
    .filter(scene => !scene.hasLocations)
    .map(scene => `${scene.chapterTitle} → ${scene.sceneTitle}`);

  const scenesMissingDialogue = sceneAnalyses
    .filter(scene => scene.dialogueCount < 1)
    .map(scene => `${scene.chapterTitle} → ${scene.sceneTitle}`);

  return {
    chapters: chapters.length || (result.structure?.chapters || 0),
    scenes: sceneAnalyses.length || (result.structure?.scenes || 0),
    characters: usedCharacters.size || (result.structure?.characters || 0),
    locations: usedLocations.size || (result.structure?.locations || 0),
    dialogues: Math.max(sceneDialogueCount, proseDialogueCount, result.structure?.dialogues || 0),
    detectedCharacters: Array.from(usedCharacters).sort((a, b) => a.localeCompare(b)),
    detectedLocations: Array.from(usedLocations).sort((a, b) => a.localeCompare(b)),
    scenesMissingCharacters,
    scenesMissingLocations,
    scenesMissingDialogue
  };
}

function renderQuickMetrics(result) {
  const items = getPrimaryMetrics(result);

  return items.map(({ name, metric }) => {
    const score = clamp(metric.score);
    const tone = getScoreTone(score);
    return `
      <div class="metrics-mini-card">
        <div class="metrics-mini-head">
          <span class="metrics-mini-name">${escapeHtml(name)}</span>
          <span class="metrics-mini-value ${tone}">${formatMetricValue(metric)}</span>
        </div>
        <div class="metric-bar">
          <div class="metric-bar-fill tone-${tone}" style="width:${toPercent(score)}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderIssueList(items, emptyText, className = 'metrics-list') {
  if (!items.length) {
    return `<div class="${className}"><div class="metrics-list-empty">${escapeHtml(emptyText)}</div></div>`;
  }

  return `
    <ul class="${className}">
      ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
    </ul>
  `;
}

function renderQuickSummary(result) {
  const nqs = result.metrics?.nqs || { score: 0, interpretation: 'Critical' };
  const tone = getScoreTone(nqs.score);
  const issues = getTopIssues(result);

  return `
    <div class="metrics-quick-summary">
      <div class="metrics-complete-banner">Evaluation complete</div>

      <section class="metrics-summary-card">
        <div class="metrics-section-title">Story Health</div>
        <div class="metrics-story-health">
          <div class="metrics-story-health-score">
            <span class="metrics-story-health-value ${tone}">${toPercent(nqs.score)}%</span>
            <span class="metrics-story-health-status ${tone}">${escapeHtml(getScoreStatus(nqs.score).toUpperCase())}</span>
          </div>
          <div class="metrics-progress-row">
            <span class="metrics-progress-text">${buildTextBar(nqs.score)}</span>
            <div class="metric-bar large">
              <div class="metric-bar-fill tone-${tone}" style="width:${toPercent(nqs.score)}%"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="metrics-section">
        <div class="metrics-section-title">Main Issues</div>
        ${renderIssueList(issues, 'No blocking issues detected.')}
      </section>

      <section class="metrics-section">
        <div class="metrics-section-title">Core Metrics</div>
        <div class="metrics-mini-grid">
          ${renderQuickMetrics(result)}
        </div>
      </section>

      <button class="metrics-open-report" type="button" id="btn-open-full-report">Open Full Report →</button>

      <div class="metrics-footer">
        <span>Evaluated: ${new Date(result.evaluatedAt).toLocaleTimeString()}</span>
        <span>${result.processingTimeMs}ms (local)</span>
      </div>
    </div>
  `;
}

function renderFullReportMetricCards(result) {
  return getPrimaryMetrics(result).map(({ name, description, metric }) => {
    const tone = getScoreTone(metric.score);
    return `
      <article class="report-metric-card">
        <div class="report-metric-head">
          <h4>${escapeHtml(name)}</h4>
          <span class="report-metric-value ${tone}">${formatMetricValue(metric)}</span>
        </div>
        <div class="metric-bar">
          <div class="metric-bar-fill tone-${tone}" style="width:${toPercent(metric.score)}%"></div>
        </div>
        <p>${escapeHtml(description)}</p>
      </article>
    `;
  }).join('');
}

function renderFullReport(result) {
  const nqs = result.metrics?.nqs || { score: 0, interpretation: 'Critical' };
  const tone = getScoreTone(nqs.score);
  const issues = getTopIssues(result);
  const suggestions = getSuggestions(result);
  const structure = getGeneratedStoryInsights(result);

  return `
    <div class="evaluation-report-page">
      <div class="evaluation-report-header">
        <div>
          <span class="evaluation-report-kicker">Full Report</span>
          <h2>Story Evaluation Report</h2>
          <p>${escapeHtml(getAISummary(result))}</p>
        </div>
        <button class="btn" type="button" id="btn-close-full-report">Back to Story</button>
      </div>

      <section class="evaluation-report-hero">
        <div class="evaluation-report-score-card">
          <div class="metrics-section-title">Story Quality Score</div>
          <div class="evaluation-report-score-line">
            <span class="evaluation-report-score ${tone}">${toPercent(nqs.score)} / 100</span>
            <span class="evaluation-report-status ${tone}">${escapeHtml(getScoreStatus(nqs.score))}</span>
          </div>
          <div class="metric-bar large">
            <div class="metric-bar-fill tone-${tone}" style="width:${toPercent(nqs.score)}%"></div>
          </div>
          <div class="evaluation-report-date">
            Generated on ${escapeHtml(new Date(result.evaluatedAt).toLocaleString())}
          </div>
        </div>
      </section>

      <section class="evaluation-report-section">
        <div class="metrics-section-title">Core Metrics</div>
        <div class="report-metric-grid">
          ${renderFullReportMetricCards(result)}
        </div>
      </section>

      <details class="evaluation-report-section" open>
        <summary>Story Structure</summary>
        <div class="report-structure-grid">
          <div class="report-structure-item"><span>Scenes</span><strong>${structure.scenes || 0}</strong></div>
          <div class="report-structure-item"><span>Characters</span><strong>${structure.characters || 0}</strong></div>
          <div class="report-structure-item"><span>Locations</span><strong>${structure.locations || 0}</strong></div>
          <div class="report-structure-item"><span>Dialogues</span><strong>${structure.dialogues || 0}</strong></div>
        </div>
        <div class="report-detail-grid">
          <div class="report-detail-card">
            <h4>Detected Characters</h4>
            ${structure.detectedCharacters.length
              ? `<div class="report-chip-list">${structure.detectedCharacters.map(item => `<span class="report-chip">${escapeHtml(item)}</span>`).join('')}</div>`
              : `<div class="metrics-list-empty">No characters detected in the generated draft.</div>`}
          </div>
          <div class="report-detail-card">
            <h4>Detected Locations</h4>
            ${structure.detectedLocations.length
              ? `<div class="report-chip-list">${structure.detectedLocations.map(item => `<span class="report-chip">${escapeHtml(item)}</span>`).join('')}</div>`
              : `<div class="metrics-list-empty">No locations detected in the generated draft.</div>`}
          </div>
        </div>
      </details>

      <details class="evaluation-report-section" open>
        <summary>Scene Coverage</summary>
        <div class="report-detail-grid">
          <div class="report-detail-card">
            <h4>Scenes Missing Characters</h4>
            ${renderIssueList(structure.scenesMissingCharacters, 'All scenes include at least one character.', 'report-list')}
          </div>
          <div class="report-detail-card">
            <h4>Scenes Missing Locations</h4>
            ${renderIssueList(structure.scenesMissingLocations, 'All scenes include at least one location.', 'report-list')}
          </div>
          <div class="report-detail-card">
            <h4>Scenes Missing Dialogue</h4>
            ${renderIssueList(structure.scenesMissingDialogue, 'All scenes include dialogue.', 'report-list')}
          </div>
        </div>
      </details>

      <details class="evaluation-report-section" open>
        <summary>Detected Issues</summary>
        ${renderIssueList(issues, 'No major issues detected.', 'report-list report-list-issues')}
      </details>

      <details class="evaluation-report-section" open>
        <summary>AI Suggestions</summary>
        ${renderIssueList(suggestions, 'The draft is stable. Focus on stylistic polish.', 'report-list report-list-suggestions')}
      </details>
    </div>
  `;
}

function bindMetricsEvents() {
  const openButton = $('#btn-open-full-report');
  if (openButton) {
    openButton.onclick = () => {
      document.dispatchEvent(new CustomEvent('open-evaluation-report'));
    };
  }

  const closeButton = $('#btn-close-full-report');
  if (closeButton) {
    closeButton.onclick = () => {
      document.dispatchEvent(new CustomEvent('close-evaluation-report'));
    };
  }
}

export function updateStats() {
  $('#stat-chars').textContent = state.project.libraries.characters.length;
  $('#stat-locs').textContent = state.project.libraries.locations.length;
  $('#stat-scenes').textContent = countType(state.project.structure, 'scene');
  $('#stat-rules').textContent = state.project.libraries.worldRules.length;
}

/**
 * Evaluate metrics using local SDK evaluation
 * Runs entirely in browser - no server call needed
 */
export async function evaluateMetrics() {
  const metricsContent = $('#metrics-content');

  metricsContent.innerHTML = `
    <div class="metrics-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Evaluating...</div>
    </div>
  `;

  const cnl = generateCNL();

  if (!cnl || cnl.trim().length < 50) {
    renderEmptyMetrics('No specification to evaluate. Generate a story first.');
    return;
  }

  try {
    const result = evaluateCNL(cnl, {
      prose: state.generation?.generatedStory || null,
      targetArc: state.project.selectedArc || null
    });

    if (!result.success) {
      throw new Error(result.message || 'Evaluation failed');
    }

    lastEvaluationResult = result;
    renderServerMetrics(result);
    window.scriptaLastEvaluationAt = Date.now();
    document.dispatchEvent(new CustomEvent('metrics-evaluated', { detail: { result } }));

    const panel = document.querySelector('.metrics-panel');
    if (panel) {
      panel.classList.remove('metrics-flash');
      void panel.offsetWidth;
      panel.classList.add('metrics-flash');
      window.setTimeout(() => panel.classList.remove('metrics-flash'), 1500);
    }
  } catch (err) {
    console.error('[Evaluate] Error:', err);
    lastEvaluationResult = null;
    metricsContent.innerHTML = `
      <div class="metrics-error">
        <div class="error-icon">!</div>
        <div class="error-text">Evaluation failed</div>
        <div class="error-detail">${escapeHtml(err.message)}</div>
      </div>
    `;
  }
}

function renderServerMetrics(result) {
  $('#metrics-content').innerHTML = renderQuickSummary(result);
  bindMetricsEvents();
}

export function renderFullEvaluationReport() {
  const mount = $('#evaluation-report-view');
  if (!mount) return;

  if (!lastEvaluationResult) {
    mount.innerHTML = `
      <div class="evaluation-report-page">
        <div class="evaluation-report-empty">
          <div class="empty-state-icon">Scale</div>
          <div class="empty-state-text">No evaluation report yet</div>
          <div class="empty-state-hint">Run <strong>Evaluate</strong> first to open the full report.</div>
        </div>
      </div>
    `;
    bindMetricsEvents();
    return;
  }

  mount.innerHTML = renderFullReport(lastEvaluationResult);
  bindMetricsEvents();
}

export function openFullEvaluationReport() {
  if (!lastEvaluationResult) {
    showNotification('Run Evaluate first to open the full report.', 'warning');
    return false;
  }

  document.dispatchEvent(new CustomEvent('open-evaluation-report'));
  return true;
}

/**
 * Render empty metrics panel
 */
export function renderEmptyMetrics(message = null) {
  lastEvaluationResult = null;
  $('#metrics-content').innerHTML = `
    <div class="empty-state" style="padding:1.5rem;">
      <div class="empty-state-icon">Scale</div>
      <div class="empty-state-text">Not Evaluated</div>
      <div class="empty-state-hint">${message || 'Click <strong>Evaluate</strong> button to analyze story quality'}</div>
    </div>
  `;
}

/**
 * Initialize metrics panel as empty
 */
export function initMetrics() {
  renderEmptyMetrics();
}
