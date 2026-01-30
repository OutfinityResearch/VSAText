# VSA/HDC Prototype

This folder defines the VSA/HDC configuration for SCRIPTA experiments.

## Parameters
See config.yaml for the default configuration and sweep ranges.

## Operations
- Binding: element-wise multiplication (bipolar) or XOR (binary).
- Bundling: majority vote with tie-break to +1.
- Similarity: cosine (bipolar) or Hamming (binary).
- Permutation: cyclic shift.

## Intended Uses
- Semantic search and retrieval.
- Associative memory for character and plot state.
- Constraint matching via binding/unbinding.

## Encoder Stub

```bash
node src/vsa/encoder.mjs --text "A storm gathers at sea" --no-vector
node src/vsa/encoder.mjs --text "storm at sea" --compare "calm harbor" --no-vector
```

## In-Memory Index

```bash
node src/vsa/index.mjs --add doc_001 "storm at sea" --add doc_002 "calm harbor" --search "storm"
```

Persist index to disk:

```bash
node src/vsa/index.mjs --add doc_001 "storm at sea" --save /tmp/vsa-index.json
node src/vsa/index.mjs --load /tmp/vsa-index.json --search "storm"
```
