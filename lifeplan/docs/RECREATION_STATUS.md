# Paradox → Sovereign Life Plan — Recreation Status

What from the old Paradox program is available in the new app.

---

## Legacy Paradox (what you had)

| Legacy | Tables / Queries | Purpose |
|--------|------------------|---------|
| **Contacts** | CONTACT1, CONCAT | Members with contact info and categories (Personal, MMPE4, etc.) |
| **Staff** | USER_ID | Staff/agents using the system |
| **Plans & tasks** | PMS, PMS1 | Areas of purpose, responsibility, tasks (verb/noun/object), objectives, results, done/done date |
| **Orders / billing** | LPTRANS, TRANSACT, PAYMENT | Orders, invoices, amounts, payments |
| **Communications** | CALLS, MAILOUT, LPCOM, etc. | Calls and mailouts per member |
| **Other** | EXPEND, CHORELST, AREAPURP | Expenditures, chores, lookups |

---

## What’s in the new app (parity)

| Legacy | In new app | Status |
|--------|------------|--------|
| **CONTACT1 / CONCAT** | Members + MemberCategory | ✅ Add member, list, set password. **Categories:** add/remove per member (Personal, MMPE4, Agency, Public), filter members by category. |
| **Subscription tiers** | SubscriptionPlan | ✅ Seeded (Basic, Standard, Premium, Sovereign), list, assign to member. |
| **Assign plan to member** | Subscription | ✅ Admin: “Add plan” per member; list active subscriptions. |
| **Staff access** | Admin login (ADMIN_PASSWORD) + User (plan owners) | ✅ Admin login; Life Plan owned by User records (seed or “Create default plan owner”). |
| **Member portal** | /login → /portal | ✅ Profile, subscription(s), invoices (read-only), My plan (if linked). |
| **PMS / PMS1 — Life plans & tasks** | SubjectBusiness → AreaOfPurpose → AreaOfResponsibility → PhysicalMovement | ✅ Full hierarchy. **Sentence structure** (verb, noun, object, objective) on Subject, Purpose, Responsibility, and Physical movement. Create/edit in admin; portal read-only view when plan linked to member. |
| **TRANSACT / PAYMENT — Invoices** | Invoice, Payment | ✅ Admin: create invoice, list, record payment. Portal: view invoices and balance due. |
| **LPTRANS — Orders** | Order, OrderLine | ✅ Admin: create order (member, optional order #), add lines (type, item, unit cents, quantity), list orders. |
| **CALLS / MAILOUT** | Communication | ✅ Admin: log call/mailout/email per member, list recent communications. |
| **Member categories** | MemberCategory | ✅ Admin: add/remove category per member; filter members list by category. |
| **EXPEND** | Expenditure | ✅ Schema + Admin: log expenditure (member or global), description, amount, date, notes; list recent. |
| **CHORELST** | Chore | ✅ Schema + Admin: add chore (title, description), list, mark done/undo. |
| **Reports / exports** | CSV downloads | ✅ **Reports** page: download members.csv (contact + categories), transactions.csv (invoices, paid, balance). |

---

## Optional / not yet wired

| Item | Status |
|------|--------|
| **Stripe / NowPayments webhooks** | Stub routes exist; not yet creating Payment records or updating invoice status on payment success. |
| **Staff as list (USER_ID)** | User table used for Life Plan owners; admin auth is single password. No “staff list” UI. |
| **AREAPURP lookups** | No separate lookup table; areas of purpose are per Subject/Business. |

---

## Summary

All major legacy areas are represented in the new app:

- **Contacts** → Members + categories (with UI).
- **Plans & tasks** → Life Plan hierarchy with sentence structure (verb/noun/object/objective) at every level.
- **Orders / billing** → Orders + order lines, Invoices + payments (create, record, view).
- **Communications** → Log and list calls/mailouts/email.
- **Expenditures** → Log and list.
- **Chores** → Add, list, mark done.
- **Reports** → CSV export for members and transactions.

After schema changes (e.g. new tables/columns), run **“DB push and seed”** so the database stays in sync.
