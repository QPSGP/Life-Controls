import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST /api/universa/persons/[id] — update person */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  const { id } = await params;
  const formData = await req.formData();
  const get = (k: string) => (formData.get(k) as string)?.trim() || null;
  try {
    await prisma.universaPerson.update({
      where: { id },
      data: {
        personalId: get("personalId") || null,
        lastName: get("lastName") || null,
        firstName: get("firstName") || null,
        middle: get("middle") || null,
      },
    });
    return NextResponse.redirect(new URL("/admin/people/" + id + "/edit", req.nextUrl.origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/people/" + id + "/edit?error=update", req.nextUrl.origin));
  }
}

