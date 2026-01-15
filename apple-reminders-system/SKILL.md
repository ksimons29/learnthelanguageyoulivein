---
name: apple-reminders-system
description: Operate Koos's Apple Reminders system using the connected MCP Reminders tools. Enforce Daily 5, This Week, Inbox capture, lane backlogs, and strict date rules. Keep Reminders quiet. Triggers include "reminders", "daily 5", "this week", "inbox", "add reminder", "check reminders", "what's on my list", "plan my day", "what should I work on".
allowed-tools:
  - mcp__apple-reminders__reminders_tasks
  - mcp__apple-reminders__reminders_lists
  - mcp__apple-reminders__calendar_events
  - mcp__apple-reminders__calendar_calendars
---

# Apple Reminders System

## Goal
Reminders stays quiet. You choose the day on purpose. Always make progress on VibeCode, Job, Capstone.

## Canonical lists in this Reminders setup
Use these exact list names unless the user says otherwise.

### Daily execution lists
* **Daily 5** - Today's committed list (exactly 5 items)
* **This Week** - The 7 day menu of next actions (max 15 items)
* **Inbox** - Capture only, must be emptied regularly

### Lane backlogs
Use the existing lists as the lane backlogs in this setup.
* **Job lane:** Opportunities
* **VibeCode lane:** Build School
* **Capstone lane:** CMU / Capstope
* **Friends and Music lane:** Music, Amigos and Sports
* **Portugal Admin lane:** Portugal Admin

### Other lists
These exist but are not part of the Daily 5 system unless explicitly requested.
* Routine
* Home group lists: Stuff to Buy, Shopping, Template Job Search

## Definitions

### Output only rule
Every reminder must be a visible output.
* **Valid outputs include:** sent, submitted, committed, drafted, scheduled
* **Invalid vague verbs include:** work on, continue, research

### List meanings

**Inbox**
* Capture only
* No dates
* No browsing during the day
* Must be emptied regularly into the right lane or into This Week

**Lane backlogs**
* Storage by area
* No dates
* Not for browsing during the day

**This Week**
* The 7 day menu of next actions
* No dates unless a real external deadline
* Maximum 15 items total

**Daily 5**
* Today's committed list
* Exactly 5 items
* The only list allowed to have Today dates

## Date rules
1. **Only Daily 5 can have Today dates.**
2. **Outside Daily 5, dates are allowed only for external deadlines.**
3. **If Today view is crowded, assume illegal dates exist and remove them.**

## Anchors
These are the only recurring timed items intended to appear in Today.
If anchors do not exist and the user asks, create them in Routine with daily repeat.
* 07:30 Up shower walk, no phone
* 08:20 Write Daily 5, start focus at 08:30
* 23:00 Shutdown, write 5 lines, pick first action tomorrow

## Focus rules until 13 Feb
VibeCode Lisboa is primary priority.

**Minimum weekly hours targets**
* VibeCode: 15 hours
* Job: 5 hours
* Capstone: 4 hours

When composing This Week or Daily 5, bias selection toward VibeCode outputs first, then Job, then Capstone.

**Daily 5 mix until 13 Feb**

Most weekdays:
* 1 Job output
* 3 VibeCode outputs
* 1 Capstone output twice per week, otherwise body or admin

Bad day fallback Daily 2:
* 1 Job micro output
* 1 VibeCode micro output

## How This Week gets populated

**Weekly build (Sunday evening or Monday morning, 15 minutes)**
1. Start with an empty This Week or trim it to max 15.
2. Promote from lane backlogs into This Week until you have:
   * VibeCode: 8 to 10 next actions
   * Job: 3 to 5 next actions
   * Capstone: 2 to 3 next actions
3. Every item must be a next action and an output.

**Daily maintenance (morning sort, 5 minutes)**
1. Empty Inbox
   * Not for this week: move to the correct lane backlog
   * For this week and already clear: move to This Week
   * Real external deadline: add date and flag
2. If This Week drops below 8 items, promote 1 to 3 items from lanes to refill

## If the user feels lost
1. Open Daily 5 and do the first item for 2 minutes.
2. If Daily 5 is empty, pull 1 item from This Week into Daily 5 and start.
3. If This Week is empty, promote 1 small VibeCode next action from its lane into This Week, then into Daily 5.

## Sanity checks
1. Today view should show only 3 anchors plus 5 Daily 5 items.
2. If This Week is over 15 items, user is avoiding decisions. Trim it.

## Safety rules
1. **Never delete reminders unless the user explicitly asks.**
2. **Never modify Home group lists unless explicitly asked.**
3. **When unsure which reminder to update, show the top 3 matches with IDs and ask which one.**

## MCP execution playbook
When performing operations, use the MCP Reminders tools.

**Always do this sequence for create or update:**
1. Resolve target list name exactly.
2. Search in that list for close title matches.
3. If one clear match exists, update instead of creating.
4. If none, create.
5. Confirm with a short summary: list, title, due or none, and any notes or tags.

**Field defaults**
* If no list specified: Inbox for capture, otherwise Daily 5 only when explicitly composing today.
* If no due date specified: none, except when user explicitly says Today for Daily 5 items.
* Notes can include short context and optional tags like #Admin #Work #Sport when user asks.

## Common operations

### Add to Inbox
```
User: "Add reminder to follow up with recruiter"
Action: Create in Inbox, no date
Confirm: "Added to Inbox: Follow up with recruiter"
```

### Build Daily 5
```
User: "Build my Daily 5"
Action:
1. Read This Week
2. Select 5 items following focus rules (1 Job, 3 VibeCode, 1 Capstone/other)
3. Move to Daily 5 with Today date
4. Show the list
```

### Empty Inbox
```
User: "Empty my Inbox"
Action:
1. Read Inbox items
2. For each, determine target lane or This Week
3. Move with appropriate list and clear any dates
4. Confirm summary
```

### Weekly build This Week
```
User: "Build This Week"
Action:
1. Read all lane backlogs
2. Promote 8-10 VibeCode, 3-5 Job, 2-3 Capstone items
3. Move to This Week with no dates
4. Show the list and count
```

### Check Today view
```
User: "What's on my Today list?"
Action:
1. Read Daily 5 items with Today date
2. Count items (should be 5)
3. List them in order
4. If not 5, note the discrepancy
```

### Find next action
```
User: "What should I work on?"
Action:
1. Check Daily 5 first
2. If empty, suggest pulling from This Week
3. Bias toward VibeCode items given current focus
```

## Output format
When showing lists, use this format:

```
Daily 5 (5 items):
1. ✓ Draft VibeCode homepage copy
2. ○ Submit Xing application
3. ○ Code navbar component for VibeCode
4. ○ Review Capstone chapter 3
5. ○ Update LinkedIn profile

This Week (12 items):
VibeCode (7):
• Build login page
• Write blog post outline
• Test payment flow
• ...

Job (3):
• Research Berlin startups
• ...

Capstone (2):
• Read chapter 4
• ...
```

Use ✓ for completed, ○ for pending.

## Priority order
When the user asks what to work on or needs direction:
1. **First:** Check Daily 5 - this is the commitment for today
2. **If Daily 5 empty:** Pull from This Week, preferring VibeCode (current priority)
3. **If This Week empty:** Promote from Build School (VibeCode lane)
4. **If truly stuck:** Ask user which lane feels most important right now

Remember: The system exists to make decisions easy, not to add overhead. Keep it moving.
