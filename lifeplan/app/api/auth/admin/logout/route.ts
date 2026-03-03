import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, isAdminPasswordSet } from "@/lib/auth";

function doLogout(origin: string) {
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

export async function GET(req: NextRequest) {
  return doLogout(new URL(req.url).origin);
}

export async function POST(req: NextRequest) {
  return doLogout(new URL(req.url).origin);
}
