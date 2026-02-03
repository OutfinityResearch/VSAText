# DS22 — Metric Specification: Explainability Score (XAI)

## 1. Purpose

**Explainability Score (XAI)** measures how well the system explains its decisions to authors. When the system rejects content or suggests changes, can authors understand why?

**Target: XAI >= 4.0 out of 5.0**

## 2. Why Explainability Matters

An AI system that says "Your scene failed coherence checks" without explanation is frustrating and unhelpful. Authors need to understand:
- What exactly failed?
- Why is it considered a problem?
- How can I fix it?

Good explanations build trust and help authors improve their work.

## 3. This is a Human-Rated Metric

Unlike other metrics that are calculated automatically, XAI comes from author surveys after using the system. Authors rate their experience on a 1-5 scale (1 = strongly disagree, 5 = strongly agree).

## 4. Survey Questions

Authors answer four core questions:

| Dimension | Question |
|-----------|----------|
| **Clarity** | "The explanation was clear and easy to understand." |
| **Evidence** | "The explanation cited concrete evidence from my story/specification." |
| **Actionability** | "The explanation helped me decide what to change next." |
| **Trust** | "The explanation increased my trust in the system's evaluation." |

Optional additional questions:
- Conciseness: "The explanation was appropriately brief without losing important details."
- Non-intrusiveness: "The explanations didn't interrupt my creative flow."

## 5. How XAI is Calculated

For each author session, average the four core question ratings:

```text
session_score = (clarity + evidence + actionability + trust) / 4
```

Overall XAI is the average across all sessions:

```text
XAI = average(all session scores)
```

## 6. Threshold

Acceptance threshold: **XAI >= 4.0**

This means authors generally agree or strongly agree that explanations are helpful.

---

## 7. Related Documents

- DS03 — metric intent and threshold
- DS12 — evaluation suite protocol

