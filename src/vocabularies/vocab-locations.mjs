/**
 * SCRIPTA Vocabulary - Locations Module
 * 
 * Location geography, time periods, and characteristics.
 */

// ============================================
// LOCATION GEOGRAPHY
// ============================================
export const LOCATION_GEOGRAPHY = {
  // Natural
  forest: { label: 'Forest', desc: 'Dense woodland with ancient trees', category: 'natural' },
  mountain: { label: 'Mountain', desc: 'High peaks reaching toward the sky', category: 'natural' },
  ocean: { label: 'Ocean', desc: 'Vast body of water, mysterious depths', category: 'natural' },
  desert: { label: 'Desert', desc: 'Arid wasteland of sand or rock', category: 'natural' },
  river: { label: 'River', desc: 'Flowing water, often a boundary or path', category: 'natural' },
  cave: { label: 'Cave', desc: 'Underground space, hidden secrets', category: 'natural' },
  island: { label: 'Island', desc: 'Land surrounded by water, isolated', category: 'natural' },
  swamp: { label: 'Swamp', desc: 'Murky wetland, treacherous terrain', category: 'natural' },
  plains: { label: 'Plains', desc: 'Open grassland, endless horizons', category: 'natural' },
  jungle: { label: 'Jungle', desc: 'Dense tropical vegetation, teeming life', category: 'natural' },
  tundra: { label: 'Tundra', desc: 'Frozen wasteland, harsh conditions', category: 'natural' },
  volcano: { label: 'Volcano', desc: 'Fiery mountain, destructive power', category: 'natural' },
  
  // Built
  castle: { label: 'Castle', desc: 'Fortified noble residence, power center', category: 'built' },
  village: { label: 'Village', desc: 'Small rural community, simple life', category: 'built' },
  city: { label: 'City', desc: 'Large urban center, hub of activity', category: 'built' },
  temple: { label: 'Temple', desc: 'Sacred religious structure', category: 'built' },
  ruins: { label: 'Ruins', desc: 'Remnants of past civilization', category: 'built' },
  tower: { label: 'Tower', desc: 'Tall isolated structure, often magical', category: 'built' },
  prison: { label: 'Prison', desc: 'Place of confinement and punishment', category: 'built' },
  market: { label: 'Market', desc: 'Trading hub, diverse people gather', category: 'built' },
  palace: { label: 'Palace', desc: 'Grand royal residence, luxury', category: 'built' },
  tavern: { label: 'Tavern', desc: 'Place of rest, stories, and meetings', category: 'built' },
  
  // Liminal (in-between)
  crossroads: { label: 'Crossroads', desc: 'Junction of paths, place of choice', category: 'liminal' },
  bridge: { label: 'Bridge', desc: 'Crossing between two realms', category: 'liminal' },
  threshold: { label: 'Threshold', desc: 'Doorway between worlds', category: 'liminal' },
  shore: { label: 'Shore', desc: 'Where land meets water', category: 'liminal' },
  borderland: { label: 'Borderland', desc: 'Edge between territories', category: 'liminal' }
};

// ============================================
// LOCATION TIME PERIODS
// ============================================
export const LOCATION_TIME = {
  ancient: { label: 'Ancient', desc: 'Thousands of years in the past, early civilizations' },
  medieval: { label: 'Medieval', desc: 'Middle ages, feudal societies' },
  renaissance: { label: 'Renaissance', desc: 'Period of cultural rebirth and discovery' },
  industrial: { label: 'Industrial', desc: 'Age of machines and factories' },
  modern: { label: 'Modern', desc: 'Contemporary era, current technology' },
  future: { label: 'Future', desc: 'Advanced technology, speculative' },
  timeless: { label: 'Timeless', desc: 'Outside normal time, mythic' },
  post_apocalyptic: { label: 'Post-Apocalyptic', desc: 'After civilization collapse' }
};

