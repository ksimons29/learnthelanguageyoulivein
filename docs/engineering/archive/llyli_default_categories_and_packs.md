ye# LLYLI Default Categories, Starter Packs, Auto Categorization

## Goal
Reduce empty state friction while protecting the core promise:
"My words from my life" plus long term retention.

## Product Decision Summary
1. Ship with default situation categories as empty shells
2. Offer an optional starter pack during onboarding, opt in only
3. Provide auto categorization as a suggestion, never as an invisible decision

## Why Default Categories
Default categories solve the empty state and give the user a clear mental model:
"I capture words from my daily situations, then I review them."

Categories should be thematic and situational, not tight semantic clusters.

## Default Categories to Ship on Day 1
Use the same set for English, Portuguese, and Swedish.

1. Home
2. Food and drink
3. Shopping
4. Transport
5. Work
6. Social
7. Admin and paperwork
8. Health
9. Time and dates
10. Money
11. Emergencies
12. Daily actions

### Category Card Requirements
Each category card shows:
1. A one line prompt  
   Example: "Add words you saw at the supermarket today"
2. Placeholder examples  
   Show 3 example words as placeholder text only, not pre added words
3. Empty state CTA  
   Example: "Add your first word"

## Starter Packs That Fit the Positioning
Starter packs are optional. Never force them.

### Onboarding Prompt
"Want a quick boost? Add a small starter pack now, or skip and start with your own words."

### Recommended Starter Pack Options
1. Lisbon essentials
2. Workplace essentials
3. Apartment and utilities essentials
4. Doctor and pharmacy essentials

### Starter Pack Size and Content Rules
1. 20 to 40 items max
2. Mix nouns, verbs, and short phrases
3. Keep items practical and high frequency for expat life
4. Do not flood the first review session

### Scheduling Rule for Starter Pack Items
When a user opts in:
1. Add items as new
2. Introduce them gradually using the existing daily new words cap
3. Prioritize user captured words over starter pack items if both exist

## Auto Categorization That Will Not Annoy Users

### Capture Flow
User picks a category quickly, with help:
1. Show a fast category picker
2. Show top 2 suggested categories with confidence
3. Preselect the top suggestion but keep it editable

### Tagging Rules
1. Allow multiple tags per word
2. Allow zero tags  
   If user skips, store as Unsorted
3. Provide quick edit after capture

### Transparency Rule
For the first few times:
Show "Why this category" in small text  
Example: "Suggested because this word often appears in shopping contexts"

### Settings Rule
Do not add a "Always auto categorize" toggle in v1
Add it later once trust is established

## How Categories Should Influence Sentence Generation
Do not run full sessions as one category only.
That increases similarity interference and lowers long term retention.

### Correct Use of Categories
1. Use category as a context anchor per sentence
2. Still interleave categories across the session

### Simple Session Heuristic
For each generated sentence:
1. Pick the most overdue word
2. Try to add 1 to 3 more due words that share its category
3. Next sentence, deliberately pick a different category if possible

Result:
Coherence per sentence, variety per session.

## 7 Day Validation Experiment
Test whether default categories and starter packs improve activation without hurting real life capture.

### Variants
Variant A  
Default categories only, empty shells

Variant B  
Default categories plus opt in starter pack prompt

### Metrics
1. Time to first captured word
2. Words captured per user in week 1  
   Target: 10 words per user per week
3. Review adherence proxy  
   Did they complete at least 2 review sessions in 7 days

### Decision Rules
1. If starter packs increase activation and do not reduce real life capture, keep opt in and show it early
2. If starter packs increase activation but reduce real life capture, keep opt in but de emphasize it
3. If starter packs do not improve activation, remove from onboarding and keep as a later upsell
