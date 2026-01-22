---
name: technical-spec-writer
description: Write technical specifications and design documents that bridge product requirements and engineering implementation. Use when the user needs a technical spec, design doc, architecture document, or engineering specification. Triggers include "technical spec", "design doc", "tech spec", "architecture doc", "engineering spec", "write a spec for", "how should we build".
---

# Technical Spec Writer

## Core Principles

1. **Decision-focused**: Document decisions and rationale
2. **Trade-offs explicit**: Show alternatives considered
3. **Risk-aware**: Identify what could go wrong
4. **Implementation-ready**: Engineers can build from this

## Tech Spec Structure

### Header

```markdown
# [Feature/System Name] - Technical Specification

**Author:** [Name]
**Reviewers:** [Names]
**Status:** Draft | In Review | Approved
**Created:** YYYY-MM-DD
**Last Updated:** YYYY-MM-DD

## TL;DR
[2-3 sentences: What we're building and the key technical approach]
```

### 1. Context & Goals

```markdown
## Context

[Background: Why are we doing this? Link to PRD if exists]

## Goals

**Must achieve:**
- [Goal 1]
- [Goal 2]

**Non-goals (explicitly out of scope):**
- [Non-goal 1]
- [Non-goal 2]
```

### 2. Technical Design

```markdown
## Proposed Solution

### Overview
[High-level description of the approach]

### Architecture
[Diagram or description of components]

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ Client  │────▶│   API   │────▶│   DB    │
└─────────┘     └─────────┘     └─────────┘
```

### Data Model

```sql
CREATE TABLE feature (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Changes

**New Endpoints:**
- `POST /api/v1/feature` - Create feature
- `GET /api/v1/feature/:id` - Get feature

**Modified Endpoints:**
- `GET /api/v1/user` - Add `feature_count` field

### Key Algorithms/Logic
[Describe any complex logic]
```

### 3. Alternatives Considered


```markdown
## Alternatives Considered

### Option A: [Name]
**Approach:** [Description]
**Pros:** [Benefits]
**Cons:** [Drawbacks]
**Why not:** [Reason for rejection]

### Option B: [Name]
[Same structure]

### Decision
We chose [Option X] because [rationale].
```

### 4. Risks & Mitigations

```markdown
## Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Plan] |
| [Risk 2] | ... | ... | ... |
```

### 5. Implementation Plan

```markdown
## Implementation Plan

### Phase 1: [Name] (Week 1-2)
- [ ] Task 1
- [ ] Task 2

### Phase 2: [Name] (Week 3)
- [ ] Task 3

### Dependencies
- [System/Team] for [what]

### Testing Strategy
- Unit tests for [components]
- Integration tests for [flows]
- Load test target: [X] requests/second
```

### 6. Operational Concerns

```markdown
## Operational Considerations

### Monitoring
- [Metric 1]: Alert if > [threshold]
- [Metric 2]: Dashboard for [purpose]

### Rollout Plan
1. Feature flag to 1% of users
2. Monitor for 24h
3. Increase to 10%, then 50%, then 100%

### Rollback Plan
[How to revert if issues arise]

### Documentation Needed
- [ ] API docs update
- [ ] Runbook for on-call
```

## Lightweight Spec

For smaller changes:

```markdown
# [Feature] - Mini Spec

**Problem:** [1 sentence]
**Solution:** [1 sentence]

## Approach
[3-5 bullet points of key technical decisions]

## Changes
- [File/component]: [Change]

## Testing
- [What to test]

## Risks
- [Key risk]: [Mitigation]
```

## Quality Checks

- [ ] TL;DR captures essence in 2-3 sentences
- [ ] Goals are measurable
- [ ] At least 2 alternatives considered
- [ ] Risks have mitigations
- [ ] Implementation is broken into phases
- [ ] Rollback plan exists
