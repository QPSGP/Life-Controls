import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await verifyAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const formData = await req.formData();
    const memberId = formData.get("memberId") as string;
    const subscriptionPlanId = formData.get("subscriptionPlanId") as string;
    const origin = req.nextUrl.origin;
    if (!memberId || !subscriptionPlanId) {
      return NextResponse.redirect(`${origin}/admin?error=subscription`);
    }

    const duplicate = await prisma.subscription.findFirst({
      where: {
        memberId,
        subscriptionPlanId,
        status: { in: ["active", "trial"] },
      },
    });
    if (duplicate) {
      return NextResponse.redirect(`${origin}/admin?error=subscription_duplicate`);
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    await prisma.subscription.create({
      data: {
        memberId,
        subscriptionPlanId,
        status: "active",
        currentPeriodEnd: periodEnd,
      },
    });
    return NextResponse.redirect(`${origin}/admin?subscription_added=1`);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(`${req.nextUrl.origin}/admin?error=create`);
  }
}
