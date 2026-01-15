import * as React from "react";
import { cn } from "@/lib/utils";

interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "soft";
  fullWidth?: boolean;
}

const SecondaryButton = React.forwardRef<
  HTMLButtonElement,
  SecondaryButtonProps
>(
  (
    {
      className,
      size = "md",
      variant = "outline",
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const getStyles = () => {
      if (variant === "ghost") {
        return {
          backgroundColor: isHovered ? "var(--accent-nav-light)" : "transparent",
          color: "var(--accent-nav)",
          border: "none",
        };
      }
      if (variant === "outline") {
        return {
          backgroundColor: isHovered ? "var(--accent-nav)" : "transparent",
          color: isHovered ? "var(--text-on-binding)" : "var(--accent-nav)",
          border: "1px solid var(--accent-nav)",
        };
      }
      // soft
      return {
        backgroundColor: isHovered ? "var(--accent-nav)" : "var(--accent-nav-light)",
        color: isHovered ? "var(--text-on-binding)" : "var(--accent-nav)",
        border: "none",
      };
    };

    return (
      <button
        ref={ref}
        className={cn(
          // Base
          "relative inline-flex items-center justify-center gap-2",
          "font-medium",
          "transition-all duration-150",
          "rounded-lg",

          // Focus
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-offset-2",

          // Disabled
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",

          // Sizes
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4 text-base",
          size === "lg" && "h-12 px-6 text-lg",

          fullWidth && "w-full",

          className
        )}
        style={getStyles()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SecondaryButton.displayName = "SecondaryButton";

export { SecondaryButton };
