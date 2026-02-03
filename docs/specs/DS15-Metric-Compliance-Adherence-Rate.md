# DS15 — Metric Specification: Compliance Adherence Rate (CAR)

## 1. Purpose

**Compliance Adherence Rate (CAR)** measures the percentage of generated content that passes safety and quality checks. These checks are called **guardrails** - automated systems that catch problematic content before it reaches users.

**Target: CAR >= 99.9%** (at least 999 out of 1000 outputs must pass)

## 2. What Are Guardrails?

Guardrails are protective filters that catch:

| Type | What It Catches | Example |
|------|-----------------|---------|
| **Bias/Stereotypes** | Harmful generalizations about groups | "All [group] are lazy" |
| **PII (Personal Info)** | Real names, addresses, phone numbers | "John Smith at 123 Main St" |
| **Harmful Content** | Violence, illegal activity instructions | Detailed weapon construction |
| **Plagiarism** | Copying existing published works | Verbatim passages from books |
| **Clichés** | Overused phrases that reduce quality | "It was a dark and stormy night" |

**PII** stands for **Personally Identifiable Information** - any data that could identify a real person. AI systems shouldn't generate content containing real people's private information.

## 3. How Findings Are Classified

When guardrails detect an issue, they assign a severity level:

| Severity | Meaning | Example |
|----------|---------|---------|
| **Info** | Minor note, no action needed | "Consider varying word choice" |
| **Warning** | Potential issue worth reviewing | "Phrase may reinforce stereotype" |
| **Error** | Must be fixed before use | "Contains mildly harmful content" |
| **Critical** | Cannot be used at all | "Contains hate speech" |

## 4. Pass/Fail Status

Each piece of content gets a status based on its worst finding:

- **Pass**: No errors or critical issues (may have info/warnings)
- **Warn**: Has warnings but no errors
- **Fail**: Has at least one error
- **Reject**: Has at least one critical issue

## 5. CAR Calculation

**Strict CAR** (used for threshold): Only "pass" counts as success
```text
CAR_strict = (number of passes) / (total artifacts)
```

**Lenient CAR** (informational): "Pass" and "warn" both count
```text
CAR_lenient = (passes + warns) / (total artifacts)
```

## 6. Threshold

Acceptance threshold: **CAR_strict >= 99.9%**

This high bar ensures generated content is safe for real users.

---

## 8. Related Documents

- DS03 — metric intent and threshold
- DS12 — evaluation suite integration

