"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search phrases...",
}: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
        style={{ color: "var(--text-muted)" }}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg pl-10 pr-4 text-base outline-none transition-all focus:ring-2"
        style={{
          backgroundColor: "var(--surface-page)",
          border: "1px solid var(--notebook-stitch)",
          color: "var(--text-body)",
        }}
      />
    </div>
  );
}
