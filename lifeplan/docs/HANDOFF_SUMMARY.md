# Handoff summary — Life Plan project

*Leave this for when you come back from another project.*

---

## What this project is

**Sovereign Life Plan** — Next.js 14 app in `c:\dev\PARADOX\lifeplan`. Life plan hierarchy (Subject → Purpose → Responsibility → Physical movements), admin UI, member portal, miniday schedule, and Live PM report. Deploys to Vercel on push to `main` (repo: QPSGP/Life-Controls).

---

## What we did in this session

1. **Deploy / local run**
   - You got the site running locally (`npm run dev` after fixing PowerShell execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`).
   - Deploy = push to `main`; nothing new to push at end of session (we pushed).

2. **Navigation to PM / Live PM**
   - **Admin:** From Area of responsibility → “View Live PM report →”. From Reports → “Live PM — View on screen”.
   - **Members:** From Area of responsibility → “View tasks in schedule (Live PM) →”. From portal home → “Live PM — View schedule →”.
   - Schedule and report pages are labeled “(Live PM)” where relevant.

3. **PM table 500 error**
   - Cause: DB missing columns (`scheduledDate`, etc.). Fixed with `npx prisma db push`.
   - Then: `prisma.minidayCategory` undefined because Prisma client wasn’t regenerated (EPERM when dev server was running). We added **fallbacks** so the app works without the new model.

4. **Miniday categories = PM verbs**
   - Live PM report and member miniday schedule now **group by the PM verb** (e.g. Call, Read, Write). Section order matches a managed list.
   - New **MinidayCategory** model in Prisma (name, sortOrder, active). Seeded with: Go To, Read, Think, Write, Call, Operation, Arithmetic, Design/Art, Health.
   - **Admin:** Life Plan → “Miniday categories (verbs)” to add, edit, set active/inactive; **admin only** can delete.
   - Add/Edit physical movement: “Verb (miniday category)” dropdown from that list, or “Other” + custom verb.

5. **Fallbacks when MinidayCategory is missing**
   - If `npx prisma generate` hasn’t been run (or failed due to file lock), `prisma.minidayCategory` is undefined. All pages that use it now fall back to the static verb list so the **PM table and schedule still load** and verb dropdowns still work with defaults.

6. **Auth 405 fixes (login, logout)**
   - **Login:** Admin and member login now use **Server Actions** on the login pages instead of POST to `/api/auth/admin` or `/api/auth/member`, so the browser never hits those API routes on submit and the 405 is avoided.
   - **Logout:** Logout API routes (`/api/auth/admin/logout`, `/api/auth/member/logout`) now support **GET and POST** (both clear cookie and redirect). All logout UI was changed from forms to **links** (`<a href="/api/auth/admin/logout">` etc.) so logout uses GET and works reliably.

7. **Live PM 405 and “Something went wrong”**
   - **Done/Undo on report:** “Mark done” and “Undo” on the Live PM report page now use a **Server Action** (`reportPageDoneAction`) instead of POST to `/api/life-plan/physical-movement/[id]/done`, so no 405 from that API. The done API also has a GET handler that redirects to the report.
   - **Report page crash:** The real error was **“Event handlers cannot be passed to Client Component props”** — the filter `<select>` elements had `onChange` in a Server Component. Fix: **ReportFilters** was moved into a **Client Component** (`ReportFilters.tsx` with `"use client"`) that receives only serializable props (params, subjects, members, verbOptions, hasFilters) and renders the filter forms with `onChange` there. The main report page stays a Server Component and just renders `<ReportFilters ... />`.
   - **Defensive fixes on report page:** `searchParams` is handled when undefined or not a Promise (e.g. in production); null-safe relation chain when building rows (subjectBusiness / areaOfPurpose / areaOfResponsibility); safe date formatting for `scheduledDate` and `doneAt`; try/catch around render with a friendly error UI and link to `/api/db-status`.

---

## Summary of recent changes (quick reference)

| Area | Change |
|------|--------|
| **Admin login** | Server Action on `/admin/login`; no POST to `/api/auth/admin`. |
| **Member login** | Server Action on `/login`; no POST to `/api/auth/member`. |
| **Admin logout** | Link to `/api/auth/admin/logout`; route supports GET + POST. |
| **Member logout** | Link to `/api/auth/member/logout`; route supports GET + POST. |
| **Live PM report** | Filters in Client Component `ReportFilters.tsx`; Done/Undo via Server Action; safe searchParams, null-safe relations, safe dates, try/catch. |
| **Done API** | `GET /api/life-plan/physical-movement/[id]/done` redirects to report; POST still used by other callers. |

---

## When you come back

- **Run the app:**  
  `Set-Location "c:\dev\PARADOX\lifeplan"; npm run dev`  
  Then open http://localhost:3000.

- **If you want full MinidayCategory (DB-backed verbs):**  
  1. Stop the dev server.  
  2. `npx prisma generate`  
  3. Start dev again.  
  Then “Miniday categories (verbs)” will use the DB; until then the app uses the default list.

- **Deploy:**  
  Commit and push to `main`; Vercel will build and deploy.

- **Key paths**
  - Admin: `/admin`, Life Plan: `/admin/life-plan`, Reports: `/admin/reports`, Live PM: `/admin/reports/physical-movements`, Miniday categories: `/admin/life-plan/miniday-categories`.
  - Member portal: `/portal`, schedule (Live PM): `/portal/schedule`, plan: `/portal/plan`.

---

## Repo / env

- Git: `c:\dev\PARADOX` (parent); lifeplan is the app folder. Pushed to `origin main` (QPSGP/Life-Controls).
- Env: `.env` with `DATABASE_URL`, `AUTH_SECRET`; optional Stripe and `NEXT_PUBLIC_APP_URL`. See `docs/VERCEL_DEPLOY_STEPS.md` for deploy and DB setup.
