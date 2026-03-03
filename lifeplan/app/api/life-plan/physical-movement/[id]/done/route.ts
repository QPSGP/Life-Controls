import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await req.formData();
  const done = formData.get("done") === "true";
  const nextPath = (formData.get("next") as string)?.trim();
  const origin = new URL(req.url).origin;
  try {
    const movement = await prisma.physicalMovement.update({
      where: { id },
      data: { done, doneAt: done ? new Date() : null },
    });
    const redirectPath =
      nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
        ? nextPath
        : "/admin/life-plan/responsibility/" + movement.areaOfResponsibilityId;
    return NextResponse.redirect(new URL(redirectPath, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/life-plan?error=update", origin));
  }
}
