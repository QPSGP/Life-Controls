import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST — Member marks a physical movement done/undo. Must belong to their plan. */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) {
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(new URL("/login?error=invalid", origin));
  }
  const { id } = await params;
  const formData = await req.formData();
  const done = formData.get("done") === "true";
  const origin = new URL(req.url).origin;

  const movement = await prisma.physicalMovement.findUnique({
    where: { id },
    include: {
      areaOfResponsibility: {
        include: {
          areaOfPurpose: {
            include: {
              subjectBusiness: { select: { memberId: true } },
            },
          },
        },
      },
    },
  });
  if (!movement || movement.areaOfResponsibility.areaOfPurpose.subjectBusiness.memberId !== memberId) {
    return NextResponse.redirect(new URL("/portal/schedule?error=unauthorized", origin));
  }
  try {
    await prisma.physicalMovement.update({
      where: { id },
      data: { done, doneAt: done ? new Date() : null },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/portal/schedule?error=update", origin));
  }
  return NextResponse.redirect(new URL("/portal/schedule", origin));
}
