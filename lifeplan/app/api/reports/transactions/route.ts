import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { dueDate: "desc" },
    take: 500,
    include: {
      member: { select: { email: true, firstName: true, lastName: true } },
      payments: true,
    },
  });
  const headers = ["invoiceId", "invoiceNumber", "memberEmail", "memberName", "amountCents", "dueDate", "status", "paidCents", "balanceCents"];
  const rows = invoices.map((inv) => {
    const paid = inv.payments.reduce((s, p) => s + p.amountCents, 0);
    const balance = inv.amountCents - paid;
    return [
      inv.id,
      inv.invoiceNumber ?? "",
      inv.member.email,
      `${inv.member.firstName ?? ""} ${inv.member.lastName ?? ""}`.trim(),
      inv.amountCents,
      inv.dueDate.toISOString().slice(0, 10),
      inv.status,
      paid,
      balance,
    ];
  });
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=transactions.csv",
    },
  });
}
