/**
 * SCRIPTA Vocabulary - Story Patterns Module
 * 
 * Master plots, twist types, subplot patterns, character dynamics,
 * stakes escalation, and ending patterns.
 * 
 * Based on Ronald Tobias' "20 Master Plots", Christopher Booker's 
 * "Seven Basic Plots", and screenwriting traditions.
 */

// ============================================
// MASTER PLOTS (Story Archetypes)
// The fundamental plot patterns from world literature
// ============================================
export const MASTER_PLOTS = {
  // Quest & Journey
  quest: {
    label: 'Quest',
    desc: 'Protagonist searches for a person, place, or thing',
    structure: ['call', 'journey', 'obstacles', 'arrival', 'goal'],
    suggestedThemes: ['identity', 'growth', 'redemption'],
    examples: 'Lord of the Rings, Holy Grail legends, Finding Nemo',
    keyQuestion: 'What are they searching for, and why does it matter?'
  },
  adventure: {
    label: 'Adventure',
    desc: 'Journey into the unknown with challenges and discoveries',
    structure: ['departure', 'challenges', 'discoveries', 'return'],
    suggestedThemes: ['freedom', 'growth', 'survival'],
    examples: 'The Odyssey, Treasure Island, Indiana Jones',
    keyQuestion: 'What will they discover about themselves along the way?'
  },
  voyage_return: {
    label: 'Voyage and Return',
    desc: 'Travel to strange land, experience it, return transformed',
    structure: ['ordinary_world', 'transition', 'strange_world', 'threat', 'escape', 'return'],
    suggestedThemes: ['identity', 'growth', 'nature_civilization'],
    examples: 'Alice in Wonderland, The Wizard of Oz, Narnia',
    keyQuestion: 'How does the other world change the protagonist?'
  },
  
  // Conflict & Opposition
  pursuit: {
    label: 'Pursuit',
    desc: 'One character chases another (literal or metaphorical)',
    structure: ['flight', 'chase', 'near_captures', 'resolution'],
    suggestedThemes: ['justice', 'survival', 'freedom'],
    examples: 'Les Misérables, The Fugitive, No Country for Old Men',
    keyQuestion: 'What drives both the pursuer and the pursued?'
  },
  rescue: {
    label: 'Rescue',
    desc: 'Hero must save someone from danger',
    structure: ['capture', 'discovery', 'pursuit', 'confrontation', 'rescue'],
    suggestedThemes: ['love', 'sacrifice', 'family'],
    examples: 'Die Hard, Taken, Saving Private Ryan',
    keyQuestion: 'What will the hero sacrifice to save them?'
  },
  escape: {
    label: 'Escape',
    desc: 'Protagonist must break free from confinement',
    structure: ['imprisonment', 'planning', 'attempts', 'freedom'],
    suggestedThemes: ['freedom', 'survival', 'hope_vs_despair'],
    examples: 'The Shawshank Redemption, The Great Escape, Room',
    keyQuestion: 'What inner prison must they also escape?'
  },
  rivalry: {
    label: 'Rivalry',
    desc: 'Two equal opponents compete for the same goal',
    structure: ['introduction', 'competition', 'escalation', 'climax', 'resolution'],
    suggestedThemes: ['ambition', 'identity', 'hubris'],
    examples: 'Amadeus, The Prestige, Batman vs Joker',
    keyQuestion: 'How are the rivals more alike than different?'
  },
  
  // Revenge & Justice
  revenge: {
    label: 'Revenge',
    desc: 'Protagonist seeks retribution for a wrong',
    structure: ['wrong', 'discovery', 'planning', 'execution', 'consequences'],
    suggestedThemes: ['justice', 'revenge', 'corruption'],
    examples: 'The Count of Monte Cristo, Kill Bill, Hamlet',
    keyQuestion: 'Will revenge bring peace or more destruction?'
  },
  underdog: {
    label: 'Underdog',
    desc: 'The weak or disadvantaged overcomes the powerful',
    structure: ['disadvantage', 'challenge', 'preparation', 'setbacks', 'victory'],
    suggestedThemes: ['hope_vs_despair', 'justice', 'growth'],
    examples: 'Rocky, David and Goliath, Rudy, Erin Brockovich',
    keyQuestion: 'What inner strength compensates for outer weakness?'
  },
  
  // Mystery & Discovery
  riddle: {
    label: 'Riddle/Mystery',
    desc: 'Protagonist must solve a puzzle or mystery',
    structure: ['mystery', 'investigation', 'clues', 'false_leads', 'solution'],
    suggestedThemes: ['truth', 'justice', 'appearance_vs_reality'],
    examples: 'Sherlock Holmes, Gone Girl, Knives Out',
    keyQuestion: 'What truth about human nature does the mystery reveal?'
  },
  discovery: {
    label: 'Discovery',
    desc: 'A revelation changes everything the protagonist believed',
    structure: ['ignorance', 'hints', 'investigation', 'revelation', 'new_reality'],
    suggestedThemes: ['truth', 'identity', 'appearance_vs_reality'],
    examples: 'Oedipus Rex, The Sixth Sense, Planet of the Apes',
    keyQuestion: 'How does knowing the truth change everything?'
  },
  
  // Transformation
  metamorphosis: {
    label: 'Metamorphosis',
    desc: 'Physical or fundamental transformation of character',
    structure: ['original_state', 'transformation', 'adaptation', 'resolution'],
    suggestedThemes: ['identity', 'the_outsider', 'nature_vs_nurture'],
    examples: 'Kafka\'s Metamorphosis, Beauty and the Beast, The Fly',
    keyQuestion: 'Does the outer change reveal or hide the inner self?'
  },
  transformation: {
    label: 'Transformation',
    desc: 'Internal change through experience',
    structure: ['flaw', 'catalyst', 'struggle', 'epiphany', 'new_self'],
    suggestedThemes: ['redemption', 'growth', 'identity'],
    examples: 'A Christmas Carol, Groundhog Day, As Good As It Gets',
    keyQuestion: 'What belief must they abandon to become who they need to be?'
  },
  rebirth: {
    label: 'Rebirth',
    desc: 'Character trapped in darkness finds way to light',
    structure: ['shadow', 'deepening', 'crisis', 'redemption'],
    suggestedThemes: ['redemption', 'hope_vs_despair', 'mortality'],
    examples: 'Sleeping Beauty, A Christmas Carol, Secret Garden',
    keyQuestion: 'What sleeping part of themselves must awaken?'
  },
  
  // Love & Relationship
  love_story: {
    label: 'Love Story',
    desc: 'Two people overcome obstacles to be together',
    structure: ['meeting', 'attraction', 'obstacles', 'separation', 'reunion'],
    suggestedThemes: ['love', 'sacrifice', 'identity'],
    examples: 'Pride and Prejudice, Romeo and Juliet, The Notebook',
    keyQuestion: 'What must each give up to make love possible?'
  },
  forbidden_love: {
    label: 'Forbidden Love',
    desc: 'Love that defies social rules or taboos',
    structure: ['meeting', 'forbidden_attraction', 'secret', 'discovery', 'consequences'],
    suggestedThemes: ['love', 'freedom', 'sacrifice'],
    examples: 'Wuthering Heights, Brokeback Mountain, The English Patient',
    keyQuestion: 'Is the love worth the price they must pay?'
  },
  
  // Sacrifice & Morality
  sacrifice: {
    label: 'Sacrifice',
    desc: 'Character gives up something precious for others',
    structure: ['value', 'threat', 'choice', 'sacrifice', 'aftermath'],
    suggestedThemes: ['sacrifice', 'love', 'redemption'],
    examples: 'A Tale of Two Cities, Gran Torino, Casablanca',
    keyQuestion: 'What makes the sacrifice meaningful rather than wasteful?'
  },
  temptation: {
    label: 'Temptation',
    desc: 'Character is tempted to betray their values',
    structure: ['virtue', 'temptation', 'struggle', 'choice', 'consequence'],
    suggestedThemes: ['corruption', 'identity', 'power'],
    examples: 'Faust, Breaking Bad, Wall Street',
    keyQuestion: 'What does the temptation reveal about their true nature?'
  },
  
  // Rise & Fall
  ascension: {
    label: 'Ascension (Rags to Riches)',
    desc: 'Rise from humble origins to success',
    structure: ['poverty', 'opportunity', 'rise', 'threat', 'triumph'],
    suggestedThemes: ['ambition', 'identity', 'class_society'],
    examples: 'Cinderella, Great Expectations, Slumdog Millionaire',
    keyQuestion: 'Does success change who they truly are?'
  },
  descension: {
    label: 'Descension (Tragedy)',
    desc: 'Fall from grace due to fatal flaw',
    structure: ['height', 'flaw', 'mistakes', 'fall', 'destruction'],
    suggestedThemes: ['hubris', 'corruption', 'mortality'],
    examples: 'Macbeth, Citizen Kane, Breaking Bad, The Godfather',
    keyQuestion: 'Could they have chosen differently, or was it inevitable?'
  },
  
  // Overcoming
  overcoming_monster: {
    label: 'Overcoming the Monster',
    desc: 'Hero confronts and defeats a great evil',
    structure: ['call', 'journey', 'arrival', 'battle', 'victory'],
    suggestedThemes: ['good_vs_evil', 'courage', 'sacrifice'],
    examples: 'Beowulf, Jaws, Star Wars, Harry Potter',
    keyQuestion: 'What does the monster represent that must be overcome?'
  },
  comedy: {
    label: 'Comedy',
    desc: 'Confusion and misunderstanding lead to happy resolution',
    structure: ['confusion', 'complications', 'climax', 'resolution', 'celebration'],
    suggestedThemes: ['love', 'identity', 'appearance_vs_reality'],
    examples: 'A Midsummer Night\'s Dream, Some Like It Hot, The Hangover',
    keyQuestion: 'What truth emerges from the chaos?'
  }
};

