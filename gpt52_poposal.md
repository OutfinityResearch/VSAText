# GPT-5.2 Proposal — Turning SCRIPTA into a Real Specification Editor for Literary Works and Screenplays

## 0) Executive Summary

SCRIPTA already has the core ingredients of a specification-first writing system:
- A **Visual Story Composer** demo (`demo/index.html`) with a structure tree, entity libraries (characters/locations/objects/moods/themes), world rules, emotional arc, and CNL export.
- A **CNL parser** (`demo/cnl-parser*.mjs` + `src/cnl/validator.mjs`) that can parse an SVO-style narrative CNL into an AST.
- Back-end **services** (`src/services/*.mjs`) for planning, evaluation, verification, guardrails, and reverse engineering (currently inconsistent in CNL dialect).

To become a **real** editor for literary works and screenplays, the biggest improvements are:
1) **Unify the data model** (project/spec/plan/draft) across demo, docs, and services.
2) **Resolve the CNL dialect split** (SVO narrative CNL vs predicate-style constraint rules).
3) **Make the tool configurable** by moving hardcoded vocabularies/fields/rules into JSON configuration packs.
4) Add the missing “editor fundamentals”: **save/load**, autosave, undo/redo, version history, import/export (especially **Fountain** for screenplays), validation, and per-scene drafting.

This proposal is designed to be:
- **Actionable**: specific file/folder targets, suggested JSON layouts, and implementation phases.
- **Zero-dependency**: Node.js `.mjs`, browser ES modules, no external packages.

---

## 1) Current State (What You Already Have)

### 1.1 Demo UI Strengths (`demo/index.html`)
- Structure tree: book → chapter → scene, plus refs (character/location/object/mood/block) and actions.
- Entity editors: characters, relationships graph, locations, objects, moods, themes, world rules, emotional arc.
- CNL export: currently generates **SVO narrative CNL** (e.g., `Anna is hero`, groups, includes, actions).
- Metrics panel: useful UX, but many metrics are **simulated** (not computed from AST/services).

### 1.2 Specifications (Docs)
- DS09/DS06 describe “CNL constraints” in a **predicate/rule** form (e.g., `RULE(Scene_3, must_include, "storm").`).
- DS04/DS10 describe **SVO narrative CNL** as the IR (“programming language for narratives”).
- DS02/DS09 mention APIs beyond persistence (plans, generate, evaluate), but the current servers only do projects CRUD.

### 1.3 Server & Services
- `demo/server.mjs` and `src/server.mjs`: project CRUD only; demo server also serves static UI.
- `src/services/*`: planning, evaluation, verification, reverse-engineering exist but many assume a **predicate constraint DSL**.
- **Important mismatch**: `src/services/cnl-translator.mjs` / `reverse-engineering.mjs` output predicate rules, but the shared CNL parser parses SVO narrative statements. This breaks the current “parseCnlToConstraints” flow.

---

## 2) The Biggest Gaps to Fix First

### Gap A — Two different “CNL” dialects are mixed
You effectively have:
1) **Narrative IR (SVO CNL)** — good for “what happens in the story”, groups, includes, actions.
2) **Constraint/Rule DSL (predicate style)** — good for requirements, forbids, tones, max counts, guardrails.

Right now, these are conflated. A real editor needs both, but they must be **explicitly separated** and round-trippable.

### Gap B — No canonical project model
The demo UI state doesn’t match DS02, DS06, nor the data stores (`data/projects.json`). This prevents:
- correct persistence,
- predictable validation,
- compatibility between UI and services,
- stable import/export.

### Gap C — Hardcoded vocabularies and schema-like UI rules
Vocabularies are JS modules (`demo/vocab-*.mjs`). Services also hardcode templates (planning), tone lexicons (verification), etc.
For a “real editor”, you want:
- config packs you can edit without touching code,
- the ability to add new entity types/fields/relationships,
- per-genre/format packs (novel vs screenplay).

### Gap D — Missing editor fundamentals
To feel real:
- Save/load projects (server already exists but UI doesn’t use it).
- Autosave + conflict-safe versioning.
- Undo/redo.
- Version history + compare.
- Import/export (especially **Fountain** for screenplays).

---

## 3) Target Product Definition (What “Real” Means)

### 3.1 Two Primary Modes

**Mode 1: Specification Mode (Outline + Story Bible)**
- Manage structure (chapters/scenes/beats).
- Manage entities (characters/locations/props/themes/organizations).
- Manage arcs (plot arc + emotional arc + character arcs).
- Manage constraints (rules/requirements).
- Validate continuously.

