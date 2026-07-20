import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { contactFormToPrismaData, parseContactForm } from "@/lib/crm-contact-form";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/** POST — admin update contact */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const origin = req.nextUrl.origin;
  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) return NextResponse.redirect(`${origin}/admin/contacts?error=notfound`);

  const form = await req.formData();
  const parsed = parseContactForm(form);
  const companyId = parsed.companyId;
  if (companyId) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, memberId: existing.memberId },
    });
    if (!company) return NextResponse.redirect(`${origin}/admin/contacts/${id}/edit?error=company`);
  }

  try {
    const base = contactFormToPrismaData(parsed);
    const channelsValue: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue =
      parsed.channels.length > 0 ? (parsed.channels as Prisma.InputJsonValue) : Prisma.DbNull;

    await prisma.contact.update({
      where: { id },
      data: {
        ...base,
        channels: channelsValue,
        company: companyId ? { connect: { id: companyId } } : { disconnect: true },
      },
    });
    return NextResponse.redirect(`${origin}/admin/contacts/${id}?updated=1`);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(`${origin}/admin/contacts/${id}/edit?error=update`);
  }
}
