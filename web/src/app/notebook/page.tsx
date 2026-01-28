"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { BookOpen, Search, Loader2 } from "lucide-react";
import { useTour } from "@/lib/tours/hooks/use-tour";
import { registerNotebookTour } from "@/lib/tours/tours/notebook-tour";

// Type for word search results
interface SearchResultWord {
  id: string;
  originalText: string;
  translation: string;
  category: string;
  audioUrl?: string | null;
}

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
  const [searchResults, setSearchResults] = useState<SearchResultWord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedWord, setSelectedWord] = useState<SearchResultWord | null>(
    null
  );

  const { categories, categoriesLoading, inboxCount, fetchCategories, error } =
    useWordsStore();

  // Tour state
  const { isCompleted: tourCompleted, isLoading: tourLoading, startTour, markTourComplete } = useTour("notebook");
  const tourStartedRef = useRef(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Register notebook tour with completion callback
  useEffect(() => {
    registerNotebookTour(markTourComplete);
  }, [markTourComplete]);

  // Auto-start tour for first-time visitors (only once per session)
  useEffect(() => {
    if (
      !tourLoading &&
      !tourCompleted &&
      !tourStartedRef.current &&
      !categoriesLoading &&
      categories.length > 0
    ) {
      tourStartedRef.current = true;
      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        startTour();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tourLoading, tourCompleted, categoriesLoading, categories.length, startTour]);

  // Debounced word search
  useEffect(() => {
    // Clear results if search is too short
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/words?search=${encodeURIComponent(searchQuery)}&limit=20`
        );
        if (response.ok) {
          const { data } = await response.json();
          setSearchResults(data?.words || []);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter categories by search query (only used when not showing word results)
  const filteredCategories = categories.filter((cat) => {
    const config = getCategoryConfig(cat.category);
    return config.label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Determine if we should show word search results
  const showWordResults = searchQuery.length >= 2;

  // Calculate total words across all categories
  const totalWords = categories.reduce((sum, cat) => sum + cat.totalWords, 0);

  return (
    <div className="min-h-screen notebook-bg relative">
      {/* Ribbon bookmark */}
      <div className="ribbon-bookmark" />

      {/* Elastic band */}
      <div className="elastic-band fixed top-0 bottom-0 right-0 w-8 pointer-events-none z-30" />

      {/* Safe area inset for iOS notch */}
      <div
        className="mx-auto max-w-md px-5 pb-6"
        style={{ paddingTop: "max(24px, env(safe-area-inset-top, 24px))" }}
      >
        {/* Info Button & Replay Tour - top right, with additional notch clearance */}
        <div className="flex justify-end mb-4 mt-2">
          <InfoButton tourId="notebook" />
        </div>

        {/* Journal Header - Personal stats */}
        <div id="journal-header" className="mb-6">
          <JournalHeader />
        </div>

        {/* Search */}
        <div id="search-bar" className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search words & categories..."
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
            {/* Attention Section - Hide when searching */}
            {!showWordResults && <AttentionSection className="mb-6" />}

            {/* Inbox - Hide when searching */}
            {!showWordResults && inboxCount > 0 && (
              <div id="inbox-category" className="mb-6 page-stack-3d">
                <InboxCard count={inboxCount} />
              </div>
            )}

            {/* Search Results - Show when searching */}
            {showWordResults && (
              <section className="pb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 h-6 rounded-full"
                      style={{ backgroundColor: "var(--accent-ribbon)" }}
                    />
                    <h2
                      className="text-xl font-semibold heading-serif ink-text"
                      style={{ color: "var(--text-heading)" }}
                    >
                      Search Results
                    </h2>
                  </div>
                  {isSearching ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      style={{ color: "var(--text-muted)" }}
                    />
                  ) : (
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {searchResults.length} found
                    </span>
                  )}
                </div>

                {/* Search loading state */}
                {isSearching && searchResults.length === 0 && (
                  <div className="py-6 text-center">
                    <Loader2
                      className="h-6 w-6 animate-spin mx-auto mb-2"
                      style={{ color: "var(--accent-nav)" }}
                    />
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Searching...
                    </p>
                  </div>
                )}

                {/* No results */}
                {!isSearching && searchResults.length === 0 && (
                  <div className="py-8 text-center">
                    <Search
                      className="h-8 w-8 mx-auto mb-3"
                      style={{ color: "var(--text-muted)", opacity: 0.5 }}
                    />
                    <p style={{ color: "var(--text-muted)" }}>
                      No words match &ldquo;{searchQuery}&rdquo;
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-3 text-sm font-medium transition-opacity hover:opacity-80"
                      style={{ color: "var(--accent-nav)" }}
                    >
                      Clear search
                    </button>
                  </div>
                )}

                {/* Search results list */}
                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((word) => {
                      const categoryConfig = getCategoryConfig(word.category);
                      return (
                        <a
                          key={word.id}
                          href={`/notebook/${word.category}?highlight=${word.id}`}
                          className="block p-4 rounded-lg transition-all duration-200 hover:scale-[1.01]"
                          style={{
                            backgroundColor: "var(--surface-page)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-medium truncate"
                                style={{ color: "var(--text-heading)" }}
                              >
                                {word.originalText}
                              </p>
                              <p
                                className="text-sm truncate mt-0.5"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {word.translation}
                              </p>
                            </div>
                            <span
                              className="text-xs px-2 py-1 rounded-full flex-shrink-0"
                              style={{
                                backgroundColor: "var(--accent-nav-light)",
                                color: "var(--accent-nav)",
                              }}
                            >
                              {categoryConfig.label}
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* Categories - Hide when showing search results */}
            {!showWordResults && (
              <section id="category-grid" className="pb-8">
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
            )}
          </>
        )}
      </div>
    </div>
  );
}