**Mode 2: Draft Mode (Scene Writing)**
- Each scene has a draft panel (prose or screenplay format).
- Live checks: required elements, forbidden elements, continuity facts, character drift.
- Export drafts: Markdown for prose, Fountain for screenplays.

### 3.2 Screenplay-Specific Requirements
Minimum viable screenplay workflow:
- Scene metadata: `INT/EXT`, location, time of day, summary, target pages.
- Characters per scene + speaking order.
- Export to **Fountain** (`.fountain`) and re-import.
- “Script breakdown” view (for production): list scenes by location, cast, props.

### 3.3 Literary (Novel/Short Story) Requirements
- POV tracking per scene/chapter.
- Continuity facts (“bible facts”): ages, relationships, objects owned, timelines.
- Style constraints (voice, tense, tone).

---

## 4) Proposed Canonical Data Model (“Scripta Project IR”)

### 4.1 Goals for the model
- One JSON file (or one object) that can fully represent a project.
- Deterministic identifiers (stable IDs) and safe renaming (names are labels, not primary keys).
- Works for both novel and screenplay.
- Supports both narrative IR and rule DSL.

### 4.2 Suggested top-level shape (example)
```json
{
  "id": "proj_abc123",
  "title": "The Storm Within",
  "work_type": "screenplay",
  "created_at": "2026-02-02T00:00:00Z",
  "updated_at": "2026-02-02T00:00:00Z",

  "config": {
    "vocab_pack": "default-en",
    "format_pack": "screenplay-fountain",
    "schema_pack": "core-v1"
  },

  "entities": {
    "characters": [{ "id": "char_anna", "name": "Anna", "archetype": "hero", "traits": ["courage"] }],
    "locations": [{ "id": "loc_village", "name": "Village", "geography": "village", "era": "medieval" }],
    "objects": [{ "id": "obj_key", "name": "The Silver Key", "object_type": "key" }],
    "themes": [{ "id": "theme_family", "name": "Family" }],
    "world_rules": [{ "id": "wr_magic", "name": "Magic Has a Cost", "category": "magic", "description": "..." }]
  },

  "relationships": [
    { "id": "rel_1", "from_id": "char_anna", "type": "siblings", "to_id": "char_marcus" }
  ],

  "structure": {
    "root_id": "node_book_1",
    "nodes": {
      "node_book_1": { "id": "node_book_1", "type": "book", "title": "The Storm Within", "children": ["node_ch1"] },
      "node_ch1": { "id": "node_ch1", "type": "chapter", "title": "Setup", "children": ["node_sc1"] },
      "node_sc1": {
        "id": "node_sc1",
        "type": "scene",
        "title": "Village Morning",
        "refs": { "characters": ["char_anna"], "locations": ["loc_village"], "objects": [] },
        "beats": [],
        "actions": [
          { "id": "act_1", "subject_id": "char_anna", "verb": "discovers", "object_id": "obj_key" }
        ],
        "screenplay": { "int_ext": "EXT", "time_of_day": "DAY" }
      }
    }
  },

  "rules_dsl": {
    "text": "RULE(Scene_3, must_include, \"storm\").\\nRULE(World, forbid, \"explicit violence\").\\n"
  },

  "cnl_ir": {
    "text": "// Auto-generated narrative CNL...\\n",
    "ast": { "type": "document", "groups": [], "entities": {} }
  },

  "drafts": {
    "node_sc1": {
      "format": "fountain",
      "text": "EXT. VILLAGE - DAY\\n\\nANNA walks...\\n"
    }
  },

  "metrics": {
    "last_evaluated_at": null,
    "scores": {},
    "details": {}
  }
}
```

### 4.3 Why this helps
- The demo UI becomes a **renderer/editor for IR**, not its own ad-hoc state shape.
- Services can reliably consume IR (planning/evaluation/verification).
- Import/export becomes predictable.
- Config packs can define allowed fields and vocab without code changes.

---

## 5) Resolve the “Two CNLs” Problem (Recommended Approach)

### 5.1 Make the split explicit
- **Narrative IR**: SVO CNL (already implemented parser + generators).
- **Rules DSL**: predicate rules for constraints and control (needs a parser).

