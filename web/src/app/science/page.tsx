"use client";

import { ArrowLeft, Brain, Sparkles, Clock, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { InfoButton } from "@/components/brand";
import {
  NotebookCard,
  NotebookCardContent,
  NotebookCardTitle,
} from "@/components/ui/notebook-card";
import type { LucideIcon } from "lucide-react";

/**
 * Section data structure
 */
interface ScienceSection {
  icon: LucideIcon;
  title: string;
  paragraphs: string[];
  stat: {
    value: string;
    label: string;
  };
}

const sections: ScienceSection[] = [
  {
    icon: Brain,
    title: "Your Brain Has a Forgetting Curve",
    paragraphs: [
      "Within days of learning something new, your memory begins to fade. This isn't a flaw—it's how your brain works. The psychologist Hermann Ebbinghaus discovered this \"forgetting curve\" over a century ago.",
      "The breakthrough? If you review at precisely the right moment—just as the memory starts to slip—you strengthen it dramatically. Each well-timed review makes the memory more durable, until it becomes nearly permanent.",
      "LLYLI predicts your personal forgetting curve and schedules reviews at the optimal moment. Not too early (wasted effort), not too late (forgotten). Just right.",
    ],
    stat: {
      value: "64% → 87%",
      label: "1-week retention after 3 well-timed reviews",
    },
  },
  {
    icon: Sparkles,
    title: "Modern Algorithms, Not 1980s Math",
    paragraphs: [
      "Most language apps still use scheduling algorithms from 1987. LLYLI uses FSRS (Free Spaced Repetition Scheduler)—a modern system built on machine learning research from 2023.",
      "FSRS tracks three things for every phrase you learn:",
    ],
    stat: {
      value: "36 years newer",
      label: "than the algorithm in most apps",
    },
  },
  {
    icon: Clock,
    title: "Less Grinding, More Living",
    paragraphs: [
      "Here's an uncomfortable truth: research shows only 36% of people stick with traditional flashcard apps. Why? Because they feel like homework. Endless reviews. No finish line. No sense of progress.",
      "LLYLI is designed differently:",
    ],
    stat: {
      value: "+11%",
      label: "retention boost from immediate feedback",
    },
  },
  {
    icon: MapPin,
    title: "Your Phrases, Your Memory",
    paragraphs: [
      "Generic vocabulary lists teach you words you might never use. LLYLI flips this: you capture phrases from your actual life—conversations, signs, messages, menus.",
      "This isn't just more motivating. It's scientifically more effective:",
    ],
    stat: {
      value: "r = 0.5",
      label: "correlation between novelty and learning efficiency",
    },
  },
];

/**
 * Bullet points for sections that need them
 */
const fsrsBullets = [
  { label: "Difficulty", desc: "How challenging is this phrase for you personally?" },
  { label: "Stability", desc: "How strong is your memory right now?" },
  { label: "Retrievability", desc: "What's the probability you'll remember it today?" },
];

const designBullets = [
  { label: "Short sessions", desc: "10-15 minutes is ideal. Your brain learns better in focused bursts." },
  { label: "Clear daily goals", desc: "A satisfying \"Done for today\" screen, not an infinite queue." },
  { label: "The 10-word rule", desc: "We limit new material to prevent cognitive overload." },
  { label: "Instant feedback", desc: "Know immediately if you're right." },
];

const memoryBullets = [
  { label: "Context-dependent memory", desc: "You remember things better when connected to real experiences." },
  { label: "Personal relevance", desc: "Your brain prioritizes information that matters to you." },
  { label: "Native audio", desc: "Every phrase comes with authentic pronunciation, training your ear alongside your vocabulary." },
];

/**
 * Science Page - The Science Behind LLYLI
 *
 * A beautifully crafted page explaining why LLYLI is effective
 * for language learning, using research-backed information
 * presented in the Moleskine notebook design style.
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
            className="mt-3 text-sm leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            LLYLI uses research-backed algorithms to help you remember what
            matters—permanently.
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
              <NotebookCardTitle className="text-[20px]">
                {sections[0].title}
              </NotebookCardTitle>
            </div>

            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
              {sections[0].paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
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
                {sections[0].stat.value}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {sections[0].stat.label}
              </p>
            </div>
          </NotebookCardContent>
        </NotebookCard>

        {/* Section 2: Modern Algorithms */}
        <NotebookCard className="mb-6" withBinding={true}>
          <NotebookCardContent>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-nav-light)" }}
              >
                <Sparkles className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
              </div>
              <NotebookCardTitle className="text-[20px]">
                {sections[1].title}
              </NotebookCardTitle>
            </div>

            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
              {sections[1].paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* FSRS Bullets */}
            <ul className="mt-4 space-y-2">
              {fsrsBullets.map((bullet, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-body)" }}>
                  <span style={{ color: "var(--accent-nav)" }}>•</span>
                  <span>
                    <strong style={{ color: "var(--text-heading)" }}>{bullet.label}</strong> — {bullet.desc}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
              These aren't guesses. They're calculated using a mathematical model of how human memory
              actually works, refined by analyzing millions of real learning sessions.
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
                {sections[1].stat.value}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {sections[1].stat.label}
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
              <NotebookCardTitle className="text-[20px]">
                {sections[2].title}
              </NotebookCardTitle>
            </div>

            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
              {sections[2].paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Design Bullets */}
            <ul className="mt-4 space-y-2">
              {designBullets.map((bullet, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-body)" }}>
                  <span style={{ color: "var(--accent-nav)" }}>•</span>
                  <span>
                    <strong style={{ color: "var(--text-heading)" }}>{bullet.label}</strong> — {bullet.desc}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
              The goal isn't to trap you in the app. It's to get you out into the world, using your new language.
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
                {sections[2].stat.value}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {sections[2].stat.label}
              </p>
            </div>
          </NotebookCardContent>
        </NotebookCard>

        {/* Section 4: Your Phrases */}
        <NotebookCard className="mb-6" withBinding={true}>
          <NotebookCardContent>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "var(--accent-nav-light)" }}
              >
                <MapPin className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />
              </div>
              <NotebookCardTitle className="text-[20px]">
                {sections[3].title}
              </NotebookCardTitle>
            </div>

            <div className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
              {sections[3].paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Memory Bullets */}
            <ul className="mt-4 space-y-2">
              {memoryBullets.map((bullet, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-body)" }}>
                  <span style={{ color: "var(--accent-nav)" }}>•</span>
                  <span>
                    <strong style={{ color: "var(--text-heading)" }}>{bullet.label}</strong> — {bullet.desc}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
              Dynamic sentence generation keeps reviews fresh, because novelty helps memory.
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
                {sections[3].stat.value}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {sections[3].stat.label}
              </p>
            </div>
          </NotebookCardContent>
        </NotebookCard>

        {/* Footer */}
        <div
          className="pt-6 mt-8"
          style={{ borderTop: "1px dashed var(--notebook-stitch)" }}
        >
          <p
            className="text-xs text-center leading-relaxed"
            style={{ color: "var(--text-muted)" }}
          >
            Built on open research. LLYLI uses the FSRS algorithm developed by
            the Open Spaced Repetition project—peer-reviewed and continuously
            improved by researchers worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
