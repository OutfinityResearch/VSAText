# DS20 — Metric Specification: CNL Parse Success Rate (CPSR)

## 1. Purpose

Defines **CNL Parse Success Rate (CPSR)** as the percentage of natural language (NL) inputs successfully converted to **valid SVO CNL** (DS03), validated by the unified SVO parser (DS11).

This metric does not require generated story quality; it measures the translation pipeline reliability.

## 2. Inputs

For a translation system `Translate(nl_text) -> cnl_text`:
- NL input corpus `NL = {u1..um}`
- Generated outputs `CNL_i = Translate(u_i)`
- Parser and semantic validator from the interpreter (DS12):
  - parse errors
  - semantic errors/warnings
- `strict` mode flag (DS12):
  - if true, semantic warnings count as failure

## 3. Definitions

For each input `u_i`, define:
- `parse_ok(i) = 1` if the SVO parser produces an AST with no parse errors.
- `semantic_ok(i) = 1` if semantic validation has no errors (and no warnings in strict mode).

Success indicator:
```text
success(i) = parse_ok(i) AND semantic_ok(i)
```

CPSR:
```text
CPSR = (sum_i success(i)) / m
```

## 4. Measurement Procedure (normative)

1) Choose a fixed NL corpus with stable IDs and domains (book/screenplay/tutorial).
2) Run the translator to produce `cnl_text` for each item.
3) Parse + semantic validate each output.
4) Compute CPSR and report common failure classes.

## 5. Threshold

Acceptance threshold:
- `CPSR >= 0.95`

## 6. Reporting (normative)

The report MUST include:
- CPSR
- counts of failure categories:
  - syntax errors (unterminated quotes, invalid group nesting, unknown verbs)
  - semantic errors (orphan refs, invalid constraint shapes)
- top 10 most frequent error messages

---

## 7. Related Documents

- DS03 — metric intent and threshold
- DS11 — SVO CNL unification
- DS12 — parser/validator integration

