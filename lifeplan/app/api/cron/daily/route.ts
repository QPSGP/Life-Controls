import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/auth";
import { runDailyMaintenance } from "@/lib/daily-maintenance";

export const dynamic = "force-dynamic";

function authorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

/** Vercel Cron — rolls R movements forward and marks overdue invoices. */
export async function GET(req: NextRequest) {
  if (!authorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runDailyMaintenance();
  return NextResponse.json(result);
}

/** Admin button on Reports. */
export async function POST(req: NextRequest) {
  if (!(await verifyAdminCookie())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const origin = req.nextUrl.origin;
  try {
    const result = await runDailyMaintenance();
    const q = new URLSearchParams({
      rolled: String(result.rolled),
      reopened: String(result.reopened),
      pastDue: String(result.pastDue),
    });
    return NextResponse.redirect(new URL(`/admin/reports?${q.toString()}`, origin));
  } catch (e) {
    console.error(e);
    return NextResponse.redirect(new URL("/admin/reports?error=maintenance", origin));
  }
}
