/**
 * Reverse Engineering Service
 * Extract specs and plans from existing text artifacts
 */

import crypto from 'crypto';
import { encodeText, cosine } from '../vsa/encoder.mjs';

/**
 * Extract character names from text using pattern matching
 */
function extractCharacters(text) {
  const characters = new Map();
  
  // Pattern 1: Proper nouns that appear multiple times
  const sentences = text.split(/[.!?]+/);
  const properNouns = new Set();
  
  for (const sentence of sentences) {
    // Find capitalized words not at sentence start
    const words = sentence.trim().split(/\s+/);
    for (let i = 1; i < words.length; i++) {
      const word = words[i].replace(/[^a-zA-Z]/g, '');
      if (word.length > 2 && /^[A-Z][a-z]+$/.test(word)) {
        properNouns.add(word);
      }
    }
  }
  
  // Count occurrences
  for (const noun of properNouns) {
    const regex = new RegExp(`\\b${noun}\\b`, 'g');
    const count = (text.match(regex) || []).length;
    if (count >= 3) {
      characters.set(noun, { name: noun, mentions: count });
    }
  }
  
  // Pattern 2: Look for character introductions
  const introPatterns = [
    /([A-Z][a-z]+)\s+was\s+a\s+(\w+)/g,
    /([A-Z][a-z]+),?\s+(?:the|a)\s+(\w+)/g,
    /([A-Z][a-z]+)\s+(?:said|asked|replied|thought)/g
  ];
  
  for (const pattern of introPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1];
      if (!characters.has(name)) {
        characters.set(name, { name, mentions: 1 });
      }
    }
  }
  
  return Array.from(characters.values())
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 10);
}

/**
 * Extract character traits from context
 */
function extractTraits(text, characterName) {
  const traits = [];
  const lowerText = text.toLowerCase();
  const lowerName = characterName.toLowerCase();
  
  // Find sentences about the character
  const sentences = text.split(/[.!?]+/).filter(s => 
    s.toLowerCase().includes(lowerName)
  );
  
  // Look for adjectives near character name
  const adjectivePatterns = [
    new RegExp(`${characterName}\\s+(?:was|is|seemed|appeared)\\s+(\\w+)`, 'gi'),
    new RegExp(`(\\w+)\\s+${characterName}`, 'gi'),
    new RegExp(`${characterName}['']s\\s+(\\w+)`, 'gi')
  ];
  
  const traitWords = new Set();
  const positiveTraits = ['brave', 'kind', 'clever', 'strong', 'gentle', 'wise', 'loyal', 'honest', 'curious', 'determined'];
  const negativeTraits = ['cruel', 'cowardly', 'selfish', 'weak', 'harsh', 'foolish', 'treacherous', 'dishonest', 'apathetic', 'stubborn'];
  const allTraits = [...positiveTraits, ...negativeTraits];
  
  for (const sentence of sentences) {
    for (const trait of allTraits) {
      if (sentence.toLowerCase().includes(trait)) {
        traitWords.add(trait);
      }
    }
  }
  
  return Array.from(traitWords);
}

/**
 * Extract themes from text using keyword analysis
 */
function extractThemes(text, dim = 1000, seed = 42) {
  const themes = [];
  const themeKeywords = {
    'love': ['love', 'heart', 'romance', 'passion', 'affection', 'devotion'],
    'death': ['death', 'dying', 'funeral', 'grave', 'mortality', 'loss'],
    'power': ['power', 'control', 'authority', 'throne', 'rule', 'dominion'],
    'redemption': ['redemption', 'forgive', 'atone', 'repent', 'salvation', 'second chance'],
    'identity': ['identity', 'self', 'who am I', 'belong', 'discover', 'true self'],
    'freedom': ['freedom', 'escape', 'liberty', 'cage', 'chains', 'captive'],
    'betrayal': ['betrayal', 'betray', 'trust', 'deceive', 'traitor', 'lie'],
    'family': ['family', 'mother', 'father', 'sister', 'brother', 'parent', 'child'],
    'justice': ['justice', 'fair', 'right', 'wrong', 'court', 'judge', 'punishment'],
    'survival': ['survive', 'survival', 'alive', 'danger', 'threat', 'fight']
  };
  
  const lowerText = text.toLowerCase();
  const textVector = encodeText(text, dim, seed);
  
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      const count = (lowerText.match(new RegExp(`\\b${keyword}`, 'g')) || []).length;
      score += count;
    }
    
    // Also use semantic similarity
    const themeVector = encodeText(keywords.join(' '), dim, seed);
    const similarity = cosine(textVector, themeVector);
    
    const combinedScore = score * 0.7 + similarity * 30;
    
    if (combinedScore > 2) {
      themes.push({
        theme,
        score: combinedScore,
        keywords_found: keywords.filter(k => lowerText.includes(k))
      });
    }
  }
  
  return themes.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * Extract world rules/constraints from text
 */
function extractWorldRules(text) {
  const rules = [];
  
  // Look for explicit rules
  const rulePatterns = [
    /(?:never|always|must|cannot|forbidden)\s+([^.!?]+)/gi,
    /it\s+(?:is|was)\s+(?:impossible|forbidden|required)\s+to\s+([^.!?]+)/gi,
    /(?:the law|the rule|tradition)\s+(?:states?|requires?|forbids?)\s+([^.!?]+)/gi
  ];
  
  for (const pattern of rulePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      rules.push({
        type: 'explicit_rule',
        content: match[0].trim(),
        detail: match[1].trim()
      });
    }
  }
  
  // Look for world elements
  if (text.toLowerCase().includes('magic')) {
    rules.push({ type: 'world_element', content: 'Magic exists in this world' });
  }
  if (text.toLowerCase().includes('technology') || text.toLowerCase().includes('computer')) {
    rules.push({ type: 'world_element', content: 'Technology is present' });
  }
  if (/\b(king|queen|kingdom|castle|throne)\b/i.test(text)) {
    rules.push({ type: 'world_element', content: 'Medieval/fantasy setting' });
  }
  if (/\b(spaceship|planet|galaxy|alien)\b/i.test(text)) {
    rules.push({ type: 'world_element', content: 'Science fiction setting' });
  }
  
  return rules.slice(0, 10);
}

