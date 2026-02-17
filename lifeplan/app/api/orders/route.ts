import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  try {
    const formData = await req.formData();
    const memberId = formData.get("memberId") as string;
    const orderNumber = (formData.get("orderNumber") as string)?.trim() || null;
    if (!memberId) return NextResponse.redirect(origin + "/admin/orders?error=missing");
    await prisma.order.create({
      data: { memberId, orderNumber, totalCents: 0, status: "pending" },
    });
    return NextResponse.redirect(origin + "/admin/orders");
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(origin + "/admin/orders?error=create");
  }
}
