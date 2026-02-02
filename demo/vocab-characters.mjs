/**
 * SCRIPTA Vocabulary - Characters Module
 * 
 * Character traits, archetypes, and relationships.
 */

// ============================================
// CHARACTER TRAITS
// ============================================
export const CHARACTER_TRAITS = {
  // Positive Moral Traits
  courage: { label: 'Courage', desc: 'Faces danger and fear with bravery', category: 'moral' },
  honesty: { label: 'Honesty', desc: 'Speaks truth even when difficult', category: 'moral' },
  loyalty: { label: 'Loyalty', desc: 'Remains faithful to allies and causes', category: 'moral' },
  compassion: { label: 'Compassion', desc: 'Shows deep empathy for others suffering', category: 'moral' },
  integrity: { label: 'Integrity', desc: 'Acts according to strong moral principles', category: 'moral' },
  selflessness: { label: 'Selflessness', desc: 'Puts others needs before own', category: 'moral' },
  justice: { label: 'Justice', desc: 'Seeks fairness and right wrongs', category: 'moral' },
  mercy: { label: 'Mercy', desc: 'Shows forgiveness to those who wronged', category: 'moral' },
  
  // Negative Moral Traits
  greed: { label: 'Greed', desc: 'Excessive desire for wealth or power', category: 'moral-negative' },
  cruelty: { label: 'Cruelty', desc: 'Takes pleasure in causing suffering', category: 'moral-negative' },
  deceit: { label: 'Deceit', desc: 'Habitually lies and manipulates', category: 'moral-negative' },
  cowardice: { label: 'Cowardice', desc: 'Avoids danger at any cost', category: 'moral-negative' },
  envy: { label: 'Envy', desc: 'Resents others success or possessions', category: 'moral-negative' },
  pride: { label: 'Pride', desc: 'Excessive self-importance', category: 'moral-negative' },
  wrath: { label: 'Wrath', desc: 'Prone to violent anger', category: 'moral-negative' },
  
  // Intellectual Traits
  wisdom: { label: 'Wisdom', desc: 'Deep understanding and good judgment', category: 'intellectual' },
  curiosity: { label: 'Curiosity', desc: 'Eager to learn and explore', category: 'intellectual' },
  cunning: { label: 'Cunning', desc: 'Clever and strategic thinking', category: 'intellectual' },
  creativity: { label: 'Creativity', desc: 'Innovative and imaginative', category: 'intellectual' },
  pragmatism: { label: 'Pragmatism', desc: 'Practical, results-oriented thinking', category: 'intellectual' },
  naivety: { label: 'Naivety', desc: 'Innocent, lacks worldly experience', category: 'intellectual' },
  
  // Emotional Traits
  passionate: { label: 'Passionate', desc: 'Feels and expresses emotions intensely', category: 'emotional' },
  stoic: { label: 'Stoic', desc: 'Endures hardship without complaint', category: 'emotional' },
  volatile: { label: 'Volatile', desc: 'Emotions change rapidly', category: 'emotional' },
  melancholic: { label: 'Melancholic', desc: 'Prone to sadness and reflection', category: 'emotional' },
  optimistic: { label: 'Optimistic', desc: 'Sees the positive in situations', category: 'emotional' },
  cynical: { label: 'Cynical', desc: 'Distrusts human motives', category: 'emotional' },
  empathetic: { label: 'Empathetic', desc: 'Deeply feels others emotions', category: 'emotional' },
  
  // Social Traits
  charismatic: { label: 'Charismatic', desc: 'Naturally attracts and inspires others', category: 'social' },
  introverted: { label: 'Introverted', desc: 'Draws energy from solitude', category: 'social' },
  diplomatic: { label: 'Diplomatic', desc: 'Skilled at negotiation and peace', category: 'social' },
  rebellious: { label: 'Rebellious', desc: 'Resists authority and convention', category: 'social' },
  protective: { label: 'Protective', desc: 'Defends loved ones fiercely', category: 'social' },
  mysterious: { label: 'Mysterious', desc: 'Keeps secrets, hard to read', category: 'social' },
  
  // Physical/Action Traits
  resilient: { label: 'Resilient', desc: 'Recovers quickly from setbacks', category: 'physical' },
  agile: { label: 'Agile', desc: 'Quick and nimble in movement', category: 'physical' },
  strong: { label: 'Strong', desc: 'Physical power and endurance', category: 'physical' },
  graceful: { label: 'Graceful', desc: 'Moves with elegance and poise', category: 'physical' },
  reckless: { label: 'Reckless', desc: 'Acts without considering consequences', category: 'physical' },
  patient: { label: 'Patient', desc: 'Waits calmly for the right moment', category: 'physical' }
};

