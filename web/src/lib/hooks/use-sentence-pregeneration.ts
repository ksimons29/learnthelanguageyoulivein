/**
 * Pre-generation Hook for Sentence Generation
 *
 * Triggers sentence pre-generation when the app becomes visible.
 * Uses visibility change event with a cooldown to prevent excessive API calls.
 *
 * Reference: /docs/engineering/implementation_plan.md (Epic 2)
 */

import { useEffect, useRef, useCallback } from 'react';

interface UseSentencePreGenerationOptions {
  enabled?: boolean;
  cooldownMs?: number;
  onGenerated?: (count: number) => void;
  onError?: (error: Error) => void;
}

const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to automatically pre-generate sentences when app becomes visible
 *
 * Uses document.visibilitychange to detect when user returns to the app,
 * then triggers sentence generation with a cooldown to prevent spam.
 */
export function useSentencePreGeneration(options: UseSentencePreGenerationOptions = {}) {
  const {
    enabled = true,
    cooldownMs = DEFAULT_COOLDOWN_MS,
    onGenerated,
    onError,
  } = options;

  const lastGenerationRef = useRef<number>(0);
  const isGeneratingRef = useRef<boolean>(false);

  const triggerGeneration = useCallback(async () => {
    // Skip if disabled or already generating
    if (!enabled || isGeneratingRef.current) {
      return;
    }

    // Check cooldown
    const now = Date.now();
    if (now - lastGenerationRef.current < cooldownMs) {
      return;
    }

    isGeneratingRef.current = true;

    try {
      const response = await fetch('/api/sentences/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxSentences: 10, // Generate up to 10 sentences in background
        }),
      });

      if (!response.ok) {
        // Don't throw on 401 - user might not be logged in
        if (response.status === 401) {
          return;
        }
        throw new Error(`Generation failed: ${response.status}`);
      }

      const result = await response.json();
      lastGenerationRef.current = Date.now();

      if (onGenerated && result.data?.sentencesGenerated) {
        onGenerated(result.data.sentencesGenerated);
      }
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
      // Silently fail - this is a background optimization
      console.debug('Sentence pre-generation failed:', error);
    } finally {
      isGeneratingRef.current = false;
    }
  }, [enabled, cooldownMs, onGenerated, onError]);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Small delay to let the app settle after becoming visible
        setTimeout(triggerGeneration, 1000);
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also trigger on initial mount if visible
    if (document.visibilityState === 'visible') {
      // Delay initial generation to avoid blocking app startup
      setTimeout(triggerGeneration, 3000);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, triggerGeneration]);

  // Return manual trigger for programmatic use
  return { triggerGeneration };
}

/**
 * Trigger sentence generation after word capture (fire-and-forget)
 *
 * Called from word capture API to opportunistically generate sentences
 * that might include the newly captured word.
 */
export async function triggerSentenceGenerationAfterCapture(): Promise<void> {
  try {
    // Fire-and-forget - don't await
    fetch('/api/sentences/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        maxSentences: 5, // Generate a few sentences with the new word
      }),
    }).catch(() => {
      // Silently fail - this is an optimization, not critical
    });
  } catch {
    // Silently fail
  }
}
