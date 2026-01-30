# DS01 — SCRIPTA Vision & Strategic Goals

## Document Purpose

This document defines the **vision**, **strategic goals**, and **success criteria** for SCRIPTA: a specification-driven, trustworthy AI co-creation system for creative writing within the ACHILLES IDE.

**Audience**: Project stakeholders, developers, researchers, and evaluators who need to understand *what* SCRIPTA aims to achieve and *why*.

---

## 1. The Problem We Are Solving

### 1.1 Current State of AI in Creative Writing

Large Language Models (LLMs) have become powerful text generators, but their application to creative writing reveals fundamental limitations:

#### Narrative Drift
LLMs struggle to maintain consistency across long texts. A character described as "shy and introverted" in chapter 1 may inexplicably become "bold and outgoing" by chapter 10. This happens because:
- LLMs have limited context windows (typically 4K-128K tokens)
- They lack explicit memory of character states and plot decisions
- Each generation step is probabilistically independent

**Example of the problem:**
```
Chapter 1: "Elena never spoke in meetings. She preferred to observe."
...
Chapter 15: "Elena dominated the boardroom discussion, her voice 
            commanding attention from everyone present."
```
Without explicit tracking, the LLM "forgot" Elena's defining trait.

#### Legal and Ethical Risks
- **Copyright**: LLMs trained on copyrighted works may reproduce protected content
- **Bias**: Training data contains societal biases that manifest in generated text
- **Provenance**: No audit trail exists for AI contributions vs. human authorship

#### Lack of Controllability
Current LLM tools treat creative writing as "prompt in → text out" without:
- Explicit specifications of what the story *must* contain
- Verification that generated content *actually* matches intent
- Explanations of *why* certain creative choices were made

### 1.2 Why This Matters

For **authors**: Lost productivity fixing AI-introduced inconsistencies, legal exposure from undetected plagiarism, and frustration with uncontrollable outputs.

For **publishers**: Financial risk from copyright claims, reputational damage from biased content, and inability to verify human authorship claims.

For **readers**: Lower quality narratives with plot holes, repetitive patterns, and emotionally flat arcs.

---

## 2. Vision Statement

> SCRIPTA provides a **trustworthy AI co-creation environment** where authors define narrative intent as **executable specifications**, and specialized agents **generate, verify, and justify** outputs with **full auditability** and **compliance safeguards**.

### 2.1 What This Means in Practice

| Traditional LLM Approach | SCRIPTA Approach |
|-------------------------|------------------|
| "Write me a story about..." | Define characters, rules, constraints as formal spec |
| Hope the output is consistent | Verify output against spec, flag violations |
| Black box generation | Explainable decisions with audit trail |
| Single monolithic model | Specialized agents for planning, generation, verification |
| Trust the output | Compliance checks for bias, originality, copyright |

---

## 3. Strategic Goals

### Goal 1: Specification-First Creativity

**What**: Authors define stories as structured specifications—not just prompts—including characters, plot constraints, world rules, and thematic requirements.

**Why it should work**: Research on "plan-and-write" approaches (Yao et al., 2019) demonstrates that explicit planning before generation improves narrative coherence. By formalizing the plan, we can also *verify* it.

**Example**:
```
NarrativeSpec: "The Storm Within"
├── Characters
│   ├── Anna: courageous, protective, goal=save brother
│   └── Marcus: vulnerable, hopeful
├── Constraints
│   ├── RULE: Scene 3 must include a storm
│   ├── RULE: Tone must remain hopeful
│   └── RULE: No supernatural elements
├── Structure: three-act
└── Themes: courage, family, redemption
```

**Limitations**:
- Authors must learn to express intent as specifications (learning curve)
- Over-specification may constrain creativity
- Specifications cannot capture all nuances of artistic vision

### Goal 2: Multi-Agent Orchestration

**What**: Instead of one LLM doing everything, specialized agents handle planning, generation, verification, and review—orchestrated via SOP Lang.

**Why it should work**: Division of labor allows each agent to be optimized for its task. A verification agent can be deterministic and rule-based, while a generation agent leverages LLM fluency. This separation also enables independent testing and improvement.

