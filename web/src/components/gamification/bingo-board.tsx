"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trophy } from "lucide-react";
import { useGamificationStore } from "@/lib/store/gamification-store";
import type { BingoSquareId } from "@/lib/db/schema";

/**
 * Bingo Board Component
 *
 * A 3x3 grid showing today's bingo challenge squares.
 * Follows Moleskine design system with notebook aesthetic.
 */

interface BingoBoardProps {
  /** Whether to show the full board or compact preview */
  variant?: "full" | "compact";
  /** Callback when board is clicked (for opening modal) */
  onExpand?: () => void;
}

// Square labels and icons for display
const SQUARE_LABELS: Record<BingoSquareId, { short: string; full: string }> = {
  review5: { short: "5", full: "Practice 5 words" },
  streak3: { short: "3x", full: "3 in a row" },
  fillBlank: { short: "Fill", full: "Fill in the blank" },
  multipleChoice: { short: "Pick", full: "Multiple choice" },
  addContext: { short: "📍", full: "Add memory context" },
  workWord: { short: "Work", full: "Work category" },
  socialWord: { short: "Social", full: "Social category" },
  masterWord: { short: "Master", full: "Master a word" },
  finishSession: { short: "Done", full: "Finish session" },
  bossRound: { short: "Boss", full: "Complete Boss Round" },
};

// Navigation actions for each square
const SQUARE_ACTIONS: Record<BingoSquareId, {
  type: 'navigate' | 'tooltip';
  route?: string;
  tooltip?: string;
}> = {
  review5: { type: 'navigate', route: '/review' },
  streak3: { type: 'tooltip', tooltip: 'Answer 3 questions correctly in a row' },
  fillBlank: { type: 'navigate', route: '/review' },
  multipleChoice: { type: 'navigate', route: '/review' },
  addContext: { type: 'navigate', route: '/capture' },
  workWord: { type: 'navigate', route: '/notebook?category=work' },
  socialWord: { type: 'navigate', route: '/notebook?category=social' },
  masterWord: { type: 'tooltip', tooltip: 'Master any word through practice' },
  finishSession: { type: 'navigate', route: '/review' },
  bossRound: { type: 'tooltip', tooltip: 'Complete a Boss Round challenge after daily goal' },
};

// Winning lines for bingo detection
const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];

