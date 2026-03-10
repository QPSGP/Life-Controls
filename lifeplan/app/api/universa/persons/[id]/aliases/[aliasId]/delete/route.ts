import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/universa/persons/[id]/aliases/[aliasId]/delete — delete alias */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; aliasId: string }> }
) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  const { id: personId, aliasId } = await params;
  try {
    await prisma.universaPersonAlias.delete({ where: { id: aliasId } });
    return NextResponse.redirect(new URL("/admin/people/" + personId + "/edit", req.nextUrl.origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/people/" + personId + "/edit?error=alias", req.nextUrl.origin));
  }
}
