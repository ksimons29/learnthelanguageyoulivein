# Production Performance Baseline

**Date:** 2026-01-28
**Environment:** Production (https://llyli.vercel.app)
**Method:** Playwright automated testing with `networkidle` wait

## Page Load Times (Full Load with Network Idle)

| Route | Min (ms) | Median (ms) | Max (ms) | Avg (ms) |
|-------|----------|-------------|----------|----------|
| `/` (Today) | 6,391 | 7,137 | 7,644 | 7,057 |
| `/capture` | 6,310 | 6,401 | 6,404 | 6,372 |
| `/review` | 5,952 | 6,248 | 7,317 | 6,506 |
| `/notebook` | 6,670 | 7,184 | 7,951 | 7,268 |
| `/progress` | 6,284 | 6,416 | 6,459 | 6,386 |

**Note:** These times include waiting for all network activity to settle (`networkidle`), which is conservative. Perceived load time (DOM content loaded) is faster.

## Initial Page Load Metrics

From Navigation Timing API on first `/` load:

| Metric | Value |
|--------|-------|
| First Byte (TTFB) | 2,610 ms |
| DOM Content Loaded | 2,873 ms |
| Full Page Load | 2,924 ms |
| Transfer Size | 21.6 KB |

## API Response Times

Measured via Resource Timing API (first load, subsequent loads show caching):

| Endpoint | First Load (ms) | Cached Load (ms) |
|----------|-----------------|------------------|
| `/api/onboarding/status` | 713 | ~1,300-2,000 |
| `/api/tours/progress` | 914 | ~1,500-2,200 |
| `/api/words` | 1,353 | ~2,400-3,300 |
| `/api/words/stats` | 1,045 | ~2,000-2,800 |
| `/api/gamification/state` | 1,674 | ~3,100-4,600 |

**Observations:**
- `gamification/state` is the slowest endpoint (up to 4.6s on subsequent loads)
- API response times increase on subsequent calls due to waterfall loading
- Consider optimizing `/api/gamification/state` endpoint

## Recommendations

### P1 - Should Address
1. **Optimize `/api/gamification/state`** - Consistently slowest endpoint
2. **Consider API aggregation** - Multiple API calls on page load create waterfall

### P2 - Nice to Have
3. **Add server-side caching** - For endpoints that don't change frequently
4. **Prefetch on navigation** - Start loading next page data before click

## Acceptance Criteria Status

- [x] All routes measured
- [x] Baseline documented
- [x] Outliers identified (`gamification/state` >2s flagged)

---

*Generated via automated Playwright testing*
