import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  const { id } = await params;
  const formData = await req.formData();
  const firstName = (formData.get("firstName") as string)?.trim() || null;
  const lastName = (formData.get("lastName") as string)?.trim() || null;
  const company = (formData.get("company") as string)?.trim() || null;
  const title = (formData.get("title") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const street = (formData.get("street") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const state = (formData.get("state") as string)?.trim() || null;
  const zip = (formData.get("zip") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim();
  if (!email) return NextResponse.redirect(new URL("/admin/members/" + id + "/edit?error=missing", req.nextUrl.origin));
  try {
    await prisma.member.update({
      where: { id },
      data: { email, firstName, lastName, company, title, phone, street, city, state, zip, country, notes },
    });
    return NextResponse.redirect(new URL("/admin?updated=1", req.nextUrl.origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/members/" + id + "/edit?error=update", req.nextUrl.origin));
  }
}
