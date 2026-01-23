"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/store";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

/**
 * Toast notification component
 * Displays messages from the UI store with auto-dismiss
 */
export function Toast() {
  const { toast, hideToast } = useUIStore();

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (toast?.isVisible) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast?.isVisible, hideToast]);

  if (!toast?.isVisible) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${bgColors[toast.type]}`}
        style={{ maxWidth: "calc(100vw - 2rem)" }}
      >
        {icons[toast.type]}
        <p className="text-sm font-medium" style={{ color: "var(--text-body)" }}>
          {toast.message}
        </p>
        <button
          onClick={hideToast}
          className="ml-2 p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        </button>
      </div>
    </div>
  );
}
