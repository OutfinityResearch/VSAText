/**
 * SCRIPTA Vocabulary - Narrative Module
 * 
 * Emotions, moods, narrative arcs, blocks, actions, and themes.
 */

// ============================================
// EMOTIONS (for Mood Builder)
// ============================================
export const EMOTIONS = {
  // Primary Positive
  joy: { label: 'Joy', desc: 'Intense happiness and delight', valence: 'positive', intensity: 'high', color: '#ffd166' },
  hope: { label: 'Hope', desc: 'Expectation of good things', valence: 'positive', intensity: 'medium', color: '#06d6a0' },
  love: { label: 'Love', desc: 'Deep affection and connection', valence: 'positive', intensity: 'high', color: '#ef476f' },
  wonder: { label: 'Wonder', desc: 'Amazement at the extraordinary', valence: 'positive', intensity: 'medium', color: '#48cae4' },
  serenity: { label: 'Serenity', desc: 'Calm, peaceful contentment', valence: 'positive', intensity: 'low', color: '#a8dadc' },
  gratitude: { label: 'Gratitude', desc: 'Thankfulness for blessings', valence: 'positive', intensity: 'medium', color: '#90be6d' },
  pride: { label: 'Pride', desc: 'Satisfaction in achievement', valence: 'positive', intensity: 'medium', color: '#f9c74f' },
  amusement: { label: 'Amusement', desc: 'Light-hearted enjoyment', valence: 'positive', intensity: 'low', color: '#f8961e' },
  // Primary Negative
  fear: { label: 'Fear', desc: 'Response to perceived threat', valence: 'negative', intensity: 'high', color: '#4a1942' },
  sadness: { label: 'Sadness', desc: 'Grief, loss, disappointment', valence: 'negative', intensity: 'medium', color: '#457b9d' },
  anger: { label: 'Anger', desc: 'Response to injustice or threat', valence: 'negative', intensity: 'high', color: '#d00000' },
  disgust: { label: 'Disgust', desc: 'Revulsion, rejection', valence: 'negative', intensity: 'medium', color: '#606c38' },
  anxiety: { label: 'Anxiety', desc: 'Worry about uncertain future', valence: 'negative', intensity: 'medium', color: '#bc6c25' },
  despair: { label: 'Despair', desc: 'Complete loss of hope', valence: 'negative', intensity: 'high', color: '#1d3557' },
  guilt: { label: 'Guilt', desc: 'Regret over wrongdoing', valence: 'negative', intensity: 'medium', color: '#6d6875' },
  shame: { label: 'Shame', desc: 'Painful self-consciousness', valence: 'negative', intensity: 'high', color: '#5f0f40' },
  // Complex/Mixed
  nostalgia: { label: 'Nostalgia', desc: 'Bittersweet longing for past', valence: 'mixed', intensity: 'medium', color: '#d4a373' },
  suspense: { label: 'Suspense', desc: 'Anxious anticipation', valence: 'mixed', intensity: 'high', color: '#e63946' },
  curiosity: { label: 'Curiosity', desc: 'Desire to know or explore', valence: 'mixed', intensity: 'medium', color: '#fb8500' },
  awe: { label: 'Awe', desc: 'Overwhelming wonder, sometimes fearful', valence: 'mixed', intensity: 'high', color: '#7b2cbf' },
  melancholy: { label: 'Melancholy', desc: 'Pensive sadness, often beautiful', valence: 'mixed', intensity: 'medium', color: '#577590' },
  longing: { label: 'Longing', desc: 'Deep yearning for something', valence: 'mixed', intensity: 'medium', color: '#f4a261' },
  unease: { label: 'Unease', desc: 'Subtle discomfort, something wrong', valence: 'mixed', intensity: 'low', color: '#6c757d' },
  tension: { label: 'Tension', desc: 'Strain before resolution', valence: 'mixed', intensity: 'high', color: '#9d4edd' }
};

