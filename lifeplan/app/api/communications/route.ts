import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const origin = new URL(req.url).origin;
  try {
    const formData = await req.formData();
    const memberId = formData.get("memberId") as string;
    const type = (formData.get("type") as string) || "call";
    const subject = (formData.get("subject") as string)?.trim() || null;
    const notes = (formData.get("notes") as string)?.trim() || null;
    if (!memberId) {
      return NextResponse.redirect(new URL("/admin/communications?error=missing", origin));
    }
    if (!subject) {
      return NextResponse.redirect(new URL("/admin/communications?error=missing", origin));
    }
    await prisma.communication.create({
      data: { memberId, type, subject, notes },
    });
    return NextResponse.redirect(new URL("/admin/communications?created=1", origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/communications?error=create", origin));
  }
}
