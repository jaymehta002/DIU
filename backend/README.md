# Backend

Express + Prisma + PostgreSQL + TypeScript. REST API serving constituencies, booths, candidates,
and vote records — see [`API.md`](API.md) for the full endpoint reference (request/response shapes,
error cases, sample `curl`s).

## Setup

```bash
npm install
docker compose up -d       # starts Postgres 16 in a container (port 5432)
npx prisma migrate dev     # applies the schema, only needed once or after schema changes
npx prisma db seed         # populates 5 constituencies / ~200 booths / candidates / vote records
```

`.env` (copy from `.env.example` if missing) needs:

| Var | Purpose | Default |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | `postgresql://postgres:postgres@localhost:5432/election_db?schema=public` |
| `PORT` | API port | `3000` |
| `NODE_ENV` | `development` \| `test` \| `production` | `development` |
| `CORS_ORIGINS` | comma-separated allowed origins | `http://localhost:5173,http://localhost:19006` |
| `JWT_SECRET` | signs/verifies login session tokens — **required, no default; the server refuses to start without it** | — |
| `JWT_EXPIRES_IN` | how long a login session lasts | `24h` |
| `MOBILE_API_KEY` | shared service credential the mobile app sends instead of logging in — **required, no default** | — |

`JWT_SECRET` and `MOBILE_API_KEY` should be long random strings in any real deployment (`.env.example` ships placeholders only, real values are generated locally and never committed).

## Running

```bash
npm run dev     # tsx watch, http://localhost:3000/api
```

## Authentication

The analytics dashboard (`frontend-web`) requires a login; the mobile field-staff app does not
(see [Mobile access](#mobile-access)). Full endpoint-level detail — request/response shapes, all
error cases — is in [`API.md`](API.md#authentication); this section covers the design choices.

**Backend-only so far.** This pass added the schema, endpoints, and route protection on the
API side; `frontend-web` does not yet have a login screen or `credentials: 'include'` wired into
its `fetch` calls, so as of this change the dashboard will get `401`s from every request until
that frontend work is done as a follow-up.

**Demo login credentials** (from `prisma/seed.ts`, re-created on every `npx prisma db seed`):

| Username | Password |
|---|---|
| `analyst` | `AnalystDemo123!` |
| `admin` | `AdminDemo123!` |

These are seed-only demo accounts for a local/demo dataset — never reuse this pattern for
real credentials.

**Cookie, not bearer token.** `POST /api/auth/login` sets an httpOnly `auth_token` cookie
(JWT) rather than returning a bearer token for the frontend to store in `localStorage`. This API
is read-only past authentication — no state-mutating endpoints exist for an attacker to CSRF
beyond login/logout, which need no prior session — so bearer's usual advantage (CSRF avoidance)
doesn't apply, while httpOnly cookies keep the token unreadable to any injected client-side script
(XSS). The frontend must call `fetch` with `credentials: 'include'`; the backend allows this via
an explicit CORS origin allowlist + `credentials: true` (credentialed requests can't use `*`).

**Token expiry: 24h.** Long enough that an analyst doesn't get logged out mid-workday, short
enough that a leaked/copied token has a bounded window. Configurable via `JWT_EXPIRES_IN`.

**Logout is client-side only.** `POST /api/auth/logout` clears the cookie; the JWT itself is
stateless and isn't revoked server-side, so a copy obtained elsewhere (e.g. from browser dev
tools before logout) stays valid until its natural 24h expiry. A production system would need a
token blocklist or short-lived-access + refresh tokens for true revocation — not implemented here.

**Generic login errors.** Wrong username, wrong password, and unknown username all return the
identical `401 Invalid credentials` — never revealing which part was wrong.

**Rate limiting.** `POST /api/auth/login` is limited to 10 requests / 15 min per IP
(`express-rate-limit`, in-memory). This blunts casual brute-force; it is not distributed, so it
resets per backend process and doesn't hold across multiple instances behind a load balancer.

### Mobile access

`mobile/` has no login screen — field staff shouldn't need individual accounts for a
read-only lookup tool. Instead it sends a static `X-API-Key` header (`MOBILE_API_KEY` here,
`EXPO_PUBLIC_MOBILE_API_KEY` in `mobile/.env`, must match exactly) that the same `requireAuth`
middleware accepts as an alternative to the user cookie. This is a coarse "is this our mobile
client" gate, not per-user auth — and since `EXPO_PUBLIC_*` vars are compiled into the client
bundle, the key is extractable from the installed app by anyone who goes looking. It stops
accidental/casual access to the API, not a determined reverse-engineer; treat it accordingly.

## Seeding

`prisma/seed.ts` uses `@faker-js/faker` to generate 5 constituencies, 30–50 booths each, 3–4
candidates per constituency, and a vote record per (booth, candidate) pair. Vote weights are
generated so the intended "leading" candidate at each booth always has strictly more votes than
the others — deterministic winner, still randomized totals. It also (re)creates the two demo
user accounts above, with bcrypt-hashed passwords (cost factor 12) — plaintext passwords are
never logged or written anywhere by the script itself.

Re-running the seed is safe — it clears all tables (`voteRecord`, `candidate`, `booth`,
`constituency`, `user`) inside a transaction before regenerating, run via:

```bash
npx prisma db seed
```

## Tests

```bash
npm test          # vitest run, unit tests for src/utils/turnout.ts
```

## Project structure

- `src/routes/`, `src/controllers/`, `src/services/` — one file per resource (constituencies, booths, auth)
- `src/validators/` — Zod schemas for params/query/body, enforced via `middleware/validate.ts`
- `src/errors/` — `AppError` base class, `NotFoundError` (404), `ValidationError` (400), `UnauthorizedError` (401)
- `src/middleware/errorHandler.ts` — maps `AppError` subclasses to their status/code; anything else
  becomes a generic 500 with no internal detail leaked to the client
- `src/middleware/requireAuth.ts` — the one reusable auth gate applied to `/constituencies` and
  `/booths`; accepts either the user cookie or the mobile `X-API-Key`
- `src/middleware/loginRateLimiter.ts` — rate limiting for `POST /api/auth/login` only
- `src/services/auth.service.ts` — password hashing/verification (bcrypt), JWT sign/verify
- `src/services/authCookie.ts` — shared cookie name + options (used by both login and logout, so
  they can't drift apart)
- `src/utils/turnout.ts` — pure functions computing turnout % and the leading candidate, covered by
  `src/utils/turnout.test.ts`
- `prisma/schema.prisma` — `Constituency` → `Booth`/`Candidate` → `VoteRecord`, plus a standalone `User`
