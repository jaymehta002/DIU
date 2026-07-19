# Setup — what needs action from you

This is a checklist, not a tutorial. Items marked **✅ already done** reflect the state of this
machine as of the last session — if you're on a fresh machine or after a reboot, treat everything
as unchecked.

## Prerequisites (one-time, manual)

- [ ] **Node.js** ≥ 20 installed (this machine has v22.23.1)
- [ ] **Docker Desktop** installed and the daemon *running* (menu bar icon, not just installed —
      `docker ps` must succeed). This machine has Docker 29.6.1 / Compose v5.3.0.
- [ ] **Expo Go** app installed on your phone (App Store / Play Store) — this is how you'll run the
      mobile app without a full native build
- [ ] Your phone and this Mac on the **same Wi-Fi network** (required for the mobile app to reach
      the backend — see the LAN IP section below)
- [ ] *(Optional, only if you want a simulator instead of a physical phone)* Xcode (for iOS
      Simulator) or Android Studio + an AVD (for Android emulator). **Neither is installed on this
      machine right now** — Claude could not verify the mobile app on a simulator for this reason
      and relied on you testing via Expo Go instead.

## 1. Backend (`backend/`)

- [ ] `cd backend && npm install`
- [ ] Confirm `backend/.env` exists with a `DATABASE_URL` (already present, points at
      `localhost:5432`)
- [ ] `docker compose up -d` — starts PostgreSQL 16 in a container
- [ ] `npx prisma migrate dev` — applies the schema (only needed once, or after schema changes)
- [ ] `npx prisma db seed` — populates 5 constituencies / ~200 booths / candidates / vote records
      (safe to re-run any time — it clears and reseeds)
- [ ] `npm run dev` — starts the API on `http://localhost:3000/api`

✅ **Already done this session**: Docker container `backend-postgres-1` is up and healthy, DB is
migrated and seeded, and the API was running on port 3000. If you're picking this up fresh (new
terminal session, reboot, etc.), the `npm run dev` process will have stopped — just restart it.

## 2. Web dashboard (`frontend-web/`)

- [ ] `cd frontend-web && npm install`
- [ ] Confirm `frontend-web/.env` has `VITE_API_URL="http://localhost:3000/api"` (already present —
      `localhost` is correct here since the browser runs on this same machine)
- [ ] `npm run dev` — starts on `http://localhost:5173`, open it in a browser

No further action needed beyond having the backend running — the web app requires nothing else
from you.

## 3. Mobile app (`mobile/`) — the part most likely to need your attention

- [ ] `cd mobile && npm install`
- [ ] **Set the LAN IP** in `mobile/.env`: `EXPO_PUBLIC_API_URL="http://<your-LAN-IP>:3000/api"`
  - This machine's current LAN IP is `192.168.1.18`, already set in `mobile/.env`.
  - **If you change networks or machines, this WILL be wrong and every request will silently
    fail to connect.** Get the current IP with `ipconfig getifaddr en0` (macOS Wi-Fi) and update
    both `mobile/.env` and re-check it matches what's in `mobile/.env.example` as the documented
    default.
  - `localhost` does **not** work here — your phone is a separate device from this Mac and
    `localhost` on the phone means the phone itself, not this machine. This is the single most
    common reason this kind of demo fails to connect.
- [ ] `npx expo start`
- [ ] Scan the QR code with the **Expo Go** app on your phone (same Wi-Fi network as this Mac)
- [ ] **Test the flow yourself** — Claude could not do this part:
  - Search for a booth by name or number → confirm results appear
  - Search something with no matches → confirm the empty state shows, not a blank/broken screen
  - Tap a result → confirm the detail screen loads (location, registered voters, votes cast,
    turnout %, candidate breakdown with the leading candidate visually distinguished)
- [ ] Send Claude the screenshots and tell it which platform you tested (Android or iOS) —
      `mobile/README.md` has a placeholder `## Platform tested` section waiting to be filled in

## Known gaps / things to be aware of

- **No iOS Simulator / Android emulator** on this machine — mobile verification depends on your
  physical device via Expo Go until one of those is installed.
- **Ports in use by this project**: `5432` (Postgres), `3000` (backend API), `5173` (web dev
  server), `8081` (Metro bundler for Expo). If something else on your machine already uses one of
  these, you'll get a confusing bind error — free the port or change the config.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Web app shows "Unable to reach the server" | Backend not running, or wrong `VITE_API_URL` |
| Mobile app can't connect at all | `EXPO_PUBLIC_API_URL` is set to `localhost` instead of a LAN IP, or phone isn't on the same Wi-Fi as this Mac |
| `docker compose up` hangs or errors | Docker Desktop isn't actually running — check the menu bar icon, not just that it's installed |
| `prisma migrate dev` fails | Postgres container isn't healthy yet — `docker ps` should show `(healthy)` before migrating |
| Expo QR code doesn't load anything on phone | Same Wi-Fi network check again, or corporate/guest Wi-Fi that isolates devices from each other (common on office networks) |
