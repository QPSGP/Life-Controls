import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/universa/documents/[id]/grantees — add grantee to document */
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
    await prisma.universaDocumentGrantee.create({
      data: {
        documentId: id,
        granteeNumber: get("granteeNumber"),
        name: get("name"),
        address: get("address"),
        address2: get("address2"),
        address3: get("address3"),
        percentShare: get("percentShare"),
        comment: get("comment"),
      },
    });
    return NextResponse.redirect(new URL("/admin/documents/" + id + "/edit", req.nextUrl.origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/documents/" + id + "/edit?error=grantee", req.nextUrl.origin));
  }
}
