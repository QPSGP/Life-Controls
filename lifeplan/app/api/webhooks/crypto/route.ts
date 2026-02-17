import { NextRequest, NextResponse } from "next/server";

// Crypto payment webhook (Coinbase Commerce or NowPayments).
// Verify payload with COINBASE_COMMERCE_WEBHOOK_SECRET or NOWPAYMENTS_IPN_SECRET,
// then create Payment (currency_type: crypto, payment_provider: ...) and update invoice.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const provider = (req.headers.get("x-provider") ?? "coinbase_commerce").toLowerCase();

  if (provider === "coinbase_commerce") {
    // TODO: verify Coinbase Commerce webhook (HMAC), parse event type,
    // on "charge:confirmed" create Payment and update Invoice
    const secret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Coinbase Commerce webhook secret not configured" },
        { status: 500 }
      );
    }
    // Verify: crypto.createHmac('sha256', secret).update(rawBody).digest('hex') === signature
  } else if (provider === "nowpayments") {
    // TODO: verify NowPayments IPN (signature), on payment_status === "finished"
    // create Payment and update Invoice
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (!ipnSecret) {
      return NextResponse.json(
        { error: "NowPayments IPN secret not configured" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json({ error: "Unknown crypto provider" }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