### 5.2 Implement a dedicated Rules DSL parser (zero deps)
Add a small parser (regex + tokenizer) for:
```
PREDICATE(arg1, arg2, "arg 3").
```
Support:
- quoted strings with escapes,
- numbers,
- identifiers,
- comments (`//`).

Then replace the current broken path:
- `src/services/cnl-translator.mjs` should validate against the **Rules DSL parser**, not the narrative CNL validator.
- `src/services/verification.mjs` / `planning.mjs` should consume the parsed rule AST.

### 5.3 Optional: convert rules into narrative CNL for unified evaluation
If you want one “language” internally, introduce a conversion layer:
- `RULE(World, forbid, "X")` ↔ `World forbids "X"`
- `RULE(Scene_3, must_include, "storm")` ↔ `Scene_3 requires "storm"`

This can be a later phase; the immediate win is just to stop mixing parsers.

---

## 6) Configuration Packs (Move Hardcoded Data into JSON)

### 6.1 Goals
Create a single place where you can add:
- names (character/location/object),
- relationship types,
- entity field definitions (properties),
- narrative arcs + beats,
- actions and their required argument types,
- world rule categories,
- tone lexicons, guardrail lists.

### 6.2 Proposed folder layout
```
config/
  README.md
  packs/
    default-en/
      manifest.json
      vocab/
        names.characters.json
        names.locations.json
        names.objects.json
        traits.json
        archetypes.json
        relationships.json
        locations.geography.json
        locations.era.json
        locations.characteristics.json
        emotions.json
        mood_presets.json
        themes.json
        conflicts.json
        narrative_arcs.json
        narrative_blocks.json
        actions.json
      schema/
        entity_types.json
        fields.character.json
        fields.location.json
        fields.object.json
        fields.scene.json
        rules.categories.json
    screenplay-fountain/
      manifest.json
      format/
        screenplay.json
```

### 6.3 Example: `relationships.json`
```json
{
  "types": {
    "siblings": { "label": "Siblings", "category": "family", "bidirectional": true, "color": "#06d6a0" },
    "mentor_student": { "label": "Mentor-Student", "category": "hierarchy", "bidirectional": false, "color": "#9d4edd" }
  }
}
```

### 6.4 Example: `entity_types.json` (drives UI generation)
```json
{
  "entity_types": {
    "character": {
      "label": "Character",
      "icon": "👤",
      "color": "#06d6a0",
      "fields_ref": "fields.character.json"
    },
    "location": {
      "label": "Location",
      "icon": "📍",
      "color": "#118ab2",
      "fields_ref": "fields.location.json"
    }
  }
}
```

### 6.5 Example: `fields.character.json`
```json
{
  "fields": [
    { "key": "name", "type": "string", "required": true },
    { "key": "archetype", "type": "enum", "options_ref": "vocab/archetypes.json#/types" },
    { "key": "traits", "type": "multi_enum", "options_ref": "vocab/traits.json#/types" },
    { "key": "backstory", "type": "text" }
  ]
}
```

### 6.6 Implementation mechanics (no deps)
- **Node**: read JSON via `fs.readFileSync`.
- **Browser**: fetch JSON via `fetch('/config/...')` (served statically).
- Merge rule: `project.config` selects pack; pack can override defaults.

This enables “add a new relationship type” by editing JSON, not code.

---

## 7) Codebase Reorganization Proposal

### 7.1 Problems today
- Demo UI logic is embedded into one HTML file (hard to test/extend).
- CNL parser lives under `demo/` and is imported by `src/` (inverted dependency).
- Servers and stores are duplicated/inconsistent (`data/projects.json` vs `data/projects/` folder).
- Services assume rule DSL but use narrative parser.

### 7.2 Target structure (minimal but scalable)
```
src/
  app/
    server.mjs                  # HTTP server (API + static)
    routes/
      projects.mjs
      plans.mjs
      evaluate.mjs
      verify.mjs
    persistence/
      store.mjs                 # JsonStore + file layout
  core/
    ir/
      project.mjs               # normalize/validate project IR
      migrate.mjs               # migration from legacy stores/demo state
    cnl/
      narrative-parser.mjs      # current SVO CNL parser (shared)
      rules-parser.mjs          # new predicate rules parser
      cnl-generator.mjs         # generate narrative CNL from IR
    config/
      load.mjs                  # load config packs (Node + browser split)
  services/
    planning.mjs
    evaluation.mjs
    verification.mjs
    guardrails.mjs
    reverse-engineering.mjs

web/                            # (rename demo/ → web/ when ready)
  index.html
  styles.css
  app.mjs
  ui/
    state.mjs
    views/
    components/
  config/                       # static config packs served to browser
```

