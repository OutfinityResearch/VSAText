/**
 * Planning Agent Service
 * Generates structured story plans from narrative specifications
 */

import crypto from 'crypto';
import { parseCnlToConstraints } from './cnl-translator.mjs';

// Story structure templates
const STORY_STRUCTURES = {
  three_act: {
    name: 'Three Act Structure',
    acts: [
      { id: 'act_1', name: 'Setup', percentage: 25 },
      { id: 'act_2', name: 'Confrontation', percentage: 50 },
      { id: 'act_3', name: 'Resolution', percentage: 25 }
    ]
  },
  hero_journey: {
    name: "Hero's Journey",
    acts: [
      { id: 'departure', name: 'Departure', percentage: 33 },
      { id: 'initiation', name: 'Initiation', percentage: 34 },
      { id: 'return', name: 'Return', percentage: 33 }
    ]
  },
  five_act: {
    name: 'Five Act Structure',
    acts: [
      { id: 'act_1', name: 'Exposition', percentage: 15 },
      { id: 'act_2', name: 'Rising Action', percentage: 25 },
      { id: 'act_3', name: 'Climax', percentage: 20 },
      { id: 'act_4', name: 'Falling Action', percentage: 25 },
      { id: 'act_5', name: 'Denouement', percentage: 15 }
    ]
  }
};

// Scene templates for different story beats
const SCENE_TEMPLATES = {
  setup: [
    { type: 'introduction', summary: 'Introduce protagonist and their world' },
    { type: 'inciting_incident', summary: 'Event that disrupts the status quo' },
    { type: 'call_to_action', summary: 'Protagonist faces a choice or challenge' }
  ],
  confrontation: [
    { type: 'first_obstacle', summary: 'Protagonist encounters first major obstacle' },
    { type: 'rising_tension', summary: 'Stakes increase, complications arise' },
    { type: 'midpoint', summary: 'Major revelation or turning point' },
    { type: 'crisis', summary: 'Protagonist faces their greatest challenge' },
    { type: 'dark_moment', summary: 'All seems lost' }
  ],
  resolution: [
    { type: 'climax', summary: 'Final confrontation or decisive action' },
    { type: 'falling_action', summary: 'Consequences of the climax unfold' },
    { type: 'denouement', summary: 'New equilibrium established' }
  ]
};

/**
 * Generate a unique ID
 */
function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

/**
 * Extract characters from spec
 */
function extractCharacters(spec) {
  const characters = [];
  
  if (spec.characters && Array.isArray(spec.characters)) {
    return spec.characters;
  }
  
  // Try to extract from CNL constraints
  if (spec.cnl_constraints) {
    const { constraints } = parseCnlToConstraints(spec.cnl_constraints);
    for (const c of constraints) {
      if (c.type === 'CHARACTER') {
        const name = c.args[0];
        const existing = characters.find(ch => ch.name === name);
        if (!existing) {
          characters.push({ name, traits: [], goals: [] });
        }
      }
      if (c.type === 'TRAIT' && c.args.length >= 2) {
        const charName = c.args[0];
        const trait = c.args[1];
        const char = characters.find(ch => ch.name === charName);
        if (char) {
          char.traits.push(trait);
        }
      }
      if (c.type === 'GOAL' && c.args.length >= 3) {
        const charName = c.args[0];
        const action = c.args[1];
        const target = c.args[2];
        const char = characters.find(ch => ch.name === charName);
        if (char) {
          char.goals.push({ action, target });
        }
      }
    }
  }
  
  return characters;
}

/**
 * Extract scene requirements from CNL constraints
 */
function extractSceneRequirements(spec) {
  const requirements = {};
  
  if (spec.cnl_constraints) {
    const { constraints } = parseCnlToConstraints(spec.cnl_constraints);
    for (const c of constraints) {
      if (c.type === 'RULE' && c.args[0]?.startsWith('Scene_')) {
        const sceneNum = parseInt(c.args[0].replace('Scene_', ''));
        if (!requirements[sceneNum]) {
          requirements[sceneNum] = [];
        }
        requirements[sceneNum].push({
          type: c.args[1],
          value: c.args[2]
        });
      }
    }
  }
  
  return requirements;
}

/**
 * Generate plot graph nodes
 */
function generatePlotGraph(spec, scenes) {
  const nodes = [];
  const edges = [];
  
  // Create nodes for each scene
  scenes.forEach((scene, index) => {
    nodes.push({
      id: scene.id,
      type: 'scene',
      label: scene.summary,
      position: index
    });
    
    // Create sequential edges
    if (index > 0) {
      edges.push({
        from: scenes[index - 1].id,
        to: scene.id,
        type: 'sequence'
      });
    }
  });
  
  // Add character arcs as additional edges
  const characters = extractCharacters(spec);
  characters.forEach(char => {
    if (char.goals && char.goals.length > 0) {
      // Character goal introduction
      if (scenes.length >= 2) {
        edges.push({
          from: scenes[0].id,
          to: scenes[scenes.length - 1].id,
          type: 'character_arc',
          character: char.name,
          label: `${char.name}'s journey`
        });
      }
    }
  });
  
  return { nodes, edges };
}

/**
 * Generate scenes based on structure and constraints
 */
