# Lifeplan — Subscriber / Member Service

**Project root:** `lifeplan` (this folder)  
**Goal:** Recreate and upgrade the legacy Paradox “lifeplan” app as a **subscriber service** or **member service** — a modern web (or desktop) application for managing members, subscriptions, payments, and member-facing plans/tasks.

---

## Project scope

- **In scope:** Everything in this `lifeplan` folder (Paradox tables, queries, forms, reports).
- **Out of scope (for now):** Other PARADOX subfolders (cube, FCA, OFFICE, WEATHERM, etc.).

---

## How the current data maps to a member/subscriber service

| Legacy concept | Tables | Role in member service |
|----------------|--------|-------------------------|
| **Members / subscribers** | CONTACT1, CONCAT | People or organizations who subscribe. Contact info (name, company, address, phone, email), plus categories/tags (CONCAT). |
| **Staff / internal users** | USER_ID | Staff or “agents” who use the system (not the members themselves). |
| **Member plans & tasks** | PMS, PMS1 | Plans per member: areas of purpose, areas of responsibility, tasks (verb/noun/object), objectives, results, done/done date. Can become “member plan” or “member goals” in the new app. |
| **Subscriptions & payments** | LPTRANS, TRANSACT, PAYMENT | Orders, invoices, amounts, balances, payments. Core for **subscription billing**, dues, and one-time charges. |
| **Member communications** | CALLS, CCALLS, MAILOUT, LPCOM, LPCNTCOM | Calls and mailouts — member outreach and engagement. |
| **Other** | CHORELST, EXPEND, AREAPURP, DB1.MDB | Chores, expenditures, area-of-purpose lookups; Access DB to migrate. |

---

## Legacy assets in this folder (lifeplan)

- **Paradox tables (.DB):** CONTACT1, PMS, PMS1, USER_ID, LPTRANS, CONCAT, CALLS, CCALLS, LPCOM, LPCNTCOM, LPTRANS, CHORELST, MAILOUT, EXPEND, TRANSACT, PAYMENT, AREAPURP, CATAGORY, FOUND1–3, FTAFCC/E/W, FTNFC*, LTROBJEC, etc.
- **Queries (.QBE):** 14 files — AGENCY, ALLPMS, GETX, PUBLIC, RICKQBE, PMSQ, PERSONAL, MARKEVNT, TRANSACT, TRANSPAY, TRANSCOL, ORDER, TRKB, DELETEX, XINPMS1.
- **Forms/scripts (.FSL):** Binary; UI and flows must be recreated from behavior.
- **Reports/labels (.rsl):** To be recreated as PDF/HTML or exports.
- **Other:** DB1.MDB (Access), some .dbf.

---

## Recreate + upgrade plan (member service)

### 1. Data extraction (first step)
- Export all Paradox `.DB` in this folder to CSV or SQLite (e.g. Python + `pypxlib`).
- Export `DB1.MDB` to CSV or into the same schema.
- Full backup of this folder before any changes.

### 2. New data model (subscriber/member service)
- **members** (from CONTACT1 + CONCAT): subscriber/member profile, contact details, categories.
- **users** (from USER_ID): staff logins and roles.
- **plans** or **member_plans** (from PMS/PMS1): areas of purpose/responsibility, tasks, objectives, done tracking.
- **subscriptions** / **orders** / **invoices** (from LPTRANS, TRANSACT, PAYMENT): subscription tiers, order lines, amounts, balance, payment type, dates.
- **calls**, **mailouts**, **communications** (from CALLS, CCALLS, MAILOUT, LPCOM, LPCNTCOM): member engagement history.
- **expenditures** (from EXPEND): internal tracking, optional.

### 3. New platform (recommended)
- **Web app:** e.g. Python (FastAPI/Django) or Node + React/Vue/Svelte.
- **Database:** SQLite for single-tenant or PostgreSQL for multi-tenant.
- **Auth:** Staff login (from USER_ID); later optional member portal (members log in to see their plan/payments).

### 4. Upgrades as a subscriber/member service
- **Subscription management:** Tiers, start/end dates, renewals, status (active/lapsed/canceled).
- **Billing & payments:** Invoices, payment methods, balance due, payment history (from LPTRANS/PAYMENT).
- **Member portal (optional):** Members log in to view their plan, tasks, and payment history.
- **Communications:** Log calls and mailouts per member; optional email/SMS.
- **Reporting:** Member list, revenue, renewals, tasks completed, contact/marketing lists (replace PERSONAL, MARKEVNT, TRANSCOL, etc.).

---

## Next steps

1. **Open your workspace in the `lifeplan` folder** so all new code and docs live here.
2. **Back up** this folder.
3. **Run a Paradox → CSV/SQLite export** for all `.DB` in lifeplan (I can provide a small Python script).
4. **Define the exact schema** (tables and columns) for members, subscriptions, plans, and payments.
5. **Build the first slice:** e.g. “member list” + “subscription/order list” + one payment view.

Use this file as the project README for the **lifeplan subscriber/member service**; keep it in the `lifeplan` folder and scope all work here.
