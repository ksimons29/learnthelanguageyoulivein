"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type FlagCode = "pt-PT" | "pt-BR" | "en" | "sv" | "es" | "fr" | "de" | "nl";

interface FlagStampProps extends React.HTMLAttributes<HTMLDivElement> {
  code: FlagCode;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
}

/**
 * Premium flag sticker component
 *
 * Designed with Moleskine aesthetic - clean, sophisticated, and understated:
 * - Smooth rounded corners like quality vinyl stickers
 * - Subtle shadow for depth against notebook paper
 * - Clean flag rendering without visual noise
 * - No gimmicky effects - premium through simplicity
 */
const FlagStamp = React.forwardRef<HTMLDivElement, FlagStampProps>(
  ({ className, code, size = "md", selected = false, ...props }, ref) => {
    const sizeClasses = {
      sm: "w-10 h-7",
      md: "w-14 h-10",
      lg: "w-[72px] h-[52px]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flag-sticker relative",
          sizeClasses[size],
          selected && "flag-sticker--selected",
          className
        )}
        {...props}
      >
        {/* Clean sticker container */}
        <div className="flag-sticker__container">
          <FlagPattern code={code} />
        </div>
      </div>
    );
  }
);
FlagStamp.displayName = "FlagStamp";

/**
 * Stylized flag patterns with vintage travel poster feel
 */
function FlagPattern({ code }: { code: FlagCode }) {
  switch (code) {
    case "pt-PT":
      return <PortugalFlag />;
    case "pt-BR":
      return <BrazilFlag />;
    case "en":
      return <UKFlag />;
    case "sv":
      return <SwedenFlag />;
    case "es":
      return <SpainFlag />;
    case "fr":
      return <FranceFlag />;
    case "de":
      return <GermanyFlag />;
    case "nl":
      return <NetherlandsFlag />;
    default:
      return <DefaultFlag />;
  }
}

// Portugal - Green/Red with stylized shield
function PortugalFlag() {
  return (
    <div className="w-full h-full flex overflow-hidden rounded-sm">
      <div className="w-[38%] h-full bg-[#046A38] relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[45%] w-6 h-6 rounded-full bg-[#DA291C] border-[3px] border-[#FFE900] flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#002F6C]" />
        </div>
      </div>
      <div className="w-[62%] h-full bg-[#DA291C]" />
    </div>
  );
}

// Brazil - Vibrant green/yellow with diamond
function BrazilFlag() {
  return (
    <div className="w-full h-full bg-[#009739] flex items-center justify-center overflow-hidden rounded-sm">
      <div
        className="w-[75%] h-[70%] bg-[#FEDD00] flex items-center justify-center"
        style={{ clipPath: "polygon(50% 5%, 95% 50%, 50% 95%, 5% 50%)" }}
      >
        <div className="w-5 h-5 rounded-full bg-[#002776] border-2 border-white/30" />
      </div>
    </div>
  );
}

// UK - Simplified Union Jack
function UKFlag() {
  return (
    <div className="w-full h-full bg-[#012169] relative overflow-hidden rounded-sm">
      {/* White diagonals */}
      <div className="absolute inset-0">
        <div className="absolute w-[180%] h-[18%] bg-white origin-center rotate-[28deg] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute w-[180%] h-[18%] bg-white origin-center -rotate-[28deg] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      {/* Red diagonals */}
      <div className="absolute inset-0">
        <div className="absolute w-[180%] h-[8%] bg-[#C8102E] origin-center rotate-[28deg] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute w-[180%] h-[8%] bg-[#C8102E] origin-center -rotate-[28deg] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      {/* White cross */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[28%] h-full bg-white" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[32%] bg-white" />
      {/* Red cross */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[16%] h-full bg-[#C8102E]" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[20%] bg-[#C8102E]" />
    </div>
  );
}

// Sweden - Clean blue/yellow cross
function SwedenFlag() {
  return (
    <div className="w-full h-full bg-[#006AA7] relative overflow-hidden rounded-sm">
      <div className="absolute top-0 left-[30%] w-[18%] h-full bg-[#FECC02]" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[24%] bg-[#FECC02]" />
    </div>
  );
}

// Spain - Vibrant red/yellow
function SpainFlag() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-sm">
      <div className="h-[25%] bg-[#AA151B]" />
      <div className="h-[50%] bg-[#F1BF00] relative">
        <div className="absolute left-[22%] top-1/2 -translate-y-1/2 w-3 h-4 rounded-t-sm bg-[#AA151B] border border-[#C6A000]" />
      </div>
      <div className="h-[25%] bg-[#AA151B]" />
    </div>
  );
}

// France - Classic tricolor
function FranceFlag() {
  return (
    <div className="w-full h-full flex overflow-hidden rounded-sm">
      <div className="w-1/3 h-full bg-[#002654]" />
      <div className="w-1/3 h-full bg-white" />
      <div className="w-1/3 h-full bg-[#CE1126]" />
    </div>
  );
}

// Germany - Bold tricolor
function GermanyFlag() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-sm">
      <div className="h-1/3 bg-[#000000]" />
      <div className="h-1/3 bg-[#DD0000]" />
      <div className="h-1/3 bg-[#FFCC00]" />
    </div>
  );
}

// Netherlands - Classic tricolor
function NetherlandsFlag() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-sm">
      <div className="h-1/3 bg-[#AE1C28]" />
      <div className="h-1/3 bg-white" />
      <div className="h-1/3 bg-[#21468B]" />
    </div>
  );
}

// Fallback
function DefaultFlag() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 rounded-sm" />
  );
}

export { FlagStamp, type FlagCode };
