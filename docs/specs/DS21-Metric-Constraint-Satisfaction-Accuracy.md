# DS21 — Metric Specification: Constraint Satisfaction Accuracy (CSA)

## 1. Purpose

**Constraint Satisfaction Accuracy (CSA)** measures how well generated content respects the rules specified in CNL. If the author says "Story forbids violence," does the output actually avoid violence?

**Target: CSA >= 98%** (at least 98 out of 100 constraints must be satisfied)

## 2. What Are Constraints?

Constraints are rules that content must follow. CNL supports several types:

| Constraint | Meaning | Example |
|------------|---------|---------|
| `requires` | Must include this element | `Story requires "happy ending"` |
| `forbids` | Must NOT include this element | `Scene1 forbids "violence"` |
| `must` | Must contain this action | `Chapter1 must introduce Anna` |
| `has tone` | Must maintain this emotional tone | `Story has tone hopeful` |
| `has max` | Maximum count limit | `Story has max characters 10` |
| `has min` | Minimum count limit | `Book has min chapters 3` |

## 3. How Constraints Are Scoped

The subject of a constraint determines where it applies:

| Subject | Scope | Example |
|---------|-------|---------|
| Scene group | Just that scene | `Scene1 forbids "weapons"` |
| Chapter group | All scenes in chapter | `Chapter2 requires "Anna"` |
| Story/World | Entire document | `Story has tone hopeful` |

## 4. How Satisfaction is Checked

### 4.1 `requires "X"`

**Satisfied if** X appears in the scope through:
- Token match in text (the word/phrase is present)
- Entity reference (character/location included in scope)
- Event description containing the element

### 4.2 `forbids "X"`

**Satisfied if** X does NOT appear in the scope (same detection rules as requires).

### 4.3 `must action target`

**Satisfied if** an event with matching verb and target exists in scope.

Example: `Chapter1 must introduce Anna`
Check: Does Chapter1 contain an event like "Anna is introduced" or "Chapter introduces Anna"?

### 4.4 `has tone value`

**Satisfied if**:
- The scope explicitly declares this tone, OR
- Text analysis detects the tone (word frequencies match tone profile)

### 4.5 `has max/min count`

**Satisfied if** the counted items in scope respect the limit.

Example: `Story has max characters 10`
Check: Count distinct characters in story. Pass if count <= 10.

## 5. CSA Calculation

```text
CSA = (satisfied constraints) / (total constraints)
```

## 6. Threshold

Acceptance threshold: **CSA >= 98%**

---

## 8. Related Documents

- DS03 — metric intent and threshold
- DS11 — SVO constraints syntax
- DS12 — interpreter scope model

