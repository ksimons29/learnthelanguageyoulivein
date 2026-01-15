# LLYLI Moleskine Design System - Implementation Guide

**Purpose:** Transform LLYLI from generic app to premium "digital notebook" aesthetic
**Executor:** Claude Code
**Priority:** High - This defines brand differentiation

---

## Executive Summary

LLYLI should feel like opening a premium Moleskine notebook for your language journey. Every screen is a page. Every interaction feels crafted. The coral accent is your ribbon bookmark - used sparingly but distinctively.

**Core Metaphor:** You are building a digital language notebook, not an app with notebook colors.

---

## Part 1: Design Tokens Update

### File: `web/src/app/globals.css`

Replace/update the `:root` CSS variables with this complete token system:

```css
@layer base {
  :root {
    /* ======================
       MOLESKINE COLOR SYSTEM
       ====================== */
    
    /* Surface Hierarchy - Like notebook pages stacked */
    --surface-notebook: #F8F3E7;      /* The notebook paper background */
    --surface-page: #FFFFFF;           /* Individual card/page surfaces */
    --surface-page-aged: #FBF8F0;      /* Slightly warmer page variant */
    --surface-binding: #0C6B70;        /* Teal - notebook cover peeking through */
    
    /* Accent System - The "Ribbon" Rule */
    /* CRITICAL: Coral appears as ONE accent element per screen maximum */
    --accent-ribbon: #E85C4A;          /* Coral - primary action, like Moleskine's elastic */
    --accent-ribbon-hover: #D94E3E;    /* Darker coral for hover states */
    --accent-ribbon-light: #FEF2F0;    /* Very light coral for subtle highlights */
    
    /* Navigation & Progress - Secondary accent */
    --accent-nav: #0C6B70;             /* Teal for active navigation states */
    --accent-nav-light: #E8F4F4;       /* Light teal for backgrounds */
    
    /* Text Hierarchy */
    --text-heading: #1D262A;           /* Ink black for headings */
    --text-body: #2D3436;              /* Slightly softer for body */
    --text-muted: #6C7275;             /* Secondary text, captions */
    --text-on-ribbon: #FFFFFF;         /* White text on coral accent */
    --text-on-binding: #F8F3E7;        /* Cream text on teal */
    
    /* Notebook Details */
    --notebook-stitch: rgba(108, 114, 117, 0.25);  /* Binding stitch marks */
    --notebook-ruling: rgba(108, 114, 117, 0.08);  /* Faint ruled lines */
    --notebook-shadow: rgba(28, 38, 42, 0.06);     /* Subtle page shadow */
    --notebook-shadow-hover: rgba(28, 38, 42, 0.12);
    
    /* Semantic States - Grading */
    --state-hard: #8C5B52;             /* Deep brown - struggle */
    --state-hard-bg: #FAF0EE;
    --state-good: #B58B82;             /* Warm taupe - acceptable */
    --state-good-bg: #FAF5F3;
    --state-easy: #5B7979;             /* Muted teal - mastery */
    --state-easy-bg: #F0F5F5;
    
    /* ======================
       TYPOGRAPHY SYSTEM
       ====================== */
    
    --font-heading: 'Libre Baskerville', 'Georgia', serif;
    --font-body: 'Inter', system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    
    /* Type Scale */
    --text-xs: 0.75rem;    /* 12px */
    --text-sm: 0.875rem;   /* 14px */
    --text-base: 1rem;     /* 16px */
    --text-lg: 1.125rem;   /* 18px */
    --text-xl: 1.25rem;    /* 20px */
    --text-2xl: 1.5rem;    /* 24px */
    --text-3xl: 1.875rem;  /* 30px */
    
    /* ======================
       SPACING & LAYOUT
       ====================== */
    
    --space-1: 0.25rem;    /* 4px */
    --space-2: 0.5rem;     /* 8px */
    --space-3: 0.75rem;    /* 12px */
    --space-4: 1rem;       /* 16px */
    --space-5: 1.25rem;    /* 20px */
    --space-6: 1.5rem;     /* 24px */
    --space-8: 2rem;       /* 32px */
    
    /* Notebook-specific spacing */
    --binding-width: 1rem;             /* Left binding strip width */
    --page-inset: 1.25rem;             /* Content padding inside pages */
    
    /* ======================
       BORDERS & RADII
       ====================== */
    
    /* Moleskine corners: rounded on right, square on left (binding side) */
    --radius-none: 0;
    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-page: 0 0.5rem 0.5rem 0;  /* Right side only - key differentiator */
    --radius-full: 9999px;
    
    /* ======================
       SHADOWS - Page Stack Effect
       ====================== */
    
    --shadow-page: 
      0 1px 2px var(--notebook-shadow),
      0 2px 4px var(--notebook-shadow);
    
    --shadow-page-hover: 
      0 2px 4px var(--notebook-shadow-hover),
      0 4px 8px var(--notebook-shadow-hover);
    
    --shadow-page-stack:
      0 1px 2px var(--notebook-shadow),
      2px 2px 0 var(--surface-page),
      2px 3px 2px var(--notebook-shadow),
      4px 4px 0 var(--surface-page),
      4px 5px 2px var(--notebook-shadow);
    
    /* ======================
       TRANSITIONS
       ====================== */
    
    --transition-fast: 150ms ease;
    --transition-base: 200ms ease;
    --transition-slow: 300ms ease;
    --transition-page: 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}
```