// ============================================
// TWIST TYPES
// Narrative revelations that change everything
// ============================================
export const TWIST_TYPES = {
  identity_reveal: {
    label: 'Identity Reveal',
    desc: 'Character is not who they appeared to be',
    examples: 'Luke\'s father, Keyser Soze, Tyler Durden',
    setup: 'Plant subtle clues that can be reinterpreted',
    impact: 'high'
  },
  motive_reveal: {
    label: 'Motive Reveal',
    desc: 'True reason behind actions is revealed',
    examples: 'Snape\'s love for Lily, Memento\'s truth',
    setup: 'Show actions without explaining why',
    impact: 'high'
  },
  relationship_reveal: {
    label: 'Relationship Reveal',
    desc: 'Hidden connection between characters',
    examples: 'Luke and Leia siblings, secret parentage',
    setup: 'Parallel characteristics, meaningful looks',
    impact: 'medium'
  },
  time_reveal: {
    label: 'Time Reveal',
    desc: 'Events are not when we thought',
    examples: 'Arrival, The Others, Westworld',
    setup: 'Avoid explicit time markers, parallel scenes',
    impact: 'high'
  },
  location_reveal: {
    label: 'Location Reveal',
    desc: 'Place is not what it appeared',
    examples: 'Planet of the Apes, The Village, Shutter Island',
    setup: 'Restricted information about outside world',
    impact: 'high'
  },
  morality_flip: {
    label: 'Morality Flip',
    desc: 'Good was evil or evil was good all along',
    examples: 'Gone Girl, Primal Fear, The Usual Suspects',
    setup: 'Show apparent virtue/vice that can be reframed',
    impact: 'high'
  },
  narrator_reveal: {
    label: 'Unreliable Narrator',
    desc: 'Narrator has been lying or deluded',
    examples: 'Fight Club, Gone Girl, Atonement',
    setup: 'First person narration with subtle inconsistencies',
    impact: 'high'
  },
  death_fakeout: {
    label: 'Death Fake-out',
    desc: 'Character thought dead is alive (or vice versa)',
    examples: 'Gandalf, Jon Snow, Sherlock at Reichenbach',
    setup: 'Off-screen death, no body shown',
    impact: 'medium'
  },
  prophecy_twist: {
    label: 'Prophecy Reinterpretation',
    desc: 'Prophecy fulfills in unexpected way',
    examples: 'Macbeth\'s prophecies, Matrix\'s One, Harry as horcrux',
    setup: 'Ambiguous wording in prophecy',
    impact: 'medium'
  },
  helper_was_villain: {
    label: 'Helper Was Villain',
    desc: 'Trusted ally was the antagonist',
    examples: 'Hans in Frozen, Professor Quirrell, Lotso',
    setup: 'Establish trust, opportunity, subtle hints',
    impact: 'high'
  },
  villain_was_right: {
    label: 'Villain Was Right',
    desc: 'Antagonist\'s perspective proven valid',
    examples: 'Thanos\'s logic, Killmonger\'s grievance',
    setup: 'Give villain coherent philosophy',
    impact: 'medium'
  }
};

