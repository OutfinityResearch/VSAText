# DS14 — Metric Specification: Character Attribute Drift (CAD)

## 1. Purpose

**Character Attribute Drift (CAD)** measures whether characters stay true to their defined traits throughout a story. If you specify that Anna is "courageous," she shouldn't suddenly act cowardly without explanation.

**Target: CAD < 0.15** (lower is better - less drift is good)

## 2. The Problem CAD Solves

In long-form AI-generated narratives, characters often "drift" from their specifications:
- A brave hero becomes inexplicably timid
- A villain starts helping the protagonist for no reason
- Character voice and personality change between chapters

CAD detects this by comparing how characters are portrayed against their specified traits.

## 3. How It Works

### 3.1 Baseline: What the Character Should Be

We create a "fingerprint" of each character from their specification:

```text
Anna traits: courage, determination, loyalty
```

This gets converted to a numerical vector (a list of numbers) that represents the semantic meaning of these traits.

### 3.2 Observation: How the Character Actually Appears

We divide the story into windows (chunks of ~10,000 tokens) and extract sentences that mention each character. For each window, we create another vector representing how the character is portrayed.

### 3.3 Measuring Drift with Cosine Similarity

**Cosine similarity** measures how similar two vectors are, like comparing the "direction" they point. Two similar descriptions point in similar directions (similarity near 1.0); completely different descriptions point in different directions (similarity near 0 or negative).

**Drift** is the opposite of similarity:
```text
drift = 1 - similarity
```

If the portrayal matches the specification, drift is low. If they diverge, drift is high.

### 3.4 Per-Character and Overall Scores

For each character, we average drift across all story windows. The overall CAD is the average across all characters.

## 4. Example

**Specification:**
```text
Anna is protagonist
Anna has trait courage
Anna has trait determination
```

**Window 1 (Chapter 1):** "Anna charged into the burning building without hesitation..."
- Similarity to traits: 0.92
- Drift: 0.08 (good - consistent with traits)

**Window 2 (Chapter 5):** "Anna cowered behind the door, too afraid to move..."
- Similarity to traits: 0.65
- Drift: 0.35 (problem - drift detected!)

Overall CAD for Anna: (0.08 + 0.35) / 2 = 0.215 (fails threshold)

## 5. Technical Details

### 5.1 Vector Embeddings

Text is converted to vectors using one of two methods:
- **VSA (Hyperdimensional Computing):** Uses 10,000-dimensional vectors with special mathematical properties (see DS05)
- **Bag-of-words:** Simple word frequency counting, weighted by importance

Both methods produce comparable results; VSA offers better compositionality for complex queries.

### 5.2 Alias Support

Characters often have multiple names ("Anna," "Princess Anna," "she"). The system tracks aliases to catch all mentions of a character.

### 5.3 Window Size

Default: 10,000 tokens per window. This is roughly 7,500 words or about one novel chapter. Smaller windows catch more granular drift; larger windows smooth over temporary variations.

## 6. Threshold

Acceptance threshold: **CAD < 0.15**

## 6. Reporting (normative)

The metric report MUST include:
- overall `CAD`
- per-character `CAD_char(c)`
- number of analyzed windows per character
- the worst-scoring windows with evidence (scene IDs)

## 7. Notes (informative)

- If a document has no `describes "..."` statements, the interpreter SHOULD generate a deterministic event skeleton text and compute CAD on that.
- Alias support is critical for real drafts (nicknames, titles).

---

## 8. Related Documents

- DS03 — metric definition and threshold
- DS05 — VSA/HDC encoding backend (optional)
- DS12 — interpreter text construction and windowing