// ============================================
// MOOD PRESETS
// ============================================
export const MOOD_PRESETS = {
  mysterious: { label: 'Mysterious', emotions: { curiosity: 2, unease: 1, wonder: 1 }, color: '#9d4edd' },
  ominous: { label: 'Ominous', emotions: { fear: 2, anxiety: 2, tension: 1 }, color: '#4a1942' },
  triumphant: { label: 'Triumphant', emotions: { joy: 3, pride: 2, hope: 1 }, color: '#ffd166' },
  melancholic: { label: 'Melancholic', emotions: { sadness: 2, nostalgia: 2, longing: 1 }, color: '#457b9d' },
  romantic: { label: 'Romantic', emotions: { love: 3, longing: 1, hope: 1 }, color: '#ef476f' },
  tense: { label: 'Tense', emotions: { tension: 3, anxiety: 2, fear: 1 }, color: '#e63946' },
  peaceful: { label: 'Peaceful', emotions: { serenity: 3, gratitude: 1, hope: 1 }, color: '#06d6a0' },
  adventurous: { label: 'Adventurous', emotions: { curiosity: 2, wonder: 2, hope: 1 }, color: '#fb8500' },
  horrific: { label: 'Horrific', emotions: { fear: 3, disgust: 2, despair: 1 }, color: '#1d3557' },
  comedic: { label: 'Comedic', emotions: { amusement: 3, joy: 2, wonder: 1 }, color: '#a8dadc' },
  epic: { label: 'Epic', emotions: { awe: 3, tension: 2, hope: 1 }, color: '#7b2cbf' },
  intimate: { label: 'Intimate', emotions: { love: 2, serenity: 2, longing: 1 }, color: '#f4a261' },
  desperate: { label: 'Desperate', emotions: { despair: 2, tension: 2, fear: 2 }, color: '#780000' },
  revelatory: { label: 'Revelatory', emotions: { awe: 2, wonder: 2, curiosity: 1 }, color: '#48cae4' },
  bittersweet: { label: 'Bittersweet', emotions: { joy: 2, sadness: 2, nostalgia: 1 }, color: '#d4a373' }
};

