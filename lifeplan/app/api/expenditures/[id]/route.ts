import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.redirect(new URL("/admin/expenditures", req.nextUrl.origin));
  const formData = await req.formData();
  const memberId = (formData.get("memberId") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim();
  const amountCents = Math.round(Number(formData.get("amountCents")) || 0);
  const dateStr = formData.get("date") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const origin = req.nextUrl.origin;
  if (!description) return NextResponse.redirect(new URL("/admin/expenditures?error=missing", origin));
  try {
    await prisma.expenditure.update({
      where: { id },
      data: {
        memberId: memberId || null,
        description,
        amountCents,
        date: dateStr ? new Date(dateStr) : undefined,
        notes,
      },
    });
    return NextResponse.redirect(new URL("/admin/expenditures?updated=1", origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/expenditures?error=update", origin));
  }
}
