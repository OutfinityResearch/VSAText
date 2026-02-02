# DS13 — Metric Specification: Coherence Score (CS)

## 1. Purpose

Defines the **Coherence Score (CS)** metric as a deterministic function computed by the CNL Metrics Interpreter (DS12) over a single SVO CNL document.

Target property: long-range narrative coherence via entity tracking and causal chain verification (DS03).

## 2. Inputs

From interpreter context `ctx`:
- `ctx.world.scenes.ordered_ids` (timeline)
- `ctx.world.scenes[scene_id].refs` (referenced entities)
- `ctx.world.scenes[scene_id].events` (ordered events)
- `ctx.world.constraints` (requires/forbids/must/max/min/tone)
- `ctx.world.state` (derived world state if available)

## 3. Definitions

Let:
- Scenes `S = [s1, s2, …, sn]` in timeline order.
- For scene `s`:
  - `E(s)`: set of referenced entity IDs (characters, locations, objects) in `s`.
  - `V(s)`: set of “salient event verbs” in `s` (normalized).
  - `EV(s)`: set of normalized event tuples in `s`:
    - `e = (subj, verb, obj?, modifiers?)`

Normalization (normative):
- Casefold identifiers.
- Treat quoted identifiers as atomic.
- Resolve references (`@X`) to canonical entity name `X`.

## 4. Measurement Procedure (normative)

### 4.1 Entity Continuity (EC)

For each adjacent scene pair `(s_i, s_{i+1})` compute:
```text
EC_i = Jaccard(E(s_i), E(s_{i+1})) = |E∩| / |E∪|
```
Then:
```text
EC = average(EC_i) for i=1..n-1
```

### 4.2 Causal Chain Score (CC)

We approximate causal continuity with deterministic heuristics over events:

Define two verb sets (configurable by the host):
- `CAUSE_VERBS` (e.g., threatens, decides, reveals, betrays, destroys)
- `EFFECT_VERBS` (e.g., escapes, confronts, travels, resolves, is_defeated_by)

For each adjacent pair `(s_i, s_{i+1})`:
1) `shared = E(s_i) ∩ E(s_{i+1})`
2) `has_cause = exists e in EV(s_i) with e.verb in CAUSE_VERBS and e.subject in shared`
3) `has_effect = exists e in EV(s_{i+1}) with e.verb in EFFECT_VERBS and e.subject in shared`

Score:
```text
CC_i =
  1.0 if has_cause and has_effect
  0.7 if shared is non-empty and (has_cause or has_effect)
  0.4 if shared is non-empty
  0.0 otherwise
```

Then:
```text
CC = average(CC_i) for i=1..n-1
```

### 4.3 Logic Violation Penalty (LVP)

Count deterministic violations derived from interpreter semantic checks:
- orphan references (includes entity not declared)
- invalid ownership (owned object not declared)
- impossible location transitions if the interpreter tracks location state
- explicit constraint violations (forbids not respected) (CSA failures)

Let `v` be total violation count and `n` be scene count.

Penalty:
```text
LVP = min(1.0, v / max(1, n))
```

### 4.4 Final Coherence Score

Recommended weights:
- `w_ec = 0.50`
- `w_cc = 0.40`
- `w_lvp = 0.30`

Compute:
```text
CS = clamp(w_ec*EC + w_cc*CC - w_lvp*LVP, 0, 1)
```

## 5. Threshold

Acceptance threshold:
- `CS > 0.75`

## 6. Reporting (normative)

The metric report MUST include:
- `CS` value and pass/fail
- component values: `EC`, `CC`, `LVP`
- top violations contributing to penalty

## 7. Example (informative)

```text
Story has title "Stormbound"

Anna is protagonist
Marcus is character
Village is location

Book group begin
  Scene1 group begin
    Scene1 includes character Anna
    Scene1 includes location Village
    Anna decides "sail"
  Scene1 group end
  Scene2 group begin
    Scene2 includes character Anna
    Scene2 includes character Marcus
    Anna confronts Marcus
  Scene2 group end
Book group end
```

---

## 8. Related Documents

- DS03 — metric intent and thresholds
- DS12 — interpreter context and reporting
- DS21 — CSA (constraint violations contribute to LVP)

