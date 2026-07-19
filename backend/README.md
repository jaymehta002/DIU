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
| `MOBILE_API_KEY` | shared service credential for non-user callers (see [Service-to-service access](#service-to-service-access)) — **required, no default** | — |

`JWT_SECRET` and `MOBILE_API_KEY` should be long random strings in any real deployment (`.env.example` ships placeholders only, real values are generated locally and never committed).

## Running

```bash
npm run dev     # tsx watch, http://localhost:3000/api
```

## Authentication

Both `frontend-web` and `mobile` require a per-user login against the same
`POST /api/auth/login` — same credentials, same JWT, same 24h session — they just carry that
session differently because a browser and a native app have different tools available. Full
endpoint-level detail — request/response shapes, all error cases — is in
[`API.md`](API.md#authentication); this section covers the design choices.

`frontend-web` has a login screen wired to these endpoints — see
[`frontend-web/README.md#logging-in`](../frontend-web/README.md#logging-in). `mobile` has its own
login screen — see [`mobile/README.md`](../mobile/README.md#authentication).

**Demo login credentials** (from `prisma/seed.ts`, re-created on every `npx prisma db seed`):

| Username | Password |
|---|---|
| `analyst` | `AnalystDemo123!` |
| `admin` | `AdminDemo123!` |
| `user01@gmail.com` | `User01@123` |

These are seed-only demo accounts for a local/demo dataset — never reuse this pattern for
real credentials.

**Cookie for web, bearer token for mobile — same JWT either way.** `POST /api/auth/login` sets an
httpOnly `auth_token` cookie *and* returns that same JWT as `token` in the response body. Web
ignores `token` and relies on the cookie: this API is read-only past authentication (no
state-mutating endpoints exist for an attacker to CSRF beyond login/logout, which need no prior
session), so bearer's usual advantage over cookies (CSRF avoidance) doesn't apply to a browser
client, while an httpOnly cookie keeps the token unreadable to any injected client-side script
(XSS) — `credentials: 'include'` on every `fetch`, allowed via an explicit CORS origin allowlist +
`credentials: true`. Mobile has no equivalent of a browser's cookie jar reliably shared with
`fetch`, so it takes the opposite tradeoff: it stores `token` itself, in `expo-secure-store`
(iOS Keychain / Android Keystore — encrypted, not plain `AsyncStorage`), and sends it back as
`Authorization: Bearer <token>`. `requireAuth` accepts either.

**Token expiry: 24h.** Long enough that an analyst doesn't get logged out mid-workday, short
enough that a leaked/copied token has a bounded window. Configurable via `JWT_EXPIRES_IN`. Applies
identically to the cookie and the bearer token — they're the same JWT.

**Logout is client-side only.** `POST /api/auth/logout` clears the cookie; the JWT itself is
stateless and isn't revoked server-side, so a copy obtained elsewhere (e.g. from browser dev
tools before logout, or a token read out of secure storage on a rooted/jailbroken device) stays
valid until its natural 24h expiry. Mobile logout just clears its local secure-storage copy — same
caveat applies. A production system would need a token blocklist or short-lived-access + refresh
tokens for true revocation — not implemented here.

**Generic login errors.** Wrong username, wrong password, and unknown username all return the
identical `401 Invalid credentials` — never revealing which part was wrong.

**Rate limiting.** `POST /api/auth/login` is limited to 10 requests / 15 min per IP
(`express-rate-limit`, in-memory). This blunts casual brute-force; it is not distributed, so it
resets per backend process and doesn't hold across multiple instances behind a load balancer.

### Service-to-service access

Independent of the per-user login above, `requireAuth` also accepts a static `X-API-Key` header
(`MOBILE_API_KEY` here, `EXPO_PUBLIC_MOBILE_API_KEY` in `mobile/.env.example`, must match exactly)
for any caller that isn't a logged-in person — a coarse "is this our client" gate, not per-user
auth. This predates mobile's per-user login (mobile used to rely on it exclusively) and is kept
for that use case; since `EXPO_PUBLIC_*` vars are compiled into a client bundle and extractable
from the installed app, it stops accidental/casual access, not a determined reverse-engineer.

## Seeding

`prisma/seed.ts` generates 5 constituencies (Baramati, Chandni Chowk, Nagpur South, Sivaganga,
Yeshwanthpur — real-sounding Lok Sabha/Vidhan Sabha-style names), 30–50 booths each named after
the local school/hall hosting them (e.g. "Zilla Parishad High School, Katraj, Booth No. 14"), 6
fictional parties (not real Indian political parties, to avoid political sensitivity — each with
a distinct symbol abbreviation and a chart-friendly hex color), and 3–4 candidates per
constituency drawn from a pool of Indian names spanning several regions and communities. Each
candidate is either assigned to a party — via a weighted random pick so the parties end up
unevenly sized, not a flat distribution — or left independent (`partyId: null`); every
constituency is guaranteed at least one independent candidate. Independents are a real state, not
missing data — there is no synthetic "Independent" row in the `Party` table; that grouping only
exists as a computed bucket in `GET /api/analytics/party-performance` (see `API.md`).
`@faker-js/faker` is still used for the randomized counts (booth totals, turnout ratios) and
vote-weight distribution; the constituency/booth/party/candidate names themselves come from
curated pools in the script, not `faker.person`/`faker.location`. Vote weights are generated so
the intended "leading" candidate at each booth always has strictly more votes than the others —
deterministic winner, still randomized totals. It also (re)creates the two demo user accounts
above, with bcrypt-hashed passwords (cost factor 12) — plaintext passwords are never logged or
written anywhere by the script itself.

Re-running the seed is safe — it clears all tables (`voteRecord`, `candidate`, `party`, `booth`,
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
- `src/middleware/requireAuth.ts` — the one reusable auth gate applied to `/constituencies`,
  `/booths`, `/overview`, `/parties`, and `/analytics`; accepts the user cookie, an
  `Authorization: Bearer` token, or the service `X-API-Key`
- `src/middleware/loginRateLimiter.ts` — rate limiting for `POST /api/auth/login` only
- `src/services/auth.service.ts` — password hashing/verification (bcrypt), JWT sign/verify
- `src/services/authCookie.ts` — shared cookie name + options (used by both login and logout, so
  they can't drift apart)
- `src/utils/turnout.ts` — pure functions computing turnout % and the leading candidate, covered by
  `src/utils/turnout.test.ts`
- `prisma/schema.prisma` — `Constituency` → `Booth`/`Candidate` → `VoteRecord`, plus a standalone `User`
