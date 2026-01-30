# DS06 — Data Governance and Security

## 1. Data Categories and Ownership

The SCRIPTA system handles multiple categories of data with different ownership, sensitivity levels, and retention requirements. Clear categorization is essential for compliance with data protection regulations and for maintaining trust with users who entrust their creative work to the system.

Narrative Input Data encompasses all content provided by the author during the creative process. This includes prompts, character sheets, plot outlines, CNL specifications, and draft revisions. Ownership of this data rests entirely with the author. The system processes this data to provide services but does not claim any rights over it. Authors can export their data at any time and can request deletion, which will be executed according to the retention policy.

System-Generated Output Data includes all artifacts produced by the system in response to author inputs. This encompasses generated prose, verification reports, guardrail findings, evaluation metrics, and compliance reports. Ownership follows the author's relationship with the content: generated text that the author accepts and edits becomes part of their work, while reports and metrics are system documentation that authors can access but that the system retains for audit purposes.

Audit Data comprises the immutable log of all system operations, including who did what, when, with what inputs, and producing what outputs. This data is jointly owned by the system operator and the author, as it serves both operational needs and legal evidence of the creative process. Audit data cannot be deleted by authors because its integrity is essential for compliance claims, but authors can access their own audit records.

Model Training Data refers to the corpora used to train the underlying language models and verification classifiers. SCRIPTA does not train foundation models, but it does use pre-trained models whose training data provenance is documented. This documentation is essential for copyright compliance, as claims against the system may require demonstrating what data influenced outputs.

The following table summarizes data categories and their governance attributes.

| Category | Owner | Access | Retention | Deletion Rights |
|----------|-------|--------|-----------|-----------------|
| Narrative Input | Author | Author, System (processing only) | Configurable per author preference | Full deletion on request |
| Generated Output | Author (for accepted content) | Author, System (for reports) | Until author deletes or project closes | Partial (content yes, reports no) |
| Audit Data | Joint (Author + Operator) | Author (own records), Operator (all), Compliance (all) | Minimum 7 years for legal compliance | None (immutable by design) |
| Model Training Data | Original IP holders | Documented in provenance records | Permanent (part of model weights) | Not applicable (already embedded) |
| CNL Constraints | Author | Author, System (processing only) | With associated specification | Deleted with specification |
| VSA Indices | System | System (operational use) | Until index rebuild or project deletion | Automatic with source data |


## 2. Data Handling and Security

All data in SCRIPTA is handled according to principles of data minimization and purpose limitation. The system collects only what is necessary for the requested service and uses it only for that purpose. Data is not repurposed for training, marketing, or any purpose beyond the explicit service request without informed consent.

Encryption protects data at rest and in transit. Storage uses AES-256 encryption with keys managed through a secure key management service. Transport uses TLS 1.3 for all API communications. Keys are rotated according to a defined schedule, and key access is logged for audit purposes.

PII (Personally Identifiable Information) detection is applied to all narrative input before storage. The system scans for patterns matching names, addresses, phone numbers, email addresses, and identification numbers. Detected PII is flagged for author review, and authors can choose to redact, pseudonymize, or retain the information. This protects authors from inadvertently including sensitive information in content that may be shared or published.

Access control uses role-based permissions with four defined roles. Authors can access their own data and request services. Workflow Developers can create and modify SOPs but cannot access author content. Compliance Reviewers can access audit logs and reports but cannot modify content. Administrators can manage users and system configuration but have no special access to content. All access is logged in the audit trail.

The following table describes security controls by data category.

| Category | Encryption | Access Control | PII Handling | Audit Logging |
|----------|------------|----------------|--------------|---------------|
| Narrative Input | AES-256 at rest, TLS in transit | Author only + System processing | Detected and flagged | All access logged |
| Generated Output | AES-256 at rest, TLS in transit | Author + authorized reviewers | Inherited from input | All access logged |
| Audit Data | AES-256 at rest, cryptographic signing | Compliance + Admin | Minimized (hashes, not raw data) | Self-logging (part of audit) |
| CNL Constraints | AES-256 at rest | Author + System processing | Not applicable (structured data) | Logged as spec modifications |
| VSA Indices | AES-256 at rest | System only | Not applicable (vectors only) | Index operations logged |


