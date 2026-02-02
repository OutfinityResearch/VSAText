# DS04 — Controlled Natural Language (CNL) Specification

## 1. Purpose and Design Philosophy

The SCRIPTA CNL provides a **human-readable, machine-parseable** language for defining narrative specifications. CNL functions as a **programming language for narratives** - it is not written directly by authors but is **auto-generated** from a visual editor.

### 1.1 CNL as Programming Language

| Concept | Programming Analog |
|---------|-------------------|
| CNL text | Source code |
| Entities | Object instances |
| Groups | Scopes / Namespaces |
| Statements | Instructions |
| Relationships | References / Pointers |
| Patterns | Functions / Templates |
| Constraints | Assertions / Contracts |
| Metrics | Program execution / Tests |

**Workflow:**
```
Visual Editor → Auto-generated CNL → Parser → AST → Interpreter (Metrics) → Results
```

### 1.2 Core Principles

1. **Auto-generated**: CNL is produced by the Visual Story Composer, not written manually
2. **Natural Syntax**: `subject verb object` pattern mirrors natural language
3. **Quoted Identifiers**: Multi-word names use quotes: `"The Dark Forest"`
4. **Proper Nouns**: Capitalized per Indo-European convention: `Anna`, `Marcus`
5. **Recursive Groups**: Hierarchical structure through named groups
6. **Reference System**: Cross-references using `@name` notation
7. **Pattern Variables**: Templates with `$variable` placeholders


## 2. Lexical Rules

### 2.1 Identifiers

**Simple Identifiers:**
- Start with uppercase letter (proper nouns/entities) or lowercase (keywords/types)
- Contain letters, digits, underscores
- Examples: `Anna`, `Village`, `Chapter1`, `protagonist`, `courage`

**Quoted Identifiers:**
- Enclosed in double quotes
- Can contain any characters except unescaped quotes
- Behave as a single identifier token
- Examples: `"The Dark Forest"`, `"inner strength"`, `"Hero's Journey"`

```
// Simple identifiers
Anna is protagonist
Village is location

// Quoted identifiers for multi-word names
"The Dark Forest" is location
Anna has trait "inner strength"
"Chapter One" group begin
```

### 2.2 Naming Conventions

| Type | Convention | Examples |
|------|------------|----------|
| Characters | Capitalized | `Anna`, `Marcus`, `"The Stranger"` |
| Locations | Capitalized | `Village`, `Forest`, `"The Dark Tower"` |
| Groups | Capitalized | `Chapter1`, `Scene2`, `"Act One"` |
| Types | Lowercase | `protagonist`, `location`, `mood` |
| Traits | Lowercase or quoted | `courage`, `"inner strength"` |
| Keywords | Lowercase | `is`, `has`, `group`, `begin` |

### 2.3 Reserved Keywords

**Verbs:** `is`, `has`, `relates`, `requires`, `forbids`, `includes`, `references`, `describes`, `targets`, `discovers`, `enters`, `meets`, `travels`, `decides`, `faces`, `threatens`, `arrives`, `confronts`, `reveals`, `transforms`

**Structure:** `group`, `begin`, `end`

**Modifiers:** `as`, `to`, `at`, `from`, `with`, `about`, `during`, `because`

### 2.4 Comments

```
// Single line comment

/* Multi-line
   comment */
```


## 3. Statement Syntax

### 3.1 Basic Statement Format

```
Subject Verb Object
Subject Verb Object Modifier ModifierValue
Subject Verb "quoted value"
```

### 3.2 Statement Types

| Pattern | Meaning | Example |
|---------|---------|---------|
| `X is Y` | Type declaration | `Anna is protagonist` |
| `X has Y Z` | Property assignment | `Anna has trait courage` |
| `X has Y "Z"` | Property with quoted value | `Anna has trait "inner strength"` |
| `X relates to Y as Z` | Relationship | `Anna relates to Marcus as sibling` |
| `X requires Y` | Constraint (must have) | `Story requires "happy ending"` |
| `X forbids Y` | Constraint (must not have) | `Story forbids "explicit violence"` |
| `X includes Y` | Inclusion | `Scene1 includes character Anna` |
| `X includes Y Z` | Typed inclusion | `Scene1 includes location Village` |
| `X references @Y` | Cross-reference | `Chapter2 references @Chapter1` |
| `X describes "text"` | Description | `Anna describes "brave young woman"` |
| `X has mood Y` | Mood assignment | `Scene1 has mood Mysterious` |


## 4. Group Syntax (Recursive Structure)

### 4.1 Basic Group

