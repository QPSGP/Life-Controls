import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: memberId } = await params;
  const origin = req.nextUrl.origin;
  try {
    const formData = await req.formData();
    const category = (formData.get("category") as string)?.trim();
    if (!category) return NextResponse.redirect(origin + "/admin?error=category");
    await prisma.memberCategory.delete({
      where: { memberId_category: { memberId, category } },
    });
    return NextResponse.redirect(origin + "/admin");
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(origin + "/admin");
  }
}