## 3. Provenance and Auditability

Provenance tracks the origin and transformation of every artifact in the system. This is essential for two purposes: debugging and improvement (understanding what went wrong when outputs are unsatisfactory) and legal compliance (demonstrating human authorship and due diligence).

Every output artifact is linked to its provenance chain. This chain includes the specification ID that defined the creative constraints, the SOP ID that orchestrated the workflow, the versions of all agents involved in production, the hashes of all inputs consumed, the timestamps of all operations, and the implementation profile (basic or VSA) used for algorithmic operations. This information is stored in the audit log and can be retrieved for any artifact.

Audit log entries are designed to be immutable. Once written, an entry cannot be modified or deleted. This is enforced through cryptographic chaining: each entry includes a hash of the previous entry, creating a chain where any modification would break the hash linkage and be detectable. The audit log is also signed with the system's private key, providing non-repudiation.

Compliance reports aggregate provenance information into human-readable documents. These reports summarize the creative process for a given artifact, listing all inputs, decisions, and transformations. They are designed to serve as evidence in copyright proceedings, demonstrating that a human author specified the creative intent, reviewed the outputs, and exercised editorial judgment. The report format aligns with guidance from the U.S. Copyright Office on AI-assisted works.


## 4. Retention and Deletion

Retention policies balance legal requirements, operational needs, and user rights. Different data categories have different retention requirements, and the system enforces these automatically.

Audit data has the longest retention requirement: a minimum of seven years to satisfy potential legal discovery needs. This period may be extended if litigation is pending or reasonably anticipated. Audit data is stored in a separate archive with higher durability guarantees than operational data.

Narrative input and generated output retention is configurable by the author within system limits. Authors can choose immediate deletion upon project completion, retention for a specified period (30 days to 5 years), or indefinite retention until explicit deletion request. The system default is 1 year retention with automatic reminders before deletion.

Deletion requests are processed according to data category. For narrative input and generated output, deletion removes the data from primary storage and backups within 30 days. For audit data, the content payload is removed but the metadata (timestamps, hashes, actor IDs) is retained to maintain chain integrity. VSA indices are rebuilt automatically after source data deletion, ensuring that no semantic fingerprint of deleted content remains.

The following table summarizes retention policies.

| Category | Default Retention | Minimum Retention | Maximum Retention | Deletion Process |
|----------|-------------------|-------------------|-------------------|------------------|
| Narrative Input | 1 year | None (immediate deletion allowed) | Indefinite | Full deletion including backups |
| Generated Output | 1 year | None | Indefinite | Full deletion including backups |
| Audit Data | 7 years | 7 years | Indefinite | Payload removal, metadata retained |
| CNL Constraints | With specification | None | With specification | Deleted with specification |
| VSA Indices | Until rebuild | None | Until rebuild | Automatic with source data |


## 5. Open Issues and Future Considerations

Several governance questions remain open and will be resolved as the system matures and legal frameworks evolve.

Licensing terms for external corpora used in evaluation datasets need formal documentation. Currently, datasets are assembled from public domain works, licensed content, and researcher-created synthetic examples. Each source requires documented licensing terms and usage restrictions.

Policies for reuse of generated text in model fine-tuning are not yet established. If authors consent to having their reviewed outputs used to improve the system, this creates value but also raises questions about ownership and compensation. This requires careful policy development with legal review.

Cross-border data handling may require additional safeguards depending on where authors are located. GDPR (European), CCPA (California), and other regulations impose specific requirements that may affect storage location, transfer mechanisms, and user rights implementation.

The interaction between audit immutability and right-to-deletion requests presents a tension that must be carefully managed. The current approach (removing payload while retaining metadata) may not satisfy all regulatory interpretations, and this may require revisiting as case law develops.
