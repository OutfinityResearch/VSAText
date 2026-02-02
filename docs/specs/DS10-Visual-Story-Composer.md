# DS10 — Visual Story Composer Specification

## 1. Overview

The Visual Story Composer is the primary interface for creating narrative specifications in SCRIPTA. Instead of manually writing CNL (Controlled Natural Language), users interact with a **visual tree editor** that automatically generates CNL code.

### 1.1 Core Paradigm

```
Visual Tree Editor → Auto-generated CNL → Validation/Interpretation → Metrics
```

The CNL functions as a **programming language** for narratives:
- **Source code**: The CNL specification
- **Compilation**: Parsing and AST generation  
- **Interpretation/Execution**: Metric calculation and validation
- **Output**: Quality scores, skeleton narratives, constraint violations

### 1.2 Design Philosophy

1. **Visual-First**: Authors never write CNL directly; they compose visually
2. **CNL as IR**: CNL serves as an Intermediate Representation (like assembly)
3. **Reusable Libraries**: Characters, Locations, Moods, Patterns, etc. are reusable assets
4. **Pattern Instantiation**: Story patterns have "free variables" bound at use time


## 2. Interface Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HEADER: Project Name | Save | Load | Export | Evaluate                     │
├─────────────────┬───────────────────────────────────┬───────────────────────┤
│                 │                                   │                       │
│  STRUCTURE      │  CENTER PANEL                     │  METRICS              │
│  TREE           │  ┌─────────────────────────────┐  │                       │
│                 │  │ Tabs: CNL | Characters |    │  │  Quality scores       │
│  - Book         │  │       Locations | Moods |   │  │  Validation results   │
│    - Chapter 1  │  │       Patterns | Props |    │  │  Constraint status    │
│      - Scene 1  │  │       Themes | Archetypes   │  │                       │
│      - Scene 2  │  └─────────────────────────────┘  │                       │
│    - Chapter 2  │                                   │                       │
│      ...        │  Tab content area                 │                       │
│                 │  (editors or generated CNL)       │                       │
│                 │                                   │                       │
├─────────────────┴───────────────────────────────────┴───────────────────────┤
│  FOOTER: Entity counts | Validation status | Version                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Left Panel: Structure Tree

The hierarchical story structure with drag-and-drop support:

```
📖 "The Storm Within" [Book]
  ├── 📑 "Prologue" [Chapter]
  │     └── 🎬 "Village Morning" [Scene]
  ├── 📑 "The Beginning" [Chapter]
  │     ├── 🎬 "Discovery" [Scene]
  │     │     ├── → Anna [character ref]
  │     │     ├── → Village [location ref]
  │     │     ├── ♪ Mysterious [mood ref]
  │     │     └── ⚡ "Hero's Call" [pattern instance]
  │     └── 🎬 "Departure" [Scene]
  └── 📑 "Into the Unknown" [Chapter]
```

**Tree Node Types:**
- **Structural**: Book, Part, Chapter, Scene, Beat
- **References**: Links to entities (characters, locations, moods)
- **Pattern Instances**: Instantiated patterns with bound variables

**Actions on nodes:**
- Add child (appropriate types)
- Add reference (select from library)
- Instantiate pattern (select pattern, bind variables)
- Edit properties
- Delete / Move / Copy

### 2.2 Center Panel: Tabbed Editors

#### Tab: CNL (Read-only)
Auto-generated CNL from the visual structure. Updates in real-time.

#### Tab: Characters
Visual editor for character entities:
- Name, Type (protagonist, antagonist, mentor, etc.)
- Traits (list)
- Description
- Relationships (to other characters)

#### Tab: Locations
Visual editor for location entities:
- Name
- Atmosphere (select from vocabulary)
- Description
- Connected locations

#### Tab: Moods
Affective/emotional registers for scenes:
- Name
- Primary emotions (list: joy, fear, tension, wonder, etc.)
- Intensity (low, medium, high)
- Color association (for visualization)

#### Tab: Patterns
Reusable story patterns with free variables:
- Name
- Description
- Variables (typed: character, location, mood, object, etc.)
- CNL template with variable placeholders

#### Tab: Props
Significant objects:
- Name
- Type (artifact, weapon, symbol, etc.)
- Significance
- Associated characters/locations

#### Tab: Themes
Abstract themes:
- Name
- Description
- Related motifs

#### Tab: Archetypes
Character archetypes (Jungian, etc.):
- Name (Hero, Mentor, Shadow, Trickster, etc.)
- Traits template
- Typical relationships

### 2.3 Right Panel: Metrics & Validation

Real-time quality metrics and validation results:
- **CPSR**: Parse Success Rate
- **CSA**: Constraint Satisfaction Accuracy
- **Coherence**: Entity consistency
- **Completeness**: Structure coverage
- **Constraint Status**: List of requires/forbids with status


