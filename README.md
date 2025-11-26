# Llyli – MVP

Minimal web + iOS implementation for "Llyli – Learn the Language You Live In".

## Web app (Flask)
1. Install Python 3.10+.
2. Create a virtualenv:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install deps:
   ```bash
   cd web
   pip install -r requirements.txt
   ```
4. Database: the app initializes `llyli.db` on first run (stored in `web/`).
5. Run the server:
   ```bash
   python app.py        # or: flask run --host 0.0.0.0 --port 5000
   ```
6. Open http://localhost:5000 in the browser. For iPhone on the same Wi‑Fi, run with `--host 0.0.0.0` and use your Mac's IP as the base URL.

## iOS app (SwiftUI)
- Source files live in `ios/`.
- If no Xcode project exists, create a new SwiftUI iOS app named `Llyli` in Xcode, then replace the auto-generated files with the contents of `ios/Llyli/` (keep the `Views` folder structure).
- Update `baseURL` in `ios/Llyli/APIClient.swift` to point to your running Flask server (e.g. `http://192.168.0.10:5000`).
- Run in Simulator (localhost works) or on a device on the same network (use your Mac's IP, ensure the Flask server is started with `--host 0.0.0.0`).

## API outline
- Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`
- Cards: `GET/POST /api/cards`, `PUT/DELETE /api/cards/:id`
- Review: `GET /api/review/queue`, `POST /api/review/submit`
- Stats: `GET /api/stats/overview`

Passwords are hashed with Werkzeug; tokens are simple UUID-based session tokens shared between the web UI and API.
