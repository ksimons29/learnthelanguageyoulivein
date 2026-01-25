# Capture invariants

Capture is a 2 second flow.
User inputs a word or short phrase.
System returns translation and audio fast.

## Rules

1. Always generate and store native audio for the target language.
2. Store optional memory context fields when provided.
3. Do not create long sentences in capture.
4. If OpenAI calls fail, show a clear retry path and do not corrupt stored state.

## Tests

After changes here, verify capture works for every language pair using the test accounts.
