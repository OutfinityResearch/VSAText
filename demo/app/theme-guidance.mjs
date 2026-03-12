export const THEME_GUIDANCE_PRESETS = {
  redemption: {
    ideologicalConflict: 'Punishment vs forgiveness',
    moralQuestion: 'Can someone who has caused harm truly earn forgiveness?',
    transformationAxis: 'Guilt -> grace',
    wisdom: 'Forgiveness does not erase the past, but it can change what comes next.'
  },
  sacrifice: {
    ideologicalConflict: 'Self-preservation vs selflessness',
    moralQuestion: 'What is worth giving up for the good of others?',
    transformationAxis: 'Possession -> surrender',
    wisdom: 'What we give up reveals what we truly value.'
  },
  love: {
    ideologicalConflict: 'Emotional openness vs emotional self-protection',
    moralQuestion: 'How much vulnerability is required for real connection?',
    transformationAxis: 'Isolation -> belonging',
    wisdom: 'Connection requires the courage to be changed by another person.'
  },
  power: {
    ideologicalConflict: 'Control vs compassion',
    moralQuestion: 'Does power inevitably corrupt the person who holds it?',
    transformationAxis: 'Ambition -> responsibility',
    wisdom: 'Power without restraint eventually turns against the one who wields it.'
  },
  identity: {
    ideologicalConflict: 'Social role vs authentic self',
    moralQuestion: 'Who are we when the masks no longer protect us?',
    transformationAxis: 'Confusion -> self-knowledge',
    wisdom: 'A stable identity is discovered through choice, not inherited from appearances.'
  },
  freedom: {
    ideologicalConflict: 'Autonomy vs oppression',
    moralQuestion: 'What must be risked to live freely?',
    transformationAxis: 'Submission -> agency',
    wisdom: 'Freedom becomes real only when someone is willing to bear its cost.'
  },
  justice: {
    ideologicalConflict: 'Justice vs mercy',
    moralQuestion: 'When does justice become another form of cruelty?',
    transformationAxis: 'Outrage -> discernment',
    wisdom: 'Justice without mercy can repeat the very harm it seeks to repair.'
  },
  revenge: {
    ideologicalConflict: 'Vengeance vs healing',
    moralQuestion: 'Does revenge restore what was lost, or deepen the wound?',
    transformationAxis: 'Pain -> release',
    wisdom: 'Revenge promises closure, but often keeps pain alive.'
  },
  survival: {
    ideologicalConflict: 'Survival instinct vs moral integrity',
    moralQuestion: 'What should a person refuse to sacrifice in order to survive?',
    transformationAxis: 'Fear -> resilience',
    wisdom: 'Survival matters, but the manner of surviving shapes who remains afterward.'
  },
  growth: {
    ideologicalConflict: 'Innocence vs experience',
    moralQuestion: 'What must be lost in order to grow?',
    transformationAxis: 'Naivety -> maturity',
    wisdom: 'Growth often begins where certainty ends.'
  },
  betrayal: {
    ideologicalConflict: 'Trust vs self-protection',
    moralQuestion: 'Can trust be rebuilt after profound betrayal?',
    transformationAxis: 'Certainty -> discernment',
    wisdom: 'Betrayal destroys illusions, but it can also teach sharper truth.'
  },
  family: {
    ideologicalConflict: 'Duty to family vs personal truth',
    moralQuestion: 'How much should one endure to preserve family bonds?',
    transformationAxis: 'Inheritance -> chosen belonging',
    wisdom: 'Family can be both a bond we inherit and a bond we choose to honor.'
  },
  legacy: {
    ideologicalConflict: 'Present desire vs responsibility to the future',
    moralQuestion: 'What kind of legacy is worth leaving behind?',
    transformationAxis: 'Achievement -> meaning',
    wisdom: 'What endures is rarely what was owned, but what was given.'
  },
  truth: {
    ideologicalConflict: 'Truth vs comforting illusion',
    moralQuestion: 'Is truth always worth the cost of revelation?',
    transformationAxis: 'Denial -> clarity',
    wisdom: 'Truth may wound first, but illusion wounds longer.'
  },
  mortality: {
    ideologicalConflict: 'Fear of death vs acceptance of finitude',
    moralQuestion: 'How should we live when life is finite?',
    transformationAxis: 'Avoidance -> acceptance',
    wisdom: 'Awareness of death can clarify what deserves to be loved and protected.'
  },
  corruption: {
    ideologicalConflict: 'Integrity vs temptation',
    moralQuestion: 'At what point does compromise become corruption?',
    transformationAxis: 'Conviction -> decay',
    wisdom: 'Corruption rarely begins with evil intent; it begins with tolerated compromise.'
  }
};

export function humanizeThemeGuidanceLabel(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

export function getThemeGuidance(themeKey, fallbackLabel = '') {
  const preset = THEME_GUIDANCE_PRESETS[themeKey];
  if (preset) return preset;

  const label = fallbackLabel || humanizeThemeGuidanceLabel(themeKey) || 'This theme';
  return {
    ideologicalConflict: `${label} vs its opposing force`,
    moralQuestion: `What moral dilemma best expresses the theme of ${label.toLowerCase()}?`,
    transformationAxis: `${label} denied -> ${label} embodied`,
    wisdom: `${label} becomes meaningful only when tested through sacrifice, choice, and consequence.`
  };
}
