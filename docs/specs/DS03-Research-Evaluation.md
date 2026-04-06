<!-- {"achilles-ide-document":{"id":"L1ZTQVRleHQvZG9jcy9zcGVjcy9EUzAzLVJlc2VhcmNoLUV2YWx1YXRpb24ubWQ=","title":"DS03-Research-Evaluation","version":1,"updatedAt":"2026-04-02T10:41:02.828Z"}} -->
<!-- {"achilles-ide-chapter":{"id":"chapter-7bea8621-37a1-4d68-8a04-4938975ec599","title":"DS03 — Research and Evaluation","anchorId":"chapter-chapter-7bea8621-37a1-4d68-8a04-4938975ec599"}} -->
<a id="chapter-chapter-7bea8621-37a1-4d68-8a04-4938975ec599"></a>
# DS03 — Research and Evaluation
<!-- {"achilles-ide-paragraph":{"id":"paragraph-668fdbb9-d215-4777-9b45-e56049b0a9eb","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-4103718f-d5bb-4e90-816a-8618bba47e97","title":"Purpose","anchorId":"chapter-chapter-4103718f-d5bb-4e90-816a-8618bba47e97"}} -->
<a id="chapter-chapter-4103718f-d5bb-4e90-816a-8618bba47e97"></a>
## Purpose
<!-- {"achilles-ide-paragraph":{"id":"paragraph-acff8859-5963-45f1-b186-b41b6571f7b5","type":"markdown","title":"Paragraph 1"}} -->
This document defines the research framing and evaluation protocol for SCRIPTA. Its role is to explain what the project is trying to prove, which system variants are compared, how performance is measured, and what outcomes count as success.

The document treats SCRIPTA as a specification-driven, multi-agent workflow for narrative creation rather than as a single text generation model.

This document is intentionally high-level. It defines the research logic and evaluation structure, while leaving implementation details outside its scope.


<!-- {"achilles-ide-chapter":{"id":"chapter-e31a52db-7d3a-419b-bdcd-c05b652cd1dc","title":"Research","comments":{"collapsed":true},"anchorId":"chapter-chapter-e31a52db-7d3a-419b-bdcd-c05b652cd1dc"}} -->
<a id="chapter-chapter-e31a52db-7d3a-419b-bdcd-c05b652cd1dc"></a>
## Research
<!-- {"achilles-ide-paragraph":{"id":"paragraph-d2eb6912-ba41-4329-8870-c75e71f8ef96","type":"markdown","title":"Paragraph 1"}} -->

<!-- {"achilles-ide-paragraph":{"id":"paragraph-bda84e76-0c26-4f28-a9a8-73a4f74ad1f8","type":"markdown","title":"Paragraph 1"}} -->
The research goal is to determine whether specification-driven narrative creation produces better results than direct prompt-only generation.

The main research question is:

Does a specification-oriented, verified, and guardrail-enabled workflow improve narrative quality, compliance, and author productivity compared to a baseline LLM workflow?

The evaluation is guided by the following hypotheses:

- H1: Specification-driven planning improves narrative quality compared to prompt-only generation.
- H2: Verification improves coherence and reduces character drift.
- H3: Guardrails improve compliance and reduce ethical or legal risk.
- H4: Explainability and audit outputs improve trust and perceived control.
- H5: The full SCRIPTA workflow reduces author effort and improves time-to-draft.


<!-- {"achilles-ide-chapter":{"id":"chapter-0fa37851-c53c-4dca-b03c-6ac9e971e22b","title":"Experimental Variants","anchorId":"chapter-chapter-0fa37851-c53c-4dca-b03c-6ac9e971e22b"}} -->
<a id="chapter-chapter-0fa37851-c53c-4dca-b03c-6ac9e971e22b"></a>
### Experimental Variants
<!-- {"achilles-ide-paragraph":{"id":"paragraph-af36f86b-f62d-4000-a553-ef17f934d70f","type":"markdown","title":"Paragraph 1"}} -->
We test six configurations to isolate what works:

| Variant | What's Included | What We Learn |
|---------|------------------|---------------|
| A: Baseline | LLM with prompt only | Baseline performance |
| B: + Planning | Add narrative specification | Does planning help? |
| C: + Verification | Add coherence checking | Does verification catch errors? |
| D: + Guardrails | Add bias, originality, and compliance checks | Do guardrails reduce risk? |
| E: + Explainability | Add explanations and audit outputs | Do explanations improve trust and usability? |
| F: Full Pipeline | Planning, verification, guardrails, explainability, optional research/reverse engineering | Does the full workflow perform best overall? |

All variants MUST use the same prompts, story briefs, seed stories, and comparable generation settings. Only the active components differ.


<!-- {"achilles-ide-chapter":{"id":"chapter-3c5cf087-de90-418a-831a-1317277799de","title":"Evaluation","comments":{"collapsed":true},"anchorId":"chapter-chapter-3c5cf087-de90-418a-831a-1317277799de"}} -->
<a id="chapter-chapter-3c5cf087-de90-418a-831a-1317277799de"></a>
## Evaluation
<!-- {"achilles-ide-paragraph":{"id":"paragraph-01221d0f-542a-4b89-854e-103f7f296d47","type":"markdown","title":"Paragraph 1"}} -->

<!-- {"achilles-ide-paragraph":{"id":"paragraph-179fd2bf-f780-4b51-8aff-1be34b49389d","type":"markdown","title":"Paragraph 1"}} -->
The purpose of evaluation is to measure whether SCRIPTA improves the quality, safety, and usability of AI-assisted narrative creation. Evaluation is not limited to text quality alone. It also measures consistency, originality, compliance, explainability, and author productivity.


