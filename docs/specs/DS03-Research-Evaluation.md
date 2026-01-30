# DS03 — Research Framework and Evaluation Methodology

## 1. Research Objectives and Questions

The SCRIPTA research program aims to validate whether specification-driven co-creation produces measurably better outcomes than prompt-only approaches. This is not merely an engineering question but a scientific inquiry into the fundamental capabilities and limitations of different paradigms for human-AI creative collaboration.

The primary research objective is to validate whether the specification-first approach genuinely improves narrative coherence, compliance, and author productivity compared to conventional LLM usage. Secondary objectives include measuring the impact of verification and guardrail agents on output quality, assessing whether explainability features increase author trust and adoption, and comparing hyperdimensional computing (VSA/HDC) methods against conventional embedding-based approaches for semantic operations.

These objectives translate into six specific research questions. The first question asks whether specification-first planning improves long-range narrative coherence. We hypothesize that explicit plans reduce plot holes and character inconsistencies because the system has a persistent reference point against which to check generated content. The second question asks whether verification agents reduce character drift and plot contradictions. The third question investigates whether guardrails can reduce bias and copyright risk without harming creativity—a critical balance since overly aggressive filtering might reject valid creative choices. The fourth question examines whether explainability features improve author trust and adoption. The fifth question compares VSA/HDC-based semantic indices against conventional embedding baselines. The sixth question tests whether CNL translation reduces ambiguity and increases constraint satisfaction rates.

These questions are structured to isolate variables. By testing each component both independently and in combination, we can determine not just whether the complete system works, but which components contribute most to observed improvements and whether any components are redundant or counterproductive.


## 2. Experimental Design and Methodology

The experimental approach uses a controlled comparison across workflow variants. Each variant adds or removes specific components, allowing us to measure the marginal contribution of each feature. This design is called an "ablation study" in machine learning research—we systematically remove components to understand their individual impact.

The following table describes the six experimental variants and their components.

| Variant | Components Included | Purpose |
|---------|--------------------| --------|
| A: Baseline | Single LLM with prompt only | Establishes baseline performance without SCRIPTA features |
| B: Spec + Planning | Narrative specification and plan generation | Tests whether explicit planning alone improves coherence |
| C: Spec + Planning + Verification | Adds coherence and consistency checking with feedback loops | Tests whether verification catches and corrects errors |
| D: Full Pipeline | Adds bias, cliché, originality, and copyright guardrails | Tests complete SCRIPTA system with all safety features |
| E: Full Pipeline + VSA | Replaces conventional embeddings with hyperdimensional methods | Tests whether VSA/HDC improves semantic operations |
| F: Full Pipeline + CNL | Adds CNL translation and validation for constraint enforcement | Tests whether formal constraints improve satisfaction rates |

Each variant is tested on identical tasks using the same prompts, seed story briefs, token budgets, and temperature settings to ensure fair comparison. We use standardized SOPs per variant so that the only difference is the presence or absence of specific components.

The experimental methodology combines quantitative metrics with qualitative expert review. Quantitative metrics are computed automatically on all generated outputs, providing objective measurements at scale. Qualitative review involves sampling 20% of outputs for evaluation by multiple human raters, providing insight into aspects that automated metrics may miss, such as emotional resonance or literary style.

Seven specific experiment types are planned. The Coherence Stress Test injects conflicting facts into mid-story instructions to measure how well each variant handles contradictions. The Character Drift Test defines explicit character traits and goals, then measures semantic drift across chapters. The Emotional Arc Test specifies target arc templates and compares generated arcs against them. The Originality and Bias Test uses trope-heavy prompts to measure cliché frequency and stereotype indicators. The Human-in-the-Loop Efficiency test has writers complete tasks with each variant, measuring time to publishable draft and subjective satisfaction. The Semantic Retrieval Benchmark compares basic embeddings versus VSA/HDC on retrieval tasks using recall@k and mean reciprocal rank. The CNL Constraint Satisfaction test measures how often generated outputs satisfy explicit constraints after CNL translation.


## 3. Metrics and Evaluation Criteria

A reproducible evaluation suite requires precisely defined metrics. Each metric has a formal definition, a measurement procedure, and acceptance thresholds that define success.

The following table presents the primary metrics used for SCRIPTA evaluation.

