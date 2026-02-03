/**
 * SCRIPTA Vocabulary - Settings Module
 * 
 * Setting archetypes with symbolic meanings, atmosphere,
 * and narrative functions from world literature.
 */

// ============================================
// SETTING ARCHETYPES
// Locations with deep symbolic meaning
// ============================================
export const SETTING_ARCHETYPES = {
  // Liminal Spaces (Thresholds)
  threshold: {
    label: 'The Threshold',
    desc: 'Doorway between worlds or states of being',
    symbolism: 'Transition, choice, point of no return',
    examples: 'Platform 9¾, wardrobe to Narnia, rabbit hole',
    suggestedMoods: ['mysterious', 'adventurous'],
    narrativeFunction: 'Marks hero\'s commitment to journey'
  },
  crossroads: {
    label: 'The Crossroads',
    desc: 'Junction where paths diverge',
    symbolism: 'Choice, fate, deal with the devil',
    examples: 'Robert Johnson\'s crossroads, Oedipus\' crossroads',
    suggestedMoods: ['mysterious', 'ominous'],
    narrativeFunction: 'Moment of crucial decision'
  },
  bridge: {
    label: 'The Bridge',
    desc: 'Span between two realms',
    symbolism: 'Connection, transition, vulnerability',
    examples: 'Bifrost, bridge over River Styx',
    suggestedMoods: ['tense', 'epic'],
    narrativeFunction: 'Dangerous crossing, no turning back'
  },
  shore: {
    label: 'The Shore',
    desc: 'Where land meets water',
    symbolism: 'Edge of consciousness, liminal space',
    examples: 'Beaches in myths, Dover Beach',
    suggestedMoods: ['melancholic', 'peaceful'],
    narrativeFunction: 'Reflection, waiting, transition'
  },
  
  // Descent & Darkness
  underworld: {
    label: 'The Underworld',
    desc: 'Realm of the dead, underground journey',
    symbolism: 'Death, unconscious, transformation',
    examples: 'Hades, Dante\'s Inferno, mines of Moria',
    suggestedMoods: ['ominous', 'horrific'],
    narrativeFunction: 'Confronting deepest fears, death/rebirth'
  },
  cave: {
    label: 'The Cave',
    desc: 'Dark enclosed space underground',
    symbolism: 'Womb, unconscious, hidden truth',
    examples: 'Plato\'s Cave, dragon\'s lair, Gollum\'s cave',
    suggestedMoods: ['mysterious', 'tense'],
    narrativeFunction: 'Confronting shadow self, ordeal'
  },
  labyrinth: {
    label: 'The Labyrinth',
    desc: 'Confusing, winding passages',
    symbolism: 'Confusion, testing, inner journey',
    examples: 'Minotaur\'s labyrinth, Goblin King\'s maze',
    suggestedMoods: ['tense', 'mysterious'],
    narrativeFunction: 'Lost in complexity, finding center'
  },
  abyss: {
    label: 'The Abyss',
    desc: 'Bottomless depth, void',
    symbolism: 'Infinite fear, the unknown, nihilism',
    examples: 'Nietzsche\'s abyss, Lovecraft\'s depths',
    suggestedMoods: ['horrific', 'desperate'],
    narrativeFunction: 'Ultimate confrontation with void'
  },
  
  // Ascent & Light
  mountain_peak: {
    label: 'The Mountain Peak',
    desc: 'Highest point, summit',
    symbolism: 'Achievement, enlightenment, divine contact',
    examples: 'Mount Sinai, Olympus, Lonely Mountain',
    suggestedMoods: ['epic', 'revelatory'],
    narrativeFunction: 'Revelation, achieving goal'
  },
  tower: {
    label: 'The Tower',
    desc: 'Tall isolated structure',
    symbolism: 'Ambition, isolation, imprisonment, power',
    examples: 'Rapunzel\'s tower, Saruman\'s Isengard, Dark Tower',
    suggestedMoods: ['ominous', 'mysterious'],
    narrativeFunction: 'Reaching for power, isolation from world'
  },
  temple: {
    label: 'The Temple',
    desc: 'Sacred religious structure',
    symbolism: 'Divine connection, sanctuary, revelation',
    examples: 'Temple of Delphi, Jedi Temple',
    suggestedMoods: ['peaceful', 'mysterious'],
    narrativeFunction: 'Receiving wisdom, spiritual transformation'
  },
  
  // Nature Archetypes
  forest: {
    label: 'The Forest',
    desc: 'Dense woodland, wild nature',
    symbolism: 'Unconscious, unknown, testing ground',
    examples: 'Grimm\'s forests, Mirkwood, Forbidden Forest',
    suggestedMoods: ['mysterious', 'ominous'],
    narrativeFunction: 'Getting lost to find oneself'
  },
  garden: {
    label: 'The Garden',
    desc: 'Cultivated natural space',
    symbolism: 'Paradise, innocence, temptation',
    examples: 'Eden, Secret Garden, Gethsemane',
    suggestedMoods: ['peaceful', 'romantic'],
    narrativeFunction: 'Innocence, fall, or restoration'
  },
  wasteland: {
    label: 'The Wasteland',
    desc: 'Barren, desolate land',
    symbolism: 'Spiritual emptiness, aftermath, purgatory',
    examples: 'T.S. Eliot\'s Wasteland, Mordor, post-apocalypse',
    suggestedMoods: ['melancholic', 'desperate'],
    narrativeFunction: 'Consequence of corruption, testing ground'
  },
  ocean: {
    label: 'The Ocean',
    desc: 'Vast body of water',
    symbolism: 'Unconscious, chaos, journey, vastness',
    examples: 'Odyssey, Moby Dick, Life of Pi',
    suggestedMoods: ['epic', 'mysterious'],
    narrativeFunction: 'Journey into unknown, isolation'
  },
  island: {
    label: 'The Island',
    desc: 'Land surrounded by water',
    symbolism: 'Isolation, utopia/dystopia, new society',
    examples: 'Lord of the Flies, Treasure Island, Lost',
    suggestedMoods: ['adventurous', 'mysterious'],
    narrativeFunction: 'Creating new rules, isolation reveals truth'
  },
  
  // Civilization Archetypes
  city: {
    label: 'The City',
    desc: 'Urban center of civilization',
    symbolism: 'Society, opportunity, corruption, anonymity',
    examples: 'Dickens\' London, Gotham, Coruscant',
    suggestedMoods: ['tense', 'mysterious'],
    narrativeFunction: 'Social conflict, civilization vs individual'
  },
  castle: {
    label: 'The Castle',
    desc: 'Fortified noble residence',
    symbolism: 'Power, protection, oppression, legacy',
    examples: 'Hamlet\'s Elsinore, Hogwarts, Gormenghast',
    suggestedMoods: ['ominous', 'epic'],
    narrativeFunction: 'Power struggle, family drama'
  },
  village: {
    label: 'The Village',
    desc: 'Small rural community',
    symbolism: 'Innocence, community, limitations',
    examples: 'Hobbiton, generic fairy tale village',
    suggestedMoods: ['peaceful', 'intimate'],
    narrativeFunction: 'Origin point, what hero protects/escapes'
  },
  ruins: {
    label: 'The Ruins',
    desc: 'Remnants of past civilization',
    symbolism: 'Fall of greatness, memory, hubris\'s end',
    examples: 'Ozymandias, Moria, Roman ruins',
    suggestedMoods: ['melancholic', 'mysterious'],
    narrativeFunction: 'Warning from past, hidden knowledge'
  },
  prison: {
    label: 'The Prison',
    desc: 'Place of confinement',
    symbolism: 'Oppression, punishment, limitation',
    examples: 'Shawshank, Chateau d\'If, Azkaban',
    suggestedMoods: ['desperate', 'ominous'],
    narrativeFunction: 'Unjust suffering, planning escape'
  },
  
  // Sanctuary Spaces
  sanctuary: {
    label: 'The Sanctuary',
    desc: 'Place of safety and healing',
    symbolism: 'Refuge, recovery, sacred space',
    examples: 'Rivendell, Xavier\'s School, safe houses',
    suggestedMoods: ['peaceful', 'intimate'],
    narrativeFunction: 'Rest before final act, gathering allies'
  },
  home: {
    label: 'Home',
    desc: 'Place of origin and belonging',
    symbolism: 'Identity, safety, what\'s worth fighting for',
    examples: 'The Shire, Kansas, any "ordinary world"',
    suggestedMoods: ['peaceful', 'intimate'],
    narrativeFunction: 'Beginning and end of journey'
  },
  
  // Special Spaces
  battlefield: {
    label: 'The Battlefield',
    desc: 'Place of combat and confrontation',
    symbolism: 'Ultimate test, sacrifice, chaos',
    examples: 'Pelennor Fields, Helm\'s Deep, Troy',
    suggestedMoods: ['epic', 'desperate'],
    narrativeFunction: 'Climactic confrontation'
  },
  court: {
    label: 'The Court',
    desc: 'Place of judgment and politics',
    symbolism: 'Justice, intrigue, power games',
    examples: 'King\'s Landing, Versailles, Camelot',
    suggestedMoods: ['tense', 'mysterious'],
    narrativeFunction: 'Political maneuvering, public truth'
  },
  marketplace: {
    label: 'The Marketplace',
    desc: 'Place of trade and gathering',
    symbolism: 'Exchange, diversity, opportunity',
    examples: 'Bazaars, Diagon Alley, Mos Eisley',
    suggestedMoods: ['adventurous', 'mysterious'],
    narrativeFunction: 'Meeting allies, gathering resources'
  },
  road: {
    label: 'The Road',
    desc: 'Path of journey',
    symbolism: 'Journey, life\'s path, change',
    examples: 'Yellow Brick Road, the Road in McCarthy',
    suggestedMoods: ['adventurous', 'melancholic'],
    narrativeFunction: 'Transition, testing, companionship'
  }
};

