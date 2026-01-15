"use client";

import { TrendingUp, AlertCircle, Target } from "lucide-react";
import {
  DueTodayCard,
  StrugglingCard,
  ContextReadinessCard,
} from "@/components/progress";
import { BrandWidget } from "@/components/brand";

// Mock data - will be replaced with real data
const mockDueCount = 12;

const mockStrugglingItems = [
  { id: "1", phrase: "Qual é o problema?", failCount: 4 },
  { id: "2", phrase: "Estou de acordo", failCount: 3 },
];

const mockContexts = [
  { emoji: "🏢", name: "Work", totalPhrases: 24, dueCount: 8 },
];

export default function ProgressPage() {
  return (
    <div className="min-h-screen notebook-bg relative">
      {/* Ribbon bookmark hanging from top */}
      <div className="ribbon-bookmark" />

      {/* Elastic band on right edge */}
      <div className="elastic-band fixed top-0 bottom-0 right-0 w-8 pointer-events-none z-30" />

      <div className="mx-auto max-w-md px-5 py-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="pt-2">
            <h1
              className="text-4xl heading-serif ink-text tracking-tight"
              style={{ color: "var(--text-heading)" }}
            >
              Progress
            </h1>
            <p
              className="text-sm mt-1 handwritten"
              style={{ color: "var(--text-muted)" }}
            >
              Track your learning journey
            </p>
          </div>
          {/* Brand widget - consistent with other pages */}
          <BrandWidget
            size="lg"
            variant="default"
            tooltipText="About LLYLI"
            className="shadow-lifted"
          />
        </div>

        {/* Due Today */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: "var(--accent-ribbon)" }}
            />
            <div className="flex items-center gap-2">
              <TrendingUp
                className="h-5 w-5"
                style={{ color: "var(--accent-ribbon)" }}
              />
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-heading)" }}
              >
                Due Today
              </h2>
            </div>
          </div>
          <div className="page-stack-3d">
            <DueTodayCard count={mockDueCount} />
          </div>
        </section>

        {/* Struggling */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: "var(--state-warning)" }}
            />
            <div className="flex items-center gap-2">
              <AlertCircle
                className="h-5 w-5"
                style={{ color: "var(--state-warning)" }}
              />
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-heading)" }}
              >
                Struggling
              </h2>
            </div>
          </div>
          <div className="space-y-3">
            {mockStrugglingItems.map((item) => (
              <div key={item.id} className="binding-edge-stitched">
                <StrugglingCard
                  phrase={item.phrase}
                  failCount={item.failCount}
                  onPractice={() => console.log("Practice", item.id)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Context Readiness */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: "var(--accent-nav)" }}
            />
            <div className="flex items-center gap-2">
              <Target
                className="h-5 w-5"
                style={{ color: "var(--accent-nav)" }}
              />
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-heading)" }}
              >
                Context Readiness
              </h2>
            </div>
          </div>
          <div className="space-y-3">
            {mockContexts.map((context) => (
              <div key={context.name} className="binding-edge-stitched">
                <ContextReadinessCard
                  emoji={context.emoji}
                  name={context.name}
                  totalPhrases={context.totalPhrases}
                  dueCount={context.dueCount}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
