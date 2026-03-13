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
  const redirectTo = (formData.get("redirectTo") as string)?.trim() || null;
  const personId = get("universaPersonId");
  const name = get("name");
  if (!name && !personId) {
    const target = redirectTo ? redirectTo.replace("{id}", id) : "/admin/documents/" + id + "/edit";
    return NextResponse.redirect(new URL(target + (target.includes("?") ? "&" : "?") + "error=grantee", req.nextUrl.origin));
  }
  try {
    await prisma.universaDocumentGrantee.create({
      data: {
        documentId: id,
        universaPersonId: personId || undefined,
        granteeNumber: get("granteeNumber"),
        name: get("name"),
        address: get("address"),
        address2: get("address2"),
        address3: get("address3"),
        percentShare: get("percentShare"),
        comment: get("comment"),
      },
    });
    const target = redirectTo ? redirectTo.replace("{id}", id) : "/admin/documents/" + id + "/edit";
    return NextResponse.redirect(new URL(target, req.nextUrl.origin));
  } catch (e) {
    console.error(e);
    const fallback = redirectTo ? redirectTo.replace("{id}", id) + (redirectTo.includes("?") ? "&" : "?") + "error=grantee" : "/admin/documents/" + id + "/edit?error=grantee";
    return NextResponse.redirect(new URL(fallback, req.nextUrl.origin));
  }
}
