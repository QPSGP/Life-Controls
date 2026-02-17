import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const subjectBusinessId = formData.get("subjectBusinessId") as string;
  const name = (formData.get("name") as string)?.trim();
  const verb = (formData.get("verb") as string)?.trim() || null;
  const noun = (formData.get("noun") as string)?.trim() || null;
  const object = (formData.get("object") as string)?.trim() || null;
  const objective = (formData.get("objective") as string)?.trim() || null;
  const origin = new URL(req.url).origin;
  if (!subjectBusinessId || !name) {
    return NextResponse.redirect(new URL("/admin/life-plan?error=missing", origin));
  }
  try {
    await prisma.areaOfPurpose.create({
      data: { subjectBusinessId, name, verb, noun, object, objective },
    });
    return NextResponse.redirect(new URL("/admin/life-plan/subject/" + subjectBusinessId, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/life-plan/subject/" + subjectBusinessId + "?error=create", origin));
  }
}