/**
 * Extract plot structure from text
 */
function extractPlotStructure(text) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  const totalLength = text.length;
  
  const structure = {
    estimated_act_breaks: [],
    key_events: [],
    inciting_incident: null,
    climax_position: null
  };
  
  // Estimate act breaks based on text position
  if (paragraphs.length > 3) {
    const quarterIndex = Math.floor(paragraphs.length / 4);
    const threeQuarterIndex = Math.floor(paragraphs.length * 3 / 4);
    
    structure.estimated_act_breaks = [
      { act: 1, ends_at_paragraph: quarterIndex },
      { act: 2, ends_at_paragraph: threeQuarterIndex },
      { act: 3, ends_at_paragraph: paragraphs.length }
    ];
  }
  
  // Look for key event markers
  const eventPatterns = [
    { pattern: /suddenly|without warning|unexpectedly/gi, type: 'surprise' },
    { pattern: /finally|at last|after all/gi, type: 'resolution' },
    { pattern: /discovered|realized|understood/gi, type: 'revelation' },
    { pattern: /confronted|faced|challenged/gi, type: 'conflict' },
    { pattern: /decided|chose|determined/gi, type: 'decision' }
  ];
  
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    for (const { pattern, type } of eventPatterns) {
      if (pattern.test(para)) {
        structure.key_events.push({
          type,
          paragraph: i,
          position: i / paragraphs.length
        });
        break;
      }
    }
  }
  
  return structure;
}

/**
 * Generate a spec from extracted elements
 */
function extractSpec(text) {
  const characters = extractCharacters(text);
  const themes = extractThemes(text);
  const worldRules = extractWorldRules(text);
  
  // Enrich characters with traits
  for (const char of characters) {
    char.traits = extractTraits(text, char.name);
    char.goals = []; // Would need more sophisticated extraction
  }
  
  const spec = {
    id: `spec_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
    title: 'Extracted Specification',
    synopsis: text.slice(0, 300).trim() + '...',
    themes: themes.map(t => t.theme),
    constraints: worldRules.filter(r => r.type === 'explicit_rule').map(r => r.content),
    cnl_constraints: generateCnlFromExtracted(characters, themes, worldRules),
    characters: characters.map(c => ({
      name: c.name,
      traits: c.traits,
      goals: c.goals
    })),
    world_rules: worldRules.filter(r => r.type === 'world_element').map(r => r.content),
    extracted_at: new Date().toISOString(),
    source_length: text.length
  };
  
  return spec;
}

/**
 * Generate a plan from extracted elements
 */
function extractPlan(text, specId = null) {
  const characters = extractCharacters(text);
  const structure = extractPlotStructure(text);
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  
  const plan = {
    id: `plan_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
    spec_id: specId || `spec_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
    plot_graph: {
      nodes: structure.key_events.map((e, i) => ({
        id: `node_${i}`,
        type: e.type,
        position: e.position
      })),
      edges: structure.key_events.slice(1).map((e, i) => ({
        from: `node_${i}`,
        to: `node_${i + 1}`,
        type: 'sequence'
      }))
    },
    scenes: paragraphs.slice(0, 20).map((para, i) => ({
      id: `scene_${i + 1}`,
      number: i + 1,
      summary: para.slice(0, 100).trim() + '...',
      estimated_words: para.split(/\s+/).length,
      characters: characters
        .filter(c => para.includes(c.name))
        .map(c => c.name)
    })),
    arcs: characters.slice(0, 3).map(c => ({
      id: `arc_${c.name.toLowerCase()}`,
      character: c.name,
      type: 'character_arc',
      stages: []
    })),
    extracted_at: new Date().toISOString()
  };
  
  return plan;
}

/**
 * Generate CNL statements from extracted elements
 */
function generateCnlFromExtracted(characters, themes, worldRules) {
  const statements = [];
  
  for (const char of characters.slice(0, 5)) {
    statements.push(`CHARACTER(${char.name}).`);
    for (const trait of (char.traits || []).slice(0, 2)) {
      statements.push(`TRAIT(${char.name}, ${trait}).`);
    }
  }
  
  for (const theme of themes.slice(0, 3)) {
    statements.push(`RULE(Story, theme, ${theme.theme}).`);
  }
  
  for (const rule of worldRules.slice(0, 3)) {
    if (rule.type === 'world_element') {
      statements.push(`RULE(World, includes, "${rule.content}").`);
    }
  }
  
  return statements.join('\n');
}

/**
 * Main reverse engineering function
 */
function reverseEngineer(text, outputType = 'spec') {
  if (outputType === 'plan') {
    const spec = extractSpec(text);
    const plan = extractPlan(text, spec.id);
    return { plan, extracted_spec_id: spec.id };
  }
  
  return { spec: extractSpec(text) };
}

export {
  reverseEngineer,
  extractSpec,
  extractPlan,
  extractCharacters,
  extractThemes,
  extractWorldRules,
  extractPlotStructure
};
