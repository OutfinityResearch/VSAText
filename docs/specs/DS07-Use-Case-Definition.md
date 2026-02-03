# DS07 — Use Cases and Workflows

## The Problem

Current AI writing tools treat story creation as one-shot prompting. Authors lack reusable building blocks, visual composition tools, structured planning, and quality metrics. SCRIPTA addresses this for short stories, novels, and screenplays.

## Actors

**Author** - The human creative director who composes stories, defines elements, and iterates on specifications.

**System Agents** - AI components that plan structure, generate content, evaluate quality, and verify constraints.

## Primary Workflow

```
Create Project → Compose Elements → Generate Content → Evaluate Quality
                                          ↑                    ↓
                                          └────── Iterate ─────┘
```

### Step 1: Create Project

Author creates a new project with title, format (novel/screenplay/short story), and synopsis. System assigns a unique ID.

### Step 2: Compose Elements

Author assembles building blocks from libraries:
- **Characters** - archetypes or custom with traits and goals
- **Locations** - settings with atmosphere
- **Patterns** - story structures (three-act, hero's journey)
- **Themes and Tone** - narrative direction

System auto-generates CNL from these elements.

### Step 3: Generate Content

Planning agent creates scene breakdown and character arcs. Author reviews, adjusts, then triggers content generation. Can regenerate specific scenes with different parameters.

### Step 4: Evaluate Quality

Author selects metrics (NQS, coherence, CAD, readability). System computes scores and highlights issues. Author iterates based on feedback.

## Alternative Workflows

**Quick Start** - Use pre-made project templates, customize, generate immediately.

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
