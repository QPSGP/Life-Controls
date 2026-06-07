import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { contactFormToPrismaData, hasContactIdentity, parseContactForm } from "@/lib/crm-contact-form";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

/** POST — create contact (form) */
export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromCookie();
  const origin = req.nextUrl.origin;
  if (!memberId) return NextResponse.redirect(new URL("/login", origin));

  const form = await req.formData();
  const parsed = parseContactForm(form, { defaultSource: "Manual" });

  if (!hasContactIdentity(parsed)) {
    return NextResponse.redirect(new URL("/portal/contacts/new?error=missing", origin));
  }

  const companyId = parsed.companyId;
  if (companyId) {
    const company = await prisma.company.findFirst({ where: { id: companyId, memberId } });
    if (!company) return NextResponse.redirect(new URL("/portal/contacts/new?error=company", origin));
  }

  try {
    const base = contactFormToPrismaData(parsed);
    const contact = await prisma.contact.create({
      data: {
        ...base,
        member: { connect: { id: memberId } },
        ...(companyId ? { company: { connect: { id: companyId } } } : {}),
      },
    });
    return NextResponse.redirect(new URL(`/portal/contacts/${contact.id}?created=1`, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/portal/contacts/new?error=create", origin));
  }
}
