"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhraseInput } from "@/components/capture";
import { InfoButton } from "@/components/brand";
import {
  PenLine,
  X,
  ChevronDown,
  MapPin,
  User,
  Heart,
  Users,
  Briefcase,
  ShoppingBag,
  UtensilsCrossed,
  TreePine,
  Frown,
  Trophy,
} from "lucide-react";

// Map icon names to components for situation tags
const SITUATION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Heart,
  Users,
  Briefcase,
  ShoppingBag,
  UtensilsCrossed,
  TreePine,
  Frown,
  Trophy,
};
import { useWordsStore, useUIStore, useGamificationStore } from "@/lib/store";
import {
  SITUATION_TAGS,
  type SituationTagId,
  type MemoryContext,
} from "@/lib/config/memory-context";

export default function CapturePage() {
  const router = useRouter();
  const [phrase, setPhrase] = useState("");
  const [showContextFields, setShowContextFields] = useState(false);
  const [locationHint, setLocationHint] = useState("");
  const [selectedTags, setSelectedTags] = useState<SituationTagId[]>([]);
  const [personalNote, setPersonalNote] = useState("");
  const { captureWord, isLoading } = useWordsStore();
  const { showToast } = useUIStore();
  const { emitWordCapturedWithContext } = useGamificationStore();

  const handleTagToggle = (tagId: SituationTagId) => {
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      }
      // Max 3 tags
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, tagId];
    });
  };

  const handleSave = async () => {
    if (!phrase.trim()) return;

    try {
      // Build memory context (only include non-empty fields)
      const memoryContext: MemoryContext = {};
      if (locationHint.trim()) {
        memoryContext.locationHint = locationHint.trim();
      }
      if (selectedTags.length > 0) {
        memoryContext.situationTags = selectedTags;
      }
      if (personalNote.trim()) {
        memoryContext.personalNote = personalNote.trim();
      }

      // Language direction is determined by user's profile settings
      // (set during onboarding) - no need to pass explicit languages
      const hasContext = Object.keys(memoryContext).length > 0;
      const word = await captureWord(phrase.trim(), {
        memoryContext: hasContext ? memoryContext : undefined,
      });

      // Emit gamification event if phrase was captured with context
      if (hasContext && word?.id) {
        emitWordCapturedWithContext(word.id);
      }

      showToast("Phrase captured successfully!", "success");
      setPhrase("");
      setLocationHint("");
      setSelectedTags([]);
      setPersonalNote("");
      setShowContextFields(false);
      router.push("/");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Failed to capture phrase",
        "error"
      );
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Dark overlay with close button */}
      <div
        className="flex-1 relative"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)",
        }}
        onClick={handleClose}
        aria-label="Close capture"
      >
        {/* Top bar with close and brand */}
        <div className="flex justify-between items-center p-4">
          <button
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <InfoButton />
        </div>
      </div>

      {/* Bottom sheet modal - styled like a notebook page */}
      <div
        className="rounded-t-3xl relative"
        style={{
          backgroundColor: "var(--surface-page)",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15), 0 -2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div
            className="h-1.5 w-14 rounded-full"
            style={{ backgroundColor: "var(--border)" }}
          />
        </div>

        {/* Binding edge accent at top */}
        <div
          className="absolute top-0 left-6 right-6 h-1 rounded-b-full"
          style={{ backgroundColor: "var(--accent-ribbon)" }}
        />

        <div className="px-6 pb-8 pt-2">
          {/* Header with icon */}
          <div className="mb-6 flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "var(--accent-ribbon)",
                boxShadow: "0 4px 12px rgba(232, 92, 74, 0.3)",
              }}
            >
              <PenLine className="h-7 w-7 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1
                className="text-3xl heading-serif ink-text"
                style={{ color: "var(--text-heading)" }}
              >
                Quick Capture
              </h1>
              <p
                className="text-sm handwritten"
                style={{ color: "var(--text-muted)" }}
              >
                Add a phrase you want to remember
              </p>
            </div>
          </div>

          {/* Input with ruled lines */}
          <div
            className="mb-4 relative rounded-xl p-4"
            style={{
              backgroundColor: "var(--surface-page-aged)",
              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.04)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Ruled lines background */}
            <div
              className="absolute inset-0 rounded-xl pointer-events-none opacity-50 dark:opacity-20"
              style={{
                backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, var(--notebook-ruling) 27px, var(--notebook-ruling) 28px)",
                backgroundPosition: "0 12px",
              }}
            />
            <PhraseInput
              value={phrase}
              onChange={setPhrase}
              placeholder="Type or paste a phrase..."
            />
          </div>

          {/* Memory Context Accordion */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowContextFields(!showContextFields)}
              className="flex items-center gap-2 w-full py-2 text-sm font-medium transition-colors"
              style={{ color: "var(--accent-nav)" }}
            >
              <MapPin className="h-4 w-4" />
              <span>Add memory context</span>
              <ChevronDown
                className={`h-4 w-4 ml-auto transition-transform ${
                  showContextFields ? "rotate-180" : ""
                }`}
              />
            </button>

            {showContextFields && (
              <div
                className="mt-3 p-4 rounded-xl space-y-4"
                style={{
                  backgroundColor: "var(--surface-page)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Location hint */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      className="text-xs font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Where did you hear this?
                    </label>
                    <button
                      type="button"
                      disabled
                      className="text-[10px] px-2 py-0.5 rounded-full opacity-60"
                      style={{
                        backgroundColor: "var(--accent-nav-light)",
                        color: "var(--accent-nav)",
                      }}
                    >
                      📍 Auto-locate coming soon
                    </button>
                  </div>
                  <input
                    type="text"
                    value={locationHint}
                    onChange={(e) => setLocationHint(e.target.value)}
                    placeholder="at the bakery, in the park..."
                    className="w-full px-3 py-2 text-sm rounded-lg bg-transparent outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--text-body)",
                    }}
                  />
                </div>

                {/* Situation tags */}
                <div>
                  <label
                    className="text-xs font-medium mb-1.5 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Situation (pick up to 3)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {SITUATION_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag.id);
                      const IconComponent = SITUATION_ICONS[tag.icon];
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleTagToggle(tag.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all"
                          style={{
                            backgroundColor: isSelected
                              ? "rgba(12, 107, 112, 0.15)"
                              : "rgba(139, 90, 43, 0.08)",
                            color: isSelected
                              ? "var(--accent-nav)"
                              : "#8B5A2B",
                          }}
                        >
                          {IconComponent && <IconComponent className="h-3 w-3" />}
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Memory note - research shows context aids recall */}
                <div>
                  <label
                    className="text-xs font-medium mb-1.5 block"
                    style={{ color: "var(--text-muted)" }}
                  >
                    What will help you remember?
                  </label>
                  <textarea
                    value={personalNote}
                    onChange={(e) => setPersonalNote(e.target.value)}
                    placeholder="The context, a usage tip, or a memory..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-transparent outline-none resize-none handwritten"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--text-body)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save button - styled as ribbon tab */}
          <button
            onClick={handleSave}
            disabled={!phrase.trim() || isLoading}
            className="group relative w-full py-5 text-lg font-semibold rounded-r-xl rounded-l-none text-white transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              backgroundColor: "var(--accent-ribbon)",
              boxShadow: "0 4px 12px rgba(232, 92, 74, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = "var(--accent-ribbon-hover)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(232, 92, 74, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-ribbon)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(232, 92, 74, 0.3)";
            }}
          >
            {/* Binding edge */}
            <div
              className="absolute left-0 top-0 bottom-0 w-5 rounded-l-sm"
              style={{
                background: "linear-gradient(90deg, #C04A3C 0%, #D94E3E 100%)",
              }}
            />
            <div
              className="absolute left-2 top-3 bottom-3 w-0.5"
              style={{
                backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 6px, rgba(255,255,255,0.3) 6px, rgba(255,255,255,0.3) 10px)",
              }}
            />
            <span className="relative z-10 text-xl">
              {isLoading ? "Capturing..." : "Save to Notebook"}
            </span>
          </button>

          {/* Helper text */}
          <p
            className="mt-5 text-center text-sm handwritten"
            style={{ color: "var(--text-muted)" }}
          >
            {showContextFields
              ? "Context helps you remember where you learned it"
              : "Tap above to add where you heard this phrase"}
          </p>
        </div>

        {/* Safe area for iOS */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>
  );
}
