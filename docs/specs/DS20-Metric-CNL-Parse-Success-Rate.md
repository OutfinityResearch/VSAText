# DS20 — Metric Specification: CNL Parse Success Rate (CPSR)

## 1. Purpose

**CNL Parse Success Rate (CPSR)** measures how reliably the system converts natural language into valid CNL. When an author writes "Anna is a brave warrior who lives in the forest," can the system produce correct CNL syntax?

**Target: CPSR >= 95%** (at least 95 out of 100 translations must succeed)

## 2. Why CPSR Matters

CPSR doesn't measure story quality - it measures pipeline reliability. Before we can evaluate coherence or character drift, we need valid CNL. If translation frequently fails, authors get frustrated and the system becomes unusable.

## 3. What Counts as Success?

A translation succeeds if the generated CNL:

1. **Parses without errors** - No syntax problems like unclosed quotes or invalid group nesting
2. **Validates semantically** - No references to undefined entities, no impossible constraints

In **strict mode**, warnings also count as failures. This is useful for quality assurance but may be too strict for early prototypes.

## 4. Common Failure Types

| Category | Example Problem |
|----------|-----------------|
| Syntax errors | Unclosed quotes: `Anna has trait "courage` |
| Invalid groups | Missing `group end` statement |
| Unknown verbs | Using verbs not in the vocabulary |
| Orphan references | `Scene includes character Bob` when Bob isn't declared |
| Invalid constraints | `has max scenes -5` (negative numbers) |

## 5. How CPSR is Calculated

```text
CPSR = (successful translations) / (total attempts)
```

**Example:**
- 100 natural language inputs
- 97 produce valid CNL
- 3 have parse or semantic errors

CPSR = 97 / 100 = 0.97 (97%) - passes threshold

## 6. Threshold

Acceptance threshold: **CPSR >= 95%**

---

## 7. Related Documents

- DS03 — metric intent and threshold
- DS11 — SVO CNL unification
- DS12 — parser/validator integration

