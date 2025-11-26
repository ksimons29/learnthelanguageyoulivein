# PRD: Llyli – Learn the Language You Live In – MVP v0.1

## 0. Overview

**Product name (working):** Llyli – Learn the Language You Live In  
**Tagline:** Turn the words you live with today into tomorrow’s vocabulary.  
**Version:** MVP v0.1 – “Phrase Inbox + Simple SRS”  
**Primary platform for MVP:** Web app (responsive, mobile-first). Native apps later.

### One-line concept

A lightweight web app where people living in a foreign-language country can quickly capture phrases they run into during the day and review them later with a simple spaced repetition loop.

---

## 1. Problem & Users

### Problem

People living in a new country constantly see words and phrases they don’t understand (signs, chats, admin letters, WhatsApp). They either:

- don’t capture them at all, or  
- dump them into Notes or Photos with no system to turn them into learnable vocabulary.

Result: a growing pile of unstructured snippets and no steady progress toward “I can actually say and understand this in real life.”

### Primary user

- Adult living in a foreign-language environment (expat, international student, remote worker).
- Already motivated, understands that vocabulary and recall are key.
- Familiar with basic flashcards (for example Anki, Duolingo) but finds them impersonal or too rigid.

### Core job story

> When I’m in a new place and keep running into words I don’t know, I want to quickly capture and review the ones that matter to me, so I can use them as soon as possible, without wasting time on irrelevant content.

---

## 2. Goals & Non-goals

### Product goals (MVP)

1. **Make capture effortless**  
   User can add a phrase in under 10 seconds on mobile.

2. **Create a minimal but real SRS loop**  
   User can review “due” phrases in 5–10 minute sessions, with spaced repetition based on their performance.

3. **Show progress and nudge gently**  
   User can see how many phrases they’ve added, how many are due, and get a simple daily nudge if they haven’t reviewed.

4. **Keep architecture simple**  
   This should be buildable by a solo dev or small team in a few weeks.

### Non-goals (explicitly out of scope for MVP)

- No voice recording or automatic speech recognition.
- No OCR from images.
- No multi-language support (assume one target language per user; store it as metadata only).
- No social features (sharing decks, leaderboards).
- No advanced SRS tuning UI. Use a fixed, simple algorithm.

---

## 3. MVP Scope – User Stories

### Capture

1. **Add phrase (must-have)**  
   As a user, I can quickly add a new phrase with:
   - Target language phrase (required)
   - My translation or notes (optional)
   - Context tag (select from small fixed list, optional)

2. **Edit or delete phrase (must-have)**  
   As a user, I can edit or delete a phrase I added earlier.

### Review

3. **Review due phrases (must-have)**  
   As a user, I can start a “Review” session that:
   - Shows only cards that are due today.
   - Prompts me with the front side.
   - Lets me reveal the back side.
   - Asks me how well I remembered it (for example “Again / Hard / Good / Easy”).

4. **See daily workload (must-have)**  
   As a user, I can see how many cards are due today before I start.

### Progress and Nudges

5. **See basic stats (must-have)**  
   As a user, I can see:
   - Total number of phrases in my deck.
   - Number of phrases added in the last 7 days.
   - Number of cards due today (and how many I’ve already done today).

6. **Daily reminder (nice but small)**  
   As a logged-in user, if I haven’t done any review by a configurable time (for example 20:00 local), I receive a single reminder email.  
   If email infrastructure is too heavy for this release, this becomes an in-app banner only.

### Account and Data

7. **Sign up and sign in (must-have)**  
   As a user, I can create an account (email and password) and sign in to access my data.

8. **Log out (must-have)**  
   As a user, I can log out of the web app.

---

## 4. User Flows (High-level)

### Flow A – First-time setup

1. User lands on marketing or landing page and clicks “Get started”.
2. Sign-up with email and password.
3. Optional: choose target language from dropdown (store but no functional impact for MVP).
4. User lands in empty state Dashboard with:
   - “Add your first phrase” primary call-to-action.
   - Short explanation of capture → review loop.

### Flow B – Capture phrase

1. From any screen, user taps “+ Add phrase”.
2. Modal or dedicated page:
   - Input: `Phrase` (required, text).
   - Input: `Meaning / translation` (optional).
   - Dropdown: `Context` (Admin, Work, Social, Transport, Other).
3. Click “Save”:
   - Card is created with initial SRS state (for example due now).
   - User sees a confirmation and remains on page or returns to previous screen.

### Flow C – Daily review session

1. On Dashboard, user sees “You have 12 cards to review today” and a “Start review” button.
2. Tap “Start review”.
3. Card view:
   - Show front side (by default: phrase in target language).
   - Optional: show context tag badge.
   - Button: “Show answer”.
