# DS07 — Use Cases and Workflows

## The Problem

Current AI writing tools treat story creation as one-shot prompting. Authors lack reusable building blocks, visual composition tools, structured planning, and quality metrics. SCRIPTA addresses this for short stories, novels, and screenplays.

## Actors

**Author** - The human creative director who composes stories, defines elements, and iterates on specifications.

**System Agents** - AI components that plan structure, generate content, evaluate quality, and verify constraints.

## Primary Workflow

```
Create Project → Book Settings → Blueprint → Story Map → CNL Editor → NL Story → Manuscript
                                         ↑                                            ↓
                                         └──────────────── Iterate ────────────────────┘
```

### Step 1: Create Project

Author creates a new project in the wizard with title, format, length, and a few seed ideas. System assigns a unique ID and opens Book Settings.

### Step 2: Book Settings

Author shapes the narrative foundation before structural planning:
- **Story Core** - story fundamentals, primary themes, character transformation
- **Narrative Design** - core conflict, macro structure, conflict escalation, storytelling constraints
- **Cast** - reusable or custom characters
- **World** - locations, rules, and setting logic
- **Themes** - thematic templates and ideological framing
- **Tone & Style** - language and register preferences

### Step 3: Blueprint

Author defines the narrative arc, key event, primary conflict, pacing, and beat logic.

### Step 4: Story Map

Author maps chapters and scenes, assigns structural roles, and prepares the project for formal specification.

### Step 5: CNL Editor

System consolidates visual planning into editable CNL. Author reviews and adjusts the specification directly when needed.

### Step 6: NL Story

Author triggers prose generation from the current CNL. The same screen supports first draft generation, improvement, regeneration, and stop controls.

### Step 7: Manuscript

Author edits chapters and scenes in manuscript form, expands structure manually, and iterates with generation and evaluation feedback.

## Alternative Workflows

**Quick Start** - Create a project, skip ahead with Create Story, and generate a draft without completing every planning step.

**Reverse Engineering** - Paste existing text, system extracts characters/settings/themes, author refines and continues.

**Comparison Mode** - Generate with different approaches, view side-by-side, pick winner.

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
| Three-Act | Setup → Confrontation → Resolution |
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
| NQS (quality) | > 0.7 |
| Coherence | > 0.8 |
| CAD (character drift) | < 0.15 |
| Readability | Grade 8-12 |
| Originality | > 0.6 |

## Export Formats

Plain Text, Markdown, Fountain (screenplay), JSON.
