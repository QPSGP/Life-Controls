import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { contactsToCsv } from "@/lib/crm-csv-contacts";
import { contactToVCard, contactsToVCardFile } from "@/lib/crm-vcard";

export const dynamic = "force-dynamic";

/** GET — export a member's contacts (admin). ?format=csv|vcf */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: memberId } = await params;
  const member = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true, email: true } });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const format = req.nextUrl.searchParams.get("format") ?? "vcf";
  const contacts = await prisma.contact.findMany({
    where: { memberId },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  if (contacts.length === 0) {
    return NextResponse.json({ error: "No contacts to export" }, { status: 404 });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const slug = member.email.replace(/[^a-z0-9]+/gi, "-").slice(0, 40);

  if (format === "csv") {
    const body = contactsToCsv(contacts);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="contacts-${slug}-${stamp}.csv"`,
      },
    });
  }

  const body = contactsToVCardFile(contacts);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="contacts-${slug}-${stamp}.vcf"`,
    },
  });
}
