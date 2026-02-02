# DS18 — Metric Specification: Retrieval Quality (RQ)

## 1. Purpose

Defines **Retrieval Quality (RQ)** for semantic search over project artifacts (DS03).

RQ is measured using a held-out query set with relevance judgments.

## 2. Inputs

From interpreter context `ctx`:
- indexable items derived from the CNL document:
  - scene texts
  - entity descriptions
  - world rules
  - (optional) draft artifacts
- `ctx.corpora.retrieval_queries`: list of queries with relevance labels
- embedding backend:
  - `ctx.profile` in `{basic, vsa}`

Query format (normative minimum):
```json
{
  "id": "q_001",
  "query": "storm at sea moral dilemma",
  "relevant_ids": ["scene_3", "scene_4"]
}
```

## 3. Definitions

Let:
- Query set `Q = {q1..qm}`
- For each query `q`, the system returns ranked list `R_q` of item IDs.

### 3.1 Recall@k

```text
Recall@k(q) = |top_k(R_q) ∩ Relevant(q)| / |Relevant(q)|
Recall@k = average_q Recall@k(q)
```

### 3.2 Mean Reciprocal Rank (MRR)

Let `rank_q` be the rank (1-based) of the first relevant item in `R_q` (or ∞ if none).

```text
RR(q) = 0 if no relevant item is retrieved else 1 / rank_q
MRR = average_q RR(q)
```

RQ uses MRR as the primary threshold metric.

## 4. Measurement Procedure (normative)

1) Build index items deterministically from the interpreter world:
   - `item_id`, `item_text`, `item_type`
2) For each query `q`:
   - embed query and item texts
   - compute cosine similarity
   - rank items descending by similarity
3) Compute Recall@k and MRR.

## 5. Threshold

Acceptance threshold:
- `MRR > 0.6`

## 6. Reporting (normative)

The metric report MUST include:
- `MRR`
- `Recall@5`, `Recall@10`
- per-query RR and rank of first relevant hit
- index size and item type distribution

---

## 7. Related Documents

- DS03 — metric intent and threshold
- DS05 — VSA/HDC embedding backend (optional)
- DS12 — interpreter item extraction rules

