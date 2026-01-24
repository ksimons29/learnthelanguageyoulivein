# Analytics Dashboard Update - Session 78

## Summary

Added two new metric sections to the admin analytics dashboard:
1. **Sentence Generation Metrics** - Track the app's core differentiator
2. **OpenAI API Usage & Costs** - Monitor operational costs and API consumption

## What Was Added

### 1. Database Schema (`api-usage.ts`)

New table `api_usage_log` to track every OpenAI API call:
- API type (translation, TTS, sentence_generation, language_detection)
- Token usage (prompt + completion tokens)
- Character count (for TTS)
- Estimated cost in USD
- Success/failure status
- User context and metadata

**Pricing (as of Jan 2025):**
- GPT-4o-mini: $0.150/1M input tokens, $0.600/1M output tokens
- TTS-1: $15.00/1M characters

### 2. API Usage Logger (`lib/api-usage/logger.ts`)

Helper functions to instrument OpenAI calls:
- `logApiUsage()` - Fire-and-forget logging (won't crash on errors)
- `withGPTUsageTracking()` - Wrap GPT API calls with automatic usage logging
- `withTTSUsageTracking()` - Wrap TTS API calls with automatic usage logging

### 3. Admin Stats API Updates

Added two new parallel query batches:

**Sentence Stats:**
- Total sentences generated (all-time, 7d, 30d, today)
- Used vs pre-generated sentences
- Usage rate (% of sentences actually used in reviews)
- Word count distribution (2/3/4 words)
- Average words per sentence
- Exercise type distribution

**API Usage Stats:**
- Total API calls by type (translation, TTS, sentence gen)
- Token usage (total, prompt, completion)
- TTS character usage
- Costs (all-time, today, 7d, 30d)
- Per-user average cost (7d)
- Success/failure rates

### 4. Dashboard UI (`admin/page.tsx`)

Two new sections with:
- Cost overview cards (total, today, 7d, 30d, per-user avg)
- API calls overview (total, 7d, success rate, tokens)
- Call breakdown by type with all-time comparisons
- Sentence generation metrics with word distribution
- Exercise type distribution
- Alerts for high costs (>$100/month) or low success rates (<95%)

## What Still Needs to Be Done

### 1. Database Migration (REQUIRED)
```bash
cd web && npm run db:push
```
This will create the `api_usage_log` table in production.

### 2. Instrument OpenAI API Calls (REQUIRED for data)

Need to update these files to use the usage logger:

**Translation API (`app/api/words/route.ts`):**
```typescript
import { withGPTUsageTracking } from '@/lib/api-usage/logger';

// Wrap the OpenAI translation call
const translation = await withGPTUsageTracking(
  'translation',
  user.id,
  async () => {
    const response = await openai.chat.completions.create({...});
    return {
      result: response.choices[0].message.content,
      usage: response.usage!
    };
  }
);
```

**TTS API (`lib/audio/tts.ts`):**
```typescript
import { withTTSUsageTracking } from '@/lib/api-usage/logger';

// Wrap the OpenAI TTS call
const audioBuffer = await withTTSUsageTracking(
  userId,
  text,
  async () => {
    const response = await openai.audio.speech.create({...});
    return Buffer.from(await response.arrayBuffer());
  }
);
```

**Sentence Generation API (`app/api/sentences/generate/route.ts`):**
```typescript
import { withGPTUsageTracking } from '@/lib/api-usage/logger';

// Wrap the OpenAI sentence generation call
const sentence = await withGPTUsageTracking(
  'sentence_generation',
  userId,
  async () => {
    const response = await openai.chat.completions.create({...});
    return {
      result: response.choices[0].message.content,
      usage: response.usage!
    };
  }
);
```

### 3. Backfill Historical Data (OPTIONAL)

Current implementation only tracks NEW API calls. Historical data (before instrumentation) won't be tracked. This is acceptable - we'll start tracking from the deployment date forward.

### 4. Cost Alerts (OPTIONAL - Post-MVP)

Consider adding:
- Email alerts when daily cost > threshold
- Slack notifications for failed API calls
- Cost projections based on recent usage trends

## Testing

- ✅ Build passes
- ✅ All 302 unit tests pass
- ✅ Dashboard handles missing data gracefully (metrics are optional)
- ⬜ Database migration (needs production access)
- ⬜ OpenAI instrumentation (needs implementation)
- ⬜ E2E verification (needs data in table)

## Files Changed

| File | Change |
|------|--------|
| `web/src/lib/db/schema/api-usage.ts` | **NEW** - API usage log table |
| `web/src/lib/db/schema/index.ts` | Export api-usage table |
| `web/src/lib/api-usage/logger.ts` | **NEW** - Usage logging helpers |
| `web/src/app/api/admin/stats/route.ts` | Add sentence + API usage queries |
| `web/src/app/admin/page.tsx` | Add 2 new dashboard sections |
| `web/scripts/check-user.ts` | **DELETED** - Duplicate debug script |

## Next Steps

1. **Immediate:** Run `npm run db:push` to create the table
2. **Short-term:** Instrument OpenAI API calls (3 files)
3. **Verification:** Wait 24-48h for data to accumulate, then verify metrics
4. **Monitoring:** Set up cost alerts once baseline usage is established

## Why These Metrics Matter

**Sentence Generation:**
- Validates the core product differentiator
- Low usage rate (<30%) indicates pre-generation is inefficient
- Word distribution should favor 3-word sentences (cognitive sweet spot)

**API Costs:**
- OpenAI costs scale linearly with users
- Per-user cost ($0.01-0.10/user/month typical) informs pricing strategy
- Success rate <95% indicates reliability issues needing investigation
- Monthly burn rate >$100 requires cost optimization or pricing adjustments

---

**Session:** 78
**Date:** 2026-01-23
**Status:** Ready for deployment (after db:push + instrumentation)
