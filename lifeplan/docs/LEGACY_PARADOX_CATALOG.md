# Legacy Paradox catalog (non-UNIVERSA + lifeplan queries)

**Purpose:** Catalog Paradox-era folders and `.QBE` definitions in the PARADOX repo so future rebuild work can be scoped the same way as **UNIVERSA** (`docs/UNIVERSA_ANALYSIS.md`). This is **step 4** of the “what’s left” list: *other legacy*, not yet fully described in one place.

**Explicitly out of scope for this document (deferred):**

1. **Contacts & Companies (HubSpot-style)** — design in `docs/CONTACTS_AND_COMPANIES_DESIGN.md`; not implemented yet.  
2. **Self-serve member signup / billing** — optional product work; Stripe/crypto webhooks already exist for admin-driven flows.  
3. **CNTYCLRK / BIZLEGAL.VAL** — county-clerk module empty in repo; validation file is binary-only (`UNIVERSA/BIZLEGAL.VAL`, `OFFICE/UNIVERSA/BIZLEGAL.VAL`).

---

## 1. Executive map

| Area | Location in repo | What’s in git | Sovereign Life Control Tool (`lifeplan/`) |
|------|------------------|---------------|-------------------------------------------|
| **Sovereign / lifeplan queries** | `lifeplan/*.QBE` | Many queries on PMS, CONTACT1, LPTRANS, etc. | **Migrated** — members, life plan hierarchy, orders, invoices, payments, expenditures, categories; see §3. |
| **UNIVERSA (documents)** | `UNIVERSA/`, `OFFICE/UNIVERSA/` | QBE + BIZLEGAL.VAL; no `.DB` | **Migrated** — see `UNIVERSA_ANALYSIS.md` / `REBUILD_CHECKLIST.md`. |
| **FCA** | `FCA/` | `WORKER.QBE`, `pdoxwork.ini` | **Not migrated** — employment/worker table only in QBE. |
| **WEATHERM** | `WEATHERM/*` | Subfolders + `PDOXWORK.INI` / `pdoxwork.ini` only | **Not migrated** — placeholders; no QBE or tables in repo. |
| **cube** | `cube/` | `PDOXWORK.INI` only | **Unknown** — no queries in repo. |
| **Label / Label1** | `Label/`, `Label1/` | `pdoxwork.ini` only | **Unknown** — no queries in repo. |
| **PRIVATE** | `PRIVATE/` | `pdoxwork.ini` only | **Unknown** — no queries in repo. |
| **Repo root** | `pdoxwork.ini` | `[Folder]` only | — |

**Note:** No `.DB`, `.FML`, or form/script files are committed. Table shapes are inferred **only** from `.QBE` text and naming.

---

## 2. FCA — `FCA/WORKER.QBE`

Single query on **`WORKER.DB`** (answer table `:PRIV:ANSWER.DB`).

| Field (from QBE) | Notes |
|------------------|--------|
| APID# | Likely applicant / worker ID |
| 4WHCompany, 4WHPerson, 4WHTitle, 4WHPhone | “4WH” prefix — workplace / HR block |
| 4WHAddress, 4WHCity, 4WHState, 4WHPC | Address + postal code |
| 4WHJobDes. | Job description |
| 4WHStartDate, 4WHEndDate | Employment window |
| 4WHWages, 4WHWhyLeft | Compensation / separation reason |

**Rebuild suggestion:** If you still use this data, add a `Worker` (or `FcaWorker`) model + admin list/form + optional CSV import; otherwise archive folder as historical.

---

## 3. Lifeplan folder queries — `lifeplan/*.QBE`

These align with the **Sovereign Life Control Tool** domain (contacts, PMS tasks, billing). Mapped below to the **current** Prisma/app concepts.

### 3.1 Core tables inferred

| Legacy table | Typical use in QBE | Modern app counterpart |
|--------------|--------------------|-------------------------|
| **CONTACT1.DB** | Contact master | **Member** (+ profile fields) |
| **CONCAT.DB** | Contact ↔ category | **MemberCategory** |
| **USER_ID.DB** | Staff / plan owner | **User** (plan owners; admin session is env password) |
| **PMS.DB** | Life plan + physical movements (tasks) | **SubjectBusiness**, **AreaOfPurpose**, **AreaOfResponsibility**, **PhysicalMovement** |
| **PMS1.DB** | Insert companion to PMS | Covered by APIs that create hierarchy rows |
| **LPTRANS.DB** | Order / transaction header + lines | **Order**, **OrderLine** |
| **TRANSACT.DB** | Invoice lines | **Invoice** / line model as implemented |
| **PAYMENT.DB** | Invoice payment schedule | **Payment**, invoice due/paid |
| **EXPEND.DB** | Expenditures | **Expenditure** |

