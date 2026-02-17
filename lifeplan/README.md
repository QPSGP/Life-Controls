# Sovereign Life Plan

Multi-tiered online subscription service — fiat (Stripe) and crypto (Coinbase Commerce / NowPayments) payments. Built with Next.js, Prisma, and PostgreSQL. Deploy to **Vercel** from **GitHub**.

---

**Workflow: GitHub first, OneDrive as backup only.**  
If you don’t run the project on your computer (e.g. to avoid freezes or script issues), use **GitHub** as the main repo and **Vercel** to run the app. Use **OneDrive** only to keep a backup copy of files. See **[docs/WORKFLOW_GITHUB_AND_BACKUP.md](docs/WORKFLOW_GITHUB_AND_BACKUP.md)** for the full workflow.

---

## Setup (for local run — optional)

1. **Clone and install**
   ```bash
   git clone <your-repo-url> .
   npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env.local`
   - Set `DATABASE_URL` (Vercel Postgres, Neon, or Supabase)
   - Set `AUTH_SECRET`, Stripe keys, and (optionally) crypto provider keys

3. **Database**
   ```bash
   npx prisma generate
   npx prisma db push
   # or: npx prisma migrate dev
   ```

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). API health: [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Project layout

- `app/` — Next.js App Router (pages, layout, API routes)
- `app/api/webhooks/stripe` — Stripe webhook (fiat)
- `app/api/webhooks/crypto` — Crypto payment webhook stub
- `prisma/schema.prisma` — Data model (members, subscriptions, invoices, payments, plans)
- `docs/tiers.md` — Subscription tier definitions
- `SOVEREIGN_LIFE_PLAN_UPGRADE_PLAN.md` — Full upgrade plan

## Vercel

1. Push to GitHub.
2. In Vercel, import the repo and deploy.
3. Add env vars in Vercel: `DATABASE_URL`, `AUTH_SECRET`, `STRIPE_*`, crypto provider secrets, `NEXT_PUBLIC_APP_URL`.
4. For Stripe/crypto webhooks, set the endpoint URL in each provider’s dashboard to `https://your-domain.vercel.app/api/webhooks/stripe` and `/api/webhooks/crypto`.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Build for production     |
| `npm run start`| Start production server  |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push`     | Push schema to DB       |
| `npm run db:migrate`  | Run migrations        |
| `npm run db:studio`   | Open Prisma Studio    |