export function BingoBoard({ variant = "full", onExpand }: BingoBoardProps) {
  const router = useRouter();
  const { bingo, showBingoCelebration, dismissBingoCelebration } = useGamificationStore();
  const [hoveredSquare, setHoveredSquare] = useState<BingoSquareId | null>(null);

  if (!bingo) {
    return null;
  }

  const squareOrder: BingoSquareId[] = [
    "review5", "streak3", "fillBlank",
    "multipleChoice", "addContext", "workWord",
    "socialWord", "masterWord", "finishSession",
  ];

  const completedSet = new Set(bingo.squaresCompleted as BingoSquareId[]);
  const completedIndices = squareOrder
    .map((id, idx) => (completedSet.has(id) ? idx : -1))
    .filter((idx) => idx !== -1);

  // Find winning line if bingo achieved
  const winningLine = WINNING_LINES.find((line) =>
    line.every((idx) => completedIndices.includes(idx))
  );

  if (variant === "compact") {
    return (
      <button
        onClick={onExpand}
        className="w-full rounded-r-xl rounded-l-sm p-4 relative transition-all hover:-translate-y-0.5 active:translate-y-0"
        style={{
          backgroundColor: "var(--surface-page)",
          boxShadow: "var(--shadow-page)",
        }}
      >
        {/* Binding edge */}
        <div
          className="absolute left-0 top-0 bottom-0 w-3 rounded-l-sm"
          style={{
            background: "linear-gradient(90deg, var(--surface-binding) 0%, var(--accent-nav) 40%, var(--surface-page) 40%, var(--surface-page) 100%)",
          }}
        />

        <div className="flex items-center gap-3">
          {/* Mini bingo grid preview */}
          <div className="grid grid-cols-3 gap-0.5 w-12 h-12">
            {squareOrder.map((id, idx) => (
              <div
                key={id}
                className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center ${
                  completedSet.has(id)
                    ? "bg-[var(--accent-nav)]"
                    : "bg-[var(--accent-nav-light)]"
                } ${winningLine?.includes(idx) ? "ring-1 ring-[var(--accent-ribbon)]" : ""}`}
              >
                {completedSet.has(id) && (
                  <Check className="h-2 w-2 text-white" />
                )}
              </div>
            ))}
          </div>

          {/* Text */}
          <div className="flex-1 text-left">
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-heading)" }}
            >
              {bingo.bingoAchieved ? "Bingo!" : "Daily Bingo"}
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              {completedSet.size}/9 completed
            </p>
          </div>

          {/* Trophy if bingo achieved */}
          {bingo.bingoAchieved && (
            <Trophy
              className="h-5 w-5"
              style={{ color: "var(--accent-ribbon)" }}
            />
          )}
        </div>
      </button>
    );
  }

  // Full variant
  return (
    <div
      className="rounded-r-xl rounded-l-sm p-6 relative"
      style={{
        backgroundColor: "var(--surface-page)",
        boxShadow: "var(--shadow-page)",
      }}
    >
      {/* Binding edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-4 rounded-l-sm"
        style={{
          background: "linear-gradient(90deg, var(--accent-nav) 0%, rgba(12, 107, 112, 0.7) 100%)",
        }}
      />
      <div
        className="absolute left-1.5 top-4 bottom-4 w-0.5"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, rgba(248,243,231,0.4) 6px, rgba(248,243,231,0.4) 10px)",
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-semibold heading-serif"
          style={{ color: "var(--text-heading)" }}
        >
          Daily Bingo
        </h3>
        <span
          className="text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          {completedSet.size}/9
        </span>
      </div>

      {/* Bingo Grid */}
      <div className="grid grid-cols-3 gap-2">
        {squareOrder.map((id, idx) => {
          const isCompleted = completedSet.has(id);
          const isWinningSquare = winningLine?.includes(idx);
          const labels = SQUARE_LABELS[id];
          const action = SQUARE_ACTIONS[id];
          const isNavigable = !isCompleted && action.type === 'navigate';
          const hasTooltip = !isCompleted && action.type === 'tooltip';
          const isHovered = hoveredSquare === id;

          const handleClick = () => {
            if (isCompleted) return;
            if (action.type === 'navigate' && action.route) {
              router.push(action.route);
            }
          };

          return (
            <div
              key={id}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all relative ${
                isCompleted
                  ? "bg-[var(--accent-nav)] text-white"
                  : "bg-[var(--accent-nav-light)]"
              } ${isWinningSquare ? "ring-2 ring-[var(--accent-ribbon)] ring-offset-2" : ""} ${
                isNavigable ? "cursor-pointer hover:scale-105 hover:shadow-md" : ""
              } ${hasTooltip ? "cursor-help" : ""}`}
              onClick={handleClick}
              onMouseEnter={() => hasTooltip && setHoveredSquare(id)}
              onMouseLeave={() => setHoveredSquare(null)}
            >
              {isCompleted ? (
                <Check className="h-6 w-6 mb-1" />
              ) : (
                <span
                  className="text-lg font-bold mb-1"
                  style={{ color: "var(--accent-nav)" }}
                >
                  {labels.short}
                </span>
              )}
              <span
                className={`text-[10px] text-center leading-tight ${
                  isCompleted ? "text-white/80" : ""
                }`}
                style={!isCompleted ? { color: "var(--text-muted)" } : undefined}
              >
                {labels.full.length > 20 ? labels.short : labels.full}
              </span>

              {/* Tooltip for non-navigable squares */}
              {hasTooltip && isHovered && action.tooltip && (
                <div
                  className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs whitespace-nowrap z-10"
                  style={{
                    backgroundColor: "var(--text-heading)",
                    color: "var(--surface-page)",
                  }}
                >
                  {action.tooltip}
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
                    style={{ backgroundColor: "var(--text-heading)" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bingo celebration */}
      {bingo.bingoAchieved && (
        <div
          className="mt-4 p-3 rounded-lg flex items-center gap-3"
          style={{ backgroundColor: "var(--accent-ribbon-light)" }}
        >
          <Trophy
            className="h-6 w-6 flex-shrink-0"
            style={{ color: "var(--accent-ribbon)" }}
          />
          <div className="flex-1">
            <p
              className="font-semibold"
              style={{ color: "var(--accent-ribbon)" }}
            >
              Bingo!
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              You completed a line today
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Bingo Board Modal
 *
 * Displays the full bingo board in a modal overlay.
 */
export function BingoBoardModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 max-w-sm w-full animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        <BingoBoard variant="full" />
      </div>
    </div>
  );
}
