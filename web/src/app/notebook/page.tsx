"use client";

import { useState, useEffect } from "react";
import {
  SearchBar,
  InboxCard,
  CategoryCard,
  NotebookSkeleton,
  JournalHeader,
  AttentionSection,
} from "@/components/notebook";
import { InfoButton } from "@/components/brand";
import { useWordsStore } from "@/lib/store/words-store";
import { getCategoryConfig } from "@/lib/config/categories";
import { BookOpen } from "lucide-react";

/**
 * NotebookPage Component
 *
 * Main notebook view showing the user's word collection organized by category.
 * Now features a personal "Journal Header" with stats and an "Attention Section"
 * for struggling words, making it feel like YOUR language journal.
 *
 * Design: Moleskine aesthetic with ribbon bookmark and elastic band.
 */
export default function NotebookPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { categories, categoriesLoading, inboxCount, fetchCategories, error } =
    useWordsStore();

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Filter categories by search query
  const filteredCategories = categories.filter((cat) => {
    const config = getCategoryConfig(cat.category);
    return config.label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate total words across all categories
  const totalWords = categories.reduce((sum, cat) => sum + cat.totalWords, 0);

  return (
    <div className="min-h-screen notebook-bg relative">
      {/* Ribbon bookmark */}
      <div className="ribbon-bookmark" />

      {/* Elastic band */}
      <div className="elastic-band fixed top-0 bottom-0 right-0 w-8 pointer-events-none z-30" />

      <div className="mx-auto max-w-md px-5 py-6">
        {/* Info Button - top right */}
        <div className="flex justify-end mb-4">
          <InfoButton />
        </div>

        {/* Journal Header - Personal stats */}
        <div className="mb-6">
          <JournalHeader />
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search categories..."
          />
        </div>

        {/* Loading State */}
        {categoriesLoading && <NotebookSkeleton />}

        {/* Error State */}
        {error && !categoriesLoading && (
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: "rgba(232, 92, 74, 0.1)",
              color: "var(--accent-ribbon)",
            }}
          >
            <p className="font-medium">Failed to load categories</p>
            <p className="text-sm mt-1 opacity-80">{error}</p>
            <button
              onClick={() => fetchCategories()}
              className="mt-3 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: "var(--accent-ribbon)",
                color: "white",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!categoriesLoading && !error && categories.length === 0 && (
          <div className="py-12 text-center">
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: "var(--accent-nav-light)" }}
            >
              <BookOpen
                className="h-8 w-8"
                style={{ color: "var(--accent-nav)" }}
              />
            </div>
            <h3
              className="text-lg font-semibold heading-serif mb-2"
              style={{ color: "var(--text-heading)" }}
            >
              Your notebook is empty
            </h3>
            <p
              className="text-sm max-w-xs mx-auto"
              style={{ color: "var(--text-muted)" }}
            >
              Capture your first phrase from the home screen to start building
              your collection.
            </p>
          </div>
        )}

        {/* Content - Only show when loaded and not in error state */}
        {!categoriesLoading && !error && categories.length > 0 && (
          <>
            {/* Attention Section - Words that need help */}
            <AttentionSection className="mb-6" />

            {/* Inbox - Recently captured */}
            {inboxCount > 0 && (
              <div className="mb-6 page-stack-3d">
                <InboxCard count={inboxCount} />
              </div>
            )}

            {/* Categories */}
            <section className="pb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-6 rounded-full"
                    style={{ backgroundColor: "var(--accent-nav)" }}
                  />
                  <h2
                    className="text-xl font-semibold heading-serif ink-text"
                    style={{ color: "var(--text-heading)" }}
                  >
                    Categories
                  </h2>
                </div>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {totalWords} phrases
                </span>
              </div>

              {/* No results from search */}
              {filteredCategories.length === 0 && searchQuery && (
                <div className="py-8 text-center">
                  <p style={{ color: "var(--text-muted)" }}>
                    No categories match &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              )}

              {/* Category list */}
              <div className="space-y-3">
                {filteredCategories.map((cat) => {
                  const config = getCategoryConfig(cat.category);
                  return (
                    <CategoryCard
                      key={cat.category}
                      icon={config.icon}
                      name={config.label}
                      totalPhrases={cat.totalWords}
                      dueCount={cat.dueCount}
                      href={`/notebook/${cat.category}`}
                    />
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
