"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Search, X, BookOpen, Inbox } from "lucide-react";
import { useWordsStore, type WordWithSentence } from "@/lib/store/words-store";
import { getCategoryConfig, INBOX_ICON } from "@/lib/config/categories";
import {
  SearchBar,
  WordCard,
  WordDetailSheet,
  CategoryDetailSkeleton,
} from "@/components/notebook";

/**
 * CategoryDetailPage Component
 *
 * Shows all words within a specific category with search and detail view.
 * Fetches words filtered by category from the API.
 *
 * Design: Moleskine notebook styling with back navigation.
 */
export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<WordWithSentence | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { words, isLoading, error, fetchWords, setFilter } = useWordsStore();

  // Check if this is the special "inbox" view
  const isInbox = category === 'inbox';

  // Get category configuration (inbox has special handling)
  const categoryConfig = isInbox
    ? { key: 'inbox', label: 'Inbox', icon: INBOX_ICON }
    : getCategoryConfig(category);
  const CategoryIcon = categoryConfig.icon;

  // Fetch words for this category on mount (with sentences for notebook display)
  const loadWords = useCallback(() => {
    setFilter({ category, search: undefined, includeSentences: true });
    fetchWords();
  }, [category, setFilter, fetchWords]);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  // Filter words by local search query
  const filteredWords = words.filter((word) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      word.originalText.toLowerCase().includes(query) ||
      word.translation.toLowerCase().includes(query)
    );
  });

  // Handle word click (for detail sheet)
  const handleWordClick = (word: WordWithSentence) => {
    setSelectedWord(word);
    setSheetOpen(true);
  };

  // Handle word deletion
  const handleWordDeleted = () => {
    loadWords(); // Refresh the list
  };

  return (
    <div className="min-h-screen notebook-bg relative">
      {/* Elastic band */}
      <div className="elastic-band fixed top-0 bottom-0 right-0 w-8 pointer-events-none z-30" />

      <div className="mx-auto max-w-md px-5 py-6">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/notebook")}
            className="flex items-center gap-2 mb-4 text-sm font-medium transition-colors"
            style={{ color: "var(--accent-nav)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Notebook
          </button>

          <div className="flex items-center gap-4">
            {/* Category icon */}
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--accent-nav-light)",
                border: "2px solid var(--accent-nav)",
              }}
            >
              <CategoryIcon
                className="h-7 w-7"
                style={{ color: "var(--accent-nav)" }}
                strokeWidth={1.5}
              />
            </div>

            {/* Category info */}
            <div>
              <h1
                className="text-3xl heading-serif ink-text tracking-tight"
                style={{ color: "var(--text-heading)" }}
              >
                {categoryConfig.label}
              </h1>
              <p
                className="text-sm mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                {words.length} phrases
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search phrases..."
          />
        </div>

        {/* Loading State */}
        {isLoading && <CategoryDetailSkeleton />}

        {/* Error State */}
        {error && !isLoading && (
          <div
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: "rgba(232, 92, 74, 0.1)",
              color: "var(--accent-ribbon)",
            }}
          >
            <p className="font-medium">Failed to load phrases</p>
            <p className="text-sm mt-1 opacity-80">{error}</p>
            <button
              onClick={loadWords}
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
        {!isLoading && !error && words.length === 0 && (
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
              No phrases in {categoryConfig.label}
            </h3>
            <p
              className="text-sm max-w-xs mx-auto"
              style={{ color: "var(--text-muted)" }}
            >
              Phrases you capture will be automatically categorized here.
            </p>
          </div>
        )}

        {/* No search results */}
        {!isLoading &&
          !error &&
          words.length > 0 &&
          filteredWords.length === 0 &&
          searchQuery && (
            <div className="py-8 text-center">
              <Search
                className="h-8 w-8 mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <p style={{ color: "var(--text-muted)" }}>
                No phrases match &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm flex items-center gap-1 mx-auto"
                style={{ color: "var(--accent-nav)" }}
              >
                <X className="h-3 w-3" />
                Clear search
              </button>
            </div>
          )}

        {/* Word List */}
        {!isLoading && !error && filteredWords.length > 0 && (
          <div className="space-y-3 pb-8">
            {filteredWords.map((word) => (
              <WordCard
                key={word.id}
                word={word}
                sentence={word.sentence}
                expandable={true}
                onClick={() => handleWordClick(word)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Word Detail Sheet */}
      <WordDetailSheet
        word={selectedWord}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onDeleted={handleWordDeleted}
      />
    </div>
  );
}
