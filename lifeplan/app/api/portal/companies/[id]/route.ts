import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { parseCategory, parseVisibility, trimOrNull } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromCookie();
  const origin = req.nextUrl.origin;
  if (!memberId) return NextResponse.redirect(new URL("/login", origin));

  const { id } = await params;
  const existing = await prisma.company.findFirst({ where: { id, memberId } });
  if (!existing) return NextResponse.redirect(new URL("/portal/companies?error=notfound", origin));

  const form = await req.formData();
  const name = trimOrNull(form.get("name"));
  if (!name) return NextResponse.redirect(new URL(`/portal/companies/${id}/edit?error=missing`, origin));

  try {
    await prisma.company.update({
      where: { id },
      data: {
        visibility: parseVisibility(form.get("visibility")),
        category: parseCategory(form.get("category")),
        name,
        website: trimOrNull(form.get("website")),
        phone: trimOrNull(form.get("phone")),
        street: trimOrNull(form.get("street")),
        city: trimOrNull(form.get("city")),
        state: trimOrNull(form.get("state")),
        zip: trimOrNull(form.get("zip")),
        country: trimOrNull(form.get("country")),
        industry: trimOrNull(form.get("industry")),
        size: trimOrNull(form.get("size")),
        notes: trimOrNull(form.get("notes")),
        keyPeople: trimOrNull(form.get("keyPeople")),
        tags: trimOrNull(form.get("tags")),
        source: trimOrNull(form.get("source")),
      },
    });
    return NextResponse.redirect(new URL(`/portal/companies/${id}?updated=1`, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL(`/portal/companies/${id}/edit?error=update`, origin));
  }
}
