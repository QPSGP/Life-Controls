import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  try {
    const formData = await req.formData();
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    if (!title) return NextResponse.redirect(origin + "/admin/chores?error=missing");
    await prisma.chore.create({
      data: { title, description },
    });
    return NextResponse.redirect(origin + "/admin/chores");
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(origin + "/admin/chores?error=create");
  }
}
