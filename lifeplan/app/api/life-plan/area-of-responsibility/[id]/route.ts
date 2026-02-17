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
  if (!name) return NextResponse.redirect(new URL("/admin/life-plan/responsibility/" + id + "?error=missing", origin));
  try {
    await prisma.areaOfResponsibility.update({
      where: { id },
      data: { name, verb, noun, object, objective },
    });
    return NextResponse.redirect(new URL("/admin/life-plan/responsibility/" + id, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/life-plan/responsibility/" + id + "?error=update", origin));
  }
}
