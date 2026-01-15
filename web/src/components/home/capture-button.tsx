"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export function CaptureButton() {
  return (
    <Link
      href="/capture"
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-4 text-lg font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent/90 hover:shadow-md active:scale-[0.98]"
    >
      <Plus className="h-5 w-5" strokeWidth={2.5} />
      Capture
    </Link>
  );
}
