import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionToken, setAdminCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = formData.get("password") as string | null;
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password !== expected) {
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url));
  }
  if (!getAdminSessionToken()) {
    return NextResponse.redirect(new URL("/admin/login?error=config", req.url));
  }
  await setAdminCookie();
  return NextResponse.redirect(new URL("/admin", req.url));
}
