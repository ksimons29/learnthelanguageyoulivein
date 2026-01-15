import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level for semantics */
  as?: "h1" | "h2" | "h3" | "h4";
  /** Visual size (can differ from semantic level) */
  size?: "sm" | "md" | "lg" | "xl";
  /** Optional subtitle */
  subtitle?: string;
}

const PageHeading = React.forwardRef<HTMLHeadingElement, PageHeadingProps>(
  (
    {
      className,
      as: Component = "h1",
      size = "lg",
      subtitle,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className="mb-6">
        <Component
          ref={ref}
          className={cn(
            // Serif font for notebook feel
            "heading-serif",
            "tracking-tight",
            "leading-tight",

            // Sizes
            size === "sm" && "text-lg",
            size === "md" && "text-xl",
            size === "lg" && "text-2xl",
            size === "xl" && "text-3xl",

            className
          )}
          style={{ color: "var(--text-heading)" }}
          {...props}
        >
          {children}
        </Component>

        {subtitle && (
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            {subtitle}
          </p>
        )}
      </div>
    );
  }
);
PageHeading.displayName = "PageHeading";

export { PageHeading };
