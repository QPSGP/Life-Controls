import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const origin = new URL(req.url).origin;
  try {
    const formData = await req.formData();
    const memberId = formData.get("memberId") as string;
    const amountCents = Math.round(Number(formData.get("amountCents")) || 0);
    const dueDateStr = formData.get("dueDate") as string;
    if (!memberId || amountCents <= 0 || !dueDateStr) {
      return NextResponse.redirect(new URL("/admin/invoices?error=missing", origin));
    }
    const dueDate = new Date(dueDateStr);
    const count = await prisma.invoice.count({ where: { memberId } });
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${count + 1}`;
    await prisma.invoice.create({
      data: { memberId, amountCents, dueDate, invoiceNumber, status: "open" },
    });
    return NextResponse.redirect(new URL("/admin/invoices?created=1", origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/invoices?error=create", origin));
  }
}