// ============================================
// LOCATION CHARACTERISTICS
// ============================================
export const LOCATION_CHARACTERISTICS = {
  // Atmosphere
  sacred: { label: 'Sacred', desc: 'Holy, spiritual significance', category: 'atmosphere' },
  cursed: { label: 'Cursed', desc: 'Under dark magical influence', category: 'atmosphere' },
  haunted: { label: 'Haunted', desc: 'Spirits or memories linger', category: 'atmosphere' },
  enchanted: { label: 'Enchanted', desc: 'Magical properties, wonder', category: 'atmosphere' },
  abandoned: { label: 'Abandoned', desc: 'Empty, forgotten by people', category: 'atmosphere' },
  bustling: { label: 'Bustling', desc: 'Full of activity and people', category: 'atmosphere' },
  serene: { label: 'Serene', desc: 'Peaceful, calming presence', category: 'atmosphere' },
  oppressive: { label: 'Oppressive', desc: 'Heavy, suffocating feeling', category: 'atmosphere' },
  
  // Danger Level
  safe: { label: 'Safe', desc: 'Protected, low threat', category: 'danger' },
  dangerous: { label: 'Dangerous', desc: 'High risk of harm', category: 'danger' },
  treacherous: { label: 'Treacherous', desc: 'Hidden dangers, deceptive', category: 'danger' },
  forbidden: { label: 'Forbidden', desc: 'Entry prohibited, taboo', category: 'danger' },
  
  // Access
  hidden: { label: 'Hidden', desc: 'Concealed, hard to find', category: 'access' },
  isolated: { label: 'Isolated', desc: 'Remote, cut off from world', category: 'access' },
  central: { label: 'Central', desc: 'Hub, many paths converge', category: 'access' },
  underground: { label: 'Underground', desc: 'Below the surface', category: 'access' },
  elevated: { label: 'Elevated', desc: 'High above ground level', category: 'access' },
  
  // Resources
  abundant: { label: 'Abundant', desc: 'Rich in resources', category: 'resources' },
  barren: { label: 'Barren', desc: 'Lacking resources, sparse', category: 'resources' },
  contested: { label: 'Contested', desc: 'Multiple parties claim it', category: 'resources' }
};

// ============================================
// LOCATION NAME LISTS
// ============================================
export const LOCATION_NAMES = [
  'Thornwood', 'Crystalfall', 'Shadowmere', 'Stormhold', 'Dawnshire',
  'Nighthaven', 'Irongate', 'Silverpeak', 'Misthollow', 'Dragonspire',
  'Ravenwatch', 'Goldenvale', 'Frostmoor', 'Sunstone', 'Darkwater',
  'Moonridge', 'Emberdale', 'Starfall', 'Windholm', 'Ashford',
  'Blackthorn', 'Whitecrest', 'Redcliff', 'Greenveil', 'Bluehaven'
];