// ============================================
// NARRATIVE ARCS
// ============================================
export const NARRATIVE_ARCS = {
  heros_journey: {
    label: "Hero's Journey (12 Stages)", desc: "Classic mythic structure from Joseph Campbell", scope: 'work',
    beats: [
      { key: 'ordinary_world', label: 'Ordinary World', position: 0.08, desc: 'Hero in their normal environment' },
      { key: 'call_to_adventure', label: 'Call to Adventure', position: 0.12, desc: 'Challenge or quest presented' },
      { key: 'refusal', label: 'Refusal of the Call', position: 0.17, desc: 'Hero hesitates or declines' },
      { key: 'meeting_mentor', label: 'Meeting the Mentor', position: 0.22, desc: 'Guide appears with wisdom or gifts' },
      { key: 'crossing_threshold', label: 'Crossing the Threshold', position: 0.25, desc: 'Hero commits and enters new world' },
      { key: 'tests_allies_enemies', label: 'Tests, Allies, Enemies', position: 0.40, desc: 'Challenges and new relationships' },
      { key: 'approach_cave', label: 'Approach to Inmost Cave', position: 0.50, desc: 'Preparing for major challenge' },
      { key: 'ordeal', label: 'The Ordeal', position: 0.55, desc: 'Facing greatest fear, death/rebirth' },
      { key: 'reward', label: 'Reward', position: 0.65, desc: 'Hero claims prize of the quest' },
      { key: 'road_back', label: 'The Road Back', position: 0.75, desc: 'Returning to ordinary world' },
      { key: 'resurrection', label: 'Resurrection', position: 0.85, desc: 'Final test, transformation complete' },
      { key: 'return_elixir', label: 'Return with Elixir', position: 0.95, desc: 'Hero returns transformed' }
    ]
  },
  three_act: {
    label: "Three Act Structure", desc: "Classic dramatic structure: Setup, Confrontation, Resolution", scope: 'work',
    beats: [
      { key: 'hook', label: 'Hook', position: 0.02, desc: 'Capture audience attention' },
      { key: 'setup', label: 'Setup', position: 0.08, desc: 'Establish world and characters' },
      { key: 'inciting_incident', label: 'Inciting Incident', position: 0.12, desc: 'Event that starts the story' },
      { key: 'plot_point_1', label: 'Plot Point 1', position: 0.25, desc: 'End of Act 1, commitment' },
      { key: 'rising_action', label: 'Rising Action', position: 0.35, desc: 'Complications increase' },
      { key: 'midpoint', label: 'Midpoint', position: 0.50, desc: 'Major shift, stakes raised' },
      { key: 'plot_point_2', label: 'Plot Point 2', position: 0.75, desc: 'All Is Lost moment' },
      { key: 'climax', label: 'Climax', position: 0.88, desc: 'Final confrontation' },
      { key: 'resolution', label: 'Resolution', position: 0.95, desc: 'New equilibrium' }
    ]
  },
  save_the_cat: {
    label: "Save the Cat (15 Beats)", desc: "Blake Snyder's detailed beat sheet", scope: 'work',
    beats: [
      { key: 'opening_image', label: 'Opening Image', position: 0.01, desc: 'Visual of starting world' },
      { key: 'theme_stated', label: 'Theme Stated', position: 0.05, desc: 'Hint at deeper meaning' },
      { key: 'setup', label: 'Setup', position: 0.08, desc: 'Introduce characters, world' },
      { key: 'catalyst', label: 'Catalyst', position: 0.10, desc: 'Life-changing event' },
      { key: 'debate', label: 'Debate', position: 0.18, desc: 'Hero questions the journey' },
      { key: 'break_into_two', label: 'Break Into Two', position: 0.25, desc: 'Hero enters new world' },
      { key: 'b_story', label: 'B Story', position: 0.28, desc: 'Secondary plot begins' },
      { key: 'fun_and_games', label: 'Fun and Games', position: 0.40, desc: 'Promise of premise' },
      { key: 'midpoint', label: 'Midpoint', position: 0.50, desc: 'False victory or defeat' },
      { key: 'bad_guys_close_in', label: 'Bad Guys Close In', position: 0.62, desc: 'Pressure increases' },
      { key: 'all_is_lost', label: 'All Is Lost', position: 0.75, desc: 'Lowest point' },
      { key: 'dark_night', label: 'Dark Night of Soul', position: 0.80, desc: 'Hero reflects deeply' },
      { key: 'break_into_three', label: 'Break Into Three', position: 0.85, desc: 'Solution found' },
      { key: 'finale', label: 'Finale', position: 0.92, desc: 'Final battle/resolution' },
      { key: 'final_image', label: 'Final Image', position: 0.99, desc: 'Transformed world' }
    ]
  },
  story_circle: {
    label: "Story Circle (Dan Harmon)", desc: "Simplified 8-step hero's journey", scope: 'work',
    beats: [
      { key: 'you', label: 'You (Comfort Zone)', position: 0.06, desc: 'Character in their zone' },
      { key: 'need', label: 'Need (Want Something)', position: 0.15, desc: 'Desire emerges' },
      { key: 'go', label: 'Go (Enter Unfamiliar)', position: 0.25, desc: 'Cross into new situation' },
      { key: 'search', label: 'Search (Adapt)', position: 0.40, desc: 'Face challenges' },
      { key: 'find', label: 'Find (Get It)', position: 0.55, desc: 'Achieve the goal' },
      { key: 'take', label: 'Take (Pay Price)', position: 0.70, desc: 'Heavy cost extracted' },
      { key: 'return', label: 'Return', position: 0.85, desc: 'Go back to familiar' },
      { key: 'change', label: 'Change (Capable of Change)', position: 0.95, desc: 'Transformed by journey' }
    ]
  },
  kishotenketsu: {
    label: "Kishotenketsu (4-Act)", desc: "Japanese structure, works without central conflict", scope: 'work',
    beats: [
      { key: 'ki', label: 'Ki (Introduction)', position: 0.20, desc: 'Introduce characters and setting' },
      { key: 'sho', label: 'Sho (Development)', position: 0.45, desc: 'Develop without complication' },
      { key: 'ten', label: 'Ten (Twist)', position: 0.70, desc: 'Unexpected turn or revelation' },
      { key: 'ketsu', label: 'Ketsu (Conclusion)', position: 0.95, desc: 'Reconciliation and harmony' }
    ]
  },
  five_act: {
    label: "Five Act (Freytag's Pyramid)", desc: "Classical dramatic structure with climax at center", scope: 'work',
    beats: [
      { key: 'exposition', label: 'Exposition', position: 0.10, desc: 'Introduction and setup' },
      { key: 'rising_action', label: 'Rising Action', position: 0.30, desc: 'Complications build' },
      { key: 'climax', label: 'Climax', position: 0.50, desc: 'Turning point, peak tension' },
      { key: 'falling_action', label: 'Falling Action', position: 0.70, desc: 'Consequences unfold' },
      { key: 'denouement', label: 'Denouement', position: 0.90, desc: 'Resolution of plot' }
    ]
  },
  seven_point: {
    label: "Seven-Point Structure", desc: "Dan Wells' structure for novels", scope: 'work',
    beats: [
      { key: 'hook', label: 'Hook', position: 0.05, desc: 'Starting state' },
      { key: 'plot_turn_1', label: 'Plot Turn 1', position: 0.15, desc: 'Call to action' },
      { key: 'pinch_1', label: 'Pinch Point 1', position: 0.30, desc: 'Pressure applied' },
      { key: 'midpoint', label: 'Midpoint', position: 0.50, desc: 'Reactive to active' },
      { key: 'pinch_2', label: 'Pinch Point 2', position: 0.70, desc: 'Darkest moment' },
      { key: 'plot_turn_2', label: 'Plot Turn 2', position: 0.85, desc: 'Final piece obtained' },
      { key: 'resolution', label: 'Resolution', position: 0.95, desc: 'Ending state' }
    ]
  },
  chapter_arc: {
    label: "Chapter Arc", desc: "Structure for individual chapters", scope: 'chapter',
    beats: [
      { key: 'chapter_hook', label: 'Hook', position: 0.05, desc: 'Grab attention' },
      { key: 'chapter_goal', label: 'Goal', position: 0.15, desc: 'What character wants' },
      { key: 'chapter_conflict', label: 'Conflict', position: 0.50, desc: 'Obstacles faced' },
      { key: 'chapter_turn', label: 'Turn', position: 0.80, desc: 'Unexpected development' },
      { key: 'chapter_cliffhanger', label: 'Cliffhanger', position: 0.95, desc: 'Unresolved tension' }
    ]
  },
  scene_arc: {
    label: "Scene Arc", desc: "Structure for individual scenes", scope: 'scene',
    beats: [
      { key: 'scene_goal', label: 'Goal', position: 0.10, desc: 'Character objective' },
      { key: 'scene_conflict', label: 'Conflict', position: 0.50, desc: 'Opposition' },
      { key: 'scene_outcome', label: 'Outcome', position: 0.90, desc: 'Success or failure' }
    ]
  }
};

