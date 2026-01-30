# DS12 VSA/HDC Parameters — SCRIPTA

## 1. Purpose
Provide explicit hyperdimensional computing (VSA/HDC) parameters for reproducible experiments and implementations.

## 2. Core Choices
- Dimensionality: 10,000
- Representation: bipolar (-1, +1)
- Seed: 42 (deterministic runs)
- Binding: element-wise multiplication
- Bundling: majority vote (ties resolved by +1)
- Similarity: cosine similarity
- Permutation: cyclic shift by k positions

## 3. Encoding Rules
- Tokens and symbols mapped to random bipolar hypervectors.
- Phrases encoded via bundling of token hypervectors.
- Relations encoded via binding of role and filler vectors.

## 4. Indexing and Retrieval
- Document vector: bundle of sentence vectors.
- Query vector: bundle of query terms.
- Retrieval via nearest neighbor in hypervector space.

## 5. Parameter Sweep Plan
- Dimensionality: 2k, 5k, 10k, 20k
- Binding: multiplication vs XOR (binary variant)
- Similarity: cosine vs Hamming (binary variant)

## 6. Deliverables
- Config file in src/vsa/config.yaml
- VSA README in src/vsa/README.md
- Benchmark results for each parameter set
