<img width="1459" height="719" alt="Screenshot 2026-07-19 at 10 48 05 PM" src="https://github.com/user-attachments/assets/5e39c5b1-adf8-4ade-bd56-58b2cd70d995" /># Election Data Platform

A three-part system for browsing and looking up election data (constituencies, polling booths,
candidates, vote records):

| App | Path | Stack | Purpose |
|---|---|---|---|
| **Backend** | [`backend/`](backend/) | Express + Prisma + PostgreSQL + TypeScript | REST API, DB schema, seed data |
| **Web dashboard** | [`frontend-web/`](frontend-web/) | Vite + React + TypeScript + React Router + recharts | Analytics team: cross-constituency overview, constituency drill-down, charts |
| **Mobile app** | [`mobile/`](mobile/) | Expo + React Native + TypeScript | Field staff: search a booth, view its details |

Both frontends are pure API consumers — no mocked data, no duplicated business logic. They share
the same response envelope and type shapes, documented once in [`backend/API.md`](backend/API.md).

## How the pieces fit together

```
                 ┌─────────────────┐
                 │   PostgreSQL     │  (Docker container, port 5432)
                 │   (Docker)       │
                 └────────▲─────────┘
                          │ Prisma
                 ┌────────┴─────────┐
                 │  backend (:3000) │  Express REST API
                 └───┬──────────┬───┘
         localhost:3000/api   LAN-IP:3000/api
                 │              │
      ┌──────────▼──────┐  ┌────▼─────────────┐
      │  frontend-web    │  │  mobile (Expo)    │
      │  (:5173, browser)│  │  (phone/emulator) │
      └──────────────────┘  └───────────────────┘
```

