/**
 * SCRIPTA SDK - Random Generator Configuration
 *
 * Portable configuration constants for `random-generator.mjs`.
 * No Node-only dependencies.
 */

export const NARRATIVE_ARCS = {
  heros_journey: [
    { key: 'ordinary_world', position: 0.0, dialoguePurpose: 'exposition' },
    { key: 'call_to_adventure', position: 0.1, dialoguePurpose: 'revelation' },
    { key: 'refusal', position: 0.15, dialoguePurpose: 'conflict' },
    { key: 'meeting_mentor', position: 0.2, dialoguePurpose: 'advice' },
    { key: 'crossing_threshold', position: 0.25, dialoguePurpose: 'decision' },
    { key: 'tests_allies_enemies', position: 0.35, dialoguePurpose: 'confrontation' },
    { key: 'approach', position: 0.5, dialoguePurpose: 'planning' },
    { key: 'ordeal', position: 0.6, dialoguePurpose: 'confrontation' },
    { key: 'reward', position: 0.7, dialoguePurpose: 'revelation' },
    { key: 'road_back', position: 0.8, dialoguePurpose: 'decision' },
    { key: 'resurrection', position: 0.9, dialoguePurpose: 'confrontation' },
    { key: 'return', position: 1.0, dialoguePurpose: 'resolution' }
  ],
  three_act: [
    { key: 'setup', position: 0.0, dialoguePurpose: 'exposition' },
    { key: 'inciting_incident', position: 0.1, dialoguePurpose: 'revelation' },
    { key: 'first_plot_point', position: 0.25, dialoguePurpose: 'decision' },
    { key: 'rising_action', position: 0.4, dialoguePurpose: 'conflict' },
    { key: 'midpoint', position: 0.5, dialoguePurpose: 'revelation' },
    { key: 'complications', position: 0.65, dialoguePurpose: 'confrontation' },
    { key: 'crisis', position: 0.75, dialoguePurpose: 'conflict' },
    { key: 'climax', position: 0.9, dialoguePurpose: 'confrontation' },
    { key: 'resolution', position: 1.0, dialoguePurpose: 'resolution' }
  ],
  five_act: [
    { key: 'exposition', position: 0.0, dialoguePurpose: 'exposition' },
    { key: 'rising_action', position: 0.2, dialoguePurpose: 'conflict' },
    { key: 'climax', position: 0.5, dialoguePurpose: 'confrontation' },
    { key: 'falling_action', position: 0.7, dialoguePurpose: 'revelation' },
    { key: 'denouement', position: 0.9, dialoguePurpose: 'resolution' }
  ],
  save_the_cat: [
    { key: 'opening_image', position: 0.01, dialoguePurpose: 'exposition' },
    { key: 'theme_stated', position: 0.05, dialoguePurpose: 'exposition' },
    { key: 'setup', position: 0.08, dialoguePurpose: 'exposition' },
    { key: 'catalyst', position: 0.10, dialoguePurpose: 'revelation' },
    { key: 'debate', position: 0.18, dialoguePurpose: 'conflict' },
    { key: 'break_into_two', position: 0.25, dialoguePurpose: 'decision' },
    { key: 'b_story', position: 0.28, dialoguePurpose: 'bonding' },
    { key: 'fun_and_games', position: 0.40, dialoguePurpose: 'bonding' },
    { key: 'midpoint', position: 0.50, dialoguePurpose: 'revelation' },
    { key: 'bad_guys_close_in', position: 0.62, dialoguePurpose: 'confrontation' },
    { key: 'all_is_lost', position: 0.75, dialoguePurpose: 'conflict' },
    { key: 'dark_night', position: 0.80, dialoguePurpose: 'confession' },
    { key: 'break_into_three', position: 0.85, dialoguePurpose: 'decision' },
    { key: 'finale', position: 0.92, dialoguePurpose: 'confrontation' },
    { key: 'final_image', position: 0.99, dialoguePurpose: 'resolution' }
  ]
};

