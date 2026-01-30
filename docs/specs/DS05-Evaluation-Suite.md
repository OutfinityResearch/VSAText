# DS05 Evaluation Suite — SCRIPTA

## 1. Purpose
Define a reproducible suite for evaluating narrative quality, compliance, and trustworthiness.

## 2. Metrics
- Narrative Quality Score (NQS): composite coherence + human review.
- Coherence Score (CS): entity-based coherence + logic penalty.
- Character Attribute Drift (CAD): semantic deviation from specified traits.
- Compliance Adherence Rate (CAR): pass rate in legal/ethical checks.
- Originality Index (OI): semantic distance from known tropes.
- Emotional Arc Profile (EAP): similarity to target arc patterns.
- Explainability Score: human rating of system explanations.
- Retrieval Quality (RQ): recall@k and MRR for semantic search.
- CNL Parse Success Rate (CPSR): % of NL inputs converted to valid CNL.
- Constraint Satisfaction Accuracy (CSA): % of outputs meeting CNL constraints.

## 3. Human Evaluation Rubrics
- Coherence: 1–5 scale (plot consistency and causal logic).
- Character integrity: 1–5 scale (trait consistency).
- Style and readability: 1–5 scale.
- Ethical integrity: 1–5 scale (bias and harmful stereotypes).

## 4. Datasets
- Gold-standard human-authored narratives.
- Synthetic incoherence test set.
- Character-annotated novels dataset.
- Stereotype-annotated datasets for bias detection.
- Emotional arc dataset for narrative trajectory evaluation.
- Evals NL↔CNL pairs in docs/evals/scripta_nl_cnl.jsonl.

## 5. Evaluation Protocol
- Run automated metrics on all generated outputs.
- Sample 20% for human review with multiple raters.
- Report inter-rater reliability and disagreements.

## 6. Reporting
- Dashboard for KPI tracking over time.
- Per-agent performance diagnostics.
- Audit log linkage for reproducibility.
- Compare Basic vs VSA/HDC runs with identical prompts and specs.

## 7. Acceptance Thresholds
- NQS: +25% vs baseline.
- CAD: below threshold X per 10k tokens.
- CAR: >= 99.9%.
- Explainability Score: >= 4/5.
