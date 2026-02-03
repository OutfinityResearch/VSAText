/**
 * SCRIPTA Vocabulary - Wisdom Module
 * 
 * Philosophical teachings, humanist principles, psychological insights,
 * and educational truths that stories can illuminate.
 * 
 * Stories are humanity's oldest educational technology. This module
 * captures the insights stories can convey.
 */

// ============================================
// PHILOSOPHICAL TRADITIONS
// Major schools of thought that inform stories
// ============================================
export const PHILOSOPHICAL_TRADITIONS = {
  stoicism: {
    label: 'Stoicism',
    origin: 'Ancient Greece/Rome (Zeno, Marcus Aurelius, Epictetus)',
    corePrinciple: 'Control what you can, accept what you cannot',
    keyInsights: [
      'Virtue is the highest good',
      'External events are neutral; our judgments create suffering',
      'Focus on character, not circumstances',
      'Memento mori - remember death to live fully'
    ],
    storyApplications: ['characters facing adversity with dignity', 'letting go of what cannot be changed'],
    examples: 'Marcus Aurelius in Gladiator, Batman\'s discipline'
  },
  existentialism: {
    label: 'Existentialism',
    origin: 'Modern Europe (Kierkegaard, Sartre, Camus)',
    corePrinciple: 'Existence precedes essence - we create our own meaning',
    keyInsights: [
      'Life has no inherent meaning; we must create it',
      'Freedom is both liberating and terrifying',
      'Authenticity requires facing absurdity',
      'We are responsible for our choices'
    ],
    storyApplications: ['characters finding purpose in meaningless world', 'embracing freedom despite anxiety'],
    examples: 'The Stranger, Fight Club, Rick in Rick and Morty'
  },
  buddhism: {
    label: 'Buddhist Philosophy',
    origin: 'Ancient India (Siddhartha Gautama)',
    corePrinciple: 'Suffering comes from attachment; liberation through letting go',
    keyInsights: [
      'All life involves suffering (dukkha)',
      'Attachment causes suffering',
      'There is a path to end suffering',
      'Impermanence is the nature of all things'
    ],
    storyApplications: ['characters learning to let go', 'finding peace through acceptance'],
    examples: 'Little Buddha, Kung Fu Panda, Avatar: The Last Airbender'
  },
  confucianism: {
    label: 'Confucian Ethics',
    origin: 'Ancient China (Confucius)',
    corePrinciple: 'Social harmony through proper relationships and virtue',
    keyInsights: [
      'Respect for elders and tradition',
      'Self-cultivation leads to social harmony',
      'The rectification of names - things should be what they claim to be',
      'Benevolence (ren) is the highest virtue'
    ],
    storyApplications: ['family duty vs personal desire', 'mentorship and lineage'],
    examples: 'Mulan, Kung Fu Panda, many Asian family dramas'
  },
  taoism: {
    label: 'Taoist Philosophy',
    origin: 'Ancient China (Laozi, Zhuangzi)',
    corePrinciple: 'Live in harmony with the natural way (Tao)',
    keyInsights: [
      'Wu wei - effortless action, going with the flow',
      'Opposites are complementary (yin/yang)',
      'Simplicity and naturalness over artifice',
      'The softest overcomes the hardest'
    ],
    storyApplications: ['victory through yielding', 'nature vs civilization'],
    examples: 'Crouching Tiger Hidden Dragon, many martial arts films'
  },
  humanism: {
    label: 'Secular Humanism',
    origin: 'Renaissance to Modern (Erasmus, Voltaire, Sagan)',
    corePrinciple: 'Human welfare and reason are the highest values',
    keyInsights: [
      'Human beings have inherent dignity and worth',
      'Reason and evidence guide ethics, not dogma',
      'This life matters; focus on improving it',
      'Compassion and empathy are core virtues'
    ],
    storyApplications: ['valuing human life over ideology', 'science vs superstition'],
    examples: 'Star Trek, The Martian, Contact'
  },
  nihilism_and_absurdism: {
    label: 'Absurdism',
    origin: 'Modern (Camus, Beckett)',
    corePrinciple: 'Life is absurd, but we must live anyway',
    keyInsights: [
      'The universe has no inherent meaning',
      'The absurd is the conflict between our desire for meaning and the silent universe',
      'We must imagine Sisyphus happy',
      'Revolt, freedom, and passion are responses to absurdity'
    ],
    storyApplications: ['finding joy despite meaninglessness', 'dark comedy'],
    examples: 'Waiting for Godot, The Big Lebowski, BoJack Horseman'
  }
};

