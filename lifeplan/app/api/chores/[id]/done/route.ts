import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const origin = req.nextUrl.origin;
  try {
    const formData = await req.formData();
    const done = formData.get("done") === "true";
    await prisma.chore.update({
      where: { id },
      data: { done, doneAt: done ? new Date() : null },
    });
    return NextResponse.redirect(origin + "/admin/chores");
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(origin + "/admin/chores");
  }
}
