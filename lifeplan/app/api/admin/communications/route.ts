import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { trimOrNull } from "@/lib/crm";

export const dynamic = "force-dynamic";

/** POST — admin logs activity on a contact/company (on behalf of the owning member). */
export async function POST(req: NextRequest) {
  if (!(await verifyAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = req.nextUrl.origin;
  const form = await req.formData();
  const type = (form.get("type") as string) || "call";
  const subject = trimOrNull(form.get("subject"));
  const notes = trimOrNull(form.get("notes"));
  const contactId = trimOrNull(form.get("contactId"));
  const companyId = trimOrNull(form.get("companyId"));
  let memberId = trimOrNull(form.get("memberId"));
  const returnTo = trimOrNull(form.get("returnTo")) || "/admin/contacts";

  const fail = (code: string) =>
    NextResponse.redirect(new URL(returnTo + (returnTo.includes("?") ? "&" : "?") + "error=" + code, origin));

  if (!subject) return fail("comm_missing");

  if (contactId) {
    const contact = await prisma.contact.findUnique({ where: { id: contactId } });
    if (!contact) return fail("comm_contact");
    memberId = contact.memberId;
  }
  if (companyId) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return fail("comm_company");
    if (memberId && company.memberId !== memberId) return fail("comm_company");
    memberId = company.memberId;
  }

  if (!memberId) return fail("comm_member");

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
    return NextResponse.redirect(new URL(returnTo + (returnTo.includes("?") ? "&" : "?") + "comm=1", origin));
  } catch (e) {
    console.error(e);
    return fail("comm_create");
  }
}
