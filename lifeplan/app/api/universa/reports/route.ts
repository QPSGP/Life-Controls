import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type QueryType =
  | "full"
  | "byDate"
  | "byGrantee"
  | "byGrantor"
  | "byTitle"
  | "bySigner"
  | "property"
  | "byDocNumber"
  | "sendTo"
  | "consider"
  | "deed";

/**
 * GET /api/universa/reports
 * query= full | byDate | byGrantee | byGrantor | byTitle | bySigner | property |
 *        byDocNumber | sendTo | consider | deed  (legacy GROSS / QUERY1–style presets)
 * format=json | csv
 * Optional: recordedFrom, recordedTo, name, title, signer, docNumber
 */
export async function GET(req: NextRequest) {
  const verified = await verifyAdminCookie();
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const rawQuery = searchParams.get("query") || "full";
  const query = rawQuery as QueryType;
  const format = searchParams.get("format") || "json";
  const recordedFrom = searchParams.get("recordedFrom")?.trim() || undefined;
  const recordedTo = searchParams.get("recordedTo")?.trim() || undefined;
  const nameSearch = searchParams.get("name")?.trim() || undefined;
  const titleSearch = searchParams.get("title")?.trim() || undefined;
  const signerSearch = searchParams.get("signer")?.trim() || undefined;
  const docNumberSearch = searchParams.get("docNumber")?.trim() || undefined;

  const where = buildWhere(query, {
    recordedFrom,
    recordedTo,
    nameSearch,
    titleSearch,
    signerSearch,
    docNumberSearch,
  });

  try {
    const documents = await prisma.universaDocument.findMany({
      where,
      orderBy: { recordedAt: "desc" },
      take: query === "deed" ? 200 : 500,
      include: {
        grantors: { orderBy: { sortOrder: "asc" } },
        grantees: { orderBy: { sortOrder: "asc" } },
      },
    });

    const rows = mapRows(query, documents);

    if (format === "csv") {
      return csvResponse(query, rows);
    }

    return NextResponse.json({ query, documents: rows });
  } catch (e) {
    console.error("Universa reports API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database error" },
      { status: 500 }
    );
  }
}

function buildWhere(
  query: QueryType,
  opts: {
    recordedFrom?: string;
    recordedTo?: string;
    nameSearch?: string;
    titleSearch?: string;
    signerSearch?: string;
    docNumberSearch?: string;
  }
): Prisma.UniversaDocumentWhereInput {
  const where: Prisma.UniversaDocumentWhereInput = {};

  if (opts.recordedFrom || opts.recordedTo) {
    where.recordedAt = {};
    if (opts.recordedFrom) where.recordedAt.gte = new Date(opts.recordedFrom);
    if (opts.recordedTo) {
      const d = new Date(opts.recordedTo);
      d.setHours(23, 59, 59, 999);
      where.recordedAt.lte = d;
    }
  }

  if (opts.nameSearch && (query === "byGrantee" || query === "byGrantor")) {
    const nameFilter = { contains: opts.nameSearch, mode: "insensitive" as const };
    if (query === "byGrantee") where.grantees = { some: { name: nameFilter } };
    else where.grantors = { some: { name: nameFilter } };
  }

  if (opts.titleSearch && query === "byTitle") {
    where.documentTitle = { contains: opts.titleSearch, mode: "insensitive" };
  }

  if (opts.signerSearch && query === "bySigner") {
    where.OR = [
      { signedBy: { contains: opts.signerSearch, mode: "insensitive" } },
      { signedBy2: { contains: opts.signerSearch, mode: "insensitive" } },
      { signedBy3: { contains: opts.signerSearch, mode: "insensitive" } },
    ];
  }

  if (opts.docNumberSearch && query === "byDocNumber") {
    where.docNumber = { contains: opts.docNumberSearch, mode: "insensitive" };
  }

  return where;
}

type Doc = Prisma.UniversaDocumentGetPayload<{
  include: { grantors: true; grantees: true };
}>;

function isoDate(d: Date | null | undefined): string {
  return d?.toISOString().slice(0, 10) ?? "";
}

