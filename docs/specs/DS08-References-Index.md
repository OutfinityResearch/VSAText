# DS08 — References and Document Index

## 1. Document Set Overview

The SCRIPTA Design Specifications (DS) form a coherent documentation set that defines the vision, architecture, and implementation approach for the system. Each document addresses a specific aspect of the system while maintaining consistent terminology and cross-references to related documents.

The following table provides an index of all DS documents with their scope and primary audience.

| Document | Title | Scope | Primary Audience |
|----------|-------|-------|------------------|
| DS01 | Vision and Strategic Goals | Why SCRIPTA exists, what problems it solves, success criteria | All stakeholders, project sponsors |
| DS02 | System Architecture and API | Technical architecture, API endpoints, data models | Developers, integrators |
| DS03 | Research Framework and Evaluation | Research questions, experimental design, metrics | Researchers, evaluators |
| DS04 | CNL Specification | Controlled Natural Language grammar, translation, validation | Developers, workflow designers |
| DS05 | VSA/HDC Specification | Hyperdimensional computing implementation, parameters, algorithms | Researchers, algorithm developers |
| DS06 | Data Governance and Security | Data categories, ownership, security, retention | Compliance officers, administrators |
| DS07 | Use Case Definition | Actors, workflows, boundaries, traceability | All stakeholders, UX designers |
| DS08 | References and Document Index | Bibliography, document relationships, terminology | All readers |
| DS09 | Story Studio Interface Specification | UI components, interactions, and data flows | UX designers, frontend developers |
| DS10 | Visual Story Composer Specification | Visual editor paradigm and CNL generation rules | UX designers, workflow designers |
| DS11 | CNL Unification and Migration Guide | Single dialect definition (SVO) + migration notes | Developers, maintainers |
| DS12 | Metrics Interpreter and Evaluation Suite | Interpreter execution model + evaluation protocol | Researchers, developers |
| DS13 | Metric: Coherence Score (CS) | Formal definition + procedure + threshold | Researchers, evaluators |
| DS14 | Metric: Character Attribute Drift (CAD) | Formal definition + procedure + threshold | Researchers, evaluators |
| DS15 | Metric: Compliance Adherence Rate (CAR) | Formal definition + procedure + threshold | Researchers, compliance |
| DS16 | Metric: Originality Index (OI) | Formal definition + procedure + threshold | Researchers, evaluators |
| DS17 | Metric: Emotional Arc Profile (EAP) | Formal definition + procedure + threshold | Researchers, evaluators |
| DS18 | Metric: Retrieval Quality (RQ) | Formal definition + procedure + threshold | Researchers, evaluators |
| DS19 | Traceability Matrix (reserved) | Requirements → DS/API/tests mapping | Maintainers |
| DS20 | Metric: CNL Parse Success Rate (CPSR) | Formal definition + procedure + threshold | Researchers, evaluators |
| DS21 | Metric: Constraint Satisfaction Accuracy (CSA) | Formal definition + procedure + threshold | Researchers, evaluators |
| DS22 | Metric: Explainability Score (XAI) | Human survey definition + threshold | Researchers, UX |
| DS23 | Metric: Narrative Quality Score (NQS) | Composite definition + thresholds | Researchers, evaluators |

Documents are designed to be read in sequence for newcomers (DS01 through DS07 provides a complete picture) or selectively for specialists (a developer might focus on DS02 and DS04, a researcher on DS03 and DS05).


## 2. Key Terminology

The following table defines key terms used throughout the DS documents. Terms are explained in accessible language suitable for readers without specialized AI or software engineering background.

| Term | Definition | First Introduced |
|------|------------|------------------|
| LLM (Large Language Model) | An AI system trained on vast text corpora that can generate human-like text. Examples include GPT-4 and Claude. | DS01 |
| Narrative Drift | The tendency of LLMs to lose consistency with earlier content when generating long texts, such as forgetting character traits or plot details. | DS01 |
| Specification | A formal document defining the requirements for a narrative, including characters, constraints, and structure. | DS01 |
| SOP (Standard Operating Procedure) | A defined sequence of steps for completing a task, in SCRIPTA's case, orchestrating agents to produce content. | DS02 |
| Agent | A specialized AI component that performs a specific function such as planning, generation, or verification. | DS02 |
| CNL (Controlled Natural Language) | A restricted form of natural language with strict grammar that enables machine parsing while remaining human-readable. | DS04 |
| VSA/HDC | Vector Symbolic Architectures / Hyperdimensional Computing. A computing paradigm using very high-dimensional vectors (10,000+ elements) for symbolic operations. | DS05 |
| Embedding | A numerical representation of text as a list of numbers (vector) that captures semantic meaning. | DS05 |
| Cosine Similarity | A measure of similarity between two vectors based on the angle between them, ranging from -1 (opposite) to 1 (identical). | DS03 |
| Binding | A VSA operation that combines two vectors to represent a relationship while remaining reversible. | DS05 |
| Bundling | A VSA operation that combines multiple vectors into one that is similar to all inputs. | DS05 |
| Audit Log | An immutable record of all system operations, used for debugging and legal compliance. | DS06 |
| Provenance | Documentation of the origin and transformation history of an artifact. | DS06 |
| Guardrail | A safety mechanism that checks content for potential problems such as bias or copyright issues. | DS07 |


