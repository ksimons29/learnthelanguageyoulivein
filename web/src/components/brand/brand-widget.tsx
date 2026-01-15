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
  "relative flex items-center justify-center transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      size: {
        xs: "w-8 h-8",
        sm: "w-10 h-10",
        md: "w-12 h-12",
        lg: "w-16 h-16",
        xl: "w-20 h-20",
      },
      variant: {
        default: "rounded-full bg-llyli-teal hover:bg-llyli-teal/90 shadow-md hover:shadow-lg hover:scale-105",
        ghost: "rounded-full hover:bg-secondary hover:scale-105",
        outlined: "rounded-full border-2 border-llyli-teal hover:bg-llyli-teal-light hover:scale-105",
        floating: "rounded-full bg-llyli-teal shadow-lg hover:shadow-xl hover:scale-110",
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

  // Calculate image dimensions based on size
  const imageSizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 52,
    xl: 64,
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
          src="/images/llyli-mascot.png"
          alt="LLYLI Mascot"
          width={imageSize}
          height={imageSize}
          className="rounded-full object-cover"
          priority
        />
      </button>

      {showDialog && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4">
                <Image
                  src="/images/llyli-mascot.png"
                  alt="LLYLI Mascot"
                  width={80}
                  height={80}
                  className="rounded-2xl"
                />
              </div>
              <DialogTitle className="text-xl">
                Learn the Language You Live In
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Turn real-life phrases into lasting memories
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <FeatureItem
                icon={<BookOpen className="h-5 w-5 text-llyli-teal" />}
                title="Capture Phrases"
                description="Save words from real conversations, signs, and messages"
              />
              <FeatureItem
                icon={<Volume2 className="h-5 w-5 text-llyli-coral" />}
                title="Native Audio"
                description="Hear how native speakers pronounce each phrase"
              />
              <FeatureItem
                icon={<Brain className="h-5 w-5 text-primary" />}
                title="Smart Reviews"
                description="FSRS algorithm schedules reviews at the optimal time"
              />
              <FeatureItem
                icon={<Sparkles className="h-5 w-5 text-warning" />}
                title="Real Context"
                description="Learn language from your actual daily life"
              />
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Version 1.0 &middot; Made with care in Lisbon
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
