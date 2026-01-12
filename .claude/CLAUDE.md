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
confabulator/        # Project documentation (IMPORTANT - read these first)
├── PRD.md           # Product requirements and features
├── project-vision.md # Vision and problem statement
├── implementation-plan.md # Technical architecture and roadmap
├── wireframes.md    # UI/UX wireframes and screen flows
├── business-model-canvas.md # Business model
└── PR-FAQ.md        # Press release and FAQ
src/                 # Source code
├── app/             # Next.js app router (if applicable)
├── components/      # UI components
├── lib/             # Utility functions and services
└── types/           # TypeScript types
```

## Project Context

### Target Customer
Adults who live or work in a country where the main language is not their first language and really want to remember what they learn. Think expats, international professionals and students who already know some basics but need to function in real life at work, with landlords, schools and friends. They use both phone and laptop all day, are motivated to improve, and are already trying language apps or flashcards but feel they are not truly remembering or using the phrases they meet in daily life.

### Value Proposition
Because it is built for people who actually want to remember the language they live in. Instead of a generic course, our app lets users capture real phrases from chats, emails, signs and conversations in a couple of taps and instantly turns them into smart cards they can both read and listen to, with clear native audio. A proven spaced repetition system keeps testing whether they still know a phrase and only resurfaces it when they are close to forgetting, so reviews stay short but effective. Compared with Duolingo-style apps or manual Anki decks, this is faster to capture, easier to maintain and much closer to the situations they face every day, which makes it more motivating and leads to better long-term retention.

### Platform
mobile

## Tech Stack

TypeScript, JavaScript, Next.js, React, Shadcn, Tailwind, shadcn/ui, Radix UI, React Hook Form, Zod, Drizzle, Stripe, Nextauth, Clerk, Aws, Vercel, DrizzleORM, NextAuth.js, Postgresql

## Key Documentation

**CRITICAL**: Before starting any work, familiarize yourself with the Confabulator documentation in `confabulator/`:

| Document | Purpose | When to Reference |
|----------|---------|-------------------|
| `PRD.md` | Feature specs, user stories, acceptance criteria | Before implementing any feature |
| `project-vision.md` | Problem statement, target users, goals | For strategic decisions |
| `implementation-plan.md` | Architecture, tech stack, data model, API routes | Technical implementation |
| `wireframes.md` | UI layouts, screen flows, component placement | Building UI components |
| `business-model-canvas.md` | Revenue, costs, partnerships | Business logic decisions |

## Development Guidelines

### Code Style
- Use TypeScript for all code; prefer interfaces over types
- Use functional and declarative programming patterns
- Use descriptive variable names with auxiliary verbs (isLoading, hasAccess, canSubmit)
- Use lowercase-with-dashes for directories (components/user-profile)
- Favor named exports for components and utilities

### Before Implementing Features
1. Read the relevant user story in `confabulator/implementation-plan.md`
2. Check acceptance criteria in `confabulator/PRD.md`
3. Reference wireframes in `confabulator/wireframes.md` for UI guidance
4. Follow the data model and API routes in the implementation plan

### Error Handling
- Implement comprehensive error handling at all levels
- Use try-catch blocks for async operations
- Provide user-friendly error messages
- Log errors appropriately for debugging

## Current Focus

The MVP focuses on these core capabilities:

- •	Fast capture of real-life phrases from mobile (share from WhatsApp, browser, other apps) and manual add
- •	Smart cards that show the phrase, translation, context sentence and allow the user to listen to high quality audio
- •	Proven spaced repetition engine that schedules reviews, tests active recall and adapts to how well the user remembers each card

See `confabulator/implementation-plan.md` for the complete development roadmap.

## Repository

https://github.com/ksimons29/learnthelanguageyoulivein

---

*Generated by [Confabulator](https://vibecodelisboa.com/confabulator)*
