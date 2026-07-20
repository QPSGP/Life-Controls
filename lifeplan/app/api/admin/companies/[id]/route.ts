import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseCategory, parseVisibility, trimOrNull } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const origin = req.nextUrl.origin;
  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) return NextResponse.redirect(`${origin}/admin/companies?error=notfound`);

  const form = await req.formData();
  const name = trimOrNull(form.get("name"));
  if (!name) return NextResponse.redirect(`${origin}/admin/companies/${id}/edit?error=missing`);

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
    return NextResponse.redirect(`${origin}/admin/companies/${id}?updated=1`);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(`${origin}/admin/companies/${id}/edit?error=update`);
  }
}
