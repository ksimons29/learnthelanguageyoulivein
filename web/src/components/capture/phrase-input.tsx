"use client";

import { useState } from "react";
import { Camera, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhraseInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function PhraseInput({
  value,
  onChange,
  placeholder = "Type or paste a phrase...",
  className,
}: PhraseInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 bg-white transition-colors",
        isFocused ? "border-primary" : "border-border",
        className
      )}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-xl bg-transparent px-4 py-3 pr-24 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="absolute bottom-3 right-3 flex gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Use camera"
        >
          <Camera className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Voice input"
        >
          <Mic className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