// ============================================
// CHARACTER ARCHETYPES
// ============================================
export const CHARACTER_ARCHETYPES = {
  hero: { label: 'Hero', desc: 'The protagonist who undergoes transformation through trials', suggestedTraits: ['courage', 'resilient', 'compassion'] },
  mentor: { label: 'Mentor', desc: 'Guides and teaches the hero, often with wisdom', suggestedTraits: ['wisdom', 'patient', 'mysterious'] },
  shadow: { label: 'Shadow', desc: 'The dark reflection of the hero, embodies rejected aspects', suggestedTraits: ['cunning', 'pride', 'wrath'] },
  herald: { label: 'Herald', desc: 'Announces the call to adventure, brings change', suggestedTraits: ['mysterious', 'charismatic'] },
  shapeshifter: { label: 'Shapeshifter', desc: 'Unpredictable ally/enemy, keeps others guessing', suggestedTraits: ['deceit', 'cunning', 'volatile'] },
  trickster: { label: 'Trickster', desc: 'Provides comic relief, questions status quo', suggestedTraits: ['cunning', 'rebellious', 'creativity'] },
  threshold_guardian: { label: 'Threshold Guardian', desc: 'Tests the hero before major transitions', suggestedTraits: ['stoic', 'strong', 'justice'] },
  ally: { label: 'Ally', desc: 'Supports the hero, provides skills or companionship', suggestedTraits: ['loyalty', 'protective', 'optimistic'] },
  mother: { label: 'Mother Figure', desc: 'Nurturing, protective, represents home and safety', suggestedTraits: ['compassion', 'protective', 'wisdom'] },
  father: { label: 'Father Figure', desc: 'Authority, rules, represents order or tyranny', suggestedTraits: ['justice', 'stoic', 'pride'] },
  innocent: { label: 'Innocent', desc: 'Pure, uncorrupted, represents hope', suggestedTraits: ['naivety', 'optimistic', 'compassion'] },
  outcast: { label: 'Outcast', desc: 'Lives outside society, unique perspective', suggestedTraits: ['resilient', 'rebellious', 'cynical'] }
};

// ============================================
// CHARACTER RELATIONSHIPS
// ============================================
export const RELATIONSHIP_TYPES = {
  // Family
  parent_child: { label: 'Parent-Child', category: 'family', bidirectional: false, color: '#06d6a0' },
  siblings: { label: 'Siblings', category: 'family', bidirectional: true, color: '#06d6a0' },
  spouses: { label: 'Spouses', category: 'family', bidirectional: true, color: '#06d6a0' },
  cousins: { label: 'Cousins', category: 'family', bidirectional: true, color: '#06d6a0' },
  
  // Social
  friends: { label: 'Friends', category: 'social', bidirectional: true, color: '#118ab2' },
  rivals: { label: 'Rivals', category: 'social', bidirectional: true, color: '#e63946' },
  enemies: { label: 'Enemies', category: 'social', bidirectional: true, color: '#9d0208' },
  acquaintances: { label: 'Acquaintances', category: 'social', bidirectional: true, color: '#8b949e' },
  
  // Hierarchical
  mentor_student: { label: 'Mentor-Student', category: 'hierarchy', bidirectional: false, color: '#9d4edd' },
  master_servant: { label: 'Master-Servant', category: 'hierarchy', bidirectional: false, color: '#6c757d' },
  ruler_subject: { label: 'Ruler-Subject', category: 'hierarchy', bidirectional: false, color: '#ffd166' },
  commander_soldier: { label: 'Commander-Soldier', category: 'hierarchy', bidirectional: false, color: '#fb8500' },
  
  // Romantic
  lovers: { label: 'Lovers', category: 'romantic', bidirectional: true, color: '#ef476f' },
  unrequited: { label: 'Unrequited Love', category: 'romantic', bidirectional: false, color: '#ff8fa3' },
  former_lovers: { label: 'Former Lovers', category: 'romantic', bidirectional: true, color: '#c9184a' },
  betrothed: { label: 'Betrothed', category: 'romantic', bidirectional: true, color: '#ff758f' },
  
  // Professional
  allies: { label: 'Allies', category: 'professional', bidirectional: true, color: '#4cc9f0' },
  partners: { label: 'Partners', category: 'professional', bidirectional: true, color: '#4895ef' },
  employer_employee: { label: 'Employer-Employee', category: 'professional', bidirectional: false, color: '#4361ee' },
  
  // Secret/Complex
  secret_allies: { label: 'Secret Allies', category: 'secret', bidirectional: true, color: '#7209b7', hidden: true },
  blackmail: { label: 'Blackmailer-Victim', category: 'secret', bidirectional: false, color: '#3a0ca3', hidden: true },
  secret_identity: { label: 'Knows Secret Identity', category: 'secret', bidirectional: false, color: '#560bad', hidden: true },
  
  // Conflict
  betrayed_by: { label: 'Betrayed By', category: 'conflict', bidirectional: false, color: '#d00000' },
  owes_debt: { label: 'Owes Debt To', category: 'conflict', bidirectional: false, color: '#dc2f02' },
  seeks_revenge: { label: 'Seeks Revenge On', category: 'conflict', bidirectional: false, color: '#9d0208' }
};

// ============================================
// NAME LISTS (for random generation)
// ============================================
export const CHARACTER_NAMES = [
  'Elena', 'Marcus', 'Theron', 'Lyra', 'Zara', 'Kai', 'Nyx', 'Orion',
  'Aria', 'Caspian', 'Freya', 'Damon', 'Selene', 'Rowan', 'Iris', 'Cyrus',
  'Luna', 'Atlas', 'Nova', 'Felix', 'Maya', 'Jasper', 'Aurora', 'Finn',
  'Elara', 'Silas', 'Ivy', 'Dante', 'Celeste', 'Griffin', 'Mira', 'Leo',
  'Sage', 'Ash', 'River', 'Storm', 'Phoenix', 'Raven', 'Wren', 'Jade'
];
