"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { useInstallPrompt } from "@/lib/hooks";

const DISMISS_KEY = "llyli-install-banner-dismissed";

/**
 * Install Banner
 *
 * Shows a banner prompting users to install the PWA.
 * Position: Fixed above bottom nav.
 * Respects localStorage dismissal.
 */
export function InstallBanner() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash

  useEffect(() => {
    // Check localStorage for dismissal
    const dismissed = localStorage.getItem(DISMISS_KEY);
    setIsDismissed(dismissed === "true");
  }, []);

  // Don't show if installed, can't install, or dismissed
  if (isInstalled || !canInstall || isDismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setIsDismissed(true);
  };

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (!accepted) {
      // User declined, don't show again
      handleDismiss();
    }
  };

  return (
    <div
      className="fixed bottom-20 left-4 right-4 z-40 rounded-xl p-4 shadow-lg"
      style={{
        backgroundColor: "var(--surface-page)",
        border: "1px solid var(--border-tab)",
      }}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--accent-nav)" }}
        >
          <Download className="w-5 h-5 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className="font-medium text-sm"
            style={{ color: "var(--text-heading)" }}
          >
            Install LLYLI
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Add to home screen for offline access
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Install button */}
          <button
            onClick={handleInstall}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--accent-ribbon)",
              color: "var(--text-on-ribbon)",
            }}
          >
            Install
          </button>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="p-2 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
