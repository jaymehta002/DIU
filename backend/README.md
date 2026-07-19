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

## Running

```bash
npm run dev     # tsx watch, http://localhost:3000/api
```

## Seeding

`prisma/seed.ts` uses `@faker-js/faker` to generate 5 constituencies, 30–50 booths each, 3–4
candidates per constituency, and a vote record per (booth, candidate) pair. Vote weights are
generated so the intended "leading" candidate at each booth always has strictly more votes than
the others — deterministic winner, still randomized totals.

Re-running the seed is safe — it clears all tables (`voteRecord`, `candidate`, `booth`,
`constituency`) inside a transaction before regenerating, run via:

```bash
npx prisma db seed
```

## Tests

```bash
npm test          # vitest run, unit tests for src/utils/turnout.ts
```

## Project structure

- `src/routes/`, `src/controllers/`, `src/services/` — one file per resource (constituencies, booths)
- `src/validators/` — Zod schemas for params/query, enforced via `middleware/validate.ts`
- `src/errors/` — `AppError` base class, `NotFoundError` (404), `ValidationError` (400)
- `src/middleware/errorHandler.ts` — maps `AppError` subclasses to their status/code; anything else
  becomes a generic 500 with no internal detail leaked to the client
- `src/utils/turnout.ts` — pure functions computing turnout % and the leading candidate, covered by
  `src/utils/turnout.test.ts`
- `prisma/schema.prisma` — `Constituency` → `Booth`/`Candidate` → `VoteRecord`
