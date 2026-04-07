<!-- {"achilles-ide-document":{"id":"L1ZTQVRleHQvZG9jcy9zcGVjcy9EUzA4LUdlbmVyYXRpb24tU3RyYXRlZ2llcy5tZA==","title":"DS08-Generation-Strategies","version":1,"updatedAt":"2026-04-07T05:22:25.650Z"}} -->
<!-- {"achilles-ide-chapter":{"id":"chapter-71447b49-9a8f-4a0e-b33d-fd5bda6bf01f","title":"DS08 — Generation Strategies","anchorId":"chapter-chapter-71447b49-9a8f-4a0e-b33d-fd5bda6bf01f"}} -->
<a id="chapter-chapter-71447b49-9a8f-4a0e-b33d-fd5bda6bf01f"></a>
# DS08 — Generation Strategies
<!-- {"achilles-ide-paragraph":{"id":"paragraph-ec35f032-09df-4b4d-a565-ff7831fe58bf","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-ac5527f2-4a96-4828-8f1f-bf91aa6b7c70","title":"Overview","anchorId":"chapter-chapter-ac5527f2-4a96-4828-8f1f-bf91aa6b7c70"}} -->
<a id="chapter-chapter-ac5527f2-4a96-4828-8f1f-bf91aa6b7c70"></a>
## Overview
<!-- {"achilles-ide-paragraph":{"id":"paragraph-66abd746-50c1-4bd5-bf50-ffa25551b2f7","type":"markdown","title":"Paragraph 1"}} -->
SCRIPTA provides three distinct story generation strategies. Authors can choose between them based on speed requirements, quality expectations, API availability, and how much structural optimization they want before drafting.

In the current product, these strategies are used after the author has created a project foundation and, in the standard workflow, reviewed the story structure and formal specification.


<!-- {"achilles-ide-chapter":{"id":"chapter-73dd8b77-b9b1-4684-8294-5262dc995c8a","title":"Strategy Comparison","anchorId":"chapter-chapter-73dd8b77-b9b1-4684-8294-5262dc995c8a"}} -->
<a id="chapter-chapter-73dd8b77-b9b1-4684-8294-5262dc995c8a"></a>
## Strategy Comparison
<!-- {"achilles-ide-paragraph":{"id":"paragraph-9cfc28d9-ffd9-4e34-a97e-1e16e7c79508","type":"markdown","title":"Paragraph 1"}} -->
| Strategy | Speed | Quality | API Required | Best For |
|----------|-------|---------|--------------|----------|
| Random | Instant (~100ms) | Good | No | Quick prototyping and broad exploration |
| LLM | Slow (~10-30s) | High | Yes | Richer and more creative drafts |
| Advanced | Medium (~5-15s) | Optimized | Optional | Stronger metric performance and structural quality |


<!-- {"achilles-ide-chapter":{"id":"chapter-1f859213-7ad6-4829-aaa2-231cff9339c4","title":"Random Generation Strategy","anchorId":"chapter-chapter-1f859213-7ad6-4829-aaa2-231cff9339c4"}} -->
<a id="chapter-chapter-1f859213-7ad6-4829-aaa2-231cff9339c4"></a>
## Random Generation Strategy
<!-- {"achilles-ide-paragraph":{"id":"paragraph-a266015d-4ddf-4093-89eb-c910415db4c2","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-f9a470f9-4113-4834-8951-800980931551","title":"Description","anchorId":"chapter-chapter-f9a470f9-4113-4834-8951-800980931551"}} -->
<a id="chapter-chapter-f9a470f9-4113-4834-8951-800980931551"></a>
### Description
<!-- {"achilles-ide-paragraph":{"id":"paragraph-148af82b-5562-490a-8cc5-1ee1cf42baa9","type":"markdown","title":"Paragraph 1"}} -->
The Random strategy is a fast, deterministic generation mode that uses predefined vocabularies and randomized templates. It produces complete story specifications instantly and works without external dependencies.

This strategy is best for rapid ideation, fast offline work, structural exploration, and creating a starting point for later refinement.


<!-- {"achilles-ide-chapter":{"id":"chapter-956cc8d3-15b2-465e-87df-16cddc4158df","title":"Algorithm","anchorId":"chapter-chapter-956cc8d3-15b2-465e-87df-16cddc4158df"}} -->
<a id="chapter-chapter-956cc8d3-15b2-465e-87df-16cddc4158df"></a>
### Algorithm
<!-- {"achilles-ide-paragraph":{"id":"paragraph-d4b08914-68d8-479a-8ede-204767fcea4f","type":"markdown","title":"Paragraph 1"}} -->
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


