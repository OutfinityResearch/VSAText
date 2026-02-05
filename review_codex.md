# Codex Review — Spec (CNL) Generation & NL Adherence

Date: 2026-02-05  
Repo: `VSAText`  
Scope: (1) Spec generation strategies (Random / Advanced / LLM) and resulting CNL quality, (2) NL (Natural Language) generation, with a focus on CNL adherence and Romanian output.

---

## Executive Summary

The “NL invents a story” symptom has a clear primary driver:

- **Streaming NL generation does not receive chapter/scene CNL.** The demo sends `chapters` without `cnl`, so chapter prompts contain `THIS CHAPTER'S SPECIFICATION: undefined`. When this happens, the model has no per-chapter ground truth and will free-write.

Secondary contributors:

- **Spec completeness varies by strategy**, especially missing chapter/scene titles and weak grounding of global elements (world rules, patterns, wisdom) into scene actions.
- **Adherence is not enforced** even when CNL is present: no post-generation verification + repair loop (e.g., “no new named characters”, “use only declared entities”).

---

## Status Update (Implemented on 2026-02-05)

### P0 shipped: streaming spec + adherence enforcement

- **Server derives per-scene CNL automatically for streaming NL** when the client does not provide `scenes[].cnl`.
  - File: `demo/server.mjs` (SSE route `/v1/generate/nl-story/stream`)
  - New SDK helper: `src/generation/cnl-scene-slicer.mjs`
  - Result: prompts no longer contain `THIS CHAPTER'S SPECIFICATION: undefined`.
- **Scene roster enforcement (verify → repair) to prevent character drift**
  - New SDK helper: `src/generation/nl-adherence.mjs` (detects disallowed/missing characters + unknown name tokens, builds a rewrite prompt)
  - Updated generator: `src/generation/nl-generator.mjs`
  - Demo sets `options.enforceSceneRoster = true` with `maxAdherenceRepairs = 1` by default when slicing scenes server-side.

### Spec generation improvements shipped (Random + Advanced)

- **Random generator now produces non-empty chapter/scene titles and more coherent scenes**
  - Chapter titles default to `Chapter N` and may be upgraded using beat mappings.
  - Scene titles default to an action/location-derived label and may be upgraded using beat mappings.
  - Action targets are constrained to entities present in the scene; objects referenced by actions are now included as `object-ref`.
  - All declared characters are forced to appear in at least one scene.
  - Refactor into smaller modules:
    - `src/generation/random-generator.mjs`
    - `src/generation/random-generator-structure.mjs`
    - `src/generation/random-generator-utils.mjs`
- **Optimizer structural completeness is stricter**
  - File: `src/generation/optimizer.mjs`
  - Ensures chapter/scene titles, adds a mood when missing, and adds at least one action per scene (provides ground truth for NL).

### Tests shipped

- Added:
  - `tests/generation/cnl-scene-slicer.test.mjs`
  - `tests/generation/nl-adherence.test.mjs`
- Extended:
  - `tests/generation/random.test.mjs` (titles + coherent action targets)
- `npm test` passes (264/264).

---

## 1) Spec Generation (CNL) — Current Design

### Flow overview

- Demo creates/updates a Project object (`libraries`, `structure`, `blueprint`) using one of:
  - Random: `src/generation/random-generator.mjs`
  - Advanced (Optimized): `src/generation/optimizer.mjs`
  - With LLM: `demo/services/llm-generator.mjs` (JSON project payload)
- Demo derives CNL from the Project via:
  - `src/services/cnl-serializer.mjs` (called from `demo/app/cnl.mjs`)

### What “CNL completeness” means for NL generation

NL prompts rely on CNL being usable as a deterministic spec:
- Entities declared (characters/locations/objects/moods/themes/rules)
- Structure groups exist (book → chapters → scenes)
- Per-scene “includes” + SVO actions exist
- Constraints/hints are present to reduce LLM degrees of freedom

The serializer already adds useful global hints:
- `#hint: Treat this CNL as a deterministic specification...`
- `#avoid: Adding named entities that are not declared...`

