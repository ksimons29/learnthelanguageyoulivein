"use client";

import { ChevronDown, ArrowRight } from "lucide-react";
import {
  SUPPORTED_DIRECTIONS,
  SUPPORTED_LANGUAGES,
  getValidTargetsForSource,
  type SupportedDirection,
} from "@/lib/config/languages";

interface LanguageSelectorProps {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (code: string) => void;
  onTargetChange: (code: string) => void;
}

/**
 * LanguageSelector
 *
 * Compact language direction selector for the capture page.
 * Shows "From → To" with dropdowns for each.
 * Only allows supported translation directions.
 */
export function LanguageSelector({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
}: LanguageSelectorProps) {
  // Get unique source languages from supported directions
  const sourceLanguages = [...new Set(SUPPORTED_DIRECTIONS.map((d) => d.source))];

  // Get valid targets for the current source
  const validTargets = getValidTargetsForSource(sourceLang);

  // Auto-correct target if it's not valid for the selected source
  const handleSourceChange = (newSource: string) => {
    onSourceChange(newSource);
    const validTargetsForNew = getValidTargetsForSource(newSource);
    if (!validTargetsForNew.includes(targetLang)) {
      // Auto-select the first valid target
      onTargetChange(validTargetsForNew[0] || "");
    }
  };

  const getLanguageName = (code: string): string => {
    return SUPPORTED_LANGUAGES[code]?.name || code;
  };

  const getLanguageFlag = (code: string): string => {
    // Simple flag mapping for common codes
    const flags: Record<string, string> = {
      en: "🇬🇧",
      nl: "🇳🇱",
      "pt-PT": "🇵🇹",
      sv: "🇸🇪",
    };
    return flags[code] || "🌐";
  };

  return (
    <div
      className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg"
      style={{
        backgroundColor: "var(--surface-page-aged)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Source Language */}
      <div className="relative">
        <select
          value={sourceLang}
          onChange={(e) => handleSourceChange(e.target.value)}
          className="appearance-none pr-6 pl-2 py-1.5 text-sm font-medium rounded-md cursor-pointer focus:outline-none focus:ring-2"
          style={{
            backgroundColor: "var(--surface-page)",
            color: "var(--text-body)",
            border: "1px solid var(--border)",
          }}
        >
          {sourceLanguages.map((code) => (
            <option key={code} value={code}>
              {getLanguageFlag(code)} {getLanguageName(code)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
      </div>

      {/* Arrow */}
      <ArrowRight
        className="h-4 w-4 flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
      />

      {/* Target Language */}
      <div className="relative">
        <select
          value={targetLang}
          onChange={(e) => onTargetChange(e.target.value)}
          className="appearance-none pr-6 pl-2 py-1.5 text-sm font-medium rounded-md cursor-pointer focus:outline-none focus:ring-2"
          style={{
            backgroundColor: "var(--surface-page)",
            color: "var(--text-body)",
            border: "1px solid var(--border)",
          }}
        >
          {validTargets.map((code) => (
            <option key={code} value={code}>
              {getLanguageFlag(code)} {getLanguageName(code)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
      </div>
    </div>
  );
}
