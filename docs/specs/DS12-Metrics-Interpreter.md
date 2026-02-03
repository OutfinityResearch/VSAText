# DS12 — Metrics Interpreter and Evaluation Suite (SVO CNL)

## 1. Purpose

The **SCRIPTA Metrics Interpreter** takes a CNL document and calculates quality scores. Think of it like a compiler that reads source code and produces output, except here the "output" is a set of quality metrics rather than executable code.

The interpreter is **deterministic**, meaning the same input always produces the same output. This is crucial for reproducible research and consistent evaluation.

This document covers:
- How the interpreter processes CNL documents
- How individual metrics are computed
- How to run evaluation experiments comparing different system variants

## Key Concepts Explained

Before diving into the technical details, here are the important concepts:

**AST (Abstract Syntax Tree):** A tree-structured representation of the CNL document. Instead of storing raw text, the parser converts it into a hierarchy of nodes (entities, groups, statements) that the computer can analyze efficiently.

**Deterministic:** Given the same input and seed value, the interpreter always produces identical output. No randomness affects the results.

**Ablation Study:** An experiment where you systematically disable components to measure their individual contribution. We test variants A through F, each adding one more feature, to see which components actually improve quality.

**Plugin Model:** Metrics are implemented as separate modules that plug into the interpreter. Each metric receives the parsed document and returns a score. This makes it easy to add new metrics without changing the core interpreter.

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

Some metrics require human judgment. This section defines how to collect and analyze human ratings consistently.

### 7.1 Rating Dimensions

Three independent raters score each artifact on a 1-5 scale (1 = very poor, 5 = excellent):

| Dimension | What Raters Evaluate |
|-----------|---------------------|
| Coherence (H_CO) | Does the plot make sense? Are events logically connected? |
| Character Integrity (H_CH) | Do characters act consistently with their established traits? |
| Style & Readability (H_ST) | Is the writing clear and engaging? |
| Ethical Integrity (H_ET) | Is the content free from harmful stereotypes or bias? |
| Overall (H_OV) | Overall impression of narrative quality |

### 7.2 Rater Assignment Rules

Each artifact must be rated by 3 independent raters who don't know which system variant produced the text. This "blinding" prevents bias from expectations about which variant should perform better.

### 7.3 Measuring Rater Agreement (Cohen's Kappa)

**What is Cohen's Kappa?** It measures how much two raters agree beyond what we'd expect by chance. A score of 0 means agreement equals chance; 1 means perfect agreement.

**Why weighted?** Because some disagreements matter more than others. Rating something 1 vs 5 is a bigger disagreement than 3 vs 4. Quadratic weighting penalizes larger gaps more heavily.

The formula calculates the ratio of actual agreement to expected agreement:
```text
kappa_w = 1 - (observed_disagreement / expected_disagreement)
```

We require kappa >= 0.6, which researchers consider "substantial agreement."

### 7.4 Handling Disagreements

If two raters disagree by more than 2 points (e.g., one rates 2, another rates 5), they discuss the artifact together with a moderator. The goal isn't to change scores, but to understand why they interpreted it differently. These discussions are documented separately from the raw ratings.

## 8. Statistical Analysis

When comparing variants, we need statistical tools to determine if differences are real or just noise.

### 8.1 ANOVA (Analysis of Variance)

**What is ANOVA?** A statistical test that compares the average scores of multiple groups (our variants) to see if at least one differs significantly from the others.

**How it works:** ANOVA compares the variation between groups (do variants have different averages?) to variation within groups (how much do individual scores vary?). If between-group variation is much larger than within-group variation, the differences are likely real.

**Output:**
- **F-statistic:** Higher values suggest larger differences between variants
- **p-value:** If p < 0.05, we conclude the differences are statistically significant

### 8.2 Effect Size (Cohen's d)

**What is effect size?** Statistical significance tells you if an effect exists; effect size tells you how big it is. A tiny improvement might be statistically significant with enough data, but not practically meaningful.

**Cohen's d** measures how many standard deviations apart two groups are:
```text
d = (mean_X - mean_A) / pooled_standard_deviation
```

**Interpretation:**
- d = 0.2 is a "small" effect
- d = 0.5 is a "medium" effect
- d = 0.8+ is a "large" effect

For SCRIPTA, we want d >= 0.5 to claim meaningful improvement.

### 8.3 Confidence Intervals

A confidence interval gives a range where the true value probably lies. A "95% CI of [0.72, 0.81]" means we're 95% confident the true score is between 0.72 and 0.81.

We use **bootstrap resampling**: randomly sample the data thousands of times with replacement, compute the statistic each time, and report the middle 95% of values. This works well even when data isn't normally distributed.

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

