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
              Today
            </h1>
            <p
              className="text-sm mt-1 handwritten"
              style={{ color: "var(--text-muted)" }}
            >
              Your language journey
            </p>
          </div>
          {/* Bigger brand widget */}
          <BrandWidget
            size="lg"
            variant="default"
            tooltipText="About LLYLI"
            className="shadow-lifted"
          />
        </div>

        {/* Primary Actions - styled as notebook pages */}
        <div className="space-y-4 mb-10">
          <div className="page-stack-3d">
            <CaptureButton />
          </div>
          <div className="page-stack-3d">
            <ReviewDueButton dueCount={mockStats.dueCount} />
          </div>
        </div>

        {/* Captured Today Section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: "var(--accent-nav)" }}
            />
            <h2
              className="text-xl font-semibold heading-serif ink-text"
              style={{ color: "var(--text-heading)" }}
            >
              Captured Today
            </h2>
          </div>
          <div className="binding-edge-stitched">
            <CapturedTodayList phrases={mockCapturedPhrases} />
          </div>
        </section>

        {/* Today's Progress */}
        <section className="pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: "var(--accent-nav)" }}
            />
            <h2
              className="text-xl font-semibold heading-serif ink-text"
              style={{ color: "var(--text-heading)" }}
            >
              Today&apos;s Progress
            </h2>
          </div>
          <div className="page-stack-3d page-curl">
            <TodaysProgress
              captured={mockStats.captured}
              reviewed={mockStats.reviewed}
              streak={mockStats.streak}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
