/**
 * SCRIPTA Demo - Generation Configuration
 * 
 * Contains narrative arcs, genre configurations, and templates.
 * Shared by all generation strategies.
 */

// ============================================
// NARRATIVE ARCS
// ============================================

export const NARRATIVE_ARCS = {
  heros_journey: [
    { key: 'ordinary_world', position: 0.08, dialoguePurpose: 'exposition' },
    { key: 'call_to_adventure', position: 0.12, dialoguePurpose: 'revelation' },
    { key: 'refusal', position: 0.17, dialoguePurpose: 'conflict' },
    { key: 'meeting_mentor', position: 0.22, dialoguePurpose: 'bonding' },
    { key: 'crossing_threshold', position: 0.25 },
    { key: 'tests_allies_enemies', position: 0.40, dialoguePurpose: 'confrontation' },
    { key: 'approach_cave', position: 0.50 },
    { key: 'ordeal', position: 0.55, dialoguePurpose: 'confrontation' },
    { key: 'reward', position: 0.65 },
    { key: 'road_back', position: 0.75 },
    { key: 'resurrection', position: 0.85, dialoguePurpose: 'revelation' },
    { key: 'return_elixir', position: 0.95 }
  ],
  three_act: [
    { key: 'hook', position: 0.02, dialoguePurpose: 'exposition' },
    { key: 'setup', position: 0.08 },
    { key: 'inciting_incident', position: 0.12, dialoguePurpose: 'revelation' },
    { key: 'plot_point_1', position: 0.25, dialoguePurpose: 'confrontation' },
    { key: 'rising_action', position: 0.35 },
    { key: 'midpoint', position: 0.50, dialoguePurpose: 'revelation' },
    { key: 'plot_point_2', position: 0.75, dialoguePurpose: 'confrontation' },
    { key: 'climax', position: 0.88, dialoguePurpose: 'confrontation' },
    { key: 'resolution', position: 0.95, dialoguePurpose: 'bonding' }
  ],
  save_the_cat: [
    { key: 'opening_image', position: 0.01 },
    { key: 'theme_stated', position: 0.05, dialoguePurpose: 'exposition' },
    { key: 'setup', position: 0.08 },
    { key: 'catalyst', position: 0.10, dialoguePurpose: 'revelation' },
    { key: 'debate', position: 0.18, dialoguePurpose: 'conflict' },
    { key: 'break_into_two', position: 0.25 },
    { key: 'b_story', position: 0.28, dialoguePurpose: 'bonding' },
    { key: 'fun_and_games', position: 0.40 },
    { key: 'midpoint', position: 0.50, dialoguePurpose: 'revelation' },
    { key: 'bad_guys_close_in', position: 0.62, dialoguePurpose: 'confrontation' },
    { key: 'all_is_lost', position: 0.75, dialoguePurpose: 'conflict' },
    { key: 'dark_night', position: 0.80, dialoguePurpose: 'confession' },
    { key: 'break_into_three', position: 0.85 },
    { key: 'finale', position: 0.92, dialoguePurpose: 'confrontation' },
    { key: 'final_image', position: 0.99 }
  ]
};

// ============================================
// GENRE CONFIGURATIONS
// ============================================

