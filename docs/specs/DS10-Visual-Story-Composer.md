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
│  Project Name                    [Save] [Load] [Export]        │
├───────────────┬─────────────────────────────┬──────────────────┤
│               │                             │                  │
│  Structure    │    Center Panel             │   Metrics        │
│  Tree         │    (Tabbed Editors)         │                  │
│               │                             │   Quality scores │
│  📖 Book      │    CNL | Characters |       │   Validation     │
│   ├─ Ch 1     │    Locations | Moods |      │   Constraints    │
│   │  ├─ Sc 1  │    Patterns | Themes        │                  │
│   │  └─ Sc 2  │                             │                  │
│   └─ Ch 2     │                             │                  │
│               │                             │                  │
└───────────────┴─────────────────────────────┴──────────────────┘
```

## Structure Tree

Left panel shows hierarchical story structure:

```
📖 "The Storm Within" [Book]
  ├── 📑 "Prologue" [Chapter]
  │     └── 🎬 "Village Morning" [Scene]
  │           ├── → Anna [character]
  │           ├── → Village [location]
  │           └── ♪ Mysterious [mood]
  ├── 📑 "The Beginning" [Chapter]
        ├── 🎬 "Discovery" [Scene]
        │     └── ⚡ "Hero's Call" [pattern]
```

**Node Types:**
- **Structural** - Book, Part, Chapter, Scene, Beat
- **References** - Links to entities from libraries
- **Patterns** - Instantiated story templates

**Actions:**
- Add child nodes, Add references, Instantiate patterns, Edit properties, Drag to reorder

## Center Panel Tabs

**CNL** - Auto-generated code (read-only), updates in real-time

**Characters** - Name, type (protagonist/antagonist/mentor), traits, relationships

**Locations** - Name, atmosphere, description, connections

**Moods** - Emotional registers with intensity (used for scenes)

**Patterns** - Reusable story templates with variable slots

**Themes** - Abstract narrative themes

## Pattern System

Patterns are reusable story structures with variables:

```
Pattern: "Hero's Call"
Variables:
  $hero: Character
  $location: Location
  $mood: Mood

Template:
  $hero is at $location
  $hero discovers "call to adventure"
  $hero has mood $mood
```

Instantiate by binding variables:

```
⚡ "Hero's Call"
   $hero → Anna
   $location → Village
   $mood → Mysterious
```

Generates:

```
Anna is at Village
Anna discovers "call to adventure"
Anna has mood Mysterious
```

## Entity Libraries

| Library | Scope | Purpose |
|---------|-------|---------|
| Characters | Project | Named characters with traits |
| Locations | Project | Places with atmosphere |
| Moods | Shared | Emotional registers for scenes |
| Patterns | Universal | Reusable story templates |
| Archetypes | Universal | Character templates (Hero, Mentor, Shadow) |
| Themes | Project | Abstract narrative themes |

## CNL Generation Rules

The tree generates CNL automatically:

**Adding character "Anna" as protagonist with trait "courage":**
```
Anna is protagonist
Anna has trait courage
```

**Adding scene with character, location, and mood:**
```
Scene1 group begin
  Scene1 includes character Anna
  Scene1 includes location Village
  Scene1 has mood Mysterious
Scene1 group end
```

**Adding constraint on story:**
```
Story requires "happy ending"
Story forbids "violence"
```

## Metrics Panel

Right panel shows real-time quality metrics:
- **CPSR** - Parse success rate
- **CSA** - Constraint satisfaction
- **Coherence** - Entity consistency
- **Constraint Status** - Which requires/forbids pass or fail

All metrics update as the author edits the tree.
