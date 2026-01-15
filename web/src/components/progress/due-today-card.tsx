"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DueTodayCardProps {
  count: number;
}

export function DueTodayCard({ count }: DueTodayCardProps) {
  return (
    <Card className="flex items-center justify-between border-border bg-white p-4">
      <div>
        <p className="text-3xl font-bold text-primary">{count}</p>
        <p className="text-sm text-muted-foreground">phrases ready</p>
      </div>
      <Link href="/review">
        <Button className="bg-primary hover:bg-primary/90">Practice Now</Button>
      </Link>
    </Card>
  );
}
