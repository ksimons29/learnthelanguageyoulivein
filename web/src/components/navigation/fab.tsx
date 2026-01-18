"use client";

import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  const pathname = usePathname();

  // Hide FAB on certain pages (review session, capture page, onboarding, auth)
  const hideOnPaths = ["/review/session", "/capture", "/onboarding", "/auth"];
  if (hideOnPaths.some((path) => pathname.startsWith(path))) {
    return null;
  }

  return (
    <Link
      href="/capture"
      className={cn(
        "fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105 active:scale-95",
        className
      )}
      aria-label="Quick capture"
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </Link>
  );
}
