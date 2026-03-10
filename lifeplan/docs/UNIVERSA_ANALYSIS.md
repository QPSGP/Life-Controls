# UNIVERSA folder — analysis and structure

**Purpose:** Catalog what exists in the legacy UNIVERSA folder (and OFFICE/UNIVERSA) so we can map it to the Sovereign Life Control Tool and plan the rebuild. Use with **UNIVERSA_REBUILD_PLAN.md** for phases and priorities.

---

## 1. Folder structure

```
PARADOX/
├── UNIVERSA/
│   ├── PDOXWORK.INI          # Folder config (empty)
│   ├── BIZLEGAL.VAL          # Validation (binary; Paradox)
│   ├── QUERY1.QBE            # Query: GRANTDEE + GRANTEES + GRANTORS (deed-style)
│   ├── QALIAS.QBE            # Query: PER_ID + PERALIAS (personal ID & aliases)
│   ├── GROSS/                # Report/query set (named “GROSS”)
│   │   ├── 1.QBE             # Grantees by Doc #
│   │   ├── 1Q.QBE            # Send to, Property Adrs, Signed By
│   │   ├── 2.QBE             # Documents with “Judgement” in title
│   │   ├── 3.QBE             # GRANTDEE + GRANTEES + GRANTORS (doc, recorded, title, addresses)
│   │   ├── 4.QBE             # Full property (County, Lot, Block, Tract, Book, Pages, Parcel, Adrs 1–3)
│   │   ├── BEF90.QBE         # Full document + grantee + grantor (all fields, recorded < 02/28/90)
│   │   ├── CONSIDER.QBE      # Property Adrs 1–2
│   │   ├── CORPADRS.QBE      # Document Number, Signed By (Bernard Gross), SignerTitle
│   │   ├── DATECOMP.QBE      # Grantees by name (Cambridge) + Doc, Recorded, Title
│   │   ├── DATGRNTR.QBE      # Grantors by name (Chris) + Doc, Recorded
│   └── CNTYCLRK/
│       └── PDOXWORK.INI      # Folder config (empty)
│
└── OFFICE/UNIVERSA/          # Mirror of UNIVERSA (same QBE/VAL files)
```

- **.QBE** = Paradox Query files; they reference **.DB** tables and define which fields are selected/checked. Table and field names are inferred from the QBE text.
- **.VAL** = Paradox validity/constraint (binary); not human-readable; logic would need to be reimplemented from memory or from app behavior.
- No .DB or .FSL/.RSL files are present in the repo; only the query definitions. Actual data lives elsewhere (export to CSV for import).

---

## 2. Tables inferred from QBE files

### 2.1 GRANTDEE.DB (documents / recordings)

| Field (from QBE)        | Purpose / notes                    |
|-------------------------|------------------------------------|
| Doc. #                  | Document number (primary key)      |
| Document Number         | Alternate doc number               |
| Recorded                | Recorded date                      |
| Document Title          | Title of document                  |
| Rec.req.by              | Recording requested by             |
| Send to                 | Send to (party)                    |
| Send adrs, Send adrs2   | Send address lines                 |
| Send Tax To             | Send tax to (party)                |
| Send Tax Adrs, Send Tax Adrs2 | Send tax address            |
| Consideration Amt       | Consideration amount               |
| Consideration Other      | Other consideration               |
| Property County         | County                             |
| Lot:, Block, Tract:     | Property lot/block/tract            |
| Book:, Pages            | Book and pages                     |
| Parcel #                | Parcel number                      |
| Property Adrs, 2, 3      | Property address lines             |
| Notary name             | Notary                             |
| Notarization date       | Notarization date                  |
| Comments                | Comments                           |
| Signed By:, Signed By2:, Signed By3: | Signers                    |
| SignerTitle, Signer2 Title, Signer3Title | Signer titles            |
| Date Signed             | Date signed                        |
| # of Pages              | Number of pages                    |

### 2.2 GRANTEES.DB (per-document grantees)

| Field (from QBE)   | Purpose / notes        |
|--------------------|------------------------|
| Doc. #             | Link to GRANTDEE       |
| Grantee #          | Grantee number         |
| Grantee Name       | Name                   |
| Grantee Address, 2, 3 | Address lines      |
| %                  | Percent share          |
| Comment            | Comment                |

### 2.3 GRANTORS.DB (per-document grantors)

| Field (from QBE)   | Purpose / notes        |
|--------------------|------------------------|
| Doc. #             | Link to GRANTDEE       |
| Grantor#           | Grantor number         |
| Grantor Name       | Name                   |
| Grantor Address, 2, 3 | Address lines      |
| %                  | Percent share          |
| Comment            | Comment                |

