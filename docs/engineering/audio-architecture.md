# Audio Architecture

**Status:** Current implementation + future roadmap
**Updated:** 2026-01-25

---

## Overview

LLYLI uses Text-to-Speech (TTS) to provide native audio pronunciation for captured words. This document covers the current implementation and planned improvements for the iOS app.

---

## Current Implementation

### Stack

| Component | Technology |
|-----------|------------|
| TTS | OpenAI `tts-1` API |
| Voice | `nova` (Portuguese), `alloy` (English) |
| Verification | Whisper transcription |
| Storage | Supabase Storage (public bucket) |
| Playback | HTML5 Audio / Capacitor Native Audio |

### Flow

```
User captures word
    → OpenAI TTS generates audio
    → Whisper transcribes to verify content
    → Retry with slower speed if mismatch
    → Upload to Supabase Storage
    → Update word record with audio URL
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/audio/tts.ts` | TTS generation + verification |
| `lib/audio/storage.ts` | Supabase upload/delete |
| `api/words/route.ts` | Audio generation trigger |
| `api/onboarding/starter-words/route.ts` | Batch audio for starter words |

### Verification System

OpenAI TTS occasionally returns incorrect audio. The `generateVerifiedAudio()` function:

1. Generates audio with TTS
2. Transcribes with Whisper
3. Compares transcription to expected text
4. Retries up to 3 times with slower speeds if mismatch

```typescript
// Usage
const buffer = await generateVerifiedAudio({
  text: 'Obrigado',
  languageCode: 'pt-PT',
  userId: user.id,
});
```

**Trade-off:** Adds ~1-2s latency per audio generation.

---

## iOS App Audio Strategy

### Hybrid Approach (Recommended)

| Audio Type | Provider | Quality | Cost |
|------------|----------|---------|------|
| Pre-generated (sentences, examples) | Cloud TTS | Premium | ~$0.015/1K chars |
| Real-time (review playback, offline) | On-device | Good | Free |

### On-Device TTS (Capacitor)

```typescript
import { TextToSpeech } from '@capacitor-community/text-to-speech';

await TextToSpeech.speak({
  text: 'Obrigado',
  lang: 'pt-PT',
  rate: 0.9,
});
```

**Benefits:**
- Instant playback (no network latency)
- Works offline
- No API costs
- Natural iOS integration

### Native Audio Session (Swift)

```swift
let session = AVAudioSession.sharedInstance()
try session.setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
try session.setActive(true)
```

---

## Future Improvements

See GitHub issue for implementation tracking.

### Phase 1: iOS Launch
- [ ] Add Capacitor TTS plugin
- [ ] Implement audio caching for offline
- [ ] Fallback chain: cached → network → on-device

### Phase 2: Quality Upgrade
- [ ] Evaluate ElevenLabs for premium voices
- [ ] Pre-generate starter vocabulary with higher quality
- [ ] A/B test user preference

### Phase 3: Full Hybrid
- [ ] ElevenLabs for all pre-generated content
- [ ] Smart background sync for audio caching
- [ ] Per-word audio quality tracking

---

## Cost Analysis

| Provider | Cost/1M chars | Monthly (1K users, 50 words/day) |
|----------|---------------|----------------------------------|
| OpenAI TTS | $15 | ~$22/month |
| ElevenLabs | $300 | ~$450/month |
| On-device | $0 | $0 |
| Hybrid | ~$150 | ~$225/month |

**Recommendation:** OpenAI + on-device hybrid now, ElevenLabs when revenue supports.

---

## Troubleshooting

### Audio says wrong word
1. Check `audioUrl` points to correct file
2. Run `scripts/fix-user-audio.ts` to verify and regenerate
3. Check logs for `[TTS] VERIFICATION FAILED`

### Audio too fast/short
- Single words are ~0.5s (normal for TTS)
- Use `speed: 0.85` for slower playback
- Consider on-device TTS which can be tuned

### Audio generation fails
- Check OpenAI API key and quota
- Look for rate limit errors (429)
- Verify Supabase storage bucket exists

---

*Related: [CAPACITOR_IOS_SETUP.md](./CAPACITOR_IOS_SETUP.md), [v2_native_ios_roadmap.md](../product/v2_native_ios_roadmap.md)*
