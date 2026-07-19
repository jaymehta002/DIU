# API Reference

Base URL: `http://localhost:3000/api`

All responses use a consistent envelope:

- Success: `{ "data": ... }`
- Failure: `{ "error": { "message": string, "code": string } }`

`code` is a stable machine-readable string (`NOT_FOUND`, `VALIDATION_ERROR`, `INTERNAL_ERROR`), independent of the HTTP status code.

CORS is restricted to the origins listed in `CORS_ORIGINS` (comma-separated env var; defaults to `http://localhost:5173,http://localhost:19006` for local Vite/Expo dev). Requests from other origins receive no `Access-Control-Allow-Origin` header.

---

## `GET /api/constituencies`

List all constituencies (id + name only).

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/constituencies` |
| **Params** | none |
| **Query** | none |

**Sample request**

```
curl http://localhost:3000/api/constituencies
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

**Error cases**: none — always returns 200 with an array (empty array if no constituencies exist).

---

## `GET /api/constituencies/:id/booths`

Booth-wise data for a constituency: every booth's per-candidate votes, turnout %, and leading candidate. `turnoutPercentage` and `leadingCandidate` are computed in the service layer on every request, not stored.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/constituencies/:id/booths` |
| **Params** | `id` — constituency id (string, required) |
| **Query** | none |

**Sample request**

```
curl http://localhost:3000/api/constituencies/da932ce9-895a-4d4c-9491-755874a96bb8/booths
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
| Constituency id does not exist | 404 | `{"error":{"message":"Constituency does-not-exist not found","code":"NOT_FOUND"}}` |

---

## `GET /api/booths/search?q=`

Search booths by name or number, across all constituencies. Partial, case-insensitive match on either field (a numeric `q` matches booth numbers containing that digit sequence, e.g. `q=42` matches booth numbers 42, 142, 420…).

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/booths/search` |
| **Params** | none |
| **Query** | `q` — search term (string, required, non-empty after trimming) |

**Sample request**

```
curl "http://localhost:3000/api/booths/search?q=bramley"
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
| `q` missing | 400 | `{"error":{"message":"q: Required","code":"VALIDATION_ERROR"}}` |
| `q` empty string | 400 | `{"error":{"message":"q: q is required","code":"VALIDATION_ERROR"}}` |

No matches is not an error — returns `{"data": []}` with 200.

---

## `GET /api/booths/:id`

Single booth detail: location, registered voters, candidate-wise votes, turnout %, leading candidate, and the parent constituency. Used by the mobile app's booth detail screen.

| | |
|---|---|
| **Method** | GET |
| **Path** | `/api/booths/:id` |
| **Params** | `id` — booth id (string, required) |
| **Query** | none |

**Sample request**

```
curl http://localhost:3000/api/booths/bfab5162-42d7-46ff-a439-4e8760dbc768
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
