# PARADOX / Life Controls — Project context

**For you and for the AI:** When you open this folder (e.g. `C:\dev\PARADOX`), this file summarizes where the project is so work can continue without losing context.

---

## What this repo is

- **PARADOX** = top-level folder (this repo). Contains the **lifeplan** app plus legacy/reference material (FCA, Label, UNIVERSA, etc.).
- **lifeplan** = Sovereign Life Plan — Next.js 14 app (member portal + admin). Main app we’re building. Lives in `lifeplan/`.
- **GitHub:** `https://github.com/QPSGP/Life-Controls` — push/pull from here. OneDrive = optional backup only.

---

## Tech stack (lifeplan)

- Next.js 14, Prisma, PostgreSQL (e.g. Neon/Vercel). Admin and member portal; Stripe/crypto payments; UNIVERSA documents.

---

## What’s built and where we left off

- **Life plan hierarchy:** User → Subject/Business → Area of Purpose → Area of Responsibility → **Physical Movement** (PM). Admin can create/edit; members see their plan and schedule.
- **Physical movements:** Have **movement type** (Go To, Read, Think, Write, Call, Operation, Arithmetic, Design/Art, Health) and **DATE, TIME, D/R** (D = Date specific, R = Rolls over). Schema: `scheduledDate`, `scheduledTime`, `dateOrRollover` on `PhysicalMovement`.
- **Admin reports:** Reports page has CSV downloads + **“View on screen”** → `/admin/reports/physical-movements` — sections by type, table with all fields (Subject, Area of purpose, Area of responsibility, Verb, PM NOUN, PM OBJECT, Objective, Results, DATE, TIME, D/R, DONE?, DDATE, DTIME).
- **Portal:** Members have `/portal/schedule` (miniday by type) and plan views. Create/edit PM in admin includes DATE, TIME, D/R.
- **Migration:** Prisma migration for DATE/TIME/D/R was added; user had to run it locally (PC Matic was blocking schema-engine). If new clones need the DB updated: `cd lifeplan && npx prisma migrate dev` or `npx prisma db push`.

---

## Working setup

- **Primary copy:** Clone at `C:\dev\PARADOX` (or similar), open this folder in Cursor. Push to GitHub from here.
- **Secrets:** `lifeplan/.env` — not in git. Copy from `.env.example` and set `DATABASE_URL` and other keys. Same values as any other copy (e.g. OneDrive).
- **Run app:** `cd lifeplan && npm install && npm run dev`.

---

## If the agent or a new chat needs to catch up

Read this file and `lifeplan/README.md` (and optionally `GITHUB_SETUP.md`). Code is in `lifeplan/` (app, API routes, Prisma schema in `lifeplan/prisma/schema.prisma`).
