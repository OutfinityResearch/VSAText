# DS10 — Visual Story Composer

## Core Concept

The Visual Story Composer lets authors build narrative specifications through a tree editor instead of writing code. The system auto-generates CNL (Controlled Natural Language) from the visual structure.

```
Visual Tree Editor → Auto-generated CNL → Parser → Metrics
```

Authors never write CNL directly. They compose visually, and CNL serves as an intermediate representation.

## Interface Layout

```
┌───────────────────────────────────────────────────────────────┐
│  SCRIPTA    [Project Name]  [Arc: ▼]   [Random] [New] [Export] [Evaluate] │
├───────────────┬─────────────────────────────┬──────────────────┤
│               │                             │                  │
│  Structure    │    Center Panel             │   Metrics        │
│  Tree         │    (Tabbed Views)           │                  │
│               │                             │   NQS: 78%       │
│  📖 Book      │    CNL | Characters |       │   Coherence: 85% │
│   ├─ Ch 1     │    Relations | Locations |  │   CAD: 0.08      │
│   │  ├─ Sc 1  │    Objects | Moods | Arc |  │   ...            │
│   │  └─ Sc 2  │    Blocks | World | Themes  │                  │
│   └─ Ch 2     │                             │                  │
│               │                             │                  │
├───────────────┴─────────────────────────────┴──────────────────┤
│  Chars: 4  Locs: 3  Scenes: 8  Rules: 2           SCRIPTA v3.1 │
└─────────────────────────────────────────────────────────────────┘
```

## Header Actions

| Button | Function |
|--------|----------|
| **Random** | Generate complete random story with all elements |
| **New** | Create new empty project |
| **Export CNL** | Download generated CNL as .cnl file |
| **Evaluate** | Recalculate all quality metrics |
| **Arc Selector** | Choose narrative arc template (Hero's Journey, Three Act, etc.) |

## Structure Tree (Left Panel)

Hierarchical story structure with drag-and-drop reordering:

```
📖 "The Storm Within" [Book]
  ├── 📑 "Prologue" [Chapter]
  │     └── 🎬 "Village Morning" [Scene]
  │           ├── 👤 Anna [character-ref]
  │           ├── 📍 Village [location-ref]
  │           ├── 🗝️ SilverKey [object-ref]
  │           ├── 🎭 Mysterious [mood-ref]
  │           ├── ✨ "Hero's Call" [block-ref]
  │           └── ⚡ Anna discovers artifact [action]
  ├── 📑 "The Beginning" [Chapter]
        └── 🎬 "Discovery" [Scene]
```

**Node Types:**
- **Structural**: Book, Chapter, Scene
- **References**: Links to entities from libraries (character, location, object, mood, block)
- **Actions**: Subject-verb-target narrative events

**Context Menu Actions** (right-click):
- On Book/Chapter: Add Chapter, Add Scene
- On Scene: Add Character, Add Location, Add Object, Add Mood, Add Narrative Block, Add Action
- On any: Edit, Delete

## Center Panel Tabs

### CNL Tab
Auto-generated CNL code (read-only). Updates in real-time as structure changes.

```
// Auto-generated CNL
// The Storm Within
// Arc: heros_journey

// Characters
Anna is hero
Anna has trait courage
Anna has trait determination

// Relationships
Anna mentor_student Gandalf

// Structure
Book group begin
  Ch1 group begin
    Ch1 has title "The Beginning"
    Sc1.1 group begin
      Sc1.1 includes character Anna
      Sc1.1 includes location Village
      Anna discovers artifact
    Sc1.1 group end
  Ch1 group end
Book group end
```

### Characters Tab
Entity cards with:
- Name (editable)
- Archetype (Hero, Mentor, Shadow, Ally, Trickster, Herald, Shapeshifter, etc.)
- Traits (selectable chips organized by category: core, social, intellectual, emotional)

### Relations Tab
**Graph Visualization**: Characters displayed as nodes in a circle, with relationship edges between them. Node colors indicate archetype.

**Relationship List**: Cards showing From → Type → To with delete option.

Relationship types organized by category:
- **Familial**: parent_child, siblings, spouses, extended_family
- **Social**: friends, rivals, mentor_student, colleagues, acquaintances
- **Romantic**: lovers, unrequited, former_lovers
- **Antagonistic**: enemies, betrayer, nemesis
- **Power**: ruler_subject, master_servant, protector

### Locations Tab
Entity cards with:
- Name
- Geography type (forest, mountain, ocean, desert, urban, etc.)
- Time period (ancient, medieval, renaissance, industrial, modern, future)
- Characteristics (atmosphere, population, danger level, etc.)

### Objects Tab
Entity cards with:
- Name
- Object type (weapon, artifact, tool, document, clothing, vehicle, etc.)
- Significance (minor, important, central, macguffin)
- Owner (optional character reference)

### Moods Tab
**Mood Builder**: Visual emotion picker with intensity levels (1-3 dots).

Emotions organized by valence:
- **Positive**: joy, serenity, hope, love, excitement, triumph
- **Negative**: fear, anger, sadness, anxiety, despair, dread
- **Mixed**: melancholy, bittersweet, tension, mystery, nostalgia

**Mood Presets**: Quick-apply buttons for common moods (Tense, Romantic, Triumphant, Melancholic, Peaceful, Mysterious, Chaotic, Hopeful, Dark).

### Arc Tab (Emotional Arc)
**Global Emotional Journey**: Assign mood presets to narrative arc beats.

Displays selected arc's beats (e.g., for Hero's Journey):
- 0% - Ordinary World
- 10% - Call to Adventure
- 20% - Refusal of the Call
- ...
- 100% - Return with Elixir

