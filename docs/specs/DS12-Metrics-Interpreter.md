# DS12 — Metrics Interpreter and Evaluation Suite (SVO CNL)

## 1. Purpose

This document specifies the **SCRIPTA Metrics Interpreter**: a deterministic interpreter that “executes” a single **SVO CNL** document and produces a machine-readable evaluation report containing the primary metrics from DS03.

This DS is implementation-oriented:
- Formalizes inputs/outputs
- Defines the execution model for SVO CNL
- Defines how metrics are computed as interpreter plugins
- Defines the evaluation suite protocol (variants, datasets, human review, statistics)

## 2. Scope and Assumptions

### 2.1 Scope

This DS defines the **metric runtime** and **evaluation protocol**, not the UI.

### 2.2 Assumptions

- The canonical language is **SVO CNL** (see `docs/specs/DS04-CNL-Specification.md` and `docs/specs/DS11-CNL-Unification.md`).
- A CNL document may contain:
  - specification (entities, constraints, structure)
  - artifact content (scene descriptions and/or events)
- The interpreter must be runnable in:
  - Node.js (for batch evaluation)
  - Browser (for real-time UI feedback)

### 2.3 Non-goals

- Natural language translation to CNL (measured by CPSR but not defined here as an algorithm).
- LLM-based scoring inside metrics (metrics are deterministic).

## 3. Interpreter Interface

### 3.1 Inputs

The interpreter consumes:
- `cnl_text` (string): one complete SVO CNL document.
- `options` (object):
  - `seed` (integer): deterministic seed for any stochastic components (default `42`).
  - `profile` (string): implementation profile (e.g., `basic`, `vsa`) affecting embeddings.
  - `metric_set` (string[]): list of metric codes to compute.
  - `corpora` (object): optional references for OI and RQ:
    - `tropes` (array): curated trope corpus entries
    - `retrieval_queries` (array): query set with relevance labels
  - `strict` (boolean): treat semantic warnings as failures for CPSR if true.

### 3.2 Outputs

The interpreter produces:
- `ast`: parsed AST from the CNL parser (structure as per DS11).
- `diagnostics`: parse and semantic diagnostics.
- `world`: derived world state model (entities, scenes, events, constraints, text).
- `metrics`: computed metric results (per-metric details + aggregate summary).

### 3.3 Output schema (normative)

```json
{
  "interpreter_version": "1.0",
  "profile": "vsa",
  "seed": 42,
  "cnl_hash": "sha256:…",
  "diagnostics": {
    "parse": { "valid": true, "errors": [], "warnings": [] },
    "semantic": { "valid": true, "errors": [], "warnings": [] }
  },
  "world": {
    "entities": { "count": 0, "by_type": {} },
    "scenes": { "count": 0, "ordered_ids": [] },
    "events": { "count": 0, "by_scene": {} },
    "constraints": { "count": 0, "by_type": {} },
    "texts": { "token_count": 0, "by_scene": {} }
  },
  "metrics": {
    "results": [
      { "code": "CS", "value": 0.81, "threshold": 0.75, "pass": true, "details": {} }
    ],
    "summary": {
      "pass": true,
      "failed": [],
      "computed_at": "2026-02-02T00:00:00Z"
    }
  }
}
```

## 4. CNL Execution Model

### 4.1 Parsing

The interpreter MUST parse the CNL with the unified SVO parser (DS11) and produce:
- groups (hierarchy)
- statements (SVO)
- extracted entities, relationships, ownership, references, constraints

### 4.2 Statement classification (normative)

Each statement is classified into exactly one category:

1) **Declaration**: `X is Y`
2) **Property**: `X has P V` (including `has trait`, `has tone`, `has title`, etc.)
3) **Inclusion**: `Group includes <type> Entity`
4) **Relationship**: `X relates to Y as R`
5) **Ownership**: `X owns Y`
6) **Reference**: `X references @Y`
7) **Constraint**: `requires`, `forbids`, `must`, `has max`, `has min`
8) **Description**: `X describes "text"` (artifact text)
9) **Event**: any other verb interpreted as narrative action/event

### 4.3 Scope and time

The interpreter MUST treat the ordered traversal of groups as the canonical timeline:
- A `scene` group is an atomic time unit.
- Events inside a scene are ordered by appearance.
- If chapters exist, they provide higher-level scope for constraints.

Scene identification rule (normative):
- A group is a scene if it has `has type scene`, or if its name matches `Scene`/`Sc` conventions, or if configured by the host.

### 4.4 Derived world state

Interpreter MUST derive:
- `EntityRegistry`: entity records keyed by canonical name.
- `SceneList`: ordered scenes with:
  - referenced entities (`includes`)
  - local properties (mood, title, INT/EXT, time-of-day, etc.)
  - event list
  - concatenated text from `describes`
