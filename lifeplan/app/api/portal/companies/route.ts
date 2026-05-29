import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { parseCategory, parseVisibility, trimOrNull } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const category = req.nextUrl.searchParams.get("category");
  const visibility = req.nextUrl.searchParams.get("visibility");
  const where: { memberId: string; category?: string; visibility?: string } = { memberId };
  if (category === "business" || category === "personal") where.category = category;
  if (visibility === "private" || visibility === "public") where.visibility = visibility;

  const companies = await prisma.company.findMany({
    where,
    orderBy: { name: "asc" },
    include: { _count: { select: { contacts: true } } },
  });
  return NextResponse.json({ companies });
}

export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromCookie();
  const origin = req.nextUrl.origin;
  if (!memberId) return NextResponse.redirect(new URL("/login", origin));

  const form = await req.formData();
  const name = trimOrNull(form.get("name"));
  if (!name) return NextResponse.redirect(new URL("/portal/companies/new?error=missing", origin));

  try {
    const company = await prisma.company.create({
      data: {
        memberId,
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
        source: trimOrNull(form.get("source")) || "Manual",
      },
    });
    return NextResponse.redirect(new URL(`/portal/companies/${company.id}?created=1`, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/portal/companies/new?error=create", origin));
  }
}
