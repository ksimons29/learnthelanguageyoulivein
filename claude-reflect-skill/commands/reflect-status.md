# /reflect-status - Check Reflection Mode Status

Show the current state of the reflection system.

## Instructions

1. Check the state file:
   ```bash
   cat ~/.claude/.reflect-state 2>/dev/null || echo "not set"
   ```

2. List recent reflection commits:
   ```bash
   cd ~/.claude/skills && git log --oneline -5 --grep="reflect:" 2>/dev/null || echo "No git history"
   ```

3. List available skills that can receive learnings:
   ```bash
   find ~/.claude/skills -name "SKILL.md" -o -name "*.md" 2>/dev/null | head -10
   ```

4. Present status to user:
   ```
   ## Reflect Status
   
   **Mode:** [enabled/disabled/not set]
   
   **Recent Learnings:**
   [last 5 reflect commits or "No learnings recorded yet"]
   
   **Available Skills:**
   [list of skill files]
   
   **Commands:**
   - /reflect - Extract learnings now
   - /reflect-on - Enable semi-automatic prompts
   - /reflect-off - Disable prompts
   ```