<!-- {"achilles-ide-chapter":{"id":"chapter-95d7d124-9226-4d8f-9211-301c12f58cb7","title":"Inputs","anchorId":"chapter-chapter-95d7d124-9226-4d8f-9211-301c12f58cb7"}} -->
<a id="chapter-chapter-95d7d124-9226-4d8f-9211-301c12f58cb7"></a>
### Inputs
<!-- {"achilles-ide-paragraph":{"id":"paragraph-b9546a7c-5742-4a7d-b02c-529689251fc7","type":"markdown","title":"Paragraph 1"}} -->
| Parameter | Values | Effect |
|-----------|--------|--------|
| Genre | fantasy, scifi, mystery, romance, horror, adventure, drama, comedy | Determines vocabularies and archetypes |
| Length | short, medium, long | Determines scene count and structure size |
| Characters | few, medium, many | Determines number of main characters |
| Tone | dark, balanced, light, comedic | Influences mood and stylistic direction |
| Complexity | simple, moderate, complex | Influences subplot density and structure depth |
| World Rules | none, few, many | Influences the amount of rule-based world detail |


<!-- {"achilles-ide-chapter":{"id":"chapter-39db8aa0-55da-41b5-aba9-597fbb324434","title":"Output Quality","anchorId":"chapter-chapter-39db8aa0-55da-41b5-aba9-597fbb324434"}} -->
<a id="chapter-chapter-39db8aa0-55da-41b5-aba9-597fbb324434"></a>
### Output Quality
<!-- {"achilles-ide-paragraph":{"id":"paragraph-92d04e8c-ae71-4e56-8876-f530c9e427dd","type":"markdown","title":"Paragraph 1"}} -->
| Signal | Typical Range |
|--------|----------------|
| Coverage | 90-100% |
| Coherence | 70-85% |
| Originality | 50-70% |
| NQS | 65-80% |


<!-- {"achilles-ide-chapter":{"id":"chapter-85d3cb83-bf55-47bb-acab-bb46a1b57535","title":"LLM Generation Strategy","comments":{"collapsed":false},"anchorId":"chapter-chapter-85d3cb83-bf55-47bb-acab-bb46a1b57535"}} -->
<a id="chapter-chapter-85d3cb83-bf55-47bb-acab-bb46a1b57535"></a>
## LLM Generation Strategy

<!-- {"achilles-ide-chapter":{"id":"chapter-716d95de-07cf-457b-9b65-12961a54d8f1","title":"Description","anchorId":"chapter-chapter-716d95de-07cf-457b-9b65-12961a54d8f1"}} -->
<a id="chapter-chapter-716d95de-07cf-457b-9b65-12961a54d8f1"></a>
### Description
<!-- {"achilles-ide-paragraph":{"id":"paragraph-dc0a1aa2-fe82-4c9d-bd6a-18aa646a67f3","type":"markdown","title":"Paragraph 1"}} -->
The LLM strategy uses a language model to generate creative and contextually richer story specifications or drafts. It is slower than Random generation, but typically produces more nuanced relationships, naming choices, and structural detail.


<!-- {"achilles-ide-chapter":{"id":"chapter-18faee19-cb43-4a7a-8ccf-4b0fbc58dc6e","title":"Generation Flow","anchorId":"chapter-chapter-18faee19-cb43-4a7a-8ccf-4b0fbc58dc6e"}} -->
<a id="chapter-chapter-18faee19-cb43-4a7a-8ccf-4b0fbc58dc6e"></a>
### Generation Flow
<!-- {"achilles-ide-paragraph":{"id":"paragraph-e4b7794d-3071-4f44-9324-1d81d295d1dd","type":"markdown","title":"Paragraph 1"}} -->
The author selects generation options in the browser. The application prepares a structured request and sends it to the server-side generation endpoint. The server calls the LLM service, parses the response, and returns a structured result that updates the project state.


<!-- {"achilles-ide-chapter":{"id":"chapter-621c4758-860b-4342-91e4-980c2eb24ba2","title":"Prompt Structure","anchorId":"chapter-chapter-621c4758-860b-4342-91e4-980c2eb24ba2"}} -->
<a id="chapter-chapter-621c4758-860b-4342-91e4-980c2eb24ba2"></a>
### Prompt Structure
<!-- {"achilles-ide-paragraph":{"id":"paragraph-1f2850c1-b2a6-4a35-9e88-25df2f28e1e9","type":"markdown","title":"Paragraph 1"}} -->
The LLM prompt includes a role definition, the selected project parameters, the expected output structure, and quality requirements such as coherence, coverage, genre fit, and structural completeness.