But the NL generator must actually receive the relevant CNL content (especially in streaming mode).

---

## 1A) Random Spec Generation — Findings

Code: `src/generation/random-generator.mjs`, `src/generation/random-generator-blueprint.mjs`

### Strengths

- Fast and portable (no dependencies).
- Produces complete Project shape (libraries + structure + blueprint).
- Adds `dialogue-ref` nodes tied to narrative beats and also serializes dialogue stubs.

### Gaps that reduce perceived coherence/completeness

1. **Chapter/scene titles are often empty**
   - Random structure uses `title: ''` for chapters and scenes.
   - Serializer emits titles only when present → the CNL lacks readable section titles.
   - NL prompts that reference titles become less grounded.

2. **Beat mapping and scene actions are weakly coupled**
   - Beat mappings are placed onto structure, but scene actions are chosen generically.
   - A beat like “ordeal” may end up with low-stakes random actions.

3. **Global elements aren’t grounded into scene actions**
   - World rules/patterns/wisdom can be present globally but not expressed in any scene.

4. **Entity usage parity is not guaranteed**
   - Some generated entities never appear in structure nodes, which weakens the “spec is truth” feeling.

### Suggested improvements (Random)

- Always generate non-empty titles for chapters/scenes (template-based).
- Beat-aware action selection: pick actions based on beat category (setup/conflict/revelation/resolution).
- Ground world rules: require at least N scenes to demonstrate rules explicitly.
- Enforce entity usage parity: each main character appears in ≥K scenes; key objects appear at least once and are used in an action.

---

## 1B) Advanced (Optimized) Spec Generation — Findings

Code: `src/generation/optimizer.mjs`

### What it does today

- Generates random candidates.
- Evaluates `evaluateCNL(serializeToCNL(project))`.
- Applies small “constraint optimization” passes (references/minimum elements/emotional arc/traits/structural completeness).
- Picks best NQS score.

### Gaps impacting coherence/completeness

- Not a true iterative improvement loop: it mostly resamples random candidates rather than mutating the best.
- Constraint fixes are simplistic and may introduce generic placeholders.
- No explicit constraints for titles, world-rule grounding, or entity usage parity.
- NQS is helpful but not sufficient to guarantee narrative coherence.

### Suggested improvements (Advanced)

- Add constraint passes for:
  - Non-empty chapter/scene titles
  - World-rule demonstration coverage
  - Entity usage parity (avoid unused entities)
  - Dialogue coverage per chapter/scene
- Replace “resample each iteration” with “keep bestProject + guided mutation operators”.
- Expose “why score is low” diagnostics so optimization is explainable.

---

## 1C) LLM Spec Generation — Findings

Code: `demo/services/llm-generator.mjs`, `demo/services/llm-specs-json.mjs`

### Strengths

- Can produce higher semantic coherence when the model behaves.
- Prompt presets (strict/creative/minimal) provide controllability.
- Server normalizes payload into a loadable Project.

### Risks/gaps

- Malformed JSON is common; strict prompts reduce but don’t eliminate it.
- LLM may produce disconnected content (entities not used in structure).
- IDs and required fields can be missing or inconsistent.

### Suggested improvements (LLM Specs)

- Add schema validation (lightweight) + reject/repair if key requirements fail:
  - Must have book → chapters → scenes
  - Each scene must include at least 1 character-ref and 1 location-ref
- Add a second “grounding” pass: link unused entities into structure and actions.
- Prefer deterministic IDs in the normalization pass (`ch_1`, `sc_1_1`, etc.) for downstream tooling.

---

## 2) NL Generation — Current Design

### Modes

- Single-call NL: `POST /v1/generate/nl-story`
  - Uses `buildFullStoryPrompt(cnl, storyName, options)` with full CNL.
- Streaming NL (SSE): `POST /v1/generate/nl-story/stream`
  - If `scenes.length > 0` → scene-by-scene generation
  - Else if `chapters.length > 0` → chapter-by-chapter generation
  - Else → full-story generation

### Key requirement for adherence

