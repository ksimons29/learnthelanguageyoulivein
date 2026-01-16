"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioPlayerOptions {
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  play: (url: string) => Promise<void>;
  stop: () => void;
  currentUrl: string | null;
}

/**
 * useAudioPlayer Hook
 *
 * Manages audio playback state with a single Audio element.
 * Prevents overlapping audio by stopping previous playback before starting new.
 *
 * Usage:
 * ```tsx
 * const { play, stop, isPlaying, isLoading } = useAudioPlayer();
 *
 * <button onClick={() => play(audioUrl)}>
 *   {isPlaying ? 'Stop' : 'Play'}
 * </button>
 * ```
 */
export function useAudioPlayer(options: UseAudioPlayerOptions = {}): UseAudioPlayerReturn {
  const { onEnded, onError } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio element on mount (client-side only)
  useEffect(() => {
    audioRef.current = new Audio();

    const audio = audioRef.current;

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentUrl(null);
      onEnded?.();
    };

    const handleError = () => {
      const errorMessage = audio.error?.message || 'Failed to play audio';
      setError(errorMessage);
      setIsPlaying(false);
      setIsLoading(false);
      onError?.(new Error(errorMessage));
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
      audio.src = '';
    };
  }, [onEnded, onError]);

  const play = useCallback(async (url: string) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    // If same URL is playing, toggle off
    if (currentUrl === url && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    // Stop any current playback
    audio.pause();
    setError(null);
    setIsLoading(true);
    setCurrentUrl(url);

    try {
      audio.src = url;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to play audio';
      setError(errorMessage);
      setIsPlaying(false);
      onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [currentUrl, isPlaying, onError]);

  const stop = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentUrl(null);
  }, []);

  return {
    isPlaying,
    isLoading,
    error,
    play,
    stop,
    currentUrl,
  };
}