// ============================================
// SUBPLOT PATTERNS
// How secondary stories relate to main plot
// ============================================
export const SUBPLOT_PATTERNS = {
  thematic_echo: {
    label: 'Thematic Echo',
    desc: 'Subplot mirrors main theme in different context',
    function: 'Reinforces theme from another angle',
    example: 'Laertes mirrors Hamlet\'s revenge'
  },
  thematic_contrast: {
    label: 'Thematic Contrast',
    desc: 'Subplot presents opposite view of theme',
    function: 'Creates thematic debate',
    example: 'Successful revenge vs failed revenge'
  },
  comic_relief: {
    label: 'Comic Relief',
    desc: 'Lighter subplot provides emotional breaks',
    function: 'Pacing, prevents emotional exhaustion',
    example: 'Merry and Pippin in LOTR'
  },
  romance_in_action: {
    label: 'Romance in Action',
    desc: 'Love story woven through adventure/thriller',
    function: 'Humanizes hero, raises stakes',
    example: 'Han and Leia in Star Wars'
  },
  mentor_backstory: {
    label: 'Mentor\'s Past',
    desc: 'Reveals mentor\'s own journey/failures',
    function: 'Deepens mentor, foreshadows hero\'s path',
    example: 'Obi-Wan\'s failure with Anakin'
  },
  villain_humanizing: {
    label: 'Villain Humanization',
    desc: 'Subplot shows villain\'s perspective/past',
    function: 'Creates moral complexity',
    example: 'Magneto\'s Holocaust backstory'
  },
  ticking_clock: {
    label: 'Ticking Clock',
    desc: 'Deadline subplot creates urgency',
    function: 'Maintains tension',
    example: 'The bomb that will explode'
  },
  mystery_within: {
    label: 'Mystery Within',
    desc: 'Smaller mystery embedded in larger story',
    function: 'Engagement, revelation vehicle',
    example: 'Who is the spy in the group?'
  },
  character_b_journey: {
    label: 'Character B Journey',
    desc: 'Secondary character has own complete arc',
    function: 'Ensemble depth, thematic variety',
    example: 'Sam\'s journey in LOTR'
  },
  setup_for_sequel: {
    label: 'Sequel Setup',
    desc: 'Subplot plants seeds for future stories',
    function: 'Series building',
    example: 'Hints of larger war coming'
  }
};

