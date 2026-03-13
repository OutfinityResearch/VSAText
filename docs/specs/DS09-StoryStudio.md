# DS09 — Story Studio Interface

## Overview

Story Studio is SCRIPTA's visual interface for composing stories and evaluating quality. This document describes the high-level UI concepts and user workflows. For detailed implementation specifications, see DS10 (Visual Story Composer).

## Design Philosophy

**Visual-First Authoring**: Authors work with visual elements (trees, cards, graphs) rather than writing code. The system generates CNL automatically from the visual structure.

**Guided Feedback**: Authors move through planning, generation, and explicit evaluation steps. Metrics are surfaced through the evaluation workflow rather than assumed to update continuously in every editing context.

**Browser-First**: All processing happens client-side. The server only handles persistence.

## Main Layout

```
┌────────────────────────────────────────────────────────────────────┐
│  Header: Project Name                           [New] [Save]        │
├──────────────┬────────────────────────────────┬─────────────────────┤
│              │                                │                     │
│   Structure  │         Main Canvas            │    Metrics Panel    │
│   Tree       │                                │                     │
│              │   (Tabbed entity editors)      │    (Quality scores) │
│ [Hierarchy]  │                                │                     │
│              │                                │                     │
├──────────────┴────────────────────────────────┴─────────────────────┤
│  Footer: Stats                                         Version      │
└─────────────────────────────────────────────────────────────────────┘
```

## Core Workflows

### 1. Start New Story

**From scratch:**
1. Click "New" to open the project wizard
2. Enter title, format, length, and seed ideas
3. Continue in Book Settings to shape the story foundation
4. Refine thematic direction and transformation in Story Core
5. Define conflict and macro structure in Narrative Design
6. Build the main arc in Blueprint
7. Organize chapters and scenes in Story Map
8. Review and refine the CNL in CNL Editor
9. Generate prose in NL Story
10. Continue drafting in Manuscript

**From random generation:**
1. Click "Random" to generate complete story
2. Review generated elements
3. Refine Story Core, Narrative Design, cast, and world details
4. Adjust Blueprint and Story Map
5. Generate, evaluate, and refine

### 2. Book Settings Foundation

Book Settings is the editorial planning layer. It includes:

- **Story Core**: story fundamentals, themes, wisdom, and character transformation
- **Narrative Design**: core conflict, macro structure, escalation logic, and constraints
- **Cast**: protagonist, antagonist, secondary characters, relationship type, and relationship dynamic
- **World**: locations, objects, world rules, world layers, and direct template shortcuts from Library
- **Tone & Style**: language direction for generation

### 3. Build Story Structure

Authors work with a hierarchy that moves from macro structure to editable manuscript:

```
Book
├── Chapter 1
│   ├── Scene 1
│   │   ├── [character references]
│   │   ├── [location references]
│   │   ├── [mood references]
│   │   ├── [narrative blocks]
│   │   └── [actions]
│   └── Scene 2
└── Chapter 2
```

Right-click context menu provides actions appropriate to each node type.

### 4. Manage Entities

Core planning pages expose focused entity editing surfaces:
- Grid of entity cards
- "+" card to add new entities
- Click card to edit
- Delete option in edit modal

Primary entity areas:
- **Cast**: protagonist, antagonist, secondary characters, archetypes, traits, and relationship dynamics
- **World**: locations, objects, world rules, and world layers
- **Themes and wisdom**: selected and refined through Story Core and related planning pages
- **Structural elements**: chapters, scenes, beats, and turning points through Blueprint and Story Map

### 5. Define Relationships

Relationships are defined inside the **Cast** page, where authors can:
- assign relationship pairs
- select a **Relationship Type**
- select a **Relationship Dynamic**
- refine how relationships appear in the story foundation

Relationships can include both a **Relationship Type** and a **Relationship Dynamic** for more dramatic specificity.

### 6. Plan Blueprint and Story Map

**Arc Selection**: Choose the narrative arc template in Blueprint.

**Beat Assignment**: Define beat progression, key event, tension, and pacing in Blueprint.

**Story Map**: Map chapters, scenes, turning points, and structural roles across the book.

### 7. Add World Rules

Define special rules that govern the story world:
- Magic systems
- Physical laws
- Social structures
- Technology constraints

These become part of the generated CNL and influence content generation.

### 8. Evaluate Quality

Evaluation focuses on the primary product metrics and supporting diagnostics:

| Category | Metrics |
|----------|---------|
| Summary | Coverage, Coherence, NQS |
| Detailed | CAD, CAR, CSA, Emotional Arc, relationship and structure diagnostics |
| Structure | Counts of chapters, scenes, blocks, actions, refs |

Green = passes threshold, Yellow = warning, Red = fails

### 9. Export

**Export CNL**: Download the auto-generated CNL as a `.cnl` file for use with other tools or for archival.

## Library Apply Workflow

Library is no longer only a preview surface. Authors can:

1. Open Library
2. Browse a reusable item
3. Click **Apply**
4. Choose a valid destination such as **Book**, **Chapter**, or **Scene** depending on category
5. Continue refinement in the destination page

Examples:
- Narrative Arc Templates support macro planning
- Character Templates accelerate Cast setup
- Locations and Objects can be applied into World, chapters, or scenes when available

## Entity Libraries

| Library | Scope | Purpose |
|---------|-------|---------|
| Characters | Project | Named characters with archetypes and traits |
| Locations | Project | Places with geography and atmosphere |
| Objects | Project | Significant items with types and ownership |
| Themes | Project | Abstract narrative themes |
| Relationships | Project | Connections between characters |
| World Rules | Project | Special rules governing the story world |
| Emotional Arc | Project | Mood assignments for arc beats |

## Vocabulary Resources

The UI draws from rich vocabularies (see `src/vocabularies/`):

- **Character Archetypes**: Hero, Mentor, Shadow, Ally, Trickster, Herald, etc.
- **Character Traits**: Organized by category (core, social, intellectual, emotional)
- **Relationship Types**: Organized by category (familial, social, romantic, antagonistic, power)
- **Location Geography**: Forest, mountain, ocean, desert, urban, village, etc.
- **Location Time Periods**: Ancient, medieval, renaissance, industrial, modern, future
- **Emotions**: Positive, negative, mixed with color coding
- **Mood Presets**: Tense, Romantic, Triumphant, Melancholic, Peaceful, etc.
- **Narrative Arcs**: Hero's Journey, Three Act, Save the Cat, Story Circle, etc.
- **Narrative Blocks**: Organized by phase (opening, transition, confrontation, resolution, micro)
- **Themes**: Redemption, Sacrifice, Identity, Power, Freedom, etc.

## Data Flow

```
User Action → State Update → CNL Generation → Metric Calculation → UI Refresh
     │
     └──────────→ [Save] ──→ Server (/v1/projects)
```

All computation is client-side. Server is only for persistence.

## Success Criteria

1. New user can create a complete story structure in under 30 minutes
2. Random generation produces coherent starting point
3. Metrics provide actionable feedback through evaluation
4. CNL export works correctly
5. UI is responsive and intuitive