export const GENRE_CONFIG = {
  fantasy: {
    archetypes: ['hero', 'mentor', 'shadow', 'ally', 'trickster'],
    geographies: ['forest', 'mountain', 'castle', 'village', 'cave'],
    objectTypes: ['weapon', 'artifact', 'prophecy', 'curse', 'relic', 'spell', 'portal'],
    objectNames: ['Enchanted Blade', 'Crystal Orb', 'Sacred Tome', 'Dragon Scale', 'Crown of Stars', 'Ring of Power', 'Ancient Map', 'The Prophecy'],
    themes: ['redemption', 'coming_of_age', 'good_vs_evil'],
    defaultArc: 'heros_journey',
    rules: [
      { name: 'Magic requires sacrifice', category: 'magic', description: 'All magic has a cost' },
      { name: 'Ancient prophecy', category: 'magic', description: "A prophecy guides the hero's destiny" },
      { name: 'Dragons exist', category: 'biology', description: 'Dragons are real creatures in this world' }
    ]
  },
  scifi: {
    archetypes: ['hero', 'mentor', 'shadow', 'ally', 'herald'],
    geographies: ['urban', 'space', 'underwater', 'desert'],
    objectTypes: ['data', 'device', 'formula', 'virus', 'ai', 'evidence', 'secret'],
    objectNames: ['Quantum Drive', 'Neural Implant', 'Clone Data', 'Alien Artifact', 'Memory Chip', 'Starship Codes', 'AI Core', 'Dimensional Key'],
    themes: ['identity', 'freedom_vs_security', 'power_corruption'],
    defaultArc: 'heros_journey',
    rules: [
      { name: 'FTL travel exists', category: 'technology', description: 'Faster-than-light travel is possible' },
      { name: 'AI is sentient', category: 'technology', description: 'Artificial intelligences have consciousness' },
      { name: 'Aliens exist', category: 'biology', description: 'Humanity has encountered alien species' }
    ]
  },
  mystery: {
    archetypes: ['hero', 'shadow', 'ally', 'trickster', 'shapeshifter'],
    geographies: ['urban', 'manor', 'village'],
    objectTypes: ['evidence', 'alibi', 'secret', 'document', 'testimony', 'crime', 'identity', 'code'],
    objectNames: ['The Missing Letter', 'Bloodstained Glove', 'Forged Document', 'Hidden Diary', 'Alibi Photograph', 'The Murder Weapon', 'Witness Statement', 'Fingerprint Evidence'],
    themes: ['justice', 'identity', 'sacrifice'],
    defaultArc: 'three_act',
    rules: [
      { name: 'Everyone lies', category: 'society', description: 'No character tells the complete truth' },
      { name: 'Closed setting', category: 'geography', description: 'The crime scene is isolated' }
    ]
  },
  romance: {
    archetypes: ['hero', 'ally', 'mentor', 'trickster'],
    geographies: ['urban', 'village', 'coastal', 'manor'],
    objectTypes: ['promise', 'secret', 'inheritance', 'marriage', 'love', 'betrayal', 'memory'],
    objectNames: ['Love Letters', 'Wedding Ring', 'Pressed Flowers', 'The Promise', 'Family Heirloom', 'Engagement Ring', 'Shared Memory', 'First Gift'],
    themes: ['love_and_loss', 'identity', 'sacrifice'],
    defaultArc: 'save_the_cat',
    rules: []
  },
  horror: {
    archetypes: ['hero', 'shadow', 'ally', 'innocent'],
    geographies: ['forest', 'manor', 'cave', 'urban'],
    objectTypes: ['curse', 'spirit', 'relic', 'ritual', 'madness', 'death', 'secret'],
    objectNames: ['Cursed Object', 'Ritual Book', 'Spirit Board', 'Haunted Doll', 'Blood Vial', 'Possessed Artifact', 'Demonic Contract', 'The Photograph'],
    themes: ['sacrifice', 'good_vs_evil', 'identity'],
    defaultArc: 'three_act',
    rules: [
      { name: 'Darkness is deadly', category: 'physics', description: 'Something lurks in the darkness' },
      { name: 'The dead return', category: 'magic', description: 'Death is not always permanent' },
      { name: 'Evil cannot be killed', category: 'magic', description: 'The antagonist cannot be destroyed conventionally' }
    ]
  },
  adventure: {
    archetypes: ['hero', 'mentor', 'ally', 'trickster', 'herald'],
    geographies: ['forest', 'mountain', 'ocean', 'desert', 'jungle'],
    objectTypes: ['artifact', 'document', 'key', 'vehicle', 'territory', 'discovery', 'deadline'],
    objectNames: ['Ancient Map', 'The Silver Key', 'Obsidian Compass', 'Golden Chalice', 'Hidden Treasure', 'Lost Temple Location', 'Expedition Journal', 'Legendary Artifact'],
    themes: ['coming_of_age', 'redemption', 'freedom_vs_security'],
    defaultArc: 'heros_journey',
    rules: [
      { name: 'Treasure awaits', category: 'other', description: "A great reward lies at journey's end" }
    ]
  },
  drama: {
    archetypes: ['hero', 'shadow', 'ally', 'mentor'],
    geographies: ['urban', 'village', 'manor'],
    objectTypes: ['inheritance', 'secret', 'promise', 'debt', 'betrayal', 'guilt', 'ambition', 'illness'],
    objectNames: ['The Will', 'Birth Certificate', 'Adoption Papers', 'Business Contract', 'Medical Records', 'Eviction Notice', 'Family Secret', 'Buried Past'],
    themes: ['identity', 'love_and_loss', 'sacrifice', 'power_corruption'],
    defaultArc: 'three_act',
    rules: []
  },
  comedy: {
    archetypes: ['hero', 'trickster', 'ally', 'innocent'],
    geographies: ['urban', 'village'],
    objectTypes: ['secret', 'identity', 'promise', 'rumor', 'deadline', 'accident'],
    objectNames: ['Mistaken Identity', 'The Wrong Suitcase', 'Embarrassing Photo', 'Love Letter to Wrong Person', 'Winning Ticket', 'Secret Admirer Note', 'The Bet', 'Misunderstood Message'],
    themes: ['identity', 'coming_of_age'],
    defaultArc: 'save_the_cat',
    rules: [
      { name: 'Misunderstandings abound', category: 'society', description: 'Characters constantly misinterpret each other' }
    ]
  }
};