### Add Paper Texture Utility Classes

Add these utility classes to the same `globals.css` file:

```css
@layer utilities {
  /* Paper texture background */
  .paper-texture {
    background-color: var(--surface-notebook);
    background-image: 
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-blend-mode: soft-light;
    background-size: 200px 200px;
  }
  
  /* Alternative: CSS-only grain effect */
  .paper-grain {
    position: relative;
  }
  
  .paper-grain::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
    z-index: 0;
  }
  
  /* Ruled lines for input areas */
  .ruled-lines {
    background-image: repeating-linear-gradient(
      transparent,
      transparent 1.5rem,
      var(--notebook-ruling) 1.5rem,
      var(--notebook-ruling) calc(1.5rem + 1px)
    );
    background-position: 0 0.75rem;
  }
  
  /* Binding edge effect */
  .binding-edge {
    position: relative;
    margin-left: var(--binding-width);
  }
  
  .binding-edge::before {
    content: '';
    position: absolute;
    left: calc(-1 * var(--binding-width));
    top: 0;
    bottom: 0;
    width: var(--binding-width);
    background: var(--surface-notebook);
    border-right: 1px dashed var(--notebook-stitch);
  }
  
  /* Page corner fold effect (optional) */
  .page-corner {
    position: relative;
    overflow: hidden;
  }
  
  .page-corner::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1.5rem;
    height: 1.5rem;
    background: linear-gradient(
      135deg,
      transparent 50%,
      var(--notebook-shadow) 50%
    );
    opacity: 0.5;
  }
  
  /* Ribbon accent strip */
  .ribbon-accent {
    position: relative;
  }
  
  .ribbon-accent::before {
    content: '';
    position: absolute;
    top: 0;
    left: 1.5rem;
    width: 0.5rem;
    height: 100%;
    background: var(--accent-ribbon);
    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  }
  
  /* Heading with serif font */
  .heading-serif {
    font-family: var(--font-heading);
    font-weight: 400;
    letter-spacing: -0.01em;
  }
  
  /* Stacked pages effect */
  .page-stack {
    box-shadow: var(--shadow-page-stack);
  }
}
```

---

## Part 2: Core Components

### Component 1: NotebookPage (Layout Wrapper)

**File:** `web/src/components/ui/notebook-page.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface NotebookPageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show the binding edge on the left */
  withBinding?: boolean
  /** Show subtle ruled lines */
  withRuling?: boolean
  /** Add paper texture to background */
  withTexture?: boolean
}

const NotebookPage = React.forwardRef<HTMLDivElement, NotebookPageProps>(
  ({ className, withBinding = false, withRuling = false, withTexture = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen",
          withTexture && "paper-grain",
          className
        )}
        style={{ backgroundColor: 'var(--surface-notebook)' }}
        {...props}
      >
        <div className={cn(
          "relative",
          withBinding && "binding-edge",
          withRuling && "ruled-lines"
        )}>
          {children}
        </div>
      </div>
    )
  }
)
NotebookPage.displayName = "NotebookPage"

export { NotebookPage }
```

