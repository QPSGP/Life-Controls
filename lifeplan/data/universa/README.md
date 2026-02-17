# UNIVERSA business demo data

Place CSV files here for import:

- **documents.csv** or **GRANTDEE.csv** — one row per document (must include `Doc. #` or `docNumber`)
- **grantors.csv** or **GRANTORS.csv** — one row per grantor (must include `Doc. #` linking to document)
- **grantees.csv** or **GRANTEES.csv** — one row per grantee (must include `Doc. #` linking to document)

Then run: `npm run db:import:universa`

See `docs/UNIVERSA_CATALOG.md` for full column names and `scripts/import-universa-csv.js` for mapping.
