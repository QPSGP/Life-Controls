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
    let memberLoginReady = true;
    let memberLoginNote: string | undefined;
    try {
      await prisma.member.findFirst({
        select: { id: true, passwordHash: true },
        take: 1,
      });
    } catch (memberErr) {
      memberLoginReady = false;
      memberLoginNote = memberErr instanceof Error ? memberErr.message : String(memberErr);
    }
    return NextResponse.json({
      ok: true,
      planCount,
      authSecretSet: !!process.env.AUTH_SECRET?.trim(),
      memberLoginReady,
      memberLoginNote,
      fix: !memberLoginReady
        ? "Run npm run db:push (or GitHub Actions DB push and seed) to sync schema including members.passwordHash"
        : !process.env.AUTH_SECRET?.trim()
          ? "Set AUTH_SECRET in Vercel environment variables for member portal login"
          : undefined,
    });
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
