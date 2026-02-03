# Codex Review — VSAText / SCRIPTA Demo + SDK (2026-02-03)

## 0) Goal (as understood)

The target outcome is an end-to-end demo where:

1. The **demo uses the SCRIPTA SDK on both server and client** (same parsing, evaluation, verification, vocabularies).
2. The demo generates **CNL specifications for complex literature books** (not only short story toy specs).
3. LLM-based generation uses the **CNL spec as the controlling source of truth**, producing outputs that are **coherent, consistent, and constraint-compliant** (with measurable verification + metrics).

This review focuses on gaps, contradictions, missing pieces, and correctness issues that block that outcome.

---

## 1) Verification plan (detailed)

### A. Demo boot + smoke
1. Start demo server (`node demo/server.mjs 3000`).
2. Open `http://localhost:3000/` and verify:
   - No JS module load errors.
   - `Create Specs` works for all strategies (`random`, `llm`, `advanced`, `wizard`).
   - Tabs render: `CNL`, `Blueprint`, `Dialogues`, `Wisdom`, `Patterns`.
3. Confirm endpoints:
   - `GET /health`
   - `GET/POST/PUT/DELETE /v1/projects`
   - `POST /v1/evaluate`
   - `POST /v1/generate/llm`, `/v1/generate/refine`, `/v1/generate/nl-story`

### B. SDK import parity (server vs browser)
1. Browser imports must work without bundlers:
   - `import { parseCNL } from '/src/cnl-parser/cnl-parser.mjs'`
   - `import { evaluateCNL } from '/src/evaluate.mjs'`
   - Optional: `import * as SDK from '/src/index.mjs'` (should not crash).
2. Node imports must match the browser semantics:
   - `import { parseCNL } from './src/cnl-parser/cnl-parser.mjs'`
   - `import { evaluateCNL } from './src/evaluate.mjs'`
3. Run a “same input, same output” parity test for:
   - `parseCNL` (AST shape + extracted entities/constraints).
   - `evaluateCNL` (same scores).

### C. CNL generation correctness
1. Generate a spec in the demo (random strategy).
2. Validate the produced CNL with the SDK parser (browser):
   - `parseCNL(cnl).valid === true`
   - `errors.length === 0`
3. Ensure the CNL uses a **single canonical dialect**:
   - Relationships: either `relates to … as …` or a formally defined alternative.
   - Blueprint/dialogue/subplot lines must be parseable into structured fields.
4. Export/import round-trip:
   - Export CNL → re-import → state updates (or at least validates + shows diffs).
   - “Edit CNL” mode: save changes updates state or clearly marks “CNL is read-only”.

### D. Evaluation and metrics integrity
1. Evaluate the generated CNL:
   - In-browser evaluation via SDK (preferred).
   - Or server `POST /v1/evaluate` as a wrapper around SDK.
2. Validate that the evaluator’s “world model” matches DS12 expectations:
   - Scenes derived from groups in order.
   - Includes/references resolved.
   - Events extracted from verbs.
3. Confirm metric coverage matches docs:
   - CPSR, CSA, CAR, CAD, CS, OI, EAP, XAI, RQ, NQS.
4. Ensure metrics are deterministic (same CNL → same scores).

### E. LLM generation loop with verification/guardrails
1. Generate prose from CNL (`/v1/generate/nl-story`):
   - Provide “length/tone/style/POV” controls via spec or UI.
2. Immediately run:
   - `verifyCnl(cnl, storyText)` (constraint compliance)
   - `runGuardrailCheck(storyText)` (bias/originality/etc)
   - `evaluateCNL(cnl, { prose: storyText })` (quality metrics)
3. If verification fails, apply an iterative repair loop:
   - “Revise the draft to satisfy these constraints; do not add new characters/locations unless specified.”
   - Retry up to N times with a strict delta policy.

### F. Complex book readiness checks
1. Stress-test with “novel-scale” specs:
   - 20–40 scenes, multiple subplots, recurring motifs/wisdom/patterns.
   - Long character arcs + trait constraints + forbidden elements.
