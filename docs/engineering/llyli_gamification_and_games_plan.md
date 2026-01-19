# LLYLI gamification and games plan

## Context and current state

The current web MVP already has the right foundation for game like learning.

1. Review flow supports three exercise types with immediate feedback, and chooses difficulty dynamically based on mastery.
2. There is a notebook and category browsing, plus progress and onboarding.
3. Offline support and installable PWA work are in progress and already include offline review queueing, plus audio caching.

Source

1. PRD review flow, done for today, and optional extra learning after completion.
2. Changelog for review flow components and PWA offline queue.

## What gamification should mean for LLYLI

LLYLI should treat gamification as an engagement wrapper around proven learning mechanics, not as a point economy.

Design targets

1. Make the review session feel meaningful, short, and complete.
2. Make progress visible at the right granularity: today, week, and mastery.
3. Add variety and interestingness without increasing cognitive load.
4. Keep autonomy: users can stop after daily completion, or optionally continue.

## Research anchored principles to use

1. Entertainment value matters. Sentences that form a story and vary complexity keep interestingness.
2. Natural stopping points like done for today drive a sense of accomplishment.
3. Voluntary progression after daily completion supports high motivation users without punishing everyone.
4. Structured reminders for short daily sessions help habit formation.
5. Ten word rule reduces overload.
6. Immediate corrective feedback supports perceived effectiveness.

## Recommended game types to add

All games below reuse your existing exercise types, so they stay aligned with retrieval practice.

### Game 1 Story run

What it is

A daily micro story that unfolds line by line as the user completes review items. Each sentence already exists as your generated content. The game layer simply frames the session as completing a chapter.

How it uses existing mechanics

1. Each reviewed sentence is one story line.
2. Completion screen shows chapter complete plus recap of words reviewed.

Why it fits

It directly implements entertainment value and interestingness.

### Game 2 Bingo board

What it is

A 3 by 3 daily bingo board with squares tied to learning behaviors.

Example squares

1. Review 5 due words
2. Get 3 correct in a row
3. Complete one fill blank
4. Complete one multiple choice
5. Complete one type translation
6. Review a word from work
7. Review a word from social
8. Master one word
9. Finish daily session

Why it fits

It creates variety without changing the learning content.

### Game 3 Boss round

What it is

A short final round of 60 to 90 seconds at the end of the session.

Rules

1. Only multiple choice and fill blank.
2. Pull from words that were incorrect earlier in the session, or hardest grades.
3. Cap at 5 items.

Why it fits

It is high intensity but short. It increases perceived challenge without adding new content types.

### Game 4 Category hunt

What it is

A weekly quest that nudges capture and review in under used categories.

Examples

1. Add 3 words to daily life this week
2. Review 10 social words this week

Why it fits

It uses your existing category system and capture loop.

### Game 5 Real life mission check in

What it is

A light self report prompt after done for today.

Examples

1. Use one reviewed word in a real sentence today
2. Use one word in a message

The user taps yes or not yet.

Why it fits

It reinforces transfer to real world usage without forcing a social feature.

## What to avoid for now

1. Leaderboards and heavy social comparison.
2. Complex currencies, stores, and random loot boxes.
3. Anything that increases session length by default.

## MVP build order

Week 1

1. Bingo board
2. Boss round

Week 2

1. Story run frame and recap
2. Category hunt

Week 3

1. Real life mission check in

## Implementation plan for Claude Code

### Data model additions

Add tables that are easy to query and safe to cache.

1. daily_game_state
   a. user_id
   b. date
   c. bingo_state json
   d. boss_round_enabled boolean
   e. story_seed optional string
   f. completed_at timestamp

2. weekly_hunt
   a. user_id
   b. week_start_date
   c. target_category
   d. capture_target_count
   e. review_target_count
   f. progress_captures
   g. progress_reviews

3. real_life_mission_log
   a. user_id
   b. date
   c. mission_type
   d. status yes no

### API endpoints

1. GET api games state
   returns daily state plus weekly hunt

2. POST api games bingo update

3. POST api games boss start
   returns the item list for the boss round

4. POST api games mission log

### UI changes

Home and progress

1. Add a small daily game card under due count
2. Show bingo board status and a start button

Review session

1. Add a session state object that tracks streak of correct answers and exercise types completed
2. On session completion, trigger boss round if enabled and if user opts in

Done for today screen

1. Add chapter complete header when story mode is on
2. Add real life mission check in

### Claude Code task sequence

Task 1

1. Create the three tables in your existing database migration pattern.
2. Add a server side helper to compute today date and week start date consistently.
3. Add API route for GET state.

Acceptance

1. GET returns stable json for new user and existing user.

Task 2

1. Implement bingo board UI component.
2. Implement bingo update logic triggered by review session events.

Acceptance

1. Completing actions updates the board immediately.

Task 3

1. Implement boss round generator using existing due or wrong in session items.
2. Add a boss round intro modal and run the existing exercise components.