```
GroupName group begin
  ... statements ...
  ... nested groups ...
GroupName group end
```

### 4.2 Group with Quoted Name

```
"Chapter One" group begin
  "Chapter One" has title "The Beginning"
  ...
"Chapter One" group end
```

### 4.3 Nested Groups

```
Book group begin
  Story has title "The Storm Within"
  
  Chapter1 group begin
    Chapter1 has title "The Beginning"
    
    Scene1 group begin
      Scene1 has type introduction
      Anna discovers artifact
    Scene1 group end
  Chapter1 group end
Book group end
```

### 4.4 Group Types

| Type | Typical Use | Contains |
|------|-------------|----------|
| `book` | Top-level | Parts, Chapters |
| `part` | Major division | Chapters |
| `chapter` | Standard unit | Scenes |
| `scene` | Action unit | Beats, Events |
| `beat` | Micro-unit | Events |


## 5. Entity Types

### 5.1 Characters

```
Anna is protagonist
Anna has trait courage
Anna has trait "inner strength"
Anna has archetype Hero
Anna describes "A young woman from the coast"
Anna relates to Marcus as sibling
Anna wants "save her brother"
Anna fears "losing family"
```

**Character Types:** `protagonist`, `antagonist`, `character`, `mentor`, `ally`, `enemy`

### 5.2 Locations

```
Village is location
Village has atmosphere peaceful
Village describes "Small fishing village on rocky coast"
Village connects to Forest
```

### 5.3 Moods (Affective Registers)

In literary theory, **mood** (or atmosphere) is the emotional quality evoked in the reader.

```
Mysterious is mood
Mysterious has emotion curiosity
Mysterious has emotion unease
Mysterious has intensity medium
```

**Applying moods:**
```
Scene1 has mood Mysterious
Chapter2 has mood Dread
```

### 5.4 Props (Significant Objects)

```
Amulet is prop
Amulet has type artifact
Amulet has significance "key to the mystery"
Amulet belongs to Anna
```

### 5.5 Themes

```
Redemption is theme
Redemption describes "The journey from guilt to forgiveness"
Story has theme Redemption
```


## 6. Pattern System

### 6.1 Pattern Definition

Patterns are reusable story structures with **free variables** (placeholders):

```
"Hero's Call" is pattern
"Hero's Call" has variable $hero as character
"Hero's Call" has variable $catalyst as event
"Hero's Call" has variable $location as location
"Hero's Call" has variable $mood as mood

"Hero's Call" has template begin
  $hero is at $location
  $catalyst arrives at $location
  $hero discovers "call to adventure"
  $hero has mood $mood
  $hero decides "answer the call"
"Hero's Call" has template end
```

### 6.2 Pattern Instantiation

```
Scene1 uses pattern "Hero's Call"
  $hero binds to Anna
  $catalyst binds to Storm
  $location binds to Village
  $mood binds to Mysterious
Scene1 pattern end
```

**Generated CNL:**
```
Anna is at Village
Storm arrives at Village
Anna discovers "call to adventure"
Anna has mood Mysterious
Anna decides "answer the call"
```

### 6.3 Variable Types

| Type | Binds To |
|------|----------|
| `character` | Character entities |
| `location` | Location entities |
| `mood` | Mood entities |
| `prop` | Prop entities |
| `event` | Event descriptions (quoted) |
| `trait` | Trait values |


## 7. Constraint System

### 7.1 Requirements

```
Story requires character Anna
Story requires theme Redemption
Story requires "happy ending"
Chapter1 requires location Village
```

### 7.2 Prohibitions

```
Story forbids "explicit violence"
Story forbids "modern technology"
Scene2 forbids character Marcus
```

### 7.3 Constraint Evaluation

Constraints are evaluated during **interpretation** (metrics calculation):
- **Satisfied**: All requirements met, no forbids violated
- **Violated**: Requirements missing or forbids present in output
- **CSA Metric**: Constraint Satisfaction Accuracy = satisfied / total


## 8. Reference System

### 8.1 Reference Syntax

```
@EntityName           // Reference to entity
@GroupName            // Reference to group
@Group.SubGroup       // Nested reference
@Group.property       // Reference to property
```

### 8.2 Reference Usage

```
Chapter2 references @Chapter1
Scene3 resolves @Chapter1.conflict
Anna remembers @Prologue.promise
Chapter3 continues from @Chapter2
```

### 8.3 Reference Resolution

1. Check current group scope
2. Check parent group scopes (ascending)
3. Check global scope
4. Error if not found


## 9. CNL Generation from Visual Editor

