import Stripe from "stripe";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { addMonths, startOfTodayUtc } from "@/lib/calendar";

const STRIPE_API_VERSION = "2025-02-24.acacia" as const;

export function stripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  // Ignore blank values and the .env.example placeholder (sk_test_...).
  if (!/^sk_(test|live)_[A-Za-z0-9]{8,}$/.test(key)) return null;
  return new Stripe(key, { apiVersion: STRIPE_API_VERSION });
}

export function appOrigin(host: string | null, proto: string | null): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const hostname = host || "localhost:3000";
  const scheme = hostname.startsWith("localhost") || hostname.startsWith("127.0.0.1") ? "http" : proto || "https";
  return `${scheme}://${hostname}`;
}

async function planOwnerId(): Promise<string> {
  const email = "admin@sovereign-life-plan.local";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing.id;
  const passwordHash = await bcrypt.hash("changeme", 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, firstName: "Admin", lastName: "User", role: "admin" },
  });
  return user.id;
}

/** A small life plan so a new member has a schedule on day one. */
export async function ensureStarterPlan(memberId: string, planSlug: string): Promise<void> {
  const existing = await prisma.subjectBusiness.findFirst({ where: { memberId } });
  if (existing) return;
  const userId = await planOwnerId();
  const subject = await prisma.subjectBusiness.create({
    data: {
      userId,
      memberId,
      name: planSlug === "sovereign-business" ? "My business" : "My life",
      verb: "Control",
      noun: "the day",
      object: "in one place",
      objective: "Know what to do and when",
      sortOrder: 0,
    },
  });
  const purpose = await prisma.areaOfPurpose.create({
    data: {
      subjectBusinessId: subject.id,
      name: "Daily control",
      verb: "Run",
      noun: "the miniday",
      object: "from the schedule",
      objective: "Finish what matters today",
      sortOrder: 0,
    },
  });
  const responsibility = await prisma.areaOfResponsibility.create({
    data: {
      areaOfPurposeId: purpose.id,
      name: "Today",
      verb: "Work",
      noun: "today's list",
      object: "to completion",
      objective: "Clear the calls and tasks that are due",
      sortOrder: 0,
    },
  });
  const today = startOfTodayUtc();
  await prisma.physicalMovement.create({
    data: {
      areaOfResponsibilityId: responsibility.id,
      movementType: "Call",
      verb: "Call",
      noun: "one person",
      object: "who needs a word from you",
      objective: "Keep the relationship moving",
      dateOrRollover: "R",
      scheduledDate: today,
      scheduledTime: "09:00",
      sortOrder: 0,
    },
  });
}

export async function createCheckoutForSubscription(opts: {
  memberId: string;
  memberEmail: string;
  subscriptionId: string;
  invoiceId: string;
  planName: string;
  amountCents: number;
  origin: string;
}): Promise<string | null> {
  const stripe = stripeClient();
  if (!stripe) return null;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: opts.memberEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: opts.amountCents,
          recurring: { interval: "month" },
          product_data: { name: opts.planName },
        },
      },
    ],
    metadata: {
      kind: "signup",
      memberId: opts.memberId,
      subscriptionId: opts.subscriptionId,
      invoiceId: opts.invoiceId,
    },
    subscription_data: {
      metadata: {
        kind: "signup",
        memberId: opts.memberId,
        subscriptionId: opts.subscriptionId,
      },
    },
    success_url: `${opts.origin}/signup/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.origin}/signup?error=cancel&email=${encodeURIComponent(opts.memberEmail)}`,
  });
  return session.url;
}

/** Mark the local subscription active after Stripe confirms payment. Idempotent. */
export async function activatePaidSignup(input: {
  subscriptionId?: string | null;
  invoiceId?: string | null;
  stripeSubscriptionId?: string | null;
  amountCents: number;
  providerPaymentId: string;
  periodEnd?: Date | null;
}): Promise<void> {
  const periodEnd = input.periodEnd ?? addMonths(new Date(), 1);
  if (input.subscriptionId) {
    await prisma.subscription.updateMany({
      where: { id: input.subscriptionId },
      data: {
        status: "active",
        currentPeriodEnd: periodEnd,
        ...(input.stripeSubscriptionId ? { stripeSubscriptionId: input.stripeSubscriptionId } : {}),
      },
    });
  } else if (input.stripeSubscriptionId) {
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: input.stripeSubscriptionId },
      data: { status: "active", currentPeriodEnd: periodEnd },
    });
  }

  if (!input.invoiceId || input.amountCents <= 0) return;
  const existing = await prisma.payment.findUnique({ where: { providerPaymentId: input.providerPaymentId } });
  if (!existing) {
    await prisma.payment.create({
      data: {
        invoiceId: input.invoiceId,
        amountCents: input.amountCents,
        currencyType: "fiat",
        currencyCode: "USD",
        paymentProvider: "stripe",
        providerPaymentId: input.providerPaymentId,
      },
    });
  }
  const total = await prisma.payment.aggregate({
    where: { invoiceId: input.invoiceId },
    _sum: { amountCents: true },
  });
  const invoice = await prisma.invoice.findUnique({ where: { id: input.invoiceId } });
  if (invoice && (total._sum.amountCents ?? 0) >= invoice.amountCents) {
    await prisma.invoice.update({ where: { id: input.invoiceId }, data: { status: "paid" } });
  }
}
