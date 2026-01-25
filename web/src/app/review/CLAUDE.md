# Review invariants

Review is where learning happens. Do not break it.

## Rules

1. AI generates sentences that combine 2 to 4 user words.
2. Sentences must not repeat for the same user.
3. Sentences should be short. Target max 10 words.
4. FSRS scheduling must be respected.
5. Mastery rule must be enforced exactly.

## Mastery

Ready to Use requires:
1. 3 correct recalls
2. On separate sessions
3. Sessions are more than 2 hours apart

Wrong after mastery resets mastery counter to 0.

## Tests

After changes here, do an end to end review session with at least 5 words on production in incognito.
