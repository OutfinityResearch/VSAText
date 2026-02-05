# DS25 — Metric Specification: Coherence Analysis

## 1. Purpose

**Coherence Analysis** is a set of six metrics designed to detect random, inconsistent, or incoherent story generation. These metrics complement the existing Coherence Score (DS13) by analyzing deeper structural patterns.

**Primary Goal**: Identify "garbage" generation where:
- Characters appear randomly without continuity
- Locations hop between scenes without logic
- Actions reference non-existent entities
- Scenes are incomplete or malformed
- Defined relationships are never used
- Dialogues lack structure or purpose

## 2. The Six Coherence Metrics

### 2.1 Character Continuity Score (charContinuity)

**What it measures**: Do characters appear consistently across the narrative?

**Formula**:
```text
charsInMultiple = count of characters appearing in 2+ scenes
heroPresence = hero appearances / total scenes

charContinuity = (charsInMultiple / totalCharacters) × 0.5 
               + min(1, heroPresence) × 0.5
```

**Why it matters**:
- Random generation often introduces characters who appear once and vanish
- The hero/protagonist should be present in most scenes
- A coherent story has character continuity across scenes

**Threshold**: >= 60%

**Failure indicators**:
- Score < 30%: Most characters appear only once (random assignment)
- Score 30-60%: Some character continuity but hero may be missing
- Score >= 60%: Good character continuity with consistent protagonist

---

### 2.2 Location Logic Score (locLogic)

**What it measures**: Are locations reused logically or is there random scene-hopping?

**Formula**:
```text
locsReused = count of locations appearing 2+ times
avgLocUsage = sum(location appearances) / total locations
expectedUsage = max(3, sceneCount / 3)

locLogic = min(1, (locsReused / totalLocations) × 0.5 
             + (avgLocUsage / expectedUsage) × 0.5)
```

**Why it matters**:
- Real stories return to key locations (home, workplace, etc.)
- Random generation creates a new location for every scene
- Location reuse indicates spatial coherence in the narrative

**Threshold**: >= 50%

**Failure indicators**:
- Score < 25%: Every scene has a different location (incoherent)
- Score 25-50%: Some location reuse but mostly random
- Score >= 50%: Locations are reused appropriately

---

### 2.3 Action Coherence Score (actionCoherence)

**What it measures**: Do actions reference valid, known entities?

**Formula**:
```text
For each action:
  - subject should be a known character
  - target should be a known character, location, or object (or empty)
  
valid = count of actions with valid subject AND target
actionCoherence = valid / totalActions
```

**Why it matters**:
- Actions like "John attacks Mike" require both John and Mike to exist
- Random generation may reference non-existent entities
- Valid actions demonstrate entity awareness

**Threshold**: >= 80%

**Failure indicators**:
- Score < 50%: Most actions reference unknown entities
- Score 50-80%: Some orphan references
- Score >= 80%: Actions properly reference defined entities

---

### 2.4 Scene Completeness Score (sceneCompleteness)

**What it measures**: Does each scene have the minimum required elements?

**Formula**:
```text
For each scene, check if it contains:
  - At least one character-ref
  - At least one location-ref  
  - At least one action OR dialogue

complete = count of scenes with all three elements
sceneCompleteness = complete / totalScenes
```

**Why it matters**:
- A scene should answer: WHO is WHERE doing WHAT
- Incomplete scenes indicate malformed structure
- Complete scenes have narrative purpose

**Threshold**: >= 70%

**Failure indicators**:
- Score < 40%: Most scenes are fragments
- Score 40-70%: Some complete scenes
- Score >= 70%: Well-formed scene structure

---

### 2.5 Relationship Usage Score (relUsage)

**What it measures**: Are defined relationships actually used in the story?

**Formula**:
```text
For each defined relationship (A → B):
  - Check if A and B appear together in any scene
  
usedPairs = count of relationships where both characters appear in same scene
relUsage = min(1, usedPairs / totalRelationships)
```