### 9.1 Structure Tree → CNL

The Visual Story Composer generates CNL from tree nodes:

**Tree Node:**
```
📑 Chapter1 "The Beginning"
  ├── → Anna [character]
  ├── → Village [location]
  ├── ♪ Mysterious [mood]
  └── ⚡ "Hero's Call" [pattern: $hero=Anna, ...]
```

**Generated CNL:**
```
Chapter1 group begin
  Chapter1 has title "The Beginning"
  Chapter1 includes character Anna
  Chapter1 includes location Village
  Chapter1 has mood Mysterious
  // Pattern expansion
  Anna is at Village
  ...
Chapter1 group end
```

### 9.2 Entity Editors → CNL

**Character Editor → CNL:**
```
Anna is protagonist
Anna has archetype Hero
Anna has trait courage
Anna has trait determination
Anna describes "A young woman from the coast"
Anna relates to Marcus as sibling
```

**Location Editor → CNL:**
```
Village is location
Village has atmosphere peaceful
Village describes "Small fishing village"
```

### 9.3 Generation Order

1. Project metadata
2. Entity declarations (characters, locations, moods, props, themes)
3. Structure (groups with nested content)
4. Constraints (requires, forbids)


## 10. Interpretation and Metrics

### 10.1 Parsing (Syntax Check)

- Tokenization
- Statement parsing
- Group matching
- Reference extraction
- **Output**: AST or syntax errors

### 10.2 Semantic Analysis

- Entity resolution
- Reference validation
- Type checking
- **Output**: Validated AST or semantic errors

### 10.3 Constraint Evaluation

- Check all `requires` statements
- Check all `forbids` statements
- **Output**: Constraint satisfaction report

### 10.4 Metric Calculation

| Metric | Formula |
|--------|---------|
| **CPSR** | Parse Success Rate = valid_lines / total_lines |
| **CSA** | Constraint Satisfaction = satisfied / total_constraints |
| **Coherence** | Entity consistency = mentioned / declared |
| **CAD** | Character Attribute Drift = trait_violations / total_traits |
| **CAR** | Compliance Adherence Rate = 1 - forbid_violations |
| **NQS** | Narrative Quality Score = weighted(CSA, Coherence, Structure) |


## 11. Example Complete CNL

```
// Project metadata
Project has title "The Storm Within"
Project has genre fantasy
Project has author "Jane Doe"

// Characters
Anna is protagonist
Anna has archetype Hero
Anna has trait courage
Anna has trait "inner strength"
Anna describes "A young woman from the coastal village"
Anna relates to Marcus as sibling
Anna wants "save her brother"

Marcus is character
Marcus has role brother
Marcus has trait vulnerability
Marcus describes "Anna's younger brother"

// Locations
Village is location
Village has atmosphere peaceful
Village describes "Small fishing village on rocky coast"

"The Dark Forest" is location
"The Dark Forest" has atmosphere menacing
"The Dark Forest" describes "Ancient woodland, dark and mysterious"

// Moods
Mysterious is mood
Mysterious has emotion curiosity
Mysterious has emotion unease
Mysterious has intensity medium

Hopeful is mood
Hopeful has emotion hope
Hopeful has emotion determination
Hopeful has intensity high

// Themes
Story has theme courage
Story has theme family

// Constraints
Story requires "happy ending"
Story forbids "explicit violence"

// Structure
Book group begin
  
  Chapter1 group begin
    Chapter1 has title "The Beginning"
    Chapter1 includes character Anna
    Chapter1 includes character Marcus
    Chapter1 includes location Village
    Chapter1 has mood Mysterious
    
    Anna is at Village
    Anna interacts with Marcus
    Storm arrives at Village
    Marcus disappears during storm
    Anna decides "find Marcus"
  Chapter1 group end
  
  Chapter2 group begin
    Chapter2 has title "Into the Unknown"
    Chapter2 includes location "The Dark Forest"
    Chapter2 references @Chapter1
    
    Anna enters "The Dark Forest"
    Anna faces fear
    Anna discovers clue
    Anna has mood Hopeful
  Chapter2 group end
  
Book group end
```


## 12. Error Types

| Type | Severity | Example |
|------|----------|---------|
| `syntax_error` | Error | Missing `group end` |
| `undefined_reference` | Error | `@Unknown` entity |
| `type_mismatch` | Warning | Character used as location |
| `unbound_variable` | Error | Pattern variable not bound |
| `constraint_violation` | Warning | Forbids violated |
| `unused_entity` | Info | Declared but never used |
| `duplicate_declaration` | Warning | Same entity declared twice |