// ============================================
// THEMES
// Expanded with universal themes from literature theory
// ============================================
export const THEMES = {
  // Core Universal Themes
  redemption: { label: 'Redemption', desc: 'The journey from guilt to forgiveness', suggestedBlocks: ['death_rebirth', 'sacrifice', 'return_elixir'], suggestedMoods: ['bittersweet', 'triumphant'], examples: 'Les Miserables, A Christmas Carol' },
  sacrifice: { label: 'Sacrifice', desc: 'Giving up something precious for greater good', suggestedBlocks: ['sacrifice', 'ordeal', 'death_rebirth'], suggestedMoods: ['bittersweet', 'epic'], examples: 'Sydney Carton, Dobby, Harry Potter' },
  love: { label: 'Love & Connection', desc: 'The power of human connection and belonging', suggestedBlocks: ['reunion', 'sacrifice', 'rescue'], suggestedMoods: ['romantic', 'intimate'], examples: 'Pride and Prejudice, Romeo and Juliet' },
  power: { label: 'Power & Corruption', desc: 'How power changes people and corrupts', suggestedBlocks: ['temptation', 'ordeal', 'confrontation'], suggestedMoods: ['epic', 'ominous'], examples: 'Macbeth, Animal Farm, Lord of the Rings' },
  identity: { label: 'Identity & Self', desc: 'Discovering who one truly is', suggestedBlocks: ['revelation', 'transformation', 'choice'], suggestedMoods: ['revelatory', 'intimate'], examples: 'Invisible Man, The Metamorphosis' },
  freedom: { label: 'Freedom vs. Oppression', desc: 'Breaking free from constraints', suggestedBlocks: ['escape', 'crossing_threshold', 'call_to_adventure'], suggestedMoods: ['adventurous', 'triumphant'], examples: '1984, The Handmaid\'s Tale' },
  justice: { label: 'Justice & Revenge', desc: 'Pursuit of fairness and retribution', suggestedBlocks: ['confrontation', 'reward', 'ordeal'], suggestedMoods: ['epic', 'triumphant'], examples: 'The Count of Monte Cristo, Les Miserables' },
  revenge: { label: 'Revenge', desc: 'The destructive cycle of retaliation', suggestedBlocks: ['confrontation', 'betrayal', 'ordeal'], suggestedMoods: ['tense', 'desperate'], examples: 'Hamlet, Kill Bill, Moby Dick' },
  survival: { label: 'Survival', desc: 'The struggle to exist against impossible odds', suggestedBlocks: ['escape', 'ordeal', 'tests_allies_enemies'], suggestedMoods: ['desperate', 'tense'], examples: 'The Road, Lord of the Flies, The Martian' },
  growth: { label: 'Coming of Age', desc: 'Transition from innocence to experience', suggestedBlocks: ['crossing_threshold', 'meeting_mentor', 'transformation'], suggestedMoods: ['adventurous', 'bittersweet'], examples: 'To Kill a Mockingbird, Catcher in the Rye' },
  betrayal: { label: 'Betrayal & Trust', desc: 'Breaking of sacred trust', suggestedBlocks: ['betrayal', 'revelation', 'confrontation'], suggestedMoods: ['tense', 'desperate'], examples: 'Julius Caesar, Othello, Game of Thrones' },
  family: { label: 'Family Bonds', desc: 'Bonds and conflicts of kinship', suggestedBlocks: ['ordinary_world', 'reunion', 'loss'], suggestedMoods: ['intimate', 'bittersweet'], examples: 'The Godfather, Little Women, East of Eden' },
  legacy: { label: 'Legacy & Memory', desc: 'What we leave behind for future generations', suggestedBlocks: ['return_elixir', 'sacrifice', 'death_rebirth'], suggestedMoods: ['bittersweet', 'epic'], examples: 'Citizen Kane, Ozymandias' },
  truth: { label: 'Truth & Illusion', desc: 'Pursuit of truth versus comfortable lies', suggestedBlocks: ['revelation', 'discovery', 'confrontation'], suggestedMoods: ['revelatory', 'mysterious'], examples: 'The Matrix, Gone Girl' },
  mortality: { label: 'Death & Mortality', desc: 'Facing death and finding meaning in finite life', suggestedBlocks: ['ordeal', 'death_rebirth', 'loss'], suggestedMoods: ['melancholic', 'epic'], examples: 'The Book Thief, When Breath Becomes Air' },
  corruption: { label: 'Corruption', desc: 'Decay of virtue over time', suggestedBlocks: ['temptation', 'betrayal', 'transformation'], suggestedMoods: ['ominous', 'desperate'], examples: 'Breaking Bad, The Picture of Dorian Gray' },
  
  // Additional Expanded Themes
  good_vs_evil: { label: 'Good vs. Evil', desc: 'Moral battle between light and darkness', suggestedBlocks: ['ordeal', 'confrontation', 'resurrection'], suggestedMoods: ['epic', 'triumphant'], examples: 'Lord of the Rings, Star Wars, Harry Potter' },
  ambition: { label: 'Ambition', desc: 'The drive to achieve and its costs', suggestedBlocks: ['temptation', 'ordeal', 'climax'], suggestedMoods: ['tense', 'ominous'], examples: 'Macbeth, The Great Gatsby, Citizen Kane' },
  isolation: { label: 'Isolation & Loneliness', desc: 'The pain of separation from others', suggestedBlocks: ['ordinary_world', 'tests_allies_enemies', 'ordeal'], suggestedMoods: ['melancholic', 'mysterious'], examples: 'Frankenstein, The Remains of the Day' },
  nature_vs_nurture: { label: 'Nature vs. Nurture', desc: 'Are we born or made who we are?', suggestedBlocks: ['revelation', 'transformation', 'choice'], suggestedMoods: ['intimate', 'revelatory'], examples: 'Frankenstein, Oliver Twist' },
  fate_vs_free_will: { label: 'Fate vs. Free Will', desc: 'Are our lives predetermined or chosen?', suggestedBlocks: ['prophecy', 'choice', 'ordeal'], suggestedMoods: ['mysterious', 'tense'], examples: 'Oedipus Rex, Minority Report, Macbeth' },
  appearance_vs_reality: { label: 'Appearance vs. Reality', desc: 'Things are not what they seem', suggestedBlocks: ['revelation', 'betrayal', 'discovery'], suggestedMoods: ['mysterious', 'tense'], examples: 'Hamlet, Gone Girl, The Usual Suspects' },
  the_outsider: { label: 'The Outsider', desc: 'Alienation from society, different perspectives', suggestedBlocks: ['ordinary_world', 'crossing_threshold', 'tests_allies_enemies'], suggestedMoods: ['melancholic', 'mysterious'], examples: 'The Stranger, Frankenstein, Edward Scissorhands' },
  hope_vs_despair: { label: 'Hope vs. Despair', desc: 'The struggle to maintain hope in darkness', suggestedBlocks: ['all_is_lost', 'dark_night', 'resurrection'], suggestedMoods: ['desperate', 'triumphant'], examples: 'The Shawshank Redemption, Les Miserables' },
  war_and_peace: { label: 'War & Peace', desc: 'The human cost of conflict', suggestedBlocks: ['ordeal', 'loss', 'resolution'], suggestedMoods: ['epic', 'melancholic'], examples: 'War and Peace, All Quiet on the Western Front' },
  class_society: { label: 'Class & Social Hierarchy', desc: 'Inequality and social barriers', suggestedBlocks: ['ordinary_world', 'confrontation', 'transformation'], suggestedMoods: ['tense', 'intimate'], examples: 'Pride and Prejudice, Great Expectations, Parasite' },
  hubris: { label: 'Hubris & Pride', desc: 'Excessive pride leading to downfall', suggestedBlocks: ['temptation', 'ordeal', 'climax'], suggestedMoods: ['ominous', 'epic'], examples: 'Oedipus Rex, Icarus, Frankenstein' },
  forbidden_knowledge: { label: 'Forbidden Knowledge', desc: 'Dangerous pursuit of truth that should remain hidden', suggestedBlocks: ['temptation', 'ordeal', 'revelation'], suggestedMoods: ['mysterious', 'horrific'], examples: 'Frankenstein, Faustus, Lovecraft stories' },
  innocence_lost: { label: 'Loss of Innocence', desc: 'The painful transition from naivety to experience', suggestedBlocks: ['crossing_threshold', 'ordeal', 'transformation'], suggestedMoods: ['bittersweet', 'melancholic'], examples: 'Lord of the Flies, Catcher in the Rye' },
  nature_civilization: { label: 'Nature vs. Civilization', desc: 'Conflict between wild and tamed worlds', suggestedBlocks: ['crossing_threshold', 'tests_allies_enemies', 'choice'], suggestedMoods: ['adventurous', 'peaceful'], examples: 'Walden, Avatar, Princess Mononoke' },
  memory_and_past: { label: 'Memory & The Past', desc: 'How past shapes present, the burden of memory', suggestedBlocks: ['ordinary_world', 'revelation', 'resolution'], suggestedMoods: ['melancholic', 'intimate'], examples: 'Great Gatsby, Remains of the Day, Beloved' }
};

// ============================================
// CONFLICTS
// ============================================
export const CONFLICTS = {
  person_vs_person: { label: 'Person vs Person', desc: 'Direct conflict with another character' },
  person_vs_self: { label: 'Person vs Self', desc: 'Internal struggle with oneself' },
  person_vs_nature: { label: 'Person vs Nature', desc: 'Struggle against natural forces' },
  person_vs_society: { label: 'Person vs Society', desc: 'Individual against social norms' },
  person_vs_technology: { label: 'Person vs Technology', desc: 'Conflict with machines or progress' },
  person_vs_supernatural: { label: 'Person vs Supernatural', desc: 'Struggle against gods, magic, or fate' },
  person_vs_unknown: { label: 'Person vs Unknown', desc: 'Facing the mysterious and unexplained' }
};
