import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";
import { trimOrNull } from "@/lib/crm";

export const dynamic = "force-dynamic";

/** POST — member logs call / email / mailout, optionally linked to contact and/or company */
export async function POST(req: NextRequest) {
  const memberId = await getMemberIdFromCookie();
  const origin = req.nextUrl.origin;
  if (!memberId) return NextResponse.redirect(new URL("/login", origin));

  const form = await req.formData();
  const type = (form.get("type") as string) || "call";
  const subject = trimOrNull(form.get("subject"));
  const notes = trimOrNull(form.get("notes"));
  const contactId = trimOrNull(form.get("contactId"));
  const companyId = trimOrNull(form.get("companyId"));
  const returnTo = trimOrNull(form.get("returnTo")) || "/portal";

  if (!subject) {
    return NextResponse.redirect(new URL(returnTo + (returnTo.includes("?") ? "&" : "?") + "error=comm_missing", origin));
  }

  if (contactId) {
    const contact = await prisma.contact.findFirst({ where: { id: contactId, memberId } });
    if (!contact) return NextResponse.redirect(new URL(returnTo + (returnTo.includes("?") ? "&" : "?") + "error=comm_contact", origin));
  }
  if (companyId) {
    const company = await prisma.company.findFirst({ where: { id: companyId, memberId } });
    if (!company) return NextResponse.redirect(new URL(returnTo + (returnTo.includes("?") ? "&" : "?") + "error=comm_company", origin));
  }

  try {
    await prisma.communication.create({
      data: {
        memberId,
        type: ["call", "mailout", "email"].includes(type) ? type : "call",
        subject,
        notes,
        contactId,
        companyId,
      },
    });
    const sep = returnTo.includes("?") ? "&" : "?";
    return NextResponse.redirect(new URL(returnTo + sep + "comm=1", origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL(returnTo + (returnTo.includes("?") ? "&" : "?") + "error=comm_create", origin));
  }
}
