"use client";

import { useState, useEffect } from "react";
import { MessageSquareText, Loader2 } from "lucide-react";

interface SentenceHistoryItem {
  id: string;
  text: string;
  translation: string | null;
  usedAt: string;
}

interface SentenceHistoryProps {
  wordId: string;
}

/**
 * SentenceHistory Component
 *
 * Displays practice sentences that include a specific word.
 * Shows up to 3 most recent sentences with translations and practice dates.
 *
 * Design: Follows Moleskine styling with teal left border.
 */
export function SentenceHistory({ wordId }: SentenceHistoryProps) {
  const [sentences, setSentences] = useState<SentenceHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSentences() {
      if (!wordId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/words/${wordId}/sentences`);

        if (!response.ok) {
          if (response.status === 404) {
            // No sentences found - this is normal
            setSentences([]);
            return;
          }
          throw new Error("Failed to fetch sentences");
        }

        const data = await response.json();
        setSentences(data.sentences || []);
      } catch (err) {
        console.error("Error fetching sentence history:", err);
        setError("Could not load sentences");
        setSentences([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSentences();
  }, [wordId]);

  // Don't render anything if loading
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-4"
        style={{ color: "var(--text-muted)" }}
      >
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm">Loading sentences...</span>
      </div>
    );
  }

  // Don't render if error or no sentences
  if (error || sentences.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <MessageSquareText
          className="h-4 w-4"
          style={{ color: "var(--accent-nav)" }}
        />
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--text-heading)" }}
        >
          Practice Sentences
        </h3>
      </div>

      {/* Sentence list */}
      <div className="space-y-3">
        {sentences.map((sentence) => (
          <SentenceCard key={sentence.id} sentence={sentence} />
        ))}
      </div>
    </div>
  );
}

interface SentenceCardProps {
  sentence: SentenceHistoryItem;
}

function SentenceCard({ sentence }: SentenceCardProps) {
  // Format the practice date
  const practiceDate = new Date(sentence.usedAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="p-3 rounded-r-xl"
      style={{
        backgroundColor: "var(--surface-page)",
        borderLeft: "3px solid var(--accent-nav)",
      }}
    >
      {/* Target language sentence */}
      <p
        className="text-sm font-medium mb-1"
        style={{ color: "var(--text-heading)" }}
      >
        {sentence.text}
      </p>

      {/* Native language translation */}
      {sentence.translation && (
        <p
          className="text-sm mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          {sentence.translation}
        </p>
      )}

      {/* Practice date */}
      <p
        className="text-xs text-right"
        style={{ color: "var(--text-muted)" }}
      >
        Practiced {practiceDate}
      </p>
    </div>
  );
}
