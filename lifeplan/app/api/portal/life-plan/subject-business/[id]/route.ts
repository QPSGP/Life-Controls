import { NextRequest, NextResponse } from "next/server";
import { getMemberIdFromCookie } from "@/lib/member-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const memberId = await getMemberIdFromCookie();
  if (!memberId) return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  const { id } = await params;
  const subject = await prisma.subjectBusiness.findFirst({
    where: { id, memberId },
    select: { id: true },
  });
  if (!subject) return NextResponse.redirect(new URL("/portal/plan", req.nextUrl.origin));

  const formData = await req.formData();
  const name = (formData.get("name") as string)?.trim();
  const verb = (formData.get("verb") as string)?.trim() || null;
  const noun = (formData.get("noun") as string)?.trim() || null;
  const object = (formData.get("object") as string)?.trim() || null;
  const objective = (formData.get("objective") as string)?.trim() || null;
  if (!name) return NextResponse.redirect(new URL("/portal/plan/subject/" + id + "?error=missing", req.nextUrl.origin));
  try {
    await prisma.subjectBusiness.update({
      where: { id },
      data: { name, verb, noun, object, objective },
    });
    return NextResponse.redirect(new URL("/portal/plan/subject/" + id, req.nextUrl.origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/portal/plan/subject/" + id + "?error=update", req.nextUrl.origin));
  }
}
