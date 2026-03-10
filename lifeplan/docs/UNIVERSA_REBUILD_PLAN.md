# UNIVERSA rebuild plan — phased mapping to Sovereign Life Control Tool

**Goal:** Rebuild the full UNIVERSA business system inside the existing app, with **business and forms** prioritized. Use **UNIVERSA_ANALYSIS.md** for the catalog of legacy tables and queries.

**Strategy:** Add UNIVERSA as the **business module** in the current Sovereign Life Control Tool app (one codebase, one deployment). Do **not** rebuild from scratch.

---

## Current state (already in lifeplan)

| Area | Status |
|------|--------|
| **Data model** | UniversaDocument, UniversaDocumentGrantor, UniversaDocumentGrantee, UniversaPerson, UniversaPersonAlias in Prisma; aligned with GRANTDEE, GRANTORS, GRANTEES, PER_ID, PERALIAS. |
| **Admin → Documents** | List, new, edit; grantors/grantees per document; CRUD APIs. |
| **Admin → Documents → Reports** | Full list, by recorded date range, by grantee name, by grantor name; JSON + CSV. |
| **Import** | `scripts/import-universa-csv.js` for documents, grantors, grantees from CSV. |
| **Gaps** | Persons/aliases have no UI or import; some report variants (by title, by signer, before date) missing; document form may not expose all fields; no “record new document” wizard; BIZLEGAL.VAL not recreated. |

---

## Phase 1: Data model and import (already done; small extensions only)

**Objective:** Ensure the schema and import path fully support UNIVERSA data and any new fields we need.

- [x] UniversaDocument, UniversaDocumentGrantor, UniversaDocumentGrantee in Prisma (done).
- [x] UniversaPerson, UniversaPersonAlias in Prisma (done).
- [ ] **Optional:** Add any missing GRANTDEE fields found when comparing to BEF90.QBE / QUERY1 (e.g. extra address or signing fields) and run a migration.
- [ ] **Optional:** Extend `import-universa-csv.js` to support Person/PersonAlias CSV if you have PER_ID/PERALIAS exports.
- [ ] **Optional:** Document the exact CSV column names and formats for GRANTDEE/GRANTORS/GRANTEES (and persons) in a short doc (e.g. `docs/UNIVERSA_IMPORT.md`).

**Output:** Schema and import script are the single source of truth for UNIVERSA data; business demo can be loaded from CSV.

---

## Phase 2: Forms (prioritize business and completeness)

**Objective:** Document and grantor/grantee forms are complete, easy to use, and match legacy workflow.

1. **Document form (admin)**
   - [x] Audit the document edit form against **UNIVERSA_ANALYSIS.md** (all GRANTDEE fields). Ensure every field that exists in Prisma is editable (or explicitly hidden with a reason).
   - [x] Group fields into logical sections (Document, Recording, Property, Consideration, Send to / Tax, Signing / Notary, Comments) so the form is easy to follow.
   - [ ] Add validation where it matters (e.g. doc number required, dates valid). Reimplement any BIZLEGAL.VAL rules that are still relevant, if you have a spec.

