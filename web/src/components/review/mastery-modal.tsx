"use client";

import { Button } from "@/components/ui/button";

interface MasteryModalProps {
  phrase: string;
  onContinue: () => void;
}

export function MasteryModal({ phrase, onContinue }: MasteryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-center text-2xl font-bold text-primary">
          Mastery Achieved
        </h2>

        <p className="mb-4 text-center text-xl font-medium text-foreground">
          {phrase}
        </p>

        <p className="mb-6 text-center text-muted-foreground">
          Three successful retrievals recorded. This phrase has reached optimal
          retention probability and is ready for active use.
        </p>

        <Button
          onClick={onContinue}
          className="w-full bg-primary py-6 text-lg font-semibold hover:bg-primary/90"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