function generateScenes(spec, structure, sceneCount) {
  const scenes = [];
  const requirements = extractSceneRequirements(spec);
  const characters = extractCharacters(spec);
  
  const structureDef = STORY_STRUCTURES[structure] || STORY_STRUCTURES.three_act;
  let currentScene = 1;
  
  for (const act of structureDef.acts) {
    const actSceneCount = Math.max(1, Math.round(sceneCount * act.percentage / 100));
    
    for (let i = 0; i < actSceneCount && currentScene <= sceneCount; i++) {
      const sceneId = makeId('scene');
      
      // Get scene template based on act
      let templatePool;
      if (act.name.toLowerCase().includes('setup') || act.name.toLowerCase().includes('exposition') || act.name.toLowerCase().includes('departure')) {
        templatePool = SCENE_TEMPLATES.setup;
      } else if (act.name.toLowerCase().includes('resolution') || act.name.toLowerCase().includes('return') || act.name.toLowerCase().includes('denouement')) {
        templatePool = SCENE_TEMPLATES.resolution;
      } else {
        templatePool = SCENE_TEMPLATES.confrontation;
      }
      
      const template = templatePool[i % templatePool.length];
      
      // Build scene
      const scene = {
        id: sceneId,
        number: currentScene,
        act: act.id,
        act_name: act.name,
        type: template.type,
        summary: template.summary,
        characters: [],
        requirements: requirements[currentScene] || [],
        estimated_words: 500 + Math.floor(Math.random() * 500)
      };
      
      // Add character involvement
      if (characters.length > 0) {
        // Main character always present
        scene.characters.push(characters[0].name);
        // Add additional characters for some scenes
        if (currentScene > 2 && characters.length > 1) {
          scene.characters.push(characters[Math.floor(Math.random() * (characters.length - 1)) + 1].name);
        }
      }
      
      // Apply specific requirements
      if (requirements[currentScene]) {
        for (const req of requirements[currentScene]) {
          if (req.type === 'must_include') {
            scene.must_include = scene.must_include || [];
            scene.must_include.push(req.value);
            scene.summary += ` (must include: ${req.value})`;
          }
        }
      }
      
      scenes.push(scene);
      currentScene++;
    }
  }
  
  return scenes;
}

/**
 * Generate character arcs
 */
function generateArcs(spec, scenes) {
  const arcs = [];
  const characters = extractCharacters(spec);
  
  for (const char of characters) {
    const arc = {
      id: makeId('arc'),
      character: char.name,
      type: 'character_arc',
      stages: []
    };
    
    // Generate arc stages based on traits and goals
    if (char.traits && char.traits.length > 0) {
      arc.stages.push({
        scene_id: scenes[0]?.id,
        stage: 'establishment',
        description: `Establish ${char.name}'s core traits: ${char.traits.join(', ')}`
      });
    }
    
    if (char.goals && char.goals.length > 0) {
      arc.stages.push({
        scene_id: scenes[Math.floor(scenes.length / 4)]?.id,
        stage: 'motivation',
        description: `${char.name} commits to their goal: ${char.goals[0].action} ${char.goals[0].target}`
      });
    }
    
    if (scenes.length > 3) {
      arc.stages.push({
        scene_id: scenes[Math.floor(scenes.length / 2)]?.id,
        stage: 'test',
        description: `${char.name}'s traits are tested`
      });
      
      arc.stages.push({
        scene_id: scenes[scenes.length - 1]?.id,
        stage: 'transformation',
        description: `${char.name}'s arc reaches its conclusion`
      });
    }
    
    arcs.push(arc);
  }
  
  return arcs;
}

/**
 * Generate emotional arc profile
 */
function generateEmotionalArc(spec, scenes) {
  const arc = {
    type: 'emotional',
    pattern: 'fall_rise',
    datapoints: []
  };
  
  // Generate emotional trajectory
  scenes.forEach((scene, index) => {
    const progress = index / (scenes.length - 1);
    let valence;
    
    // Classic "fall-rise" pattern
    if (progress < 0.25) {
      valence = 0.6 - progress * 0.4; // Start positive, begin decline
    } else if (progress < 0.75) {
      valence = 0.5 - (progress - 0.25) * 0.6; // Decline to low point
    } else {
      valence = 0.2 + (progress - 0.75) * 2.4; // Rise to resolution
    }
    
    arc.datapoints.push({
      scene_id: scene.id,
      position: progress,
      valence: Math.max(0, Math.min(1, valence))
    });
  });
  
  return arc;
}

/**
 * Main planning function
 */
function generatePlan(spec, options = {}) {
  const structure = options.structure || 'three_act';
  const sceneCount = options.scene_count || 9;
  
  // Generate scenes
  const scenes = generateScenes(spec, structure, sceneCount);
  
  // Generate plot graph
  const plotGraph = generatePlotGraph(spec, scenes);
  
  // Generate character arcs
  const arcs = generateArcs(spec, scenes);
  
  // Generate emotional arc
  const emotionalArc = generateEmotionalArc(spec, scenes);
  
  // Build the plan object
  const plan = {
    id: makeId('plan'),
    spec_id: spec.id,
    created_at: new Date().toISOString(),
    structure: structure,
    structure_name: STORY_STRUCTURES[structure]?.name || 'Three Act Structure',
    plot_graph: plotGraph,
    scenes: scenes,
    arcs: [...arcs, emotionalArc],
    goals: extractCharacters(spec).flatMap(c => c.goals || []),
    metadata: {
      total_scenes: scenes.length,
      estimated_words: scenes.reduce((sum, s) => sum + s.estimated_words, 0),
      character_count: extractCharacters(spec).length
    }
  };
  
  return plan;
}

export {
  generatePlan,
  extractCharacters,
  extractSceneRequirements,
  STORY_STRUCTURES,
  SCENE_TEMPLATES
};
