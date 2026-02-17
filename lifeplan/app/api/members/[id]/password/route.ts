import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: memberId } = await params;
  const formData = await req.formData();
  const password = formData.get("password") as string | null;
  if (!password || password.length < 6) {
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(new URL("/admin?error=password_length", origin));
  }
  const hash = await bcrypt.hash(password, 10);
  await prisma.member.update({
    where: { id: memberId },
    data: { passwordHash: hash },
  });
  const origin = new URL(req.url).origin;
  return NextResponse.redirect(new URL("/admin?set=ok", origin));
}
