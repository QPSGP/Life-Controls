import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** PATCH — Move category up or down (admin only). Swaps sortOrder with neighbour. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const verified = await verifyAdminCookie();
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const direction = body.direction === "up" ? "up" : body.direction === "down" ? "down" : null;
  if (!direction) {
    return NextResponse.json({ error: "direction must be 'up' or 'down'" }, { status: 400 });
  }
  try {
    const current = await prisma.minidayCategory.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    const neighbour = await prisma.minidayCategory.findFirst({
      where: {
        sortOrder: direction === "up" ? current.sortOrder - 1 : current.sortOrder + 1,
      },
    });
    if (!neighbour) {
      return NextResponse.json({ updated: current }); // already at edge
    }
    await prisma.$transaction([
      prisma.minidayCategory.update({
        where: { id },
        data: { sortOrder: neighbour.sortOrder },
      }),
      prisma.minidayCategory.update({
        where: { id: neighbour.id },
        data: { sortOrder: current.sortOrder },
      }),
    ]);
    const updated = await prisma.minidayCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    throw e;
  }
}
