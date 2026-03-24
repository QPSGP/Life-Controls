import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

// Crypto payment webhooks.
// Coinbase Commerce: set COINBASE_COMMERCE_WEBHOOK_SECRET (shared secret from Commerce dashboard).
// When creating a charge, set metadata: { invoiceId: "<our Invoice id>", amountCents: "19900" } (amountCents optional if pricing.local is USD).

function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function verifyCoinbaseSignature(rawBody: string, secret: string, headerSig: string | null): boolean {
  if (!headerSig) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return timingSafeEqualHex(expected, headerSig) || expected === headerSig;
}

type CoinbaseEvent = {
  event?: {
    type?: string;
    data?: {
      id?: string;
      metadata?: Record<string, string | undefined>;
      pricing?: { local?: { amount?: string; currency?: string } };
    };
  };
};

type ChargeData = NonNullable<CoinbaseEvent["event"]>["data"];

function parseAmountCents(data: ChargeData | undefined): number {
  const meta = data?.metadata;
  if (meta?.amountCents) {
    const n = parseInt(String(meta.amountCents), 10);
    if (!isNaN(n) && n > 0) return n;
  }
  const local = data?.pricing?.local;
  if (local?.currency?.toUpperCase() === "USD" && local.amount) {
    const dollars = parseFloat(local.amount);
    if (!isNaN(dollars)) return Math.round(dollars * 100);
  }
  return 0;
}

async function applyCoinbaseChargeConfirmed(data: ChargeData) {
  if (!data?.id) return;
  const meta = data.metadata ?? {};
  const invoiceId = meta.invoiceId ?? meta.invoice_id;
  if (!invoiceId) {
    console.warn("Coinbase webhook: charge confirmed but no invoiceId in metadata");
    return;
  }
  let amountCents = parseAmountCents(data);
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) {
    console.warn("Coinbase webhook: invoice not found", invoiceId);
    return;
  }
  if (amountCents <= 0) amountCents = invoice.amountCents;
  const providerPaymentId = `coinbase_${data.id}`;
  const existing = await prisma.payment.findUnique({ where: { providerPaymentId } });
  if (existing) return;
  await prisma.payment.create({
    data: {
      invoiceId,
      amountCents,
      currencyType: "crypto",
      currencyCode: data.pricing?.local?.currency?.toUpperCase() ?? "USD",
      paymentProvider: "coinbase_commerce",
      providerPaymentId,
    },
  });
  const total = await prisma.payment.aggregate({ where: { invoiceId }, _sum: { amountCents: true } });
  const paid = total._sum.amountCents ?? 0;
  if (paid >= invoice.amountCents) {
    await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "paid" } });
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const provider = (req.headers.get("x-provider") ?? "coinbase_commerce").toLowerCase();

  if (provider === "coinbase_commerce") {
    const secret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Coinbase Commerce webhook secret not configured" },
        { status: 503 }
      );
    }
    const sig =
      req.headers.get("x-cc-webhook-signature") ??
      req.headers.get("X-CC-Webhook-Signature") ??
      req.headers.get("X-CC-WEBHOOK-SIGNATURE");
    if (!verifyCoinbaseSignature(rawBody, secret, sig)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }
    let payload: CoinbaseEvent;
    try {
      payload = JSON.parse(rawBody) as CoinbaseEvent;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const ev = payload.event;
    const type = ev?.type ?? "";
    if (type === "charge:confirmed" && ev?.data) {
      try {
        await applyCoinbaseChargeConfirmed(ev.data);
      } catch (e) {
        console.error("Coinbase webhook handler error:", e);
        return NextResponse.json({ error: "Handler failed" }, { status: 500 });
      }
    }
    return NextResponse.json({ received: true });
  }

  if (provider === "nowpayments") {
    if (!process.env.NOWPAYMENTS_IPN_SECRET) {
      return NextResponse.json(
        { error: "NowPayments IPN not configured; use x-provider: coinbase_commerce or set NOWPAYMENTS_IPN_SECRET" },
        { status: 503 }
      );
    }
    // NowPayments IPN format and signature vary by integration; extend here when you wire a specific flow.
    return NextResponse.json(
      { received: true, note: "NowPayments IPN verification not implemented; add signature check and invoice metadata mapping." },
      { status: 200 }
    );
  }

  return NextResponse.json({ error: "Unknown crypto provider" }, { status: 400 });
}
