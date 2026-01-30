# DS04 Experiments — SCRIPTA

## 1. Experiment Matrix
Each experiment compares workflow variants across standardized tasks and datasets.

### Variant A: Prompt-only baseline
- Single LLM prompt for story generation.

### Variant B: Specification + planning
- Narrative spec + plan graph + scene-level generation.

### Variant C: Spec + planning + verification
- Add coherence/consistency checks with corrective feedback loops.

### Variant D: Spec + planning + verification + guardrails
- Add bias, cliché, originality, and copyright checks.

### Variant E: Spec + planning + verification + guardrails + VSA/HDC
- Replace semantic indexing and retrieval with VSA/HDC-based methods.

### Variant F: Spec + planning + verification + guardrails + CNL
- Add CNL translation and validation to enforce constraints at algorithm input.

## 2. Experiment Types

### 2.1 Coherence Stress Test
- Inject conflicting facts into mid-story instructions.
- Measure entity-based coherence and logic violations.

### 2.2 Character Drift Test
- Define explicit character traits and goals.
- Measure semantic drift across chapters.

### 2.3 Emotional Arc Test
- Specify target arc templates.
- Compare generated arcs to templates.

### 2.4 Originality & Bias Test
- Use a trope-heavy prompt set.
- Measure cliché frequency and stereotype indicators.

### 2.5 Human-in-the-loop Efficiency
- Writers complete tasks with each variant.
- Measure time to publishable draft and subjective satisfaction.

### 2.6 Semantic Retrieval Benchmarks
- Compare basic embeddings vs VSA/HDC on retrieval tasks (recall@k, MRR).

### 2.7 CNL Constraint Satisfaction
- Measure how often generated outputs satisfy explicit constraints after CNL translation.

## 3. Experimental Controls
- Same prompts, same seed story briefs.
- Same token budgets and temperature for fair comparison.
- Use standardized SOPs per variant.

## 4. Metrics Collected
- NQS, CAD, CAR, OI, Explainability Score.
- Latency and cost per 1k tokens.
- Human ratings for readability and narrative quality.
- Retrieval quality (MRR, recall@k) for Basic vs VSA/HDC.
- CNL Parse Success Rate and Constraint Satisfaction Accuracy.

## 5. Statistical Analysis
- ANOVA across variants per metric.
- Effect sizes with confidence intervals.
- Inter-rater agreement for human evaluations.

## 6. Deliverables
- Experiment protocols.
- Results tables and plots.
- Error analysis and failure case catalog.
