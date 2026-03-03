import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, isAdminPasswordSet } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;
  const redirectTo = isAdminPasswordSet() ? "/admin/login" : "/";
  const res = NextResponse.redirect(new URL(redirectTo, origin));
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
  return res;
}
