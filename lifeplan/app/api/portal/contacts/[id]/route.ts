import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { contactFormToPrismaData, parseContactForm } from "@/lib/crm-contact-form";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/** POST — update contact (form) */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromCookie();
  const origin = req.nextUrl.origin;
  if (!memberId) return NextResponse.redirect(new URL("/login", origin));

  const { id } = await params;
  const existing = await prisma.contact.findFirst({ where: { id, memberId } });
  if (!existing) return NextResponse.redirect(new URL("/portal/contacts?error=notfound", origin));

  const form = await req.formData();
  const parsed = parseContactForm(form);
  const companyId = parsed.companyId;
  if (companyId) {
    const company = await prisma.company.findFirst({ where: { id: companyId, memberId } });
    if (!company) return NextResponse.redirect(new URL(`/portal/contacts/${id}/edit?error=company`, origin));
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
    return NextResponse.redirect(new URL(`/portal/contacts/${id}?updated=1`, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL(`/portal/contacts/${id}/edit?error=update`, origin));
  }
}