// ============================================
// CHARACTER DYNAMICS (Ensemble Patterns)
// ============================================
export const CHARACTER_DYNAMICS = {
  fellowship: {
    label: 'The Fellowship',
    desc: 'Diverse skills united for common goal',
    roles: ['leader', 'warrior', 'wise_one', 'scout', 'heart', 'comic_relief'],
    tension: 'Different methods, same goal',
    examples: 'LOTR Fellowship, Avengers, Guardians of the Galaxy'
  },
  heist_crew: {
    label: 'The Heist Crew',
    desc: 'Specialists with unique roles',
    roles: ['mastermind', 'tech_expert', 'muscle', 'con_artist', 'driver', 'inside_man'],
    tension: 'Trust issues, double-crosses',
    examples: 'Ocean\'s Eleven, Money Heist, Italian Job'
  },
  found_family: {
    label: 'Found Family',
    desc: 'Outsiders become closer than blood',
    roles: ['parent_figure', 'older_sibling', 'baby', 'black_sheep', 'peacemaker'],
    tension: 'Fear of abandonment, proving worth',
    examples: 'Firefly, Guardians of the Galaxy, Brooklyn 99'
  },
  love_triangle: {
    label: 'Love Triangle',
    desc: 'Three characters with romantic tension',
    roles: ['protagonist', 'safe_choice', 'dangerous_choice'],
    tension: 'Competing desires, jealousy',
    examples: 'Twilight, Hunger Games, Casablanca'
  },
  mentor_chain: {
    label: 'Mentor Chain',
    desc: 'Master who was once student',
    roles: ['old_master', 'current_mentor', 'new_student'],
    tension: 'Repeating vs breaking cycle',
    examples: 'Star Wars Jedi, Kung Fu Panda'
  },
  foil_pair: {
    label: 'Foil Pair',
    desc: 'Contrasting characters who illuminate each other',
    roles: ['protagonist', 'foil'],
    tension: 'Different approaches to same problem',
    examples: 'Holmes/Watson, Kirk/Spock, Harry/Draco'
  },
  power_quartet: {
    label: 'Power Quartet',
    desc: 'Four distinct personality types',
    roles: ['leader', 'rebel', 'peacemaker', 'brain'],
    tension: 'Leadership struggles, method conflicts',
    examples: 'Teenage Mutant Ninja Turtles, Fantastic Four'
  },
  secret_society: {
    label: 'Secret Agendas',
    desc: 'Group with hidden individual motivations',
    roles: ['apparent_leader', 'true_power', 'spy', 'innocent', 'opportunist'],
    tension: 'Trust, betrayal, revelation',
    examples: 'Game of Thrones, The Thing, Among Us'
  },
  generational: {
    label: 'Generational',
    desc: 'Multiple generations with inherited conflicts',
    roles: ['elder', 'parent', 'child', 'black_sheep'],
    tension: 'Legacy, expectations, rebellion',
    examples: 'Godfather, Succession, Star Wars'
  }
};