<!-- {"achilles-ide-chapter":{"id":"chapter-b8e9c23e-39aa-4cfc-ab53-2dec67c35405","title":"Fallback Mode","anchorId":"chapter-chapter-b8e9c23e-39aa-4cfc-ab53-2dec67c35405"}} -->
<a id="chapter-chapter-b8e9c23e-39aa-4cfc-ab53-2dec67c35405"></a>
### Fallback Mode
<!-- {"achilles-ide-paragraph":{"id":"paragraph-e43cb6cf-8728-4bbb-94bb-8b297f967594","type":"markdown","title":"Paragraph 1"}} -->
When an LLM is unavailable because of missing configuration, API failure, or network issues, the system falls back to a deterministic generation path. The returned result should make clear that fallback behavior was used.


<!-- {"achilles-ide-chapter":{"id":"chapter-2d9c746b-73f8-441b-b40d-938d3ace9e2a","title":"Requirements","anchorId":"chapter-chapter-2d9c746b-73f8-441b-b40d-938d3ace9e2a"}} -->
<a id="chapter-chapter-2d9c746b-73f8-441b-b40d-938d3ace9e2a"></a>
### Requirements
<!-- {"achilles-ide-paragraph":{"id":"paragraph-0722aab0-36f4-48f9-96dd-d05ddffa30a9","type":"markdown","title":"Paragraph 1"}} -->
This strategy requires an available model endpoint and valid configuration for the selected provider.


<!-- {"achilles-ide-chapter":{"id":"chapter-2646bac1-1f58-4127-9afc-bcd829e9b8cf","title":"Output Quality","anchorId":"chapter-chapter-2646bac1-1f58-4127-9afc-bcd829e9b8cf"}} -->
<a id="chapter-chapter-2646bac1-1f58-4127-9afc-bcd829e9b8cf"></a>
### Output Quality
<!-- {"achilles-ide-paragraph":{"id":"paragraph-3e1d3241-6d9b-4af6-9b22-2864eacee7d6","type":"markdown","title":"Paragraph 1"}} -->
| Signal | Typical Range |
|--------|----------------|
| Coverage | 85-95% |
| Coherence | 85-95% |
| Originality | 75-90% |
| NQS | 75-90% |


<!-- {"achilles-ide-chapter":{"id":"chapter-d7a34ae3-9495-4e0a-ba3b-7fd1733ba577","title":"Advanced Generation Strategy","anchorId":"chapter-chapter-d7a34ae3-9495-4e0a-ba3b-7fd1733ba577"}} -->
<a id="chapter-chapter-d7a34ae3-9495-4e0a-ba3b-7fd1733ba577"></a>
## Advanced Generation Strategy
<!-- {"achilles-ide-paragraph":{"id":"paragraph-40debed8-c415-4887-b124-02f0db7a000f","type":"markdown","title":"Paragraph 1"}} -->


<!-- {"achilles-ide-chapter":{"id":"chapter-43ae5ab7-d8f9-45cf-9128-1a4395ecd38d","title":"Description","anchorId":"chapter-chapter-43ae5ab7-d8f9-45cf-9128-1a4395ecd38d"}} -->
<a id="chapter-chapter-43ae5ab7-d8f9-45cf-9128-1a4395ecd38d"></a>
### Description
<!-- {"achilles-ide-paragraph":{"id":"paragraph-728f96c7-20f8-4f60-afc6-f73f61da5c67","type":"markdown","title":"Paragraph 1"}} -->
The Advanced strategy is a multi-pass generation mode that combines generation, evaluation, and optimization. Its purpose is to improve structural quality and metric performance before returning the best available result.


<!-- {"achilles-ide-chapter":{"id":"chapter-34b87fc6-f49e-44d9-a9d9-abb33762b3b0","title":"Algorithm","anchorId":"chapter-chapter-34b87fc6-f49e-44d9-a9d9-abb33762b3b0"}} -->
<a id="chapter-chapter-34b87fc6-f49e-44d9-a9d9-abb33762b3b0"></a>
### Algorithm
<!-- {"achilles-ide-paragraph":{"id":"paragraph-09dcf445-a7c8-4873-8a9f-a5fdc059c888","type":"markdown","title":"Paragraph 1"}} -->
```text
1. Initialize targets and iteration limits
2. Generate a candidate specification
3. Evaluate the candidate
4. Track the best result
5. Apply structural and metric-driven fixes
6. Repeat until target or iteration limit is reached
7. Return the best result
```


