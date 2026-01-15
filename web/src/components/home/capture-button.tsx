"use client";

import Link from "next/link";
import { PenLine } from "lucide-react";

export function CaptureButton() {
  return (
    <Link
      href="/capture"
      className="group relative flex w-full items-center gap-4 rounded-r-xl rounded-l-none py-5 px-6 text-lg font-semibold text-white transition-all hover:-translate-y-1 active:translate-y-0"
      style={{
        backgroundColor: "var(--accent-ribbon)",
        boxShadow: "0 4px 12px rgba(232, 92, 74, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--accent-ribbon-hover)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(232, 92, 74, 0.4), 0 4px 8px rgba(0, 0, 0, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--accent-ribbon)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(232, 92, 74, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)";
      }}
    >
      {/* Binding edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-5 rounded-l-sm"
        style={{
          background: "linear-gradient(90deg, #C04A3C 0%, #D94E3E 100%)",
        }}
      />
      {/* Stitching on binding */}
      <div
        className="absolute left-2 top-3 bottom-3 w-0.5"
        style={{
          backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 10px)",
        }}
      />

      {/* Icon container styled like a stamp/seal */}
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
        <PenLine className="h-6 w-6" strokeWidth={2} />
      </div>

      <div className="relative z-10">
        <span className="text-xl tracking-wide">Capture a Phrase</span>
        <p className="text-sm text-white/80 font-normal">Write it down, remember forever</p>
      </div>
    </Link>
  );
}
