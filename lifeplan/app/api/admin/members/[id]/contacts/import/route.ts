import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseCategory, parseVisibility } from "@/lib/crm";
import { parseCsvContacts } from "@/lib/crm-csv-contacts";
import { importContactsForMember } from "@/lib/crm-import";
import { parseVCardFile } from "@/lib/crm-vcard";

export const dynamic = "force-dynamic";

/** POST — import contacts for a member (admin). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: memberId } = await params;
  const origin = req.nextUrl.origin;

  const member = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true } });
  if (!member) {
    return NextResponse.redirect(`${origin}/admin?error=member_notfound`);
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.redirect(`${origin}/admin/members/${memberId}/contacts/import?error=file`);
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.redirect(`${origin}/admin/members/${memberId}/contacts/import?error=size`);
    }

    const text = await file.text();
    const name = file.name.toLowerCase();
    const category = parseCategory(form.get("category"));
    const visibility = parseVisibility(form.get("visibility"));

    let rows;
    let source: string;
    if (name.endsWith(".vcf") || text.includes("BEGIN:VCARD")) {
      rows = parseVCardFile(text);
      source = "Admin import vCard";
    } else {
      rows = parseCsvContacts(text);
      source = "Admin import CSV";
    }

    if (rows.length === 0) {
      return NextResponse.redirect(`${origin}/admin/members/${memberId}/contacts/import?error=empty`);
    }

    const result = await importContactsForMember(memberId, rows, { category, visibility, source });
    const q = new URLSearchParams({
      contacts_imported: String(result.created),
      contacts_updated: String(result.updated),
      contacts_skipped: String(result.skipped),
      memberId,
    });
    return NextResponse.redirect(`${origin}/admin?${q.toString()}`);
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(`${origin}/admin/members/${memberId}/contacts/import?error=import`);
  }
}
