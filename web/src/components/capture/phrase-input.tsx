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
        "relative rounded-xl border-2 transition-colors",
        className
      )}
      style={{
        backgroundColor: "var(--surface-page)",
        borderColor: isFocused ? "var(--accent-nav)" : "var(--border)",
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-xl bg-transparent px-4 py-3 pr-24 text-base focus:outline-none"
        style={{
          color: "var(--text-body)",
        }}
      />
      <div className="absolute bottom-3 right-3 flex gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors hover:opacity-80"
          style={{
            borderColor: "var(--accent-ribbon)",
            color: "var(--accent-ribbon)",
          }}
          aria-label="Use camera"
        >
          <Camera className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors hover:opacity-80"
          style={{
            borderColor: "var(--accent-ribbon)",
            color: "var(--accent-ribbon)",
          }}
          aria-label="Voice input"
        >
          <Mic className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
