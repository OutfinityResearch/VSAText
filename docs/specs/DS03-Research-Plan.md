# DS03 Research Plan — SCRIPTA

## 1. Research Objectives
- Validate specification-driven co-creation versus prompt-only baselines.
- Measure the impact of verification and guardrails on narrative quality and compliance.
- Assess explainability and user trust in multi-agent workflows.

## 2. Research Questions
- RQ1: Does specification-first planning improve long-range coherence?
- RQ2: Do verification agents reduce character drift and plot inconsistency?
- RQ3: Do guardrails reduce bias and copyright risk without harming creativity?
- RQ4: Can explainability improve author trust and adoption?
- RQ5: Do VSA/HDC-based semantic indices outperform basic embedding baselines?
- RQ6: Does CNL translation reduce ambiguity and increase constraint satisfaction?

## 3. Hypotheses
- H1: Plan-and-write with explicit specs improves NQS by >= 25%.
- H2: Character Attribute Drift decreases by >= 50%.
- H3: Compliance Adherence Rate reaches >= 99.9%.
- H4: Explainability scores improve perceived control.

## 4. Methodology
- Mixed methods: quantitative metrics + qualitative expert reviews.
- Controlled comparisons across workflow variants:
  - Baseline prompting
  - Planning-only
  - Planning + verification
  - Planning + verification + guardrails
  - Planning + verification + guardrails + VSA/HDC
  - Planning + verification + guardrails + CNL

## 5. Data Strategy
- Curate narrative datasets for coherence, character traits, and emotional arcs.
- Build annotated datasets for bias, clichés, and stereotypes.
- Prepare evaluation corpora with deliberate inconsistencies.
- Create a CNL corpus with paired natural-language and validated CNL constraints.

## 6. Work Packages Alignment
- WP1: bias detection and fairness methods.
- WP2: privacy and data handling.
- WP3: efficient models and optimization.
- WP4: ethical frameworks and compliance.
- WP5: verification and explainability.
- WP6: IDE and MAS orchestration.
- WP7: SCRIPTA pilot use case validation.

## 7. Research Milestones
- M1: Baseline metrics and datasets finalized.
- M2: Planning and generation pipelines implemented.
- M3: Verification/guardrail integration and ablations.
- M4: Pilot writer study completed.
- M5: Final validation report and technology transfer summary.

## 8. Outputs
- Benchmark datasets and evaluation scripts.
- Comparative results for all workflow variants.
- Recommendations for ACHILLES feature evolution.
