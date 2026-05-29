import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { parseCategory, parseVisibility, trimOrNull } from "@/lib/crm";

export const dynamic = "force-dynamic";

/** GET — member's contacts (optional ?category=&visibility=) */
export async function GET(req: NextRequest) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const category = req.nextUrl.searchParams.get("category");
  const visibility = req.nextUrl.searchParams.get("visibility");
  const where: { memberId: string; category?: string; visibility?: string } = { memberId };
  if (category === "business" || category === "personal") where.category = category;
  if (visibility === "private" || visibility === "public") where.visibility = visibility;

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    include: { company: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ contacts });
}

/** POST — create contact (form) */
export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromCookie();
  const origin = req.nextUrl.origin;
  if (!memberId) return NextResponse.redirect(new URL("/login", origin));

  const form = await req.formData();
  const firstName = trimOrNull(form.get("firstName"));
  const lastName = trimOrNull(form.get("lastName"));
  const displayName = trimOrNull(form.get("displayName"));
  const email = trimOrNull(form.get("email"));

  if (!firstName && !lastName && !displayName && !email) {
    return NextResponse.redirect(new URL("/portal/contacts/new?error=missing", origin));
  }

  const companyId = trimOrNull(form.get("companyId"));
  if (companyId) {
    const company = await prisma.company.findFirst({ where: { id: companyId, memberId } });
    if (!company) return NextResponse.redirect(new URL("/portal/contacts/new?error=company", origin));
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        memberId,
        visibility: parseVisibility(form.get("visibility")),
        category: parseCategory(form.get("category")),
        firstName,
        lastName,
        displayName,
        email,
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
        source: trimOrNull(form.get("source")) || "Manual",
      },
    });
    return NextResponse.redirect(new URL(`/portal/contacts/${contact.id}?created=1`, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/portal/contacts/new?error=create", origin));
  }
}
