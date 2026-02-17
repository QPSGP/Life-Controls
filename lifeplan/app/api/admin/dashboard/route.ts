import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/admin/dashboard — returns plans, members, subscriptions for admin UI. Requires admin cookie. */
export async function GET(req: NextRequest) {
  const verified = await verifyAdminCookie();
  if (!verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const category = req.nextUrl.searchParams.get("category") ?? undefined;

  let plans: { id: string; name: string; slug: string; amountCents: number; interval: string }[] = [];
  let members: { id: string; email: string; firstName: string | null; lastName: string | null; company: string | null; categories: { category: string }[]; subjectBusinesses: { id: string }[] }[] = [];
  let subscriptions: { id: string; status: string; memberId: string; subscriptionPlanId: string; member: { email: string; firstName: string | null; lastName: string | null }; plan: { name: string } }[] = [];
  let dbError = false;
  let dbErrorDetail: string | null = null;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ plans, members, subscriptions, dbError: false, dbErrorDetail: null });
  }

  try {
    [plans, members, subscriptions] = await Promise.all([
      prisma.subscriptionPlan.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.member.findMany({
        where: category ? { categories: { some: { category } } } : undefined,
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          company: true,
          categories: { select: { category: true } },
          subjectBusinesses: { take: 1, orderBy: { sortOrder: "asc" }, select: { id: true } },
        },
      }),
      prisma.subscription.findMany({
        where: { status: { in: ["active", "trial"] } },
        include: { member: { select: { email: true, firstName: true, lastName: true } }, plan: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);
  } catch (e) {
    dbError = true;
    dbErrorDetail = e instanceof Error ? e.message : String(e);
    console.error("Admin dashboard API error:", e);
  }

  const membersForClient = members.map((m) => {
    const { subjectBusinesses, ...rest } = m;
    return { ...rest, lifePlanSubjectId: subjectBusinesses[0]?.id ?? null };
  });

  return NextResponse.json({ plans, members: membersForClient, subscriptions, dbError, dbErrorDetail });
}
