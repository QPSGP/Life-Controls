import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/portal/documents — list documents visible to the logged-in member (memberId set). */
export async function GET(_req: NextRequest) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const documents = await prisma.universaDocument.findMany({
      where: { memberId },
      orderBy: { recordedAt: "desc" },
      select: {
        id: true,
        docNumber: true,
        documentTitle: true,
        recordedAt: true,
        dateSigned: true,
      },
    });
    return NextResponse.json({
      documents: documents.map((d) => ({
        id: d.id,
        docNumber: d.docNumber,
        documentTitle: d.documentTitle ?? null,
        recordedAt: d.recordedAt?.toISOString() ?? null,
        dateSigned: d.dateSigned?.toISOString() ?? null,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}