// ============================================
// ATMOSPHERE MODIFIERS
// Environmental qualities that affect mood
// ============================================
export const ATMOSPHERE_MODIFIERS = {
  // Weather
  storm: { label: 'Storm', effect: 'tension', symbolism: 'conflict, divine anger, change' },
  fog: { label: 'Fog/Mist', effect: 'mystery', symbolism: 'confusion, hidden truth, uncertainty' },
  rain: { label: 'Rain', effect: 'melancholy', symbolism: 'cleansing, sadness, new beginning' },
  snow: { label: 'Snow', effect: 'isolation', symbolism: 'purity, death, silence' },
  sunshine: { label: 'Sunshine', effect: 'hope', symbolism: 'truth, joy, divine favor' },
  
  // Time of Day
  dawn: { label: 'Dawn', effect: 'hope', symbolism: 'new beginning, hope, resurrection' },
  noon: { label: 'High Noon', effect: 'confrontation', symbolism: 'clarity, no shadows, showdown' },
  dusk: { label: 'Dusk/Twilight', effect: 'transition', symbolism: 'ending, uncertainty, liminal' },
  midnight: { label: 'Midnight', effect: 'darkness', symbolism: 'magic hour, danger, transformation' },
  
  // Seasons
  spring: { label: 'Spring', effect: 'renewal', symbolism: 'rebirth, youth, hope' },
  summer: { label: 'Summer', effect: 'vitality', symbolism: 'peak, passion, abundance' },
  autumn: { label: 'Autumn', effect: 'decline', symbolism: 'maturity, decay, change' },
  winter: { label: 'Winter', effect: 'hardship', symbolism: 'death, endurance, waiting' },
  
  // Light
  candlelight: { label: 'Candlelight', effect: 'intimacy', symbolism: 'fragile hope, secrets' },
  moonlight: { label: 'Moonlight', effect: 'mystery', symbolism: 'feminine, magic, illusion' },
  firelight: { label: 'Firelight', effect: 'primitive', symbolism: 'community, danger, passion' },
  darkness: { label: 'Darkness', effect: 'fear', symbolism: 'unknown, evil, unconscious' }
};

