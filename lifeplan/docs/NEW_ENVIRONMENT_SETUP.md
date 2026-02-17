# New Environment Setup — Sovereign Life Plan

Use this checklist to deploy or rebuild the app in a **new environment** (new Vercel project, new team, staging, or fresh clone).

---

## What you have (in the repo)

| Item | Purpose |
|------|--------|
| **Next.js app** | `app/`, `next.config.js`, `package.json` |
| **Prisma schema** | `prisma/schema.prisma` — members, subscriptions, invoices, payments, plans |
| **Env template** | `.env.example` — all variable names |
| **Docs** | Vercel steps, GitHub/Vercel/Neon, tiers, workflow |

No Stripe or crypto keys are required for the app to build and run; add them when you’re ready for payments.

---

## Checklist: new environment

### 1. Code

- [ ] **Clone** the repo: `git clone https://github.com/QPSGP/Sovereign-Life-Plan.git` (or your fork).
- [ ] **Branch:** use `main` or the branch you want to deploy.

### 2. Database (Postgres)

- [ ] **Create** a Postgres database (Vercel Postgres, Neon, or Supabase).
- [ ] **Copy** the connection string (must include `?sslmode=require` for serverless).
- [ ] **Apply schema once** (from any machine with Node + this repo, or GitHub Action “DB push and seed”):
  - Set `DATABASE_URL` in `.env` (or in the environment).
  - Run: `npx prisma generate` then `npx prisma db push`.
  - After schema changes (e.g. new columns like `Member.passwordHash`), run `db push` again.
- [ ] **Seed subscription plans** (optional): `npm run db:seed` to insert Basic, Standard, Premium, Sovereign tiers.

### 3. Environment variables (for Vercel or local)

| Variable | Required for deploy | Where to get it |
|----------|---------------------|------------------|
| `DATABASE_URL` | **Yes** | Postgres connection string from step 2. |
| `AUTH_SECRET` | **Yes** (for auth) | Long random string, e.g. [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32). |
| `STRIPE_SECRET_KEY` | No (payments) | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) — add when you set up Stripe. |
| `STRIPE_WEBHOOK_SECRET` | No (payments) | Stripe → Webhooks → add endpoint → signing secret. |
| `NEXT_PUBLIC_APP_URL` | Optional | This environment’s URL (e.g. `https://your-app.vercel.app`). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key when you add Stripe. |
| Crypto provider vars | No | When you add Coinbase Commerce or NowPayments. |

### 4. Vercel (new project)

- [ ] **Vercel** → Add New → Project → Import **Sovereign-Life-Plan** (or your fork) from GitHub.
- [ ] **Environment Variables** → Add `DATABASE_URL` and `AUTH_SECRET` (and any others from the table above).
- [ ] **Deploy.** Do **not** enable “Use existing build cache” on first deploy.
- [ ] **Redeploy** after adding or changing env vars so they’re applied.

### 5. After first deploy

- [ ] Open the deployment URL; you should see the Sovereign Life Plan home page.
- [ ] Check **`/api/health`** — should return `{ "ok": true, ... }`.
- [ ] When ready: add Stripe (and optionally crypto) env vars, create webhook(s), then redeploy.

---

## One-line summary

**Clone repo → create Postgres DB → set `DATABASE_URL` + `AUTH_SECRET` in Vercel → run `prisma db push` once (with that `DATABASE_URL`) → import project in Vercel → deploy.** Optional: add Stripe/crypto and `NEXT_PUBLIC_APP_URL` later.

---

## Reference

- **Repo:** [github.com/QPSGP/Sovereign-Life-Plan](https://github.com/QPSGP/Sovereign-Life-Plan)
- **Env template:** `.env.example` in the repo
- **Tiers / features:** `docs/tiers.md`
- **Vercel steps:** `docs/VERCEL_DEPLOY_STEPS.md`
- **Upgrade plan:** `SOVEREIGN_LIFE_PLAN_UPGRADE_PLAN.md`
