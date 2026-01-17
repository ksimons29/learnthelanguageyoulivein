"use client";

import * as React from "react";
import Image from "next/image";
import { BookOpen, Sparkles, Brain, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

interface InfoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

/**
 * Info Button Component
 *
 * A Moleskine-styled info trigger that opens a sheet with app information.
 * Uses a small notebook icon aesthetic, not a generic info icon.
 *
 * Design principles:
 * - Trigger: Subtle, crafted feel (small logo or notebook icon)
 * - Sheet: Full brand experience with logo, features, footer
 * - Fits the Moleskine aesthetic throughout
 */
function InfoButton({ className, ...props }: InfoButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(true);
    props.onClick?.(e);
  };

  return (
    <>
      {/* Trigger button - small LLYLI logo with notebook styling */}
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "relative w-10 h-10 rounded-xl overflow-hidden",
          "transition-all duration-200",
          "hover:scale-105 hover:shadow-md",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Subtle shadow like a small notebook
          "shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
          className
        )}
        aria-label="About LLYLI"
        {...props}
      >
        <Image
          src="/images/llyli-icon.png"
          alt="LLYLI"
          width={40}
          height={40}
          className="object-contain"
          priority
        />
      </button>

      {/* Info Sheet - Full brand experience */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-6 pb-8"
          style={{ backgroundColor: "var(--surface-page)" }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-2 pb-4">
            <div
              className="h-1 w-12 rounded-full"
              style={{ backgroundColor: "var(--notebook-stitch)" }}
            />
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image
              src="/images/llyli-icon.png"
              alt="LLYLI"
              width={72}
              height={72}
              className="rounded-2xl shadow-lg"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2
              className="text-xl heading-serif mb-1"
              style={{ color: "var(--text-heading)" }}
            >
              Learn the Language You Live In
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Turn real-life phrases into lasting memories
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3 mb-6">
            <FeatureItem
              icon={<BookOpen className="h-4 w-4" style={{ color: "var(--accent-nav)" }} />}
              title="Capture Phrases"
              description="From conversations, signs, and messages"
            />
            <FeatureItem
              icon={<Volume2 className="h-4 w-4" style={{ color: "var(--accent-ribbon)" }} />}
              title="Native Audio"
              description="Hear how native speakers pronounce each phrase"
            />
            <FeatureItem
              icon={<Brain className="h-4 w-4" style={{ color: "var(--accent-nav)" }} />}
              title="Smart Reviews"
              description="FSRS algorithm schedules reviews optimally"
            />
            <FeatureItem
              icon={<Sparkles className="h-4 w-4" style={{ color: "var(--state-good)" }} />}
              title="Real Context"
              description="Learn from your actual daily life"
            />
          </div>

          {/* Footer */}
          <div
            className="pt-4"
            style={{ borderTop: "1px dashed var(--notebook-stitch)" }}
          >
            <p
              className="text-xs text-center"
              style={{ color: "var(--text-muted)" }}
            >
              Version 1.0 · Made with care in Lisbon
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * Feature item for the info sheet
 */
function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: "var(--surface-page-aged)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-heading)" }}
        >
          {title}
        </p>
        <p
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export { InfoButton };
