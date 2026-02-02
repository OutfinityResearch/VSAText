# DS01 — SCRIPTA Vision Document

## 1. Executive Summary

**SCRIPTA** (Structured Creative Writing Intelligent Platform for Textual Authoring) is a **Visual Story Composer** that enables authors to create structured narrative specifications through an intuitive visual interface. The system auto-generates a Controlled Natural Language (CNL) representation that functions as a **programming language for narratives**.

### 1.1 Core Innovation

Instead of writing specifications manually, authors:
1. **Build visually**: Create story structure through an interactive tree editor
2. **Compose from libraries**: Select characters, locations, moods, and patterns from reusable libraries
3. **Instantiate patterns**: Apply story templates with bound variables
4. **Evaluate automatically**: Receive real-time quality metrics

The CNL serves as an **Intermediate Representation (IR)** - machine-readable output that captures the cognitive and emotional structure of the narrative.


## 2. Problem Statement

### 2.1 Current Challenges

1. **Manual specification is tedious**: Authors don't want to write code or formal languages
2. **Structure is hard to visualize**: Hierarchical story structures are complex
3. **Reusability is limited**: Character archetypes, story patterns are recreated constantly
4. **Quality is subjective**: No objective metrics for narrative structure

### 2.2 Our Solution

| Challenge | SCRIPTA Solution |
|-----------|------------------|
| Manual specification | Visual tree editor with drag-and-drop |
| Structure visualization | Hierarchical tree with icons and colors |
| Reusability | Entity libraries + pattern templates |
| Quality measurement | CNL interpretation → metrics |


## 3. System Architecture

### 3.1 Conceptual Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    VISUAL STORY COMPOSER                        │
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────┐  │
│  │ Structure   │  │  Entity Libraries   │  │   Patterns      │  │
│  │ Tree        │  │  - Characters       │  │   with free     │  │
│  │ (chapters,  │  │  - Locations        │  │   variables     │  │
│  │  scenes)    │  │  - Moods            │  │                 │  │
│  │             │  │  - Props, Themes    │  │                 │  │
│  └──────┬──────┘  └──────────┬──────────┘  └────────┬────────┘  │
│         │                    │                      │           │
│         └────────────────────┼──────────────────────┘           │
│                              ▼                                  │
│                    ┌─────────────────────┐                      │
│                    │  CNL GENERATOR      │                      │
│                    │  (auto-generates    │                      │
│                    │   from visual)      │                      │
│                    └──────────┬──────────┘                      │
└───────────────────────────────┼─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CNL (IR)                                │
│  Controlled Natural Language - The "Source Code" of narrative   │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       INTERPRETER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐    │
│  │ Parser       │  │ Semantic     │  │ Metric Calculator  │    │
│  │ (syntax)     │  │ Analyzer     │  │ (execution)        │    │
│  └──────────────┘  └──────────────┘  └────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        OUTPUTS                                  │
│  - Quality Metrics (CPSR, CSA, NQS, Coherence)                  │
│  - Constraint Validation                                        │
│  - Narrative Skeleton                                           │
│  - Markdown Export                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 CNL as Programming Language

The CNL functions as a programming language where:

| Programming | Narrative Equivalent |
|-------------|---------------------|
| Source code | CNL specification |
| Compilation | Parsing → AST |
| Execution | Metric calculation |
| Runtime errors | Constraint violations |
| Unit tests | Coherence checks |
| Functions | Reusable patterns |
| Variables | Pattern placeholders ($hero, $location) |
| Type system | Entity types (character, location, mood) |


## 4. Entity Libraries

### 4.1 Library Types

| Library | Contents | Scope |
|---------|----------|-------|
| **Characters** | Named characters with traits, archetypes | Project |
| **Locations** | Places with atmosphere, connections | Project |
| **Moods** | Emotional registers (term from literary theory) | Project/Global |
| **Patterns** | Story templates with free variables | Global |
| **Props** | Significant objects | Project |
| **Themes** | Abstract themes | Project |
| **Archetypes** | Character templates (Hero, Mentor, Shadow) | Global |
| **Conflicts** | Conflict types (man vs nature, etc.) | Global |
| **Motifs** | Recurring literary motifs | Global |

### 4.2 Pattern System

Patterns are reusable story structures with **free variables**:

