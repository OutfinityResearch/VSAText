# DS04 — Controlled Natural Language (CNL) Specification

## 1. Purpose and Rationale

Natural language is inherently ambiguous. When an author writes "Anna should be brave," this could mean many things: Anna must never show fear, Anna should eventually become brave, Anna's bravery is her defining trait, or simply that bravery is preferred but not required. This ambiguity creates problems for automated systems that must verify whether generated content satisfies the author's intent.

Controlled Natural Language (CNL) is a restricted subset of natural language designed to eliminate ambiguity while remaining readable by humans. CNL uses a limited vocabulary, strict grammatical rules, and explicit logical operators to express constraints that can be unambiguously parsed and verified by machines. The key insight is that we sacrifice some expressiveness in exchange for precision—a worthwhile trade when we need guaranteed verification.

In SCRIPTA, CNL serves as the bridge between human creative intent and machine verification. Authors can express constraints in natural language, which the system translates to CNL. The CNL is then validated for grammatical correctness and used by verification agents to check generated content. This three-step process (express → translate → verify) provides both human readability and machine precision.

The design philosophy prioritizes simplicity and learnability over comprehensive expressiveness. We aim for a CNL that an author can learn in under an hour and that covers the most common narrative constraints, rather than a complex logical formalism that could theoretically express anything but that nobody would actually use. Experience with formal specification languages shows that adoption depends critically on perceived simplicity.


## 2. CNL Grammar and Syntax

The SCRIPTA CNL uses a predicate-based syntax inspired by logic programming languages like Prolog, but simplified for readability. Each statement consists of a predicate name followed by arguments in parentheses, terminated by a period. Arguments can be identifiers (like character names) or quoted strings (for arbitrary text).

The following table presents the core predicates supported in SCRIPTA CNL version 1.0.

| Predicate | Syntax | Meaning | Example |
|-----------|--------|---------|---------|
| CHARACTER | CHARACTER(Name) | Declares a named character | CHARACTER(Anna). |
| TRAIT | TRAIT(Name, Trait) | Assigns a persistent trait to a character | TRAIT(Anna, courageous). |
| GOAL | GOAL(Name, Action, Target) | Defines a character's objective | GOAL(Anna, protect, "brother"). |
| RELATIONSHIP | RELATIONSHIP(Name1, Relation, Name2) | Defines relationship between characters | RELATIONSHIP(Anna, sister_of, Marcus). |
| RULE | RULE(Scope, Operator, Value) | Defines a constraint on narrative element | RULE(Scene_3, must_include, "storm"). |
| TONE | TONE(Scope, Value) | Sets emotional tone for a scope | TONE(Story, hopeful). |
| SETTING | SETTING(Scope, Location, Time) | Defines setting parameters | SETTING(Act_1, "coastal village", "modern"). |
| THEME | THEME(Value) | Declares a story theme | THEME(redemption). |
| FORBID | FORBID(Element) | Explicitly prohibits an element | FORBID(supernatural_elements). |
| REQUIRE | REQUIRE(Scope, Element) | Requires element to appear | REQUIRE(Climax, confrontation). |

The scope argument can be "Story" for the entire narrative, "Act_N" for a specific act, "Scene_N" for a specific scene, or "Chapter_N" for a specific chapter. This allows constraints to be global or localized to specific portions of the narrative.

Identifiers follow standard programming conventions: they start with a letter and contain only letters, numbers, and underscores. They are case-sensitive, so "Anna" and "anna" are different identifiers. Quoted strings can contain any text and are used for values that need spaces or special characters.

Comments are supported using double slashes. Everything after // until the end of line is ignored by the parser. This allows authors to annotate their constraints with explanations or notes.


## 3. Translation from Natural Language

Most authors will not write CNL directly. Instead, they express constraints in natural language, and the system translates these to CNL. This translation uses a combination of rule-based pattern matching and language model assistance, with post-translation validation to catch errors.

The translation pipeline has three stages. First, natural language input is segmented into individual constraint statements using sentence boundary detection. Second, each statement is analyzed using pattern matching for common formulations and LLM-based translation for complex or ambiguous cases. Third, the generated CNL is validated against the grammar, and any errors trigger a clarification loop asking the author to rephrase.

The following table shows examples of natural language to CNL translation.

