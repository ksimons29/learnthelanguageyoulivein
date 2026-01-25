# FSRS invariants

FSRS scheduling is core. Treat changes here as high risk.

## Rules

1. No shortcuts that change scheduling semantics.
2. Any scheduling change requires full review flow verification.
3. Never bypass mastery rule logic.

## Tests

After any change:
- Run build
- Run unit tests
- Run full review flow in production incognito
