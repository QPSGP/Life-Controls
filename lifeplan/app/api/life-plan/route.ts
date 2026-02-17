import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") ?? undefined;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      error: "Database not configured. Set DATABASE_URL in your environment (e.g. Vercel).",
    });
  }

  try {
    const [users, subjectBusinesses, membersWithPlans] = await Promise.all([
      prisma.user.findMany({
        orderBy: { email: "asc" },
        select: { id: true, email: true, firstName: true, lastName: true },
      }),
      userId
        ? prisma.subjectBusiness.findMany({
            where: { userId },
            orderBy: { sortOrder: "asc" },
            select: { id: true, name: true, verb: true, noun: true, object: true, objective: true },
          })
        : Promise.resolve([]),
      prisma.subjectBusiness.findMany({
        where: { memberId: { not: null } },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          memberId: true,
          member: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
    ]);

    const membersWithPlanList = membersWithPlans
      .filter((s): s is typeof s & { memberId: string; member: NonNullable<typeof s.member> } => s.memberId != null && s.member != null)
      .map((s) => ({
        subjectId: s.id,
        subjectName: s.name,
        memberId: s.memberId,
        memberName: [s.member.firstName, s.member.lastName].filter(Boolean).join(" ").trim() || s.member.email,
        memberEmail: s.member.email,
      }));

    return NextResponse.json({ users, subjectBusinesses, membersWithPlans: membersWithPlanList });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Life Plan API error:", e);
    return NextResponse.json(
      { error: message, users: [], subjectBusinesses: [], membersWithPlans: [] },
      { status: 200 }
    );
  }
}
