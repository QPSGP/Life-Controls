import { NextRequest, NextResponse } from "next/server";
import { MEMBER_COOKIE_NAME } from "@/lib/member-auth";
import { COOKIE_NAME } from "@/lib/auth";

/**
 * Nuclear option: clears both member and admin session cookies.
 * Use when normal logout isn't working (e.g. "Sign out" or "Clear session").
 * GET /api/auth/clear-session — redirects to / after clearing.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const res = NextResponse.redirect(new URL("/", url.origin));
  const clearOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  };
  res.cookies.set(MEMBER_COOKIE_NAME, "", clearOpts);
  res.cookies.set(COOKIE_NAME, "", clearOpts);
  return res;
}
