/**
 * SCRIPTA Vocabulary - Actions Module
 * 
 * Character actions and narrative blocks.
 */

// ============================================
// NARRATIVE BLOCKS (Story Patterns)
// ============================================
export const NARRATIVE_BLOCKS = {
  // Opening Blocks
  ordinary_world: { label: 'Ordinary World', desc: 'Establish the hero\'s normal life before adventure', phase: 'opening', scope: 'scene', suggestedMoods: ['peaceful', 'melancholic'], themes: ['identity', 'family'] },
  call_to_adventure: { label: 'Call to Adventure', desc: 'Something disrupts normality and invites action', phase: 'opening', scope: 'scene', suggestedMoods: ['mysterious', 'adventurous'], themes: ['freedom', 'growth'] },
  refusal_of_call: { label: 'Refusal of the Call', desc: 'The hero initially resists due to fear', phase: 'opening', scope: 'scene', suggestedMoods: ['tense', 'melancholic'], themes: ['fear', 'identity'] },
  
  // Transition Blocks
  crossing_threshold: { label: 'Crossing the Threshold', desc: 'The hero commits to the adventure', phase: 'transition', scope: 'scene', suggestedMoods: ['adventurous', 'tense'], themes: ['freedom', 'growth'] },
  meeting_mentor: { label: 'Meeting the Mentor', desc: 'The hero encounters a guide', phase: 'transition', scope: 'scene', suggestedMoods: ['mysterious', 'peaceful'], themes: ['wisdom', 'growth'] },
  tests_allies_enemies: { label: 'Tests and Alliances', desc: 'The hero faces challenges and learns trust', phase: 'transition', scope: 'chapter', suggestedMoods: ['tense', 'adventurous'], themes: ['trust', 'identity'] },
  
  // Confrontation Blocks
  approach_cave: { label: 'Approach to Danger', desc: 'The hero prepares for major challenge', phase: 'confrontation', scope: 'scene', suggestedMoods: ['ominous', 'tense'], themes: ['fear', 'courage'] },
  ordeal: { label: 'The Ordeal', desc: 'The hero faces their greatest fear', phase: 'confrontation', scope: 'chapter', suggestedMoods: ['desperate', 'epic'], themes: ['sacrifice', 'survival'] },
  death_rebirth: { label: 'Death and Rebirth', desc: 'Symbolic death and rebirth', phase: 'confrontation', scope: 'scene', suggestedMoods: ['desperate', 'revelatory'], themes: ['identity', 'redemption'] },
  
  // Resolution Blocks
  reward: { label: 'Seizing the Reward', desc: 'The hero claims the prize', phase: 'resolution', scope: 'scene', suggestedMoods: ['triumphant', 'peaceful'], themes: ['power', 'justice'] },
  road_back: { label: 'The Road Back', desc: 'The hero must return', phase: 'resolution', scope: 'chapter', suggestedMoods: ['tense', 'adventurous'], themes: ['home', 'identity'] },
  resurrection: { label: 'Resurrection', desc: 'Final test using everything learned', phase: 'resolution', scope: 'scene', suggestedMoods: ['epic', 'triumphant'], themes: ['sacrifice', 'redemption'] },
  return_elixir: { label: 'Return with Elixir', desc: 'Hero returns home transformed', phase: 'resolution', scope: 'scene', suggestedMoods: ['peaceful', 'bittersweet'], themes: ['legacy', 'growth'] },
  
  // Micro Blocks
  revelation: { label: 'Revelation', desc: 'A hidden truth changes everything', phase: 'micro', scope: 'scene', suggestedMoods: ['revelatory', 'mysterious'], themes: ['truth', 'betrayal'] },
  betrayal: { label: 'Betrayal', desc: 'A trusted ally reveals hostile nature', phase: 'micro', scope: 'scene', suggestedMoods: ['desperate', 'tense'], themes: ['betrayal', 'trust'] },
  sacrifice: { label: 'Sacrifice', desc: 'A character gives up something precious', phase: 'micro', scope: 'scene', suggestedMoods: ['bittersweet', 'epic'], themes: ['sacrifice', 'love'] },
  reunion: { label: 'Reunion', desc: 'Separated characters come back together', phase: 'micro', scope: 'scene', suggestedMoods: ['triumphant', 'intimate'], themes: ['family', 'love'] },
  confrontation: { label: 'Confrontation', desc: 'Two opposing forces face each other', phase: 'micro', scope: 'scene', suggestedMoods: ['tense', 'epic'], themes: ['justice', 'revenge'] },
  escape: { label: 'Escape', desc: 'Characters flee from danger', phase: 'micro', scope: 'scene', suggestedMoods: ['tense', 'desperate'], themes: ['freedom', 'survival'] },
  discovery: { label: 'Discovery', desc: 'Something new and important is found', phase: 'micro', scope: 'scene', suggestedMoods: ['mysterious', 'adventurous'], themes: ['truth', 'power'] },
  temptation: { label: 'Temptation', desc: 'Character faces choice testing values', phase: 'micro', scope: 'scene', suggestedMoods: ['tense', 'intimate'], themes: ['corruption', 'identity'] },
  rescue: { label: 'Rescue', desc: 'One character saves another', phase: 'micro', scope: 'scene', suggestedMoods: ['epic', 'triumphant'], themes: ['sacrifice', 'love'] },
  loss: { label: 'Loss', desc: 'Character loses something precious', phase: 'micro', scope: 'scene', suggestedMoods: ['melancholic', 'desperate'], themes: ['mortality', 'sacrifice'] },
  transformation: { label: 'Transformation', desc: 'Character undergoes significant change', phase: 'micro', scope: 'scene', suggestedMoods: ['revelatory', 'epic'], themes: ['identity', 'growth'] },
  choice: { label: 'Critical Choice', desc: 'Character must decide with major consequences', phase: 'micro', scope: 'scene', suggestedMoods: ['tense', 'intimate'], themes: ['identity', 'justice'] }
};

