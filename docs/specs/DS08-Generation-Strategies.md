# DS08 — Generation Strategies

## Overview

SCRIPTA provides three distinct story generation strategies, each optimized for different use cases. Authors can choose their preferred approach based on speed requirements, quality expectations, and available resources.

## Strategy Comparison

| Strategy | Speed | Quality | API Required | Best For |
|----------|-------|---------|--------------|----------|
| **Random** | Instant (~100ms) | Good | No | Quick prototyping, exploring options |
| **With LLM** | Slow (~10-30s) | High | Yes | Creative, nuanced stories |
| **Advanced** | Medium (~5-15s) | Optimized | Optional | Best metric scores, coherent specifications |

## 1. Random Generation Strategy

### Description
Fast, deterministic generation using predefined vocabularies and randomized templates. Produces complete story specifications instantly without external dependencies.

### Algorithm

```
1. Select genre configuration (archetypes, locations, plot elements)
2. Generate characters:
   - Pick random names from vocabulary
   - Assign archetypes based on genre (hero first, then supporting)
   - Add 2-4 traits per character
3. Generate relationships:
   - Create automatic relationships between hero and others
   - Map archetype pairs to relationship types
4. Generate locations:
   - Select genre-appropriate geography types
   - Add characteristics and time period
5. Generate plot elements:
   - Use genre-specific element types (e.g., "evidence" for mystery)
   - Assign significance levels
6. Build structure:
   - Create chapters based on length parameter
   - Populate scenes with character/location references
   - Add narrative actions
7. Apply narrative arc:
   - Map beats to scenes based on position
   - Generate placeholder dialogues for key beats
8. Calculate tension curve
9. Save snapshot for change tracking
```

### Inputs

| Parameter | Values | Effect |
|-----------|--------|--------|
| Genre | fantasy, scifi, mystery, romance, horror, adventure, drama, comedy | Determines vocabularies and archetypes used |
| Length | short (3-5), medium (8-12), long (15-20) | Number of scenes generated |
| Characters | few (2-3), medium (4-6), many (7-10) | Character count |
| Tone | dark, balanced, light, comedic | Mood selection |
| Complexity | simple, moderate, complex | Scenes per chapter, subplot density |
| World Rules | none, few, many | Special rules count |

### Output Quality
- **Completeness**: 90-100% (all required elements present)
- **Coherence**: 70-85% (references valid, but not semantically optimized)
- **Originality**: 50-70% (random selection provides variety)
- **NQS**: Typically 65-80%

### Use Cases
- Quick prototyping and exploration
- Understanding story structure options
- Starting point for manual refinement
- Offline operation without API dependencies

## 2. LLM Generation Strategy

### Description
Uses a Large Language Model (via AchillesAgentLib) to generate creative, contextually appropriate story specifications. Produces more nuanced and coherent narratives.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌─────────────┐     ┌─────────────┐     ┌──────────────┐  │
│  │ UI Options  │ ──▶ │ Generation  │ ──▶ │ State Update │  │
│  └─────────────┘     │   Request   │     └──────────────┘  │
│                      └──────┬──────┘            ▲           │
│                             │                   │           │
└─────────────────────────────│───────────────────│───────────┘
                              │ POST /v1/generate/llm
                              ▼                   │
┌─────────────────────────────────────────────────│───────────┐
│                        Server                   │           │
│  ┌─────────────┐     ┌─────────────┐     ┌─────┴────────┐  │
│  │  Endpoint   │ ──▶ │ LLM Service │ ──▶ │ JSON Response│  │
│  └─────────────┘     └──────┬──────┘     └──────────────┘  │
│                             │                               │
└─────────────────────────────│───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     AchillesAgentLib                         │
│  ┌─────────────┐     ┌─────────────┐     ┌──────────────┐  │
│  │ LLM Agent   │ ──▶ │ API Call    │ ──▶ │ Parse Result │  │
│  │ (Scripta    │     │ (OpenAI/    │     │ (JSON)       │  │
│  │  Generator) │     │  Anthropic) │     │              │  │
│  └─────────────┘     └─────────────┘     └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Prompt Engineering

The LLM receives a structured prompt containing:

1. **Role definition**: "You are a story specification generator for SCRIPTA"
2. **Parameters**: All user-selected options
3. **Output schema**: Detailed JSON structure expected
4. **Quality requirements**: Coherence, genre-appropriateness, completeness

### Sample Prompt Structure

```
Genre: {genre}
Length: {length} (short=3-5 scenes, medium=8-12 scenes, long=15-20 scenes)
Number of characters: {characters}
Tone: {tone}
Complexity: {complexity}
World rules: {worldRules}
Story name: {storyName}

Generate a complete story specification with:
1. Characters with archetypes and traits
2. Locations with geography and atmosphere
3. Plot elements that drive the story
4. Relationships between characters
5. Chapter and scene structure
6. Key dialogues and their purposes

Output format: Valid JSON with project structure...
```

### Fallback Mode

When LLM is unavailable (no API key, network issues):
- System automatically falls back to enhanced random generation
- Uses more sophisticated templates than basic random
- Response includes `_fallback: true` flag

### Requirements
- **Environment Variables**: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- **AchillesAgentLib**: Available at `/home/salboaie/work/AchillesAgentLib/`

### Output Quality
- **Completeness**: 85-95% (LLM may miss some elements)
- **Coherence**: 85-95% (semantic relationships considered)
- **Originality**: 75-90% (creative naming and relationships)
- **NQS**: Typically 75-90%

## 3. Advanced Generation Strategy

### Description
Multi-pass generation with constraint solving and metric-driven optimization. Produces the highest quality specifications by iteratively improving until target metrics are achieved.

