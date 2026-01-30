# DS05 — Hyperdimensional Computing (VSA/HDC) Specification

## 1. Theoretical Foundation

Vector Symbolic Architectures (VSA), also known as Hyperdimensional Computing (HDC), represent a fundamentally different approach to representing and manipulating symbolic information. Unlike conventional neural network embeddings that map concepts to dense vectors of a few hundred dimensions, VSA uses extremely high-dimensional vectors—typically 10,000 dimensions or more—with special algebraic operations that preserve symbolic structure.

The core insight of VSA is that in very high-dimensional spaces, randomly chosen vectors are almost certainly nearly orthogonal to each other. This means we can generate a random vector for each atomic symbol (words, characters, concepts) with near certainty that it will be distinguishable from all other symbols. More importantly, we can combine vectors using special operations—binding and bundling—that create new composite vectors representing structured relationships while remaining in the same vector space.

This approach offers potential advantages for creative writing systems. Character state can be represented as a single hypervector that bundles all traits, goals, and relationships. Querying a specific trait involves unbinding operations that extract the relevant component. Comparing character states across chapters involves simple vector similarity. The mathematical properties guarantee that operations are reversible and composable, unlike neural network embeddings where information is often irreversibly mixed.

SCRIPTA implements VSA/HDC as an alternative to conventional embedding-based methods for specific operations: semantic search and retrieval, memory indexing and recall, constraint matching and verification, originality and similarity detection, and character consistency tracking. Each operation has both a "basic" implementation using conventional methods and a "vsa" implementation using hyperdimensional computing, allowing empirical comparison.


## 2. Core Parameters and Encoding

The SCRIPTA VSA implementation uses specific parameter choices based on theoretical analysis and preliminary experiments. These parameters are configurable for research purposes, but defaults are provided that balance accuracy against computational cost.

The following table specifies the core VSA parameters used in SCRIPTA.

| Parameter | Default Value | Rationale | Alternatives for Sweep |
|-----------|---------------|-----------|------------------------|
| Dimensionality | 10,000 | Provides sufficient capacity for vocabulary and composition while remaining computationally tractable | 2,000 / 5,000 / 20,000 |
| Representation | Bipolar (-1, +1) | Simplifies operations and provides good noise tolerance | Binary (0, 1) |
| Random Seed | 42 | Ensures reproducibility across runs | Any fixed integer |
| Binding Operator | Element-wise multiplication | Distributes well and is invertible (binding twice with same vector returns original) | XOR for binary representation |
| Bundling Operator | Majority vote with +1 tie-breaker | Preserves component vectors in superposition | Thresholded sum |
| Similarity Measure | Cosine similarity | Standard measure for comparing high-dimensional vectors | Hamming distance for binary |
| Permutation | Cyclic shift by k positions | Enables positional encoding and sequence representation | Random permutation matrix |

Encoding rules determine how text is converted to hypervectors. Tokens (words or subwords) are mapped to random bipolar hypervectors using a deterministic hash function seeded with the random seed parameter. This ensures the same token always maps to the same hypervector across runs. Phrases are encoded by bundling the hypervectors of constituent tokens, producing a single vector that is similar to each component. Relations are encoded by binding role and filler vectors, enabling structured representation of concepts like "Anna is courageous" as bind(Anna, bind(role_trait, courageous)).

The encoding process is hierarchical. Characters are represented as bundles of their name vector, trait vectors, goal vectors, and relationship vectors. Scenes are represented as bundles of their constituent sentence vectors. Documents are represented as bundles of their scene vectors. This hierarchy allows queries at any level of granularity while maintaining a unified vector space.


## 3. Operations and Algorithms

VSA provides three fundamental operations that form the basis of all higher-level algorithms. Understanding these operations is essential for working with the VSA module.

Binding takes two hypervectors and produces a third that is dissimilar to both inputs but can be used to recover either input given the other. In SCRIPTA's bipolar representation, binding is element-wise multiplication: bind(A, B) = A ⊙ B. Because multiplying by the same vector twice returns the original (A ⊙ B ⊙ B = A), binding is its own inverse. This enables encoding and decoding of structured information.

Bundling takes multiple hypervectors and produces a single vector that is similar to all inputs. In SCRIPTA's bipolar representation, bundling uses majority vote: for each dimension, the output is +1 if more inputs have +1 than -1, and -1 otherwise. The resulting vector can be compared against the original inputs using cosine similarity, with higher similarity indicating membership in the bundle.

