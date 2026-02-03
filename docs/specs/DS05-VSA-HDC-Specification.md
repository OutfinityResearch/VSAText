# DS05 — Hyperdimensional Computing (VSA/HDC)

## What is VSA?

Vector Symbolic Architectures (VSA) represent information using very high-dimensional vectors (10,000+ dimensions) with special algebraic operations. Unlike neural embeddings where information gets mixed irreversibly, VSA operations are reversible and composable.

The key insight: in high-dimensional spaces, random vectors are nearly orthogonal. This means each concept gets a distinguishable representation, and we can combine them without losing the ability to extract components later.

## Why Use VSA for Narratives?

Character state becomes a single vector bundling traits, goals, and relationships. Querying a trait is an unbinding operation. Comparing character states across chapters is vector similarity. The math guarantees reversibility.

SCRIPTA implements VSA as an alternative to conventional embeddings for: semantic search, memory indexing, constraint matching, similarity detection, and character tracking.

## Core Parameters

| Parameter | Default | Purpose |
|-----------|---------|---------|
| Dimensions | 10,000 | Sufficient capacity for vocabulary |
| Representation | Bipolar (-1, +1) | Simple operations, good noise tolerance |
| Seed | 42 | Reproducibility |
| Binding | Element-wise multiply | Reversible composition |
| Bundling | Majority vote | Creates superposition |
| Similarity | Cosine | Standard comparison |

## Three Operations

**Binding** - Combines two vectors into one dissimilar to both, but recoverable. `bind(A, B) = A ⊙ B`. Self-inverse: `A ⊙ B ⊙ B = A`.

**Bundling** - Combines multiple vectors into one similar to all inputs. Uses majority vote per dimension.

**Permutation** - Shifts vector elements, enabling positional encoding. "A B C" encodes differently from "C B A".

## Algorithms Built on VSA

| Algorithm | What It Does |
|-----------|--------------|
| Semantic Search | Encode query, compare to indexed docs |
| Memory Indexing | Bundle context into one vector |
| Constraint Matching | Compare CNL constraint to text |
| Similarity Detection | Compare texts for originality |
| Character Tracking | Track trait drift across text |

## Implementation

The VSA module lives in `src/vsa/` with pure JavaScript, no dependencies. Functions:
- `encodeText(text, dim, seed)` → hypervector
- `bind(a, b)` → combined vector
- `bundle([vectors])` → superposition
- `cosine(a, b)` → similarity score

Same interface as basic embeddings, so code can switch implementations.

## Evaluation

Compare VSA vs conventional methods on identical tasks:

| Operation | Metric | Success |
|-----------|--------|---------|
| Search | Recall@5, MRR | VSA ≥ Basic |
| Constraint Match | F1 score | VSA ≥ Basic |
| Character Track | CAD score | VSA ≤ Basic |

If VSA wins on some operations but not others, use it selectively where it excels.
