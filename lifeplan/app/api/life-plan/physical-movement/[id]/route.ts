import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.redirect(new URL("/admin/life-plan", req.nextUrl.origin));
  const formData = await req.formData();
  const verb = (formData.get("verb") as string)?.trim() || null;
  const noun = (formData.get("noun") as string)?.trim() || null;
  const object = (formData.get("object") as string)?.trim() || null;
  const objective = (formData.get("objective") as string)?.trim() || null;
  const results = (formData.get("results") as string)?.trim() || null;
  const movementType = (formData.get("movementType") as string)?.trim() || null;
  const scheduledDateRaw = (formData.get("scheduledDate") as string)?.trim() || null;
  const scheduledDate = scheduledDateRaw ? new Date(scheduledDateRaw + "T00:00:00") : null;
  const scheduledTime = (formData.get("scheduledTime") as string)?.trim() || null;
  const dateOrRollover = (formData.get("dateOrRollover") as string)?.trim() || null;
  const origin = req.nextUrl.origin;
  if (!verb) {
    const m = await prisma.physicalMovement.findUnique({ where: { id }, select: { areaOfResponsibilityId: true } });
    const back = m ? "/admin/life-plan/responsibility/" + m.areaOfResponsibilityId : "/admin/life-plan";
    return NextResponse.redirect(new URL(back + "?error=missing", origin));
  }
  try {
    const updated = await prisma.physicalMovement.update({
      where: { id },
      data: {
        movementType,
        verb,
        noun,
        object,
        objective,
        results,
        scheduledDate,
        scheduledTime,
        dateOrRollover: dateOrRollover === "D" || dateOrRollover === "R" ? dateOrRollover : null,
      },
      select: { areaOfResponsibilityId: true },
    });
    return NextResponse.redirect(new URL("/admin/life-plan/responsibility/" + updated.areaOfResponsibilityId, origin));
  } catch (e) {
    console.error(e);
    const m = await prisma.physicalMovement.findUnique({ where: { id }, select: { areaOfResponsibilityId: true } });
    const back = m ? "/admin/life-plan/responsibility/" + m.areaOfResponsibilityId : "/admin/life-plan";
    return NextResponse.redirect(new URL(back + "?error=update", origin));
  }
}
