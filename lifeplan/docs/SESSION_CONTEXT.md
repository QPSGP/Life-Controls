# Session context — Sovereign Life Control Tool

**Starting point: 23 Sep 2026. Commit `c8e8307` on `main`.**

Use this file when you come back. In a new chat, say: **"Read docs/SESSION_CONTEXT.md — this is the starting point."**

Older notes in `docs/HANDOFF_SUMMARY.md` describe an earlier session. Start from this file.

---

## What this project is

- **Sovereign Life Control Tool** — Next.js 14 App Router, Prisma 6, PostgreSQL (Neon). App folder: `lifeplan/`. Parent repo: `c:\dev\PARADOX`.
- GitHub: **QPSGP/Life-Controls**. Production: **https://life-controls.vercel.app**. Vercel root is `lifeplan/`. Deploy = push to `main`.
- Life plan: Subject/Business → Area of purpose → Area of responsibility → Physical movement. **D** = date specific, **R** = rolls over. Verbs are miniday categories (Call, Read, and so on).
- Two plans: **sovereign-personal** $25/mo, **sovereign-business** $250/mo. Accounts open with **no charge** until selling starts.

---

## Starting point (what is live)

Functional daily loop (`14c60fe`) plus the instrument-panel look and three draft actions (`c8e8307`).

- **Morning rollover.** R movements land on today. Open invoices due before today become past due. Cron: `lifeplan/vercel.json` → `GET /api/cron/daily` at `15 14 * * *` with `Authorization: Bearer CRON_SECRET`. A portal visit also rolls that member. Timezone: `APP_TIMEZONE` (default `America/Los_Angeles`).
- **Copy a program** from the life-plan UI (admin and portal).
- **Staff login** keeps the shared `ADMIN_PASSWORD`. Blank email uses that password. A staff email signs in as that user.
- **Public signup** at `/signup`. A real Stripe secret (`sk_test_` or `sk_live_` plus 8+ characters) starts Checkout. The local key is a placeholder, so signup creates an active subscription and skips the card. Leave that path until selling.
- **Look.** Dark field, gold accent `#e4a853`, Fraunces and DM Sans, IBM Plex Mono for labels. Glass is for chrome and summary panels. Inputs stay solid.
- **Three actions.** Each drafts into an existing record and waits for a human confirm before save. No general chat box.
  - **Order my day** — portal home. Sorts the open list (overdue, then calls, then time) and writes a short brief. `POST /api/portal/today`.
  - **Capture** — New contact. Pastes a signature into the form. Create contact is still a separate click. `POST /api/portal/contacts/capture`.
  - **Build a program** — subject page. A sentence such as “LinkedIn, same shape as Daily control” copies that program. `POST /api/portal/life-plan/subject/[id]/build`.
- **Model is optional.** `lib/ai.ts` calls OpenAI JSON mode only when `OPENAI_API_KEY` matches `sk-` plus 20+ characters. Model default `gpt-4o-mini`. With no key, Today uses the schedule, and Capture and Build use the text parsers.

---

## Leave out of git

- `lifeplan/tsconfig.tsbuildinfo`
- One-off scripts already run against the demo database: `lifeplan/scripts/add-modern-marketing-programs.js`, `complete-marketing-programs.js`, `duplicate-marketing-responsibilities.js`

---

## Not built yet

Outbound email or SMS (communications are a log), password reset beyond “contact admin”, company CSV import, FCA / CNTYCLRK / BIZLEGAL, and a general chatbot. `MemberPlan` and `Chore` are unused.

---

## When you come back

1. Open `c:\dev\PARADOX` in Cursor.
2. Say: **"Read docs/SESSION_CONTEXT.md — this is the starting point."**
3. Local app: `npm run dev` in `lifeplan/` → http://localhost:3000.
4. Charging turns on only when a real `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set. The model turns on only when `OPENAI_API_KEY` is set.