## 3. Entity Libraries

### 3.1 Library Types

| Library | Description | Reusable Across |
|---------|-------------|-----------------|
| **Characters** | Named characters with traits | Projects |
| **Locations** | Places with atmosphere | Projects |
| **Moods** | Emotional registers | Projects, Templates |
| **Patterns** | Story patterns with variables | Universal |
| **Props** | Significant objects | Projects |
| **Themes** | Abstract themes | Projects |
| **Archetypes** | Character templates | Universal |
| **Conflicts** | Conflict types | Universal |
| **Motifs** | Recurring literary motifs | Universal |

### 3.2 Pattern Definition

Patterns are reusable story structures with **free variables**:

```
Pattern: "Hero's Call"
Description: The protagonist receives a call to adventure
Variables:
  - $hero: Character (type: protagonist)
  - $catalyst: Character | Event
  - $location: Location
  - $mood: Mood

CNL Template:
  $hero is at $location
  $hero has mood ordinary
  $catalyst arrives at $location
  $hero discovers "call to adventure"
  $hero has mood $mood
  $hero decides "answer the call"
```

**Instantiation in tree:**
```
⚡ "Hero's Call" [pattern]
   $hero → Anna
   $catalyst → "The Storm"
   $location → Village
   $mood → Mysterious
```

**Generated CNL:**
```
Anna is at Village
Anna has mood ordinary
"The Storm" arrives at Village
Anna discovers "call to adventure"
Anna has mood Mysterious
Anna decides "answer the call"
```

### 3.3 Mood (Affective Register) Definition

In literary theory, **mood** (also called atmosphere or affective register) is the emotional quality evoked in the reader.

```
Mood: "Mysterious"
  emotions: [curiosity, unease, wonder]
  intensity: medium
  color: #7b68ee (aurora purple)

Mood: "Dread"
  emotions: [fear, anticipation, helplessness]
  intensity: high
  color: #dc143c (crimson)

Mood: "Hopeful"
  emotions: [hope, determination, warmth]
  intensity: medium
  color: #7cb88a (sage green)
```


## 4. CNL Generation Rules

### 4.1 From Structure Tree

Each node generates CNL statements:

**Book/Chapter/Scene nodes:**
```
NodeName group begin
  NodeName has title "Display Title"
  NodeName has type scene
  // ... child statements ...
NodeName group end
```

**Entity references:**
```
ParentNode includes character CharacterName
ParentNode includes location LocationName
ParentNode has mood MoodName
```

**Pattern instances:**
Template with variables substituted, nested in parent group.

### 4.2 From Entity Editors

**Characters:**
```
Anna is protagonist
Anna has trait courage
Anna has trait "inner strength"
Anna describes "A young woman from the coast"
Anna relates to Marcus as sibling
```

**Locations:**
```
Village is location
Village has atmosphere peaceful
Village describes "Small fishing village on rocky coast"
```

**Moods:**
```
Mysterious is mood
Mysterious has emotion curiosity
Mysterious has emotion unease
Mysterious has intensity medium
```

### 4.3 Identifier Rules

- **Simple identifiers**: `Anna`, `Village`, `Chapter1`
- **Multi-word identifiers**: Use quotes: `"The Dark Forest"`, `"inner strength"`
- **Proper nouns**: Capitalized (Indo-European convention): `Anna`, `Marcus`
- **Types/keywords**: Lowercase: `protagonist`, `location`, `mood`


## 5. CNL as Programming Language

### 5.1 Language Semantics

| Concept | Programming Analog |
|---------|-------------------|
| CNL text | Source code |
| Entities | Class instances / Objects |
| Groups | Scopes / Namespaces |
| Statements | Instructions |
| Relationships | References / Pointers |
| Patterns | Functions / Macros |
| Constraints | Assertions / Contracts |

### 5.2 Interpretation (Metrics as Execution)

"Running" the CNL program means:
1. **Parsing**: Syntax validation → AST
2. **Semantic Analysis**: Entity resolution, reference checking
3. **Constraint Evaluation**: Check requires/forbids
4. **Metric Calculation**: Compute quality scores
5. **Output Generation**: Skeleton narrative, Markdown export

### 5.3 Error Types

| Type | Description | Example |
|------|-------------|---------|
| Syntax Error | Malformed CNL | Missing `group end` |
| Reference Error | Unknown entity | `references @Unknown` |
| Type Error | Wrong entity type | Character used as Location |
| Constraint Violation | Forbids/requires failed | Violence in non-violence story |
| Coherence Warning | Inconsistency detected | Character in wrong location |


## 6. Color Scheme

### 6.1 Design Direction

Moving from dark/void to **luminous mystical**:
- Keep the mystical, magical atmosphere
- Use brighter, more inspiring colors
- Maintain readability and focus
- Add warmth while preserving mystery

