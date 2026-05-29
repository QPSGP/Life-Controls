import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { parseCategory, parseVisibility, trimOrNull } from "@/lib/crm";

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
  const companyId = trimOrNull(form.get("companyId"));
  if (companyId) {
    const company = await prisma.company.findFirst({ where: { id: companyId, memberId } });
    if (!company) return NextResponse.redirect(new URL(`/portal/contacts/${id}/edit?error=company`, origin));
  }

  try {
    await prisma.contact.update({
      where: { id },
      data: {
        visibility: parseVisibility(form.get("visibility")),
        category: parseCategory(form.get("category")),
        firstName: trimOrNull(form.get("firstName")),
        lastName: trimOrNull(form.get("lastName")),
        displayName: trimOrNull(form.get("displayName")),
        email: trimOrNull(form.get("email")),
        emailSecondary: trimOrNull(form.get("emailSecondary")),
        phone: trimOrNull(form.get("phone")),
        mobile: trimOrNull(form.get("mobile")),
        fax: trimOrNull(form.get("fax")),
        jobTitle: trimOrNull(form.get("jobTitle")),
        companyName: trimOrNull(form.get("companyName")),
        companyId: companyId || null,
        street: trimOrNull(form.get("street")),
        city: trimOrNull(form.get("city")),
        state: trimOrNull(form.get("state")),
        zip: trimOrNull(form.get("zip")),
        country: trimOrNull(form.get("country")),
        notes: trimOrNull(form.get("notes")),
        howToEngage: trimOrNull(form.get("howToEngage")),
        keyFacts: trimOrNull(form.get("keyFacts")),
        tags: trimOrNull(form.get("tags")),
        source: trimOrNull(form.get("source")),
      },
    });
    return NextResponse.redirect(new URL(`/portal/contacts/${id}?updated=1`, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL(`/portal/contacts/${id}/edit?error=update`, origin));
  }
}