For streaming generation to respect the spec:
- Each chapter/scene must include its own **CNL slice** (`chapterInfo.cnl` / `sceneInfo.cnl`) and optionally a concise roster (characters/locations/moods).

---

## 2A) Root Cause: Streaming Uses `chapters[]` Without CNL

In the demo, multi-chapter projects typically trigger streaming mode. The client currently sends:

- `chapters: [{ number, title, scenes }]` (no `cnl`)

Relevant code paths:
- Client: `demo/app/nl-generation.mjs` (`extractChaptersFromProject()` and `generateNLStoryStreaming()` request body)
- Server: `demo/server.mjs` (`/v1/generate/nl-story/stream` → `generateStoryStreaming({ cnl, options, chapters, scenes })`)
- SDK: `src/generation/nl-generator.mjs` (`buildChapterPrompt()` expects `chapterInfo.cnl`)

This causes:

- `buildChapterPrompt()` to include `THIS CHAPTER'S SPECIFICATION:\nundefined`
- The model receives no usable ground truth and invents story events, characters, and structure.

This strongly explains user-observed failures:
- “doesn’t respect the number of characters”
- “invented plot not grounded in CNL”
- “ignores per-scene config”

### Immediate fix options

Option A (recommended): build **scene-level** CNL slices and use `generateStoryByScenes`.
- Parse full CNL into AST (`src/cnl-parser/cnl-parser-core.mjs`).
- For each scene group, build a compact CNL snippet containing:
  - A roster summary (declared characters/locations/objects)
  - The current chapter/scene group statements
  - Any local annotations/constraints
- Send `scenes: [{ chapterNumber, chapterTitle, sceneNumber, title, cnl, characters, location, mood }]`.

Option B (fast fallback): if the client cannot provide `chapter.cnl`, do not send `chapters`.
- Let the server fall back to full-story generation (less progress UI, but better adherence than “undefined spec”).

---

## 2B) Romanian NL Output — Why It Feels Unfaithful

The prompts already include language instructions for non-English languages (including Romanian) in:
- `buildScenePrompt()`
- `buildChapterPrompt()`
- `buildFullStoryPrompt()`

So Romanian issues are likely not “language switching”, but “missing spec” + “no enforcement”.

### Improvements for Romanian (after fixing streaming spec)

- Add explicit constraints:
  - Use character names exactly as in CNL (do not translate names).
  - Do not introduce new named entities; use generic roles if needed.
- Add a Romanian style hint (diacritics, dialogue punctuation, natural idioms).
- Verify adherence via a language-independent checker (entity drift + constraints).

---

## 2C) NL Adherence Is Not Enforced

Even when full CNL is present, models can drift. The system lacks:
- A verifier for “no new named entities”, “required elements present”, “structure respected”.
- A repair loop that rewrites output to comply.

### Recommendation: Verify → Repair loop

Use existing verification utilities as a starting point:
- `src/services/verification.mjs` can parse constraints and check presence / drift signals.

Add a lightweight named-entity drift detector:
- Extract declared entity names from CNL AST.
- Scan generated markdown for unknown name-like tokens.
- If unknown named entities are found, run a repair prompt:
  - “Rewrite to remove/rename unknown entities; keep all CNL plot events.”

---

## Priority Roadmap (Suggested)

### P0 (highest impact)

1. Fix NL streaming to use real per-chapter/per-scene CNL slices (avoid `undefined`). **DONE**
2. Add “no new named entities” enforcement (verify + repair). **DONE (scene roster enforcement)**

### P1

1. Always generate non-empty chapter/scene titles in Random/Advanced/LLM normalization.
2. Beat-aware action generation so blueprint beats and actions align.
3. Ground world rules (demonstrate them in scenes).

### P2

1. Upgrade optimizer to “mutate + improve best” rather than resample-only.
2. Add metrics that correlate better with perceived coherence:
   - World-rule usage coverage
   - Entity usage parity
   - Dialogue coverage per scene/chapter
   - Scene “turn” detection (new info/decision/consequence)

### P3

1. UI diagnostics in NL tab: declared vs used entities, unknown names, missing constraints, per-chapter compliance.
