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

### Step 2: Measure the Actual Arc

For each scene, calculate emotional valence:

**Preferred method (explicit moods):**
```text
Scene1 has mood Tense
Scene2 has mood Triumphant
```
Look up valence from mood vocabulary.

**Fallback method (text analysis):**
Count positive vs negative words in scene text using the sentiment lexicon.

### Step 3: Calculate Correlation

Align target and measured arcs (same number of points), then compute Pearson correlation.

```text
Correlation r = covariance(target, measured) / (std(target) × std(measured))
```

### Step 4: Normalize for Reporting

```text
EAP = (r + 1) / 2
```

This converts r from [-1, 1] to [0, 1] for consistent reporting.

## 5. Threshold

Acceptance threshold: **Correlation r > 0.7**

---

## 7. Related Documents

- DS03 — metric intent and threshold
- DS12 — canonical text and scene ordering

