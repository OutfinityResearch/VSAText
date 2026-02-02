# DS21 — Metric Specification: Constraint Satisfaction Accuracy (CSA)

## 1. Purpose

Defines **Constraint Satisfaction Accuracy (CSA)** as the percentage of outputs satisfying constraints expressed in SVO CNL (DS03).

Constraints are first-class statements in SVO CNL (DS11):
- `X requires "Y"`
- `X forbids "Y"`
- `X must <action> <target>`
- `X has tone <value>`
- `X has max <what> <count>`
- `X has min <what> <count>`

CSA is computed by the interpreter by evaluating these constraints against the executed world state and scene texts.

## 2. Inputs

From interpreter context `ctx`:
- `ctx.world.constraints` (typed constraints with scope resolution)
- `ctx.world.scenes` (per-scene refs, events, text)
- `ctx.world.entities` (declared entities)
- `ctx.params.constraint_matching`:
  - tokenization rules, alias maps, fuzzy matching parameters

## 3. Definitions

Let the constraint set be `K = {k1..kn}`.

Each constraint `k` yields a boolean outcome:
- `sat(k) = 1` if satisfied
- `sat(k) = 0` otherwise

CSA:
```text
CSA = (sum_k sat(k)) / n
```

## 4. Constraint Semantics (normative)

### 4.1 Scope resolution

Each constraint has a scope subject `X`:
- if `X` is a scene group → evaluate on that scene only
- if `X` is a chapter group → evaluate on all descendant scenes
- if `X` is `Story`/`World` → evaluate globally on the whole document

### 4.2 `requires "Y"`

Satisfied if `Y` appears in scope by at least one of:
- token match in scope text
- presence as an entity referenced in scope (character/location/object includes)
- presence as an event object/description in scope

### 4.3 `forbids "Y"`

Satisfied if `Y` does not appear in scope by the same detection rules.

### 4.4 `must action target`

Satisfied if within scope exists at least one event matching:
- verb equals `action`
- and (if `target` provided) object/modifier matches `target`

### 4.5 `has tone value`

Satisfied if:
- the scope declares `has tone value`, OR
- text-based tone heuristic passes (lexicon match above threshold).

### 4.6 `has max/min`

Example:
- `Story has max characters 10`

Satisfied if the counted items in scope respect the limit:
- `count_characters(scope) <= 10`

## 5. Measurement Procedure (normative)

1) Parse constraints into typed objects.
2) Resolve scope to a set of scenes.
3) For each constraint, compute satisfaction and collect evidence.
4) Compute CSA and store per-constraint results.

## 6. Threshold

Acceptance threshold:
- `CSA >= 0.98`

## 7. Reporting (normative)

The report MUST include:
- CSA value
- per-constraint outcomes:
  - scope
  - satisfied (boolean)
  - evidence: scene IDs and evidence snippets (or event IDs)
- counts by constraint type

---

## 8. Related Documents

- DS03 — metric intent and threshold
- DS11 — SVO constraints syntax
- DS12 — interpreter scope model

