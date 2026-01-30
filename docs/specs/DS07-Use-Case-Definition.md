# DS07 — Use Case Definition and Workflows

## 1. Problem Statement and Scope

SCRIPTA addresses a fundamental challenge in AI-assisted creative writing: current LLM tools behave as opaque "magic boxes" that produce fluent text but suffer from three critical problems. First, they drift from long-range narrative intent because their context windows cannot encompass entire novels or screenplays. Second, they introduce legal and ethical risks through potential copyright infringement, embedded biases, and lack of provenance documentation. Third, they offer no transparency or control over the creative process, leaving authors unable to specify requirements formally or understand why certain outputs were generated.

The scope of SCRIPTA is professional creative writing assistance. This includes short stories, novels, screenplays, and narrative-driven content where coherence, character consistency, and compliance matter. The system is designed for authors who want to leverage AI capabilities while maintaining creative control and producing work that meets professional and legal standards.

SCRIPTA is explicitly not autonomous authorship. The human remains the creative director at all times. The system proposes, the human disposes. Every significant output requires human review before it becomes part of the work. This distinction is essential both ethically and legally, as it preserves human authorship claims under current copyright frameworks.

The system operates within the ACHILLES IDE, leveraging its specification-driven development paradigm. This means creative work is treated similarly to software development: requirements are specified formally, implementations are generated, outputs are verified against specifications, and the entire process is logged for auditability.


## 2. Actors and Their Roles

The SCRIPTA system involves five distinct actor types, each with specific responsibilities and interactions with the system.

The Author or Screenwriter is the primary user and creative director. Authors define the narrative intent by specifying characters, plot constraints, world rules, and thematic requirements. They review generated content, accepting, rejecting, or modifying proposals. They make final editorial decisions and own the resulting work. Authors interact primarily through the specification and review interfaces, and their actions are logged as evidence of human creative control.

The AI Workflow Developer designs and maintains the SOP templates that orchestrate agent collaboration. This role requires understanding both the creative domain and the technical capabilities of each agent. Workflow Developers do not access author content directly; they work with abstract workflow definitions that authors then instantiate with their specific content.

The Publisher or Content Studio is the commercial entity that may commission or acquire the resulting work. Publishers rely on SCRIPTA's compliance reports for due diligence, verifying that content meets legal and ethical standards before publication. They may define additional constraints or policies that authors must satisfy.

The Legal and Compliance Officer reviews audit logs and compliance reports to assess risk. This role has read access to all audit records but cannot modify content. Compliance Officers use the system's outputs to prepare legal documentation and respond to potential claims.

System Agents are the AI components that perform the actual work of planning, generation, verification, and review. While not human actors, they are logged as actors in the audit trail, with their versions and parameters recorded for reproducibility.

The following table summarizes actor interactions with the system.

| Actor | Primary Actions | System Access | Audit Role |
|-------|-----------------|---------------|------------|
| Author | Define specs, review outputs, make editorial decisions | Full access to own projects | Actions logged as evidence of human authorship |
| Workflow Developer | Design SOPs, configure agent parameters | SOP definitions only, no author content | Configuration changes logged |
| Publisher | Review compliance, define policies | Reports and policies only | Report access logged |
| Compliance Officer | Audit review, risk assessment | Read-only access to all audit data | All access logged |
| System Agents | Plan, generate, verify, review | Processing access during execution | All operations logged with parameters |


## 3. Primary Workflow

The primary workflow represents the happy path through SCRIPTA, where an author moves from initial concept to completed, verified narrative.

The workflow begins with the author creating a NarrativeSpec. This specification captures the essential elements of the intended story: title, synopsis, themes, characters with their traits and goals, world rules that constrain what is possible in the fictional universe, and CNL constraints that formalize specific requirements. The specification serves as the contract between human intent and machine execution.

Next, the author selects or creates an SOP that defines the workflow steps. Standard SOPs are provided for common use cases (short story, novel chapter, screenplay scene), but authors can customize or create new SOPs for specific needs. The SOP specifies which agents participate, in what order, and what policies govern their operation.

