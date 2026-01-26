"use client";

import Link from "next/link";
import { GraduationCap, AlertTriangle } from "lucide-react";
import type { Word } from "@/lib/db/schema";

interface LearningProgressCardProps {
  learningWords: number;
  dueToday: number;
  needPractice: number;
  strugglingWordsList: Word[];
}

/**
 * LearningProgressCard Component
 *
 * Matches the "Learning Progress" section from the Anki dashboard.
 * Purple gradient header with learning stats and struggling words list.
 */
export function LearningProgressCard({
  learningWords,
  dueToday,
  needPractice,
  strugglingWordsList,
}: LearningProgressCardProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Purple gradient header */}
      <div
        className="px-5 py-4"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-white" />
          <h3 className="text-white font-semibold">Learning Progress</h3>
        </div>
      </div>

      {/* Stats section */}
      <div className="bg-white">
        {/* Currently Learning */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "#e2e8f0" }}
        >
          <span className="text-gray-700">Currently Learning</span>
          <span
            className="text-2xl font-bold"
            style={{ color: "#667eea" }}
          >
            {learningWords}
          </span>
        </div>

        {/* Due for Review */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "#e2e8f0" }}
        >
          <span className="text-gray-700">Due Today</span>
          <span
            className="text-2xl font-bold"
            style={{ color: "#667eea" }}
          >
            {dueToday}
          </span>
        </div>

        {/* Need Practice */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "#e2e8f0" }}
        >
          <span className="text-gray-700">Need Practice</span>
          <span
            className="text-2xl font-bold"
            style={{ color: "#e85c4a" }}
          >
            {needPractice}
          </span>
        </div>

        {/* Words to Review (with fails) */}
        {strugglingWordsList.length > 0 && (
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4" style={{ color: "#f59e0b" }} />
              <span className="text-sm font-medium text-gray-600">
                Words to Practice ({strugglingWordsList.length}+ fails)
              </span>
            </div>

            <div className="space-y-2">
              {strugglingWordsList.slice(0, 5).map((word) => (
                <div
                  key={word.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg"
                  style={{ backgroundColor: "#fef3c7" }}
                >
                  <span className="font-medium text-gray-800">
                    {word.originalText}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: "#d97706" }}
                  >
                    {word.lapseCount}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Button */}
        {dueToday > 0 && (
          <div className="px-5 py-4 border-t" style={{ borderColor: "#e2e8f0" }}>
            <Link
              href="/review"
              className="block w-full py-3 rounded-lg text-white font-semibold text-center transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              Start practice
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