### 6.2 New Palette

```css
:root {
  /* Backgrounds - lighter but still atmospheric */
  --bg-deep: #1a1a2e;      /* Deep night blue */
  --bg-main: #242442;      /* Main background */
  --bg-surface: #2d2d52;   /* Cards, panels */
  --bg-elevated: #363663;  /* Hover states */
  
  /* Accents - brighter, more inspiring */
  --accent-gold: #ffd166;      /* Primary action, headers */
  --accent-rose: #ef476f;      /* Warnings, important */
  --accent-emerald: #06d6a0;   /* Success, characters */
  --accent-sky: #118ab2;       /* Info, locations */
  --accent-violet: #9d4edd;    /* Magic, patterns */
  --accent-amber: #fb8500;     /* Energy, action */
  
  /* Text */
  --text-primary: #f8f9fa;     /* Main text */
  --text-secondary: #adb5bd;   /* Secondary */
  --text-muted: #6c757d;       /* Muted */
  
  /* Entity type colors */
  --entity-character: #06d6a0;
  --entity-location: #118ab2;
  --entity-mood: #9d4edd;
  --entity-pattern: #fb8500;
  --entity-prop: #ffd166;
  --entity-theme: #ef476f;
}
```


## 7. User Workflows

### 7.1 Create New Story

1. Click "New Project"
2. Enter project name and metadata
3. Create characters in Characters tab
4. Create locations in Locations tab
5. Define moods in Moods tab
6. Build structure in tree (add chapters, scenes)
7. Add references and pattern instances to scenes
8. View auto-generated CNL
9. Evaluate metrics
10. Export as Markdown

### 7.2 Use Pattern

1. Go to Patterns tab
2. Select or create pattern
3. In tree, right-click scene → "Add Pattern"
4. Select pattern from list
5. Bind variables (select characters, locations, moods)
6. Pattern expands into scene's CNL

### 7.3 Import Library

1. Click "Import Library"
2. Select library file (.json)
3. Choose which entities to import
4. Entities added to respective tabs


## 8. Data Model

### 8.1 Project Structure

```json
{
  "id": "proj_xxx",
  "name": "The Storm Within",
  "metadata": {
    "genre": "fantasy",
    "author": "Jane Doe",
    "created": "2024-01-15T10:00:00Z"
  },
  "libraries": {
    "characters": [...],
    "locations": [...],
    "moods": [...],
    "patterns": [...],
    "props": [...],
    "themes": [...],
    "archetypes": [...],
    "conflicts": [...],
    "motifs": [...]
  },
  "structure": {
    "type": "book",
    "name": "Book",
    "title": "The Storm Within",
    "children": [
      {
        "type": "chapter",
        "name": "Chapter1",
        "title": "The Beginning",
        "children": [...]
      }
    ]
  },
  "generatedCNL": "...",
  "metrics": {...}
}
```

### 8.2 Entity Schemas

**Character:**
```json
{
  "id": "char_xxx",
  "name": "Anna",
  "type": "protagonist",
  "archetype": "Hero",
  "traits": ["courage", "determination", "inner strength"],
  "description": "A young woman from the coast",
  "relationships": [
    { "target": "Marcus", "type": "sibling" }
  ]
}
```

**Location:**
```json
{
  "id": "loc_xxx",
  "name": "Village",
  "atmosphere": "peaceful",
  "description": "Small fishing village",
  "connections": ["Forest", "Coast"]
}
```

**Mood:**
```json
{
  "id": "mood_xxx",
  "name": "Mysterious",
  "emotions": ["curiosity", "unease", "wonder"],
  "intensity": "medium",
  "color": "#9d4edd"
}
```

**Pattern:**
```json
{
  "id": "pat_xxx",
  "name": "Hero's Call",
  "description": "The protagonist receives a call to adventure",
  "variables": [
    { "name": "hero", "type": "character", "constraint": "protagonist" },
    { "name": "catalyst", "type": ["character", "event"] },
    { "name": "location", "type": "location" },
    { "name": "mood", "type": "mood" }
  ],
  "template": "..."
}
```


## 9. Implementation Notes

### 9.1 Tree Component

- Drag-and-drop reordering
- Context menu for actions
- Expand/collapse groups
- Inline editing for titles
- Visual indicators for entity types

### 9.2 CNL Generation

- Real-time generation on any change
- Debounced updates (300ms)
- Syntax highlighting in CNL view
- Read-only but copyable

### 9.3 Pattern Instantiation

- Modal dialog for variable binding
- Type-filtered dropdowns
- Preview of generated CNL
- Validation before insertion

### 9.4 Metrics

- Auto-evaluate on changes
- Visual indicators (green/yellow/red)
- Detailed breakdown on click
- Historical tracking (future)
