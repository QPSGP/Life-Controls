# UNIVERSA table catalog (business demo)

Inferred from PARADOX UNIVERSA QBE files. Use this for Prisma schema and CSV import.

---

## Core tables for business demo

### GRANTDEE — Document / recording (main record per document)

| Legacy field | Type (suggested) | Notes |
|--------------|------------------|--------|
| Doc. # | String (unique) | Document number — link to GRANTEES/GRANTORS |
| Document Number | String? | Alternate doc number (CORPADRS) |
| Recorded | DateTime? | Date recorded |
| Document Title | String? | |
| Rec.req.by | String? | Recording requested by |
| Send to | String? | |
| Send adrs | String? | Send address |
| Send adrs2 | String? | |
| Send Tax To | String? | |
| Send Tax Adrs | String? | |
| Send Tax Adrs2 | String? | |
| Consideration Amt | Decimal/String? | Consideration amount |
| Consideration Other | String? | |
| Property County | String? | |
| Lot: | String? | |
| Block | String? | |
| Tract: | String? | |
| Book: | String? | |
| Pages | String? | |
| Parcel # | String? | |
| Property Adrs | String? | Property address |
| Property Adrs2 | String? | |
| Property Adrs3 | String? | |
| Notary name | String? | |
| Notarization date | DateTime? | |
| Comments | String? | |
| Signed By: | String? | |
| SignerTitle | String? | |
| Date Signed | DateTime? | |
| Signed By2: | String? | |
| Signer2 Title | String? | |
| Signed By3: | String? | |
| Signer3Title | String? | |
| # of Pages | Int? | |

### GRANTEES — Grantees per document

| Legacy field | Type (suggested) | Notes |
|--------------|------------------|--------|
| Doc. # | String | FK to document |
| Grantee # | String? | Grantee number on doc |
| Grantee Name | String? | |
| Grantee Address | String? | |
| Grantee Address2 | String? | |
| Grantee Address3 | String? | |
| % | String? | Percentage / share |
| Comment | String? | |

### GRANTORS — Grantors per document

| Legacy field | Type (suggested) | Notes |
|--------------|------------------|--------|
| Doc. # | String | FK to document |
| Grantor# | String? | Grantor number on doc |
| Grantor Name | String? | |
| Grantor Address | String? | |
| Grantor Address2 | String? | |
| Grantor Address3 | String? | |
| % | String? | Percentage / share |
| Comment | String? | |

### PER_ID — Personal ID (people)

| Legacy field | Type (suggested) | Notes |
|--------------|------------------|--------|
| Personal ID | String (unique?) | |
| Last Name | String? | |
| First Name | String? | |
| Middle | String? | |

### PERALIAS — Aliases for persons

| Legacy field | Type (suggested) | Notes |
|--------------|------------------|--------|
| Personal ID | String? | FK to PER_ID |
| Alias ID NUM | String? | Alias identifier |

---

## Other UNIVERSA tables (OFFICE/UNIVERSA)

Not modeled in first pass; can add later: ALIASES, BIZFACTS, BIZLEGAL, BIZLINK, BIZ_ID, BIZ_LIC, B_ROSTER, CATAGORY, CATALOG1, CLAN, COMM_LOG, DATE, DR_LIC, EDUCAT, EVENTS, FAMILY, HEALTH, INS_LOK, INS_LOOK, LEADS, LEGAL, LICENSES, LINEITEM, LINKS, LOCATION, NAMES, NAMEVIEW, ORDERS, PHONES, PROPERTY, PROPXFER, REALESTA, REALPROP, RESUME, SS#, STATE, STOCK, TO_DO, USER, USER_ID, USRBIZID, VEHICLES, etc.

GROSS-specific: GRANTEE4, GRANTEE5, BEF90, BEROCAL, COMPS, etc. — may be query results or alternate structures; treat as secondary.

---

## Import

1. Export GRANTDEE, GRANTEES, GRANTORS from Paradox to CSV (one file per table). Save as:
   - `documents.csv` or `GRANTDEE.csv` (documents)
   - `grantors.csv` or `GRANTORS.csv`
   - `grantees.csv` or `GRANTEES.csv`
2. Create folder `data/universa/` in the project root and put the CSV files there (or set `DATA_DIR` to your folder).
3. Run: `npm run db:import:universa` (uses `.env` for `DATABASE_URL`).
4. Script upserts documents by Doc. # and creates grantors/grantees linked to documents. Re-running will re-upsert documents and **add** grantor/grantee rows (clear tables first if you need a clean re-import).
