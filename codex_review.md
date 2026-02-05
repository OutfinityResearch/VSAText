# Codex Review — Open Decisions (Spec vs Implementation)

Date: 2026-02-05  
Repo: VSAText / SCRIPTA

This file intentionally tracks **only** items that still require human product/research decisions. Concrete implementation bugs and obvious spec-alignment fixes have been resolved and removed from this review.

---

## D1) Are DS12–DS23 metrics normative or aspirational?

**Context**
- Current SDK computes a **heuristic metric suite** (see `src/evaluate/*`, `src/services/evaluation.mjs`).
- DS12–DS23 specify a **full interpreter runtime** + normative formulas, several requiring external corpora or human ratings.

**Decision needed**
Choose one:
- **A. Normative:** DS12–DS23 are requirements the code must implement.
- **B. Aspirational:** DS12–DS23 are research targets; the implemented metrics are “v0.1 heuristic”.

**My recommendation (B)**
- Mark DS12–DS23 as **Aspirational** and add a new “Implemented Metrics (v0.1)” spec series (e.g., `DS12b…DS23b` or `DS12-v0.1`).
- Add a small mapping table: `DSxx (spec)` → `metric implemented` → `known differences/limits` to prevent research-claim drift.

**If you choose (A), proposed implementation path**
1) Create `src/interpreter/` with a stable world model schema + deterministic plugin runner + output schema (hashes, per-metric versioning).
2) Port metrics one by one to match DS13–DS23 formulas and scaling.
3) Add golden tests derived from DS examples.

---

## D2) Pattern system scope (DS01 / DS04)

**Context**
- DS04 describes variables/templates/binds for patterns.
- Current implementation stores patterns as library entities but does not expand templates/variables into structure/events.

**Decision needed**
- Implement a **real pattern runtime** (variables, template blocks, instantiation), or
- Narrow the spec to **“patterns as tags/constraints”** for v0.1.

**My recommendation**
Implement a minimal Pattern MVP:
- Parser: support `P1 has variable $x as type`, `P1 has template begin/end`, `Sc1 uses pattern P1`, `Sc1 binds $x to Anna`.
- Serializer/generator: expand patterns into concrete SVO statements **deterministically** during serialization (or as a preprocessing pass).
- Defer advanced features (nested patterns, conditionals, loops).

---

## D3) Interpreter runtime / world model (DS12)

**Context**
- DS12 specifies a world model + plugin interface + per-metric versioning.
- Current evaluation is direct AST heuristics + VSA text heuristics.

**Decision needed**
Build DS12 runtime now, or keep the lighter pipeline.

**My recommendation**
Build a thin world model layer first and adapt existing heuristics to consume it:
- Entities, scenes, refs, events, constraints, texts.
- Once in place, decide whether to implement the DS13–DS23 normative formulas.