### Algorithm

```
1. INITIALIZATION
   - Set target NQS = 0.85
   - Set max iterations = 5
   - Initialize best result tracker

2. FOR each iteration (1 to MAX_ITERATIONS):
   a. Generate candidate using Random strategy
   b. Evaluate all metrics
   c. Calculate composite score:
      score = weighted_sum(NQS, Coherence, Completeness, EAP, 1-CAD, CAR, CSA)
   d. IF score > best_score:
      - Save current state as best result
   e. IF score >= TARGET_NQS:
      - Exit loop (target reached)
   f. Apply constraint optimizations:
      - Fix invalid references
      - Add missing elements
      - Balance emotional arc
      - Normalize character traits

3. RESTORE best result

4. OPTIONAL: LLM Refinement
   - Request naming improvements
   - Request trait enhancements
   - Apply non-destructive suggestions

5. FINALIZE
   - Save snapshot
   - Update UI
```

### Metric Weights

| Metric | Weight | Target | Description |
|--------|--------|--------|-------------|
| NQS | 0.25 | ≥85% | Narrative Quality Score |
| Coherence | 0.20 | ≥75% | Entity reference validity |
| Completeness | 0.15 | ≥80% | Required elements present |
| EAP | 0.10 | ≥70% | Emotional Arc Profile |
| CAD (inverted) | 0.10 | ≤15% | Character Attribute Drift |
| CAR | 0.10 | ≥95% | Compliance Adherence Rate |
| CSA | 0.10 | ≥95% | Constraint Satisfaction |

### Constraint Optimizations

#### Coherence Fixes
```javascript
// Ensure all scene references point to valid entities
for each scene in structure:
  for each reference in scene:
    if reference.refId not in valid_ids:
      remove reference
```

#### Completeness Fixes
```javascript
// Ensure minimum elements exist
if characters.length < 2: add random character
if locations.length < 1: add random location
if themes.length < 1: add random theme
```

#### Emotional Arc Fixes
```javascript
// Ensure mood coverage
if moods.length < 3:
  add moods: ['mysterious', 'tense', 'triumphant']
```

#### Character Drift Fixes
```javascript
// Normalize traits to reduce drift
for each character:
  if traits.length > 4:
    character.traits = traits.slice(0, 4)
```

### Output Quality
- **Completeness**: 95-100%
- **Coherence**: 90-98%
- **NQS**: Typically 80-95%
- **Metric Optimization**: Guaranteed to meet targets or best achievable

## API Endpoints

### POST /v1/generate/llm

Generate story using LLM.

**Request:**
```json
{
  "genre": "fantasy",
  "length": "medium",
  "characters": "medium",
  "tone": "balanced",
  "complexity": "moderate",
  "worldRules": "few",
  "storyName": "The Dragon's Quest"
}
```

**Response:**
```json
{
  "project": {
    "name": "The Dragon's Quest",
    "libraries": { ... },
    "structure": { ... },
    "blueprint": { ... }
  }
}
```

### POST /v1/generate/refine

Request LLM refinements for existing story.

**Request:**
```json
{
  "project": { ... },
  "options": { "genre": "fantasy" }
}
```

**Response:**
```json
{
  "suggestions": {
    "sceneNames": { "sc_1": "The Awakening" },
    "characterTraits": { "char_1": ["wise", "mysterious"] },
    "plotElements": [{ "name": "Ancient Prophecy", "type": "prophecy" }]
  }
}
```

### GET /v1/generate/status

Check generation capabilities.

**Response:**
```json
{
  "llmAvailable": true,
  "strategies": ["random", "llm", "advanced"]
}
```

## User Interface

### Strategy Selection

The Generate Story modal includes radio button selection:

```
┌─────────────────────────────────────────────┐
│ Generation Strategy                          │
├─────────────────────────────────────────────┤
│ ○ Random (Fast)                             │
│   Quick generation using randomized         │
│   templates and vocabularies. Instant.      │
│                                             │
│ ○ With LLM                                  │
│   AI generates CNL specification.           │
│   Requires API key. More creative.          │
│                                             │
│ ○ Advanced (Optimized)                      │
│   Multi-pass generation with constraint     │
│   solving and metric optimization. Best.    │
└─────────────────────────────────────────────┘
```

### Progress Indicator

For LLM and Advanced strategies, a progress indicator shows:
- Current operation (Generating, Parsing, Optimizing)
- Progress percentage
- Current iteration (for Advanced)
- Achieved score (for Advanced)

## Configuration

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for GPT models |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude models |
| `SCRIPTA_LLM_MODE` | Default: 'fast'. Options: 'fast', 'deep' |

### AchillesAgentLib Integration

```javascript
import { LLMAgent } from '/home/salboaie/work/AchillesAgentLib/index.mjs';

const agent = new LLMAgent({
  name: 'ScriptaStoryGenerator',
  systemPrompt: 'You are a creative story specification generator.'
});

const response = await agent.complete({
  prompt: generationPrompt,
  mode: 'deep',  // 'fast' for quick, 'deep' for quality
  maxTokens: 4000
});
```

## Best Practices

1. **Start with Random** for quick exploration
2. **Use Advanced** when metrics matter
3. **Use LLM** for creative, unique stories
4. **Combine strategies**: Generate with Random, refine with LLM
5. **Review metrics** after generation to understand quality

## Future Enhancements

1. **Hybrid Strategy**: Combine LLM creativity with Advanced optimization
2. **Fine-tuned Models**: Train specialized story generation models
3. **User Feedback Loop**: Learn from user edits to improve generation
4. **Template Learning**: Extract patterns from successful stories
5. **Constraint DSL**: User-defined constraints for generation