export const GENRE_CONFIG = {
  fantasy: {
    archetypes: ['hero', 'mentor', 'shadow', 'ally', 'trickster'],
    geographies: ['forest', 'mountain', 'castle', 'village'],
    objectTypes: ['weapon', 'artifact', 'document'],
    themes: ['good_vs_evil', 'growth', 'power'],
    arc: 'heros_journey',
    worldRules: [
      { name: 'Magic requires sacrifice', category: 'magic', description: 'All magic has a cost.' },
      { name: 'Ancient prophecy exists', category: 'magic', description: 'A prophecy shapes the hero’s path.' },
      { name: 'Hidden realms overlap the world', category: 'geography', description: 'Portals and thresholds connect distant places.' }
    ]
  },
  romance: {
    archetypes: ['hero', 'ally', 'mentor', 'threshold_guardian'],
    geographies: ['city', 'village', 'shore', 'market'],
    objectTypes: ['jewelry', 'promise', 'secret', 'document'],
    themes: ['love', 'identity', 'sacrifice'],
    arc: 'save_the_cat',
    worldRules: []
  },
  mystery: {
    archetypes: ['hero', 'shadow', 'shapeshifter', 'herald'],
    geographies: ['city', 'palace', 'ruins', 'tavern'],
    objectTypes: ['evidence', 'alibi', 'secret', 'document', 'testimony', 'identity'],
    themes: ['justice', 'truth', 'identity'],
    arc: 'five_act',
    worldRules: [
      { name: 'Everyone lies', category: 'society', description: 'No character tells the complete truth.' },
      { name: 'The setting is isolated', category: 'geography', description: 'The truth must be discovered within a closed circle.' }
    ]
  },
  scifi: {
    archetypes: ['hero', 'mentor', 'shadow', 'herald'],
    geographies: ['city', 'ruins', 'desert', 'ocean'],
    objectTypes: ['data', 'device', 'formula', 'ai', 'virus', 'secret'],
    themes: ['identity', 'freedom', 'survival'],
    arc: 'heros_journey',
    worldRules: [
      { name: 'AI is sentient', category: 'technology', description: 'Artificial intelligences may have consciousness and agency.' },
      { name: 'The network remembers', category: 'technology', description: 'Past actions leave permanent digital traces.' },
      { name: 'Scarcity drives conflict', category: 'society', description: 'Resources are limited and contested.' }
    ]
  },
  thriller: {
    archetypes: ['hero', 'shadow', 'shapeshifter', 'ally'],
    geographies: ['city', 'ruins', 'bridge', 'borderland'],
    objectTypes: ['weapon', 'evidence', 'secret', 'document', 'device', 'deadline'],
    themes: ['survival', 'justice', 'power'],
    arc: 'three_act',
    worldRules: [
      { name: 'Time pressure is absolute', category: 'time', description: 'Deadlines are real and consequences are irreversible.' }
    ]
  },
  horror: {
    archetypes: ['hero', 'shadow', 'ally', 'innocent'],
    geographies: ['forest', 'castle', 'cave', 'ruins'],
    objectTypes: ['curse', 'spirit', 'relic', 'ritual', 'madness'],
    themes: ['mortality', 'corruption', 'truth'],
    arc: 'three_act',
    worldRules: [
      { name: 'Darkness is dangerous', category: 'physics', description: 'Something moves where light cannot reach.' },
      { name: 'The dead return', category: 'magic', description: 'Death is not always permanent.' }
    ]
  },
  adventure: {
    archetypes: ['hero', 'mentor', 'ally', 'trickster', 'herald'],
    geographies: ['jungle', 'mountain', 'ocean', 'desert', 'island'],
    objectTypes: ['artifact', 'document', 'key', 'vehicle', 'territory', 'discovery', 'deadline'],
    themes: ['growth', 'redemption', 'freedom'],
    arc: 'heros_journey',
    worldRules: [
      { name: 'The world is larger than maps', category: 'geography', description: 'Uncharted places reshape the journey.' }
    ]
  },
  drama: {
    archetypes: ['hero', 'shadow', 'ally', 'mentor'],
    geographies: ['city', 'village', 'market', 'tavern'],
    objectTypes: ['inheritance', 'secret', 'promise', 'debt', 'betrayal', 'guilt', 'ambition', 'illness'],
    themes: ['identity', 'family', 'sacrifice'],
    arc: 'three_act',
    worldRules: []
  },
  comedy: {
    archetypes: ['hero', 'trickster', 'ally', 'innocent'],
    geographies: ['city', 'village', 'market', 'tavern'],
    objectTypes: ['secret', 'identity', 'promise', 'rumor', 'deadline', 'accident'],
    themes: ['identity', 'growth', 'love'],
    arc: 'save_the_cat',
    worldRules: [
      { name: 'Misunderstandings multiply', category: 'society', description: 'Characters constantly misinterpret intentions.' }
    ]
  }
};

export const MOODS_BY_TONE = {
  dark: ['ominous', 'horrific', 'tense', 'melancholic'],
  light: ['peaceful', 'adventurous', 'triumphant', 'romantic'],
  balanced: ['peaceful', 'mysterious', 'bittersweet', 'tense'],
  comedic: ['comedic', 'peaceful', 'adventurous', 'romantic'],
  dramatic: ['epic', 'tense', 'melancholic', 'triumphant'],
  mysterious: ['mysterious', 'ominous', 'revelatory', 'tense']
};

export const COUNTS = {
  characters: { few: [2, 3], medium: [4, 6], many: [7, 10] },
  scenes: { short: [3, 5], medium: [8, 12], long: [15, 20] },
  rules: { none: 0, few: [1, 2], many: [3, 5] }
};

export default { NARRATIVE_ARCS, GENRE_CONFIG, MOODS_BY_TONE, COUNTS };

