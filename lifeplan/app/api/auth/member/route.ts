import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { setMemberCookie } from "@/lib/member-auth";

export async function POST(req: NextRequest) {
  const origin = new URL(req.url).origin;
  try {
    const formData = await req.formData();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string | null;
    if (!email || !password) {
      return NextResponse.redirect(new URL("/login?error=missing", origin));
    }
    const member = await prisma.member.findFirst({
      where: { email },
      select: { id: true, passwordHash: true },
    });
    if (!member?.passwordHash) {
      return NextResponse.redirect(new URL("/login?error=invalid", origin));
    }
    const ok = await bcrypt.compare(password, member.passwordHash);
    if (!ok) {
      return NextResponse.redirect(new URL("/login?error=invalid", origin));
    }
    await setMemberCookie(member.id);
    return NextResponse.redirect(new URL("/portal", origin));
  } catch (e) {
    console.error("Member login error:", e);
    return NextResponse.redirect(new URL("/login?error=server", origin));
  }
}
