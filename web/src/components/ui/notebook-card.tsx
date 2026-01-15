import * as React from "react";
import { cn } from "@/lib/utils";

interface NotebookCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: "default" | "stacked" | "inset";
  /** Show binding strip on left */
  withBinding?: boolean;
  /** Interactive hover state */
  interactive?: boolean;
}

const NotebookCard = React.forwardRef<HTMLDivElement, NotebookCardProps>(
  (
    {
      className,
      variant = "default",
      withBinding = true,
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "relative bg-white p-5",
          // Moleskine corners: rounded right, square left
          "rounded-r-lg rounded-l-none",
          // Shadow based on variant
          variant === "default" && "shadow-sm",
          variant === "stacked" && "page-stack",
          variant === "inset" && "shadow-inner",
          // Binding strip spacing
          withBinding && "ml-4",
          // Interactive states
          interactive && [
            "cursor-pointer",
            "transition-all duration-200",
            "hover:shadow-md",
            "hover:-translate-y-0.5",
            "active:translate-y-0",
          ],
          className
        )}
        style={{
          boxShadow:
            variant === "default" ? "var(--shadow-page)" : undefined,
        }}
        {...props}
      >
        {/* Binding strip */}
        {withBinding && (
          <div
            className="absolute left-0 top-0 bottom-0 -ml-4 w-4 rounded-l-sm"
            style={{
              backgroundColor: "var(--surface-notebook)",
              borderRight: "1px dashed var(--notebook-stitch)",
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
NotebookCard.displayName = "NotebookCard";

// Sub-components for structure
const NotebookCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between mb-3", className)}
    {...props}
  />
));
NotebookCardHeader.displayName = "NotebookCardHeader";

const NotebookCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg tracking-tight heading-serif", className)}
    style={{ color: "var(--text-heading)" }}
    {...props}
  />
));
NotebookCardTitle.displayName = "NotebookCardTitle";

const NotebookCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    style={{ color: "var(--text-body)" }}
    {...props}
  />
));
NotebookCardContent.displayName = "NotebookCardContent";

export {
  NotebookCard,
  NotebookCardHeader,
  NotebookCardTitle,
  NotebookCardContent,
};
