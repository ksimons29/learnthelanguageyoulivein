"use client";

import { ArrowLeft, Brain, Sparkles, Clock, Layers, MapPin, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { InfoButton } from "@/components/brand";
import {
  NotebookCard,
  NotebookCardContent,
  NotebookCardTitle,
} from "@/components/ui/notebook-card";

/**
 * Science Page - The Science Behind LLYLI
 *
 * Crisp, research-backed explanations of why LLYLI works.
 * Moleskine notebook design throughout.
 */
export default function SciencePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen notebook-bg relative">
      {/* Coral ribbon at top */}
      <div className="ribbon-bookmark" />

      <div className="mx-auto max-w-md px-4 py-5 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--accent-nav)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <InfoButton />
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <h1
            className="heading-serif text-[30px] leading-tight"
            style={{ color: "var(--text-heading)" }}
          >
            Memory Science,
            <br />
            Not Guesswork
          </h1>
          <p
            className="mt-3 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Research-backed algorithms that make language stick.
          </p>
        </div>

        {/* Section 1: Forgetting Curve */}
        <NotebookCard className="mb-6" withBinding={true}>
          <NotebookCardContent>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-nav-light)" }}
              >
                <Brain className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
              </div>
              <NotebookCardTitle className="text-[18px]">
                The Forgetting Curve
              </NotebookCardTitle>
            </div>

            <p className="text-sm mb-3" style={{ color: "var(--text-body)" }}>
              Your memory fades predictably. Ebbinghaus proved it in 1885.
            </p>
            <p className="text-sm" style={{ color: "var(--text-body)" }}>
              Review just as you start to forget, and memory strengthens. LLYLI times this precisely.
            </p>

            {/* Stat Callout */}
            <div
              className="mt-5 p-4 rounded-lg text-center"
              style={{ backgroundColor: "var(--accent-nav-light)" }}
            >
              <p
                className="text-2xl font-bold heading-serif"
                style={{ color: "var(--accent-nav)" }}
              >
                64% → 87%
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                retention after 3 well-timed reviews
              </p>
            </div>
          </NotebookCardContent>
        </NotebookCard>

        {/* Section 2: Modern Algorithm */}
        <NotebookCard className="mb-6" withBinding={true}>
          <NotebookCardContent>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-nav-light)" }}
              >
                <Sparkles className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
              </div>
              <NotebookCardTitle className="text-[18px]">
                FSRS Algorithm
              </NotebookCardTitle>
            </div>

            <p className="text-sm mb-3" style={{ color: "var(--text-body)" }}>
              Most apps use 1987 math. LLYLI uses FSRS, built on 2023 ML research.
            </p>

            <ul className="space-y-1.5">
              {[
                { label: "Difficulty", desc: "How hard is this for you?" },
                { label: "Stability", desc: "How strong is your memory?" },
                { label: "Retrievability", desc: "Can you recall it today?" },
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-body)" }}>
                  <span style={{ color: "var(--accent-nav)" }}>•</span>
                  <span>
                    <strong style={{ color: "var(--text-heading)" }}>{item.label}:</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>

            {/* Stat Callout */}
            <div
              className="mt-5 p-4 rounded-lg text-center"
              style={{ backgroundColor: "var(--accent-nav-light)" }}
            >
              <p
                className="text-2xl font-bold heading-serif"
                style={{ color: "var(--accent-nav)" }}
              >
                36 years newer
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                than the algorithm in most apps
              </p>
            </div>
          </NotebookCardContent>
        </NotebookCard>

        {/* Section 3: Less Grinding */}
        <NotebookCard className="mb-6" withBinding={true}>
          <NotebookCardContent>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-nav-light)" }}
              >
                <Clock className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
              </div>
              <NotebookCardTitle className="text-[18px]">
                Less Grinding
              </NotebookCardTitle>
            </div>

            <p className="text-sm mb-3" style={{ color: "var(--text-body)" }}>
              Only 36% stick with traditional flashcard apps. We&apos;re built differently:
            </p>

            <ul className="space-y-1.5">
              {[
                { label: "Short sessions", desc: "10-15 min optimal" },
                { label: "Clear finish line", desc: "Done for today, not endless" },
                { label: "10-word limit", desc: "Prevents overload" },
                { label: "Instant feedback", desc: "Know immediately" },
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-body)" }}>
                  <span style={{ color: "var(--accent-nav)" }}>•</span>
                  <span>
                    <strong style={{ color: "var(--text-heading)" }}>{item.label}:</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>

            {/* Stat Callout */}
            <div
              className="mt-5 p-4 rounded-lg text-center"
              style={{ backgroundColor: "var(--accent-nav-light)" }}
            >
              <p
                className="text-2xl font-bold heading-serif"
                style={{ color: "var(--accent-nav)" }}
              >
                +11%
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                retention from immediate feedback
              </p>
            </div>
          </NotebookCardContent>
        </NotebookCard>

        {/* Section 4: Words That Connect */}
        <NotebookCard className="mb-6" withBinding={true}>
          <NotebookCardContent>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-nav-light)" }}
              >
                <Layers className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
              </div>
              <NotebookCardTitle className="text-[18px]">
                Words That Connect
              </NotebookCardTitle>
            </div>

            <p className="text-sm mb-3" style={{ color: "var(--text-body)" }}>
              Most apps show one word at a time. We combine 2-4 of your words in fresh sentences that match YOUR context.
            </p>

            {/* Adaptive Context Examples */}
            <div className="space-y-2 mb-4">
              {[
                { words: "reunião, cliente", context: "Work tone" },
                { words: "cerveja, amigos", context: "Social tone" },
                { words: "médico, receita", context: "Neutral tone" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs p-2 rounded"
                  style={{ backgroundColor: "var(--surface-page)" }}
                >
                  <span style={{ color: "var(--text-body)" }}>{item.words}</span>
                  <span
                    className="font-medium"
                    style={{ color: "var(--accent-nav)" }}
                  >
                    → {item.context}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-sm" style={{ color: "var(--text-body)" }}>
              Your vocabulary tells us the situation. Work words get professional sentences. Social words get casual ones.
            </p>

            {/* Research Note */}
            <div
              className="mt-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--surface-page)",
                borderLeft: "3px solid var(--accent-nav)",
              }}
            >
              <p style={{ color: "var(--text-body)" }}>
                <strong style={{ color: "var(--text-heading)" }}>Adaptive Context:</strong>{" "}
                Sentences are locally grounded with references you&apos;ll actually recognize—Continente in Portugal, ICA in Sweden.
              </p>
            </div>

            {/* Stat Callout */}
            <div
              className="mt-5 p-4 rounded-lg text-center"
              style={{ backgroundColor: "var(--accent-nav-light)" }}
            >
              <p
                className="text-2xl font-bold heading-serif"
                style={{ color: "var(--accent-nav)" }}
              >
                4-6× faster
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                acquisition from varied contexts
              </p>
            </div>
          </NotebookCardContent>
        </NotebookCard>

        {/* Section 5: Your Phrases */}
        <NotebookCard className="mb-6" withBinding={true}>
          <NotebookCardContent>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-nav-light)" }}
              >
                <MapPin className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
              </div>
              <NotebookCardTitle className="text-[18px]">
                Your Life, Your Words
              </NotebookCardTitle>
            </div>

            <p className="text-sm mb-3" style={{ color: "var(--text-body)" }}>
              Capture phrases from your actual life, not generic vocab lists.
            </p>

            <ul className="space-y-1.5">
              {[
                { label: "Context memory", desc: "Real experiences stick" },
                { label: "Personal relevance", desc: "Brain prioritizes what matters" },
                { label: "Native audio", desc: "Authentic pronunciation" },
                { label: "Retrieval anchors", desc: "WHERE and WHEN you learned it" },
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-body)" }}>
                  <span style={{ color: "var(--accent-nav)" }}>•</span>
                  <span>
                    <strong style={{ color: "var(--text-heading)" }}>{item.label}:</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>

            {/* Research Note */}
            <div
              className="mt-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--surface-page)",
                borderLeft: "3px solid var(--accent-nav)",
              }}
            >
              <p style={{ color: "var(--text-body)" }}>
                <strong style={{ color: "var(--text-heading)" }}>Encoding Specificity:</strong>{" "}
                Memory retrieval improves when recall context matches learning context.
                Adding where and when you learned a phrase creates retrieval cues that strengthen recall.
              </p>
            </div>

            {/* Stat Callout */}
            <div
              className="mt-5 p-4 rounded-lg text-center"
              style={{ backgroundColor: "var(--accent-nav-light)" }}
            >
              <p
                className="text-2xl font-bold heading-serif"
                style={{ color: "var(--accent-nav)" }}
              >
                r = 0.5
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                novelty-learning correlation
              </p>
            </div>
          </NotebookCardContent>
        </NotebookCard>

        {/* Section 6: Mastery System */}
        <NotebookCard className="mb-6" withBinding={true} id="mastery">
          <NotebookCardContent>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-nav-light)" }}
              >
                <Trophy className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
              </div>
              <NotebookCardTitle className="text-[18px]">
                Mastery Progress
              </NotebookCardTitle>
            </div>

            <p className="text-sm mb-3" style={{ color: "var(--text-body)" }}>
              Each phrase needs <strong style={{ color: "var(--text-heading)" }}>3 consecutive correct sessions</strong> to be considered mastered.
            </p>

            <ul className="space-y-1.5">
              {[
                { label: "1/3", desc: "First correct answer — good start!" },
                { label: "2/3", desc: "Second correct — building confidence" },
                { label: "3/3", desc: "Mastered! — Ready to use in real life" },
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-body)" }}>
                  <span
                    className="font-medium min-w-[32px]"
                    style={{ color: "var(--accent-nav)" }}
                  >
                    {item.label}
                  </span>
                  <span>{item.desc}</span>
                </li>
              ))}
            </ul>

            {/* What happens after */}
            <div
              className="mt-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--surface-page)",
                borderLeft: "3px solid var(--state-easy)",
              }}
            >
              <p style={{ color: "var(--text-body)" }}>
                <strong style={{ color: "var(--text-heading)" }}>After Mastery:</strong>{" "}
                Mastered phrases appear less often, with longer intervals between reviews.
                If you get one wrong, the counter resets and FSRS schedules more practice.
              </p>
            </div>

            {/* Stat Callout */}
            <div
              className="mt-5 p-4 rounded-lg text-center"
              style={{ backgroundColor: "var(--state-easy)", opacity: 0.9 }}
            >
              <p
                className="text-2xl font-bold heading-serif"
                style={{ color: "white" }}
              >
                3 sessions
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.9)" }}>
                to confidently use a phrase
              </p>
            </div>
          </NotebookCardContent>
        </NotebookCard>

        {/* Footer */}
        <div
          className="pt-6 mt-4"
          style={{ borderTop: "1px dashed var(--notebook-stitch)" }}
        >
          <p
            className="text-xs text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Built on FSRS by Open Spaced Repetition. Peer-reviewed, open source.
          </p>
        </div>
      </div>
    </div>
  );
}
