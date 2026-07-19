# Deliverable screenshots

Evidence that each piece actually runs, per the assignment's deliverables checklist. Drop image
files (or a short screen recording) directly into the matching subfolder — filenames don't matter,
they're just referenced by content below.

- **`backend/`** — API endpoints working. Either terminal screenshots of the `curl` calls in
  [`backend/API.md`](../../backend/API.md), or a REST client (Postman/Insomnia/etc.) hitting
  `GET /api/constituencies`, `GET /api/constituencies/:id/booths`, `GET /api/booths/search?q=`,
  and one deliberate error case (e.g. a bad id returning 404).
- **`web/`** — the dashboard in use: the booth search with results, a constituency selected showing
  the booth table, and the candidate-votes chart.
- **`mobile/`** — the app running on-device via Expo Go: the search screen with results, an empty
  search state (no matches), and the booth detail screen with the leading candidate highlighted.

Once files are in place here, link the key ones from the root `README.md` (or leave this folder as
the canonical location and just link the folder itself).
