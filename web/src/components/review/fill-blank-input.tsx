"use client";

import { useState, useRef, useEffect } from "react";
import { Check, X, AlertTriangle } from "lucide-react";
import { evaluateAnswer, type AnswerEvaluation } from "@/lib/review/answer-evaluation";

interface FillBlankInputProps {
  /** The correct answer (the blanked word's meaning) */
  correctAnswer: string;
  /** Called when user submits (Enter key or button) */
  onSubmit: (userAnswer: string, isCorrect: boolean, evaluation: AnswerEvaluation) => void;
  /** Disable input after submission */
  disabled?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
}

/**
 * FillBlankInput Component
 *
 * Text input for fill-in-the-blank exercises.
 * Uses fuzzy matching to allow for minor typos.
 * Shows visual feedback with three states: correct, typo, incorrect.
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
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    if (disabled || submitted || !value.trim()) return;

    const result = evaluateAnswer(value, correctAnswer);
    const isCorrect = result.status !== 'incorrect';

    setEvaluation(result);
    setSubmitted(true);
    onSubmit(value, isCorrect, result);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Determine border color based on state
  const getBorderColor = () => {
    if (!submitted || !evaluation) return "var(--border)";
    if (evaluation.status === 'correct') return "var(--state-easy)";
    if (evaluation.status === 'correct_with_typo') return "var(--state-medium, #f59e0b)";
    return "var(--state-hard)";
  };

  const getBackgroundColor = () => {
    if (!submitted || !evaluation) return "var(--surface-page)";
    if (evaluation.status === 'correct') return "var(--state-easy-bg)";
    if (evaluation.status === 'correct_with_typo') return "var(--state-medium-bg, #fef3c7)";
    return "var(--state-hard-bg)";
  };

  const getIcon = () => {
    if (!evaluation) return null;
    if (evaluation.status === 'correct') {
      return <Check className="h-5 w-5" style={{ color: "var(--state-easy)" }} />;
    }
    if (evaluation.status === 'correct_with_typo') {
      return <AlertTriangle className="h-5 w-5" style={{ color: "var(--state-medium, #f59e0b)" }} />;
    }
    return <X className="h-5 w-5" style={{ color: "var(--state-hard)" }} />;
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
              {getIcon()}
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
