# Llyli – Learn the Language You Live In

Turn the words you live with today into tomorrow’s vocabulary.

Llyli is a small, focused project to build an MVP for a language-from-life app.  
The core idea: capture real phrases you encounter in your daily life and review them with spaced repetition so they actually stick.

The functional spec lives in:

- `llyli_project.md` – full PRD for the MVP (problems, users, flows, SRS logic).

This repo is designed to host **two siblings**:

1. A **Flask + SQLite web app** (mobile-first, runs in any browser).
2. A **SwiftUI iOS app** (talks to the same backend via REST).

---

## Repo structure

Planned structure (some folders may appear after code generation):

```text
Learnthelanguageyoulivein/
├── llyli_project.md        # PRD – source of truth for the MVP
├── README.md               # This file
├── web/                    # Flask backend + web UI (MVP)
│   ├── app.py
│   ├── models.py
│   ├── srs.py
│   ├── requirements.txt
│   ├── templates/
│   └── static/
└── ios/                    # SwiftUI iOS client (MVP)
    ├── Llyli.xcodeproj
    └── Llyli/
        ├── LlyliApp.swift
        ├── APIClient.swift
        ├── Models.swift
        └── Views/
```

Use `llyli_project.md` as the reference whenever behavior or naming is unclear.

---

## 1. Web app (Flask + SQLite)

### 1.1. Prerequisites

- macOS
- Python 3.10+ (`python3 --version`)
- `pip` available

### 1.2. Setup

From the repo root:

```bash
cd web

# (Optional but recommended) create a virtual environment
python3 -m venv venv
source venv/bin/activate   # On macOS / Linux
# .\venv\Scripts\activate  # On Windows, if ever needed

# Install dependencies
pip install -r requirements.txt
```

### 1.3. Initialize the database

Depending on how `app.py` is implemented, one of these will apply:

```bash
# Option A – custom init script
python init_db.py

# Option B – first-run initialization inside app.py
python app.py  # or: flask run
```

Check the comments in `app.py` / `models.py` for the exact init command; the goal is to create an SQLite file like `llyli.db` in `web/`.

### 1.4. Run the server

From `web/`:

```bash
# If using a plain entrypoint
python app.py

# or if using Flask CLI
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
```

By default the app should be available at:

- http://localhost:5000

To test on iPhone:

1. Make sure your Mac and iPhone are on the same Wi-Fi.
2. Find your Mac’s IP address (e.g. `192.168.1.15`).
3. From Safari/Chrome on iPhone, open `http://192.168.1.15:5000`.

---

## 2. iOS app (SwiftUI)

The iOS app is a thin client that calls the Flask backend’s REST API and reuses its SRS logic.

### 2.1. Prerequisites

- Xcode 15+  
- iOS 17+ Simulator or physical iPhone

### 2.2. Open the project

From the repo root:

```bash
cd ios
open Llyli.xcodeproj
```

Xcode should open the project.

### 2.3. Configure the backend URL

In `APIClient.swift`, look for a `baseURL` constant, for example:

```swift
let baseURL = URL(string: "http://localhost:5000/api")!
```

- For Simulator: `http://127.0.0.1:5000/api` usually works.
- For a real iPhone device: use your Mac’s local IP, e.g.:

```swift
let baseURL = URL(string: "http://192.168.1.15:5000/api")!
```

(Keep the `/api` path aligned with however the Flask endpoints are defined.)

### 2.4. Run the app

1. Make sure the Flask server is running.
2. In Xcode, choose:
   - an iOS Simulator, **or**
   - your physical iPhone.
3. Press **Run**.

You should be able to:

- Log in / sign up.
- See dashboard stats.
- Add phrases.
- Start a review session and grade cards.

All logic for spacing reviews lives on the backend; the iOS client just sends grades and displays the next card.

---

## 3. Development workflow with AI (Codex / Copilot / ChatGPT)

This repo is designed to play nicely with AI coding tools:

- Use `llyli_project.md` as the **context file** when asking for changes to flows, entities, or SRS behavior.
- Point AI tools at:
  - `web/` when changing backend or templates.
  - `ios/` when changing the SwiftUI client.

Example meta-prompt for changes:

> “Read `llyli_project.md` and the existing code in `web/app.py` and `web/srs.py`.  
> Adjust the review route so it returns JSON for the iOS client as well as rendering HTML for the web client.  
> Keep behavior consistent with the SRS rules in the PRD.”

---

## 4. MVP scope

The first version focuses on:

- Fast capture of phrases (phrase + optional meaning + context tag).
- Simple but real SRS review loop (Again / Hard / Good / Easy).
- Minimal stats on the dashboard:
  - total cards
  - cards added in last 7 days
  - cards due today

Things that are **explicitly out of scope for now** (see PRD for details):

- Voice capture / speech recognition
- OCR from images
- Social / sharing features
- Complex settings for the SRS algorithm

---

## 5. Troubleshooting

- **App runs but can’t log in**  
  Check that the database is initialized and migrations (if any) have been applied.

- **iOS app can’t reach the backend**  
  - Confirm Flask is running and reachable from another device.
  - Double-check `baseURL` in `APIClient.swift`.
  - For physical devices, ensure Mac and iPhone share the same network.

- **Changes not reflected in browser**  
  Make sure Flask is running in development mode (auto-reload) or restart the server.

---

## 6. Next steps

Once the MVP is stable:

- Instrument basic analytics (signups, cards created, reviews done per day).
- Add a simple feedback form or “Report a bug / Suggest a feature” link.
- Start testing with real users (expats, students, language nerds) and iterate using the PRD as a baseline.

For any architectural or product changes, update `llyli_project.md` and then adapt this README if the setup flow changes.
