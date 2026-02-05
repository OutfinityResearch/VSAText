# DS16 — Metric Specification: Originality Index (OI)

## 1. Purpose

**Originality Index (OI)** measures how different a story is from known clichés and tropes. Higher scores mean more original content.

**Target: OI > 0.8** (higher is better)

## 2. The Problem OI Solves

AI-generated stories often fall into predictable patterns:
- The reluctant hero who is "the chosen one"
- The mentor who dies to motivate the hero
- The villain with a tragic backstory who wants to "remake the world"

While these tropes aren't inherently bad, over-reliance on them produces generic, forgettable stories. OI helps identify when content is too derivative.

## 3. Key Concepts

### What is a Trope Corpus?

A **trope corpus** is a database of common story patterns, each with a short description. Examples:

| Trope | Description |
|-------|-------------|
| Chosen One | A reluctant hero learns they are destined to save the world |
| Dead Mentor | The wise guide dies, forcing the hero to continue alone |
| Dark Lord | An ancient evil awakens and threatens civilization |
| Love Triangle | Two characters compete for the affection of a third |

We maintain a curated list of ~200 common tropes.

### What is Bag-of-Words?

**Bag-of-words** is a simple text representation method that counts word frequencies, ignoring order. "The brave hero fought the dragon" becomes: {the: 2, brave: 1, hero: 1, fought: 1, dragon: 1}.

Despite its simplicity, bag-of-words works surprisingly well for detecting thematic similarity.

## 4. How OI is Calculated

1. **Encode the story** as a vector (using bag-of-words or VSA)
2. **Encode each trope** in the corpus
3. **Find the most similar trope** using cosine similarity
4. **Compute originality** as the inverse:

```text
OI = 1 - max_similarity_to_any_trope
```

**Example:**
- Story has 0.15 similarity to "Chosen One" trope (highest match)
- OI = 1 - 0.15 = 0.85 (passes threshold)

**Input availability (normative)**
- If no trope corpus is provided to the interpreter (`options.corpora.tropes`, DS12), the metric MUST be **skipped** (`value: null`, `pass: null`).

## 5. Threshold

Acceptance threshold: **OI > 0.8**

This means the story should be at most 20% similar to any known trope.

---

## 7. Related Documents

- DS03 — metric intent and threshold
- DS05 — embedding backend (optional)
- DS12 — canonical text construction
