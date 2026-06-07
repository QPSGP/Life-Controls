import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { parseCategory, parseVisibility } from "@/lib/crm";
import { parseCsvContacts } from "@/lib/crm-csv-contacts";
import { importContactsForMember } from "@/lib/crm-import";
import { parseVCardFile } from "@/lib/crm-vcard";

export const dynamic = "force-dynamic";

/** POST — import contacts from CSV or vCard upload */
export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromCookie();
  const origin = req.nextUrl.origin;
  if (!memberId) return NextResponse.redirect(new URL("/login", origin));

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.redirect(new URL("/portal/contacts/import?error=file", origin));
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.redirect(new URL("/portal/contacts/import?error=size", origin));
    }

    const text = await file.text();
    const name = file.name.toLowerCase();
    const category = parseCategory(form.get("category"));
    const visibility = parseVisibility(form.get("visibility"));

    let rows;
    let source: string;
    if (name.endsWith(".vcf") || text.includes("BEGIN:VCARD")) {
      rows = parseVCardFile(text);
      source = "Import vCard";
    } else {
      rows = parseCsvContacts(text);
      source = "Import CSV";
    }

    if (rows.length === 0) {
      return NextResponse.redirect(new URL("/portal/contacts/import?error=empty", origin));
    }

    const result = await importContactsForMember(memberId, rows, { category, visibility, source });
    const q = new URLSearchParams({
      imported: String(result.created),
      updated: String(result.updated),
      skipped: String(result.skipped),
    });
    return NextResponse.redirect(new URL(`/portal/contacts?${q.toString()}`, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/portal/contacts/import?error=import", origin));
  }
}
