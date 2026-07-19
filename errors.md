- [x] Booth search is not working
  - Root cause: the running `expo start` process was stale. `mobile/package.json` had already
    been downgraded to Expo SDK 54 (to match this device's Expo Go version), but the dev server
    process was never restarted, so it kept reporting SDK 57 and Expo Go rejected it with
    "Project is incompatible with this version of Expo Go" — that broke the whole app, not just
    search. Killed the stale process, restarted with `npx expo start --clear`; it now correctly
    reports `exposdk:54.0.0`. Backend `/api/booths/search` itself was already working (verified
    directly).
- [x] I should be able to see votes of leading candidate, runner up and following for each booth
  - Mobile's booth detail screen already showed the full ranked list (`VoteBreakdown.tsx`). Web's
    `BoothTable` only surfaced the leading candidate. Added an expand toggle per row that reveals
    every candidate ranked (Leading, Runner-up, 3rd, ...) via a new shared `CandidateRanking`
    component.
- [x] keep the theme light only for web and mobile
  - Web (`frontend-web/src/index.css`) had a `@media (prefers-color-scheme: dark)` block and
    `color-scheme: light dark`. Removed both — web is light-only regardless of OS setting now.
  - Mobile was already light-only (`app.json` → `"userInterfaceStyle": "light"`, no dynamic
    theming code) — no change needed.
- [x] when search results came on web, I am not able to select it
  - `BoothSearchResults` rendered results as plain `<li>` text with no click handler, and
    `fetchBoothById`/`useBooth` existed in the API layer but were never wired to any screen.
    Made each result a clickable button, added `selectedBoothId` state in `Dashboard.tsx`, and
    added a new `BoothDetailPanel` component (location, registered voters, votes cast, turnout %,
    full candidate ranking) that renders below the search results when one is selected.
- [x] is backend really working? I do not see any backend calls — it is loading data from
      frontend only. Expo app worked even when backend was off.
  - Verified directly: stopped the backend process, then hit the exact URL the mobile app uses
    (`http://192.168.1.18:3000/api/booths/search?q=...`) — it failed with connection refused, as
    expected. Grepped the entire `mobile/` and `frontend-web/` source for any cache/`AsyncStorage`/
    offline-fallback logic — none exists; every screen calls the real API and shows an error state
    on failure. The "it still worked" observation was almost certainly a screen that had already
    loaded data *before* the backend was stopped — React state persists on screen until a new
    fetch is triggered, so it looked live but wasn't actually re-querying. Restarted the backend
    afterward; confirmed working again.
