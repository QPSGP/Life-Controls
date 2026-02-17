# UNIVERSA strategy: rebuild from scratch vs. add to current build

## Recommendation: **Add UNIVERSA to the current build** (do not rebuild from scratch)

Use the **existing Sovereign Life Plan app** as the single platform. Add **UNIVERSA** as the **business module**. Use your **UNIVERSA data** as the **business demo**.

---

## Why not rebuild from scratch

| Rebuild from scratch | Add UNIVERSA to current build |
|----------------------|-------------------------------|
| Throw away working Next.js app, auth, Prisma, admin/portal, Vercel setup | Keep all of it; one codebase, one deployment |
| Redo login, layout, API patterns, DB push/seed, env | Reuse everything; add models and routes |
| Two separate products to maintain (life plan app + UNIVERSA app) | One product: “Sovereign” with **member service** + **business (UNIVERSA)** |
| Longer to reach a usable business demo | Business demo = current app + UNIVERSA data + new UNIVERSA screens |

UNIVERSA is a **different domain** (legal/recording: documents, grantors, grantees), not a replacement for the member/subscription side. So “rebuild from scratch” would mean either building a second app or redoing the current app and then re-adding members/life plan. Both are more work and more risk than extending the current app.

---

## What UNIVERSA adds (business domain)

From the legacy UNIVERSA folder:

- **GRANTDEE** — Document/recording: Doc #, Recorded date, Document Title, property (County, Lot, Block, Tract, Book, Pages, Parcel #, Property Adrs), consideration, notary, signers, Send to / Send Tax To, etc.
- **GRANTEES** — Per-document grantees: Doc #, Grantee #, Name, Address, %, Comment.
- **GRANTORS** — Per-document grantors: Doc #, Grantor #, Name, Address, %, Comment.
- **PER_ID / PERALIAS** — Personal ID and aliases (names, alias IDs).
- **GROSS** — Queries/reports (e.g. by date, consideration, property, grantee/grantor names).
- **CNTYCLRK, MINIDAY** — Additional UNIVERSA sub-areas (tables/forms to catalog and add as needed).

You have **data** for UNIVERSA; that becomes the **business demo** (e.g. “here’s the document/grantor/grantee workflow with real data”).

---

## What to keep from the current build (and reuse)

Keep and reuse:

- **Stack:** Next.js 14, Prisma, PostgreSQL, Vercel.
- **Auth:** Admin login, member portal login, session handling.
- **Layout:** Admin layout, portal layout, nav.
- **Patterns:** API route structure, protected routes, dashboard fetch.
- **Existing modules:** Members, subscriptions, life plan hierarchy, invoices, orders, communications, expenditures, chores, reports.

Add on top:

- **UNIVERSA schema** in Prisma: e.g. `Document` (from GRANTDEE), `DocumentGrantor`, `DocumentGrantee` (from GRANTORS/GRANTEES), `Person` / `PersonAlias` (from PER_ID/PERALIAS) with relations.
- **UNIVERSA admin UI:** List/edit documents, grantors, grantees; link to persons/aliases; replicate the main GROSS queries as views or report pages.
- **Data import:** Script(s) to import your UNIVERSA Paradox (or exported CSV) into the new tables → **business demo** populated with your data.

---

## What “business demo” can mean

- **Member-service demo:** Existing Sovereign Life Plan data (members, plans, subscriptions, invoices) — already there.
- **Business demo:** UNIVERSA data (documents, grantors, grantees, persons/aliases) in the same app, under an “Office” or “Documents” or “UNIVERSA” section in admin.

One app, two demo modes: **member service** and **business (UNIVERSA)**.

---

## Suggested order of work

1. **Catalog UNIVERSA** — List all 63 .DB tables (and key .FSL/.RSL) in UNIVERSA + OFFICE/UNIVERSA; decide which are core for “business demo” (at minimum: GRANTDEE, GRANTEES, GRANTORS; then PER_ID, PERALIAS if you use them).
2. **Design Prisma models** — Document, DocumentGrantee, DocumentGrantor, and optionally Person, PersonAlias; match legacy fields so import is straightforward.
3. **Add to current repo** — New migrations, seed or import script for UNIVERSA data.
4. **Build UNIVERSA admin** — Documents list/detail/edit, Grantors/Grantees per document, and 1–2 main reports (e.g. by date, by grantee name) so the business demo is usable.
5. **Optionally** add UNIVERSA-specific reports (replace .RSL) and document-centric workflows (e.g. “Record new document” wizard).

---

## Implemented (no legacy data required)

- **Documents** can start empty (GRANTDEE, GRANTEES, GRANTORS have no data until you add or import).
- **Admin → Documents**: list documents with filters (title, recorded date range, sort).
- **Admin → Documents → Reports & queries**: query-style views — full list, by recorded date range, by grantee name, by grantor name; CSV download.
- **API**: `GET /api/universa/documents`, `GET /api/universa/reports?query=...&format=json|csv` (admin-only).

## Summary

- **Do not** rebuild from scratch.
- **Do** add UNIVERSA as the business module in the current Sovereign Life Plan app.
- **Do** use your UNIVERSA data as the business demo when you have it (optional CSV import).
- **Keep** the current build’s stack, auth, layout, and member-service features; extend with UNIVERSA schema, import, and admin/reporting.

This gives you one codebase, one deployment, member demo + business demo, and no throwaway work.
