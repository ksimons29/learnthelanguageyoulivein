"use client";

import { Check, X } from "lucide-react";

interface AnswerFeedbackProps {
  /** Whether the answer was correct */
  isCorrect: boolean;
  /** The correct answer (shown if incorrect) */
  correctAnswer?: string;
  /** Optional custom message */
  message?: string;
}

/**
 * AnswerFeedback Component
 *
 * Shows feedback after user submits an answer, before grading.
 * "Correct!" with checkmark or "Not quite. The answer was: X"
 *
 * Moleskine aesthetic: paper card with subtle shadow.
 */
export function AnswerFeedback({
  isCorrect,
  correctAnswer,
  message,
}: AnswerFeedbackProps) {
  return (
    <div
      className="mt-4 p-4 rounded-lg border"
      style={{
        backgroundColor: isCorrect
          ? "var(--state-easy-bg)"
          : "var(--state-hard-bg)",
        borderColor: isCorrect ? "var(--state-easy)" : "var(--state-hard)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
          style={{
            backgroundColor: isCorrect
              ? "var(--state-easy)"
              : "var(--state-hard)",
          }}
        >
          {isCorrect ? (
            <Check className="h-5 w-5 text-white" />
          ) : (
            <X className="h-5 w-5 text-white" />
          )}
        </div>

        <div>
          <p
            className="font-semibold"
            style={{
              color: isCorrect ? "var(--state-easy)" : "var(--state-hard)",
            }}
          >
            {message
              ? message
              : isCorrect
              ? "Correct!"
              : "Not quite"}
          </p>

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
