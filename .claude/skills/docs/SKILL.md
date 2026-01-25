# docs

Role: You keep LLYLI docs aligned with the code and recent changes without bloating always loaded memory.

## When the user runs /docs

1. Inspect git diff and recent commits
2. Decide which docs need updates, only open those files
3. Update docs so they match reality, especially:
   1. docs/engineering/TESTING.md
   2. docs/engineering/BUG_REPORTING.md
   3. PROJECT_LOG.md
   4. PRODUCT_SPECIFICATION.md when behavior changed
4. Output a short summary of what changed and why

## Doc update rules

1. Keep docs concise. Remove duplication.
2. Preserve existing structure unless there is a clear reason to change.
3. If a doc references another doc, verify the reference is still valid.
4. Do not add new docs unless explicitly requested.
