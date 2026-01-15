"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandWidget } from "@/components/brand";

// Mock data - will be replaced with real data
const mockSessionStats = {
  reviewed: 12,
  accuracy: 83,
  streak: 7,
  tomorrowDue: 8,
};

export default function ReviewCompletePage() {
  const router = useRouter();

  const handleDone = () => {
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-md min-h-screen bg-background px-4 py-6">
      {/* Header with brand widget */}
      <div className="flex justify-end mb-8">
        <BrandWidget size="sm" variant="ghost" tooltipText="About LLYLI" />
      </div>

      {/* Title */}
      <h1 className="mb-8 text-center text-3xl font-bold text-foreground">
        Session Complete
      </h1>

      {/* Stats Card */}
      <Card className="mb-6 border-border bg-white p-6">
        <div className="text-center mb-4">
          <p className="text-5xl font-bold text-primary">
            {mockSessionStats.reviewed}
          </p>
          <p className="text-muted-foreground">phrases reviewed</p>
        </div>

        <div className="h-px bg-border my-4" />

        <div className="flex items-center justify-around">
          <div className="text-center">
            <p className="text-xl font-semibold text-foreground">
              {mockSessionStats.accuracy}%
            </p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-xl font-semibold text-foreground">
                {mockSessionStats.streak} days
              </p>
              <Flame className="h-5 w-5 text-warning" fill="currentColor" />
            </div>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
        </div>
      </Card>

      {/* Tomorrow Preview */}
      <div className="mb-8 rounded-xl border-2 border-primary bg-[var(--llyli-teal-light)] p-4">
        <p className="text-sm text-muted-foreground">Tomorrow</p>
        <p className="text-lg font-semibold text-foreground">
          {mockSessionStats.tomorrowDue} phrases due
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href="/review"
          className="block text-center text-accent font-medium hover:text-accent/80 transition-colors"
        >
          Practice more
        </Link>

        <Button
          onClick={handleDone}
          className="w-full bg-primary py-6 text-lg font-semibold hover:bg-primary/90"
        >
          Done
        </Button>
      </div>
    </div>
  );
}
