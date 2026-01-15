"use client";

import { useState } from "react";
import { SearchBar, InboxCard, CategoryCard } from "@/components/notebook";
import { BrandWidget } from "@/components/brand";
import { Briefcase, MessageCircle, ShoppingBag, Heart, Car, type LucideIcon } from "lucide-react";

// Mock data - will be replaced with real data
// Now using Lucide icons instead of emojis for Moleskine aesthetic
const mockCategories: Array<{
  icon: LucideIcon;
  name: string;
  totalPhrases: number;
  dueCount: number;
}> = [
  { icon: Briefcase, name: "Work", totalPhrases: 24, dueCount: 8 },
  { icon: MessageCircle, name: "Social", totalPhrases: 15, dueCount: 3 },
  { icon: ShoppingBag, name: "Shopping", totalPhrases: 9, dueCount: 2 },
  { icon: Heart, name: "Health", totalPhrases: 6, dueCount: 1 },
  { icon: Car, name: "Transport", totalPhrases: 12, dueCount: 4 },
];

const mockInboxCount = 5;

export default function NotebookPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = mockCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen notebook-bg relative">
      {/* Ribbon bookmark */}
      <div className="ribbon-bookmark" />

      {/* Elastic band */}
      <div className="elastic-band fixed top-0 bottom-0 right-0 w-8 pointer-events-none z-30" />

      <div className="mx-auto max-w-md px-5 py-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="pt-2">
            <h1
              className="text-4xl heading-serif ink-text tracking-tight"
              style={{ color: "var(--text-heading)" }}
            >
              Notebook
            </h1>
            <p
              className="text-sm mt-1 handwritten"
              style={{ color: "var(--text-muted)" }}
            >
              Your phrase collection
            </p>
          </div>
          <BrandWidget
            size="lg"
            variant="default"
            tooltipText="About LLYLI"
            className="shadow-lifted"
          />
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search phrases..."
          />
        </div>

        {/* Inbox - Featured */}
        <div className="mb-8 page-stack-3d">
          <InboxCard count={mockInboxCount} />
        </div>

        {/* Categories */}
        <section className="pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-1 h-6 rounded-full"
              style={{ backgroundColor: "var(--accent-nav)" }}
            />
            <h2
              className="text-xl font-semibold heading-serif ink-text"
              style={{ color: "var(--text-heading)" }}
            >
              Categories
            </h2>
          </div>
          <div className="space-y-3">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.name}
                icon={category.icon}
                name={category.name}
                totalPhrases={category.totalPhrases}
                dueCount={category.dueCount}
                href={`/notebook/${category.name.toLowerCase()}`}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