| Metric | Definition | Measurement | Threshold |
|--------|------------|-------------|-----------|
| Narrative Quality Score (NQS) | Composite of automated coherence score plus human review | Entity-based coherence plus average of 3 expert ratings (1-5) | +25% vs Variant A |
| Coherence Score (CS) | Entity-based coherence combined with logic violation penalty | Automated analysis using entity tracking and causal chain verification | Above 0.75 |
| Character Attribute Drift (CAD) | Semantic deviation of character traits from specification | Cosine distance between defined and inferred trait embeddings per 10k tokens | Below 0.15 |
| Compliance Adherence Rate (CAR) | Percentage passing simulated legal and ethical checks | Guardrail pass rate across evaluation corpus | ≥99.9% |
| Originality Index (OI) | Semantic distance from known tropes and clichés | Embedding distance from curated trope corpus | Above 0.8 |
| Emotional Arc Profile (EAP) | Similarity of generated arc to target literary patterns | Vector comparison of emotional trajectory against templates | Correlation above 0.7 |
| Explainability Score | Author rating of explanation quality | Post-task Likert scale survey | ≥4/5 average |
| Retrieval Quality (RQ) | Precision of semantic search results | Recall@k and mean reciprocal rank on held-out queries | MRR above 0.6 |
| CNL Parse Success Rate (CPSR) | Percentage of natural language successfully converted to valid CNL | Parser success rate on diverse input corpus | ≥95% |
| Constraint Satisfaction Accuracy (CSA) | Percentage of outputs satisfying CNL constraints | Automated constraint checking on generated text | ≥98% |

Human evaluation uses structured rubrics to ensure consistency across raters. Coherence is rated on a 1-5 scale assessing plot consistency and causal logic. Character integrity is rated 1-5 for trait consistency throughout the narrative. Style and readability are rated 1-5. Ethical integrity is rated 1-5 for bias and harmful stereotypes. Inter-rater reliability is computed using Cohen's kappa, with disagreements resolved through discussion.

Statistical analysis employs ANOVA (analysis of variance) across variants for each metric, with effect sizes computed using Cohen's d and 95% confidence intervals reported. For human evaluations, inter-rater agreement is measured and reported alongside the mean scores.


## 4. Data Requirements and Governance

The evaluation framework requires curated datasets for different testing purposes. These datasets must be carefully constructed to provide valid benchmarks while respecting legal and ethical constraints.

The following table describes the required datasets and their characteristics.

| Dataset | Purpose | Characteristics | Source |
|---------|---------|-----------------|--------|
| Gold-standard narratives | Baseline for quality comparison | Human-authored stories with expert coherence ratings | Licensed literary works plus public domain |
| Synthetic incoherence set | Testing verification agents | Stories with deliberately introduced plot holes and contradictions | Constructed by researchers |
| Character-annotated novels | Testing character consistency | Full-length works with expert annotation of character traits | Licensed works with manual annotation |
| Stereotype-annotated corpus | Testing bias detection | Text samples annotated for stereotypes and harmful content | Publicly available research datasets |
| Emotional arc dataset | Testing arc generation | Stories with mapped emotional trajectories and reception data | EmotionArcs dataset or equivalent |
| NL-CNL pairs | Testing CNL translation | Natural language constraints paired with validated CNL equivalents | Constructed by researchers, stored in docs/evals/ |

Data governance follows the principle of data minimization. Only data necessary for the specific evaluation purpose is collected and retained. Author inputs and generated outputs remain property of the author, while system-generated reports and audit logs are managed according to configurable retention policies per tenant.

All training data sources are documented with licensing information. Public domain works are clearly identified. Licensed contemporary content has explicit permission records. Evaluation datasets have documented provenance. PII (personally identifiable information) detection and redaction is applied before storage, and strong encryption protects data at rest and in transit.


## 5. Validation Protocol and Success Criteria

The validation protocol defines how the research findings translate into actionable conclusions about SCRIPTA's fitness for purpose. It specifies participant recruitment, task design, and the criteria that determine whether the system has achieved its goals.

Pilot writers are recruited from two sources: external professional authors with publication credits, and internal evaluators from the project team. Each participant receives training on the platform and then completes scenario-based tasks using different workflow variants. Tasks are designed to exercise all major functionalities and specifically test goals such as copyright compliance and editorial consistency.

The scenario-based tasks include short story generation (3,000-5,000 words) to test complete workflow, screenplay outline development to test planning capabilities, and research-assisted technical tutorial to test research agent integration. Each participant completes tasks across multiple variants to enable within-subject comparisons.

Trustworthy AI assessment includes adversarial testing with prompts designed to bypass guardrails, evaluating system resilience against attempts to generate biased or harmful content. Comparison between basic and VSA variants tests whether hyperdimensional methods provide superior protection against semantic manipulation.

Success is defined by achieving the threshold values for all primary KPIs: NQS improvement of 25% or more versus baseline, AEG time reduction of 40% or more, CAR of 99.9% or higher, CAD below the defined threshold, and Explainability Score of 4/5 or higher. Secondary success criteria include positive qualitative feedback on control and transparency, and demonstration that each major component contributes measurable value (no component is redundant).

The validation report documents findings and recommendations, providing input for WP6/WP7 refinement. It includes quantitative results with statistical analysis, qualitative themes from participant feedback, identified failure modes and their frequency, recommendations for system improvement, and assessment of readiness for production deployment.
