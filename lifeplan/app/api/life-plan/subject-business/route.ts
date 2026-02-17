import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const origin = new URL(req.url).origin;
  try {
    const formData = await req.formData();
    const userId = formData.get("userId") as string;
    const name = (formData.get("name") as string)?.trim();
    const verb = (formData.get("verb") as string)?.trim() || null;
    const noun = (formData.get("noun") as string)?.trim() || null;
    const object = (formData.get("object") as string)?.trim() || null;
    const objective = (formData.get("objective") as string)?.trim() || null;
    if (!userId || !name) {
      return NextResponse.redirect(new URL("/admin/life-plan?error=missing", origin));
    }
    await prisma.subjectBusiness.create({
      data: { userId, name, verb, noun, object, objective },
    });
    return NextResponse.redirect(new URL("/admin/life-plan?userId=" + userId, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/life-plan?error=create", origin));
  }
}