**Why it matters**:
- Defining "John loves Mary" is meaningless if they never interact
- Relationships should manifest in the narrative
- Unused relationships indicate specification-generation disconnect

**Threshold**: >= 50%

**Failure indicators**:
- Score < 25%: Relationships are decorative only
- Score 25-50%: Some relationships used
- Score >= 50%: Relationships actively inform the narrative

---

### 2.6 Dialogue Quality Score (dialogueQuality)

**What it measures**: Are dialogues well-structured and purposeful?

**Formula**:
```text
For each dialogue, score 0-1:
  +0.25 if has purpose defined
  +0.25 if has 2+ participants
  +0.25 if has at least 1 exchange
  +0.25 if exchanges have content (intent or sketch)

dialogueQuality = sum(scores) / totalDialogues
```

**Why it matters**:
- Dialogues need participants and exchanges
- Purpose gives context (argument, confession, negotiation)
- Empty dialogues indicate placeholder generation

**Threshold**: >= 60%

**Failure indicators**:
- Score < 30%: Dialogues are empty placeholders
- Score 30-60%: Partial dialogue structure
- Score >= 60%: Dialogues are well-defined

---

## 3. Integration with NQS

**Important:** DS23 defines `NQS` as a **hybrid (human + machine)** metric.

This document defines an **automated proxy score** used for fast feedback, called `NQS_AUTO`.

`NQS_AUTO` includes coherence analysis:

```text
NQS_AUTO = 
  completeness × 0.12 +
  cs × 0.12 + 
  (1 - min(1, cad × 4)) × 0.08 +
  oi × 0.08 + 
  eap × 0.10 + 
  cpsr × 0.08 + 
  csa × 0.08 + 
  explainability × 0.08 +
  charContinuity × 0.08 +
  locLogic × 0.06 +
  actionCoherence × 0.06 +
  sceneCompleteness × 0.06
```

**Total weight for coherence analysis**: 26%

**Threshold (recommended)**
- `NQS_AUTO >= 0.70` for “good enough” interactive drafts.

## 4. Diagnostic Interpretation

### Overall Coherence Assessment

| Avg Coherence Score | Interpretation |
|---------------------|----------------|
| < 30% | **Garbage**: Random/incoherent generation |
| 30-50% | **Poor**: Major structural issues |
| 50-70% | **Fair**: Some coherence, needs improvement |
| 70-85% | **Good**: Mostly coherent narrative |
| > 85% | **Excellent**: Well-structured story |

### Specific Issue Detection

| Low Metric | Likely Problem |
|------------|----------------|
| charContinuity < 40% | Characters randomly assigned per scene |
| locLogic < 30% | No spatial coherence, random locations |
| actionCoherence < 60% | Actions reference non-existent entities |
| sceneCompleteness < 50% | Scenes are fragments, missing elements |
| relUsage < 30% | Relationships not manifested in story |
| dialogueQuality < 40% | Dialogues are empty placeholders |

## 5. Implementation

See `demo/app/metrics.mjs`:

- `countCharacterAppearances(node, characters)` - Count character refs per scene
- `countLocationAppearances(node, locations)` - Count location refs per scene
- `analyzeActions(node, entities)` - Validate action subjects/targets
- `analyzeSceneCompleteness(node)` - Check scene element presence
- `analyzeRelationshipUsage(node, relationships, characters)` - Track co-occurrence
- `analyzeDialogues(dialogues)` - Score dialogue structure

## 6. Console Debugging

When evaluating, the browser console shows:

```javascript
[Evaluate] Coherence: {
  charContinuity: "0.75",
  locLogic: "0.60",
  actionCoherence: "0.90",
  sceneCompleteness: "0.80",
  relUsage: "0.50",
  dialogueQuality: "0.65"
}
```

---

## 7. Related Documents

- DS03 — Research goals and evaluation methodology
- DS12 — Metrics interpreter overview
- DS13 — Coherence Score (CS) definition
- DS23 — Narrative Quality Score (NQS) specification
