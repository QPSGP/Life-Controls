import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  try {
    const email = "admin@sovereign-life-plan.local";
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.redirect(origin + "/admin/life-plan?userId=" + existing.id);
    }
    const passwordHash = await bcrypt.hash("changeme", 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      },
    });
    return NextResponse.redirect(origin + "/admin/life-plan?userId=" + user.id);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
