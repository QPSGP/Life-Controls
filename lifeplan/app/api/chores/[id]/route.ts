import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.redirect(new URL("/admin/chores", req.nextUrl.origin));
  const formData = await req.formData();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const origin = req.nextUrl.origin;
  if (!title) return NextResponse.redirect(new URL("/admin/chores?error=missing", origin));
  try {
    await prisma.chore.update({
      where: { id },
      data: { title, description },
    });
    return NextResponse.redirect(new URL("/admin/chores?updated=1", origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/chores?error=update", origin));
  }
}
