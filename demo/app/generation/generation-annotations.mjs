/**
 * SCRIPTA Demo - Generation Annotations
 *
 * Ensures generated projects always carry CNL guidance annotations.
 */

import { normalizeAnnotations } from '../cnl-annotations.mjs';

const PREDEFINED_ANNOTATIONS = {
  hint: [
    'Respect strict entity continuity: use only declared characters, locations, and objects.',
    'Each scene must express clear intent, conflict, and consequence before transitioning.',
    'Escalate stakes progressively; avoid flat tension in consecutive scenes.',
    'Prefer concrete actions over abstract exposition when advancing plot.',
    'Keep causal links explicit between scene outcomes and next decisions.'
  ],
  style: [
    'Maintain precise, cinematic prose with strong verbs and minimal filler.',
    'Use controlled descriptive density: focus details that change interpretation.',
    'Preserve genre fidelity while avoiding cliche formula phrasing.'
  ],
  voice: [
    'Narrative voice should stay coherent and observational, never omnisciently random.',
    'Character voice must reflect role, motivation, and emotional state in each scene.',
    'Use dialogue rhythms to expose power dynamics and hidden intent.'
  ],
  subtext: [
    'When characters disagree, imply deeper motives through subtext, not direct explanation.',
    'Use silence, hesitation, and contradiction to reveal inner conflict.',
    'Major revelations should be foreshadowed through understated cues.'
  ],
  sensory: [
    'Anchor pivotal scenes in 2-3 sensory cues tied to mood and stakes.',
    'Use environment details to reinforce tension shifts.',
    'Match sensory focus to scene objective: threat, intimacy, or discovery.'
  ],
  pacing: [
    'Alternate compression and expansion: fast conflict beats, slower reflective sequels.',
    'End scenes on decision pressure or unresolved tension.',
    'Reduce repetitive setup; prioritize forward narrative momentum.'
  ],
  avoid: [
    'Avoid introducing undeclared entities or sudden powers without setup.',
    'Avoid exposition dumps that pause action for too long.',
    'Avoid emotional shifts without observable trigger in scene events.'
  ],
  reveal: [
    'Reveal information in escalating layers rather than single large dumps.',
    'Tie each reveal to a cost, risk, or relationship shift.',
    'Ensure revelations alter either strategy, trust, or stakes.'
  ]
};

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function sampleWithoutReplacement(arr, count) {
  const copy = [...arr];
  const result = [];
  const n = Math.min(count, copy.length);
  for (let i = 0; i < n; i += 1) {
    const idx = randomInt(copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return result;
}

function dedupeAnnotations(annotations) {
  const seen = new Set();
  const output = [];
  for (const ann of normalizeAnnotations(annotations)) {
    const key = `${ann.type}::${ann.content}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(ann);
  }
  return output;
}

function buildMandatoryAnnotations(options = {}, strategy = 'random') {
  const lengthRule = options.length === 'long'
    ? 'For long stories, maintain chapter-level mini-arcs with explicit progression.'
    : options.length === 'short'
      ? 'For short stories, compress setup and start conflict early.'
      : 'Balance setup, escalation, and payoff across chapters.';

  const complexityRule = options.complexity === 'complex'
    ? 'Track subplots and relationship shifts explicitly to avoid drift.'
    : 'Keep causal chain simple and unambiguous.';

  const toneRule = options.tone
    ? `Tone target is "${options.tone}"; preserve it consistently in narration and dialogue.`
    : 'Keep tone stable across scenes unless intentionally shifted by events.';

  return [
    { type: 'hint', content: 'Treat CNL statements as hard constraints for generation.' },
    { type: 'hint', content: 'Output must preserve declared structure: Chapter -> Scene -> Scene Change -> Sequel logic.' },
    { type: 'hint', content: lengthRule },
    { type: 'hint', content: complexityRule },
    { type: 'style', content: toneRule },
    { type: 'avoid', content: 'Do not violate world rules or character core traits without explicit turning-point evidence.' },
    { type: 'pacing', content: strategy === 'llm' ? 'Use LLM creativity for naming and high-level planning only; keep plot progression deterministic.' : 'Keep progression deterministic and metric-friendly.' }
  ];
}

function buildPredefinedRandomAnnotations() {
  const selected = [
    ...sampleWithoutReplacement(PREDEFINED_ANNOTATIONS.hint, 2).map(content => ({ type: 'hint', content })),
    ...sampleWithoutReplacement(PREDEFINED_ANNOTATIONS.style, 1).map(content => ({ type: 'style', content })),
    ...sampleWithoutReplacement(PREDEFINED_ANNOTATIONS.voice, 1).map(content => ({ type: 'voice', content })),
    ...sampleWithoutReplacement(PREDEFINED_ANNOTATIONS.subtext, 1).map(content => ({ type: 'subtext', content })),
    ...sampleWithoutReplacement(PREDEFINED_ANNOTATIONS.sensory, 1).map(content => ({ type: 'sensory', content })),
    ...sampleWithoutReplacement(PREDEFINED_ANNOTATIONS.pacing, 1).map(content => ({ type: 'pacing', content })),
    ...sampleWithoutReplacement(PREDEFINED_ANNOTATIONS.avoid, 1).map(content => ({ type: 'avoid', content })),
    ...sampleWithoutReplacement(PREDEFINED_ANNOTATIONS.reveal, 1).map(content => ({ type: 'reveal', content }))
  ];
  return selected;
}

/**
 * Merge mandatory + predefined + optional LLM annotations into project.
 */
export function applyGenerationAnnotations(project, { strategy = 'random', options = {}, llmAnnotations = [] } = {}) {
  if (!project || typeof project !== 'object') return project;

  const existing = project.cnlAnnotations?.global || [];
  const mandatory = buildMandatoryAnnotations(options, strategy);
  const predefined = buildPredefinedRandomAnnotations();
  const llmSpecific = normalizeAnnotations(llmAnnotations);

  const merged = dedupeAnnotations([
    ...existing,
    ...mandatory,
    ...predefined,
    ...llmSpecific
  ]);

  project.cnlAnnotations = {
    ...(project.cnlAnnotations || {}),
    global: merged
  };

  return project;
}

export default {
  applyGenerationAnnotations
};
