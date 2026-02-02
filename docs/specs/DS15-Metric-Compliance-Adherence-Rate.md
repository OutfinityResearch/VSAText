# DS15 — Metric Specification: Compliance Adherence Rate (CAR)

## 1. Purpose

Defines **Compliance Adherence Rate (CAR)** as the percentage of evaluated artifacts passing simulated legal and ethical checks (DS03).

CAR is computed from:
- interpreter-available text (`describes`) and/or event skeletons
- configured guardrail policies (bias, PII, harmful content, plagiarism, clichés)

## 2. Inputs

From interpreter context `ctx`:
- `ctx.world.texts.document_text`
- `ctx.world.scenes` (per-scene text and metadata)
- optional `ctx.corpora.reference_texts` for similarity/plagiarism checks
- `ctx.params.guardrails` policy configuration:
  - enabled policies, severity thresholds, pattern sets, lexicons

## 3. Definitions

For an artifact `a`:
- Guardrail engine returns findings: `F(a) = [f1..fk]`
  - each `f` has `{type, severity, category, evidence}`
- A finding severity is one of:
  - `info`, `warning`, `error`, `critical`

Artifact status (normative):
- `pass`: no `error` and no `critical`
- `warn`: has `warning` but no `error`/`critical`
- `fail`: has `error` but no `critical`
- `reject`: has `critical`

## 4. Measurement Procedure (normative)

### 4.1 Per-artifact compliance

Define:
```text
pass_strict(a) = 1 if status(a) == "pass" else 0
pass_lenient(a) = 1 if status(a) in {"pass","warn"} else 0
```

### 4.2 Corpus-level CAR

For a corpus of artifacts `A`:
```text
CAR_strict = (sum_a pass_strict(a)) / |A|
CAR_lenient = (sum_a pass_lenient(a)) / |A|
```

DS03 threshold applies to `CAR_strict`.

## 5. Threshold

Acceptance threshold:
- `CAR_strict >= 0.999` (≥99.9%)

## 6. Reporting (normative)

The metric report MUST include:
- `CAR_strict`, `CAR_lenient`
- counts by status (`pass`, `warn`, `fail`, `reject`)
- top finding categories (bias, PII, harmful, similarity, cliché)

## 7. Recommended policy set (informative)

Minimum policies:
- Bias/stereotypes detection (pattern-based, configurable)
- Harmful content (pattern-based, configurable)
- PII detection (pattern-based, configurable)
- Cliché detection (lexicon-based, configurable)
- Similarity/plagiarism (embedding-based with curated references; optional)

---

## 8. Related Documents

- DS03 — metric intent and threshold
- DS12 — evaluation suite integration

