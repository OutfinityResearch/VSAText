# DS03 — Research and Evaluation

## Research Goal

The core question: Does specification-driven narrative creation produce better results than simple prompting? SCRIPTA tests whether explicit planning, verification, and structured constraints improve coherence, reduce errors, and increase author productivity.

## Experimental Variants

We test six configurations to isolate what works:

| Variant | What's Included | What We Learn |
|---------|-----------------|---------------|
| A: Baseline | LLM with prompt only | Baseline performance |
| B: + Planning | Add narrative specification | Does planning help? |
| C: + Verification | Add coherence checking | Does verification catch errors? |
| D: Full Pipeline | Add guardrails (bias, clichés) | Full system with safety |
| E: + VSA | Use hyperdimensional vectors | VSA vs conventional embeddings |
| F: + CNL | Add formal constraint language | Do formal constraints improve satisfaction? |

All variants use identical prompts, seed stories, and settings. Only the active components differ.

## Key Metrics

| Metric | What It Measures | Target |
|--------|------------------|--------|
| NQS | Overall narrative quality | +25% vs baseline |
| Coherence (CS) | Plot consistency, entity tracking | > 0.75 |
| CAD | Character trait stability over text | < 0.15 |
| CAR | Guardrail pass rate | ≥ 99.9% |
| Originality (OI) | Distance from known tropes | > 0.8 |
| EAP | Emotional arc match to template | Correlation > 0.7 |
| CPSR | CNL parse success rate | ≥ 95% |
| CSA | Constraint satisfaction | ≥ 98% |

## Evaluation Types

**Coherence Stress Test** - Inject contradictions mid-story, measure how each variant handles them.

**Character Drift Test** - Define character traits, measure semantic drift across chapters.

**Emotional Arc Test** - Specify target arc, compare generated trajectory.

**Human Evaluation** - Writers complete tasks with each variant. Measure time-to-draft and satisfaction.

**Retrieval Benchmark** - Compare VSA vs conventional embeddings on recall and MRR.

## Success Criteria

The system succeeds if:
- NQS improves 25%+ over baseline
- Author time-to-draft drops 40%+
- Guardrail pass rate ≥ 99.9%
- Each component shows measurable value (no redundancy)
- Authors rate explainability ≥ 4/5

## Datasets

| Dataset | Purpose |
|---------|---------|
| Gold-standard narratives | Quality baseline comparison |
| Synthetic incoherence set | Test verification agents |
| Character-annotated novels | Test consistency tracking |
| Emotional arc dataset | Test arc generation |
| NL-CNL pairs | Test CNL translation (in docs/evals/) |

All datasets have documented provenance and licensing.