<!-- {"achilles-ide-chapter":{"id":"chapter-919a8640-3ad2-4491-a701-0501ff8e03ce","title":"Optimization Focus","anchorId":"chapter-chapter-919a8640-3ad2-4491-a701-0501ff8e03ce"}} -->
<a id="chapter-chapter-919a8640-3ad2-4491-a701-0501ff8e03ce"></a>
### Optimization Focus
<!-- {"achilles-ide-paragraph":{"id":"paragraph-fa1d8ea0-9b20-4ddf-84b6-806066af167f","type":"markdown","title":"Paragraph 1"}} -->
The Advanced strategy focuses on improving coherence, coverage, emotional arc quality, character consistency, and constraint satisfaction. It may also apply non-destructive refinement steps when a richer generation backend is available.


<!-- {"achilles-ide-chapter":{"id":"chapter-81c0dd07-fc9c-4f95-9e39-c8de96090315","title":"Metric Weights","anchorId":"chapter-chapter-81c0dd07-fc9c-4f95-9e39-c8de96090315"}} -->
<a id="chapter-chapter-81c0dd07-fc9c-4f95-9e39-c8de96090315"></a>
### Metric Weights
<!-- {"achilles-ide-paragraph":{"id":"paragraph-0628df7b-f79c-4642-8bcb-0d10ce5c8b0e","type":"markdown","title":"Paragraph 1"}} -->
| Metric | Weight | Target |
|--------|--------|--------|
| NQS | 0.25 | >= 85% |
| Coherence | 0.20 | >= 75% |
| Coverage | 0.15 | >= 80% |
| EAP | 0.10 | >= 70% |
| CAD (inverted) | 0.10 | <= 15% |
| CAR | 0.10 | >= 95% |
| CSA | 0.10 | >= 95% |


<!-- {"achilles-ide-chapter":{"id":"chapter-95e7f47a-c66f-4cab-879c-3b6e8e8e5934","title":"Output Quality","anchorId":"chapter-chapter-95e7f47a-c66f-4cab-879c-3b6e8e8e5934"}} -->
<a id="chapter-chapter-95e7f47a-c66f-4cab-879c-3b6e8e8e5934"></a>
### Output Quality
<!-- {"achilles-ide-paragraph":{"id":"paragraph-f72f797a-78c3-4ff6-afe4-9b69a6d0dec7","type":"markdown","title":"Paragraph 1"}} -->
| Signal | Typical Range |
|--------|----------------|
| Coverage | 95-100% |
| Coherence | 90-98% |
| NQS | 80-95% |


<!-- {"achilles-ide-chapter":{"id":"chapter-a4db6965-2250-408b-a198-77bb8f54b311","title":"Best Use","anchorId":"chapter-chapter-a4db6965-2250-408b-a198-77bb8f54b311"}} -->
<a id="chapter-chapter-a4db6965-2250-408b-a198-77bb8f54b311"></a>
### Best Use
<!-- {"achilles-ide-paragraph":{"id":"paragraph-edd117f4-44a8-4bef-83f2-411bf2ac1b56","type":"markdown","title":"Paragraph 1"}} -->
This strategy is best when the author wants the strongest available structural quality, better metric performance, and more optimization before manual revision.


<!-- {"achilles-ide-chapter":{"id":"chapter-5dde4943-13bd-4ee8-b580-3ff818a73e22","title":"Strategy Selection Guidance","anchorId":"chapter-chapter-5dde4943-13bd-4ee8-b580-3ff818a73e22"}} -->
<a id="chapter-chapter-5dde4943-13bd-4ee8-b580-3ff818a73e22"></a>
## Strategy Selection Guidance
<!-- {"achilles-ide-paragraph":{"id":"paragraph-77198452-7950-4d0d-8300-160a55784d7f","type":"markdown","title":"Paragraph 1"}} -->
Random is the best choice for instant exploration and offline work. LLM is the best choice for richer and more semantically nuanced generation. Advanced is the best choice when structural optimization and stronger metric performance matter more than absolute speed.


<!-- {"achilles-ide-chapter":{"id":"chapter-c7c866a8-42ed-4369-b6ec-c2b3952fc814","title":"Integration in the Workflow","anchorId":"chapter-chapter-c7c866a8-42ed-4369-b6ec-c2b3952fc814"}} -->
<a id="chapter-chapter-c7c866a8-42ed-4369-b6ec-c2b3952fc814"></a>
## Integration in the Workflow
<!-- {"achilles-ide-paragraph":{"id":"paragraph-65ad18ac-147c-49e2-8ab0-6e7f34842e26","type":"markdown","title":"Paragraph 1"}} -->
Generation strategies are typically selected in `NL Story` after the author has created a project in the `New Project` wizard, moved through `Processing`, reviewed structure in `Blueprint`, and reviewed or adjusted the formal specification in `CNL Editor`.

The chosen strategy operates on the current project foundation and specification, then returns a draft or generation result that can be reviewed, improved, regenerated, and refined in later stages of the workflow.

