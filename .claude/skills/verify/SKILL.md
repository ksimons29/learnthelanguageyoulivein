---
name: verify
description: Run mandatory verification steps and produce the completion report.
disable-model-invocation: true
---

Run these in order and show outputs.

## 1. Build

```bash
cd web && npm run build
```

## 2. Unit tests

```bash
cd web && npm run test:run
```

## 3. Project log size check

```bash
cd web && npm run log:check
```

If it fails, run:

```bash
cd web && npm run log:archive
```

Then rerun log check.

## 4. Integration tests

If schema changed run:
```bash
cd web && npx tsx scripts/test-database.js
```

If auth changed run:
```bash
cd web && npx tsx scripts/test-supabase.js
```

If translation or TTS changed run:
```bash
cd web && npx tsx scripts/test-openai.js
```

If major feature changed run:
```bash
cd web && npx tsx scripts/test-comprehensive.ts
```

If gamification changed run:
```bash
cd web && npx tsx scripts/test-gamification-api.ts
```

## 5. E2E verification

If any user flow changed, test production in fresh incognito and follow the production discipline in root CLAUDE.md.

## 6. Multi language verification

If any language direction or UI language changed, verify with all test accounts.

## Final report

Then output this final block:

```
✅ VERIFICATION COMPLETE
─────────────────────────────────────────────
Changed files:
  • list files

Tests run:
  ✅ Build: PASSED
  ✅ Unit tests: PASSED
  ✅ Log size: PASSED
  ✅ Integration: PASSED or N/A
  ✅ E2E: PASSED or N/A
  ✅ Multi language: PASSED or N/A

Bugs fixed:
  GitHub issue number or N/A

Docs updated:
  PROJECT_LOG.md yes or no
  MVP_AUDIT.md yes or no

Status:
  READY FOR REVIEW
─────────────────────────────────────────────
```
