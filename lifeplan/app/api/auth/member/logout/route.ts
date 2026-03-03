import { NextRequest, NextResponse } from "next/server";
import { MEMBER_COOKIE_NAME } from "@/lib/member-auth";

function doLogout(origin: string) {
  const res = NextResponse.redirect(new URL("/login", origin));
  res.cookies.set(MEMBER_COOKIE_NAME, "", {
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