```
Pattern: "Hero's Call"
Variables:
  $hero: character (protagonist)
  $catalyst: character | event
  $location: location
  $mood: mood

Template:
  $hero is at $location
  $catalyst arrives
  $hero discovers "call to adventure"
  $hero has mood $mood
  $hero decides "answer call"
```

**Instantiation** binds variables to concrete entities from libraries.


## 5. Visual Interface

### 5.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER: Project | Save | Load | Export | Evaluate              │
├──────────────┬──────────────────────────────┬───────────────────┤
│              │                              │                   │
│  STRUCTURE   │  CENTER TABS                 │  METRICS          │
│  TREE        │  ┌────────────────────────┐  │                   │
│              │  │ CNL | Characters |     │  │  Quality scores   │
│  📖 Book     │  │ Locations | Moods |    │  │  Validation       │
│  ├─📑 Ch1    │  │ Patterns | Props |     │  │  Constraints      │
│  │ ├─🎬 Sc1  │  │ Themes | Archetypes    │  │                   │
│  │ └─🎬 Sc2  │  └────────────────────────┘  │                   │
│  └─📑 Ch2    │                              │                   │
│              │  [Tab content area]          │                   │
│              │                              │                   │
├──────────────┴──────────────────────────────┴───────────────────┤
│  FOOTER: Counts | Status | Version                              │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Color Scheme

**Luminous Mystical** - bright but atmospheric:

- **Backgrounds**: Deep night blue (#1a1a2e) → violet (#242442)
- **Accents**: Gold (#ffd166), Rose (#ef476f), Emerald (#06d6a0), Sky (#118ab2), Violet (#9d4edd)
- **Entity colors**: Characters=emerald, Locations=sky, Moods=violet, Patterns=amber

### 5.3 Tree Interactions

- **Add child**: Right-click → Add Chapter/Scene/Beat
- **Add reference**: Drag entity from library to node
- **Instantiate pattern**: Right-click → Add Pattern → Select → Bind variables
- **Edit properties**: Click node → Edit panel
- **Reorder**: Drag and drop within tree


## 6. Quality Metrics

### 6.1 Metric Definitions

| Metric | Description | Target |
|--------|-------------|--------|
| **CPSR** | CNL Parse Success Rate | > 95% |
| **CSA** | Constraint Satisfaction Accuracy | > 98% |
| **Coherence** | Entity consistency (declared vs used) | > 75% |
| **CAD** | Character Attribute Drift | < 15% |
| **NQS** | Narrative Quality Score (composite) | > 75% |

### 6.2 Interpretation as Execution

"Running" the CNL means:
1. Parse syntax → AST
2. Validate semantics (references, types)
3. Evaluate constraints (requires/forbids)
4. Calculate metrics
5. Generate skeleton narrative


## 7. Target Users

### 7.1 Primary: Authors & Writers

- Create story structures visually
- Use pattern libraries for common story beats
- Get feedback on structural quality
- Export for further development

### 7.2 Secondary: Writing Educators

- Teach story structure
- Analyze existing works (reverse engineer to CNL)
- Compare student work against patterns

### 7.3 Tertiary: AI/LLM Integration

- Use CNL as structured prompt
- Feed skeleton to LLM for prose generation
- Maintain story coherence through constraints


## 8. Technology Stack

- **Frontend**: Single HTML file, vanilla JavaScript, ES6 modules
- **Backend**: Node.js minimal persistence server
- **Storage**: JSON files (projects, libraries)
- **No external dependencies** for core functionality


## 9. Success Criteria

1. **Usability**: Author can create complete story structure in < 30 minutes
2. **Learnability**: New user productive within 1 hour
3. **Quality**: Generated CNL parses with 100% success rate
4. **Reusability**: Patterns can be shared across projects
5. **Integration**: Markdown export works correctly


## 10. Roadmap

### Phase 1: Core Composer (Current)
- Visual tree editor
- Entity editors (characters, locations, moods)
- CNL auto-generation
- Basic metrics

### Phase 2: Pattern System
- Pattern definition interface
- Variable binding UI
- Pattern library management

### Phase 3: Advanced Features
- Library import/export
- Collaborative editing
- Version history
- Advanced metrics (emotional arc, pacing)

### Phase 4: Integration
- LLM integration for prose generation
- Reverse engineering (text → CNL)
- Publishing workflows
