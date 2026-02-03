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
// Expanded with literary and traditional story patterns
// ============================================
export const CHARACTER_ARCHETYPES = {
  // Core Archetypes (Campbell/Vogler)
  hero: { label: 'Hero', desc: 'The protagonist who undergoes transformation through trials', suggestedTraits: ['courage', 'resilient', 'compassion'], examples: 'Frodo, Harry Potter, Katniss' },
  mentor: { label: 'Mentor', desc: 'Guides and teaches the hero, often with wisdom', suggestedTraits: ['wisdom', 'patient', 'mysterious'], examples: 'Gandalf, Dumbledore, Obi-Wan' },
  shadow: { label: 'Shadow', desc: 'The dark reflection of the hero, embodies rejected aspects', suggestedTraits: ['cunning', 'pride', 'wrath'], examples: 'Sauron, Voldemort, Darth Vader' },
  herald: { label: 'Herald', desc: 'Announces the call to adventure, brings change', suggestedTraits: ['mysterious', 'charismatic'], examples: 'R2-D2, Hagrid, the White Rabbit' },
  shapeshifter: { label: 'Shapeshifter', desc: 'Unpredictable ally/enemy, keeps others guessing', suggestedTraits: ['deceit', 'cunning', 'volatile'], examples: 'Gollum, Snape, Catwoman' },
  trickster: { label: 'Trickster', desc: 'Provides comic relief, questions status quo', suggestedTraits: ['cunning', 'rebellious', 'creativity'], examples: 'Loki, Fred & George, Jack Sparrow' },
  threshold_guardian: { label: 'Threshold Guardian', desc: 'Tests the hero before major transitions', suggestedTraits: ['stoic', 'strong', 'justice'], examples: 'Cerberus, the Sphinx, bouncers' },
  ally: { label: 'Ally', desc: 'Supports the hero, provides skills or companionship', suggestedTraits: ['loyalty', 'protective', 'optimistic'], examples: 'Sam Gamgee, Ron Weasley, Chewbacca' },
  
  // Family Archetypes
  mother: { label: 'Mother Figure', desc: 'Nurturing, protective, represents home and safety', suggestedTraits: ['compassion', 'protective', 'wisdom'], examples: 'Mrs. Weasley, Galadriel' },
  father: { label: 'Father Figure', desc: 'Authority, rules, represents order or tyranny', suggestedTraits: ['justice', 'stoic', 'pride'], examples: 'Ned Stark, Mufasa, Atticus Finch' },
  innocent: { label: 'Innocent', desc: 'Pure, uncorrupted, represents hope', suggestedTraits: ['naivety', 'optimistic', 'compassion'], examples: 'Dorothy, Pippin, Scout Finch' },
  outcast: { label: 'Outcast', desc: 'Lives outside society, unique perspective', suggestedTraits: ['resilient', 'rebellious', 'cynical'], examples: 'Heathcliff, Quasimodo, Jon Snow' },
  
  // Extended Archetypes from Literature
  femme_fatale: { label: 'Femme Fatale', desc: 'Seductive, dangerous, uses allure as power', suggestedTraits: ['charismatic', 'cunning', 'mysterious'], examples: 'Lady Macbeth, Carmen, Milady de Winter' },
  byronic_hero: { label: 'Byronic Hero', desc: 'Brooding, complex, morally ambiguous protagonist', suggestedTraits: ['passionate', 'cynical', 'pride'], examples: 'Heathcliff, Mr. Rochester, Batman' },
  everyman: { label: 'Everyman', desc: 'Ordinary person in extraordinary circumstances', suggestedTraits: ['resilient', 'pragmatism', 'empathetic'], examples: 'Bilbo, Arthur Dent, Winston Smith' },
  sage: { label: 'Sage', desc: 'Keeper of knowledge, provides crucial information', suggestedTraits: ['wisdom', 'patient', 'curiosity'], examples: 'Yoda, the Oracle, Tiresias' },
  ruler: { label: 'Ruler', desc: 'Leader seeking control and order', suggestedTraits: ['justice', 'pride', 'diplomatic'], examples: 'Aragorn, Mufasa, Elizabeth Bennet' },
  rebel: { label: 'Rebel', desc: 'Fights against the establishment, seeks change', suggestedTraits: ['rebellious', 'courage', 'passionate'], examples: 'Katniss, V (V for Vendetta), Robin Hood' },
  caregiver: { label: 'Caregiver', desc: 'Protects and nurtures others selflessly', suggestedTraits: ['compassion', 'selflessness', 'protective'], examples: 'Sam Gamgee, Samwell Tarly, Mary Poppins' },
  explorer: { label: 'Explorer', desc: 'Seeks new experiences, freedom, discovery', suggestedTraits: ['curiosity', 'courage', 'resilient'], examples: 'Indiana Jones, Bilbo, Captain Kirk' },
  lover: { label: 'Lover', desc: 'Driven by passion, seeks connection and beauty', suggestedTraits: ['passionate', 'empathetic', 'love'], examples: 'Romeo, Juliet, Gatsby' },
  magician: { label: 'Magician', desc: 'Transforms reality, understands hidden laws', suggestedTraits: ['wisdom', 'creativity', 'mysterious'], examples: 'Merlin, Doctor Strange, Prospero' },
  jester: { label: 'Jester', desc: 'Lives in the moment, brings joy and truth through humor', suggestedTraits: ['amusement', 'cunning', 'rebellious'], examples: 'The Fool (Lear), Puck, Tyrion' },
  orphan: { label: 'Orphan', desc: 'Seeks belonging and safety after loss', suggestedTraits: ['resilient', 'empathetic', 'cynical'], examples: 'Harry Potter, Oliver Twist, Cinderella' },
  warrior: { label: 'Warrior', desc: 'Fights for what they believe in with skill and courage', suggestedTraits: ['courage', 'strong', 'loyalty'], examples: 'Achilles, Eowyn, Wonder Woman' },
  
  // Villain Archetypes
  tyrant: { label: 'Tyrant', desc: 'Uses power to oppress and control others', suggestedTraits: ['wrath', 'pride', 'cruelty'], examples: 'Sauron, Big Brother, Joffrey' },
  seducer: { label: 'Seducer', desc: 'Manipulates through charm and false promises', suggestedTraits: ['charismatic', 'deceit', 'cunning'], examples: 'Iago, Satan (Paradise Lost), Littlefinger' },
  fanatic: { label: 'Fanatic', desc: 'Driven by extreme ideology, believes ends justify means', suggestedTraits: ['passionate', 'pride', 'justice'], examples: 'Javert, Frollo, the High Sparrow' },
  tragic_villain: { label: 'Tragic Villain', desc: 'Could have been a hero, corrupted by circumstance', suggestedTraits: ['pride', 'passionate', 'melancholic'], examples: 'Anakin Skywalker, Macbeth, Magneto' }
};

