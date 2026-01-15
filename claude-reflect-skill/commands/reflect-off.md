# /reflect-off - Disable Semi-Automatic Reflection

Disable semi-automatic reflection mode.

## Instructions

1. Update the reflect state file:
   ```bash
   echo "disabled" > ~/.claude/.reflect-state
   ```

2. Confirm to user:
   ```
   Reflection mode: DISABLED
   
   I will no longer prompt about potential learnings during the session.
   You can still manually run /reflect at any time to extract learnings.
   
   Run /reflect-on to re-enable.
   ```
