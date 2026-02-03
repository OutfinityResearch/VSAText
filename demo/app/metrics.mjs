/**
 * SCRIPTA Demo - Metrics Calculation
 * 
 * Story quality metrics and display.
 */

import { state } from './state.mjs';
import { $ } from './utils.mjs';
import { countType } from './tree.mjs';
import { generateCNL } from './cnl.mjs';
import VOCAB from '../../src/vocabularies/vocabularies.mjs';

export function updateStats() {
  $('#stat-chars').textContent = state.project.libraries.characters.length;
  $('#stat-locs').textContent = state.project.libraries.locations.length;
  $('#stat-scenes').textContent = countType(state.project.structure, 'scene');
  $('#stat-rules').textContent = state.project.libraries.worldRules.length;
}

export function evaluateMetrics() {
  generateCNL();
  const { characters, locations, objects, moods, emotionalArc, themes, relationships, worldRules } = state.project.libraries;
  const sceneCount = countType(state.project.structure, 'scene');
  const chapterCount = countType(state.project.structure, 'chapter');
  const blockCount = countType(state.project.structure, 'block-ref');
  const actionCount = countType(state.project.structure, 'action');
  const charRefs = countType(state.project.structure, 'character-ref');
  const locRefs = countType(state.project.structure, 'location-ref');
  const moodRefs = countType(state.project.structure, 'mood-ref');
  
  const metrics = {};
  
  // 1. Completeness
  const hasChars = characters.length >= 2 ? 1 : characters.length / 2;
  const hasLocs = locations.length >= 2 ? 1 : locations.length / 2;
  const hasStructure = sceneCount >= 3 ? 1 : sceneCount / 3;
  const hasThemes = themes.length >= 1 ? 1 : 0;
  const hasArc = emotionalArc.length >= 3 ? 1 : emotionalArc.length / 3;
  metrics.completeness = (hasChars * 0.25 + hasLocs * 0.15 + hasStructure * 0.3 + hasThemes * 0.15 + hasArc * 0.15);
  
  // 2. Coherence Score
  const totalEntities = characters.length + locations.length;
  const totalRefs = charRefs + locRefs;
  const entityUsageRatio = totalEntities > 0 ? Math.min(1, totalRefs / (totalEntities * Math.max(1, sceneCount) * 0.3)) : 0;
  const hasRelationships = relationships.length >= Math.max(1, characters.length - 1) ? 1 : relationships.length / Math.max(1, characters.length - 1);
  const hasBlocks = blockCount >= Math.max(1, sceneCount * 0.5) ? 1 : blockCount / Math.max(1, sceneCount * 0.5);
  metrics.cs = entityUsageRatio * 0.4 + hasRelationships * 0.3 + hasBlocks * 0.3;
  
  // 3. Character Attribute Drift
  const traitCount = characters.reduce((sum, c) => sum + (c.traits?.length || 0), 0);
  const avgTraits = characters.length > 0 ? traitCount / characters.length : 0;
  metrics.cad = avgTraits >= 3 ? 0.05 : avgTraits >= 2 ? 0.10 : avgTraits >= 1 ? 0.15 : 0.25;
  
  // 4. Compliance Adherence Rate
  const orphanRefs = countOrphanRefs(state.project.structure, state.project.libraries);
  const totalRefsCount = charRefs + locRefs + countType(state.project.structure, 'object-ref') + moodRefs;
  metrics.car = totalRefsCount > 0 ? Math.max(0, (totalRefsCount - orphanRefs) / totalRefsCount) : 1;
  
  // 5. Originality Index
  const uniqueBlocks = new Set();
  countBlockTypes(state.project.structure, uniqueBlocks);
  const uniqueActions = new Set();
  countActionTypes(state.project.structure, uniqueActions);
  const blockVariety = uniqueBlocks.size / Math.max(1, Object.keys(VOCAB.NARRATIVE_BLOCKS).length * 0.3);
  const actionVariety = uniqueActions.size / Math.max(1, Object.keys(VOCAB.ACTIONS).length * 0.1);
  const themeVariety = themes.length >= 2 ? 1 : themes.length * 0.5;
  metrics.oi = Math.min(1, blockVariety * 0.4 + actionVariety * 0.3 + themeVariety * 0.3);
  
  // 6. Emotional Arc Profile
  const arc = VOCAB.NARRATIVE_ARCS[state.project.selectedArc];
  const arcCoverage = arc ? emotionalArc.length / arc.beats.length : 0;
  const moodVariety = moods.length / 5;
  const moodUsage = sceneCount > 0 ? moodRefs / sceneCount : 0;
  metrics.eap = Math.min(1, arcCoverage * 0.5 + Math.min(1, moodVariety) * 0.25 + Math.min(1, moodUsage) * 0.25);
  
  // 7. Explainability Score
  const hasArcDef = state.project.selectedArc ? 0.2 : 0;
  const hasThemeDef = themes.length > 0 ? 0.2 : 0;
  const hasRelDef = relationships.length > 0 ? 0.2 : 0;
  const hasRulesDef = worldRules.length > 0 ? 0.2 : 0;
  const hasEmotionalArcDef = emotionalArc.length >= 3 ? 0.2 : emotionalArc.length * 0.066;
  metrics.explainability = (hasArcDef + hasThemeDef + hasRelDef + hasRulesDef + hasEmotionalArcDef) * 5;
  
  // 8. Retrieval Quality
  const allEntities = [...characters, ...locations, ...objects, ...moods];
  const namedWell = allEntities.filter(e => e.name && e.name.length >= 3 && e.name !== 'undefined').length;
  metrics.rq = allEntities.length > 0 ? namedWell / allEntities.length : 0;
  
  // 9. CNL Parse Success Rate
  const cnl = $('#cnl-output').textContent;
  const cnlLines = cnl.split('\n').filter(l => l.trim() && !l.trim().startsWith('//'));
  const validLines = cnlLines.filter(l => /^[\s]*[\w"]+\s+(is|has|group|includes|owns|applies|beat)/.test(l));
  metrics.cpsr = cnlLines.length > 0 ? validLines.length / cnlLines.length : 0;
  
  // 10. Constraint Satisfaction Accuracy
  const validRefs = totalRefsCount - orphanRefs;
  metrics.csa = totalRefsCount > 0 ? validRefs / totalRefsCount : 1;
  
  // 11. Narrative Quality Score
  metrics.nqs = 
    metrics.completeness * 0.15 +
    metrics.cs * 0.20 + 
    (1 - Math.min(1, metrics.cad * 4)) * 0.10 +
    metrics.oi * 0.10 + 
    metrics.eap * 0.15 + 
    metrics.cpsr * 0.10 + 
    metrics.csa * 0.10 + 
    (metrics.explainability / 5) * 0.10;
  
  renderMetrics(metrics, { sceneCount, chapterCount, blockCount, actionCount, charRefs, locRefs });
}

function countOrphanRefs(node, libraries) {
  if (!node) return 0;
  let orphans = 0;
  if (node.type === 'character-ref' && node.refId && !libraries.characters.find(c => c.id === node.refId)) orphans++;
  if (node.type === 'location-ref' && node.refId && !libraries.locations.find(l => l.id === node.refId)) orphans++;
  if (node.type === 'object-ref' && node.refId && !libraries.objects.find(o => o.id === node.refId)) orphans++;
  if (node.type === 'mood-ref' && node.refId && !libraries.moods.find(m => m.id === node.refId)) orphans++;
  (node.children || []).forEach(c => orphans += countOrphanRefs(c, libraries));
  return orphans;
}

function countBlockTypes(n, set) {
  if (!n) return;
  if (n.type === 'block-ref' && n.blockKey) set.add(n.blockKey);
  (n.children || []).forEach(c => countBlockTypes(c, set));
}

function countActionTypes(n, set) {
  if (!n) return;
  if (n.type === 'action' && n.actionData?.action) set.add(n.actionData.action);
  (n.children || []).forEach(c => countActionTypes(c, set));
}

function renderMetrics(m, counts) {
  const isEmpty = !state.project.structure && state.project.libraries.characters.length === 0;
  
  if (isEmpty) {
    $('#metrics-content').innerHTML = `
      <div class="empty-state" style="padding:1rem;">
        <div class="empty-state-text">No data yet</div>
        <div class="empty-state-hint">Click Generate Story to start</div>
      </div>
    `;
    return;
  }
  
  const summaryMetrics = [
    { k: 'nqs', n: 'Narrative Quality', threshold: 0.70, desc: 'Overall story quality' },
    { k: 'completeness', n: 'Completeness', threshold: 0.80, desc: 'Required elements present' },
    { k: 'cs', n: 'Coherence', threshold: 0.75, desc: 'Entity usage & structure' },
    { k: 'eap', n: 'Emotional Arc', threshold: 0.70, desc: 'Arc coverage & moods' }
  ];
  
  const detailedMetrics = [
    { k: 'cad', n: 'Character Drift', threshold: 0.15, inverse: true, desc: 'Trait consistency' },
    { k: 'car', n: 'Compliance', threshold: 0.95, desc: 'Valid references' },
    { k: 'oi', n: 'Originality', threshold: 0.50, desc: 'Variety of elements' },
    { k: 'cpsr', n: 'Parse Success', threshold: 0.90, desc: 'Valid CNL syntax' },
    { k: 'csa', n: 'Constraints', threshold: 0.95, desc: 'Satisfied constraints' },
    { k: 'rq', n: 'Retrieval', threshold: 0.80, desc: 'Naming quality' },
    { k: 'explainability', n: 'Explainability', threshold: 3.5, unit: '/5', isRating: true, desc: 'Documentation level' }
  ];
  
  let html = `<div class="metrics-section">
    <div class="metrics-section-title">Summary</div>
    ${summaryMetrics.map(d => {
      const v = m[d.k] || 0;
      const cls = v >= d.threshold ? 'good' : v >= d.threshold * 0.7 ? 'warn' : v > 0 ? 'bad' : 'neutral';
      return `<div class="metric-card">
        <div class="metric-header"><span class="metric-name">${d.n}</span><span class="metric-value ${cls}">${(v * 100).toFixed(0)}%</span></div>
        <div class="metric-bar"><div class="metric-bar-fill" style="width:${v * 100}%;background:var(--accent-${cls === 'good' ? 'emerald' : cls === 'warn' ? 'amber' : cls === 'bad' ? 'rose' : 'sky'})"></div></div>
        <div class="metric-detail">${d.desc}</div>
      </div>`;
    }).join('')}
  </div>`;
  
  html += `<div class="metrics-section">
    <div class="metrics-section-title">Detailed Analysis</div>
    ${detailedMetrics.map(d => {
      const v = m[d.k] || 0;
      const pass = d.inverse ? v <= d.threshold : v >= d.threshold;
      const hasData = d.inverse ? v < 0.5 : v > 0;
      let displayV;
      if (d.isRating) displayV = v.toFixed(1) + (d.unit || '');
      else if (d.inverse) displayV = v.toFixed(2);
      else displayV = (v * 100).toFixed(0) + '%';
      const thresholdDisplay = d.inverse ? `≤ ${d.threshold}` : d.isRating ? `≥ ${d.threshold}${d.unit || ''}` : `≥ ${(d.threshold * 100).toFixed(0)}%`;
      const statusClass = !hasData ? 'na' : pass ? 'pass' : 'fail';
      const statusIcon = !hasData ? '○' : pass ? '✓' : '✗';
      return `<div class="metric-card">
        <div class="metric-header"><span class="metric-name">${d.n}</span><span class="metric-value ${pass ? 'good' : 'bad'}">${displayV}</span></div>
        <div class="metric-status ${statusClass}"><span>${statusIcon}</span> ${thresholdDisplay}</div>
        <div class="metric-detail">${d.desc}</div>
      </div>`;
    }).join('')}
  </div>`;
  
  html += `<div class="metrics-section">
    <div class="metrics-section-title">Structure</div>
    <div class="metric-breakdown">
      Chapters: ${counts.chapterCount}<br>
      Scenes: ${counts.sceneCount}<br>
      Blocks: ${counts.blockCount}<br>
      Actions: ${counts.actionCount}<br>
      Char refs: ${counts.charRefs}<br>
      Loc refs: ${counts.locRefs}
    </div>
  </div>`;
  
  $('#metrics-content').innerHTML = html;
}

export function renderEmptyMetrics() {
  $('#metrics-content').innerHTML = `
    <div class="empty-state" style="padding:1rem;">
      <div class="empty-state-text">No data yet</div>
      <div class="empty-state-hint">Click Generate Story to start</div>
    </div>
  `;
}
