# DS10 Algorithm Variants — Basic vs VSA/HDC

## 1. Purpose
Define dual implementation requirements for each core algorithm: a basic baseline and at least one VSA/HDC-based variant.

## 2. Selection Rules
- Every algorithmic API exposes implementation_profile (basic | vsa).
- Default is basic; experiments and evaluations must include vsa.
- Audit logs record selected profile and parameters.

## 3. Algorithm Catalog
### 3.1 Semantic Search and Retrieval
- Basic: dense embeddings + cosine similarity.
- VSA/HDC: hypervector encoding + similarity via Hamming/cosine on hypervectors.

### 3.2 Memory Indexing
- Basic: vector database with standard ANN indexing.
- VSA/HDC: superposition of hypervectors for fast associative recall.

### 3.3 Constraint Matching
- Basic: rule-based matching on extracted slots.
- VSA/HDC: bind constraints to hypervectors; unbind for verification.

### 3.4 Originality / Similarity Detection
- Basic: n-gram overlap + embedding similarity.
- VSA/HDC: compare hypervector signatures for semantic overlap.

### 3.5 Character Consistency Tracking
- Basic: embedding-based attribute drift metrics.
- VSA/HDC: character state encoded as hypervector with binding to traits.

## 4. Implementation Notes
- VSA/HDC dimensions and encoding schemes are centrally configured.
- Provide deterministic seeds for reproducibility.
- Use the same I/O schema for both variants.
 - See DS12 for explicit parameter values and sweep plan.

## 5. Evaluation Plan
- Compare Basic vs VSA/HDC on retrieval quality, latency, and accuracy.
- Track impact on downstream narrative quality metrics.

## 6. Deliverables
- Baseline and VSA implementations for each algorithm.
- Benchmark scripts and results per variant.
