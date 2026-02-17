import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const origin = req.nextUrl.origin;
  try {
    const formData = await req.formData();
    const memberId = (formData.get("memberId") as string)?.trim() || null;
    const description = (formData.get("description") as string)?.trim();
    const amountCents = Math.round(Number(formData.get("amountCents")) || 0);
    const dateStr = formData.get("date") as string;
    const notes = (formData.get("notes") as string)?.trim() || null;
    if (!description) return NextResponse.redirect(origin + "/admin/expenditures?error=missing");
    await prisma.expenditure.create({
      data: {
        memberId: memberId || undefined,
        description,
        amountCents,
        date: dateStr ? new Date(dateStr) : undefined,
        notes,
      },
    });
    return NextResponse.redirect(origin + "/admin/expenditures");
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(origin + "/admin/expenditures?error=create");
  }
}
