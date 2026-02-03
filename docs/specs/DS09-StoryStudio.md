# DS09 — Story Studio Interface

## Overview

Story Studio is SCRIPTA's visual interface for composing stories, generating content, and evaluating quality. This document describes the UI layout and interactions.

## Main Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Header: Project Name                           [New] [Save]        │
├──────────────┬────────────────────────────────┬─────────────────────┤
│              │                                │                     │
│   Element    │         Main Canvas            │    Context Panel    │
│   Palette    │                                │                     │
│              │   (Composition / Plan /        │    (Details /       │
│ [Characters] │    Content / Compare)          │     Metrics)        │
│ [Locations]  │                                │                     │
│ [Patterns]   │                                │                     │
│              │                                │                     │
├──────────────┴────────────────────────────────┴─────────────────────┤
│  [Generate Plan]  [Generate Content]     [Evaluate]  [Compare]      │
└─────────────────────────────────────────────────────────────────────┘
```

## View Modes

| Mode | Purpose |
|------|---------|
| Compose | Build story elements visually |
| Plan | Review scene breakdown and arcs |
| Generate | View and edit generated content |
| Evaluate | See quality metrics and issues |
| Compare | Side-by-side version comparison |

## Element Palette

Left sidebar with reusable building blocks. Click to view details, drag to add to project.

**Characters** - Hero, Mentor, Shadow, Trickster archetypes. Create custom characters.

**Locations** - Coastal Village, Dark Forest, etc. Each has atmosphere setting.

**Patterns** - Three-Act, Hero's Journey, Five-Act, Save the Cat structures.

**Themes/Moods** - Abstract elements like courage, family, mystery.

## Main Canvas

### Composition View

Shows characters as connected nodes, locations, themes, and selected pattern:

```
    ┌─────────┐         ┌─────────┐
    │  Anna   │─sibling─│ Marcus  │
    │  Hero   │         │ Victim  │
    └────┬────┘         └────┬────┘
         └───────┬───────────┘
                 ▼
         ┌─────────────┐
         │   Village   │
         └─────────────┘

  Themes: [courage] [family]   Tone: [hopeful]
```

### Plan View

Scene-by-scene breakdown with characters and locations per scene:

```
ACT 1: SETUP                                    25%
├─ [1] Introduction - Anna at Village
├─ [2] Inciting Incident - Marcus disappears
└─ [3] Call to Action - Anna decides to search

ACT 2: CONFRONTATION                            50%
├─ [4] ...
```

### Content View

Generated text with regenerate option and trait verification:

```
Scene 1: Introduction                [Regenerate]

The salt-laden wind whipped through Anna's dark hair...

[Word count: 247]  [Traits: courageous ✓]
```

## Context Panel

Right sidebar showing details for selected element:

**Character selected** - Archetype, traits, goals, relationships, backstory

**Scene selected** - Characters involved, location, mood, summary

**Metrics selected** - Quality scores with bar graphs

## Generation Panel

Bottom bar with actions:
- **Generate Plan** - Create scene structure from elements
- **Generate Content** - Produce narrative text
- **Settings** - Creativity level, word count targets

## Evaluation Panel

- Select metrics to compute (NQS, Coherence, CAD)
- View scores with pass/fail indicators
- Highlight specific issues in content
- Compare versions

## Data Flow

```
UI Interaction → Project State Update → CNL Regeneration → Parser Validation → Metric Recalculation
```

All processing happens in browser. Server only handles save/load.
