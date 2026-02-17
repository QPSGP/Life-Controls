import { NextResponse } from "next/server";
import { getAdminSessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/auth/admin/status — returns whether admin auth can work (no secrets revealed). */
export async function GET() {
  const passwordSet = !!process.env.ADMIN_PASSWORD;
  const secretSet = !!getAdminSessionToken();
  return NextResponse.json({ passwordSet, secretSet, ok: passwordSet && secretSet });
}
