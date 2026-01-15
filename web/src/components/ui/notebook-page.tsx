import * as React from "react";
import { cn } from "@/lib/utils";

interface NotebookPageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show the binding edge on the left */
  withBinding?: boolean;
  /** Show subtle ruled lines */
  withRuling?: boolean;
  /** Add paper texture to background */
  withTexture?: boolean;
}

const NotebookPage = React.forwardRef<HTMLDivElement, NotebookPageProps>(
  (
    {
      className,
      withBinding = false,
      withRuling = false,
      withTexture = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn("min-h-screen", withTexture && "paper-grain", className)}
        style={{ backgroundColor: "var(--surface-notebook)" }}
        {...props}
      >
        <div
          className={cn(
            "relative",
            withBinding && "binding-edge",
            withRuling && "ruled-lines"
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
NotebookPage.displayName = "NotebookPage";

export { NotebookPage };
