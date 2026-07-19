# API Reference

Base URL: `http://localhost:3000/api`

All responses use a consistent envelope:

- Success: `{ "data": ... }`
- Failure: `{ "error": { "message": string, "code": string } }`

`code` is a stable machine-readable string (`NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`), independent of the HTTP status code.

CORS is restricted to the origins listed in `CORS_ORIGINS` (comma-separated env var; defaults to `http://localhost:5173,http://localhost:19006` for local Vite/Expo dev). Requests from other origins receive no `Access-Control-Allow-Origin` header.

## The `party` convention

Every candidate object returned by this API (`leadingCandidate`, entries in `candidates`, `topCandidates`, a constituency `winner`) includes:

```
"party": { "id": string, "name": string, "symbol": string, "color": string } | null
```

`party: null` means the candidate is running as an **independent** — this is a real, intentional state, not a missing-data placeholder. Independents are not backed by a row in the `Party` table (there is no synthetic "Independent" party); the only place "Independent" appears as a named bucket is the computed aggregate in `GET /api/analytics/party-performance`, where `party: null` in that response means the same thing: independents, aggregated together.

## Authentication

`GET /api/constituencies`, `GET /api/constituencies/:id/booths`, `GET /api/constituencies/:id/winner`, `GET /api/booths/search`, `GET /api/booths/:id`, `GET /api/overview`, `GET /api/parties`, and `GET /api/analytics/party-performance` all require authentication. There are three ways to satisfy it, handled by the same `requireAuth` middleware:

1. **`auth_token` httpOnly cookie** — set by `POST /api/auth/login`, used by the web dashboard (analytics team, username + password, browser session). This API is read-only past login (no state-mutating endpoints for an attacker to CSRF beyond login/logout itself, which need no prior session), so the usual case *for* bearer tokens (avoiding CSRF) doesn't apply to a browser client — while an httpOnly cookie keeps the token completely unreadable to any injected client-side script. Requests must be made with credentials included (`fetch(url, { credentials: 'include' })`); CORS is configured with `credentials: true` and an explicit origin allowlist (never `*`, which credentialed requests disallow).
2. **`Authorization: Bearer <token>` header** — the same JWT as the cookie (same `signToken`/`verifyToken`), used by the mobile app (username + password, same login screen flow as web). Mobile has no reliable browser-style cookie jar shared with `fetch`, so `POST /api/auth/login` also returns the token in the JSON body for the client to store itself (`expo-secure-store` — iOS Keychain / Android Keystore, not plain storage) and replay as `Authorization: Bearer <token>` on every request. Logging in doesn't stop the cookie from also being set; a mobile client just ignores it.
3. **`X-API-Key` header** — a static shared service credential (not a user login), predating per-user mobile auth and kept for any service-to-service caller that isn't a logged-in person. The value lives in `MOBILE_API_KEY` (backend) and `EXPO_PUBLIC_MOBILE_API_KEY` (mobile's `.env.example`), which must match exactly. This is a coarse "is this our client" check, not per-user auth — `EXPO_PUBLIC_*` vars are inlined into the client bundle and extractable from the installed app, so this key stops casual/accidental access, not a determined reverse-engineer.

Any one of the three satisfies `requireAuth`; missing/invalid/expired credentials of all kinds → `401` with code `UNAUTHORIZED`. `GET /api/auth/me` is only satisfied by the cookie or Bearer path (a per-user session) — `X-API-Key` has no associated user, so it gets `401` there too.

### `POST /api/auth/login`

Verifies `username`/`password` against the stored bcrypt hash and, on success, sets the `auth_token` cookie (JWT, `httpOnly`, `sameSite: lax`, expiry matches `JWT_EXPIRES_IN`) **and** returns that same JWT as `token` in the response body, so either a browser (cookie) or a mobile client (stores `token` itself) can authenticate subsequent requests. Rate-limited to 10 requests / 15 min per IP (basic brute-force friction, in-memory — not distributed across multiple backend instances).

| | |
|---|---|
| **Method** | POST |
| **Path** | `/api/auth/login` |
| **Body** | `{ "username": string, "password": string }` |