## 3. Academic References

The following references provide the scientific foundation for SCRIPTA's approach. They are organized by topic and include brief annotations explaining their relevance.

### Narrative Generation and Planning

Yao, Z., et al. (2019). Plan-and-Write: Towards Better Automatic Storytelling. AAAI Conference on Artificial Intelligence, 33(01), 7378-7384.
This paper establishes that explicit planning before generation improves narrative coherence. It introduces the "plan-and-write" paradigm that SCRIPTA adopts.
https://ojs.aaai.org/index.php/AAAI/article/view/4726

Meehan, J. R. (1977). TALE-SPIN: An interactive program that writes stories. IJCAI Proceedings, 91-98.
A foundational work on computational narrative generation that introduced the concept of goal-directed character behavior.
https://www.ijcai.org/Proceedings/77-1/Papers/022.pdf

### LLM Limitations in Creative Writing

Chakrabarty, T., et al. (2024). Plot holes, repetition and sense of an ending: A qualitative analysis of common generation errors in large language models. arXiv:2402.10224.
Empirical analysis of LLM weaknesses in narrative generation, documenting the types of errors SCRIPTA aims to address.
https://arxiv.org/abs/2402.10224

### Discourse Coherence

Jurafsky, D. & Martin, J. H. (2024). Speech and Language Processing (3rd ed.), Chapter 27: Discourse Coherence.
Comprehensive treatment of discourse coherence theory, including entity-based and relational coherence models that inform SCRIPTA's verification approach.
https://web.stanford.edu/~jurafsky/slp3/27.pdf

### Bias and Stereotypes in AI

Hutchinson, B., et al. (2022). Applying the Stereotype Content Model to assess disability bias in popular pre-trained NLP models. ACM SIGACCESS Conference on Computers and Accessibility.
Methodology for detecting bias in language models using the Stereotype Content Model, relevant to SCRIPTA's guardrail agents.
https://doi.org/10.1145/3517428.3544810

### Copyright and AI

U.S. Copyright Office. Copyright and Artificial Intelligence.
Official guidance on copyright issues in AI-generated content, essential for understanding the legal landscape SCRIPTA navigates.
https://www.copyright.gov/ai/

Congressional Research Service. (2023). Generative Artificial Intelligence and Copyright Law. CRS Report LSB10922.
Analysis of copyright law as applied to generative AI, informing SCRIPTA's compliance approach.
https://www.congress.gov/crs-product/LSB10922

### Ethics and AI Governance

UNESCO. Recommendation on the Ethics of Artificial Intelligence.
International framework for ethical AI development that guides SCRIPTA's approach to trustworthy AI.
https://www.unesco.org/en/artificial-intelligence/recommendation-ethics

### Hyperdimensional Computing

Kanerva, P. (2009). Hyperdimensional Computing: An Introduction to Computing in Distributed Representation with High-Dimensional Random Vectors. Cognitive Computation, 1(2), 139-159.
Foundational paper on hyperdimensional computing that establishes the theoretical basis for SCRIPTA's VSA implementation.

### Emotional Arcs in Narrative

Reagan, A., et al. (2024). EmotionArcs: Emotion Arcs for 9000 Literary Texts. LREC-COLING Proceedings, 70-80.
Dataset and methodology for analyzing emotional trajectories in narratives, used in SCRIPTA's evaluation suite.
https://aclanthology.org/2024.lrec-main.7/


## 4. Document Relationships and Dependencies

The DS documents have logical dependencies that determine reading order for different purposes.

For understanding the overall vision and goals, read DS01 first. It provides context for all other documents and can be read standalone by non-technical stakeholders.

For implementing the API and services, read DS02 after DS01. DS02 depends on DS01 for understanding the goals that the API must support.

For designing experiments or evaluations, read DS03 after DS01 and DS02. DS03 references metrics defined conceptually in DS01 and operationalized through the API in DS02.

For working with CNL, read DS04 after DS02. DS04 details the CNL service described briefly in DS02.

For implementing VSA algorithms, read DS05 after DS02 and DS03. DS05 provides implementation details for the VSA option referenced in DS02 and evaluated according to DS03.

For data handling and compliance, read DS06 after DS01 and DS02. DS06 addresses governance concerns raised in DS01 and data models defined in DS02.

For understanding user workflows, read DS07 after DS01. DS07 expands on the use case overview in DS01 with detailed workflow definitions.


## 5. Document Maintenance and Evolution

These documents are living specifications that evolve as the project develops. Each document includes a version history (to be added as changes occur) tracking significant modifications.

Changes to documents follow a review process. Proposed changes are submitted as pull requests, reviewed by domain experts, and merged only after approval. Significant changes that affect multiple documents trigger a cross-document consistency review.

Terminology is maintained consistently across documents. When a new term is introduced, it is added to the terminology table in DS08 and defined at first use in the introducing document. Existing definitions are not changed without updating all referring documents.

References are kept current. When new research becomes available that affects SCRIPTA's approach, it is evaluated for inclusion in the reference list. Outdated or superseded references are marked with notes explaining their historical significance.

The document set is designed for both the current research phase (zero external dependencies, prototype implementations) and future production phases. As the system matures, documents will be updated to reflect production architecture, deployment considerations, and operational procedures while maintaining the core specifications that define what SCRIPTA is and does.