// ============================================
// PLOT ELEMENT TYPES (expanded from 'objects')
// Diverse elements for intrigue across genres
// ============================================
export const OBJECT_TYPES = {
  // Physical Objects
  weapon: { label: 'Weapon', desc: 'Tool of combat or defense', icon: '⚔️', category: 'physical' },
  artifact: { label: 'Artifact', desc: 'Object of power or ancient origin', icon: '🔮', category: 'physical' },
  key: { label: 'Key', desc: 'Object that unlocks access', icon: '🗝️', category: 'physical' },
  document: { label: 'Document', desc: 'Written information, letter, map', icon: '📜', category: 'physical' },
  jewelry: { label: 'Jewelry', desc: 'Precious ornament with meaning', icon: '💍', category: 'physical' },
  clothing: { label: 'Clothing', desc: 'Wearable with significance', icon: '👘', category: 'physical' },
  container: { label: 'Container', desc: 'Box, chest, vessel holding secrets', icon: '📦', category: 'physical' },
  vehicle: { label: 'Vehicle', desc: 'Means of transportation', icon: '🚢', category: 'physical' },
  tool: { label: 'Tool', desc: 'Practical instrument with narrative use', icon: '🔧', category: 'physical' },
  substance: { label: 'Substance', desc: 'Poison, medicine, potion, drug', icon: '⚗️', category: 'physical' },
  food_drink: { label: 'Food/Drink', desc: 'Consumable with plot significance', icon: '🍷', category: 'physical' },
  money: { label: 'Money/Treasure', desc: 'Wealth, coins, precious materials', icon: '💰', category: 'physical' },
  body_part: { label: 'Body Part', desc: 'Heart, hand, eye - literal or preserved', icon: '🫀', category: 'physical' },
  
  // Information & Secrets
  secret: { label: 'Secret', desc: 'Hidden information that drives plot', icon: '🤫', category: 'information' },
  rumor: { label: 'Rumor', desc: 'Unverified information spreading', icon: '💬', category: 'information' },
  prophecy: { label: 'Prophecy', desc: 'Prediction of future events', icon: '🔮', category: 'information' },
  memory: { label: 'Memory', desc: 'Past event affecting present', icon: '🧠', category: 'information' },
  identity: { label: 'Hidden Identity', desc: 'True nature concealed', icon: '🎭', category: 'information' },
  alibi: { label: 'Alibi', desc: 'Proof of innocence or guilt', icon: '⏱️', category: 'information' },
  evidence: { label: 'Evidence', desc: 'Proof that reveals truth', icon: '🔍', category: 'information' },
  code: { label: 'Code/Cipher', desc: 'Encrypted message to decode', icon: '🔐', category: 'information' },
  testimony: { label: 'Testimony', desc: 'Witness account of events', icon: '📢', category: 'information' },
  
  // Relationships & Bonds
  promise: { label: 'Promise', desc: 'Vow that binds characters', icon: '🤝', category: 'relationship' },
  debt: { label: 'Debt', desc: 'Owed favor or money creating obligation', icon: '📋', category: 'relationship' },
  inheritance: { label: 'Inheritance', desc: 'Legacy passed down', icon: '📜', category: 'relationship' },
  marriage: { label: 'Marriage/Engagement', desc: 'Union creating alliances', icon: '💒', category: 'relationship' },
  child: { label: 'Child', desc: 'Offspring as plot element', icon: '👶', category: 'relationship' },
  betrayal: { label: 'Betrayal', desc: 'Past or future treachery', icon: '🗡️', category: 'relationship' },
  rivalry: { label: 'Rivalry', desc: 'Competition between characters', icon: '⚔️', category: 'relationship' },
  alliance: { label: 'Alliance', desc: 'Agreement between parties', icon: '🤲', category: 'relationship' },
  
  // Events & Circumstances
  deadline: { label: 'Deadline', desc: 'Time pressure driving action', icon: '⏰', category: 'event' },
  crime: { label: 'Crime', desc: 'Offense requiring resolution', icon: '🚨', category: 'event' },
  accident: { label: 'Accident', desc: 'Unintended event with consequences', icon: '💥', category: 'event' },
  illness: { label: 'Illness', desc: 'Disease affecting character', icon: '🤒', category: 'event' },
  death: { label: 'Death', desc: 'Passing that affects story', icon: '⚰️', category: 'event' },
  disappearance: { label: 'Disappearance', desc: 'Missing person or thing', icon: '❓', category: 'event' },
  discovery: { label: 'Discovery', desc: 'Finding that changes everything', icon: '💡', category: 'event' },
  scandal: { label: 'Scandal', desc: 'Public disgrace or revelation', icon: '📰', category: 'event' },
  war: { label: 'War/Conflict', desc: 'Armed struggle affecting all', icon: '⚔️', category: 'event' },
  natural_disaster: { label: 'Natural Disaster', desc: 'Storm, earthquake, flood', icon: '🌊', category: 'event' },
  
  // Abstract Concepts
  power: { label: 'Power', desc: 'Authority or supernatural ability', icon: '👑', category: 'abstract' },
  curse: { label: 'Curse', desc: 'Magical affliction or fate', icon: '💀', category: 'abstract' },
  blessing: { label: 'Blessing', desc: 'Divine favor or gift', icon: '✨', category: 'abstract' },
  destiny: { label: 'Destiny', desc: 'Predetermined fate', icon: '🌟', category: 'abstract' },
  dream: { label: 'Dream/Vision', desc: 'Prophetic or meaningful dream', icon: '💭', category: 'abstract' },
  madness: { label: 'Madness', desc: 'Mental instability as plot device', icon: '🌀', category: 'abstract' },
  love: { label: 'Love', desc: 'Romantic or familial attachment', icon: '❤️', category: 'abstract' },
  revenge: { label: 'Revenge', desc: 'Desire for retribution', icon: '⚡', category: 'abstract' },
  guilt: { label: 'Guilt', desc: 'Burden of past actions', icon: '😔', category: 'abstract' },
  ambition: { label: 'Ambition', desc: 'Driving desire for achievement', icon: '🎯', category: 'abstract' },
  
  // Places & Access
  hideout: { label: 'Hideout', desc: 'Secret location', icon: '🏚️', category: 'place' },
  passage: { label: 'Secret Passage', desc: 'Hidden route or door', icon: '🚪', category: 'place' },
  territory: { label: 'Territory', desc: 'Land to control or protect', icon: '🗺️', category: 'place' },
  sanctuary: { label: 'Sanctuary', desc: 'Safe haven from threats', icon: '🏛️', category: 'place' },
  prison: { label: 'Prison/Trap', desc: 'Place of confinement', icon: '⛓️', category: 'place' },
  
  // Technology & Science (modern/scifi)
  data: { label: 'Data', desc: 'Digital information', icon: '💾', category: 'technology' },
  device: { label: 'Device', desc: 'Technological gadget', icon: '📱', category: 'technology' },
  formula: { label: 'Formula', desc: 'Scientific recipe or equation', icon: '🧪', category: 'technology' },
  virus: { label: 'Virus', desc: 'Biological or digital threat', icon: '🦠', category: 'technology' },
  ai: { label: 'AI/Robot', desc: 'Artificial intelligence', icon: '🤖', category: 'technology' },
  
  // Supernatural (fantasy/horror)
  spirit: { label: 'Spirit/Ghost', desc: 'Supernatural presence', icon: '👻', category: 'supernatural' },
  portal: { label: 'Portal', desc: 'Gateway to another realm', icon: '🌀', category: 'supernatural' },
  familiar: { label: 'Familiar', desc: 'Magical creature companion', icon: '🐈', category: 'supernatural' },
  spell: { label: 'Spell/Ritual', desc: 'Magical procedure', icon: '✨', category: 'supernatural' },
  relic: { label: 'Holy Relic', desc: 'Sacred object with power', icon: '⭐', category: 'supernatural' }
};

