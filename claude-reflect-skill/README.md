# Self-Improving Skills for Claude Code

A reflection system that helps Claude Code learn from your corrections and preferences, persisting them across sessions.

Based on the "Self-Improving Skills in Cloud Code" approach by Developers Digest.

## The Problem

LLMs don't learn from past interactions. Every conversation starts from zero:
- You correct a mistake → Claude makes the same mistake next session
- You specify a preference → You have to repeat it every time
- You establish conventions → They're forgotten

## The Solution

This skill creates a **reflect** mechanism that:
1. Analyzes conversations for corrections and preferences
2. Extracts learnings with confidence levels (high/medium/low)
3. Updates skill files with your approval
4. Versions everything in Git so you can track evolution and rollback

## Installation

```bash
cd claude-reflect-skill
./install.sh
```

Or manually:
```bash
mkdir -p ~/.claude/skills/reflect ~/.claude/commands
cp skills/reflect/SKILL.md ~/.claude/skills/reflect/
cp commands/*.md ~/.claude/commands/
cd ~/.claude/skills && git init && git add -A && git commit -m "Initial commit"
```

## Usage

### Manual Reflection (Recommended to start)
After a conversation where you made corrections:
```
/reflect
```

Claude will:
1. Scan the conversation for corrections/preferences
2. Categorize by confidence (High/Medium/Low)
3. Show proposed skill updates
4. Wait for your approval
5. Update files and commit to Git

### Target a Specific Skill
```
/reflect frontend
```

### Semi-Automatic Mode
Enable prompts at conversation breakpoints:
```
/reflect-on
```

Claude will notify you when learnings are detected, but never auto-applies changes.

Disable with:
```
/reflect-off
```

### Check Status
```
/reflect-status
```

Shows: current mode, recent learnings, available skills.

## How It Works

### Signal Detection

**High Confidence** (always captured):
- "No, don't do X"
- "Actually, use Y instead"
- "Never do Z"
- "Always use..."

**Medium Confidence** (captured with review):
- Patterns that worked and were approved
- Approaches you praised

**Low Confidence** (noted for later):
- Inferred preferences
- One-time decisions

### Git Integration

All changes are committed with `reflect:` prefix:
```
reflect: prefer Tailwind classes over inline styles
reflect: always check for SQL injections in code review
```

View history:
```bash
cd ~/.claude/skills && git log --oneline
```

Rollback if needed:
```bash
git revert HEAD
```

## File Structure

```
~/.claude/
├── skills/
│   └── reflect/
│       └── SKILL.md          # The reflect skill instructions
│   └── [your other skills]/  # Skills that receive learnings
├── commands/
│   ├── reflect.md            # /reflect command
│   ├── reflect-on.md         # /reflect-on command
│   ├── reflect-off.md        # /reflect-off command
│   └── reflect-status.md     # /reflect-status command
└── .reflect-state            # Tracks semi-auto mode
```

## Example Session

**You:** "No, don't use inline styles. We always use Tailwind classes."

**Later, you run:** `/reflect`

**Claude responds:**
```
## Reflection Analysis

### Signals Detected
**High Confidence:**
- Correction: Never use inline styles
- Preference: Always use Tailwind CSS classes

### Proposed Skill Updates

**Target:** `~/.claude/skills/frontend/SKILL.md`

**Proposed addition:**
> ## Learned Preferences
> ### Styling
> - Never use inline styles in React components
> - Always use Tailwind CSS utility classes

**Commit message:** `reflect: prefer Tailwind classes over inline styles`

Approve? [Y/n] or suggest changes:
```

**You:** "Y"

**Claude:** Updates the skill, commits to Git. Next session, it remembers.

## Tips

1. **Start manual** - Use `/reflect` explicitly until you trust the extraction
2. **Review carefully** - Check proposed changes before approving
3. **Be explicit** - "Never do X" is clearer than "maybe don't do X"
4. **Check history** - `git log` shows how your skills evolve
5. **Create domain skills** - Separate skills for frontend, backend, testing, etc.

## Creating New Skills to Receive Learnings

Create `~/.claude/skills/[name]/SKILL.md`:

```markdown
# [Skill Name]

## Purpose
[What this skill is for]

## Guidelines
[Your instructions]

## Learned Preferences
[This section gets updated by /reflect]
```
