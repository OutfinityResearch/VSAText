# DS16 — Metric Specification: Originality Index (OI)

## 1. Purpose

Defines **Originality Index (OI)** as semantic distance from a curated trope/cliché corpus (DS03).

OI is computed deterministically using the interpreter’s canonical text:
- preferred: scene `describes` text
- fallback: event skeleton text

## 2. Inputs

From interpreter context `ctx`:
- `ctx.world.texts.document_text`
- `ctx.corpora.tropes`: list of trope entries with stable IDs and short descriptions
- `ctx.profile` in `{basic, vsa}`
- `ctx.params.oi.threshold_similarity` default `0.2` (for reporting only)

Trope corpus entry (normative minimum):
```json
{ "id": "trope_001", "title": "Chosen One", "text": "A reluctant hero learns they are destined…", "tags": ["fantasy"] }
```

## 3. Definitions

Let:
- `T = {t1..tp}` tropes
- `V(x)` embedding of text `x` (DS05 if `vsa`, otherwise deterministic bag-of-words)
- `sim(x,y) = cosine(V(x), V(y))`

Define:
```text
sim_max = max_t sim(doc_text, trope_text(t))
OI = 1 - clamp(sim_max, 0, 1)
```

Higher is better.

## 4. Measurement Procedure (normative)

1) Build `doc_text` from interpreter (DS12).
2) Compute `V(doc_text)`.
3) For each trope `t`, compute `V(t.text)` and similarity.
4) Take maximum similarity and compute OI.

## 5. Threshold

Acceptance threshold:
- `OI > 0.8`

## 6. Reporting (normative)

The metric report MUST include:
- `OI` value
- `sim_max`
- top-k most similar tropes with similarity scores
- corpus version identifier (hash)

---

## 7. Related Documents

- DS03 — metric intent and threshold
- DS05 — embedding backend (optional)
- DS12 — canonical text construction