// ============================================
// STAKES ESCALATION PATTERNS
// ============================================
export const STAKES_ESCALATION = {
  personal_to_global: {
    label: 'Personal to Global',
    desc: 'Stakes expand from individual to world',
    stages: ['personal_loss', 'community_threat', 'world_at_risk'],
    examples: 'Harry Potter series, Star Wars'
  },
  physical_to_spiritual: {
    label: 'Physical to Spiritual',
    desc: 'From survival to meaning',
    stages: ['survive', 'protect_others', 'save_soul'],
    examples: 'The Lord of the Rings, The Matrix'
  },
  reversible_to_permanent: {
    label: 'Reversible to Permanent',
    desc: 'Consequences become irreversible',
    stages: ['can_undo', 'harder_to_undo', 'permanent'],
    examples: 'Breaking Bad, tragedy structure'
  },
  self_to_others: {
    label: 'Self to Others',
    desc: 'From saving self to saving loved ones',
    stages: ['own_life', 'loved_ones', 'strangers', 'future_generations'],
    examples: 'Die Hard, Interstellar'
  },
  known_to_unknown: {
    label: 'Known to Unknown',
    desc: 'From visible threat to existential',
    stages: ['visible_enemy', 'hidden_threat', 'cosmic_horror'],
    examples: 'Lovecraft stories, Alien'
  }
};

