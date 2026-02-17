# PARADOX Workspace — Conversion Plan & Recommendations

## What You Have

This folder is a **Borland Paradox** (and related legacy) database workspace:

| Asset | Count | Notes |
|-------|--------|------|
| Paradox tables (`.DB`) | 143 | Main data; need conversion |
| Primary indexes (`.PX`) | 109 | Recreated in new DB |
| Forms/scripts (`.FSL`) | 82 | **Binary** — logic must be recreated from behavior |
| Queries (`.QBE`) | 28 | **Text** — can be mapped to SQL |
| Table views / validity (`.TV`, `.VAL`, `.FAM`) | 76 | Schema/constraints to reimplement |
| Reports/labels (`.rsl`) | 24 | Report logic to rebuild |
| Memo/blobs (`.MB`) | 21 | Migrate with tables |
| Other | — | Some dBASE (`.dbf`), one Access (`.MDB`), Lotus (`.WK3`), Excel (`.XLS`) |

**Sub-applications identified:**

| Area | Purpose (inferred) | Key tables |
|------|--------------------|------------|
| **cube** | Task/contact/property app | pms, tsk, cnt, com, prp, usr_id, cat, sub, rsp, vrb_lu |
| **FCA** | Contacts, categories, work history | CONTACT, CATAGORY, WORKER (4WH*), LPCNTCOM, LPTRANS, REF, PREF, EDUCATE, STATIS |
| **Label / Label1** | Label printing | LABEL, LABEL-LU |
| **lifeplan** | Life plan / PMS / contacts / transactions | CONTACT1, PMS, PMS1, LPTRANS, LPCNTCOM, LPCOM, CALLS, CCALLS, CHORELST, CONCAT, EXPEND, MAILOUT, DB1.MDB |
| **OFFICE/UNIVERSA** | Legal/recording (grantors/grantees) | GRANTEES, GRANTORS, GRANTDEE, PER_ID, PERALIAS |
| **WEATHERM** | Personal/finance/citizen | PRSNLDEV, CITIZEN, FINANCE |
| **PRIVATE** | Private workspace | — |

Paradox is obsolete (last real support in the 1990s/2000s). Running it on current Windows is fragile; data is locked in a proprietary format. Converting to a **current platform** gives you one modern stack, backups, and room for upgrades.

---

## Recommended Target Platform

**Option A — Web app (recommended)**  
- **Backend:** Python (FastAPI or Django) or Node.js (Express)  
- **Database:** PostgreSQL (multi-user, robust) or SQLite (simplest, single-user)  
- **Frontend:** React, Vue, or Svelte  
- **Hosting:** Local server, VPS, or cloud (e.g. Azure/AWS)  
- **Benefits:** Any device, multi-user, backups, no Paradox dependency.

**Option B — Desktop app**  
- **Stack:** Electron + SQLite (or Tauri + SQLite)  
- **Benefits:** Single install, works offline; less ideal for multiple people.

**Option C — Low-code / database-centric**  
- **Tools:** Airtable, Notion, or Microsoft Power Platform (Access replacement)  
- **Benefits:** Fast to prototype; some data entry and reporting; less control and possible lock-in.

**Recommendation:** Use **Option A** with **SQLite** first (simplest migration and deployment), then move to **PostgreSQL** if you need multi-user or central hosting. Use one backend (e.g. FastAPI) and one frontend (e.g. React or Vue) for all sub-apps so you get one codebase and one deployment.

---

## Conversion Plan (Phased)

### Phase 1 — Extract and preserve data (weeks 1–2)

1. **Back up the entire PARADOX folder** (copy to a safe location; consider versioned/cloud backup).
2. **Install a Paradox reader** (no need for Borland runtime):
   - **Python:** `pypxlib` (`pip install pypxlib`) or **pyparadox** (Paradox → SQLite mirror).
   - **CLI:** **pxview** (from pxlib) to export tables to CSV/SQL/SQLite.
3. **Export every `.DB` table** to CSV or directly to SQLite:
   - Write a small script that walks all `.DB` files and exports (e.g. with `pypxlib` or `pyparadox`).
   - Keep folder structure in mind (cube, FCA, lifeplan, OFFICE, WEATHERM, etc.) so you know which app each table belongs to.
4. **Document table list and row counts** (and any obvious key fields) for each area — this becomes your migration checklist.
5. **Handle the one Access DB:** `lifeplan\DB1.MDB` — use Python `pyodbc` or a one-time export from Access to CSV/SQLite and merge into your chosen schema later.

**Deliverable:** All Paradox (and Access) data in CSV and/or one SQLite file, plus a simple inventory (table name, app, row count).

---

### Phase 2 — Schema and database on the new platform (weeks 2–4)

1. **Define one logical schema** (e.g. in PostgreSQL or SQLite):
   - One database; use **table prefixes or schemas** per app (e.g. `lifeplan_contact1`, `fca_worker`, `office_grantees`) to avoid name clashes and keep apps clear.
   - Infer types from Paradox exports (numeric, date, memo → text, etc.); add primary keys and foreign keys where the QBE joins suggest relationships (e.g. `User ID #` → `USER_ID`, `Doc. #` between GRANTEES/GRANTORS/GRANTDEE, CONTACT1 ↔ LPTRANS).
