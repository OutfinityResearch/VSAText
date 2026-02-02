# DS23 — Metric Specification: Narrative Quality Score (NQS)

## 1. Purpose

Defines **Narrative Quality Score (NQS)** as a composite of:
- automated Coherence Score (CS) and
- human expert review

This aligns with DS03: “Entity-based coherence plus average of 3 expert ratings (1–5)”.

## 2. Inputs

From interpreter context and evaluation suite:
- automated `CS` result (DS13)
- human ratings (3 raters):
  - coherence (H_CO), character integrity (H_CH), style/readability (H_ST), ethical integrity (H_ET), overall (H_OV)

At minimum, NQS MUST include:
- `CS`
- `H_OV` (overall) averaged across 3 raters

## 3. Definition (normative)

### 3.1 Normalize human overall rating

Let `H_OV` be in `{1,2,3,4,5}`.

Normalize to `[0,1]`:
```text
H = (mean(H_OV) - 1) / 4
```

### 3.2 Composite NQS

Recommended equal weighting:
```text
NQS = 0.5 * CS + 0.5 * H
```

Alternative weighting (if justified by experiments):
```text
NQS = alpha * CS + (1 - alpha) * H
```
with default `alpha = 0.5`.

## 4. Measurement Procedure (normative)

Per artifact:
1) Compute `CS` via interpreter.
2) Collect 3 independent rater overall scores.
3) Compute `H` and `NQS`.

Per variant:
- compute mean NQS across tasks/cases:
```text
mean_NQS(variant) = average_case NQS(case)
```

## 5. Threshold (DS03) — “+25% vs Variant A”

Let:
- `A` be baseline variant
- `X` be the evaluated variant

Relative improvement:
```text
improvement = (mean_NQS(X) - mean_NQS(A)) / mean_NQS(A)
```

Acceptance threshold:
- `improvement >= 0.25`

The evaluation MUST also report statistical significance and effect size (DS12).

## 6. Reporting (normative)

The report MUST include:
- per-case NQS, CS, and human rating mean/std
- per-variant mean NQS and 95% CI
- delta vs baseline + effect size (Cohen’s d)

---

## 7. Related Documents

- DS03 — research goals and thresholds
- DS12 — human evaluation protocol and statistics
- DS13 — CS definition