// ============================================
// CHARACTER RELATIONSHIPS
// Expanded with patterns from classic literature
// ============================================
export const RELATIONSHIP_TYPES = {
  // Family
  parent_child: { label: 'Parent-Child', category: 'family', bidirectional: false, color: '#06d6a0', examples: 'Darth Vader-Luke, Mufasa-Simba' },
  siblings: { label: 'Siblings', category: 'family', bidirectional: true, color: '#06d6a0', examples: 'Fred-George, Thor-Loki' },
  spouses: { label: 'Spouses', category: 'family', bidirectional: true, color: '#06d6a0', examples: 'Macbeth-Lady Macbeth' },
  cousins: { label: 'Cousins', category: 'family', bidirectional: true, color: '#06d6a0' },
  twins: { label: 'Twins', category: 'family', bidirectional: true, color: '#06d6a0', examples: 'Viola-Sebastian, Fred-George' },
  adoptive: { label: 'Adoptive Family', category: 'family', bidirectional: false, color: '#06d6a0', examples: 'Jon Snow-Ned Stark, Superman-Kents' },
  
  // Social
  friends: { label: 'Friends', category: 'social', bidirectional: true, color: '#118ab2', examples: 'Frodo-Sam, Harry-Ron-Hermione' },
  rivals: { label: 'Rivals', category: 'social', bidirectional: true, color: '#e63946', examples: 'Holmes-Moriarty, Harry-Draco' },
  enemies: { label: 'Enemies', category: 'social', bidirectional: true, color: '#9d0208', examples: 'Ahab-Moby Dick, Batman-Joker' },
  acquaintances: { label: 'Acquaintances', category: 'social', bidirectional: true, color: '#8b949e' },
  childhood_friends: { label: 'Childhood Friends', category: 'social', bidirectional: true, color: '#118ab2', examples: 'Heathcliff-Catherine' },
  confidant: { label: 'Confidant', category: 'social', bidirectional: false, color: '#118ab2', examples: 'Horatio to Hamlet, Watson to Holmes' },
  
  // Hierarchical
  mentor_student: { label: 'Mentor-Student', category: 'hierarchy', bidirectional: false, color: '#9d4edd', examples: 'Gandalf-Frodo, Obi-Wan-Luke' },
  master_servant: { label: 'Master-Servant', category: 'hierarchy', bidirectional: false, color: '#6c757d', examples: 'Don Quixote-Sancho, Jeeves-Wooster' },
  ruler_subject: { label: 'Ruler-Subject', category: 'hierarchy', bidirectional: false, color: '#ffd166', examples: 'King Lear-daughters' },
  commander_soldier: { label: 'Commander-Soldier', category: 'hierarchy', bidirectional: false, color: '#fb8500' },
  master_apprentice: { label: 'Master-Apprentice', category: 'hierarchy', bidirectional: false, color: '#9d4edd', examples: 'Qui-Gon-Obi-Wan, sorcerer-apprentice' },
  guardian_ward: { label: 'Guardian-Ward', category: 'hierarchy', bidirectional: false, color: '#06d6a0', examples: 'Rochester-Adele, Sirius-Harry' },
  
  // Romantic
  lovers: { label: 'Lovers', category: 'romantic', bidirectional: true, color: '#ef476f', examples: 'Romeo-Juliet, Elizabeth-Darcy' },
  unrequited: { label: 'Unrequited Love', category: 'romantic', bidirectional: false, color: '#ff8fa3', examples: 'Snape-Lily, Gatsby-Daisy' },
  former_lovers: { label: 'Former Lovers', category: 'romantic', bidirectional: true, color: '#c9184a', examples: 'Heathcliff-Catherine' },
  betrothed: { label: 'Betrothed', category: 'romantic', bidirectional: true, color: '#ff758f' },
  star_crossed: { label: 'Star-Crossed Lovers', category: 'romantic', bidirectional: true, color: '#ef476f', examples: 'Romeo-Juliet, Tristan-Isolde' },
  love_triangle: { label: 'Love Triangle', category: 'romantic', bidirectional: false, color: '#ff758f', examples: 'Arthur-Lancelot-Guinevere' },
  forbidden_love: { label: 'Forbidden Love', category: 'romantic', bidirectional: true, color: '#c9184a', examples: 'Romeo-Juliet, Heathcliff-Catherine' },
  
  // Professional
  allies: { label: 'Allies', category: 'professional', bidirectional: true, color: '#4cc9f0' },
  partners: { label: 'Partners', category: 'professional', bidirectional: true, color: '#4895ef', examples: 'Holmes-Watson, Butch-Sundance' },
  employer_employee: { label: 'Employer-Employee', category: 'professional', bidirectional: false, color: '#4361ee' },
  comrades_in_arms: { label: 'Comrades in Arms', category: 'professional', bidirectional: true, color: '#4895ef', examples: 'Fellowship of the Ring' },
  
  // Secret/Complex
  secret_allies: { label: 'Secret Allies', category: 'secret', bidirectional: true, color: '#7209b7', hidden: true, examples: 'Snape-Dumbledore' },
  blackmail: { label: 'Blackmailer-Victim', category: 'secret', bidirectional: false, color: '#3a0ca3', hidden: true },
  secret_identity: { label: 'Knows Secret Identity', category: 'secret', bidirectional: false, color: '#560bad', hidden: true },
  secret_siblings: { label: 'Secret Siblings', category: 'secret', bidirectional: true, color: '#7209b7', hidden: true, examples: 'Luke-Leia' },
  impersonator: { label: 'Impersonating', category: 'secret', bidirectional: false, color: '#3a0ca3', hidden: true },
  
  // Conflict
  betrayed_by: { label: 'Betrayed By', category: 'conflict', bidirectional: false, color: '#d00000', examples: 'Caesar-Brutus, Othello-Iago' },
  owes_debt: { label: 'Owes Debt To', category: 'conflict', bidirectional: false, color: '#dc2f02', examples: 'Jean Valjean-Bishop' },
  seeks_revenge: { label: 'Seeks Revenge On', category: 'conflict', bidirectional: false, color: '#9d0208', examples: 'Edmond Dantes-Fernand' },
  nemesis: { label: 'Nemesis', category: 'conflict', bidirectional: true, color: '#9d0208', examples: 'Holmes-Moriarty, Batman-Joker' },
  foil: { label: 'Foil', category: 'conflict', bidirectional: true, color: '#e63946', examples: 'Harry-Draco, Elizabeth-Wickham' },
  
  // Literary Dynamics
  doppelganger: { label: 'Doppelganger', category: 'literary', bidirectional: true, color: '#9d4edd', examples: 'Jekyll-Hyde, Dorian-Portrait' },
  mirror_character: { label: 'Mirror Character', category: 'literary', bidirectional: true, color: '#9d4edd', examples: 'Luke-Vader (what Luke could become)' }
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
