import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return NextResponse.redirect(new URL("/admin/life-plan", req.nextUrl.origin));
  const formData = await req.formData();
  const name = (formData.get("name") as string)?.trim();
  const verb = (formData.get("verb") as string)?.trim() || null;
  const noun = (formData.get("noun") as string)?.trim() || null;
  const object = (formData.get("object") as string)?.trim() || null;
  const objective = (formData.get("objective") as string)?.trim() || null;
  const origin = req.nextUrl.origin;
  if (!name) {
    const purpose = await prisma.areaOfPurpose.findUnique({ where: { id }, select: { subjectBusinessId: true } });
    const back = purpose ? "/admin/life-plan/subject/" + purpose.subjectBusinessId : "/admin/life-plan";
    return NextResponse.redirect(new URL(back + "?error=missing", origin));
  }
  try {
    const updated = await prisma.areaOfPurpose.update({
      where: { id },
      data: { name, verb, noun, object, objective },
      select: { subjectBusinessId: true },
    });
    return NextResponse.redirect(new URL("/admin/life-plan/purpose/" + id, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/life-plan/purpose/" + id + "?error=update", origin));
  }
}
