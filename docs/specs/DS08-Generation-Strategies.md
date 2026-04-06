# DS08 — Generation Strategies

## Overview

SCRIPTA provides three distinct story generation strategies. Authors can choose between them based on speed requirements, quality expectations, API availability, and how much structural optimization they want before drafting.

In the current product, these strategies are used after the author has created a project foundation and, in the standard workflow, reviewed the story structure and formal specification.

## Strategy Comparison

| Strategy | Speed | Quality | API Required | Best For |
|----------|-------|---------|--------------|----------|
| Random | Instant (~100ms) | Good | No | Quick prototyping and broad exploration |
| LLM | Slow (~10-30s) | High | Yes | Richer and more creative drafts |
| Advanced | Medium (~5-15s) | Optimized | Optional | Stronger metric performance and structural quality |

## Random Generation Strategy

### Description

The Random strategy is a fast, deterministic generation mode that uses predefined vocabularies and randomized templates. It produces complete story specifications instantly and works without external dependencies.

### Algorithm

```text
1. Select genre configuration
2. Generate characters and traits
3. Generate relationships
4. Generate locations
5. Generate plot elements
6. Build chapters and scenes
7. Apply arc and beat placement
8. Calculate tension curve
9. Save generation snapshot
```

### Inputs

| Parameter | Values | Effect |
|-----------|--------|--------|
| Genre | fantasy, scifi, mystery, romance, horror, adventure, drama, comedy | Determines vocabularies and archetypes |
| Length | short, medium, long | Determines scene count and structure size |
| Characters | few, medium, many | Determines number of main characters |
| Tone | dark, balanced, light, comedic | Influences mood and stylistic direction |
| Complexity | simple, moderate, complex | Influences subplot density and structure depth |
| World Rules | none, few, many | Influences the amount of rule-based world detail |

### Output Quality

| Signal | Typical Range |
|--------|----------------|
| Coverage | 90-100% |
| Coherence | 70-85% |
| Originality | 50-70% |
| NQS | 65-80% |

### Best Use

This strategy is best for rapid ideation, fast offline work, structural exploration, and creating a starting point for later refinement.

## LLM Generation Strategy

### Description

The LLM strategy uses a language model to generate creative and contextually richer story specifications or drafts. It is slower than Random generation, but typically produces more nuanced relationships, naming choices, and structural detail.

### Generation Flow

The author selects generation options in the browser. The application prepares a structured request and sends it to the server-side generation endpoint. The server calls the LLM service, parses the response, and returns a structured result that updates the project state.

### Prompt Structure

The LLM prompt includes a role definition, the selected project parameters, the expected output structure, and quality requirements such as coherence, coverage, genre fit, and structural completeness.

### Fallback Mode

When an LLM is unavailable because of missing configuration, API failure, or network issues, the system falls back to a deterministic generation path. The returned result should make clear that fallback behavior was used.

### Requirements

This strategy requires an available model endpoint and valid configuration for the selected provider.

### Output Quality

| Signal | Typical Range |
|--------|----------------|
| Coverage | 85-95% |
| Coherence | 85-95% |
| Originality | 75-90% |
| NQS | 75-90% |

### Best Use

This strategy is best when the author wants richer prose, more nuanced story material, and stronger semantic quality than a purely random workflow can provide.

## Advanced Generation Strategy

### Description

The Advanced strategy is a multi-pass generation mode that combines generation, evaluation, and optimization. Its purpose is to improve structural quality and metric performance before returning the best available result.

### Algorithm

```text
1. Initialize targets and iteration limits
2. Generate a candidate specification
3. Evaluate the candidate
4. Track the best result
5. Apply structural and metric-driven fixes
6. Repeat until target or iteration limit is reached
7. Return the best result
```

### Optimization Focus

The Advanced strategy focuses on improving coherence, coverage, emotional arc quality, character consistency, and constraint satisfaction. It may also apply non-destructive refinement steps when a richer generation backend is available.

### Metric Weights

| Metric | Weight | Target |
|--------|--------|--------|
| NQS | 0.25 | >= 85% |
| Coherence | 0.20 | >= 75% |
| Coverage | 0.15 | >= 80% |
| EAP | 0.10 | >= 70% |
| CAD (inverted) | 0.10 | <= 15% |
| CAR | 0.10 | >= 95% |
| CSA | 0.10 | >= 95% |

### Output Quality

| Signal | Typical Range |
|--------|----------------|
| Coverage | 95-100% |
| Coherence | 90-98% |
| NQS | 80-95% |

### Best Use

This strategy is best when the author wants the strongest available structural quality, better metric performance, and more optimization before manual revision.

## Strategy Selection Guidance

Random is the best choice for instant exploration and offline work. LLM is the best choice for richer and more semantically nuanced generation. Advanced is the best choice when structural optimization and stronger metric performance matter more than absolute speed.

## Integration in the Workflow

Generation strategies are typically selected in `NL Story` after the author has created a project in the `New Project` wizard, moved through `Processing`, reviewed structure in `Blueprint`, and reviewed or adjusted the formal specification in `CNL Editor`.

The chosen strategy operates on the current project foundation and specification, then returns a draft or generation result that can be reviewed, improved, regenerated, and refined in later stages of the workflow.
