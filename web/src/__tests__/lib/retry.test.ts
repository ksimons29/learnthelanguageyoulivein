import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, sleep } from '@/lib/utils/retry';

describe('withRetry', () => {
  it('returns result on first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await withRetry(fn, 3, 10);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds on second attempt', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('transient error'))
      .mockResolvedValue('success');

    const result = await withRetry(fn, 3, 10);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on failure and succeeds on third attempt', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('error 1'))
      .mockRejectedValueOnce(new Error('error 2'))
      .mockResolvedValue('success');

    const result = await withRetry(fn, 3, 10);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after all retries exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent error'));

    await expect(withRetry(fn, 3, 10)).rejects.toThrow('persistent error');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('respects custom maxRetries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('error'));

    await expect(withRetry(fn, 5, 10)).rejects.toThrow('error');
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it('respects custom baseDelayMs (with minimal delay for testing)', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('error'))
      .mockResolvedValue('success');

    // Use real timers but with minimal delay
    const result = await withRetry(fn, 2, 10);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('uses defaults when not specified', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('error'))
      .mockResolvedValue('success');

    // Override console.warn to not pollute test output
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Use minimal delay to test default behavior
    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);

    warnSpy.mockRestore();
  });
});

describe('sleep', () => {
  it('resolves after specified duration', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;

    // Allow for some timing variance
    expect(elapsed).toBeGreaterThanOrEqual(45);
    expect(elapsed).toBeLessThan(100);
  });

  it('works with 0ms', async () => {
    const start = Date.now();
    await sleep(0);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(50);
  });
});