### Component 2: NotebookCard (Replaces generic Card)

**File:** `web/src/components/ui/notebook-card.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface NotebookCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: "default" | "stacked" | "inset"
  /** Show binding strip on left */
  withBinding?: boolean
  /** Interactive hover state */
  interactive?: boolean
}

const NotebookCard = React.forwardRef<HTMLDivElement, NotebookCardProps>(
  ({ className, variant = "default", withBinding = true, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "relative bg-[var(--surface-page)] p-[var(--page-inset)]",
          // Moleskine corners: rounded right, square left
          "rounded-r-[var(--radius-md)]",
          // Shadow based on variant
          variant === "default" && "shadow-[var(--shadow-page)]",
          variant === "stacked" && "shadow-[var(--shadow-page-stack)]",
          variant === "inset" && "shadow-inner",
          // Binding strip
          withBinding && "ml-[var(--binding-width)]",
          // Interactive states
          interactive && [
            "cursor-pointer",
            "transition-all duration-[var(--transition-base)]",
            "hover:shadow-[var(--shadow-page-hover)]",
            "hover:-translate-y-0.5",
            "active:translate-y-0"
          ],
          className
        )}
        {...props}
      >
        {/* Binding strip */}
        {withBinding && (
          <div 
            className="absolute left-0 top-0 bottom-0 -ml-[var(--binding-width)] w-[var(--binding-width)] rounded-l-[var(--radius-sm)]"
            style={{ 
              backgroundColor: 'var(--surface-notebook)',
              borderRight: '1px dashed var(--notebook-stitch)'
            }}
          />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }
)
NotebookCard.displayName = "NotebookCard"

// Sub-components for structure
const NotebookCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between mb-[var(--space-3)]", className)}
    {...props}
  />
))
NotebookCardHeader.displayName = "NotebookCardHeader"

const NotebookCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-[var(--font-heading)] text-[var(--text-lg)] text-[var(--text-heading)]",
      "tracking-tight",
      className
    )}
    {...props}
  />
))
NotebookCardTitle.displayName = "NotebookCardTitle"

const NotebookCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[var(--text-body)]", className)}
    {...props}
  />
))
NotebookCardContent.displayName = "NotebookCardContent"

export { 
  NotebookCard, 
  NotebookCardHeader, 
  NotebookCardTitle, 
  NotebookCardContent 
}
```

### Component 3: RibbonButton (Primary CTA)

**File:** `web/src/components/ui/ribbon-button.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface RibbonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button size */
  size?: "sm" | "md" | "lg"
  /** Full width */
  fullWidth?: boolean
  /** Loading state */
  loading?: boolean
}

const RibbonButton = React.forwardRef<HTMLButtonElement, RibbonButtonProps>(
  ({ className, size = "md", fullWidth = false, loading = false, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center gap-2",
          "font-medium",
          "transition-all duration-[var(--transition-fast)]",
          
          // The "ribbon" coral color
          "bg-[var(--accent-ribbon)] text-[var(--text-on-ribbon)]",
          
          // Moleskine-inspired rounded corners (slightly more rounded than cards)
          "rounded-[var(--radius-md)]",
          
          // Subtle shadow for depth
          "shadow-sm",
          
          // Hover: darken and lift
          "hover:bg-[var(--accent-ribbon-hover)]",
          "hover:shadow-md",
          "hover:-translate-y-0.5",
          
          // Active: press down
          "active:translate-y-0",
          "active:shadow-sm",
          
          // Focus ring
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-[var(--accent-ribbon)]",
          "focus-visible:ring-offset-2",
          "focus-visible:ring-offset-[var(--surface-notebook)]",
          
          // Disabled
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",
          "disabled:hover:translate-y-0",
          
          // Sizes
          size === "sm" && "h-8 px-3 text-[var(--text-sm)]",
          size === "md" && "h-10 px-4 text-[var(--text-base)]",
          size === "lg" && "h-12 px-6 text-[var(--text-lg)]",
          
          // Full width
          fullWidth && "w-full",
          
          className
        )}
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
    )
  }
)
RibbonButton.displayName = "RibbonButton"

export { RibbonButton }
```

### Component 4: SecondaryButton (Teal/Ghost variant)

