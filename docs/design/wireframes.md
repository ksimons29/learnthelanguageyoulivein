# Wireframes: LLYI

## Overview & User Story Mapping

**Design Approach:** Design focuses on seamless integration into users' daily lives by providing intuitive, quick-access interfaces for capturing phrases and reviewing them in context. Target platforms include web and mobile to ensure accessibility across devices.

**User Story → Screen Mapping:**
- US-1: Quick Phrase Capture → Phrase Capture Screen
- US-2: Smart Cards with Audio → Smart Card Detail Screen
- US-3: Spaced Repetition System → Review Schedule Screen
- US-4: Tagging and Collections → Tag Management Screen
- US-5: Basic Progress Overview → Progress Dashboard Screen

## Screen Flow Diagram

Show the high-level navigation flow between screens:
```
[Home] → [Phrase Capture] → [Smart Card Detail] → [Review Schedule]
   ↓          ↓                  ↓
[Login]   [Tag Management]    [Progress Dashboard]
   ↓
[Dashboard]
```

## ASCII Wireframes

### 1. Landing/Home Screen
**User Stories Enabled:** [US-1, US-2]

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]     <Home> <Features> <Pricing>      [Sign In]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              Capture, Retain, and Master                    │
│         Transform language encounters into knowledge        │
│                                                             │
│              [Get Started Free →]  <Learn More>            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Feature 1         Feature 2         Feature 3             │
│  Icon/Image        Icon/Image        Icon/Image            │
│  Description       Description       Description           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Footer: <About> | <Contact> | <Terms> | <Privacy>        │
└─────────────────────────────────────────────────────────────┘

        ↓ User clicks [Get Started Free]

```

### 2. Authentication Screen (Enables US-1)

```
┌──────────────────────────────────────┐
│           [Logo]                     │
│                                      │
│        Sign Up / Log In              │
│                                      │
│  {Email................}             │
│  {Password.............}             │
│  [ ] Remember me                     │
│                                      │
│  [Log In / Sign Up →]                │
│                                      │
│  ─────────── OR ───────────          │
│                                      │
│  [Continue with Google]              │
│  [Continue with GitHub]              │
│                                      │
│  <Forgot password?>                  │
│  <Need an account? Sign up>          │
│                                      │
└──────────────────────────────────────┘

        ↓ After successful auth

```

### 3. Main Dashboard (Enables US-1, US-5)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Phrases> <Settings>    [User ▼]      │
├────────┬────────────────────────────────────────────────────┤
│        │                                                    │
│ [Nav]  │  Dashboard Overview                               │
│        │                                                    │
│ <Home> │  ┌──────────────┐  ┌──────────────┐             │
│ <Tags> │  │ Cards Added  │  │ Reviews Done │             │
│ <Stats>│  │     10       │  │     5        │             │
│        │  │   ↑ 2 Today  │  │   ↑ 1 Today  │             │
│        │  └──────────────┘  └──────────────┘             │
│        │                                                    │
│        │  Recent Activity                                  │
│        │  ┌────────────────────────────────────┐          │
│        │  │ Phrase 1            [Review Now]   │          │
│        │  │ Phrase 2            [Review Now]   │          │
│        │  │ Phrase 3            [Review Now]   │          │
│        │  └────────────────────────────────────┘          │
│        │                                                    │
│        │  [Capture New Phrase →]                           │
│        │                                                    │
└────────┴────────────────────────────────────────────────────┘

        ↓ User clicks [Capture New Phrase →]

```

### 4. Phrase Capture Screen (Enables US-1)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Phrases> <Settings>    [User ▼]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Capture a Phrase                                           │
│  {Enter phrase here.........................}               │
│  (Language: Detected ▼)                                     │
│  Translation: {Suggested translation here..............}    │
│                                                             │
│  [Capture Audio]  [Attach Image]                            │
│                                                             │
│  [Save Phrase →]                                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ Phrase saved, navigate to Smart Card Detail

```

### 5. Smart Card Detail Screen (Enables US-2)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Phrases> <Settings>    [User ▼]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Smart Card: Phrase 1                                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Phrase: "Hello"                                      │  │
│  │ Translation: "Hola"                                  │  │
│  │ Language: English                                    │  │
│  │ Context Sentence: "Hello, how are you?"              │  │
│  │ [Play Audio]                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Tags: [Add Tag]                                            │
│                                                             │
│  [Edit]  [Delete]                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ User clicks [Play Audio]

```

### 6. Review Schedule Screen (Enables US-3)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Phrases> <Settings>    [User ▼]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Scheduled Reviews                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Phrase 1: Due Today (5min)                            │  │
│  │ Phrase 2: Due Tomorrow                                │  │
│  │ Phrase 3: In 2 Days                                   │  │
│  │ [Begin Review Session →]                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [View All Scheduled Reviews]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ User clicks [Begin Review Session →]

```

### 7. Tag Management Screen (Enables US-4)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Phrases> <Settings>    [User ▼]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Manage Tags                                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ [Add New Tag]                                          │  │
│  │ Tag 1: Work                                            │  │
│  │ Tag 2: Social                                          │  │
│  │ Tag 3: Travel                                          │  │
│  │ [Delete]  [Edit]                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [Save Changes →]                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ User clicks [Add New Tag]

```

### 8. Progress Dashboard Screen (Enables US-5)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  <Dashboard> <Phrases> <Settings>    [User ▼]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Progress Overview                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Cards Added: 50                                       │  │
│  │ Reviews Completed: 30                                 │  │
│  │ Retention Rate: 85%                                   │  │
│  │ Active Streak: 5 Days                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  [View Detailed Progress →]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

        ↓ User clicks [View Detailed Progress →]

```

## Mobile Responsive Variations

### Landing Page (Mobile)

```
┌─────────────────────┐
│  [☰]   Logo  [User] │
├─────────────────────┤
│                     │
│    Capture & Retain │
│    Language Phrases │
│                     │
│  [Get Started]      │
│  <Learn More>       │
│                     │
│  ┌───────────────┐  │
│  │   Feature 1   │  │
│  │   Icon + Text │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │   Feature 2   │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │   Feature 3   │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

## Interactive States

### Button States
```
[Normal Button]  [Hover: underline]  [Disabled: gray]  [Loading: spinner]
```

### Form Validation
```
{Valid Input✓}   {Invalid Input✗ Error message}
```

## Design System Quick Reference

- **Primary Action:** [Button] style
- **Secondary Action:** <Link> style
- **Input Fields:** {Field Name..........} style
- **Dropdowns:** (Select Option ▼) style
- **Navigation:** Top bar or sidebar with <Links>
- **Cards:** Boxes with ┌─┐└┘ characters

---

**REMEMBER:** Generate VISUAL ASCII wireframes with boxes and layout diagrams, NOT textual descriptions. Every screen must be drawn using ASCII art. Use the founder's design inspiration if mentioned to inform the visual layout and components.