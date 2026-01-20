"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedbackSheet } from "@/components/feedback";

/**
 * Floating Feedback Button
 *
 * A subtle coral ribbon-style button fixed to the left side of the screen.
 * Designed to be visible on all main pages without being intrusive.
 * Opens the FeedbackSheet when clicked.
 *
 * Design: Moleskine ribbon bookmark aesthetic
 * - Coral color (accent-ribbon)
 * - Rounded edges on the right
 * - Subtle shadow
 * - Expands slightly on hover
 */
export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide on full-screen experiences
  const hideOnPaths = ["/review/session", "/onboarding", "/auth"];
  if (hideOnPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed left-0 bottom-24 z-40",
          "flex items-center gap-2 pl-2 pr-3 py-2.5",
          "rounded-r-full",
          "text-white text-sm font-medium",
          "shadow-lg",
          "transition-all duration-200 ease-out",
          "hover:pl-3 hover:shadow-xl",
          "active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
        style={{
          backgroundColor: "var(--accent-ribbon)",
        }}
        aria-label="Give feedback"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      <FeedbackSheet open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
