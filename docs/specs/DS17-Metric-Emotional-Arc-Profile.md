# DS17 — Metric Specification: Emotional Arc Profile (EAP)

## 1. Purpose

**Emotional Arc Profile (EAP)** measures how well a story's emotional journey matches its intended arc. Good stories take readers on deliberate emotional journeys - tension builds, releases, builds again toward climax.

**Target: Pearson correlation r > 0.7** (higher is better)

## 2. What is an Emotional Arc?

An emotional arc is the pattern of emotional intensity across a story. Think of a graph where:
- X-axis = story progress (0% to 100%)
- Y-axis = emotional valence (negative to positive)

**Classic arc patterns include:**

| Pattern | Shape | Example |
|---------|-------|---------|
| **Rags to Riches** | Steady rise | Cinderella |
| **Tragedy** | Rise then fall | Hamlet |
| **Man in a Hole** | Fall then rise | A Christmas Carol |
| **Icarus** | Rise, fall, rise | Most Hollywood movies |

## 3. Key Concepts

### What is Valence?

**Valence** measures how positive or negative an emotion is:
- High valence (1.0): joy, triumph, love
- Neutral (0.5): calm, neutral, matter-of-fact
- Low valence (0.0): fear, anger, despair

Each mood in our vocabulary has a valence score.

**Valence mapping (normative)**
- Base emotion valence is mapped to `[0,1]`:
  - `positive` → `1.0`
  - `mixed` → `0.5`
  - `negative` → `0.0`
- If a scene uses a mood preset (e.g., `melancholic`, `triumphant`), the scene valence MUST be computed as the **weighted average** of its component emotions:
  - `valence(scene) = sum(valence(emotion) × intensity) / sum(intensity)`
- If a scene uses a mood entity `M1` with `has emotion <key> <intensity>` statements, use the same weighted-average rule over `M1`’s `emotions`.

### What is Pearson Correlation?

**Pearson correlation** measures how closely two sequences move together:
- r = 1.0: Perfect match (when one goes up, the other goes up)
- r = 0: No relationship
- r = -1.0: Perfect inverse (when one goes up, the other goes down)

We compare the target arc to the measured arc. A correlation of 0.7+ means the story follows the intended emotional journey.

### What is a Sentiment Lexicon?

A **sentiment lexicon** is a dictionary mapping words to valence scores:
- "triumph" → 0.9 (very positive)
- "walked" → 0.5 (neutral)
- "dread" → 0.1 (very negative)

When explicit mood tags aren't available, we estimate scene valence from word frequencies.

## 4. How EAP is Calculated

### Step 1: Build the Target Arc

Author specifies an arc template (e.g., "Rags to Riches"), which provides expected valence at each story point.

**Target templates (normative)**
- The host MUST support these default 10-point templates (values in `[0,1]`):
  - `rags_to_riches` (steady rise): `[0.2, 0.3, 0.35, 0.4, 0.5, 0.55, 0.6, 0.7, 0.75, 0.8]`
  - `tragedy` (rise then fall): `[0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.6, 0.4, 0.3, 0.2]`
  - `man_in_a_hole` (fall then rise): `[0.6, 0.5, 0.4, 0.35, 0.3, 0.25, 0.35, 0.5, 0.7, 0.8]`
  - `steady_fall` (steady fall): `[0.8, 0.75, 0.7, 0.6, 0.55, 0.5, 0.4, 0.35, 0.3, 0.2]`
- If no arc template is specified, the default MUST be `man_in_a_hole`.

### Step 2: Measure the Actual Arc

For each scene, calculate emotional valence:

**Preferred method (explicit moods):**
```text
M1 is mood
M1 has emotion tension 3
M1 has emotion fear 1

Sc1 has mood M1

Sc2 has mood triumphant
```
Look up valence from mood presets / mood entity emotions using the valence mapping rule above.

**Fallback method (text analysis):**
Count positive vs negative words in scene text using the sentiment lexicon.

### Step 3: Calculate Correlation

Align target and measured arcs (same number of points), then compute Pearson correlation.

```text
Correlation r = covariance(target, measured) / (std(target) × std(measured))
```

**Alignment rule (normative)**
- Target templates are 10 points by default.
- If the story has `n != 10` scenes, the measured arc MUST be resampled to 10 points:
  - downsample: average values inside 10 equal bins
  - upsample: linear interpolation between scene points

### Step 4: Normalize for Reporting

```text
EAP = (r + 1) / 2
```

This converts r from [-1, 1] to [0, 1] for consistent reporting.

## 5. Threshold

Acceptance threshold (normative):
- correlation: **`r > 0.7`**
- reported score: **`EAP >= 0.85`** (equivalent to `r > 0.7`)

---

## 7. Related Documents

- DS03 — metric intent and threshold
- DS12 — canonical text and scene ordering