// ============================================
// UNIVERSAL MORAL INSIGHTS
// Ethical truths across cultures
// ============================================
export const MORAL_INSIGHTS = {
  // Justice & Fairness
  golden_rule: {
    label: 'The Golden Rule',
    insight: 'Treat others as you wish to be treated',
    variations: 'Found in virtually every ethical tradition',
    storyApplications: ['karma arcs', 'reversal of fortune', 'empathy development'],
    examples: 'A Christmas Carol, any redemption story'
  },
  justice_vs_mercy: {
    label: 'Justice vs. Mercy',
    insight: 'Both strict justice and mercy have their place',
    variations: 'The tension between law and compassion',
    storyApplications: ['judge characters', 'forgiveness arcs', 'legal dramas'],
    examples: 'Les Miserables (Javert vs Valjean), Measure for Measure'
  },
  ends_and_means: {
    label: 'Ends and Means',
    insight: 'Do ends justify means? The method shapes the outcome',
    variations: 'Consequentialism vs deontology',
    storyApplications: ['anti-heroes', 'moral compromise', 'corruption arcs'],
    examples: 'Breaking Bad, Watchmen, The Dark Knight'
  },
  
  // Power & Responsibility
  power_corrupts: {
    label: 'Power Corrupts',
    insight: 'Power tends to corrupt, absolute power corrupts absolutely',
    variations: 'Lord Acton\'s dictum',
    storyApplications: ['rise and fall', 'tyrant arcs', 'ring of power metaphors'],
    examples: 'Lord of the Rings, Macbeth, Animal Farm'
  },
  great_responsibility: {
    label: 'Power and Responsibility',
    insight: 'With great power comes great responsibility',
    variations: 'Noblesse oblige, the burden of the capable',
    storyApplications: ['superhero origin', 'leadership stories', 'privilege awareness'],
    examples: 'Spider-Man, Harry Potter, The Lion King'
  },
  
  // Truth & Deception
  truth_shall_free: {
    label: 'Truth Liberates',
    insight: 'The truth shall set you free',
    variations: 'Secrets poison, honesty heals',
    storyApplications: ['revelation arcs', 'confession scenes', 'mystery resolution'],
    examples: 'Oedipus Rex, Gone Girl, mystery genre'
  },
  noble_lie: {
    label: 'Noble Lies',
    insight: 'Sometimes lies protect; but at what cost?',
    variations: 'Plato\'s noble lie, protective deception',
    storyApplications: ['parents hiding truth from children', 'government secrets'],
    examples: 'The Village, Big Fish, life-sustaining lies'
  },
  
  // Love & Connection
  love_conquers: {
    label: 'Love Conquers',
    insight: 'Love is the most powerful force',
    variations: 'Love overcomes death, hate, fear',
    storyApplications: ['romance, family bonds, sacrifice for loved ones'],
    examples: 'Harry Potter (mother\'s love), Frozen, countless love stories'
  },
  no_man_island: {
    label: 'No One Is an Island',
    insight: 'We need each other; isolation diminishes us',
    variations: 'John Donne\'s meditation',
    storyApplications: ['loner learns to connect', 'community stories'],
    examples: 'Shrek, Into the Wild (tragic version), Cast Away'
  },
  
  // Change & Growth
  change_possible: {
    label: 'Change Is Possible',
    insight: 'People can change, redemption is possible',
    variations: 'Against determinism and nihilism',
    storyApplications: ['transformation arcs', 'second chances'],
    examples: 'A Christmas Carol, Les Miserables, Groundhog Day'
  },
  growth_through_suffering: {
    label: 'Growth Through Suffering',
    insight: 'Adversity develops character; no pain, no growth',
    variations: 'Post-traumatic growth, the crucible',
    storyApplications: ['hero\'s ordeal', 'coming of age through hardship'],
    examples: 'Most hero journeys, Rocky, The Pursuit of Happyness'
  }
};