2. **Grantor / grantee forms**
   - [x] Ensure inline or modal add/edit for grantors and grantees on the document page is complete (grantor/grantee #, name, address 1–3, % share, comment).
   - [ ] Optional: Allow linking a grantor/grantee to **UniversaPerson** (dropdown or search) when Person/alias UI exists.

3. **“Record new document” wizard**
   - [x] Multi-step flow: (1) Doc # and basic info, (2) Property, (3) Grantors, (4) Grantees, (5) Review. Entry point: Documents → "Record new (wizard)".

**Output:** Business users can enter and edit documents and parties without missing fields or confusion.

---

## Phase 3: Reports and query parity

**Objective:** Cover the main GROSS (and root) query patterns so reports replace the legacy .QBE usage.

| Legacy pattern | Current lifeplan | Action |
|----------------|------------------|--------|
| Full list (all fields) | ✅ full + byDate, byGrantee, byGrantor | Keep; ensure CSV/JSON include all needed columns. |
| By recorded date range | ✅ byDate | Done. |
| By grantee name | ✅ byGrantee | Done. |
| By grantor name | ✅ byGrantor | Done. |
| By document title (e.g. “Judgement”) | ❌ | Add report filter or report type “byTitle” with title search. |
| By signer (e.g. “Bernard Gross”) | ❌ | Add filter/report “bySigner” on signedBy / signedBy2 / signedBy3. |
| Recorded before date (e.g. BEF90) | Partially (date range) | Either document “recorded before” in UI or add “beforeDate” param to reports API. |
| Property-focused (County, Lot, Block, Tract, Book, Pages, Parcel, Adrs) | In full export | Optional: add “property” report view that emphasizes property columns. |

**Tasks:**

- [x] Add **byTitle** (query=byTitle&title=...) to Documents Reports UI and `/api/universa/reports`.
- [x] Add **bySigner** (search on signedBy, signedBy2, signedBy3) to Reports and API.
- [x] Date range (recordedFrom / recordedTo) already supports “before date” (set Recorded to = that date).
- [x] **Property** report preset: query=property returns same data with columns County, Lot, Block, Tract, Book, Pages, Parcel #, Property 1–3; CSV and table.

**Output:** All high-value legacy queries are available in the app; no need to run Paradox for standard reports.

---

## Phase 4: Persons and aliases (PER_ID / PERALIAS)

**Objective:** Support people and aliases so grantors/grantees can optionally link to a central person record.

1. **Admin UI**
   - [ ] **Admin → Documents** (or new **Admin → People**): list UniversaPerson; add, edit, delete.
   - [ ] Per person: list aliases (UniversaPersonAlias); add, edit, delete alias.
   - [ ] Optional: from grantor/grantee form, “Link to person” dropdown/search.

2. **Import**
   - [ ] Extend `import-universa-csv.js` (or add a second script) to import Person and PersonAlias from CSV if you have PER_ID/PERALIAS exports.

3. **Schema**
   - [ ] Optional: add `universaPersonId` to UniversaDocumentGrantor and UniversaDocumentGrantee if you want a direct FK to UniversaPerson (otherwise link in app logic only).

**Output:** One place to manage people and aliases; optional link from document parties to those records.

---

## Phase 5: Polish and optional extensions

**Objective:** Match remaining legacy behavior and improve UX.

- [ ] **CNTYCLRK:** If the legacy CNTYCLRK folder gets content (e.g. county clerk–specific tables or forms), catalog them in UNIVERSA_ANALYSIS.md and add a small phase for schema + list/form.
- [ ] **BIZLEGAL.VAL:** If you recover validation rules (e.g. from docs or memory), add them to document/grantor/grantee forms or API.
- [ ] **Document-centric workflows:** E.g. “Duplicate document,” “Clone grantors from another doc,” or templates for common document types.
- [ ] **Portal (member) read-only:** If members should see UNIVERSA data, add a restricted “Documents” or “Recordings” view in the portal (e.g. only documents linked to their member or their plan). Lower priority unless required.

---

## Suggested order of work (summary)

| Order | Phase | Focus |
|-------|--------|--------|
| 1 | Phase 1 | Data model + import (small extensions; most done). |
| 2 | **Phase 2** | **Forms** — full document form, grantor/grantee, optional wizard. |
| 3 | **Phase 3** | **Reports** — byTitle, bySigner, date bounds, optional property view. |
| 4 | Phase 4 | Persons and aliases UI + import + optional link from grantor/grantee. |
| 5 | Phase 5 | CNTYCLRK (if needed), validation, workflows, portal. |

**Priorities:** Business and forms first (Phase 2), then reports (Phase 3), then persons/aliases (Phase 4), then polish (Phase 5).

---

## References

- **UNIVERSA_ANALYSIS.md** — Tables, fields, and query list from the UNIVERSA folder.
- **UNIVERSA_STRATEGY.md** — Why we add UNIVERSA to the current app (no rebuild from scratch).
- **lifeplan/prisma/schema.prisma** — UniversaDocument, UniversaDocumentGrantor, UniversaDocumentGrantee, UniversaPerson, UniversaPersonAlias.
- **lifeplan/app/admin/(protected)/documents/** — Document list, new, edit, reports.
- **lifeplan/app/api/universa/** — Documents, grantors, grantees, reports APIs.
