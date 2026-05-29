import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  if (!(await verifyAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let body: { firstName?: string | null; lastName?: string | null; role?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const data: {
    firstName?: string | null;
    lastName?: string | null;
    role?: string;
    passwordHash?: string;
  } = {};
  if (body.firstName !== undefined) data.firstName = body.firstName?.trim() || null;
  if (body.lastName !== undefined) data.lastName = body.lastName?.trim() || null;
  if (body.role !== undefined) data.role = body.role === "admin" ? "admin" : "agent";
  if (body.password !== undefined && body.password.trim() !== "") {
    data.passwordHash = await bcrypt.hash(body.password.trim(), 10);
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: { select: { subjectBusinesses: true } },
      },
    });
    return NextResponse.json({ user });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("PATCH /api/admin/users/[id]", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await verifyAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("DELETE /api/admin/users/[id]", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
