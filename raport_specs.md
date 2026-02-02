# Specs vs Code/Demo Gap Report (SCRIPTA / VSAText)

Date: 2026-02-02

## 1) Scope

This report audits the repository **as it exists on the date above**, focusing on:
- spec ↔ implementation drift
- demo ↔ core library boundaries
- doc quality (removing outdated/fictional claims)

Artifacts reviewed:
- Design specs: `docs/specs/DS01..DS24` (DS19 is reserved)
- API schemas/examples: `docs/schemas/api/*.json`, `docs/examples/api/*.json`
- Eval dataset: `docs/evals/scripta_nl_cnl.jsonl`
- Demo app: `demo/index.html`, `demo/server.mjs`
- Core modules: `src/cnl-parser/*`, `src/vocabularies/*`, `src/services/*`, `src/index.mjs`
- Persistence: `src/server.mjs`, `src/storage/projects.mjs`, `data/*`
- Tooling/tests: `tests/*`, `scripts/*`, `traceability-check.mjs`

Goal: identify concrete, actionable mismatches so the project can become a real **spec editor for literary works and screenplays** with:
- a reusable core (browser + Node)
- deterministic evaluation
- coherent, explainable generation

---

## 2) Executive Summary

### 2.1 Fixed / Now Aligned

- **CNL is effectively unified around SVO**:
  - The parser lives in `src/cnl-parser/*` and is used by demo and services.
  - The translator (`src/services/cnl-translator.mjs`) outputs SVO constraints.
  - The eval dataset (`docs/evals/scripta_nl_cnl.jsonl`) is SVO.
  - Verification (`src/services/verification.mjs`) reads constraints from the SVO AST.

### 2.2 Still High-Impact Gaps (Current)

1) **Docs still contradict themselves about CNL and APIs**
   - DS06/DS07/DS09 and multiple API examples still show the deprecated predicate DSL.
   - API schemas/examples describe processing endpoints that do not exist; the server is persistence-only.

2) **“Browser + Node reusable core” is not cleanly enforced**
   - Some `src/` modules are Node-only or have CLI side effects (not safely importable in browsers).
   - The repo does not explicitly separate “SDK surface” vs “Node adapters/CLI”.

3) **Metrics specs exist (DS12–DS23) but implementations do not match**
   - Demo metrics are partly simulated and non-deterministic (`Math.random()`).
   - `src/services/evaluation.mjs` implements different formulas than DS13/DS14/DS23.
   - The DS12 interpreter does not exist in code.

4) **Storage is split-brain**
   - Persistence server uses per-project files (`data/projects/*.json`).
   - Some services write to monolithic stores (`data/*.json`) via `src/services/store.mjs`.
   - DS06 implies a single, clean, authoritative layout (it is not true).

5) **Tests and traceability tooling are out of sync**
   - `tests/tests.mjs` assumes a server API (`createApiHandler`, many endpoints) that is not implemented.
   - `traceability-check.mjs` requires DS19, but DS19 is explicitly reserved/not present.

### 2.3 Top 5 Actions (lowest effort → highest leverage)

- Update or quarantine the obsolete predicate-CNL examples (DS06, DS07, DS09, API schemas/examples).
- Decide: persistence-only server vs full processing API; then either implement or move/delete `docs/schemas/api/*`.
- Introduce a strict separation in code: browser-safe SDK modules vs Node-only adapters/CLI.
- Implement the DS12 Metrics Interpreter skeleton and port evaluation/verification into it (demo + Node share logic).
- Unify storage to a single canonical persistence model and define a migration path.

---

## 3) Repo Reality Snapshot (What Actually Works Today)

### 3.1 CNL toolchain

Implemented CNL capabilities:
- SVO statements, quotes, modifiers
- recursive `group begin/end`
- entity extraction + relationships + ownership
- constraints: `requires`, `forbids`, `must`, and `has tone/max/min`

Translation and verification:
- NL→CNL translation is rule-based and produces SVO outputs
- verification checks constraints against draft text with substring/heuristic matching (not scope-aware yet)

### 3.2 Server

`src/server.mjs` implements only:
- `GET /health`
- `/v1/projects` CRUD

