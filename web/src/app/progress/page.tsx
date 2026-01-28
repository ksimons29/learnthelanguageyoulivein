"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { CompactProgressCard, ForecastChart } from "@/components/progress";
import { InfoButton } from "@/components/brand";
import type { Word } from "@/lib/db/schema";
import { useTour } from "@/lib/tours/hooks/use-tour";
import { registerProgressTour } from "@/lib/tours/tours/progress-tour";
import { tourManager } from "@/lib/tours/tour-manager";

/**
 * Progress Data from /api/progress
 */
interface ProgressData {
  totalWords: number;
  wordsThisWeek: number;
  masteredWords: number;
  retentionRate: number;
  currentStreak: number;
  dueToday: number;
  needPractice: number;
  forecast: { date: string; count: number }[];
  strugglingWordsList: Word[];
  newCardsCount: number;
}

/**
 * Progress Page - Compact Moleskine Design
 *
 * iPhone-friendly single-screen dashboard.
 * Uses Moleskine design tokens throughout.
 */
function ProgressPageContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tour state
  const { isCompleted: tourCompleted, isLoading: tourLoading, startTour, markTourComplete } = useTour("progress");
  const tourStartedRef = useRef(false);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const response = await fetch("/api/progress");
        if (!response.ok) {
          if (response.status === 401) {
            setError("Please sign in to view your progress");
          } else {
            throw new Error("Failed to fetch progress data");
          }
          return;
        }
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgress();
  }, []);

  // Register progress tour with completion callback
  useEffect(() => {
    registerProgressTour(markTourComplete);
  }, [markTourComplete]);

  // Auto-start tour for first-time visitors (only once per session)
  useEffect(() => {
    if (
      !tourLoading &&
      !tourCompleted &&
      !tourStartedRef.current &&
      !isLoading &&
      data
    ) {
      tourStartedRef.current = true;
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tourLoading, tourCompleted, isLoading, data, startTour]);

  // Handle tour replay via query param (from feedback sheet)
  useEffect(() => {
    const startTourParam = searchParams.get("startTour");
    if (startTourParam === "progress" && !tourManager.isActive()) {
      // Register tour and start after small delay for DOM to render
      registerProgressTour(markTourComplete);
      const timer = setTimeout(() => {
        tourManager.startTour("progress");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, markTourComplete]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className="h-8 w-8 animate-spin mx-auto mb-2"
            style={{ color: "var(--accent-nav)" }}
          />
          <p style={{ color: "var(--text-muted)" }}>Loading progress...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center px-5">
        <div
          className="text-center p-6 rounded-xl max-w-sm"
          style={{
            backgroundColor: "var(--surface-page)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p className="mb-4" style={{ color: "var(--text-body)" }}>
            {error}
          </p>
          <a
            href="/auth/sign-in"
            className="inline-block px-6 py-2 rounded-lg font-medium"
            style={{
              backgroundColor: "var(--accent-ribbon)",
              color: "var(--text-on-ribbon)",
            }}
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen notebook-bg flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: "var(--text-muted)" }}>No progress data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen notebook-bg relative">
      {/* Ribbon bookmark */}
      <div className="ribbon-bookmark" />

      <div className="mx-auto max-w-md px-4 py-5 pb-24">
        {/* Header */}
        <div className="mb-5 mt-2 flex items-center justify-between">
          <div>
            <h1
              className="text-3xl heading-serif"
              style={{ color: "var(--text-heading)" }}
            >
              Progress
            </h1>
            <p
              className="text-sm handwritten"
              style={{ color: "var(--text-muted)" }}
            >
              Your learning journey
            </p>
          </div>
          <InfoButton tourId="progress" />
        </div>

        {/* Compact Progress Card - contains stats and streak */}
        <section id="stats-overview" className="mb-4">
          <CompactProgressCard
            totalWords={data.totalWords}
            wordsThisWeek={data.wordsThisWeek}
            retentionRate={data.retentionRate}
            currentStreak={data.currentStreak}
            dueToday={data.dueToday}
            needPractice={data.needPractice}
            strugglingWordsList={data.strugglingWordsList}
            newCardsCount={data.newCardsCount}
            masteredWords={data.masteredWords}
          />
        </section>

        {/* Forecast Chart */}
        <section id="forecast-chart" className="mb-4">
          <ForecastChart forecast={data.forecast} />
        </section>
      </div>
    </div>
  );
}

/**
 * Loading fallback for Suspense boundary
 */
function ProgressPageFallback() {
  return (
    <div className="min-h-screen notebook-bg flex items-center justify-center">
      <div className="text-center">
        <Loader2
          className="h-8 w-8 animate-spin mx-auto mb-2"
          style={{ color: "var(--accent-nav)" }}
        />
        <p style={{ color: "var(--text-muted)" }}>Loading progress...</p>
      </div>
    </div>
  );
}

/**
 * ProgressPage with Suspense boundary for useSearchParams
 * Required by Next.js 16+ for client-side rendering bailout
 */
export default function ProgressPage() {
  return (
    <Suspense fallback={<ProgressPageFallback />}>
      <ProgressPageContent />
    </Suspense>
  );
}