function mapRows(query: QueryType, documents: Doc[]): Record<string, unknown>[] {
  switch (query) {
    case "sendTo":
      return documents.map((d) => ({
        id: d.id,
        docNumber: d.docNumber,
        documentTitle: d.documentTitle ?? "",
        recordedAt: isoDate(d.recordedAt),
        sendTo: d.sendTo ?? "",
        sendAdrs: d.sendAdrs ?? "",
        sendAdrs2: d.sendAdrs2 ?? "",
        sendTaxTo: d.sendTaxTo ?? "",
        sendTaxAdrs: d.sendTaxAdrs ?? "",
        sendTaxAdrs2: d.sendTaxAdrs2 ?? "",
        propertyAdrs: d.propertyAdrs ?? "",
        propertyAdrs2: d.propertyAdrs2 ?? "",
        propertyAdrs3: d.propertyAdrs3 ?? "",
        signedBy: d.signedBy ?? "",
        signerTitle: d.signerTitle ?? "",
        signedBy2: d.signedBy2 ?? "",
        signer2Title: d.signer2Title ?? "",
        signedBy3: d.signedBy3 ?? "",
        signer3Title: d.signer3Title ?? "",
        granteeNames: d.grantees.map((g) => g.name).filter(Boolean).join("; "),
        grantorNames: d.grantors.map((g) => g.name).filter(Boolean).join("; "),
      }));

    case "consider":
      return documents.map((d) => ({
        id: d.id,
        docNumber: d.docNumber,
        documentTitle: d.documentTitle ?? "",
        recordedAt: isoDate(d.recordedAt),
        considerationAmt: d.considerationAmt ?? "",
        considerationOther: d.considerationOther ?? "",
        propertyAdrs: d.propertyAdrs ?? "",
        propertyAdrs2: d.propertyAdrs2 ?? "",
      }));

    case "deed": {
      const out: Record<string, unknown>[] = [];
      for (const d of documents) {
        const base = {
          docNumber: d.docNumber,
          documentTitle: d.documentTitle ?? "",
          recordedAt: isoDate(d.recordedAt),
          propertyCounty: d.propertyCounty ?? "",
          lot: d.lot ?? "",
          block: d.block ?? "",
          tract: d.tract ?? "",
          book: d.book ?? "",
          pages: d.pages ?? "",
          parcelNumber: d.parcelNumber ?? "",
          propertyAdrs: d.propertyAdrs ?? "",
          propertyAdrs2: d.propertyAdrs2 ?? "",
          propertyAdrs3: d.propertyAdrs3 ?? "",
          grantorsSummary: d.grantors.map((g) => [g.name, g.percentShare].filter(Boolean).join(" ")).join("; "),
        };
        if (d.grantees.length === 0) {
          out.push({
            id: `${d.id}-none`,
            ...base,
            granteeNumber: "",
            granteeName: "",
            granteePercent: "",
            granteeAddress: "",
          });
        } else {
          for (const g of d.grantees) {
            out.push({
              id: `${d.id}-${g.id}`,
              ...base,
              granteeNumber: g.granteeNumber ?? "",
              granteeName: g.name ?? "",
              granteePercent: g.percentShare ?? "",
              granteeAddress: [g.address, g.address2, g.address3].filter(Boolean).join(", "),
            });
          }
        }
      }
      return out;
    }

    case "property":
      return documents.map((d) => ({
        id: d.id,
        docNumber: d.docNumber,
        documentTitle: d.documentTitle ?? "",
        recordedAt: isoDate(d.recordedAt),
        dateSigned: isoDate(d.dateSigned),
        considerationAmt: d.considerationAmt ?? "",
        propertyCounty: d.propertyCounty ?? "",
        lot: d.lot ?? "",
        block: d.block ?? "",
        tract: d.tract ?? "",
        book: d.book ?? "",
        pages: d.pages ?? "",
        parcelNumber: d.parcelNumber ?? "",
        propertyAdrs: d.propertyAdrs ?? "",
        propertyAdrs2: d.propertyAdrs2 ?? "",
        propertyAdrs3: d.propertyAdrs3 ?? "",
        granteeNames: d.grantees.map((g) => g.name).filter(Boolean).join("; "),
        grantorNames: d.grantors.map((g) => g.name).filter(Boolean).join("; "),
        grantors: d.grantors,
        grantees: d.grantees,
      }));

    default:
      return documents.map((d) => ({
        id: d.id,
        docNumber: d.docNumber,
        documentTitle: d.documentTitle ?? "",
        recordedAt: isoDate(d.recordedAt),
        dateSigned: isoDate(d.dateSigned),
        considerationAmt: d.considerationAmt ?? "",
        propertyCounty: d.propertyCounty ?? "",
        lot: d.lot ?? "",
        block: d.block ?? "",
        tract: d.tract ?? "",
        book: d.book ?? "",
        pages: d.pages ?? "",
        parcelNumber: d.parcelNumber ?? "",
        propertyAdrs: d.propertyAdrs ?? "",
        propertyAdrs2: d.propertyAdrs2 ?? "",
        propertyAdrs3: d.propertyAdrs3 ?? "",
        granteeNames: d.grantees.map((g) => g.name).filter(Boolean).join("; "),
        grantorNames: d.grantors.map((g) => g.name).filter(Boolean).join("; "),
        grantors: d.grantors,
        grantees: d.grantees,
      }));
  }
}

