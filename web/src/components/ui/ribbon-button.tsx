import * as React from "react";
import { cn } from "@/lib/utils";

interface RibbonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Full width */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
}

const RibbonButton = React.forwardRef<HTMLButtonElement, RibbonButtonProps>(
  (
    {
      className,
      size = "md",
      fullWidth = false,
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center gap-2",
          "font-medium",
          "transition-all duration-150",

          // The "ribbon" coral color
          "text-white",

          // Rounded corners
          "rounded-lg",

          // Subtle shadow for depth
          "shadow-sm",

          // Hover: darken and lift
          "hover:shadow-md",
          "hover:-translate-y-0.5",

          // Active: press down
          "active:translate-y-0",
          "active:shadow-sm",

          // Focus ring
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-offset-2",

          // Disabled
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",
          "disabled:hover:translate-y-0",

          // Sizes
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4 text-base",
          size === "lg" && "h-12 px-6 text-lg",

          // Full width
          fullWidth && "w-full",

          className
        )}
        style={{
          backgroundColor: "var(--accent-ribbon)",
          color: "var(--text-on-ribbon)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--accent-ribbon-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--accent-ribbon)";
        }}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
RibbonButton.displayName = "RibbonButton";

export { RibbonButton };
