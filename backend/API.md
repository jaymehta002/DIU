# API Reference

Base URL: `http://localhost:3000/api`

All responses use a consistent envelope:

- Success: `{ "data": ... }`
- Failure: `{ "error": { "message": string, "code": string } }`

`code` is a stable machine-readable string (`NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`), independent of the HTTP status code.

CORS is restricted to the origins listed in `CORS_ORIGINS` (comma-separated env var; defaults to `http://localhost:5173,http://localhost:19006` for local Vite/Expo dev). Requests from other origins receive no `Access-Control-Allow-Origin` header.

## Authentication

`GET /api/constituencies`, `GET /api/constituencies/:id/booths`, `GET /api/booths/search`, and `GET /api/booths/:id` all require authentication. There are two ways to satisfy it, handled by the same `requireAuth` middleware:

1. **`auth_token` httpOnly cookie** — set by `POST /api/auth/login`, used by the web dashboard (analytics team, username + password). Chosen over a bearer token in `localStorage` because this API is read-only past login (no state-mutating endpoints for an attacker to CSRF beyond login/logout itself, which need no prior session), so the usual case *for* bearer tokens (avoiding CSRF) doesn't apply here — while an httpOnly cookie keeps the token completely unreadable to any injected client-side script. Requests must be made with credentials included (`fetch(url, { credentials: 'include' })`); CORS is configured with `credentials: true` and an explicit origin allowlist (never `*`, which credentialed requests disallow).
2. **`X-API-Key` header** — a static shared service credential (not a user login) for the mobile app, which has no login UI by design (field staff don't authenticate as individuals). The value lives in `MOBILE_API_KEY` (backend) and `EXPO_PUBLIC_MOBILE_API_KEY` (mobile), which must match exactly. This is a coarse "is this our mobile client" check, not per-user auth — note that `EXPO_PUBLIC_*` vars are inlined into the client bundle and are extractable from the installed app, so this key stops casual/accidental access, not a determined reverse-engineer.

Either one satisfies `requireAuth`; missing/invalid/expired credentials of both kinds → `401` with code `UNAUTHORIZED`.

### `POST /api/auth/login`

Verifies `username`/`password` against the stored bcrypt hash and, on success, sets the `auth_token` cookie (JWT, `httpOnly`, `sameSite: lax`, expiry matches `JWT_EXPIRES_IN`). Rate-limited to 10 requests / 15 min per IP (basic brute-force friction, in-memory — not distributed across multiple backend instances).

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

**Sample response — 200** (see the `Set-Cookie` header, not shown in the JSON body)

```json
{ "data": { "id": "9509f57f-080c-4b1c-8130-5fdd7382741a", "username": "analyst" } }
```

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

Returns the currently authenticated user. Only satisfied by the cookie path — the mobile service key has no associated user, so it also gets `401` here.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/auth/me` |

**Sample request**

```
curl -b cookies.txt http://localhost:3000/api/auth/me
```

**Sample response — 200**

```json
{ "data": { "id": "9509f57f-080c-4b1c-8130-5fdd7382741a", "username": "analyst", "createdAt": "2026-07-19T10:00:22.106Z" } }
```

**Error cases**

| Condition | Status | Response |
|---|---|---|
| No/invalid/expired cookie, or authenticated via `X-API-Key` instead | 401 | `{"error":{"message":"Authentication required","code":"UNAUTHORIZED"}}` |

---

## `GET /api/constituencies`

**Requires authentication** (cookie or `X-API-Key` — see [Authentication](#authentication)).

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
    { "id": "da932ce9-895a-4d4c-9491-755874a96bb8", "name": "Clay County Constituency" },
    { "id": "ed4f1f58-f52b-4382-9505-d35277ebedb8", "name": "County Tyrone Constituency" }
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

**Requires authentication** (cookie or `X-API-Key` — see [Authentication](#authentication)).

Booth-wise data for a constituency: every booth's per-candidate votes, turnout %, and leading candidate. `turnoutPercentage` and `leadingCandidate` are computed in the service layer on every request, not stored.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/constituencies/:id/booths` |
| **Params** | `id` — constituency id (string, required) |
| **Query** | none |

**Sample request**

```
curl -b cookies.txt http://localhost:3000/api/constituencies/da932ce9-895a-4d4c-9491-755874a96bb8/booths
```

**Sample response — 200**

```json
{
  "data": {
    "constituency": {
      "id": "da932ce9-895a-4d4c-9491-755874a96bb8",
      "name": "Clay County Constituency",
      "code": "PC-05"
    },
    "booths": [
      {
        "id": "bfab5162-42d7-46ff-a439-4e8760dbc768",
        "name": "Bramley Close Polling Station",
        "number": 1,
        "location": "686 Corene Viaduct, Creminville",
        "registeredVoters": 2027,
        "totalVotesCast": 1406,
        "turnoutPercentage": 69.4,
        "leadingCandidate": {
          "id": "fc3415d7-bb55-4704-93b4-96a267a9f44e",
          "name": "Joyce Parker",
          "party": "Freedom Coalition",
          "votes": 662
        },
        "candidates": [
          { "id": "9bc996e7-bb3f-4194-803b-44f99f0779f5", "name": "Bruce Cummerata Jr.", "party": "Reform Movement", "votes": 185 },
          { "id": "05613418-ebfc-4209-a3f2-556bdc6e8f56", "name": "Dwayne Bartoletti DDS", "party": "Green Future Party", "votes": 239 },
          { "id": "fc3415d7-bb55-4704-93b4-96a267a9f44e", "name": "Joyce Parker", "party": "Freedom Coalition", "votes": 662 },
          { "id": "261113e5-a412-4825-b8d6-039a230adc41", "name": "Israel Kutch", "party": "Citizens Congress", "votes": 320 }
        ]
      }
    ]
  }
}
```

**Error cases**

| Condition | Status | Response |
|---|---|---|
| No/invalid/expired credential | 401 | `{"error":{"message":"Authentication required","code":"UNAUTHORIZED"}}` |
| Constituency id does not exist | 404 | `{"error":{"message":"Constituency does-not-exist not found","code":"NOT_FOUND"}}` |

Auth is checked before the id lookup, so a bad id with no credential still returns 401, not 404.

---

## `GET /api/booths/search?q=`

**Requires authentication** (cookie or `X-API-Key` — see [Authentication](#authentication)). This is the endpoint mobile calls with its `X-API-Key`.

Search booths by name or number, across all constituencies. Partial, case-insensitive match on either field (a numeric `q` matches booth numbers containing that digit sequence, e.g. `q=42` matches booth numbers 42, 142, 420…).

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/booths/search` |
| **Params** | none |
| **Query** | `q` — search term (string, required, non-empty after trimming) |

**Sample request**

```
curl -b cookies.txt "http://localhost:3000/api/booths/search?q=bramley"
# or, as mobile does it:
curl -H "X-API-Key: <MOBILE_API_KEY>" "http://localhost:3000/api/booths/search?q=bramley"
```

**Sample response — 200**

```json
{
  "data": [
    {
      "id": "bfab5162-42d7-46ff-a439-4e8760dbc768",
      "name": "Bramley Close Polling Station",
      "number": 1,
      "location": "686 Corene Viaduct, Creminville",
      "constituency": { "id": "da932ce9-895a-4d4c-9491-755874a96bb8", "name": "Clay County Constituency" }
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

**Requires authentication** (cookie or `X-API-Key` — see [Authentication](#authentication)). This is the endpoint mobile calls with its `X-API-Key`.

Single booth detail: location, registered voters, candidate-wise votes, turnout %, leading candidate, and the parent constituency. Used by the mobile app's booth detail screen.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/booths/:id` |
| **Params** | `id` — booth id (string, required) |
| **Query** | none |

**Sample request**

```
curl -b cookies.txt http://localhost:3000/api/booths/bfab5162-42d7-46ff-a439-4e8760dbc768
```

**Sample response — 200**

```json
{
  "data": {
    "id": "bfab5162-42d7-46ff-a439-4e8760dbc768",
    "name": "Bramley Close Polling Station",
    "number": 1,
    "location": "686 Corene Viaduct, Creminville",
    "registeredVoters": 2027,
    "totalVotesCast": 1406,
    "turnoutPercentage": 69.4,
    "leadingCandidate": {
      "id": "fc3415d7-bb55-4704-93b4-96a267a9f44e",
      "name": "Joyce Parker",
      "party": "Freedom Coalition",
      "votes": 662
    },
    "candidates": [
      { "id": "9bc996e7-bb3f-4194-803b-44f99f0779f5", "name": "Bruce Cummerata Jr.", "party": "Reform Movement", "votes": 185 },
      { "id": "05613418-ebfc-4209-a3f2-556bdc6e8f56", "name": "Dwayne Bartoletti DDS", "party": "Green Future Party", "votes": 239 },
      { "id": "fc3415d7-bb55-4704-93b4-96a267a9f44e", "name": "Joyce Parker", "party": "Freedom Coalition", "votes": 662 },
      { "id": "261113e5-a412-4825-b8d6-039a230adc41", "name": "Israel Kutch", "party": "Citizens Congress", "votes": 320 }
    ],
    "constituency": {
      "id": "da932ce9-895a-4d4c-9491-755874a96bb8",
      "name": "Clay County Constituency",
      "code": "PC-05"
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
