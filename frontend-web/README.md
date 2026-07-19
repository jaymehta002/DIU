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

## Project structure

- `src/api/` — typed fetch client (`client.ts`) + one function per endpoint used here
- `src/types/` — `Booth`, `Candidate`, etc., mirrored exactly from `backend/API.md` and
  `mobile/src/types/` — do not let these drift
- `src/hooks/` — `useConstituencies`, `useConstituencyBooths`, `useBoothSearch`, wrapping `api/`
  with loading/error state
- `src/components/` — `ConstituencySelector`, `BoothTable` (sortable + filterable), `CandidateVotesChart`
  (recharts bar chart), `SearchBar`, `BoothSearchResults`, and shared `LoadingState`/`ErrorState`/`EmptyState`
- `Dashboard.tsx` — top-level layout composing the above; `App.tsx` just renders it

## Build

```bash
npm run build     # tsc -b && vite build, output in dist/
npm run preview   # serve the production build locally
```