function csvResponse(query: QueryType, rows: Record<string, unknown>[]): NextResponse {
  let header: string;
  let lines: string[];

  if (query === "sendTo") {
    header =
      "Doc #,Title,Recorded,Send to,Send Adrs,Send Adrs 2,Send Tax To,Send Tax Adrs,Send Tax Adrs 2,Property Adrs,Property 2,Property 3,Signed By,Signer Title,Signed By 2,Title 2,Signed By 3,Title 3,Grantees,Grantors\n";
    lines = rows.map((r) =>
      [
        r.docNumber,
        r.documentTitle,
        r.recordedAt,
        r.sendTo,
        r.sendAdrs,
        r.sendAdrs2,
        r.sendTaxTo,
        r.sendTaxAdrs,
        r.sendTaxAdrs2,
        r.propertyAdrs,
        r.propertyAdrs2,
        r.propertyAdrs3,
        r.signedBy,
        r.signerTitle,
        r.signedBy2,
        r.signer2Title,
        r.signedBy3,
        r.signer3Title,
        r.granteeNames,
        r.grantorNames,
      ]
        .map((c) => `"${escapeCsv(String(c ?? ""))}"`)
        .join(",")
    );
    return new NextResponse(header + lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="universa-send-to.csv"',
      },
    });
  }

  if (query === "consider") {
    header = "Doc #,Title,Recorded,Consideration Amt,Consideration Other,Property Adrs,Property Adrs 2\n";
    lines = rows.map((r) =>
      [r.docNumber, r.documentTitle, r.recordedAt, r.considerationAmt, r.considerationOther, r.propertyAdrs, r.propertyAdrs2]
        .map((c) => `"${escapeCsv(String(c ?? ""))}"`)
        .join(",")
    );
    return new NextResponse(header + lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="universa-consideration.csv"',
      },
    });
  }

  if (query === "deed") {
    header =
      "Doc #,Title,Recorded,County,Lot,Block,Tract,Book,Pages,Parcel #,Property 1,Property 2,Property 3,Grantee #,Grantee Name,Grantee %,Grantee Address,Grantors (summary)\n";
    lines = rows.map((r) =>
      [
        r.docNumber,
        r.documentTitle,
        r.recordedAt,
        r.propertyCounty,
        r.lot,
        r.block,
        r.tract,
        r.book,
        r.pages,
        r.parcelNumber,
        r.propertyAdrs,
        r.propertyAdrs2,
        r.propertyAdrs3,
        r.granteeNumber,
        r.granteeName,
        r.granteePercent,
        r.granteeAddress,
        r.grantorsSummary,
      ]
        .map((c) => `"${escapeCsv(String(c ?? ""))}"`)
        .join(",")
    );
    return new NextResponse(header + lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="universa-deed-lines.csv"',
      },
    });
  }

  if (query === "property") {
    header =
      "Doc #,Document Title,Recorded,County,Lot,Block,Tract,Book,Pages,Parcel #,Property Address,Property 2,Property 3,Consideration,Grantee Names,Grantor Names\n";
    lines = rows.map((r) =>
      [
        r.docNumber,
        r.documentTitle,
        r.recordedAt,
        r.propertyCounty,
        r.lot,
        r.block,
        r.tract,
        r.book,
        r.pages,
        r.parcelNumber,
        r.propertyAdrs,
        r.propertyAdrs2,
        r.propertyAdrs3,
        r.considerationAmt,
        r.granteeNames,
        r.grantorNames,
      ]
        .map((c) => `"${escapeCsv(String(c ?? ""))}"`)
        .join(",")
    );
    return new NextResponse(header + lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="universa-documents-property.csv"',
      },
    });
  }

  header =
    "Doc #,Document Title,Recorded,Date Signed,Consideration,County,Property Address,Grantee Names,Grantor Names\n";
  lines = rows.map((r) =>
    [
      r.docNumber,
      r.documentTitle,
      r.recordedAt,
      r.dateSigned,
      r.considerationAmt,
      r.propertyCounty,
      r.propertyAdrs,
      r.granteeNames,
      r.grantorNames,
    ]
      .map((c) => `"${escapeCsv(String(c ?? ""))}"`)
      .join(",")
  );
  return new NextResponse(header + lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="universa-documents.csv"',
    },
  });
}

function escapeCsv(s: string): string {
  return s.replace(/"/g, '""');
}