// ============================================
// SETTING-THEME CONNECTIONS
// Which settings naturally support which themes
// ============================================
export const SETTING_THEME_MAP = {
  threshold: ['growth', 'identity', 'freedom'],
  underworld: ['mortality', 'redemption', 'transformation'],
  mountain_peak: ['ambition', 'hubris', 'truth'],
  forest: ['identity', 'the_outsider', 'innocence_lost'],
  garden: ['love', 'innocence_lost', 'temptation'],
  wasteland: ['hope_vs_despair', 'survival', 'corruption'],
  ocean: ['freedom', 'survival', 'the_outsider'],
  island: ['power', 'nature_civilization', 'identity'],
  city: ['class_society', 'corruption', 'ambition'],
  castle: ['power', 'family', 'legacy'],
  village: ['family', 'identity', 'growth'],
  ruins: ['legacy', 'hubris', 'memory_and_past'],
  prison: ['freedom', 'hope_vs_despair', 'justice'],
  sanctuary: ['redemption', 'love', 'hope_vs_despair'],
  home: ['family', 'identity', 'love'],
  battlefield: ['sacrifice', 'good_vs_evil', 'war_and_peace'],
  road: ['growth', 'identity', 'freedom']
};

// ============================================
// SYMBOLIC OBJECTS BY SETTING
// Objects that naturally belong to settings
// ============================================
export const SETTING_OBJECTS = {
  threshold: ['key', 'map', 'invitation', 'warning_sign'],
  underworld: ['torch', 'coin_for_ferryman', 'rope', 'relic'],
  cave: ['treasure', 'ancient_writing', 'bones', 'crystal'],
  tower: ['spyglass', 'books', 'prisoner', 'crown'],
  forest: ['path_markers', 'animal_guide', 'enchanted_object', 'trap'],
  garden: ['fruit', 'flower', 'serpent', 'fountain'],
  castle: ['throne', 'crown', 'sword', 'portrait', 'secret_passage'],
  ruins: ['inscription', 'artifact', 'map', 'ghost'],
  prison: ['key', 'letter', 'tool', 'ally'],
  battlefield: ['banner', 'horn', 'weapon', 'fallen_hero']
};
