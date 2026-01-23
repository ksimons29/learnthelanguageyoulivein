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

  // Use explicit colors with high contrast backgrounds
  const bgColors = {
    success: "border-green-600",
    error: "border-red-600",
    info: "border-blue-600",
  };

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 ${bgColors[toast.type]}`}
        style={{
          maxWidth: "calc(100vw - 2rem)",
          // High contrast background that works on any page
          backgroundColor: "#1a1a1a",
          boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)",
        }}
      >
        {icons[toast.type]}
        <p className="text-sm font-medium text-white">
          {toast.message}
        </p>
        <button
          onClick={hideToast}
          className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4 text-white/70" />
        </button>
      </div>
    </div>
  );
}