<!-- {"achilles-ide-chapter":{"id":"chapter-f6c4c1f4-2256-45cf-9962-9cbe3fa21ce5","title":"Evaluation Types","anchorId":"chapter-chapter-f6c4c1f4-2256-45cf-9962-9cbe3fa21ce5"}} -->
<a id="chapter-chapter-f6c4c1f4-2256-45cf-9962-9cbe3fa21ce5"></a>
### Evaluation Types
<!-- {"achilles-ide-paragraph":{"id":"paragraph-1a70bb84-a813-4bc5-99c3-774c32837e2e","type":"markdown","title":"Paragraph 1"}} -->
| Evaluation Type | Evaluates | Main Outputs |
|-----------------|-----------|--------------|
| **Coherence Stress Test** | Injected contradictions and continuity issues to test detection and correction capability | Coherence Score, error detection rate, failure analysis |
| **Character Drift Test** | Stability of character attributes across scenes | Character Attribute Drift (CAD), consistency metrics |
| **Emotional Arc Test** | Alignment between generated and target emotional progression | Emotional Arc Profile, pacing alignment |
| **Human Evaluation** | Real user assessment of generated narratives in practical tasks | NQS, Explainability Score, satisfaction, perceived control |
| **Compliance & Originality Review** | Ethical compliance, plagiarism risk, stereotypes, originality | CAR, OI, TOP, alignment signals |
| **Productivity Test** | Efficiency of producing usable drafts and required editing effort | AEG, completion time, revision count |
| **Retrieval Benchmark** | Quality of retrieval in narrative-aware search tasks | Retrieval quality, relevance, coverage |


<!-- {"achilles-ide-chapter":{"id":"chapter-54569c97-e30e-4cd3-95d9-d875da45041a","title":"Key Metrics","anchorId":"chapter-chapter-54569c97-e30e-4cd3-95d9-d875da45041a"}} -->
<a id="chapter-chapter-54569c97-e30e-4cd3-95d9-d875da45041a"></a>
### Key Metrics
<!-- {"achilles-ide-paragraph":{"id":"paragraph-faa7ac22-0f5a-4542-becd-38365ce16849","type":"markdown","title":"Paragraph 1"}} -->
The following metrics are used as the primary evaluation overview.

| Metric | What It Measures | Target |
|--------|------------------|--------|
| NQS | Overall narrative quality | +25% vs baseline |
| CS | Coherence and structural consistency | > 0.75 |
| CAD | Character trait stability over text | < 0.15 |
| CAR | Compliance pass rate | >= 99.9% |
| OI | Originality and distance from known tropes | > 0.80 |
| EAP | Emotional arc quality and target alignment | Correlation > 0.70 |
| CPSR | CNL parse success rate | >= 95% |
| XAI | Human-rated explainability | >= 4.0 / 5.0 |
| AEG | Productivity improvement over baseline workflow | >= 0.40 |
| RQ | Retrieval usefulness on story queries | MRR > 0.60 |


<!-- {"achilles-ide-chapter":{"id":"chapter-d350ffbe-1d08-4f30-b43c-a92c71426cf3","title":"Success Criteria","anchorId":"chapter-chapter-d350ffbe-1d08-4f30-b43c-a92c71426cf3"}} -->
<a id="chapter-chapter-d350ffbe-1d08-4f30-b43c-a92c71426cf3"></a>
### Success Criteria
<!-- {"achilles-ide-paragraph":{"id":"paragraph-b9c25602-3ea9-4df5-a5c4-9df94ab8f9f4","type":"markdown","title":"Paragraph 1"}} -->
The evaluation is considered successful when the full SCRIPTA pipeline demonstrates clear value over the baseline in both automated and human-centered measures.

Success means all of the following are true:

- narrative quality improves meaningfully over prompt-only generation
- verification-enabled variants outperform non-verification variants on coherence and drift tests
- guardrail-enabled variants reduce risky outputs without making the workflow unusable
- authors produce usable drafts faster than in the baseline workflow
- explanations are understandable and useful to human users
- compliance performance reaches production-level expectations

At minimum, the following thresholds SHOULD be met:

- NQS improves by at least 25% over baseline
- AEG reaches or exceeds 40%
- CAR reaches or exceeds 99.9%
- XAI reaches at least 4.0 / 5.0

Success MUST also be supported by qualitative review and failure analysis. Strong average scores are not sufficient if critical failure cases remain unresolved.


<!-- {"achilles-ide-chapter":{"id":"chapter-994b6062-f311-4b65-aa91-6cc0d96c942f","title":"Datasets","anchorId":"chapter-chapter-994b6062-f311-4b65-aa91-6cc0d96c942f"}} -->
<a id="chapter-chapter-994b6062-f311-4b65-aa91-6cc0d96c942f"></a>
### Datasets
<!-- {"achilles-ide-paragraph":{"id":"paragraph-00d7b5a6-fa2e-43da-9f83-b4072f3d61d0","type":"markdown","title":"Paragraph 1"}} -->
| Dataset | Purpose |
|---------|---------|
| Story Brief Set | Common input set used across all variants |
| Gold-Standard Narratives | Human-written reference stories for comparison of structure and quality |
| Synthetic Incoherence Set | Contradiction-heavy and stress-test cases for verification and coherence evaluation |
| Character-Annotated Narratives | Stories annotated for character traits, relations, and stability over time |
| Emotional Arc Set | Narratives with known emotional progression patterns used for arc comparison |
| Human Evaluation Set | Balanced output sample selected for expert review |
| Retrieval Query Set | Story-aware queries with known relevant matches for retrieval evaluation |

All datasets SHOULD have documented provenance, scope, and licensing status.