2. **Create the tables** (migration scripts or ORM migrations).
3. **Load the exported data** (CSV → DB or SQLite → PostgreSQL if you started with SQLite).
4. **Recreate indexes** implied by `.PX` and by QBE usage (e.g. on `User ID #`, `Doc. #`, `ContactNum`, `Customer #`, `Order number#`).

**Deliverable:** New database with all data loaded and key relationships/indexes in place.

---

### Phase 3 — Recreate query logic (weeks 3–4)

1. **Turn each `.QBE` into SQL** (or ORM queries). Your 28 QBE files are simple “select these fields from these tables”; the grep results in this folder already show the table and column names.
2. **Implement as:**
   - Stored views or saved queries in the new DB, or  
   - API endpoints (e.g. FastAPI) that run the equivalent SELECTs and return JSON.
3. **Prioritize by usage:** lifeplan (PMS, CONTACT1, LPTRANS), OFFICE (GRANTEES/GRANTORS/GRANTDEE), FCA (WORKER, CONTACT).

**Deliverable:** All current “queries” available as SQL/views or APIs.

---

### Phase 4 — Rebuild UI (forms and reports) (weeks 4–8+)

1. **.FSL files are binary** — there is no automatic converter. You will need to:
   - List each form/screen by name and purpose (from memory or by running Paradox briefly if possible).
   - Rebuild each as a web page (or desktop screen): data entry forms, list views, filters.
2. **Start with one app** (e.g. lifeplan or OFFICE) and one main form (e.g. CONTACT1 or GRANTEES); then add list views and simple reports.
3. **Reports/labels (`.rsl`):** Recreate as:
   - PDF or HTML reports from the new backend (e.g. Jinja2 + WeasyPrint, or a report library), or  
   - Export to Excel/CSV and use a template.
4. **Label printing:** Reimplement with a simple template (e.g. HTML/PDF or a label-printing library) driven by the new DB.

**Deliverable:** Core forms and at least one report per app working on the new platform.

---

### Phase 5 — Consolidation and cleanup

1. **Merge overlapping concepts** where it helps:
   - Multiple “contact” tables (CONTACT1, CONTACT, FCA CONTACT, etc.) might become one `contacts` table with an `app` or `type` column, or stay separate with clear naming.
   - Shared lookup tables (e.g. categories) can be centralized.
2. **Retire Paradox:** Once you’re confident in the new app and backups, keep the original PARADOX folder as read-only archive and do all new work on the new platform.

---

## Upgrades to Consider (Once on the New Platform)

| Upgrade | Benefit |
|--------|---------|
| **Multi-user and roles** | Different users (lifeplan, office, FCA) with login and permissions. |
| **Backups** | Automated daily DB backups and optional point-in-time recovery. |
| **Audit log** | Track who changed what and when (important for OFFICE/legal). |
| **Search** | Full-text search across contacts, PMS, and grantee/grantor data. |
| **Mobile-friendly UI** | Use responsive CSS or a PWA so phones/tablets work. |
| **Import/export** | Excel/CSV import and export for each main entity. |
| **Reporting** | Dashboards (e.g. Grafana, Metabase, or built-in charts) for LPTRANS, EXPEND, PMS completion. |
| **Email integration** | Link contacts to mail (e.g. send from app or log emails). |
| **Sync / offline** | If you choose a web app, optional offline support (e.g. service worker + local SQLite) for field use. |

---

## Quick Wins (Do These Early)

1. **Full backup** of PARADOX folder (and keep it).
2. **Export all `.DB` to CSV/SQLite** with a small Python script using `pypxlib` or `pyparadox`.
3. **Document** each sub-app in one page: purpose, main tables, main QBE files (we’ve listed them above).
4. **Pick one app** (e.g. lifeplan or OFFICE) as the first to reimplement end-to-end on the new stack.

---

## Risk and Effort Notes

- **.FSL (forms):** No automated conversion. Effort = rebuilding each form in the new UI; prioritize by daily use.
- **.rsl (reports/labels):** Same — rebuild from behavior; effort is moderate if reports are simple.
- **Data quality:** Check for encoding (e.g. code pages) when exporting; fix any mojibake in CSV before loading.
- **Mixed storage:** The single Access DB (`DB1.MDB`) and any `.dbf`/Excel need one-time export and mapping into the new schema.

---

## Next Step

If you tell me your preference (e.g. “Python + SQLite + web UI” or “Excel-style replacement only”), I can:

1. Draft a **Python script** to export all Paradox `.DB` in this folder to CSV (or SQLite).
2. Propose a **concrete schema** (table list with columns) for one app (e.g. lifeplan or OFFICE).
3. Outline **one sample API + one sample page** (e.g. “list contacts” or “list grantees”) for your chosen stack.

You can keep this document in the PARADOX folder and use it as the master plan for the conversion and upgrades.
