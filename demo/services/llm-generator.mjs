/**
 * SCRIPTA LLM Generator Service
 * 
 * Integrates with AchillesAgentLib for LLM-based story generation.
 * Generates CNL specifications and story refinements.
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to import AchillesAgentLib
let LLMAgent = null;
let agentAvailable = false;

try {
  const achillesPath = path.resolve(__dirname, '../../../AchillesAgentLib/index.mjs');
  const achilles = await import(achillesPath);
  LLMAgent = achilles.LLMAgent;
  agentAvailable = true;
  console.log('[LLM Generator] AchillesAgentLib loaded successfully');
} catch (err) {
  console.log('[LLM Generator] AchillesAgentLib not available:', err.message);
  console.log('[LLM Generator] LLM generation features will be disabled');
}

// ============================================
// PROMPT TEMPLATES
// ============================================

const PROMPTS = {
  generateStory: (options) => `You are a story specification generator for SCRIPTA, a visual story composer.
Generate a story specification in CNL (Controlled Natural Language) format based on these parameters:

Genre: ${options.genre}
Length: ${options.length} (short=3-5 scenes, medium=8-12 scenes, long=15-20 scenes)
Number of characters: ${options.characters} (few=2-3, medium=4-6, many=7-10)
Tone: ${options.tone}
Complexity: ${options.complexity}
World rules: ${options.worldRules}
Story name: ${options.storyName || 'Untitled Story'}

Generate a complete story specification with:
1. Characters with archetypes (hero, mentor, shadow, ally, trickster) and traits
2. Locations with geography and atmosphere
3. Plot elements (objects, secrets, events) that drive the story
4. Relationships between characters
5. Chapter and scene structure
6. Key dialogues and their purposes

Output format - respond with valid JSON:
{
  "project": {
    "name": "Story Title",
    "libraries": {
      "characters": [{"id": "char_1", "name": "Name", "archetype": "hero", "traits": ["brave", "curious"]}],
      "locations": [{"id": "loc_1", "name": "Location", "geography": "forest", "characteristics": ["mysterious"]}],
      "objects": [{"id": "obj_1", "name": "Plot Element", "objectType": "artifact", "significance": "central"}],
      "relationships": [{"id": "rel_1", "fromId": "char_1", "toId": "char_2", "type": "mentor_student"}],
      "themes": [{"id": "theme_1", "name": "Redemption", "themeKey": "redemption"}],
      "moods": [{"id": "mood_1", "name": "Mysterious", "emotions": {"mystery": 3, "tension": 2}}],
      "worldRules": [{"id": "rule_1", "name": "Magic Rule", "category": "magic", "description": "Details"}],
      "dialogues": []
    },
    "structure": {
      "id": "book_1",
      "type": "book",
      "name": "Book",
      "title": "Story Title",
      "children": [
        {
          "id": "ch_1",
          "type": "chapter",
          "name": "Ch1",
          "title": "Chapter Title",
          "children": [
            {
              "id": "sc_1_1",
              "type": "scene",
              "name": "Sc1.1",
              "title": "Scene Title",
              "children": [
                {"id": "ref_1", "type": "character-ref", "name": "CharName", "refId": "char_1"},
                {"id": "ref_2", "type": "location-ref", "name": "LocName", "refId": "loc_1"}
              ]
            }
          ]
        }
      ]
    },
    "blueprint": {
      "arc": "heros_journey",
      "beatMappings": [],
      "tensionCurve": [],
      "subplots": []
    }
  }
}

Generate a coherent, engaging story that fits the genre and parameters.`,

  refineStory: (project, options) => `You are a story editor for SCRIPTA.
Review this story specification and suggest improvements:

Current story: ${project.name}
Genre: ${options.genre}

Current characters: ${JSON.stringify(project.libraries?.characters?.map(c => ({ name: c.name, archetype: c.archetype })))}
Current structure: ${project.structure?.children?.length || 0} chapters

Suggest improvements for:
1. Better scene titles that are evocative and genre-appropriate
2. Additional character traits that enhance their archetypes
3. Any missing plot elements that would strengthen the story

Output format - respond with valid JSON:
{
  "suggestions": {
    "sceneNames": { "scene_id": "New evocative title" },
    "characterTraits": { "char_id": ["additional_trait1", "additional_trait2"] },
    "plotElements": [{ "name": "New element", "type": "secret", "significance": "important" }]
  }
}`,

  generateNLFromCNL: (cnl, storyName, options) => `You are a skilled fiction writer. Transform this story specification (CNL format) into compelling narrative prose.

STORY TITLE: ${storyName}

STORY SPECIFICATION (CNL):
${cnl}

WRITING GUIDELINES:
- Style: ${options.style || 'narrative'} prose
- Tone: ${options.tone || 'literary'} 
- Length: ${options.length === 'short' ? '500-1000 words' : options.length === 'full' ? '2000-4000 words' : '1000-2000 words'}
- Write in third person past tense unless the CNL specifies otherwise
- Include vivid descriptions of locations and characters
- Show character emotions through actions and dialogue, not just telling
- Create smooth transitions between scenes
- Follow the chapter/scene structure from the CNL
- Incorporate the themes, moods, and world rules naturally
- Include dialogue that reveals character and advances plot
- If wisdom or philosophical elements are specified, weave them subtly into the narrative

OUTPUT FORMAT:
Write the story as continuous prose. Use "Chapter X: Title" headers for chapters.
Begin directly with the story - no meta-commentary or explanations.
Do not include any JSON, markdown code blocks, or formatting markers.
Just write the story.`
};

// ============================================
// LLM GENERATION FUNCTIONS
// ============================================

/**
 * Generate a story specification using LLM
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated project data
 */