// ============================================
// PSYCHOLOGICAL INSIGHTS
// Truths about human nature from psychology
// ============================================
export const PSYCHOLOGICAL_INSIGHTS = {
  // Identity & Self
  shadow_self: {
    label: 'The Shadow Self',
    insight: 'We all have a dark side we must acknowledge, not suppress',
    source: 'Carl Jung',
    storyApplications: ['Jekyll/Hyde arcs', 'confronting inner demons'],
    examples: 'Fight Club, Black Swan, The Hulk'
  },
  masks_we_wear: {
    label: 'The Masks We Wear',
    insight: 'Our public persona differs from our true self',
    source: 'Carl Jung (Persona)',
    storyApplications: ['identity reveals', 'authenticity journeys'],
    examples: 'The Talented Mr. Ripley, superhero secret identities'
  },
  wounded_healer: {
    label: 'The Wounded Healer',
    insight: 'Our wounds can become sources of wisdom and healing for others',
    source: 'Carl Jung',
    storyApplications: ['mentor backstories', 'redemption through helping'],
    examples: 'Good Will Hunting, mentors with tragic pasts'
  },
  
  // Relationships
  attachment_styles: {
    label: 'Attachment and Bonding',
    insight: 'Early relationships shape how we connect throughout life',
    source: 'John Bowlby, Mary Ainsworth',
    storyApplications: ['character backstory', 'relationship patterns'],
    examples: 'Orphan characters, parental wounds'
  },
  projection: {
    label: 'Projection',
    insight: 'We often hate in others what we deny in ourselves',
    source: 'Freud, Jung',
    storyApplications: ['enemies who mirror each other', 'blind spot revelations'],
    examples: 'Batman/Joker, any "we\'re not so different" scene'
  },
  
  // Motivation
  hierarchy_of_needs: {
    label: 'Hierarchy of Needs',
    insight: 'Basic needs must be met before higher aspirations',
    source: 'Abraham Maslow',
    storyApplications: ['survival before self-actualization', 'what characters truly need'],
    examples: 'The Martian (survival), then meaning'
  },
  will_to_meaning: {
    label: 'Will to Meaning',
    insight: 'Humans are primarily motivated by the search for meaning',
    source: 'Viktor Frankl',
    storyApplications: ['finding purpose', 'meaning even in suffering'],
    examples: 'Man\'s Search for Meaning, Life is Beautiful'
  },
  
  // Cognition
  cognitive_dissonance: {
    label: 'Cognitive Dissonance',
    insight: 'We struggle with contradictory beliefs and rationalize',
    source: 'Leon Festinger',
    storyApplications: ['characters justifying wrongs', 'breaking through denial'],
    examples: 'Breaking Bad (Walter\'s rationalizations)'
  },
  confirmation_bias: {
    label: 'Confirmation Bias',
    insight: 'We see what we expect to see',
    source: 'Cognitive psychology',
    storyApplications: ['mistaken identity', 'prejudice stories'],
    examples: 'Pride and Prejudice, 12 Angry Men'
  },
  
  // Trauma
  trauma_response: {
    label: 'Trauma and Healing',
    insight: 'Trauma changes us; healing is possible but requires work',
    source: 'Modern trauma psychology',
    storyApplications: ['PTSD arcs', 'healing journeys'],
    examples: 'The Perks of Being a Wallflower, Manchester by the Sea'
  }
};

// ============================================
// SCIENTIFIC INSIGHTS
// Truths about reality that stories can convey
// ============================================
export const SCIENTIFIC_INSIGHTS = {
  // Cosmology
  cosmic_scale: {
    label: 'Cosmic Perspective',
    insight: 'The universe is vast beyond comprehension; we are small but connected to it all',
    source: 'Carl Sagan, Neil deGrasse Tyson',
    storyApplications: ['humility', 'wonder', 'insignificance leading to meaning'],
    examples: 'Contact, Interstellar, 2001: A Space Odyssey'
  },
  
  // Evolution
  common_ancestry: {
    label: 'Shared Origins',
    insight: 'All life shares common ancestry; we are connected to all living things',
    source: 'Darwin, modern biology',
    storyApplications: ['connection to nature', 'animal companions', 'ecological themes'],
    examples: 'Avatar, Princess Mononoke, Wall-E'
  },
  
  // Physics
  entropy_and_time: {
    label: 'Entropy and Time',
    insight: 'Everything decays; time\'s arrow points one way',
    source: 'Thermodynamics',
    storyApplications: ['mortality awareness', 'legacy themes', 'seizing the day'],
    examples: 'Ozymandias (poem), Interstellar'
  },
  
  // Neuroscience
  brain_plasticity: {
    label: 'Neuroplasticity',
    insight: 'The brain can change; we can rewire ourselves',
    source: 'Modern neuroscience',
    storyApplications: ['change is possible', 'recovery from trauma', 'learning journeys'],
    examples: 'Scientific basis for transformation stories'
  },
  
  // Ecology
  interconnection: {
    label: 'Ecological Interconnection',
    insight: 'Everything is connected; actions have ripple effects',
    source: 'Ecology, systems thinking',
    storyApplications: ['butterfly effect', 'environmental themes', 'consequence chains'],
    examples: 'It\'s a Wonderful Life, Butterfly Effect'
  }
};

