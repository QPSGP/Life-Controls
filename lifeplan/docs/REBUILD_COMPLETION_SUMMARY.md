# Rebuild completion summary — all changes

This document lists **all changes** made to complete the UNIVERSA rebuild and related work so you can review and plan improvements.

---

## 1. Phase 4 — Persons and aliases

### New API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/universa/persons` | GET | List all persons (admin). |
| `/api/universa/persons` | POST | Create person (formData: personalId, lastName, firstName, middle); redirects to edit. |
| `/api/universa/persons/[id]` | POST | Update person. |
| `/api/universa/persons/[id]/delete` | POST | Delete person (cascades aliases). |
| `/api/universa/persons/[id]/aliases` | POST | Add alias (formData: aliasIdNum). |
| `/api/universa/persons/[id]/aliases/[aliasId]` | POST | Update alias. |
| `/api/universa/persons/[id]/aliases/[aliasId]/delete` | POST | Delete alias. |

### New admin pages

| Path | Purpose |
|------|---------|
| `/admin/people` | List all persons; add person form; delete per person. |
| `/admin/people/[id]/edit` | Edit person (personalId, lastName, firstName, middle); list/add/edit/delete aliases. |

### Nav

- **Admin dashboard:** Added “People” link next to Documents.

### Import script

- **`scripts/import-universa-csv.js`:** Optional import of persons and person aliases:
  - Looks for `persons.csv` or `PER_ID.csv` or `per_id.csv` in `data/universa/`.
  - Columns: Personal ID, Last Name, First Name, Middle (see UNIVERSA_IMPORT.md).
  - Then looks for `person_aliases.csv` or `PERALIAS.csv`; links to persons by Personal ID; column Alias ID NUM.

---

## 2. Phase 5 — Document workflows and polish

### Duplicate document

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/universa/documents/[id]/duplicate` | POST | Copy document and all grantors/grantees. formData: `newDocNumber` (optional; default: `{docNumber}-copy`). Redirects to edit the new document. |

### Document edit page

- **Header:** “Duplicate document” form: optional “New Doc #” input + button. On success, redirect to new document edit; on duplicate Doc #, shows error “That Doc # is already in use.”

---

## 3. Documentation

### New docs

| File | Purpose |
|------|---------|
| **`docs/UNIVERSA_IMPORT.md`** | CSV import: required/optional files, column names for documents, grantors, grantees, persons, person_aliases; date format; run order. |
| **`docs/REBUILD_CHECKLIST.md`** | Single checklist of every rebuild piece (member side, UNIVERSA, cross-cutting) with status and references. |
| **`docs/REBUILD_COMPLETION_SUMMARY.md`** | This file — all changes for review and improvements. |

### Updated docs

| File | Changes |
|------|---------|
| **`docs/REBUILD_CHECKLIST.md`** | Phase 4 and Phase 5 items marked done (People UI, person/alias import, duplicate document, UNIVERSA_IMPORT.md); “Run entire business” marked done. |

---

## 4. File list (added or modified)

### New files

- `app/api/universa/persons/route.ts`
- `app/api/universa/persons/[id]/route.ts`
- `app/api/universa/persons/[id]/delete/route.ts`
- `app/api/universa/persons/[id]/aliases/route.ts`
- `app/api/universa/persons/[id]/aliases/[aliasId]/route.ts`
- `app/api/universa/persons/[id]/aliases/[aliasId]/delete/route.ts`
- `app/admin/(protected)/people/page.tsx`
- `app/admin/(protected)/people/[id]/edit/page.tsx`
- `app/api/universa/documents/[id]/duplicate/route.ts`
- `docs/UNIVERSA_IMPORT.md`
- `docs/REBUILD_CHECKLIST.md`
- `docs/REBUILD_COMPLETION_SUMMARY.md`

### Modified files

- `app/admin/(protected)/AdminDashboardClient.tsx` — Added “People” link in header.
- `app/admin/(protected)/documents/[id]/edit/page.tsx` — Duplicate document form in header; error messages for duplicate/copy.
- `scripts/import-universa-csv.js` — Person and person-alias import (normPerson, normPersonAlias; persons.csv / PERALIAS.csv).
- `docs/REBUILD_CHECKLIST.md` — Status updates for Phase 4/5 and “run entire business.”

---

## 5. What’s left (optional)

- **Link grantor/grantee to Person:** Optional dropdown/search on document edit to link a party to UniversaPerson.
- **BIZLEGAL.VAL:** Recreate validation only if you recover rules (legacy file is binary).
- **CNTYCLRK:** Only if you add county clerk content to the legacy folder.
- **Portal document view:** Optional read-only Documents/Recordings view for members.
- **Form validation:** Extra client- or server-side checks (e.g. required fields, date ranges) where you want them.

---

## 6. How to review and improve

1. **Run the app:** `cd lifeplan && npm run dev`; open Admin → People, Admin → Documents → edit → Duplicate document.
2. **Import test data:** Put sample CSVs in `data/universa/` and run `node --env-file=.env scripts/import-universa-csv.js` (see UNIVERSA_IMPORT.md).
3. **Checklist:** Use `docs/REBUILD_CHECKLIST.md` for full picture and remaining optional items.
4. **Improvements:** Use this summary to decide next steps (e.g. grantor/grantee → Person link, validation, portal docs).
