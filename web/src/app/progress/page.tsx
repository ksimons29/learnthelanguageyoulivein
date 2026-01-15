"use client";

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
    <div className="mx-auto max-w-md px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Progress</h1>
        <BrandWidget size="sm" variant="ghost" tooltipText="About LLYLI" />
      </div>

      {/* Due Today */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Due Today</h2>
        <DueTodayCard count={mockDueCount} />
      </section>

      {/* Struggling */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Struggling
        </h2>
        <div className="space-y-3">
          {mockStrugglingItems.map((item) => (
            <StrugglingCard
              key={item.id}
              phrase={item.phrase}
              failCount={item.failCount}
              onPractice={() => console.log("Practice", item.id)}
            />
          ))}
        </div>
      </section>

      {/* Context Readiness */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Context Readiness
        </h2>
        <div className="space-y-3">
          {mockContexts.map((context) => (
            <ContextReadinessCard
              key={context.name}
              emoji={context.emoji}
              name={context.name}
              totalPhrases={context.totalPhrases}
              dueCount={context.dueCount}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
