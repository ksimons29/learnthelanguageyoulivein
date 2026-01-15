"use client";

import * as React from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BookOpen, Sparkles, Brain, Volume2 } from "lucide-react";

const brandWidgetVariants = cva(
  "relative flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-hidden",
  {
    variants: {
      size: {
        xs: "w-8 h-8",
        sm: "w-10 h-10",
        md: "w-12 h-12",
        lg: "w-14 h-14",
        xl: "w-20 h-20",
      },
      variant: {
        default: "rounded-xl shadow-lg hover:shadow-xl hover:scale-105 bg-transparent",
        ghost: "rounded-xl hover:bg-secondary/50 hover:scale-105 bg-transparent",
        outlined: "rounded-xl border-2 border-[#0C6B70] hover:border-[#E85C4A] hover:scale-105 bg-white",
        floating: "rounded-xl shadow-xl hover:shadow-2xl hover:scale-110 bg-transparent",
        notebook: "rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:scale-105 bg-transparent",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

interface BrandWidgetProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof brandWidgetVariants> {
  showDialog?: boolean;
  tooltipText?: string;
}

function BrandWidget({
  className,
  size = "md",
  variant = "default",
  showDialog = true,
  tooltipText,
  ...props
}: BrandWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (showDialog) {
      setIsOpen(true);
    }
    props.onClick?.(e);
  };

  // Calculate image dimensions based on size - slightly larger than container for full bleed
  const imageSizes = {
    xs: 32,
    sm: 40,
    md: 48,
    lg: 56,
    xl: 80,
  };

  const imageSize = imageSizes[size || "md"];

  return (
    <>
      <button
        data-slot="brand-widget"
        type="button"
        className={cn(brandWidgetVariants({ size, variant, className }))}
        onClick={handleClick}
        aria-label={tooltipText || "LLYLI - Learn the language you live in"}
        {...props}
      >
        <Image
          src="/images/llyli-icon.png"
          alt="LLYLI"
          width={imageSize}
          height={imageSize}
          className="object-contain"
          priority
        />
      </button>

      {showDialog && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            className="max-w-sm"
            style={{ backgroundColor: "#FFFEF9" }}
          >
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4">
                <Image
                  src="/images/llyli-icon.png"
                  alt="LLYLI"
                  width={96}
                  height={96}
                  className="rounded-2xl shadow-lg"
                />
              </div>
              <DialogTitle
                className="text-2xl heading-serif"
                style={{ color: "var(--text-heading)" }}
              >
                Learn the Language You Live In
              </DialogTitle>
              <DialogDescription style={{ color: "var(--text-muted)" }}>
                Turn real-life phrases into lasting memories
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <FeatureItem
                icon={<BookOpen className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />}
                title="Capture Phrases"
                description="Save words from real conversations, signs, and messages"
              />
              <FeatureItem
                icon={<Volume2 className="h-5 w-5" style={{ color: "var(--accent-ribbon)" }} />}
                title="Native Audio"
                description="Hear how native speakers pronounce each phrase"
              />
              <FeatureItem
                icon={<Brain className="h-5 w-5" style={{ color: "var(--accent-nav)" }} />}
                title="Smart Reviews"
                description="FSRS algorithm schedules reviews at the optimal time"
              />
              <FeatureItem
                icon={<Sparkles className="h-5 w-5" style={{ color: "var(--state-good)" }} />}
                title="Real Context"
                description="Learn language from your actual daily life"
              />
            </div>

            <div
              className="pt-4 mt-4"
              style={{ borderTop: "1px dashed var(--notebook-stitch)" }}
            >
              <p
                className="text-xs text-center"
                style={{ color: "var(--text-muted)" }}
              >
                Version 1.0 · Made with care in Lisbon
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export { BrandWidget, brandWidgetVariants };
