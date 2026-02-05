# DS18 — Metric Specification: Retrieval Quality (RQ)

## 1. Purpose

**Retrieval Quality (RQ)** measures how well the system finds relevant content when you search for it. When an author searches "scenes with Anna in danger," the system should return the right scenes.

**Target: MRR > 0.6** (higher is better)

## 2. Why Retrieval Matters

Authors working on long narratives need to:
- Find all scenes where a character appears
- Locate specific plot points
- Check for consistency across distant parts of the story

Good retrieval saves time and prevents errors.

## 3. Key Concepts

### What is a Query Set?

A **query set** is a collection of test searches with known correct answers. Each query has:
- The search text (e.g., "storm at sea moral dilemma")
- The list of documents/scenes that should match

This "ground truth" lets us measure how well the system performs.

### What is Recall@k?

**Recall@k** asks: "Of all the correct answers, what fraction did we find in the top k results?"

**Example:**
- Query: "scenes with Anna in danger"
- Correct answers: Scene 3, Scene 4, Scene 7
- System returns (top 5): Scene 4, Scene 8, Scene 3, Scene 1, Scene 2

Recall@5 = 2/3 = 0.67 (found 2 of 3 correct answers in top 5)

Higher recall means fewer relevant items are missed.

### What is Mean Reciprocal Rank (MRR)?

**MRR** measures how quickly you find the first relevant result:
- If the first result is relevant: score = 1.0
- If the second result is relevant: score = 0.5
- If the third result is relevant: score = 0.33
- If no relevant results: score = 0

**Reciprocal Rank** = 1 / position_of_first_relevant_result

**Mean Reciprocal Rank** = average across all queries

**Example:**
- Query 1: First relevant result at position 1 → RR = 1.0
- Query 2: First relevant result at position 3 → RR = 0.33
- Query 3: First relevant result at position 2 → RR = 0.5

MRR = (1.0 + 0.33 + 0.5) / 3 = 0.61

## 4. How RQ is Measured

1. **Build an index** from the CNL document (scenes, entities, descriptions)
2. **Run each test query** through the search system
3. **Compare results** to the known correct answers
4. **Calculate MRR and Recall@k**

### 4.1 Deterministic baseline (normative)

- Index items MUST be **scenes** in canonical story order (`ctx.world.scenes.ordered_ids`, DS12).
- Each scene MUST be represented by its canonical text (`scene_text`, DS12).
- Embeddings MUST use the interpreter `profile`:
  - `vsa`: VSA/HDC embedding + cosine similarity (DS05)
  - `basic/bow`: bag-of-words cosine similarity
- Ranking MUST sort scenes by descending cosine similarity.
- Default `k = 5` unless a query specifies another `topK`.
- For each labeled query:
  - `RR = 1 / rank(first relevant)` or `0` if none found
  - `Recall@k = (# relevant in top k) / (# relevant total)`
- Final `RQ` value MUST be `MRR = average(RR over labeled queries)`.
- If no labeled queries are provided, the metric MUST be **skipped** (`value: null`, `pass: null`).

## 5. Threshold

Acceptance threshold: **MRR > 0.6**

This means on average, the first relevant result appears within the top 2 positions.

---

## 7. Related Documents

- DS03 — metric intent and threshold
- DS05 — VSA/HDC embedding backend (optional)
- DS12 — interpreter item extraction rules
