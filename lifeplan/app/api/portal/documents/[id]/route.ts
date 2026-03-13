import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/portal/documents/[id] — get one document (read-only). Must belong to the logged-in member. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const doc = await prisma.universaDocument.findFirst({
      where: { id, memberId },
      include: {
        grantors: { orderBy: { sortOrder: "asc" } },
        grantees: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ...doc,
      recordedAt: doc.recordedAt?.toISOString() ?? null,
      notarizationDate: doc.notarizationDate?.toISOString() ?? null,
      dateSigned: doc.dateSigned?.toISOString() ?? null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
