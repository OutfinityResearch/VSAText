# DS23 — Metric Specification: Narrative Quality Score (NQS)

## 1. Purpose

**Narrative Quality Score (NQS)** is the master metric that combines automated analysis with human judgment to measure overall story quality.

**Target: NQS must improve by >= 25% vs baseline**

## 2. Why NQS Combines Human + Machine

Neither automated metrics nor human ratings alone tell the whole story:

**Automated metrics (Coherence Score)**:
- Consistent and reproducible
- Can analyze every document
- Misses subjective qualities like "engagement" or "beautiful prose"

**Human ratings**:
- Capture nuanced quality judgments
- Expensive and slow to collect
- Can vary between raters

NQS combines both: half the score comes from automated coherence analysis, half from expert human ratings.

## 3. The Two Components

### 3.1 Coherence Score (CS)

Calculated automatically by the interpreter (see DS13). Measures entity tracking, causal chains, and logic violations.

### 3.2 Human Overall Rating (H_OV)

Three independent raters score the overall narrative quality on a 1-5 scale. We take their average and normalize to 0-1:

```text
H = (average_rating - 1) / 4
```

**Why subtract 1 and divide by 4?** To convert the 1-5 scale to 0-1:
- Rating 1 → H = 0
- Rating 3 → H = 0.5
- Rating 5 → H = 1.0

## 4. NQS Formula

```text
NQS = 0.5 × CS + 0.5 × H
```

Equal weighting ensures neither component dominates.

**Example:**
- CS = 0.82 (automated coherence score)
- Human ratings: 4, 4, 5 → average = 4.33 → H = 0.83
- NQS = 0.5 × 0.82 + 0.5 × 0.83 = 0.825

## 5. Success Threshold

The threshold is relative, not absolute. We measure improvement over the baseline (Variant A - simple prompting without specification):

```text
improvement = (NQS_new - NQS_baseline) / NQS_baseline
```

**Target: improvement >= 25%**

**Example:**
- Baseline NQS (Variant A) = 0.60
- Full system NQS (Variant D) = 0.78
- Improvement = (0.78 - 0.60) / 0.60 = 0.30 = 30% (passes!)

## 6. Statistical Requirements

We must also show the improvement is statistically significant:
- Report 95% confidence intervals
- Report effect size (Cohen's d)
- A large effect (d >= 0.8) with p < 0.05 is strong evidence

---

## 7. Related Documents

- DS03 — research goals and thresholds
- DS12 — human evaluation protocol and statistics
- DS13 — CS definition
