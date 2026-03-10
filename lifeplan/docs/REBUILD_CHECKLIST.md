# Rebuild checklist — all pieces to complete the Sovereign Life Control Tool

**Goal:** Run your entire business from this program (member service + business/UNIVERSA). This checklist is the single list of what’s done and what’s left.

---

## 1. Member / subscription side (lifeplan core)

| Piece | Status | Notes |
|-------|--------|--------|
| Members (list, add, edit, delete) | ✅ Done | Admin → Members; portal profile edit |
| Subscriptions & plans (SOVEREIGN Personal/Business) | ✅ Done | Seed; admin dashboard |
| Invoices & payments | ✅ Done | Schema + admin; Stripe/crypto hooks exist |
| Orders & order lines | ✅ Done | Schema + admin list/edit |
| Communications (per member) | ✅ Done | Admin list/add/edit |
| Expenditures | ✅ Done | Admin list/add/edit; optional memberId |
| Chores (internal tasks) | ✅ Done | Admin list/add/edit/done |
| Life plan hierarchy (Subject → Purpose → Responsibility → PM) | ✅ Done | Admin + portal; miniday categories |
| Physical movements (DATE, TIME, D/R, done) | ✅ Done | Admin edit; Live PM report; portal schedule |
| Reports (Life Plan, Live PM, CSV) | ✅ Done | Admin → Reports |
| Member portal (login, plan, schedule, profile) | ✅ Done | /portal |
| Auth (admin + member login/logout) | ✅ Done | Server actions + cookie |
| Payments (Stripe/crypto) | ⚠️ Partial | Webhook routes exist; tie-in to subscriptions/invoices may need polish |
| Subscription signup / self-serve billing | ❓ Optional | If you want members to sign up and pay without admin |

---

## 2. UNIVERSA business module (documents / recordings)

| Piece | Status | Notes |
|-------|--------|--------|
| **Data model** (Document, Grantor, Grantee, Person, PersonAlias) | ✅ Done | Prisma; aligned with GRANTDEE, GRANTORS, GRANTEES, PER_ID, PERALIAS |
| **Document form** (all GRANTDEE fields, sections) | ✅ Done | Edit page: Document, Property, Consideration, Send to/Tax, Signing/Notary, Comments |
| **Grantor / grantee forms** (#, name, address 1–3, %, comment) | ✅ Done | Inline add/edit on document page |
| **Record new document wizard** (5 steps) | ✅ Done | Documents → “Record new (wizard)” |
| **Documents list** (filters, sort) | ✅ Done | Admin → Documents |
| **Reports** (full, byDate, byTitle, bySigner, byGrantee, byGrantor, property) | ✅ Done | Admin → Documents → Reports & queries; CSV |
| **Import** (CSV → documents, grantors, grantees) | ✅ Done | `scripts/import-universa-csv.js` |
| **Persons & aliases UI** (list, add, edit, delete Person + aliases) | ✅ Done | Admin → People; edit person + aliases |
| **Link grantor/grantee to Person** | ❌ Not done | Optional dropdown when desired |
| **Person/alias CSV import** | ✅ Done | persons.csv / PER_ID.csv; person_aliases.csv / PERALIAS.csv (see UNIVERSA_IMPORT.md) |
| **BIZLEGAL.VAL validation** | ❌ Not done | Only if you recover rules (binary file) |
| **CNTYCLRK** (county clerk–specific) | ❌ Not done | Legacy folder empty; add if you get tables/forms |
| **Document workflows** (duplicate, clone grantors, templates) | ✅ Done | Duplicate document (copy doc + grantors + grantees) |
| **Portal: member view of documents** | ❌ Not done | Optional: e.g. read-only docs linked to member |

---

## 3. Cross-cutting / polish

| Piece | Status | Notes |
|-------|--------|--------|
| Form validation (required fields, dates) | ⚠️ Partial | Doc # required on create; add more where it matters |
| UNIVERSA_IMPORT.md (CSV column names) | ✅ Done | docs/UNIVERSA_IMPORT.md |
| Run entire business from one app | ✅ Done | Member + business (documents, people, reports, wizard, duplicate); optional portal docs view and BIZLEGAL/CNTYCLRK if needed later |

---

## 4. Legacy reference (no code in repo)

| Source | Content | Rebuild status |
|--------|---------|----------------|
| **UNIVERSA/** | GRANTDEE, GRANTORS, GRANTEES, PER_ID, PERALIAS (QBE only; no .DB) | Document/grantor/grantee done; Person/alias UI and import pending |
| **OFFICE/UNIVERSA/** | Mirror of UNIVERSA | Same as above |
| **FCA, Label, WEATHERM, cube, etc.** | Other legacy | Not yet catalogued; add to this checklist if you want them in the app |

---

## 5. Suggested order to “finish” the rebuild

1. **Phase 4 — Persons & aliases**  
   Admin UI for UniversaPerson and UniversaPersonAlias; optional link from grantor/grantee; Person/alias CSV import if you have data.

2. **Payments & billing**  
   Confirm Stripe/crypto webhooks and subscription/invoice flow so revenue and member status stay in sync.

3. **Phase 5 — Polish**  
   Validation on key forms; optional document workflows (duplicate, clone); optional portal document view; CNTYCLRK only if you add legacy content.

4. **Other legacy**  
   If you want FCA, WEATHERM, or others in the same app, catalogue them (like UNIVERSA_ANALYSIS.md) and add a phase to the plan.

---

## 6. References

- **Phased plan:** `docs/UNIVERSA_REBUILD_PLAN.md`
- **UNIVERSA structure:** `docs/UNIVERSA_ANALYSIS.md`
- **Tables and relationships:** `docs/HOW_TABLES_FUNCTION.md`
- **Session/context:** `docs/SESSION_CONTEXT.md`
- **Root context:** `REBUILD_CONTEXT.md`, `PROJECT_CONTEXT.md`
