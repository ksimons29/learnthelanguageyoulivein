# LLYLI Project Constitution

LLYLI turns real life phrases into smart cards with native audio and spaced repetition.

## Non negotiables

1. European Portuguese is pt-PT with correct spelling and tu forms.
2. No repeated example sentences. Sentence generation must not repeat prior sentences for the same user.
3. Sentences must stay short. Target max 10 words.
4. Do not fall back to isolated word pair flashcards.
5. Mastery rule is enforced. Ready to Use requires 3 correct recalls in separate sessions more than 2 hours apart. Wrong after mastery resets counter to 0.
6. Production testing discipline is mandatory. See section below.
7. No credentials in this file. Put them in CLAUDE.local.md.

## Production testing discipline

1. Always test production in a fresh incognito session.
2. Before testing, verify you are logged into the intended test user and the notebook title matches that account.
3. Any production bug must be reproduced again in a fresh incognito session before filing.
4. Any production bug must be tracked as a GitHub issue. No loose bug notes.
5. Bug reports must follow docs/engineering/BUG_REPORTING.md and use /llylibug.

## How we work in Claude Code

For any code change:
1. Run /change with a short summary before editing.
2. Implement with smallest safe diff.
3. Run /verify before saying done.

## Quick commands

```bash
cd web && npm run dev
cd web && npm run build
cd web && npm run test:run
cd web && npm run log:check
```

## Critical docs

- PRODUCT_SPECIFICATION.md
- PROJECT_LOG.md
- MVP_AUDIT.md
- docs/design/design-system.md
- docs/engineering/TESTING.md
- docs/engineering/BUG_REPORTING.md
- docs/engineering/session-workflow.md

## Repo

https://github.com/ksimons29/learnthelanguageyoulivein
