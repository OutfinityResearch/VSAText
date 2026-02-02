# DS17 — Metric Specification: Emotional Arc Profile (EAP)

## 1. Purpose

Defines **Emotional Arc Profile (EAP)** as similarity of the measured emotional trajectory to a target template (DS03).

EAP must work with SVO CNL by using:
- explicit mood/emotion statements in scenes, and/or
- deterministic sentiment estimation from scene text

## 2. Inputs

From interpreter context `ctx`:
- scene list `S = [s1..sn]`
- scene mood/emotion declarations (preferred):
  - `Scene has mood X`
  - `Mood has emotion E intensity I` or `Scene has emotion E intensity I`
- scene text `scene_text(s)`
- target arc template selection:
  - `Story has emotional_arc <template_id>` (recommended)
  - or a default template chosen by the host
- `ctx.corpora.arc_templates`: map template_id → vector values in `[0,1]`

## 3. Definitions

Let:
- `A_target = [a1..an]` target arc points (length `n`, resampled if needed)
- `A_measured = [m1..mn]` measured arc points in `[0,1]`

Similarity is **Pearson correlation**:
```text
r = cov(A_target, A_measured) / (std(A_target) * std(A_measured))
```

We normalize to `[0,1]` for reporting:
```text
EAP = (r + 1) / 2
```

Thresholds use correlation `r` (not normalized).

## 4. Measurement Procedure (normative)

### 4.1 Measured arc construction

Preferred: mood-based valence
1) Map each scene’s mood to a valence score:
   - valence lookup table is provided by config packs
2) If a scene has multiple emotions with intensities, compute:
```text
m_i = (sum_e valence(e) * intensity(e)) / (sum_e intensity(e))
```

Fallback: text-based valence (deterministic lexicon)
1) Use a fixed sentiment lexicon mapping words → valence in `[-1,1]`.
2) For scene text tokens:
```text
raw = average(valence(token)) over tokens present in lexicon
m_i = (raw + 1) / 2
```

### 4.2 Target arc alignment

If template length differs from `n`, resample by linear interpolation to length `n`.

### 4.3 Correlation

Compute Pearson correlation `r` between the two vectors.

## 5. Threshold

Acceptance threshold:
- correlation `r > 0.7`

## 6. Reporting (normative)

The metric report MUST include:
- correlation `r`
- normalized `EAP`
- measured arc points and target arc points
- method used (`mood` or `text`)

---

## 7. Related Documents

- DS03 — metric intent and threshold
- DS12 — canonical text and scene ordering