| Natural Language | Generated CNL | Translation Rule |
|------------------|---------------|------------------|
| "Anna must be courageous" | CHARACTER(Anna). TRAIT(Anna, courageous). | Pattern: "{Name} must be {Trait}" |
| "The story should have a hopeful ending" | TONE(Story, hopeful). | Pattern: "story should be/have {Tone}" |
| "A storm must appear in scene 3" | RULE(Scene_3, must_include, "storm"). | Pattern: "{Element} must appear in {Scope}" |
| "Anna wants to protect her brother" | GOAL(Anna, protect, "brother"). | Pattern: "{Name} wants to {Action} {Target}" |
| "No magic or supernatural elements" | FORBID(magic). FORBID(supernatural_elements). | Pattern: "No {Element}" |
| "The setting is a small coastal village in modern times" | SETTING(Story, "small coastal village", "modern"). | Pattern: "setting is {Location} in {Time}" |

Rule-based translation handles common patterns with high accuracy and speed. The system includes over 50 patterns covering typical constraint formulations. When no pattern matches, the system falls back to LLM translation, which is more flexible but may require validation.

Translation confidence is reported to the author. High-confidence translations (pattern match or high LLM confidence) are shown without warning. Medium-confidence translations include a note suggesting the author verify the interpretation. Low-confidence translations trigger a clarification dialog where the author can rephrase or manually edit the CNL.


## 4. Validation and Error Handling

Generated CNL must be validated before use. Validation checks both syntactic correctness (does the text follow the grammar?) and semantic consistency (do the constraints make sense together?).

Syntactic validation uses a parser generated from the formal grammar defined in src/cnl/grammar.ebnf. The parser produces structured output containing the list of successfully parsed statements and any syntax errors with line numbers and descriptions. A statement like "CHARACTER Anna." (missing parentheses) would produce a syntax error indicating the expected format.

Semantic validation checks for logical consistency between statements. For example, if two TRAIT statements assign contradictory traits to the same character, this is flagged as a potential conflict. If a GOAL references a character not declared with CHARACTER, this is flagged as an undefined reference. If a RULE references a scope that does not exist in the narrative structure, this is flagged as an invalid scope.

The following table describes the validation checks and their severity levels.

| Check | Severity | Description | Example |
|-------|----------|-------------|---------|
| Syntax error | Error | Statement does not follow grammar | "TRAIT Anna courageous" (missing punctuation) |
| Undefined character | Error | Reference to undeclared character | GOAL(Bob, escape, "prison"). without CHARACTER(Bob). |
| Invalid scope | Warning | Scope does not exist in plan | RULE(Scene_20, ...) when plan has only 10 scenes |
| Contradictory traits | Warning | Same character has conflicting traits | TRAIT(Anna, cowardly). after TRAIT(Anna, courageous). |
| Redundant statement | Info | Statement is already implied by another | Duplicate THEME statements |
| Unbound variable | Error | Predicate argument is empty or malformed | TRAIT(, courageous). |

Error severity determines system behavior. Errors prevent further processing until corrected. Warnings allow processing but are reported to the author for review. Info messages are logged but do not require action.

Error messages are designed to be actionable. Instead of just reporting "syntax error at line 5," the system provides specific guidance: "Line 5: Expected closing parenthesis after trait name. Did you mean: TRAIT(Anna, courageous).?" This approach significantly reduces author frustration and improves adoption.


## 5. Integration with Verification and Evaluation

Once validated, CNL constraints are stored in the constraint store associated with the narrative specification. Verification agents query this store to check generated content against the defined constraints.

For each constraint type, there is a corresponding verification procedure. TRAIT constraints are verified by extracting character mentions from generated text, computing trait embeddings for each mention, and measuring semantic similarity to the specified trait. If similarity falls below a threshold, a trait drift violation is flagged. RULE constraints with "must_include" are verified by checking whether the specified element appears in the target scope. FORBID constraints are verified by checking that the forbidden element does not appear anywhere in the narrative.

Verification produces a structured report linking each constraint to its verification result. The report includes the constraint CNL, whether it passed or failed, the evidence (specific text passages that support the conclusion), and confidence level. This report feeds into the compliance report and is stored in the audit log for traceability.

The system tracks two key metrics for CNL effectiveness. CNL Parse Success Rate (CPSR) measures what percentage of natural language inputs are successfully converted to valid CNL. The target is 95% or higher. Constraint Satisfaction Accuracy (CSA) measures what percentage of generated outputs satisfy the CNL constraints. The target is 98% or higher. These metrics are computed on the evaluation corpus stored in docs/evals/scripta_nl_cnl.jsonl, which contains over 100 paired examples of natural language inputs and their expected CNL outputs.

Future development will expand the CNL grammar to support more complex constraints, including temporal relationships (X must happen before Y), quantified constraints (at least 3 scenes must include conflict), and conditional constraints (if X happens, then Y must follow). Each expansion will be carefully validated to ensure it does not compromise the simplicity and learnability that are essential to adoption.
