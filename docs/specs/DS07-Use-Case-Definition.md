# DS07 — Use Case Definition and Workflows

## 1. Problem Statement and Scope

SCRIPTA Story Studio addresses a fundamental challenge in AI-assisted creative writing: the lack of structured, measurable, and iterative approaches to narrative generation. Current tools treat story creation as a one-shot prompt exercise, leaving authors without:

- Reusable building blocks for characters, settings, and patterns
- Visual tools for composing and arranging story elements
- Structured planning before content generation
- Quality metrics for evaluating generated content
- Comparison tools for different approaches

The scope is professional and hobbyist creative writing including short stories, novellas, novels, screenplays, and scripts. The system is designed for authors who want control over the creative process while leveraging AI capabilities.


## 2. Actors and Their Roles

### 2.1 Primary Actor: Author

The Author is the creative director using the Story Studio to:
- Create and manage writing projects
- Define custom characters and locations
- Select story patterns and themes
- Generate and evaluate content
- Iterate on specifications and regenerate

### 2.2 System Agents

AI components that perform automated tasks:
- **Planning Agent**: Generates story structure from specifications
- **Generation Agent**: Produces narrative content
- **Evaluation Agent**: Computes quality metrics
- **Verification Agent**: Checks content against specifications


## 3. Primary Workflow: Story Studio Session

### 3.1 Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1. Create  │───▶│ 2. Compose  │───▶│ 3. Generate │───▶│ 4. Evaluate │
│   Project   │    │  Elements   │    │   Content   │    │   Quality   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                              ▲                  │
                                              └──────────────────┘
                                                   Iterate
