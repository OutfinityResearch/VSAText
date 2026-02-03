/**
 * SCRIPTA Demo - State Management
 * 
 * Centralized application state.
 */

export const state = {
  project: {
    id: null,
    name: 'Untitled Story',
    selectedArc: 'heros_journey',
    libraries: { 
      characters: [], 
      locations: [], 
      objects: [], 
      moods: [],
      emotionalArc: [],
      themes: [],
      relationships: [],
      worldRules: []
    },
    structure: null
  },
  selectedNode: null,
  editingEntity: null,
  blocksFilter: 'all'
};

export function resetProject() {
  state.project = {
    id: null,
    name: 'Untitled Story',
    selectedArc: 'heros_journey',
    libraries: {
      characters: [],
      locations: [],
      objects: [],
      moods: [],
      emotionalArc: [],
      themes: [],
      relationships: [],
      worldRules: []
    },
    structure: null
  };
  state.selectedNode = null;
  state.editingEntity = null;
}

export function loadProjectState(project) {
  state.project = {
    id: project.id,
    name: project.name || 'Untitled Story',
    selectedArc: project.selectedArc || 'heros_journey',
    libraries: project.libraries || {
      characters: [], locations: [], objects: [], moods: [],
      emotionalArc: [], themes: [], relationships: [], worldRules: []
    },
    structure: project.structure || null
  };
}

export default state;
