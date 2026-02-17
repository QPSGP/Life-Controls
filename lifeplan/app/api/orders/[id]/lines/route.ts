import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await params;
  const origin = req.nextUrl.origin;
  try {
    const formData = await req.formData();
    const type = (formData.get("type") as string)?.trim() || null;
    const item = (formData.get("item") as string)?.trim() || null;
    const unitCents = Math.round(Number(formData.get("unitCents")) || 0);
    const quantity = Math.max(1, Math.round(Number(formData.get("quantity")) || 1));
    const totalCents = unitCents * quantity;
    await prisma.$transaction([
      prisma.orderLine.create({
        data: { orderId, type, item, unitCents, quantity, totalCents },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { totalCents: { increment: totalCents } },
      }),
    ]);
    return NextResponse.redirect(origin + "/admin/orders?open=" + orderId);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(origin + "/admin/orders?error=line");
  }
}