Storage: individual JSON files under `data/projects/`.

### 3.3 Demo

`demo/index.html` is a UI prototype with:
- random project generation based on vocabulary lists
- partly simulated metrics (non-deterministic)
- CNL export and parsing via the core parser module

---

## 4) Design Spec Integrity Audit (Be Ruthless)

The DS set currently mixes:
- **normative specs** (“must/shall”, accurate and testable),
- **roadmaps** (“future considerations”), and
- **fiction** (claims about endpoints, storage, security that are contradicted by code or not implemented).

Recommended status per DS:

| DS | Status | What’s good | What’s wrong / outdated | Recommendation |
|----|--------|-------------|--------------------------|----------------|
| DS01 | Mostly solid | Vision matches demo direction | Patterns read as “ready” | Keep as vision; mark patterns as roadmap |
| DS02 | Mostly solid | Minimal persistence API matches `src/server.mjs` | Coexists with a large unimplemented API schema set | Keep; make “no processing APIs” explicit and reference DS24 |
| DS03 | Solid | Research framing + variants make sense | Metric definitions are duplicated by DS12–DS23 | Keep; point metric definitions to DS12–DS23 |
| DS04 | Mixed | SVO statements + groups largely match parser | Pattern system + variable binding not implemented; metric formulas conflict with DS13–DS23 | Trim to actual grammar+AST; move metrics to DS12–DS23; mark patterns as future |
| DS05 | Mixed | VSA/HDC story is plausible | “Implementation Architecture” does not match actual code shape; YAML config not actually loaded | Rewrite implementation section to match repo; isolate CLI from library modules |
| DS06 | Unreliable | Correct intention: file-based storage + audit + retention | Storage layout and data model do not match code; predicate CNL example is obsolete; security claims unvalidated | Rewrite from scratch: “Storage & Data Lifecycle (current)” + separate “Governance roadmap” |
| DS07 | Mixed | Use cases are reasonable | Still shows predicate CNL; generation pipeline mostly not implemented | Update CNL examples to SVO; label generation/evals as roadmap |
| DS08 | Needs update | Good index/terminology | Missing DS24; DS19 reserved but tooling expects it | Add DS24; clarify DS19 policy (reserved vs required) |
| DS09 | Mixed | UI concepts match demo direction | Predicate CNL in mockups; many panels are aspirational | Update CNL snippets to SVO; tag as roadmap where not present |
| DS10 | Mixed | Strong conceptual model for visual editor | Pattern system is aspirational | Keep; mark pattern features as not implemented |
| DS11 | Slightly stale | Correct unification direction | Checklist items are outdated; “historical” parts need clarity | Update checklist and “current state”; consider merging into DS04 appendix |
| DS12–DS23 | Good specs | Deterministic metric definitions + interpreter model are clear | Not implemented yet | Keep; drive implementation from these |
| DS24 | Helpful but inaccurate | Correct “persistence-only server” principle | Overstates browser-compatibility of all `src/` modules; claims removals not reflected | Clarify module tiers (SDK vs Node-only vs CLI); decide merge vs supersede |

---

## 5) Concrete Spec ↔ Code Mismatches (Current)

### 5.1 CNL documentation drift (SVO vs predicate)

SVO is the implemented dialect, but:
- DS06/DS07/DS09 still show predicate syntax.
- `docs/examples/api/cnl_validate_response.json` and `docs/schemas/api/cnl.json` still describe predicate “RULE(...)” outputs.

Action:
- update these docs to SVO, or move them to `docs/legacy/` with an explicit warning banner.

### 5.2 API surface mismatch (schemas/examples vs server)

Reality:
- server is persistence-only (`/v1/projects`, `/health`)

Docs:
- `docs/schemas/api/*` describes a much larger processing API (validate, plan, evaluate, verify, etc.)

Action (pick one):
- **Option A (recommended):** move processing schemas/examples to `docs/roadmap/api/` and keep only persistence schemas.
- **Option B:** implement those endpoints in a separate Node “eval server”, but keep `src/server.mjs` minimal.

### 5.3 Storage mismatch (two stores)

