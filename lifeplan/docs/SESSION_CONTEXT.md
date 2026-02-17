# Session context — Sovereign Life Plan

**Use this file when you come back to the project.** Ask the AI to "read docs/SESSION_CONTEXT.md" to restore context, or the AI may reference it automatically.

---

## What this project is

- **Sovereign Life Plan** — Next.js 14 app (App Router), Prisma, PostgreSQL. Repo: **QPSGP/Sovereign-Life-Plan**, deploys on **Vercel**.
- Recreates legacy Paradox behavior: members, subscriptions, Life Plan hierarchy, invoices/payments, communications, orders, expenditures, chores, reports.
- **Two tiers only:** SOVEREIGN: Personal $25/mo, SOVEREIGN: Business $250/mo.

---

## Current state (as of last session)

- **Admin:** Dashboard (members, plans, subscriptions), Invoices, Orders, Communications, Expenditures, Chores, Life Plan, Reports. Admin login via `ADMIN_PASSWORD` + `AUTH_SECRET` cookie.
- **Dashboard loads via client fetch** from `GET /api/admin/dashboard` (avoids server serialization errors after login).
- **Tables show all fields;** only subject/name/title is required in forms (per your request).
- **Admin and members can add and edit every field:**
  - **Admin:** Life Plan (subject, area of purpose, area of responsibility, physical movement), Communications, Chores, Expenditures, **Members** (full profile edit at `/admin/members/[id]/edit`).
  - **Members (portal):** Profile edit at `/portal/profile/edit`; Life Plan subject/business edit when a plan is linked (portal plan subject page has edit form).
- **Member delete:** Admin can delete members (with confirm); API `POST /api/members/[id]/delete`.
- **DB:** Seed keeps only `sovereign-personal` and `sovereign-business` plans; run "DB push and seed" via GitHub Actions (must be **logged in to GitHub** to see "Run workflow"). Optional **demo data**: run `npm run db:seed:demo` (after main seed) to populate one member, a life plan, communications, chores, expenditures, and an invoice—see `docs/DATA_AND_IMPORT.md`.

---

## Key paths

| Area | Paths |
|------|--------|
| Admin | `app/admin/(protected)/page.tsx` (dashboard client), `app/admin/(protected)/layout.tsx`, `app/admin/login/page.tsx` |
| Life Plan admin | `app/admin/life-plan/LifePlanClient.tsx`, `subject/[id]`, `purpose/[id]`, `responsibility/[id]`, `movement/[id]/edit` |
| Edit APIs | `app/api/life-plan/subject-business/[id]`, `area-of-purpose/[id]`, `area-of-responsibility/[id]`, `physical-movement/[id]`, `app/api/communications/[id]`, `chores/[id]`, `expenditures/[id]`, `app/api/members/[id]` |
| Portal | `app/portal/(protected)/page.tsx`, `profile/edit`, `plan/subject/[id]` |
| Portal APIs | `app/api/portal/profile`, `app/api/portal/life-plan/subject-business/[id]` |
| Config | `prisma/schema.prisma`, `prisma/seed.js`, `lib/db.ts`, `lib/auth.ts`, `lib/member-auth.ts` |
| **How tables work** | `docs/HOW_TABLES_FUNCTION.md` — how each table works alone and with others (Paradox-style reference). |

---

## Conventions

- **Always push to git** after changes (see `.cursor/rules/push-to-git.mdc`). Use PowerShell-friendly commands (e.g. `Set-Location "path"; git add ...`).
- **DB push and seed:** GitHub Actions → "DB push and seed" (must be logged in). Doc: `docs/RUN_DB_PUSH_AND_SEED.md`.
- **Env:** `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_PASSWORD` in Vercel; `DATABASE_URL` in GitHub Actions secrets.

---

## When you come back

1. Open this project in Cursor.
2. In a new chat, say: **"Read docs/SESSION_CONTEXT.md for context — I'm back on Sovereign Life Plan."**
3. Continue from there (e.g. money/payments, more member edit flows, or whatever you need next).

This file is committed so it’s always in the repo when you return.
