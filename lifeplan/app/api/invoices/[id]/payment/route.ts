import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: invoiceId } = await params;
  const origin = new URL(req.url).origin;
  try {
    const formData = await req.formData();
    const amountCents = Math.round(Number(formData.get("amountCents")) || 0);
    const currencyType = (formData.get("currencyType") as string) || "fiat";
    const currencyCode = (formData.get("currencyCode") as string) || "USD";
    const paymentProvider = (formData.get("paymentProvider") as string) || "manual";
    if (amountCents <= 0) {
      return NextResponse.redirect(new URL("/admin/invoices?error=amount", origin));
    }
    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
    await prisma.payment.create({
      data: {
        invoiceId,
        amountCents,
        currencyType,
        currencyCode,
        paymentProvider,
      },
    });
    const totalPaid = await prisma.payment.aggregate({
      where: { invoiceId },
      _sum: { amountCents: true },
    });
    const paid = totalPaid._sum.amountCents ?? 0;
    const newStatus = paid >= invoice.amountCents ? "paid" : "open";
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
    });
    return NextResponse.redirect(new URL("/admin/invoices?paid=1", origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/invoices?error=payment", origin));
  }
}