**Example workflow**:
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Planning   │───▶│  Generation  │───▶│Verification │
│   Agent     │    │    Agent     │    │    Agent    │
└─────────────┘    └──────────────┘    └──────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
   [Plan]             [Draft]            [Report]
                                              │
                          ┌───────────────────┘
                          ▼
                    ┌───────────┐
                    │ Guardrail │
                    │   Agent   │
                    └───────────┘
```

**Limitations**:
- Coordination overhead between agents
- Error propagation: a bad plan leads to bad generation
- Complexity in debugging multi-step failures

### Goal 3: Verification and Compliance

**What**: Continuously check generated content against the specification, detecting:
- Character trait drift
- Plot contradictions
- Bias and stereotypes
- Originality concerns (cliché, potential plagiarism)

**Why it should work**: By making constraints explicit (via CNL—Controlled Natural Language), we can programmatically verify them. Unlike LLMs that "guess" consistency, verification agents can provide mathematical certainty for specific checks.

**Example verification**:
```
Constraint: CHARACTER(Anna). TRAIT(Anna, courageous).

Generated text: "Anna cowered in the corner, too afraid to move."

Verification result:
  ⚠️ TRAIT VIOLATION: "cowered" and "afraid" contradict "courageous"
  Semantic similarity to trait: 0.23 (threshold: 0.60)
  Recommendation: Revise or justify temporary fear.
```

**Limitations**:
- Semantic verification is imperfect (false positives/negatives)
- Not all constraints are formalizable
- May reject valid creative choices (e.g., character growth)

### Goal 4: Transparent Provenance and Audit

**What**: Every generation, verification, and edit is logged with immutable audit entries linking inputs → decisions → outputs.

**Why it should work**: The U.S. Copyright Office requires evidence of human authorship. An audit log demonstrating human specification, human review, and human acceptance provides defensible provenance. It also enables debugging and accountability.

**Example audit entry**:
```json
{
  "event_type": "GENERATION_COMPLETED",
  "timestamp": "2026-01-30T14:00:00Z",
  "actor": "generation_agent_v1.2",
  "inputs": {
    "plan_id": "plan_abc123",
    "scene_id": "scene_7"
  },
  "outputs": {
    "draft_id": "draft_xyz789",
    "token_count": 1247
  },
  "human_approved": false,
  "signature": "sha256:abc123..."
}
```

**Limitations**:
- Log storage costs scale with usage
- Immutability requires cryptographic infrastructure
- Audit logs don't prove *quality*, only *process*

### Goal 5: Dual Algorithm Implementations (Basic vs VSA/HDC)

**What**: Core algorithms (semantic search, memory indexing, constraint matching) have two implementations:
- **Basic**: Standard embeddings and rule-based methods
- **VSA/HDC**: Hyperdimensional computing for potentially superior semantic operations

**Why it should work**: VSA (Vector Symbolic Architectures) offer mathematically grounded operations (binding, bundling, similarity) that may outperform dense embeddings for structured semantic tasks. By implementing both, we can empirically compare.

**Example**:
```
Task: Track character state across chapters

Basic approach:
  - Store character embedding
  - Compute cosine similarity with new mentions
  - Flag drift when similarity < threshold

VSA approach:
  - Encode character as hypervector
  - Bind traits as additional hypervectors
  - Unbind to query specific traits
  - Measure similarity in hyperdimensional space
```

**Limitations**:
- VSA/HDC is less mature than embedding-based approaches
- Performance gains are not guaranteed
- Implementation complexity is higher

### Goal 6: Controlled Natural Language (CNL)

**What**: A formal language layer that translates natural language constraints into unambiguous, machine-checkable statements.

**Why it should work**: Natural language is ambiguous. "Anna should be brave" could mean many things. CNL provides precision:

```
Natural Language: "Anna should be brave and protect her brother"
        ↓
CNL: CHARACTER(Anna).
     TRAIT(Anna, courageous).
     GOAL(Anna, protect, "brother").
