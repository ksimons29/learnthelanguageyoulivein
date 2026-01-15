---
name: user-research-synthesizer
description: Synthesize user research data from interviews, surveys, and feedback into actionable insights. Use when the user has raw research data (interview transcripts, survey responses, feedback logs, support tickets) and needs patterns, themes, personas, or recommendations extracted. Triggers include "analyze interviews", "synthesize research", "user feedback", "research findings", "interview notes", "survey results", "customer insights", "pain points".
---

# User Research Synthesizer

## Core Principles

1. **Evidence-based**: Every insight needs supporting quotes
2. **Patterns over anecdotes**: Themes across multiple sources
3. **Actionable outputs**: Insights drive decisions
4. **Prioritize by impact**: Frequency × severity = priority

## Synthesis Process

### 1. Code the Data

| Quote | Source | Theme | Sentiment |
|-------|--------|-------|-----------|
| "I forget where I saved things" | P3 | Navigation | Negative |

**Categories:** Pain points, Needs, Behaviors, Mental models, Workarounds, Delighters

### 2. Identify Patterns

| Theme | Mentions | % Participants | Severity | Priority |
|-------|----------|----------------|----------|----------|
| Confusing nav | 12 | 80% | 4/5 | High |

### 3. Generate Insights

```
## Insight: [Clear statement]

**Evidence:**
- "[Quote]" — P3
- "[Quote]" — P7

**Frequency:** X/Y participants (Z%)
**Implication:** [What this means]
**Recommendation:** [Action]
```

## Output Templates

### Pain Points Matrix

| # | Pain Point | Frequency | Severity | Priority |
|---|------------|-----------|----------|----------|
| 1 | [Pain] | 8/10 (80%) | High | P1 |

### Persona

```
## Persona: [Name]

**Context:** [Demographics, role]
**Goals:** [What they want]
**Frustrations:** [Pain points]
**Behaviors:** [Current solutions]
**Quote:** "[Representative quote]"
```

### Research Report

```
## Summary: [Project]

**Goal:** [Research question]
**Method:** [X interviews, Y surveys]

## Key Findings

### Finding 1: [Headline]
- Evidence: [Quotes]
- Recommendation: [Action]

## Recommendations
1. [Rec] — addresses [finding]
```

## Analysis Techniques

**Jobs-to-be-Done:**
```
When [situation], I want to [motivation], so I can [outcome].
```

**Affinity Mapping:**
1. Extract observations → 2. Group by similarity → 3. Name themes → 4. Note outliers

## Quality Checks

- [ ] Every insight has 2+ quotes
- [ ] Sample size noted
- [ ] Patterns based on frequency
- [ ] Recommendations specific
- [ ] Outliers captured
