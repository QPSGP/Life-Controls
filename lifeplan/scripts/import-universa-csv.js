/**
 * Import UNIVERSA business demo data from CSV files.
 *
 * Prerequisites:
 *   1. Export Paradox GRANTDEE, GRANTEES, GRANTORS to CSV (one file per table).
 *   2. Place CSVs in data/universa/ (or set env DATA_DIR).
 *   3. Run: node --env-file=.env scripts/import-universa-csv.js
 *
 * Expected files (names flexible; see header mapping below):
 *   - documents.csv (from GRANTDEE) — must have Doc. # or docNumber
 *   - grantors.csv (from GRANTORS) — must have Doc. #
 *   - grantees.csv (from GRANTEES) — must have Doc. #
 *
 * Headers are normalized: spaces trimmed, "Doc. #" -> docNumber, etc.
 * Empty rows are skipped.
 */

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data", "universa");

// Simple CSV parse: split by comma, strip quotes from each cell
function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, "").trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every((v) => !v || !String(v).trim())) continue;
    const row = {};
    headers.forEach((h, j) => {
      row[h] = values[j] != null ? String(values[j]).trim() : "";
    });
    rows.push(row);
  }
  return { headers, rows };
}

function parseCSVLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || (c === "\n" && !inQuotes)) {
      out.push(cur.trim());
      cur = "";
      if (c === "\n") break;
    } else {
      cur += c;
    }
  }
  out.push(cur.trim());
  return out;
}

// Map legacy CSV column names to Prisma field names
function normDoc(row) {
  const get = (.../***/ keys) => {
    for (const k of keys) {
      const v = row[k];
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
    return null;
  };
  const docNumber = get("Doc. #", "Doc.#", "docNumber", "Doc Number");
  if (!docNumber) return null;
  return {
    docNumber,
    documentNumberAlt: get("Document Number", "documentNumberAlt"),
    recordedAt: parseDate(get("Recorded", "recordedAt")),
    documentTitle: get("Document Title", "documentTitle"),
    recReqBy: get("Rec.req.by", "recReqBy"),
    sendTo: get("Send to", "sendTo"),
    sendAdrs: get("Send adrs", "sendAdrs"),
    sendAdrs2: get("Send adrs2", "sendAdrs2"),
    sendTaxTo: get("Send Tax To", "sendTaxTo"),
    sendTaxAdrs: get("Send Tax Adrs", "sendTaxAdrs"),
    sendTaxAdrs2: get("Send Tax Adrs2", "sendTaxAdrs2"),
    considerationAmt: get("Consideration Amt", "considerationAmt"),
    considerationOther: get("Consideration Other", "considerationOther"),
    propertyCounty: get("Property County", "propertyCounty"),
    lot: get("Lot:", "Lot", "lot"),
    block: get("Block", "block"),
    tract: get("Tract:", "Tract", "tract"),
    book: get("Book:", "Book", "book"),
    pages: get("Pages", "pages"),
    parcelNumber: get("Parcel #", "parcelNumber"),
    propertyAdrs: get("Property Adrs", "propertyAdrs"),
    propertyAdrs2: get("Property Adrs2", "propertyAdrs2"),
    propertyAdrs3: get("Property Adrs3", "propertyAdrs3"),
    notaryName: get("Notary name", "notaryName"),
    notarizationDate: parseDate(get("Notarization date", "notarizationDate")),
    comments: get("Comments", "comments"),
    signedBy: get("Signed By:", "signedBy"),
    signerTitle: get("SignerTitle", "signerTitle"),
    dateSigned: parseDate(get("Date Signed", "dateSigned")),
    signedBy2: get("Signed By2:", "signedBy2"),
    signer2Title: get("Signer2 Title", "signer2Title"),
    signedBy3: get("Signed By3:", "signedBy3"),
    signer3Title: get("Signer3Title", "signer3Title"),
    numberOfPages: parseInt(get("# of Pages", "numberOfPages"), 10) || null,
  };
}

function normGrantor(row, docId) {
  const get = (...keys) => {
    for (const k of keys) {
      const v = row[k];
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
    return null;
  };
  return {
    documentId: docId,
    grantorNumber: get("Grantor#", "Grantor #", "grantorNumber"),
    name: get("Grantor Name", "name"),
    address: get("Grantor Address", "address"),
    address2: get("Grantor Address2", "address2"),
    address3: get("Grantor Address3", "address3"),
    percentShare: get("%", "percentShare"),
    comment: get("Comment", "comment"),
  };
}

function normGrantee(row, docId) {
  const get = (...keys) => {
    for (const k of keys) {
      const v = row[k];
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
    return null;
  };
  return {
    documentId: docId,
    granteeNumber: get("Grantee #", "Grantee#", "granteeNumber"),
    name: get("Grantee Name", "name"),
    address: get("Grantee Address", "address"),
    address2: get("Grantee Address2", "address2"),
    address3: get("Grantee Address3", "address3"),
    percentShare: get("%", "percentShare"),
    comment: get("Comment", "comment"),
  };
}

function parseDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.log("Data dir not found:", DATA_DIR);
    console.log("Create it and add documents.csv, grantors.csv, grantees.csv (exported from Paradox).");
    process.exit(1);
  }

  const docPath = ["documents.csv", "GRANTDEE.csv", "grantdee.csv"].find((f) =>
    fs.existsSync(path.join(DATA_DIR, f))
  );
  const grantorPath = ["grantors.csv", "GRANTORS.csv"].find((f) =>
    fs.existsSync(path.join(DATA_DIR, f))
  );
  const granteePath = ["grantees.csv", "GRANTEES.csv"].find((f) =>
    fs.existsSync(path.join(DATA_DIR, f))
  );

  if (!docPath) {
    console.log("No documents CSV found in", DATA_DIR);
    process.exit(1);
  }

  const docContent = fs.readFileSync(path.join(DATA_DIR, docPath), "utf8");
  const { rows: docRows } = parseCSV(docContent);
  const docs = docRows.map(normDoc).filter(Boolean);
  if (docs.length === 0) {
    console.log("No valid document rows (need 'Doc. #' or docNumber column).");
    process.exit(1);
  }

  const docNumberToId = {};
  for (const d of docs) {
    const created = await prisma.universaDocument.upsert({
      where: { docNumber: d.docNumber },
      update: d,
      create: d,
    });
    docNumberToId[created.docNumber] = created.id;
  }
  console.log("Upserted", docs.length, "documents.");

  if (grantorPath) {
    const content = fs.readFileSync(path.join(DATA_DIR, grantorPath), "utf8");
    const { rows } = parseCSV(content);
    let count = 0;
    for (const row of rows) {
      const docNum = row["Doc. #"] || row["Doc.#"] || row.docNumber;
      if (!docNum || !docNumberToId[docNum.trim()]) continue;
      const payload = normGrantor(row, docNumberToId[docNum.trim()]);
      await prisma.universaDocumentGrantor.create({ data: payload });
      count++;
    }
    console.log("Created", count, "grantors.");
  }

  if (granteePath) {
    const content = fs.readFileSync(path.join(DATA_DIR, granteePath), "utf8");
    const { rows } = parseCSV(content);
    let count = 0;
    for (const row of rows) {
      const docNum = row["Doc. #"] || row["Doc.#"] || row.docNumber;
      if (!docNum || !docNumberToId[docNum.trim()]) continue;
      const payload = normGrantee(row, docNumberToId[docNum.trim()]);
      await prisma.universaDocumentGrantee.create({ data: payload });
      count++;
    }
    console.log("Created", count, "grantees.");
  }

  console.log("UNIVERSA import done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