2. Ensure generation is chunkable:
   - Per-chapter/scene generation with continuity memory.
   - Retrieval of spec fragments relevant to current chapter.
3. Evaluate multi-chapter consistency:
   - Re-run CAD/coherence on the full generated manuscript.
   - Re-verify all constraints across the full text.

---

## 2) Findings (blocking issues)

### Critical

1. **`npm test` is failing (CNL validator is broken as exported).**
   - Error: `TypeError: parseCNL is not a function` from `src/cnl-parser/cnl-parser-generators.mjs:211`.
   - Root cause: `src/cnl/validator.mjs` re-exports `validateText` from `cnl-parser-generators.mjs`, but that function expects `(text, parseCNL)`; tests call it as `validateText(text)`.
   - Impact: SDK validation is unreliable for both tests and any consumer importing `src/cnl/validator.mjs`.

2. **`src/evaluate.mjs` does not correctly interpret the AST produced by `parseCNL`.**
   - `evaluateCNL()` currently assumes:
     - `parseResult.entities` exists (it doesn’t; entities live under `parseResult.ast.entities`).
     - An AST tree with node types like `book`, `chapter`, `scene`, `character-ref`, etc. (the CNL parser returns groups + statements, not typed nodes).
   - Result: structure counts and most structure-dependent metrics return zeros; NQS becomes “Critical” even for reasonable specs.

3. **Blueprint/dialogue/subplot CNL syntax shown in the demo is “valid” but does not parse into structured data.**
   - Parser issue: `parseLine()` discards tokens *between* subject and verb, so patterns like:
     - `Beat midpoint mapped to Ch2.Sc1`
     - `Tension at 0.5 is 4`
     - `Dialogue D1 at Ch2.Sc1`
     - `Subplot S1 type romance`
     do not populate `beatKey`, `position`, `dialogueId`, `subplotId` as intended.
   - Confirmed via Node parsing: blueprint arc parses, but `beatMappings` and `tensionCurve` stay empty; subplot becomes keyed as `"type"`.

4. **The demo “Advanced” strategy is structurally broken with the current evaluation implementation.**
   - `demo/app/generation/generation-advanced.mjs` expects `evaluateMetrics()` to return metric values for scoring/optimization.
   - `demo/app/metrics.mjs` calls a server endpoint and returns no structured value for optimization.
   - `demo/app/generation/generation-utils.mjs` expects a different metric shape (`metrics.scores.*`) than what `/v1/evaluate` returns.

### High

5. **The demo does not currently use the SDK as a single stable entrypoint in the browser.**
   - There is no usage of `/src/index.mjs` from the demo.
   - Likely reason: `src/index.mjs` exports Node-only modules (`crypto`, `fs` usage) which will break browser imports.

6. **Browser-compatibility claims conflict with implementation.**
   - Multiple SDK modules use Node built-ins (`crypto`, `fs`) directly:
     - `src/vsa/encoder.mjs`, `src/services/planning.mjs`, `src/services/research.mjs`, etc.
   - This blocks the stated goal “same SDK on server and client”.

7. **Generated prose is not wired into evaluation/guardrails/verification.**
   - `demo/app/metrics.mjs` sends `state.generatedProse` (not present) instead of `state.generation.generatedStory`.
   - The LLM story generation endpoint returns only text; no automatic verification report or guardrail report is surfaced in the UI.

### Medium

8. **CNL generation contains literal `\\n` sequences in some sections.**
   - In `demo/app/cnl.mjs`, the Themes/Wisdom/Patterns sections append strings using `\\n` (backslash + n) instead of newline characters.
   - This degrades readability and breaks downstream parsing/metrics that expect real line breaks.

9. **Spec contradictions about relationship syntax.**
   - DS04/DS11 describe relationships as `X relates to Y as Z`.
   - DS10 example uses `Anna mentor_student Gandalf`.
   - The current parser extracts relationships only for the DS11 form.
   - The demo generator emits the DS10 form, so relationships are not extracted by the SDK.