### 2.4 PER_ID.DB (personal ID / people)

| Field (from QBE) | Purpose / notes   |
|------------------|-------------------|
| Personal ID      | Primary key        |
| Last Name        | Last name          |
| First Name       | First name         |
| Middle           | Middle name        |

### 2.5 PERALIAS.DB (aliases for people)

| Field (from QBE) | Purpose / notes   |
|------------------|-------------------|
| Alias ID NUM     | Links to PER_ID (elem1 in QBE) |

---

## 3. Main query/report patterns (GROSS and root)

| Query file   | Intent (inferred) |
|--------------|-------------------|
| QUERY1       | Deed-style view: doc + recorded + title + property (Lot, Block, Tract, Book, Pages, Parcel, Property Adrs) + grantee/grantor with % |
| QALIAS       | Personal ID with last/first/middle + alias ID |
| GROSS/1.QBE  | Grantees by Doc # |
| GROSS/1Q.QBE | Send to, Property Adrs, Signed By |
| GROSS/2.QBE  | Documents with “Judgement” in title |
| GROSS/3.QBE  | Doc + recorded + title + property + grantee/grantor (linked) |
| GROSS/4.QBE  | Full property (County, Lot, Block, Tract, Book, Pages, Parcel, Adrs 1–3) |
| GROSS/BEF90  | Full document + grantee + grantor; filter recorded &lt; 02/28/90 |
| GROSS/CONSIDER | Property Adrs 1–2 |
| GROSS/CORPADRS | Document by signer (e.g. “Bernard Gross”) + title |
| GROSS/DATECOMP | By grantee name (e.g. “Cambridge”) + doc, recorded, title |
| GROSS/DATGRNTR | By grantor name (e.g. “Chris”) + doc, recorded |

So the **business logic** is: **documents (GRANTDEE)** with **grantors** and **grantees** per doc; optional **persons and aliases (PER_ID, PERALIAS)**; and **reports** by date, grantee name, grantor name, title search, and full export.

---

## 4. What the current app already has (lifeplan)

- **Prisma:** `UniversaDocument`, `UniversaDocumentGrantor`, `UniversaDocumentGrantee`, `UniversaPerson`, `UniversaPersonAlias` — fields aligned with GRANTDEE / GRANTORS / GRANTEES / PER_ID / PERALIAS.
- **Admin UI:** Documents list, new document, edit document; grantors/grantees per document; Documents → Reports (full, by date range, by grantee name, by grantor name; JSON + CSV).
- **API:** `/api/universa/documents`, `/api/universa/documents/[id]`, grantors/grantees sub-routes; `/api/universa/reports?query=...&format=json|csv`; delete grantor/grantee.
- **Import:** `scripts/import-universa-csv.js` for CSV from GRANTDEE, GRANTORS, GRANTEES.

**Gaps vs legacy:**

- **PER_ID / PERALIAS:** Schema exists; no admin UI or import for persons/aliases yet; no link from grantor/grantee to UniversaPerson.
- **Forms:** Document form may not expose every GRANTDEE field; no “record new document” wizard.
- **Reports:** By date, grantee, grantor, full are done; no dedicated “by title text” (e.g. Judgement), “by signer,” or “before date” (e.g. BEF90) report views.
- **BIZLEGAL.VAL:** Validation rules not recreated (binary file).

---

## 5. Summary

| Legacy item        | In repo (UNIVERSA folder)     | In lifeplan app                          |
|--------------------|-------------------------------|------------------------------------------|
| GRANTDEE           | Referenced in QBE only        | ✅ UniversaDocument + admin + API         |
| GRANTEES           | Referenced in QBE only        | ✅ UniversaDocumentGrantee + admin + API |
| GRANTORS           | Referenced in QBE only        | ✅ UniversaDocumentGrantor + admin + API |
| PER_ID             | Referenced in QALIAS.QBE      | ✅ UniversaPerson (schema only)          |
| PERALIAS           | Referenced in QALIAS.QBE      | ✅ UniversaPersonAlias (schema only)     |
| GROSS queries      | 10 .QBE files                 | Partially: byDate, byGrantee, byGrantor, full |
| CNTYCLRK           | Empty folder                  | Not implemented                          |
| BIZLEGAL.VAL       | Binary                        | Not reimplemented                        |

Use **UNIVERSA_REBUILD_PLAN.md** for the phased plan that maps this into the next steps (data model, forms, reports, optional persons/aliases UI and import).
