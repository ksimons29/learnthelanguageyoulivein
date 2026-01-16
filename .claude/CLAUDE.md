# LLYI

A mobile and web application that turns real life language into words people actually remember. Learners capture phrases from chats, emails, signs and conversations in a few seconds, and the app turns them into smart cards you can both read and listen to, with clear audio of how each phrase is pronounced. Reviews follow a proven spaced repetition system that keeps testing whether you still know a phrase and only shows it again when your brain is about to forget it.

## Quick Reference

### Bash Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
npm run test         # Run tests

# Database (if applicable)
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes
```

### Project Structure
```
docs/                # Project documentation (IMPORTANT - read these first)
├── product/         # Product requirements and vision
├── engineering/     # Technical architecture and implementation
└── design/          # Design system and wireframes
    ├── design-system.md  # ★ Moleskine design tokens & components (source of truth)
    ├── wireframes.md     # UI layouts and screen flows
    └── README.md         # Design system overview
prototypes/web/      # Visual mockups and screen references
web/                 # Next.js web application
├── src/
│   ├── app/         # Next.js App Router pages
│   ├── components/  # UI components (brand/, home/, notebook/, review/, ui/)
│   └── lib/         # Utility functions
└── public/          # Static assets and icons
assets/              # Source design files and examples
```

## Project Context

### Language Configuration
**Flexible multi-language support** (see `/web/src/lib/config/languages.ts`)

**Currently supported:**
- English (en) - TTS voice: 'alloy'
- Portuguese Portugal (pt-PT) - TTS voice: 'nova'
- Swedish (sv) - TTS voice: 'nova'
- Portuguese Brazil (pt-BR), Spanish (es), French (fr), German (de), Dutch (nl)

**Default preference:** English ↔ Portuguese (Portugal)

**Adding new languages:**
1. Add config to `SUPPORTED_LANGUAGES` in `/web/src/lib/config/languages.ts`
2. TTS and translation will automatically use the new config

### Target Customer
Adults who live or work in a country where the main language is not their first language and really want to remember what they learn. Think expats, international professionals and students who already know some basics but need to function in real life at work, with landlords, schools and friends. They use both phone and laptop all day, are motivated to improve, and are already trying language apps or flashcards but feel they are not truly remembering or using the phrases they meet in daily life.

### Value Proposition
Because it is built for people who actually want to remember the language they live in. Instead of a generic course, our web app lets users capture real phrases via text input and instantly turns them into smart cards they can both read and listen to, with high-quality native audio pronunciation. A proven spaced repetition system keeps testing whether they still know a phrase and only resurfaces it when they are close to forgetting, so reviews stay short but effective. Compared with Duolingo-style apps or manual Anki decks, this is faster to capture, easier to maintain and much closer to the situations they face every day, which makes it more motivating and leads to better long-term retention.

### Platform
**Version 1 (Current):** Responsive web application (mobile + desktop browsers)
**Version 2 (Planned):** Native iOS app with platform-specific features
**Version 3 (Future):** Native Android app

## Tech Stack

TypeScript, JavaScript, Next.js, React, Shadcn, Tailwind, shadcn/ui, Radix UI, React Hook Form, Zod, Drizzle, Stripe, Nextauth, Clerk, Aws, Vercel, DrizzleORM, NextAuth.js, Postgresql

## Key Documentation

**CRITICAL**: Before starting any work, familiarize yourself with the project documentation:

| Document | Purpose | When to Reference |
|----------|---------|-------------------|
| `/docs/design/design-system.md` | **★ Moleskine design tokens, CSS utilities, component patterns** | **Always for UI work** |
| `/docs/product/prd.md` | Feature specs, user stories, acceptance criteria | Before implementing any feature |
| `/docs/product/vision.md` | Problem statement, target users, goals, platform strategy | For strategic decisions |
| `/docs/engineering/implementation_plan.md` | Web architecture, tech stack, data model, API routes | Technical implementation |
| `/docs/design/wireframes.md` | UI layouts, screen flows, component placement | Building UI components |
| `/prototypes/web/SCREEN_ORDER.md` | Screen flow and mockup reference | Understanding user journey |
| `/docs/product/v2_native_ios_roadmap.md` | Future native iOS app plans | Understanding V2 roadmap |
| `/docs/product/business_model_canvas.md` | Revenue, costs, partnerships | Business logic decisions |

## Development Guidelines

### Code Style
- Use TypeScript for all code; prefer interfaces over types
- Use functional and declarative programming patterns
- Use descriptive variable names with auxiliary verbs (isLoading, hasAccess, canSubmit)
- Use lowercase-with-dashes for directories (components/user-profile)
- Favor named exports for components and utilities

### Before Implementing Features
1. Check design tokens in `/docs/design/design-system.md` for UI styling
2. Read the relevant user story in `/docs/engineering/implementation_plan.md`
3. Check acceptance criteria in `/docs/product/prd.md`
4. Reference wireframes in `/docs/design/wireframes.md` for UI guidance
5. Follow the data model and API routes in the implementation plan

### Error Handling
- Implement comprehensive error handling at all levels
- Use try-catch blocks for async operations
- Provide user-friendly error messages
- Log errors appropriately for debugging

## Current Focus

The **Version 1 Web MVP** focuses on these core capabilities:

- **Fast phrase capture:** Text input via mobile-optimized web interface (responsive design)
- **High-quality native audio:** Every phrase gets TTS-generated native pronunciation
- **Smart cards:** Display phrase, translation, context sentence with audio playback
- **Spaced repetition engine:** FSRS algorithm schedules reviews, tests active recall, and adapts to user performance
- **Progressive Web App (PWA):** Offline capabilities, installable on mobile devices
- **Cross-platform:** Works seamlessly on mobile browsers (iOS Safari, Android Chrome) and desktop

**Audio is a primary focus** for this MVP alongside the proven FSRS learning methodology.

See `/docs/engineering/implementation_plan.md` for the complete web development plan.
See `/docs/product/v2_native_ios_roadmap.md` for future native iOS app plans.

## Design System - Moleskine Aesthetic

The app uses a **"Moleskine notebook"** visual language. Key concepts:

- **Paper textures**: Cream backgrounds with SVG-based fiber grain (`.notebook-bg`)
- **Binding elements**: Cards have rounded right corners, square left with stitched binding (`.binding-edge-stitched`)
- **Signature accents**: Coral ribbon bookmark (`.ribbon-bookmark`), black elastic band (`.elastic-band`)
- **Typography**: Serif headings (`.heading-serif`), sans-serif UI, handwritten accents (`.handwritten`)
- **Color tokens**: Teal navigation (#0C6B70), Coral actions (#E85C4A), Cream paper (#F5EFE0)

**Design Rules**:
1. **Ribbon Rule**: Coral appears as ONE prominent element per screen
2. **Binding Rule**: Cards rounded on right, square on left (like notebook pages)
3. **Texture Rule**: Paper grain on backgrounds, clean white on interactive surfaces

See `/docs/design/design-system.md` for complete token reference and CSS utilities.

## Repository

https://github.com/ksimons29/learnthelanguageyoulivein

## Session Management

### Changelog Maintenance

**IMPORTANT**: At the end of every Claude Code session, add a summary to `CHANGELOG.md` in the project root.

#### What to Include
1. **Session date and title**: Clear identifier for the work done
2. **Session focus**: One-line description of the main goal
3. **What was done**: Bullet points of key accomplishments
4. **Files created/modified**: List of changed files with brief descriptions
5. **Key decisions**: Any important architectural or design choices made
6. **Next actions**: Follow-up tasks or next steps

#### Format
Follow the template provided in `CHANGELOG.md`. Keep entries concise but informative enough that future sessions can understand what was accomplished.

#### Why This Matters
- Maintains project continuity across sessions
- Helps track decision rationale over time
- Provides context for future Claude Code sessions or team members
- Creates audit trail for architectural and design choices

---

*Generated by [Confabulator](https://vibecodelisboa.com/confabulator)*
