# DS22 — Metric Specification: Explainability Score (XAI)

## 1. Purpose

Defines **Explainability Score** as the author’s rating of explanation quality (DS03).

This is a human-measured metric captured by the product UI and stored with evaluation runs.

## 2. Inputs

For each task/session:
- explanation artifacts shown to the author (e.g., “why did this fail?”)
- a post-task survey filled by the author

Survey MUST record:
- `case_id`, `variant`, `timestamp`, `author_id` (pseudonymous)

## 3. Survey Instrument (normative)

Scale: Likert 1–5 (1=strongly disagree, 5=strongly agree).

Minimum required items:
1) **Clarity**: “The explanation was clear and easy to understand.”
2) **Evidence**: “The explanation cited concrete evidence from the artifact/spec.”
3) **Actionability**: “The explanation helped me decide what to change next.”
4) **Trust**: “The explanation increased my trust in the system’s evaluation.”

Optionally:
5) **Conciseness**
6) **Non-intrusiveness**

## 4. Definition

Let `score_i` be the average of the required items for session `i`:
```text
score_i = average(item_1..item_4) in [1,5]
```

Explainability Score for a corpus:
```text
XAI = average_i score_i
```

## 5. Threshold

Acceptance threshold:
- `XAI >= 4.0` (average)

## 6. Reporting (normative)

The report MUST include:
- `XAI` mean
- distribution (histogram of 1..5)
- confidence interval (95%)
- per-variant breakdown

---

## 7. Related Documents

- DS03 — metric intent and threshold
- DS12 — evaluation suite protocol

