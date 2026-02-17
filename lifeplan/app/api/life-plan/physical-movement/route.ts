import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const areaOfResponsibilityId = formData.get("areaOfResponsibilityId") as string;
  const verb = (formData.get("verb") as string)?.trim() || null;
  const noun = (formData.get("noun") as string)?.trim() || null;
  const object = (formData.get("object") as string)?.trim() || null;
  const objective = (formData.get("objective") as string)?.trim() || null;
  const results = (formData.get("results") as string)?.trim() || null;
  const movementType = (formData.get("movementType") as string)?.trim() || null;
  const scheduledDateRaw = (formData.get("scheduledDate") as string)?.trim() || null;
  const scheduledDate = scheduledDateRaw ? new Date(scheduledDateRaw + "T00:00:00") : null;
  const scheduledTime = (formData.get("scheduledTime") as string)?.trim() || null;
  const dateOrRollover = (formData.get("dateOrRollover") as string)?.trim() || null; // D | R
  const origin = new URL(req.url).origin;
  if (!areaOfResponsibilityId) {
    return NextResponse.redirect(new URL("/admin/life-plan?error=missing", origin));
  }
  if (!verb) {
    return NextResponse.redirect(new URL("/admin/life-plan/responsibility/" + areaOfResponsibilityId + "?error=missing", origin));
  }
  try {
    await prisma.physicalMovement.create({
      data: {
        areaOfResponsibilityId,
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
    });
    return NextResponse.redirect(new URL("/admin/life-plan/responsibility/" + areaOfResponsibilityId, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/life-plan/responsibility/" + areaOfResponsibilityId + "?error=create", origin));
  }
}
