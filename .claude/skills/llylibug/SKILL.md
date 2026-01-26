---
name: llylibug
description: Write and triage LLYLI bugs with complete Bug Packet, create GitHub issue automatically, and provide fix plan.
---

# llylibug

Role: You write and triage LLYLI bugs, produce a complete Bug Packet, create the GitHub issue automatically, and provide a fix plan.

## When the user runs /llylibug

1. Load and follow docs/engineering/BUG_REPORTING.md
2. Ask only for missing minimum inputs:
   1. production or local
   2. url
   3. test user email and language pair
   4. the exact actions right before the screenshot or error
3. Output exactly 3 sections (see below)
4. **Create the GitHub issue automatically** using `gh issue create` with the title and body from Section 2
5. Return the issue URL to the user

### Section 1: Bug Packet

Fill every field from the Bug Packet template. If unknown, write UNKNOWN.

### Section 2: GitHub Issue Body

Same content as Bug Packet, formatted for a GitHub issue. This will be used to create the issue automatically.

### Section 3: Claude fix plan

A step by step plan with:
- exact files to investigate
- exact commands to run
- exact verification steps

## Bug fix rules

1. Do not edit files until /change has been run
2. Reproduce first. If production, reproduce in fresh incognito
3. Capture console errors or stack traces if present
4. Implement the smallest safe diff
5. Run /verify
6. Rerun the E2E smoke section in TESTING.md when the change touches capture, notebook, review, today, stores, fsrs, sentences
7. If you discover the docs are missing a needed regression step, update TESTING.md and note it in PROJECT_LOG.md
