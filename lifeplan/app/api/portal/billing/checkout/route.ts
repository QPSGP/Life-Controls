import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { appOrigin, createCheckoutForSubscription } from "@/lib/billing";

export const dynamic = "force-dynamic";

/** POST — resume Stripe Checkout for a pending subscription. */
export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromCookie();
  const origin = appOrigin(req.headers.get("x-forwarded-host") || req.headers.get("host"), req.headers.get("x-forwarded-proto"));
  if (!memberId) return NextResponse.redirect(new URL("/login", origin));

  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return NextResponse.redirect(new URL("/login", origin));

  const subscription = await prisma.subscription.findFirst({
    where: { memberId, status: "pending" },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });
  if (!subscription) return NextResponse.redirect(new URL("/portal", origin));

  let invoice = await prisma.invoice.findFirst({
    where: { memberId, status: "open", amountCents: subscription.plan.amountCents },
    orderBy: { createdAt: "desc" },
  });
  if (!invoice) {
    invoice = await prisma.invoice.create({
      data: {
        memberId,
        invoiceNumber: `SUB-${Date.now().toString(36).toUpperCase()}`,
        amountCents: subscription.plan.amountCents,
        dueDate: new Date(),
        status: "open",
      },
    });
  }

  const url = await createCheckoutForSubscription({
    memberId,
    memberEmail: member.email,
    subscriptionId: subscription.id,
    invoiceId: invoice.id,
    planName: subscription.plan.name,
    amountCents: subscription.plan.amountCents,
    origin,
  });
  if (!url) return NextResponse.redirect(new URL("/portal?error=stripe", origin));
  return NextResponse.redirect(url);
}
