import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Stripe webhook: verify signature and update payments + subscription status.
// Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in Vercel.
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

  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.paid":
      // TODO: find or create Invoice by metadata.invoiceId, create Payment (currency_type: fiat, payment_provider: stripe, provider_payment_id), update invoice status
      break;
    case "invoice.payment_failed":
      // TODO: mark subscription past_due or notify
      break;
    case "customer.subscription.deleted":
      // TODO: set Subscription.status = canceled, canceledAt = now
      break;
    default:
      // Unhandled event type
      break;
  }

  return NextResponse.json({ received: true });
}
