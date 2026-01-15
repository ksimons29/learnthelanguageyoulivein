# /reflect-on - Enable Semi-Automatic Reflection

Enable semi-automatic reflection mode for this session.

## Instructions

1. Create or update the reflect state file:
   ```bash
   echo "enabled" > ~/.claude/.reflect-state
   ```

2. Confirm to user:
   ```
   Reflection mode: ENABLED
   
   I'll now watch for learnings during our conversation. At natural breakpoints 
   (after completing tasks, before switching topics), I'll let you know if I 
   detected potential learnings and offer to run /reflect.
   
   Note: I will NEVER auto-apply changes. You always review and approve first.
   
   Commands:
   - /reflect - Manually trigger reflection at any time
   - /reflect-off - Disable this mode
   - /reflect-status - Check current state
   ```

3. For the rest of this session, after completing significant tasks, include a brief note if learnings were detected:
   > I noticed some potential learnings from our conversation. Run `/reflect` when ready to review.
