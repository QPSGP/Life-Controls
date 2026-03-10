import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/universa/persons/[id]/aliases — add alias */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  const { id: personId } = await params;
  const formData = await req.formData();
  const aliasIdNum = (formData.get("aliasIdNum") as string)?.trim() || null;
  try {
    await prisma.universaPersonAlias.create({
      data: { personId, aliasIdNum },
    });
    return NextResponse.redirect(new URL("/admin/people/" + personId + "/edit", req.nextUrl.origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/people/" + personId + "/edit?error=alias", req.nextUrl.origin));
  }
}