- `ConstraintList`: constraints with resolved scope (global / chapter / scene).
- `KnowledgeGraph`: relationships + ownership edges.

### 4.5 Canonical text for metrics

Many metrics require text. The interpreter MUST construct a canonical text representation:
- `scene_text(scene)`: concat of all `describes "..."` in that scene.
- If no `describes` exists, the interpreter SHOULD synthesize text from events:
  - `Subject verb object modifiers.` per event.
- `document_text`: concat of scene texts in timeline order.

## 5. Metric Runtime (Plugin Model)

### 5.1 Metric codes

Primary metric codes:
- `NQS`, `CS`, `CAD`, `CAR`, `OI`, `EAP`, `XAI`, `RQ`, `CPSR`, `CSA`

### 5.2 Metric plugin interface (normative)

Each metric module MUST expose:
- `code`: string
- `version`: string
- `compute(ctx) -> { value, threshold, pass, details }`

Where `ctx` includes:
- parsed AST and diagnostics
- world state
- corpora (optional)
- profile + seed + parameters

Metrics MUST be deterministic given the same inputs and seed.

## 6. Evaluation Suite Protocol

### 6.1 Variants

Evaluation runs compare workflow variants (DS03 ablation study), e.g.:
- Variant A: baseline (no spec-driven planning/verification)
- Variant B: spec + planning
- Variant C: spec + planning + verification
- Variant D: full pipeline + guardrails
- Variant E: full pipeline + VSA/HDC
- Variant F: full pipeline + CNL tooling improvements

### 6.2 Evaluation case format (recommended)

Each case is an object:
```json
{
  "case_id": "case_001",
  "domain": "book",
  "variant": "C",
  "seed": 42,
  "cnl_text": "…SVO CNL…",
  "expected": {
    "constraints": [],
    "retrieval": []
  }
}
```

### 6.3 Running the suite (normative)

For each `case`:
1) Run the interpreter and compute metrics.
2) Persist the report (including metric versions and parameters).
3) If human evaluation is enabled, collect rater scores and attach them.

## 7. Human Evaluation Protocol (for NQS and XAI)

### 7.1 Rubric dimensions (1–5 scale)

Human ratings MUST use an ordinal 1–5 scale with anchors:
- **Coherence (H_CO)**: plot consistency, causal logic
- **Character Integrity (H_CH)**: trait/motivation consistency
- **Style & Readability (H_ST)**: clarity, rhythm, readability
- **Ethical Integrity (H_ET)**: bias/stereotypes/harmful content
- **Overall (H_OV)**: overall narrative quality

### 7.2 Rater assignment

- Each artifact MUST be rated by 3 independent raters.
- Raters MUST be blind to variant labels.

### 7.3 Inter-rater reliability (weighted Cohen’s kappa)

For each dimension, compute **quadratic weighted Cohen’s kappa** between each rater pair, then average.

Definitions:
- Ratings in `{1,2,3,4,5}`
- Weight matrix:
  - `w_ij = ((i - j) / (k - 1))^2`, where `k = 5`

Weighted kappa:
```text
kappa_w = 1 - (sum_ij w_ij * O_ij) / (sum_ij w_ij * E_ij)
```
Where `O_ij` is observed agreement matrix, `E_ij` expected by chance.

Acceptance recommendation:
- `kappa_w >= 0.6` for “substantial agreement”

### 7.4 Disagreement resolution

If pairwise disagreement exceeds 2 points on any dimension, a moderated discussion MUST occur and produce an adjudicated note (kept separate from raw ratings).

## 8. Statistical Analysis

### 8.1 ANOVA (one-way)

For each metric, run one-way ANOVA across variants:
- Null hypothesis: equal means.
- Report `F`, `p`, and effect sizes.

### 8.2 Effect size (Cohen’s d)

For pairwise comparisons (Variant X vs A):
```text
d = (mean_X - mean_A) / s_pooled
s_pooled = sqrt(((n_X - 1)*s_X^2 + (n_A - 1)*s_A^2) / (n_X + n_A - 2))
```

### 8.3 Confidence intervals

Report 95% confidence intervals for means and deltas using bootstrap resampling (recommended for non-normal distributions).

## 9. Acceptance Thresholds (from DS03)

The suite MUST apply these thresholds:
- `CS > 0.75`
- `CAD < 0.15`
- `CAR >= 0.999`
- `OI > 0.8`
- `EAP correlation > 0.7`
- `XAI >= 4/5`
- `RQ MRR > 0.6`
- `CPSR >= 0.95`
- `CSA >= 0.98`
- `NQS` must improve by `>= 25%` vs Variant A (see DS23 for formula).

## 10. Related Documents

- DS03 — Research Framework and Evaluation Methodology
- DS04 — CNL Specification
- DS05 — VSA/HDC Specification
- DS11 — CNL Unification and Migration Guide
- DS13..DS18, DS20..DS23 — Metric definitions

