import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const origin = req.nextUrl.origin;

  try {
    await prisma.company.delete({ where: { id } });
    return NextResponse.redirect(`${origin}/admin/companies?deleted=1`);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(`${origin}/admin/companies/${id}?error=delete`);
  }
}
