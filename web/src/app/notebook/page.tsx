"use client";

import { useState } from "react";
import { SearchBar, InboxCard, CategoryCard } from "@/components/notebook";
import { BrandWidget } from "@/components/brand";

// Mock data - will be replaced with real data
const mockCategories = [
  { emoji: "🏢", name: "Work", totalPhrases: 24, dueCount: 8 },
  { emoji: "💬", name: "Social", totalPhrases: 15, dueCount: 3 },
  { emoji: "🛍️", name: "Shopping", totalPhrases: 9, dueCount: 2 },
  { emoji: "🏥", name: "Health", totalPhrases: 6, dueCount: 1 },
  { emoji: "🚗", name: "Transport", totalPhrases: 12, dueCount: 4 },
];

const mockInboxCount = 5;

export default function NotebookPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = mockCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Notebook</h1>
        <BrandWidget size="sm" variant="ghost" tooltipText="About LLYLI" />
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search phrases..."
        />
      </div>

      {/* Inbox - Featured */}
      <div className="mb-6">
        <InboxCard count={mockInboxCount} />
      </div>

      {/* Categories */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Categories
        </h2>
        <div className="space-y-3">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.name}
              emoji={category.emoji}
              name={category.name}
              totalPhrases={category.totalPhrases}
              dueCount={category.dueCount}
              href={`/notebook/${category.name.toLowerCase()}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
