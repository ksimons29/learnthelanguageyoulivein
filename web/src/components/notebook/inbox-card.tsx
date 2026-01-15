"use client";

import Link from "next/link";
import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InboxCardProps {
  count: number;
}

export function InboxCard({ count }: InboxCardProps) {
  return (
    <Link href="/notebook/inbox">
      <Card className="flex items-center justify-between border-2 border-primary bg-[var(--llyli-teal-light)] p-4 transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Inbox className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Inbox</h3>
            <p className="text-sm text-muted-foreground">
              New & untagged phrases
            </p>
            <p className="text-xs text-primary">Tap to organize →</p>
          </div>
        </div>
        <Badge className="bg-primary text-primary-foreground hover:bg-primary">
          {count}
        </Badge>
      </Card>
    </Link>
  );
}
