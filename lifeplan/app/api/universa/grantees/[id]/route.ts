import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/universa/grantees/[id] — update grantee */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  const { id } = await params;
  const formData = await req.formData();
  const get = (k: string) => (formData.get(k) as string)?.trim() || null;
  try {
    const g = await prisma.universaDocumentGrantee.update({
      where: { id },
      data: {
        granteeNumber: get("granteeNumber"),
        name: get("name"),
        address: get("address"),
        address2: get("address2"),
        address3: get("address3"),
        percentShare: get("percentShare"),
        comment: get("comment"),
      },
    });
    return NextResponse.redirect(new URL("/admin/documents/" + g.documentId + "/edit", req.nextUrl.origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  }
}
