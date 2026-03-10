import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/universa/persons — list all persons (admin) */
export async function GET(req: NextRequest) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const persons = await prisma.universaPerson.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: { aliases: true },
    });
    return NextResponse.json({ persons });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

/** POST /api/universa/persons — create person (formData: personalId, lastName, firstName, middle) */
export async function POST(req: NextRequest) {
  const verified = await verifyAdminCookie();
  if (!verified) return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  const formData = await req.formData();
  const get = (k: string) => (formData.get(k) as string)?.trim() || null;
  const personalId = get("personalId");
  const lastName = get("lastName");
  const firstName = get("firstName");
  const middle = get("middle");
  try {
    const person = await prisma.universaPerson.create({
      data: { personalId: personalId || null, lastName: lastName || null, firstName: firstName || null, middle: middle || null },
    });
    return NextResponse.redirect(new URL("/admin/people/" + person.id + "/edit", req.nextUrl.origin));
  } catch (e: unknown) {
    const isUnique = e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002";
    return NextResponse.redirect(new URL("/admin/people?error=" + (isUnique ? "duplicate" : "create"), req.nextUrl.origin));
  }
}
