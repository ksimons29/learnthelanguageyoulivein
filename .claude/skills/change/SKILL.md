---
name: change
description: Create the mandatory change plan and wait for user approval before editing.
disable-model-invocation: true
---

You must not edit code until the user approves the plan.

Ask the user for a short change summary if $ARGUMENTS is empty.

Then output exactly this block:

```
📋 CHANGE PLAN
─────────────────────────────────────────────
Summary:
  $ARGUMENTS

Files to change:
  • list the exact paths

Change type:
  bug fix or new feature or refactor or styling

Required tests:
  • Build
  • Unit tests
  • Log size check
  • Integration tests: list which scripts apply or N/A
  • E2E verification: YES or NO with reason
  • Multi language: YES or NO with reason

Risk level:
  low or medium or high

Approval:
  Waiting for user to type yes or proceed
─────────────────────────────────────────────
```

Stop and wait.
