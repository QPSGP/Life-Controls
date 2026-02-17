# Sovereign-Life-Plan — Upgrade Plan
## From Legacy Paradox Lifeplan to Multi-Tiered Online Subscription Service

**Document version:** 1.1  
**Date:** February 12, 2025  
**Scope:** This folder (lifeplan) — Paradox tables, queries, and behavior → modern SaaS.  
**Repo:** GitHub · **Hosting:** Vercel · **Payments:** Fiat + crypto.

---

## Executive Summary

The existing **lifeplan** Paradox app is a member/subscriber system that tracks **contacts**, **plans/tasks** (PMS/PMS1), **orders/transactions** (LPTRANS, TRANSACT, PAYMENT), **communications** (calls, mailouts), and **staff** (USER_ID). The goal is to upgrade it into **Sovereign-Life-Plan**: a **multi-tiered online subscription service** with a clear tier structure, recurring billing, member portal, and modern web stack.

---

## 1. Current State Summary

### 1.1 What Exists (from this folder)

| Asset type | What’s here | Notes |
|------------|-------------|--------|
| **Queries (.QBE)** | 14 files | Define joins and filters over Paradox tables. |
| **Tables (referenced)** | CONTACT1, CONCAT, USER_ID, PMS, PMS1, LPTRANS, TRANSACT, PAYMENT, EXPEND, etc. | .DB files may live in parent PARADOX or private :PRIV:; need location for export. |
| **Config** | pdoxwork.ini | Minimal; workspace/folder config. |
| **Docs** | PROJECT_README.md | High-level mapping and next steps. |

### 1.2 Legacy Data Model (inferred from QBE files)

- **CONTACT1** — Members/contacts: ContactNum, name, title, company, address, city, state, zip, country, phone/fax/pager/cell/email, notes.
- **CONCAT** — Contact categories (e.g. Personal, MMPE4 for marketing).
- **USER_ID** — Staff: User ID, first/last name.
- **PMS** — Plan records: User ID, Subject/Business, Areas of Purpose, Areas of Responsibility, Tasks, D/R, Order, Date, Time, PM Verb/Noun/Object, Comment, Objective, Results, DONE?, DONEDATE, DONETIME; some link to ContactNum.
- **PMS1** — Staging/insert table for new plan rows (same structure as PMS).
- **LPTRANS** — Orders/transactions: Customer #, Order #, Date/Time/EndDate/EndTime, Action (Collect/Pay), Type, Item, Unit$, #Units, Subtotal, Fees, TotalOwed, AmountCollected, Balance, Type of Payment, Subject/business, MSource.
- **TRANSACT** — Invoices: ContactNumber, InvoiceNumber, Amount, Quantity, T Amount.
- **PAYMENT** — Payments: InvoiceNumber, Due Date, Date paid.
- **EXPEND** — Expenditures: Subject/Business, CompanyName, Type of Purchase, Amount, Paid by whom, When Paid.

### 1.3 Legacy “Use Cases” (from queries)

- **PERSONAL** — Contact list with “Personal” category.
- **ORDER / TRANSCOL / TRANSPAY** — Orders and collections/payments per customer (LPTRANS + CONTACT1).
- **TRANSACT** — Invoices + payments.
- **AGENCY / PUBLIC / RICKQBE** — PMS plans filtered by Subject/Business (Agency, Public, or one user).
- **ALLPMS / PMSQ** — All plans or plan listing.
- **MARKEVNT** — Contacts in category MMPE4 (marketing/events).
- **GETX / DELETEX / XINPMS1** — Completed tasks (DONE? = X): view, delete, or copy to PMS1.

---

## 2. Target Product: Sovereign-Life-Plan

### 2.1 Product Definition

**Sovereign-Life-Plan** is a **multi-tiered online subscription service** that provides:

1. **Subscription tiers** — Multiple membership levels (e.g. Basic, Standard, Premium, Sovereign) with different features and pricing.
2. **Recurring billing** — Subscriptions with start/end, renewals, and status (active, past_due, canceled, etc.).
3. **Member management** — Profiles, contact info, categories, and (optionally) login to a member portal.
4. **Life plans & tasks** — Per-member (or per-staff) areas of purpose, responsibilities, tasks (verb/noun/object), objectives, results, and done/done-date (evolved from PMS/PMS1).
5. **Billing & payments** — Invoices, balance due, payment history. **Dual currency:** accept **fiat** (USD cards, ACH, etc.) and **crypto** (e.g. BTC, ETH, USDC) via integrated gateways.
6. **Communications** — Log calls and mailouts; optional email/SMS (evolved from CALLS, MAILOUT, LPCOM, LPCNTCOM).
7. **Staff/admin** — Internal users (from USER_ID) with roles and permissions.

### 2.2 Multi-Tiered Subscription Model (example)

| Tier | Name | Price (example) | Features |
|------|------|------------------|----------|
| 1 | Basic | $X/mo | Profile, basic plan view, payment history |
| 2 | Standard | $Y/mo | + Full life-plan tasks, objectives, results |
| 3 | Premium | $Z/mo | + Communications log, reminders, exports |
| 4 | Sovereign | $W/mo | + Priority support, custom areas, API/reports |