export const OBJECT_SIGNIFICANCE = {
  minor: { label: 'Minor', desc: 'Background detail, mentioned in passing' },
  important: { label: 'Important', desc: 'Affects plot, has narrative weight' },
  central: { label: 'Central', desc: 'Key to the story, major plot element' },
  macguffin: { label: 'MacGuffin', desc: 'Everyone wants it, drives the plot' },
  red_herring: { label: 'Red Herring', desc: 'Misleads reader, false clue' },
  chekhov: { label: "Chekhov's Gun", desc: 'Introduced early, crucial later' }
};

// Extended names for plot elements - organized by category
export const OBJECT_NAMES = [
  // Fantasy artifacts
  'The Silver Key', 'Ancient Map', 'Crystal Orb', 'Enchanted Blade', 'Sacred Tome',
  'Dragon Scale', 'Phoenix Feather', 'Shadow Cloak', 'Crown of Stars', 'Ring of Power',
  'Sunstone Amulet', 'Moonlight Dagger', 'Stormcaller Staff', 'Iron Crown', 'Jade Mirror',
  'Obsidian Compass', 'Golden Chalice', 'Raven Quill', 'Thunder Hammer', 'Frost Scepter',
  // Mystery/thriller items
  'The Missing Letter', 'Bloodstained Glove', 'Forged Document', 'Hidden Diary',
  'Encrypted USB Drive', 'Surveillance Footage', 'Anonymous Tip', 'The Murder Weapon',
  'Alibi Photograph', 'Offshore Account', 'Burner Phone', 'Witness Statement',
  'The Ransom Note', 'Fingerprint Evidence', 'DNA Sample', 'Security Badge',
  // Romance elements
  'Love Letters', 'Wedding Ring', 'Pressed Flowers', 'Childhood Photo',
  'The Promise', 'Family Heirloom', 'Secret Admirer Note', 'Engagement Ring',
  'Shared Memory', 'The Dance', 'First Gift', 'Anniversary Token',
  // Drama elements
  'The Will', 'Birth Certificate', 'Adoption Papers', 'Divorce Agreement',
  'Business Contract', 'Medical Records', 'Prison Release Papers', 'Scholarship Offer',
  'Eviction Notice', 'Bankruptcy Filing', 'Inheritance Dispute', 'Custody Agreement',
  // Scifi elements
  'Quantum Drive', 'Neural Implant', 'Clone Data', 'Terraforming Blueprint',
  'Alien Artifact', 'Time Device', 'Dimensional Key', 'Synthetic Virus',
  'Memory Chip', 'Holographic Message', 'Starship Codes', 'AI Core',
  // Horror elements
  'Cursed Object', 'Ritual Book', 'Spirit Board', 'Haunted Doll',
  'Blood Vial', 'Bone Relic', 'Possessed Artifact', 'Demonic Contract',
  'The Photograph', 'Strange Symbol', 'Ancient Seal', 'Nightmare Journal',
  // Universal/abstract
  'The Secret', 'Unspoken Promise', 'Forgotten Memory', 'Hidden Truth',
  'The Prophecy', 'Ancient Curse', 'Family Secret', 'Buried Past',
  'The Betrayal', 'Lost Opportunity', 'Second Chance', 'Final Hope'
];