// ============================================
// HUMANIST PRINCIPLES
// Core values for human flourishing
// ============================================
export const HUMANIST_PRINCIPLES = {
  dignity: {
    label: 'Human Dignity',
    principle: 'Every human being has inherent worth regardless of status',
    storyApplications: ['standing up for the powerless', 'recognizing humanity in enemies'],
    examples: 'To Kill a Mockingbird, Schindler\'s List'
  },
  freedom: {
    label: 'Freedom and Autonomy',
    principle: 'Individuals have the right to make their own choices',
    storyApplications: ['escape stories', 'fighting oppression', 'coming of age'],
    examples: '1984, The Handmaid\'s Tale, Braveheart'
  },
  equality: {
    label: 'Equality',
    principle: 'All people deserve equal rights and opportunities',
    storyApplications: ['civil rights stories', 'class conflict', 'gender equality'],
    examples: 'Hidden Figures, Pride (2014), Suffragette'
  },
  compassion: {
    label: 'Compassion',
    principle: 'We should care for others, especially the suffering',
    storyApplications: ['Good Samaritan moments', 'unexpected kindness'],
    examples: 'Schindler\'s List, Les Miserables'
  },
  reason: {
    label: 'Reason and Evidence',
    principle: 'Decisions should be based on reason and evidence, not dogma',
    storyApplications: ['science vs superstition', 'overcoming prejudice'],
    examples: 'Contact, 12 Angry Men, Inherit the Wind'
  },
  progress: {
    label: 'Progress',
    principle: 'Society can improve through human effort',
    storyApplications: ['social change stories', 'utopia/dystopia', 'reform'],
    examples: 'Star Trek, The West Wing'
  }
};

// ============================================
// LIFE LESSONS CATALOG
// Specific lessons stories can teach
// ============================================
export const LIFE_LESSONS = {
  // About Self
  know_thyself: { 
    lesson: 'Know thyself', 
    origin: 'Delphic Oracle',
    category: 'self'
  },
  be_authentic: { 
    lesson: 'Be true to yourself', 
    origin: 'Shakespeare (Polonius)',
    category: 'self'
  },
  embrace_imperfection: { 
    lesson: 'Perfection is impossible; embrace your flaws', 
    origin: 'Wabi-sabi, various',
    category: 'self'
  },
  courage_not_fearlessness: { 
    lesson: 'Courage is not the absence of fear, but action despite it', 
    origin: 'Various attributions',
    category: 'self'
  },
  
  // About Others
  dont_judge: { 
    lesson: 'Don\'t judge others until you\'ve walked in their shoes', 
    origin: 'Atticus Finch and others',
    category: 'others'
  },
  everyone_has_story: { 
    lesson: 'Everyone is fighting a battle you know nothing about', 
    origin: 'Modern wisdom',
    category: 'others'
  },
  love_is_action: { 
    lesson: 'Love is not a feeling but a choice and an action', 
    origin: 'Various',
    category: 'others'
  },
  
  // About Life
  this_too_shall_pass: { 
    lesson: 'This too shall pass - both joy and suffering', 
    origin: 'Persian adage',
    category: 'life'
  },
  live_in_present: { 
    lesson: 'The past is gone, the future uncertain; only now is real', 
    origin: 'Buddhist, Stoic',
    category: 'life'
  },
  death_gives_meaning: { 
    lesson: 'Awareness of death gives life meaning', 
    origin: 'Existentialist, Stoic',
    category: 'life'
  },
  
  // About Action
  small_things_matter: { 
    lesson: 'Small acts of kindness can change the world', 
    origin: 'Various',
    category: 'action'
  },
  take_first_step: { 
    lesson: 'The journey of a thousand miles begins with one step', 
    origin: 'Laozi',
    category: 'action'
  },
  failure_is_teacher: { 
    lesson: 'Failure is not the opposite of success; it is part of it', 
    origin: 'Modern wisdom',
    category: 'action'
  }
};

// ============================================
// WISDOM ELEMENT STRUCTURE
// For user-created wisdom elements
// ============================================
export const WISDOM_CATEGORIES = {
  philosophical: { label: 'Philosophical', icon: '🎭', desc: 'Ideas about meaning, existence, ethics' },
  psychological: { label: 'Psychological', icon: '🧠', desc: 'Insights about human mind and behavior' },
  moral: { label: 'Moral/Ethical', icon: '⚖️', desc: 'Principles about right and wrong' },
  scientific: { label: 'Scientific', icon: '🔬', desc: 'Truths about the natural world' },
  spiritual: { label: 'Spiritual', icon: '✨', desc: 'Insights about transcendence and meaning' },
  practical: { label: 'Practical Wisdom', icon: '🛠️', desc: 'Life skills and practical insights' },
  relational: { label: 'Relational', icon: '🤝', desc: 'Truths about human connection' },
  societal: { label: 'Societal', icon: '🏛️', desc: 'Insights about society and justice' }
};
