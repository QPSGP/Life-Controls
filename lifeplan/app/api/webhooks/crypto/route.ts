import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { verifyNowPaymentsIpnSignature } from "@/lib/nowpayments-ipn";

// Crypto payment webhooks (same URL, different providers).
//
// Coinbase Commerce (default if no NOWPayments signature):
//   COINBASE_COMMERCE_WEBHOOK_SECRET; metadata: invoiceId, optional amountCents.
//
// NOWPayments:
//   NOWPAYMENTS_IPN_SECRET from Dashboard → Payment settings → IPN secret.
//   Callback URL: https://your-domain/api/webhooks/crypto  (header x-provider: nowpayments optional if x-nowpayments-sig is sent).
//   When creating a payment, set order_id to our Invoice id (same string as in Admin → Invoices).
//   price_currency "usd" recommended so price_amount maps to invoice balance.

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

type NowPaymentsIpnBody = {
  payment_id?: number | string;
  payment_status?: string;
  order_id?: string;
  price_amount?: number | string;
  price_currency?: string;
  pay_currency?: string;
  actually_paid?: number | string;
};

function resolveNowPaymentsProvider(req: NextRequest): "nowpayments" | "coinbase_commerce" {
  const explicit = req.headers.get("x-provider")?.toLowerCase().trim();
  if (explicit === "nowpayments") return "nowpayments";
  if (explicit === "coinbase_commerce") return "coinbase_commerce";
  const npSig =
    req.headers.get("x-nowpayments-sig") ?? req.headers.get("X-NOWPayments-Sig");
  if (npSig) return "nowpayments";
  return "coinbase_commerce";
}

async function applyNowPaymentsFinished(body: NowPaymentsIpnBody) {
  const paymentId = body.payment_id;
  if (paymentId == null) {
    console.warn("NOWPayments IPN: missing payment_id");
    return;
  }
  const invoiceId = body.order_id?.trim();
  if (!invoiceId) {
    console.warn("NOWPayments IPN: missing order_id (set order_id to Invoice id when creating payment)");
    return;
  }
  const status = (body.payment_status ?? "").toLowerCase();
  if (status !== "finished") return;

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) {
    console.warn("NOWPayments IPN: invoice not found for order_id", invoiceId);
    return;
  }

  let amountCents = 0;
  const cur = (body.price_currency ?? "usd").toLowerCase();
  if (cur === "usd" && body.price_amount != null) {
    const n = Number(body.price_amount);
    if (!isNaN(n)) amountCents = Math.round(n * 100);
  }
  if (amountCents <= 0) amountCents = invoice.amountCents;

  const providerPaymentId = `nowpayments_${paymentId}`;
  const existing = await prisma.payment.findUnique({ where: { providerPaymentId } });
  if (existing) return;

  await prisma.payment.create({
    data: {
      invoiceId,
      amountCents,
      currencyType: "crypto",
      currencyCode: (body.pay_currency ?? body.price_currency ?? "USD").toUpperCase(),
      paymentProvider: "nowpayments",
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
  const provider = resolveNowPaymentsProvider(req);

  if (provider === "nowpayments") {
    const secret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "NOWPayments IPN secret not configured (NOWPAYMENTS_IPN_SECRET)" },
        { status: 503 }
      );
    }
    const sig =
      req.headers.get("x-nowpayments-sig") ?? req.headers.get("X-NOWPayments-Sig");
    let body: unknown;
    try {
      body = JSON.parse(rawBody) as unknown;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (!verifyNowPaymentsIpnSignature(body, secret, sig)) {
      return NextResponse.json({ error: "Invalid NOWPayments IPN signature" }, { status: 400 });
    }
    try {
      await applyNowPaymentsFinished(body as NowPaymentsIpnBody);
    } catch (e) {
      console.error("NOWPayments IPN handler error:", e);
      return NextResponse.json({ error: "Handler failed" }, { status: 500 });
    }
    return NextResponse.json({ received: true });
  }

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

  return NextResponse.json({ error: "Unknown crypto provider" }, { status: 400 });
}
