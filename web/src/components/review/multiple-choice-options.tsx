"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultipleChoiceOption {
  id: string;
  text: string;
}

interface MultipleChoiceOptionsProps {
  /** The 4 options (should be shuffled before passing) */
  options: MultipleChoiceOption[];
  /** ID of the correct option */
  correctOptionId: string;
  /** Called when user selects an option */
  onSelect: (selectedId: string, isCorrect: boolean) => void;
  /** Disable all options after selection */
  disabled?: boolean;
  /** The selected option ID (for showing results) */
  selectedId?: string | null;
}

/**
 * MultipleChoiceOptions Component
 *
 * Display 4 option buttons for multiple choice exercises.
 * Shows visual feedback after selection: green for correct, red for wrong.
 *
 * Moleskine aesthetic: paper-style buttons with binding edge.
 */
export function MultipleChoiceOptions({
  options,
  correctOptionId,
  onSelect,
  disabled = false,
  selectedId = null,
}: MultipleChoiceOptionsProps) {
  const handleSelect = (optionId: string) => {
    if (disabled || selectedId !== null) return;
    const isCorrect = optionId === correctOptionId;
    onSelect(optionId, isCorrect);
  };

  const getOptionState = (optionId: string) => {
    if (selectedId === null) return "default";
    if (optionId === selectedId) {
      return optionId === correctOptionId ? "correct" : "incorrect";
    }
    // Show the correct answer if user selected wrong
    if (optionId === correctOptionId && selectedId !== correctOptionId) {
      return "showCorrect";
    }
    return "dimmed";
  };

  const getOptionStyles = (state: string) => {
    switch (state) {
      case "correct":
        return {
          backgroundColor: "var(--state-easy-bg)",
          borderColor: "var(--state-easy)",
          color: "var(--state-easy)",
        };
      case "incorrect":
        return {
          backgroundColor: "var(--state-hard-bg)",
          borderColor: "var(--state-hard)",
          color: "var(--state-hard)",
        };
      case "showCorrect":
        return {
          backgroundColor: "var(--state-easy-bg)",
          borderColor: "var(--state-easy)",
          borderStyle: "dashed",
          color: "var(--state-easy)",
        };
      case "dimmed":
        return {
          backgroundColor: "var(--surface-page)",
          borderColor: "var(--border)",
          color: "var(--text-muted)",
          opacity: 0.6,
        };
      default:
        return {
          backgroundColor: "var(--surface-page)",
          borderColor: "var(--border)",
          color: "var(--text-body)",
        };
    }
  };

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const state = getOptionState(option.id);
        const styles = getOptionStyles(state);
        const isSelected = option.id === selectedId;
        const isCorrectAnswer = option.id === correctOptionId;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.id)}
            disabled={disabled || selectedId !== null}
            className={cn(
              "relative p-4 rounded-lg border-2 text-left transition-all",
              "hover:scale-[1.02] hover:shadow-md",
              "disabled:hover:scale-100 disabled:hover:shadow-none disabled:cursor-not-allowed",
              "focus:outline-none focus:ring-2 focus:ring-offset-1"
            )}
            style={{
              ...styles,
              borderStyle: state === "showCorrect" ? "dashed" : "solid",
            }}
            aria-label={`Option: ${option.text}`}
            aria-pressed={isSelected}
          >
            {/* Binding edge accent */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
              style={{
                backgroundColor:
                  state === "correct" || state === "showCorrect"
                    ? "var(--state-easy)"
                    : state === "incorrect"
                    ? "var(--state-hard)"
                    : "var(--accent-nav)",
                opacity: state === "dimmed" ? 0.3 : 1,
              }}
            />

            <div className="flex items-center justify-between pl-2">
              <span className="font-medium">{option.text}</span>

              {/* Result indicator */}
              {selectedId !== null && (
                <span className="flex-shrink-0 ml-2">
                  {(state === "correct" || state === "showCorrect") && (
                    <Check className="h-5 w-5" />
                  )}
                  {state === "incorrect" && <X className="h-5 w-5" />}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
