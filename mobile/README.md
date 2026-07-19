# Mobile — Booth Lookup

Expo (React Native + TypeScript) app for field staff to search for a polling booth and view its
details. Consumes the same backend as `frontend-web`, scoped down to the two endpoints this app
actually needs: `GET /api/booths/search` and `GET /api/booths/:id`.

## Setup

```bash
npm install
cp .env.example .env
```

Then edit `.env` and set `EXPO_PUBLIC_API_URL` to your backend's **LAN IP**, not `localhost`.

### Why LAN IP, not localhost

This app runs on a physical phone or an emulator — a separate device from the machine running the
backend. `localhost` on that device refers to the device itself, not your dev machine, so the API
will be unreachable. Find your dev machine's LAN IP:

- macOS: `ipconfig getifaddr en0`
- Linux: `ip addr`

...and make sure the phone/emulator is on the **same Wi-Fi network** as the backend. This is called
out again as a comment directly in `.env.example` since it's the single most common reason this
kind of app fails to connect for a reviewer running it fresh.

The one exception is running via `expo start --web` — there the app runs in a browser on your dev
machine, so `localhost` is correct, but the backend's `CORS_ORIGINS` env var must then include this
app's dev origin (see `backend/.env.example`).

## Running

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (same Wi-Fi network as the backend), or
press `a` / `i` in the terminal to launch an Android emulator / iOS simulator if you have one set
up locally.

## Platform tested

<!-- Fill in: which platform(s) this was verified on, e.g. "Android via Expo Go on a Pixel 7" -->

## Project structure

- `src/api/` — typed fetch client, one function per endpoint used here
- `src/types/` — `Booth`, `Candidate`, etc., mirrored exactly from `frontend-web/src/types/` and
  `backend/API.md` — do not let these drift
- `src/hooks/` — `useBoothSearch` (debounced), `useBoothDetail`, wrapping `api/` with loading/error state
- `src/screens/` — `SearchScreen`, `BoothDetailScreen`
- `src/components/` — presentational pieces (`SearchBar`, `BoothListItem`, `VoteBreakdown`, status states)
- `src/navigation/` — `RootStackParamList` type only; the stack itself is defined in `App.tsx`

Booth IDs are passed through navigation params — the detail screen always refetches by ID rather
than receiving the full object, matching how a real deep link would arrive.