Tier names and features should be defined in product/business docs and stored in the new DB (e.g. `subscription_plans`).

---

## 3. Payments: Fiat + Crypto

Sovereign-Life-Plan must accept both **fiat** and **crypto**.

| Type | Use case | Recommended |
|------|----------|-------------|
| **Fiat** | Cards, ACH, bank, etc. (USD) | **Stripe** — Checkout, Customer portal, webhooks. Works well with Vercel serverless. |
| **Crypto** | BTC, ETH, USDC, etc. | **Coinbase Commerce** or **NowPayments** — API + webhooks; no server to self-host. Alternative: **BTCPay Server** if you later self-host a payment node. |

**Schema:** Store on each payment (or invoice):

- `currency_type`: `fiat` | `crypto`
- `currency_code`: e.g. `USD`, `BTC`, `ETH`, `USDC`
- `amount` (in smallest unit or decimal)
- `payment_provider`: e.g. `stripe`, `coinbase_commerce`, `nowpayments`
- `provider_payment_id`, `provider_invoice_id` for idempotency and reconciliation

**Flow:** Invoices can be paid via “Pay with card” (Stripe) or “Pay with crypto” (redirect or embed to provider). Webhooks from both providers update `payments` and subscription status.

---

## 4. Upgrade Plan — Phases

*Legacy data migration is out of scope; backup is done. Build starts from a clean schema.*

### Phase 1: New data model (Sovereign-Life-Plan)

Design and implement a normalized schema that supports **multi-tiered subscriptions** and modern features.

**Suggested core entities:**