// ============================================
// ACTIONS (with compatibility)
// ============================================
export const ACTIONS = {
  // Communication
  speaks_to: { label: 'speaks to', requires: ['character', 'character'], category: 'communication', compatibleMoods: ['all'] },
  argues_with: { label: 'argues with', requires: ['character', 'character'], category: 'conflict', compatibleMoods: ['tense', 'desperate'] },
  confesses_to: { label: 'confesses to', requires: ['character', 'character'], category: 'revelation', compatibleMoods: ['intimate', 'desperate', 'revelatory'] },
  lies_to: { label: 'lies to', requires: ['character', 'character'], category: 'deception', impliesTrait: 'deceit' },
  warns: { label: 'warns', requires: ['character', 'character'], category: 'communication', compatibleMoods: ['ominous', 'tense'] },
  persuades: { label: 'persuades', requires: ['character', 'character'], category: 'influence', impliesTrait: 'charismatic' },
  threatens: { label: 'threatens', requires: ['character', 'character'], category: 'conflict', compatibleMoods: ['tense', 'ominous'] },
  comforts: { label: 'comforts', requires: ['character', 'character'], category: 'support', compatibleMoods: ['intimate', 'peaceful', 'melancholic'] },
  
  // Movement
  travels_to: { label: 'travels to', requires: ['character', 'location'], category: 'movement', compatibleMoods: ['adventurous', 'tense'] },
  flees_from: { label: 'flees from', requires: ['character', 'location|character'], category: 'escape', compatibleMoods: ['tense', 'desperate', 'horrific'] },
  arrives_at: { label: 'arrives at', requires: ['character', 'location'], category: 'movement' },
  follows: { label: 'follows', requires: ['character', 'character'], category: 'pursuit', compatibleMoods: ['mysterious', 'tense'] },
  hides_at: { label: 'hides at', requires: ['character', 'location'], category: 'stealth', compatibleMoods: ['tense', 'desperate'] },
  returns_to: { label: 'returns to', requires: ['character', 'location'], category: 'movement', compatibleMoods: ['peaceful', 'melancholic', 'bittersweet'] },
  
  // Discovery
  discovers: { label: 'discovers', requires: ['character', 'object|secret|location'], category: 'discovery', compatibleMoods: ['mysterious', 'revelatory', 'adventurous'] },
  finds: { label: 'finds', requires: ['character', 'object|character'], category: 'discovery' },
  learns_about: { label: 'learns about', requires: ['character', 'secret|character'], category: 'knowledge', compatibleMoods: ['revelatory', 'mysterious'] },
  realizes: { label: 'realizes', requires: ['character', 'truth'], category: 'revelation', compatibleMoods: ['revelatory', 'desperate'] },
  investigates: { label: 'investigates', requires: ['character', 'location|object'], category: 'discovery', compatibleMoods: ['mysterious', 'tense'] },
  
  // Combat
  fights: { label: 'fights', requires: ['character', 'character'], category: 'combat', compatibleMoods: ['tense', 'epic', 'desperate'] },
  defeats: { label: 'defeats', requires: ['character', 'character'], category: 'combat', compatibleMoods: ['triumphant', 'epic'] },
  is_defeated_by: { label: 'is defeated by', requires: ['character', 'character'], category: 'combat', compatibleMoods: ['desperate', 'melancholic'] },
  attacks: { label: 'attacks', requires: ['character', 'character|location'], category: 'combat', compatibleMoods: ['tense', 'epic'] },
  defends: { label: 'defends', requires: ['character', 'character|location'], category: 'combat', compatibleMoods: ['tense', 'epic', 'desperate'] },
  duels: { label: 'duels', requires: ['character', 'character'], category: 'combat', compatibleMoods: ['tense', 'epic'] },
  
  // Relationships
  befriends: { label: 'befriends', requires: ['character', 'character'], category: 'relationship', createsRelationship: 'friends' },
  betrays: { label: 'betrays', requires: ['character', 'character'], category: 'betrayal', breaksRelationship: true, compatibleMoods: ['desperate', 'tense'] },
  saves: { label: 'saves', requires: ['character', 'character'], category: 'heroic', compatibleMoods: ['triumphant', 'desperate', 'epic'] },
  forgives: { label: 'forgives', requires: ['character', 'character'], category: 'redemption', compatibleMoods: ['peaceful', 'bittersweet', 'intimate'] },
  abandons: { label: 'abandons', requires: ['character', 'character'], category: 'betrayal', breaksRelationship: true, compatibleMoods: ['desperate', 'melancholic'] },
  reunites_with: { label: 'reunites with', requires: ['character', 'character'], category: 'relationship', compatibleMoods: ['triumphant', 'intimate', 'bittersweet'] },
  falls_in_love_with: { label: 'falls in love with', requires: ['character', 'character'], category: 'romantic', createsRelationship: 'lovers', compatibleMoods: ['romantic', 'intimate'] },
  
  // Objects
  receives: { label: 'receives', requires: ['character', 'object'], from: 'character', category: 'transfer' },
  gives: { label: 'gives', requires: ['character', 'object'], to: 'character', category: 'transfer' },
  uses: { label: 'uses', requires: ['character', 'object'], category: 'action' },
  destroys: { label: 'destroys', requires: ['character', 'object|location'], category: 'destruction', compatibleMoods: ['desperate', 'epic'] },
  steals: { label: 'steals', requires: ['character', 'object'], from: 'character', category: 'theft', impliesTrait: 'deceit' },
  hides: { label: 'hides', requires: ['character', 'object'], at: 'location', category: 'concealment' },
  creates: { label: 'creates', requires: ['character', 'object'], category: 'creation', impliesTrait: 'creativity' },
  
  // Mental/Emotional
  remembers: { label: 'remembers', requires: ['character', 'event|character'], category: 'memory', compatibleMoods: ['melancholic', 'nostalgic', 'intimate'] },
  decides: { label: 'decides', requires: ['character', 'choice'], category: 'decision', compatibleMoods: ['tense', 'revelatory'] },
  fears: { label: 'fears', requires: ['character', 'character|object|concept'], category: 'emotion', compatibleMoods: ['ominous', 'tense', 'horrific'] },
  hopes_for: { label: 'hopes for', requires: ['character', 'outcome'], category: 'emotion', compatibleMoods: ['peaceful', 'adventurous'] },
  grieves_for: { label: 'grieves for', requires: ['character', 'character|loss'], category: 'emotion', compatibleMoods: ['melancholic', 'desperate'] },
  
  // Transformation
  becomes: { label: 'becomes', requires: ['character', 'state|role'], category: 'transformation', compatibleMoods: ['revelatory', 'epic'] },
  sacrifices: { label: 'sacrifices', requires: ['character', 'object|self'], for: 'character|cause', category: 'sacrifice', compatibleMoods: ['desperate', 'epic', 'bittersweet'] },
  dies: { label: 'dies', requires: ['character'], category: 'death', compatibleMoods: ['desperate', 'melancholic', 'epic'] },
  is_reborn: { label: 'is reborn', requires: ['character'], category: 'transformation', compatibleMoods: ['revelatory', 'triumphant'] },
  
  // Teaching/Learning
  teaches: { label: 'teaches', requires: ['character', 'character'], about: 'skill|knowledge', category: 'mentorship', compatibleMoods: ['peaceful', 'mysterious'] },
  trains_with: { label: 'trains with', requires: ['character', 'character'], category: 'development', compatibleMoods: ['adventurous', 'tense'] },
  
  // Social
  meets: { label: 'meets', requires: ['character', 'character'], category: 'social', compatibleMoods: ['all'] },
  joins: { label: 'joins', requires: ['character', 'group|character'], category: 'alliance', createsRelationship: 'allies' },
  leads: { label: 'leads', requires: ['character', 'group|character'], category: 'leadership', impliesTrait: 'charismatic' },
  challenges: { label: 'challenges', requires: ['character', 'character'], category: 'conflict', compatibleMoods: ['tense', 'epic'] }
};
