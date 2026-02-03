# DS13 — Metric Specification: Coherence Score (CS)

## 1. Purpose

The **Coherence Score (CS)** measures how well a story holds together as a unified narrative. A coherent story has consistent characters, logical cause-and-effect chains, and no contradictions.

Target: CS > 0.75 (higher is better)

## 2. What Makes a Story Coherent?

Coherence has three components:

**Entity Continuity (EC):** Characters and locations that appear in one scene should logically connect to adjacent scenes. If Anna is in the forest in Scene 1, she shouldn't suddenly be at the castle in Scene 2 without explanation.

**Causal Chains (CC):** Events should have causes and effects. If Marcus threatens Anna in Scene 1, we expect consequences in Scene 2 (Anna confronts him, escapes, etc.). Stories without cause-effect feel random.

**Logic Violations (LVP):** Errors like referencing characters who don't exist, impossible location jumps, or contradicting established facts.

## 3. How It's Measured

### 3.1 Entity Continuity (EC)

**Jaccard Similarity** measures how much two sets overlap. For two adjacent scenes, we compare which entities appear in each:

```text
EC = (entities in both scenes) / (entities in either scene)
```

**Example:**
- Scene 1 has: Anna, Marcus, Forest
- Scene 2 has: Anna, Castle

Overlap = {Anna} = 1 entity
Combined = {Anna, Marcus, Forest, Castle} = 4 entities
EC = 1/4 = 0.25

We average EC across all scene pairs.

### 3.2 Causal Chain Score (CC)

We look for cause-effect patterns between scenes using verb categories:

**Cause verbs:** threatens, decides, reveals, betrays, destroys
**Effect verbs:** escapes, confronts, travels, resolves, is_defeated_by

For each scene pair:
- Full score (1.0): A character performs a cause verb, then that same character experiences an effect verb
- Partial score (0.7): Characters overlap and at least one pattern is present
- Minimal score (0.4): Characters overlap but no clear cause-effect
- Zero (0.0): No character overlap at all

### 3.3 Logic Violation Penalty (LVP)

Count errors like:
- Referencing undefined characters ("Marcus" used but never declared)
- Invalid ownership ("Anna owns SilverKey" but SilverKey doesn't exist)
- Impossible location transitions without travel events
- Constraint violations (story "forbids violence" but contains violence)

Penalty increases with more violations relative to story length.

### 3.4 Final Score

```text
CS = 0.50 × EC + 0.40 × CC - 0.30 × LVP
```

The score is clamped to [0, 1].
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

## 4. Inputs (Technical)

From interpreter context `ctx`:
- `ctx.world.scenes.ordered_ids` - list of scenes in story order
- `ctx.world.scenes[scene_id].refs` - entities referenced in each scene
- `ctx.world.scenes[scene_id].events` - actions that happen in each scene
- `ctx.world.constraints` - rules the story must follow

## 5. Threshold

Acceptance threshold: **CS > 0.75**

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

