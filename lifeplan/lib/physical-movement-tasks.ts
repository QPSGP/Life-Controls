import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function createPhysicalMovementTask(req: NextRequest) {
  const origin = req.nextUrl.origin;
  try {
    const formData = await req.formData();
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    if (!title) return NextResponse.redirect(origin + "/admin/physical-movements?error=missing");
    await prisma.chore.create({ data: { title, description } });
    return NextResponse.redirect(origin + "/admin/physical-movements");
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(origin + "/admin/physical-movements?error=create");
  }
}

export async function updatePhysicalMovementTask(req: NextRequest, id: string) {
  const origin = req.nextUrl.origin;
  if (!id) return NextResponse.redirect(new URL("/admin/physical-movements", origin));
  const formData = await req.formData();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  if (!title) return NextResponse.redirect(new URL("/admin/physical-movements?error=missing", origin));
  try {
    await prisma.chore.update({ where: { id }, data: { title, description } });
    return NextResponse.redirect(new URL("/admin/physical-movements?updated=1", origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/physical-movements?error=update", origin));
  }
}

export async function togglePhysicalMovementTaskDone(req: NextRequest, id: string) {
  const origin = req.nextUrl.origin;
  try {
    const formData = await req.formData();
    const done = formData.get("done") === "true";
    await prisma.chore.update({
      where: { id },
      data: { done, doneAt: done ? new Date() : null },
    });
    return NextResponse.redirect(origin + "/admin/physical-movements");
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(origin + "/admin/physical-movements");
  }
}
