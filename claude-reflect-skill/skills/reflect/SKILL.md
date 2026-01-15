# Reflect Skill - Self-Improving Memory System

## Purpose
Analyze the current conversation to extract corrections, preferences, and successful patterns, then update relevant skill files to persist these learnings across sessions.

## When This Skill Is Invoked
- User runs `/reflect` command (manual reflection)
- User runs `/reflect <skill-name>` to target a specific skill
- User runs `/reflect-on` to enable semi-automatic prompts

## Reflection Process

### Step 1: Scan the Conversation
Analyze the entire conversation history looking for:

**High Confidence Signals (MUST capture):**
- Explicit corrections: "No, don't do X" / "Actually, use Y instead" / "Never do Z"
- Direct preferences: "Always use..." / "I prefer..." / "Make sure to..."
- Rejected outputs that were then corrected
- Repeated instructions (user had to say something twice)

**Medium Confidence Signals (capture with review):**
- Patterns that worked well and received approval
- Approaches the user praised or accepted enthusiastically
- Conventions discovered in the codebase that should be followed

**Low Confidence Signals (note for review):**
- Implicit preferences inferred from context
- One-time decisions that might be project-specific
- Observations that need more data points

### Step 2: Identify Target Skills
Determine which skill file(s) should be updated:
1. If a specific skill was invoked during the session, prioritize that
2. If user specified a skill name with `/reflect <skill-name>`, target that
3. Look for skills in these locations (in order):
   - `~/.claude/skills/` (global skills)
   - `.claude/skills/` (project skills)
   - `.cursorrules`, `CLAUDE.md`, or similar config files

### Step 3: Propose Changes
Present findings to the user in this format:

```
## Reflection Analysis

### Signals Detected
**High Confidence:**
- [List explicit corrections/preferences found]

**Medium Confidence:**
- [List patterns that worked well]

**Low Confidence:**
- [List observations to consider]

### Proposed Skill Updates

**Target:** `[skill file path]`

**Current relevant section:**
> [quote existing text if updating]

**Proposed addition/change:**
> [new text to add or modified text]

**Commit message:** `reflect: [concise description of learning]`

---
Approve changes? [Y/n] or describe modifications:
```

### Step 4: Apply Changes (After User Approval)
1. Edit the target skill file with the approved changes
2. If Git is initialized in the skills directory:
   - Stage the changed file: `git add <file>`
   - Commit with the message: `git commit -m "<commit message>"`
   - Optionally push if remote is configured
3. Confirm completion to user

## Guidelines for Writing Learnings

### DO:
- Be specific and actionable: "Use `btn-primary` class for main action buttons"
- Include context: "In React components, always use..."
- Keep entries concise but complete
- Group related learnings under clear headings
- Use imperative mood: "Always check...", "Never use...", "Prefer..."

### DON'T:
- Add vague entries: "Be careful with buttons"
- Duplicate existing knowledge already in the skill
- Add project-specific details to global skills
- Remove existing content unless explicitly corrected
- Add learnings the user hasn't validated

## Skill File Format for Learnings

When adding learnings to a skill file, use this structure:

```markdown
## Learned Preferences

### [Category, e.g., "Code Style"]
- [Learning 1]
- [Learning 2]

### [Category, e.g., "Testing"]
- [Learning 1]
```

## Semi-Automatic Mode

When reflect is enabled via `/reflect-on`:
- At natural conversation breakpoints, offer: "I noticed some potential learnings. Run `/reflect` to review?"
- Never auto-apply changes without user review
- Can be disabled with `/reflect-off`

## Git Integration

The reflect skill integrates with Git for version control:
- All changes are committed with descriptive messages
- Prefix: `reflect:` for all automatic commits
- User can review history with `git log --oneline` in skills directory
- Rollback available via standard git commands

## Example Session

**User:** "No, don't use inline styles. We always use Tailwind classes in this project."

**After /reflect:**
```
## Reflection Analysis

### Signals Detected
**High Confidence:**
- Correction: User explicitly stated to never use inline styles
- Preference: Always use Tailwind classes for styling

### Proposed Skill Updates

**Target:** `~/.claude/skills/frontend/SKILL.md`

**Proposed addition:**
> ## Learned Preferences
> ### Styling
> - Never use inline styles in React components
> - Always use Tailwind CSS utility classes for all styling

**Commit message:** `reflect: prefer Tailwind classes over inline styles`

---
Approve changes? [Y/n] or describe modifications:
```
