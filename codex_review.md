# Codex Review — Open Decisions (Spec vs Implementation)

Date: 2026-02-05  
Repo: VSAText / SCRIPTA

This file intentionally tracks **only** items that still require human product/research decisions. Concrete implementation bugs and obvious spec-alignment fixes have been resolved and removed from this review.

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
