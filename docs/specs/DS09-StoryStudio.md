# DS09 — Story Studio Interface

## Overview

Story Studio is SCRIPTA's visual interface for composing stories and evaluating quality. This document describes the high-level UI concepts and user workflows. For detailed implementation specifications, see DS10 (Visual Story Composer).

## Design Philosophy

**Visual-First Authoring**: Authors work with visual elements (trees, cards, graphs) rather than writing code. The system generates CNL automatically from the visual structure.

**Real-Time Feedback**: Metrics update as authors make changes. No need to run separate evaluation steps.

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
1. Click "New" to create empty project
2. Add characters in Characters tab
3. Add locations in Locations tab
4. Create structure: Book → Chapters → Scenes
5. Assign characters/locations to scenes
6. Add narrative blocks and actions
7. Review metrics and iterate

**From random generation:**
1. Click "Random" to generate complete story
2. Review generated elements
3. Modify characters, locations, relationships as needed
4. Adjust structure and scenes
5. Evaluate and refine

### 2. Build Story Structure

Authors work with a tree hierarchy:

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

### 3. Manage Entities

Each entity type has its own tab with:
- Grid of entity cards
- "+" card to add new entities
- Click card to edit
- Delete option in edit modal

Entity types:
- **Characters**: Name, archetype, traits
- **Locations**: Name, geography, time period, characteristics
- **Objects**: Name, type, significance, owner
- **Moods**: Name, emotion mix with intensities
- **Themes**: Selected from vocabulary

### 4. Define Relationships

The Relations tab provides:
- Visual graph showing character connections
- List of defined relationships
- Add/delete relationship controls

Relationship types cover familial, social, romantic, antagonistic, and power dynamics.

### 5. Configure Emotional Journey

**Arc Selection**: Choose narrative arc template (Hero's Journey, Three Act, Save the Cat, etc.)

**Beat Assignment**: Assign mood presets to each arc beat to define the emotional progression.

### 6. Add World Rules

Define special rules that govern the story world:
- Magic systems
- Physical laws
- Social structures
- Technology constraints

These become part of the generated CNL and influence content generation.

### 7. Evaluate Quality

Metrics panel shows real-time scores:

| Category | Metrics |
|----------|---------|
| Summary | NQS, Completeness, Coherence, Emotional Arc |
| Detailed | CAD, CAR, OI, CPSR, CSA, RQ, Explainability |
| Structure | Counts of chapters, scenes, blocks, actions, refs |

Green = passes threshold, Yellow = warning, Red = fails

### 8. Export

**Export CNL**: Download the auto-generated CNL as a `.cnl` file for use with other tools or for archival.

## Entity Libraries

| Library | Scope | Purpose |
|---------|-------|---------|
| Characters | Project | Named characters with archetypes and traits |
| Locations | Project | Places with geography and atmosphere |
| Objects | Project | Significant items with types and ownership |
| Moods | Project | Emotional registers for scenes |
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
3. Metrics provide actionable feedback
4. CNL export works correctly
5. UI is responsive and intuitive