Permutation applies a fixed transformation to a hypervector, producing a new vector that is dissimilar to the input. SCRIPTA uses cyclic shift, where permute(A, k) shifts all elements by k positions with wraparound. Permutation enables positional encoding: the sequence "A B C" can be distinguished from "C B A" by encoding them as bundle(A, permute(B, 1), permute(C, 2)) versus bundle(C, permute(B, 1), permute(A, 2)).

The following table describes the high-level algorithms built on these operations.

| Algorithm | Purpose | Method | Basic Alternative |
|-----------|---------|--------|-------------------|
| Semantic Search | Find relevant passages given query | Encode query as hypervector, compute similarity to indexed documents | Dense embedding + cosine similarity |
| Memory Indexing | Store and retrieve narrative context | Bundle all context into single hypervector, use binding for keyed storage | Vector database with ANN indexing |
| Constraint Matching | Check if text satisfies CNL constraint | Encode constraint and text, measure similarity after appropriate unbinding | Rule-based pattern matching |
| Similarity Detection | Compare texts for originality/plagiarism | Compute hypervector similarity between texts | N-gram overlap + embedding similarity |
| Character Tracking | Monitor character state across text | Maintain character hypervector, update with new mentions, measure drift | Embedding-based attribute tracking |


## 4. Implementation Architecture

The VSA module is implemented in src/vsa/ with a clean interface that mirrors the basic implementation. This allows the system to switch between implementations without changing calling code. The implementation is pure JavaScript with no external dependencies, suitable for the research phase where simplicity and portability are prioritized over performance.

The module exposes the following functions. The encode function takes text and parameters, returning a hypervector represented as a Float32Array. The bind function takes two hypervectors and returns their element-wise product. The bundle function takes an array of hypervectors and returns their majority-vote combination. The permute function takes a hypervector and shift amount, returning the cyclic-shifted result. The similarity function takes two hypervectors and returns their cosine similarity as a number between -1 and 1. The index function takes arrays of hypervectors and identifiers, building a searchable index. The search function takes a query hypervector and returns the k most similar indexed items.

Configuration is managed through a central config file at src/vsa/config.yaml that specifies all parameters. This file is version-controlled and documented, ensuring reproducibility. Different configurations can be loaded for experiments, with the selected configuration recorded in audit logs.

Determinism is critical for research validity. Given the same input text, parameters, and random seed, the module must produce identical hypervectors across runs and across machines. This is achieved by using a seeded pseudorandom number generator for all random vector generation and avoiding any operations with platform-dependent behavior.


## 5. Evaluation and Comparison Protocol

The primary research question for VSA/HDC is whether it outperforms conventional methods on SCRIPTA's semantic operations. This requires a rigorous comparison protocol that controls for confounding variables and uses appropriate metrics.

The comparison uses matched pairs: each task is performed by both the basic and VSA implementations on identical inputs, and the results are compared. This within-subject design controls for task difficulty and input characteristics.

The following table specifies the evaluation metrics for each operation.

| Operation | Metrics | Success Threshold | Dataset |
|-----------|---------|-------------------|---------|
| Semantic Search | Recall@5, Recall@10, MRR | VSA ≥ Basic on all metrics | Held-out query set with relevance judgments |
| Memory Indexing | Retrieval accuracy, Latency | VSA accuracy ≥ Basic, latency within 2x | Synthetic memory tasks with ground truth |
| Constraint Matching | Precision, Recall, F1 | VSA F1 ≥ Basic F1 | CNL constraints with labeled text passages |
| Similarity Detection | Correlation with human judgment | VSA correlation ≥ Basic correlation | Paired texts with human similarity ratings |
| Character Tracking | CAD (Character Attribute Drift) | VSA CAD ≤ Basic CAD | Long narratives with annotated character states |

The term "Recall@k" measures what fraction of relevant items appear in the top k results. "MRR" (Mean Reciprocal Rank) measures how high relevant items appear on average, with higher values indicating that relevant items appear earlier in results. "F1" is the harmonic mean of precision and recall, balancing both concerns.

Results are analyzed using paired statistical tests (Wilcoxon signed-rank) to determine if differences are significant. Effect sizes are computed using Cliff's delta for non-parametric data. Confidence intervals are reported at 95% level. The null hypothesis is that VSA and basic methods perform equivalently; rejection requires p < 0.05 with meaningful effect size.

If VSA outperforms basic methods on some operations but not others, the system will use VSA selectively for operations where it excels. The implementation_profile parameter allows granular control, enabling VSA for specific operations while using basic methods elsewhere. This hybrid approach captures the benefits of each method where they are strongest.