// ============================================
// ENDING PATTERNS
// ============================================
export const ENDING_PATTERNS = {
  closed: {
    label: 'Closed Ending',
    desc: 'All questions answered, full resolution',
    satisfaction: 'high',
    examples: 'Most fairy tales, Lord of the Rings'
  },
  open: {
    label: 'Open Ending',
    desc: 'Ambiguous, reader decides meaning',
    satisfaction: 'variable',
    examples: 'Inception, The Lady or the Tiger'
  },
  circular: {
    label: 'Circular',
    desc: 'Returns to beginning, but transformed',
    satisfaction: 'high',
    examples: 'The Wizard of Oz, Fight Club'
  },
  bittersweet: {
    label: 'Bittersweet',
    desc: 'Victory achieved but at great cost',
    satisfaction: 'high',
    examples: 'Casablanca, Lord of the Rings, Logan'
  },
  pyrrhic: {
    label: 'Pyrrhic Victory',
    desc: 'Win that feels like loss',
    satisfaction: 'complex',
    examples: 'Hamlet, Infinity War'
  },
  twist_ending: {
    label: 'Twist Ending',
    desc: 'Final revelation changes everything',
    satisfaction: 'high_if_earned',
    examples: 'The Sixth Sense, Planet of the Apes'
  },
  cliffhanger: {
    label: 'Cliffhanger',
    desc: 'Unresolved tension for next installment',
    satisfaction: 'anticipation',
    examples: 'Empire Strikes Back, season finales'
  },
  eucatastrophe: {
    label: 'Eucatastrophe',
    desc: 'Sudden turn from disaster to joy (Tolkien\'s term)',
    satisfaction: 'very_high',
    examples: 'Eagles in LOTR, divine intervention'
  },
  tragedy: {
    label: 'Tragic Ending',
    desc: 'Hero\'s flaw leads to downfall',
    satisfaction: 'cathartic',
    examples: 'Macbeth, Hamlet, Romeo and Juliet'
  },
  ironic: {
    label: 'Ironic Ending',
    desc: 'Outcome opposite of what was intended',
    satisfaction: 'thought_provoking',
    examples: 'O. Henry stories, Greek tragedies'
  }
};

// ============================================
// OPENING HOOKS
// ============================================
export const OPENING_HOOKS = {
  in_medias_res: {
    label: 'In Medias Res',
    desc: 'Start in middle of action',
    effect: 'Immediate engagement',
    examples: 'Odyssey, James Bond cold opens'
  },
  mystery_question: {
    label: 'Mystery Question',
    desc: 'Open with unanswered question',
    effect: 'Curiosity drives reading',
    examples: 'Who killed X? What is that sound?'
  },
  unusual_world: {
    label: 'Unusual World',
    desc: 'Establish different rules immediately',
    effect: 'Wonder, establishes genre',
    examples: '1984\'s first line, fantasy openings'
  },
  character_in_trouble: {
    label: 'Character in Trouble',
    desc: 'Protagonist faces immediate problem',
    effect: 'Sympathy, investment',
    examples: 'Cinderella, Oliver Twist'
  },
  dramatic_irony: {
    label: 'Dramatic Irony',
    desc: 'Audience knows what character doesn\'t',
    effect: 'Tension, anticipation',
    examples: 'Horror movie setups, Oedipus'
  },
  promise_of_journey: {
    label: 'Promise of Journey',
    desc: 'Foreshadow the adventure to come',
    effect: 'Anticipation, contract with reader',
    examples: '"I\'m going to tell you how I died"'
  },
  contrast: {
    label: 'Before/After Contrast',
    desc: 'Show ending then flash back',
    effect: 'How did we get here?',
    examples: 'Breaking Bad, Sunset Boulevard'
  }
};

