# DS05 — Hyperdimensional Computing (VSA/HDC)

## What is VSA?

Vector Symbolic Architectures (VSA), also referred to as Hyperdimensional Computing (HDC), represent information using very high-dimensional vectors, typically with thousands of dimensions. In SCRIPTA, these vectors are used as lightweight, deterministic representations of text and narrative elements.

The main advantage of VSA is that it supports simple algebraic operations for combining, comparing, and transforming representations. This makes it useful for retrieval, approximate matching, and compact indexing without requiring external dependencies or heavyweight neural models.

In the current SCRIPTA implementation, VSA is used as an experimental alternative to basic text similarity methods for encoding text, comparing items, and searching indexed narrative fragments.

## Why Use VSA for Narratives?

Narrative systems need lightweight ways to compare scenes, track repeated concepts, and retrieve relevant story fragments. VSA is useful in this context because it can represent text as fixed-size vectors and compare those vectors efficiently.

In SCRIPTA, VSA is intended to support semantic search over scenes, chapters, and story fragments, lightweight memory indexing, approximate constraint matching, similarity-based originality checks, and character-related consistency analysis across narrative units. VSA is not treated as a full reasoning system. Its role is narrower: compact representation, similarity comparison, and retrieval-oriented support for narrative workflows.

## Core Parameters

| Parameter | Default | Purpose |
|-----------|---------|---------|
| Dimensions | 10,000 | Provides stable high-dimensional capacity for lightweight text encoding |
| Representation | Bipolar (-1, +1) | Simple vector format with efficient operations |
| Seed | 42 | Ensures deterministic and reproducible encoding |
| Binding | Element-wise multiply | Combines two vectors into a composite representation |
| Bundling | Majority vote | Aggregates multiple vectors into one summary representation |
| Similarity | Cosine | Measures closeness between two encoded vectors |

These defaults are chosen for reproducibility, simplicity, and compatibility with browser-safe JavaScript execution.

## Three Operations

| Operation | Description | Current Use |
|-----------|-------------|-------------|
| Binding | Combines two vectors into one composite representation using element-wise multiplication. `bind(A, B) = A ⊙ B` | Used for compositional encoding and experimental structured representations |
| Bundling | Combines multiple vectors into one summary representation using majority vote across dimensions | Used when encoding multi-token text or merging related information |
| Permutation | Reorders vector positions through cyclic shifting so different orders produce different representations | Implemented, but currently used only in limited workflows |

## Algorithms Built on VSA

| Algorithm | What It Does |
|-----------|--------------|
| Semantic Search | Encodes indexed text and compares it with a query vector |
| Memory Indexing | Stores narrative fragments as vectors for later retrieval |
| Constraint Matching | Compares constraint-like text with candidate narrative text |
| Similarity Detection | Measures proximity between passages for originality or reuse checks |
| Character Tracking | Compares character-related text across scenes or chapters |

These algorithms are lightweight and similarity-based. They do not replace formal verification or full symbolic interpretation.

## Implementation

The VSA module is implemented in `src/vsa/` using pure JavaScript with no external dependencies.

The current implementation provides:
- `encodeText(text, dim, seed)` for deterministic text encoding
- `bind(a, b)` for vector composition
- `bundle(vectors)` for vector aggregation
- `permute(vec, shiftK)` for positional variation
- `cosine(a, b)` for similarity scoring
- `VsaIndex.add(id, text)` for indexing text
- `VsaIndex.search(queryText, topK)` for similarity search
- `VsaIndex.save(filePath)` and `VsaIndex.load(filePath)` for persistent indexes

The encoder currently uses:
- lowercase tokenization
- splitting on non-word boundaries
- deterministic token hashing
- bipolar vector generation
- cosine similarity for ranking

This means the current implementation is practical, deterministic, and portable, but intentionally lightweight.

## Evaluation

VSA should be evaluated against simpler baseline methods on the same tasks and inputs.

| Operation | Metric | Success |
|-----------|--------|---------|
| Search | Recall@5, MRR | VSA >= Basic |
| Constraint Match | Precision, Recall, F1 | VSA >= Basic |
| Character Track | Consistency quality, CAD-related signals | VSA improves drift detection |
| Similarity Detection | Ranking quality | VSA retrieves related passages more reliably |

Evaluation should use identical datasets, prompts, and query sets across methods. VSA does not need to outperform the baseline on every task. It is acceptable to use VSA selectively where it provides a measurable advantage.

The current success condition is practical rather than universal: VSA is useful if it improves at least one meaningful retrieval or similarity task without increasing system complexity beyond its value.