4. After “Show answer”:
   - Show back side (meaning or translation plus context).
   - User chooses one of: “Again”, “Hard”, “Good”, “Easy”.
5. Based on response, the next review date for that card is updated.
6. Next due card appears until:
   - No more due cards for today → show completion screen (“All done for today”).
   - User chooses to exit session early → remaining due count updates on Dashboard.

---

## 5. Functional Requirements

### 5.1 Entities

#### User

- `id` (UUID)  
- `email`  
- `password_hash`  
- `created_at`  
- `target_language` (string, for example `pt-PT`)  
- `timezone` (string, for example `America/Toronto`)

#### Card

- `id` (UUID)  
- `user_id` (foreign key)  
- `phrase` (string, required)  
- `meaning` (string, optional)  
- `context_tag` (enum: `admin`, `work`, `social`, `transport`, `other`)  
- `created_at`  
- `updated_at`  
- `next_review_at` (datetime, nullable)  
- `interval_days` (int, default 0 or 1)  
- `easiness_factor` (float, default for example 2.5)  
- `repetition` (int, number of successful reviews in a row)  
- `suspended` (boolean, default false)

#### ReviewLog

- `id` (UUID)  
- `card_id` (foreign key)  
- `user_id` (foreign key)  
- `reviewed_at` (datetime)  
- `grade` (enum: `again`, `hard`, `good`, `easy`)

### 5.2 SRS Algorithm (MVP version)

Simplified SM-2 style:

On creation:

- `repetition = 0`  
- `interval_days = 0`  
- `easiness_factor = 2.5`  
- `next_review_at = now`  

On review:

- Map grades to quality:
  - `again` → `0`
  - `hard` → `3`
  - `good` → `4`
  - `easy` → `5`

- If quality < 3 (that is “again”):
  - `repetition = 0`
  - `interval_days = 1`

- Else:
  - If `repetition == 0` → `interval_days = 1`
  - Else if `repetition == 1` → `interval_days = 3`
  - Else → `interval_days = round(interval_days * easiness_factor)`
  - `repetition += 1`
  - Update `easiness_factor`:
    - `EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))`
    - Enforce minimum EF: `1.3`

- Set `next_review_at = now + interval_days`.

### 5.3 Core APIs (suggested)

These are indicative for an AI coding agent; adjust as needed.

#### Auth

- `POST /api/auth/signup`  
  Input:  
  ```json
  { "email": "...", "password": "...", "target_language": "pt-PT", "timezone": "America/Toronto" }
  ```  
  Output:  
  ```json
  { "user": { }, "token": "..." }
  ```

- `POST /api/auth/login`  
  Input:  
  ```json
  { "email": "...", "password": "..." }
  ```  
  Output:  
  ```json
  { "user": { }, "token": "..." }
  ```

- `POST /api/auth/logout`  
  Input: auth token in header.  
  Output: status 204.

#### Cards

- `GET /api/cards`
  - Query params: optional `context_tag`, `search`
  - Output: list of user’s cards.

- `POST /api/cards`
  - Input:
    ```json
    { "phrase": "...", "meaning": "...", "context_tag": "admin" }
    ```
  - Behaviour:
    - Create card with initial SRS state.
  - Output: created card.

- `PUT /api/cards/:id`
  - Input: any subset of:
    ```json
    { "phrase": "...", "meaning": "...", "context_tag": "work" }
    ```
  - Output: updated card.

- `DELETE /api/cards/:id`
  - Output: status 204.

#### Review

- `GET /api/review/queue`
  - Query params: none (use user timezone).
  - Behaviour:
    - Return up to N (for example 50) cards where `next_review_at <= now` and `suspended = false`.
  - Output: array of card objects (front and back fields).

- `POST /api/review/submit`
  - Input:
    ```json
    { "card_id": "uuid", "grade": "good" }
    ```
  - Behaviour:
    - Log review.
    - Recalculate SRS fields.
  - Output: updated card object.

#### Stats

- `GET /api/stats/overview`
  - Output:  
    ```json
    {
      "total_cards": 123,
      "cards_added_last_7_days": 42,
      "due_today": 18,
      "reviewed_today": 10
    }
    ```

---

## 6. UX and Screens (Wireframe-level)

### Screen 1 – Landing / Marketing (optional for MVP)

- Simple one-page layout.
- Value proposition and one screenshot or mock.
- Primary call-to-action: “Get started” → sign-up.

### Screen 2 – Sign-up / Login

- Email and password fields.
- Toggle between “Sign up” and “Log in”.
- After success redirect to Dashboard.