```

### 3.2 Step 1: Create Project

**Goal**: Initialize a new creative writing project

**Actions**:
1. Author opens Story Studio
2. Author clicks "New Project"
3. Author enters project details:
   - Title
   - Format (novel, screenplay, short story, etc.)
   - Synopsis
4. System creates project with unique ID
5. Author sees empty project canvas

**Artifacts**: Project record

### 3.3 Step 2: Compose Elements

**Goal**: Assemble the building blocks for the story

**Actions**:
1. Author opens Element Palette
2. Author browses or searches for elements:
   - **Characters**: Select archetypes or create custom
   - **Locations**: Choose settings from library or create custom
   - **Patterns**: Select story structure (three-act, hero's journey, etc.)
   - **Themes**: Add thematic elements
   - **Tone**: Set narrative voice
3. Author drags elements to project canvas
4. Author configures each element:
   - Character traits and goals
   - Location atmosphere and rules
   - Pattern customization
5. Author defines relationships between elements
6. System generates CNL constraints automatically

**Artifacts**: Character definitions, Location definitions, Pattern selection, CNL constraints

### 3.4 Step 3: Generate Content

**Goal**: Produce narrative content based on specifications

**Actions**:
1. Author clicks "Generate Plan"
2. Planning Agent analyzes project elements
3. Planning Agent generates structured plan:
   - Scene breakdown
   - Character arcs
   - Plot graph
4. Author reviews plan, optionally modifies
5. Author clicks "Generate Content" (full or scene-by-scene)
6. Generation Agent produces narrative text
7. Author reviews generated content
8. Author can regenerate specific scenes with modified parameters

**Artifacts**: Plan, Draft scenes

### 3.5 Step 4: Evaluate Quality

**Goal**: Measure and understand generated content quality

**Actions**:
1. Author clicks "Evaluate"
2. Author selects metrics to compute:
   - Narrative Quality Score (NQS)
   - Coherence
   - Character Consistency (CAD)
   - Readability
3. Evaluation Agent analyzes content
4. System displays metric results with explanations
5. Author identifies areas for improvement
6. Author modifies specifications or parameters
7. Author regenerates and re-evaluates

**Artifacts**: Evaluation report

### 3.6 Iteration Loop

The author can iterate at any step:
- Modify characters/locations → regenerate plan → regenerate content
- Adjust pattern parameters → regenerate plan
- Tweak CNL constraints → regenerate specific scenes
- Compare different approaches side by side


## 4. Alternative Workflows

### 4.1 Quick Start with Templates

For rapid creation:
1. Author selects pre-made project template
2. Template includes pre-configured elements
3. Author customizes as needed
4. Generation proceeds immediately

### 4.2 Reverse Engineering

Start from existing text:
1. Author pastes existing draft or excerpt
2. System analyzes text
3. System extracts implied specification:
   - Characters and traits
   - Setting details
   - Themes and tone
4. Author reviews and corrects extracted spec
5. Author can continue generation from this point

### 4.3 Comparison Mode

Compare different approaches:
1. Author creates project with elements
2. Author generates content with approach A
3. Author generates content with approach B (different pattern, parameters)
4. System displays side-by-side comparison
5. System shows metric comparison
6. Author selects preferred version

### 4.4 Research-Assisted

For historically or technically accurate content:
1. Author enables research mode
2. During generation, system queries knowledge base
3. System incorporates relevant facts
4. Generated content includes research notes
5. Author can trace claims to sources


## 5. Element Library Details

### 5.1 Character Archetypes

| Archetype | Description | Typical Traits |
|-----------|-------------|----------------|
| Hero | Protagonist who grows through challenges | brave, determined, flawed |
| Mentor | Guide who provides wisdom | wise, mysterious, experienced |
| Shadow | Antagonist or dark reflection | ambitious, ruthless, complex |
| Trickster | Agent of chaos and humor | clever, unpredictable, loyal |
| Herald | Brings the call to adventure | urgent, compelling, fateful |
| Shapeshifter | Ally of uncertain loyalty | adaptable, ambiguous, surprising |
| Threshold Guardian | Tests the hero's commitment | challenging, protective, revelatory |

### 5.2 Story Patterns

| Pattern | Description | Typical Scenes |
|---------|-------------|----------------|
| Three-Act | Classic setup-confrontation-resolution | 8-12 scenes |
| Hero's Journey | Monomyth structure | 12-17 scenes |
| Five-Act | Shakespeare structure | 10-15 scenes |
| Save the Cat | Blake Snyder beats | 15 scenes |
| Kishotenketsu | Four-act non-conflict structure | 4-8 scenes |
| In Medias Res | Start in the middle | Variable |

### 5.3 Location Types

| Type | Atmosphere | Common Uses |
|------|------------|-------------|
| Safe Haven | Comfort, normalcy | Character origin, return |
| Dangerous Terrain | Threat, challenge | Trials, growth |
| Threshold | Transition, uncertainty | Decision points |
| Innermost Cave | Confrontation, truth | Climax, revelation |
| Road/Journey | Change, discovery | Character development |


## 6. Metrics and Evaluation

### 6.1 Available Metrics

| Metric | Description | Range | Good Threshold |
|--------|-------------|-------|----------------|
| NQS | Narrative Quality Score (composite) | 0-1 | >0.7 |
| Coherence | Story consistency and flow | 0-1 | >0.8 |
| CAD | Character Attribute Drift | 0-1 | <0.15 |
| Readability | Flesch-Kincaid grade level | 0-18 | 8-12 |
| Originality | Non-cliché language use | 0-1 | >0.6 |

### 6.2 Evaluation Workflow

1. Select draft to evaluate
2. Choose metrics
3. System computes scores
4. View detailed breakdown
5. See specific issues highlighted
6. Compare with previous versions


## 7. CNL Integration

### 7.1 Automatic CNL Generation

When author adds elements to project, system generates CNL:

```
Anna is character
Anna has trait courageous
Anna has trait protective
Anna wants "protect brother"
Anna relates to Marcus as sibling

Story has setting "coastal village"
Story has era modern
Story has tone hopeful
Story has theme courage
Story has theme family
```

### 7.2 Manual CNL Editing

Author can edit CNL directly for fine control:
- Add specific scene requirements
- Define complex constraints
- Specify narrative rules

### 7.3 CNL Validation

System validates CNL before generation:
- Syntax checking
- Semantic consistency
- Conflict detection


## 8. Output Formats

### 8.1 Export Options

| Format | Use Case |
|--------|----------|
| Plain Text | General purpose |
| Markdown | Formatted manuscript |
| Fountain | Screenplay format |
| DOCX | Word processing |
| JSON | Data interchange |

### 8.2 Project Artifacts

Each project produces:
- Specification file (elements + CNL)
- Plan file (structure + scenes)
- Draft files (generated content)
- Evaluation reports
- Comparison reports (if applicable)