// ============================================
// QUICK TEMPLATES
// ============================================

export const TEMPLATES = {
  classic_hero: { genre: 'fantasy', length: 'medium', chars: 'medium', tone: 'balanced', complexity: 'moderate', rules: 'few' },
  mystery: { genre: 'mystery', length: 'medium', chars: 'many', tone: 'dark', complexity: 'complex', rules: 'few' },
  romance: { genre: 'romance', length: 'medium', chars: 'few', tone: 'light', complexity: 'simple', rules: 'none' },
  scifi: { genre: 'scifi', length: 'long', chars: 'medium', tone: 'balanced', complexity: 'complex', rules: 'many' },
  horror: { genre: 'horror', length: 'short', chars: 'few', tone: 'dark', complexity: 'moderate', rules: 'few' },
  minimal: { genre: 'drama', length: 'short', chars: 'few', tone: 'balanced', complexity: 'simple', rules: 'none' }
};

// ============================================
// COUNT CONFIGURATIONS
// ============================================

export const COUNTS = {
  characters: { few: [2, 3], medium: [4, 6], many: [7, 10] },
  scenes: { short: [3, 5], medium: [8, 12], long: [15, 20] },
  rules: { none: 0, few: [1, 2], many: [3, 5] }
};

// ============================================
// MOOD CONFIGURATIONS BY TONE
// ============================================

export const MOODS_BY_TONE = {
  dark: ['tense', 'melancholic', 'dark', 'mysterious'],
  balanced: ['tense', 'hopeful', 'mysterious', 'triumphant'],
  light: ['hopeful', 'peaceful', 'romantic', 'triumphant'],
  comedic: ['peaceful', 'hopeful', 'chaotic']
};

// ============================================
// TENSION LEVELS BY BEAT
// ============================================

export const TENSION_LEVELS = {
  // Low tension (1-2)
  ordinary_world: 1, setup: 1, opening_image: 1, final_image: 1,
  // Medium-low (2)
  meeting_mentor: 2, b_story: 2, reward: 2, return_elixir: 2,
  // Medium (3)
  call_to_adventure: 3, refusal: 3, theme_stated: 3, debate: 3,
  crossing_threshold: 3, road_back: 3, break_into_two: 3, break_into_three: 3,
  // Medium-high (4)
  tests_allies_enemies: 4, rising_action: 4, fun_and_games: 4,
  approach_cave: 4, plot_point_1: 4, bad_guys_close_in: 4,
  // High tension (5)
  ordeal: 5, midpoint: 5, climax: 5, plot_point_2: 5,
  all_is_lost: 5, dark_night: 5, resurrection: 5, finale: 5,
  inciting_incident: 4, catalyst: 4
};

// ============================================
// DIALOGUE EXCHANGE TEMPLATES
// ============================================

export const DIALOGUE_TEMPLATES = {
  exposition: [
    { intent: 'explain the situation', emotion: 'neutral' },
    { intent: 'ask for clarification', emotion: 'curious' }
  ],
  revelation: [
    { intent: 'reveal hidden truth', emotion: 'serious' },
    { intent: 'react to revelation', emotion: 'shocked' }
  ],
  conflict: [
    { intent: 'express disagreement', emotion: 'frustrated' },
    { intent: 'defend position', emotion: 'determined' }
  ],
  confrontation: [
    { intent: 'challenge opponent', emotion: 'angry' },
    { intent: 'respond to challenge', emotion: 'defiant' }
  ],
  bonding: [
    { intent: 'share personal story', emotion: 'vulnerable' },
    { intent: 'show understanding', emotion: 'warm' }
  ],
  confession: [
    { intent: 'admit feelings/truth', emotion: 'nervous' },
    { intent: 'respond with acceptance', emotion: 'relieved' }
  ]
};

// ============================================
// PURPOSE TO TONE MAPPING
// ============================================

export const PURPOSE_TO_TONE = {
  exposition: 'curious',
  revelation: 'serious',
  conflict: 'tense',
  confrontation: 'angry',
  bonding: 'warm',
  confession: 'vulnerable'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get tension level for a narrative beat
 */
export function getTensionForBeat(beatKey) {
  return TENSION_LEVELS[beatKey] || 3;
}

/**
 * Get arc for genre
 */
export function getArcForGenre(genre) {
  return GENRE_CONFIG[genre]?.defaultArc || 'heros_journey';
}

/**
 * Get genre configuration with fallback
 */
export function getGenreConfig(genre) {
  return GENRE_CONFIG[genre] || GENRE_CONFIG.fantasy;
}
