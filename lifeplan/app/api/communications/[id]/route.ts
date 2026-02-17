import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.redirect(new URL("/admin/communications", req.nextUrl.origin));
  const formData = await req.formData();
  const memberId = (formData.get("memberId") as string)?.trim();
  const type = (formData.get("type") as string)?.trim() || "call";
  const subject = (formData.get("subject") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const origin = req.nextUrl.origin;
  if (!memberId || !subject) return NextResponse.redirect(new URL("/admin/communications?error=missing", origin));
  try {
    await prisma.communication.update({
      where: { id },
      data: { memberId, type, subject, notes },
    });
    return NextResponse.redirect(new URL("/admin/communications?updated=1", origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/communications?error=update", origin));
  }
}
