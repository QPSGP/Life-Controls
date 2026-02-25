import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** PATCH /api/life-plan/miniday-categories/[id] — update (admin only). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const verified = await verifyAdminCookie();
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const data: { name?: string; sortOrder?: number; active?: boolean } = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;
  if (typeof body.active === "boolean") data.active = body.active;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  try {
    const updated = await prisma.minidayCategory.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e) {
      if ((e as { code: string }).code === "P2025") {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      if ((e as { code: string }).code === "P2002") {
        return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
      }
    }
    throw e;
  }
}

/** DELETE /api/life-plan/miniday-categories/[id] — admin only. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const verified = await verifyAdminCookie();
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    await prisma.minidayCategory.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    throw e;
  }
}
