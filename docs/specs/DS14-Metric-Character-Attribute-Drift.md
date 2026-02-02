# DS14 — Metric Specification: Character Attribute Drift (CAD)

## 1. Purpose

Defines **Character Attribute Drift (CAD)** as the semantic deviation of character traits from their specification across narrative progression (DS03).

CAD is computed deterministically from SVO CNL by comparing:
- **specified traits** (`X has trait T`)
- **observed portrayal** in scene text (preferred) or event skeleton text (fallback)

## 2. Inputs

From interpreter context `ctx`:
- Character declarations and traits:
  - `ctx.world.entities` where type is character/protagonist/antagonist/etc.
  - `traits(character)` from `has trait`
- Canonical document text:
  - `ctx.world.texts.document_text`
  - `ctx.world.texts.by_scene[scene_id]`
- Optional alias map:
  - `ctx.params.aliases` (character name → list of aliases)
- Embedding backend:
  - `ctx.profile` in `{basic, vsa}`

## 3. Definitions

Let:
- Character set `C = {c1..cm}` (characters that have at least one trait).
- Trait list for character `c`: `T(c) = [t1..tk]`.
- Document token stream length `N_tokens`.
- Window size `W = 10_000` tokens (default; configurable).
- Windows `w_j` for `j=1..J`, `J = ceil(N_tokens / W)`.

### 3.1 Baseline representation

Define a baseline text:
```text
BASE(c) = c.name + " traits: " + join(T(c), ", ")
```

Define vector embedding `V(x)`:
- If `profile=vsa`: use DS05 VSA encoding + cosine similarity.
- If `profile=basic`: use deterministic bag-of-words TF weighting (no deps).

Baseline vector:
```text
V_base(c) = V(BASE(c))
```

### 3.2 Observed portrayal per window

For each window `w_j`, extract character-relevant text:
- Collect all scene texts whose token ranges intersect `w_j`.
- Keep sentences that mention `c.name` or any alias.

Define:
```text
OBS(c, j) = concat(selected_sentences)
V_obs(c, j) = V(OBS(c, j))
```

If `OBS(c, j)` is empty, that window is skipped for that character.

## 4. Measurement Procedure (normative)

### 4.1 Window distance

Distance per window:
```text
d(c, j) = 1 - cosine(V_base(c), V_obs(c, j))
```

`d(c, j)` is in `[0, 2]` if cosine is `[-1, 1]`. The interpreter MUST clamp:
```text
d'(c, j) = clamp(d(c, j), 0, 1)
```

### 4.2 Per-character drift

Per-character drift is the mean distance over its observed windows:
```text
CAD_char(c) = average_j d'(c, j)
```

### 4.3 Overall CAD

Overall CAD is the mean of per-character values:
```text
CAD = average_c CAD_char(c)
```

Lower is better.

## 5. Threshold

Acceptance threshold:
- `CAD < 0.15`

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

