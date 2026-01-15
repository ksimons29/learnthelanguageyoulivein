"use client";

import Link from "next/link";
import { Inbox, ChevronRight, Sparkles } from "lucide-react";

interface InboxCardProps {
  count: number;
}

export function InboxCard({ count }: InboxCardProps) {
  return (
    <Link href="/notebook/inbox">
      <div
        className="group relative flex items-center gap-4 p-5 ml-5 rounded-r-xl rounded-l-none transition-all duration-200 hover:-translate-y-1"
        style={{
          backgroundColor: "#FFFEF9",
          boxShadow: "0 3px 12px rgba(12, 107, 112, 0.15), 0 2px 4px rgba(0, 0, 0, 0.06)",
          border: "2px solid var(--accent-nav)",
        }}
      >
        {/* Binding edge - solid teal for inbox to make it stand out */}
        <div
          className="absolute left-0 top-0 bottom-0 -ml-5 w-5 rounded-l-sm"
          style={{
            background: "linear-gradient(90deg, #085458 0%, #0C6B70 100%)",
          }}
        />
        {/* Stitching */}
        <div
          className="absolute -ml-3 top-3 bottom-3 w-0.5"
          style={{
            backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, rgba(248,243,231,0.7) 6px, rgba(248,243,231,0.7) 12px)",
          }}
        />

        {/* Icon container with highlight */}
        <div
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl"
          style={{
            backgroundColor: "var(--accent-nav)",
            boxShadow: "0 4px 8px rgba(12, 107, 112, 0.3)",
          }}
        >
          <Inbox className="h-7 w-7 text-white" strokeWidth={1.5} />
          {/* Sparkle indicator for new items */}
          {count > 0 && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#E85C4A]">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1">
          <h3
            className="font-semibold text-xl"
            style={{ color: "var(--text-heading)" }}
          >
            Inbox
          </h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            New & untagged phrases
          </p>
          <p
            className="text-xs mt-1 font-medium"
            style={{ color: "var(--accent-nav)" }}
          >
            Tap to organize
          </p>
        </div>

        {/* Count badge */}
        <div
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-white text-xl font-bold"
          style={{
            backgroundColor: "var(--accent-nav)",
            boxShadow: "0 3px 8px rgba(12, 107, 112, 0.4)",
          }}
        >
          {count}
        </div>

        {/* Chevron */}
        <ChevronRight
          className="h-6 w-6 relative z-10 transition-transform group-hover:translate-x-1"
          style={{ color: "var(--accent-nav)" }}
        />
      </div>
    </Link>
  );
}
