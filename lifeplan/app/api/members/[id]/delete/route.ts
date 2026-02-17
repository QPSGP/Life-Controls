import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: memberId } = await params;
  const origin = req.nextUrl.origin;
  try {
    await prisma.member.delete({
      where: { id: memberId },
    });
    return NextResponse.redirect(origin + "/admin?deleted=1");
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(origin + "/admin?error=delete");
  }
}