export async function generateStoryWithLLM(options) {
  if (!agentAvailable) {
    throw new Error('LLM agent not available. Check AchillesAgentLib installation and API keys.');
  }
  
  const agent = new LLMAgent({
    name: 'ScriptaStoryGenerator',
    systemPrompt: 'You are a creative story specification generator. Always respond with valid JSON.'
  });
  
  const prompt = PROMPTS.generateStory(options);
  
  const response = await agent.complete({
    prompt,
    mode: 'deep',  // Use deeper reasoning for creative tasks
    maxTokens: 4000
  });
  
  // Parse the response
  const content = response.content || response.text || response;
  return parseJSONResponse(content);
}

/**
 * Refine an existing story with LLM suggestions
 * @param {Object} project - Current project data
 * @param {Object} options - Original generation options
 * @returns {Promise<Object>} Suggestions for improvement
 */
export async function refineStoryWithLLM(project, options) {
  if (!agentAvailable) {
    throw new Error('LLM agent not available');
  }
  
  const agent = new LLMAgent({
    name: 'ScriptaStoryRefiner',
    systemPrompt: 'You are a story editor. Suggest improvements. Always respond with valid JSON.'
  });
  
  const prompt = PROMPTS.refineStory(project, options);
  
  const response = await agent.complete({
    prompt,
    mode: 'fast',  // Quick refinement suggestions
    maxTokens: 2000
  });
  
  const content = response.content || response.text || response;
  return parseJSONResponse(content);
}

/**
 * Generate Natural Language prose story from CNL specification
 * @param {string} cnl - The CNL specification
 * @param {string} storyName - Story title
 * @param {Object} options - Generation options (style, tone, length)
 * @returns {Promise<Object>} Object containing the generated story text
 */
export async function generateNLFromCNL(cnl, storyName, options = {}) {
  if (!agentAvailable) {
    throw new Error('LLM agent not available. Configure AchillesAgentLib with a valid API key to generate narrative prose from CNL specifications.');
  }
  
  const agent = new LLMAgent({
    name: 'ScriptaStoryWriter',
    systemPrompt: 'You are a skilled fiction writer. Write compelling narrative prose based on story specifications. Output only the story text, no JSON or metadata.'
  });
  
  const prompt = PROMPTS.generateNLFromCNL(cnl, storyName, options);
  
  const response = await agent.complete({
    prompt,
    mode: 'deep',  // Use deeper reasoning for creative writing
    maxTokens: 8000  // Allow for longer stories
  });
  
  const content = response.content || response.text || response;
  
  // For NL generation, we expect plain text, not JSON
  return { story: content.trim() };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Parse JSON from LLM response (handles markdown code blocks)
 */
function parseJSONResponse(content) {
  if (typeof content !== 'string') {
    return content;
  }
  
  // Try to extract JSON from markdown code block
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    content = jsonMatch[1].trim();
  }
  
  // Try to find JSON object in response
  const jsonStart = content.indexOf('{');
  const jsonEnd = content.lastIndexOf('}');
  
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    content = content.substring(jsonStart, jsonEnd + 1);
  }
  
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse LLM response as JSON:', err.message);
    throw new Error('Invalid JSON response from LLM');
  }
}

/**
 * Check if LLM is available
 */
export function isLLMAvailable() {
  return agentAvailable;
}

export default {
  generateStoryWithLLM,
  refineStoryWithLLM,
  generateNLFromCNL,
  isLLMAvailable
};