The planning agent then generates a Plan from the specification. The plan includes a plot graph showing the structure of the narrative, a list of scenes with their objectives and constraints, and character arcs showing how characters develop through the story. The author reviews and may modify this plan before proceeding.

Generation agents produce text scene by scene according to the plan. Each scene is generated in context of previously generated scenes, and outputs are bounded by the plan and specification. Generation is iterative: the author can accept a scene, request regeneration with different parameters, or manually edit.

Verification agents check each generated scene against the specification. They detect trait violations (characters acting against their defined nature), plot inconsistencies (events contradicting established facts), and constraint violations (missing required elements or including forbidden ones). Violations are reported to the author for resolution.

Guardrail agents analyze content for bias, stereotypes, cliché overuse, and potential copyright issues. Findings are reported with severity levels and specific text citations. Authors can address findings or accept them with documented justification.

Finally, the system produces a compliance report summarizing the entire process. This report documents human specification, human review, verification outcomes, and editorial decisions. It serves as evidence of human authorship and due diligence for legal purposes.


## 4. Alternative Workflows

Beyond the primary workflow, SCRIPTA supports several alternative paths that address common creative scenarios.

The Reverse Engineering workflow starts with existing text rather than a specification. An author may have a draft from another source, a partially completed manuscript, or published work they want to continue. The reverse engineering agent analyzes this text to extract an implied specification: what characters exist and what are their traits, what world rules are established, what plot structure is evident. The author reviews and corrects this extracted specification, which then becomes the basis for continued generation or revision.

The Research-Assisted workflow integrates factual research into the creative process. For historical fiction, technical thrillers, or content requiring accuracy, the research agent queries curated knowledge bases and returns relevant information with provenance. This information can be incorporated into generated text with citations tracking back to sources, providing accountability for factual claims.

The Human-in-the-Loop Editing workflow emphasizes iterative refinement. Rather than generating complete scenes and reviewing them, the author works interactively: generating a paragraph, editing it, generating the next paragraph with the edit in context, and so on. This workflow is slower but provides finer control and is useful for critical scenes or stylistically demanding passages.

The Policy-Constrained workflow adds publisher or institutional constraints to the author's specification. A children's book publisher might require certain content policies; an educational institution might require accessibility standards. These policies are defined separately from author specifications and are enforced by guardrail agents configured for the specific policy set.


## 5. Boundaries, Assumptions, and Traceability

SCRIPTA operates within defined boundaries that scope what the system attempts to do.

The system assumes that authors have legitimate creative intent. It does not attempt to detect or prevent malicious use of AI for generating harmful content at scale. Guardrails catch obvious problems (explicit bias, harmful stereotypes) but do not substitute for human judgment about appropriateness.

External web research is optional and policy-controlled. When enabled, the research agent can access curated external sources, but all such access is logged and sources are cited. Authors can disable external research entirely for projects that must be self-contained.

Formal verification starts with heuristic methods. The verification agents use semantic similarity and pattern matching rather than mathematical proof. Interfaces are designed to support formal proof artifacts in the future, but initial implementation prioritizes practical effectiveness over theoretical completeness.

Every pipeline run produces a complete traceability record. This record includes the selected SOP version with all parameters, agent versions and configurations, input hashes for all specification and plan elements, output artifact references with hashes, and audit log linkage. This traceability enables reproduction of any run and investigation of any output.

The following table summarizes the artifacts produced by a complete workflow.

| Artifact | Description | Storage | Traceability |
|----------|-------------|---------|--------------|
| NarrativeSpec | Author's specification of intent | Spec store, linked to project | spec_id in all downstream artifacts |
| Plan | Structured narrative outline | Plan store, versioned | plan_id links to spec_id and generated content |
| Draft scenes | Generated text content | Artifact store | draft_id links to plan_id and scene_id |
| Verification Report | Constraint checking results | Report store | Links to spec_id and artifact_id |
| Guardrail Report | Bias/originality/copyright findings | Report store | Links to artifact_id and policy set |
| Compliance Report | Consolidated process documentation | Report store | Links all components, signed |
| Audit Log | Immutable operation record | Audit archive | Chain of all operations with hashes |