```

**Limitations**:
- CNL cannot express all literary nuances
- Translation from NL to CNL may hallucinate
- Authors may resist learning CNL syntax

---

## 4. Non-Goals (Explicit Exclusions)

To avoid scope creep, SCRIPTA explicitly does **not** aim to:

1. **Replace human authorship**: SCRIPTA is a co-creation tool, not an autonomous writer
2. **Automate editorial judgment**: Human review remains essential
3. **Train foundation models**: Focus is on orchestration and evaluation, not model training
4. **Produce commercial UI**: Prototype workflows only (initially)
5. **Support multimodal generation**: Text only (images, video are future extensions)

---

## 5. Success Criteria (KPIs)

### 5.1 Narrative Quality Score (NQS)
**Definition**: Composite score combining automated coherence metrics with human expert ratings.
**Target**: +25% improvement vs. baseline LLM prompting.
**Measurement**: Automated coherence score + average of 3 expert ratings (1-5 scale).

### 5.2 Author Efficiency Gain (AEG)
**Definition**: Reduction in time to produce a publishable first draft.
**Target**: 40% time reduction.
**Measurement**: Timed writing tasks comparing SCRIPTA vs. traditional methods.

### 5.3 Compliance Adherence Rate (CAR)
**Definition**: Percentage of generated works passing simulated legal/ethical checks.
**Target**: ≥99.9%.
**Measurement**: Guardrail check pass rate across evaluation corpus.

### 5.4 Character Attribute Drift (CAD)
**Definition**: Semantic deviation of character traits from specification over long text.
**Target**: Below threshold X per 10,000 tokens.
**Measurement**: Cosine distance between specified and inferred trait embeddings.

### 5.5 Explainability Score
**Definition**: Author rating of system explanation quality.
**Target**: ≥4/5 average in pilot writer feedback.
**Measurement**: Post-task survey with Likert scale questions.

---

## 6. Risk Analysis

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Coherence improvements insufficient | High | Medium | Plan-and-write + formal verification + iterative refinement |
| Compliance agents produce false positives | Medium | High | Calibrated thresholds, human-in-loop review, tunable sensitivity |
| Legal ambiguity despite audit log | High | Medium | Maintain detailed provenance metadata, consult legal counsel |
| CNL too restrictive for creative expression | Medium | Medium | Allow freeform alongside CNL, iterative grammar expansion |
| VSA/HDC underperforms vs. basic methods | Low | Medium | Run both in parallel, use empirical results to guide adoption |

---

## 7. ACHILLES Platform Alignment

SCRIPTA leverages these ACHILLES platform features:

| ACHILLES Feature | SCRIPTA Use |
|------------------|-------------|
| SOP Lang | Orchestrate multi-agent creative workflows |
| Specification-Driven Structure | Encode narrative specs as formal artifacts |
| MAS Orchestration | Coordinate planning, generation, verification agents |
| Compliance Layer | Audit logging, provenance, compliance reports |
| Formal Verification Integration | Check outputs against CNL constraints |
| XAI Methods (WP5) | Explain agent decisions and suggestions |

---

## 8. Roadmap

### Phase 1: Foundation (Months 1-3)
- Specification-driven planning workflows
- Basic generation and verification agents
- CNL prototype

### Phase 2: Integration (Months 4-6)
- Full pipeline: plan → generate → verify → guardrail
- VSA/HDC implementation alongside basic
- Audit logging infrastructure

### Phase 3: Evaluation (Months 7-9)
- Evaluation suite with all metrics
- Pilot writer studies
- Ablation experiments (which components add value?)

### Phase 4: Hardening (Months 10-12)
- Compliance reporting and auditability
- Performance optimization
- Documentation and transfer

---

## 9. References

[1] Yao, Z., et al. (2019). Plan-and-Write: Towards Better Automatic Storytelling. AAAI. https://ojs.aaai.org/index.php/AAAI/article/view/4726

[2] U.S. Copyright Office. Copyright and Artificial Intelligence. https://www.copyright.gov/ai/

[3] UNESCO. Recommendation on the Ethics of Artificial Intelligence. https://www.unesco.org/en/artificial-intelligence/recommendation-ethics

[4] Chakrabarty, T., et al. (2024). Plot holes, repetition and sense of an ending: A qualitative analysis of common generation errors in large language models. arXiv:2402.10224.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-30 | SCRIPTA Team | Initial comprehensive version |
