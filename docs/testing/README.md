# Testing Documentation

This directory contains test plans, results, and baselines for LLYLI.

## Quick Reference

| File | Purpose |
|------|---------|
| [IPHONE16_TEST_RESULTS.md](IPHONE16_TEST_RESULTS.md) | iPhone 16 Chrome verification (primary device) |
| [PERFORMANCE_BASELINE.md](PERFORMANCE_BASELINE.md) | API and page load latency baselines |
| [MVP_LAUNCH_TEST_PLAN.md](MVP_LAUNCH_TEST_PLAN.md) | MVP launch verification checklist |

## When to Update

### Performance Baseline
Update when:
- Before/after optimization work
- Infrastructure changes (new APIs, caching)
- Quarterly or before major releases

### Device Test Results
Update when:
- Testing new device types
- Major UI/UX changes
- Before App Store submissions

## Related Documentation

- **Main testing guide:** [../engineering/TESTING.md](../engineering/TESTING.md)
- **Bug reporting:** [../engineering/BUG_REPORTING.md](../engineering/BUG_REPORTING.md)

## Adding New Test Results

When documenting new test runs:

1. Create file with pattern: `{DEVICE}_TEST_RESULTS.md` or `{FEATURE}_TEST_RESULTS.md`
2. Include: date, method, account used, pass/fail summary
3. Add screenshots to `.playwright-mcp/` or a dedicated folder
4. Update this README and `../engineering/TESTING.md` Section 14
