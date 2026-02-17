import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await req.formData();
  const done = formData.get("done") === "true";
  const origin = new URL(req.url).origin;
  try {
    const movement = await prisma.physicalMovement.update({
      where: { id },
      data: { done, doneAt: done ? new Date() : null },
    });
    return NextResponse.redirect(new URL("/admin/life-plan/responsibility/" + movement.areaOfResponsibilityId, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/life-plan?error=update", origin));
  }
}
