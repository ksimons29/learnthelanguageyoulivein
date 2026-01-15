# /reflect - Extract Learnings from Conversation

Analyze this conversation and extract learnings to update skill files.

## Instructions

1. **Scan the entire conversation** for:
   - Corrections I made ("No, don't...", "Actually use...", "Never...")
   - Explicit preferences ("Always...", "I prefer...", "Make sure...")
   - Repeated instructions (anything I had to tell you twice)
   - Patterns that worked well and I approved

2. **Categorize findings** by confidence:
   - **High**: Explicit corrections and direct preferences
   - **Medium**: Approved patterns and praised approaches  
   - **Low**: Inferred preferences needing more data

3. **Identify target skill files** to update:
   - Check `~/.claude/skills/` for global skills
   - Check `.claude/skills/` for project skills
   - If I specified a skill name as argument, target that skill

4. **Present proposed changes** in this format:
   ```
   ## Reflection Analysis
   
   ### Signals Detected
   **High Confidence:**
   - [findings]
   
   **Medium Confidence:**
   - [findings]
   
   ### Proposed Skill Updates
   
   **Target:** `[file path]`
   **Proposed addition:**
   > [new content]
   
   **Commit message:** `reflect: [description]`
   
   Approve? [Y/n] or suggest changes:
   ```

5. **After I approve**, apply changes:
   - Edit the skill file
   - Run: `cd ~/.claude/skills && git add -A && git commit -m "[message]"`
   - Confirm completion

## Arguments
- `$ARGUMENTS` - Optional: specific skill name to target

If no skill is specified, analyze which skills were used in this conversation and update those. If no skills were used, offer to create a new one or update a general preferences file.