**File:** `web/src/components/ui/secondary-button.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg"
  variant?: "ghost" | "outline" | "soft"
  fullWidth?: boolean
}

const SecondaryButton = React.forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ className, size = "md", variant = "outline", fullWidth = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base
          "relative inline-flex items-center justify-center gap-2",
          "font-medium",
          "transition-all duration-[var(--transition-fast)]",
          "rounded-[var(--radius-md)]",
          
          // Variants
          variant === "ghost" && [
            "bg-transparent",
            "text-[var(--accent-nav)]",
            "hover:bg-[var(--accent-nav-light)]",
          ],
          variant === "outline" && [
            "bg-transparent",
            "text-[var(--accent-nav)]",
            "border border-[var(--accent-nav)]",
            "hover:bg-[var(--accent-nav)]",
            "hover:text-[var(--text-on-binding)]",
          ],
          variant === "soft" && [
            "bg-[var(--accent-nav-light)]",
            "text-[var(--accent-nav)]",
            "hover:bg-[var(--accent-nav)]",
            "hover:text-[var(--text-on-binding)]",
          ],
          
          // Focus
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-[var(--accent-nav)]",
          "focus-visible:ring-offset-2",
          
          // Disabled
          "disabled:opacity-50",
          "disabled:cursor-not-allowed",
          
          // Sizes
          size === "sm" && "h-8 px-3 text-[var(--text-sm)]",
          size === "md" && "h-10 px-4 text-[var(--text-base)]",
          size === "lg" && "h-12 px-6 text-[var(--text-lg)]",
          
          fullWidth && "w-full",
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SecondaryButton.displayName = "SecondaryButton"

export { SecondaryButton }
```

### Component 5: PageHeading (Serif typography)

**File:** `web/src/components/ui/page-heading.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level for semantics */
  as?: "h1" | "h2" | "h3" | "h4"
  /** Visual size (can differ from semantic level) */
  size?: "sm" | "md" | "lg" | "xl"
  /** Optional subtitle */
  subtitle?: string
}

const PageHeading = React.forwardRef<HTMLHeadingElement, PageHeadingProps>(
  ({ className, as: Component = "h1", size = "lg", subtitle, children, ...props }, ref) => {
    return (
      <div className="mb-[var(--space-6)]">
        <Component
          ref={ref}
          className={cn(
            // Serif font for notebook feel
            "font-[family-name:var(--font-heading)]",
            "text-[var(--text-heading)]",
            "tracking-tight",
            "leading-tight",
            
            // Sizes
            size === "sm" && "text-[var(--text-lg)]",
            size === "md" && "text-[var(--text-xl)]",
            size === "lg" && "text-[var(--text-2xl)]",
            size === "xl" && "text-[var(--text-3xl)]",
            
            className
          )}
          {...props}
        >
          {children}
        </Component>
        
        {subtitle && (
          <p className="mt-[var(--space-1)] text-[var(--text-muted)] text-[var(--text-sm)]">
            {subtitle}
          </p>
        )}
      </div>
    )
  }
)
PageHeading.displayName = "PageHeading"

export { PageHeading }
```

### Component 6: GradingButton (For review session)

**File:** `web/src/components/ui/grading-button.tsx`

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

type GradeType = "hard" | "good" | "easy"

interface GradingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  grade: GradeType
  /** Show as selected/active */
  selected?: boolean
}

const gradeConfig: Record<GradeType, { bg: string; bgHover: string; text: string; border: string; label: string }> = {
  hard: {
    bg: "var(--state-hard-bg)",
    bgHover: "var(--state-hard)",
    text: "var(--state-hard)",
    border: "var(--state-hard)",
    label: "Hard"
  },
  good: {
    bg: "var(--state-good-bg)",
    bgHover: "var(--state-good)",
    text: "var(--state-good)",
    border: "var(--state-good)",
    label: "Good"
  },
  easy: {
    bg: "var(--state-easy-bg)",
    bgHover: "var(--state-easy)",
    text: "var(--state-easy)",
    border: "var(--state-easy)",
    label: "Easy"
  }
}