Current state:
- `src/storage/projects.mjs` stores projects per file (`data/projects/*.json`) and is used by servers.
- `src/services/store.mjs` maintains many monolithic stores under `data/*.json` and is used by audit/jobs/explainability.

Action:
- choose one canonical persistence strategy:
  - “single project JSON contains everything” (recommended for portability), or
  - “multiple store files” (requires migrations + referential integrity).
- refactor services to use the same adapter and document the migration.

### 5.4 Metrics mismatch (DS12–DS23 vs code + demo)

Current implementations diverge from the now-normative metric DS docs:

- `CS` (DS13): not implemented; `calculateCoherence()` uses text window similarity.
- `CAD` (DS14): implemented as variance of similarity, but windowing/normalization differ from DS14.
- `CAR` (DS15): computed from verification summary, not a true guardrail pass rate.
- `OI` (DS16): not implemented (demo simulates it).
- `EAP` (DS17): implemented as keyword sentiment; DS17 expects template correlation and/or mood alignment.
- `RQ` (DS18): no held-out query set evaluation harness.
- `CPSR` (DS20): measurable in principle (translator + parser exist), but semantic validation is not implemented.
- `CSA` (DS21): only naive substring checks; no scope-aware evidence.
- `XAI` (DS22): not captured; no survey capture/storage.
- `NQS` (DS23): current code defines NQS as automated composite; DS23 requires human ratings.

Action:
- stop letting the demo define metric behavior.
- implement DS12 interpreter and port:
  - verification → CSA plugin
  - evaluation → CS/CAD/CAR/OI/EAP/RQ plugins
  - NQS/XAI → human data ingestion + aggregation

### 5.5 Browser reuse is not guaranteed

DS02/DS24 claim “same modules work in browser and Node”. In practice:
- some `src/` modules are Node-only or have CLI side effects

Action:
- define module tiers and enforce them in layout:
  - `src/sdk/` (pure, browser-safe; no import-time side effects)
  - `src/node/` (fs/http/crypto adapters)
  - `src/cli/` (command-line tools)

### 5.6 Tooling/tests mismatch

- `tests/tests.mjs` assumes `createApiHandler` exists and that many non-persistence endpoints exist.
- `traceability-check.mjs` requires DS19 but DS19 is reserved/not present.

Action:
- either align tests with DS24’s persistence-only stance, or restore the “processing API” and implement it.

---

## 6) Suggested Simplifications (Cuts that Reduce Confusion)

1) Stop calling everything “CNL”.
   - Name it explicitly: **SVO CNL** (current).
   - Predicate-style artifacts, if kept, must live under `docs/legacy/`.

2) Collapse architecture docs.
   - Either merge DS24 into DS02 and delete DS24, or mark DS02 “API only” and DS24 “architecture only”.
   - Make exactly one document authoritative.

3) Rewrite DS06 as two documents.
   - “Storage & Migration (current)” with exact formats and file paths.
   - “Governance roadmap” clearly labeled as future and non-normative.

4) Move unimplemented API schemas to a “roadmap” folder.
   - Prevents engineers from implementing the wrong scope first.

---

## 7) What the Demo Still Hardcodes (Should Move to Core/Config Packs)

- Vocabularies (names, traits, arcs, blocks, actions) are hardcoded in JS modules.
- Random generation uses `Math.random()` (no seed) → non-reproducible.
- Several metrics are simulated in UI.

Action:
- centralize data under `src/configs/` (JSON packs)
- add deterministic PRNG utilities
- make demo “pure UI” over reusable core + configs

---

## 8) Implementation Backlog (Ordered)

P0 (docs correctness):
- Update DS06/DS07/DS09 CNL examples to SVO (or explicitly label them legacy).
- Update `docs/schemas/api/cnl.json` and API examples to match current SVO validate output, or move them to roadmap.

P1 (core/library integrity):
- Split SDK vs Node/CLI modules; remove import-time side effects from library entrypoints.
- Pick one persistence strategy and migrate.

P2 (metrics/generation correctness):
- Implement DS12 interpreter skeleton + DS13/DS14/DS21 first (CS/CAD/CSA).
- Replace demo simulated metrics with interpreter results.
- Add seeded generation modes (see `gpt52_poposal.md`) and make them deterministic.

