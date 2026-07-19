# Web dashboard

Vite + React + TypeScript + React Router + recharts. Read-only analytics dashboard for an
election-analytics team: an Overview page (cross-constituency totals, turnout comparison, a
national candidate leaderboard) plus a per-constituency detail page (candidate-votes chart,
turnout-distribution chart, sortable/paginated booth table), with a global booth search reachable
from every page. Pure API consumer — every number on this page comes from the backend at render
time, there is no mocked/hardcoded election data in this project.

## Setup

```bash
npm install
```

`.env` already has `VITE_API_URL="http://localhost:3000/api"` — correct as-is since the browser
running this app is on the same machine as the backend (unlike `mobile/`, which needs a LAN IP).
Only change it if the backend is running somewhere other than `localhost:3000`.

## Running

```bash
npm run dev      # http://localhost:5173, requires the backend already running
```

The backend must be up first (`cd ../backend && npm run dev`) — without it every section shows the
"Unable to reach the server" error state rather than data.

## Logging in

This app requires a login — see [`backend/README.md#authentication`](../backend/README.md#authentication)
for the full design rationale. Demo credentials (seeded by `backend/prisma/seed.ts`):

| Username | Password |
|---|---|
| `analyst` | `AnalystDemo123!` |
| `admin` | `AdminDemo123!` |
| `user01@gmail.com` | `User01@123` |

The session is an httpOnly cookie set by `POST /api/auth/login` — every `fetch` in `src/api/client.ts`
sends `credentials: 'include'` so it's attached automatically. Use the "Sign out" button in the
sidebar to clear it (`POST /api/auth/logout`).

## Routes

- `/login` — public; redirects to `/` if already authenticated
- `/` — Overview: stat tiles + national candidate leaderboard + turnout-by-constituency chart
- `/constituency/:id` — candidate-votes chart, turnout-distribution chart, booth table

Both authenticated routes render inside a shared `Layout` (persistent sidebar: nav, global booth
search, constituency list, sign-out). A `ProtectedRoute` reads auth status from context: `loading`
shows a full-page spinner (no flash of the dashboard before redirecting), `unauthenticated`
redirects to `/login`, `authenticated` renders the route.

## Project structure

- `src/auth/` — the entire auth concern in one module: `api.ts` (login/logout/me calls),
  `AuthProvider.tsx` + `authContext.ts` (checks `GET /api/auth/me` on load, exposes login/logout),
  `useAuth.ts`, `ProtectedRoute.tsx`, and `types.ts` (`AuthUser`) — nothing outside this folder
  touches auth state or the session cookie directly
- `src/api/` — typed fetch client (`client.ts`, sends cookies + supports POST/JSON bodies) + one
  function per endpoint used here
- `src/types/` — `Booth`, `Candidate`, `Overview`, etc., mirrored exactly from `backend/API.md` and
  `mobile/src/types/` — do not let these drift
- `src/hooks/` — `useConstituencies`, `useConstituencyBooths`, `useBoothSearch`, `useOverview`,
  wrapping `api/` with loading/error state
- `src/pages/` — `LoginPage`, `OverviewPage`, `ConstituencyDetailPage` — one per route
- `src/components/` — `Layout`/`Sidebar` (persistent shell), `BoothTable` (sortable, filterable,
  paginated, leading-candidate row highlighted), `CandidateVotesChart`/`TurnoutHistogram`/
  `CandidateLeaderboardChart`/`ConstituencyComparisonChart` (recharts, each with its own
  `ChartLegend` + custom tooltip content), `LoginForm`, `SearchBar`, `BoothSearchResults`,
  `BoothDetailPanel`, `StatTile`, and shared `LoadingState`/`ErrorState`/`EmptyState`
- `App.tsx` — `BrowserRouter` + route table wiring `AuthProvider`, `ProtectedRoute`, `Layout`, and
  the three pages together

## Build

```bash
npm run build     # tsc -b && vite build, output in dist/
npm run preview   # serve the production build locally
```
