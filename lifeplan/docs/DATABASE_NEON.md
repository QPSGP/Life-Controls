# Neon + Prisma (`DATABASE_URL` / `DATABASE_DIRECT_URL`)

Prisma’s schema uses a **pooled** `url` and a **direct** `directUrl`. That matches [Neon’s recommendation](https://neon.tech/docs/guides/prisma): pooler for the app, direct host for migrations and `db push`.

## Environment variables

| Variable | Use |
|----------|-----|
| **`DATABASE_URL`** | Pooled connection (host often contains `-pooler`). Use in Vercel for the running app. |
| **`DATABASE_DIRECT_URL`** | Direct connection (no `-pooler` in the host). Best for `npm run db push` and avoids some **P1017** (connection closed) errors on long schema operations. |

If you **omit** `DATABASE_DIRECT_URL`, npm scripts (`db:generate`, `db:push`, `build`) set it to **`DATABASE_URL`** automatically via `scripts/prisma-with-direct-url.cjs`. That works everywhere but can still hit pooler timeouts on `db push`; then add a real direct URL.

## Local `.env` (recommended for Neon)

Paste both strings from the Neon dashboard:

```env
DATABASE_URL="postgresql://...@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
DATABASE_DIRECT_URL="postgresql://...@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

## GitHub Actions (optional)

- **`DATABASE_URL`** (required) — usually the **pooled** URL.  
- **`DATABASE_DIRECT_URL`** (optional) — if set, the workflow uses it for Prisma; otherwise it falls back to `DATABASE_URL`.

## Commands

- **`npm run db:push`** — `prisma db push --accept-data-loss` (non-interactive).  
- **`npm run db:generate`** — `prisma generate` with the same env fallback.