Acceptance

1. Boss round runs in less than 2 minutes and ends cleanly.

Task 4

1. Implement story run framing.
2. Persist story_seed and reuse it for the day.

Acceptance

1. Story title and recap show on done for today.

Task 5

1. Implement weekly hunt.
2. Show progress bar in home.

Acceptance

1. Weekly hunt rolls over at week start.

Task 6

1. Implement real life mission check in.
2. Add a simple streak of mission completion on progress page.

Acceptance

1. Mission log is stored and visible.

### Testing

1. Add unit tests for bingo evaluation and boss list selection.
2. Add manual QA cases for offline flow, ensuring updates queue when offline.

## Metrics

1. Daily review completion rate
2. Return rate day 2 and day 7
3. Median session duration
4. Words mastered per week
5. Opt in rate for bonus modes

## Competitive positioning

These games compete on three things.

1. Duolingo like energy without turning into a grind. Your advantage is real life capture and notebook feel.
2. Anki level spacing with a friendlier loop. Your advantage is zero setup and sentence first review.
3. A clear daily completion loop that respects adults: short, done, optional extra.

## MVP scope for gamification layer v1

Ship a thin layer first. Do not build a full currency store.

MVP v1 features

1. Daily completion card with a clear goal and done for today state.
2. One game mode selector inside the review session: Classic, Story run, Boss round.
3. Bingo board as a visual overlay on top of the same session events.
4. Streak and weekly streak protection rules that are forgiving.

## Data you need to store

Keep it minimal.

1. DailyProgress
   1. user_id
   2. date
   3. target_reviews
   4. completed_reviews
   5. completed_at
   6. game_mode_used

2. StreakState
   1. user_id
   2. current_streak
   3. last_completed_date
   4. streak_freeze_count

3. BingoState
   1. user_id
   2. date
   3. squares_json

4. StoryRunState
   1. user_id
   2. date
   3. story_id
   4. lines_unlocked

## Event hooks you need in the client

You already have review session state. Add explicit events so games can listen.

Core events

1. session_started
2. item_shown
3. item_answered with correctness and exercise_type
4. item_completed
5. session_completed
6. daily_goal_completed

## Implementation plan for Claude Code

This is written so you can paste it into Claude Code as a task list.

### Step 0 Inventory the current code

Tasks

1. Locate the current review session state manager and where the 3 exercise types live.
2. Locate where mastery is computed and stored.
3. Locate the done for today logic if present, or where it should be added.
4. Identify the API route that returns due reviews and accepts review results.

Acceptance criteria

1. You can name the exact files that own review session state, due item fetch, and review submit.

### Step 1 Add tables and migrations

Tasks

1. Add the four tables above in your schema using the same ORM pattern you already use.
2. Add indexes on user_id and date for the daily tables.
3. Add a migration and run it locally.

Acceptance criteria

1. Local db has the new tables.
2. Existing flows still work.

### Step 2 Add server endpoints

Add a small API surface.

1. GET api gamification state for today
   Returns daily progress, bingo, streak, and story run state.
2. POST api gamification event
   Accepts one event payload and updates the related state.

Acceptance criteria

1. Hitting GET returns a correct empty state for a new user.
2. Posting a session_completed event updates streak and daily completion.

### Step 3 Add a gamification event bus in the client

Tasks

1. Implement a single client side function emitGameEvent that posts to the server and also updates local UI.
2. Call it from the existing review flow at the six event points above.

Acceptance criteria

1. You can see events arriving in the server logs for a full review session.

### Step 4 Implement game modes

#### Mode A Classic

No extra UI.

#### Mode B Story run

Tasks

1. Add a StoryRunPanel that shows the current chapter header and unlocked lines.
2. On item_completed unlock one new story line.
3. On session_completed show chapter complete.

Acceptance criteria

1. Story lines unlock only when the user finishes items.
2. If the user leaves and returns, state is restored from the server.

#### Mode C Boss round

Tasks

1. Track the hardest items in the session.
2. After daily goal completion, prompt start boss round.
3. Boss round reuses the existing exercise components.

Acceptance criteria

1. Boss round never exceeds 5 items.
2. Boss round only uses items already seen in the session or recently failed.

### Step 5 Bingo board

Tasks

1. Render a 3 by 3 bingo grid on the home screen and optional overlay in session.
2. Update squares based on events.
3. Mark bingo complete when 3 in a row.

Acceptance criteria

1. Bingo squares can be completed without any new learning task types.

### Step 6 Metrics

Track only what matters.

1. D1, D7, D30 retention
2. Daily session completion rate
3. Average session length
4. Voluntary extra session rate
5. Review accuracy by exercise type

## Rollout rules

1. Start with an opt in toggle for game modes.
2. Default everyone to Classic.
3. A B test Story run and Boss round.

## What to avoid

1. Heavy currency stores and loot boxes.
2. Leaderboards as a core mechanic.
3. Punitive streak loss.
4. Too many animations.
