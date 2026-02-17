import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: "desc" },
      include: { categories: { select: { category: true } } },
    });
    return NextResponse.json(members);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const firstName = (formData.get("firstName") as string) || null;
    const lastName = (formData.get("lastName") as string) || null;
    const company = (formData.get("company") as string) || null;
    if (!email?.trim()) {
      return NextResponse.redirect(new URL("/admin?error=email", req.url));
    }
    await prisma.member.create({
      data: {
        email: email.trim(),
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        company: company?.trim() || null,
      },
    });
    const url = new URL(req.url);
    return NextResponse.redirect(new URL("/admin", url.origin));
  } catch (e) {
    console.error(e);
    const url = new URL(req.url);
    return NextResponse.redirect(new URL("/admin?error=create", url.origin));
  }
}
