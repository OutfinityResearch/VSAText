/**
 * Planning Agent Service
 * Generates structured story plans from narrative specifications
 */

import { parseCNL, extractEntities, extractConstraints } from '../cnl/validator.mjs';
import { makeId } from '../utils/ids.mjs';

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

// makeId(prefix) is provided by src/utils/ids.mjs

/**
 * Extract characters from spec using SVO CNL AST
 * 
 * The new AST structure from extractEntities() returns:
 * {
 *   characters: [{ name, type, types, traits, properties, relationships }],
 *   locations: [...],
 *   themes: [...],
 *   objects: [...],
 *   other: [...]
 * }
 */
function extractCharactersFromSpec(spec) {
  // If spec already has characters array, use it directly
  if (spec.characters && Array.isArray(spec.characters)) {
    return spec.characters.map(ch => ({
      name: ch.name,
      traits: ch.traits || [],
      goals: ch.goals || [],
      role: ch.role || ch.type || 'character'
    }));
  }
  
  // Try to extract from CNL constraints using SVO parser
  if (spec.cnl_constraints) {
    const result = parseCNL(spec.cnl_constraints);
    if (!result.valid) {
      console.warn('CNL parsing had errors:', result.errors);
    }
    
    const entities = extractEntities(result.ast);
    
    // Convert AST entities to planning format
    return entities.characters.map(char => {
      // Extract goals from relationships (e.g., "wants to", "seeks")
      const goals = [];
      for (const rel of char.relationships || []) {
        if (['wants', 'seeks', 'desires', 'pursues'].includes(rel.type)) {
          goals.push({ action: rel.type, target: rel.target });
        }
      }
      
      // Also check properties for goals
      if (char.properties?.goal) {
        goals.push({ action: 'achieve', target: char.properties.goal });
      }
      
      return {
        name: char.name,
        traits: char.traits || [],
        goals,
        role: char.type || 'character',
        properties: char.properties || {}
      };
    });
  }
  
  return [];
}

/**
 * Extract scene requirements from CNL constraints using SVO AST
 * 
 * The new AST constraint structure:
 * {
 *   requires: [{ subject, target, scope, line }],   // "Scene_3 requires storm"
 *   forbids: [{ subject, target, scope, line }],    // "Scene_3 forbids violence"
 *   must: [{ subject, action, target, scope, line }], // "Scene_3 must introduce villain"
 *   tone: [{ subject, value, line }],               // "Scene_3 has tone tense"
 *   max: [{ subject, property, value, line }],      // "Scene_3 has max words 1000"
 *   min: [{ subject, property, value, line }]       // "Scene_3 has min tension 5"
 * }
 */
function extractSceneRequirementsFromSpec(spec) {
  const requirements = {};
  
  if (!spec.cnl_constraints) {
    return requirements;
  }
  
  const result = parseCNL(spec.cnl_constraints);
  const constraints = extractConstraints(result.ast);
  
  // Helper to extract scene number from subject (e.g., "Scene_3" -> 3)
  function getSceneNumber(subject) {
    const match = subject?.match(/Scene_(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }
  
  // Helper to ensure scene entry exists
  function ensureScene(num) {
    if (num !== null && !requirements[num]) {
      requirements[num] = {
        must_include: [],
        must_exclude: [],
        must_actions: [],
        tone: null,
        max: {},
        min: {}
      };
    }
  }
  
  // Process 'requires' constraints
  for (const req of constraints.requires || []) {
    const sceneNum = getSceneNumber(req.subject);
    if (sceneNum !== null) {
      ensureScene(sceneNum);
      requirements[sceneNum].must_include.push(req.target);
    }
  }
  
  // Process 'forbids' constraints
  for (const forbid of constraints.forbids || []) {
    const sceneNum = getSceneNumber(forbid.subject);
    if (sceneNum !== null) {
      ensureScene(sceneNum);
      requirements[sceneNum].must_exclude.push(forbid.target);
    }
  }
  
  // Process 'must' constraints (actions like introduce, resolve, reveal)
  for (const must of constraints.must || []) {
    const sceneNum = getSceneNumber(must.subject);
    if (sceneNum !== null) {
      ensureScene(sceneNum);
      requirements[sceneNum].must_actions.push({
        action: must.action,  // e.g., 'introduce', 'resolve', 'reveal'
        target: must.target
      });
    }
  }
  
  // Process 'tone' constraints
  for (const tone of constraints.tone || []) {
    const sceneNum = getSceneNumber(tone.subject);
    if (sceneNum !== null) {
      ensureScene(sceneNum);
      requirements[sceneNum].tone = tone.value;
    }
  }
  
  // Process 'max' constraints
  for (const max of constraints.max || []) {
    const sceneNum = getSceneNumber(max.subject);
    if (sceneNum !== null) {
      ensureScene(sceneNum);
      requirements[sceneNum].max[max.property] = max.value;
    }
  }
  
  // Process 'min' constraints
  for (const min of constraints.min || []) {
    const sceneNum = getSceneNumber(min.subject);
    if (sceneNum !== null) {
      ensureScene(sceneNum);
      requirements[sceneNum].min[min.property] = min.value;
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
  const characters = extractCharactersFromSpec(spec);
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
  const requirements = extractSceneRequirementsFromSpec(spec);
  const characters = extractCharactersFromSpec(spec);
  
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
      const sceneReqs = requirements[currentScene] || { must_include: [], must_exclude: [], must_actions: [] };
      const scene = {
        id: sceneId,
        number: currentScene,
        act: act.id,
        act_name: act.name,
        type: template.type,
        summary: template.summary,
        characters: [],
        requirements: sceneReqs,
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
      
      // Apply specific requirements from SVO AST format
      if (sceneReqs.must_include && sceneReqs.must_include.length > 0) {
        scene.must_include = sceneReqs.must_include;
        scene.summary += ` (must include: ${sceneReqs.must_include.join(', ')})`;
      }
      
      if (sceneReqs.must_actions && sceneReqs.must_actions.length > 0) {
        scene.must_actions = sceneReqs.must_actions;
        for (const action of sceneReqs.must_actions) {
          scene.summary += ` (must ${action.action}: ${action.target})`;
        }
      }
      
      if (sceneReqs.tone) {
        scene.tone = sceneReqs.tone;
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
  const characters = extractCharactersFromSpec(spec);
  
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
    goals: extractCharactersFromSpec(spec).flatMap(c => c.goals || []),
    metadata: {
      total_scenes: scenes.length,
      estimated_words: scenes.reduce((sum, s) => sum + s.estimated_words, 0),
      character_count: extractCharactersFromSpec(spec).length
    }
  };
  
  return plan;
}

export {
  generatePlan,
  extractCharactersFromSpec,
  extractSceneRequirementsFromSpec,
  STORY_STRUCTURES,
  SCENE_TEMPLATES
};
