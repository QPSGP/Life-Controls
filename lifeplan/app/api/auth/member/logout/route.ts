import { NextRequest, NextResponse } from "next/server";
import { clearMemberCookie } from "@/lib/member-auth";

export async function POST(req: NextRequest) {
  await clearMemberCookie();
  const url = new URL(req.url);
  return NextResponse.redirect(new URL("/login", url.origin));
}
