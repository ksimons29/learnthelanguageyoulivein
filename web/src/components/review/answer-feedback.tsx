"use client";

import { Check, X, AlertTriangle } from "lucide-react";
import type { AnswerStatus } from "@/lib/review/answer-evaluation";

interface AnswerFeedbackProps {
  /** The evaluation status of the answer */
  status: AnswerStatus;
  /** The correct answer (shown if incorrect) */
  correctAnswer?: string;
  /** Corrected spelling (shown if correct_with_typo) */
  correctedSpelling?: string;
  /** Optional custom message */
  message?: string;
}

/**
 * AnswerFeedback Component
 *
 * Shows feedback after user submits an answer, before grading.
 * Three states:
 * - Correct: Green "Correct!" with checkmark
 * - Correct with typo: Amber "Correct! (Watch spelling...)" with warning
 * - Incorrect: Red "Not quite. The answer was: X"
 *
 * Moleskine aesthetic: paper card with subtle shadow.
 */
export function AnswerFeedback({
  status,
  correctAnswer,
  correctedSpelling,
  message,
}: AnswerFeedbackProps) {
  // Determine colors and icons based on status
  const isCorrect = status !== 'incorrect';
  const isTypo = status === 'correct_with_typo';

  // Use amber for typos, green for correct, red for incorrect
  const getBackgroundColor = () => {
    if (status === 'correct') return "var(--state-easy-bg)";
    if (status === 'correct_with_typo') return "var(--state-medium-bg, #fef3c7)"; // amber-100 fallback
    return "var(--state-hard-bg)";
  };

  const getBorderColor = () => {
    if (status === 'correct') return "var(--state-easy)";
    if (status === 'correct_with_typo') return "var(--state-medium, #f59e0b)"; // amber-500 fallback
    return "var(--state-hard)";
  };

  const getIconBgColor = () => {
    if (status === 'correct') return "var(--state-easy)";
    if (status === 'correct_with_typo') return "var(--state-medium, #f59e0b)";
    return "var(--state-hard)";
  };

  const getTextColor = () => {
    if (status === 'correct') return "var(--state-easy)";
    if (status === 'correct_with_typo') return "var(--state-medium, #d97706)"; // amber-600 fallback
    return "var(--state-hard)";
  };

  const getIcon = () => {
    if (status === 'correct') return <Check className="h-5 w-5 text-white" />;
    if (status === 'correct_with_typo') return <AlertTriangle className="h-5 w-5 text-white" />;
    return <X className="h-5 w-5 text-white" />;
  };

  const getDefaultMessage = () => {
    if (status === 'correct') return "Correct!";
    if (status === 'correct_with_typo') return "Correct!";
    return "Not quite";
  };

  return (
    <div
      className="mt-4 p-4 rounded-lg border"
      style={{
        backgroundColor: getBackgroundColor(),
        borderColor: getBorderColor(),
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
          style={{
            backgroundColor: getIconBgColor(),
          }}
        >
          {getIcon()}
        </div>

        <div>
          <p
            className="font-semibold"
            style={{
              color: getTextColor(),
            }}
          >
            {message || getDefaultMessage()}
          </p>

          {/* Show spelling correction for typos */}
          {isTypo && correctedSpelling && (
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-body)" }}
            >
              Watch spelling:{" "}
              <span className="font-medium">{correctedSpelling}</span>
            </p>
          )}

          {/* Show correct answer if incorrect */}
          {!isCorrect && correctAnswer && (
            <p
              className="text-sm mt-1"
              style={{ color: "var(--text-body)" }}
            >
              The answer was:{" "}
              <span className="font-medium">{correctAnswer}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