**Sample request**

```
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"analyst","password":"AnalystDemo123!"}'
```

**Sample response — 200** (cookie set via `Set-Cookie`, and the same JWT also in the body as `token`)

```json
{ "data": { "id": "b334f925-087f-41e4-93aa-1e43478bf555", "username": "analyst", "token": "eyJhbGciOiJIUzI1NiIs..." } }
```

A mobile client stores `token` and sends it back as `Authorization: Bearer <token>` — see [Authentication](#authentication).

**Error cases**

| Condition | Status | Response |
|---|---|---|
| Missing `username`/`password` | 400 | `{"error":{"message":"username: username is required","code":"VALIDATION_ERROR"}}` |
| Wrong username, wrong password, or unknown username | 401 | `{"error":{"message":"Invalid credentials","code":"UNAUTHORIZED"}}` — deliberately identical for both cases, so a failed login never reveals which part was wrong |
| More than 10 attempts from the same IP in 15 min | 429 | `{"error":{"message":"Too many login attempts, try again later.","code":"RATE_LIMITED"}}` |

### `POST /api/auth/logout`

Clears the `auth_token` cookie. This is a client-side-only sign-out — the JWT itself is stateless and not revoked server-side, so a copy of the token obtained elsewhere would remain valid until it naturally expires. Acceptable given the short (24h) expiry and that this is a demo/internal tool; a production system would need a token blocklist or short-lived tokens + refresh tokens for true revocation.

| | |
|---|---|
| **Method** | POST |
| **Path** | `/api/auth/logout` |

**Sample request**

```
curl -i -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

**Sample response**: `204 No Content`, always — logout is not itself gated by `requireAuth`.

### `GET /api/auth/me`

Returns the currently authenticated user. Satisfied by the cookie or the `Authorization: Bearer` path (either is a per-user session) — the `X-API-Key` service credential has no associated user, so it also gets `401` here.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/auth/me` |

**Sample request**

```
curl -b cookies.txt http://localhost:3000/api/auth/me
# or, as mobile does it:
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth/me
```

**Sample response — 200**

```json
{ "data": { "id": "b334f925-087f-41e4-93aa-1e43478bf555", "username": "analyst", "createdAt": "2026-07-19T14:08:03.130Z" } }
```

**Error cases**

| Condition | Status | Response |
|---|---|---|
| No/invalid/expired cookie or Bearer token, or authenticated via `X-API-Key` instead | 401 | `{"error":{"message":"Authentication required","code":"UNAUTHORIZED"}}` |

---

## `GET /api/constituencies`

**Requires authentication** (cookie, Bearer token, or `X-API-Key` — see [Authentication](#authentication)).

List all constituencies (id + name only).

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/constituencies` |
| **Params** | none |
| **Query** | none |

**Sample request**

```
curl -b cookies.txt http://localhost:3000/api/constituencies
```

**Sample response — 200**

```json
{
  "data": [
    { "id": "18370ddd-b938-4b1b-8a24-a7c5d05ec596", "name": "Baramati" },
    { "id": "f9ee7360-5350-4de0-a826-21a68b06eae0", "name": "Chandni Chowk" }
  ]
}
```

**Error cases**

| Condition | Status | Response |
|---|---|---|
| No/invalid/expired credential | 401 | `{"error":{"message":"Authentication required","code":"UNAUTHORIZED"}}` |

Otherwise always 200 with an array (empty array if no constituencies exist).

---

## `GET /api/constituencies/:id/booths`

**Requires authentication** (cookie, Bearer token, or `X-API-Key` — see [Authentication](#authentication)).

Booth-wise data for a constituency: every booth's per-candidate votes, turnout %, and leading candidate. `turnoutPercentage` and `leadingCandidate` are computed in the service layer on every request, not stored.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/constituencies/:id/booths` |
| **Params** | `id` — constituency id (string, required) |
| **Query** | none |

**Sample request**

```
curl -b cookies.txt http://localhost:3000/api/constituencies/18370ddd-b938-4b1b-8a24-a7c5d05ec596/booths
```

**Sample response — 200**

```json
{
  "data": {
    "constituency": {
      "id": "18370ddd-b938-4b1b-8a24-a7c5d05ec596",
      "name": "Baramati",
      "code": "AC-01"
    },
    "booths": [
      {
        "id": "d15f670a-9aa6-4f02-9353-eaac84561b41",
        "name": "Panchayat Union Middle School, Loni Kalbhor, Booth No. 1",
        "number": 1,
        "location": "Loni Kalbhor, Pune, Maharashtra",
        "registeredVoters": 2730,
        "totalVotesCast": 1764,
        "turnoutPercentage": 64.6,
        "leadingCandidate": {
          "id": "4997d0c9-736b-447e-99ff-6ff2216f38ff",
          "name": "Nitin Wagh",
          "party": { "id": "2010d342-049c-4b3c-a5c8-d2c52084b3a6", "name": "Lok Kalyan Party", "symbol": "LKP", "color": "#e87ba4" },
          "votes": 924
        },
        "candidates": [
          { "id": "366b8207-3094-46b9-872c-26c2d2aca076", "name": "Faisal Ahmed", "party": null, "votes": 356 },
          { "id": "4997d0c9-736b-447e-99ff-6ff2216f38ff", "name": "Nitin Wagh", "party": { "id": "2010d342-049c-4b3c-a5c8-d2c52084b3a6", "name": "Lok Kalyan Party", "symbol": "LKP", "color": "#e87ba4" }, "votes": 924 },
          { "id": "efeb4b95-bc81-4cb3-82bf-e84ff1951fba", "name": "Baljeet Singh", "party": { "id": "9516cca1-8912-4d38-a1f3-afaa3ff8820e", "name": "Nav Bharat Sena", "symbol": "NBS", "color": "#eb6834" }, "votes": 268 },
          { "id": "8068047c-6125-42db-ab7a-cafcef2f14f8", "name": "Anjali Kulkarni", "party": { "id": "18a39658-1b15-4037-8108-455efcf7b87f", "name": "Bharat Nirman Morcha", "symbol": "BNM", "color": "#2a78d6" }, "votes": 216 }
        ]
      }
    ]
  }
}
```

`Faisal Ahmed` above is an independent — `party: null` — sitting in the same `candidates` array as party-affiliated candidates. See [The `party` convention](#the-party-convention).

**Error cases**

| Condition | Status | Response |
|---|---|---|
| No/invalid/expired credential | 401 | `{"error":{"message":"Authentication required","code":"UNAUTHORIZED"}}` |
| Constituency id does not exist | 404 | `{"error":{"message":"Constituency does-not-exist not found","code":"NOT_FOUND"}}` |

Auth is checked before the id lookup, so a bad id with no credential still returns 401, not 404.

---

## `GET /api/booths/search?q=`

**Requires authentication** (cookie, Bearer token, or `X-API-Key` — see [Authentication](#authentication)). This is one of the endpoints mobile calls, authenticated via its stored `Authorization: Bearer` token.

Search booths by name or number, across all constituencies. Partial, case-insensitive match on either field (a numeric `q` matches booth numbers containing that digit sequence, e.g. `q=42` matches booth numbers 42, 142, 420…).

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/booths/search` |
| **Params** | none |
| **Query** | `q` — search term (string, required, non-empty after trimming) |

**Sample request**

```
curl -b cookies.txt "http://localhost:3000/api/booths/search?q=karol+bagh"
# or, as mobile does it:
curl -H "Authorization: Bearer <token>" "http://localhost:3000/api/booths/search?q=karol+bagh"
```

**Sample response — 200**

```json
{
  "data": [
    {
      "id": "1be7ed2b-5a65-46f7-bbdf-bc61cdb84be2",
      "name": "Municipal Corporation School, Karol Bagh, Booth No. 6",
      "number": 6,
      "location": "Karol Bagh, Central Delhi",
      "constituency": { "id": "f9ee7360-5350-4de0-a826-21a68b06eae0", "name": "Chandni Chowk" }
    }
  ]
}
```

**Error cases**

| Condition | Status | Response |
|---|---|---|
| No/invalid/expired credential | 401 | `{"error":{"message":"Authentication required","code":"UNAUTHORIZED"}}` |
| `q` missing | 400 | `{"error":{"message":"q: Required","code":"VALIDATION_ERROR"}}` |
| `q` empty string | 400 | `{"error":{"message":"q: q is required","code":"VALIDATION_ERROR"}}` |

No matches is not an error — returns `{"data": []}` with 200.

---

## `GET /api/booths/:id`

**Requires authentication** (cookie, Bearer token, or `X-API-Key` — see [Authentication](#authentication)). This is one of the endpoints mobile calls, authenticated via its stored `Authorization: Bearer` token.

Single booth detail: location, registered voters, candidate-wise votes, turnout %, leading candidate, and the parent constituency. Used by the mobile app's booth detail screen.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/booths/:id` |
| **Params** | `id` — booth id (string, required) |
| **Query** | none |

**Sample request**

```
curl -b cookies.txt http://localhost:3000/api/booths/d15f670a-9aa6-4f02-9353-eaac84561b41
```

**Sample response — 200**

```json
{
  "data": {
    "id": "d15f670a-9aa6-4f02-9353-eaac84561b41",
    "name": "Panchayat Union Middle School, Loni Kalbhor, Booth No. 1",
    "number": 1,
    "location": "Loni Kalbhor, Pune, Maharashtra",
    "registeredVoters": 2730,
    "totalVotesCast": 1764,
    "turnoutPercentage": 64.6,
    "leadingCandidate": {
      "id": "4997d0c9-736b-447e-99ff-6ff2216f38ff",
      "name": "Nitin Wagh",
      "party": { "id": "2010d342-049c-4b3c-a5c8-d2c52084b3a6", "name": "Lok Kalyan Party", "symbol": "LKP", "color": "#e87ba4" },
      "votes": 924
    },
    "candidates": [
      { "id": "366b8207-3094-46b9-872c-26c2d2aca076", "name": "Faisal Ahmed", "party": null, "votes": 356 },
      { "id": "4997d0c9-736b-447e-99ff-6ff2216f38ff", "name": "Nitin Wagh", "party": { "id": "2010d342-049c-4b3c-a5c8-d2c52084b3a6", "name": "Lok Kalyan Party", "symbol": "LKP", "color": "#e87ba4" }, "votes": 924 },
      { "id": "efeb4b95-bc81-4cb3-82bf-e84ff1951fba", "name": "Baljeet Singh", "party": { "id": "9516cca1-8912-4d38-a1f3-afaa3ff8820e", "name": "Nav Bharat Sena", "symbol": "NBS", "color": "#eb6834" }, "votes": 268 },
      { "id": "8068047c-6125-42db-ab7a-cafcef2f14f8", "name": "Anjali Kulkarni", "party": { "id": "18a39658-1b15-4037-8108-455efcf7b87f", "name": "Bharat Nirman Morcha", "symbol": "BNM", "color": "#2a78d6" }, "votes": 216 }
    ],
    "constituency": {
      "id": "18370ddd-b938-4b1b-8a24-a7c5d05ec596",
      "name": "Baramati",
      "code": "AC-01"
    }
  }
}
```

**Error cases**

| Condition | Status | Response |
|---|---|---|
| No/invalid/expired credential | 401 | `{"error":{"message":"Authentication required","code":"UNAUTHORIZED"}}` |
| Booth id does not exist | 404 | `{"error":{"message":"Booth does-not-exist not found","code":"NOT_FOUND"}}` |

---

## `GET /api/constituencies/:id/winner`

**Requires authentication** (cookie, Bearer token, or `X-API-Key` — see [Authentication](#authentication)).

The constituency-level winner: the candidate with the highest **sum of votes across every booth** in the constituency. This is deliberately distinct from a booth's `leadingCandidate` (the winner of one booth) — a candidate can lead most booths individually and still lose the constituency on aggregate, or vice versa. Ties broken by lowest candidate id, same rule as `leadingCandidate`.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/constituencies/:id/winner` |
| **Params** | `id` — constituency id (string, required) |
| **Query** | none |

**Sample request**

```
curl -b cookies.txt http://localhost:3000/api/constituencies/18370ddd-b938-4b1b-8a24-a7c5d05ec596/winner
```

**Sample response — 200**

```json
{
  "data": {
    "constituency": {
      "id": "18370ddd-b938-4b1b-8a24-a7c5d05ec596",
      "name": "Baramati",
      "code": "AC-01"
    },
    "winner": {
      "id": "4997d0c9-736b-447e-99ff-6ff2216f38ff",
      "name": "Nitin Wagh",
      "party": { "id": "2010d342-049c-4b3c-a5c8-d2c52084b3a6", "name": "Lok Kalyan Party", "symbol": "LKP", "color": "#e87ba4" },
      "totalVotes": 13756
    }
  }
}
```

**Error cases**

| Condition | Status | Response |
|---|---|---|
| No/invalid/expired credential | 401 | `{"error":{"message":"Authentication required","code":"UNAUTHORIZED"}}` |
| Constituency id does not exist | 404 | `{"error":{"message":"Constituency does-not-exist not found","code":"NOT_FOUND"}}` |

---

## `GET /api/parties`

**Requires authentication** (cookie, Bearer token, or `X-API-Key` — see [Authentication](#authentication)).

List all parties. Independents have no row here by design — see [The `party` convention](#the-party-convention).

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/parties` |
| **Params** | none |
| **Query** | none |

**Sample request**

```
curl -b cookies.txt http://localhost:3000/api/parties
```

**Sample response — 200**

```json
{
  "data": [
    { "id": "18a39658-1b15-4037-8108-455efcf7b87f", "name": "Bharat Nirman Morcha", "symbol": "BNM", "color": "#2a78d6", "createdAt": "2026-07-19T14:08:03.134Z" },
    { "id": "9d5b2636-9cb6-48e5-abb3-21eeab6ef1f2", "name": "Jan Shakti Dal", "symbol": "JSD", "color": "#008300", "createdAt": "2026-07-19T14:08:03.134Z" },
    { "id": "2010d342-049c-4b3c-a5c8-d2c52084b3a6", "name": "Lok Kalyan Party", "symbol": "LKP", "color": "#e87ba4", "createdAt": "2026-07-19T14:08:03.134Z" }
  ]
}
```

**Error cases**

| Condition | Status | Response |
|---|---|---|
| No/invalid/expired credential | 401 | `{"error":{"message":"Authentication required","code":"UNAUTHORIZED"}}` |

---

## `GET /api/analytics/party-performance`

**Requires authentication** (cookie, Bearer token, or `X-API-Key` — see [Authentication](#authentication)).

Per-party performance across every constituency, plus one computed `party: null` row aggregating all independents (see [The `party` convention](#the-party-convention)). For each: `totalVotes` (sum across every candidate that party fielded, in every constituency), `voteSharePercentage` (of the overall total votes cast, all parties + independents combined), and `constituenciesWon` (count of constituencies where that party's — or Independent's — candidate is the constituency `winner`, per `GET /api/constituencies/:id/winner`'s definition). Sorted by `totalVotes` descending; a party with zero candidates still appears, with zeros. Computed fresh on every request.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/analytics/party-performance` |
| **Params** | none |
| **Query** | none |

**Sample request**

```
curl -b cookies.txt http://localhost:3000/api/analytics/party-performance
```

**Sample response — 200**

```json
{
  "data": [
    { "party": null, "totalVotes": 84184, "voteSharePercentage": 29.6, "constituenciesWon": 1 },
    { "party": { "id": "18a39658-1b15-4037-8108-455efcf7b87f", "name": "Bharat Nirman Morcha", "symbol": "BNM", "color": "#2a78d6" }, "totalVotes": 78211, "voteSharePercentage": 27.5, "constituenciesWon": 1 },
    { "party": { "id": "9d5b2636-9cb6-48e5-abb3-21eeab6ef1f2", "name": "Jan Shakti Dal", "symbol": "JSD", "color": "#008300" }, "totalVotes": 53437, "voteSharePercentage": 18.8, "constituenciesWon": 1 },
    { "party": { "id": "9516cca1-8912-4d38-a1f3-afaa3ff8820e", "name": "Nav Bharat Sena", "symbol": "NBS", "color": "#eb6834" }, "totalVotes": 35857, "voteSharePercentage": 12.6, "constituenciesWon": 0 },
    { "party": { "id": "2010d342-049c-4b3c-a5c8-d2c52084b3a6", "name": "Lok Kalyan Party", "symbol": "LKP", "color": "#e87ba4" }, "totalVotes": 32910, "voteSharePercentage": 11.6, "constituenciesWon": 2 },
    { "party": { "id": "ff50563d-1061-47f4-8257-5cb82c7caea9", "name": "Rashtriya Ekta Front", "symbol": "REF", "color": "#1baf7a" }, "totalVotes": 0, "voteSharePercentage": 0, "constituenciesWon": 0 },
    { "party": { "id": "40eea7c9-2406-454f-b23e-ec10bd3ef398", "name": "Samagra Vikas Manch", "symbol": "SVM", "color": "#eda100" }, "totalVotes": 0, "voteSharePercentage": 0, "constituenciesWon": 0 }
  ]
}
```

Here Independent (`party: null`) is the single largest bloc by total votes (29.6%) but won only 1 constituency outright — a real result of this seed's data, illustrating why `totalVotes`/`voteSharePercentage` and `constituenciesWon` are separate figures, not derivable from each other. `constituenciesWon` across every row always sums to the total number of constituencies (5 here).

**Error cases**

| Condition | Status | Response |
|---|---|---|
| No/invalid/expired credential | 401 | `{"error":{"message":"Authentication required","code":"UNAUTHORIZED"}}` |

---

## `GET /api/overview`

**Requires authentication** (cookie, Bearer token, or `X-API-Key` — see [Authentication](#authentication)). Powers the web dashboard's Overview page.

Cross-constituency summary: totals, an average turnout figure, per-constituency stats (for the turnout comparison chart), and a leaderboard of the top 10 candidates by total votes across every constituency. All figures are computed from `Booth`/`VoteRecord` rows on every request, not stored or cached.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/overview` |
| **Params** | none |
| **Query** | none |

**Sample request**

```
curl -b cookies.txt http://localhost:3000/api/overview
```

**Sample response — 200**

```json
{
  "data": {
    "totalConstituencies": 5,
    "totalBooths": 203,
    "totalRegisteredVoters": 384418,
    "totalVotesCast": 284599,
    "averageTurnoutPercentage": 74,
    "constituencies": [
      {
        "id": "18370ddd-b938-4b1b-8a24-a7c5d05ec596",
        "name": "Baramati",
        "code": "AC-01",
        "boothCount": 36,
        "registeredVoters": 66908,
        "votesCast": 50237,
        "turnoutPercentage": 75.1
      }
    ],
    "topCandidates": [
      {
        "id": "aeda1a7c-e693-444c-9d73-aad2e3416953",
        "name": "Imran Qureshi",
        "party": { "id": "18a39658-1b15-4037-8108-455efcf7b87f", "name": "Bharat Nirman Morcha", "symbol": "BNM", "color": "#2a78d6" },
        "constituency": { "id": "f9ee7360-5350-4de0-a826-21a68b06eae0", "name": "Chandni Chowk" },
        "totalVotes": 27188
      }
    ]
  }
}
```

**Error cases**

| Condition | Status | Response |
|---|---|---|
| No/invalid/expired credential | 401 | `{"error":{"message":"Authentication required","code":"UNAUTHORIZED"}}` |

---

## Unmatched routes

Any request to a path not defined above returns:

```json
{ "error": { "message": "Cannot GET /api/nope", "code": "NOT_FOUND" } }
```
with status **404**.

## Unexpected server errors

Any uncaught/unexpected error (not one of the operational error classes) returns status **500** with a generic body — no stack trace or internal detail is ever sent to the client:

```json
{ "error": { "message": "Internal server error", "code": "INTERNAL_ERROR" } }
```
The full error is logged server-side via `console.error`.
