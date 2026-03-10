import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/universa/persons/[id]/delete — delete person */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  const { id } = await params;
  try {
    await prisma.universaPerson.delete({ where: { id } });
    return NextResponse.redirect(new URL("/admin/people", req.nextUrl.origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/people?error=delete", req.nextUrl.origin));
  }
}
