import { NextRequest, NextResponse } from "next/server";
import { MEMBER_COOKIE_NAME } from "@/lib/member-auth";

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const res = NextResponse.redirect(new URL("/login", url.origin));
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