### 3.2 Query file index

| File | Intent (short) | Parity in app |
|------|----------------|---------------|
| **PERSONAL.QBE** | CONTACT1 + CONCAT category `Personal` | Members + category filter |
| **MARKEVNT.QBE** | CONTACT1 + CONCAT `MMPE4` | Member category **MMPE4** |
| **AGENCY.QBE** | PMS joined to USER_ID; subject contains `..Agency..` | Life plan filtered by subject (Agency) |
| **PUBLIC.QBE** | PMS + USER_ID; subject `..Public..` | Life plan filtered by subject (Public) |
| **RICKQBE.QBE** | USER_ID + PMS (generic list) | Life Plan by **User** |
| **PMSQ.QBE** | PMS with name columns (LAST NAME, FIRST NAME) | Portal/admin plan views linked to **Member** |
| **ALLPMS.QBE** | PMS + User ID # (no name join) | Admin life plan tree |
| **XINPMS1.QBE** | Parameterized insert into PMS + **PMS1** | Create movement / hierarchy (replaced by API forms) |
| **GETX.QBE** | Read PMS row by `_EG01`…`_EG17` params | Edit single PM / movement |
| **DELETEX.QBE** | Delete PMS where DONE? = X | Not a direct UI pattern; admin deletes via hierarchy |
| **ORDER.QBE** | LPTRANS + CONTACT1 | Orders + member |
| **TRANSCOL.QBE** | LPTRANS “Collect” action + CONTACT1 `Fam..` | Order collection reporting (narrow) |
| **TRANSPAY.QBE** | LPTRANS “Pay” + CONTACT1 + MSource `UP` | Payment-type order lines |
| **TRANSACT.QBE** | TRANSACT + PAYMENT by invoice | Invoices + payments |
| **TRKB.QBE** | EXPEND filter Universal Publications | Expenditure filter by subject/company |

**Gaps vs legacy naming:** Paradox **CONTACT1** combined personal + company fields in one wide table; the app uses **Member** with a different column split. **PMS1** as a separate insert target may have been a staging table — behavior is absorbed into Prisma relations and APIs.

---

## 4. WEATHERM, cube, Label, PRIVATE

| Path | Contents | Action when rebuilding |
|------|----------|------------------------|
| `WEATHERM/` | `CITIZEN`, `FINANCE`, `PRSNLDEV` subdirs; INI only | Obtain original `.DB` / forms or exports from backup; then add a short analysis doc per sub-app. |
| `cube/` | INI only | Same — no schema in repo. |
| `Label/`, `Label1/` | INI only | Likely label-printing; needs external spec. |
| `PRIVATE/` | INI only | Private working folder; no artifacts. |

---

## 5. OFFICE (excluding UNIVERSA)

`OFFICE/pdoxwork.ini` is empty `[Folder]` only. **`OFFICE/UNIVERSA/`** is a mirror of `UNIVERSA/` — already covered by UNIVERSA docs.

---

## 6. How to extend this catalog

1. Drop **exported CSV** or **screenshots of table structures** into `lifeplan/data/` (or a dated archive folder) and reference filenames here.  
2. For each new **.QBE** you add to the repo, append a row to §3.2 and update §3.1 if new tables appear.  
3. When a module is **implemented in Next.js**, mark parity in `docs/REBUILD_CHECKLIST.md` and optionally one line in §1 of this file.

---

## 7. Related docs

- `docs/UNIVERSA_ANALYSIS.md` — UNIVERSA tables and GROSS queries  
- `docs/UNIVERSA_REBUILD_PLAN.md` — phased UNIVERSA work  
- `docs/REBUILD_CHECKLIST.md` — single checklist of done / not done  
- `docs/RECREATION_STATUS.md` — Paradox → app parity (high level)  
- `docs/CONTACTS_AND_COMPANIES_DESIGN.md` — future CRM layer (not built)