### Screen 3 – Dashboard

Elements:

- Header:
  - Llyli logo or name.
  - Profile menu with “Logout”.
- Primary panel:
  - “You have X cards due today”.
  - Button: “Start review”.
- Secondary panel:
  - “Total phrases: N”.
  - “Added last 7 days: M”.
- Tertiary area:
  - Button: “Add phrase”.
  - Optional list of last 5 phrases.

Empty state when no cards yet:

- Message: “No phrases yet.”
- Call-to-action: “Add your first phrase.”

### Screen 4 – Add / Edit Phrase

Fields:

- `Phrase` (text input, required)  
- `Meaning / translation` (textarea, optional)  
- `Context` (dropdown: Admin, Work, Social, Transport, Other)  
- Buttons: “Save” and “Cancel`

### Screen 5 – Review Session

View 1: Question

- Main area shows phrase (target language).
- Optional context tag badge.
- Button: “Show answer”.

View 2: Answer

- Shows phrase and meaning.
- Shows buttons: “Again”, “Hard”, “Good”, “Easy”.
- Progress indicator such as “Card 3 of 12”.

Completion screen:

- Text: “You’re done for today!”
- Show simple summary: total reviewed, maybe a small celebration icon.
- Button: “Back to dashboard”.

---

## 7. Progress and Nudges – MVP Implementation

### In-app nudges

- Dashboard always shows “due today” count.
- If user has due cards and has not started review today:
  - Show a subtle banner such as “You have X phrases waiting. Do 5 now?”

### Email reminder (optional for MVP)

If implemented:

- Daily scheduled job at 20:00 in user’s timezone:
  - For each user with `due_today > 0` and `reviewed_today == 0`:
    - Send a single email with subject like “Review your phrases for today (X due)”.

- Settings:
  - Simple toggle in user profile:
    - “Send me a daily email reminder” (default: ON).

If not implemented yet:

- Use only the in-app banner and keep email reminder as a later feature.

---

## 8. Non-functional Requirements

- **Security**
  - Passwords hashed securely (bcrypt or equivalent).
  - All authenticated endpoints require token (JWT or session).

- **Performance**
  - Dashboard loads in under about 1 second on a typical broadband connection.
  - Review queue query returns in under about 500 ms.

- **Reliability**
  - If review submission fails due to network:
    - Keep the card on screen.
    - Show an error message.
    - Do not silently progress to the next card.

- **Scalability (for MVP)**
  - Assume low initial load (hundreds of users).
  - Single database instance is enough.

---

## 9. Analytics and Events (minimal)

Track at least:

- `user_signed_up`  
- `card_created`  
- `review_started`  
- `review_graded` (with grade)  
- `review_session_completed` (when no due cards remain)  
- `email_reminder_sent` (if email is implemented)  
- `login` (for active user count)  

Implementation can be simple (server-side logs or a basic event table). A full analytics platform is not required for MVP.

---

## 10. Acceptance Criteria (MVP v0.1)

1. A new user can sign up, log in, and log out.  
2. A logged-in user can add at least three phrases and see them listed.  
3. A logged-in user can start a review session and:
   - See only cards with `next_review_at <= now`.
   - Review them sequentially.
   - Submit a grade for each and see `next_review_at` update.  
4. When all due cards are reviewed:
   - Starting a new review shows a “No cards due” message.  
5. Dashboard shows:
   - Total cards.
   - Cards added in last 7 days.
   - Cards due today.  
6. Stats and review counts update correctly after adding or reviewing.  
7. Data is persisted across sessions and devices (user can log in from another browser and see their deck).  

---

## 11. Future Enhancements (explicitly not for v0.1)

- Voice capture: record audio and transcribe to create cards.  
- Photo capture with OCR to extract text from menus, signs, screenshots.  
- “Context packs” or missions for specific upcoming events (doctor, landlord).  
- Sharing and export:
  - Export cards as CSV.
  - Sync to Anki.  
- Offline-first behavior (Progressive Web App).  
- Multi-language support for target and source languages.  
- Customizable card templates:
  - Cloze deletions.
  - Sentence plus audio.  

---

## 12. Implementation Brief for an AI Coding Agent

When handing this PRD to Codex or a similar coding agent, you can add:

> Build a simple full-stack web app that implements MVP v0.1 of **Llyli – Learn the Language You Live In** according to this PRD.  
> Use:  
> - Backend: Node.js with Express and PostgreSQL (or similar relational database).  
> - Frontend: React single-page app with basic routing and mobile-friendly layout.  
> - Auth: JWT-based authentication.  
> Focus on correctness and clarity over styling and use plain CSS or a light utility framework.
