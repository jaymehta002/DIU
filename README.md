# Election Data Platform

A three-part system for browsing and looking up election data (constituencies, polling booths,
candidates, vote records):

| App | Path | Stack | Purpose |
|---|---|---|---|
| **Backend** | [`backend/`](backend/) | Express + Prisma + PostgreSQL + TypeScript | REST API, DB schema, seed data |
| **Web dashboard** | [`frontend-web/`](frontend-web/) | Vite + React + TypeScript + recharts | Analytics team: browse constituencies/booths, charts |
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
LAN IP instead — see [`mobile/.env.example`](mobile/.env.example) and
[`SETUP.md`](SETUP.md) for why this trips people up.

## Screenshots

Evidence that each piece runs — backend endpoints, web dashboard, mobile app on-device — lives in
[`docs/screenshots/`](docs/screenshots/), one subfolder per component.

## Where to start

**First time setting this up? Read [`SETUP.md`](SETUP.md)** — it's a checklist of exactly what
requires action from you (installing things, running commands, testing on a device) versus what's
already configured.

Each subproject also has its own docs:

- [`backend/API.md`](backend/API.md) — full endpoint reference (request/response shapes, error cases)
- [`frontend-web/README.md`](frontend-web/README.md)
- [`mobile/README.md`](mobile/README.md) — includes the LAN IP setup note in detail

## Trade-offs made due to time

- **No auth** — every endpoint is public; fine for a read-only demo dataset, not for real election
  data.
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
5. Basic auth/rate-limiting on the API before it could be anything other than an internal demo.
6. Replace the raw `ILIKE` booth search with proper full-text search and relevance ranking.

## Quick reference: running everything

```bash
# 1. Database + API
cd backend
docker compose up -d
npx prisma migrate dev
npx prisma db seed
npm run dev              # http://localhost:3000/api

# 2. Web dashboard (separate terminal)
cd frontend-web
npm run dev               # http://localhost:5173

# 3. Mobile app (separate terminal)
cd mobile
npx expo start             # scan QR with Expo Go
```