Each beat has a mood selector dropdown. Visual bar shows emotional progression.

### Blocks Tab
**Narrative Blocks**: Reusable story patterns organized by phase.

Phases:
- **Opening**: hook, intro_setting, intro_protagonist, establish_normal
- **Transition**: inciting_incident, point_of_no_return, first_plot_point
- **Confrontation**: rising_action, midpoint_twist, dark_night, climax_approach
- **Resolution**: climax, falling_action, resolution, denouement
- **Micro**: flashback, dream_sequence, montage, parallel_action

Each block shows:
- Label and description
- Scope (scene/sequence/act)
- Suggested moods
- Related themes

Filter buttons allow viewing by phase.

### World Tab (World Rules)
Special rules that govern the story world:

| Category | Example |
|----------|---------|
| Physics | "No direct sunlight - eternal twilight" |
| Magic | "Magic requires sacrifice" |
| Society | "Caste system determines everything" |
| Technology | "Steam-powered everything" |
| Biology | "Dragons are extinct" |
| Time | "Time flows differently in the Shadowrealm" |
| Geography | "The ocean is poisonous" |

Each rule has:
- Name
- Category
- Description
- Scope (optional - where/when it applies)

### Themes Tab
Abstract narrative themes from vocabulary:
- Redemption, Sacrifice, Coming of Age, Good vs Evil
- Love and Loss, Power and Corruption, Identity
- Freedom vs Security, Nature vs Civilization

Each theme has suggested narrative blocks.

## Metrics Panel (Right)

### Summary Metrics
Bar charts with pass/fail thresholds:

| Metric | Description | Target |
|--------|-------------|--------|
| NQS | Narrative Quality Score | ≥70% |
| Completeness | Required elements present | ≥80% |
| Coherence (CS) | Entity usage & structure | ≥75% |
| Emotional Arc (EAP) | Arc coverage & moods | ≥70% |

### Detailed Analysis
Per-metric scores with thresholds:

| Metric | Target | Description |
|--------|--------|-------------|
| Character Drift (CAD) | ≤0.15 | Trait consistency |
| Compliance (CAR) | ≥95% | Valid references |
| Originality (OI) | ≥50% | Variety of elements |
| Parse Success (CPSR) | ≥90% | Valid CNL syntax |
| Constraints (CSA) | ≥95% | Satisfied constraints |
| Retrieval (RQ) | ≥80% | Naming quality |
| Explainability | ≥3.5/5 | Documentation level |

### Structure Breakdown
- Chapters count
- Scenes count
- Blocks count
- Actions count
- Character refs
- Location refs

## Random Story Generation

The **Random** button generates a complete story with:

1. **4-6 Characters** with archetypes (hero, mentor, shadow, ally, trickster)
2. **Automatic Relationships** between hero and other characters
3. **4-5 Locations** with geography and time periods
4. **2-3 Objects** with types and significance
5. **3 Scene Moods** from presets
6. **Emotional Arc** with moods for each beat
7. **2 Themes** from vocabulary
8. **1-2 World Rules** (e.g., "Magic requires sacrifice")
9. **Complete Structure** with chapters, scenes, character/location refs, blocks, and actions

This provides a starting point for authors to modify and expand.

## CNL Generation Rules

The tree generates CNL automatically:

**Character with archetype and traits:**
```
Anna is hero
Anna has trait courage
Anna has trait determination
```

**Relationship between characters:**
```
Anna mentor_student Gandalf
```

**Scene with elements:**
```
Sc1 group begin
  Sc1 has title "The Beginning"
  Sc1 includes character Anna
  Sc1 includes location Village
  Sc1 has mood Mysterious
  Anna discovers artifact
Sc1 group end
```

**World rules:**
```
World has rule "Magic requires sacrifice"
"Magic requires sacrifice" has category magic
"Magic requires sacrifice" has description "All magic has a cost"
```

**Emotional arc beats:**
```
Story beat ordinary_world has mood Peaceful
Story beat call_to_adventure has mood Mysterious
```

## Data Flow

```
UI Interaction → Project State Update → CNL Regeneration → Metric Recalculation
```

All processing happens in browser. Server only handles project save/load.

## Persistence

Projects can be saved to server via `/v1/projects` API:
- GET /v1/projects - List all projects
- POST /v1/projects - Create new project
- GET /v1/projects/:id - Load project
- PUT /v1/projects/:id - Update project
- DELETE /v1/projects/:id - Delete project

Projects stored as JSON files in `/data/projects/`.
