import {
  CaptureButton,
  ReviewDueButton,
  CapturedTodayList,
  TodaysProgress,
} from "@/components/home";
import { BrandWidget } from "@/components/brand";

// Mock data - will be replaced with real data from API/state
const mockCapturedPhrases = [
  {
    id: "1",
    phrase: "Como posso ajudar?",
    translation: "How can I help?",
  },
  {
    id: "2",
    phrase: "Vou verificar isso",
    translation: "I'll check that",
  },
];

const mockStats = {
  captured: 5,
  reviewed: 8,
  streak: 7,
  dueCount: 12,
};

export default function HomePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Today</h1>
        <BrandWidget size="sm" variant="ghost" tooltipText="About LLYLI" />
      </div>

      {/* Primary Actions */}
      <div className="space-y-3 mb-8">
        <CaptureButton />
        <ReviewDueButton dueCount={mockStats.dueCount} />
      </div>

      {/* Captured Today Section */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Captured Today
        </h2>
        <CapturedTodayList phrases={mockCapturedPhrases} />
      </section>

      {/* Today's Progress */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Today&apos;s Progress
        </h2>
        <TodaysProgress
          captured={mockStats.captured}
          reviewed={mockStats.reviewed}
          streak={mockStats.streak}
        />
      </section>
    </div>
  );
}