### 7.3 Dependency rule (important)
`web/` and `src/` both depend on `src/core/`.  
No module in `src/core/` depends on `web/`.

This avoids the current “Node imports from demo” inversion.

---

## 8) Feature Roadmap (Actionable Phases)

### Phase 0 — Make persistence real (1–2 days)
**Goal:** demo UI can save/load projects and list projects.
- Add UI: Project menu with “Save”, “Save as…”, “Load…”, “Delete”.
- Wire UI to `demo/server.mjs` `/v1/projects`.
- Decide and enforce **one project JSON shape** (IR draft above).

Acceptance:
- Create project → refresh page → load project.

### Phase 1 — Canonical IR + migrations (2–4 days)
**Goal:** everyone speaks the same model.
- Implement `src/core/ir/project.mjs` to normalize demo state into IR.
- Write `src/core/ir/migrate.mjs`:
  - migrate `data/projects.json` legacy entries,
  - migrate demo in-memory state → IR.

Acceptance:
- Existing `data/projects.json` can be imported into the UI.

### Phase 2 — Rules DSL parser + fix services (2–5 days)
**Goal:** constraints stop being “string blobs”.
- Add `rules-parser.mjs` and update services to parse rule DSL correctly.
- Add UI “Rules” editor with live validation + structured list view.

Acceptance:
- `RULE(Scene_3, must_include, "storm").` is parsed, validated, and enforced by verification.

### Phase 3 — Config packs in JSON (3–7 days)
**Goal:** remove hardcoded vocab/schema and make it editable.
- Move vocab from `demo/vocab-*.mjs` → `config/packs/default-en/vocab/*.json`.
- Implement config loader + caching.
- Refactor UI to render entity editors from `fields.*.json`.

Acceptance:
- Add a new relationship type in JSON → UI shows it without code changes.

### Phase 4 — Screenplay mode (Fountain) (5–10 days)
**Goal:** screenplay projects are truly supported.
- Add scene metadata fields for screenplay.
- Add Fountain export/import:
  - export `drafts[node_scene_id]` as `.fountain`,
  - import to populate scene drafts + scene headings.
- Add breakdown report view (locations, cast, props).

Acceptance:
- Export to Fountain opens correctly in a Fountain editor.

### Phase 5 — Real metrics (integrate existing services) (3–7 days)
**Goal:** stop simulating core scores.
- Use `src/services/evaluation.mjs` to compute NQS/CAD/coherence/readability on drafts.
- Display per-scene metrics + global metrics.

Acceptance:
- Metrics change deterministically based on draft text changes.

---

## 9) “What I Would Improve” (Concrete UX/Editor Enhancements)

### 9.1 Structure editing
- Add “scene card view” (index cards) as alternative to tree for quick rearrangement.
- Add per-node fields: summary, goal, conflict, outcome (scene arc) driven by config.
- Add filtering: show only scenes with a given character/location/theme.

### 9.2 Entity management
- Add “aliases” (e.g., nicknames) and enforce consistent usage in draft checks.
- Add “facts” per entity (age, job, physical traits) and continuity checks.

### 9.3 Drafting
- Side-by-side “Spec vs Draft” per scene:
  - spec: refs + rules + intended beat,
  - draft: text editor,
  - checks: missing required elements, forbidden phrases, trait drift warnings.

### 9.4 Collaboration-ready foundations (later)
- Operation log for undo/redo now, and for collaboration later.
- Deterministic IDs + conflict resolution strategy.

---

## 10) Notes on Zero-Dependency Constraints

Everything above is achievable without external packages:
- JSON config loading: `fs` + `fetch`.
- Rules DSL parsing: small tokenizer + parser.
- Fountain export/import: simple line-based parsing (good enough for MVP).
- UI: vanilla JS modules.

If you later allow dependencies, add-ons like schema validators and rich editors become easier, but they’re not required to reach “real editor” status.

---

## 11) Next Action (If You Want Me to Implement, Not Just Propose)

Pick one:
1) **Wire save/load in the demo UI** to `/v1/projects` and introduce the canonical IR.
2) **Create `config/` packs** and refactor vocabularies to JSON first.
3) **Implement Rules DSL parser** and fix services to consume it correctly.

If you choose (1), I recommend starting with a “Project Manager” modal and autosave.

