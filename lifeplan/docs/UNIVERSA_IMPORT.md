# UNIVERSA CSV import — column names and format

Use **`node --env-file=.env scripts/import-universa-csv.js`** to import UNIVERSA data from CSV files. Place files in **`data/universa/`** (or set env **`DATA_DIR`**).

---

## Required / optional files

| File | Source table | Required | Purpose |
|------|--------------|----------|---------|
| documents.csv (or GRANTDEE.csv, grantdee.csv) | GRANTDEE | Yes | Documents; must have **Doc. #** or **docNumber** |
| grantors.csv (or GRANTORS.csv) | GRANTORS | No | Grantors per document; must have **Doc. #** linking to documents |
| grantees.csv (or GRANTEES.csv) | GRANTEES | No | Grantees per document; must have **Doc. #** |
| persons.csv (or PER_ID.csv, per_id.csv) | PER_ID | No | People (Personal ID, Last Name, First Name, Middle) |
| person_aliases.csv (or PERALIAS.csv, peralias.csv) | PERALIAS | No | Aliases per person; must have **Personal ID** (or **Personal ID NUM**) linking to persons |

---

## Document columns (GRANTDEE)

Headers are normalized (spaces trimmed; alternate names accepted). Empty rows skipped.

| Column name(s) accepted | Prisma field |
|-------------------------|--------------|
| Doc. #, Doc.#, docNumber, Doc Number | docNumber (required) |
| Document Number, documentNumberAlt | documentNumberAlt |
| Recorded, recordedAt | recordedAt (date) |
| Document Title, documentTitle | documentTitle |
| Rec.req.by, recReqBy | recReqBy |
| Send to, sendTo | sendTo |
| Send adrs, sendAdrs | sendAdrs |
| Send adrs2, sendAdrs2 | sendAdrs2 |
| Send Tax To, sendTaxTo | sendTaxTo |
| Send Tax Adrs, sendTaxAdrs | sendTaxAdrs |
| Send Tax Adrs2, sendTaxAdrs2 | sendTaxAdrs2 |
| Consideration Amt, considerationAmt | considerationAmt |
| Consideration Other, considerationOther | considerationOther |
| Property County, propertyCounty | propertyCounty |
| Lot:, Lot, lot | lot |
| Block, block | block |
| Tract:, Tract, tract | tract |
| Book:, Book, book | book |
| Pages, pages | pages |
| Parcel #, parcelNumber | parcelNumber |
| Property Adrs, propertyAdrs | propertyAdrs |
| Property Adrs2, propertyAdrs2 | propertyAdrs2 |
| Property Adrs3, propertyAdrs3 | propertyAdrs3 |
| Notary name, notaryName | notaryName |
| Notarization date, notarizationDate | notarizationDate (date) |
| Comments, comments | comments |
| Signed By:, signedBy | signedBy |
| SignerTitle, signerTitle | signerTitle |
| Date Signed, dateSigned | dateSigned (date) |
| Signed By2:, signedBy2 | signedBy2 |
| Signer2 Title, signer2Title | signer2Title |
| Signed By3:, signedBy3 | signedBy3 |
| Signer3Title, signer3Title | signer3Title |
| # of Pages, numberOfPages | numberOfPages (number) |

---

## Grantor columns (GRANTORS)

| Column name(s) | Prisma field |
|----------------|--------------|
| Doc. #, Doc.#, docNumber | (links to document) |
| Grantor#, Grantor #, grantorNumber | grantorNumber |
| Grantor Name, name | name |
| Grantor Address, address | address |
| Grantor Address2, address2 | address2 |
| Grantor Address3, address3 | address3 |
| %, percentShare | percentShare |
| Comment, comment | comment |

---

## Grantee columns (GRANTEES)

| Column name(s) | Prisma field |
|----------------|--------------|
| Doc. #, Doc.#, docNumber | (links to document) |
| Grantee #, Grantee#, granteeNumber | granteeNumber |
| Grantee Name, name | name |
| Grantee Address, address | address |
| Grantee Address2, address2 | address2 |
| Grantee Address3, address3 | address3 |
| %, percentShare | percentShare |
| Comment, comment | comment |

---

## Person columns (PER_ID)

| Column name(s) | Prisma field |
|----------------|--------------|
| Personal ID, personalId, Personal ID NUM | personalId (unique) |
| Last Name, lastName | lastName |
| First Name, firstName | firstName |
| Middle, middle | middle |

---

## Person alias columns (PERALIAS)

| Column name(s) | Prisma field |
|----------------|--------------|
| Personal ID, Personal ID NUM, personalId | (links to person by personalId) |
| Alias ID NUM, aliasIdNum, Alias ID | aliasIdNum |

---

## Dates

Date columns (Recorded, Notarization date, Date Signed) accept any format `Date` can parse (e.g. ISO YYYY-MM-DD, or locale dates).

## Run order

1. Documents are upserted by **Doc. #** (create or update).
2. Grantors and grantees are created and linked to documents by **Doc. #**.
3. Persons are created (by personalId if present; duplicates by personalId are skipped).
4. Person aliases are created and linked to persons by **Personal ID**.
