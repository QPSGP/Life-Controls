import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  try {
    const formData = await req.formData();
    const memberId = formData.get("memberId") as string;
    const subscriptionPlanId = formData.get("subscriptionPlanId") as string;
    if (!memberId || !subscriptionPlanId) {
      const url = new URL(req.url);
      return NextResponse.redirect(new URL("/admin?error=subscription", url.origin));
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
    const url = new URL(req.url);
    return NextResponse.redirect(new URL("/admin", url.origin));
  } catch (e) {
    console.error(e);
    const url = new URL(req.url);
    return NextResponse.redirect(new URL("/admin?error=create", url.origin));
  }
}
