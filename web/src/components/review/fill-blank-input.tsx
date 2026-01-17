"use client";

import { useState, useRef, useEffect } from "react";
import { Check, X } from "lucide-react";

interface FillBlankInputProps {
  /** The correct answer (the blanked word) */
  correctAnswer: string;
  /** Called when user submits (Enter key or button) */
  onSubmit: (userAnswer: string, isCorrect: boolean) => void;
  /** Disable input after submission */
  disabled?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
}

/**
 * FillBlankInput Component
 *
 * Text input for fill-in-the-blank exercises.
 * Validates answer case-insensitively and shows visual feedback.
 *
 * Moleskine aesthetic: ruled-line style input with paper texture.
 */
export function FillBlankInput({
  correctAnswer,
  onSubmit,
  disabled = false,
  autoFocus = true,
}: FillBlankInputProps) {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const normalizeAnswer = (text: string): string => {
    return text.toLowerCase().trim();
  };

  const handleSubmit = () => {
    if (disabled || submitted || !value.trim()) return;

    const correct =
      normalizeAnswer(value) === normalizeAnswer(correctAnswer);
    setIsCorrect(correct);
    setSubmitted(true);
    onSubmit(value, correct);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Determine border color based on state
  const getBorderColor = () => {
    if (!submitted) return "var(--border)";
    return isCorrect ? "var(--state-easy)" : "var(--state-hard)";
  };

  const getBackgroundColor = () => {
    if (!submitted) return "var(--surface-page)";
    return isCorrect ? "var(--state-easy-bg)" : "var(--state-hard-bg)";
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => !submitted && setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || submitted}
            placeholder="Type your answer..."
            className="w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed"
            style={{
              borderColor: getBorderColor(),
              backgroundColor: getBackgroundColor(),
              color: "var(--text-body)",
            }}
            aria-label="Fill in the blank answer"
          />
          {submitted && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              {isCorrect ? (
                <Check
                  className="h-5 w-5"
                  style={{ color: "var(--state-easy)" }}
                />
              ) : (
                <X
                  className="h-5 w-5"
                  style={{ color: "var(--state-hard)" }}
                />
              )}
            </div>
          )}
        </div>

        {!submitted && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="px-5 py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--accent-nav)" }}
          >
            Check
          </button>
        )}
      </div>
    </div>
  );
}