// ============================================
// GENRE HYBRID RULES
// ============================================
export const GENRE_HYBRIDS = {
  fantasy_mystery: {
    label: 'Fantasy Mystery',
    base: ['fantasy', 'mystery'],
    desc: 'Magic system as mystery-solving tool',
    examples: 'Dresden Files, Rivers of London',
    rules: ['magic_has_rules', 'clues_involve_magic']
  },
  scifi_western: {
    label: 'Space Western',
    base: ['scifi', 'adventure'],
    desc: 'Frontier spirit in space',
    examples: 'Firefly, Mandalorian, Cowboy Bebop',
    rules: ['frontier_justice', 'scarce_resources']
  },
  romance_horror: {
    label: 'Gothic Romance',
    base: ['romance', 'horror'],
    desc: 'Love threatened by supernatural',
    examples: 'Crimson Peak, Rebecca, Dracula',
    rules: ['dangerous_lover', 'dark_secret']
  },
  comedy_horror: {
    label: 'Horror Comedy',
    base: ['comedy', 'horror'],
    desc: 'Laughs and scares together',
    examples: 'Shaun of the Dead, Tucker and Dale',
    rules: ['horror_rules_played_for_laughs']
  },
  mystery_romance: {
    label: 'Romantic Mystery',
    base: ['mystery', 'romance'],
    desc: 'Solving crime while falling in love',
    examples: 'Castle, Moonlighting',
    rules: ['investigation_brings_together']
  },
  scifi_horror: {
    label: 'Sci-Fi Horror',
    base: ['scifi', 'horror'],
    desc: 'Technology or aliens as source of horror',
    examples: 'Alien, Event Horizon, Annihilation',
    rules: ['isolation', 'unknown_threat']
  }
};

// ============================================
// EMOTIONAL BEAT SEQUENCES
// Proven emotional patterns
// ============================================
export const EMOTIONAL_SEQUENCES = {
  hope_despair_hope: {
    label: 'Hope-Despair-Hope',
    sequence: ['hope', 'building_hope', 'crushing_despair', 'glimmer', 'triumph'],
    effect: 'Classic satisfying arc',
    examples: 'Most hero journeys'
  },
  trust_betrayal_forgiveness: {
    label: 'Trust-Betrayal-Forgiveness',
    sequence: ['trust', 'betrayal', 'anger', 'understanding', 'forgiveness'],
    effect: 'Redemption arc',
    examples: 'Prodigal son stories'
  },
  fear_courage_triumph: {
    label: 'Fear-Courage-Triumph',
    sequence: ['fear', 'reluctance', 'first_step', 'growing_courage', 'triumph'],
    effect: 'Empowerment',
    examples: 'Coming of age, facing phobias'
  },
  love_loss_acceptance: {
    label: 'Love-Loss-Acceptance',
    sequence: ['love', 'threat', 'loss', 'grief', 'acceptance', 'growth'],
    effect: 'Cathartic grief processing',
    examples: 'Love stories with death'
  },
  ignorance_discovery_horror: {
    label: 'Ignorance-Discovery-Horror',
    sequence: ['blissful_ignorance', 'hints', 'investigation', 'discovery', 'horror', 'adaptation'],
    effect: 'Lovecraftian dread',
    examples: 'Cosmic horror, dark secrets'
  },
  pride_fall_humility: {
    label: 'Pride-Fall-Humility',
    sequence: ['arrogance', 'success', 'hubris', 'fall', 'humility', 'wisdom'],
    effect: 'Character growth through failure',
    examples: 'Greek tragedy, redemption arcs'
  }
};
