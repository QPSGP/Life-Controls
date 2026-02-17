import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      ok: false,
      error: "DATABASE_URL is not set. Add it in Vercel → Settings → Environment Variables.",
    });
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    const planCount = await prisma.subscriptionPlan.count();
    return NextResponse.json({ ok: true, planCount });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const needsPush = /relation|does not exist|table .* does not exist/i.test(message);
    return NextResponse.json({
      ok: false,
      error: message,
      fix: needsPush
        ? "Run the GitHub Action 'DB push and seed' (see docs/RUN_DB_PUSH_AND_SEED.md) or run: npx prisma db push"
        : "Check DATABASE_URL and network access.",
    });
  }
}
