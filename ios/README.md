# Llyli iOS client

1. Open Xcode and create a new **App** project (SwiftUI, Swift) named `Llyli`.
2. Replace the generated sources with the files in `ios/Llyli/` (keep folder names; add a `Views` group if needed).
3. In `APIClient.swift`, set `baseURL` to your Flask server (e.g. `http://localhost:5000` for Simulator or `http://<your-mac-ip>:5000` for a device). Make sure the Flask app is running with `--host 0.0.0.0` for device testing.
4. Build and run in Simulator or on a physical iPhone on the same Wi‑Fi network. Login uses the same credentials as the web app.
