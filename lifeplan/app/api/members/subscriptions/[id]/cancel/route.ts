import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST — cancel an active/trial subscription (admin). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  const origin = req.nextUrl.origin;

  try {
    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) {
      return NextResponse.redirect(`${origin}/admin?error=subscription_cancel`);
    }
    if (sub.status === "canceled") {
      return NextResponse.redirect(`${origin}/admin?subscription_canceled=1`);
    }

    await prisma.subscription.update({
      where: { id },
      data: { status: "canceled", canceledAt: new Date() },
    });
    return NextResponse.redirect(`${origin}/admin?subscription_canceled=1`);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(`${origin}/admin?error=subscription_cancel`);
  }
}
