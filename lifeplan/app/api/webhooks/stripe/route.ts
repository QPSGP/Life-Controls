import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

// Stripe webhook: verify signature and update payments + subscription status.
// Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in Vercel.
// When creating Stripe Checkout/Invoice, pass metadata: { invoiceId: "<our Invoice id>" } and optionally subscriptionId: "<our Subscription id>".
// Stripe is initialized at request time so build does not require env vars.

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey || !secret) {
    return NextResponse.json(
      { error: "Stripe not configured (missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET)" },
      { status: 503 }
    );
  }

  const stripe = new Stripe(apiKey, { apiVersion: "2025-02-24.acacia" });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing Stripe signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoiceId = session.metadata?.invoiceId as string | undefined;
        const subscriptionId = session.metadata?.subscriptionId as string | undefined;
        const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

        if (subscriptionId && stripeSubscriptionId) {
          await prisma.subscription.updateMany({
            where: { id: subscriptionId },
            data: { stripeSubscriptionId },
          });
        }
        if (invoiceId && session.payment_status === "paid") {
          const amountCents = session.amount_total ?? 0; // Stripe uses cents for USD
          const pi = session.payment_intent;
          const providerPaymentId = pi ? (typeof pi === "string" ? pi : (pi as Stripe.PaymentIntent).id) : `checkout_${session.id}`;
          const existing = await prisma.payment.findUnique({ where: { providerPaymentId } });
          if (!existing) {
            await prisma.payment.create({
              data: {
                invoiceId,
                amountCents,
                currencyType: "fiat",
                currencyCode: "USD",
                paymentProvider: "stripe",
                providerPaymentId,
              },
            });
            const total = await prisma.payment.aggregate({ where: { invoiceId }, _sum: { amountCents: true } });
            const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
            if (invoice && (total._sum.amountCents ?? 0) >= invoice.amountCents) {
              await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "paid" } });
            }
          }
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceId = invoice.metadata?.invoiceId as string | undefined;
        if (!invoiceId) break;
        const amountCents = invoice.amount_paid; // cents for USD
        const providerPaymentId = `stripe_inv_${invoice.id}`;
        const existing = await prisma.payment.findUnique({ where: { providerPaymentId } });
        if (!existing) {
          await prisma.payment.create({
            data: {
              invoiceId,
              amountCents,
              currencyType: "fiat",
              currencyCode: (invoice.currency ?? "usd").toUpperCase(),
              paymentProvider: "stripe",
              providerPaymentId,
            },
          });
          const total = await prisma.payment.aggregate({ where: { invoiceId }, _sum: { amountCents: true } });
          const inv = await prisma.invoice.findUnique({ where: { id: invoiceId } });
          if (inv && (total._sum.amountCents ?? 0) >= inv.amountCents) {
            await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "paid" } });
          }
        }
        if (invoice.subscription) {
          const stripeSubId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
          if (stripeSubId) {
            await prisma.subscription.updateMany({
              where: { stripeSubscriptionId: stripeSubId },
              data: { status: "active" },
            });
          }
        }
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
        if (stripeSubId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: stripeSubId },
            data: { status: "past_due" },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "canceled", canceledAt: new Date() },
        });
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Stripe webhook handler error:", e);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
