"use client";

import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface TodaysProgressProps {
  captured: number;
  reviewed: number;
  streak: number;
}

export function TodaysProgress({
  captured,
  reviewed,
  streak,
}: TodaysProgressProps) {
  return (
    <Card className="border-border bg-white p-4">
      <div className="flex items-center justify-around">
        <div className="text-center">
          <p className="text-2xl font-bold text-success">{captured}</p>
          <p className="text-xs text-muted-foreground">Captured</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{reviewed}</p>
          <p className="text-xs text-muted-foreground">Reviewed</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-2xl font-bold text-warning">{streak}</p>
            <Flame className="h-5 w-5 text-warning" fill="currentColor" />
          </div>
          <p className="text-xs text-muted-foreground">Streak</p>
        </div>
      </div>
    </Card>
  );
}