The web app runs in a browser on the same machine as the backend, so it talks to `localhost`. The
mobile app runs on a separate device (phone or emulator), so it **must** use the backend machine's
LAN IP instead — see [Environment variables](#environment-variables) below for why this trips
people up.

## Environment variables

Each component reads its own `.env`, copied from that component's `.env.example`:

```bash
cp backend/.env.example backend/.env
cp frontend-web/.env.example frontend-web/.env
cp mobile/.env.example mobile/.env
```

### `backend/.env`

| Variable | Purpose | Local value |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | `postgresql://postgres:postgres@localhost:5432/election_db?schema=public` — matches `docker-compose.yml` as-is, no change needed |
| `PORT` | Port the API listens on | `3000` |
| `NODE_ENV` | `development` \| `test` \| `production` | `development` |
| `CORS_ORIGINS` | Comma-separated origins allowed to send credentialed requests | `http://localhost:5173,http://localhost:19006` (web dev server + Expo web) |
| `JWT_SECRET` | Signs/verifies login session tokens — **required, no default, server refuses to start without it** | generate your own long random string |
| `JWT_EXPIRES_IN` | How long a login session/token lasts | `24h` |
| `MOBILE_API_KEY` | Shared service credential accepted as an `X-API-Key` header, alternative to a user login for non-interactive callers — **required, no default** | generate your own long random string |

### `frontend-web/.env`

| Variable | Purpose | Local value |
|---|---|---|
| `VITE_API_URL` | Backend API base URL the browser calls | `http://localhost:3000/api` — correct as-is, since the browser and backend run on the same machine |

### `mobile/.env`

| Variable | Purpose | Local value |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Backend API base URL the app calls | **must be your machine's LAN IP**, e.g. `http://192.168.1.18:3000/api` — *not* `localhost`, because a phone or emulator is a separate device from the machine running the backend, and `localhost` there resolves to the device itself |

Find your LAN IP with `ipconfig getifaddr en0` (macOS Wi-Fi) or `ip addr` (Linux), and make sure
the phone/emulator is on the **same Wi-Fi network** as the backend machine. The one exception is
`expo start --web`, where the app runs in a browser on the same machine as the backend — there
`localhost` is correct.

## Setup

**Prerequisites**

- Node.js ≥ 20
- Docker Desktop (recommended — runs Postgres in a container with zero manual DB setup). If you'd
  rather not use Docker, install Postgres 16 yourself and point `DATABASE_URL` at it instead — see
  the fallback note under backend setup below.
- Expo Go (App Store / Play Store) on your phone, only needed for the mobile app — or Xcode/Android
  Studio if you want a simulator/emulator instead of a physical device

Run these in order — the backend has to be up before either client is useful. Each component gets
its own terminal (or `&` them, but keep the output separated while you're getting it running).

### 1. Backend (`backend/`)

```bash
cd backend
npm install
cp .env.example .env          # values already work for local Docker Postgres, no edits required
docker compose up -d          # starts Postgres 16 in a container (port 5432)
npx prisma migrate dev        # applies the schema
npx prisma db seed            # seeds constituencies, booths, candidates, parties, demo users
npm run dev                   # http://localhost:3000/api
```

**Without Docker**: install Postgres 16 yourself, create a database, and set `DATABASE_URL` in
`backend/.env` to point at it before running the `prisma` commands above — everything else is
identical.

### 2. Web dashboard (`frontend-web/`) — after the backend is running

```bash
cd frontend-web
npm install
cp .env.example .env          # http://localhost:3000/api already correct, no edits required
npm run dev                   # http://localhost:5173
```

### 3. Mobile app (`mobile/`) — after the backend is running

```bash
cd mobile
npm install
cp .env.example .env
```

Then edit `mobile/.env` and set `EXPO_PUBLIC_API_URL` to your machine's **LAN IP**, not
`localhost` (see [Environment variables](#environment-variables) above for why):

```bash
npx expo start                # scan the QR code with Expo Go, or press `a` / `i` for an emulator/simulator
```

## Demo login

Both the web dashboard and the mobile app require a login (same backend, same accounts — see
[`backend/README.md#authentication`](backend/README.md#authentication) for how each client carries
its session). Demo accounts, seeded by `backend/prisma/seed.ts`:

| Username | Password |
|---|---|
| `analyst` | `AnalystDemo123!` |
| `admin` | `AdminDemo123!` |
| `user01@gmail.com` | `User01@123` |

These are seed-only fake credentials for this assignment — never reuse this pattern for real
accounts.

## Where to start

The [Setup](#setup) section above is everything you need to get all three components running.
Each subproject also has its own docs:

- [`backend/API.md`](backend/API.md) — full endpoint reference (request/response shapes, error cases)
- [`frontend-web/README.md`](frontend-web/README.md)
- [`mobile/README.md`](mobile/README.md) — includes the LAN IP setup note in detail

### Screenshots

Evidence that each piece actually runs:

- **Backend** — the `curl` calls from `backend/API.md` (or a REST client) hitting a few
  endpoints: `POST /api/auth/login`, `GET /api/constituencies`, `GET /api/constituencies/:id/booths`,
  and one deliberate error case (bad id → 404, missing/bad token → 401).
- **Web** — the login screen, the Overview page (stat tiles + charts), a constituency detail page
  (booth table + candidate chart), and a booth row showing the leading-candidate/party-badge
  styling.
  <img width="1465" height="717" alt="Screenshot 2026-07-19 at 10 44 13 PM" src="https://github.com/user-attachments/assets/6b4a7ba6-8fa0-47c5-81f8-abfd08100296" />
  <img width="1463" height="720" alt="Screenshot 2026-07-19 at 10 44 32 PM" src="https://github.com/user-attachments/assets/6ffea729-dbb3-4b8a-a04b-a1427328b4ce" />
  <img width="1470" height="715" alt="Screenshot 2026-07-19 at 10 48 31 PM" src="https://github.com/user-attachments/assets/83d26acc-c53c-4151-9c23-49b59ef63a23" />

- **Mobile** — the login screen, the search screen with results, and the booth detail screen
  showing the candidate breakdown with party badges (a party-affiliated candidate and an
  independent one).
  <img width="772" height="1600" alt="image" src="https://github.com/user-attachments/assets/c491c087-35c8-4965-92d9-f1147d229449" />
  <img width="764" height="1600" alt="image" src="https://github.com/user-attachments/assets/a76204d3-8797-48cb-951d-cbdd66120e28" />
  
<img width="754" height="1600" alt="image" src="https://github.com/user-attachments/assets/4f137b51-2c9d-4dd3-af85-f0d705f0ff13" />


## Trade-offs made due to time

- **Mobile's session token isn't encrypted at rest on the web build** — native (iOS/Android) builds
  store it in `expo-secure-store` (Keychain/Keystore), but SecureStore has no web implementation,
  so `mobile/src/auth/tokenStorage.ts` falls back to `localStorage` when running via
  `expo start --web`. Only that one target is weaker; it exists for local dev convenience, not as
  a deployment target.
- **A leftover `X-API-Key` / `MOBILE_API_KEY` service-credential path still exists** on the backend
  (`requireAuth` accepts it alongside the cookie and bearer-token paths) from before mobile had
  per-user login — nothing uses it anymore, but it wasn't removed. Harmless but worth cleaning up.
- **Login sessions aren't revocable server-side** — logout only clears the client cookie; the JWT
  itself stays valid until its 24h expiry even if copied elsewhere beforehand. A blocklist or
  refresh-token scheme would fix this.
- **No pagination** — `GET /api/constituencies` and the booths-per-constituency endpoint return
  everything in one response. Acceptable at ~5 constituencies / ~40 booths each, would need
  cursor/offset pagination at real scale.
- **Booth search is a raw `ILIKE` query**, not full-text search — fine for a few hundred rows,
  would need a proper search index (e.g. Postgres `tsvector` or an external search service) at
  scale, and doesn't rank by relevance.
- **`turnoutPercentage`/`leadingCandidate` are computed on every request**, not stored or cached —
  simplest to keep correct as vote data changes, but repeated identical requests to the same
  constituency shouldn't need to redo the same reduction. A cache invalidated on write would fix
  this without changing the API shape.
- **Test coverage is minimal** — only the turnout/leading-candidate utility functions have unit
  tests; there's no integration test suite hitting the API or DB, and no frontend/mobile tests at
  all.

## What I'd improve with more time

1. Integration tests for the API (spin up a test Postgres, hit real endpoints) instead of only
   unit-testing the pure utility functions.
2. Pagination on list endpoints so the API doesn't assume the dataset stays small.
3. A results-over-time view (the schema only stores current vote counts, not a time series) —
   would need a schema change to add snapshots.
4. Share the booth-search hook (debounce constant, request logic) between `frontend-web` and
   `mobile` instead of two independent copies — they're currently kept in sync by hand (300ms vs
   350ms debounce today, functionally identical but drift-prone).
5. Replace the raw `ILIKE` booth search with proper full-text search and relevance ranking.
