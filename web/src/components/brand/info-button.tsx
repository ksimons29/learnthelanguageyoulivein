"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Brain, Volume2, LogOut, FlaskConical, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { FeedbackSheet } from "@/components/feedback";

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
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(false);
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsOpen(true);
    props.onClick?.(e);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      setIsOpen(false);
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleScienceClick = () => {
    setIsOpen(false);
    router.push("/science");
  };

  const handleFeedbackClick = () => {
    setIsOpen(false);
    setIsFeedbackOpen(true);
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

          {/* Feature list - using grid for guaranteed alignment */}
          <div className="grid gap-4 mb-6 max-w-sm mx-auto">
            {[
              { icon: BookOpen, color: "var(--accent-nav)", title: "Capture Phrases", desc: "From conversations, signs, and messages" },
              { icon: Volume2, color: "var(--accent-ribbon)", title: "Native Audio", desc: "Hear how native speakers pronounce each phrase" },
              { icon: Brain, color: "var(--accent-nav)", title: "Smart Reviews", desc: "FSRS algorithm schedules reviews optimally" },
              { icon: Sparkles, color: "var(--state-good)", title: "Real Context", desc: "Learn from your actual daily life" },
            ].map((item, i) => (
              <div key={i} className="grid grid-cols-[36px_1fr] gap-3 items-center">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "var(--surface-page-aged)" }}
                >
                  <item.icon className="h-4 w-4" style={{ color: item.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-heading)" }}>
                    {item.title}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* The Science Button */}
          <button
            onClick={handleScienceClick}
            className="w-full py-3 mb-2 rounded-lg flex items-center justify-center gap-2 transition-colors hover:opacity-90"
            style={{
              backgroundColor: "var(--surface-page-aged)",
              color: "var(--accent-nav)",
            }}
          >
            <FlaskConical className="h-4 w-4" />
            <span className="text-sm font-medium">The Science Behind LLYLI</span>
          </button>

          {/* Give Feedback Button */}
          <button
            onClick={handleFeedbackClick}
            className="w-full py-3 mb-2 rounded-lg flex items-center justify-center gap-2 transition-colors hover:opacity-90"
            style={{
              backgroundColor: "var(--surface-page-aged)",
              color: "var(--accent-nav)",
            }}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm font-medium">Give Feedback</span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full py-3 mb-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
            style={{
              backgroundColor: "var(--surface-page-aged)",
              color: "var(--text-muted)",
            }}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </span>
          </button>

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

      {/* Feedback Sheet */}
      <FeedbackSheet open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen} />
    </>
  );
}

export { InfoButton };
