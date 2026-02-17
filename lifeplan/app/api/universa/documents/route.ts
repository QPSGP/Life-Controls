import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/universa/documents — list documents with optional filters. Requires admin. */
export async function GET(req: NextRequest) {
  const verified = await verifyAdminCookie();
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const titleSearch = searchParams.get("title")?.trim() || undefined;
  const recordedFrom = searchParams.get("recordedFrom")?.trim() || undefined;
  const recordedTo = searchParams.get("recordedTo")?.trim() || undefined;
  const sort = searchParams.get("sort") || "recordedDesc";

  const where: { documentTitle?: { contains: string; mode: "insensitive" }; recordedAt?: { gte?: Date; lte?: Date } } = {};
  if (titleSearch) where.documentTitle = { contains: titleSearch, mode: "insensitive" };
  if (recordedFrom || recordedTo) {
    where.recordedAt = {};
    if (recordedFrom) where.recordedAt.gte = new Date(recordedFrom);
    if (recordedTo) {
      const d = new Date(recordedTo);
      d.setHours(23, 59, 59, 999);
      where.recordedAt.lte = d;
    }
  }

  const orderBy: { recordedAt?: "asc" | "desc"; documentTitle?: "asc" | "desc" } =
    sort === "recordedAsc" ? { recordedAt: "asc" }
    : sort === "titleAsc" ? { documentTitle: "asc" }
    : sort === "titleDesc" ? { documentTitle: "desc" }
    : { recordedAt: "desc" };

  try {
    const documents = await prisma.universaDocument.findMany({
      where,
      orderBy,
      take: 200,
      include: {
        grantors: { select: { id: true, name: true } },
        grantees: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({
      documents: documents.map((d) => ({
        id: d.id,
        docNumber: d.docNumber,
        documentTitle: d.documentTitle,
        recordedAt: d.recordedAt?.toISOString() ?? null,
        dateSigned: d.dateSigned?.toISOString() ?? null,
        considerationAmt: d.considerationAmt,
        propertyCounty: d.propertyCounty,
        propertyAdrs: d.propertyAdrs,
        grantors: d.grantors,
        grantees: d.grantees,
      })),
    });
  } catch (e) {
    console.error("Universa documents API error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database error" },
      { status: 500 }
    );
  }
}

/** POST /api/universa/documents — create document. Body: docNumber (required), documentTitle (optional) */
export async function POST(req: NextRequest) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  const formData = await req.formData();
  const docNumber = (formData.get("docNumber") as string)?.trim();
  if (!docNumber) return NextResponse.redirect(new URL("/admin/documents/new?error=missing", req.nextUrl.origin));
  const documentTitle = (formData.get("documentTitle") as string)?.trim() || null;
  try {
    const doc = await prisma.universaDocument.create({
      data: { docNumber, documentTitle },
    });
    return NextResponse.redirect(new URL("/admin/documents/" + doc.id + "/edit", req.nextUrl.origin));
  } catch (e: unknown) {
    const msg = e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002"
      ? "duplicate"
      : "create";
    return NextResponse.redirect(new URL("/admin/documents/new?error=" + msg, req.nextUrl.origin));
  }
}
