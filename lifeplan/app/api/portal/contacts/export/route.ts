import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { contactsToCsv } from "@/lib/crm-csv-contacts";
import { contactToVCard, contactsToVCardFile } from "@/lib/crm-vcard";

export const dynamic = "force-dynamic";

/** GET — export member contacts (?format=csv|vcf, optional &id= single contact) */
export async function GET(req: NextRequest) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const format = req.nextUrl.searchParams.get("format") ?? "vcf";
  const contactId = req.nextUrl.searchParams.get("id");

  const contacts = await prisma.contact.findMany({
    where: contactId ? { memberId, id: contactId } : { memberId },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  if (contacts.length === 0) {
    return NextResponse.json({ error: "No contacts to export" }, { status: 404 });
  }

  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const body = contactsToCsv(contacts);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="contacts-${stamp}.csv"`,
      },
    });
  }

  const body = contacts.length === 1 ? contactToVCard(contacts[0]) : contactsToVCardFile(contacts);
  const filename = contacts.length === 1 ? `contact-${stamp}.vcf` : `contacts-${stamp}.vcf`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