| New entity | Purpose | Source / notes |
|------------|---------|----------------|
| **members** | Subscribers; contact + profile | CONTACT1 + CONCAT (contact info + categories) |
| **member_categories** | Tags/categories per member | CONCAT |
| **users** | Staff/admin logins and roles | USER_ID |
| **subscription_plans** | Tier definitions (name, price, interval, features) | New; define tiers |
| **subscriptions** | Per-member subscription (plan, start/end, status) | LPTRANS + business rules |
| **orders** | Order header (member, date, total, status) | LPTRANS (Order number#) |
| **order_lines** | Line items (item, unit price, qty, amount) | LPTRANS (Item, Unit$, #Units, etc.) |
| **invoices** | Invoice header (member, due date, amount, currency) | TRANSACT + PAYMENT |
| **payments** | Payment (invoice, amount, date, currency_type, currency_code, provider, provider_payment_id) — supports fiat and crypto | PAYMENT + LPTRANS |
| **member_plans** | Life plan / goals (areas of purpose, responsibility, tasks) | PMS / PMS1 |
| **member_plan_tasks** | Individual tasks (verb, noun, object, objective, results, done, done_date) | PMS columns |
| **communications** | Calls, mailouts, emails per member | CALLS, MAILOUT, LPCOM, LPCNTCOM |
| **expenditures** | Optional internal spend tracking | EXPEND |

- [ ] Add **tenant_id** (or equivalent) if multi-tenant from day one.
- [ ] Add **audit** fields: created_at, updated_at, created_by where useful.

### Phase 2: Backend and API (Vercel-friendly)

- [ ] **Stack:** Next.js (App Router or Pages) on Vercel; API routes or Route Handlers for backend.
- [ ] **Database:** Vercel Postgres (Neon), or Supabase, or PlanetScale — serverless-friendly Postgres/MySQL. Use env vars for connection string (set in Vercel dashboard and GitHub secrets).
- [ ] **Auth:** Staff login; JWT or session-based (e.g. NextAuth.js or custom).
- [ ] **REST or API routes** for:
  - Members (CRUD, list, filter by category/tier).
  - Subscriptions (create, change tier, cancel, renew).
  - Orders and invoices (list, create, update).
  - Payments (record payment, list by member/invoice); support both fiat and crypto provider IDs.
  - Member plans and tasks (CRUD, filter by member/user).
  - Communications (log, list).
- [ ] **Idempotent webhook handlers** for Stripe (fiat) and for crypto provider (Coinbase Commerce / NowPayments) to update `payments` and subscription status.

### Phase 3: Subscription and billing logic

- [ ] **Subscription state machine:** e.g. trial → active → past_due → canceled (or similar).
- [ ] **Billing cycles:** start date, next billing date, interval (monthly/yearly).
- [ ] **Invoice generation:** from subscription plan price and cycle; optional proration. Invoices have amount and base currency (USD); payments can be in USD (fiat) or crypto (converted for records).
- [ ] **Balance and payments:** apply payments to invoices; maintain balance per member or per invoice.
- [ ] **Fiat:** Stripe Checkout / Customer portal; webhooks to record payments.
- [ ] **Crypto:** Coinbase Commerce or NowPayments — create charge per invoice, redirect member to pay; webhook on completion to record payment and clear balance.

### Phase 4: Admin and staff UI

- [ ] **Admin app** (React, Vue, Svelte, or similar) for staff:
  - Dashboard (revenue, active subs, renewals).
  - Member list and detail (profile, subscription, plans, payments, communications).
  - Subscription management (change tier, cancel, extend).
  - Orders and invoices (list, create, mark paid).
  - Life plans and tasks (view/edit per member or per staff user).
  - Communications log.
- [ ] **Role-based access** (e.g. admin vs agent) using `users` and permissions.

### Phase 5: Member portal (optional but recommended)

- [ ] **Member login** (separate from staff): email + password or magic link.
- [ ] **Member-facing views:**
  - My profile (read/update contact info).
  - My subscription (current tier, next billing date, upgrade/downgrade).
  - My invoices and payments (list, download PDF).
  - My life plan and tasks (view, optionally add/complete within tier limits).
- [ ] **Feature gating** by subscription tier (e.g. “Premium” required for exports).

### Phase 6: Reporting and exports

- [ ] **Reports** equivalent to legacy QBE usage:
  - Member list (with category/tier) — PERSONAL, MARKEVNT.
  - Orders and collections — ORDER, TRANSCOL, TRANSPAY.
  - Invoices and payments — TRANSACT.
  - Plans by agency/public/user — AGENCY, PUBLIC, RICKQBE, ALLPMS.
  - Completed tasks — GETX; archive/delete behavior — DELETEX, XINPMS1.
- [ ] **Exports:** CSV/Excel and PDF for invoices and key reports.

### Phase 7: Go-live

- [ ] **Repo:** Push to **GitHub**; connect repo to **Vercel** for automatic deploys (main → production).
- [ ] **Env:** Set all secrets in Vercel (DB URL, Stripe keys, crypto provider keys, auth secret). Do not commit `.env`; use GitHub Actions secrets if running CI/tests.
- [ ] **Training** and docs for staff and (if applicable) members.

---

## 5. Tech Stack (GitHub + Vercel)

| Layer | Choice | Notes |
|-------|--------|--------|
| **Repo** | GitHub | Single repo; branch strategy as needed (e.g. main = prod). |
| **Hosting** | Vercel | Frontend + serverless API (Next.js API routes / Route Handlers). |
| **Framework** | Next.js | Full-stack on Vercel; App Router or Pages; React for UI. |
| **Database** | Vercel Postgres (Neon) or Supabase | Serverless Postgres; connection over serverless-compatible driver. |
| **ORM / DB client** | Prisma or Drizzle | Works well with serverless and Vercel. |
| **Auth** | NextAuth.js or custom JWT | Staff + optional member login. |
| **Fiat payments** | Stripe | Checkout, Customer portal, webhooks. |
| **Crypto payments** | Coinbase Commerce or NowPayments | API + webhooks; no self-hosted server. |

---

## 6. Repo Structure (GitHub → Vercel)

Single repo (e.g. `sovereign-life-plan`) that Vercel deploys as one project:

```
sovereign-life-plan/
├── README.md
├── PROJECT_README.md              # Legacy context (optional)
├── SOVEREIGN_LIFE_PLAN_UPGRADE_PLAN.md
├── .env.example                   # Template; never commit .env
├── docs/                          # Business rules, tier definitions, API
├── src/                           # Next.js app (or app/ if App Router)
│   ├── app/                       # Routes, layout, API route handlers
│   ├── components/
│   ├── lib/                       # DB client, auth, stripe, crypto provider
│   └── ...
├── prisma/                        # Or drizzle schema + migrations
├── public/
└── legacy/                        # Optional; reference QBE/Paradox docs
```

---

## 7. Success Criteria

- Multi-tiered subscription plans defined and enforceable (tier stored per member; features gated by tier).
- Recurring billing and subscription lifecycle (active, past_due, canceled) implemented and testable.
- **Payments:** Members can pay with **fiat** (Stripe) and **crypto** (Coinbase Commerce or NowPayments); webhooks update payments and balances.
- Staff can manage members, subscriptions, orders, invoices, and life plans from the admin UI.
- (Optional) Members can log in, see their tier, pay invoices (fiat or crypto), and view/edit their life plan within tier limits.
- App deployed from **GitHub** to **Vercel** with env-based config; reports and exports available as needed.

---

## 8. Next Immediate Steps

1. **Create** the GitHub repo (e.g. `sovereign-life-plan`) and push this folder (or a new Next.js scaffold).
2. **Define** subscription tiers (names, prices in USD, intervals, features) in `docs/tiers.md` or similar.
3. **Finalize** the schema (including `payments.currency_type`, `currency_code`, `payment_provider`, `provider_payment_id`) and add migrations (Prisma/Drizzle).
4. **Implement Phase 1** (schema + migrations), **Phase 2** (Next.js API + DB + webhooks for Stripe and crypto), **Phase 3** (billing logic), **Phase 4** (admin UI). Add member portal (Phase 5) and reporting (Phase 6) as needed.
5. **Connect** repo to Vercel; set env vars (DB, Stripe, crypto provider); deploy.

---

*This plan should be updated as tiers, schema, and scope are refined. Repo: GitHub. Hosting: Vercel. Payments: fiat (Stripe) + crypto (Coinbase Commerce or NowPayments).*