const GradingButton = React.forwardRef<HTMLButtonElement, GradingButtonProps>(
  ({ className, grade, selected = false, children, ...props }, ref) => {
    const config = gradeConfig[grade]
    
    return (
      <button
        ref={ref}
        className={cn(
          // Base
          "relative flex-1 py-3 px-4",
          "font-medium text-[var(--text-base)]",
          "rounded-[var(--radius-md)]",
          "border-2",
          "transition-all duration-[var(--transition-fast)]",
          
          // Default state
          !selected && "hover:-translate-y-0.5",
          
          // Selected state
          selected && "translate-y-0 shadow-inner",
          
          // Focus
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-offset-2",
          
          className
        )}
        style={{
          backgroundColor: selected ? config.bgHover : config.bg,
          borderColor: config.border,
          color: selected ? 'white' : config.text,
        }}
        {...props}
      >
        {children || config.label}
      </button>
    )
  }
)
GradingButton.displayName = "GradingButton"

export { GradingButton }
```

---

## Part 3: Layout Updates

### Update: Root Layout

**File:** `web/src/app/layout.tsx`

Add Google Font import and update body classes:

```tsx
import type { Metadata } from "next"
import { Inter, Libre_Baskerville } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre",
  display: "swap",
})

export const metadata: Metadata = {
  title: "LLYLI - Learn the Language You Live In",
  description: "Your personal language notebook. Capture phrases, hear pronunciation, master vocabulary.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${libreBaskerville.variable}`}>
      <body 
        className="antialiased min-h-screen"
        style={{ 
          fontFamily: 'var(--font-body)',
          backgroundColor: 'var(--surface-notebook)'
        }}
      >
        {children}
      </body>
    </html>
  )
}
```

---

## Part 4: Screen Redesigns

### Home Screen (`web/src/app/page.tsx`)

Key changes:
1. Use `NotebookPage` as wrapper
2. Use `PageHeading` with serif font for "Today"
3. Use `NotebookCard` for all cards
4. Use `RibbonButton` for primary "Capture" CTA
5. Use `SecondaryButton` for "Review Due"
6. Add ribbon accent strip at top

**Structure:**
```tsx
<NotebookPage withTexture>
  {/* Ribbon accent strip at very top */}
  <div 
    className="h-1.5 w-full" 
    style={{ backgroundColor: 'var(--accent-ribbon)' }} 
  />
  
  <main className="max-w-md mx-auto px-4 py-6">
    <PageHeading as="h1" size="lg" subtitle="Your language journey">
      Today
    </PageHeading>
    
    {/* Primary actions */}
    <div className="flex gap-3 mb-6">
      <RibbonButton size="lg" className="flex-1">
        <PlusIcon /> Capture
      </RibbonButton>
      <SecondaryButton variant="outline" size="lg" className="flex-1">
        Review Due <Badge>12</Badge>
      </SecondaryButton>
    </div>
    
    {/* Captured Today section */}
    <NotebookCard withBinding variant="default" className="mb-4">
      <NotebookCardHeader>
        <NotebookCardTitle>Captured Today</NotebookCardTitle>
      </NotebookCardHeader>
      <NotebookCardContent>
        {/* Phrase list */}
      </NotebookCardContent>
    </NotebookCard>
    
    {/* Progress strip */}
    <NotebookCard withBinding={false} className="mb-4">
      {/* Today's progress stats */}
    </NotebookCard>
  </main>
  
  {/* Bottom navigation */}
  <BottomNav />
  
  {/* FAB - styled as notebook sticker */}
  <FloatingActionButton />
</NotebookPage>
```

### Review Screen (`web/src/app/review/page.tsx`)

Key changes:
1. Sentence card as prominent notebook page
2. Grading buttons use new `GradingButton` component
3. Word highlights use ribbon accent color sparingly
4. Progress shown as page number style

### Capture Screen (`web/src/app/capture/page.tsx`)

Key changes:
1. Input area with `ruled-lines` class
2. Save button as `RibbonButton`
3. Sheet/modal with notebook paper background

---

## Part 5: Component Index Export

**File:** `web/src/components/ui/index.ts`

```tsx
// Moleskine Design System exports
export { NotebookPage } from "./notebook-page"
export { 
  NotebookCard, 
  NotebookCardHeader, 
  NotebookCardTitle, 
  NotebookCardContent 
} from "./notebook-card"
export { RibbonButton } from "./ribbon-button"
export { SecondaryButton } from "./secondary-button"
export { PageHeading } from "./page-heading"
export { GradingButton } from "./grading-button"

