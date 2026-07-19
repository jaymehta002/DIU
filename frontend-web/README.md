# Web dashboard

Vite + React + TypeScript + recharts. Read-only analytics view for browsing election results:
search a booth by name/number, or pick a constituency to see its booth-wise table and a
candidate-votes chart. Pure API consumer — every number on this page comes from the backend at
render time, there is no mocked/hardcoded election data in this project.

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

The session is an httpOnly cookie set by `POST /api/auth/login` — every `fetch` in `src/api/client.ts`
sends `credentials: 'include'` so it's attached automatically. Use the "Sign out" button in the
dashboard header to clear it (`POST /api/auth/logout`).

## Project structure

- `src/api/` — typed fetch client (`client.ts`, sends cookies + supports POST/JSON bodies) + one
  function per endpoint used here, including `auth.ts`
- `src/context/` — `AuthProvider` (checks `GET /api/auth/me` on load, exposes login/logout) +
  the underlying `AuthContext`
- `src/types/` — `Booth`, `Candidate`, etc., mirrored exactly from `backend/API.md` and
  `mobile/src/types/` — do not let these drift
- `src/hooks/` — `useConstituencies`, `useConstituencyBooths`, `useBoothSearch`, `useAuth`, wrapping
  `api/` with loading/error state
- `src/components/` — `LoginForm`, `ConstituencySelector`, `BoothTable` (sortable + filterable),
  `CandidateVotesChart` (recharts bar chart), `SearchBar`, `BoothSearchResults`, `BoothDetailPanel`,
  and shared `LoadingState`/`ErrorState`/`EmptyState`
- `App.tsx` — gates on auth status: loading spinner, `LoginForm`, or `Dashboard`
- `Dashboard.tsx` — top-level authenticated layout composing the above

## Build

```bash
npm run build     # tsc -b && vite build, output in dist/
npm run preview   # serve the production build locally
```