10. **Architecture contradictions (browser-first vs server endpoints).**
   - DS24/DS02/DS09 emphasize “no processing APIs; only persistence”.
   - The demo server implements processing endpoints (`/v1/evaluate`, `/v1/generate/*`).
   - This may be acceptable for a demo, but docs/specs should explicitly distinguish “research demo server” vs “minimal persistence server”.

### Low

11. **Versioning is inconsistent across the repo.**
   - `package.json`: `0.1.0`
   - `src/index.mjs`: hardcoded `2.0.0`
   - `src/vocabularies/vocabularies.mjs`: “v3.2”
   - demo footer: “SCRIPTA v3.2”
   - Specs: DS11 “2.0.0”

12. **`src/configs/cnl-grammar.json` exists but is not used by the parser.**
   - VERBS/MODIFIERS/ENTITY_TYPES are hardcoded in code, so the config is currently dead weight.

---

## 3) Recommendations (prioritized)

### P0 — Unblock correctness
1. Fix `src/cnl/validator.mjs` export so `validateText(text)` works (and tests pass).
2. Fix `parseLine()` to preserve tokens before the verb and/or enforce strict SVO:
   - Either support “interleaved modifiers” (`Tension at 0.5 is 4`) properly, **or** update the demo CNL generator to only emit strict SVO (`Tension is 4 at 0.5`).
3. Rework `src/evaluate.mjs` to operate on the **actual** CNL parser AST:
   - Derive a DS12-style world model from `ast.groups` + `statements`.
   - Extract entities via `extractEntities(ast)` (not `parseResult.entities`).

### P1 — Make the SDK usable in the browser
1. Split SDK entrypoints:
   - `src/index-browser.mjs` (no Node built-ins)
   - `src/index-node.mjs` (full feature set)
2. Replace Node `crypto` usage in browser-needed modules with a deterministic pure-JS hash:
   - Enables VSA-based metrics/verification in the browser.

### P2 — Make LLM output coherent + compliant
1. Add a “generate → verify → repair” loop server-side for `/v1/generate/nl-story`.
2. Return a combined response to the client:
   - `{ story, verificationReport, guardrailsReport, evaluationReport }`
3. Provide chunked generation for novel-scale output:
   - Per-scene generation using only relevant spec fragments.
   - Maintain an explicit continuity state (character facts, unresolved constraints).

### P3 — Unify specs + docs
1. Decide and document one canonical CNL dialect:
   - Relationship syntax, theme/wisdom/pattern statements, blueprint syntax.
2. Update DS10 examples or DS11 reference accordingly.
3. Update DS24 to reflect the demo server’s actual endpoints (or remove endpoints from “architecture overview” scope).

---

## 4) What I could not verify in this environment

- I could not start an HTTP listener (`node demo/server.mjs`) due to sandbox restrictions (`listen EPERM`), so browser-level UI checks and HTTP endpoint smoke tests were not executed here.
- All runtime findings above are from static analysis plus direct Node execution of parser/evaluator functions.

---

## 5) Quick pointers to the most relevant files

- Demo:
  - `demo/app/cnl.mjs` (CNL generation + edit/import TODOs)
  - `demo/app/blueprint/cnl-editor.mjs` (blueprint CNL editor + parsing)
  - `demo/app/metrics.mjs` (evaluation call + rendering)
  - `demo/app/generation/generation-advanced.mjs` (advanced strategy assumptions)
  - `demo/services/llm-generator.mjs` (LLM integration + fallback)
  - `demo/server.mjs` (API surface)

- SDK:
  - `src/index.mjs` (SDK entrypoint; currently not browser-safe)
  - `src/cnl/validator.mjs` (broken `validateText` export)
  - `src/cnl-parser/cnl-parser-core.mjs` (parser logic; verb detection)
  - `src/evaluate.mjs` (evaluation; currently mismatched with parser AST)
  - `src/services/verification.mjs`, `src/services/guardrails.mjs` (compliance + safety)

