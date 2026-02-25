import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MOVEMENT_TYPES } from "@/lib/movement-types";

export const dynamic = "force-dynamic";

/** GET /api/life-plan/miniday-categories — list all (for dropdowns and section order). */
export async function GET() {
  try {
    if ("minidayCategory" in prisma && typeof (prisma as { minidayCategory?: { findMany: (opts: unknown) => Promise<unknown[]> } }).minidayCategory?.findMany === "function") {
      const categories = await (prisma as { minidayCategory: { findMany: (opts: unknown) => Promise<{ id: string; name: string; sortOrder: number; active: boolean }[]> } }).minidayCategory.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
      return NextResponse.json(categories);
    }
  } catch {
    // Prisma client may not include MinidayCategory yet (run npx prisma generate)
  }
  return NextResponse.json(MOVEMENT_TYPES.map((name, i) => ({ id: name, name, sortOrder: i, active: true })));
}

/** POST /api/life-plan/miniday-categories — create (admin only). */
export async function POST(req: NextRequest) {
  const verified = await verifyAdminCookie();
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const name = (body.name as string)?.trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const sortOrder = typeof body.sortOrder === "number" ? body.sortOrder : 0;
  try {
    const created = await prisma.minidayCategory.create({
      data: { name, sortOrder, active: body.active !== false },
    });
    return NextResponse.json(created);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "A category with this name already exists" }, { status: 409 });
    }
    throw e;
  }
}
