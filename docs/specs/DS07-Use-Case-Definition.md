# DS07 — Use Cases and Workflows

## The Problem

Current AI writing tools often reduce story creation to one-shot prompting. Authors lack reusable narrative building blocks, guided planning, structured specification layers, and quality feedback that supports iteration.

SCRIPTA addresses this by combining project setup, story planning, formal specification, prose generation, manuscript editing, and metric-guided refinement in one workflow.

## Actors

**Author** - The human creative director who creates projects, defines story elements, generates drafts, and iterates on the result.

**System Agents** - AI and system components that organize planning data, generate and validate CNL, generate prose, evaluate quality, and verify constraints.

## Primary Workflow

SCRIPTA supports a recommended full planning workflow and a shortcut workflow for rapid draft creation.

### Recommended Workflow

`New Project -> Book Settings -> Story Core -> Narrative Design -> Blueprint -> Story Map -> CNL Editor -> NL Story -> Manuscript -> Metrics`

### Shortcut Workflow

`New Project -> Story Core -> Create Story -> NL Story`

### Workflow Description

**New Project**  
The author creates a new project with title, format, length, and seed ideas. The system initializes the project foundation.

**Book Settings**  
The author defines the narrative foundation of the book:
- `Story Core` for fundamentals, wisdom, and character transformation
- `Narrative Design` for conflict, macro structure, escalation, and constraints
- `Cast` for protagonist, antagonist, secondary characters, and relationship dynamics
- `World` for locations, objects, rules, and setting logic
- `Tone & Style` for prose direction

**Blueprint**  
The author defines arc logic, beats, pacing, and tension.

**Story Map**  
The author maps chapters and scenes and turns structure into navigable story flow.

**CNL Editor**  
The system exposes the formal Controlled Natural Language specification. The author can review, edit, validate, import, or export it.

**NL Story**  
The author generates prose from the project foundation and current specification. The same page supports first draft generation, improvement, regeneration, and stop controls.

**Manuscript**  
The author refines the generated draft at chapter and scene level and continues editorial development.

**Metrics**  
The author evaluates the result using Coverage, Coherence, NQS, and supporting diagnostics, then iterates when needed.

## Major Use Cases

### Use Case 1: Story Planning

**Goal**  
Build a coherent story foundation before prose generation.

**Primary Actor**  
Author

**Main Flow**
1. The author creates a project in `New Project`.
2. The author defines cast, world, and tone in `Book Settings`.
3. The author refines theme, wisdom, and transformation in `Story Core`.
4. The author defines conflict and macro structure in `Narrative Design`.
5. The author plans arcs, beats, pacing, and tension in `Blueprint`.
6. The author maps chapters and scenes in `Story Map`.
7. The system prepares the formal CNL specification.

**Outcome**  
The project contains a structured narrative foundation ready for formal review and generation.

### Use Case 2: Story Generation

**Goal**  
Generate a prose draft from the current story foundation and specification.

**Primary Actor**  
Author

**Main Flow**
1. The author opens `NL Story` or uses `Create Story` from `Story Core`.
2. The author chooses a generation strategy.
3. The system reads the current project foundation and CNL specification.
4. The system generates a prose draft.
5. The author reviews the result.
6. The author may improve, regenerate, or continue editing.

**Supported Strategies**
- `Random` - instant generation for exploration
- `LLM` - slower but richer draft generation
- `Advanced` - optimized generation for stronger quality

**Outcome**  
The project contains a draft aligned with the current narrative plan.

### Use Case 3: Story Refinement and Evaluation

**Goal**  
Improve the story through formal review, editing, metrics, and iteration.

**Primary Actor**  
Author

**Main Flow**
1. The author reviews or adjusts the specification in `CNL Editor`.
2. The author edits content in `Manuscript`.
3. The author runs evaluation.
4. The system reports Coverage, Coherence, NQS, and supporting diagnostics.
5. The author identifies weak areas.
6. The author returns to planning pages, CNL Editor, or Manuscript.
7. The author regenerates or revises as needed.
8. The author exports final assets.

**Outcome**  
The story becomes more coherent, complete, and production-ready.

## Alternative Workflows

**Quick Start**  
Create a project, use `Create Story`, and generate a draft without completing every planning step.

**Library-First Apply**  
Open Library, choose a reusable item, click `Apply`, select `Book`, `Chapter`, or `Scene` when supported, then continue editing in the destination page.

**Reverse Engineering**  
Start from existing text, extract usable story elements, then continue planning and refinement inside SCRIPTA.

**Comparison Mode**  
Generate or compare multiple variants and choose the preferred direction.

## Element Libraries

### Character Archetypes

| Archetype | Description |
|-----------|-------------|
| Hero | Protagonist who grows through challenges |
| Mentor | Guide providing wisdom |
| Shadow | Antagonist or dark reflection |
| Trickster | Agent of chaos and humor |
| Herald | Brings the call to adventure |

### Story Patterns

| Pattern | Structure |
|---------|-----------|
| Three-Act | Setup -> Confrontation -> Resolution |
| Hero's Journey | 12-17 stage monomyth |
| Five-Act | Shakespearean structure |
| Save the Cat | Blake Snyder's 15 beats |

### Location Types

| Type | Use |
|------|-----|
| Safe Haven | Character origin, return |
| Dangerous Terrain | Trials, growth |
| Threshold | Decision points |
| Innermost Cave | Climax, revelation |

## Metrics

| Metric | Target |
|--------|--------|
| Coverage | > 0.8 |
| NQS (quality) | > 0.7 |
| Coherence | > 0.8 |
| CAD (character drift) | < 0.15 |
| Readability | Grade 8-12 |
| Originality | > 0.6 |

## Export Formats

Plain Text, Markdown, Fountain (screenplay), JSON.
