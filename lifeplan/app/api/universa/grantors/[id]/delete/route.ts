import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/universa/grantors/[id]/delete — delete grantor */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  const { id } = await params;
  try {
    const g = await prisma.universaDocumentGrantor.findUnique({ where: { id }, select: { documentId: true } });
    if (!g) return NextResponse.redirect(new URL("/admin/documents", req.nextUrl.origin));
    await prisma.universaDocumentGrantor.delete({ where: { id } });
    return NextResponse.redirect(new URL("/admin/documents/" + g.documentId + "/edit", req.nextUrl.origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/documents", req.nextUrl.origin));
  }
}
