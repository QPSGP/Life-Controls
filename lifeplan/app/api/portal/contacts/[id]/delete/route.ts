import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromCookie();
  const origin = req.nextUrl.origin;
  if (!memberId) return NextResponse.redirect(new URL("/login", origin));

  const { id } = await params;
  const existing = await prisma.contact.findFirst({ where: { id, memberId } });
  if (!existing) return NextResponse.redirect(new URL("/portal/contacts?error=notfound", origin));

  try {
    await prisma.contact.delete({ where: { id } });
    return NextResponse.redirect(new URL("/portal/contacts?deleted=1", origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL(`/portal/contacts/${id}?error=delete`, origin));
  }
}
