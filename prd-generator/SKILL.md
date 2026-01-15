---
name: prd-generator
description: Generate comprehensive Product Requirements Documents (PRDs) from rough ideas, notes, or conversations. Use when the user needs to create a PRD, product spec, feature specification, or requirements document. Triggers include "write a PRD", "product requirements", "feature spec", "product specification", "requirements document", "spec for", "define requirements".
---

# PRD Generator

## Core Principles

1. **Problem-first**: Start with user problem, not solution
2. **Measurable success**: Every feature needs success metrics
3. **Scope clarity**: Explicit in/out of scope
4. **Assumption awareness**: Document what we're betting on

## PRD Structure

### 1. Overview

```
## Overview

**Product:** [Name]
**Author:** [Name]
**Status:** Draft | In Review | Approved
**Last Updated:** [Date]

### Problem Statement
[2-3 sentences: What problem are we solving? For whom?]

### Opportunity
[Why now? What's the impact if we solve this?]

### Success Metrics
| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| [KPI] | [X] | [Y] | [When] |
```

### 2. User & Context

```
## Target Users

**Primary:** [User segment + characteristics]
**Secondary:** [If applicable]

### User Stories
- As a [user], I want to [action] so that [benefit]
- As a [user], I want to [action] so that [benefit]

### Jobs to Be Done
When [situation], I want to [motivation], so I can [outcome].
```

### 3. Requirements

```
## Functional Requirements

### P0 (Must Have)
| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F1 | [Requirement] | [How we know it's done] |

### P1 (Should Have)
| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| F2 | [Requirement] | [Criteria] |

### P2 (Nice to Have)
[List]

## Non-Functional Requirements
- **Performance:** [Load time, response time]
- **Scale:** [Users, data volume]
- **Security:** [Requirements]
- **Accessibility:** [Standards]
```

### 4. Scope & Constraints

```
## Scope

### In Scope
- [Feature/capability]
- [Feature/capability]

### Out of Scope
- [Explicitly excluded]
- [Future consideration]

## Constraints
- **Technical:** [Limitations]
- **Timeline:** [Deadlines]
- **Resources:** [Team, budget]
- **Dependencies:** [Other teams, systems]
```

### 5. Design & UX

```
## User Experience

### User Flow
1. User does [action]
2. System responds with [response]
3. User sees [outcome]

### Wireframes/Mockups
[Link or embed]

### Edge Cases
| Scenario | Expected Behavior |
|----------|-------------------|
| [Edge case] | [How to handle] |
```

### 6. Technical Approach

```
## Technical Considerations

### Architecture
[High-level approach]

### Data Model
[Key entities and relationships]

### APIs
[New or modified endpoints]

### Risks & Mitigations
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [Risk] | High/Med/Low | High/Med/Low | [Plan] |
```

### 7. Launch Plan

```
## Go-to-Market

### Release Strategy
- [ ] Feature flag rollout: [X]%
- [ ] Beta users: [Who]
- [ ] General availability: [Date]

### Success Criteria for Launch
- [Metric] reaches [target]
- No P0 bugs in [timeframe]

### Rollback Plan
[How to revert if needed]
```

## Quick PRD (Lightweight)

For smaller features:

```
## [Feature Name] - Quick PRD

**Problem:** [1 sentence]
**Solution:** [1 sentence]
**Success Metric:** [1 metric + target]

### Requirements
- [ ] [Requirement 1]
- [ ] [Requirement 2]

### Out of Scope
- [Exclusion]

### Open Questions
- [Question needing answer]
```

## Quality Checks

- [ ] Problem clearly articulated
- [ ] Success metrics are measurable
- [ ] Requirements are testable (acceptance criteria)
- [ ] Scope boundaries are explicit
- [ ] Assumptions documented
- [ ] Risks identified with mitigations
- [ ] Dependencies called out
