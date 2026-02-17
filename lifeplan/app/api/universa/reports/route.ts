import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/universa/reports — query-style report. query=byDate | byGrantee | byGrantor | full. format=json | csv */
export async function GET(req: NextRequest) {
  const verified = await verifyAdminCookie();
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("query") || "full";
  const format = searchParams.get("format") || "json";
  const recordedFrom = searchParams.get("recordedFrom")?.trim() || undefined;
  const recordedTo = searchParams.get("recordedTo")?.trim() || undefined;
  const nameSearch = searchParams.get("name")?.trim() || undefined;

  const where: Prisma.UniversaDocumentWhereInput = {};
  if (recordedFrom || recordedTo) {
    where.recordedAt = {};
    if (recordedFrom) where.recordedAt.gte = new Date(recordedFrom);
    if (recordedTo) {
      const d = new Date(recordedTo);
      d.setHours(23, 59, 59, 999);
      where.recordedAt.lte = d;
    }
  }
  if (nameSearch && (query === "byGrantee" || query === "byGrantor")) {
    const nameFilter = { contains: nameSearch, mode: "insensitive" as const };
    if (query === "byGrantee") where.grantees = { some: { name: nameFilter } };
    else where.grantors = { some: { name: nameFilter } };
  }

  try {
    const documents = await prisma.universaDocument.findMany({
      where,
      orderBy: { recordedAt: "desc" },
      take: 500,
      include: {
        grantors: true,
        grantees: true,
      },
    });

    const rows = documents.map((d) => ({
      id: d.id,
      docNumber: d.docNumber,
      documentTitle: d.documentTitle ?? "",
      recordedAt: d.recordedAt?.toISOString().slice(0, 10) ?? "",
      dateSigned: d.dateSigned?.toISOString().slice(0, 10) ?? "",
      considerationAmt: d.considerationAmt ?? "",
      propertyCounty: d.propertyCounty ?? "",
      propertyAdrs: d.propertyAdrs ?? "",
      granteeNames: d.grantees.map((g) => g.name).filter(Boolean).join("; "),
      grantorNames: d.grantors.map((g) => g.name).filter(Boolean).join("; "),
      grantors: d.grantors,
      grantees: d.grantees,
    }));

    if (format === "csv") {
      const header = "Doc #,Document Title,Recorded,Date Signed,Consideration,County,Property Address,Grantee Names,Grantor Names\n";
      const csvRows = rows.map(
        (r) =>
          `"${escapeCsv(r.docNumber)}","${escapeCsv(r.documentTitle)}","${r.recordedAt}","${r.dateSigned}","${escapeCsv(String(r.considerationAmt))}","${escapeCsv(r.propertyCounty)}","${escapeCsv(r.propertyAdrs)}","${escapeCsv(r.granteeNames)}","${escapeCsv(r.grantorNames)}"`
      );
      return new NextResponse(header + csvRows.join("\n"), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="universa-documents.csv"',
        },
      });
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

function escapeCsv(s: string): string {
  return s.replace(/"/g, '""');
}