// Keep existing shadcn exports
export * from "./button"
export * from "./card"
export * from "./badge"
// ... etc
```

---

## Part 6: Implementation Order

Claude Code should execute in this order:

### Step 1: Foundation (Do First)
1. Update `globals.css` with new CSS variables
2. Add utility classes for textures/binding
3. Update `layout.tsx` with fonts

### Step 2: Core Components
4. Create `notebook-page.tsx`
5. Create `notebook-card.tsx`
6. Create `ribbon-button.tsx`
7. Create `secondary-button.tsx`
8. Create `page-heading.tsx`
9. Create `grading-button.tsx`
10. Update component index exports

### Step 3: Screen Updates
11. Update Home page (`page.tsx`)
12. Update Review page (`review/page.tsx`)
13. Update Capture page (`capture/page.tsx`)
14. Update other screens as needed

### Step 4: Polish
15. Test all interactions
16. Verify color contrast accessibility
17. Check responsive behavior
18. Add any missing transitions

---

## Part 7: Design Rules Summary

### The "Ribbon Rule"
**Coral (#E85C4A) appears as ONE dominant element per screen.**

✅ Correct:
- Home: Capture button is coral, everything else is teal/neutral
- Review: Reveal button is coral, grading uses semantic colors
- Capture: Save button is coral

❌ Wrong:
- Multiple coral buttons on same screen
- Coral used for decorative elements
- Coral competing with itself

### The "Binding Rule"
**Cards have rounded corners on right, square on left (with binding strip).**

This creates the Moleskine page aesthetic and differentiates from generic cards.

### The "Texture Rule"
**Backgrounds have subtle paper grain, surfaces are clean white.**

- Page backgrounds: textured cream
- Card surfaces: clean white (content needs clarity)
- Never texture on text-heavy areas

### The "Typography Rule"
**Headings are serif (Libre Baskerville), UI is sans-serif (Inter).**

- Page titles: serif
- Card titles: serif
- Button text: sans-serif
- Body text: sans-serif

---

## Part 8: Future iOS Guidelines

When building native iOS app, translate these patterns:

| Web | iOS |
|-----|-----|
| `paper-grain` class | Custom UIView with CAGradientLayer noise |
| `NotebookCard` | Custom UITableViewCell with left binding CALayer |
| `RibbonButton` | Custom UIButton subclass with coral tintColor |
| CSS variables | Asset catalog named colors + UIColor extension |
| Libre Baskerville | Custom UIFont registration |
| Transitions | Core Animation with spring timing |
| Page stack shadow | CALayer shadowPath with offset |

### iOS-Specific Moleskine Elements
- Haptic feedback on button press (UIImpactFeedbackGenerator)
- Page curl transition for navigation (UIPageViewController)
- Leather texture on app icon edges
- Elastic band animation on pull-to-refresh

---

## Verification Checklist

After implementation, verify:

- [ ] Paper texture visible on page backgrounds
- [ ] Cards have binding edge on left
- [ ] Serif font used for headings
- [ ] Coral accent limited to one element per screen
- [ ] Teal used for navigation active states
- [ ] Shadows create page-stack depth
- [ ] Transitions feel smooth (200-400ms)
- [ ] Text contrast meets WCAG AA
- [ ] Mobile responsive (375px minimum)
- [ ] All buttons have hover/active states

---

## Files Summary

Create these new files:
1. `web/src/components/ui/notebook-page.tsx`
2. `web/src/components/ui/notebook-card.tsx`
3. `web/src/components/ui/ribbon-button.tsx`
4. `web/src/components/ui/secondary-button.tsx`
5. `web/src/components/ui/page-heading.tsx`
6. `web/src/components/ui/grading-button.tsx`

Update these existing files:
1. `web/src/app/globals.css`
2. `web/src/app/layout.tsx`
3. `web/src/app/page.tsx`
4. `web/src/app/review/page.tsx`
5. `web/src/app/capture/page.tsx`
6. `web/src/components/ui/index.ts`

---

*End of implementation guide*
