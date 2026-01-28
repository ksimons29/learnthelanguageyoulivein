# Bug: Low sentence variety - same sentences repeated consecutively

## Environment

* app: production
* url: llyli.vercel.app
* deployment: production
* browser, device, os: user-reported

## Test user and language pair

* email: unknown (user-reported)
* selected pair: Portuguese (pt-PT) / English

## Clean state confirmation

* incognito used: not confirmed
* notebook title verified: not confirmed

## First seen

* date and time: 2026-01-28
* is it new or recurring: unknown

## Steps to reproduce

1. Open Practice tab
2. Complete multiple flashcard reviews in a session
3. Observe sentence repetition patterns

## Expected

Per CLAUDE.md non-negotiable #2: "No repeated example sentences. Sentence generation must not repeat prior sentences for the same user."

Each practice session should present varied sentences. Users should not see:
- The same sentence twice in a row
- The same sentence multiple times in a single session
- Limited sentence pool causing frequent repetition across sessions

## Actual

Users report:
- Same sentences appearing twice in a row consecutively
- Low variety in sentence pool
- Repetitive practice experience

## Frequency

Often - reported as a recurring pattern

## Evidence

User-reported feedback on repetitive sentences during practice.

## Impact

* severity: Medium
* user impact: Repetitive content reduces learning effectiveness and user engagement. Violates core product requirement for sentence variety.

## Potential investigation areas

1. Check sentence generation/selection algorithm
2. Verify deduplication logic is working
3. Review sentence pool size per phrase/card
4. Check if user history is being consulted before sentence selection
5. Investigate if caching is causing stale sentence selection

## Fix verification performed

* build ran: no
* tests ran: no
* e2e smoke ran: no
* what exact steps you reran: n/a - bug report only
